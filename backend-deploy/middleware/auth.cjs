const jwt = require('jsonwebtoken');
const { sql } = require('../config/database.cjs');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'wedding-bazaar-secret-key'
    );

    // Fetch user from database
    const users = await sql`
      SELECT 
        id, email, user_type, first_name, last_name,
        email_verified, is_verified, verification_level
      FROM users 
      WHERE id = ${decoded.userId}
    `;

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'The user associated with this token no longer exists'
      });
    }

    // Attach user to request
    req.user = users[0];
    req.userId = users[0].id;
    req.userType = users[0].user_type;

    next();
  } catch (error) {
    console.error('❌ [Auth Middleware] Token verification failed:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided authentication token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Your session has expired. Please login again'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    });
  }
};

/**
 * Admin Authorization Middleware
 * Requires user to be authenticated and have admin role
 */
const requireAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user || !req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    // Check if user is admin
    if (req.userType !== 'admin') {
      console.log(`⚠️ [Admin Auth] Non-admin user ${req.userId} attempted to access admin resource`);
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        message: 'You do not have permission to access this resource'
      });
    }

    console.log(`✅ [Admin Auth] Admin user ${req.userId} authorized`);
    next();
  } catch (error) {
    console.error('❌ [Admin Auth] Authorization check failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization failed',
      message: error.message
    });
  }
};

/**
 * Vendor Authorization Middleware
 * Requires user to be authenticated and have vendor role
 */
const requireVendor = async (req, res, next) => {
  try {
    if (!req.user || !req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    if (req.userType !== 'vendor') {
      return res.status(403).json({
        success: false,
        error: 'Vendor access required',
        message: 'You must be a registered vendor to access this resource'
      });
    }

    next();
  } catch (error) {
    console.error('❌ [Vendor Auth] Authorization check failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization failed',
      message: error.message
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without user
      return next();
    }

    // Try to verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'wedding-bazaar-secret-key'
    );

    // Fetch user from database
    const users = await sql`
      SELECT id, email, user_type, first_name, last_name
      FROM users 
      WHERE id = ${decoded.userId}
    `;

    if (users.length > 0) {
      req.user = users[0];
      req.userId = users[0].id;
      req.userType = users[0].user_type;
    }

    next();
  } catch (error) {
    // Token is invalid but we don't fail the request
    console.log('⚠️ [Optional Auth] Invalid token provided, continuing without auth');
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireVendor,
  optionalAuth
};
