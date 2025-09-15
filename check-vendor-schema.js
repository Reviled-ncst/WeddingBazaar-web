const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  try {
    console.log('Checking vendor_profiles table schema...');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_profiles' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\nvendor_profiles columns:');
    columns.forEach(col => console.log(`- ${col.column_name}: ${col.data_type}`));
    
    console.log('\nChecking actual vendors data...');
    const vendors = await sql`SELECT * FROM vendor_profiles LIMIT 1`;
    if (vendors.length > 0) {
      console.log('\nSample vendor columns:');
      Object.keys(vendors[0]).forEach(key => {
        console.log(`- ${key}: ${typeof vendors[0][key]}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema();
