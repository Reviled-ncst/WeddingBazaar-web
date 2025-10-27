# Vendor JWT Token Fix - Root Cause Found

## 🚨 CRITICAL ISSUE IDENTIFIED

### The Problem
**Vendor users don't have JWT tokens after Firebase login!**

### Root Cause Analysis
1. **Admin users**: 
   - Login via `/api/auth/login` (backend-only)
   - Receive JWT token from backend
   - Token stored in localStorage as `jwt_token`
   - ✅ Can make authenticated API calls

2. **Firebase users (couples/vendors)**:
   - Login via Firebase Auth
   - Sync user data with backend (no JWT returned)
   - ❌ NO JWT token stored
   - ❌ Cannot make JWT-authenticated API calls

3. **Subscription upgrade endpoint**:
   - Uses `authenticateToken` middleware
   - Requires JWT token in `Authorization: Bearer TOKEN` header
   - Returns 401 Unauthorized without JWT

### Code Evidence

**Backend Auth Middleware** (`backend-deploy/middleware/auth.cjs`):
```javascript
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // ...
}
```

**HybridAuthContext - Admin Login** (✅ Stores JWT):
```typescript
const loginBackendOnly = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('jwt_token', data.token); // ✅ JWT STORED
    localStorage.setItem('backend_user', JSON.stringify(backendUser));
  }
  
  return backendUser;
}
```

**HybridAuthContext - Firebase Login** (❌ No JWT):
```typescript
const login = async (email: string, password: string): Promise<User> => {
  const userCredential = await firebaseAuthService.signInWithEmailAndPassword(email, password);
  
  await syncWithBackend(fbUser); // ❌ Only syncs user data, NO JWT
  
  return syncedUser;
}

const syncWithBackend = async (fbUser: FirebaseAuthUser) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/profile?email=...`);
  const backendUser = await response.json();
  
  // ❌ NO JWT TOKEN IN RESPONSE
  localStorage.setItem('backend_user', JSON.stringify(mergedUser));
  localStorage.setItem('weddingbazaar_user_profile', JSON.stringify(mergedUser));
  
  setUser(mergedUser);
}
```

### Current Flow (BROKEN)
```
1. Vendor logs in via Firebase
2. syncWithBackend() fetches user profile
3. User data stored in localStorage
4. ❌ NO JWT TOKEN STORED
5. Vendor clicks "Upgrade Subscription"
6. Payment succeeds
7. Frontend tries to call /api/subscriptions/payment/upgrade
8. No JWT token in localStorage
9. 401 Unauthorized error
10. Upgrade fails
```

## 🔧 SOLUTION

### Option 1: Generate JWT During Firebase Sync (RECOMMENDED)
Modify the backend `/api/auth/profile` endpoint to return a JWT token along with user data.

**Pros**:
- Seamless integration with existing flow
- JWT generated automatically on login
- No extra API calls needed

**Implementation**:
1. Update `/api/auth/profile` endpoint to generate and return JWT
2. Modify `syncWithBackend()` to extract and store JWT token
3. Use JWT for all authenticated API calls

### Option 2: Exchange Firebase UID for JWT
Create a new endpoint `/api/auth/exchange-token` to convert Firebase UID to JWT.

**Pros**:
- Clean separation of concerns
- Explicit token exchange

**Cons**:
- Extra API call on every login
- More complex flow

### Option 3: Use Firebase ID Token
Modify backend auth middleware to accept both JWT and Firebase ID tokens.

**Pros**:
- Most "correct" architecturally
- Leverages Firebase Auth properly

**Cons**:
- Requires Firebase Admin SDK on backend
- Significant backend refactoring
- More complex authentication logic

## 🎯 RECOMMENDED IMPLEMENTATION

**We'll go with Option 1** - Generate JWT during sync for simplest fix.

### Backend Changes
**File**: `backend-deploy/routes/auth.cjs`

Modify the `/api/auth/profile` endpoint to return JWT:

```javascript
router.get('/profile', async (req, res) => {
  try {
    const email = req.query.email || req.headers['x-user-email'];
    
    // ... existing user lookup code ...
    
    // Generate JWT token for authenticated API calls
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'wedding-bazaar-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      user: { /* user data */ },
      token: token  // ✅ ADD JWT TOKEN TO RESPONSE
    });
  } catch (error) {
    // ... error handling ...
  }
});
```

### Frontend Changes
**File**: `src/shared/contexts/HybridAuthContext.tsx`

Modify `syncWithBackend()` to store JWT token:

```typescript
const syncWithBackend = async (fbUser: FirebaseAuthUser) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile?email=...`);
    const data = await response.json();
    
    // ✅ STORE JWT TOKEN IF PROVIDED
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('jwt_token', data.token); // Backward compat
      console.log('✅ JWT token stored for vendor:', data.user.email);
    }
    
    // ... existing user data storage ...
    
  } catch (error) {
    // ... error handling ...
  }
};
```

### File to Update
**File**: `src/shared/components/subscription/UpgradePrompt.tsx`

Token retrieval is already correct (checks both `auth_token` and `jwt_token`).

## 🚀 DEPLOYMENT PLAN

1. **Backend**: Update auth.cjs to return JWT in profile endpoint
2. **Backend**: Deploy to Render
3. **Frontend**: Update HybridAuthContext to store JWT from profile response
4. **Frontend**: Build and deploy to Firebase
5. **Test**: Login as vendor, verify JWT token in localStorage
6. **Test**: Upgrade subscription, verify successful API call

## 📋 TEST CHECKLIST

After deployment:
- [ ] Login as vendor via Firebase
- [ ] Check localStorage for `auth_token` and `jwt_token` keys
- [ ] Token should be a valid JWT string (eyJ...)
- [ ] Navigate to Add Service page
- [ ] Click "Upgrade Now" on limit reached prompt
- [ ] Complete payment successfully
- [ ] Check console logs - should see "✅ JWT token found"
- [ ] Check network tab - should see 200 OK from `/api/subscriptions/payment/upgrade`
- [ ] Verify subscription upgraded in database
- [ ] Verify vendor can now add more services

---

**Created**: 2024-12-XX  
**Status**: Root cause identified, solution ready to implement  
**Priority**: CRITICAL - Blocks all vendor subscriptions
