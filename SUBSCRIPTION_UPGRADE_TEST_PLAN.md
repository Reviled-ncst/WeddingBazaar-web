# Subscription Upgrade Prompt - Comprehensive Test Plan

**Test Date**: October 29, 2025
**Environment**: Production (https://weddingbazaarph.web.app)
**Tester**: Automated & Manual Testing

---

## 🎯 Test Objectives
1. Verify upgrade prompt triggers correctly
2. Test free plan upgrade flow
3. Test paid plan upgrade flow (Premium, Professional)
4. Verify PayMongo integration
5. Check console logs are clean
6. Validate state management
7. Test error handling

---

## 📋 Pre-Test Checklist

### Environment Setup
- [ ] Production site deployed: https://weddingbazaarph.web.app
- [ ] Backend API running: https://weddingbazaar-web.onrender.com
- [ ] PayMongo TEST keys active
- [ ] Browser console open (F12)
- [ ] Network tab ready for API monitoring

### Test Accounts
- [ ] Vendor account logged in (ID: 2-2025-001)
- [ ] Vendor has FREE tier subscription
- [ ] Test credit card ready: 4343 4343 4343 4345

---

## 🧪 Test Cases

### Test Suite 1: Upgrade Prompt Display

#### TC1.1: Trigger Upgrade Prompt (Service Limit)
**Steps**:
1. Login as vendor (2-2025-001)
2. Navigate to /vendor/services
3. Try to add 6th service (FREE limit is 5)

**Expected**:
- ✅ Upgrade prompt modal appears
- ✅ Shows message: "Upgrade to unlock unlimited services"
- ✅ Displays all 3 plans: Free, Premium, Professional
- ✅ Console logs:
  ```
  🔔 [SubscriptionContext] showUpgradePrompt called: {...}
  ✅ [SubscriptionContext] Upgrade prompt state updated to SHOW
  ```

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

#### TC1.2: Verify Plan Details
**Steps**:
1. With upgrade prompt open
2. Inspect each plan card

**Expected**:
- ✅ **Free Plan**:
  - Price: ₱0.00 / month
  - "Current Plan" badge visible
  - Features: 5 services, basic support, standard listing
  - Button: "Current Plan" (disabled)

- ✅ **Premium Plan**:
  - Price: ₱299.00 / month
  - "Most Popular" badge visible
  - Features: 20 services, priority support, featured listing
  - Button: "Upgrade Now" (enabled, gradient)

- ✅ **Professional Plan**:
  - Price: ₱599.00 / month
  - Features: Unlimited services, 24/7 support, premium badge
  - Button: "Upgrade Now" (enabled, gradient)

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Suite 2: Free Plan Upgrade (Downgrade)

#### TC2.1: Click Free Plan Upgrade
**Steps**:
1. With upgrade prompt open
2. Click "Current Plan" button on Free tier

**Expected**:
- ✅ Button is disabled (grayed out)
- ✅ No modal opens
- ✅ No console logs (no action taken)

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Suite 3: Premium Plan Upgrade

#### TC3.1: Click Premium Upgrade Button
**Steps**:
1. With upgrade prompt open
2. Click "Upgrade Now" on Premium plan (₱299)

**Expected**:
- ✅ Payment modal opens immediately
- ✅ Modal shows:
  - Title: "Upgrade to Premium"
  - Amount: ₱299.00
  - Service Type: "Premium Subscription"
  - Payment method tabs: Card, GCash, PayMaya, GrabPay
- ✅ Console logs:
  ```
  🎯 [Subscription] Upgrade clicked: Premium (₱299.00)
  💳 [Subscription] Paid plan - opening payment modal
  ```

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

#### TC3.2: Test Card Payment Flow
**Steps**:
1. Payment modal open for Premium
2. Click "Card" tab
3. Fill in test card:
   - Card Number: 4343 4343 4343 4345
   - Expiry: 12/28
   - CVC: 123
   - Name: Test User
4. Click "Process Payment"

**Expected**:
- ✅ Loading spinner appears
- ✅ PayMongo API calls in Network tab:
  - POST /api/payment/create-intent
  - POST /api/payment/create-payment-method
  - POST /api/payment/attach-intent
  - POST /api/payment/process
- ✅ Success message appears
- ✅ Modal closes
- ✅ Subscription updated to Premium
- ✅ Console shows payment response log

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

#### TC3.3: Verify Subscription Update
**Steps**:
1. After successful payment
2. Refresh page
3. Navigate to /vendor/services
4. Try to add 6th service

**Expected**:
- ✅ No upgrade prompt appears
- ✅ Service can be added (Premium allows 20 services)
- ✅ Header shows "Premium" badge
- ✅ Features unlocked

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Suite 4: Professional Plan Upgrade

#### TC4.1: Click Professional Upgrade Button
**Steps**:
1. Open upgrade prompt again
2. Click "Upgrade Now" on Professional plan (₱599)

**Expected**:
- ✅ Payment modal opens
- ✅ Amount shows: ₱599.00
- ✅ Service Type: "Professional Subscription"
- ✅ Console logs:
  ```
  🎯 [Subscription] Upgrade clicked: Professional (₱599.00)
  💳 [Subscription] Paid plan - opening payment modal
  ```

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

#### TC4.2: Test E-Wallet Payment (GCash Simulation)
**Steps**:
1. Payment modal open for Professional
2. Click "GCash" tab
3. Click "Process Payment"

**Expected**:
- ✅ Loading spinner appears
- ✅ API call to create payment source
- ✅ Message: "GCash payment simulation (TEST mode)"
- ✅ Success message
- ✅ Subscription updated to Professional

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Suite 5: Error Handling

#### TC5.1: Test Invalid Card
**Steps**:
1. Open payment modal
2. Enter invalid card: 4000 0000 0000 0002
3. Click "Process Payment"

**Expected**:
- ✅ Error message appears
- ✅ Modal remains open
- ✅ User can retry
- ✅ No subscription change

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

#### TC5.2: Test Payment Cancellation
**Steps**:
1. Open payment modal
2. Click "×" (close button) or "Cancel"

**Expected**:
- ✅ Modal closes
- ✅ No payment processed
- ✅ Subscription unchanged
- ✅ No console errors

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

#### TC5.3: Test Double-Click Prevention
**Steps**:
1. Open upgrade prompt
2. Rapidly click "Upgrade Now" button 5 times

**Expected**:
- ✅ Only ONE payment modal opens
- ✅ Console shows:
  ```
  🎯 [Subscription] Upgrade clicked: Premium (₱299.00)
  💳 [Subscription] Paid plan - opening payment modal
  ⚠️ [Subscription] Already processing, ignoring duplicate click
  ⚠️ [Subscription] Already processing, ignoring duplicate click
  ...
  ```
- ✅ No duplicate API calls

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Suite 6: Console Log Verification

#### TC6.1: Check Console on Page Load
**Steps**:
1. Clear console (Ctrl+L)
2. Refresh /vendor page

**Expected**:
- ✅ No repetitive logs
- ✅ Only initialization logs (Firebase, ServiceManager)
- ✅ No render evaluation logs
- ✅ No routing logs

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

#### TC6.2: Check Console During Upgrade Flow
**Steps**:
1. Clear console
2. Trigger upgrade prompt
3. Click Premium upgrade
4. Complete payment

**Expected - Maximum 8 logs**:
1. `🔔 [SubscriptionContext] showUpgradePrompt called`
2. `✅ [SubscriptionContext] Upgrade prompt state updated to SHOW`
3. `🎯 [Subscription] Upgrade clicked: Premium (₱299.00)`
4. `💳 [Subscription] Paid plan - opening payment modal`
5. `📄 Step 7: Response body as text:` (payment response)
6. `❌ [SubscriptionContext] hideUpgradePrompt called`
7. `✅ [SubscriptionContext] Upgrade prompt state updated to HIDE`

**Expected NOT to see**:
- ❌ Render evaluation logs
- ❌ Modal state change logs
- ❌ Routing/navigation logs
- ❌ Repetitive debugging logs

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Suite 7: State Management

#### TC7.1: Verify State Persistence
**Steps**:
1. Upgrade to Premium
2. Close browser tab
3. Open new tab to /vendor
4. Check subscription status

**Expected**:
- ✅ User still shows Premium subscription
- ✅ Premium features accessible
- ✅ No downgrade to Free

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

#### TC7.2: Test Modal State Cleanup
**Steps**:
1. Open payment modal
2. Close modal without paying
3. Open upgrade prompt again
4. Click upgrade on different plan

**Expected**:
- ✅ New modal shows correct plan
- ✅ No state leakage from previous modal
- ✅ Amount is correct

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

### Test Suite 8: UI/UX Validation

#### TC8.1: Responsive Design
**Steps**:
1. Open upgrade prompt
2. Resize browser window (desktop → tablet → mobile)

**Expected**:
- ✅ Modal adapts to screen size
- ✅ Plan cards stack vertically on mobile
- ✅ All buttons remain accessible
- ✅ No UI overflow/breaking

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

#### TC8.2: Accessibility
**Steps**:
1. Open upgrade prompt
2. Test keyboard navigation (Tab, Enter, Esc)

**Expected**:
- ✅ Can tab through all buttons
- ✅ Enter key activates focused button
- ✅ Esc key closes modal
- ✅ Focus indicators visible

**Actual**: _[To be filled during test]_

**Status**: ⬜ Pass / ⬜ Fail

---

## 📊 Test Results Summary

| Test Suite | Total Tests | Passed | Failed | Pending |
|------------|-------------|--------|--------|---------|
| Upgrade Prompt Display | 2 | 0 | 0 | 2 |
| Free Plan | 1 | 0 | 0 | 1 |
| Premium Plan | 3 | 0 | 0 | 3 |
| Professional Plan | 2 | 0 | 0 | 2 |
| Error Handling | 3 | 0 | 0 | 3 |
| Console Logs | 2 | 0 | 0 | 2 |
| State Management | 2 | 0 | 0 | 2 |
| UI/UX | 2 | 0 | 0 | 2 |
| **TOTAL** | **17** | **0** | **0** | **17** |

---

## 🐛 Issues Found

### Critical Issues
_[To be documented during testing]_

### Minor Issues
_[To be documented during testing]_

### Suggestions
_[To be documented during testing]_

---

## 📝 Test Notes

### Environment Details
- **Browser**: _[To be filled]_
- **OS**: _[To be filled]_
- **Screen Resolution**: _[To be filled]_
- **Network Speed**: _[To be filled]_

### Observations
_[To be filled during testing]_

---

## ✅ Sign-Off

**Tester**: _________________________
**Date**: October 29, 2025
**Status**: ⬜ All Tests Passed / ⬜ Issues Found
**Ready for Production**: ⬜ Yes / ⬜ No

---

**Next Steps After Testing**:
1. Fix any critical issues found
2. Address minor issues
3. Update documentation
4. Deploy fixes if needed
5. Retest failed cases
