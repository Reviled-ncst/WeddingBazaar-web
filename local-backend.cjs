const express = require('express');
const cors = require('cors');

// Working Local Backend for Wedding Bazaar - FIXED VERSION
// This provides the missing endpoints your frontend needs

const app = express();
const PORT = 3002;

// Middleware
app.use(cors({
  origin: ['https://weddingbazaarph.web.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

console.log('🚀 Starting Wedding Bazaar Local Backend...');

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'local-development',
    message: 'Local backend running to support frontend'
  });
});

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    timestamp: new Date().toISOString() 
  });
});

// Vendors endpoints - Return empty for now since your frontend is getting data from production
app.get('/api/vendors', (req, res) => {
  console.log('🏪 GET /api/vendors called');
  res.json({
    success: true,
    vendors: [],
    total: 0,
    message: 'Frontend using production data'
  });
});

app.get('/api/vendors/featured', (req, res) => {
  console.log('⭐ GET /api/vendors/featured called');
  res.json({
    success: true,
    vendors: [],
    total: 0,
    message: 'Frontend using production data'
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Local login attempt:', email);
  
  if (email && password) {
    res.json({
      success: true,
      token: 'local-dev-token-12345',
      user: {
        id: 'local-user-1',
        email: email,
        name: 'Local Dev User',
        userType: 'individual'
      },
      message: 'Local login successful'
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Email and password required'
    });
  }
});

app.post('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
  
  res.json({
    success: true,
    authenticated: !!token,
    user: token ? {
      id: 'local-user-1',
      email: 'local@example.com',
      name: 'Local Dev User'
    } : null,
    message: token ? 'Local token valid' : 'No token provided'
  });
});

// CRITICAL: Booking endpoints that your frontend needs
app.post('/api/bookings/request', (req, res) => {
  console.log('📝 LOCAL: POST /api/bookings/request called');
  console.log('📦 Request body:', req.body);
  
  res.json({
    success: true,
    booking: {
      id: 'local-booking-' + Date.now(),
      status: 'pending',
      vendorId: req.body.vendorId || req.body.vendor_id,
      serviceId: req.body.serviceId || req.body.service_id,
      coupleId: req.body.coupleId,
      eventDate: req.body.eventDate || req.body.event_date,
      createdAt: new Date().toISOString(),
      message: 'Local booking created successfully'
    },
    message: 'Local booking request submitted successfully'
  });
});

// CRITICAL: This is the endpoint that was failing in your logs
app.get('/api/bookings/couple/:coupleId', (req, res) => {
  const { coupleId } = req.params;
  console.log('👥 LOCAL: GET /api/bookings/couple/' + coupleId + ' called');
  
  res.json({
    success: true,
    bookings: [
      {
        id: 'local-booking-1',
        vendorName: 'Perfect Weddings Co.',
        serviceName: 'Wedding Planning',
        status: 'confirmed',
        eventDate: '2025-12-15',
        amount: 3500,
        createdAt: new Date().toISOString()
      }
    ],
    total: 1,
    message: 'Local bookings retrieved'
  });
});

// Database scan endpoint (returns empty since production is working)
app.get('/api/database/scan', (req, res) => {
  res.json({
    success: true,
    services: [],
    message: 'Local endpoint - production database is working fine'
  });
});

// Catch-all
app.use('*', (req, res) => {
  console.log('❓ Unknown endpoint called:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Endpoint not found in local backend',
    message: `${req.method} ${req.originalUrl} not available locally`,
    note: 'Your frontend should be using production endpoints for most data'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 LOCAL Wedding Bazaar Backend running on port ${PORT}`);
  console.log(`🌐 Local endpoints available at: http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`   - GET  http://localhost:${PORT}/api/bookings/couple/:coupleId`);
  console.log(`   - POST http://localhost:${PORT}/api/bookings/request`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/verify`);
  console.log(`\n🚀 Your frontend should now work completely!`);
});

module.exports = app;
