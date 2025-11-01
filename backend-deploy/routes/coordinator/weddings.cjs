/**
 * Coordinator Wedding Management Routes
 * Handles all wedding-related operations for coordinators
 * 
 * Endpoints:
 * - POST   /api/coordinator/weddings              - Create new wedding
 * - GET    /api/coordinator/weddings              - Get all weddings
 * - GET    /api/coordinator/weddings/:id          - Get wedding details
 * - PUT    /api/coordinator/weddings/:id          - Update wedding
 * - DELETE /api/coordinator/weddings/:id          - Delete wedding
 * - GET    /api/coordinator/weddings/:id/summary  - Get wedding summary
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('@neondatabase/serverless');
const { authenticateToken } = require('../../middleware/auth.cjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * POST /api/coordinator/weddings
 * Create a new wedding
 */
router.post('/', authenticateToken, async (req, res) => {
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
    if (!couple_name || !wedding_date) {
      return res.status(400).json({
        success: false,
        error: 'couple_name and wedding_date are required'
      });
    }

    // Create wedding
    const result = await pool.query(`
      INSERT INTO coordinator_weddings (
        coordinator_id, couple_name, couple_email, couple_phone,
        wedding_date, venue, venue_address, budget, guest_count,
        preferred_style, notes, status, progress, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'planning', 0, NOW(), NOW())
      RETURNING *
    `, [
      coordinatorId, couple_name, couple_email, couple_phone,
      wedding_date, venue, venue_address, budget, guest_count,
      preferred_style, notes
    ]);

    const wedding = result.rows[0];

    // Create default milestones
    const defaultMilestones = [
      { title: 'Venue Deposit Paid', days_from_now: 7 },
      { title: 'Caterer Confirmed', days_from_now: 14 },
      { title: 'Photographer Booked', days_from_now: 21 },
      { title: 'Save the Dates Sent', days_from_now: 30 },
      { title: 'Final Headcount', days_from_wedding: -14 }
    ];

    for (const milestone of defaultMilestones) {
      let dueDate;
      if (milestone.days_from_now) {
        dueDate = new Date(Date.now() + milestone.days_from_now * 24 * 60 * 60 * 1000);
      } else {
        dueDate = new Date(new Date(wedding_date).getTime() + milestone.days_from_wedding * 24 * 60 * 60 * 1000);
      }

      await pool.query(`
        INSERT INTO wedding_milestones (wedding_id, title, due_date, completed, created_at, updated_at)
        VALUES ($1, $2, $3, false, NOW(), NOW())
      `, [wedding.id, milestone.title, dueDate]);
    }

    // Create client record
    await pool.query(`
      INSERT INTO coordinator_clients (
        coordinator_id, wedding_id, couple_name, email, phone, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'active', NOW(), NOW())
    `, [coordinatorId, wedding.id, couple_name, couple_email, couple_phone]);

    // Log activity
    await pool.query(`
      INSERT INTO coordinator_activity_log (
        coordinator_id, wedding_id, activity_type, description, created_at
      ) VALUES ($1, $2, 'wedding_created', $3, NOW())
    `, [coordinatorId, wedding.id, `Created new wedding for ${couple_name}`]);

    console.log(`✅ Wedding created: ${wedding.id} for coordinator: ${coordinatorId}`);

    res.json({
      success: true,
      wedding,
      message: 'Wedding created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating wedding:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create wedding'
    });
  }
});

/**
 * GET /api/coordinator/weddings
 * Get all weddings for the coordinator
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT 
        w.*,
        COUNT(DISTINCT wv.id) as vendors_count,
        COUNT(DISTINCT wm.id) as milestones_total,
        COUNT(DISTINCT CASE WHEN wm.completed THEN wm.id END) as milestones_completed
      FROM coordinator_weddings w
      LEFT JOIN wedding_vendors wv ON w.id = wv.wedding_id
      LEFT JOIN wedding_milestones wm ON w.id = wm.wedding_id
      WHERE w.coordinator_id = $1
    `;

    const params = [coordinatorId];

    if (status) {
      query += ` AND w.status = $2`;
      params.push(status);
    }

    query += ` GROUP BY w.id ORDER BY w.wedding_date ASC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      weddings: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching weddings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch weddings'
    });
  }
});

/**
 * GET /api/coordinator/weddings/:id
 * Get detailed wedding information
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorId = req.user.id;

    // Get wedding details
    const weddingResult = await pool.query(`
      SELECT * FROM coordinator_weddings
      WHERE id = $1 AND coordinator_id = $2
    `, [id, coordinatorId]);

    if (weddingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wedding not found or access denied'
      });
    }

    const wedding = weddingResult.rows[0];

    // Get assigned vendors
    const vendorsResult = await pool.query(`
      SELECT 
        wv.*,
        vp.business_name,
        vp.business_type,
        vp.average_rating
      FROM wedding_vendors wv
      LEFT JOIN vendor_profiles vp ON wv.vendor_id = vp.user_id
      WHERE wv.wedding_id = $1
      ORDER BY wv.created_at DESC
    `, [id]);

    // Get milestones
    const milestonesResult = await pool.query(`
      SELECT * FROM wedding_milestones
      WHERE wedding_id = $1
      ORDER BY due_date ASC
    `, [id]);

    res.json({
      success: true,
      wedding: {
        ...wedding,
        vendors: vendorsResult.rows,
        milestones: milestonesResult.rows
      }
    });
  } catch (error) {
    console.error('❌ Error fetching wedding details:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch wedding details'
    });
  }
});

/**
 * PUT /api/coordinator/weddings/:id
 * Update wedding information
 */
router.put('/:id', authenticateToken, async (req, res) => {
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

    const updateFields = [];
    const values = [id, coordinatorId];
    let paramCounter = 3;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updateFields.push(`updated_at = NOW()`);

    const query = `
      UPDATE coordinator_weddings
      SET ${updateFields.join(', ')}
      WHERE id = $1 AND coordinator_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wedding not found or access denied'
      });
    }

    // Log activity
    await pool.query(`
      INSERT INTO coordinator_activity_log (
        coordinator_id, wedding_id, activity_type, description, created_at
      ) VALUES ($1, $2, 'wedding_updated', 'Updated wedding details', NOW())
    `, [coordinatorId, id]);

    res.json({
      success: true,
      wedding: result.rows[0],
      message: 'Wedding updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating wedding:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update wedding'
    });
  }
});

/**
 * DELETE /api/coordinator/weddings/:id
 * Delete a wedding (cascades to related records)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorId = req.user.id;

    const result = await pool.query(`
      DELETE FROM coordinator_weddings
      WHERE id = $1 AND coordinator_id = $2
      RETURNING id, couple_name
    `, [id, coordinatorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wedding not found or access denied'
      });
    }

    res.json({
      success: true,
      message: `Wedding for ${result.rows[0].couple_name} deleted successfully`
    });
  } catch (error) {
    console.error('❌ Error deleting wedding:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete wedding'
    });
  }
});

/**
 * GET /api/coordinator/weddings/:id/summary
 * Get wedding summary with statistics
 */
router.get('/:id/summary', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorId = req.user.id;

    // Get wedding with aggregated stats
    const result = await pool.query(`
      SELECT 
        w.*,
        COUNT(DISTINCT wv.id) as total_vendors,
        COUNT(DISTINCT CASE WHEN wv.status = 'confirmed' THEN wv.id END) as confirmed_vendors,
        COUNT(DISTINCT wm.id) as total_milestones,
        COUNT(DISTINCT CASE WHEN wm.completed THEN wm.id END) as completed_milestones,
        COALESCE(SUM(wv.amount), 0) as total_vendor_cost
      FROM coordinator_weddings w
      LEFT JOIN wedding_vendors wv ON w.id = wv.wedding_id
      LEFT JOIN wedding_milestones wm ON w.id = wm.wedding_id
      WHERE w.id = $1 AND w.coordinator_id = $2
      GROUP BY w.id
    `, [id, coordinatorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wedding not found or access denied'
      });
    }

    res.json({
      success: true,
      summary: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error fetching wedding summary:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch wedding summary'
    });
  }
});

module.exports = router;
