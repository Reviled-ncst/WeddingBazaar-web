const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkVendorMessaging() {
  try {
    console.log('\n🔍 Checking vendor messaging system...\n');
    
    // Check conversations table
    console.log('📋 Conversations table:');
    const conversations = await sql`
      SELECT c.*, 
             u1.name as user1_name, u1.email as user1_email,
             u2.name as user2_name, u2.email as user2_email
      FROM conversations c
      LEFT JOIN users u1 ON c.user1_id = u1.id
      LEFT JOIN users u2 ON c.user2_id = u2.id
      ORDER BY c.created_at DESC
    `;
    
    if (conversations.length === 0) {
      console.log('❌ No conversations found');
    } else {
      conversations.forEach(conv => {
        console.log(`- Conversation ${conv.id}:`);
        console.log(`  User1: ${conv.user1_name} (${conv.user1_email}) - ID: ${conv.user1_id}`);
        console.log(`  User2: ${conv.user2_name} (${conv.user2_email}) - ID: ${conv.user2_id}`);
        console.log(`  Status: ${conv.status}, Created: ${conv.created_at}`);
        console.log();
      });
    }

    // Check messages for vendor 2-2025-003
    const vendorId = '2-2025-003';
    console.log(`📨 Messages for vendor ${vendorId}:`);
    
    const messages = await sql`
      SELECT m.*, 
             c.user1_id, c.user2_id,
             u.name as sender_name, u.email as sender_email
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      JOIN users u ON m.sender_id = u.id
      WHERE c.user1_id = ${vendorId} OR c.user2_id = ${vendorId}
      ORDER BY m.created_at ASC
    `;

    if (messages.length === 0) {
      console.log('❌ No messages found for this vendor');
    } else {
      console.log(`Found ${messages.length} messages:`);
      messages.forEach(msg => {
        console.log(`- From: ${msg.sender_name} (${msg.sender_id})`);
        console.log(`  Message: ${msg.content.substring(0, 50)}...`);
        console.log(`  Conversation: ${msg.conversation_id}`);
        console.log(`  Time: ${msg.created_at}`);
        console.log();
      });
    }

    // Check users to see who should be customers
    console.log('👥 Available users for messaging:');
    const users = await sql`
      SELECT id, name, email, role, user_type
      FROM users
      WHERE role != 'admin'
      ORDER BY role, id
    `;

    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}, Type: ${user.user_type}, ID: ${user.id}`);
    });

  } catch (error) {
    console.error('❌ Error checking vendor messaging:', error);
  }
}

checkVendorMessaging();
