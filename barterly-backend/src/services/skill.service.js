import Skill from "../models/Skill.model.js";
import User from "../models/User.model.js";
import Category from "../models/Category.model.js";
import { AppError } from "../utils/apiResponse.utils.js";

/**
 * Create a new skill
 * @param {Object} skillData - Skill data
 * @param {String} userId - User ID creating the skill
 * @returns {Object} Created skill
 */
export const createSkill = async (skillData, userId) => {
  // Verify category exists
  const category = await Category.findById(skillData.category);
  if (!category || !category.isActive) {
    throw new AppError("Invalid or inactive category", 400);
  }

  // Create skill
  const skill = await Skill.create({
    ...skillData,
    offeredBy: userId,
  });

  // Populate fields
  await skill.populate([
    { path: "category", select: "name slug icon" },
    { path: "offeredBy", select: "name email avatar location" },
  ]);

  // Add skill to user's skillsOffered array
  await User.findByIdAndUpdate(userId, {
    $addToSet: { skillsOffered: skill._id },
  });

  return skill;
};

/**
 * Get all skills with filters and pagination
 * @param {Object} filters - Filter options
 * @param {Object} options - Pagination options
 * @returns {Object} Skills and metadata
 */
export const getAllSkills = async (filters = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  // Build query
  const query = { isActive: true };

  if (!filters.showPending) {
    query.verificationStatus = "approved";
  }

  // Filter by category
  if (filters.category) {
    query.category = filters.category;
  }

  // Filter by level
  if (filters.level) {
    query.level = filters.level;
  }

  // Filter by delivery mode
  if (filters.deliveryMode) {
    query.deliveryMode = filters.deliveryMode;
  }

  // Filter by user
  if (filters.userId) {
    query.offeredBy = filters.userId;
  }

  // Search by title or description
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
      { tags: { $in: [new RegExp(filters.search, "i")] } },
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // Execute query
  const [skills, total] = await Promise.all([
    Skill.find(query)
      .populate("category", "name slug icon")
      .populate("offeredBy", "name email avatar location averageRating")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Skill.countDocuments(query),
  ]);

  return {
    skills,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  };
};

/**
 * Get skill by ID
 * @param {String} skillId - Skill ID
 * @returns {Object} Skill details
 */
export const getSkillById = async (skillId) => {
  const skill = await Skill.findById(skillId)
    .populate("category", "name slug icon description")
    .populate(
      "offeredBy",
      "name email avatar bio location averageRating totalReviews",
    );

  if (!skill) {
    throw new AppError("Skill not found", 404);
  }

  // Increment view count
  skill.viewCount += 1;
  await skill.save();

  return skill;
};

/**
 * Update skill
 * @param {String} skillId - Skill ID
 * @param {Object} updateData - Fields to update
 * @param {String} userId - User ID making the update
 * @returns {Object} Updated skill
 */
export const updateSkill = async (skillId, updateData, userId) => {
  const skill = await Skill.findById(skillId);

  if (!skill) {
    throw new AppError("Skill not found", 404);
  }

  // Check ownership
  if (skill.offeredBy.toString() !== userId.toString()) {
    throw new AppError("You can only update your own skills", 403);
  }

  // If category is being updated, verify it exists
  if (updateData.category) {
    const category = await Category.findById(updateData.category);
    if (!category || !category.isActive) {
      throw new AppError("Invalid or inactive category", 400);
    }
  }

  // Update skill
  Object.assign(skill, updateData);

  // If skill details are updated, reset verification status to pending
  const fieldsRequiringReview = [
    "title",
    "description",
    "category",
    "level",
    "verificationDocuments",
  ];
  if (fieldsRequiringReview.some((field) => field in updateData)) {
    skill.verificationStatus = "pending";
    skill.isVerified = false;
  }

  await skill.save();

  await skill.populate([
    { path: "category", select: "name slug icon" },
    { path: "offeredBy", select: "name email avatar location" },
  ]);

  return skill;
};

/**
 * Delete skill
 * @param {String} skillId - Skill ID
 * @param {String} userId - User ID making the deletion
 */
export const deleteSkill = async (skillId, userId) => {
  const skill = await Skill.findById(skillId);

  if (!skill) {
    throw new AppError("Skill not found", 404);
  }

  // Check ownership
  if (skill.offeredBy.toString() !== userId.toString()) {
    throw new AppError("You can only delete your own skills", 403);
  }

  // Soft delete by setting isActive to false
  skill.isActive = false;
  await skill.save();

  // Remove skill from user's skillsOffered array
  await User.findByIdAndUpdate(userId, {
    $pull: { skillsOffered: skillId },
  });

  return { message: "Skill deleted successfully" };
};

/**
 * Get user's skills
 * @param {String} userId - User ID
 * @returns {Array} User's skills
 */
export const getUserSkills = async (userId) => {
  const skills = await Skill.find({
    offeredBy: userId,
    isActive: true,
  })
    .populate("category", "name slug icon")
    .sort({ createdAt: -1 });

  return skills;
};

/**
 * Admin: Update skill verification status
 * @param {String} skillId - Skill ID
 * @param {String} status - Verification status (approved/rejected)
 * @param {String} note - Optional verification note
 * @returns {Object} Updated skill
 */
export const updateSkillVerification = async (skillId, status, note) => {
  const skill = await Skill.findById(skillId);

  if (!skill) {
    throw new AppError("Skill not found", 404);
  }

  skill.verificationStatus = status;
  skill.isVerified = status === "approved";

  if (note) {
    skill.verificationNote = note;
  }

  await skill.save();

  await skill.populate([
    { path: "category", select: "name slug icon" },
    { path: "offeredBy", select: "name email avatar location" },
  ]);

  return skill;
};

/**
 * Admin: Get all skills including pending ones
 * @param {Object} filters - Filter options
 * @param {Object} options - Pagination options
 * @returns {Object} Skills and metadata
 */
export const getAllSkillsAdmin = async (filters = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  // Build query (include inactive for admin)
  const query = {};

  // Filter by verification status
  if (filters.verificationStatus) {
    query.verificationStatus = filters.verificationStatus;
  }

  // Filter by category
  if (filters.category) {
    query.category = filters.category;
  }

  // Filter by active status
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  // Search
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // Execute query
  const [skills, total] = await Promise.all([
    Skill.find(query)
      .populate("category", "name slug icon")
      .populate("offeredBy", "name email avatar location")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Skill.countDocuments(query),
  ]);

  return {
    skills,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  };
};

/**
 * Get skill statistics
 * @returns {Object} Statistics
 */
export const getSkillStats = async () => {
  const [total, pending, approved, rejected, byCategory] = await Promise.all([
    Skill.countDocuments({ isActive: true }),
    Skill.countDocuments({
      isActive: true,
      verificationStatus: "pending",
    }),
    Skill.countDocuments({
      isActive: true,
      verificationStatus: "approved",
    }),
    Skill.countDocuments({
      isActive: true,
      verificationStatus: "rejected",
    }),
    Skill.aggregate([
      { $match: { isActive: true, verificationStatus: "approved" } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          name: "$category.name",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    total,
    pending,
    approved,
    rejected,
    byCategory,
  };
};
