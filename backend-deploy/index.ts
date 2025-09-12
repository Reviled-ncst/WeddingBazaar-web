import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

// Load environment variables
config();

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
    // Mock vendor data
    const mockVendors = [
      {
        id: 1,
        name: 'Elegant Photography Studios',
        category: 'Photography',
        location: 'Manila',
        rating: 4.8,
        reviewCount: 127,
        priceRange: '₱25,000 - ₱80,000',
        description: 'Professional wedding photography with artistic flair',
        image: '/api/placeholder/300/200',
        featured: true
      },
      {
        id: 2,
        name: 'Divine Catering Services',
        category: 'Catering',
        location: 'Quezon City',
        rating: 4.9,
        reviewCount: 89,
        priceRange: '₱800 - ₱1,500 per head',
        description: 'Exquisite culinary experiences for your special day',
        image: '/api/placeholder/300/200',
        featured: true
      }
    ];

    res.json({
      success: true,
      vendors: mockVendors
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors'
    });
  }
});

// Featured vendors endpoint
app.get('/api/vendors/featured', async (req, res) => {
  try {
    const featuredVendors = [
      {
        id: 1,
        name: 'Elegant Photography Studios',
        category: 'Photography',
        location: 'Manila',
        rating: 4.8,
        reviewCount: 127,
        priceRange: '₱25,000 - ₱80,000',
        description: 'Professional wedding photography with artistic flair',
        image: '/api/placeholder/300/200',
        specialties: ['Wedding Photography', 'Engagement Shoots', 'Pre-nup'],
        yearsExperience: 8
      },
      {
        id: 2,
        name: 'Divine Catering Services',
        category: 'Catering',
        location: 'Quezon City',
        rating: 4.9,
        reviewCount: 89,
        priceRange: '₱800 - ₱1,500 per head',
        description: 'Exquisite culinary experiences for your special day',
        image: '/api/placeholder/300/200',
        specialties: ['Filipino Cuisine', 'International Buffet', 'Custom Menus'],
        yearsExperience: 12
      }
    ];

    res.json({
      success: true,
      vendors: featuredVendors
    });
  } catch (error) {
    console.error('Error fetching featured vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured vendors'
    });
  }
});

// Vendor categories endpoint
app.get('/api/vendors/categories', async (req, res) => {
  try {
    const categories = [
      {
        id: 1,
        name: 'Photography',
        description: 'Capture your special moments',
        icon: '📸',
        vendorCount: 45
      },
      {
        id: 2,
        name: 'Catering',
        description: 'Delicious food for your guests',
        icon: '🍽️',
        vendorCount: 32
      },
      {
        id: 3,
        name: 'Venues',
        description: 'Perfect locations for your wedding',
        icon: '🏰',
        vendorCount: 28
      },
      {
        id: 4,
        name: 'Music & Entertainment',
        description: 'Keep the party going',
        icon: '🎵',
        vendorCount: 22
      },
      {
        id: 5,
        name: 'Flowers & Decoration',
        description: 'Beautiful floral arrangements',
        icon: '🌸',
        vendorCount: 38
      },
      {
        id: 6,
        name: 'Wedding Planning',
        description: 'Full-service wedding coordination',
        icon: '📋',
        vendorCount: 15
      }
    ];

    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor categories'
    });
  }
});

// Basic auth endpoints (mock)
app.post('/api/auth/login', async (req, res) => {
  const { email, password, userType } = req.body;
  
  // Mock authentication - for testing only
  if (email && password) {
    // Determine role based on email or userType parameter
    let role = 'couple'; // default
    if (userType === 'vendor' || email.includes('vendor') || email.includes('business')) {
      role = 'vendor';
    } else if (userType === 'admin' || email.includes('admin')) {
      role = 'admin';
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: '1',
        email: email,
        firstName: role === 'vendor' ? 'Business' : 'Test',
        lastName: role === 'vendor' ? 'Owner' : 'User', 
        role: role,
        profileImage: '',
        phone: ''
      },
      token: 'mock-jwt-token'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  // Mock registration - for testing only
  if (email && password && name) {
    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: Date.now().toString(),
        email: email,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ')[1] || '',
        role: 'couple',
        profileImage: '',
        phone: ''
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email, password, and name are required'
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

    // Mock token verification - for testing only
    // In production, you would verify the JWT token here
    if (token === 'mock-jwt-token' || token.startsWith('mock-')) {
      // For demo purposes, check if we have a vendor token or role indicator
      let role = 'couple';
      const authHeader = req.headers.authorization;
      if (authHeader && (authHeader.includes('vendor') || token.includes('vendor'))) {
        role = 'vendor';
      } else if (authHeader && (authHeader.includes('admin') || token.includes('admin'))) {
        role = 'admin';
      }

      res.json({
        success: true,
        user: {
          id: '1',
          email: role === 'vendor' ? 'vendor@example.com' : 'test@example.com',
          firstName: role === 'vendor' ? 'Business' : 'Test',
          lastName: role === 'vendor' ? 'Owner' : 'User',
          role: role,
          profileImage: '',
          phone: ''
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
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

// Booking endpoints - Mock data for individual user bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const { page = 1, limit = 10, coupleId, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    // Mock booking data
    const mockBookings = [
      {
        id: 1,
        vendorId: 1,
        vendorName: 'Elegant Photography Studios',
        vendorCategory: 'Photography',
        serviceType: 'Wedding Photography Package',
        bookingDate: '2025-10-15',
        eventDate: '2026-03-15',
        status: 'confirmed',
        amount: 75000,
        downPayment: 25000,
        remainingBalance: 50000,
        createdAt: '2025-09-01T10:00:00Z',
        updatedAt: '2025-09-10T15:30:00Z',
        location: 'Manila Cathedral',
        notes: 'Pre-wedding shoot included',
        contactPerson: 'John Cruz',
        contactPhone: '+63917-123-4567'
      },
      {
        id: 2,
        vendorId: 2,
        vendorName: 'Divine Catering Services',
        vendorCategory: 'Catering',
        serviceType: 'Full Wedding Reception Catering',
        bookingDate: '2025-09-15',
        eventDate: '2026-03-15',
        status: 'pending',
        amount: 150000,
        downPayment: 50000,
        remainingBalance: 100000,
        createdAt: '2025-09-15T14:20:00Z',
        updatedAt: '2025-09-15T14:20:00Z',
        location: 'Garden Resort Tagaytay',
        notes: '100 guests, includes setup and cleanup',
        contactPerson: 'Maria Santos',
        contactPhone: '+63917-987-6543'
      },
      {
        id: 3,
        vendorId: 3,
        vendorName: 'Paradise Garden Venue',
        vendorCategory: 'Venue',
        serviceType: 'Wedding Venue Rental',
        bookingDate: '2025-08-20',
        eventDate: '2026-03-15',
        status: 'confirmed',
        amount: 300000,
        downPayment: 100000,
        remainingBalance: 200000,
        createdAt: '2025-08-20T09:15:00Z',
        updatedAt: '2025-09-05T11:45:00Z',
        location: 'Tagaytay City',
        notes: 'Includes garden ceremony and reception hall',
        contactPerson: 'Roberto Garcia',
        contactPhone: '+63917-555-1234'
      }
    ];

    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedBookings = mockBookings.slice(startIndex, endIndex);

    res.json({
      success: true,
      bookings: paginatedBookings,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(mockBookings.length / parseInt(limit as string)),
        totalBookings: mockBookings.length,
        hasNext: endIndex < mockBookings.length,
        hasPrev: parseInt(page as string) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
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

// Services endpoint with detailed service information
app.get('/api/services', async (req, res) => {
  try {
    const mockServices = [
      {
        id: 1,
        name: 'Wedding Photography',
        category: 'Photography',
        description: 'Professional wedding photography services',
        icon: '📸',
        providers: [
          {
            id: 1,
            name: 'Elegant Photography Studios',
            rating: 4.8,
            reviewCount: 127,
            priceRange: '₱25,000 - ₱80,000',
            location: 'Manila',
            specialties: ['Wedding Photography', 'Engagement Shoots', 'Pre-nup'],
            yearsExperience: 8,
            image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
            gallery: [
              'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
              'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
              'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400'
            ]
          }
        ]
      },
      {
        id: 2,
        name: 'Wedding Catering',
        category: 'Catering',
        description: 'Delicious wedding catering services',
        icon: '🍽️',
        providers: [
          {
            id: 2,
            name: 'Divine Catering Services',
            rating: 4.9,
            reviewCount: 89,
            priceRange: '₱800 - ₱1,500 per head',
            location: 'Quezon City',
            specialties: ['Filipino Cuisine', 'International Buffet', 'Custom Menus'],
            yearsExperience: 12,
            image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
            gallery: [
              'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
              'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400'
            ]
          }
        ]
      },
      {
        id: 3,
        name: 'Wedding Venues',
        category: 'Venues',
        description: 'Beautiful wedding venues and locations',
        icon: '🏰',
        providers: [
          {
            id: 3,
            name: 'Paradise Garden Venue',
            rating: 4.9,
            reviewCount: 156,
            priceRange: '₱200,000 - ₱500,000',
            location: 'Tagaytay',
            specialties: ['Garden Ceremonies', 'Reception Halls', 'Overnight Stays'],
            yearsExperience: 15,
            image: 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
            gallery: [
              'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
              'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400',
              'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400'
            ]
          }
        ]
      }
    ];

    res.json({
      success: true,
      services: mockServices
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services'
    });
  }
});

// Vendor subscription endpoints
app.get('/api/subscriptions/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // Mock subscription data - Enterprise plan for demo
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
      updated_at: '2025-09-12T00:00:00Z',
      plan_name: 'Enterprise',
      plan_description: 'Full-featured enterprise plan for large wedding businesses',
      services_count: 8,
      portfolio_items_count: 45,
      monthly_bookings_count: 15,
      current_bookings_count: 8,
      monthly_messages_count: 75,
      video_call_minutes_used: 120,
      featured_listing_active: true,
      social_integrations_count: 5,
      api_calls_count: 2500,
      webhook_calls_count: 150,
      last_updated: '2025-09-12T15:30:00Z',
      max_services: 999, // Unlimited
      max_images_per_service: 999, // Unlimited
      max_gallery_images: 999, // Unlimited
      max_bookings_per_month: 999, // Unlimited
      includes_featured_listing: true,
      includes_custom_branding: true,
      includes_analytics: true
    };

    res.json({
      success: true,
      subscription: mockSubscription
    });
  } catch (error) {
    console.error('Error fetching vendor subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor subscription'
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
    
    // Mock conversation data
    const mockConversations = [
      {
        id: 'conv-1',
        vendorId: vendorId,
        vendorName: 'Elegant Photography Studios',
        serviceName: 'Wedding Photography Package',
        userId: 'user-1',
        userName: 'Maria Santos',
        userType: 'couple',
        lastMessage: {
          id: 'msg-1',
          content: 'Hi! I\'m interested in your wedding photography services for March 2024.',
          senderId: 'user-1',
          senderName: 'Maria Santos',
          senderType: 'couple',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          messageType: 'text',
          isRead: false
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 1
      },
      {
        id: 'conv-2',
        vendorId: vendorId,
        vendorName: 'Elegant Photography Studios',
        serviceName: 'Engagement Shoot',
        userId: 'user-2',
        userName: 'John & Sarah Cruz',
        userType: 'couple',
        lastMessage: {
          id: 'msg-2',
          content: 'Thank you for the beautiful engagement photos!',
          senderId: 'user-2',
          senderName: 'John & Sarah Cruz',
          senderType: 'couple',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          messageType: 'text',
          isRead: true
        },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        unreadCount: 0
      }
    ];

    res.json({
      success: true,
      conversations: mockConversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
});

// Create a new conversation
app.post('/api/messaging/conversations', async (req, res) => {
  try {
    const { conversationId, vendorId, vendorName, serviceName, userId, userName, userType } = req.body;
    
    // Mock conversation creation
    const newConversation = {
      id: conversationId,
      vendorId,
      vendorName,
      serviceName,
      userId,
      userName,
      userType,
      lastMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    
    // Mock messages data
    const mockMessages = [
      {
        id: 'msg-1',
        conversationId,
        content: 'Hi! I\'m interested in your wedding photography services for March 2024.',
        senderId: 'user-1',
        senderName: 'Maria Santos',
        senderType: 'couple',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        messageType: 'text',
        isRead: false
      },
      {
        id: 'msg-2',
        conversationId,
        content: 'Hello Maria! Thank you for your interest. I\'d be happy to help with your wedding photography. What date in March are you planning?',
        senderId: 'vendor-1',
        senderName: 'Elegant Photography Studios',
        senderType: 'vendor',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        messageType: 'text',
        isRead: true
      },
      {
        id: 'msg-3',
        conversationId,
        content: 'We\'re thinking March 15th, 2024. Could you share your packages and availability?',
        senderId: 'user-1',
        senderName: 'Maria Santos',
        senderType: 'couple',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        messageType: 'text',
        isRead: false
      }
    ];

    res.json({
      success: true,
      messages: mockMessages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// Send a new message
app.post('/api/messaging/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, senderId, senderName, senderType, messageType = 'text' } = req.body;
    
    // Mock message creation
    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      content,
      senderId,
      senderName,
      senderType,
      timestamp: new Date().toISOString(),
      messageType,
      isRead: false
    };

    res.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// Mark messages as read
app.put('/api/messaging/conversations/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    
    // Mock mark as read
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Bazaar API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
