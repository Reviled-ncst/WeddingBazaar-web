# ⚡ QUICK FIX - Run This Now!

## The Problem
Payment system is failing with:
```
❌ column "payment_amount" of relation "bookings" does not exist
```

## The Solution (2 minutes)

### Step 1: Open Render Shell
1. Go to: https://dashboard.render.com/web/srv-cvb06j3qf0us73bvf5k0
2. Click **"Shell"** tab (top right corner)

### Step 2: Run Migration
Copy and paste this into the shell:
```bash
cd backend-deploy && node migrate-payment-columns.cjs
```

### Step 3: Verify Success
You should see:
```
✅ total_paid column added
✅ payment_amount column added
✅ payment_type column added
✅ payment_status column added
✅ payment_date column added
✅ payment_method column added
✅ payment_intent_id column added
✅ receipt_number column added

✅ Migration completed successfully!
```

## Test Payment
1. Go to: https://weddingbazaar-web.web.app
2. Login → Bookings → Pay Deposit
3. Use test card: `4343434343434345`
4. Should work now! ✅

---

**That's it!** Migration adds 8 missing payment columns to fix the database.

For detailed info, see: `RUN_MIGRATION_NOW.md` or `PAYMENT_COLUMNS_MIGRATION_STATUS.md`
