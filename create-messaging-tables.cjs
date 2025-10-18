/**
 * Create Conversations and Messages Tables
 * Run this to set up the messaging system in the database
 */

const { neon } = require('@neondatabase/serverless');

// Use Render's DATABASE_URL (from documentation)
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://weddingbazaar_owner:BIb1pCmmj3Zz@ep-rough-boat-a12vd4ys.ap-southeast-1.aws.neon.tech/weddingbazaar?sslmode=require';
const sql = neon(DATABASE_URL);

async function createMessagingTables() {
  console.log('🔧 Creating Messaging Tables...\n');

  try {
    // Drop existing tables if they exist (for clean slate)
    console.log('🗑️  Dropping existing tables (if any)...');
    await sql`DROP TABLE IF EXISTS messages CASCADE`;
    await sql`DROP TABLE IF EXISTS conversations CASCADE`;
    console.log('✅ Existing tables dropped\n');

    // Create conversations table
    console.log('📊 Creating conversations table...');
    await sql`
      CREATE TABLE conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        service_id UUID REFERENCES services(id) ON DELETE SET NULL,
        vendor_id UUID REFERENCES vendor_profiles(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        last_message_time TIMESTAMP DEFAULT NOW(),
        last_message_content TEXT,
        unread_count_creator INTEGER DEFAULT 0,
        unread_count_participant INTEGER DEFAULT 0,
        CONSTRAINT different_participants CHECK (creator_id != participant_id)
      )
    `;
    console.log('✅ Conversations table created\n');

    // Create messages table
    console.log('📊 Creating messages table...');
    await sql`
      CREATE TABLE messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        read BOOLEAN DEFAULT FALSE,
        attachments JSONB DEFAULT '[]'::jsonb
      )
    `;
    console.log('✅ Messages table created\n');

    // Create indexes for performance
    console.log('📊 Creating indexes...');
    await sql`CREATE INDEX idx_conversations_creator ON conversations(creator_id)`;
    await sql`CREATE INDEX idx_conversations_participant ON conversations(participant_id)`;
    await sql`CREATE INDEX idx_conversations_service ON conversations(service_id)`;
    await sql`CREATE INDEX idx_conversations_vendor ON conversations(vendor_id)`;
    await sql`CREATE INDEX idx_conversations_status ON conversations(status)`;
    await sql`CREATE INDEX idx_conversations_last_message ON conversations(last_message_time DESC)`;
    await sql`CREATE INDEX idx_messages_conversation ON messages(conversation_id)`;
    await sql`CREATE INDEX idx_messages_sender ON messages(sender_id)`;
    await sql`CREATE INDEX idx_messages_created ON messages(created_at DESC)`;
    console.log('✅ Indexes created\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('conversations', 'messages')
      ORDER BY table_name
    `;
    console.log('Tables found:', tables.map(t => t.table_name).join(', '));

    console.log('\n✅ Messaging tables created successfully!');
    console.log('\n📊 Next steps:');
    console.log('   1. Tables are now ready for use');
    console.log('   2. Admin messages API will now work');
    console.log('   3. Users can start messaging vendors');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.error(error);
    throw error;
  }
}

createMessagingTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
