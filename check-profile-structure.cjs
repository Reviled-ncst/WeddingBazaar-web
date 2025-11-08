require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('=== CHECKING VENDOR_PROFILES TABLE STRUCTURE ===\n');
  
  try {
    // Get all columns from vendor_profiles table
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'vendor_profiles'
      ORDER BY ordinal_position
    `;
    
    console.log('vendor_profiles columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Get one vendor profile to see actual data
    console.log('\n=== SAMPLE VENDOR PROFILE (2-2025-019) ===');
    const profile = await sql`SELECT * FROM vendor_profiles WHERE user_id = '2-2025-019'`;
    console.log('Available fields:', Object.keys(profile[0] || {}));
    console.log('\nFull data:');
    console.log(JSON.stringify(profile, null, 2));
    
    console.log('\n=== DONE ===');
  } catch (error) {
    console.error('ERROR:', error.message);
  }
  
  process.exit(0);
})();
