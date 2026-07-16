import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer;

jest.mock("express-rate-limit", () => {
  const mockRateLimit = () => (req, res, next) => next();
  return {
    __esModule: true,
    default: mockRateLimit,
    ipKeyGenerator: (req) => (typeof req === "string" ? req : req.ip || req),
  };
});

jest.mock("rate-limit-redis", () => {
  return jest.fn().mockImplementation(() => {});
});

jest.mock("../src/config/redis.js", () => {
  const RedisMock = require("ioredis-mock");
  return {
    __esModule: true,
    default: new RedisMock()
  };
});

jest.mock("../src/config/rabbitmq.js", () => ({
  connect: jest.fn().mockResolvedValue({}),
  getChannel: jest.fn().mockReturnValue({
    assertQueue: jest.fn().mockResolvedValue({}),
    sendToQueue: jest.fn().mockResolvedValue(true),
    consume: jest.fn().mockResolvedValue({}),
  }),
}));

process.env.JWT_SECRET = "test-secret-key-123456789";
process.env.JWT_ACCESS_SECRET = "test-access-secret-key-123456789";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key-123456789";
process.env.JWT_EXPIRE = "1d";
process.env.NODE_ENV = "test";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
