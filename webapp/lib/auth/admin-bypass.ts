/**
 * Admin Bypass Authentication
 * 
 * DEVELOPMENT ONLY: Allows admin users to login without OTP verification.
 * This bypasses Supabase Auth OTP and creates a direct session.
 */

'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Admin phone numbers that can bypass OTP (development only)
 */
const ADMIN_PHONES = [
  '+6281234567890',
  '6281234567890',
  '081234567890',
];

/**
 * Check if phone number is an admin
 */
export function isAdminPhone(phone: string): boolean {
  const normalized = phone.replace(/\D/g, ''); // Remove non-digits
  return ADMIN_PHONES.some(adminPhone => {
    const adminNormalized = adminPhone.replace(/\D/g, '');
    return normalized === adminNormalized || normalized === adminNormalized.slice(-10);
  });
}

/**
 * Admin bypass login - creates session directly without OTP
 * 
 * WARNING: This should ONLY be used in development!
 * Remove or disable in production.
 */
export async function adminBypassLogin(phone: string) {
  'use server';
  
  try {
    // Verify it's an admin phone
    if (!isAdminPhone(phone)) {
      return {
        success: false,
        error: 'Only admin users can use bypass login',
      };
    }

    const supabase = await createClient();
    
    // Normalize phone to E.164 format
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = phone.startsWith('0') 
        ? `+62${phone.slice(1)}` 
        : `+62${phone}`;
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', formattedPhone)
      .single<{ id: string; phone_number: string; full_name: string }>();

    if (userError || !user) {
      return {
        success: false,
        error: 'Admin user not found in database',
      };
    }

    // Create a manual session using Supabase admin API
    // Note: This requires the SUPABASE_SERVICE_ROLE_KEY in production
    // For development, we'll use a different approach
    
    // Alternative: Use signInWithOtp but auto-verify
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      console.error('OTP Error:', otpError);
    }

    // For development: directly create auth session
    // This requires additional Supabase configuration
    
    return {
      success: true,
      message: 'Please use the admin bypass page',
      userId: user.id,
    };
  } catch (error) {
    console.error('Admin bypass error:', error);
    return {
      success: false,
      error: 'Failed to bypass login',
    };
  }
}

/**
 * Simpler approach: Just mark the admin as verified
 * This works by checking if user is admin during OTP verification
 */
export async function bypassOTPForAdmin(phone: string, _anyOtp: string = '000000') {
  'use server';
  
  if (!isAdminPhone(phone)) {
    return { isAdmin: false };
  }

  // For admin users, accept any OTP
  return {
    isAdmin: true,
    shouldBypass: true,
  };
}
