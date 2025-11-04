# 🧪 BOOKING API TEST WITH REAL DATA - COMPLETE GUIDE

## 📊 WHAT WE HAVE

Based on your services database, here's the **REAL DATA** we'll use for testing:

### Service Details
```
Service ID:    SRV-00001
Service Name:  SADASDAS
Category:      Rentals
Price Range:   ₱10,000 - ₱50,000
Vendor ID:     2-2025-003
Vendor Email:  vendor0qw@gmail.com
Location:      Limpkin Street, Molino, Bacoor, Cavite
```

### Test Booking Details
```
Event Date:    December 25, 2025 (Christmas)
Amount:        ₱25,000 (middle of price range)
Location:      Limpkin Street, Molino, Bacoor, Cavite
Status:        request (new booking request)
```

---

## 🎯 TESTING OPTIONS

You have **TWO ways** to test:

### Option 1: Node.js Script (Recommended for detailed logs)
### Option 2: Browser Console (Easier, no setup needed)

---

## 📝 OPTION 1: NODE.JS SCRIPT

### Step 1: Run the Test Script
```powershell
node test-booking-with-real-service.js
```

### Step 2: What to Look For

#### ✅ SUCCESS Response (Status 200/201)
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking_id": "BOOK-xxxxx",
  "booking": { ... }
}
```

**If successful:**
- ✅ Booking created in database
- ✅ Email sent to vendor (vendor0qw@gmail.com)
- ✅ Email confirmation sent to user
- ✅ Booking reference generated

**Next Steps:**
1. Check vendor email inbox: **vendor0qw@gmail.com**
2. Check Render logs for email sending confirmation
3. Verify booking in database (Neon SQL Editor)

#### ❌ FAILURE Response (Status 400/500)

**Foreign Key Error (Most Likely)**
```json
{
  "error": "insert or update on table \"bookings\" violates foreign key constraint \"bookings_service_id_fkey\"",
  "detail": "Key (service_id)=(SRV-00001) is not present in table \"services\"."
}
```

**This means:**
- ❌ Service ID `SRV-00001` does NOT exist in the `services` table
- ❌ The services JSON file you provided may not match the actual database

**Solution:**
1. Check what service IDs actually exist in your database
2. Run this SQL query in Neon:
```sql
SELECT id, service_name, service_type, vendor_id 
FROM services 
LIMIT 10;
```

---

## 🌐 OPTION 2: BROWSER CONSOLE TEST

### Step 1: Open Your Website
1. Go to: https://weddingbazaarph.web.app
2. Press **F12** (or Ctrl+Shift+I) to open Developer Tools
3. Click on **Console** tab

### Step 2: Copy and Paste Test Script
1. Open file: `TEST_BOOKING_IN_BROWSER.js`
2. Copy the **ENTIRE** script (Ctrl+A, Ctrl+C)
3. Paste into Console (Ctrl+V)
4. Press **Enter**

### Step 3: Review Results

The script will show:
- 📋 Test data being sent
- 🚀 API request details
- 📊 Response status and data
- ✅ or ❌ Success/failure status
- 💡 Troubleshooting tips if failed

---

## 🔍 AFTER RUNNING THE TEST

### ✅ If Test SUCCEEDS (Status 200/201)

**1. Check Vendor Email**
- Email: vendor0qw@gmail.com
- Subject: "New Wedding Booking Request"
- Should contain booking details

**2. Check Render Logs**
- Go to: https://dashboard.render.com
- Find your backend service
- Click "Logs" tab
- Look for:
  - `📧 Sending booking notification email to vendor0qw@gmail.com`
  - `✅ Vendor email sent successfully`
  - `✅ User confirmation email sent successfully`

**3. Check Database**
- Go to Neon SQL Editor
- Run:
```sql
SELECT * FROM bookings 
WHERE vendor_id = '2-2025-003' 
ORDER BY created_at DESC 
LIMIT 5;
```

**4. Next Step: Test Frontend**
If API test succeeds BUT frontend booking modal doesn't work:
- **Problem is in the FRONTEND booking modal**
- Need to check which API/service the modal is calling
- May be using wrong endpoint or wrong data format

---

### ❌ If Test FAILS

**Common Errors and Solutions:**

#### 1. Foreign Key Constraint Error (500)
```
"violates foreign key constraint \"bookings_service_id_fkey\""
```

**Problem:** Service ID doesn't exist in database

**Solution:**
```sql
-- Check existing service IDs
SELECT id, service_name, service_type, vendor_id 
FROM services 
LIMIT 20;

-- Check existing vendor IDs
SELECT id, business_name, email 
FROM vendors 
LIMIT 20;
```

Use the **actual IDs** from query results in the test script.

#### 2. 404 Not Found
**Problem:** API endpoint doesn't exist or backend not deployed

**Solution:**
- Check backend health: https://weddingbazaar-web.onrender.com/api/health
- Verify backend is running in Render dashboard
- Check if `/api/bookings` route exists in `routes/bookings.cjs`

#### 3. Network Error / Timeout
**Problem:** Backend server is down or unreachable

**Solution:**
- Check Render dashboard for service status
- Restart backend service if needed
- Check backend logs for crash errors

#### 4. CORS Error (Browser only)
**Problem:** CORS policy blocking request

**Solution:**
- Check CORS settings in backend
- Verify `FRONTEND_URL` environment variable in Render
- Add proper CORS headers in backend

---

## 📧 EMAIL NOTIFICATION CHECKLIST

After successful booking creation, these emails should be sent:

### 1. Vendor Notification Email
- **To:** vendor0qw@gmail.com
- **Subject:** "New Wedding Booking Request"
- **Content:**
  - Service: SADASDAS (Rentals)
  - Event Date: December 25, 2025
  - Location: Limpkin Street, Molino, Bacoor, Cavite
  - Amount: ₱25,000
  - Customer details
  - Booking reference

### 2. User Confirmation Email
- **To:** User's email (from test data)
- **Subject:** "Booking Request Confirmed"
- **Content:**
  - Booking confirmation
  - Vendor details
  - Service details
  - Next steps

---

## 🎯 WHAT TO TEST NEXT

### If API Test SUCCEEDS ✅

**Step 1:** Verify emails were received
**Step 2:** Check Render logs for email sending
**Step 3:** Test the **frontend booking modal**
**Step 4:** Compare frontend API call with our test API call
**Step 5:** Fix any differences in frontend implementation

### If API Test FAILS ❌

**Step 1:** Get actual service/vendor IDs from database
**Step 2:** Update test script with correct IDs
**Step 3:** Re-run test
**Step 4:** If still fails, check backend error logs
**Step 5:** May need to fix database schema or backend logic

---

## 📊 QUICK REFERENCE COMMANDS

### Test Booking API (Node.js)
```powershell
node test-booking-with-real-service.js
```

### Check Backend Health
```powershell
curl https://weddingbazaar-web.onrender.com/api/health
```

### Check Email Config
```powershell
curl https://weddingbazaar-web.onrender.com/api/bookings/test-email-config
```

### Manual Email Test
```powershell
cd backend-deploy
node test-email-manually.cjs
```

### Check Database Services
```sql
SELECT id, service_name, service_type, vendor_id, base_price 
FROM services 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Recent Bookings
```sql
SELECT id, booking_reference, vendor_id, service_id, status, created_at
FROM bookings 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🆘 TROUBLESHOOTING FLOWCHART

```
Run Test Script
    ↓
    ├─ SUCCESS (200/201) ─→ Check vendor email ─→ Email received?
    │                                              ├─ YES ✅ → Test frontend
    │                                              └─ NO ❌ → Check Render logs
    │
    └─ FAILURE (400/500) ─→ Check error message
                             ├─ Foreign Key Error → Get real IDs from database
                             ├─ 404 Not Found → Check backend deployment
                             ├─ Network Error → Check backend status
                             └─ Other Error → Check Render logs
```

---

## 📧 NEED HELP?

If you encounter issues:

1. **Share the full output** of the test script
2. **Share Render logs** after running the test
3. **Share SQL query results** for services and vendors
4. **Share any error messages** from console

This will help identify the exact problem and solution!

---

## 🎉 SUCCESS CRITERIA

Test is successful when ALL of these are true:

- ✅ API returns 200/201 status
- ✅ Booking created in database with booking_reference
- ✅ Vendor email received at vendor0qw@gmail.com
- ✅ User confirmation email sent
- ✅ Render logs show email sending success
- ✅ No errors in backend logs

Once API test succeeds, we can confidently test and fix the frontend booking modal!
