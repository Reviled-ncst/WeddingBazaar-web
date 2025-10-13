const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Get services for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
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

// Get all services with optional filters
router.get('/', async (req, res) => {
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

// Create a new service
router.post('/', async (req, res) => {
  console.log('➕ Creating new service:', req.body);
  
  try {
    const { 
      vendor_id,
      vendorId, 
      title,
      name, 
      description, 
      category, 
      price, 
      images = [],
      is_active = true,
      featured = false
    } = req.body;
    
    // Use either vendor_id or vendorId
    const finalVendorId = vendor_id || vendorId;
    // Use either title or name
    const finalTitle = title || name;
    
    if (!finalVendorId || !finalTitle || !category) {
      return res.status(400).json({
        success: false,
        error: 'vendor_id, title, and category are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const serviceId = `SRV-${Date.now()}`;
    
    const service = await sql`
      INSERT INTO services (
        id, vendor_id, title, description, category, price, 
        images, is_active, featured, created_at, updated_at
      ) VALUES (
        ${serviceId}, ${finalVendorId}, ${finalTitle}, ${description}, ${category}, ${price || 0},
        ${JSON.stringify(images)}, ${is_active}, ${featured}, NOW(), NOW()
      ) RETURNING *
    `;
    
    console.log(`✅ Service created: ${serviceId}`);
    
    res.json({
      success: true,
      service: service[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Create service error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Update a service
router.put('/:serviceId', async (req, res) => {
  console.log('✏️ Updating service:', req.params.serviceId);
  
  try {
    const { serviceId } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const updateFields = [];
    const params = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
        timestamp: new Date().toISOString()
      });
    }
    
    updateFields.push(`updated_at = NOW()`);
    params.push(serviceId);
    
    const query = `UPDATE services SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const service = await sql(query, params);
    
    if (service.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ Service updated: ${serviceId}`);
    
    res.json({
      success: true,
      service: service[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Update service error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Delete a service
router.delete('/:serviceId', async (req, res) => {
  console.log('🗑️ Deleting service:', req.params.serviceId);
  
  try {
    const { serviceId } = req.params;
    
    const result = await sql`
      DELETE FROM services 
      WHERE id = ${serviceId}
      RETURNING id
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ Service deleted: ${serviceId}`);
    
    res.json({
      success: true,
      message: 'Service deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Delete service error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
