# 🧾 WeddingBazaar Receipts: Where & How

## 📍 Where Are Receipts Stored?

### Answer: In a Dedicated PostgreSQL Database Table

**Table Name**: `receipts`
**Database**: Neon PostgreSQL (same as bookings, vendors, users)
**Schema Location**: `apply-database-fixes.cjs` (lines 77-99)

```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY,
  receipt_number VARCHAR(100) UNIQUE,  -- e.g., "WB-20250110-001"
  booking_id UUID,                     -- Links to bookings table
  couple_id UUID,                      -- User who made payment
  vendor_id UUID,                      -- Vendor who received payment
  amount_paid BIGINT,                  -- Amount in CENTAVOS
  payment_type VARCHAR(50),            -- 'deposit', 'balance', 'full_payment'
  payment_method VARCHAR(50),          -- 'gcash', 'card', 'maya', etc.
  service_name VARCHAR(255),
  created_at TIMESTAMP
  -- ...more fields
);
```

### Key Facts:
- ✅ Receipts are **NOT stored as files** (no PDFs on disk yet)
- ✅ Receipts are **database records** that can be formatted into PDFs on-demand
- ✅ Each receipt has a unique number format: `WB-YYYYMMDD-NNN`
- ✅ Amounts stored in **CENTAVOS** (₱1,000 = 100000 centavos)
- ✅ Linked to bookings, couples, and vendors via foreign keys

---

## 🔍 How Are Receipts Accessed?

### Backend API Endpoints

**File**: `backend-deploy/routes/receipts.cjs`

#### 1. Get All Receipts for a Couple
```http
GET /api/receipts/couple/:coupleId
```

**Example**:
```bash
curl https://weddingbazaar-web.onrender.com/api/receipts/couple/user-123
```

**Response**:
```json
{
  "success": true,
  "receipts": [
    {
      "id": "receipt-uuid-1",
      "receipt_number": "WB-20250110-001",
      "booking_id": "booking-uuid-1",
      "amount_paid": 50000,
      "amount_paid_formatted": "₱500.00",
      "payment_type": "deposit",
      "payment_method": "gcash",
      "service_name": "Wedding Photography",
      "vendor_name": "Perfect Shots Studio",
      "created_at": "2025-01-10T10:00:00Z"
    }
  ],
  "total": 1
}
```

#### 2. Get Specific Receipt by ID
```http
GET /api/receipts/:receiptId
```

Accepts either:
- UUID: `a1b2c3d4-...`
- Receipt Number: `WB-20250110-001`

#### 3. Get Receipts for a Vendor
```http
GET /api/receipts/vendor/:vendorId
```

#### 4. Create New Receipt
```http
POST /api/receipts/create
Content-Type: application/json

{
  "booking_id": "uuid",
  "couple_id": "uuid",
  "vendor_id": "uuid",
  "payment_type": "deposit",
  "payment_method": "gcash",
  "amount_paid": 50000,
  "service_name": "Wedding Photography"
}
```

#### 5. Get Receipt Statistics
```http
GET /api/receipts/stats/couple/:coupleId
```

**Response**:
```json
{
  "stats": {
    "total_receipts": 5,
    "total_amount_paid_formatted": "₱12,500.00",
    "deposit_payments": 3,
    "full_payments": 2,
    "gcash_payments": 4,
    "card_payments": 1
  }
}
```

---

## 💻 Frontend Access

### Payment Service

**File**: `src/pages/users/individual/payment/services/paymentService.ts`

```typescript
import { paymentService } from './paymentService';

// Get receipts for a booking
const receipts = await paymentService.getPaymentReceipts(bookingId);

// Get single receipt
const receipt = await paymentService.getReceipt(receiptId);

// Download as PDF (not implemented yet)
const pdfBlob = await paymentService.downloadReceiptPDF(receiptId);

// Email receipt (not implemented yet)
await paymentService.emailReceipt(receiptId, 'user@example.com');
```

### Booking Details Modal

**File**: `src/pages/users/individual/bookings/components/BookingDetailsModal.tsx`

**When modal opens** (lines 101-105):
```typescript
useEffect(() => {
  if (isOpen && booking) {
    fetchReceipts(); // Automatically loads receipts
  }
}, [isOpen, booking]);
```

**How receipts are fetched** (lines 106-119):
```typescript
const fetchReceipts = async () => {
  setLoadingReceipts(true);
  try {
    const data = await paymentService.getPaymentReceipts(booking.id);
    setReceipts(data || []);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    setReceipts([]);
  } finally {
    setLoadingReceipts(false);
  }
};
```

**Receipt display** (lines 662-690):
```typescript
{receipts.length > 0 && (
  <div className="mt-4">
    <h4>Payment Receipts</h4>
    {receipts.map(receipt => (
      <div key={receipt.id}>
        <p>{receipt.receiptNumber}</p>
        <p>{receipt.amount_paid_formatted}</p>
        <button onClick={() => handleViewReceipt(receipt)}>View</button>
        <button onClick={() => handleDownloadPDF(receipt)}>Download</button>
      </div>
    ))}
  </div>
)}
```

---

## 🔄 Data Flow: From Payment to Receipt

```
1. USER MAKES PAYMENT
   ↓
2. PAYMONGO PROCESSES
   ↓
3. WEBHOOK RECEIVED
   ↓
4. BOOKING STATUS UPDATED
   - 'approved' → 'downpayment' (50% paid)
   - 'downpayment' → 'fully_paid' (100% paid)
   ↓
5. RECEIPT CREATED AUTOMATICALLY
   POST /api/receipts/create
   {
     booking_id: "...",
     couple_id: "...",
     vendor_id: "...",
     amount_paid: 50000,
     payment_type: "deposit"
   }
   ↓
6. RECEIPT STORED IN DATABASE
   receipts table gets new row
   ↓
7. USER VIEWS BOOKING DETAILS
   GET /api/receipts/couple/:coupleId
   ↓
8. RECEIPT DISPLAYED IN UI
   BookingDetailsModal shows receipt list
```

---

## 🚨 Current Status: What Works & What Doesn't

### ✅ What's Working:
1. **Database table exists** - receipts table is live
2. **Backend API routes exist** - all endpoints coded in `routes/receipts.cjs`
3. **Frontend UI exists** - receipt display components ready
4. **Data model defined** - TypeScript types in place

### ❌ What's NOT Working:
1. **Routes not in production** - `production-backend.cjs` doesn't include receipt routes
2. **API endpoint mismatch** - Frontend calls `/api/payment/receipts/` but backend has `/api/receipts/`
3. **PDF generation missing** - No PDF download functionality yet
4. **Email functionality missing** - Can't email receipts yet
5. **Auto-creation not connected** - Receipts not auto-created on payment

---

## 🔧 How to Access Receipts Right Now

### Option 1: Direct Database Query

```sql
-- Via database console (Neon dashboard)
SELECT 
  receipt_number,
  amount_paid / 100.0 as amount_pesos,
  payment_type,
  payment_method,
  service_name,
  created_at
FROM receipts
WHERE couple_id = 'YOUR_COUPLE_ID'
ORDER BY created_at DESC;
```

### Option 2: Backend API (If Routes Were Registered)

```bash
# Get couple's receipts
curl https://weddingbazaar-web.onrender.com/api/receipts/couple/COUPLE_ID

# Get specific receipt
curl https://weddingbazaar-web.onrender.com/api/receipts/WB-20250110-001
```

### Option 3: Frontend (After Backend Integration)

```typescript
// In any component with booking data
import { paymentService } from '@/pages/users/individual/payment/services/paymentService';

async function loadReceipts(bookingId: string) {
  try {
    const receipts = await paymentService.getPaymentReceipts(bookingId);
    console.log('Receipts:', receipts);
    return receipts;
  } catch (error) {
    console.error('Failed to load receipts:', error);
    return [];
  }
}
```

---

## 🎯 Quick Fix: Enable Receipts in 3 Steps

### Step 1: Register Receipt Routes (5 min)

**File**: `backend-deploy/production-backend.cjs`

Add after other route registrations:
```javascript
// Add receipt routes
const receiptsRoutes = require('./routes/receipts.cjs');
app.use('/api/receipts', receiptsRoutes);
console.log('✅ Receipt routes registered at /api/receipts');
```

### Step 2: Fix Frontend API Calls (5 min)

**File**: `src/pages/users/individual/payment/services/paymentService.ts`

Change line 28 from:
```typescript
// OLD - doesn't exist
const response = await fetch(`${API_BASE_URL}/api/payment/receipts/${bookingId}`);

// NEW - use couple ID instead
const response = await fetch(`${API_BASE_URL}/api/receipts/couple/${coupleId}`);
```

OR add new backend endpoint:
```javascript
// In backend-deploy/routes/receipts.cjs
router.get('/booking/:bookingId', async (req, res) => {
  const receipts = await sql`
    SELECT * FROM receipts 
    WHERE booking_id = ${req.params.bookingId}
    ORDER BY created_at DESC
  `;
  res.json({ success: true, receipts });
});
```

### Step 3: Deploy & Test (10 min)

```bash
# Backend
git add backend-deploy/
git commit -m "feat: Add receipt routes to production"
git push

# Wait for Render deployment...

# Frontend
npm run build
firebase deploy --only hosting

# Test
curl https://weddingbazaar-web.onrender.com/api/receipts/couple/YOUR_ID
```

---

## 📝 Example: Full Receipt Object

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "receipt_number": "WB-20250110-001",
  "booking_id": "booking-uuid",
  "couple_id": "couple-uuid",
  "vendor_id": "vendor-uuid",
  "payment_type": "deposit",
  "payment_method": "gcash",
  "amount_paid": 50000,
  "amount_paid_formatted": "₱500.00",
  "total_amount": 100000,
  "total_amount_formatted": "₱1,000.00",
  "tax_amount": 0,
  "service_name": "Wedding Photography - Premium Package",
  "service_category": "Photography",
  "event_date": "2025-06-15T00:00:00Z",
  "event_location": "Manila Cathedral, Intramuros",
  "description": "50% deposit for wedding photography premium package",
  "vendor_name": "Perfect Shots Photography",
  "vendor_category": "Photography",
  "vendor_rating": 4.8,
  "paymongo_payment_id": "pay_xxx123",
  "paymongo_source_id": "src_xxx456",
  "created_at": "2025-01-10T10:30:00.000Z",
  "updated_at": "2025-01-10T10:30:00.000Z"
}
```

---

## 🔍 Debugging: How to Check If Receipts Exist

### Check 1: Database Direct
```sql
SELECT COUNT(*) as total FROM receipts;
```

### Check 2: Backend Health
```bash
curl https://weddingbazaar-web.onrender.com/api/health
```

### Check 3: Test Receipt Endpoint
```bash
curl https://weddingbazaar-web.onrender.com/api/receipts/couple/test-couple-id
```

If returns 404 → Routes not registered
If returns 500 → Database issue
If returns 200 → Working! ✅

### Check 4: Frontend Console
```javascript
// In browser console on booking page
console.log('Checking receipts...');
fetch('https://weddingbazaar-web.onrender.com/api/receipts/couple/YOUR_ID')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## 📊 Receipt Statistics Available

For any couple, you can get:
- Total number of receipts
- Total amount paid
- Breakdown by payment type (deposit/balance/full)
- Breakdown by payment method (gcash/card/maya)
- Number of transactions per vendor

```http
GET /api/receipts/stats/couple/:coupleId
```

---

## ✅ Summary

### Where Receipts Are Stored:
- **Database**: PostgreSQL `receipts` table
- **Server**: Neon hosted database
- **Format**: Structured records (not files)
- **Amounts**: Stored in centavos (100 = ₱1.00)

### How Receipts Are Accessed:
- **Backend**: REST API at `/api/receipts/*`
- **Frontend**: `paymentService.getPaymentReceipts()`
- **UI**: Automatically loaded in BookingDetailsModal

### Current Limitation:
⚠️ **Receipt routes NOT registered in production backend**
→ Need to add to `production-backend.cjs`
→ 5-minute fix + deployment

### Next Steps:
1. Add routes to production backend
2. Fix frontend API endpoint
3. Test end-to-end
4. Implement PDF download (future)
5. Implement email receipt (future)

---

**Last Updated**: January 10, 2025
**Status**: Documented - Implementation Pending
**Priority**: HIGH - Needed for "Show Receipt" feature
