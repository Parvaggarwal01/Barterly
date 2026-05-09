import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  updateProfileSchema,
  uploadAvatarSchema,
  getUserByIdSchema,
} from "../validations/user.validation.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * Protected routes (require authentication)
 * NOTE: Define specific routes before parameterized routes
 */

// Get current user's profile
router.get("/me", authenticate, userController.getCurrentUserProfile);

/**
 * Admin routes
 */
router.get(
  "/admin/all",
  authenticate,
  authorize("admin"),
  userController.getAllUsers,
);

router.patch(
  "/admin/:id/status",
  authenticate,
  authorize("admin"),
  userController.updateUserStatus,
);

/**
 * Public routes
 */

// Get user profile by ID
router.get("/:id", validate(getUserByIdSchema), userController.getUserProfile);

// Get user's reviews
router.get(
  "/:id/reviews",
  validate(getUserByIdSchema),
  userController.getUserReviews,
);

// Get user's skills
router.get(
  "/:id/skills",
  validate(getUserByIdSchema),
  userController.getUserSkills,
);

/**
 * Protected routes for profile updates
 */

// Update current user's profile
router.put(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile,
);

// Upload/update avatar
router.put(
  "/avatar",
  authenticate,
  validate(uploadAvatarSchema),
  userController.uploadAvatar,
);

// Delete avatar
router.delete("/avatar", authenticate, userController.deleteAvatar);

export default router;
