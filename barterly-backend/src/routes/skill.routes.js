import express from "express";
import * as skillController from "../controllers/skill.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

// Public routes
router.get("/", skillController.getAllSkills);
router.get("/:id", skillController.getSkillById);
router.get("/user/:userId", skillController.getUserSkills);

// Protected routes (require authentication)
router.use(authenticate);

router.post("/", skillController.createSkill);
router.get("/my/list", skillController.getMySkills);
router.put("/:id", skillController.updateSkill);
router.delete("/:id", skillController.deleteSkill);

// Admin routes
router.get("/admin/all", authorize("admin"), skillController.getAllSkillsAdmin);
router.get("/admin/stats", authorize("admin"), skillController.getSkillStats);
router.patch(
  "/:id/verify",
  authorize("admin"),
  skillController.updateSkillVerification,
);

export default router;
