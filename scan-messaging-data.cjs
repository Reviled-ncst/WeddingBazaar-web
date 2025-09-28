const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function scanMessagingData() {
  try {
    console.log('🔍 SCANNING YOUR ACTUAL DATABASE TABLES...\n');
    
    // Check conversations count
    const convCount = await sql`SELECT COUNT(*) as count FROM conversations`;
    console.log(`📊 CONVERSATIONS TABLE: ${convCount[0].count} records`);
    
    // Check messages count  
    const msgCount = await sql`SELECT COUNT(*) as count FROM messages`;
    console.log(`📊 MESSAGES TABLE: ${msgCount[0].count} records`);
    
    console.log('\n===========================================');
    
    if (convCount[0].count > 0) {
      console.log('\n📝 ACTUAL CONVERSATIONS IN DATABASE:');
      const conversations = await sql`SELECT * FROM conversations ORDER BY created_at DESC LIMIT 10`;
      
      conversations.forEach((conv, index) => {
        console.log(`${index + 1}. ${conv.id}`);
        console.log(`   Participant: "${conv.participant_name}" (ID: ${conv.participant_id})`);
        console.log(`   Service: ${conv.service_name || 'None'}`);
        console.log(`   Last Message: ${conv.last_message ? conv.last_message.substring(0, 50) + '...' : 'None'}`);
        console.log(`   Created: ${conv.created_at}`);
        console.log('');
      });
    } else {
      console.log('\n❌ YOUR CONVERSATIONS TABLE IS EMPTY');
    }

    if (msgCount[0].count > 0) {
      console.log('\n💬 ACTUAL MESSAGES IN DATABASE:');
      const messages = await sql`SELECT * FROM messages ORDER BY created_at DESC LIMIT 10`;
      
      messages.forEach((msg, index) => {
        console.log(`${index + 1}. ${msg.id}`);
        console.log(`   From: "${msg.sender_name}" (${msg.sender_id})`);
        console.log(`   Content: "${msg.content.substring(0, 60)}..."`);
        console.log(`   Conversation: ${msg.conversation_id}`);
        console.log(`   Created: ${msg.created_at}`);
        console.log('');
      });
    } else {
      console.log('\n❌ YOUR MESSAGES TABLE IS EMPTY');
    }
    
    console.log('===========================================');
    console.log('🎯 CONCLUSION:');
    if (convCount[0].count === 0 && msgCount[0].count === 0) {
      console.log('❌ Your database tables are EMPTY');
      console.log('   The backend is creating fake conversations in memory only');
      console.log('   No real data is being stored in your database');
    } else {
      console.log('✅ You have real data in your database');
      console.log('   But the backend might not be using it properly');
    }
    
  } catch (error) {
    console.error('❌ Database scan failed:', error.message);
  }
}

scanMessagingData();
