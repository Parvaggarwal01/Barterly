import express from "express";
import * as categoryController from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/slug/:slug", categoryController.getCategoryBySlug);

// Admin routes (require authentication and admin role)
router.use(authenticate, authorize("admin"));

router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);
router.patch("/:id/toggle-status", categoryController.toggleCategoryStatus);
router.get("/admin/stats", categoryController.getCategoryStats);

export default router;
