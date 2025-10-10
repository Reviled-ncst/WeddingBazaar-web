const { sql } = require('./config/database.cjs');

async function debugMessages() {
  console.log('=== DEBUGGING MESSAGE SENDING ISSUE ===');
  
  try {
    // Check messages table schema
    console.log('\n1. Checking messages table schema...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'messages'
      ORDER BY ordinal_position
    `;
    
    console.log('Messages table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check existing messages
    console.log('\n2. Checking existing messages...');
    const messages = await sql`SELECT * FROM messages ORDER BY created_at DESC LIMIT 3`;
    console.log(`Found ${messages.length} existing messages:`);
    messages.forEach((msg, index) => {
      console.log(`\nMessage ${index + 1}:`);
      console.log(`  ID: ${msg.id}`);
      console.log(`  Conversation: ${msg.conversation_id}`);
      console.log(`  Sender: ${msg.sender_id} (${msg.sender_type})`);
      console.log(`  Content: ${msg.content}`);
      console.log(`  Created: ${msg.created_at}`);
      console.log(`  All fields:`, Object.keys(msg));
    });
    
    // Test manual message insertion
    console.log('\n3. Testing manual message insertion...');
    const testMessageId = `msg-test-${Date.now()}`;
    
    try {
      const result = await sql`
        INSERT INTO messages (
          id, conversation_id, sender_id, sender_type, content, 
          message_type, created_at, updated_at
        ) VALUES (
          ${testMessageId}, 'conv-1760025319248-op58182ys', '2-2025-003', 'vendor', 'Test message from debug script',
          'text', NOW(), NOW()
        ) RETURNING *
      `;
      
      console.log('✅ Test message inserted successfully:', result[0]);
      
      // Clean up test message
      await sql`DELETE FROM messages WHERE id = ${testMessageId}`;
      console.log('🧹 Test message cleaned up');
      
    } catch (insertError) {
      console.error('❌ Manual insert failed:', insertError);
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        detail: insertError.detail
      });
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugMessages().catch(console.error);
