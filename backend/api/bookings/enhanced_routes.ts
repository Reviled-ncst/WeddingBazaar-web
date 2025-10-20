// ============================================================================
// Enhanced Booking Routes - Full Support for Itemized Quotes
// ============================================================================
// This module provides enhanced booking endpoints that include ALL fields
// needed for the wedding bazaar booking system, including vendor_notes
// which contains itemized service breakdowns for quotes.
// ============================================================================

import { Router } from 'express';
import { db } from '../../database/connection';

const router = Router();

/**
 * GET /api/bookings/enhanced
 * 
 * Retrieves bookings with full data including vendor_notes (itemized quotes)
 * 
 * Query Parameters:
 * - coupleId: Filter by couple ID
 * - vendorId: Filter by vendor ID
 * - status: Filter by status
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 50)
 * - sortBy: Sort field (default: created_at)
 * - sortOrder: Sort direction (default: desc)
 */
router.get('/', async (req, res) => {
  try {
    const {
      coupleId,
      vendorId,
      status,
      page = '1',
      limit = '50',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    console.log('📡 [EnhancedBookings] GET request:', {
      coupleId,
      vendorId,
      status,
      page,
      limit,
      sortBy,
      sortOrder
    });

    // Build WHERE clause
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (coupleId) {
      conditions.push(`b.couple_id = $${paramIndex++}`);
      values.push(coupleId);
    }

    if (vendorId) {
      conditions.push(`b.vendor_id = $${paramIndex++}`);
      values.push(vendorId);
    }

    if (status) {
      conditions.push(`b.status = $${paramIndex++}`);
      values.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort fields
    const validSortFields = ['created_at', 'updated_at', 'event_date', 'status', 'total_amount'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Calculate pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    // Main query - SELECT ALL FIELDS including vendor_notes
    const query = `
      SELECT 
        b.id,
        b.service_id,
        b.service_name,
        b.vendor_id,
        b.couple_id,
        b.couple_name,
        b.event_date,
        b.event_time,
        b.event_end_time,
        b.event_location,
        b.venue_details,
        b.guest_count,
        b.service_type,
        b.budget_range,
        b.special_requests,
        b.contact_phone,
        b.contact_email,
        b.contact_person,
        b.preferred_contact_method,
        b.status,
        b.total_amount,
        b.deposit_amount,
        b.notes,
        b.vendor_notes,  -- 🔥 THIS IS THE KEY FIELD FOR ITEMIZED QUOTES
        b.response_message,
        b.booking_reference,
        b.created_at,
        b.updated_at,
        vp.business_name as vendor_name,
        vp.business_type as vendor_category,
        vp.featured_image_url as vendor_image,
        vp.average_rating as vendor_rating
      FROM bookings b
      LEFT JOIN vendor_profiles vp ON b.vendor_id = vp.user_id
      ${whereClause}
      ORDER BY b.${sortField} ${sortDirection}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    values.push(limitNum, offset);

    console.log('📊 [EnhancedBookings] Executing query:', {
      sql: query.substring(0, 200) + '...',
      values: values.length
    });

    const result = await db.query(query, values);

    // Count total matching records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      ${whereClause}
    `;

    const countValues = values.slice(0, -2); // Remove limit and offset
    const countResult = await db.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    console.log('✅ [EnhancedBookings] Query success:', {
      bookings: result.rows.length,
      total,
      page: pageNum,
      limit: limitNum,
      has_vendor_notes: result.rows.filter(b => b.vendor_notes).length
    });

    // Log vendor_notes for debugging
    result.rows.forEach((booking, index) => {
      if (booking.vendor_notes) {
        console.log(`📋 [EnhancedBookings] Booking ${booking.id} has vendor_notes:`, {
          length: booking.vendor_notes.length,
          preview: booking.vendor_notes.substring(0, 100)
        });
      }
    });

    res.json({
      success: true,
      bookings: result.rows,
      count: result.rows.length,
      total,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_items: total,
        per_page: limitNum,
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('❌ [EnhancedBookings] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * GET /api/bookings/enhanced/:bookingId
 * 
 * Get a single booking with full details including vendor_notes
 */
router.get('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    console.log('📡 [EnhancedBookings] GET single booking:', bookingId);

    const query = `
      SELECT 
        b.*,
        vp.business_name as vendor_name,
        vp.business_type as vendor_category,
        vp.featured_image_url as vendor_image,
        vp.average_rating as vendor_rating
      FROM bookings b
      LEFT JOIN vendor_profiles vp ON b.vendor_id = vp.user_id
      WHERE b.id = $1
    `;

    const result = await db.query(query, [bookingId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const booking = result.rows[0];

    console.log('✅ [EnhancedBookings] Found booking:', {
      id: booking.id,
      status: booking.status,
      has_vendor_notes: !!booking.vendor_notes
    });

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('❌ [EnhancedBookings] Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /api/bookings/enhanced/:bookingId/accept-quote
 * 
 * Accept a quote sent by vendor
 * Updates status to 'quote_accepted' and prepares for deposit payment
 */
router.patch('/:bookingId/accept-quote', async (req, res) => {
  try {
    const { bookingId } = req.params;

    console.log('💰 [EnhancedBookings] Accept quote for booking:', bookingId);

    // Update booking status
    const updateQuery = `
      UPDATE bookings
      SET 
        status = 'quote_accepted',
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(updateQuery, [bookingId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const updatedBooking = result.rows[0];

    console.log('✅ [EnhancedBookings] Quote accepted, status updated:', {
      id: updatedBooking.id,
      status: updatedBooking.status,
      updated_at: updatedBooking.updated_at
    });

    res.json({
      success: true,
      booking: updatedBooking,
      message: 'Quote accepted successfully. You can now proceed with deposit payment.'
    });

  } catch (error) {
    console.error('❌ [EnhancedBookings] Error accepting quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /api/bookings/enhanced/:bookingId/reject-quote
 * 
 * Reject a quote sent by vendor
 */
router.patch('/:bookingId/reject-quote', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    console.log('❌ [EnhancedBookings] Reject quote for booking:', bookingId, 'Reason:', reason);

    const updateQuery = `
      UPDATE bookings
      SET 
        status = 'quote_rejected',
        response_message = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(updateQuery, [bookingId, reason || 'Quote rejected by client']);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const updatedBooking = result.rows[0];

    console.log('✅ [EnhancedBookings] Quote rejected:', updatedBooking.id);

    res.json({
      success: true,
      booking: updatedBooking,
      message: 'Quote rejected successfully'
    });

  } catch (error) {
    console.error('❌ [EnhancedBookings] Error rejecting quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
