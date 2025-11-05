# ⚡ 1-MINUTE FIX - Vendor Services & Bookings

**Issue**: Services missing + Bookings wrong  
**Fix Time**: 1-5 minutes

---

## 🎯 DO THIS FIRST (1 minute)

### **Option 1: Try Quick Fix** (No SQL needed)

Open browser console (F12) and run:

```javascript
// Clear everything and reset
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cache cleared');

// Reload
location.reload();
```

Then **login again** and check if services/bookings appear.

**If this works**: ✅ Done! Issue was cache.  
**If still broken**: Continue to Option 2.

---

## 🔍 Option 2: Find Correct Vendor ID (3 minutes)

### **Step 1: Run This SQL Query**

1. Open Neon SQL Console: https://console.neon.tech
2. Paste this query (replace YOUR_EMAIL):

```sql
SELECT 
  vp.id as vendor_profile_id,
  u.id as user_id,
  u.email,
  vp.business_name,
  (SELECT COUNT(*) FROM services WHERE vendor_id = vp.id) as services_with_profile_id,
  (SELECT COUNT(*) FROM services WHERE vendor_id = u.id) as services_with_user_id,
  (SELECT COUNT(*) FROM bookings WHERE vendor_id = vp.id) as bookings_with_profile_id,
  (SELECT COUNT(*) FROM bookings WHERE vendor_id = u.id) as bookings_with_user_id
FROM users u
LEFT JOIN vendor_profiles vp ON vp.user_id = u.id
WHERE u.email = 'YOUR_EMAIL@example.com';  -- ⚠️ REPLACE THIS
```

### **Step 2: Read Results**

Example output:
```
vendor_profile_id | user_id  | services_with_profile_id | services_with_user_id
VEN-001          | abc-123  | 5                        | 0
```

**This tells you**:
- Your vendor_profile_id: `VEN-001`
- Your user_id: `abc-123`
- Services count: 5 (stored with vendor_profile_id)
- Frontend should use: `VEN-001`

### **Step 3: Update Frontend**

Run in browser console:
```javascript
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Set correct vendor ID (use the ID that has data)
user.vendorId = 'VEN-001';  // ⚠️ REPLACE with YOUR vendor_profile_id

localStorage.setItem('user', JSON.stringify(user));
console.log('✅ Updated vendor ID to:', user.vendorId);
location.reload();
```

---

## ✅ VERIFY IT WORKS

After reload:
- ✅ Services page shows your services
- ✅ Bookings page shows your bookings
- ✅ No "Unknown Client"
- ✅ Correct counts

---

## 🚨 IF STILL BROKEN

**Scenario A**: SQL shows `services_with_profile_id = 0` and `services_with_user_id = 5`

**Solution**: Use user_id instead:
```javascript
const user = JSON.parse(localStorage.getItem('user'));
user.vendorId = user.id;  // Use user_id
localStorage.setItem('user', JSON.stringify(user));
location.reload();
```

**Scenario B**: SQL shows all counts = 0

**Solution**: No data in database. Check:
1. Are you using the right email?
2. Did you ever create services?
3. Is data soft-deleted? Run:
   ```sql
   SELECT COUNT(*) FROM services WHERE deleted_at IS NOT NULL;
   ```

---

## 📞 QUICK SUPPORT

Share these 3 things:
1. ✅ SQL query output (screenshot)
2. ✅ Your email used to login
3. ✅ Console output from browser

I'll tell you exactly what to do! 🚀
