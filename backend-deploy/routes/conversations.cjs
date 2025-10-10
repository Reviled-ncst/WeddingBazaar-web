const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Get conversations for a user (vendor or individual)
router.get('/:userId', async (req, res) => {
  console.log('🔍 Getting conversations for user:', req.params.userId);
  
  try {
    const { userId } = req.params;
    
    // Get conversations where user is either participant or creator
    const conversations = await sql`
      SELECT * FROM conversations 
      WHERE participant_id = ${userId} OR creator_id = ${userId}
      ORDER BY last_message_time DESC NULLS LAST, created_at DESC
    `;
    
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
