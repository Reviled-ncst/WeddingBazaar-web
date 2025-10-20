# 🚀 Quick Action Plan: Enable Receipt & Payment Buttons

## 🎯 Goal
Enable "Show Receipt" and "Pay Deposit" buttons for bookings based on payment status.

## 📋 Current State Analysis

### Booking Statuses in Database:
```sql
-- From database constraint check
CHECK (status IN (
  'request',      -- Initial booking request
  'approved',     -- Vendor approved, awaiting deposit
  'downpayment',  -- 50% deposit paid
  'fully_paid',   -- 100% paid
  'cancelled'     -- Booking cancelled
))
```

### Button Logic Needed:

| Booking Status | Deposit Paid? | Show "Pay Deposit" | Show "Show Receipt" |
|----------------|---------------|-------------------|-------------------|
| `request`      | No           | ❌ No             | ❌ No             |
| `approved`     | No           | ✅ Yes            | ❌ No             |
| `downpayment`  | Yes          | ✅ Yes (balance)  | ✅ Yes            |
| `fully_paid`   | Yes          | ❌ No             | ✅ Yes            |
| `cancelled`    | N/A          | ❌ No             | ⚠️ Maybe (refund) |

---

## 🔧 Implementation Steps

### Step 1: Add Receipt Endpoint for Bookings (Backend)

**File**: `backend-deploy/routes/receipts.cjs`

**Add this new endpoint**:
```javascript
// Get receipts for a specific booking
router.get('/booking/:bookingId', async (req, res) => {
  console.log('🧾 Getting receipts for booking:', req.params.bookingId);
  
  try {
    const { bookingId } = req.params;
    
    const receipts = await sql`
      SELECT 
        r.*,
        v.business_name as vendor_name,
        v.business_type as vendor_category,
        v.rating as vendor_rating,
        CONCAT('₱', TO_CHAR(r.amount_paid::DECIMAL / 100, 'FM999,999,999.00')) as amount_paid_formatted,
        CONCAT('₱', TO_CHAR(r.total_amount::DECIMAL / 100, 'FM999,999,999.00')) as total_amount_formatted
      FROM receipts r
      LEFT JOIN vendors v ON r.vendor_id = v.id
      WHERE r.booking_id = ${bookingId}
      ORDER BY r.created_at DESC
    `;
    
    console.log(`✅ Found ${receipts.length} receipts for booking ${bookingId}`);
    
    res.json({
      success: true,
      receipts: receipts,
      count: receipts.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Booking receipts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch receipts',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

**Location**: Add after line 163 (after the vendor receipts endpoint)

---

### Step 2: Register Receipt Routes (Production Backend)

**File**: `backend-deploy/production-backend.cjs`

**Find the section where routes are registered** (around line 50-100):
```javascript
// Existing routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
// ...etc
```

**Add this line**:
```javascript
// Add receipt routes
const receiptsRoutes = require('./routes/receipts.cjs');
app.use('/api/receipts', receiptsRoutes);
console.log('✅ Receipt routes registered at /api/receipts/*');
```

---

### Step 3: Fix Frontend Payment Service

**File**: `src/pages/users/individual/payment/services/paymentService.ts`

**Find line 27-37** (getPaymentReceipts method):
```typescript
async getPaymentReceipts(bookingId: string): Promise<PaymentReceipt[]> {
  try {
    // OLD - doesn't match backend
    // const response = await fetch(`${API_BASE_URL}/api/payment/receipts/${bookingId}`);
    
    // NEW - matches backend endpoint
    const response = await fetch(`${API_BASE_URL}/api/receipts/booking/${bookingId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch receipts: ${response.statusText}`);
    }

    const result = await response.json();
    return result.receipts || [];
  } catch (error) {
    console.error('Error fetching payment receipts:', error);
    return []; // Return empty array instead of throwing
  }
}
```

**Also fix the double /api/ prefixes** (lines 48, 65, 78, 97, 118, 140, 160):
```typescript
// OLD
const response = await fetch(`${API_BASE_URL}/api/api/payment/receipt/${receiptId}`);

// NEW
const response = await fetch(`${API_BASE_URL}/api/payment/receipt/${receiptId}`);
```

---

### Step 4: Update Booking Details Modal (Frontend)

**File**: `src/pages/users/individual/bookings/components/BookingDetailsModal.tsx`

**Find the payment buttons section** (around line 350-450):

**Current code**:
```typescript
{booking.status === 'approved' && !booking.depositPaid && (
  <button onClick={handlePayDeposit}>
    <DollarSign className="w-4 h-4" />
    Pay Deposit
  </button>
)}
```

**Replace with enhanced logic**:
```typescript
{/* Payment & Receipt Actions */}
<div className="flex gap-3 mt-4">
  {/* Pay Deposit Button - Show for approved or downpayment status */}
  {(booking.status === 'approved' || booking.status === 'downpayment') && (
    <button
      onClick={handlePayDeposit}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:scale-105 transition-transform"
    >
      <DollarSign className="w-4 h-4" />
      {booking.status === 'approved' ? 'Pay Deposit (50%)' : 'Pay Balance (50%)'}
    </button>
  )}

  {/* Show Receipt Button - Show for downpayment or fully_paid status */}
  {(booking.status === 'downpayment' || booking.status === 'fully_paid') && receipts.length > 0 && (
    <button
      onClick={() => handleViewReceipt(receipts[0])}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:scale-105 transition-transform"
    >
      <Receipt className="w-4 h-4" />
      Show Receipt ({receipts.length})
    </button>
  )}

  {/* Download All Receipts Button - Show if multiple receipts */}
  {receipts.length > 1 && (
    <button
      onClick={handleDownloadAllReceipts}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:scale-105 transition-transform"
    >
      <Download className="w-4 h-4" />
      Download All
    </button>
  )}
</div>

{/* Receipt Status Message */}
{(booking.status === 'downpayment' || booking.status === 'fully_paid') && receipts.length === 0 && (
  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
    <p className="text-sm text-yellow-800">
      ⚠️ Receipt is being generated. Please check back in a few moments.
    </p>
  </div>
)}
```

**Add helper function** (around line 180):
```typescript
const handleDownloadAllReceipts = async () => {
  for (const receipt of receipts) {
    try {
      await handleDownloadPDF(receipt);
      // Add small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to download receipt:', receipt.id, error);
    }
  }
};
```

---

### Step 5: Add Missing Imports

**File**: `src/pages/users/individual/bookings/components/BookingDetailsModal.tsx`

**Check if these imports exist** (around line 1-20):
```typescript
import {
  X,
  Calendar,
  MapPin,
  DollarSign,
  Receipt,    // ← Make sure this is imported
  Download,   // ← Make sure this is imported
  Mail,
  Phone,
  // ...other imports
} from 'lucide-react';
```

---

### Step 6: Enhance Receipt Display Section

**File**: `src/pages/users/individual/bookings/components/BookingDetailsModal.tsx`

**Find the receipts section** (around line 662-690):

**Replace with enhanced version**:
```typescript
{/* Receipts Section - Enhanced */}
{receipts.length > 0 && (
  <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-green-500 rounded-lg">
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <h4 className="font-semibold text-gray-900">Payment Receipts</h4>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          {receipts.length} {receipts.length === 1 ? 'Receipt' : 'Receipts'}
        </span>
      </div>
    </div>

    <div className="space-y-3">
      {receipts.map((receipt, index) => (
        <div
          key={receipt.id}
          className="p-4 bg-white rounded-xl border border-green-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm font-semibold text-gray-900">
                  {receipt.receiptNumber || `Receipt #${index + 1}`}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  receipt.status === 'completed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {receipt.status}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(receipt.issuedDate).toLocaleDateString()}
                </span>
                <span className="font-semibold text-green-600">
                  ₱{(receipt.amount / 100).toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {receipt.paymentMethod?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewReceipt(receipt)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Receipt"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDownloadPDF(receipt)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Download PDF"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const email = prompt('Enter email address to send receipt:');
                  if (email) handleEmailReceipt(receipt, email);
                }}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Email Receipt"
              >
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* No Receipts Message */}
{receipts.length === 0 && (booking.status === 'downpayment' || booking.status === 'fully_paid') && (
  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
    <div className="flex items-start gap-3">
      <Receipt className="w-5 h-5 text-yellow-600 mt-0.5" />
      <div>
        <h5 className="font-semibold text-yellow-900 mb-1">Receipt Pending</h5>
        <p className="text-sm text-yellow-700">
          Your payment receipt is being generated. It will appear here shortly.
        </p>
      </div>
    </div>
  </div>
)}
```

**Add Eye import** if not present:
```typescript
import { Eye, Download, Mail, Receipt, /* ...other imports */ } from 'lucide-react';
```

---

## 🧪 Testing Checklist

### Test 1: Backend Receipt Endpoint
```bash
# Test new endpoint
curl https://weddingbazaar-web.onrender.com/api/receipts/booking/YOUR_BOOKING_ID

# Expected: 200 OK with receipts array (may be empty)
```

### Test 2: Frontend Receipt Fetching
```javascript
// In browser console on booking details page
console.log('Testing receipt fetch...');
fetch('https://weddingbazaar-web.onrender.com/api/receipts/booking/BOOKING_ID')
  .then(r => r.json())
  .then(data => {
    console.log('Receipts:', data.receipts);
    console.log('Count:', data.count);
  })
  .catch(console.error);
```

### Test 3: Button Visibility

**Create test bookings with different statuses**:
```sql
-- Test booking 1: Approved (should show "Pay Deposit")
UPDATE bookings SET status = 'approved' WHERE id = 'test-1';

-- Test booking 2: Downpayment (should show "Pay Balance" + "Show Receipt")
UPDATE bookings SET status = 'downpayment' WHERE id = 'test-2';

-- Test booking 3: Fully Paid (should show "Show Receipt" only)
UPDATE bookings SET status = 'fully_paid' WHERE id = 'test-3';
```

**Check UI**:
- ✅ `approved` → "Pay Deposit (50%)" button visible
- ✅ `downpayment` → "Pay Balance (50%)" + "Show Receipt" buttons visible
- ✅ `fully_paid` → "Show Receipt" button visible only
- ✅ Receipt count badge shows correct number
- ✅ Clicking "Show Receipt" opens ReceiptView modal

### Test 4: Receipt Data Mapping

**Check that receipts display correctly**:
- ✅ Receipt number (e.g., WB-20250110-001)
- ✅ Amount formatted (₱500.00)
- ✅ Payment method (GCASH, CARD, etc.)
- ✅ Date formatted
- ✅ Status badge (completed/pending)

### Test 5: Action Buttons

**Test each receipt action**:
- ✅ View button → Opens receipt modal
- ✅ Download button → Downloads PDF (or shows "Not implemented" error)
- ✅ Email button → Prompts for email, sends receipt
- ✅ Download All button → Downloads multiple receipts sequentially

---

## 📦 Deployment Steps

### Backend Deployment (Render)

```bash
# 1. Commit changes
git add backend-deploy/routes/receipts.cjs
git add backend-deploy/production-backend.cjs
git commit -m "feat: Add receipt routes and booking receipt endpoint"

# 2. Push to main (triggers Render deployment)
git push origin main

# 3. Monitor deployment
# Go to: https://dashboard.render.com/web/srv-YOUR-SERVICE-ID
# Wait for: "Deploy live" status

# 4. Test deployment
curl https://weddingbazaar-web.onrender.com/api/health
curl https://weddingbazaar-web.onrender.com/api/receipts/booking/test-id
```

### Frontend Deployment (Firebase)

```bash
# 1. Commit changes
git add src/pages/users/individual/payment/services/paymentService.ts
git add src/pages/users/individual/bookings/components/BookingDetailsModal.tsx
git commit -m "feat: Enable receipt viewing for paid bookings"

# 2. Build for production
npm run build

# 3. Deploy to Firebase
firebase deploy --only hosting

# 4. Test deployment
# Visit: https://weddingbazaar-web.web.app
# Login and view a booking with receipts
```

---

## 🐛 Troubleshooting Guide

### Problem: "Show Receipt" button not showing

**Check 1**: Booking status
```javascript
console.log('Booking status:', booking.status);
// Should be 'downpayment' or 'fully_paid'
```

**Check 2**: Receipts loaded
```javascript
console.log('Receipts count:', receipts.length);
// Should be > 0
```

**Check 3**: Button condition
```typescript
// In BookingDetailsModal.tsx
{(booking.status === 'downpayment' || booking.status === 'fully_paid') && receipts.length > 0 && (
  // Button should render here
)}
```

### Problem: Receipt fetch returns 404

**Cause**: Routes not registered in production backend

**Fix**: Ensure this line exists in `production-backend.cjs`:
```javascript
app.use('/api/receipts', receiptsRoutes);
```

### Problem: Receipt amounts showing wrong values

**Cause**: Centavos not converted to pesos

**Fix**: Use formatted fields from backend:
```javascript
// Don't use: amount_paid (raw centavos)
// Use: amount_paid_formatted (already formatted)
```

### Problem: Multiple receipts show but only want latest

**Fix**: Get first receipt:
```typescript
const latestReceipt = receipts[0]; // Already sorted DESC by created_at
handleViewReceipt(latestReceipt);
```

---

## ✅ Success Criteria

### User Experience Goals:
1. ✅ Users can see "Pay Deposit" button when booking approved
2. ✅ Users can see "Pay Balance" button when deposit paid
3. ✅ Users can see "Show Receipt" button when payment made
4. ✅ Receipt shows correct amount, date, and vendor info
5. ✅ Users can download receipt as PDF
6. ✅ Users can email receipt to themselves

### Technical Goals:
1. ✅ Backend endpoint `/api/receipts/booking/:id` returns receipts
2. ✅ Frontend correctly fetches and displays receipts
3. ✅ Button visibility based on booking status
4. ✅ Error handling for missing receipts
5. ✅ Loading states during fetch
6. ✅ Proper TypeScript types for all receipt data

---

## 🎯 Estimated Time

- **Backend changes**: 10 minutes
  - Add endpoint: 5 min
  - Register routes: 2 min
  - Test locally: 3 min

- **Frontend changes**: 15 minutes
  - Fix payment service: 3 min
  - Update button logic: 5 min
  - Enhance receipt display: 7 min

- **Deployment**: 10 minutes
  - Backend deploy: 5 min
  - Frontend deploy: 5 min

- **Testing**: 10 minutes
  - Test each status: 5 min
  - Verify receipts load: 5 min

**Total: ~45 minutes**

---

## 📝 Notes

### Receipt Creation Timing
- Receipts should be auto-created when:
  1. Payment webhook received from PayMongo
  2. Booking status updated to 'downpayment' or 'fully_paid'
  3. Payment amount recorded in database

### Current Gap
- ⚠️ Payment webhook may not be creating receipts automatically
- Need to verify webhook handler includes receipt creation
- May need to manually create receipts for existing paid bookings

### Future Enhancements
1. PDF generation with library like `pdfkit`
2. Email integration with service like SendGrid
3. Receipt templates for different payment types
4. Bulk download of all receipts as ZIP
5. Receipt sharing via unique link
6. QR code on receipts for verification

---

**Status**: Implementation Ready
**Priority**: HIGH
**Dependencies**: Backend deployment, Frontend deployment
**Blocker**: None
