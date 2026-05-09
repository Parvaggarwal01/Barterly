import * as userService from "../services/user.service.js";
import { successResponse } from "../utils/apiResponse.utils.js";

export const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await userService.getUserProfile(id);

    return successResponse(
      res,
      200,
      "User profile retrieved successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    const result = await userService.updateUserProfile(userId, updateData);

    return successResponse(res, 200, "Profile updated successfully", result);
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { avatar } = req.body;

    const result = await userService.updateUserAvatar(userId, avatar);

    return successResponse(res, 200, "Avatar uploaded successfully", result);
  } catch (error) {
    next(error);
  }
};

export const deleteAvatar = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await userService.deleteUserAvatar(userId);

    return successResponse(res, 200, "Avatar deleted successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const result = await userService.getUserReviews(id, { page, limit });

    return successResponse(
      res,
      200,
      "User reviews retrieved successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const getUserSkills = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const result = await userService.getUserSkills(id, { page, limit });

    return successResponse(
      res,
      200,
      "User skills retrieved successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const getCurrentUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await userService.getUserProfile(userId);

    return successResponse(
      res,
      200,
      "Current user profile retrieved successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const result = await userService.updateUserStatus(id, isActive);

    return successResponse(
      res,
      200,
      "User status updated successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;

    const result = await userService.getAllUsers({ page, limit, search });


    return successResponse(res, 200, "Users retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};
