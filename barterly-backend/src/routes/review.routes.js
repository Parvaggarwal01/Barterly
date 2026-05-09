import express from "express";
import * as reviewController from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createReviewSchema,
  getUserReviewsParamsSchema,
} from "../validations/review.validation.js";

const router = express.Router();

/**
 * @route   GET /api/reviews
 * @desc    Get all recent reviews (public)
 * @access  Public
 */
router.get("/", reviewController.getAllReviews);

/**
 * @route   POST /api/reviews
 * @desc    Submit a review for a completed barter
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  validate(createReviewSchema),
  reviewController.createReview,
);

/**
 * @route   GET /api/reviews/my
 * @desc    Get reviews written by the current user
 * @access  Private
 */
router.get("/my", authenticate, reviewController.getMyReviews);

/**
 * @route   GET /api/reviews/check/:barterId
 * @desc    Check if current user has reviewed a specific barter
 * @access  Private
 */
router.get(
  "/check/:barterId",
  authenticate,
  reviewController.checkReviewStatus,
);

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get all reviews for a user (public)
 * @access  Public
 */
router.get(
  "/user/:userId",
  validate(getUserReviewsParamsSchema),
  reviewController.getUserReviews,
);

export default router;
