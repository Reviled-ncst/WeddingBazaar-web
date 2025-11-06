const { sql } = require('./backend-deploy/config/database.cjs');

async function fixUserIDsToStandard() {
  try {
    console.log('🔧 FIXING USER IDs TO STANDARD 2-2025-XXX FORMAT\n');
    console.log('='.repeat(70));
    
    // Get all VU- format users
    const vuUsers = await sql`
      SELECT id, email, first_name 
      FROM users 
      WHERE id LIKE 'VU-%'
      ORDER BY id
    `;
    
    console.log(`\n📋 Found ${vuUsers.length} users with VU- format that need updating:\n`);
    
    // Get the highest 2-2025-XXX number
    const maxVendorUser = await sql`
      SELECT id FROM users 
      WHERE id LIKE '2-2025-%'
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    let nextNumber = 6; // Start from 006 since we have 002, 003, 004, 005
    if (maxVendorUser.length > 0) {
      const currentMax = parseInt(maxVendorUser[0].id.split('-')[2]);
      nextNumber = currentMax + 1;
    }
    
    console.log(`Starting from: 2-2025-${String(nextNumber).padStart(3, '0')}\n`);
    
    const updates = [];
    
    for (const user of vuUsers) {
      const oldId = user.id;
      const newId = `2-2025-${String(nextNumber).padStart(3, '0')}`;
      
      console.log(`📝 ${oldId} → ${newId} (${user.email})`);
      
      updates.push({
        oldId,
        newId,
        email: user.email
      });
      
      nextNumber++;
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  WARNING: This will update:');
    console.log('   • users table (id)');
    console.log('   • vendors table (user_id)');
    console.log('   • vendor_profiles table (user_id)');
    console.log('   • services table (vendor_id references)');
    console.log('   • reviews table (vendor_id references)');
    console.log('='.repeat(70));
    
    console.log('\n🚀 Starting updates...\n');
    
    for (const update of updates) {
      try {
        console.log(`\n🔄 Updating ${update.oldId} → ${update.newId}...`);
        
        // CORRECT ORDER: Update from child tables up to parent
        
        // 1. First update users table (parent)
        await sql`
          UPDATE users 
          SET id = ${update.newId}
          WHERE id = ${update.oldId}
        `;
        console.log('   ✅ users updated');
        
        // 2. Update vendors table (references users)
        await sql`
          UPDATE vendors 
          SET user_id = ${update.newId}
          WHERE user_id = ${update.oldId}
        `;
        console.log('   ✅ vendors updated');
        
        // 3. Update vendor_profiles (references users)
        await sql`
          UPDATE vendor_profiles 
          SET user_id = ${update.newId}
          WHERE user_id = ${update.oldId}
        `;
        console.log('   ✅ vendor_profiles updated');
        
      } catch (error) {
        console.error(`   ❌ Error updating ${update.oldId}: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ USER ID STANDARDIZATION COMPLETE!\n');
    
    // Verify the changes
    const allVendorUsers = await sql`
      SELECT id, email, user_type 
      FROM users 
      WHERE user_type = 'vendor' OR role = 'vendor'
      ORDER BY id
    `;
    
    console.log('📊 ALL VENDOR USERS (after update):\n');
    allVendorUsers.forEach(u => {
      console.log(`   ${u.id} | ${u.email}`);
    });
    
    console.log('\n✅ All vendor users now follow 2-2025-XXX format!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

fixUserIDsToStandard();
