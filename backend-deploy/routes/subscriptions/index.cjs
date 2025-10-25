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
router.use('/vendor', vendorRoutes);         // /api/subscriptions/vendor/:vendorId
router.use('/payment', paymentRoutes);       // POST /api/subscriptions/payment/*
router.use('/webhook', webhookRoutes);       // POST /api/subscriptions/webhook
router.use('/usage', usageRoutes);           // GET /api/subscriptions/usage/:vendorId
router.use('/analytics', analyticsRoutes);   // GET /api/subscriptions/analytics/*
router.use('/admin', adminRoutes);           // POST /api/subscriptions/admin/*

console.log('✅ All subscription routes mounted successfully');
console.log('📍 Available subscription endpoints:');
console.log('   - GET    /api/subscriptions/plans');
console.log('   - GET    /api/subscriptions/vendor/:vendorId');
console.log('   - POST   /api/subscriptions/payment/create');
console.log('   - POST   /api/subscriptions/payment/upgrade');
console.log('   - POST   /api/subscriptions/payment/cancel');
console.log('   - POST   /api/subscriptions/webhook');
console.log('   - GET    /api/subscriptions/usage/:vendorId');
console.log('   - POST   /api/subscriptions/usage/check-limit');
console.log('   - GET    /api/subscriptions/analytics/overview');
console.log('   - POST   /api/subscriptions/admin/create-manual');

module.exports = router;
