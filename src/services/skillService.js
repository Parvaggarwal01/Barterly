import api from "./api";

const skillService = {
  // ===== Public Endpoints =====

  /**
   * Get all skills with filters and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.sortBy - Sort field (default: 'createdAt')
   * @param {string} params.sortOrder - Sort order (asc/desc, default: 'desc')
   * @param {string} params.category - Category ID filter
   * @param {string} params.level - Level filter (beginner/intermediate/advanced)
   * @param {string} params.deliveryMode - Delivery mode filter (online/in-person/both)
   * @param {string} params.search - Search query
   * @returns {Promise<Object>} Skills and pagination data
   */
  getAllSkills: async (params = {}) => {
    const response = await api.get("/skills", { params });
    return response.data;
  },

  /**
   * Get skill by ID
   * @param {string} id - Skill ID
   * @returns {Promise<Object>} Skill details
   */
  getSkillById: async (id) => {
    const response = await api.get(`/skills/${id}`);
    return response.data;
  },

  /**
   * Get all skills offered by a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User's skills
   */
  getUserSkills: async (userId) => {
    const response = await api.get(`/skills/user/${userId}`);
    return response.data;
  },

  // ===== Protected Endpoints (Require Authentication) =====

  /**
   * Create a new skill
   * @param {Object} skillData - Skill data
   * @param {string} skillData.title - Skill title
   * @param {string} skillData.description - Skill description
   * @param {string} skillData.category - Category ID
   * @param {Array<string>} skillData.tags - Skill tags
   * @param {string} skillData.level - Skill level (beginner/intermediate/advanced)
   * @param {string} skillData.deliveryMode - Delivery mode (online/in-person/both)
   * @param {string} skillData.availability - Availability description
   * @returns {Promise<Object>} Created skill
   */
  createSkill: async (skillData) => {
    const response = await api.post("/skills", skillData);
    return response.data;
  },

  /**
   * Get current user's skills
   * @returns {Promise<Array>} Current user's skills
   */
  getMySkills: async () => {
    const response = await api.get("/skills/my/list");
    return response.data;
  },

  /**
   * Update a skill
   * @param {string} id - Skill ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated skill
   */
  updateSkill: async (id, updates) => {
    const response = await api.put(`/skills/${id}`, updates);
    return response.data;
  },

  /**
   * Delete a skill (soft delete)
   * @param {string} id - Skill ID
   * @returns {Promise<Object>} Success message
   */
  deleteSkill: async (id) => {
    const response = await api.delete(`/skills/${id}`);
    return response.data;
  },

  // ===== Admin Endpoints =====

  /**
   * Get all skills (admin view with inactive skills)
   * @param {Object} params - Query parameters
   * @param {string} params.verificationStatus - Filter by status (pending/approved/rejected)
   * @param {boolean} params.isActive - Filter by active status
   * @returns {Promise<Object>} Skills and pagination data
   */
  getAllSkillsAdmin: async (params = {}) => {
    const response = await api.get("/skills/admin/all", { params });
    console.log(response);
    
    return response.data;
  },

  /**
   * Update skill verification status (admin only)
   * @param {string} id - Skill ID
   * @param {string} status - Verification status (approved/rejected)
   * @param {string} note - Optional verification note
   * @returns {Promise<Object>} Updated skill
   */
  updateSkillVerification: async (id, status, note = "") => {
    const response = await api.patch(`/skills/${id}/verify`, { status, note });
    return response.data;
  },

  /**
   * Get skill statistics (admin only)
   * @returns {Promise<Object>} Skill stats
   */
  getSkillStats: async () => {
    const response = await api.get("/skills/admin/stats");
    return response.data;
  },
};

export default skillService;
