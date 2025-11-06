# 🔍 CHECK VENDOR DATA RIGHT NOW

## What We Know
- ✅ Notifications work for legacy ID: `2-2025-003` (6 notifications)
- ❌ Services fail for UUID: `6fe3dc77-6774-4de8-ae2e-81a8ffb258f6` (0 services)
- 🔄 Both IDs belong to same vendor (test/vend)

## Option 1: Check via API (FASTEST - 30 seconds)

Open these URLs in your browser (you're logged in):

```
1. Check services by legacy ID:
https://weddingbazaar-web.onrender.com/api/services/vendor/2-2025-003

2. Check services by UUID:
https://weddingbazaar-web.onrender.com/api/services/vendor/6fe3dc77-6774-4de8-ae2e-81a8ffb258f6

3. Check vendor profile:
https://weddingbazaar-web.onrender.com/api/vendors/profile/6fe3dc77-6774-4de8-ae2e-81a8ffb258f6
```

**EXPECTED RESULT:**
- If services exist under `2-2025-003` → SQL migration needed
- If services exist under UUID → Different vendor account
- If NO services at all → You need to add services first

---

## Option 2: Run SQL in Neon (2 minutes)

Copy and paste this SQL in **Neon SQL Console**:

```sql
-- 1. Check vendor accounts
SELECT 
  id,
  email,
  full_name,
  role,
  created_at,
  'users table' as source
FROM users 
WHERE email = 'vendor0qw@gmail.com';

-- 2. Check vendor profiles
SELECT 
  id,
  user_id,
  business_name,
  business_type,
  vendor_type,
  created_at,
  'vendor_profiles table' as source
FROM vendor_profiles;

-- 3. Check services by BOTH IDs
SELECT 
  id,
  vendor_id,
  service_name,
  service_type,
  base_price,
  is_active,
  created_at,
  CASE 
    WHEN vendor_id = '2-2025-003' THEN 'LEGACY ID'
    WHEN vendor_id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6' THEN 'UUID'
    ELSE 'OTHER ID'
  END as id_format
FROM services
WHERE vendor_id IN ('2-2025-003', '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6')
ORDER BY created_at DESC;

-- 4. Check ALL services (to see what exists)
SELECT 
  vendor_id,
  COUNT(*) as service_count,
  STRING_AGG(service_name, ', ') as services
FROM services
GROUP BY vendor_id;
```

---

## Option 3: Quick Backend Health Check

```powershell
# Check backend logs
curl https://weddingbazaar-web.onrender.com/api/health
```

---

## 🎯 **NEXT STEPS BASED ON RESULTS**

### Scenario A: Services exist under legacy ID `2-2025-003`
**Solution:** Run SQL migration to update vendor_id from legacy to UUID
```sql
UPDATE services 
SET vendor_id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6'
WHERE vendor_id = '2-2025-003';
```

### Scenario B: Services exist under UUID
**Solution:** Check if you're logged in with correct account, clear cache, re-login

### Scenario C: NO services exist at all
**Solution:** Create your first service using "Add Service" button

### Scenario D: Multiple vendor accounts exist
**Solution:** Consolidate accounts or login with correct account

---

## ⚡ DO THIS RIGHT NOW (30 seconds)

1. Open browser console (F12)
2. Paste this and press Enter:

```javascript
// Check what's in your session
console.log('Session Data:', {
  vendorId: sessionStorage.getItem('vendorId'),
  userId: sessionStorage.getItem('userId'),
  user: JSON.parse(localStorage.getItem('user') || '{}')
});

// Call API directly
fetch('https://weddingbazaar-web.onrender.com/api/services/vendor/2-2025-003')
  .then(r => r.json())
  .then(data => console.log('Services by Legacy ID:', data));

fetch('https://weddingbazaar-web.onrender.com/api/services/vendor/6fe3dc77-6774-4de8-ae2e-81a8ffb258f6')
  .then(r => r.json())
  .then(data => console.log('Services by UUID:', data));
```

3. **Share the console output** with me

This will tell us EXACTLY what's in the database and what needs to be fixed!
