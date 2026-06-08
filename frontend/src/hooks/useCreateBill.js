import { useState } from 'react';
import { billsService } from '../services';

/**
 * useCreateBill — wraps billsService.create() for BuatPatungan.
 *
 * Maps the form shape → the API payload shape.
 * On success returns the created bill object from the backend.
 */
export function useCreateBill() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  /**
   * @param {Object} form
   * @param {string}  form.title
   * @param {string}  form.category   – one of the CATEGORIES ids
   * @param {number}  form.total       – total bill amount in Rupiah
   * @returns {Promise<Object|null>}  – created bill, or null on error
   */
  async function createBill(form) {
    setSaving(true);
    setError(null);
    try {
      // TODO(wave2-auth): Supabase anonymous session token required.
      const bill = await billsService.create({
        title: form.title.trim(),
        total_amount: Math.round(form.total),
        description: form.category ?? '',
        split_method: 'equal', // participants join via invite; equal split applied automatically
      });
      return bill;
    } catch (err) {
      console.error('[useCreateBill] createBill failed:', err.message);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }

  return { saving, error, createBill };
}
