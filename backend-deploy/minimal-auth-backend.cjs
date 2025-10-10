// Minimal backend to test just the login functionality
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'minimal-auth-test', timestamp: new Date().toISOString() });
});

// Test login endpoint with detailed logging
app.post('/api/auth/login', async (req, res) => {
  console.log('🎯 [AUTH] Login request received at:', new Date().toISOString());
  console.log('🎯 [AUTH] Request body:', req.body);
  
  try {
    const { email, password } = req.body;
    
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password ? password.length : 'undefined');
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    console.log('🔍 Querying database for user...');
    
    // Find user by email
    const users = await sql`
      SELECT id, email, password, first_name, last_name, user_type 
      FROM users 
      WHERE email = ${email} 
      LIMIT 1
    `;
    
    console.log(`📊 Database query returned ${users.length} users`);
    
    if (users.length === 0) {
      console.log('❌ No user found with this email');
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const user = users[0];
    console.log('👤 User found:', user.email);
    console.log('🔐 Password hash starts with:', user.password.substring(0, 10));
    
    console.log('🔑 Starting bcrypt comparison...');
    const startTime = Date.now();
    
    // Compare password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    const duration = Date.now() - startTime;
    console.log(`🔑 Bcrypt comparison completed in ${duration}ms: ${passwordMatch ? 'MATCH' : 'NO MATCH'}`);
    
    if (!passwordMatch) {
      console.log('❌ Password comparison failed');
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    console.log('✅ Password matched, generating JWT...');
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    console.log('✅ JWT generated successfully');
    
    const response = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type
      },
      token,
      message: 'Login successful'
    };
    
    console.log('✅ Sending success response');
    res.json(response);
    
  } catch (error) {
    console.error('💥 [AUTH] Login error:', error);
    console.error('💥 Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal auth test server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  POST /api/auth/login');
});
