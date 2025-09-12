# Wedding Bazaar - Booking & Payment Microfrontend/Microbackend Refactoring

## Overview

This document outlines the successful refactoring of the Wedding Bazaar individual booking management system into a modern microfrontend and microbackend architecture. This refactoring improves maintainability, scalability, and developer experience by modularizing booking management, payment workflows, and related components.

## Architecture Changes

### Frontend Microfrontend Structure

#### New Directory Structure
```
src/pages/users/individual/
├── bookings/                           # Booking microfrontend module
│   ├── components/                     # Modular booking components
│   │   ├── BookingStatsCards.tsx      # Statistics cards component
│   │   ├── BookingFilters.tsx         # Search and filter component
│   │   ├── BookingCard.tsx            # Individual booking card
│   │   ├── BookingDetailsModal.tsx    # Booking details modal
│   │   └── index.ts                   # Component exports
│   ├── types/                         # Booking type definitions
│   │   └── booking.types.ts           # Shared booking interfaces
│   ├── IndividualBookings.tsx         # Main booking management page
│   └── index.ts                       # Module exports
└── payment/                           # Payment microfrontend module
    ├── components/                    # Payment-specific components
    │   ├── PaymentModal.tsx          # Payment processing modal
    │   └── index.ts                  # Component exports
    ├── services/                     # Payment service layer
    │   ├── paymentService.ts         # Frontend payment API service
    │   └── index.ts                  # Service exports
    ├── types/                        # Payment type definitions
    │   └── payment.types.ts          # Shared payment interfaces
    └── index.ts                      # Module exports
```

#### Backend Microservice Structure
```
backend/api/
└── payment/                          # Payment microservice
    ├── routes.ts                     # Payment API routes
    └── index.ts                      # Microservice exports
```

## Component Architecture

### Booking Components

#### 1. BookingStatsCards
- **Purpose**: Display booking statistics and financial overview
- **Features**: 
  - Total bookings, pending, confirmed, completed counts
  - Financial overview (total spent, paid, pending payments)
  - Responsive card layout with loading states
- **Location**: `src/pages/users/individual/bookings/components/BookingStatsCards.tsx`

#### 2. BookingFilters
- **Purpose**: Search and filter booking list
- **Features**:
  - Text search across vendor names, service types, and booking references
  - Status-based filtering (all, pending, confirmed, etc.)
  - Export functionality
  - Results counter
- **Location**: `src/pages/users/individual/bookings/components/BookingFilters.tsx`

#### 3. BookingCard
- **Purpose**: Display individual booking information in card format
- **Features**:
  - Vendor and service details
  - Event date and location
  - Payment progress indicator
  - Status badges with color coding
  - Action buttons (view details, make payment)
- **Location**: `src/pages/users/individual/bookings/components/BookingCard.tsx`

#### 4. BookingDetailsModal
- **Purpose**: Detailed view of booking information
- **Features**:
  - Complete booking details
  - Payment history and status
  - Contact information and communication
  - Payment action buttons
  - Responsive modal design
- **Location**: `src/pages/users/individual/bookings/components/BookingDetailsModal.tsx`

### Payment Components

#### 1. PaymentModal
- **Purpose**: Handle payment processing for bookings
- **Features**:
  - PayMongo integration
  - Payment type selection (downpayment, full payment, remaining balance)
  - Payment method selection
  - Real-time amount calculation
  - Loading states and error handling
- **Location**: `src/pages/users/individual/payment/components/PaymentModal.tsx`

## Services Architecture

### Frontend Payment Service

#### PaymentService (`src/pages/users/individual/payment/services/paymentService.ts`)
- **Purpose**: Handle frontend payment API communication
- **Features**:
  - PayMongo checkout session creation
  - Payment processing and validation
  - Receipt generation
  - Error handling and retry logic

### Backend Payment Microservice

#### Payment Routes (`backend/api/payment/routes.ts`)
- **Purpose**: Handle server-side payment processing
- **Features**:
  - PayMongo API integration
  - Checkout session creation (`POST /api/payment/create-checkout`)
  - Payment webhook handling (`POST /api/payment/webhook`)
  - Receipt generation (`POST /api/payment/generate-receipt`)
  - Payment status tracking (`GET /api/payment/status/:paymentId`)

## Type System

### Booking Types (`src/pages/users/individual/bookings/types/booking.types.ts`)
```typescript
interface Booking {
  id: string;
  bookingReference?: string;
  vendorId: string;
  vendorName: string;
  coupleId: string;
  serviceType: string;
  serviceName: string;
  eventDate: string;
  totalAmount: number;
  status: BookingStatus;
  // ... additional properties
}

interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalSpent: number;
  totalPaid: number;
  pendingPayments: number;
  formatted: {
    totalSpent: string;
    totalPaid: string;
    pendingPayments: string;
  };
}

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'downpayment_paid' | 'paid_in_full' | 'completed' | 'cancelled';
```

### Payment Types (`src/pages/users/individual/payment/types/payment.types.ts`)
```typescript
interface PaymentRequest {
  bookingId: string;
  paymentType: PaymentType;
  amount: number;
  paymentMethod: string;
  description?: string;
}

interface PaymentResponse {
  success: boolean;
  checkoutUrl?: string;
  paymentId?: string;
  message?: string;
  error?: string;
}

type PaymentType = 'downpayment' | 'full_payment' | 'remaining_balance';
```

## Integration Points

### Main Booking Component Integration
The refactored `IndividualBookings.tsx` serves as the main orchestrator:

```typescript
// Import modular components
import {
  BookingStatsCards,
  BookingFilters,
  BookingCard,
  BookingDetailsModal
} from './components';

// Import payment components
import { PaymentModal } from '../payment/components';
import { paymentService } from '../payment/services';
```

### Backend Integration
The payment microservice is integrated into the main server:

```typescript
// server/index.ts
import paymentRoutes from '../backend/api/payment/routes';
app.use('/api/payment', paymentRoutes);
```

## PayMongo Integration

### Frontend Integration
- **Checkout Creation**: Frontend creates checkout sessions via payment service
- **Redirect Flow**: Users are redirected to PayMongo hosted checkout
- **Webhook Processing**: Backend handles payment completion webhooks

### Backend Integration
- **API Keys**: Configured via environment variables
- **Webhook Security**: Webhook signature verification
- **Receipt Generation**: Automatic receipt creation and email delivery

## Benefits of Refactoring

### 1. Modularity
- **Component Separation**: Each UI component has a single responsibility
- **Service Separation**: Payment logic is isolated from booking logic
- **Type Safety**: Strong typing across all modules

### 2. Maintainability
- **Easier Testing**: Components can be tested in isolation
- **Code Reusability**: Components can be reused across different pages
- **Clear Dependencies**: Import/export structure makes dependencies explicit

### 3. Scalability
- **Micro Frontend Ready**: Structure supports future micro frontend deployment
- **Independent Development**: Teams can work on different modules independently
- **Performance**: Code splitting and lazy loading potential

### 4. Developer Experience
- **Better IntelliSense**: Strong typing improves IDE support
- **Clearer Code Organization**: Easy to find and modify specific functionality
- **Consistent Patterns**: Established patterns for future development

## Usage Examples

### Using Booking Components
```typescript
import { BookingCard } from './components';

<BookingCard
  booking={booking}
  onViewDetails={handleViewDetails}
  onPayment={handlePayment}
/>
```

### Using Payment Service
```typescript
import { paymentService } from '../payment/services';

const result = await paymentService.processPayment({
  bookingId: 'booking_123',
  paymentType: 'downpayment',
  amount: 50000,
  paymentMethod: 'card'
});
```

## Future Enhancements

### 1. Micro Frontend Deployment
- **Module Federation**: Implement Webpack Module Federation
- **Independent Deployment**: Deploy booking and payment modules separately
- **Shared Library**: Extract common components to shared library

### 2. Enhanced Payment Features
- **Multiple Payment Methods**: Add support for bank transfers, e-wallets
- **Payment Plans**: Implement installment payment options
- **Automatic Reminders**: Email/SMS payment reminders

### 3. Advanced Booking Features
- **Calendar Integration**: Sync with external calendars
- **Booking Templates**: Save and reuse booking configurations
- **Bulk Operations**: Support for multiple booking operations

## Testing Strategy

### Unit Testing
- **Component Testing**: Test each component in isolation
- **Service Testing**: Test payment service with mocked APIs
- **Type Testing**: Ensure type safety across modules

### Integration Testing
- **Payment Flow**: End-to-end payment processing tests
- **Booking Workflow**: Complete booking lifecycle tests
- **API Integration**: Backend microservice integration tests

## Deployment Considerations

### Environment Variables
```bash
# PayMongo Configuration
PAYMONGO_SECRET_KEY=sk_test_...
PAYMONGO_PUBLIC_KEY=pk_test_...

# Database Configuration
DATABASE_URL=postgresql://...
NEON_DATABASE_URL=postgresql://...

# Server Configuration
BACKEND_PORT=3001
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Build Configuration
- **Production Build**: Optimized for production deployment
- **Code Splitting**: Automatic code splitting for better performance
- **Bundle Analysis**: Regular bundle size monitoring

## Conclusion

The refactoring successfully transforms the monolithic booking system into a modular, maintainable, and scalable architecture. The new structure supports future growth, improves developer experience, and provides a solid foundation for micro frontend deployment.

The implementation maintains backward compatibility while introducing modern development patterns and best practices. The modular structure allows for independent development and testing of different features, making the codebase more robust and maintainable.
