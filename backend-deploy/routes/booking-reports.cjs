const express = require('express');
const { sql } = require('../config/database.cjs');
const router = express.Router();

// ==================== COUPLE & VENDOR ENDPOINTS ====================

// Submit a report (both couple and vendor can use this)
router.post('/submit', async (req, res) => {
  console.log('📝 Submitting booking report:', req.body);
  
  try {
    const {
      booking_id,
      reported_by,
      reporter_type, // 'vendor' or 'couple'
      report_type,
      subject,
      description,
      evidence_urls = [],
      priority = 'medium'
    } = req.body;

    // Validation
    if (!booking_id || !reported_by || !reporter_type || !report_type || !subject || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Verify booking exists and user is associated with it
    const bookingCheck = await sql`
      SELECT id, vendor_id, couple_id 
      FROM bookings 
      WHERE id = ${booking_id}
    `;

    if (bookingCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const booking = bookingCheck[0];

    // Verify user has permission to report
    let hasPermission = false;
    if (reporter_type === 'couple' && booking.couple_id === reported_by) {
      hasPermission = true;
    } else if (reporter_type === 'vendor') {
      // Check if user is the vendor
      const vendorCheck = await sql`
        SELECT vendor_id FROM vendors WHERE user_id = ${reported_by}
      `;
      if (vendorCheck.length > 0 && vendorCheck[0].vendor_id === booking.vendor_id) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to report this booking'
      });
    }

    // Insert report
    const result = await sql`
      INSERT INTO booking_reports (
        booking_id,
        reported_by,
        reporter_type,
        report_type,
        subject,
        description,
        cancellation_reason,
        evidence_urls,
        priority,
        status
      ) VALUES (
        ${booking_id},
        ${reported_by},
        ${reporter_type},
        ${report_type},
        ${subject},
        ${description},
        ${req.body.cancellation_reason || null},
        ${evidence_urls},
        ${priority},
        'open'
      )
      RETURNING *
    `;

    console.log('✅ Report submitted successfully:', result[0].id);

    res.json({
      success: true,
      message: 'Report submitted successfully',
      report: result[0]
    });

  } catch (error) {
    console.error('❌ Error submitting report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit report',
      details: error.message
    });
  }
});

// Get reports for a specific user (vendor or couple)
router.get('/my-reports/:userId', async (req, res) => {
  console.log('📋 Fetching reports for user:', req.params.userId);
  
  try {
    const { userId } = req.params;
    const { status, report_type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = sql`
      SELECT 
        br.*,
        b.booking_reference,
        b.service_type,
        b.event_date,
        b.status as booking_status,
        v.business_name as vendor_name,
        CONCAT(cu.first_name, ' ', cu.last_name) as couple_name
      FROM booking_reports br
      LEFT JOIN bookings b ON br.booking_id = b.id
      LEFT JOIN vendors v ON b.vendor_id = v.vendor_id
      LEFT JOIN users cu ON b.couple_id = cu.id
      WHERE br.reported_by = ${userId}
    `;

    if (status) {
      query = sql`${query} AND br.status = ${status}`;
    }

    if (report_type) {
      query = sql`${query} AND br.report_type = ${report_type}`;
    }

    query = sql`${query}
      ORDER BY br.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const reports = await query;

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total 
      FROM booking_reports 
      WHERE reported_by = ${userId}
      ${status ? sql`AND status = ${status}` : sql``}
      ${report_type ? sql`AND report_type = ${report_type}` : sql``}
    `;

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult[0].total),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
      details: error.message
    });
  }
});

// Get reports for a specific booking
router.get('/booking/:bookingId', async (req, res) => {
  console.log('📋 Fetching reports for booking:', req.params.bookingId);
  
  try {
    const { bookingId } = req.params;

    const reports = await sql`
      SELECT 
        br.*,
        CONCAT(u.first_name, ' ', u.last_name) as reporter_name,
        u.email as reporter_email
      FROM booking_reports br
      LEFT JOIN users u ON br.reported_by = u.id
      WHERE br.booking_id = ${bookingId}
      ORDER BY br.created_at DESC
    `;

    res.json({
      success: true,
      reports
    });

  } catch (error) {
    console.error('❌ Error fetching booking reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking reports',
      details: error.message
    });
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Get all reports (admin only)
router.get('/admin/all', async (req, res) => {
  console.log('👨‍💼 Admin fetching all reports');
  
  try {
    const { 
      status, 
      priority, 
      reporter_type, 
      report_type,
      page = 1, 
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Build query dynamically
    let whereConditions = [];
    let params = [];

    if (status) whereConditions.push(`status = '${status}'`);
    if (priority) whereConditions.push(`priority = '${priority}'`);
    if (reporter_type) whereConditions.push(`reporter_type = '${reporter_type}'`);
    if (report_type) whereConditions.push(`report_type = '${report_type}'`);

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const orderClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    const query = `
      SELECT * FROM admin_booking_reports_view
      ${whereClause}
      ${orderClause}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const reports = await sql.unsafe(query);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM booking_reports
      ${whereClause}
    `;
    const countResult = await sql.unsafe(countQuery);

    // Get statistics
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total_reports,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_reports,
        COUNT(CASE WHEN status = 'in_review' THEN 1 END) as in_review_reports,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports,
        COUNT(CASE WHEN status = 'dismissed' THEN 1 END) as dismissed_reports,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_reports,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_reports,
        COUNT(CASE WHEN reporter_type = 'vendor' THEN 1 END) as vendor_reports,
        COUNT(CASE WHEN reporter_type = 'couple' THEN 1 END) as couple_reports
      FROM booking_reports
    `;

    res.json({
      success: true,
      reports,
      statistics: statsResult[0],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult[0].total),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching admin reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
      details: error.message
    });
  }
});

// Update report status (admin only)
router.put('/admin/:reportId/status', async (req, res) => {
  console.log('🔄 Admin updating report status:', req.params.reportId);
  
  try {
    const { reportId } = req.params;
    const { status, admin_notes, admin_response, reviewed_by } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const updates = {
      status,
      admin_notes,
      admin_response,
      reviewed_by,
      reviewed_at: new Date()
    };

    if (status === 'resolved') {
      updates.resolved_at = new Date();
    }

    const result = await sql`
      UPDATE booking_reports
      SET 
        status = ${status},
        admin_notes = ${admin_notes || null},
        admin_response = ${admin_response || null},
        reviewed_by = ${reviewed_by || null},
        reviewed_at = ${updates.reviewed_at},
        resolved_at = ${updates.resolved_at || null},
        updated_at = NOW()
      WHERE id = ${reportId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    console.log('✅ Report status updated successfully');

    res.json({
      success: true,
      message: 'Report status updated successfully',
      report: result[0]
    });

  } catch (error) {
    console.error('❌ Error updating report status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update report status',
      details: error.message
    });
  }
});

// Update report priority (admin only)
router.put('/admin/:reportId/priority', async (req, res) => {
  console.log('🔄 Admin updating report priority:', req.params.reportId);
  
  try {
    const { reportId } = req.params;
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({
        success: false,
        error: 'Priority is required'
      });
    }

    const result = await sql`
      UPDATE booking_reports
      SET 
        priority = ${priority},
        updated_at = NOW()
      WHERE id = ${reportId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    console.log('✅ Report priority updated successfully');

    res.json({
      success: true,
      message: 'Report priority updated successfully',
      report: result[0]
    });

  } catch (error) {
    console.error('❌ Error updating report priority:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update report priority',
      details: error.message
    });
  }
});

// Delete report (admin only)
router.delete('/admin/:reportId', async (req, res) => {
  console.log('🗑️ Admin deleting report:', req.params.reportId);
  
  try {
    const { reportId } = req.params;

    const result = await sql`
      DELETE FROM booking_reports
      WHERE id = ${reportId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    console.log('✅ Report deleted successfully');

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete report',
      details: error.message
    });
  }
});

module.exports = router;
