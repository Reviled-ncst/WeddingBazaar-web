/**
 * Decision Support System (DSS) API Routes
 * Provides comprehensive data aggregation for intelligent wedding planning recommendations
 */

const express = require('express');
const router = express.Router();
const { sql } = require('../config/database.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

/**
 * GET /api/dss/all-data
 * Returns ALL data needed for DSS in a single optimized call
 * Includes: vendors, services, bookings, reviews, categories, couple profile
 */
router.get('/all-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    console.log('📊 Fetching comprehensive DSS data for user:', userId);

    // Parallel data fetching for performance
    const [
      vendors,
      services,
      bookings,
      reviews,
      categories,
      subcategories,
      coupleProfile,
      priceRanges
    ] = await Promise.all([
      // 1. All vendors with full profiles
      sql`
        SELECT 
          vp.*,
          u.email as vendor_email,
          u.phone as vendor_phone,
          COUNT(DISTINCT b.id) as actual_bookings,
          AVG(r.rating) as calculated_rating,
          COUNT(DISTINCT r.id) as review_count
        FROM vendor_profiles vp
        LEFT JOIN users u ON vp.user_id = u.id
        LEFT JOIN bookings b ON b.vendor_id = vp.id AND b.status = 'completed'
        LEFT JOIN reviews r ON r.vendor_id = vp.id
        WHERE vp.business_verified = true
        GROUP BY vp.id, u.email, u.phone
        ORDER BY calculated_rating DESC, review_count DESC
      `,

      // 2. All services with vendor info
      sql`
        SELECT 
          s.*,
          vp.business_name,
          vp.business_type,
          vp.average_rating as vendor_rating,
          vp.service_areas
        FROM services s
        LEFT JOIN vendor_profiles vp ON s.vendor_id = vp.id
        WHERE vp.business_verified = true
        ORDER BY s.category, s.price
      `,

      // 3. User's booking history
      sql`
        SELECT 
          b.*,
          vp.business_name,
          vp.business_type,
          s.name as service_name,
          s.category as service_category
        FROM bookings b
        LEFT JOIN vendor_profiles vp ON b.vendor_id = vp.id
        LEFT JOIN services s ON b.service_id = s.id
        WHERE b.user_id = ${userId}
        ORDER BY b.created_at DESC
      `,

      // 4. All reviews for context
      sql`
        SELECT 
          r.*,
          vp.business_name,
          vp.business_type,
          u.email as reviewer_email
        FROM reviews r
        LEFT JOIN vendor_profiles vp ON r.vendor_id = vp.id
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
        LIMIT 500
      `,

      // 5. Service categories
      sql`
        SELECT * FROM service_categories
        ORDER BY display_order, name
      `,

      // 6. Service subcategories
      sql`
        SELECT * FROM service_subcategories
        ORDER BY category_id, name
      `,

      // 7. Couple profile (if exists)
      sql`
        SELECT * FROM couple_profiles
        WHERE user_id = ${userId}
        LIMIT 1
      `,

      // 8. Price ranges
      sql`
        SELECT * FROM price_ranges
        ORDER BY min_price
      `
    ]);

    // Calculate additional metrics
    const totalVendors = vendors.length;
    const totalServices = services.length;
    const totalReviews = reviews.length;
    const averageRating = vendors.reduce((sum, v) => sum + (parseFloat(v.calculated_rating) || 0), 0) / totalVendors || 0;

    // Group vendors by category
    const vendorsByCategory = vendors.reduce((acc, vendor) => {
      const category = vendor.business_type || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(vendor);
      return acc;
    }, {});

    // Group services by category
    const servicesByCategory = services.reduce((acc, service) => {
      const category = service.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    }, {});

    // Calculate booking statistics
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalSpent = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (parseFloat(b.total_cost) || 0), 0);

    const response = {
      success: true,
      data: {
        // Core data
        vendors,
        services,
        bookings,
        reviews,
        categories,
        subcategories,
        coupleProfile: coupleProfile[0] || null,
        priceRanges,

        // Organized data
        vendorsByCategory,
        servicesByCategory,

        // Summary statistics
        stats: {
          totalVendors,
          totalServices,
          totalReviews,
          averageRating: parseFloat(averageRating.toFixed(2)),
          completedBookings,
          pendingBookings,
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          categoriesAvailable: Object.keys(vendorsByCategory).length
        },

        // User context
        userContext: {
          hasProfile: !!coupleProfile[0],
          hasBookings: bookings.length > 0,
          weddingDate: coupleProfile[0]?.wedding_date || null,
          budget: coupleProfile[0]?.budget || null,
          location: coupleProfile[0]?.location || null
        }
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ DSS data fetched successfully:', {
      vendors: totalVendors,
      services: totalServices,
      bookings: bookings.length,
      reviews: totalReviews
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching DSS data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DSS data',
      details: error.message
    });
  }
});

/**
 * GET /api/dss/vendors-enriched
 * Returns vendors with all related data (reviews, services, bookings) joined
 */
router.get('/vendors-enriched', authenticateToken, async (req, res) => {
  try {
    const { category, minRating, maxPrice, verified, featured } = req.query;

    let query = sql`
      SELECT 
        vp.*,
        u.email as vendor_email,
        u.phone as vendor_phone,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'name', s.name,
              'category', s.category,
              'price', s.price,
              'duration', s.duration
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) as services,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', r.id,
              'rating', r.rating,
              'comment', r.comment,
              'created_at', r.created_at
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) as reviews,
        COUNT(DISTINCT b.id) as total_bookings,
        AVG(r.rating) as avg_rating
      FROM vendor_profiles vp
      LEFT JOIN users u ON vp.user_id = u.id
      LEFT JOIN services s ON s.vendor_id = vp.id
      LEFT JOIN reviews r ON r.vendor_id = vp.id
      LEFT JOIN bookings b ON b.vendor_id = vp.id
      WHERE vp.business_verified = true
    `;

    // Apply filters
    if (category) {
      query = sql`${query} AND vp.business_type = ${category}`;
    }
    if (verified === 'true') {
      query = sql`${query} AND vp.documents_verified = true`;
    }
    if (featured === 'true') {
      query = sql`${query} AND vp.is_featured = true`;
    }

    query = sql`
      ${query}
      GROUP BY vp.id, u.email, u.phone
      ORDER BY avg_rating DESC, total_bookings DESC
    `;

    const vendors = await query;

    // Post-processing filters
    let filtered = vendors;
    if (minRating) {
      filtered = filtered.filter(v => parseFloat(v.avg_rating) >= parseFloat(minRating));
    }
    if (maxPrice) {
      filtered = filtered.filter(v => {
        const pricing = v.pricing_range;
        return pricing && pricing.max && parseFloat(pricing.max) <= parseFloat(maxPrice);
      });
    }

    res.json({
      success: true,
      data: filtered,
      count: filtered.length,
      filters: { category, minRating, maxPrice, verified, featured }
    });

  } catch (error) {
    console.error('❌ Error fetching enriched vendors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enriched vendors',
      details: error.message
    });
  }
});

/**
 * GET /api/dss/budget-recommendations
 * Returns recommended budget allocation by category
 */
router.get('/budget-recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's couple profile
    const profile = await sql`
      SELECT budget FROM couple_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    const totalBudget = profile[0]?.budget || 1000000; // Default 1M PHP

    // Industry standard budget allocation percentages
    const budgetAllocation = {
      'Photography': { percentage: 12, priority: 'High', description: 'Capture your precious moments' },
      'Videography': { percentage: 10, priority: 'High', description: 'Professional video memories' },
      'Catering': { percentage: 30, priority: 'Critical', description: 'Food and beverages for guests' },
      'Venue': { percentage: 20, priority: 'Critical', description: 'Reception and ceremony location' },
      'Music/DJ': { percentage: 8, priority: 'Medium', description: 'Entertainment and ambiance' },
      'Wedding Planning': { percentage: 10, priority: 'Medium', description: 'Professional coordination' },
      'Florals': { percentage: 5, priority: 'Medium', description: 'Flowers and decorations' },
      'Attire': { percentage: 8, priority: 'High', description: 'Wedding dress and suits' },
      'Hair & Makeup': { percentage: 3, priority: 'Medium', description: 'Beauty services' },
      'Invitations': { percentage: 2, priority: 'Low', description: 'Stationery and printing' },
      'Transportation': { percentage: 2, priority: 'Low', description: 'Guest and couple transport' }
    };

    // Calculate actual amounts
    const recommendations = Object.entries(budgetAllocation).map(([category, data]) => ({
      category,
      percentage: data.percentage,
      amount: Math.round((totalBudget * data.percentage) / 100),
      priority: data.priority,
      description: data.description,
      recommended_range: {
        min: Math.round((totalBudget * data.percentage * 0.8) / 100),
        max: Math.round((totalBudget * data.percentage * 1.2) / 100)
      }
    }));

    // Get actual spending from bookings
    const bookings = await sql`
      SELECT 
        vp.business_type as category,
        SUM(b.total_cost) as spent
      FROM bookings b
      LEFT JOIN vendor_profiles vp ON b.vendor_id = vp.id
      WHERE b.user_id = ${userId} AND b.status IN ('confirmed', 'completed')
      GROUP BY vp.business_type
    `;

    // Merge with recommendations
    const budgetBreakdown = recommendations.map(rec => {
      const spent = bookings.find(b => b.category === rec.category);
      return {
        ...rec,
        spent: spent ? parseFloat(spent.spent) : 0,
        remaining: rec.amount - (spent ? parseFloat(spent.spent) : 0),
        status: spent ? (spent.spent > rec.amount ? 'over' : 'on_track') : 'not_started'
      };
    });

    const totalSpent = bookings.reduce((sum, b) => sum + parseFloat(b.spent), 0);
    const remaining = totalBudget - totalSpent;

    res.json({
      success: true,
      data: {
        totalBudget,
        totalSpent,
        remaining,
        percentageUsed: parseFloat(((totalSpent / totalBudget) * 100).toFixed(2)),
        budgetBreakdown,
        recommendations: [
          remaining < 0 ? 'You are over budget. Consider adjusting your spending.' : null,
          remaining < totalBudget * 0.1 ? 'You are close to your budget limit.' : null,
          'Book high-priority vendors (Catering, Venue) first.',
          'Leave 10-15% buffer for unexpected costs.',
          'Consider booking multiple services from the same vendor for discounts.'
        ].filter(Boolean)
      }
    });

  } catch (error) {
    console.error('❌ Error generating budget recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate budget recommendations',
      details: error.message
    });
  }
});

/**
 * GET /api/dss/timeline
 * Returns optimal booking timeline based on wedding date
 */
router.get('/timeline', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get wedding date from couple profile
    const profile = await sql`
      SELECT wedding_date FROM couple_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    const weddingDate = profile[0]?.wedding_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year from now
    const today = new Date();
    const daysUntilWedding = Math.floor((new Date(weddingDate) - today) / (1000 * 60 * 60 * 24));

    // Industry standard booking timeline (months before wedding)
    const bookingTimeline = [
      { category: 'Venue', monthsBefore: 12, priority: 'Critical', description: 'Book first to secure your date' },
      { category: 'Catering', monthsBefore: 10, priority: 'Critical', description: 'Ensure availability for guest count' },
      { category: 'Photography', monthsBefore: 9, priority: 'High', description: 'Top photographers book early' },
      { category: 'Videography', monthsBefore: 9, priority: 'High', description: 'Coordinate with photographer' },
      { category: 'Wedding Planning', monthsBefore: 8, priority: 'Medium', description: 'Get professional coordination' },
      { category: 'Music/DJ', monthsBefore: 6, priority: 'Medium', description: 'Entertainment availability' },
      { category: 'Florals', monthsBefore: 6, priority: 'Medium', description: 'Discuss seasonal options' },
      { category: 'Attire', monthsBefore: 6, priority: 'High', description: 'Allow time for alterations' },
      { category: 'Hair & Makeup', monthsBefore: 4, priority: 'Medium', description: 'Schedule trial sessions' },
      { category: 'Transportation', monthsBefore: 3, priority: 'Low', description: 'Book vehicles for guests' },
      { category: 'Invitations', monthsBefore: 3, priority: 'Low', description: 'Design and print early' }
    ];

    // Calculate deadlines
    const timeline = bookingTimeline.map(item => {
      const deadlineDate = new Date(weddingDate);
      deadlineDate.setMonth(deadlineDate.getMonth() - item.monthsBefore);
      const daysUntilDeadline = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));
      
      let status = 'upcoming';
      if (daysUntilDeadline < 0) status = 'overdue';
      else if (daysUntilDeadline < 30) status = 'urgent';

      return {
        ...item,
        deadlineDate: deadlineDate.toISOString(),
        daysUntilDeadline,
        status
      };
    });

    // Get user's actual bookings
    const bookings = await sql`
      SELECT 
        b.*,
        vp.business_type as category
      FROM bookings b
      LEFT JOIN vendor_profiles vp ON b.vendor_id = vp.id
      WHERE b.user_id = ${userId}
    `;

    // Mark completed categories
    const timelineWithStatus = timeline.map(item => {
      const booked = bookings.find(b => b.category === item.category);
      return {
        ...item,
        booked: !!booked,
        bookingStatus: booked?.status || null,
        bookingDate: booked?.created_at || null
      };
    });

    const overdue = timelineWithStatus.filter(t => t.status === 'overdue' && !t.booked).length;
    const urgent = timelineWithStatus.filter(t => t.status === 'urgent' && !t.booked).length;
    const completed = timelineWithStatus.filter(t => t.booked).length;

    res.json({
      success: true,
      data: {
        weddingDate,
        daysUntilWedding,
        timeline: timelineWithStatus,
        summary: {
          total: timeline.length,
          completed,
          overdue,
          urgent,
          remaining: timeline.length - completed
        },
        recommendations: [
          overdue > 0 ? `You have ${overdue} overdue bookings. Take action immediately!` : null,
          urgent > 0 ? `${urgent} categories need booking within 30 days.` : null,
          daysUntilWedding < 180 ? 'Your wedding is less than 6 months away. Book remaining vendors ASAP.' : null,
          'Focus on high-priority vendors first (Venue, Catering, Photography).',
          'Contact vendors 2-3 months before their booking deadline for best rates.'
        ].filter(Boolean)
      }
    });

  } catch (error) {
    console.error('❌ Error generating timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate timeline',
      details: error.message
    });
  }
});

/**
 * GET /api/dss/vendor-comparison
 * Compares multiple vendors side-by-side
 */
router.get('/vendor-comparison', authenticateToken, async (req, res) => {
  try {
    const { vendorIds } = req.query; // Comma-separated vendor IDs
    
    if (!vendorIds) {
      return res.status(400).json({
        success: false,
        error: 'Please provide vendorIds parameter'
      });
    }

    const ids = vendorIds.split(',').map(id => id.trim());

    if (ids.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 vendors can be compared at once'
      });
    }

    // Fetch vendors with all related data
    const vendors = await sql`
      SELECT 
        vp.*,
        u.email as vendor_email,
        u.phone as vendor_phone,
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT r.id) as review_count,
        AVG(r.rating) as avg_rating,
        COUNT(DISTINCT s.id) as service_count
      FROM vendor_profiles vp
      LEFT JOIN users u ON vp.user_id = u.id
      LEFT JOIN bookings b ON b.vendor_id = vp.id AND b.status = 'completed'
      LEFT JOIN reviews r ON r.vendor_id = vp.id
      LEFT JOIN services s ON s.vendor_id = vp.id
      WHERE vp.id = ANY(${ids})
      GROUP BY vp.id, u.email, u.phone
    `;

    // Calculate comparison scores
    const comparison = vendors.map(vendor => {
      const rating = parseFloat(vendor.avg_rating) || 0;
      const reviewCount = parseInt(vendor.review_count) || 0;
      const bookings = parseInt(vendor.total_bookings) || 0;
      const responseTime = parseInt(vendor.response_time_hours) || 24;
      const yearsInBusiness = parseInt(vendor.years_in_business) || 0;

      // Calculate overall score (0-100)
      const score = Math.min(100, 
        (rating / 5 * 30) + // 30% weight on rating
        (Math.min(reviewCount / 50, 1) * 15) + // 15% on review count
        (Math.min(bookings / 100, 1) * 20) + // 20% on bookings
        (Math.max(0, 1 - responseTime / 48) * 10) + // 10% on response time
        (Math.min(yearsInBusiness / 10, 1) * 15) + // 15% on experience
        (vendor.business_verified ? 5 : 0) + // 5% bonus for verification
        (vendor.is_premium ? 5 : 0) // 5% bonus for premium
      );

      return {
        ...vendor,
        comparisonScore: parseFloat(score.toFixed(2)),
        metrics: {
          rating,
          reviewCount,
          bookings,
          responseTime,
          yearsInBusiness,
          verified: vendor.business_verified,
          premium: vendor.is_premium
        }
      };
    });

    // Rank vendors
    const ranked = comparison.sort((a, b) => b.comparisonScore - a.comparisonScore);

    res.json({
      success: true,
      data: {
        vendors: ranked,
        winner: ranked[0],
        summary: `Based on rating, reviews, experience, and response time, ${ranked[0].business_name} ranks highest with a score of ${ranked[0].comparisonScore}/100.`
      }
    });

  } catch (error) {
    console.error('❌ Error comparing vendors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare vendors',
      details: error.message
    });
  }
});

module.exports = router;
