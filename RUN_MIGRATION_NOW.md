# 🚀 DATABASE MIGRATION - Payment Tracking Columns

## ⚠️ CRITICAL: RUN THIS MIGRATION NOW

The backend deployment is **LIVE** but failing with:
```
❌ column "payment_amount" of relation "bookings" does not exist
```

This migration adds 8 required payment tracking columns to the `bookings` table.

---

## 🎯 Option 1: Run Migration on Render (RECOMMENDED)

### Step 1: Access Render Shell
1. Go to https://dashboard.render.com
2. Select your `weddingbazaar-web` service
3. Click **"Shell"** tab (top right)

### Step 2: Run Migration Script
```bash
# Navigate to backend directory
cd backend-deploy

# Run the migration
node migrate-payment-columns.cjs
```

### Step 3: Verify Success
You should see:
```
🔧 Adding payment tracking columns to bookings table...

1️⃣ Adding total_paid column...
✅ total_paid column added

2️⃣ Adding payment_amount column...
✅ payment_amount column added

... (8 columns total)

✅ Migration completed successfully!
```

---

## 🎯 Option 2: Run Locally (Alternative)

### Prerequisites
- You need the **actual DATABASE_URL** from Render environment variables

### Steps:
1. Go to Render Dashboard → Environment → Copy `DATABASE_URL`
2. Create `backend-deploy/.env`:
```env
DATABASE_URL=postgresql://neondb_owner:...your-actual-url...
```
3. Run migration locally:
```powershell
cd backend-deploy
node migrate-payment-columns.cjs
```

---

## 📊 What This Migration Adds

### New Columns in `bookings` table:
| Column | Type | Description |
|--------|------|-------------|
| `total_paid` | DECIMAL(10,2) | Running total of all payments |
| `payment_amount` | DECIMAL(10,2) | Amount of current/last payment |
| `payment_type` | VARCHAR(50) | 'deposit', 'balance', or 'full' |
| `payment_status` | VARCHAR(50) | 'pending', 'deposit_paid', 'paid_in_full' |
| `payment_date` | TIMESTAMP | When payment was made |
| `payment_method` | VARCHAR(50) | 'card', 'gcash', 'paymaya', etc. |
| `payment_intent_id` | VARCHAR(255) | PayMongo payment intent ID |
| `receipt_number` | VARCHAR(50) | Generated receipt number |

---

## ✅ After Migration

### 1. Restart Backend Service
- Render may auto-restart
- Or manually restart from dashboard

### 2. Test Payment Flow
1. Go to https://weddingbazaar-web.web.app
2. Login as individual user
3. View bookings → Click "Pay Deposit"
4. Complete payment
5. Verify booking status updates
6. Check "View Receipt" button appears

### 3. Expected Behavior After Migration
✅ Payments save to database  
✅ Booking status updates  
✅ Receipts are created  
✅ Payment history displays  
✅ No more 500 errors on `/api/bookings/:id/status`  

---

## 🐛 Troubleshooting

### If migration fails:
```bash
# Check if columns already exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name LIKE 'payment%';
```

### If you see "column already exists":
- Migration is safe to re-run (uses IF NOT EXISTS)
- Columns may have been partially added

### Still getting errors?
Check Render logs:
```bash
# In Render Shell
tail -f /var/log/render.log
```

---

## 📝 Migration File Location
- **Render**: `backend-deploy/migrate-payment-columns.cjs`
- **Local**: `c:\Games\WeddingBazaar-web\backend-deploy\migrate-payment-columns.cjs`

---

## 🚨 URGENT ACTION REQUIRED

**This migration MUST run before payments will work in production!**

Current status:
- ✅ Frontend deployed and working
- ✅ Backend deployed and working
- ❌ Database missing payment columns
- ⚠️ All payment actions failing with 500 errors

**Run the migration now to restore full payment functionality!**
