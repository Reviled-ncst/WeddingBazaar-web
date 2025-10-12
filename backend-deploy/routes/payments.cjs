const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// PayMongo API configuration
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || process.env.VITE_PAYMONGO_SECRET_KEY;
const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY || process.env.VITE_PAYMONGO_PUBLIC_KEY;
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

console.log('💳 [PAYMENT SERVICE] Initializing PayMongo integration...');
console.log('💳 [PAYMENT SERVICE] Secret Key:', PAYMONGO_SECRET_KEY ? '✅ Available' : '❌ Missing');
console.log('💳 [PAYMENT SERVICE] Public Key:', PAYMONGO_PUBLIC_KEY ? '✅ Available' : '❌ Missing');

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

// Create Payment Intent for Card Payments
router.post('/create-payment-intent', async (req, res) => {
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
});

// Get Payment Intent Status
router.get('/payment-intent/:intentId', async (req, res) => {
  console.log('💳 [GET-INTENT] Getting payment intent status:', req.params.intentId);
  
  try {
    const { intentId } = req.params;
    
    const response = await fetch(`${PAYMONGO_API_URL}/payment_intents/${intentId}`, {
      method: 'GET',
      headers: {
        'Authorization': getPayMongoAuthHeader(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ [GET-INTENT] PayMongo API error:', responseData);
      return res.status(response.status).json({
        success: false,
        error: responseData.errors?.[0]?.detail || 'PayMongo API error'
      });
    }
    
    const intent = responseData.data;
    
    console.log(`✅ [GET-INTENT] Payment intent status: ${intent.attributes.status}`);
    
    res.json({
      success: true,
      data: intent,
      status: intent.attributes.status,
      amount: intent.attributes.amount,
      currency: intent.attributes.currency
    });
    
  } catch (error) {
    console.error('❌ [GET-INTENT] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
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
    console.log(`🎣 [WEBHOOK] Event type: ${eventType}`);
    
    // Handle different webhook events
    switch (eventType) {
      case 'source.chargeable':
        console.log('💰 [WEBHOOK] Source became chargeable:', data.attributes.data.id);
        // TODO: Create payment from chargeable source
        break;
        
      case 'payment.paid':
        console.log('✅ [WEBHOOK] Payment completed:', data.attributes.data.id);
        // TODO: Update booking status to paid
        break;
        
      case 'payment.failed':
        console.log('❌ [WEBHOOK] Payment failed:', data.attributes.data.id);
        // TODO: Update booking status to failed
        break;
        
      default:
        console.log(`ℹ️ [WEBHOOK] Unhandled event type: ${eventType}`);
    }
    
    // Always respond with 200 to acknowledge receipt
    res.json({ received: true });
    
  } catch (error) {
    console.error('❌ [WEBHOOK] Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
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

module.exports = router;
