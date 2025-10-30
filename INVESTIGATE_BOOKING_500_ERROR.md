# 🔍 Investigating Booking API 500 Error

## Date: October 29, 2025

## 🚨 Current Issue

**Error**: `POST /api/bookings/request` returns **500 Internal Server Error**

### Console Logs
```javascript
POST https://weddingbazaar-web.onrender.com/api/bookings/request 500 (Internal Server Error)
❌ [OptimizedBooking] API call failed: Error: HTTP 500
```

### Service Details (Working)
- ✅ Services loaded successfully (7 services)
- ✅ Vendor data enhanced correctly
- ✅ Images displayed properly
- ✅ No infinite render loop
- ✅ Booking modal opens correctly
- ❌ Booking submission fails with 500 error

### Test Case
**Service**: Baker (SRV-0002)
- **Vendor**: Test Wedding Services (2-2025-001)
- **Category**: Cake
- **Rating**: 4.6 (5 reviews)

## 🔍 Investigation Steps

### Step 1: Check Backend Logs in Render
1. Go to: https://dashboard.render.com
2. Select: `weddingbazaar-web` service
3. Click: **Logs** tab
4. Search for: "POST /api/bookings/request"
5. Look for error stack traces or validation errors

### Step 2: Check Booking Payload
The frontend is sending:
```javascript
{
  userId: '1-2025-005',
  coupleId: '1-2025-005', // Added to fix 400 error
  vendorId: '2-2025-001',
  serviceId: 'SRV-0002',
  serviceType: 'Cake',
  eventDate: '2025-11-15',
  eventLocation: 'Manila',
  guestCount: 150,
  budgetRange: '50000-100000',
  specialRequests: 'Please provide gluten-free options',
  // ... other fields
}
```

### Step 3: Check Backend Route
**File**: `backend-deploy/routes/bookings.cjs`
**Endpoint**: `POST /api/bookings/request`

Possible causes:
1. ❌ Missing required field validation
2. ❌ Database schema mismatch
3. ❌ Invalid data type (e.g., number vs string)
4. ❌ Foreign key constraint violation
5. ❌ Null constraint on required field

### Step 4: Check Database Schema
**Table**: `bookings`

Required fields to verify:
- `user_id` (UUID, NOT NULL)
- `vendor_id` (UUID, NOT NULL, FK to vendors)
- `service_id` (UUID, FK to services)
- `service_type` (VARCHAR)
- `event_date` (DATE, NOT NULL)
- `event_location` (VARCHAR)
- `status` (VARCHAR, DEFAULT 'request')
- `amount` (DECIMAL)

## 🎯 Likely Root Causes

### Hypothesis 1: Missing Required Field
**Probability**: 60%

The backend might require a field that the frontend isn't sending:
- `couple_id` (we added this, but might be wrong format)
- `amount` (might be required but we're sending null)
- `booking_reference` (might need to be generated)

### Hypothesis 2: Invalid Foreign Key
**Probability**: 30%

The `vendor_id` or `service_id` might not exist in the database:
- Vendor `2-2025-001` might not exist
- Service `SRV-0002` might not match vendor

### Hypothesis 3: Data Type Mismatch
**Probability**: 10%

A field might have the wrong data type:
- `guestCount` as string instead of number
- `eventDate` format incorrect
- `budgetRange` not matching enum

## 🔧 Quick Tests

### Test 1: Simplified Payload
Try sending minimal required fields:
```bash
curl -X POST https://weddingbazaar-web.onrender.com/api/bookings/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "1-2025-005",
    "vendorId": "2-2025-001",
    "serviceId": "SRV-0002",
    "eventDate": "2025-11-15",
    "eventLocation": "Manila"
  }'
```

### Test 2: Check Vendor Exists
```sql
SELECT id, business_name FROM vendors WHERE id = '2-2025-001';
```

### Test 3: Check Service Exists
```sql
SELECT id, title, vendor_id FROM services WHERE id = 'SRV-0002';
```

### Test 4: Check User Exists
```sql
SELECT id, email, full_name FROM users WHERE id = '1-2025-005';
```

## 📋 Action Items

### Immediate (Next 10 minutes)
1. ⏳ Check Render backend logs for 500 error details
2. ⏳ Identify missing field or validation error
3. ⏳ Check if vendor/service/user IDs exist in database

### Short-term (Next 30 minutes)
1. ⏳ Fix backend validation or add missing field
2. ⏳ Update frontend payload if needed
3. ⏳ Deploy backend fix to Render
4. ⏳ Test booking submission again

### Verification
1. ⏳ Submit test booking
2. ⏳ Verify 200 OK response
3. ⏳ Check booking created in database
4. ⏳ Verify success message shown to user

## 🚀 Expected Fix

Once we identify the root cause, the fix will likely be:

**Option A: Frontend Fix (add missing field)**
```typescript
// Add missing field to payload
const payload = {
  ...existingFields,
  missingField: 'required_value'
};
```

**Option B: Backend Fix (relax validation)**
```javascript
// Make optional field nullable
const { userId, vendorId, optionalField = null } = req.body;
```

**Option C: Database Fix (update schema)**
```sql
-- Make field nullable if not required
ALTER TABLE bookings ALTER COLUMN some_field DROP NOT NULL;
```

## 📞 Next Steps

1. **Check Render Logs**: Look for exact error message
2. **Identify Root Cause**: Missing field, wrong type, or constraint violation
3. **Apply Fix**: Update frontend, backend, or database
4. **Deploy**: Push changes to production
5. **Test**: Verify booking submission works
6. **Document**: Update this file with solution

---

**Status**: 🔍 **INVESTIGATING**
**Priority**: 🔥 **HIGH**
**Impact**: Users cannot submit bookings
**ETA**: 30 minutes to identify and fix

---

*Created: October 29, 2025*
*Next Action: Check Render backend logs*
