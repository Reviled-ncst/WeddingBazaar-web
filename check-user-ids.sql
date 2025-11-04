// Database Inspection Script for User ID Investigation
// Run this in Neon SQL Editor

-- 1. Check user table structure and sample data
SELECT 
  id,
  email,
  full_name,
  role,
  pg_typeof(id) as id_type,
  LENGTH(id::text) as id_length
FROM users 
LIMIT 5;

-- 2. Check bookings table user_id structure
SELECT 
  id as booking_id,
  user_id,
  vendor_id,
  status,
  pg_typeof(user_id) as user_id_type,
  LENGTH(user_id::text) as user_id_length,
  created_at
FROM bookings 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Find bookings with mismatched user IDs
SELECT 
  b.id as booking_id,
  b.user_id as booking_user_id,
  b.status,
  u.id as actual_user_id,
  u.email,
  CASE 
    WHEN b.user_id::text = u.id::text THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as match_status
FROM bookings b
LEFT JOIN users u ON b.user_id::text = u.id::text
ORDER BY b.created_at DESC
LIMIT 10;

-- 4. Find orphaned bookings (user doesn't exist)
SELECT 
  b.id as booking_id,
  b.user_id,
  b.status,
  b.created_at
FROM bookings b
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id::text = b.user_id::text
)
ORDER BY b.created_at DESC;

-- 5. Check if we need to fix user IDs
SELECT 
  'users' as table_name,
  pg_typeof(id) as id_type,
  MIN(LENGTH(id::text)) as min_length,
  MAX(LENGTH(id::text)) as max_length,
  COUNT(*) as total_rows
FROM users
UNION ALL
SELECT 
  'bookings (user_id)' as table_name,
  pg_typeof(user_id) as id_type,
  MIN(LENGTH(user_id::text)) as min_length,
  MAX(LENGTH(user_id::text)) as max_length,
  COUNT(*) as total_rows
FROM bookings;
