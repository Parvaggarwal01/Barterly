import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, checkRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(checkRole("admin"));

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Admin
 */
router.get("/stats", adminController.getDashboardStats);

export default router;
