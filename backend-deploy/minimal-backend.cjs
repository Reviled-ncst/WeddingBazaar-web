const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://weddingbazaar-4171e.web.app',
    'https://weddingbazaar-web.web.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.1.1-minimal'
  });
});

// Simple auth middleware (allows all requests for now)
const authenticateToken = (req, res, next) => {
  next();
};

// CREATE SERVICE - POST /api/services (working version)
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
    
    // For now, skip vendor_id constraint and just create the service
    const serviceId = 'SRV-' + Date.now().toString().slice(-5);
    
    // Format images for PostgreSQL
    const formattedImages = images && images.length > 0 ? `{${images.join(',')}}` : '{}';
    
    // Insert without vendor_id constraint for testing
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

// GET services
app.get('/api/services', async (req, res) => {
  try {
    const services = await sql`SELECT * FROM services ORDER BY id DESC LIMIT 10`;
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

// Debug vendors
app.get('/api/debug/vendors', async (req, res) => {
  try {
    const vendors = await sql`SELECT id, name, category FROM vendors LIMIT 5`;
    res.json({
      success: true,
      count: vendors.length,
      vendors: vendors
    });
  } catch (error) {
    console.error('❌ [DEBUG] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Basic vendor endpoint
app.get('/api/vendors/featured', async (req, res) => {
  try {
    const vendors = await sql`SELECT id, name, category, rating FROM vendors WHERE featured = true LIMIT 5`;
    res.json({
      success: true,
      vendors: vendors
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Auth endpoints
app.post('/api/auth/verify', (req, res) => {
  res.json({
    success: true,
    authenticated: false
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal Wedding Bazaar Backend running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
});
