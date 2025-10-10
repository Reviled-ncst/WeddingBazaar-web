const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Get conversations for a user (vendor or individual)
router.get('/:userId', async (req, res) => {
  console.log('🔍 Getting conversations for user:', req.params.userId);
  
  try {
    const { userId } = req.params;
    
    // Get conversations with basic information first (simple query that works)
    let conversations;
    try {
      conversations = await sql`
        SELECT c.* FROM conversations c 
        WHERE c.participant_id = ${userId} OR c.creator_id = ${userId}
        ORDER BY c.last_message_time DESC NULLS LAST, c.created_at DESC
      `;
      console.log(`✅ Found ${conversations.length} basic conversations for user ${userId}`);
      
      // If we have conversations, try to enhance with additional data
      if (conversations.length > 0) {
        try {
          conversations = await sql`
            SELECT 
              c.*,
              s.name as service_name,
              s.category as service_category,
              v.business_name as vendor_business_name,
              u1.first_name as creator_first_name,
              u1.last_name as creator_last_name,
              u1.email as creator_email,
              u2.first_name as participant_first_name,
              u2.last_name as participant_last_name,
              u2.email as participant_email
            FROM conversations c
            LEFT JOIN services s ON c.service_id = s.id
            LEFT JOIN vendors v ON c.vendor_id = v.id
            LEFT JOIN users u1 ON c.creator_id = u1.id
            LEFT JOIN users u2 ON c.participant_id = u2.id
            WHERE c.participant_id = ${userId} OR c.creator_id = ${userId}
            ORDER BY c.last_message_time DESC NULLS LAST, c.created_at DESC
          `;
          console.log(`✅ Enhanced ${conversations.length} conversations with additional data`);
        } catch (enhanceError) {
          console.log('⚠️ Enhancement failed, using basic conversations:', enhanceError.message);
          // Keep the basic conversations if enhancement fails
        }
      }
    } catch (basicError) {
      console.error('❌ Basic conversation query failed:', basicError);
      conversations = [];
    }
    
    console.log(`✅ Found ${conversations.length} conversations for user ${userId}`);
    
    res.json({
      success: true,
      conversations: conversations,
      count: conversations.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Conversations error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get messages for a conversation
router.get('/:conversationId/messages', async (req, res) => {
  console.log('💬 Getting messages for conversation:', req.params.conversationId);
  
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const messages = await sql`
      SELECT * FROM messages 
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    // Reverse to show oldest first
    const messagesAsc = messages.reverse();
    
    console.log(`✅ Found ${messages.length} messages for conversation ${conversationId}`);
    
    res.json({
      success: true,
      messages: messagesAsc,
      count: messages.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Messages error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Send a message
router.post('/:conversationId/messages', async (req, res) => {
  console.log('📤 Sending message to conversation:', req.params.conversationId);
  
  try {
    const { conversationId } = req.params;
    const { senderId, senderType, senderName, content, messageType = 'text' } = req.body;
    
    if (!senderId || !senderType || !senderName || !content) {
      return res.status(400).json({
        success: false,
        error: 'senderId, senderType, senderName, and content are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    // Insert message with correct schema fields
    const message = await sql`
      INSERT INTO messages (
        id, conversation_id, sender_id, sender_name, sender_type, 
        content, message_type, timestamp, created_at, is_read
      ) VALUES (
        ${messageId}, ${conversationId}, ${senderId}, ${senderName}, ${senderType},
        ${content}, ${messageType}, ${now.toISOString()}, ${now.toISOString()}, false
      ) RETURNING *
    `;
    
    // Update conversation last message
    await sql`
      UPDATE conversations 
      SET last_message = ${content}, 
          last_message_time = NOW()
      WHERE id = ${conversationId}
    `;
    
    console.log(`✅ Message sent: ${messageId}`);
    
    res.json({
      success: true,
      message: message[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Send message error:', error);
    console.error('❌ Full error details:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
