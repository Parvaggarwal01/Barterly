import Redis from "ioredis";

const rawRedisUrl = process.env.REDIS_URL;
const redisUrl = rawRedisUrl?.replace(/^ediss:\/\//i, "rediss://");

const redisClient = redisUrl
  ? new Redis(redisUrl, {
      // Keep retrying through transient network blips on managed Redis providers.
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      connectTimeout: 10000,
      keepAlive: 30000,
      retryStrategy(times) {
        return Math.min(times * 200, 5000);
      },
    })
  : new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      connectTimeout: 10000,
      keepAlive: 30000,
      retryStrategy(times) {
        return Math.min(times * 200, 5000);
      },
    });

redisClient.on("connect", () => console.log("Redis Connected"));
redisClient.on("reconnecting", () => console.warn("Redis reconnecting..."));
redisClient.on("error", (err) => console.error("Redis Error:", err.message));

export default redisClient;
