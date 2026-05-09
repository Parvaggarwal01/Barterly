import express from "express";
import * as barterController from "../controllers/barter.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createBarterRequestSchema,
  counterOfferSchema,
  rejectBarterSchema,
  getBartersQuerySchema,
  barterIdParamSchema,
} from "../validations/barter.validation.js";

const router = express.Router();

// All barter routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/barters
 * @desc    Create a new barter request
 * @access  Private
 */
router.post(
  "/",
  validate(createBarterRequestSchema),
  barterController.createBarterRequest,
);

/**
 * @route   GET /api/barters/stats
 * @desc    Get current user's barter statistics
 * @access  Private
 */
router.get("/stats", barterController.getBarterStats);

/**
 * @route   GET /api/barters/my
 * @desc    Get current user's barter requests (sent + received)
 * @access  Private
 */
router.get(
  "/my",
  validate(getBartersQuerySchema),
  barterController.getMyBarters,
);

/**
 * @route   GET /api/barters/:id
 * @desc    Get single barter request by ID
 * @access  Private
 */
router.get(
  "/:id",
  validate(barterIdParamSchema),
  barterController.getBarterById,
);

/**
 * @route   PUT /api/barters/:id/accept
 * @desc    Accept a barter request (receiver only)
 * @access  Private
 */
router.put(
  "/:id/accept",
  validate(barterIdParamSchema),
  barterController.acceptBarter,
);

/**
 * @route   PUT /api/barters/:id/reject
 * @desc    Reject a barter request (receiver only)
 * @access  Private
 */
router.put(
  "/:id/reject",
  validate(barterIdParamSchema),
  validate(rejectBarterSchema),
  barterController.rejectBarter,
);

/**
 * @route   PUT /api/barters/:id/counter
 * @desc    Make a counter offer (receiver only)
 * @access  Private
 */
router.put(
  "/:id/counter",
  validate(barterIdParamSchema),
  validate(counterOfferSchema),
  barterController.counterOffer,
);

/**
 * @route   PUT /api/barters/:id/cancel
 * @desc    Cancel a barter request (sender only)
 * @access  Private
 */
router.put(
  "/:id/cancel",
  validate(barterIdParamSchema),
  barterController.cancelBarter,
);

/**
 * @route   PUT /api/barters/:id/complete
 * @desc    Mark barter as completed (sender or receiver)
 * @access  Private
 */
router.put(
  "/:id/complete",
  validate(barterIdParamSchema),
  barterController.completeBarter,
);

export default router;
