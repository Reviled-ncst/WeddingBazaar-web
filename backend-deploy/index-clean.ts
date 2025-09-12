import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 3001;

// Middleware
app.use(helmet());

// CORS configuration with environment variable support
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production' 
    ? ['https://weddingbazaarph.web.app'] 
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'Mock',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mock data for vendors
const mockVendors = [
  {
    id: 1,
    name: 'Elite Photography Studio',
    category: 'photography',
    rating: 4.9,
    reviews: 156,
    location: 'Manila',
    price_range: '₱50,000 - ₱150,000',
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Professional wedding photography with 10+ years experience',
    portfolio: [
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    contact: {
      phone: '+639123456789',
      email: 'info@elitephoto.ph',
      website: 'https://elitephoto.ph'
    },
    specialties: ['Wedding Photography', 'Prenup Photography', 'Same Day Edit'],
    experience_years: 10,
    awards: ['Best Wedding Photographer 2023']
  },
  {
    id: 2,
    name: 'Garden Paradise Venue',
    category: 'venue',
    rating: 4.8,
    reviews: 89,
    location: 'Tagaytay',
    price_range: '₱100,000 - ₱300,000',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Beautiful garden venue with mountain views',
    portfolio: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    contact: {
      phone: '+639123456790',
      email: 'info@gardenparadise.ph',
      website: 'https://gardenparadise.ph'
    },
    specialties: ['Garden Weddings', 'Outdoor Ceremonies', 'Mountain View'],
    experience_years: 15,
    capacity: 200
  }
];

const mockCategories = [
  { id: 1, name: 'Photography', count: 45, icon: '📸' },
  { id: 2, name: 'Venues', count: 32, icon: '🏛️' },
  { id: 3, name: 'Catering', count: 28, icon: '🍽️' },
  { id: 4, name: 'Music & DJ', count: 21, icon: '🎵' },
  { id: 5, name: 'Flowers', count: 19, icon: '💐' },
  { id: 6, name: 'Planning', count: 15, icon: '📋' }
];

// Mock user for authentication
const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  type: 'individual'
};

// Vendors endpoints
app.get('/api/vendors', (req, res) => {
  res.json({
    success: true,
    data: mockVendors
  });
});

app.get('/api/vendors/featured', (req, res) => {
  res.json({
    success: true,
    data: mockVendors.slice(0, 2)
  });
});

app.get('/api/vendors/categories', (req, res) => {
  res.json({
    success: true,
    data: mockCategories
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email && password) {
    const token = 'mock-jwt-token-' + Date.now();
    res.json({
      success: true,
      token,
      user: mockUser
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, userType } = req.body;
  
  if (email && password && name) {
    const token = 'mock-jwt-token-' + Date.now();
    res.json({
      success: true,
      token,
      user: { ...mockUser, email, name, type: userType || 'individual' }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email, password, and name required'
    });
  }
});

app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token && token.startsWith('mock-jwt-token-')) {
    res.json({
      success: true,
      user: mockUser
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Catch all for unknown routes
app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origins: ${corsOrigins.join(', ')}`);
});
