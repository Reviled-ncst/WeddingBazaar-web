# 🔐 Review Authentication Debug Guide

## Overview
This guide will help diagnose and fix the "Authentication failed" error when submitting reviews.

---

## Current Status

### ✅ Deployed
- **Backend**: Enhanced auth middleware with detailed logging
- **Deployment**: Auto-deploying to Render now (wait ~3-5 minutes)
- **Logs**: Enhanced debug output at every authentication step

### 🔍 What We're Testing
1. Token presence in frontend localStorage
2. Token format and validity
3. JWT decoding success
4. User lookup in database
5. Request attachment of user data

---

## Debug Steps

### Step 1: Check Frontend Token Storage

**Open browser console on https://weddingbazaarph.web.app/individual/bookings**

Run this in console:
```javascript
// Check all possible token keys
console.log('auth_token:', localStorage.getItem('auth_token'));
console.log('jwt_token:', localStorage.getItem('jwt_token'));
console.log('weddingBazaar_token:', localStorage.getItem('weddingBazaar_token'));
console.log('token:', localStorage.getItem('token'));
console.log('authToken:', localStorage.getItem('authToken'));

// Check user data
console.log('backend_user:', localStorage.getItem('backend_user'));
console.log('weddingbazaar_user_profile:', localStorage.getItem('weddingbazaar_user_profile'));
```

**Expected Result**:
- At least ONE token should exist (auth_token or jwt_token)
- Token should be a long string (JWT format: xxx.yyy.zzz)
- backend_user should have user data including `id`, `email`, `role`

---

### Step 2: Decode the JWT Token

**In browser console:**
```javascript
// Get the token
const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt_token');

// Decode it (without verification - just to see contents)
const base64Url = token.split('.')[1];
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
}).join(''));

console.log('JWT Payload:', JSON.parse(jsonPayload));
```

**Expected Payload**:
```json
{
  "userId": "uuid-here",
  "email": "user@example.com",
  "userType": "couple",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

### Step 3: Test Review Submission

1. **Navigate to**: https://weddingbazaarph.web.app/individual/bookings
2. **Find a completed booking** with "Completed ✓" badge
3. **Click** "Rate & Review" button
4. **Fill out review**:
   - Rating: 5 stars
   - Comment: "Test review for debugging"
5. **Open browser console** (F12)
6. **Click** "Submit Review"
7. **Watch console output**

**Expected Console Output**:
```
📝 [ReviewService] Submitting review: {...}
🔑 [ReviewService] Using authentication token (length: 200+)
✅ [ReviewService] Review submitted successfully: review-id
```

**If Error Occurs**:
```
❌ [ReviewService] Error submitting review: Authentication failed
```

---

### Step 4: Check Backend Logs

**Go to Render Dashboard**: https://dashboard.render.com

1. **Click** on `weddingbazaar-web` service
2. **Click** "Logs" tab
3. **Submit review** from frontend
4. **Watch logs** for authentication flow

**Expected Log Flow**:
```
🔐 [Auth Middleware] Authenticating request
🔐 [Auth Middleware] Authorization header: Present
🔐 [Auth Middleware] Token extracted: Yes (length: 250)
🔐 [Auth Middleware] Verifying token with JWT_SECRET...
✅ [Auth Middleware] Token decoded successfully: { userId: 'xxx', email: 'xxx', userType: 'couple' }
🔍 [Auth Middleware] Fetching user from database with ID: xxx
✅ [Auth Middleware] User found in database: { id: 'xxx', email: 'xxx', user_type: 'couple' }
✅ [Auth Middleware] Request authenticated successfully
📝 [REVIEWS] POST /api/reviews called
📦 [REVIEWS] Request body: {...}
👤 [REVIEWS] Authenticated user: {...}
```

**If Error in Logs**:
```
❌ [Auth Middleware] No token provided
❌ [Auth Middleware] Token verification failed: jwt malformed
❌ [Auth Middleware] User not found in database for ID: xxx
```

---

## Common Issues & Fixes

### Issue 1: No Token in localStorage

**Symptom**: All token checks return `null`

**Fix**:
1. Log out and log back in
2. Check network tab for login response
3. Verify login response includes `token` field
4. Check HybridAuthContext stores token on login

**Code to check**:
```typescript
// In HybridAuthContext.tsx, after login
localStorage.setItem('auth_token', backendUser.token);
localStorage.setItem('jwt_token', backendUser.token); 
```

---

### Issue 2: Token Expired

**Symptom**: `TokenExpiredError` in backend logs

**Fix**:
1. Log out and log back in to get fresh token
2. Tokens expire after 24 hours

---

### Issue 3: Invalid Token Format

**Symptom**: `JsonWebTokenError: jwt malformed`

**Possible Causes**:
- Token is not in JWT format (should have 3 parts: xxx.yyy.zzz)
- Token has extra characters or whitespace
- Token is from wrong source (Firebase token instead of backend JWT)

**Fix**:
```typescript
// Check token format
const token = localStorage.getItem('auth_token');
console.log('Token parts:', token.split('.').length); // Should be 3
console.log('Token:', token); // Should not have spaces or extra chars
```

---

### Issue 4: Wrong JWT Secret

**Symptom**: Token decodes but user lookup fails

**Fix**:
1. Check Render environment variables
2. Verify `JWT_SECRET` matches between frontend and backend
3. Check that login and auth middleware use same secret

**Render Environment Check**:
- Go to Render dashboard → weddingbazaar-web → Environment
- Verify `JWT_SECRET` is set
- Should match `.env` file in development

---

### Issue 5: User Not in Database

**Symptom**: `User not found` error after successful token decode

**Possible Causes**:
- User was deleted from database
- User ID in token doesn't match database
- Database query error

**Fix**:
```sql
-- Check if user exists
SELECT id, email, user_type 
FROM users 
WHERE email = 'your-email@example.com';

-- Check token's userId matches
SELECT id, email, user_type 
FROM users 
WHERE id = 'uuid-from-token';
```

---

## Manual Testing Checklist

### Before Testing
- [ ] Backend deployed to Render (check deployment status)
- [ ] Frontend deployed to Firebase
- [ ] Logged in as couple user
- [ ] Have at least one completed booking
- [ ] Browser console open (F12)
- [ ] Render logs open

### During Testing
- [ ] Check localStorage for tokens
- [ ] Decode JWT payload
- [ ] Submit test review
- [ ] Monitor frontend console
- [ ] Monitor backend logs
- [ ] Verify database insert (if successful)

### After Testing
- [ ] Review submitted successfully
- [ ] Booking marked as reviewed
- [ ] "Rate & Review" button hidden
- [ ] Review appears in database

---

## Database Verification

### Check if Review Was Created

```sql
-- Check reviews table
SELECT r.id, r.rating, r.comment, r.created_at,
       b.booking_reference, u.email as reviewer_email
FROM reviews r
LEFT JOIN bookings b ON r.booking_id = b.id
LEFT JOIN users u ON r.user_id = u.id
ORDER BY r.created_at DESC
LIMIT 5;
```

### Check Reviews Table Structure

```sql
-- Verify table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'reviews';

-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;
```

---

## Next Steps After Debug

### If Authentication Works
1. Remove excessive debug logging (optional)
2. Test with multiple users
3. Test image upload functionality
4. Add review display on vendor profiles

### If Authentication Fails
1. Share console output
2. Share backend logs
3. Share localStorage contents
4. I'll provide targeted fix

---

## Contact Points

### Frontend Files
- `src/shared/services/reviewService.ts` - API calls, token handling
- `src/pages/users/individual/bookings/IndividualBookings.tsx` - UI integration
- `src/pages/users/individual/bookings/components/RatingModal.tsx` - Review modal

### Backend Files
- `backend-deploy/routes/reviews.cjs` - Review endpoints
- `backend-deploy/middleware/auth.cjs` - JWT authentication
- `backend-deploy/routes/auth.cjs` - Login/token generation

### Environment Variables
- `VITE_API_URL` - Frontend (Firebase config)
- `JWT_SECRET` - Backend (Render config)
- `DATABASE_URL` - Backend (Neon PostgreSQL)

---

## Expected Timeline

1. **Now**: Render auto-deployment in progress (~3-5 min)
2. **After deployment**: Enhanced logs available
3. **Testing**: Follow steps above to identify issue
4. **Fix**: Based on debug output, apply targeted fix
5. **Verification**: Confirm review submission works

---

## Success Criteria

✅ Review submits without errors  
✅ Backend logs show successful authentication  
✅ Review appears in database  
✅ "Rate & Review" button disappears  
✅ Booking marked as reviewed  

---

**Last Updated**: {{ current_timestamp }}  
**Deployment Status**: Enhanced auth middleware deploying to Render  
**Next Action**: Wait for deployment, then test review submission  
