import Review from "../models/Review.model.js";
import BarterRequest from "../models/BarterRequest.model.js";
import { AppError } from "../utils/apiResponse.utils.js";

/**
 * Create a review for a completed barter
 * @param {Object} reviewData - { barterId, rating, comment }
 * @param {String} reviewerId - User leaving the review
 * @returns {Object} Created review
 */
export const createReview = async (reviewData, reviewerId) => {
  const { barterId, rating, comment } = reviewData;

  // Fetch the barter
  const barter = await BarterRequest.findById(barterId);

  if (!barter) {
    throw new AppError("Barter request not found", 404);
  }

  // Only completed barters can be reviewed
  if (barter.status !== "completed") {
    throw new AppError(
      "You can only leave a review for completed barter exchanges",
      400,
    );
  }

  // Reviewer must be sender or receiver
  const isSender = barter.sender.toString() === reviewerId.toString();
  const isReceiver = barter.receiver.toString() === reviewerId.toString();

  if (!isSender && !isReceiver) {
    throw new AppError("You are not a participant in this barter request", 403);
  }

  // The reviewee is the other party
  const revieweeId = isSender ? barter.receiver : barter.sender;

  // Check for duplicate review (unique index will also catch this, but give a nicer message)
  const existingReview = await Review.findOne({
    reviewer: reviewerId,
    barter: barterId,
  });

  if (existingReview) {
    throw new AppError(
      "You have already submitted a review for this barter",
      400,
    );
  }

  // Create the review
  const review = await Review.create({
    reviewer: reviewerId,
    reviewee: revieweeId,
    barter: barterId,
    rating,
    comment,
  });

  await review.populate([
    { path: "reviewer", select: "name avatar averageRating" },
    { path: "reviewee", select: "name avatar averageRating" },
    {
      path: "barter",
      select: "offeredSkill requestedSkill completedAt",
      populate: [
        { path: "offeredSkill", select: "title" },
        { path: "requestedSkill", select: "title" },
      ],
    },
  ]);

  return review;
};

/**
 * Get all reviews for a user (as reviewee)
 * @param {String} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Object} Reviews + pagination
 */
export const getUserReviews = async (userId, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ reviewee: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("reviewer", "name avatar location averageRating")
      .populate({
        path: "barter",
        select: "offeredSkill requestedSkill completedAt",
        populate: [
          { path: "offeredSkill", select: "title" },
          { path: "requestedSkill", select: "title" },
        ],
      }),
    Review.countDocuments({ reviewee: userId }),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNextPage: skip + reviews.length < total,
      hasPrevPage: parseInt(page) > 1,
    },
  };
};

/**
 * Check if the current user has already reviewed a specific barter
 * @param {String} barterId - Barter ID
 * @param {String} reviewerId - Reviewer user ID
 * @returns {Object} { reviewed: Boolean, review: Object|null }
 */
export const checkReviewStatus = async (barterId, reviewerId) => {
  const barter = await BarterRequest.findById(barterId).select(
    "sender receiver status",
  );

  if (!barter) {
    throw new AppError("Barter request not found", 404);
  }

  const isSender = barter.sender.toString() === reviewerId.toString();
  const isReceiver = barter.receiver.toString() === reviewerId.toString();

  if (!isSender && !isReceiver) {
    throw new AppError("You are not a participant in this barter", 403);
  }

  const review = await Review.findOne({
    reviewer: reviewerId,
    barter: barterId,
  }).populate("reviewee", "name avatar");

  return {
    canReview: barter.status === "completed",
    reviewed: !!review,
    review: review || null,
  };
};

/**
 * Get reviews written by the current user
 * @param {String} reviewerId - Reviewer user ID
 * @param {Object} options - Pagination options
 * @returns {Object} Reviews + pagination
 */
export const getMyReviews = async (reviewerId, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ reviewer: reviewerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("reviewee", "name avatar location averageRating")
      .populate({
        path: "barter",
        select: "offeredSkill requestedSkill completedAt",
        populate: [
          { path: "offeredSkill", select: "title" },
          { path: "requestedSkill", select: "title" },
        ],
      }),
    Review.countDocuments({ reviewer: reviewerId }),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNextPage: skip + reviews.length < total,
      hasPrevPage: parseInt(page) > 1,
    },
  };
};

/**
 * Get all recent reviews (Public)
 * @param {Object} options - Pagination options
 * @returns {Array} Reviews
 */
export const getAllReviews = async (options = {}) => {
  const { page = 1, limit = 3 } = options;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await Review.find()
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("reviewer", "name avatar location")
    .populate("reviewee", "name avatar");

  return reviews;
};
