# Wedding Bazaar - Project Structure

## Overview
This is a Wedding Bazaar platform built with React, TypeScript, and Vite, designed with micro frontends architecture for scalability.

## Project Structure

### Frontend (`src/`)
```
src/
├── pages/                          # Page-level components organized by features
│   ├── homepage/                   # Main landing page
│   │   ├── Homepage.tsx
│   │   └── components/
│   │       ├── Hero.tsx
│   │       ├── Services.tsx
│   │       ├── FeaturedVendors.tsx
│   │       └── Testimonials.tsx
│   ├── landingpages/              # Specialized landing pages
│   │   ├── vendor/                # Vendor-specific landing pages
│   │   ├── individual/            # Individual user landing pages
│   │   └── admin/                 # Admin dashboard pages
│   └── shared/                    # Shared page components
│       ├── messenger/             # Messaging functionality
│       └── services/              # Service pages
├── modules/                       # Feature modules (micro frontends)
│   ├── vendors/                   # Vendor management module
│   ├── bookings/                  # Booking system module
│   ├── homepage/                  # Homepage-specific module
│   └── landing/                   # Landing page module
├── shared/                        # Shared components and utilities
│   ├── components/
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── services/                  # Frontend API services
│   └── types/                     # TypeScript type definitions
└── utils/                         # Utility functions
    └── cn.ts                      # Class name utility
```

### Backend (`backend/`)
```
backend/
├── database/                      # Database configuration and models
│   └── connection.ts              # PostgreSQL Neon connection setup
└── services/                      # Backend business logic
    ├── vendorService.ts           # Vendor-related operations
    └── bookingService.ts          # Booking-related operations
```

### Server (`server/`)
```
server/                            # Server configuration and API routes
└── (Future: Express.js/Node.js server files)
```

## Architecture Principles

### Micro Frontends
- Each module in `src/modules/` represents a self-contained micro frontend
- Modules can be developed, tested, and deployed independently
- Shared components are centralized in `src/shared/`

### Micro Backends
- Backend services are modular and can be scaled independently
- Each service handles a specific domain (vendors, bookings, etc.)
- Services communicate through well-defined APIs

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **UI Components**: Lucide React icons, Headless UI
- **Animations**: Framer Motion
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Neon (Serverless)
- **Styling**: Tailwind CSS with custom utilities
- **Development**: Concurrently, Nodemon, ts-node

## Key Features

### Homepage/Landing Page
- Modern, responsive design
- Hero section with call-to-action
- Service categories showcase
- Featured vendor listings
- Customer testimonials
- Newsletter subscription

### Vendor System
- Vendor registration and profiles
- Category-based organization
- Rating and review system
- Portfolio management
- Availability tracking

### Booking System
- Vendor booking interface
- Event date management
- Status tracking
- Contract management

### Messaging
- Real-time communication between couples and vendors
- Attachment support
- Conversation management

## Development Guidelines

### Component Structure
- Use functional components with TypeScript
- Implement proper error boundaries
- Follow React best practices for performance
- Use Tailwind CSS with the `cn()` utility for conditional styling

### State Management
- Use React Context API for global state
- Consider Redux Toolkit for complex state scenarios
- Implement proper loading and error states

### API Integration
- Prepare for PostgreSQL Neon database integration
- Implement proper error handling
- Use TypeScript for API response types

## Getting Started

1. Install dependencies: `npm install`
2. Start full development environment: `npm run dev:full` (frontend + backend)
3. Start frontend only: `npm run dev`
4. Build for production: `npm run build`
5. Preview production build: `npm run preview`

### Available Scripts

- `npm run dev` - Start Vite development server (frontend only)
- `npm run dev:full` - Start both frontend and backend development servers
- `npm run dev:backend` - Start backend development server with nodemon
- `npm start` - Alias for `npm run dev:full`
- `npm run build` - Build frontend for production
- `npm run build:backend` - Build backend for production
- `npm run start:backend` - Start production backend server
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run db:init` - Initialize database tables (development only)

### Database Setup

1. **Create Neon Account**: Go to [console.neon.tech](https://console.neon.tech)
2. **Get Connection String**: Copy from your Neon dashboard
3. **Configure Environment**: Update `.env` with your DATABASE_URL
4. **Initialize Tables**: Run `npm run db:init`
5. **Test Connection**: Visit `http://localhost:3000/api/health`

See `NEON_SETUP.md` for detailed database setup instructions.

## Future Enhancements

- User authentication system
- Payment processing integration
- Advanced search and filtering
- Real-time notifications
- Mobile app development
- Vendor analytics dashboard
- Multi-language support
