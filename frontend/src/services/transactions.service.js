import { api } from '../lib/api';

/**
 * Transactions service for fetching the current user's transaction history.
 */
export const transactionsService = {
  /**
   * Get all transactions for the current user.
   * GET /transactions/me
   * @returns {Promise<Array>} List of transaction objects
   */
  getMine: () => api.get('/transactions/me'),
};
