# 🎯 STEP-BY-STEP: Test the JWT Fix (WITH CACHE CLEAR)

## 🚨 START HERE: Clear Browser Cache FIRST!

### Step 0: CLEAR CACHE (CRITICAL!)

**Choose ONE method:**

**Option A: DevTools Hard Reload (EASIEST)**
1. Open https://weddingbazaarph.web.app
2. Press `F12` to open DevTools
3. **Right-click** the refresh button (next to address bar)
4. Select "**Empty Cache and Hard Reload**"

**Option B: Keyboard Shortcut**
1. Press `Ctrl + Shift + R` (Windows)
2. Or `Cmd + Shift + R` (Mac)

**Option C: Incognito Mode (SAFEST)**
1. Press `Ctrl + Shift + N` (Windows) or `Cmd + Shift + N` (Mac)
2. Navigate to https://weddingbazaarph.web.app

---

## ✅ Step 1: Verify New Code is Loaded

After clearing cache, open DevTools Console and look for:

### ✅ GOOD (New Code):
```javascript
📥 Step 3: Getting backend JWT token from localStorage...
```

### ❌ BAD (Old Cached Code):
```javascript
🔍 Step 4: Getting Firebase ID token...
```

**If you see the BAD log, clear cache again!**

---

## 🔐 Step 2: Login as Vendor

1. Go to: https://weddingbazaarph.web.app
2. Click "Login" button
3. Enter vendor credentials:
   - Email: `alison.ortega5@gmail.com`
   - Password: `[your password]`
4. Click "Sign In"

**Verify:** You should be redirected to vendor dashboard

---

## 📊 Step 3: Navigate to Vendor Services

1. Click "Services" in the sidebar
2. Or go directly to: https://weddingbazaarph.web.app/vendor/services

**Verify:** You see "My Services" page with your current subscription

---

## 💎 Step 4: Trigger Upgrade Prompt

**Option A: If you have services**
1. Click "Add Service" button
2. If you've hit the limit, upgrade prompt appears

**Option B: Manual trigger**
1. Look for "Upgrade" or "Premium" buttons
2. Click to open upgrade modal

**Verify:** Upgrade prompt modal appears with plan options

---

## 💳 Step 5: Select Plan & Pay

1. **Select** "Premium" plan (₱5.00)
2. Click "**Upgrade Now**" button
3. PayMongo modal opens
4. **Enter test card:**
   - Card Number: `4343 4343 4343 4345`
   - Expiry: `12/25`
   - CVC: `123`
   - Name: `Test User`
5. Click "**Pay Now**"

**Verify:** Payment processing animation appears

---

## 👀 Step 6: Watch Console Logs

**Keep DevTools Console open** and watch for these logs:

### Payment Phase (PayMongo)
```javascript
💳 [STEP 1] Creating PayMongo payment intent...
✅ [STEP 1] Payment intent created: pi_XXX
💳 [STEP 2] Creating PayMongo payment method...
✅ [STEP 2] Payment method created: pm_XXX
💳 [STEP 3] Attaching payment method to intent...
✅ [STEP 3] Payment processed, status: succeeded
✅ Card payment processed successfully
```

### Callback Phase (Upgrade Logic)
```javascript
🎉 User confirmed successful payment, calling callback
⏳ Calling onPaymentSuccess callback...
🎯🎯🎯 [UPGRADE] handlePaymentSuccess CALLED!
```

### JWT Authentication Phase ⭐ KEY PART
```javascript
✅ Step 1: selectedPlan validated
💳 Step 2: Payment Success for Premium plan
✅ Step 3: Vendor ID validated: ac8df757-XXX
📥 Step 3: Getting backend JWT token from localStorage...  ← MUST SEE THIS!
✅ Step 4: Backend JWT token validated (length: XXX)  ← MUST SEE THIS!
```

### API Call Phase
```javascript
📦 Step 5: Building upgrade payload...
📦 Step 5: Payload built: { vendor_id: "...", new_plan: "premium", ... }
📤 Step 6: Making API call to upgrade endpoint
🌐 Backend URL: https://weddingbazaar-web.onrender.com
🌐 Full API URL: https://weddingbazaar-web.onrender.com/api/subscriptions/payment/upgrade
✅ Step 6: Fetch completed without throwing
```

### Response Phase ⭐ KEY SUCCESS
```javascript
📥 Step 7: Analyzing response...
📥 Response status: 200  ← MUST BE 200, NOT 401!
📥 Response OK: true
```

### Success Phase ⭐ FINAL CONFIRMATION
```javascript
✅ Step 8: Successfully upgraded vendor XXX to the Premium plan!  ← VICTORY!
🎉 Subscription upgraded successfully!
```

---

## ✅ Step 7: Verify UI Updates

After Step 8 appears in console:

1. **Upgrade modal closes automatically**
2. **Success message appears** (green notification)
3. **Page refreshes** or updates
4. **New subscription tier shows** in UI
5. **Service limit increases**

---

## 🎉 Step 8: Verify Functionality

1. **Click "Add Service"** again
2. Should **NOT** see upgrade prompt (if within new limit)
3. Should be able to **add services** up to new tier limit

---

## ❌ Troubleshooting

### If you see "401 Unauthorized"
```javascript
📥 Response status: 401  ← BAD!
```

**Possible causes:**
1. Browser still using cached code
2. JWT token missing or expired

**Solutions:**
1. **Clear cache again** (Ctrl + Shift + R)
2. **Log out and log back in** (refreshes JWT token)
3. **Try Incognito window**

---

### If you see Firebase token logs
```javascript
🔍 Step 4: Getting Firebase ID token...  ← OLD CODE!
```

**This means browser is STILL using cached JavaScript!**

**Solutions:**
1. **Force hard refresh:** Ctrl + Shift + R
2. **Close all tabs** and reopen
3. **Restart browser completely**
4. **Use Incognito mode** (guaranteed fresh)

---

### If Step 8 never appears

**Check which step failed:**

1. Look at last successful step in console
2. Check for any error messages
3. Check Network tab for failed requests

**Common issues:**
- Step 3-4 fails: JWT token not found → Log out and log back in
- Step 6-7 fails: Network error → Check backend status
- Step 7 shows 401: Token invalid → Log out and log back in

---

## 📊 Complete Success Flow

```
User Action                  Console Log                               Result
───────────────────────────  ────────────────────────────────────────  ──────────────────
1. Clear cache               (Browser clears cached JS)                Fresh code loaded
2. Login                     ✅ User logged in                         JWT token stored
3. Open services page        📊 Current subscription: pro              Page loads
4. Click "Upgrade"           🚀 Opening upgrade modal                  Modal opens
5. Select plan               🎯 handleUpgradeClick called              Plan selected
6. Enter card details        💳 Processing payment...                  Card validated
7. Click "Pay Now"           ✅ Payment succeeded                      PayMongo confirms
8. Payment success callback  🎯🎯🎯 handlePaymentSuccess CALLED!        Upgrade starts
9. Get JWT from localStorage 📥 Step 3: Getting backend JWT token...   Token retrieved
10. Validate JWT             ✅ Step 4: Backend JWT token validated    Token OK
11. Build payload            📦 Step 5: Payload built                  Data ready
12. Call API                 📤 Step 6: Making API call                Request sent
13. Backend responds         📥 Step 7: Response status: 200           Success!
14. Process response         ✅ Step 8: Successfully upgraded!         DONE! 🎉
15. UI updates               🎉 Subscription upgraded                  User sees change
```

---

## 🎯 Critical Success Indicators

| Indicator | Expected Value | Status |
|-----------|---------------|--------|
| Cache cleared | New bundle loaded | ⏳ You must do this |
| JWT token | From localStorage | ✅ Fixed in code |
| API response | 200 OK | ✅ Should work now |
| Step 8 logs | Appears in console | ✅ Should appear now |
| UI update | Subscription changes | ✅ Should update |

---

## 📝 Test Report Template

After testing, please fill out:

```
TEST DATE: _______________
TESTER: _______________
CACHE CLEARED: [ ] Yes [ ] No

CONSOLE LOGS:
[ ] Step 3: Getting backend JWT token ← MUST CHECK
[ ] Step 4: Backend JWT token validated
[ ] Step 7: Response status 200
[ ] Step 8: Successfully upgraded

RESULT:
[ ] SUCCESS - All steps passed
[ ] FAILURE - See notes below

NOTES:
_______________________________________
_______________________________________
```

---

## 🚀 Ready to Test!

**Remember:**
1. ✅ Clear cache FIRST (Ctrl + Shift + R or Incognito)
2. ✅ Watch for "Getting backend JWT token" log
3. ✅ Verify response status is 200, not 401
4. ✅ Confirm Step 8 appears in console

**Good luck! The fix is deployed and ready! 🎉**
