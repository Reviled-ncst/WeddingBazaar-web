// ============================================================================
// Wedding Bazaar - Vendor Wallet API Routes
// ============================================================================
// Express routes for vendor wallet and earnings management
// Integrated with PayMongo receipts and completed bookings
// ============================================================================

const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');
const { authenticateToken, requireVendor, requireAdmin } = require('../middleware/auth.cjs');

const sql = neon(process.env.DATABASE_URL);

// ============================================================================
// GET /api/wallet/:vendorId - Get vendor wallet summary
// ============================================================================
router.get('/:vendorId', authenticateToken, async (req, res) => {
  try {
    const { vendorId } = req.params;

    console.log('📊 Fetching wallet data for vendor:', vendorId);

    // Get all completed bookings for this vendor
    const completedBookingsQuery = `
      SELECT 
        b.*,
        r.amount_paid,
        r.payment_method,
        r.payment_date,
        r.receipt_number,
        r.paymongo_payment_id
      FROM bookings b
      LEFT JOIN receipts r ON b.id = r.booking_id
      WHERE b.vendor_id = $1
        AND b.status = 'completed'
        AND b.fully_completed = true
        AND b.vendor_completed = true
        AND b.couple_completed = true
      ORDER BY b.completed_at DESC
    `;

    const completedBookings = await sql(completedBookingsQuery, [vendorId]);

    console.log(`✅ Found ${completedBookings.length} completed bookings`);

    // Calculate wallet totals
    let totalEarnings = 0;
    let availableBalance = 0;
    let pendingBalance = 0;
    let withdrawnAmount = 0;

    completedBookings.forEach(booking => {
      const amount = booking.amount_paid || 0;
      totalEarnings += amount;
      
      // For now, all completed earnings are available
      // In future, implement withdrawal logic
      availableBalance += amount;
    });

    // Get pending bookings (fully paid but not yet completed by both parties)
    const pendingQuery = `
      SELECT 
        b.*,
        r.amount_paid
      FROM bookings b
      LEFT JOIN receipts r ON b.id = r.booking_id
      WHERE b.vendor_id = $1
        AND (b.status = 'fully_paid' OR b.status = 'paid_in_full')
        AND (b.fully_completed = false OR b.vendor_completed = false OR b.couple_completed = false)
    `;

    const pendingBookings = await sql(pendingQuery, [vendorId]);

    pendingBookings.forEach(booking => {
      const amount = booking.amount_paid || 0;
      pendingBalance += amount;
    });

    // Get vendor details
    const vendorQuery = `SELECT * FROM vendors WHERE id = $1`;
    const vendors = await sql(vendorQuery, [vendorId]);
    const vendor = vendors[0];

    // Calculate current and previous month earnings
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthBookings = completedBookings.filter(b => 
      new Date(b.completed_at) >= currentMonthStart
    );
    const previousMonthBookings = completedBookings.filter(b => 
      new Date(b.completed_at) >= previousMonthStart && 
      new Date(b.completed_at) <= previousMonthEnd
    );

    const currentMonthEarnings = currentMonthBookings.reduce((sum, b) => sum + (b.amount_paid || 0), 0);
    const previousMonthEarnings = previousMonthBookings.reduce((sum, b) => sum + (b.amount_paid || 0), 0);

    // Calculate growth
    const earningsGrowth = previousMonthEarnings === 0 
      ? (currentMonthEarnings > 0 ? 100 : 0)
      : ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100;

    const bookingsGrowth = previousMonthBookings.length === 0
      ? (currentMonthBookings.length > 0 ? 100 : 0)
      : ((currentMonthBookings.length - previousMonthBookings.length) / previousMonthBookings.length) * 100;

    // Group by service category
    const categoryBreakdown = {};
    completedBookings.forEach(booking => {
      const category = booking.service_type || 'Other';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { earnings: 0, transactions: 0 };
      }
      categoryBreakdown[category].earnings += (booking.amount_paid || 0);
      categoryBreakdown[category].transactions += 1;
    });

    // Convert to array and calculate percentages
    const breakdown = Object.entries(categoryBreakdown)
      .map(([category, data]) => ({
        category,
        earnings: data.earnings,
        transactions: data.transactions,
        percentage: totalEarnings > 0 ? (data.earnings / totalEarnings) * 100 : 0
      }))
      .sort((a, b) => b.earnings - a.earnings);

    // Top category
    const topCategory = breakdown[0] || { category: 'N/A', earnings: 0 };

    // Average transaction
    const averageTransaction = completedBookings.length > 0
      ? totalEarnings / completedBookings.length
      : 0;

    // Build wallet object
    const wallet = {
      vendor_id: vendorId,
      vendor_name: vendor?.name || 'Unknown',
      business_name: vendor?.business_name || 'Unknown Business',
      total_earnings: totalEarnings,
      available_balance: availableBalance,
      pending_balance: pendingBalance,
      withdrawn_amount: withdrawnAmount,
      currency: 'PHP',
      currency_symbol: '₱',
      total_transactions: completedBookings.length,
      completed_bookings: completedBookings.length,
      pending_bookings: pendingBookings.length,
      last_transaction_date: completedBookings[0]?.completed_at || null,
      created_at: vendor?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Build summary object
    const summary = {
      current_month_earnings: currentMonthEarnings,
      current_month_bookings: currentMonthBookings.length,
      previous_month_earnings: previousMonthEarnings,
      previous_month_bookings: previousMonthBookings.length,
      earnings_growth_percentage: earningsGrowth,
      bookings_growth_percentage: bookingsGrowth,
      top_category: topCategory.category,
      top_category_earnings: topCategory.earnings,
      average_transaction_amount: averageTransaction
    };

    console.log('💰 Wallet Summary:', {
      totalEarnings: totalEarnings / 100,
      availableBalance: availableBalance / 100,
      pendingBalance: pendingBalance / 100,
      completedBookings: completedBookings.length
    });

    res.json({
      success: true,
      wallet,
      summary,
      breakdown
    });

  } catch (error) {
    console.error('❌ Wallet fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet data',
      details: error.message
    });
  }
});

// ============================================================================
// GET /api/wallet/:vendorId/transactions - Get transaction history
// ============================================================================
router.get('/:vendorId/transactions', authenticateToken, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { start_date, end_date, status, payment_method } = req.query;

    console.log('📜 Fetching transactions for vendor:', vendorId);

    // Build query with filters
    let query = `
      SELECT 
        r.id,
        r.receipt_number as receipt_id,
        r.receipt_number,
        b.id as booking_id,
        b.booking_reference,
        r.payment_date as transaction_date,
        r.amount_paid as amount,
        r.currency,
        r.payment_method,
        r.payment_type,
        r.paymongo_payment_id,
        r.paymongo_source_id,
        r.service_name,
        r.service_category,
        r.event_date,
        r.event_location,
        r.couple_id,
        up.first_name || ' ' || up.last_name as couple_name,
        u.email as couple_email,
        r.payment_status as status,
        r.notes,
        r.created_at,
        r.updated_at,
        'earning' as transaction_type
      FROM receipts r
      LEFT JOIN bookings b ON r.booking_id = b.id
      LEFT JOIN users u ON r.couple_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE r.vendor_id = $1
        AND b.status = 'completed'
        AND b.fully_completed = true
    `;

    const params = [vendorId];
    let paramCount = 1;

    if (start_date) {
      paramCount++;
      query += ` AND r.payment_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND r.payment_date <= $${paramCount}`;
      params.push(end_date);
    }

    if (status && status !== 'all') {
      paramCount++;
      query += ` AND r.payment_status = $${paramCount}`;
      params.push(status);
    }

    if (payment_method && payment_method !== 'all') {
      paramCount++;
      query += ` AND r.payment_method = $${paramCount}`;
      params.push(payment_method);
    }

    query += ` ORDER BY r.payment_date DESC LIMIT 100`;

    const transactions = await sql(query, params);

    console.log(`✅ Found ${transactions.length} transactions`);

    res.json({
      success: true,
      transactions
    });

  } catch (error) {
    console.error('❌ Transactions fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      details: error.message
    });
  }
});

// ============================================================================
// POST /api/wallet/:vendorId/withdraw - Request withdrawal
// ============================================================================
router.post('/:vendorId/withdraw', authenticateToken, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const {
      amount,
      withdrawal_method,
      bank_name,
      account_number,
      account_name,
      ewallet_number,
      ewallet_name,
      notes
    } = req.body;

    console.log('💸 Processing withdrawal request:', { vendorId, amount: amount / 100 });

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid withdrawal amount'
      });
    }

    // Get current available balance
    const walletQuery = `
      SELECT SUM(r.amount_paid) as total_available
      FROM receipts r
      LEFT JOIN bookings b ON r.booking_id = b.id
      WHERE r.vendor_id = $1
        AND b.status = 'completed'
        AND b.fully_completed = true
    `;

    const walletData = await sql(walletQuery, [vendorId]);
    const availableBalance = walletData[0]?.total_available || 0;

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance',
        available: availableBalance
      });
    }

    // Create withdrawal request (in production, store in withdrawals table)
    const withdrawal = {
      id: `WD-${Date.now()}`,
      vendor_id: vendorId,
      amount,
      currency: 'PHP',
      withdrawal_method,
      bank_name,
      account_number,
      account_name,
      ewallet_number,
      ewallet_name,
      status: 'pending',
      notes,
      requested_at: new Date().toISOString()
    };

    console.log('✅ Withdrawal request created:', withdrawal.id);

    res.json({
      success: true,
      withdrawal,
      new_balance: availableBalance - amount,
      message: 'Withdrawal request submitted successfully. Processing time: 1-3 business days.'
    });

  } catch (error) {
    console.error('❌ Withdrawal request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process withdrawal request',
      details: error.message
    });
  }
});

// ============================================================================
// GET /api/wallet/:vendorId/export - Export transactions to CSV
// ============================================================================
router.get('/:vendorId/export', authenticateToken, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { start_date, end_date } = req.query;

    console.log('📥 Exporting transactions for vendor:', vendorId);

    let query = `
      SELECT 
        r.payment_date,
        r.receipt_number,
        b.booking_reference,
        r.service_name,
        r.service_category,
        r.payment_method,
        r.amount_paid / 100.0 as amount,
        r.payment_status,
        up.first_name || ' ' || up.last_name as customer_name,
        r.event_date
      FROM receipts r
      LEFT JOIN bookings b ON r.booking_id = b.id
      LEFT JOIN users u ON r.couple_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE r.vendor_id = $1
        AND b.status = 'completed'
    `;

    const params = [vendorId];
    let paramCount = 1;

    if (start_date) {
      paramCount++;
      query += ` AND r.payment_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND r.payment_date <= $${paramCount}`;
      params.push(end_date);
    }

    query += ` ORDER BY r.payment_date DESC`;

    const transactions = await sql(query, params);

    // Build CSV
    const headers = [
      'Date',
      'Receipt Number',
      'Booking Reference',
      'Service',
      'Category',
      'Payment Method',
      'Amount (PHP)',
      'Status',
      'Customer',
      'Event Date'
    ];

    let csv = headers.join(',') + '\n';

    transactions.forEach(t => {
      const row = [
        t.payment_date,
        t.receipt_number,
        t.booking_reference || 'N/A',
        `"${t.service_name}"`,
        t.service_category || 'N/A',
        t.payment_method,
        t.amount,
        t.payment_status,
        `"${t.customer_name || 'N/A'}"`,
        t.event_date || 'N/A'
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${vendorId}-${Date.now()}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export transactions',
      details: error.message
    });
  }
});

module.exports = router;
