import crypto from "crypto";
import User from "../models/User.model.js";
import { generateTokens } from "../utils/jwt.utils.js";
import { queueEmail, EMAIL_TYPE } from "./emailQueue.service.js";
import { AppError } from "../utils/apiResponse.utils.js";
import redis from "../config/redis.js";
import { blacklistToken, verifyAccessToken } from "../utils/jwt.utils.js";
import { registeredUsers } from "../config/metrics.js";

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Object} User object and tokens
 */
export const registerUser = async ({ name, email, password }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  // Generate 6-digit OTP
  const verificationOTP = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  // Set OTP expiry to 10 minutes from now
  const user = await User.create({
    name,
    email,
    password,
  });

  await redis.setex(`otp:${email}`, 600, verificationOTP);

  // Send verification email with OTP
  queueEmail(EMAIL_TYPE.VERIFICATION, { email, name, otp: verificationOTP });

  registeredUsers.inc();

  // Generate tokens
  const tokens = generateTokens(user);

  return {
    user: user.toPublicProfile(),
    ...tokens,
  };
};

/**
 * Login user
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} User object and tokens
 */
export const loginUser = async (email, password, options = {}) => {
  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AppError(
      "Your account has been deactivated. Please contact support.",
      403,
    );
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate tokens
  const tokens = generateTokens(user, {
    refreshExpiresIn: options.refreshExpiresIn,
  });

  return {
    user: user.toPublicProfile(),
    ...tokens,
  };
};

/**
 * Verify user email with OTP
 * @param {String} otp - 6-digit OTP code
 * @param {String} email - User email
 * @returns {Object} User object
 */
export const verifyEmail = async (otp, email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("Email already verified", 400);
  }

  const storedOTP = await redis.get(`otp:${email}`);
  if (!storedOTP) {
    throw new AppError("OTP expired. Please request a new one.", 400);
  }

  if (storedOTP !== otp) {
    throw new AppError("Invalid OTP code.", 400);
  }

  await redis.del(`otp:${email}`);
  user.isVerified = true;
  await user.save();

  queueEmail(EMAIL_TYPE.WELCOME, { email: user.email, name: user.name });

  return {
    user: user.toPublicProfile(),
  };
};

/**
 * Resend verification OTP
 * @param {String} userId - User ID
 * @returns {Object} Success message
 */
export const resendVerificationEmail = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("Email already verified", 400);
  }

  // Generate new 6-digit OTP
  const verificationOTP = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  await redis.setex(`otp:${user.email}`, 600, verificationOTP);

  // Send verification email with new OTP
  queueEmail(EMAIL_TYPE.VERIFICATION, {
    email: user.email,
    name: user.name,
    otp: verificationOTP,
  });

  return {
    message: "Verification OTP sent successfully",
  };
};

/**
 * Request password reset with OTP
 * @param {String} email - User email
 * @returns {Object} Success message
 */
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists or not for security
    return {
      message:
        "If your email is registered, you will receive a password reset OTP",
    };
  }

  // Generate 6-digit OTP
  const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP in Redis with 10 minute expiry
  await redis.setex(`reset-otp:${email}`, 600, resetOTP);

  // Send reset email with OTP via queue
  await queueEmail(EMAIL_TYPE.PASSWORD_RESET, {
    email: user.email,
    name: user.name,
    otp: resetOTP,
  });

  return {
    message:
      "If your email is registered, you will receive a password reset OTP",
  };
};

/**
 * Reset password with OTP
 * @param {String} email - User email
 * @param {String} otp - 6-digit OTP
 * @param {String} newPassword - New password
 * @returns {Object} Success message
 */
export const resetPassword = async (email, otp, newPassword) => {
  // Find user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or OTP", 400);
  }

  // Verify OTP from Redis
  const storedOTP = await redis.get(`reset-otp:${email}`);

  if (!storedOTP) {
    throw new AppError("OTP expired. Please request a new one.", 400);
  }

  if (storedOTP !== otp) {
    throw new AppError("Invalid OTP code.", 400);
  }

  // Delete OTP from Redis
  await redis.del(`reset-otp:${email}`);

  // Update password
  user.password = newPassword;
  await user.save();

  return {
    message:
      "Password reset successful. You can now login with your new password.",
  };
};

/**
 * Refresh access token
 * @param {String} refreshToken - Refresh token from cookie
 * @returns {Object} New tokens
 */
export const refreshAccessToken = async (refreshToken, options = {}) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  // Verify refresh token
  let decoded;
  try {
    const { verifyRefreshToken } = await import("../utils/jwt.utils.js");
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // Check if user exists
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isActive) {
    throw new AppError("Account deactivated", 403);
  }

  // Generate new tokens
  const tokens = generateTokens(user, {
    refreshExpiresIn: options.refreshExpiresIn,
  });

  return tokens;
};

/**
 * Logout user (invalidate refresh token)
 * @returns {Object} Success message
 */
export const logoutUser = async (accessToken) => {
  if (accessToken) {
    try {
      const decoded = verifyAccessToken(accessToken);
      const ttlSeconds = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttlSeconds > 0) {
        await blacklistToken(decoded.jti, ttlSeconds);
      }
    } catch (_) {}
  }

  return {
    message: "Logged out successfully",
  };
};

/**
 * Get current user profile
 * @param {String} userId - User ID
 * @returns {Object} User object
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    user: user.toPublicProfile(),
  };
};
