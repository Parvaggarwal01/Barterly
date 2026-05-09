import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import * as notificationController from "../controllers/notification.controller.js";

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

router.get("/", notificationController.getMyNotifications);
router.put("/read-all", notificationController.markAllRead);
router.put("/:id/read", notificationController.markRead);

export default router;
