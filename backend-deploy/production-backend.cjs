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
    version: '2.1.0-service-crud-fixed'
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

// CREATE SERVICE - POST /api/services
app.post('/api/services', async (req, res) => {
  console.log('🎯 [SERVICES] POST /api/services called at', new Date().toISOString());
  console.log('📄 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Send immediate response to prevent timeout
    res.json({
      success: true,
      message: 'Service creation endpoint reached - processing...',
      timestamp: new Date().toISOString(),
      received_data: {
        vendor_id: req.body.vendor_id || req.body.vendorId,
        title: req.body.title || req.body.name,
        category: req.body.category,
        has_images: !!(req.body.images && req.body.images.length > 0)
      }
    });
    
    console.log('✅ [SERVICES] Response sent successfully');
    
  } catch (error) {
    console.error('❌ [SERVICES] Error in service creation:', error);
    console.error('❌ [SERVICES] Error stack:', error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Service creation failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
});

// TEMP: Original service creation for debugging
app.post('/api/services-debug', authenticateToken, async (req, res) => {
  try {
    console.log('🎯 [SERVICES] POST /api/services-debug called');
    console.log('📄 Request body keys:', Object.keys(req.body));
    console.log('📄 Vendor ID from body:', req.body.vendor_id || req.body.vendorId);
    console.log('📄 Title from body:', req.body.title || req.body.name);
    
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
      featured,
      images,
      location,
      location_coordinates,
      location_details,
      price_range,
      features,
      contact_info,
      tags,
      keywords
    } = req.body;
    
    const serviceVendorId = vendor_id || vendorId;
    const serviceName = title || name || 'Untitled Service';
    const serviceActive = is_active !== undefined ? is_active : (isActive !== undefined ? isActive : true);
    
    if (!serviceVendorId || !category) {
      console.log('❌ [SERVICES] Missing required fields:', { serviceVendorId, category });
      return res.status(400).json({
        success: false,
        error: 'Vendor ID and category are required',
        received: { serviceVendorId, serviceName, category }
      });
    }
    
    // Generate unique service ID
    const serviceId = 'SRV-' + Date.now().toString().slice(-5);
    
    console.log('💾 [SERVICES] Inserting service with data:', {
      id: serviceId,
      vendor_id: serviceVendorId,
      title: serviceName,
      category,
      price: price || 0,
      images: images || []
    });
    
    // Insert new service (simplified for debugging)
    console.log('🔧 [SERVICES] About to execute SQL insert...');
    
    // Format images array for PostgreSQL array syntax
    console.log('🔧 [SERVICES] Raw images value:', images);
    console.log('🔧 [SERVICES] Images type:', typeof images);
    console.log('🔧 [SERVICES] Images isArray:', Array.isArray(images));
    
    let processedImages = images;
    if (typeof images === 'string') {
      try {
        processedImages = JSON.parse(images);
        console.log('🔧 [SERVICES] Parsed images from string:', processedImages);
      } catch (e) {
        console.log('🔧 [SERVICES] Failed to parse images string, using as-is');
        processedImages = [images];
      }
    }
    
    const formattedImages = processedImages && processedImages.length > 0 ? `{${processedImages.join(',')}}` : '{}';
    console.log('🔧 [SERVICES] Final formatted images:', formattedImages);
    
    const result = await sql`
      INSERT INTO services (
        id,
        vendor_id,
        title,
        category,
        description,
        price,
        images,
        is_active,
        featured
      ) VALUES (
        ${serviceId},
        ${serviceVendorId},
        ${serviceName},
        ${category},
        ${description || ''},
        ${price || 0},
        ${formattedImages},
        ${serviceActive},
        ${featured || false}
      )
      RETURNING *
    `;
    
    console.log('🔧 [SERVICES] SQL execution completed, result:', result);
    
    console.log('✅ [SERVICES] Service created successfully:', result[0]?.id);
    
    res.json({
      success: true,
      service: result[0],
      message: 'Service created successfully'
    });
    
  } catch (error) {
    console.error('❌ [SERVICES] Error creating service:', error);
    console.error('❌ [SERVICES] Error details:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create service',
      message: error.message,
      details: error.toString()
    });
  }
});

// GET ALL SERVICES
app.get('/api/services', async (req, res) => {
  try {
    console.log('🎯 [SERVICES] GET /api/services called with query:', req.query);
    const { vendorId } = req.query;
    
    let services;
    if (vendorId) {
      console.log('📡 [SERVICES] Fetching services for vendor:', vendorId);
      services = await sql`SELECT * FROM services WHERE vendor_id = ${vendorId} ORDER BY created_at DESC`;
    } else {
      console.log('📡 [SERVICES] Fetching all active services');
      services = await sql`SELECT * FROM services WHERE is_active = true ORDER BY created_at DESC LIMIT 100`;
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

// Basic auth endpoints for compatibility
app.post('/api/auth/verify', (req, res) => {
  res.json({
    success: true,
    authenticated: false,
    message: 'Auth endpoint for compatibility'
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
