const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// CRITICAL FIX 2025-10-10: Clean backend - Service CRUD endpoints working

// Real Neon database connection
const sql = neon(process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 3001;

// Test database connection
const testDatabaseConnection = async () => {
  try {
    await sql`SELECT 1 as test`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Middleware
app.use(helmet());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production' 
    ? ['https://weddingbazaar-web.web.app', 'https://yourdomain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ================================
// HEALTH CHECK ENDPOINTS
// ================================

app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testDatabaseConnection();
    res.json({
      status: 'OK',
      database: dbStatus ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString(),
      service: 'Wedding Bazaar Backend',
      version: '2.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.get('/api/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// ================================
// AUTHENTICATION ENDPOINTS
// ================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, user_type = 'individual' } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Check if user exists
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // For demo, store password as plain text (in production, use bcrypt)
    // Create user
    const result = await sql`
      INSERT INTO users (email, password, name, user_type, created_at)
      VALUES (${email}, ${password}, ${name}, ${user_type}, NOW())
      RETURNING id, email, name, user_type, created_at
    `;

    const user = result[0];
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, type: user.user_type },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.user_type
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];
    
    // For demo, accept any password (in production, use bcrypt.compare)
    // Simple password check for demo
    if (!password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, type: user.user_type },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.user_type
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    authenticated: true,
    user: req.user
  });
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
      count: vendors.length
    });
    
  } catch (error) {
    console.error('❌ [VENDORS] Error fetching featured vendors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured vendors',
      message: error.message
    });
  }
});

app.get('/api/vendors', async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    
    // Use simple query for now, can be enhanced later
    const vendors = await sql`
      SELECT * FROM vendors
      ORDER BY rating DESC 
      LIMIT 20
    `;
    
    res.json({
      success: true,
      vendors: vendors,
      count: vendors.length
    });
    
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendors',
      message: error.message
    });
  }
});

// ================================
// SERVICE ENDPOINTS - CRITICAL FOR SERVICE CREATION
// ================================

// GET all services
app.get('/api/services', async (req, res) => {
  try {
    console.log('🎯 [SERVICES] GET /api/services called');
    
    const services = await sql`
      SELECT 
        s.*,
        v.name as vendor_name,
        v.category as vendor_category
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.is_active = true
      ORDER BY s.created_at DESC
    `;
    
    console.log(`✅ [SERVICES] Found ${services.length} services`);
    
    res.json({
      success: true,
      services: services,
      count: services.length
    });
    
  } catch (error) {
    console.error('❌ [SERVICES] Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
      message: error.message
    });
  }
});

// GET services for a specific vendor
app.get('/api/services/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log(`🎯 [SERVICES] GET /api/services/vendor/${vendorId} called`);
    
    const services = await sql`
      SELECT * FROM services 
      WHERE vendor_id = ${vendorId} AND is_active = true
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ [SERVICES] Found ${services.length} services for vendor ${vendorId}`);
    
    res.json({
      success: true,
      services: services,
      count: services.length
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

// CREATE new service - CRITICAL ENDPOINT
app.post('/api/services', async (req, res) => {
  try {
    console.log('🎯 [SERVICES] POST /api/services called');
    console.log('📄 Request body:', req.body);
    
    const {
      vendor_id,
      name,
      title,
      category,
      description,
      price,
      is_active = true,
      isActive,
      featured = false,
      images = []
    } = req.body;
    
    const serviceName = name || title;
    const serviceActive = is_active !== undefined ? is_active : (isActive !== undefined ? isActive : true);
    const serviceVendorId = vendor_id;
    
    console.log('📋 [SERVICES] Parsed data:', {
      serviceName,
      serviceVendorId,
      category,
      serviceActive
    });
    
    if (!serviceVendorId || !serviceName || !category) {
      console.log('❌ [SERVICES] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Vendor ID, service name, and category are required'
      });
    }
    
    // Insert new service (Neon template literal syntax)
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
        ${featured},
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
    
    const {
      name,
      title,
      category,
      description,
      price,
      is_active,
      isActive,
      featured,
      images
    } = req.body;
    
    const serviceName = name || title;
    const serviceActive = is_active !== undefined ? is_active : (isActive !== undefined ? isActive : true);
    
    const result = await sql`
      UPDATE services 
      SET 
        name = ${serviceName},
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

// DELETE service
app.delete('/api/services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    console.log(`🎯 [SERVICES] DELETE /api/services/${serviceId} called`);
    
    // Check if service has bookings (soft delete if yes)
    const bookings = await sql`SELECT id FROM bookings WHERE service_id = ${serviceId}`;
    
    if (bookings.length > 0) {
      // Soft delete - mark as inactive
      const result = await sql`
        UPDATE services 
        SET 
          is_active = false,
          name = name || ' (Deleted)',
          updated_at = NOW()
        WHERE id = ${serviceId}
        RETURNING *
      `;
      
      res.json({
        success: true,
        service: result[0],
        message: 'Service deleted successfully (preserved due to existing bookings)',
        softDelete: true
      });
    } else {
      // Hard delete - no bookings
      const result = await sql`DELETE FROM services WHERE id = ${serviceId} RETURNING *`;
      
      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }
      
      res.json({
        success: true,
        service: result[0],
        message: 'Service deleted successfully',
        softDelete: false
      });
    }
    
  } catch (error) {
    console.error('❌ [SERVICES] Error deleting service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete service',
      message: error.message
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
    
    const {
      vendor_id,
      vendorId,
      service_id,
      serviceId,
      couple_id,
      coupleId,
      event_date,
      eventDate,
      location,
      notes,
      service_name,
      serviceName
    } = req.body;
    
    // Handle multiple field name formats
    const finalVendorId = vendor_id || vendorId;
    const finalServiceId = service_id || serviceId;
    const finalCoupleId = couple_id || coupleId || '1-2025-001';
    const finalEventDate = event_date || eventDate;
    const finalServiceName = service_name || serviceName;
    
    if (!finalVendorId || !finalEventDate) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID and event date are required'
      });
    }
    
    const result = await sql`
      INSERT INTO bookings (
        couple_id,
        vendor_id,
        service_id,
        service_name,
        event_date,
        location,
        notes,
        status,
        created_at
      ) VALUES (
        ${finalCoupleId},
        ${finalVendorId},
        ${finalServiceId},
        ${finalServiceName},
        ${finalEventDate},
        ${location || ''},
        ${notes || ''},
        'pending',
        NOW()
      )
      RETURNING *
    `;
    
    console.log('✅ [BOOKING] Booking request created successfully');
    
    res.json({
      success: true,
      booking: result[0],
      message: 'Booking request submitted successfully'
    });
    
  } catch (error) {
    console.error('❌ [BOOKING] Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      message: error.message
    });
  }
});

// ================================
// ERROR HANDLING & STARTUP
// ================================

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ [404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ [GLOBAL ERROR]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('🚀 [STARTUP] Wedding Bazaar Backend starting...');
    
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('❌ [STARTUP] Database connection failed - exiting');
      process.exit(1);
    }
    
    console.log('✅ [STARTUP] Database connected successfully');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ [STARTUP] Wedding Bazaar Backend running on port ${PORT}`);
      console.log(`🌐 [STARTUP] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 [STARTUP] CORS Origins: ${corsOrigins.join(', ')}`);
      console.log('📋 [STARTUP] Available endpoints:');
      console.log('   GET  /api/health');
      console.log('   GET  /api/ping');
      console.log('   POST /api/auth/register');
      console.log('   POST /api/auth/login');
      console.log('   POST /api/auth/verify');
      console.log('   GET  /api/vendors/featured');
      console.log('   GET  /api/vendors');
      console.log('   GET  /api/services');
      console.log('   GET  /api/services/vendor/:vendorId');
      console.log('   POST /api/services');
      console.log('   PUT  /api/services/:serviceId');
      console.log('   DELETE /api/services/:serviceId');
      console.log('   POST /api/bookings/request');
    });
    
  } catch (error) {
    console.error('❌ [STARTUP] Failed to start server:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGTERM', () => {
  console.log('📢 [SHUTDOWN] SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📢 [SHUTDOWN] SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
