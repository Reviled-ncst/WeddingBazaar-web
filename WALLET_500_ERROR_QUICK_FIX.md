# 🚨 WALLET 500 ERROR - QUICK FIX GUIDE

## Current Status
- ✅ Backend code deployed to Render
- ✅ Frontend deployed to Firebase
- ✅ Wallet routes working (no more Express errors)
- ❌ **Database tables missing in production**

## The Problem
```
GET /api/wallet/2-2025-001/transactions → 500 Internal Server Error
```

**Root Cause**: The `vendor_wallets` and `wallet_transactions` tables don't exist in the **production database** on Neon.

## The Solution (2 Minutes)

### Option 1: Run SQL in Neon Console (FASTEST) ⚡

1. **Go to Neon SQL Console**
   - URL: https://console.neon.tech/
   - Login to your account
   - Select your Wedding Bazaar project
   - Click "SQL Editor" in the left sidebar

2. **Copy & Paste the SQL**
   - Open the file: `EXECUTE_THIS_IN_NEON_SQL_CONSOLE.sql`
   - Copy ALL the SQL (entire file)
   - Paste into Neon SQL Editor
   - Click "Run" button

3. **Verify Success**
   - You should see output showing:
     - Vendor Wallets Created: 2
     - Transactions Created: 2
     - Total Earnings: ₱72,804.48

4. **Test the Wallet**
   - Refresh your browser at: https://weddingbazaarph.web.app/vendor/finances
   - Wallet should now load successfully ✅

### Option 2: Run Script Locally (SLOWER) 🐢

```powershell
# Set your production database URL
$env:DATABASE_URL = "your-production-database-url"

# Run the migration script
node create-wallet-tables.cjs
```

## What the SQL Does

1. **Creates Tables**
   - `vendor_wallets` - Stores vendor wallet balances
   - `wallet_transactions` - Stores all transaction history

2. **Migrates Existing Data**
   - Finds all completed bookings
   - Creates wallet entries for vendors
   - Creates transaction records for each completed booking
   - Calculates and updates wallet balances

3. **Creates Indexes**
   - Optimizes query performance
   - Speeds up wallet API responses

## Expected Results

After running the SQL, you should have:

### Vendor Wallets
```
2-2025-001 | ₱44,802.24 available
2-2025-002 | ₱28,002.24 available
```

### Transactions
```
TXN-[booking-id] | earning | ₱44,802.24 | completed
TXN-[booking-id] | earning | ₱28,002.24 | completed
```

## Verify It's Working

### Test 1: API Endpoint
```bash
# In browser console or Postman
fetch('https://weddingbazaar-web.onrender.com/api/wallet/2-2025-001', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
```

**Expected**: 200 OK with wallet data

### Test 2: Frontend UI
1. Login as vendor: https://weddingbazaarph.web.app/vendor
2. Click "Finances" tab
3. Should see:
   - ✅ Total earnings displayed
   - ✅ Available balance shown
   - ✅ Transaction history populated
   - ✅ No 500 errors in console

## Timeline
- **SQL Execution**: 10-30 seconds
- **Backend Recognition**: Immediate (no deploy needed)
- **Frontend Update**: Immediate (just refresh browser)

## Next Steps After Fix

Once tables are created and wallet loads:

1. **Test Transaction History**
   - Click different filters (All, Earnings, Withdrawals)
   - Verify dates and amounts are correct

2. **Test CSV Export**
   - Click "Export CSV" button
   - Verify CSV downloads with correct data

3. **Test Withdrawal Form** (UI only for now)
   - Click "Request Withdrawal" button
   - Fill out form
   - Verify form validation works

## Files Reference

- **SQL Script**: `EXECUTE_THIS_IN_NEON_SQL_CONSOLE.sql`
- **Node Script**: `create-wallet-tables.cjs`
- **Backend Route**: `backend-deploy/routes/wallet.cjs`
- **Frontend Component**: `src/pages/users/vendor/finances/VendorFinances.tsx`
- **API Service**: `src/shared/services/walletService.ts`

## Support

If you get errors:
1. Check the SQL error message in Neon console
2. Verify database connection string is correct
3. Check if tables already exist (`SELECT * FROM vendor_wallets LIMIT 1;`)
4. Verify bookings table has data (`SELECT * FROM bookings WHERE status = 'completed';`)

---

**Status**: 🔴 Wallet tables need to be created in production database  
**Fix Time**: 2 minutes  
**Confidence**: High - SQL script tested locally and working  
**Next Action**: Run SQL in Neon Console NOW
