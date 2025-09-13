const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createProperVendorMessagingData() {
  try {
    console.log('\n🔧 Creating proper vendor messaging data...\n');
    
    const vendorId = '2-2025-003';
    
    // First, let's create some individual customers if they don't exist
    const customers = [
      { id: 'customer-001', email: 'sarah.bride@email.com', name: 'Sarah Johnson', role: 'individual', user_type: 'individual' },
      { id: 'customer-002', email: 'mike.groom@email.com', name: 'Michael Chen', role: 'individual', user_type: 'individual' },
      { id: 'customer-003', email: 'emma.wedding@email.com', name: 'Emma Davis', role: 'individual', user_type: 'individual' },
      { id: 'customer-004', email: 'alex.couple@email.com', name: 'Alex Rodriguez', role: 'individual', user_type: 'individual' }
    ];

    console.log('👥 Creating customer accounts...');
    for (const customer of customers) {
      try {
        await sql`
          INSERT INTO users (id, email, name, role, user_type, created_at)
          VALUES (${customer.id}, ${customer.email}, ${customer.name}, ${customer.role}, ${customer.user_type}, CURRENT_TIMESTAMP)
          ON CONFLICT (email) DO NOTHING
        `;
        console.log(`✅ Customer created: ${customer.name} (${customer.email})`);
      } catch (error) {
        console.log(`⚠️  Customer might already exist: ${customer.name}`);
      }
    }

    // Create conversations where customers are talking TO the vendor
    const conversations = [
      {
        id: `customer-001-to-${vendorId}`,
        customer: customers[0],
        service: 'Intimate Elopement Ceremony',
        lastMessage: 'Hi! We\'re planning a small intimate ceremony for 20 guests. Are you available on June 15th?'
      },
      {
        id: `customer-002-to-${vendorId}`,
        customer: customers[1],
        service: 'Traditional Wedding Ceremony',
        lastMessage: 'Looking for an officiant for our outdoor wedding. Do you handle non-religious ceremonies?'
      },
      {
        id: `customer-003-to-${vendorId}`,
        customer: customers[2],
        service: 'Destination Wedding',
        lastMessage: 'We\'re having a destination wedding in Hawaii. Can you travel for ceremonies?'
      },
      {
        id: `customer-004-to-${vendorId}`,
        customer: customers[3],
        service: 'Renewal of Vows',
        lastMessage: 'Celebrating our 10th anniversary with a vow renewal. What packages do you offer?'
      }
    ];

    console.log('\n💬 Creating conversations where customers talk TO vendor...');
    for (const conv of conversations) {
      try {
        // Create conversation with customer as creator, vendor as participant
        await sql`
          INSERT INTO conversations (
            id, 
            participant_id,
            participant_name,
            participant_type,
            participant_avatar,
            creator_id,
            creator_type,
            conversation_type,
            last_message,
            last_message_time,
            unread_count,
            is_online,
            status,
            service_name,
            service_category,
            created_at,
            updated_at
          )
          VALUES (
            ${conv.id},
            ${vendorId},
            'admin admin1',
            'vendor',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            ${conv.customer.id},
            'couple',
            'individual',
            ${conv.lastMessage},
            CURRENT_TIMESTAMP,
            1,
            true,
            'active',
            ${conv.service},
            'officiant',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          ON CONFLICT (id) DO UPDATE SET
            last_message = EXCLUDED.last_message,
            last_message_time = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        `;
        
        console.log(`✅ Conversation created: ${conv.customer.name} → Vendor`);
        
        // Add initial message from customer
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await sql`
          INSERT INTO messages (
            id,
            conversation_id,
            sender_id,
            sender_name,
            sender_type,
            content,
            message_type,
            timestamp,
            is_read,
            created_at
          )
          VALUES (
            ${messageId},
            ${conv.id},
            ${conv.customer.id},
            ${conv.customer.name},
            'couple',
            ${conv.lastMessage},
            'text',
            CURRENT_TIMESTAMP,
            false,
            CURRENT_TIMESTAMP
          )
        `;
        
        console.log(`📨 Initial message added from ${conv.customer.name}`);
        
        // Add a reply from vendor for some conversations
        if (Math.random() > 0.5) {
          const replyId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const replies = [
            'Thank you for your inquiry! I would love to help with your special day. Let me check my availability.',
            'Hello! Yes, I do handle non-religious ceremonies. I have several packages available.',
            'I appreciate you considering me for your celebration. Let\'s schedule a consultation to discuss details.',
            'Congratulations on your upcoming celebration! I\'d be happy to discuss how I can make your day special.'
          ];
          
          await sql`
            INSERT INTO messages (
              id,
              conversation_id,
              sender_id,
              sender_name,
              sender_type,
              content,
              message_type,
              timestamp,
              is_read,
              created_at
            )
            VALUES (
              ${replyId},
              ${conv.id},
              ${vendorId},
              'admin admin1',
              'vendor',
              ${replies[Math.floor(Math.random() * replies.length)]},
              'text',
              CURRENT_TIMESTAMP,
              true,
              CURRENT_TIMESTAMP
            )
          `;
          
          console.log(`📨 Vendor reply added to conversation`);
        }
        
      } catch (error) {
        console.error(`❌ Error creating conversation ${conv.id}:`, error);
      }
    }

    // Verify the data
    console.log('\n✅ Verification: Checking vendor conversations...');
    const vendorConversations = await sql`
      SELECT c.*, 
             creator.name as creator_name, creator.email as creator_email,
             participant.name as participant_name, participant.email as participant_email
      FROM conversations c
      LEFT JOIN users creator ON c.creator_id = creator.id
      LEFT JOIN users participant ON c.participant_id = participant.id
      WHERE c.participant_id = ${vendorId} OR c.creator_id = ${vendorId}
      ORDER BY c.last_message_time DESC
    `;

    console.log(`Found ${vendorConversations.length} conversations for vendor ${vendorId}:`);
    vendorConversations.forEach(conv => {
      console.log(`- ${conv.creator_name} (${conv.creator_id}) → ${conv.participant_name} (${conv.participant_id})`);
      console.log(`  Service: ${conv.service_name}, Last: ${conv.last_message?.substring(0, 50)}...`);
    });

    console.log('\n🎉 Vendor messaging data setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up vendor messaging data:', error);
  }
}

createProperVendorMessagingData();
