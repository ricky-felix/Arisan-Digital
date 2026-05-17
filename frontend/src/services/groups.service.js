import { api } from '../lib/api';

/**
 * Groups service for managing arisan groups
 */
export const groupsService = {
  /**
   * Get all groups for the current user
   * @returns {Promise<Array>} List of groups
   */
  list: () => api.get('/groups'),

  /**
   * Get a specific group by ID
   * @param {string} id - Group ID
   * @returns {Promise<Object>} Group details
   */
  getById: (id) => api.get(`/groups/${id}`),

  /**
   * Create a new group
   * @param {Object} data - Group creation data
   * @returns {Promise<Object>} Created group
   */
  create: (data) => api.post('/groups', data),

  /**
   * Update an existing group
   * @param {string} id - Group ID
   * @param {Object} data - Group update data
   * @returns {Promise<Object>} Updated group
   */
  update: (id, data) => api.patch(`/groups/${id}`, data),

  /**
   * Delete a group
   * @param {string} id - Group ID
   * @returns {Promise<void>}
   */
  delete: (id) => api.delete(`/groups/${id}`),
};

/**
 * Group members service for managing group membership
 */
export const groupMembersService = {
  /**
   * Get all members of a group
   * @param {string} groupId - Group ID
   * @returns {Promise<Array>} List of group members
   */
  list: (groupId) => api.get(`/groups/${groupId}/members`),

  /**
   * Add a member to a group
   * @param {string} groupId - Group ID
   * @param {Object} data - Member data
   * @returns {Promise<Object>} Added member
   */
  add: (groupId, data) => api.post(`/groups/${groupId}/members`, data),

  /**
   * Remove a member from a group
   * @param {string} groupId - Group ID
   * @param {string} memberId - Member ID
   * @returns {Promise<void>}
   */
  remove: (groupId, memberId) => api.delete(`/groups/${groupId}/members/${memberId}`),

  /**
   * Assign giliran (turn order) to a member
   * @param {string} groupId - Group ID
   * @param {string} memberId - Member ID
   * @param {Object} data - Giliran assignment data
   * @returns {Promise<Object>} Updated member
   */
  assignGiliran: (groupId, memberId, data) =>
    api.patch(`/groups/${groupId}/members/${memberId}/giliran`, data),
};

/**
 * Rounds service for managing arisan rounds
 */
export const roundsService = {
  /**
   * Get all rounds for a specific group
   * @param {string} groupId - Group ID
   * @returns {Promise<Array>} List of rounds
   */
  list: (groupId) => api.get(`/rounds/group/${groupId}`),

  /**
   * Get the current active round for a group
   * @param {string} groupId - Group ID
   * @returns {Promise<Object>} Current round details
   */
  getCurrent: (groupId) => api.get(`/rounds/group/${groupId}/current`),

  /**
   * Set the recipient for a round
   * @param {string} roundId - Round ID
   * @param {Object} data - Recipient assignment data
   * @returns {Promise<Object>} Updated round
   */
  setRecipient: (roundId, data) => api.patch(`/rounds/${roundId}/recipient`, data),

  /**
   * Perform a random draw for a round
   * @param {string} roundId - Round ID
   * @returns {Promise<Object>} Draw result with selected recipient
   */
  draw: (roundId) => api.post(`/rounds/${roundId}/draw`),
};

/**
 * Invite links service for managing group invitations
 */
export const inviteLinksService = {
  /**
   * Create an invite link for a group
   * @param {string} groupId - Group ID
   * @param {Object} data - Invite link configuration (expiry, max uses, etc.)
   * @returns {Promise<Object>} Created invite link
   */
  create: (groupId, data) => api.post(`/invite-links`, { group_id: groupId, ...data }),

  /**
   * Validate an invite code
   * @param {string} code - Invite code
   * @returns {Promise<Object>} Validation result with group details
   */
  validate: (code) => api.get(`/invite-links/validate/${code}`),

  /**
   * Join a group using an invite code
   * @param {string} code - Invite code
   * @returns {Promise<Object>} Joined group details
   */
  join: (code) => api.post(`/invite-links/join/${code}`),
};
