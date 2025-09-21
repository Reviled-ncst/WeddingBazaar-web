const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkMessagingData() {
  try {
    console.log('🔍 Checking messaging data for vendor 2-2025-003...\n');
    
    // Check conversations table structure
    console.log('📋 Conversations table structure:');
    const convSchema = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'conversations'
      ORDER BY ordinal_position
    `;
    convSchema.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));
    
    // Check all conversations
    console.log('\n📋 All conversations:');
    const allConversations = await sql`SELECT * FROM conversations ORDER BY created_at DESC LIMIT 5`;
    allConversations.forEach((conv, i) => {
      console.log(`  ${i+1}. ID: ${conv.id}, Vendor: ${conv.vendor_id}, User: ${conv.user_id}`);
    });
    
    // Check for conversations with vendor 2-2025-003
    console.log('\n🔍 Conversations for vendor 2-2025-003:');
    const vendorConversations = await sql`
      SELECT * FROM conversations 
      WHERE vendor_id = '2-2025-003'
    `;
    
    if (vendorConversations.length === 0) {
      console.log('❌ No conversations found for vendor 2-2025-003');
    } else {
      console.log(`✅ Found ${vendorConversations.length} conversations:`);
      vendorConversations.forEach((conv, i) => {
        console.log(`  ${i+1}. ${conv.id} - User: ${conv.user_id}, Created: ${conv.created_at}`);
      });
    }
    
    // Check messages table structure
    console.log('\n📨 Messages table structure:');
    const msgSchema = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'messages'
      ORDER BY ordinal_position
    `;
    msgSchema.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));
    
    // Check recent messages
    console.log('\n📨 Recent messages:');
    const recentMessages = await sql`
      SELECT m.*, c.vendor_id 
      FROM messages m 
      JOIN conversations c ON m.conversation_id = c.id 
      ORDER BY m.created_at DESC 
      LIMIT 5
    `;
    
    recentMessages.forEach((msg, i) => {
      console.log(`  ${i+1}. Conversation: ${msg.conversation_id}, From: ${msg.sender_id}, Vendor: ${msg.vendor_id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkMessagingData();
