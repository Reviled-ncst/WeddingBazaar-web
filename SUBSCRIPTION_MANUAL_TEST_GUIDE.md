# 🧪 Subscription Upgrade - Step-by-Step Manual Test Guide

**Date**: October 29, 2025  
**Tester**: ___________________________  
**Environment**: Production (https://weddingbazaarph.web.app)

---

## 🎯 Quick Start

1. Open this guide in one window
2. Open https://weddingbazaarph.web.app in another window
3. Open browser DevTools (F12) - Console tab
4. Follow each step below
5. Check boxes ✅ as you complete each step

---

## ⚙️ SETUP (5 minutes)

### Step 1: Open Production Site
- [ ] Navigate to: https://weddingbazaarph.web.app
- [ ] Verify site loads successfully
- [ ] Check console for errors (should be minimal)

### Step 2: Login as Vendor
- [ ] Click "Login" button
- [ ] Enter credentials:
  - Email: `renzrusselbauto@gmail.com` (or your vendor email)
  - Password: `your-password`
- [ ] Click "Sign In"
- [ ] Verify redirect to `/vendor`

### Step 3: Verify Current Subscription
- [ ] Check header for subscription badge
- [ ] Should show: **"Free"** tier
- [ ] Note current subscription status: ________________

---

## 🧪 TEST 1: Trigger Upgrade Prompt (5 minutes)

### Goal: Exceed free plan limits to trigger upgrade prompt

#### Steps:
1. **Navigate to Services Page**
   - [ ] Click "Services" in sidebar (or go to `/vendor/services`)
   - [ ] Page loads successfully

2. **Count Current Services**
   - [ ] Check "My Services" section
   - [ ] Current service count: _______ (Free limit is 5)

3. **Trigger Limit (if < 5 services)**
   - [ ] Click "Add Service" button
   - [ ] Fill out service form quickly (dummy data okay)
   - [ ] Submit service
   - [ ] Repeat until you have 5 services

4. **Exceed Limit (Trigger Prompt)**
   - [ ] Click "Add Service" button again (6th time)
   - [ ] **EXPECTED**: Upgrade prompt modal appears
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

5. **Verify Console Logs**
   - [ ] Check console for:
     ```
     🔔 [SubscriptionContext] showUpgradePrompt called: {...}
     ✅ [SubscriptionContext] Upgrade prompt state updated to SHOW
     ```
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail
   - [ ] Log count: _______ (should be 2)

6. **Inspect Upgrade Prompt UI**
   - [ ] Modal has glassmorphism effect (blur + transparency)
   - [ ] Title: "Upgrade Your Subscription"
   - [ ] Subtitle visible
   - [ ] 3 plan cards visible (Free, Premium, Professional)
   - [ ] Close button (×) in top-right
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

---

## 🧪 TEST 2: Verify Plan Details (3 minutes)

### Goal: Ensure all plans display correctly

#### Free Plan Card:
- [ ] **Price**: ₱0.00 / month
- [ ] **Badge**: "Current Plan" (blue)
- [ ] **Features**:
  - [ ] ✓ Up to 5 active services
  - [ ] ✓ Basic customer support
  - [ ] ✓ Standard listing in directory
  - [ ] ✓ Basic analytics
- [ ] **Button**: "Current Plan" (disabled, gray)
- [ ] **RESULT**: ⬜ Pass / ⬜ Fail

#### Premium Plan Card:
- [ ] **Price**: ₱299.00 / month
- [ ] **Badge**: "Most Popular" (pink/gradient)
- [ ] **Features**:
  - [ ] ✓ Up to 20 active services
  - [ ] ✓ Priority customer support
  - [ ] ✓ Featured listing in directory
  - [ ] ✓ Advanced analytics & insights
  - [ ] ✓ Promotional email campaigns
- [ ] **Button**: "Upgrade Now" (enabled, gradient pink-purple)
- [ ] **RESULT**: ⬜ Pass / ⬜ Fail

#### Professional Plan Card:
- [ ] **Price**: ₱599.00 / month
- [ ] **Badge**: "Best Value" or none
- [ ] **Features**:
  - [ ] ✓ Unlimited active services
  - [ ] ✓ 24/7 premium support
  - [ ] ✓ Top placement in directory
  - [ ] ✓ Premium vendor badge
  - [ ] ✓ Dedicated account manager
  - [ ] ✓ Custom branding options
- [ ] **Button**: "Upgrade Now" (enabled, gradient)
- [ ] **RESULT**: ⬜ Pass / ⬜ Fail

---

## 🧪 TEST 3: Premium Plan Upgrade Flow (10 minutes)

### Goal: Complete full Premium upgrade with payment

#### Step 3.1: Click Premium Upgrade
1. **Clear Console**
   - [ ] Press `Ctrl+L` to clear console
   - [ ] Console is now empty

2. **Click Upgrade Button**
   - [ ] Click "Upgrade Now" on **Premium** plan (₱299)
   - [ ] **EXPECTED**: Payment modal opens immediately
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

3. **Verify Console Logs**
   - [ ] Check console for:
     ```
     🎯 [Subscription] Upgrade clicked: Premium (₱299.00)
     💳 [Subscription] Paid plan - opening payment modal
     ```
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail
   - [ ] Log count: _______ (should be 2)

#### Step 3.2: Inspect Payment Modal
- [ ] Modal title: "Upgrade to Premium"
- [ ] Amount displayed: **₱299.00**
- [ ] Service type: "Premium Subscription"
- [ ] Payment method tabs:
  - [ ] Card (active)
  - [ ] GCash
  - [ ] PayMaya
  - [ ] GrabPay
- [ ] **RESULT**: ⬜ Pass / ⬜ Fail

#### Step 3.3: Fill Card Payment Form
1. **Enter Card Details** (TEST CARD):
   - [ ] Card Number: `4343 4343 4343 4345`
   - [ ] Expiry: `12/28`
   - [ ] CVC: `123`
   - [ ] Cardholder Name: `Test User`

2. **Verify Form Validation**
   - [ ] No validation errors
   - [ ] "Process Payment" button enabled

3. **Click Process Payment**
   - [ ] Click "Process Payment" button
   - [ ] **EXPECTED**: Loading spinner appears
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

#### Step 3.4: Monitor Network Requests
**Open DevTools Network Tab**
- [ ] Filter by "Fetch/XHR"
- [ ] Look for API calls:
  - [ ] `POST /api/payment/create-intent` (Status: 200)
  - [ ] `POST /api/payment/create-payment-method` (Status: 200)
  - [ ] `POST /api/payment/attach-intent` (Status: 200)
  - [ ] `POST /api/payment/process` (Status: 200)
- [ ] **RESULT**: ⬜ Pass / ⬜ Fail
- [ ] Any errors? ⬜ Yes / ⬜ No
  - If yes, describe: _________________________________

#### Step 3.5: Verify Payment Success
- [ ] Success message appears
- [ ] Modal closes automatically
- [ ] Upgrade prompt closes
- [ ] No console errors
- [ ] **RESULT**: ⬜ Pass / ⬜ Fail

#### Step 3.6: Verify Subscription Update
1. **Refresh Page**
   - [ ] Press `F5`
   - [ ] Page reloads

2. **Check Subscription Status**
   - [ ] Header shows: **"Premium"** badge
   - [ ] Subscription tier updated: _______________

3. **Test New Limits**
   - [ ] Navigate to `/vendor/services`
   - [ ] Try to add 6th service
   - [ ] **EXPECTED**: No upgrade prompt appears
   - [ ] Service is added successfully
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

---

## 🧪 TEST 4: Professional Plan Upgrade (8 minutes)

### Goal: Test higher-tier upgrade

#### Step 4.1: Trigger Upgrade Prompt Again
- [ ] Try to add 21st service (exceeds Premium limit of 20)
- OR
- [ ] Navigate to any premium feature
- [ ] Upgrade prompt appears
- [ ] **RESULT**: ⬜ Pass / ⬜ Fail

#### Step 4.2: Click Professional Upgrade
- [ ] Clear console (`Ctrl+L`)
- [ ] Click "Upgrade Now" on **Professional** plan (₱599)
- [ ] Payment modal opens
- [ ] Amount shows: **₱599.00**
- [ ] **RESULT**: ⬜ Pass / ⬜ Fail

#### Step 4.3: Test E-Wallet (GCash Simulation)
**Note**: In TEST mode, e-wallets are simulated

1. **Click GCash Tab**
   - [ ] Click "GCash" tab
   - [ ] GCash UI appears

2. **Process Payment**
   - [ ] Click "Process Payment"
   - [ ] Loading spinner appears
   - [ ] Message: "GCash payment simulation (TEST mode)"
   - [ ] Success message
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

3. **Verify Upgrade**
   - [ ] Subscription updated to: **Professional**
   - [ ] Header shows "Professional" badge
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

---

## 🧪 TEST 5: Error Handling (10 minutes)

### Goal: Test error scenarios

#### Test 5.1: Invalid Card Number
1. **Open Payment Modal**
   - [ ] Trigger upgrade prompt
   - [ ] Click upgrade on any plan

2. **Enter Invalid Card**
   - [ ] Card Number: `4000 0000 0000 0002` (decline card)
   - [ ] Expiry: `12/28`
   - [ ] CVC: `123`
   - [ ] Name: `Test User`

3. **Submit Payment**
   - [ ] Click "Process Payment"
   - [ ] **EXPECTED**: Error message appears
   - [ ] Message mentions payment failure
   - [ ] Modal stays open
   - [ ] Can retry
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

#### Test 5.2: Payment Cancellation
1. **Open Payment Modal**
   - [ ] Trigger upgrade prompt
   - [ ] Click upgrade

2. **Cancel Payment**
   - [ ] Click "×" close button OR "Cancel" button
   - [ ] **EXPECTED**: Modal closes
   - [ ] No payment processed
   - [ ] Subscription unchanged
   - [ ] No console errors
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

#### Test 5.3: Double-Click Prevention
1. **Open Upgrade Prompt**
   - [ ] Trigger upgrade prompt

2. **Rapid Clicking**
   - [ ] Clear console
   - [ ] Rapidly click "Upgrade Now" button **5 times** (fast!)
   - [ ] **EXPECTED**:
     - [ ] Only ONE payment modal opens
     - [ ] Console shows:
       ```
       🎯 [Subscription] Upgrade clicked: Premium (₱299.00)
       💳 [Subscription] Paid plan - opening payment modal
       ⚠️ [Subscription] Already processing, ignoring duplicate click
       ⚠️ [Subscription] Already processing, ignoring duplicate click
       ...
       ```
   - [ ] No duplicate API calls in Network tab
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

---

## 🧪 TEST 6: Console Log Verification (5 minutes)

### Goal: Verify clean console (no log flooding)

#### Test 6.1: Full Upgrade Flow Log Count
1. **Clear Console**
   - [ ] Press `Ctrl+L`

2. **Complete Full Flow**
   - [ ] Trigger upgrade prompt
   - [ ] Click upgrade button
   - [ ] Fill payment form
   - [ ] Submit payment
   - [ ] Wait for success

3. **Count Console Logs**
   - [ ] Total logs: _______ (should be ≤ 8)
   - [ ] Expected logs:
     - [ ] `🔔 [SubscriptionContext] showUpgradePrompt called`
     - [ ] `✅ [SubscriptionContext] Upgrade prompt state updated to SHOW`
     - [ ] `🎯 [Subscription] Upgrade clicked: ...`
     - [ ] `💳 [Subscription] Paid plan - opening payment modal`
     - [ ] `📄 Step 7: Response body as text: ...` (payment response)
     - [ ] `❌ [SubscriptionContext] hideUpgradePrompt called`
     - [ ] `✅ [SubscriptionContext] Upgrade prompt state updated to HIDE`
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

#### Test 6.2: Verify NO Unwanted Logs
- [ ] **NO** render evaluation logs (`🔍 [UpgradePrompt] PAYMENT MODAL RENDER EVALUATION`)
- [ ] **NO** modal state tracking logs (`🔄 [UpgradePrompt] Payment Modal State Changed`)
- [ ] **NO** routing logs
- [ ] **NO** repetitive debugging logs
- [ ] **RESULT**: ⬜ Pass / ⬜ Fail

---

## 🧪 TEST 7: UI/UX Validation (5 minutes)

### Goal: Test responsive design and accessibility

#### Test 7.1: Responsive Design
1. **Desktop View** (1920x1080)
   - [ ] Upgrade prompt displays correctly
   - [ ] 3 plan cards in a row
   - [ ] All buttons visible

2. **Tablet View** (768px width)
   - [ ] Resize browser to 768px
   - [ ] Plan cards stack or adjust
   - [ ] Modal still readable
   - [ ] Buttons accessible

3. **Mobile View** (375px width)
   - [ ] Resize browser to 375px
   - [ ] Plan cards stack vertically
   - [ ] Text is readable
   - [ ] No horizontal scrolling
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

#### Test 7.2: Keyboard Navigation
1. **Open Upgrade Prompt**
   - [ ] Use mouse to open prompt

2. **Test Tab Key**
   - [ ] Press `Tab` repeatedly
   - [ ] Focus moves through all buttons
   - [ ] Focus indicators visible
   - [ ] Can reach all upgrade buttons

3. **Test Enter Key**
   - [ ] Tab to "Upgrade Now" button
   - [ ] Press `Enter`
   - [ ] Payment modal opens
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

4. **Test Escape Key**
   - [ ] With modal open, press `Esc`
   - [ ] Modal closes
   - [ ] **RESULT**: ⬜ Pass / ⬜ Fail

---

## 📊 TEST RESULTS SUMMARY

### Completion Status
- [ ] All tests completed
- [ ] Some tests skipped (list below)
- [ ] Tests need to be redone

### Results
| Test Suite | Pass | Fail | Notes |
|------------|------|------|-------|
| Test 1: Trigger Prompt | ⬜ | ⬜ | ________________ |
| Test 2: Plan Details | ⬜ | ⬜ | ________________ |
| Test 3: Premium Upgrade | ⬜ | ⬜ | ________________ |
| Test 4: Professional Upgrade | ⬜ | ⬜ | ________________ |
| Test 5: Error Handling | ⬜ | ⬜ | ________________ |
| Test 6: Console Logs | ⬜ | ⬜ | ________________ |
| Test 7: UI/UX | ⬜ | ⬜ | ________________ |

### Issues Found
1. **Critical Issues**:
   - _____________________________________________
   - _____________________________________________

2. **Minor Issues**:
   - _____________________________________________
   - _____________________________________________

3. **Suggestions**:
   - _____________________________________________
   - _____________________________________________

---

## ✅ Final Sign-Off

- [ ] All tests completed successfully
- [ ] Issues documented
- [ ] Screenshots taken (if needed)
- [ ] Ready for production use

**Tester Name**: _________________________  
**Date**: October 29, 2025  
**Time Spent**: _______ minutes  
**Overall Status**: ⬜ PASS / ⬜ FAIL / ⬜ PARTIAL

---

## 📸 Evidence (Optional)

**Screenshots/Screen Recordings**:
- [ ] Upgrade prompt opened
- [ ] Payment modal
- [ ] Successful payment
- [ ] Console logs
- [ ] Subscription badge updated

**File Locations**: _________________________________

---

**Test Complete!** 🎉

Return this filled form to project lead or save in test documentation.
