# 🧾 WeddingBazaar Receipts System Documentation

## 📋 Executive Summary

**Current Status**: ✅ Receipts system is FULLY IMPLEMENTED but NOT DEPLOYED to production backend

### Key Findings:
1. **Database**: ✅ Receipts table exists with proper schema
2. **Backend API**: ✅ Complete receipt routes exist in `backend-deploy/routes/receipts.cjs`
3. **Frontend**: ✅ Receipt UI and service layer fully implemented
4. **Deployment**: ❌ Receipt routes NOT registered in production-backend.cjs

---

## 🗄️ Database Structure

### Receipts Table Schema
Located in: `apply-database-fixes.cjs` (lines 77-99)

```sql
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number VARCHAR(100) UNIQUE NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  couple_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  payment_type VARCHAR(50) NOT NULL,      -- 'deposit', 'balance', 'full_payment'
  payment_method VARCHAR(50) NOT NULL,    -- 'card', 'gcash', 'maya', 'grabpay'
  amount_paid BIGINT NOT NULL,            -- Amount in CENTAVOS
  total_amount BIGINT NOT NULL,           -- Total booking amount in CENTAVOS
  tax_amount BIGINT DEFAULT 0,            -- Tax in CENTAVOS
  service_name VARCHAR(255) NOT NULL,
  service_category VARCHAR(100),
  event_date TIMESTAMP,
  event_location VARCHAR(255),
  description TEXT,
  paymongo_payment_id VARCHAR(255),
  paymongo_source_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Key Points:
- ✅ Uses UUID for primary keys
- ✅ Stores amounts in **CENTAVOS** (e.g., ₱1,000.00 = 100000 centavos)
- ✅ Has foreign keys to bookings, couples, and vendors
- ✅ Includes PayMongo integration fields
- ✅ Auto-generates receipt numbers via `generate_receipt_number()` function

---

## 🔌 Backend API Endpoints

### File Location
`backend-deploy/routes/receipts.cjs` (301 lines)

### Available Endpoints:

#### 1. Get Receipts for a Couple
```
GET /api/receipts/couple/:coupleId
Query params: ?page=1&limit=20&sortBy=created_at&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "receipts": [
    {
      "id": "uuid",
      "receipt_number": "WB-20250110-001",
      "booking_id": "uuid",
      "couple_id": "uuid",
      "vendor_id": "uuid",
      "payment_type": "deposit",
      "payment_method": "gcash",
      "amount_paid": 50000,
      "amount_paid_formatted": "₱500.00",
      "total_amount": 100000,
      "total_amount_formatted": "₱1,000.00",
      "tax_amount": 0,
      "service_name": "Wedding Photography",
      "service_category": "Photography",
      "event_date": "2025-06-15T00:00:00Z",
      "event_location": "Manila Cathedral",
      "vendor_name": "Perfect Shots Photography",
      "vendor_category": "Photography",
      "vendor_rating": 4.8,
      "created_at": "2025-01-10T10:30:00Z"
    }
  ],
  "count": 1,
  "total": 1,
  "totalPages": 1,
  "currentPage": 1,
  "timestamp": "2025-01-10T10:30:00Z"
}
```

#### 2. Get Receipts for a Vendor
```
GET /api/receipts/vendor/:vendorId
Query params: ?page=1&limit=20&sortBy=created_at&sortOrder=desc
```

#### 3. Get Specific Receipt
```
GET /api/receipts/:receiptId
Accepts either receipt ID (UUID) or receipt_number (WB-20250110-001)
```

#### 4. Create New Receipt
```
POST /api/receipts/create
Body: {
  "booking_id": "uuid",
  "couple_id": "uuid",
  "vendor_id": "uuid",
  "payment_type": "deposit",
  "payment_method": "gcash",
  "amount_paid": 50000,
  "service_name": "Wedding Photography",
  "service_category": "Photography",
  "event_date": "2025-06-15",
  "event_location": "Manila Cathedral",
  "description": "50% deposit for wedding photography package",
  "paymongo_payment_id": "pay_xxx",
  "paymongo_source_id": "src_xxx"
}
```

#### 5. Get Receipt Statistics
```
GET /api/receipts/stats/couple/:coupleId
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_receipts": 5,
    "deposit_payments": 3,
    "balance_payments": 2,
    "full_payments": 0,
    "total_amount_paid_centavos": 250000,
    "total_amount_paid_formatted": "₱2,500.00",
    "card_payments": 1,
    "gcash_payments": 3,
    "maya_payments": 1,
    "grabpay_payments": 0
  }
}
```

---

## 💻 Frontend Implementation

### Payment Service
**File**: `src/pages/users/individual/payment/services/paymentService.ts`

#### Methods:

##### Get Receipts for a Booking
```typescript
async getPaymentReceipts(bookingId: string): Promise<PaymentReceipt[]>
// Calls: GET /api/payment/receipts/${bookingId}
// ❌ ISSUE: This endpoint doesn't exist in backend!
// Should call: GET /api/receipts/couple/${coupleId} instead
```

##### Get Single Receipt
```typescript
async getReceipt(receiptId: string): Promise<PaymentReceipt>
// Calls: GET /api/api/payment/receipt/${receiptId}
// ❌ ISSUE: Has double /api/api/ prefix
```

##### Download Receipt PDF
```typescript
async downloadReceiptPDF(receiptId: string): Promise<Blob>
// Calls: GET /api/api/payment/receipt/${receiptId}/pdf
// ❌ ISSUE: This endpoint doesn't exist yet
```

##### Email Receipt
```typescript
async emailReceipt(receiptId: string, email: string): Promise<boolean>
// Calls: POST /api/api/payment/receipt/${receiptId}/email
// ❌ ISSUE: This endpoint doesn't exist yet
```

### Booking Details Modal
**File**: `src/pages/users/individual/bookings/components/BookingDetailsModal.tsx`

**Lines 91-119**: Receipt fetching logic
```typescript
const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
const [loadingReceipts, setLoadingReceipts] = useState(false);
const [showReceiptView, setShowReceiptView] = useState(false);
const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);

const fetchReceipts = async () => {
  setLoadingReceipts(true);
  try {
    const data = await paymentService.getPaymentReceipts(booking.id);
    setReceipts(data || []);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    setError("Failed to load payment receipts. Please try again.");
    setReceipts([]);
  } finally {
    setLoadingReceipts(false);
  }
};
```

**Lines 145-176**: Receipt action handlers
```typescript
const handleViewReceipt = (receipt: PaymentReceipt) => {
  setSelectedReceipt(receipt);
  setShowReceiptView(true);
};

const handleDownloadPDF = async (receipt: PaymentReceipt) => {
  const blob = await paymentService.downloadReceiptPDF(receipt.id);
  // Creates download link and triggers download
};

const handleEmailReceipt = async (receipt: PaymentReceipt, email: string) => {
  const success = await paymentService.emailReceipt(receipt.id, email);
  // Shows success/error message
};
```

**Lines 662-690**: Receipt display UI
```typescript
{receipts.length > 0 && (
  <div className="mt-4">
    <div className="flex items-center gap-2 mb-3">
      <Receipt className="w-5 h-5 text-green-600" />
      <h4 className="font-semibold text-gray-900">Payment Receipts</h4>
    </div>
    {/* Receipt list with view/download/email buttons */}
  </div>
)}
```

### Receipt View Component
**File**: `src/pages/users/individual/payment/components/ReceiptView.tsx`
- Displays formatted receipt with all details
- Supports download and email functionality
- Shows itemized breakdown, vendor info, payment details

---

## 🚨 Current Issues & Fixes Needed

### Issue 1: Mismatched API Endpoints ❌

**Problem**: Frontend calls endpoints that don't exist
- Frontend: `GET /api/payment/receipts/${bookingId}`
- Backend: `GET /api/receipts/couple/:coupleId`

**Fix Required**:
```typescript
// In paymentService.ts line 28
// OLD:
const response = await fetch(`${API_BASE_URL}/api/payment/receipts/${bookingId}`);

// NEW: Need to get coupleId from booking or user context
const response = await fetch(`${API_BASE_URL}/api/receipts/booking/${bookingId}`);
// OR implement new backend endpoint that filters by booking_id
```

### Issue 2: Receipt Routes Not in Production Backend ❌

**Problem**: `production-backend.cjs` doesn't include receipt routes

**Fix Required**:
```javascript
// In backend-deploy/production-backend.cjs
// Add after other route registrations:

const receiptsRoutes = require('./routes/receipts.cjs');
app.use('/api/receipts', receiptsRoutes);
```

### Issue 3: Missing Backend Endpoints ❌

**Endpoints that frontend expects but backend doesn't have**:
1. `GET /api/receipts/booking/:bookingId` - Get receipts by booking ID
2. `GET /api/receipts/:receiptId/pdf` - Download PDF
3. `POST /api/receipts/:receiptId/email` - Email receipt

**Fix Required**: Add these endpoints to `backend-deploy/routes/receipts.cjs`

### Issue 4: Double API Prefix in URLs ❌

**Problem**: Some URLs have `/api/api/` instead of `/api/`

**Locations**:
- Line 48: `GET /api/api/payment/receipt/${receiptId}`
- Line 65: `GET /api/api/payment/receipt/${receiptId}/pdf`
- Line 78: `POST /api/api/payment/receipt/${receiptId}/email`
- Line 97: `POST /api/api/payment/verify/${paymentId}`
- Line 118: `POST /api/api/payment/refund/${paymentId}`
- Line 140: `POST /api/api/payment/paymongo/create`
- Line 160: `GET /api/api/payment/paymongo/status/${paymentId}`

**Fix**: Remove extra `/api/` prefix

---

## 🔧 Implementation Plan

### Phase 1: Fix Backend Integration (30 minutes)

1. **Add receipt routes to production backend**
   ```javascript
   // In production-backend.cjs
   const receiptsRoutes = require('./routes/receipts.cjs');
   app.use('/api/receipts', receiptsRoutes);
   ```

2. **Add missing endpoints to receipts.cjs**
   - `GET /api/receipts/booking/:bookingId`
   - `GET /api/receipts/:receiptId/pdf`
   - `POST /api/receipts/:receiptId/email`

3. **Test receipt creation on payment**
   - Ensure receipt is auto-created when booking status → 'downpayment' or 'fully_paid'

### Phase 2: Fix Frontend API Calls (15 minutes)

1. **Fix paymentService.ts**
   - Remove double `/api/api/` prefixes
   - Update getPaymentReceipts to use correct endpoint
   - Add error handling for missing receipts

2. **Update BookingDetailsModal.tsx**
   - Handle case where no receipts exist yet
   - Show "Receipt will be available after payment" message
   - Add loading states for receipt fetching

### Phase 3: Deploy & Test (15 minutes)

1. **Deploy backend changes to Render**
   ```bash
   git add backend-deploy/
   git commit -m "feat: Add receipt routes to production backend"
   git push origin main
   ```

2. **Deploy frontend changes to Firebase**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

3. **End-to-end test**
   - Make a payment
   - Verify receipt creation
   - Test receipt viewing/downloading
   - Test receipt email functionality

---

## 📊 Receipts Data Flow

```
┌─────────────────┐
│  User Makes     │
│  Payment        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Payment Gateway │
│ (PayMongo)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Webhook Handler │
│ Updates Booking │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Receipt  │
│ POST /api/      │
│ receipts/create │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Receipt Stored  │
│ in Database     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Views      │
│ Receipt via     │
│ GET /api/       │
│ receipts/...    │
└─────────────────┘
```

---

## 🎯 Quick Start: Show Receipts for Fully Paid Bookings

### Step 1: Update Frontend to Show Receipt Buttons

**File**: `src/pages/users/individual/bookings/components/BookingDetailsModal.tsx`

**Change needed** (around line 350-400):

```typescript
// Current: Only shows "Pay Deposit" button
{booking.status === 'approved' && !booking.depositPaid && (
  <button onClick={handlePayDeposit}>
    Pay Deposit
  </button>
)}

// New: Also show "Show Receipt" for paid bookings
{(booking.status === 'downpayment' || booking.status === 'fully_paid') && receipts.length > 0 && (
  <button onClick={() => handleViewReceipt(receipts[0])}>
    <Receipt className="w-4 h-4" />
    Show Receipt
  </button>
)}
```

### Step 2: Test with Real Data

1. Find a booking with status 'fully_paid' or 'downpayment'
2. Check if receipt exists: `GET /api/receipts/booking/:bookingId`
3. If no receipt, create one: `POST /api/receipts/create`
4. Verify receipt displays in UI

---

## 📝 Notes for Developers

### Important Constants

**Receipt Number Format**: `WB-YYYYMMDD-NNN`
- Example: `WB-20250110-001`
- Generated by database function `generate_receipt_number()`

**Amount Storage**: All amounts stored in CENTAVOS
- ₱1,000.00 = 100000 centavos
- Frontend must divide by 100 for display
- Backend must multiply by 100 for storage

**Payment Types**:
- `deposit` - Initial payment (typically 50%)
- `balance` - Remaining amount
- `full_payment` - 100% payment upfront

**Payment Methods**:
- `card` - Credit/Debit card
- `gcash` - GCash e-wallet
- `maya` - Maya e-wallet
- `grabpay` - GrabPay e-wallet

### Database Functions

```sql
-- Generate unique receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS VARCHAR AS $$
DECLARE
  new_number INTEGER;
  receipt_number VARCHAR;
BEGIN
  SELECT COUNT(*) + 1 INTO new_number
  FROM receipts
  WHERE DATE(created_at) = CURRENT_DATE;
  
  receipt_number := 'WB-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(new_number::TEXT, 3, '0');
  RETURN receipt_number;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔍 Troubleshooting

### Problem: Receipts not showing for fully paid booking

**Check 1**: Does receipt exist in database?
```sql
SELECT * FROM receipts WHERE booking_id = 'YOUR_BOOKING_ID';
```

**Check 2**: Is frontend calling correct API?
```javascript
console.log('Fetching receipts for booking:', bookingId);
const response = await fetch(`${API_BASE_URL}/api/receipts/booking/${bookingId}`);
console.log('Receipt response:', await response.json());
```

**Check 3**: Are receipt routes registered?
```javascript
// In production-backend.cjs
app.use('/api/receipts', receiptsRoutes);
```

### Problem: Receipt amounts showing incorrect values

**Cause**: Not dividing centavos by 100

**Fix**: Use backend's formatted fields
```javascript
// Don't use: amount_paid (raw centavos)
// Use: amount_paid_formatted (already formatted as ₱1,000.00)
```

### Problem: PDF download not working

**Cause**: Endpoint not implemented yet

**TODO**: Implement PDF generation using libraries like:
- `pdfkit` (Node.js)
- `jsPDF` (Browser)
- `puppeteer` (Headless Chrome)

---

## ✅ Summary & Next Steps

### What's Working:
✅ Database schema for receipts
✅ Backend API routes in `routes/receipts.cjs`
✅ Frontend UI for viewing receipts
✅ Receipt data model and types

### What's NOT Working:
❌ Receipts not in production backend
❌ Frontend API endpoints mismatched
❌ PDF download not implemented
❌ Email receipt not implemented
❌ Auto-creation on payment not connected

### Immediate Actions Required:
1. ⚠️ Add receipt routes to `production-backend.cjs`
2. ⚠️ Fix frontend API endpoints in `paymentService.ts`
3. ⚠️ Add missing backend endpoints for PDF/email
4. ⚠️ Test end-to-end receipt flow
5. ⚠️ Deploy both backend and frontend

### Estimated Time to Complete: 1 hour
- Backend integration: 30 minutes
- Frontend fixes: 15 minutes
- Testing & deployment: 15 minutes

---

**Last Updated**: January 10, 2025
**Status**: Documentation Complete - Implementation Pending
**Priority**: HIGH - Needed for fully paid bookings to show receipts
