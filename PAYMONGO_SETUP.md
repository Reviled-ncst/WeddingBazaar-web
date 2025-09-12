# PayMongo Integration Setup Guide

## Overview
Your Wedding Bazaar application is configured to use PayMongo for payment processing, but the API keys need to be properly configured.

## Current Status
- ❌ PayMongo API keys are placeholders
- ✅ PayMongo payment endpoints added to backend
- ✅ Error handling improved for missing API keys
- ✅ Frontend PayMongo service implemented

## Steps to Fix PayMongo Integration

### 1. Get PayMongo API Keys

1. **Create PayMongo Account**
   - Go to https://dashboard.paymongo.com/
   - Sign up for a business account
   - Complete business verification

2. **Get API Keys**
   - Navigate to Developers > API Keys
   - Copy your **Test Keys** for development:
     - Public Key: `pk_test_xxxxxxxxxxxxxxxxx`
     - Secret Key: `sk_test_xxxxxxxxxxxxxxxxx`
   - For production, use **Live Keys**:
     - Public Key: `pk_live_xxxxxxxxxxxxxxxxx`
     - Secret Key: `sk_live_xxxxxxxxxxxxxxxxx`

### 2. Update Environment Variables

#### Frontend (Firebase Hosting)
Update `.env.production`:
```bash
VITE_PAYMONGO_PUBLIC_KEY=pk_test_your_actual_key_here
VITE_PAYMONGO_SECRET_KEY=sk_test_your_actual_key_here
```

#### Backend (Render)
Set these environment variables in your Render dashboard:
```bash
PAYMONGO_SECRET_KEY=sk_test_your_actual_key_here
PAYMONGO_PUBLIC_KEY=pk_test_your_actual_key_here
FRONTEND_URL=https://weddingbazaarph.web.app
```

### 3. Deploy Updated Configuration

#### Frontend Deployment
```bash
npm run build
firebase deploy
```

#### Backend Deployment
The environment variables are set in Render dashboard, so just trigger a new deployment:
- Go to your Render dashboard
- Click "Manual Deploy" > "Deploy latest commit"

### 4. Test Payment Integration

After updating the API keys, test these endpoints:

1. **Create Payment Intent (Card Payments)**
   ```bash
   curl -X POST https://wedding-bazaar-backend.onrender.com/api/payments/create-intent \
     -H "Content-Type: application/json" \
     -d '{"amount": 1000, "description": "Test Payment"}'
   ```

2. **Create Source (E-wallet)**
   ```bash
   curl -X POST https://wedding-bazaar-backend.onrender.com/api/payments/create-source \
     -H "Content-Type: application/json" \
     -d '{"amount": 1000, "type": "gcash", "description": "Test GCash Payment"}'
   ```

### 5. Supported Payment Methods

Your application supports:
- **Credit/Debit Cards** (Visa, Mastercard, JCB)
- **E-wallets**: GCash, PayMaya, GrabPay
- **Bank Transfers** (can be added later)

### 6. Error Handling

The backend now provides better error messages:
- ❌ Invalid API keys: "PayMongo API keys not properly configured"
- ❌ Invalid amount: "Invalid amount specified"
- ❌ Invalid payment type: "Invalid payment type. Supported types: gcash, paymaya, grab_pay"

### 7. Webhook Configuration (Optional)

For production, set up webhooks in PayMongo dashboard:
- Webhook URL: `https://wedding-bazaar-backend.onrender.com/api/payments/webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Implementation Details

### Backend Endpoints Added
- `POST /api/payments/create-intent` - Create card payment intent
- `POST /api/payments/create-source` - Create e-wallet payment source
- `GET /api/payments/status/:paymentId` - Check payment status
- `POST /api/payments/webhook` - Handle PayMongo webhooks

### Frontend Integration
The frontend already has PayMongo service implemented:
- Direct API calls to PayMongo for some operations
- Backend API calls for secure operations
- Proper error handling and user feedback

## Next Steps

1. **Get PayMongo API keys** from dashboard
2. **Update environment variables** in Render and local `.env.production`
3. **Deploy** both frontend and backend
4. **Test payment flow** end-to-end
5. **Monitor** payment success/failure rates

## Testing Checklist

- [ ] Card payment intent creation works
- [ ] GCash payment source creation works
- [ ] PayMaya payment source creation works
- [ ] Payment status checking works
- [ ] Frontend payment forms work without errors
- [ ] Error messages are user-friendly
- [ ] Payment success/failure callbacks work

## Security Notes

- ✅ Secret keys are only used on backend
- ✅ Public keys are safe to use on frontend
- ✅ All PayMongo API calls use HTTPS
- ✅ Webhook signature verification ready (needs implementation)
- ✅ Environment variables separated by environment

## Support

If you encounter issues:
1. Check PayMongo dashboard for transaction logs
2. Check backend logs in Render dashboard
3. Verify API keys are correctly formatted
4. Test with small amounts first (minimum ₱100)
