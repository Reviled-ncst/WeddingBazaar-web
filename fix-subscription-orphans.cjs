// 🔧 QUICK FIX: Delete orphaned subscriptions and create default subs
// This is a fast solution since orphaned subs aren't linked to anyone

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function quickFixSubscriptions() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🔧 SUBSCRIPTION QUICK FIX                               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const sql = neon(process.env.DATABASE_URL);

  try {
    // 1. Delete all orphaned subscriptions
    console.log('🗑️  STEP 1: Deleting orphaned subscriptions...\n');
    
    const orphanedIds = [
      '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6',
      '2-2025-001', // This is actually an old vendor_id, not a user
      'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1',
      'ac8df757-0a1a-4e99-ac41-159743730569',
      '06d389a4-5c70-4410-a500-59b5bdf24bd2',
      'daf1dd71-b5c7-44a1-bf88-36d41e73a7fa',
      'test-vendor-1761537329090'
    ];

    for (const vendorId of orphanedIds) {
      const deleted = await sql`
        DELETE FROM vendor_subscriptions
        WHERE vendor_id = ${vendorId}
      `;
      console.log(`   Deleted subscriptions for orphaned vendor_id: ${vendorId}`);
    }

    console.log('\n✅ Orphaned subscriptions deleted\n');

    // 2. Get all vendors who need subscriptions
    console.log('👥 STEP 2: Creating default subscriptions for all vendors...\n');
    
    const vendors = await sql`
      SELECT 
        u.id,
        u.email,
        vp.business_name
      FROM users u
      LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
      WHERE u.user_type = 'vendor'
      ORDER BY u.created_at ASC
    `;

    console.log(`Found ${vendors.length} vendors\n`);

    // 3. Create premium subscriptions for all vendors
    let created = 0;
    for (const vendor of vendors) {
      // Check if vendor already has a subscription
      const existing = await sql`
        SELECT id FROM vendor_subscriptions
        WHERE vendor_id = ${vendor.id}
        LIMIT 1
      `;

      if (existing.length === 0) {
        // Create premium subscription (unlimited services)
        // Note: plan_id needs to reference subscription_plans table
        // For now, we'll create without plan_id and use plan_name directly
        await sql`
          INSERT INTO vendor_subscriptions (
            vendor_id,
            plan_name,
            status,
            billing_cycle,
            start_date,
            end_date,
            created_at,
            updated_at
          ) VALUES (
            ${vendor.id},
            'premium',
            'active',
            'monthly',
            NOW(),
            NOW() + INTERVAL '1 year',
            NOW(),
            NOW()
          )
          ON CONFLICT (vendor_id) DO UPDATE SET
            plan_name = 'premium',
            status = 'active',
            updated_at = NOW()
        `;
        console.log(`   ✅ Created premium subscription for: ${vendor.email} (${vendor.business_name || 'N/A'})`);
        created++;
      } else {
        console.log(`   ⏭️  Skipped (already has subscription): ${vendor.email}`);
      }
    }

    console.log(`\n✅ Created ${created} new subscriptions\n`);

    // 4. Verify results
    console.log('🔍 STEP 3: Verifying fix...\n');
    
    const allSubs = await sql`
      SELECT 
        vs.vendor_id,
        vs.plan_name,
        vs.status,
        u.email,
        vp.business_name
      FROM vendor_subscriptions vs
      INNER JOIN users u ON vs.vendor_id = u.id
      LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
      ORDER BY vs.created_at DESC
    `;

    console.log(`Total valid subscriptions: ${allSubs.length}\n`);
    allSubs.forEach((sub, idx) => {
      console.log(`${idx + 1}. ${sub.email} | ${sub.business_name || 'N/A'} | Plan: ${sub.plan_name} (${sub.status})`);
    });

    // Check for remaining orphans
    const remaining = await sql`
      SELECT vs.vendor_id, vs.plan_name
      FROM vendor_subscriptions vs
      LEFT JOIN users u ON vs.vendor_id = u.id
      WHERE u.id IS NULL
    `;

    if (remaining.length > 0) {
      console.log(`\n⚠️  WARNING: ${remaining.length} orphaned subscriptions still exist!`);
    } else {
      console.log('\n✅ SUCCESS: All subscriptions are now properly linked!');
    }

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                   ✅ FIX COMPLETE                         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    console.log('Next steps:');
    console.log('1. Test service creation as a vendor');
    console.log('2. Verify no more "service limit" errors');
    console.log('3. Monitor backend logs for subscription detection\n');

  } catch (error) {
    console.error('❌ Fix error:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run fix
console.log('\n🚀 Starting subscription quick fix...\n');
quickFixSubscriptions()
  .then(() => {
    console.log('✅ Fix complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
