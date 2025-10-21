const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Get all services with optional filters - SIMPLIFIED VENDOR ENRICHMENT
router.get('/', async (req, res) => {
  console.log('🛠️ Getting services with basic vendor enrichment:', req.query);
  
  try {
    const { vendorId, category, limit = 50, offset = 0 } = req.query;
    
    // Step 1: Get services
    let servicesQuery = `SELECT * FROM services WHERE is_active = true`;
    let params = [];
    
    if (vendorId) {
      servicesQuery += ` AND vendor_id = $${params.length + 1}`;
      params.push(vendorId);
    }
    
    if (category) {
      servicesQuery += ` AND category = $${params.length + 1}`;
      params.push(category);
    }
    
    servicesQuery += ` ORDER BY featured DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    console.log('🔍 Services query:', servicesQuery);
    console.log('🔍 Query parameters:', params);
    
    const services = await sql(servicesQuery, params);
    
    console.log(`✅ Found ${services.length} services`);
    
    // Step 2: Get per-service review stats from reviews table
    if (services.length > 0) {
      const vendorIds = [...new Set(services.map(s => s.vendor_id))];
      const serviceIds = services.map(s => s.id);
      console.log('🏪 Getting vendor data for IDs:', vendorIds);
      console.log('⭐ Calculating per-service review stats for:', serviceIds.length, 'services');
      
      // Get all relevant vendors in one query
      const vendors = await sql`SELECT id, business_name FROM vendors WHERE id = ANY(${vendorIds})`;
      
      // Get per-service review stats
      const reviewStats = await sql`
        SELECT 
          service_id,
          COALESCE(ROUND(AVG(rating)::numeric, 2), 0) as rating,
          COALESCE(COUNT(id), 0) as review_count
        FROM reviews
        WHERE service_id = ANY(${serviceIds})
        GROUP BY service_id
      `;
      
      console.log(`✅ Found ${vendors.length} vendors`);
      console.log(`✅ Calculated review stats for ${reviewStats.length} services`);
      
      // Create vendor lookup map
      const vendorMap = {};
      vendors.forEach(vendor => {
        vendorMap[vendor.id] = vendor;
      });
      
      // Create review stats lookup map
      const reviewMap = {};
      reviewStats.forEach(stat => {
        reviewMap[stat.service_id] = {
          rating: parseFloat(stat.rating),
          review_count: parseInt(stat.review_count)
        };
      });
      
      // Enrich services with vendor data AND per-service review stats
      services.forEach(service => {
        const vendor = vendorMap[service.vendor_id];
        const reviews = reviewMap[service.id] || { rating: 0, review_count: 0 };
        
        if (vendor) {
          service.vendor_business_name = vendor.business_name;
        }
        
        // ✅ Per-service review stats (not vendor totals!)
        service.vendor_rating = reviews.rating;
        service.vendor_review_count = reviews.review_count;
      });
      
      console.log('🎯 Sample enriched service:', {
        id: services[0].id,
        title: services[0].title,
        vendor_id: services[0].vendor_id,
        vendor_business_name: services[0].vendor_business_name,
        vendor_rating: services[0].vendor_rating
      });
    }
    
    res.json({
      success: true,
      services: services,
      count: services.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Enhanced services error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

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

// Get single service by ID - PUBLIC ENDPOINT (no auth required)
router.get('/:id', async (req, res) => {
  console.log('🔍 Getting single service:', req.params.id);
  
  try {
    const { id } = req.params;
    
    // Get service details
    const services = await sql`
      SELECT * FROM services 
      WHERE id = ${id}
    `;
    
    if (services.length === 0) {
      console.log(`❌ Service not found: ${id}`);
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const service = services[0];
    console.log(`✅ Found service: ${service.title}`);
    
    // Enrich with vendor information
    if (service.vendor_id) {
      const vendors = await sql`
        SELECT id, business_name, category, location, phone, email, website, rating, total_reviews
        FROM vendors 
        WHERE id = ${service.vendor_id}
      `;
      
      if (vendors.length > 0) {
        service.vendor = {
          id: vendors[0].id,
          name: vendors[0].business_name,
          business_name: vendors[0].business_name,
          category: vendors[0].category,
          location: vendors[0].location,
          phone: vendors[0].phone,
          email: vendors[0].email,
          website: vendors[0].website,
          rating: vendors[0].rating,
          review_count: vendors[0].total_reviews
        };
        console.log(`✅ Enriched with vendor: ${service.vendor.name}`);
      }
    }
    
    // Get per-service review stats
    const reviewStats = await sql`
      SELECT 
        COALESCE(ROUND(AVG(rating)::numeric, 2), 0) as rating,
        COALESCE(COUNT(id), 0) as review_count
      FROM reviews
      WHERE service_id = ${id}
    `;
    
    if (reviewStats.length > 0) {
      service.rating = parseFloat(reviewStats[0].rating);
      service.review_count = parseInt(reviewStats[0].review_count);
      console.log(`✅ Service rating: ${service.rating} (${service.review_count} reviews)`);
    }
    
    res.json({
      success: true,
      service: service,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Service error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// CREATE SERVICE - POST /api/services
router.post('/', async (req, res) => {
  try {
    console.log('📤 [POST /api/services] Creating new service:', {
      vendor_id: req.body.vendor_id,
      title: req.body.title,
      category: req.body.category
    });

    const {
      vendor_id,
      vendorId, // Accept both field names for compatibility
      title,
      name, // Accept both field names for compatibility  
      description,
      category,
      price,
      location,
      images,
      features,
      is_active = true,
      featured = false,
      contact_info,
      tags,
      keywords,
      location_coordinates,
      location_details,
      price_range,
      // DSS Fields
      years_in_business,
      service_tier,
      wedding_styles,
      cultural_specialties,
      availability
    } = req.body;

    // Validate required fields
    if (!title && !name) {
      return res.status(400).json({
        success: false,
        error: 'Service title/name is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Service category is required'
      });
    }

    if (!vendor_id && !vendorId) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID is required'
      });
    }

    // Use vendor_id or fallback to vendorId
    const finalVendorId = vendor_id || vendorId;
    const finalTitle = title || name;

    // Generate service ID (format: SRV-XXXXX)
    const countResult = await sql`SELECT COUNT(*) as count FROM services`;
    const serviceCount = parseInt(countResult[0].count) + 1;
    const serviceId = `SRV-${serviceCount.toString().padStart(5, '0')}`;
    
    console.log('🆔 Generated service ID:', serviceId);
    console.log('💾 [POST /api/services] Inserting service data:', {
      id: serviceId,
      vendor_id: finalVendorId,
      title: finalTitle,
      category,
      price: price ? parseFloat(price) : null
    });

    // Insert into database with DSS fields
    const result = await sql`
      INSERT INTO services (
        id, vendor_id, title, description, category, price, location, images, 
        featured, is_active,
        years_in_business, service_tier, wedding_styles, cultural_specialties, availability,
        created_at, updated_at
      ) VALUES (
        ${serviceId},
        ${finalVendorId},
        ${finalTitle},
        ${description || ''},
        ${category},
        ${price ? parseFloat(price) : null},
        ${location || ''},
        ${Array.isArray(images) ? images : []},
        ${Boolean(featured)},
        ${Boolean(is_active)},
        ${years_in_business ? parseInt(years_in_business) : null},
        ${service_tier || null},
        ${Array.isArray(wedding_styles) ? wedding_styles : null},
        ${Array.isArray(cultural_specialties) ? cultural_specialties : null},
        ${availability || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    console.log('✅ [POST /api/services] Service created successfully:', result[0]);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: result[0]
    });

  } catch (error) {
    console.error('❌ [POST /api/services] Error creating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create service',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// UPDATE SERVICE - PUT /api/services/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 [PUT /api/services/:id] Updating service:', id);

    const {
      title,
      description,
      category,
      price,
      location,
      images,
      features,
      is_active,
      featured,
      // DSS Fields
      years_in_business,
      service_tier,
      wedding_styles,
      cultural_specialties,
      availability
    } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(price ? parseFloat(price) : null);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }
    if (images !== undefined) {
      updates.push(`images = $${paramCount++}`);
      values.push(Array.isArray(images) ? images : []);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(Boolean(is_active));
    }
    if (featured !== undefined) {
      updates.push(`featured = $${paramCount++}`);
      values.push(Boolean(featured));
    }
    // DSS Fields
    if (years_in_business !== undefined) {
      updates.push(`years_in_business = $${paramCount++}`);
      values.push(years_in_business ? parseInt(years_in_business) : null);
    }
    if (service_tier !== undefined) {
      updates.push(`service_tier = $${paramCount++}`);
      values.push(service_tier);
    }
    if (wedding_styles !== undefined) {
      updates.push(`wedding_styles = $${paramCount++}`);
      values.push(Array.isArray(wedding_styles) ? wedding_styles : null);
    }
    if (cultural_specialties !== undefined) {
      updates.push(`cultural_specialties = $${paramCount++}`);
      values.push(Array.isArray(cultural_specialties) ? cultural_specialties : null);
    }
    if (availability !== undefined) {
      updates.push(`availability = $${paramCount++}`);
      values.push(availability);
    }

    // Always update updated_at
    updates.push(`updated_at = NOW()`);

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Add service ID to values
    values.push(id);

    const query = `
      UPDATE services 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    console.log('💾 [PUT /api/services/:id] Update query:', query);
    console.log('💾 [PUT /api/services/:id] Values:', values);

    const result = await sql(query, values);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    console.log('✅ [PUT /api/services/:id] Service updated successfully:', result[0]);

    res.json({
      success: true,
      message: 'Service updated successfully',
      service: result[0]
    });

  } catch (error) {
    console.error('❌ [PUT /api/services/:id] Error updating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update service',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE SERVICE - DELETE /api/services/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ [DELETE /api/services/:id] Deleting service:', id);

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

    console.log('✅ [DELETE /api/services/:id] Service deleted successfully:', result[0]);

    res.json({
      success: true,
      message: 'Service deleted successfully',
      service: result[0]
    });

  } catch (error) {
    console.error('❌ [DELETE /api/services/:id] Error deleting service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete service',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

module.exports = router;
