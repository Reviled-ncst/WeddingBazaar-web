# ✅ VISUAL EXECUTION CHECKLIST

Print this or keep it open while executing!

---

## 📋 STEP 1: SQL SCRIPT (30 seconds)

```
[ ] Open Neon Console (https://console.neon.tech)
[ ] Click SQL Editor
[ ] Open RUN_THIS_IN_NEON_NOW.sql
[ ] Select All (Ctrl+A)
[ ] Copy (Ctrl+C)
[ ] Paste in Neon
[ ] Click Run
[ ] Wait for all queries to complete
[ ] Verify: 8 results returned (no errors)
[ ] ✅ STEP 1 COMPLETE
```

**Expected Output:**
```
✅ ALTER TABLE (drop constraint)
✅ ALTER TABLE (change type)
✅ SELECT 1 row (shows "character varying")
✅ INSERT 1 row (new document)
✅ UPDATE 1 row (vendor verified)
✅ SELECT 1 row (document for 2-2025-003)
✅ SELECT 1 row (vendor info)
✅ SELECT 1 row (total count)
```

---

## 📋 STEP 2: BACKEND CHECK (Already Done!)

```
[✅] Backend Status: OK
[✅] Database: Connected
[✅] All Endpoints: Active
[✅] STEP 2 COMPLETE
```

---

## 📋 STEP 3: TESTING (5 minutes)

### Test 3A: Document Upload

```
[ ] Open: weddingbazaarph.web.app/vendor/profile
[ ] Login: vendor0qw@mailinator.com
[ ] Password: Test1234!
[ ] Click: "Verification & Documents" tab
[ ] Find: "Upload Business Documents" section
[ ] Click: "Drop files here..." or Browse
[ ] Select: Any PDF or image file
[ ] Choose: "Business License" from dropdown
[ ] Click: Upload button
[ ] ✅ See success message (no UUID error!)
```

**Success Indicators:**
- ✅ Upload progress bar appears
- ✅ "Document uploaded successfully" message
- ✅ Document appears in list
- ✅ No errors in browser console (F12)

---

### Test 3B: Service Creation

```
[ ] Go to: weddingbazaarph.web.app/vendor/services
[ ] Click: "Add Service" button
[ ] Fill: Service Name = "Test Photography"
[ ] Select: Category = "Photography"
[ ] Fill: Description = "Professional services"
[ ] Fill: Location = "Manila"
[ ] Click: Next (repeat for all steps)
[ ] On final step, click: "Create Service"
[ ] ✅ See success message
[ ] ✅ Service appears in list
```

**Success Indicators:**
- ✅ Form loads without errors
- ✅ All steps navigate correctly
- ✅ Submit succeeds (no "Documents not verified")
- ✅ Service card appears
- ✅ Service has status "Active"

---

## 🎉 FINAL VERIFICATION

```
[ ] SQL script ran without errors
[ ] Document upload works
[ ] Service creation works
[ ] No UUID errors anywhere
[ ] Backend logs show no errors
```

**If all checked:** 🎉 **SUCCESS!** All issues resolved!

---

## 🚨 IF SOMETHING FAILS

### SQL Script Issues:
```
[ ] Check Neon query results
[ ] Look for red error messages
[ ] Run statements one at a time
[ ] Verify vendor_id type changed
```

### Document Upload Issues:
```
[ ] Open browser console (F12)
[ ] Check for "UUID" errors
[ ] Verify SQL script succeeded
[ ] Clear cache (Ctrl+Shift+Delete)
[ ] Try again
```

### Service Creation Issues:
```
[ ] Check console for errors
[ ] Verify document exists in database
[ ] Check Render logs for backend errors
[ ] Verify vendor is verified
```

---

## 📞 QUICK DIAGNOSTICS

**Run these if issues occur:**

```sql
-- Check 1: Schema type
SELECT data_type FROM information_schema.columns
WHERE table_name = 'vendor_documents' AND column_name = 'vendor_id';
-- Should show: character varying

-- Check 2: Document exists
SELECT * FROM vendor_documents WHERE vendor_id = '2-2025-003';
-- Should show: at least 1 row

-- Check 3: Vendor verified
SELECT verified FROM vendors WHERE id = '2-2025-003';
-- Should show: true
```

```powershell
# Check 4: Backend healthy
Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health"
# Should show: status: "OK"
```

---

**Total Time**: ~6 minutes  
**Current Status**: Ready to start  
**Next Action**: Run SQL script! 🚀
