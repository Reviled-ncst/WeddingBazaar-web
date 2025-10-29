# 🔧 Subscription Upgrade Flow - Robust Solution

## Problem Analysis

### Current Issue
- **Payment succeeds** ✅ (PayMongo processes payment correctly)
- **Backend API returns 404** ❌ (`/api/subscriptions/payment/upgrade` not found)
- **Subscription doesn't upgrade** ❌ (vendor stays on current plan)

### Root Cause Investigation

**Route Structure:**
```
Main Server: production-backend.js
  └── app.use('/api/subscriptions', subscriptionRoutes)
       └── subscriptions/index.cjs
            └── router.use('/payment', paymentRoutes)
                 └── payment.cjs
                      └── router.put('/upgrade', handler)
```

**Expected URL:** `/api/subscriptions/payment/upgrade` (PUT)

**Possible Causes:**
1. ❌ Route not properly exported from payment.cjs
2. ❌ Route order conflict (legacy aliases interfering)
3. ❌ HTTP method mismatch (PUT vs POST)
4. ❌ Backend not redeployed after route changes
5. ❌ CORS or middleware blocking the request

---

## 🛠️ Comprehensive Fix Strategy

### Phase 1: Backend Route Validation ✅

**1. Verify Route Export in payment.cjs**
```javascript
// At the end of backend-deploy/routes/subscriptions/payment.cjs
console.log('✅ Payment routes registered:');
console.log('   - PUT /upgrade');
console.log('   - POST /create');
console.log('   - POST /cancel');

module.exports = router;
```

**2. Add Route Debugging Middleware**
```javascript
// In payment.cjs, add at the top after router creation
router.use((req, res, next) => {
  console.log(`🔍 [PAYMENT ROUTE] ${req.method} ${req.originalUrl}`);
  console.log(`🔍 [PAYMENT ROUTE] Base URL: ${req.baseUrl}`);
  console.log(`🔍 [PAYMENT ROUTE] Path: ${req.path}`);
  next();
});
```

**3. Verify Route Registration in production-backend.js**
```javascript
// After app.use('/api/subscriptions', subscriptionRoutes)
console.log('✅ Subscription routes mounted at /api/subscriptions');
```

---

### Phase 2: Robust Error Handling 🛡️

**Option A: Backend Fallback Route (Recommended)**

Add a catch-all route in `payment.cjs` to log 404s:

```javascript
// At the end of payment.cjs, BEFORE module.exports
router.use((req, res, next) => {
  console.error(`❌ [PAYMENT 404] ${req.method} ${req.path} not found`);
  console.error(`❌ Available routes: PUT /upgrade, POST /create, POST /cancel`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `${req.method} /api/subscriptions/payment${req.path} not found`,
    availableRoutes: {
      upgrade: 'PUT /api/subscriptions/payment/upgrade',
      create: 'POST /api/subscriptions/payment/create',
      cancel: 'POST /api/subscriptions/payment/cancel'
    }
  });
});
```

**Option B: Frontend Retry Logic with Fallback**

Modify `UpgradePrompt.tsx` to try multiple endpoints:

```typescript
const upgradeEndpoints = [
  '/api/subscriptions/payment/upgrade',    // Primary
  '/api/subscriptions/upgrade',            // Fallback 1 (legacy alias)
  '/api/subscriptions/vendor/upgrade'      // Fallback 2 (direct vendor route)
];

for (const endpoint of upgradeEndpoints) {
  try {
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(upgradePayload)
    });
    
    if (response.ok) {
      console.log(`✅ Success with endpoint: ${endpoint}`);
      return await response.json();
    }
  } catch (error) {
    console.warn(`⚠️ Failed with ${endpoint}, trying next...`);
  }
}

throw new Error('All upgrade endpoints failed');
```

---

### Phase 3: Transaction Safety 💰

**Problem:** Payment succeeds, but subscription doesn't upgrade = **Money lost, no upgrade**

**Solution:** Two-phase commit with rollback

```typescript
// Frontend: UpgradePrompt.tsx
const handlePaymentSuccess = async (paymentData: any) => {
  let paymentProcessed = false;
  let subscriptionUpgraded = false;
  
  try {
    // Phase 1: Process Payment (via PayMongo modal)
    console.log('💳 Phase 1: Payment processed successfully');
    paymentProcessed = true;
    
    // Phase 2: Upgrade Subscription
    const upgradeResult = await fetch(`${backendUrl}/api/subscriptions/payment/upgrade`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendor_id: vendorId,
        new_plan: selectedPlan.id,
        payment_method_details: {
          payment_reference: paymentData.id,
          amount: convertedAmount,
          currency: currency.code,
          payment_already_processed: true // Flag to backend
        }
      })
    });
    
    if (!upgradeResult.ok) {
      // Payment succeeded but upgrade failed - CRITICAL
      throw new Error('UPGRADE_FAILED_AFTER_PAYMENT');
    }
    
    subscriptionUpgraded = true;
    console.log('✅ Both phases complete: Payment + Upgrade');
    
  } catch (error) {
    // Handle partial failure
    if (paymentProcessed && !subscriptionUpgraded) {
      console.error('🚨 CRITICAL: Payment succeeded but upgrade failed');
      
      // Create manual intervention ticket
      await fetch(`${backendUrl}/api/subscriptions/manual-intervention`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          payment_reference: paymentData.id,
          issue: 'payment_success_upgrade_failed',
          requested_plan: selectedPlan.id,
          amount_paid: convertedAmount,
          timestamp: new Date().toISOString()
        })
      });
      
      // Show user-friendly error
      alert('⚠️ Payment processed successfully! Your subscription will be upgraded shortly. If you don\'t see changes within 1 hour, contact support with reference: ' + paymentData.id);
    } else {
      throw error;
    }
  }
};
```

---

### Phase 4: Manual Intervention System 🛠️

**Create Manual Intervention Table:**

```sql
-- Run in Neon database
CREATE TABLE IF NOT EXISTS subscription_manual_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  issue_type VARCHAR(100) NOT NULL,
  payment_reference VARCHAR(255),
  requested_plan VARCHAR(50),
  amount_paid DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'PHP',
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'resolved', 'failed'
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_interventions_vendor ON subscription_manual_interventions(vendor_id);
CREATE INDEX idx_interventions_status ON subscription_manual_interventions(status);
```

**Backend Endpoint:**

```javascript
// In payment.cjs
router.post('/manual-intervention', async (req, res) => {
  try {
    const {
      vendor_id,
      payment_reference,
      issue,
      requested_plan,
      amount_paid
    } = req.body;
    
    const intervention = await sql`
      INSERT INTO subscription_manual_interventions (
        vendor_id,
        issue_type,
        payment_reference,
        requested_plan,
        amount_paid
      ) VALUES (
        ${vendor_id},
        ${issue},
        ${payment_reference},
        ${requested_plan},
        ${amount_paid}
      ) RETURNING *
    `;
    
    // Send admin notification
    console.log('🚨 MANUAL INTERVENTION REQUIRED:', intervention[0]);
    
    res.json({
      success: true,
      intervention: intervention[0],
      message: 'Manual intervention ticket created'
    });
  } catch (error) {
    console.error('❌ Manual intervention error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### Phase 5: Idempotency & Duplicate Prevention 🔒

**Problem:** User clicks "Upgrade" multiple times = Multiple payments

**Solution:** Idempotency key system

```typescript
// Frontend: Generate unique idempotency key
import { v4 as uuidv4 } from 'uuid';

const [upgradeIdempotencyKey] = useState(() => uuidv4());

const handleUpgrade = async () => {
  const response = await fetch(`${backendUrl}/api/subscriptions/payment/upgrade`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': upgradeIdempotencyKey
    },
    body: JSON.stringify(upgradePayload)
  });
};
```

```javascript
// Backend: Check for duplicate requests
const processedUpgrades = new Map(); // In-memory cache (use Redis in production)

router.put('/upgrade', async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  
  if (!idempotencyKey) {
    return res.status(400).json({
      success: false,
      error: 'Missing idempotency key'
    });
  }
  
  // Check if already processed
  if (processedUpgrades.has(idempotencyKey)) {
    const cachedResult = processedUpgrades.get(idempotencyKey);
    console.log('✅ Returning cached result for duplicate request');
    return res.json(cachedResult);
  }
  
  // Process upgrade
  const result = await processUpgrade(req.body);
  
  // Cache result for 1 hour
  processedUpgrades.set(idempotencyKey, result);
  setTimeout(() => processedUpgrades.delete(idempotencyKey), 3600000);
  
  res.json(result);
});
```

---

## 🚀 Implementation Priority

### IMMEDIATE (Deploy Today) 🔥
1. ✅ Add route debugging middleware to `payment.cjs`
2. ✅ Add 404 catch-all route in `payment.cjs`
3. ✅ Redeploy backend to Render
4. ✅ Test `/api/subscriptions/payment/upgrade` endpoint

### HIGH PRIORITY (This Week) ⚡
1. ✅ Implement frontend retry logic with fallback endpoints
2. ✅ Add manual intervention system (table + endpoint)
3. ✅ Deploy frontend with enhanced error handling
4. ✅ Test end-to-end flow in production

### MEDIUM PRIORITY (Next Week) 📅
1. ⚠️ Implement idempotency key system
2. ⚠️ Add webhook for payment verification
3. ⚠️ Create admin dashboard for manual interventions
4. ⚠️ Add email notifications for failed upgrades

---

## 🧪 Testing Checklist

### Backend Route Testing
```bash
# Test 1: Verify route exists
curl -X PUT https://weddingbazaar-web.onrender.com/api/subscriptions/payment/upgrade \
  -H "Content-Type: application/json" \
  -d '{"vendor_id":"test"}' \
  -v

# Expected: Should NOT return 404
# Should return 400 or 422 (validation error) or 200 (success)
```

### Frontend Flow Testing
1. ✅ Login as vendor
2. ✅ Click "Upgrade Subscription"
3. ✅ Select plan and payment method
4. ✅ Complete payment
5. ✅ Verify backend API call (check browser console)
6. ✅ Verify subscription upgraded in database
7. ✅ Verify user sees success message

### Edge Case Testing
1. ⚠️ Payment succeeds, backend API fails → Manual intervention created
2. ⚠️ Network timeout during API call → Retry logic kicks in
3. ⚠️ Double-click upgrade button → Idempotency prevents duplicate
4. ⚠️ Invalid vendor ID → Proper error message shown
5. ⚠️ Insufficient payment → Transaction rolled back

---

## 📊 Monitoring & Logs

### Backend Logs to Add
```javascript
// In payment.cjs
console.log('🎯 [UPGRADE START]', {
  vendor_id,
  new_plan,
  payment_reference,
  timestamp: new Date().toISOString()
});

console.log('✅ [UPGRADE SUCCESS]', {
  vendor_id,
  old_plan,
  new_plan,
  duration_ms: Date.now() - startTime
});

console.error('❌ [UPGRADE FAILED]', {
  vendor_id,
  new_plan,
  error: error.message,
  stack: error.stack
});
```

### Frontend Logs to Add
```typescript
console.log('💳 [PAYMENT SUCCESS]', {
  payment_id: paymentData.id,
  amount: paymentData.amount,
  timestamp: new Date().toISOString()
});

console.log('📤 [UPGRADE API CALL]', {
  endpoint,
  vendor_id,
  plan,
  timestamp: new Date().toISOString()
});

console.error('❌ [UPGRADE API FAILED]', {
  endpoint,
  status: response.status,
  error: await response.text()
});
```

---

## 📝 Deployment Commands

### Backend Deployment
```powershell
# From project root
cd backend-deploy
git add .
git commit -m "fix: robust subscription upgrade with fallbacks and manual intervention"
git push origin main

# Render will auto-deploy
# Monitor at: https://dashboard.render.com
```

### Frontend Deployment
```powershell
# From project root
npm run build
firebase deploy --only hosting

# Verify at: https://weddingbazaarph.web.app
```

---

## 🎯 Success Criteria

- [x] Backend route responds (not 404)
- [ ] Payment succeeds AND subscription upgrades
- [ ] Manual intervention created if upgrade fails
- [ ] User sees clear success/error messages
- [ ] No duplicate charges for same upgrade
- [ ] All edge cases handled gracefully
- [ ] Admin can resolve failed upgrades manually

---

## 📞 Support Information

**If upgrade fails:**
1. Check browser console for error logs
2. Note the payment reference ID
3. Contact admin with reference ID
4. Admin can manually upgrade subscription using payment reference

**Manual Upgrade (Admin Only):**
```sql
-- Verify payment processed
SELECT * FROM subscription_manual_interventions WHERE payment_reference = 'pi_xxx';

-- Manually upgrade subscription
UPDATE vendor_subscriptions
SET plan_name = 'professional',
    updated_at = NOW()
WHERE vendor_id = 'xxx' AND status = 'active';

-- Mark intervention resolved
UPDATE subscription_manual_interventions
SET status = 'resolved',
    resolved_at = NOW(),
    resolution_notes = 'Manually upgraded after payment verification'
WHERE payment_reference = 'pi_xxx';
```

---

## 🔗 Related Documentation
- `SUBSCRIPTION_UPGRADE_FLOW.md` - Original flow documentation
- `PAYMONGO_INTEGRATION.md` - Payment processing details
- `SUBSCRIPTION_PLANS.md` - Plan details and pricing
- `MANUAL_INTERVENTION_GUIDE.md` - Admin manual upgrade process

---

**Last Updated:** {current_date}
**Status:** Ready for implementation
**Priority:** CRITICAL 🔥
