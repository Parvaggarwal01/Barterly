import api from "./api";

const reportService = {
  /**
   * Submit a report against a user
   * @param {Object} data - { reportedUserId, barterId, reason, description }
   */
  submitReport: async (data) => {
    const response = await api.post("/reports", data);
    return response.data;
  },

  /**
   * Get all reports (admin)
   * @param {Object} params - Query parameters
   */
  getAllReports: async (params = {}) => {
    const response = await api.get("/reports/admin/all", { params });
    return response.data;
  },

  /**
   * Update report status (admin)
   * @param {string} id - Report ID
   * @param {string} status - New status
   * @param {string} adminNote - Admin note
   */
  updateReportStatus: async (id, status, adminNote) => {
    const response = await api.patch(`/reports/admin/${id}/status`, {
      status,
      adminNote,
    });
    return response.data;
  },
};

export default reportService;
