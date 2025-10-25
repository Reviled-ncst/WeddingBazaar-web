/**
 * 🔔 PayMongo Webhook Handler
 * Processes PayMongo webhook events for subscription payments
 * Events: payment.paid, payment.failed, source.chargeable
 */

const express = require('express');
const router = express.Router();
const { sql } = require('@neondatabase/serverless');

// PayMongo Configuration
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || 'sk_test_YOUR_KEY';
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

// Helper function to make PayMongo API calls
const paymongoRequest = async (endpoint, method = 'GET', data = null) => {
  const url = `${PAYMONGO_API_URL}${endpoint}`;
  const auth = Buffer.from(PAYMONGO_SECRET_KEY).toString('base64');
  
  const options = {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify({ data });
  }
  
  const response = await fetch(url, options);
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.errors?.[0]?.detail || 'PayMongo API error');
  }
  
  return result.data;
};

// Helper: Log subscription transaction
const logSubscriptionTransaction = async (subscriptionId, type, amount, status, metadata = {}) => {
  try {
    await sql`
      INSERT INTO subscription_transactions (
        subscription_id,
        transaction_type,
        amount,
        status,
        metadata,
        created_at
      ) VALUES (
        ${subscriptionId},
        ${type},
        ${amount},
        ${status},
        ${JSON.stringify(metadata)},
        NOW()
      )
    `;
  } catch (error) {
    console.error('⚠️ Error logging transaction:', error);
  }
};

/**
 * POST /api/subscriptions/webhook
 * PayMongo webhook handler for subscription events
 * Handles: payment.paid, payment.failed, source.chargeable
 */
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = req.body;
    
    console.log(`🔔 Webhook received:`, {
      type: event.data?.attributes?.type,
      id: event.data?.id
    });

    const eventType = event.data?.attributes?.type;
    const eventData = event.data?.attributes?.data;

    switch (eventType) {
      case 'payment.paid':
        await handlePaymentPaid(eventData);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(eventData);
        break;
      
      case 'source.chargeable':
        await handleSourceChargeable(eventData);
        break;
      
      default:
        console.log(`⚠️ Unhandled webhook event type: ${eventType}`);
    }

    res.json({ success: true, received: true });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook helper: Handle successful payment
const handlePaymentPaid = async (paymentData) => {
  try {
    const metadata = paymentData.attributes?.metadata || {};
    const vendor_id = metadata.vendor_id;
    const subscription_id = metadata.subscription_id;

    if (subscription_id) {
      await sql`
        UPDATE vendor_subscriptions
        SET 
          status = 'active',
          updated_at = NOW()
        WHERE id = ${subscription_id}
      `;

      console.log(`✅ Subscription ${subscription_id} activated via webhook`);

      // Log transaction
      await logSubscriptionTransaction(
        subscription_id,
        'webhook_payment_success',
        paymentData.attributes.amount,
        'completed',
        { payment_id: paymentData.id }
      );
    }

    console.log(`📢 Subscription activated for vendor ${vendor_id}`);

  } catch (error) {
    console.error('❌ Error handling payment.paid webhook:', error);
  }
};

// Webhook helper: Handle failed payment
const handlePaymentFailed = async (paymentData) => {
  try {
    const metadata = paymentData.attributes?.metadata || {};
    const subscription_id = metadata.subscription_id;

    if (subscription_id) {
      await sql`
        UPDATE vendor_subscriptions
        SET 
          status = 'past_due',
          updated_at = NOW()
        WHERE id = ${subscription_id}
      `;

      console.log(`⚠️ Subscription ${subscription_id} marked as past_due`);

      // Log transaction
      await logSubscriptionTransaction(
        subscription_id,
        'webhook_payment_failed',
        paymentData.attributes.amount,
        'failed',
        { payment_id: paymentData.id, reason: paymentData.attributes.last_payment_error }
      );
    }

  } catch (error) {
    console.error('❌ Error handling payment.failed webhook:', error);
  }
};

// Webhook helper: Handle chargeable source (e-wallet)
const handleSourceChargeable = async (sourceData) => {
  try {
    const metadata = sourceData.attributes?.metadata || {};
    const vendor_id = metadata.vendor_id;
    const subscription_id = metadata.subscription_id;

    // Create payment for the source
    const payment = await paymongoRequest('/payments', 'POST', {
      attributes: {
        amount: sourceData.attributes.amount,
        source: {
          id: sourceData.id,
          type: sourceData.type
        },
        currency: 'PHP',
        description: metadata.description || 'Subscription payment'
      }
    });

    console.log(`✅ Payment created from chargeable source: ${payment.id}`);

    if (subscription_id) {
      await sql`
        UPDATE vendor_subscriptions
        SET 
          status = 'active',
          updated_at = NOW()
        WHERE id = ${subscription_id}
      `;

      // Log transaction
      await logSubscriptionTransaction(
        subscription_id,
        'ewallet_payment',
        sourceData.attributes.amount,
        'completed',
        { source_id: sourceData.id, payment_id: payment.id }
      );
    }

  } catch (error) {
    console.error('❌ Error creating payment from source:', error);
  }
};

module.exports = router;
