import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import * as chatController from "../controllers/chat.controller.js";

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

// Get all conversations for current user
router.get("/conversations", chatController.getMyConversations);

// Create or get conversation with a user
router.post("/conversations", chatController.createConversation);

// Get messages for a specific conversation
router.get("/conversations/:id", chatController.getConversationById);

// Send a new message to a conversation
router.post("/conversations/:id/messages", chatController.sendMessage);

export default router;
