# BACKEND DATABASE SCHEMA FIX REQUIREMENTS

## 🚨 CRITICAL: Database Schema Issues Identified

**Status**: Frontend ✅ Ready | Backend ❌ Schema Mismatch  
**Issue**: Backend code expects `user_id` column that doesn't exist in database  
**Impact**: All booking creation attempts fail with database error

---

## 📋 REQUIRED BACKEND FIXES

### 1. Database Schema Fix (Required)

**Current Error**: `"column 'user_id' of relation 'bookings' does not exist"`

**Solution Options**:

#### Option A: Add Missing Column (Recommended)
```sql
-- Add the missing user_id column to bookings table
ALTER TABLE bookings ADD COLUMN user_id VARCHAR(255);

-- Add index for performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);

-- If you want to link to existing users table:
-- ALTER TABLE bookings ADD CONSTRAINT fk_bookings_user_id 
-- FOREIGN KEY (user_id) REFERENCES users(id);
```

#### Option B: Update Backend Code to Use Existing Column
```sql
-- First, identify what column actually stores user/couple ID:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name LIKE '%user%' OR column_name LIKE '%couple%' OR column_name LIKE '%client%';
```

Then update your backend booking creation code to use the correct column name instead of `user_id`.

### 2. API Endpoint Verification

**Correct Endpoint**: `/api/bookings/request` (not `/api/bookings`)  
**Current Status**: ✅ Endpoint exists and accepts requests  
**Field Format**: ✅ camelCase format working correctly

**Backend should accept**:
```javascript
{
  vendorId: "3",
  serviceName: "Wedding Photography Package", 
  eventDate: "2025-06-15",
  userId: "1-2025-001", // This maps to user_id column
  // ... other optional fields
}
```

### 3. Required Field Validation

**Current Validation**: ✅ Working correctly  
**Required Fields**: `vendorId`, `serviceName`, `eventDate`  
**User Field**: `userId` → maps to `user_id` column (missing)

---

## 🔧 BACKEND CODE LOCATIONS TO UPDATE

### 1. Database Migration
Create a new migration file to add the `user_id` column:

```sql
-- migrations/add_user_id_to_bookings.sql
ALTER TABLE bookings ADD COLUMN user_id VARCHAR(255);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
```

### 2. Booking Creation Route
File: `/api/bookings/request` endpoint handler

**Current Issue**: Backend tries to insert `user_id` but column doesn't exist  
**Fix**: Ensure column exists OR update field mapping

```javascript
// Example backend code fix (adjust to your framework):
app.post('/api/bookings/request', async (req, res) => {
  const { vendorId, serviceName, eventDate, userId, ...otherFields } = req.body;
  
  // Map frontend camelCase to database snake_case
  const bookingData = {
    vendor_id: vendorId,
    service_name: serviceName,
    event_date: eventDate,
    user_id: userId, // This column must exist in database
    // ... other fields
  };
  
  // Insert into database
  const result = await db.query(
    'INSERT INTO bookings (vendor_id, service_name, event_date, user_id, ...) VALUES ($1, $2, $3, $4, ...)',
    [bookingData.vendor_id, bookingData.service_name, bookingData.event_date, bookingData.user_id, ...]
  );
});
```

---

## 🧪 TESTING AFTER FIX

### 1. Manual Database Test
```sql
-- Test if user_id column exists
SELECT user_id FROM bookings LIMIT 1;

-- Test booking insertion manually
INSERT INTO bookings (vendor_id, service_name, event_date, user_id, status, created_at, updated_at) 
VALUES ('3', 'Test Service', '2025-06-15', '1-2025-001', 'pending', NOW(), NOW());
```

### 2. API Test
Use our test script to verify the fix:

```bash
# Test booking creation after backend fix
node test-correct-booking-endpoint.mjs
```

Expected result after fix:
- ✅ Status 200/201 (Success)
- ✅ Booking created in database
- ✅ Booking appears in `/api/bookings/vendor/3`

### 3. Frontend Integration Test
After backend fix:
1. Open BookingRequestModal in browser
2. Submit a booking request
3. Verify booking appears in IndividualBookings page
4. Verify booking appears in VendorBookings page

---

## 📊 CURRENT INTEGRATION STATUS

### ✅ Frontend Ready
- BookingRequestModal.tsx: Sends correct data format
- CentralizedBookingAPI.ts: Uses correct endpoint (`/api/bookings/request`)
- Field transformation: snake_case → camelCase ✅
- Error handling: Fallback to local bookings ✅
- User experience: Toast notifications working ✅

### ❌ Backend Needs Fix
- Database schema: Missing `user_id` column
- Column mapping: Backend INSERT fails
- Booking creation: 500 error on database insert

### 🎯 Expected Outcome After Fix
1. BookingRequestModal creates real bookings ✅
2. VendorBookings shows real data (no more mock data) ✅
3. IndividualBookings shows real data ✅
4. Full booking workflow operational ✅

---

## 🚀 DEPLOYMENT STEPS

### 1. Database Migration
```bash
# Run the migration to add user_id column
psql -d your_database -f migrations/add_user_id_to_bookings.sql
```

### 2. Backend Deployment
```bash
# Deploy updated backend code with schema fix
git add .
git commit -m "Fix booking creation - add user_id column support"
git push origin main
```

### 3. Verification
```bash
# Test the fix
curl -X POST https://weddingbazaar-web.onrender.com/api/bookings/request \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "3",
    "serviceName": "Test Service", 
    "eventDate": "2025-06-15",
    "userId": "1-2025-001"
  }'
```

Expected response:
```json
{
  "success": true,
  "booking": {
    "id": "generated-id",
    "vendor_id": "3",
    "user_id": "1-2025-001",
    ...
  }
}
```

---

## 📞 SUPPORT

If you need help with the backend implementation:

1. **Database Schema**: Use the SQL commands provided above
2. **Backend Code**: Update the booking creation endpoint to handle `user_id`
3. **Testing**: Use our comprehensive test scripts to verify the fix
4. **Integration**: Frontend will work immediately after backend fix

**Frontend Status**: ✅ **COMPLETE - No further changes needed**  
**Backend Status**: ❌ **REQUIRES SCHEMA FIX**

---

## 🔗 RELATED FILES

### Frontend (Already Fixed)
- ✅ `src/services/api/CentralizedBookingAPI.ts`
- ✅ `src/modules/services/components/BookingRequestModal.tsx`
- ✅ `src/pages/users/vendor/bookings/VendorBookings.tsx`

### Backend (Needs Fix)
- ❌ Database migration for `user_id` column
- ❌ `/api/bookings/request` endpoint handler
- ❌ Booking creation query/ORM mapping

### Test Scripts (Available)
- ✅ `test-correct-booking-endpoint.mjs` - Test after fix
- ✅ `debug-booking-validation.mjs` - Debug issues
- ✅ All comprehensive analysis scripts
