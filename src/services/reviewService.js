import api from "./api";

const reviewService = {
  /**
   * Submit a review for a completed barter
   * @param {Object} data - { barterId, rating, comment }
   */
  createReview: async (data) => {
    const response = await api.post("/reviews", data);
    return response.data;
  },

  /**
   * Get all reviews for a user (public)
   * @param {string} userId
   * @param {Object} params - { page, limit }
   */
  getUserReviews: async (userId, params = {}) => {
    const response = await api.get(`/reviews/user/${userId}`, { params });
    return response.data;
  },

  /**
   * Check if current user has reviewed a specific barter
   * @param {string} barterId
   */
  checkReviewStatus: async (barterId) => {
    const response = await api.get(`/reviews/check/${barterId}`);
    return response.data;
  },

  /**
   * Get reviews written by the current user
   * @param {Object} params - { page, limit }
   */
  getMyReviews: async (params = {}) => {
    const response = await api.get("/reviews/my", { params });
    return response.data;
  },
  /**
   * Get all reviews (public)
   * @param {Object} params - { page, limit }
   */
  getAllReviews: async (params = {}) => {
    const response = await api.get("/reviews", { params });
    return response.data;
  },
};

export default reviewService;
