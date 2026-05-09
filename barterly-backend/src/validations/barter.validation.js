import { z } from "zod";
import mongoose from "mongoose";

/**
 * Helper function to validate MongoDB ObjectId
 */
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const objectIdValidation = z.string().refine((val) => isValidObjectId(val), {
  message: "Invalid ObjectId format",
});

/**
 * Create barter request validation schema
 */
export const createBarterRequestSchema = z.object({
  body: z.object({
    receiverId: objectIdValidation,
    offeredSkillId: objectIdValidation,
    requestedSkillId: objectIdValidation,
    message: z
      .string()
      .max(500, "Message cannot exceed 500 characters")
      .optional(),
  }),
});

/**
 * Counter offer validation schema
 */
export const counterOfferSchema = z.object({
  body: z.object({
    message: z
      .string({
        required_error: "Counter offer message is required",
      })
      .trim()
      .min(10, "Counter offer message must be at least 10 characters")
      .max(500, "Counter offer message cannot exceed 500 characters"),
    offeredSkillId: objectIdValidation,
  }),
});

/**
 * Reject barter request validation schema
 */
export const rejectBarterSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .trim()
      .min(10, "Rejection reason must be at least 10 characters")
      .max(500, "Rejection reason cannot exceed 500 characters")
      .optional(),
  }),
});

/**
 * Get barter requests query validation schema
 */
export const getBartersQuerySchema = z.object({
  query: z.object({
    status: z
      .enum([
        "pending",
        "accepted",
        "rejected",
        "cancelled",
        "completed",
        "all",
      ])
      .optional(),
    type: z.enum(["sent", "received", "all"]).optional().default("all"),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10)),
    sortBy: z
      .enum(["createdAt", "updatedAt", "status"])
      .optional()
      .default("createdAt"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

/**
 * Barter ID param validation
 */
export const barterIdParamSchema = z.object({
  params: z.object({
    id: objectIdValidation,
  }),
});
