const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./config/database.cjs');

// Import route modules
const authRoutes = require('./routes/auth.cjs');
const conversationRoutes = require('./routes/conversations.cjs');
const serviceRoutes = require('./routes/services.cjs');
const vendorRoutes = require('./routes/vendors.cjs');
const vendorOffDaysRoutes = require('./routes/vendorOffDays.cjs');
const bookingRoutes = require('./routes/bookings.cjs');
const notificationRoutes = require('./routes/notifications.cjs');
const debugRoutes = require('./routes/debug.cjs');

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

// Initialize database connection
testConnection();

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { sql } = require('./config/database.cjs');
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
      version: '2.5.0-MODULAR-ARCHITECTURE-COMPLETE',
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
        notifications: 'Active',
        debug: 'Active'
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

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Wedding Bazaar Backend is running - Modular Architecture',
    version: '2.5.0-MODULAR-ARCHITECTURE-COMPLETE',
    timestamp: new Date().toISOString()
  });
});

// COMPATIBILITY ENDPOINTS - Direct message sending endpoint for frontend compatibility
app.post('/api/messages', async (req, res) => {
  console.log('🔄 Compatibility endpoint: /api/messages called');
  
  try {
    const { sql } = require('./config/database.cjs');
    const { conversationId, senderId, senderType, senderName, content, messageType = 'text' } = req.body;
    
    if (!conversationId || !senderId || !senderType || !senderName || !content) {
      return res.status(400).json({
        success: false,
        error: 'conversationId, senderId, senderType, senderName, and content are required',
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
    
    console.log(`✅ Message sent via compatibility endpoint: ${messageId}`);
    
    res.json({
      success: true,
      messageId: messageId,
      conversationId: conversationId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Compatibility message send error:', error);
    console.error('❌ Full error details:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/vendors', vendorOffDaysRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/debug', debugRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      health: 'GET /api/health',
      ping: 'GET /api/ping',
      auth: 'POST /api/auth/login, POST /api/auth/verify',
      conversations: 'GET /api/conversations/:userId, GET /api/conversations/:id/messages, POST /api/conversations/:id/messages',
      services: 'GET /api/services, GET /api/services/vendor/:vendorId, POST /api/services, PUT /api/services/:id, DELETE /api/services/:id',
      vendors: 'GET /api/vendors, GET /api/vendors/featured, GET /api/vendors/:id, GET /api/vendors/:id/services',
      vendorOffDays: 'GET /api/vendors/:vendorId/off-days, POST /api/vendors/:vendorId/off-days, POST /api/vendors/:vendorId/off-days/bulk, DELETE /api/vendors/:vendorId/off-days/:offDayId, GET /api/vendors/:vendorId/off-days/count',
      bookings: 'GET /api/bookings/vendor/:vendorId, GET /api/bookings/user/:userId, GET /api/bookings/stats, POST /api/bookings, PATCH /api/bookings/:id/status',
      notifications: 'GET /api/notifications/vendor/:vendorId, GET /api/notifications/user/:userId, POST /api/notifications, PATCH /api/notifications/:id/read',
      debug: 'GET /api/debug/users, GET /api/debug/tables, GET /api/debug/schema/:tableName, GET /api/debug/sample/:tableName'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🎉========================================🎉');
  console.log('🚀 Wedding Bazaar Backend Server Started');
  console.log('🎉========================================🎉');
  console.log(`📊 Version: 2.5.0-MODULAR-ARCHITECTURE-COMPLETE`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log('');
  console.log('📡 Available API Endpoints:');
  console.log('   🏥 Health: GET /api/health');
  console.log('   🔐 Auth: POST /api/auth/login, POST /api/auth/verify');
  console.log('   💬 Conversations: GET /api/conversations/:userId');
  console.log('   🛠️  Services: GET /api/services/vendor/:vendorId');
  console.log('   🏪 Vendors: GET /api/vendors/featured');
  console.log('   📅 Vendor Off-Days: GET /api/vendors/:vendorId/off-days, POST /api/vendors/:vendorId/off-days');
  console.log('   📅 Bookings: GET /api/bookings/vendor/:vendorId');
  console.log('   🔔 Notifications: GET /api/notifications/vendor/:vendorId');
  console.log('   🐛 Debug: GET /api/debug/users');
  console.log('🎉========================================🎉');
});

module.exports = app;
