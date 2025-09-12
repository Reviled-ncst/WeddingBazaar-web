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
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
    const vendors = [
      {
        id: 1,
        name: "Sample Wedding Photographer",
        category: "photography",
        location: "Manila",
        rating: 4.8,
        price_range: "₱50,000 - ₱100,000"
      },
      {
        id: 2,
        name: "Elite Catering Services",
        category: "catering", 
        location: "Quezon City",
        rating: 4.9,
        price_range: "₱2,000 - ₱4,000 per person"
      }
    ];
    
    res.json({ success: true, vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Featured vendors endpoint - THIS IS THE FIX!
app.get('/api/vendors/featured', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
    
    const featuredVendors = [
      {
        id: 1,
        name: "Elite Wedding Photography",
        category: "photography",
        location: "Manila",
        rating: 4.9,
        price_range: "₱80,000 - ₱150,000",
        image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400",
        featured: true
      },
      {
        id: 2,
        name: "Grandeur Catering Services",
        category: "catering",
        location: "Quezon City",
        rating: 4.8,
        price_range: "₱1,500 - ₱3,000 per person",
        image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400",
        featured: true
      },
      {
        id: 3,
        name: "Paradise Garden Venue",
        category: "venue",
        location: "Tagaytay",
        rating: 4.9,
        price_range: "₱200,000 - ₱500,000",
        image: "https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400",
        featured: true
      },
      {
        id: 4,
        name: "Harmony Wedding Band",
        category: "music",
        location: "Makati",
        rating: 4.7,
        price_range: "₱50,000 - ₱100,000",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
        featured: true
      },
      {
        id: 5,
        name: "Bloom & Blossom Florists",
        category: "florals",
        location: "Pasig",
        rating: 4.8,
        price_range: "₱30,000 - ₱80,000",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        featured: true
      },
      {
        id: 6,
        name: "Perfect Day Planners",
        category: "planning",
        location: "BGC",
        rating: 4.9,
        price_range: "₱100,000 - ₱300,000",
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400",
        featured: true
      }
    ];

    const limitedVendors = featuredVendors.slice(0, limit);
    res.json({ success: true, vendors: limitedVendors });
  } catch (error) {
    console.error('Error fetching featured vendors:', error);
    res.status(500).json({
      error: 'Failed to fetch featured vendors',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Vendor categories endpoint - THIS IS THE OTHER FIX!
app.get('/api/vendors/categories', async (req, res) => {
  try {
    const categories = [
      {
        id: 'photography',
        name: 'Photography',
        description: 'Professional wedding photographers',
        icon: '📸',
        count: 45
      },
      {
        id: 'catering',
        name: 'Catering',
        description: 'Wedding catering services',
        icon: '🍽️',
        count: 32
      },
      {
        id: 'venue',
        name: 'Venues',
        description: 'Wedding venues and locations',
        icon: '🏛️',
        count: 28
      },
      {
        id: 'music',
        name: 'Music & Entertainment',
        description: 'DJs, bands, and entertainment',
        icon: '🎵',
        count: 22
      },
      {
        id: 'florals',
        name: 'Florals',
        description: 'Wedding flowers and decorations',
        icon: '🌸',
        count: 18
      },
      {
        id: 'planning',
        name: 'Wedding Planning',
        description: 'Professional wedding planners',
        icon: '📋',
        count: 15
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Bazaar API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Database test: http://localhost:${PORT}/api/test-db`);
});

export default app;
