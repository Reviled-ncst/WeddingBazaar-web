# 🧪 BOOKING MODAL FLOW TEST GUIDE

**Created**: December 2024  
**Purpose**: Test the complete booking request flow through BookingRequestModal  
**Status**: Backend deployed, ready for testing

---

## 📋 TEST CHECKLIST

### ✅ Pre-Test Verification

1. **Backend Status**: Render deployment complete
   - URL: https://weddingbazaar-web.onrender.com
   - Check health: https://weddingbazaar-web.onrender.com/api/health
   
2. **Login Status**: User must be logged in
   - Open browser DevTools → Application tab → Local Storage
   - Verify `authToken` exists
   
3. **Browser Console**: Open DevTools (F12) → Console tab
   - Clear console before test
   - Watch for booking logs

---

## 🎯 TEST STEPS

### Step 1: Navigate to Services Page
```
URL: https://weddingbazaarph.web.app/individual/services
```

### Step 2: Click "Book Now" on Any Service
- Choose any service card
- Click "Book Now" button
- **BookingRequestModal should open**

### Step 3: Fill the Booking Form

**Required Fields**:
- **Event Date**: Select a future date (use date picker)
- **Event Location**: e.g., "Manila Hotel, Philippines"
- **Guest Count**: e.g., "150"
- **Budget Range**: Select from dropdown (e.g., "₱50,001 - ₱100,000")
- **Contact Person**: e.g., "Juan Dela Cruz"
- **Contact Phone**: e.g., "+63 917 123 4567"

**Optional Fields**:
- Event Time
- Special Requests
- Contact Email
- Preferred Contact Method

### Step 4: Submit the Form
- Click **"Submit Booking Request"** button
- **Watch for these indicators**:

---

## 🔍 EXPECTED BEHAVIORS

### ✅ SUCCESS INDICATORS

#### 1. **Frontend Console Logs** (Check DevTools Console)
```
🚀 [BOOKING API] Starting booking request { userId, serviceId, vendorId }
🏥 [BOOKING API] Health check result: { isHealthy: true }
📡 [BOOKING API] Sending POST /api/bookings/request { payload }
✅ [BOOKING API] Response received: { success: true }
```

#### 2. **Success Modal Appears**
- Large modal with gradient background
- Title: "✅ Booking Request Sent Successfully!"
- Shows booking details (date, service, vendor)
- "View My Bookings" and "Close" buttons

#### 3. **Toast Notification** (Top-Right Corner)
- Green gradient notification
- Message: "Booking Request Sent! ✅"
- Auto-disappears after 10 seconds

#### 4. **Browser Notification** (If Enabled)
- Title: "✅ Booking Request Sent!"
- Body: Booking details

#### 5. **Backend Logs** (Check Render Logs)
```
POST /api/bookings/request 200
📧 Sending email notification to vendor...
✅ Email sent successfully to [vendor email]
```

#### 6. **Email Sent to Vendor**
- Vendor receives email: "New Booking Request"
- Contains booking details
- May take 1-2 minutes to arrive

---

## ❌ ERROR INDICATORS

### If These Appear, Something Failed:

#### 1. **Frontend Error**
```
❌ [OptimizedBooking] API call failed: [error message]
```
- Red error message appears in modal
- "Failed to submit booking request. Please try again."

#### 2. **Backend Error (Check Render Logs)**
```
POST /api/bookings/request 400/500
Error: [error details]
```

#### 3. **No Email Sent**
- Backend log shows: "❌ Failed to send email"
- Check Render logs for email error

---

## 🐛 DEBUGGING STEPS

### If Success Modal Does Not Appear:

1. **Check Console for Errors**
   ```javascript
   // Look for these error patterns:
   - "Request timeout"
   - "Health check failed"
   - "Invalid response from server"
   - "Database query failed"
   ```

2. **Check Network Tab** (DevTools → Network)
   - Look for `POST /api/bookings/request`
   - Check status code (should be 200)
   - Click request → Preview tab → Check response

3. **Verify JWT Token**
   ```javascript
   // Run in console:
   const token = localStorage.getItem('authToken');
   console.log('Token exists:', !!token);
   
   // Decode token
   if (token) {
     const decoded = JSON.parse(atob(token.split('.')[1]));
     console.log('User ID:', decoded.userId);
     console.log('Token expires:', new Date(decoded.exp * 1000));
   }
   ```

4. **Check Backend Health**
   ```javascript
   // Run in console:
   fetch('https://weddingbazaar-web.onrender.com/api/health')
     .then(r => r.json())
     .then(console.log)
     .catch(console.error);
   ```

---

## 📊 WHAT TO REPORT

### ✅ If Test SUCCEEDS:
Report these details:
```
✅ SUCCESS REPORT:
- Success modal appeared: Yes
- Toast notification: Yes
- Console logs: [paste relevant logs]
- Backend status: 200
- Email sent: [Check Gmail inbox]
- Booking visible in "My Bookings": [Yes/No]
```

### ❌ If Test FAILS:
Report these details:
```
❌ FAILURE REPORT:
- Error message shown: "[exact message]"
- Console errors: [paste all red errors]
- Network request status: [200/400/500]
- Backend response: [paste from Network tab]
- Render logs: [paste relevant logs]
```

---

## 🔬 ADVANCED DEBUGGING

### Test Direct API Call (If Modal Fails)

1. **Get Valid IDs**:
   ```javascript
   // Run in console:
   const token = localStorage.getItem('authToken');
   const decoded = JSON.parse(atob(token.split('.')[1]));
   console.log('User ID:', decoded.userId);
   ```

2. **Test Booking Creation**:
   ```javascript
   const token = localStorage.getItem('authToken');
   const bookingData = {
     vendor_id: 'test-vendor-01',
     service_id: 'test-service-01',
     service_type: 'Photography',
     service_name: 'Wedding Photography',
     event_date: '2025-06-15',
     event_location: 'Manila Hotel',
     guest_count: 150,
     budget_range: '₱50,001 - ₱100,000',
     contact_person: 'Test User',
     contact_phone: '+63 917 123 4567',
     special_requests: 'Test booking from console'
   };

   fetch('https://weddingbazaar-web.onrender.com/api/bookings/request', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify(bookingData)
   })
   .then(r => r.json())
   .then(result => {
     console.log('✅ Booking created:', result);
     if (result.success) {
       alert('✅ Booking created successfully! Check console for details.');
     } else {
       alert('❌ Booking failed: ' + result.message);
     }
   })
   .catch(err => {
     console.error('❌ Error:', err);
     alert('❌ Network error: ' + err.message);
   });
   ```

---

## 📧 EMAIL VERIFICATION

### Check if Email Was Sent

1. **Ask vendor to check their email**:
   - Subject: "New Booking Request - [Service Name]"
   - From: weddingbazaarph@gmail.com

2. **Check Render Logs**:
   ```
   Navigate to: Render Dashboard → weddingbazaar-web → Logs
   Search for: "📧 Sending email notification"
   Look for: "✅ Email sent successfully"
   ```

3. **If Email Failed**:
   - Check Gmail credentials in Render environment variables
   - Verify `EMAIL_USER` and `EMAIL_PASS` are set
   - Check for rate limits (Gmail allows 500 emails/day)

---

## 🎉 SUCCESS CRITERIA

**Test is considered SUCCESSFUL if ALL of these happen:**

1. ✅ Booking form submits without errors
2. ✅ Success modal appears immediately
3. ✅ Toast notification shows in top-right
4. ✅ Console shows "✅ [BOOKING API] Response received"
5. ✅ Backend returns 200 status code
6. ✅ Render logs show "✅ Email sent successfully"
7. ✅ Vendor receives email notification
8. ✅ Booking appears in "My Bookings" page

**If ALL criteria met:** 🎉 **BOOKING FLOW IS WORKING!**

---

## 🚀 NEXT STEPS AFTER SUCCESS

1. **Test Multiple Bookings**: Create 2-3 more bookings
2. **Test Different Services**: Try different service types
3. **Test Edge Cases**:
   - Past dates (should show error)
   - Missing required fields (should show validation)
   - Very long special requests (should truncate)
4. **Verify Email Content**: Check if email has correct details
5. **Check "My Bookings" Page**: Verify bookings appear correctly

---

## 📝 TESTING NOTES

**Date**: _____________  
**Tester**: _____________  
**Browser**: _____________  
**Test Result**: ☐ PASS  ☐ FAIL  

**Notes**:
```
[Write any observations, errors, or unexpected behaviors here]
```

---

## 🆘 NEED HELP?

**If you encounter issues:**
1. Take screenshots of errors
2. Copy console logs
3. Copy Network tab responses
4. Paste everything in chat
5. I'll diagnose and fix immediately!

---

**End of Test Guide** 🎯
