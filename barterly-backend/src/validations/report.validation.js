import { z } from "zod";
import mongoose from "mongoose";

const isValidObjectId = (val) => mongoose.Types.ObjectId.isValid(val);

export const createReportSchema = z.object({
  body: z.object({
    reportedUserId: z
      .string()
      .refine(isValidObjectId, { message: "Invalid user ID" }),
    barterId: z
      .string()
      .refine(isValidObjectId, { message: "Invalid barter ID" })
      .optional(),
    reportedSkillId: z
      .string()
      .refine(isValidObjectId, { message: "Invalid skill ID" })
      .optional(),
    reason: z.enum(
      ["spam", "fake_skill", "harassment", "scam", "inappropriate", "other"],
      { errorMap: () => ({ message: "Invalid report reason" }) },
    ),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description cannot exceed 1000 characters"),
  }),
});
