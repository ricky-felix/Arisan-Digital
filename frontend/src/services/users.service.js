import { api } from '../lib/api';

/**
 * User service for managing user profile data
 */
export const usersService = {
  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  getProfile: () => api.get('/users/me'),

  /**
   * Update current user profile
   * @param {Object} data - Profile update data
   * @returns {Promise<Object>} Updated user profile
   */
  updateProfile: (data) => api.patch('/users/me', data),
};
