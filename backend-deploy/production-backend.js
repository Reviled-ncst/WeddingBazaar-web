const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./config/database.cjs');

// Updated: 2025-11-07 - Fixed auth profile endpoint infinite loop

// Import route modules
const authRoutes = require('./routes/auth.cjs');
const conversationRoutes = require('./routes/conversations.cjs');
const serviceRoutes = require('./routes/services.cjs');
const vendorRoutes = require('./routes/vendors.cjs');
const vendorProfileRoutes = require('./routes/vendor-profile.cjs');
const coupleProfileRoutes = require('./routes/couple-profile.cjs');
const vendorOffDaysRoutes = require('./routes/vendorOffDays.cjs');
const bookingRoutes = require('./routes/bookings.cjs');
const paymentsRoutes = require('./routes/payments.cjs');
const receiptsRoutes = require('./routes/receipts.cjs');
const notificationRoutes = require('./routes/notifications.cjs');
const debugRoutes = require('./routes/debug.cjs');
const bookingsTestRoutes = require('./routes/bookings-test.cjs');
const bookingCompletionRoutes = require('./routes/booking-completion.cjs'); // Two-sided completion system
const adminRoutes = require('./routes/admin.cjs'); // Old admin routes
const adminUserRoutes = require('./routes/admin/index.cjs'); // New modular admin routes
const dssRoutes = require('./routes/dss.cjs'); // Decision Support System routes
const categoryRoutes = require('./routes/categories.cjs'); // Dynamic categories system
const subscriptionRoutes = require('./routes/subscriptions/index.cjs'); // NEW MODULAR subscription system with PayMongo
const reviewRoutes = require('./routes/reviews.cjs'); // Reviews and ratings system
const walletRoutes = require('./routes/wallet.cjs'); // Vendor wallet and earnings system
const coordinatorRoutes = require('./routes/coordinator/index.cjs'); // Coordinator feature modules
const bookingReportsRoutes = require('./routes/booking-reports.cjs'); // Booking reports system (vendor & couple)

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

// Initialize database connection with timeout
const initDatabase = async () => {
  const timeout = setTimeout(() => {
    console.warn('⚠️  Database connection taking longer than expected, continuing anyway...');
  }, 5000); // 5 second warning

  try {
    await Promise.race([
      testConnection(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);
    clearTimeout(timeout);
  } catch (error) {
    clearTimeout(timeout);
    console.error('⚠️  Database connection failed during startup:', error.message);
    console.log('🔄 Server will continue running but database operations may fail');
  }
};

// Start database initialization (non-blocking)
initDatabase();

// Health check endpoint (updated for quote system)
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
      version: '2.7.4-ITEMIZED-PRICES-FIXED',
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

// TEST: Direct service fetch endpoint (no route parameters)
app.get('/api/test-service-direct', async (req, res) => {
  try {
    const { sql } = require('./config/database.cjs');
    const services = await sql`SELECT * FROM services WHERE id = 'SRV-0001'`;
    
    if (services.length === 0) {
      return res.json({ success: false, message: 'Service not found', tested: 'SRV-0001' });
    }
    
    res.json({
      success: true,
      service: services[0],
      message: 'Direct query successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Wedding Bazaar Backend is running - Modular Architecture',
    version: '2.7.4-ITEMIZED-PRICES-FIXED',
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
app.use('/api/vendor-profile', vendorProfileRoutes);
app.use('/api/couple-profile', coupleProfileRoutes);
app.use('/api/vendors', vendorOffDaysRoutes);  
app.use('/api/bookings', bookingRoutes);
app.use('/api/bookings', bookingCompletionRoutes); // Two-sided completion endpoints
app.use('/api/bookings-test', bookingsTestRoutes);
  app.use('/api/payment', paymentsRoutes);  // Changed from /api/payments to /api/payment
  app.use('/api/receipts', receiptsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/categories', categoryRoutes); // Dynamic categories system
app.use('/api/subscriptions', subscriptionRoutes); // Vendor subscription management
app.use('/api/reviews', reviewRoutes); // Reviews and ratings system
app.use('/api/wallet', walletRoutes); // Vendor wallet and earnings system
app.use('/api/coordinator', coordinatorRoutes); // Coordinator feature modules (weddings, milestones, vendors, clients, commissions)
app.use('/api/booking-reports', bookingReportsRoutes); // Booking reports system (vendor & couple)

// Admin routes - New modular user management system
app.use('/api/admin', adminUserRoutes); // User management, stats, etc.
// app.use('/api/admin/legacy', adminRoutes); // Old admin routes (vendor mappings)

// DSS routes - Intelligent recommendation system
app.use('/api/dss', dssRoutes); // Decision Support System endpoints

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
      services: 'GET /api/services, GET /api/services/:serviceId, GET /api/services/vendor/:vendorId, POST /api/services, PUT /api/services/:id, DELETE /api/services/:id',
      vendors: 'GET /api/vendors, GET /api/vendors/featured, GET /api/vendors/:id, GET /api/vendors/:id/services',
      vendorOffDays: 'GET /api/vendors/:vendorId/off-days, POST /api/vendors/:vendorId/off-days, POST /api/vendors/:vendorId/off-days/bulk, DELETE /api/vendors/:vendorId/off-days/:offDayId, GET /api/vendors/:vendorId/off-days/count',
      bookings: 'GET /api/bookings/vendor/:vendorId, GET /api/bookings/user/:userId, GET /api/bookings/couple/:userId, GET /api/bookings/enhanced, GET /api/bookings/stats, POST /api/bookings, PATCH /api/bookings/:id/status, PUT /api/bookings/:id/update-status, PUT /api/bookings/:id/accept-quote, PUT /api/bookings/:id/process-payment, GET /api/bookings/:id/payment-status',
      payments: 'POST /api/payments/create-source, GET /api/payments/source/:sourceId, POST /api/payments/create-payment-intent, GET /api/payments/payment-intent/:intentId, POST /api/payments/webhook, GET /api/payments/health',
      receipts: 'GET /api/receipts/couple/:coupleId, GET /api/receipts/vendor/:vendorId, GET /api/receipts/:receiptId, POST /api/receipts/create, GET /api/receipts/stats/couple/:coupleId',
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
  console.log(`📊 Version: 2.7.4-ITEMIZED-PRICES-FIXED`);
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
  console.log('   � Categories: GET /api/categories, GET /api/categories/:id/features');
  console.log('   �📅 Vendor Off-Days: GET /api/vendors/:vendorId/off-days, POST /api/vendors/:vendorId/off-days');
  console.log('   📅 Bookings: GET /api/bookings/vendor/:vendorId');
  console.log('   🔔 Notifications: GET /api/notifications/vendor/:vendorId');
  console.log('   🐛 Debug: GET /api/debug/users');
  console.log('🎉========================================🎉');
});

module.exports = app;


// Deployment trigger: Cancel booking fix
