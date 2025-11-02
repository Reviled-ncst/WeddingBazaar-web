#!/usr/bin/env node
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function syncVendorsWithUsers() {
  console.log('\n🔄 SYNCING VENDORS TABLE WITH USERS');
  console.log('=' .repeat(60));
  console.log('Purpose: Ensure every vendor user has a matching entry in vendors table');
  console.log('         with vendors.id = users.id (no more VEN-XXXXX)');
  console.log('');
  
  try {
    // 1. Get all vendor users
    console.log('1️⃣ Getting all vendor users...');
    const vendorUsers = await sql`
      SELECT id, email, user_type
      FROM users
      WHERE user_type = 'vendor'
      ORDER BY created_at ASC
    `;
    
    console.log(`   Found ${vendorUsers.length} vendor users:`);
    vendorUsers.forEach((u, idx) => {
      console.log(`   ${idx + 1}. ${u.email} (${u.id})`);
    });
    
    // 2. Check which users already have vendor entries
    console.log('\n2️⃣ Checking existing vendor entries...');
    const existingVendors = await sql`
      SELECT id, user_id, business_name
      FROM vendors
    `;
    
    console.log(`   Found ${existingVendors.length} vendor entries:`);
    existingVendors.forEach((v, idx) => {
      console.log(`   ${idx + 1}. vendors.id: ${v.id}, user_id: ${v.user_id || 'NULL'}, name: ${v.business_name || 'NULL'}`);
    });
    
    // 3. Create missing vendor entries
    console.log('\n3️⃣ Creating missing vendor entries...');
    let created = 0;
    let updated = 0;
    
    for (const user of vendorUsers) {
      // Check if vendor entry exists with this user.id
      const existingByUserId = existingVendors.find(v => v.id === user.id);
      const existingByUserIdRef = existingVendors.find(v => v.user_id === user.id);
      
      if (existingByUserId) {
        console.log(`   ✅ ${user.email}: Entry exists (vendors.id = ${existingByUserId.id})`);
      } else if (existingByUserIdRef) {
        console.log(`   ⚠️  ${user.email}: Found by user_id (${existingByUserIdRef.id}), updating id...`);
        // This case is complex - the FK constraint prevents us from updating id
        // Better to create a new entry
        await sql`
          INSERT INTO vendors (id, user_id, business_name, business_type, created_at, updated_at)
          VALUES (
            ${user.id},
            ${user.id},
            ${user.email.split('@')[0] + ' Business'},
            ${'other'},
            NOW(),
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = ${user.id},
            updated_at = NOW()
        `;
        console.log(`   ✅ Created entry for ${user.email}`);
        created++;
      } else {
        console.log(`   📝 ${user.email}: Creating new entry...`);
        await sql`
          INSERT INTO vendors (id, user_id, business_name, business_type, created_at, updated_at)
          VALUES (
            ${user.id},
            ${user.id},
            ${user.email.split('@')[0] + ' Business'},
            ${'other'},
            NOW(),
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = ${user.id},
            updated_at = NOW()
        `;
        console.log(`   ✅ Created entry for ${user.email} (vendors.id = ${user.id})`);
        created++;
      }
    }
    
    // 4. Verify
    console.log('\n4️⃣ Verifying sync...');
    const finalVendors = await sql`
      SELECT id, user_id, business_name
      FROM vendors
      WHERE id LIKE '2-2025-%' OR id LIKE '3-2025-%'
    `;
    
    console.log(`   Found ${finalVendors.length} vendors with user.id format:`);
    finalVendors.forEach((v, idx) => {
      console.log(`   ${idx + 1}. ${v.business_name} (vendors.id = ${v.id})`);
    });
    
    // 5. Summary
    console.log('\n📊 SYNC SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total vendor users: ${vendorUsers.length}`);
    console.log(`Vendor entries created: ${created}`);
    console.log(`Vendor entries updated: ${updated}`);
    console.log('\n✨ Vendors table is now synced with users table!');
    console.log('   Each vendor user now has vendors.id = users.id');
    
  } catch (error) {
    console.error('\n❌ Sync error:', error);
    console.error('   Message:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run sync
syncVendorsWithUsers()
  .then(() => {
    console.log('\n✅ Sync complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Sync failed:', err);
    process.exit(1);
  });
