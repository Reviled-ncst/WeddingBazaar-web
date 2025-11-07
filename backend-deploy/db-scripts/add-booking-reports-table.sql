-- Add booking_reports table for vendor and couple reports
CREATE TABLE IF NOT EXISTS booking_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES users(id) ON DELETE CASCADE,
  reporter_type VARCHAR(20) NOT NULL CHECK (reporter_type IN ('vendor', 'couple')),
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
    'payment_issue',
    'service_issue',
    'communication_issue',
    'cancellation_dispute',
    'quality_issue',
    'contract_violation',
    'unprofessional_behavior',
    'no_show',
    'other'
  )),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cancellation_reason TEXT,
  evidence_urls TEXT[],
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'dismissed')),
  admin_notes TEXT,
  admin_response TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_reports_booking ON booking_reports(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_reports_reported_by ON booking_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_booking_reports_status ON booking_reports(status);
CREATE INDEX IF NOT EXISTS idx_booking_reports_priority ON booking_reports(priority);
CREATE INDEX IF NOT EXISTS idx_booking_reports_type ON booking_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_booking_reports_created ON booking_reports(created_at DESC);

-- View for admin dashboard with full details
CREATE OR REPLACE VIEW admin_booking_reports_view AS
SELECT 
  br.id,
  br.booking_id,
  br.reported_by,
  br.reporter_type,
  br.report_type,
  br.subject,
  br.description,
  br.evidence_urls,
  br.priority,
  br.status,
  br.admin_notes,
  br.admin_response,
  br.reviewed_by,
  br.reviewed_at,
  br.resolved_at,
  br.created_at,
  br.updated_at,
  -- Reporter details
  u.first_name as reporter_first_name,
  u.last_name as reporter_last_name,
  u.email as reporter_email,
  -- Booking details
  b.booking_reference,
  b.service_type,
  b.event_date,
  b.status as booking_status,
  b.amount,
  -- Vendor details
  v.business_name as vendor_name,
  v.vendor_id,
  -- Couple details
  cu.first_name as couple_first_name,
  cu.last_name as couple_last_name,
  cu.email as couple_email,
  -- Admin reviewer details
  au.first_name as admin_first_name,
  au.last_name as admin_last_name
FROM booking_reports br
LEFT JOIN users u ON br.reported_by = u.id
LEFT JOIN bookings b ON br.booking_id = b.id
LEFT JOIN vendors v ON b.vendor_id = v.vendor_id
LEFT JOIN users cu ON b.couple_id = cu.id
LEFT JOIN users au ON br.reviewed_by = au.id
ORDER BY 
  CASE br.priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  br.created_at DESC;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_booking_reports_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_booking_reports_timestamp
BEFORE UPDATE ON booking_reports
FOR EACH ROW
EXECUTE FUNCTION update_booking_reports_timestamp();

-- Sample data for testing (optional, remove if not needed)
COMMENT ON TABLE booking_reports IS 'Reports submitted by vendors and couples regarding booking issues';
COMMENT ON COLUMN booking_reports.reporter_type IS 'Type of user who submitted the report: vendor or couple';
COMMENT ON COLUMN booking_reports.report_type IS 'Category of the issue being reported';
COMMENT ON COLUMN booking_reports.priority IS 'Admin-assigned priority level for the report';
COMMENT ON COLUMN booking_reports.status IS 'Current status of the report: open, in_review, resolved, dismissed';
