import api from "./api";

const bookmarkService = {
  /**
   * Toggle bookmark for a skill (add or remove)
   * @param {string} skillId
   * @returns {Promise<Object>} { bookmarked: boolean, message: string }
   */
  toggleBookmark: async (skillId) => {
    const response = await api.post(`/bookmarks/${skillId}`);
    return response.data;
  },

  /**
   * Get current user's bookmarked skills
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>} { bookmarks, pagination }
   */
  getMyBookmarks: async (params = {}) => {
    const response = await api.get("/bookmarks", { params });
    return response.data;
  },

  /**
   * Check if the current user has bookmarked a skill
   * @param {string} skillId
   * @returns {Promise<Object>} { bookmarked: boolean }
   */
  checkBookmarkStatus: async (skillId) => {
    const response = await api.get(`/bookmarks/check/${skillId}`);
    return response.data;
  },
};

export default bookmarkService;
