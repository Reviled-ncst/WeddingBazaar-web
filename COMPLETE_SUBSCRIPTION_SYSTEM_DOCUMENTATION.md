# 🎯 COMPLETE SUBSCRIPTION SYSTEM WITH PAYMONGO INTEGRATION

**Status**: ✅ PRODUCTION READY  
**Date**: October 26, 2025  
**Version**: 1.0.0

---

## 🚀 FEATURES IMPLEMENTED

### ✨ Core Subscription Management
- ✅ **4-Tier Subscription Plans**: Basic (Free), Premium, Pro, Enterprise
- ✅ **Trial Period Support**: 14-30 days based on plan
- ✅ **Flexible Billing**: Monthly or Yearly cycles with savings
- ✅ **Automatic Proration**: Smart calculations for upgrades/downgrades
- ✅ **Usage Tracking**: Real-time monitoring of plan limits
- ✅ **Limit Enforcement**: Prevents exceeding subscription limits

### 💳 PayMongo Payment Integration
- ✅ **Card Payments**: Full credit/debit card processing
- ✅ **E-Wallet Support**: GCash, PayMaya, GrabPay ready
- ✅ **Recurring Billing**: Automatic monthly/yearly renewals
- ✅ **Payment Method Management**: Update cards on file
- ✅ **Webhook Handling**: Real-time payment event processing
- ✅ **Payment History**: Complete transaction tracking
- ✅ **Invoice Generation**: Automated invoice creation

### 📊 Advanced Features
- ✅ **Usage Analytics**: Per-vendor usage statistics
- ✅ **Platform Analytics**: Revenue, churn rate, subscriptions by plan
- ✅ **Cancellation Options**: Immediate or at period end
- ✅ **Reactivation**: Easy subscription reactivation
- ✅ **Admin Tools**: Manual subscription creation
- ✅ **CRON Jobs**: Automated billing processor

---

## 📋 SUBSCRIPTION PLANS

### 🆓 **Basic (Free Tier)**
```javascript
Price: FREE
Limits:
  - 5 services
  - 10 portfolio images
  - Unlimited bookings
  - 100 messages/month
  - No video calls
  - No featured listing
  - Standard support
```

### 💎 **Premium**
```javascript
Price: ₱999/month or ₱9,999/year (save ₱2,000)
Trial: 14 days
Limits:
  - Unlimited services
  - 50 portfolio images
  - Unlimited bookings
  - 500 messages/month
  - 5 hours video calls/month
  - Featured listing (7 days/month)
  - Priority support
  - Advanced analytics
```

### 🏆 **Professional**
```javascript
Price: ₱1,999/month or ₱19,999/year (save ₱4,000)
Trial: 14 days
Limits:
  - Unlimited services
  - Unlimited portfolio images
  - Unlimited bookings
  - Unlimited messages
  - Unlimited video calls
  - Permanent featured listing
  - Custom branding
  - Team collaboration (3 members)
  - Payment processing integration
```

### 🌟 **Enterprise**
```javascript
Price: ₱4,999/month or ₱49,999/year (save ₱10,000)
Trial: 30 days
Limits:
  - Everything in Professional
  - White-label solution
  - API access & webhooks
  - Unlimited team members
  - Dedicated account manager
  - 99.9% SLA guarantee
  - Custom integrations
```

---

## 🔌 API ENDPOINTS

### 📦 Subscription Management

#### `GET /api/subscriptions/plans`
Get all available plans with pricing
```json
Response:
{
  "success": true,
  "plans": [
    {
      "id": "premium",
      "name": "Premium Plan",
      "price": 99900,
      "price_display": "₱999",
      "price_yearly": 999900,
      "price_yearly_display": "₱9,999",
      "savings_yearly": 2000,
      "features": [...],
      "limits": {...}
    }
  ]
}
```

#### `GET /api/subscriptions/vendor/:vendorId`
Get current subscription for vendor
```json
Response:
{
  "success": true,
  "subscription": {
    "id": "uuid",
    "vendor_id": "uuid",
    "plan_name": "premium",
    "status": "active",
    "billing_cycle": "monthly",
    "start_date": "2025-01-01",
    "end_date": "2025-02-01",
    "trial_end_date": null,
    "next_billing_date": "2025-02-01",
    "cancel_at_period_end": false,
    "plan": {...}
  }
}
```

#### `POST /api/subscriptions/create-with-payment`
Create new subscription with payment
```json
Request:
{
  "vendor_id": "uuid",
  "plan_name": "premium",
  "billing_cycle": "monthly",
  "payment_method_details": {
    "type": "card",
    "number": "4343434343434345",
    "exp_month": 12,
    "exp_year": 2025,
    "cvc": "123",
    "name": "Juan Dela Cruz",
    "email": "vendor@example.com"
  },
  "start_trial": false
}

Response:
{
  "success": true,
  "message": "Subscription created and payment processed!",
  "subscription": {...},
  "payment": {
    "amount_paid": 99900,
    "payment_intent_id": "pi_xxx",
    "payment_method_id": "pm_xxx",
    "status": "succeeded"
  }
}
```

#### `PUT /api/subscriptions/upgrade-with-payment`
Upgrade subscription with proration
```json
Request:
{
  "vendor_id": "uuid",
  "new_plan": "pro",
  "payment_method_details": {
    "type": "card",
    "number": "4343434343434345",
    "exp_month": 12,
    "exp_year": 2025,
    "cvc": "123"
  }
}

Response:
{
  "success": true,
  "message": "Subscription upgraded successfully!",
  "subscription": {...},
  "payment": {
    "proration_amount": 50000,
    "payment_intent_id": "pi_xxx",
    "status": "succeeded"
  }
}
```

### 💳 Payment Management

#### `PUT /api/subscriptions/update-payment-method`
Update payment method for subscription
```json
Request:
{
  "vendor_id": "uuid",
  "payment_method_details": {
    "type": "card",
    "number": "4343434343434345",
    "exp_month": 12,
    "exp_year": 2026,
    "cvc": "123",
    "name": "Juan Dela Cruz",
    "email": "vendor@example.com"
  }
}

Response:
{
  "success": true,
  "message": "Payment method updated successfully",
  "payment_method_id": "pm_xxx"
}
```

#### `GET /api/subscriptions/payment-history/:vendorId`
Get payment transaction history
```json
Response:
{
  "success": true,
  "transactions": [
    {
      "id": "uuid",
      "subscription_id": "uuid",
      "transaction_type": "recurring_payment",
      "amount": 99900,
      "amount_display": "₱999.00",
      "status": "completed",
      "created_at": "2025-01-01",
      "date_display": "January 1, 2025"
    }
  ],
  "count": 10
}
```

#### `GET /api/subscriptions/invoice/:transactionId`
Generate invoice for transaction
```json
Response:
{
  "success": true,
  "invoice": {
    "invoice_number": "INV-ABCD1234",
    "date": "2025-01-01",
    "vendor": {
      "name": "Juan Dela Cruz",
      "business_name": "Perfect Weddings Co.",
      "email": "vendor@example.com"
    },
    "items": [...],
    "subtotal": 99900,
    "total": 99900,
    "status": "paid"
  }
}
```

### 🚫 Cancellation Management

#### `PUT /api/subscriptions/cancel-immediate`
Cancel subscription immediately
```json
Request:
{
  "vendor_id": "uuid",
  "reason": "Moving to competitor"
}

Response:
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "subscription": {...},
  "effective_date": "immediate"
}
```

#### `PUT /api/subscriptions/cancel-at-period-end`
Schedule cancellation at billing period end
```json
Request:
{
  "vendor_id": "uuid"
}

Response:
{
  "success": true,
  "message": "Subscription will cancel at end of billing period",
  "subscription": {...},
  "effective_date": "2025-02-01"
}
```

#### `PUT /api/subscriptions/reactivate`
Reactivate cancelled subscription
```json
Request:
{
  "vendor_id": "uuid"
}

Response:
{
  "success": true,
  "message": "Subscription reactivated successfully",
  "subscription": {...}
}
```

### 📊 Usage & Analytics

#### `GET /api/subscriptions/usage/:vendorId`
Get current usage statistics
```json
Response:
{
  "success": true,
  "usage": {
    "services": {
      "current": 3,
      "limit": 5,
      "unlimited": false,
      "percentage": 60
    },
    "portfolio": {
      "current": 8,
      "limit": 10,
      "unlimited": false,
      "percentage": 80
    },
    "bookings_monthly": {
      "current": 15,
      "limit": -1,
      "unlimited": true,
      "percentage": 0
    },
    "messages_monthly": {
      "current": 45,
      "limit": 100,
      "unlimited": false,
      "percentage": 45
    }
  },
  "plan": {
    "name": "Free Tier",
    "tier": "basic"
  },
  "warnings": {
    "services_near_limit": false,
    "portfolio_near_limit": true,
    "bookings_near_limit": false,
    "messages_near_limit": false
  }
}
```

#### `POST /api/subscriptions/check-limit`
Check if action is allowed
```json
Request:
{
  "vendor_id": "uuid",
  "action": "create_service",
  "current_count": 4
}

Response:
{
  "success": true,
  "allowed": true,
  "plan": "basic",
  "limit": 5,
  "current": 4,
  "message": "Can create service",
  "upgrade_required": false
}
```

#### `GET /api/subscriptions/analytics/overview`
Get platform analytics (admin)
```json
Response:
{
  "success": true,
  "analytics": {
    "by_plan": [
      { "plan_name": "basic", "count": 150, "active_count": 145 },
      { "plan_name": "premium", "count": 50, "active_count": 48 }
    ],
    "revenue": {
      "total": 5000000,
      "total_display": "₱50,000",
      "transactions": 100,
      "average": 50000,
      "average_display": "₱500"
    },
    "monthly_revenue": [...],
    "churn": {
      "rate": "2.50",
      "cancelled_last_30_days": 5
    },
    "active_subscriptions": 193
  }
}
```

### 🔔 Webhooks & Automation

#### `POST /api/subscriptions/webhook`
PayMongo webhook handler
```json
Handles events:
- payment.paid → Activate subscription
- payment.failed → Mark as past_due
- source.chargeable → Create payment from e-wallet

Request:
{
  "data": {
    "id": "evt_xxx",
    "type": "event",
    "attributes": {
      "type": "payment.paid",
      "data": {...}
    }
  }
}

Response:
{
  "success": true,
  "received": true
}
```

#### `POST /api/subscriptions/process-recurring`
Process recurring billing (CRON job)
```json
Request:
{
  "cron_secret": "your-secret-key"
}

Response:
{
  "success": true,
  "results": {
    "processed": 50,
    "successful": 48,
    "failed": 2,
    "errors": [...]
  }
}
```

### 👑 Admin Endpoints

#### `POST /api/subscriptions/admin/create-manual`
Create subscription manually (admin)
```json
Request:
{
  "vendor_id": "uuid",
  "plan_name": "premium",
  "billing_cycle": "monthly",
  "duration_months": 3
}

Response:
{
  "success": true,
  "message": "Manual subscription created successfully",
  "subscription": {...}
}
```

#### `GET /api/subscriptions/all`
Get all subscriptions (admin)
```json
Response:
{
  "success": true,
  "subscriptions": [...],
  "count": 200
}
```

---

## 🗄️ DATABASE SCHEMA

### `vendor_subscriptions` Table
```sql
CREATE TABLE vendor_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(100) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  trial_end_date TIMESTAMP,
  next_billing_date TIMESTAMP NOT NULL,
  payment_method_id VARCHAR(255),
  paymongo_customer_id VARCHAR(255),
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendor_subscriptions_vendor_id ON vendor_subscriptions(vendor_id);
CREATE INDEX idx_vendor_subscriptions_status ON vendor_subscriptions(status);
CREATE INDEX idx_vendor_subscriptions_next_billing ON vendor_subscriptions(next_billing_date);
```

### `subscription_transactions` Table
```sql
CREATE TABLE subscription_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES vendor_subscriptions(id),
  transaction_type VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscription_transactions_subscription_id ON subscription_transactions(subscription_id);
CREATE INDEX idx_subscription_transactions_created_at ON subscription_transactions(created_at);
```

---

## 🔧 ENVIRONMENT VARIABLES

Add to `.env` and Render environment:

```bash
# PayMongo API Keys
PAYMONGO_SECRET_KEY=sk_live_YOUR_LIVE_KEY  # or sk_test_YOUR_TEST_KEY
PAYMONGO_PUBLIC_KEY=pk_live_YOUR_LIVE_KEY  # or pk_test_YOUR_TEST_KEY

# CRON Secret for recurring billing
CRON_SECRET=your-secure-random-string

# Frontend URL for redirects
FRONTEND_URL=https://weddingbazaar-web.web.app
```

---

## 🚀 DEPLOYMENT STEPS

### 1. Database Setup
```sql
-- Run in Neon SQL Editor
\i create-subscription-tables.sql
```

### 2. Backend Deployment
```bash
# Already registered in production-backend.js
app.use('/api/subscriptions', subscriptionsRouter);

# Deploy to Render
git add .
git commit -m "feat: Complete subscription system with PayMongo"
git push origin main
```

### 3. CRON Job Setup
```bash
# In Render Dashboard:
# 1. Create new CRON Job
# 2. Schedule: Daily at 2 AM
# 3. Command: curl -X POST https://weddingbazaar-web.onrender.com/api/subscriptions/process-recurring \
#             -H "Content-Type: application/json" \
#             -d '{"cron_secret":"YOUR_SECRET"}'
```

### 4. Webhook Setup
```bash
# In PayMongo Dashboard:
# 1. Go to Developers > Webhooks
# 2. Create webhook with URL:
#    https://weddingbazaar-web.onrender.com/api/subscriptions/webhook
# 3. Select events:
#    - payment.paid
#    - payment.failed
#    - source.chargeable
```

---

## 🧪 TESTING

### Test Card Numbers (PayMongo Test Mode)
```
Success: 4343 4343 4343 4345
Decline: 4571 7360 0000 0008
3D Secure: 4120 0000 0000 0007
```

### Test E-Wallets
```
GCash: Use test credentials in PayMongo docs
PayMaya: Use test credentials in PayMongo docs
GrabPay: Use test credentials in PayMongo docs
```

### Test Scenarios
1. ✅ Create free subscription (no payment)
2. ✅ Create paid subscription (card payment)
3. ✅ Start trial period
4. ✅ Upgrade with proration
5. ✅ Downgrade at period end
6. ✅ Update payment method
7. ✅ Cancel immediately
8. ✅ Cancel at period end
9. ✅ Reactivate subscription
10. ✅ Process recurring billing
11. ✅ Handle failed payment
12. ✅ Generate invoice

---

## 📱 FRONTEND INTEGRATION

### Example: Subscribe to Premium
```typescript
const subscribeToPremium = async () => {
  const response = await fetch(`${API_URL}/api/subscriptions/create-with-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      vendor_id: vendorId,
      plan_name: 'premium',
      billing_cycle: 'monthly',
      payment_method_details: {
        type: 'card',
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvc,
        name: cardholderName,
        email: email
      },
      start_trial: true
    })
  });

  const result = await response.json();
  
  if (result.success) {
    alert('✅ Subscription activated!');
    // Trigger subscription update event
    window.dispatchEvent(new Event('subscriptionUpdated'));
  }
};
```

### Example: Check Service Limit
```typescript
const canCreateService = async () => {
  const response = await fetch(`${API_URL}/api/subscriptions/check-limit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      vendor_id: vendorId,
      action: 'create_service',
      current_count: services.length
    })
  });

  const result = await response.json();
  
  if (!result.allowed) {
    showUpgradePrompt(result.message);
    return false;
  }
  
  return true;
};
```

---

## 🎯 BUSINESS LOGIC

### Subscription Lifecycle
```
1. Free Tier (Default)
   ↓
2. Trial Period (14-30 days) → Premium/Pro/Enterprise
   ↓
3. Active Subscription → Recurring billing
   ↓
4. Cancellation Request → Cancel at period end
   ↓
5. Cancelled → Can reactivate
```

### Payment Flow
```
1. User selects plan
   ↓
2. Enter payment details
   ↓
3. Create PayMongo customer
   ↓
4. Create payment intent
   ↓
5. Create payment method (tokenize card)
   ↓
6. Attach payment method to intent
   ↓
7. Process payment
   ↓
8. Activate subscription
   ↓
9. Log transaction
   ↓
10. Send confirmation email
```

### Recurring Billing Flow
```
1. CRON job runs daily at 2 AM
   ↓
2. Query subscriptions with next_billing_date <= today
   ↓
3. For each subscription:
   - Create payment intent
   - Attach saved payment method
   - Process payment
   ↓
4. If success:
   - Update next_billing_date
   - Log transaction
   - Send receipt email
   ↓
5. If failed:
   - Mark as past_due
   - Send payment failed email
   - Retry in 3 days
```

---

## 🎉 COMPLETE FEATURE SET

✅ **Subscription Management**
✅ **Payment Processing (Card + E-Wallet)**
✅ **Recurring Billing**
✅ **Trial Periods**
✅ **Proration Calculations**
✅ **Usage Tracking & Limits**
✅ **Payment Method Management**
✅ **Webhooks**
✅ **Invoice Generation**
✅ **Analytics & Reporting**
✅ **Admin Tools**
✅ **CRON Jobs**

---

**Ready for Production!** 🚀
