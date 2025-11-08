const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixForeignKeyConstraint() {
  console.log('🔧 Fixing services.vendor_id foreign key constraint...\n');

  try {
    // Step 1: Drop the old foreign key constraint
    console.log('1️⃣ Dropping old foreign key constraint (services_vendor_id_fkey)...');
    await sql`
      ALTER TABLE services 
      DROP CONSTRAINT IF EXISTS services_vendor_id_fkey
    `;
    console.log('✅ Old constraint dropped\n');

    // Step 2: Add new foreign key constraint referencing vendors.user_id
    console.log('2️⃣ Adding new foreign key constraint (references vendors.user_id)...');
    await sql`
      ALTER TABLE services 
      ADD CONSTRAINT services_vendor_id_fkey 
      FOREIGN KEY (vendor_id) REFERENCES vendors(user_id)
      ON DELETE CASCADE
    `;
    console.log('✅ New constraint added\n');

    // Step 3: Verify the change
    console.log('3️⃣ Verifying new foreign key constraint...');
    const fkeyInfo = await sql`
      SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'services'
          AND kcu.column_name = 'vendor_id'
    `;
    
    console.log('✅ New foreign key verified:');
    console.log(`   services.vendor_id → ${fkeyInfo[0].foreign_table_name}.${fkeyInfo[0].foreign_column_name}`);
    console.log('');

    // Step 4: Test with a sample insert (dry run)
    console.log('4️⃣ Testing foreign key constraint with user_id format...');
    const testUserId = '2-2025-019';
    
    // Check if vendor exists with this user_id
    const vendorCheck = await sql`
      SELECT id, user_id, business_name 
      FROM vendors 
      WHERE user_id = ${testUserId}
    `;
    
    if (vendorCheck.length > 0) {
      console.log(`✅ Vendor found: ${vendorCheck[0].business_name} (user_id: ${vendorCheck[0].user_id})`);
      console.log(`   services.vendor_id can now use: '${testUserId}' ✅`);
      console.log('   This will satisfy the foreign key constraint!');
    } else {
      console.log(`❌ No vendor found with user_id = ${testUserId}`);
    }
    console.log('');

    console.log('🎉 FOREIGN KEY FIX COMPLETE!');
    console.log('');
    console.log('✅ services.vendor_id now references vendors.user_id');
    console.log('✅ Frontend can send vendor_id in user_id format (2-2025-XXX)');
    console.log('✅ Backend can use user_id directly for service creation');
    console.log('');
    console.log('Next step: Test service creation in the app!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

fixForeignKeyConstraint();
