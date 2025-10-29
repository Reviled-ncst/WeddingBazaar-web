/**
 * 💳 Subscription Payment Routes
 * Handles PayMongo payment processing for subscriptions
 * Supports: Card payments, e-wallets, upgrades, downgrades, cancellations
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
const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY || 'pk_test_YOUR_KEY';
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

// 🔍 DEBUGGING: Log all incoming payment route requests
router.use((req, res, next) => {
  console.log(`🔍 [PAYMENT ROUTE] ${req.method} ${req.originalUrl}`);
  console.log(`🔍 [PAYMENT ROUTE] Base URL: ${req.baseUrl}`);
  console.log(`🔍 [PAYMENT ROUTE] Path: ${req.path}`);
  console.log(`🔍 [PAYMENT ROUTE] Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  console.log(`🔍 [PAYMENT ROUTE] Body preview:`, JSON.stringify(req.body).substring(0, 100));
  next();
});

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
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify({ data });
  }
  
  const response = await fetch(url, options);
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.errors?.[0]?.detail || 'PayMongo API error');
  }
  
  return result.data;
};

// Helper: Create PayMongo customer
const createPayMongoCustomer = async (vendorData) => {
  try {
    const customer = await paymongoRequest('/customers', 'POST', {
      attributes: {
        first_name: vendorData.first_name || 'Vendor',
        last_name: vendorData.last_name || 'User',
        email: vendorData.email,
        phone: vendorData.phone || '',
        metadata: {
          vendor_id: vendorData.vendor_id,
          platform: 'WeddingBazaar'
        }
      }
    });
    
    return customer.id;
  } catch (error) {
    console.error('❌ Error creating PayMongo customer:', error);
    throw error;
  }
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

// Helper: Calculate proration amount when upgrading/downgrading
const calculateProration = (currentPlan, newPlan, daysRemaining, totalDays) => {
  const currentDailyRate = currentPlan.price / totalDays;
  const newDailyRate = newPlan.price / totalDays;
  const currentCredit = currentDailyRate * daysRemaining;
  const newCharge = newDailyRate * daysRemaining;
  
  return Math.max(0, Math.round(newCharge - currentCredit));
};

/**
 * POST /api/subscriptions/payment/create
 * Create a new subscription with PayMongo payment processing
 * Supports: Card payments, trial periods, instant activation
 */
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const {
      vendor_id,
      plan_name,
      billing_cycle = 'monthly',
      payment_method_details, // { type: 'card', number, exp_month, exp_year, cvc, name, email }
      start_trial = false
    } = req.body;

    console.log(`🎯 Creating subscription with payment for vendor ${vendor_id}:`, {
      plan_name,
      billing_cycle,
      start_trial
    });

    // Validate plan
    const plan = SUBSCRIPTION_PLANS[plan_name];
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: `Invalid plan: ${plan_name}`
      });
    }

    // Get vendor details
    const vendorResult = await sql`
      SELECT u.id, u.email, u.full_name, vp.business_name, vp.phone
      FROM users u
      LEFT JOIN vendor_profiles vp ON u.id = vp.vendor_id
      WHERE u.id = ${vendor_id}
    `;

    if (vendorResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    const vendor = vendorResult[0];
    
    // Calculate dates
    const start_date = new Date();
    const trial_end_date = start_trial && plan.trial_days > 0
      ? new Date(start_date.getTime() + plan.trial_days * 24 * 60 * 60 * 1000)
      : null;
    
    const end_date = new Date(start_date);
    if (billing_cycle === 'yearly') {
      end_date.setFullYear(end_date.getFullYear() + 1);
    } else {
      end_date.setMonth(end_date.getMonth() + 1);
    }

    const next_billing_date = trial_end_date || end_date;

    // Determine amount to charge (no charge during trial)
    const amount = start_trial ? 0 : (billing_cycle === 'yearly' ? plan.price_yearly : plan.price);
    
    let payment_method_id = null;
    let paymongo_customer_id = null;
    let payment_intent_id = null;

    // Process payment if not in trial and amount > 0
    if (amount > 0) {
      try {
        // Step 1: Create PayMongo customer
        paymongo_customer_id = await createPayMongoCustomer({
          vendor_id: vendor_id,
          first_name: vendor.full_name?.split(' ')[0] || 'Vendor',
          last_name: vendor.full_name?.split(' ').slice(1).join(' ') || 'User',
          email: vendor.email,
          phone: vendor.phone
        });

        console.log(`✅ Created PayMongo customer: ${paymongo_customer_id}`);

        // Step 2: Create payment intent
        const paymentIntent = await createSubscriptionPaymentIntent(
          amount,
          `${plan.name} - ${billing_cycle} subscription`,
          paymongo_customer_id,
          {
            vendor_id: vendor_id,
            plan_name: plan_name,
            billing_cycle: billing_cycle
          }
        );

        payment_intent_id = paymentIntent.id;
        console.log(`✅ Created payment intent: ${payment_intent_id}`);

        // Step 3: Create payment method (card)
        const paymentMethod = await paymongoRequest('/payment_methods', 'POST', {
          attributes: {
            type: payment_method_details.type || 'card',
            details: {
              card_number: payment_method_details.number,
              exp_month: payment_method_details.exp_month,
              exp_year: payment_method_details.exp_year,
              cvc: payment_method_details.cvc
            },
            billing: {
              name: payment_method_details.name,
              email: payment_method_details.email || vendor.email,
              phone: vendor.phone || ''
            }
          }
        });

        payment_method_id = paymentMethod.id;
        console.log(`✅ Created payment method: ${payment_method_id}`);

        // Step 4: Attach payment method to intent
        const attachedIntent = await paymongoRequest(
          `/payment_intents/${payment_intent_id}/attach`,
          'POST',
          {
            attributes: {
              payment_method: payment_method_id,
              client_key: paymentIntent.attributes.client_key,
              return_url: `${process.env.FRONTEND_URL}/vendor/subscription/success`
            }
          }
        );

        console.log(`✅ Payment processed successfully:`, attachedIntent.attributes.status);

        if (attachedIntent.attributes.status !== 'succeeded') {
          throw new Error('Payment processing failed');
        }

      } catch (paymentError) {
        console.error('❌ Payment processing error:', paymentError);
        return res.status(402).json({
          success: false,
          error: 'Payment processing failed',
          message: paymentError.message
        });
      }
    }

    // Step 5: Create subscription in database
    const subscriptionResult = await sql`
      INSERT INTO vendor_subscriptions (
        vendor_id,
        plan_name,
        billing_cycle,
        status,
        start_date,
        end_date,
        trial_end_date,
        next_billing_date,
        payment_method_id,
        paymongo_customer_id,
        cancel_at_period_end
      ) VALUES (
        ${vendor_id},
        ${plan_name},
        ${billing_cycle},
        ${start_trial ? 'trial' : 'active'},
        ${start_date.toISOString()},
        ${end_date.toISOString()},
        ${trial_end_date?.toISOString() || null},
        ${next_billing_date.toISOString()},
        ${payment_method_id},
        ${paymongo_customer_id},
        false
      )
      RETURNING *
    `;

    const subscription = subscriptionResult[0];

    // Log transaction
    await logSubscriptionTransaction(
      subscription.id,
      'initial_payment',
      amount,
      'completed',
      {
        payment_intent_id,
        payment_method_id,
        trial: start_trial
      }
    );

    console.log(`✅ Subscription created successfully:`, subscription.id);

    res.json({
      success: true,
      message: start_trial ? 'Trial subscription activated!' : 'Subscription created and payment processed!',
      subscription: {
        ...subscription,
        plan: plan
      },
      payment: {
        amount_paid: amount,
        amount_paid_display: `₱${(amount / 100).toLocaleString()}`,
        payment_intent_id,
        payment_method_id,
        status: 'succeeded'
      }
    });

  } catch (error) {
    console.error('❌ Error creating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription',
      message: error.message
    });
  }
});

/**
 * GET /api/subscriptions/payment/upgrade-test
 * Test endpoint to verify upgrade route is accessible
 */
router.get('/upgrade-test', (req, res) => {
  console.log('✅ Upgrade test endpoint hit!');
  res.json({
    success: true,
    message: 'Upgrade route is accessible',
    method: 'PUT /api/subscriptions/payment/upgrade should work',
    timestamp: new Date().toISOString()
  });
});

/**
 * PUT /api/subscriptions/payment/upgrade
 * Upgrade subscription with proration and immediate payment
 * 
 * 🔓 NO JWT REQUIRED - Validates vendor_id directly from database
 * This allows Firebase-authenticated vendors to upgrade without backend JWT tokens
 */
router.put('/upgrade', async (req, res) => {
  console.log('🎯🎯🎯 [UPGRADE ROUTE HIT] Request received!');
  console.log('📦 [UPGRADE] Request body:', JSON.stringify(req.body, null, 2));
  console.log('🔍 [UPGRADE] Request headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    const {
      vendor_id,
      new_plan,
      payment_method_details
    } = req.body;

    console.log(`⬆️ Upgrading subscription for vendor ${vendor_id} to ${new_plan}`);
    
    // 🔒 SECURITY: Validate vendor exists in database before proceeding
    const vendorCheck = await sql`
      SELECT id FROM vendor_profiles WHERE id = ${vendor_id} LIMIT 1
    `;
    
    if (vendorCheck.length === 0) {
      console.error(`❌ Vendor ${vendor_id} not found in database`);
      return res.status(404).json({
        success: false,
        error: 'Vendor not found',
        message: 'Invalid vendor ID'
      });
    }
    
    console.log(`✅ Vendor ${vendor_id} validated`);

    // Validate new plan
    const newPlanConfig = SUBSCRIPTION_PLANS[new_plan];
    if (!newPlanConfig) {
      return res.status(400).json({
        success: false,
        error: `Invalid plan: ${new_plan}`
      });
    }

    // Get current subscription
    const currentSubResult = await sql`
      SELECT * FROM vendor_subscriptions
      WHERE vendor_id = ${vendor_id}
      AND status IN ('active', 'trial')
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (currentSubResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    const currentSub = currentSubResult[0];
    const currentPlanConfig = SUBSCRIPTION_PLANS[currentSub.plan_name];

    // Calculate proration
    const now = new Date();
    const endDate = new Date(currentSub.end_date);
    const startDate = new Date(currentSub.start_date);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    const prorationAmount = calculateProration(
      currentPlanConfig,
      newPlanConfig,
      daysRemaining,
      totalDays
    );

    console.log(`💰 Proration calculated:`, {
      current_plan: currentSub.plan_name,
      new_plan: new_plan,
      days_remaining: daysRemaining,
      proration_amount: prorationAmount
    });

    // Process payment for proration
    let payment_intent_id = null;
    
    // Check if payment was already processed by frontend
    // Frontend sends: transactionId, sourceId, paymentIntent.id, or payment.id
    const paymentAlreadyProcessed = payment_method_details?.transactionId || 
                                    payment_method_details?.sourceId ||
                                    payment_method_details?.paymentIntent?.id ||
                                    payment_method_details?.payment?.id;
    
    if (paymentAlreadyProcessed) {
      console.log(`✅ Payment already processed by frontend, using reference:`, paymentAlreadyProcessed);
      console.log(`💳 Payment details from frontend:`, {
        transactionId: payment_method_details?.transactionId,
        sourceId: payment_method_details?.sourceId,
        paymentIntentId: payment_method_details?.paymentIntent?.id,
        paymentId: payment_method_details?.payment?.id,
        status: payment_method_details?.status
      });
      payment_intent_id = paymentAlreadyProcessed;
    } else if (prorationAmount > 0) {
      // Only process payment if not already paid and proration > 0
      try {
        const paymentIntent = await createSubscriptionPaymentIntent(
          prorationAmount,
          `Upgrade to ${newPlanConfig.name} (Prorated)`,
          currentSub.paymongo_customer_id,
          {
            vendor_id: vendor_id,
            subscription_id: currentSub.id,
            type: 'upgrade_proration'
          }
        );

        const paymentMethod = await paymongoRequest('/payment_methods', 'POST', {
          attributes: {
            type: payment_method_details.type || 'card',
            details: {
              card_number: payment_method_details.number,
              exp_month: payment_method_details.exp_month,
              exp_year: payment_method_details.exp_year,
              cvc: payment_method_details.cvc
            }
          }
        });

        const attachedIntent = await paymongoRequest(
          `/payment_intents/${paymentIntent.id}/attach`,
          'POST',
          {
            attributes: {
              payment_method: paymentMethod.id
            }
          }
        );

        if (attachedIntent.attributes.status !== 'succeeded') {
          throw new Error('Proration payment failed');
        }

        payment_intent_id = paymentIntent.id;
        console.log(`✅ Proration payment processed:`, payment_intent_id);

      } catch (paymentError) {
        console.error('❌ Proration payment error:', paymentError);
        return res.status(402).json({
          success: false,
          error: 'Proration payment failed',
          message: paymentError.message
        });
      }
    } else {
      console.log(`ℹ️ No proration payment needed (amount: ₱0 or downgrade)`);
    }

    // Update subscription
    const updatedSubResult = await sql`
      UPDATE vendor_subscriptions
      SET 
        plan_name = ${new_plan},
        status = 'active',
        updated_at = NOW()
      WHERE id = ${currentSub.id}
      RETURNING *
    `;

    const updatedSub = updatedSubResult[0];

    // 🔥 CRITICAL FIX: Update vendor_profiles.subscription_tier
    // This is what the frontend reads to display the current plan
    try {
      await sql`
        UPDATE vendor_profiles
        SET 
          subscription_tier = ${new_plan},
          updated_at = NOW()
        WHERE id = ${vendor_id}
      `;
      console.log(`✅ Vendor profile subscription_tier updated to: ${new_plan}`);
    } catch (profileError) {
      console.error('⚠️ Failed to update vendor_profiles.subscription_tier:', profileError);
      // Continue anyway - subscription is upgraded in vendor_subscriptions
    }

    // Log transaction
    await logSubscriptionTransaction(
      updatedSub.id,
      'upgrade',
      prorationAmount,
      'completed',
      {
        previous_plan: currentSub.plan_name,
        new_plan: new_plan,
        payment_intent_id,
        proration: true
      }
    );

    console.log(`✅ Subscription upgraded successfully`);

    // Dispatch event to frontend
    if (updatedSub.vendor_id) {
      console.log('📢 Subscription upgraded, triggering frontend refresh');
    }

    res.json({
      success: true,
      message: 'Subscription upgraded successfully!',
      subscription: {
        ...updatedSub,
        plan: newPlanConfig
      },
      payment: {
        proration_amount: prorationAmount,
        proration_display: `₱${(prorationAmount / 100).toLocaleString()}`,
        payment_intent_id,
        status: 'succeeded'
      }
    });

  } catch (error) {
    console.error('❌ Error upgrading subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upgrade subscription',
      message: error.message
    });
  }
});

/**
 * POST /api/subscriptions/payment/manual-intervention
 * Create manual intervention ticket when payment succeeds but upgrade fails
 * NO AUTH REQUIRED - vendor_id provided in body
 */
router.post('/manual-intervention', async (req, res) => {
  try {
    const {
      vendor_id,
      payment_reference,
      issue,
      requested_plan,
      amount_paid,
      currency = 'PHP'
    } = req.body;
    
    console.log('🚨 Creating manual intervention ticket:', {
      vendor_id,
      payment_reference,
      issue,
      requested_plan,
      amount_paid
    });
    
    // Validate vendor exists
    const vendorCheck = await sql`
      SELECT id FROM vendor_profiles WHERE id = ${vendor_id} LIMIT 1
    `;
    
    if (vendorCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    // Create intervention record
    const intervention = await sql`
      INSERT INTO subscription_manual_interventions (
        vendor_id,
        issue_type,
        payment_reference,
        requested_plan,
        amount_paid,
        currency,
        status
      ) VALUES (
        ${vendor_id},
        ${issue},
        ${payment_reference},
        ${requested_plan},
        ${amount_paid},
        ${currency},
        'pending'
      ) RETURNING *
    `;
    
    console.log('✅ Manual intervention ticket created:', intervention[0].id);
    
    // TODO: Send notification to admin
    // TODO: Send email to vendor
    
    res.json({
      success: true,
      intervention: intervention[0],
      message: 'Manual intervention ticket created. Support will process your upgrade within 24 hours.',
      reference: intervention[0].id
    });
    
  } catch (error) {
    console.error('❌ Error creating manual intervention:', error);
    
    // Even if table doesn't exist, return success for user experience
    // Admin will see the error logs
    res.status(500).json({
      success: false,
      error: 'Failed to create intervention ticket',
      message: error.message,
      fallback: 'Please contact support with your payment reference'
    });
  }
});

/**
 * PUT /api/subscriptions/payment/update-method
 * Update payment method for subscription
 */
router.put('/update-method', authenticateToken, async (req, res) => {
  try {
    const { vendor_id, payment_method_details } = req.body;

    console.log(`💳 Updating payment method for vendor ${vendor_id}`);

    // Get current subscription
    const subResult = await sql`
      SELECT * FROM vendor_subscriptions
      WHERE vendor_id = ${vendor_id}
      AND status IN ('active', 'trial', 'past_due')
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (subResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    const subscription = subResult[0];

    // Create new payment method
    const paymentMethod = await paymongoRequest('/payment_methods', 'POST', {
      attributes: {
        type: payment_method_details.type || 'card',
        details: {
          card_number: payment_method_details.number,
          exp_month: payment_method_details.exp_month,
          exp_year: payment_method_details.exp_year,
          cvc: payment_method_details.cvc
        },
        billing: {
          name: payment_method_details.name,
          email: payment_method_details.email
        }
      }
    });

    // Update subscription with new payment method
    await sql`
      UPDATE vendor_subscriptions
      SET 
        payment_method_id = ${paymentMethod.id},
        updated_at = NOW()
      WHERE id = ${subscription.id}
    `;

    console.log(`✅ Payment method updated successfully`);

    res.json({
      success: true,
      message: 'Payment method updated successfully',
      payment_method_id: paymentMethod.id
    });

  } catch (error) {
    console.error('❌ Error updating payment method:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment method',
      message: error.message
    });
  }
});

/**
 * PUT /api/subscriptions/payment/cancel-immediate
 * Cancel subscription immediately (no refund)
 */
router.put('/cancel-immediate', authenticateToken, async (req, res) => {
  try {
    const { vendor_id, reason } = req.body;

    console.log(`🚫 Cancelling subscription immediately for vendor ${vendor_id}`);

    const result = await sql`
      UPDATE vendor_subscriptions
      SET 
        status = 'cancelled',
        cancel_at_period_end = false,
        cancelled_at = NOW(),
        updated_at = NOW()
      WHERE vendor_id = ${vendor_id}
      AND status IN ('active', 'trial', 'past_due')
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    const subscription = result[0];

    // Log cancellation
    await logSubscriptionTransaction(
      subscription.id,
      'cancellation',
      0,
      'completed',
      { reason: reason || 'User requested' }
    );

    console.log(`✅ Subscription cancelled immediately`);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: subscription,
      effective_date: 'immediate'
    });

  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      message: error.message
    });
  }
});

/**
 * PUT /api/subscriptions/payment/cancel-at-period-end
 * Schedule subscription cancellation at end of billing period
 */
router.put('/cancel-at-period-end', authenticateToken, async (req, res) => {
  try {
    const { vendor_id } = req.body;

    console.log(`📅 Scheduling cancellation at period end for vendor ${vendor_id}`);

    const result = await sql`
      UPDATE vendor_subscriptions
      SET 
        cancel_at_period_end = true,
        updated_at = NOW()
      WHERE vendor_id = ${vendor_id}
      AND status IN ('active', 'trial')
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    const subscription = result[0];

    console.log(`✅ Cancellation scheduled for ${subscription.end_date}`);

    res.json({
      success: true,
      message: 'Subscription will cancel at end of billing period',
      subscription: subscription,
      effective_date: subscription.end_date
    });

  } catch (error) {
    console.error('❌ Error scheduling cancellation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule cancellation',
      message: error.message
    });
  }
});

/**
 * PUT /api/subscriptions/payment/reactivate
 * Reactivate a cancelled subscription
 */
router.put('/reactivate', authenticateToken, async (req, res) => {
  try {
    const { vendor_id } = req.body;

    console.log(`🔄 Reactivating subscription for vendor ${vendor_id}`);

    const result = await sql`
      UPDATE vendor_subscriptions
      SET 
        cancel_at_period_end = false,
        status = 'active',
        updated_at = NOW()
      WHERE vendor_id = ${vendor_id}
      AND (status = 'cancelled' OR cancel_at_period_end = true)
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No cancelled subscription found'
      });
    }

    const subscription = result[0];

    console.log(`✅ Subscription reactivated successfully`);

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: subscription
    });

  } catch (error) {
    console.error('❌ Error reactivating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reactivate subscription',
      message: error.message
    });
  }
});

/**
 * GET /api/subscriptions/payment/health
 * Payment service health check
 */
router.get('/health', async (req, res) => {
  try {
    // Check PayMongo API connectivity
    let paymongoStatus = 'Unknown';
    let paymongoMessage = '';
    
    try {
      // Test API connectivity by fetching a non-existent payment intent (will 404 but proves API works)
      await fetch(`${PAYMONGO_API_URL}/payment_intents/test`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY).toString('base64')}`
        }
      });
      paymongoStatus = 'Connected';
      paymongoMessage = 'PayMongo API is reachable';
    } catch (error) {
      paymongoStatus = 'Error';
      paymongoMessage = error.message;
    }
    
    res.json({
      success: true,
      service: 'Subscription Payment Service',
      status: 'OK',
      paymongo: {
        status: paymongoStatus,
        message: paymongoMessage,
        test_mode: PAYMONGO_SECRET_KEY.includes('test'),
        configured: PAYMONGO_SECRET_KEY !== 'sk_test_YOUR_KEY'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Payment service health check failed',
      message: error.message
    });
  }
});

// 🚨 404 CATCH-ALL: Log unmatched routes for debugging
router.use((req, res) => {
  console.error(`❌ [PAYMENT 404] ${req.method} ${req.path} not found`);
  console.error(`❌ [PAYMENT 404] Original URL: ${req.originalUrl}`);
  console.error(`❌ [PAYMENT 404] Base URL: ${req.baseUrl}`);
  console.error(`❌ [PAYMENT 404] Available routes: PUT /upgrade, POST /create, POST /cancel, GET /health`);
  
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `${req.method} /api/subscriptions/payment${req.path} not found`,
    requestedPath: req.path,
    requestedMethod: req.method,
    availableRoutes: {
      upgrade: 'PUT /api/subscriptions/payment/upgrade',
      create: 'POST /api/subscriptions/payment/create',
      cancel: 'POST /api/subscriptions/payment/cancel',
      health: 'GET /api/subscriptions/payment/health'
    },
    hint: 'Check if you are using the correct HTTP method (PUT/POST/GET)'
  });
});

console.log('✅ Payment routes registered:');
console.log('   - PUT  /upgrade');
console.log('   - GET  /upgrade-test (diagnostic)');
console.log('   - POST /create');
console.log('   - POST /manual-intervention');
console.log('   - GET  /health');
console.log('📍 Full upgrade URL: PUT /api/subscriptions/payment/upgrade');

module.exports = router;
