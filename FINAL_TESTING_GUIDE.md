# 🧪 FINAL TESTING GUIDE - ITEMIZED PRICE FIX

**Date**: November 7, 2025  
**Status**: Ready for Testing (after deployment completes)

---

## ✅ PRE-FLIGHT CHECKLIST

Before testing, confirm:
- [ ] Render deployment completed (check dashboard)
- [ ] Backend health check returns 200 OK
- [ ] Version shows recent timestamp
- [ ] Firebase frontend is live

**Quick Check**:
```powershell
Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health"
```

---

## 🎯 TEST SCENARIO: Create Rentals Service with Itemized Packages

### Step 1: Navigate to Vendor Services
1. Open: https://weddingbazaarph.web.app/vendor/services
2. Login as vendor (if needed)
3. Click **"Add New Service"** button

### Step 2: Fill Basic Information (Step 1)
- **Title**: "Premium Wedding Rentals"
- **Description**: "Complete rental packages for weddings"
- **Category**: Select **"Rentals"**
- **Location**: "Manila, Philippines"
- Click **"Next Step"**

### Step 3: Set Pricing (Step 2)
- **Pricing Mode**: Select **"Itemized Pricing"**
- **Add 3 Packages** using PackageBuilder:

#### Package 1: Basic Setup
- Name: "Basic Setup (100 pax)"
- Base Price: ₱45,000
- Add Items:
  - Round tables: ₱1,000 × 10 = ₱10,000
  - Folding chairs: ₱150 × 100 = ₱15,000
  - Table linens: ₱300 × 10 = ₱3,000
  - Delivery: ₱3,000 × 1 = ₱3,000

#### Package 2: Premium Setup
- Name: "Premium Setup (150 pax)"
- Base Price: ₱95,000
- Add Items:
  - Premium tables: ₱1,500 × 15 = ₱22,500
  - Chiavari chairs: ₱300 × 150 = ₱45,000
  - Dance floor: ₱600 × 1 = ₱600
  - Lounge furniture: ₱10,000 × 1 = ₱10,000

#### Package 3: Luxury Package
- Name: "Luxury Event (200 pax)"
- Base Price: ₱200,000
- Add Items:
  - Wedding tent: ₱40,000 × 1 = ₱40,000
  - LED dance floor: ₱800 × 1 = ₱800
  - Custom stage: ₱15,000 × 1 = ₱15,000
  - VIP lounge: ₱20,000 × 1 = ₱20,000

- Click **"Next Step"**

### Step 4: Service Details (Step 3)
- **Years of Experience**: 5 years
- **Service Tier**: **Select "Standard"** ⭐ IMPORTANT!
- **Wedding Styles**: Select any (e.g., Garden, Modern)
- **Cultural Specialties**: Select any (e.g., Filipino, Western)
- **Availability**: Check Weekends
- Click **"Next Step"**

### Step 5: Upload Images (Step 4)
- Upload 2-3 sample images
- Add tags: "rentals", "wedding", "furniture"
- Click **"Next Step"**

### Step 6: Confirmation Modal
**THIS IS THE CRITICAL CHECK!**

#### ✅ What to Verify:
1. **Package Totals Show Correctly**:
   - Basic Setup: ₱45,000 ✅
   - Premium Setup: ₱95,000 ✅
   - Luxury Event: ₱200,000 ✅

2. **Expand Each Package** (click arrow icon)

3. **Check Item Prices Are NOT ₱0**:
   - Round tables: **10 pcs × ₱1,000 = ₱10,000** ✅
   - Folding chairs: **100 pcs × ₱150 = ₱15,000** ✅
   - Premium tables: **15 pcs × ₱1,500 = ₱22,500** ✅
   - etc.

4. **If ANY price shows ₱0** → ❌ Bug still exists
5. **If ALL prices show real values** → ✅ Frontend working!

### Step 7: Submit Service
- Review all details
- Click **"Confirm & Publish"**
- Watch for response...

---

## 📊 EXPECTED RESULTS

### ✅ SUCCESS (What We Want to See)
```
✅ "Service created successfully!"
✅ Success modal with confetti animation
✅ Redirect back to services list
✅ New service appears in the list
```

### ❌ FAILURE (What to Check If You See This)
```
❌ "Failed to create service"
❌ 500 Internal Server Error
❌ Network error or timeout
```

**If failure occurs**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Find the failed POST request to `/api/services`
4. Check Response tab for error message
5. **Copy the full error and share it**

---

## 🔍 DATABASE VERIFICATION (After Success)

### Check Service Was Created
```sql
SELECT 
  id,
  title,
  category,
  service_tier,
  created_at
FROM services
WHERE title = 'Premium Wedding Rentals'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected**:
- `title`: "Premium Wedding Rentals" ✅
- `category`: "Rentals" ✅
- `service_tier`: **"standard"** ✅ (or whatever you selected)
- `created_at`: Recent timestamp ✅

### Check Packages Were Created
```sql
SELECT 
  sp.id,
  sp.package_name,
  sp.base_price,
  sp.tier,
  COUNT(pi.id) as item_count
FROM service_packages sp
LEFT JOIN package_items pi ON sp.id = pi.package_id
JOIN services s ON sp.service_id = s.id
WHERE s.title = 'Premium Wedding Rentals'
GROUP BY sp.id, sp.package_name, sp.base_price, sp.tier
ORDER BY sp.base_price;
```

**Expected**:
- 3 packages ✅
- Correct names and prices ✅
- item_count > 0 for each package ✅

### Check Items Were Created WITH PRICES
```sql
SELECT 
  pi.item_name,
  pi.item_type,
  pi.quantity,
  pi.unit_type,
  pi.unit_price,  -- ⭐ THIS SHOULD NOT BE 0!
  pi.quantity * pi.unit_price AS line_total
FROM package_items pi
JOIN service_packages sp ON pi.package_id = sp.id
JOIN services s ON sp.service_id = s.id
WHERE s.title = 'Premium Wedding Rentals'
ORDER BY sp.package_name, pi.display_order;
```

**Expected**:
- `item_type`: **"base"** for all items ✅ (from our mapping)
- `unit_price`: **REAL VALUES** (not 0.00!) ✅
  - Round tables: 1000.00 ✅
  - Folding chairs: 150.00 ✅
  - Premium tables: 1500.00 ✅
  - etc.
- `line_total`: Correct calculations ✅

---

## 🎯 SUCCESS CRITERIA

### The Bug is FIXED if:
1. ✅ Confirmation modal shows real prices (not ₱0)
2. ✅ Service creation succeeds (no 500 error)
3. ✅ Database `unit_price` column has real values
4. ✅ Backend logs show item_type and service_tier mappings

### The Bug PERSISTS if:
1. ❌ Confirmation modal still shows ₱0 for item prices
2. ❌ 500 error on submission
3. ❌ Database `unit_price` is 0.00
4. ❌ Backend logs show errors

---

## 🔧 TROUBLESHOOTING

### Issue: Confirmation Modal Shows ₱0
**Diagnosis**: Frontend issue (PackageBuilder not sending unit_price)
**Check**: Browser console for package data logs
**Fix**: Verify `PackageBuilder.tsx` changes deployed

### Issue: 500 Error on Submit
**Diagnosis**: Backend constraint issue
**Check**: Render backend logs for exact error
**Fix**: Share error message for analysis

### Issue: Service Created but unit_price is 0
**Diagnosis**: Backend not saving unit_price
**Check**: Backend logs for INSERT statement
**Fix**: Verify backend `services.cjs` changes deployed

### Issue: item_type Constraint Error
**Diagnosis**: Category mapping not working
**Check**: Backend logs for mapping messages
**Fix**: Verify our item_type mapping is in deployed code

### Issue: service_tier Constraint Error
**Diagnosis**: Tier validation not working
**Check**: Backend logs for tier normalization
**Fix**: Verify our service_tier validation is in deployed code

---

## 📞 IF YOU NEED HELP

### Information to Provide:
1. **Screenshot of confirmation modal** (showing prices)
2. **Browser console logs** (any errors)
3. **Network tab** (failed request details)
4. **Render backend logs** (server-side errors)
5. **Database query results** (data actually saved)

### Where to Check Logs:
- **Browser**: F12 → Console tab
- **Network**: F12 → Network tab → Filter: XHR
- **Render**: https://dashboard.render.com → Logs tab
- **Database**: Neon SQL console

---

## 🎉 AFTER SUCCESSFUL TEST

### Clean Up (Optional):
1. Remove debug `console.log` statements from frontend
2. Remove verbose logging from backend
3. Delete test service from database (if desired)

### Documentation:
1. Mark issue as RESOLVED
2. Document the 3 fixes made
3. Update system documentation
4. Close ticket

### Celebration:
```
🎉 ITEMIZED PRICING BUG FIXED!
🎊 All 3 root causes identified and resolved!
✅ Service creation works with itemized packages!
✅ Prices display correctly in modal!
✅ Database saves all item prices!
```

---

**Test URL**: https://weddingbazaarph.web.app/vendor/services  
**Backend Health**: https://weddingbazaar-web.onrender.com/api/health  
**Status**: 🧪 **READY FOR TESTING**

**Good luck! This should work now!** 🚀
