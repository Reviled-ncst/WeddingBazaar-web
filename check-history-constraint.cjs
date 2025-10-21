const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkHistoryConstraint() {
  try {
    console.log('Checking booking_status_history table constraint...\n');
    
    const result = await sql`
      SELECT 
        conname, 
        pg_get_constraintdef(oid) as definition 
      FROM pg_constraint 
      WHERE conrelid = 'booking_status_history'::regclass 
      AND contype = 'c'
    `;
    
    console.log('Constraint details:');
    console.log(JSON.stringify(result, null, 2));
    
    // Check table structure
    console.log('\n\nChecking booking_status_history table structure:');
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'booking_status_history'
      ORDER BY ordinal_position
    `;
    console.log(JSON.stringify(tableInfo, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

checkHistoryConstraint();
