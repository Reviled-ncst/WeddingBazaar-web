const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Get all services with optional filters - SIMPLIFIED VENDOR ENRICHMENT
router.get('/', async (req, res) => {
  console.log('🛠️ Getting services with basic vendor enrichment:', req.query);
  
  try {
    const { vendorId, category, limit = 50, offset = 0 } = req.query;
    
    // Step 1: Resolve vendor ID to handle UUID, legacy VEN-xxxxx, AND user ID formats
    let actualVendorIds = vendorId ? [vendorId] : null;
    
    if (vendorId) {
      console.log('🔍 Resolving vendor ID:', vendorId);
      
      // Look up vendor to get ALL possible IDs (UUID and user_id)
      let vendorCheck;
      try {
        vendorCheck = await sql`
          SELECT id, user_id
          FROM vendors 
          WHERE id = ${vendorId} OR user_id = ${vendorId}
          LIMIT 1
        `;
      } catch (err) {
        console.error('⚠️ Vendor check error:', err.message);
        vendorCheck = [];
      }
      
      if (vendorCheck.length > 0) {
        const vendor = vendorCheck[0];
        console.log('✅ Found vendor:', { 
          uuid: vendor.id, 
          user_id: vendor.user_id 
        });
        
        // Build array of ALL possible vendor IDs to check
        actualVendorIds = [vendor.id]; // Always include UUID
        
        if (vendor.user_id) {
          actualVendorIds.push(vendor.user_id);
        }
        
        // Try VEN-xxxxx format based on user_id
        if (vendor.user_id && vendor.user_id.startsWith('2-')) {
          const parts = vendor.user_id.split('-');
          if (parts.length === 3) {
            const legacyId = `VEN-${parts[2]}`;
            actualVendorIds.push(legacyId);
            console.log('✅ Added potential legacy ID:', legacyId);
          }
        }
        
        console.log('✅ Will check services for vendor IDs:', actualVendorIds);
      } else {
        console.log('⚠️ Vendor not found, will try direct match with:', vendorId);
      }
    }
    
    // Step 2: Get services - use parameterized query with vendor ID array
    let services;
    
    if (actualVendorIds) {
      // Filter by vendor IDs
      if (category) {
        services = await sql`
          SELECT * FROM services 
          WHERE is_active = true 
            AND vendor_id = ANY(${actualVendorIds})
            AND category = ${category}
          ORDER BY featured DESC, created_at DESC 
          LIMIT ${parseInt(limit)} 
          OFFSET ${parseInt(offset)}
        `;
      } else {
        services = await sql`
          SELECT * FROM services 
          WHERE is_active = true 
            AND vendor_id = ANY(${actualVendorIds})
          ORDER BY featured DESC, created_at DESC 
          LIMIT ${parseInt(limit)} 
          OFFSET ${parseInt(offset)}
        `;
      }
      console.log(`🔍 Queried services for vendor IDs: ${actualVendorIds.join(', ')}`);
    } else {
      // No vendor filter
      if (category) {
        services = await sql`
          SELECT * FROM services 
          WHERE is_active = true 
            AND category = ${category}
          ORDER BY featured DESC, created_at DESC 
          LIMIT ${parseInt(limit)} 
          OFFSET ${parseInt(offset)}
        `;
      } else {
        services = await sql`
          SELECT * FROM services 
          WHERE is_active = true 
          ORDER BY featured DESC, created_at DESC 
          LIMIT ${parseInt(limit)} 
          OFFSET ${parseInt(offset)}
        `;
      }
    }
    
    console.log(`✅ Found ${services.length} services`);
    
    console.log(`✅ Found ${services.length} services`);
    
    // Step 2: Get per-service review stats from reviews table
    if (services.length > 0) {
      const vendorIds = [...new Set(services.map(s => s.vendor_id))];
      const serviceIds = services.map(s => s.id);
      console.log('🏪 Getting vendor data for IDs:', vendorIds);
      console.log('⭐ Calculating per-service review stats for:', serviceIds.length, 'services');
      
      // Get all relevant vendors in one query WITH location data from vendor_profiles
      const vendors = await sql`
        SELECT 
          v.id, 
          v.business_name,
          vp.service_area
        FROM vendors v
        LEFT JOIN vendor_profiles vp ON v.id = vp.user_id
        WHERE v.id = ANY(${vendorIds})
      `;
      
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
          service.vendor_service_area = vendor.service_area; // ✅ Add location data
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
      vendor_id_requested: vendorId || null,
      vendor_ids_checked: actualVendorIds || null, // 🔍 Debug: Show all vendor IDs checked
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

// DEBUG ENDPOINT - Get service by ID via query parameter
router.get('/debug/service', async (req, res) => {
  const serviceId = req.query.id || 'SRV-0001';
  console.log('🐛 [DEBUG] Getting service:', serviceId);
  
  try {
    const services = await sql`SELECT * FROM services WHERE id = ${serviceId}`;
    console.log(`🐛 [DEBUG] Found ${services.length} services`);
    
    if (services.length === 0) {
      return res.json({
        success: false,
        message: 'Service not found',
        searchedId: serviceId
      });
    }
    
    const service = services[0];
    console.log(`🐛 [DEBUG] Service title: ${service.title}`);
    
    // Get vendor
    if (service.vendor_id) {
      const vendors = await sql`SELECT * FROM vendors WHERE id = ${service.vendor_id}`;
      console.log(`🐛 [DEBUG] Found ${vendors.length} vendors`);
      if (vendors.length > 0) {
        service.vendor = vendors[0];
      }
    }
    
    res.json({
      success: true,
      service: service,
      debug: {
        requestedId: serviceId,
        foundId: service.id,
        hasVendor: !!service.vendor
      }
    });
    
  } catch (error) {
    console.error('🐛 [DEBUG] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Get services for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
  console.log('🛠️ Getting services for vendor:', req.params.vendorId);
  
  try {
    const { vendorId } = req.params;
    
    // ✅ ENHANCED FIX: Handle UUID, legacy VEN-xxxxx, AND user ID formats
    let actualVendorIds = [vendorId]; // Start with what was sent
    
    console.log('🔍 Step 1: Checking vendor format for:', vendorId);
    
    // Step 1: Look up the vendor in vendors table to find ALL possible IDs
    // Try to get legacy_vendor_id if column exists, otherwise just id and user_id
    let vendorLookup;
    try {
      vendorLookup = await sql`
        SELECT id, user_id 
        FROM vendors 
        WHERE id = ${vendorId} OR user_id = ${vendorId}
        LIMIT 1
      `;
    } catch (err) {
      console.error('⚠️ Vendor lookup error:', err.message);
      vendorLookup = [];
    }
    
    if (vendorLookup.length > 0) {
      const vendor = vendorLookup[0];
      console.log('✅ Found vendor record:', {
        uuid: vendor.id,
        user_id: vendor.user_id
      });
      
      // Build list of ALL possible vendor IDs to check
      actualVendorIds = [vendor.id]; // Always include UUID
      
      // Also try common legacy formats
      if (vendor.user_id) {
        actualVendorIds.push(vendor.user_id);
        console.log('✅ Added user ID:', vendor.user_id);
      }
      
      // Try VEN-xxxxx format based on numeric part of user_id
      if (vendor.user_id && vendor.user_id.startsWith('2-')) {
        const parts = vendor.user_id.split('-');
        if (parts.length === 3) {
          const legacyId = `VEN-${parts[2]}`; // e.g., 2-2025-003 → VEN-00003
          actualVendorIds.push(legacyId);
          console.log('✅ Added potential legacy ID:', legacyId);
        }
      }
    } else {
      console.log('⚠️ No vendor found matching:', vendorId, '- will try direct match only');
    }
    
    console.log('🔍 Step 2: Querying services with vendor IDs:', actualVendorIds);
    
    // Step 2: Query services using ALL possible vendor IDs
    const services = await sql`
      SELECT * FROM services 
      WHERE vendor_id = ANY(${actualVendorIds})
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ Found ${services.length} services for vendor ${vendorId}`);
    console.log(`🔍 Checked vendor IDs: ${actualVendorIds.join(', ')}`);
    
    res.json({
      success: true,
      services: services,
      count: services.length,
      vendor_id_requested: vendorId,
      vendor_ids_checked: actualVendorIds,
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
  const serviceId = req.params.id;
  console.log('🔍 [PUBLIC ENDPOINT] Getting single service:', serviceId);
  console.log('🔍 Request URL:', req.originalUrl);
  console.log('🔍 Request method:', req.method);
  
  try {
    const { id } = req.params;
    
    console.log('📊 Executing SQL query for service:', id);
    
    // Get service details
    const services = await sql`
      SELECT * FROM services 
      WHERE id = ${id}
    `;
    
    console.log(`📊 Query returned ${services.length} results`);
    console.log(`📊 Query returned ${services.length} results`);
    
    if (services.length === 0) {
      console.log(`❌ Service not found in database: ${id}`);
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        searchedId: id,
        timestamp: new Date().toISOString()
      });
    }
    
    const service = services[0];
    console.log(`✅ Found service: ${service.title} (ID: ${service.id})`);
    console.log(`📊 Service vendor_id: ${service.vendor_id}`);
    console.log(`📊 Service vendor_id: ${service.vendor_id}`);
    
    // TEMP: Return immediately to test if vendor/review queries are causing the issue
    return res.json({
      success: true,
      service: service,
      _debug: 'Early return for testing',
      timestamp: new Date().toISOString()
    });
    
    // Enrich with vendor information
    if (service.vendor_id) {
      console.log(`🏪 Fetching vendor data for: ${service.vendor_id}`);
      const vendors = await sql`
        SELECT id, business_name, category, location, phone, email, website, rating, total_reviews
        FROM vendors 
        WHERE id = ${service.vendor_id}
      `;
      
      console.log(`🏪 Vendor query returned ${vendors.length} results`);
      
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
    console.error('❌ [PUBLIC ENDPOINT] Service error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      timestamp: new Date().toISOString()
    });
  }
});

// CREATE SERVICE - POST /api/services
router.post('/', async (req, res) => {
  try {
    console.log('📤 [POST /api/services] Creating new service');
    console.log('   Request body keys:', Object.keys(req.body));
    console.log('   vendor_id:', req.body.vendor_id);
    console.log('   vendorId:', req.body.vendorId);
    console.log('   title:', req.body.title);
    console.log('   category:', req.body.category);
    console.log('   service_tier:', req.body.service_tier);

    const {
      vendor_id,
      vendorId, // Accept both field names for compatibility
      title,
      name, // Accept both field names for compatibility  
      description,
      category,
      price,
      max_price, // ✅ FIX: Add max_price to destructuring
      location,
      location_data, // ✅ FIX: Add location_data to destructuring
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

    // ✅ SIMPLIFIED: Use user ID directly as vendor_id
    // No more VEN-XXXXX format - just use the user.id (2-2025-XXX)
    const actualVendorId = vendor_id || vendorId;
    const finalTitle = title || name;

    console.log('🔑 [Service Creation] Using vendor ID (user.id):', actualVendorId);

    // Basic validation: check if user exists and is a vendor
    try {
      const userCheck = await sql`
        SELECT id, user_type FROM users WHERE id = ${actualVendorId} LIMIT 1
      `;
      
      if (userCheck.length === 0) {
        console.log(`❌ [Vendor Check] User not found: ${actualVendorId}`);
        return res.status(400).json({
          success: false,
          error: 'User not found',
          message: 'Please ensure you are logged in',
          vendor_id_sent: actualVendorId
        });
      }
      
      if (userCheck[0].user_type !== 'vendor') {
        console.log(`❌ [Vendor Check] User is not a vendor: ${actualVendorId}, type: ${userCheck[0].user_type}`);
        return res.status(403).json({
          success: false,
          error: 'Not authorized',
          message: 'Only vendors can create services',
          user_type: userCheck[0].user_type
        });
      }
      
      console.log(`✅ [Vendor Check] User is valid vendor: ${actualVendorId}`);
    } catch (vendorError) {
      console.error('❌ [Vendor Check] Error checking user:', vendorError);
      return res.status(500).json({
        success: false,
        error: 'Error validating user',
        message: vendorError.message
      });
    }

    // ⚠️ DOCUMENT VERIFICATION CHECK - TEMPORARILY DISABLED
    // TODO: Create documents table and re-enable this check
    console.log('⚠️  [Document Check] SKIPPED - documents table does not exist yet');
    
    // DISABLED: Document check requires documents table
    // try {
    //   const vendorProfile = await sql`...`;
    //   const approvedDocs = await sql`SELECT * FROM documents...`;
    //   // ... verification logic ...
    // } catch (docError) {
    //   return res.status(500).json({ error: docError.message });
    // }

    // ✅ SUBSCRIPTION LIMIT CHECK - Check if vendor can create more services
    console.log('🔍 [Subscription Check] Checking service limits for vendor:', actualVendorId);
    
    try {
      // 1. Count vendor's current active services
      const vendorServiceCount = await sql`
        SELECT COUNT(*) as count 
        FROM services 
        WHERE vendor_id = ${actualVendorId} 
        AND is_active = true
      `;
      const currentCount = parseInt(vendorServiceCount[0].count);
      console.log(`📊 [Subscription Check] Current services: ${currentCount}`);
      
      // 2. Get vendor's subscription plan and limits
      const { neon } = require('@neondatabase/serverless');
      const subSql = neon(process.env.DATABASE_URL);
      
      const subscription = await subSql`
        SELECT 
          vs.plan_name,
          vs.status
        FROM vendor_subscriptions vs
        WHERE vs.vendor_id = ${actualVendorId}
        AND vs.status IN ('active', 'trial')
        ORDER BY vs.created_at DESC
        LIMIT 1
      `;
      
      // Default to basic plan if no subscription found
      const planName = subscription.length > 0 ? subscription[0].plan_name : 'basic';
      console.log(`📋 [Subscription Check] Plan: ${planName}`);
      
      // Define plan limits (matching subscription system)
      const planLimits = {
        basic: { max_services: 5, price_display: 'Free' },
        premium: { max_services: -1, price_display: '₱999/month' },
        pro: { max_services: -1, price_display: '₱1,999/month' },
        enterprise: { max_services: -1, price_display: '₱4,999/month' }
      };
      
      const maxServices = planLimits[planName]?.max_services || 5;
      
      // 3. Enforce limit (if not unlimited)
      if (maxServices !== -1 && currentCount >= maxServices) {
        console.log(`❌ [Subscription Check] Service limit reached: ${currentCount}/${maxServices}`);
        return res.status(403).json({
          success: false,
          error: 'Service limit reached',
          message: `You have reached your ${planName} plan limit of ${maxServices} services. Please upgrade to add more services.`,
          current_count: currentCount,
          limit: maxServices,
          upgrade_required: true,
          current_plan: planName,
          available_plans: planName === 'basic' ? ['premium', 'pro', 'enterprise'] : ['pro', 'enterprise'],
          recommended_plan: planName === 'basic' ? 'premium' : 'pro',
          upgrade_benefits: planName === 'basic' 
            ? 'Unlimited services, 50 portfolio images, priority support, featured listings'
            : 'Unlimited everything, custom branding, API access, advanced analytics'
        });
      }
      
      console.log(`✅ [Subscription Check] Service creation allowed: ${currentCount + 1}/${maxServices === -1 ? '∞' : maxServices}`);
      
    } catch (subError) {
      console.warn('⚠️  [Subscription Check] Could not verify limits:', subError.message);
      // Continue with creation if subscription check fails (graceful degradation)
      // This ensures service creation still works if subscription system has issues
    }

    // Generate service ID (format: SRV-XXXXX)
    const countResult = await sql`SELECT COUNT(*) as count FROM services`;
    const serviceCount = parseInt(countResult[0].count) + 1;
    const serviceId = `SRV-${serviceCount.toString().padStart(5, '0')}`;
    
    console.log('🆔 Generated service ID:', serviceId);
    console.log('💾 [POST /api/services] Inserting service data:', {
      id: serviceId,
      vendor_id: actualVendorId, // Use the resolved vendor ID
      title: finalTitle,
      category,
      price: price ? parseFloat(price) : null
    });

    // Normalize service_tier to lowercase (constraint requires 'basic', 'standard', 'premium')
    const normalizedServiceTier = service_tier ? service_tier.toLowerCase() : null;
    
    // ✅ COMPLETE FIX: Insert ALL fields that frontend sends (no data loss)
    const result = await sql`
      INSERT INTO services (
        id, vendor_id, title, description, category, 
        price, price_range, max_price, 
        location, location_data, location_coordinates, location_details,
        images, features,
        featured, is_active,
        contact_info, tags, keywords,
        years_in_business, service_tier, wedding_styles, cultural_specialties, availability,
        created_at, updated_at
      ) VALUES (
        ${serviceId},
        ${actualVendorId},
        ${finalTitle},
        ${description || ''},
        ${category},
        ${price ? parseFloat(price) : null},
        ${price_range || null},
        ${max_price ? parseFloat(max_price) : null},
        ${location || ''},
        ${location_data || null},
        ${location_coordinates || null},
        ${location_details || null},
        ${Array.isArray(images) ? images : []},
        ${Array.isArray(features) ? features : []},
        ${Boolean(featured)},
        ${Boolean(is_active)},
        ${contact_info || null},
        ${Array.isArray(tags) ? tags : null},
        ${keywords || null},
        ${years_in_business ? parseInt(years_in_business) : null},
        ${normalizedServiceTier},
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
    
    // Provide helpful error messages for common issues
    let userMessage = 'Failed to create service';
    let statusCode = 500;
    
    if (error.code === '23503') {
      // Foreign key violation
      if (error.constraint === 'services_vendor_id_fkey') {
        userMessage = 'Vendor ID does not exist. Please ensure you are logged in as a vendor.';
        statusCode = 400;
      }
    } else if (error.code === '23514') {
      // Check constraint violation
      if (error.constraint === 'services_service_tier_check') {
        userMessage = 'Invalid service tier. Must be one of: basic, standard, premium';
        statusCode = 400;
      }
    }
    
    res.status(statusCode).json({
      success: false,
      error: userMessage,
      message: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
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
      price_range,
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
    if (price_range !== undefined) {
      updates.push(`price_range = $${paramCount++}`);
      values.push(price_range);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }
    if (images !== undefined) {
      updates.push(`images = $${paramCount++}`);
      values.push(Array.isArray(images) ? images : []);
    }
    if (features !== undefined) {
      updates.push(`features = $${paramCount++}`);
      values.push(Array.isArray(features) ? features : []);
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

// GET CATEGORIES - GET /api/services/categories
router.get('/categories', async (req, res) => {
  console.log('📋 [GET /api/services/categories] Fetching service categories');
  
  try {
    const categories = await sql`
      SELECT 
        id,
        name,
        display_name,
        description,
        icon,
        sort_order,
        is_active
      FROM service_categories
      WHERE is_active = true
      ORDER BY sort_order ASC
    `;

    console.log(`✅ [GET /api/services/categories] Found ${categories.length} categories`);

    res.json({
      success: true,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        displayName: cat.display_name,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sort_order
      })),
      count: categories.length
    });

  } catch (error) {
    console.error('❌ [GET /api/services/categories] Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

module.exports = router;
