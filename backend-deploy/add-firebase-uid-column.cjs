const { sql } = require('./config/database.cjs');

async function addFirebaseUidColumn() {
  try {
    console.log('🔥 Adding firebase_uid column to users table...');
    
    // Add firebase_uid column
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE
    `;
    
    console.log('✅ firebase_uid column added successfully');
    
    // Create index for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_firebase_uid 
      ON users(firebase_uid)
    `;
    
    console.log('✅ Index created for firebase_uid column');
    
    // Verify the column was added
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'firebase_uid'
    `;
    
    if (result.length > 0) {
      console.log('✅ Verification: firebase_uid column exists:', result[0]);
    } else {
      console.log('❌ Verification failed: firebase_uid column not found');
    }
    
  } catch (error) {
    console.error('❌ Error adding firebase_uid column:', error.message);
  }
  
  process.exit(0);
}

addFirebaseUidColumn();
