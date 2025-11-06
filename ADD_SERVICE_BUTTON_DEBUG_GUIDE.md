# 🔧 Add Service Button Issue - Debug Guide

## 📊 Issue Report

**Date**: November 6, 2025  
**Component**: VendorServices.tsx - "Add Service" button  
**Symptom**: Button not working / routing to subscriptions  
**Suspected Cause**: Subscription limits or verification checks

---

## 🔍 Diagnosis Steps

### Step 1: Check Button Click Handler

The "Add Service" button uses `handleQuickCreateService()`:

```typescript
// Line 613-629 in VendorServices.tsx
const handleQuickCreateService = () => {
  // CHECK 1: Email verification
  const verification = getVerificationStatus();
  if (!verification.emailVerified) {
    setShowVerificationPrompt(true);  // ❌ BLOCKS if email not verified
    return;
  }
  
  // CHECK 2: Subscription service limit
  const maxServices = subscription?.plan?.limits?.max_services || 5;
  const currentServicesCount = services.length;
  
  if (currentServicesCount >= maxServices) {
    // ❌ BLOCKS if at service limit
    showUpgradePrompt(message, ...);
    return;
  }
  
  // ✅ PASSES - Opens form
  setIsCreating(true);
};
```

### Step 2: Check `canAddServices()` Function

The button's disabled state is controlled by `canAddServices()`:

```typescript
// Line 248-268 in VendorServices.tsx
const canAddServices = () => {
  const verification = getVerificationStatus();
  
  // ❌ BLOCKS: Email not verified
  if (!verification.emailVerified) {
    return false;
  }
  
  // ❌ BLOCKS: Documents not verified
  if (!verification.documentsVerified) {
    return false;
  }
  
  // ❌ BLOCKS: Service limit reached
  const maxServices = subscription?.plan?.limits?.max_services || 5;
  const currentServicesCount = services.length;
  const canAdd = maxServices === -1 || currentServicesCount < maxServices;
  
  return canAdd;
};
```

---

## 🧪 Debug Tests

### Test 1: Check Email Verification Status

**Open Browser Console** (F12) and run:

```javascript
// Check Firebase email verification
const currentUser = firebaseAuthService.getCurrentUser();
console.log('Email verified:', currentUser?.emailVerified);

// Expected: true
// If false: Email verification is blocking
```

### Test 2: Check Document Verification Status

```javascript
// Check profile verification
fetch('https://weddingbazaar-web.onrender.com/api/vendor-profile/user/YOUR_USER_ID')
  .then(r => r.json())
  .then(d => {
    console.log('Documents verified:', d.profile?.documentsVerified);
    console.log('Overall status:', d.profile?.overallVerificationStatus);
  });

// Expected: documentsVerified = true
// If false: Document verification is blocking
```

### Test 3: Check Subscription Limits

```javascript
// Check subscription data
fetch('https://weddingbazaar-web.onrender.com/api/subscriptions/vendor/YOUR_VENDOR_ID')
  .then(r => r.json())
  .then(d => {
    console.log('Max services:', d.subscription?.plan?.limits?.max_services);
    console.log('Current services:', d.subscription?.usage?.services_count);
  });

// Expected: max_services > current services
// If equal: Service limit reached
```

### Test 4: Check Services Count

```javascript
// Count services in frontend
console.log('Services loaded:', services.length);

// vs backend count
fetch('https://weddingbazaar-web.onrender.com/api/services/vendor/YOUR_VENDOR_ID')
  .then(r => r.json())
  .then(d => console.log('Backend services:', d.services?.length));

// Check if counts match
```

---

## 🔧 Common Issues & Fixes

### Issue 1: Email Not Verified ❌

**Symptom**: Button disabled, orange "!" badge on button

**Cause**: Firebase email not verified

**Fix**:
```javascript
// Trigger verification email resend
firebaseAuthService.sendEmailVerification();

// Or manually verify in Firebase Console
```

**Code Location**: VendorServices.tsx, line 248

**Check in UI**:
- Look for "Email verification required" banner
- Check if "Verify Email" button appears

### Issue 2: Documents Not Verified ❌

**Symptom**: Button disabled, verification banner shows

**Cause**: Business documents not approved by admin

**Fix**:
1. Upload documents in Vendor Profile
2. Admin must approve documents
3. Or manually update database:
```sql
UPDATE vendor_profiles
SET "documentsVerified" = true
WHERE user_id = 'YOUR_USER_ID';
```

**Code Location**: VendorServices.tsx, line 256

### Issue 3: Service Limit Reached ❌

**Symptom**: Button click shows upgrade modal

**Cause**: Reached max_services for current plan

**Current Limits**:
- Basic (Free): 5 services
- Premium: 20 services
- Pro: 50 services
- Enterprise: Unlimited (-1)

**Fix Options**:

**Option A: Upgrade Plan** (Real solution)
- Click "Upgrade Plan" button
- Complete payment
- Service limit increases

**Option B: Increase Limit (Dev/Testing)**
```sql
-- In database, increase limit
UPDATE subscriptions
SET plan_limits = jsonb_set(
  plan_limits::jsonb,
  '{max_services}',
  '100'
)
WHERE vendor_id = 'YOUR_VENDOR_ID';
```

**Option C: Delete Old Services**
- Delete unused services
- Free up slots
- Then add new service

**Code Location**: VendorServices.tsx, line 620

### Issue 4: Subscription Not Loading ❌

**Symptom**: Button always disabled, no limits shown

**Cause**: SubscriptionContext not fetching data

**Check**:
```javascript
// In browser console
console.log('Subscription:', subscription);
console.log('Loading:', loading);
console.log('Error:', error);
```

**Fix**:
1. Check API endpoint: `/api/subscriptions/vendor/:vendorId`
2. Verify vendorId is correct
3. Check backend logs for errors

**Code Location**: SubscriptionContext.tsx, line 69

---

## 🎯 Quick Diagnostic Checklist

Run these checks in order:

```javascript
// 1. Check Firebase email
const user = firebaseAuthService.getCurrentUser();
console.log('1. Email verified:', user?.emailVerified);

// 2. Check subscription data
console.log('2. Subscription:', subscription);
console.log('   Max services:', subscription?.plan?.limits?.max_services);
console.log('   Current count:', services.length);

// 3. Check verification status
const verification = getVerificationStatus();
console.log('3. Email verified:', verification.emailVerified);
console.log('   Docs verified:', verification.documentsVerified);

// 4. Check canAddServices result
console.log('4. Can add services:', canAddServices());

// 5. Check button props
const button = document.querySelector('[data-testid="add-service-btn"]');
console.log('5. Button disabled:', button?.disabled);
```

---

## 📝 Expected Behavior vs Actual

### Expected (Working):
1. Email verified ✅
2. Documents verified ✅
3. Services: 3/5 (below limit) ✅
4. Button enabled ✅
5. Click → Form opens ✅

### Actual (Broken):
Need to determine which check is failing:
- [ ] Email NOT verified → Shows verification banner
- [ ] Documents NOT verified → Shows verification banner
- [ ] Service limit reached → Shows upgrade modal
- [ ] Button disabled but no error → Subscription not loading

---

## 🚀 Temporary Workaround (Dev Only)

If you need to bypass checks for testing:

```typescript
// In VendorServices.tsx, temporarily comment out checks:

const handleQuickCreateService = () => {
  // TEMP: Skip all checks for testing
  /*
  const verification = getVerificationStatus();
  if (!verification.emailVerified) {
    setShowVerificationPrompt(true);
    return;
  }
  
  const maxServices = subscription?.plan?.limits?.max_services || 5;
  if (services.length >= maxServices) {
    showUpgradePrompt(...);
    return;
  }
  */
  
  // Directly open form
  setIsCreating(true);
  setEditingService(null);
};
```

**⚠️ IMPORTANT**: Remove this workaround before production!

---

## 📞 Next Steps

1. **Run diagnostic tests** (above)
2. **Identify which check is failing**
3. **Apply appropriate fix**
4. **Test button functionality**
5. **Report findings**

---

**Created**: November 6, 2025  
**Component**: VendorServices.tsx  
**Lines**: 248-268 (canAddServices), 613-629 (handleQuickCreateService)  
**Related**: SubscriptionContext.tsx, VendorProfile verification
