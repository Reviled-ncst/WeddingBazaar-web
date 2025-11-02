const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Get vendor categories
router.get('/categories', async (req, res) => {
  try {
    console.log('📂 [VENDORS] GET /api/vendors/categories called');
    
    // Return predefined vendor categories
    const categories = [
      { id: 'photographer', name: 'Photographer', icon: '📸' },
      { id: 'videographer', name: 'Videographer', icon: '🎥' },
      { id: 'catering', name: 'Catering', icon: '🍽️' },
      { id: 'venue', name: 'Venue', icon: '🏛️' },
      { id: 'florist', name: 'Florist', icon: '💐' },
      { id: 'music', name: 'Music & DJ', icon: '🎵' },
      { id: 'makeup', name: 'Makeup & Hair', icon: '💄' },
      { id: 'decoration', name: 'Decoration', icon: '🎨' },
      { id: 'coordinator', name: 'Wedding Coordinator', icon: '📋' },
      { id: 'transportation', name: 'Transportation', icon: '🚗' },
      { id: 'invitations', name: 'Invitations', icon: '💌' },
      { id: 'cake', name: 'Cake & Desserts', icon: '🎂' },
      { id: 'photo_booth', name: 'Photo Booth', icon: '📷' },
      { id: 'entertainment', name: 'Entertainment', icon: '🎭' },
      { id: 'other', name: 'Other Services', icon: '✨' }
    ];
    
    console.log(`✅ [VENDORS] Returning ${categories.length} categories`);
    
    res.json({
      success: true,
      categories: categories,
      count: categories.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [VENDORS] Categories error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ✅ NEW: Get vendor ID by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 [VENDORS] GET /api/vendors/user/:userId - Looking up vendor for user:', userId);
    
    const vendors = await sql`
      SELECT id, user_id, business_name, category, location 
      FROM vendors 
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    
    if (vendors.length === 0) {
      console.log('❌ [VENDORS] No vendor found for user:', userId);
      return res.status(404).json({
        success: false,
        error: 'Vendor not found for this user',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('✅ [VENDORS] Found vendor:', vendors[0].id, 'for user:', userId);
    
    res.json({
      success: true,
      vendor: vendors[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [VENDORS] Error fetching vendor by user ID:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/vendors/:id/dashboard - Get vendor dashboard statistics
router.get('/:id/dashboard', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📊 [VENDORS] GET /api/vendors/${id}/dashboard called`);
    
    // Get vendor basic info
    const vendors = await sql`
      SELECT 
        id, business_name, business_type, rating, review_count,
        location, verified, profile_image
      FROM vendors 
      WHERE id = ${id}
    `;
    
    if (vendors.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    const vendor = vendors[0];
    
    // Get services count
    const servicesCount = await sql`
      SELECT COUNT(*) as count 
      FROM services 
      WHERE vendor_id = ${id} AND is_active = true
    `;
    
    // Get bookings statistics
    const bookingsStats = await sql`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'request' THEN 1 END) as pending_requests
      FROM bookings 
      WHERE vendor_id = ${id}
    `;
    
    // Get total revenue from completed bookings
    const revenueData = await sql`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(downpayment_amount), 0) as total_deposits
      FROM bookings 
      WHERE vendor_id = ${id} 
        AND status IN ('completed', 'paid_in_full', 'fully_paid')
    `;
    
    // Get recent bookings
    const recentBookings = await sql`
      SELECT 
        id, booking_reference, status, amount, event_date, created_at
      FROM bookings 
      WHERE vendor_id = ${id}
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    console.log(`✅ [VENDORS] Dashboard data fetched for vendor ${id}`);
    
    res.json({
      success: true,
      vendor: {
        id: vendor.id,
        name: vendor.business_name,
        category: vendor.business_type,
        rating: parseFloat(vendor.rating) || 0,
        reviewCount: parseInt(vendor.review_count) || 0,
        location: vendor.location,
        verified: vendor.verified,
        profileImage: vendor.profile_image
      },
      statistics: {
        totalServices: parseInt(servicesCount[0].count) || 0,
        totalBookings: parseInt(bookingsStats[0].total_bookings) || 0,
        confirmedBookings: parseInt(bookingsStats[0].confirmed_bookings) || 0,
        completedBookings: parseInt(bookingsStats[0].completed_bookings) || 0,
        pendingRequests: parseInt(bookingsStats[0].pending_requests) || 0,
        totalRevenue: parseFloat(revenueData[0].total_revenue) || 0,
        totalDeposits: parseFloat(revenueData[0].total_deposits) || 0
      },
      recentBookings: recentBookings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [VENDORS] Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

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
