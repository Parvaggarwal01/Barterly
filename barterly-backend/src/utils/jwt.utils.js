import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import redis from "../config/redis.js";

const ACCESS_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRE || process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRE || process.env.JWT_REFRESH_EXPIRES_IN || "7d";

/**
 * Generate access token (short-lived)
 * @param {Object} payload - User data to encode in token
 * @returns {String} JWT access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(
    { ...payload, jti: uuidv4() },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN },
  );
};

/**
 * Generate refresh token (long-lived)
 * @param {Object} payload - User data to encode in token
 * @returns {String} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return generateRefreshTokenWithExpiry(payload, REFRESH_EXPIRES_IN);
};

export const generateRefreshTokenWithExpiry = (payload, expiresIn) => {
  return jwt.sign(
    { ...payload, jti: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn },
  );
};

/**
 * Verify access token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

/**
 * Verify refresh token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object containing both tokens
 */
export const generateTokens = (user, options = {}) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const refreshExpiresIn = options.refreshExpiresIn || REFRESH_EXPIRES_IN;

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshTokenWithExpiry(payload, refreshExpiresIn),
  };
};

export const blacklistToken = async (jti, expiresInSeconds) => {
  await redis.setex(`blacklist:${jti}`, expiresInSeconds, "1");
};

export const isTokenBlacklisted = async (jti) => {
  const result = await redis.get(`blacklist:${jti}`);
  return result !== null;
};
