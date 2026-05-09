import User from "../models/User.model.js";
import Skill from "../models/Skill.model.js";
import BarterRequest from "../models/BarterRequest.model.js";
import Report from "../models/Report.model.js";
import { successResponse } from "../utils/apiResponse.utils.js";

/**
 * Get dashboard statistics
 * @returns {Object} Statistics
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalSkills,
      activeRequests,
      completedTrades,
      pendingSkills,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Skill.countDocuments({ isActive: true }),
      BarterRequest.countDocuments({
        status: { $in: ["pending", "accepted"] },
      }),
      BarterRequest.countDocuments({ status: "completed" }),
      Skill.countDocuments({ verificationStatus: "pending", isActive: true }),
      Report.countDocuments({ status: "pending" }),
    ]);

    const stats = {
      totalUsers,
      totalSkills,
      activeRequests,
      completedTrades,
      pendingSkills,
      pendingReports,
    };

    return successResponse(
      res,
      200,
      "Dashboard statistics retrieved successfully",
      stats,
    );
  } catch (error) {
    next(error);
  }
};
