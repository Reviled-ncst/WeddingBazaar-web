-- ============================================================================
-- VENDOR DATA DIAGNOSTIC - Run in Neon SQL Console
-- This will help identify why services and bookings are not showing correctly
-- ============================================================================

-- 1. CHECK SERVICES TABLE STRUCTURE
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'services'
ORDER BY ordinal_position;

-- 2. CHECK BOOKINGS TABLE STRUCTURE  
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- 3. CHECK IF SERVICES EXIST (Count by vendor_id)
SELECT 
    vendor_id,
    COUNT(*) as service_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_count
FROM services
GROUP BY vendor_id
ORDER BY service_count DESC;

-- 4. CHECK IF BOOKINGS EXIST (Count by vendor_id)
SELECT 
    vendor_id,
    COUNT(*) as booking_count,
    COUNT(DISTINCT couple_id) as unique_couples,
    COUNT(DISTINCT status) as status_types
FROM bookings
GROUP BY vendor_id
ORDER BY booking_count DESC;

-- 5. CHECK VENDOR PROFILES (To match vendor_id)
SELECT 
    vp.id as vendor_profile_id,
    vp.user_id,
    vp.business_name,
    u.id as user_table_id,
    u.email,
    u.role,
    u.full_name
FROM vendor_profiles vp
LEFT JOIN users u ON vp.user_id::text = u.id::text
ORDER BY vp.created_at DESC
LIMIT 10;

-- 6. CHECK FOR VENDOR ID MISMATCHES
-- This identifies if services/bookings are using different vendor_id than vendor_profiles
SELECT 
    'services' as table_name,
    s.vendor_id,
    COUNT(*) as record_count,
    CASE 
        WHEN EXISTS (SELECT 1 FROM vendor_profiles WHERE id::text = s.vendor_id::text) 
        THEN '✅ MATCHES vendor_profiles.id'
        WHEN EXISTS (SELECT 1 FROM users WHERE id::text = s.vendor_id::text AND role = 'vendor')
        THEN '⚠️ MATCHES users.id (NOT vendor_profiles.id)'
        ELSE '❌ NO MATCH FOUND'
    END as id_match_status
FROM services s
GROUP BY s.vendor_id
UNION ALL
SELECT 
    'bookings' as table_name,
    b.vendor_id,
    COUNT(*) as record_count,
    CASE 
        WHEN EXISTS (SELECT 1 FROM vendor_profiles WHERE id::text = b.vendor_id::text) 
        THEN '✅ MATCHES vendor_profiles.id'
        WHEN EXISTS (SELECT 1 FROM users WHERE id::text = b.vendor_id::text AND role = 'vendor')
        THEN '⚠️ MATCHES users.id (NOT vendor_profiles.id)'
        ELSE '❌ NO MATCH FOUND'
    END as id_match_status
FROM bookings b
GROUP BY b.vendor_id
ORDER BY table_name, record_count DESC;

-- 7. CHECK FOR ORPHANED SERVICES (services without valid vendor)
SELECT 
    s.id as service_id,
    s.vendor_id,
    s.title,
    s.category,
    s.is_active,
    CASE 
        WHEN vp.id IS NOT NULL THEN '✅ Valid vendor_profile'
        WHEN u.id IS NOT NULL THEN '⚠️ Valid user but no vendor_profile'
        ELSE '❌ Invalid vendor_id'
    END as validation_status
FROM services s
LEFT JOIN vendor_profiles vp ON s.vendor_id::text = vp.id::text
LEFT JOIN users u ON s.vendor_id::text = u.id::text
WHERE vp.id IS NULL OR u.id IS NULL
LIMIT 20;

-- 8. CHECK FOR ORPHANED BOOKINGS (bookings without valid vendor or couple)
SELECT 
    b.id as booking_id,
    b.vendor_id,
    b.couple_id,
    b.service_name,
    b.status,
    b.event_date,
    CASE 
        WHEN vp.id IS NOT NULL THEN '✅ Valid vendor'
        ELSE '❌ Invalid vendor_id'
    END as vendor_status,
    CASE 
        WHEN u.id IS NOT NULL THEN '✅ Valid couple'
        ELSE '❌ Invalid couple_id'
    END as couple_status
FROM bookings b
LEFT JOIN vendor_profiles vp ON b.vendor_id::text = vp.id::text
LEFT JOIN users u ON b.couple_id::text = u.id::text
WHERE vp.id IS NULL OR u.id IS NULL
ORDER BY b.created_at DESC
LIMIT 20;

-- 9. CHECK SPECIFIC VENDOR (Replace with your email or vendor ID)
-- OPTION A: Search by email
SELECT 
    'Vendor Profile' as source,
    vp.id as vendor_profile_id,
    vp.business_name,
    vp.user_id,
    u.email,
    u.full_name,
    (SELECT COUNT(*) FROM services WHERE vendor_id = vp.id) as service_count,
    (SELECT COUNT(*) FROM bookings WHERE vendor_id = vp.id) as booking_count
FROM vendor_profiles vp
LEFT JOIN users u ON vp.user_id::text = u.id::text
WHERE u.email = 'YOUR_EMAIL@example.com'  -- REPLACE THIS
LIMIT 1;

-- OPTION B: Search by vendor profile ID
SELECT 
    'Vendor Profile' as source,
    vp.id as vendor_profile_id,
    vp.business_name,
    vp.user_id,
    u.email,
    u.full_name,
    (SELECT COUNT(*) FROM services WHERE vendor_id = vp.id) as service_count,
    (SELECT COUNT(*) FROM bookings WHERE vendor_id = vp.id) as booking_count
FROM vendor_profiles vp
LEFT JOIN users u ON vp.user_id::text = u.id::text
WHERE vp.id = 'YOUR_VENDOR_ID'  -- REPLACE THIS
LIMIT 1;

-- 10. FIND ALL POSSIBLE VENDOR IDs FOR A USER
-- This helps identify which ID format your services/bookings are using
SELECT 
    u.id as user_id,
    u.email,
    u.role,
    vp.id as vendor_profile_id,
    vp.business_name,
    (SELECT COUNT(*) FROM services WHERE vendor_id = u.id) as services_with_user_id,
    (SELECT COUNT(*) FROM services WHERE vendor_id = vp.id) as services_with_profile_id,
    (SELECT COUNT(*) FROM bookings WHERE vendor_id = u.id) as bookings_with_user_id,
    (SELECT COUNT(*) FROM bookings WHERE vendor_id = vp.id) as bookings_with_profile_id
FROM users u
LEFT JOIN vendor_profiles vp ON vp.user_id::text = u.id::text
WHERE u.role = 'vendor' AND u.email = 'YOUR_EMAIL@example.com'  -- REPLACE THIS
LIMIT 1;

-- 11. CHECK DATA TYPE CONSISTENCY
-- Verify vendor_id columns are the same type across tables
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE column_name = 'vendor_id'
ORDER BY table_name;

-- 12. SAMPLE DATA CHECK
-- Get a sample of services to see actual data format
SELECT 
    id,
    vendor_id,
    title,
    category,
    is_active,
    LENGTH(vendor_id) as vendor_id_length,
    created_at
FROM services
ORDER BY created_at DESC
LIMIT 5;

-- 13. SAMPLE BOOKINGS CHECK
-- Get a sample of bookings to see actual data format
SELECT 
    id,
    vendor_id,
    couple_id,
    service_name,
    status,
    LENGTH(vendor_id) as vendor_id_length,
    created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- DIAGNOSTIC SUMMARY
-- ============================================================================
-- After running all queries above, you should have:
-- 1. Table structures (verify vendor_id column exists and type is consistent)
-- 2. Count of services/bookings per vendor_id
-- 3. Vendor profile mappings
-- 4. Vendor ID mismatch detection
-- 5. Orphaned records identification
-- 6. Your specific vendor data
-- 7. Data type consistency check
-- 8. Sample data for verification
-- ============================================================================
