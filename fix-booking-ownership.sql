-- ================================================================
-- FIX BOOKING OWNERSHIP - UPDATE ALL BOOKINGS TO CURRENT USER
-- ================================================================
-- 
-- This script will help you update bookings to belong to you.
-- Run these queries in your Neon SQL Console.
--
-- ================================================================

-- STEP 1: Find your user ID by email
-- Replace 'your@email.com' with your actual email
SELECT 
  id as user_id,
  email,
  full_name,
  role,
  created_at
FROM users 
WHERE email = 'your@email.com';

-- Copy the 'user_id' from the result above and use it in the next steps


-- ================================================================
-- STEP 2: Check booking 128 (and other bookings)
-- ================================================================

SELECT 
  id,
  user_id,
  status,
  service_type,
  event_date,
  amount,
  created_at
FROM bookings 
WHERE id IN ('128', '129', '130')
ORDER BY created_at DESC;


-- ================================================================
-- STEP 3: Update booking 128 to belong to you
-- ================================================================
-- Replace 'YOUR_USER_ID_HERE' with the ID from STEP 1

UPDATE bookings 
SET user_id = 'YOUR_USER_ID_HERE'
WHERE id = '128';


-- ================================================================
-- STEP 4 (OPTIONAL): Update ALL bookings to belong to you
-- ================================================================
-- This will change ownership of ALL bookings in your database
-- Use with caution if you have multiple real users!

-- First, see how many bookings will be affected:
SELECT 
  COUNT(*) as total_bookings,
  COUNT(DISTINCT user_id) as different_users
FROM bookings;

-- Then update them all:
UPDATE bookings 
SET user_id = 'YOUR_USER_ID_HERE'
WHERE user_id != 'YOUR_USER_ID_HERE';


-- ================================================================
-- STEP 5: Verify the changes
-- ================================================================

-- Check booking 128 specifically
SELECT 
  id,
  user_id,
  status,
  service_type,
  'Updated successfully!' as result
FROM bookings 
WHERE id = '128';

-- Check all your bookings
SELECT 
  id,
  user_id,
  status,
  service_type,
  event_date,
  created_at
FROM bookings 
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY created_at DESC;


-- ================================================================
-- STEP 6: Clean up any orphaned bookings (optional)
-- ================================================================
-- Find bookings that don't belong to any user

SELECT 
  b.id,
  b.user_id,
  b.status,
  'User does not exist!' as warning
FROM bookings b
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = b.user_id
);

-- If you find orphaned bookings, you can either:
-- A) Delete them:
-- DELETE FROM bookings WHERE id IN ('orphaned-booking-id-1', 'orphaned-booking-id-2');

-- B) Or assign them to you:
-- UPDATE bookings SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id NOT IN (SELECT id FROM users);


-- ================================================================
-- ALTERNATIVE: Create a test user and assign bookings to them
-- ================================================================

-- Create a dedicated test user (if you don't want to use your real account)
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  is_verified
) VALUES (
  'test@weddingbazaar.com',
  '$2a$10$XYZ...', -- Use a real bcrypt hash
  'Test User',
  'individual',
  true
)
RETURNING id;

-- Then assign bookings to this test user:
-- UPDATE bookings SET user_id = 'test-user-id-from-above' WHERE id = '128';


-- ================================================================
-- DONE! 
-- ================================================================
-- After running these queries, refresh your bookings page and try
-- cancelling booking 128 again. It should work now!
-- ================================================================
