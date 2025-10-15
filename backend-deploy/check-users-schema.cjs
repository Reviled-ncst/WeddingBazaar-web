const { sql } = require('./config/database.cjs');

async function checkUsersSchema() {
  try {
    console.log('🔍 Checking users table schema...');
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Users table schema:');
    result.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check if firebase_uid column exists
    const hasFirebaseUid = result.some(col => col.column_name === 'firebase_uid');
    console.log('\n🔥 Firebase UID column exists:', hasFirebaseUid);
    
    if (!hasFirebaseUid) {
      console.log('❌ Need to add firebase_uid column to users table');
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  }
  
  process.exit(0);
}

checkUsersSchema();
