-- Create documents table for vendor verification
-- This table is required by the backend code at commit e0d6707

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(50) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  document_url TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  verification_notes TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  verified_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_vendor ON documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(vendor_id, document_type, status);

-- Insert sample approved documents for existing vendor to allow service creation
INSERT INTO documents (vendor_id, document_type, document_url, status, verified_at)
VALUES 
  ('2-2025-003', 'business_permit', 'https://example.com/permit.pdf', 'approved', NOW()),
  ('2-2025-003', 'valid_id', 'https://example.com/id.pdf', 'approved', NOW())
ON CONFLICT DO NOTHING;

-- Verify table was created
SELECT COUNT(*) as document_count FROM documents;
