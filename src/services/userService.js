import api from "./api";

const userService = {
  // Get current user profile
  getCurrentUserProfile: () => {
    return api.get("/users/me");
  },

  // Get user profile by ID
  getUserProfile: (id) => {
    return api.get(`/users/${id}`);
  },

  // Update profile
  updateProfile: (profileData) => {
    return api.put("/users/profile", profileData);
  },

  // Upload/update avatar
  uploadAvatar: (base64Image) => {
    return api.put("/users/avatar", { avatar: base64Image });
  },

  // Delete avatar
  deleteAvatar: () => {
    return api.delete("/users/avatar");
  },

  // Get user's reviews
  getUserReviews: (id, params = {}) => {
    return api.get(`/users/${id}/reviews`, { params });
  },

  // Get user's skills
  getUserSkills: (id, params = {}) => {
    return api.get(`/users/${id}/skills`, { params });
  },

  // Update user status (Admin)
  updateUserStatus: (id, isActive) => {
    return api.patch(`/users/admin/${id}/status`, { isActive });
  },

  // Get all users (Admin)
  getAllUsers: (params = {}) => {
    return api.get("/users/admin/all", { params });
  },
};

export default userService;
