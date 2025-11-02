# 🚀 COORDINATOR ADVANCED FEATURES PLAN
## Subscriptions & Profile Integration Enhancements

**Last Updated**: November 1, 2025  
**Status**: 🎨 DESIGN PHASE - Ready for Implementation  
**Project**: Wedding Bazaar - Coordinator Premium Features

---

## 📋 TABLE OF CONTENTS

1. [Executive Overview](#executive-overview)
2. [Subscription System Design](#subscription-system-design)
3. [Advanced Profile Integration](#advanced-profile-integration)
4. [Database Schema Enhancements](#database-schema-enhancements)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Business Logic & Rules](#business-logic--rules)
8. [Implementation Roadmap](#implementation-roadmap)

---

## 🎯 EXECUTIVE OVERVIEW

### Vision
Transform the coordinator role from a basic account type into a **premium, subscription-based professional platform** with rich profile features, advanced analytics, and tiered access levels.

### Key Goals
1. **Monetization**: Generate recurring revenue through coordinator subscriptions
2. **Premium Value**: Provide advanced tools that justify subscription cost
3. **Profile Richness**: Create detailed, professional coordinator profiles
4. **Platform Differentiation**: Stand out from competitors with premium features

### Value Proposition

#### For Coordinators
- 💼 Professional profile showcase with portfolio
- 📊 Advanced analytics and business insights
- 🎯 Priority vendor connections and referrals
- 🤖 AI-powered planning assistance (Premium+)
- 📱 White-label client mobile app (Enterprise)
- 💰 Lower platform commission rates

#### For Platform
- 💵 Recurring monthly/annual revenue
- 📈 Higher engagement from paid users
- 🎖️ Premium brand positioning
- 📊 Better data for platform improvements

---

## 💳 SUBSCRIPTION SYSTEM DESIGN

### Subscription Tiers

#### **TIER 1: FREE STARTER** (₱0/month)
**Target**: New coordinators, hobbyists, testing the platform

**Features**:
- ✅ Basic coordinator profile
- ✅ Manage up to 3 active weddings
- ✅ Access to 50 vendors
- ✅ Basic milestone tracking
- ✅ Standard commission rate (15%)
- ✅ Email support (48-hour response)
- ✅ Basic analytics (last 30 days)
- ❌ No portfolio showcase
- ❌ No client testimonials
- ❌ No priority listing

**Limitations**:
- Max 3 active weddings
- Max 5 clients in CRM
- Basic vendor search only
- Standard commission: 15% on all bookings
- No API access
- 30-day data retention

---

#### **TIER 2: PROFESSIONAL** (₱2,999/month or ₱29,999/year)
**Target**: Established coordinators, small teams

**Features**:
- ✅ All Free features
- ✅ **Unlimited active weddings**
- ✅ **Unlimited client CRM**
- ✅ Access to ALL vendors (1,000+)
- ✅ **Priority vendor search results**
- ✅ **Portfolio showcase** (up to 20 weddings)
- ✅ **Client testimonials display**
- ✅ **Featured coordinator badge**
- ✅ **Reduced commission rate (10%)**
- ✅ Advanced analytics (12 months)
- ✅ **Email templates & automation**
- ✅ **Budget tracking tools**
- ✅ **Vendor performance reports**
- ✅ Priority support (24-hour response)
- ✅ **Team member access** (1 assistant)
- ✅ **Custom branding** (logo, colors)
- ✅ **Export reports** (PDF, Excel)

**Value**:
- Save 5% commission on ₱1M bookings = ₱50,000/year
- ROI if managing 10+ weddings/year

---

#### **TIER 3: PREMIUM+** (₱5,999/month or ₱59,999/year)
**Target**: Professional coordinators, agencies

**Features**:
- ✅ All Professional features
- ✅ **AI-powered planning assistant** 🤖
- ✅ **Reduced commission rate (7%)**
- ✅ **Priority client referrals** from platform
- ✅ **Unlimited portfolio showcase**
- ✅ **Video testimonials**
- ✅ **Advanced vendor network analytics**
- ✅ **Team collaboration** (up to 5 members)
- ✅ **Client mobile app access**
- ✅ **Custom client portal URL**
- ✅ **Automated milestone reminders**
- ✅ **Vendor contract templates**
- ✅ **24/7 priority support** (phone + chat)
- ✅ **Dedicated account manager**
- ✅ **API access** for integrations
- ✅ **White-label client communications**
- ✅ **Advanced reporting & forecasting**

**Premium Features**:
- AI suggests vendors based on wedding style
- AI generates timeline recommendations
- Predictive budget analysis
- Automated vendor follow-ups

---

#### **TIER 4: ENTERPRISE** (Custom Pricing)
**Target**: Large agencies, 10+ coordinators

**Features**:
- ✅ All Premium+ features
- ✅ **White-label mobile app** (iOS + Android)
- ✅ **Custom platform commission (negotiated)**
- ✅ **Unlimited team members**
- ✅ **Multi-coordinator dashboard**
- ✅ **Advanced team permissions**
- ✅ **Custom integrations** (Zapier, etc.)
- ✅ **Dedicated server resources**
- ✅ **Custom domain** (youragency.weddingbazaar.ph)
- ✅ **Onboarding & training sessions**
- ✅ **Quarterly business reviews**
- ✅ **Early access to new features**

**Contact Sales for Pricing**

---

### Subscription Database Schema

```sql
-- 1. Subscription Plans Table
CREATE TABLE coordinator_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code VARCHAR(50) UNIQUE NOT NULL,
  -- 'FREE_STARTER', 'PROFESSIONAL', 'PREMIUM_PLUS', 'ENTERPRISE'
  plan_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100), -- "Professional Plan"
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_annual DECIMAL(10,2), -- Discounted annual price
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Feature Limits
  max_active_weddings INTEGER, -- NULL = unlimited
  max_clients INTEGER, -- NULL = unlimited
  max_portfolio_items INTEGER,
  max_team_members INTEGER DEFAULT 1,
  
  -- Commission Rates
  commission_rate DECIMAL(5,2) NOT NULL, -- 15.00 = 15%
  
  -- Feature Flags
  has_unlimited_weddings BOOLEAN DEFAULT FALSE,
  has_unlimited_clients BOOLEAN DEFAULT FALSE,
  has_portfolio_showcase BOOLEAN DEFAULT FALSE,
  has_client_testimonials BOOLEAN DEFAULT FALSE,
  has_featured_badge BOOLEAN DEFAULT FALSE,
  has_priority_search BOOLEAN DEFAULT FALSE,
  has_advanced_analytics BOOLEAN DEFAULT FALSE,
  has_email_templates BOOLEAN DEFAULT FALSE,
  has_budget_tools BOOLEAN DEFAULT FALSE,
  has_vendor_reports BOOLEAN DEFAULT FALSE,
  has_team_access BOOLEAN DEFAULT FALSE,
  has_custom_branding BOOLEAN DEFAULT FALSE,
  has_export_reports BOOLEAN DEFAULT FALSE,
  has_ai_assistant BOOLEAN DEFAULT FALSE,
  has_priority_referrals BOOLEAN DEFAULT FALSE,
  has_video_testimonials BOOLEAN DEFAULT FALSE,
  has_client_mobile_app BOOLEAN DEFAULT FALSE,
  has_api_access BOOLEAN DEFAULT FALSE,
  has_white_label BOOLEAN DEFAULT FALSE,
  has_custom_domain BOOLEAN DEFAULT FALSE,
  
  -- Support Level
  support_type VARCHAR(50) DEFAULT 'email',
  -- 'email', 'priority_email', 'phone_chat', 'dedicated_manager'
  support_response_hours INTEGER DEFAULT 48,
  
  -- Data Retention
  analytics_retention_days INTEGER DEFAULT 30,
  
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE, -- Badge on pricing page
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default plans
INSERT INTO coordinator_subscription_plans (
  plan_code, plan_name, display_name, price_monthly, price_annual,
  max_active_weddings, max_clients, commission_rate,
  has_portfolio_showcase, is_active, sort_order
) VALUES
('FREE_STARTER', 'Free Starter', 'Free Starter', 0, 0, 
 3, 5, 15.00, FALSE, TRUE, 1),
('PROFESSIONAL', 'Professional', 'Professional Plan', 2999, 29999,
 NULL, NULL, 10.00, TRUE, TRUE, 2),
('PREMIUM_PLUS', 'Premium Plus', 'Premium+ Plan', 5999, 59999,
 NULL, NULL, 7.00, TRUE, TRUE, 3),
('ENTERPRISE', 'Enterprise', 'Enterprise Plan', NULL, NULL,
 NULL, NULL, 5.00, TRUE, TRUE, 4);

-- 2. Coordinator Subscriptions Table
CREATE TABLE coordinator_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES coordinator_subscription_plans(id),
  
  status VARCHAR(50) DEFAULT 'active',
  -- 'trial', 'active', 'past_due', 'cancelled', 'expired'
  
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  -- 'monthly', 'annual', 'lifetime'
  
  -- Pricing
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Dates
  trial_start_date DATE,
  trial_end_date DATE,
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  
  -- Payment
  payment_method VARCHAR(50), -- 'card', 'gcash', 'bank_transfer'
  last_payment_date TIMESTAMP,
  next_billing_date DATE,
  
  -- Usage Tracking
  current_active_weddings INTEGER DEFAULT 0,
  current_clients INTEGER DEFAULT 0,
  current_portfolio_items INTEGER DEFAULT 0,
  current_team_members INTEGER DEFAULT 1,
  
  -- Metadata
  metadata JSONB, -- Stripe subscription ID, etc.
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(coordinator_id) -- One active subscription per coordinator
);

-- 3. Subscription Payment History
CREATE TABLE coordinator_subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES coordinator_subscriptions(id),
  coordinator_id VARCHAR(20) REFERENCES users(id),
  
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  status VARCHAR(50) DEFAULT 'pending',
  -- 'pending', 'completed', 'failed', 'refunded'
  
  payment_method VARCHAR(50),
  payment_intent_id VARCHAR(255), -- PayMongo/Stripe ID
  receipt_number VARCHAR(50) UNIQUE,
  
  billing_period_start DATE,
  billing_period_end DATE,
  
  paid_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,
  
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Feature Usage Tracking
CREATE TABLE coordinator_feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id),
  feature_code VARCHAR(50) NOT NULL,
  -- 'ai_assistant', 'vendor_report', 'export_pdf', etc.
  
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Subscription Audit Log
CREATE TABLE coordinator_subscription_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id),
  subscription_id UUID REFERENCES coordinator_subscriptions(id),
  
  action VARCHAR(100) NOT NULL,
  -- 'plan_upgraded', 'plan_downgraded', 'subscription_cancelled', 
  -- 'payment_failed', 'trial_started', 'subscription_renewed'
  
  old_plan_code VARCHAR(50),
  new_plan_code VARCHAR(50),
  
  description TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_coordinator_subscriptions_coordinator 
  ON coordinator_subscriptions(coordinator_id);
CREATE INDEX idx_coordinator_subscriptions_status 
  ON coordinator_subscriptions(status);
CREATE INDEX idx_coordinator_subscriptions_next_billing 
  ON coordinator_subscriptions(next_billing_date);
CREATE INDEX idx_subscription_payments_coordinator 
  ON coordinator_subscription_payments(coordinator_id);
CREATE INDEX idx_subscription_payments_status 
  ON coordinator_subscription_payments(status);
CREATE INDEX idx_feature_usage_coordinator 
  ON coordinator_feature_usage(coordinator_id, feature_code);

-- Views
CREATE OR REPLACE VIEW coordinator_subscription_details AS
SELECT 
  cs.id as subscription_id,
  cs.coordinator_id,
  u.email,
  u.first_name || ' ' || u.last_name as coordinator_name,
  vp.business_name,
  csp.plan_code,
  csp.display_name as plan_name,
  csp.price_monthly,
  csp.price_annual,
  csp.commission_rate,
  cs.status as subscription_status,
  cs.billing_cycle,
  cs.current_period_start,
  cs.current_period_end,
  cs.next_billing_date,
  cs.current_active_weddings,
  cs.current_clients,
  csp.max_active_weddings,
  csp.max_clients,
  CASE 
    WHEN csp.max_active_weddings IS NULL THEN TRUE
    WHEN cs.current_active_weddings < csp.max_active_weddings THEN TRUE
    ELSE FALSE
  END as can_add_wedding,
  CASE
    WHEN csp.max_clients IS NULL THEN TRUE
    WHEN cs.current_clients < csp.max_clients THEN TRUE
    ELSE FALSE
  END as can_add_client
FROM coordinator_subscriptions cs
LEFT JOIN users u ON cs.coordinator_id = u.id
LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
LEFT JOIN coordinator_subscription_plans csp ON cs.plan_id = csp.id;
```

---

## 👤 ADVANCED PROFILE INTEGRATION

### Enhanced Coordinator Profile Schema

```sql
-- 1. Extend vendor_profiles for coordinators
ALTER TABLE vendor_profiles
ADD COLUMN IF NOT EXISTS profile_type VARCHAR(50) DEFAULT 'vendor',
-- 'vendor', 'coordinator', 'planner'

-- Coordinator-specific fields
ADD COLUMN IF NOT EXISTS tagline VARCHAR(200),
-- "Creating Unforgettable Wedding Moments Since 2015"
ADD COLUMN IF NOT EXISTS bio TEXT,
-- Extended biography/about section
ADD COLUMN IF NOT EXISTS education TEXT[],
-- ["Bachelor of Event Management - UP Diliman"]
ADD COLUMN IF NOT EXISTS certifications TEXT[],
-- ["Certified Wedding Planner - IECEP", "Event Design Certification"]
ADD COLUMN IF NOT EXISTS awards TEXT[],
-- ["Best Wedding Coordinator 2024 - WeddingsPH"]
ADD COLUMN IF NOT EXISTS languages TEXT[],
-- ["English", "Filipino", "Chinese"]
ADD COLUMN IF NOT EXISTS planning_styles TEXT[],
-- ["Modern", "Classic", "Luxury", "Destination"]
ADD COLUMN IF NOT EXISTS budget_ranges JSONB,
-- {"min": 200000, "max": 5000000, "currency": "PHP", "typical": 800000}

-- Social Media & Portfolio
ADD COLUMN IF NOT EXISTS social_media JSONB,
-- {"instagram": "@coordname", "facebook": "fb.com/page", "tiktok": "@user"}
ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS youtube_channel VARCHAR(255),

-- Business Details
ADD COLUMN IF NOT EXISTS business_registration VARCHAR(100),
-- DTI/SEC registration number
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50),
-- TIN number
ADD COLUMN IF NOT EXISTS insurance_info JSONB,
-- {"provider": "AIA", "coverage": 5000000, "expiry": "2026-12-31"}

-- Availability & Preferences
ADD COLUMN IF NOT EXISTS availability_calendar JSONB,
-- {"2025-12": ["2025-12-14", "2025-12-21"], "2026-01": [...]}
ADD COLUMN IF NOT EXISTS booking_lead_time_days INTEGER DEFAULT 90,
-- Minimum days before wedding date
ADD COLUMN IF NOT EXISTS max_concurrent_weddings INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS preferred_venues TEXT[],
-- List of preferred venue names
ADD COLUMN IF NOT EXISTS service_radius_km INTEGER,
-- How far they're willing to travel

-- Statistics (auto-updated)
ADD COLUMN IF NOT EXISTS total_weddings_coordinated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_clients INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 100.00,
-- Percentage of weddings completed successfully
ADD COLUMN IF NOT EXISTS repeat_client_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS referral_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS on_time_delivery_rate DECIMAL(5,2) DEFAULT 100.00,

-- Premium Features
ADD COLUMN IF NOT EXISTS is_verified_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_top_rated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completion_percent INTEGER DEFAULT 0,
-- 0-100 based on filled fields

ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMP DEFAULT NOW();

-- 2. Portfolio Showcase Table
CREATE TABLE coordinator_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  
  wedding_id UUID REFERENCES coordinator_weddings(id) ON DELETE SET NULL,
  -- Can be linked to actual wedding or standalone showcase
  
  title VARCHAR(255) NOT NULL,
  -- "Luxurious Garden Wedding at Tagaytay Highlands"
  description TEXT,
  wedding_date DATE,
  venue VARCHAR(255),
  location VARCHAR(100),
  
  -- Media
  cover_image_url TEXT NOT NULL,
  images TEXT[], -- Array of image URLs
  video_url TEXT, -- YouTube/Vimeo link
  
  -- Details
  wedding_style VARCHAR(100),
  -- "Rustic Chic", "Modern Minimalist", "Luxury Garden"
  guest_count INTEGER,
  budget_range VARCHAR(50),
  -- "500k-1M", "1M-2M"
  
  -- Features
  highlights TEXT[],
  -- ["Custom floral installations", "3-tier wedding cake"]
  vendors_featured JSONB,
  -- [{"name": "Perfect Shots", "category": "Photography", "vendor_id": "..."}]
  
  -- Client Info (optional, with permission)
  client_name VARCHAR(100),
  -- "Sarah & Michael" (anonymized or with permission)
  client_testimonial TEXT,
  client_rating DECIMAL(3,2),
  
  -- Visibility
  is_featured BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  
  tags TEXT[],
  -- ["garden", "luxury", "destination", "outdoor"]
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Client Testimonials Table (Enhanced)
CREATE TABLE coordinator_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES coordinator_portfolio(id) ON DELETE SET NULL,
  wedding_id UUID REFERENCES coordinator_weddings(id) ON DELETE SET NULL,
  
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255), -- For verification
  
  rating DECIMAL(3,2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  testimonial_text TEXT NOT NULL,
  testimonial_video_url TEXT,
  -- Link to video testimonial
  
  wedding_date DATE,
  venue VARCHAR(255),
  
  is_verified BOOLEAN DEFAULT FALSE,
  -- Verified by platform (email confirmation from client)
  verified_at TIMESTAMP,
  
  is_featured BOOLEAN DEFAULT FALSE,
  -- Show on coordinator's main profile
  
  is_public BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  
  response_from_coordinator TEXT,
  -- Coordinator can respond to testimonial
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Coordinator Specializations Table
CREATE TABLE coordinator_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  
  specialization_type VARCHAR(100) NOT NULL,
  -- 'wedding_style', 'cultural', 'venue_type', 'budget_range'
  
  specialization_value VARCHAR(100) NOT NULL,
  -- 'Luxury Garden', 'Filipino Traditional', 'Beach Venues', '1M-5M'
  
  proficiency_level VARCHAR(50) DEFAULT 'expert',
  -- 'beginner', 'intermediate', 'expert', 'master'
  
  weddings_completed INTEGER DEFAULT 0,
  -- How many weddings in this specialization
  
  average_rating DECIMAL(3,2),
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(coordinator_id, specialization_type, specialization_value)
);

-- 5. Coordinator Achievements/Badges
CREATE TABLE coordinator_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  
  achievement_code VARCHAR(50) NOT NULL,
  -- 'FIRST_10_WEDDINGS', 'PERFECT_RATING_10', 'TOP_EARNER_2025', 'FAST_RESPONDER'
  
  achievement_name VARCHAR(100) NOT NULL,
  achievement_description TEXT,
  
  badge_icon_url TEXT,
  badge_color VARCHAR(7), -- Hex color
  
  earned_at TIMESTAMP DEFAULT NOW(),
  
  is_visible BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_coordinator_portfolio_coordinator 
  ON coordinator_portfolio(coordinator_id);
CREATE INDEX idx_coordinator_portfolio_featured 
  ON coordinator_portfolio(is_featured, is_public);
CREATE INDEX idx_coordinator_testimonials_coordinator 
  ON coordinator_testimonials(coordinator_id);
CREATE INDEX idx_coordinator_testimonials_verified 
  ON coordinator_testimonials(is_verified, is_public);
CREATE INDEX idx_coordinator_specializations_coordinator 
  ON coordinator_specializations(coordinator_id);
CREATE INDEX idx_coordinator_achievements_coordinator 
  ON coordinator_achievements(coordinator_id);

-- Views
CREATE OR REPLACE VIEW coordinator_public_profiles AS
SELECT 
  u.id as coordinator_id,
  u.first_name || ' ' || u.last_name as full_name,
  vp.business_name,
  vp.tagline,
  vp.bio,
  vp.years_experience,
  vp.average_rating,
  vp.total_reviews,
  vp.total_bookings,
  vp.total_weddings_coordinated,
  vp.service_areas,
  vp.planning_styles,
  vp.languages,
  vp.certifications,
  vp.awards,
  vp.social_media,
  vp.website_url,
  vp.is_verified_premium,
  vp.is_top_rated,
  vp.is_featured,
  cs.plan_code,
  csp.display_name as subscription_plan,
  COUNT(DISTINCT cp.id) as portfolio_count,
  COUNT(DISTINCT ct.id) as testimonial_count,
  AVG(ct.rating) as testimonial_avg_rating
FROM users u
LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
LEFT JOIN coordinator_subscriptions cs ON u.id = cs.coordinator_id
LEFT JOIN coordinator_subscription_plans csp ON cs.plan_id = csp.id
LEFT JOIN coordinator_portfolio cp ON u.id = cp.coordinator_id AND cp.is_public = TRUE
LEFT JOIN coordinator_testimonials ct ON u.id = ct.coordinator_id AND ct.is_public = TRUE
WHERE u.user_type = 'couple' AND vp.business_type = 'Wedding Coordination'
GROUP BY u.id, vp.id, cs.id, csp.id;
```

---

## 📡 API ENDPOINTS

### Subscription Management APIs

```javascript
// 1. Get available subscription plans
GET /api/coordinator/subscriptions/plans
Response: {
  plans: [
    {
      id: "uuid",
      plan_code: "PROFESSIONAL",
      display_name: "Professional Plan",
      price_monthly: 2999,
      price_annual: 29999,
      features: {
        max_active_weddings: null,
        commission_rate: 10.00,
        has_portfolio_showcase: true,
        ...
      }
    }
  ]
}

// 2. Get current subscription
GET /api/coordinator/subscriptions/current
Response: {
  subscription: {
    id: "uuid",
    plan: {
      plan_code: "PROFESSIONAL",
      display_name: "Professional Plan",
      commission_rate: 10.00
    },
    status: "active",
    current_period_end: "2025-12-31",
    usage: {
      current_active_weddings: 5,
      max_active_weddings: null,
      current_clients: 12,
      max_clients: null
    },
    can_add_wedding: true,
    can_add_client: true
  }
}

// 3. Subscribe to plan
POST /api/coordinator/subscriptions/subscribe
Body: {
  plan_code: "PROFESSIONAL",
  billing_cycle: "annual",
  payment_method: {
    type: "card",
    card_details: {...}
  }
}

// 4. Upgrade/downgrade plan
PUT /api/coordinator/subscriptions/change-plan
Body: {
  new_plan_code: "PREMIUM_PLUS",
  prorate: true
}

// 5. Cancel subscription
POST /api/coordinator/subscriptions/cancel
Body: {
  cancel_at_period_end: true,
  reason: "Too expensive"
}

// 6. Check feature access
GET /api/coordinator/subscriptions/can-access/:feature_code
Response: {
  can_access: true,
  reason: "Feature included in Professional plan"
}

// 7. Get payment history
GET /api/coordinator/subscriptions/payments
Response: {
  payments: [
    {
      id: "uuid",
      amount: 29999,
      status: "completed",
      receipt_number: "RCP-2025-001",
      billing_period: "2025-01-01 to 2025-12-31",
      paid_at: "2025-01-01T10:00:00Z"
    }
  ]
}
```

---

### Enhanced Profile APIs

```javascript
// 1. Get public coordinator profile
GET /api/coordinators/:id/profile
Response: {
  coordinator: {
    id: "1-2025-016",
    name: "Sarah Johnson",
    business_name: "Elegant Affairs Coordination",
    tagline: "Creating Unforgettable Moments Since 2015",
    bio: "...",
    rating: 4.9,
    total_reviews: 47,
    total_weddings: 120,
    years_experience: 10,
    certifications: [...],
    awards: [...],
    planning_styles: ["Luxury", "Modern", "Garden"],
    service_areas: ["Metro Manila", "Tagaytay"],
    portfolio_count: 15,
    testimonial_count: 23,
    is_verified_premium: true,
    is_top_rated: true,
    subscription_plan: "Premium+ Plan"
  }
}

// 2. Update coordinator profile
PUT /api/coordinator/profile
Body: {
  tagline: "New tagline",
  bio: "Updated bio",
  certifications: [...],
  planning_styles: [...],
  ...
}

// 3. Get coordinator portfolio
GET /api/coordinators/:id/portfolio
Query: ?page=1&limit=12&featured_only=true
Response: {
  portfolio: [
    {
      id: "uuid",
      title: "Luxurious Garden Wedding",
      cover_image: "url",
      wedding_date: "2024-12-15",
      venue: "Tagaytay Highlands",
      wedding_style: "Luxury Garden",
      client_rating: 5.0,
      is_featured: true
    }
  ],
  total: 15,
  page: 1
}

// 4. Add portfolio item
POST /api/coordinator/portfolio
Body: {
  title: "Beautiful Beach Wedding",
  description: "...",
  cover_image_url: "...",
  images: [...],
  wedding_style: "Beach Rustic",
  guest_count: 150,
  highlights: [...],
  ...
}

// 5. Get testimonials
GET /api/coordinators/:id/testimonials
Query: ?verified_only=true&limit=10
Response: {
  testimonials: [
    {
      id: "uuid",
      client_name: "Maria & John",
      rating: 5.0,
      testimonial_text: "...",
      wedding_date: "2024-11-20",
      is_verified: true,
      created_at: "..."
    }
  ]
}

// 6. Add testimonial (by client)
POST /api/coordinator/testimonials
Body: {
  coordinator_id: "1-2025-016",
  client_name: "Sarah & Michael",
  client_email: "sarah@example.com",
  rating: 5.0,
  testimonial_text: "...",
  wedding_date: "2025-10-15"
}

// 7. Get coordinator specializations
GET /api/coordinators/:id/specializations
Response: {
  specializations: [
    {
      type: "wedding_style",
      value: "Luxury Garden",
      proficiency: "expert",
      weddings_completed: 35,
      average_rating: 4.9
    }
  ]
}

// 8. Get coordinator achievements
GET /api/coordinators/:id/achievements
Response: {
  achievements: [
    {
      code: "PERFECT_RATING_10",
      name: "Perfect 10",
      description: "Maintained 5.0 rating for 10+ weddings",
      badge_icon: "url",
      earned_at: "2024-12-01"
    }
  ]
}

// 9. Get profile completion status
GET /api/coordinator/profile/completion
Response: {
  completion_percent: 85,
  missing_fields: [
    {
      field: "certifications",
      importance: "high",
      description: "Add your certifications to boost credibility"
    }
  ],
  suggestions: [
    "Add portfolio items to showcase your work",
    "Request testimonials from past clients"
  ]
}
```

---

## 🎨 FRONTEND COMPONENTS

### Subscription Management Pages

#### 1. Subscription Plans Page (`/coordinator/pricing`)
```typescript
// Components:
- PricingTable.tsx (4-tier comparison table)
- PlanCard.tsx (Individual plan with features)
- FeatureComparison.tsx (Detailed feature matrix)
- UpgradeCallToAction.tsx (CTA for free users)
- FAQSection.tsx (Common questions)
```

#### 2. Subscription Dashboard (`/coordinator/subscription`)
```typescript
// Components:
- SubscriptionOverview.tsx (Current plan, next billing, usage)
- UsageMetrics.tsx (Weddings/clients vs limits)
- PaymentHistory.tsx (Past payments)
- ChangePlanButton.tsx (Upgrade/downgrade)
- CancelSubscriptionButton.tsx
```

#### 3. Upgrade Modal
```typescript
// UpgradeModal.tsx
- Show current vs new plan features
- Calculate proration
- Payment form
- Confirmation
```

---

### Enhanced Profile Components

#### 1. Public Profile Page (`/coordinator/:id`)
```typescript
// Components:
- CoordinatorProfileHeader.tsx (Name, rating, badges)
- CoordinatorAbout.tsx (Bio, experience, certifications)
- CoordinatorPortfolioGrid.tsx (Portfolio showcase)
- CoordinatorTestimonials.tsx (Client reviews)
- CoordinatorSpecializations.tsx (Skills & expertise)
- CoordinatorAchievements.tsx (Badges & awards)
- ContactCoordinatorButton.tsx
- BookConsultationButton.tsx
```

#### 2. Profile Editor (`/coordinator/profile/edit`)
```typescript
// Components:
- ProfileBasicInfo.tsx (Name, tagline, bio)
- ProfileBusinessInfo.tsx (Certifications, experience)
- ProfileSocialMedia.tsx (Instagram, Facebook, etc.)
- ProfileSpecializations.tsx (Manage specializations)
- ProfileAvailability.tsx (Calendar, lead time)
- ProfileCompletionWidget.tsx (Progress bar + suggestions)
```

#### 3. Portfolio Manager (`/coordinator/portfolio`)
```typescript
// Components:
- PortfolioGrid.tsx (All portfolio items)
- AddPortfolioModal.tsx (Upload new wedding)
- EditPortfolioModal.tsx
- PortfolioImageUploader.tsx (Drag & drop)
- PortfolioVideoEmbed.tsx (YouTube/Vimeo)
```

#### 4. Testimonials Manager (`/coordinator/testimonials`)
```typescript
// Components:
- TestimonialsList.tsx
- RequestTestimonialButton.tsx (Send email to client)
- TestimonialResponseModal.tsx (Reply to testimonial)
```

---

## 🧠 BUSINESS LOGIC & RULES

### Subscription Business Rules

#### 1. **Free Trial**
- All new coordinators start with 14-day free trial of PROFESSIONAL plan
- After trial: downgrade to FREE or subscribe to paid plan
- Trial can only be used once per coordinator

#### 2. **Upgrade Rules**
- Instant access to new features
- Prorated payment for remaining period
- Commission rate applies to NEW bookings only
- No refund on unused portion of old plan

#### 3. **Downgrade Rules**
- Takes effect at end of current billing period
- Grace period: 30 days to upgrade again without losing data
- Data beyond new limits becomes read-only
- Example: Professional → Free (3 active wedding limit)
  - Existing 10 weddings: 7 become "archived" (read-only)
  - Can't add new weddings until under limit

#### 4. **Cancellation Rules**
- Cancel anytime, access until end of billing period
- Data retained for 90 days after cancellation
- Can reactivate within 90 days without data loss
- After 90 days: permanent deletion (GDPR compliance)

#### 5. **Payment Failure**
- 1st failure: Email reminder, retry in 3 days
- 2nd failure: Account downgraded to FREE, 7-day grace period
- After grace period: Archive excess data, limit features
- Can upgrade anytime to restore access

#### 6. **Commission Rates**
- Applied at booking creation time (not payment time)
- Rate locked for that booking even if plan changes
- Example: Book vendor during PROFESSIONAL (10%), then downgrade
  - That booking still pays 10% commission
  - New bookings after downgrade: 15% commission

---

### Profile Visibility Rules

#### 1. **Public Profile Access**
- FREE: Basic profile visible, no portfolio
- PROFESSIONAL+: Full profile with portfolio
- Featured badge: Only PROFESSIONAL+ plans
- Top Rated badge: Requires 4.8+ rating, 20+ reviews, PROFESSIONAL+

#### 2. **Portfolio Limits**
- FREE: 0 portfolio items (feature locked)
- PROFESSIONAL: 20 items
- PREMIUM+: Unlimited items
- ENTERPRISE: Unlimited + video priority

#### 3. **Search Ranking**
- FREE coordinators: Page 3+ in search results
- PROFESSIONAL: Page 2-3
- PREMIUM+: Page 1, priority listing
- Top Rated: Always in top 5 results

#### 4. **Profile Completion Score**
- 0-40%: Low visibility, no featured eligibility
- 41-70%: Normal visibility
- 71-90%: Boosted in search results
- 91-100%: Maximum visibility, featured eligibility

**Scoring**:
- Basic info (20%): Name, bio, tagline, photo
- Business info (20%): Certifications, experience, service areas
- Portfolio (25%): At least 5 items
- Testimonials (20%): At least 10 verified
- Specializations (10%): At least 3 defined
- Social media (5%): At least 2 platforms linked

---

## 🗺️ IMPLEMENTATION ROADMAP

### **PHASE 1: DATABASE & BACKEND** (Week 1-2)

#### Week 1: Subscription System
- [ ] Create subscription schema SQL file
- [ ] Run migrations in Neon
- [ ] Build subscription plans API
- [ ] Build subscribe/upgrade/cancel APIs
- [ ] Implement feature access checks
- [ ] Add payment processing (PayMongo)
- [ ] Test subscription flows

#### Week 2: Profile Enhancements
- [ ] Extend vendor_profiles table
- [ ] Create portfolio tables
- [ ] Create testimonials table
- [ ] Build profile APIs
- [ ] Build portfolio APIs
- [ ] Build testimonials APIs
- [ ] Test all endpoints

---

### **PHASE 2: FRONTEND** (Week 3-4)

#### Week 3: Subscription UI
- [ ] Build pricing page
- [ ] Build subscription dashboard
- [ ] Build upgrade modal
- [ ] Build payment form
- [ ] Integrate with backend APIs
- [ ] Test payment flows
- [ ] Add usage limit warnings

#### Week 4: Profile UI
- [ ] Build public profile page
- [ ] Build profile editor
- [ ] Build portfolio manager
- [ ] Build testimonials manager
- [ ] Add image upload (Cloudinary/S3)
- [ ] Test all CRUD operations
- [ ] Mobile responsive design

---

### **PHASE 3: PREMIUM FEATURES** (Week 5-6)

#### Week 5: AI Assistant (PREMIUM+ only)
- [ ] Integrate OpenAI API
- [ ] Build vendor recommendation engine
- [ ] Build timeline generation
- [ ] Build budget analysis
- [ ] Add AI chat interface
- [ ] Test AI features

#### Week 6: Advanced Features
- [ ] Build white-label client portal
- [ ] Build custom domain support
- [ ] Build API access for integrations
- [ ] Build advanced analytics
- [ ] Build team collaboration features
- [ ] Test enterprise features

---

### **PHASE 4: LAUNCH & MARKETING** (Week 7-8)

#### Week 7: Testing & Polish
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Training materials

#### Week 8: Launch
- [ ] Soft launch (beta testers)
- [ ] Email campaign to existing coordinators
- [ ] Social media announcement
- [ ] Blog post / press release
- [ ] Onboarding webinar
- [ ] Monitor metrics

---

## 💰 PRICING STRATEGY

### Market Research (Philippines)

**Competitor Analysis**:
- Zankyou Pro: ₱3,500/month (basic)
- Honeybook: $40/month (~₱2,200)
- Aisle Planner: $45/month (~₱2,500)
- 17hats: $65/month (~₱3,600)

**Our Pricing** (Competitive):
- FREE: ₱0 (lead generation)
- PROFESSIONAL: ₱2,999/month (below competitors)
- PREMIUM+: ₱5,999/month (premium value)
- ENTERPRISE: Custom (₱15,000+/month)

### Revenue Projections (Year 1)

**Conservative Estimate**:
- 500 total coordinators on platform
- 50% stay on FREE (250)
- 35% upgrade to PROFESSIONAL (175)
- 12% upgrade to PREMIUM+ (60)
- 3% go ENTERPRISE (15)

**Monthly Revenue**:
- FREE: ₱0 x 250 = ₱0
- PROFESSIONAL: ₱2,999 x 175 = ₱524,825
- PREMIUM+: ₱5,999 x 60 = ₱359,940
- ENTERPRISE: ₱15,000 x 15 = ₱225,000
- **Total MRR: ₱1,109,765**
- **Annual: ₱13,317,180**

**Plus Commission Revenue**:
- Platform still earns commission on all bookings
- Average booking: ₱50,000
- 10 bookings/coordinator/year = 5,000 total bookings
- Commission earnings:
  - FREE (15%): 250 coord x 10 bookings x ₱50k x 0.15 = ₱18,750,000
  - PROF (10%): 175 coord x 15 bookings x ₱50k x 0.10 = ₱13,125,000
  - PREM (7%): 60 coord x 20 bookings x ₱50k x 0.07 = ₱4,200,000
  - ENT (5%): 15 coord x 30 bookings x ₱50k x 0.05 = ₱1,125,000
- **Total Commission Revenue: ₱37,200,000/year**

**Total Platform Revenue**: ₱50,517,180/year

---

## 📊 SUCCESS METRICS

### KPIs to Track

#### Subscription Metrics
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Customer Lifetime Value (LTV)
- Churn Rate
- Upgrade Rate (FREE → PAID)
- Downgrade Rate
- Average Revenue Per User (ARPU)

#### Engagement Metrics
- Active coordinators (monthly)
- Weddings created per coordinator
- Portfolio items added
- Profile completion rate
- Feature usage rates

#### Business Metrics
- Total platform bookings
- Total commission revenue
- Platform take rate
- Coordinator satisfaction score
- Client satisfaction score

---

## 🎯 NEXT STEPS

### Immediate Actions (This Week)
1. ✅ Review and approve this feature plan
2. [ ] Create subscription tables SQL migration
3. [ ] Design pricing page mockups
4. [ ] Write API specifications document
5. [ ] Set up PayMongo subscription webhooks

### Questions to Resolve
1. **Free Trial Duration**: 14 days or 30 days?
2. **Annual Discount**: Current 16% off, increase to 20%?
3. **Proration Logic**: Refund old plan or credit toward new?
4. **Grace Period**: 30 days or 60 days after cancellation?
5. **Commission Locking**: Lock at booking time or payment time?

### Resources Needed
- PayMongo subscription API documentation
- Cloudinary/AWS S3 for image uploads
- OpenAI API key for AI assistant
- Email service (SendGrid) for subscription notifications
- Stripe for international payments (optional)

---

**READY TO IMPLEMENT** ✅  
All schemas, APIs, and components are fully designed and ready for development.

**Estimated Timeline**: 6-8 weeks to full launch  
**Estimated Development Cost**: 400-500 dev hours  
**Estimated Revenue Year 1**: ₱50M+ (subscriptions + commissions)

---

**Last Updated**: November 1, 2025  
**Version**: 1.0  
**Status**: 🎨 DESIGN COMPLETE - AWAITING APPROVAL  
**Author**: Wedding Bazaar Development Team
