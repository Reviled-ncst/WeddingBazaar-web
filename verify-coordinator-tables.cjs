// Test script to verify coordinator advanced features tables exist
const { sql } = require('./backend-deploy/config/database.cjs');
require('dotenv').config();

async function verifyTables() {
  try {
    console.log('🔍 Verifying Coordinator Advanced Features Tables...\n');

    // Check subscription tables
    console.log('📊 Checking Subscription Tables:');
    const subscriptionTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE 'coordinator_subscription%'
      ORDER BY table_name;
    `;
    
    console.log(`✅ Found ${subscriptionTables.length} subscription tables:`);
    subscriptionTables.forEach(t => console.log(`   - ${t.table_name}`));

    // Check profile enhancement tables
    console.log('\n📊 Checking Profile Enhancement Tables:');
    const profileTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('coordinator_portfolio', 'coordinator_testimonials', 
                           'coordinator_specializations', 'coordinator_achievements')
      ORDER BY table_name;
    `;
    
    console.log(`✅ Found ${profileTables.length} profile tables:`);
    profileTables.forEach(t => console.log(`   - ${t.table_name}`));

    // Check if vendor_profiles has new columns
    console.log('\n📊 Checking vendor_profiles enhancements:');
    const vendorProfileColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_profiles' 
        AND column_name IN ('tagline', 'bio', 'certifications', 'social_media', 
                            'portfolio_url', 'is_verified_premium', 'profile_completion_percent')
      ORDER BY column_name;
    `;
    
    console.log(`✅ Found ${vendorProfileColumns.length} new columns in vendor_profiles:`);
    vendorProfileColumns.forEach(c => console.log(`   - ${c.column_name}`));

    // Check subscription plans
    console.log('\n📊 Checking Subscription Plans:');
    try {
      const plans = await sql`
        SELECT plan_code, display_name, price_monthly, commission_rate 
        FROM coordinator_subscription_plans 
        WHERE is_active = true
        ORDER BY sort_order;
      `;
      
      console.log(`✅ Found ${plans.length} subscription plans:`);
      plans.forEach(p => {
        console.log(`   - ${p.display_name} (${p.plan_code}): ₱${p.price_monthly}/mo, ${p.commission_rate}% commission`);
      });
    } catch (error) {
      console.log('⚠️  Subscription plans table exists but no data yet');
    }

    // Check views
    console.log('\n📊 Checking Views:');
    const views = await sql`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
        AND table_name IN ('coordinator_subscription_details', 'coordinator_public_profiles')
      ORDER BY table_name;
    `;
    
    console.log(`✅ Found ${views.length} views:`);
    views.forEach(v => console.log(`   - ${v.table_name}`));

    // Summary
    const totalTables = subscriptionTables.length + profileTables.length;
    console.log('\n' + '='.repeat(60));
    console.log('📋 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Subscription tables: ${subscriptionTables.length}/5`);
    console.log(`✅ Profile tables: ${profileTables.length}/4`);
    console.log(`✅ Views: ${views.length}/2`);
    console.log(`✅ Total new tables: ${totalTables}/9`);
    
    if (totalTables === 9 && views.length === 2) {
      console.log('\n🎉 SUCCESS! All coordinator advanced features tables verified!');
      console.log('✅ Ready to proceed with backend API development.');
      return true;
    } else {
      console.log('\n⚠️  WARNING: Some tables are missing. Please run the SQL migration.');
      console.log('📄 File: create-coordinator-advanced-features.sql');
      return false;
    }

  } catch (error) {
    console.error('❌ Error verifying tables:', error.message);
    console.error('\n💡 ACTION REQUIRED:');
    console.error('   1. Open Neon SQL Console');
    console.error('   2. Execute: create-coordinator-advanced-features.sql');
    console.error('   3. Run this script again\n');
    return false;
  }
}

// Run verification
verifyTables()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
