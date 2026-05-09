import api from "./api";

/**
 * Auth Service
 * Handles all authentication-related API calls
 */

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise<Object>} - User data and access token
   */
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      // Store access token and user data
      if (response.data.data.accessToken) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} - User data and access token
   */
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);

      // Store access token and user data
      if (response.data.data.accessToken) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Verify email with OTP
   * @param {Object} verificationData - Verification data
   * @param {string} verificationData.email - User's email
   * @param {string} verificationData.otp - 6-digit OTP code
   * @returns {Promise<Object>} - Verification result
   */
  verifyEmail: async (verificationData) => {
    try {
      const response = await api.post("/auth/verify-email", verificationData);

      // Update user data in localStorage if email is verified
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user) {
        user.isVerified = true;
        localStorage.setItem("user", JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Resend verification email
   * Requires authentication
   * @returns {Promise<Object>} - Result message
   */
  resendVerification: async () => {
    try {
      const response = await api.post("/auth/resend-verification");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>} - Logout result
   */
  logout: async () => {
    try {
      const response = await api.post("/auth/logout");

      // Clear stored data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      return response.data;
    } catch (error) {
      // Clear local data even if API call fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      throw error.response?.data || error;
    }
  },

  /**
   * Forgot password - request reset OTP
   * @param {string} email - User's email
   * @returns {Promise<Object>} - Result message
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Reset password with OTP
   * @param {string} email - User's email
   * @param {string} otp - 6-digit OTP
   * @param {string} password - New password
   * @param {string} confirmPassword - Confirm new password
   * @returns {Promise<Object>} - Result message
   */
  resetPassword: async (email, otp, password, confirmPassword) => {
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        password,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get current user data
   * Requires authentication
   * @returns {Promise<Object>} - User data
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");

      // Update stored user data
      if (response.data.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("accessToken");
  },

  /**
   * Get stored user data
   * @returns {Object|null} - User data or null
   */
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
