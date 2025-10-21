# 🚀 MANUAL RENDER DEPLOYMENT - Receipt Fix

## 📋 File to Update on Render

**File**: `backend-deploy/routes/bookings.cjs`

## 🔧 Changes Made

### 1. Add Import at Line 3:
```javascript
const express = require('express');
const { sql } = require('../config/database.cjs');
const { createDepositReceipt, createBalanceReceipt, createFullPaymentReceipt } = require('../helpers/receiptGenerator.cjs');

const router = express.Router();
```

### 2. Replace the `PUT /:bookingId/process-payment` endpoint (around line 1200)

Find this section and replace the entire payment processing logic with the version that includes receipt generation.

## 🎯 Manual Deployment Steps

### Option 1: Trigger Render Redeploy
1. Go to https://dashboard.render.com
2. Find your service: `weddingbazaar-web`
3. Click "Manual Deploy" → "Deploy latest commit"
4. Render will pull from GitHub and rebuild

### Option 2: Direct File Edit (If Render allows)
1. Access Render shell/console
2. Navigate to `backend-deploy/routes/`
3. Edit `bookings.cjs` directly
4. Restart the service

### Option 3: Local Deployment Script
```powershell
# Create a deployment branch without history
git checkout --orphan deploy
git add -A
git commit -m "Receipt generation fix - clean history"
git push -f origin deploy:main
```

## ✅ Verification After Deployment

### 1. Check Logs:
```
Look for: "✅ [ProcessPayment] Deposit receipt created: WB-2025-XXXXXX"
```

### 2. Test Payment Flow:
1. Make a test payment
2. Check booking notes for receipt number
3. Query database:
```sql
SELECT * FROM receipts ORDER BY created_at DESC LIMIT 1;
```

### 3. Test View Receipt:
1. Login to https://weddingbazaarph.web.app
2. Go to Bookings
3. Click "View Receipt"
4. Should display receipt details

## 📊 Expected Console Output

### Before Fix:
```
💳 [ProcessPayment] Processing payment for booking: 1760962499
💳 [ProcessPayment] Payment processed: 1760962499 -> deposit_paid (₱13,500)
```

### After Fix:
```
💳 [ProcessPayment] Processing payment for booking: 1760962499
✅ [ProcessPayment] Deposit receipt created: WB-2025-862614
💳 [ProcessPayment] Payment processed: 1760962499 -> deposit_paid (₱13,500)
```

## 🔍 Testing Checklist

- [ ] Render deployment successful
- [ ] Backend service running
- [ ] Make test payment
- [ ] Receipt created in database
- [ ] Booking notes include receipt number
- [ ] "View Receipt" button works
- [ ] Receipt displays correctly
- [ ] Receipt can be downloaded

---

**Current Commit**: `2f2e0ea`  
**Branch**: `main` (local)  
**Status**: Ready for deployment ✅
