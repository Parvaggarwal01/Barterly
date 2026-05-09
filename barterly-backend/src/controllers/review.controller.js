import * as reviewService from "../services/review.service.js";
import { successResponse } from "../utils/apiResponse.utils.js";

export const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.body, req.user._id);

    return successResponse(res, 201, "Review submitted successfully", review);
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (req, res, next) => {
  try {
    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const result = await reviewService.getUserReviews(
      req.params.userId,
      options,
    );

    return successResponse(res, 200, "Reviews retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const checkReviewStatus = async (req, res, next) => {
  try {
    const result = await reviewService.checkReviewStatus(
      req.params.barterId,
      req.user._id,
    );

    return successResponse(res, 200, "Review status retrieved", result);
  } catch (error) {
    next(error);
  }
};

export const getMyReviews = async (req, res, next) => {
  try {
    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const result = await reviewService.getMyReviews(req.user._id, options);

    return successResponse(
      res,
      200,
      "Your reviews retrieved successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (req, res, next) => {
  try {
    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 3,
    };

    const result = await reviewService.getAllReviews(options);

    return successResponse(
      res,
      200,
      "All reviews retrieved successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};
