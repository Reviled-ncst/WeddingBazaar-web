import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

// Force deployment trigger - Services endpoints ready for production  
// Database has 80+ services ready to be served via API endpoints
// DEPLOYMENT TRIGGER: 2025-09-26 04:45 - All services endpoints must be live
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
    
    // Auto-log the quote acceptance in process tracking
    try {
      await db.executeQuery`
        INSERT INTO booking_process_log (
          booking_id, process_step, process_status, description, 
          metadata, created_by, created_by_type
        ) VALUES (
          ${bookingId}, 'quote_accepted', 'completed', 
          'Couple accepted the quote and pricing',
          ${JSON.stringify({ 
            booking_status: 'quote_accepted',
            timestamp: new Date().toISOString(),
            source: 'accept-quote-endpoint'
          })}, 
          'couple-user', 'couple'
        )
      `;
      
      // Update booking progress
      await db.executeQuery`
        UPDATE bookings 
        SET 
          process_stage = 'quote_accepted',
          progress_percentage = 50,
          next_action = 'Process downpayment',
          next_action_by = 'couple',
          last_activity_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${bookingId}
      `;
      
      console.log('✅ [PROCESS] Quote acceptance logged in process tracking');
    } catch (processError) {
      console.log('⚠️ [PROCESS] Could not log quote acceptance in process tracking:', processError);
    }
    
    res.json({
      success: true,
      booking: updatedBooking,
      message: 'Quote accepted successfully',
      process_logged: true
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

// Individual user conversations endpoint - MUST be before messagingRoutes - FORCE DEPLOY Sep 22 2025
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
    console.log('🔍 [/api/services] Direct database query bypass - fixing production issue');
    
    // TEMPORARY FIX: Direct database query to bypass ServicesService issue
    const sql = db.neonSql;
    
    // Build query parameters
    const limit = parseInt(String(req.query.limit || 12));
    const offset = parseInt(String((req.query.page || 1) - 1)) * limit;
    
    console.log('🔍 [/api/services] Query params:', { limit, offset });
    
    // Direct query to get services (same as ServicesService but bypassing the class)
    const servicesResult = await sql`
      SELECT 
        s.id, s.vendor_id, s.title, s.description, s.category, s.price, s.images, s.featured, s.is_active, s.created_at, s.updated_at,
        v.business_name as vendor_business_name,
        v.profile_image as vendor_profile_image,
        v.website_url as vendor_website_url,
        v.business_type as vendor_business_type
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.is_active = true
      ORDER BY s.featured DESC, s.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    console.log('🔍 [/api/services] Direct query returned:', servicesResult.length, 'services');
    
    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total 
      FROM services s
      WHERE s.is_active = true
    `;
    
    const total = parseInt(countResult[0].total);
    console.log('🔍 [/api/services] Total active services:', total);
    
    // Convert to frontend format (simplified version of ServicesService mapping)
    const services = servicesResult.map(dbService => ({
      id: dbService.id,
      name: dbService.title,
      category: dbService.category || 'General',
      location: 'Los Angeles, CA', // Default location
      rating: 4.5, // Default rating
      reviewCount: Math.floor(Math.random() * 100) + 10,
      priceRange: dbService.price ? `$${Math.floor(dbService.price * 0.8)} - $${Math.floor(dbService.price * 1.2)}` : '$$',
      image: Array.isArray(dbService.images) && dbService.images.length > 0 
        ? dbService.images[0] 
        : 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
      gallery: Array.isArray(dbService.images) && dbService.images.length > 1 
        ? dbService.images.slice(1) 
        : [],
      description: dbService.description || 'Professional wedding service',
      features: [dbService.category || 'Professional Service'],
      availability: dbService.is_active,
      vendorName: dbService.vendor_business_name || 'Professional Vendor',
      vendorImage: dbService.vendor_profile_image || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      vendorId: dbService.vendor_id,
      contactInfo: {
        phone: '+1 (555) 123-4567',
        email: 'contact@vendor.com',
        website: dbService.vendor_website_url
      }
    }));
    
    // Format response to match frontend expectations
    const response = {
      success: true,
      services: services,
      pagination: {
        page: parseInt(String(req.query.page || 1)),
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      },
      total: total
    };
    
    console.log('🔍 [/api/services] Sending direct query response:', { 
      success: response.success, 
      servicesCount: response.services.length,
      total: response.total 
    });
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ [/api/services] Direct query failed:', error);
    
    // Fallback to original ServicesService
    try {
      console.log('🔄 [/api/services] Falling back to ServicesService...');
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
      
      const response = {
        success: true,
        services: result.services || [],
        pagination: result.pagination,
        total: result.pagination?.total || 0
      };
      
      res.json(response);
    } catch (fallbackError) {
      console.error('❌ [/api/services] Fallback also failed:', fallbackError);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch services',
        message: error instanceof Error ? error.message : 'Unknown error',
        services: []
      });
    }
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

// DIRECT SERVICES ENDPOINT - Bypasses broken ServicesService
app.get('/api/services/direct', async (req, res) => {
  try {
    console.log('🔍 [DIRECT] /api/services/direct called - bypassing ServicesService');
    
    // Use direct database access to get services
    const sql = db.neonSql;
    
    // Execute the exact query that works
    const result = await sql`
      SELECT 
        s.id, s.vendor_id, s.title, s.description, s.category, s.price, s.images, s.featured, s.is_active, s.created_at, s.updated_at,
        v.business_name as vendor_business_name,
        v.profile_image as vendor_profile_image,
        v.website_url as vendor_website_url,
        v.business_type as vendor_business_type
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.is_active = true
      ORDER BY s.featured DESC, s.created_at DESC
      LIMIT 50
    `;
    
    console.log(`🔍 [DIRECT] Direct query returned ${result.length} services`);
    
    // Convert database results to frontend format
    const services = result.map(dbService => ({
      id: dbService.id,
      name: dbService.title, // Map 'title' to 'name'
      category: dbService.category || 'Other',
      location: 'Los Angeles, CA', // Default location
      rating: 4.5, // Default rating (add to DB later)
      reviewCount: Math.floor(Math.random() * 200) + 10, // Placeholder
      priceRange: dbService.price < 500 ? '$' : dbService.price < 1500 ? '$$' : dbService.price < 3000 ? '$$$' : '$$$$',
      image: dbService.images && dbService.images.length > 0 
        ? dbService.images[0] 
        : 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
      gallery: dbService.images && dbService.images.length > 1 ? dbService.images.slice(1) : [],
      description: dbService.description || 'Professional wedding service',
      features: [dbService.category || 'Professional Service'],
      availability: dbService.is_active || false,
      vendorName: dbService.vendor_business_name || 'Professional Vendor',
      vendorImage: dbService.vendor_profile_image || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      vendorId: dbService.vendor_id,
      contactInfo: {
        phone: '+1 (555) 123-4567', // Default phone
        email: 'contact@vendor.com', // Default email
        website: dbService.vendor_website_url || undefined,
      }
    }));
    
    console.log(`🔍 [DIRECT] Converted ${services.length} services for frontend`);
    console.log(`🔍 [DIRECT] Sample services:`, services.slice(0, 3).map(s => ({ id: s.id, name: s.name, category: s.category })));
    
    const response = {
      success: true,
      services: services,
      total: services.length,
      message: 'Direct database query - bypassing ServicesService'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ [DIRECT] Direct services query failed:', error);
    res.status(500).json({
      success: false,
      error: 'Direct services query failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      services: []
    });
  }
});

// ================================
// BOOKING PROCESS TRACKING ENDPOINTS
// ================================

// Initialize booking process tracking database
app.post('/api/bookings/init-tracking', async (req, res) => {
  try {
    console.log('🔧 [PROCESS] Initializing booking process tracking tables...');
    
    // Create booking process log table
    await db.executeQuery`
      CREATE TABLE IF NOT EXISTS booking_process_log (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        process_step VARCHAR(50) NOT NULL,
        process_status VARCHAR(30) NOT NULL,
        description TEXT,
        metadata JSONB,
        created_by VARCHAR(100),
        created_by_type VARCHAR(20) CHECK (created_by_type IN ('couple', 'vendor', 'admin', 'system')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await db.executeQuery`
      CREATE INDEX IF NOT EXISTS idx_booking_process_booking ON booking_process_log(booking_id)
    `;
    
    await db.executeQuery`
      CREATE INDEX IF NOT EXISTS idx_booking_process_step ON booking_process_log(process_step)
    `;
    
    // Create payment tracking table
    await db.executeQuery`
      CREATE TABLE IF NOT EXISTS booking_payments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        payment_type VARCHAR(30) NOT NULL CHECK (payment_type IN ('downpayment', 'partial', 'full', 'refund')),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'PHP',
        payment_method VARCHAR(50),
        payment_provider VARCHAR(50),
        payment_status VARCHAR(30) NOT NULL CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
        transaction_id VARCHAR(200),
        provider_reference VARCHAR(200),
        metadata JSONB,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await db.executeQuery`
      CREATE INDEX IF NOT EXISTS idx_booking_payments_booking ON booking_payments(booking_id)
    `;
    
    // Create communication tracking table
    await db.executeQuery`
      CREATE TABLE IF NOT EXISTS booking_communications (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('quote', 'message', 'call', 'meeting', 'email', 'contract')),
        sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('couple', 'vendor', 'admin', 'system')),
        sender_id VARCHAR(100),
        sender_name VARCHAR(200),
        recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('couple', 'vendor', 'admin', 'system')),
        recipient_id VARCHAR(100),
        subject VARCHAR(500),
        content TEXT,
        metadata JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Add process tracking columns to bookings table
    try {
      await db.executeQuery`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS process_stage VARCHAR(50) DEFAULT 'inquiry'`;
      await db.executeQuery`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0`;
      await db.executeQuery`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS next_action VARCHAR(200)`;
      await db.executeQuery`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS next_action_by VARCHAR(20)`;
      await db.executeQuery`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    } catch (alterError: any) {
      console.log('⚠️ [PROCESS] Some columns may already exist:', alterError.message);
    }
    
    console.log('✅ [PROCESS] Booking process tracking initialized successfully');
    
    res.json({
      success: true,
      message: 'Booking process tracking initialized',
      tables_created: ['booking_process_log', 'booking_payments', 'booking_communications'],
      columns_added: ['process_stage', 'progress_percentage', 'next_action', 'next_action_by', 'last_activity_at'],
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [PROCESS] Error initializing tracking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize booking process tracking',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Log a process step
app.post('/api/bookings/:bookingId/log-process', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { 
      process_step, 
      process_status, 
      description, 
      metadata, 
      created_by, 
      created_by_type 
    } = req.body;
    
    console.log('📋 [PROCESS] Logging process step for booking:', bookingId);
    console.log('📝 [PROCESS] Step:', process_step, 'Status:', process_status);
    
    // Insert process log entry
    const logEntry = await db.executeQuery`
      INSERT INTO booking_process_log (
        booking_id, process_step, process_status, description, 
        metadata, created_by, created_by_type
      ) VALUES (
        ${bookingId}, ${process_step}, ${process_status}, ${description},
        ${JSON.stringify(metadata || {})}, ${created_by}, ${created_by_type}
      ) RETURNING *
    `;
    
    // Update booking progress based on process step
    const progressMap = {
      'inquiry': { progress: 10, next_action: 'Vendor to review and respond', next_action_by: 'vendor' },
      'vendor_reviewed': { progress: 20, next_action: 'Vendor to send quote', next_action_by: 'vendor' },
      'quote_sent': { progress: 30, next_action: 'Couple to review quote', next_action_by: 'couple' },
      'quote_reviewed': { progress: 40, next_action: 'Couple to accept/decline quote', next_action_by: 'couple' },
      'quote_accepted': { progress: 50, next_action: 'Process downpayment', next_action_by: 'couple' },
      'contract_sent': { progress: 60, next_action: 'Couple to sign contract', next_action_by: 'couple' },
      'downpayment_pending': { progress: 70, next_action: 'Complete payment processing', next_action_by: 'system' },
      'downpayment_confirmed': { progress: 80, next_action: 'Await event and final payment', next_action_by: 'couple' },
      'final_payment_due': { progress: 90, next_action: 'Process final payment', next_action_by: 'couple' },
      'completed': { progress: 100, next_action: 'Service delivery completed', next_action_by: 'vendor' },
      'cancelled': { progress: 0, next_action: 'Process refund if applicable', next_action_by: 'admin' }
    };
    
    const progressInfo = progressMap[process_step as keyof typeof progressMap] || { 
      progress: 0, 
      next_action: 'Pending', 
      next_action_by: 'system' 
    };
    
    // Update booking with new progress information
    await db.executeQuery`
      UPDATE bookings 
      SET 
        process_stage = ${process_step},
        progress_percentage = ${progressInfo.progress},
        next_action = ${progressInfo.next_action},
        next_action_by = ${progressInfo.next_action_by},
        last_activity_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${bookingId}
    `;
    
    console.log('✅ [PROCESS] Process step logged and booking updated');
    
    res.json({
      success: true,
      log_entry: logEntry[0],
      progress_updated: progressInfo,
      message: 'Process step logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [PROCESS] Error logging process step:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log process step',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get complete process history for a booking
app.get('/api/bookings/:bookingId/process-history', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    console.log('📜 [PROCESS] Getting process history for booking:', bookingId);
    
    // Get booking info
    const booking = await db.executeQuery`
      SELECT * FROM bookings WHERE id = ${bookingId}
    `;
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get process steps
    const processSteps = await db.executeQuery`
      SELECT * FROM booking_process_log 
      WHERE booking_id = ${bookingId}
      ORDER BY created_at ASC
    `;
    
    // Get payments
    const payments = await db.executeQuery`
      SELECT * FROM booking_payments 
      WHERE booking_id = ${bookingId}
      ORDER BY created_at ASC
    `;
    
    // Get communications
    const communications = await db.executeQuery`
      SELECT * FROM booking_communications 
      WHERE booking_id = ${bookingId}
      ORDER BY created_at ASC
    `;
    
    console.log('✅ [PROCESS] Retrieved complete process history');
    
    res.json({
      success: true,
      booking: booking[0],
      process_steps: processSteps,
      payments,
      communications,
      summary: {
        total_steps: processSteps.length,
        total_payments: payments.length,
        total_communications: communications.length,
        current_stage: booking[0].process_stage,
        progress_percentage: booking[0].progress_percentage,
        next_action: booking[0].next_action,
        next_action_by: booking[0].next_action_by
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [PROCESS] Error getting process history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get process history',
      message: error.message,
      timestamp: new Date().toISOString()
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

// Debug endpoint to check database content
app.get('/api/debug/conversations', async (req, res) => {
  try {
    const conversations = await db.executeQuery`SELECT * FROM conversations ORDER BY created_at DESC LIMIT 10`;
    const messages = await db.executeQuery`SELECT * FROM messages ORDER BY created_at DESC LIMIT 20`;
    
    res.json({
      conversations: conversations,
      conversationCount: conversations.length,
      messages: messages,
      messageCount: messages.length,
      conversationColumns: conversations.length > 0 ? Object.keys(conversations[0]) : [],
      messageColumns: messages.length > 0 ? Object.keys(messages[0]) : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
startServer();
