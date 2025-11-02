-- ============================================================
-- BOOKING DISPUTES & REPUTATION SYSTEM
-- Wedding Bazaar Platform
-- Date: November 3, 2025
-- ============================================================

-- 1. Create booking_disputes table
CREATE TABLE IF NOT EXISTS booking_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES users(id),
  reported_against UUID NOT NULL REFERENCES users(id),
  
  -- Dispute Details
  dispute_type VARCHAR(50) NOT NULL CHECK (dispute_type IN (
    'vendor_no_show',
    'couple_no_show', 
    'service_not_delivered',
    'poor_quality',
    'late_arrival',
    'early_departure',
    'breach_of_contract',
    'payment_dispute',
    'false_accusations',
    'other'
  )),
  
  dispute_category VARCHAR(50) NOT NULL CHECK (dispute_category IN (
    'no_show',
    'service_quality',
    'payment',
    'contract',
    'behavior'
  )),
  
  -- Evidence & Description
  description TEXT NOT NULL,
  evidence_urls TEXT[], -- Photos, videos, documents
  event_date DATE NOT NULL, -- Date service was supposed to happen
  report_date TIMESTAMP DEFAULT NOW(),
  
  -- Financial
  refund_requested BOOLEAN DEFAULT FALSE,
  requested_amount DECIMAL(10,2),
  
  -- Status & Resolution
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending',           -- Awaiting admin review
    'under_review',      -- Admin is investigating
    'awaiting_response', -- Waiting for other party's response
    'resolved',          -- Dispute resolved
    'rejected',          -- Dispute rejected
    'escalated'          -- Escalated to higher authority
  )),
  
  resolution_type VARCHAR(50) CHECK (resolution_type IN (
    'full_refund',
    'partial_refund',
    'no_refund',
    'vendor_penalty',
    'couple_penalty',
    'mutual_agreement',
    'insufficient_evidence'
  )),
  
  refund_amount DECIMAL(10,2),
  penalty_amount DECIMAL(10,2),
  
  -- Admin Action
  admin_notes TEXT,
  admin_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  resolved_at TIMESTAMP,
  
  -- Case Number (for tracking)
  case_number VARCHAR(20) UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create dispute_responses table (thread/chat)
CREATE TABLE IF NOT EXISTS dispute_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES booking_disputes(id) ON DELETE CASCADE,
  
  -- Response Details
  responder_id UUID NOT NULL REFERENCES users(id),
  responder_role VARCHAR(20) NOT NULL CHECK (responder_role IN ('admin', 'vendor', 'couple')),
  
  message TEXT NOT NULL,
  evidence_urls TEXT[], -- Additional evidence
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create user_reputation_scores table
CREATE TABLE IF NOT EXISTS user_reputation_scores (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Score Metrics
  total_disputes_filed INT DEFAULT 0,
  disputes_won INT DEFAULT 0,
  disputes_lost INT DEFAULT 0,
  no_show_count INT DEFAULT 0,
  
  -- Reputation Score (0-100)
  reputation_score INT DEFAULT 100 CHECK (reputation_score >= 0 AND reputation_score <= 100),
  
  -- Status
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  suspended_until TIMESTAMP,
  
  -- Timestamps
  last_updated TIMESTAMP DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_disputes_booking ON booking_disputes(booking_id);
CREATE INDEX IF NOT EXISTS idx_disputes_reporter ON booking_disputes(reported_by);
CREATE INDEX IF NOT EXISTS idx_disputes_reported_against ON booking_disputes(reported_against);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON booking_disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_type ON booking_disputes(dispute_type);
CREATE INDEX IF NOT EXISTS idx_disputes_event_date ON booking_disputes(event_date);
CREATE INDEX IF NOT EXISTS idx_disputes_created_at ON booking_disputes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_responses_dispute ON dispute_responses(dispute_id);
CREATE INDEX IF NOT EXISTS idx_responses_responder ON dispute_responses(responder_id);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON dispute_responses(created_at DESC);

-- 5. Create function to generate case number
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.case_number := 'DSP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('dispute_case_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create sequence for case numbers
CREATE SEQUENCE IF NOT EXISTS dispute_case_seq START WITH 1;

-- 7. Create trigger to auto-generate case numbers
DROP TRIGGER IF EXISTS generate_case_number_trigger ON booking_disputes;
CREATE TRIGGER generate_case_number_trigger
BEFORE INSERT ON booking_disputes
FOR EACH ROW
EXECUTE FUNCTION generate_case_number();

-- 8. Create function to update reputation scores
CREATE OR REPLACE FUNCTION update_reputation_score(
  p_user_id UUID,
  p_score_delta INT
) RETURNS VOID AS $$
BEGIN
  -- Insert or update reputation score
  INSERT INTO user_reputation_scores (user_id, reputation_score, last_updated)
  VALUES (p_user_id, GREATEST(0, LEAST(100, 100 + p_score_delta)), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    reputation_score = GREATEST(0, LEAST(100, user_reputation_scores.reputation_score + p_score_delta)),
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- 9. Create view for dispute summary
CREATE OR REPLACE VIEW dispute_summary AS
SELECT 
  d.id,
  d.case_number,
  d.dispute_type,
  d.dispute_category,
  d.status,
  d.event_date,
  d.report_date,
  d.resolved_at,
  d.refund_amount,
  
  -- Reporter Info
  reporter.id as reporter_id,
  reporter.first_name || ' ' || reporter.last_name as reporter_name,
  reporter.role as reporter_role,
  
  -- Reported Against Info
  reported.id as reported_against_id,
  reported.first_name || ' ' || reported.last_name as reported_against_name,
  reported.role as reported_against_role,
  
  -- Booking Info
  b.booking_reference,
  b.service_type,
  b.total_amount as booking_amount,
  
  -- Admin Info
  admin_user.first_name || ' ' || admin_user.last_name as admin_name,
  
  -- Response Count
  (SELECT COUNT(*) FROM dispute_responses WHERE dispute_id = d.id) as response_count
  
FROM booking_disputes d
LEFT JOIN users reporter ON d.reported_by = reporter.id
LEFT JOIN users reported ON d.reported_against = reported.id
LEFT JOIN bookings b ON d.booking_id = b.id
LEFT JOIN users admin_user ON d.admin_id = admin_user.id;

-- 10. Grant permissions (adjust as needed for your roles)
-- GRANT SELECT, INSERT, UPDATE ON booking_disputes TO authenticated_users;
-- GRANT SELECT, INSERT ON dispute_responses TO authenticated_users;
-- GRANT SELECT ON user_reputation_scores TO authenticated_users;
-- GRANT ALL ON booking_disputes, dispute_responses, user_reputation_scores TO admin_users;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ Dispute system tables created successfully!';
  RAISE NOTICE '📋 Tables: booking_disputes, dispute_responses, user_reputation_scores';
  RAISE NOTICE '🔍 View: dispute_summary';
  RAISE NOTICE '⚙️  Functions: generate_case_number(), update_reputation_score()';
END $$;
