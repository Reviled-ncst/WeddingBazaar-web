/**
 * 📋 Subscription Plans Routes
 * Handles subscription plan listings and information
 */

const express = require('express');
const router = express.Router();

// Subscription plan configurations with REAL pricing
const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Free Tier',
    tier: 'basic',
    price: 0,
    price_yearly: 0,
    billing_cycle: 'monthly',
    trial_days: 0,
    features: [
      'Up to 5 services',
      'Basic portfolio (10 images)',
      'Unlimited bookings',
      'Standard support',
      'Mobile app access'
    ],
    limits: {
      max_services: 5,
      max_portfolio_items: 10,
      max_monthly_bookings: -1, // unlimited
      max_concurrent_bookings: 10,
      max_monthly_messages: 100,
      video_call_minutes: 0,
      featured_listing: false,
      priority_support: false,
      advanced_analytics: false,
      custom_branding: false,
      api_access: false
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    tier: 'premium',
    price: 99900, // ₱999.00 in centavos
    price_yearly: 999900, // ₱9,999.00 in centavos (save 2 months)
    billing_cycle: 'monthly',
    trial_days: 14,
    features: [
      'Unlimited services',
      'Extended portfolio (50 images)',
      'Unlimited bookings',
      'Priority support',
      'Video call integration (5 hours/month)',
      'Featured listing (7 days/month)',
      'Advanced analytics',
      'Email marketing tools'
    ],
    limits: {
      max_services: -1, // unlimited
      max_portfolio_items: 50,
      max_monthly_bookings: -1,
      max_concurrent_bookings: -1,
      max_monthly_messages: 500,
      video_call_minutes: 300,
      featured_listing: true,
      priority_support: true,
      advanced_analytics: true,
      custom_branding: false,
      api_access: false
    }
  },
  pro: {
    id: 'pro',
    name: 'Professional Plan',
    tier: 'pro',
    price: 199900, // ₱1,999.00 in centavos
    price_yearly: 1999900, // ₱19,999.00 in centavos (save 2 months)
    billing_cycle: 'monthly',
    trial_days: 14,
    features: [
      'Everything in Premium',
      'Unlimited portfolio images',
      'Unlimited video calls',
      'Custom branding & domain',
      'Advanced SEO tools',
      'Multi-location support',
      'Team collaboration (3 members)',
      'Custom contracts',
      'Payment processing integration'
    ],
    limits: {
      max_services: -1,
      max_portfolio_items: -1,
      max_monthly_bookings: -1,
      max_concurrent_bookings: -1,
      max_monthly_messages: -1,
      video_call_minutes: -1,
      featured_listing: true,
      priority_support: true,
      advanced_analytics: true,
      custom_branding: true,
      api_access: false
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    tier: 'enterprise',
    price: 499900, // ₱4,999.00 in centavos
    price_yearly: 4999900, // ₱49,999.00 in centavos (save 2 months)
    billing_cycle: 'monthly',
    trial_days: 30,
    features: [
      'Everything in Professional',
      'White-label solution',
      'API access & webhooks',
      'Dedicated account manager',
      'Custom integrations',
      'Unlimited team members',
      'Advanced reporting & analytics',
      'Priority feature requests',
      '99.9% SLA guarantee'
    ],
    limits: {
      max_services: -1,
      max_portfolio_items: -1,
      max_monthly_bookings: -1,
      max_concurrent_bookings: -1,
      max_monthly_messages: -1,
      video_call_minutes: -1,
      featured_listing: true,
      priority_support: true,
      advanced_analytics: true,
      custom_branding: true,
      api_access: true,
      webhook_access: true,
      white_label: true,
      dedicated_support: true
    }
  }
};

/**
 * GET /api/subscriptions/plans
 * Get all available subscription plans with pricing
 */
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching subscription plans...');
    
    const plans = Object.values(SUBSCRIPTION_PLANS).map(plan => ({
      ...plan,
      price_display: plan.price === 0 ? 'Free' : `₱${(plan.price / 100).toLocaleString()}`,
      price_yearly_display: plan.price_yearly === 0 ? 'Free' : `₱${(plan.price_yearly / 100).toLocaleString()}`,
      savings_yearly: plan.price_yearly > 0 ? ((plan.price * 12 - plan.price_yearly) / 100) : 0
    }));
    
    res.json({
      success: true,
      plans: plans
    });
  } catch (error) {
    console.error('❌ Error fetching plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription plans'
    });
  }
});

/**
 * GET /api/subscriptions/plans/compare
 * Get plan comparison matrix
 * NOTE: This route must come BEFORE /:planId to avoid matching 'compare' as a planId
 */
router.get('/compare', async (req, res) => {
  try {
    const comparison = Object.values(SUBSCRIPTION_PLANS).map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      price_display: plan.price === 0 ? 'Free' : `₱${(plan.price / 100).toLocaleString()}/mo`,
      features: plan.features,
      limits: plan.limits
    }));
    
    res.json({
      success: true,
      comparison: comparison
    });
  } catch (error) {
    console.error('❌ Error generating comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate plan comparison'
    });
  }
});

/**
 * GET /api/subscriptions/plans/:planId
 * Get specific plan details
 * NOTE: This route must come AFTER /compare to avoid route conflicts
 */
router.get('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = SUBSCRIPTION_PLANS[planId];
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found',
        message: `No subscription plan found with ID: ${planId}`,
        availablePlans: Object.keys(SUBSCRIPTION_PLANS)
      });
    }
    
    res.json({
      success: true,
      plan: {
        ...plan,
        price_display: plan.price === 0 ? 'Free' : `₱${(plan.price / 100).toLocaleString()}`,
        price_yearly_display: plan.price_yearly === 0 ? 'Free' : `₱${(plan.price_yearly / 100).toLocaleString()}`,
        savings_yearly: plan.price_yearly > 0 ? ((plan.price * 12 - plan.price_yearly) / 100) : 0
      }
    });
  } catch (error) {
    console.error('❌ Error fetching plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plan details'
    });
  }
});

// Export both router and plans for use in other modules
module.exports = router;
module.exports.SUBSCRIPTION_PLANS = SUBSCRIPTION_PLANS;
