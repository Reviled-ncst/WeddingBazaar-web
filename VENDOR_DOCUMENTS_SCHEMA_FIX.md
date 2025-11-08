# 🔧 VENDOR DOCUMENTS SCHEMA MISMATCH - ROOT CAUSE & FIX

## 🎯 ROOT CAUSE IDENTIFIED

**Error Message:**
```
Failed to save document to database: 500 
{"success":false,"error":"Document upload failed","message":"invalid input syntax for type uuid: \"2-2025-003\""}
```

**The Problem:**
- `vendor_documents.vendor_id` column is **UUID** type
- `vendors.id` and `vendors.user_id` are **VARCHAR/STRING** type (e.g., '2-2025-003')
- Backend tries to insert string '2-2025-003' into UUID column → ERROR!

## 📊 Schema Mismatch Details

### Current (Broken) Schema:
```sql
vendor_documents:
  vendor_id: UUID ❌ (expecting UUID like 'a1b2c3d4-...')

vendors:
  id: VARCHAR ✅ (actual values like '2-2025-003')
  user_id: VARCHAR ✅ (actual values like '2-2025-003')
```

### What Happens:
1. User uploads document as vendor '2-2025-003'
2. Frontend calls: `POST /api/vendor-profile/2-2025-003/documents`
3. Backend receives `vendorId = '2-2025-003'` (string)
4. Backend tries: `INSERT INTO vendor_documents (vendor_id) VALUES ('2-2025-003')`
5. Database rejects: "invalid input syntax for type uuid" ❌

## ✅ THE FIX

### Option 1: Change Database Schema (RECOMMENDED)

**Run this in Neon SQL Editor:**
```sql
-- Change vendor_id from UUID to VARCHAR to match vendors table
ALTER TABLE vendor_documents 
ALTER COLUMN vendor_id TYPE VARCHAR(50);
```

**Advantages:**
- ✅ Simple one-line fix
- ✅ No code changes needed
- ✅ Matches vendors table schema
- ✅ Works immediately

**Potential Issue:**
- ⚠️ May fail if there's existing UUID data in the table
- If it fails, use Option 2 (drop and recreate)

### Option 2: Drop and Recreate Table (If Option 1 Fails)

**Only use if ALTER TABLE fails:**
```sql
-- ⚠️ WARNING: This deletes all existing documents!
DROP TABLE IF EXISTS vendor_documents CASCADE;

-- Recreate with correct schema
CREATE TABLE vendor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(50) NOT NULL,  -- ✅ Fixed: VARCHAR instead of UUID
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255),
  document_url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  verification_status VARCHAR(20) DEFAULT 'pending',
  verification_notes TEXT,
  verified_by UUID,
  verified_at TIMESTAMP,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_vendor_documents_vendor_id ON vendor_documents(vendor_id);
CREATE INDEX idx_vendor_documents_status ON vendor_documents(verification_status);
```

## 🚀 STEP-BY-STEP FIX INSTRUCTIONS

### Step 1: Open Neon SQL Editor
1. Go to: https://console.neon.tech
2. Select project: **weddingbazaar-web**
3. Click **SQL Editor**

### Step 2: Check Current Schema
```sql
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns
WHERE table_name = 'vendor_documents' 
AND column_name = 'vendor_id';
```

**Expected Output (BEFORE fix):**
```
column_name | data_type
------------|----------
vendor_id   | uuid      ← This is the problem
```

### Step 3: Run the Fix
```sql
ALTER TABLE vendor_documents 
ALTER COLUMN vendor_id TYPE VARCHAR(50);
```

**Expected Output:**
```
ALTER TABLE
```

### Step 4: Verify the Fix
```sql
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns
WHERE table_name = 'vendor_documents' 
AND column_name = 'vendor_id';
```

**Expected Output (AFTER fix):**
```
column_name | data_type
------------|-------------------
vendor_id   | character varying  ← Fixed!
```

### Step 5: Test Document Upload
```sql
-- Test insert with string vendor_id
INSERT INTO vendor_documents (
  vendor_id,
  document_type,
  file_name,
  document_url,
  verification_status
) VALUES (
  '2-2025-003',  -- Now this works!
  'business_license',
  'test_document.pdf',
  'https://example.com/test.pdf',
  'pending'
) RETURNING *;
```

**Expected Output:**
```
✅ 1 row inserted
```

### Step 6: Test in Frontend
1. Login as vendor: vendor0qw@mailinator.com
2. Go to: https://weddingbazaarph.web.app/vendor/profile
3. Click "Verification & Documents" tab
4. Try uploading a business license document
5. Should succeed now! ✅

## 🎯 WHY THIS HAPPENS

This is a database design issue from the original schema:

1. **vendors table** was created with **string IDs** (`'2-2025-003'`)
2. **vendor_documents table** was created with **UUID vendor_id** (expecting UUID format)
3. Backend code assumes they match (they don't!)
4. Result: Insert fails with UUID type error

## 📝 FILES INVOLVED

### Database Schema Fix:
- `FIX_VENDOR_DOCUMENTS_SCHEMA.sql` - Complete SQL script

### Backend Code (No changes needed after schema fix):
- `backend-deploy/routes/vendor-profile.cjs` - Document upload endpoint
- `backend-deploy/routes/services.cjs` - Document verification check

### Frontend (Working correctly):
- `src/pages/users/vendor/profile/VendorProfile.tsx` - Document upload UI

## ✅ VERIFICATION CHECKLIST

After running the SQL fix:

- [ ] SQL ALTER TABLE succeeds
- [ ] vendor_id column is now VARCHAR type
- [ ] Test INSERT with '2-2025-003' succeeds
- [ ] Frontend document upload works
- [ ] No more UUID errors in logs
- [ ] Service creation document check works

## 🚨 IF ALTER TABLE FAILS

If you see an error like:
```
ERROR: cannot cast type uuid to character varying
```

This means there's existing UUID data. Use Option 2 (DROP and CREATE).

**Before dropping:**
1. Export existing documents: `SELECT * FROM vendor_documents;`
2. Save the output
3. Drop and recreate table
4. Re-import documents if needed (convert UUIDs to vendor IDs)

## 🎉 AFTER FIX

Once the schema is fixed:
1. ✅ Document upload will work
2. ✅ Vendor can upload business license
3. ✅ Document verification status tracks properly
4. ✅ Service creation checks documents correctly
5. ✅ No more UUID errors!

---

**Status**: ⚠️ SCHEMA FIX REQUIRED  
**Priority**: 🔴 CRITICAL (blocking document uploads)  
**ETA**: 2 minutes (SQL execution)  
**Risk**: 🟢 LOW (simple schema change)  
**Testing**: Required after fix
