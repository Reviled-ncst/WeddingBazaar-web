# 🔍 Quick Wallet Transaction Check - Step by Step

## What You Need
- Access to Neon SQL Console: https://console.neon.tech
- Your Wedding Bazaar database selected
- The `CHECK_WALLET_TRANSACTION.sql` file (in this folder)

## Quick Steps

### 1️⃣ Open Neon SQL Console
1. Go to https://console.neon.tech
2. Select your Wedding Bazaar database
3. Open the SQL Editor

### 2️⃣ Find Your Completed Booking
Copy and paste this query:

```sql
SELECT 
  id,
  vendor_id,
  couple_name,
  service_type,
  status,
  amount,
  fully_completed_at
FROM bookings
WHERE status = 'completed'
ORDER BY fully_completed_at DESC
LIMIT 5;
```

**Expected Result**: You should see your recently completed booking(s).

**Copy the `id` value** - this is your booking ID (looks like a UUID: `abc123-def456-...`)

---

### 3️⃣ Check If Wallet Transaction Exists
Replace `YOUR_BOOKING_ID` with the ID from step 2:

```sql
SELECT 
  b.id as booking_id,
  b.couple_name,
  b.amount as booking_amount,
  b.fully_completed_at,
  wt.transaction_id,
  wt.amount as wallet_amount,
  wt.created_at as transaction_created_at,
  CASE 
    WHEN wt.id IS NULL THEN '❌ MISSING'
    ELSE '✅ EXISTS'
  END as wallet_status
FROM bookings b
LEFT JOIN wallet_transactions wt ON wt.booking_id = b.id
WHERE b.id = 'YOUR_BOOKING_ID';
```

**Expected Result**:
- **✅ EXISTS**: Great! The transaction was created successfully
- **❌ MISSING**: The transaction is missing - continue to Step 4

---

### 4️⃣ Check Receipts (If Transaction is Missing)
Replace `YOUR_BOOKING_ID`:

```sql
SELECT 
  id,
  receipt_number,
  payment_type,
  amount,
  payment_method,
  payment_intent_id,
  created_at
FROM receipts
WHERE booking_id = 'YOUR_BOOKING_ID'
ORDER BY created_at;
```

**Expected Result**: You should see at least one receipt record.

**If no receipts**: This is the problem! The wallet transaction can't be created without payment records.

---

### 5️⃣ What's the Problem?

#### Case A: ✅ Transaction Exists
**Good news!** The system is working correctly. The vendor should see this transaction in their wallet.

**To verify vendor can see it**:
1. Log in as the vendor
2. Go to: https://weddingbazaarph.web.app/vendor/wallet
3. You should see the transaction in the history

---

#### Case B: ❌ Transaction Missing + No Receipts
**Problem**: The booking was marked as complete without any payment records.

**Why?** Possible reasons:
- Someone clicked "Mark as Complete" before processing payment
- Payment failed but completion proceeded
- Test booking without payment flow

**Solution**: Either:
1. Process the payment properly (if customer hasn't paid yet)
2. Manually create the transaction (see Step 6 in full SQL file)

---

#### Case C: ❌ Transaction Missing + Receipts Exist
**Problem**: The backend failed to create the transaction despite having payment records.

**Check Backend Logs**:
1. Go to https://dashboard.render.com
2. Click your backend service
3. Go to "Logs" tab
4. Search for your booking ID
5. Look for error messages like:
   - `❌ Error creating wallet transaction`
   - `❌ Failed to update wallet`

**Solution**: Manually create the transaction (see full SQL file)

---

### 6️⃣ Manual Transaction Creation (If Needed)

**⚠️ ONLY USE IF STEP 3 SHOWS "MISSING"**

See `CHECK_WALLET_TRANSACTION.sql` file, Step 5 for the full SQL INSERT statement.

You'll need to replace:
- `YOUR_VENDOR_ID` (from Step 2)
- `YOUR_BOOKING_ID` (from Step 2)
- `TOTAL_PAID_CENTAVOS` (from Step 4, sum of all receipt amounts)
- Other details like couple name, service type, etc.

---

## 🆘 Need Help?

### Option 1: Share Query Results
Run Step 3 (the mapping query) and share the results:
- What does `wallet_status` show?
- What are the amounts shown?
- When was `fully_completed_at`?

### Option 2: Check Backend Logs
1. Go to Render dashboard
2. Copy error messages related to your booking ID
3. Share the errors

### Option 3: Full Diagnostic
Open `CHECK_WALLET_TRANSACTION.sql` and run all queries in order, noting the results of each step.

---

## 📊 Quick Status Check

To quickly see the current state of all completed bookings and their wallet transactions:

```sql
SELECT 
  b.couple_name,
  b.service_type,
  b.fully_completed_at,
  CASE WHEN wt.id IS NULL THEN '❌ MISSING' ELSE '✅ EXISTS' END as wallet_status,
  wt.amount as wallet_amount
FROM bookings b
LEFT JOIN wallet_transactions wt ON wt.booking_id = b.id
WHERE b.status = 'completed'
ORDER BY b.fully_completed_at DESC;
```

This shows all completed bookings and whether they have wallet transactions.

---

## ✅ Success Indicators

You'll know everything is working when:
1. ✅ Step 3 shows `wallet_status = '✅ EXISTS'`
2. ✅ `wallet_amount` matches the amount paid (from receipts)
3. ✅ Vendor can see the transaction at `/vendor/wallet`
4. ✅ Vendor's balance increased correctly

---

## 📝 Report Format

If you need to report an issue, provide:

```
Booking ID: [paste ID here]
Couple Name: [paste name]
Service Type: [paste type]
Booking Amount: [paste amount]
Fully Completed At: [paste timestamp]
Wallet Status: [❌ MISSING or ✅ EXISTS]
Receipts Count: [paste count]
Total Paid: [paste total from receipts]
Backend Logs: [paste any error messages]
```

This format helps diagnose the issue quickly.
