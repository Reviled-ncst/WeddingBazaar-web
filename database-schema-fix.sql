-- Fix missing columns and tables for Wedding Bazaar backend
-- Run these SQL commands in your Neon database console

-- 1. Add missing role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'couple';

-- 2. Add missing category column to vendors table  
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- 3. Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    features JSONB,
    max_services INTEGER,
    max_images_per_service INTEGER,
    max_gallery_images INTEGER,
    max_bookings_per_month INTEGER,
    includes_featured_listing BOOLEAN DEFAULT false,
    includes_custom_branding BOOLEAN DEFAULT false,
    includes_analytics BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create vendor_subscriptions table
CREATE TABLE IF NOT EXISTS vendor_subscriptions (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(50) NOT NULL,
    plan_id VARCHAR(50) REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active',
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    trial_end TIMESTAMP,
    stripe_subscription_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Insert default subscription plans
INSERT INTO subscription_plans (id, name, description, price, features, max_services, max_images_per_service, max_gallery_images, max_bookings_per_month, includes_featured_listing, includes_custom_branding, includes_analytics) VALUES
('basic', 'Basic', 'Perfect for new wedding vendors', 999.00, '["Up to 3 services", "Basic portfolio (10 images)", "20 bookings per month", "Email support", "Basic analytics"]', 3, 10, 50, 20, false, false, true),
('premium', 'Premium', 'Great for growing wedding businesses', 1999.00, '["Up to 10 services", "Enhanced portfolio (50 images)", "Unlimited bookings", "Priority support", "Advanced analytics", "Featured listing (7 days/month)"]', 10, 50, 200, 999, true, false, true),
('pro', 'Professional', 'For established wedding professionals', 3999.00, '["Up to 25 services", "Premium portfolio (100 images)", "Unlimited bookings", "Video consultations (60 min/month)", "Custom branding", "SEO tools", "Export data"]', 25, 100, 500, 999, true, true, true),
('enterprise', 'Enterprise', 'Complete solution for large wedding businesses', 7999.00, '["Unlimited services", "Unlimited portfolio images", "Unlimited bookings", "Unlimited video consultations", "Full custom branding", "Advanced SEO tools", "Multi-location support", "Team management", "API access", "Custom contracts", "Priority phone support"]', 999, 999, 999, 999, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- 6. Update vendors table with sample categories if needed
UPDATE vendors SET category = 'Photography' WHERE category IS NULL AND business_name ILIKE '%photo%';
UPDATE vendors SET category = 'Catering' WHERE category IS NULL AND business_name ILIKE '%cater%';
UPDATE vendors SET category = 'Venues' WHERE category IS NULL AND business_name ILIKE '%venue%';
UPDATE vendors SET category = 'Music & Entertainment' WHERE category IS NULL AND business_name ILIKE '%music%';
UPDATE vendors SET category = 'Flowers & Decoration' WHERE category IS NULL AND business_name ILIKE '%flower%';
UPDATE vendors SET category = 'Wedding Planning' WHERE category IS NULL AND business_name ILIKE '%plan%';
UPDATE vendors SET category = 'Photography' WHERE category IS NULL; -- Default fallback

-- 7. Update users table with roles based on vendor relationship
UPDATE users SET role = 'vendor' WHERE id IN (SELECT DISTINCT user_id FROM vendors WHERE user_id IS NOT NULL);
UPDATE users SET role = 'couple' WHERE role IS NULL;

-- 8. Create sample vendor subscription for existing vendors
INSERT INTO vendor_subscriptions (vendor_id, plan_id, status, current_period_start, current_period_end)
SELECT v.id, 'enterprise', 'active', NOW(), NOW() + INTERVAL '1 month'
FROM vendors v
WHERE NOT EXISTS (SELECT 1 FROM vendor_subscriptions vs WHERE vs.vendor_id = v.id)
ON CONFLICT DO NOTHING;
