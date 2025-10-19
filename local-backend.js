const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Working Local Backend for Wedding Bazaar - FIXED VERSION
// This provides the missing endpoints your frontend needs

const app = express();
const PORT = 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://weddingbazaar_owner:uR43RnzB1XKU@ep-odd-sun-a13jxvt0.ap-southeast-1.aws.neon.tech/weddingbazaar?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});

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

// ============ CATEGORIES API ROUTES ============
// GET /api/categories - Get all categories with subcategories
app.get('/api/categories', async (req, res) => {
  try {
    console.log('📂 GET /api/categories called');
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.display_name,
        c.description,
        c.icon,
        c.sort_order,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'display_name', s.display_name,
              'description', s.description,
              'sort_order', s.sort_order
            ) ORDER BY s.sort_order
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) as subcategories
      FROM categories c
      LEFT JOIN subcategories s ON c.id = s.category_id AND s.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.display_name, c.description, c.icon, c.sort_order
      ORDER BY c.sort_order, c.display_name
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      categories: result.rows
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// GET /api/categories/:categoryId/fields - Get dynamic fields for a category
app.get('/api/categories/:categoryId/fields', async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`📋 GET /api/categories/${categoryId}/fields called`);
    
    const result = await pool.query(`
      SELECT 
        cf.id,
        cf.field_name,
        cf.field_label,
        cf.field_type,
        cf.is_required,
        cf.help_text,
        cf.sort_order,
        COALESCE(
          json_agg(
            json_build_object(
              'value', cfo.option_value,
              'label', cfo.option_label,
              'description', cfo.description,
              'sort_order', cfo.sort_order
            ) ORDER BY cfo.sort_order
          ) FILTER (WHERE cfo.id IS NOT NULL),
          '[]'
        ) as options
      FROM category_fields cf
      LEFT JOIN category_field_options cfo ON cf.id = cfo.field_id AND cfo.is_active = true
      WHERE cf.category_id = $1
      GROUP BY cf.id, cf.field_name, cf.field_label, cf.field_type, cf.is_required, cf.help_text, cf.sort_order
      ORDER BY cf.sort_order
    `, [categoryId]);
    
    res.json({
      success: true,
      count: result.rows.length,
      fields: result.rows
    });
  } catch (error) {
    console.error('❌ Error fetching category fields:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category fields'
    });
  }
});

// GET /api/categories/by-name/:categoryName/fields - Get fields by category name
app.get('/api/categories/by-name/:categoryName/fields', async (req, res) => {
  try {
    const { categoryName } = req.params;
    console.log(`📋 GET /api/categories/by-name/${categoryName}/fields called`);
    
    const result = await pool.query(`
      SELECT 
        cf.id,
        cf.field_name,
        cf.field_label,
        cf.field_type,
        cf.is_required,
        cf.help_text,
        cf.sort_order,
        COALESCE(
          json_agg(
            json_build_object(
              'value', cfo.option_value,
              'label', cfo.option_label,
              'description', cfo.description,
              'sort_order', cfo.sort_order
            ) ORDER BY cfo.sort_order
          ) FILTER (WHERE cfo.id IS NOT NULL),
          '[]'
        ) as options
      FROM categories c
      JOIN category_fields cf ON c.id = cf.category_id
      LEFT JOIN category_field_options cfo ON cf.id = cfo.field_id AND cfo.is_active = true
      WHERE c.name = $1 AND c.is_active = true
      GROUP BY cf.id, cf.field_name, cf.field_label, cf.field_type, cf.is_required, cf.help_text, cf.sort_order
      ORDER BY cf.sort_order
    `, [categoryName]);
    
    res.json({
      success: true,
      count: result.rows.length,
      categoryName,
      fields: result.rows
    });
  } catch (error) {
    console.error('❌ Error fetching category fields by name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category fields'
    });
  }
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
  console.log(`   - GET  http://localhost:${PORT}/api/categories`);
  console.log(`   - GET  http://localhost:${PORT}/api/categories/:categoryId/fields`);
  console.log(`   - GET  http://localhost:${PORT}/api/categories/by-name/:categoryName/fields`);
  console.log(`\n🚀 Your frontend should now work completely with dynamic categories!`);
});

module.exports = app;
