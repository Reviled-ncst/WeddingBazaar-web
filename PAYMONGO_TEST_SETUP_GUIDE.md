# 🧪 PayMongo Test Payment Setup & Testing Guide

## 📋 Quick Setup Summary

Your backend payment system is fully deployed and ready for testing. You just need to add the PayMongo test API keys to enable real payment processing.

---

## 🔑 Step 1: Add PayMongo Test Keys

### Backend Configuration (Render/Local)

Add these environment variables to your backend:

```bash
# PayMongo Test API Keys
PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here
PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
```

### Frontend Configuration (Local Development)

Add to your `.env` file or `.env.development`:

```bash
# PayMongo Test API Keys (Frontend)
VITE_PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here
VITE_PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
```

### Where to Get Your API Keys

1. Go to PayMongo Dashboard: https://dashboard.paymongo.com/developers/api-keys
2. Select **Test Mode** (toggle in top right)
3. Copy your test keys:
   - Secret Key (starts with `sk_test_`)
   - Public Key (starts with `pk_test_`)

---

## 💳 Step 2: PayMongo Test Cards

Use these test cards for payment testing:

### ✅ Success Card
```
Card Number: 4343 4343 4343 4343
Expiry: 12/34 (any future date)
CVC: 123 (any 3 digits)
Cardholder Name: Test User
Result: ✅ SUCCESS - Payment will be approved
```

### ❌ Declined Card (For Testing Failures)
```
Card Number: 4571 7360 0000 0008
Expiry: 12/34
CVC: 123
Result: ❌ DECLINED - Payment will fail
```

### 💡 Additional Test Cards
```
Visa Success: 4120 0000 0000 0007
Mastercard Success: 5555 5555 5555 4444
```

---

## 🧪 Step 3: Test the Payment Flow

### Option A: Quick Local Test (Recommended)

1. **Start the development server**
   ```powershell
   npm run dev
   ```

2. **Open the app**
   - URL: http://localhost:5173
   - Login with your test account

3. **Navigate to Bookings**
   - Go to: Individual Dashboard → My Bookings
   - Find a booking with "Pending Payment" or "Quotation Accepted"

4. **Initiate Payment**
   - Click "Pay Deposit" or "Pay Full Amount"
   - PayMongo payment modal will open

5. **Enter Test Card Details**
   ```
   Card: 4343 4343 4343 4343
   Expiry: 12/34
   CVC: 123
   Name: Test User
   ```

6. **Complete Payment**
   - Click "Pay Now"
   - Watch the progress indicators
   - Payment should complete successfully in 2-3 seconds

7. **Verify Receipt**
   - After success, check the console for receipt number
   - Receipt should be automatically generated
   - Booking status should update to "Deposit Paid" or "Fully Paid"

### Option B: Test with Production Deployment

1. **Configure Render Backend**
   - Go to: https://render.com → Your Backend Service
   - Environment Variables → Add:
     ```
     PAYMONGO_SECRET_KEY=sk_test_...
     PAYMONGO_PUBLIC_KEY=pk_test_...
     ```
   - Save and wait for deployment

2. **Test on Production**
   - URL: https://weddingbazaar-web.web.app
   - Follow the same steps as Option A

---

## 🔍 Step 4: Verify Everything Works

### Check Payment Processing
```powershell
# Check backend logs for payment processing
curl https://weddingbazaar-web.onrender.com/api/payment/health
```

Expected response:
```json
{
  "status": "healthy",
  "paymongo_configured": true,
  "endpoints": [
    "POST /api/payment/create-source",
    "POST /api/payment/process",
    "POST /api/payment/webhook"
  ]
}
```

### Check Receipt Generation

After a successful payment, check the database:

```sql
SELECT * FROM receipts 
WHERE booking_id = YOUR_BOOKING_ID 
ORDER BY created_at DESC 
LIMIT 1;
```

Expected fields:
- ✅ `receipt_number` - Auto-generated (e.g., "WB-2025-0001")
- ✅ `booking_id` - Links to your booking
- ✅ `amount` - Payment amount
- ✅ `payment_method` - "card"
- ✅ `payment_status` - "completed"
- ✅ `paymongo_payment_id` - PayMongo transaction ID
- ✅ `receipt_url` - URL to download receipt

---

## 🎯 Expected Payment Flow

### What Happens When You Click "Pay Deposit"

```
1. 🟢 User clicks "Pay Deposit" button
   ↓
2. 🟢 PayMongoPaymentModal opens
   ↓
3. 🟢 User selects "Credit/Debit Card"
   ↓
4. 🟢 User enters test card: 4343 4343 4343 4343
   ↓
5. 🟢 User clicks "Pay Now"
   ↓
6. 🟢 Frontend calls: POST /api/payment/process
   ↓
7. 🟢 Backend processes payment with PayMongo API
   ↓
8. 🟢 PayMongo returns success response
   ↓
9. 🟢 Backend creates receipt (receiptGenerator.cjs)
   ↓
10. 🟢 Backend updates booking status
   ↓
11. 🟢 Backend returns success + receipt data
   ↓
12. 🟢 Frontend shows success animation
   ↓
13. 🟢 Booking table refreshes with new status
   ↓
14. ✅ DONE - Payment complete with receipt!
```

---

## 🐛 Troubleshooting

### Issue: "PayMongo secret key not configured"

**Solution:** Add environment variables to backend:
```bash
PAYMONGO_SECRET_KEY=sk_test_your_key_here
```

### Issue: Payment modal doesn't open

**Check:**
1. Frontend is running: http://localhost:5173
2. Backend is running: http://localhost:3001
3. No console errors in browser DevTools

**Fix:** Restart development server:
```powershell
npm run dev
```

### Issue: Payment succeeds but no receipt

**Check backend logs:**
```powershell
# If running locally
cd backend-deploy
npm run dev
```

Look for:
```
🧾 [RECEIPT] Creating deposit receipt for booking: 123
✅ [RECEIPT] Receipt created: WB-2025-0001
```

**Fix:** Ensure `receiptGenerator.cjs` is imported in `payments.cjs`:
```javascript
const {
  createDepositReceipt,
  createBalanceReceipt,
  createFullPaymentReceipt
} = require('../helpers/receiptGenerator.cjs');
```

### Issue: Test card is declined

**Check:**
1. Using correct test card: `4343 4343 4343 4343`
2. Expiry is in the future: `12/34`
3. CVC is 3 digits: `123`

**Try:**
- Clear browser cache and cookies
- Use a different test card: `4120 0000 0000 0007`

---

## 📊 Success Indicators

### ✅ Payment Processed Successfully When:

1. **Frontend shows:**
   - ✓ Payment success animation
   - ✓ Receipt number displayed
   - ✓ Booking status updated

2. **Browser console shows:**
   ```
   💳 [CARD PAYMENT] Processing card payment with receipt generation...
   ✅ [CARD PAYMENT] Payment processed successfully
   🧾 [CARD PAYMENT] Receipt created: WB-2025-0001
   ```

3. **Backend logs show:**
   ```
   💳 [PAYMENT SERVICE] Processing payment for booking 123
   🧾 [RECEIPT] Creating deposit receipt
   ✅ [RECEIPT] Receipt created: WB-2025-0001
   💾 [PAYMENT] Payment record saved to database
   ```

4. **Database shows:**
   - New row in `receipts` table
   - New row in `payments` table
   - Updated `bookings` table with new status

---

## 🚀 Next Steps After Testing

### 1. Test All Payment Types
- ✅ Deposit payment (50%)
- ✅ Balance payment (remaining 50%)
- ✅ Full payment (100%)

### 2. Test Different Payment Methods
- ✅ Credit/Debit Card
- ⏳ GCash (requires PayMongo approval)
- ⏳ Maya (requires PayMongo approval)
- ⏳ GrabPay (requires PayMongo approval)

### 3. Test Error Scenarios
- ❌ Declined card: `4571 7360 0000 0008`
- ❌ Insufficient funds
- ❌ Network timeout

### 4. Verify Receipt Download
- Click "View Receipt" button
- PDF should download automatically
- Receipt should show correct amount and details

---

## 📝 Testing Checklist

Copy this checklist and mark items as you test:

```markdown
## Payment Integration Testing

### Setup
- [ ] Added PAYMONGO_SECRET_KEY to backend .env
- [ ] Added PAYMONGO_PUBLIC_KEY to backend .env
- [ ] Restarted backend server
- [ ] Backend health check passes: /api/payment/health

### Frontend Testing
- [ ] Payment modal opens correctly
- [ ] Test card accepted: 4343 4343 4343 4343
- [ ] Payment processing shows progress
- [ ] Success animation displays
- [ ] Receipt number shows in UI

### Backend Verification
- [ ] Receipt created in database
- [ ] Payment record saved
- [ ] Booking status updated
- [ ] Console logs show success messages

### Error Handling
- [ ] Declined card shows error: 4571 7360 0000 0008
- [ ] Network error handled gracefully
- [ ] Can retry failed payment

### Receipt Generation
- [ ] Receipt has unique number (WB-YYYY-####)
- [ ] Receipt shows correct amount
- [ ] Receipt links to booking
- [ ] Receipt downloadable as PDF

### End-to-End Flow
- [ ] Create booking
- [ ] Accept quotation
- [ ] Pay deposit with test card
- [ ] Verify receipt created
- [ ] Pay balance
- [ ] Verify second receipt created
- [ ] Booking marked as "Fully Paid"
```

---

## 🎓 Understanding the Code

### Key Files for Payment Processing

1. **PayMongoPaymentModal.tsx** (Frontend)
   - Location: `src/shared/components/PayMongoPaymentModal.tsx`
   - Purpose: Payment UI and user interaction
   - Line 331: `handlePayMongoPaymentSuccess()` - Handles success callback

2. **paymongoService.ts** (Frontend API Client)
   - Location: `src/shared/services/payment/paymongoService.ts`
   - Purpose: API calls to backend
   - Line 19: `createCardPayment()` - Processes card payments

3. **payments.cjs** (Backend API)
   - Location: `backend-deploy/routes/payments.cjs`
   - Purpose: PayMongo API integration
   - Line 32: `POST /create-source` - Creates payment sources
   - Line 242: `POST /process` - Processes payments

4. **receiptGenerator.cjs** (Backend Helper)
   - Location: `backend-deploy/helpers/receiptGenerator.cjs`
   - Purpose: Auto-generates receipts
   - Line 15: `createDepositReceipt()` - Creates deposit receipts
   - Line 95: `createBalanceReceipt()` - Creates balance receipts
   - Line 175: `createFullPaymentReceipt()` - Creates full payment receipts

---

## 🔗 Useful Resources

- **PayMongo Dashboard:** https://dashboard.paymongo.com
- **PayMongo Docs:** https://developers.paymongo.com/docs
- **Test Cards:** https://developers.paymongo.com/docs/testing
- **Backend URL:** https://weddingbazaar-web.onrender.com
- **Frontend URL:** https://weddingbazaar-web.web.app

---

## 🎉 You're Ready to Test!

1. Add your PayMongo test keys to the `.env` file
2. Restart your development server
3. Use the test card: `4343 4343 4343 4343`
4. Watch the magic happen! 🚀

Questions? Check the troubleshooting section or review the backend logs for detailed error messages.

---

**Last Updated:** January 11, 2025  
**Status:** ✅ Backend deployed and ready for testing  
**Next Step:** Add PayMongo test keys and run your first test payment
