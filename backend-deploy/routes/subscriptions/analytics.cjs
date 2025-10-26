/**
 * 📈 Subscription Analytics Module
 * Business analytics, revenue tracking, and subscription metrics
 */

const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');
const { authenticateToken } = require('../../middleware/auth.cjs');
const { SUBSCRIPTION_PLANS } = require('./plans.cjs');

// Initialize Neon SQL client
const sql = neon(process.env.DATABASE_URL);

/**
 * GET /api/subscriptions/analytics/overview
 * Get subscription analytics overview (admin)
 */
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    console.log('📈 Fetching subscription analytics overview');

    // Total subscriptions by plan
    const byPlan = await sql`
      SELECT 
        plan_name,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
      FROM vendor_subscriptions
      GROUP BY plan_name
    `;

    // Revenue calculations
    const revenue = await sql`
      SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as total_transactions,
        AVG(amount) as avg_transaction
      FROM subscription_transactions
      WHERE status = 'completed'
    `;

    // Monthly revenue
    const monthlyRevenue = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM subscription_transactions
      WHERE status = 'completed'
      AND created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `;

    // Churn rate (last 30 days)
    const churnData = await sql`
      SELECT 
        COUNT(*) as cancelled_count
      FROM vendor_subscriptions
      WHERE status = 'cancelled'
      AND cancelled_at >= CURRENT_DATE - INTERVAL '30 days'
    `;

    const totalActive = await sql`
      SELECT COUNT(*) as count
      FROM vendor_subscriptions
      WHERE status IN ('active', 'trial')
    `;

    const churnRate = totalActive[0].count > 0 
      ? (churnData[0].cancelled_count / totalActive[0].count) * 100 
      : 0;

    res.json({
      success: true,
      analytics: {
        by_plan: byPlan,
        revenue: {
          total: parseInt(revenue[0].total_revenue || 0),
          total_display: `₱${((revenue[0].total_revenue || 0) / 100).toLocaleString()}`,
          transactions: parseInt(revenue[0].total_transactions || 0),
          average: parseInt(revenue[0].avg_transaction || 0),
          average_display: `₱${((revenue[0].avg_transaction || 0) / 100).toLocaleString()}`
        },
        monthly_revenue: monthlyRevenue.map(m => ({
          month: m.month,
          revenue: parseInt(m.revenue),
          revenue_display: `₱${(m.revenue / 100).toLocaleString()}`,
          transactions: parseInt(m.transactions)
        })),
        churn: {
          rate: churnRate.toFixed(2),
          cancelled_last_30_days: parseInt(churnData[0].cancelled_count)
        },
        active_subscriptions: parseInt(totalActive[0].count)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

/**
 * GET /api/subscriptions/analytics/revenue
 * Get detailed revenue analytics
 */
router.get('/revenue', authenticateToken, async (req, res) => {
  try {
    const { period = '12m' } = req.query; // 30d, 12m, all

    console.log(`💰 Fetching revenue analytics for period: ${period}`);

    let interval = '12 months';
    if (period === '30d') interval = '30 days';
    if (period === '7d') interval = '7 days';

    const revenueData = await sql`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        SUM(amount) as revenue,
        COUNT(*) as transactions,
        AVG(amount) as avg_amount
      FROM subscription_transactions
      WHERE status = 'completed'
      AND created_at >= CURRENT_DATE - INTERVAL ${interval}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `;

    const byType = await sql`
      SELECT 
        transaction_type,
        SUM(amount) as total_revenue,
        COUNT(*) as count
      FROM subscription_transactions
      WHERE status = 'completed'
      AND created_at >= CURRENT_DATE - INTERVAL ${interval}
      GROUP BY transaction_type
    `;

    res.json({
      success: true,
      period: period,
      revenue: revenueData.map(r => ({
        date: r.date,
        revenue: parseInt(r.revenue),
        revenue_display: `₱${(r.revenue / 100).toLocaleString()}`,
        transactions: parseInt(r.transactions),
        avg_amount: parseInt(r.avg_amount)
      })),
      by_type: byType.map(t => ({
        type: t.transaction_type,
        revenue: parseInt(t.total_revenue),
        revenue_display: `₱${(t.total_revenue / 100).toLocaleString()}`,
        count: parseInt(t.count)
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching revenue analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue analytics',
      message: error.message
    });
  }
});

/**
 * GET /api/subscriptions/analytics/growth
 * Get subscription growth metrics
 */
router.get('/growth', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching growth metrics');

    const monthlyGrowth = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as new_subscriptions,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancellations
      FROM vendor_subscriptions
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `;

    const trialConversion = await sql`
      SELECT 
        COUNT(*) as total_trials,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as converted
      FROM vendor_subscriptions
      WHERE trial_end_date IS NOT NULL
      AND created_at >= CURRENT_DATE - INTERVAL '3 months'
    `;

    const conversionRate = trialConversion[0].total_trials > 0
      ? (trialConversion[0].converted / trialConversion[0].total_trials) * 100
      : 0;

    res.json({
      success: true,
      growth: {
        monthly: monthlyGrowth.map(m => ({
          month: m.month,
          new_subscriptions: parseInt(m.new_subscriptions),
          cancellations: parseInt(m.cancellations),
          net_growth: parseInt(m.new_subscriptions) - parseInt(m.cancellations)
        })),
        trial_conversion: {
          total_trials: parseInt(trialConversion[0].total_trials),
          converted: parseInt(trialConversion[0].converted),
          conversion_rate: conversionRate.toFixed(2) + '%'
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching growth metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch growth metrics',
      message: error.message
    });
  }
});

/**
 * GET /api/subscriptions/analytics/churn
 * Get churn analysis
 */
router.get('/churn', authenticateToken, async (req, res) => {
  try {
    console.log('📉 Fetching churn analysis');

    const churnByPlan = await sql`
      SELECT 
        plan_name,
        COUNT(*) as total_cancelled,
        AVG(EXTRACT(EPOCH FROM (cancelled_at - start_date)) / 86400) as avg_days_subscribed
      FROM vendor_subscriptions
      WHERE status = 'cancelled'
      AND cancelled_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY plan_name
    `;

    const churnReasons = await sql`
      SELECT 
        metadata->>'reason' as reason,
        COUNT(*) as count
      FROM subscription_transactions
      WHERE transaction_type = 'cancellation'
      AND created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY metadata->>'reason'
      ORDER BY count DESC
    `;

    res.json({
      success: true,
      churn_analysis: {
        by_plan: churnByPlan.map(p => ({
          plan: p.plan_name,
          total_cancelled: parseInt(p.total_cancelled),
          avg_days_subscribed: Math.round(p.avg_days_subscribed)
        })),
        reasons: churnReasons.map(r => ({
          reason: r.reason || 'Not specified',
          count: parseInt(r.count)
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching churn analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch churn analysis',
      message: error.message
    });
  }
});

module.exports = router;
