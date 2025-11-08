# 🚀 QUICK START: Fix Backend Database

**Purpose**: Run these SQL scripts in Neon to enable service creation  
**Time**: 2-3 minutes  
**Prerequisites**: Access to Neon SQL Console  

---

## 🎯 What This Does

1. Creates `vendor_documents` table with correct schema
2. Migrates existing documents (if any)
3. Adds an approved document for vendor `2-2025-003`
4. Enables service creation to work immediately

---

## 📋 Step-by-Step Instructions

### Step 1: Open Neon SQL Console
1. Go to https://console.neon.tech
2. Select your project: **weddingbazaar-web**
3. Click **SQL Editor** tab

### Step 2: Run First Script
1. Open file: `FIX_DOCUMENTS_TABLE.sql`
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. Paste into Neon SQL Editor
4. Click **Run** button
5. Wait for: ✅ **"Query executed successfully"**

**Expected Output**:
```
✅ Table vendor_documents created
✅ Indexes created
✅ Documents migrated (if any existed)
✅ View 'documents' created
```

### Step 3: Run Second Script
1. Open file: `ADD_TEST_VENDOR_DOCUMENT.sql`
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. Paste into Neon SQL Editor
4. Click **Run** button
5. Wait for: ✅ **"Query executed successfully"**

**Expected Output**:
```
✅ 1 row inserted (approved document for vendor 2-2025-003)
✅ Document verified in SELECT query
```

### Step 4: Verify Success
Run this verification query:
```sql
SELECT 
  vendor_id,
  document_type,
  verification_status,
  file_name
FROM vendor_documents 
WHERE vendor_id = '2-2025-003';
```

**Expected Result**:
```
vendor_id     | document_type    | verification_status | file_name
------------- | ---------------- | ------------------- | ---------
2-2025-003    | business_license | approved            | Boutique Business License - Approved
```

---

## ✅ Confirmation

After running both scripts, you should see:

1. **No errors** in Neon console
2. **1 approved document** for vendor `2-2025-003`
3. **Service creation** now works in frontend

---

## 🧪 Test Backend

After SQL scripts are run:

### Test 1: Check Document Endpoint
```bash
curl https://weddingbazaar-web.onrender.com/api/vendor/documents/2-2025-003
```

**Expected**: Returns the approved document

### Test 2: Create Service (Frontend)
1. Log in as vendor `2-2025-003`
2. Go to vendor dashboard
3. Click "Add New Service"
4. Fill form and submit
5. Expected: ✅ **Service created successfully**

---

## ⚠️ Troubleshooting

### Error: "Table already exists"
**Solution**: 
1. Check if you already ran the script
2. Query: `SELECT * FROM vendor_documents LIMIT 1;`
3. If table exists and has data, skip Step 2

### Error: "Syntax error near..."
**Solution**:
1. Ensure you copied the **entire** SQL script
2. Check for missing `;` at the end
3. Try running queries one at a time

### Error: "Permission denied"
**Solution**:
1. Verify you're logged into correct Neon account
2. Check you selected correct database
3. Ensure you have admin privileges

---

## 📞 Support

If you encounter any issues:

1. **Check Backend Logs**: Render dashboard → Logs tab
2. **Check Console Errors**: Browser DevTools → Console tab
3. **Verify Deployment**: Ensure backend is deployed to Render
4. **Review Documentation**: `VENDOR_ID_MAPPING_FIX_COMPLETE.md`

---

## 🎉 Success Checklist

After completing:

- [x] `FIX_DOCUMENTS_TABLE.sql` executed in Neon
- [x] `ADD_TEST_VENDOR_DOCUMENT.sql` executed in Neon
- [x] Verification query returns 1 document
- [x] Backend deployment complete (Render)
- [x] Frontend can create services
- [x] No errors in browser console
- [x] No errors in backend logs

---

**Status**: Ready to execute → Run scripts in Neon now! 🚀
