# 🧪 Payment Status Update - Testing Guide

## 🚀 DEPLOYMENT COMPLETE

**Frontend**: ✅ Deployed to https://weddingbazaarph.web.app
**Backend**: ✅ Live at https://weddingbazaar-web.onrender.com
**Receipts Table**: ✅ Created and verified
**Payment Type Mapping**: ✅ Fixed (downpayment → deposit)
**Status Update Flow**: ✅ Backend API integration added

---

## 🎯 WHAT WAS FIXED

### 1. Payment Status Not Persisting ✅
**Before**: Status updated in UI but reverted on refresh
**After**: Status updates in database and persists

### 2. Receipts Not Being Generated ✅
**Before**: No receipts table, receipt generation failed
**After**: Receipts table created, receipts generated automatically

### 3. Payment Type Mismatch ✅
**Before**: Frontend sent "downpayment", backend expected "deposit"
**After**: Automatic mapping added in payment service

---

## 🧪 TESTING INSTRUCTIONS

### Step 1: Login as Couple
```
URL: https://weddingbazaarph.web.app
Email: vendor0qw@gmail.com (or testcouple@example.com)
Password: [your password]
```

### Step 2: Navigate to Bookings
```
Click: "Bookings" in the header
Or go to: https://weddingbazaarph.web.app/individual/bookings
```

### Step 3: Find a Booking with "Pay Deposit" Button
Look for a booking with:
- Status: "Request" or "Quote Accepted"
- Button: "Pay Deposit" (blue button)

### Step 4: Open Browser Console
```
Press F12 or Right-click → Inspect → Console
This will show detailed payment logs
```

### Step 5: Initiate Payment
```
1. Click "Pay Deposit" button
2. Payment modal opens
3. Select "Credit/Debit Card"
4. Click "Continue to Payment"
```

### Step 6: Enter Test Card Details
```
Card Number:  4343 4343 4343 4343
Expiry Date:  12/25 (any future date)
CVC:          123
Cardholder:   Your Name
```

### Step 7: Submit Payment
```
1. Click "Pay Now" button
2. Watch console logs for payment flow
3. Payment processing indicator appears
4. Success animation plays
```

### Step 8: Verify Success
**✅ Expected Results:**
1. Success notification appears with payment details
2. Modal closes automatically (1 second delay)
3. **Button changes from "Pay Deposit" to "Pay Remaining Balance"**
4. Booking card shows updated status
5. Console shows:
   ```
   ✅ [STEP 4] Receipt created: RCP-xxxxxxxx
   ✅ [BACKEND UPDATE] Booking status updated successfully
   ✅ [BOOKINGS RELOAD] Reloading bookings from backend...
   ```

### Step 9: Verify Persistence
```
1. Refresh the page (F5)
2. Status should still show "Pay Remaining Balance"
3. Payment should be recorded
4. No data loss
```

---

## 🔍 CONSOLE LOG CHECKLIST

### ✅ Expected Logs (Success):
```
💳 [CARD PAYMENT - REAL] Processing REAL card payment with PayMongo...
💳 [STEP 1] Creating PayMongo payment intent...
✅ [STEP 1] Payment intent created: pi_xxxxx
💳 [STEP 2] Creating PayMongo payment method...
✅ [STEP 2] Payment method created: pm_xxxxx
💳 [STEP 3] Attaching payment method to intent...
✅ [STEP 3] Payment processed, status: succeeded
💳 [STEP 4] Creating receipt in backend...
💳 [STEP 4] Mapping paymentType: "downpayment" -> "deposit"
✅ [CARD PAYMENT - REAL] Payment completed successfully!
🧾 [CARD PAYMENT - REAL] Receipt created: RCP-1760270942042-544943
🎉 [PAYMENT SUCCESS TRIGGERED] Handler called
💰 [PAYMENT DETAILS] Booking status update starting...
✅ [BACKEND UPDATE] Booking status updated successfully
✅ [BOOKINGS RELOAD] Reloading bookings from backend...
🎉 [PAYMENT COMPLETE] All payment processing completed successfully
```

### ❌ Error Indicators (If something fails):
```
❌ [STEP X] - Something went wrong at a specific step
❌ [BACKEND UPDATE] - Database update failed
❌ [BOOKINGS RELOAD] - Couldn't fetch updated data
```

---

## 🗄️ DATABASE VERIFICATION

### Check Receipt Was Created
```powershell
# Run this command in project directory:
node -e "const {sql} = require('./backend-deploy/config/database.cjs'); sql\`SELECT receipt_number, amount_paid, payment_method, booking_id FROM receipts ORDER BY created_at DESC LIMIT 5\`.then(r => console.table(r)).then(() => process.exit(0))"
```

**Expected Output:**
```
┌─────────┬─────────────────────────┬────────────┬─────────────────┬──────────────┐
│ (index) │   receipt_number        │ amount_paid│ payment_method  │ booking_id   │
├─────────┼─────────────────────────┼────────────┼─────────────────┼──────────────┤
│    0    │ 'RCP-1760270942-544943' │  1500000   │ 'card'          │ 'TEST-001'   │
└─────────┴─────────────────────────┴────────────┴─────────────────┴──────────────┘
```

### Check Booking Status Was Updated
```powershell
# Replace BOOKING_ID with your actual booking ID:
node -e "const {sql} = require('./backend-deploy/config/database.cjs'); sql\`SELECT id, status, notes FROM bookings WHERE id = 'BOOKING_ID'\`.then(console.table).then(() => process.exit(0))"
```

**Expected Output:**
```
┌─────────┬──────────────┬──────────────┬────────────────────────────────────┐
│ (index) │      id      │   status     │            notes                   │
├─────────┼──────────────┼──────────────┼────────────────────────────────────┤
│    0    │ 'TEST-001'   │ 'downpayment'│ 'DEPOSIT_PAID: Payment received...'│
└─────────┴──────────────┴──────────────┴────────────────────────────────────┘
```

---

## 🎬 COMPLETE USER FLOW

### Initial State (Before Payment)
```
Booking Status: "Request" or "Quote Accepted"
Button Text: "💰 Pay Deposit"
Button Color: Blue (primary)
Total Paid: ₱0
Remaining Balance: ₱50,000 (example)
```

### After Deposit Payment
```
Booking Status: "Downpayment Paid"
Button Text: "💰 Pay Remaining Balance"
Button Color: Green (success)
Total Paid: ₱15,000 (example)
Remaining Balance: ₱35,000
Progress Bar: 30% Complete
```

### After Full Payment
```
Booking Status: "Fully Paid"
Button Text: "✅ Fully Paid"
Button Color: Gray (disabled)
Button State: Disabled (non-clickable)
Total Paid: ₱50,000
Remaining Balance: ₱0
Progress Bar: 100% Complete
```

---

## 🐛 TROUBLESHOOTING

### Issue: Button Doesn't Change After Payment
**Check**:
1. Console logs - did backend update succeed?
2. Network tab - check `/api/bookings/:id/status` request
3. Response status - should be 200 with success: true

**Fix**: Refresh page and try again. If persists, check backend logs.

### Issue: "No Receipt in Database"
**Check**:
1. Console logs - did Step 4 complete?
2. Payment type mapping - should see "downpayment" -> "deposit"
3. Backend logs in Render dashboard

**Fix**: Verify receipts table exists:
```bash
node create-receipts-table.cjs
```

### Issue: "Payment Succeeds but Status Reverts on Refresh"
**Check**:
1. Backend status update request - check Network tab
2. Database status - use verification command above
3. `loadBookings()` was called - check console logs

**Fix**: Likely backend update failed. Check Render logs for errors.

---

## 📊 SUCCESS METRICS

### ✅ All Green Checklist
- [ ] Payment succeeds in PayMongo dashboard
- [ ] Receipt appears in receipts table
- [ ] Booking status updates in bookings table
- [ ] UI button changes correctly
- [ ] Status persists after refresh
- [ ] Console shows complete flow without errors
- [ ] Success notification displays
- [ ] Payment details are accurate

---

## 🎯 NEXT STEPS

### After Successful Test:
1. ✅ Verify receipt generation with multiple payment types
2. ✅ Test remaining balance payment flow
3. ✅ Test full payment flow (no deposit)
4. ✅ Verify webhook handling (if applicable)
5. 🎉 Switch to LIVE keys for production!

### Switch to LIVE Keys:
```
1. Go to Render Dashboard
2. Update environment variables:
   - PAYMONGO_SECRET_KEY = sk_live_[REDACTED]
   - PAYMONGO_PUBLIC_KEY = pk_live_[REDACTED]
3. Redeploy backend
4. Test with real card (small amount first!)
```

---

## 📞 SUPPORT

### If Tests Fail:
1. Check this document's troubleshooting section
2. Review `PAYMENT_STATUS_UPDATE_COMPLETE.md`
3. Check Render backend logs
4. Review browser console logs
5. Verify database table structure

### Quick Debug Commands:
```powershell
# Wake up backend
Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health"

# Check payment health
Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/payment/health"

# Check receipts table
node -e "const {sql} = require('./backend-deploy/config/database.cjs'); sql\`SELECT COUNT(*) FROM receipts\`.then(console.log).then(() => process.exit(0))"
```

---

## 🎉 READY TO TEST!

**Everything is deployed and ready. Follow the testing instructions above!**

**Live URLs:**
- Frontend: https://weddingbazaarph.web.app
- Backend: https://weddingbazaar-web.onrender.com
- Test Card: 4343 4343 4343 4343

**Good luck! 🚀**
