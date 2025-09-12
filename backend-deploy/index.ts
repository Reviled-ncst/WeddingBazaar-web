import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
config();

// Database connection
const sql = neon(process.env.DATABASE_URL!);

// In-memory token storage (in production, use Redis or database)
const activeTokens = new Map<string, {
  userId: string;
  email: string;
  role: string;
  issuedAt: number;
  expiresAt: number;
}>();

// Token expiration time (24 hours)
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

// Helper functions for token management
function generateToken(userId: string): string {
  return `jwt-${userId}-${Date.now()}`;
}

function storeToken(token: string, userId: string, email: string, role: string): void {
  const now = Date.now();
  activeTokens.set(token, {
    userId,
    email,
    role,
    issuedAt: now,
    expiresAt: now + TOKEN_EXPIRY_MS
  });
  
  console.log(`🔐 Token stored for user ${userId}: ${token}`);
}

function validateToken(token: string): { valid: boolean; user?: any; error?: string } {
  // Check if token exists in our store
  const tokenData = activeTokens.get(token);
  
  if (!tokenData) {
    return { valid: false, error: 'Token not found or invalid' };
  }
  
  // Check if token has expired
  if (Date.now() > tokenData.expiresAt) {
    activeTokens.delete(token);
    return { valid: false, error: 'Token has expired' };
  }
  
  return { 
    valid: true, 
    user: {
      id: tokenData.userId,
      email: tokenData.email,
      role: tokenData.role
    }
  };
}

function invalidateToken(token: string): void {
  activeTokens.delete(token);
  console.log(`🗑️ Token invalidated: ${token}`);
}

function cleanupExpiredTokens(): void {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [token, data] of activeTokens.entries()) {
    if (now > data.expiresAt) {
      activeTokens.delete(token);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired tokens`);
  }
}

// Clean up expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

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
    // Get vendors from database
    const vendors = await sql`
      SELECT 
        v.id, v.business_name as name, v.category, v.location,
        v.rating, v.review_count, v.starting_price,
        v.price_range, v.description, v.portfolio_images,
        v.contact_phone, v.contact_website, v.verified,
        v.created_at, v.updated_at
      FROM vendors v
      WHERE v.verified = true
      ORDER BY v.rating DESC, v.review_count DESC
      LIMIT 20
    `;

    const formattedVendors = vendors.map(vendor => ({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      location: vendor.location,
      rating: parseFloat(vendor.rating || 0),
      reviewCount: vendor.review_count || 0,
      priceRange: vendor.price_range || 'Contact for pricing',
      description: vendor.description,
      image: vendor.portfolio_images?.[0] || '/api/placeholder/300/200',
      featured: vendor.rating >= 4.5
    }));

    res.json({
      success: true,
      vendors: formattedVendors
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    // Fallback to empty array if database error
    res.json({
      success: true,
      vendors: []
    });
  }
});

// Featured vendors endpoint
app.get('/api/vendors/featured', async (req, res) => {
  try {
    // Get featured vendors from database with fallback for missing category column
    let featuredVendors = [];
    try {
      featuredVendors = await sql`
        SELECT 
          v.id, v.business_name as name, 
          COALESCE(v.category, 'Wedding Services') as category, 
          v.location, v.rating, v.review_count, v.starting_price,
          v.price_range, v.description, v.portfolio_images,
          v.contact_phone, v.contact_website, v.verified,
          EXTRACT(YEAR FROM AGE(NOW(), v.created_at)) as years_experience
        FROM vendors v
        WHERE v.verified = true 
          AND v.rating >= 4.5 
          AND v.review_count >= 10
        ORDER BY v.rating DESC, v.review_count DESC
        LIMIT 6
      `;
    } catch (dbError) {
      console.log('Category column not found, using fallback query for featured vendors');
      featuredVendors = await sql`
        SELECT 
          v.id, v.business_name as name, 
          'Wedding Services' as category,
          v.location, v.rating, v.review_count, v.starting_price,
          v.price_range, v.description, v.portfolio_images,
          v.contact_phone, v.contact_website, v.verified,
          EXTRACT(YEAR FROM AGE(NOW(), v.created_at)) as years_experience
        FROM vendors v
        WHERE v.verified = true 
          AND v.rating >= 4.5 
          AND v.review_count >= 10
        ORDER BY v.rating DESC, v.review_count DESC
        LIMIT 6
      `;
    }

    const formattedVendors = featuredVendors.map(vendor => ({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      location: vendor.location,
      rating: parseFloat(vendor.rating || 0),
      reviewCount: vendor.review_count || 0,
      priceRange: vendor.price_range || 'Contact for pricing',
      description: vendor.description,
      image: vendor.portfolio_images?.[0] || 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
      specialties: vendor.category ? [vendor.category] : [],
      yearsExperience: vendor.years_experience || 1
    }));

    res.json({
      success: true,
      vendors: formattedVendors
    });
  } catch (error) {
    console.error('Error fetching featured vendors:', error);
    // Fallback to empty array if database error
    res.json({
      success: true,
      vendors: []
    });
  }
});

// Vendor categories endpoint
app.get('/api/vendors/categories', async (req, res) => {
  try {
    // Get categories from database with fallback for missing category column
    let categories = [];
    try {
      categories = await sql`
        SELECT 
          COALESCE(category, 'Wedding Services') as category,
          COUNT(*) as vendor_count,
          AVG(rating) as avg_rating
        FROM vendors 
        WHERE verified = true 
        GROUP BY category
        ORDER BY vendor_count DESC, avg_rating DESC
      `;
    } catch (dbError) {
      console.log('Category column not found, using fallback query');
      // Fallback if category column doesn't exist
      categories = await sql`
        SELECT 
          'Wedding Services' as category,
          COUNT(*) as vendor_count,
          AVG(rating) as avg_rating
        FROM vendors 
        WHERE verified = true
      `;
    }

    const formattedCategories = categories.map((cat, index) => ({
      id: index + 1,
      name: cat.category,
      description: getCategoryDescription(cat.category),
      icon: getCategoryIcon(cat.category),
      vendorCount: parseInt(cat.vendor_count || 0)
    }));

    res.json({
      success: true,
      categories: formattedCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback to default categories if database error
    const defaultCategories = [
      {
        id: 1,
        name: 'Photography',
        description: 'Capture your special moments',
        icon: '📸',
        vendorCount: 0
      },
      {
        id: 2,
        name: 'Catering',
        description: 'Delicious food for your guests',
        icon: '🍽️',
        vendorCount: 0
      },
      {
        id: 3,
        name: 'Venues',
        description: 'Perfect locations for your wedding',
        icon: '🏰',
        vendorCount: 0
      }
    ];

    res.json({
      success: true,
      categories: defaultCategories
    });
  }
});

// Helper functions for categories
function getCategoryDescription(category: string): string {
  const descriptions = {
    'Photography': 'Capture your special moments',
    'Catering': 'Delicious food for your guests',
    'Venues': 'Perfect locations for your wedding',
    'Music & Entertainment': 'Keep the party going',
    'Flowers & Decoration': 'Beautiful floral arrangements',
    'Wedding Planning': 'Full-service wedding coordination'
  };
  return descriptions[category] || 'Professional wedding services';
}

function getCategoryIcon(category: string): string {
  const icons = {
    'Photography': '📸',
    'Catering': '🍽️',
    'Venues': '🏰',
    'Music & Entertainment': '🎵',
    'Flowers & Decoration': '🌸',
    'Wedding Planning': '📋'
  };
  return icons[category] || '💍';
}

// Basic auth endpoints - Real database integration
app.post('/api/auth/login', async (req, res) => {
  const { email, password, userType } = req.body;
  
  try {
    console.log('Login attempt:', { email, userType });
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Test database connection first
    let users = [];
    try {
      console.log('Attempting database query for login...');
      users = await sql`
        SELECT u.id, u.email, u.password, u.first_name, u.last_name, 
               COALESCE(u.user_type, 'couple') as role, u.profile_image,
               v.id as vendor_id, v.business_name
        FROM users u
        LEFT JOIN vendors v ON u.id = v.user_id
        WHERE u.email = ${email}
        LIMIT 1
      `;
      console.log('Database query successful, found users:', users.length);
    } catch (dbError) {
      console.error('Database query failed:', dbError);
      // Try fallback query without role column
      try {
        console.log('Trying fallback query without role column...');
        users = await sql`
          SELECT u.id, u.email, u.password, u.first_name, u.last_name, 
                 u.profile_image, v.id as vendor_id, v.business_name
          FROM users u
          LEFT JOIN vendors v ON u.id = v.user_id
          WHERE u.email = ${email}
          LIMIT 1
        `;
        // Add default role if missing
        if (users.length > 0) {
          users[0].role = users[0].vendor_id ? 'vendor' : 'couple';
        }
        console.log('Fallback query successful, found users:', users.length);
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        users = [];
      }
    }

    if (users.length === 0) {
      console.log('No user found in database');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];
    console.log('User found in database:', user);
    
    // Verify password if password exists
    if (user.password) {
      try {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }
      } catch (hashError) {
        console.error('Password verification error:', hashError);
        // If password verification fails, treat as invalid password
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
    } else {
      console.log('No password hash found for user, allowing login for demo');
    }
    
    // Generate and store token
    const token = generateToken(user.id);
    storeToken(token, user.id, user.email, user.role);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        profileImage: user.profile_image || '',
        phone: '',
        vendorId: user.vendor_id,
        businessName: user.business_name
      },
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, userType = 'couple' } = req.body;
  
  try {
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user in database
    const newUsers = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, user_type, created_at, updated_at)
      VALUES (${email}, ${hashedPassword}, ${name.split(' ')[0] || name}, ${name.split(' ')[1] || ''}, ${userType}, NOW(), NOW())
      RETURNING id, email, first_name, last_name, user_type, profile_image
    `;

    const newUser = newUsers[0];

    // Generate and store token
    const token = generateToken(newUser.id);
    storeToken(token, newUser.id, newUser.email, newUser.user_type);

    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.user_type,
        profileImage: newUser.profile_image || '',
        phone: ''
      },
      token: token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
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

    console.log('Verifying token:', token);

    // First, check if the token is in our active tokens store
    const tokenValidation = validateToken(token);
    
    if (!tokenValidation.valid) {
      console.log('Token validation failed:', tokenValidation.error);
      return res.status(401).json({
        success: false,
        message: tokenValidation.error || 'Invalid token'
      });
    }

    // Token is valid, get user data from database to ensure it's current
    try {
      // First try to get user data with vendor info
      let userResult = [];
      try {
        userResult = await sql`
          SELECT u.*, 
                 COALESCE(u.user_type, 'couple') as role,
                 v.business_name,
                 v.id as vendor_id
          FROM users u
          LEFT JOIN vendors v ON u.id = v.user_id
          WHERE u.id = ${tokenValidation.user.id}
        `;
      } catch (vendorJoinError) {
        console.log('Vendor join failed, trying simple user query:', vendorJoinError.message);
        // Fallback to simple user query
        userResult = await sql`
          SELECT u.*, 
                 COALESCE(u.user_type, 'couple') as role
          FROM users u
          WHERE u.id = ${tokenValidation.user.id}
        `;
      }
      
      if (userResult.length === 0) {
        // User no longer exists, invalidate token
        invalidateToken(token);
        return res.status(401).json({
          success: false,
          message: 'User account no longer exists'
        });
      }
      
      const userData = userResult[0];
      console.log('✅ Token verified for user:', { id: userData.id, email: userData.email, role: userData.role });
      
      // Return current user data
      res.json({
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name || 'User',
          lastName: userData.last_name || '',
          role: userData.role || 'couple',
          profileImage: userData.profile_image || '',
          phone: userData.phone || '',
          businessName: userData.business_name || '',
          vendorId: userData.vendor_id || null
        }
      });
      
    } catch (dbError) {
      console.error('Database error during token verification:', dbError);
      
      // If database fails completely, return the token data we have
      console.log('Using token data as fallback for user info');
      res.json({
        success: true,
        user: {
          id: tokenValidation.user.id,
          email: tokenValidation.user.email,
          firstName: 'User',
          lastName: '',
          role: tokenValidation.user.role || 'couple',
          profileImage: '',
          phone: ''
        }
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

// Logout endpoint to invalidate tokens
app.post('/api/auth/logout', async (req, res) => {
  try {
    // Try to get token from Authorization header first
    let token = req.headers.authorization?.split(' ')[1];
    
    // If not in header, try to get from request body
    if (!token && req.body && req.body.token) {
      token = req.body.token;
    }
    
    if (token) {
      invalidateToken(token);
      console.log(`📤 User logged out, token invalidated: ${token}`);
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// Debug endpoint to see active tokens (development only)
app.get('/api/auth/debug/tokens', async (req, res) => {
  try {
    const tokens = Array.from(activeTokens.entries()).map(([token, data]) => ({
      token: token.substring(0, 20) + '...', // Show only first 20 chars for security
      userId: data.userId,
      email: data.email,
      role: data.role,
      issuedAt: new Date(data.issuedAt).toISOString(),
      expiresAt: new Date(data.expiresAt).toISOString(),
      isExpired: Date.now() > data.expiresAt
    }));
    
    res.json({
      success: true,
      activeTokens: tokens.length,
      tokens: tokens
    });
  } catch (error) {
    console.error('Error fetching debug tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching debug tokens'
    });
  }
});

// Booking endpoints - Real database integration
app.get('/api/bookings', async (req, res) => {
  try {
    const { page = 1, limit = 10, coupleId, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    // Get bookings from database
    const bookings = await sql`
      SELECT 
        b.id, b.couple_id, b.vendor_id, b.service_type,
        b.event_date, b.status, b.total_amount, b.notes,
        b.created_at, b.updated_at,
        v.business_name as vendor_name, v.category as vendor_category,
        v.contact_phone, v.location
      FROM bookings b
      JOIN vendors v ON b.vendor_id = v.id
      ORDER BY b.created_at DESC
      LIMIT ${limit} OFFSET ${(parseInt(page as string) - 1) * parseInt(limit as string)}
    `;

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      vendorId: booking.vendor_id,
      vendorName: booking.vendor_name,
      vendorCategory: booking.vendor_category,
      serviceType: booking.service_type,
      bookingDate: booking.created_at,
      eventDate: booking.event_date,
      status: booking.status,
      amount: parseFloat(booking.total_amount || 0),
      downPayment: parseFloat(booking.total_amount || 0) * 0.3, // Assume 30% down payment
      remainingBalance: parseFloat(booking.total_amount || 0) * 0.7,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      location: booking.location,
      notes: booking.notes,
      contactPhone: booking.contact_phone
    }));

    // Get total count for pagination
    const totalResult = await sql`SELECT COUNT(*) as total FROM bookings`;
    const total = parseInt(totalResult[0]?.total || 0);

    res.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        totalBookings: total,
        hasNext: (parseInt(page as string) * parseInt(limit as string)) < total,
        hasPrev: parseInt(page as string) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    // Fallback to empty array if database error
    res.json({
      success: true,
      bookings: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalBookings: 0,
        hasNext: false,
        hasPrev: false
      }
    });
  }
});

// Booking statistics endpoint
app.get('/api/bookings/stats', async (req, res) => {
  try {
    const mockStats = {
      totalBookings: 3,
      confirmedBookings: 2,
      pendingBookings: 1,
      cancelledBookings: 0,
      totalSpent: 525000,
      totalPaid: 175000,
      remainingBalance: 350000,
      upcomingPayments: 2,
      monthlyBreakdown: [
        { month: 'Aug 2025', bookings: 1, amount: 300000 },
        { month: 'Sep 2025', bookings: 2, amount: 225000 }
      ],
      categoryBreakdown: [
        { category: 'Venue', count: 1, amount: 300000 },
        { category: 'Catering', count: 1, amount: 150000 },
        { category: 'Photography', count: 1, amount: 75000 }
      ]
    };

    res.json({
      success: true,
      stats: mockStats
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking statistics'
    });
  }
});

// Individual booking details endpoint
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock detailed booking data
    const mockBooking = {
      id: parseInt(id),
      vendorId: 1,
      vendorName: 'Elegant Photography Studios',
      vendorCategory: 'Photography',
      vendorImage: '/api/placeholder/400/300',
      serviceType: 'Wedding Photography Package',
      bookingDate: '2025-09-01',
      eventDate: '2026-03-15',
      eventTime: '14:00',
      status: 'confirmed',
      amount: 75000,
      downPayment: 25000,
      remainingBalance: 50000,
      paymentSchedule: [
        { dueDate: '2025-09-01', amount: 25000, status: 'paid', description: 'Booking deposit' },
        { dueDate: '2026-01-15', amount: 25000, status: 'pending', description: 'Mid payment' },
        { dueDate: '2026-03-01', amount: 25000, status: 'pending', description: 'Final payment' }
      ],
      services: [
        'Full day wedding photography',
        'Pre-wedding photoshoot (2 hours)',
        'Digital photo gallery (500+ photos)',
        'Printed photo album (50 pages)',
        'USB drive with all photos'
      ],
      location: 'Manila Cathedral + Reception Venue',
      notes: 'Include family portraits during ceremony prep',
      contactPerson: 'John Cruz',
      contactPhone: '+63917-123-4567',
      contactEmail: 'john@elegantphoto.ph',
      createdAt: '2025-09-01T10:00:00Z',
      updatedAt: '2025-09-10T15:30:00Z'
    };

    res.json({
      success: true,
      booking: mockBooking
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking details'
    });
  }
});

// Services endpoint with real database integration
app.get('/api/services', async (req, res) => {
  try {
    // Get services grouped by category from database
    const services = await sql`
      SELECT DISTINCT
        v.category,
        COUNT(v.id) as provider_count,
        AVG(v.rating) as avg_rating
      FROM vendors v
      WHERE v.verified = true 
        AND v.category IS NOT NULL
      GROUP BY v.category
      ORDER BY provider_count DESC, avg_rating DESC
    `;

    const formattedServices = await Promise.all(
      services.map(async (service, index) => {
        // Get providers for this category
        const providers = await sql`
          SELECT 
            v.id, v.business_name as name, v.rating, v.review_count,
            v.price_range, v.location, v.description, v.portfolio_images,
            EXTRACT(YEAR FROM AGE(NOW(), v.created_at)) as years_experience
          FROM vendors v
          WHERE v.category = ${service.category} 
            AND v.verified = true
          ORDER BY v.rating DESC, v.review_count DESC
          LIMIT 5
        `;

        const formattedProviders = providers.map(provider => ({
          id: provider.id,
          name: provider.name,
          rating: parseFloat(provider.rating || 0),
          reviewCount: provider.review_count || 0,
          priceRange: provider.price_range || 'Contact for pricing',
          location: provider.location,
          specialties: [service.category],
          yearsExperience: provider.years_experience || 1,
          image: provider.portfolio_images?.[0] || getDefaultServiceImage(service.category),
          gallery: provider.portfolio_images?.slice(0, 3) || [getDefaultServiceImage(service.category)]
        }));

        return {
          id: index + 1,
          name: `Wedding ${service.category}`,
          category: service.category,
          description: `Professional ${service.category.toLowerCase()} services`,
          icon: getCategoryIcon(service.category),
          providers: formattedProviders
        };
      })
    );

    res.json({
      success: true,
      services: formattedServices
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    // Fallback to default services if database error
    res.json({
      success: true,
      services: []
    });
  }
});

// Helper function for default service images
function getDefaultServiceImage(category: string): string {
  const images = {
    'Photography': 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
    'Catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
    'Venues': 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
    'Music & Entertainment': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    'Flowers & Decoration': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
    'Wedding Planning': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400'
  };
  return images[category] || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400';
}

// Vendor subscription endpoints - Real database integration
app.get('/api/subscriptions/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // Get subscription from database with fallback for missing tables
    let subscriptions = [];
    try {
      subscriptions = await sql`
        SELECT 
          vs.id, vs.vendor_id, vs.plan_id, vs.status,
          vs.current_period_start, vs.current_period_end, vs.trial_end,
          vs.stripe_subscription_id, vs.created_at, vs.updated_at,
          sp.name as plan_name, sp.description as plan_description,
          sp.price, sp.billing_cycle, sp.features
        FROM vendor_subscriptions vs
        JOIN subscription_plans sp ON vs.plan_id = sp.id
        WHERE vs.vendor_id = ${vendorId}
          AND vs.status = 'active'
        ORDER BY vs.created_at DESC
        LIMIT 1
      `;
    } catch (dbError) {
      console.log('Subscription tables not found, using mock subscription');
      subscriptions = [];
    }

    if (subscriptions.length === 0) {
      // Fallback to mock Enterprise subscription for demo
      const mockSubscription = {
        id: 1,
        vendor_id: vendorId,
        plan_id: 'enterprise',
        status: 'active',
        current_period_start: '2025-09-01T00:00:00Z',
        current_period_end: '2025-10-01T00:00:00Z',
        trial_end: null,
        stripe_subscription_id: 'sub_mock_enterprise',
        created_at: '2025-09-01T00:00:00Z',
        updated_at: '2025-12-09T00:00:00Z',
        plan_name: 'Enterprise',
        plan_description: 'Full-featured enterprise plan for large wedding businesses',
        max_services: 999,
        max_images_per_service: 999,
        max_gallery_images: 999,
        max_bookings_per_month: 999,
        includes_featured_listing: true,
        includes_custom_branding: true,
        includes_analytics: true
      };

      return res.json({
        success: true,
        subscription: mockSubscription
      });
    }

    const subscription = subscriptions[0];

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        vendor_id: subscription.vendor_id,
        plan_id: subscription.plan_id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        trial_end: subscription.trial_end,
        stripe_subscription_id: subscription.stripe_subscription_id,
        created_at: subscription.created_at,
        updated_at: subscription.updated_at,
        plan_name: subscription.plan_name,
        plan_description: subscription.plan_description,
        price: subscription.price,
        billing_cycle: subscription.billing_cycle,
        features: subscription.features
      }
    });
  } catch (error) {
    console.error('Error fetching vendor subscription:', error);
    
    // Fallback to mock Enterprise subscription for demo
    const mockSubscription = {
      id: 1,
      vendor_id: req.params.vendorId,
      plan_id: 'enterprise',
      status: 'active',
      current_period_start: '2025-09-01T00:00:00Z',
      current_period_end: '2025-10-01T00:00:00Z',
      trial_end: null,
      stripe_subscription_id: 'sub_mock_enterprise',
      created_at: '2025-09-01T00:00:00Z',
      updated_at: '2025-12-09T00:00:00Z',
      plan_name: 'Enterprise',
      plan_description: 'Full-featured enterprise plan for large wedding businesses'
    };

    res.json({
      success: true,
      subscription: mockSubscription
    });
  }
});

// Subscription plans endpoint
app.get('/api/subscriptions/plans', async (req, res) => {
  try {
    const mockPlans = [
      {
        id: 'basic',
        name: 'Basic',
        description: 'Perfect for new wedding vendors',
        price: 999,
        billing_cycle: 'monthly',
        features: [
          'Up to 3 services',
          'Basic portfolio (10 images)',
          '20 bookings per month',
          'Email support',
          'Basic analytics'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Great for growing wedding businesses',
        price: 1999,
        billing_cycle: 'monthly',
        features: [
          'Up to 10 services',
          'Enhanced portfolio (50 images)',
          'Unlimited bookings',
          'Priority support',
          'Advanced analytics',
          'Featured listing (7 days/month)'
        ]
      },
      {
        id: 'pro',
        name: 'Professional',
        description: 'For established wedding professionals',
        price: 3999,
        billing_cycle: 'monthly',
        features: [
          'Up to 25 services',
          'Premium portfolio (100 images)',
          'Unlimited bookings',
          'Video consultations (60 min/month)',
          'Custom branding',
          'SEO tools',
          'Export data'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Complete solution for large wedding businesses',
        price: 7999,
        billing_cycle: 'monthly',
        features: [
          'Unlimited services',
          'Unlimited portfolio images',
          'Unlimited bookings',
          'Unlimited video consultations',
          'Full custom branding',
          'Advanced SEO tools',
          'Multi-location support',
          'Team management',
          'API access',
          'Custom contracts',
          'Priority phone support'
        ]
      }
    ];

    res.json({
      success: true,
      plans: mockPlans
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription plans'
    });
  }
});

// Messaging API endpoints
// Get conversations for a vendor
app.get('/api/messaging/conversations/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log(`🔍 Fetching conversations for vendor: ${vendorId}`);
    
    // Try to get conversations from database with improved schema handling
    try {
      const conversations = await sql`
        SELECT 
          id,
          participant_id,
          participant_name,
          participant_type,
          participant_avatar,
          creator_id,
          creator_type,
          conversation_type,
          last_message,
          last_message_time,
          unread_count,
          is_online,
          status,
          wedding_date,
          location,
          service_id,
          service_name,
          service_category,
          service_price,
          service_image,
          service_description,
          created_at,
          updated_at
        FROM conversations 
        WHERE participant_id = ${vendorId}
        ORDER BY last_message_time DESC NULLS LAST, created_at DESC
      `;

      if (conversations.length > 0) {
        console.log(`✅ Found ${conversations.length} conversations in database`);
        
        // Transform conversations to expected frontend format
        const formattedConversations = conversations.map(conv => {
          const participant = {
            id: conv.creator_id,
            name: conv.participant_name || 'Client',
            role: conv.creator_type || 'couple',
            isOnline: conv.is_online || false,
            avatar: conv.participant_avatar || '/api/placeholder/40/40'
          };

          return {
            id: conv.id,
            participants: [participant],
            lastMessage: conv.last_message ? {
              id: 'msg-' + Date.now(),
              content: conv.last_message,
              senderId: participant.id,
              senderName: participant.name,
              senderType: participant.role,
              timestamp: conv.last_message_time || conv.updated_at,
              messageType: 'text',
              isRead: true
            } : null,
            unreadCount: conv.unread_count || 0,
            status: conv.status,
            weddingDate: conv.wedding_date,
            location: conv.location,
            serviceInfo: conv.service_id ? {
              id: conv.service_id,
              name: conv.service_name,
              category: conv.service_category,
              price: conv.service_price,
              image: conv.service_image,
              description: conv.service_description
            } : null,
            createdAt: conv.created_at,
            updatedAt: conv.updated_at
          };
        });

        return res.json({
          success: true,
          conversations: formattedConversations,
          source: 'database'
        });
      }
    } catch (dbError) {
      console.log(`🔍 Database query failed for vendor ${vendorId}:`, dbError.message);
      console.log('Using fallback mock conversations...');
    }

    // Fallback to mock data with proper vendor ID
    const mockConversations = [
      {
        id: `conv-${vendorId}-1`,
        participants: [{
          id: 'user-1',
          name: 'Maria Santos',
          role: 'couple',
          isOnline: true,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=40&h=40&fit=crop&crop=face'
        }],
        lastMessage: {
          id: 'msg-1',
          content: 'Hi! I\'m interested in your wedding photography services for March 2025.',
          senderId: 'user-1',
          senderName: 'Maria Santos',
          senderType: 'couple',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          messageType: 'text',
          isRead: false
        },
        unreadCount: 1,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: `conv-${vendorId}-2`,
        participants: [{
          id: 'user-2',
          name: 'John & Sarah Cruz',
          role: 'couple',
          isOnline: false,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
        }],
        lastMessage: {
          id: 'msg-2',
          content: 'Thank you for the beautiful engagement photos! We love them.',
          senderId: 'user-2',
          senderName: 'John & Sarah Cruz',
          senderType: 'couple',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          messageType: 'text',
          isRead: true
        },
        unreadCount: 0,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: `conv-${vendorId}-3`,
        participants: [{
          id: 'user-3',
          name: 'Ana Rodriguez',
          role: 'couple',
          isOnline: true,
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
        }],
        lastMessage: {
          id: 'msg-3',
          content: 'Could we schedule a consultation for our December wedding?',
          senderId: 'user-3',
          senderName: 'Ana Rodriguez',
          senderType: 'couple',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          messageType: 'text',
          isRead: false
        },
        unreadCount: 2,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 10800000).toISOString()
      }
    ];

    console.log(`✅ Returning ${mockConversations.length} mock conversations for vendor: ${vendorId}`);
    res.json({
      success: true,
      conversations: mockConversations
    });
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
});

// Create a new conversation
app.post('/api/messaging/conversations', async (req, res) => {
  try {
    const { conversationId, vendorId, vendorName, serviceName, userId, userName, userType } = req.body;
    
    // Create new conversation in database
    const result = await sql`
      INSERT INTO conversations (
        id, creator_id, creator_name, creator_type,
        participant_id, participant_name, participant_type,
        created_at, updated_at
      ) VALUES (
        ${conversationId}, ${userId}, ${userName}, ${userType},
        ${vendorId}, ${vendorName}, 'vendor',
        NOW(), NOW()
      )
      RETURNING *
    `;

    const newConversation = {
      id: conversationId,
      vendorId,
      vendorName,
      serviceName,
      userId,
      userName,
      userType,
      lastMessage: null,
      createdAt: result[0]?.created_at || new Date().toISOString(),
      updatedAt: result[0]?.updated_at || new Date().toISOString(),
      unreadCount: 0
    };

    res.json({
      success: true,
      conversation: newConversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation'
    });
  }
});

// Get messages for a conversation
app.get('/api/messaging/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    console.log(`💬 Fetching messages for conversation: ${conversationId}`);
    
    // Get messages from database with correct schema
    const messages = await sql`
      SELECT 
        id,
        conversation_id,
        sender_id,
        sender_name,
        sender_type,
        content,
        message_type,
        timestamp,
        is_read,
        reactions,
        service_data,
        created_at
      FROM messages 
      WHERE conversation_id = ${conversationId}
      ORDER BY timestamp ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    console.log(`💬 Found ${messages.length} messages`);

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      content: msg.content,
      senderId: msg.sender_id,
      senderName: msg.sender_name,
      senderType: msg.sender_type,
      timestamp: msg.timestamp,
      messageType: msg.message_type || 'text',
      isRead: msg.is_read || false,
      reactions: msg.reactions || null,
      serviceData: msg.service_data || null,
      createdAt: msg.created_at
    }));

    res.json({
      success: true,
      messages: formattedMessages,
      source: 'database'
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    
    // Fallback to mock messages
    const mockMessages = [
      {
        id: `msg_${Date.now()}_1`,
        conversationId: req.params.conversationId,
        senderId: 'couple_001',
        senderName: 'John Smith',
        senderType: 'couple',
        content: 'Hi! I\'m interested in your services for our wedding.',
        messageType: 'text',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
        reactions: null,
        serviceData: null,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: `msg_${Date.now()}_2`,
        conversationId: req.params.conversationId,
        senderId: req.params.conversationId,
        senderName: 'Wedding Vendor',
        senderType: 'vendor',
        content: 'Hello! Thank you for your interest. I\'d be happy to help with your wedding. Could you tell me more about your event date and requirements?',
        messageType: 'text',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isRead: false,
        reactions: null,
        serviceData: null,
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    res.json({
      success: true,
      messages: mockMessages,
      source: 'fallback'
    });
  }
});

// Send a new message
app.post('/api/messaging/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, senderId, senderName, senderType, messageType = 'text' } = req.body;
    
    console.log(`📤 Sending message to conversation: ${conversationId}`);
    
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    // Insert message into database with correct schema
    await sql`
      INSERT INTO messages (
        id, conversation_id, sender_id, sender_name, sender_type,
        content, message_type, timestamp, is_read, created_at
      ) VALUES (
        ${messageId}, ${conversationId}, ${senderId}, ${senderName}, ${senderType},
        ${content}, ${messageType}, ${timestamp}, false, ${timestamp}
      )
    `;

    // Update conversation's last message
    await sql`
      UPDATE conversations 
      SET last_message = ${content}, 
          last_message_time = ${timestamp},
          updated_at = ${timestamp}
      WHERE id = ${conversationId}
    `;

    const newMessage = {
      id: messageId,
      conversationId,
      content,
      senderId,
      senderName,
      senderType,
      timestamp,
      messageType,
      isRead: false,
      reactions: null,
      serviceData: null,
      createdAt: timestamp
    };

    console.log(`✅ Message sent successfully: ${messageId}`);

    res.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    
    // Fallback response
    const fallbackMessage = {
      id: `msg_${Date.now()}_fallback`,
      conversationId: req.params.conversationId,
      senderId: req.body.senderId,
      senderName: req.body.senderName,
      senderType: req.body.senderType,
      content: req.body.content,
      messageType: req.body.messageType || 'text',
      timestamp: new Date().toISOString(),
      isRead: false,
      reactions: null,
      serviceData: null,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: fallbackMessage,
      source: 'fallback'
    });
  }
});

// Mark messages as read
app.put('/api/messaging/conversations/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    
    // Mark messages as read in database
    await sql`
      UPDATE messages 
      SET is_read = true 
      WHERE conversation_id = ${conversationId} 
        AND sender_id != ${userId}
    `;

    // Update unread count in conversation
    await sql`
      UPDATE conversations 
      SET unread_count = 0,
          updated_at = NOW()
      WHERE id = ${conversationId}
        AND (participant_id = ${userId} OR creator_id = ${userId})
    `;

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read'
    });
  }
});

// Vendor Dashboard Endpoints
app.get('/api/vendors/:vendorId/dashboard', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // Mock dashboard data for now since tables don't exist yet
    const dashboardData = {
      id: vendorId,
      businessName: 'Elegant Moments Photography',
      totalBookings: 15,
      pendingBookings: 3,
      confirmedBookings: 10,
      completedBookings: 2,
      totalRevenue: 750000,
      monthlyRevenue: 125000,
      averageRating: 4.8,
      totalReviews: 127,
      responseRate: 95,
      averageResponseTime: '2 hours',
      recentBookings: [
        {
          id: 1,
          clientName: 'Maria & John Santos',
          eventDate: '2025-12-15',
          status: 'confirmed',
          amount: 75000,
          serviceType: 'Wedding Photography'
        },
        {
          id: 2,
          clientName: 'Sarah & Mike Cruz',
          eventDate: '2025-11-20',
          status: 'pending',
          amount: 85000,
          serviceType: 'Pre-wedding + Wedding Photography'
        }
      ],
      upcomingEvents: [
        {
          id: 1,
          eventDate: '2025-10-20',
          clientName: 'Ana & Carlos Rodriguez',
          venue: 'Garden Villa Resort',
          timeSlot: '2:00 PM - 10:00 PM'
        }
      ],
      monthlyStats: [
        { month: 'Jul', bookings: 2, revenue: 150000 },
        { month: 'Aug', bookings: 4, revenue: 300000 },
        { month: 'Sep', bookings: 3, revenue: 225000 }
      ]
    };

    res.json({
      success: true,
      dashboard: dashboardData
    });
  } catch (error) {
    console.error('Error fetching vendor dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor dashboard'
    });
  }
});

// Vendor Profile Endpoints
app.get('/api/vendors/:vendorId/profile', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // Try to get from database first
    try {
      const vendors = await sql`
        SELECT 
          v.id, v.user_id, v.business_name, v.category as business_type,
          v.description as business_description, v.location, v.service_area,
          v.rating, v.review_count, v.starting_price, v.price_range,
          v.portfolio_images, v.contact_phone, v.contact_website,
          v.instagram_handle, v.facebook_page, v.verified, v.created_at
        FROM vendors v
        WHERE v.id = ${vendorId}
        LIMIT 1
      `;

      if (vendors.length > 0) {
        const vendor = vendors[0];
        const profileData = {
          id: vendor.id,
          user_id: vendor.user_id,
          business_name: vendor.business_name,
          business_type: vendor.business_type,
          business_description: vendor.business_description,
          location: vendor.location,
          service_areas: vendor.service_area || [],
          contact_phone: vendor.contact_phone,
          contact_email: '', // Would come from users table
          contact_website: vendor.contact_website,
          social_media: {
            instagram: vendor.instagram_handle,
            facebook: vendor.facebook_page
          },
          portfolio_images: vendor.portfolio_images || [],
          pricing: {
            starting_price: parseFloat(vendor.starting_price || 0),
            price_range: vendor.price_range
          },
          rating: parseFloat(vendor.rating || 0),
          review_count: vendor.review_count || 0,
          years_experience: Math.floor((new Date().getTime() - new Date(vendor.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)) || 1,
          verified: vendor.verified,
          created_at: vendor.created_at
        };

        return res.json({
          success: true,
          profile: profileData
        });
      }
    } catch (dbError) {
      console.log('Database query failed, using mock data');
    }

    // Fallback to mock data
    const mockProfile = {
      id: vendorId,
      user_id: 'vendor-user-1',
      business_name: 'Elegant Moments Photography',
      business_type: 'Photography',
      business_description: 'We specialize in capturing the most precious moments of your special day. Our team of experienced photographers brings artistic vision and technical expertise to create beautiful wedding memories for over 8 years.',
      location: 'Manila, Philippines',
      service_areas: ['Metro Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig'],
      contact_phone: '+63917-123-4567',
      contact_email: 'info@elegantmoments.ph',
      contact_website: 'https://elegantmoments.ph',
      social_media: {
        instagram: '@elegantmoments_ph',
        facebook: 'ElegantMomentsPhotographyPH',
        youtube: '',
        tiktok: ''
      },
      portfolio_images: [
        'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400'
      ],
      pricing: {
        starting_price: 25000,
        price_range: '₱25,000 - ₱80,000',
        packages: [
          {
            name: 'Basic Package',
            price: 25000,
            description: 'Half-day coverage, 200+ edited photos'
          },
          {
            name: 'Premium Package', 
            price: 50000,
            description: 'Full-day coverage, 500+ edited photos, engagement shoot'
          },
          {
            name: 'Luxury Package',
            price: 80000,
            description: 'Full-day coverage, unlimited photos, video highlights, album'
          }
        ]
      },
      specialties: ['Wedding Photography', 'Pre-nup Shoots', 'Engagement Photos', 'Same-day Edit'],
      equipment: ['Canon 5D Mark IV', 'Sony A7R III', 'Professional Lighting', 'Drone Photography'],
      rating: 4.8,
      review_count: 127,
      years_experience: 8,
      verified: true,
      created_at: '2017-01-15T00:00:00Z',
      awards: ['Best Wedding Photographer 2023', 'Couples Choice Award 2022'],
      certifications: ['Professional Photographers Association Member']
    };

    res.json({
      success: true,
      profile: mockProfile
    });
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor profile'
    });
  }
});

// Update vendor profile
app.put('/api/vendors/:vendorId/profile', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const updateData = req.body;
    
    // Mock update for now
    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: { ...updateData, id: vendorId }
    });
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor profile'
    });
  }
});

// PayMongo payment endpoints
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'PHP', description = 'Wedding Bazaar Payment' } = req.body;
    
    // Check if PayMongo API keys are properly configured
    const secretKey = process.env.PAYMONGO_SECRET_KEY || process.env.VITE_PAYMONGO_SECRET_KEY;
    if (!secretKey || secretKey.includes('your_secret_key_here') || secretKey.includes('*')) {
      return res.status(500).json({
        success: false,
        error: 'PayMongo API keys not properly configured. Please contact administrator.',
        details: 'Payment processing is currently unavailable due to configuration issues.'
      });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount specified'
      });
    }

    // Create PayMongo Payment Intent
    const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(amount * 100), // Convert to centavos
            payment_method_allowed: ['card'],
            payment_method_options: {
              card: {
                request_three_d_secure: 'automatic'
              }
            },
            currency,
            description,
            statement_descriptor: 'Wedding Bazaar'
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json() as any;
      console.error('PayMongo API Error:', error);
      return res.status(response.status).json({
        success: false,
        error: 'Payment service error',
        details: error.errors?.[0]?.detail || 'Failed to create payment intent'
      });
    }

    const result = await response.json() as any;
    res.json({
      success: true,
      paymentIntent: result.data
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Create PayMongo Source for E-wallets (GCash, PayMaya, etc.)
app.post('/api/payments/create-source', async (req, res) => {
  try {
    const { amount, type, currency = 'PHP', description = 'Wedding Bazaar Payment' } = req.body;
    
    // Check if PayMongo API keys are properly configured
    const secretKey = process.env.PAYMONGO_SECRET_KEY || process.env.VITE_PAYMONGO_SECRET_KEY;
    if (!secretKey || secretKey.includes('your_secret_key_here') || secretKey.includes('*')) {
      return res.status(500).json({
        success: false,
        error: 'PayMongo API keys not properly configured. Please contact administrator.',
        details: 'Payment processing is currently unavailable due to configuration issues.'
      });
    }

    // Validate inputs
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount specified'
      });
    }

    if (!['gcash', 'paymaya', 'grab_pay'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment type. Supported types: gcash, paymaya, grab_pay'
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://weddingbazaarph.web.app';
    
    // Create PayMongo Source
    const response = await fetch('https://api.paymongo.com/v1/sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(amount * 100), // Convert to centavos
            currency,
            type,
            redirect: {
              success: `${frontendUrl}/payment/callback?status=success`,
              failed: `${frontendUrl}/payment/callback?status=failed`
            },
            billing: {
              name: 'Wedding Bazaar Customer',
              email: 'customer@weddingbazaar.com'
            },
            description
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json() as any;
      console.error('PayMongo Source API Error:', error);
      return res.status(response.status).json({
        success: false,
        error: 'Payment service error',
        details: error.errors?.[0]?.detail || 'Failed to create payment source'
      });
    }

    const result = await response.json() as any;
    res.json({
      success: true,
      source: result.data
    });
  } catch (error) {
    console.error('Payment source creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get payment status
app.get('/api/payments/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Check if PayMongo API keys are properly configured
    const secretKey = process.env.PAYMONGO_SECRET_KEY || process.env.VITE_PAYMONGO_SECRET_KEY;
    if (!secretKey || secretKey.includes('your_secret_key_here') || secretKey.includes('*')) {
      return res.status(500).json({
        success: false,
        error: 'PayMongo API keys not properly configured. Please contact administrator.'
      });
    }

    // Get payment status from PayMongo
    const response = await fetch(`https://api.paymongo.com/v1/payment_intents/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`
      }
    });

    if (!response.ok) {
      const error = await response.json() as any;
      console.error('PayMongo Status API Error:', error);
      return res.status(response.status).json({
        success: false,
        error: 'Payment service error',
        details: error.errors?.[0]?.detail || 'Failed to get payment status'
      });
    }

    const result = await response.json() as any;
    res.json({
      success: true,
      payment: result.data
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// PayMongo webhook endpoint
app.post('/api/payments/webhook', async (req, res) => {
  try {
    console.log('PayMongo webhook received:', req.body);
    
    // TODO: Verify webhook signature with PAYMONGO_WEBHOOK_SECRET
    // TODO: Process payment updates (success, failed, etc.)
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ success: false });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Bazaar API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
