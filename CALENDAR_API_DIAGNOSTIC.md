# 📊 Calendar API Diagnostic Guide

## 🎯 What Changed (Just Deployed)

I've added **CRITICAL DIAGNOSTIC LOGGING** to the calendar's availability service. When you open a booking modal now, you'll see exactly which API endpoint is being called.

---

## 🧪 How to Test & Diagnose

### Step 1: Clear Browser Cache & Reload
```
1. Open Dev Console (F12)
2. Go to Network tab
3. Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Step 2: Open a Booking Modal
```
1. Go to Services page
2. Click "Book Now" on any service (e.g., Baker, Photography, Catering)
3. Watch the console logs carefully
```

### Step 3: Check Console for These NEW Logs
Look for these **🚨 CRITICAL** logs that I just added:

```javascript
🌐 [AvailabilityService] 🚨 FETCHING BOOKINGS FROM: https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-001?startDate=2025-10-01&endDate=2025-11-30
🌐 [AvailabilityService] 🚨 FETCHING OFF-DAYS FROM: https://weddingbazaar-web.onrender.com/api/vendors/2-2025-001/off-days
📡 [AvailabilityService] 🚨 BOOKINGS FETCH COMPLETED: 200 OK
📡 [AvailabilityService] 🚨 OFF-DAYS FETCH COMPLETED: 404 Not Found
```

---

## 🔍 What to Look For

### ✅ GOOD Signs (API is being called):
```
✅ You see the 🚨 FETCHING BOOKINGS FROM log
✅ You see the 🚨 FETCH COMPLETED log
✅ Network tab shows: GET /api/bookings/vendor/2-2025-001?startDate=...
✅ Backend logs (Render) show the request
```

### ❌ BAD Signs (API is NOT being called):
```
❌ No 🚨 FETCHING logs appear
❌ No network request in Network tab
❌ Backend (Render) shows no requests
❌ Console shows CORS errors
❌ Console shows "Failed to fetch" errors
```

---

## 🐛 Possible Issues & Solutions

### Issue 1: No API Call Happens
**Symptoms**: No 🚨 FETCHING logs, no network requests
**Cause**: Calendar using cached data or not triggering API
**Solution**: 
- Clear browser cache completely
- Check if `checkAvailabilityRange()` is being called
- Verify vendor ID is correct

### Issue 2: CORS Error
**Symptoms**: Console shows "CORS policy" error
**Cause**: Backend not allowing frontend domain
**Solution**: Check backend CORS settings in `production-backend.js`

### Issue 3: Network Timeout
**Symptoms**: Request hangs, no response
**Cause**: Backend slow or down
**Solution**: Check Render backend status

### Issue 4: 404 Not Found
**Symptoms**: 🚨 FETCH COMPLETED: 404
**Cause**: Endpoint doesn't exist or vendor ID wrong
**Solution**: 
- Verify endpoint exists: https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-001
- Check vendor ID mapping

### Issue 5: Empty Response
**Symptoms**: 🚨 FETCH COMPLETED: 200, but calendar all green
**Cause**: Backend returns empty array
**Solution**: Check database has bookings for this vendor

---

## 📋 Diagnostic Checklist

Run through this checklist and report back:

- [ ] **Frontend deployed?** https://weddingbazaarph.web.app (check timestamp)
- [ ] **Backend live?** https://weddingbazaar-web.onrender.com/api/health
- [ ] **Console shows 🚨 FETCHING logs?** (Yes/No)
- [ ] **Network tab shows API call?** (Yes/No + screenshot)
- [ ] **Backend logs show request?** (Yes/No + logs)
- [ ] **API response status?** (200, 404, 500, timeout?)
- [ ] **API response body?** (empty, has bookings, error?)
- [ ] **Calendar shows red dates?** (Yes/No + which dates)

---

## 🔧 Quick Tests You Can Run

### Test 1: Direct API Call (Browser)
```
Open this URL in browser:
https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-001?startDate=2025-10-01&endDate=2025-11-30

Expected: JSON with bookings array
```

### Test 2: Check Vendor ID
```
Your bookings JSON shows:
- vendor_id: "2-2025-001"
- user_id: "1-2025-001"

Calendar should fetch for vendor: 2-2025-001
```

### Test 3: Verify Booking Dates
```
From your bookings.json:
- Oct 21: 2 bookings (Baker + Catering)
- Oct 22: 2 bookings (Photography)
- Oct 24: 2 bookings (Catering + Photography)
- Oct 28: 1 booking (Photography)
- Oct 30: 2 bookings (Catering)

These dates should show RED in their respective service calendars
```

---

## 📸 What to Screenshot

When you test, please screenshot:

1. **Console Logs**: Showing the 🚨 FETCHING logs
2. **Network Tab**: Showing the API request and response
3. **Calendar**: Showing which dates are red/green
4. **Render Backend Logs**: Showing if request arrived

---

## 🎯 Expected Behavior (After Fix)

### When you open Baker service booking:
```
Console should show:
🌐 [AvailabilityService] 🚨 FETCHING BOOKINGS FROM: .../api/bookings/vendor/2-2025-001?startDate=...
📡 [AvailabilityService] 🚨 BOOKINGS FETCH COMPLETED: 200 OK
📅 [AvailabilityService] Retrieved 10 bookings for date range
📊 [AvailabilityService] SERVICE-SPECIFIC filtering for: SRV-0002
📅 [AvailabilityService] Filtered 1 bookings for service SRV-0002

Calendar should show:
- October 21: RED (Baker booking exists)
- All other dates: GREEN
```

### When you open Photography service booking:
```
Console should show:
📊 [AvailabilityService] SERVICE-SPECIFIC filtering for: SRV-0001
📅 [AvailabilityService] Filtered 5 bookings for service SRV-0001

Calendar should show:
- October 21: RED
- October 22: RED (2 bookings)
- October 24: RED
- October 28: RED
- All other dates: GREEN
```

---

## 🚀 Next Steps

1. **Test now** with the new deployment
2. **Check console** for the 🚨 logs
3. **Report back** with:
   - Did you see the 🚨 FETCHING logs?
   - What status code did the API return?
   - Are dates showing red now?
   - Screenshot of console + network tab

This will tell us EXACTLY where the issue is!
