import Notification from "../models/Notification.model.js";
import { AppError } from "../utils/apiResponse.utils.js";

/**
 * Create a new notification
 * @param {Object} notificationData - The data for the notification
 * @returns {Promise<Object>} The created notification
 */
export const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    // TODO: Emit socket event here if needed
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new AppError("Unable to create notification. Please try again.", 500);
  }
};

/**
 * Get all notifications for a specific user
 * @param {string} userId - The ID of the recipient user
 * @param {Object} query - Optional pagination or filter query parameters
 * @returns {Promise<Object>} The list of notifications
 */
export const getUserNotifications = async (userId, query = {}) => {
  try {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const filter = { recipient: userId };
    if (query.isRead !== undefined) {
      filter.isRead = query.isRead === "true";
    }

    const total = await Notification.countDocuments(filter);
    
    const notifications = await Notification.find(filter)
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new AppError("Unable to fetch notifications. Please try again.", 500);
  }
};

/**
 * Mark a single notification as read
 * @param {string} notificationId - The ID of the notification
 * @param {string} userId - The ID of the user requesting the change
 * @returns {Promise<Object>} The updated notification
 */
export const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    notification.isRead = true;
    await notification.save();
    return notification;
  } catch (error) {
    if (error.isOperational) throw error;
    console.error("Error marking notification as read:", error);
    throw new AppError("Unable to update notification. Please try again.", 500);
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The update result
 */
export const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );
    return result;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw new AppError("Unable to update notifications. Please try again.", 500);
  }
};
