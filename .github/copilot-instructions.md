# Wedding Bazaar Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Wedding Bazaar platform built with React, TypeScript, and Vite. The project is designed with micro frontends architecture in mind for scalability. The platform connects couples with wedding vendors and provides comprehensive wedding planning tools.

## Complete Project Structure

### Frontend Source Code (`src/`)
```
src/
├── pages/
│   ├── homepage/           # Main public marketing page
│   │   ├── components/     # Homepage-specific components
│   │   │   ├── Hero.tsx           # Main hero section
│   │   │   ├── Services.tsx       # Service categories showcase
│   │   │   ├── FeaturedVendors.tsx # Vendor highlights
│   │   │   └── Testimonials.tsx   # Customer testimonials
│   │   └── Homepage.tsx    # Main homepage component
│   ├── users/             # All user-specific pages organized by user type
│   │   ├── individual/    # Couple/Individual user pages
│   │   │   ├── dashboard/         # Personal dashboard
│   │   │   ├── services/          # Service browsing and discovery
│   │   │   │   ├── Services.tsx   # Service browsing page
│   │   │   │   └── index.ts       # Export file
│   │   │   ├── bookings/          # Booking management (PAYMENT + RECEIPT + CANCEL)
│   │   │   │   ├── IndividualBookings.tsx  # Main bookings page with actions
│   │   │   │   ├── components/    # Booking-specific components
│   │   │   │   │   ├── BookingDetailsModal.tsx
│   │   │   │   │   ├── QuoteDetailsModal.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── hooks/         # Custom hooks
│   │   │   │   │   └── useBookingPreferences.ts
│   │   │   │   ├── types/         # TypeScript types
│   │   │   │   │   └── booking.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── messages/          # Messaging with vendors
│   │   │   ├── profile/           # Profile management
│   │   │   └── landing/           # Individual user landing page
│   │   │       ├── IndividualLanding.tsx
│   │   │       ├── CoupleHeader.tsx
│   │   │       └── index.ts
│   │   ├── vendor/        # Vendor business pages
│   │   │   ├── dashboard/         # Vendor dashboard
│   │   │   ├── profile/           # Business profile management
│   │   │   ├── bookings/          # Booking management for vendors
│   │   │   │   ├── VendorBookings.tsx
│   │   │   │   └── index.ts
│   │   │   ├── messages/          # Client messaging
│   │   │   ├── analytics/         # Business analytics
│   │   │   └── landing/           # Vendor landing page
│   │   │       ├── VendorLanding.tsx
│   │   │       └── index.ts
│   │   └── admin/         # Admin management pages
│   │       ├── dashboard/         # Admin dashboard
│   │       ├── users/             # User management
│   │       ├── vendors/           # Vendor management
│   │       ├── bookings/          # System-wide booking management
│   │       │   ├── AdminBookings.tsx
│   │       │   └── index.ts
│   │       ├── analytics/         # Platform analytics
│   │       └── landing/           # Admin landing page
│   │           ├── AdminLanding.tsx
│   │           ├── AdminHeader.tsx
│   │           └── index.ts
│   ├── shared/            # Shared page components
│   │   ├── messenger/             # Messaging components
│   │   │   ├── FloatingChat.tsx
│   │   │   ├── FloatingChatButton.tsx
│   │   │   ├── Messenger.tsx
│   │   │   ├── useMessenger.ts
│   │   │   ├── useMessagingService.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── services/              # Shared service components
│   └── PayMongoTestPage.tsx      # Payment testing interface
├── shared/               # Global shared components, contexts, types
│   ├── components/
│   │   ├── layout/                # Headers, Footers, Navigation
│   │   │   ├── Header.tsx         # Main site header
│   │   │   ├── Footer.tsx         # Site footer
│   │   │   └── VendorHeader.tsx   # Vendor-specific header
│   │   ├── messaging/             # Global chat components
│   │   │   ├── GlobalFloatingChat.tsx
│   │   │   └── GlobalFloatingChatButton.tsx
│   │   ├── modals/                # Login, Register, and other modals
│   │   │   ├── LoginModal.tsx
│   │   │   ├── RegisterModal.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   └── PayMongoPaymentModal.tsx # Payment processing modal (REAL PAYMONGO)
│   ├── contexts/                  # React contexts
│   │   ├── AuthContext.tsx        # Authentication context
│   │   ├── HybridAuthContext.tsx  # Hybrid auth with user data
│   │   └── GlobalMessengerContext.tsx # Messaging context
│   ├── services/                  # API service files
│   │   ├── payment/
│   │   │   └── paymongoService.ts # PayMongo integration (REAL API)
│   │   └── bookingActionsService.ts # Receipt & cancellation services
│   ├── utils/                     # Utility functions
│   │   └── booking-data-mapping.ts # Booking data transformations
│   └── types/                     # TypeScript type definitions
│       ├── index.ts
│       ├── payment.ts             # Payment & receipt types
│       └── comprehensive-booking.types.ts # Unified booking types
├── services/             # API service layer
│   └── api/
│       └── CentralizedBookingAPI.ts # Centralized booking API calls
├── router/               # Application routing
│   ├── AppRouter.tsx             # Main router configuration
│   └── ProtectedRoute.tsx        # Route protection
├── utils/                # Utility functions
│   └── cn.ts                     # Classname utility
└── assets/              # Static assets
    └── react.svg
```

### Backend Deployment (`backend-deploy/`)
```
backend-deploy/
├── config/
│   └── database.cjs              # Neon PostgreSQL connection
├── routes/
│   ├── auth.cjs                  # Authentication endpoints
│   ├── bookings.cjs              # Booking CRUD + Cancellation endpoints
│   ├── payments.cjs              # PayMongo integration + Receipt endpoints
│   ├── vendors.cjs               # Vendor management
│   ├── services.cjs              # Service listings
│   └── admin.cjs                 # Admin operations
├── helpers/
│   └── receiptGenerator.cjs      # Receipt generation logic
├── middleware/
│   └��─ auth.cjs                  # JWT authentication middleware
├── production-backend.js         # Main Express server (DEPLOYMENT ENTRY)
├── package.json                  # Backend dependencies
└── .env                          # Environment variables (NOT COMMITTED)
```

### Database Scripts (Root Directory)
```
root/
├── create-receipts-table.cjs     # Creates receipts table and views
├── apply-database-fixes.cjs      # Database schema fixes
├── check-database-schema.cjs     # Schema verification
└── receipts-table-schema.sql     # SQL schema definitions
```

### Deployment Scripts (Root Directory)
```
root/
├── deploy-frontend.ps1           # Firebase deployment script
├── deploy-paymongo.ps1           # Backend + PayMongo deployment
├── deploy-complete.ps1           # Full stack deployment
└── monitor-payment-deployment.ps1 # Deployment monitoring
```

### Configuration Files
```
root/
├── .env                          # Local environment variables
├── .env.development              # Development environment
├── .env.example                  # Template for environment setup
├── firebase.json                 # Firebase hosting config
├── .firebaserc                   # Firebase project config
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Frontend dependencies
└── tailwind.config.js            # Tailwind CSS configuration
```

## Architecture Guidelines
- Use micro frontends architecture patterns with modular component design
- Implement component-based design with reusable, scalable components
- Integrate with PostgreSQL Neon database for vendor and service data
- Follow modern React patterns with hooks and functional components
- Use TypeScript for comprehensive type safety
- Implement responsive design with mobile-first approach
- Prepare for future micro frontend deployment and scaling

## Code Style & Standards
- Use functional components with TypeScript interfaces
- Implement proper error boundaries and loading states
- Use Tailwind CSS with glassmorphism and modern wedding themes
- Follow React best practices for performance optimization
- Implement proper state management (Context API or Redux Toolkit)
- Use proper form validation and user input handling
- Implement accessibility features (ARIA labels, screen reader support)

## UI/UX Design Principles
- **Wedding Theme**: Light pink pastel, white, and black color scheme
- **Glassmorphism**: Use backdrop-blur, transparency effects, and layered gradients
- **Modern Design**: Rounded corners (rounded-2xl, rounded-3xl), shadow effects, hover animations
- **Interactive Elements**: Smooth hover transitions, scale transforms, glow effects
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **Loading States**: Elegant skeleton loaders and loading animations
- **Error Handling**: User-friendly error messages with retry options

## Wedding Bazaar Context & Features
- **Vendor Management**: Comprehensive vendor listings with categories, ratings, galleries
- **Service Categories**: Photography, Catering, Venues, Music, Planning, etc.
- **Booking System**: Vendor booking and scheduling functionality
- **Payment Processing**: Real PayMongo integration with card and e-wallet support
- **Receipt Management**: Automatic receipt generation and viewing
- **Booking Actions**: 
  - View receipts for paid bookings
  - Direct cancellation for pending requests
  - Cancellation requests requiring vendor/admin approval
- **User Authentication**: Login/Register modals with success animations
- **Service Discovery**: Category browsing with detailed modal views
- **Gallery Integration**: Multi-image galleries for vendor portfolios
- **Review System**: Rating and review functionality for vendors
- **Contact Management**: Direct vendor contact and messaging
- **Planning Tools**: Wedding planning workflows and checklists

## Component Architecture & File Organization
- **Homepage Components**: Located in `src/pages/homepage/components/`
  - Hero: Full-screen landing with overlays, CTAs, and statistics
  - Services: Category cards with modal details and gallery views  
  - FeaturedVendors: Comprehensive vendor cards with contact information
  - Testimonials: Customer testimonials and reviews
- **User-Specific Pages**: Organized under `src/pages/users/[userType]/`
  - Each user type (individual, vendor, admin) has their own folder structure
  - Common subfolders: dashboard, profile, bookings, messages, landing
  - Vendor-specific: analytics folder for business metrics
  - Admin-specific: users and vendors folders for management
- **Shared Components**: Located in `src/shared/components/`
  - Layout: Headers, Footers, Navigation for different user types
  - Modals: Enhanced modals for login, registration, and service details
  - Messaging: Global floating chat and messaging components
- **Router**: All route definitions in `src/router/AppRouter.tsx`
  - Public routes: Homepage (`/`)
  - User routes: `/individual`, `/vendor`, `/admin` (with sub-routes)
  - Protected routes with authentication requirements

## API Integration
- **Backend Integration**: RESTful API calls to micro frontend backend services
- **Database Queries**: PostgreSQL integration for vendor and service data
- **Error Handling**: Proper API error handling with user feedback
- **Loading Management**: Efficient loading state management across components
- **Data Transformation**: Proper data mapping and interface compliance

## Performance & Optimization
- **Lazy Loading**: Component and image lazy loading
- **Code Splitting**: Route-based code splitting for micro frontends
- **Caching**: Efficient data caching and state management
- **Bundle Optimization**: Vite optimization for production builds
- **SEO**: Proper meta tags and semantic HTML structure

## Development Guidelines
- **Micro Frontend Ready**: Design components for future micro frontend separation
- **Scalable Architecture**: Prepare for horizontal scaling and team collaboration
- **Testing**: Implement proper unit and integration testing
- **Documentation**: Comprehensive component and API documentation
- **Version Control**: Proper Git workflow with feature branches
- **Deployment**: Railway/Vercel deployment ready with environment configuration

## Enhanced Features Implemented
- **Advanced Navigation**: Section-based navigation with scroll spy and active states
- **Service Discovery**: Modal-based service browsing with detailed vendor information
- **Gallery System**: Multi-image gallery views with navigation and thumbnails
- **Enhanced UI**: Glassmorphism effects, gradient overlays, and modern animations
- **Contact Integration**: Direct vendor contact with phone, email, and website links
- **Specialty Tagging**: Vendor specialties and portfolio highlights
- **Experience Indicators**: Years of experience and award information
- **Interactive Elements**: Hover effects, scale animations, and transition effects

## Wedding Industry Focus
- **Vendor Categories**: Photographers, Caterers, Venues, DJs, Planners, Florists, etc.
- **Service Features**: Pricing, ratings, reviews, availability, location
- **Portfolio Showcase**: Image galleries, previous work, specialties
- **Client Testimonials**: Reviews and rating systems
- **Booking Workflows**: Inquiry forms, availability checking, contract management
- **Planning Tools**: Checklists, timelines, budget tracking, vendor comparison

## Current Implementation Status

### ✅ WORKING FEATURES - PRODUCTION READY
- **Backend System**: Deployed to Render, fully operational with all endpoints
  - Database: Neon PostgreSQL with 5 verified vendors (ratings 4.1-4.8)
  - API Endpoints: All `/api/*` routes functional and tested
  - Authentication: JWT-based login/register working
  - Messaging: Database structure ready with conversation/message tables
  - Booking System: Enhanced booking routes implemented
  - **Receipts Table**: Created and operational with proper views
  
- **Payment System**: ✅ REAL PAYMONGO INTEGRATION COMPLETE
  - Real PayMongo API integration (TEST mode operational)
  - Card payments: Payment intent → Payment method → Attach → Receipt
  - E-wallet simulations: GCash, PayMaya, GrabPay (ready for activation)
  - Automatic receipt generation in database
  - Booking status updates after payment (deposit_paid, paid_in_full)
  - Receipt viewing feature with formatted display
  - Payment webhooks ready for production
  
- **Booking Actions**: ✅ COMPLETE
  - **Receipt Viewing**: GET `/api/payment/receipts/:bookingId` endpoint
  - **Direct Cancellation**: POST `/api/bookings/:bookingId/cancel` (for request status)
  - **Cancellation Request**: POST `/api/bookings/:bookingId/request-cancellation` (requires approval)
  - Smart cancellation logic:
    - `request`/`quote_requested` status: Direct cancel without approval
    - Other statuses: Requires vendor/admin approval (pending_cancellation)
  - Frontend service: `bookingActionsService.ts` with all handlers
  - UI buttons integrated in booking cards with proper logic

- **Two-Sided Completion System**: ✅ LIVE IN PRODUCTION (Oct 27, 2025)
  - **Database**: 6 new columns in `bookings` table (vendor_completed, couple_completed, fully_completed, timestamps, notes)
  - **Backend API**: POST `/api/bookings/:bookingId/mark-completed` and GET `/api/bookings/:bookingId/completion-status`
  - **Frontend**: "Mark as Complete" button on IndividualBookings.tsx (green gradient, checkmark icon)
  - **Logic**: Both vendor AND couple must confirm for booking to be fully completed
  - **States**: 
    - Fully Paid → Awaiting Confirmation (yellow badge)
    - One Confirmed → Awaiting Other Party (disabled button)
    - Both Confirmed → Completed ✓ (pink badge with heart icon)
  - **Services**: `completionService.ts` and `bookingCompletionService.ts`
  - **Deployment**: Backend on Render, Frontend on Firebase
  - **Status**: Couple side implemented ✅, Vendor side pending 🚧
  
- **Individual Module Complete**: All 13 individual user pages with CoupleHeader
  - Dashboard, Services, Bookings (with payment + actions + completion), Profile, Settings
  - Help, Premium, Registry, Reviews, Guest Management, Budget Management
  - Wedding Planning with header integration
  - **Bookings Page**: View Receipt, Cancel/Request Cancellation, and Mark as Complete buttons
  
- **Service Discovery**: Advanced service browsing with modal details and gallery integration
- **Router**: Complete routing system with protected routes
- **Micro Frontend Architecture**: Modular structure maintained for scalability

### 🚀 READY FOR PRODUCTION
1. **Payment Flow**: TEST keys active, ready to switch to LIVE keys
2. **Receipt System**: Database table + viewing endpoint operational
3. **Cancellation System**: Smart logic based on booking status
4. **Completion System**: ✅ Two-sided booking completion LIVE (couple side operational)
5. **Status Mapping**: Frontend/backend alignment complete
6. **Error Handling**: Comprehensive logging and user feedback

### 🔧 MINOR ISSUES (Non-Critical)
1. **Featured Vendors Display**: API format mismatch (cosmetic, not blocking)
2. **Auth Context Warnings**: Console shows "Invalid verify response" (functional but noisy)
3. **TypeScript Warnings**: Some type mismatches in booking interfaces (no runtime impact)

### 🚧 IMMEDIATE PRIORITIES (Quick Fixes)

#### Priority 1: Implement Vendor-Side Completion Button
**Status**: Backend ready, frontend pending implementation
**Action**: 
1. Add "Mark as Complete" button to VendorBookings.tsx
2. Use same completion service (`completionService.ts`)
3. Test vendor → couple confirmation flow
4. Deploy and verify in production
**File**: `src/pages/users/vendor/bookings/VendorBookings.tsx`

#### Priority 2: Test Full Two-Sided Completion Flow
**Status**: Couple side deployed, ready for end-to-end testing
**Action**:
1. Create test booking and mark as fully paid
2. Couple marks as complete (verify database update)
3. Vendor marks as complete (verify status changes to 'completed')
4. Verify both completion timestamps recorded
5. Test edge cases (double-click, network errors)

#### Priority 3: Test Receipt Viewing in Production
**Status**: Implementation complete, needs testing
**Action**: 
1. Make a test payment in production
2. Click "View Receipt" button on booking card
3. Verify receipt data displays correctly
4. Test receipt formatting and download functionality

#### Priority 4: Test Cancellation Flow
**Status**: Implementation complete, needs testing
**Action**:
1. Test direct cancellation for "Awaiting Quote" bookings
2. Test cancellation request for paid bookings
3. Verify status updates correctly in database
4. Test vendor/admin approval workflow (when implemented)

#### Priority 5: Fix Featured Vendors Display (Optional)
**File**: `src/pages/homepage/components/FeaturedVendors.tsx`
**Issue**: API format mismatch (cosmetic issue)
**Status**: Non-blocking, vendors exist in DB but may not display
**Quick Fix**: Update interface to match new API format:
```typescript
interface VendorDisplay {
  id: string;
  name: string;          // was: business_name
  category: string;      // was: business_type
  rating: number;        // was: string
}
```

#### Priority 6: Switch to LIVE PayMongo Keys (When Ready)
**Current**: Using TEST keys (sk_test_*, pk_test_*)
**Production**: Switch to LIVE keys (sk_live_*, pk_live_*)
**Location**: Render environment variables
**Note**: Only switch after thorough testing with TEST keys

### 📊 CURRENT DATA STATUS
**Vendors Table** (5 vendors ready):
- Perfect Weddings Co. (Wedding Planning) - 4.2★ (33 reviews)
- Test Business (other) - 4.8★ (74 reviews)
- Beltran Sound Systems (DJ) - 4.5★ (71 reviews)
- asdlkjsalkdj (other) - 4.3★ (58 reviews)
- sadasdas (other) - 4.1★ (21 reviews)

**API Endpoints** (All functional):
- `GET /api/vendors/featured` - Returns 5 vendors (new format)
- `GET /api/ping` - Frontend health check
- `POST /api/auth/verify` - Token verification
- `GET /api/health` - Server health check

### 🚧 FUTURE DEVELOPMENT (After Immediate Fixes)

#### Phase 1: Complete Frontend Integration (1-2 days)
1. **Vendor Dashboard & Management**
   - Create comprehensive vendor dashboard with VendorHeader component
   - Vendor profile management with portfolio galleries
   - Booking management for vendors (availability, calendar, client requests)
   - Analytics dashboard (bookings, revenue, client feedback)

2. **Admin Panel Development**
   - Admin dashboard with platform analytics and AdminHeader component
   - User management (individuals, vendors, admins)
   - Vendor approval and verification system
   - Platform-wide analytics and reporting

#### Phase 2: Advanced Features (2-3 weeks)
1. **Real-time Messaging**: WebSocket implementation, file sharing
2. **Payment Integration**: Stripe/PayPal integration, booking deposits
3. **Enhanced UI/UX**: Improved loading states, animations, error handling
4. **Mobile Optimization**: Responsive design improvements

#### Phase 3: Production Deployment (1 week)
1. **Frontend Deployment**: Deploy to Vercel/Netlify
2. **Performance Optimization**: Bundle analysis, lazy loading
3. **SEO Optimization**: Meta tags, structured data
4. **Security Audit**: Authentication flows, data validation

## File Structure Guidelines
```
src/
├── pages/users/[userType]/
│   ├── dashboard/          # Main dashboard for user type
│   ├── profile/            # Profile management
│   ├── [feature]/          # Feature-specific pages
│   │   ├── components/     # Feature-specific components
│   │   ├── hooks/          # Custom hooks for the feature
│   │   ├── types/          # TypeScript interfaces
│   │   ├── services/       # API service functions
│   │   └── index.ts        # Export barrel
├── shared/
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Shared custom hooks
│   ├── services/           # API service layer
│   ├── types/              # Global TypeScript types
│   ├── utils/              # Utility functions
│   └── contexts/           # React contexts
```

## API Integration Guidelines

### Complete Database Schema (Neon PostgreSQL)

#### 1. **users** table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'individual', -- 'individual', 'vendor', 'admin'
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  profile_image_url TEXT
);
```

#### 2. **vendors** table
```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100), -- 'Photography', 'Catering', 'Venue', etc.
  description TEXT,
  location VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  years_experience INTEGER,
  specialties TEXT[], -- Array of specialty tags
  portfolio_images TEXT[], -- Array of image URLs
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. **services** table
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  service_type VARCHAR(100), -- Category
  description TEXT,
  base_price DECIMAL(10,2),
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  inclusions TEXT[],
  exclusions TEXT[],
  images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. **bookings** table (ENHANCED WITH PAYMENT TRACKING)
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_type VARCHAR(100),
  event_date DATE NOT NULL,
  event_location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'request', 
  -- Statuses: 'request', 'quote_requested', 'quote_sent', 'quote_accepted', 
  --           'quote_rejected', 'confirmed', 'deposit_paid', 'downpayment_paid',
  --           'paid_in_full', 'fully_paid', 'completed', 'cancelled', 'pending_cancellation'
  amount DECIMAL(10,2),
  downpayment_amount DECIMAL(10,2),
  remaining_balance DECIMAL(10,2),
  booking_reference VARCHAR(50) UNIQUE,
  notes TEXT,
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. **receipts** table (PAYMENT RECEIPTS - NEW)
```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  payment_type VARCHAR(50) NOT NULL, -- 'deposit', 'balance', 'full'
  amount INTEGER NOT NULL, -- In centavos (₱100.00 = 10000)
  currency VARCHAR(3) DEFAULT 'PHP',
  payment_method VARCHAR(50), -- 'card', 'gcash', 'paymaya', 'grab_pay'
  payment_intent_id VARCHAR(255), -- PayMongo payment intent ID
  paid_by UUID REFERENCES users(id),
  paid_by_name VARCHAR(255),
  paid_by_email VARCHAR(255),
  total_paid INTEGER, -- Running total in centavos
  remaining_balance INTEGER, -- Remaining in centavos
  notes TEXT,
  metadata JSONB, -- Additional PayMongo data
  created_at TIMESTAMP DEFAULT NOW()
);

-- View for formatted receipt display
CREATE OR REPLACE VIEW receipt_display AS
SELECT 
  r.id,
  r.booking_id,
  r.receipt_number,
  r.payment_type,
  r.amount,
  r.currency,
  r.payment_method,
  r.payment_intent_id,
  r.paid_by,
  r.paid_by_name,
  r.paid_by_email,
  r.total_paid,
  r.remaining_balance,
  r.notes,
  r.created_at,
  b.vendor_id,
  b.service_type,
  b.event_date,
  v.business_name as vendor_name
FROM receipts r
LEFT JOIN bookings b ON r.booking_id = b.id
LEFT JOIN vendors v ON b.vendor_id = v.id;
```

#### 6. **conversations** table (MESSAGING)
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  last_message TEXT,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. **messages** table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  attachments TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 8. **reviews** table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  vendor_response TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Complete API Endpoints Documentation

#### Authentication Endpoints (`/api/auth`)
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user (returns JWT token)
POST   /api/auth/verify            # Verify JWT token
POST   /api/auth/logout            # Logout user
POST   /api/auth/refresh           # Refresh JWT token
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password with token
```

#### User Endpoints (`/api/users`)
```
GET    /api/users/:id              # Get user profile
PUT    /api/users/:id              # Update user profile
DELETE /api/users/:id              # Delete user account
GET    /api/users/:id/bookings     # Get user's bookings
GET    /api/users/:id/reviews      # Get user's reviews
```

#### Vendor Endpoints (`/api/vendors`)
```
GET    /api/vendors                # Get all vendors (with filters)
GET    /api/vendors/featured       # Get featured vendors
GET    /api/vendors/:id            # Get vendor details
POST   /api/vendors                # Create vendor profile
PUT    /api/vendors/:id            # Update vendor profile
DELETE /api/vendors/:id            # Delete vendor profile
GET    /api/vendors/:id/services   # Get vendor's services
GET    /api/vendors/:id/reviews    # Get vendor's reviews
GET    /api/vendors/:id/portfolio  # Get vendor's portfolio
```

#### Service Endpoints (`/api/services`)
```
GET    /api/services               # Get all services (with filters)
GET    /api/services/:id           # Get service details
POST   /api/services               # Create service
PUT    /api/services/:id           # Update service
DELETE /api/services/:id           # Delete service
GET    /api/services/categories    # Get service categories
```

#### Booking Endpoints (`/api/bookings`) ⭐ ENHANCED
```
GET    /api/bookings               # Get all bookings (admin)
GET    /api/bookings/:id           # Get booking details
POST   /api/bookings               # Create booking
PUT    /api/bookings/:id           # Update booking
DELETE /api/bookings/:id           # Delete booking
GET    /api/bookings/user/:userId  # Get user's bookings
GET    /api/bookings/vendor/:vendorId # Get vendor's bookings
PUT    /api/bookings/:id/status    # Update booking status
POST   /api/bookings/:id/quote     # Send quote to client
POST   /api/bookings/:id/accept-quote # Accept quote
POST   /api/bookings/:id/reject-quote # Reject quote

# NEW: Cancellation Endpoints
POST   /api/bookings/:id/cancel              # Direct cancellation (request status)
POST   /api/bookings/:id/request-cancellation # Request cancellation (requires approval)
```

#### Payment Endpoints (`/api/payment`) ⭐ REAL PAYMONGO INTEGRATION
```
# PayMongo Payment Processing
POST   /api/payment/create-source         # Create e-wallet payment source
POST   /api/payment/create-intent         # Create payment intent
POST   /api/payment/create-payment-method # Create payment method (card)
POST   /api/payment/attach-intent         # Attach payment method to intent
POST   /api/payment/process               # Process payment + create receipt
POST   /api/payment/webhook               # PayMongo webhook handler
GET    /api/payment/source/:sourceId      # Get payment source status
GET    /api/payment/health                # Payment service health check

# NEW: Receipt Endpoints
GET    /api/payment/receipts/:bookingId   # Get all receipts for a booking
```

#### Message Endpoints (`/api/messages`)
```
GET    /api/messages/conversations        # Get user's conversations
GET    /api/messages/conversation/:id     # Get conversation messages
POST   /api/messages/conversation         # Create conversation
POST   /api/messages                      # Send message
PUT    /api/messages/:id/read             # Mark message as read
DELETE /api/messages/:id                  # Delete message
```

#### Review Endpoints (`/api/reviews`)
```
GET    /api/reviews                # Get all reviews
GET    /api/reviews/:id            # Get review details
POST   /api/reviews                # Create review
PUT    /api/reviews/:id            # Update review
DELETE /api/reviews/:id            # Delete review
POST   /api/reviews/:id/respond    # Vendor response to review
```

#### Admin Endpoints (`/api/admin`)
```
GET    /api/admin/dashboard        # Admin dashboard stats
GET    /api/admin/users            # Get all users
PUT    /api/admin/users/:id/verify # Verify user account
DELETE /api/admin/users/:id        # Delete user
GET    /api/admin/vendors          # Get all vendors
PUT    /api/admin/vendors/:id/approve # Approve vendor
GET    /api/admin/bookings         # Get all bookings
GET    /api/admin/analytics        # Platform analytics
```

## Quality Assurance
- **Code Review**: All features require code review before merge
- **Testing**: Minimum 80% test coverage for new features
- **Documentation**: All components and APIs must be documented
- **Performance**: Core Web Vitals scores must meet Google standards
- **Accessibility**: WCAG 2.1 AA compliance required

## 🚀 Deployment Guide

### Backend Deployment (Render.com)

**Deployment Configuration:**
- **Platform**: Render.com
- **Entry Point**: `backend-deploy/production-backend.js`
- **Build Command**: `cd backend-deploy && npm install`
- **Start Command**: `node backend-deploy/production-backend.js`
- **Production URL**: https://weddingbazaar-web.onrender.com

**Environment Variables (Required):**
```bash
# Database
DATABASE_URL=postgresql://[neon-database-url]

# JWT Authentication
JWT_SECRET=[your-jwt-secret]

# PayMongo API Keys (TEST MODE)
PAYMONGO_SECRET_KEY=sk_test_[your-test-key]
PAYMONGO_PUBLIC_KEY=pk_test_[your-test-key]

# PayMongo API Keys (LIVE MODE - for production)
# PAYMONGO_SECRET_KEY=sk_live_[your-live-key]
# PAYMONGO_PUBLIC_KEY=pk_live_[your-live-key]

# Frontend URL (for CORS)
FRONTEND_URL=https://weddingbazaar-web.web.app

# Server Configuration
PORT=3001
NODE_ENV=production
```

**Deployment Steps:**
1. Push code to GitHub repository
2. Render auto-deploys from `main` branch
3. Check build logs in Render dashboard
4. Verify deployment: `https://weddingbazaar-web.onrender.com/api/health`

**Deployment Scripts:**
```powershell
# Deploy backend only
.\deploy-paymongo.ps1

# Deploy full stack
.\deploy-complete.ps1
```

### Frontend Deployment (Firebase Hosting)

**Deployment Configuration:**
- **Platform**: Firebase Hosting
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Production URL**: https://weddingbazaar-web.web.app

**Environment Variables (`.env.production`):**
```bash
# Backend API URL
VITE_API_URL=https://weddingbazaar-web.onrender.com

# PayMongo Public Key (for frontend)
VITE_PAYMONGO_PUBLIC_KEY=pk_test_[your-test-key]

# Firebase Configuration
VITE_FIREBASE_API_KEY=[your-firebase-key]
VITE_FIREBASE_AUTH_DOMAIN=[your-domain]
VITE_FIREBASE_PROJECT_ID=[your-project-id]
```

**Deployment Steps:**
```powershell
# Build frontend
npm run build

# Deploy to Firebase
firebase deploy

# Or use deployment script
.\deploy-frontend.ps1
```

**Firebase Configuration Files:**
- `firebase.json` - Hosting configuration
- `.firebaserc` - Project configuration

### Database Deployment (Neon PostgreSQL)

**Database Configuration:**
- **Platform**: Neon PostgreSQL (Serverless)
- **Connection**: Via `@neondatabase/serverless` package
- **Connection Pooling**: Enabled

**Database Setup Scripts:**
```bash
# Create receipts table and views
node create-receipts-table.cjs

# Apply database fixes
node apply-database-fixes.cjs

# Check database schema
node check-database-schema.cjs
```

**Database Migration Commands:**
```sql
-- Run these in Neon SQL Editor
\i receipts-table-schema.sql
```

## 🛠️ Implementation Methods & Patterns

### Payment Implementation (PayMongo Real Integration)

**Flow: Card Payment**
```
1. User clicks "Pay Deposit" or "Pay Balance"
2. PayMongoPaymentModal opens
3. User enters card details
4. Frontend calls: createCardPayment()
   ├── Step 1: POST /api/payment/create-intent (creates PayMongo intent)
   ├── Step 2: POST /api/payment/create-payment-method (tokenizes card)
   ├── Step 3: POST /api/payment/attach-intent (processes payment)
   └── Step 4: POST /api/payment/process (creates receipt + updates booking)
5. Receipt created in database
6. Booking status updated (deposit_paid or paid_in_full)
7. Success modal shown to user
```

**Key Files:**
- `src/shared/services/payment/paymongoService.ts` - Frontend payment service
- `backend-deploy/routes/payments.cjs` - Backend payment endpoints
- `backend-deploy/helpers/receiptGenerator.cjs` - Receipt generation logic

**Example Usage:**
```typescript
import { paymongoService } from '@/shared/services/payment/paymongoService';

const result = await paymongoService.createCardPayment(
  bookingId,
  amount,
  'deposit',
  {
    number: '4343434343434345', // Test card
    expiry: '12/25',
    cvc: '123',
    name: 'Juan Dela Cruz',
    email: 'user@example.com'
  }
);

if (result.success) {
  console.log('Receipt:', result.receiptNumber);
}
```

### Receipt Viewing Implementation

**Flow: View Receipt**
```
1. User clicks "View Receipt" button on booking card
2. Frontend calls: getBookingReceipts(bookingId)
3. Backend: GET /api/payment/receipts/:bookingId
4. Returns array of receipts with full details
5. Frontend displays receipt in modal/alert
6. User can download/print receipt
```

**Key Files:**
- `src/shared/services/bookingActionsService.ts` - Receipt fetching service
- `backend-deploy/routes/payments.cjs` - Receipt endpoint

**Example Usage:**
```typescript
import { getBookingReceipts, formatReceipt } from '@/shared/services/bookingActionsService';

const receipts = await getBookingReceipts(bookingId);
const formatted = formatReceipt(receipts[0]);
console.log(formatted); // Formatted receipt text
```

---

## 🎉 Two-Sided Booking Completion System

### Overview
The two-sided completion system requires BOTH the vendor and the couple to confirm that a booking is complete before it's marked as "completed" in the system. This ensures mutual agreement and satisfaction before finalizing the booking.

### Database Schema

**New Columns in `bookings` table**:
```sql
vendor_completed BOOLEAN DEFAULT FALSE
vendor_completed_at TIMESTAMP
couple_completed BOOLEAN DEFAULT FALSE  
couple_completed_at TIMESTAMP
fully_completed BOOLEAN DEFAULT FALSE
fully_completed_at TIMESTAMP
completion_notes TEXT

-- Index for performance
CREATE INDEX idx_bookings_completion 
ON bookings(vendor_completed, couple_completed, fully_completed);
```

### API Endpoints

**Mark as Complete**:
```
POST /api/bookings/:bookingId/mark-completed
Body: {
  "completed_by": "couple" | "vendor",
  "notes": "Optional completion notes"
}
```

**Check Completion Status**:
```
GET /api/bookings/:bookingId/completion-status
```

### Frontend Implementation

**Location**: `src/pages/users/individual/bookings/IndividualBookings.tsx`

**Button Rendering**:
```tsx
{/* Mark as Complete Button - Show for fully paid bookings */}
{(booking.status === 'fully_paid' || booking.status === 'paid_in_full') && (
  <button
    onClick={() => handleMarkComplete(booking)}
    className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 
               text-white rounded-lg hover:shadow-lg transition-all 
               hover:scale-105 flex items-center justify-center gap-2"
  >
    <CheckCircle className="w-4 h-4" />
    Mark as Complete
  </button>
)}

{/* Completed Badge - Show when both confirmed */}
{booking.status === 'completed' && (
  <div className="w-full px-3 py-2 bg-gradient-to-r from-pink-100 to-purple-100 
                  border-2 border-pink-300 text-pink-700 rounded-lg 
                  flex items-center justify-center gap-2 font-semibold text-sm">
    <Heart className="w-4 h-4 fill-current" />
    Completed ✓
  </div>
)}
```

**Handler Function**:
```typescript
const handleMarkComplete = async (booking: Booking) => {
  // Check current completion status
  const completionStatus = await checkCompletionStatus(booking.id);
  
  // Show confirmation modal with context-aware message
  setConfirmationModal({
    isOpen: true,
    title: '✅ Complete Booking',
    message: completionStatus?.vendorCompleted
      ? 'Vendor already confirmed. By confirming, booking will be FULLY COMPLETED.'
      : 'Booking only fully completed when both you and vendor confirm.',
    onConfirm: async () => {
      const result = await markBookingComplete(booking.id, 'couple');
      if (result.success) {
        setSuccessMessage(result.message);
        await loadBookings(); // Refresh
      }
    }
  });
};
```

### Service Layer

**File**: `src/shared/services/completionService.ts`

**Key Functions**:
```typescript
// Mark booking as completed
export const markBookingComplete = async (
  bookingId: string,
  completedBy: 'vendor' | 'couple'
): Promise<CompletionResponse>;

// Check completion status
export const checkCompletionStatus = async (
  bookingId: string
): Promise<CompletionStatus>;

// Get button text based on state
export const getCompletionButtonText = (
  completionStatus: CompletionStatus,
  userRole: 'vendor' | 'couple'
): string;

// Check if user can mark complete
export const canMarkComplete = (
  booking: Booking,
  userRole: 'vendor' | 'couple'
): boolean;
```

### Completion Flow

**Step 1**: Booking is fully paid
- Status: `fully_paid` or `paid_in_full`
- Button: "Mark as Complete" (green, active)

**Step 2**: One party marks complete
- If couple: `couple_completed = TRUE`, `couple_completed_at = NOW()`
- If vendor: `vendor_completed = TRUE`, `vendor_completed_at = NOW()`
- Status: Still `fully_paid`
- Button: "Waiting for [Other Party]" (gray, disabled)

**Step 3**: Other party confirms
- Both flags now `TRUE`
- Status: Changes to `completed`
- `fully_completed = TRUE`, `fully_completed_at = NOW()`
- Button: Hidden, replaced with "Completed ✓" badge

### UI States

| State | Couple Status | Vendor Status | Button Text | Button Color | Badge |
|-------|--------------|---------------|-------------|--------------|-------|
| **Initial** | ❌ | ❌ | "Mark as Complete" | Green | "Fully Paid" (Blue) |
| **Couple Done** | ✅ | ❌ | "Waiting for Vendor" | Gray (disabled) | "Awaiting Vendor" (Yellow) |
| **Vendor Done** | ❌ | ✅ | "Confirm Completion" | Green | "Vendor Confirmed" (Yellow) |
| **Both Done** | ✅ | ✅ | Hidden | - | "Completed ✓" (Pink) |

### Backend Logic

**File**: `backend-deploy/routes/booking-completion.cjs`

**Validation**:
1. Check booking exists
2. Verify booking is fully paid
3. Confirm party hasn't already marked complete
4. Update appropriate completion flag
5. If both flags TRUE, update status to 'completed'

**Response Structure**:
```json
{
  "success": true,
  "message": "Booking marked as completed by couple",
  "booking": {
    "id": "uuid",
    "status": "completed",
    "couple_completed": true,
    "vendor_completed": true,
    "fully_completed": true,
    "couple_completed_at": "2025-10-27T14:30:00Z",
    "vendor_completed_at": "2025-10-27T14:35:00Z"
  },
  "bothConfirmed": true
}
```

### Deployment Status

**✅ LIVE IN PRODUCTION** (October 27, 2025)

- **Database**: Migration complete, columns added
- **Backend**: API endpoints deployed to Render
- **Frontend (Couple)**: Button deployed to Firebase
- **Frontend (Vendor)**: ⚠️ Pending implementation

**Testing URLs**:
- Frontend: https://weddingbazaarph.web.app/individual/bookings
- Backend: https://weddingbazaar-web.onrender.com/api/bookings/:id/mark-completed

### Next Steps

1. **Implement Vendor Side** (Priority 1)
   - Add button to `VendorBookings.tsx`
   - Use same service layer
   - Test vendor → couple flow

2. **Add Notifications** (Priority 2)
   - Email when other party confirms
   - SMS notifications (optional)
   - In-app notification badge

3. **Review Integration** (Priority 3)
   - Auto-prompt for reviews after completion
   - Review reminder emails
   - Link to review page

### Troubleshooting

**Button Not Appearing**:
- Check booking status is `fully_paid` or `paid_in_full`
- Clear browser cache (Ctrl+Shift+Delete)
- Verify user is logged in
- Check browser console for errors

**API Errors**:
- Verify booking ID is valid
- Check user has permission
- Ensure backend is deployed
- Check network tab in DevTools

**State Not Updating**:
- Refresh booking list manually
- Check completion status endpoint
- Verify database update succeeded
- Check backend logs in Render

### Documentation Files

- **Deployment Guide**: `TWO_SIDED_COMPLETION_DEPLOYED_LIVE.md`
- **System Design**: `TWO_SIDED_COMPLETION_SYSTEM.md`
- **API Spec**: `backend-deploy/routes/booking-completion.cjs`
- **Service Layer**: `src/shared/services/completionService.ts`
