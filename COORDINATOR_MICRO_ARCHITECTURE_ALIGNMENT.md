# 🏗️ COORDINATOR ADVANCED FEATURES - MICRO ARCHITECTURE ALIGNMENT

**Last Updated**: November 1, 2025  
**Status**: ✅ ARCHITECTURE ALIGNED - READY FOR IMPLEMENTATION  
**Project**: Wedding Bazaar - Coordinator Subscription & Profile System

---

## 📋 EXECUTIVE SUMMARY

This document ensures the coordinator advanced features (subscriptions, profiles, portfolios) **follow the exact same micro frontend/backend architecture** as the existing Wedding Bazaar system.

### Current System Architecture (Verified)

✅ **Backend Structure** (Modular Routes):
```
backend-deploy/
├── routes/
│   ├── auth.cjs                    # User authentication
│   ├── bookings.cjs                # Booking management
│   ├── vendors.cjs                 # Vendor operations
│   ├── services.cjs                # Service listings
│   ├── coordinator.cjs             # ✅ EXISTING coordinator routes
│   ├── subscriptions/              # ✅ EXISTING subscription system
│   │   └── index.cjs
│   ├── admin/                      # ✅ EXISTING modular admin
│   │   └── index.cjs
│   └── wallet.cjs                  # ✅ EXISTING wallet system
└── production-backend.js           # Main server (route registration)
```

✅ **Frontend Structure** (Micro Frontends):
```
src/pages/users/
├── individual/                     # Couple/Individual micro app
│   ├── dashboard/
│   ├── bookings/
│   ├── services/
│   └── ...
├── vendor/                         # Vendor micro app
│   ├── dashboard/
│   ├── bookings/
│   ├── services/
│   └── subscription/               # ✅ EXISTING vendor subscription
├── admin/                          # Admin micro app
│   ├── dashboard/
│   ├── users/
│   ├── vendors/
│   └── ...
└── coordinator/                    # ✅ EXISTING coordinator micro app
    ├── dashboard/
    ├── weddings/
    ├── vendors/
    ├── clients/
    ├── analytics/
    ├── calendar/
    ├── team/
    ├── whitelabel/
    └── integrations/
```

✅ **Router** (Role-based routing):
```typescript
// AppRouter.tsx
- RoleProtectedRoute components
- /individual/* routes
- /vendor/* routes
- /admin/* routes
- /coordinator/* routes
```

---

## 🎯 ALIGNMENT STRATEGY

### What We're Adding (Following Existing Patterns)

#### 1. **Backend Routes** (Follow `subscriptions/`, `admin/`, `wallet.cjs` patterns)

**NEW: Modular Coordinator Subscription Routes**
```
backend-deploy/routes/
├── coordinator-subscriptions/      # NEW FOLDER (follows subscriptions/ pattern)
│   ├── index.cjs                   # Main exports
│   ├── plans.cjs                   # Subscription plans CRUD
│   ├── subscribe.cjs               # Subscribe/upgrade/cancel logic
│   ├── usage.cjs                   # Usage tracking and limits
│   ├── payments.cjs                # PayMongo subscription payments
│   └── features.cjs                # Feature access control
└── coordinator-profiles/           # NEW FOLDER (follows admin/ pattern)
    ├── index.cjs                   # Main exports
    ├── profiles.cjs                # Enhanced profile CRUD
    ├── portfolio.cjs               # Portfolio management
    ├── testimonials.cjs            # Testimonials system
    ├── specializations.cjs         # Specializations
    └── achievements.cjs            # Achievements/badges
```

#### 2. **Frontend Pages** (Follow existing `/coordinator/*` structure)

**NEW: Subscription & Profile Pages**
```
src/pages/users/coordinator/
├── subscription/                   # NEW (follows vendor/subscription/)
│   ├── CoordinatorSubscription.tsx # Main subscription dashboard
│   ├── PricingPlans.tsx            # Plan comparison
│   ├── UpgradeModal.tsx            # Upgrade flow
│   ├── PaymentModal.tsx            # PayMongo integration
│   └── index.ts
├── profile/                        # NEW (follows vendor/profile/)
│   ├── CoordinatorProfile.tsx      # Enhanced profile editor
│   ├── ProfileCompletion.tsx       # Progress widget
│   └── index.ts
├── portfolio/                      # NEW
│   ├── PortfolioManager.tsx        # Portfolio CRUD
│   ├── AddPortfolioModal.tsx       # Add wedding showcase
│   └── index.ts
└── testimonials/                   # NEW
    ├── TestimonialsManager.tsx     # Manage reviews
    ├── RequestModal.tsx            # Request from clients
    └── index.ts
```

---

## 🔧 IMPLEMENTATION BREAKDOWN (MICRO ARCHITECTURE)

### PHASE 1: Backend - Modular Route Structure

#### Step 1.1: Create Coordinator Subscription Module (Follow `subscriptions/` pattern)

**File**: `backend-deploy/routes/coordinator-subscriptions/index.cjs`

```javascript
// Main exports for coordinator subscription routes
// Follows pattern from: backend-deploy/routes/subscriptions/index.cjs

const express = require('express');
const router = express.Router();

// Import sub-route modules
const plansRouter = require('./plans.cjs');
const subscribeRouter = require('./subscribe.cjs');
const usageRouter = require('./usage.cjs');
const paymentsRouter = require('./payments.cjs');
const featuresRouter = require('./features.cjs');

// Mount sub-routes
router.use('/plans', plansRouter);
router.use('/subscribe', subscribeRouter);
router.use('/usage', usageRouter);
router.use('/payments', paymentsRouter);
router.use('/features', featuresRouter);

module.exports = router;
```

**File**: `backend-deploy/routes/coordinator-subscriptions/plans.cjs`

```javascript
const express = require('express');
const router = express.Router();
const { sql } = require('../../config/database.cjs');
const { authenticateToken } = require('../../middleware/auth.cjs');

/**
 * GET /api/coordinator/subscriptions/plans
 * Get all available subscription plans
 */
router.get('/', async (req, res) => {
  try {
    const plans = await sql`
      SELECT 
        id, plan_code, display_name, description,
        price_monthly, price_annual, currency,
        commission_rate,
        max_active_weddings, max_clients, max_portfolio_items,
        has_portfolio_showcase, has_client_testimonials,
        has_featured_badge, has_ai_assistant, has_white_label,
        support_type, is_popular, sort_order
      FROM coordinator_subscription_plans
      WHERE is_active = true
      ORDER BY sort_order ASC
    `;

    res.json({
      success: true,
      plans: plans
    });
  } catch (error) {
    console.error('❌ Error fetching subscription plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription plans'
    });
  }
});

/**
 * GET /api/coordinator/subscriptions/plans/:planCode
 * Get specific plan details
 */
router.get('/:planCode', async (req, res) => {
  try {
    const { planCode } = req.params;
    
    const plan = await sql`
      SELECT * FROM coordinator_subscription_plans
      WHERE plan_code = ${planCode} AND is_active = true
    `;

    if (plan.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription plan not found'
      });
    }

    res.json({
      success: true,
      plan: plan[0]
    });
  } catch (error) {
    console.error('❌ Error fetching plan details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plan details'
    });
  }
});

module.exports = router;
```

**File**: `backend-deploy/routes/coordinator-subscriptions/subscribe.cjs`

```javascript
const express = require('express');
const router = express.Router();
const { sql } = require('../../config/database.cjs');
const { authenticateToken } = require('../../middleware/auth.cjs');

/**
 * GET /api/coordinator/subscriptions/current
 * Get coordinator's current subscription
 */
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id;

    const subscription = await sql`
      SELECT 
        cs.*,
        csp.plan_code, csp.display_name as plan_name,
        csp.price_monthly, csp.price_annual,
        csp.commission_rate,
        csp.max_active_weddings, csp.max_clients,
        CASE 
          WHEN csp.max_active_weddings IS NULL THEN true
          WHEN cs.current_active_weddings < csp.max_active_weddings THEN true
          ELSE false
        END as can_add_wedding,
        CASE
          WHEN csp.max_clients IS NULL THEN true
          WHEN cs.current_clients < csp.max_clients THEN true
          ELSE false
        END as can_add_client
      FROM coordinator_subscriptions cs
      LEFT JOIN coordinator_subscription_plans csp ON cs.plan_id = csp.id
      WHERE cs.coordinator_id = ${coordinatorId}
      LIMIT 1
    `;

    if (subscription.length === 0) {
      // No subscription, return FREE plan info
      const freePlan = await sql`
        SELECT * FROM coordinator_subscription_plans
        WHERE plan_code = 'FREE_STARTER'
      `;

      return res.json({
        success: true,
        subscription: null,
        default_plan: freePlan[0],
        message: 'No active subscription, using FREE plan'
      });
    }

    res.json({
      success: true,
      subscription: subscription[0]
    });
  } catch (error) {
    console.error('❌ Error fetching current subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription'
    });
  }
});

/**
 * POST /api/coordinator/subscriptions/subscribe
 * Subscribe to a new plan or upgrade
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { plan_code, billing_cycle, payment_method_id } = req.body;

    // Validation
    if (!plan_code || !billing_cycle) {
      return res.status(400).json({
        success: false,
        error: 'plan_code and billing_cycle are required'
      });
    }

    // Get plan details
    const plan = await sql`
      SELECT * FROM coordinator_subscription_plans
      WHERE plan_code = ${plan_code} AND is_active = true
    `;

    if (plan.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invalid plan code'
      });
    }

    const selectedPlan = plan[0];
    const amount = billing_cycle === 'annual' 
      ? selectedPlan.price_annual 
      : selectedPlan.price_monthly;

    // Check if already subscribed
    const existing = await sql`
      SELECT * FROM coordinator_subscriptions
      WHERE coordinator_id = ${coordinatorId}
    `;

    if (existing.length > 0) {
      // Upgrade/downgrade logic
      return res.status(400).json({
        success: false,
        error: 'Already subscribed. Use /change-plan endpoint to upgrade/downgrade'
      });
    }

    // Create subscription
    const startDate = new Date();
    const endDate = new Date();
    if (billing_cycle === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscription = await sql`
      INSERT INTO coordinator_subscriptions (
        coordinator_id, plan_id, status, billing_cycle,
        amount, currency,
        current_period_start, current_period_end,
        next_billing_date, payment_method
      ) VALUES (
        ${coordinatorId}, ${selectedPlan.id}, 'active', ${billing_cycle},
        ${amount}, 'PHP',
        ${startDate.toISOString()}, ${endDate.toISOString()},
        ${endDate.toISOString()}, ${payment_method_id || 'card'}
      ) RETURNING *
    `;

    // Log subscription audit
    await sql`
      INSERT INTO coordinator_subscription_audit (
        coordinator_id, subscription_id, action, new_plan_code, description
      ) VALUES (
        ${coordinatorId}, ${subscription[0].id}, 'subscription_created',
        ${plan_code}, 'Subscribed to ' || ${selectedPlan.display_name}
      )
    `;

    res.json({
      success: true,
      subscription: subscription[0],
      message: `Successfully subscribed to ${selectedPlan.display_name}`
    });
  } catch (error) {
    console.error('❌ Error creating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
});

/**
 * PUT /api/coordinator/subscriptions/change-plan
 * Upgrade or downgrade plan
 */
router.put('/change-plan', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { new_plan_code, prorate } = req.body;

    // Get current subscription
    const current = await sql`
      SELECT cs.*, csp.plan_code as old_plan_code
      FROM coordinator_subscriptions cs
      LEFT JOIN coordinator_subscription_plans csp ON cs.plan_id = csp.id
      WHERE cs.coordinator_id = ${coordinatorId}
    `;

    if (current.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    // Get new plan
    const newPlan = await sql`
      SELECT * FROM coordinator_subscription_plans
      WHERE plan_code = ${new_plan_code} AND is_active = true
    `;

    if (newPlan.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invalid new plan code'
      });
    }

    const currentSub = current[0];
    const selectedPlan = newPlan[0];

    // Calculate new amount (handle proration if needed)
    const newAmount = currentSub.billing_cycle === 'annual'
      ? selectedPlan.price_annual
      : selectedPlan.price_monthly;

    // Update subscription
    const updated = await sql`
      UPDATE coordinator_subscriptions
      SET 
        plan_id = ${selectedPlan.id},
        amount = ${newAmount},
        updated_at = NOW()
      WHERE coordinator_id = ${coordinatorId}
      RETURNING *
    `;

    // Log audit
    await sql`
      INSERT INTO coordinator_subscription_audit (
        coordinator_id, subscription_id, action,
        old_plan_code, new_plan_code, description
      ) VALUES (
        ${coordinatorId}, ${updated[0].id}, 'plan_changed',
        ${currentSub.old_plan_code}, ${new_plan_code},
        'Changed plan from ' || ${currentSub.old_plan_code} || ' to ' || ${new_plan_code}
      )
    `;

    res.json({
      success: true,
      subscription: updated[0],
      message: `Successfully changed plan to ${selectedPlan.display_name}`
    });
  } catch (error) {
    console.error('❌ Error changing plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change plan'
    });
  }
});

/**
 * POST /api/coordinator/subscriptions/cancel
 * Cancel subscription
 */
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { cancel_at_period_end, reason } = req.body;

    const updated = await sql`
      UPDATE coordinator_subscriptions
      SET 
        cancel_at_period_end = ${cancel_at_period_end || true},
        cancelled_at = NOW(),
        notes = ${reason || 'User requested cancellation'}
      WHERE coordinator_id = ${coordinatorId}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    // Log audit
    await sql`
      INSERT INTO coordinator_subscription_audit (
        coordinator_id, subscription_id, action, description
      ) VALUES (
        ${coordinatorId}, ${updated[0].id}, 'subscription_cancelled',
        'Subscription cancelled: ' || ${reason || 'User request'}
      )
    `;

    res.json({
      success: true,
      subscription: updated[0],
      message: cancel_at_period_end 
        ? 'Subscription will cancel at end of billing period'
        : 'Subscription cancelled immediately'
    });
  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
});

module.exports = router;
```

---

#### Step 1.2: Register Routes in Main Server (Follow existing pattern)

**File**: `backend-deploy/production-backend.js`

```javascript
// ...existing imports...

// ADD NEW IMPORTS (follow subscriptions pattern)
const coordinatorSubscriptionRoutes = require('./routes/coordinator-subscriptions/index.cjs');
const coordinatorProfileRoutes = require('./routes/coordinator-profiles/index.cjs');

// ...existing middleware...

// ADD NEW ROUTES (follow existing pattern)
app.use('/api/coordinator/subscriptions', coordinatorSubscriptionRoutes); // NEW
app.use('/api/coordinator/profiles', coordinatorProfileRoutes);           // NEW

// Keep existing coordinator routes
app.use('/api/coordinator', require('./routes/coordinator.cjs')); // EXISTING weddings, clients, etc.

// ...rest of existing code...
```

---

### PHASE 2: Frontend - Micro Frontend Pages

#### Step 2.1: Create Subscription Module (Follow `vendor/subscription/` pattern)

**File**: `src/pages/users/coordinator/subscription/CoordinatorSubscription.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/shared/contexts/HybridAuthContext';
import axios from 'axios';
import { PricingPlans } from './PricingPlans';
import { UpgradeModal } from './UpgradeModal';

interface SubscriptionData {
  plan_code: string;
  display_name: string;
  status: string;
  current_period_end: string;
  next_billing_date: string;
  amount: number;
  current_active_weddings: number;
  max_active_weddings: number | null;
  can_add_wedding: boolean;
}

const CoordinatorSubscription: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/coordinator/subscriptions/subscribe/current`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSubscription(response.data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading subscription...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💎 Coordinator Subscription
          </h1>
          <p className="text-lg text-gray-600">
            Manage your subscription and unlock premium features
          </p>
        </div>

        {/* Current Subscription Card */}
        {subscription && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {subscription.plan_name}
                </h2>
                <p className="text-gray-600">Status: {subscription.status}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-pink-600">
                  ₱{subscription.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">per month</p>
              </div>
            </div>

            {/* Usage Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-pink-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Active Weddings</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-pink-600">
                    {subscription.current_active_weddings}
                  </span>
                  {subscription.max_active_weddings && (
                    <span className="text-gray-500 mb-1">
                      / {subscription.max_active_weddings}
                    </span>
                  )}
                </div>
                {!subscription.can_add_wedding && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Limit reached - Upgrade to add more
                  </p>
                )}
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Next Billing</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(subscription.next_billing_date).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Commission Rate</p>
                <p className="text-3xl font-bold text-blue-600">
                  {subscription.commission_rate}%
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowUpgrade(true)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 
                         text-white font-semibold rounded-lg hover:shadow-lg 
                         transition-all hover:scale-105"
              >
                Upgrade Plan
              </button>
              <button
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 
                         font-semibold rounded-lg hover:border-gray-400 
                         transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <PricingPlans currentPlan={subscription?.plan_code} />

        {/* Upgrade Modal */}
        {showUpgrade && (
          <UpgradeModal
            currentPlan={subscription?.plan_code || 'FREE_STARTER'}
            onClose={() => setShowUpgrade(false)}
            onSuccess={fetchSubscription}
          />
        )}
      </div>
    </div>
  );
};

export default CoordinatorSubscription;
```

---

#### Step 2.2: Add Routes to AppRouter (Follow existing pattern)

**File**: `src/router/AppRouter.tsx`

```typescript
// ...existing imports...

// ADD NEW IMPORT
import { CoordinatorSubscription } from '../pages/users/coordinator/subscription';

// ...inside Routes component...

{/* EXISTING Coordinator Routes */}
<Route path="/coordinator" element={
  <RoleProtectedRoute allowedRoles={['couple']}>
    <CoordinatorLanding />
  </RoleProtectedRoute>
} />

<Route path="/coordinator/dashboard" element={
  <RoleProtectedRoute allowedRoles={['couple']}>
    <CoordinatorDashboard />
  </RoleProtectedRoute>
} />

{/* ADD NEW Route */}
<Route path="/coordinator/subscription" element={
  <RoleProtectedRoute allowedRoles={['couple']}>
    <CoordinatorSubscription />
  </RoleProtectedRoute>
} />

{/* ...rest of coordinator routes... */}
```

---

## ✅ IMPLEMENTATION CHECKLIST (ALIGNED WITH MICRO ARCHITECTURE)

### Backend (Modular Routes)

#### Coordinator Subscriptions Module
- [ ] Create `backend-deploy/routes/coordinator-subscriptions/` folder
- [ ] Create `index.cjs` (main exports)
- [ ] Create `plans.cjs` (GET plans, GET plan details)
- [ ] Create `subscribe.cjs` (GET current, POST subscribe, PUT change-plan, POST cancel)
- [ ] Create `usage.cjs` (GET usage limits, POST increment counters)
- [ ] Create `payments.cjs` (POST process-payment, GET payment-history)
- [ ] Create `features.cjs` (GET can-access/:feature)
- [ ] Register routes in `production-backend.js`

#### Coordinator Profiles Module
- [ ] Create `backend-deploy/routes/coordinator-profiles/` folder
- [ ] Create `index.cjs` (main exports)
- [ ] Create `profiles.cjs` (GET profile, PUT update)
- [ ] Create `portfolio.cjs` (CRUD for portfolio items)
- [ ] Create `testimonials.cjs` (CRUD for testimonials)
- [ ] Create `specializations.cjs` (CRUD for specializations)
- [ ] Create `achievements.cjs` (GET achievements, POST award)
- [ ] Register routes in `production-backend.js`

#### Testing
- [ ] Test all endpoints with Postman/Thunder Client
- [ ] Verify authentication middleware works
- [ ] Test error handling
- [ ] Test database transactions

---

### Frontend (Micro Frontend Pages)

#### Subscription Module
- [ ] Create `src/pages/users/coordinator/subscription/` folder
- [ ] Create `CoordinatorSubscription.tsx` (main page)
- [ ] Create `PricingPlans.tsx` (4-tier comparison)
- [ ] Create `UpgradeModal.tsx` (upgrade flow with PayMongo)
- [ ] Create `UsageMetrics.tsx` (usage display)
- [ ] Create `index.ts` (exports)
- [ ] Add route to `AppRouter.tsx`

#### Profile Module
- [ ] Create `src/pages/users/coordinator/profile/` folder
- [ ] Create `CoordinatorProfile.tsx` (enhanced profile editor)
- [ ] Create `ProfileCompletion.tsx` (progress widget)
- [ ] Create `SocialMediaSection.tsx` (social links)
- [ ] Create `index.ts` (exports)
- [ ] Add route to `AppRouter.tsx`

#### Portfolio Module
- [ ] Create `src/pages/users/coordinator/portfolio/` folder
- [ ] Create `PortfolioManager.tsx` (portfolio CRUD)
- [ ] Create `AddPortfolioModal.tsx` (add wedding showcase)
- [ ] Create `PortfolioCard.tsx` (individual portfolio item)
- [ ] Create `index.ts` (exports)
- [ ] Add route to `AppRouter.tsx`

#### Testing
- [ ] Test all components render correctly
- [ ] Test API integration
- [ ] Test authentication flow
- [ ] Test responsive design (mobile/tablet/desktop)

---

## 🗂️ FILE STRUCTURE COMPARISON

### Existing System (For Reference)

**Vendor Subscription** (Currently Working):
```
backend-deploy/routes/
└── subscriptions/
    └── index.cjs                 # Vendor subscription routes

src/pages/users/vendor/
└── subscription/
    └── VendorSubscriptionPage.tsx
```

**Admin System** (Currently Working):
```
backend-deploy/routes/
└── admin/
    └── index.cjs                 # Modular admin routes

src/pages/users/admin/
├── dashboard/
├── users/
├── vendors/
└── ...
```

---

### New Coordinator System (Follows Same Pattern)

**Coordinator Subscription** (New):
```
backend-deploy/routes/
└── coordinator-subscriptions/    # NEW (follows subscriptions/ pattern)
    ├── index.cjs
    ├── plans.cjs
    ├── subscribe.cjs
    ├── usage.cjs
    ├── payments.cjs
    └── features.cjs

src/pages/users/coordinator/
├── subscription/                 # NEW (follows vendor/subscription/ pattern)
│   ├── CoordinatorSubscription.tsx
│   ├── PricingPlans.tsx
│   ├── UpgradeModal.tsx
│   └── index.ts
├── profile/                      # NEW
│   ├── CoordinatorProfile.tsx
│   └── index.ts
└── portfolio/                    # NEW
    ├── PortfolioManager.tsx
    └── index.ts
```

---

## 🎯 KEY DIFFERENCES FROM ORIGINAL PLAN

### Original Plan (Generic)
- Single `coordinator-weddings.cjs` file with all routes
- Single `CoordinatorDashboard.tsx` with all features
- Generic API structure

### Aligned Plan (Micro Architecture)
✅ **Modular Backend**: Split into `coordinator-subscriptions/` and `coordinator-profiles/` folders (like `subscriptions/` and `admin/`)
✅ **Micro Frontend Pages**: Each feature is a separate folder under `/coordinator/` (like `/vendor/` and `/admin/`)
✅ **Route Registration**: Follows exact same pattern as existing routes in `production-backend.js`
✅ **Authentication**: Uses existing `authenticateToken` middleware
✅ **Database Connection**: Uses existing `sql` from `config/database.cjs`

---

## 🚀 NEXT STEPS (IN ORDER)

### Day 1: Backend Module 1 (Subscriptions)
1. Create `backend-deploy/routes/coordinator-subscriptions/` folder
2. Create all 6 files (index, plans, subscribe, usage, payments, features)
3. Register routes in `production-backend.js`
4. Test with Postman

### Day 2: Backend Module 2 (Profiles)
1. Create `backend-deploy/routes/coordinator-profiles/` folder
2. Create all 6 files (index, profiles, portfolio, testimonials, specializations, achievements)
3. Register routes in `production-backend.js`
4. Test with Postman

### Day 3: Frontend Module 1 (Subscription)
1. Create `src/pages/users/coordinator/subscription/` folder
2. Create all 4 components
3. Add route to `AppRouter.tsx`
4. Test in browser

### Day 4: Frontend Module 2 (Profile & Portfolio)
1. Create profile and portfolio folders
2. Create all components
3. Add routes to `AppRouter.tsx`
4. Test in browser

### Day 5: Integration Testing
1. Test complete subscription flow
2. Test profile updates
3. Test portfolio CRUD
4. Test authentication
5. Test error handling

---

## 📊 PROGRESS TRACKING

### Backend Routes (/api/coordinator/subscriptions/*)
- [ ] GET /plans (list all plans)
- [ ] GET /plans/:planCode (single plan)
- [ ] GET /subscribe/current (current subscription)
- [ ] POST /subscribe (create subscription)
- [ ] PUT /subscribe/change-plan (upgrade/downgrade)
- [ ] POST /subscribe/cancel (cancel subscription)
- [ ] GET /usage (get usage limits)
- [ ] POST /usage/increment-wedding (increment counter)
- [ ] POST /usage/increment-client (increment counter)
- [ ] POST /payments/process (process subscription payment)
- [ ] GET /payments/history (payment history)
- [ ] GET /features/can-access/:feature (check feature access)

### Backend Routes (/api/coordinator/profiles/*)
- [ ] GET /profiles (get coordinator profile)
- [ ] PUT /profiles (update profile)
- [ ] GET /profiles/completion (completion status)
- [ ] GET /portfolio (get portfolio items)
- [ ] POST /portfolio (add portfolio item)
- [ ] PUT /portfolio/:id (update portfolio item)
- [ ] DELETE /portfolio/:id (delete portfolio item)
- [ ] GET /testimonials (get testimonials)
- [ ] POST /testimonials (add testimonial)
- [ ] GET /specializations (get specializations)
- [ ] POST /specializations (add specialization)
- [ ] GET /achievements (get achievements)

### Frontend Pages (/coordinator/*)
- [ ] /subscription (subscription dashboard)
- [ ] /subscription/plans (pricing comparison)
- [ ] /profile (enhanced profile editor)
- [ ] /portfolio (portfolio manager)
- [ ] /testimonials (testimonials manager)

---

## ✅ VALIDATION CHECKLIST

### Architecture Alignment
- [ ] Backend follows modular folder structure (like `subscriptions/`, `admin/`)
- [ ] Routes registered in `production-backend.js` (like existing routes)
- [ ] Frontend follows `/users/[role]/[feature]/` structure
- [ ] Routes added to `AppRouter.tsx` with `RoleProtectedRoute`
- [ ] Uses existing `authenticateToken` middleware
- [ ] Uses existing database connection (`sql` from `config/database.cjs`)

### Code Quality
- [ ] All files have proper error handling
- [ ] All endpoints return consistent JSON format (`{success, data/error}`)
- [ ] All components have TypeScript interfaces
- [ ] All components use existing design system (Tailwind classes)
- [ ] All API calls use `axios` with proper error handling

### Testing
- [ ] All backend endpoints tested with Postman
- [ ] All frontend pages tested in browser
- [ ] Authentication flow tested
- [ ] Error handling tested
- [ ] Mobile responsive design tested

---

## 🎉 CONCLUSION

This plan ensures the coordinator advanced features (subscriptions, profiles, portfolios) **perfectly align with your existing micro frontend/backend architecture**.

**Key Alignment Points**:
1. ✅ **Modular Backend Routes** (like `subscriptions/`, `admin/`)
2. ✅ **Micro Frontend Structure** (like `/vendor/`, `/admin/`)
3. ✅ **Existing Patterns** (authentication, database, error handling)
4. ✅ **Existing Design System** (Tailwind, wedding theme)

**Ready to implement?** Start with Day 1: Backend Module 1 (Subscriptions)

---

**Last Updated**: November 1, 2025  
**Status**: ✅ ARCHITECTURE ALIGNED - READY TO CODE  
**Next**: Create `backend-deploy/routes/coordinator-subscriptions/` folder
