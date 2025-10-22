# 🚨 URGENT: Run Database Fix NOW

## Problem
- **Receipt viewing failing** with error: `column r.payment_type does not exist`
- **Receipts table missing required columns**
- **Payment progress column needs to be DECIMAL**

## Solution
Run the `COMPLETE_DATABASE_FIX.sql` script in Neon PostgreSQL.

---

## 📋 Step-by-Step Instructions

### Step 1: Open Neon SQL Editor
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project: **WeddingBazaar**
3. Click **SQL Editor** in the left sidebar

### Step 2: Copy and Run the SQL Script

**Option A: Run the entire script at once**
```sql
-- Copy ALL contents from COMPLETE_DATABASE_FIX.sql
-- Paste into Neon SQL Editor
-- Click "Run" button
```

**Option B: Run commands one section at a time** (recommended for safety)

#### Section 1: Fix payment_progress column
```sql
ALTER TABLE bookings ALTER COLUMN payment_progress TYPE DECIMAL(10,2);
```
✅ **Expected**: `ALTER TABLE` success message

#### Section 2: Drop and recreate receipts table
```sql
DROP TABLE IF EXISTS receipts CASCADE;

CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id VARCHAR(50) NOT NULL,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  payment_method VARCHAR(50),
  payment_intent_id VARCHAR(255),
  paid_by VARCHAR(50),
  paid_by_name VARCHAR(255),
  paid_by_email VARCHAR(255),
  total_paid INTEGER,
  remaining_balance INTEGER,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```
✅ **Expected**: `DROP TABLE` and `CREATE TABLE` success messages

#### Section 3: Create indexes
```sql
CREATE INDEX idx_receipts_booking_id ON receipts(booking_id);
CREATE INDEX idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX idx_receipts_created_at ON receipts(created_at DESC);
```
✅ **Expected**: 3 `CREATE INDEX` success messages

### Step 3: Verify the Fix

#### Verification Query 1: Check bookings table columns
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name IN ('total_paid', 'remaining_balance', 'downpayment_amount', 'payment_progress')
ORDER BY column_name;
```

**Expected Output:**
```
column_name          | data_type
---------------------|----------
downpayment_amount   | numeric
payment_progress     | numeric
remaining_balance    | numeric
total_paid           | numeric
```

#### Verification Query 2: Check receipts table structure
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'receipts'
ORDER BY ordinal_position;
```

**Expected Output:** (16 columns)
```
column_name         | data_type           | column_default
--------------------|---------------------|---------------------
id                  | uuid                | gen_random_uuid()
booking_id          | character varying   | NULL
receipt_number      | character varying   | NULL
payment_type        | character varying   | NULL  ✅ THIS IS KEY
amount              | integer             | NULL
currency            | character varying   | 'PHP'::character varying
payment_method      | character varying   | NULL
payment_intent_id   | character varying   | NULL
paid_by             | character varying   | NULL
paid_by_name        | character varying   | NULL
paid_by_email       | character varying   | NULL
total_paid          | integer             | NULL
remaining_balance   | integer             | NULL
notes               | text                | NULL
metadata            | jsonb               | NULL
created_at          | timestamp without time zone | now()
```

---

## 🔍 What This Fix Does

### 1. Fixes payment_progress Column Type
- **Before**: May be INTEGER or wrong type
- **After**: DECIMAL(10,2) for accurate percentage tracking

### 2. Recreates Receipts Table
- **Drops** old receipts table (⚠️ **WARNING**: Will delete any existing receipts)
- **Creates** new receipts table with ALL required columns:
  - ✅ `payment_type` - Missing column causing 500 errors
  - ✅ `amount` - Payment amount in centavos
  - ✅ `total_paid` - Running total
  - ✅ `remaining_balance` - Balance remaining
  - ✅ All other required fields

### 3. Adds Performance Indexes
- Index on `booking_id` for fast lookups
- Index on `receipt_number` for unique receipt queries
- Index on `created_at` for chronological sorting

---

## ⚠️ Important Notes

### Data Loss Warning
**Running this script WILL DELETE all existing receipts** because it drops and recreates the `receipts` table.

**Mitigation Options:**

**Option 1: Backup First** (recommended if you have production data)
```sql
-- Create backup of existing receipts (if any)
CREATE TABLE receipts_backup AS SELECT * FROM receipts;
```

**Option 2: Skip Backup** (safe if no receipts exist yet)
- If you haven't made any successful payments yet, there are no receipts to lose
- Safe to proceed with DROP and CREATE

### Check if Receipts Exist
```sql
SELECT COUNT(*) FROM receipts;
```
- If count = 0, safe to proceed
- If count > 0, consider backup first

---

## 🧪 Testing After Fix

### Test 1: Make a Test Payment
1. Log into the app as a user
2. Navigate to a booking with status "Quote Accepted"
3. Click "Pay Deposit" or "Pay Balance"
4. Complete payment with test card: `4343434343434345`
5. ✅ Payment should succeed and show success message

### Test 2: View Receipt
1. After successful payment, click "View Receipt" button
2. ✅ Receipt should display with all details:
   - Receipt number
   - Payment type (Deposit/Balance/Full Payment)
   - Amount paid
   - Total paid so far
   - Remaining balance
   - Payment method
   - Date and time

### Test 3: Check Database
```sql
-- Check that receipt was created
SELECT 
  receipt_number,
  payment_type,
  amount,
  total_paid,
  remaining_balance,
  created_at
FROM receipts
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🎯 Success Criteria

✅ **All SQL commands run without errors**
✅ **Verification queries show correct column types and structure**
✅ **Test payment completes successfully**
✅ **Receipt displays correctly with all fields**
✅ **No 500 errors when clicking "View Receipt"**
✅ **Backend logs show no SQL errors**

---

## 🚀 Next Steps After Fix

1. **Test payment flow** with all payment types:
   - Deposit payment (partial)
   - Balance payment (remaining amount)
   - Full payment (100% upfront)

2. **Verify booking status updates** correctly:
   - After deposit: `deposit_paid`
   - After balance: `paid_in_full`
   - After full payment: `paid_in_full`

3. **Check receipt display** for all payment types

4. **Monitor Render logs** for any SQL errors

5. **Update documentation** with test results

---

## 📞 If Something Goes Wrong

### Issue: SQL command fails
- **Check**: Are you in the correct database?
- **Check**: Do you have write permissions?
- **Try**: Run commands one at a time instead of all at once

### Issue: Verification queries show wrong results
- **Check**: Did all ALTER/CREATE commands succeed?
- **Try**: Run the verification queries again
- **Contact**: DBA or senior developer

### Issue: Receipts not appearing after payment
- **Check**: Backend logs in Render dashboard
- **Check**: Network tab in browser dev tools
- **Verify**: Payment success response contains receipt data

---

## 📝 Documentation Updates Needed

After successful fix, update these files:
- [ ] `PAYMENT_SYSTEM_STATUS.md` - Mark as "FIXED"
- [ ] `RECEIPTS_FIX_QUICK_STATUS.md` - Add test results
- [ ] `DEPLOYMENT_STATUS.md` - Update database status
- [ ] Create `DATABASE_FIX_SUCCESS_REPORT.md` with test results

---

## 🎉 Expected Outcome

After running this fix:
- ✅ Receipt viewing will work without errors
- ✅ Payment data will persist correctly
- ✅ Booking statuses will update properly
- ✅ Payment progress will track accurately
- ✅ All payment types will generate receipts

**NO CODE CHANGES NEEDED** - This is purely a database schema fix!

---

## ⏱️ Estimated Time
- **Run SQL script**: 2-3 minutes
- **Verify results**: 2-3 minutes
- **Test payment flow**: 5-10 minutes
- **Total**: ~15 minutes

---

## 🆘 Need Help?

If you encounter issues running this script:
1. Take screenshots of any errors
2. Copy the exact error message
3. Check which command failed
4. Ask for help with specific details

**DO NOT SKIP THIS FIX** - The app will not work properly without it!
