/**
 * 👤 Vendor Subscription Routes
 * Handles vendor-specific subscription queries and basic operations
 */

const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');
const { SUBSCRIPTION_PLANS } = require('./plans.cjs');
const { authenticateToken } = require('../../middleware/auth.cjs');

// Initialize Neon SQL client
const sql = neon(process.env.DATABASE_URL);

/**
 * GET /api/subscriptions/vendor/:vendorId
 * Get subscription for a specific vendor
 */
router.get('/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log(`🔍 Fetching subscription for vendor: ${vendorId}`);

    // Query the vendor_subscriptions table
    const result = await sql`
      SELECT 
        id,
        vendor_id,
        plan_name,
        billing_cycle,
        status,
        start_date,
        end_date,
        trial_end_date,
        current_period_end,
        cancel_at_period_end,
        cancelled_at,
        created_at,
        updated_at
      FROM vendor_subscriptions
      WHERE vendor_id = ${vendorId}
      AND status IN ('active', 'trial')
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      // No subscription found - return default basic plan
      console.log(`⚠️ No subscription found for vendor ${vendorId}, returning basic plan`);
      return res.json({
        success: true,
        subscription: {
          id: null,
          vendor_id: vendorId,
          plan_name: 'basic',
          plan: SUBSCRIPTION_PLANS.basic,
          billing_cycle: 'monthly',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    }

    const subscription = result[0];
    const plan = SUBSCRIPTION_PLANS[subscription.plan_name] || SUBSCRIPTION_PLANS.basic;

    console.log(`✅ Found subscription for vendor ${vendorId}:`, {
      plan_name: subscription.plan_name,
      status: subscription.status
    });

    res.json({
      success: true,
      subscription: {
        ...subscription,
        plan: plan,
        next_billing_date: subscription.current_period_end,
        days_until_renewal: subscription.current_period_end 
          ? Math.ceil((new Date(subscription.current_period_end) - new Date()) / (1000 * 60 * 60 * 24))
          : null,
        is_trial: subscription.status === 'trial',
        will_cancel: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    console.error('❌ Error fetching vendor subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor subscription',
      message: error.message
    });
  }
});

/**
 * GET /api/subscriptions/vendor/:vendorId/history
 * Get subscription history for a vendor
 */
router.get('/:vendorId/history', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log(`📜 Fetching subscription history for vendor: ${vendorId}`);

    const result = await sql`
      SELECT 
        id,
        plan_name,
        billing_cycle,
        status,
        start_date,
        end_date,
        cancelled_at,
        created_at
      FROM vendor_subscriptions
      WHERE vendor_id = ${vendorId}
      ORDER BY created_at DESC
    `;

    const history = result.map(sub => ({
      ...sub,
      plan: SUBSCRIPTION_PLANS[sub.plan_name] || SUBSCRIPTION_PLANS.basic,
      duration_days: Math.ceil((new Date(sub.end_date) - new Date(sub.start_date)) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      success: true,
      history: history,
      count: history.length
    });
  } catch (error) {
    console.error('❌ Error fetching subscription history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription history',
      message: error.message
    });
  }
});

/**
 * GET /api/subscriptions/vendor/:vendorId/transactions
 * Get payment transactions for a vendor's subscriptions
 */
router.get('/:vendorId/transactions', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    console.log(`💰 Fetching transactions for vendor: ${vendorId}`);

    const result = await sql`
      SELECT st.*
      FROM subscription_transactions st
      JOIN vendor_subscriptions vs ON st.subscription_id = vs.id
      WHERE vs.vendor_id = ${vendorId}
      ORDER BY st.created_at DESC
      LIMIT ${parseInt(limit)}
      OFFSET ${parseInt(offset)}
    `;

    const transactions = result.map(tx => ({
      ...tx,
      amount_display: `₱${(tx.amount / 100).toLocaleString()}`,
      metadata: typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata
    }));

    res.json({
      success: true,
      transactions: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message
    });
  }
});

/**
 * GET /api/subscriptions/vendor/:vendorId/benefits
 * Get available benefits and features for vendor's current plan
 */
router.get('/:vendorId/benefits', async (req, res) => {
  try {
    const { vendorId } = req.params;

    const subResult = await sql`
      SELECT plan_name FROM vendor_subscriptions
      WHERE vendor_id = ${vendorId}
      AND status IN ('active', 'trial')
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const planName = subResult.length > 0 ? subResult[0].plan_name : 'basic';
    const plan = SUBSCRIPTION_PLANS[planName] || SUBSCRIPTION_PLANS.basic;

    res.json({
      success: true,
      plan: plan.name,
      tier: plan.tier,
      features: plan.features,
      limits: plan.limits,
      benefits: {
        unlimited_services: plan.limits.max_services === -1,
        unlimited_portfolio: plan.limits.max_portfolio_items === -1,
        featured_listing: plan.limits.featured_listing,
        priority_support: plan.limits.priority_support,
        advanced_analytics: plan.limits.advanced_analytics,
        custom_branding: plan.limits.custom_branding,
        api_access: plan.limits.api_access
      }
    });
  } catch (error) {
    console.error('❌ Error fetching benefits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch benefits',
      message: error.message
    });
  }
});

/**
 * POST /api/subscriptions/vendor/create
 * Create a new subscription for a vendor (free tier or basic)
 */
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { vendor_id, plan_name = 'basic', billing_cycle = 'monthly' } = req.body;

    console.log(`📝 Creating subscription for vendor ${vendor_id}:`, {
      plan_name,
      billing_cycle
    });

    // Validate plan name
    if (!SUBSCRIPTION_PLANS[plan_name]) {
      return res.status(400).json({
        success: false,
        error: `Invalid plan name: ${plan_name}`
      });
    }

    // Calculate end date based on billing cycle
    const start_date = new Date();
    const end_date = new Date(start_date);
    if (billing_cycle === 'yearly') {
      end_date.setFullYear(end_date.getFullYear() + 1);
    } else {
      end_date.setMonth(end_date.getMonth() + 1);
    }

    // Insert new subscription
    const result = await sql`
      INSERT INTO vendor_subscriptions (
        vendor_id,
        plan_name,
        billing_cycle,
        status,
        start_date,
        end_date
      ) VALUES (
        ${vendor_id},
        ${plan_name},
        ${billing_cycle},
        'active',
        ${start_date.toISOString()},
        ${end_date.toISOString()}
      )
      RETURNING *
    `;

    const subscription = result[0];
    const plan = SUBSCRIPTION_PLANS[plan_name];

    console.log(`✅ Subscription created successfully:`, subscription);

    res.json({
      success: true,
      subscription: {
        ...subscription,
        plan: plan
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
 * PUT /api/subscriptions/vendor/upgrade
 * Upgrade vendor subscription to a higher tier
 * NOTE: Authentication optional - vendor_id must be provided in request body
 */
router.put('/upgrade', async (req, res) => {
  try {
    const { vendor_id, new_plan } = req.body;

    console.log(`⬆️ Upgrading subscription for vendor ${vendor_id} to ${new_plan}`);

    // Validate plan name
    if (!SUBSCRIPTION_PLANS[new_plan]) {
      return res.status(400).json({
        success: false,
        error: `Invalid plan name: ${new_plan}`
      });
    }

    // Check if vendor has an existing subscription
    const existing = await sql`
      SELECT * FROM vendor_subscriptions
      WHERE vendor_id = ${vendor_id}
      AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (existing.length === 0) {
      // Create new subscription if none exists
      const start_date = new Date();
      const end_date = new Date(start_date);
      end_date.setMonth(end_date.getMonth() + 1);

      const result = await sql`
        INSERT INTO vendor_subscriptions (
          vendor_id,
          plan_name,
          billing_cycle,
          status,
          start_date,
          end_date
        ) VALUES (
          ${vendor_id},
          ${new_plan},
          'monthly',
          'active',
          ${start_date.toISOString()},
          ${end_date.toISOString()}
        )
        RETURNING *
      `;

      const subscription = result[0];
      const plan = SUBSCRIPTION_PLANS[new_plan];

      console.log(`✅ New subscription created:`, subscription);

      return res.json({
        success: true,
        message: 'Subscription created successfully',
        subscription: {
          ...subscription,
          plan: plan
        }
      });
    }

    // Update existing subscription
    const result = await sql`
      UPDATE vendor_subscriptions
      SET 
        plan_name = ${new_plan},
        updated_at = NOW()
      WHERE vendor_id = ${vendor_id}
      AND status = 'active'
      RETURNING *
    `;

    const subscription = result[0];
    const plan = SUBSCRIPTION_PLANS[new_plan];

    console.log(`✅ Subscription upgraded successfully:`, subscription);

    res.json({
      success: true,
      message: 'Subscription upgraded successfully',
      subscription: {
        ...subscription,
        plan: plan
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
 * PUT /api/subscriptions/vendor/downgrade
 * Downgrade vendor subscription to a lower tier
 */
router.put('/downgrade', authenticateToken, async (req, res) => {
  try {
    const { vendor_id, new_plan } = req.body;

    console.log(`⬇️ Downgrading subscription for vendor ${vendor_id} to ${new_plan}`);

    // Validate plan name
    if (!SUBSCRIPTION_PLANS[new_plan]) {
      return res.status(400).json({
        success: false,
        error: `Invalid plan name: ${new_plan}`
      });
    }

    // Update subscription
    const result = await sql`
      UPDATE vendor_subscriptions
      SET 
        plan_name = ${new_plan},
        updated_at = NOW()
      WHERE vendor_id = ${vendor_id}
      AND status = 'active'
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    const subscription = result[0];
    const plan = SUBSCRIPTION_PLANS[new_plan];

    console.log(`✅ Subscription downgraded successfully:`, subscription);

    res.json({
      success: true,
      message: 'Subscription downgraded successfully',
      subscription: {
        ...subscription,
        plan: plan
      }
    });
  } catch (error) {
    console.error('❌ Error downgrading subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to downgrade subscription',
      message: error.message
    });
  }
});

/**
 * PUT /api/subscriptions/vendor/cancel
 * Cancel vendor subscription (immediate or at period end)
 */
router.put('/cancel', authenticateToken, async (req, res) => {
  try {
    const { vendor_id } = req.body;

    console.log(`🚫 Cancelling subscription for vendor ${vendor_id}`);

    const result = await sql`
      UPDATE vendor_subscriptions
      SET 
        status = 'cancelled',
        updated_at = NOW()
      WHERE vendor_id = ${vendor_id}
      AND status = 'active'
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    console.log(`✅ Subscription cancelled successfully`);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: result[0]
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
 * PUT /api/subscriptions/vendor/cancel-at-period-end
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
 * PUT /api/subscriptions/vendor/cancel-immediate
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
 * PUT /api/subscriptions/vendor/reactivate
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
 * GET /api/subscriptions/vendor/all
 * Get all subscriptions (admin only)
 */
router.get('/all', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching all subscriptions...');

    const result = await sql`
      SELECT 
        vs.*,
        u.email as vendor_email,
        vp.business_name
      FROM vendor_subscriptions vs
      LEFT JOIN users u ON vs.vendor_id = u.id
      LEFT JOIN vendor_profiles vp ON vs.vendor_id = vp.vendor_id
      ORDER BY vs.created_at DESC
    `;

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

module.exports = router;
