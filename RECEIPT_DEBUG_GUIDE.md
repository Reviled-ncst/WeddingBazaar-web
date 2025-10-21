# 🧾 Receipt Generation Debug Guide

## 🚨 CRITICAL FIXES DEPLOYED

**Date**: October 21, 2025
**Status**: Backend + Frontend deployed with enhanced logging

---

## 🔧 WHAT WAS FIXED

### Issue: Receipts Not Being Created in Database
**Root Causes Found**:
1. ❌ Backend was rejecting payments if `depositAmount === 0`
2. ❌ Bookings table uses `amount` field, not `total_amount`
3. ❌ Receipt creation errors were not being logged properly

### Fixes Applied:

#### Fix 1: Frontend Enhanced Error Logging
**File**: `src/shared/services/payment/paymongoService.ts`
```typescript
// Now shows detailed error if receipt creation fails
if (!receiptResponse.ok) {
  console.error('❌ [STEP 4] Receipt creation failed!');
  console.error('❌ [STEP 4] Status:', receiptResponse.status);
  console.error('❌ [STEP 4] Error data:', errorData);
}
```

#### Fix 2: Backend Removed Strict Validation
**File**: `backend-deploy/routes/payments.cjs`
```javascript
// BEFORE: Would reject if depositAmount === 0
if (depositAmount === 0) {
  return res.status(400).json({
    error: 'No deposit amount configured'
  });
}

// AFTER: Accepts any deposit amount
console.log(`💳 Creating deposit receipt for ₱${amount / 100}`);
receipt = await createDepositReceipt(...);
```

#### Fix 3: Backend Enhanced Debugging
**File**: `backend-deploy/routes/payments.cjs`
```javascript
// Now logs raw booking data to debug amount fields
console.log(`💳 [PROCESS-PAYMENT] Raw booking data:`, {
  id: booking.id,
  total_amount: booking.total_amount,
  deposit_amount: booking.deposit_amount,
  amount: booking.amount,  // <-- This is what bookings table uses
  couple_id: booking.couple_id,
  vendor_id: booking.vendor_id
});

// Fallback to 'amount' field if 'total_amount' is null
const totalAmount = parseInt(booking.total_amount) || parseInt(booking.amount) || 0;
const depositAmount = parseInt(booking.deposit_amount) || Math.floor(totalAmount * 0.3) || 0;
```

---

## 🧪 NEW TESTING PROCEDURE

### Step 1: Open Console (CRITICAL!)
Press **F12** before starting payment to see all logs

### Step 2: Initiate Payment
1. Go to https://weddingbazaarph.web.app/individual/bookings
2. Click "Pay Deposit" on any booking
3. Enter test card: **4343 4343 4343 4343**
4. Submit payment

### Step 3: Watch for NEW Console Logs

#### ✅ SUCCESS LOGS (What You Should See):
```
💳 [STEP 1] Creating PayMongo payment intent...
✅ [STEP 1] Payment intent created: pi_xxxxx

💳 [STEP 2] Creating PayMongo payment method...
✅ [STEP 2] Payment method created: pm_xxxxx

💳 [STEP 3] Attaching payment method to intent...
✅ [STEP 3] Payment processed, status: succeeded

💳 [STEP 4] Creating receipt in backend...
💳 [STEP 4] Mapping paymentType: "downpayment" -> "deposit"

✅ [STEP 4] Receipt response received: { success: true, data: {...} }
✅ [CARD PAYMENT - REAL] Payment completed successfully!
🧾 [CARD PAYMENT - REAL] Receipt created: RCP-1760270942042-544943
```

#### ❌ ERROR LOGS (What To Report If You See):
```
❌ [STEP 4] Receipt creation failed!
❌ [STEP 4] Status: 400 (or 500)
❌ [STEP 4] Error data: { ... }
⚠️ [STEP 4] Payment succeeded but receipt failed - continuing anyway
```

---

## 🔍 BACKEND LOGS TO CHECK

After payment, check **Render Dashboard** → **Logs** for:

### ✅ SUCCESS LOGS:
```
💳 [PROCESS-PAYMENT] Processing payment...
💳 [PROCESS-PAYMENT] Request body: {
  "bookingId": "1760962499",
  "paymentType": "deposit",
  "paymentMethod": "card",
  "amount": 1350000
}
💳 [PROCESS-PAYMENT] Raw booking data: {
  "id": "1760962499",
  "amount": 4500000,
  "couple_id": "1-2025-001",
  "vendor_id": "2-2025-001"
}
💳 [PROCESS-PAYMENT] Booking found: 1760962499
💳 [PROCESS-PAYMENT] Total: ₱45,000 | Deposit: ₱13,500
💳 [PROCESS-PAYMENT] Creating deposit receipt for ₱13,500
✅ [PROCESS-PAYMENT] Deposit receipt created: RCP-1760270942-544943
✅ [PROCESS-PAYMENT] Payment processed successfully
```

### ❌ ERROR LOGS (Report If You See):
```
❌ [PROCESS-PAYMENT] Booking not found
❌ [PROCESS-PAYMENT] Invalid payment type
❌ Receipt creation failed: [error details]
```

---

## 🗄️ DATABASE VERIFICATION

### After Payment, Run This Command:
```powershell
node -e "const {sql} = require('./backend-deploy/config/database.cjs'); sql\`SELECT * FROM receipts ORDER BY created_at DESC LIMIT 1\`.then(r => { console.log('Latest Receipt:'); console.table(r); }).then(() => process.exit(0))"
```

### Expected Output:
```
Latest Receipt:
┌─────────┬──────────────────────┬──────────┬─────────────┬────────────┬────────────┐
│ (index) │   receipt_number     │ amount   │ booking_id  │ couple_id  │ vendor_id  │
├─────────┼──────────────────────┼──────────┼─────────────┼────────────┼────────────┤
│    0    │ 'RCP-1760271234-...' │ 1350000  │ '1760962499'│ '1-2025-...'│ '2-2025-...'│
└─────────┴──────────────────────┴──────────┴─────────────┴────────────┴────────────┘
```

---

## 🎯 TROUBLESHOOTING SCENARIOS

### Scenario 1: "Receipt creation failed: Booking not found"
**Cause**: Booking ID doesn't exist or wrong format
**Solution**: 
- Check booking ID in console logs
- Verify booking exists: `node -e "const {sql} = require('./backend-deploy/config/database.cjs'); sql\`SELECT id FROM bookings WHERE id = 'YOUR_BOOKING_ID'\`.then(console.table).then(() => process.exit(0))"`

### Scenario 2: "Receipt creation failed: No deposit amount configured"
**Cause**: Backend validation rejected $0 deposit (should be fixed now)
**Solution**: 
- Verify backend deployment completed (check Render logs)
- Wait 2-3 minutes for Render to redeploy
- Try payment again

### Scenario 3: "Receipt creation failed: 500 Internal Server Error"
**Cause**: Database error or missing fields
**Solution**:
- Check Render backend logs for stack trace
- Verify receipts table exists: `node -e "const {sql} = require('./backend-deploy/config/database.cjs'); sql\`SELECT COUNT(*) FROM receipts\`.then(console.table).then(() => process.exit(0))"`
- If table missing, run: `node create-receipts-table.cjs`

### Scenario 4: Payment succeeds but no console logs for Step 4
**Cause**: Frontend not calling backend receipt endpoint
**Solution**:
- Check Network tab in browser dev tools
- Look for POST request to `/api/payment/process`
- Check request payload and response

---

## 📊 DEPLOYMENT STATUS

### Frontend
- ✅ Deployed to Firebase: https://weddingbazaarph.web.app
- ✅ Enhanced error logging added
- ✅ Payment type mapping fixed
- **Status**: LIVE

### Backend
- ✅ Pushed to GitHub: commit `55e5b9a`
- ⏳ Render auto-deployment: **IN PROGRESS**
- ✅ Strict validation removed
- ✅ Enhanced debugging added
- **Wait**: 2-3 minutes for Render to complete deployment

### Database
- ✅ Receipts table: EXISTS
- ✅ Sample receipt: VERIFIED
- **Status**: READY

---

## ⏰ WAIT TIME

**Before Testing**: Wait **3-5 minutes** for:
1. Render to pull latest code from GitHub ✅
2. Render to rebuild backend (2-3 min)
3. Backend to restart with new code

**Check Deployment Status**:
```powershell
# Wake up backend (also verifies it's responding)
Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health"

# Check payment health
Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/payment/health"
```

Expected: `{ status: "healthy", paymongo_configured: true }`

---

## 🎯 ACTION PLAN

### NOW (Immediate):
1. ⏰ **Wait 3-5 minutes** for Render backend deployment
2. 🔍 Open browser console (F12)
3. 🧪 Test payment with card: **4343 4343 4343 4343**
4. 📋 **Copy all console logs** from Step 1 through Step 4
5. 📤 **Share the logs** so we can see exactly what's happening

### If Receipt Still Doesn't Create:
1. Share the **frontend console logs** (Step 4 error details)
2. Share the **Render backend logs** (from dashboard)
3. Run database verification command (see above)
4. We'll debug from there!

---

## 🎉 EXPECTED OUTCOME

After these fixes, you should see:

✅ **Frontend Console**:
```
✅ [STEP 4] Receipt response received: { success: true, ... }
🧾 [CARD PAYMENT - REAL] Receipt created: RCP-xxxxx
```

✅ **Render Backend Logs**:
```
💳 [PROCESS-PAYMENT] Creating deposit receipt for ₱13,500
✅ [PROCESS-PAYMENT] Deposit receipt created: RCP-xxxxx
```

✅ **Database Query**:
```
1 receipt found with correct booking ID and amount
```

---

## 📞 NEXT STEPS

1. **Wait 3-5 minutes** for backend deployment
2. **Test payment** with console open
3. **Share logs** if receipt still doesn't create:
   - Frontend console logs (Step 4)
   - Render backend logs
   - Database query result

**We're getting close! The enhanced logging will show us exactly what's happening.** 🚀
