import { ZodError } from "zod";
import { errorResponse } from "../utils/apiResponse.utils.js";

/**
 * Middleware to validate request using Zod schema
 * @param {Object} schema - Zod schema object
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    // console.log("🔍 Validate middleware started");
    // console.log("🔍 next is a function?", typeof next === "function");
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
      // console.log("✅ Validation passed, calling next()");
      next();
    } catch (error) {
      // console.log("❌ Validation error caught:", error.message);
      if (error instanceof ZodError) {
        const validationErrors = error.issues ?? error.errors ?? [];
        const errors = validationErrors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return errorResponse(res, 400, "Validation failed", errors);
      }

      return errorResponse(res, 500, "Internal server error");
    }
  };
};
