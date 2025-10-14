const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Login endpoint with detailed debugging
router.post('/login', async (req, res) => {
  console.log('🔐 Login attempt received:', { email: req.body.email, hasPassword: !!req.body.password });
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Find user by email
    console.log('🔍 Looking for user:', email);
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    
    if (users.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }

    const user = users[0];
    console.log('✅ User found:', { id: user.id, email: user.email, type: user.user_type });
    console.log('🔐 Password hash length:', user.password.length);
    console.log('🔐 Password hash starts with:', user.password.substring(0, 10));

    // Verify password with detailed logging
    console.log('🔐 Comparing password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.user_type 
      },
      process.env.JWT_SECRET || 'wedding-bazaar-secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', email);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.user_type,
        firstName: user.first_name,
        lastName: user.last_name
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    console.log('🎯 [AUTH] POST /api/auth/register called');
    console.log('🎯 [AUTH] Request body:', req.body);
    
    const { email, password, first_name, last_name, user_type = 'couple' } = req.body;
    
    if (!email || !password || !first_name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and first_name are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate user_type
    const validUserTypes = ['couple', 'vendor', 'admin'];
    if (!validUserTypes.includes(user_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user_type. Must be one of: couple, vendor, admin',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if user already exists
    console.log('🔍 Checking if user exists:', email);
    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`;
    
    if (existingUsers.length > 0) {
      console.log('❌ User already exists with email:', email);
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('🔐 Password hashed successfully');
    
    // Generate unique user ID using proper sequential format
    const { getNextUserId } = require('../utils/id-generation.cjs');
    const userId = await getNextUserId(sql, user_type === 'vendor' ? 'vendor' : 'individual');
    
    // Insert user into database
    console.log('💾 Inserting user into database:', { userId, email, user_type });
    const result = await sql`
      INSERT INTO users (id, email, password, first_name, last_name, user_type, created_at)
      VALUES (${userId}, ${email}, ${hashedPassword}, ${first_name}, ${last_name || ''}, ${user_type}, NOW())
      RETURNING id, email, first_name, last_name, user_type, created_at
    `;
    
    const newUser = result[0];
    console.log('✅ User inserted into database:', newUser);
    
    // If vendor, also create vendor record
    if (user_type === 'vendor') {
      console.log('🏢 Creating vendor record for user:', userId);
      const vendorResult = await sql`
        INSERT INTO vendors (
          id, user_id, business_name, business_type, description, 
          years_experience, location, created_at, updated_at, 
          verified, rating, review_count
        )
        VALUES (
          ${userId}, ${userId}, ${first_name + ' ' + (last_name || '') + ' Services'}, 
          'general', 'Professional wedding service provider', 
          5, 'Philippines', NOW(), NOW(),
          true, 4.5, 0
        )
        RETURNING id
      `;
      console.log('✅ Vendor record created:', vendorResult[0]);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, userType: newUser.user_type },
      process.env.JWT_SECRET || 'wedding-bazaar-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('✅ [AUTH] User registered successfully:', newUser.id);
    
    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        user_type: newUser.user_type
      },
      token,
      message: 'User registered successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [AUTH] Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Token verification endpoint
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
        timestamp: new Date().toISOString()
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wedding-bazaar-secret-key');
    
    res.json({
      success: true,
      authenticated: true,
      user: decoded,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Invalid token',
      timestamp: new Date().toISOString()
    });
  }
});

// User profile endpoint - Get user profile by email
router.get('/profile', async (req, res) => {
  try {
    console.log('👤 Profile request received');
    
    // Get email from query params or headers
    const email = req.query.email || req.headers['x-user-email'];
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email required',
        message: 'Email parameter is required to fetch profile'
      });
    }
    
    console.log('🔍 Looking up user profile for email:', email);
    
    // Get user from database using the modular sql connection
    const users = await sql`
      SELECT id, first_name, last_name, email, user_type, phone, created_at, updated_at 
      FROM users 
      WHERE email = ${email}
    `;
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found with this email address'
      });
    }
    
    const user = users[0];
    
    // If user is a vendor, get additional vendor info
    let vendorInfo = null;
    if (user.user_type === 'vendor') {
      const vendors = await sql`
        SELECT id, name as business_name, category as business_type, location 
        FROM vendors 
        WHERE user_id = ${user.id}
      `;
      
      if (vendors.length > 0) {
        vendorInfo = vendors[0];
      }
    }
    
    const profileData = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.user_type,  // Map user_type to role for frontend compatibility
      phone: user.phone,
      businessName: vendorInfo?.business_name || '',
      vendorId: vendorInfo?.id || null,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
    
    console.log('✅ Profile data retrieved:', { email: profileData.email, role: profileData.role });
    
    res.json({
      success: true,
      user: profileData
    });
    
  } catch (error) {
    console.error('❌ Profile fetch failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

module.exports = router;
