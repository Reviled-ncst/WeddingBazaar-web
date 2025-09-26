import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: ['http://localhost:5173', 'https://weddingbazaar-web.web.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Emergency services endpoint - Direct database query
app.get('/api/services/emergency', async (req, res) => {
  try {
    console.log('🚨 Emergency services endpoint called');
    const result = await pool.query('SELECT * FROM services ORDER BY created_at DESC');
    console.log(`📊 Found ${result.rows.length} services in database`);
    
    const services = result.rows.map(row => ({
      id: row.id,
      name: row.service_name || row.name,
      category: row.category,
      price: row.price,
      description: row.description,
      rating: parseFloat(row.rating) || 0,
      reviewCount: parseInt(row.review_count) || 0,
      location: row.location,
      imageUrl: row.image_url,
      vendorId: row.vendor_id,
      isActive: row.is_active !== false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      success: true,
      services,
      total: services.length,
      endpoint: 'emergency'
    });
  } catch (error) {
    console.error('❌ Emergency services error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch emergency services',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Basic services endpoint
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services WHERE is_active = true ORDER BY rating DESC');
    const services = result.rows.map(row => ({
      id: row.id,
      name: row.service_name || row.name,
      category: row.category,
      price: row.price,
      description: row.description,
      rating: parseFloat(row.rating) || 0,
      reviewCount: parseInt(row.review_count) || 0,
      location: row.location,
      imageUrl: row.image_url,
      vendorId: row.vendor_id,
      isActive: row.is_active !== false
    }));

    res.json({
      success: true,
      services,
      total: services.length
    });
  } catch (error) {
    console.error('❌ Services error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch services',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Featured vendors endpoint
app.get('/api/vendors/featured', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        business_name as name,
        business_type as category,
        rating::numeric as rating,
        review_count,
        location,
        description,
        phone,
        email,
        website_url,
        years_experience,
        specialties,
        portfolio_images
      FROM vendors 
      WHERE is_active = true 
      ORDER BY rating DESC 
      LIMIT 6
    `);

    const vendors = result.rows.map(vendor => ({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      rating: parseFloat(vendor.rating) || 0,
      reviewCount: parseInt(vendor.review_count) || 0,
      location: vendor.location || 'Location not specified',
      description: vendor.description || 'Professional wedding services',
      phone: vendor.phone,
      email: vendor.email,
      website: vendor.website_url,
      yearsExperience: vendor.years_experience || 0,
      specialties: vendor.specialties || [],
      portfolioImages: vendor.portfolio_images || []
    }));

    res.json({
      success: true,
      vendors,
      total: vendors.length
    });
  } catch (error) {
    console.error('❌ Featured vendors error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch featured vendors',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Basic auth endpoints for testing
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);
    
    // For now, return a mock successful login
    // In production, you'd validate against the database
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 'mock-user-id',
        email: email,
        name: 'Test User',
        type: 'individual'
      },
      token: 'mock-jwt-token'
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log('👤 Register attempt for:', email);
    
    // For now, return a mock successful registration
    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: 'mock-user-id',
        email: email,
        name: name,
        type: 'individual'
      },
      token: 'mock-jwt-token'
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    console.log('🔍 Token verification for:', token?.substring(0, 20) + '...');
    
    // For now, return mock verification result
    if (token && token !== 'null' && token !== 'undefined') {
      res.json({
        success: true,
        authenticated: true,
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
          name: 'Test User',
          type: 'individual'
        }
      });
    } else {
      res.json({
        success: false,
        authenticated: false,
        message: 'Token not found or invalid'
      });
    }
  } catch (error) {
    console.error('❌ Token verification error:', error);
    res.status(500).json({
      success: false,
      authenticated: false,
      error: 'Verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test database connection
async function testDatabaseConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);
    
    // Check services table
    const servicesResult = await pool.query('SELECT COUNT(*) FROM services');
    console.log(`📊 Services table has ${servicesResult.rows[0].count} rows`);
    
    // Check vendors table
    const vendorsResult = await pool.query('SELECT COUNT(*) FROM vendors');
    console.log(`🏪 Vendors table has ${vendorsResult.rows[0].count} rows`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Bazaar Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  testDatabaseConnection();
});

export default app;
