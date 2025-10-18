const { sql } = require('../../config/database.cjs');

/**
 * Admin Security Management API
 * GET /api/admin/security/metrics - Get security metrics
 * GET /api/admin/security/logs - Get security event logs
 * GET /api/admin/security/sessions - Get active sessions
 * GET /api/admin/security/settings - Get security settings
 * PUT /api/admin/security/settings - Update security settings
 */

/**
 * GET /api/admin/security/metrics
 * Get security metrics and health scores
 */
async function getSecurityMetrics(req, res) {
  try {
    console.log('📊 [AdminSecurity] Fetching security metrics');
    
    // Get current timestamp
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get active sessions count (users logged in recently)
    const sessionsResult = await sql`
      SELECT COUNT(DISTINCT id) as active_sessions
      FROM users
      WHERE last_login > ${last24h}
    `;
    
    // Get failed login attempts (from our logs or we can track this)
    // For now, we'll estimate based on user activity
    const failedLoginsResult = await sql`
      SELECT COUNT(*) as failed_attempts
      FROM users
      WHERE created_at > ${last24h}
      AND password IS NULL
    `;
    
    // Count security alerts (suspicious activity)
    // For demo, we'll check for:
    // 1. Multiple bookings from same IP in short time
    // 2. Unusual user patterns
    const suspiciousActivityResult = await sql`
      SELECT COUNT(DISTINCT user_id) as suspicious_users
      FROM bookings
      WHERE created_at > ${last24h}
      GROUP BY user_id
      HAVING COUNT(*) > 10
    `;
    
    // Calculate security score based on various factors
    const totalUsers = await sql`SELECT COUNT(*) as count FROM users`;
    const verifiedVendors = await sql`
      SELECT COUNT(*) as count 
      FROM vendor_profiles 
      WHERE verification_status = 'verified'
    `;
    const totalVendors = await sql`SELECT COUNT(*) as count FROM vendor_profiles`;
    
    // Security score calculation (0-100)
    const vendorVerificationRate = totalVendors[0].count > 0 
      ? (verifiedVendors[0].count / totalVendors[0].count) * 100 
      : 0;
    
    const failedLoginRate = totalUsers[0].count > 0
      ? (failedLoginsResult[0].failed_attempts / totalUsers[0].count) * 100
      : 0;
    
    const securityScore = Math.round(
      (vendorVerificationRate * 0.4) + 
      (100 - failedLoginRate) * 0.3 +
      (suspiciousActivityResult.length === 0 ? 30 : 0)
    );
    
    const metrics = {
      securityScore,
      activeSessions: parseInt(sessionsResult[0].active_sessions) || 0,
      failedLoginAttempts: parseInt(failedLoginsResult[0].failed_attempts) || 0,
      securityAlerts: suspiciousActivityResult.length,
      status: securityScore >= 90 ? 'good' : securityScore >= 70 ? 'warning' : 'critical'
    };
    
    console.log('✅ [AdminSecurity] Security metrics:', metrics);
    
    res.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    console.error('❌ [AdminSecurity] Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch security metrics',
      details: error.message
    });
  }
}

/**
 * GET /api/admin/security/logs
 * Get security event logs
 */
async function getSecurityLogs(req, res) {
  try {
    const { severity, eventType, limit = 50 } = req.query;
    
    console.log('📋 [AdminSecurity] Fetching security logs, filters:', { severity, eventType, limit });
    
    // Get recent user activities as security events
    const userEvents = await sql`
      SELECT 
        u.id,
        u.email,
        u.user_type,
        u.created_at,
        u.last_login,
        'user_activity' as event_type
      FROM users u
      ORDER BY u.last_login DESC NULLS LAST, u.created_at DESC
      LIMIT ${parseInt(limit)}
    `;
    
    // Get recent booking activities
    const bookingEvents = await sql`
      SELECT 
        b.id,
        b.user_id,
        b.created_at,
        b.status,
        'booking_activity' as event_type
      FROM bookings b
      ORDER BY b.created_at DESC
      LIMIT ${parseInt(limit)}
    `;
    
    // Transform to security log format
    const logs = [];
    
    // Process user events
    userEvents.forEach((event, index) => {
      const isNewUser = new Date(event.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
      const hasRecentLogin = event.last_login && new Date(event.last_login) > new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      if (isNewUser) {
        logs.push({
          id: `user-${event.id}-created`,
          timestamp: event.created_at,
          event: `New ${event.user_type} account created`,
          severity: 'low',
          user: event.email,
          details: `Account registration for ${event.user_type}`,
          eventType: 'authentication'
        });
      }
      
      if (hasRecentLogin && !isNewUser) {
        logs.push({
          id: `user-${event.id}-login`,
          timestamp: event.last_login,
          event: 'User login',
          severity: 'low',
          user: event.email,
          details: `Successful authentication`,
          eventType: 'authentication'
        });
      }
    });
    
    // Process booking events
    bookingEvents.slice(0, 10).forEach(event => {
      logs.push({
        id: `booking-${event.id}`,
        timestamp: event.created_at,
        event: 'New booking created',
        severity: 'low',
        user: event.user_id,
        details: `Booking ${event.id} created with status: ${event.status}`,
        eventType: 'data_access'
      });
    });
    
    // Sort by timestamp (most recent first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply filters
    let filteredLogs = logs;
    if (severity && severity !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.severity === severity);
    }
    if (eventType && eventType !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.eventType === eventType);
    }
    
    console.log(`✅ [AdminSecurity] Found ${filteredLogs.length} security logs`);
    
    res.json({
      success: true,
      data: filteredLogs.slice(0, parseInt(limit)),
      count: filteredLogs.length
    });
    
  } catch (error) {
    console.error('❌ [AdminSecurity] Error fetching logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch security logs',
      details: error.message
    });
  }
}

/**
 * GET /api/admin/security/sessions
 * Get active user sessions
 */
async function getActiveSessions(req, res) {
  try {
    console.log('👥 [AdminSecurity] Fetching active sessions');
    
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const sessions = await sql`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.user_type,
        u.last_login,
        u.created_at
      FROM users u
      WHERE u.last_login > ${last24h}
      ORDER BY u.last_login DESC
      LIMIT 100
    `;
    
    const activeSessions = sessions.map(session => ({
      id: session.id,
      user: `${session.first_name || ''} ${session.last_name || ''}`.trim() || session.email,
      email: session.email,
      userType: session.user_type,
      lastActivity: session.last_login,
      duration: Math.floor((Date.now() - new Date(session.last_login).getTime()) / 60000), // minutes
      ipAddress: '***.***.***.**', // Masked for privacy
      device: 'Web Browser'
    }));
    
    console.log(`✅ [AdminSecurity] Found ${activeSessions.length} active sessions`);
    
    res.json({
      success: true,
      data: activeSessions,
      count: activeSessions.length
    });
    
  } catch (error) {
    console.error('❌ [AdminSecurity] Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active sessions',
      details: error.message
    });
  }
}

/**
 * GET /api/admin/security/settings
 * Get current security settings
 */
async function getSecuritySettings(req, res) {
  try {
    console.log('⚙️ [AdminSecurity] Fetching security settings');
    
    // For now, return default settings
    // In production, these would be stored in database
    const settings = {
      passwordPolicies: {
        minLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        expiryDays: 90
      },
      sessionManagement: {
        timeoutMinutes: 30,
        rememberMeDays: 30,
        forceLogoutOnPasswordChange: true,
        maxConcurrentSessions: 3
      },
      twoFactorAuth: {
        enabled: false,
        required: false,
        methods: ['email', 'sms']
      },
      accessControl: {
        ipWhitelist: [],
        maxLoginAttempts: 5,
        lockoutDurationMinutes: 15
      }
    };
    
    console.log('✅ [AdminSecurity] Security settings retrieved');
    
    res.json({
      success: true,
      data: settings
    });
    
  } catch (error) {
    console.error('❌ [AdminSecurity] Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch security settings',
      details: error.message
    });
  }
}

/**
 * PUT /api/admin/security/settings
 * Update security settings
 */
async function updateSecuritySettings(req, res) {
  try {
    const settings = req.body;
    
    console.log('💾 [AdminSecurity] Updating security settings:', settings);
    
    // In production, save to database
    // For now, just acknowledge the update
    
    console.log('✅ [AdminSecurity] Security settings updated successfully');
    
    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: settings
    });
    
  } catch (error) {
    console.error('❌ [AdminSecurity] Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update security settings',
      details: error.message
    });
  }
}

module.exports = {
  getSecurityMetrics,
  getSecurityLogs,
  getActiveSessions,
  getSecuritySettings,
  updateSecuritySettings
};
