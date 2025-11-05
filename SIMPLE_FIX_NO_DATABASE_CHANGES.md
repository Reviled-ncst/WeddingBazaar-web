# 🔧 Simple Fix - NO Database Changes Required

**Date**: November 5, 2025  
**Issue**: Vendor services/bookings not showing  
**Root Cause**: Frontend using wrong vendor ID in session  
**Solution**: Update session/localStorage only (NO database changes)

---

## ✅ The Quick Fix (3 Steps)

### Step 1: Open Browser Console
1. Login as vendor at https://weddingbazaarph.web.app/vendor
2. Press **F12** to open DevTools
3. Go to **Console** tab

### Step 2: Run This Script
Copy and paste this entire script into the console:

```javascript
(async function fixVendorSession() {
  console.log('🔧 Starting vendor session fix...');
  
  // Get current session
  const authData = localStorage.getItem('authData');
  if (!authData) {
    console.error('❌ No auth data found. Please login first.');
    return;
  }
  
  const auth = JSON.parse(authData);
  console.log('Current user_id:', auth.user_id);
  console.log('Current vendorId:', auth.vendorId);
  
  // Fetch vendor profile to get correct vendor_id
  const response = await fetch('https://weddingbazaar-web.onrender.com/api/vendors/profile', {
    headers: {
      'Authorization': `Bearer ${auth.token}`
    }
  });
  
  if (!response.ok) {
    console.error('❌ Failed to fetch vendor profile');
    return;
  }
  
  const data = await response.json();
  console.log('✅ Vendor profile:', data);
  
  // Update session with correct vendor_id
  const correctVendorId = data.vendor?.id || data.vendor?.vendor_id;
  
  if (correctVendorId) {
    auth.vendorId = correctVendorId;
    localStorage.setItem('authData', JSON.stringify(auth));
    console.log('✅ Updated vendorId to:', correctVendorId);
    console.log('✅ Session fixed! Reloading page...');
    
    // Reload page to apply changes
    setTimeout(() => location.reload(), 1000);
  } else {
    console.error('❌ Could not find vendor ID in profile');
    console.log('Profile data:', data);
  }
})();
```

### Step 3: Wait for Page Reload
- Script will automatically reload the page
- After reload, check if services and bookings appear
- If yes, you're done! 🎉

---

## 🔍 What This Script Does

1. **Reads** your current session from localStorage
2. **Fetches** your vendor profile from the database
3. **Updates** the vendorId in your session to match the database
4. **Reloads** the page to apply the fix

**NO DATABASE CHANGES MADE** ✅

---

## 🎯 Alternative Manual Fix

If the script doesn't work, you can manually update the session:

### Step 1: Check Database Vendor ID
Run this in Neon SQL Editor:
```sql
SELECT id, user_id, business_name 
FROM vendors 
WHERE business_name LIKE '%Perfect%';
```

Copy the `id` value (e.g., `2-2025-001` or similar)

### Step 2: Update Session Manually
In browser console:
```javascript
// Get current session
const auth = JSON.parse(localStorage.getItem('authData'));

// Update vendorId (replace with your ID from Step 1)
auth.vendorId = '2-2025-001';  // <-- CHANGE THIS

// Save back to localStorage
localStorage.setItem('authData', JSON.stringify(auth));

// Reload
location.reload();
```

---

## 🧪 Verify the Fix

After reload, check:

### 1. Services Page
- Go to `/vendor/services`
- Should see your services list
- Should see "Add Service" button

### 2. Bookings Page
- Go to `/vendor/bookings`
- Should see bookings list
- Should see correct booking data

### 3. Notifications
- Check bell icon in header
- Should show notification count
- Click bell to see notifications

---

## 🔍 Debug Commands (If Still Issues)

If services/bookings still don't appear, run these in console:

### Check Current Session
```javascript
const auth = JSON.parse(localStorage.getItem('authData'));
console.log('User ID:', auth.user_id);
console.log('Vendor ID:', auth.vendorId);
console.log('Role:', auth.role);
console.log('Token:', auth.token ? 'Present' : 'Missing');
```

### Check Services API
```javascript
const auth = JSON.parse(localStorage.getItem('authData'));
fetch(`https://weddingbazaar-web.onrender.com/api/services?vendor_id=${auth.vendorId}`)
  .then(r => r.json())
  .then(d => console.log('Services:', d))
  .catch(e => console.error('Services error:', e));
```

### Check Bookings API
```javascript
const auth = JSON.parse(localStorage.getItem('authData'));
fetch(`https://weddingbazaar-web.onrender.com/api/bookings/vendor/${auth.vendorId}`)
  .then(r => r.json())
  .then(d => console.log('Bookings:', d))
  .catch(e => console.error('Bookings error:', e));
```

---

## ❓ Why This Happens

When you register as a vendor, the system creates:
1. **User record** with ID (e.g., `user-123`)
2. **Vendor profile** with ID (e.g., `2-2025-001`)

Sometimes the frontend session stores the **user ID** instead of the **vendor profile ID**.

Services and bookings are stored using the **vendor profile ID**, so when the frontend looks for them with the **user ID**, it finds nothing.

**This fix updates the session to use the correct vendor profile ID.**

---

## ✅ Summary

| What | Status |
|------|--------|
| **Database Changes** | ❌ None (not needed) |
| **Session Update** | ✅ Yes (localStorage only) |
| **Data Loss** | ❌ None (data is safe) |
| **Manual Steps** | ✅ Just run the script |
| **Time Required** | ⏱️ 1 minute |

---

## 🆘 Still Not Working?

If after running the fix:
1. Services still don't appear
2. Bookings still wrong
3. Notifications still broken

Then share these outputs:

```javascript
// Copy this entire block and run in console:
const auth = JSON.parse(localStorage.getItem('authData'));
console.log('=== DEBUG INFO ===');
console.log('User ID:', auth.user_id);
console.log('Vendor ID:', auth.vendorId);
console.log('Role:', auth.role);

// Then share the output
```

And I'll help debug further! 🔍

---

## 🎉 Expected Result

After fix:
- ✅ Services page shows your services
- ✅ Bookings page shows correct bookings
- ✅ Notifications show real notifications
- ✅ Add Service button works
- ✅ All vendor features functional

**NO DATABASE CHANGES REQUIRED!** 💪
