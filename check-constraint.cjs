const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkConstraint() {
  try {
    console.log('Checking database constraint for bookings status...\n');
    
    const result = await sql`
      SELECT 
        conname, 
        pg_get_constraintdef(oid) as definition 
      FROM pg_constraint 
      WHERE conrelid = 'bookings'::regclass 
      AND contype = 'c'
    `;
    
    console.log('Constraint details:');
    console.log(JSON.stringify(result, null, 2));
    
    // Also check the actual bookings table structure
    console.log('\n\nChecking bookings table structure:');
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position
    `;
    console.log(JSON.stringify(tableInfo, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

checkConstraint();
