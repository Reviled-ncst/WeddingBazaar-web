-- ✅ Add Completion Proof Columns to Bookings Table
-- This migration adds support for image/video proof of completion

-- Add completion proof columns
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS vendor_completion_proof JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS couple_completion_proof JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS vendor_completion_notes TEXT,
ADD COLUMN IF NOT EXISTS couple_completion_notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN bookings.vendor_completion_proof IS 'Array of image/video URLs uploaded by vendor as proof of completion';
COMMENT ON COLUMN bookings.couple_completion_proof IS 'Array of image/video URLs uploaded by couple as proof of completion (optional)';
COMMENT ON COLUMN bookings.vendor_completion_notes IS 'Vendor notes when marking as complete';
COMMENT ON COLUMN bookings.couple_completion_notes IS 'Couple notes when marking as complete (optional)';

-- Create index for querying bookings with proof
CREATE INDEX IF NOT EXISTS idx_bookings_completion_proof 
ON bookings USING GIN (vendor_completion_proof);

-- Example data structure for completion proof:
-- {
--   "images": [
--     {
--       "url": "https://res.cloudinary.com/...",
--       "publicId": "wedding-proof-123",
--       "uploadedAt": "2025-10-28T10:00:00Z",
--       "fileType": "image/jpeg",
--       "size": 1024000,
--       "description": "Final setup photo"
--     }
--   ],
--   "videos": [
--     {
--       "url": "https://res.cloudinary.com/...",
--       "publicId": "wedding-video-123",
--       "uploadedAt": "2025-10-28T10:05:00Z",
--       "fileType": "video/mp4",
--       "size": 5120000,
--       "duration": 30,
--       "description": "Time-lapse of event"
--     }
--   ]
-- }

-- Verification query
SELECT 
  id,
  vendor_completed,
  couple_completed,
  vendor_completion_proof,
  couple_completion_proof,
  vendor_completion_notes,
  couple_completion_notes
FROM bookings
WHERE vendor_completed = TRUE OR couple_completed = TRUE;
