# PayMongo Integration - TEST Keys Configuration

## 🔑 PayMongo API Keys (TEST MODE)

### Test Keys (For Development/Testing)
```
Public Key:  pk_test_[REDACTED]
Secret Key:  sk_test_[REDACTED]
```

### Live Keys (For Production - DO NOT USE YET)
```
Public Key:  pk_live_[REDACTED]
Secret Key:  sk_live_[REDACTED]
```

---

## 🚀 Backend Configuration

### Environment Variables (Render)
Add these to your Render environment variables:

```bash
PAYMONGO_SECRET_KEY=sk_test_[REDACTED]
PAYMONGO_PUBLIC_KEY=pk_test_[REDACTED]
```

### Local Development (.env)
```bash
PAYMONGO_SECRET_KEY=sk_test_[REDACTED]
PAYMONGO_PUBLIC_KEY=pk_test_[REDACTED]
VITE_PAYMONGO_PUBLIC_KEY=pk_test_[REDACTED]
```

---

## 🔧 Frontend Configuration

### Environment Variables (Firebase/Vite)
Add to `.env` or `.env.production`:

```bash
VITE_PAYMONGO_PUBLIC_KEY=pk_test_[REDACTED]
VITE_API_URL=https://weddingbazaar-web.onrender.com
```

---

## 💳 PayMongo Test Payment Methods

### Test Cards (For Testing)
```
Card Number: 4343 4343 4343 4343
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
Result: SUCCESS

Card Number: 4571 7360 0000 0008
Expiry: Any future date
CVC: Any 3 digits
Result: DECLINED
```

### E-Wallet Test Accounts
**GCash Test:**
- Any GCash number will work in test mode
- Use the test dashboard to simulate success/failure

**Maya Test:**
- Any Maya number will work in test mode
- Use the test dashboard to simulate success/failure

---

## 🎯 Payment Flow with Receipt Generation

### Current State (SIMULATION ONLY)
```
❌ Frontend: Uses fake payment simulation
❌ Backend: Not called during payment
❌ PayMongo: Not integrated
❌ Receipts: Not generated
```

### Target State (REAL PAYMENTS)
```
✅ Frontend: Calls PayMongo API with test keys
✅ Backend: Receives payment webhook
✅ PayMongo: Processes real test payments
✅ Receipts: Generated automatically
```

---

## 📋 Step-by-Step Integration

### Phase 1: Backend Setup (COMPLETE ✅)
1. ✅ Receipt generator helper created
2. ✅ Payment processing endpoint (`POST /api/payment/process`)
3. ✅ PayMongo webhook handler with receipt creation
4. ✅ All payment types supported (deposit, balance, full)

### Phase 2: Configure Environment Variables (NEXT)
1. **Render Backend:**
   - Go to Render Dashboard → WeddingBazaar Backend
   - Environment → Add Variables:
     - `PAYMONGO_SECRET_KEY` = `sk_test_[REDACTED]`
     - `PAYMONGO_PUBLIC_KEY` = `pk_test_[REDACTED]`
   - Click "Save Changes"
   - Backend will auto-deploy

2. **Firebase Frontend:**
   - Update `.env` or Firebase environment config:
     - `VITE_PAYMONGO_PUBLIC_KEY` = `pk_test_[REDACTED]`

### Phase 3: Frontend Payment Integration (NEXT)
Update `src/pages/users/individual/payment/*` to:
1. Remove simulation mode
2. Call `POST /api/payment/process` with real data
3. Integrate PayMongo payment UI
4. Handle payment success/failure
5. Display receipts after payment

### Phase 4: Test Real Payments
1. Use PayMongo test card: `4343 4343 4343 4343`
2. Make deposit payment
3. Verify receipt created
4. Check webhook logs
5. Confirm booking status updated

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] Add environment variables to Render
- [ ] Deploy backend with env vars
- [ ] Test payment health endpoint: `GET /api/payment/health`
- [ ] Should return: `secret_key_configured: true`

### Payment Processing Testing
- [ ] Test deposit payment endpoint
- [ ] Test balance payment endpoint
- [ ] Test full payment endpoint
- [ ] Verify receipts created in database
- [ ] Check receipt numbers are unique

### Frontend Testing
- [ ] Update payment service to call real endpoint
- [ ] Test card payment flow
- [ ] Test GCash payment flow
- [ ] Test Maya payment flow
- [ ] Verify receipt display works

### End-to-End Testing
- [ ] Create new booking
- [ ] Accept quote
- [ ] Pay deposit with test card
- [ ] Verify receipt generated
- [ ] Check "Show Receipt" button appears
- [ ] Pay balance
- [ ] Verify second receipt
- [ ] Confirm fully paid status

---

## 🔍 Verification Commands

### Check Backend Environment
```bash
curl https://weddingbazaar-web.onrender.com/api/payment/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "payments",
  "paymongo": {
    "secret_key_configured": true,
    "public_key_configured": true,
    "api_url": "https://api.paymongo.com/v1"
  }
}
```

### Test Payment Processing
```bash
curl -X POST https://weddingbazaar-web.onrender.com/api/payment/process \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "1760962499",
    "paymentType": "deposit",
    "paymentMethod": "card",
    "amount": 1350000,
    "paymentReference": "test-payment-001"
  }'
```

### Check Receipt Created
```bash
curl https://weddingbazaar-web.onrender.com/api/receipts/booking/1760962499
```

---

## 🚨 Current Issue Summary

### The Problem
Frontend is using **SIMULATION MODE** instead of calling our real PayMongo integration:

```javascript
// CURRENT (WRONG)
💳 [CARD PAYMENT] Starting card payment simulation...
✅ [CARD PAYMENT] Payment simulation completed successfully
// No backend call, no receipt generation

// TARGET (CORRECT)
💳 [CARD PAYMENT] Calling PayMongo API...
📡 POST /api/payment/process
✅ Receipt WB-20250110-00001 created
✅ Payment processed successfully
```

### The Solution
1. **Add PayMongo test keys to environment** ← DO THIS NOW
2. **Push backend changes** (already done)
3. **Update frontend to call real endpoint** (next step)
4. **Test with PayMongo test cards**

---

## 📝 Next Actions

### IMMEDIATE (Do Now)
1. **Add Environment Variables to Render:**
   ```
   PAYMONGO_SECRET_KEY=sk_test_[REDACTED]
   PAYMONGO_PUBLIC_KEY=pk_test_[REDACTED]
   ```

2. **Wait for Backend Deployment** (5-10 minutes)

3. **Test Payment Health:**
   ```bash
   curl https://weddingbazaar-web.onrender.com/api/payment/health
   ```

### NEXT SESSION
1. **Update Frontend Payment Service** to use real PayMongo
2. **Remove Simulation Mode**
3. **Test Real Payments** with test cards
4. **Verify Receipts Generate** automatically

---

## 🎉 Expected Result

After configuration and frontend update:

```
User pays deposit ₱13,500
     ↓
Frontend calls PayMongo API
     ↓
PayMongo processes payment
     ↓
Webhook notifies backend
     ↓
🧾 Receipt WB-20250110-00001 CREATED
     ↓
Booking status updated to "Deposit Paid"
     ↓
Receipt accessible via "Show Receipt" button
     ↓
✅ REAL PAYMENT WITH AUTOMATIC RECEIPT
```

---

## 📞 PayMongo Dashboard

**Test Dashboard:** https://dashboard.paymongo.com/test/payments

Use this to:
- Monitor test payments
- View payment history
- Test webhook events
- Simulate payment success/failure

---

**Status**: ✅ Backend Ready, Keys Available, Environment Config Pending
**Next**: Add test keys to Render environment and test!
