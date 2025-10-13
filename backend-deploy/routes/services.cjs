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
  console.log('🔍 Images field details:', {
    images: req.body.images,
    type: typeof req.body.images,
    isArray: Array.isArray(req.body.images),
    length: req.body.images?.length
  });
  
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
      featured = false,
      location,
      price_range
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
    
    // Generate proper sequential service ID
    const { getNextServiceId } = require('../utils/id-generation.cjs');
    const serviceId = await getNextServiceId(sql);
    
    // Handle images array properly - PostgreSQL text[] expects array, not JSON string
    let processedImages;
    if (typeof images === 'string') {
      try {
        // If images is a JSON string, parse it back to array
        processedImages = JSON.parse(images);
      } catch (e) {
        // If parsing fails, treat as empty array
        processedImages = [];
      }
    } else if (Array.isArray(images)) {
      // If images is already an array, use it directly
      processedImages = images;
    } else {
      // Default to empty array
      processedImages = [];
    }
    
    console.log('🖼️ Processing images:', { 
      original: images, 
      type: typeof images, 
      processed: processedImages,
      processedType: typeof processedImages,
      isArray: Array.isArray(processedImages)
    });

    const service = await sql`
      INSERT INTO services (
        id, vendor_id, title, description, category, price, 
        images, is_active, featured, location, price_range, created_at, updated_at
      ) VALUES (
        ${serviceId}, ${finalVendorId}, ${finalTitle}, ${description}, ${category}, ${price || 0},
        ${processedImages}, ${is_active}, ${featured}, 
        ${location || 'Philippines'}, ${price_range || '₱'}, NOW(), NOW()
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
    
    // Handle images field specially for JSON
    if (updates.images) {
      let processedImages;
      if (typeof updates.images === 'string') {
        try {
          processedImages = JSON.parse(updates.images);
        } catch (e) {
          processedImages = [];
        }
      } else if (Array.isArray(updates.images)) {
        processedImages = updates.images;
      } else {
        processedImages = [];
      }
      updates.images = processedImages;
    }
    
    // Build the update using SQL template literals for proper JSON handling
    const setFields = [];
    const values = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && value !== undefined) {
        setFields.push(key);
        values[key] = value;
      }
    }
    
    if (setFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
        timestamp: new Date().toISOString()
      });
    }

    // Use SQL template literals for proper type handling
    const service = await sql`
      UPDATE services SET 
        ${sql(values, ...setFields)},
        updated_at = NOW()
      WHERE id = ${serviceId}
      RETURNING *
    `;
    
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
