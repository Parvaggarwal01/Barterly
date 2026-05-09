import express from "express";
import * as reportController from "../controllers/report.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createReportSchema } from "../validations/report.validation.js";

const router = express.Router();

router.use(authenticate);

/**
 * @route   POST /api/reports
 * @desc    Submit a report against a user
 * @access  Private
 */
router.post("/", validate(createReportSchema), reportController.submitReport);

/**
 * @route   GET /api/reports/admin/all
 * @desc    Get all reports (Admin)
 * @access  Admin
 */
router.get("/admin/all", authorize("admin"), reportController.getAllReports);

/**
 * @route   PATCH /api/reports/admin/:id/status
 * @desc    Update report status (Admin)
 * @access  Admin
 */
router.patch(
  "/admin/:id/status",
  authorize("admin"),
  reportController.updateReportStatus,
);

export default router;
