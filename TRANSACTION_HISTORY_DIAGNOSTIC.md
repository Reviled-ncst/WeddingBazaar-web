# Transaction History Diagnostic Guide

## Problem
Transaction history page is not showing receipts for the logged-in user (couple).

## Current Implementation

### Frontend Flow
1. **TransactionHistory.tsx** fetches all user's bookings
2. For each booking, it fetches receipts via `/api/payment/receipts/:bookingId`
3. Aggregates all receipts and displays them

### Backend Routes
1. **GET /api/bookings/user/:userId** - Returns all bookings for a couple (uses `couple_id`)
2. **GET /api/payment/receipts/:bookingId** - Returns receipts for a specific booking
3. **GET /api/payment/receipts/user/:userId** - Returns all receipts for a user (uses `couple_id` join)

## Diagnostic Steps

### Step 1: Check User ID in Frontend
```javascript
// Open browser console on transaction history page
// Check what user.id is being used
console.log('Current user:', user);
console.log('User ID:', user?.id);
```

### Step 2: Check Bookings API Response
```javascript
// In TransactionHistory.tsx, around line 75
// Check what bookings are returned
console.log('Bookings response:', bookingsData);
console.log('Bookings array:', bookings);
console.log('First booking couple_id:', bookings[0]?.couple_id);
```

### Step 3: Check Receipts in Database
Run this query in Neon SQL Console:
```sql
-- Check receipts table structure
SELECT * FROM receipts LIMIT 5;

-- Check if receipts have booking_id
SELECT id, booking_id, receipt_number, amount, created_at 
FROM receipts 
ORDER BY created_at DESC 
LIMIT 10;

-- Check bookings and their couple_id
SELECT id, couple_id, vendor_id, status, amount, created_at
FROM bookings
WHERE status IN ('paid_in_full', 'fully_paid', 'deposit_paid', 'downpayment_paid', 'completed')
ORDER BY created_at DESC
LIMIT 10;

-- Join to see which bookings have receipts
SELECT 
  b.id as booking_id,
  b.couple_id,
  b.status,
  b.amount as booking_amount,
  r.id as receipt_id,
  r.receipt_number,
  r.amount as receipt_amount
FROM bookings b
LEFT JOIN receipts r ON r.booking_id = CAST(b.id AS TEXT)
WHERE b.couple_id IS NOT NULL
ORDER BY b.created_at DESC
LIMIT 20;
```

### Step 4: Check Receipt Format
The backend returns receipts with these fields:
- `booking_id` (TEXT) in receipts table
- `bookings.id` (UUID) in bookings table

**CRITICAL**: The join uses `CAST(b.id AS TEXT)` to match types.

### Step 5: Check User ID Format
The user ID from auth context might be:
- Firebase UID (string like "abc123...")
- Neon UUID (string like "123e4567-e89b-12d3-a456-426614174000")

Run this to check actual couple_id values:
```sql
-- Check what couple_id values exist in bookings
SELECT DISTINCT couple_id, COUNT(*) as booking_count
FROM bookings
GROUP BY couple_id;

-- Check users table
SELECT id, email, full_name, role, created_at
FROM users
WHERE role = 'individual' OR role = 'couple'
LIMIT 10;
```

## Common Issues & Fixes

### Issue 1: User ID Mismatch
**Problem**: Frontend uses Firebase UID, but database uses Neon UUID
**Solution**: Ensure login syncs Firebase UID with Neon user ID

### Issue 2: Empty Bookings
**Problem**: No bookings found for user
**Fix**: Check `couple_id` column in bookings table matches user ID

### Issue 3: No Receipts
**Problem**: Bookings exist but no receipts
**Reason**: Receipts only created after payment
**Fix**: Ensure payment flow creates receipt records

### Issue 4: Route Order
**Problem**: Express matches wrong route
**Status**: ✅ FIXED - User route comes before booking route

### Issue 5: Type Mismatch
**Problem**: booking_id TEXT vs bookings.id UUID
**Status**: ✅ FIXED - Backend uses CAST(b.id AS TEXT)

## Testing Checklist

- [ ] User is logged in and user.id is available
- [ ] Bookings API returns bookings array
- [ ] At least one booking has `status` in: `paid_in_full`, `fully_paid`, `deposit_paid`
- [ ] Receipts table has entries with matching `booking_id`
- [ ] Backend logs show successful receipt fetching
- [ ] Frontend console shows receipt data
- [ ] Transaction history cards render with receipt data

## Quick Test Query
Run this in Neon to see if data exists:
```sql
-- Replace 'YOUR_USER_ID' with actual user ID from frontend console
SELECT 
  b.id as booking_id,
  b.couple_id,
  b.status,
  b.service_type,
  b.amount / 100.0 as booking_amount_pesos,
  r.receipt_number,
  r.payment_type,
  r.amount / 100.0 as payment_amount_pesos,
  r.created_at as payment_date,
  v.business_name as vendor
FROM bookings b
LEFT JOIN receipts r ON r.booking_id = CAST(b.id AS TEXT)
LEFT JOIN vendors v ON b.vendor_id = v.id
WHERE b.couple_id = 'YOUR_USER_ID'
ORDER BY r.created_at DESC;
```

## Next Steps

1. **Check browser console logs** - Are bookings being fetched?
2. **Check Neon database** - Do receipts exist for this user's bookings?
3. **Verify user ID** - Is the user ID format consistent?
4. **Test payment flow** - Create a test booking, make payment, check receipt
5. **Check backend logs** - Are API calls reaching the server?

## Backend Deployment Status
- ✅ Route order fixed
- ✅ User receipts endpoint implemented
- ✅ Type casting added for UUID/TEXT join
- ⏳ Deployment complete, waiting for verification

## Frontend Deployment Status
- ✅ TransactionHistory.tsx implemented
- ✅ Fetches bookings then receipts
- ✅ Displays statistics and cards
- ⏳ Deployed to Firebase, waiting for data
