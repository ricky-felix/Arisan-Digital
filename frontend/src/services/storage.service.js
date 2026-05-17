import { api } from '../lib/api';

/**
 * Storage service for managing file uploads and downloads
 * Handles payment proofs, receipts, and other file attachments
 */
export const storageService = {
  /**
   * Get a presigned URL for uploading a file
   * @param {Object} data - Upload URL request data
   * @param {string} data.file_name - Name of the file to upload
   * @param {string} data.file_type - MIME type of the file
   * @param {string} data.bucket - Storage bucket name (e.g., 'payment-proofs', 'receipts')
   * @returns {Promise<Object>} Object containing upload URL and file key
   */
  getUploadUrl: (data) => api.post('/storage/upload-url', data),

  /**
   * Get a presigned URL for reading/downloading a file
   * @param {Object} data - Read URL request data
   * @param {string} data.file_key - Key/path of the file in storage
   * @param {string} data.bucket - Storage bucket name
   * @param {number} data.expires_in - URL expiration time in seconds (optional)
   * @returns {Promise<Object>} Object containing read URL
   */
  getReadUrl: (data) => api.post('/storage/read-url', data),

  /**
   * Delete a file from storage
   * @param {Object} data - Delete request data
   * @param {string} data.file_key - Key/path of the file to delete
   * @param {string} data.bucket - Storage bucket name
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteObject: (data) => api.post('/storage/delete', data),
};
