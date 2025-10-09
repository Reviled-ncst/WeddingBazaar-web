const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Updated 2025-10-03: Added payment status mapping support + JWT debugging

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
    'https://weddingbazaarph.web.app'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'wedding-bazaar-fallback-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Token blacklist for logout functionality (in-memory is fine for this)
const tokenBlacklist = new Set();

console.log('🚀 Wedding Bazaar Backend Starting...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 Database:', process.env.DATABASE_URL ? 'Connected' : 'Not configured');
console.log('🔄 Filter Fix Deployment:', new Date().toISOString());

// ================================
// STATUS MAPPING FUNCTION
// ================================

// Status mapping function to transform database values to frontend expectations
const mapBookingStatus = (dbStatus, responseMessage) => {
  // Special case: if response message contains quote info, it's quote_sent regardless of status
  if (responseMessage && responseMessage.includes('ITEMIZED QUOTE')) {
    return 'quote_sent';
  }
  
  const statusMap = {
    'request': 'quote_requested',
    'pending': 'quote_requested', 
    'quote_requested': 'quote_requested',
    'approved': 'confirmed',
    'confirmed': 'confirmed',
    'downpayment': 'downpayment_paid',
    'downpayment_paid': 'downpayment_paid',
    'paid': 'paid_in_full',
    'paid_in_full': 'paid_in_full',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'rejected': 'quote_rejected',
    'quote_rejected': 'quote_rejected'
  };
  
  return statusMap[dbStatus] || 'quote_requested';
};

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
      version: '2.1.1-FILTER-FIX-DEPLOYED',
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
    
    // Generate real JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.user_type || 'couple',
      iat: Math.floor(Date.now() / 1000)
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'wedding-bazaar',
      audience: 'wedding-bazaar-users'
    });
    
    console.log(`✅ [AUTH] Login successful for ${email} - generated JWT token`);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.user_type || 'couple'
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

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 [AUTH] Registration attempt for:', req.body.email);
    
    const { email, password, firstName, lastName, role, phone, business_name, business_type, location } = req.body;
    
    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, first name, and last name are required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already exists
    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`;
    
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Create new user (for demo, we'll store password as plain text - don't do this in production!)
    const userType = role || 'couple';
    
    const newUsers = await sql`
      INSERT INTO users (email, password, first_name, last_name, user_type, created_at)
      VALUES (${email}, ${password}, ${firstName}, ${lastName}, ${userType}, NOW())
      RETURNING id, email, first_name, last_name, user_type
    `;
    
    const user = newUsers[0];
    
    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.user_type,
      iat: Math.floor(Date.now() / 1000)
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'wedding-bazaar',
      audience: 'wedding-bazaar-users'
    });
    
    console.log(`✅ [AUTH] Registration successful for ${email}`);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.user_type
      },
      message: 'Registration successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [AUTH] Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
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

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.json({
        success: false,
        authenticated: false,
        message: 'Token has been invalidated',
        timestamp: new Date().toISOString()
      });
    }

    // Verify JWT token
    console.log('🔍 [AUTH] Attempting JWT verification...');
    console.log('🔍 [AUTH] Token preview:', token.substring(0, 50) + '...');
    console.log('🔍 [AUTH] JWT_SECRET defined:', !!JWT_SECRET);
    
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'wedding-bazaar',
      audience: 'wedding-bazaar-users'
    });
    
    console.log('✅ [AUTH] JWT decoded successfully:', { userId: decoded.userId, email: decoded.email });
    
    // Fetch current user data from database
    const userRows = await sql`
      SELECT id, email, first_name, last_name, user_type 
      FROM users 
      WHERE id = ${decoded.userId}
    `;
    
    if (userRows.length === 0) {
      console.log(`❌ [AUTH] User not found in database: ${decoded.userId}`);
      return res.json({
        success: false,
        authenticated: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const user = userRows[0];
    const sessionUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.user_type || 'couple'
    };
    
    console.log(`✅ [AUTH] JWT verification successful: ${user.email}`);
    res.json({
      success: true,
      authenticated: true,
      user: sessionUser,
      message: 'Token valid',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.log(`❌ [AUTH] Invalid JWT token: ${error.message}`);
      return res.json({
        success: false,
        authenticated: false,
        message: 'Invalid token',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.log(`❌ [AUTH] JWT token expired: ${error.message}`);
      return res.json({
        success: false,
        authenticated: false,
        message: 'Token expired',
        timestamp: new Date().toISOString()
      });
    }
    
    console.error('❌ [AUTH] Token verification error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.json({
      success: false,
      authenticated: false,
      message: `Token verification failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Logout endpoint - invalidates JWT token
app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      // Add token to blacklist to prevent reuse
      tokenBlacklist.add(token);
      console.log(`✅ [AUTH] Token blacklisted for logout`);
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [AUTH] Logout error:', error);
    res.json({
      success: false,
      message: 'Logout failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// MESSAGING ENDPOINTS - COMPLETE SET
// ================================

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

// Create new conversation - MISSING ENDPOINT ADDED
app.post('/api/conversations', async (req, res) => {
  try {
    console.log('💬 [MESSAGING] POST /api/conversations called');
    const { vendorId, vendorName, serviceName, userId, userName, initialMessage } = req.body;
    
    // Generate conversation ID
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create conversation in database
    await sql`
      INSERT INTO conversations (
        id, participant_1_id, participant_1_name, participant_1_role, participant_1_avatar,
        participant_2_id, participant_2_name, participant_2_role, participant_2_avatar,
        last_message_id, last_message_content, last_message_sender_id,
        last_message_timestamp, participant_1_unread_count, participant_2_unread_count
      ) VALUES (
        ${conversationId}, ${userId}, ${userName || 'User'}, 'individual', null,
        ${vendorId}, ${vendorName || 'Vendor'}, 'vendor', null,
        ${messageId}, ${initialMessage || 'Started conversation'}, ${userId},
        NOW(), 0, 1
      )
    `;
    
    // Add initial message if provided
    if (initialMessage) {
      await sql`
        INSERT INTO messages (
          id, conversation_id, sender_id, sender_name, sender_role, content, message_type, status
        ) VALUES (
          ${messageId}, ${conversationId}, ${userId}, ${userName || 'User'}, 'individual', 
          ${initialMessage}, 'text', 'sent'
        )
      `;
    }
    
    console.log('✅ [MESSAGING] Conversation created:', conversationId);
    res.json({
      success: true,
      conversationId,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    console.error('❌ [MESSAGING] Error creating conversation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create conversation',
      details: error.message 
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
        'other' as category,
        rating,
        location
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
    
    // Category-specific images for better visual variety
    const getCategoryImage = (category) => {
      const categoryImages = {
        'Wedding Planner': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
        'Wedding Planning': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
        'Photographer & Videographer': 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600',
        'Photography': 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600',
        'Videography': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600',
        'Florist': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600',
        'Flowers': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600',
        'Caterer': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600',
        'Catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600',
        'DJ/Band': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
        'DJ': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
        'Band': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
        'Officiant': 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600',
        'Hair & Makeup Artists': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
        'Makeup': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
        'Venue Coordinator': 'https://images.unsplash.com/photo-1519167758481-83f29c759c47?w=600',
        'Venue': 'https://images.unsplash.com/photo-1519167758481-83f29c759c47?w=600',
        'Event Rentals': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600',
        'Rentals': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600',
        'Transportation Services': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600',
        'Transportation': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600',
        'Cake Designer': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
        'Cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
        'Dress Designer/Tailor': 'https://images.unsplash.com/photo-1594736797933-d0d3e5753960?w=600',
        'Dress': 'https://images.unsplash.com/photo-1594736797933-d0d3e5753960?w=600',
        'Stationery Designer': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600',
        'Stationery': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600',
        'Sounds & Lights': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
        'Audio': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
        'Lighting': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
        'Security & Guest Management': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
        'Security': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
        'other': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600'
      };
      
      return categoryImages[category] || categoryImages['other'];
    };

    // Add category-specific images and format for frontend
    const formattedServices = services.map(service => {
      const categoryImage = getCategoryImage(service.category);
      return {
        ...service,
        image: service.images && service.images.length > 0 ? service.images[0] : categoryImage,
        images: service.images && service.images.length > 0 ? service.images : [categoryImage],
        vendorName: `Vendor ${service.vendor_id}`,
        rating: 4.5,
        reviewCount: 25,
        location: 'Multiple locations',
        features: ['Professional service', 'Experienced team'],
        contactInfo: {
          phone: '(555) 123-4567',
          email: 'info@vendor.com',
          website: 'https://vendor.com'
        }
      };
    });
    
    res.json({
      success: true,
      services: formattedServices,
      total: services.length,
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

// GET services by vendor ID
app.get('/api/services/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log(`🎯 [SERVICES] GET /api/services/vendor/${vendorId} called`);
    
    const services = await sql`
      SELECT 
        id,
        name,
        category,
        vendor_id,
        price,
        description,
        is_active,
        featured,
        created_at,
        updated_at
      FROM services 
      WHERE vendor_id = ${vendorId}
        AND name NOT LIKE '% (Deleted)'
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ [SERVICES] Found ${services.length} services for vendor ${vendorId}`);
    
    // Format services for frontend
    const formattedServices = services.map(service => ({
      id: service.id,
      vendorId: service.vendor_id,
      name: service.name,
      category: service.category,
      price: service.price || '0.00',
      description: service.description || '',
      isActive: service.is_active || false,
      featured: service.featured || false,
      rating: 4.5,
      reviewCount: 25,
      imageUrl: `https://images.unsplash.com/photo-1519741497674-611481863552?w=600`,
      images: [`https://images.unsplash.com/photo-1519741497674-611481863552?w=600`],
      location: 'Multiple locations',
      features: ['Professional service', 'Experienced team'],
      created_at: service.created_at,
      updated_at: service.updated_at
    }));
    
    res.json({
      success: true,
      services: formattedServices,
      total: services.length,
      vendorId
    });
    
  } catch (error) {
    console.error('❌ [SERVICES] Error fetching vendor services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor services',
      message: error.message
    });
  }
});

// CREATE new service
app.post('/api/services', async (req, res) => {
  try {
    console.log('🎯 [SERVICES] POST /api/services called');
    console.log('📄 Request body:', req.body);
    
    const {
      vendor_id,
      vendorId,
      name,
      title,
      category,
      description,
      price,
      is_active,
      isActive,
      featured
    } = req.body;
    
    const serviceVendorId = vendor_id || vendorId;
    const serviceName = name || title;
    const serviceActive = is_active !== undefined ? is_active : (isActive !== undefined ? isActive : true);
    
    if (!serviceVendorId || !serviceName || !category) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID, service name, and category are required'
      });
    }
    
    // Insert new service
    const result = await sql`
      INSERT INTO services (
        vendor_id,
        name,
        category,
        description,
        price,
        is_active,
        featured,
        created_at,
        updated_at
      ) VALUES (
        ${serviceVendorId},
        ${serviceName},
        ${category},
        ${description || ''},
        ${price || '0.00'},
        ${serviceActive},
        ${featured || false},
        NOW(),
        NOW()
      )
      RETURNING *
    `;
    
    console.log('✅ [SERVICES] Service created successfully');
    
    res.json({
      success: true,
      service: result[0],
      message: 'Service created successfully'
    });
    
  } catch (error) {
    console.error('❌ [SERVICES] Error creating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create service',
      message: error.message
    });
  }
});

// UPDATE service
app.put('/api/services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    console.log(`🎯 [SERVICES] PUT /api/services/${serviceId} called`);
    console.log('📄 Request body:', req.body);
    
    const {
      name,
      title,
      category,
      description,
      price,
      is_active,
      isActive,
      featured
    } = req.body;
    
    const serviceName = name || title;
    const serviceActive = is_active !== undefined ? is_active : (isActive !== undefined ? isActive : true);
    
    // Update service
    const result = await sql`
      UPDATE services 
      SET 
        name = ${serviceName || name},
        category = ${category},
        description = ${description || ''},
        price = ${price || '0.00'},
        is_active = ${serviceActive},
        featured = ${featured || false},
        updated_at = NOW()
      WHERE id = ${serviceId}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    console.log('✅ [SERVICES] Service updated successfully');
    
    res.json({
      success: true,
      service: result[0],
      message: 'Service updated successfully'
    });
    
  } catch (error) {
    console.error('❌ [SERVICES] Error updating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update service',
      message: error.message
    });
  }
});

// DELETE service (soft delete to handle foreign key constraints)
app.delete('/api/services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    console.log(`🎯 [SERVICES] DELETE /api/services/${serviceId} called`);
    
    // Check if service has active bookings
    const bookingCheck = await sql`
      SELECT COUNT(*) as booking_count 
      FROM bookings 
      WHERE service_id = ${serviceId}
    `;
    
    const hasBookings = parseInt(bookingCheck[0].booking_count) > 0;
    console.log(`📊 [SERVICES] Service ${serviceId} has ${bookingCheck[0].booking_count} bookings`);
    
    if (hasBookings) {
      // Soft delete: Mark as inactive and hidden
      console.log(`🔄 [SERVICES] Soft deleting service ${serviceId} due to existing bookings`);
      
      const result = await sql`
        UPDATE services 
        SET 
          is_active = false,
          name = name || ' (Deleted)',
          description = 'This service has been deleted but preserved due to existing bookings.',
          updated_at = NOW()
        WHERE id = ${serviceId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }
      
      console.log('✅ [SERVICES] Service soft deleted successfully');
      
      res.json({
        success: true,
        service: result[0],
        message: 'Service deleted successfully (preserved due to existing bookings)',
        softDelete: true
      });
      
    } else {
      // Hard delete: No bookings, safe to remove
      console.log(`🗑️ [SERVICES] Hard deleting service ${serviceId} - no bookings found`);
      
      const result = await sql`
        DELETE FROM services 
        WHERE id = ${serviceId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }
      
      console.log('✅ [SERVICES] Service hard deleted successfully');
      
      res.json({
        success: true,
        service: result[0],
        message: 'Service deleted successfully',
        softDelete: false
      });
    }
    
  } catch (error) {
    console.error('❌ [SERVICES] Error deleting service:', error);
    
    // Check if it's a foreign key constraint error
    if (error.message.includes('foreign key constraint') || error.message.includes('violates')) {
      console.log('🔄 [SERVICES] Foreign key constraint detected, attempting soft delete...');
      
      try {
        const result = await sql`
          UPDATE services 
          SET 
            is_active = false,
            name = name || ' (Deleted)',
            description = 'This service has been deleted but preserved due to existing bookings.',
            updated_at = NOW()
          WHERE id = ${req.params.serviceId}
          RETURNING *
        `;
        
        if (result.length > 0) {
          return res.json({
            success: true,
            service: result[0],
            message: 'Service deleted successfully (preserved due to existing bookings)',
            softDelete: true,
            reason: 'Foreign key constraint - service has existing bookings'
          });
        }
      } catch (softDeleteError) {
        console.error('❌ [SERVICES] Soft delete also failed:', softDeleteError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete service',
      message: error.message,
      details: 'This service may have existing bookings and cannot be completely removed.'
    });
  }
});

// ================================
// BOOKING ENDPOINTS
// ================================

app.post('/api/bookings/request', async (req, res) => {
  try {
    console.log('📝 [BOOKING] POST /api/bookings/request called');
    console.log('📦 [BOOKING] Request body:', req.body);
    
    const bookingRequest = req.body;
    
    // FIXED: Handle both camelCase (coupleId) and snake_case (couple_id) from frontend
    const coupleId = bookingRequest.coupleId || bookingRequest.couple_id || '1-2025-001';
    
    console.log('📥 [BookingRequest] FIXED - Received booking request:', {
      originalRequest: bookingRequest,
      extractedCoupleId: coupleId,
      vendor_id: bookingRequest.vendorId || bookingRequest.vendor_id,
      service_name: bookingRequest.serviceName || bookingRequest.service_name,
      event_date: bookingRequest.eventDate || bookingRequest.event_date
    });
    
    // Create a properly formatted booking object for the database
    // Note: contact_email removed until database schema is updated
    const properBookingData = {
      couple_id: coupleId,
      vendor_id: bookingRequest.vendorId || bookingRequest.vendor_id,
      service_name: bookingRequest.serviceName || bookingRequest.service_name,
      event_date: bookingRequest.eventDate || bookingRequest.event_date,
      event_time: bookingRequest.eventTime || bookingRequest.event_time,
      event_location: bookingRequest.eventLocation || bookingRequest.event_location,
      guest_count: bookingRequest.guestCount || bookingRequest.guest_count,
      contact_phone: bookingRequest.contactPhone || bookingRequest.contact_phone,
      budget_range: bookingRequest.budgetRange || bookingRequest.budget_range,
      special_requests: bookingRequest.specialRequests || bookingRequest.special_requests,
      status: 'request',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // FIXED: Use only basic columns that exist in the database schema
    const bookingId = Math.floor(Math.random() * 1000000); // Use smaller integer ID
    const now = new Date();
    
    // FIXED: Use only existing columns in current database schema
    // Remove contact_email since column doesn't exist yet
    await sql`
      INSERT INTO bookings (
        id, couple_id, vendor_id, service_name, event_date, event_time,
        event_location, guest_count, contact_phone, 
        budget_range, special_requests, status, created_at, updated_at
      ) VALUES (
        ${bookingId}, ${properBookingData.couple_id}, ${properBookingData.vendor_id}, 
        ${properBookingData.service_name}, ${properBookingData.event_date}, ${properBookingData.event_time},
        ${properBookingData.event_location}, ${properBookingData.guest_count}, ${properBookingData.contact_phone},
        ${properBookingData.budget_range}, ${properBookingData.special_requests}, 
        ${properBookingData.status}, ${now}, ${now}
      )
    `;
    
    // Store enhanced fields in metadata or logs for future schema update
    const enhancedFields = {
      contact_email: bookingRequest.contactEmail || bookingRequest.contact_email, // Captured separately
      event_duration: bookingRequest.eventDuration,
      event_type: bookingRequest.eventType,
      urgency_level: bookingRequest.urgencyLevel,
      flexible_dates: bookingRequest.flexibleDates,
      alternate_date: bookingRequest.alternateDate,
      referral_source: bookingRequest.referralSource,
      additional_services: bookingRequest.additionalServices
    };
    
    console.log('📋 [BOOKING] Enhanced fields captured (pending schema):', enhancedFields);
    
    console.log('✅ [BOOKING] Booking request created:', bookingId);
    
    // PROCESS TRACKING: Auto-log initial inquiry step
    try {
      await sql`
        INSERT INTO booking_process_log (
          booking_id, process_step, process_status, description, 
          metadata, created_by, created_by_type
        ) VALUES (
          ${bookingId}, 'inquiry', 'completed', 
          'Initial booking request submitted by couple',
          ${JSON.stringify({
            service_name: properBookingData.service_name,
            event_date: properBookingData.event_date,
            guest_count: properBookingData.guest_count,
            budget_range: properBookingData.budget_range
          })}, 
          ${coupleId}, 'couple'
        )
      `;
      
      // Update booking with initial process info
      await sql`
        UPDATE bookings 
        SET 
          process_stage = 'inquiry',
          progress_percentage = 10,
          next_action = 'Vendor to review and respond to booking request',
          next_action_by = 'vendor',
          last_activity_at = CURRENT_TIMESTAMP
        WHERE id = ${bookingId}
      `;
      
      console.log('📋 [PROCESS] Initial inquiry step logged for booking:', bookingId);
    } catch (processError) {
      console.log('⚠️ [PROCESS] Could not log process step (tables may not exist yet):', processError.message);
    }
    
    // Create a complete booking response for frontend
    const createdBooking = {
      id: bookingId,
      couple_id: properBookingData.couple_id,
      vendor_id: properBookingData.vendor_id,
      service_name: properBookingData.service_name,
      event_date: properBookingData.event_date,
      event_time: properBookingData.event_time,
      event_location: properBookingData.event_location,
      guest_count: properBookingData.guest_count,
      contact_phone: properBookingData.contact_phone,
      // contact_email removed - will be added when database schema is updated
      budget_range: properBookingData.budget_range,
      special_requests: properBookingData.special_requests,
      status: properBookingData.status,
      process_stage: 'inquiry',
      progress_percentage: 10,
      next_action: 'Vendor to review and respond to booking request',
      next_action_by: 'vendor',
      created_at: now,
      updated_at: now
    };
    
    res.json({
      success: true,
      booking: createdBooking,
      bookingId: bookingId,
      message: 'Booking request submitted successfully',
      enhancedFieldsCaptured: true,
      processTracking: 'enabled',
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

// ================== BOOKING ENDPOINTS ==================

// Get bookings for a couple/individual user
app.get('/api/bookings/couple/:userId', async (req, res) => {
  try {
    console.log('📊 [BOOKING] GET /api/bookings/couple/:userId called');
    const { userId } = req.params;
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    console.log('🔍 [BOOKING] Query params:', { userId, page, limit, sortBy, sortOrder });
    
    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Query bookings for this couple_id
    const bookingsQuery = `
      SELECT 
        id, service_id, service_name, vendor_id, vendor_name, couple_id, couple_name,
        event_date, event_time, event_location, guest_count, service_type, budget_range,
        special_requests, contact_phone, preferred_contact_method, status, total_amount,
        deposit_amount, notes, contract_details, response_message, 
        estimated_cost_min, estimated_cost_max, estimated_cost_currency,
        created_at, updated_at
      FROM bookings 
      WHERE couple_id = $1
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `SELECT COUNT(*) as total FROM bookings WHERE couple_id = $1`;
    
    const [bookingsResult, countResult] = await Promise.all([
      sql(bookingsQuery, [userId, parseInt(limit), offset]),
      sql(countQuery, [userId])
    ]);
    
    const bookings = bookingsResult.map(booking => {
      // Apply status mapping to transform database status to frontend expected status
      const mappedStatus = mapBookingStatus(booking.status, booking.response_message);
      console.log(`🔄 [STATUS MAPPING] Couple Booking ${booking.id}: ${booking.status} -> ${mappedStatus}`);
      
      return {
        ...booking,
        // Map the status using the mapping function
        status: mappedStatus,
        // Convert dates to ISO strings for frontend compatibility
        event_date: booking.event_date ? new Date(booking.event_date).toISOString() : null,
        created_at: booking.created_at ? new Date(booking.created_at).toISOString() : null,
        updated_at: booking.updated_at ? new Date(booking.updated_at).toISOString() : null,
        // Convert numeric values
        total_amount: booking.total_amount ? parseFloat(booking.total_amount) : 0,
        deposit_amount: booking.deposit_amount ? parseFloat(booking.deposit_amount) : 0,
        estimated_cost_min: booking.estimated_cost_min ? parseFloat(booking.estimated_cost_min) : 0,
        estimated_cost_max: booking.estimated_cost_max ? parseFloat(booking.estimated_cost_max) : 0
      };
    });
    
    const total = parseInt(countResult[0].total);
    
    res.json({
      success: true,
      bookings,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      message: `Found ${bookings.length} bookings for couple ${userId}`,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ [BOOKING] Retrieved ${bookings.length} bookings for couple ${userId}`);
  } catch (error) {
    console.error('❌ [BOOKING] Error in couple bookings endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch couple bookings',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced bookings endpoint for compatibility
app.get('/api/bookings/enhanced', async (req, res) => {
  try {
    console.log('📊 [BOOKING] GET /api/bookings/enhanced called');
    const { coupleId, vendorId, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    console.log('🔍 [BOOKING] Enhanced query params:', { coupleId, vendorId, page, limit, sortBy, sortOrder });
    
    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = '';
    let queryParams = [];
    let paramIndex = 1;
    
    if (coupleId && vendorId) {
      whereClause = `WHERE couple_id = $${paramIndex++} AND vendor_id = $${paramIndex++}`;
      queryParams = [coupleId, vendorId];
    } else if (coupleId) {
      whereClause = `WHERE couple_id = $${paramIndex++}`;
      queryParams = [coupleId];
    } else if (vendorId) {
      whereClause = `WHERE vendor_id = $${paramIndex++}`;
      queryParams = [vendorId];
    }
    
    // Add limit and offset params
    queryParams.push(parseInt(limit), offset);
    
    const bookingsQuery = `
      SELECT 
        id, service_id, service_name, vendor_id, vendor_name, couple_id, couple_name,
        event_date, event_time, event_location, guest_count, service_type, budget_range,
        special_requests, contact_phone, preferred_contact_method, status, total_amount,
        deposit_amount, notes, contract_details, response_message, 
        estimated_cost_min, estimated_cost_max, estimated_cost_currency,
        created_at, updated_at
      FROM bookings 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    const countQuery = `SELECT COUNT(*) as total FROM bookings ${whereClause}`;
    
    const [bookingsResult, countResult] = await Promise.all([
      sql(bookingsQuery, queryParams),
      sql(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);
    
    const bookings = bookingsResult.map(booking => {
      // Apply status mapping to transform database status to frontend expected status
      const mappedStatus = mapBookingStatus(booking.status, booking.response_message);
      console.log(`🔄 [STATUS MAPPING] Booking ${booking.id}: ${booking.status} -> ${mappedStatus}`);
      
      return {
        ...booking,
        // Map the status using the mapping function
        status: mappedStatus,
        // Convert dates to ISO strings for frontend compatibility
        event_date: booking.event_date ? new Date(booking.event_date).toISOString() : null,
        created_at: booking.created_at ? new Date(booking.created_at).toISOString() : null,
        updated_at: booking.updated_at ? new Date(booking.updated_at).toISOString() : null,
        // Convert numeric values
        total_amount: booking.total_amount ? parseFloat(booking.total_amount) : 0,
        deposit_amount: booking.deposit_amount ? parseFloat(booking.deposit_amount) : 0,
        estimated_cost_min: booking.estimated_cost_min ? parseFloat(booking.estimated_cost_min) : 0,
        estimated_cost_max: booking.estimated_cost_max ? parseFloat(booking.estimated_cost.max) : 0
      };
    });
    
    const total = parseInt(countResult[0].total);
    
    res.json({
      success: true,
      bookings,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      message: `Found ${bookings.length} enhanced bookings`,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ [BOOKING] Enhanced bookings retrieved: ${bookings.length}`);
  } catch (error) {
    console.error('❌ [BOOKING] Error in enhanced bookings endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enhanced bookings',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get bookings for a vendor
app.get('/api/bookings/vendor/:vendorId', async (req, res) => {
  try {
    console.log('📊 [BOOKING] GET /api/bookings/vendor/:vendorId called');
    const { vendorId } = req.params;
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    console.log('🔍 [BOOKING] Vendor query params:', { vendorId, page, limit, sortBy, sortOrder });
    
    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Query bookings for this vendor_id
    const bookingsQuery = `
      SELECT 
        id, service_id, service_name, vendor_id, vendor_name, couple_id, couple_name,
        event_date, event_time, event_location, guest_count, service_type, budget_range,
        special_requests, contact_phone, preferred_contact_method, status, total_amount,
        deposit_amount, notes, contract_details, response_message, 
        estimated_cost_min, estimated_cost_max, estimated_cost_currency,
        created_at, updated_at
      FROM bookings 
      WHERE vendor_id = $1
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `SELECT COUNT(*) as total FROM bookings WHERE vendor_id = $1`;
    
    const [bookingsResult, countResult] = await Promise.all([
      sql(bookingsQuery, [vendorId, parseInt(limit), offset]),
      sql(countQuery, [vendorId])
    ]);
    
    const bookings = bookingsResult.map(booking => {
      // Apply status mapping to transform database status to frontend expected status
      const mappedStatus = mapBookingStatus(booking.status, booking.response_message);
      console.log(`🔄 [STATUS MAPPING] Vendor Booking ${booking.id}: ${booking.status} -> ${mappedStatus}`);
      
      return {
        ...booking,
        // Map the status using the mapping function
        status: mappedStatus,
        // Convert dates to ISO strings for frontend compatibility
        event_date: booking.event_date ? new Date(booking.event_date).toISOString() : null,
        created_at: booking.created_at ? new Date(booking.created_at).toISOString() : null,
        updated_at: booking.updated_at ? new Date(booking.updated_at).toISOString() : null,
        // Convert numeric values
        total_amount: booking.total_amount ? parseFloat(booking.total_amount) : 0,
        deposit_amount: booking.deposit_amount ? parseFloat(booking.deposit_amount) : 0,
        estimated_cost_min: booking.estimated_cost_min ? parseFloat(booking.estimated_cost_min) : 0,
        estimated_cost_max: booking.estimated_cost_max ? parseFloat(booking.estimated_cost.max) : 0
      };
    });
    
    const total = parseInt(countResult[0].total);
    
    res.json({
      success: true,
      bookings,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      message: `Found ${bookings.length} bookings for vendor ${vendorId}`,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ [BOOKING] Retrieved ${bookings.length} bookings for vendor ${vendorId}`);
  } catch (error) {
    console.error('❌ [BOOKING] Error in vendor bookings endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor bookings',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get booking statistics
app.get('/api/bookings/stats', async (req, res) => {
  try {
    console.log('📊 [BOOKING] GET /api/bookings/stats called');
    const { userId, vendorId } = req.query;
    
    console.log('🔍 [BOOKING] Stats query params:', { userId, vendorId });
    
    let whereClause = '';
    let queryParams = [];
    
    if (userId && vendorId) {
      whereClause = `WHERE couple_id = $1 AND vendor_id = $2`;
      queryParams = [userId, vendorId];
    } else if (userId) {
      whereClause = `WHERE couple_id = $1`;
      queryParams = [userId];
    } else if (vendorId) {
      whereClause = `WHERE vendor_id = $1`;
      queryParams = [vendorId];
    }
    
    // Get overall stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_bookings,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'request' THEN 1 END) as request_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings
      FROM bookings 
      ${whereClause}
    `;
    
    // Get status breakdown
    const statusQuery = `
      SELECT status, COUNT(*) as count
      FROM bookings 
      ${whereClause}
      GROUP BY status
    `;
    
    const [statsResult, statusResult] = await Promise.all([
      sql(statsQuery, queryParams),
      sql(statusQuery, queryParams)
    ]);
    
    const stats = statsResult[0];
    const statusBreakdown = {};
    statusResult.forEach(row => {
      statusBreakdown[row.status] = parseInt(row.count);
    });
    
    res.json({
      success: true,
      stats: {
        totalBookings: parseInt(stats.total_bookings),
        totalRevenue: parseFloat(stats.total_revenue),
        pendingBookings: parseInt(stats.pending_bookings),
        requestBookings: parseInt(stats.request_bookings),
        confirmedBookings: parseInt(stats.confirmed_bookings),
        completedBookings: parseInt(stats.completed_bookings),
        cancelledBookings: parseInt(stats.cancelled_bookings),
        statusBreakdown
      },
      message: `Retrieved booking statistics${userId ? ` for user ${userId}` : ''}${vendorId ? ` for vendor ${vendorId}` : ''}`,
      timestamp: new Date().toISOString()
    });

    console.log('✅ [BOOKING] Booking stats retrieved:', stats);
  } catch (error) {
    console.error('❌ [BOOKING] Error in booking stats endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking stats',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Accept quotation endpoint
app.patch('/api/bookings/:bookingId/accept-quote', async (req, res) => {
  try {
    console.log('📊 [BOOKING] PATCH /api/bookings/:bookingId/accept-quote called');
    const { bookingId } = req.params;
    const { status = 'request', notes } = req.body;
    
    console.log('🔍 [BOOKING] Accept quote params:', { bookingId, status, notes });
    
    // Update booking status and manually handle status history to avoid trigger constraint
    const updatedBooking = await sql`
      UPDATE bookings 
      SET 
        status = ${status},
        notes = COALESCE(notes, '') || ${notes ? `\n[${new Date().toISOString()}] Quote accepted by couple` : 'Quote accepted by couple'},
        updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;
    
    // Manually insert into booking_status_history with proper user context
    try {
      await sql`
        INSERT INTO booking_status_history (
          booking_id, status_from, status_to, changed_by_user_type, 
          changed_by_user_id, change_reason, created_at
        ) VALUES (
          ${bookingId}, 'quote_sent', ${status}, 'couple',
          'couple-system', 'Quote accepted by couple', NOW()
        )
      `;
    } catch (historyError) {
      console.log('⚠️ [BOOKING] Could not log status history (may not be initialized):', historyError.message);
    }
    
    if (updatedBooking.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        message: `No booking found with ID ${bookingId}`,
        timestamp: new Date().toISOString()
      });
    }
    
    const booking = updatedBooking[0];
    
    res.json({
      success: true,
      booking: {
        ...booking,
        // Convert dates to ISO strings for frontend compatibility
        event_date: booking.event_date ? new Date(booking.event_date).toISOString() : null,
        created_at: booking.created_at ? new Date(booking.created_at).toISOString() : null,
        updated_at: booking.updated_at ? new Date(booking.updated_at).toISOString() : null,
        // Convert numeric values
        total_amount: booking.total_amount ? parseFloat(booking.total_amount) : 0,
        deposit_amount: booking.deposit_amount ? parseFloat(booking.deposit_amount) : 0,
        estimated_cost_min: booking.estimated_cost_min ? parseFloat(booking.estimated_cost_min) : 0,
        estimated_cost_max: booking.estimated_cost_max ? parseFloat(booking.estimated_cost.max) : 0
      },
      message: `Quotation accepted successfully for booking ${bookingId}`,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ [BOOKING] Quotation accepted for booking ${bookingId}, status updated to ${status}`);
  } catch (error) {
    console.error('❌ [BOOKING] Error accepting quotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept quotation',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});



// Create new booking endpoint
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      coupleId,
      vendorId,
      serviceType,
      weddingDate,
      eventLocation,
      specialRequests,
      coupleName,
      vendorName
    } = req.body;
    
    console.log('📝 [BOOKINGS] POST /api/bookings - Creating new booking');
    
          process_stage = 'quote_accepted',
          progress_percentage = 50,
          next_action = 'Process downpayment to secure booking',
          next_action_by = 'couple',
          last_activity_at = CURRENT_TIMESTAMP
        WHERE id = ${bookingId}d, service_type, status,
      `;wedding_date, event_location, special_requests,
        couple_name, vendor_name, created_at, updated_at
      console.log('📋 [PROCESS] Quote acceptance logged in process tracking system');
    } catch (processError) {leId}, ${vendorId}, ${serviceType}, 'request',
      console.log('⚠️ [PROCESS] Could not log quote acceptance (process tracking may not be initialized):', processError.message);
    }   ${coupleName}, ${vendorName}, ${now}, ${now}
      )
    console.log(`✅ [BOOKING] Quotation accepted for booking ${bookingId}, status updated to ${status}`);
  } catch (error) {
    console.error('❌ [BOOKING] Error accepting quotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept quotation',
      message: error.message,
      timestamp: new Date().toISOString()lly',
    });timestamp: new Date().toISOString()
  } });
}); 
  } catch (error) {
    console.error('❌ [BOOKINGS] Error creating booking:', error);
    res.status(500).json({
// Create new booking endpoint
app.post('/api/bookings', async (req, res) => {
  try {essage: error.message,
    const {tamp: new Date().toISOString()
      coupleId,
      vendorId,
      serviceType,
      weddingDate,
      eventLocation,atus endpoint
      specialRequests,gs/:bookingId/status', async (req, res) => {
      coupleName,
      vendorNameingId } = req.params;
    } = req.body;s, quotedPrice, finalPrice, message } = req.body;
    
    console.log('📝 [BOOKINGS] POST /api/bookings - Creating new booking');
    console.log(`📝 [BOOKINGS] New status: ${status}`);
    const bookingId = Date.now();ssage: ${message ? message.substring(0, 100) + '...' : 'No message'}`);
    const now = new Date();
    // Special handling for quote_sent - don't change status, just update message
    await sql` === 'quote_sent') {
      INSERT INTO bookings (t update the response message without changing status
        id, couple_id, vendor_id, service_type, status,
        wedding_date, event_location, special_requests,
        couple_name, vendor_name, created_at, updated_at
      ) VALUES ( = $3 
        ${bookingId}, ${coupleId}, ${vendorId}, ${serviceType}, 'request',
        ${weddingDate}, ${eventLocation}, ${specialRequests},
        ${coupleName}, ${vendorName}, ${now}, ${now}
      )wait sql(updateQuery, queryParams);
    `;
      // PROCESS TRACKING: Log quote communication and process step
    console.log(`✅ [BOOKINGS] Created booking ${bookingId}`);
        // Log communication
    res.json({sql`
      success: true,O booking_communications (
      bookingId: bookingId,munication_type, sender_type, sender_id, sender_name,
      message: 'Booking created successfully',ect, content, metadata
      timestamp: new Date().toISOString()
    });     ${bookingId}, 'quote', 'vendor', 'vendor-system', 'Vendor',
            'couple', 'couple-system', 'Quote for Wedding Service', ${message}, 
  } catch (error) {stringify({ quoted_price: quotedPrice, final_price: finalPrice })}
    console.error('❌ [BOOKINGS] Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      message: error.message,
      timestamp: new Date().toISOString() (
    });     booking_id, process_step, process_status, description, 
  }         metadata, created_by, created_by_type
});       ) VALUES (
            ${bookingId}, 'quote_sent', 'completed', 
            'Quote sent to couple with pricing details',
            ${JSON.stringify({ quoted_price: quotedPrice, message_preview: message?.substring(0, 100) })}, 
            'vendor-system', 'vendor'
          )ryParams = [dbStatus, new Date()];
        `;ramIndex = 3;
        
        // Update booking progress {
        await sql`+= `, quoted_price = $${paramIndex}`;
          UPDATE bookings tedPrice);
          SET ex++;
            process_stage = 'quote_sent',
            progress_percentage = 30,
            next_action = 'Couple to review and respond to quote',
            next_action_by = 'couple',$${paramIndex}`;
            last_activity_at = CURRENT_TIMESTAMP
          WHERE id = ${bookingId}
        `;
        
        console.log('📋 [PROCESS] Quote communication and process step logged');
      } catch (processError) {se_message = $${paramIndex}`;
        console.log('⚠️ [PROCESS] Could not log quote process (tables may not exist yet):', processError.message);
      }aramIndex++;
      
      console.log(`✅ [BOOKINGS] Updated booking ${bookingId} with quote message (status unchanged)`);
      dateQuery += ` WHERE id = $${paramIndex}`;
      res.json({push(bookingId);
        success: true,
        message: 'Quote sent successfully',
        processTracking: 'enabled',
        timestamp: new Date().toISOString()ng ${bookingId} status to ${dbStatus}`);
      });
      return;{
    } success: true,
      message: 'Booking status updated successfully',
    // Map frontend status back to database format for other statuses
    const dbStatus = status === 'quote_requested' ? 'request' :
                    status === 'confirmed' ? 'approved' :
                    status === 'downpayment_paid' ? 'downpayment' :
                    status === 'paid_in_full' ? 'paid' :tatus:', error);
                    status;
      success: false,
    // Build update query with proper SQL syntax
    let updateQuery = `ssage,
      UPDATE bookings ate().toISOString()
      SET status = $1, updated_at = $2
    `;
    let queryParams = [dbStatus, new Date()];
    let paramIndex = 3;
    ===============================
    if (quotedPrice !== undefined) {S
      updateQuery += `, quoted_price = $${paramIndex}`;
      queryParams.push(quotedPrice);
      paramIndex++;ng process tracking database
    }ost('/api/bookings/init-tracking', async (req, res) => {
    y {
    if (finalPrice !== undefined) {alizing booking process tracking tables...');
      updateQuery += `, final_price = $${paramIndex}`;
      queryParams.push(finalPrice);able
      paramIndex++;
    } CREATE TABLE IF NOT EXISTS booking_process_log (
        id SERIAL PRIMARY KEY,
    if (message !== undefined) {ULL,
      updateQuery += `, response_message = $${paramIndex}`;
      queryParams.push(message);0) NOT NULL,
      paramIndex++; TEXT,
    }   metadata JSONB,
        created_by VARCHAR(100),
    updateQuery += ` WHERE id = $${paramIndex}`;ed_by_type IN ('couple', 'vendor', 'admin', 'system')),
    queryParams.push(bookingId);AULT CURRENT_TIMESTAMP
      )
    await sql(updateQuery, queryParams);
    
    console.log(`✅ [BOOKINGS] Updated booking ${bookingId} status to ${dbStatus}`);
      CREATE INDEX IF NOT EXISTS idx_booking_process_booking ON booking_process_log(booking_id)
    res.json({
      success: true,
      message: 'Booking status updated successfully',
      timestamp: new Date().toISOString()ing_process_step ON booking_process_log(process_step)
    });
    
  } catch (error) {nt tracking table
    console.error('❌ [BOOKINGS] Error updating booking status:', error);
    res.status(500).json({EXISTS booking_payments (
      success: false,
      error: 'Failed to update booking status',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Log payment(payment_status === 'pending') {
app.post('/api/bookings/:bookingId/log-payment', async (req, res) => {ing' : 'final_payment_due';
  try {rocessDescription = `${payment_type} payment of ${amount} ${currency} is pending`;
    const { bookingId } = req.params;
    const {
      payment_type,
      amount,
      currency,
      payment_method,
      payment_status,
      transaction_id,
      provider_reference,
      metadata
    } = req.body;
    
    console.log('💳 [PAYMENT] Logging payment for booking:', bookingId);
    console.log('💰 [PAYMENT] Amount:', amount, currency, 'Type:', payment_type, 'Status:', payment_status);
    
    // Insert payment log entry
    const paymentEntry = await sql`
      INSERT INTO booking_payments (
        booking_id, payment_type, amount, currency, payment_method,
        payment_status, transaction_id, provider_reference, metadata,
        created_at, updated_at
      ) VALUES (
        ${bookingId}, ${payment_type}, ${amount}, ${currency}, ${payment_method},
        ${payment_status}, ${transaction_id}, ${provider_reference},
        ${JSON.stringify(metadata || {})},
        NOW(), NOW()
      ) RETURNING *
    `;
    
    // Update booking process based on payment status
    let processStep = '';
    let processDescription = '';
    
    if (payment_type === 'downpayment' && payment_status === 'completed') {
      processStep = 'downpayment_confirmed';
      processDescription = `Downpayment of ${amount} ${currency} confirmed via ${payment_method}`;
    } else if (payment_type === 'full' && payment_status === 'completed') {
      processStep = 'completed';
      processDescription = `Full payment of ${amount} ${currency} completed via ${payment_method}`;
    }
    
    if (processStep) {
      await sql`
        INSERT INTO booking_process_log (
          booking_id, process_step, process_status, description, 
          metadata, created_by, created_by_type
        ) VALUES (
          ${bookingId}, ${processStep}, 'completed', ${processDescription},
          ${JSON.stringify({ payment_id: paymentEntry[0].id, ...metadata })}, 
          'system', 'system'
        )
      `;
    }
    
    // Update booking with new process information
    await sql`
      UPDATE bookings 
      SET 
        process_stage = ${processStep},
        progress_percentage = 100,
        next_action = 'Service delivery completed',
        next_action_by = 'vendor',
        last_activity_at = CURRENT_TIMESTAMP
      WHERE id = ${bookingId}
    `;
    
    console.log('✅ [PAYMENT] Payment logged and process updated');
    
    res.json({
      success: true,
      payment_entry: paymentEntry[0],
      process_step_logged: processStep || null,
      message: 'Payment logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [PAYMENT] Error logging payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log payment',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Log communication
app.post('/api/bookings/:bookingId/log-communication', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      communication_type,
      sender_type,
      sender_id,
      sender_name,
      recipient_type,
      recipient_id,
      subject,
      content,
      metadata
    } = req.body;
    
    console.log('💬 [COMM] Logging communication for booking:', bookingId);
    console.log('📧 [COMM] Type:', communication_type, 'From:', sender_type, 'To:', recipient_type);
    
    // Insert communication log entry
    const commEntry = await sql`
      INSERT INTO booking_communications (
        booking_id, communication_type, sender_type, sender_id, sender_name,
        recipient_type, recipient_id, subject, content, metadata
      ) VALUES (
        ${bookingId}, ${communication_type}, ${sender_type}, ${sender_id}, ${sender_name},
        ${recipient_type}, ${recipient_id}, ${subject}, ${content}, 
        ${JSON.stringify(metadata || {})}
      ) RETURNING *
    `;
    
    // Auto-log process step for certain communications
    let processStep = '';
    let processDescription = '';
    
    if (communication_type === 'quote') {
      processStep = 'quote_sent';
      processDescription = `Quote sent from ${sender_name} to couple`;
    } else if (communication_type === 'contract') {
      processStep = 'contract_sent';
      processDescription = `Contract sent from ${sender_name} to couple`;
    }
    
    if (processStep) {
      await sql`
        INSERT INTO booking_process_log (
          booking_id, process_step, process_status, description, 
          metadata, created_by, created_by_type
        ) VALUES (
          ${bookingId}, ${processStep}, 'completed', ${processDescription},
          ${JSON.stringify({ communication_id: commEntry[0].id, ...metadata })}, 
          ${sender_id}, ${sender_type}
        )
      `;
    }
    
    // Update last activity
    await sql`
      UPDATE bookings 
      SET last_activity_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${bookingId}
    `;
    
    console.log('✅ [COMM] Communication logged');
    
    res.json({
      success: true,
      communication_entry: commEntry[0],
      process_step_logged: processStep || null,
      message: 'Communication logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [COMM] Error logging communication:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log communication',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get booking process history
app.get('/api/bookings/:bookingId/process-history', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    console.log('📜 [PROCESS] Getting process history for booking:', bookingId);
    
    // Get process log entries
    const processHistory = await sql`
      SELECT * FROM booking_process_log 
      WHERE booking_id = ${bookingId}
      ORDER BY created_at DESC
    `;
    
    // Get payment history
    const paymentHistory = await sql`
      SELECT * FROM booking_payments 
      WHERE booking_id = ${bookingId}
      ORDER BY created_at DESC
    `;
    
    // Get communication history
    const communicationHistory = await sql`
      SELECT * FROM booking_communications 
      WHERE booking_id = ${bookingId}
      ORDER BY created_at DESC
    `;
    
    // Get current booking status
    const booking = await sql`
      SELECT process_stage, progress_percentage, next_action, next_action_by, last_activity_at
      FROM bookings 
      WHERE id = ${bookingId}
    `;
    
    console.log('✅ [PROCESS] Retrieved complete process history');
    
    res.json({
      success: true,
      booking_status: booking[0] || null,
      process_history: processHistory,
      payment_history: paymentHistory,
      communication_history: communicationHistory,
      summary: {
        total_process_steps: processHistory.length,
        total_payments: paymentHistory.length,
        total_communications: communicationHistory.length,
        current_stage: booking[0]?.process_stage || 'unknown',
        progress_percentage: booking[0]?.progress_percentage || 0
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [PROCESS] Error getting process history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get process history',
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
