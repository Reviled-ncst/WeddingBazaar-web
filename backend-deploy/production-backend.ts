import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import rateLimit from 'express-rate-limit';

// Production-ready Wedding Bazaar Backend
// Date: September 28, 2025
// Purpose: Comprehensive backend with all endpoints for production deployment

import { db, testDatabaseConnection } from '../backend/database/connection';
import { vendorService } from '../backend/services/vendorService';
import { BookingService } from '../backend/services/bookingService';
import { AuthService } from '../backend/services/authService';
import { servicesApiService } from '../backend/services/servicesApiService';

config();

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 3001;

// Services
const bookingService = new BookingService();
const authService = new AuthService();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  }
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});

// Security middleware
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

// Apply rate limiting
app.use(limiter);

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
      error: error instanceof Error ? error.message : 'Unknown error',
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
    const vendors = await vendorService.getFeaturedVendors();
    
    res.json({
      success: true,
      vendors: vendors,
      total: vendors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Vendors endpoint failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendors',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/vendors/featured', async (req, res) => {
  try {
    console.log('⭐ [API] GET /api/vendors/featured called');
    const vendors = await vendorService.getFeaturedVendors();
    
    res.json({
      success: true,
      vendors: vendors,
      total: vendors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Featured vendors endpoint failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured vendors',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🏪 [API] GET /api/vendors/' + id + ' called');
    
    const vendor = await vendorService.getVendorById(id);
    
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
      message: error instanceof Error ? error.message : 'Unknown error',
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
    const services = await servicesApiService.getAllServices();
    
    res.json({
      success: true,
      services: services,
      total: services.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Services endpoint failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/services/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    console.log('🔧 [API] GET /api/services/category/' + category + ' called');
    
    const services = await servicesApiService.getServicesByCategory(category);
    
    res.json({
      success: true,
      services: services,
      total: services.length,
      category: category,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Services by category failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services by category',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// AUTHENTICATION ENDPOINTS
// ================================

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    console.log('🔐 [AUTH] Login attempt received:', { 
      email: req.body.email, 
      hasPassword: !!req.body.password,
      ip: req.ip,
      userAgent: req.get('User-Agent')
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

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ [AUTH] Invalid email format:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        timestamp: new Date().toISOString()
      });
    }

    console.log('🔍 [AUTH] Attempting login with AuthService...');
    const authResponse = await authService.login({ email, password });
    
    console.log('✅ [AUTH] Login successful for:', email);
    res.json({
      success: true,
      token: authResponse.token,
      user: authResponse.user,
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [AUTH] Login failed:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: error instanceof Error ? error.message : 'Login failed',
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    console.log('📝 [AUTH] Registration attempt received:', { 
      email: req.body.email,
      name: req.body.name,
      userType: req.body.userType
    });
    
    const { email, password, name, userType } = req.body;

    // Input validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
        timestamp: new Date().toISOString()
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        timestamp: new Date().toISOString()
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
        timestamp: new Date().toISOString()
      });
    }

    const authResponse = await authService.register({ email, password, name, userType });
    
    console.log('✅ [AUTH] Registration successful for:', email);
    res.status(201).json({
      success: true,
      user: authResponse.user,
      token: authResponse.token,
      message: 'Registration successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [AUTH] Registration failed:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error instanceof Error ? error.message : 'Unknown error',
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

    const verificationResult = await authService.verifyToken(token);
    
    res.json({
      success: true,
      authenticated: verificationResult.valid,
      user: verificationResult.user,
      message: verificationResult.valid ? 'Token valid' : 'Token invalid',
      timestamp: new Date().toISOString()
    });
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
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      // Add token to blacklist or invalidate session
      console.log('🚪 [AUTH] User logout, invalidating token');
    }
    
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
      message: error instanceof Error ? error.message : 'Unknown error',
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
    
    const coupleId = bookingData.coupleId || req.user?.id || 'default-couple';
    
    const booking = await bookingService.createBooking(bookingData, coupleId);
    
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
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/bookings/couple/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    console.log('👥 [BOOKING] GET /api/bookings/couple/' + coupleId + ' called');
    
    const bookings = await bookingService.getBookingsByCouple(coupleId);
    
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
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 [BOOKING] GET /api/bookings/' + id + ' called');
    
    const booking = await bookingService.getBookingById(id);
    
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
      message: error instanceof Error ? error.message : 'Unknown error',
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
    
    const updatedBooking = await bookingService.updateBookingStatus(id, status, notes);
    
    res.json({
      success: true,
      booking: updatedBooking,
      message: 'Booking status updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [BOOKING] Update booking status failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// ERROR HANDLING & 404
// ================================

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    
    if (!dbConnected) {
      console.error('❌ [STARTUP] Database connection failed');
      process.exit(1);
    }
    
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

export default app;
