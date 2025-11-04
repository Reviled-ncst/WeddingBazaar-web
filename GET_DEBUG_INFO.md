# 🔍 How to Get Debug Information for 403 Error

## The 403 error is still happening. Here's how to diagnose it:

### Step 1: Check Render Backend Logs (MOST IMPORTANT)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your service**: Click on `weddingbazaar-web`
3. **Click "Logs" tab** (on the left sidebar)
4. **Try the cancellation again** in your browser (so it creates new logs)
5. **Look for these log entries**:

```
🚫 [CANCEL-BOOKING] Processing direct cancellation...
🚫 [CANCEL-BOOKING] Booking ID: 128, User ID from request: ...
🔍 [CANCEL-BOOKING] Booking user_id: "...", Request userId: "..."
🔍 [CANCEL-BOOKING] Type comparison: ... vs ...
🔍 [CANCEL-BOOKING] String representation: "..." vs "..."
```

**If authorization fails, you'll see**:
```
❌ [CANCEL-BOOKING] Authorization failed!
   Booking user: "xxx" (type)
   Request user: "yyy" (type)
   As strings: "xxx" !== "yyy"
```

**If authorization succeeds, you'll see**:
```
✅ [CANCEL-BOOKING] Authorization passed: "xxx" === "yyy"
```

---

### Step 2: Get Your User ID from Browser

While logged in, open browser console (F12) and run:

```javascript
const token = localStorage.getItem('auth_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('=== YOUR USER INFO ===');
  console.log('User ID:', payload.userId);
  console.log('Email:', payload.email);
  console.log('Role:', payload.role);
  console.log('=====================');
} else {
  console.log('❌ No auth token found - you may not be logged in');
}
```

**Copy the User ID** you see here.

---

### Step 3: Check Network Tab for Error Response

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try canceling the booking again
4. Find the failed request: `POST .../api/bookings/128/cancel`
5. Click on it and go to **Response** tab
6. **Copy the entire error response** (it should have a `debug` object)

Example of what you should see:
```json
{
  "success": false,
  "error": "Unauthorized: You can only cancel your own bookings",
  "debug": {
    "bookingUserId": "...",
    "bookingUserIdType": "...",
    "requestUserId": "...",
    "requestUserIdType": "...",
    "bookingUserIdString": "...",
    "requestUserIdString": "...",
    "stringMatch": false
  }
}
```

---

### Step 4: Quick Database Check (Optional)

If you have access to Neon SQL console, run:

```sql
-- Check your booking's user_id
SELECT id, user_id, status, created_at 
FROM bookings 
WHERE id = '128';

-- Check if this user exists
SELECT id, email, full_name 
FROM users 
WHERE id = (SELECT user_id FROM bookings WHERE id = '128');
```

---

## 🎯 What to Share

Please provide any/all of these:

1. **Backend logs from Render** (the lines with [CANCEL-BOOKING])
2. **Your user ID** from browser console (Step 2)
3. **Error response** from Network tab (Step 3)

With this information, I can tell you **exactly** why the authorization is failing and provide a fix.

---

## 🚀 Alternative: Create Fresh Test Booking

**If you can't access Render logs**, try this workaround:

1. Log in to your account
2. Go to https://weddingbazaarph.web.app/individual/services
3. **Create a BRAND NEW booking** right now
4. **Immediately try to cancel it**

This should work because:
- The booking will definitely have YOUR user_id
- The request will use YOUR auth token
- The IDs will match

If this works, it confirms the old booking (ID 128) just has a different user_id.

---

## 💡 Most Likely Issue

Based on the repeated 403 errors, **booking 128 probably belongs to a different user account**. This could happen if:

- You created it while logged in as a different user
- It's test data with a fake user_id
- The database has stale/incorrect data

**Quick Fix**: Update the booking's user_id in the database:

```sql
-- Get your real user ID first
SELECT id FROM users WHERE email = 'your@email.com';

-- Update the booking
UPDATE bookings 
SET user_id = 'YOUR_ACTUAL_USER_ID'
WHERE id = '128';
```

Then try canceling again.

---

**Need Help?** Share the debug info above and I can provide an exact solution!
