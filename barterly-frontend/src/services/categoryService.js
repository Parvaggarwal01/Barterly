import api from "./api";

const categoryService = {
  // ===== Public Endpoints =====

  /**
   * Get all categories
   * @param {boolean} isActive - Filter by active status
   * @returns {Promise<Array>} Categories array
   */
  getAllCategories: async (isActive = true) => {
    const params = {};
    if (isActive !== undefined) {
      params.isActive = isActive;
    }
    const response = await api.get("/categories", { params });
    return response.data;
  },

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Category details
   */
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object>} Category details
   */
  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  },

  // ===== Admin Endpoints =====

  /**
   * Create a new category (admin only)
   * @param {Object} categoryData - Category data
   * @param {string} categoryData.name - Category name
   * @param {string} categoryData.slug - Category slug
   * @param {string} categoryData.description - Category description
   * @param {string} categoryData.icon - Icon identifier
   * @returns {Promise<Object>} Created category
   */
  createCategory: async (categoryData) => {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  /**
   * Update a category (admin only)
   * @param {string} id - Category ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated category
   */
  updateCategory: async (id, updates) => {
    const response = await api.put(`/categories/${id}`, updates);
    return response.data;
  },

  /**
   * Delete a category (admin only)
   * Note: Cannot delete categories with existing skills
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Success message
   */
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  /**
   * Toggle category active status (admin only)
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Updated category
   */
  toggleCategoryStatus: async (id) => {
    const response = await api.patch(`/categories/${id}/toggle-status`);
    return response.data;
  },

  /**
   * Get category statistics (admin only)
   * @returns {Promise<Object>} Category stats
   */
  getCategoryStats: async () => {
    const response = await api.get("/categories/admin/stats");
    return response.data;
  },
};

export default categoryService;
