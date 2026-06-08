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
   * @param {Object} data - Member data ({ user_id, group_role? })
   * @returns {Promise<Object>} Added member
   */
  add: (groupId, data) => api.post(`/groups/${groupId}/members`, data),

  /**
   * Remove a member from a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID (backend route is /:userId, not /:memberId)
   * @returns {Promise<void>}
   */
  remove: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),

  /**
   * Assign giliran (turn order) for one or more members.
   * Backend: POST /groups/:groupId/members/assign-giliran
   * Body: { assignments: [{ user_id: string, giliran_order: number }] }
   *
   * Previously this was PATCH …/:memberId/giliran — that route does not exist.
   *
   * @param {string} groupId - Group ID
   * @param {{ assignments: Array<{ user_id: string, giliran_order: number }> }} data
   * @returns {Promise<Object>}
   */
  assignGiliran: (groupId, data) =>
    api.post(`/groups/${groupId}/members/assign-giliran`, data),

  /**
   * Randomly shuffle the giliran order for all members in a group.
   * Backend: POST /groups/:groupId/members/random-shuffle
   *
   * @param {string} groupId - Group ID
   * @returns {Promise<Object>}
   */
  randomShuffle: (groupId) =>
    api.post(`/groups/${groupId}/members/random-shuffle`),
};

/**
 * Rounds service for managing arisan rounds
 */
export const roundsService = {
  /**
   * Get all rounds for a specific group.
   * Backend: GET /groups/:groupId/rounds
   *
   * Previously used /rounds/group/:groupId — that route does not exist.
   *
   * @param {string} groupId - Group ID
   * @returns {Promise<Array>} List of rounds
   */
  list: (groupId) => api.get(`/groups/${groupId}/rounds`),

  /**
   * Get the current (active) round for a group.
   * There is no dedicated /current endpoint on the backend.
   * This helper calls list() and picks the round with status 'active',
   * falling back to the last round in the array if none is active.
   *
   * @param {string} groupId - Group ID
   * @returns {Promise<Object|null>} The active round, or null if no rounds exist
   */
  getCurrent: async (groupId) => {
    const rounds = await roundsService.list(groupId);
    if (!Array.isArray(rounds) || rounds.length === 0) return null;
    return rounds.find(r => r.status === 'active') ?? rounds[rounds.length - 1];
  },

  /**
   * Get a single round by ID.
   * Backend: GET /rounds/:id
   *
   * @param {string} roundId - Round ID
   * @returns {Promise<Object>} Round details
   */
  getById: (roundId) => api.get(`/rounds/${roundId}`),

  /**
   * Set the recipient for a round.
   * Backend: PATCH /rounds/:id/recipient
   * Body: { recipient_id: string (UUID) }
   *
   * @param {string} roundId - Round ID
   * @param {{ recipient_id: string }} data
   * @returns {Promise<Object>} Updated round
   */
  setRecipient: (roundId, data) => api.patch(`/rounds/${roundId}/recipient`, data),

  /**
   * Activate a round.
   * Backend: POST /rounds/:id/activate
   *
   * @param {string} roundId - Round ID
   * @returns {Promise<Object>} Activated round
   */
  activate: (roundId) => api.post(`/rounds/${roundId}/activate`),

  /**
   * Mark a round as complete.
   * Backend: POST /rounds/:id/complete
   *
   * @param {string} roundId - Round ID
   * @returns {Promise<Object>} Completed round
   */
  complete: (roundId) => api.post(`/rounds/${roundId}/complete`),

  // NOTE: draw() has been removed. The backend has no /draw endpoint.
  // Recipient selection is done via setRecipient() (manual) or
  // groupMembersService.randomShuffle() (random order assignment).
};

/**
 * Invite links service for managing group invitations.
 *
 * Backend controller: @Controller('invites')
 * All routes are under /invites (NOT /invite-links — the old prefix no longer exists).
 */
export const inviteLinksService = {
  /**
   * Create an invite link for a group.
   * Backend: POST /invites
   * Body: { group_id: string (UUID), max_uses?: number, expires_at?: string (ISO date) }
   *
   * Previously posted to /invite-links — that route does not exist.
   *
   * @param {string} groupId - Group ID
   * @param {{ max_uses?: number, expires_at?: string }} data
   * @returns {Promise<Object>} Created invite link (includes .token used for redeeming)
   */
  create: (groupId, data) => api.post(`/invites`, { group_id: groupId, ...data }),

  /**
   * List all invite links for a group.
   * Backend: GET /invites/group/:groupId
   *
   * @param {string} groupId - Group ID
   * @returns {Promise<Array>} List of invite links
   */
  listForGroup: (groupId) => api.get(`/invites/group/${groupId}`),

  /**
   * Revoke (deactivate) an invite link by its record ID.
   * Backend: PATCH /invites/:id/revoke
   *
   * @param {string} id - Invite link record ID
   * @returns {Promise<Object>} Revoked invite link
   */
  revoke: (id) => api.patch(`/invites/${id}/revoke`),

  /**
   * Redeem an invite token — joins the current user to the group.
   * Backend: POST /invites/redeem/:token
   *
   * This is the single join-by-token action. There is no separate validate
   * endpoint on the backend; client-side token format checks are done in
   * useInvite.js before calling this method.
   *
   * Previously split into validate() (GET …/validate/:code) and
   * join() (POST …/join/:code) — neither route exists.
   *
   * @param {string} token - Invite token (from the invite link)
   * @returns {Promise<Object>} Joined group details
   */
  redeem: (token) => api.post(`/invites/redeem/${token}`),
};
