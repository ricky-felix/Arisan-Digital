================================================================================
ADMIN LOGIN SETUP - READ THIS FIRST
================================================================================

You created this admin user:
  INSERT INTO users (phone_number, full_name) VALUES ('6281234567890', 'Admin');

TO LOGIN AS ADMIN, FOLLOW THESE STEPS:

1. FIX THE PHONE NUMBER FORMAT IN DATABASE
   Run this SQL in Supabase:

   UPDATE users 
   SET phone_number = '+6281234567890' 
   WHERE phone_number = '6281234567890';

2. CREATE AUTH USER IN SUPABASE DASHBOARD
   - Go to: Supabase Dashboard → Authentication → Users
   - Click: "Add user" → "Create new user"
   - Phone: +6281234567890
   - ✅ CHECK: "Auto Confirm User" (this is CRITICAL!)
   - Click: "Create user"
   - COPY the generated User ID (UUID)

3. UPDATE DATABASE WITH AUTH ID
   Run this SQL (replace UUID):

   UPDATE users 
   SET id = 'PASTE_UUID_HERE'
   WHERE phone_number = '+6281234567890';

4. LOGIN TO THE APP
   Option A - Admin Login Page:
     http://localhost:3000/auth/admin-login
     → Enter ANY OTP: 000000
   
   Option B - Regular Login:
     http://localhost:3000/auth/login
     → Phone: 081234567890
     → OTP: ANY 6 digits (000000, 123456, etc.)

================================================================================

WHY "AUTO CONFIRM USER"?
- It marks phone as verified in Supabase
- Any OTP will be accepted
- No real SMS needed
- Perfect for development!

ADMIN PHONE: +6281234567890 (or 081234567890 in app)

================================================================================

QUICK LINKS:
- Admin Login Page: /auth/admin-login
- Regular Login: /auth/login
- Link on landing page: Look for "🔐 Admin Login (Development)"

DOCUMENTATION:
- HOW_TO_LOGIN_AS_ADMIN.md - Detailed step-by-step guide
- ADMIN_LOGIN_INSTRUCTIONS.md - Full documentation
- ADMIN_SETUP.sql - SQL scripts for reference

================================================================================
