# 🧪 FINAL TEST INSTRUCTIONS - Subscription Upgrade Flow

## ⚡ Quick Start

**What to test:** Vendor subscription upgrade after successful PayMongo payment  
**Expected result:** Payment → Backend upgrade → UI update → More services available

## 📝 Prerequisites

1. **Vendor account** (registered and logged in)
2. **Test card:** `4343434343434345`, exp: `12/25`, CVC: `123`
3. **Browser DevTools:** Open Console tab (F12)
4. **Current subscription:** Free or Basic tier

## 🎯 Test Steps

### Step 1: Navigate to Vendor Services
1. Go to: https://weddingbazaarph.web.app
2. Login as vendor
3. Navigate to: `/vendor/services`
4. Note your current subscription plan

### Step 2: Trigger Upgrade Prompt
**Option A:** Hit service limit
- Click "Add Service" button
- If you've hit the limit, upgrade prompt appears

**Option B:** Manual trigger
- Look for "Upgrade" or "Premium" buttons
- Click to open upgrade prompt

### Step 3: Select Plan
1. Review available plans in the modal
2. Select a premium plan (e.g., "Professional" - ₱999)
3. Click "Upgrade Now" button

### Step 4: Complete Payment
1. **PayMongo modal** should open
2. Enter test card details:
   - Card number: `4343434343434345`
   - Expiry: `12/25` (or any future date)
   - CVC: `123` (or any 3 digits)
3. Click "Pay Now"
4. Wait for payment processing (5-10 seconds)

### Step 5: Monitor Console Logs

**Open DevTools > Console** and watch for these logs:

```javascript
// Payment phase
✅ Step 1: Payment successful from PayMongo
✅ Step 2: Payment modal closed successfully

// Authentication phase
✅ Step 3: Getting backend JWT token from localStorage...
✅ Step 4: Backend JWT token validated (length: XXX)

// API call phase
📦 Step 5: Building upgrade payload...
📦 Step 5: Payload built: { vendor_id: "...", new_plan: "...", ... }
📤 Step 6: Making API call to upgrade endpoint
🌐 Backend URL: https://weddingbazaar-web.onrender.com
🌐 Full API URL: https://weddingbazaar-web.onrender.com/api/subscriptions/payment/upgrade
✅ Step 6: Fetch completed without throwing

// Response phase
📥 Step 7: Analyzing response...
📥 Response status: 200  ← CRITICAL: Must be 200, not 401!
📥 Response OK: true

// Success phase
✅ Step 8: Successfully upgraded vendor XXX to the Professional plan!  ← KEY SUCCESS!
🎉 Subscription upgraded successfully!
```

### Step 6: Verify UI Updates
After Step 8 appears:
1. Upgrade prompt should close automatically
2. Success message should appear
3. Service list should refresh
4. New subscription tier should be visible
5. Service limit should increase

### Step 7: Verify Functionality
1. Click "Add Service" again
2. Should NOT see upgrade prompt (if within new limit)
3. Should be able to add services up to new tier limit

## ✅ Success Criteria

| Check | Expected Result |
|-------|----------------|
| Payment | ✅ PayMongo processes successfully |
| Token | ✅ Backend JWT token found in localStorage |
| API Call | ✅ Fetch completes without errors |
| Response | ✅ Status 200 (not 401 Unauthorized) |
| Step 8 | ✅ Success log appears in console |
| UI Update | ✅ Upgrade prompt closes |
| Subscription | ✅ New tier shown in UI |
| Service Limit | ✅ Can add more services |

## ❌ Failure Indicators

### If you see **401 Unauthorized**:
```javascript
📥 Response status: 401  ← BAD!
📥 Response OK: false
```
**Diagnosis:**
- Backend JWT token missing or invalid
- User may need to log out and log back in
- Token may be expired (24h expiry)

**Fix:**
1. Log out
2. Log back in
3. Try payment again

### If you see **Step 8 never appears**:
**Possible causes:**
1. Earlier step failed (check console)
2. Network error (check Network tab)
3. JSON parsing error (check error logs)
4. Backend returned error (check response)

**Debug:**
1. Check which step failed
2. Look for error messages in console
3. Check Network tab for failed requests
4. Try refreshing page and starting over

### If you see **HTML parsing error**:
```javascript
Error: Unexpected token '<' in JSON
```
**Diagnosis:** Frontend calling wrong URL (getting HTML instead of JSON)

**This should NOT happen** - we fixed this already!

## 🔍 Debugging Commands

### Check JWT Token in Browser
Open Console and run:
```javascript
// Check if token exists
console.log('JWT Token:', localStorage.getItem('auth_token'));

// Check token length
const token = localStorage.getItem('auth_token');
console.log('Token length:', token?.length);
console.log('Token first 20 chars:', token?.substring(0, 20));

// Check token is valid JWT format (should have 3 parts)
const parts = token?.split('.');
console.log('Token parts:', parts?.length); // Should be 3
```

### Verify Backend Endpoint (PowerShell)
```powershell
# Test backend health
Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health"

# Test subscription plans endpoint
Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/subscriptions/plans"
```

Expected: Both return 200 OK

## 📊 What Each Step Does

| Step | Purpose | What to Check |
|------|---------|---------------|
| 1 | Payment success | PayMongo confirms payment |
| 2 | Modal closes | Payment modal dismissed |
| 3-4 | Token retrieval | JWT found in localStorage |
| 5 | Build payload | Vendor ID, plan, payment details |
| 6 | API call | Fetch to backend endpoint |
| 7 | Response check | Status 200, response OK |
| 8 | Process success | Parse JSON, update subscription |

**Step 8 is the KEY** - if this appears, everything worked!

## 🎯 Expected Timeline

| Phase | Duration | What's Happening |
|-------|----------|------------------|
| Payment processing | 5-10 seconds | PayMongo validates card |
| Modal closing | <1 second | UI cleanup |
| Token retrieval | <0.1 second | Read from localStorage |
| Payload building | <0.1 second | Construct JSON |
| API call | 1-3 seconds | Network request |
| Backend processing | 1-2 seconds | Verify, update DB |
| Response parsing | <0.1 second | Read JSON |
| UI update | <1 second | Close prompt, refresh |

**Total:** ~10-20 seconds from "Pay Now" to "Step 8"

## 📸 Screenshot Checklist

Please capture:
1. ✅ Initial subscription tier (before payment)
2. ✅ Payment modal with test card
3. ✅ Console logs showing Steps 1-8
4. ✅ Success message after upgrade
5. ✅ Updated subscription tier (after payment)
6. ✅ New service limit in UI

## 📝 Test Report Template

```
TEST DATE: [Date]
TESTER: [Name]
VENDOR EMAIL: [Email]

INITIAL STATE:
- Subscription: [Free/Basic/Professional]
- Services count: [X/Y]

TEST RESULTS:
[ ] Step 1: Payment successful
[ ] Step 2: Modal closed
[ ] Step 3-4: JWT token validated
[ ] Step 5: Payload built
[ ] Step 6: API call completed
[ ] Step 7: Response 200 OK
[ ] Step 8: Upgrade success logged
[ ] UI updated with new tier
[ ] Can add more services

FINAL STATE:
- Subscription: [New tier]
- Services count: [X/Y]

ISSUES ENCOUNTERED:
[None / Describe any issues]

CONSOLE LOGS:
[Paste relevant logs]

CONCLUSION:
[ ] PASS - All steps completed successfully
[ ] FAIL - See issues above
```

## 🚨 Emergency Rollback

If critical issues occur:

1. **Frontend:** Redeploy previous version
   ```powershell
   git checkout [previous-commit]
   npm run build
   firebase deploy
   ```

2. **Backend:** Render auto-deploys from git
   - Revert commit in GitHub
   - Render will auto-redeploy

3. **Database:** No schema changes made
   - No rollback needed

## 📞 Support

If you encounter issues:
1. Check this document first
2. Review console logs
3. Check Network tab for API calls
4. Document exact steps to reproduce
5. Include screenshots and logs

---

## 🎉 You're Ready!

This is the **FINAL TEST** after fixing:
1. ✅ URL pointing to backend
2. ✅ Endpoint path correction
3. ✅ JWT authentication fix

**All known issues are resolved. Time to verify in production!**

**Good luck and happy testing! 🚀**

---

**Last Updated:** 2024-01-XX  
**Version:** 1.0 - Final Test Instructions  
**Status:** Ready for UAT
