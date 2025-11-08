# 🧪 VENDOR REGISTRATION TEST SCRIPT

**Run this test to verify the fix works in production**

---

## 📋 TEST CHECKLIST

### ✅ **Test 1: Complete Vendor Registration**

**Time:** 5 minutes

**Steps:**
1. Open https://weddingbazaarph.web.app
2. Click "Register" button (top right)
3. Select "Vendor" tab
4. Fill in the following:

```
PERSONAL INFORMATION:
First Name: TestVendor
Last Name: Photography
Email: testvendor[RANDOM_NUMBER]@gmail.com  ← Use unique email
Phone: 09123456789

BUSINESS INFORMATION:
Business Name: Test Photography Studio
Business Category: Photography (select from dropdown)
Vendor Type: Business (select radio button)
Business Location: Manila, Philippines

PASSWORD:
Password: test123456
Confirm Password: test123456

TERMS:
☑ I agree to Terms of Service and Privacy Policy
```

5. Click "Create Account" button
6. **Open Browser Console (F12)**
7. **Check for these logs:**

```javascript
✅ Should see:
🚀 RegisterModal: Starting registration process...
📧 RegisterModal: User email: testvendor...@gmail.com
👤 RegisterModal: User type: vendor
📱 RegisterModal: Form data: {
  ...
  business_name: "Test Photography Studio"  ← VERIFY THIS EXISTS
  business_type: "Photography"              ← VERIFY THIS EXISTS
  location: "Manila, Philippines"           ← VERIFY THIS EXISTS
  vendor_type: "business"                   ← VERIFY THIS EXISTS
}
✅ Vendor field validation passed           ← VERIFY THIS APPEARS
```

8. **Check Network Tab:**
   - Filter by "register"
   - Click on the request
   - Go to "Payload" or "Request" tab
   - Verify JSON contains:
     ```json
     {
       "business_name": "Test Photography Studio",
       "business_type": "Photography",
       "location": "Manila, Philippines",
       "vendor_type": "business"
     }
     ```

9. **Expected Result:**
   - ✅ Registration succeeds
   - ✅ Success message appears
   - ✅ Redirected to vendor dashboard
   - ✅ Can see vendor menu (Dashboard, Services, etc.)

**Result:** [ ] PASS  [ ] FAIL

**If FAIL, note error:** ______________________________

---

### ✅ **Test 2: Verify Database Entry**

**Time:** 2 minutes

**Method 1: Check via Neon SQL Console**
```sql
-- Find the user
SELECT id, email, first_name, last_name, role, phone 
FROM users 
WHERE email LIKE 'testvendor%@gmail.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Copy the `id` (e.g., `2-2025-020`)**

```sql
-- Check vendor profile
SELECT * FROM vendors WHERE user_id = '2-2025-020';  -- Use the ID from above

-- OR if using new table
SELECT * FROM vendor_profiles WHERE user_id = '2-2025-020';
```

**Expected:**
```
✅ User exists in users table
✅ Vendor profile exists in vendors/vendor_profiles table
✅ business_name = "Test Photography Studio" (NOT auto-generated)
✅ business_type = "Photography" (NOT "other")
✅ location = "Manila, Philippines" (NOT NULL)
✅ vendor_type = "business" (NOT NULL)
```

**Result:** [ ] PASS  [ ] FAIL

---

### ✅ **Test 3: Service Creation Test**

**Time:** 3 minutes

**Steps:**
1. Login as the test vendor (if not already logged in)
2. Navigate to **Vendor Dashboard → Services**
3. Click **"Add Service"** button
4. Fill out service form:
   ```
   Service Name: Wedding Photography Package
   Category: Photography
   Price: 50000
   Description: Professional wedding photography
   ```
5. Click "Save Service" or "Add Service"

**Expected:**
- ✅ Service form submits successfully
- ✅ **NO 403 ERRORS** in console
- ✅ Service appears in your services list
- ✅ Can view the service details

**Result:** [ ] PASS  [ ] FAIL

**If 403 error:**
- Check console for error message
- Check if vendor_id is being sent correctly
- Verify vendor profile exists in database

---

### ✅ **Test 4: Validation Test (Empty Fields)**

**Time:** 2 minutes

**Steps:**
1. Open registration page again
2. Select "Vendor"
3. Fill ONLY personal info (name, email, password)
4. **Leave Business fields EMPTY**
5. Try to submit

**Expected:**
- ❌ Form should NOT submit
- ❌ Should see red error messages:
  - "Business name is required"
  - "Business category is required"
  - "Business location is required"

**Result:** [ ] PASS  [ ] FAIL

---

### ✅ **Test 5: Console Validation Check**

**Time:** 2 minutes

**Steps:**
1. Open registration page
2. Open Browser Console (F12)
3. Fill vendor form with EMPTY business name
4. Try to submit
5. Check console

**Expected Console Output:**
```javascript
❌ VALIDATION FAILED: business_name is empty!
```

**Result:** [ ] PASS  [ ] FAIL

---

## 📊 OVERALL TEST RESULTS

**Test Summary:**
- Test 1 (Registration): [ ] PASS [ ] FAIL
- Test 2 (Database): [ ] PASS [ ] FAIL
- Test 3 (Service Creation): [ ] PASS [ ] FAIL
- Test 4 (Validation): [ ] PASS [ ] FAIL
- Test 5 (Console): [ ] PASS [ ] FAIL

**Total Passed:** ___ / 5

**Status:** 
- 5/5 = ✅ ALL TESTS PASSED - FIX CONFIRMED
- 4/5 = ⚠️ MOSTLY WORKING - Minor issues
- 3/5 or less = ❌ FIX NOT WORKING - Investigate

---

## 🐛 TROUBLESHOOTING

### **Issue: "Business name is required" even though I filled it**

**Possible Causes:**
1. Field not focused (click inside field)
2. Spaces only (type real text)
3. Form not re-rendering (refresh page)

**Fix:**
- Refresh page and try again
- Use different browser (try Chrome/Firefox)
- Clear browser cache

---

### **Issue: 403 Error when creating service**

**Possible Causes:**
1. Vendor profile not created
2. Using wrong vendor_id
3. Backend authorization issue

**Check:**
```sql
-- Verify vendor profile exists
SELECT * FROM vendors WHERE user_id = '[YOUR_USER_ID]';
```

**Fix:**
- If no vendor profile: Run manual SQL fix (see VENDOR_002_VS_019_ANALYSIS.md)
- If profile exists: Check backend logs for authorization errors

---

### **Issue: Registration succeeds but no vendor profile**

**This is the original bug!**

**Check:**
1. Browser console for errors
2. Network tab for request payload
3. Backend logs for vendor creation errors

**Report:**
- Email used
- Console logs
- Network request payload
- Backend error messages

---

## 📞 QUICK DATABASE CHECK

**Run this in Neon SQL Console:**

```sql
-- Check latest vendor registration
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  u.created_at,
  v.business_name,
  v.business_type,
  v.location,
  v.vendor_type,
  CASE 
    WHEN v.id IS NULL THEN '❌ NO VENDOR PROFILE'
    WHEN v.business_name LIKE '%Business' THEN '⚠️ AUTO-GENERATED'
    WHEN v.business_type = 'other' THEN '⚠️ GENERIC TYPE'
    WHEN v.location IS NULL THEN '⚠️ MISSING LOCATION'
    ELSE '✅ COMPLETE PROFILE'
  END as profile_status
FROM users u
LEFT JOIN vendors v ON u.id = v.user_id
WHERE u.role = 'vendor'
  AND u.email LIKE 'testvendor%@gmail.com'
ORDER BY u.created_at DESC
LIMIT 5;
```

**Expected Output:**
```
| id          | email                 | first_name | business_name                | profile_status    |
|-------------|-----------------------|------------|------------------------------|-------------------|
| 2-2025-020  | testvendor123@...     | TestVendor | Test Photography Studio      | ✅ COMPLETE PROFILE |
```

**If you see:**
- ❌ NO VENDOR PROFILE → **FIX FAILED**
- ⚠️ AUTO-GENERATED → **OLD DATA** (before fix)
- ⚠️ GENERIC TYPE → **INCOMPLETE** (old registration)
- ✅ COMPLETE PROFILE → **FIX WORKING!**

---

## ✅ SUCCESS INDICATORS

**Fix is working if:**

1. ✅ Console shows: "✅ Vendor field validation passed"
2. ✅ Network request contains: business_name, business_type, location
3. ✅ Database has: Complete vendor profile (not auto-generated)
4. ✅ Can create services: No 403 errors
5. ✅ Validation works: Empty fields are caught

**Fix is NOT working if:**

1. ❌ No vendor profile in database
2. ❌ Business name is auto-generated (e.g., "testvendor123 Business")
3. ❌ Cannot create services (403 errors)
4. ❌ Console shows validation errors even with filled fields

---

## 📝 REPORT TEMPLATE

**Copy this and fill it out:**

```
TEST RUN DATE: _______________
TESTER: _______________

TEST RESULTS:
✅ Registration: [ ] PASS [ ] FAIL
✅ Database Entry: [ ] PASS [ ] FAIL  
✅ Service Creation: [ ] PASS [ ] FAIL
✅ Validation: [ ] PASS [ ] FAIL
✅ Console Logs: [ ] PASS [ ] FAIL

VENDOR PROFILE CREATED:
- User ID: _______________
- Email: _______________
- Business Name: _______________
- Business Type: _______________
- Location: _______________

ISSUES FOUND:
[ ] None - All tests passed
[ ] Vendor profile not created
[ ] Auto-generated business name
[ ] Missing location
[ ] 403 errors on service creation
[ ] Other: _______________

SCREENSHOTS:
[ ] Registration form filled
[ ] Browser console logs
[ ] Network request payload
[ ] Database query results
[ ] Service creation success/error

OVERALL RESULT:
[ ] ✅ FIX CONFIRMED - All tests passed
[ ] ⚠️ PARTIAL FIX - Some issues remain
[ ] ❌ FIX FAILED - Original issue persists

NOTES:
_____________________________________
_____________________________________
_____________________________________
```

---

**Good luck with testing! 🚀**

**Production Site:** https://weddingbazaarph.web.app

**Next Step:** Run Test 1 now and report results!

---
