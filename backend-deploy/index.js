const express = require('express');
const cors = require('cors');

// Ultra-minimal Wedding Bazaar backend with mock data - PLAIN JAVASCRIPT
// Emergency deployment to bypass TypeScript compilation issues

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://weddingbazaar-web.web.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Mock vendor data
const mockVendors = [
  {
    id: 'vendor-1',
    name: 'Perfect Weddings Co.',
    category: 'Wedding Planning',
    rating: 4.8,
    reviewCount: 124,
    location: 'New York, NY',
    description: 'Full-service wedding planning with 15+ years experience.',
    image: 'https://via.placeholder.com/400x300/f8f9fa/333?text=Perfect+Weddings',
    price: '$2500 - $5000',
    specialties: ['Full Planning', 'Day Coordination', 'Destination Weddings']
  },
  {
    id: 'vendor-2',
    name: 'Elegant Captures Photography',
    category: 'Photography',
    rating: 4.9,
    reviewCount: 89,
    location: 'Los Angeles, CA',
    description: 'Award-winning wedding photography capturing your special moments.',
    image: 'https://via.placeholder.com/400x300/f8f9fa/333?text=Elegant+Captures',
    price: '$1800 - $3500',
    specialties: ['Engagement Photos', 'Wedding Day', 'Bridal Portraits']
  },
  {
    id: 'vendor-3',
    name: 'Gourmet Catering Solutions',
    category: 'Catering',
    rating: 4.7,
    reviewCount: 156,
    location: 'Chicago, IL',
    description: 'Exquisite cuisine and exceptional service for your wedding.',
    image: 'https://via.placeholder.com/400x300/f8f9fa/333?text=Gourmet+Catering',
    price: '$45 - $85 per person',
    specialties: ['Fine Dining', 'Cocktail Hour', 'Dietary Accommodations']
  },
  {
    id: 'vendor-4',
    name: 'Harmony Wedding Venues',
    category: 'Venues',
    rating: 4.6,
    reviewCount: 78,
    location: 'Austin, TX',
    description: 'Beautiful indoor and outdoor wedding venues.',
    image: 'https://via.placeholder.com/400x300/f8f9fa/333?text=Harmony+Venues',
    price: '$2000 - $8000',
    specialties: ['Garden Ceremonies', 'Reception Halls', 'Bridal Suites']
  }
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'production',
    message: 'Emergency JavaScript backend online'
  });
});

// Vendors endpoints
app.get('/api/vendors', (req, res) => {
  console.log('🏪 GET /api/vendors called');
  res.json({
    success: true,
    vendors: mockVendors,
    total: mockVendors.length
  });
});

app.get('/api/vendors/featured', (req, res) => {
  console.log('⭐ GET /api/vendors/featured called');
  res.json({
    success: true,
    vendors: mockVendors,
    total: mockVendors.length
  });
});

// Auth endpoints  
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Login attempt:', email);
  
  if (email && password) {
    res.json({
      success: true,
      token: 'mock-jwt-token-12345',
      user: {
        id: 'user-1',
        email: email,
        name: 'Test User',
        userType: 'individual'
      },
      message: 'Login successful'
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Email and password required'
    });
  }
});

app.post('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
  
  res.json({
    success: true,
    authenticated: !!token,
    user: token ? {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User'
    } : null,
    message: token ? 'Token valid' : 'No token provided'
  });
});

// Booking endpoints
app.post('/api/bookings/request', (req, res) => {
  console.log('📝 POST /api/bookings/request called:', req.body);
  
  res.json({
    success: true,
    booking: {
      id: 'booking-' + Date.now(),
      status: 'pending',
      vendorId: req.body.vendorId,
      serviceId: req.body.serviceId,
      coupleId: req.body.coupleId,
      eventDate: req.body.eventDate,
      createdAt: new Date().toISOString()
    },
    message: 'Booking request submitted successfully'
  });
});

app.get('/api/bookings/couple/:coupleId', (req, res) => {
  const { coupleId } = req.params;
  console.log('👥 GET /api/bookings/couple/' + coupleId);
  
  res.json({
    success: true,
    bookings: [],
    total: 0
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Emergency Wedding Bazaar Backend (JS) running on port ${PORT}`);
  console.log(`📊 Mock vendors loaded: ${mockVendors.length}`);
});

module.exports = app;
