import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',      // Vite dev server
      'http://localhost:5174',      // Alternative Vite port
      'http://127.0.0.1:5173',      // IPv4 localhost
      'http://localhost:3000',      // React dev server
      'https://weddingbazaar-web.web.app',
      'https://weddingbazaar-web.firebaseapp.com'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('🔍 CORS: Request with no origin - allowing');
      return callback(null, true);
    }
    
    console.log('🔍 CORS: Checking origin:', origin);
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('⚠️ CORS: Unknown origin, allowing for development:', origin);
      callback(null, true); // Allow all origins during development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with', 'Cache-Control', 'Accept', 'Origin'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Handle preflight requests explicitly
app.options('*', cors());

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} from ${req.get('origin') || 'no-origin'}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Emergency services endpoint - Direct database query
app.get('/api/services/emergency', async (req, res) => {
  try {
    console.log('🚨 Emergency services endpoint called');
    const result = await pool.query('SELECT * FROM services ORDER BY created_at DESC');
    console.log(`📊 Found ${result.rows.length} services in database`);
    
    const services = result.rows.map(row => ({
      id: row.id,
      name: row.title || row.name, // Use 'title' field as that's what exists in database
      category: row.category,
      price: row.price,
      description: row.description,
      rating: parseFloat(row.rating) || 4.5, // Default rating since most don't have ratings
      reviewCount: parseInt(row.review_count) || 0,
      location: row.location,
      imageUrl: row.image_url || (row.images && row.images.length > 0 ? row.images[0] : null),
      vendorId: row.vendor_id,
      isActive: row.is_active !== false,
      featured: row.featured || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      success: true,
      services,
      total: services.length,
      endpoint: 'emergency'
    });
  } catch (error) {
    console.error('❌ Emergency services error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch emergency services',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Basic services endpoint
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services WHERE is_active = true ORDER BY created_at DESC');
    const services = result.rows.map(row => ({
      id: row.id,
      name: row.title || row.name, // Use 'title' field as that's what exists in database
      category: row.category,
      price: row.price,
      description: row.description,
      rating: parseFloat(row.rating) || 4.5, // Default rating since most don't have ratings
      reviewCount: parseInt(row.review_count) || 0,
      location: row.location,
      imageUrl: row.image_url || (row.images && row.images.length > 0 ? row.images[0] : null),
      vendorId: row.vendor_id,
      isActive: row.is_active !== false,
      featured: row.featured || false
    }));

    res.json({
      success: true,
      services,
      total: services.length
    });
  } catch (error) {
    console.error('❌ Services error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch services',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Featured vendors endpoint
app.get('/api/vendors/featured', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        business_name as name,
        business_type as category,
        rating::numeric as rating,
        review_count,
        location,
        description,
        phone,
        email,
        website_url,
        years_experience,
        specialties,
        portfolio_images
      FROM vendors 
      WHERE is_active = true 
      ORDER BY rating DESC 
      LIMIT 6
    `);

    const vendors = result.rows.map(vendor => ({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      rating: parseFloat(vendor.rating) || 0,
      reviewCount: parseInt(vendor.review_count) || 0,
      location: vendor.location || 'Location not specified',
      description: vendor.description || 'Professional wedding services',
      phone: vendor.phone,
      email: vendor.email,
      website: vendor.website_url,
      yearsExperience: vendor.years_experience || 0,
      specialties: vendor.specialties || [],
      portfolioImages: vendor.portfolio_images || []
    }));

    res.json({
      success: true,
      vendors,
      total: vendors.length
    });
  } catch (error) {
    console.error('❌ Featured vendors error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch featured vendors',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Basic auth endpoints for testing
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);
    
    // Determine user role based on email for testing
    // You can modify this logic or add a role parameter
    let userRole = 'couple'; // Default to couple
    if (email.includes('vendor') || email.includes('business')) {
      userRole = 'vendor';
    } else if (email.includes('admin')) {
      userRole = 'admin';
    }
    
    console.log(`👤 Assigning role: ${userRole} for email: ${email}`);
    
    // For now, return a mock successful login with proper role structure
    // In production, you'd validate against the database
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 'mock-user-id',
        email: email,
        firstName: 'Test',
        lastName: 'User',
        role: userRole, // Changed from 'type' to 'role'
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        phone: '+1234567890',
        // Add vendor-specific fields if it's a vendor
        ...(userRole === 'vendor' && {
          businessName: 'Test Business',
          vendorId: 'mock-vendor-id'
        })
      },
      token: 'mock-jwt-token'
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    console.log('👤 Register attempt for:', email, 'with role:', role);
    
    // For now, return a mock successful registration
    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: 'mock-user-id',
        email: email,
        firstName: firstName || 'Test',
        lastName: lastName || 'User',
        role: role || 'couple', // Use provided role or default to couple
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        phone: '+1234567890',
        // Add vendor-specific fields if it's a vendor
        ...(role === 'vendor' && {
          businessName: 'New Business',
          vendorId: 'mock-new-vendor-id'
        })
      },
      token: 'mock-jwt-token'
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    console.log('🔍 Token verification for:', token?.substring(0, 20) + '...');
    
    // For now, return mock verification result
    if (token && token !== 'null' && token !== 'undefined') {
      res.json({
        success: true,
        authenticated: true,
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'couple', // Changed from 'type' to 'role' with correct value
          profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          phone: '+1234567890'
        }
      });
    } else {
      res.json({
        success: false,
        authenticated: false,
        message: 'Token not found or invalid'
      });
    }
  } catch (error) {
    console.error('❌ Token verification error:', error);
    res.status(500).json({
      success: false,
      authenticated: false,
      error: 'Verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Old database scan endpoint removed - using the corrected one below

// Database scan endpoint - Comprehensive database query
app.get('/api/database/scan', async (req, res) => {
  try {
    console.log('🔍 Database scan endpoint called');
    const result = await pool.query('SELECT * FROM services WHERE is_active = true ORDER BY created_at DESC');
    console.log(`📊 Database scan found ${result.rows.length} active services`);
    
    const services = result.rows.map(row => ({
      id: row.id,
      name: row.title || row.name, // Database uses 'title' field
      category: row.category,
      price: row.price,
      description: row.description,
      rating: 4.5, // Default rating since database doesn't have rating field
      reviewCount: 0,
      location: row.location,
      imageUrl: row.image_url || (row.images && row.images.length > 0 ? row.images[0] : null),
      vendorId: row.vendor_id,
      isActive: row.is_active !== false,
      featured: row.featured || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      success: true,
      services,
      total: services.length,
      endpoint: 'database-scan'
    });
  } catch (error) {
    console.error('❌ Database scan error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to scan database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions for category data
function getCategoryImage(category) {
  const categoryImages = {
    'Photography': 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600',
    'Videography': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600',
    'Catering': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
    'Venues': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
    'Flowers & Decor': 'https://images.unsplash.com/photo-1522673607200-164d1b6ce2d2?w=600',
    'Music & DJ': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    'Wedding Planning': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600',
    'Makeup & Hair': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600',
    'Transportation': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600',
    'Officiant': 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=600',
    'DJ': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    'other': 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=600'
  };

  return categoryImages[category] || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=600';
}

function getCategoryFeatures(category) {
  const features = {
    'Photography': ['Full Day Coverage', 'Same Day Edit', 'Pre-wedding Shoot', 'Digital Gallery'],
    'Videography': ['Cinematic Style', 'Drone Footage', 'Same Day Edit', 'Highlight Reel'],
    'Catering': ['Custom Menu', 'Professional Staff', 'Setup & Cleanup', 'Dietary Options'],
    'Venues': ['Indoor/Outdoor Options', 'Catering Kitchen', 'Parking', 'Bridal Suite'],
    'Flowers & Decor': ['Bridal Bouquet', 'Ceremony Decor', 'Reception Centerpieces', 'Seasonal Flowers'],
    'Music & DJ': ['Professional DJ', 'Sound System', 'LED Lighting', 'MC Services'],
    'Wedding Planning': ['Full Planning', 'Vendor Coordination', 'Timeline Management', 'Day-of Coordination'],
    'Makeup & Hair': ['Bridal Makeup', 'Hair Styling', 'Trial Session', 'Touch-up Kit'],
    'Transportation': ['Luxury Vehicles', 'Professional Chauffeur', 'Wedding Decoration', 'Multiple Cars'],
    'Officiant': ['Traditional Ceremonies', 'Custom Vows', 'Interfaith Services', 'Legal Documentation'],
    'DJ': ['Professional DJ', 'Sound System', 'LED Lighting', 'MC Services'],
    'other': ['Professional Service', 'Quality Guaranteed']
  };

  return features[category] || ['Professional Service', 'Quality Guaranteed'];
}

// Test database connection
async function testDatabaseConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);
    
    // Check services table
    const servicesResult = await pool.query('SELECT COUNT(*) FROM services');
    console.log(`📊 Services table has ${servicesResult.rows[0].count} rows`);
    
    // Check vendors table
    const vendorsResult = await pool.query('SELECT COUNT(*) FROM vendors');
    console.log(`🏪 Vendors table has ${vendorsResult.rows[0].count} rows`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

// =======================
// MESSAGING DATABASE SETUP
// =======================

// Initialize messaging tables
async function initializeMessagingTables() {
  try {
    console.log('🗄️ Initializing messaging database tables...');
    
    // Create conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(255) PRIMARY KEY,
        participant_1_id VARCHAR(255) NOT NULL,
        participant_1_name VARCHAR(255) NOT NULL,
        participant_1_role VARCHAR(50) NOT NULL,
        participant_1_avatar TEXT,
        participant_2_id VARCHAR(255) NOT NULL,
        participant_2_name VARCHAR(255) NOT NULL,
        participant_2_role VARCHAR(50) NOT NULL,
        participant_2_avatar TEXT,
        last_message_id VARCHAR(255),
        last_message_content TEXT,
        last_message_sender_id VARCHAR(255),
        last_message_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        participant_1_unread_count INTEGER DEFAULT 0,
        participant_2_unread_count INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(255) PRIMARY KEY,
        conversation_id VARCHAR(255) REFERENCES conversations(id),
        sender_id VARCHAR(255) NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        sender_role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        status VARCHAR(50) DEFAULT 'sent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    `);

    console.log('✅ Messaging tables initialized successfully');
    
    // Add some sample conversations if none exist
    const existingConversations = await pool.query('SELECT COUNT(*) FROM conversations');
    if (parseInt(existingConversations.rows[0].count) === 0) {
      await addSampleConversations();
    }

  } catch (error) {
    console.error('❌ Error initializing messaging tables:', error);
  }
}

// Add sample conversations for testing
async function addSampleConversations() {
  try {
    console.log('📝 Adding sample conversations...');
    
    // Sample conversation 1: Vendor to Couple
    const conv1Id = 'conv_' + Date.now() + '_001';
    await pool.query(`
      INSERT INTO conversations (
        id, participant_1_id, participant_1_name, participant_1_role, participant_1_avatar,
        participant_2_id, participant_2_name, participant_2_role, participant_2_avatar,
        last_message_content, last_message_sender_id, participant_2_unread_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      conv1Id, '2-2025-003', 'Beltran Sound Systems', 'vendor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      'couple_001', 'John & Sarah Miller', 'couple', 'https://images.unsplash.com/photo-1501108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      'Hi! We are interested in your DJ services for our wedding on June 15th, 2025. What packages do you offer?', 'couple_001', 1
    ]);

    // Add messages for conversation 1
    const msg1Id = 'msg_' + Date.now() + '_001';
    await pool.query(`
      INSERT INTO messages (id, conversation_id, sender_id, sender_name, sender_role, content) 
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [msg1Id, conv1Id, 'couple_001', 'John & Sarah Miller', 'couple', 'Hi! We are interested in your DJ services for our wedding on June 15th, 2025. What packages do you offer?']);

    const msg2Id = 'msg_' + Date.now() + '_002';
    await pool.query(`
      INSERT INTO messages (id, conversation_id, sender_id, sender_name, sender_role, content) 
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [msg2Id, conv1Id, '2-2025-003', 'Beltran Sound Systems', 'vendor', 'Thank you for your interest! I offer several DJ packages ranging from $1,200 to $2,500. Would you like me to send you the detailed pricing and what\'s included?']);

    // Sample conversation 2: Another couple
    const conv2Id = 'conv_' + Date.now() + '_002';
    await pool.query(`
      INSERT INTO conversations (
        id, participant_1_id, participant_1_name, participant_1_role, participant_1_avatar,
        participant_2_id, participant_2_name, participant_2_role, participant_2_avatar,
        last_message_content, last_message_sender_id, participant_1_unread_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      conv2Id, '2-2025-003', 'Beltran Sound Systems', 'vendor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      'couple_002', 'Mike & Emma Johnson', 'couple', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      'Perfect! We would love to book you for August 20th. What\'s the next step?', 'couple_002', 0
    ]);

    // Add messages for conversation 2
    const msg3Id = 'msg_' + Date.now() + '_003';
    await pool.query(`
      INSERT INTO messages (id, conversation_id, sender_id, sender_name, sender_role, content) 
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [msg3Id, conv2Id, 'couple_002', 'Mike & Emma Johnson', 'couple', 'Hi! We heard great things about your DJ services. Are you available for August 20th, 2025?']);

    const msg4Id = 'msg_' + Date.now() + '_004';
    await pool.query(`
      INSERT INTO messages (id, conversation_id, sender_id, sender_name, sender_role, content) 
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [msg4Id, conv2Id, '2-2025-003', 'Beltran Sound Systems', 'vendor', 'Yes, I\'m available on August 20th! I would love to be part of your special day. Let me send you my premium package details.']);

    const msg5Id = 'msg_' + Date.now() + '_005';
    await pool.query(`
      INSERT INTO messages (id, conversation_id, sender_id, sender_name, sender_role, content) 
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [msg5Id, conv2Id, 'couple_002', 'Mike & Emma Johnson', 'couple', 'Perfect! We would love to book you for August 20th. What\'s the next step?']);

    console.log('✅ Sample conversations added successfully');
    
  } catch (error) {
    console.error('❌ Error adding sample conversations:', error);
  }
}

// =======================
// MESSAGING API ENDPOINTS
// =======================

// Get conversations for vendor
app.get('/api/conversations/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log(`📱 Fetching conversations for vendor: ${vendorId}`);
    
    // Get conversations where this vendor is a participant
    const result = await pool.query(`
      SELECT * FROM conversations 
      WHERE participant_1_id = $1 OR participant_2_id = $1
      ORDER BY updated_at DESC
    `, [vendorId]);
    
    const conversations = result.rows.map(row => ({
      id: row.id,
      participantIds: [row.participant_1_id, row.participant_2_id],
      participants: [
        {
          id: row.participant_1_id,
          name: row.participant_1_name,
          role: row.participant_1_role,
          avatar: row.participant_1_avatar
        },
        {
          id: row.participant_2_id,
          name: row.participant_2_name,
          role: row.participant_2_role,
          avatar: row.participant_2_avatar
        }
      ],
      lastMessage: row.last_message_content ? {
        id: row.last_message_id,
        senderId: row.last_message_sender_id,
        content: row.last_message_content,
        timestamp: row.last_message_timestamp,
        type: 'text'
      } : null,
      unreadCount: row.participant_1_id === vendorId ? row.participant_1_unread_count : row.participant_2_unread_count,
      updatedAt: row.updated_at,
      status: row.status
    }));

    res.json({
      success: true,
      conversations: conversations
    });

  } catch (error) {
    console.error('❌ Error fetching vendor conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

// Get conversations for individual/couple
app.get('/api/conversations/individual/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📱 Fetching conversations for individual: ${userId}`);
    
    // For now, return mock conversations since we don't have a conversations table yet
    const mockConversations = [
      {
        id: 'conv_001',
        participantIds: [userId, 'vendor_001'],
        participants: [
          {
            id: userId,
            name: 'John & Sarah',
            role: 'couple',
            avatar: 'https://images.unsplash.com/photo-1501108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
          },
          {
            id: 'vendor_001',
            name: 'Perfect Weddings Photography',
            role: 'vendor',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
          }
        ],
        lastMessage: {
          id: 'msg_001',
          senderId: 'vendor_001',
          content: 'I would be happy to photograph your special day! Let me know your budget and preferences.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        },
        unreadCount: 1,
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: 'conv_002',
        participantIds: [userId, 'vendor_002'],
        participants: [
          {
            id: userId,
            name: 'John & Sarah',
            role: 'couple',
            avatar: 'https://images.unsplash.com/photo-1501108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
          },
          {
            id: 'vendor_002',
            name: 'Elegant Catering Co.',
            role: 'vendor',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
          }
        ],
        lastMessage: {
          id: 'msg_002',
          senderId: userId,
          content: 'Thank you for the quote! We will discuss it and get back to you soon.',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      }
    ];

    res.json({
      success: true,
      conversations: mockConversations
    });

  } catch (error) {
    console.error('❌ Error fetching individual conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

// Get messages for a specific conversation
app.get('/api/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log(`💬 Fetching messages for conversation: ${conversationId}`);
    
    // Fetch real messages from database
    const query = `
      SELECT 
        id,
        conversation_id as "conversationId",
        sender_id as "senderId", 
        sender_name as "senderName",
        sender_role as "senderRole",
        content,
        message_type as "type",
        is_read as "isRead",
        created_at as "timestamp"
      FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [conversationId]);
    
    const messages = result.rows.map(row => ({
      ...row,
      timestamp: row.timestamp.toISOString(),
      isRead: Boolean(row.isRead)
    }));

    console.log(`✅ Found ${messages.length} messages for conversation ${conversationId}`);

    res.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

// Send a message
app.post('/api/messages', async (req, res) => {
  try {
    const { conversationId, senderId, senderName, senderType, content, messageType = 'text' } = req.body;
    console.log(`💬 Sending message in conversation: ${conversationId} from ${senderName} (${senderType})`);
    
    if (!conversationId || !senderId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: conversationId, senderId, content'
      });
    }

    // Insert message into database
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const query = `
      INSERT INTO messages (
        id, conversation_id, sender_id, sender_name, sender_role, 
        content, message_type, is_read, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING 
        id,
        conversation_id as "conversationId",
        sender_id as "senderId",
        sender_name as "senderName", 
        sender_role as "senderRole",
        content,
        message_type as "type",
        is_read as "isRead",
        created_at as "timestamp"
    `;
    
    const result = await pool.query(query, [
      messageId,
      conversationId, 
      senderId,
      senderName || 'Unknown User',
      senderType || 'couple',
      content,
      messageType,
      true // sender's own message is read
    ]);

    const newMessage = result.rows[0];
    newMessage.timestamp = newMessage.timestamp.toISOString();
    newMessage.isRead = Boolean(newMessage.isRead);

    // Update conversation's updated_at timestamp
    await pool.query(
      'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
      [conversationId]
    );

    console.log(`✅ Message sent successfully: ${messageId}`);

    res.json({
      success: true,
      message: newMessage
    });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// RESTful messaging endpoints (for frontend compatibility)
// Send message to conversation
app.post('/api/messaging/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { senderId, senderName, senderType, content, messageType = 'text' } = req.body;
    console.log(`💬 [RESTful] Sending message in conversation: ${conversationId} from ${senderName} (${senderType})`);
    
    if (!senderId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: senderId, content'
      });
    }

    // Insert message into database
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const query = `
      INSERT INTO messages (
        id, conversation_id, sender_id, sender_name, sender_role, 
        content, message_type, is_read, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING 
        id,
        conversation_id as "conversationId",
        sender_id as "senderId",
        sender_name as "senderName", 
        sender_role as "senderRole",
        content,
        message_type as "type",
        is_read as "isRead",
        created_at as "timestamp"
    `;
    
    const result = await pool.query(query, [
      messageId,
      conversationId, 
      senderId,
      senderName || 'Unknown User',
      senderType || 'couple',
      content,
      messageType,
      true // sender's own message is read
    ]);

    const newMessage = result.rows[0];
    newMessage.timestamp = newMessage.timestamp.toISOString();
    newMessage.isRead = Boolean(newMessage.isRead);

    // Update conversation's updated_at timestamp
    await pool.query(
      'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
      [conversationId]
    );

    console.log(`✅ [RESTful] Message sent successfully: ${messageId}`);

    res.json({
      success: true,
      message: newMessage
    });

  } catch (error) {
    console.error('❌ [RESTful] Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// Get messages for conversation
app.get('/api/messaging/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log(`💬 [RESTful] Fetching messages for conversation: ${conversationId}`);
    
    // Fetch real messages from database
    const query = `
      SELECT 
        id,
        conversation_id as "conversationId",
        sender_id as "senderId", 
        sender_name as "senderName",
        sender_role as "senderRole",
        content,
        message_type as "type",
        is_read as "isRead",
        created_at as "timestamp"
      FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [conversationId]);
    
    const messages = result.rows.map(row => ({
      ...row,
      timestamp: row.timestamp.toISOString(),
      isRead: Boolean(row.isRead)
    }));

    console.log(`✅ [RESTful] Found ${messages.length} messages for conversation ${conversationId}`);

    res.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('❌ [RESTful] Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Bazaar Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  testDatabaseConnection();
});

export default app;
