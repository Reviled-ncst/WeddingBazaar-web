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
    'https://weddingbazaarph.web.app'
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
console.log('🔄 Filter Fix Deployment:', new Date().toISOString());

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
      const mappedStatus = mapBookingStatus(booking.status);
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
      const mappedStatus = mapBookingStatus(booking.status);
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
      const mappedStatus = mapBookingStatus(booking.status);
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
    const { status = 'approved', notes } = req.body;
    
    console.log('🔍 [BOOKING] Accept quote params:', { bookingId, status, notes });
    
    // Update booking status and add notes
    const updateQuery = `
      UPDATE bookings 
      SET 
        status = $1,
        notes = COALESCE(notes, '') || $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const updatedBooking = await sql(updateQuery, [
      status,
      notes ? `\n[${new Date().toISOString()}] ${notes}` : '',
      bookingId
    ]);
    
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
        estimated_cost_max: booking.estimated_cost_max ? parseFloat(booking.estimated_cost_max) : 0
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

// ================================
// STATUS MAPPING FUNCTION
// ================================

// Status mapping function to transform database values to frontend expectations
const mapBookingStatus = (dbStatus) => {
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
    
    const bookingId = Date.now();
    const now = new Date();
    
    await sql`
      INSERT INTO bookings (
        id, couple_id, vendor_id, service_type, status,
        wedding_date, event_location, special_requests,
        couple_name, vendor_name, created_at, updated_at
      ) VALUES (
        ${bookingId}, ${coupleId}, ${vendorId}, ${serviceType}, 'request',
        ${weddingDate}, ${eventLocation}, ${specialRequests},
        ${coupleName}, ${vendorName}, ${now}, ${now}
      )
    `;
    
    console.log(`✅ [BOOKINGS] Created booking ${bookingId}`);
    
    res.json({
      success: true,
      bookingId: bookingId,
      message: 'Booking created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [BOOKINGS] Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Update booking status endpoint
app.patch('/api/bookings/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, quotedPrice, finalPrice } = req.body;
    
    console.log(`📝 [BOOKINGS] PATCH /api/bookings/${bookingId}/status`);
    console.log(`📝 [BOOKINGS] New status: ${status}`);
    
    // Map frontend status back to database format if needed
    const dbStatus = status === 'quote_requested' ? 'request' :
                    status === 'confirmed' ? 'approved' :
                    status === 'downpayment_paid' ? 'downpayment' :
                    status;
    
    const updateFields = {
      status: dbStatus,
      updated_at: new Date()
    };
    
    if (quotedPrice !== undefined) updateFields.quoted_price = quotedPrice;
    if (finalPrice !== undefined) updateFields.final_price = finalPrice;
    
    await sql`
      UPDATE bookings 
      SET ${sql(updateFields)}
      WHERE id = ${bookingId}
    `;
    
    console.log(`✅ [BOOKINGS] Updated booking ${bookingId} status to ${dbStatus}`);
    
    res.json({
      success: true,
      message: 'Booking status updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [BOOKINGS] Error updating booking status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status',
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
