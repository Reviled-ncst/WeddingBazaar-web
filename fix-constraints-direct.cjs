const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixConstraints() {
  try {
    console.log('Step 1: Dropping old constraints...\n');
    
    // Drop old constraints
    await sql`ALTER TABLE booking_status_history DROP CONSTRAINT IF EXISTS booking_status_history_new_status_check`;
    console.log('✅ Dropped new_status constraint');
    
    await sql`ALTER TABLE booking_status_history DROP CONSTRAINT IF EXISTS booking_status_history_changed_by_user_type_check`;
    console.log('✅ Dropped changed_by_user_type constraint');
    
    console.log('\nStep 2: Adding new constraints...\n');
    
    // Add new status constraint with correct values
    await sql`
      ALTER TABLE booking_status_history
      ADD CONSTRAINT booking_status_history_new_status_check 
      CHECK (new_status IN ('request', 'approved', 'downpayment', 'fully_paid', 'completed', 'declined', 'cancelled'))
    `;
    console.log('✅ Added new_status constraint with correct values');
    
    // Add new user_type constraint with 'system'
    await sql`
      ALTER TABLE booking_status_history
      ADD CONSTRAINT booking_status_history_changed_by_user_type_check
      CHECK (changed_by_user_type IN ('vendor', 'couple', 'admin', 'system'))
    `;
    console.log('✅ Added changed_by_user_type constraint with system support');
    
    console.log('\n✨ All constraints updated successfully!');
    
    // Verify
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
    result.forEach(r => {
      console.log(`\n${r.conname}:`);
      console.log(r.definition);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

fixConstraints();
