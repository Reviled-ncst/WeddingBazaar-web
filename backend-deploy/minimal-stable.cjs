const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);
const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
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
app.use(express.json());

console.log('Wedding Bazaar Backend Starting...');

// Health check - always works
app.get('/api/health', async (req, res) => {
  try {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '2.1.4-MINIMAL-STABLE',
      uptime: process.uptime(),
      endpoints: ['health', 'ping', 'vendors', 'services']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ping - simple response
app.get('/api/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is responsive',
    timestamp: new Date().toISOString()
  });
});

// Vendors - with database error handling
app.get('/api/vendors/featured', async (req, res) => {
  try {
    console.log('Fetching vendors...');
    
    const vendors = await sql`
      SELECT 
        id,
        business_name as name,
        business_type as category,
        rating,
        review_count,
        location,
        description
      FROM vendors 
      WHERE verified = true
      ORDER BY CAST(rating AS DECIMAL) DESC
      LIMIT 6
    `;
    
    console.log('Vendors found:', vendors.length);
    
    res.json({
      success: true,
      vendors: vendors,
      count: vendors.length
    });
  } catch (error) {
    console.error('Vendors error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Services - simplified
app.get('/api/services', async (req, res) => {
  try {
    const services = await sql`
      SELECT DISTINCT business_type as name, COUNT(*) as vendor_count
      FROM vendors 
      WHERE verified = true
      GROUP BY business_type
      ORDER BY vendor_count DESC
    `;

    const servicesWithDetails = services.map(service => ({
      name: service.name,
      description: `Professional ${service.name.toLowerCase()} services`,
      vendor_count: parseInt(service.vendor_count)
    }));

    res.json({
      success: true,
      services: servicesWithDetails
    });
  } catch (error) {
    console.error('Services error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Authentication endpoints
const activeTokenSessions = {};

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('[AUTH] Login attempt for:', req.body.email);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }

    // Find user in database with correct column names
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];
    
    // For now, test with known password
    if (password !== 'test123') {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }

    // Create session token
    const sessionToken = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    activeTokenSessions[sessionToken] = {
      userId: user.id,
      email: user.email,
      user_type: user.user_type,
      created: new Date().toISOString()
    };

    console.log('[AUTH] Login successful for:', user.email);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type
      },
      token: sessionToken
    });

  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed: ' + error.message
    });
  }
});

app.post('/api/auth/verify', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        authenticated: false,
        error: 'Token required'
      });
    }

    const session = activeTokenSessions[token];
    
    if (!session) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        error: 'Invalid or expired token'
      });
    }

    res.json({
      success: true,
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        user_type: session.user_type
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      authenticated: false,
      error: error.message
    });
  }
});

// Catch all other routes
app.get('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`Wedding Bazaar Backend running on port ${PORT}`);
  console.log('Endpoints: /api/health, /api/ping, /api/vendors/featured, /api/services');
});

module.exports = app;
