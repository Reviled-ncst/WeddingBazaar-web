const { sql } = require('./backend-deploy/config/database.cjs');

async function fixUserIDsWithTransaction() {
  try {
    console.log('🔧 FIXING USER IDs WITH CASCADE UPDATE\n');
    console.log('='.repeat(70));
    
    // Get all VU- format users
    const vuUsers = await sql`
      SELECT u.id, u.email, u.first_name, v.id as vendor_id
      FROM users u
      LEFT JOIN vendors v ON v.user_id = u.id
      WHERE u.id LIKE 'VU-%'
      ORDER BY u.id
    `;
    
    console.log(`\n📋 Found ${vuUsers.length} users to update\n`);
    
    let nextNumber = 6;
    const updates = [];
    
    for (const user of vuUsers) {
      const newId = `2-2025-${String(nextNumber).padStart(3, '0')}`;
      console.log(`${user.id} → ${newId} (${user.email})`);
      updates.push({
        oldId: user.id,
        newId: newId,
        vendorId: user.vendor_id
      });
      nextNumber++;
    }
    
    console.log('\n🚀 Updating with all related tables...\n');
    
    for (const update of updates) {
      try {
        console.log(`\n🔄 ${update.oldId} → ${update.newId}...`);
        
        // Use a single transaction with all updates
        await sql.begin(async sql => {
          // 1. Update vendors table first
          await sql`
            UPDATE vendors 
            SET user_id = ${update.newId}
            WHERE user_id = ${update.oldId}
          `;
          
          // 2. Update vendor_profiles
          await sql`
            UPDATE vendor_profiles 
            SET user_id = ${update.newId}
            WHERE user_id = ${update.oldId}
          `;
          
          // 3. Update users table last
          await sql`
            UPDATE users 
            SET id = ${update.newId}
            WHERE id = ${update.oldId}
          `;
        });
        
        console.log('   ✅ All tables updated successfully');
        
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ VERIFICATION\n');
    
    const allVendorUsers = await sql`
      SELECT id, email 
      FROM users 
      WHERE user_type = 'vendor' OR role = 'vendor'
      ORDER BY id
    `;
    
    console.log('📊 All Vendor Users:\n');
    allVendorUsers.forEach(u => {
      const prefix = u.id.startsWith('2-2025-') ? '✅' : '⚠️';
      console.log(`   ${prefix} ${u.id} | ${u.email}`);
    });
    
    const remaining = allVendorUsers.filter(u => !u.id.startsWith('2-2025-') && !u.id.startsWith('1-2025-'));
    if (remaining.length === 0) {
      console.log('\n🎉 SUCCESS! All vendor users now use 2-2025-XXX format!');
    } else {
      console.log(`\n⚠️ ${remaining.length} users still need updating`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

fixUserIDsWithTransaction();
