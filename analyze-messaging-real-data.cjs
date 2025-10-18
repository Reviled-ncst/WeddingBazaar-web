const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL || 'postgresql://weddingbazaar_owner:BIb1pCmmj3Zz@ep-rough-boat-a12vd4ys.ap-southeast-1.aws.neon.tech/weddingbazaar?sslmode=require');

async function analyzeMessagingData() {
  console.log('🔍 Analyzing Messaging Database...\n');

  try {
    // Check conversations table
    console.log('📊 CONVERSATIONS TABLE:');
    const conversations = await sql`SELECT * FROM conversations ORDER BY created_at DESC`;
    console.log(`Total Conversations: ${conversations.length}`);
    console.log(JSON.stringify(conversations, null, 2));
    
    console.log('\n📊 MESSAGES TABLE:');
    const messages = await sql`SELECT * FROM messages ORDER BY created_at DESC`;
    console.log(`Total Messages: ${messages.length}`);
    console.log(JSON.stringify(messages, null, 2));
    
    // Check if tables exist
    console.log('\n📊 TABLE STRUCTURE:');
    const convColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'conversations'
      ORDER BY ordinal_position
    `;
    console.log('Conversations columns:', JSON.stringify(convColumns, null, 2));
    
    const msgColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'messages'
      ORDER BY ordinal_position
    `;
    console.log('Messages columns:', JSON.stringify(msgColumns, null, 2));
    
    // Check related users
    console.log('\n👥 USERS IN CONVERSATIONS:');
    const convUsers = await sql`
      SELECT DISTINCT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.user_type
      FROM users u
      WHERE u.id IN (
        SELECT creator_id FROM conversations
        UNION
        SELECT participant_id FROM conversations
      )
    `;
    console.log(JSON.stringify(convUsers, null, 2));
    
    console.log('\n✅ Analysis Complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

analyzeMessagingData();
