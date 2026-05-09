import * as reportService from "../services/report.service.js";
import { successResponse } from "../utils/apiResponse.utils.js";

export const submitReport = async (req, res, next) => {
  try {
    const result = await reportService.createReport(req.body, req.user._id);
    successResponse(res, 201, "Report submitted successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getAllReports = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      reason: req.query.reason,
    };

    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await reportService.getAllReports(filters, options);

    successResponse(res, 200, "Reports retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const { id } = req.params;

    const result = await reportService.updateReportStatus(
      id,
      status,
      adminNote,
    );

    successResponse(res, 200, "Report status updated successfully", result);
  } catch (error) {
    next(error);
  }
};
