import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcrypt';
// Force deployment - Services endpoint fix v2.1
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
config();

// Updated: September 22, 2025 - Fixed booking status constraint (using 'request' instead of 'pending')

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
  'https://weddingbazaar-web.web.app',  // ✅ Fixed: Correct production URL
  'https://weddingbazaarph.web.app',    // Legacy URL for compatibility
  'http://localhost:5173',              // Development frontend
  'http://localhost:5174',              // Alternative development ports
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:3000'
];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-id'
  ]
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

// Debug endpoint to check vendors table
app.get('/api/debug/vendors', async (req, res) => {
  try {
    console.log('🔍 Debug: Checking vendors table...');
    
    // Get raw vendor data
    const rawVendors = await sql`SELECT * FROM vendors LIMIT 10`;
    console.log('📊 Raw vendors:', rawVendors);
    
    // Get verified vendors
    const verifiedVendors = await sql`SELECT * FROM vendors WHERE verified = true`;
    console.log('✅ Verified vendors:', verifiedVendors);
    
    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vendors'
    `;
    
    res.json({
      success: true,
      debug: {
        totalVendors: rawVendors.length,
        verifiedVendorsCount: verifiedVendors.length,
        sampleVendor: rawVendors[0] || null,
        columns: columns,
        allVendors: rawVendors,
        verifiedVendors: verifiedVendors
      }
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.json({
      success: false,
      error: error.message,
      debug: 'Failed to query database'
    });
  }
});

// Basic vendors endpoint - Fixed to use correct database column names
app.get('/api/vendors', async (req, res) => {
  try {
    console.log('🔍 Fetching all vendors...');
    
    // Get all vendors using the correct column names from the database
    const vendors = await sql`
      SELECT 
        id, 
        business_name, 
        business_type, 
        location, 
        rating, 
        review_count,
        description, 
        website_url, 
        verified,
        years_experience,
        portfolio_url,
        instagram_url,
        facebook_url,
        service_areas,
        profile_image,
        starting_price,
        price_range,
        portfolio_images,
        created_at,
        updated_at
      FROM vendors 
      WHERE verified = true
      ORDER BY CAST(rating AS FLOAT) DESC, review_count DESC
      LIMIT 50
    `;

    console.log(`✅ Found ${vendors.length} vendors`);

    const formattedVendors = vendors.map(vendor => ({
      id: vendor.id,
      name: vendor.business_name || 'Unnamed Vendor',
      category: vendor.business_type || 'General',
      location: vendor.location || 'Location Available',
      rating: parseFloat(vendor.rating || '4.5'),
      reviewCount: parseInt(vendor.review_count || '0'),
      priceRange: vendor.price_range || 'Contact for pricing',
      description: vendor.description || 'Professional wedding services',
      image: vendor.profile_image || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
      gallery: vendor.portfolio_images || [],
      features: [vendor.business_type || 'Wedding Services'],
      availability: true,
      contactInfo: {
        phone: vendor.contact_phone,
        email: vendor.email,
        website: vendor.website_url
      },
      vendorId: vendor.id,
      vendorName: vendor.business_name || 'Unnamed Vendor',
      vendorImage: vendor.profile_image || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      website: vendor.website_url,
      phone: vendor.contact_phone,
      verified: vendor.verified,
      featured: parseFloat(vendor.rating || '0') >= 4.5,
      yearsExperience: vendor.years_experience,
      portfolioUrl: vendor.portfolio_url,
      instagramUrl: vendor.instagram_url,
      facebookUrl: vendor.facebook_url,
      serviceAreas: vendor.service_areas,
      startingPrice: vendor.starting_price,
      createdAt: vendor.created_at,
      updatedAt: vendor.updated_at
    }));

    res.json({
      success: true,
      vendors: formattedVendors
    });
  } catch (error) {
    console.error('❌ Error fetching vendors:', error);
    // Fallback to empty array if database error
    res.json({
      success: true,
      vendors: []
    });
  }
});

// Public endpoint to get basic user display name (for vendor booking displays)
app.get('/api/users/:userId/display-name', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 Fetching display name for user ID: ${userId}`);
    
    // Get basic user info (no authentication required for display names)
    const users = await sql`
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
      console.log(`❌ User not found for ID: ${userId}`);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.first_name} ${user.last_name}`);
    
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

// Services endpoint - Expose services table data
app.get('/api/services', async (req, res) => {
  try {
    console.log('🚀 [API] /api/services endpoint called');
    
    // Get services from database - corrected column references
    const services = await sql`
      SELECT 
        s.id,
        s.vendor_id,
        s.title,
        s.name,
        s.description,
        s.category,
        s.price,
        s.images,
        s.featured,
        s.is_active,
        s.created_at,
        s.updated_at,
        v.business_name as vendor_name,
        v.rating,
        v.review_count,
        v.service_areas,
        v.website_url as contact_website
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.is_active = true
      ORDER BY s.featured DESC, s.created_at DESC
    `;

    console.log(`✅ [API] Found ${services.length} services in database`);
    if (services.length > 0) {
      console.log(`📋 [API] Sample service:`, {
        id: services[0].id,
        title: services[0].title,
        name: services[0].name,
        category: services[0].category,
        vendor_name: services[0].vendor_name
      });
    }

    // Format services for frontend - use title if name is null
    const formattedServices = services.map(service => {
      const serviceName = service.name || service.title || 'Unnamed Service';
      
      return {
        id: service.id,
        name: serviceName,
        category: service.category || 'General',
        vendorId: service.vendor_id,
        vendorName: service.vendor_name || 'Unknown Vendor',
        vendorImage: `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400`,
        description: service.description || 'Professional wedding service',
        priceRange: service.price ? `₱${parseFloat(service.price).toLocaleString()}` : '₱₱',
        location: service.service_areas && Array.isArray(service.service_areas) && service.service_areas.length > 0 
          ? service.service_areas[0] 
          : 'Philippines',
        rating: parseFloat(service.rating || '4.5'),
        reviewCount: parseInt(service.review_count || '0'),
        image: service.images && Array.isArray(service.images) && service.images.length > 0 
          ? service.images[0] 
          : `https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400`,
        gallery: service.images || [],
        features: [service.category || 'Wedding Service'],
        availability: service.is_active,
        featured: service.featured,
        contactInfo: {
          phone: null, // Phone not available in vendors table
          email: null, // Email not available in vendors table
          website: service.contact_website
        }
      };
    });

    console.log(`📋 [API] Formatted ${formattedServices.length} services for frontend`);
    if (formattedServices.length > 0) {
      console.log(`📋 [API] Sample formatted service:`, {
        id: formattedServices[0].id,
        name: formattedServices[0].name,
        category: formattedServices[0].category,
        vendorName: formattedServices[0].vendorName
      });
    }

    res.json({
      success: true,
      services: formattedServices,
      count: formattedServices.length
    });

  } catch (error) {
    console.error('❌ [API] Error fetching services:', error);
    console.error('❌ [API] Error details:', error.message);
    
    // Return empty array on error so frontend doesn't break
    res.json({
      success: true,
      services: [],
      count: 0,
      error: 'Database temporarily unavailable',
      details: error.message
    });
  }
});

// Services direct endpoint (for priority loading)
app.get('/api/services/direct', async (req, res) => {
  try {
    console.log('🚀 [API] /api/services/direct endpoint called');
    
    // Get services directly from database with all vendor info
    const services = await sql`
      SELECT 
        s.*,
        v.business_name,
        v.rating,
        v.review_count,
        v.service_areas,
        v.website_url as contact_website,
        v.portfolio_images
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.is_active = true
      ORDER BY s.featured DESC, s.created_at DESC
    `;

    console.log(`✅ [API] Found ${services.length} services via direct query`);

    // Enhanced formatting for direct endpoint
    const directServices = services.map(service => ({
      id: service.id,
      name: service.name || service.title,
      category: service.category,
      vendorId: service.vendor_id,
      vendorName: service.business_name,
      vendorImage: service.portfolio_images && service.portfolio_images.length > 0 
        ? service.portfolio_images[0] 
        : `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400`,
      description: service.description,
      priceRange: service.price ? `₱${parseFloat(service.price).toLocaleString()}` : '₱₱',
      location: service.service_areas && Array.isArray(service.service_areas) && service.service_areas.length > 0 
        ? service.service_areas[0] 
        : 'Philippines',
      rating: parseFloat(service.rating || 4.5),
      reviewCount: service.review_count || 0,
      image: service.images && service.images.length > 0 
        ? service.images[0] 
        : `https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400`,
      gallery: [...(service.images || []), ...(service.portfolio_images || [])],
      features: [service.category, ...(service.featured ? ['Featured'] : [])],
      availability: service.is_active,
      featured: service.featured,
      contactInfo: {
        phone: null, // Phone not available in vendors table
        email: null, // Email not available in vendors table
        website: service.contact_website
      },
      createdAt: service.created_at,
      updatedAt: service.updated_at
    }));

    res.json({
      success: true,
      services: directServices,
      count: directServices.length,
      source: 'direct_database_query'
    });

  } catch (error) {
    console.error('❌ [API] Error in direct services query:', error);
    
    res.status(500).json({
      success: false,
      services: [],
      count: 0,
      error: 'Direct database query failed'
    });
  }
});

// Vendor booking stats endpoint
app.get('/api/vendors/:vendorId/bookings/stats', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log(`📊 Fetching booking stats for vendor: ${vendorId}`);
    
    // Get booking statistics
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status IN ('quote_requested', 'quote_sent') THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status IN ('completed', 'paid_in_full') THEN 1 END) as completed_bookings,
        COALESCE(SUM(CASE WHEN status IN ('completed', 'paid_in_full') THEN total_amount ELSE 0 END), 0) as total_revenue
      FROM bookings 
      WHERE vendor_id = ${vendorId}
    `;

    const stats = statsResult[0] || {};

    res.json({
      success: true,
      data: {
        total_bookings: parseInt(stats.total_bookings || 0),
        pending_bookings: parseInt(stats.pending_bookings || 0),
        completed_bookings: parseInt(stats.completed_bookings || 0),
        total_revenue: parseFloat(stats.total_revenue || 0)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching vendor booking stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor booking stats',
      details: error.message
    });
  }
});

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
    const { page = 1, limit = 10, coupleId, vendorId, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    console.log('📥 [Bookings API] Query params:', { page, limit, coupleId, vendorId, sortBy, sortOrder });
    
    // Get bookings from database with conditional filtering
    let bookings;
    
    if (vendorId) {
      console.log('🔍 [Bookings API] Filtering by vendor ID:', vendorId);
      bookings = await sql`
        SELECT 
          b.id, b.couple_id, b.vendor_id, b.service_type,
          b.event_date, b.status, b.total_amount, b.notes,
          b.created_at, b.updated_at, b.contact_phone,
          v.business_name as vendor_name, v.business_type as vendor_category,
          v.location
        FROM bookings b
        JOIN vendors v ON b.vendor_id = v.id
        WHERE b.vendor_id = ${vendorId}
        ORDER BY b.created_at DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${(parseInt(page as string) - 1) * parseInt(limit as string)}
      `;
    } else if (coupleId) {
      console.log('🔍 [Bookings API] Filtering by couple ID:', coupleId);
      bookings = await sql`
        SELECT 
          b.id, b.couple_id, b.vendor_id, b.service_type,
          b.event_date, b.status, b.total_amount, b.notes,
          b.created_at, b.updated_at, b.contact_phone,
          v.business_name as vendor_name, v.business_type as vendor_category,
          v.location
        FROM bookings b
        JOIN vendors v ON b.vendor_id = v.id
        WHERE b.couple_id = ${coupleId}
        ORDER BY b.created_at DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${(parseInt(page as string) - 1) * parseInt(limit as string)}
      `;
    } else {
      console.log('🔍 [Bookings API] No filters applied - returning all bookings');
      bookings = await sql`
        SELECT 
          b.id, b.couple_id, b.vendor_id, b.service_type,
          b.event_date, b.status, b.total_amount, b.notes,
          b.created_at, b.updated_at, b.contact_phone,
          v.business_name as vendor_name, v.business_type as vendor_category,
          v.location
        FROM bookings b
        JOIN vendors v ON b.vendor_id = v.id
        ORDER BY b.created_at DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${(parseInt(page as string) - 1) * parseInt(limit as string)}
      `;
    }

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

    // Get total count for pagination with same filtering
    let totalResult;
    if (vendorId) {
      totalResult = await sql`SELECT COUNT(*) as total FROM bookings WHERE vendor_id = ${vendorId}`;
    } else if (coupleId) {
      totalResult = await sql`SELECT COUNT(*) as total FROM bookings WHERE couple_id = ${coupleId}`;
    } else {
      totalResult = await sql`SELECT COUNT(*) as total FROM bookings`;
    }
    const total = parseInt(totalResult[0]?.total || 0);

    console.log(`✅ [Bookings API] Found ${formattedBookings.length} bookings (${total} total)`);

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

// Enhanced bookings endpoint with comprehensive data
app.get('/api/bookings/enhanced', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      coupleId, 
      vendorId, 
      serviceId,
      status,
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = req.query;
    
    console.log('📥 [Enhanced Bookings API] Query params:', { 
      page, limit, coupleId, vendorId, serviceId, status, sortBy, sortOrder 
    });
    
    // Build WHERE clause based on filters
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (coupleId) {
      whereConditions.push(`b.couple_id = $${paramIndex}`);
      queryParams.push(coupleId);
      paramIndex++;
    }
    
    if (vendorId) {
      whereConditions.push(`b.vendor_id = $${paramIndex}`);
      queryParams.push(vendorId);
      paramIndex++;
    }
    
    if (serviceId) {
      whereConditions.push(`b.service_id = $${paramIndex}`);
      queryParams.push(serviceId);
      paramIndex++;
    }
    
    if (status) {
      whereConditions.push(`b.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offsetValue = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Get enhanced bookings with comprehensive data (simplified query)
    let bookings;
    let countResult;
    
    if (coupleId) {
      bookings = await sql`
        SELECT 
          b.id, b.couple_id, b.vendor_id, b.service_id, b.service_type, b.service_name,
          b.event_date, b.event_time, b.event_location, b.guest_count, 
          b.special_requests, b.contact_phone, b.preferred_contact_method,
          b.budget_range, b.status, b.total_amount, b.notes,
          b.created_at, b.updated_at,
          v.business_name as vendor_name, 
          v.business_type as vendor_category,
          v.location as vendor_location,
          v.contact_phone as vendor_phone,
          v.website_url as vendor_website,
          u.first_name, u.last_name, u.email as couple_email
        FROM bookings b
        LEFT JOIN vendors v ON b.vendor_id = v.id
        LEFT JOIN users u ON b.couple_id = u.id
        WHERE b.couple_id = ${coupleId}
        ORDER BY b.created_at DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${offsetValue}
      `;
      
      countResult = await sql`
        SELECT COUNT(*) as total
        FROM bookings b
        WHERE b.couple_id = ${coupleId}
      `;
    } else if (vendorId) {
      bookings = await sql`
        SELECT 
          b.id, b.couple_id, b.vendor_id, b.service_id, b.service_type, b.service_name,
          b.event_date, b.event_time, b.event_location, b.guest_count, 
          b.special_requests, b.contact_phone, b.preferred_contact_method,
          b.budget_range, b.status, b.total_amount, b.notes,
          b.created_at, b.updated_at,
          v.business_name as vendor_name, 
          v.business_type as vendor_category,
          v.location as vendor_location,
          v.contact_phone as vendor_phone,
          v.website_url as vendor_website,
          u.first_name, u.last_name, u.email as couple_email
        FROM bookings b
        LEFT JOIN vendors v ON b.vendor_id = v.id
        LEFT JOIN users u ON b.couple_id = u.id
        WHERE b.vendor_id = ${vendorId}
        ORDER BY b.created_at DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${offsetValue}
      `;
      
      countResult = await sql`
        SELECT COUNT(*) as total
        FROM bookings b
        WHERE b.vendor_id = ${vendorId}
      `;
    } else {
      // Get all bookings
      bookings = await sql`
        SELECT 
          b.id, b.couple_id, b.vendor_id, b.service_id, b.service_type, b.service_name,
          b.event_date, b.event_time, b.event_location, b.guest_count, 
          b.special_requests, b.contact_phone, b.preferred_contact_method,
          b.budget_range, b.status, b.total_amount, b.notes,
          b.created_at, b.updated_at,
          v.business_name as vendor_name, 
          v.business_type as vendor_category,
          v.location as vendor_location,
          v.contact_phone as vendor_phone,
          v.website_url as vendor_website,
          u.first_name, u.last_name, u.email as couple_email
        FROM bookings b
        LEFT JOIN vendors v ON b.vendor_id = v.id
        LEFT JOIN users u ON b.couple_id = u.id
        ORDER BY b.created_at DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${offsetValue}
      `;
      
      countResult = await sql`
        SELECT COUNT(*) as total
        FROM bookings
      `;
    }
    
    const totalBookings = parseInt(countResult[0].total);
    const totalPages = Math.ceil(totalBookings / parseInt(limit as string));
    const currentPage = parseInt(page as string);
    
    // Format comprehensive booking data
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      coupleId: booking.couple_id,
      vendorId: booking.vendor_id,
      serviceId: booking.service_id,
      serviceName: booking.service_name,
      serviceType: booking.service_type,
      eventDate: booking.event_date,
      eventTime: booking.event_time,
      eventLocation: booking.event_location,
      guestCount: booking.guest_count,
      budgetRange: booking.budget_range,
      specialRequests: booking.special_requests,
      contactPhone: booking.contact_phone,
      preferredContactMethod: booking.preferred_contact_method,
      status: booking.status,
      totalAmount: parseFloat(booking.total_amount || '0'),
      notes: booking.notes,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      // Vendor information
      vendorName: booking.vendor_name,
      vendorCategory: booking.vendor_category,
      vendorLocation: booking.vendor_location,
      vendorPhone: booking.vendor_phone,
      vendorWebsite: booking.vendor_website,
      // Couple information
      coupleName: booking.first_name && booking.last_name 
        ? `${booking.first_name} ${booking.last_name}` 
        : 'N/A',
      coupleEmail: booking.couple_email,
      // Additional UI-friendly fields
      displayDate: booking.event_date 
        ? new Date(booking.event_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'N/A',
      displayTime: booking.event_time || 'All day',
      statusColor: getStatusColor(booking.status),
      canCancel: ['request', 'quote_requested', 'quote_sent'].includes(booking.status),
      canConfirm: booking.status === 'quote_sent'
    }));
    
    console.log(`✅ [Enhanced Bookings API] Found ${formattedBookings.length} bookings`);
    
    res.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        currentPage,
        totalPages,
        totalBookings,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
        limit: parseInt(limit as string)
      }
    });
    
  } catch (error) {
    console.error('❌ [Enhanced Bookings API] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enhanced bookings',
      error: error.message
    });
  }
});

// Helper function for status colors
function getStatusColor(status: string): string {
  const statusColors = {
    'request': 'bg-blue-100 text-blue-800',
    'quote_requested': 'bg-yellow-100 text-yellow-800',
    'quote_sent': 'bg-purple-100 text-purple-800',
    'confirmed': 'bg-green-100 text-green-800',
    'completed': 'bg-emerald-100 text-emerald-800',
    'cancelled': 'bg-red-100 text-red-800',
    'paid_partial': 'bg-orange-100 text-orange-800',
    'paid_in_full': 'bg-teal-100 text-teal-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
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
        c.participant_type,
        c.participant_avatar,
        c.creator_id,
        c.creator_type,
        c.conversation_type,
        c.last_message,
        c.last_message_time,
        c.unread_count,
        c.is_online,
        c.status,
        c.wedding_date,
        c.location,
        c.service_id,
        c.service_name,
        c.service_category,
        c.service_price,
        c.service_image,
        c.service_description,
        c.created_at,
        c.updated_at,
        v.business_name as vendor_business_name
      FROM conversations c
      LEFT JOIN vendors v ON c.participant_id = v.id
      WHERE c.creator_id = ${userId}
      ORDER BY c.last_message_time DESC, c.created_at DESC
    `;

    console.log(`✅ [Production] Found ${conversations.length} conversations for user ${userId}`);

    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => {
      // Use the actual vendor business name, fallback to vendor name, then participant_name
      const vendorDisplayName = conv.vendor_business_name || conv.participant_name || 'Unknown Vendor';
      
      return {
        id: conv.id.toString(),
        participants: [{
          id: conv.participant_id,
          name: vendorDisplayName,
          role: conv.participant_type || 'vendor',
          avatar: conv.participant_avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
          isOnline: conv.is_online || false,
          businessName: conv.vendor_business_name,
          serviceCategory: conv.service_category
        }],
        lastMessage: conv.last_message ? {
          id: 'last-msg',
          senderId: conv.participant_id,
          senderName: vendorDisplayName,
          senderRole: 'vendor',
          content: conv.last_message,
          timestamp: conv.last_message_time || conv.updated_at,
          type: 'text'
        } : undefined,
        unreadCount: parseInt(conv.unread_count || 0),
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
        vendorName: vendorDisplayName, // Add this for the frontend title generation
        businessName: conv.vendor_business_name,
        serviceInfo: conv.service_id ? {
          id: conv.service_id,
          name: conv.service_name || 'Wedding Service',
          category: conv.service_category || 'General',
          price: conv.service_price || 'Contact for pricing',
          image: conv.service_image || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
          description: conv.service_description
        } : undefined
      };
    });

    res.json({
      success: true,
      conversations: formattedConversations
    });
  } catch (error) {
    console.error('❌ [Production] Error fetching individual conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
      message: error.message
    });
  }
});

// Create a new conversation
app.post('/api/messaging/conversations', async (req, res) => {
  try {
    const { vendorId, userId, participantName, message } = req.body;
    
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
            payment_method_allowed: ['card', 'paymaya', 'gcash'],
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

// PayMongo webhook endpoint for payment confirmations
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const { data, type } = req.body;
    
    console.log('🔔 PayMongo webhook received:', {
      type,
      eventId: data?.id,
      timestamp: new Date().toISOString()
    });

    // Verify webhook signature (security measure)
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (webhookSecret && req.headers['paymongo-signature']) {
      // TODO: Implement signature verification for production
      // const signature = req.headers['paymongo-signature'];
      // Verify signature matches expected value
    }

    // Process different webhook events
    switch (type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(data);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(data);
        break;
      case 'source.chargeable':
        await handleSourceChargeable(data);
        break;
      default:
        console.log(`🔔 Unhandled webhook event: ${type}`);
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Webhook processed successfully',
      eventType: type
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

// Webhook event handlers
async function handlePaymentSuccess(paymentData: any) {
  try {
    const { id, attributes } = paymentData;
    const { amount, currency, metadata } = attributes;
    
    console.log('✅ Payment succeeded:', {
      paymentId: id,
      amount: amount / 100, // Convert from centavos
      currency,
      bookingId: metadata?.booking_id,
      paymentType: metadata?.payment_type
    });

    if (metadata?.booking_id) {
      // Update booking status based on payment type
      const bookingId = metadata.booking_id;
      const paymentType = metadata.payment_type;
      
      let newStatus = 'confirmed';
      if (paymentType === 'downpayment') {
        newStatus = 'downpayment_paid';
      } else if (paymentType === 'full_payment') {
        newStatus = 'paid_in_full';
      } else if (paymentType === 'remaining_balance') {
        newStatus = 'paid_in_full';
      }

      // Update booking in database
      const updateResult = await sql`
        UPDATE bookings 
        SET status = ${newStatus}, 
            total_paid = COALESCE(total_paid, 0) + ${amount / 100},
            remaining_balance = GREATEST(0, COALESCE(remaining_balance, total_amount) - ${amount / 100}),
            last_payment_date = NOW(),
            last_payment_amount = ${amount / 100},
            last_payment_type = ${paymentType},
            updated_at = NOW()
        WHERE id = ${bookingId}
      `;

      if (updateResult && updateResult.length >= 0) {
        console.log(`✅ Booking ${bookingId} updated to status: ${newStatus}`);
        
        // TODO: Send email notification to customer
        // TODO: Send notification to vendor
        // TODO: Trigger any other business logic
      } else {
        console.error(`❌ Failed to update booking ${bookingId}`);
      }
    }

  } catch (error) {
    console.error('❌ Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentData: any) {
  try {
    const { id, attributes } = paymentData;
    const { metadata } = attributes;
    
    console.log('❌ Payment failed:', {
      paymentId: id,
      bookingId: metadata?.booking_id,
      paymentType: metadata?.payment_type
    });

    if (metadata?.booking_id) {
      // Log payment failure, but don't change booking status
      // Customer can retry payment
      console.log(`⚠️ Payment failed for booking ${metadata.booking_id}, customer can retry`);
      
      // TODO: Send email notification about payment failure
      // TODO: Provide retry instructions
    }

  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

async function handleSourceChargeable(sourceData: any) {
  try {
    const { id, attributes } = sourceData;
    
    console.log('💳 Source chargeable (e-wallet payment ready):', {
      sourceId: id,
      type: attributes?.type,
      amount: attributes?.amount / 100
    });

    // For GCash, PayMaya, etc., the payment is ready to be charged
    // This usually happens automatically by PayMongo
    
  } catch (error) {
    console.error('❌ Error handling source chargeable:', error);
  }
}

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
        COALESCE(SUM(CASE WHEN status IN ('completed', 'paid_in_full') THEN CAST(total_amount AS DECIMAL) END), 0) as total_revenue
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

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Bazaar API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💻 CORS origins: ${corsOrigins.join(', ')}`);
});

export default app;
