/**
 * Coordinator Vendor Network Routes
 * Handles preferred vendors, network building, and vendor relationships
 */

const express = require('express');
const { sql } = require('../../config/database.cjs');
const { authenticateToken } = require('../../middleware/auth.cjs');

const router = express.Router();

/**
 * GET /api/coordinator/vendor-network
 * Get coordinator's vendor network
 */
router.get('/vendor-network', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.userId;
    const { category, rating_min, search } = req.query;

    // Build filters
    let filters = [`cvn.coordinator_id = ${coordinatorId}`];
    
    if (category) {
      filters.push(`v.business_type = '${category}'`);
    }

    if (rating_min) {
      filters.push(`cvn.coordinator_rating >= ${parseFloat(rating_min)}`);
    }

    if (search) {
      filters.push(`v.business_name ILIKE '%${search}%'`);
    }

    const whereClause = filters.join(' AND ');

    // Get network vendors with stats
    const vendors = await sql.unsafe(`
      SELECT 
        cvn.*,
        v.business_name,
        v.business_type,
        v.rating as platform_rating,
        v.total_reviews,
        v.location,
        v.specialties,
        v.portfolio_images,
        v.years_experience,
        COUNT(DISTINCT va.id) as total_bookings,
        COUNT(DISTINCT CASE WHEN va.status = 'confirmed' THEN va.id END) as confirmed_bookings,
        AVG(CASE WHEN va.status = 'confirmed' THEN 5 ELSE NULL END) as performance_score
      FROM coordinator_vendor_network cvn
      JOIN vendors v ON cvn.vendor_id = v.id
      LEFT JOIN vendor_assignments va ON v.id = va.vendor_id
      WHERE ${whereClause}
      GROUP BY cvn.id, v.id, v.business_name, v.business_type, v.rating, 
               v.total_reviews, v.location, v.specialties, v.portfolio_images, 
               v.years_experience
      ORDER BY cvn.is_preferred DESC, cvn.coordinator_rating DESC
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

/**
 * POST /api/coordinator/vendor-network
 * Add vendor to network
 */
router.post('/vendor-network', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.userId;
    const { 
      vendor_id, 
      is_preferred = false, 
      coordinator_rating = 0,
      private_notes 
    } = req.body;

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

    // Check if already in network
    const existing = await sql`
      SELECT * FROM coordinator_vendor_network
      WHERE coordinator_id = ${coordinatorId} AND vendor_id = ${vendor_id}
    `;

    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: 'Vendor already in your network' 
      });
    }

    // Add to network
    const networkEntry = await sql`
      INSERT INTO coordinator_vendor_network (
        coordinator_id, vendor_id, is_preferred, 
        coordinator_rating, private_notes
      ) VALUES (
        ${coordinatorId}, ${vendor_id}, ${is_preferred}, 
        ${coordinator_rating}, ${private_notes}
      ) RETURNING *
    `;

    res.json({ 
      success: true, 
      network_entry: networkEntry[0],
      vendor: vendor[0],
      message: 'Vendor added to network successfully' 
    });
  } catch (error) {
    console.error('Error adding vendor to network:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * PUT /api/coordinator/vendor-network/:networkId
 * Update vendor network entry
 */
router.put('/vendor-network/:networkId', authenticateToken, async (req, res) => {
  try {
    const { networkId } = req.params;
    const coordinatorId = req.user.userId;
    const { 
      is_preferred, 
      coordinator_rating, 
      private_notes 
    } = req.body;

    // Verify network entry belongs to coordinator
    const entry = await sql`
      SELECT * FROM coordinator_vendor_network
      WHERE id = ${networkId} AND coordinator_id = ${coordinatorId}
    `;

    if (entry.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Network entry not found or access denied' 
      });
    }

    // Build update object
    const updates = { updated_at: new Date() };
    if (is_preferred !== undefined) updates.is_preferred = is_preferred;
    if (coordinator_rating !== undefined) updates.coordinator_rating = coordinator_rating;
    if (private_notes !== undefined) updates.private_notes = private_notes;

    // Update entry
    const updated = await sql`
      UPDATE coordinator_vendor_network
      SET ${sql(updates)}
      WHERE id = ${networkId}
      RETURNING *
    `;

    res.json({ 
      success: true, 
      network_entry: updated[0],
      message: 'Network entry updated successfully' 
    });
  } catch (error) {
    console.error('Error updating network entry:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * DELETE /api/coordinator/vendor-network/:networkId
 * Remove vendor from network
 */
router.delete('/vendor-network/:networkId', authenticateToken, async (req, res) => {
  try {
    const { networkId } = req.params;
    const coordinatorId = req.user.userId;

    // Verify network entry belongs to coordinator
    const entry = await sql`
      SELECT * FROM coordinator_vendor_network
      WHERE id = ${networkId} AND coordinator_id = ${coordinatorId}
    `;

    if (entry.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Network entry not found or access denied' 
      });
    }

    // Delete entry
    await sql`
      DELETE FROM coordinator_vendor_network
      WHERE id = ${networkId}
    `;

    res.json({ 
      success: true, 
      message: 'Vendor removed from network successfully' 
    });
  } catch (error) {
    console.error('Error removing vendor from network:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/coordinator/vendor-network/:networkId/performance
 * Get vendor performance metrics
 */
router.get('/vendor-network/:networkId/performance', authenticateToken, async (req, res) => {
  try {
    const { networkId } = req.params;
    const coordinatorId = req.user.userId;

    // Verify network entry belongs to coordinator
    const entry = await sql`
      SELECT * FROM coordinator_vendor_network
      WHERE id = ${networkId} AND coordinator_id = ${coordinatorId}
    `;

    if (entry.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Network entry not found or access denied' 
      });
    }

    // Get performance metrics
    const performance = await sql`
      SELECT 
        COUNT(*) as total_assignments,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN status = 'declined' THEN 1 END) as declined_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        ROUND(COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::NUMERIC / 
              NULLIF(COUNT(*)::NUMERIC, 0) * 100, 2) as confirmation_rate
      FROM vendor_assignments va
      JOIN coordinator_weddings cw ON va.wedding_id = cw.id
      WHERE va.vendor_id = ${entry[0].vendor_id}
        AND cw.coordinator_id = ${coordinatorId}
    `;

    // Get recent assignments
    const recentAssignments = await sql`
      SELECT 
        va.*,
        cw.couple_names,
        cw.event_date
      FROM vendor_assignments va
      JOIN coordinator_weddings cw ON va.wedding_id = cw.id
      WHERE va.vendor_id = ${entry[0].vendor_id}
        AND cw.coordinator_id = ${coordinatorId}
      ORDER BY va.assigned_at DESC
      LIMIT 10
    `;

    res.json({ 
      success: true, 
      performance: performance[0],
      recent_assignments: recentAssignments
    });
  } catch (error) {
    console.error('Error fetching vendor performance:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/coordinator/vendor-network/preferred
 * Get only preferred vendors
 */
router.get('/vendor-network/preferred', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.userId;

    const preferredVendors = await sql`
      SELECT 
        cvn.*,
        v.business_name,
        v.business_type,
        v.rating,
        v.location,
        v.specialties
      FROM coordinator_vendor_network cvn
      JOIN vendors v ON cvn.vendor_id = v.id
      WHERE cvn.coordinator_id = ${coordinatorId}
        AND cvn.is_preferred = true
      ORDER BY v.business_type, v.business_name
    `;

    res.json({ 
      success: true, 
      vendors: preferredVendors
    });
  } catch (error) {
    console.error('Error fetching preferred vendors:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
