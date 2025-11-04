// 🔍 DEBUG ENDPOINT - Add this to backend-deploy/routes/bookings.cjs
// This will help verify if environment variables are loaded in production

// Add this at the END of the file, right BEFORE: module.exports = router;

// ============================================
// TEMPORARY DEBUG ENDPOINT - REMOVE AFTER TESTING
// ============================================
router.get('/test-email-config', (req, res) => {
  console.log('🔍 DEBUG ENDPOINT CALLED');
  console.log('🔍 EMAIL_USER:', process.env.EMAIL_USER);
  console.log('🔍 EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET');
  
  const isConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  
  res.json({
    success: true,
    debug: {
      emailConfigured: isConfigured,
      emailUser: process.env.EMAIL_USER || 'NOT SET',
      emailPassLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
      emailPassLastFour: process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET',
      emailPassHasSpaces: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.includes(' ') : false,
      nodeEnv: process.env.NODE_ENV || 'NOT SET',
      port: process.env.PORT || 'NOT SET'
    },
    message: isConfigured 
      ? 'Email is configured correctly!' 
      : 'Email is NOT configured - environment variables missing',
    timestamp: new Date().toISOString()
  });
});

// ============================================

module.exports = router;
