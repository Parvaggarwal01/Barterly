import { errorResponse } from "../utils/apiResponse.utils.js";
import User from "../models/User.model.js";
import { verifyAccessToken, isTokenBlacklisted } from "../utils/jwt.utils.js";


export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, 401, "Access token is required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return errorResponse(res, 401, "Access token is required");
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return errorResponse(res, 401, "Invalid or expired access token");
    }

    if(decoded.jti){
      const blacklisted = await isTokenBlacklisted(decoded.jti);
      if(blacklisted){
        return errorResponse(res, 401, "Token has been invalidated. Please log in again");
      }
    }

    // Check if user exists and is active
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return errorResponse(res, 401, "User not found");
    }

    if (!user.isActive) {
      return errorResponse(
        res,
        403,
        "Your account has been deactivated. Please contact support.",
      );
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 500, "Authentication failed");
  }
};

/**
 * Middleware to check if user is verified
 */
export const requireVerification = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 401, "Authentication required");
  }

  if (!req.user.isVerified) {
    return errorResponse(
      res,
      403,
      "Please verify your email to access this resource",
    );
  }

  next();
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for routes that change behavior based on auth status
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select("-password");

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next();
  }
};
