import Report from "../models/Report.model.js";
import User from "../models/User.model.js";
import { AppError } from "../utils/apiResponse.utils.js";

/**
 * Submit a report against a user
 * @param {Object} reportData - { reportedUserId, barterId, reportedSkillId, reason, description }
 * @param {String} reporterId - User submitting the report
 */
export const createReport = async (reportData, reporterId) => {
  const { reportedUserId, barterId, reportedSkillId, reason, description } =
    reportData;

  // Cannot report yourself
  if (reportedUserId.toString() === reporterId.toString()) {
    throw new AppError("You cannot report yourself", 400);
  }

  // Check reported user exists
  const reportedUser = await User.findById(reportedUserId);
  if (!reportedUser) {
    throw new AppError("Reported user not found", 404);
  }

  // Prevent duplicate reports for the same barter
  if (barterId) {
    const existing = await Report.findOne({
      reporter: reporterId,
      reportedUser: reportedUserId,
      barter: barterId,
    });
    if (existing) {
      throw new AppError(
        "You have already submitted a report for this barter",
        400,
      );
    }
  }

  const report = await Report.create({
    reporter: reporterId,
    reportedUser: reportedUserId,
    barter: barterId || null,
    reportedSkill: reportedSkillId || null,
    reason,
    description,
  });

  return { report };
};

/**
 * Get all reports with filters and pagination (Admin)
 * @param {Object} filters - Filter options
 * @param {Object} options - Pagination options
 * @returns {Object} Reports and metadata
 */
export const getAllReports = async (filters = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  // Build query
  const query = {};

  // Filter by status
  if (filters.status) {
    query.status = filters.status;
  }

  // Filter by reason
  if (filters.reason) {
    query.reason = filters.reason;
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // Execute query
  const [reports, total] = await Promise.all([
    Report.find(query)
      .populate("reporter", "name email avatar")
      .populate("reportedUser", "name email avatar")
      .populate("reportedSkill", "title")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Report.countDocuments(query),
  ]);

  return {
    reports,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  };
};

/**
 * Update report status (Admin)
 * @param {String} reportId - Report ID
 * @param {String} status - New status
 * @param {String} adminNote - Admin note
 * @returns {Object} Updated report
 */
export const updateReportStatus = async (reportId, status, adminNote) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  report.status = status;
  if (adminNote) {
    report.adminNote = adminNote;
  }

  await report.save();

  return report;
};
