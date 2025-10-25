/**
 * 👤 Vendor Subscription Routes
 * Handles vendor-specific subscription queries and basic operations
 */

const express = require('express');
const router = express.Router();
const { sql } = require('@neondatabase/serverless');
const { SUBSCRIPTION_PLANS } = require('./plans.cjs');

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
        next_billing_date,
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
        days_until_renewal: subscription.next_billing_date 
          ? Math.ceil((new Date(subscription.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24))
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

module.exports = router;
