const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Get all receipts for a couple
router.get('/couple/:coupleId', async (req, res) => {
  console.log('🧾 Getting receipts for couple:', req.params.coupleId);
  
  try {
    const { coupleId } = req.params;
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;
    
    const receipts = await sql`
      SELECT 
        r.*,
        v.business_name as vendor_name,
        v.business_type as vendor_category,
        v.rating as vendor_rating,
        CONCAT('₱', TO_CHAR(r.amount_paid::DECIMAL / 100, 'FM999,999,999.00')) as amount_paid_formatted,
        CONCAT('₱', TO_CHAR(r.total_amount::DECIMAL / 100, 'FM999,999,999.00')) as total_amount_formatted,
        CONCAT('₱', TO_CHAR(r.tax_amount::DECIMAL / 100, 'FM999,999,999.00')) as tax_amount_formatted
      FROM receipts r
      LEFT JOIN vendors v ON r.vendor_id = v.id
      WHERE r.couple_id = ${coupleId}
      ORDER BY r.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${(page - 1) * limit}
    `;
    
    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total FROM receipts WHERE couple_id = ${coupleId}
    `;
    
    const total = parseInt(countResult[0].total);
    
    console.log(`✅ Found ${receipts.length} receipts for couple ${coupleId}`);
    
    res.json({
      success: true,
      receipts: receipts,
      count: receipts.length,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Couple receipts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch receipts',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get receipts for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
  console.log('🧾 Getting receipts for vendor:', req.params.vendorId);
  
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;
    
    const receipts = await sql(`
      SELECT 
        r.*,
        v.business_name as vendor_name,
        v.category as vendor_category,
        -- Format amounts from centavos to peso display
        CONCAT('₱', TO_CHAR(r.amount_paid::DECIMAL / 100, 'FM999,999,999.00')) as amount_paid_formatted,
        CONCAT('₱', TO_CHAR(r.total_amount::DECIMAL / 100, 'FM999,999,999.00')) as total_amount_formatted,
        CONCAT('₱', TO_CHAR(r.tax_amount::DECIMAL / 100, 'FM999,999,999.00')) as tax_amount_formatted
      FROM receipts r
      LEFT JOIN vendors v ON r.vendor_id = v.id
      WHERE r.vendor_id = $1
      ORDER BY r.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $2 OFFSET $3
    `, [vendorId, parseInt(limit), parseInt(offset)]);
    
    // Get total count
    const countResult = await sql(`
      SELECT COUNT(*) as total FROM receipts WHERE vendor_id = $1
    `, [vendorId]);
    
    const total = parseInt(countResult[0].total);
    
    console.log(`✅ Found ${receipts.length} receipts for vendor ${vendorId}`);
    
    res.json({
      success: true,
      receipts: receipts,
      count: receipts.length,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Vendor receipts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch receipts',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get specific receipt by ID
router.get('/:receiptId', async (req, res) => {
  console.log('🧾 Getting receipt:', req.params.receiptId);
  
  try {
    const { receiptId } = req.params;
    
    const receipts = await sql(`
      SELECT 
        r.*,
        v.business_name as vendor_name,
        v.category as vendor_category,
        v.rating as vendor_rating,
        v.location as vendor_location,
        -- Format amounts from centavos to peso display
        CONCAT('₱', TO_CHAR(r.amount_paid::DECIMAL / 100, 'FM999,999,999.00')) as amount_paid_formatted,
        CONCAT('₱', TO_CHAR(r.total_amount::DECIMAL / 100, 'FM999,999,999.00')) as total_amount_formatted,
        CONCAT('₱', TO_CHAR(r.tax_amount::DECIMAL / 100, 'FM999,999,999.00')) as tax_amount_formatted
      FROM receipts r
      LEFT JOIN vendors v ON r.vendor_id = v.id
      WHERE r.id = $1 OR r.receipt_number = $1
    `, [receiptId]);
    
    if (receipts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ Found receipt ${receiptId}`);
    
    res.json({
      success: true,
      receipt: receipts[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Receipt fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch receipt',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create new receipt (for payment processing)
router.post('/create', async (req, res) => {
  console.log('🧾 Creating new receipt:', req.body);
  
  try {
    const {
      booking_id,
      couple_id,
      vendor_id,
      payment_type,
      payment_method,
      amount_paid, // in centavos
      service_name,
      service_category,
      event_date,
      event_location,
      description,
      paymongo_payment_id,
      paymongo_source_id
    } = req.body;
    
    // Validate required fields
    if (!couple_id || !vendor_id || !payment_type || !payment_method || !amount_paid || !service_name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['couple_id', 'vendor_id', 'payment_type', 'payment_method', 'amount_paid', 'service_name'],
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate receipt number
    const receiptNumberResult = await sql(`SELECT generate_receipt_number() as receipt_number`);
    const receipt_number = receiptNumberResult[0].receipt_number;
    
    // Create receipt
    const newReceipt = await sql(`
      INSERT INTO receipts (
        receipt_number,
        booking_id,
        couple_id,
        vendor_id,
        payment_type,
        payment_method,
        amount_paid,
        service_name,
        service_category,
        event_date,
        event_location,
        description,
        total_amount,
        paymongo_payment_id,
        paymongo_source_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $7, $13, $14)
      RETURNING *
    `, [
      receipt_number,
      booking_id,
      couple_id,
      vendor_id,
      payment_type,
      payment_method,
      parseInt(amount_paid),
      service_name,
      service_category,
      event_date,
      event_location,
      description,
      paymongo_payment_id,
      paymongo_source_id
    ]);
    
    console.log(`✅ Created receipt ${receipt_number}`);
    
    res.status(201).json({
      success: true,
      receipt: newReceipt[0],
      message: `Receipt ${receipt_number} created successfully`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Receipt creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create receipt',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get receipt statistics for a couple
router.get('/stats/couple/:coupleId', async (req, res) => {
  console.log('📊 Getting receipt stats for couple:', req.params.coupleId);
  
  try {
    const { coupleId } = req.params;
    
    const stats = await sql(`
      SELECT 
        COUNT(*) as total_receipts,
        COUNT(CASE WHEN payment_type = 'deposit' THEN 1 END) as deposit_payments,
        COUNT(CASE WHEN payment_type = 'balance' THEN 1 END) as balance_payments,
        COUNT(CASE WHEN payment_type = 'full_payment' THEN 1 END) as full_payments,
        COALESCE(SUM(amount_paid), 0) as total_amount_paid_centavos,
        CONCAT('₱', TO_CHAR(COALESCE(SUM(amount_paid), 0)::DECIMAL / 100, 'FM999,999,999.00')) as total_amount_paid_formatted,
        COUNT(CASE WHEN payment_method = 'card' THEN 1 END) as card_payments,
        COUNT(CASE WHEN payment_method = 'gcash' THEN 1 END) as gcash_payments,
        COUNT(CASE WHEN payment_method = 'maya' THEN 1 END) as maya_payments,
        COUNT(CASE WHEN payment_method = 'grabpay' THEN 1 END) as grabpay_payments
      FROM receipts 
      WHERE couple_id = $1
    `, [coupleId]);
    
    console.log(`✅ Receipt stats calculated for couple ${coupleId}`);
    
    res.json({
      success: true,
      stats: stats[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Receipt stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get receipt statistics',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
