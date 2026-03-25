import api from "./api";

const adminService = {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats
   */
  getDashboardStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },
};

export default adminService;
