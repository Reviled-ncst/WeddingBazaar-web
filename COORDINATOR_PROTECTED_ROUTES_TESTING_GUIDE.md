# 🧪 Coordinator Protected Routes - Quick Testing Guide

**Purpose**: Verify that coordinator routes are properly protected and inaccessible to unauthorized users

---

## 🎯 Test Scenarios

### ✅ Test 1: Unauthenticated Access (Not Logged In)

**Steps**:
1. Open browser in **incognito/private mode**
2. Navigate to: `https://weddingbazaarph.web.app/coordinator/dashboard`
3. Press Enter

**Expected Result**: ✅ PASS
- Should redirect to homepage: `https://weddingbazaarph.web.app/`
- Should NOT see coordinator dashboard
- Should see login/register buttons

**Status**: ⚠️ NEEDS TESTING

---

### ✅ Test 2: Wrong Role Access (Vendor Account)

**Steps**:
1. Login as a **vendor** account
2. After login, you should be at: `/vendor`
3. Manually change URL to: `https://weddingbazaarph.web.app/coordinator/dashboard`
4. Press Enter

**Expected Result**: ✅ PASS
- Should redirect BACK to: `https://weddingbazaarph.web.app/vendor`
- Should NOT see coordinator dashboard
- Should see vendor dashboard

**Status**: ⚠️ NEEDS TESTING

---

### ✅ Test 3: Wrong Role Access (Couple Account)

**Steps**:
1. Login as a **couple/individual** account
2. After login, you should be at: `/individual`
3. Manually change URL to: `https://weddingbazaarph.web.app/coordinator/dashboard`
4. Press Enter

**Expected Result**: ✅ PASS
- Should redirect BACK to: `https://weddingbazaarph.web.app/individual`
- Should NOT see coordinator dashboard
- Should see couple dashboard

**Status**: ⚠️ NEEDS TESTING

---

### ✅ Test 4: Correct Role Access (Coordinator Account)

**Steps**:
1. Register/Login as a **coordinator** account
2. After login, you should be at: `/coordinator`
3. Try accessing other coordinator pages:
   - `/coordinator/weddings`
   - `/coordinator/clients`
   - `/coordinator/vendors`
   - `/coordinator/analytics`
   - `/coordinator/calendar`

**Expected Result**: ✅ PASS
- Should see coordinator dashboard
- All coordinator pages should load
- Should NOT be redirected
- Navigation should work correctly

**Status**: ⚠️ NEEDS TESTING

---

### ✅ Test 5: Login Redirect (Coordinator)

**Steps**:
1. Logout if logged in
2. Go to homepage: `https://weddingbazaarph.web.app/`
3. Click "Login" button
4. Enter coordinator credentials:
   - Email: `elealesantos06@gmail.com` (test account)
   - Password: (your password)
5. Click "Login"

**Expected Result**: ✅ PASS
- Should redirect to: `https://weddingbazaarph.web.app/coordinator`
- Should see coordinator dashboard
- Should see "Welcome, [Name]" or similar

**Status**: ⚠️ NEEDS TESTING

---

## 📋 Testing Checklist

Copy this checklist and mark tests as you complete them:

```
[ ] Test 1: Unauthenticated access blocked ✅
[ ] Test 2: Vendor cannot access coordinator routes ✅
[ ] Test 3: Couple cannot access coordinator routes ✅
[ ] Test 4: Coordinator can access all coordinator routes ✅
[ ] Test 5: Coordinator login redirects correctly ✅
```

---

## 🚨 What to Report

### ✅ If Tests PASS
Report: "All protected route tests passed ✅"

### ❌ If Any Test FAILS

**Report Format**:
```
Test Failed: [Test Number and Name]
Expected: [What should happen]
Actual: [What actually happened]
Browser: [Chrome/Firefox/Safari/Edge]
Screenshot: [Attach if possible]
Console Errors: [Copy from browser console]
```

**Example**:
```
Test Failed: Test 2 - Wrong Role Access (Vendor)
Expected: Redirect to /vendor
Actual: Stayed on /coordinator/dashboard and saw coordinator content
Browser: Chrome 120.0.6099.109
Screenshot: [attached]
Console Errors: 
  - Warning: User role mismatch
  - Error: RoleProtectedRoute failed to redirect
```

---

## 🔍 Additional Checks

### Check 1: JWT Token Verification
1. Login as coordinator
2. Open browser DevTools (F12)
3. Go to Application/Storage → Local Storage
4. Look for `auth_token` or `weddingbazaar_token`
5. Verify token exists and is not expired

### Check 2: Network Requests
1. Login as coordinator
2. Open browser DevTools (F12)
3. Go to Network tab
4. Navigate to `/coordinator/dashboard`
5. Check for:
   - ✅ 200 OK responses
   - ❌ No 401 Unauthorized errors
   - ❌ No 403 Forbidden errors

### Check 3: Console Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Login as coordinator
4. Navigate to `/coordinator/dashboard`
5. Verify:
   - ❌ No red errors
   - ✅ Green success messages (optional)
   - ⚠️ Yellow warnings are OK (non-critical)

---

## 🛠️ Troubleshooting

### Issue: "Still seeing coordinator dashboard after redirect"
**Fix**: Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: "Getting 404 errors"
**Fix**: 
1. Verify you're using the correct URL: `weddingbazaarph.web.app` (NOT `weddingbazaar-web.onrender.com`)
2. Clear browser cache
3. Try incognito/private mode

### Issue: "Login not working"
**Fix**:
1. Check credentials are correct
2. Check backend is running: https://weddingbazaar-web.onrender.com/api/health
3. Check browser console for errors
4. Try a different browser

### Issue: "Stuck on loading screen"
**Fix**:
1. Wait 30 seconds (backend cold start)
2. Refresh page
3. Check network connection
4. Check backend health endpoint

---

## 📝 Testing Notes

- **Test in Multiple Browsers**: Chrome, Firefox, Safari, Edge
- **Test in Incognito Mode**: Prevents cache issues
- **Clear Cache Between Tests**: Ensures clean state
- **Document All Failures**: Screenshots and console errors help debugging
- **Test on Multiple Devices**: Desktop, tablet, mobile

---

## ✅ Sign-Off

After completing all tests:

**Tester Name**: ___________________  
**Date**: ___________________  
**Tests Passed**: ___ / 5  
**Status**: ⚠️ PENDING / ✅ ALL PASS / ❌ FAILURES FOUND  

**Notes**:
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

---

**Quick Reference**:
- Production URL: https://weddingbazaarph.web.app
- Backend URL: https://weddingbazaar-web.onrender.com
- Test Coordinator: elealesantos06@gmail.com
- Documentation: COORDINATOR_PROTECTED_ROUTES_VERIFICATION.md
