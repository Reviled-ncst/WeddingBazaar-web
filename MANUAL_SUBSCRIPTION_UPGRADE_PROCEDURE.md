# 🚨 URGENT: Manual Subscription Upgrade Procedure

## Problem
- Payment succeeds ✅ (vendor charged ₱5)
- Upgrade API returns 404 ❌
- Vendor subscription tier not updated

## Temporary Manual Fix (Until API is Fixed)

### For Vendor: `eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1`
### Payment Reference: `pi_kTCKRpuMvoGhwREZ7WzNvXzx`
### Requested Plan: `premium`
### Amount Paid: ₱5.00

###SQL Manual Upgrade (Run in Neon Database):

```sql
-- Step 1: Update vendor_profiles (what frontend reads)
UPDATE vendor_profiles
SET 
  subscription_tier = 'premium',
  updated_at = NOW()
WHERE id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';

-- Step 2: Update vendor_subscriptions (billing record)
UPDATE vendor_subscriptions
SET 
  plan_name = 'premium',
  status = 'active',
  updated_at = NOW()
WHERE vendor_id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1'
AND status IN ('active', 'trial');

-- Step 3: Verify upgrade
SELECT 
  vp.id AS vendor_id,
  vp.subscription_tier AS current_tier,
  vs.plan_name AS subscription_plan,
  vs.status,
  vs.updated_at
FROM vendor_profiles vp
LEFT JOIN vendor_subscriptions vs ON vp.id = vs.vendor_id
WHERE vp.id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1'
ORDER BY vs.updated_at DESC
LIMIT 1;

-- Expected Result:
-- vendor_id: eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1
-- current_tier: premium
-- subscription_plan: premium
-- status: active
```

## After Manual Fix

1. **Refresh the frontend**
2. **Check subscription badge** (should show "Premium")
3. **Verify premium features unlocked**

## Root Cause Investigation

### Why is the API returning 404?

Run this test to verify route exists:

```bash
curl -X PUT https://weddingbazaar-web.onrender.com/api/subscriptions/payment/upgrade \
  -H "Content-Type: application/json" \
  -d '{
    "vendor_id": "eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1",
    "new_plan": "premium",
    "payment_method_details": {
      "transactionId": "pi_kTCKRpuMvoGhwREZ7WzNvXzx"
    }
  }' \
  -v
```

### Expected Responses:
- **200 OK:** Route works, subscription upgraded ✅
- **404 Not Found:** Route not deployed or path mismatch ❌
- **500 Error:** Route exists but has logic error ⚠️
- **400 Bad Request:** Route exists but validation failed ⚠️

## Permanent Fix Options

### Option 1: Force Redeploy on Render
1. Go to Render dashboard
2. Find `weddingbazaar-web` service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait 3-5 minutes
5. Test again

### Option 2: Add Legacy Route Alias
In `backend-deploy/routes/subscriptions/payment.cjs`, add BEFORE the 404 catch-all:

```javascript
// Legacy route for direct upgrade (no /payment/ prefix)
router.put('/direct-upgrade', async (req, res) => {
  // Same logic as /upgrade route
  // Just a different path as fallback
});
```

Then frontend can try:
- Primary: `PUT /api/subscriptions/payment/upgrade`
- Fallback: `PUT /api/subscriptions/payment/direct-upgrade`

### Option 3: Use Vendor Route Instead
Change frontend to call:

```javascript
PUT /api/subscriptions/vendor/upgrade
```

Instead of:

```javascript
PUT /api/subscriptions/payment/upgrade
```

## Monitoring

### Check Render Logs
Look for these messages after manual deploy:

```
✅ Payment routes registered:
   - PUT  /upgrade
   - POST /create
   - POST /cancel
```

If you see this, route is deployed ✅

### Frontend Test
After manual SQL upgrade:
1. Refresh browser
2. Check subscription badge
3. Try accessing premium features
4. Subscription should show "Premium" ✅

## Next Deployment

When deploying next fix:
1. Add extensive logging to upgrade route
2. Add route existence verification endpoint
3. Add frontend retry logic
4. Add manual intervention table

---

**Status:** Manual upgrade required
**Affected Vendor:** eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1
**Payment Status:** Processed ✅
**Subscription Status:** Pending manual update ⏳
**Priority:** URGENT 🔥
