const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkDatabase() {
  try {
    console.log('🔍 Checking database for messaging tables...\n');
    
    // List all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('📋 All tables in database:');
    tables.forEach(table => console.log(`  - ${table.table_name}`));
    
    // Check if messaging tables exist
    const hasConversations = tables.some(t => t.table_name === 'conversations');
    const hasMessages = tables.some(t => t.table_name === 'messages');
    
    console.log(`\n🔍 Messaging tables status:`);
    console.log(`  - conversations: ${hasConversations ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    console.log(`  - messages: ${hasMessages ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    
    if (hasConversations) {
      const convCount = await sql`SELECT COUNT(*) as count FROM conversations`;
      console.log(`  - conversations count: ${convCount[0].count}`);
    }
    
    if (hasMessages) {
      const msgCount = await sql`SELECT COUNT(*) as count FROM messages`;
      console.log(`  - messages count: ${msgCount[0].count}`);
    }
    
    // Check vendor ID 2-2025-003 specifically
    console.log(`\n🔍 Checking vendor ID: 2-2025-003`);
    const vendorExists = await sql`
      SELECT id, name, email, category 
      FROM vendors 
      WHERE id = '2-2025-003'
    `;
    
    if (vendorExists.length > 0) {
      console.log(`✅ Vendor found:`, vendorExists[0]);
    } else {
      console.log(`❌ Vendor 2-2025-003 not found`);
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabase();
