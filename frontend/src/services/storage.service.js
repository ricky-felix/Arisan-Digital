import { api } from '../lib/api';

/**
 * Storage service for managing file uploads and downloads.
 * Handles avatars, payment proofs, receipts, and other file attachments.
 *
 * Field names + response shapes below MATCH the backend storage controller
 * (backend/src/storage/*). Buckets are PRIVATE; reads go through signed URLs.
 */
export const storageService = {
  /**
   * Request a token-based signed upload URL.
   * @param {Object} data
   * @param {string} data.bucket - One of: 'avatars' | 'receipts' | 'payment-proofs'
   * @param {string} data.filename - Original file name (basename is used server-side)
   * @param {string} [data.content_type] - MIME type hint
   * @returns {Promise<{ bucket: string, path: string, signed_url: string, token: string }>}
   */
  getUploadUrl: (data) => api.post('/storage/upload-url', data),

  /**
   * Request a signed read URL for a private object.
   * @param {Object} data
   * @param {string} data.bucket - Storage bucket name
   * @param {string} data.path - Object path, e.g. "<userId>/<uuid>-file.jpg"
   * @param {number} [data.expires_in_seconds] - Validity in seconds (60–86400, default 3600)
   * @returns {Promise<{ signed_url: string, expires_at: string }>}
   */
  getReadUrl: (data) => api.post('/storage/read-url', data),

  /**
   * Delete a stored object. Backend mounts DELETE /storage/object with a body.
   * @param {Object} data
   * @param {string} data.bucket - Storage bucket name
   * @param {string} data.path - Object path to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteObject: (data) => api.delete('/storage/object', data),
};
