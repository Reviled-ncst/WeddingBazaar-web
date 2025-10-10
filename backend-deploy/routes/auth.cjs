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

// Register endpoint (placeholder for future implementation)
router.post('/register', async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Registration endpoint not yet implemented',
    timestamp: new Date().toISOString()
  });
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

module.exports = router;
