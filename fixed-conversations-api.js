// FIXED CONVERSATIONS API FOR REAL DATABASE SCHEMA
// This is the corrected version that should replace the current conversations endpoint

app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('💬 [MESSAGING] GET /api/conversations/' + userId + ' called - FIXED VERSION');
    
    // FIXED QUERY: Find conversations where user has sent messages
    // Based on database analysis: user sends messages as sender_id in messages table
    const userConversations = await sql`
      SELECT DISTINCT 
        c.id,
        c.participant_id,
        c.participant_name, 
        c.participant_type,
        c.conversation_type,
        c.last_message,
        c.last_message_time,
        c.unread_count,
        c.service_name,
        c.service_category,
        c.service_price,
        c.service_description,
        c.created_at,
        c.updated_at,
        c.creator_id,
        c.creator_type
      FROM conversations c
      INNER JOIN messages m ON c.id = m.conversation_id
      WHERE m.sender_id = ${userId}
      ORDER BY c.last_message_time DESC NULLS LAST, c.created_at DESC
    `;
    
    console.log(`✅ [MESSAGING] Found ${userConversations.length} REAL conversations for user ${userId}`);
    
    if (userConversations.length > 0) {
      console.log('📋 [MESSAGING] Conversation details:');
      userConversations.forEach((conv, i) => {
        console.log(`  ${i + 1}. ${conv.id} - ${conv.service_name || 'No service'}`);
      });
    }
    
    res.json({
      success: true,
      conversations: userConversations,
      count: userConversations.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [MESSAGING] Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// EXPLANATION OF THE FIX:
/* 
PROBLEM: Original query looked for conversations where participant_id = userId
But the database shows:
- Conversations have participant_id pointing to vendors (like 2-2025-003)
- Users are identified as sender_id in the messages table
- couple1@gmail.com (1-2025-001) sends messages in conversations 2-2025-003, 2-2025-004, etc.

SOLUTION: Use INNER JOIN to find conversations where the user has sent messages
This correctly identifies all conversations the user is participating in.

EXPECTED RESULT for user 1-2025-001:
- Conversation 2-2025-003 (Intimate Elopement Ceremony) - 20+ messages
- Conversation 2-2025-004 (Custom Wedding Cake Masterpiece) - 3+ messages  
- Conversation customer-001-to-2-2025-003 - 15+ messages
- Plus other conversations where they've sent messages
*/
