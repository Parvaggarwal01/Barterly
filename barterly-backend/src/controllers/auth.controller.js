import * as authService from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.utils.js";

const isProduction = process.env.NODE_ENV === "production";

const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRE || "7d";
const REMEMBER_ME_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_REMEMBER_EXPIRE || "30d";
const DEFAULT_REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const parseDurationToMs = (value, fallbackMs) => {
  if (typeof value !== "string") {
    return fallbackMs;
  }

  const parsed = value.trim().match(/^(\d+)\s*([smhd])$/i);

  if (!parsed) {
    return fallbackMs;
  }

  const amount = Number(parsed[1]);
  const unit = parsed[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

const buildRefreshCookieOptions = (maxAge) => {
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    path: "/",
  };

  if (typeof maxAge === "number") {
    options.maxAge = maxAge;
  }

  return options;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const result = await authService.registerUser({ name, email, password });

    res.cookie(
      "refreshToken",
      result.refreshToken,
      buildRefreshCookieOptions(
        parseDurationToMs(REFRESH_EXPIRES_IN, DEFAULT_REFRESH_MAX_AGE_MS),
      ),
    );

    return successResponse(
      res,
      201,
      "Registration successful. Please check your email to verify your account.",
      {
        user: result.user,
        accessToken: result.accessToken,
      },
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const debugAuth = process.env.DEBUG_AUTH === "true";
    const remember = !!rememberMe;

    const refreshExpiresIn = remember
      ? REMEMBER_ME_REFRESH_EXPIRES_IN
      : REFRESH_EXPIRES_IN;
    const refreshMaxAge = parseDurationToMs(
      refreshExpiresIn,
      DEFAULT_REFRESH_MAX_AGE_MS,
    );

    if (debugAuth) {
      const maskedEmail =
        typeof email === "string"
          ? email.replace(/(^.).*(@.*$)/, "$1***$2")
          : "<missing>";
      console.log("[auth.login] incoming", {
        email: maskedEmail,
        rememberMe: rememberMe,
        rememberMeType: typeof rememberMe,
        refreshExpiresIn,
        refreshMaxAge,
        nodeEnv: process.env.NODE_ENV,
      });
    }

    const result = await authService.loginUser(email, password, {
      refreshExpiresIn,
    });

    const cookieOptions = buildRefreshCookieOptions(remember ? refreshMaxAge : undefined);
    res.cookie("refreshToken", result.refreshToken, cookieOptions);

    if (debugAuth) {
      const setCookie =
        res.getHeader("Set-Cookie") || res.getHeader("set-cookie");
      console.log("[auth.login] set-cookie", {
        cookieOptions,
        remember,
        hasSetCookieHeader: !!setCookie,
      });
    }

    return successResponse(res, 200, "Login successful", {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { otp, email } = req.body;

    const result = await authService.verifyEmail(otp, email);

    return successResponse(res, 200, "Email verified successfully", result);
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await authService.resendVerificationEmail(userId);

    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    const result = await authService.resetPassword(email, otp, password);

    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { rememberMe } = req.body || {};

    const debugAuth = process.env.DEBUG_AUTH === "true";
    const remember = !!rememberMe;

    const refreshExpiresIn = remember
      ? REMEMBER_ME_REFRESH_EXPIRES_IN
      : REFRESH_EXPIRES_IN;

    const tokens = await authService.refreshAccessToken(refreshToken, {
      refreshExpiresIn,
    });

    const refreshMaxAge = parseDurationToMs(
      refreshExpiresIn,
      DEFAULT_REFRESH_MAX_AGE_MS,
    );

    // RememberMe ON -> persistent cookie, OFF -> session cookie
    const cookieOptions = buildRefreshCookieOptions(remember ? refreshMaxAge : undefined);
    res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

    if (debugAuth) {
      console.log("[auth.refreshToken]", {
        rememberMe,
        rememberMeType: typeof rememberMe,
        refreshExpiresIn,
        cookieHasMaxAge: typeof cookieOptions.maxAge === "number",
      });
    }

    return successResponse(res, 200, "Token refreshed successfully", {
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    await authService.logoutUser(token);

    // Clear refresh token cookie
    res.clearCookie("refreshToken", buildRefreshCookieOptions());

    return successResponse(res, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await authService.getCurrentUser(userId);

    return successResponse(
      res,
      200,
      "User profile retrieved successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};
