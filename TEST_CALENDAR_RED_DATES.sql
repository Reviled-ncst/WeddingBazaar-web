-- ==========================================
-- CREATE TEST BOOKING FOR VENDOR ID: 2
-- This will make dates appear RED in calendar
-- ==========================================

-- Step 1: Verify vendor exists
SELECT id, business_name, business_type 
FROM vendors 
WHERE id = '2' OR id = '2-2025-001';

-- Step 2: Create test bookings (Replace vendor_id if needed)
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
  -- Booking 1: October 28, 2025 - CONFIRMED (will show RED)
  (
    '2',  -- This is the vendor from your logs
    '1-2025-001',  -- Your current user
    '2025-10-28',
    'confirmed',
    5000.00,
    'Bakery',
    'Test Location',
    'TEST-RED-' || (random() * 1000000)::int
  ),
  -- Booking 2: October 30, 2025 - PAID IN FULL (will show RED)
  (
    '2',
    '1-2025-001',
    '2025-10-30',
    'paid_in_full',
    8000.00,
    'Bakery',
    'Test Location',
    'TEST-RED-' || (random() * 1000000)::int
  ),
  -- Booking 3: November 5, 2025 - CONFIRMED (will show RED)
  (
    '2',
    '1-2025-001',
    '2025-11-05',
    'confirmed',
    6000.00,
    'Bakery',
    'Test Location',
    'TEST-RED-' || (random() * 1000000)::int
  );

-- Step 3: Verify bookings were created
SELECT 
  id,
  vendor_id,
  event_date,
  status,
  amount,
  created_at
FROM bookings
WHERE vendor_id IN ('2', '2-2025-001')
  AND booking_reference LIKE 'TEST-RED-%'
ORDER BY event_date;

-- Expected Result:
-- 2025-10-28 | confirmed    | Should show RED in calendar
-- 2025-10-30 | paid_in_full | Should show RED in calendar
-- 2025-11-05 | confirmed    | Should show RED in calendar

-- ==========================================
-- TO TEST: After running this SQL
-- ==========================================
-- 1. Close the booking modal (X button)
-- 2. Click "Book Now" again on the same service
-- 3. Calendar should now show:
--    - October 28 = RED with X icon
--    - October 30 = RED with X icon  
--    - November 5 = RED with X icon
--    - All other dates = GREEN with checkmark

-- ==========================================
-- CLEANUP (Run after testing to remove test data)
-- ==========================================
-- DELETE FROM bookings WHERE booking_reference LIKE 'TEST-RED-%';
