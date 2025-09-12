# Wedding Bazaar Booking API - Backend Architecture

## Database Schema

### 1. **Core Booking Table**
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(50) UNIQUE NOT NULL,
  
  -- Vendor Information
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  vendor_name VARCHAR(255),
  vendor_email VARCHAR(255),
  vendor_phone VARCHAR(20),
  
  -- Customer Information  
  couple_id UUID NOT NULL REFERENCES couples(id),
  couple_name VARCHAR(255),
  contact_person VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  preferred_contact_method VARCHAR(20) CHECK (preferred_contact_method IN ('phone', 'email', 'both')),
  
  -- Service Details
  service_type VARCHAR(100) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  service_description TEXT,
  
  -- Event Information
  event_date DATE NOT NULL,
  event_time TIME,
  event_location TEXT,
  venue_details TEXT,
  guest_count INTEGER,
  special_requests TEXT,
  
  -- Pricing & Payments
  quoted_price DECIMAL(12,2),
  final_price DECIMAL(12,2),
  downpayment_amount DECIMAL(12,2),
  total_paid DECIMAL(12,2) DEFAULT 0,
  remaining_balance DECIMAL(12,2) GENERATED ALWAYS AS (COALESCE(final_price, quoted_price, 0) - COALESCE(total_paid, 0)) STORED,
  budget_range VARCHAR(50),
  
  -- Status & Workflow
  status VARCHAR(50) NOT NULL DEFAULT 'quote_requested' CHECK (
    status IN (
      'draft', 'quote_requested', 'quote_sent', 'quote_accepted', 'quote_rejected',
      'confirmed', 'downpayment_paid', 'paid_in_full', 'in_progress', 
      'completed', 'cancelled', 'refunded', 'disputed'
    )
  ),
  vendor_response TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_bookings_couple_id ON bookings(couple_id);
CREATE INDEX idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
```

### 2. **Payment Tracking Table**
```sql
CREATE TABLE booking_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Payment Details
  amount DECIMAL(12,2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL CHECK (
    payment_type IN ('downpayment', 'partial_payment', 'full_payment', 'remaining_balance', 'refund')
  ),
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')
  ),
  
  -- External Payment Service
  external_payment_id VARCHAR(255),
  checkout_url TEXT,
  receipt_url TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  description TEXT
);
```

### 3. **Booking Status History**
```sql
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Status Change
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES users(id),
  change_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### 1. **Booking Management**
```typescript
// Get bookings with advanced filtering
GET /api/bookings/enhanced
Query Parameters:
  - coupleId: string (required)
  - vendorId?: string
  - status?: BookingStatus | BookingStatus[]
  - dateFrom?: string (ISO date)
  - dateTo?: string (ISO date)
  - serviceType?: string
  - page?: number (default: 1)
  - limit?: number (default: 10)
  - sortBy?: 'created_at' | 'event_date' | 'updated_at' | 'final_price'
  - sortOrder?: 'asc' | 'desc'

Response:
{
  bookings: ComprehensiveBooking[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

```typescript
// Get booking statistics
GET /api/bookings/enhanced/stats/{userId}
Query Parameters:
  - userType: 'couple' | 'vendor' | 'admin'
  - dateFrom?: string
  - dateTo?: string

Response:
{
  total_bookings: number,
  pending_bookings: number,
  confirmed_bookings: number,
  completed_bookings: number,
  cancelled_bookings: number,
  total_revenue: number,
  pending_payments: number,
  avg_booking_value: number,
  conversion_rate: number
}
```

```typescript
// Create new booking
POST /api/bookings/enhanced
Body: BookingRequest
{
  vendor_id: string,
  service_type: string,
  service_name: string,
  event_date: string,
  event_time?: string,
  event_location?: string,
  guest_count?: number,
  special_requests?: string,
  contact_phone?: string,
  preferred_contact_method?: string,
  budget_range?: string
}

Response: ComprehensiveBooking
```

```typescript
// Update booking
PATCH /api/bookings/enhanced/{bookingId}
Body: Partial<BookingRequest>

Response: ComprehensiveBooking
```

```typescript
// Cancel booking
DELETE /api/bookings/enhanced/{bookingId}
Query Parameters:
  - reason?: string

Response: { success: boolean, message: string }
```

### 2. **Payment Management**
```typescript
// Process payment
POST /api/bookings/enhanced/{bookingId}/payments
Body:
{
  payment_type: 'downpayment' | 'full_payment' | 'remaining_balance',
  payment_method: 'card' | 'bank_transfer' | 'gcash' | 'maya',
  amount: number,
  description?: string
}

Response:
{
  success: boolean,
  payment_id: string,
  checkout_url?: string,
  status: string
}
```

```typescript
// Get payment history
GET /api/bookings/enhanced/{bookingId}/payments

Response: BookingPayment[]
```

```typescript
// Process refund
POST /api/bookings/enhanced/{bookingId}/payments/{paymentId}/refund
Body:
{
  amount?: number, // Partial refund amount
  reason: string
}

Response:
{
  success: boolean,
  refund_id: string,
  status: string
}
```

## Service Layer Architecture

### 1. **Booking Service (`bookingService.ts`)**
```typescript
class BookingService {
  async getBookings(params: BookingSearchParams): Promise<BookingsResponse> {
    const query = this.buildQuery(params);
    const bookings = await this.db.bookings.findMany(query);
    const total = await this.db.bookings.count({ where: query.where });
    
    return {
      bookings: bookings.map(this.mapToComprehensiveBooking),
      pagination: this.buildPagination(params.page, params.limit, total)
    };
  }

  async createBooking(data: BookingRequest, userId: string): Promise<ComprehensiveBooking> {
    const bookingReference = await this.generateBookingReference();
    
    const booking = await this.db.bookings.create({
      data: {
        ...data,
        booking_reference: bookingReference,
        couple_id: userId,
        status: 'quote_requested',
        created_by: userId
      }
    });

    // Send notification to vendor
    await this.notificationService.notifyVendor(booking.vendor_id, 'new_booking_request', booking);
    
    // Track analytics
    await this.analyticsService.track('booking_created', {
      booking_id: booking.id,
      vendor_id: booking.vendor_id,
      service_type: booking.service_type
    });

    return this.mapToComprehensiveBooking(booking);
  }

  async updateBookingStatus(
    bookingId: string, 
    status: BookingStatus, 
    userId: string,
    reason?: string
  ): Promise<ComprehensiveBooking> {
    const booking = await this.getBookingById(bookingId);
    
    // Validate status transition
    this.validateStatusTransition(booking.status, status);
    
    // Update booking
    const updatedBooking = await this.db.bookings.update({
      where: { id: bookingId },
      data: { 
        status, 
        updated_by: userId,
        updated_at: new Date()
      }
    });

    // Record status history
    await this.db.booking_status_history.create({
      data: {
        booking_id: bookingId,
        from_status: booking.status,
        to_status: status,
        changed_by: userId,
        change_reason: reason
      }
    });

    // Send notifications
    await this.handleStatusChangeNotifications(updatedBooking, booking.status, status);

    return this.mapToComprehensiveBooking(updatedBooking);
  }

  private validateStatusTransition(from: BookingStatus, to: BookingStatus): void {
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      'quote_requested': ['quote_sent', 'cancelled'],
      'quote_sent': ['quote_accepted', 'quote_rejected', 'cancelled'],
      'quote_accepted': ['confirmed', 'cancelled'],
      'confirmed': ['downpayment_paid', 'paid_in_full', 'in_progress', 'cancelled'],
      'downpayment_paid': ['paid_in_full', 'in_progress', 'cancelled'],
      'paid_in_full': ['in_progress', 'completed', 'refunded'],
      'in_progress': ['completed', 'cancelled'],
      'completed': ['refunded'],
      // ... more transitions
    };

    if (!validTransitions[from]?.includes(to)) {
      throw new BadRequestError(`Invalid status transition from ${from} to ${to}`);
    }
  }
}
```

### 2. **Payment Service (`paymentService.ts`)**
```typescript
class PaymentService {
  async processPayment(
    bookingId: string, 
    paymentData: PaymentRequest
  ): Promise<PaymentResponse> {
    const booking = await this.bookingService.getBookingById(bookingId);
    
    // Validate payment amount
    this.validatePaymentAmount(booking, paymentData);
    
    // Create payment record
    const payment = await this.db.booking_payments.create({
      data: {
        booking_id: bookingId,
        amount: paymentData.amount,
        payment_type: paymentData.payment_type,
        payment_method: paymentData.payment_method,
        description: paymentData.description,
        payment_status: 'pending'
      }
    });

    // Process with external payment service (PayMongo)
    const checkoutSession = await this.paymentGateway.createCheckoutSession({
      amount: paymentData.amount * 100, // Convert to cents
      currency: 'PHP',
      payment_method_types: [paymentData.payment_method],
      metadata: {
        booking_id: bookingId,
        payment_id: payment.id,
        payment_type: paymentData.payment_type
      },
      success_url: `${process.env.APP_URL}/bookings/payment-success?payment_id=${payment.id}`,
      cancel_url: `${process.env.APP_URL}/bookings/payment-cancelled?payment_id=${payment.id}`
    });

    // Update payment with external ID
    await this.db.booking_payments.update({
      where: { id: payment.id },
      data: {
        external_payment_id: checkoutSession.id,
        checkout_url: checkoutSession.checkout_url
      }
    });

    return {
      success: true,
      payment_id: payment.id,
      checkout_url: checkoutSession.checkout_url,
      status: 'pending'
    };
  }

  async handlePaymentWebhook(payload: PaymentWebhookPayload): Promise<void> {
    const payment = await this.db.booking_payments.findFirst({
      where: { external_payment_id: payload.data.id }
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    const status = this.mapPaymentStatus(payload.data.status);
    
    await this.db.booking_payments.update({
      where: { id: payment.id },
      data: {
        payment_status: status,
        completed_at: status === 'completed' ? new Date() : null
      }
    });

    if (status === 'completed') {
      // Update booking payment total
      await this.updateBookingPaymentTotal(payment.booking_id);
      
      // Update booking status if needed
      await this.updateBookingStatusAfterPayment(payment);
      
      // Send confirmation notifications
      await this.notificationService.sendPaymentConfirmation(payment);
    }
  }

  private async updateBookingStatusAfterPayment(payment: BookingPayment): Promise<void> {
    const booking = await this.bookingService.getBookingById(payment.booking_id);
    
    let newStatus: BookingStatus | null = null;
    
    if (payment.payment_type === 'downpayment') {
      newStatus = 'downpayment_paid';
    } else if (payment.payment_type === 'full_payment' || booking.remaining_balance <= 0) {
      newStatus = 'paid_in_full';
    }
    
    if (newStatus) {
      await this.bookingService.updateBookingStatus(
        payment.booking_id, 
        newStatus, 
        booking.couple_id, // System update
        `Automatic update after ${payment.payment_type} payment`
      );
    }
  }
}
```

### 3. **Analytics Service (`analyticsService.ts`)**
```typescript
class AnalyticsService {
  async getBookingStats(
    userId: string, 
    userType: 'couple' | 'vendor' | 'admin',
    dateRange?: { from: Date; to: Date }
  ): Promise<BookingStats> {
    const whereClause = this.buildWhereClause(userId, userType, dateRange);
    
    const [bookingCounts, paymentStats] = await Promise.all([
      this.db.bookings.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { _all: true }
      }),
      this.db.bookings.aggregate({
        where: whereClause,
        _sum: {
          final_price: true,
          total_paid: true
        },
        _avg: {
          final_price: true
        }
      })
    ]);

    const statusCounts = bookingCounts.reduce((acc, item) => {
      acc[item.status] = item._count._all;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_bookings: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
      pending_bookings: (statusCounts.quote_requested || 0) + (statusCounts.quote_sent || 0),
      confirmed_bookings: statusCounts.confirmed || 0,
      completed_bookings: statusCounts.completed || 0,
      cancelled_bookings: statusCounts.cancelled || 0,
      total_revenue: paymentStats._sum.final_price || 0,
      pending_payments: (paymentStats._sum.final_price || 0) - (paymentStats._sum.total_paid || 0),
      avg_booking_value: paymentStats._avg.final_price || 0,
      conversion_rate: this.calculateConversionRate(statusCounts)
    };
  }

  private calculateConversionRate(statusCounts: Record<string, number>): number {
    const totalInquiries = (statusCounts.quote_requested || 0) + (statusCounts.quote_sent || 0);
    const conversions = (statusCounts.confirmed || 0) + (statusCounts.completed || 0);
    
    return totalInquiries > 0 ? (conversions / totalInquiries) * 100 : 0;
  }
}
```

## Error Handling

### 1. **Custom Error Classes**
```typescript
class BookingError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'BOOKING_ERROR'
  ) {
    super(message);
    this.name = 'BookingError';
  }
}

class PaymentError extends BookingError {
  constructor(message: string, statusCode: number = 402) {
    super(message, statusCode, 'PAYMENT_ERROR');
    this.name = 'PaymentError';
  }
}
```

### 2. **Error Middleware**
```typescript
const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof BookingError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error:', error);
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }
  });
};
```

## Testing Strategy

### 1. **Unit Tests**
```typescript
describe('BookingService', () => {
  let bookingService: BookingService;
  let mockDb: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockDb = createMockPrismaClient();
    bookingService = new BookingService(mockDb);
  });

  it('should create a booking with valid data', async () => {
    const bookingData = createMockBookingRequest();
    mockDb.bookings.create.mockResolvedValue(createMockBooking());

    const result = await bookingService.createBooking(bookingData, 'user-id');

    expect(result).toMatchObject({
      id: expect.any(String),
      booking_reference: expect.stringMatching(/WB-\d{4}-\d{3}/),
      status: 'quote_requested'
    });
    expect(mockDb.bookings.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ...bookingData,
        couple_id: 'user-id',
        status: 'quote_requested'
      })
    });
  });
});
```

### 2. **Integration Tests**
```typescript
describe('Booking API Integration', () => {
  it('should handle complete booking flow', async () => {
    // Create booking
    const createResponse = await request(app)
      .post('/api/bookings/enhanced')
      .set('Authorization', `Bearer ${userToken}`)
      .send(mockBookingRequest)
      .expect(201);

    // Vendor updates with quote
    await request(app)
      .patch(`/api/bookings/enhanced/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ status: 'quote_sent', quoted_price: 50000 })
      .expect(200);

    // Customer accepts quote
    await request(app)
      .patch(`/api/bookings/enhanced/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'quote_accepted' })
      .expect(200);

    // Process payment
    const paymentResponse = await request(app)
      .post(`/api/bookings/enhanced/${createResponse.body.id}/payments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        payment_type: 'downpayment',
        payment_method: 'card',
        amount: 15000
      })
      .expect(200);

    expect(paymentResponse.body).toMatchObject({
      success: true,
      checkout_url: expect.any(String)
    });
  });
});
```

This backend architecture provides a robust, scalable foundation for the booking system with comprehensive error handling, payment processing, and analytics capabilities.
