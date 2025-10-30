const express = require('express');
const router = express.Router();
const { Pool } = require('@neondatabase/serverless');
const { authenticateToken } = require('../middleware/auth.cjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ============================================================================
// WEDDING MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * GET /api/coordinator/weddings
 * Get all weddings for a coordinator
 */
router.get('/weddings', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        w.*,
        COUNT(DISTINCT wv.id) as vendors_booked,
        COUNT(DISTINCT wm.id) as milestones_completed
      FROM coordinator_weddings w
      LEFT JOIN wedding_vendors wv ON w.id = wv.wedding_id
      LEFT JOIN wedding_milestones wm ON w.id = wm.wedding_id AND wm.completed = true
      WHERE w.coordinator_id = $1
      GROUP BY w.id
      ORDER BY w.wedding_date ASC
    `, [coordinatorId]);

    res.json({
      success: true,
      weddings: result.rows
    });
  } catch (error) {
    console.error('Error fetching coordinator weddings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weddings'
    });
  }
});

/**
 * GET /api/coordinator/weddings/:id
 * Get single wedding details
 */
router.get('/weddings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorId = req.user.id;

    const result = await pool.query(`
      SELECT w.*,
        json_agg(DISTINCT jsonb_build_object(
          'id', wv.id,
          'vendor_id', wv.vendor_id,
          'vendor_name', v.business_name,
          'category', v.business_type,
          'status', wv.status,
          'amount', wv.amount
        )) FILTER (WHERE wv.id IS NOT NULL) as vendors,
        json_agg(DISTINCT jsonb_build_object(
          'id', wm.id,
          'title', wm.title,
          'due_date', wm.due_date,
          'completed', wm.completed
        )) FILTER (WHERE wm.id IS NOT NULL) as milestones
      FROM coordinator_weddings w
      LEFT JOIN wedding_vendors wv ON w.id = wv.wedding_id
      LEFT JOIN vendors v ON wv.vendor_id = v.id
      LEFT JOIN wedding_milestones wm ON w.id = wm.wedding_id
      WHERE w.id = $1 AND w.coordinator_id = $2
      GROUP BY w.id
    `, [id, coordinatorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wedding not found'
      });
    }

    res.json({
      success: true,
      wedding: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching wedding details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wedding details'
    });
  }
});

/**
 * POST /api/coordinator/weddings
 * Create new wedding
 */
router.post('/weddings', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const {
      couple_name,
      couple_email,
      couple_phone,
      wedding_date,
      venue,
      venue_address,
      budget,
      guest_count,
      preferred_style,
      notes
    } = req.body;

    // Validate required fields
    if (!couple_name || !wedding_date || !venue) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: couple_name, wedding_date, venue'
      });
    }

    const result = await pool.query(`
      INSERT INTO coordinator_weddings (
        coordinator_id, couple_name, couple_email, couple_phone,
        wedding_date, venue, venue_address, budget, guest_count,
        preferred_style, notes, status, progress
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'planning', 0)
      RETURNING *
    `, [
      coordinatorId, couple_name, couple_email, couple_phone,
      wedding_date, venue, venue_address, budget, guest_count,
      preferred_style, notes
    ]);

    res.status(201).json({
      success: true,
      message: 'Wedding created successfully',
      wedding: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating wedding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create wedding'
    });
  }
});

/**
 * PUT /api/coordinator/weddings/:id
 * Update wedding details
 */
router.put('/weddings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorId = req.user.id;
    const updates = req.body;

    // Build dynamic update query
    const allowedFields = [
      'couple_name', 'couple_email', 'couple_phone', 'wedding_date',
      'venue', 'venue_address', 'budget', 'spent', 'guest_count',
      'preferred_style', 'notes', 'status', 'progress'
    ];

    const setClause = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    values.push(id, coordinatorId);
    const result = await pool.query(`
      UPDATE coordinator_weddings
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount} AND coordinator_id = $${paramCount + 1}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wedding not found'
      });
    }

    res.json({
      success: true,
      message: 'Wedding updated successfully',
      wedding: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating wedding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update wedding'
    });
  }
});

/**
 * DELETE /api/coordinator/weddings/:id
 * Delete wedding
 */
router.delete('/weddings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorId = req.user.id;

    const result = await pool.query(`
      DELETE FROM coordinator_weddings
      WHERE id = $1 AND coordinator_id = $2
      RETURNING id
    `, [id, coordinatorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wedding not found'
      });
    }

    res.json({
      success: true,
      message: 'Wedding deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting wedding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete wedding'
    });
  }
});

// ============================================================================
// VENDOR NETWORK ENDPOINTS
// ============================================================================

/**
 * GET /api/coordinator/vendors
 * Get coordinator's vendor network
 */
router.get('/vendors', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id;

    const result = await pool.query(`
      SELECT 
        v.*,
        cv.is_preferred,
        cv.total_bookings,
        cv.total_revenue,
        cv.last_worked_with,
        cv.notes as coordinator_notes
      FROM coordinator_vendors cv
      JOIN vendors v ON cv.vendor_id = v.id
      WHERE cv.coordinator_id = $1
      ORDER BY cv.is_preferred DESC, v.rating DESC
    `, [coordinatorId]);

    res.json({
      success: true,
      vendors: result.rows
    });
  } catch (error) {
    console.error('Error fetching coordinator vendors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendors'
    });
  }
});

/**
 * POST /api/coordinator/vendors
 * Add vendor to network
 */
router.post('/vendors', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { vendor_id, is_preferred, notes } = req.body;

    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        error: 'vendor_id is required'
      });
    }

    // Check if vendor exists
    const vendorCheck = await pool.query(
      'SELECT id FROM vendors WHERE id = $1',
      [vendor_id]
    );

    if (vendorCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    // Check if already in network
    const existingCheck = await pool.query(
      'SELECT id FROM coordinator_vendors WHERE coordinator_id = $1 AND vendor_id = $2',
      [coordinatorId, vendor_id]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Vendor already in your network'
      });
    }

    const result = await pool.query(`
      INSERT INTO coordinator_vendors (coordinator_id, vendor_id, is_preferred, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [coordinatorId, vendor_id, is_preferred || false, notes]);

    res.status(201).json({
      success: true,
      message: 'Vendor added to network',
      vendor: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding vendor to network:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add vendor'
    });
  }
});

/**
 * PUT /api/coordinator/vendors/:vendorId
 * Update vendor in network
 */
router.put('/vendors/:vendorId', authenticateToken, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const coordinatorId = req.user.id;
    const { is_preferred, notes, total_bookings, total_revenue } = req.body;

    const result = await pool.query(`
      UPDATE coordinator_vendors
      SET 
        is_preferred = COALESCE($1, is_preferred),
        notes = COALESCE($2, notes),
        total_bookings = COALESCE($3, total_bookings),
        total_revenue = COALESCE($4, total_revenue),
        updated_at = NOW()
      WHERE coordinator_id = $5 AND vendor_id = $6
      RETURNING *
    `, [is_preferred, notes, total_bookings, total_revenue, coordinatorId, vendorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not in your network'
      });
    }

    res.json({
      success: true,
      message: 'Vendor updated successfully',
      vendor: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update vendor'
    });
  }
});

/**
 * DELETE /api/coordinator/vendors/:vendorId
 * Remove vendor from network
 */
router.delete('/vendors/:vendorId', authenticateToken, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const coordinatorId = req.user.id;

    const result = await pool.query(`
      DELETE FROM coordinator_vendors
      WHERE coordinator_id = $1 AND vendor_id = $2
      RETURNING id
    `, [coordinatorId, vendorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not in your network'
      });
    }

    res.json({
      success: true,
      message: 'Vendor removed from network'
    });
  } catch (error) {
    console.error('Error removing vendor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove vendor'
    });
  }
});

// ============================================================================
// CLIENT MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * GET /api/coordinator/clients
 * Get all clients (same as weddings but client-focused view)
 */
router.get('/clients', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id;

    const result = await pool.query(`
      SELECT 
        w.id,
        w.couple_name,
        w.couple_email,
        w.couple_phone,
        w.wedding_date,
        w.venue,
        w.budget,
        w.spent,
        w.guest_count,
        w.preferred_style,
        w.notes,
        w.status,
        w.progress,
        w.created_at,
        w.updated_at,
        COUNT(DISTINCT wv.id) as vendors_booked,
        (SELECT COUNT(*) FROM wedding_milestones WHERE wedding_id = w.id) as total_milestones,
        (SELECT COUNT(*) FROM wedding_milestones WHERE wedding_id = w.id AND completed = true) as completed_milestones
      FROM coordinator_weddings w
      LEFT JOIN wedding_vendors wv ON w.id = wv.wedding_id
      WHERE w.coordinator_id = $1
      GROUP BY w.id
      ORDER BY w.wedding_date ASC
    `, [coordinatorId]);

    res.json({
      success: true,
      clients: result.rows
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clients'
    });
  }
});

/**
 * GET /api/coordinator/clients/:id
 * Get single client details
 */
router.get('/clients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorId = req.user.id;

    const result = await pool.query(`
      SELECT w.*,
        json_agg(DISTINCT jsonb_build_object(
          'id', cn.id,
          'note', cn.note,
          'created_at', cn.created_at
        )) FILTER (WHERE cn.id IS NOT NULL) as notes_history
      FROM coordinator_weddings w
      LEFT JOIN coordinator_notes cn ON w.id = cn.wedding_id
      WHERE w.id = $1 AND w.coordinator_id = $2
      GROUP BY w.id
    `, [id, coordinatorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      client: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching client details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client details'
    });
  }
});

// ============================================================================
// STATISTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/coordinator/stats
 * Get coordinator dashboard statistics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id;

    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status IN ('planning', 'confirmed', 'in-progress')) as active_weddings,
        COUNT(*) FILTER (WHERE wedding_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') as upcoming_events,
        COALESCE(SUM(spent), 0) as total_revenue,
        COALESCE(AVG(progress), 0) as average_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_weddings
      FROM coordinator_weddings
      WHERE coordinator_id = $1
    `, [coordinatorId]);

    const vendorStats = await pool.query(`
      SELECT COUNT(*) as total_vendors,
             COUNT(*) FILTER (WHERE is_preferred = true) as preferred_vendors
      FROM coordinator_vendors
      WHERE coordinator_id = $1
    `, [coordinatorId]);

    res.json({
      success: true,
      stats: {
        ...stats.rows[0],
        ...vendorStats.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
