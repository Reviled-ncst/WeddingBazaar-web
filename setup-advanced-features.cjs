// Automated script to create coordinator advanced features tables
const { sql } = require('./backend-deploy/config/database.cjs');
require('dotenv').config();

async function createAdvancedFeaturesTables() {
  try {
    console.log('🚀 Creating Coordinator Advanced Features Tables...\n');

    // 1. Create coordinator_subscription_plans table
    console.log('📊 Step 1/9: Creating coordinator_subscription_plans...');
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_subscription_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plan_code VARCHAR(50) UNIQUE NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        display_name VARCHAR(100),
        description TEXT,
        price_monthly DECIMAL(10,2) NOT NULL,
        price_annual DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'PHP',
        max_active_weddings INTEGER,
        max_clients INTEGER,
        max_portfolio_items INTEGER,
        max_team_members INTEGER DEFAULT 1,
        commission_rate DECIMAL(5,2) NOT NULL,
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
        support_type VARCHAR(50) DEFAULT 'email',
        support_response_hours INTEGER DEFAULT 48,
        analytics_retention_days INTEGER DEFAULT 30,
        is_active BOOLEAN DEFAULT TRUE,
        is_popular BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ coordinator_subscription_plans created');

    // 2. Create coordinator_subscriptions table
    console.log('📊 Step 2/9: Creating coordinator_subscriptions...');
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
        plan_id UUID REFERENCES coordinator_subscription_plans(id),
        status VARCHAR(50) DEFAULT 'active',
        billing_cycle VARCHAR(20) DEFAULT 'monthly',
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'PHP',
        trial_start_date DATE,
        trial_end_date DATE,
        current_period_start DATE NOT NULL,
        current_period_end DATE NOT NULL,
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        cancelled_at TIMESTAMP,
        payment_method VARCHAR(50),
        last_payment_date TIMESTAMP,
        next_billing_date DATE,
        current_active_weddings INTEGER DEFAULT 0,
        current_clients INTEGER DEFAULT 0,
        current_portfolio_items INTEGER DEFAULT 0,
        current_team_members INTEGER DEFAULT 1,
        metadata JSONB,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(coordinator_id)
      )
    `;
    console.log('✅ coordinator_subscriptions created');

    // 3. Create coordinator_subscription_payments table
    console.log('📊 Step 3/9: Creating coordinator_subscription_payments...');
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_subscription_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subscription_id UUID REFERENCES coordinator_subscriptions(id),
        coordinator_id VARCHAR(20) REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'PHP',
        status VARCHAR(50) DEFAULT 'pending',
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
      )
    `;
    console.log('✅ coordinator_subscription_payments created');

    // 4. Create coordinator_feature_usage table
    console.log('📊 Step 4/9: Creating coordinator_feature_usage...');
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_feature_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coordinator_id VARCHAR(20) REFERENCES users(id),
        feature_code VARCHAR(50) NOT NULL,
        usage_count INTEGER DEFAULT 1,
        last_used_at TIMESTAMP DEFAULT NOW(),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ coordinator_feature_usage created');

    // 5. Create coordinator_subscription_audit table
    console.log('📊 Step 5/9: Creating coordinator_subscription_audit...');
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_subscription_audit (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coordinator_id VARCHAR(20) REFERENCES users(id),
        subscription_id UUID REFERENCES coordinator_subscriptions(id),
        action VARCHAR(100) NOT NULL,
        old_plan_code VARCHAR(50),
        new_plan_code VARCHAR(50),
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ coordinator_subscription_audit created');

    // 6. Create coordinator_portfolio table
    console.log('📊 Step 6/9: Creating coordinator_portfolio...');
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_portfolio (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
        wedding_id UUID,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        wedding_date DATE,
        venue VARCHAR(255),
        location VARCHAR(100),
        cover_image_url TEXT NOT NULL,
        images TEXT[],
        video_url TEXT,
        wedding_style VARCHAR(100),
        guest_count INTEGER,
        budget_range VARCHAR(50),
        highlights TEXT[],
        vendors_featured JSONB,
        client_name VARCHAR(100),
        client_testimonial TEXT,
        client_rating DECIMAL(3,2),
        is_featured BOOLEAN DEFAULT FALSE,
        is_public BOOLEAN DEFAULT TRUE,
        display_order INTEGER DEFAULT 0,
        tags TEXT[],
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ coordinator_portfolio created');

    // 7. Create coordinator_testimonials table
    console.log('📊 Step 7/9: Creating coordinator_testimonials...');
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_testimonials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
        portfolio_id UUID REFERENCES coordinator_portfolio(id) ON DELETE SET NULL,
        wedding_id UUID,
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
      )
    `;
    console.log('✅ coordinator_testimonials created');

    // 8. Create coordinator_specializations table
    console.log('📊 Step 8/9: Creating coordinator_specializations...');
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_specializations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
        specialization_type VARCHAR(100) NOT NULL,
        specialization_value VARCHAR(100) NOT NULL,
        proficiency_level VARCHAR(50) DEFAULT 'expert',
        weddings_completed INTEGER DEFAULT 0,
        average_rating DECIMAL(3,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(coordinator_id, specialization_type, specialization_value)
      )
    `;
    console.log('✅ coordinator_specializations created');

    // 9. Create coordinator_achievements table
    console.log('📊 Step 9/9: Creating coordinator_achievements...');
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_achievements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
        achievement_code VARCHAR(50) NOT NULL,
        achievement_name VARCHAR(100) NOT NULL,
        achievement_description TEXT,
        badge_icon_url TEXT,
        badge_color VARCHAR(7),
        earned_at TIMESTAMP DEFAULT NOW(),
        is_visible BOOLEAN DEFAULT TRUE,
        display_order INTEGER DEFAULT 0
      )
    `;
    console.log('✅ coordinator_achievements created');

    console.log('\n🎉 All 9 tables created successfully!\n');
    return true;

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    return false;
  }
}

// Run table creation
createAdvancedFeaturesTables()
  .then(success => {
    if (success) {
      console.log('✅ Database setup Phase 1 complete!');
      console.log('📝 Next: Run verify-coordinator-tables.cjs to confirm\n');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
