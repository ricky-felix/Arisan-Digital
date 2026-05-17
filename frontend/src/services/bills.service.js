import { api } from '../lib/api';

/**
 * Bills service for managing shared expense bills
 */
export const billsService = {
  /**
   * Get all bills for the current user
   * @returns {Promise<Array>} List of bills
   */
  list: () => api.get('/bills'),

  /**
   * Get a specific bill by ID
   * @param {string} id - Bill ID
   * @returns {Promise<Object>} Bill details
   */
  getById: (id) => api.get(`/bills/${id}`),

  /**
   * Create a new bill
   * @param {Object} data - Bill creation data (title, total_amount, description, etc.)
   * @returns {Promise<Object>} Created bill
   */
  create: (data) => api.post('/bills', data),

  /**
   * Update an existing bill
   * @param {string} id - Bill ID
   * @param {Object} data - Bill update data
   * @returns {Promise<Object>} Updated bill
   */
  update: (id, data) => api.patch(`/bills/${id}`, data),

  /**
   * Delete a bill
   * @param {string} id - Bill ID
   * @returns {Promise<void>}
   */
  delete: (id) => api.delete(`/bills/${id}`),

  /**
   * Mark a bill as fully settled
   * @param {string} id - Bill ID
   * @returns {Promise<Object>} Updated bill
   */
  markSettled: (id) => api.patch(`/bills/${id}/settle`),
};

/**
 * Bill participants service for managing bill participants
 */
export const billParticipantsService = {
  /**
   * Add a participant to a bill
   * @param {string} billId - Bill ID
   * @param {Object} data - Participant data (user_id, share_amount, etc.)
   * @returns {Promise<Object>} Added participant
   */
  add: (billId, data) => api.post(`/bills/${billId}/participants`, data),

  /**
   * Remove a participant from a bill
   * @param {string} billId - Bill ID
   * @param {string} participantId - Participant ID
   * @returns {Promise<void>}
   */
  remove: (billId, participantId) => api.delete(`/bills/${billId}/participants/${participantId}`),
};

/**
 * Bill settlements service for managing payment settlements
 */
export const billSettlementsService = {
  /**
   * Get all settlements for a specific bill
   * @param {string} billId - Bill ID
   * @returns {Promise<Array>} List of settlements
   */
  list: (billId) => api.get(`/settlements/bill/${billId}`),

  /**
   * Get all settlements involving the current user
   * @returns {Promise<Array>} List of user's settlements
   */
  getMine: () => api.get('/settlements/me'),

  /**
   * Create a new settlement
   * @param {Object} data - Settlement data (bill_id, from_user_id, to_user_id, amount, etc.)
   * @returns {Promise<Object>} Created settlement
   */
  create: (data) => api.post('/settlements', data),

  /**
   * Confirm a settlement (recipient action)
   * @param {string} id - Settlement ID
   * @returns {Promise<Object>} Confirmed settlement
   */
  confirm: (id) => api.patch(`/settlements/${id}/confirm`),

  /**
   * Reject a settlement with reason (recipient action)
   * @param {string} id - Settlement ID
   * @param {Object} data - Rejection data (reason, notes, etc.)
   * @returns {Promise<Object>} Rejected settlement
   */
  reject: (id, data) => api.patch(`/settlements/${id}/reject`, data),
};

/**
 * Bill comments service for managing bill discussion
 */
export const billCommentsService = {
  /**
   * Get all comments for a bill
   * @param {string} billId - Bill ID
   * @returns {Promise<Array>} List of comments
   */
  list: (billId) => api.get(`/bills/${billId}/comments`),

  /**
   * Create a new comment on a bill
   * @param {string} billId - Bill ID
   * @param {Object} data - Comment data (content, mentions, etc.)
   * @returns {Promise<Object>} Created comment
   */
  create: (billId, data) => api.post(`/bills/${billId}/comments`, data),

  /**
   * Update an existing comment
   * @param {string} billId - Bill ID
   * @param {string} commentId - Comment ID
   * @param {Object} data - Updated comment data
   * @returns {Promise<Object>} Updated comment
   */
  update: (billId, commentId, data) => api.patch(`/bills/${billId}/comments/${commentId}`, data),

  /**
   * Delete a comment
   * @param {string} billId - Bill ID
   * @param {string} commentId - Comment ID
   * @returns {Promise<void>}
   */
  delete: (billId, commentId) => api.delete(`/bills/${billId}/comments/${commentId}`),
};

/**
 * Recurring bills service for managing repeating bills
 */
export const recurringBillsService = {
  /**
   * Get all recurring bills
   * @returns {Promise<Array>} List of recurring bills
   */
  list: () => api.get('/recurring-bills'),

  /**
   * Get a specific recurring bill by ID
   * @param {string} id - Recurring bill ID
   * @returns {Promise<Object>} Recurring bill details
   */
  getById: (id) => api.get(`/recurring-bills/${id}`),

  /**
   * Create a new recurring bill
   * @param {Object} data - Recurring bill data (title, amount, frequency, etc.)
   * @returns {Promise<Object>} Created recurring bill
   */
  create: (data) => api.post('/recurring-bills', data),

  /**
   * Update an existing recurring bill
   * @param {string} id - Recurring bill ID
   * @param {Object} data - Updated recurring bill data
   * @returns {Promise<Object>} Updated recurring bill
   */
  update: (id, data) => api.patch(`/recurring-bills/${id}`, data),

  /**
   * Delete a recurring bill
   * @param {string} id - Recurring bill ID
   * @returns {Promise<void>}
   */
  delete: (id) => api.delete(`/recurring-bills/${id}`),
};

/**
 * Debt simplification service for optimizing payment flows
 */
export const debtSimplificationService = {
  /**
   * Calculate optimized payment flows for a bill
   * @param {string} billId - Bill ID
   * @returns {Promise<Object>} Simplified debt structure
   */
  calculate: (billId) => api.get(`/debt-simplifications/bill/${billId}`),

  /**
   * Apply simplified debt structure to a bill
   * @param {string} billId - Bill ID
   * @returns {Promise<Object>} Updated bill with simplified settlements
   */
  apply: (billId) => api.post(`/debt-simplifications/bill/${billId}/apply`),
};
