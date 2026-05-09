import { z } from "zod";
import mongoose from "mongoose";

const isValidObjectId = (val) => mongoose.Types.ObjectId.isValid(val);

const objectId = z.string().refine(isValidObjectId, {
  message: "Invalid ObjectId format",
});

/**
 * Create review validation schema
 */
export const createReviewSchema = z.object({
  body: z.object({
    barterId: objectId,
    rating: z
      .number({
        required_error: "Rating is required",
        invalid_type_error: "Rating must be a number",
      })
      .int("Rating must be a whole number")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    comment: z
      .string()
      .trim()
      .max(500, "Comment cannot exceed 500 characters")
      .optional(),
  }),
});

/**
 * Get reviews for a user
 */
export const getUserReviewsParamsSchema = z.object({
  params: z.object({
    userId: objectId,
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10)),
  }),
});
