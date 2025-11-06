-- Fix vendor service ID mismatch
-- Update service SRV-00215 to use UUID instead of legacy ID

-- First, verify the vendor exists with both IDs
SELECT id, legacy_vendor_id, business_name 
FROM vendors 
WHERE legacy_vendor_id = '2-2025-003' 
   OR id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6';

-- Update the service to use the UUID
UPDATE services 
SET vendor_id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6'
WHERE vendor_id = '2-2025-003';

-- Verify the update
SELECT id, vendor_id, title, category 
FROM services 
WHERE vendor_id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6';
