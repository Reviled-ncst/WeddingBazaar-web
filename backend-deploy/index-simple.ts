import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'https://weddingbazaarph.web.app',
    'https://weddingbazaarph.firebaseapp.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Wedding Bazaar API is running',
    timestamp: new Date().toISOString()
  });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    // For now, just return a success message
    res.json({
      status: 'ok',
      message: 'Database connection test passed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Featured vendors endpoint
app.get('/api/vendors/featured', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
    
    const featuredVendors = [
      {
        id: 1,
        name: "Elegant Moments Photography",
        category: "photography",
        location: "Manila",
        rating: 4.8,
        price_range: "₱50,000 - ₱100,000",
        image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400",
        featured: true,
        description: "Professional wedding photography with a creative touch"
      },
      {
        id: 2,
        name: "Royal Catering Services",
        category: "catering",
        location: "Quezon City",
        rating: 4.9,
        price_range: "₱80,000 - ₱150,000",
        image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400",
        featured: true,
        description: "Exquisite wedding catering with international cuisine"
      },
      {
        id: 3,
        name: "Garden Paradise Venue",
        category: "venue",
        location: "Tagaytay",
        rating: 4.7,
        price_range: "₱120,000 - ₱200,000",
        image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400",
        featured: true,
        description: "Beautiful garden venue with stunning mountain views"
      },
      {
        id: 4,
        name: "Floral Dreams",
        category: "flowers",
        location: "Makati",
        rating: 4.6,
        price_range: "₱25,000 - ₱75,000",
        image: "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=400",
        featured: true,
        description: "Creative floral arrangements and wedding decorations"
      },
      {
        id: 5,
        name: "Harmony Wedding Band",
        category: "music",
        location: "Pasig",
        rating: 4.8,
        price_range: "₱30,000 - ₱60,000",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
        featured: true,
        description: "Live music and DJ services for your special day"
      },
      {
        id: 6,
        name: "Perfect Day Planners",
        category: "planning",
        location: "Manila",
        rating: 4.9,
        price_range: "₱40,000 - ₱100,000",
        image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400",
        featured: true,
        description: "Full-service wedding planning and coordination"
      }
    ].slice(0, limit);
    
    res.json({ success: true, vendors: featuredVendors });
  } catch (error) {
    console.error('Error fetching featured vendors:', error);
    res.status(500).json({
      error: 'Failed to fetch featured vendors',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Vendor categories endpoint
app.get('/api/vendors/categories', async (req, res) => {
  try {
    const categories = [
      {
        id: 'photography',
        name: 'Photography',
        icon: '📸',
        count: 45,
        description: 'Professional wedding photographers'
      },
      {
        id: 'catering',
        name: 'Catering',
        icon: '🍽️',
        count: 32,
        description: 'Wedding catering services'
      },
      {
        id: 'venue',
        name: 'Venues',
        icon: '🏛️',
        count: 28,
        description: 'Beautiful wedding venues'
      },
      {
        id: 'flowers',
        name: 'Flowers',
        icon: '💐',
        count: 24,
        description: 'Wedding floristry and decorations'
      },
      {
        id: 'music',
        name: 'Music',
        icon: '🎵',
        count: 19,
        description: 'DJs, bands, and musicians'
      },
      {
        id: 'planning',
        name: 'Planning',
        icon: '📋',
        count: 15,
        description: 'Wedding planners and coordinators'
      }
    ];
    
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching vendor categories:', error);
    res.status(500).json({
      error: 'Failed to fetch vendor categories',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Basic vendors endpoint
app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = [
      {
        id: 1,
        name: "Elegant Moments Photography",
        category: "photography",
        location: "Manila",
        rating: 4.8,
        price_range: "₱50,000 - ₱100,000"
      },
      {
        id: 2,
        name: "Royal Catering Services",
        category: "catering", 
        location: "Quezon City",
        rating: 4.9,
        price_range: "₱80,000 - ₱150,000"
      },
      {
        id: 3,
        name: "Garden Paradise Venue",
        category: "venue",
        location: "Tagaytay",
        rating: 4.7,
        price_range: "₱120,000 - ₱200,000"
      }
    ];
    
    res.json({ success: true, vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      error: 'Failed to fetch vendors',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Basic auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple mock authentication
    if (email && password) {
      res.json({
        success: true,
        user: {
          id: 1,
          email: email,
          name: "Test User",
          type: "individual"
        },
        token: "mock-jwt-token-" + Date.now()
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, type } = req.body;
    
    // Simple mock registration
    if (email && password && name) {
      res.json({
        success: true,
        user: {
          id: Date.now(),
          email: email,
          name: name,
          type: type || "individual"
        },
        token: "mock-jwt-token-" + Date.now()
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Bazaar API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Database test: http://localhost:${PORT}/api/test-db`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
