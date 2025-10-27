# Subscription Upgrade JWT Authentication Fix

## 🎯 Problem Identified

The subscription upgrade flow was failing with **401 Unauthorized** after successful PayMongo payment because:

1. **Frontend was using Firebase Auth tokens** (`getIdToken()`)
2. **Backend expects Wedding Bazaar JWT tokens** (generated during login)
3. The backend's `authenticateToken` middleware verifies JWT tokens signed with `JWT_SECRET`, not Firebase tokens

## ✅ Solution Implemented

### Changed Token Acquisition in `UpgradePrompt.tsx`

**BEFORE (Incorrect):**
```typescript
// Import Firebase auth dynamically
const { auth } = await import('../../../config/firebase');
const currentUser = auth?.currentUser;

if (!currentUser) {
  throw new Error('Not logged in. Please log in again.');
}

let token: string;
token = await currentUser.getIdToken(); // ❌ Firebase token
```

**AFTER (Correct):**
```typescript
// Get the backend JWT token from localStorage (set during login)
let token = localStorage.getItem('auth_token'); // ✅ Backend JWT token
if (!token) {
  // Fallback: try 'token' key (used in some parts of the app)
  token = localStorage.getItem('token');
}

if (!token) {
  throw new Error('Authentication token not found. Please log in again.');
}
```

## 🔑 How Authentication Works in Wedding Bazaar

### Two-Layer Authentication System

1. **Firebase Auth** (Frontend identity)
   - Used for user authentication UI
   - Provides user session management
   - Token: `firebase.auth().currentUser.getIdToken()`

2. **Backend JWT** (API authentication)
   - Generated during login in `AuthContext.tsx`
   - Stored in `localStorage` as `'auth_token'`
   - Used for all backend API calls
   - Token verified by `backend-deploy/middleware/auth.cjs`

### Token Storage Locations

```typescript
// During login (AuthContext.tsx)
localStorage.setItem('auth_token', data.token);

// Used throughout the app
const token = localStorage.getItem('auth_token');
```

### Consistent Usage Pattern

All other API services in the app use the same pattern:
- `src/services/api/CentralizedBookingAPI.ts` - `localStorage.getItem('auth_token')`
- `src/services/api/messagingApiService.ts` - `localStorage.getItem('auth_token')`
- `src/services/api/bookingApiService.ts` - `localStorage.getItem('auth_token')`

## 📝 Changes Made

### File: `src/shared/components/subscription/UpgradePrompt.tsx`

**Line ~390-405:**
- Removed Firebase Auth token acquisition
- Added backend JWT token from localStorage
- Simplified error handling
- Maintained detailed logging

## 🚀 Deployment Status

### ✅ Frontend Deployed
- **Platform:** Firebase Hosting
- **URL:** https://weddingbazaarph.web.app
- **Status:** Live with JWT fix
- **Build:** Successful (v2024-01-XX)

### ✅ Backend Ready
- **Platform:** Render.com
- **URL:** https://weddingbazaar-web.onrender.com
- **Endpoint:** `/api/subscriptions/payment/upgrade`
- **Authentication:** JWT middleware active

## 🧪 Testing Instructions

### Prerequisites
1. Be logged in as a vendor
2. Have a free/basic subscription
3. Have payment test cards ready

### Test Steps

1. **Navigate to Vendor Services**
   - Go to https://weddingbazaarph.web.app/vendor/services
   - Verify you see your current subscription plan

2. **Trigger Upgrade Prompt**
   - Click "Add Service" button
   - If you've hit the service limit, upgrade prompt appears
   - Or manually trigger by trying to add more services

3. **Select Plan & Pay**
   - Choose a premium plan (e.g., "Professional" - ₱999)
   - Click "Upgrade Now"
   - PayMongo modal opens

4. **Complete Payment**
   - Use test card: `4343434343434345`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - Click "Pay Now"

5. **Verify Success Flow**
   - Open browser DevTools > Console
   - Watch for these log messages:
     ```
     ✅ Step 1: Payment successful
     ✅ Step 2: Payment modal closed
     ✅ Step 3: Getting backend JWT token from localStorage...
     ✅ Step 4: Backend JWT token validated (length: XXX)
     📦 Step 5: Building upgrade payload...
     📤 Step 6: Making API call to upgrade endpoint
     ✅ Step 6: Fetch completed without throwing
     📥 Step 7: Analyzing response...
     📥 Response status: 200
     📥 Response OK: true
     ✅ Step 8: Successfully upgraded vendor to the [Plan] plan!
     ```

6. **Verify UI Updates**
   - After Step 8, the upgrade prompt should close
   - You should see a success message
   - Your service list should reflect the new subscription
   - You should be able to add more services

### Expected Console Logs

**Successful Upgrade:**
```
✅ Step 1: Payment successful from PayMongo
✅ Step 2: Payment modal closed successfully
✅ Step 3: Getting backend JWT token from localStorage...
✅ Step 4: Backend JWT token validated (length: 200)
📦 Step 5: Building upgrade payload...
📦 Step 5: Payload built: { vendor_id: "xxx", new_plan: "professional", ... }
📤 Step 6: Making API call to upgrade endpoint
🌐 Backend URL: https://weddingbazaar-web.onrender.com
🌐 Full API URL: https://weddingbazaar-web.onrender.com/api/subscriptions/payment/upgrade
🔧 Method: PUT
🔑 Authorization header set: true
✅ Step 6: Fetch completed without throwing
📥 Step 7: Analyzing response...
📥 Response status: 200
📥 Response OK: true
✅ Step 8: Successfully upgraded vendor XXX to the Professional plan!
🎉 Subscription upgraded successfully!
```

### Common Errors (Now Fixed)

**401 Unauthorized (FIXED):**
- **Before:** Frontend sent Firebase token
- **After:** Frontend sends backend JWT token
- **Fix:** Changed token source from Firebase to localStorage

**No Token (User Not Logged In):**
```
❌ CRITICAL: No backend JWT token found in localStorage!
Error: Authentication token not found. Please log in again.
```
- **Solution:** User needs to log in again

## 🔍 Debugging

### Check Token in Browser Console
```javascript
// Check if backend JWT token exists
console.log('Backend JWT:', localStorage.getItem('auth_token'));

// Check token length
const token = localStorage.getItem('auth_token');
console.log('Token length:', token?.length);
console.log('Token first 20 chars:', token?.substring(0, 20));
```

### Verify Backend Endpoint
```bash
# PowerShell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
    "Content-Type" = "application/json"
}

$body = @{
    vendor_id = "YOUR_VENDOR_ID"
    new_plan = "professional"
    payment_method_details = @{
        payment_method = "paymongo"
        amount = 99900
        currency = "PHP"
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/subscriptions/payment/upgrade" -Method PUT -Headers $headers -Body $body
```

## 📊 Technical Details

### Backend JWT Middleware

**File:** `backend-deploy/middleware/auth.cjs`

```javascript
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // Verify token with JWT_SECRET
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || 'wedding-bazaar-secret-key'
  );

  // Fetch user from database
  const users = await sql`
    SELECT id, email, user_type FROM users 
    WHERE id = ${decoded.userId}
  `;

  req.user = users[0];
  next();
};
```

### Token Format Comparison

**Firebase Auth Token (What we used BEFORE):**
- Format: Long JWT signed by Google
- Contains: user UID, email, Firebase project info
- Verified by: Firebase Admin SDK
- ❌ Not compatible with Wedding Bazaar backend

**Wedding Bazaar JWT (What we use NOW):**
- Format: JWT signed with `JWT_SECRET`
- Contains: `userId`, `email`, `user_type`
- Verified by: `jsonwebtoken` library in backend
- ✅ Compatible with all backend endpoints

## 🎉 Success Criteria

After this fix, the subscription upgrade should:

1. ✅ Accept payment via PayMongo
2. ✅ Send correct JWT token to backend
3. ✅ Receive 200 OK response (not 401)
4. ✅ Parse JSON response successfully
5. ✅ Reach Step 8 (success handler)
6. ✅ Update vendor subscription in database
7. ✅ Close upgrade prompt
8. ✅ Refresh UI to show new subscription
9. ✅ Allow vendor to add more services

## 📚 Related Files

### Frontend
- `src/shared/components/subscription/UpgradePrompt.tsx` - Upgrade UI + payment handler
- `src/shared/contexts/AuthContext.tsx` - JWT token generation during login
- `src/shared/contexts/HybridAuthContext.tsx` - User session management
- `src/services/api/CentralizedBookingAPI.ts` - Example JWT usage

### Backend
- `backend-deploy/middleware/auth.cjs` - JWT verification
- `backend-deploy/routes/subscriptions/payment.cjs` - Upgrade endpoint
- `backend-deploy/routes/subscriptions/index.cjs` - Subscription routes

## 🚨 Important Notes

1. **Always use `localStorage.getItem('auth_token')` for API calls**
2. **Never use Firebase `getIdToken()` for Wedding Bazaar backend calls**
3. **Token is set during login in `AuthContext.tsx`**
4. **If token is missing, user must log in again**

## 🎯 Next Steps

1. Test the complete flow in production
2. Verify Step 8 logs appear
3. Confirm UI updates after upgrade
4. Document any remaining issues
5. Finalize user acceptance testing
