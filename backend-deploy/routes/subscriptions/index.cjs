/**
 * 🎯 Subscription API Routes Index
 * Centralized module for all subscription-related API endpoints
 * Modular architecture for maintainability and scalability
 */

const express = require('express');
const router = express.Router();

// Import subscription modules
let plansRoutes, 
    vendorRoutes, 
    paymentRoutes, 
    webhookRoutes, 
    usageRoutes, 
    adminRoutes, 
    analyticsRoutes;

try {
  console.log('📋 Loading subscription plans routes...');
  plansRoutes = require('./plans.cjs');
  console.log('✅ Plans routes loaded');
} catch (error) {
  console.error('❌ Failed to load plans routes:', error);
  throw error;
}

try {
  console.log('👤 Loading vendor subscription routes...');
  vendorRoutes = require('./vendor.cjs');
  console.log('✅ Vendor routes loaded');
} catch (error) {
  console.error('❌ Failed to load vendor routes:', error);
  throw error;
}

try {
  console.log('💳 Loading payment routes...');
  paymentRoutes = require('./payment.cjs');
  console.log('✅ Payment routes loaded');
} catch (error) {
  console.error('❌ Failed to load payment routes:', error);
  throw error;
}

try {
  console.log('🔔 Loading webhook routes...');
  webhookRoutes = require('./webhook.cjs');
  console.log('✅ Webhook routes loaded');
} catch (error) {
  console.error('❌ Failed to load webhook routes:', error);
  throw error;
}

try {
  console.log('📊 Loading usage tracking routes...');
  usageRoutes = require('./usage.cjs');
  console.log('✅ Usage routes loaded');
} catch (error) {
  console.error('❌ Failed to load usage routes:', error);
  throw error;
}

try {
  console.log('📈 Loading analytics routes...');
  analyticsRoutes = require('./analytics.cjs');
  console.log('✅ Analytics routes loaded');
} catch (error) {
  console.error('❌ Failed to load analytics routes:', error);
  throw error;
}

try {
  console.log('👑 Loading admin subscription routes...');
  adminRoutes = require('./admin.cjs');
  console.log('✅ Admin routes loaded');
} catch (error) {
  console.error('❌ Failed to load admin routes:', error);
  throw error;
}

// Mount subscription routes
router.use('/plans', plansRoutes);           // GET /api/subscriptions/plans
router.use('/vendor', vendorRoutes);         // All vendor operations
router.use('/payment', paymentRoutes);       // POST /api/subscriptions/payment/*
router.use('/webhook', webhookRoutes);       // POST /api/subscriptions/webhook
router.use('/usage', usageRoutes);           // GET /api/subscriptions/usage/*
router.use('/analytics', analyticsRoutes);   // GET /api/subscriptions/analytics/*
router.use('/admin', adminRoutes);           // POST /api/subscriptions/admin/*

// Legacy route aliases for backward compatibility
router.post('/create', vendorRoutes);              // Alias for /vendor/create
router.put('/upgrade', vendorRoutes);              // Alias for /vendor/upgrade
router.put('/downgrade', vendorRoutes);            // Alias for /vendor/downgrade
router.put('/cancel', vendorRoutes);               // Alias for /vendor/cancel
router.put('/cancel-at-period-end', vendorRoutes); // Alias for /vendor/cancel-at-period-end
router.put('/cancel-immediate', vendorRoutes);     // Alias for /vendor/cancel-immediate
router.put('/reactivate', vendorRoutes);           // Alias for /vendor/reactivate
router.get('/all', vendorRoutes);                  // Alias for /vendor/all
router.post('/check-limit', usageRoutes);          // Alias for /usage/check-limit

console.log('✅ All subscription routes mounted successfully');
console.log('📍 Available subscription endpoints:');
console.log('   📋 Plans:');
console.log('      - GET    /api/subscriptions/plans');
console.log('      - GET    /api/subscriptions/plans/:planCode');
console.log('   👤 Vendor:');
console.log('      - GET    /api/subscriptions/vendor/:vendorId');
console.log('      - GET    /api/subscriptions/vendor/all');
console.log('      - POST   /api/subscriptions/vendor/create (or /create)');
console.log('      - PUT    /api/subscriptions/vendor/upgrade (or /upgrade)');
console.log('      - PUT    /api/subscriptions/vendor/downgrade (or /downgrade)');
console.log('      - PUT    /api/subscriptions/vendor/cancel (or /cancel)');
console.log('      - PUT    /api/subscriptions/vendor/cancel-at-period-end');
console.log('      - PUT    /api/subscriptions/vendor/cancel-immediate');
console.log('      - PUT    /api/subscriptions/vendor/reactivate (or /reactivate)');
console.log('   💳 Payment:');
console.log('      - POST   /api/subscriptions/payment/create');
console.log('      - POST   /api/subscriptions/payment/upgrade');
console.log('      - POST   /api/subscriptions/payment/cancel');
console.log('   🔔 Webhook:');
console.log('      - POST   /api/subscriptions/webhook');
console.log('   📊 Usage:');
console.log('      - GET    /api/subscriptions/usage/:vendorId');
console.log('      - POST   /api/subscriptions/usage/check-limit (or /check-limit)');
console.log('   📈 Analytics:');
console.log('      - GET    /api/subscriptions/analytics/overview');
console.log('   👑 Admin:');
console.log('      - POST   /api/subscriptions/admin/create-manual');

module.exports = router;
