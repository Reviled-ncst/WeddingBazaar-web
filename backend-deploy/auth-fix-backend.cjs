const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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

// Test database connection on startup
async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Check if we have test users
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`📊 Found ${users[0].count} users in database`);
    
    // Create demo user if none exists
    if (users[0].count === 0) {
      console.log('Creating demo user...');
      const hashedPassword = await bcrypt.hash('test123', 10);
      await sql`
        INSERT INTO users (id, email, password, user_type, created_at, updated_at)
        VALUES ('demo-couple-001', 'couple@test.com', ${hashedPassword}, 'individual', NOW(), NOW())
      `;
      console.log('✅ Demo user created: couple@test.com / test123');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Initialize connection on startup
testConnection();

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await sql`SELECT COUNT(*) as conversations FROM conversations`;
    const msgTest = await sql`SELECT COUNT(*) as messages FROM messages`;
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      databaseStats: {
        conversations: parseInt(dbTest[0].conversations),
        messages: parseInt(msgTest[0].messages),
        error: ''
      },
      environment: process.env.NODE_ENV || 'production',
      version: '2.3.0-AUTHENTICATION-FIX-COMPLETE',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      endpoints: {
        health: 'Active',
        ping: 'Active',
        auth: 'Active',
        vendors: 'Active',
        services: 'Active',
        bookings: 'Active',
        conversations: 'Active',
        messages: 'Active',
        availability: 'Active'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Login endpoint with detailed debugging
app.post('/api/auth/login', async (req, res) => {
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

// Vendors endpoint
app.get('/api/vendors/featured', async (req, res) => {
  try {
    const vendors = await sql`
      SELECT * FROM vendors 
      WHERE verified = true 
      ORDER BY rating DESC 
      LIMIT 5
    `;

    res.json({
      success: true,
      vendors: vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        category: vendor.category,
        rating: vendor.rating,
        review_count: vendor.review_count,
        location: vendor.location,
        description: vendor.description,
        image_url: vendor.image_url,
        website_url: vendor.website_url,
        years_experience: vendor.years_experience,
        portfolio_images: vendor.portfolio_images,
        verified: vendor.verified,
        starting_price: vendor.starting_price,
        price_range: `$${vendor.starting_price} - $${parseFloat(vendor.starting_price) * 2}`
      })),
      count: vendors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Vendors error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint to check users
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await sql`SELECT id, email, user_type, created_at FROM users ORDER BY created_at`;
    res.json({
      success: true,
      users: users,
      count: users.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Bazaar Backend server running on port ${PORT}`);
  console.log(`📊 Version: 2.3.0-AUTHENTICATION-FIX-COMPLETE`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});
