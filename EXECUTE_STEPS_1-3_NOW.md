# ⚡ EXECUTE STEPS 1-3 NOW

## ✅ STEP 1: RUN SQL SCRIPT (30 seconds)

### Action:
1. Open: https://console.neon.tech
2. Click **SQL Editor**
3. Open file: `RUN_THIS_IN_NEON_NOW.sql`
4. Select ALL (Ctrl+A)
5. Copy (Ctrl+C)
6. Paste in Neon SQL Editor
7. Click **Run**

### Expected Results:
```
ALTER TABLE (constraint dropped) ✅
ALTER TABLE (column type changed) ✅
1 row showing: character varying ✅
1 row inserted ✅
1 row updated ✅
1 row showing document ✅
1 row showing vendor ✅
1 row showing count ✅
```

### If You See Errors:
Run each SQL statement one at a time to identify which step fails.

---

## ✅ STEP 2: VERIFY BACKEND (ALREADY DONE!)

### Status: ✅ BACKEND IS HEALTHY

```json
{
  "status": "OK",
  "database": "Connected",
  "environment": "production",
  "version": "2.7.3-SERVICES-REVERTED"
}
```

**All endpoints active:**
- ✅ Auth
- ✅ Vendors  
- ✅ Services
- ✅ Bookings

**No action needed** - backend is ready!

---

## ✅ STEP 3: TEST EVERYTHING (5 minutes)

### Test 1: Document Upload

**Action:**
1. Open: https://weddingbazaarph.web.app/vendor/profile
2. Login: vendor0qw@mailinator.com / Test1234!
3. Click tab: **"Verification & Documents"**
4. Scroll to: **"Upload Business Documents"**
5. Click: **"Drop files here or click to browse"**
6. Select: Any PDF/image file
7. Document Type: **"Business License"**
8. Click: **Upload**

**Expected Result:**
```
✅ Document uploaded successfully!
✅ Document appears in list
✅ Status: Pending (or Approved if pre-approved)
✅ No UUID errors in console
```

**If It Fails:**
- Open DevTools (F12)
- Check Console tab for errors
- Look for "UUID" or "type" errors
- Verify SQL script ran successfully

---

### Test 2: Check Document in Database

**Action (optional):**
Run in Neon SQL Editor:
```sql
SELECT * FROM vendor_documents WHERE vendor_id = '2-2025-003';
```

**Expected Result:**
```
Should show at least 1 row with:
- vendor_id: '2-2025-003'
- document_type: 'business_license'
- verification_status: 'approved'
```

---

### Test 3: Service Creation

**Action:**
1. Go to: https://weddingbazaarph.web.app/vendor/services
2. Click: **"Add Service"** button
3. Fill form:
   - **Service Name**: Test Wedding Photography
   - **Category**: Photography
   - **Description**: Professional wedding photography services
   - **Location**: Manila, Philippines
   - **Price Range**: Any option
4. Click through steps (use Next button)
5. On final step, click: **"Create Service"**

**Expected Result:**
```
✅ Service created successfully!
✅ Success notification appears
✅ Service appears in list
✅ No document verification errors
```

**If It Fails:**
Check error message:
- **"Documents not verified"** → SQL script didn't run correctly
- **"UUID error"** → Schema wasn't changed
- **Other errors** → Check Render logs

---

## 🎯 SUCCESS CHECKLIST

After completing all 3 steps:

- [ ] SQL script executed without errors
- [ ] All 6+ SELECT statements returned results
- [ ] Backend health check shows "OK"
- [ ] Document upload succeeds
- [ ] No UUID errors in browser console
- [ ] Service creation form loads
- [ ] Service creation succeeds
- [ ] Service appears in vendor's list

---

## 🚨 TROUBLESHOOTING

### SQL Script Fails

**Error**: Foreign key constraint violation
**Fix**: Run DROP CONSTRAINT separately first

**Error**: Cannot cast UUID to VARCHAR
**Fix**: Verify you're using `USING vendor_id::text`

### Document Upload Fails

**Check 1**: Verify schema changed
```sql
SELECT data_type FROM information_schema.columns
WHERE table_name = 'vendor_documents' AND column_name = 'vendor_id';
```
Should show: `character varying`

**Check 2**: Clear browser cache (Ctrl+Shift+Delete)

**Check 3**: Check browser console for specific error

### Service Creation Blocked

**Check**: Verify approved document exists
```sql
SELECT * FROM vendor_documents 
WHERE vendor_id = '2-2025-003' 
AND verification_status = 'approved';
```
Should show at least 1 row

---

## 📞 NEED HELP?

**Check these in order:**
1. Neon SQL Editor - Did all statements succeed?
2. Browser Console (F12) - Any errors?
3. Render Logs - Any backend errors?
4. This checklist - Did you complete all steps?

---

**Time to Complete**: ~5 minutes  
**Difficulty**: Easy (just copy/paste!)  
**Status**: Ready to execute! 🚀
