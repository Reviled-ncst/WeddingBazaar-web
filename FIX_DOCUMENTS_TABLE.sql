-- Create vendor_documents table based on existing data structure
-- Run this in Neon SQL Console

-- Drop existing table if it exists (comment out if you want to keep data)
-- DROP TABLE IF EXISTS vendor_documents CASCADE;

-- Create the vendor_documents table
-- IMPORTANT: vendor_id stores the USER_ID (from users table), not vendors.id
--   - Backend code uses actualVendorId (user ID) to query documents
--   - Examples: '2-2025-003', 'b3f8e4c2-8a9d-4e6f-b1c3-7d5a9e2f4c8a'
CREATE TABLE IF NOT EXISTS vendor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id TEXT NOT NULL,  -- Stores user_id, not vendors.id
  document_type VARCHAR(50) NOT NULL,
  document_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  verification_status VARCHAR(20) DEFAULT 'pending',
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  verified_by VARCHAR(100),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  file_size INTEGER,
  mime_type VARCHAR(100)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_documents_vendor_id ON vendor_documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_documents_status ON vendor_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_vendor_documents_type ON vendor_documents(document_type);

-- Insert the existing documents from your JSON
INSERT INTO vendor_documents (
  id, vendor_id, document_type, document_url, file_name, 
  verification_status, uploaded_at, verified_at, verified_by, 
  rejection_reason, created_at, updated_at, file_size, mime_type
) VALUES 
  (
    '030ff38c-d571-41f2-a5ab-0635ac11e984',
    '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6',
    'business_license',
    'https://res.cloudinary.com/dht64xt1g/image/upload/v1762332665/vendor-documents/6fe3dc77-6774-4de8-ae2e-81a8ffb258f6/hecio4ab0m4k2g6jdhiz.jpg',
    '8-bit City_1920x1080.jpg',
    'approved',
    '2025-11-05 08:51:06.579361',
    '2025-11-05 08:51:31.907',
    'admin',
    NULL,
    '2025-11-05 08:51:06.579361',
    '2025-11-05 08:51:31.907',
    1321563,
    'image/jpeg'
  ),
  (
    '78997831-65fe-4e3b-8ce0-c221d811d168',
    '8666acb0-9ded-4487-bb5e-c33860d499d1',
    'business_license',
    'https://res.cloudinary.com/dht64xt1g/raw/upload/v1762555961/vendor-documents/8666acb0-9ded-4487-bb5e-c33860d499d1/cupy0sjnshkbd86qo9ii.docx',
    'Business License.docx',
    'approved',
    '2025-11-07 22:52:42.273193',
    '2025-11-07 22:54:23.219',
    'admin',
    NULL,
    '2025-11-07 22:52:42.273193',
    '2025-11-07 22:54:23.219',
    5065,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ),
  (
    '88929b27-bb34-4dcf-a60d-3bd9b4bd6f1f',
    '4613f591-459e-47ac-a1ee-1e7b1a30e8fb',
    'business_license',
    'https://res.cloudinary.com/dht64xt1g/raw/upload/v1762546693/vendor-documents/4613f591-459e-47ac-a1ee-1e7b1a30e8fb/csmyiqedvmbhgieqo29k.docx',
    'Business License.docx',
    'approved',
    '2025-11-07 20:18:14.444122',
    '2025-11-07 20:22:21.886',
    'admin',
    NULL,
    '2025-11-07 20:18:14.444122',
    '2025-11-07 20:22:21.886',
    5065,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ),
  (
    'd3032cad-60e0-4d76-a491-af351f9f9382',
    'b1fe95c5-54ed-47aa-acbc-8bd097978189',
    'business_license',
    'https://res.cloudinary.com/dht64xt1g/image/upload/v1762546143/vendor-documents/b1fe95c5-54ed-47aa-acbc-8bd097978189/rh1ceacsytxv3q6mxuxg.pdf',
    'Wedding-Bazaar-Implementation-of-a-Web-Based-Platform-for-Wedding-Suppliers-with-Decision-Support-System.pdf',
    'approved',
    '2025-11-07 20:09:04.41822',
    '2025-11-07 20:22:24.438',
    'admin',
    NULL,
    '2025-11-07 20:09:04.41822',
    '2025-11-07 20:22:24.438',
    2234246,
    'application/pdf'
  ),
  (
    'de03ff0e-3b41-49b7-b77d-4d0ecc629e3f',
    '1c5a1b66-f5f1-402d-b0bb-a02898ac5a1c',
    'business_license',
    'https://res.cloudinary.com/dht64xt1g/raw/upload/v1762033419/vendor-documents/1c5a1b66-f5f1-402d-b0bb-a02898ac5a1c/kohsbdopzen3axxo7cog.docx',
    'LensCraft_Studio_Business_Documents.docx',
    'approved',
    '2025-11-01 21:43:39.973505',
    '2025-11-01 21:44:18.041',
    'admin',
    NULL,
    '2025-11-01 21:43:39.973505',
    '2025-11-01 21:44:18.041',
    37801,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
ON CONFLICT (id) DO NOTHING;

-- Also create 'documents' as an alias/view (in case backend expects 'documents' table name)
CREATE OR REPLACE VIEW documents AS
SELECT * FROM vendor_documents;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_documents TO your_user;
-- GRANT SELECT ON documents TO your_user;

-- Verification query
SELECT 
  vendor_id,
  document_type,
  verification_status,
  COUNT(*) as doc_count
FROM vendor_documents
GROUP BY vendor_id, document_type, verification_status
ORDER BY vendor_id;

-- Check if your vendor (2-2025-003) has documents
-- Note: Your vendor_id format is different (2-2025-003 vs UUID format in documents)
-- This might be the issue!

SELECT * FROM vendor_documents 
WHERE vendor_id IN (
  SELECT id FROM vendors WHERE id LIKE '2-2025-003%' OR vendor_id = '2-2025-003'
);
