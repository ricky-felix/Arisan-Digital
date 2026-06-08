import { api } from '../lib/api';

/**
 * User service for managing user profile data and security settings.
 */
export const usersService = {
  /**
   * Get current user profile.
   * GET /users/me
   * @returns {Promise<Object>} User profile data
   */
  getMe: () => api.get('/users/me'),

  /**
   * Alias kept for backward compatibility with existing callers that use getProfile().
   * @returns {Promise<Object>} User profile data
   */
  getProfile: () => api.get('/users/me'),

  /**
   * Update current user profile (name, phone, avatar_url).
   * PATCH /users/me  body: { name?, phone?, avatar_url? }
   * @param {Object} data - Fields to update
   * @returns {Promise<Object>} Updated user profile
   */
  updateMe: (data) => api.patch('/users/me', data),

  /**
   * Alias kept for backward compatibility.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  updateProfile: (data) => api.patch('/users/me', data),

  // ── Security / PIN ──────────────────────────────────────────────────────────

  /**
   * Get security settings for the current user.
   * GET /users/me/security → { has_pin: boolean, app_lock_enabled: boolean }
   * @returns {Promise<{ has_pin: boolean, app_lock_enabled: boolean }>}
   */
  getSecurity: () => api.get('/users/me/security'),

  /**
   * Set (or change) the current user's 6-digit PIN.
   * PATCH /users/me/pin  body: { pin: "123456" }
   * @param {string} pin - 6-digit numeric string
   * @returns {Promise<{ success: boolean }>}
   */
  setPin: (pin) => api.patch('/users/me/pin', { pin }),

  /**
   * Verify the current user's PIN without changing it.
   * POST /users/me/pin/verify  body: { pin }
   * @param {string} pin - 6-digit numeric string
   * @returns {Promise<{ valid: boolean }>}
   */
  verifyPin: (pin) => api.post('/users/me/pin/verify', { pin }),

  /**
   * Update security settings (e.g. app_lock_enabled toggle).
   * PATCH /users/me/security  body: { app_lock_enabled: boolean }
   * @param {{ app_lock_enabled: boolean }} data
   * @returns {Promise<{ has_pin: boolean, app_lock_enabled: boolean }>}
   */
  updateSecurity: (data) => api.patch('/users/me/security', data),

  // ── Bank account / payout ───────────────────────────────────────────────────

  /**
   * Get the current user's saved payout bank account.
   * GET /users/me/bank-account → account object or null
   * @returns {Promise<Object|null>}
   */
  getBankAccount: () => api.get('/users/me/bank-account'),

  /**
   * Create or replace the current user's payout bank account.
   * PUT /users/me/bank-account  body: { bank, account_number, holder_name }
   * @param {{ bank: string, account_number: string, holder_name: string }} data
   * @returns {Promise<Object>} Saved bank account object
   */
  saveBankAccount: (data) => api.put('/users/me/bank-account', data),

  /**
   * Remove the current user's saved payout bank account.
   * DELETE /users/me/bank-account → { success: true }
   * @returns {Promise<{ success: boolean }>}
   */
  deleteBankAccount: () => api.delete('/users/me/bank-account'),
};
