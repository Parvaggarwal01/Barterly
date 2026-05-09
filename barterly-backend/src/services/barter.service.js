import BarterRequest from "../models/BarterRequest.model.js";
import Skill from "../models/Skill.model.js";
import User from "../models/User.model.js";
import { AppError } from "../utils/apiResponse.utils.js";

/**
 * Create a new barter request
 * @param {Object} barterData - Barter request data
 * @param {String} senderId - User ID sending the request
 * @returns {Object} Created barter request
 */
export const createBarterRequest = async (barterData, senderId) => {
  console.log("🔧 Service function reached");
  console.log("🔧 barterData:", JSON.stringify(barterData, null, 2));
  console.log("🔧 senderId:", senderId.toString());

  const { receiverId, offeredSkillId, requestedSkillId, message } = barterData;

  // Validate sender is not the same as receiver
  if (senderId.toString() === receiverId.toString()) {
    throw new AppError("You cannot send a barter request to yourself", 400);
  }

  // Check if receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver || !receiver.isActive) {
    throw new AppError("Receiver not found or inactive", 404);
  }

  // Verify sender owns the offered skill
  const offeredSkill = await Skill.findById(offeredSkillId);
  if (!offeredSkill || !offeredSkill.isActive) {
    throw new AppError("Offered skill not found or inactive", 404);
  }
  if (offeredSkill.offeredBy.toString() !== senderId.toString()) {
    throw new AppError("You can only offer your own skills", 403);
  }

  // Verify receiver owns the requested skill
  const requestedSkill = await Skill.findById(requestedSkillId);
  if (!requestedSkill || !requestedSkill.isActive) {
    throw new AppError("Requested skill not found or inactive", 404);
  }
  if (requestedSkill.offeredBy.toString() !== receiverId.toString()) {
    throw new AppError(
      "The requested skill does not belong to the receiver",
      400,
    );
  }

  // Check for duplicate pending requests
  const existingRequest = await BarterRequest.findOne({
    sender: senderId,
    receiver: receiverId,
    offeredSkill: offeredSkillId,
    requestedSkill: requestedSkillId,
    status: "pending",
  });

  if (existingRequest) {
    throw new AppError(
      "You already have a pending request for this skill exchange",
      400,
    );
  }

  // Create barter request
  const barterRequest = await BarterRequest.create({
    sender: senderId,
    receiver: receiverId,
    offeredSkill: offeredSkillId,
    requestedSkill: requestedSkillId,
    message,
  });

  // Populate fields
  await barterRequest.populate([
    { path: "sender", select: "name email avatar location averageRating" },
    { path: "receiver", select: "name email avatar location averageRating" },
    {
      path: "offeredSkill",
      select: "title description category level deliveryMode",
    },
    {
      path: "requestedSkill",
      select: "title description category level deliveryMode",
    },
  ]);

  return barterRequest;
};

/**
 * Get user's barter requests with filters and pagination
 * @param {String} userId - User ID
 * @param {Object} filters - Filter options
 * @param {Object} options - Pagination options
 * @returns {Object} Barter requests and metadata
 */
export const getMyBarters = async (userId, filters = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
  } = options;

  // Build query
  const query = {};

  // Filter by type (sent, received, all)
  if (filters.type === "sent") {
    query.sender = userId;
  } else if (filters.type === "received") {
    query.receiver = userId;
  } else {
    query.$or = [{ sender: userId }, { receiver: userId }];
  }

  // Filter by status
  if (filters.status && filters.status !== "all") {
    query.status = filters.status;
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: order === "asc" ? 1 : -1 };

  // Execute query
  const [barters, total] = await Promise.all([
    BarterRequest.find(query)
      .populate("sender", "name email avatar location averageRating")
      .populate("receiver", "name email avatar location averageRating")
      .populate("offeredSkill", "title description category level deliveryMode")
      .populate(
        "requestedSkill",
        "title description category level deliveryMode",
      )
      .populate("counterOffer.offeredSkill", "title description category level")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    BarterRequest.countDocuments(query),
  ]);

  return {
    barters,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNextPage: skip + barters.length < total,
      hasPrevPage: parseInt(page) > 1,
    },
  };
};

/**
 * Get single barter request by ID
 * @param {String} barterId - Barter request ID
 * @param {String} userId - User ID making the request
 * @returns {Object} Barter request
 */
export const getBarterById = async (barterId, userId) => {
  const barter = await BarterRequest.findById(barterId)
    .populate("sender", "name email avatar location averageRating bio")
    .populate("receiver", "name email avatar location averageRating bio")
    .populate("offeredSkill")
    .populate("requestedSkill")
    .populate("counterOffer.offeredSkill");

  if (!barter) {
    throw new AppError("Barter request not found", 404);
  }

  // Check if user is part of this barter
  if (
    barter.sender._id.toString() !== userId.toString() &&
    barter.receiver._id.toString() !== userId.toString()
  ) {
    throw new AppError(
      "You are not authorized to view this barter request",
      403,
    );
  }

  return barter;
};

/**
 * Accept a barter request
 * @param {String} barterId - Barter request ID
 * @param {String} userId - User ID (must be receiver)
 * @returns {Object} Updated barter request
 */
export const acceptBarter = async (barterId, userId) => {
  const barter = await BarterRequest.findById(barterId);

  if (!barter) {
    throw new AppError("Barter request not found", 404);
  }

  // Only receiver can accept
  if (barter.receiver.toString() !== userId.toString()) {
    throw new AppError("Only the receiver can accept this request", 403);
  }

  // Can only accept pending requests
  if (barter.status !== "pending") {
    throw new AppError(`Cannot accept a ${barter.status} request`, 400);
  }

  // Update status
  barter.status = "accepted";
  await barter.save();

  // Populate fields
  await barter.populate([
    { path: "sender", select: "name email avatar location" },
    { path: "receiver", select: "name email avatar location" },
    { path: "offeredSkill", select: "title description" },
    { path: "requestedSkill", select: "title description" },
  ]);

  return barter;
};

/**
 * Reject a barter request
 * @param {String} barterId - Barter request ID
 * @param {String} userId - User ID (must be receiver)
 * @param {String} reason - Optional rejection reason
 * @returns {Object} Updated barter request
 */
export const rejectBarter = async (barterId, userId, reason) => {
  const barter = await BarterRequest.findById(barterId);

  if (!barter) {
    throw new AppError("Barter request not found", 404);
  }

  // Only receiver can reject
  if (barter.receiver.toString() !== userId.toString()) {
    throw new AppError("Only the receiver can reject this request", 403);
  }

  // Can only reject pending requests
  if (barter.status !== "pending") {
    throw new AppError(`Cannot reject a ${barter.status} request`, 400);
  }

  // Update status
  barter.status = "rejected";
  if (reason) {
    barter.rejectionReason = reason;
  }
  await barter.save();

  // Populate fields
  await barter.populate([
    { path: "sender", select: "name email avatar" },
    { path: "receiver", select: "name email avatar" },
  ]);

  return barter;
};

/**
 * Counter offer on a barter request
 * @param {String} barterId - Barter request ID
 * @param {String} userId - User ID (must be receiver)
 * @param {Object} counterData - Counter offer data
 * @returns {Object} Updated barter request
 */
export const counterOffer = async (barterId, userId, counterData) => {
  const { message, offeredSkillId } = counterData;

  const barter = await BarterRequest.findById(barterId);

  if (!barter) {
    throw new AppError("Barter request not found", 404);
  }

  // Only receiver can counter
  if (barter.receiver.toString() !== userId.toString()) {
    throw new AppError("Only the receiver can make a counter offer", 403);
  }

  // Can only counter pending requests
  if (barter.status !== "pending") {
    throw new AppError(`Cannot counter a ${barter.status} request`, 400);
  }

  // Verify the counter offered skill belongs to receiver
  const counterSkill = await Skill.findById(offeredSkillId);
  if (!counterSkill || !counterSkill.isActive) {
    throw new AppError("Counter offered skill not found or inactive", 404);
  }
  if (counterSkill.offeredBy.toString() !== userId.toString()) {
    throw new AppError("You can only offer your own skills in counter", 403);
  }

  // Update counter offer
  barter.counterOffer = {
    message,
    offeredSkill: offeredSkillId,
    createdAt: new Date(),
  };
  await barter.save();

  // Populate fields
  await barter.populate([
    { path: "sender", select: "name email avatar" },
    { path: "receiver", select: "name email avatar" },
    { path: "offeredSkill", select: "title description" },
    { path: "requestedSkill", select: "title description" },
    {
      path: "counterOffer.offeredSkill",
      select: "title description category level",
    },
  ]);

  return barter;
};

/**
 * Cancel a barter request
 * @param {String} barterId - Barter request ID
 * @param {String} userId - User ID (must be sender)
 * @returns {Object} Updated barter request
 */
export const cancelBarter = async (barterId, userId) => {
  const barter = await BarterRequest.findById(barterId);

  if (!barter) {
    throw new AppError("Barter request not found", 404);
  }

  // Only sender can cancel
  if (barter.sender.toString() !== userId.toString()) {
    throw new AppError("Only the sender can cancel this request", 403);
  }

  // Can only cancel pending or accepted requests
  if (!["pending", "accepted"].includes(barter.status)) {
    throw new AppError(`Cannot cancel a ${barter.status} request`, 400);
  }

  // Update status
  barter.status = "cancelled";
  await barter.save();

  // Populate fields
  await barter.populate([
    { path: "sender", select: "name email avatar" },
    { path: "receiver", select: "name email avatar" },
  ]);

  return barter;
};

/**
 * Mark barter as completed
 * @param {String} barterId - Barter request ID
 * @param {String} userId - User ID (must be sender or receiver)
 * @returns {Object} Updated barter request
 */
export const completeBarter = async (barterId, userId) => {
  const barter = await BarterRequest.findById(barterId);

  if (!barter) {
    throw new AppError("Barter request not found", 404);
  }

  // Must be sender or receiver
  const isSender = barter.sender.toString() === userId.toString();
  const isReceiver = barter.receiver.toString() === userId.toString();

  if (!isSender && !isReceiver) {
    throw new AppError("You are not authorized to complete this barter", 403);
  }

  // Can only complete accepted requests
  if (barter.status !== "accepted") {
    throw new AppError("Only accepted barters can be marked as completed", 400);
  }

  // Update status
  barter.status = "completed";
  barter.completedAt = new Date();
  await barter.save();

  // Update user statistics
  await Promise.all([
    User.findByIdAndUpdate(barter.sender, { $inc: { totalBarters: 1 } }),
    User.findByIdAndUpdate(barter.receiver, { $inc: { totalBarters: 1 } }),
  ]);

  // Populate fields
  await barter.populate([
    { path: "sender", select: "name email avatar totalBarters" },
    { path: "receiver", select: "name email avatar totalBarters" },
    { path: "offeredSkill", select: "title" },
    { path: "requestedSkill", select: "title" },
  ]);

  return barter;
};

/**
 * Get barter statistics for a user
 * @param {String} userId - User ID
 * @returns {Object} Barter statistics
 */
export const getBarterStats = async (userId) => {
  const stats = await BarterRequest.getBarterStats(userId);

  const sent = await BarterRequest.countDocuments({ sender: userId });
  const received = await BarterRequest.countDocuments({ receiver: userId });

  return {
    total: sent + received,
    sent,
    received,
    byStatus: stats,
  };
};
