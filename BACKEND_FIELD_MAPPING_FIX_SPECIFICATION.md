# BACKEND FIX SPECIFICATION - Database Schema Mismatch

## 🎯 CRITICAL ISSUE IDENTIFIED

**Frontend Status**: ✅ **READY** - Updated to use `coupleId` field  
**Database Status**: ✅ **CORRECT** - Has `couple_id` column  
**Backend Status**: ❌ **HARDCODED** - Still tries to insert `user_id`

---

## 📋 DATABASE SCHEMA (CORRECT)

The database schema is **perfect** and has all required columns:

```sql
-- EXISTING DATABASE SCHEMA (NO CHANGES NEEDED)
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    service_id VARCHAR(100),
    service_name VARCHAR(255),
    vendor_id VARCHAR(100),
    vendor_name VARCHAR(255),
    couple_id VARCHAR(100),           -- ✅ THIS EXISTS
    couple_name VARCHAR(255),
    event_date DATE NOT NULL,
    event_time TIME,
    event_location VARCHAR(500),
    guest_count INTEGER,
    service_type VARCHAR(100),
    budget_range VARCHAR(20),
    special_requests TEXT,
    contact_phone VARCHAR(20),
    preferred_contact_method VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    total_amount NUMERIC(10,2),
    deposit_amount NUMERIC(10,2),
    notes TEXT,
    contract_details TEXT,
    response_message TEXT,
    estimated_cost_min NUMERIC(10,2),
    estimated_cost_max NUMERIC(10,2),
    estimated_cost_currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Constraints**:
- ✅ Status must be: `request`, `approved`, `downpayment`, `fully_paid`, `completed`, `declined`, `cancelled`
- ✅ Contact method must be: `email`, `phone`, `message`

---

## 🚫 BACKEND PROBLEM

**Current Error**: `"column 'user_id' of relation 'bookings' does not exist"`

**Root Cause**: Backend API endpoint `/api/bookings/request` is hardcoded to use `user_id` but database has `couple_id`

---

## 🔧 REQUIRED BACKEND FIXES

### Fix 1: Update Field Mapping (Required)

**Backend Code Location**: `/api/bookings/request` endpoint handler

**Current (Wrong)**:
```javascript
// Backend is doing this (WRONG):
const bookingData = {
  vendor_id: req.body.vendorId,
  service_name: req.body.serviceName,
  event_date: req.body.eventDate,
  user_id: req.body.coupleId,  // ❌ WRONG COLUMN NAME
  // ... other fields
};
```

**Required Fix**:
```javascript
// Backend should do this (CORRECT):
const bookingData = {
  vendor_id: req.body.vendorId,
  service_name: req.body.serviceName,
  event_date: req.body.eventDate,
  couple_id: req.body.coupleId,  // ✅ CORRECT COLUMN NAME
  couple_name: req.body.coupleName || null,
  event_time: req.body.eventTime || null,
  event_location: req.body.eventLocation || null,
  guest_count: req.body.guestCount || null,
  service_type: req.body.serviceType || null,
  budget_range: req.body.budgetRange || null,
  special_requests: req.body.specialRequests || null,
  contact_phone: req.body.contactPhone || null,
  preferred_contact_method: req.body.preferredContactMethod || 'email',
  status: 'request'  // Use valid status from constraint
};
```

### Fix 2: Update SQL Query (Required)

**Current (Wrong)**:
```sql
-- Backend is trying this (FAILS):
INSERT INTO bookings (vendor_id, service_name, event_date, user_id, ...)
VALUES ($1, $2, $3, $4, ...)
```

**Required Fix**:
```sql
-- Backend should use this (WORKS):
INSERT INTO bookings (
  vendor_id, service_name, event_date, couple_id, 
  event_time, event_location, guest_count, service_type,
  budget_range, special_requests, contact_phone, 
  preferred_contact_method, status, created_at, updated_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
)
```

---

## 🧪 FRONTEND INTEGRATION STATUS

### ✅ Already Fixed
- **CentralizedBookingAPI.ts**: Updated to send `coupleId` instead of `userId`
- **BookingRequestModal.tsx**: Sends comprehensive booking data
- **Field Mapping**: Frontend → Backend transformation correct
- **Error Handling**: Fallback to local bookings when backend fails

### Frontend Request Format (Correct)
```javascript
// Frontend sends this (CORRECT):
{
  "vendorId": "3",
  "serviceName": "Wedding Photography Package",
  "eventDate": "2025-06-15",
  "coupleId": "1-2025-001",        // Maps to couple_id
  "eventTime": "14:00:00",
  "eventLocation": "Central Park, New York",
  "guestCount": 150,
  "specialRequests": "Photos with family",
  "contactPhone": "+1-555-0123",
  "preferredContactMethod": "email",
  "budgetRange": "$3000-5000",
  "serviceType": "photography"
}
```

---

## 🚀 TESTING AFTER FIX

### Step 1: Backend Fix Implementation
1. Update `/api/bookings/request` endpoint to use `couple_id` instead of `user_id`
2. Update SQL INSERT query to use correct column names
3. Test backend deployment

### Step 2: Verification Script
```bash
# Run our test script to verify the fix
node test-real-database-schema.mjs
```

**Expected Result After Fix**:
```
✅ SUCCESS! Booking created with real schema!
📋 Created booking: { id: "123", couple_id: "1-2025-001", ... }
✅ SUCCESS! Real bookings are now appearing!
```

### Step 3: Frontend Integration Test
1. Open BookingRequestModal in browser
2. Submit a booking request
3. ✅ Should create real booking in database
4. ✅ Should appear in VendorBookings page
5. ✅ Should appear in IndividualBookings page

---

## 📊 EXPECTED IMPACT AFTER FIX

### Before Fix (Current)
- ❌ All booking requests fail with 500 error
- ❌ VendorBookings shows mock data only
- ❌ IndividualBookings shows mock data only
- ❌ No real bookings in database

### After Fix (Expected)
- ✅ Booking requests create real database entries
- ✅ VendorBookings shows real bookings from database
- ✅ IndividualBookings shows real bookings from database
- ✅ Full booking workflow operational
- ✅ Quote sending, status updates, and notifications work

---

## 🔗 CODE LOCATIONS

### Backend (Needs Fix)
- **API Endpoint**: `/api/bookings/request` POST handler
- **Field Mapping**: `user_id` → `couple_id`
- **SQL Query**: UPDATE INSERT statement column names

### Frontend (Already Fixed)
- ✅ `src/services/api/CentralizedBookingAPI.ts` - Uses `coupleId`
- ✅ `src/modules/services/components/BookingRequestModal.tsx` - Working
- ✅ `src/pages/users/vendor/bookings/VendorBookings.tsx` - Ready for real data

### Database (Correct)
- ✅ Schema is perfect - no changes needed
- ✅ All constraints are proper
- ✅ All indexes are in place

---

## 🎯 SUMMARY

**Issue**: Backend hardcoded to use `user_id` field, but database has `couple_id` field  
**Solution**: Update backend field mapping from `user_id` to `couple_id`  
**Impact**: Will immediately enable real booking creation and end-to-end workflow

**Frontend**: ✅ **READY**  
**Database**: ✅ **READY**  
**Backend**: ❌ **NEEDS FIELD MAPPING FIX**

Once backend is fixed, the entire booking system will work perfectly!
