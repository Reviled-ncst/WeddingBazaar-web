# 🔧 Coordinator Pages - Database Integration Fix

**Issue Date**: November 2, 2025  
**Status**: 🔴 CRITICAL - Multiple pages using mock data  
**Impact**: HIGH - Users not seeing real database information

---

## 📊 COMPLETE ANALYSIS - VENDOR, TEAM, ANALYTICS, DASHBOARD

### Investigation Summary

I've traced the entire data flow from frontend → service layer → backend → database for all coordinator pages. Here's what I found:

**Vendor Page Flow**:
1. ✅ Frontend (`CoordinatorVendors.tsx`) correctly calls `getVendorNetwork()`
2. ✅ Service (`coordinatorService.ts`) correctly calls `/api/coordinator/vendor-network`
3. ❌ Backend (`vendor-network.cjs`) queries **NON-EXISTENT** table `coordinator_vendor_network`
4. ❌ Query fails, frontend catches error, falls back to mock data

**Dashboard Page Flow**:
1. ✅ Frontend (`CoordinatorDashboard.tsx`) correctly calls `getDashboardStats()`
2. ✅ Service (`coordinatorService.ts`) correctly calls `/api/coordinator/dashboard/stats`
3. ❌ Backend (`dashboard.cjs`) queries **MULTIPLE NON-EXISTENT** tables:
   - `coordinator_weddings`
   - `coordinator_commissions`
   - `coordinator_clients`
   - `coordinator_vendors`
4. ❌ Query fails, stats show 0/0/0

**Analytics Page Flow**:
1. ❌ Frontend (`CoordinatorAnalytics.tsx`) uses **ONLY MOCK DATA**
2. ❌ No backend route `/api/coordinator/analytics` exists
3. ❌ No service method `getAnalytics()` exists

**Team Page Flow**:
1. ❌ Frontend (`CoordinatorTeam.tsx`) uses **ONLY MOCK DATA**
2. ❌ No backend route `/api/coordinator/team` exists
3. ❌ No database table for team members

---

## 🔧 COPY-PASTE FIXES

### Fix 1: Vendor Network Backend (CRITICAL)
**File**: `backend-deploy/routes/coordinator/vendor-network.cjs`  
**Line**: 13-59  
**Replace entire GET route with**:

```javascript
/**
 * GET /api/coordinator/vendor-network
 * Get coordinator's vendor network
 */
router.get('/vendor-network', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.userId || req.user.id;
    const { category, rating_min, search } = req.query;

    // Build filters - NO MORE coordinator_vendor_network table
    let filters = [];
    
    if (category) {
      filters.push(`v.business_type = '${category}'`);
    }

    if (rating_min) {
      filters.push(`v.rating >= ${parseFloat(rating_min)}`);
    }

    if (search) {
      filters.push(`v.business_name ILIKE '%${search}%'`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    // Query REAL vendors table + bookings for stats
    const vendors = await sql.unsafe(`
      SELECT 
        v.id as vendor_id,
        v.business_name as vendor_name,
        v.business_type as category,
        v.rating as average_rating,
        v.total_reviews as review_count,
        v.location,
        v.specialties,
        v.portfolio_images,
        v.years_experience,
        v.phone,
        v.email,
        v.website,
        v.description,
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.amount ELSE 0 END), 0) as total_revenue,
        MAX(b.event_date) as last_worked_with,
        '₱' || COALESCE(MIN(s.price_range_min), 0)::text || ' - ₱' || COALESCE(MAX(s.price_range_max), 0)::text as price_range
      FROM vendors v
      LEFT JOIN bookings b ON v.id = b.vendor_id
      LEFT JOIN services s ON v.id = s.vendor_id
      ${whereClause}
      GROUP BY v.id, v.business_name, v.business_type, v.rating, 
               v.total_reviews, v.location, v.specialties, v.portfolio_images, 
               v.years_experience, v.phone, v.email, v.website, v.description
      ORDER BY v.rating DESC, v.total_reviews DESC
      LIMIT 100
    `);

    res.json({ 
      success: true, 
      vendors,
      total: vendors.length
    });
  } catch (error) {
    console.error('Error fetching vendor network:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

---

### Fix 2: Dashboard Stats Backend (CRITICAL)
**File**: `backend-deploy/routes/coordinator/dashboard.cjs`  
**Line**: 20-98  
**Replace entire GET /stats route with**:

```javascript
/**
 * GET /api/coordinator/dashboard/stats
 * Get comprehensive dashboard statistics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id || req.user.userId;

    // Get wedding statistics from BOOKINGS table
    // Assumption: Coordinators are vendors with business_type = 'Wedding Planning' or 'Coordination'
    const weddingStats = await pool.query(`
      SELECT 
        COUNT(*) as total_weddings,
        COUNT(CASE WHEN b.status IN ('request', 'quote_requested', 'quote_sent') THEN 1 END) as planning_count,
        COUNT(CASE WHEN b.status IN ('quote_accepted', 'confirmed', 'deposit_paid', 'downpayment_paid') THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN b.status IN ('paid_in_full', 'fully_paid') THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN b.status IN ('cancelled', 'pending_cancellation') THEN 1 END) as cancelled_count,
        COALESCE(SUM(b.amount), 0) as total_budget,
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.amount ELSE 0 END), 0) as total_spent
      FROM bookings b
      JOIN vendors v ON b.vendor_id = v.id
      WHERE v.user_id = $1
        AND v.business_type IN ('Wedding Planning', 'Coordination', 'Planning')
    `, [coordinatorId]);

    // Get commission statistics from WALLET
    const commissionStats = await pool.query(`
      SELECT 
        COALESCE(vw.available_balance, 0) as pending_earnings,
        COALESCE(vw.total_earnings, 0) as total_earnings,
        COALESCE(vw.withdrawn_amount, 0) as withdrawn_amount
      FROM vendor_wallets vw
      JOIN vendors v ON vw.vendor_id = v.id::text
      WHERE v.user_id = $1
    `, [coordinatorId]);

    // Get client statistics from BOOKINGS (unique couples)
    const clientStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT b.user_id) as total_clients,
        COUNT(DISTINCT CASE WHEN b.status NOT IN ('completed', 'cancelled') THEN b.user_id END) as active_clients,
        COUNT(DISTINCT CASE WHEN b.status IN ('request', 'quote_requested') THEN b.user_id END) as leads,
        COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.user_id END) as completed_clients
      FROM bookings b
      JOIN vendors v ON b.vendor_id = v.id
      WHERE v.user_id = $1
        AND v.business_type IN ('Wedding Planning', 'Coordination', 'Planning')
    `, [coordinatorId]);

    // Get vendor network statistics (all vendors used in bookings)
    const vendorStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT b.vendor_id) as network_size,
        COUNT(DISTINCT b.id) as total_vendor_bookings,
        COALESCE(SUM(b.amount), 0) as total_vendor_revenue
      FROM bookings b
      JOIN vendors v ON b.vendor_id = v.id
      WHERE v.user_id = $1
    `, [coordinatorId]);

    // Get upcoming weddings (next 30 days)
    const upcomingWeddings = await pool.query(`
      SELECT 
        b.id, 
        u.full_name as couple_name, 
        b.event_date as wedding_date, 
        b.event_location as venue, 
        b.status
      FROM bookings b
      JOIN vendors v ON b.vendor_id = v.id
      JOIN users u ON b.user_id = u.id
      WHERE v.user_id = $1
        AND v.business_type IN ('Wedding Planning', 'Coordination', 'Planning')
        AND b.event_date >= CURRENT_DATE
        AND b.event_date <= CURRENT_DATE + INTERVAL '30 days'
        AND b.status NOT IN ('completed', 'cancelled')
      ORDER BY b.event_date ASC
      LIMIT 5
    `, [coordinatorId]);

    res.json({
      success: true,
      stats: {
        weddings: weddingStats.rows[0],
        commissions: commissionStats.rows[0] || { pending_earnings: 0, total_earnings: 0, withdrawn_amount: 0 },
        clients: clientStats.rows[0],
        vendors: vendorStats.rows[0],
        upcoming_weddings: upcomingWeddings.rows
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

---

### Fix 3: Create Analytics Backend Route (NEW FILE)
**File**: `backend-deploy/routes/coordinator/analytics.cjs` **(CREATE NEW)**  

```javascript
/**
 * Coordinator Analytics Routes
 * Provides detailed analytics and reporting for coordinators
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('@neondatabase/serverless');
const { authenticateToken } = require('../../middleware/auth.cjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/coordinator/analytics
 * Get comprehensive analytics data
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id || req.user.userId;
    const { timeRange = '30d' } = req.query;

    // Calculate date range
    const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : timeRange === '1y' ? 365 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Revenue and booking metrics
    const metrics = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.amount ELSE 0 END), 0) as total_revenue,
        COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as total_weddings,
        COUNT(DISTINCT b.user_id) as active_clients,
        COALESCE(AVG(CASE WHEN b.status = 'completed' THEN b.amount END), 0) as avg_booking_value
      FROM bookings b
      JOIN vendors v ON b.vendor_id = v.id
      WHERE v.user_id = $1
        AND v.business_type IN ('Wedding Planning', 'Coordination', 'Planning')
        AND b.created_at >= $2
    `, [coordinatorId, startDate]);

    // Monthly revenue data
    const revenueData = await pool.query(`
      SELECT 
        TO_CHAR(b.event_date, 'Mon') as month,
        COALESCE(SUM(b.amount), 0) as revenue,
        COUNT(DISTINCT b.id) as bookings,
        COUNT(DISTINCT b.user_id) as clients
      FROM bookings b
      JOIN vendors v ON b.vendor_id = v.id
      WHERE v.user_id = $1
        AND v.business_type IN ('Wedding Planning', 'Coordination', 'Planning')
        AND b.event_date >= $2
        AND b.status = 'completed'
      GROUP BY TO_CHAR(b.event_date, 'Mon'), EXTRACT(MONTH FROM b.event_date)
      ORDER BY EXTRACT(MONTH FROM b.event_date)
    `, [coordinatorId, startDate]);

    // Vendor performance (most used vendors in coordinator's bookings)
    const vendorPerformance = await pool.query(`
      SELECT 
        v.business_name as name,
        v.business_type as category,
        COUNT(b.id) as bookings,
        COALESCE(SUM(b.amount), 0) as revenue,
        v.rating
      FROM bookings b
      JOIN vendors v ON b.vendor_id = v.id
      WHERE b.user_id IN (
        SELECT DISTINCT b2.user_id 
        FROM bookings b2
        JOIN vendors v2 ON b2.vendor_id = v2.id
        WHERE v2.user_id = $1
      )
      AND b.status = 'completed'
      GROUP BY v.id, v.business_name, v.business_type, v.rating
      ORDER BY bookings DESC, revenue DESC
      LIMIT 10
    `, [coordinatorId]);

    // Client acquisition sources (simplified - all from platform for now)
    const clientAcquisition = [
      { 
        source: 'Platform Referrals', 
        count: parseInt(metrics.rows[0].active_clients || 0), 
        percentage: 100 
      }
    ];

    res.json({
      success: true,
      analytics: {
        metrics: {
          totalRevenue: parseFloat(metrics.rows[0].total_revenue || 0),
          revenueGrowth: 0, // TODO: Calculate growth comparison
          totalWeddings: parseInt(metrics.rows[0].total_weddings || 0),
          weddingsGrowth: 0, // TODO: Calculate growth comparison
          activeClients: parseInt(metrics.rows[0].active_clients || 0),
          clientsGrowth: 0, // TODO: Calculate growth comparison
          avgBookingValue: parseFloat(metrics.rows[0].avg_booking_value || 0),
          bookingValueGrowth: 0 // TODO: Calculate growth comparison
        },
        revenueData: revenueData.rows,
        vendorPerformance: vendorPerformance.rows,
        clientAcquisition
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

**THEN REGISTER IT**:  
**File**: `backend-deploy/routes/coordinator/index.cjs`  
**Add these lines**:

```javascript
// ... existing routes ...
const analyticsRoutes = require('./analytics.cjs');

// ... existing router.use() calls ...
router.use('/analytics', analyticsRoutes);
```

---

## 🚀 DEPLOYMENT INSTRUCTIONS

### 1. Apply Backend Fixes
```powershell
# Navigate to project root
cd c:\Games\WeddingBazaar-web

# Edit backend files:
# - backend-deploy/routes/coordinator/vendor-network.cjs (replace GET route)
# - backend-deploy/routes/coordinator/dashboard.cjs (replace GET /stats route)
# - backend-deploy/routes/coordinator/analytics.cjs (create new file)
# - backend-deploy/routes/coordinator/index.cjs (register analytics route)

# Commit and push
git add backend-deploy/routes/coordinator/
git commit -m "fix: coordinator real data integration - use existing tables"
git push origin main
```
