const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    console.log('Checking package_items constraint...');
    const constraints = await sql`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'package_items'::regclass
      AND conname LIKE '%valid%'
    `;
    console.log('✅ Constraints found:');
    console.log(JSON.stringify(constraints, null, 2));
    
    console.log('\nChecking package_items columns...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'package_items'
      ORDER BY ordinal_position
    `;
    console.log('✅ Columns:');
    console.log(JSON.stringify(columns, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
