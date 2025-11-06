# 🚀 QUICK FIX: Grant Unlimited Services

## Issue Found

**Your subscription is NOT being detected:**
- ❌ No subscription record in database for `VEN-00001` or `VEN-00002`
- ❌ API defaults to `basic` plan (5 service limit)
- ❌ You have 16-29 services → blocked from adding more
- ✅ You need `premium`/`pro`/`enterprise` plan (unlimited = -1)

## Solution Options

### Option 1: Grant Pro Plan (RECOMMENDED - 1 minute)
```sql
-- Run this in Neon SQL Console
-- This will give you unlimited services permanently

-- For VEN-00001 (Test Vendor Business)
INSERT INTO vendor_subscriptions (
  vendor_id,
  plan_name,
  billing_cycle,
  status,
  start_date,
  end_date
) VALUES (
  'VEN-00001',
  'pro',              -- Unlimited services
  'monthly',
  'active',
  NOW(),
  NOW() + INTERVAL '1 year'
) ON CONFLICT (vendor_id) DO UPDATE SET
  plan_name = 'pro',
  status = 'active',
  start_date = NOW(),
  end_date = NOW() + INTERVAL '1 year',
  updated_at = NOW();

-- For VEN-00002 (Photography)
INSERT INTO vendor_subscriptions (
  vendor_id,
  plan_name,
  billing_cycle,
  status,
  start_date,
  end_date
) VALUES (
  'VEN-00002',
  'pro',              -- Unlimited services
  'monthly',
  'active',
  NOW(),
  NOW() + INTERVAL '1 year'
) ON CONFLICT (vendor_id) DO UPDATE SET
  plan_name = 'pro',
  status = 'active',
  start_date = NOW(),
  end_date = NOW() + INTERVAL '1 year',
  updated_at = NOW();
```

### Option 2: Grant Enterprise Plan (ULTIMATE - 1 minute)
```sql
-- Run this in Neon SQL Console
-- This will give you ALL features + unlimited everything

-- For VEN-00001
INSERT INTO vendor_subscriptions (
  vendor_id,
  plan_name,
  billing_cycle,
  status,
  start_date,
  end_date
) VALUES (
  'VEN-00001',
  'enterprise',       -- Unlimited EVERYTHING
  'monthly',
  'active',
  NOW(),
  NOW() + INTERVAL '1 year'
) ON CONFLICT (vendor_id) DO UPDATE SET
  plan_name = 'enterprise',
  status = 'active',
  start_date = NOW(),
  end_date = NOW() + INTERVAL '1 year',
  updated_at = NOW();

-- For VEN-00002
INSERT INTO vendor_subscriptions (
  vendor_id,
  plan_name,
  billing_cycle,
  status,
  start_date,
  end_date
) VALUES (
  'VEN-00002',
  'enterprise',
  'monthly',
  'active',
  NOW(),
  NOW() + INTERVAL '1 year'
) ON CONFLICT (vendor_id) DO UPDATE SET
  plan_name = 'enterprise',
  status = 'active',
  start_date = NOW(),
  end_date = NOW() + INTERVAL '1 year',
  updated_at = NOW();
```

### Option 3: Grant to ALL Vendors (2 minutes)
```sql
-- This will give ALL 20 vendors Pro plan

INSERT INTO vendor_subscriptions (vendor_id, plan_name, billing_cycle, status, start_date, end_date)
SELECT 
  id as vendor_id,
  'pro' as plan_name,
  'monthly' as billing_cycle,
  'active' as status,
  NOW() as start_date,
  NOW() + INTERVAL '1 year' as end_date
FROM vendors
WHERE id LIKE 'VEN-%'
ON CONFLICT (vendor_id) DO UPDATE SET
  plan_name = 'pro',
  status = 'active',
  start_date = NOW(),
  end_date = NOW() + INTERVAL '1 year',
  updated_at = NOW();
```

## After Running SQL

### Step 1: Clear Cache (if using localStorage)
```javascript
// Run in browser console
localStorage.removeItem('subscriptionCache');
```

### Step 2: Refresh Page
```
Ctrl + Shift + R (hard refresh)
```

### Step 3: Verify Plan Changed
```javascript
// Run in browser console
fetch('https://weddingbazaar-web.onrender.com/api/subscriptions/vendor/VEN-00001')
  .then(r => r.json())
  .then(d => console.log('Plan:', d.subscription.plan_name, 'Limit:', d.subscription.plan.limits.max_services));
```

**Expected Output:**
```
Plan: pro Limit: -1
```

### Step 4: Test "Add Service" Button
1. Go to Services page
2. Click "Add Service"
3. ✅ Should now open the form (not the modal)!

## Plan Comparison

| Plan | Max Services | Monthly Cost |
|------|--------------|--------------|
| **Basic** (FREE) | 5 | ₱0 |
| **Premium** | Unlimited (-1) | ₱999 |
| **Pro** | Unlimited (-1) | ₱1,999 |
| **Enterprise** | Unlimited (-1) | ₱4,999 |

## Need a Script Instead?

Run this from your project root:
```powershell
node grant-unlimited-services.cjs
```

(I'll create this script if you want)

---

**Quick Fix**: Copy Option 1 or 2 SQL and run in Neon Console → Refresh page → Test button
