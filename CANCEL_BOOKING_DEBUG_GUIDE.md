# Cancel Booking - Detailed Debugging Guide

## 🔍 Current Status
**Date**: December 2024  
**Issue**: 403 Forbidden error when attempting to cancel bookings  
**Root Cause**: User ID mismatch between frontend and database

## 🎯 What We Just Fixed

### Enhanced Authorization Logic
We've updated the backend authorization to:
1. **Convert both IDs to strings** before comparison
2. **Log detailed debugging information** for every cancellation attempt
3. **Return comprehensive error messages** with type information

### Files Updated
- `backend-deploy/routes/bookings.cjs` - Both `/cancel` and `/request-cancellation` endpoints

## 📊 How to Debug the Issue

### Step 1: Reproduce the Error
1. Go to https://weddingbazaarph.web.app/individual/bookings
2. Log in with your test account
3. Find a booking in "Awaiting Quote" or "Awaiting Confirmation" status
4. Click the "Cancel Booking" or "Request Cancellation" button
5. Confirm the cancellation

### Step 2: Check Backend Logs in Render
1. Go to https://dashboard.render.com
2. Select your `weddingbazaar-web` service
3. Click on the "Logs" tab
4. Look for log entries with these prefixes:
   - `🚫 [CANCEL-BOOKING]` - Direct cancellation logs
   - `📝 [REQUEST-CANCELLATION]` - Cancellation request logs

### Step 3: Analyze the Debug Output
Look for these specific log lines:

```
🔍 [CANCEL-BOOKING] Booking user_id: "...", Request userId: "..."
🔍 [CANCEL-BOOKING] Type comparison: string vs string (or number)
🔍 [CANCEL-BOOKING] String representation: "..." vs "..."
🔍 [CANCEL-BOOKING] String equality: true/false
```

### Step 4: Check the Error Response
If authorization fails, the API will return:
```json
{
  "success": false,
  "error": "Unauthorized: You can only cancel your own bookings",
  "debug": {
    "bookingUserId": "actual_booking_user_id",
    "bookingUserIdType": "string" or "number",
    "requestUserId": "user_id_from_request",
    "requestUserIdType": "string",
    "bookingUserIdString": "...",
    "requestUserIdString": "...",
    "stringMatch": false
  }
}
```

## 🔧 Possible Causes & Solutions

### Cause 1: User IDs Don't Match (Most Likely)
**Symptoms**: Debug output shows different user IDs
**Reason**: The booking was created by a different user account
**Solution**: Log in with the correct account that created the booking

### Cause 2: Database Contains Wrong User ID
**Symptoms**: Booking shows user_id that doesn't match any real user
**Reason**: Test data might have incorrect user IDs
**Solution**: Update the booking's user_id in the database:
```sql
-- Find your actual user ID
SELECT id, email, full_name FROM users WHERE email = 'your@email.com';

-- Update the booking
UPDATE bookings 
SET user_id = 'your_actual_user_id' 
WHERE id = 'booking_id_here';
```

### Cause 3: UUID vs String Format Mismatch
**Symptoms**: One ID looks like `123` and the other like `550e8400-e29b-41d4-a716-446655440000`
**Reason**: Database schema change or migration issue
**Solution**: Verify your database schema:
```sql
-- Check the user_id column type in bookings table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'user_id';

-- Check the id column type in users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';
```

### Cause 4: Frontend Not Sending User ID
**Symptoms**: Backend logs show `Request userId: "undefined"` or `Request userId: ""`
**Reason**: Auth context not properly initialized
**Solution**: 
1. Check browser console for auth errors
2. Verify localStorage contains `auth_token`
3. Clear cache and log in again

## 🧪 Testing Scenarios

### Scenario 1: Test with Valid Booking
1. Create a new booking while logged in
2. Immediately try to cancel it
3. Should succeed if status is "request" or "quote_requested"

### Scenario 2: Test with Confirmed Booking
1. Have admin/vendor change a booking status to "confirmed"
2. Try to cancel it
3. Should show "Request Cancellation" option
4. Should require approval (status changes to "pending_cancellation")

### Scenario 3: Test Authorization
1. Create a booking while logged in as User A
2. Log out and log in as User B
3. Try to cancel User A's booking
4. Should get 403 Forbidden error

## 📋 Checklist for Troubleshooting

- [ ] Backend deployed successfully on Render
- [ ] Frontend deployed successfully on Firebase
- [ ] User is logged in (check browser console for `auth_token`)
- [ ] Booking exists in database
- [ ] Booking status is valid for cancellation
- [ ] User ID in request matches booking user_id
- [ ] Backend logs show detailed debug information
- [ ] Error response includes `debug` object

## 🚀 Next Steps

### If Authorization Still Fails:
1. **Share the debug output** from the Render logs
2. **Share the error response** from browser DevTools (Network tab)
3. **Verify your user ID**:
   ```javascript
   // In browser console (while logged in)
   const token = localStorage.getItem('auth_token');
   console.log('Token:', token);
   
   // Check the decoded user info
   const user = JSON.parse(atob(token.split('.')[1]));
   console.log('User ID:', user.userId);
   ```

### If It Works:
1. Test all booking statuses (request, confirmed, deposit_paid, etc.)
2. Verify cancellation emails are sent (if enabled)
3. Test both direct cancellation and cancellation requests
4. Verify UI updates correctly after cancellation

## 📞 Support Information

**Backend URL**: https://weddingbazaar-web.onrender.com  
**Frontend URL**: https://weddingbazaarph.web.app  
**GitHub Repo**: https://github.com/Reviled-ncst/WeddingBazaar-web

**Key Endpoints**:
- `POST /api/bookings/:bookingId/cancel` - Direct cancellation
- `POST /api/bookings/:bookingId/request-cancellation` - Request cancellation
- `GET /api/bookings/:bookingId` - Get booking details

## 🐛 Common Issues

### Issue: "Network Error"
**Solution**: Check if backend is online at https://weddingbazaar-web.onrender.com/api/health

### Issue: "Booking not found"
**Solution**: Verify booking ID is correct and booking exists in database

### Issue: "Cannot directly cancel"
**Solution**: Booking status requires approval - use "Request Cancellation" instead

### Issue: Button doesn't appear
**Solution**: 
1. Check booking status matches allowed statuses
2. Refresh the bookings page
3. Clear browser cache
4. Check browser console for errors

---

**Last Updated**: December 2024  
**Status**: Enhanced debugging deployed, awaiting test results
