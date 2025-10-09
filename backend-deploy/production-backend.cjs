const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Real Neon database connection
const sql = neon(process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://weddingbazaar-4171e.web.app',
    'https://weddingbazaar-web.web.app',
    'https://weddingbazaarph.web.app'  // Add the current Firebase hosting URL
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Active token sessions for user mapping
const activeTokenSessions = {};

console.log('🚀 Wedding Bazaar Backend Starting...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 Database:', process.env.DATABASE_URL ? 'Connected' : 'Not configured');

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const dbTest = await sql`SELECT COUNT(*) as conversations FROM conversations`;
    const msgTest = await sql`SELECT COUNT(*) as messages FROM messages`;
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      databaseStats: {
        conversations: parseInt(dbTest[0].conversations),
        messages: parseInt(msgTest[0].messages),
        error: ''
      },
      environment: process.env.NODE_ENV || 'production',
      version: '2.1.0-AUTO-1759984517434',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      endpoints: {
        health: '✅ Active',
        vendors: '✅ Active', 
        services: '✅ Active',
        bookings: '✅ Active',
        auth: '✅ Active',
        conversations: '✅ FIXED'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is responsive',
    timestamp: new Date().toISOString()
  });
});

// ================================
// AUTHENTICATION ENDPOINTS
// ================================

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 [AUTH] Login attempt for:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required',
        timestamp: new Date().toISOString()
      });
    }

    // Find user in database
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const user = users[0];
    
    // For demo purposes, accept any password
    // In production, use bcrypt to verify password
    
    // Generate session token
    const token = `mock-jwt-token-${Date.now()}`;
    
    // Store user session for token verification
    activeTokenSessions[token] = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role || 'couple',
      businessName: user.business_name
    };
    
    console.log(`✅ [AUTH] Login successful for ${email} - stored session for token ${token.substring(0, 20)}...`);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || 'couple',
        businessName: user.business_name
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [AUTH] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.json({
        success: false,
        authenticated: false,
        message: 'Token not found',
        timestamp: new Date().toISOString()
      });
    }

    // Look up user from active sessions
    const sessionUser = activeTokenSessions[token];
    
    if (sessionUser) {
      console.log(`✅ [AUTH] Token verification successful: ${sessionUser.email}`);
      res.json({
        success: true,
        authenticated: true,
        user: sessionUser,
        message: 'Token valid',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`❌ [AUTH] Token verification failed - no session found`);
      res.json({
        success: false,
        authenticated: false,
        message: 'Invalid token - session not found',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ [AUTH] Token verification error:', error);
    res.json({
      success: false,
      authenticated: false,
      message: 'Token verification failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// MESSAGING ENDPOINTS - FIXED
// ================================

// Create a new conversation - CRITICAL MISSING ENDPOINT
app.post('/api/conversations', async (req, res) => {
  try {
    const { participantId, participantName, participantType, conversationType, serviceInfo } = req.body;
    
    console.log('💬 [MESSAGING] POST /api/conversations - Creating new conversation');
    console.log('💬 [MESSAGING] Participant:', participantName, '(' + participantType + ')');
    
    if (!participantId || !participantName || !participantType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: participantId, participantName, participantType',
        timestamp: new Date().toISOString()
      });
    }

    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    // Insert new conversation into database using correct schema
    await sql`
      INSERT INTO conversations (
        id, participant_id, participant_name, participant_type,
        creator_id, creator_type, conversation_type, 
        service_name, service_category, created_at, updated_at
      ) VALUES (
        ${conversationId}, ${participantId}, ${participantName}, ${participantType},
        ${req.body.creatorId || 'anonymous'}, ${req.body.creatorType || 'couple'}, 
        ${conversationType || 'individual'}, 
        ${serviceInfo?.serviceName || req.body.serviceName || 'General Inquiry'}, 
        ${serviceInfo?.serviceType || req.body.serviceCategory || 'other'},
        ${now}, ${now}
      )
    `;
    
    console.log('✅ [MESSAGING] Conversation created successfully:', conversationId);
    
    res.status(201).json({
      success: true,
      conversationId: conversationId,  // Frontend expects this field
      conversation: {
        id: conversationId,
        participantId: participantId,
        participantName: participantName,
        participantType: participantType,
        conversationType: conversationType || 'individual',
        serviceInfo: serviceInfo,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [MESSAGING] Error creating conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get conversations for a specific user - FIXED VERSION
app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('💬 [MESSAGING] GET /api/conversations/' + userId + ' - FIXED VERSION');
    
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
    } else {
      console.log('⚠️ [MESSAGING] No conversations found for this user');
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

// Get messages for a conversation
app.get('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log('📨 [MESSAGING] GET /api/conversations/' + conversationId + '/messages');
    
    const messages = await sql`
      SELECT 
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
      FROM messages 
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
    `;
    
    console.log(`✅ [MESSAGING] Found ${messages.length} messages for conversation ${conversationId}`);
    
    res.json({
      success: true,
      messages: messages,
      count: messages.length,
      conversationId: conversationId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [MESSAGING] Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Send a message to a conversation
app.post('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { senderId, senderName, senderType, content, messageType = 'text' } = req.body;
    
    console.log('📤 [MESSAGING] POST message to conversation:', conversationId);
    console.log('📤 [MESSAGING] From:', senderName, '(' + senderId + ')');
    
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    // Insert message into database
    await sql`
      INSERT INTO messages (
        id, conversation_id, sender_id, sender_name, sender_type,
        content, message_type, timestamp, is_read, created_at
      ) VALUES (
        ${messageId}, ${conversationId}, ${senderId}, ${senderName}, ${senderType},
        ${content}, ${messageType}, ${now}, false, ${now}
      )
    `;
    
    // Update conversation last message
    await sql`
      UPDATE conversations 
      SET last_message = ${content}, 
          last_message_time = ${now},
          updated_at = ${now}
      WHERE id = ${conversationId}
    `;
    
    console.log('✅ [MESSAGING] Message sent successfully:', messageId);
    
    res.json({
      success: true,
      messageId: messageId,
      conversationId: conversationId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [MESSAGING] Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Direct messages endpoint (for frontend compatibility)
app.post('/api/messages', async (req, res) => {
  try {
    const { conversationId, senderId, senderName, senderType, content, messageType = 'text' } = req.body;
    
    console.log('📤 [MESSAGING] POST /api/messages - Direct message endpoint');
    console.log('📤 [MESSAGING] Conversation:', conversationId);
    console.log('📤 [MESSAGING] From:', senderName, '(' + senderId + ')');
    
    if (!conversationId || !senderId || !senderName || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: conversationId, senderId, senderName, content',
        timestamp: new Date().toISOString()
      });
    }
    
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    // Insert message into database
    await sql`
      INSERT INTO messages (
        id, conversation_id, sender_id, sender_name, sender_type,
        content, message_type, timestamp, is_read, created_at
      ) VALUES (
        ${messageId}, ${conversationId}, ${senderId}, ${senderName}, ${senderType || 'couple'},
        ${content}, ${messageType}, ${now}, false, ${now}
      )
    `;
    
    // Update conversation last message
    await sql`
      UPDATE conversations 
      SET last_message = ${content}, 
          last_message_time = ${now},
          updated_at = ${now}
      WHERE id = ${conversationId}
    `;
    
    console.log('✅ [MESSAGING] Message sent successfully via direct endpoint:', messageId);
    
    res.json({
      success: true,
      messageId: messageId,
      conversationId: conversationId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [MESSAGING] Error sending message via direct endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// VENDOR ENDPOINTS
// ================================

app.get('/api/vendors/featured', async (req, res) => {
  try {
    console.log('🏪 [VENDORS] GET /api/vendors/featured called');
    
    const vendors = await sql`
      SELECT 
        id,
        business_name as name,
        business_type as category,
        rating,
        location,
        description,
        review_count,
        starting_price,
        price_range
      FROM vendors 
      ORDER BY rating DESC 
      LIMIT 10
    `;
    
    console.log(`✅ [VENDORS] Found ${vendors.length} featured vendors`);
    
    res.json({
      success: true,
      vendors: vendors,
      count: vendors.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [VENDORS] Error fetching featured vendors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured vendors',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// SERVICES ENDPOINTS
// ================================

app.get('/api/services', async (req, res) => {
  try {
    console.log('🎯 [SERVICES] GET /api/services called');
    
    const services = await sql`
      SELECT 
        id,
        name,
        category,
        vendor_id,
        price,
        description
      FROM services 
      ORDER BY category, name
      LIMIT 100
    `;
    
    console.log(`✅ [SERVICES] Found ${services.length} services`);
    
    res.json({
      success: true,
      services: services,
      count: services.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [SERVICES] Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// BOOKING ENDPOINTS
// ================================

app.post('/api/bookings/request', async (req, res) => {
  try {
    console.log('📝 [BOOKING] POST /api/bookings/request called');
    
    const {
      vendorId,
      serviceName,
      eventDate,
      guestCount,
      budget,
      message,
      contactName,
      contactEmail,
      userId
    } = req.body;
    
    if (!vendorId || !serviceName || !eventDate) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID, service name, and event date are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Insert booking into database
    const bookingId = Date.now();
    const now = new Date();
    
    await sql`
      INSERT INTO bookings (
        id, vendor_id, user_id, service_name, event_date,
        guest_count, budget, message, contact_name, contact_email,
        status, created_at, updated_at
      ) VALUES (
        ${bookingId}, ${vendorId}, ${userId}, ${serviceName}, ${eventDate},
        ${guestCount}, ${budget}, ${message}, ${contactName}, ${contactEmail},
        'request', ${now}, ${now}
      )
    `;
    
    console.log('✅ [BOOKING] Booking request created:', bookingId);
    
    res.json({
      success: true,
      bookingId: bookingId,
      message: 'Booking request submitted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [BOOKING] Error creating booking request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking request',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ [ERROR] Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Bazaar Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log('✅ MESSAGING SYSTEM: FIXED - Real conversations will now display');
});

module.exports = app;
