import { api } from '../lib/api';

/**
 * Payments service for managing arisan payment transactions
 */
export const paymentsService = {
  /**
   * Get all payments for the current user
   * @returns {Promise<Array>} List of user's payments
   */
  getMine: () => api.get('/payments/me'),

  /**
   * Get all payments for a specific group
   * @param {string} groupId - Group ID
   * @returns {Promise<Array>} List of group payments
   */
  getForGroup: (groupId) => api.get(`/payments/group/${groupId}`),

  /**
   * Get all payments for a specific round
   * @param {string} roundId - Round ID
   * @returns {Promise<Array>} List of round payments
   */
  getForRound: (roundId) => api.get(`/payments/round/${roundId}`),

  /**
   * Create a new payment
   * @param {Object} data - Payment creation data (amount, round_id, proof_url, etc.)
   * @returns {Promise<Object>} Created payment
   */
  create: (data) => api.post('/payments', data),

  /**
   * Confirm a payment (admin/recipient action)
   * @param {string} id - Payment ID
   * @returns {Promise<Object>} Confirmed payment
   */
  confirm: (id) => api.patch(`/payments/${id}/confirm`),

  /**
   * Reject a payment with reason (admin/recipient action)
   * @param {string} id - Payment ID
   * @param {Object} data - Rejection data (reason, notes, etc.)
   * @returns {Promise<Object>} Rejected payment
   */
  reject: (id, data) => api.patch(`/payments/${id}/reject`, data),
};
