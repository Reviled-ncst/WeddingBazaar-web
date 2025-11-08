const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkForeignKeyConstraint() {
  console.log('🔍 Checking services table foreign key constraint...\n');

  try {
    // 1. Check foreign key constraint details
    console.log('1️⃣ Foreign Key Constraint Details:');
    const fkeyInfo = await sql`
      SELECT
          tc.constraint_name,
          tc.table_name,
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
    
    console.log('Foreign Key:', fkeyInfo[0]);
    console.log(`   ${fkeyInfo[0].table_name}.${fkeyInfo[0].column_name} → ${fkeyInfo[0].foreign_table_name}.${fkeyInfo[0].foreign_column_name}`);
    console.log('');

    // 2. Check vendor record for user 2-2025-019
    console.log('2️⃣ Vendor Record for User 2-2025-019:');
    const vendorRecords = await sql`
      SELECT id, user_id, business_name
      FROM vendors
      WHERE user_id = '2-2025-019'
    `;
    
    if (vendorRecords.length === 0) {
      console.log('❌ No vendor record found for user_id = 2-2025-019');
    } else {
      console.log('✅ Vendor record found:');
      vendorRecords.forEach(v => {
        console.log(`   id: ${v.id}`);
        console.log(`   user_id: ${v.user_id}`);
        console.log(`   business_name: ${v.business_name}`);
      });
    }
    console.log('');

    // 3. Check what the foreign key expects
    console.log('3️⃣ Analysis:');
    if (fkeyInfo[0].foreign_column_name === 'id') {
      console.log('⚠️  Foreign key references vendors.id');
      console.log('   This means services.vendor_id must match vendors.id');
      if (vendorRecords.length > 0) {
        console.log(`   For user 2-2025-019, vendors.id = '${vendorRecords[0].id}'`);
        console.log('');
        console.log('🔧 SOLUTION:');
        console.log(`   Frontend should send vendor_id = '${vendorRecords[0].id}' (not '2-2025-019')`);
        console.log('   OR');
        console.log('   Change foreign key to reference vendors.user_id instead of vendors.id');
      }
    } else if (fkeyInfo[0].foreign_column_name === 'user_id') {
      console.log('✅ Foreign key references vendors.user_id');
      console.log('   This means services.vendor_id must match vendors.user_id');
      console.log('   Frontend is correctly sending user_id format');
    }
    console.log('');

    // 4. Check all vendors table ID formats
    console.log('4️⃣ All Vendors ID Formats (sample):');
    const allVendors = await sql`
      SELECT id, user_id, business_name
      FROM vendors
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    console.log('Recent vendors:');
    allVendors.forEach(v => {
      const idFormat = v.id.startsWith('VEN-') ? 'OLD (VEN-XXXXX)' : v.id.startsWith('2-') ? 'NEW (2-YYYY-XXX)' : 'OTHER';
      console.log(`   ${v.id} (${idFormat}) → user_id: ${v.user_id} → ${v.business_name}`);
    });
    console.log('');

    // 5. Recommendation
    console.log('5️⃣ RECOMMENDATION:');
    console.log('Since the database has mixed ID formats (VEN-XXXXX and 2-YYYY-XXX),');
    console.log('the foreign key constraint is likely referencing vendors.id (not user_id).');
    console.log('');
    console.log('OPTIONS:');
    console.log('Option A: Use vendors.id for services.vendor_id');
    console.log('   - Frontend sends VEN-00021 (or whatever vendors.id is)');
    console.log('   - Backend uses vendors.id directly');
    console.log('');
    console.log('Option B: Change foreign key to reference vendors.user_id');
    console.log('   - Run: ALTER TABLE services DROP CONSTRAINT services_vendor_id_fkey;');
    console.log('   - Run: ALTER TABLE services ADD CONSTRAINT services_vendor_id_fkey');
    console.log('          FOREIGN KEY (vendor_id) REFERENCES vendors(user_id);');
    console.log('');
    console.log('Option C: Sync vendors.id to match user_id (2-2025-019)');
    console.log('   - Update vendors SET id = user_id WHERE user_id = \'2-2025-019\';');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkForeignKeyConstraint();
