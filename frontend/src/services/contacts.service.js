import { api } from '../lib/api';

/**
 * Contacts service for managing user contacts and frequent collaborators
 */
export const contactsService = {
  /**
   * Get all contacts for the current user
   * @param {Object} options - Query options
   * @param {string} options.sort - Sort order (e.g., 'frequency', 'recent', 'alphabetical')
   * @param {number} options.limit - Maximum number of contacts to return
   * @returns {Promise<Array>} List of contacts
   */
  list: (options = {}) => {
    const params = new URLSearchParams();
    if (options.sort) params.append('sort', options.sort);
    if (options.limit) params.append('limit', options.limit.toString());
    return api.get(`/contacts${params.toString() ? '?' + params : ''}`);
  },

  /**
   * Get recently interacted contacts
   * @returns {Promise<Array>} List of recent contacts
   */
  getRecents: () => api.get('/contacts/recents'),

  /**
   * Create a new contact
   * @param {Object} data - Contact data (contact_user_id, nickname, etc.)
   * @returns {Promise<Object>} Created contact
   */
  create: (data) => api.post('/contacts', data),

  /**
   * Update last interaction timestamp for a contact
   * @param {Object} data - Touch data (contact_user_id)
   * @returns {Promise<Object>} Updated contact
   */
  touch: (data) => api.post('/contacts/touch', data),

  /**
   * Update an existing contact
   * @param {string} id - Contact ID
   * @param {Object} data - Updated contact data
   * @returns {Promise<Object>} Updated contact
   */
  update: (id, data) => api.patch(`/contacts/${id}`, data),

  /**
   * Delete a contact
   * @param {string} id - Contact ID
   * @returns {Promise<void>}
   */
  delete: (id) => api.delete(`/contacts/${id}`),
};
