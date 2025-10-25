# 🚀 SUBSCRIPTION SYSTEM - QUICK DEPLOYMENT GUIDE

## ⚡ IMMEDIATE DEPLOYMENT STEPS

### 1️⃣ DATABASE SETUP (5 minutes)

```bash
# Login to Neon Dashboard
# Navigate to your database SQL Editor
# Copy and paste the entire contents of:
create-subscription-tables.sql

# Then click "Run"
# Verify success message appears
```

### 2️⃣ UPDATE ENVIRONMENT VARIABLES (2 minutes)

**In Render Dashboard:**

Go to: https://dashboard.render.com/web/weddingbazaar-web → Environment

Add these NEW variables:

```bash
# CRON Secret (generate a random string)
CRON_SECRET=subscription-cron-2025-secure-key-xyz

# Note: PAYMONGO_SECRET_KEY and PAYMONGO_PUBLIC_KEY already exist
# They are used for payment processing
```

**Save Changes**

### 3️⃣ DEPLOY BACKEND (Automatic)

```bash
# The backend route is already registered in production-backend.js
# Just push the new subscriptions.cjs file

cd c:\Games\WeddingBazaar-web
git add backend-deploy/routes/subscriptions.cjs
git add create-subscription-tables.sql
git add *.md
git commit -m "feat: Complete subscription system with PayMongo integration"
git push origin main

# Render will auto-deploy (takes ~3-5 minutes)
```

### 4️⃣ SET UP CRON JOB (5 minutes)

**In Render Dashboard:**

1. Click "New +" → "Cron Job"
2. Fill in:
   ```
   Name: Subscription Recurring Billing
   Environment: Same as Web Service
   Region: Same as Web Service
   Branch: main
   Schedule: 0 2 * * * (Daily at 2 AM)
   Command: curl -X POST https://weddingbazaar-web.onrender.com/api/subscriptions/process-recurring -H "Content-Type: application/json" -d '{"cron_secret":"subscription-cron-2025-secure-key-xyz"}'
   ```
3. Click "Create Cron Job"

### 5️⃣ SET UP PAYMONGO WEBHOOK (5 minutes)

**In PayMongo Dashboard:**

1. Go to: https://dashboard.paymongo.com/developers/webhooks
2. Click "Create Webhook"
3. Fill in:
   ```
   Webhook URL: https://weddingbazaar-web.onrender.com/api/subscriptions/webhook
   Events to listen:
     ☑ payment.paid
     ☑ payment.failed
     ☑ source.chargeable
   ```
4. Click "Create"

---

## ✅ VERIFICATION STEPS

### Test Endpoint 1: Get Plans
```bash
curl https://weddingbazaar-web.onrender.com/api/subscriptions/plans
```

**Expected Response:**
```json
{
  "success": true,
  "plans": [
    {
      "id": "basic",
      "name": "Free Tier",
      "price": 0,
      "price_display": "Free",
      ...
    },
    ...
  ]
}
```

### Test Endpoint 2: Get Vendor Subscription
```bash
curl https://weddingbazaar-web.onrender.com/api/subscriptions/vendor/YOUR_VENDOR_ID
```

**Expected Response:**
```json
{
  "success": true,
  "subscription": {
    "vendor_id": "YOUR_VENDOR_ID",
    "plan_name": "basic",
    "status": "active",
    "plan": {
      "limits": {
        "max_services": 5,
        ...
      }
    }
  }
}
```

### Test Endpoint 3: Check Limit
```bash
curl -X POST https://weddingbazaar-web.onrender.com/api/subscriptions/check-limit \
  -H "Content-Type: application/json" \
  -d '{
    "vendor_id": "YOUR_VENDOR_ID",
    "action": "create_service",
    "current_count": 3
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "allowed": true,
  "plan": "basic",
  "limit": 5,
  "current": 3,
  "message": "Can create service"
}
```

---

## 🧪 TESTING WITH REAL PAYMENT

### Create Premium Subscription (TEST MODE)

```bash
curl -X POST https://weddingbazaar-web.onrender.com/api/subscriptions/create-with-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "vendor_id": "YOUR_VENDOR_ID",
    "plan_name": "premium",
    "billing_cycle": "monthly",
    "payment_method_details": {
      "type": "card",
      "number": "4343434343434345",
      "exp_month": 12,
      "exp_year": 2025,
      "cvc": "123",
      "name": "Test Vendor",
      "email": "test@example.com"
    },
    "start_trial": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Trial subscription activated!",
  "subscription": {
    "id": "uuid",
    "plan_name": "premium",
    "status": "trial",
    "trial_end_date": "2025-11-09",
    ...
  },
  "payment": {
    "amount_paid": 0,
    "status": "succeeded"
  }
}
```

---

## 📱 FRONTEND INTEGRATION (NEXT STEP)

### Update VendorServices.tsx

The code is already there! Just make sure it's calling the right endpoint:

```typescript
// In src/shared/contexts/SubscriptionContext.tsx
const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

// This should already be fetching from:
// GET ${apiUrl}/subscriptions/vendor/${user.id}

// ✅ Already implemented and working!
```

### Add Payment Modal for Upgrades

Create new file: `src/shared/components/modals/SubscriptionPaymentModal.tsx`

```typescript
import React, { useState } from 'react';
import { paymongoService } from '@/shared/services/payment/paymongoService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  planId: 'premium' | 'pro' | 'enterprise';
  vendorId: string;
}

export const SubscriptionPaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  planId,
  vendorId
}) => {
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    name: '',
    email: ''
  });

  const handleSubscribe = async () => {
    const response = await fetch(`${apiUrl}/api/subscriptions/create-with-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vendor_id: vendorId,
        plan_name: planId,
        billing_cycle: 'monthly',
        payment_method_details: {
          type: 'card',
          number: cardDetails.number,
          exp_month: parseInt(cardDetails.expMonth),
          exp_year: parseInt(cardDetails.expYear),
          cvc: cardDetails.cvc,
          name: cardDetails.name,
          email: cardDetails.email
        },
        start_trial: true
      })
    });

    const result = await response.json();
    
    if (result.success) {
      alert('✅ Subscription activated!');
      window.dispatchEvent(new Event('subscriptionUpdated'));
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Upgrade to {planId}</h2>
        
        {/* Card input fields */}
        <input
          type="text"
          placeholder="Card Number"
          value={cardDetails.number}
          onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
          className="w-full p-3 border rounded mb-3"
        />
        
        {/* ... more fields ... */}
        
        <button
          onClick={handleSubscribe}
          className="w-full bg-rose-500 text-white p-3 rounded-lg"
        >
          Subscribe Now
        </button>
      </div>
    </div>
  );
};
```

---

## 🎯 EXPECTED BEHAVIOR

### For Free Tier Vendors:
1. Can create up to 5 services
2. When trying to create 6th service:
   - Error message: "You've reached the maximum of 5 services for your Free plan"
   - "Upgrade Plan" button appears
3. Clicking upgrade shows payment modal
4. After payment, subscription updates
5. Can now create unlimited services

### For Premium/Pro/Enterprise:
1. No service limits
2. Full access to all features
3. Recurring billing every month/year
4. Payment method stored securely
5. Can upgrade/downgrade anytime

---

## 🔍 MONITORING

### Daily Checks:
```bash
# Check subscription count
curl https://weddingbazaar-web.onrender.com/api/subscriptions/analytics/overview

# Check CRON job logs in Render dashboard
# Look for "Recurring billing complete" messages
```

### Weekly Reviews:
- Revenue dashboard
- Churn rate
- Failed payments
- Usage patterns

---

## 🚨 TROUBLESHOOTING

### Problem: "No subscription found"
**Solution:** Subscription will auto-create with basic plan on first API call

### Problem: "Payment processing failed"
**Solution:** Check PayMongo dashboard for detailed error message

### Problem: CRON job not running
**Solution:** Check CRON_SECRET matches in both CRON job and environment variables

### Problem: Webhook not triggering
**Solution:** Verify webhook URL in PayMongo dashboard is correct

---

## ✨ YOU'RE DONE!

Your subscription system is now:
- ✅ Deployed
- ✅ Configured
- ✅ Ready to accept payments
- ✅ Automatically billing
- ✅ Tracking usage

**Start testing and enjoy your new revenue stream!** 💰🎉

---

**Need help?** Check the detailed documentation in:
- `COMPLETE_SUBSCRIPTION_SYSTEM_DOCUMENTATION.md`
- `SUBSCRIPTION_SYSTEM_COMPLETE_SUMMARY.md`
