import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { db, testDatabaseConnection } from '../backend/database/connection';
import { vendorService } from '../backend/services/vendorService';
import { BookingService } from '../backend/services/bookingService';
import { AuthService } from '../backend/services/authService';
import { MockAuthService } from '../backend/services/mockAuthService';
import { messagingService } from '../backend/services/messagingService';
import { servicesService } from '../backend/services/servicesService';
import { reviewsService } from '../backend/services/reviewsService';
import { userProfileService } from '../backend/services/userProfileService';
import { ImageProxyService } from '../backend/services/imageProxyService';
import { otpService } from '../backend/services/otpService';
import { BookingStatus } from '../src/shared/types/comprehensive-booking.types';
import vendorRoutes from '../backend/api/vendors/routes';
import bookingRoutes from '../backend/api/bookings/routes';
import enhancedBookingRoutes from '../backend/api/bookings/enhanced_routes';
import messagingRoutes from '../backend/api/messaging/routes';
import subscriptionRoutes from '../backend/api/subscriptions/routes';
import paymentRoutes from '../backend/api/payment/routes';
import dssRoutes from '../backend/api/dss/routes';

// Debug imports
console.log('📦 Enhanced booking routes import type:', typeof enhancedBookingRoutes);
console.log('📦 Enhanced booking routes:', enhancedBookingRoutes ? 'Loaded' : 'Failed');

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
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Services
const bookingService = new BookingService();
const authService = new AuthService();

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testDatabaseConnection();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'Connected' : 'Disconnected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Ping endpoint for frontend health checks
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    timestamp: new Date().toISOString() 
  });
});

// API Routes
console.log('🔗 Registering enhanced booking routes at /api/bookings/enhanced');

// ============================================================================
// BOOKING ACTION ENDPOINTS - Must be registered BEFORE general booking routes
// ============================================================================

// Accept quote endpoint
app.post('/api/bookings/:bookingId/accept-quote', async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log('💰 [BookingAction] Accept quote for booking:', bookingId);
    
    const updatedBooking = await bookingService.updateBookingStatus(bookingId, 'quote_accepted');
    
    res.json({
      success: true,
      booking: updatedBooking,
      message: 'Quote accepted successfully'
    });
  } catch (error) {
    console.error('Error accepting quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Decline quote endpoint
app.post('/api/bookings/:bookingId/decline-quote', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    console.log('❌ [BookingAction] Decline quote for booking:', bookingId, 'Reason:', reason);
    
    const updatedBooking = await bookingService.updateBookingStatus(bookingId, 'quote_declined');
    
    res.json({
      success: true,
      booking: updatedBooking,
      message: 'Quote declined successfully'
    });
  } catch (error) {
    console.error('Error declining quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to decline quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Pay deposit endpoint
app.post('/api/bookings/:bookingId/pay-deposit', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { amount, paymentMethod } = req.body;
    console.log('💳 [BookingAction] Pay deposit for booking:', bookingId, 'Amount:', amount);
    
    // Update booking status to downpayment (indicating deposit paid)
    const updatedBooking = await bookingService.updateBookingStatus(bookingId, 'downpayment');
    
    res.json({
      success: true,
      booking: updatedBooking,
      message: 'Deposit payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing deposit payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process deposit payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel booking endpoint
app.post('/api/bookings/:bookingId/cancel', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    console.log('🚫 [BookingAction] Cancel booking:', bookingId, 'Reason:', reason);
    
    const updatedBooking = await bookingService.updateBookingStatus(bookingId, 'cancelled');
    
    res.json({
      success: true,
      booking: updatedBooking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Confirm booking endpoint
app.post('/api/bookings/:bookingId/confirm', async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log('✅ [BookingAction] Confirm booking:', bookingId);
    
    const updatedBooking = await bookingService.updateBookingStatus(bookingId, 'confirmed');
    
    res.json({
      success: true,
      booking: updatedBooking,
      message: 'Booking confirmed successfully'
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm booking',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

console.log('✅ Booking action endpoints registered');

// Individual user conversations endpoint - MUST be before messagingRoutes
app.get('/api/conversations/individual/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 [Server] Getting conversations for individual user:', userId);
    
    const conversations = await db.executeQuery`
      SELECT 
        c.*,
        u.email as participant_email
      FROM conversations c
      LEFT JOIN users u ON c.participant_id = u.id
      WHERE c.creator_id = ${userId}
      ORDER BY c.last_message_time DESC NULLS LAST, c.created_at DESC
    `;

    console.log('✅ [Server] Found individual conversations:', conversations.length);
    
    // Transform the data to match frontend interface  
    const transformedConversations = conversations.map((row) => ({
      id: row.id,
      participants: [{
        id: row.participant_id,
        name: row.participant_name || 'Vendor',
        role: row.participant_type || 'vendor',
        avatar: row.participant_avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
        isOnline: row.is_online || false
      }],
      lastMessage: row.last_message ? {
        id: `last-${row.id}`,
        senderId: row.participant_id,
        senderName: row.participant_name || 'Vendor',
        senderRole: row.participant_type || 'vendor',
        content: row.last_message,
        timestamp: row.last_message_time || row.updated_at,
        type: 'text'
      } : undefined,
      unreadCount: row.unread_count || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      serviceInfo: row.service_id ? {
        id: row.service_id,
        name: row.service_name,
        category: row.service_category,
        price: row.service_price,
        image: row.service_image || 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
        description: row.service_description
      } : undefined
    }));
    
    res.json({ 
      success: true,
      conversations: transformedConversations,
      count: transformedConversations.length,
      source: 'database'
    });
  } catch (error) {
    console.error('Error fetching individual conversations:', error);
    res.status(500).json({ error: 'Failed to fetch individual conversations' });
  }
});

app.use('/api/vendors', vendorRoutes);
app.use('/api/dss', dssRoutes);
app.use('/api/bookings/enhanced', enhancedBookingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/conversations', messagingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Image proxy route for handling CORS issues with external images
app.get('/api/image-proxy', ImageProxyService.proxyImage);

// Placeholder image endpoint
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const w = parseInt(width) || 300;
  const h = parseInt(height) || 200;
  
  // Generate a simple SVG placeholder
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
        ${w} × ${h}
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

console.log('✅ All routes registered');

// Add a direct conversations endpoint for compatibility
app.post('/api/conversations', async (req, res) => {
  try {
    const { vendorName, serviceName } = req.body;
    
    // Generate conversation ID
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // For now, just return a success response
    // In a real app, you'd want to create the conversation in the database
    res.json({
      success: true,
      conversationId,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt received:', { email: req.body.email, hasPassword: !!req.body.password });
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    console.log('🔍 Attempting login with AuthService...');
    const authResponse = await authService.login({ email, password });
    console.log('✅ Login successful for:', email);
    res.json({
      success: true,
      ...authResponse
    });
  } catch (error) {
    console.error('❌ Login error for', req.body.email, ':', error);
    res.status(401).json({
      error: 'Login failed',
      message: error instanceof Error ? error.message : 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role, 
      phone,
      // Vendor-specific fields
      business_name,
      business_type,
      business_description,
      years_in_business,
      website_url,
      location,
      specialties,
      service_areas
    } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        error: 'Email, password, firstName, lastName, and role are required'
      });
    }

    if (!['couple', 'vendor'].includes(role)) {
      return res.status(400).json({
        error: 'Role must be either "couple" or "vendor"'
      });
    }

    // Additional validation for vendors
    if (role === 'vendor') {
      if (!business_name || !business_type || !location) {
        return res.status(400).json({
          error: 'Business name, business type, and location are required for vendors'
        });
      }
    }

    const authResponse = await authService.register({
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      // Pass vendor fields for profile creation
      ...(role === 'vendor' && {
        business_name,
        business_type,
        business_description,
        years_in_business,
        website_url,
        location,
        specialties,
        service_areas
      })
    });

    res.status(201).json(authResponse);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: 'Registration failed',
      message: error instanceof Error ? error.message : 'Registration error'
    });
  }
});

app.get('/api/auth/validate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const user = await authService.validateToken(token);
    
    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({
      error: 'Invalid token',
      message: error instanceof Error ? error.message : 'Token validation failed'
    });
  }
});

// Token verification endpoint (for session persistence)
app.post('/api/auth/verify', async (req, res) => {
  try {
    let token = req.body.token; // Try body first (old format)
    
    // If no token in body, try Authorization header (new format)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(200).json({
        success: false,
        authenticated: false,
        error: 'No token provided'
      });
    }

    const user = await authService.validateToken(token);
    
    res.json({ 
      success: true,
      authenticated: true,
      user 
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(200).json({
      success: false,
      authenticated: false,
      error: 'Invalid token',
      message: error instanceof Error ? error.message : 'Token verification failed'
    });
  }
});

// OTP endpoints for registration verification
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { identifier, type } = req.body;

    if (!identifier || !type) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and type are required'
      });
    }

    if (!['email', 'sms'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "email" or "sms"'
      });
    }

    let result;
    if (type === 'email') {
      result = await otpService.sendEmailOTP(identifier);
    } else {
      result = await otpService.sendSMSOTP(identifier);
    }

    res.json(result);
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { identifier, code, type } = req.body;

    if (!identifier || !code || !type) {
      return res.status(400).json({
        success: false,
        message: 'Identifier, code, and type are required'
      });
    }

    if (!['email', 'sms'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "email" or "sms"'
      });
    }

    const result = otpService.verifyOTP(identifier, code, type);
    res.json(result);
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

app.get('/api/auth/otp-status', async (req, res) => {
  try {
    const { identifier, type } = req.query;

    if (!identifier || !type) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and type are required'
      });
    }

    if (!['email', 'sms'].includes(type as string)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "email" or "sms"'
      });
    }

    const status = otpService.getOTPStatus(identifier as string, type as 'email' | 'sms');
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('OTP status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get OTP status'
    });
  }
});

// User Profile endpoints
app.get('/api/users/profile/:userId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const user = await authService.validateToken(token);
    
    // Ensure user can only access their own profile
    if (user.id !== req.params.userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }
    
    const userProfile = await userProfileService.getUserProfile(req.params.userId);
    
    res.json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.put('/api/users/profile/:userId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const user = await authService.validateToken(token);
    
    // Ensure user can only update their own profile
    if (user.id !== req.params.userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }
    
    const updatedProfile = await userProfileService.updateUserProfile(req.params.userId, req.body);
    
    res.json({
      success: true,
      user: updatedProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Vendor endpoints
app.get('/api/vendors', async (req, res) => {
  try {
    const { business_type, search } = req.query;
    let vendors;

    if (search && typeof search === 'string') {
      vendors = await vendorService.searchVendors(search, {
        business_type: business_type as string
      });
    } else if (business_type && typeof business_type === 'string') {
      vendors = await vendorService.getVendorsByCategory(business_type);
    } else {
      vendors = await vendorService.getAllVendors();
    }

    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      error: 'Failed to fetch vendors',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get vendor categories
app.get('/api/vendors/categories', async (req, res) => {
  try {
    const categories = await vendorService.getVendorCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching vendor categories:', error);
    res.status(500).json({
      error: 'Failed to fetch vendor categories',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get featured vendors
app.get('/api/vendors/featured', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
    const vendors = await vendorService.getFeaturedVendors(limit);
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching featured vendors:', error);
    res.status(500).json({
      error: 'Failed to fetch featured vendors',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/vendors/:id', async (req, res) => {
  try {
    const vendor = await vendorService.getVendorById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      error: 'Failed to fetch vendor',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const vendor = await vendorService.createVendor(req.body);
    res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({
      error: 'Failed to create vendor',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Services endpoints
app.get('/api/services', async (req, res) => {
  try {
    const params = {
      query: req.query.query as string,
      category: req.query.category as string,
      location: req.query.location as string,
      priceRange: req.query.priceRange as string,
      minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
      sortBy: req.query.sortBy as string,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    };

    const result = await servicesService.getServices(params);
    res.json(result);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      error: 'Failed to fetch services',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await servicesService.getServiceById(id);
    
    if (!service) {
      return res.status(404).json({
        error: 'Service not found'
      });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      error: 'Failed to fetch service',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/services/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const services = await servicesService.getServicesByVendor(vendorId);
    res.json(services);
  } catch (error) {
    console.error('Error fetching vendor services:', error);
    res.status(500).json({
      error: 'Failed to fetch vendor services',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/services/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const services = await servicesService.searchServices(query);
    res.json(services);
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({
      error: 'Failed to search services',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// REVIEWS ENDPOINTS
// ============================================================================

app.get('/api/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await reviewsService.getAllReviews(
      parseInt(page as string),
      parseInt(limit as string)
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      error: 'Failed to fetch reviews',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/reviews/service/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const reviews = await reviewsService.getReviewsByServiceId(serviceId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching service reviews:', error);
    res.status(500).json({
      error: 'Failed to fetch service reviews',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/reviews/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const reviews = await reviewsService.getReviewsByVendorId(vendorId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching vendor reviews:', error);
    res.status(500).json({
      error: 'Failed to fetch vendor reviews',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// MESSAGING ENDPOINTS - Now handled by messagingRoutes at /api/conversations
// ============================================================================

// Messaging endpoints are now handled by the messagingRoutes mounted at /api/conversations

// Booking endpoints
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const booking = await bookingService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      error: 'Failed to create booking',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Booking request endpoint (matches frontend expectation)
app.post('/api/bookings/request', async (req, res) => {
  try {
    const bookingRequest = req.body;
    
    // Extract couple ID - in a real app this would come from authentication
    const coupleId = bookingRequest.couple_id || 'couple1'; // Default for testing
    
    console.log('📥 [BookingRequest] Received booking request:', {
      couple_id: coupleId,
      vendor_id: bookingRequest.vendor_id,
      service_type: bookingRequest.service_type,
      event_date: bookingRequest.event_date
    });
    
    const createdBooking = await bookingService.createBooking(bookingRequest, coupleId);
    
    res.status(201).json({
      booking: createdBooking,
      success: true,
      message: 'Booking request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating booking request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get bookings by couple ID
app.get('/api/bookings/couple/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    const queryParams = {
      couple_id: coupleId,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status ? [status as BookingStatus] : undefined,
      sort_field: 'created_at' as const,
      sort_direction: 'desc' as const
    };
    
    console.log('📋 [Server] Fetching couple bookings with params:', queryParams);
    const bookings = await bookingService.getBookingsByCouple(coupleId, queryParams);
    console.log('✅ [Server] Retrieved bookings:', { count: bookings.bookings.length, total: bookings.total });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching couple bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/bookings/request', async (req, res) => {
  try {
    const bookingRequest = req.body;
    
    // Extract couple ID - in a real app this would come from authentication
    const coupleId = bookingRequest.couple_id || 'couple1'; // Default for testing
    
    console.log('📥 [BookingRequest] Received booking request:', {
      couple_id: coupleId,
      vendor_id: bookingRequest.vendor_id,
      service_type: bookingRequest.service_type,
      event_date: bookingRequest.event_date
    });
    
    const createdBooking = await bookingService.createBooking(bookingRequest, coupleId);
    
    res.status(201).json({
      booking: createdBooking,
      success: true,
      message: 'Booking request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating booking request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get bookings by couple ID
app.get('/api/bookings/couple/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    const queryParams = {
      couple_id: coupleId,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status ? [status as BookingStatus] : undefined,
      sort_field: 'created_at' as const,
      sort_direction: 'desc' as const
    };
    
    console.log('📋 [Server] Fetching couple bookings with params:', queryParams);
    const bookings = await bookingService.getBookingsByCouple(coupleId, queryParams);
    console.log('✅ [Server] Retrieved bookings:', { count: bookings.bookings.length, total: bookings.total });
    
    res.json({
      bookings: bookings.bookings,
      total: bookings.total,
      page: bookings.page,
      limit: bookings.limit,
      totalPages: bookings.totalPages,
      success: true
    });
  } catch (error) {
    console.error('Error fetching couple bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// MISSING BOOKING ENDPOINTS - Frontend Compatibility Routes
// ============================================================================

// Legacy endpoint - Frontend expects /bookings/couple/:coupleId (without /api prefix)
app.get('/bookings/couple/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    const queryParams = {
      couple_id: coupleId,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status ? [status as BookingStatus] : undefined,
      sort_field: (sortBy as string) as 'created_at' | 'event_date' | 'status',
      sort_direction: (sortOrder as string) as 'desc' | 'asc'
    };
    
    console.log('📋 [Legacy] Fetching couple bookings with params:', queryParams);
    const bookings = await bookingService.getBookingsByCouple(coupleId, queryParams);
    console.log('✅ [Legacy] Retrieved bookings:', { count: bookings.bookings.length, total: bookings.total });
    
    res.json({
      bookings: bookings.bookings,
      total: bookings.total,
      page: bookings.page,
      limit: bookings.limit,
      totalPages: bookings.totalPages,
      success: true
    });
  } catch (error) {
    console.error('Error fetching couple bookings (legacy):', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get booking statistics for couple (legacy endpoint)
app.get('/bookings/stats/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    
    console.log('📊 [Legacy] Fetching booking stats for couple:', coupleId);
    
    // Query database for booking statistics
    const stats = await db.executeQuery`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(amount_paid), 0) as total_paid
      FROM bookings 
      WHERE couple_id = ${coupleId as string}
    `;
    
    const result = stats[0] || {
      total_bookings: 0,
      approved_count: 0,
      confirmed_count: 0,
      pending_count: 0,
      completed_count: 0,
      total_amount: 0,
      total_paid: 0
    };
    
    const statsResponse = {
      totalBookings: parseInt(result.total_bookings) || 0,
      approvedBookings: parseInt(result.approved_count) || 0,
      confirmedBookings: parseInt(result.confirmed_count) || 0,
      pendingBookings: parseInt(result.pending_count) || 0,
      completedBookings: parseInt(result.completed_count) || 0,
      totalAmount: parseFloat(result.total_amount) || 0,
      totalPaid: parseFloat(result.total_paid) || 0,
      success: true
    };
    
    console.log('✅ [Legacy] Booking stats retrieved:', statsResponse);
    res.json(statsResponse);
  } catch (error) {
    console.error('Error fetching booking stats (legacy):', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
// Public endpoint to get basic user display name (for vendor booking displays)
app.get('/api/users/:userId/display-name', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get basic user info (no authentication required for display names)
    const users = await db.executeQuery`
      SELECT 
        id,
        first_name,
        last_name,
        email
      FROM users 
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];
    
    // Return display name info
    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}`
          : user.email?.split('@')[0] || `User ${user.id}`,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error fetching user display name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user display name',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Catch-all route for unmatched endpoints
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed, but server will start anyway');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Wedding Bazaar API Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🏪 Vendors API: http://localhost:${PORT}/api/vendors`);
      console.log(`📅 Bookings API: http://localhost:${PORT}/api/bookings`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
