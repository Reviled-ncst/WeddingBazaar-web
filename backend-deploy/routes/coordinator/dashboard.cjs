/**
 * Coordinator Dashboard Routes
 * Provides statistics and analytics for coordinator dashboard
 * 
 * Endpoints:
 * - GET /api/coordinator/dashboard/stats     - Get dashboard statistics
 * - GET /api/coordinator/dashboard/recent    - Get recent activity
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('@neondatabase/serverless');
const { authenticateToken } = require('../../middleware/auth.cjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/coordinator/dashboard/stats
 * Get comprehensive dashboard statistics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id;

    // Get wedding statistics
    const weddingStats = await pool.query(`
      SELECT 
        COUNT(*) as total_weddings,
        COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning_count,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
        COALESCE(SUM(budget), 0) as total_budget,
        COALESCE(SUM(spent), 0) as total_spent,
        COALESCE(AVG(progress), 0) as average_progress
      FROM coordinator_weddings
      WHERE coordinator_id = $1
    `, [coordinatorId]);

    // Get commission statistics
    const commissionStats = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_earnings,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_earnings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count
      FROM coordinator_commissions
      WHERE coordinator_id = $1
    `, [coordinatorId]);

    // Get client statistics
    const clientStats = await pool.query(`
      SELECT 
        COUNT(*) as total_clients,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_clients,
        COUNT(CASE WHEN status = 'lead' THEN 1 END) as leads,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_clients
      FROM coordinator_clients
      WHERE coordinator_id = $1
    `, [coordinatorId]);

    // Get vendor network statistics
    const vendorStats = await pool.query(`
      SELECT 
        COUNT(*) as network_size,
        COUNT(CASE WHEN is_preferred THEN 1 END) as preferred_vendors,
        COALESCE(SUM(total_bookings), 0) as total_vendor_bookings,
        COALESCE(SUM(total_revenue), 0) as total_vendor_revenue
      FROM coordinator_vendors
      WHERE coordinator_id = $1
    `, [coordinatorId]);

    // Get upcoming weddings (next 30 days)
    const upcomingWeddings = await pool.query(`
      SELECT id, couple_name, wedding_date, venue, status
      FROM coordinator_weddings
      WHERE coordinator_id = $1
        AND wedding_date >= CURRENT_DATE
        AND wedding_date <= CURRENT_DATE + INTERVAL '30 days'
        AND status NOT IN ('completed', 'cancelled')
      ORDER BY wedding_date ASC
      LIMIT 5
    `, [coordinatorId]);

    res.json({
      success: true,
      stats: {
        weddings: weddingStats.rows[0],
        commissions: commissionStats.rows[0],
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
      error: error.message || 'Failed to fetch dashboard statistics'
    });
  }
});

/**
 * GET /api/coordinator/dashboard/recent
 * Get recent activity for the coordinator
 */
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(`
      SELECT 
        cal.*,
        cw.couple_name,
        cw.wedding_date
      FROM coordinator_activity_log cal
      LEFT JOIN coordinator_weddings cw ON cal.wedding_id = cw.id
      WHERE cal.coordinator_id = $1
      ORDER BY cal.created_at DESC
      LIMIT $2
    `, [coordinatorId, limit]);

    res.json({
      success: true,
      activities: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch recent activity'
    });
  }
});

module.exports = router;
