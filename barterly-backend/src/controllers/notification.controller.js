import * as notificationService from "../services/notification.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.utils.js";


export const getMyNotifications = async (req, res) => {
  try {
    const result = await notificationService.getUserNotifications(
      req.user.id,
      req.query
    );
    return successResponse(
      res,
      200,
      "Notifications retrieved successfully",
      result
    );
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};


export const markRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );
    return successResponse(
      res,
      200,
      "Notification marked as read",
      notification
    );
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};


export const markAllRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return successResponse(res, 200, "All notifications marked as read");
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};
