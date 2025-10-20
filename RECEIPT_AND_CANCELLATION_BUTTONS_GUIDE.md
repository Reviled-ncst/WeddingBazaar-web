# Receipt and Cancellation Buttons - User Guide

## 📍 Button Location

The **View Receipt** and **Cancel/Request Cancellation** buttons are located in the **Individual Bookings** page at:
- **Path**: `/individual/bookings`
- **Component**: `IndividualBookings.tsx`
- **Location**: Inside each booking card, below the booking details

## 🎨 UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  📷 Photography - Test Wedding Services                 │
│  💚 Deposit Paid                                        │
├─────────────────────────────────────────────────────────┤
│  📅 Wed, Oct 29, 2025  (9 days away)                   │
│  📍 Indang, Cavite, Calabarzon, Philippines            │
│                                                          │
│  Total Amount:     ₱45,000                              │
│  Balance:          ₱45,000                              │
├─────────────────────────────────────────────────────────┤
│  [💵 Pay Balance]        <- Payment button              │
│  [📄 View Receipt]       <- Receipt viewing button      │
│  [❌ Request Cancellation] <- Cancellation button       │
│  [📞 Contact Vendor]     <- Contact button              │
└─────────────────────────────────────────────────────────┘
```

## 🔘 Button Behavior

### 1. View Receipt Button 📄
**When Shown**: Appears for bookings with payment status:
- ✅ `deposit_paid` - Deposit has been paid
- ✅ `downpayment_paid` - Downpayment has been paid
- ✅ `fully_paid` - Full amount has been paid
- ✅ `paid_in_full` - Payment complete
- ✅ `completed` - Booking completed

**What It Does**:
1. Fetches all receipts for the booking from backend
2. Displays formatted receipt with:
   - Receipt number
   - Payment date and time
   - Vendor and service details
   - Payment amount and method
   - Customer information
   - Total paid and remaining balance
   - Transaction ID

**Backend Endpoint**: `GET /api/payment/receipts/:bookingId`

**Example Receipt Format**:
```
WEDDING BAZAAR RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Receipt #: WB-2024-0001
Date: October 21, 2024, 10:30 AM

PAYMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vendor: Perfect Weddings Co.
Service: Photography
Event Date: October 29, 2025

Payment Type: DEPOSIT
Amount: ₱15,000.00
Method: Card (ending in 4242)

CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: John & Jane Doe
Email: couple@example.com

PAYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Paid: ₱15,000.00
Remaining Balance: ₱30,000.00

Transaction ID: pi_xxx...xxx
```

---

### 2. Cancellation Button ❌
**Button Text Changes Based on Status**:
- 🔵 "Cancel Booking" - For `request` or `quote_requested` status
- 🔴 "Request Cancellation" - For all other active statuses

**When Shown**: Appears for all bookings except:
- ❌ `cancelled` - Already cancelled
- ❌ `completed` - Booking completed

**Cancellation Logic**:

#### A. Direct Cancellation (No Approval Required)
**For Status**: `request` or `quote_requested`
- User can cancel immediately
- No vendor/admin approval needed
- Booking status changes to `cancelled` instantly

**Process**:
1. User clicks "Cancel Booking"
2. Confirmation dialog appears
3. If confirmed, booking is cancelled immediately
4. Status updates to `cancelled` in database

**Backend Endpoint**: `POST /api/bookings/:bookingId/cancel`

**Use Case**: Cancel bookings during initial inquiry phase before quotes are sent or accepted.

---

#### B. Cancellation Request (Requires Approval)
**For Status**: 
- `quote_sent`
- `quote_accepted`
- `approved`
- `confirmed`
- `deposit_paid`
- `downpayment_paid`
- `fully_paid`
- `paid_in_full`

**Process**:
1. User clicks "Request Cancellation"
2. Confirmation dialog explains approval is required
3. If confirmed, cancellation request is submitted
4. Booking status changes to `pending_cancellation`
5. Vendor and admin are notified (future feature)
6. Vendor or admin must approve the cancellation

**Backend Endpoint**: `POST /api/bookings/:bookingId/request-cancellation`

**Use Case**: Cancel bookings with quotes, confirmations, or payments where vendor/admin approval is needed for refunds or contract termination.

---

## 🔒 Security Features

### Authorization
- User ID is verified against booking owner
- Only the booking owner can view receipts or request cancellation
- Backend validates user ownership before processing

### Error Handling
- Clear error messages for failed operations
- User-friendly feedback for all actions
- Comprehensive backend logging for debugging

---

## 🛠️ Technical Implementation

### Frontend Service
**File**: `src/shared/services/bookingActionsService.ts`

```typescript
// Get receipts for a booking
export async function getBookingReceipts(bookingId: string): Promise<Receipt[]>

// Cancel booking directly (request status only)
export async function cancelBooking(
  bookingId: string, 
  request: CancelBookingRequest
): Promise<CancelBookingResponse>

// Request cancellation (requires approval)
export async function requestCancellation(
  bookingId: string, 
  request: CancelBookingRequest
): Promise<CancelBookingResponse>

// Format receipt for display
export function formatReceipt(receipt: Receipt): string
```

### Backend Endpoints

#### 1. Get Receipts
```javascript
GET /api/payment/receipts/:bookingId

Response:
{
  "success": true,
  "receipts": [
    {
      "id": "receipt-uuid",
      "bookingId": "booking-uuid",
      "receiptNumber": "WB-2024-0001",
      "paymentType": "deposit",
      "amount": 1500000, // centavos
      "currency": "PHP",
      "paymentMethod": "card",
      "paymentIntentId": "pi_xxx",
      "paidBy": "user-uuid",
      "paidByName": "John Doe",
      "paidByEmail": "john@example.com",
      "vendorId": "vendor-uuid",
      "vendorName": "Perfect Weddings Co.",
      "serviceType": "Photography",
      "eventDate": "2025-10-29",
      "totalPaid": 1500000,
      "remainingBalance": 3000000,
      "notes": null,
      "createdAt": "2024-10-21T10:30:00Z"
    }
  ]
}
```

#### 2. Direct Cancellation
```javascript
POST /api/bookings/:bookingId/cancel

Request:
{
  "userId": "user-uuid",
  "reason": "Changed our minds"
}

Response:
{
  "success": true,
  "message": "Booking cancelled successfully",
  "bookingId": "booking-uuid",
  "newStatus": "cancelled"
}
```

#### 3. Cancellation Request
```javascript
POST /api/bookings/:bookingId/request-cancellation

Request:
{
  "userId": "user-uuid",
  "reason": "Need to reschedule event"
}

Response:
{
  "success": true,
  "message": "Cancellation request submitted successfully. The vendor and admin will review your request.",
  "bookingId": "booking-uuid",
  "newStatus": "pending_cancellation",
  "requiresApproval": true
}
```

---

## 🎯 User Experience Flow

### Receipt Viewing Flow
```
User on Bookings Page
     ↓
Sees booking with "Deposit Paid" status
     ↓
Clicks "View Receipt" button
     ↓
Frontend calls: getBookingReceipts(bookingId)
     ↓
Backend fetches receipts from database
     ↓
Receipt modal displays with formatted data
     ↓
User can download or print receipt
```

### Cancellation Flow - Request Status
```
User on Bookings Page
     ↓
Sees booking with "Awaiting Quote" status
     ↓
Clicks "Cancel Booking" button
     ↓
Confirmation dialog appears
     ↓
User confirms cancellation
     ↓
Frontend calls: cancelBooking(bookingId, {userId, reason})
     ↓
Backend validates user owns booking
     ↓
Backend updates status to 'cancelled'
     ↓
Booking card updates instantly
     ↓
Success notification displayed
```

### Cancellation Flow - Paid Status
```
User on Bookings Page
     ↓
Sees booking with "Deposit Paid" status
     ↓
Clicks "Request Cancellation" button
     ↓
Confirmation dialog explains approval needed
     ↓
User provides cancellation reason
     ↓
Frontend calls: requestCancellation(bookingId, {userId, reason})
     ↓
Backend validates user owns booking
     ↓
Backend updates status to 'pending_cancellation'
     ↓
Backend stores reason in notes
     ↓
Vendor & admin notified (future feature)
     ↓
Booking card shows "Pending Cancellation" status
     ↓
User waits for vendor/admin approval
```

---

## 🚀 Testing Guide

### Test Receipt Viewing
1. Login as an individual user
2. Navigate to Bookings page (`/individual/bookings`)
3. Find a booking with payment (should have "Deposit Paid" or "Fully Paid" badge)
4. Click "View Receipt" button
5. Verify receipt modal displays with all details
6. Check formatting, amounts, and transaction ID

### Test Direct Cancellation
1. Login as an individual user
2. Navigate to Bookings page
3. Find a booking with "Awaiting Quote" status
4. Click "Cancel Booking" button
5. Confirm in dialog
6. Verify booking status changes to "Cancelled"
7. Refresh page and confirm status persists

### Test Cancellation Request
1. Login as an individual user
2. Navigate to Bookings page
3. Find a booking with "Deposit Paid" or "Confirmed" status
4. Click "Request Cancellation" button
5. Enter reason in dialog
6. Confirm request
7. Verify status changes to "Pending Cancellation"
8. Check database for correct notes format

---

## 📊 Database Schema

### Receipts Table
```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  payment_type VARCHAR(20) NOT NULL, -- 'deposit', 'balance', 'full'
  amount INTEGER NOT NULL, -- in centavos
  currency VARCHAR(3) DEFAULT 'PHP',
  payment_method VARCHAR(50) NOT NULL, -- 'card', 'gcash', etc.
  payment_intent_id VARCHAR(255),
  paid_by UUID NOT NULL REFERENCES users(id),
  paid_by_name VARCHAR(255),
  paid_by_email VARCHAR(255),
  total_paid INTEGER NOT NULL,
  remaining_balance INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Booking Status Values
```sql
-- Status values that trigger receipt button:
'deposit_paid'
'downpayment_paid'
'fully_paid'
'paid_in_full'
'completed'

-- Status values for direct cancellation:
'request'
'quote_requested'

-- Status values for cancellation request:
'quote_sent'
'quote_accepted'
'approved'
'confirmed'
'deposit_paid'
'downpayment_paid'
'fully_paid'
'paid_in_full'

-- Final statuses (no cancellation allowed):
'cancelled'
'completed'
```

---

## 🔄 Status Transitions

### Normal Booking Flow
```
request
  ↓
quote_requested
  ↓
quote_sent
  ↓
quote_accepted
  ↓
approved/confirmed
  ↓
deposit_paid
  ↓
fully_paid
  ↓
completed
```

### Cancellation Flows

#### Direct Cancellation
```
request ──→ cancelled
quote_requested ──→ cancelled
```

#### Cancellation Request
```
quote_sent ──→ pending_cancellation ──→ cancelled (after approval)
approved ──→ pending_cancellation ──→ cancelled (after approval)
deposit_paid ──→ pending_cancellation ──→ cancelled (after approval)
```

---

## 🎨 Button Styling

### View Receipt Button
```css
/* Purple gradient with hover effects */
bg-gradient-to-r from-purple-500 to-indigo-500
text-white rounded-xl
hover:shadow-lg hover:scale-105
```

### Cancel Booking Button
```css
/* Red outline with hover effects */
bg-white border-2 border-red-200
text-red-600 rounded-xl
hover:bg-red-50
```

---

## ✅ Deployment Status

### Backend
- ✅ Receipt endpoint deployed
- ✅ Direct cancellation endpoint deployed
- ✅ Cancellation request endpoint deployed
- ✅ Database receipts table created
- ✅ Authorization checks in place

### Frontend
- ✅ Button components integrated
- ✅ Service functions implemented
- ✅ UI handlers connected
- ✅ Error handling complete
- ✅ Loading states added

### Production URLs
- **Frontend**: https://weddingbazaar-web.web.app
- **Backend**: https://weddingbazaar-web.onrender.com

---

## 🐛 Known Issues & Limitations

1. **Receipt Modal**: Currently uses alert, needs proper modal UI
2. **Vendor Notification**: Cancellation requests don't trigger notifications yet
3. **Admin Approval**: No admin interface for approving cancellations yet
4. **Refund Processing**: No automatic refund processing for paid cancellations
5. **Email Notifications**: No email sent to user after cancellation

---

## 🚀 Future Enhancements

1. **Enhanced Receipt Modal**:
   - Beautiful modal with receipt design
   - Download as PDF option
   - Email receipt option
   - Print-friendly format

2. **Cancellation Workflow**:
   - Admin approval interface
   - Vendor cancellation approval
   - Automated refund processing
   - Email notifications
   - Cancellation reason templates

3. **Receipt Features**:
   - Multiple receipt formats (detailed, simple, invoice)
   - Receipt history and archives
   - Tax invoice generation
   - Receipt search and filtering

4. **Booking Actions**:
   - Reschedule booking option
   - Transfer booking option
   - Booking modification requests
   - Dispute resolution system

---

## 📞 Support

For issues or questions:
- Check backend logs in Render dashboard
- Check frontend console for errors
- Verify database status in Neon dashboard
- Review API responses in Network tab

**Last Updated**: October 21, 2024
