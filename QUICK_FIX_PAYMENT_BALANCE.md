# ⚡ QUICK FIX - Payment Balance Issue

## THE PROBLEM
"Pay Balance" button shows ₱89,603.36 (full amount) instead of remaining balance.

## THE SOLUTION
Database is missing payment tracking columns.

## WHAT TO DO RIGHT NOW

### 1. Open Neon SQL Editor
https://console.neon.tech → SQL Editor

### 2. Copy & Paste This SQL
```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_paid INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS remaining_balance INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS downpayment_amount INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_progress INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);

UPDATE bookings
SET 
  total_paid = COALESCE(downpayment_amount, ROUND(COALESCE(total_amount, amount) * 0.3)),
  remaining_balance = COALESCE(total_amount, amount) - COALESCE(downpayment_amount, ROUND(COALESCE(total_amount, amount) * 0.3)),
  payment_progress = ROUND((COALESCE(downpayment_amount, ROUND(COALESCE(total_amount, amount) * 0.3))::FLOAT / NULLIF(COALESCE(total_amount, amount), 0)) * 100)
WHERE status IN ('downpayment', 'deposit_paid', 'downpayment_paid')
AND (total_paid IS NULL OR total_paid = 0);
```

### 3. Click "Run" Button

### 4. Test
- Go to https://weddingbazaarph.web.app
- Login and check bookings
- Balance should now show correctly

## EXPECTED RESULT
```
Before: Balance: ₱89,603.36 ❌
After:  Balance: ₱62,722.36 ✅
```

## TIME TO FIX
⏱️ 2 minutes

## PRIORITY
🚨 CRITICAL

---

**That's it! Run the SQL and you're done.**

For detailed explanation, see: `PAYMENT_BALANCE_FIX_FINAL_STATUS.md`
