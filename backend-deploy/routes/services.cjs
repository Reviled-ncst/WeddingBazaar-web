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
        ${location || 'Philippines'}, ${price_range || '₱10,000 - ₱25,000'}, NOW(), NOW()
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
    
    // Only include fields that actually exist in the database schema
    // Based on schema check: id, vendor_id, title, description, category, price, images, featured, is_active, created_at, updated_at, name, location, price_range
    const allowedFields = [
      'title', 
      'description', 
      'category', 
      'price', 
      'images', 
      'featured', 
      'is_active', 
      'location', 
      'price_range'
    ];
    
    const setFields = [];
    const values = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && value !== undefined) {
        if (allowedFields.includes(key)) {
          setFields.push(key);
          values[key] = value;
          console.log(`✅ Including field: ${key} = ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        } else {
          console.log(`⚠️  Skipping field '${key}' - not in database schema (value: ${typeof value === 'object' ? JSON.stringify(value) : value})`);
        }
      }
    }
    
    if (setFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
        allowedFields: allowedFields,
        receivedFields: Object.keys(updates),
        skippedFields: Object.keys(updates).filter(key => !allowedFields.includes(key) && key !== 'id'),
        timestamp: new Date().toISOString()
      });
    }

    // Build dynamic update query to handle multiple fields at once
    const updateParts = [];
    const updateValues = [];
    let paramIndex = 1;
    
    // Handle each field dynamically
    setFields.forEach(field => {
      if (field === 'images') {
        // Handle images array specially
        updateParts.push(`${field} = $${paramIndex}`);
        updateValues.push(values[field]);
      } else {
        // Handle regular fields
        updateParts.push(`${field} = $${paramIndex}`);
        updateValues.push(values[field]);
      }
      paramIndex++;
    });
    
    // Add updated_at
    updateParts.push(`updated_at = NOW()`);
    
    // Build the final query
    const updateQuery = `
      UPDATE services SET 
        ${updateParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    // Add serviceId as the last parameter
    updateValues.push(serviceId);
    
    console.log('🔍 [Service Update] Query:', updateQuery);
    console.log('🔍 [Service Update] Values:', updateValues);
    
    const service = await sql(updateQuery, updateValues);
    
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
    console.error('❌ Full error object:');
    console.dir(error, { depth: null });
    console.error('❌ Error properties:', {
      name: error.name,
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      table: error.table,
      column: error.column,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: error.message || String(error),
      errorCode: error.code,
      errorDetail: error.detail,
      errorConstraint: error.constraint,
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
    console.error('❌ Full error object:');
    console.dir(error, { depth: null });
    console.error('❌ Error properties:', {
      name: error.name,
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      table: error.table,
      column: error.column,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: error.message || String(error),
      errorCode: error.code,
      errorDetail: error.detail,
      errorConstraint: error.constraint,
      timestamp: new Date().toISOString()
    });
  }
});

// Get single service by ID with vendor information
router.get('/:serviceId', async (req, res) => {
  console.log('🛠️ Getting service by ID:', req.params.serviceId);
  
  try {
    const { serviceId } = req.params;
    
    // Get service with vendor information
    const result = await sql`
      SELECT 
        s.*,
        v.id as vendor_id,
        v.name as vendor_name,
        v.business_name as vendor_business_name,
        v.category as vendor_category,
        v.rating as vendor_rating,
        v.review_count as vendor_review_count,
        v.location as vendor_location,
        v.phone as vendor_phone,
        v.email as vendor_email,
        v.website as vendor_website
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.id = ${serviceId}
    `;
    
    if (result.length === 0) {
      console.log(`❌ Service not found: ${serviceId}`);
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const service = result[0];
    
    // Structure the response with vendor information
    const serviceData = {
      id: service.id,
      vendor_id: service.vendor_id,
      title: service.title,
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      images: service.images || [],
      featured: service.featured,
      is_active: service.is_active,
      created_at: service.created_at,
      updated_at: service.updated_at,
      vendor: service.vendor_name ? {
        id: service.vendor_id,
        name: service.vendor_name,
        business_name: service.vendor_business_name,
        category: service.vendor_category,
        rating: service.vendor_rating,
        review_count: service.vendor_review_count,
        location: service.vendor_location,
        phone: service.vendor_phone,
        email: service.vendor_email,
        website: service.vendor_website
      } : null
    };
    
    console.log(`✅ Found service: ${service.title} by ${service.vendor_name || 'Unknown vendor'}`);
    
    res.json({
      success: true,
      service: serviceData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Get service error:', error);
    console.error('❌ Full error object:');
    console.dir(error, { depth: null });
    
    res.status(500).json({
      success: false,
      error: error.message || String(error),
      errorCode: error.code,
      errorDetail: error.detail,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
