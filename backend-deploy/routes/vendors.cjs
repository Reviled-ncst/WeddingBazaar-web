const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Get vendor categories from database
router.get('/categories', async (req, res) => {
  try {
    console.log('📂 [VENDORS] GET /api/vendors/categories called');
    
    // Query categories from database (try both possible table names)
    let categories = [];
    
    try {
      // Try service_categories table first (from service_categories.json)
      const result = await sql`
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
      
      if (result && result.length > 0) {
        categories = result.map(cat => ({
          id: cat.id,
          name: cat.display_name || cat.name,
          displayName: cat.display_name,
          description: cat.description,
          icon: cat.icon,
          sortOrder: cat.sort_order
        }));
        console.log(`✅ [VENDORS] Fetched ${categories.length} categories from service_categories table`);
      }
    } catch (tableError) {
      console.log('⚠️ [VENDORS] service_categories table not found, trying categories table...');
      
      try {
        // Try categories table (from categories.json)
        const result = await sql`
          SELECT 
            id,
            name,
            display_name,
            description,
            icon,
            sort_order,
            is_active
          FROM categories
          WHERE is_active = true
          ORDER BY sort_order ASC
        `;
        
        if (result && result.length > 0) {
          categories = result.map(cat => ({
            id: cat.id,
            name: cat.display_name || cat.name,
            displayName: cat.display_name,
            description: cat.description,
            icon: cat.icon,
            sortOrder: cat.sort_order
          }));
          console.log(`✅ [VENDORS] Fetched ${categories.length} categories from categories table`);
        }
      } catch (fallbackError) {
        console.warn('⚠️ [VENDORS] Categories table also not found, using fallback');
      }
    }
    
    // Fallback to hardcoded categories if database query fails
    if (categories.length === 0) {
      console.log('📋 [VENDORS] Using fallback categories');
      categories = [
        { id: 'CAT-001', name: 'Photographer & Videographer', displayName: 'Photographer & Videographer', icon: '📸', sortOrder: 1 },
        { id: 'CAT-002', name: 'Wedding Planner', displayName: 'Wedding Planner', icon: '📋', sortOrder: 2 },
        { id: 'CAT-003', name: 'Florist', displayName: 'Florist', icon: '🌸', sortOrder: 3 },
        { id: 'CAT-004', name: 'Hair & Makeup Artists', displayName: 'Hair & Makeup Artists', icon: '💄', sortOrder: 4 },
        { id: 'CAT-005', name: 'Caterer', displayName: 'Caterer', icon: '🍽️', sortOrder: 5 },
        { id: 'CAT-006', name: 'DJ/Band', displayName: 'DJ/Band', icon: '🎵', sortOrder: 6 },
        { id: 'CAT-007', name: 'Officiant', displayName: 'Officiant', icon: '👔', sortOrder: 7 },
        { id: 'CAT-008', name: 'Venue Coordinator', displayName: 'Venue Coordinator', icon: '🏛️', sortOrder: 8 },
        { id: 'CAT-009', name: 'Event Rentals', displayName: 'Event Rentals', icon: '🪑', sortOrder: 9 },
        { id: 'CAT-010', name: 'Cake Designer', displayName: 'Cake Designer', icon: '🎂', sortOrder: 10 },
        { id: 'CAT-011', name: 'Dress Designer/Tailor', displayName: 'Dress Designer/Tailor', icon: '�', sortOrder: 11 },
        { id: 'CAT-012', name: 'Security & Guest Management', displayName: 'Security & Guest Management', icon: '🛡️', sortOrder: 12 },
        { id: 'CAT-013', name: 'Sounds & Lights', displayName: 'Sounds & Lights', icon: '🎤', sortOrder: 13 },
        { id: 'CAT-014', name: 'Stationery Designer', displayName: 'Stationery Designer', icon: '✉️', sortOrder: 14 },
        { id: 'CAT-015', name: 'Transportation Services', displayName: 'Transportation Services', icon: '🚗', sortOrder: 15 }
      ];
    }
    
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
    
    // ✅ PREFER NEW FORMAT: Prioritize vendor entries where id = user_id (e.g., id='2-2025-003')
    // This ensures we return the synced vendor entry, not the old VEN-XXXXX format
    const vendors = await sql`
      SELECT id, user_id, business_name, category, location 
      FROM vendors 
      WHERE user_id = ${userId}
      ORDER BY CASE WHEN id = user_id THEN 0 ELSE 1 END
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
    
    // Try to get verified vendors first
    let vendors = await sql`
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

    // If no verified vendors, get all vendors (fallback)
    if (vendors.length === 0) {
      console.log('⚠️ [VENDORS] No verified vendors found, fetching all vendors as fallback');
      vendors = await sql`
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
        ORDER BY created_at DESC
        LIMIT 5
      `;
    }

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
