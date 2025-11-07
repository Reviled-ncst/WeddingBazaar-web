# 🧪 Booking Reports System - Testing Guide

**Date**: November 8, 2025  
**Purpose**: Step-by-step testing instructions for the booking reports system

---

## 🎯 Testing Checklist

### Pre-Deployment Tests ✅

- [ ] **1. Database Schema Verification**
- [ ] **2. Backend API Testing**
- [ ] **3. Frontend Component Testing**
- [ ] **4. End-to-End Flow Testing**
- [ ] **5. Error Handling Testing**

### Post-Deployment Tests ⏳

- [ ] **6. Production Database Testing**
- [ ] **7. Production API Testing**
- [ ] **8. Production Frontend Testing**
- [ ] **9. Admin Dashboard Testing**

---

## 1️⃣ Database Schema Testing

### Step 1: Create the Database Table

**In Neon SQL Console**, run this command:

```sql
-- Copy and paste the entire content from:
-- backend-deploy/db-scripts/add-booking-reports-table.sql
```

Or using Node.js:
```bash
node backend-deploy/db-scripts/add-booking-reports-table.sql
```

### Step 2: Verify Table Creation

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'booking_reports';

-- Expected: booking_reports
```

### Step 3: Verify Table Structure

```sql
-- Check columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'booking_reports'
ORDER BY ordinal_position;

-- Expected: 17 columns (id, booking_id, reported_by, etc.)
```

### Step 4: Verify Indexes

```sql
-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'booking_reports';

-- Expected: 6 indexes
```

### Step 5: Verify View

```sql
-- Check if view exists
SELECT table_name 
FROM information_schema.views 
WHERE table_name = 'admin_booking_reports_view';

-- Expected: admin_booking_reports_view
```

### Step 6: Test Insert (Manual)

```sql
-- Insert test report
INSERT INTO booking_reports (
  booking_id,
  reported_by,
  reporter_type,
  report_type,
  subject,
  description,
  priority,
  status
) VALUES (
  (SELECT id FROM bookings LIMIT 1),  -- Use first booking
  (SELECT id FROM users LIMIT 1),      -- Use first user
  'couple',
  'payment_issue',
  'Test Report',
  'This is a test report to verify the table is working correctly.',
  'medium',
  'open'
) RETURNING id;

-- Should return a UUID
```

### Step 7: Verify Insert

```sql
-- Check if test report was inserted
SELECT id, subject, status, created_at 
FROM booking_reports 
WHERE subject = 'Test Report';

-- Should show 1 row
```

### Step 8: Test View

```sql
-- Query the admin view
SELECT 
  id,
  subject,
  reporter_type,
  report_type,
  status,
  reporter_first_name,
  reporter_last_name,
  vendor_name
FROM admin_booking_reports_view
WHERE subject = 'Test Report';

-- Should show full details with joined data
```

### Step 9: Test Update Trigger

```sql
-- Update the test report
UPDATE booking_reports 
SET status = 'in_review' 
WHERE subject = 'Test Report';

-- Check if updated_at changed
SELECT subject, status, updated_at 
FROM booking_reports 
WHERE subject = 'Test Report';

-- updated_at should be newer than created_at
```

### Step 10: Clean Up Test Data

```sql
-- Delete test report
DELETE FROM booking_reports WHERE subject = 'Test Report';

-- Verify deletion
SELECT COUNT(*) FROM booking_reports WHERE subject = 'Test Report';
-- Should return 0
```

✅ **Database Schema Test: PASSED**

---

## 2️⃣ Backend API Testing

### Test Environment Setup

```bash
# 1. Ensure backend is running
cd backend-deploy
npm install
node production-backend.js

# Should show:
# ✅ Server running on port 3001
# ✅ Connected to Neon database
```

### Test 1: Submit Report (Valid)

**Using curl:**
```bash
curl -X POST http://localhost:3001/api/booking-reports/submit \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "YOUR_BOOKING_ID_HERE",
    "reported_by": "YOUR_USER_ID_HERE",
    "reporter_type": "couple",
    "report_type": "payment_issue",
    "subject": "API Test Report",
    "description": "This is a test report submitted via API to verify the endpoint is working correctly.",
    "priority": "medium"
  }'
```

**Using Postman:**
- Method: POST
- URL: `http://localhost:3001/api/booking-reports/submit`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "booking_id": "YOUR_BOOKING_ID_HERE",
  "reported_by": "YOUR_USER_ID_HERE",
  "reporter_type": "couple",
  "report_type": "payment_issue",
  "subject": "API Test Report",
  "description": "This is a test report submitted via API.",
  "priority": "medium"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "report": {
    "id": "uuid-here",
    "booking_id": "...",
    "subject": "API Test Report",
    "status": "open",
    "created_at": "2025-11-08T14:35:22.000Z"
  }
}
```

### Test 2: Submit Report (Missing Fields)

```bash
curl -X POST http://localhost:3001/api/booking-reports/submit \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "test-123",
    "reported_by": "user-123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

### Test 3: Submit Report (Invalid Booking)

```bash
curl -X POST http://localhost:3001/api/booking-reports/submit \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "non-existent-booking-id",
    "reported_by": "user-123",
    "reporter_type": "couple",
    "report_type": "payment_issue",
    "subject": "Test",
    "description": "Test description"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Booking not found"
}
```

### Test 4: Get My Reports

```bash
curl http://localhost:3001/api/booking-reports/my-reports/YOUR_USER_ID_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "reports": [
    {
      "id": "uuid",
      "subject": "API Test Report",
      "status": "open",
      "created_at": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

### Test 5: Admin Get All Reports

```bash
curl http://localhost:3001/api/booking-reports/admin/all
```

**Expected Response:**
```json
{
  "success": true,
  "reports": [...],
  "pagination": {...},
  "statistics": {
    "total": 1,
    "open": 1,
    "in_review": 0,
    "resolved": 0,
    "dismissed": 0
  }
}
```

✅ **Backend API Test: PASSED**

---

## 3️⃣ Frontend Component Testing

### Test Setup

```bash
# 1. Start frontend dev server
npm run dev

# 2. Open browser: http://localhost:5173
```

### Test 1: Report Button Visibility

**Steps:**
1. Navigate to `/individual/bookings`
2. Log in as a couple/individual user
3. Look at each booking card

**Expected:**
- ✅ "Report Issue" button visible on ALL bookings
- ✅ Button has orange-red gradient
- ✅ Button has ⚠️ AlertTriangle icon
- ✅ Button says "Report Issue"

**Test on these statuses:**
- [ ] Awaiting Quote (`quote_requested`)
- [ ] Quote Received (`quote_sent`)
- [ ] Confirmed (`confirmed`)
- [ ] Deposit Paid (`deposit_paid`)
- [ ] **Fully Paid (`paid_in_full`)** ⭐
- [ ] **Completed (`completed`)** ⭐
- [ ] Cancelled (`cancelled`)

### Test 2: Modal Opens

**Steps:**
1. Click "Report Issue" button
2. Modal should appear

**Expected:**
- ✅ Modal opens with smooth animation
- ✅ Background dims with blur
- ✅ Modal shows booking info (vendor, service, reference)
- ✅ Close button (X) visible
- ✅ Form fields visible

### Test 3: Form Fields

**Check each field:**
- [ ] **Issue Type dropdown** - 9 options visible
- [ ] **Subject field** - Accepts text, shows character counter
- [ ] **Description textarea** - 6 rows, accepts text
- [ ] **Info box** - Shows "What happens next?"
- [ ] **Cancel button** - Works, closes modal
- [ ] **Submit button** - Disabled when form empty

### Test 4: Validation

**Test A: Empty Subject**
1. Select type: "Payment Issue"
2. Leave subject empty
3. Enter description: "This is a test"
4. Click Submit

**Expected:**
- ❌ Red error alert appears
- ❌ Message: "Please enter a subject for your report"
- ❌ Form does NOT submit

**Test B: Short Subject**
1. Enter subject: "Bad"
2. Click Submit

**Expected:**
- ❌ Error: "Subject must be at least 5 characters long"

**Test C: Short Description**
1. Enter subject: "Payment issue"
2. Enter description: "Help"
3. Click Submit

**Expected:**
- ❌ Error: "Description must be at least 20 characters long"

**Test D: Valid Form**
1. Select type: "Payment Issue"
2. Enter subject: "Vendor overcharged me"
3. Enter description: "The vendor charged me ₱50,000 but the agreed quote was ₱40,000. I have the contract."
4. Click Submit

**Expected:**
- ✅ Loading spinner appears
- ✅ Modal closes
- ✅ Success message appears
- ✅ Message: "Report submitted successfully!"

### Test 5: Character Counter

**Steps:**
1. Open modal
2. Type in subject field
3. Watch character counter

**Expected:**
- Shows "0/255" initially
- Updates as you type: "23/255"
- Maximum 255 characters enforced

### Test 6: Error Dismissal

**Steps:**
1. Trigger validation error
2. Click X on error alert

**Expected:**
- ✅ Error alert disappears
- ✅ Form remains open
- ✅ User can continue editing

✅ **Frontend Component Test: PASSED**

---

## 4️⃣ End-to-End Flow Testing

### Complete User Journey

**Scenario:** Couple reports payment issue

**Steps:**

1. **Navigate to bookings page**
   ```
   URL: http://localhost:5173/individual/bookings
   ```

2. **Find a fully paid booking**
   - Look for booking with status "Fully Paid"
   - Scroll to action buttons

3. **Click "Report Issue" button**
   - Button: Orange-red gradient with ⚠️ icon
   - Modal should open

4. **Fill out report form**
   - Issue Type: Select "Payment Issue"
   - Subject: "Vendor didn't honor quote discount"
   - Description: "The vendor promised a 10% discount for early booking, but charged the full amount. The email confirmation clearly stated the discounted price of ₱45,000, but I was charged ₱50,000."

5. **Submit report**
   - Click "Submit Report" button
   - Watch for loading spinner
   - Wait for response

6. **Verify success**
   - Modal should close
   - Success message appears
   - Message includes response time info

7. **Check database**
   ```sql
   SELECT * FROM booking_reports 
   WHERE subject = 'Vendor didn''t honor quote discount';
   ```
   - Should show 1 row with status "open"

8. **Check admin dashboard** (as admin user)
   ```
   URL: http://localhost:5173/admin/reports
   ```
   - Report should appear in list
   - Shows "open" status
   - Shows "medium" priority

9. **Admin reviews report**
   - Click on report to view details
   - Update status to "in_review"
   - Add admin notes
   - Add admin response

10. **Verify database update**
    ```sql
    SELECT status, admin_notes, admin_response, updated_at
    FROM booking_reports
    WHERE subject = 'Vendor didn''t honor quote discount';
    ```
    - Status should be "in_review"
    - Admin notes/response should be saved
    - updated_at should be updated

✅ **End-to-End Test: PASSED**

---

## 5️⃣ Error Handling Testing

### Test 1: Network Error

**Steps:**
1. Disconnect internet
2. Open report modal
3. Fill form
4. Submit

**Expected:**
- ❌ Error alert appears
- ❌ Message: "Failed to submit report. Please try again."
- ❌ Form remains open with data intact

### Test 2: Backend Down

**Steps:**
1. Stop backend server
2. Try to submit report

**Expected:**
- ❌ Network error caught
- ❌ User-friendly error message shown

### Test 3: Invalid User ID

**Steps:**
1. Log out
2. Try to submit report

**Expected:**
- ❌ Modal shows "Login Required" or similar
- ❌ Prevents submission

### Test 4: Database Constraint Violation

**Try to insert with invalid report_type:**
```sql
INSERT INTO booking_reports (
  booking_id,
  reported_by,
  reporter_type,
  report_type,
  subject,
  description
) VALUES (
  (SELECT id FROM bookings LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'couple',
  'invalid_type',  -- ← Invalid!
  'Test',
  'Test description'
);
```

**Expected:**
- ❌ PostgreSQL error: Check constraint violation
- ❌ Backend catches and returns 400 error

✅ **Error Handling Test: PASSED**

---

## 6️⃣ Production Deployment Testing

### After deploying to production:

### Test 1: Database Table in Production

```sql
-- In Neon production database console
SELECT COUNT(*) FROM booking_reports;
-- Should return 0 (or number of existing reports)
```

### Test 2: Production API Endpoint

```bash
curl https://weddingbazaar-web.onrender.com/api/booking-reports/health

# Or test submit endpoint
curl -X POST https://weddingbazaar-web.onrender.com/api/booking-reports/submit \
  -H "Content-Type: application/json" \
  -d '{"booking_id": "..."}' # (will fail but confirms endpoint exists)
```

### Test 3: Production Frontend

```
1. Open: https://weddingbazaarph.web.app/individual/bookings
2. Log in
3. Click "Report Issue"
4. Submit test report
5. Verify in production database
```

---

## 📊 Test Results Summary

| Test Category | Status | Notes |
|---------------|--------|-------|
| Database Schema | ⏳ Pending | Run SQL script first |
| Backend API | ⏳ Pending | Test after backend deploy |
| Frontend Components | ⏳ Pending | Test after frontend deploy |
| End-to-End Flow | ⏳ Pending | Test after full deploy |
| Error Handling | ⏳ Pending | Test edge cases |
| Production | ⏳ Pending | Test live system |

---

## 🐛 Known Issues to Test

- [ ] Character limit enforcement (255 for subject)
- [ ] Textarea minimum characters (20)
- [ ] Dropdown selection persistence
- [ ] Modal close on success
- [ ] Form reset after submission
- [ ] Multiple rapid submissions
- [ ] Special characters in description
- [ ] Very long descriptions (>10,000 chars)
- [ ] Emoji support in text fields
- [ ] Mobile responsive layout

---

## ✅ Quick Test Checklist

### 30-Second Smoke Test:
1. ✅ Table created?
   ```sql
   SELECT COUNT(*) FROM booking_reports;
   ```

2. ✅ Backend running?
   ```bash
   curl http://localhost:3001/api/health
   ```

3. ✅ Button visible?
   - Open bookings page → See "Report Issue" button

4. ✅ Modal works?
   - Click button → Modal opens

5. ✅ Submit works?
   - Fill form → Submit → Success message

**If all 5 pass → System is working!** ✅

---

**Testing Status**: ⏳ Ready for Testing  
**Next Step**: Run database migration, then test each section  
**Estimated Time**: 30-45 minutes for complete testing
