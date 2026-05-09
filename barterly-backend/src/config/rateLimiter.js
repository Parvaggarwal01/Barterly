import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "./redis.js";

const makeStore = (prefix) =>
  new RedisStore({
    sendCommand: (command, ...args) => redis.call(command, ...args),
    prefix,
  });
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  store: makeStore("rl:auth"),
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
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Upload limit reached. Try again in an hour.",
  },
});
