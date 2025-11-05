-- ============================================================================
-- NOTIFICATION SYSTEM VERIFICATION QUERIES
-- Run these in Neon SQL Console to verify notification system is working
-- ============================================================================

-- 1. Check if notifications table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'notifications'
);

-- 2. Check notifications table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- 3. Count total notifications
SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE is_read = FALSE) as unread_notifications,
    COUNT(*) FILTER (WHERE is_read = TRUE) as read_notifications
FROM notifications;

-- 4. Count notifications by user type
SELECT 
    user_type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_read = FALSE) as unread
FROM notifications
GROUP BY user_type;

-- 5. Count notifications by type
SELECT 
    type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_read = FALSE) as unread
FROM notifications
GROUP BY type
ORDER BY count DESC;

-- 6. View all vendor notifications (most recent first)
SELECT 
    id,
    user_id as vendor_id,
    title,
    message,
    type,
    is_read,
    action_url,
    created_at,
    AGE(NOW(), created_at) as age
FROM notifications
WHERE user_type = 'vendor'
ORDER BY created_at DESC
LIMIT 20;

-- 7. Check for mock notifications (notifications with generic patterns)
SELECT 
    id,
    user_id,
    title,
    message,
    type,
    created_at
FROM notifications
WHERE 
    title LIKE '%Mock%'
    OR message LIKE '%test%'
    OR message LIKE '%Test%'
    OR message LIKE '%sample%'
ORDER BY created_at DESC;

-- 8. View notifications for a specific vendor (replace with actual vendor ID)
-- Example: SELECT * FROM notifications WHERE user_id = '2-2025-001';
SELECT 
    id,
    title,
    message,
    type,
    is_read,
    action_url,
    metadata,
    created_at
FROM notifications
WHERE user_id = '2-2025-001'  -- Replace with actual vendor ID
ORDER BY created_at DESC;

-- 9. Check notifications with associated bookings
SELECT 
    n.id as notification_id,
    n.title,
    n.message,
    n.created_at as notification_created,
    n.is_read,
    b.id as booking_id,
    b.couple_name,
    b.service_name,
    b.event_date,
    b.status as booking_status,
    b.created_at as booking_created
FROM notifications n
LEFT JOIN bookings b ON (n.metadata->>'bookingId')::uuid = b.id
WHERE n.type = 'booking'
ORDER BY n.created_at DESC
LIMIT 20;

-- 10. Check notifications created in the last 24 hours
SELECT 
    COUNT(*) as notifications_today,
    COUNT(*) FILTER (WHERE is_read = FALSE) as unread_today,
    MIN(created_at) as first_notification,
    MAX(created_at) as last_notification
FROM notifications
WHERE created_at > NOW() - INTERVAL '1 day';

-- 11. List vendors with notifications
SELECT 
    user_id as vendor_id,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE is_read = FALSE) as unread_count,
    MAX(created_at) as last_notification
FROM notifications
WHERE user_type = 'vendor'
GROUP BY user_id
ORDER BY unread_count DESC, last_notification DESC;

-- 12. Check for duplicate notifications (same booking, multiple notifications)
SELECT 
    metadata->>'bookingId' as booking_id,
    COUNT(*) as notification_count,
    ARRAY_AGG(id) as notification_ids,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM notifications
WHERE metadata->>'bookingId' IS NOT NULL
GROUP BY metadata->>'bookingId'
HAVING COUNT(*) > 1
ORDER BY notification_count DESC;

-- 13. Verify notification system is creating real notifications
-- This checks if there are any notifications created in the last hour
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'SYSTEM IS ACTIVE ✅'
        ELSE 'NO RECENT NOTIFICATIONS ⚠️'
    END as system_status,
    COUNT(*) as recent_notifications,
    MAX(created_at) as last_notification_time
FROM notifications
WHERE created_at > NOW() - INTERVAL '1 hour';

-- 14. Health check: Ensure no notifications without metadata
SELECT 
    COUNT(*) as notifications_without_metadata,
    ARRAY_AGG(id) as ids
FROM notifications
WHERE metadata IS NULL OR metadata = '{}'::jsonb;

-- 15. Sample notification data (to verify structure)
SELECT 
    id,
    user_id,
    user_type,
    title,
    message,
    type,
    is_read,
    action_url,
    jsonb_pretty(metadata) as formatted_metadata,
    created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 1;

-- ============================================================================
-- CLEANUP QUERIES (USE WITH CAUTION)
-- ============================================================================

-- DELETE mock or test notifications (uncomment to execute)
-- DELETE FROM notifications 
-- WHERE 
--     title LIKE '%Mock%'
--     OR message LIKE '%test%'
--     OR message LIKE '%Test%'
--     OR message LIKE '%sample%';

-- Mark all notifications as read for a vendor (uncomment to execute)
-- UPDATE notifications 
-- SET is_read = TRUE, updated_at = NOW()
-- WHERE user_id = '2-2025-001';  -- Replace with vendor ID

-- Delete all notifications for a vendor (uncomment to execute)
-- DELETE FROM notifications WHERE user_id = '2-2025-001';

-- Delete all notifications (DANGER: THIS WILL DELETE ALL NOTIFICATIONS)
-- DELETE FROM notifications;

-- ============================================================================
-- END OF VERIFICATION QUERIES
-- ============================================================================
