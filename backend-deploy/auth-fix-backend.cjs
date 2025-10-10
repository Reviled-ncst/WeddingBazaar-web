const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Initialize Neon serverless client
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

// Test database connection on startup
async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Check if we have test users
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`📊 Found ${users[0].count} users in database`);
    
    // Create demo user if none exists
    if (users[0].count === 0) {
      console.log('Creating demo user...');
      const hashedPassword = await bcrypt.hash('test123', 10);
      await sql`
        INSERT INTO users (id, email, password, user_type, created_at, updated_at)
        VALUES ('demo-couple-001', 'couple@test.com', ${hashedPassword}, 'individual', NOW(), NOW())
      `;
      console.log('✅ Demo user created: couple@test.com / test123');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Initialize connection on startup
testConnection();

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
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
      version: '2.4.0-MESSAGING-SERVICES-COMPLETE',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      endpoints: {
        health: 'Active',
        ping: 'Active',
        auth: 'Active',
        vendors: 'Active',
        services: 'Active',
        bookings: 'Active',
        conversations: 'Active',
        messages: 'Active',
        availability: 'Active'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Login endpoint with detailed debugging
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login attempt received:', { email: req.body.email, hasPassword: !!req.body.password });
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Find user by email
    console.log('🔍 Looking for user:', email);
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    
    if (users.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }

    const user = users[0];
    console.log('✅ User found:', { id: user.id, email: user.email, type: user.user_type });
    console.log('🔐 Password hash length:', user.password.length);
    console.log('🔐 Password hash starts with:', user.password.substring(0, 10));

    // Verify password with detailed logging
    console.log('🔐 Comparing password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.user_type 
      },
      process.env.JWT_SECRET || 'wedding-bazaar-secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', email);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.user_type,
        firstName: user.first_name,
        lastName: user.last_name
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Vendors endpoint
app.get('/api/vendors/featured', async (req, res) => {
  try {
    const vendors = await sql`
      SELECT * FROM vendors 
      WHERE verified = true 
      ORDER BY rating DESC 
      LIMIT 5
    `;

    res.json({
      success: true,
      vendors: vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        category: vendor.category,
        rating: vendor.rating,
        review_count: vendor.review_count,
        location: vendor.location,
        description: vendor.description,
        image_url: vendor.image_url,
        website_url: vendor.website_url,
        years_experience: vendor.years_experience,
        portfolio_images: vendor.portfolio_images,
        verified: vendor.verified,
        starting_price: vendor.starting_price,
        price_range: `$${vendor.starting_price} - $${parseFloat(vendor.starting_price) * 2}`
      })),
      count: vendors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Vendors error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint to check users
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await sql`SELECT id, email, user_type, created_at FROM users ORDER BY created_at`;
    res.json({
      success: true,
      users: users,
      count: users.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === MESSAGING ENDPOINTS ===

// Get conversations for a user (vendor or individual)
app.get('/api/conversations/:userId', async (req, res) => {
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
app.get('/api/conversations/:conversationId/messages', async (req, res) => {
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
app.post('/api/conversations/:conversationId/messages', async (req, res) => {
  console.log('📤 Sending message to conversation:', req.params.conversationId);
  
  try {
    const { conversationId } = req.params;
    const { senderId, senderType, content, messageType = 'text' } = req.body;
    
    if (!senderId || !senderType || !content) {
      return res.status(400).json({
        success: false,
        error: 'senderId, senderType, and content are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Insert message
    const message = await sql`
      INSERT INTO messages (
        id, conversation_id, sender_id, sender_type, content, 
        message_type, created_at, updated_at
      ) VALUES (
        ${messageId}, ${conversationId}, ${senderId}, ${senderType}, ${content},
        ${messageType}, NOW(), NOW()
      ) RETURNING *
    `;
    
    // Update conversation last message
    await sql`
      UPDATE conversations 
      SET last_message = ${content}, 
          last_message_time = NOW(),
          updated_at = NOW()
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
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === SERVICES ENDPOINTS ===

// Get services for a vendor
app.get('/api/services/vendor/:vendorId', async (req, res) => {
  console.log('🛠️ Getting services for vendor:', req.params.vendorId);
  
  try {
    const { vendorId } = req.params;
    
    const services = await sql`
      SELECT * FROM services 
      WHERE vendor_id = ${vendorId}
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ Found ${services.length} services for vendor ${vendorId}`);
    
    res.json({
      success: true,
      services: services,
      count: services.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Services error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get services for a vendor (alternative route pattern)
app.get('/api/vendors/:vendorId/services', async (req, res) => {
  console.log('🛠️ Getting services for vendor (alt route):', req.params.vendorId);
  
  try {
    const { vendorId } = req.params;
    
    const services = await sql`
      SELECT * FROM services 
      WHERE vendor_id = ${vendorId}
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ Found ${services.length} services for vendor ${vendorId}`);
    
    res.json({
      success: true,
      services: services,
      count: services.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Vendor services error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all services with optional vendor filter
app.get('/api/services', async (req, res) => {
  console.log('🛠️ Getting services with filters:', req.query);
  
  try {
    const { vendorId, category, limit = 50, offset = 0 } = req.query;
    
    let query = `SELECT * FROM services WHERE 1=1`;
    let params = [];
    
    if (vendorId) {
      query += ` AND vendor_id = $${params.length + 1}`;
      params.push(vendorId);
    }
    
    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const services = await sql(query, params);
    
    console.log(`✅ Found ${services.length} services`);
    
    res.json({
      success: true,
      services: services,
      count: services.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Services error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === BOOKINGS ENDPOINTS ===

// Get bookings for a vendor
app.get('/api/bookings/vendor/:vendorId', async (req, res) => {
  console.log('📅 Getting bookings for vendor:', req.params.vendorId);
  
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT * FROM bookings 
      WHERE vendor_id = $1
    `;
    let params = [vendorId];
    
    if (status && status !== 'all') {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const bookings = await sql(query, params);
    
    console.log(`✅ Found ${bookings.length} bookings for vendor ${vendorId}`);
    
    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length,
      totalPages: Math.ceil(bookings.length / limit),
      currentPage: parseInt(page),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Vendor bookings error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get booking statistics for a vendor
app.get('/api/bookings/stats', async (req, res) => {
  console.log('📊 Getting booking stats:', req.query);
  
  try {
    const { vendorId } = req.query;
    
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        error: 'vendorId parameter is required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get booking statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COALESCE(SUM(CASE WHEN status IN ('confirmed', 'completed') THEN CAST(total_amount AS DECIMAL) END), 0) as total_revenue
      FROM bookings 
      WHERE vendor_id = ${vendorId}
    `;
    
    console.log(`✅ Generated stats for vendor ${vendorId}`);
    
    res.json({
      success: true,
      stats: stats[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Booking stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === NOTIFICATIONS ENDPOINTS ===

// Create notifications table if it doesn't exist
async function createNotificationsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL,
        title VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(100) NOT NULL DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        action_url VARCHAR(500),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Notifications table ready');
  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
  }
}

// Get notifications for a vendor
app.get('/api/notifications/vendor/:vendorId', async (req, res) => {
  console.log('🔔 Getting notifications for vendor:', req.params.vendorId);
  
  try {
    const { vendorId } = req.params;
    const { limit = 20, unreadOnly = false } = req.query;
    
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 AND user_type = 'vendor'
    `;
    
    if (unreadOnly === 'true') {
      query += ` AND is_read = FALSE`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $2`;
    
    const notifications = await sql(query, [vendorId, parseInt(limit)]);
    
    // If no notifications exist, create some sample ones
    if (notifications.length === 0) {
      console.log('📋 Creating sample notifications for vendor...');
      
      const sampleNotifications = [
        {
          id: `notif-${Date.now()}-1`,
          title: 'New Booking Request',
          message: 'You have a new booking request for your DJ services',
          type: 'booking',
          action_url: '/vendor/bookings'
        },
        {
          id: `notif-${Date.now()}-2`,
          title: 'Profile Update Needed',
          message: 'Please update your business hours and availability',
          type: 'profile',
          action_url: '/vendor/profile'
        },
        {
          id: `notif-${Date.now()}-3`,
          title: 'New Message',
          message: 'You have received a new message from a potential client',
          type: 'message',
          action_url: '/vendor/messages'
        }
      ];
      
      for (const notif of sampleNotifications) {
        await sql`
          INSERT INTO notifications (id, user_id, user_type, title, message, type, action_url, created_at, updated_at)
          VALUES (${notif.id}, ${vendorId}, 'vendor', ${notif.title}, ${notif.message}, ${notif.type}, ${notif.action_url}, NOW(), NOW())
        `;
      }
      
      // Re-fetch notifications
      const newNotifications = await sql(query, [vendorId, parseInt(limit)]);
      
      console.log(`✅ Created ${sampleNotifications.length} sample notifications`);
      
      return res.json({
        success: true,
        notifications: newNotifications,
        count: newNotifications.length,
        unreadCount: newNotifications.filter(n => !n.is_read).length,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ Found ${notifications.length} notifications for vendor ${vendorId}`);
    
    res.json({
      success: true,
      notifications: notifications,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.is_read).length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Notifications error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Mark notification as read
app.patch('/api/notifications/:notificationId/read', async (req, res) => {
  console.log('✅ Marking notification as read:', req.params.notificationId);
  
  try {
    const { notificationId } = req.params;
    
    await sql`
      UPDATE notifications 
      SET is_read = TRUE, updated_at = NOW()
      WHERE id = ${notificationId}
    `;
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Mark read error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize notifications table
createNotificationsTable();

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Bazaar Backend server running on port ${PORT}`);
  console.log(`📊 Version: 2.4.0-MESSAGING-SERVICES-COMPLETE`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});
