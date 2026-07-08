import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "./redis.js";
import { rateLimitKeyGenerator } from "../utils/ip.utils.js";

const memoryStore = new Map();
let redisDown = false;

const makeStore = (prefix) => {
  const redisStore = new RedisStore({
    sendCommand: (command, ...args) => redis.call(command, ...args),
    prefix,
  });

  const onRedisError = (err) => {
    if (!redisDown) {
      redisDown = true;
      console.warn(`[rateLimiter] Redis error, falling back to in-memory store: ${err.message}`);
    }
  };
  const onRedisRecover = () => {
    if (redisDown) {
      redisDown = false;
      console.info("[rateLimiter] Redis recovered, switching back to Redis store");
    }
  };

  redis.on("error", onRedisError);
  redis.on("ready", onRedisRecover);

  return {
    async increment(key) {
      try {
        return await redisStore.increment(key);
      } catch (err) {
        onRedisError(err);
        const fullKey = `${prefix}:${key}`;
        const now = Date.now();
        const entry = memoryStore.get(fullKey) || { count: 0, resetTime: now + 15 * 60 * 1000 };
        if (now > entry.resetTime) {
          entry.count = 0;
          entry.resetTime = now + 15 * 60 * 1000;
        }
        entry.count += 1;
        memoryStore.set(fullKey, entry);
        return { totalHits: entry.count, resetTime: entry.resetTime };
      }
    },
    async decrement(key) {
      try {
        return await redisStore.decrement(key);
      } catch (err) {
        const fullKey = `${prefix}:${key}`;
        const entry = memoryStore.get(fullKey);
        if (entry && entry.count > 0) entry.count -= 1;
      }
    },
    async resetKey(key) {
      try {
        return await redisStore.resetKey(key);
      } catch {
        memoryStore.delete(`${prefix}:${key}`);
      }
    },
  };
};
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  store: makeStore("rl:auth"),
  keyGenerator: rateLimitKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes",
  },
});

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  store: makeStore("rl:otp"),
  keyGenerator: rateLimitKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP attempts. Please request a new OTP after 10 minutes",
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  store: makeStore("rl:api"),
  keyGenerator: rateLimitKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please slow down",
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  store: makeStore("rl:upload"),
  keyGenerator: rateLimitKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Upload limit reached. Try again in an hour.",
  },
});
