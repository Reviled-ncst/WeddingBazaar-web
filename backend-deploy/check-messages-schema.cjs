const { sql } = require('./config/database.cjs');

async function checkSchema() {
  try {
    console.log('🔍 Checking messages table schema...');
    
    // Get table schema
    const schema = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'messages' 
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Messages table schema:');
    schema.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Also check if there are any existing messages to see the actual structure
    console.log('\n🔍 Checking existing messages...');
    const existingMessages = await sql`
      SELECT * FROM messages LIMIT 1
    `;
    
    if (existingMessages.length > 0) {
      console.log('📝 Sample message structure:');
      console.log(JSON.stringify(existingMessages[0], null, 2));
    } else {
      console.log('📝 No existing messages found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema check error:', error);
    process.exit(1);
  }
}

checkSchema();
