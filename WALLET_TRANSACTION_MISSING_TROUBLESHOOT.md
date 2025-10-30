# 🔍 Wallet Transaction Missing - Troubleshooting Guide

## Problem
You completed a booking but the vendor doesn't see the transaction in their wallet history.

## Possible Causes

### 1. **No Receipts Found** (Most Likely)
**Symptoms**:
- Booking status shows "completed"
- But wallet transaction wasn't created

**Cause**: The system looks for receipts in the `receipts` table. If no receipts exist (booking was marked complete without payment), the system uses a fallback.

**Check**:
```sql
-- Run in Neon SQL Console
SELECT * FROM receipts WHERE booking_id = 'YOUR_BOOKING_ID';
```

**Expected**: Should return at least one receipt record

**If Empty**: The booking was completed without payment records!

---

### 2. **Backend Error During Transaction Creation**
**Symptoms**:
- Booking is completed
- Receipts exist
- But no wallet transaction

**Check Backend Logs**:
1. Go to https://dashboard.render.com
2. Click on your service
3. Go to "Logs" tab
4. Search for your booking ID
5. Look for error messages

**What to look for**:
```
❌ Error creating wallet transaction
❌ Failed to update wallet
⚠️ No receipts found, using booking amount as fallback
```

---

### 3. **Vendor ID Mismatch**
**Symptoms**:
- Transaction created but for wrong vendor
- Vendor can't see it in their wallet

**Check**:
```sql
-- Run in Neon SQL Console
SELECT 
  b.id as booking_id,
  b.vendor_id as booking_vendor,
  wt.vendor_id as transaction_vendor
FROM bookings b
LEFT JOIN wallet_transactions wt ON wt.booking_id = b.id
WHERE b.id = 'YOUR_BOOKING_ID';
```

**Expected**: `booking_vendor` should equal `transaction_vendor`

---

## Solutions

### Solution 1: Manual Transaction Creation

**Step 1**: Get booking data
```sql
SELECT 
  id,
  vendor_id,
  couple_name,
  service_type,
  amount,
  event_date,
  (SELECT SUM(amount) FROM receipts WHERE booking_id = bookings.id) / 100 as receipts_total
FROM bookings
WHERE id = 'YOUR_BOOKING_ID';
```

**Step 2**: Create wallet transaction manually
```sql
-- Replace values with data from Step 1
INSERT INTO wallet_transactions (
  transaction_id,
  vendor_id,
  booking_id,
  transaction_type,
  amount,
  currency,
  status,
  description,
  payment_method,
  service_name,
  customer_name,
  event_date,
  created_at,
  updated_at
) VALUES (
  'TXN-YOUR_BOOKING_ID-MANUAL-' || EXTRACT(EPOCH FROM NOW())::bigint,
  'VENDOR_ID_FROM_STEP1',
  'YOUR_BOOKING_ID',
  'earning',
  0.00, -- Replace with receipts_total or amount from Step 1
  'PHP',
  'completed',
  'Manual transaction for completed booking',
  'manual',
  'SERVICE_TYPE_FROM_STEP1',
  'COUPLE_NAME_FROM_STEP1',
  'EVENT_DATE_FROM_STEP1',
  NOW(),
  NOW()
);
```

**Step 3**: Update vendor wallet
```sql
-- Replace values
UPDATE vendor_wallets
SET 
  total_earnings = total_earnings + 0.00, -- Replace with amount
  available_balance = available_balance + 0.00, -- Replace with amount
  updated_at = NOW()
WHERE vendor_id = 'VENDOR_ID_FROM_STEP1';
```

**Step 4**: If wallet doesn't exist, create it
```sql
-- Only run if UPDATE above affected 0 rows
INSERT INTO vendor_wallets (
  vendor_id,
  total_earnings,
  available_balance,
  pending_balance,
  withdrawn_amount,
  currency
) VALUES (
  'VENDOR_ID_FROM_STEP1',
  0.00, -- Replace with amount
  0.00, -- Replace with amount
  0.00,
  0.00,
  'PHP'
);
```

---

### Solution 2: Re-trigger Completion (If Safe)

**Only do this if**:
- Transaction wasn't created at all
- You can safely unmark and re-mark completion

**Steps**:
```sql
-- Unmark completion
UPDATE bookings
SET 
  vendor_completed = FALSE,
  couple_completed = FALSE,
  status = 'fully_paid',
  fully_completed = FALSE,
  fully_completed_at = NULL
WHERE id = 'YOUR_BOOKING_ID';
```

Then have both parties mark as complete again through the UI. This will re-trigger the wallet logic.

---

## Prevention

To avoid this in the future:

### 1. Always Create Receipts for Payments
Make sure every payment goes through:
```
POST /api/payment/process
```

This creates a receipt automatically.

### 2. Verify Receipts Before Completion
Before marking complete, check:
```sql
SELECT COUNT(*) FROM receipts WHERE booking_id = 'YOUR_BOOKING_ID';
```

Should be > 0

### 3. Monitor Backend Logs
Watch for wallet creation messages:
```
💰 Creating wallet transaction for vendor
📄 Found X receipt(s)
💵 Total paid from receipts: ₱X,XXX
✅ Wallet transaction created
```

---

## Quick Diagnostic Checklist

Run this complete diagnostic:

```sql
-- All-in-one diagnostic query
WITH booking_info AS (
  SELECT * FROM bookings WHERE id = 'YOUR_BOOKING_ID'
),
receipt_info AS (
  SELECT 
    booking_id,
    COUNT(*) as receipt_count,
    SUM(amount) / 100 as total_paid
  FROM receipts 
  WHERE booking_id = 'YOUR_BOOKING_ID'
  GROUP BY booking_id
),
transaction_info AS (
  SELECT * FROM wallet_transactions WHERE booking_id = 'YOUR_BOOKING_ID'
)
SELECT 
  'Booking Status' as check_type,
  CASE 
    WHEN b.fully_completed THEN '✅ Completed'
    ELSE '❌ Not Completed'
  END as result,
  b.status as details
FROM booking_info b
UNION ALL
SELECT 
  'Receipts Exist' as check_type,
  CASE 
    WHEN r.receipt_count > 0 THEN '✅ Found ' || r.receipt_count || ' receipt(s)'
    ELSE '❌ No receipts'
  END as result,
  '₱' || COALESCE(r.total_paid, 0)::text as details
FROM receipt_info r
UNION ALL
SELECT 
  'Wallet Transaction' as check_type,
  CASE 
    WHEN t.id IS NOT NULL THEN '✅ Created'
    ELSE '❌ Missing'
  END as result,
  COALESCE('₱' || t.amount::text, 'N/A') as details
FROM transaction_info t;
```

**Expected Results**:
```
✅ Completed
✅ Found 1+ receipt(s)
✅ Created wallet transaction
```

**If any ❌**:
1. No receipts → Use Solution 1 (manual creation)
2. Missing transaction → Check backend logs, use Solution 1

---

## Need Help?

1. **Check Documentation**:
   - `PAYMENT_TRANSFER_SYSTEM.md` - Complete flow
   - `DEPLOYMENT_STATUS_PAYMENT_TRANSFER.md` - Testing guide

2. **Check Backend Logs**:
   - https://dashboard.render.com
   - Look for wallet-related errors

3. **Run Diagnostics**:
   ```powershell
   .\check-wallet-simple.ps1
   ```

4. **Contact Support**:
   - Provide booking ID
   - Provide diagnostic results
   - Include backend log excerpts

---

**Last Updated**: October 30, 2025
