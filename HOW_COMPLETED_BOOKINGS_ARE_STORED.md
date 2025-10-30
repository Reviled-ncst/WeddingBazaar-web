# How Completed Bookings Are Stored in Database 📊

**Date**: October 30, 2025  
**System**: Two-Sided Booking Completion with Wallet Integration  

---

## 🗄️ Database Schema for Completed Bookings

### 1. **bookings** Table (Main Record)

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  vendor_id VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL,
  couple_name VARCHAR(255),
  service_type VARCHAR(100),
  event_date DATE,
  event_location VARCHAR(255),
  amount DECIMAL(10,2),
  
  -- 📊 STATUS TRACKING
  status VARCHAR(50) DEFAULT 'request',
  -- Possible values: 'request', 'quote_sent', 'quote_accepted', 
  --                  'confirmed', 'deposit_paid', 'paid_in_full', 
  --                  'completed', 'cancelled'
  
  -- ✅ TWO-SIDED COMPLETION TRACKING (NEW - Oct 27, 2025)
  vendor_completed BOOLEAN DEFAULT FALSE,        -- Vendor confirmed completion
  vendor_completed_at TIMESTAMP,                 -- When vendor confirmed
  couple_completed BOOLEAN DEFAULT FALSE,        -- Couple confirmed completion
  couple_completed_at TIMESTAMP,                 -- When couple confirmed
  fully_completed BOOLEAN DEFAULT FALSE,         -- Both confirmed (redundant check)
  fully_completed_at TIMESTAMP,                  -- When both confirmed
  completion_notes TEXT,                         -- Completion notes from either party
  
  -- 💰 PAYMENT TRACKING
  downpayment_amount DECIMAL(10,2),
  remaining_balance DECIMAL(10,2),
  total_paid DECIMAL(10,2) DEFAULT 0,
  
  -- 🕐 TIMESTAMPS
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **receipts** Table (Payment Records)

```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  payment_type VARCHAR(50) NOT NULL,           -- 'deposit', 'balance', 'full'
  amount INTEGER NOT NULL,                      -- In centavos (₱100 = 10000)
  currency VARCHAR(3) DEFAULT 'PHP',
  payment_method VARCHAR(50),                   -- 'card', 'gcash', 'paymaya'
  payment_intent_id VARCHAR(255),               -- PayMongo payment intent ID
  paid_by UUID REFERENCES users(id),
  paid_by_name VARCHAR(255),
  paid_by_email VARCHAR(255),
  total_paid INTEGER,                           -- Running total in centavos
  remaining_balance INTEGER,                    -- Remaining in centavos
  notes TEXT,
  metadata JSONB,                               -- Additional PayMongo data
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. **wallet_transactions** Table (Vendor Earnings)

```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY,
  transaction_id VARCHAR(50) UNIQUE NOT NULL,
  vendor_id VARCHAR(50) NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  
  transaction_type VARCHAR(20) NOT NULL,        -- 'earning', 'withdrawal', 'refund'
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  status VARCHAR(20) DEFAULT 'completed',
  
  description TEXT,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  
  -- Booking context
  service_name VARCHAR(255),
  service_category VARCHAR(100),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  event_date DATE,
  
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. **vendor_wallets** Table (Balance Tracking)

```sql
CREATE TABLE vendor_wallets (
  id UUID PRIMARY KEY,
  vendor_id VARCHAR(50) NOT NULL UNIQUE,
  total_earnings DECIMAL(12,2) DEFAULT 0.00,    -- Lifetime earnings
  available_balance DECIMAL(12,2) DEFAULT 0.00, -- Available for withdrawal
  pending_balance DECIMAL(12,2) DEFAULT 0.00,   -- Funds on hold
  withdrawn_amount DECIMAL(12,2) DEFAULT 0.00,  -- Total withdrawn
  currency VARCHAR(3) DEFAULT 'PHP',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Complete Flow: How Bookings Become "Completed"

### Step 1: Booking Creation
```sql
INSERT INTO bookings (
  id, vendor_id, user_id, couple_name, service_type,
  status, amount
) VALUES (
  'uuid-here', '2-2025-001', 'uuid-user', 'John & Jane',
  'Photography', 'request', 50000.00
);
```

**Initial State**:
- `status = 'request'`
- `vendor_completed = FALSE`
- `couple_completed = FALSE`
- `fully_completed = FALSE`

---

### Step 2: Payment Processing

**Deposit Payment** (via PayMongo):
```sql
-- 1. Booking status updated
UPDATE bookings 
SET status = 'deposit_paid', downpayment_amount = 25000.00
WHERE id = 'booking-id';

-- 2. Receipt created
INSERT INTO receipts (
  booking_id, receipt_number, payment_type, 
  amount, payment_method
) VALUES (
  'booking-id', 'RCP-202510301234', 'deposit',
  2500000, 'card'  -- ₱25,000 in centavos
);
```

**Full Payment**:
```sql
-- 1. Booking status updated
UPDATE bookings 
SET status = 'paid_in_full', total_paid = 50000.00, remaining_balance = 0
WHERE id = 'booking-id';

-- 2. Receipt created for balance
INSERT INTO receipts (
  booking_id, receipt_number, payment_type,
  amount, total_paid, remaining_balance
) VALUES (
  'booking-id', 'RCP-202510301235', 'balance',
  2500000, 5000000, 0  -- All in centavos
);
```

---

### Step 3: Two-Sided Completion System

#### 3A. Couple Marks Complete (Frontend Action)

**Frontend Call** (`IndividualBookings.tsx`):
```typescript
const handleMarkComplete = async (booking: EnhancedBooking) => {
  const result = await markBookingComplete(booking.id, 'couple');
  if (result.success) {
    // Reload bookings to show updated status
    await loadBookings();
  }
};
```

**API Endpoint**: `POST /api/bookings/:bookingId/mark-completed`

**Backend Update** (`booking-completion.cjs`):
```sql
UPDATE bookings
SET 
  couple_completed = TRUE,
  couple_completed_at = NOW(),
  updated_at = NOW()
WHERE id = 'booking-id'
RETURNING *;
```

**Database State After Couple Confirms**:
```
status: 'paid_in_full'
vendor_completed: FALSE
couple_completed: TRUE ✅
fully_completed: FALSE
```

---

#### 3B. Vendor Marks Complete

**Backend Update**:
```sql
UPDATE bookings
SET 
  vendor_completed = TRUE,
  vendor_completed_at = NOW(),
  updated_at = NOW()
WHERE id = 'booking-id'
RETURNING *;
```

**Database State After Vendor Confirms**:
```
status: 'paid_in_full'
vendor_completed: TRUE ✅
couple_completed: TRUE ✅
fully_completed: FALSE (not yet)
```

---

#### 3C. Both Confirmed → COMPLETED Status

**Backend Logic** (automatic when both are TRUE):
```javascript
// Check if BOTH sides have now confirmed
if (updated.vendor_completed && updated.couple_completed) {
  console.log('🎉 Both sides confirmed! Marking as COMPLETED');
  
  // Update to completed status
  await sql`
    UPDATE bookings
    SET 
      status = 'completed',
      fully_completed = TRUE,
      fully_completed_at = NOW(),
      updated_at = NOW()
    WHERE id = ${bookingId}
    RETURNING *
  `;
}
```

**Final Database State**:
```sql
-- Booking is now COMPLETED
SELECT * FROM bookings WHERE id = 'booking-id';

-- Result:
{
  id: 'booking-id',
  vendor_id: '2-2025-001',
  couple_name: 'John & Jane',
  service_type: 'Photography',
  amount: 50000.00,
  
  status: 'completed' ✅,
  
  vendor_completed: TRUE ✅,
  vendor_completed_at: '2025-10-30 14:30:00',
  
  couple_completed: TRUE ✅,
  couple_completed_at: '2025-10-30 14:25:00',
  
  fully_completed: TRUE ✅,
  fully_completed_at: '2025-10-30 14:30:00',
  
  total_paid: 50000.00,
  remaining_balance: 0.00
}
```

---

### Step 4: Automatic Wallet Transaction Creation

**Backend Logic** (triggered when booking becomes 'completed'):
```javascript
// 💰 CREATE WALLET TRANSACTION
console.log('💰 Creating wallet transaction for vendor');

// Step 1: Fetch ALL receipts for this booking
const receipts = await sql`
  SELECT * FROM receipts 
  WHERE booking_id = ${bookingId}
  ORDER BY created_at ASC
`;

// Step 2: Calculate ACTUAL total paid from receipts
let totalPaidCentavos = 0;
receipts.forEach(receipt => {
  totalPaidCentavos += receipt.amount || 0;
});

const totalPaidPHP = totalPaidCentavos / 100; // Convert to PHP

// Step 3: Create wallet transaction
const transactionId = `TXN-${bookingId}-${Date.now()}`;
await sql`
  INSERT INTO wallet_transactions (
    transaction_id, vendor_id, booking_id,
    transaction_type, amount, currency, status,
    description, payment_method,
    service_name, customer_name, event_date,
    created_at, updated_at
  ) VALUES (
    ${transactionId},
    ${vendorId},
    ${bookingId},
    'earning',
    ${totalPaidPHP},
    'PHP',
    'completed',
    'Earnings from completed booking',
    ${paymentMethods.join(', ')},
    ${serviceType},
    ${coupleName},
    ${eventDate},
    NOW(),
    NOW()
  )
`;

// Step 4: Update vendor wallet balance
await sql`
  UPDATE vendor_wallets
  SET 
    total_earnings = total_earnings + ${totalPaidPHP},
    available_balance = available_balance + ${totalPaidPHP},
    updated_at = NOW()
  WHERE vendor_id = ${vendorId}
`;

console.log('✅ Wallet transaction created!');
```

**Database State After Wallet Update**:
```sql
-- Wallet transaction created
SELECT * FROM wallet_transactions WHERE booking_id = 'booking-id';

{
  transaction_id: 'TXN-booking-id-1698670800000',
  vendor_id: '2-2025-001',
  booking_id: 'booking-id',
  transaction_type: 'earning',
  amount: 50000.00,
  status: 'completed',
  description: 'Earnings from completed booking',
  service_name: 'Photography',
  customer_name: 'John & Jane',
  created_at: '2025-10-30 14:30:01'
}

-- Vendor wallet updated
SELECT * FROM vendor_wallets WHERE vendor_id = '2-2025-001';

{
  vendor_id: '2-2025-001',
  total_earnings: 50000.00,    -- ✅ Increased
  available_balance: 50000.00, -- ✅ Increased
  withdrawn_amount: 0.00,
  updated_at: '2025-10-30 14:30:01'
}
```

---

## 📊 Data Flow Summary

```
1. BOOKING CREATED
   └─> bookings table: status = 'request'

2. PAYMENT PROCESSED
   ├─> bookings table: status = 'deposit_paid' or 'paid_in_full'
   └─> receipts table: payment records created

3. COUPLE MARKS COMPLETE
   └─> bookings table: couple_completed = TRUE

4. VENDOR MARKS COMPLETE
   └─> bookings table: vendor_completed = TRUE

5. BOTH CONFIRMED (AUTOMATIC)
   ├─> bookings table: 
   │   ├─> status = 'completed'
   │   └─> fully_completed = TRUE
   ├─> wallet_transactions table: earning record created
   └─> vendor_wallets table: balance updated
```

---

## 🔍 How to Query Completed Bookings

### All Completed Bookings
```sql
SELECT * FROM bookings 
WHERE status = 'completed' 
  OR fully_completed = TRUE
ORDER BY fully_completed_at DESC;
```

### Completed Bookings with Wallet Transactions
```sql
SELECT 
  b.id,
  b.couple_name,
  b.service_type,
  b.amount,
  b.status,
  b.vendor_completed,
  b.couple_completed,
  b.fully_completed_at,
  wt.transaction_id,
  wt.amount as wallet_amount,
  wt.status as wallet_status,
  wt.created_at as transaction_created_at
FROM bookings b
LEFT JOIN wallet_transactions wt ON b.id = wt.booking_id
WHERE b.status = 'completed'
ORDER BY b.fully_completed_at DESC;
```

### Vendor Earnings from Completed Bookings
```sql
SELECT 
  v.vendor_id,
  v.total_earnings,
  v.available_balance,
  COUNT(wt.id) as completed_bookings,
  SUM(wt.amount) as total_from_transactions
FROM vendor_wallets v
LEFT JOIN wallet_transactions wt ON v.vendor_id = wt.vendor_id
WHERE wt.transaction_type = 'earning'
GROUP BY v.vendor_id, v.total_earnings, v.available_balance;
```

---

## 🎯 Key Points

### 1. **Two Confirmations Required**
- ✅ Couple must confirm
- ✅ Vendor must confirm
- ✅ Only then status = 'completed'

### 2. **Automatic Wallet Creation**
- Triggered when `status = 'completed'`
- Uses ACTUAL payment data from `receipts` table
- Updates `wallet_transactions` and `vendor_wallets`

### 3. **Payment Tracking**
- All payments stored in `receipts` table
- Amounts in centavos for precision
- PayMongo payment intent IDs preserved

### 4. **Completion Timestamps**
- `vendor_completed_at` - when vendor confirmed
- `couple_completed_at` - when couple confirmed
- `fully_completed_at` - when both confirmed (triggers wallet)

---

## 🚀 Files Involved

### Backend
- `backend-deploy/routes/booking-completion.cjs` - Completion API
- `backend-deploy/routes/bookings.cjs` - Booking CRUD
- `backend-deploy/routes/payments.cjs` - Payment & receipts
- `backend-deploy/routes/vendor-wallet.cjs` - Wallet API

### Frontend
- `src/pages/users/individual/bookings/IndividualBookings.tsx` - Couple UI
- `src/pages/users/vendor/bookings/VendorBookings.tsx` - Vendor UI
- `src/shared/services/completionService.ts` - Completion API calls
- `src/shared/services/bookingCompletionService.ts` - Completion helpers

---

## ✅ Status: FULLY DOCUMENTED

The completed booking storage system uses:
1. **bookings** table for main record
2. **receipts** table for payment history
3. **wallet_transactions** table for vendor earnings
4. **vendor_wallets** table for balance tracking

All connected through the two-sided completion flow! 🎉
