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

module.exports = router;
