/**
 * Custom MongoDB sanitization middleware for Express 5
 * Removes potentially malicious keys like $, . from user input
 */

const sanitize = (obj) => {
  if (obj && typeof obj === "object") {
    for (const key in obj) {
      if (key.includes("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      }
    }
  }
  return obj;
};

export const mongoSanitizeMiddleware = (req, res, next) => {
  try {
    if (req.body) {
      req.body = sanitize(req.body);
    }
    if (req.params) {
      req.params = sanitize(req.params);
    }
    // Don't sanitize req.query as it's read-only in Express 5
    // Instead create a sanitized version
    if (req.query && Object.keys(req.query).length > 0) {
      const sanitizedQuery = {};
      for (const key in req.query) {
        if (!key.includes("$") && !key.includes(".")) {
          sanitizedQuery[key] = req.query[key];
        }
      }
      // Attach sanitized query to request
      req.sanitizedQuery = sanitizedQuery;
    }

    next();
  } catch (error) {
    next(error);
  }
};
