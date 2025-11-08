-- ============================================================================
-- ADD PACKAGE COLUMNS TO BOOKINGS TABLE
-- ============================================================================
-- Purpose: Add columns to store package selection and itemization data
-- Date: November 8, 2025
-- Database: Neon PostgreSQL (weddingbazaar-web)
-- ============================================================================

-- 🔧 Step 1: Add package-related columns
-- ============================================================================

ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS selected_package VARCHAR(255),
  ADD COLUMN IF NOT EXISTS package_id UUID,
  ADD COLUMN IF NOT EXISTS package_price DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS package_items JSONB,
  ADD COLUMN IF NOT EXISTS selected_addons JSONB,
  ADD COLUMN IF NOT EXISTS addon_total DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;

-- 🔗 Step 2: Add foreign key constraint (optional but recommended)
-- ============================================================================

DO $$ 
BEGIN
  -- Check if foreign key doesn't exist before adding
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_bookings_package' 
    AND table_name = 'bookings'
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT fk_bookings_package
      FOREIGN KEY (package_id) 
      REFERENCES service_packages(id)
      ON DELETE SET NULL;
    
    RAISE NOTICE '✅ Foreign key constraint added: fk_bookings_package';
  ELSE
    RAISE NOTICE 'ℹ️ Foreign key constraint already exists: fk_bookings_package';
  END IF;
END $$;

-- 📊 Step 3: Add indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_bookings_package_id 
  ON bookings(package_id);

CREATE INDEX IF NOT EXISTS idx_bookings_selected_package 
  ON bookings(selected_package);

CREATE INDEX IF NOT EXISTS idx_bookings_package_price 
  ON bookings(package_price);

-- 🔄 Step 4: Migrate existing bookings (data fix)
-- ============================================================================

-- Update existing bookings to populate new columns from existing data
-- This ensures old bookings still display correctly

UPDATE bookings 
SET 
  package_price = COALESCE(total_amount, 0),
  subtotal = COALESCE(total_amount, 0)
WHERE package_price IS NULL 
  OR subtotal IS NULL;

-- 📋 Step 5: Verification queries
-- ============================================================================

-- Check that columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
  AND column_name IN (
    'selected_package',
    'package_id',
    'package_price',
    'package_items',
    'selected_addons',
    'addon_total',
    'subtotal'
  )
ORDER BY ordinal_position;

-- Check indexes
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'bookings'
  AND indexname LIKE '%package%'
ORDER BY indexname;

-- Sample data check
SELECT 
  id,
  service_name,
  selected_package,
  package_price,
  addon_total,
  subtotal,
  total_amount,
  status,
  created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 5;

-- 📊 Step 6: Statistics
-- ============================================================================

SELECT 
  COUNT(*) as total_bookings,
  COUNT(selected_package) as bookings_with_package,
  COUNT(package_items) as bookings_with_items,
  COUNT(selected_addons) as bookings_with_addons,
  AVG(package_price) as avg_package_price,
  AVG(addon_total) as avg_addon_total,
  AVG(subtotal) as avg_subtotal
FROM bookings;

-- ============================================================================
-- ROLLBACK SCRIPT (IF NEEDED)
-- ============================================================================
-- CAUTION: This will remove the columns and data. Use only if needed!
-- 
-- ALTER TABLE bookings 
--   DROP COLUMN IF EXISTS selected_package,
--   DROP COLUMN IF EXISTS package_id,
--   DROP COLUMN IF EXISTS package_price,
--   DROP COLUMN IF EXISTS package_items,
--   DROP COLUMN IF EXISTS selected_addons,
--   DROP COLUMN IF EXISTS addon_total,
--   DROP COLUMN IF EXISTS subtotal;
-- 
-- DROP INDEX IF EXISTS idx_bookings_package_id;
-- DROP INDEX IF EXISTS idx_bookings_selected_package;
-- DROP INDEX IF EXISTS idx_bookings_package_price;
-- ============================================================================

-- ✅ SCRIPT COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Update backend to save package data (backend-deploy/routes/bookings.cjs)
-- 2. Update frontend to send package data (BookingRequestModal.tsx)
-- 3. Update booking display pages (IndividualBookings.tsx, VendorBookingsSecure.tsx)
-- 4. Test end-to-end booking creation with packages
-- ============================================================================
