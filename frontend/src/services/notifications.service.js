import { api } from '../lib/api';

/**
 * Notifications service for managing user notifications
 */
export const notificationsService = {
  /**
   * Get all notifications for the current user
   * @returns {Promise<Array>} List of notifications
   */
  list: () => api.get('/notifications'),

  /**
   * Get the count of unread notifications
   * @returns {Promise<Object>} Object containing unread count
   */
  getUnreadCount: () => api.get('/notifications/unread-count'),

  /**
   * Mark a specific notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  markRead: (id) => api.post(`/notifications/${id}/read`),

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Result of marking all as read
   */
  markAllRead: () => api.post('/notifications/read-all'),
};
