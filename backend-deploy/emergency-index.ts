import express from 'express';
import cors from 'cors';

// Ultra-minimal Wedding Bazaar backend with mock data
// Emergency deployment to get frontend working immediately

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://weddingbazaar-web.web.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Mock vendor data matching frontend expectations
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
    price: '₱135,000 - ₱270,000',
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
    price: '₱97,200 - ₱189,000',
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
  },
  {
    id: 'vendor-5',
    name: 'Melody Music Services',
    category: 'Music & DJ',
    rating: 4.5,
    reviewCount: 92,
    location: 'Miami, FL',
    description: 'Professional DJ and live music services for your celebration.',
    image: 'https://via.placeholder.com/400x300/f8f9fa/333?text=Melody+Music',
    price: '$800 - $2200',
    specialties: ['DJ Services', 'Live Bands', 'Sound Equipment']
  }
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'production',
    message: 'Emergency minimal backend online'
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
    bookings: [
      {
        id: 'booking-1',
        vendorName: 'Perfect Weddings Co.',
        serviceName: 'Full Wedding Planning',
        status: 'confirmed',
        eventDate: '2025-10-15',
        amount: 3500,
        createdAt: '2025-09-01T10:00:00Z'
      }
    ],
    total: 1
  });
});

// Database scan endpoint (mock)
app.get('/api/database/scan', (req, res) => {
  res.json({
    success: true,
    services: mockVendors.map(vendor => ({
      id: vendor.id,
      name: vendor.name + ' - ' + vendor.category + ' Services',
      category: vendor.category.toLowerCase(),
      price: vendor.price,
      description: vendor.description
    })),
    message: 'Mock database scan completed'
  });
});

// Catch-all 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} not available`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/vendors',
      'GET /api/vendors/featured',
      'POST /api/auth/login',
      'POST /api/auth/verify',
      'POST /api/bookings/request',
      'GET /api/bookings/couple/:coupleId',
      'GET /api/database/scan'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Emergency Wedding Bazaar Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Mock vendors loaded: ${mockVendors.length}`);
});

export default app;
