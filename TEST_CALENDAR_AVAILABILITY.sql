-- ==========================================
-- CALENDAR AVAILABILITY TEST SCRIPT
-- ==========================================
-- Run this in Neon SQL Editor to create test data
-- Then verify the calendar shows red dates

-- Step 1: Find a vendor ID to test with
SELECT 
  id,
  business_name,
  business_type,
  rating
FROM vendors
ORDER BY created_at DESC
LIMIT 5;

-- Copy one vendor ID from above
-- Replace YOUR_VENDOR_ID below with the actual ID

-- Step 2: Create test bookings for different dates
INSERT INTO bookings (
  vendor_id,
  user_id,
  event_date,
  status,
  amount,
  service_type,
  event_location,
  booking_reference
) VALUES
  -- Booking 1: Confirmed (should show RED in calendar)
  (
    'YOUR_VENDOR_ID',  -- Replace with actual vendor ID
    (SELECT id FROM users LIMIT 1),
    '2025-02-15',      -- Should show RED
    'confirmed',
    5000.00,
    'Photography',
    'Manila Hotel',
    'TEST-' || (random() * 1000000)::int
  ),
  -- Booking 2: Paid in Full (should show RED in calendar)
  (
    'YOUR_VENDOR_ID',  -- Replace with actual vendor ID
    (SELECT id FROM users LIMIT 1),
    '2025-02-20',      -- Should show RED
    'paid_in_full',
    8000.00,
    'Catering',
    'Makati Shangri-La',
    'TEST-' || (random() * 1000000)::int
  ),
  -- Booking 3: Pending (should show GREEN - still available)
  (
    'YOUR_VENDOR_ID',  -- Replace with actual vendor ID
    (SELECT id FROM users LIMIT 1),
    '2025-02-25',      -- Should show GREEN (pending doesn't block)
    'pending',
    3000.00,
    'Videography',
    'BGC Arts Center',
    'TEST-' || (random() * 1000000)::int
  ),
  -- Booking 4: Completed (should show RED in calendar)
  (
    'YOUR_VENDOR_ID',  -- Replace with actual vendor ID
    (SELECT id FROM users LIMIT 1),
    '2025-03-05',      -- Should show RED
    'completed',
    10000.00,
    'Wedding Planning',
    'Tagaytay Highlands',
    'TEST-' || (random() * 1000000)::int
  );

-- Step 3: Verify test bookings were created
SELECT 
  id,
  vendor_id,
  event_date,
  status,
  amount,
  service_type,
  created_at
FROM bookings
WHERE vendor_id = 'YOUR_VENDOR_ID'  -- Replace with actual vendor ID
ORDER BY event_date;

-- Expected Result:
-- 2025-02-15 | confirmed   | Should show RED
-- 2025-02-20 | paid_in_full | Should show RED
-- 2025-02-25 | pending     | Should show GREEN (available)
-- 2025-03-05 | completed   | Should show RED

-- ==========================================
-- CLEANUP (Run this after testing to remove test data)
-- ==========================================
-- DELETE FROM bookings 
-- WHERE booking_reference LIKE 'TEST-%';
