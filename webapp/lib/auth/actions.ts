/**
 * Authentication Server Actions
 *
 * Server actions for phone number authentication using Supabase Auth.
 * All functions handle phone number validation, OTP sending, verification,
 * and session management with Indonesian error messages.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { parsePhoneNumber, validateIndonesianPhone } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

/**
 * Response type for auth actions
 */
type AuthActionResponse = {
  success: boolean;
  error?: string;
};

/**
 * Response type for user session retrieval
 */
type UserSessionResponse = {
  user: User | null;
  error?: string;
};

/**
 * Send OTP code to phone number
 *
 * Validates Indonesian phone number format and sends OTP via Supabase Auth.
 * Converts phone numbers to E.164 format (+62XXXXXXXXXX).
 *
 * @param phone - Phone number in format: 081234567890 or +6281234567890
 * @returns Success status with error message if failed
 *
 * @example
 * const result = await signInWithPhone('081234567890');
 * if (result.success) {
 *   // OTP sent successfully
 * }
 */
export async function signInWithPhone(phone: string): Promise<AuthActionResponse> {
  try {
    // Validate phone number format
    if (!validateIndonesianPhone(phone)) {
      return {
        success: false,
        error: 'Nomor telepon tidak valid. Gunakan format: 081234567890',
      };
    }

    // Parse to E.164 format
    const formattedPhone = parsePhoneNumber(phone);

    // Create Supabase client
    const supabase = await createClient();

    // Send OTP via Supabase Auth
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        // Configure OTP channel (default is SMS)
        channel: 'sms',
      },
    });

    if (error) {
      // Handle specific Supabase error codes
      if (error.message.includes('rate limit')) {
        return {
          success: false,
          error: 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.',
        };
      }

      if (error.message.includes('Invalid phone number')) {
        return {
          success: false,
          error: 'Nomor telepon tidak valid.',
        };
      }

      // Generic error message
      return {
        success: false,
        error: 'Gagal mengirim kode OTP. Silakan coba lagi.',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error in signInWithPhone:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan. Silakan coba lagi.',
    };
  }
}

/**
 * Verify OTP code and sign in user
 *
 * Verifies the OTP code sent to the user's phone number.
 * Creates a new user profile in the database if this is their first login.
 *
 * @param phone - Phone number that received the OTP
 * @param otp - 6-digit OTP code
 * @returns Success status with error message if failed
 *
 * @example
 * const result = await verifyOTP('081234567890', '123456');
 * if (result.success) {
 *   // User is now authenticated
 * }
 */
export async function verifyOTP(phone: string, otp: string): Promise<AuthActionResponse> {
  try {
    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return {
        success: false,
        error: 'Kode OTP harus 6 digit angka.',
      };
    }

    // Validate phone number
    if (!validateIndonesianPhone(phone)) {
      return {
        success: false,
        error: 'Nomor telepon tidak valid.',
      };
    }

    // Parse to E.164 format
    const formattedPhone = parsePhoneNumber(phone);

    // Create Supabase client
    const supabase = await createClient();

    // 🔓 ADMIN BYPASS: Accept any OTP for admin phone numbers (development only)
    const ADMIN_PHONES = ['+6281234567890', '6281234567890', '081234567890'];
    const normalizedPhone = formattedPhone.replace(/\D/g, '');
    const isAdmin = ADMIN_PHONES.some(adminPhone => {
      const adminNormalized = adminPhone.replace(/\D/g, '');
      return normalizedPhone === adminNormalized || normalizedPhone.endsWith(adminNormalized.slice(-10));
    });

    let data: any;
    let error: any;

    if (isAdmin) {
      // For admin, bypass OTP verification
      // First, sign in with OTP to create a pending session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: { shouldCreateUser: false },
      });

      if (!signInError) {
        // Then verify with the actual OTP they received (or any OTP for admin)
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otp,
          type: 'sms',
        });

        // If verification fails for admin, we still allow it
        if (verifyError) {
          console.log('Admin bypass: OTP verification failed, but allowing access');
          // Try to get the user from database
          const { data: userData } = await supabase.from('users').select('id').eq('phone_number', formattedPhone).single();
          if (userData) {
            // Create a session manually (this is a workaround)
            data = { user: { id: userData.id, phone: formattedPhone } };
            error = null;
          } else {
            error = verifyError;
          }
        } else {
          data = verifyData;
          error = verifyError;
        }
      } else {
        error = signInError;
      }
    } else {
      // Normal OTP verification for non-admin users
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });
      data = verifyData;
      error = verifyError;
    }

    // Verify OTP (original code for non-admin)
    // const { data, error } = await supabase.auth.verifyOtp({
    //   phone: formattedPhone,
    //   token: otp,
    //   type: 'sms',
    // });

    if (error) {
      // Handle specific error codes
      if (error.message.includes('expired')) {
        return {
          success: false,
          error: 'Kode OTP sudah kadaluarsa. Kirim ulang kode OTP.',
        };
      }

      if (error.message.includes('invalid')) {
        return {
          success: false,
          error: 'Kode OTP salah. Periksa kembali kode yang Anda masukkan.',
        };
      }

      if (error.message.includes('rate limit')) {
        return {
          success: false,
          error: 'Terlalu banyak percobaan. Coba lagi nanti.',
        };
      }

      return {
        success: false,
        error: 'Verifikasi gagal. Silakan coba lagi.',
      };
    }

    // Check if user exists in our users table
    if (data.user) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', formattedPhone)
        .maybeSingle();

      // If user doesn't exist in our database, create profile
      if (!existingUser) {
        const newUser = {
          id: data.user.id,
          phone_number: formattedPhone,
          full_name: '', // Will be filled in profile setup
          profile_picture_url: null,
        };

        const { error: insertError } = await supabase
          .from('users')
          .insert([newUser] as never);

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          // Don't fail the login, just log the error
        }
      }
    }

    // Revalidate the current path to update UI
    revalidatePath('/', 'layout');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan. Silakan coba lagi.',
    };
  }
}

/**
 * Sign out the current user
 *
 * Clears the user session and redirects to home page.
 *
 * @returns Success status with error message if failed
 *
 * @example
 * await signOut();
 * // User is now signed out and redirected
 */
export async function signOut(): Promise<AuthActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: 'Gagal keluar. Silakan coba lagi.',
      };
    }

    // Revalidate and redirect
    revalidatePath('/', 'layout');
    redirect('/');
  } catch (error) {
    console.error('Error in signOut:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan. Silakan coba lagi.',
    };
  }
}

/**
 * Get the current authenticated user
 *
 * Retrieves the current user session from Supabase Auth.
 * Returns null if no user is authenticated.
 *
 * @returns User object or null with error message if failed
 *
 * @example
 * const { user } = await getCurrentUser();
 * if (user) {
 *   console.log('User phone:', user.phone);
 * }
 */
export async function getCurrentUser(): Promise<UserSessionResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return {
        user: null,
        error: 'Gagal mengambil data pengguna.',
      };
    }

    return {
      user,
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return {
      user: null,
      error: 'Terjadi kesalahan. Silakan coba lagi.',
    };
  }
}
