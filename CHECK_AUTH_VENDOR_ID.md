# 🔍 Auth Context Vendor ID Diagnostic

**Date**: November 5, 2025  
**Issue**: Vendor services/bookings not showing  
**Root Cause**: Need to verify auth context has correct vendorId

---

## The Real Problem

You're absolutely right! The vendor ID should come from **authentication/login**, not manually set in localStorage.

### What SHOULD Happen:

```
Login → Backend returns vendorId → Auth context stores it → Vendor pages use it
```

### What's Currently Happening:

```
Login → Backend returns vendorId ✅
Auth context stores it ✅
Vendor pages use FALLBACK function ❌ (might be using wrong ID)
```

---

## Quick Diagnostic (30 seconds)

### Step 1: Check What Backend Returned

Open browser console (F12) on vendor dashboard and run:

```javascript
// Check what's stored from backend login
const storedUser = JSON.parse(localStorage.getItem('backend_user') || '{}');
console.log('📋 Backend returned vendorId:', storedUser.vendorId);
console.log('📋 Full user object:', storedUser);
```

### Step 2: Check What Auth Context Has

```javascript
// Check React auth context (in browser console)
// Note: This only works if auth context is exposed
console.log('🔐 Current user from localStorage:', 
  JSON.parse(localStorage.getItem('backend_user') || '{}')
);
```

### Step 3: Compare with Database

Run this in **Neon SQL Editor**:

```sql
-- Find your vendor ID by email
SELECT 
  u.id as user_id,
  u.email,
  u.user_type,
  v.id as vendor_id,
  v.business_name
FROM users u
LEFT JOIN vendors v ON v.user_id = u.id
WHERE u.email = 'your-email@example.com';  -- ⬅️ Replace with your email
```

---

## Expected Results

After login, you should see:

```javascript
{
  "id": "2-2025-001",          // User ID
  "email": "vendor@example.com",
  "role": "vendor",
  "vendorId": "VEN-00001",     // ⬅️ THIS IS THE KEY!
  "businessName": "Perfect Weddings Co."
}
```

---

## If vendorId is Missing or Wrong

### Option A: Re-login (Simplest)

1. Logout completely
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again
4. Check if vendorId appears

### Option B: Backend Check (If re-login doesn't work)

The backend login endpoint DOES return vendorId:

**File**: `backend-deploy/routes/auth.cjs` (Line 109)

```javascript
vendorId: vendorId, // ✅ FIX: Return actual vendor ID (VEN-XXXXX)
```

But we need to verify it's finding YOUR vendor record:

```sql
-- Check if vendor record exists
SELECT 
  v.id as vendor_id,
  v.user_id,
  v.business_name
FROM vendors v
JOIN users u ON v.user_id = u.id
WHERE u.email = 'your-email@example.com';  -- ⬅️ Your email
```

If this returns empty, that's your problem - vendor record doesn't exist!

---

## Likely Issue: Vendor Record Missing

If you registered as a vendor but don't have a vendor record:

### Quick Fix SQL (Run in Neon SQL Editor):

```sql
-- First, get your user_id
SELECT id, email, user_type FROM users WHERE email = 'your-email@example.com';

-- Then create vendor record (replace values)
INSERT INTO vendors (
  id,
  user_id,
  business_name,
  business_type,
  email,
  created_at,
  updated_at
) VALUES (
  'VEN-00999',                    -- ⬅️ Unique vendor ID
  '2-2025-XXX',                   -- ⬅️ Your user_id from above
  'Your Business Name',           -- ⬅️ Your business name
  'Wedding Planning',             -- ⬅️ Your category
  'your-email@example.com',       -- ⬅️ Your email
  NOW(),
  NOW()
);
```

After running this:
1. Logout
2. Login again
3. Backend will now return the vendorId
4. Services and bookings should appear

---

## Auto-Fix Script (Future Enhancement)

We should add this to the registration flow to auto-create vendor records.

**Backend file to update**: `backend-deploy/routes/auth.cjs` (Register endpoint)

Add after user creation:

```javascript
// If registering as vendor, create vendor record
if (user_type === 'vendor') {
  const vendorId = `VEN-${String(userId).padStart(5, '0')}`;
  await sql`
    INSERT INTO vendors (id, user_id, business_name, business_type, email)
    VALUES (${vendorId}, ${newUser.id}, ${business_name}, ${business_type}, ${email})
  `;
}
```

---

## Summary

✅ **Backend DOES return vendorId** (auth.cjs line 109)  
✅ **Auth context DOES store vendorId** (HybridAuthContext.tsx line 847)  
❓ **But is YOUR vendor record in the database?**

**Run the diagnostic SQL above to check!**

---

## Next Steps

1. Run diagnostic queries above
2. Check if vendor record exists
3. If missing, run the INSERT query
4. Re-login
5. Verify vendorId appears in localStorage
6. Services/bookings should now load

**No frontend changes needed - this is a data issue, not a code issue!** 🎯
