import express from "express";
import * as skillController from "../controllers/skill.controller.js";
import { authenticate, checkRole } from "../middlewares/auth.middleware.js";

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
router.get("/admin/all", checkRole("admin"), skillController.getAllSkillsAdmin);
router.get("/admin/stats", checkRole("admin"), skillController.getSkillStats);
router.patch(
  "/:id/verify",
  checkRole("admin"),
  skillController.updateSkillVerification,
);

export default router;
