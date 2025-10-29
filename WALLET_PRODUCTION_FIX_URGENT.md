# 🚀 URGENT: Wallet System Production Deployment

## Current Status

### ✅ Complete
- Backend code deployed to Render
- Frontend deployed to Firebase
- Wallet tables created in **LOCAL** database
- 2 completed bookings migrated locally (₱72,804.48 total)

### ⚠️ Pending
- **Wallet tables NOT created in PRODUCTION database yet**
- This is why you're getting **500 Internal Server Error**

## Quick Fix (5 minutes)

### Option 1: SQL Console (FASTEST - RECOMMENDED)

1. **Go to Neon Console**: https://console.neon.tech
2. **Select your project**: Wedding Bazaar DB
3. **Open SQL Editor**
4. **Copy and paste** the entire contents of `create-wallet-tables.sql`
5. **Click "Run"**
6. **Verify success**: Should see "Wallet tables created successfully! ✅"

### Option 2: Run Script Locally with Production URL

```bash
# In .env file, temporarily set production DATABASE_URL
DATABASE_URL=postgresql://neondb_owner:xxxxx@ep-xxx.neon.tech/neondb

# Run the script
node create-wallet-tables.cjs

# Change .env back to local URL after
```

### Option 3: Add Auto-Migration to Backend

Edit `backend-deploy/production-backend.js`:

```javascript
// Add at the top
const { neon } = require('@neondatabase/serverless');

// Add before starting server
async function ensureWalletTables() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Check if tables exist
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name IN ('vendor_wallets', 'wallet_transactions')
    `;
    
    if (tables.length < 2) {
      console.log('📊 Creating wallet tables...');
      // Run create-wallet-tables.cjs
      require('./create-wallet-tables.cjs');
    } else {
      console.log('✅ Wallet tables exist');
    }
  } catch (error) {
    console.error('⚠️  Wallet tables check failed:', error.message);
  }
}

// Before server.listen()
ensureWalletTables().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

## What Happens After Tables Are Created

1. **Wallet API starts working immediately**
2. **Vendor can see Finances page**
3. **Completed bookings auto-create wallet deposits**
4. **Transaction history displays**

## Test After Fix

1. **Login as vendor**: https://weddingbazaarph.web.app/vendor
2. **Go to Finances tab**
3. **Should see**:
   - Wallet summary (may be ₱0 if no completed bookings migrated yet)
   - Transaction history (empty or with migrated transactions)
   - No 500 errors

## If You Get Errors After Creating Tables

### Error: "relation does not exist"
- Tables not created yet - run the SQL script

### Error: "permission denied"
- Check DATABASE_URL user has CREATE TABLE permissions

### Error: "syntax error"
- Copy the ENTIRE SQL script, not just parts

## Automatic Transaction Creation

Once tables exist, future completed bookings will automatically:

1. **Customer pays** → Receipt created
2. **Both parties mark complete** → Booking status = 'completed'
3. **Backend trigger** → Wallet transaction created automatically
4. **Vendor wallet** → Balance updated
5. **Vendor sees** → Money in Finances tab

## Current Files

📄 **create-wallet-tables.sql** - Copy this into Neon SQL Console (RECOMMENDED)
📄 **create-wallet-tables.cjs** - Run locally with prod DATABASE_URL
📄 **verify-wallet-tables.cjs** - Check if tables exist

## Next Steps After Tables Are Created

1. ✅ Test wallet API endpoints
2. ✅ Verify vendor can see Finances
3. ✅ Complete a test booking and check if transaction appears
4. ✅ Test withdrawal request flow
5. ✅ Export transactions to CSV

---

## Why This Happened

The wallet system code was deployed to Render, but the **database migration** (creating tables) only ran on your local database. Production database needs the same tables.

This is a one-time setup - once tables are created, they'll persist forever.

---

**Estimated Time to Fix**: 5 minutes using Neon SQL Console  
**Priority**: HIGH - Blocks wallet feature completely  
**Impact**: Vendor cannot access Finances page until fixed
