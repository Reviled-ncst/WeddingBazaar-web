// ============================================================================
// Wedding Bazaar - Vendor Wallet API Routes (Updated with New Tables)
// ============================================================================
// Express routes for vendor wallet and earnings management
// Uses vendor_wallets and wallet_transactions tables
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

    // Get or create vendor wallet
    let wallets = await sql`
      SELECT * FROM vendor_wallets WHERE vendor_id = ${vendorId}
    `;

    if (wallets.length === 0) {
      // Create wallet if it doesn't exist
      await sql`
        INSERT INTO vendor_wallets (vendor_id)
        VALUES (${vendorId})
      `;
      wallets = await sql`
        SELECT * FROM vendor_wallets WHERE vendor_id = ${vendorId}
      `;
    }

    const walletData = wallets[0];

    console.log(`✅ Found wallet for vendor ${vendorId}`);

    // Get vendor details
    const vendors = await sql`SELECT * FROM vendors WHERE id = ${vendorId}`;
    const vendor = vendors[0];

    // Get transaction statistics for current and previous month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthTransactions = await sql`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total
      FROM wallet_transactions
      WHERE vendor_id = ${vendorId}
        AND transaction_type = 'earning'
        AND status = 'completed'
        AND created_at >= ${currentMonthStart.toISOString()}
    `;

    const previousMonthTransactions = await sql`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total
      FROM wallet_transactions
      WHERE vendor_id = ${vendorId}
        AND transaction_type = 'earning'
        AND status = 'completed'
        AND created_at >= ${previousMonthStart.toISOString()}
        AND created_at <= ${previousMonthEnd.toISOString()}
    `;

    const currentMonthEarnings = parseInt(currentMonthTransactions[0]?.total || 0);
    const currentMonthBookings = parseInt(currentMonthTransactions[0]?.count || 0);
    const previousMonthEarnings = parseInt(previousMonthTransactions[0]?.total || 0);
    const previousMonthBookings = parseInt(previousMonthTransactions[0]?.count || 0);

    // Calculate growth
    const earningsGrowth = previousMonthEarnings === 0 
      ? (currentMonthEarnings > 0 ? 100 : 0)
      : ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100;

    const bookingsGrowth = previousMonthBookings === 0
      ? (currentMonthBookings > 0 ? 100 : 0)
      : ((currentMonthBookings - previousMonthBookings) / previousMonthBookings) * 100;

    // Get category breakdown
    const categoryBreakdownQuery = await sql`
      SELECT 
        service_category as category,
        COUNT(*) as transactions,
        COALESCE(SUM(amount), 0) as earnings
      FROM wallet_transactions
      WHERE vendor_id = ${vendorId}
        AND transaction_type = 'earning'
        AND status = 'completed'
        AND service_category IS NOT NULL
      GROUP BY service_category
      ORDER BY earnings DESC
    `;

    const totalEarnings = parseInt(walletData.total_earnings || 0);
    
    const breakdown = categoryBreakdownQuery.map(row => ({
      category: row.category || 'Other',
      earnings: parseInt(row.earnings),
      transactions: parseInt(row.transactions),
      percentage: totalEarnings > 0 ? (parseInt(row.earnings) / totalEarnings) * 100 : 0
    }));

    // Top category
    const topCategory = breakdown[0] || { category: 'N/A', earnings: 0 };

    // Get total transaction count
    const transactionCountQuery = await sql`
      SELECT COUNT(*) as count
      FROM wallet_transactions
      WHERE vendor_id = ${vendorId}
        AND transaction_type = 'earning'
        AND status = 'completed'
    `;
    const totalTransactionCount = parseInt(transactionCountQuery[0]?.count || 0);

    // Get last transaction date
    const lastTransactionQuery = await sql`
      SELECT created_at
      FROM wallet_transactions
      WHERE vendor_id = ${vendorId}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const lastTransactionDate = lastTransactionQuery[0]?.created_at || null;

    // Average transaction
    const averageTransaction = totalTransactionCount > 0
      ? totalEarnings / totalTransactionCount
      : 0;

    // Build response
    const wallet = {
      vendor_id: vendorId,
      vendor_name: vendor?.name || 'Unknown',
      business_name: vendor?.business_name || 'Unknown Business',
      total_earnings: parseInt(walletData.total_earnings || 0),
      available_balance: parseInt(walletData.available_balance || 0),
      pending_balance: parseInt(walletData.pending_balance || 0),
      withdrawn_amount: parseInt(walletData.withdrawn_amount || 0),
      currency: walletData.currency || 'PHP',
      currency_symbol: '₱',
      total_transactions: totalTransactionCount,
      completed_bookings: totalTransactionCount,
      pending_bookings: 0,
      last_transaction_date: lastTransactionDate,
      created_at: walletData.created_at,
      updated_at: walletData.updated_at
    };

    const summary = {
      current_month_earnings: currentMonthEarnings,
      current_month_bookings: currentMonthBookings,
      previous_month_earnings: previousMonthEarnings,
      previous_month_bookings: previousMonthBookings,
      earnings_growth_percentage: earningsGrowth,
      bookings_growth_percentage: bookingsGrowth,
      top_category: topCategory.category,
      top_category_earnings: topCategory.earnings,
      average_transaction_amount: Math.round(averageTransaction)
    };

    console.log('💰 Wallet Summary:', {
      totalEarnings: totalEarnings / 100,
      availableBalance: parseInt(walletData.available_balance || 0) / 100,
      pendingBalance: parseInt(walletData.pending_balance || 0) / 100,
      totalTransactions: totalTransactionCount
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
    const { start_date, end_date, status, payment_method, transaction_type } = req.query;

    console.log('📜 Fetching transactions for vendor:', vendorId);

    // Build query with filters
    let conditions = [sql`vendor_id = ${vendorId}`];

    if (start_date) {
      conditions.push(sql`created_at >= ${start_date}`);
    }

    if (end_date) {
      conditions.push(sql`created_at <= ${end_date}`);
    }

    if (status && status !== 'all') {
      conditions.push(sql`status = ${status}`);
    }

    if (payment_method && payment_method !== 'all') {
      conditions.push(sql`payment_method = ${payment_method}`);
    }

    if (transaction_type && transaction_type !== 'all') {
      conditions.push(sql`transaction_type = ${transaction_type}`);
    }

    const transactions = await sql`
      SELECT 
        id,
        transaction_id,
        transaction_type,
        amount,
        currency,
        status,
        booking_id,
        service_category,
        payment_method,
        description,
        created_at,
        updated_at
      FROM wallet_transactions
      WHERE ${sql.join(conditions, ' AND ')}
      ORDER BY created_at DESC
      LIMIT 100
    `;

    console.log(`✅ Found ${transactions.length} transactions`);

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        receipt_id: t.transaction_id,
        receipt_number: t.transaction_id,
        booking_id: t.booking_id || '',
        booking_reference: t.booking_id || 'N/A',
        transaction_type: t.transaction_type,
        transaction_date: t.created_at,
        amount: parseFloat(t.amount) * 100, // Convert to centavos
        currency: t.currency || 'PHP',
        payment_method: t.payment_method || 'card',
        payment_type: 'full_payment',
        service_name: t.service_category || 'Service',
        service_category: t.service_category || 'Other',
        event_date: t.created_at,
        couple_id: '',
        couple_name: 'Customer',
        couple_email: '',
        status: t.status || 'completed',
        notes: t.description || '',
        created_at: t.created_at,
        updated_at: t.updated_at
      }))
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
    const wallets = await sql`
      SELECT * FROM vendor_wallets WHERE vendor_id = ${vendorId}
    `;

    if (wallets.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    const walletRecord = wallets[0];
    const availableBalance = parseInt(walletRecord.available_balance);

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance',
        available: availableBalance
      });
    }

    // Generate transaction ID
    const transactionId = `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create withdrawal transaction
    await sql`
      INSERT INTO wallet_transactions (
        transaction_id,
        wallet_id,
        vendor_id,
        transaction_type,
        amount,
        currency,
        status,
        withdrawal_method,
        bank_name,
        account_number,
        account_name,
        ewallet_number,
        ewallet_name,
        balance_before,
        balance_after,
        description,
        notes,
        transaction_date
      ) VALUES (
        ${transactionId},
        ${walletRecord.id},
        ${vendorId},
        'withdrawal',
        ${-amount},
        'PHP',
        'pending',
        ${withdrawal_method},
        ${bank_name || null},
        ${account_number || null},
        ${account_name || null},
        ${ewallet_number || null},
        ${ewallet_name || null},
        ${availableBalance},
        ${availableBalance - amount},
        'Withdrawal request - Pending approval',
        ${notes || null},
        NOW()
      )
    `;

    // Update wallet (move to pending)
    await sql`
      UPDATE vendor_wallets
      SET 
        available_balance = available_balance - ${amount},
        pending_balance = pending_balance + ${amount},
        total_transactions = total_transactions + 1,
        last_transaction_date = NOW(),
        updated_at = NOW()
      WHERE id = ${walletRecord.id}
    `;

    console.log('✅ Withdrawal request created:', transactionId);

    res.json({
      success: true,
      withdrawal: {
        id: transactionId,
        amount,
        currency: 'PHP',
        status: 'pending',
        message: 'Withdrawal request submitted successfully. Processing time: 1-3 business days.'
      },
      new_balance: availableBalance - amount
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

    let conditions = [sql`vendor_id = ${vendorId}`];

    if (start_date) {
      conditions.push(sql`created_at >= ${start_date}`);
    }

    if (end_date) {
      conditions.push(sql`created_at <= ${end_date}`);
    }

    const transactions = await sql`
      SELECT 
        created_at as transaction_date,
        transaction_id,
        transaction_type,
        service_name,
        service_category,
        payment_method,
        amount,
        status,
        customer_name,
        event_date,
        description
      FROM wallet_transactions
      WHERE ${sql.join(conditions, ' AND ')}
      ORDER BY created_at DESC
    `;

    // Build CSV
    const headers = [
      'Date',
      'Transaction ID',
      'Type',
      'Service',
      'Category',
      'Payment Method',
      'Amount (PHP)',
      'Status',
      'Customer',
      'Event Date',
      'Description'
    ];

    let csv = headers.join(',') + '\n';

    transactions.forEach(t => {
      const row = [
        t.transaction_date,
        t.transaction_id,
        t.transaction_type,
        `"${t.service_name || 'N/A'}"`,
        t.service_category || 'N/A',
        t.payment_method || 'N/A',
        t.amount,
        t.status,
        `"${t.customer_name || 'N/A'}"`,
        t.event_date || 'N/A',
        `"${t.description || 'N/A'}"`
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
