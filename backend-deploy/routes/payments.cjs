const express = require('express');
const { sql } = require('../config/database.cjs');
const {
  createDepositReceipt,
  createBalanceReceipt,
  createFullPaymentReceipt,
  getBookingReceipts,
  calculateTotalPaid
} = require('../helpers/receiptGenerator.cjs');

const router = express.Router();

// PayMongo API configuration
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || process.env.VITE_PAYMONGO_SECRET_KEY;
const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY || process.env.VITE_PAYMONGO_PUBLIC_KEY;
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

console.log('💳 [PAYMENT SERVICE] Initializing PayMongo integration...');
console.log('💳 [PAYMENT SERVICE] Secret Key:', PAYMONGO_SECRET_KEY ? '✅ Available' : '❌ Missing');
console.log('💳 [PAYMENT SERVICE] Public Key:', PAYMONGO_PUBLIC_KEY ? '✅ Available' : '❌ Missing');

// Health check endpoint for payment service
router.get('/health', (req, res) => {
  console.log('🏥 [PAYMENT HEALTH] Payment service health check requested');
  
  const isConfigured = !!(PAYMONGO_SECRET_KEY && PAYMONGO_PUBLIC_KEY);
  const isTestMode = PAYMONGO_SECRET_KEY?.startsWith('sk_test_');
  
  res.json({
    status: 'healthy',
    paymongo_configured: isConfigured,
    test_mode: isTestMode,
    endpoints: [
      'POST /api/payment/create-source',
      'POST /api/payment/create-intent',
      'POST /api/payment/process',
      'POST /api/payment/webhook',
      'GET /api/payment/health'
    ],
    timestamp: new Date().toISOString()
  });
  
  console.log(`🏥 [PAYMENT HEALTH] Status: ${isConfigured ? '✅ Configured' : '❌ Not Configured'}`);
});

// Helper function to create PayMongo auth header
function getPayMongoAuthHeader() {
  if (!PAYMONGO_SECRET_KEY) {
    throw new Error('PayMongo secret key not configured');
  }
  return `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`;
}

// Create Payment Source for E-wallets (GCash, Maya, GrabPay)
router.post('/create-source', async (req, res) => {
  console.log('💳 [CREATE-SOURCE] Processing e-wallet payment source creation...');
  console.log('💳 [CREATE-SOURCE] Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { type, amount, currency = 'PHP', redirect, metadata = {} } = req.body;
    
    // Validate required fields
    if (!type || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type and amount'
      });
    }
    
    // Validate payment type
    const validTypes = ['gcash', 'paymaya', 'grab_pay'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid payment type. Must be one of: ${validTypes.join(', ')}`
      });
    }
    
    // Validate amount (PayMongo minimum is 100 centavos = ₱1)
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Minimum payment amount is ₱1.00'
      });
    }
    
    console.log(`💳 [CREATE-SOURCE] Creating ${type} source for ₱${amount / 100} (${amount} centavos)`);
    
    // Prepare PayMongo source data
    const sourceData = {
      data: {
        attributes: {
          type: type,
          amount: amount,
          currency: currency.toUpperCase(),
          redirect: redirect || {
            success: `${process.env.FRONTEND_URL || 'https://weddingbazaarph.web.app'}/payment/success`,
            failed: `${process.env.FRONTEND_URL || 'https://weddingbazaarph.web.app'}/payment/failed`
          },
          metadata: {
            ...metadata,
            created_at: new Date().toISOString(),
            source: 'wedding_bazaar_web'
          }
        }
      }
    };
    
    console.log('💳 [CREATE-SOURCE] PayMongo API request:', JSON.stringify(sourceData, null, 2));
    
    // Call PayMongo API
    const response = await fetch(`${PAYMONGO_API_URL}/sources`, {
      method: 'POST',
      headers: {
        'Authorization': getPayMongoAuthHeader(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(sourceData)
    });
    
    const responseData = await response.json();
    
    console.log('💳 [CREATE-SOURCE] PayMongo API response status:', response.status);
    console.log('💳 [CREATE-SOURCE] PayMongo API response:', JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      console.error('❌ [CREATE-SOURCE] PayMongo API error:', responseData);
      return res.status(response.status).json({
        success: false,
        error: responseData.errors?.[0]?.detail || 'PayMongo API error',
        details: responseData
      });
    }
    
    const source = responseData.data;
    
    // Extract checkout URL from response
    let checkoutUrl = null;
    if (source.attributes.redirect?.checkout_url) {
      checkoutUrl = source.attributes.redirect.checkout_url;
    } else if (source.attributes.checkout_url) {
      checkoutUrl = source.attributes.checkout_url;
    }
    
    console.log(`✅ [CREATE-SOURCE] Source created successfully: ${source.id}`);
    console.log(`🔗 [CREATE-SOURCE] Checkout URL: ${checkoutUrl || 'None'}`);
    
    // Return response in format expected by frontend
    res.json({
      success: true,
      data: source,
      source_id: source.id,
      checkout_url: checkoutUrl,
      redirect_url: checkoutUrl,
      status: source.attributes.status,
      type: source.attributes.type,
      amount: source.attributes.amount,
      currency: source.attributes.currency
    });
    
  } catch (error) {
    console.error('❌ [CREATE-SOURCE] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
});

// Get Payment Source Status
router.get('/source/:sourceId', async (req, res) => {
  console.log('💳 [GET-SOURCE] Getting source status:', req.params.sourceId);
  
  try {
    const { sourceId } = req.params;
    
    const response = await fetch(`${PAYMONGO_API_URL}/sources/${sourceId}`, {
      method: 'GET',
      headers: {
        'Authorization': getPayMongoAuthHeader(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ [GET-SOURCE] PayMongo API error:', responseData);
      return res.status(response.status).json({
        success: false,
        error: responseData.errors?.[0]?.detail || 'PayMongo API error'
      });
    }
    
    const source = responseData.data;
    
    console.log(`✅ [GET-SOURCE] Source status: ${source.attributes.status}`);
    
    res.json({
      success: true,
      data: source,
      status: source.attributes.status,
      type: source.attributes.type,
      amount: source.attributes.amount,
      currency: source.attributes.currency
    });
    
  } catch (error) {
    console.error('❌ [GET-SOURCE] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Create Payment Intent Handler (shared by both routes)
const createPaymentIntentHandler = async (req, res) => {
  console.log('💳 [CREATE-INTENT] Processing card payment intent creation...');
  console.log('💳 [CREATE-INTENT] Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { amount, currency = 'PHP', description, payment_method_allowed = ['card'], metadata = {} } = req.body;
    
    // Validate required fields
    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: amount'
      });
    }
    
    // Validate amount (PayMongo minimum is 100 centavos = ₱1)
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Minimum payment amount is ₱1.00'
      });
    }
    
    console.log(`💳 [CREATE-INTENT] Creating payment intent for ₱${amount / 100} (${amount} centavos)`);
    
    // Prepare PayMongo payment intent data
    const intentData = {
      data: {
        attributes: {
          amount: amount,
          currency: currency.toUpperCase(),
          description: description || 'Wedding Bazaar Payment',
          payment_method_allowed: payment_method_allowed,
          metadata: {
            ...metadata,
            created_at: new Date().toISOString(),
            source: 'wedding_bazaar_web'
          }
        }
      }
    };
    
    console.log('💳 [CREATE-INTENT] PayMongo API request:', JSON.stringify(intentData, null, 2));
    
    // Call PayMongo API
    const response = await fetch(`${PAYMONGO_API_URL}/payment_intents`, {
      method: 'POST',
      headers: {
        'Authorization': getPayMongoAuthHeader(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(intentData)
    });
    
    const responseData = await response.json();
    
    console.log('💳 [CREATE-INTENT] PayMongo API response status:', response.status);
    console.log('💳 [CREATE-INTENT] PayMongo API response:', JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      console.error('❌ [CREATE-INTENT] PayMongo API error:', responseData);
      return res.status(response.status).json({
        success: false,
        error: responseData.errors?.[0]?.detail || 'PayMongo API error',
        details: responseData
      });
    }
    
    const intent = responseData.data;
    
    console.log(`✅ [CREATE-INTENT] Payment intent created successfully: ${intent.id}`);
    
    res.json({
      success: true,
      data: intent,
      payment_intent_id: intent.id,
      client_key: intent.attributes.client_key,
      status: intent.attributes.status,
      amount: intent.attributes.amount,
      currency: intent.attributes.currency
    });
    
  } catch (error) {
    console.error('❌ [CREATE-INTENT] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
};

// Create Payment Intent for Card Payments (full endpoint name)
router.post('/create-payment-intent', createPaymentIntentHandler);

// Alias route for frontend compatibility (shorter endpoint name)
router.post('/create-intent', createPaymentIntentHandler);

// Create PayMongo Payment Method (for Card Payments)
router.post('/create-payment-method', async (req, res) => {
  console.log('💳 [CREATE-PAYMENT-METHOD] Creating PayMongo payment method...');
  console.log('💳 [CREATE-PAYMENT-METHOD] Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { type, details, billing } = req.body;
    
    // Validate required fields
    if (!type || !details) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type and details'
      });
    }
    
    console.log(`💳 [CREATE-PAYMENT-METHOD] Creating ${type} payment method`);
    
    // Prepare PayMongo payment method data
    const paymentMethodData = {
      data: {
        attributes: {
          type: type,
          details: details,
          billing: billing || {}
        }
      }
    };
    
    console.log('💳 [CREATE-PAYMENT-METHOD] PayMongo API request:', JSON.stringify(paymentMethodData, null, 2));
    
    // Call PayMongo API
    const response = await fetch(`${PAYMONGO_API_URL}/payment_methods`, {
      method: 'POST',
      headers: {
        'Authorization': getPayMongoAuthHeader(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(paymentMethodData)
    });
    
    const responseData = await response.json();
    
    console.log('💳 [CREATE-PAYMENT-METHOD] PayMongo API response status:', response.status);
    console.log('💳 [CREATE-PAYMENT-METHOD] PayMongo API response:', JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      console.error('❌ [CREATE-PAYMENT-METHOD] PayMongo API error:', responseData);
      return res.status(response.status).json({
        success: false,
        error: responseData.errors?.[0]?.detail || 'PayMongo API error',
        details: responseData
      });
    }
    
    const paymentMethod = responseData.data;
    
    console.log(`✅ [CREATE-PAYMENT-METHOD] Payment method created successfully: ${paymentMethod.id}`);
    
    res.json({
      success: true,
      data: paymentMethod,
      payment_method_id: paymentMethod.id,
      type: paymentMethod.attributes.type,
      details: paymentMethod.attributes.details
    });
    
  } catch (error) {
    console.error('❌ [CREATE-PAYMENT-METHOD] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
});

// Attach Payment Method to Payment Intent
router.post('/attach-intent', async (req, res) => {
  console.log('💳 [ATTACH-INTENT] Attaching payment method to intent...');
  console.log('💳 [ATTACH-INTENT] Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { payment_intent_id, payment_method_id, client_key, return_url } = req.body;
    
    // Validate required fields
    if (!payment_intent_id || !payment_method_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: payment_intent_id and payment_method_id'
      });
    }
    
    console.log(`💳 [ATTACH-INTENT] Attaching payment method ${payment_method_id} to intent ${payment_intent_id}`);
    
    // Prepare attachment data
    const attachmentData = {
      data: {
        attributes: {
          payment_method: payment_method_id,
          return_url: return_url || `${process.env.FRONTEND_URL || 'https://weddingbazaarph.web.app'}/payment/complete`,
          client_key: client_key
        }
      }
    };
    
    console.log('💳 [ATTACH-INTENT] PayMongo API request:', JSON.stringify(attachmentData, null, 2));
    
    // Call PayMongo API to attach payment method to intent
    const response = await fetch(`${PAYMONGO_API_URL}/payment_intents/${payment_intent_id}/attach`, {
      method: 'POST',
      headers: {
        'Authorization': getPayMongoAuthHeader(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(attachmentData)
    });
    
    const responseData = await response.json();
    
    console.log('💳 [ATTACH-INTENT] PayMongo API response status:', response.status);
    console.log('💳 [ATTACH-INTENT] PayMongo API response:', JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      console.error('❌ [ATTACH-INTENT] PayMongo API error:', responseData);
      return res.status(response.status).json({
        success: false,
        error: responseData.errors?.[0]?.detail || 'PayMongo API error',
        details: responseData
      });
    }
    
    const intent = responseData.data;
    
    console.log(`✅ [ATTACH-INTENT] Payment method attached successfully. Status: ${intent.attributes.status}`);
    
    res.json({
      success: true,
      data: intent,
      payment_intent_id: intent.id,
      status: intent.attributes.status,
      amount: intent.attributes.amount,
      currency: intent.attributes.currency,
      next_action: intent.attributes.next_action
    });
    
  } catch (error) {
    console.error('❌ [ATTACH-INTENT] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
});

// Process Payment (Deposit, Balance, or Full Payment)
router.post('/process', async (req, res) => {
  console.log('💳 [PROCESS-PAYMENT] Processing payment...');
  console.log('💳 [PROCESS-PAYMENT] Request body:', JSON.stringify(req.body, null, 2));

  try {
    const {
      bookingId,
      paymentType, // 'deposit', 'balance', 'full'
      paymentMethod, // 'gcash', 'maya', 'card', etc.
      amount, // in centavos
      paymentReference, // PayMongo transaction ID
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!bookingId || !paymentType || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: bookingId, paymentType, and amount'
      });
    }

    // Validate payment type
    const validPaymentTypes = ['deposit', 'balance', 'full'];
    if (!validPaymentTypes.includes(paymentType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid payment type. Must be one of: ${validPaymentTypes.join(', ')}`
      });
    }

    // Get booking details
    const bookingResult = await sql`
      SELECT 
        b.*,
        b.couple_id,
        b.vendor_id,
        b.total_amount,
        b.deposit_amount
      FROM bookings b
      WHERE b.id = ${bookingId}
    `;

    if (bookingResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const booking = bookingResult[0];
    const coupleId = booking.couple_id;
    const vendorId = booking.vendor_id;
    
    // Enhanced debugging for amount fields
    console.log(`💳 [PROCESS-PAYMENT] Raw booking data:`, {
      id: booking.id,
      total_amount: booking.total_amount,
      deposit_amount: booking.deposit_amount,
      amount: booking.amount,
      couple_id: booking.couple_id,
      vendor_id: booking.vendor_id
    });
    
    // Try multiple field names for total amount
    const totalAmount = parseInt(booking.total_amount) || parseInt(booking.amount) || 0;
    const depositAmount = parseInt(booking.deposit_amount) || Math.floor(totalAmount * 0.3) || 0;

    console.log(`💳 [PROCESS-PAYMENT] Booking found: ${bookingId}`);
    console.log(`💳 [PROCESS-PAYMENT] Total: ₱${totalAmount / 100} | Deposit: ₱${depositAmount / 100}`);

    // Calculate amounts already paid
    const totalPaid = await calculateTotalPaid(bookingId);
    const remainingBalance = totalAmount - totalPaid;

    console.log(`💰 [PROCESS-PAYMENT] Already paid: ₱${totalPaid / 100} | Remaining: ₱${remainingBalance / 100}`);

    // Validate payment amount based on type
    let newStatus = booking.status;
    let receipt = null;

    switch (paymentType) {
      case 'deposit':
        // Accept any deposit amount (removed strict validation)
        console.log(`💳 [PROCESS-PAYMENT] Creating deposit receipt for ₱${amount / 100}`);
        
        // Create deposit receipt
        receipt = await createDepositReceipt(
          bookingId,
          coupleId,
          vendorId,
          amount,
          paymentMethod,
          paymentReference
        );
        newStatus = 'downpayment'; // Database status
        console.log(`✅ [PROCESS-PAYMENT] Deposit receipt created: ${receipt?.receipt_number}`);
        break;

      case 'balance':
        if (totalPaid === 0) {
          return res.status(400).json({
            success: false,
            error: 'Cannot pay balance without deposit payment'
          });
        }
        if (amount < remainingBalance) {
          return res.status(400).json({
            success: false,
            error: `Balance payment must be at least ₱${remainingBalance / 100}`
          });
        }
        // Create balance receipt
        receipt = await createBalanceReceipt(
          bookingId,
          coupleId,
          vendorId,
          amount,
          totalAmount,
          paymentMethod,
          paymentReference
        );
        newStatus = 'fully_paid'; // Database status
        break;

      case 'full':
        if (amount < totalAmount) {
          return res.status(400).json({
            success: false,
            error: `Full payment must be ₱${totalAmount / 100}`
          });
        }
        // Create full payment receipt
        receipt = await createFullPaymentReceipt(
          bookingId,
          coupleId,
          vendorId,
          amount,
          paymentMethod,
          paymentReference
        );
        newStatus = 'fully_paid'; // Database status
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid payment type'
        });
    }

    // Update booking status
    const updatedBooking = await sql`
      UPDATE bookings
      SET 
        status = ${newStatus},
        notes = ${`${paymentType.toUpperCase()}_PAID: Payment of ₱${amount / 100} received via ${paymentMethod}`},
        updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;

    console.log(`✅ [PROCESS-PAYMENT] Payment processed successfully`);
    console.log(`✅ [PROCESS-PAYMENT] Receipt: ${receipt.receipt_number}`);
    console.log(`✅ [PROCESS-PAYMENT] Status: ${booking.status} -> ${newStatus}`);

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        booking: updatedBooking[0],
        receipt: receipt,
        payment: {
          type: paymentType,
          amount: amount,
          method: paymentMethod,
          reference: paymentReference,
          status: 'completed'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [PROCESS-PAYMENT] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment processing failed',
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// PayMongo Webhook Handler
router.post('/webhook', async (req, res) => {
  console.log('🎣 [WEBHOOK] PayMongo webhook received');
  console.log('🎣 [WEBHOOK] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🎣 [WEBHOOK] Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }
    
    const eventType = data.attributes?.type;
    const eventData = data.attributes?.data;
    console.log(`🎣 [WEBHOOK] Event type: ${eventType}`);
    
    // Handle different webhook events
    switch (eventType) {
      case 'source.chargeable':
        console.log('💰 [WEBHOOK] Source became chargeable:', eventData?.id);
        // Source is ready to be charged - this happens before actual payment
        break;
        
      case 'payment.paid':
        console.log('✅ [WEBHOOK] Payment completed:', eventData?.id);
        
        // Extract payment details from webhook
        const paymentAmount = eventData?.attributes?.amount;
        const paymentMethod = eventData?.attributes?.source?.type || 'unknown';
        const paymentReference = eventData?.id;
        const metadata = eventData?.attributes?.metadata || {};
        const bookingId = metadata.booking_id;
        
        if (bookingId) {
          console.log(`💰 [WEBHOOK] Processing payment for booking: ${bookingId}`);
          
          // Get booking details
          const bookingResult = await sql`
            SELECT * FROM bookings WHERE id = ${bookingId}
          `;
          
          if (bookingResult.length > 0) {
            const booking = bookingResult[0];
            const paymentType = metadata.payment_type || 'deposit'; // default to deposit
            
            // Determine payment type based on amount and booking state
            let receiptType = paymentType;
            const totalPaid = await calculateTotalPaid(bookingId);
            const totalAmount = parseInt(booking.total_amount) || 0;
            const depositAmount = parseInt(booking.deposit_amount) || 0;
            
            if (paymentAmount >= totalAmount && totalPaid === 0) {
              receiptType = 'full';
            } else if (paymentAmount >= (totalAmount - totalPaid)) {
              receiptType = 'balance';
            } else {
              receiptType = 'deposit';
            }
            
            // Create receipt based on payment type
            let receipt;
            let newStatus;
            
            if (receiptType === 'deposit') {
              receipt = await createDepositReceipt(
                bookingId,
                booking.couple_id,
                booking.vendor_id,
                paymentAmount,
                paymentMethod,
                paymentReference
              );
              newStatus = 'downpayment';
            } else if (receiptType === 'balance') {
              receipt = await createBalanceReceipt(
                bookingId,
                booking.couple_id,
                booking.vendor_id,
                paymentAmount,
                totalAmount,
                paymentMethod,
                paymentReference
              );
              newStatus = 'fully_paid';
            } else {
              receipt = await createFullPaymentReceipt(
                bookingId,
                booking.couple_id,
                booking.vendor_id,
                paymentAmount,
                paymentMethod,
                paymentReference
              );
              newStatus = 'fully_paid';
            }
            
            // Update booking status
            await sql`
              UPDATE bookings
              SET 
                status = ${newStatus},
                notes = ${`PAYMENT_RECEIVED: ₱${paymentAmount / 100} via ${paymentMethod} - Receipt: ${receipt.receipt_number}`},
                updated_at = NOW()
              WHERE id = ${bookingId}
            `;
            
            console.log(`✅ [WEBHOOK] Receipt created: ${receipt.receipt_number}`);
            console.log(`✅ [WEBHOOK] Booking ${bookingId} status updated to: ${newStatus}`);
          } else {
            console.warn(`⚠️ [WEBHOOK] Booking not found: ${bookingId}`);
          }
        } else {
          console.warn('⚠️ [WEBHOOK] No booking_id in payment metadata');
        }
        break;
        
      case 'payment.failed':
        console.log('❌ [WEBHOOK] Payment failed:', eventData?.id);
        const failedMetadata = eventData?.attributes?.metadata || {};
        const failedBookingId = failedMetadata.booking_id;
        
        if (failedBookingId) {
          // Update booking with failed payment note
          await sql`
            UPDATE bookings
            SET 
              notes = ${`PAYMENT_FAILED: Payment attempt failed - ${eventData?.id}`},
              updated_at = NOW()
            WHERE id = ${failedBookingId}
          `;
          console.log(`❌ [WEBHOOK] Booking ${failedBookingId} marked with failed payment`);
        }
        break;
        
      default:
        console.log(`ℹ️ [WEBHOOK] Unhandled event type: ${eventType}`);
    }
    
    // Always respond with 200 to acknowledge receipt
    res.json({ received: true });
    
  } catch (error) {
    console.error('❌ [WEBHOOK] Error processing webhook:', error);
    // Still return 200 so PayMongo doesn't retry
    res.json({ received: true, error: error.message });
  }
});

// Health check for payment service
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'payments',
    paymongo: {
      secret_key_configured: !!PAYMONGO_SECRET_KEY,
      public_key_configured: !!PAYMONGO_PUBLIC_KEY,
      api_url: PAYMONGO_API_URL
    },
    timestamp: new Date().toISOString()
  });
});

// Get receipts for a booking
router.get('/receipts/:bookingId', async (req, res) => {
  console.log('📄 [GET-RECEIPTS] Fetching receipts for booking...');
  
  try {
    const { bookingId } = req.params;
    
    console.log(`📄 [GET-RECEIPTS] Booking ID: ${bookingId}`);
    
    // Get receipts from database
    const receipts = await sql`
      SELECT 
        r.*,
        b.vendor_id,
        b.service_type,
        b.event_date,
        v.business_name as vendor_name
      FROM receipts r
      LEFT JOIN bookings b ON r.booking_id = b.id
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE r.booking_id = ${bookingId}
      ORDER BY r.created_at DESC
    `;
    
    console.log(`📄 [GET-RECEIPTS] Found ${receipts.length} receipt(s)`);
    
    if (receipts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No receipts found for this booking'
      });
    }
    
    res.json({
      success: true,
      receipts: receipts.map(r => ({
        id: r.id,
        bookingId: r.booking_id,
        receiptNumber: r.receipt_number,
        paymentType: r.payment_type,
        amount: r.amount_paid || r.amount, // Support both column names
        currency: r.currency || 'PHP',
        paymentMethod: r.payment_method,
        paymentIntentId: r.payment_reference || r.payment_intent_id, // Support both column names
        paidBy: r.couple_id || r.paid_by,
        paidByName: r.paid_by_name || 'Customer',
        paidByEmail: r.paid_by_email || '',
        vendorId: r.vendor_id,
        vendorName: r.vendor_name,
        serviceType: r.service_type,
        eventDate: r.event_date,
        totalPaid: r.total_amount || r.total_paid || r.amount_paid,
        remainingBalance: r.remaining_balance || 0,
        notes: r.notes,
        createdAt: r.created_at
      }))
    });
    
  } catch (error) {
    console.error('❌ [GET-RECEIPTS] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch receipts'
    });
  }
});

module.exports = router;
