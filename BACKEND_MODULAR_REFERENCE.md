# Wedding Bazaar - Backend Modular Architecture Reference

## 📋 Backend Structure Overview

### 🏗️ Modular Design Pattern
The Wedding Bazaar backend follows a modular microservices architecture pattern, where each functional domain is separated into its own module with dedicated routes, middleware, and business logic.

---

## 📁 Complete Backend File Structure

```
backend-deploy/
├── 🚀 Entry Points
│   ├── index.js                    # Main production server (compiled TypeScript)
│   ├── app.ts                      # Express app configuration (TypeScript source)
│   └── server-modular.cjs         # Modular server implementation
│
├── ⚙️ Configuration
│   ├── config/
│   │   └── database.cjs           # Neon PostgreSQL configuration
│   └── .env.production            # Production environment variables
│
├── 🛣️ Route Modules
│   ├── routes/
│   │   ├── auth.cjs               # 🔐 Authentication & JWT management
│   │   ├── bookings.cjs           # 📋 Booking CRUD & status management
│   │   ├── vendors.cjs            # 🏪 Vendor profiles & management
│   │   ├── services.cjs           # 🛍️ Service catalog management
│   │   ├── conversations.cjs      # 💬 Conversation management
│   │   ├── messages.cjs           # 📨 Message operations
│   │   ├── notifications.cjs      # 🔔 Real-time notifications
│   │   ├── payments.cjs           # 💳 Payment processing
│   │   ├── receipts.cjs           # 🧾 Receipt management
│   │   └── debug.cjs              # 🔧 Debug & development utilities
│
├── 🛡️ Middleware
│   ├── auth-middleware.cjs        # JWT verification middleware
│   ├── cors-middleware.cjs        # CORS configuration
│   └── error-middleware.cjs       # Global error handling
│
├── 🔧 Utilities
│   ├── utils/
│   │   ├── password-utils.cjs     # bcrypt password handling
│   │   ├── jwt-utils.cjs          # JWT token utilities
│   │   ├── validation-utils.cjs   # Input validation helpers
│   │   └── response-utils.cjs     # Standardized API responses
│
└── 🧪 Development Tools
    ├── check-*.cjs               # Database schema verification scripts
    ├── debug-*.cjs              # Debug and troubleshooting scripts
    └── test-*.html              # API testing interfaces
```

---

## 🔐 Authentication Module (`routes/auth.cjs`)

### **Core Functionality**
- JWT-based authentication with secure token generation
- bcrypt password hashing with 12 salt rounds
- User login/logout workflow
- Token verification for protected routes

### **Endpoints**
```javascript
POST /api/auth/login    // User authentication
POST /api/auth/verify   // Token validation
```

### **Key Features**
```javascript
// Secure password comparison
const isValidPassword = await bcrypt.compare(password, user.password);

// JWT token generation
const token = jwt.sign(
  { userId: user.id, email: user.email, userType: user.user_type },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Comprehensive logging for security auditing
console.log('🔐 Login attempt:', { email, timestamp: new Date().toISOString() });
```

---

## 📋 Booking Management Module (`routes/bookings.cjs`)

### **Core Functionality**
- Complete booking lifecycle management
- Status tracking with enhanced workflow states
- Payment integration and tracking
- Vendor-client booking correlation

### **Endpoints**
```javascript
// Booking Retrieval
GET  /api/bookings/vendor/:vendorId          // Vendor's bookings
GET  /api/bookings/user/:userId              // User's bookings  
GET  /api/bookings/couple/:userId            // Couple's bookings
GET  /api/bookings/enhanced                  // Enhanced booking data
GET  /api/bookings/stats                     // Booking statistics

// Booking Operations
POST /api/bookings                           // Create new booking
PUT  /api/bookings/:id/update-status         // Update booking status
PUT  /api/bookings/:id/accept-quote          // Accept vendor quote
PUT  /api/bookings/:id/process-payment       // Process payment
GET  /api/bookings/:id/payment-status        // Payment status check
```

### **Enhanced Status Workflow**
```javascript
const BOOKING_STATUSES = [
  'pending',         // Initial inquiry
  'quote_requested', // Quote formally requested
  'quote_sent',      // Vendor sent quote
  'quote_accepted',  // Client accepted quote
  'quote_rejected',  // Client rejected quote
  'confirmed',       // Booking confirmed
  'downpayment_paid',// Deposit received
  'in_progress',     // Service in progress
  'completed',       // Service completed
  'paid_in_full',    // Full payment received
  'cancelled',       // Booking cancelled
  'refunded',        // Payment refunded
  'disputed'         // Dispute raised
];
```

### **Security Implementation**
```javascript
// Vendor data isolation
const vendorBookings = await sql`
  SELECT * FROM bookings 
  WHERE vendor_id = ${vendorId}
  ORDER BY created_at DESC
`;

// Input validation
if (!vendorId || !coupleId || !eventDate || !totalAmount) {
  return res.status(400).json({
    success: false,
    error: 'Required fields missing'
  });
}
```

---

## 🏪 Vendor Management Module (`routes/vendors.cjs`)

### **Core Functionality**
- Vendor profile management
- Service offerings management
- Featured vendor selection
- Rating and review aggregation

### **Endpoints**
```javascript
GET  /api/vendors                    // List all vendors
GET  /api/vendors/featured          // Featured vendors for homepage
GET  /api/vendors/:id               // Vendor profile details
GET  /api/vendors/:id/services      // Vendor's service offerings
POST /api/vendors                   // Create vendor profile
PUT  /api/vendors/:id               // Update vendor profile
```

### **Featured Vendor Logic**
```javascript
// Returns top-rated, verified vendors for homepage display
const featuredVendors = await sql`
  SELECT 
    id,
    business_name as name,
    category,
    rating,
    review_count,
    location,
    description,
    verified
  FROM vendors 
  WHERE verified = true 
    AND rating >= 4.0
  ORDER BY rating DESC, review_count DESC 
  LIMIT 6
`;
```

---

## 🛍️ Service Management Module (`routes/services.cjs`)

### **Core Functionality**
- Service catalog management
- Category-based organization
- Pricing and availability tracking
- Service-vendor correlation

### **Endpoints**
```javascript
GET    /api/services                   // All services
GET    /api/services/vendor/:vendorId  // Vendor's services
POST   /api/services                   // Create service
PUT    /api/services/:id               // Update service
DELETE /api/services/:id               // Delete service
```

### **Service Categories**
```javascript
const SERVICE_CATEGORIES = [
  'Photography & Videography',
  'Catering & Food Services',
  'Venue & Location',
  'Music & Entertainment',
  'Flowers & Decoration',
  'Wedding Planning',
  'Transportation',
  'Beauty & Styling',
  'Clothing & Accessories',
  'Documentation'
];
```

---

## 💬 Messaging System (`routes/conversations.cjs`, `routes/messages.cjs`)

### **Core Functionality**
- Real-time messaging between vendors and clients
- Conversation threading
- Message read/unread tracking
- File attachment support

### **Conversation Endpoints**
```javascript
GET  /api/conversations/:userId              // User's conversations
POST /api/conversations                      // Create conversation
GET  /api/conversations/:id/messages         // Conversation messages
POST /api/conversations/:id/messages         // Send message
```

### **Message Structure**
```javascript
const message = {
  id: messageId,
  conversation_id: conversationId,
  sender_id: senderId,
  content: messageContent,
  message_type: 'text', // 'text', 'image', 'file', 'system'
  read_at: null,
  created_at: new Date().toISOString()
};
```

---

## 🔔 Notification System (`routes/notifications.cjs`)

### **Core Functionality**
- Real-time notification delivery
- Role-based notification targeting
- Notification read/unread tracking
- Priority and categorization

### **Endpoints**
```javascript
GET   /api/notifications/vendor/:vendorId    // Vendor notifications
GET   /api/notifications/user/:userId        // User notifications
POST  /api/notifications                     // Create notification
PATCH /api/notifications/:id/read            // Mark as read
```

### **Notification Types**
```javascript
const NOTIFICATION_TYPES = {
  BOOKING_INQUIRY: 'booking_inquiry',      // New booking request
  QUOTE_ACCEPTED: 'quote_accepted',        // Quote accepted by client
  PAYMENT_RECEIVED: 'payment_received',    // Payment confirmation
  MESSAGE_RECEIVED: 'message_received',    // New message
  REVIEW_RECEIVED: 'review_received',      // New review/rating
  SYSTEM_UPDATE: 'system_update'           // Platform updates
};
```

---

## 💳 Payment Processing Module (`routes/payments.cjs`)

### **Core Functionality**
- Secure payment processing
- Payment intent management
- Webhook handling for payment confirmations
- Receipt generation and tracking

### **Endpoints**
```javascript
POST /api/payments/create-source            // Create payment source
GET  /api/payments/source/:sourceId         // Get payment source
POST /api/payments/create-payment-intent    // Create payment intent
GET  /api/payments/payment-intent/:intentId // Get payment intent status
POST /api/payments/webhook                  // Payment webhooks
GET  /api/payments/health                   // Payment system health
```

### **Payment Workflow**
```javascript
// Payment intent creation with booking correlation
const paymentIntent = {
  id: intentId,
  booking_id: bookingId,
  amount: totalAmount,
  currency: 'PHP',
  status: 'requires_payment_method',
  client_secret: clientSecret,
  created_at: new Date().toISOString()
};
```

---

## 🗄️ Database Configuration (`config/database.cjs`)

### **Neon PostgreSQL Setup**
```javascript
const { neon } = require('@neondatabase/serverless');

// Serverless connection with automatic scaling
const sql = neon(process.env.DATABASE_URL);

// Connection health monitoring
const testConnection = async () => {
  try {
    const result = await sql`SELECT NOW() as timestamp, version() as version`;
    return {
      connected: true,
      timestamp: result[0].timestamp,
      version: result[0].version.split(' ')[0]
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};
```

### **Connection Features**
- **Serverless**: Automatic scaling based on demand
- **SSL**: Secure connections in production
- **Pooling**: Efficient connection management
- **Health Monitoring**: Continuous connectivity verification

---

## 🛡️ Security Middleware

### **Authentication Middleware**
```javascript
// JWT verification for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};
```

### **CORS Configuration**
```javascript
const corsOptions = {
  origin: [
    'https://weddingbazaarph.web.app',  // Production frontend
    'http://localhost:5173',            // Development frontend
    'http://localhost:3000'             // Alternative dev port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## 🔧 Utility Functions

### **Password Security**
```javascript
// Secure password hashing
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Password verification
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

### **Standardized API Responses**
```javascript
const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

const errorResponse = (error, statusCode = 500) => ({
  success: false,
  error: error.message || error,
  statusCode,
  timestamp: new Date().toISOString()
});
```

---

## 🚀 Deployment Configuration

### **Production Server Setup**
```javascript
// Main server entry point (index.js)
const app = require('./app');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Wedding Bazaar Backend running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📅 Started: ${new Date().toISOString()}`);
});
```

### **Health Monitoring**
```javascript
GET /api/health
Response: {
  "status": "OK",
  "timestamp": "2025-10-13T...",
  "database": "Connected",
  "environment": "production",
  "version": "2.6.0-PAYMENT-WORKFLOW-COMPLETE",
  "uptime": 7678.321,
  "memory": { "rss": 109322240, "heapTotal": 24743936 },
  "endpoints": {
    "health": "Active",
    "auth": "Active", 
    "vendors": "Active",
    "bookings": "Active",
    "messages": "Active"
  }
}
```

---

## 📊 Performance Monitoring

### **Request Logging**
```javascript
// Morgan logging configuration
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 400
}));

// Custom request tracking
app.use((req, res, next) => {
  req.startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});
```

### **Error Handling**
```javascript
// Global error handler
app.use((error, req, res, next) => {
  console.error('💥 Server Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(error.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    timestamp: new Date().toISOString()
  });
});
```

---

**Backend Documentation Version**: 2.0  
**Last Updated**: October 13, 2025  
**Backend Status**: ✅ Production Ready  
**Deployment**: ✅ Live on Render  
**Database**: ✅ Neon PostgreSQL Connected
