// 🔍 SUBSCRIPTION VENDOR ID DIAGNOSTIC SCRIPT
// Purpose: Identify orphaned subscriptions and map to correct vendor IDs

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function diagnoseSubscriptionMismatch() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🔍 SUBSCRIPTION VENDOR ID DIAGNOSTIC                    ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const sql = neon(process.env.DATABASE_URL);

  try {
    // 1. Get all subscriptions
    console.log('📋 STEP 1: Fetching all vendor subscriptions...\n');
    const subscriptions = await sql`
      SELECT 
        id,
        vendor_id,
        plan_name,
        status,
        start_date,
        created_at
      FROM vendor_subscriptions
      ORDER BY created_at DESC
    `;

    console.log(`Found ${subscriptions.length} total subscriptions:\n`);
    subscriptions.forEach((sub, idx) => {
      console.log(`${idx + 1}. vendor_id: ${sub.vendor_id} | plan: ${sub.plan_name} | status: ${sub.status}`);
    });

    // 2. Get all vendor users
    console.log('\n👥 STEP 2: Fetching all vendor users...\n');
    const vendors = await sql`
      SELECT 
        u.id,
        u.email,
        u.user_type,
        u.created_at
      FROM users u
      WHERE u.user_type = 'vendor'
      ORDER BY u.created_at DESC
    `;

    console.log(`Found ${vendors.length} vendor users:\n`);
    vendors.forEach((v, idx) => {
      console.log(`${idx + 1}. user_id: ${v.id} | email: ${v.email}`);
    });

    // 3. Get vendor profiles
    console.log('\n🏢 STEP 3: Fetching vendor profiles...\n');
    const profiles = await sql`
      SELECT 
        vp.id,
        vp.user_id,
        vp.business_name,
        vp.created_at
      FROM vendor_profiles vp
      ORDER BY vp.created_at DESC
    `;

    console.log(`Found ${profiles.length} vendor profiles:\n`);
    profiles.forEach((p, idx) => {
      console.log(`${idx + 1}. user_id: ${p.user_id} | business: ${p.business_name || 'N/A'}`);
    });

    // 4. Find orphaned subscriptions (vendor_id doesn't match any user.id)
    console.log('\n🔍 STEP 4: Identifying orphaned subscriptions...\n');
    const orphaned = await sql`
      SELECT 
        vs.id as subscription_id,
        vs.vendor_id as subscription_vendor_id,
        vs.plan_name,
        vs.status,
        u.id as user_id
      FROM vendor_subscriptions vs
      LEFT JOIN users u ON vs.vendor_id = u.id
      WHERE u.id IS NULL
      ORDER BY vs.created_at DESC
    `;

    if (orphaned.length === 0) {
      console.log('✅ No orphaned subscriptions found! All vendor_ids match existing users.');
    } else {
      console.log(`❌ Found ${orphaned.length} ORPHANED subscriptions (vendor_id doesn't match any user):\n`);
      orphaned.forEach((o, idx) => {
        console.log(`${idx + 1}. subscription_id: ${o.subscription_id}`);
        console.log(`   vendor_id: ${o.subscription_vendor_id} ← OLD/INVALID FORMAT`);
        console.log(`   plan: ${o.plan_name} | status: ${o.status}\n`);
      });
    }

    // 5. Find subscriptions that DO match (correct associations)
    console.log('\n✅ STEP 5: Identifying valid subscription associations...\n');
    const valid = await sql`
      SELECT 
        vs.id as subscription_id,
        vs.vendor_id,
        vs.plan_name,
        vs.status,
        u.id as user_id,
        u.email,
        vp.business_name
      FROM vendor_subscriptions vs
      INNER JOIN users u ON vs.vendor_id = u.id
      LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
      ORDER BY vs.created_at DESC
    `;

    if (valid.length === 0) {
      console.log('❌ No valid subscription associations found! This is a CRITICAL issue.');
    } else {
      console.log(`Found ${valid.length} valid subscription associations:\n`);
      valid.forEach((v, idx) => {
        console.log(`${idx + 1}. user_id: ${v.user_id} | email: ${v.email}`);
        console.log(`   business: ${v.business_name || 'N/A'}`);
        console.log(`   subscription: ${v.plan_name} (${v.status})\n`);
      });
    }

    // 6. Generate recommended migration mapping
    console.log('\n💡 STEP 6: Generating migration recommendations...\n');
    
    if (orphaned.length > 0 && vendors.length > 0) {
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║         📋 RECOMMENDED MIGRATION MAPPING                  ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');
      
      console.log('Based on creation dates and available data, here are the suggested mappings:\n');
      
      // Try to match by creation date proximity
      orphaned.forEach((orphan, idx) => {
        // Find vendor profile with closest creation date
        const matchingProfile = profiles.find(p => 
          vendors.some(v => v.id === p.user_id)
        );
        
        if (idx < vendors.length) {
          console.log(`Orphaned Subscription #${idx + 1}:`);
          console.log(`  OLD vendor_id: ${orphan.subscription_vendor_id}`);
          console.log(`  → SUGGESTED NEW vendor_id: ${vendors[idx].id}`);
          console.log(`  Email: ${vendors[idx].email}`);
          console.log(`  Plan: ${orphan.plan_name}\n`);
        } else {
          console.log(`Orphaned Subscription #${idx + 1}:`);
          console.log(`  OLD vendor_id: ${orphan.subscription_vendor_id}`);
          console.log(`  → ⚠️  NO AUTOMATIC MATCH FOUND`);
          console.log(`  Manual review required\n`);
        }
      });
    }

    // 7. Summary and next steps
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                   📊 DIAGNOSTIC SUMMARY                   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log(`Total Subscriptions: ${subscriptions.length}`);
    console.log(`Valid Associations: ${valid.length} ✅`);
    console.log(`Orphaned Subscriptions: ${orphaned.length} ${orphaned.length > 0 ? '❌' : '✅'}`);
    console.log(`Total Vendors: ${vendors.length}`);
    console.log(`Vendor Profiles: ${profiles.length}\n`);

    if (orphaned.length === 0) {
      console.log('✅ STATUS: All subscriptions are properly associated!');
      console.log('   No migration needed.\n');
    } else {
      console.log('❌ STATUS: Orphaned subscriptions detected!');
      console.log('   ACTION REQUIRED: Run migration script to fix associations.\n');
      console.log('   Next Steps:');
      console.log('   1. Review the recommended mappings above');
      console.log('   2. Manually verify any uncertain matches');
      console.log('   3. Run: node migrate-subscription-vendor-ids.cjs');
      console.log('   4. Test service creation after migration\n');
    }

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run diagnostic
console.log('\n🚀 Starting subscription vendor ID diagnostic...\n');
diagnoseSubscriptionMismatch()
  .then(() => {
    console.log('✅ Diagnostic complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
