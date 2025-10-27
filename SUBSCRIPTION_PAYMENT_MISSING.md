# 🚨 SUBSCRIPTION UPGRADE - PAYMENT INTEGRATION NEEDED

**Status**: ⚠️ **INCOMPLETE - PAYMENT NOT IMPLEMENTED**  
**Date**: October 27, 2025  
**Priority**: 🔥 **HIGH** - Currently allows free upgrades!

---

## 🔍 Current Problem

### What's Working ❌
- ✅ Upgrade button visible
- ✅ Upgrade modal opens
- ✅ Can select plans
- ⚠️  **Upgrade happens for FREE** (no payment!)
- ⚠️  **Service limits don't update** after upgrade

### What's Missing
1. **Payment Integration** - No PayMongo payment modal
2. **Payment Processing** - Using free upgrade endpoint instead of paid
3. **Subscription Refresh** - Page doesn't reload new subscription data
4. **Usage Limits** - Service count doesn't update after upgrade

---

## 📊 Current vs Needed Flow

### Current Flow (FREE UPGRADE) ❌
```
1. User clicks "Upgrade Plan"
   ↓
2. Modal shows plan options
   ↓
3. User clicks "Upgrade" on a plan
   ↓
4. Frontend calls: PUT /api/subscriptions/upgrade
   ↓
5. Backend updates database (NO PAYMENT!)
   ↓
6. Success message
   ↓
7. Page reloads but subscription not refetched
   ↓
8. ❌ FREE UPGRADE (no money charged)
   ↓
9. ❌ Limits still show old values
```

### Needed Flow (PAID UPGRADE) ✅
```
1. User clicks "Upgrade Plan"
   ↓
2. Modal shows plan options with PRICES
   ↓
3. User clicks "Upgrade" on a plan
   ↓
4. PayMongo Payment Modal opens
   ↓
5. User enters card details
   ↓
6. Frontend calls: PUT /api/subscriptions/payment/upgrade
   ↓
7. Backend processes PayMongo payment
   ↓
8. Backend updates subscription in database
   ↓
9. Frontend receives success
   ↓
10. Frontend refetches subscription data
   ↓
11. ✅ PAYMENT PROCESSED
   ↓
12. ✅ Limits updated immediately
```

---

## 🛠️ What Needs to Be Implemented

### 1. Payment Modal Integration

**File**: `src/pages/users/vendor/services/VendorServices.tsx`  
**Location**: Line 2315 (upgrade handler)

**Current Code**:
```typescript
// Call backend API to process upgrade
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subscriptions/upgrade`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  },
  body: JSON.stringify({
    vendor_id: correctVendorId,
    new_plan: planId
  })
});
```

**Needed Code**:
```typescript
// Step 1: Open payment modal
setShowPaymentModal(true);
setSelectedUpgradePlan(planId);

// Step 2: In payment modal success handler:
const handlePaymentSuccess = async (paymentData) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/subscriptions/payment/upgrade`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        vendor_id: user?.vendorId,
        new_plan: selectedUpgradePlan,
        payment_method_details: paymentData
      })
    }
  );
  
  // Step 3: Refresh subscription
  await refetchSubscription();
  
  // Step 4: Update UI
  window.location.reload();
};
```

### 2. Subscription Refresh After Upgrade

**File**: `src/shared/contexts/SubscriptionContext.tsx`

**Add**:
```typescript
const refetchSubscription = useCallback(async () => {
  await fetchSubscription();
}, [fetchSubscription]);

// Export in context
return (
  <SubscriptionContext.Provider value={{
    subscription,
    loading,
    error,
    refetchSubscription, // ✅ Add this
    checkLimit,
    canPerformAction
  }}>
```

### 3. Update UpgradePromptModal to Show Prices

**File**: `src/shared/components/modals/UpgradePromptModal.tsx`

**Current**: Shows plan features but no prices  
**Needed**: Show monthly prices and "Pay ₱X/month" on upgrade button

### 4. Service Limit Update

**File**: `src/pages/users/vendor/services/VendorServices.tsx`

**After successful upgrade**:
```typescript
// Re-fetch services to get updated count
await loadServices();

// Re-fetch subscription to get new limits
await refetchSubscription();

// Show updated limits in UI
setServicesCount(newCount);
```

---

## 💳 Backend Payment Endpoint (Already Exists)

### Endpoint: PUT /api/subscriptions/payment/upgrade

**Location**: `backend-deploy/routes/subscriptions/payment.cjs`  
**Line**: 356

**Request Body**:
```json
{
  "vendor_id": "daf1dd71-b5c7-44a1-bf88-36d41e73a7fa",
  "new_plan": "premium",  // or "pro", "enterprise"
  "payment_method_details": {
    "type": "card",
    "number": "4343434343434345",
    "exp_month": 12,
    "exp_year": 2025,
    "cvc": "123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Subscription upgraded successfully",
  "subscription": {
    "id": "uuid",
    "vendor_id": "daf1dd71-b5c7-44a1-bf88-36d41e73a7fa",
    "plan_id": "premium",
    "plan_name": "premium",
    "status": "active"
  },
  "payment": {
    "intent_id": "pi_xxx",
    "amount": 99900,
    "currency": "PHP"
  },
  "proration": {
    "amount": 50000,
    "description": "Prorated amount for upgrade"
  }
}
```

**Features**:
- ✅ Calculates proration (charges for remaining days)
- ✅ Processes PayMongo payment
- ✅ Updates subscription in database
- ✅ Returns payment details

---

## 📋 Implementation Steps

### Phase 1: Add Payment Modal (Quick Fix)
1. Import PayMongoPaymentModal in VendorServices
2. Add state for payment modal visibility
3. Open payment modal on upgrade click
4. Pass plan ID and amount to modal
5. Handle payment success → call paid upgrade endpoint
6. Refresh subscription after success

**Estimated Time**: 2-3 hours

### Phase 2: Subscription Refresh (Quick Fix)
1. Add refetchSubscription to SubscriptionContext
2. Call refetchSubscription after successful upgrade
3. Update service count display
4. Update limit display

**Estimated Time**: 1 hour

### Phase 3: UI Improvements (Enhancement)
1. Show prices in UpgradePromptModal
2. Show proration calculation
3. Add loading states during payment
4. Add better success/error messages
5. Add payment confirmation screen

**Estimated Time**: 3-4 hours

---

## 🎯 Quick Fix Option (Temporary)

If you want to enable payments QUICKLY without refactoring:

### Option A: Redirect to Payment Page
```typescript
const handleUpgrade = async (planId: string) => {
  // Save selected plan
  localStorage.setItem('pendingUpgrade', planId);
  
  // Redirect to dedicated payment page
  window.location.href = `/vendor/subscription/upgrade?plan=${planId}`;
};
```

Then create a `/vendor/subscription/upgrade` page that:
- Shows plan details
- Shows PayMongo payment form
- Processes payment
- Redirects back to services

**Estimated Time**: 4-5 hours

### Option B: Use Existing PayMongo Modal
```typescript
import { PayMongoPaymentModal } from '@/shared/components/PayMongoPaymentModal';

const [showPaymentModal, setShowPaymentModal] = useState(false);
const [upgradePlan, setUpgradePlan] = useState('');

const handleUpgrade = (planId: string) => {
  setUpgradePlan(planId);
  setShowPaymentModal(true);
};

const handlePaymentSuccess = async (paymentData) => {
  // Call paid upgrade endpoint
  await upgradeSubscription(upgradePlan, paymentData);
  // Reload page
  window.location.reload();
};

// In JSX:
<PayMongoPaymentModal
  isOpen={showPaymentModal}
  onClose={() => setShowPaymentModal(false)}
  amount={getPlanPrice(upgradePlan)}
  onSuccess={handlePaymentSuccess}
/>
```

**Estimated Time**: 2-3 hours

---

## 💰 Pricing Information

### Plan Prices (from SUBSCRIPTION_PLANS)
```typescript
const PLAN_PRICES = {
  basic: {
    monthly: 0,          // Free
    yearly: 0
  },
  premium: {
    monthly: 99900,      // ₱999/month (in centavos)
    yearly: 999900       // ₱9,999/year
  },
  pro: {
    monthly: 199900,     // ₱1,999/month
    yearly: 1999900      // ₱19,999/year
  },
  enterprise: {
    monthly: 499900,     // ₱4,999/month
    yearly: 4999900      // ₱49,999/year
  }
};
```

### Proration Logic
When upgrading mid-period:
```
Example:
- Current plan: Premium (₱999/month)
- New plan: Pro (₱1,999/month)
- Days remaining: 15 days (out of 30)
- 
- Current plan credit: ₱999 × (15/30) = ₱499.50
- New plan prorated: ₱1,999 × (15/30) = ₱999.50
- Amount to charge: ₱999.50 - ₱499.50 = ₱500.00
```

---

## 🚨 Security Considerations

### Important Notes:
1. **Never store raw card numbers** - Use PayMongo tokenization
2. **Validate plan prices server-side** - Don't trust frontend
3. **Check vendor ID matches authenticated user** - Prevent unauthorized upgrades
4. **Log all transactions** - For audit trail
5. **Handle failed payments gracefully** - Don't leave subscription in bad state

---

## 📊 Database Impact After Payment

### Before Upgrade
```sql
SELECT * FROM vendor_subscriptions 
WHERE vendor_id = 'daf1dd71-b5c7-44a1-bf88-36d41e73a7fa';

-- Result:
-- plan_id: 'basic'
-- plan_name: 'basic'
-- status: 'active'
```

### After Paid Upgrade
```sql
SELECT * FROM vendor_subscriptions 
WHERE vendor_id = 'daf1dd71-b5c7-44a1-bf88-36d41e73a7fa';

-- Result:
-- plan_id: 'premium'
-- plan_name: 'premium'
-- status: 'active'
-- payment_method_id: 'pm_xxx' (PayMongo payment method)
-- paymongo_customer_id: 'cus_xxx' (PayMongo customer)
```

### New Transaction Record
```sql
SELECT * FROM subscription_transactions
WHERE subscription_id = [subscription_id]
ORDER BY created_at DESC LIMIT 1;

-- Result:
-- transaction_type: 'upgrade'
-- amount: 99900 (₱999)
-- status: 'successful'
-- paymongo_payment_id: 'pay_xxx'
```

---

## 🔗 Related Files

### Frontend
- `src/pages/users/vendor/services/VendorServices.tsx` - Main file to modify
- `src/shared/components/PayMongoPaymentModal.tsx` - Payment modal
- `src/shared/components/modals/UpgradePromptModal.tsx` - Upgrade selection
- `src/shared/contexts/SubscriptionContext.tsx` - Subscription state

### Backend
- `backend-deploy/routes/subscriptions/payment.cjs` - Payment endpoints (✅ exists)
- `backend-deploy/routes/subscriptions/vendor.cjs` - Free upgrade (⚠️ currently used)

---

## 🎯 Recommended Action Plan

### Immediate (This Week)
1. ✅ **Stop using free upgrade endpoint** - Temporary disable or add payment gate
2. ⚠️  **Add payment modal integration** - Connect PayMongoPaymentModal
3. ⚠️  **Add subscription refresh** - Update limits after upgrade

### Short Term (Next Week)
1. Test payment flow thoroughly
2. Add proration display
3. Add better error handling
4. Add payment confirmation emails

### Long Term (This Month)
1. Add subscription management page
2. Add downgrade flow
3. Add cancellation flow
4. Add payment history
5. Add invoice generation

---

## 💡 Quick Test Commands

### Test Current Free Upgrade (BAD)
```bash
# This currently works WITHOUT payment!
curl -X PUT https://weddingbazaar-web.onrender.com/api/subscriptions/upgrade \
  -H "Content-Type: application/json" \
  -d '{
    "vendor_id": "daf1dd71-b5c7-44a1-bf88-36d41e73a7fa",
    "new_plan": "premium"
  }'
```

### Test Paid Upgrade (GOOD)
```bash
# This requires payment!
curl -X PUT https://weddingbazaar-web.onrender.com/api/subscriptions/payment/upgrade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "vendor_id": "daf1dd71-b5c7-44a1-bf88-36d41e73a7fa",
    "new_plan": "premium",
    "payment_method_details": {
      "type": "card",
      "number": "4343434343434345",
      "exp_month": 12,
      "exp_year": 2025,
      "cvc": "123"
    }
  }'
```

---

**Last Updated**: October 27, 2025  
**Status**: ⚠️ CRITICAL - Free upgrades currently allowed  
**Priority**: 🔥 HIGH - Payment integration needed ASAP
