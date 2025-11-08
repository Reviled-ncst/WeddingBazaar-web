# 🚨 IMMEDIATE ACTION REQUIRED - Document Upload Fix

## ⚡ QUICK FIX (2 minutes)

### The Problem:
Document upload fails with: `"invalid input syntax for type uuid: \"2-2025-003\""`

### The Solution:
Change `vendor_documents.vendor_id` from UUID to VARCHAR

### Run This NOW in Neon SQL Editor:

```sql
-- Step 1: Fix the schema
ALTER TABLE vendor_documents 
ALTER COLUMN vendor_id TYPE VARCHAR(50);

-- Step 2: Verify it worked
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'vendor_documents' AND column_name = 'vendor_id';
-- Should show: character varying

-- Step 3: Test insert
INSERT INTO vendor_documents (vendor_id, document_type, file_name, document_url)
VALUES ('2-2025-003', 'business_license', 'test.pdf', 'https://example.com/test.pdf')
RETURNING *;
-- Should succeed!
```

## ✅ After Running:

1. **Test document upload** in frontend immediately
2. **Upload business license** for vendor 2-2025-003
3. **Try adding a service** - should work now!

## 📚 Full Documentation:

- **SQL Script**: `FIX_VENDOR_DOCUMENTS_SCHEMA.sql`
- **Full Guide**: `VENDOR_DOCUMENTS_SCHEMA_FIX.md`

---
**This fixes BOTH the document upload AND service creation issues!**
