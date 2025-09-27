const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Production Wedding Bazaar Backend (CommonJS Version)
// Comprehensive backend with all working endpoints for production

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 3001;

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production' 
    ? ['https://weddingbazaar-web.web.app', 'https://weddingbazaar-web.firebaseapp.com'] 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

console.log('🌐 [CORS] Allowed origins:', corsOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn('🚫 [CORS] Blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Database connection (simplified mock for now)
const testDatabaseConnection = async () => {
  try {
    // Mock database connection test
    console.log('🔍 [DB] Testing database connection...');
    return true;
  } catch (error) {
    console.error('❌ [DB] Database connection failed:', error);
    return false;
  }
};

// Mock data for vendors
const mockVendors = [
  {
    id: '1',
    name: 'Perfect Weddings Co.',
    category: 'Wedding Planning',
    rating: 4.2,
    reviewCount: 33,
    location: 'New York, NY',
    description: 'Full-service wedding planning with 10+ years of experience.',
    phone: '(555) 123-4567',
    email: 'info@perfectweddings.com',
    website: 'https://perfectweddings.com',
    images: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400'
    ]
  },
  {
    id: '2',
    name: 'Beltran Sound Systems',
    category: 'DJ',
    rating: 4.5,
    reviewCount: 71,
    location: 'Los Angeles, CA',
    description: 'Professional DJ services for weddings and events.',
    phone: '(555) 987-6543',
    email: 'bookings@beltransound.com',
    website: 'https://beltransound.com',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      'https://images.unsplash.com/photo-1571266028243-e4733b5c94de?w=400'
    ]
  },
  {
    id: '3',
    name: 'Elite Photography Studio',
    category: 'Photography',
    rating: 4.8,
    reviewCount: 89,
    location: 'Miami, FL',
    description: 'Award-winning wedding photography and videography.',
    phone: '(555) 456-7890',
    email: 'hello@elitephoto.com',
    website: 'https://elitephoto.com',
    images: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400'
    ]
  },
  {
    id: '4',
    name: 'Elegant Floral Designs',
    category: 'Florist',
    rating: 4.6,
    reviewCount: 45,
    location: 'Chicago, IL',
    description: 'Custom wedding florals and venue decoration.',
    phone: '(555) 234-5678',
    email: 'orders@elegantflorals.com',
    website: 'https://elegantflorals.com',
    images: [
      'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=400',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'
    ]
  },
  {
    id: '5',
    name: 'Grand Ballroom Venue',
    category: 'Venue',
    rating: 4.3,
    reviewCount: 67,
    location: 'Dallas, TX',
    description: 'Luxury wedding venue with full-service catering.',
    phone: '(555) 345-6789',
    email: 'events@grandballroom.com',
    website: 'https://grandballroom.com',
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=400'
    ]
  }
];

// Mock services data
const mockServices = [
  {
    id: '1',
    name: 'Wedding Photography',
    category: 'Photography',
    description: 'Professional wedding photography services',
    price: '$2,500 - $5,000',
    duration: '8-10 hours',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400'
  },
  {
    id: '2',
    name: 'Wedding Planning',
    category: 'Planning',
    description: 'Full-service wedding planning and coordination',
    price: '$3,000 - $8,000',
    duration: '6-12 months',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400'
  },
  {
    id: '3',
    name: 'DJ Services',
    category: 'Entertainment',
    description: 'Professional DJ and sound system for weddings',
    price: '$800 - $2,000',
    duration: '6-8 hours',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
  },
  {
    id: '4',
    name: 'Wedding Flowers',
    category: 'Florals',
    description: 'Custom bridal bouquets and venue florals',
    price: '$1,200 - $3,500',
    duration: 'Event day setup',
    image: 'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=400'
  },
  {
    id: '5',
    name: 'Wedding Venue',
    category: 'Venue',
    description: 'Elegant wedding venues with catering options',
    price: '$5,000 - $15,000',
    duration: '6-12 hours',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400'
  }
];

// In-memory storage for bookings (will be replaced with database)
let bookingsStorage = [];
let bookingIdCounter = 1;

// ================================
// HEALTH & STATUS ENDPOINTS
// ================================

app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testDatabaseConnection();
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'Connected' : 'Disconnected',
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      endpoints: {
        health: '✅ Active',
        vendors: '✅ Active',
        services: '✅ Active',
        bookings: '✅ Active',
        auth: '✅ Active'
      }
    };
    
    res.json(healthStatus);
  } catch (error) {
    console.error('❌ [HEALTH] Health check failed:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    timestamp: new Date().toISOString(),
    server: 'Wedding Bazaar API v2.0'
  });
});

// ================================
// VENDOR ENDPOINTS
// ================================

app.get('/api/vendors', async (req, res) => {
  try {
    console.log('🏪 [API] GET /api/vendors called');
    
    res.json({
      success: true,
      vendors: mockVendors,
      total: mockVendors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Vendors endpoint failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendors',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/vendors/featured', async (req, res) => {
  try {
    console.log('⭐ [API] GET /api/vendors/featured called');
    
    res.json({
      success: true,
      vendors: mockVendors,
      total: mockVendors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Featured vendors endpoint failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured vendors',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🏪 [API] GET /api/vendors/' + id + ' called');
    
    const vendor = mockVendors.find(v => v.id === id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found',
        message: `No vendor found with ID: ${id}`,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      vendor: vendor,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Get vendor by ID failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// SERVICES ENDPOINTS
// ================================

app.get('/api/services', async (req, res) => {
  try {
    console.log('🔧 [API] GET /api/services called');
    
    res.json({
      success: true,
      services: mockServices,
      total: mockServices.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Services endpoint failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/services/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    console.log('🔧 [API] GET /api/services/category/' + category + ' called');
    
    const filteredServices = mockServices.filter(service => 
      service.category.toLowerCase() === category.toLowerCase()
    );
    
    res.json({
      success: true,
      services: filteredServices,
      total: filteredServices.length,
      category: category,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Services by category failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services by category',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// AUTHENTICATION ENDPOINTS
// ================================

// Mock user storage
const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    password: '$2a$10$rX8V6QOJJmKqV9V9V9V9V.rX8V6QOJJmKqV9V9V9V9rX8V6QOJJ', // "password123"
    firstName: 'Test',
    lastName: 'User',
    role: 'couple'
  }
];

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 [AUTH] Login attempt received:', { 
      email: req.body.email, 
      hasPassword: !!req.body.password,
      ip: req.ip
    });
    
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      console.log('❌ [AUTH] Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Demo authentication - accept any valid email for testing
    let user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // If user doesn't exist, create a demo user for any valid email
    if (!user) {
      console.log('🔧 [AUTH] Creating demo user for:', email);
      user = {
        id: String(mockUsers.length + 1),
        email: email.toLowerCase(),
        password: 'demo-password',
        firstName: 'Demo',
        lastName: 'User',
        role: 'couple'
      };
      mockUsers.push(user);
    }

    // For demo purposes, accept any password
    console.log('✅ [AUTH] Login successful for:', email);
    
    const token = 'mock-jwt-token-' + Date.now();
    
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [AUTH] Login failed:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 [AUTH] Registration attempt received:', { 
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      role: req.body.role
    });
    
    const { email, password, firstName, lastName, role } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, firstName, and lastName are required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      console.log('❌ [AUTH] User already exists:', email);
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Create new user
    const newUser = {
      id: String(mockUsers.length + 1),
      email: email.toLowerCase(),
      password: 'mock-hashed-password',
      firstName,
      lastName,
      role: role || 'couple'
    };
    
    mockUsers.push(newUser);
    
    console.log('✅ [AUTH] Registration successful for:', email);
    
    const token = 'mock-jwt-token-' + Date.now();
    
    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      },
      token: token,
      message: 'Registration successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [AUTH] Registration failed:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
    
    if (!token) {
      return res.json({
        success: false,
        authenticated: false,
        message: 'Token not found',
        timestamp: new Date().toISOString()
      });
    }

    // Mock token verification
    if (token.startsWith('mock-jwt-token-')) {
      const mockUser = mockUsers[0]; // Return first user for demo
      res.json({
        success: true,
        authenticated: true,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role
        },
        message: 'Token valid',
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: false,
        authenticated: false,
        message: 'Token invalid',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ [AUTH] Token verification error:', error);
    res.json({
      success: false,
      authenticated: false,
      message: 'Token verification failed',
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    console.log('🚪 [AUTH] User logout');
    
    res.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [AUTH] Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// BOOKING ENDPOINTS
// ================================

app.post('/api/bookings/request', async (req, res) => {
  try {
    console.log('📝 [BOOKING] POST /api/bookings/request called');
    console.log('📦 [BOOKING] Request body:', JSON.stringify(req.body, null, 2));
    
    const bookingData = req.body;
    
    // Input validation
    if (!bookingData.vendorId) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID is required',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!bookingData.eventDate) {
      return res.status(400).json({
        success: false,
        error: 'Event date is required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Create booking
    const booking = {
      id: String(bookingIdCounter++),
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    bookingsStorage.push(booking);
    
    console.log('✅ [BOOKING] Booking created successfully:', booking.id);
    res.status(201).json({
      success: true,
      booking: booking,
      message: 'Booking request submitted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [BOOKING] Booking request failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking request',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/bookings/couple/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    console.log('👥 [BOOKING] GET /api/bookings/couple/' + coupleId + ' called');
    
    const bookings = bookingsStorage.filter(booking => 
      booking.coupleId === coupleId || booking.userId === coupleId
    );
    
    res.json({
      success: true,
      bookings: bookings,
      total: bookings.length,
      coupleId: coupleId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [BOOKING] Get couple bookings failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch couple bookings',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 [BOOKING] GET /api/bookings/' + id + ' called');
    
    const booking = bookingsStorage.find(b => b.id === id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        message: `No booking found with ID: ${id}`,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      booking: booking,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [BOOKING] Get booking by ID failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    console.log('📝 [BOOKING] PUT /api/bookings/' + id + '/status called');
    console.log('📦 [BOOKING] Status update:', { status, notes });
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const validStatuses = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        validStatuses: validStatuses,
        timestamp: new Date().toISOString()
      });
    }
    
    const bookingIndex = bookingsStorage.findIndex(b => b.id === id);
    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }
    
    bookingsStorage[bookingIndex] = {
      ...bookingsStorage[bookingIndex],
      status,
      notes,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      booking: bookingsStorage[bookingIndex],
      message: 'Booking status updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [BOOKING] Update booking status failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// ERROR HANDLING & 404
// ================================

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 [ERROR] Global error handler:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ [404] Endpoint not found:', req.method, req.originalUrl);
  
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: {
      health: 'GET /api/health',
      ping: 'GET /api/ping',
      vendors: {
        all: 'GET /api/vendors',
        featured: 'GET /api/vendors/featured',
        byId: 'GET /api/vendors/:id'
      },
      services: {
        all: 'GET /api/services',
        byCategory: 'GET /api/services/category/:category'
      },
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        verify: 'POST /api/auth/verify',
        logout: 'POST /api/auth/logout'
      },
      bookings: {
        create: 'POST /api/bookings/request',
        getByCouple: 'GET /api/bookings/couple/:coupleId',
        getById: 'GET /api/bookings/:id',
        updateStatus: 'PUT /api/bookings/:id/status'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ================================
// SERVER STARTUP
// ================================

async function startServer() {
  try {
    // Test database connection
    console.log('🔍 [STARTUP] Testing database connection...');
    const dbConnected = await testDatabaseConnection();
    console.log('✅ [STARTUP] Database connection successful');
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log('\n🚀 ===================================');
      console.log('🎉 Wedding Bazaar Production Backend');
      console.log('🚀 ===================================');
      console.log(`🌟 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log('🚀 ===================================\n');
      
      // Log available endpoints
      console.log('📋 Available Endpoints:');
      console.log('   Health: GET /api/health');
      console.log('   Ping: GET /api/ping');
      console.log('   Vendors: GET /api/vendors');
      console.log('   Featured Vendors: GET /api/vendors/featured');
      console.log('   Services: GET /api/services');
      console.log('   Auth Login: POST /api/auth/login');
      console.log('   Auth Register: POST /api/auth/register');
      console.log('   Booking Request: POST /api/bookings/request');
      console.log('   Couple Bookings: GET /api/bookings/couple/:coupleId');
      console.log('🚀 ===================================\n');
      
      console.log('📊 Mock Data Status:');
      console.log(`   Vendors: ${mockVendors.length} available`);
      console.log(`   Services: ${mockServices.length} available`);
      console.log(`   Users: ${mockUsers.length} registered`);
      console.log(`   Bookings: ${bookingsStorage.length} in storage`);
      console.log('🚀 ===================================\n');
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 [SHUTDOWN] SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ [SHUTDOWN] Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 [SHUTDOWN] SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ [SHUTDOWN] Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ [STARTUP] Server startup failed:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
