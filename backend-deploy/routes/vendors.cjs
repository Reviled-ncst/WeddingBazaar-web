const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Get featured vendors
router.get('/featured', async (req, res) => {
  try {
    console.log('⭐ [VENDORS] GET /api/vendors/featured called');
    
    const vendors = await sql`
      SELECT 
        id,
        business_name,
        business_type,
        rating,
        review_count,
        location,
        description,
        profile_image,
        website_url,
        years_experience,
        portfolio_images,
        verified,
        starting_price
      FROM vendors 
      WHERE verified = true 
      ORDER BY CAST(rating AS DECIMAL) DESC, review_count DESC
      LIMIT 5
    `;

    console.log(`✅ [VENDORS] Found ${vendors.length} featured vendors`);

    res.json({
      success: true,
      vendors: vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.business_name,  // Fixed: use business_name
        category: vendor.business_type,  // Fixed: use business_type
        rating: parseFloat(vendor.rating) || 0,
        reviewCount: parseInt(vendor.review_count) || 0,
        location: vendor.location || 'Location not specified',
        description: vendor.description || 'Professional wedding services',
        image: vendor.profile_image,
        imageUrl: vendor.profile_image,
        website: vendor.website_url,
        websiteUrl: vendor.website_url,
        yearsExperience: vendor.years_experience || 0,
        portfolioImages: vendor.portfolio_images || [],
        verified: vendor.verified || false,
        startingPrice: vendor.starting_price || '$1,000',
        priceRange: vendor.starting_price ? `$${vendor.starting_price} - $${parseFloat(vendor.starting_price) * 2}` : '$1,000 - $2,000'
      })),
      count: vendors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [VENDORS] Featured vendors error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all vendors with filtering
router.get('/', async (req, res) => {
  try {
    console.log('🏪 [VENDORS] GET /api/vendors called');
    const { category, location, verified, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        id, business_name, business_type, rating, review_count, 
        location, description, profile_image, website_url, 
        years_experience, portfolio_images, verified, starting_price
      FROM vendors WHERE 1=1`;
    let params = [];
    
    if (category) {
      query += ` AND business_type = $${params.length + 1}`;
      params.push(category);
    }
    
    if (location) {
      query += ` AND location ILIKE $${params.length + 1}`;
      params.push(`%${location}%`);
    }
    
    if (verified !== undefined) {
      query += ` AND verified = $${params.length + 1}`;
      params.push(verified === 'true');
    }
    
    query += ` ORDER BY CAST(rating AS DECIMAL) DESC, review_count DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const vendors = await sql(query, params);
    
    console.log(`✅ [VENDORS] Found ${vendors.length} vendors`);
    
    res.json({
      success: true,
      vendors: vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.business_name,
        category: vendor.business_type,
        rating: parseFloat(vendor.rating) || 0,
        reviewCount: parseInt(vendor.review_count) || 0,
        location: vendor.location || 'Location not specified',
        description: vendor.description || 'Professional wedding services',
        image: vendor.profile_image,
        website: vendor.website_url,
        yearsExperience: vendor.years_experience || 0,
        portfolioImages: vendor.portfolio_images || [],
        verified: vendor.verified || false,
        startingPrice: vendor.starting_price || '$1,000'
      })),
      count: vendors.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Vendors error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get vendor by ID
router.get('/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    const vendors = await sql`
      SELECT * FROM vendors 
      WHERE id = ${vendorId}
    `;
    
    if (vendors.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      vendor: vendors[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Vendor error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get services for a vendor (alternative route pattern)
router.get('/:vendorId/services', async (req, res) => {
  console.log('🛠️ Getting services for vendor (alt route):', req.params.vendorId);
  
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
    console.error('❌ Vendor services error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
