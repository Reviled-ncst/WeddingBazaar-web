# 🔍 Wallet API 500 Error - Root Cause Diagnosis

## Issue Summary
The wallet API is returning **500 Internal Server Error** when accessed from the frontend.

## Most Likely Root Cause: NO WALLET DATA EXISTS YET

### Why the 500 Error?
The wallet system was designed to automatically create earnings when bookings are **fully completed** (both vendor and couple confirm completion). However:

1. ✅ **Tables exist** in database (`vendor_wallets`, `wallet_transactions`)
2. ❌ **No completed bookings yet** for vendor `2-2025-001`
3. ❌ **Wallet may not be initialized** (no row in `vendor_wallets` table)
4. ❌ **Query might be failing** due to missing data or null handling

## Immediate Diagnostic Steps

### Step 1: Check Wallet Data in Neon
Run this SQL in **Neon SQL Console**:

```sql
-- Check if vendor exists
SELECT id, business_name FROM vendors WHERE id = '2-2025-001';

-- Check if wallet exists
SELECT * FROM vendor_wallets WHERE vendor_id = '2-2025-001';

-- Check transactions
SELECT COUNT(*) FROM wallet_transactions WHERE vendor_id = '2-2025-001';

-- Check completed bookings
SELECT 
  id, 
  booking_reference, 
  status, 
  fully_completed,
  couple_completed,
  vendor_completed,
  amount
FROM bookings 
WHERE vendor_id = '2-2025-001' 
  AND fully_completed = true;
```

### Step 2: Check Render Backend Logs
1. Go to https://dashboard.render.com
2. Click on `weddingbazaar-web` service
3. Go to **Logs** tab
4. Filter for "wallet" or "error"
5. Look for the actual SQL error when wallet API is called

### Step 3: Test Wallet Initialization
The wallet route **should auto-create** a wallet if it doesn't exist:

```javascript
// From wallet.cjs line 24-36
if (wallets.length === 0) {
  await sql`
    INSERT INTO vendor_wallets (vendor_id)
    VALUES (${vendorId})
  `;
}
```

**Test**: The 500 error might be here. Check if:
- Insert is failing due to database permissions
- Vendor ID doesn't exist in `vendors` table (foreign key constraint)
- SQL syntax error

## Quick Fix Options

### Option 1: Manually Create Wallet Entry
Run this in Neon SQL Console:

```sql
-- Create wallet for vendor if it doesn't exist
INSERT INTO vendor_wallets (vendor_id)
VALUES ('2-2025-001')
ON CONFLICT (vendor_id) DO NOTHING;
```

Then refresh the frontend and see if the 500 error is gone.

### Option 2: Add Test Transaction
Create a sample earning to test the system:

```sql
-- Insert test earning
INSERT INTO wallet_transactions (
  vendor_id,
  booking_id,
  transaction_type,
  amount,
  service_category,
  status,
  payment_method
) VALUES (
  '2-2025-001',
  'TEST-BOOKING-001',
  'earning',
  50000, -- ₱500.00
  'Photography',
  'completed',
  'card'
);

-- Update wallet balance
UPDATE vendor_wallets
SET 
  total_earnings = total_earnings + 50000,
  available_balance = available_balance + 50000,
  last_transaction_at = NOW()
WHERE vendor_id = '2-2025-001';
```

### Option 3: Complete a Real Booking
1. Go to `/individual/bookings`
2. Find a fully paid booking
3. Click **"Mark as Complete"**
4. This should trigger automatic wallet earning creation

## Expected Wallet Behavior

### When Booking is Fully Completed:
1. Backend detects both `couple_completed = true` AND `vendor_completed = true`
2. Creates wallet transaction:
   ```javascript
   INSERT INTO wallet_transactions (
     vendor_id,
     booking_id,
     transaction_type: 'earning',
     amount: booking.amount * 0.95, // 95% after platform fee
     service_category: booking.service_type,
     status: 'completed'
   )
   ```
3. Updates wallet balance:
   ```javascript
   UPDATE vendor_wallets
   SET total_earnings = total_earnings + amount
   WHERE vendor_id = ...
   ```

### Wallet Creation Trigger:
- **Automatic**: When vendor first accesses `/vendor/finances`
- **Fallback**: When first earning is created

## Check Render Logs for These Errors

### Possible SQL Errors:
1. **"relation vendor_wallets does not exist"**
   - Fix: Run migration again in Neon
   
2. **"column 'created_at' does not exist"**
   - Fix: Check column names match schema
   
3. **"foreign key violation"**
   - Fix: Vendor ID doesn't exist in vendors table
   
4. **"duplicate key value violates unique constraint"**
   - Fix: Wallet already exists, SELECT is failing

### Possible Node.js Errors:
1. **"Cannot read property of undefined"**
   - Fix: Add null checks for wallet data
   
2. **"Invalid date format"**
   - Fix: Check timestamp formatting in queries

## Next Steps

### 1. Check Render Logs (URGENT)
Go to Render dashboard and copy the exact error message from logs.

### 2. Run SQL Diagnostics
Execute `CHECK_WALLET_DATA.sql` in Neon SQL Console.

### 3. Manual Wallet Creation
Run Option 1 SQL to create wallet entry.

### 4. Test Again
Refresh frontend and check if 500 error is resolved.

### 5. Report Findings
Copy Render error logs and SQL results to diagnose the exact issue.

## Files to Check

### Backend Code:
- `backend-deploy/routes/wallet.cjs` (line 18-40 for wallet initialization)
- `backend-deploy/production-backend.js` (check if route is registered)

### Database Schema:
- `EXECUTE_THIS_IN_NEON_SQL_CONSOLE.sql` (wallet tables definition)
- `CHECK_WALLET_DATA.sql` (diagnostic queries)

### Frontend Service:
- `src/shared/services/walletService.ts` (API call code)
- `src/pages/users/vendor/finances/VendorFinances.tsx` (UI component)

## Success Criteria

✅ **Wallet API returns 200** with wallet data:
```json
{
  "wallet": {
    "vendor_id": "2-2025-001",
    "total_earnings": 0,
    "available_balance": 0,
    "pending_balance": 0,
    "withdrawn_balance": 0
  },
  "vendor": { ... },
  "stats": {
    "currentMonthEarnings": 0,
    "earningsGrowth": 0,
    ...
  }
}
```

✅ **Transactions endpoint returns 200**:
```json
{
  "transactions": [],
  "pagination": { ... }
}
```

## Immediate Action Required

**YOU NEED TO**:
1. Open Render dashboard and copy the exact error from logs
2. Run `CHECK_WALLET_DATA.sql` in Neon SQL Console
3. Report back the exact SQL error or missing data

**Without the exact error message from Render logs, we're guessing.**
