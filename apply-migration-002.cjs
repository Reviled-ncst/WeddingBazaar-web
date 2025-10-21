const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function applyMigration() {
  try {
    console.log('📋 Reading migration file...\n');
    
    const migrationPath = path.join(__dirname, 'database-migrations', '002-fix-booking-status-history-constraints.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Migration SQL:');
    console.log(migrationSQL);
    console.log('\n🚀 Applying migration...\n');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 100) + '...');
        await sql.unsafe(statement);
        console.log('✅ Success\n');
      }
    }
    
    console.log('✨ Migration completed successfully!');
    
    // Verify the changes
    console.log('\n🔍 Verifying constraints...');
    const result = await sql`
      SELECT 
        conname, 
        pg_get_constraintdef(oid) as definition 
      FROM pg_constraint 
      WHERE conrelid = 'booking_status_history'::regclass 
      AND contype = 'c'
    `;
    
    console.log('\nUpdated constraints:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

applyMigration();
