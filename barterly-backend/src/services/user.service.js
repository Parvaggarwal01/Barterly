import User from "../models/User.model.js";
import { AppError } from "../utils/apiResponse.utils.js";
import {
  uploadAvatar,
  deleteFromCloudinary,
  validateImage,
} from "../utils/cloudinary.utils.js";

/**
 * Get user profile by ID
 * @param {String} userId - User ID
 * @returns {Object} User profile
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .select(
      "-password -verificationOTP -verificationOTPExpire -resetPasswordToken -resetPasswordExpire",
    )
    .populate("skillsOffered", "title description level category");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isActive) {
    throw new AppError("This user account is not active", 403);
  }

  return {
    user,
  };
};

/**
 * Update user profile
 * @param {String} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated user profile
 */
export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Update allowed fields
  const allowedUpdates = [
    "name",
    "bio",
    "location",
    "skillsWanted",
    "portfolioLinks",
  ];

  Object.keys(updateData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      user[key] = updateData[key];
    }
  });

  await user.save();

  return {
    user: user.toPublicProfile(),
  };
};

/**
 * Upload or update user avatar
 * @param {String} userId - User ID
 * @param {String} base64Image - Base64 encoded image
 * @returns {Object} Updated user with new avatar
 */
export const updateUserAvatar = async (userId, base64Image) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Validate image
  validateImage(base64Image, 2); // Max 2MB

  // Delete old avatar from Cloudinary if exists
  if (user.avatar && user.avatar.public_id) {
    try {
      await deleteFromCloudinary(user.avatar.public_id);
    } catch (error) {
      console.error("Failed to delete old avatar:", error);
      // Continue with upload even if deletion fails
    }
  }

  // Upload new avatar
  const uploadResult = await uploadAvatar(base64Image, userId);

  // Update user avatar
  user.avatar = {
    url: uploadResult.url,
    public_id: uploadResult.public_id,
  };

  await user.save();

  return {
    user: user.toPublicProfile(),
    avatar: user.avatar,
  };
};

/**
 * Get user's reviews
 * @param {String} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Object} User's reviews with pagination
 */
export const getUserReviews = async (userId, options = {}) => {
  const { page = 1, limit = 10 } = options;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Import Review model (avoid circular dependency)
  const Review = (await import("../models/Review.model.js")).default;

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ reviewee: userId })
      .populate("reviewer", "name avatar")
      .populate("barter", "status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ reviewee: userId }),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Get user's skills
 * @param {String} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Object} User's skills with pagination
 */
export const getUserSkills = async (userId, options = {}) => {
  const { page = 1, limit = 10 } = options;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Import Skill model (avoid circular dependency)
  const Skill = (await import("../models/Skill.model.js")).default;

  const skip = (page - 1) * limit;

  const [skills, total] = await Promise.all([
    Skill.find({ offeredBy: userId, isActive: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Skill.countDocuments({ offeredBy: userId, isActive: true }),
  ]);

  return {
    skills,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Delete user avatar
 * @param {String} userId - User ID
 * @returns {Object} Updated user without avatar
 */
export const deleteUserAvatar = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.avatar || !user.avatar.public_id) {
    throw new AppError("No avatar to delete", 400);
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(user.avatar.public_id);

  // Update user
  user.avatar = {
    url: "",
    public_id: "",
  };

  await user.save();

  return {
    user: user.toPublicProfile(),
  };
};

/**
 * Update user status (Admin)
 * @param {String} userId - User ID
 * @param {Boolean} isActive - Active status
 * @returns {Object} Updated user
 */
export const updateUserStatus = async (userId, isActive) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.isActive = isActive;
  await user.save();

  return {
    user: user.toPublicProfile(),
  };
};

/**
 * Get all users (Admin)
 * @param {Object} options - Pagination and filter options
 * @returns {Object} Users list with pagination
 */
export const getAllUsers = async (options = {}) => {
  const { page = 1, limit = 10, search } = options;
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select(
        "-password -verificationOTP -verificationOTPExpire -resetPasswordToken -resetPasswordExpire",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

