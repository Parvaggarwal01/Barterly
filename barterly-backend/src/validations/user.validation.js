import { z } from "zod";
import mongoose from "mongoose";

/**
 * Helper to validate MongoDB ObjectId
 */
const isValidObjectId = (val) => mongoose.Types.ObjectId.isValid(val);

/**
 * Update profile validation schema
 */
export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .trim()
      .optional(),

    bio: z
      .string()
      .max(500, "Bio cannot exceed 500 characters")
      .trim()
      .optional(),

    location: z
      .string()
      .max(100, "Location cannot exceed 100 characters")
      .trim()
      .optional(),

    skillsWanted: z
      .array(z.string().trim())
      .max(10, "Maximum 10 skills wanted")
      .optional(),

    portfolioLinks: z
      .array(z.string().url("Invalid URL format").trim())
      .max(5, "Maximum 5 portfolio links")
      .optional(),
  }),
});

/**
 * Upload avatar validation schema
 */
export const uploadAvatarSchema = z.object({
  body: z.object({
    avatar: z
      .string({
        required_error: "Avatar image is required",
      })
      .regex(
        /^data:image\/(png|jpg|jpeg|webp);base64,/,
        "Invalid image format. Must be base64 encoded image.",
      ),
  }),
});

/**
 * Get user by ID validation schema
 */
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "User ID is required",
      })
      .refine((val) => isValidObjectId(val), "Invalid user ID"),
  }),
});
