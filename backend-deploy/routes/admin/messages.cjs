const { sql } = require('../../config/database.cjs');

/**
 * Admin Messages Management API
 * GET /api/admin/messages - List all conversations/messages system-wide
 * GET /api/admin/messages/stats - Get messaging statistics
 * GET /api/admin/messages/:id - Get specific conversation details
 * DELETE /api/admin/messages/:id - Delete conversation (moderation)
 */

/**
 * GET /api/admin/messages
 * Fetch all conversations with optional filtering
 */
async function getMessages(req, res) {
  try {
    const { status, user_type, search } = req.query;
    
    console.log('💬 [Admin Messages] Fetching conversations, filters:', { status, user_type, search });
    
    // Build the query using template literals - Neon doesn't support parameterized queries
    // We'll use a simple approach: fetch all and filter in memory (safe for small datasets)
    // For production with large datasets, consider using a query builder or ORM
    
    const result = await sql`
      SELECT 
        c.id,
        c.creator_id,
        c.participant_id,
        c.service_id,
        c.vendor_id,
        c.status,
        c.created_at,
        c.last_message_time,
        c.last_message_content,
        c.unread_count_creator,
        c.unread_count_participant,
        s.name as service_name,
        s.category as service_category,
        v.business_name as vendor_business_name,
        COALESCE(u1.first_name || ' ' || u1.last_name, u1.email, 'Unknown User') as creator_name,
        u1.email as creator_email,
        u1.user_type as creator_type,
        COALESCE(u2.first_name || ' ' || u2.last_name, u2.email, 'Unknown User') as participant_name,
        u2.email as participant_email,
        u2.user_type as participant_type,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count
      FROM conversations c
      LEFT JOIN services s ON c.service_id = s.id
      LEFT JOIN vendor_profiles v ON c.vendor_id = v.id
      LEFT JOIN users u1 ON c.creator_id = u1.id
      LEFT JOIN users u2 ON c.participant_id = u2.id
      ORDER BY c.last_message_time DESC NULLS LAST, c.created_at DESC
      LIMIT 100
    `;
    
    // Apply filters in memory (safe for small datasets, avoids SQL injection)
    let filtered = result;
    
    if (status && status !== 'all') {
      filtered = filtered.filter(conv => conv.status === status);
    }
    
    if (user_type && user_type !== 'all') {
      filtered = filtered.filter(conv => 
        conv.creator_type === user_type || conv.participant_type === user_type
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(conv => {
        return (
          (conv.creator_name && conv.creator_name.toLowerCase().includes(searchLower)) ||
          (conv.participant_name && conv.participant_name.toLowerCase().includes(searchLower)) ||
          (conv.service_name && conv.service_name.toLowerCase().includes(searchLower)) ||
          (conv.vendor_business_name && conv.vendor_business_name.toLowerCase().includes(searchLower))
        );
      });
    }
    
    console.log(`✅ [Admin Messages] Found ${filtered.length} conversations (${result.length} total, filtered by: status=${status}, user_type=${user_type}, search=${search})`);
    
    // Transform to match frontend interface
    const conversations = filtered.map(conv => ({
      id: conv.id,
      creatorId: conv.creator_id,
      participantId: conv.participant_id,
      serviceId: conv.service_id,
      vendorId: conv.vendor_id,
      status: conv.status || 'active',
      createdAt: conv.created_at,
      lastMessageTime: conv.last_message_time,
      lastMessageContent: conv.last_message_content,
      unreadCountCreator: conv.unread_count_creator || 0,
      unreadCountParticipant: conv.unread_count_participant || 0,
      serviceName: conv.service_name,
      serviceCategory: conv.service_category,
      vendorBusinessName: conv.vendor_business_name,
      creatorName: conv.creator_name,
      creatorEmail: conv.creator_email,
      creatorType: conv.creator_type,
      participantName: conv.participant_name,
      participantEmail: conv.participant_email,
      participantType: conv.participant_type,
      messageCount: parseInt(conv.message_count) || 0
    }));
    
    res.json({
      success: true,
      data: conversations,
      count: conversations.length
    });
    
  } catch (error) {
    console.error('❌ [Admin Messages] Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
      details: error.message
    });
  }
}

/**
 * GET /api/admin/messages/stats
 * Get messaging system statistics
 */
async function getMessagingStats(req, res) {
  try {
    console.log('📊 [Admin Messages] Fetching statistics');
    
    const result = await sql`
      SELECT 
        COUNT(DISTINCT c.id) as total_conversations,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active') as active_conversations,
        COUNT(DISTINCT c.id) FILTER (WHERE c.last_message_time > NOW() - INTERVAL '24 hours') as conversations_24h,
        COUNT(DISTINCT c.id) FILTER (WHERE c.last_message_time > NOW() - INTERVAL '7 days') as conversations_7d,
        COUNT(m.id) as total_messages,
        COUNT(m.id) FILTER (WHERE m.created_at > NOW() - INTERVAL '24 hours') as messages_24h,
        COUNT(m.id) FILTER (WHERE m.created_at > NOW() - INTERVAL '7 days') as messages_7d,
        COUNT(DISTINCT c.creator_id) + COUNT(DISTINCT c.participant_id) as unique_users,
        AVG(conv_messages.message_count) as avg_messages_per_conversation
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      LEFT JOIN LATERAL (
        SELECT COUNT(*) as message_count 
        FROM messages 
        WHERE conversation_id = c.id
      ) conv_messages ON true
    `;
    
    const stats = {
      totalConversations: parseInt(result[0].total_conversations) || 0,
      activeConversations: parseInt(result[0].active_conversations) || 0,
      conversations24h: parseInt(result[0].conversations_24h) || 0,
      conversations7d: parseInt(result[0].conversations_7d) || 0,
      totalMessages: parseInt(result[0].total_messages) || 0,
      messages24h: parseInt(result[0].messages_24h) || 0,
      messages7d: parseInt(result[0].messages_7d) || 0,
      uniqueUsers: parseInt(result[0].unique_users) || 0,
      avgMessagesPerConversation: parseFloat(result[0].avg_messages_per_conversation) || 0
    };
    
    console.log('✅ [Admin Messages] Statistics:', stats);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ [Admin Messages] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      details: error.message
    });
  }
}

/**
 * GET /api/admin/messages/:id
 * Get specific conversation with all messages
 */
async function getConversationById(req, res) {
  try {
    const { id } = req.params;
    
    console.log('💬 [Admin Messages] Fetching conversation:', id);
    
    // Get conversation details
    const convResult = await sql`
      SELECT 
        c.*,
        s.name as service_name,
        s.category as service_category,
        v.business_name as vendor_business_name,
        COALESCE(u1.first_name || ' ' || u1.last_name, u1.email, 'Unknown User') as creator_name,
        u1.email as creator_email,
        COALESCE(u2.first_name || ' ' || u2.last_name, u2.email, 'Unknown User') as participant_name,
        u2.email as participant_email
      FROM conversations c
      LEFT JOIN services s ON c.service_id = s.id
      LEFT JOIN vendor_profiles v ON c.vendor_id = v.id
      LEFT JOIN users u1 ON c.creator_id = u1.id
      LEFT JOIN users u2 ON c.participant_id = u2.id
      WHERE c.id = ${id}
    `;
    
    if (convResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Get all messages in conversation
    const messages = await sql`
      SELECT 
        m.*,
        COALESCE(u.first_name || ' ' || u.last_name, u.email, 'Unknown User') as sender_name,
        u.email as sender_email
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ${id}
      ORDER BY m.created_at ASC
    `;
    
    res.json({
      success: true,
      data: {
        conversation: convResult[0],
        messages: messages,
        messageCount: messages.length
      }
    });
    
  } catch (error) {
    console.error('❌ [Admin Messages] Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation',
      details: error.message
    });
  }
}

/**
 * DELETE /api/admin/messages/:id
 * Delete conversation (moderation)
 */
async function deleteConversation(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    console.log('🗑️ [Admin Messages] Deleting conversation:', id, 'Reason:', reason);
    
    // Delete messages first (CASCADE should handle this, but being explicit)
    await sql`DELETE FROM messages WHERE conversation_id = ${id}`;
    
    // Delete conversation
    const result = await sql`
      DELETE FROM conversations 
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    console.log('✅ [Admin Messages] Conversation deleted successfully');
    
    res.json({
      success: true,
      message: 'Conversation deleted successfully',
      deletedConversation: result[0]
    });
    
  } catch (error) {
    console.error('❌ [Admin Messages] Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation',
      details: error.message
    });
  }
}

module.exports = {
  getMessages,
  getMessagingStats,
  getConversationById,
  deleteConversation
};
