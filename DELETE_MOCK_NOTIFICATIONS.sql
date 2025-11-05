-- ====================================
-- DELETE MOCK NOTIFICATIONS
-- Run this in Neon SQL Console
-- ====================================

-- Show current notifications
SELECT 
  id, 
  title, 
  message,
  user_id,
  user_type,
  is_read,
  created_at
FROM notifications 
ORDER BY created_at DESC;

-- Delete mock notifications with these specific titles
DELETE FROM notifications 
WHERE title IN ('New Message', 'Profile Update Needed', 'New Booking Request')
AND (
  message LIKE '%sample%' 
  OR message LIKE '%business hours%' 
  OR message LIKE '%DJ services%'
  OR message LIKE '%potential client%'
  OR message LIKE '%update your business%'
  OR message LIKE '%new booking request for%'
);

-- Verify deletion
SELECT 
  COUNT(*) as remaining_notifications,
  COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count
FROM notifications;

-- Show remaining notifications (should be empty or only real ones)
SELECT 
  id, 
  title, 
  message,
  user_id,
  created_at
FROM notifications 
ORDER BY created_at DESC
LIMIT 10;
