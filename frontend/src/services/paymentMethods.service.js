import { api } from '../lib/api';

/**
 * Payment Methods service — CRUD for a user's saved payment account details.
 *
 * All endpoints match the binding contract in PRD-payment-methods.md §6.
 * Backend is being built concurrently from the same PRD.
 *
 * Data shape (v1):
 * {
 *   id: string,          // "pm_abc123" — generated server-side
 *   type: string,        // "bank" | "gopay" | "ovo" | "dana" | "shopeepay" | "linkaja" | "qris"
 *   label: string,       // user-supplied display label
 *   account_number: string | null,  // bank only
 *   holder_name: string | null,     // bank only
 *   phone: string | null,           // e-wallet only
 *   qris_image_path: string | null, // qris only (Phase 4)
 *   is_primary: boolean,
 *   created_at: string,
 *   updated_at: string,
 * }
 */
export const paymentMethodsService = {
  /**
   * List the current user's own payment methods (full, unmasked).
   * GET /users/me/payment-methods
   * Response: { data: PaymentMethod[] }
   * @returns {Promise<PaymentMethod[]>}
   */
  listMy: async () => {
    const res = await api.get('/users/me/payment-methods');
    // TODO(verify-contract): PRD §6.1 wraps the array in { data: [] }; confirm the
    // backend always returns this shape (not a bare array).
    return res?.data ?? res ?? [];
  },

  /**
   * Create a new payment method.
   * POST /users/me/payment-methods
   * @param {Object} dto
   * @param {string}  dto.type          - "bank" | "gopay" | "ovo" | "dana" | "shopeepay" | "linkaja" | "qris"
   * @param {string}  dto.label         - required, 1–50 chars
   * @param {string|null} dto.account_number - required for bank, null otherwise
   * @param {string|null} dto.holder_name    - required for bank, null otherwise
   * @param {string|null} dto.phone          - required for e-wallet, null otherwise
   * @param {string|null} dto.qris_image_path - Phase 4 only
   * @param {boolean} dto.is_primary
   * @returns {Promise<PaymentMethod>} - the created object (201)
   */
  create: (dto) => api.post('/users/me/payment-methods', dto),

  /**
   * Update an existing payment method (fields only; type is immutable).
   * PUT /users/me/payment-methods/{id}
   * @param {string} id  - the method id ("pm_abc123")
   * @param {Object} dto - subset of mutable fields
   * @returns {Promise<PaymentMethod>} - the updated object (200)
   */
  update: (id, dto) => api.put(`/users/me/payment-methods/${id}`, dto),

  /**
   * Delete a payment method by id.
   * DELETE /users/me/payment-methods/{id}
   * @param {string} id
   * @returns {Promise<null>} - 204 No Content (api client returns null)
   */
  delete: (id) => api.delete(`/users/me/payment-methods/${id}`),

  /**
   * Get another user's payment methods (masked — last-4 only for account_number/phone).
   * Only succeeds if the requester is a group co-member of the target user (RLS guard on backend).
   * GET /users/{userId}/payment-methods
   * @param {string} userId
   * @returns {Promise<PaymentMethod[]>}
   */
  listForUser: async (userId) => {
    const res = await api.get(`/users/${userId}/payment-methods`);
    // TODO(verify-contract): confirm the peer endpoint also wraps in { data: [] }
    return res?.data ?? res ?? [];
  },
};
