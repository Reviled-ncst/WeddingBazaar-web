/**
 * 📊 Usage Tracking & Limit Enforcement
 * Tracks vendor usage against subscription limits
 * Enforces limits for services, portfolio, bookings, messages
 */

const express = require('express');
const router = express.Router();
const { sql } = require('@neondatabase/serverless');
const { authenticateToken } = require('../../middleware/auth.cjs');
const { SUBSCRIPTION_PLANS } = require('./plans.cjs');

/**
 * GET /api/subscriptions/usage/:vendorId
 * Get current usage statistics for a vendor
 */
router.get('/:vendorId', authenticateToken, async (req, res) => {
  try {
    const { vendorId } = req.params;

    console.log(`📊 Fetching usage statistics for vendor ${vendorId}`);

    // Get subscription
    const subResult = await sql`
      SELECT * FROM vendor_subscriptions
      WHERE vendor_id = ${vendorId}
      AND status IN ('active', 'trial')
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
    const plan = SUBSCRIPTION_PLANS[subscription.plan_name];

    // Get actual usage from database
    const servicesCount = await sql`
      SELECT COUNT(*) as count FROM services WHERE vendor_id = ${vendorId}
    `;

    const portfolioCount = await sql`
      SELECT COUNT(*) as count FROM portfolio_images WHERE vendor_id = ${vendorId}
    `;

    const bookingsThisMonth = await sql`
      SELECT COUNT(*) as count FROM bookings 
      WHERE vendor_id = ${vendorId}
      AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `;

    const messagesThisMonth = await sql`
      SELECT COUNT(*) as count FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.vendor_id = ${vendorId}
      AND DATE_TRUNC('month', m.created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `;

    const usage = {
      services: {
        current: parseInt(servicesCount[0].count),
        limit: plan.limits.max_services,
        unlimited: plan.limits.max_services === -1,
        percentage: plan.limits.max_services === -1 ? 0 : (parseInt(servicesCount[0].count) / plan.limits.max_services) * 100
      },
      portfolio: {
        current: parseInt(portfolioCount[0].count),
        limit: plan.limits.max_portfolio_items,
        unlimited: plan.limits.max_portfolio_items === -1,
        percentage: plan.limits.max_portfolio_items === -1 ? 0 : (parseInt(portfolioCount[0].count) / plan.limits.max_portfolio_items) * 100
      },
      bookings_monthly: {
        current: parseInt(bookingsThisMonth[0].count),
        limit: plan.limits.max_monthly_bookings,
        unlimited: plan.limits.max_monthly_bookings === -1,
        percentage: plan.limits.max_monthly_bookings === -1 ? 0 : (parseInt(bookingsThisMonth[0].count) / plan.limits.max_monthly_bookings) * 100
      },
      messages_monthly: {
        current: parseInt(messagesThisMonth[0].count),
        limit: plan.limits.max_monthly_messages,
        unlimited: plan.limits.max_monthly_messages === -1,
        percentage: plan.limits.max_monthly_messages === -1 ? 0 : (parseInt(messagesThisMonth[0].count) / plan.limits.max_monthly_messages) * 100
      }
    };

    res.json({
      success: true,
      usage: usage,
      plan: {
        name: plan.name,
        tier: plan.tier
      },
      warnings: {
        services_near_limit: usage.services.percentage > 80,
        portfolio_near_limit: usage.portfolio.percentage > 80,
        bookings_near_limit: usage.bookings_monthly.percentage > 80,
        messages_near_limit: usage.messages_monthly.percentage > 80
      }
    });

  } catch (error) {
    console.error('❌ Error fetching usage statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage statistics',
      message: error.message
    });
  }
});

/**
 * POST /api/subscriptions/usage/check-limit
 * Check if vendor can perform an action based on subscription limits
 */
router.post('/check-limit', authenticateToken, async (req, res) => {
  try {
    const { vendor_id, action, current_count } = req.body;
    // action: 'create_service', 'upload_portfolio', 'accept_booking', 'send_message'

    console.log(`🔒 Checking limit for ${action} by vendor ${vendor_id}`);

    const subResult = await sql`
      SELECT * FROM vendor_subscriptions
      WHERE vendor_id = ${vendor_id}
      AND status IN ('active', 'trial')
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (subResult.length === 0) {
      // No subscription = basic plan limits
      const basicPlan = SUBSCRIPTION_PLANS.basic;
      const allowed = current_count < basicPlan.limits.max_services;
      
      return res.json({
        success: true,
        allowed: allowed,
        plan: 'basic',
        limit: basicPlan.limits.max_services,
        current: current_count,
        message: allowed ? 'Action allowed' : `Free tier limit reached (${basicPlan.limits.max_services} services). Upgrade to add more!`
      });
    }

    const subscription = subResult[0];
    const plan = SUBSCRIPTION_PLANS[subscription.plan_name];

    let limit, allowed, message;

    switch (action) {
      case 'create_service':
        limit = plan.limits.max_services;
        allowed = limit === -1 || current_count < limit;
        message = allowed ? 'Can create service' : `Service limit reached (${limit}). Upgrade for unlimited services!`;
        break;
      
      case 'upload_portfolio':
        limit = plan.limits.max_portfolio_items;
        allowed = limit === -1 || current_count < limit;
        message = allowed ? 'Can upload image' : `Portfolio limit reached (${limit}). Upgrade for more images!`;
        break;
      
      case 'accept_booking':
        limit = plan.limits.max_monthly_bookings;
        allowed = limit === -1 || current_count < limit;
        message = allowed ? 'Can accept booking' : `Monthly booking limit reached (${limit}). Upgrade for unlimited bookings!`;
        break;
      
      case 'send_message':
        limit = plan.limits.max_monthly_messages;
        allowed = limit === -1 || current_count < limit;
        message = allowed ? 'Can send message' : `Monthly message limit reached (${limit}). Upgrade for more messages!`;
        break;
      
      default:
        allowed = true;
        message = 'Unknown action';
    }

    res.json({
      success: true,
      allowed: allowed,
      plan: plan.tier,
      limit: limit,
      current: current_count,
      message: message,
      upgrade_required: !allowed
    });

  } catch (error) {
    console.error('❌ Error checking limit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check limit',
      message: error.message
    });
  }
});

/**
 * POST /api/subscriptions/usage/increment
 * Increment usage counter for a specific action
 */
router.post('/increment', authenticateToken, async (req, res) => {
  try {
    const { vendor_id, action } = req.body;

    console.log(`📈 Incrementing usage for ${action} by vendor ${vendor_id}`);

    // This would update usage counters in vendor_subscriptions table
    // For now, we're tracking usage directly from the tables (services, bookings, etc.)
    
    res.json({
      success: true,
      message: 'Usage tracked successfully'
    });

  } catch (error) {
    console.error('❌ Error incrementing usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to increment usage',
      message: error.message
    });
  }
});

module.exports = router;
