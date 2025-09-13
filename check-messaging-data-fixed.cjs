const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkVendorMessagingData() {
  try {
    console.log('\n🔍 Checking vendor messaging data with correct schema...\n');
    
    // Check conversations data
    console.log('📋 Current conversations:');
    const conversations = await sql`
      SELECT *
      FROM conversations
      ORDER BY created_at DESC
    `;
    
    if (conversations.length === 0) {
      console.log('❌ No conversations found');
    } else {
      conversations.forEach(conv => {
        console.log(`- Conversation ${conv.id}:`);
        console.log(`  Participant: ${conv.participant_name} (${conv.participant_id}) - Type: ${conv.participant_type}`);
        console.log(`  Creator: ${conv.creator_id} - Type: ${conv.creator_type}`);
        console.log(`  Last message: ${conv.last_message || 'None'}`);
        console.log(`  Service: ${conv.service_name || 'None'}`);
        console.log();
      });
    }

    // Check messages for vendor 2-2025-003
    const vendorId = '2-2025-003';
    console.log(`📨 Messages where vendor ${vendorId} is involved:`);
    
    const vendorConversations = await sql`
      SELECT *
      FROM conversations
      WHERE participant_id = ${vendorId} OR creator_id = ${vendorId}
    `;

    if (vendorConversations.length === 0) {
      console.log('❌ No conversations found for this vendor');
    } else {
      console.log(`Found ${vendorConversations.length} conversations for vendor:`);
      for (const conv of vendorConversations) {
        console.log(`\n- Conversation ${conv.id}:`);
        console.log(`  Participant: ${conv.participant_name} (${conv.participant_id})`);
        console.log(`  Creator: ${conv.creator_id}`);
        
        // Get messages for this conversation
        const messages = await sql`
          SELECT *
          FROM messages
          WHERE conversation_id = ${conv.id}
          ORDER BY created_at ASC
        `;
        
        console.log(`  Messages (${messages.length}):`);
        messages.forEach(msg => {
          console.log(`    ${msg.sender_name}: ${msg.content.substring(0, 50)}...`);
        });
      }
    }

    // Check if there are any customers to create conversations with
    console.log('\n👥 Available customers (individuals) for messaging:');
    const customers = await sql`
      SELECT id, name, email, role, user_type
      FROM users
      WHERE role = 'individual' OR user_type = 'individual'
      ORDER BY id
    `;

    if (customers.length === 0) {
      console.log('❌ No customer accounts found');
    } else {
      customers.forEach(customer => {
        console.log(`- ${customer.name} (${customer.email}) - ID: ${customer.id}`);
      });
    }

    // Check all messages to see the pattern
    console.log('\n📨 All messages in system:');
    const allMessages = await sql`
      SELECT m.*, c.participant_id, c.creator_id
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      ORDER BY m.created_at DESC
      LIMIT 10
    `;

    allMessages.forEach(msg => {
      console.log(`- ${msg.sender_name} (${msg.sender_id}) in conversation ${msg.conversation_id}`);
      console.log(`  Conversation: participant=${msg.participant_id}, creator=${msg.creator_id}`);
      console.log(`  Message: ${msg.content.substring(0, 50)}...`);
      console.log();
    });

  } catch (error) {
    console.error('❌ Error checking vendor messaging data:', error);
  }
}

checkVendorMessagingData();
