const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// FIXED: Service CRUD Complete - Backend Deployment
// Date: 2025-10-10
// Fix: Complete service POST endpoint with proper field mapping

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.1.0-service-crud'
  });
});

// FIXED: SERVICE ENDPOINTS
// CREATE SERVICE - POST /api/services
app.post('/api/services', async (req, res) => {
  try {
    console.log('🎯 [SERVICES] POST /api/services called');
    console.log('📄 Request body keys:', Object.keys(req.body));
    
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
    const serviceId = `SRV-${Date.now().toString().slice(-5)}`;
    
    console.log('💾 [SERVICES] Inserting service with data:', {
      id: serviceId,
      vendor_id: serviceVendorId,
      title: serviceName,
      category,
      price: price || 0,
      images: images || []
    });
    
    // Insert new service
    const result = await sql`
      INSERT INTO services (
        id,
        vendor_id,
        title,
        name,
        category,
        description,
        price,
        images,
        is_active,
        featured,
        created_at,
        updated_at
      ) VALUES (
        ${serviceId},
        ${serviceVendorId},
        ${serviceName},
        ${serviceName},
        ${category},
        ${description || ''},
        ${price || 0},
        ${JSON.stringify(images || [])},
        ${serviceActive},
        ${featured || false},
        NOW(),
        NOW()
      )
      RETURNING *
    `;
    
    console.log('✅ [SERVICES] Service created successfully:', result[0]?.id);
    
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

// GET ALL SERVICES
app.get('/api/services', async (req, res) => {
  try {
    const { vendorId } = req.query;
    
    let query;
    if (vendorId) {
      query = sql`SELECT * FROM services WHERE vendor_id = ${vendorId} AND is_active = true ORDER BY created_at DESC`;
    } else {
      query = sql`SELECT * FROM services WHERE is_active = true ORDER BY created_at DESC LIMIT 100`;
    }
    
    const services = await query;
    
    res.json({
      success: true,
      services: services
    });
    
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    });
  }
});

// UPDATE SERVICE - PUT /api/services/:id
app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
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
    
    const result = await sql\`
      UPDATE services 
      SET 
        title = \${serviceName},
        name = \${serviceName},
        category = \${category},
        description = \${description || ''},
        price = \${price || 0},
        is_active = \${is_active !== undefined ? is_active : true},
        featured = \${featured || false},
        images = \${JSON.stringify(images || [])},
        updated_at = NOW()
      WHERE id = \${id}
      RETURNING *
    \`;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      service: result[0],
      message: 'Service updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update service'
    });
  }
});

// DELETE SERVICE - DELETE /api/services/:id
app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await sql\`
      DELETE FROM services 
      WHERE id = \${id}
      RETURNING *
    \`;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting service:', error);
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
    
    const services = await sql\`
      SELECT * FROM services 
      WHERE vendor_id = \${vendorId} 
      ORDER BY created_at DESC
    \`;
    
    res.json({
      success: true,
      services: services
    });
    
  } catch (error) {
    console.error('Error fetching vendor services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor services'
    });
  }
});

// Basic vendor endpoints for compatibility
app.get('/api/vendors/featured', async (req, res) => {
  try {
    const vendors = await sql\`
      SELECT id, name, category, rating, review_count as "reviewCount", 
             location, description, image_url as "imageUrl"
      FROM vendors 
      WHERE featured = true 
      LIMIT 10
    \`;
    
    res.json({
      success: true,
      vendors: vendors
    });
  } catch (error) {
    console.error('Error fetching featured vendors:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Wedding Bazaar Backend running on port \${PORT}\`);
  console.log(\`🔗 Health check: http://localhost:\${PORT}/api/health\`);
  console.log(\`📊 Service endpoints ready for CRUD operations\`);
});
