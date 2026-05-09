import api from "./api";

const notificationService = {
  /**
   * Get logical user notifications
   * @param {Object} params - Query params like page, limit
   * @returns {Promise<Object>} Responds with user notifications data
   */
  getNotifications: (params = {}) => {
    return api.get("/notifications", { params });
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId - The notification ID
   * @returns {Promise<Object>} Result message
   */
  markAsRead: (notificationId) => {
    return api.put(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Result message
   */
  markAllAsRead: () => {
    return api.put("/notifications/read-all");
  },
};

export default notificationService;
