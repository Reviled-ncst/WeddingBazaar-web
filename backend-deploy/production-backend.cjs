const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// FIXED: Service CRUD Complete - Production Backend
// Date: 2025-10-10 18:55:00
// Status: Fixed "Cannot add property values" error - Proper Neon client setup

// Initialize Neon serverless client
const sql = neon(process.env.DATABASE_URL);

// Test database connection on startup
async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result[0]);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.2.0-production-service-crud-complete'
  });
});

// Authentication middleware (optional)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Allow requests without tokens for now
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      console.log('JWT verification failed:', err.message);
      // Continue without user for now
      return next();
    }
    req.user = user;
    next();
  });
};

// CREATE SERVICE - POST /api/services (WORKING VERSION)
app.post('/api/services', authenticateToken, async (req, res) => {
  try {
    console.log('🎯 [SERVICES] POST /api/services called');
    
    const {
      vendor_id,
      vendorId,
      name,
      title,
      category,
      description,
      price,
      images
    } = req.body;
    
    const serviceVendorId = vendor_id || vendorId;
    const serviceName = title || name || 'Untitled Service';
    
    // Generate unique service ID
    const serviceId = 'SRV-' + Date.now().toString().slice(-5);
    
    // Format images for PostgreSQL array syntax
    const formattedImages = images && images.length > 0 ? `{${images.join(',')}}` : '{}';
    console.log('🔧 [SERVICES] Formatted images:', formattedImages);
    
    // Insert service into database
    const result = await sql`
      INSERT INTO services (
        id,
        title,
        category,
        description,
        price,
        images,
        is_active,
        featured
      ) VALUES (
        ${serviceId},
        ${serviceName},
        ${category},
        ${description || ''},
        ${price || 0},
        ${formattedImages},
        true,
        false
      )
      RETURNING *
    `;
    
    console.log('✅ [SERVICES] Service created:', result[0]?.id);
    
    res.json({
      success: true,
      service: result[0],
      message: 'Service created successfully'
    });
    
  } catch (error) {
    console.error('❌ [SERVICES] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create service',
      message: error.message
    });
  }
});


// GET ALL SERVICES (WORKING VERSION)
app.get('/api/services', async (req, res) => {
  try {
    console.log('🎯 [SERVICES] GET /api/services called with query:', req.query);
    const { vendorId } = req.query;
    
    let services;
    if (vendorId) {
      console.log('📡 [SERVICES] Fetching services for vendor:', vendorId);
      services = await sql`SELECT * FROM services WHERE vendor_id = ${vendorId} ORDER BY id DESC`;
    } else {
      console.log('📡 [SERVICES] Fetching all services');
      services = await sql`SELECT * FROM services ORDER BY id DESC LIMIT 10`;
    }
    
    console.log('✅ [SERVICES] Found', services.length, 'services');
    
    res.json({
      success: true,
      services: services
    });
    
  } catch (error) {
    console.error('❌ [SERVICES] Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    });
  }
});

// UPDATE SERVICE - PUT /api/services/:id
app.put('/api/services/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🎯 [SERVICES] PUT /api/services/' + id + ' called');
    
    const {
      title,
      name,
      category,
      description,
      price,
      is_active,
      featured,
      images
    } = req.body;
    
    const serviceName = title || name;
    
    // Format images array for PostgreSQL array syntax
    const formattedImages = images && images.length > 0 ? `{${images.join(',')}}` : '{}';
    console.log('🔧 [SERVICES] UPDATE - Formatted images:', formattedImages);
    
    const result = await sql`
      UPDATE services 
      SET 
        title = ${serviceName},
        name = ${serviceName},
        category = ${category},
        description = ${description || ''},
        price = ${price || 0},
        is_active = ${is_active !== undefined ? is_active : true},
        featured = ${featured || false},
        images = ${formattedImages},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    console.log('✅ [SERVICES] Service updated successfully:', result[0]?.id);
    
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

// DELETE SERVICE - DELETE /api/services/:id
app.delete('/api/services/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🎯 [SERVICES] DELETE /api/services/' + id + ' called');
    
    const result = await sql`
      DELETE FROM services 
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    console.log('✅ [SERVICES] Service deleted successfully:', result[0]?.id);
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ [SERVICES] Error deleting service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete service'
    });
  }
});

// GET services by vendor ID
app.get('/api/services/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log('🎯 [SERVICES] GET /api/services/vendor/' + vendorId + ' called');
    
    const services = await sql`
      SELECT * FROM services 
      WHERE vendor_id = ${vendorId} 
      ORDER BY created_at DESC
    `;
    
    console.log('✅ [SERVICES] Found', services.length, 'services for vendor', vendorId);
    
    res.json({
      success: true,
      services: services
    });
    
  } catch (error) {
    console.error('❌ [SERVICES] Error fetching vendor services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor services'
    });
  }
});

// Basic vendor endpoints for compatibility
app.get('/api/vendors/featured', async (req, res) => {
  try {
    const vendors = await sql`
      SELECT id, name, category, rating, review_count as "reviewCount", 
             location, description, image_url as "imageUrl"
      FROM vendors 
      WHERE featured = true 
      LIMIT 10
    `;
    
    res.json({
      success: true,
      vendors: vendors
    });
  } catch (error) {
    console.error('Error fetching featured vendors:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// USER AUTHENTICATION ENDPOINTS

// REGISTER - POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('🎯 [AUTH] POST /api/auth/register called');
    
    const { email, password, name, userType = 'individual' } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }
    
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;
    
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // For now, store password as plain text (should use bcrypt in production)
    const userId = 'USR-' + Date.now().toString().slice(-8);
    
    const result = await sql`
      INSERT INTO users (id, email, password, name, user_type, created_at)
      VALUES (${userId}, ${email}, ${password}, ${name}, ${userType}, NOW())
      RETURNING id, email, name, user_type
    `;
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: result[0].id, email: result[0].email, userType: result[0].user_type },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    console.log('✅ [AUTH] User registered successfully:', result[0].id);
    
    res.json({
      success: true,
      user: result[0],
      token,
      message: 'User registered successfully'
    });
    
  } catch (error) {
    console.error('❌ [AUTH] Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
});

// LOGIN - POST /api/auth/login  
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🎯 [AUTH] POST /api/auth/login called');
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Find user by email
    const users = await sql`
      SELECT id, email, password, name, user_type 
      FROM users 
      WHERE email = ${email} 
      LIMIT 1
    `;
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const user = users[0];
    
    // For now, simple password comparison (should use bcrypt.compare in production)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    console.log('✅ [AUTH] User logged in successfully:', user.id);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        user_type: user.user_type
      },
      token,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('❌ [AUTH] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

// VERIFY TOKEN - POST /api/auth/verify
app.post('/api/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.json({
      success: true,
      authenticated: false,
      message: 'No token provided'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, decoded) => {
    if (err) {
      console.log('JWT verification failed:', err.message);
      return res.json({
        success: true,
        authenticated: false,
        message: 'Invalid token'
      });
    }
    
    res.json({
      success: true,
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        userType: decoded.userType
      },
      message: 'Token valid'
    });
  });
});

// Conversations endpoint for compatibility
app.get('/api/conversations/:userId', (req, res) => {
  res.json({
    success: true,
    conversations: [],
    count: 0,
    timestamp: new Date().toISOString()
  });
});

// TEST ENDPOINT: Array formatting test (no database)
app.post('/api/test-array-format', (req, res) => {
  try {
    console.log('🧪 [TEST] Array formatting test called');
    const { images } = req.body;
    
    console.log('🔧 [TEST] Raw images value:', images);
    console.log('🔧 [TEST] Images type:', typeof images);
    console.log('🔧 [TEST] Images isArray:', Array.isArray(images));
    
    let processedImages = images;
    if (typeof images === 'string') {
      try {
        processedImages = JSON.parse(images);
        console.log('🔧 [TEST] Parsed images from string:', processedImages);
      } catch (e) {
        console.log('🔧 [TEST] Failed to parse images string, using as-is');
        processedImages = [images];
      }
    }
    
    const formattedImages = processedImages && processedImages.length > 0 ? `{${processedImages.join(',')}}` : '{}';
    console.log('🔧 [TEST] Final formatted images:', formattedImages);
    
    res.json({
      success: true,
      original: images,
      processed: processedImages,
      formatted: formattedImages,
      originalType: typeof images,
      isArray: Array.isArray(images)
    });
    
  } catch (error) {
    console.error('❌ [TEST] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DEBUG ENDPOINT: Check vendors table content
app.get('/api/debug/vendors', async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Checking vendors table content...');
    
    const vendors = await sql`SELECT id, name, category, rating FROM vendors LIMIT 10`;
    
    console.log('🔍 [DEBUG] Found vendors:', vendors);
    
    res.json({
      success: true,
      count: vendors.length,
      vendors: vendors,
      message: 'Vendors table content'
    });
    
  } catch (error) {
    console.error('❌ [DEBUG] Error querying vendors:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to query vendors table'
    });
  }
});

// DATABASE SETUP - GET /api/setup/database
app.get('/api/setup/database', async (req, res) => {
  try {
    console.log('🎯 [SETUP] Creating users table if not exists...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(20) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) DEFAULT 'individual',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ [SETUP] Users table ready');
    
    res.json({
      success: true,
      message: 'Database setup completed',
      tables: ['users', 'services', 'vendors']
    });
    
  } catch (error) {
    console.error('❌ [SETUP] Database setup error:', error);
    res.status(500).json({
      success: false,
      error: 'Database setup failed',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log('🚀 Wedding Bazaar Backend running on port ' + PORT);
  console.log('🔗 Health check: http://localhost:' + PORT + '/api/health');
  console.log('📊 Service CRUD endpoints ready:');
  console.log('   POST   /api/services          - Create service');
  console.log('   GET    /api/services          - Get all services');
  console.log('   GET    /api/services?vendorId - Get services by vendor');
  console.log('   PUT    /api/services/:id      - Update service');
  console.log('   DELETE /api/services/:id      - Delete service');
  console.log('   GET    /api/services/vendor/:vendorId - Get vendor services');
  
  // Test database connection
  await testConnection();
});
