# 🚨 COMPLETE VENDOR DATA DIAGNOSTIC - Services + Bookings

**Issue**: Both vendor services missing AND bookings showing wrong data  
**Root Cause**: Likely SQL/Database vendor_id mismatch across tables

---

## 🎯 WHAT THIS WILL CHECK

This diagnostic will verify:

✅ **Vendor Services**:
- Do your services exist in database?
- What vendor_id are they using?
- Are they active or inactive?
- Why aren't they showing in UI?

✅ **Vendor Bookings**:
- Do your bookings exist?
- What vendor_id are they using?
- Why is "Unknown Client" showing?
- Are you seeing someone else's bookings?

✅ **Vendor Profile**:
- What's your correct vendor_profile_id?
- What's your user_id?
- How do they relate to services/bookings?

---

## 🚀 RUN DIAGNOSTIC NOW (5 minutes)

### **Step 1: Open Neon SQL Console**

1. Go to: https://console.neon.tech
2. Login with your account
3. Select project: **WeddingBazaar**
4. Click **SQL Editor** tab

### **Step 2: Run This Single Query**

Copy and paste this complete diagnostic query:

```sql
-- ============================================================================
-- COMPLETE VENDOR DATA DIAGNOSTIC
-- This will check BOTH services and bookings for vendor_id issues
-- ============================================================================

-- PART 1: Check your vendor profile and IDs
WITH your_vendor AS (
  SELECT 
    vp.id as vendor_profile_id,
    vp.user_id,
    vp.business_name,
    u.id as user_table_id,
    u.email,
    u.full_name
  FROM vendor_profiles vp
  LEFT JOIN users u ON vp.user_id::text = u.id::text
  WHERE u.email = 'YOUR_EMAIL@example.com'  -- ⚠️ REPLACE WITH YOUR EMAIL
  LIMIT 1
)

-- PART 2: Count services by vendor_id and check which ID has your services
SELECT 
  '📊 YOUR VENDOR INFO' as check_type,
  vendor_profile_id,
  user_table_id as user_id,
  business_name,
  email,
  NULL as count,
  NULL as table_name,
  NULL as vendor_id_used
FROM your_vendor

UNION ALL

SELECT 
  '🔍 SERVICES CHECK' as check_type,
  yv.vendor_profile_id,
  yv.user_table_id,
  yv.business_name,
  yv.email,
  COUNT(s.id) as count,
  'services' as table_name,
  s.vendor_id as vendor_id_used
FROM your_vendor yv
CROSS JOIN services s
WHERE s.vendor_id IN (yv.vendor_profile_id, yv.user_table_id)
GROUP BY yv.vendor_profile_id, yv.user_table_id, yv.business_name, yv.email, s.vendor_id

UNION ALL

SELECT 
  '📦 BOOKINGS CHECK' as check_type,
  yv.vendor_profile_id,
  yv.user_table_id,
  yv.business_name,
  yv.email,
  COUNT(b.id) as count,
  'bookings' as table_name,
  b.vendor_id as vendor_id_used
FROM your_vendor yv
CROSS JOIN bookings b
WHERE b.vendor_id IN (yv.vendor_profile_id, yv.user_table_id)
GROUP BY yv.vendor_profile_id, yv.user_table_id, yv.business_name, yv.email, b.vendor_id

UNION ALL

SELECT 
  '⚠️ SERVICES STATUS' as check_type,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  CASE 
    WHEN EXISTS (SELECT 1 FROM services WHERE vendor_id = (SELECT vendor_profile_id FROM your_vendor)) 
    THEN 'Services found with vendor_profile_id ✅'
    WHEN EXISTS (SELECT 1 FROM services WHERE vendor_id = (SELECT user_table_id FROM your_vendor))
    THEN 'Services found with user_id (MISMATCH ⚠️)'
    ELSE 'NO SERVICES FOUND ❌'
  END,
  NULL

UNION ALL

SELECT 
  '⚠️ BOOKINGS STATUS' as check_type,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  CASE 
    WHEN EXISTS (SELECT 1 FROM bookings WHERE vendor_id = (SELECT vendor_profile_id FROM your_vendor)) 
    THEN 'Bookings found with vendor_profile_id ✅'
    WHEN EXISTS (SELECT 1 FROM bookings WHERE vendor_id = (SELECT user_table_id FROM your_vendor))
    THEN 'Bookings found with user_id (MISMATCH ⚠️)'
    ELSE 'NO BOOKINGS FOUND ❌'
  END,
  NULL

ORDER BY check_type;
```

**⚠️ IMPORTANT**: Replace `YOUR_EMAIL@example.com` with your actual email!

### **Step 3: Read the Results**

The output will show you:

```
check_type           | vendor_profile_id | user_id    | business_name | email           | count | table_name | vendor_id_used
---------------------|-------------------|------------|---------------|-----------------|-------|------------|---------------
📊 YOUR VENDOR INFO | VEN-001           | abc-123    | My Business   | you@email.com   | NULL  | NULL       | NULL
🔍 SERVICES CHECK   | VEN-001           | abc-123    | My Business   | you@email.com   | 5     | services   | VEN-001
📦 BOOKINGS CHECK   | VEN-001           | abc-123    | My Business   | you@email.com   | 10    | bookings   | VEN-001
⚠️ SERVICES STATUS  | NULL              | NULL       | NULL          | NULL            | NULL  | Services found with vendor_profile_id ✅ | NULL
⚠️ BOOKINGS STATUS  | NULL              | NULL       | NULL          | NULL            | NULL  | Bookings found with vendor_profile_id ✅ | NULL
```

---

## 🔍 INTERPRETING RESULTS

### **✅ GOOD RESULT (Everything Working)**:

```
📊 YOUR VENDOR INFO: Shows your IDs
🔍 SERVICES CHECK: count = 5, vendor_id_used = VEN-001 (matches vendor_profile_id)
📦 BOOKINGS CHECK: count = 10, vendor_id_used = VEN-001 (matches vendor_profile_id)
⚠️ SERVICES STATUS: "Services found with vendor_profile_id ✅"
⚠️ BOOKINGS STATUS: "Bookings found with vendor_profile_id ✅"
```

**Action**: Your data exists! The issue is frontend using wrong ID. **Jump to FIX #1 below**.

---

### **❌ BAD RESULT (ID Mismatch)**:

```
📊 YOUR VENDOR INFO: vendor_profile_id = VEN-001, user_id = abc-123
🔍 SERVICES CHECK: count = 5, vendor_id_used = abc-123 (uses user_id instead!)
📦 BOOKINGS CHECK: count = 10, vendor_id_used = abc-123 (uses user_id instead!)
⚠️ SERVICES STATUS: "Services found with user_id (MISMATCH ⚠️)"
⚠️ BOOKINGS STATUS: "Bookings found with user_id (MISMATCH ⚠️)"
```

**Action**: Database is using user_id, frontend expects vendor_profile_id. **Jump to FIX #2 below**.

---

### **❌ WORST RESULT (No Data)**:

```
📊 YOUR VENDOR INFO: Shows your IDs
🔍 SERVICES CHECK: No rows (or count = 0)
📦 BOOKINGS CHECK: No rows (or count = 0)
⚠️ SERVICES STATUS: "NO SERVICES FOUND ❌"
⚠️ BOOKINGS STATUS: "NO BOOKINGS FOUND ❌"
```

**Action**: Data doesn't exist in database! **Jump to FIX #3 below**.

---

## 🔧 FIXES

### **FIX #1: Frontend Using Wrong ID** (Data exists, UI broken)

**Problem**: Database has your data but frontend is querying with wrong vendor_id.

**Solution** (Run in browser console):
```javascript
// 1. Get current user
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('Current vendor ID:', user.vendorId || user.id);

// 2. Set CORRECT vendor_profile_id from diagnostic results
user.vendorId = 'VEN-001';  // ⚠️ REPLACE with YOUR vendor_profile_id

// 3. Save and reload
localStorage.setItem('user', JSON.stringify(user));
console.log('Updated vendor ID to:', user.vendorId);
location.reload();
```

**After reload**: Services and bookings should appear!

---

### **FIX #2: Database Using Wrong ID** (ID mismatch in tables)

**Problem**: Services/bookings are stored with user_id but frontend expects vendor_profile_id.

**Option A: Update Database** (Permanent fix):
```sql
-- Update services to use vendor_profile_id
UPDATE services
SET vendor_id = 'VEN-001'  -- ⚠️ Your vendor_profile_id
WHERE vendor_id = 'abc-123';  -- ⚠️ Your user_id

-- Update bookings to use vendor_profile_id
UPDATE bookings
SET vendor_id = 'VEN-001'  -- ⚠️ Your vendor_profile_id
WHERE vendor_id = 'abc-123';  -- ⚠️ Your user_id

-- Verify updates
SELECT 'Services updated:' as status, COUNT(*) as count 
FROM services WHERE vendor_id = 'VEN-001'
UNION ALL
SELECT 'Bookings updated:' as status, COUNT(*) as count 
FROM bookings WHERE vendor_id = 'VEN-001';
```

**Option B: Update Frontend to Use User ID** (Quick fix):
```javascript
// Make frontend use user_id instead
const user = JSON.parse(localStorage.getItem('user'));
user.vendorId = user.id;  // Use user_id
localStorage.setItem('user', JSON.stringify(user));
location.reload();
```

---

### **FIX #3: No Data Exists** (Database empty)

**Problem**: No services or bookings in database at all.

**Possible Causes**:
1. ❌ Never created any services
2. ❌ Services/bookings deleted
3. ❌ Wrong database/environment
4. ❌ Soft-deleted (deleted_at IS NOT NULL)

**Check for soft-deletes**:
```sql
-- Check if data exists but is soft-deleted
SELECT 
  'services_soft_deleted' as table_name,
  COUNT(*) as count
FROM services
WHERE deleted_at IS NOT NULL
  AND vendor_id IN (
    SELECT vp.id FROM vendor_profiles vp
    LEFT JOIN users u ON vp.user_id = u.id
    WHERE u.email = 'YOUR_EMAIL@example.com'
  )
UNION ALL
SELECT 
  'bookings_soft_deleted' as table_name,
  COUNT(*) as count
FROM bookings
WHERE deleted_at IS NOT NULL
  AND vendor_id IN (
    SELECT vp.id FROM vendor_profiles vp
    LEFT JOIN users u ON vp.user_id = u.id
    WHERE u.email = 'YOUR_EMAIL@example.com'
  );
```

**If soft-deleted data found**:
```sql
-- Restore services
UPDATE services
SET deleted_at = NULL
WHERE vendor_id = 'YOUR_VENDOR_ID';

-- Restore bookings
UPDATE bookings
SET deleted_at = NULL
WHERE vendor_id = 'YOUR_VENDOR_ID';
```

---

## 🎯 QUICK SUMMARY

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Services show 0 but exist in DB | Frontend using wrong ID | FIX #1 |
| Bookings show 0 but exist in DB | Frontend using wrong ID | FIX #1 |
| "Unknown Client" showing | Couple name NULL in DB | Update couple_name |
| Services exist with user_id | Database ID mismatch | FIX #2 |
| No services/bookings in DB | Data doesn't exist or deleted | FIX #3 |
| Everything shows count > 0 | Cache or API issue | Clear cache |

---

## 📋 AFTER APPLYING FIX

Test that it works:

1. **Clear browser cache**:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Login again** as vendor

3. **Check Services page**: Should show your services

4. **Check Bookings page**: Should show your bookings with correct data

5. **Check console** (F12): No errors

---

## 🆘 STILL NOT WORKING?

If after applying the fix it still doesn't work:

### **Additional Debug Steps**:

1. **Check API Response**:
   - Open DevTools → Network tab
   - Go to Services page
   - Look for request: `/api/services/vendor/YOUR_ID`
   - Check response: Does it return data?

2. **Check Vendor ID in API Call**:
   ```javascript
   // Run in console
   const user = JSON.parse(localStorage.getItem('user'));
   console.log('User vendorId:', user.vendorId);
   console.log('User id:', user.id);
   console.log('Expected to use:', user.vendorId || user.id);
   ```

3. **Test API Directly**:
   - Open: `https://weddingbazaar-web.onrender.com/api/services/vendor/YOUR_VENDOR_ID`
   - Replace YOUR_VENDOR_ID with the ID from step 2
   - Should return JSON with your services

---

## ✅ SUCCESS CHECKLIST

After fix, verify:
- [ ] Services page loads and shows your services
- [ ] Bookings page loads and shows your bookings
- [ ] Client names show correctly (not "Unknown Client")
- [ ] Service counts are correct
- [ ] Booking counts are correct
- [ ] No console errors
- [ ] API calls return data

---

**Run the diagnostic query NOW and share the results!** 

This single query will tell us exactly what's wrong with BOTH services and bookings. 🚀
