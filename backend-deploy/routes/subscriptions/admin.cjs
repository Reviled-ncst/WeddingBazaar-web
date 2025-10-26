/**
 * 👑 Admin Subscription Management
 * Admin tools for subscription management, CRON jobs, manual operations
 */

const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');
const { authenticateToken } = require('../../middleware/auth.cjs');
const { SUBSCRIPTION_PLANS } = require('./plans.cjs');

// Initialize Neon SQL client
const sql = neon(process.env.DATABASE_URL);

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

// Helper: Create payment intent for subscription
const createSubscriptionPaymentIntent = async (amount, description, customerId, metadata = {}) => {
  try {
    const paymentIntent = await paymongoRequest('/payment_intents', 'POST', {
      attributes: {
        amount: amount,
        currency: 'PHP',
        description: description,
        statement_descriptor: 'WeddingBazaar Subscription',
        metadata: {
          ...metadata,
          platform: 'WeddingBazaar',
          type: 'subscription'
        }
      }
    });
    
    return paymentIntent;
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    throw error;
  }
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
 * GET /api/subscriptions/admin/all
 * Get all subscriptions (admin only)
 */
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const { status, plan } = req.query;

    console.log('📋 Fetching all subscriptions...');

    let query = sql`
      SELECT 
        vs.*,
        u.email as vendor_email,
        vp.business_name
      FROM vendor_subscriptions vs
      LEFT JOIN users u ON vs.vendor_id = u.id
      LEFT JOIN vendor_profiles vp ON vs.vendor_id = vp.vendor_id
    `;

    if (status) {
      query = sql`${query} WHERE vs.status = ${status}`;
    }

    query = sql`${query} ORDER BY vs.created_at DESC`;

    const result = await query;

    const subscriptions = result.map(sub => ({
      ...sub,
      plan: SUBSCRIPTION_PLANS[sub.plan_name] || SUBSCRIPTION_PLANS.basic
    }));

    console.log(`✅ Found ${subscriptions.length} subscriptions`);

    res.json({
      success: true,
      subscriptions: subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    console.error('❌ Error fetching all subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscriptions',
      message: error.message
    });
  }
});

/**
 * POST /api/subscriptions/admin/create-manual
 * Admin: Create subscription manually (for testing or special cases)
 */
router.post('/create-manual', authenticateToken, async (req, res) => {
  try {
    const { vendor_id, plan_name, billing_cycle, duration_months } = req.body;

    console.log(`👑 Admin creating manual subscription for vendor ${vendor_id}`);

    const plan = SUBSCRIPTION_PLANS[plan_name];
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan'
      });
    }

    const start_date = new Date();
    const end_date = new Date(start_date);
    end_date.setMonth(end_date.getMonth() + (duration_months || 1));

    const result = await sql`
      INSERT INTO vendor_subscriptions (
        vendor_id,
        plan_name,
        billing_cycle,
        status,
        start_date,
        end_date,
        next_billing_date,
        cancel_at_period_end
      ) VALUES (
        ${vendor_id},
        ${plan_name},
        ${billing_cycle},
        'active',
        ${start_date.toISOString()},
        ${end_date.toISOString()},
        ${end_date.toISOString()},
        false
      )
      RETURNING *
    `;

    const subscription = result[0];

    await logSubscriptionTransaction(
      subscription.id,
      'admin_created',
      0,
      'completed',
      { created_by: 'admin', duration_months }
    );

    console.log(`✅ Manual subscription created successfully`);

    res.json({
      success: true,
      message: 'Manual subscription created successfully',
      subscription: {
        ...subscription,
        plan: plan
      }
    });

  } catch (error) {
    console.error('❌ Error creating manual subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create manual subscription',
      message: error.message
    });
  }
});

/**
 * POST /api/subscriptions/admin/process-recurring
 * Process recurring billing for all active subscriptions (CRON job)
 */
router.post('/process-recurring', async (req, res) => {
  try {
    const { cron_secret } = req.body;

    // Verify CRON secret
    if (cron_secret !== process.env.CRON_SECRET) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    console.log('🔄 Processing recurring billing...');

    // Get subscriptions due for billing
    const dueSubscriptions = await sql`
      SELECT * FROM vendor_subscriptions
      WHERE status = 'active'
      AND next_billing_date <= CURRENT_DATE
      AND payment_method_id IS NOT NULL
    `;

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const subscription of dueSubscriptions) {
      try {
        const plan = SUBSCRIPTION_PLANS[subscription.plan_name];
        const amount = subscription.billing_cycle === 'yearly' 
          ? plan.price_yearly 
          : plan.price;

        // Create payment intent
        const paymentIntent = await createSubscriptionPaymentIntent(
          amount,
          `${plan.name} - Renewal`,
          subscription.paymongo_customer_id,
          {
            vendor_id: subscription.vendor_id,
            subscription_id: subscription.id,
            type: 'recurring_billing'
          }
        );

        // Attach existing payment method
        const attachedIntent = await paymongoRequest(
          `/payment_intents/${paymentIntent.id}/attach`,
          'POST',
          {
            attributes: {
              payment_method: subscription.payment_method_id
            }
          }
        );

        if (attachedIntent.attributes.status === 'succeeded') {
          // Update subscription dates
          const newEndDate = new Date(subscription.end_date);
          if (subscription.billing_cycle === 'yearly') {
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
          } else {
            newEndDate.setMonth(newEndDate.getMonth() + 1);
          }

          await sql`
            UPDATE vendor_subscriptions
            SET 
              end_date = ${newEndDate.toISOString()},
              next_billing_date = ${newEndDate.toISOString()},
              updated_at = NOW()
            WHERE id = ${subscription.id}
          `;

          await logSubscriptionTransaction(
            subscription.id,
            'recurring_payment',
            amount,
            'completed',
            { payment_intent_id: paymentIntent.id }
          );

          results.successful++;
          console.log(`✅ Recurring payment successful for subscription ${subscription.id}`);

        } else {
          throw new Error('Payment not succeeded');
        }

      } catch (error) {
        // Mark subscription as past_due
        await sql`
          UPDATE vendor_subscriptions
          SET status = 'past_due'
          WHERE id = ${subscription.id}
        `;

        results.failed++;
        results.errors.push({
          subscription_id: subscription.id,
          error: error.message
        });

        console.error(`❌ Recurring payment failed for subscription ${subscription.id}:`, error);
      }

      results.processed++;
    }

    console.log(`✅ Recurring billing complete:`, results);

    res.json({
      success: true,
      results: results
    });

  } catch (error) {
    console.error('❌ Error processing recurring billing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process recurring billing',
      message: error.message
    });
  }
});

/**
 * PUT /api/subscriptions/admin/extend
 * Admin: Extend subscription end date
 */
router.put('/extend', authenticateToken, async (req, res) => {
  try {
    const { subscription_id, extension_days } = req.body;

    console.log(`📅 Extending subscription ${subscription_id} by ${extension_days} days`);

    const result = await sql`
      UPDATE vendor_subscriptions
      SET 
        end_date = end_date + INTERVAL '${extension_days} days',
        next_billing_date = next_billing_date + INTERVAL '${extension_days} days',
        updated_at = NOW()
      WHERE id = ${subscription_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    await logSubscriptionTransaction(
      subscription_id,
      'admin_extension',
      0,
      'completed',
      { extension_days }
    );

    res.json({
      success: true,
      message: `Subscription extended by ${extension_days} days`,
      subscription: result[0]
    });

  } catch (error) {
    console.error('❌ Error extending subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extend subscription',
      message: error.message
    });
  }
});

/**
 * PUT /api/subscriptions/admin/force-cancel
 * Admin: Force cancel subscription (bypass grace period)
 */
router.put('/force-cancel', authenticateToken, async (req, res) => {
  try {
    const { subscription_id, reason } = req.body;

    console.log(`🚫 Force cancelling subscription ${subscription_id}`);

    const result = await sql`
      UPDATE vendor_subscriptions
      SET 
        status = 'cancelled',
        cancelled_at = NOW(),
        cancel_at_period_end = false,
        updated_at = NOW()
      WHERE id = ${subscription_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    await logSubscriptionTransaction(
      subscription_id,
      'admin_force_cancel',
      0,
      'completed',
      { reason: reason || 'Admin action' }
    );

    res.json({
      success: true,
      message: 'Subscription force cancelled',
      subscription: result[0]
    });

  } catch (error) {
    console.error('❌ Error force cancelling subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to force cancel subscription',
      message: error.message
    });
  }
});

/**
 * GET /api/subscriptions/admin/expiring-soon
 * Get subscriptions expiring within specified days
 */
router.get('/expiring-soon', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;

    console.log(`⏰ Fetching subscriptions expiring within ${days} days`);

    const result = await sql`
      SELECT 
        vs.*,
        u.email as vendor_email,
        vp.business_name
      FROM vendor_subscriptions vs
      LEFT JOIN users u ON vs.vendor_id = u.id
      LEFT JOIN vendor_profiles vp ON vs.vendor_id = vp.vendor_id
      WHERE vs.status = 'active'
      AND vs.end_date <= CURRENT_DATE + INTERVAL '${parseInt(days)} days'
      AND vs.end_date > CURRENT_DATE
      ORDER BY vs.end_date ASC
    `;

    const subscriptions = result.map(sub => ({
      ...sub,
      plan: SUBSCRIPTION_PLANS[sub.plan_name] || SUBSCRIPTION_PLANS.basic,
      days_until_expiry: Math.ceil((new Date(sub.end_date) - new Date()) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      success: true,
      expiring_soon: subscriptions,
      count: subscriptions.length
    });

  } catch (error) {
    console.error('❌ Error fetching expiring subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch expiring subscriptions',
      message: error.message
    });
  }
});

module.exports = router;
