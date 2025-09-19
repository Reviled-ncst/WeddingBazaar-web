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
  
  // Convert to array to avoid iterator issues
  const entries = Array.from(activeTokens.entries());
  for (const [token, data] of entries) {
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

// Define extended Request interface for TypeScript
interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    role: string;
    vendor_id?: string;
  };
}

// Authentication middleware
function requireAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No valid authorization token provided'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const validation = validateToken(token);
    
    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        message: validation.error || 'Invalid token'
      });
    }
    
    req.user = validation.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
}

// Role-based authorization middleware
function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${role}`
      });
    }
    
    next();
  };
}

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

// Ping endpoint for connection speed checks
app.get('/api/ping', async (req, res) => {
  res.json({
    success: true,
    message: 'pong',
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

// Vendor profile by user ID endpoint
app.get('/api/vendors/user/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 Fetching vendor profile for user ID: ${userId}`);

    // Get vendor profile from vendor_profiles table
    const vendorProfiles = await sql`
      SELECT 
        vp.*,
        u.email,
        u.first_name,
        u.last_name
      FROM vendor_profiles vp
      LEFT JOIN users u ON u.id = vp.user_id
      WHERE vp.user_id = ${userId}
      LIMIT 1
    `;

    if (vendorProfiles.length === 0) {
      console.log(`❌ No vendor profile found for user ID: ${userId}`);
      return res.status(404).json({
        success: false,
        error: 'Vendor profile not found'
      });
    }

    const profile = vendorProfiles[0];
    console.log(`✅ Found vendor profile: ${profile.business_name}`);

    // Format the response
    const formattedProfile = {
      id: profile.id,
      user_id: profile.user_id,
      business_name: profile.business_name,
      business_type: profile.business_type,
      business_description: profile.business_description,
      contact_email: profile.contact_email || profile.email,
      contact_phone: profile.contact_phone,
      website_url: profile.website_url,
      business_address: profile.business_address,
      service_areas: profile.service_areas,
      years_in_business: profile.years_in_business,
      pricing_range: profile.pricing_range,
      portfolio_images: profile.portfolio_images || [],
      featured_image_url: profile.featured_image_url,
      business_hours: profile.business_hours,
      social_media_links: profile.social_media_links,
      certifications_licenses: profile.certifications_licenses,
      insurance_info: profile.insurance_info,
      cancellation_policy: profile.cancellation_policy,
      payment_methods: profile.payment_methods,
      average_rating: profile.average_rating || '4.5',
      total_reviews: profile.total_reviews || 0,
      total_bookings: profile.total_bookings || 0,
      response_time_hours: profile.response_time_hours || 24,
      verification_status: profile.verification_status || 'pending',
      is_featured: profile.is_featured || false,
      is_premium: profile.is_premium || false,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };

    res.json({
      success: true,
      profile: formattedProfile
    });
  } catch (error) {
    console.error('❌ Error fetching vendor profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor profile'
    });
  }
});

// Vendor profiles endpoint for DSS integration
app.get('/api/vendor-profiles', async (req, res) => {
  try {
    const { business_type, location, minRating, verified } = req.query;
    console.log(`🔍 Fetching vendor profiles with filters:`, { business_type, location, minRating, verified });

    // Build query with filters
    let query = `
      SELECT 
        vp.*,
        u.email,
        u.first_name,
        u.last_name
      FROM vendor_profiles vp
      LEFT JOIN users u ON u.id = vp.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (business_type) {
      query += ` AND vp.business_type = $${paramIndex}`;
      params.push(business_type);
      paramIndex++;
    }

    if (location) {
      query += ` AND (vp.service_areas ILIKE $${paramIndex} OR vp.business_address ILIKE $${paramIndex})`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    if (minRating) {
      query += ` AND CAST(vp.average_rating AS FLOAT) >= $${paramIndex}`;
      params.push(parseFloat(minRating as string));
      paramIndex++;
    }

    if (verified !== undefined) {
      query += ` AND vp.verification_status = $${paramIndex}`;
      params.push(verified === 'true' ? 'verified' : 'pending');
      paramIndex++;
    }

    query += ` ORDER BY CAST(vp.average_rating AS FLOAT) DESC, vp.total_reviews DESC LIMIT 20`;

    // Use neon's template literal syntax
    let vendorProfiles: any[] = [];
    if (params.length === 0) {
      vendorProfiles = await sql`
        SELECT 
          vp.*,
          u.email,
          u.first_name,
          u.last_name
        FROM vendor_profiles vp
        LEFT JOIN users u ON u.id = vp.user_id
        ORDER BY CAST(vp.average_rating AS FLOAT) DESC, vp.total_reviews DESC 
        LIMIT 20
      `;
    } else {
      // For filtered queries, use the simpler approach
      vendorProfiles = await sql`
        SELECT 
          vp.*,
          u.email,
          u.first_name,
          u.last_name
        FROM vendor_profiles vp
        LEFT JOIN users u ON u.id = vp.user_id
        WHERE (${business_type ? `vp.business_type = '${business_type}'` : '1=1'})
          AND (${location ? `(vp.service_areas ILIKE '%${location}%' OR vp.business_address ILIKE '%${location}%')` : '1=1'})
          AND (${minRating ? `CAST(vp.average_rating AS FLOAT) >= ${parseFloat(minRating as string)}` : '1=1'})
          AND (${verified !== undefined ? `vp.verification_status = '${verified === 'true' ? 'verified' : 'pending'}'` : '1=1'})
        ORDER BY CAST(vp.average_rating AS FLOAT) DESC, vp.total_reviews DESC 
        LIMIT 20
      `;
    }

    const formattedProfiles = vendorProfiles.map((profile: any) => ({
      id: profile.id,
      user_id: profile.user_id,
      business_name: profile.business_name,
      business_type: profile.business_type,
      business_description: profile.business_description,
      contact_email: profile.contact_email || profile.email,
      contact_phone: profile.contact_phone,
      website_url: profile.website_url,
      business_address: profile.business_address,
      service_areas: profile.service_areas,
      years_in_business: profile.years_in_business,
      pricing_range: profile.pricing_range,
      portfolio_images: profile.portfolio_images || [],
      featured_image_url: profile.featured_image_url,
      business_hours: profile.business_hours,
      social_media_links: profile.social_media_links,
      average_rating: profile.average_rating || '4.5',
      total_reviews: profile.total_reviews || 0,
      total_bookings: profile.total_bookings || 0,
      response_time_hours: profile.response_time_hours || 24,
      verification_status: profile.verification_status || 'pending',
      is_featured: profile.is_featured || false,
      is_premium: profile.is_premium || false,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    }));

    console.log(`✅ Found ${formattedProfiles.length} vendor profiles`);
    res.json(formattedProfiles);
  } catch (error) {
    console.error('❌ Error fetching vendor profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor profiles'
    });
  }
});

// Featured vendors endpoint - Fixed to match actual database schema
app.get('/api/vendors/featured', async (req, res) => {
  try {
    console.log('🔍 Fetching featured vendors...');
    
    // Get featured vendors using actual database column names
    const featuredVendors = await sql`
      SELECT 
        id, business_name, business_type, location, rating, review_count,
        description, contact_phone, website_url, verified
      FROM vendors 
      WHERE verified = true
      ORDER BY CAST(rating AS FLOAT) DESC, review_count DESC
      LIMIT 6
    `;

    console.log(`✅ Found ${featuredVendors.length} featured vendors`);

    // Format vendors to match frontend expectations
    const formattedVendors = featuredVendors.map(vendor => ({
      id: vendor.id,
      name: vendor.business_name,        // Frontend expects 'name'
      category: vendor.business_type,    // Frontend expects 'category'  
      location: vendor.location,
      rating: parseFloat(vendor.rating || '4.5'),  // Convert string to number
      reviewCount: parseInt(vendor.review_count || '0'),
      priceRange: 'Contact for pricing',
      description: vendor.description || 'Professional wedding services',
      image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
      specialties: vendor.business_type ? [vendor.business_type] : ['Wedding Services'],
      yearsExperience: 3, // Default experience
      website: vendor.website_url,
      phone: vendor.contact_phone
    }));

    res.json({
      success: true,
      vendors: formattedVendors
    });
  } catch (error) {
    console.error('❌ Error fetching featured vendors:', error);
    // Fallback to mock data if database error
    const mockVendors = [
      {
        id: 1,
        name: 'Elegant Photography Studios',
        category: 'Photography',
        location: 'Manila, Philippines',
        rating: 4.8,
        reviewCount: 127,
        priceRange: '₱25,000 - ₱80,000',
        description: 'Professional wedding photography services',
        image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
        specialties: ['Wedding Photography', 'Pre-wedding Shoots'],
        yearsExperience: 8,
        website: 'https://elegantphoto.ph',
        phone: '+63917-123-4567'
      },
      {
        id: 2,
        name: 'Divine Catering Services',
        category: 'Catering',
        location: 'Quezon City, Philippines',
        rating: 4.6,
        reviewCount: 89,
        priceRange: '₱800 - ₱2,500/person',
        description: 'Exquisite wedding catering and events',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
        specialties: ['Wedding Catering', 'Corporate Events'],
        yearsExperience: 12,
        website: 'https://divinecatering.ph',
        phone: '+63917-234-5678'
      },
      {
        id: 3,
        name: 'Garden Villa Venues',
        category: 'Venues',
        location: 'Tagaytay, Philippines',
        rating: 4.9,
        reviewCount: 156,
        priceRange: '₱150,000 - ₱500,000',
        description: 'Beautiful garden wedding venues',
        image: 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
        specialties: ['Garden Weddings', 'Reception Venues'],
        yearsExperience: 15,
        website: 'https://gardenvilla.ph',
        phone: '+63917-345-6789'
      }
    ];
    
    console.log('📋 Using mock vendor data');
    res.json({
      success: true,
      vendors: mockVendors
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

    // Generate unique user ID (max 20 characters)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const userId = `${userType[0]}-${timestamp}-${random}`; // e.g., "c-45678901-123"

    // Create new user in database with explicit ID
    const newUsers = await sql`
      INSERT INTO users (id, email, password, first_name, last_name, user_type, created_at, updated_at)
      VALUES (${userId}, ${email}, ${hashedPassword}, ${name.split(' ')[0] || name}, ${name.split(' ')[1] || ''}, ${userType}, NOW(), NOW())
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
      console.log('⚠️  No token provided - returning unauthenticated state for public access');
      return res.status(200).json({
        success: false,
        authenticated: false,
        message: 'No token provided - public access'
      });
    }

    console.log('🔍 Verifying token:', token);
    console.log('🔍 Active tokens count:', activeTokens.size);
    console.log('🔍 Active tokens keys:', Array.from(activeTokens.keys()));

    // First, check if the token is in our active tokens store
    const tokenValidation = validateToken(token);
    
    if (!tokenValidation.valid) {
      console.log('❌ Token validation failed:', tokenValidation.error);
      return res.status(200).json({
        success: false,
        authenticated: false,
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
        return res.status(200).json({
          success: false,
          authenticated: false,
          message: 'User account no longer exists'
        });
      }
      
      const userData = userResult[0];
      console.log('✅ Token verified for user:', { id: userData.id, email: userData.email, role: userData.role });
      
      // Return current user data
      res.json({
        success: true,
        authenticated: true,
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
        authenticated: true,
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
    res.status(200).json({
      success: false,
      authenticated: false,
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
        v.business_name as vendor_name, v.business_type as vendor_category,
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

// Test endpoint for debugging bookings (no auth required)
app.get('/api/test/bookings', async (req, res) => {
  try {
    console.log('🧪 [TEST] Test bookings endpoint called');
    
    // Return test booking data regardless of auth
    const testBookings = [
      {
        id: 1,
        coupleId: 'test-user',
        vendorId: 1,
        vendorName: 'Test Photography Studio',
        vendorCategory: 'Photography',
        serviceType: 'Wedding Photography Package',
        bookingDate: '2025-09-19T10:00:00Z',
        eventDate: '2025-12-25T14:00:00Z',
        status: 'confirmed',
        amount: 75000,
        downPayment: 22500,
        remainingBalance: 52500,
        location: 'Manila Cathedral',
        notes: 'Test booking for production debugging',
        contactPhone: '+63917-123-4567',
        createdAt: '2025-09-19T10:00:00Z',
        updatedAt: '2025-09-19T10:00:00Z'
      },
      {
        id: 2,
        coupleId: 'test-user',
        vendorId: 2,
        vendorName: 'Test Catering Services',
        vendorCategory: 'Catering',
        serviceType: 'Wedding Reception Catering',
        bookingDate: '2025-09-19T11:00:00Z',
        eventDate: '2025-12-25T18:00:00Z',
        status: 'pending',
        amount: 150000,
        downPayment: 45000,
        remainingBalance: 105000,
        location: 'Manila Hotel Reception',
        notes: 'Test catering booking',
        contactPhone: '+63917-234-5678',
        createdAt: '2025-09-19T11:00:00Z',
        updatedAt: '2025-09-19T11:00:00Z'
      }
    ];

    res.json({
      success: true,
      bookings: testBookings,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalBookings: testBookings.length,
        hasNext: false,
        hasPrev: false
      }
    });
    
    console.log('✅ [TEST] Test bookings returned successfully');
  } catch (error) {
    console.error('❌ [TEST] Error in test bookings endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint error'
    });
  }
});

// Test endpoint for debugging bookings (no auth required)
app.get('/api/test/user', async (req, res) => {
  try {
    console.log('🧪 [TEST] Test user endpoint called');
    
    res.json({
      success: true,
      user: {
        id: 'test-user-123',
        email: 'test@production.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'couple'
      }
    });
    
    console.log('✅ [TEST] Test user returned successfully');
  } catch (error) {
    console.error('❌ [TEST] Error in test user endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Test user endpoint error'
    });
  }
});

// Bookings for a specific couple
app.get('/api/bookings/couple/:id', async (req, res) => {
  try {
    const { id: coupleId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    console.log(`🔍 Fetching bookings for couple: ${coupleId}`);
    
    // Build WHERE clause
    let whereClause = sql`WHERE b.couple_id = ${coupleId}`;
    if (status) {
      whereClause = sql`WHERE b.couple_id = ${coupleId} AND b.status = ${status}`;
    }
    
    // Get bookings from database  
    const bookings = await sql`
      SELECT 
        b.id, b.couple_id, b.vendor_id, b.service_type,
        b.event_date, b.status, b.total_amount, b.notes,
        b.created_at, b.updated_at,
        v.business_name as vendor_name, v.business_type as vendor_category,
        v.contact_phone, v.location
      FROM bookings b
      JOIN vendors v ON b.vendor_id = v.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ${limit} OFFSET ${(parseInt(page as string) - 1) * parseInt(limit as string)}
    `;

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      coupleId: booking.couple_id,
      vendorId: booking.vendor_id,
      vendorName: booking.vendor_name,
      vendorCategory: booking.vendor_category,
      serviceType: booking.service_type,
      bookingDate: booking.created_at,
      eventDate: booking.event_date,
      status: booking.status,
      amount: parseFloat(booking.total_amount || 0),
      downPayment: parseFloat(booking.total_amount || 0) * 0.3,
      remainingBalance: parseFloat(booking.total_amount || 0) * 0.7,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      location: booking.location,
      notes: booking.notes,
      contactPhone: booking.contact_phone
    }));

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) as total 
      FROM bookings b 
      WHERE b.couple_id = ${coupleId}
      ${status ? sql`AND b.status = ${status}` : sql``}
    `;
    const total = parseInt(countResult[0]?.total || 0);

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
    console.error('Error fetching couple bookings:', error);
    // Return mock data if database error
    res.json({
      success: true,
      bookings: [
        {
          id: 1,
          coupleId: req.params.id,
          vendorId: 1,
          vendorName: 'Elegant Photography Studio',
          vendorCategory: 'Photography',
          serviceType: 'Wedding Photography Package',
          bookingDate: '2025-09-01T10:00:00Z',
          eventDate: '2025-12-15T14:00:00Z',
          status: 'confirmed',
          amount: 75000,
          downPayment: 22500,
          remainingBalance: 52500,
          location: 'Manila Cathedral',
          notes: 'Include family portraits',
          contactPhone: '+63917-123-4567'
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalBookings: 1,
        hasNext: false,
        hasPrev: false
      }
    });
  }
});

// Services endpoint with real database integration
app.get('/api/services', async (req, res) => {
  try {
    const { vendorId } = req.query;
    
    // If vendorId is provided, return vendor-specific services
    if (vendorId) {
      console.log(`🔍 Fetching services for vendor: ${vendorId}`);
      
      const services = await sql`
        SELECT 
          id, vendor_id, title, description, category, price,
          images, featured, is_active, created_at, updated_at
        FROM services 
        WHERE vendor_id = ${vendorId}
        ORDER BY featured DESC, created_at DESC
      `;
      
      console.log(`📊 Found ${services.length} services for vendor ${vendorId}`);
      
      res.json({
        success: true,
        services: services
      });
      return;
    }
    
    // Otherwise, return service categories grouped by vendor types (original logic)
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
    // Fallback to empty services if database error
    res.json({
      success: true,
      services: []
    });
  }
});

// Create new service
app.post('/api/services', async (req, res) => {
  try {
    const {
      vendor_id,
      title,
      description,
      category,
      price,
      images,
      featured,
      is_active
    } = req.body;

    console.log(`🔧 Creating new service for vendor: ${vendor_id}`);

    // Generate new service ID
    const serviceId = `SRV-${Date.now()}`;

    const newService = await sql`
      INSERT INTO services (
        id, vendor_id, title, description, category, price,
        images, featured, is_active, created_at, updated_at
      ) VALUES (
        ${serviceId}, ${vendor_id}, ${title}, ${description}, ${category}, ${price || null},
        ${images || []}, ${featured || false}, ${is_active !== false}, NOW(), NOW()
      )
      RETURNING *
    `;

    console.log(`✅ Service created successfully: ${serviceId}`);

    res.json({
      success: true,
      service: newService[0],
      message: 'Service created successfully'
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
});

// Update existing service
app.put('/api/services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const {
      title,
      description,
      category,
      price,
      images,
      featured,
      is_active
    } = req.body;

    console.log(`🔧 Updating service: ${serviceId}`);

    const updatedService = await sql`
      UPDATE services SET
        title = ${title},
        description = ${description},
        category = ${category},
        price = ${price || null},
        images = ${images || []},
        featured = ${featured || false},
        is_active = ${is_active !== false},
        updated_at = NOW()
      WHERE id = ${serviceId}
      RETURNING *
    `;

    if (updatedService.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    console.log(`✅ Service updated successfully: ${serviceId}`);

    res.json({
      success: true,
      service: updatedService[0],
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
});

// Delete service
app.delete('/api/services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;

    console.log(`🗑️ Deleting service: ${serviceId}`);

    const deletedService = await sql`
      DELETE FROM services
      WHERE id = ${serviceId}
      RETURNING *
    `;

    if (deletedService.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    console.log(`✅ Service deleted successfully: ${serviceId}`);

    res.json({
      success: true,
      message: 'Service deleted successfully',
      service: deletedService[0]
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
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

// ===== ADMIN ENDPOINTS =====

// Admin dashboard analytics
app.get('/api/admin/analytics', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    console.log('📊 Admin fetching platform analytics');
    
    // Get platform statistics
    const userCount = await sql`SELECT COUNT(*) as count FROM users WHERE user_type = 'individual'`;
    const vendorCount = await sql`SELECT COUNT(*) as count FROM vendors WHERE verified = true`;
    const bookingCount = await sql`SELECT COUNT(*) as count FROM bookings`;
    const revenueData = await sql`
      SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as paid_bookings
      FROM bookings 
      WHERE status = 'confirmed' AND payment_status = 'paid'
    `;
    
    const analytics = {
      totalUsers: parseInt(userCount[0].count),
      totalVendors: parseInt(vendorCount[0].count),
      totalBookings: parseInt(bookingCount[0].count),
      totalRevenue: parseFloat(revenueData[0].total_revenue || 0),
      paidBookings: parseInt(revenueData[0].paid_bookings || 0),
      conversionRate: vendorCount[0].count > 0 ? (bookingCount[0].count / vendorCount[0].count * 100).toFixed(2) : 0
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform analytics'
    });
  }
});

// Admin user management
app.get('/api/admin/users', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let users;
    if (search) {
      users = await sql`
        SELECT id, email, first_name, last_name, user_type, verified, created_at, last_login
        FROM users
        WHERE email ILIKE ${'%' + search + '%'} 
           OR first_name ILIKE ${'%' + search + '%'} 
           OR last_name ILIKE ${'%' + search + '%'}
        ORDER BY created_at DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `;
    } else {
      users = await sql`
        SELECT id, email, first_name, last_name, user_type, verified, created_at, last_login
        FROM users
        ORDER BY created_at DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `;
    }
    
    const totalCount = await sql`SELECT COUNT(*) as count FROM users`;
    
    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: parseInt(totalCount[0].count),
        pages: Math.ceil(parseInt(totalCount[0].count) / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Admin vendor management
app.get('/api/admin/vendors', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let vendors;
    if (search && status !== 'all') {
      const verified = status === 'verified';
      vendors = await sql`
        SELECT 
          v.id, v.business_name, v.category, v.verified, v.rating, v.review_count,
          v.location, v.created_at, u.email, u.first_name, u.last_name
        FROM vendors v
        JOIN users u ON v.user_id = u.id
        WHERE (v.business_name ILIKE ${'%' + search + '%'} OR v.category ILIKE ${'%' + search + '%'})
          AND v.verified = ${verified}
        ORDER BY v.created_at DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `;
    } else if (search) {
      vendors = await sql`
        SELECT 
          v.id, v.business_name, v.category, v.verified, v.rating, v.review_count,
          v.location, v.created_at, u.email, u.first_name, u.last_name
        FROM vendors v
        JOIN users u ON v.user_id = u.id
        WHERE v.business_name ILIKE ${'%' + search + '%'} OR v.category ILIKE ${'%' + search + '%'}
        ORDER BY v.created_at DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `;
    } else if (status !== 'all') {
      const verified = status === 'verified';
      vendors = await sql`
        SELECT 
          v.id, v.business_name, v.category, v.verified, v.rating, v.review_count,
          v.location, v.created_at, u.email, u.first_name, u.last_name
        FROM vendors v
        JOIN users u ON v.user_id = u.id
        WHERE v.verified = ${verified}
        ORDER BY v.created_at DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `;
    } else {
      vendors = await sql`
        SELECT 
          v.id, v.business_name, v.category, v.verified, v.rating, v.review_count,
          v.location, v.created_at, u.email, u.first_name, u.last_name
        FROM vendors v
        JOIN users u ON v.user_id = u.id
        ORDER BY v.created_at DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `;
    }
    
    const totalCount = await sql`SELECT COUNT(*) as count FROM vendors v JOIN users u ON v.user_id = u.id`;
    
    res.json({
      success: true,
      vendors,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: parseInt(totalCount[0].count),
        pages: Math.ceil(parseInt(totalCount[0].count) / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors'
    });
  }
});

// Admin approve/reject vendor
app.patch('/api/admin/vendors/:id/verify', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { verified, reason } = req.body;
    
    await sql`
      UPDATE vendors 
      SET verified = ${verified}, verification_notes = ${reason || null}
      WHERE id = ${id}
    `;
    
    res.json({
      success: true,
      message: `Vendor ${verified ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error updating vendor verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor verification'
    });
  }
});

// ===== VENDOR ANALYTICS ENDPOINTS =====

// Vendor analytics dashboard
app.get('/api/vendor/analytics', requireAuth, requireRole('vendor'), async (req: AuthenticatedRequest, res) => {
  try {
    const vendorId = req.user?.vendor_id;
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }
    
    // Get vendor analytics
    const bookingStats = await sql`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount END), 0) as total_revenue
      FROM bookings 
      WHERE vendor_id = ${vendorId}
    `;
    
    const monthlyRevenue = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as bookings,
        SUM(amount) as revenue
      FROM bookings 
      WHERE vendor_id = ${vendorId} 
        AND status = 'confirmed'
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `;
    
    const analytics = {
      ...bookingStats[0],
      monthlyRevenue: monthlyRevenue,
      conversionRate: bookingStats[0].total_bookings > 0 
        ? (bookingStats[0].confirmed_bookings / bookingStats[0].total_bookings * 100).toFixed(2) 
        : 0
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// ===== SERVICE MANAGEMENT ENDPOINTS =====

// Create service
app.post('/api/services', requireAuth, requireRole('vendor'), async (req: AuthenticatedRequest, res) => {
  try {
    const vendorId = req.user?.vendor_id;
    const { title, description, category, price, images, featured } = req.body;
    
    const service = await sql`
      INSERT INTO services (vendor_id, title, description, category, price, images, featured)
      VALUES (${vendorId}, ${title}, ${description}, ${category}, ${price}, ${JSON.stringify(images)}, ${featured || false})
      RETURNING *
    `;
    
    res.json({
      success: true,
      service: service[0],
      message: 'Service created successfully'
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service'
    });
  }
});

// Update service
app.put('/api/services/:id', requireAuth, requireRole('vendor'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.vendor_id;
    const { title, description, category, price, images, featured } = req.body;
    
    const service = await sql`
      UPDATE services 
      SET title = ${title}, description = ${description}, category = ${category}, 
          price = ${price}, images = ${JSON.stringify(images)}, featured = ${featured || false}
      WHERE id = ${id} AND vendor_id = ${vendorId}
      RETURNING *
    `;
    
    if (service.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or access denied'
      });
    }
    
    res.json({
      success: true,
      service: service[0],
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service'
    });
  }
});

// Delete service
app.delete('/api/services/:id', requireAuth, requireRole('vendor'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.vendor_id;
    
    const result = await sql`
      DELETE FROM services 
      WHERE id = ${id} AND vendor_id = ${vendorId}
      RETURNING id
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or access denied'
      });
    }
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service'
    });
  }
});

// ===== REVIEW SYSTEM ENDPOINTS =====

// Get reviews for vendor
app.get('/api/vendors/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const reviews = await sql`
      SELECT 
        r.id, r.rating, r.comment, r.created_at,
        u.first_name, u.last_name, u.email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.vendor_id = ${id}
      ORDER BY r.created_at DESC
      LIMIT ${parseInt(limit as string)} OFFSET ${offset}
    `;
    
    const totalCount = await sql`SELECT COUNT(*) as count FROM reviews WHERE vendor_id = ${id}`;
    const avgRating = await sql`SELECT AVG(rating) as avg_rating FROM reviews WHERE vendor_id = ${id}`;
    
    res.json({
      success: true,
      reviews,
      totalReviews: parseInt(totalCount[0].count),
      averageRating: parseFloat(avgRating[0].avg_rating || 0),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: parseInt(totalCount[0].count),
        pages: Math.ceil(parseInt(totalCount[0].count) / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
});

// Create review
app.post('/api/reviews', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const { vendorId, bookingId, rating, comment } = req.body;
    
    // Check if user has completed booking with this vendor
    const booking = await sql`
      SELECT id FROM bookings 
      WHERE id = ${bookingId} AND user_id = ${userId} AND vendor_id = ${vendorId}
        AND status = 'completed'
    `;
    
    if (booking.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You can only review vendors after completing a booking'
      });
    }
    
    // Check if review already exists
    const existingReview = await sql`
      SELECT id FROM reviews 
      WHERE user_id = ${userId} AND vendor_id = ${vendorId} AND booking_id = ${bookingId}
    `;
    
    if (existingReview.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }
    
    const review = await sql`
      INSERT INTO reviews (user_id, vendor_id, booking_id, rating, comment)
      VALUES (${userId}, ${vendorId}, ${bookingId}, ${rating}, ${comment})
      RETURNING *
    `;
    
    // Update vendor rating
    await updateVendorRating(vendorId);
    
    res.json({
      success: true,
      review: review[0],
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review'
    });
  }
});

// ===== USER MANAGEMENT ENDPOINTS =====

// Update user profile
app.put('/api/users/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const { first_name, last_name, phone, address, wedding_date, partner_name, budget_range } = req.body;
    
    const user = await sql`
      UPDATE users 
      SET first_name = ${first_name}, last_name = ${last_name}, phone = ${phone}, 
          address = ${address}, wedding_date = ${wedding_date}, partner_name = ${partner_name},
          budget_range = ${budget_range}
      WHERE id = ${userId}
      RETURNING id, email, first_name, last_name, phone, address, wedding_date, partner_name, budget_range
    `;
    
    res.json({
      success: true,
      user: user[0],
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Get user profile
app.get('/api/users/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    
    const user = await sql`
      SELECT id, email, first_name, last_name, phone, address, wedding_date, 
             partner_name, budget_range, user_type, created_at
      FROM users 
      WHERE id = ${userId}
    `;
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: user[0]
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// ===== FILE UPLOAD ENDPOINTS =====

// Mock file upload (replace with actual cloud storage)
app.post('/api/upload', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    // TODO: Implement actual file upload to cloud storage (S3, Cloudinary, etc.)
    
    const mockFileUrl = `https://example.com/uploads/${Date.now()}_${Math.random()}.jpg`;
    
    res.json({
      success: true,
      url: mockFileUrl,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file'
    });
  }
});

// ===== SEARCH ENDPOINTS =====

// Advanced vendor search
app.get('/api/search/vendors', async (req, res) => {
  try {
    const { 
      q = '', 
      category = '', 
      location = '', 
      minRating = 0, 
      maxPrice = 999999,
      sortBy = 'rating',
      page = 1, 
      limit = 20 
    } = req.query;
    
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Build query conditions dynamically
    let vendors;
    let totalCount;
    
    if (q && category && location) {
      // All search parameters
      vendors = await sql`
        SELECT 
          v.id, v.business_name as name, v.category, v.rating, v.review_count,
          v.price_range, v.location, v.description, v.portfolio_images,
          v.contact_email, v.contact_phone, v.website
        FROM vendors v
        WHERE v.verified = true
          AND (v.business_name ILIKE ${'%' + q + '%'} OR v.description ILIKE ${'%' + q + '%'})
          AND v.category = ${category}
          AND v.location ILIKE ${'%' + location + '%'}
          AND v.rating >= ${minRating}
        ORDER BY ${sortBy === 'rating' ? sql`v.rating DESC` : 
                 sortBy === 'price' ? sql`v.price_range ASC` : 
                 sql`v.created_at DESC`}
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `;
      
      totalCount = await sql`
        SELECT COUNT(*) as count 
        FROM vendors v 
        WHERE v.verified = true
          AND (v.business_name ILIKE ${'%' + q + '%'} OR v.description ILIKE ${'%' + q + '%'})
          AND v.category = ${category}
          AND v.location ILIKE ${'%' + location + '%'}
          AND v.rating >= ${minRating}
      `;
    } else if (q && category) {
      // Search text and category
      vendors = await sql`
        SELECT 
          v.id, v.business_name as name, v.category, v.rating, v.review_count,
          v.price_range, v.location, v.description, v.portfolio_images,
          v.contact_email, v.contact_phone, v.website
        FROM vendors v
        WHERE v.verified = true
          AND (v.business_name ILIKE ${'%' + q + '%'} OR v.description ILIKE ${'%' + q + '%'})
          AND v.category = ${category}
          AND v.rating >= ${minRating}
        ORDER BY ${sortBy === 'rating' ? sql`v.rating DESC` : 
                 sortBy === 'price' ? sql`v.price_range ASC` : 
                 sql`v.created_at DESC`}
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `;
      
      totalCount = await sql`
        SELECT COUNT(*) as count 
        FROM vendors v 
        WHERE v.verified = true
          AND (v.business_name ILIKE ${'%' + q + '%'} OR v.description ILIKE ${'%' + q + '%'})
          AND v.category = ${category}
          AND v.rating >= ${minRating}
      `;
    } else if (q) {
      // Search text only
      vendors = await sql`
        SELECT 
          v.id, v.business_name as name, v.category, v.rating, v.review_count,
          v.price_range, v.location, v.description, v.portfolio_images,
          v.contact_email, v.contact_phone, v.website
        FROM vendors v
        WHERE v.verified = true
          AND (v.business_name ILIKE ${'%' + q + '%'} OR v.description ILIKE ${'%' + q + '%'})
          AND v.rating >= ${minRating}
        ORDER BY ${sortBy === 'rating' ? sql`v.rating DESC` : 
                 sortBy === 'price' ? sql`v.price_range ASC` : 
                 sql`v.created_at DESC`}
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `;
      
      totalCount = await sql`
        SELECT COUNT(*) as count 
        FROM vendors v 
        WHERE v.verified = true
          AND (v.business_name ILIKE ${'%' + q + '%'} OR v.description ILIKE ${'%' + q + '%'})
          AND v.rating >= ${minRating}
      `;
    } else if (category) {
      // Category only
      vendors = await sql`
        SELECT 
          v.id, v.business_name as name, v.category, v.rating, v.review_count,
          v.price_range, v.location, v.description, v.portfolio_images,
          v.contact_email, v.contact_phone, v.website
        FROM vendors v
        WHERE v.verified = true
          AND v.category = ${category}
          AND v.rating >= ${minRating}
        ORDER BY ${sortBy === 'rating' ? sql`v.rating DESC` : 
                 sortBy === 'price' ? sql`v.price_range ASC` : 
                 sql`v.created_at DESC`}
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `;
      
      totalCount = await sql`
        SELECT COUNT(*) as count 
        FROM vendors v 
        WHERE v.verified = true
          AND v.category = ${category}
          AND v.rating >= ${minRating}
      `;
    } else {
      // No specific filters
      vendors = await sql`
        SELECT 
          v.id, v.business_name as name, v.category, v.rating, v.review_count,
          v.price_range, v.location, v.description, v.portfolio_images,
          v.contact_email, v.contact_phone, v.website
        FROM vendors v
        WHERE v.verified = true
          AND v.rating >= ${minRating}
        ORDER BY ${sortBy === 'rating' ? sql`v.rating DESC` : 
                 sortBy === 'price' ? sql`v.price_range ASC` : 
                 sql`v.created_at DESC`}
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `;
      
      totalCount = await sql`
        SELECT COUNT(*) as count 
        FROM vendors v 
        WHERE v.verified = true
          AND v.rating >= ${minRating}
      `;
    }
    
    res.json({
      success: true,
      vendors,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: parseInt(totalCount[0].count),
        pages: Math.ceil(parseInt(totalCount[0].count) / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error searching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching vendors'
    });
  }
});

// ===== NOTIFICATION ENDPOINTS =====

// Get user notifications
app.get('/api/notifications', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Mock notifications (implement actual notifications table)
    const mockNotifications = [
      {
        id: 1,
        title: 'Booking Confirmed',
        message: 'Your booking with Elegant Photography has been confirmed',
        type: 'booking',
        read_at: null,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'New Message',
        message: 'You have a new message from John at Perfect Catering',
        type: 'message',
        read_at: null,
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    res.json({
      success: true,
      notifications: mockNotifications,
      unreadCount: 2
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // TODO: Implement actual notification update
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification'
    });
  }
});

// ===== SUBSCRIPTION ENDPOINTS =====

// Get subscription status
app.get('/api/subscription/status', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    
    // Mock subscription data
    const mockSubscription = {
      isActive: false,
      plan: 'free',
      expiresAt: null,
      features: ['Basic profile', 'Limited bookings', 'Standard support']
    };
    
    res.json({
      success: true,
      subscription: mockSubscription
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription status'
    });
  }
});

// ===== REPORTS ENDPOINTS =====

// Admin platform reports
app.get('/api/admin/reports', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const { type = 'overview', startDate, endDate } = req.query;
    
    const report = {
      type,
      generatedAt: new Date().toISOString(),
      data: {}
    };
    
    if (type === 'overview') {
      const stats = await sql`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE user_type = 'individual') as total_users,
          (SELECT COUNT(*) FROM vendors WHERE verified = true) as total_vendors,
          (SELECT COUNT(*) FROM bookings) as total_bookings,
          (SELECT SUM(amount) FROM bookings WHERE status = 'confirmed') as total_revenue
      `;
      report.data = stats[0];
    }
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report'
    });
  }
});

// Helper function to update vendor rating
async function updateVendorRating(vendorId: string) {
  try {
    const result = await sql`
      SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
      FROM reviews 
      WHERE vendor_id = ${vendorId}
    `;
    
    await sql`
      UPDATE vendors 
      SET rating = ${parseFloat(result[0].avg_rating || 0)}, 
          review_count = ${parseInt(result[0].review_count || 0)}
      WHERE id = ${vendorId}
    `;
  } catch (error) {
    console.error('Error updating vendor rating:', error);
  }
}

// ===== ADDITIONAL VENDOR ENDPOINTS =====

// Get all vendors (public)
app.get('/api/vendors/all', async (req, res) => {
  try {
    const { page = 1, limit = 20, category = '' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let vendors;
    if (category) {
      vendors = await sql`
        SELECT 
          v.id, v.business_name as name, v.category, v.rating, v.review_count,
          v.price_range, v.location, v.description, v.portfolio_images,
          v.contact_email, v.contact_phone, v.website
        FROM vendors v
        WHERE v.verified = true AND v.category = ${category}
        ORDER BY v.rating DESC, v.review_count DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `;
    } else {
      vendors = await sql`
        SELECT 
          v.id, v.business_name as name, v.category, v.rating, v.review_count,
          v.price_range, v.location, v.description, v.portfolio_images,
          v.contact_email, v.contact_phone, v.website
        FROM vendors v
        WHERE v.verified = true
        ORDER BY v.rating DESC, v.review_count DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `;
    }
    
    const totalCount = category 
      ? await sql`SELECT COUNT(*) as count FROM vendors WHERE verified = true AND category = ${category}`
      : await sql`SELECT COUNT(*) as count FROM vendors WHERE verified = true`;
    
    res.json({
      success: true,
      vendors,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: parseInt(totalCount[0].count),
        pages: Math.ceil(parseInt(totalCount[0].count) / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching all vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors'
    });
  }
});

// Get vendor by ID (public)
app.get('/api/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await sql`
      SELECT 
        v.*, u.email, u.first_name, u.last_name
      FROM vendors v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.id = ${id} AND v.verified = true
    `;
    
    if (vendor.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    res.json({
      success: true,
      vendor: vendor[0]
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor'
    });
  }
});

// ===== BOOKING STATUS UPDATE ENDPOINTS =====

// Update booking status (vendor only)
app.patch('/api/bookings/:id/status', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.id;
    
    // Check if user is vendor and owns this booking
    const booking = await sql`
      SELECT b.*, v.user_id as vendor_user_id
      FROM bookings b
      JOIN vendors v ON b.vendor_id = v.id
      WHERE b.id = ${id} AND v.user_id = ${userId}
    `;
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or access denied'
      });
    }
    
    await sql`
      UPDATE bookings 
      SET status = ${status}, vendor_notes = ${notes || null}, updated_at = NOW()
      WHERE id = ${id}
    `;
    
    res.json({
      success: true,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status'
    });
  }
});

// ===== SERVICE CATEGORIES ENDPOINT =====

// Get service categories
app.get('/api/services/categories', async (req, res) => {
  try {
    const categories = await sql`
      SELECT 
        category,
        COUNT(*) as vendor_count,
        AVG(rating) as avg_rating
      FROM vendors 
      WHERE verified = true AND category IS NOT NULL
      GROUP BY category
      ORDER BY vendor_count DESC
    `;
    
    const formattedCategories = categories.map(cat => ({
      name: cat.category,
      vendorCount: parseInt(cat.vendor_count),
      averageRating: parseFloat(cat.avg_rating || 0).toFixed(1),
      slug: cat.category.toLowerCase().replace(/\s+/g, '-')
    }));
    
    res.json({
      success: true,
      categories: formattedCategories
    });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service categories'
    });
  }
});

// ===== MESSAGING INTEGRATION ENDPOINTS =====

// Get conversation list for user
app.get('/api/conversations', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    
    const conversations = await sql`
      SELECT DISTINCT
        c.id, c.vendor_id, c.user_id, c.created_at, c.updated_at,
        v.business_name as vendor_name,
        u.first_name, u.last_name,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM conversations c
      LEFT JOIN vendors v ON c.vendor_id = v.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ${userId} OR v.user_id = ${userId}
      ORDER BY c.updated_at DESC
    `;
    
    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
});

// Get messages for conversation
app.get('/api/conversations/:id/messages', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Verify user has access to this conversation
    const conversation = await sql`
      SELECT c.*, v.user_id as vendor_user_id
      FROM conversations c
      LEFT JOIN vendors v ON c.vendor_id = v.id
      WHERE c.id = ${id} AND (c.user_id = ${userId} OR v.user_id = ${userId})
    `;
    
    if (conversation.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }
    
    const messages = await sql`
      SELECT 
        m.*, u.first_name, u.last_name
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ${id}
      ORDER BY m.created_at ASC
    `;
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// Send message
app.post('/api/conversations/:id/messages', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    
    // Verify user has access to this conversation
    const conversation = await sql`
      SELECT c.*, v.user_id as vendor_user_id
      FROM conversations c
      LEFT JOIN vendors v ON c.vendor_id = v.id
      WHERE c.id = ${id} AND (c.user_id = ${userId} OR v.user_id = ${userId})
    `;
    
    if (conversation.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }
    
    const message = await sql`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (${id}, ${userId}, ${content})
      RETURNING *
    `;
    
    // Update conversation timestamp
    await sql`
      UPDATE conversations 
      SET updated_at = NOW()
      WHERE id = ${id}
    `;
    
    res.json({
      success: true,
      message: message[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// ===== CATCH-ALL 404 HANDLER =====
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /api/health - Health check',
      'GET /api/ping - Simple ping', 
      'GET /api/vendors/featured - Featured vendors',
      'GET /api/vendors/all - All vendors with pagination',
      'GET /api/vendors/:id - Vendor details',
      'POST /api/auth/login - User login',
      'POST /api/auth/register - User registration',
      'POST /api/auth/verify - Token verification',
      'GET /api/bookings - User bookings',
      'POST /api/bookings - Create booking',
      'GET /api/bookings/:id - Booking details',
      'PATCH /api/bookings/:id/status - Update booking status',
      'GET /api/services - Services (optional ?vendorId filter)',
      'POST /api/services - Create service (vendors)',
      'PUT /api/services/:id - Update service (vendors)',
      'DELETE /api/services/:id - Delete service (vendors)',
      'GET /api/services/categories - Service categories',
      'GET /api/search/vendors - Advanced vendor search',
      'GET /api/vendors/:id/reviews - Vendor reviews',
      'POST /api/reviews - Create review',
      'GET /api/users/profile - User profile',
      'PUT /api/users/profile - Update profile',
      'POST /api/upload - File upload',
      'GET /api/notifications - User notifications',
      'PATCH /api/notifications/:id/read - Mark notification read',
      'GET /api/conversations - User conversations',
      'GET /api/conversations/:id/messages - Conversation messages',
      'POST /api/conversations/:id/messages - Send message',
      'GET /api/subscription/status - Subscription status',
      'GET /api/admin/analytics - Admin analytics',
      'GET /api/admin/users - Admin user management',
      'GET /api/admin/vendors - Admin vendor management',
      'PATCH /api/admin/vendors/:id/verify - Vendor verification',
      'GET /api/admin/reports - Admin reports',
      'GET /api/vendor/analytics - Vendor analytics',
      'POST /api/payments/paymongo - PayMongo payments',
      'GET /api/payments/:id/status - Payment status'
    ]
  });
});

// Initialize database tables and seed data
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database tables...');
    
    // Create vendors table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        business_name VARCHAR(255),
        business_type VARCHAR(255),
        category VARCHAR(255),
        location VARCHAR(255),
        rating DECIMAL(3,2) DEFAULT 4.5,
        review_count INTEGER DEFAULT 0,
        description TEXT,
        contact_phone VARCHAR(50),
        website_url VARCHAR(500),
        verified BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    
    // Check if we have vendors and seed if empty
    const existingVendors = await sql`SELECT COUNT(*) as count FROM vendors`;
    
    if (parseInt(existingVendors[0].count) === 0) {
      console.log('🏪 Seeding vendor data...');
      
      await sql`
        INSERT INTO vendors (business_name, business_type, category, location, rating, review_count, description, contact_phone, website_url)
        VALUES 
          ('Elegant Photography Studios', 'Photography', 'Photography', 'Manila, Philippines', 4.8, 127, 'Professional wedding photography services', '+63917-123-4567', 'https://elegantphoto.ph'),
          ('Divine Catering Services', 'Catering', 'Catering', 'Quezon City, Philippines', 4.6, 89, 'Exquisite wedding catering and events', '+63917-234-5678', 'https://divinecatering.ph'),
          ('Garden Villa Venues', 'Venues', 'Venues', 'Tagaytay, Philippines', 4.9, 156, 'Beautiful garden wedding venues', '+63917-345-6789', 'https://gardenvilla.ph'),
          ('Harmony Music Band', 'Music & Entertainment', 'Music', 'Makati, Philippines', 4.7, 92, 'Live wedding music and entertainment', '+63917-456-7890', 'https://harmonyband.ph'),
          ('Blooming Flowers Co.', 'Flowers & Decoration', 'Florist', 'Pasig, Philippines', 4.5, 78, 'Wedding flowers and decorations', '+63917-567-8901', 'https://bloomingflowers.ph')
      `;
      
      console.log('✅ Sample vendors created successfully');
    }
    
    // Create bookings table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        couple_id VARCHAR(255) NOT NULL,
        vendor_id INTEGER NOT NULL,
        service_type VARCHAR(255),
        event_date TIMESTAMPTZ,
        status VARCHAR(50) DEFAULT 'pending',
        total_amount DECIMAL(10,2),
        notes TEXT,
        payment_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    
    // Check if we have any bookings for couple 1-2025-001
    const existingBookings = await sql`
      SELECT COUNT(*) as count FROM bookings WHERE couple_id = '1-2025-001'
    `;
    
    if (parseInt(existingBookings[0].count) === 0) {
      console.log('📊 Seeding booking data for couple 1-2025-001...');
      
      // Insert sample bookings
      await sql`
        INSERT INTO bookings (couple_id, vendor_id, service_type, event_date, status, total_amount, notes)
        VALUES 
          ('1-2025-001', 1, 'Wedding Photography Package', '2025-12-15T14:00:00Z', 'confirmed', 75000, 'Include family portraits'),
          ('1-2025-001', 2, 'Wedding Catering Service', '2025-12-15T18:00:00Z', 'pending', 150000, 'Vegetarian options required'),
          ('1-2025-001', 3, 'Venue Rental', '2025-12-15T12:00:00Z', 'confirmed', 300000, 'Garden ceremony with indoor reception')
      `;
      
      console.log('✅ Sample bookings created successfully');
    }
    
    // Create conversations table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(255) PRIMARY KEY,
        participant_id VARCHAR(255),
        participant_name VARCHAR(255),
        participant_type VARCHAR(50),
        participant_avatar VARCHAR(500),
        creator_id VARCHAR(255),
        creator_type VARCHAR(50),
        conversation_type VARCHAR(50) DEFAULT 'inquiry',
        last_message TEXT,
        last_message_time TIMESTAMPTZ,
        unread_count INTEGER DEFAULT 0,
        is_online BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'active',
        wedding_date DATE,
        location VARCHAR(255),
        service_id VARCHAR(255),
        service_name VARCHAR(255),
        service_category VARCHAR(255),
        service_price DECIMAL(10,2),
        service_image VARCHAR(500),
        service_description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    
    // Create messages table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(255) PRIMARY KEY,
        conversation_id VARCHAR(255),
        sender_id VARCHAR(255),
        sender_name VARCHAR(255),
        sender_type VARCHAR(50),
        content TEXT,
        message_type VARCHAR(50) DEFAULT 'text',
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        is_read BOOLEAN DEFAULT false,
        reactions JSONB,
        service_data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't crash the server if database init fails
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Wedding Bazaar API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Production URL: https://weddingbazaar-web.onrender.com`);
  console.log(`📊 Admin panel: ${PORT}/api/admin/analytics`);
  console.log(`🏪 Vendor analytics: ${PORT}/api/vendor/analytics`);
  console.log(`🔍 Search vendors: ${PORT}/api/search/vendors`);
  console.log(`💬 Messaging: ${PORT}/api/conversations`);
  console.log(`⭐ Reviews: ${PORT}/api/vendors/:id/reviews`);
  console.log(`📋 Service categories: ${PORT}/api/services/categories`);
  console.log(`🛡️ Total endpoints: 35+ endpoints implemented`);
  console.log(`🗄️ Database initialization will run automatically...`);
  
  // Initialize database after server starts
  await initializeDatabase();
});

export default app;
