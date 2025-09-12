# Wedding Bazaar Booking Module - Micro Frontend Architecture

## Overview
The booking module is designed as a standalone micro frontend that can be deployed independently while sharing common UI components and types with the main application.

## Module Structure
```
src/pages/users/individual/bookings/
├── components/                 # Standalone UI components
│   ├── BookingCard.tsx        # Enhanced card with grid/list views
│   ├── BookingFilters.tsx     # Search, filters, and view toggle
│   ├── BookingStatsCards.tsx  # Statistics dashboard
│   ├── BookingDetailsModal.tsx # Detailed booking view
│   └── index.ts               # Component exports
├── hooks/                     # Custom hooks for state management
│   ├── useLocalStorage.ts     # Persistent user preferences
│   └── index.ts               # Hook exports
├── types/                     # TypeScript type definitions
│   └── booking.types.ts       # Booking-specific types
├── IndividualBookings.tsx     # Main component
└── index.ts                   # Module exports
```

## Micro Frontend Design Principles

### 1. **Self-Contained Module**
- All booking-related functionality in one directory
- No external dependencies on other pages
- Shared dependencies only through `src/shared/`

### 2. **Component Architecture**
- **BookingCard**: Supports both grid and list view modes
- **BookingFilters**: Comprehensive filtering with view mode toggle
- **BookingStatsCards**: Real-time statistics dashboard
- **BookingDetailsModal**: Full booking details with payment actions

### 3. **State Management**
- Uses React Context for global state (auth, messaging)
- Local state with custom hooks (`useBookingPreferences`)
- Persistent preferences in localStorage
- Real-time updates via API polling/websockets

### 4. **Type Safety**
- Comprehensive TypeScript interfaces
- API-to-UI type mapping functions
- Shared types from `src/shared/types/`

## Enhanced Features

### 📱 **Responsive Design**
```tsx
// Grid View (2 columns on large screens)
viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'

// List View (single column, horizontal layout)
// Optimized for mobile and desktop
```

### 🎨 **Modern UI Components**
- **Glassmorphism effects** with backdrop-blur
- **Gradient backgrounds** and hover animations
- **Status badges** with color-coded indicators
- **Payment progress bars** with smooth animations
- **Interactive buttons** with loading states

### 🔍 **Advanced Filtering**
- Real-time search with 300ms debouncing
- Status-based filtering (all, pending, confirmed, etc.)
- View mode persistence in localStorage
- Export functionality

### 💳 **Payment Integration**
- Multiple payment types (downpayment, full payment, balance)
- Progress tracking with visual indicators
- PayMongo integration ready
- Receipt management system

## Backend API Requirements

### 1. **Booking Endpoints**
```typescript
// Get bookings with pagination and filtering
GET /api/bookings/enhanced?coupleId={id}&page={n}&limit={n}&status={status}

// Get booking statistics
GET /api/bookings/enhanced/stats/{coupleId}?userType=couple

// Create new booking
POST /api/bookings/enhanced

// Update booking status
PATCH /api/bookings/enhanced/{bookingId}

// Cancel booking
DELETE /api/bookings/enhanced/{bookingId}
```

### 2. **Response Schemas**
```typescript
interface BookingsResponse {
  bookings: ComprehensiveBooking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface BookingStats {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  pending_payments: number;
}
```

## Deployment Strategy

### 1. **Independent Deployment**
```yaml
# docker-compose.yml
services:
  booking-frontend:
    build: ./micro-frontends/booking
    ports:
      - "3001:80"
    environment:
      - API_BASE_URL=http://booking-api:3000
      
  booking-api:
    build: ./backend/booking-service
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${BOOKING_DB_URL}
```

### 2. **Module Federation Setup**
```javascript
// webpack.config.js
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'booking_module',
      filename: 'remoteEntry.js',
      exposes: {
        './BookingModule': './src/pages/users/individual/bookings',
        './BookingCard': './src/pages/users/individual/bookings/components/BookingCard',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

### 3. **Host Application Integration**
```typescript
// Host app imports the micro frontend
const BookingModule = React.lazy(() => import('booking_module/BookingModule'));

// Router setup
<Route path="/individual/bookings" element={
  <Suspense fallback={<LoadingSpinner />}>
    <BookingModule />
  </Suspense>
} />
```

## Performance Optimizations

### 1. **Code Splitting**
- Lazy loading of booking module
- Separate chunks for components
- Dynamic imports for heavy libraries

### 2. **Caching Strategy**
```typescript
// React Query for API caching
const { data: bookings } = useQuery({
  queryKey: ['bookings', coupleId, filters],
  queryFn: () => bookingApi.getBookings(coupleId, filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### 3. **Optimistic Updates**
```typescript
// Update UI immediately, sync with server later
const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
  // Optimistic update
  setBookings(prev => prev.map(booking => 
    booking.id === bookingId ? { ...booking, status } : booking
  ));
  
  try {
    await bookingApi.updateStatus(bookingId, status);
  } catch (error) {
    // Revert on error
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: originalStatus } : booking
    ));
  }
};
```

## Security Considerations

### 1. **Authentication**
- JWT token validation on all API calls
- User session management via React Context
- Automatic token refresh

### 2. **Authorization**
- Role-based access control (couple, vendor, admin)
- Booking ownership validation
- Payment action permissions

### 3. **Data Validation**
- Client-side form validation with Zod
- Server-side validation and sanitization
- XSS protection with proper escaping

## Monitoring & Analytics

### 1. **Performance Monitoring**
- Core Web Vitals tracking
- API response time monitoring
- Error boundary logging

### 2. **Business Metrics**
- Booking conversion rates
- Payment completion rates
- User engagement analytics

### 3. **Error Tracking**
```typescript
// Error boundary with reporting
class BookingErrorBoundary extends ErrorBoundary {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to monitoring service
    analytics.track('booking_error', {
      error: error.message,
      component: errorInfo.componentStack,
      userId: user?.id,
    });
  }
}
```

## Testing Strategy

### 1. **Unit Tests**
- Component testing with React Testing Library
- Hook testing with React Hooks Testing Library
- Utility function testing with Jest

### 2. **Integration Tests**
- API integration testing
- Payment flow testing
- State management testing

### 3. **E2E Tests**
```typescript
// Playwright/Cypress tests
test('should complete booking flow', async ({ page }) => {
  await page.goto('/individual/bookings');
  await page.click('[data-testid="new-booking-btn"]');
  await page.fill('[data-testid="service-search"]', 'photography');
  await page.click('[data-testid="book-service-btn"]');
  // ... complete flow
});
```

This architecture ensures the booking module is scalable, maintainable, and ready for micro frontend deployment while providing an excellent user experience with modern UI components and robust functionality.
