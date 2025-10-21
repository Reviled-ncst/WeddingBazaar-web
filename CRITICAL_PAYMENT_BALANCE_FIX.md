# 🚨 CRITICAL FIX: Payment Balance Not Calculating

## Problem Identified

**The "Pay Balance" button shows ₱89,603.36 (full amount) instead of the remaining balance after deposit!**

### Root Causes:
1. ✅ Backend code IS correct (updates `total_paid` and `remaining_balance`)
2. ❌ Database columns DON'T EXIST yet (`total_paid`, `remaining_balance`, etc.)
3. ❌ Render deployment hasn't picked up the new backend changes
4. ❌ Existing bookings with deposits have no calculated balance

---

## Immediate Fix Required

### Step 1: Add Database Columns (URGENT)

Run this SQL in **Neon Database SQL Editor**:

```sql
-- Add payment tracking columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_paid INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS remaining_balance INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS downpayment_amount INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_progress INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);

-- Update existing bookings with deposits to calculate balances
UPDATE bookings
SET 
  total_paid = COALESCE(downpayment_amount, ROUND(COALESCE(total_amount, amount) * 0.3)),
  remaining_balance = COALESCE(total_amount, amount) - COALESCE(downpayment_amount, ROUND(COALESCE(total_amount, amount) * 0.3)),
  payment_progress = ROUND((COALESCE(downpayment_amount, ROUND(COALESCE(total_amount, amount) * 0.3))::FLOAT / NULLIF(COALESCE(total_amount, amount), 0)) * 100)
WHERE status IN ('downpayment', 'deposit_paid', 'downpayment_paid')
AND (total_paid IS NULL OR total_paid = 0);

-- Verify the update
SELECT 
  id,
  status,
  total_amount,
  amount,
  total_paid,
  remaining_balance,
  payment_progress
FROM bookings
WHERE status IN ('downpayment', 'deposit_paid', 'downpayment_paid')
LIMIT 5;
```

### Step 2: Verify Render Deployment

1. Go to https://dashboard.render.com
2. Check if the deployment is complete
3. Look for commit: "fix: Payment balance updates correctly + Add full payment option"
4. If not deployed, manually trigger deployment

### Step 3: Test the Fix

After database columns are added:

1. Go to https://weddingbazaarph.web.app
2. Login as couple user
3. Go to Bookings page
4. Find booking with "Deposit Paid" status
5. Click "Pay Balance" button
6. **Expected:** Modal shows remaining balance (e.g., ₱62,722.36) NOT full amount (₱89,603.36)

---

## What Should Happen After Fix

### Before Fix:
```
Booking Card:
- Total Amount: ₱89,603.36
- Balance: ₱89,603.36 ❌ WRONG (should be reduced after deposit)

Pay Balance Modal:
- Type: Remaining Balance
- Total Amount: ₱89,603.36 ❌ WRONG (showing full amount)
```

### After Fix:
```
Booking Card:
- Total Amount: ₱89,603.36
- Balance: ₱62,722.36 ✅ CORRECT (after ₱26,881 deposit)

Pay Balance Modal:
- Type: Remaining Balance
- Total Amount: ₱62,722.36 ✅ CORRECT (only the remaining balance)
```

---

## Technical Details

### Database Schema Update
The `bookings` table needs these columns:

| Column | Type | Description |
|--------|------|-------------|
| `total_paid` | INTEGER | Running total of all payments (in centavos) |
| `remaining_balance` | INTEGER | Amount left to pay (in centavos) |
| `downpayment_amount` | INTEGER | Actual deposit paid (in centavos) |
| `payment_progress` | INTEGER | Percentage complete (0-100) |
| `last_payment_date` | TIMESTAMP | When last payment was made |
| `payment_method` | VARCHAR(50) | 'card', 'gcash', 'paymaya', etc. |
| `transaction_id` | VARCHAR(255) | PayMongo transaction reference |

### Payment Flow After Fix
```
1. User pays deposit: ₱26,881
2. Backend updates:
   - total_paid = 26881 (in centavos)
   - remaining_balance = 89603 - 26881 = 62722
   - payment_progress = (26881 / 89603) * 100 = 30%
   - status = 'downpayment'

3. Frontend displays:
   - Balance: ₱62,722.36 (formatted from remaining_balance)
   - "Pay Balance" button enabled

4. User clicks "Pay Balance":
   - Modal opens with amount = 62722 (from booking.remainingBalance)
   - User pays ₱62,722.36

5. Backend updates:
   - total_paid = 26881 + 62722 = 89603
   - remaining_balance = 0
   - payment_progress = 100%
   - status = 'fully_paid'

6. Frontend displays:
   - Balance: ₱0.00
   - Status: "Fully Paid"
   - No payment buttons (already paid)
```

---

## Verification Queries

### Check if columns exist:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('total_paid', 'remaining_balance', 'downpayment_amount', 'payment_progress')
ORDER BY column_name;
```

### Check booking with deposit:
```sql
SELECT 
  id,
  service_type,
  status,
  total_amount,
  amount,
  total_paid,
  remaining_balance,
  downpayment_amount,
  payment_progress,
  last_payment_date
FROM bookings
WHERE status IN ('downpayment', 'deposit_paid', 'downpayment_paid')
ORDER BY created_at DESC
LIMIT 5;
```

### Verify payment accuracy:
```sql
SELECT 
  b.id,
  b.total_amount,
  b.total_paid,
  b.remaining_balance,
  b.payment_progress,
  SUM(r.amount_paid) as receipts_total
FROM bookings b
LEFT JOIN receipts r ON r.booking_id = b.id
WHERE b.status IN ('downpayment', 'deposit_paid', 'downpayment_paid', 'fully_paid')
GROUP BY b.id, b.total_amount, b.total_paid, b.remaining_balance, b.payment_progress
HAVING b.total_paid != COALESCE(SUM(r.amount_paid), 0);
```

---

## Success Criteria

After applying the fix, these should ALL be true:

- [ ] Database has all 7 payment tracking columns
- [ ] Existing bookings with deposits show correct `remaining_balance`
- [ ] Render deployment is live with new backend code
- [ ] Frontend "Pay Balance" button shows correct amount
- [ ] Payment modal displays only remaining balance, not full amount
- [ ] After paying balance, booking status updates to "Fully Paid"
- [ ] Balance shows ₱0.00 after full payment

---

## Emergency Rollback

If the fix causes issues:

### Revert Database Changes:
```sql
-- Remove the columns (NOT RECOMMENDED, will lose data)
ALTER TABLE bookings DROP COLUMN IF EXISTS total_paid;
ALTER TABLE bookings DROP COLUMN IF EXISTS remaining_balance;
-- ... etc

-- OR keep columns but reset values:
UPDATE bookings
SET 
  total_paid = 0,
  remaining_balance = NULL,
  payment_progress = 0
WHERE status IN ('downpayment', 'deposit_paid', 'downpayment_paid');
```

### Revert Backend:
```bash
git revert HEAD~2  # Revert last 2 commits
git push origin main
```

### Revert Frontend:
```bash
firebase hosting:rollback
```

---

## Next Steps After Fix

1. ✅ Apply database schema changes (SQL above)
2. ✅ Wait for Render deployment to complete
3. ✅ Test payment balance calculation
4. ✅ Verify full payment flow works
5. 📊 Monitor payment accuracy in production
6. 📧 Add email notifications for successful payments
7. 🧾 Implement PDF receipt download feature

---

**Status:** 🔴 CRITICAL - Requires immediate database update
**Impact:** All users with deposit-paid bookings affected
**ETA:** 10 minutes (database update + Render deployment)

**Action Required:**
1. Run SQL in Neon Database SQL Editor NOW
2. Verify Render deployment status
3. Test in production immediately after
