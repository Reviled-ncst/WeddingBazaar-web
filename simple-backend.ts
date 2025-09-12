import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000', 
    'https://weddingbazaarph.web.app'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Wedding Bazaar API is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as current_time');
    res.json({ 
      status: 'ok', 
      message: 'Database connection successful',
      timestamp: result.rows[0].current_time
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Simple auth endpoints for testing
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, userType = 'individual' } = req.body;
    
    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // For now, just return success (you can implement full auth later)
    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: 'temp-' + Date.now(),
        email,
        name,
        userType
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // For now, just return success (you can implement full auth later)
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 'temp-' + Date.now(),
        email,
        name: 'Test User',
        userType: 'individual'
      },
      token: 'temp-token-' + Date.now()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Basic vendors endpoint
app.get('/api/vendors', async (req, res) => {
  try {
    // Return some mock data for now
    res.json({
      success: true,
      vendors: [
        {
          id: 1,
          name: 'Sample Wedding Photographer',
          category: 'photography',
          location: 'Manila',
          rating: 4.8,
          price_range: '₱50,000 - ₱100,000'
        },
        {
          id: 2,
          name: 'Elite Catering Services',
          category: 'catering',
          location: 'Makati',
          rating: 4.9,
          price_range: '₱800 - ₱1,500 per person'
        }
      ]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors',
      error: error.message
    });
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Wedding Bazaar API server running on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/api/health`);
  console.log(`🔍 Database test: http://localhost:${port}/api/test-db`);
});

export default app;
