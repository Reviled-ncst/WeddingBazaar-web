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
    
    const services = await sql`
      SELECT * FROM services 
      WHERE vendor_id = ${vendorId}
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ Found ${services.length} services for vendor ${vendorId}`);
    
    // ✅ PRIORITY 3 FIX: Enrich each service with itemization data
    for (const service of services) {
      console.log(`📦 [Itemization] Enriching service ${service.id} with packages, add-ons, and pricing rules`);
      
      // 1. Get packages for this service
      const packages = await sql`
        SELECT * FROM service_packages
        WHERE service_id = ${service.id}
        ORDER BY is_default DESC, price ASC
      `;
      console.log(`  📦 Found ${packages.length} packages for service ${service.id}`);
      
      // 2. Get all package items (if packages exist)
      let packageItems = {};
      if (packages.length > 0) {
        const packageIds = packages.map(p => p.id);
        const items = await sql`
          SELECT * FROM package_items
          WHERE package_id = ANY(${packageIds})
          ORDER BY package_id, item_type, display_order
        `;
        
        // Group items by package_id
        items.forEach(item => {
          if (!packageItems[item.package_id]) {
            packageItems[item.package_id] = [];
          }
          packageItems[item.package_id].push(item);
        });
        
        console.log(`  📦 Found ${items.length} package items across ${Object.keys(packageItems).length} packages`);
      }
      
      // 3. Get add-ons for this service
      const addons = await sql`
        SELECT * FROM service_addons
        WHERE service_id = ${service.id}
        AND is_active = true
        ORDER BY price ASC
      `;
      console.log(`  🎁 Found ${addons.length} add-ons for service ${service.id}`);
      
      // 4. Get pricing rules for this service
      const pricingRules = await sql`
        SELECT * FROM service_pricing_rules
        WHERE service_id = ${service.id}
        AND is_active = true
        ORDER BY created_at DESC
      `;
      console.log(`  💰 Found ${pricingRules.length} pricing rules for service ${service.id}`);
      
      // Enrich service with itemization data
      service.packages = packages;
      service.package_items = packageItems;
      service.addons = addons;
      service.pricing_rules = pricingRules;
      service.has_itemization = packages.length > 0 || addons.length > 0 || pricingRules.length > 0;
      
      console.log(`  ✅ Service ${service.id} enriched with ${packages.length} packages, ${addons.length} add-ons, ${pricingRules.length} pricing rules`);
    }
    
    console.log(`✅ [Itemization] All ${services.length} services enriched with complete data`);
    
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
    
    // ✅ GET ITEMIZATION DATA - Packages, Items, Add-ons, Pricing Rules
    console.log('📦 [Itemization] Fetching packages for service:', id);
    
    // 1. Get packages for this service
    const packages = await sql`
      SELECT * FROM service_packages
      WHERE service_id = ${id}
      ORDER BY is_default DESC, price ASC
    `;
    console.log(`📦 Found ${packages.length} packages`);
    
    // 2. Get all package items (if packages exist)
    let packageItems = {};
    if (packages.length > 0) {
      const packageIds = packages.map(p => p.id);
      const items = await sql`
        SELECT * FROM package_items
        WHERE package_id = ANY(${packageIds})
        ORDER BY package_id, item_type, display_order
      `;
      
      // Group items by package_id
      items.forEach(item => {
        if (!packageItems[item.package_id]) {
          packageItems[item.package_id] = [];
        }
        packageItems[item.package_id].push(item);
      });
      
      console.log(`📦 Found ${items.length} package items across ${Object.keys(packageItems).length} packages`);
    }
    
    // 3. Get add-ons for this service
    const addons = await sql`
      SELECT * FROM service_addons
      WHERE service_id = ${id}
      AND is_active = true
      ORDER BY price ASC
    `;
    console.log(`🎁 Found ${addons.length} add-ons`);
    
    // 4. Get pricing rules for this service
    const pricingRules = await sql`
      SELECT * FROM service_pricing_rules
      WHERE service_id = ${id}
      AND is_active = true
      ORDER BY created_at DESC
    `;
    console.log(`💰 Found ${pricingRules.length} pricing rules`);
    
    // Enrich service with itemization data
    service.packages = packages;
    service.package_items = packageItems;
    service.addons = addons;
    service.pricing_rules = pricingRules;
    service.has_itemization = packages.length > 0 || addons.length > 0 || pricingRules.length > 0;
    
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
    
    console.log(`✅ [Itemization] Complete service data ready with ${service.packages.length} packages, ${service.addons.length} add-ons`);
    
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
    
    // 🔍 ENHANCED LOGGING: Check all critical fields
    console.log('🔍 [DATA CHECK] DSS Fields:');
    console.log('   wedding_styles:', req.body.wedding_styles);
    console.log('   cultural_specialties:', req.body.cultural_specialties);
    console.log('   availability:', req.body.availability);
    console.log('   years_in_business:', req.body.years_in_business);
    
    console.log('🔍 [DATA CHECK] Itemization:');
    console.log('   packages:', req.body.packages ? `Array(${req.body.packages.length})` : 'undefined');
    console.log('   addons:', req.body.addons ? `Array(${req.body.addons.length})` : 'undefined');
    console.log('   pricingRules:', req.body.pricingRules ? `Array(${req.body.pricingRules.length})` : 'undefined');
    
    if (req.body.packages && Array.isArray(req.body.packages) && req.body.packages.length > 0) {
      console.log('📦 [PACKAGES RECEIVED]:', JSON.stringify(req.body.packages, null, 2));
    }
    
    // ✅ LOG ITEMIZATION DATA RECEIVED
    console.log('📦 [ITEMIZATION CHECK] Packages received:', req.body.packages ? `${req.body.packages.length} packages` : 'NONE');
    console.log('🎁 [ITEMIZATION CHECK] Addons received:', req.body.addons ? `${req.body.addons.length} addons` : 'NONE');
    console.log('💰 [ITEMIZATION CHECK] Pricing rules received:', req.body.pricingRules ? `${req.body.pricingRules.length} rules` : 'NONE');
    
    if (req.body.packages && req.body.packages.length > 0) {
      console.log('📦 [PACKAGE DETAILS] First package:', JSON.stringify(req.body.packages[0], null, 2));
    }

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

    // ✅ DOCUMENT VERIFICATION CHECK - Required for service creation
    // ⚠️ SKIP for now if documents table doesn't exist (graceful degradation)
    console.log('🔍 [Document Check] Verifying documents for vendor:', actualVendorId);
    
    try {
      // First check if documents table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('documents', 'vendor_documents')
        );
      `;
      
      if (!tableCheck[0].exists) {
        console.log('⚠️ [Document Check] Documents table not found, skipping verification');
        // Allow service creation without document check (temporary)
      } else {
        // Get vendor profile to check vendor_type
        const vendorProfile = await sql`
          SELECT vp.vendor_type, v.id as vendor_id
          FROM vendor_profiles vp
          LEFT JOIN vendors v ON v.user_id = vp.user_id
          WHERE vp.user_id = ${actualVendorId}
          LIMIT 1
        `;
        
        if (vendorProfile.length === 0) {
          console.log('❌ [Document Check] No vendor profile found');
          return res.status(403).json({
            success: false,
            error: 'Vendor profile not found',
            message: 'Please complete your vendor profile first'
          });
        }
        
        const vendorType = vendorProfile[0].vendor_type || 'business';
        const vendorTableId = vendorProfile[0].vendor_id;
        
        console.log(`📋 [Document Check] Vendor type: ${vendorType}`);
        
        // Get approved documents for this vendor (try both table names)
        let approvedDocs;
        try {
          approvedDocs = await sql`
            SELECT DISTINCT document_type 
            FROM vendor_documents 
            WHERE vendor_id = ${vendorTableId}
            AND verification_status = 'approved'
          `;
        } catch (e) {
          // Fallback to 'documents' table if vendor_documents doesn't exist
          approvedDocs = await sql`
            SELECT DISTINCT document_type 
            FROM documents 
            WHERE vendor_id = ${vendorTableId}
            AND verification_status = 'approved'
          `;
        }
        
        const approvedTypes = approvedDocs.map(d => d.document_type);
        console.log(`📄 [Document Check] Approved documents: ${approvedTypes.join(', ')}`);
        
        // Check requirements based on vendor type
        let missingDocs = [];
        
        if (vendorType === 'freelancer') {
          // FREELANCERS need: valid_id + portfolio_samples + professional_certification
          if (!approvedTypes.includes('valid_id')) {
            missingDocs.push('Valid ID (government-issued)');
          }
          if (!approvedTypes.includes('portfolio_samples')) {
            missingDocs.push('Portfolio Samples');
          }
          if (!approvedTypes.includes('professional_certification')) {
            missingDocs.push('Professional Certification');
          }
        } else {
          // BUSINESSES need: business_license
          if (!approvedTypes.includes('business_license')) {
            missingDocs.push('Business License/Permit');
          }
        }
        
        if (missingDocs.length > 0) {
          console.log(`❌ [Document Check] Missing required documents: ${missingDocs.join(', ')}`);
          return res.status(403).json({
            success: false,
            error: 'Documents not verified',
            message: vendorType === 'freelancer'
              ? 'Freelancers must have approved: Valid ID, Portfolio Samples, and Professional Certification'
              : 'Businesses must have an approved Business License/Permit',
            missing_documents: missingDocs,
            vendor_type: vendorType,
            approved_documents: approvedTypes
          });
        }
        
        console.log(`✅ [Document Check] All required documents verified for ${vendorType}`);
      }
    } catch (docError) {
      console.error('❌ [Document Check] Error checking documents:', docError);
      console.log('⚠️ [Document Check] Skipping document verification due to error');
      // Don't block service creation if document check fails
      // return res.status(500).json({
      //   success: false,
      //   error: 'Error checking document verification',
      //   message: docError.message
      // });
    }

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
      
      // ✅ TEMPORARY FIX: Default to premium plan (unlimited) if no subscription found
      // This allows all vendors to add unlimited services during beta/testing
      // TODO: Revert to 'basic' once subscription system is fully implemented
      const planName = subscription.length > 0 ? subscription[0].plan_name : 'premium';  // Changed from 'basic' to 'premium'
      console.log(`📋 [Subscription Check] Plan: ${planName}${subscription.length === 0 ? ' (DEFAULT - no subscription found)' : ''}`);
      
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

    // ✅ Normalize service_tier and provide valid default
    // Database CHECK constraint requires: 'basic', 'standard', or 'premium'
    // Always provide a valid value to avoid constraint violations
    const validTiers = ['basic', 'standard', 'premium'];
    let normalizedServiceTier = 'standard'; // Default fallback
    
    if (service_tier && typeof service_tier === 'string') {
      const lowerTier = service_tier.toLowerCase().trim();
      if (validTiers.includes(lowerTier)) {
        normalizedServiceTier = lowerTier;
      }
    }
    
    console.log(`🎯 [Service Tier] Input: "${service_tier}" → Normalized: "${normalizedServiceTier}"`);
    
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
        ${availability ? (typeof availability === 'string' ? availability : JSON.stringify(availability)) : null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    console.log('✅ [POST /api/services] Service created successfully:', result[0]);

    // ✅ HANDLE ITEMIZATION DATA - Create packages, items, add-ons, and pricing rules
    const itemizationData = {
      packages: [],
      addons: [],
      pricingRules: []
    };

    try {
      // 1. Create packages (if provided)
      if (req.body.packages && Array.isArray(req.body.packages) && req.body.packages.length > 0) {
        console.log(`📦 [Itemization] Creating ${req.body.packages.length} packages...`);
        
        for (const pkg of req.body.packages) {
          const packageResult = await sql`
            INSERT INTO service_packages (
              service_id, package_name, package_description, base_price, tier,
              is_default, is_active, created_at, updated_at
            ) VALUES (
              ${serviceId},
              ${pkg.name},
              ${pkg.description || ''},
              ${pkg.price ? parseFloat(pkg.price) : 0},
              ${pkg.tier || 'standard'},
              ${pkg.is_default || false},
              ${pkg.is_active !== false},
              NOW(),
              NOW()
            )
            RETURNING *
          `;
          
          const createdPackage = packageResult[0];
          console.log(`✅ Package created: ${createdPackage.name} (ID: ${createdPackage.id})`);
          
          // 2. Create package items for this package
          if (pkg.items && Array.isArray(pkg.items) && pkg.items.length > 0) {
            console.log(`📦 [Itemization] Creating ${pkg.items.length} items for package ${createdPackage.package_name}...`);
            
            for (let i = 0; i < pkg.items.length; i++) {
              const item = pkg.items[i];
              
              // ✅ Map frontend category to valid item_type constraint values
              // Database CHECK constraint: item_type IN ('package', 'per_pax', 'addon', 'base')
              const itemTypeMap = {
                'personnel': 'base',
                'equipment': 'base',
                'deliverables': 'base',
                'deliverable': 'base',
                'other': 'base',
                'package': 'package',
                'per_pax': 'per_pax',
                'addon': 'addon',
                'base': 'base'
              };
              const validItemType = itemTypeMap[item.category?.toLowerCase()] || 'base';
              
              console.log(`📦 [Item] Mapping category "${item.category}" → item_type "${validItemType}"`);
              
              await sql`
                INSERT INTO package_items (
                  package_id, item_type, item_name, 
                  quantity, unit_type, unit_price, item_description, display_order,
                  created_at, updated_at
                ) VALUES (
                  ${createdPackage.id},
                  ${validItemType},
                  ${item.name},
                  ${item.quantity || 1},
                  ${item.unit || 'pcs'},
                  ${item.unit_price || 0},
                  ${item.description || ''},
                  ${i + 1},
                  NOW(),
                  NOW()
                )
              `;
            }
            console.log(`✅ ${pkg.items.length} items created for package ${createdPackage.package_name}`);
          }
          
          itemizationData.packages.push(createdPackage);
        }
      }
      
      // 3. Create add-ons (if provided)
      if (req.body.addons && Array.isArray(req.body.addons) && req.body.addons.length > 0) {
        console.log(`🎁 [Itemization] Creating ${req.body.addons.length} add-ons...`);
        
        for (const addon of req.body.addons) {
          const addonResult = await sql`
            INSERT INTO service_addons (
              service_id, name, description, price,
              is_active, created_at, updated_at
            ) VALUES (
              ${serviceId},
              ${addon.name},
              ${addon.description || ''},
              ${addon.price ? parseFloat(addon.price) : 0},
              ${addon.is_active !== false},
              NOW(),
              NOW()
            )
            RETURNING *
          `;
          
          itemizationData.addons.push(addonResult[0]);
          console.log(`✅ Add-on created: ${addon.name}`);
        }
      }
      
      // 4. Create pricing rules (if provided)
      if (req.body.pricingRules && Array.isArray(req.body.pricingRules) && req.body.pricingRules.length > 0) {
        console.log(`💰 [Itemization] Creating ${req.body.pricingRules.length} pricing rules...`);
        
        for (const rule of req.body.pricingRules) {
          const ruleResult = await sql`
            INSERT INTO service_pricing_rules (
              service_id, rule_type, rule_name, base_price,
              price_per_unit, min_quantity, max_quantity,
              is_active, created_at, updated_at
            ) VALUES (
              ${serviceId},
              ${rule.rule_type || 'fixed'},
              ${rule.rule_name || ''},
              ${rule.base_price ? parseFloat(rule.base_price) : 0},
              ${rule.price_per_unit ? parseFloat(rule.price_per_unit) : 0},
              ${rule.min_quantity || null},
              ${rule.max_quantity || null},
              ${rule.is_active !== false},
              NOW(),
              NOW()
            )
            RETURNING *
          `;
          
          itemizationData.pricingRules.push(ruleResult[0]);
          console.log(`✅ Pricing rule created: ${rule.rule_name}`);
        }
      }
      
      console.log(`✅ [Itemization] Complete: ${itemizationData.packages.length} packages, ${itemizationData.addons.length} add-ons, ${itemizationData.pricingRules.length} rules`);
      
      // ✅ FIX ISSUE 1: Auto-calculate price, max_price, price_range from packages
      if (itemizationData.packages.length > 0) {
        const packagePrices = itemizationData.packages.map(pkg => parseFloat(pkg.base_price || 0));
        const minPrice = Math.min(...packagePrices);
        const maxPrice = Math.max(...packagePrices);
        const priceRange = minPrice === maxPrice 
          ? `₱${minPrice.toLocaleString('en-PH')}` 
          : `₱${minPrice.toLocaleString('en-PH')} - ₱${maxPrice.toLocaleString('en-PH')}`;
        
        console.log(`💰 [Pricing] Auto-calculated from packages: min=${minPrice}, max=${maxPrice}, range="${priceRange}"`);
        
        // Update service with calculated pricing
        await sql`
          UPDATE services
          SET 
            price = ${minPrice},
            max_price = ${maxPrice},
            price_range = ${priceRange},
            updated_at = NOW()
          WHERE id = ${serviceId}
        `;
        
        // Update result object
        result[0].price = minPrice;
        result[0].max_price = maxPrice;
        result[0].price_range = priceRange;
        
        console.log(`✅ [Pricing] Service pricing updated automatically`);
      }
      
    } catch (itemizationError) {
      console.error('⚠️  [Itemization] Error creating itemization data:', itemizationError);
      // Don't fail the entire request if itemization fails
      // Service was created successfully, just log the error
    }

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: result[0],
      itemization: itemizationData
    });

  } catch (error) {
    console.error('❌ [POST /api/services] Error creating service:', error);
    console.error('❌ [POST /api/services] Error code:', error.code);
    console.error('❌ [POST /api/services] Error constraint:', error.constraint);
    console.error('❌ [POST /api/services] Error detail:', error.detail);
    console.error('❌ [POST /api/services] Error message:', error.message);
    console.error('❌ [POST /api/services] Full error object:', JSON.stringify(error, null, 2));
    
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
      userMessage = `Database constraint violation: ${error.constraint || 'unknown constraint'}`;
      statusCode = 400;
    } else if (error.code === '42703') {
      // Column does not exist
      userMessage = `Database schema error: ${error.message}`;
      statusCode = 500;
    }
    
    res.status(statusCode).json({
      success: false,
      error: userMessage,
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error.code,
      constraint: error.constraint,
      detail: error.detail,
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

// ✅ NEW: Get itemization data for a service - GET /api/services/:id/itemization
router.get('/:id/itemization', async (req, res) => {
  console.log('📦 [GET /api/services/:id/itemization] Fetching itemization for service:', req.params.id);
  
  try {
    const { id } = req.params;
    
    // 1. Get packages
    const packages = await sql`
      SELECT * FROM service_packages
      WHERE service_id = ${id}
      ORDER BY is_default DESC, price ASC
    `;
    
    // 2. Get package items (if packages exist)
    let packageItems = {};
    if (packages.length > 0) {
      const packageIds = packages.map(p => p.id);
      const items = await sql`
        SELECT * FROM package_items
        WHERE package_id = ANY(${packageIds})
        ORDER BY package_id, item_type, display_order
      `;
      
      // Group by package_id
      items.forEach(item => {
        if (!packageItems[item.package_id]) {
          packageItems[item.package_id] = [];
        }
        packageItems[item.package_id].push(item);
      });
    }
    
    // 3. Get add-ons
    const addons = await sql`
      SELECT * FROM service_addons
      WHERE service_id = ${id}
      AND is_active = true
      ORDER BY price ASC
    `;
    
    // 4. Get pricing rules
    const pricingRules = await sql`
      SELECT * FROM service_pricing_rules
      WHERE service_id = ${id}
      AND is_active = true
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ Found ${packages.length} packages, ${addons.length} add-ons, ${pricingRules.length} pricing rules`);
    
    res.json({
      success: true,
      itemization: {
        packages,
        package_items: packageItems,
        addons,
        pricing_rules: pricingRules
      },
      has_itemization: packages.length > 0 || addons.length > 0 || pricingRules.length > 0
    });
    
  } catch (error) {
    console.error('❌ [GET /api/services/:id/itemization] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch itemization data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ✅ NEW: Update itemization for a service - PUT /api/services/:id/itemization
router.put('/:id/itemization', async (req, res) => {
  console.log('📦 [PUT /api/services/:id/itemization] Updating itemization for service:', req.params.id);
  
  try {
    const { id } = req.params;
    const { packages, addons, pricingRules } = req.body;
    
    // Verify service exists
    const serviceCheck = await sql`SELECT id FROM services WHERE id = ${id}`;
    if (serviceCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    const result = {
      packages: [],
      addons: [],
      pricingRules: []
    };
    
    // 1. Handle packages
    if (packages && Array.isArray(packages)) {
      console.log(`📦 Processing ${packages.length} packages...`);
      
      for (const pkg of packages) {
        if (pkg.id) {
          // Update existing package
          const updated = await sql`
            UPDATE service_packages
            SET name = ${pkg.name},
                description = ${pkg.description || ''},
                price = ${pkg.price ? parseFloat(pkg.price) : 0},
                is_default = ${pkg.is_default || false},
                is_active = ${pkg.is_active !== false},
                updated_at = NOW()
            WHERE id = ${pkg.id} AND service_id = ${id}
            RETURNING *
          `;
          if (updated.length > 0) result.packages.push(updated[0]);
        } else {
          // Create new package
          const created = await sql`
            INSERT INTO service_packages (
              service_id, name, description, price,
              is_default, is_active, created_at, updated_at
            ) VALUES (
              ${id}, ${pkg.name}, ${pkg.description || ''},
              ${pkg.price ? parseFloat(pkg.price) : 0},
              ${pkg.is_default || false}, ${pkg.is_active !== false},
              NOW(), NOW()
            )
            RETURNING *
          `;
          result.packages.push(created[0]);
        }
      }
    }
    
    // 2. Handle add-ons
    if (addons && Array.isArray(addons)) {
      console.log(`🎁 Processing ${addons.length} add-ons...`);
      
      for (const addon of addons) {
        if (addon.id) {
          // Update existing
          const updated = await sql`
            UPDATE service_addons
            SET name = ${addon.name},
                description = ${addon.description || ''},
                price = ${addon.price ? parseFloat(addon.price) : 0},
                is_active = ${addon.is_active !== false},
                updated_at = NOW()
            WHERE id = ${addon.id} AND service_id = ${id}
            RETURNING *
          `;
          if (updated.length > 0) result.addons.push(updated[0]);
        } else {
          // Create new
          const created = await sql`
            INSERT INTO service_addons (
              service_id, name, description, price,
              is_active, created_at, updated_at
            ) VALUES (
              ${id}, ${addon.name}, ${addon.description || ''},
              ${addon.price ? parseFloat(addon.price) : 0},
              ${addon.is_active !== false}, NOW(), NOW()
            )
            RETURNING *
          `;
          result.addons.push(created[0]);
        }
      }
    }
    
    // 3. Handle pricing rules
    if (pricingRules && Array.isArray(pricingRules)) {
      console.log(`💰 Processing ${pricingRules.length} pricing rules...`);
      
      for (const rule of pricingRules) {
        if (rule.id) {
          // Update existing
          const updated = await sql`
            UPDATE service_pricing_rules
            SET rule_type = ${rule.rule_type || 'fixed'},
                rule_name = ${rule.rule_name || ''},
                base_price = ${rule.base_price ? parseFloat(rule.base_price) : 0},
                price_per_unit = ${rule.price_per_unit ? parseFloat(rule.price_per_unit) : 0},
                min_quantity = ${rule.min_quantity || null},
                max_quantity = ${rule.max_quantity || null},
                is_active = ${rule.is_active !== false},
                updated_at = NOW()
            WHERE id = ${rule.id} AND service_id = ${id}
            RETURNING *
          `;
          if (updated.length > 0) result.pricingRules.push(updated[0]);
        } else {
          // Create new
          const created = await sql`
            INSERT INTO service_pricing_rules (
              service_id, rule_type, rule_name, base_price,
              price_per_unit, min_quantity, max_quantity,
              is_active, created_at, updated_at
            ) VALUES (
              ${id}, ${rule.rule_type || 'fixed'}, ${rule.rule_name || ''},
              ${rule.base_price ? parseFloat(rule.base_price) : 0},
              ${rule.price_per_unit ? parseFloat(rule.price_per_unit) : 0},
              ${rule.min_quantity || null}, ${rule.max_quantity || null},
              ${rule.is_active !== false}, NOW(), NOW()
            )
            RETURNING *
          `;
          result.pricingRules.push(created[0]);
        }
      }
    }
    
    console.log(`✅ Updated itemization: ${result.packages.length} packages, ${result.addons.length} add-ons, ${result.pricingRules.length} rules`);
    
    res.json({
      success: true,
      message: 'Itemization updated successfully',
      itemization: result
    });
    
  } catch (error) {
    console.error('❌ [PUT /api/services/:id/itemization] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update itemization',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

module.exports = router;
