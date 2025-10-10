// Emergency rollback - simplified auth without bcrypt for testing
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Initialize Neon serverless client
const sql = neon(process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://weddingbazaar-4171e.web.app',
    'https://weddingbazaar-web.web.app',
    'https://weddingbazaarph.web.app'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.3.0-emergency-rollback-simplified-auth'
  });
});

// Services endpoint (working)
app.get('/api/services', async (req, res) => {
  try {
    const services = await sql`
      SELECT 
        id,
        vendor_id,
        title as name,
        description,
        category,
        CAST(price AS TEXT) as price,
        images,
        featured,
        is_active,
        created_at,
        updated_at
      FROM services 
      WHERE is_active = true
      ORDER BY created_at DESC
    `;
    
    res.json({
      success: true,
      services: services,
      count: services.length
    });
  } catch (error) {
    console.error('Services error:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Vendors endpoints (working)
app.get('/api/vendors/featured', async (req, res) => {
  try {
    const vendors = await sql`
      SELECT 
        id, 
        business_name as name, 
        business_type as category, 
        rating, 
        review_count as "reviewCount", 
        location, 
        description, 
        profile_image as "imageUrl",
        years_experience as "yearsExperience",
        starting_price as "startingPrice"
      FROM vendors 
      WHERE rating IS NOT NULL 
      ORDER BY rating DESC, review_count DESC
      LIMIT 5
    `;
    
    res.json({
      success: true,
      vendors: vendors
    });
  } catch (error) {
    console.error('Featured vendors error:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// SIMPLIFIED LOGIN - NO BCRYPT (for emergency testing)
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🎯 [AUTH] SIMPLIFIED LOGIN called');
    console.log('🎯 [AUTH] Request body:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    console.log('🔍 Querying for user...');
    
    // For emergency testing - just check if user exists and return success
    // DO NOT USE IN PRODUCTION - THIS IS INSECURE
    const users = await sql`
      SELECT id, email, first_name, last_name, user_type 
      FROM users 
      WHERE email = ${email} 
      LIMIT 1
    `;
    
    console.log(`Found ${users.length} users`);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = users[0];
    console.log('User found:', user.email);
    
    // Generate JWT token (skip password check for testing)
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    console.log('✅ Emergency login success');
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type
      },
      token,
      message: 'Emergency login successful (INSECURE - FOR TESTING ONLY)'
    });
    
  } catch (error) {
    console.error('❌ Emergency login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

// Verify endpoint
app.post('/api/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.json({
      success: true,
      authenticated: false,
      message: 'No token provided'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, decoded) => {
    if (err) {
      return res.json({
        success: true,
        authenticated: false,
        message: 'Invalid token'
      });
    }
    
    res.json({
      success: true,
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        userType: decoded.userType
      },
      message: 'Token valid'
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Emergency rollback server running on port ${PORT}`);
  console.log('⚠️  WARNING: This version has INSECURE authentication for testing only!');
});
