# 🔍 VENDOR SERVICES DEBUG GUIDE - Why No Services?

**Issue:** Services not showing in VendorServices page  
**Date:** November 5, 2025  
**Status:** 🔍 DEBUGGING

---

## 🎯 The Problem

You're logged in as a vendor, but when you go to `/vendor/services`, no services appear even though they exist in the database.

---

## 🔍 Root Cause Analysis

### The Issue Chain:

```
1. VendorServices.tsx tries to fetch vendor ID
   ↓
2. Uses this vendorId to call: GET /api/services/vendor/${vendorId}
   ↓
3. Backend queries: SELECT * FROM services WHERE vendor_id = ${vendorId}
   ↓
4. Problem: vendorId format might not match database vendor_id
```

### Critical Code Locations:

**VendorServices.tsx (Line 191):**
```typescript
const vendorId = actualVendorId || (user?.vendorId || user?.id || getVendorIdForUser(user as any));
```

**Fetch Services (Line 333):**
```typescript
const response = await fetch(`${apiUrl}/api/services/vendor/${vendorId}`, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
});
```

---

## 🧪 Diagnostic Steps

### Step 1: Check What Vendor ID Is Being Used

**Open browser console on `/vendor/services` and run:**

```javascript
// 1. Check session data
const user = JSON.parse(localStorage.getItem('weddingbazaar_user'));
console.log('📊 Session Data:');
console.log('  User ID:', user?.id);
console.log('  Vendor ID:', user?.vendorId);
console.log('  Role:', user?.role);

// 2. Check what the page is using
console.log('\n🔍 Checking VendorServices state...');
// Look in React DevTools or Network tab for the actual API call

// 3. Check API directly
const apiUrl = 'https://weddingbazaar-web.onrender.com';
const testVendorId = user?.id; // Try user.id first

console.log(`\n🌐 Testing API with user.id (${testVendorId}):`);
fetch(`${apiUrl}/api/services/vendor/${testVendorId}`)
  .then(r => r.json())
  .then(d => console.log('Result:', d))
  .catch(e => console.error('Error:', e));
```

### Step 2: Check Database Directly

**Run in Neon SQL Console:**

```sql
-- 1. Find your vendor record
SELECT id, user_id, business_name 
FROM vendors 
WHERE user_id = 'YOUR-USER-ID'; -- Replace with your user.id

-- Example: WHERE user_id = '2-2025-003'

-- 2. Check if services exist
SELECT id, vendor_id, title, category, is_active
FROM services
WHERE vendor_id = 'YOUR-VENDOR-ID'; -- Use the id from step 1

-- 3. Check vendor_profiles (if using new system)
SELECT id, user_id, business_name
FROM vendor_profiles
WHERE user_id = 'YOUR-USER-ID';
```

### Step 3: Compare IDs

```sql
-- THIS QUERY WILL TELL YOU THE PROBLEM
SELECT 
  'vendors.id' as source,
  v.id as vendor_id,
  v.user_id as user_id,
  COUNT(s.id) as service_count
FROM vendors v
LEFT JOIN services s ON s.vendor_id = v.id
WHERE v.user_id = 'YOUR-USER-ID'
GROUP BY v.id, v.user_id

UNION ALL

SELECT 
  'services.vendor_id' as source,
  s.vendor_id,
  v.user_id,
  COUNT(s.id) as service_count
FROM services s
LEFT JOIN vendors v ON v.id = s.vendor_id
WHERE s.vendor_id = 'YOUR-VENDOR-ID'
GROUP BY s.vendor_id, v.user_id;

-- If service_count is 0, vendor_id mismatch!
```

---

## 🔧 Common Problems & Fixes

### Problem 1: Wrong Vendor ID Format

**Symptoms:**
- API returns `{ success: true, services: [] }`
- Database has services but they don't appear
- Console shows no errors

**Cause:** Frontend using UUID, database has user ID (or vice versa)

**Check:**
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('weddingbazaar_user'));
console.log('User ID:', user?.id); // Should be '2-2025-XXX'
console.log('Vendor ID:', user?.vendorId); // Might be UUID or undefined
```

**Fix Option A: Use user.id (RECOMMENDED)**

If services in database have `vendor_id = '2-2025-003'`:

```javascript
// Run in browser console
const user = JSON.parse(localStorage.getItem('weddingbazaar_user'));
user.vendorId = user.id; // Force vendorId to match user.id
localStorage.setItem('weddingbazaar_user', JSON.stringify(user));
location.reload();
```

**Fix Option B: Update Database (NOT RECOMMENDED)**

Only if you want to change existing services:

```sql
-- Update all services to use correct vendor_id
UPDATE services 
SET vendor_id = '2-2025-003' -- Your user.id
WHERE vendor_id = 'OLD-VENDOR-ID';
```

---

### Problem 2: Services Exist But vendor_id Is NULL

**Symptoms:**
- Services exist in database
- But `vendor_id` column is NULL

**Check:**
```sql
SELECT id, vendor_id, title 
FROM services 
WHERE vendor_id IS NULL;
```

**Fix:**
```sql
-- Set vendor_id for orphaned services
UPDATE services 
SET vendor_id = '2-2025-003' -- Your user.id
WHERE vendor_id IS NULL 
  AND created_by_user = '2-2025-003'; -- If this column exists
```

---

### Problem 3: API Endpoint Returns 404

**Symptoms:**
- Network tab shows 404 error
- API call: `GET /api/services/vendor/undefined`

**Cause:** vendorId is undefined in frontend

**Check:**
```javascript
// In browser console on /vendor/services
const user = JSON.parse(localStorage.getItem('weddingbazaar_user'));
if (!user?.vendorId && !user?.id) {
  console.error('❌ No vendor ID available!');
}
```

**Fix:**
```javascript
// Set vendor ID manually
const user = JSON.parse(localStorage.getItem('weddingbazaar_user'));
if (!user.vendorId) {
  user.vendorId = user.id; // Use user.id as vendorId
  localStorage.setItem('weddingbazaar_user', JSON.stringify(user));
  location.reload();
}
```

---

### Problem 4: API Returns Services But Page Shows Empty

**Symptoms:**
- Network tab shows API returns services
- But page still shows "No services found"

**Cause:** Frontend filtering or state issue

**Check:**
```javascript
// In browser console
// Check if services are in state
// Open React DevTools → Components → VendorServices
// Look for 'services' state
```

**Fix:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Try incognito mode

---

## 🎯 Quick Fix Script

**Run this in browser console on `/vendor/services`:**

```javascript
console.clear();
console.log('🔍 VENDOR SERVICES DIAGNOSTIC\n');

// Step 1: Check session
const user = JSON.parse(localStorage.getItem('weddingbazaar_user'));
console.log('1️⃣ SESSION CHECK:');
console.log('   User ID:', user?.id || '❌ NOT FOUND');
console.log('   Vendor ID:', user?.vendorId || '❌ NOT FOUND');
console.log('   Role:', user?.role || '❌ NOT FOUND');
console.log('');

// Step 2: Determine vendor ID to use
const vendorIdToUse = user?.vendorId || user?.id;
console.log('2️⃣ VENDOR ID TO USE:', vendorIdToUse || '❌ NONE');
console.log('');

// Step 3: Test API
if (vendorIdToUse) {
  console.log('3️⃣ TESTING API...');
  const apiUrl = 'https://weddingbazaar-web.onrender.com';
  
  fetch(`${apiUrl}/api/services/vendor/${vendorIdToUse}`)
    .then(r => r.json())
    .then(data => {
      console.log('   API Response:', data);
      if (data.success) {
        console.log('   ✅ API works!');
        console.log('   📊 Services found:', data.services?.length || 0);
        
        if (data.services?.length === 0) {
          console.log('');
          console.log('❌ NO SERVICES IN DATABASE');
          console.log('💡 Solutions:');
          console.log('   1. Create a service via /vendor/services');
          console.log('   2. Check if services have different vendor_id in database');
          console.log('');
          console.log('📝 Run this SQL query in Neon:');
          console.log(`   SELECT * FROM services WHERE vendor_id = '${vendorIdToUse}';`);
        } else {
          console.log('');
          console.log('✅ SERVICES FOUND IN DATABASE');
          console.log('❌ But not showing on page = Frontend issue');
          console.log('💡 Try: Clear cache and hard refresh (Ctrl+Shift+R)');
        }
      } else {
        console.log('   ❌ API error:', data.error);
      }
    })
    .catch(err => {
      console.log('   ❌ API failed:', err.message);
      console.log('   💡 Check if backend is online');
    });
} else {
  console.log('❌ CANNOT TEST: No vendor ID available');
  console.log('');
  console.log('💡 FIX: Set vendor ID manually');
  console.log('   Run this:');
  console.log('   user.vendorId = user.id;');
  console.log('   localStorage.setItem("weddingbazaar_user", JSON.stringify(user));');
  console.log('   location.reload();');
}
```

---

## 📋 Verification Checklist

Run through these checks:

- [ ] User has `user.id` in session (e.g., '2-2025-003')
- [ ] User has `user.vendorId` in session (should match user.id or be valid UUID)
- [ ] API call: `GET /api/services/vendor/${vendorId}` returns 200
- [ ] API response has `success: true`
- [ ] API response has `services: [...]` array
- [ ] Services array is not empty
- [ ] Services have `vendor_id` matching the queried vendorId
- [ ] Page shows loading spinner then services
- [ ] No console errors in browser DevTools

---

## 🎯 Most Likely Solution

Based on the notification system alignment, the most likely issue is:

**Problem:** `user.vendorId` is undefined or wrong format

**Solution:** Set vendorId to user.id

```javascript
// Run in browser console
const user = JSON.parse(localStorage.getItem('weddingbazaar_user'));
user.vendorId = user.id; // Force match
localStorage.setItem('weddingbazaar_user', JSON.stringify(user));
location.reload();
```

Then verify:
```javascript
// After reload
const user = JSON.parse(localStorage.getItem('weddingbazaar_user'));
console.log('Vendor ID:', user.vendorId); // Should match user.id
```

---

## 📊 Expected Results

**If working correctly:**

1. **Session:**
   ```json
   {
     "id": "2-2025-003",
     "vendorId": "2-2025-003",
     "role": "vendor"
   }
   ```

2. **API Call:**
   ```
   GET /api/services/vendor/2-2025-003
   ```

3. **API Response:**
   ```json
   {
     "success": true,
     "services": [
       {
         "id": "uuid-123",
         "vendor_id": "2-2025-003",
         "title": "My Service",
         "category": "Photography"
       }
     ],
     "count": 1
   }
   ```

4. **Page Display:**
   - Services appear in grid/list
   - Can edit, delete, toggle availability
   - No error messages

---

## 🆘 Still Not Working?

**Share these outputs:**

1. **Browser Console:**
   ```javascript
   const user = JSON.parse(localStorage.getItem('weddingbazaar_user'));
   console.log(JSON.stringify(user, null, 2));
   ```

2. **Network Tab:**
   - URL of the API call
   - Response body
   - Response status

3. **Database Query:**
   ```sql
   SELECT id, vendor_id, title FROM services WHERE vendor_id = 'YOUR-ID';
   SELECT id, user_id FROM vendors WHERE user_id = 'YOUR-ID';
   ```

4. **Screenshot:**
   - VendorServices page
   - Browser console (any errors)
   - Network tab (API call)

---

**Next:** Run the Quick Fix Script above and let me know the output! 🚀
