import { errorResponse } from "../utils/apiResponse.utils.js";

/**
 * Middleware to check if user has required role(s)
 * @param {...String} allowedRoles - Roles that are allowed to access the route
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        "You do not have permission to perform this action",
      );
    }

    next();
  };
};
