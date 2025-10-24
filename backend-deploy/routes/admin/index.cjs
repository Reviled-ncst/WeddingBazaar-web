/**
 * Admin API Routes Index
 * Centralized module for all admin-related API endpoints
 */

const express = require('express');
const router = express.Router();

// Import admin modules with error handling
let usersRoutes, bookingsRoutes, documentsRoutes;

try {
  console.log('🔍 Loading admin users routes...');
  usersRoutes = require('./users.cjs');
  console.log('✅ Users routes loaded successfully');
  console.log('   - Type:', typeof usersRoutes);
  console.log('   - Is router:', usersRoutes?.stack !== undefined);
  
  if (!usersRoutes || typeof usersRoutes !== 'function') {
    throw new Error('Users routes did not export a valid Express router');
  }
} catch (error) {
  console.error('❌ Failed to load admin users routes:', error);
  throw error;
}

try {
  console.log('🔍 Loading admin bookings routes...');
  bookingsRoutes = require('./bookings.cjs');
  console.log('✅ Bookings routes loaded successfully');
  console.log('   - Type:', typeof bookingsRoutes);
  console.log('   - Is router:', bookingsRoutes?.stack !== undefined);
  
  if (!bookingsRoutes || typeof bookingsRoutes !== 'function') {
    throw new Error('Bookings routes did not export a valid Express router');
  }
} catch (error) {
  console.error('❌ Failed to load admin bookings routes:', error);
  throw error;
}

try {
  console.log('🔍 Loading admin documents routes...');
  const documentsModule = require('./documents.cjs');
  
  // Create router for documents endpoints
  documentsRoutes = express.Router();
  documentsRoutes.get('/', documentsModule.getDocuments);
  documentsRoutes.get('/stats', documentsModule.getDocumentStats);
  documentsRoutes.get('/:id', documentsModule.getDocumentById);
  documentsRoutes.patch('/:id/status', documentsModule.updateDocumentStatus);
  documentsRoutes.post('/:id/approve', documentsModule.approveDocument);
  documentsRoutes.post('/:id/reject', documentsModule.rejectDocument);
  
  console.log('✅ Documents routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load admin documents routes:', error);
  throw error;
}

let messagesRoutes;
try {
  console.log('🔍 Loading admin messages routes...');
  const messagesModule = require('./messages.cjs');
  
  // Create router for messages endpoints
  messagesRoutes = express.Router();
  messagesRoutes.get('/', messagesModule.getMessages);
  messagesRoutes.get('/stats', messagesModule.getMessagingStats);
  messagesRoutes.get('/:id', messagesModule.getConversationById);
  messagesRoutes.delete('/:id', messagesModule.deleteConversation);
  
  console.log('✅ Messages routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load admin messages routes:', error);
  throw error;
}

let securityRoutes;
try {
  console.log('🔍 Loading admin security routes...');
  const securityModule = require('./security.cjs');
  
  // Create router for security endpoints
  securityRoutes = express.Router();
  securityRoutes.get('/metrics', securityModule.getSecurityMetrics);
  securityRoutes.get('/logs', securityModule.getSecurityLogs);
  securityRoutes.get('/sessions', securityModule.getActiveSessions);
  securityRoutes.get('/settings', securityModule.getSecuritySettings);
  securityRoutes.put('/settings', securityModule.updateSecuritySettings);
  
  console.log('✅ Security routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load admin security routes:', error);
  throw error;
}

// Mount routes
router.use('/users', usersRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/documents', documentsRoutes);
router.use('/messages', messagesRoutes);
router.use('/security', securityRoutes);

// Health check for admin API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is running',
    timestamp: new Date().toISOString(),
    modules: {
      users: 'active',
      bookings: 'active',
      documents: 'active',
      messages: 'active',
      security: 'active'
    }
  });
});

module.exports = router;
