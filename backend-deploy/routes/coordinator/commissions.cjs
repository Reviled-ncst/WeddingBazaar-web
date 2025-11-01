/**
 * Coordinator Commissions Management Routes
 * Handles commission tracking, earnings, and financial reports
 */

const express = require('express');
const { sql } = require('../../config/database.cjs');
const { authenticateToken } = require('../../middleware/auth.cjs');

const router = express.Router();

/**
 * GET /api/coordinator/commissions
 * Get commission history
 */
router.get('/commissions', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.userId;
    const { 
      status, 
      start_date, 
      end_date, 
      limit = 50, 
      offset = 0 
    } = req.query;

    // Build filters
    let filters = [`cc.coordinator_id = ${coordinatorId}`];
    
    if (status) {
      filters.push(`cc.status = '${status}'`);
    }

    if (start_date) {
      filters.push(`cc.created_at >= '${start_date}'`);
    }

    if (end_date) {
      filters.push(`cc.created_at <= '${end_date}'`);
    }

    const whereClause = filters.join(' AND ');

    // Get commissions with details
    const commissions = await sql.unsafe(`
      SELECT 
        cc.*,
        cw.couple_names,
        cw.event_date,
        v.business_name as vendor_name,
        v.business_type as service_type
      FROM coordinator_commissions cc
      LEFT JOIN coordinator_weddings cw ON cc.wedding_id = cw.id
      LEFT JOIN vendors v ON cc.vendor_id = v.id
      WHERE ${whereClause}
      ORDER BY cc.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Get total count
    const countResult = await sql.unsafe(`
      SELECT COUNT(*) as total
      FROM coordinator_commissions cc
      WHERE ${whereClause}
    `);

    res.json({ 
      success: true, 
      commissions,
      pagination: {
        total: parseInt(countResult[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/coordinator/commissions/summary
 * Get commission summary and statistics
 */
router.get('/commissions/summary', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.userId;

    // Get overall summary
    const summary = await sql`
      SELECT 
        COUNT(*) as total_commissions,
        SUM(amount) as total_earned,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
        SUM(CASE WHEN status = 'processing' THEN amount ELSE 0 END) as total_processing,
        AVG(amount) as average_commission
      FROM coordinator_commissions
      WHERE coordinator_id = ${coordinatorId}
    `;

    // Get monthly breakdown (last 12 months)
    const monthlyBreakdown = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as commission_count,
        SUM(amount) as total_amount,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount
      FROM coordinator_commissions
      WHERE coordinator_id = ${coordinatorId}
        AND created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `;

    // Get commission by service type
    const byServiceType = await sql`
      SELECT 
        v.business_type as service_type,
        COUNT(*) as commission_count,
        SUM(cc.amount) as total_amount
      FROM coordinator_commissions cc
      LEFT JOIN vendors v ON cc.vendor_id = v.id
      WHERE cc.coordinator_id = ${coordinatorId}
      GROUP BY v.business_type
      ORDER BY total_amount DESC
    `;

    res.json({ 
      success: true, 
      summary: summary[0],
      monthly_breakdown: monthlyBreakdown,
      by_service_type: byServiceType
    });
  } catch (error) {
    console.error('Error fetching commission summary:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/coordinator/commissions
 * Record a new commission (typically auto-created by system)
 */
router.post('/commissions', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.userId;
    const { 
      wedding_id, 
      vendor_id, 
      amount, 
      commission_type = 'booking',
      percentage,
      description 
    } = req.body;

    // Verify wedding belongs to coordinator
    if (wedding_id) {
      const wedding = await sql`
        SELECT * FROM coordinator_weddings
        WHERE id = ${wedding_id} AND coordinator_id = ${coordinatorId}
      `;

      if (wedding.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Wedding not found or access denied' 
        });
      }
    }

    // Create commission record
    const commission = await sql`
      INSERT INTO coordinator_commissions (
        coordinator_id, wedding_id, vendor_id, amount, 
        commission_type, percentage, description, status
      ) VALUES (
        ${coordinatorId}, ${wedding_id}, ${vendor_id}, ${amount}, 
        ${commission_type}, ${percentage}, ${description}, 'pending'
      ) RETURNING *
    `;

    res.json({ 
      success: true, 
      commission: commission[0],
      message: 'Commission recorded successfully' 
    });
  } catch (error) {
    console.error('Error recording commission:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * PUT /api/coordinator/commissions/:commissionId/status
 * Update commission status (typically by admin)
 */
router.put('/commissions/:commissionId/status', authenticateToken, async (req, res) => {
  try {
    const { commissionId } = req.params;
    const coordinatorId = req.user.userId;
    const { status, payment_reference } = req.body;

    // Verify commission belongs to coordinator
    const commission = await sql`
      SELECT * FROM coordinator_commissions
      WHERE id = ${commissionId} AND coordinator_id = ${coordinatorId}
    `;

    if (commission.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Commission not found or access denied' 
      });
    }

    // Update status
    const updates = { 
      status, 
      updated_at: new Date() 
    };

    if (status === 'paid') {
      updates.paid_at = new Date();
      if (payment_reference) {
        updates.payment_reference = payment_reference;
      }
    }

    const updated = await sql`
      UPDATE coordinator_commissions
      SET ${sql(updates)}
      WHERE id = ${commissionId}
      RETURNING *
    `;

    res.json({ 
      success: true, 
      commission: updated[0],
      message: 'Commission status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating commission status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/coordinator/commissions/pending
 * Get pending commissions awaiting payment
 */
router.get('/commissions/pending', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.userId;

    const pending = await sql`
      SELECT 
        cc.*,
        cw.couple_names,
        cw.event_date,
        v.business_name as vendor_name
      FROM coordinator_commissions cc
      LEFT JOIN coordinator_weddings cw ON cc.wedding_id = cw.id
      LEFT JOIN vendors v ON cc.vendor_id = v.id
      WHERE cc.coordinator_id = ${coordinatorId}
        AND cc.status = 'pending'
      ORDER BY cc.created_at DESC
    `;

    const totalPending = pending.reduce((sum, comm) => {
      return sum + parseFloat(comm.amount || 0);
    }, 0);

    res.json({ 
      success: true, 
      pending_commissions: pending,
      total_pending_amount: totalPending
    });
  } catch (error) {
    console.error('Error fetching pending commissions:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/coordinator/commissions/export
 * Export commissions for financial reporting
 */
router.get('/commissions/export', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.userId;
    const { start_date, end_date, format = 'json' } = req.query;

    // Build filters
    let filters = [`cc.coordinator_id = ${coordinatorId}`];
    
    if (start_date) {
      filters.push(`cc.created_at >= '${start_date}'`);
    }

    if (end_date) {
      filters.push(`cc.created_at <= '${end_date}'`);
    }

    const whereClause = filters.join(' AND ');

    const commissions = await sql.unsafe(`
      SELECT 
        cc.id,
        cc.created_at,
        cc.amount,
        cc.commission_type,
        cc.percentage,
        cc.status,
        cc.paid_at,
        cc.payment_reference,
        cw.couple_names,
        cw.event_date,
        v.business_name as vendor_name,
        v.business_type as service_type
      FROM coordinator_commissions cc
      LEFT JOIN coordinator_weddings cw ON cc.wedding_id = cw.id
      LEFT JOIN vendors v ON cc.vendor_id = v.id
      WHERE ${whereClause}
      ORDER BY cc.created_at DESC
    `);

    if (format === 'csv') {
      // Convert to CSV format
      const headers = [
        'ID', 'Date', 'Amount', 'Type', 'Percentage', 'Status', 
        'Paid Date', 'Reference', 'Client', 'Event Date', 'Vendor', 'Service'
      ];

      const csvRows = [
        headers.join(','),
        ...commissions.map(c => [
          c.id,
          c.created_at,
          c.amount,
          c.commission_type,
          c.percentage || '',
          c.status,
          c.paid_at || '',
          c.payment_reference || '',
          c.couple_names || '',
          c.event_date || '',
          c.vendor_name || '',
          c.service_type || ''
        ].join(','))
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=commissions.csv');
      res.send(csvRows.join('\n'));
    } else {
      res.json({ 
        success: true, 
        commissions,
        total: commissions.length
      });
    }
  } catch (error) {
    console.error('Error exporting commissions:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
