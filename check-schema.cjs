const { sql } = require('./backend-deploy/config/database.cjs');

async function checkConversationsSchema() {
  console.log('=== CHECKING CONVERSATIONS TABLE SCHEMA ===');
  
  try {
    // Get table structure
    const schema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'conversations'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Conversations table schema:');
    schema.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
    });
    
  } catch (error) {
    console.error('❌ Schema check error:', error.message);
  }
  
  process.exit(0);
}

checkConversationsSchema();
