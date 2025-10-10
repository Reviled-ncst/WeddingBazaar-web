const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkDatabaseSchema() {
  console.log('=== CHECKING DATABASE SCHEMA ===');
  
  try {
    // Check conversations table
    console.log('\n📋 Checking conversations table...');
    const conversationsCount = await sql`SELECT COUNT(*) as count FROM conversations`;
    console.log(`📊 Conversations count: ${conversationsCount[0].count}`);
    
    if (conversationsCount[0].count > 0) {
      const conversations = await sql`SELECT * FROM conversations LIMIT 3`;
      console.log('🔍 Sample conversations:');
      conversations.forEach((conv, index) => {
        console.log(`  Conversation ${index + 1}:`);
        console.log(`    ID: ${conv.id}`);
        console.log(`    Participant: ${conv.participant_name} (${conv.participant_type})`);
        console.log(`    Creator: ${conv.creator_id} (${conv.creator_type})`);
        console.log(`    Last Message: ${conv.last_message || 'None'}`);
        console.log(`    Service: ${conv.service_name || 'None'}`);
      });
    }
    
    // Check messages table
    console.log('\n💬 Checking messages table...');
    const messagesCount = await sql`SELECT COUNT(*) as count FROM messages`;
    console.log(`📊 Messages count: ${messagesCount[0].count}`);
    
    if (messagesCount[0].count > 0) {
      const messages = await sql`SELECT * FROM messages LIMIT 5`;
      console.log('🔍 Sample messages:');
      messages.forEach((msg, index) => {
        console.log(`  Message ${index + 1}:`);
        console.log(`    ID: ${msg.id}`);
        console.log(`    Conversation: ${msg.conversation_id}`);
        console.log(`    From: ${msg.sender_id} (${msg.sender_type})`);
        console.log(`    Content: ${msg.content?.substring(0, 50)}...`);
        console.log(`    Time: ${msg.created_at}`);
      });
    }
    
    // Check services table
    console.log('\n🛠️ Checking services table...');
    const servicesCount = await sql`SELECT COUNT(*) as count FROM services`;
    console.log(`📊 Services count: ${servicesCount[0].count}`);
    
    if (servicesCount[0].count > 0) {
      const services = await sql`SELECT * FROM services LIMIT 3`;
      console.log('🔍 Sample services:');
      services.forEach((service, index) => {
        console.log(`  Service ${index + 1}:`);
        console.log(`    ID: ${service.id}`);
        console.log(`    Name: ${service.name}`);
        console.log(`    Vendor: ${service.vendor_id}`);
        console.log(`    Category: ${service.category}`);
        console.log(`    Price: ${service.price}`);
      });
    }
    
    // Check for notifications table
    console.log('\n🔔 Checking for notifications-related tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%notification%'
      ORDER BY table_name
    `;
    
    if (tables.length > 0) {
      console.log('📋 Notification tables found:', tables.map(t => t.table_name));
    } else {
      console.log('❌ No notification tables found - we need to create one');
    }
    
  } catch (error) {
    console.error('Database error:', error);
  }
}

checkDatabaseSchema().catch(console.error);
