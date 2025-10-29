# 🎴 WALLET API 500 ERROR - QUICK REFERENCE

## The Problem
Wallet API returns **500 Internal Server Error** when vendor accesses finances page.

## The Fix (3 Steps)

### Step 1: Create Wallet Data (2 minutes)
```sql
-- Run this in Neon SQL Console
INSERT INTO vendor_wallets (vendor_id) VALUES ('2-2025-001') ON CONFLICT (vendor_id) DO NOTHING;
INSERT INTO wallet_transactions (vendor_id, booking_id, transaction_type, amount, service_category, status, payment_method) VALUES 
('2-2025-001', 'TEST-001', 'earning', 50000, 'Photography', 'completed', 'card'),
('2-2025-001', 'TEST-002', 'earning', 75000, 'Catering', 'completed', 'gcash');
UPDATE vendor_wallets SET total_earnings = 125000, available_balance = 125000, last_transaction_at = NOW() WHERE vendor_id = '2-2025-001';
```

### Step 2: Check Render Logs (1 minute)
1. Go to: https://dashboard.render.com
2. Click `weddingbazaar-web`
3. Click **Logs** tab
4. Copy any error messages with "wallet" or "500"

### Step 3: Test Again (1 minute)
1. Go to: https://weddingbazaarph.web.app
2. Login as vendor
3. Go to Vendor Finances
4. Check if 500 is gone

## Expected Result
✅ Wallet page shows **₱1,250.00** total earnings
✅ Transaction history shows **2 test transactions**
✅ No 500 error

## If Still Broken
**Report back with**:
- Exact error from Render logs
- SQL query results (did data get created?)
- Frontend behavior (still 500 or different error?)

## Files to Use
- `INIT_WALLET_DATA.sql` - Full SQL script with verification
- `CHECK_WALLET_DATA.sql` - Diagnostic queries
- `WALLET_500_ACTION_PLAN.md` - Detailed guide

## One-Liner Fix
```bash
# Just run this in Neon SQL Console:
INSERT INTO vendor_wallets (vendor_id) VALUES ('2-2025-001') ON CONFLICT (vendor_id) DO NOTHING; INSERT INTO wallet_transactions (vendor_id, booking_id, transaction_type, amount, service_category, status, payment_method) VALUES ('2-2025-001', 'TEST-001', 'earning', 50000, 'Photography', 'completed', 'card'), ('2-2025-001', 'TEST-002', 'earning', 75000, 'Catering', 'completed', 'gcash'); UPDATE vendor_wallets SET total_earnings = 125000, available_balance = 125000 WHERE vendor_id = '2-2025-001';
```

That's it! 🎯
