-- ✨ COMPLETE SUBSCRIPTION SYSTEM DATABASE SCHEMA
-- Run this in Neon SQL Editor to create all necessary tables

-- =====================================================
-- 1. UPDATE vendor_subscriptions table with new fields
-- =====================================================

-- First, check if table exists and add missing columns
ALTER TABLE vendor_subscriptions 
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS payment_method_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS paymongo_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- Update status enum to include new statuses
ALTER TABLE vendor_subscriptions
ALTER COLUMN status TYPE VARCHAR(20);

-- Add comments for documentation
COMMENT ON COLUMN vendor_subscriptions.trial_end_date IS 'End date of trial period (if applicable)';
COMMENT ON COLUMN vendor_subscriptions.payment_method_id IS 'PayMongo payment method ID for recurring billing';
COMMENT ON COLUMN vendor_subscriptions.paymongo_customer_id IS 'PayMongo customer ID for the vendor';
COMMENT ON COLUMN vendor_subscriptions.next_billing_date IS 'Next date when recurring billing will occur';
COMMENT ON COLUMN vendor_subscriptions.cancel_at_period_end IS 'Whether to cancel at end of current period';
COMMENT ON COLUMN vendor_subscriptions.cancelled_at IS 'Timestamp when subscription was cancelled';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_vendor_id 
ON vendor_subscriptions(vendor_id);

CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_status 
ON vendor_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_next_billing 
ON vendor_subscriptions(next_billing_date);

CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_paymongo_customer 
ON vendor_subscriptions(paymongo_customer_id);

-- =====================================================
-- 2. CREATE subscription_transactions table
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES vendor_subscriptions(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL,
  -- Types: 'initial_payment', 'recurring_payment', 'upgrade', 'downgrade', 
  --        'cancellation', 'refund', 'admin_created'
  amount INTEGER NOT NULL, -- Amount in centavos (₱1.00 = 100)
  currency VARCHAR(3) DEFAULT 'PHP',
  status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  payment_intent_id VARCHAR(255),
  payment_method_id VARCHAR(255),
  metadata JSONB, -- Additional data (proration details, error messages, etc.)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_subscription_id 
ON subscription_transactions(subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscription_transactions_created_at 
ON subscription_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_subscription_transactions_status 
ON subscription_transactions(status);

CREATE INDEX IF NOT EXISTS idx_subscription_transactions_type 
ON subscription_transactions(transaction_type);

-- Add comments
COMMENT ON TABLE subscription_transactions IS 'Transaction history for all subscription-related payments';
COMMENT ON COLUMN subscription_transactions.amount IS 'Amount in centavos (₱100.00 = 10000)';
COMMENT ON COLUMN subscription_transactions.metadata IS 'JSON data: proration, error messages, admin notes, etc.';

-- =====================================================
-- 3. CREATE subscription_usage_logs table
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(100) NOT NULL,
  subscription_id UUID REFERENCES vendor_subscriptions(id) ON DELETE SET NULL,
  resource_type VARCHAR(50) NOT NULL, 
  -- Types: 'service', 'portfolio_image', 'booking', 'message', 'video_call'
  action VARCHAR(20) NOT NULL, -- 'created', 'deleted', 'updated'
  resource_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_usage_logs_vendor_id 
ON subscription_usage_logs(vendor_id);

CREATE INDEX IF NOT EXISTS idx_usage_logs_subscription_id 
ON subscription_usage_logs(subscription_id);

CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at 
ON subscription_usage_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_usage_logs_resource_type 
ON subscription_usage_logs(resource_type);

-- Add comments
COMMENT ON TABLE subscription_usage_logs IS 'Track resource usage for subscription limits and analytics';

-- =====================================================
-- 4. CREATE helpful views for analytics
-- =====================================================

-- View: Active subscriptions with vendor details
CREATE OR REPLACE VIEW active_subscriptions_view AS
SELECT 
  vs.id,
  vs.vendor_id,
  vs.plan_name,
  vs.billing_cycle,
  vs.status,
  vs.start_date,
  vs.end_date,
  vs.next_billing_date,
  vs.cancel_at_period_end,
  u.email as vendor_email,
  u.full_name as vendor_name,
  vp.business_name,
  vp.phone,
  CASE 
    WHEN vs.plan_name = 'basic' THEN 0
    WHEN vs.plan_name = 'premium' THEN 99900
    WHEN vs.plan_name = 'pro' THEN 199900
    WHEN vs.plan_name = 'enterprise' THEN 499900
    ELSE 0
  END as monthly_value
FROM vendor_subscriptions vs
LEFT JOIN users u ON vs.vendor_id = u.id
LEFT JOIN vendor_profiles vp ON vs.vendor_id = vp.vendor_id
WHERE vs.status IN ('active', 'trial');

-- View: Monthly recurring revenue (MRR)
CREATE OR REPLACE VIEW monthly_recurring_revenue AS
SELECT 
  DATE_TRUNC('month', start_date) as month,
  plan_name,
  COUNT(*) as subscription_count,
  SUM(
    CASE 
      WHEN plan_name = 'premium' THEN 99900
      WHEN plan_name = 'pro' THEN 199900
      WHEN plan_name = 'enterprise' THEN 499900
      ELSE 0
    END
  ) as mrr
FROM vendor_subscriptions
WHERE status IN ('active', 'trial')
GROUP BY DATE_TRUNC('month', start_date), plan_name
ORDER BY month DESC;

-- View: Subscription churn metrics
CREATE OR REPLACE VIEW subscription_churn_metrics AS
SELECT 
  DATE_TRUNC('month', cancelled_at) as month,
  plan_name,
  COUNT(*) as churned_count,
  SUM(
    CASE 
      WHEN plan_name = 'premium' THEN 99900
      WHEN plan_name = 'pro' THEN 199900
      WHEN plan_name = 'enterprise' THEN 499900
      ELSE 0
    END
  ) as churned_revenue
FROM vendor_subscriptions
WHERE status = 'cancelled'
AND cancelled_at IS NOT NULL
GROUP BY DATE_TRUNC('month', cancelled_at), plan_name
ORDER BY month DESC;

-- View: Vendor usage summary
CREATE OR REPLACE VIEW vendor_usage_summary AS
SELECT 
  vs.vendor_id,
  vs.plan_name,
  vs.status,
  COUNT(DISTINCT s.id) as services_count,
  COUNT(DISTINCT pi.id) as portfolio_items_count,
  COUNT(DISTINCT CASE 
    WHEN b.created_at >= DATE_TRUNC('month', CURRENT_DATE) 
    THEN b.id 
  END) as bookings_this_month,
  COUNT(DISTINCT CASE 
    WHEN m.created_at >= DATE_TRUNC('month', CURRENT_DATE) 
    THEN m.id 
  END) as messages_this_month
FROM vendor_subscriptions vs
LEFT JOIN services s ON vs.vendor_id = s.vendor_id
LEFT JOIN portfolio_images pi ON vs.vendor_id = pi.vendor_id
LEFT JOIN bookings b ON vs.vendor_id = b.vendor_id
LEFT JOIN conversations c ON vs.vendor_id = c.vendor_id
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE vs.status IN ('active', 'trial')
GROUP BY vs.vendor_id, vs.plan_name, vs.status;

-- =====================================================
-- 5. CREATE trigger to update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to subscription_transactions
DROP TRIGGER IF EXISTS update_subscription_transactions_updated_at ON subscription_transactions;
CREATE TRIGGER update_subscription_transactions_updated_at
BEFORE UPDATE ON subscription_transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to vendor_subscriptions
DROP TRIGGER IF EXISTS update_vendor_subscriptions_updated_at ON vendor_subscriptions;
CREATE TRIGGER update_vendor_subscriptions_updated_at
BEFORE UPDATE ON vendor_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. INSERT sample data for testing (OPTIONAL)
-- =====================================================

-- Uncomment below to insert test data
/*
-- Sample: Create a free tier subscription
INSERT INTO vendor_subscriptions (
  vendor_id,
  plan_name,
  billing_cycle,
  status,
  start_date,
  end_date,
  next_billing_date
) VALUES (
  'test-vendor-123',
  'basic',
  'monthly',
  'active',
  NOW(),
  NOW() + INTERVAL '1 month',
  NOW() + INTERVAL '1 month'
);

-- Sample: Create a premium trial subscription
INSERT INTO vendor_subscriptions (
  vendor_id,
  plan_name,
  billing_cycle,
  status,
  start_date,
  end_date,
  trial_end_date,
  next_billing_date
) VALUES (
  'test-vendor-456',
  'premium',
  'monthly',
  'trial',
  NOW(),
  NOW() + INTERVAL '1 month',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days'
);
*/

-- =====================================================
-- 7. VERIFY INSTALLATION
-- =====================================================

-- Check if all tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('vendor_subscriptions', 'subscription_transactions', 'subscription_usage_logs')
ORDER BY table_name;

-- Check if all views exist
SELECT 
  table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE '%subscription%'
ORDER BY table_name;

-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN ('vendor_subscriptions', 'subscription_transactions', 'subscription_usage_logs')
ORDER BY tablename, indexname;

-- ✅ INSTALLATION COMPLETE!
-- Run this query to verify everything is set up correctly
SELECT 
  'Subscription System Installation Complete!' as message,
  (SELECT COUNT(*) FROM vendor_subscriptions) as total_subscriptions,
  (SELECT COUNT(*) FROM subscription_transactions) as total_transactions,
  (SELECT COUNT(*) FROM subscription_usage_logs) as total_usage_logs;
