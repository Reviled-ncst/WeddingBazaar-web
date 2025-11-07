# 🌐 Backend API Testing Guide

**Purpose**: Test all booking-reports API endpoints  
**Time**: ~10 minutes  
**Tools**: curl, Postman, or Browser

---

## 🚀 Prerequisites

### 1. Backend Must Be Running

**Local Development:**
```powershell
cd backend-deploy
node production-backend.js
```

**Expected Output:**
```
🚀 Server running on port 3001
✅ Connected to Neon database
📊 Booking Reports routes registered at /api/booking-reports
```

**Production:**
```
https://weddingbazaar-web.onrender.com
```

### 2. Get Test Data IDs

**In Neon SQL Console, get real IDs:**
```sql
-- Get a booking ID
SELECT id, booking_reference, service_type 
FROM bookings 
LIMIT 1;

-- Get a user ID (couple)
SELECT id, email, first_name, last_name
FROM users 
WHERE role = 'individual' OR role = 'couple'
LIMIT 1;

-- Save these IDs for testing below!
```

---

## 🧪 Test Suite

### Test 1: Health Check

**Purpose**: Verify backend is running

**curl:**
```bash
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T14:35:22.000Z"
}
```

✅ **PASS** if you get 200 OK

---

### Test 2: Submit Report (Valid Data)

**Purpose**: Submit a valid report

**curl:**
```bash
curl -X POST http://localhost:3001/api/booking-reports/submit \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "YOUR_BOOKING_ID_HERE",
    "reported_by": "YOUR_USER_ID_HERE",
    "reporter_type": "couple",
    "report_type": "payment_issue",
    "subject": "Test Report - Payment Issue",
    "description": "This is a comprehensive test report to verify the booking reports API endpoint is functioning correctly. The vendor charged more than agreed.",
    "priority": "medium"
  }'
```

**Postman:**
- Method: `POST`
- URL: `http://localhost:3001/api/booking-reports/submit`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "booking_id": "abc-123-def-456",
  "reported_by": "user-uuid-here",
  "reporter_type": "couple",
  "report_type": "payment_issue",
  "subject": "Test Report - Payment Issue",
  "description": "This is a comprehensive test report to verify the booking reports API endpoint is functioning correctly. The vendor charged more than agreed.",
  "priority": "medium"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "report": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "booking_id": "abc-123-def-456",
    "reported_by": "user-uuid-here",
    "reporter_type": "couple",
    "report_type": "payment_issue",
    "subject": "Test Report - Payment Issue",
    "description": "This is a comprehensive test report...",
    "evidence_urls": [],
    "priority": "medium",
    "status": "open",
    "admin_notes": null,
    "admin_response": null,
    "reviewed_by": null,
    "reviewed_at": null,
    "resolved_at": null,
    "created_at": "2025-11-08T14:35:22.456Z",
    "updated_at": "2025-11-08T14:35:22.456Z"
  }
}
```

**Verify in Database:**
```sql
SELECT * FROM booking_reports 
WHERE subject = 'Test Report - Payment Issue';
```

✅ **PASS** if:
- Status: 200 OK
- `success: true`
- Report object returned with valid UUID
- Database shows the record

---

### Test 3: Submit Report (Missing Fields)

**Purpose**: Verify validation catches missing fields

**curl:**
```bash
curl -X POST http://localhost:3001/api/booking-reports/submit \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "test-123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

✅ **PASS** if:
- Status: 400 Bad Request
- Error message indicates missing fields

---

### Test 4: Submit Report (Invalid Booking)

**Purpose**: Verify booking existence check

**curl:**
```bash
curl -X POST http://localhost:3001/api/booking-reports/submit \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "00000000-0000-0000-0000-000000000000",
    "reported_by": "YOUR_USER_ID_HERE",
    "reporter_type": "couple",
    "report_type": "payment_issue",
    "subject": "Test",
    "description": "Test description for non-existent booking"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Booking not found"
}
```

✅ **PASS** if:
- Status: 404 Not Found
- Error indicates booking not found

---

### Test 5: Submit Report (No Permission)

**Purpose**: Verify user permission check

**curl:**
```bash
curl -X POST http://localhost:3001/api/booking-reports/submit \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "VALID_BOOKING_ID",
    "reported_by": "DIFFERENT_USER_ID",
    "reporter_type": "couple",
    "report_type": "payment_issue",
    "subject": "Test",
    "description": "Test description with wrong user"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "You do not have permission to report this booking"
}
```

✅ **PASS** if:
- Status: 403 Forbidden
- Error indicates no permission

---

### Test 6: Get My Reports

**Purpose**: Retrieve all reports for a specific user

**curl:**
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
      "booking_id": "uuid",
      "report_type": "payment_issue",
      "subject": "Test Report - Payment Issue",
      "status": "open",
      "priority": "medium",
      "created_at": "2025-11-08T14:35:22.456Z"
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

✅ **PASS** if:
- Status: 200 OK
- Returns array of reports
- Includes pagination data

---

### Test 7: Get Reports for Specific Booking

**Purpose**: Get all reports for a booking

**curl:**
```bash
curl http://localhost:3001/api/booking-reports/booking/YOUR_BOOKING_ID_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "reports": [
    {
      "id": "uuid",
      "subject": "Test Report - Payment Issue",
      "status": "open",
      "reporter_type": "couple"
    }
  ]
}
```

✅ **PASS** if returns reports for that booking

---

### Test 8: Admin Get All Reports

**Purpose**: Get all reports (admin endpoint)

**curl:**
```bash
curl http://localhost:3001/api/booking-reports/admin/all
```

**Expected Response:**
```json
{
  "success": true,
  "reports": [
    {
      "id": "uuid",
      "booking_id": "uuid",
      "reported_by": "uuid",
      "reporter_type": "couple",
      "report_type": "payment_issue",
      "subject": "Test Report - Payment Issue",
      "status": "open",
      "priority": "medium",
      "booking_reference": "WB-123456",
      "vendor_name": "Test Vendor",
      "reporter_first_name": "John",
      "reporter_last_name": "Doe",
      "reporter_email": "john@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  },
  "statistics": {
    "total": 1,
    "open": 1,
    "in_review": 0,
    "resolved": 0,
    "dismissed": 0
  }
}
```

✅ **PASS** if:
- Returns all reports with joined data
- Includes statistics

---

### Test 9: Admin Update Report Status

**Purpose**: Update report status (admin)

**curl:**
```bash
curl -X PUT http://localhost:3001/api/booking-reports/admin/YOUR_REPORT_ID_HERE/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_review",
    "admin_notes": "Reviewing this report now"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Report status updated",
  "report": {
    "id": "uuid",
    "status": "in_review",
    "admin_notes": "Reviewing this report now",
    "updated_at": "2025-11-08T14:40:00.000Z"
  }
}
```

**Verify in Database:**
```sql
SELECT status, admin_notes, updated_at 
FROM booking_reports 
WHERE id = 'YOUR_REPORT_ID_HERE';
```

✅ **PASS** if:
- Status updated to 'in_review'
- Admin notes saved
- `updated_at` changed

---

### Test 10: Admin Update Priority

**Purpose**: Update report priority

**curl:**
```bash
curl -X PUT http://localhost:3001/api/booking-reports/admin/YOUR_REPORT_ID_HERE/priority \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "high"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Report priority updated",
  "report": {
    "id": "uuid",
    "priority": "high"
  }
}
```

✅ **PASS** if priority changed to 'high'

---

### Test 11: Admin Delete Report

**Purpose**: Delete a report (admin)

**curl:**
```bash
curl -X DELETE http://localhost:3001/api/booking-reports/admin/YOUR_REPORT_ID_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

**Verify in Database:**
```sql
SELECT COUNT(*) FROM booking_reports 
WHERE id = 'YOUR_REPORT_ID_HERE';
-- Should return 0
```

✅ **PASS** if:
- Report deleted from database
- Returns success message

---

## 📊 Test Results Matrix

| # | Test | Method | Endpoint | Expected Status | Result |
|---|------|--------|----------|-----------------|--------|
| 1 | Health Check | GET | `/api/health` | 200 | ⏳ |
| 2 | Submit Valid Report | POST | `/api/booking-reports/submit` | 200 | ⏳ |
| 3 | Submit Missing Fields | POST | `/api/booking-reports/submit` | 400 | ⏳ |
| 4 | Submit Invalid Booking | POST | `/api/booking-reports/submit` | 404 | ⏳ |
| 5 | Submit No Permission | POST | `/api/booking-reports/submit` | 403 | ⏳ |
| 6 | Get My Reports | GET | `/api/booking-reports/my-reports/:userId` | 200 | ⏳ |
| 7 | Get Booking Reports | GET | `/api/booking-reports/booking/:bookingId` | 200 | ⏳ |
| 8 | Admin Get All | GET | `/api/booking-reports/admin/all` | 200 | ⏳ |
| 9 | Admin Update Status | PUT | `/api/booking-reports/admin/:id/status` | 200 | ⏳ |
| 10 | Admin Update Priority | PUT | `/api/booking-reports/admin/:id/priority` | 200 | ⏳ |
| 11 | Admin Delete | DELETE | `/api/booking-reports/admin/:id` | 200 | ⏳ |

---

## 🔧 Postman Collection

### Import this JSON into Postman:

```json
{
  "info": {
    "name": "Booking Reports API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Submit Report",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"booking_id\": \"{{booking_id}}\",\n  \"reported_by\": \"{{user_id}}\",\n  \"reporter_type\": \"couple\",\n  \"report_type\": \"payment_issue\",\n  \"subject\": \"Test Report\",\n  \"description\": \"Test description\"\n}"
        },
        "url": "{{base_url}}/api/booking-reports/submit"
      }
    },
    {
      "name": "Get My Reports",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/booking-reports/my-reports/{{user_id}}"
      }
    },
    {
      "name": "Admin Get All Reports",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/booking-reports/admin/all"
      }
    }
  ],
  "variable": [
    {"key": "base_url", "value": "http://localhost:3001"},
    {"key": "booking_id", "value": ""},
    {"key": "user_id", "value": ""}
  ]
}
```

---

## 🐛 Troubleshooting

### Error: "ECONNREFUSED"
**Solution:** Backend not running. Start with `node production-backend.js`

### Error: "Missing required fields"
**Solution:** Check all required fields are in request body

### Error: "Booking not found"
**Solution:** Use valid booking ID from database

### Error: "Database connection failed"
**Solution:** Check Neon database credentials in `.env`

### Error: "Route not found"
**Solution:** Verify routes are registered in `production-backend.js`

---

## ✅ Success Criteria

**Backend API is working if:**

- ✅ All 11 tests pass
- ✅ Can submit valid reports
- ✅ Validation catches errors
- ✅ Database records are created
- ✅ Admin endpoints work
- ✅ Updates and deletes work

**If all tests pass: BACKEND API IS READY! ✅**

---

**Backend API Testing Complete!** ✅  
**Next Step**: Test Frontend UI (modal and button)
