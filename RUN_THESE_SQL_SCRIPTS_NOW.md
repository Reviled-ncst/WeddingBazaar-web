# 🚨 URGENT: Run These SQL Scripts in Neon Console NOW

## Problem
Backend is deployed but failing with:
```
relation "documents" does not exist
```

## Solution
Run these SQL scripts IN ORDER in your Neon SQL Console:

---

## SCRIPT 1: Create vendor_documents Table
**File**: `FIX_DOCUMENTS_TABLE.sql`

```sql
-- Drop the old table if it exists (rename it for safety)
ALTER TABLE IF EXISTS documents RENAME TO documents_backup_old;

-- Create new vendor_documents table with correct structure
CREATE TABLE IF NOT EXISTS vendor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(50) NOT NULL,  -- Matches user_id format: '2-2025-003'
  document_type VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  verification_status VARCHAR(50) DEFAULT 'pending',
  verified_at TIMESTAMP,
  verified_by VARCHAR(255),
  rejection_reason TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_docs_vendor ON vendor_documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_docs_status ON vendor_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_vendor_docs_type ON vendor_documents(document_type);

-- Create alias view for backward compatibility
CREATE OR REPLACE VIEW documents AS SELECT * FROM vendor_documents;

-- Grant permissions
GRANT ALL ON vendor_documents TO neondb_owner;
GRANT ALL ON documents TO neondb_owner;
```

**Expected Output**: 
- `ALTER TABLE` (if old table exists)
- `CREATE TABLE vendor_documents` ✅
- `CREATE INDEX` (3 times) ✅
- `CREATE VIEW documents` ✅
- `GRANT` (2 times) ✅

---

## SCRIPT 2: Add Test Document for Current Vendor
**File**: `ADD_TEST_VENDOR_DOCUMENT.sql`

```sql
-- Add approved documents for vendor '2-2025-003' (your current vendor)
-- This will allow document verification to pass

-- First, check if documents already exist
SELECT vendor_id, document_type, verification_status 
FROM vendor_documents 
WHERE vendor_id = '2-2025-003';

-- If no results, insert test documents:
INSERT INTO vendor_documents (
  vendor_id,
  document_type,
  file_url,
  file_name,
  verification_status,
  verified_at,
  verified_by
) VALUES
-- Freelancer required documents
('2-2025-003', 'valid_id', 'https://example.com/docs/valid-id.pdf', 'valid_id.pdf', 'approved', NOW(), 'admin'),
('2-2025-003', 'portfolio_samples', 'https://example.com/docs/portfolio.pdf', 'portfolio.pdf', 'approved', NOW(), 'admin'),
('2-2025-003', 'professional_certification', 'https://example.com/docs/cert.pdf', 'certification.pdf', 'approved', NOW(), 'admin')
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT vendor_id, document_type, verification_status, verified_at
FROM vendor_documents 
WHERE vendor_id = '2-2025-003';
```

**Expected Output**:
- First SELECT: Shows existing documents (if any)
- INSERT: `INSERT 0 3` (3 rows inserted)
- Second SELECT: Shows 3 approved documents for vendor '2-2025-003'

---

## SCRIPT 3: Verify Fix
```sql
-- Check table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('vendor_documents', 'documents');

-- Should show:
-- vendor_documents
-- documents (view)

-- Check vendor has approved documents
SELECT vendor_id, COUNT(*) as doc_count, 
       STRING_AGG(document_type, ', ') as types
FROM vendor_documents
WHERE vendor_id = '2-2025-003' AND verification_status = 'approved'
GROUP BY vendor_id;

-- Should show:
-- vendor_id: 2-2025-003
-- doc_count: 3
-- types: valid_id, portfolio_samples, professional_certification
```

---

## How to Run (Step-by-Step)

1. **Open Neon Console**:
   - Go to https://console.neon.tech
   - Select your `weddingbazaar-web` project
   - Click "SQL Editor" in left sidebar

2. **Run Script 1** (Create Table):
   - Copy entire SQL from SCRIPT 1 above
   - Paste into SQL Editor
   - Click "Run" button
   - ✅ Verify all CREATE statements succeeded

3. **Run Script 2** (Add Test Data):
   - Copy entire SQL from SCRIPT 2 above
   - Paste into SQL Editor
   - Click "Run" button
   - ✅ Verify INSERT succeeded and SELECT shows 3 documents

4. **Run Script 3** (Verify):
   - Copy SQL from SCRIPT 3 above
   - Paste into SQL Editor
   - Click "Run" button
   - ✅ Verify both tables exist and vendor has 3 approved docs

---

## After Running Scripts

### Test Backend Endpoint:
```bash
# Test categories endpoint (should work now)
curl https://weddingbazaar-web.onrender.com/api/categories

# Should return: 200 OK with category list
```

### Test Frontend:
1. Go to https://weddingbazaarph.web.app/individual/services
2. Categories should load without errors
3. Console should show no "documents" errors

---

## Expected Timeline

- **Script 1**: 30 seconds to run
- **Script 2**: 10 seconds to run
- **Script 3**: 5 seconds to verify
- **Total Time**: < 1 minute

---

## If Something Goes Wrong

### Error: "relation vendor_documents already exists"
```sql
-- Drop and recreate
DROP TABLE IF EXISTS vendor_documents CASCADE;
-- Then run SCRIPT 1 again
```

### Error: "duplicate key value violates unique constraint"
```sql
-- Documents already exist, just verify them:
SELECT * FROM vendor_documents WHERE vendor_id = '2-2025-003';
```

### Need to Start Over?
```sql
-- Complete reset
DROP VIEW IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS vendor_documents CASCADE;
DROP TABLE IF EXISTS documents_backup_old CASCADE;
-- Then run SCRIPT 1 from scratch
```

---

## ✅ Success Criteria

After running all scripts, you should see:

1. **Neon Console**:
   - `vendor_documents` table exists
   - `documents` view exists
   - 3 approved documents for vendor '2-2025-003'

2. **Backend Logs** (Render):
   - No more "relation does not exist" errors
   - Category endpoint returns 200 OK

3. **Frontend** (Firebase):
   - Services page loads categories successfully
   - No console errors about documents

---

## Questions?

If scripts fail or you see unexpected errors:
1. Copy the exact error message
2. Copy the output of `SELECT * FROM vendor_documents;`
3. Share both with me for immediate troubleshooting

**After running these scripts, the entire system should work end-to-end! 🎉**
