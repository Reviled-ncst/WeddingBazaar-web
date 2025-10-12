/**
 * COMPREHENSIVE BOOKING API ROUTES
 * 
 * This file contains all the API routes needed for the enhanced booking system.
 * Add these routes to your backend routes/bookings.js file.
 */

const express = require('express');
const router = express.Router();
const { bookingService } = require('../services/bookingService');

// ========== EXISTING ROUTES (Keep these) ==========

// GET /api/bookings/vendor/:vendorId - Get bookings by vendor
router.get('/bookings/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const params = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status ? req.query.status.split(',') : undefined,
      service_type: req.query.service_type ? req.query.service_type.split(',') : undefined,
      date_range: req.query.start_date && req.query.end_date ? {
        start: req.query.start_date,
        end: req.query.end_date
      } : undefined,
      sort_field: req.query.sort_field,
      sort_direction: req.query.sort_direction
    };

    const result = await bookingService.getBookingsByVendor(vendorId, params);
    
    res.json({
      success: true,
      bookings: result.bookings,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error getting vendor bookings:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/bookings/user/:userId - Get bookings by user/couple
router.get('/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const params = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status ? req.query.status.split(',') : undefined,
      service_type: req.query.service_type ? req.query.service_type.split(',') : undefined,
      date_range: req.query.start_date && req.query.end_date ? {
        start: req.query.start_date,
        end: req.query.end_date
      } : undefined,
      sort_field: req.query.sort_field,
      sort_direction: req.query.sort_direction
    };

    const result = await bookingService.getBookingsByCouple(userId, params);
    
    res.json({
      success: true,
      bookings: result.bookings,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error getting user bookings:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/bookings/stats - Get booking statistics
router.get('/bookings/stats', async (req, res) => {
  try {
    const { vendor_id, couple_id } = req.query;
    
    const stats = await bookingService.getBookingStats(couple_id, vendor_id);
    
    res.json({
      success: true,
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error getting booking stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bookings - Create new booking
router.post('/bookings', async (req, res) => {
  try {
    const bookingRequest = req.body;
    const coupleId = req.body.couple_id || `guest-${Date.now()}`;
    
    console.log('📋 [API] Creating new booking:', { vendor_id: bookingRequest.vendor_id, couple_id: coupleId });
    
    const booking = await bookingService.createBooking(bookingRequest, coupleId);
    
    res.status(201).json({
      success: true,
      booking: booking,
      message: 'Booking created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error creating booking:', error);
    
    if (error.code === 'VENDOR_NOT_FOUND') {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: 'VENDOR_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ========== NEW ROUTES (Add these) ==========

// GET /api/bookings/:id - Get individual booking details *** MISSING ***
router.get('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 [API] Getting individual booking:', id);
    
    const booking = await bookingService.getBookingById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      booking: booking,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error getting individual booking:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PATCH /api/bookings/:id/status - Update booking status *** ENHANCED ***
router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, status_reason } = req.body;
    
    console.log('🔄 [API] PATCH status update:', { id, status, message, status_reason });
    
    // REMOVE OLD VALIDATION - Let the service handle it
    // The service now supports 16 statuses instead of 4
    
    const updatedBooking = await bookingService.updateBookingStatus(id, status, message, status_reason);
    
    res.json({
      success: true,
      booking: updatedBooking,
      message: `Booking status updated to ${status}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error updating booking status:', error);
    
    // Check if it's a validation error from the service
    if (error.message.includes('Invalid status')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/bookings/:id/status - Alternative status update method *** NEW ***
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, status_reason } = req.body;
    
    console.log('🔄 [API] PUT status update:', { id, status, message, status_reason });
    
    const updatedBooking = await bookingService.updateBookingStatus(id, status, message, status_reason);
    
    res.json({
      success: true,
      booking: updatedBooking,
      message: `Booking status updated to ${status}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error updating booking status (PUT):', error);
    
    if (error.message.includes('Invalid status')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bookings/:id/quote - Send quote for booking *** NEW ***
router.post('/bookings/:id/quote', async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { quoteData, vendorId } = req.body;
    
    console.log('📋 [API] Sending quote for booking:', bookingId);
    
    const result = await bookingService.sendQuote(bookingId, quoteData, vendorId);
    
    res.json({
      success: true,
      booking: result,
      message: 'Quote sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error sending quote:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bookings/:id/accept-quote - Accept quote *** NEW ***
router.post('/bookings/:id/accept-quote', async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { coupleId, message } = req.body;
    
    console.log('✅ [API] Accepting quote for booking:', bookingId);
    
    const result = await bookingService.acceptQuote(bookingId, coupleId, message);
    
    res.json({
      success: true,
      booking: result,
      message: 'Quote accepted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error accepting quote:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bookings/:id/reject-quote - Reject quote *** NEW ***
router.post('/bookings/:id/reject-quote', async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { coupleId, reason } = req.body;
    
    console.log('❌ [API] Rejecting quote for booking:', bookingId);
    
    const result = await bookingService.rejectQuote(bookingId, coupleId, reason);
    
    res.json({
      success: true,
      booking: result,
      message: 'Quote rejected successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error rejecting quote:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bookings/:id/confirm - Confirm booking *** NEW ***
router.post('/bookings/:id/confirm', async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { vendorId, confirmationDetails } = req.body;
    
    console.log('✅ [API] Confirming booking:', bookingId);
    
    const result = await bookingService.confirmBooking(bookingId, vendorId, confirmationDetails);
    
    res.json({
      success: true,
      booking: result,
      message: 'Booking confirmed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error confirming booking:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/bookings/:id/quote - Get quote details *** NEW ***
router.get('/bookings/:id/quote', async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    
    console.log('📋 [API] Getting quote details for booking:', bookingId);
    
    const quoteDetails = await bookingService.getQuoteDetails(bookingId);
    
    if (!quoteDetails) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found for this booking',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      quote: quoteDetails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error getting quote details:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/bookings/:id/timeline - Get booking timeline *** NEW ***
router.get('/bookings/:id/timeline', async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    
    console.log('📜 [API] Getting timeline for booking:', bookingId);
    
    const timeline = await bookingService.getBookingTimeline(bookingId);
    
    res.json({
      success: true,
      timeline: timeline,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error getting booking timeline:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
