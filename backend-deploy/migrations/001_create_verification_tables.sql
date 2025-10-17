-- ===================================================================
-- WEDDING BAZAAR - USER VERIFICATION SYSTEM
-- Database Migration Script
-- Date: October 18, 2025
-- ===================================================================

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS user_verifications CASCADE;

-- Create user_verifications table
CREATE TABLE user_verifications (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR(255) NOT NULL,
  
  -- Face Recognition Data
  face_descriptor TEXT,                    -- JSON array of 128-D face descriptor
  face_verified BOOLEAN DEFAULT false,
  face_verified_at TIMESTAMP,
  face_confidence DECIMAL(5,2),            -- Confidence score (0-100)
  
  -- Identity Document Data
  document_type VARCHAR(50),               -- 'passport', 'drivers_license', 'national_id'
  document_number VARCHAR(100),            -- Extracted ID number
  document_image_url TEXT,                 -- Cloudinary URL
  document_verified BOOLEAN DEFAULT false,
  document_verified_at TIMESTAMP,
  document_confidence DECIMAL(5,2),        -- OCR confidence score (0-100)
  
  -- Extracted Document Information
  extracted_name VARCHAR(255),
  extracted_id_number VARCHAR(100),
  extracted_dob DATE,
  extracted_raw_text TEXT,                 -- Full OCR text for reference
  
  -- Verification Status
  status VARCHAR(50) DEFAULT 'pending',    -- 'pending', 'approved', 'rejected', 'expired'
  admin_notes TEXT,                        -- Admin review notes
  verified_by VARCHAR(255),                -- Admin user ID who verified
  rejection_reason VARCHAR(255),           -- Reason if rejected
  
  -- Timestamps
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Add foreign key constraint (assuming users table exists)
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_user_verifications_user_id ON user_verifications(user_id);
CREATE INDEX idx_user_verifications_status ON user_verifications(status);
CREATE INDEX idx_user_verifications_created_at ON user_verifications(created_at);
CREATE INDEX idx_user_verifications_verified_by ON user_verifications(verified_by);

-- Add unique constraint to ensure one verification per user
CREATE UNIQUE INDEX idx_user_verifications_user_unique ON user_verifications(user_id);

-- ===================================================================
-- Add verification status columns to users table
-- ===================================================================

-- Check if columns don't exist before adding
DO $$ 
BEGIN
  -- Add face_verified column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'face_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN face_verified BOOLEAN DEFAULT false;
  END IF;
  
  -- Add document_verified column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'document_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN document_verified BOOLEAN DEFAULT false;
  END IF;
  
  -- Add is_verified column (overall verification status)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
  END IF;
  
  -- Add verification_level column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'verification_level'
  ) THEN
    ALTER TABLE users ADD COLUMN verification_level VARCHAR(20) DEFAULT 'none';
    -- Levels: 'none', 'email', 'phone', 'face', 'document', 'full'
  END IF;
END $$;

-- Create index on verification status
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_level ON users(verification_level);

-- ===================================================================
-- Create verification audit log table (for compliance & tracking)
-- ===================================================================

CREATE TABLE IF NOT EXISTS verification_audit_log (
  id SERIAL PRIMARY KEY,
  verification_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,           -- 'submitted', 'approved', 'rejected', 'updated'
  performed_by VARCHAR(255),             -- User or admin who performed action
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  notes TEXT,
  ip_address VARCHAR(45),                -- Track IP for security
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_verification FOREIGN KEY (verification_id) REFERENCES user_verifications(id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for audit log
CREATE INDEX idx_verification_audit_log_verification_id ON verification_audit_log(verification_id);
CREATE INDEX idx_verification_audit_log_user_id ON verification_audit_log(user_id);
CREATE INDEX idx_verification_audit_log_created_at ON verification_audit_log(created_at);
CREATE INDEX idx_verification_audit_log_action ON verification_audit_log(action);

-- ===================================================================
-- Create function to automatically update updated_at timestamp
-- ===================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_verifications table
DROP TRIGGER IF EXISTS update_user_verifications_updated_at ON user_verifications;
CREATE TRIGGER update_user_verifications_updated_at
    BEFORE UPDATE ON user_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- Create function to sync verification status to users table
-- ===================================================================

CREATE OR REPLACE FUNCTION sync_user_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update users table when verification status changes
    IF NEW.status = 'approved' THEN
        UPDATE users
        SET 
            face_verified = NEW.face_verified,
            document_verified = NEW.document_verified,
            is_verified = (NEW.face_verified OR NEW.document_verified),
            verification_level = CASE
                WHEN NEW.face_verified AND NEW.document_verified THEN 'full'
                WHEN NEW.document_verified THEN 'document'
                WHEN NEW.face_verified THEN 'face'
                ELSE verification_level
            END
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync verification status
DROP TRIGGER IF EXISTS sync_verification_status ON user_verifications;
CREATE TRIGGER sync_verification_status
    AFTER UPDATE ON user_verifications
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION sync_user_verification_status();

-- ===================================================================
-- Insert sample data for testing (optional - comment out in production)
-- ===================================================================

-- Sample verification entry (pending review)
-- Uncomment for testing:
/*
INSERT INTO user_verifications (
    user_id, 
    document_type, 
    document_image_url, 
    extracted_name, 
    extracted_id_number,
    extracted_dob,
    document_confidence,
    status
) VALUES (
    'test-user-123',
    'national_id',
    'https://res.cloudinary.com/example/sample-id.jpg',
    'Juan Dela Cruz',
    'ID-12345678',
    '1990-01-15',
    85.5,
    'pending'
) ON CONFLICT (user_id) DO NOTHING;
*/

-- ===================================================================
-- Verification system statistics view
-- ===================================================================

CREATE OR REPLACE VIEW verification_statistics AS
SELECT
    COUNT(*) as total_verifications,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN face_verified = true THEN 1 END) as face_verified_count,
    COUNT(CASE WHEN document_verified = true THEN 1 END) as document_verified_count,
    ROUND(AVG(document_confidence), 2) as avg_document_confidence,
    ROUND(AVG(face_confidence), 2) as avg_face_confidence,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as submissions_last_24h,
    COUNT(CASE WHEN reviewed_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as reviews_last_24h
FROM user_verifications;

-- ===================================================================
-- Grant permissions (adjust based on your user setup)
-- ===================================================================

-- Grant access to application user (replace 'app_user' with your actual user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON user_verifications TO app_user;
-- GRANT SELECT, INSERT ON verification_audit_log TO app_user;
-- GRANT SELECT ON verification_statistics TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ===================================================================
-- Migration Complete!
-- ===================================================================

-- Verify tables were created
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_name IN ('user_verifications', 'verification_audit_log');
    
    IF table_count = 2 THEN
        RAISE NOTICE '✅ Migration completed successfully! Created % tables.', table_count;
    ELSE
        RAISE WARNING '⚠️ Migration may have issues. Expected 2 tables, found %.', table_count;
    END IF;
END $$;

-- Show table structure
\d user_verifications
\d verification_audit_log

-- Show statistics view
SELECT * FROM verification_statistics;
