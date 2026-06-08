import { useState } from 'react';
import { groupsService } from '../services';

/**
 * useCreateGroup — wraps groupsService.create() for BuatArisan.
 *
 * Maps the form shape (used by the UI) → the API payload shape.
 * On success returns the created group object from the backend.
 */
export function useCreateGroup() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  /**
   * @param {Object} form
   * @param {string}  form.name
   * @param {string}  form.description
   * @param {string}  form.category      – group category id (e.g. 'keluarga')
   * @param {number}  form.amount       – numeric contribution amount (Rupiah)
   * @param {string}  form.frequency    – 'monthly' | 'weekly'
   * @param {string}  form.method       – 'manual' | 'random'
   * @param {string}  form.startDate    – ISO date string YYYY-MM-DD
   * @returns {Promise<Object|null>}    – created group, or null on error
   */
  async function createGroup(form) {
    setSaving(true);
    setError(null);
    try {
      // TODO(wave2-auth): Supabase anonymous session token required.
      const group = await groupsService.create({
        name: form.name.trim(),
        description: form.description?.trim() ?? '',
        category: form.category,
        contribution_amount: Math.round(form.amount),
        frequency: form.frequency,   // 'monthly' | 'weekly'
        // max_members not set at creation — members join via invite
        start_date: form.startDate,
        // The backend determines giliran order; 'random' flag is passed as metadata
        giliran_method: form.method, // 'manual' | 'random'
      });
      return group;
    } catch (err) {
      console.error('[useCreateGroup] createGroup failed:', err.message);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }

  return { saving, error, createGroup };
}
