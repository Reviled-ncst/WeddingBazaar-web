-- ============================================================================
-- WEDDING BAZAAR - COORDINATOR ADVANCED FEATURES MIGRATION
-- Version: 1.0
-- Date: November 1, 2025
-- Author: Wedding Bazaar Development Team
-- 
-- PURPOSE: Add subscription system and enhanced profile features for coordinators
-- 
-- INCLUDES:
-- 1. Subscription plans and management tables
-- 2. Payment tracking and history
-- 3. Feature usage analytics
-- 4. Enhanced coordinator profiles
-- 5. Portfolio showcase system
-- 6. Testimonials and reviews
-- 7. Specializations and achievements
-- 
-- ESTIMATED TIME: 5-10 minutes
-- BACKUP RECOMMENDED: Yes
-- ============================================================================

-- ============================================================================
-- PART 1: SUBSCRIPTION SYSTEM
-- ============================================================================

-- 1. Subscription Plans Table
-- Defines available subscription tiers with features and pricing
CREATE TABLE IF NOT EXISTS coordinator_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code VARCHAR(50) UNIQUE NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  description TEXT,
  
  -- Pricing
  price_monthly DECIMAL(10,2) NOT NULL,
  price_annual DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Feature Limits
  max_active_weddings INTEGER, -- NULL = unlimited
  max_clients INTEGER, -- NULL = unlimited
  max_portfolio_items INTEGER,
  max_team_members INTEGER DEFAULT 1,
  
  -- Commission Rates
  commission_rate DECIMAL(5,2) NOT NULL,
  
  -- Feature Flags (Boolean features)
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
  support_response_hours INTEGER DEFAULT 48,
  
  -- Data Retention
  analytics_retention_days INTEGER DEFAULT 30,
  
  -- Display Settings
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for active plans
CREATE INDEX idx_subscription_plans_active 
  ON coordinator_subscription_plans(is_active, sort_order);

COMMENT ON TABLE coordinator_subscription_plans IS 'Subscription plan definitions with features and pricing';
COMMENT ON COLUMN coordinator_subscription_plans.commission_rate IS 'Commission rate percentage (15.00 = 15%)';

-- 2. Coordinator Subscriptions Table
-- Tracks active subscriptions for coordinators
CREATE TABLE IF NOT EXISTS coordinator_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES coordinator_subscription_plans(id),
  
  status VARCHAR(50) DEFAULT 'active',
  -- Status values: 'trial', 'active', 'past_due', 'cancelled', 'expired'
  
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
  payment_method VARCHAR(50),
  last_payment_date TIMESTAMP,
  next_billing_date DATE,
  
  -- Usage Tracking
  current_active_weddings INTEGER DEFAULT 0,
  current_clients INTEGER DEFAULT 0,
  current_portfolio_items INTEGER DEFAULT 0,
  current_team_members INTEGER DEFAULT 1,
  
  -- Metadata
  metadata JSONB,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(coordinator_id) -- One active subscription per coordinator
);

-- Create indexes for subscription queries
CREATE INDEX idx_coordinator_subscriptions_coordinator 
  ON coordinator_subscriptions(coordinator_id);
CREATE INDEX idx_coordinator_subscriptions_status 
  ON coordinator_subscriptions(status);
CREATE INDEX idx_coordinator_subscriptions_next_billing 
  ON coordinator_subscriptions(next_billing_date);

COMMENT ON TABLE coordinator_subscriptions IS 'Active subscriptions for coordinators';
COMMENT ON COLUMN coordinator_subscriptions.status IS 'Current subscription status: trial, active, past_due, cancelled, expired';

-- 3. Subscription Payment History
-- Records all subscription payments
CREATE TABLE IF NOT EXISTS coordinator_subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES coordinator_subscriptions(id),
  coordinator_id VARCHAR(20) REFERENCES users(id),
  
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  status VARCHAR(50) DEFAULT 'pending',
  -- Status values: 'pending', 'completed', 'failed', 'refunded'
  
  payment_method VARCHAR(50),
  payment_intent_id VARCHAR(255),
  receipt_number VARCHAR(50) UNIQUE,
  
  billing_period_start DATE,
  billing_period_end DATE,
  
  paid_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,
  
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for payment queries
CREATE INDEX idx_subscription_payments_subscription 
  ON coordinator_subscription_payments(subscription_id);
CREATE INDEX idx_subscription_payments_coordinator 
  ON coordinator_subscription_payments(coordinator_id);
CREATE INDEX idx_subscription_payments_status 
  ON coordinator_subscription_payments(status);
CREATE INDEX idx_subscription_payments_date 
  ON coordinator_subscription_payments(created_at DESC);

COMMENT ON TABLE coordinator_subscription_payments IS 'Payment history for coordinator subscriptions';

-- 4. Feature Usage Tracking
-- Tracks usage of premium features
CREATE TABLE IF NOT EXISTS coordinator_feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id),
  feature_code VARCHAR(50) NOT NULL,
  
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create composite index for usage queries
CREATE INDEX idx_feature_usage_coordinator_feature 
  ON coordinator_feature_usage(coordinator_id, feature_code);
CREATE INDEX idx_feature_usage_last_used 
  ON coordinator_feature_usage(last_used_at DESC);

COMMENT ON TABLE coordinator_feature_usage IS 'Tracks usage of premium features for analytics';

-- 5. Subscription Audit Log
-- Audit trail for subscription changes
CREATE TABLE IF NOT EXISTS coordinator_subscription_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id),
  subscription_id UUID REFERENCES coordinator_subscriptions(id),
  
  action VARCHAR(100) NOT NULL,
  -- Actions: 'plan_upgraded', 'plan_downgraded', 'subscription_cancelled', 
  --          'payment_failed', 'trial_started', 'subscription_renewed'
  
  old_plan_code VARCHAR(50),
  new_plan_code VARCHAR(50),
  
  description TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for audit queries
CREATE INDEX idx_subscription_audit_coordinator 
  ON coordinator_subscription_audit(coordinator_id);
CREATE INDEX idx_subscription_audit_date 
  ON coordinator_subscription_audit(created_at DESC);

COMMENT ON TABLE coordinator_subscription_audit IS 'Audit log for subscription changes';

-- ============================================================================
-- PART 2: ENHANCED COORDINATOR PROFILES
-- ============================================================================

-- Extend vendor_profiles table with coordinator-specific fields
ALTER TABLE vendor_profiles
ADD COLUMN IF NOT EXISTS profile_type VARCHAR(50) DEFAULT 'vendor',
ADD COLUMN IF NOT EXISTS tagline VARCHAR(200),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS education TEXT[],
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS awards TEXT[],
ADD COLUMN IF NOT EXISTS languages TEXT[],
ADD COLUMN IF NOT EXISTS planning_styles TEXT[],
ADD COLUMN IF NOT EXISTS budget_ranges JSONB,
ADD COLUMN IF NOT EXISTS social_media JSONB,
ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS youtube_channel VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_registration VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS insurance_info JSONB,
ADD COLUMN IF NOT EXISTS availability_calendar JSONB,
ADD COLUMN IF NOT EXISTS booking_lead_time_days INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS max_concurrent_weddings INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS preferred_venues TEXT[],
ADD COLUMN IF NOT EXISTS service_radius_km INTEGER,
ADD COLUMN IF NOT EXISTS total_weddings_coordinated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_clients INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 100.00,
ADD COLUMN IF NOT EXISTS repeat_client_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS referral_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS on_time_delivery_rate DECIMAL(5,2) DEFAULT 100.00,
ADD COLUMN IF NOT EXISTS is_verified_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_top_rated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completion_percent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMP DEFAULT NOW();

-- Create indexes for enhanced profile fields
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_type 
  ON vendor_profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_verified 
  ON vendor_profiles(is_verified_premium);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_top_rated 
  ON vendor_profiles(is_top_rated);

COMMENT ON COLUMN vendor_profiles.profile_type IS 'Profile type: vendor, coordinator, planner';
COMMENT ON COLUMN vendor_profiles.budget_ranges IS 'JSON: {"min": 200000, "max": 5000000, "currency": "PHP"}';
COMMENT ON COLUMN vendor_profiles.social_media IS 'JSON: {"instagram": "@user", "facebook": "fb.com/page"}';

-- ============================================================================
-- PART 3: PORTFOLIO SHOWCASE SYSTEM
-- ============================================================================

-- Coordinator Portfolio Table
-- Showcase of past weddings coordinated
CREATE TABLE IF NOT EXISTS coordinator_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES coordinator_weddings(id) ON DELETE SET NULL,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  wedding_date DATE,
  venue VARCHAR(255),
  location VARCHAR(100),
  
  -- Media
  cover_image_url TEXT NOT NULL,
  images TEXT[],
  video_url TEXT,
  
  -- Details
  wedding_style VARCHAR(100),
  guest_count INTEGER,
  budget_range VARCHAR(50),
  
  -- Features
  highlights TEXT[],
  vendors_featured JSONB,
  
  -- Client Info (with permission)
  client_name VARCHAR(100),
  client_testimonial TEXT,
  client_rating DECIMAL(3,2),
  
  -- Visibility
  is_featured BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  
  tags TEXT[],
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for portfolio queries
CREATE INDEX idx_coordinator_portfolio_coordinator 
  ON coordinator_portfolio(coordinator_id);
CREATE INDEX idx_coordinator_portfolio_featured 
  ON coordinator_portfolio(is_featured, is_public);
CREATE INDEX idx_coordinator_portfolio_date 
  ON coordinator_portfolio(wedding_date DESC);

COMMENT ON TABLE coordinator_portfolio IS 'Portfolio showcase of coordinator past weddings';
COMMENT ON COLUMN coordinator_portfolio.vendors_featured IS 'JSON array of featured vendors';

-- ============================================================================
-- PART 4: TESTIMONIALS SYSTEM
-- ============================================================================

-- Coordinator Testimonials Table
-- Client testimonials and reviews
CREATE TABLE IF NOT EXISTS coordinator_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES coordinator_portfolio(id) ON DELETE SET NULL,
  wedding_id UUID REFERENCES coordinator_weddings(id) ON DELETE SET NULL,
  
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  
  rating DECIMAL(3,2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  testimonial_text TEXT NOT NULL,
  testimonial_video_url TEXT,
  
  wedding_date DATE,
  venue VARCHAR(255),
  
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  
  is_featured BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  
  response_from_coordinator TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for testimonial queries
CREATE INDEX idx_coordinator_testimonials_coordinator 
  ON coordinator_testimonials(coordinator_id);
CREATE INDEX idx_coordinator_testimonials_verified 
  ON coordinator_testimonials(is_verified, is_public);
CREATE INDEX idx_coordinator_testimonials_rating 
  ON coordinator_testimonials(rating DESC);

COMMENT ON TABLE coordinator_testimonials IS 'Client testimonials for coordinators';
COMMENT ON COLUMN coordinator_testimonials.is_verified IS 'Verified by email confirmation';

-- ============================================================================
-- PART 5: SPECIALIZATIONS SYSTEM
-- ============================================================================

-- Coordinator Specializations Table
-- Areas of expertise and specialization
CREATE TABLE IF NOT EXISTS coordinator_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  
  specialization_type VARCHAR(100) NOT NULL,
  -- Types: 'wedding_style', 'cultural', 'venue_type', 'budget_range'
  
  specialization_value VARCHAR(100) NOT NULL,
  -- Values: 'Luxury Garden', 'Filipino Traditional', 'Beach Venues', '1M-5M'
  
  proficiency_level VARCHAR(50) DEFAULT 'expert',
  -- Levels: 'beginner', 'intermediate', 'expert', 'master'
  
  weddings_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(coordinator_id, specialization_type, specialization_value)
);

-- Create indexes for specialization queries
CREATE INDEX idx_coordinator_specializations_coordinator 
  ON coordinator_specializations(coordinator_id);
CREATE INDEX idx_coordinator_specializations_type 
  ON coordinator_specializations(specialization_type);

COMMENT ON TABLE coordinator_specializations IS 'Coordinator areas of expertise';
COMMENT ON COLUMN coordinator_specializations.proficiency_level IS 'Skill level: beginner, intermediate, expert, master';

-- ============================================================================
-- PART 6: ACHIEVEMENTS & BADGES SYSTEM
-- ============================================================================

-- Coordinator Achievements Table
-- Gamification badges and achievements
CREATE TABLE IF NOT EXISTS coordinator_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  
  achievement_code VARCHAR(50) NOT NULL,
  -- Codes: 'FIRST_10_WEDDINGS', 'PERFECT_RATING_10', 'TOP_EARNER_2025'
  
  achievement_name VARCHAR(100) NOT NULL,
  achievement_description TEXT,
  
  badge_icon_url TEXT,
  badge_color VARCHAR(7),
  
  earned_at TIMESTAMP DEFAULT NOW(),
  
  is_visible BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0
);

-- Create indexes for achievement queries
CREATE INDEX idx_coordinator_achievements_coordinator 
  ON coordinator_achievements(coordinator_id);
CREATE INDEX idx_coordinator_achievements_visible 
  ON coordinator_achievements(is_visible, display_order);

COMMENT ON TABLE coordinator_achievements IS 'Coordinator achievements and badges';

-- ============================================================================
-- PART 7: VIEWS FOR REPORTING
-- ============================================================================

-- Coordinator Subscription Details View
-- Combines subscription, plan, and user data
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

COMMENT ON VIEW coordinator_subscription_details IS 'Complete subscription details with usage limits';

-- Coordinator Public Profiles View
-- Public-facing profile data
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
  cs.plan_id,
  csp.plan_code,
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

COMMENT ON VIEW coordinator_public_profiles IS 'Public coordinator profiles with stats';

-- ============================================================================
-- PART 8: INSERT DEFAULT SUBSCRIPTION PLANS
-- ============================================================================

-- Insert default subscription plans
INSERT INTO coordinator_subscription_plans (
  plan_code, plan_name, display_name, description,
  price_monthly, price_annual,
  max_active_weddings, max_clients, max_portfolio_items,
  commission_rate,
  has_unlimited_weddings, has_unlimited_clients,
  has_portfolio_showcase, has_client_testimonials,
  has_featured_badge, has_priority_search,
  has_advanced_analytics, has_email_templates,
  is_active, is_popular, sort_order
) VALUES
-- FREE STARTER PLAN
('FREE_STARTER', 'Free Starter', 'Free Starter', 
 'Perfect for new coordinators getting started',
 0, 0,
 3, 5, 0,
 15.00,
 FALSE, FALSE,
 FALSE, FALSE,
 FALSE, FALSE,
 FALSE, FALSE,
 TRUE, FALSE, 1),

-- PROFESSIONAL PLAN
('PROFESSIONAL', 'Professional', 'Professional Plan',
 'For established coordinators managing multiple weddings',
 2999, 29999,
 NULL, NULL, 20,
 10.00,
 TRUE, TRUE,
 TRUE, TRUE,
 TRUE, TRUE,
 TRUE, TRUE,
 TRUE, TRUE, 2),

-- PREMIUM+ PLAN
('PREMIUM_PLUS', 'Premium Plus', 'Premium+ Plan',
 'Advanced features including AI assistant and priority referrals',
 5999, 59999,
 NULL, NULL, NULL,
 7.00,
 TRUE, TRUE,
 TRUE, TRUE,
 TRUE, TRUE,
 TRUE, TRUE,
 TRUE, FALSE, 3),

-- ENTERPRISE PLAN
('ENTERPRISE', 'Enterprise', 'Enterprise Plan',
 'Custom solution for large agencies - Contact Sales',
 NULL, NULL,
 NULL, NULL, NULL,
 5.00,
 TRUE, TRUE,
 TRUE, TRUE,
 TRUE, TRUE,
 TRUE, TRUE,
 TRUE, FALSE, 4)
ON CONFLICT (plan_code) DO NOTHING;

-- Update PREMIUM+ plan with advanced features
UPDATE coordinator_subscription_plans
SET 
  has_ai_assistant = TRUE,
  has_priority_referrals = TRUE,
  has_video_testimonials = TRUE,
  has_client_mobile_app = TRUE,
  has_api_access = TRUE,
  support_type = 'phone_chat',
  support_response_hours = 2,
  analytics_retention_days = 365
WHERE plan_code = 'PREMIUM_PLUS';

-- Update ENTERPRISE plan with white-label features
UPDATE coordinator_subscription_plans
SET 
  has_ai_assistant = TRUE,
  has_priority_referrals = TRUE,
  has_video_testimonials = TRUE,
  has_client_mobile_app = TRUE,
  has_api_access = TRUE,
  has_white_label = TRUE,
  has_custom_domain = TRUE,
  support_type = 'dedicated_manager',
  support_response_hours = 1,
  analytics_retention_days = 730
WHERE plan_code = 'ENTERPRISE';

-- ============================================================================
-- PART 9: DATA MIGRATION (Optional)
-- ============================================================================

-- Migrate existing coordinators to FREE_STARTER plan
-- (Only run if you want to automatically subscribe existing coordinators)
/*
INSERT INTO coordinator_subscriptions (
  coordinator_id,
  plan_id,
  status,
  billing_cycle,
  amount,
  current_period_start,
  current_period_end,
  next_billing_date
)
SELECT 
  u.id,
  (SELECT id FROM coordinator_subscription_plans WHERE plan_code = 'FREE_STARTER'),
  'active',
  'monthly',
  0,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '1 year'
FROM users u
JOIN vendor_profiles vp ON u.id = vp.user_id
WHERE vp.business_type = 'Wedding Coordination'
  AND NOT EXISTS (
    SELECT 1 FROM coordinator_subscriptions cs WHERE cs.coordinator_id = u.id
  );
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify table creation
SELECT 
  'coordinator_subscription_plans' as table_name,
  COUNT(*) as row_count
FROM coordinator_subscription_plans
UNION ALL
SELECT 'coordinator_subscriptions', COUNT(*) FROM coordinator_subscriptions
UNION ALL
SELECT 'coordinator_subscription_payments', COUNT(*) FROM coordinator_subscription_payments
UNION ALL
SELECT 'coordinator_feature_usage', COUNT(*) FROM coordinator_feature_usage
UNION ALL
SELECT 'coordinator_subscription_audit', COUNT(*) FROM coordinator_subscription_audit
UNION ALL
SELECT 'coordinator_portfolio', COUNT(*) FROM coordinator_portfolio
UNION ALL
SELECT 'coordinator_testimonials', COUNT(*) FROM coordinator_testimonials
UNION ALL
SELECT 'coordinator_specializations', COUNT(*) FROM coordinator_specializations
UNION ALL
SELECT 'coordinator_achievements', COUNT(*) FROM coordinator_achievements;

-- Display subscription plans
SELECT 
  plan_code,
  display_name,
  price_monthly,
  commission_rate,
  max_active_weddings,
  has_portfolio_showcase,
  has_ai_assistant,
  is_active
FROM coordinator_subscription_plans
ORDER BY sort_order;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ MIGRATION COMPLETE!';
  RAISE NOTICE '================================';
  RAISE NOTICE 'Tables created: 9 new tables';
  RAISE NOTICE 'Views created: 2 reporting views';
  RAISE NOTICE 'Subscription plans: 4 tiers inserted';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Review subscription plans';
  RAISE NOTICE '2. Test subscription flow in backend';
  RAISE NOTICE '3. Build frontend pricing page';
  RAISE NOTICE '================================';
END $$;
