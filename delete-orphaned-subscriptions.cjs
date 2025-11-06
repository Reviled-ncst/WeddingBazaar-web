// 🔧 SIMPLER FIX: Just delete orphaned subscriptions
// Let vendors use the backend's default 'basic' plan until they upgrade properly

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function simpleFixOrphans() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🔧 SIMPLE FIX: Delete Orphaned Subscriptions           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const sql = neon(process.env.DATABASE_URL);

  try {
    // 1. Delete orphaned subscriptions
    console.log('🗑️  Deleting orphaned subscriptions...\n');
    
    const orphanedIds = [
      '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6',
      '2-2025-001',
      'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1',
      'ac8df757-0a1a-4e99-ac41-159743730569',
      '06d389a4-5c70-4410-a500-59b5bdf24bd2',
      'daf1dd71-b5c7-44a1-bf88-36d41e73a7fa',
      'test-vendor-1761537329090'
    ];

    let deletedCount = 0;
    for (const vendorId of orphanedIds) {
      const deleted = await sql`
        DELETE FROM vendor_subscriptions
        WHERE vendor_id = ${vendorId}
      `;
      if (deleted.count > 0) {
        console.log(`   ✅ Deleted ${deleted.count} subscription(s) for: ${vendorId}`);
        deletedCount += deleted.count;
      }
    }

    console.log(`\n✅ Total deleted: ${deletedCount} orphaned subscriptions\n`);

    // 2. Verify - check remaining subscriptions
    console.log('🔍 Verifying remaining subscriptions...\n');
    
    const remaining = await sql`
      SELECT 
        vs.vendor_id,
        vs.plan_name,
        vs.status,
        u.email,
        vp.business_name
      FROM vendor_subscriptions vs
      LEFT JOIN users u ON vs.vendor_id = u.id
      LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
      ORDER BY u.email
    `;

    console.log(`Total remaining subscriptions: ${remaining.length}\n`);
    
    remaining.forEach((sub, idx) => {
      if (sub.email) {
        console.log(`${idx + 1}. ✅ ${sub.email} | ${sub.business_name || 'N/A'} | ${sub.plan_name}`);
      } else {
        console.log(`${idx + 1}. ❌ ORPHAN: vendor_id=${sub.vendor_id} | ${sub.plan_name}`);
      }
    });

    // 3. Check for any remaining orphans
    const orphansCheck = await sql`
      SELECT vs.vendor_id, vs.plan_name
      FROM vendor_subscriptions vs
      LEFT JOIN users u ON vs.vendor_id = u.id
      WHERE u.id IS NULL
    `;

    console.log(`\n${'='.repeat(60)}\n`);
    if (orphansCheck.length === 0) {
      console.log('✅ SUCCESS: All remaining subscriptions are properly linked!');
      console.log(`\n📊 Summary:`);
      console.log(`   - Deleted: ${deletedCount} orphaned subscriptions`);
      console.log(`   - Remaining: ${remaining.length} valid subscriptions`);
      console.log(`   - Orphaned: 0`);
    } else {
      console.log(`⚠️  WARNING: ${orphansCheck.length} orphaned subscriptions still exist:`);
      orphansCheck.forEach(o => {
        console.log(`   - ${o.vendor_id} (${o.plan_name})`);
      });
    }

    console.log(`\n${'='.repeat(60)}\n`);
    console.log('✅ Orphaned subscriptions removed!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Vendors will now use default "basic" plan (5 services)');
    console.log('2. To grant unlimited services, manually create subscriptions');
    console.log('3. Or update backend to give higher default limits\n');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

console.log('\n🚀 Starting simple orphan cleanup...\n');
simpleFixOrphans()
  .then(() => {
    console.log('✅ Cleanup complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
