# ⚡ QUICK FIX: Create Subscription Tables

## 🎯 Problem
Vendor subscription endpoint returning 500 error because `vendor_subscriptions` table doesn't exist in production database.

## ✅ Solution (5 Minutes)

### Step 1: Open Neon Console
1. Go to: https://console.neon.tech/
2. Login to your account
3. Select your WeddingBazaar database
4. Click "SQL Editor" tab

### Step 2: Run This SQL Script
Copy and paste this entire script into the SQL Editor:

```sql
-- ==========================================
-- SUBSCRIPTION TABLES CREATION SCRIPT
-- ==========================================

-- 1. Main vendor_subscriptions table
CREATE TABLE IF NOT EXISTS vendor_subscriptions (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(100) NOT NULL,
  plan_name VARCHAR(100) DEFAULT 'basic',
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  trial_end_date TIMESTAMP,
  next_billing_date TIMESTAMP,
  payment_method_id VARCHAR(255),
  paymongo_customer_id VARCHAR(255),
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Subscription transactions log
CREATE TABLE IF NOT EXISTS subscription_transactions (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER REFERENCES vendor_subscriptions(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- 'initial_payment', 'recurring_payment', 'upgrade', 'downgrade', 'cancellation', 'admin_created'
  amount INTEGER NOT NULL DEFAULT 0, -- in centavos
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  payment_intent_id VARCHAR(255),
  payment_method_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Usage tracking logs (optional, for analytics)
CREATE TABLE IF NOT EXISTS subscription_usage_logs (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(100) NOT NULL,
  usage_type VARCHAR(50) NOT NULL, -- 'service_created', 'booking_accepted', 'message_sent', 'portfolio_uploaded'
  usage_date DATE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Vendor subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_vendor_id 
  ON vendor_subscriptions(vendor_id);

CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_status 
  ON vendor_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_plan_name 
  ON vendor_subscriptions(plan_name);

CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_next_billing 
  ON vendor_subscriptions(next_billing_date) 
  WHERE status = 'active';

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_subscription_id 
  ON subscription_transactions(subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscription_transactions_status 
  ON subscription_transactions(status);

CREATE INDEX IF NOT EXISTS idx_subscription_transactions_created_at 
  ON subscription_transactions(created_at DESC);

-- Usage logs indexes
CREATE INDEX IF NOT EXISTS idx_subscription_usage_vendor_id 
  ON subscription_usage_logs(vendor_id);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_date 
  ON subscription_usage_logs(usage_date DESC);

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('vendor_subscriptions', 'subscription_transactions', 'subscription_usage_logs')
ORDER BY table_name;

-- Show vendor_subscriptions structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'vendor_subscriptions'
ORDER BY ordinal_position;
```

### Step 3: Click "Run" Button
- Click the "Run" button in SQL Editor
- Wait for execution (~5-10 seconds)
- Check for success message

### Step 4: Verify Creation
Run this verification query:
```sql
-- Should return 3 tables with their column counts
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('vendor_subscriptions', 'subscription_transactions', 'subscription_usage_logs')
ORDER BY table_name;
```

**Expected Output**:
```
table_name                 | column_count
---------------------------+-------------
subscription_transactions  | 9
subscription_usage_logs    | 7
vendor_subscriptions       | 14
```

---

## 🧪 Test After Creation

### Test 1: Vendor Subscription Query
```bash
curl https://weddingbazaar-web.onrender.com/api/subscriptions/vendor/test-vendor-123
```

**Expected Result**:
```json
{
  "success": true,
  "subscription": {
    "id": null,
    "vendor_id": "test-vendor-123",
    "plan_name": "basic",
    "billing_cycle": "monthly",
    "status": "active",
    "plan": {
      "id": "basic",
      "name": "Free Tier",
      "price": 0,
      "features": [...]
    }
  }
}
```

### Test 2: Create Test Subscription (Optional)
```sql
-- Insert a test subscription
INSERT INTO vendor_subscriptions (
  vendor_id,
  plan_name,
  billing_cycle,
  status,
  start_date,
  end_date
) VALUES (
  'test-vendor-123',
  'premium',
  'monthly',
  'active',
  NOW(),
  NOW() + INTERVAL '1 month'
);

-- Verify insertion
SELECT * FROM vendor_subscriptions WHERE vendor_id = 'test-vendor-123';
```

### Test 3: Query with Real Subscription
```bash
curl https://weddingbazaar-web.onrender.com/api/subscriptions/vendor/test-vendor-123
```

**Expected Result** (after inserting test data):
```json
{
  "success": true,
  "subscription": {
    "id": 1,
    "vendor_id": "test-vendor-123",
    "plan_name": "premium",
    "billing_cycle": "monthly",
    "status": "active",
    "plan": {
      "id": "premium",
      "name": "Premium Plan",
      "price": 99900,
      "features": [...]
    }
  }
}
```

---

## ✅ SUCCESS CRITERIA

After running the SQL script, you should have:

1. ✅ **3 new tables created**:
   - `vendor_subscriptions` (14 columns)
   - `subscription_transactions` (9 columns)
   - `subscription_usage_logs` (7 columns)

2. ✅ **8 indexes created** for query performance

3. ✅ **Vendor endpoint working**:
   - Returns 200 OK instead of 500 error
   - Returns free tier for vendors without subscription
   - Returns actual subscription for vendors with subscription

4. ✅ **Ready for production use**:
   - All subscription endpoints functional
   - Free tier fallback working
   - Usage tracking ready
   - Payment processing ready

---

## 🚨 If Script Fails

### Error: "relation already exists"
**Solution**: Tables already created, you're good! Just verify:
```sql
SELECT COUNT(*) FROM vendor_subscriptions;
```

### Error: "permission denied"
**Solution**: Check database user permissions:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
```

### Error: "connection timeout"
**Solution**: 
1. Check Neon database status
2. Verify connection string in Render env vars
3. Retry SQL script

---

## 📊 AFTER FIX - FULL TEST SUITE

Once tables are created, run full test suite:

```bash
# 1. Health Check
curl https://weddingbazaar-web.onrender.com/api/health

# 2. Plans
curl https://weddingbazaar-web.onrender.com/api/subscriptions/plans

# 3. Specific Plan
curl https://weddingbazaar-web.onrender.com/api/subscriptions/plans/basic

# 4. Vendor Subscription (should work now!)
curl https://weddingbazaar-web.onrender.com/api/subscriptions/vendor/test-vendor-123

# 5. All Plans Features
curl https://weddingbazaar-web.onrender.com/api/subscriptions/features
```

**All should return 200 OK** ✅

---

## 🎉 COMPLETION CHECKLIST

- [ ] Opened Neon console
- [ ] Ran SQL script
- [ ] Verified 3 tables created
- [ ] Tested vendor endpoint (200 OK)
- [ ] Verified free tier fallback
- [ ] (Optional) Created test subscription
- [ ] Ran full test suite
- [ ] Marked deployment as 100% complete

---

**Estimated Time**: 5-10 minutes  
**Difficulty**: ⭐ Easy (copy-paste SQL)  
**Impact**: 🚀 Unblocks entire subscription system  
**Next Step**: Test payment integration with PayMongo
