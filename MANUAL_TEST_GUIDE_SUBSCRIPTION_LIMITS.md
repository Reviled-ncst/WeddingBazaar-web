# 🧪 MANUAL TEST GUIDE - Subscription Limit Enforcement

**Date**: October 26, 2025  
**Status**: Ready for manual testing  
**Priority**: CRITICAL - Production Verification Required

---

## 🎯 TEST OBJECTIVE

Verify that the subscription limit enforcement system works correctly in production:
1. ✅ Frontend prevents service creation at limit
2. ✅ Backend returns 403 when limit exceeded
3. ✅ Upgrade modal appears with correct information
4. ✅ After upgrade, unlimited services can be created

---

## 📋 PRE-REQUISITES

### Required Accounts
- [ ] Production vendor account (or create new one)
- [ ] Access to Firebase console (for logs)
- [ ] Access to Render dashboard (for backend logs)

### URLs
- **Frontend**: https://weddingbazaarph.web.app
- **Backend API**: https://weddingbazaar-web.onrender.com
- **Subscription Endpoint**: https://weddingbazaar-web.onrender.com/api/subscriptions/vendor/{vendorId}

---

## 🧪 TEST SUITE

### Test 1: Create Fresh Vendor Account

**Steps**:
1. Navigate to https://weddingbazaarph.web.app
2. Click "Register" → "Vendor Account"
3. Fill in registration form:
   - Email: test-vendor-{timestamp}@test.com
   - Password: Test123456!
   - Business Name: Test Business
   - Business Type: Photography
4. Submit registration
5. Verify email (if required)
6. Login with credentials

**Expected Result**:
- ✅ Registration successful
- ✅ Logged in as vendor
- ✅ Can access vendor dashboard
- ✅ Can navigate to "Services" page

**Actual Result**:
- [ ] Pass
- [ ] Fail (Details: ______________________)

---

### Test 2: Check Initial Subscription Status

**Steps**:
1. Navigate to Vendor Dashboard
2. Check subscription badge/indicator
3. Note current plan and limits

**Expected Result**:
- ✅ Current Plan: Basic (Free)
- ✅ Service Limit: 5/5 services
- ✅ Current Count: 0/5

**Actual Result**:
- [ ] Pass
- [ ] Fail (Details: ______________________)

**API Verification** (Optional):
```bash
curl https://weddingbazaar-web.onrender.com/api/subscriptions/vendor/{YOUR_VENDOR_ID}
```

Expected Response:
```json
{
  "success": true,
  "subscription": {
    "plan_name": "basic",
    "plan": {
      "limits": {
        "max_services": 5
      }
    }
  }
}
```

---

### Test 3: Add Services Up To Limit

**Steps**:
1. Navigate to "Services" page
2. Click "Add New Service" button
3. Fill in service details:
   - Title: Test Service 1
   - Category: Photography
   - Description: Test description
   - Price Range: ₱10,000 - ₱50,000
4. Submit form
5. Verify service appears in list
6. Repeat steps 2-5 for services 2-5

**Expected Result**:
- ✅ Service 1 created successfully
- ✅ Service 2 created successfully
- ✅ Service 3 created successfully
- ✅ Service 4 created successfully
- ✅ Service 5 created successfully
- ✅ Service list shows 5 services
- ✅ No errors encountered

**Actual Result**:
- Service 1: [ ] Pass [ ] Fail
- Service 2: [ ] Pass [ ] Fail
- Service 3: [ ] Pass [ ] Fail
- Service 4: [ ] Pass [ ] Fail
- Service 5: [ ] Pass [ ] Fail

---

### Test 4: Attempt to Add 6th Service (Frontend Check)

**Steps**:
1. With 5 services already created
2. Click "Add New Service" button
3. Observe what happens

**Expected Result**:
- ✅ Upgrade modal appears IMMEDIATELY
- ✅ Service creation form does NOT open
- ✅ Modal shows:
  - Current plan: Basic
  - Current usage: 5/5 services
  - Upgrade suggestion: Premium plan
  - Benefits of Premium
- ✅ "Upgrade" button visible
- ✅ "Close" or "Maybe Later" button visible

**Actual Result**:
- [ ] Pass
- [ ] Fail (Details: ______________________)

**Screenshots Required**:
- [ ] Screenshot of upgrade modal

---

### Test 5: Try to Bypass Frontend Check (Backend Verification)

**Steps**:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Temporarily disable frontend check (if possible)
4. OR: Manually make API call:
```javascript
fetch('https://weddingbazaar-web.onrender.com/api/services', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    vendor_id: 'YOUR_VENDOR_ID',
    title: 'Bypass Test Service',
    description: 'Trying to bypass limit',
    category: 'Catering',
    price: 20000,
    is_active: true
  })
}).then(r => r.json()).then(console.log);
```

**Expected Result**:
- ✅ API returns 403 status
- ✅ Error message: "You've reached the maximum..."
- ✅ Response includes:
  - current_count: 5
  - limit: 5
  - current_plan: "basic"
  - suggested_plan: "premium"

**Actual Result**:
- [ ] Pass
- [ ] Fail (Details: ______________________)

**API Response** (paste here):
```json
{
  // Paste actual response
}
```

---

### Test 6: Upgrade to Premium Plan

**Steps**:
1. From upgrade modal, click "Upgrade to Premium"
2. OR: Navigate to subscription management page
3. Select Premium plan
4. Complete upgrade process (payment/confirmation)
5. Verify plan change

**Expected Result**:
- ✅ Upgrade process completes
- ✅ Plan badge updates to "Premium"
- ✅ Service limit shows "Unlimited" or very high number
- ✅ Confirmation message appears

**Actual Result**:
- [ ] Pass
- [ ] Fail (Details: ______________________)

**API Verification**:
```bash
curl https://weddingbazaar-web.onrender.com/api/subscriptions/vendor/{YOUR_VENDOR_ID}
```

Expected:
```json
{
  "subscription": {
    "plan_name": "premium",
    "plan": {
      "limits": {
        "max_services": -1  // -1 means unlimited
      }
    }
  }
}
```

---

### Test 7: Add Service After Upgrade

**Steps**:
1. With Premium plan active
2. Click "Add New Service"
3. Fill in service details:
   - Title: Premium Service 1
   - Category: Venues
   - Price Range: ₱100,000 - ₱200,000
4. Submit form

**Expected Result**:
- ✅ Service creation form opens normally (no modal)
- ✅ Service is created successfully
- ✅ No limit warnings or errors
- ✅ Service appears in list (total: 6 services)

**Actual Result**:
- [ ] Pass
- [ ] Fail (Details: ______________________)

---

### Test 8: Add Multiple Services (Stress Test)

**Steps**:
1. Continue adding services (7, 8, 9, 10...)
2. Verify no limits enforced

**Expected Result**:
- ✅ All services created successfully
- ✅ No limit errors
- ✅ Premium plan allows unlimited services

**Actual Result**:
- Services 7-10: [ ] Pass [ ] Fail
- Total services created: _______

---

## 📊 TEST RESULTS SUMMARY

### Frontend Checks
- [ ] ✅ Frontend limit check working
- [ ] ✅ Upgrade modal appears
- [ ] ✅ Modal UI is correct
- [ ] ✅ Modal provides clear upgrade path

### Backend Checks
- [ ] ✅ Backend returns 403 at limit
- [ ] ✅ Error message is informative
- [ ] ✅ Suggested plan is correct
- [ ] ✅ API response format matches spec

### Upgrade Flow
- [ ] ✅ Upgrade process works
- [ ] ✅ Plan updates correctly
- [ ] ✅ Limits removed after upgrade
- [ ] ✅ Service creation works post-upgrade

### User Experience
- [ ] ✅ No confusing error messages
- [ ] ✅ Clear feedback at each step
- [ ] ✅ Smooth workflow
- [ ] ✅ No data loss

---

## 🐛 ISSUES FOUND

### Issue 1: [Title]
**Severity**: [ ] Critical [ ] Major [ ] Minor [ ] Cosmetic  
**Description**: 

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**:

**Actual**:

**Screenshots/Logs**:

---

### Issue 2: [Title]
**Severity**: [ ] Critical [ ] Major [ ] Minor [ ] Cosmetic  
**Description**:

---

## ✅ SIGN-OFF

**Tester Name**: ___________________________  
**Date**: ______________  
**Time Spent**: _______ minutes  

**Overall Result**:
- [ ] ✅ All tests passed - Ready for production
- [ ] ⚠️  Minor issues found - Acceptable for production
- [ ] ❌ Critical issues found - Needs fixes before production

**Recommendation**:
- [ ] Approve for production
- [ ] Approve with monitoring
- [ ] Reject - requires fixes

**Notes**:


---

## 📝 ADDITIONAL VERIFICATION

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Performance
- [ ] Frontend check: < 50ms
- [ ] Backend API: < 200ms
- [ ] Modal render: Smooth
- [ ] No console errors

### Console Logs
**Frontend (Browser Console)**:
- [ ] Check for error messages
- [ ] Verify subscription data logs
- [ ] Check limit check messages

**Backend (Render Logs)**:
- [ ] Check for 403 responses
- [ ] Verify subscription queries
- [ ] Check for errors

---

**Test Document Version**: 1.0  
**Last Updated**: October 26, 2025  
**Next Review**: After production testing
