# 🎯 QUICK TESTING GUIDE - Balance & Receipt Fix

## Test URL
https://weddingbazaarph.web.app/individual/bookings

## Expected Results (After Fix)

### Test 1: Catering Booking (Deposit Paid)
**Card Display:**
```
┌────────────────────────────────┐
│ 🍽️ catering                   │
│ Test Wedding Services          │
│ ✅ Deposit Paid                │
│                                │
│ Total Amount     ₱72,802.24    │
│ Balance          ₱50,961.24 🟠 │ ← SHOULD BE ₱50,961.24
└────────────────────────────────┘
```

**Steps:**
1. Navigate to bookings page
2. Find "Catering Services" card
3. ✅ Verify balance shows **₱50,961.24** (not ₱72,802.24)
4. Click "View Receipt" button
5. ✅ Verify receipt shows deposit payment of ₱21,841.00

---

### Test 2: Photography Booking (Fully Paid)
**Card Display:**
```
┌────────────────────────────────┐
│ 📸 Photography                 │
│ Test Wedding Services          │
│ ⭐ Fully Paid                  │
│                                │
│ Total Amount     ₱72,802.24    │
│ Balance          ₱0.00 ✅      │ ← SHOULD BE ₱0.00 or hidden
└────────────────────────────────┘
```

**Steps:**
1. Find "Test Wedding Photography" card
2. ✅ Verify balance shows **₱0.00** or is not displayed
3. Click "View Receipt" button
4. ✅ Verify 2 receipts are displayed:
   - Receipt 1: Deposit ₱21,841.00
   - Receipt 2: Balance ₱50,961.24
   - Total: ₱72,802.24

---

## Quick Verification Commands

### Check Database Values
```bash
node verify-balance-calculations.cjs
```

**Expected Output:**
```
1. Catering Services
   Total Paid: ₱21,841.00 (30%)
   Remaining Balance: ₱50,961.24 ✅

2. Test Wedding Photography
   Total Paid: ₱72,802.24 (100%)
   Remaining Balance: ₱0.00 ✅
```

### Check Receipt Endpoint
```bash
curl https://weddingbazaar-web.onrender.com/api/payment/receipts/1761031420
curl https://weddingbazaar-web.onrender.com/api/payment/receipts/1761028103
```

**Expected:** HTTP 200 with receipt data

---

## Browser Console Logs

After opening bookings page, check console for:

```
💰 [BookingMapping] Payment calculations: {
  totalAmount: 72802.24,
  depositAmount: 21840.67,
  totalPaid: 21841,           ← From database
  remainingBalance: 50961.24, ← From database
  paymentProgressPercentage: 30
}
```

---

## Common Issues & Fixes

### Issue: Balance still shows ₱72,802.24
**Fix:** Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Receipts not loading
**Fix:** Check browser console for errors, verify backend is running

### Issue: Old data cached
**Fix:** Clear browser cache and cookies for weddingbazaarph.web.app

---

## Success Criteria ✅

- [ ] Catering balance = ₱50,961.24 (not ₱72,802.24)
- [ ] Photography balance = ₱0.00 (not ₱72,802.24)
- [ ] Receipt buttons work
- [ ] Receipts display with correct amounts
- [ ] Payment progress shows correctly (30% vs 100%)

---

## Screenshots to Take

1. **Before Fix:** Both bookings showing ₱72,802.24 balance ❌
2. **After Fix:** 
   - Catering showing ₱50,961.24 balance ✅
   - Photography showing ₱0.00 balance ✅
3. **Receipt Modal:** Showing receipt details
4. **Console Logs:** Showing correct payment calculations

---

**Test Status:** Ready for verification  
**Expected Time:** 2-3 minutes  
**Priority:** HIGH - Core payment feature
