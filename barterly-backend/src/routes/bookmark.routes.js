import express from "express";
import * as bookmarkController from "../controllers/bookmark.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All bookmark routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/bookmarks/:skillId
 * @desc    Toggle bookmark (add if not exists, remove if exists)
 * @access  Private
 */
router.post("/:skillId", bookmarkController.toggleBookmark);

/**
 * @route   GET /api/bookmarks
 * @desc    Get current user's bookmarks
 * @access  Private
 */
router.get("/", bookmarkController.getMyBookmarks);

/**
 * @route   GET /api/bookmarks/check/:skillId
 * @desc    Check if user has bookmarked a skill
 * @access  Private
 */
router.get("/check/:skillId", bookmarkController.checkBookmarkStatus);

export default router;
