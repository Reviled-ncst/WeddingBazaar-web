/**
 * 🗄️ Create Subscription System Database Tables
 * 
 * Creates all necessary tables for the subscription system:
 * 1. vendor_subscriptions - Main subscription records
 * 2. subscription_transactions - Payment history
 * 3. subscription_usage_logs - Usage tracking
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createSubscriptionTables() {
  console.log('🗄️  Creating subscription system tables...\n');
  
  try {
    // 0. Drop all existing subscription tables to start fresh
    console.log('📋 Dropping existing subscription tables (if any)...');
    await sql`DROP TABLE IF EXISTS subscription_usage_logs CASCADE`;
    await sql`DROP TABLE IF EXISTS subscription_transactions CASCADE`;
    await sql`DROP TABLE IF EXISTS vendor_subscriptions CASCADE`;
    console.log('✅ Dropped all existing subscription tables\n');
    
    // 1. Create vendor_subscriptions table
    console.log('📋 Creating vendor_subscriptions table...');
    await sql`
      CREATE TABLE vendor_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id VARCHAR(255) NOT NULL,
        plan_id VARCHAR(50) NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        billing_cycle VARCHAR(20) DEFAULT 'monthly',
        start_date TIMESTAMP DEFAULT NOW(),
        end_date TIMESTAMP,
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        cancelled_at TIMESTAMP,
        trial_end_date TIMESTAMP,
        paymongo_customer_id VARCHAR(255),
        paymongo_subscription_id VARCHAR(255),
        current_period_start TIMESTAMP DEFAULT NOW(),
        current_period_end TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ vendor_subscriptions table created\n');
    
    // 2. Drop existing subscription_transactions if it exists with wrong type
    console.log('📋 Checking/dropping existing subscription_transactions table...');
    try {
      await sql`DROP TABLE IF EXISTS subscription_transactions CASCADE`;
      console.log('✅ Dropped existing table (if any)\n');
    } catch (err) {
      console.log('⚠️  Table did not exist or could not be dropped\n');
    }
    
    // 2. Create subscription_transactions table
    console.log('📋 Creating subscription_transactions table...');
    await sql`
      CREATE TABLE subscription_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subscription_id UUID REFERENCES vendor_subscriptions(id) ON DELETE CASCADE,
        vendor_id VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'PHP',
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        paymongo_payment_intent_id VARCHAR(255),
        paymongo_payment_method_id VARCHAR(255),
        transaction_type VARCHAR(50),
        description TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        paid_at TIMESTAMP
      )
    `;
    console.log('✅ subscription_transactions table created\n');
    
    // 3. Create subscription_usage_logs table
    console.log('📋 Creating subscription_usage_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS subscription_usage_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id VARCHAR(255) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        quantity INTEGER DEFAULT 1,
        current_usage INTEGER,
        limit_value INTEGER,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ subscription_usage_logs table created\n');
    
    // 4. Create indexes for performance
    console.log('📋 Creating indexes...');
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_vendor_id 
      ON vendor_subscriptions(vendor_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_status 
      ON vendor_subscriptions(status)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_subscription_transactions_subscription_id 
      ON subscription_transactions(subscription_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_subscription_transactions_vendor_id 
      ON subscription_transactions(vendor_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_subscription_usage_logs_vendor_id 
      ON subscription_usage_logs(vendor_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_subscription_usage_logs_created_at 
      ON subscription_usage_logs(created_at)
    `;
    
    console.log('✅ All indexes created\n');
    
    // 5. Verify tables were created
    console.log('🔍 Verifying tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%subscription%'
      ORDER BY table_name
    `;
    
    console.log('✅ Found subscription tables:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    console.log('\n🎉 Subscription system database setup complete!\n');
    console.log('📋 Next Steps:');
    console.log('   1. Rerun test suite: node test-subscription-system.js');
    console.log('   2. Expected result: More tests passing (no more 500 errors)');
    console.log('   3. Remaining 401 errors are normal (need auth token)\n');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run the migration
createSubscriptionTables();
