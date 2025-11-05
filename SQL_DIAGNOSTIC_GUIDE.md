# 🔍 SQL DATABASE DIAGNOSTIC - FIND THE ROOT CAUSE

**Issue**: Services missing + Bookings showing wrong data  
**Likely Cause**: Database vendor_id mismatch or data corruption

---

## 🎯 RUN THIS NOW (10 minutes)

### **Step 1: Open Neon SQL Console** (1 min)

1. Go to: https://console.neon.tech
2. Login to your account
3. Select project: **WeddingBazaar**
4. Click **SQL Editor** tab

### **Step 2: Run Diagnostic Queries** (5 min)

Copy and paste the entire content of `SQL_VENDOR_DIAGNOSTIC.sql` into the SQL editor.

**IMPORTANT**: Before running, replace these placeholders:
```sql
-- Line 135: Replace with your email
WHERE u.email = 'YOUR_EMAIL@example.com'

-- Line 147: Replace with your vendor ID (if you know it)
WHERE vp.id = 'YOUR_VENDOR_ID'

-- Line 159: Replace with your email
WHERE u.role = 'vendor' AND u.email = 'YOUR_EMAIL@example.com'
```

Then click **Run** to execute all queries.

### **Step 3: Analyze Results** (3 min)

Look for these key indicators:

#### **🔴 CRITICAL ISSUES**:

**Query 3 - Services Count**:
```
vendor_id    | service_count | active_count
-------------|---------------|-------------
VEN-001      | 5            | 5
abc-123-xyz  | 0            | 0  ← ❌ YOUR ID shows 0
```
**= Your services exist but under different vendor_id!**

**Query 6 - Vendor ID Mismatches**:
```
table_name | vendor_id   | id_match_status
-----------|-------------|--------------------------------
services   | VEN-001     | ✅ MATCHES vendor_profiles.id
services   | abc-123     | ⚠️ MATCHES users.id (NOT vendor_profiles.id)  ← ❌ PROBLEM
```
**= Services using users.id instead of vendor_profiles.id**

**Query 9 - Your Vendor Data**:
```
vendor_profile_id | user_id  | email              | service_count | booking_count
------------------|----------|--------------------|--------------|--------------
VEN-001          | abc-123  | you@email.com      | 5            | 10
```
**= Shows which ID has your data**

#### **🟢 WHAT TO LOOK FOR**:

1. **Do services exist?**
   - Query 3: If service_count > 0 for ANY vendor_id → Services exist
   - Query 3: If YOUR vendor_id shows 0 → Wrong ID being used

2. **Do bookings exist?**
   - Query 4: If booking_count > 0 → Bookings exist
   - Check if vendor_id matches your vendor_profile_id

3. **Vendor ID format?**
   - Query 10: Shows all possible IDs and which one has data
   - `services_with_user_id` vs `services_with_profile_id`

4. **Data type mismatch?**
   - Query 11: Check if vendor_id is VARCHAR, UUID, or TEXT
   - Should be consistent across all tables

---

## 🎯 COMMON PROBLEMS & FIXES

### **Problem 1: Services exist but wrong vendor_id**

**Symptoms**:
- Query 3 shows services exist
- But vendor_id doesn't match your login ID
- Example: Services have `VEN-001` but you login as `abc-123-xyz`

**Fix**:
```sql
-- Option A: Update your session to use correct vendor_id
-- (Run in browser console after finding correct ID from Query 10)
const user = JSON.parse(localStorage.getItem('user'));
user.vendorId = 'VEN-001';  -- Your CORRECT vendor_id from Query 10
localStorage.setItem('user', JSON.stringify(user));
location.reload();
```

**OR**

```sql
-- Option B: Update database to use your current ID
-- (If Query 10 shows services_with_user_id > 0)
-- DO NOT RUN THIS WITHOUT CHECKING FIRST
UPDATE services 
SET vendor_id = 'YOUR_VENDOR_PROFILE_ID'  -- From vendor_profiles.id
WHERE vendor_id = 'YOUR_USER_ID';  -- From users.id

UPDATE bookings
SET vendor_id = 'YOUR_VENDOR_PROFILE_ID'
WHERE vendor_id = 'YOUR_USER_ID';
```

### **Problem 2: No services in database at all**

**Symptoms**:
- Query 3 shows 0 services for ALL vendor_ids
- Query 12 returns empty

**Possible Causes**:
1. ❌ Services were deleted (check if `deleted_at` column exists)
2. ❌ Database restore issue
3. ❌ Wrong database connection

**Fix**:
```sql
-- Check if services table has data at all
SELECT COUNT(*) as total_services FROM services;

-- Check if there's a deleted_at column (soft delete)
SELECT * FROM services WHERE deleted_at IS NULL LIMIT 10;

-- If services exist but all are soft-deleted:
UPDATE services SET deleted_at = NULL WHERE vendor_id = 'YOUR_VENDOR_ID';
```

### **Problem 3: Bookings showing wrong data**

**Symptoms**:
- Query 8 shows bookings with invalid vendor_id or couple_id
- "Unknown Client" appears
- Bookings belong to different vendor

**Fix**:
```sql
-- Find bookings with YOUR vendor_profile_id
SELECT 
    id, 
    vendor_id, 
    couple_id, 
    couple_name,
    service_name, 
    status,
    event_date
FROM bookings
WHERE vendor_id = 'YOUR_VENDOR_PROFILE_ID'  -- From Query 9
ORDER BY created_at DESC;

-- If bookings exist but with different vendor_id:
-- Check Query 4 to see which vendor_id has your bookings
```

### **Problem 4: Couple name showing as "Unknown Client"**

**Symptoms**:
- Bookings exist
- couple_id exists
- But couple_name is NULL or "Unknown Client"

**Fix**:
```sql
-- Update couple_name from users table
UPDATE bookings b
SET couple_name = u.full_name
FROM users u
WHERE b.couple_id::text = u.id::text
  AND b.couple_name IS NULL;

-- Or set a default format
UPDATE bookings
SET couple_name = 'Client #' || SUBSTRING(couple_id, 7)
WHERE couple_name IS NULL OR couple_name = 'Unknown Client';
```

---

## 📋 CHECKLIST - What to Share

After running the diagnostic, share these results:

- [ ] **Query 3 results** - Services count by vendor_id
- [ ] **Query 4 results** - Bookings count by vendor_id
- [ ] **Query 6 results** - Vendor ID mismatch detection
- [ ] **Query 9 results** - Your specific vendor data
- [ ] **Query 10 results** - All possible vendor IDs for your user
- [ ] **Query 12 results** - Sample services data
- [ ] **Query 13 results** - Sample bookings data

---

## 🚀 EXPECTED RESULTS (Healthy System)

When everything is correct:

```sql
-- Query 9 should show:
vendor_profile_id | user_id      | email           | service_count | booking_count
VEN-001          | 1-2025-001   | you@email.com   | 5            | 10

-- Query 10 should show:
user_id      | vendor_profile_id | services_with_user_id | services_with_profile_id
1-2025-001   | VEN-001          | 0                     | 5  ← Services use profile_id ✅

-- Query 6 should show:
table_name | vendor_id | id_match_status
services   | VEN-001   | ✅ MATCHES vendor_profiles.id
bookings   | VEN-001   | ✅ MATCHES vendor_profiles.id
```

---

## ⚡ QUICK FIX (If vendor_id mismatch confirmed)

If Query 10 shows your data is under a different ID:

```javascript
// 1. Find correct vendor_id from Query 10
// 2. Run in browser console:
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('OLD Vendor ID:', user.vendorId || user.id);

// 3. Set correct vendor_id (replace with YOUR value from Query 10):
user.vendorId = 'VEN-001';  // ← Your CORRECT vendor_profile_id

// 4. Save and reload:
localStorage.setItem('user', JSON.stringify(user));
location.reload();
```

---

## 🆘 Still Not Working?

If diagnostic shows:
- ✅ Services exist in database
- ✅ Vendor ID matches
- ❌ Still not showing in frontend

Then the issue is in the **API layer** (not database).

Check:
1. Backend logs in Render
2. Frontend Network tab (API responses)
3. CORS errors
4. Authentication token

---

**Run the SQL diagnostic NOW and share the results!** 🔍

This will pinpoint the exact cause within 10 minutes.
