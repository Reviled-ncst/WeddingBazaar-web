// SECURITY ENHANCEMENT: Enhanced Authentication Middleware
// File: backend-security-fixes/middleware/auth-secure.cjs

const jwt = require('jsonwebtoken');
const { sql } = require('../config/database.cjs');

/**
 * SECURITY-ENHANCED JWT Token Verification Middleware
 * Includes malformed user ID detection and enhanced validation
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      console.log('🚨 SECURITY: No token provided');
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data from database for security validation
    const userResult = await sql`
      SELECT id, email, user_type, first_name, last_name, created_at
      FROM users 
      WHERE id = ${decoded.id}
    `;
    
    if (userResult.length === 0) {
      console.log(`🚨 SECURITY: Token valid but user ${decoded.id} not found in database`);
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    const user = userResult[0];
    
    // SECURITY CHECK: Detect malformed user IDs
    if (isMalformedUserId(user.id)) {
      console.log(`🚨 SECURITY ALERT: Malformed user ID detected in token: ${user.id}`);
      
      // For now, allow but flag for cleanup - you may want to block entirely
      user._securityWarning = 'MALFORMED_USER_ID';
      user._requiresMigration = true;
    }
    
    // SECURITY CHECK: Validate user type
    const validUserTypes = ['individual', 'vendor', 'admin'];
    if (!user.user_type || !validUserTypes.includes(user.user_type)) {
      console.log(`🚨 SECURITY ALERT: Invalid user type: ${user.user_type} for user ${user.id}`);
      user._securityWarning = 'INVALID_USER_TYPE';
    }
    
    // Add user to request object
    req.user = user;
    
    // Security audit log
    console.log(`🔐 AUTH SUCCESS: User ${user.id} (${user.user_type}) authenticated`);
    if (user._securityWarning) {
      console.log(`⚠️  SECURITY WARNING: ${user._securityWarning} for user ${user.id}`);
    }
    
    next();
    
  } catch (error) {
    console.error('❌ Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

/**
 * SECURITY UTILITY: Check for malformed user IDs
 */
function isMalformedUserId(userId) {
  if (typeof userId !== 'string') return false;
  
  const problematicPatterns = [
    /^\d+-\d{4}-\d{3}$/,  // Pattern: number-year-sequence (e.g., "2-2025-001")
    /^[12]-2025-\d+$/     // Specific pattern causing the security issue
  ];
  
  return problematicPatterns.some(pattern => pattern.test(userId));
}

/**
 * ROLE-BASED ACCESS CONTROL: Middleware to check user roles
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (req.user.user_type !== requiredRole) {
      console.log(`🚨 SECURITY: User ${req.user.id} (${req.user.user_type}) attempted to access ${requiredRole} endpoint`);
      return res.status(403).json({
        success: false,
        error: `${requiredRole} access required`,
        code: 'INSUFFICIENT_PRIVILEGES'
      });
    }
    
    // Additional security check for malformed IDs
    if (req.user._securityWarning) {
      console.log(`⚠️  SECURITY WARNING: User ${req.user.id} with ${req.user._securityWarning} accessing ${requiredRole} endpoint`);
      
      // For critical operations, you might want to block malformed users entirely
      if (req.user._securityWarning === 'MALFORMED_USER_ID' && requiredRole === 'vendor') {
        return res.status(403).json({
          success: false,
          error: 'Account requires security update. Please contact support.',
          code: 'ACCOUNT_SECURITY_UPDATE_REQUIRED'
        });
      }
    }
    
    next();
  };
};

/**
 * VENDOR-SPECIFIC SECURITY: Ensure user has valid vendor record
 */
const requireVendorRecord = async (req, res, next) => {
  try {
    if (!req.user || req.user.user_type !== 'vendor') {
      return res.status(403).json({
        success: false,
        error: 'Vendor access required',
        code: 'VENDOR_ACCESS_REQUIRED'
      });
    }
    
    // Check if vendor record exists
    const vendorRecord = await sql`
      SELECT id, business_name, verified 
      FROM vendors 
      WHERE user_id = ${req.user.id}
    `;
    
    if (vendorRecord.length === 0) {
      console.log(`🚨 SECURITY: User ${req.user.id} marked as vendor but no vendor record found`);
      return res.status(403).json({
        success: false,
        error: 'Vendor record not found. Please complete vendor registration.',
        code: 'VENDOR_RECORD_MISSING'
      });
    }
    
    // Add vendor info to request
    req.vendor = vendorRecord[0];
    
    console.log(`✅ VENDOR VERIFIED: User ${req.user.id} has vendor record ${req.vendor.id}`);
    next();
    
  } catch (error) {
    console.error('❌ Vendor verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Vendor verification failed'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireVendorRecord,
  isMalformedUserId
};
