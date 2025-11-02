# 🏗️ COORDINATOR MODULES TO CREATE - MICRO ARCHITECTURE COMPLIANT

**Last Updated**: November 1, 2025  
**Status**: ✅ Ready for Implementation  
**Architecture**: Follows existing modular patterns

---

## 🎯 OBJECTIVE

Create all new coordinator advanced features using the **exact same modular architecture** as:
- ✅ `backend-deploy/routes/subscriptions/` (modular backend)
- ✅ `backend-deploy/routes/admin/` (modular backend)
- ✅ `src/pages/users/vendor/` (modular frontend)

---

## 📦 BACKEND MODULES TO CREATE

### Step 1: Create Modular Folder Structure

```powershell
# Create coordinator subfolder
mkdir backend-deploy\routes\coordinator

# Create module files
New-Item backend-deploy\routes\coordinator\index.cjs
New-Item backend-deploy\routes\coordinator\subscriptions.cjs
New-Item backend-deploy\routes\coordinator\profiles.cjs
New-Item backend-deploy\routes\coordinator\portfolio.cjs
New-Item backend-deploy\routes\coordinator\testimonials.cjs
New-Item backend-deploy\routes\coordinator\achievements.cjs
New-Item backend-deploy\routes\coordinator\specializations.cjs
New-Item backend-deploy\routes\coordinator\payment.cjs
New-Item backend-deploy\routes\coordinator\analytics.cjs
```

### New Backend Folder Structure

```
backend-deploy/routes/coordinator/
├── index.cjs                    # 🔑 Main router (aggregates all modules)
├── subscriptions.cjs            # Subscription CRUD, status, upgrade/downgrade
├── profiles.cjs                 # Profile CRUD, visibility settings
├── portfolio.cjs                # Portfolio item CRUD, image management
├── testimonials.cjs             # Testimonial CRUD, approval workflow
├── achievements.cjs             # Achievement CRUD, verification
├── specializations.cjs          # Specialization CRUD, feature lists
├── payment.cjs                  # PayMongo integration for subscriptions
└── analytics.cjs                # Coordinator analytics and stats
```

### Module Responsibilities

#### 1. **index.cjs** (Main Router)
**Purpose**: Aggregate all coordinator modules and register sub-routes

**Endpoints Structure**:
```
/api/coordinator/subscriptions/*     -> subscriptions.cjs
/api/coordinator/profiles/*          -> profiles.cjs
/api/coordinator/portfolio/*         -> portfolio.cjs
/api/coordinator/testimonials/*      -> testimonials.cjs
/api/coordinator/achievements/*      -> achievements.cjs
/api/coordinator/specializations/*   -> specializations.cjs
/api/coordinator/payment/*           -> payment.cjs
/api/coordinator/analytics/*         -> analytics.cjs
```

**Code Pattern** (follows `subscriptions/index.cjs`):
```javascript
const express = require('express');
const router = express.Router();

// Import all coordinator modules
const subscriptionsRoutes = require('./subscriptions.cjs');
const profilesRoutes = require('./profiles.cjs');
const portfolioRoutes = require('./portfolio.cjs');
const testimonialsRoutes = require('./testimonials.cjs');
const achievementsRoutes = require('./achievements.cjs');
const specializationsRoutes = require('./specializations.cjs');
const paymentRoutes = require('./payment.cjs');
const analyticsRoutes = require('./analytics.cjs');

// Register sub-routes
router.use('/subscriptions', subscriptionsRoutes);
router.use('/profiles', profilesRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/testimonials', testimonialsRoutes);
router.use('/achievements', achievementsRoutes);
router.use('/specializations', specializationsRoutes);
router.use('/payment', paymentRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
```

#### 2. **subscriptions.cjs** (Subscription Management)
**Endpoints**:
- `GET /api/coordinator/subscriptions/plans` - Get all available plans
- `GET /api/coordinator/subscriptions/current` - Get coordinator's current subscription
- `POST /api/coordinator/subscriptions/subscribe` - Subscribe to a plan
- `POST /api/coordinator/subscriptions/upgrade` - Upgrade to higher tier
- `POST /api/coordinator/subscriptions/downgrade` - Downgrade to lower tier
- `POST /api/coordinator/subscriptions/cancel` - Cancel subscription
- `GET /api/coordinator/subscriptions/usage` - Get usage stats
- `GET /api/coordinator/subscriptions/history` - Get payment history

**Database Tables**:
- `coordinator_subscription_plans` (read)
- `coordinator_subscriptions` (read/write)
- `coordinator_payments` (read/write)
- `coordinator_usage_tracking` (read/write)

#### 3. **profiles.cjs** (Profile Management)
**Endpoints**:
- `GET /api/coordinator/profiles/:id` - Get coordinator profile (public)
- `GET /api/coordinator/profiles/my` - Get own profile (private)
- `PUT /api/coordinator/profiles/update` - Update profile information
- `PUT /api/coordinator/profiles/visibility` - Update profile visibility
- `PUT /api/coordinator/profiles/banner` - Update profile banner image
- `GET /api/coordinator/profiles/stats` - Get profile statistics

**Database Tables**:
- `vendor_profiles` (read/write - coordinator profiles stored here)
- `coordinator_subscriptions` (read - check subscription tier for features)

#### 4. **portfolio.cjs** (Portfolio Management)
**Endpoints**:
- `GET /api/coordinator/portfolio` - Get all portfolio items
- `GET /api/coordinator/portfolio/:id` - Get single portfolio item
- `POST /api/coordinator/portfolio` - Create new portfolio item
- `PUT /api/coordinator/portfolio/:id` - Update portfolio item
- `DELETE /api/coordinator/portfolio/:id` - Delete portfolio item
- `PUT /api/coordinator/portfolio/:id/order` - Reorder portfolio items

**Database Tables**:
- `coordinator_portfolio` (read/write)

#### 5. **testimonials.cjs** (Testimonial Management)
**Endpoints**:
- `GET /api/coordinator/testimonials` - Get all testimonials
- `GET /api/coordinator/testimonials/:id` - Get single testimonial
- `POST /api/coordinator/testimonials` - Create new testimonial
- `PUT /api/coordinator/testimonials/:id` - Update testimonial
- `DELETE /api/coordinator/testimonials/:id` - Delete testimonial
- `PUT /api/coordinator/testimonials/:id/approve` - Approve testimonial
- `PUT /api/coordinator/testimonials/:id/feature` - Mark as featured

**Database Tables**:
- `coordinator_testimonials` (read/write)

#### 6. **achievements.cjs** (Achievement Management)
**Endpoints**:
- `GET /api/coordinator/achievements` - Get all achievements
- `GET /api/coordinator/achievements/:id` - Get single achievement
- `POST /api/coordinator/achievements` - Create new achievement
- `PUT /api/coordinator/achievements/:id` - Update achievement
- `DELETE /api/coordinator/achievements/:id` - Delete achievement
- `PUT /api/coordinator/achievements/:id/verify` - Mark as verified

**Database Tables**:
- `coordinator_achievements` (read/write)

#### 7. **specializations.cjs** (Specialization Management)
**Endpoints**:
- `GET /api/coordinator/specializations` - Get all specializations
- `GET /api/coordinator/specializations/:id` - Get single specialization
- `POST /api/coordinator/specializations` - Create new specialization
- `PUT /api/coordinator/specializations/:id` - Update specialization
- `DELETE /api/coordinator/specializations/:id` - Delete specialization

**Database Tables**:
- `coordinator_specializations` (read/write)

#### 8. **payment.cjs** (Payment Processing)
**Endpoints**:
- `POST /api/coordinator/payment/create-intent` - Create PayMongo payment intent
- `POST /api/coordinator/payment/confirm` - Confirm payment
- `POST /api/coordinator/payment/webhook` - PayMongo webhook handler
- `GET /api/coordinator/payment/history` - Get payment history

**Database Tables**:
- `coordinator_payments` (read/write)
- `coordinator_subscriptions` (write - update status after payment)

**Integration**:
- PayMongo API (existing pattern from `payments.cjs`)

#### 9. **analytics.cjs** (Analytics & Statistics)
**Endpoints**:
- `GET /api/coordinator/analytics/overview` - Dashboard statistics
- `GET /api/coordinator/analytics/weddings` - Wedding statistics
- `GET /api/coordinator/analytics/revenue` - Revenue analytics
- `GET /api/coordinator/analytics/subscription` - Subscription usage analytics

**Database Tables**:
- All coordinator tables (read-only for aggregation)

---

## 🎨 FRONTEND MODULES TO CREATE

### Step 1: Create Feature Folders

```powershell
# Subscription module
mkdir src\pages\users\coordinator\subscription
mkdir src\pages\users\coordinator\subscription\components
mkdir src\pages\users\coordinator\subscription\hooks
mkdir src\pages\users\coordinator\subscription\services
mkdir src\pages\users\coordinator\subscription\types

# Profile module
mkdir src\pages\users\coordinator\profile
mkdir src\pages\users\coordinator\profile\components
mkdir src\pages\users\coordinator\profile\hooks
mkdir src\pages\users\coordinator\profile\services
mkdir src\pages\users\coordinator\profile\types

# Portfolio module
mkdir src\pages\users\coordinator\portfolio
mkdir src\pages\users\coordinator\portfolio\components
mkdir src\pages\users\coordinator\portfolio\hooks
mkdir src\pages\users\coordinator\portfolio\services
mkdir src\pages\users\coordinator\portfolio\types

# Testimonials module
mkdir src\pages\users\coordinator\testimonials
mkdir src\pages\users\coordinator\testimonials\components
mkdir src\pages\users\coordinator\testimonials\hooks
mkdir src\pages\users\coordinator\testimonials\services
mkdir src\pages\users\coordinator\testimonials\types
```

### New Frontend Folder Structure

```
src/pages/users/coordinator/
├── subscription/                        # Subscription management
│   ├── CoordinatorSubscription.tsx      # Main page
│   ├── components/
│   │   ├── PlanCard.tsx                 # Plan display card
│   │   ├── PaymentModal.tsx             # Payment processing modal
│   │   ├── UsageStats.tsx               # Usage statistics display
│   │   └── index.ts                     # Component exports
│   ├── hooks/
│   │   ├── useSubscription.ts           # Subscription state management
│   │   └── usePayment.ts                # Payment processing hook
│   ├── services/
│   │   └── subscriptionService.ts       # API calls
│   ├── types/
│   │   └── subscription.types.ts        # TypeScript interfaces
│   └── index.ts                         # Main export
│
├── profile/                             # Profile management
│   ├── CoordinatorProfile.tsx           # Main profile page
│   ├── components/
│   │   ├── ProfileHeader.tsx            # Profile header with banner
│   │   ├── AboutSection.tsx             # About/bio section
│   │   ├── ContactSection.tsx           # Contact information
│   │   ├── PortfolioSection.tsx         # Portfolio showcase
│   │   ├── TestimonialSection.tsx       # Testimonials display
│   │   ├── AchievementSection.tsx       # Awards/certifications
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useProfile.ts                # Profile state management
│   │   └── usePortfolio.ts              # Portfolio management
│   ├── services/
│   │   ├── profileService.ts            # Profile API calls
│   │   ├── portfolioService.ts          # Portfolio API calls
│   │   └── testimonialService.ts        # Testimonial API calls
│   ├── types/
│   │   └── profile.types.ts             # TypeScript interfaces
│   └── index.ts
│
├── portfolio/                           # Portfolio editor
│   ├── PortfolioEditor.tsx              # Main editor page
│   ├── components/
│   │   ├── PortfolioGrid.tsx            # Portfolio item grid
│   │   ├── PortfolioItemCard.tsx        # Individual item card
│   │   ├── AddItemModal.tsx             # Add new item modal
│   │   ├── EditItemModal.tsx            # Edit item modal
│   │   └── index.ts
│   ├── hooks/
│   │   └── usePortfolioEditor.ts        # Editor state management
│   ├── services/
│   │   └── portfolioService.ts          # Portfolio API calls
│   ├── types/
│   │   └── portfolio.types.ts           # TypeScript interfaces
│   └── index.ts
│
└── testimonials/                        # Testimonial management
    ├── TestimonialManager.tsx           # Main manager page
    ├── components/
    │   ├── TestimonialList.tsx          # List of testimonials
    │   ├── TestimonialCard.tsx          # Individual card
    │   ├── AddTestimonialModal.tsx      # Add new modal
    │   ├── EditTestimonialModal.tsx     # Edit modal
    │   └── index.ts
    ├── hooks/
    │   └── useTestimonials.ts           # Testimonial state management
    ├── services/
    │   └── testimonialService.ts        # Testimonial API calls
    ├── types/
    │   └── testimonial.types.ts         # TypeScript interfaces
    └── index.ts
```

### Frontend Module Pattern

#### Module Structure (Example: Subscription)

**1. Main Component** (`CoordinatorSubscription.tsx`):
```tsx
import React, { useState, useEffect } from 'react';
import { CoordinatorHeader } from '../layout/CoordinatorHeader';
import { PlanCard } from './components/PlanCard';
import { PaymentModal } from './components/PaymentModal';
import { useSubscription } from './hooks/useSubscription';
import { subscriptionService } from './services/subscriptionService';
import type { SubscriptionPlan } from './types/subscription.types';

export const CoordinatorSubscription: React.FC = () => {
  // Component logic here
};
```

**2. Custom Hook** (`hooks/useSubscription.ts`):
```typescript
import { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import type { Subscription } from '../types/subscription.types';

export const useSubscription = () => {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    // Load subscription logic
  };

  return { currentSubscription, loading };
};
```

**3. Service Layer** (`services/subscriptionService.ts`):
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const subscriptionService = {
  async getPlans() {
    const response = await fetch(`${API_URL}/api/coordinator/subscriptions/plans`);
    return await response.json();
  },

  async getCurrentSubscription() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/api/coordinator/subscriptions/current`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  // More methods...
};
```

**4. TypeScript Types** (`types/subscription.types.ts`):
```typescript
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    maxWeddings: number;
    maxVendors: number;
    maxTeamMembers: number;
  };
}

export interface Subscription {
  id: string;
  coordinatorId: string;
  planId: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
}
```

**5. Export Barrel** (`index.ts`):
```typescript
export { CoordinatorSubscription } from './CoordinatorSubscription';
export * from './types/subscription.types';
```

---

## 🔗 ROUTE REGISTRATION

### Backend Registration

**File**: `backend-deploy/production-backend.js`

```javascript
// Add import at top
const coordinatorRoutes = require('./routes/coordinator/index.cjs'); // NEW MODULAR coordinator system

// Register route (around line 220, with other routes)
app.use('/api/coordinator', coordinatorRoutes); // NEW modular coordinator endpoints
```

### Frontend Registration

**File**: `src/router/AppRouter.tsx`

```tsx
// Add imports
import { CoordinatorSubscription } from '../pages/users/coordinator/subscription';
import { CoordinatorProfile } from '../pages/users/coordinator/profile';
import { PortfolioEditor } from '../pages/users/coordinator/portfolio';
import { TestimonialManager } from '../pages/users/coordinator/testimonials';

// Add routes (inside coordinator section)
<Route path="/coordinator" element={
  <RoleProtectedRoute allowedRoles={['coordinator']} requireAuth={true}>
    <CoordinatorLanding />
  </RoleProtectedRoute>
}>
  {/* Existing routes */}
  <Route path="dashboard" element={<CoordinatorDashboard />} />
  <Route path="weddings" element={<CoordinatorWeddings />} />
  
  {/* NEW ROUTES */}
  <Route path="subscription" element={<CoordinatorSubscription />} />
  <Route path="profile" element={<CoordinatorProfile />} />
  <Route path="portfolio" element={<PortfolioEditor />} />
  <Route path="testimonials" element={<TestimonialManager />} />
</Route>
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Backend Modules
- [ ] Create `backend-deploy/routes/coordinator/` folder
- [ ] Create `index.cjs` (main router)
- [ ] Create `subscriptions.cjs`
- [ ] Create `profiles.cjs`
- [ ] Create `portfolio.cjs`
- [ ] Create `testimonials.cjs`
- [ ] Create `achievements.cjs`
- [ ] Create `specializations.cjs`
- [ ] Create `payment.cjs`
- [ ] Create `analytics.cjs`
- [ ] Register in `production-backend.js`
- [ ] Test all endpoints with curl/Postman
- [ ] Deploy to Render

### Frontend Modules
- [ ] Create `subscription/` feature folder
- [ ] Create `profile/` feature folder
- [ ] Create `portfolio/` feature folder
- [ ] Create `testimonials/` feature folder
- [ ] Implement all components
- [ ] Implement all hooks
- [ ] Implement all services
- [ ] Implement all TypeScript types
- [ ] Register routes in `AppRouter.tsx`
- [ ] Test navigation and API integration
- [ ] Deploy to Firebase

---

## 🚀 TESTING AFTER EACH MODULE

### Backend Testing
```powershell
# Test subscription endpoint
curl http://localhost:3001/api/coordinator/subscriptions/plans

# Test with authentication
curl -H "Authorization: Bearer [TOKEN]" http://localhost:3001/api/coordinator/subscriptions/current

# Check route registration
curl http://localhost:3001/api/health
```

### Frontend Testing
```powershell
# Start dev server
npm run dev

# Navigate to: http://localhost:5173/coordinator/subscription
# Navigate to: http://localhost:5173/coordinator/profile
# Navigate to: http://localhost:5173/coordinator/portfolio
# Navigate to: http://localhost:5173/coordinator/testimonials

# Check browser console for errors
# Verify API calls in Network tab
```

---

## 📚 ARCHITECTURE COMPLIANCE

| Aspect | Pattern | Compliant? |
|--------|---------|------------|
| **Backend Structure** | Modular subfolder with index.cjs | ✅ Yes |
| **Frontend Structure** | Feature folder with components/hooks/services | ✅ Yes |
| **Route Registration** | Centralized in main server/router | ✅ Yes |
| **Authentication** | JWT middleware on protected routes | ✅ Yes |
| **Database Layer** | Neon PostgreSQL with connection pooling | ✅ Yes |
| **TypeScript Types** | Separate types/ folder | ✅ Yes |
| **Service Layer** | Separate services/ files | ✅ Yes |

---

## 🔗 RELATED DOCUMENTATION

- [Micro Architecture Alignment](./COORDINATOR_MICRO_ARCHITECTURE_ALIGNMENT.md) - Full architecture guide
- [Advanced Features Plan](./COORDINATOR_ADVANCED_FEATURES_PLAN.md) - Feature specifications
- [Database Mapping](./COORDINATOR_DATABASE_MAPPING_PLAN.md) - Database schema and queries
- [Implementation Checklist](./COORDINATOR_ADVANCED_IMPLEMENTATION_CHECKLIST.md) - Task list

---

**Status**: ✅ Ready to Implement  
**Next Step**: Create backend folder structure and implement index.cjs  
**Estimated Time**: 1-2 weeks for all modules
