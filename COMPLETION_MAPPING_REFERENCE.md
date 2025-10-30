# 🎯 Completion to Wallet Mapping - Quick Reference

## What is Completion Mapping?

**Completion Mapping** = When a booking is marked as COMPLETED (by both vendor and couple), the system should **automatically create a wallet transaction** for the vendor.

```
Booking Completed → Wallet Transaction Created → Vendor Gets Paid
```

---

## How to Check Mapping Status

### Run QUERY 5 in Neon SQL Console:

```sql
-- Check if completed bookings have wallet transactions
SELECT 
  b.id as booking_id,
  b.vendor_id,
  b.couple_name,
  b.service_type,
  b.amount as booking_amount,
  b.status,
  b.fully_completed,
  b.fully_completed_at,
  (SELECT COUNT(*) FROM receipts WHERE booking_id = b.id) as receipt_count,
  (SELECT SUM(amount) FROM receipts WHERE booking_id = b.id) / 100 as receipts_total,
  wt.transaction_id,
  wt.amount as wallet_amount,
  wt.created_at as transaction_created,
  CASE 
    WHEN b.fully_completed = true AND wt.id IS NULL THEN '❌ MISSING TRANSACTION'
    WHEN b.fully_completed = true AND wt.id IS NOT NULL THEN '✅ TRANSACTION EXISTS'
    WHEN b.fully_completed = false THEN '⏳ NOT YET COMPLETED'
  END as mapping_status
FROM bookings b
LEFT JOIN wallet_transactions wt ON wt.booking_id = b.id
WHERE b.status = 'completed' 
   OR b.fully_completed = true
   OR b.vendor_completed = true
   OR b.couple_completed = true
ORDER BY b.updated_at DESC
LIMIT 10;
```

---

## Reading the Results

### ✅ TRANSACTION EXISTS (Working Correctly)

**Example Result**:
```
booking_id: abc-123
vendor_id: 2-2025-001
couple_name: John & Jane
status: completed
fully_completed: true
receipt_count: 2
receipts_total: 10000.00
transaction_id: TXN-abc-123-xxx
wallet_amount: 10000.00
mapping_status: ✅ TRANSACTION EXISTS
```

**What this means**:
- ✅ Booking is fully completed
- ✅ Receipts exist (2 payments)
- ✅ Wallet transaction was created
- ✅ Amount matches receipts total
- ✅ **SYSTEM IS WORKING!**

---

### ❌ MISSING TRANSACTION (Needs Fix)

**Example Result**:
```
booking_id: def-456
vendor_id: 2-2025-001
couple_name: Bob & Alice
status: completed
fully_completed: true
receipt_count: 1
receipts_total: 5000.00
transaction_id: NULL
wallet_amount: NULL
mapping_status: ❌ MISSING TRANSACTION
```

**What this means**:
- ✅ Booking is fully completed
- ✅ Receipts exist (1 payment)
- ❌ Wallet transaction was NOT created
- ❌ **MAPPING FAILED!**

**Why it failed**:
1. Backend error during wallet creation
2. Database constraint violation
3. Missing vendor wallet entry
4. Network/timeout issue

**How to fix**:
See `WALLET_TRANSACTION_MISSING_TROUBLESHOOT.md` for manual fix steps

---

### ⏳ NOT YET COMPLETED (Waiting)

**Example Result**:
```
booking_id: ghi-789
vendor_id: 2-2025-001
couple_name: Tom & Mary
status: fully_paid
fully_completed: false
receipt_count: 2
receipts_total: 8000.00
transaction_id: NULL
wallet_amount: NULL
mapping_status: ⏳ NOT YET COMPLETED
```

**What this means**:
- ✅ Booking is paid
- ✅ Receipts exist
- ⏳ Waiting for BOTH parties to mark complete
- ⏳ Transaction will be created after completion

**What to do**:
- Nothing! Wait for both vendor and couple to confirm completion
- Once both confirm → transaction will be created automatically

---

## Mapping Status Summary

| Status | Fully Completed | Transaction Exists | Action Needed |
|--------|----------------|-------------------|---------------|
| ✅ TRANSACTION EXISTS | ✅ Yes | ✅ Yes | None - Working! |
| ❌ MISSING TRANSACTION | ✅ Yes | ❌ No | **Manual Fix Required** |
| ⏳ NOT YET COMPLETED | ❌ No | ❌ No | Wait for completion |

---

## What to Check If Mapping Failed

### 1. Check Receipts
```sql
SELECT * FROM receipts WHERE booking_id = 'YOUR_BOOKING_ID';
```

**Expected**: At least 1 receipt  
**If empty**: No payment was made! Transaction can't be created.

---

### 2. Check Backend Logs

Go to: https://dashboard.render.com → Logs

**Search for your booking ID** and look for:

✅ **Success messages**:
```
💰 Creating wallet transaction for vendor: 2-2025-001
📄 Found 2 receipt(s) for booking abc-123
💵 Total paid from receipts: ₱10,000.00
✅ Wallet transaction created: TXN-abc-123-xxx
✅ Wallet updated. Added: ₱10,000.00
🎉 Wallet integration complete
```

❌ **Error messages**:
```
❌ Error creating wallet transaction
⚠️ No receipts found, using booking amount as fallback
❌ Failed to update vendor wallet
Database error: ...
```

---

### 3. Check Vendor Wallet Exists
```sql
SELECT * FROM vendor_wallets WHERE vendor_id = '2-2025-001';
```

**Expected**: 1 row with vendor's wallet  
**If empty**: Wallet doesn't exist! Create it first:

```sql
INSERT INTO vendor_wallets (
  vendor_id,
  total_earnings,
  available_balance,
  pending_balance,
  withdrawn_amount,
  currency
) VALUES (
  '2-2025-001',
  0.00,
  0.00,
  0.00,
  0.00,
  'PHP'
);
```

---

## Common Issues & Solutions

### Issue 1: Transaction Amount = 0
**Cause**: No receipts found, system used booking.amount but it was 0 or NULL

**Fix**:
```sql
-- Update transaction with correct amount
UPDATE wallet_transactions
SET amount = 10000.00  -- Replace with actual amount
WHERE booking_id = 'YOUR_BOOKING_ID';

-- Update vendor wallet
UPDATE vendor_wallets
SET 
  total_earnings = total_earnings + 10000.00,
  available_balance = available_balance + 10000.00
WHERE vendor_id = 'VENDOR_ID';
```

---

### Issue 2: Transaction Created Twice
**Cause**: Completion button clicked multiple times

**Fix**:
```sql
-- Find duplicate transactions
SELECT booking_id, COUNT(*) 
FROM wallet_transactions 
GROUP BY booking_id 
HAVING COUNT(*) > 1;

-- Delete duplicates (keep the oldest)
DELETE FROM wallet_transactions
WHERE id NOT IN (
  SELECT MIN(id)
  FROM wallet_transactions
  GROUP BY booking_id
);

-- Recalculate wallet balance
UPDATE vendor_wallets vw
SET 
  total_earnings = (
    SELECT COALESCE(SUM(amount), 0)
    FROM wallet_transactions
    WHERE vendor_id = vw.vendor_id
      AND transaction_type = 'earning'
      AND status = 'completed'
  ),
  available_balance = total_earnings - withdrawn_amount;
```

---

### Issue 3: Wrong Vendor ID
**Cause**: Transaction created for wrong vendor

**Fix**:
```sql
-- Check vendor ID mismatch
SELECT 
  b.id,
  b.vendor_id as booking_vendor,
  wt.vendor_id as transaction_vendor
FROM bookings b
JOIN wallet_transactions wt ON wt.booking_id = b.id
WHERE b.vendor_id != wt.vendor_id;

-- Fix vendor ID if mismatch found
UPDATE wallet_transactions
SET vendor_id = 'CORRECT_VENDOR_ID'
WHERE booking_id = 'BOOKING_ID';
```

---

## Testing the Mapping

### End-to-End Test

1. **Create booking**
2. **Make payment** → Receipt created
3. **Couple marks complete**
4. **Vendor marks complete** → **Transaction created!**
5. **Run QUERY 5** → Should show ✅ TRANSACTION EXISTS

### Quick Test SQL
```sql
-- After marking booking as complete, run this immediately
SELECT 
  b.id,
  b.fully_completed,
  wt.transaction_id,
  wt.amount,
  CASE 
    WHEN wt.id IS NOT NULL THEN '✅ SUCCESS'
    ELSE '❌ FAILED'
  END as result
FROM bookings b
LEFT JOIN wallet_transactions wt ON wt.booking_id = b.id
WHERE b.id = 'YOUR_BOOKING_ID';
```

---

## Quick Reference Commands

```powershell
# Run full diagnostic
.\check-wallet-simple.ps1

# Check completion mapping specifically
# Copy QUERY 5 from output and run in Neon SQL Console
```

---

**Last Updated**: October 30, 2025  
**Related Docs**:
- `PAYMENT_TRANSFER_SYSTEM.md` - Full payment flow
- `WALLET_TRANSACTION_MISSING_TROUBLESHOOT.md` - Manual fix guide
