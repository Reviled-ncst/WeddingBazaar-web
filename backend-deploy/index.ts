import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());

// CORS configuration
const corsOrigins = [
  'https://weddingbazaarph.web.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Debug middleware for auth requests
app.use('/api/auth', (req, res, next) => {
  console.log(`Auth request: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers.authorization ? 'Auth header present' : 'No auth header');
  console.log('Body:', req.body ? 'Body present' : 'No body');
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    message: 'Wedding Bazaar API is running',
    timestamp: new Date().toISOString()
  });
});

// Basic vendors endpoint
app.get('/api/vendors', async (req, res) => {
  try {
    // Mock vendor data
    const mockVendors = [
      {
        id: 1,
        name: 'Elegant Photography Studios',
        category: 'Photography',
        location: 'Manila',
        rating: 4.8,
        reviewCount: 127,
        priceRange: '₱25,000 - ₱80,000',
        description: 'Professional wedding photography with artistic flair',
        image: '/api/placeholder/300/200',
        featured: true
      },
      {
        id: 2,
        name: 'Divine Catering Services',
        category: 'Catering',
        location: 'Quezon City',
        rating: 4.9,
        reviewCount: 89,
        priceRange: '₱800 - ₱1,500 per head',
        description: 'Exquisite culinary experiences for your special day',
        image: '/api/placeholder/300/200',
        featured: true
      }
    ];

    res.json({
      success: true,
      vendors: mockVendors
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors'
    });
  }
});

// Featured vendors endpoint
app.get('/api/vendors/featured', async (req, res) => {
  try {
    const featuredVendors = [
      {
        id: 1,
        name: 'Elegant Photography Studios',
        category: 'Photography',
        location: 'Manila',
        rating: 4.8,
        reviewCount: 127,
        priceRange: '₱25,000 - ₱80,000',
        description: 'Professional wedding photography with artistic flair',
        image: '/api/placeholder/300/200',
        specialties: ['Wedding Photography', 'Engagement Shoots', 'Pre-nup'],
        yearsExperience: 8
      },
      {
        id: 2,
        name: 'Divine Catering Services',
        category: 'Catering',
        location: 'Quezon City',
        rating: 4.9,
        reviewCount: 89,
        priceRange: '₱800 - ₱1,500 per head',
        description: 'Exquisite culinary experiences for your special day',
        image: '/api/placeholder/300/200',
        specialties: ['Filipino Cuisine', 'International Buffet', 'Custom Menus'],
        yearsExperience: 12
      }
    ];

    res.json({
      success: true,
      vendors: featuredVendors
    });
  } catch (error) {
    console.error('Error fetching featured vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured vendors'
    });
  }
});

// Vendor categories endpoint
app.get('/api/vendors/categories', async (req, res) => {
  try {
    const categories = [
      {
        id: 1,
        name: 'Photography',
        description: 'Capture your special moments',
        icon: '📸',
        vendorCount: 45
      },
      {
        id: 2,
        name: 'Catering',
        description: 'Delicious food for your guests',
        icon: '🍽️',
        vendorCount: 32
      },
      {
        id: 3,
        name: 'Venues',
        description: 'Perfect locations for your wedding',
        icon: '🏰',
        vendorCount: 28
      },
      {
        id: 4,
        name: 'Music & Entertainment',
        description: 'Keep the party going',
        icon: '🎵',
        vendorCount: 22
      },
      {
        id: 5,
        name: 'Flowers & Decoration',
        description: 'Beautiful floral arrangements',
        icon: '🌸',
        vendorCount: 38
      },
      {
        id: 6,
        name: 'Wedding Planning',
        description: 'Full-service wedding coordination',
        icon: '📋',
        vendorCount: 15
      }
    ];

    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor categories'
    });
  }
});

// Basic auth endpoints (mock)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication - for testing only
  if (email && password) {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 1,
        email: email,
        name: 'Test User',
        userType: 'individual'
      },
      token: 'mock-jwt-token'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  // Mock registration - for testing only
  if (email && password && name) {
    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: Date.now(),
        email: email,
        name: name,
        userType: 'individual'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email, password, and name are required'
    });
  }
});

// Auth verify endpoint - Support both GET and POST
const verifyTokenHandler = async (req, res) => {
  try {
    // Try to get token from Authorization header first
    let token = req.headers.authorization?.split(' ')[1];
    
    // If not in header, try to get from request body (for POST requests)
    if (!token && req.body && req.body.token) {
      token = req.body.token;
    }
    
    // If still no token, try from query params (for GET requests)
    if (!token && req.query && req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Mock token verification - for testing only
    // In production, you would verify the JWT token here
    if (token === 'mock-jwt-token' || token.startsWith('mock-')) {
      res.json({
        success: true,
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          userType: 'individual'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
};

// Support both GET and POST for auth verify
app.get('/api/auth/verify', verifyTokenHandler);
app.post('/api/auth/verify', verifyTokenHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Bazaar API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Database test: http://localhost:${PORT}/api/test-db`);
});

export default app;
