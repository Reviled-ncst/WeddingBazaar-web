# 🧪 RECEIPT VIEWING TEST PLAN - After Deployment

## Pre-Test Checklist
- [ ] Wait 2-5 minutes for Render auto-deployment to complete
- [ ] Check Render dashboard: https://dashboard.render.com/
- [ ] Verify "weddingbazaar-web" service shows "Live" status
- [ ] Backend URL should be accessible: https://weddingbazaar-web.onrender.com/api/health

---

## Test Case 1: View Receipt for Existing Payment

### Setup
You already have a successful payment:
- **Booking ID**: `1761024060`
- **Amount Paid**: ₱25,000.00 (deposit)
- **Receipt Should Exist**: YES (created during payment flow)

### Steps
1. Open: https://weddingbazaar-web.web.app
2. Login with your test account
3. Go to "My Bookings" page
4. Find booking `1761024060` (Starlight Symphony)
5. Click **"View Receipt"** button

### Expected Results
✅ **ReceiptModal should open** with beautiful design
✅ **Should display**:
   - Receipt number (WB-2025-XXXXXXX)
   - Amount paid: ₱25,000.00
   - Payment type: "deposit"
   - Vendor name: Should show actual vendor name
   - Service type: Should show actual service
   - Event date: Should show actual date
   - Customer name: Should show your name
   - Email: Should show your email
   - Total paid: ₱25,000.00
   - Remaining balance: ₱25,000.00

✅ **No errors in console**
✅ **Backend should log**:
```
📄 [GET-RECEIPTS] Fetching receipts for booking...
📄 [GET-RECEIPTS] Booking ID: 1761024060
📄 [GET-RECEIPTS] Found 1 receipt(s)
📄 [GET-RECEIPTS] Total paid: ₱25000, Remaining: ₱25000
```

### If It Fails
❌ Check browser console for errors
❌ Check Network tab for response details
❌ Check Render logs for backend errors
❌ Verify deployment completed successfully

---

## Test Case 2: Make New Payment and View Receipt

### Setup
Use a different booking (preferably "Awaiting Quote" status)

### Steps
1. Find a booking with "Awaiting Quote" status
2. Click **"Pay Deposit"** or **"Pay Balance"**
3. Complete payment with test card:
   - Card: 4343 4343 4343 4345
   - Expiry: 12/25
   - CVC: 123
4. Wait for success message
5. Booking card should update to show payment status
6. Click **"View Receipt"** button

### Expected Results
✅ **Payment succeeds** - See success modal
✅ **Booking status updates** - Shows "Deposit Paid" or "Paid in Full"
✅ **View Receipt button appears** - Should be visible
✅ **Clicking View Receipt** - Opens ReceiptModal with payment details
✅ **All data correct** - Amount, vendor, service, customer info

---

## Test Case 3: Multiple Payments (Deposit + Balance)

### Setup
Make TWO payments on the same booking:
1. First: Pay deposit (₱25,000)
2. Then: Pay balance (remaining amount)

### Steps
1. Make deposit payment
2. View receipt - should show deposit info
3. Make balance payment
4. View receipt again

### Expected Results
✅ **Should show BOTH receipts** (if implementation supports multiple)
✅ **OR show latest receipt** with correct total_paid
✅ **Total paid should accumulate** (₱25,000 + balance)
✅ **Remaining balance should be ₱0** after full payment
✅ **Booking status** should be "Paid in Full"

---

## Test Case 4: Error Handling

### Test 4A: Receipt for Booking with No Payments
1. Find a booking that has NO payments yet
2. Click "View Receipt" (if button exists)

**Expected**: 
- ❌ Should show "No receipts found" message
- OR button should be disabled/hidden

### Test 4B: Invalid Booking ID
1. Manually call API: `/api/payment/receipts/999999999`

**Expected**:
- ❌ 404 error: "No receipts found for this booking"

---

## Browser Console Checks

### Success Logs to Look For
```javascript
📡 [BookingActions] Fetching receipts for booking: [ID]
📡 [BookingActions] Using URL: https://weddingbazaar-web.onrender.com/api/payment/receipts/[ID]
📡 [BookingActions] Response status: 200  // ✅ SUCCESS!
📄 [BookingActions] Receipts received: 1

📄 Receipt data structure:
{
  success: true,
  receipts: [{
    id: "...",
    receiptNumber: "WB-2025-...",
    amount: 2500000,  // ₱25,000 in centavos
    paymentType: "deposit",
    vendorName: "...",
    coupleName: "...",
    totalPaid: 2500000,
    remainingBalance: 2500000,
    ...
  }]
}
```

### Error Logs to Watch For
```javascript
// ❌ BAD (should NOT see these after fix):
📡 [BookingActions] Response status: 500
❌ [BookingActions] Failed to get receipts: Failed to fetch receipts

// ✅ GOOD (acceptable errors):
📡 [BookingActions] Response status: 404
❌ [BookingActions] No receipts found (user hasn't paid yet)
```

---

## Backend Logs Check (Render Dashboard)

### How to Check
1. Go to: https://dashboard.render.com/
2. Select "weddingbazaar-web" service
3. Click "Logs" tab
4. Look for receipt-related logs

### Success Logs
```
📄 [GET-RECEIPTS] Fetching receipts for booking...
📄 [GET-RECEIPTS] Booking ID: 1761024060
📄 [GET-RECEIPTS] Found 1 receipt(s)
📄 [GET-RECEIPTS] Total paid: ₱25000, Remaining: ₱25000
```

### Error Logs to Watch For
```
// ❌ Should NOT see these after fix:
❌ [GET-RECEIPTS] Error: column "couple_name" does not exist
❌ [GET-RECEIPTS] Error: column "remaining_balance" does not exist

// ✅ These are OK:
📄 [GET-RECEIPTS] No receipts found for booking [ID]
```

---

## Performance Checks

### Response Times
- ✅ Receipt fetch should be **< 500ms**
- ✅ Modal should open **instantly**
- ✅ No visible lag or loading spinners (if API is fast)

### Database Queries
The SQL query should:
- ✅ Use proper JOINs (receipts → bookings → vendors → users)
- ✅ Select only existing columns
- ✅ Return correct data types (numbers as numbers, not strings)

---

## Rollback Plan (If Test Fails)

If the fix doesn't work:

### Option 1: Check Deployment
```bash
# Verify deployment completed
curl https://weddingbazaar-web.onrender.com/api/health

# Should return:
{
  "status": "healthy",
  "paymongo_configured": true,
  ...
}
```

### Option 2: Check Git Commit
```bash
# Verify the fix was pushed
git log --oneline -1

# Should show:
# 🔧 CRITICAL FIX: Receipts endpoint SQL query (remove non-existent columns)
```

### Option 3: Manual Render Redeploy
1. Go to Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait 2-5 minutes
4. Retest

---

## Success Criteria Summary

### ✅ All Tests Pass When:
1. **Receipt Modal Opens** - No 500 errors
2. **Data is Accurate** - All fields populated correctly
3. **Calculations Correct** - totalPaid and remainingBalance are right
4. **No Console Errors** - Clean browser console
5. **Backend Logs Clean** - No SQL errors in Render logs

### 🎉 Feature Complete When:
- [ ] Test Case 1: View existing receipt ✅
- [ ] Test Case 2: New payment + receipt ✅
- [ ] Test Case 3: Multiple payments ✅
- [ ] Test Case 4: Error handling ✅
- [ ] Performance acceptable ✅
- [ ] No errors in logs ✅

---

## Post-Test Actions

### If All Tests Pass
1. ✅ Mark feature as **COMPLETE**
2. ✅ Update project documentation
3. ✅ Close related issues/tickets
4. ✅ Notify stakeholders

### If Tests Fail
1. ❌ Document specific failures
2. ❌ Capture error logs (browser + backend)
3. ❌ Create new fix based on findings
4. ❌ Redeploy and retest

---

## Quick Reference

### Test Account
- **URL**: https://weddingbazaar-web.web.app
- **Login**: Your test account credentials

### Test Booking
- **ID**: `1761024060` (has payment already)
- **Service**: Starlight Symphony
- **Amount Paid**: ₱25,000.00

### Test Card (PayMongo)
- **Card Number**: 4343 4343 4343 4345
- **Expiry**: 12/25
- **CVC**: 123

### Backend URLs
- **Health**: https://weddingbazaar-web.onrender.com/api/health
- **Receipts**: https://weddingbazaar-web.onrender.com/api/payment/receipts/:bookingId

---

## Timeline

1. **Deploy Time**: ~2-5 minutes (Render auto-deploy)
2. **Test Time**: ~10-15 minutes (all test cases)
3. **Total**: ~15-20 minutes from commit to verification

---

**Current Status**: ✅ Code pushed, awaiting Render deployment
**Next Action**: Wait for deployment, then run tests
**Priority**: CRITICAL (P0)
**Category**: Payment System / Receipts

---

*Created: January 2025*
*Fix Committed: Yes*
*Deployed: Pending (2-5 min ETA)*
