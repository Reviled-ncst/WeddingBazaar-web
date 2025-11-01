/**
 * Coordinator Vendor Assignment Routes
 * Handles vendor assignment, recommendations, and management
 */

const express = require('express');
const { sql } = require('../../config/database.cjs');
const { authenticateToken } = require('../../middleware/auth.cjs');

const router = express.Router();

/**
 * GET /api/coordinator/weddings/:weddingId/vendors
 * Get all assigned vendors for a wedding
 */
router.get('/weddings/:weddingId/vendors', authenticateToken, async (req, res) => {
  try {
    const { weddingId } = req.params;
    const coordinatorId = req.user.userId;

    // Verify wedding belongs to coordinator
    const wedding = await sql`
      SELECT * FROM coordinator_weddings
      WHERE id = ${weddingId} AND coordinator_id = ${coordinatorId}
    `;

    if (wedding.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wedding not found or access denied' 
      });
    }

    // Get assigned vendors with details
    const vendors = await sql`
      SELECT 
        va.*,
        v.business_name,
        v.business_type,
        v.rating,
        v.total_reviews,
        v.portfolio_images,
        v.specialties,
        v.location
      FROM vendor_assignments va
      JOIN vendors v ON va.vendor_id = v.id
      WHERE va.wedding_id = ${weddingId}
      ORDER BY va.assigned_at DESC
    `;

    // Get stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'declined' THEN 1 END) as declined_count
      FROM vendor_assignments
      WHERE wedding_id = ${weddingId}
    `;

    res.json({ 
      success: true, 
      vendors,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching assigned vendors:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/coordinator/weddings/:weddingId/vendors
 * Assign vendor to wedding
 */
router.post('/weddings/:weddingId/vendors', authenticateToken, async (req, res) => {
  try {
    const { weddingId } = req.params;
    const coordinatorId = req.user.userId;
    const { vendor_id, service_type, notes } = req.body;

    // Verify wedding belongs to coordinator
    const wedding = await sql`
      SELECT * FROM coordinator_weddings
      WHERE id = ${weddingId} AND coordinator_id = ${coordinatorId}
    `;

    if (wedding.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wedding not found or access denied' 
      });
    }

    // Check if vendor exists
    const vendor = await sql`
      SELECT * FROM vendors WHERE id = ${vendor_id}
    `;

    if (vendor.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Vendor not found' 
      });
    }

    // Check for duplicate assignment
    const existing = await sql`
      SELECT * FROM vendor_assignments
      WHERE wedding_id = ${weddingId} 
        AND vendor_id = ${vendor_id}
        AND status != 'declined'
    `;

    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: 'Vendor already assigned to this wedding' 
      });
    }

    // Create assignment
    const assignment = await sql`
      INSERT INTO vendor_assignments (
        wedding_id, vendor_id, service_type, notes, status
      ) VALUES (
        ${weddingId}, ${vendor_id}, ${service_type}, ${notes}, 'pending'
      ) RETURNING *
    `;

    // Log activity
    await sql`
      INSERT INTO coordinator_activity_log (
        coordinator_id, wedding_id, activity_type, description
      ) VALUES (
        ${coordinatorId}, ${weddingId}, 'vendor_assigned',
        'Assigned vendor: ' || ${vendor[0].business_name} || ' (' || ${service_type} || ')'
      )
    `;

    res.json({ 
      success: true, 
      assignment: assignment[0],
      vendor: vendor[0],
      message: 'Vendor assigned successfully' 
    });
  } catch (error) {
    console.error('Error assigning vendor:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * PUT /api/coordinator/assignments/:assignmentId/status
 * Update vendor assignment status
 */
router.put('/assignments/:assignmentId/status', authenticateToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const coordinatorId = req.user.userId;
    const { status, notes } = req.body;

    // Verify assignment belongs to coordinator's wedding
    const assignment = await sql`
      SELECT va.*, cw.coordinator_id, v.business_name
      FROM vendor_assignments va
      JOIN coordinator_weddings cw ON va.wedding_id = cw.id
      JOIN vendors v ON va.vendor_id = v.id
      WHERE va.id = ${assignmentId} AND cw.coordinator_id = ${coordinatorId}
    `;

    if (assignment.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Assignment not found or access denied' 
      });
    }

    // Update assignment
    const updated = await sql`
      UPDATE vendor_assignments
      SET 
        status = ${status},
        notes = COALESCE(${notes}, notes),
        updated_at = NOW()
      WHERE id = ${assignmentId}
      RETURNING *
    `;

    // Log activity
    await sql`
      INSERT INTO coordinator_activity_log (
        coordinator_id, wedding_id, activity_type, description
      ) VALUES (
        ${coordinatorId}, ${assignment[0].wedding_id}, 'vendor_status_updated',
        'Vendor ' || ${assignment[0].business_name} || ' status: ' || ${status}
      )
    `;

    res.json({ 
      success: true, 
      assignment: updated[0],
      message: 'Assignment status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * DELETE /api/coordinator/assignments/:assignmentId
 * Remove vendor assignment
 */
router.delete('/assignments/:assignmentId', authenticateToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const coordinatorId = req.user.userId;

    // Verify assignment belongs to coordinator's wedding
    const assignment = await sql`
      SELECT va.*, cw.coordinator_id, v.business_name
      FROM vendor_assignments va
      JOIN coordinator_weddings cw ON va.wedding_id = cw.id
      JOIN vendors v ON va.vendor_id = v.id
      WHERE va.id = ${assignmentId} AND cw.coordinator_id = ${coordinatorId}
    `;

    if (assignment.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Assignment not found or access denied' 
      });
    }

    // Delete assignment
    await sql`
      DELETE FROM vendor_assignments
      WHERE id = ${assignmentId}
    `;

    // Log activity
    await sql`
      INSERT INTO coordinator_activity_log (
        coordinator_id, wedding_id, activity_type, description
      ) VALUES (
        ${coordinatorId}, ${assignment[0].wedding_id}, 'vendor_removed',
        'Removed vendor: ' || ${assignment[0].business_name}
      )
    `;

    res.json({ 
      success: true, 
      message: 'Vendor assignment removed successfully' 
    });
  } catch (error) {
    console.error('Error removing vendor assignment:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/coordinator/vendor-recommendations
 * Get recommended vendors based on wedding requirements
 */
router.get('/vendor-recommendations', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.userId;
    const { wedding_id, service_type, budget_min, budget_max, location } = req.query;

    // Build filters
    let filters = [];
    let params = [];

    if (service_type) {
      filters.push(`v.business_type = $${params.length + 1}`);
      params.push(service_type);
    }

    if (location) {
      filters.push(`v.location ILIKE $${params.length + 1}`);
      params.push(`%${location}%`);
    }

    // Get vendors with matching criteria
    const query = `
      SELECT 
        v.*,
        COALESCE(AVG(s.base_price), 0) as avg_price,
        COUNT(DISTINCT va.id) as coordinator_bookings
      FROM vendors v
      LEFT JOIN services s ON v.id = s.vendor_id AND s.is_active = true
      LEFT JOIN vendor_assignments va ON v.id = va.vendor_id
      ${filters.length > 0 ? 'WHERE ' + filters.join(' AND ') : ''}
      GROUP BY v.id
      HAVING v.rating >= 4.0
      ORDER BY v.rating DESC, coordinator_bookings DESC
      LIMIT 20
    `;

    const vendors = await sql.unsafe(query, params);

    // Filter by budget if specified
    let filteredVendors = vendors;
    if (budget_min || budget_max) {
      filteredVendors = vendors.filter(v => {
        const price = parseFloat(v.avg_price) || 0;
        if (budget_min && price < parseFloat(budget_min)) return false;
        if (budget_max && price > parseFloat(budget_max)) return false;
        return true;
      });
    }

    res.json({ 
      success: true, 
      vendors: filteredVendors,
      total: filteredVendors.length
    });
  } catch (error) {
    console.error('Error fetching vendor recommendations:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
