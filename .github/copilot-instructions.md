# Wedding Bazaar Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Wedding Bazaar platform built with React, TypeScript, and Vite. The project is designed with micro frontends architecture in mind for scalability. The platform connects couples with wedding vendors and provides comprehensive wedding planning tools.

## Current Folder Structure
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
│   │   │   ├── bookings/          # Booking management
│   │   │   │   ├── IndividualBookings.tsx
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
│   └── shared/            # Shared page components
│       ├── messenger/             # Messaging components
│       │   ├── FloatingChat.tsx
│       │   ├── FloatingChatButton.tsx
│       │   ├── Messenger.tsx
│       │   ├── useMessenger.ts
│       │   ├── useMessagingService.ts
│       │   ├── types.ts
│       │   └── index.ts
│       └── services/              # Shared service components
├── shared/               # Global shared components, contexts, types
│   ├── components/
│   │   ├── layout/                # Headers, Footers, Navigation
│   │   │   ├── Header.tsx         # Main site header
│   │   │   ├── Footer.tsx         # Site footer
│   │   │   └── VendorHeader.tsx   # Vendor-specific header
│   │   ├── messaging/             # Global chat components
│   │   │   ├── GlobalFloatingChat.tsx
│   │   │   └── GlobalFloatingChatButton.tsx
│   │   └── modals/                # Login, Register, and other modals
│   │       ├── LoginModal.tsx
│   │       ├── RegisterModal.tsx
│   │       ├── Modal.tsx
│   │       └── index.ts
│   ├── contexts/                  # React contexts
│   │   ├── AuthContext.tsx        # Authentication context
│   │   └── GlobalMessengerContext.tsx # Messaging context
│   ├── services/                  # API service files
│   └── types/                     # TypeScript type definitions
│       └── index.ts
├── router/               # Application routing
│   ├── AppRouter.tsx             # Main router configuration
│   └── ProtectedRoute.tsx        # Route protection
├── utils/                # Utility functions
│   └── cn.ts                     # Classname utility
└── assets/              # Static assets
    └── react.svg
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
### ✅ Completed Features
- **Homepage**: Hero section, service categories, featured vendors, testimonials
- **Individual Module Complete**: All 13 individual user pages now include CoupleHeader component
  - Dashboard, Services, Bookings, Profile, Settings, Help, Premium, Registry, Reviews
  - Guest Management, Budget Management, Wedding Planning with consistent header integration
- **Header Refactoring**: CoupleHeader consistently applied across all individual navigation routes
- **Service Discovery**: Advanced service browsing with modal details, gallery integration, vendor contact information
- **Wedding Planning**: Comprehensive task management, category-based organization, progress tracking
- **Budget Management**: Category-based budget tracking, expense monitoring, payment history
- **Guest Management**: RSVP tracking, contact management, table assignments, import/export functionality
- **Booking System**: Basic booking management for individuals
- **Authentication**: Login/register modals with context management
- **Messaging**: Global floating chat system with context management
- **Router**: Complete routing system with protected routes
- **Micro Frontend Architecture**: Modular structure maintained for scalability

### 🚧 In Progress / Next Steps
1. **JSX Structure Cleanup**
   - Fix remaining build errors in 4 complex components (BudgetManagement, GuestManagement, WeddingPlanning, ProfileSettings)
   - Resolve unbalanced div tag structures introduced during header integration
   - Ensure all components compile successfully for production builds

2. **Vendor Dashboard & Management**
   - Create comprehensive vendor dashboard with VendorHeader component
   - Vendor profile management with portfolio galleries
   - Booking management for vendors (availability, calendar, client requests)
   - Analytics dashboard (bookings, revenue, client feedback)
   - Vendor messaging system

3. **Admin Panel**
   - Admin dashboard with platform analytics and AdminHeader component
   - User management (individuals, vendors, admins)
   - Vendor approval and verification system
   - Booking oversight and conflict resolution
   - Platform-wide analytics and reporting
   - Payment processing integration
   - Review and rating system
   - Notification system (email, push, in-app)
   - Vendor availability management
   - Contract management and digital signatures

4. **Database Integration**
   - Connect to PostgreSQL Neon database
   - Implement API service layer
   - Create data models for all entities
   - Set up user authentication with JWT
   - Implement search and filtering backend

5. **Micro Frontend Architecture**
   - Separate individual, vendor, and admin modules
   - Implement module federation
   - Create shared component library
   - Set up micro frontend routing
   - Deploy independent modules

## Development Workflow & Standards
### 🎯 Micro Frontend Architecture
- **Module Separation**: Each user type (individual, vendor, admin) should be developed as separate micro frontends
- **Shared Components**: Common UI components in `src/shared/components/`
- **API Gateway**: Centralized API management for all micro frontends
- **State Management**: Use React Context for local state, consider Redux Toolkit for complex global state
- **Module Federation**: Prepare for Webpack Module Federation implementation

### 🛠️ Technical Implementation
- **Database**: PostgreSQL with Neon hosting, use Prisma ORM for type-safe database operations
- **Backend**: Node.js with Express, implement RESTful APIs with OpenAPI documentation
- **Authentication**: JWT-based authentication with refresh tokens
- **File Storage**: AWS S3 or similar for image/document storage
- **Search**: Elasticsearch or PostgreSQL full-text search for vendor discovery
- **Caching**: Redis for session management and API caching

### 📱 Frontend Development
- **Component Structure**: Each major feature should have its own folder with components, hooks, types, and tests
- **State Management**: Use custom hooks for component state, Context API for feature-level state
- **Form Handling**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Testing**: Jest + Testing Library for unit tests, Cypress for E2E tests

### 🎨 UI/UX Implementation
- **Design System**: Create reusable components with consistent styling
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Image optimization, lazy loading, code splitting
- **Animations**: Framer Motion for complex animations, CSS transitions for simple ones

### 📊 Analytics & Monitoring
- **User Analytics**: Track user interactions, conversion funnels, feature usage
- **Performance Monitoring**: Core Web Vitals, API response times, error tracking
- **Business Metrics**: Booking rates, vendor signups, user retention
- **A/B Testing**: Feature flags for testing new functionality

## Next Development Priorities
### Phase 1: Core Vendor Features (2-3 weeks)
1. **Vendor Dashboard**: Analytics, booking overview, profile management
2. **Vendor Profile**: Portfolio galleries, service listings, availability calendar
3. **Vendor Bookings**: Manage client requests, availability, pricing
4. **Vendor Analytics**: Revenue tracking, client feedback, performance metrics

### Phase 2: Admin Platform (2-3 weeks)
1. **Admin Dashboard**: Platform analytics, user metrics, vendor oversight
2. **User Management**: Approve vendors, manage user accounts, handle disputes
3. **Content Management**: Manage service categories, featured vendors, platform content
4. **Analytics Dashboard**: Platform KPIs, revenue tracking, user engagement

### Phase 3: Advanced Features (3-4 weeks)
1. **Real-time Messaging**: WebSocket implementation, file sharing, chat history
2. **Payment Integration**: Stripe/PayPal integration, booking deposits, vendor payouts
3. **Calendar System**: Appointment scheduling, availability management, reminders
4. **Review System**: Rating and review functionality, moderation, analytics

### Phase 4: Micro Frontend Migration (2-3 weeks)
1. **Module Federation Setup**: Configure Webpack Module Federation
2. **Shared Library**: Extract common components and utilities
3. **Independent Deployment**: Set up CI/CD for each micro frontend
4. **API Gateway**: Implement centralized API management

### Phase 5: Production Optimization (1-2 weeks)
1. **Performance Optimization**: Bundle analysis, lazy loading, caching strategies
2. **SEO Optimization**: Meta tags, structured data, sitemap generation
3. **Security Audit**: Authentication flows, data validation, XSS protection
4. **Load Testing**: Stress testing, database optimization, CDN setup

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
### Database Schema
- **Users**: Authentication, profiles, preferences
- **Vendors**: Business information, services, availability
- **Services**: Categories, pricing, descriptions, media
- **Bookings**: Reservations, status, payments, reviews
- **Messages**: Real-time communication, file attachments
- **Reviews**: Ratings, comments, moderation status

### API Endpoints Structure
```
/api/auth/*           # Authentication endpoints
/api/users/*          # User management
/api/vendors/*        # Vendor operations
/api/services/*       # Service discovery
/api/bookings/*       # Booking management
/api/messages/*       # Messaging system
/api/reviews/*        # Review system
/api/admin/*          # Admin operations
```

## Quality Assurance
- **Code Review**: All features require code review before merge
- **Testing**: Minimum 80% test coverage for new features
- **Documentation**: All components and APIs must be documented
- **Performance**: Core Web Vitals scores must meet Google standards
- **Accessibility**: WCAG 2.1 AA compliance required
