import api from "./api";

const barterService = {
  /**
   * Create a new barter request
   * @param {Object} barterData - Barter request data
   * @param {string} barterData.receiverId - Receiver user ID
   * @param {string} barterData.offeredSkillId - Offered skill ID
   * @param {string} barterData.requestedSkillId - Requested skill ID
   * @param {string} barterData.message - Optional message
   * @returns {Promise<Object>} Created barter request
   */
  createBarterRequest: async (barterData) => {
    const response = await api.post("/barters", barterData);
    return response.data;
  },

  /**
   * Get current user's barter requests with filters
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status (pending/accepted/rejected/cancelled/completed/all)
   * @param {string} params.type - Filter by type (sent/received/all, default: 'all')
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.sortBy - Sort field (default: 'createdAt')
   * @param {string} params.order - Sort order (asc/desc, default: 'desc')
   * @returns {Promise<Object>} Barter requests and pagination data
   */
  getMyBarters: async (params = {}) => {
    const response = await api.get("/barters/my", { params });
    return response.data;
  },

  /**
   * Get single barter request by ID
   * @param {string} id - Barter request ID
   * @returns {Promise<Object>} Barter request details
   */
  getBarterById: async (id) => {
    const response = await api.get(`/barters/${id}`);
    return response.data;
  },

  /**
   * Accept a barter request (receiver only)
   * @param {string} id - Barter request ID
   * @returns {Promise<Object>} Updated barter request
   */
  acceptBarter: async (id) => {
    const response = await api.put(`/barters/${id}/accept`);
    return response.data;
  },

  /**
   * Reject a barter request (receiver only)
   * @param {string} id - Barter request ID
   * @param {string} reason - Optional rejection reason
   * @returns {Promise<Object>} Updated barter request
   */
  rejectBarter: async (id, reason = "") => {
    const response = await api.put(`/barters/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Make a counter offer (receiver only)
   * @param {string} id - Barter request ID
   * @param {Object} counterData - Counter offer data
   * @param {string} counterData.message - Counter offer message
   * @param {string} counterData.offeredSkillId - Counter offered skill ID
   * @returns {Promise<Object>} Updated barter request
   */
  counterOffer: async (id, counterData) => {
    const response = await api.put(`/barters/${id}/counter`, counterData);
    return response.data;
  },

  /**
   * Cancel a barter request (sender only)
   * @param {string} id - Barter request ID
   * @returns {Promise<Object>} Updated barter request
   */
  cancelBarter: async (id) => {
    const response = await api.put(`/barters/${id}/cancel`);
    return response.data;
  },

  /**
   * Mark barter as completed (sender or receiver)
   * @param {string} id - Barter request ID
   * @returns {Promise<Object>} Updated barter request
   */
  completeBarter: async (id) => {
    const response = await api.put(`/barters/${id}/complete`);
    return response.data;
  },

  /**
   * Get barter statistics for current user
   * @returns {Promise<Object>} Barter statistics
   */
  getBarterStats: async () => {
    const response = await api.get("/barters/stats");
    return response.data;
  },
};

export default barterService;
