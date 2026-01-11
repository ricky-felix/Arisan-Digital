/**
 * Payment Server Actions
 *
 * Server-side actions for handling payment submissions, verification, and file uploads.
 * Uses Supabase for database operations and storage for payment proofs.
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { PaymentStatus } from '@/lib/types/database';

/**
 * Submits a payment with proof of payment image
 *
 * @param roundId - The round ID for this payment
 * @param formData - Form data containing payment proof and details
 * @returns Object with success status and optional error message
 */
export async function submitPayment(
  roundId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; paymentId?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Unauthorized. Please login.' };
    }

    // Extract form data
    const proofFile = formData.get('proof') as File | null;
    const paymentMethod = formData.get('paymentMethod') as string;
    // const notes = formData.get('notes') as string | null; // TODO: Add notes support

    if (!proofFile) {
      return { success: false, error: 'Bukti pembayaran harus diunggah' };
    }

    if (!paymentMethod) {
      return { success: false, error: 'Metode pembayaran harus dipilih' };
    }

    // Validate file size (max 5MB)
    if (proofFile.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Ukuran file maksimal 5MB' };
    }

    // Validate file type
    if (!proofFile.type.startsWith('image/')) {
      return { success: false, error: 'File harus berupa gambar' };
    }

    // Get round details to determine amount
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('id, group_id, groups(contribution_amount)')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return { success: false, error: 'Round tidak ditemukan' };
    }

    // Type assertion for nested relation
    const groupData = (round as { groups: { contribution_amount: number } | null }).groups;
    if (!groupData) {
      return { success: false, error: 'Data grup tidak ditemukan' };
    }

    const amount = groupData.contribution_amount;

    // Check if payment already exists
    const { data: existingPaymentData } = await supabase
      .from('payments')
      .select('id, proof_url')
      .eq('round_id', roundId)
      .eq('user_id', user.id)
      .single();

    const existingPayment = existingPaymentData as { id: string; proof_url: string | null } | null;

    // Delete old proof if it exists and we're resubmitting
    if (existingPayment?.proof_url) {
      const oldFileName = existingPayment.proof_url.split('/').pop();
      if (oldFileName) {
        await supabase.storage.from('payment-proofs').remove([oldFileName]);
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = proofFile.name.split('.').pop() || 'jpg';
    const fileName = `${roundId}_${user.id}_${timestamp}.${fileExtension}`;

    // Compress and upload image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, proofFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: 'Gagal mengunggah bukti pembayaran' };
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);

    // Create or update payment record
    if (existingPayment) {
      // Update existing payment
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          proof_url: publicUrl,
          status: 'pending' as PaymentStatus,
          paid_at: new Date().toISOString(),
        } as never)
        .eq('id', existingPayment.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return { success: false, error: 'Gagal memperbarui pembayaran' };
      }

      revalidatePath('/dashboard/payments');
      return { success: true, paymentId: existingPayment.id };
    } else {
      // Create new payment
      const { data: newPayment, error: insertError } = await supabase
        .from('payments')
        .insert({
          round_id: roundId,
          user_id: user.id,
          amount: amount,
          proof_url: publicUrl,
          status: 'pending' as PaymentStatus,
          paid_at: new Date().toISOString(),
        } as never)
        .select('id')
        .single();

      if (insertError || !newPayment) {
        console.error('Insert error:', insertError);
        return { success: false, error: 'Gagal menyimpan pembayaran' };
      }

      revalidatePath('/dashboard/payments');
      return { success: true, paymentId: (newPayment as { id: string }).id };
    }
  } catch (error) {
    console.error('Submit payment error:', error);
    return { success: false, error: 'Terjadi kesalahan pada server' };
  }
}

/**
 * Verifies a payment (admin only)
 *
 * @param paymentId - The payment ID to verify
 * @returns Object with success status and optional error message
 */
export async function verifyPayment(
  paymentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Unauthorized. Please login.' };
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, round_id, rounds(group_id)')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return { success: false, error: 'Pembayaran tidak ditemukan' };
    }

    // Type assertion for nested relation
    const roundData = (payment as { rounds: { group_id: string } | null }).rounds;
    if (!roundData) {
      return { success: false, error: 'Data round tidak ditemukan' };
    }

    // Check if user is admin of this group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('is_admin')
      .eq('group_id', roundData.group_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !(membership as { is_admin: boolean } | null)?.is_admin) {
      return { success: false, error: 'Hanya admin yang dapat memverifikasi pembayaran' };
    }

    // Update payment status to paid
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'paid' as PaymentStatus,
      } as never)
      .eq('id', paymentId);

    if (updateError) {
      console.error('Verify payment error:', updateError);
      return { success: false, error: 'Gagal memverifikasi pembayaran' };
    }

    revalidatePath('/dashboard/payments');
    return { success: true };
  } catch (error) {
    console.error('Verify payment error:', error);
    return { success: false, error: 'Terjadi kesalahan pada server' };
  }
}

/**
 * Gets all payments for a specific round
 *
 * @param roundId - The round ID
 * @returns Array of payments with user details
 */
export async function getRoundPayments(roundId: string) {
  try {
    const supabase = await createClient();

    const { data: payments, error } = await supabase
      .from('payments')
      .select(
        `
        id,
        user_id,
        amount,
        status,
        paid_at,
        proof_url,
        created_at,
        users(id, full_name, profile_picture_url)
      `
      )
      .eq('round_id', roundId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get round payments error:', error);
      return { data: null, error: error.message };
    }

    return { data: payments, error: null };
  } catch (error) {
    console.error('Get round payments error:', error);
    return { data: null, error: 'Terjadi kesalahan pada server' };
  }
}

/**
 * Gets user's payment history
 *
 * @param groupId - Optional group ID to filter by
 * @returns Array of user's payments
 */
export async function getUserPayments(groupId?: string) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: 'Unauthorized. Please login.' };
    }

    let query = supabase
      .from('payments')
      .select(
        `
        id,
        amount,
        status,
        paid_at,
        proof_url,
        created_at,
        rounds(
          id,
          round_number,
          payment_deadline,
          groups(id, name, contribution_amount)
        )
      `
      )
      .eq('user_id', user.id);

    if (groupId) {
      query = query.eq('rounds.group_id', groupId);
    }

    const { data: payments, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      console.error('Get user payments error:', error);
      return { data: null, error: error.message };
    }

    return { data: payments, error: null };
  } catch (error) {
    console.error('Get user payments error:', error);
    return { data: null, error: 'Terjadi kesalahan pada server' };
  }
}
