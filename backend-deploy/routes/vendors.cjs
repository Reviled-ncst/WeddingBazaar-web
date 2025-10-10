const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Get featured vendors
router.get('/featured', async (req, res) => {
  try {
    const vendors = await sql`
      SELECT * FROM vendors 
      WHERE verified = true 
      ORDER BY rating DESC 
      LIMIT 5
    `;

    res.json({
      success: true,
      vendors: vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        category: vendor.category,
        rating: vendor.rating,
        review_count: vendor.review_count,
        location: vendor.location,
        description: vendor.description,
        image_url: vendor.image_url,
        website_url: vendor.website_url,
        years_experience: vendor.years_experience,
        portfolio_images: vendor.portfolio_images,
        verified: vendor.verified,
        starting_price: vendor.starting_price,
        price_range: `$${vendor.starting_price} - $${parseFloat(vendor.starting_price) * 2}`
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

// Get all vendors with filtering
router.get('/', async (req, res) => {
  try {
    const { category, location, verified, limit = 20, offset = 0 } = req.query;
    
    let query = `SELECT * FROM vendors WHERE 1=1`;
    let params = [];
    
    if (category) {
      query += ` AND category = $${params.length + 1}`;
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
    
    query += ` ORDER BY rating DESC, review_count DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const vendors = await sql(query, params);
    
    res.json({
      success: true,
      vendors: vendors,
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
