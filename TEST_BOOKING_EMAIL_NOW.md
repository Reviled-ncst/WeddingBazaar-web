# ✅ TESTING GUIDE: Diagnose Booking Email Issue

## 🎯 Objective
Determine **why booking requests don't send emails** to vendors by testing the complete flow with detailed logging.

## 🔧 Changes Deployed

### Frontend (Firebase)
**File**: `src/services/api/optimizedBookingApiService.ts`

**Added detailed console logging**:
- 🚀 Booking request start
- 🏥 Health check result
- ⚠️ Fallback triggered (if health fails)
- 📡 API call details (endpoint, payload)
- ✅ Response received
- ❌ API call failures

### Backend (Already has logging)
**File**: `backend-deploy/routes/bookings.cjs`

**Existing logs**:
- 📝 Creating booking request
- 💾 Inserting booking with data
- ✅ Booking request created with ID
- 📧 Sending new booking notification to vendor
- ❌ Email sending errors

## 📋 Test Steps

### Step 1: Open Browser DevTools
1. Go to: https://weddingbazaarph.web.app
2. Press **F12** to open DevTools
3. Go to **Console** tab (for logs)
4. Go to **Network** tab (for API calls)
5. Clear console and network logs (click trash icon)

### Step 2: Login
1. Click "Login" button
2. Login with your credentials:
   - Email: `renzrusselbauto@gmail.com`
   - Password: `your-password`
3. You should be redirected to individual dashboard

### Step 3: Navigate to Services
1. Click "Services" in the navigation menu
2. Browse for a vendor/service
3. Click "Request Booking" button on any service card

### Step 4: Fill Booking Form
Fill in the booking form with test data:
- **Event Date**: Any future date (e.g., 2025-06-15)
- **Event Time**: Any time (e.g., 10:00 AM)
- **Event Location**: Any location (e.g., Manila Hotel)
- **Guest Count**: Any number (e.g., 100)
- **Budget Range**: Select any option (e.g., ₱50,000 - ₱100,000)
- **Contact Person**: Your name
- **Contact Phone**: Your phone number
- **Contact Email**: Your email
- **Preferred Contact Method**: Email
- **Special Requests**: (Optional) Any notes

### Step 5: Submit & Watch Console
1. Click "Submit Booking Request" button
2. **IMMEDIATELY** look at the **Console** tab
3. **Look for these logs** (in order):

#### ✅ Expected Logs (If Working)
```
🚀 [BOOKING API] Starting booking request
  {userId: "...", serviceId: "...", vendorId: "...", timestamp: "..."}

🏥 [BOOKING API] Health check result:
  {isHealthy: true, status: "fulfilled", value: true}

📡 [BOOKING API] Sending POST /api/bookings/request
  {endpoint: "/api/bookings/request", payload: {...}, headers: {...}}

✅ [BOOKING API] Response received:
  {success: true, hasData: true, message: "Booking request created successfully"}
```

#### ⚠️ Problem Logs (If Failing)
```
🚀 [BOOKING API] Starting booking request
  {userId: "...", serviceId: "...", vendorId: "...", timestamp: "..."}

🏥 [BOOKING API] Health check result:
  {isHealthy: false, status: "rejected", reason: "..."}

⚠️ [BOOKING API] Health check failed, using fallback booking
```

OR

```
🚀 [BOOKING API] Starting booking request
🏥 [BOOKING API] Health check result: {isHealthy: true}
📡 [BOOKING API] Sending POST /api/bookings/request
❌ [BOOKING API] API call failed:
  {error: "...", stack: "...", name: "..."}

🔄 [BOOKING API] Using fallback booking
```

### Step 6: Check Network Tab
1. Click on **Network** tab in DevTools
2. Filter by "booking" or "request"
3. **Look for** `POST /api/bookings/request`

#### ✅ If Request Exists
- Click on the request
- Check **Status Code**:
  - `200 OK` ✅ (Success)
  - `400 Bad Request` ⚠️ (Invalid data)
  - `500 Internal Server Error` ❌ (Backend error)
- Check **Response** tab for backend response
- Check **Payload** tab for data sent

#### ❌ If Request Doesn't Exist
- Booking never reached backend
- Health check failed OR
- Frontend error before API call

### Step 7: Check Backend Logs (Render)
1. Go to: https://dashboard.render.com
2. Click on "weddingbazaar-web" service
3. Click **Logs** tab
4. **Look for** (should appear within seconds):

#### ✅ Expected Backend Logs
```
📝 Creating booking request: {...}
💾 Inserting booking with data: {...}
✅ Booking request created with ID: <uuid>
📧 Sending new booking notification to vendor: vendor@example.com
```

#### ❌ If No Logs
- Request never reached backend
- Health check failed
- Network/CORS issue

#### ⚠️ If Partial Logs
```
📝 Creating booking request: {...}
❌ Error preparing vendor notification: ...
```
- Booking created but email failed
- Check error message for details

## 📊 Diagnostic Results

### Scenario A: Health Check Failing
**Console Logs**:
```
🏥 [BOOKING API] Health check result: {isHealthy: false}
⚠️ [BOOKING API] Health check failed, using fallback booking
```

**Problem**: Backend health endpoint not responding
**Action**: Check backend health endpoint manually:
```javascript
fetch('https://weddingbazaar-web.onrender.com/api/health')
  .then(r => r.json())
  .then(data => console.log('Health:', data))
  .catch(err => console.error('Health failed:', err));
```

### Scenario B: API Call Timeout
**Console Logs**:
```
📡 [BOOKING API] Sending POST /api/bookings/request
❌ [BOOKING API] API call failed: {error: "timeout", ...}
```

**Problem**: Backend taking too long to respond (>30s)
**Action**: Check backend performance or increase timeout

### Scenario C: Network/CORS Error
**Console Logs**:
```
📡 [BOOKING API] Sending POST /api/bookings/request
❌ [BOOKING API] API call failed: {error: "Failed to fetch", ...}
```

**Problem**: CORS policy or network connectivity
**Action**: Check CORS configuration in backend

### Scenario D: Backend Error (500)
**Console Logs**:
```
✅ [BOOKING API] Response received: {success: false, message: "..."}
```

**Network Tab**: Status 500

**Backend Logs**: Error message

**Problem**: Backend logic error
**Action**: Check backend logs for detailed error

### Scenario E: Email Service Error
**Backend Logs**:
```
📝 Creating booking request
✅ Booking request created with ID
❌ Failed to send vendor notification email: ...
```

**Problem**: Email sending failed (Gmail credentials, SMTP, etc.)
**Action**: Check email configuration in Render

## 🎯 What to Report Back

After testing, please provide:

1. **Console Logs** (screenshot or copy-paste):
   - All logs starting with 🚀 🏥 📡 ✅ ❌ ⚠️
   
2. **Network Tab** (screenshot):
   - Show if `POST /api/bookings/request` exists
   - Show status code and response
   
3. **Backend Logs** (screenshot from Render):
   - All logs around the time you submitted booking
   - Look for "Creating booking request" timestamp
   
4. **User Experience**:
   - Did success modal appear?
   - Did booking appear in bookings list?
   - Did you receive email notification?

## 🚀 Quick Test Commands

### Test Health Endpoint (Browser Console)
```javascript
fetch('https://weddingbazaar-web.onrender.com/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Health:', data))
  .catch(err => console.error('❌ Health failed:', err));
```

### Test Booking API Directly (Browser Console)
```javascript
fetch('https://weddingbazaar-web.onrender.com/api/bookings/request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': '1-2025-001'
  },
  body: JSON.stringify({
    coupleId: '1-2025-001',
    vendorId: 'VND-0001',
    serviceId: 'SRV-0001',
    eventDate: '2025-06-15',
    eventLocation: 'Manila Hotel',
    guestCount: 100,
    budgetRange: '₱50,000 - ₱100,000',
    contactPerson: 'Test User',
    contactPhone: '09123456789',
    contactEmail: 'test@example.com',
    preferredContactMethod: 'email',
    serviceName: 'Test Service',
    serviceType: 'Photography',
    vendorName: 'Test Vendor',
    coupleName: 'Test Couple'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Booking API:', data))
.catch(err => console.error('❌ Booking API failed:', err));
```

## 📝 Summary

**Deployment Status**: ✅ DEPLOYED
- **Frontend**: https://weddingbazaarph.web.app (with new logging)
- **Backend**: https://weddingbazaar-web.onrender.com (existing logging)
- **Time**: Just now (check timestamp in logs)

**Next Step**: Test booking creation and report back the logs!

**Expected Outcome**: We will see **exactly where** the flow fails:
- Health check failure? → Fix health endpoint
- API timeout? → Optimize backend or increase timeout
- CORS error? → Fix CORS configuration
- Backend error? → Fix backend logic
- Email error? → Fix email configuration

**Goal**: Identify the **root cause** so we can apply the **specific fix** needed!
