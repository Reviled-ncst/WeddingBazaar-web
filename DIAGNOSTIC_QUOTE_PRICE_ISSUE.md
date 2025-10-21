# DIAGNOSTIC: Check Quote Price Update Issue

## Current Symptoms

Looking at your screenshot:
- **Left Card**: "Quote Received" status → ₱45,000
- **Right Card**: "Confirmed" status → ₱45,000

## Question: What was the expected behavior?

Please clarify:

1. **Did the vendor just send a NEW quote?**
   - If yes, what was the OLD price before?
   - What was the NEW price in the quote?

2. **Are you saying the price SHOULD change but didn't?**
   - What price are you expecting to see?
   - What price is currently showing?

## Let's Trace the Flow

### Step 1: Check if Database Migration Was Run

**Action Required**: Run this in **Neon SQL Editor**:

```sql
-- Check if quoted_price column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('quoted_price', 'quoted_deposit', 'quote_itemization', 'quote_sent_date');
```

**Expected Output** (if migration done):
```
column_name         | data_type
--------------------|----------
quoted_price        | numeric
quoted_deposit      | numeric
quote_itemization   | jsonb
quote_sent_date     | timestamp
```

**If Output is EMPTY**: The migration was NOT run! This will cause the new endpoint to fail.

### Step 2: Check Actual Booking Data

Run this in **Neon SQL Editor**:

```sql
-- Get actual booking data
SELECT 
  id,
  couple_name,
  vendor_id,
  service_type,
  status,
  amount,
  quoted_price,
  quoted_deposit,
  notes,
  created_at,
  updated_at
FROM bookings
WHERE couple_id = '1-2025-001'  -- Replace with your actual couple_id
ORDER BY created_at DESC
LIMIT 5;
```

**Look for**:
- Does `quoted_price` column exist? (If not, migration needed!)
- Is `quoted_price` set to a value or is it NULL?
- What is the `amount` field set to?

### Step 3: Test Quote Sending (Manual)

If database migration is done, test the endpoint directly:

```bash
# In PowerShell (use actual booking ID from your bookings)
$body = @{
    quotedPrice = 50000
    quotedDeposit = 15000
    vendorNotes = "Test quote from diagnostic"
    validityDays = 30
} | ConvertTo-Json

Invoke-WebRequest `
  -Uri "https://weddingbazaar-web.onrender.com/api/bookings/YOUR_BOOKING_ID/send-quote" `
  -Method PUT `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Quote sent successfully. Deposit: ₱15,000, Total: ₱50,000",
  "booking": {
    "id": "...",
    "quoted_price": 50000,
    "quoted_deposit": 15000,
    ...
  }
}
```

**If you get ERROR**:
```json
{
  "error": "column \"quoted_price\" does not exist"
}
```
→ **Database migration NOT run!**

## Most Likely Issue: Database Migration Not Run

Based on the 404 error from the booking endpoint, the most likely issue is:

**❌ The database migration was NOT run in Neon**

This means:
1. The `quoted_price` column doesn't exist in the bookings table
2. When vendor sends quote, the NEW `/send-quote` endpoint tries to set `quoted_price`
3. Database returns error because column doesn't exist
4. Quote might fall back to old method OR fail silently

## SOLUTION: Run Database Migration NOW

### Go to Neon Console:
1. Open: https://console.neon.tech
2. Select your database: `weddingbazaar`
3. Click **SQL Editor**
4. Copy-paste this ENTIRE SQL block:

```sql
-- ============================================
-- CRITICAL: Quote System Database Migration
-- ============================================

-- Step 1: Add quote fields to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quoted_price NUMERIC(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quoted_deposit NUMERIC(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_itemization JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_sent_date TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_valid_until TIMESTAMP;

-- Step 2: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_quote_sent_date 
ON bookings(quote_sent_date) WHERE quote_sent_date IS NOT NULL;

-- Step 3: Verify columns were added
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('quoted_price', 'quoted_deposit', 'quote_itemization', 'quote_sent_date', 'quote_valid_until')
ORDER BY column_name;
```

5. Click **Run** button
6. **Verify output** shows all 5 columns:
   ```
   column_name        | data_type | is_nullable
   -------------------|-----------|------------
   quote_itemization  | jsonb     | YES
   quote_sent_date    | timestamp | YES
   quote_valid_until  | timestamp | YES
   quoted_deposit     | numeric   | YES
   quoted_price       | numeric   | YES
   ```

### After Migration:

**Test the flow**:
1. Login as vendor
2. Send a new quote with a different price
3. Check browser Network tab → should see `PUT /send-quote` succeed
4. Login as couple
5. Refresh bookings page
6. Price should update to new quoted amount

## Debugging Checklist

Run through these checks:

```sql
-- Check 1: Do columns exist?
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name LIKE 'quote%';

-- Check 2: What's in the bookings table?
SELECT id, couple_name, amount, quoted_price, status 
FROM bookings 
ORDER BY updated_at DESC LIMIT 5;

-- Check 3: Are any quotes actually set?
SELECT COUNT(*) as quotes_sent 
FROM bookings 
WHERE quoted_price IS NOT NULL;
```

## Browser Console Check

Open browser DevTools (F12) → Console tab, look for:

### When Vendor Sends Quote:
```
📤 [SendQuoteModal] Sending quote with proper fields: {
  quotedPrice: 45000,
  quotedDeposit: 13500,
  ...
}

✅ [SendQuoteModal] Quote sent successfully
```

**OR if ERROR**:
```
❌ [SendQuoteModal] Failed to send quote: column "quoted_price" does not exist
```

### When Couple Views Bookings:
```
💰 [AMOUNT PRIORITY] Checking fields: {
  quoted_price: 45000,  ← Should show the new price!
  final_price: null,
  amount: 45000,
  selected: 45000
}
```

**If `quoted_price: null`** → Quote wasn't saved properly!

## Summary

The fix is deployed, but requires:

✅ Frontend Code: FIXED (deployed)
✅ Backend Endpoint: EXISTS (/send-quote)
❌ Database Schema: **NEEDS MIGRATION** ← THIS IS THE ISSUE!

**Next Step**: Run the SQL migration in Neon console (see above)

---

**Once migration is done**, the flow will be:

1. Vendor sends quote → Backend sets `quoted_price = 45000`
2. Database stores the value ✅
3. Couple refreshes → Frontend reads `quoted_price = 45000`
4. Booking card shows ₱45,000 ✅

**Without migration**, the flow breaks at step 2:

1. Vendor sends quote → Backend tries to set `quoted_price = 45000`
2. Database returns ERROR (column doesn't exist) ❌
3. Couple refreshes → Frontend reads `quoted_price = NULL`
4. Booking card shows fallback price (may be old amount) ❌
