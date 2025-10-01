const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkConversationSchema() {
  try {
    console.log('🔍 CHECKING CONVERSATION TABLE SCHEMA...\n');
    
    // Get actual column structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'conversations' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Conversations table columns:');
    columns.forEach(col => {
      console.log(`  • ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'nullable' : 'not null'}`);
    });
    
    console.log('\n🔍 Sample conversation data:');
    const sampleConv = await sql`SELECT * FROM conversations LIMIT 3`;
    sampleConv.forEach((conv, i) => {
      console.log(`\n${i + 1}. Conversation ID: ${conv.id}`);
      console.log(`   Service Name: ${conv.service_name}`);
      console.log(`   Created: ${conv.created_at}`);
      console.log(`   All Fields:`, Object.keys(conv).join(', '));
    });
    
    // Check if we need to identify the participant mapping
    console.log('\n🗺️  PARTICIPANT MAPPING ANALYSIS:');
    console.log('The conversations table may use different field names for participants.');
    console.log('Checking for messages to understand participant relationships...\n');
    
    // Analyze message senders in conversations
    const msgSenders = await sql`
      SELECT DISTINCT 
        m.conversation_id,
        m.sender_id,
        m.sender_name,
        m.sender_type,
        c.service_name
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.sender_id IN ('1-2025-001', '2-2025-003', '2-2025-004')
      ORDER BY m.conversation_id, m.sender_id
    `;
    
    console.log('📧 Message senders analysis:');
    msgSenders.forEach(sender => {
      console.log(`  Conversation: ${sender.conversation_id}`);
      console.log(`    Sender: ${sender.sender_id} (${sender.sender_name}) - ${sender.sender_type}`);
      console.log(`    Service: ${sender.service_name}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkConversationSchema();
