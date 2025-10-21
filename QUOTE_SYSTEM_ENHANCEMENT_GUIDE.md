# Quote System Enhancement - Implementation Guide

## Overview
This document outlines the implementation of a proper quote system that stores quoted prices, deposits, and itemization in the database.

## Phase 1: Database Migration ✅ READY

### Step 1: Run Migration Script
```bash
# On Render.com or your server with DATABASE_URL set
node add-quote-fields-migration.cjs
```

### What It Adds:
- `quoted_price` (NUMERIC(10,2)) - Total price quoted by vendor
- `quoted_deposit` (NUMERIC(10,2)) - Deposit amount (usually 30%)
- `quote_itemization` (JSONB) - Service breakdown with line items
- `quote_sent_date` (TIMESTAMP) - When the quote was sent
- `quote_valid_until` (TIMESTAMP) - Quote expiration date

### Expected JSONB Structure for `quote_itemization`:
```json
{
  "items": [
    {
      "name": "Wedding Photography Package",
      "description": "8 hours coverage + digital album",
      "quantity": 1,
      "unitPrice": 45000,
      "total": 45000
    },
    {
      "name": "Engagement Shoot",
      "description": "2 hours pre-wedding session",
      "quantity": 1,
      "unitPrice": 8000,
      "total": 8000
    }
  ],
  "subtotal": 53000,
  "discount": 3000,
  "discountReason": "Early bird discount",
  "total": 50000,
  "deposit": 15000,
  "depositPercentage": 30,
  "notes": "Balance due 1 week before event",
  "validUntil": "2026-01-15",
  "termsAndConditions": [
    "50% refund if cancelled 30+ days before event",
    "No refund if cancelled within 7 days",
    "Rescheduling allowed once (no fee)"
  ]
}
```

## Phase 2: Backend API Enhancement

### New Endpoint: Send Quote with Itemization
**Endpoint**: `PUT /api/bookings/:bookingId/send-quote`

**Request Body**:
```json
{
  "quotedPrice": 50000,
  "quotedDeposit": 15000,
  "itemization": {
    "items": [
      {
        "name": "Service Item",
        "description": "Description",
        "quantity": 1,
        "unitPrice": 50000,
        "total": 50000
      }
    ],
    "subtotal": 50000,
    "discount": 0,
    "total": 50000,
    "deposit": 15000,
    "depositPercentage": 30,
    "notes": "Additional notes",
    "validUntil": "2026-01-15",
    "termsAndConditions": []
  },
  "vendorNotes": "Custom message to couple",
  "validityDays": 30
}
```

**Response**:
```json
{
  "success": true,
  "booking": {
    "id": "1760918159",
    "status": "quote_sent",
    "quoted_price": 50000,
    "quoted_deposit": 15000,
    "quote_itemization": { ... },
    "quote_sent_date": "2025-10-21T01:00:00Z",
    "quote_valid_until": "2025-11-20T01:00:00Z"
  },
  "message": "Quote sent successfully"
}
```

## Phase 3: Frontend Integration

### VendorBookings.tsx Changes
- Update quote sending form to include itemization builder
- Allow vendors to add multiple line items
- Calculate totals automatically
- Set deposit percentage (default 30%)
- Add quote validity period

### IndividualBookings.tsx Changes  
- Display itemized quote when viewing quote details
- Show each line item with description and price
- Display subtotal, discounts, and total
- Show deposit amount and remaining balance
- Display quote expiration date
- Show terms and conditions

### QuoteDetailsModal.tsx Enhancement
```tsx
// Display itemization
{booking.quote_itemization && (
  <div>
    <h3>Service Breakdown</h3>
    {booking.quote_itemization.items.map(item => (
      <div key={item.name}>
        <span>{item.name}</span>
        <span>{formatCurrency(item.total)}</span>
        {item.description && <p>{item.description}</p>}
      </div>
    ))}
    
    <div>Subtotal: {formatCurrency(booking.quote_itemization.subtotal)}</div>
    {booking.quote_itemization.discount > 0 && (
      <div>Discount: -{formatCurrency(booking.quote_itemization.discount)}</div>
    )}
    <div>Total: {formatCurrency(booking.quote_itemization.total)}</div>
    <div>Deposit (30%): {formatCurrency(booking.quote_itemization.deposit)}</div>
  </div>
)}
```

## Phase 4: Date Unavailability Tracking

### New Table: `booking_dates`
```sql
CREATE TABLE IF NOT EXISTS booking_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(50) NOT NULL REFERENCES vendors(vendor_id),
  booking_id BIGINT REFERENCES bookings(id),
  event_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'booked', -- 'booked', 'tentative', 'available'
  time_slot VARCHAR(20), -- 'full_day', 'morning', 'afternoon', 'evening'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(vendor_id, event_date, time_slot)
);

CREATE INDEX idx_booking_dates_vendor ON booking_dates(vendor_id, event_date);
CREATE INDEX idx_booking_dates_status ON booking_dates(status) WHERE status = 'booked';
```

### API Endpoints for Date Management

#### 1. Get Vendor Unavailable Dates
**GET** `/api/vendors/:vendorId/unavailable-dates`
```json
{
  "vendorId": "VENDOR-001",
  "dateRange": {
    "from": "2025-10-01",
    "to": "2026-12-31"
  },
  "unavailableDates": [
    {
      "date": "2025-12-25",
      "timeSlot": "full_day",
      "reason": "Christmas - Booked",
      "bookingId": "1760918159"
    },
    {
      "date": "2026-01-15",
      "timeSlot": "afternoon",
      "reason": "Wedding ceremony",
      "bookingId": "1760918160"
    }
  ]
}
```

#### 2. Check Date Availability
**POST** `/api/vendors/:vendorId/check-availability`
```json
{
  "date": "2026-02-14",
  "timeSlot": "full_day"
}

// Response
{
  "available": false,
  "reason": "Already booked for this date",
  "bookingId": "1760918161",
  "alternativeDates": ["2026-02-15", "2026-02-21"]
}
```

#### 3. Block Dates (Vendor Manual Block)
**POST** `/api/vendors/:vendorId/block-dates`
```json
{
  "dates": ["2025-12-24", "2025-12-25", "2025-12-26"],
  "timeSlot": "full_day",
  "reason": "Holiday period - not accepting bookings",
  "notes": "Family vacation"
}
```

### Automatic Date Blocking on Booking Confirmation
When a booking is confirmed or deposit is paid:
```javascript
// In backend booking confirmation handler
async function blockVendorDate(vendorId, eventDate, bookingId) {
  await sql`
    INSERT INTO booking_dates (vendor_id, event_date, booking_id, status, time_slot)
    VALUES (${vendorId}, ${eventDate}, ${bookingId}, 'booked', 'full_day')
    ON CONFLICT (vendor_id, event_date, time_slot) 
    DO UPDATE SET 
      booking_id = ${bookingId},
      status = 'booked',
      updated_at = NOW()
  `;
}
```

### Frontend Calendar Integration
```tsx
// In Services or Vendor Profile
const { unavailableDates } = await fetch(`/api/vendors/${vendorId}/unavailable-dates?from=2025-10-01&to=2026-12-31`);

<DatePicker
  unavailableDates={unavailableDates.map(d => new Date(d.date))}
  minDate={new Date()}
  onChange={(date) => handleDateSelect(date)}
  highlighted={unavailableDates.filter(d => d.status === 'tentative')}
/>
```

## Implementation Priority

### Priority 1: Database Migration (5 minutes)
1. Run `add-quote-fields-migration.cjs` on production
2. Verify columns exist in database
3. Test with existing bookings

### Priority 2: Backend Quote API (30 minutes)
1. Create `/send-quote` endpoint with itemization support
2. Update status update endpoint to use new fields
3. Add validation for quote data
4. Test quote sending and retrieval

### Priority 3: Frontend Quote Display (45 minutes)
1. Update VendorBookings quote form with itemization builder
2. Enhance QuoteDetailsModal to show itemization
3. Update IndividualBookings to display quoted_price
4. Test end-to-end quote flow

### Priority 4: Date Unavailability (1-2 hours)
1. Create booking_dates table
2. Implement date blocking on booking confirmation
3. Create API endpoints for date management
4. Integrate calendar with unavailable dates
5. Test booking flow with date conflicts

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Vendor can send quote with itemization
- [ ] Couple sees itemized quote in bookings
- [ ] Quoted price displays correctly
- [ ] Deposit amount calculated from quoted price
- [ ] Payment uses quoted amounts
- [ ] Date is blocked when booking confirmed
- [ ] Vendor calendar shows unavailable dates
- [ ] Couple booking flow checks date availability
- [ ] Date is unblocked when booking cancelled

## Deployment Steps

1. **Database Migration**:
   ```bash
   # SSH into Render backend
   node add-quote-fields-migration.cjs
   ```

2. **Backend Deployment**:
   ```bash
   git add backend-deploy/routes/bookings.cjs
   git commit -m "feat: Add quote itemization and date blocking"
   git push origin main
   # Render auto-deploys
   ```

3. **Frontend Deployment**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

4. **Verification**:
   - Test quote sending from vendor account
   - Test quote viewing from couple account
   - Test date blocking on confirmation
   - Test calendar integration

## Benefits

✅ **Proper Price Storage**: Quoted prices stored in database, not notes
✅ **Itemization**: Transparent breakdown of costs for couples
✅ **Date Management**: Prevent double-bookings automatically
✅ **Better UX**: Clear quote details with terms and conditions
✅ **Audit Trail**: Track when quotes sent, accepted, expired
✅ **Vendor Calendar**: See all booked dates at a glance
✅ **Conflict Prevention**: System prevents booking unavailable dates
