# ✅ SQL EXECUTION CHECKLIST

## 📋 Pre-Execution Checklist

- [ ] Neon SQL Editor is open
- [ ] Project selected: weddingbazaar-web
- [ ] SQL script `VERIFY_VENDOR_2-2025-003.sql` is ready
- [ ] All content copied to clipboard

## 🎯 Execution Steps

### Step 1: Paste SQL
- [ ] Paste entire script into Neon SQL Editor
- [ ] Verify all 11 steps are visible

### Step 2: Run Script
- [ ] Click "Run" button
- [ ] Wait for execution (~10 seconds)

### Step 3: Verify Results
- [ ] Step 3: `ALTER TABLE` succeeds
- [ ] Step 4: Shows `character varying` data type
- [ ] Step 7: `INSERT` returns 1 new row
- [ ] Step 9: `UPDATE` affects 1 row
- [ ] Step 10: Shows `verified = true`
- [ ] Step 11: Shows 6 total documents

## 🧪 Post-Execution Testing

### Test 1: Document Upload
- [ ] Login to vendor account
- [ ] Navigate to vendor profile
- [ ] Go to "Verification & Documents" tab
- [ ] Try uploading a document
- [ ] **Result**: Upload succeeds ✅

### Test 2: Service Creation
- [ ] Navigate to vendor services
- [ ] Click "Add Service"
- [ ] Fill out service form
- [ ] Submit form
- [ ] **Result**: Service created ✅

### Test 3: API Verification
- [ ] Run API check command
- [ ] Verify `verified: true` in response
- [ ] **Result**: Vendor is verified ✅

## 🎉 Success Indicators

### Database
- ✅ vendor_documents has 6 rows
- ✅ vendor_id column is VARCHAR type
- ✅ Vendor 2-2025-003 has approved business_license
- ✅ vendors.verified = true

### Frontend
- ✅ Document upload works without errors
- ✅ Service creation is no longer blocked
- ✅ Verified badge appears on profile

### Backend
- ✅ No UUID type errors in logs
- ✅ Document verification passes
- ✅ Service endpoints respond correctly

## 🚨 If Something Fails

### ALTER TABLE Error
- **Error**: "cannot cast type uuid to character varying"
- **Fix**: Script already includes `USING vendor_id::text`
- **Action**: Check if script pasted correctly

### INSERT Error
- **Error**: "duplicate key value"
- **Fix**: Delete existing row first
- **SQL**: `DELETE FROM vendor_documents WHERE vendor_id = '2-2025-003';`

### UPDATE Error
- **Error**: "relation does not exist"
- **Fix**: Check table name is correct
- **Action**: Run `\dt` to list all tables

## 📞 Need Help?

1. Check execution logs in Neon
2. Verify all steps completed
3. Re-run specific failed steps
4. Clear browser cache and retry

---

**Expected Duration**: 3 minutes total  
**Risk Level**: Low (non-destructive)  
**Rollback**: Not needed (preserves existing data)  
**Status**: Ready to execute! 🚀
