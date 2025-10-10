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
