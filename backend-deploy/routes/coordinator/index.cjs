/**
 * 🎯 Coordinator API Routes Index
 * Centralized module for all coordinator-related API endpoints
 * Follows modular micro architecture pattern
 * 
 * Last Updated: November 1, 2025
 */

const express = require('express');
const router = express.Router();

// Import coordinator modules
console.log('📋 Loading coordinator module routes...');

let weddingsRoutes, 
    milestonesRoutes, 
    vendorAssignmentRoutes, 
    dashboardRoutes,
    clientsRoutes,
    vendorNetworkRoutes,
    commissionsRoutes;

try {
  console.log('💒 Loading weddings routes...');
  weddingsRoutes = require('./weddings.cjs');
  console.log('✅ Weddings routes loaded');
} catch (error) {
  console.error('❌ Failed to load weddings routes:', error);
}

try {
  console.log('✅ Loading milestones routes...');
  milestonesRoutes = require('./milestones.cjs');
  console.log('✅ Milestones routes loaded');
} catch (error) {
  console.error('❌ Failed to load milestones routes:', error);
}

try {
  console.log('🏪 Loading vendor assignment routes...');
  vendorAssignmentRoutes = require('./vendor-assignment.cjs');
  console.log('✅ Vendor assignment routes loaded');
} catch (error) {
  console.error('❌ Failed to load vendor assignment routes:', error);
}

try {
  console.log('📊 Loading dashboard routes...');
  dashboardRoutes = require('./dashboard.cjs');
  console.log('✅ Dashboard routes loaded');
} catch (error) {
  console.error('❌ Failed to load dashboard routes:', error);
}

try {
  console.log('👥 Loading clients routes...');
  clientsRoutes = require('./clients.cjs');
  console.log('✅ Clients routes loaded');
} catch (error) {
  console.error('❌ Failed to load clients routes:', error);
}

try {
  console.log('🌐 Loading vendor network routes...');
  vendorNetworkRoutes = require('./vendor-network.cjs');
  console.log('✅ Vendor network routes loaded');
} catch (error) {
  console.error('❌ Failed to load vendor network routes:', error);
}

try {
  console.log('💰 Loading commissions routes...');
  commissionsRoutes = require('./commissions.cjs');
  console.log('✅ Commissions routes loaded');
} catch (error) {
  console.error('❌ Failed to load commissions routes:', error);
}

let integrationsRoutes, whitelabelRoutes;

try {
  console.log('🔌 Loading integrations routes...');
  integrationsRoutes = require('./integrations.cjs');
  console.log('✅ Integrations routes loaded');
} catch (error) {
  console.error('❌ Failed to load integrations routes:', error);
}

try {
  console.log('🎨 Loading whitelabel routes...');
  whitelabelRoutes = require('./whitelabel.cjs');
  console.log('✅ Whitelabel routes loaded');
} catch (error) {
  console.error('❌ Failed to load whitelabel routes:', error);
}

// Register sub-routes
if (weddingsRoutes) {
  router.use('/weddings', weddingsRoutes);
  console.log('✅ Registered: /api/coordinator/weddings');
}

if (milestonesRoutes) {
  router.use('/milestones', milestonesRoutes);
  console.log('✅ Registered: /api/coordinator/milestones');
}

if (vendorAssignmentRoutes) {
  router.use('/vendor-assignment', vendorAssignmentRoutes);
  console.log('✅ Registered: /api/coordinator/vendor-assignment');
}

if (dashboardRoutes) {
  router.use('/dashboard', dashboardRoutes);
  console.log('✅ Registered: /api/coordinator/dashboard');
}

if (clientsRoutes) {
  router.use('/clients', clientsRoutes);
  console.log('✅ Registered: /api/coordinator/clients');
}

if (vendorNetworkRoutes) {
  router.use('/vendor-network', vendorNetworkRoutes);
  console.log('✅ Registered: /api/coordinator/vendor-network');
}

if (commissionsRoutes) {
  router.use('/commissions', commissionsRoutes);
  console.log('✅ Registered: /api/coordinator/commissions');
}

if (integrationsRoutes) {
  router.use('/integrations', integrationsRoutes);
  console.log('✅ Registered: /api/coordinator/integrations');
}

if (whitelabelRoutes) {
  router.use('/whitelabel', whitelabelRoutes);
  console.log('✅ Registered: /api/coordinator/whitelabel');
}

console.log('🎉 All coordinator routes registered successfully');

module.exports = router;
