const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkMessagingSchema() {
  try {
    console.log('\n🔍 Checking messaging table schemas...\n');
    
    // Check conversations table schema
    console.log('📋 Conversations table schema:');
    const conversationsSchema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'conversations'
      ORDER BY ordinal_position
    `;
    
    if (conversationsSchema.length === 0) {
      console.log('❌ Conversations table not found');
    } else {
      conversationsSchema.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // Check messages table schema
    console.log('\n📨 Messages table schema:');
    const messagesSchema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'messages'
      ORDER BY ordinal_position
    `;
    
    if (messagesSchema.length === 0) {
      console.log('❌ Messages table not found');
    } else {
      messagesSchema.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // Check participants table schema
    console.log('\n👥 Participants table schema:');
    const participantsSchema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'participants'
      ORDER BY ordinal_position
    `;
    
    if (participantsSchema.length === 0) {
      console.log('❌ Participants table not found');
    } else {
      participantsSchema.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // List all tables
    console.log('\n📊 All available tables:');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });

  } catch (error) {
    console.error('❌ Error checking messaging schema:', error);
  }
}

checkMessagingSchema();
