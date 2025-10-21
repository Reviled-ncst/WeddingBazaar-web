# Declined Payment Modal - Testing Instructions

## 🎯 What Was Fixed
The declined payment modal for card payments now properly displays error messages instead of showing nothing.

## 🚀 Production URLs
- **Frontend**: https://weddingbazaarph.web.app
- **Backend**: https://weddingbazaar-web.onrender.com

## 📋 Quick Test Steps

### Test 1: Declined Card (Most Common Scenario)

1. **Navigate to Bookings**:
   - Go to https://weddingbazaarph.web.app
   - Login as individual user
   - Go to "My Bookings" page

2. **Initiate Payment**:
   - Find a booking that needs payment (Quote Accepted or Deposit Paid status)
   - Click "Pay Deposit" or "Pay Balance"

3. **Enter Declined Card**:
   ```
   Card Number: 4000 0000 0000 0002
   Expiry: 12/25
   CVC: 123
   Name: John Doe
   ```

4. **Expected Result**:
   - Processing animation shows
   - After 2-3 seconds, error modal appears with:
     - ❌ Red circle with X icon
     - Title: "Payment Failed"
     - Message: "Your card was declined. Please try a different card or contact your bank."
     - Two buttons: "Cancel" and "Try Again"

5. **Verify Actions**:
   - Click "Try Again" → Should return to payment method selection
   - Click "Cancel" → Should close modal and return to bookings

### Test 2: Insufficient Funds

**Use card**: `4000 0000 0000 9995`

**Expected message**: "Insufficient funds. Please use a different card."

### Test 3: Invalid Card Details

**Use invalid card**: `1234 5678 9012 3456`

**Expected message**: "Invalid card details. Please check your card information and try again."

### Test 4: Successful Payment (Sanity Check)

**Use success card**: `4343 4343 4343 4345`

**Expected result**:
- Processing animation
- Success modal with ✅ green checkmark
- Receipt created
- Booking status updated

## 🔍 Console Logs to Check

Open browser DevTools (F12) and check Console tab:

### When Error Occurs:
```
❌ Card payment error: [error details]
🔴 Setting error state with message: [friendly message]
🔍 Rendering error step with message: [error message]
```

### When Success:
```
✅ Card payment processed successfully: [payment result]
🎉 [PAYMENT SUCCESS TRIGGERED] Handler called with data: [payment data]
```

## 🧪 PayMongo Test Cards Reference

### Cards That Should Show Error Modal:

| Card Number | Error Type | Expected Message |
|------------|-----------|------------------|
| `4000 0000 0000 0002` | Generic decline | Your card was declined... |
| `4000 0000 0000 9995` | Insufficient funds | Insufficient funds... |
| `4000 0000 0000 9987` | Lost card | Your card was declined... |
| `4000 0000 0000 9979` | Stolen card | Your card was declined... |

### Cards That Should Show Success:

| Card Number | Card Type | Expected Result |
|------------|-----------|-----------------|
| `4343 4343 4343 4345` | Visa | Success modal + receipt |
| `5555 5555 5555 4444` | Mastercard | Success modal + receipt |

## ✅ Verification Checklist

### Before Testing:
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Open in incognito/private window
- [ ] Check that you're on https://weddingbazaarph.web.app
- [ ] Login as individual user
- [ ] Have a booking with payment pending

### During Testing:
- [ ] Error modal appears (not blank screen)
- [ ] Error message is clear and user-friendly
- [ ] Red X icon is visible
- [ ] "Cancel" button works
- [ ] "Try Again" button returns to payment selection
- [ ] Console logs show debug information

### After Testing:
- [ ] Screenshot error modal
- [ ] Copy console logs
- [ ] Test with multiple error cards
- [ ] Test successful payment as sanity check

## 🐛 Known Issues (If Any)

None currently - this fix addresses the main issue of blank/nothing showing on declined payments.

## 📊 What Changed

### Technical Changes:
1. Fixed payment step flow (card → card_form)
2. Enhanced error message translation
3. Added debug console logging
4. Improved error step rendering

### Files Changed:
- `src/shared/components/PayMongoPaymentModal.tsx`

## 🎨 Error Modal UI

```
┌─────────────────────────────────────────┐
│  [Close X]                              │
│                                         │
│         ┌─────────┐                     │
│         │  ❌ X   │  Payment Failed     │
│         └─────────┘                     │
│                                         │
│  We encountered an issue processing     │
│  your payment.                          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ❌ Error Details                │   │
│  │ Your card was declined. Please  │   │
│  │ try a different card or contact │   │
│  │ your bank.                      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌──────────┐  ┌──────────────────┐    │
│  │  Cancel  │  │ ← Try Again      │    │
│  └──────────┘  └──────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

## 🔗 Related Documentation

- Full details: `DECLINED_PAYMENT_FIX_COMPLETE.md`
- Receipt feature: `RECEIPT_MODAL_COMPLETE.md`
- Payment integration: `PAYMONGO_INTEGRATION_GUIDE.md`

## 🆘 Troubleshooting

### Issue: Modal Still Shows Nothing
**Solution**: 
1. Clear browser cache completely
2. Check console for errors
3. Verify you're on the latest deployed version (check file hash in Network tab)

### Issue: Wrong Error Message
**Solution**:
1. Check backend logs for actual error
2. Verify PayMongo API response
3. Add new error message mapping if needed

### Issue: Can't Test (No Bookings)
**Solution**:
1. Go to Services page
2. Request a booking for any service
3. Use Demo Payment to create quote
4. Accept the quote
5. Now you can test card payment

## 📞 Support

If you find any issues:
1. Screenshot the error modal
2. Copy console logs
3. Note the steps to reproduce
4. Document expected vs actual behavior

---

**Test Status**: ✅ Ready for testing
**Deployment**: ✅ Live on production
**Priority**: HIGH - Critical user-facing feature
