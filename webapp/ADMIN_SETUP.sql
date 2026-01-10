-- ========================================
-- ADMIN USER SETUP - Arisan Digital
-- ========================================
-- This script creates an admin user that can login without OTP
-- Run this in your Supabase SQL Editor

-- Step 1: Create admin user in auth.users (bypassing OTP)
-- Note: You need to run this with service role key or in Supabase dashboard

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), -- This will generate a UUID, note it down!
  'authenticated',
  'authenticated',
  'admin@arisandigital.com', -- Optional email
  crypt('Admin123!', gen_salt('bf')), -- Password: Admin123!
  NOW(),
  '+6281234567890', -- Admin phone number
  NOW(), -- Phone already confirmed (bypasses OTP)
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"provider":"phone","providers":["phone"]}',
  '{"full_name":"Admin User"}',
  false,
  NOW()
)
ON CONFLICT (id) DO NOTHING
RETURNING id;

-- Step 2: Get the generated user ID and insert into public.users
-- IMPORTANT: Replace 'PASTE_USER_ID_HERE' with the UUID from Step 1

INSERT INTO public.users (
  id,
  phone_number,
  full_name,
  profile_picture_url,
  created_at,
  updated_at
) VALUES (
  'PASTE_USER_ID_HERE', -- Replace with UUID from Step 1
  '+6281234567890',
  'Admin User',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  full_name = 'Admin User',
  phone_number = '+6281234567890',
  updated_at = NOW();

-- Step 3: Verify the user was created
SELECT 
  u.id,
  u.phone,
  u.phone_confirmed_at,
  u.email,
  u.created_at
FROM auth.users u
WHERE u.phone = '+6281234567890';

SELECT 
  id,
  phone_number,
  full_name,
  created_at
FROM public.users
WHERE phone_number = '+6281234567890';

-- ========================================
-- ALTERNATIVE: Simpler approach using Supabase Dashboard
-- ========================================
-- If the above doesn't work, use this approach:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Enter:
--    - Phone: +6281234567890
--    - Check "Auto Confirm User" (this bypasses OTP)
-- 4. Click "Create user"
-- 5. Copy the User ID (UUID)
-- 6. Run this SQL with the copied ID:

/*
INSERT INTO public.users (
  id,
  phone_number,
  full_name,
  profile_picture_url,
  created_at,
  updated_at
) VALUES (
  'PASTE_UUID_FROM_DASHBOARD', -- UUID from dashboard
  '+6281234567890',
  'Admin User',
  NULL,
  NOW(),
  NOW()
);
*/
