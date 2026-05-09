import Bookmark from "../models/Bookmark.model.js";
import Skill from "../models/Skill.model.js";
import { AppError } from "../utils/apiResponse.utils.js";

/**
 * Toggle a bookmark for a skill (add if not exists, remove if exists)
 * @param {String} userId
 * @param {String} skillId
 * @returns {Object} { bookmarked: Boolean, message: String }
 */
export const toggleBookmark = async (userId, skillId) => {
  const skill = await Skill.findById(skillId);
  if (!skill || !skill.isActive) {
    throw new AppError("Skill not found or inactive", 404);
  }

  // Prevent bookmarking own skill
  if (skill.offeredBy.toString() === userId.toString()) {
    throw new AppError("You cannot bookmark your own skill", 400);
  }

  const existing = await Bookmark.findOne({ user: userId, skill: skillId });

  if (existing) {
    // Remove bookmark
    await existing.deleteOne();
    // Decrement savedCount
    await Skill.findByIdAndUpdate(skillId, { $inc: { savedCount: -1 } });
    return { bookmarked: false, message: "Bookmark removed" };
  } else {
    // Add bookmark
    await Bookmark.create({ user: userId, skill: skillId });
    // Increment savedCount
    await Skill.findByIdAndUpdate(skillId, { $inc: { savedCount: 1 } });
    return { bookmarked: true, message: "Skill bookmarked" };
  }
};

/**
 * Get all bookmarks for current user with populated skill data
 * @param {String} userId
 * @param {Object} options - { page, limit }
 */
export const getMyBookmarks = async (userId, options = {}) => {
  const { page = 1, limit = 12 } = options;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [bookmarks, total] = await Promise.all([
    Bookmark.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "skill",
        select:
          "title description level deliveryMode category tags isActive isVerified verificationStatus savedCount offeredBy createdAt",
        populate: [
          { path: "category", select: "name slug" },
          {
            path: "offeredBy",
            select: "name avatar averageRating totalReviews location",
          },
        ],
      }),
    Bookmark.countDocuments({ user: userId }),
  ]);

  // Filter out deleted/inactive skills
  const validBookmarks = bookmarks.filter((b) => b.skill && b.skill.isActive);

  return {
    bookmarks: validBookmarks,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNextPage: skip + validBookmarks.length < total,
      hasPrevPage: parseInt(page) > 1,
    },
  };
};

/**
 * Check if the current user has bookmarked a skill
 * @param {String} userId
 * @param {String} skillId
 * @returns {Object} { bookmarked: Boolean }
 */
export const checkBookmarkStatus = async (userId, skillId) => {
  const existing = await Bookmark.findOne({ user: userId, skill: skillId });
  return { bookmarked: !!existing };
};
