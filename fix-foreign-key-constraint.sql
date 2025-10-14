-- SQL Script to fix foreign key constraint error
-- Run this in your database console (Neon, pgAdmin, etc.)

-- Step 1: Delete bookings that reference the target services
DELETE FROM "bookings" 
WHERE "service_id" IN (
  'SRV-0001', 'SRV-0002', 'SRV-0003', 'SRV-0004', 'SRV-0005',
  'SRV-0006', 'SRV-0007', 'SRV-0008', 'SRV-1758769064490',
  'SRV-9950', 'SRV-9954'
);

-- Step 2: Now delete the services (this should work without constraint errors)
DELETE FROM "services"
WHERE "id" IN (
  'SRV-0001', 'SRV-0002', 'SRV-0003', 'SRV-0004', 'SRV-0005',
  'SRV-0006', 'SRV-0007', 'SRV-0008', 'SRV-1758769064490',
  'SRV-9950', 'SRV-9954'
);

-- Optional: Check results
SELECT 'Remaining services' as status, COUNT(*) as count FROM "services" WHERE "id" IN (
  'SRV-0001', 'SRV-0002', 'SRV-0003', 'SRV-0004', 'SRV-0005',
  'SRV-0006', 'SRV-0007', 'SRV-0008', 'SRV-1758769064490',
  'SRV-9950', 'SRV-9954'
);

-- Show total services remaining
SELECT 'Total services' as status, COUNT(*) as count FROM "services";
