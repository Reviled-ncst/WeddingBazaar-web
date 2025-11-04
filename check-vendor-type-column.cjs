require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkVendorTypeColumn() {
  try {
    console.log('🔍 Checking vendor_type column in vendor_profiles...\n');
    
    // Check column exists
    const columnCheck = await sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'vendor_profiles' 
      AND column_name = 'vendor_type'
    `;
    
    if (columnCheck.length === 0) {
      console.log('❌ vendor_type column DOES NOT EXIST in vendor_profiles table!');
      console.log('   This is why updates are failing!\n');
      
      console.log('📋 All columns in vendor_profiles:');
      const allColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'vendor_profiles' 
        ORDER BY ordinal_position
      `;
      allColumns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('✅ vendor_type column EXISTS:');
      console.log(`   Type: ${columnCheck[0].data_type}`);
      console.log(`   Default: ${columnCheck[0].column_default || 'NULL'}`);
      console.log(`   Nullable: ${columnCheck[0].is_nullable}`);
      
      // Check sample data
      console.log('\n📊 Sample vendor_type values:');
      const samples = await sql`
        SELECT id, user_id, business_name, vendor_type 
        FROM vendor_profiles 
        LIMIT 5
      `;
      samples.forEach(v => {
        console.log(`   ${v.user_id}: ${v.vendor_type || '(NULL)'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkVendorTypeColumn();
