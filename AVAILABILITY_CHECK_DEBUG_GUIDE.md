# 🔍 Availability Check Debugging Guide

**Issue:** Availability check not fetching dates with existing bookings  
**Date:** October 29, 2025

---

## 🎯 How to Test Availability Check

### Step 1: Check What Bookings Exist

Open browser console and run:

```javascript
// Test the API directly
const vendorId = '2-2025-001'; // Replace with your vendor ID
const response = await fetch(`https://weddingbazaar-web.onrender.com/api/bookings/vendor/${vendorId}`);
const data = await response.json();
console.log('📊 Total bookings:', data.count);
console.log('📅 Bookings by date:', data.bookings.map(b => ({
  date: b.event_date,
  status: b.status,
  couple: b.couple_name
})));
```

### Step 2: Test Availability Check

```javascript
// Import the service (in browser console on your site)
const { availabilityService } = window;

// Check a specific date
const vendorId = '2-2025-001';
const testDate = '2025-11-15'; // Use a date you know has a booking

const result = await availabilityService.checkAvailability(vendorId, testDate);
console.log('✅ Availability Result:', result);
```

---

## 🔍 Debugging Checklist

### Issue 1: Vendor ID Mismatch

**Problem:** Bookings stored with different vendor ID format  
**Check:**
```sql
-- Run in Neon SQL Editor
SELECT DISTINCT vendor_id 
FROM bookings 
LIMIT 10;
```

**Expected:** `2-2025-001` (full format)  
**If you see:** `2` or other format → Vendor ID mismatch

**Fix:** Update booking modal to use correct vendor ID:
```typescript
// In BookingRequestModal.tsx, check:
console.log('🔍 Vendor ID being used:', service.vendorId);
```

---

### Issue 2: Date Format Mismatch

**Problem:** Dates stored in different format  
**Check:**
```sql
-- Run in Neon SQL Editor
SELECT 
  id,
  event_date,
  TO_CHAR(event_date, 'YYYY-MM-DD') as formatted_date
FROM bookings 
LIMIT 5;
```

**Expected:** `2025-11-15` (YYYY-MM-DD)  
**If you see:** Different format → Date comparison failing

**Fix:** Already handled in `availabilityService.ts` line 205:
```typescript
const bookingDate = booking.event_date?.split('T')[0]; // Get YYYY-MM-DD part
return bookingDate === date;
```

---

### Issue 3: API Endpoint Not Working

**Problem:** Vendor bookings endpoint returning wrong data  
**Test:**

```bash
# Test API directly
curl https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-001
```

**Expected Response:**
```json
{
  "success": true,
  "bookings": [...],
  "count": 5
}
```

**If error:** Check Render logs for backend issues

---

### Issue 4: Frontend Not Calling Availability Check

**Problem:** Modal not checking availability before submit  
**Debug:**

Add this to `BookingRequestModal.tsx` line 659:
```typescript
console.log('🔍 [DEBUG] Checking availability for:', {
  date: submissionData.eventDate,
  vendorId: service.vendorId
});

const isAvailable = await checkAvailabilityBeforeBooking(submissionData.eventDate, service.vendorId);

console.log('🔍 [DEBUG] Availability result:', isAvailable);
```

---

## 🧪 Quick Test Procedure

### Test Case: Book a Date That Already Has a Booking

1. **Find existing booking date:**
   ```javascript
   fetch('https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-001')
     .then(r => r.json())
     .then(d => console.log('Booked dates:', d.bookings.map(b => b.event_date)));
   ```

2. **Try to book same date:**
   - Go to service booking form
   - Select the same date
   - Fill in other fields
   - Submit

3. **Expected Result:**
   - ❌ Error message: "This date is not available"
   - ❌ Booking blocked
   - ℹ️ Shows: "Already booked (1 confirmed booking)"

4. **If booking goes through:**
   - ⚠️ Availability check is not working

---

## 🔧 Common Issues & Fixes

### Issue: "Available" for date that has booking

**Cause 1: Status Not Recognized**

Check booking statuses in database:
```sql
SELECT DISTINCT status FROM bookings;
```

If you see statuses not in this list:
- `confirmed`
- `paid_in_full`
- `fully_paid`  
- `completed`
- `approved`
- `downpayment_paid`
- `deposit_paid`

**Fix:** Update `availabilityService.ts` line 221:
```typescript
const confirmedBookings = bookingsOnDate.filter((booking: any) => 
  booking.status === 'confirmed' || 
  booking.status === 'paid_in_full' || 
  booking.status === 'fully_paid' ||
  booking.status === 'completed' ||
  booking.status === 'approved' ||
  booking.status === 'downpayment_paid' ||
  booking.status === 'deposit_paid' ||
  booking.status === 'YOUR_NEW_STATUS_HERE' // Add new status
).length;
```

---

**Cause 2: Vendor ID Not Matching**

Check vendor IDs:
```sql
SELECT 
  b.vendor_id as booking_vendor_id,
  vp.id as profile_vendor_id
FROM bookings b
JOIN vendor_profiles vp ON b.vendor_id = vp.id
LIMIT 5;
```

If IDs don't match → Update booking vendor_id to match vendor_profiles.id

---

**Cause 3: Date in Past**

Availability service might filter out past dates.

Check `availabilityService.ts` for date validation.

---

## 📊 Debugging with Browser Console

### Open Browser Console (F12)

Run these commands while on the booking page:

```javascript
// 1. Check if availabilityService is loaded
console.log('Service loaded?', typeof availabilityService);

// 2. Get vendor ID from current service
const service = document.querySelector('[data-vendor-id]')?.dataset.vendorId;
console.log('Vendor ID:', service);

// 3. Check a specific date
const result = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-001');
const data = await result.json();
console.table(data.bookings.map(b => ({
  date: b.event_date,
  status: b.status,
  couple: b.couple_name
})));
```

---

## 🚀 Expected Behavior

### When Date Has Confirmed Booking:
```
✅ Availability Check:
{
  isAvailable: false,
  reason: "Already booked (1 confirmed booking)",
  bookingStatus: "fully_booked",
  currentBookings: 1,
  maxBookingsPerDay: 1
}

✅ User sees:
"This date (November 15, 2025) is not available. Already booked (1 confirmed booking) (1/1 bookings)"

✅ Submit button: Disabled or blocked
```

### When Date Has Pending Request:
```
✅ Availability Check:
{
  isAvailable: true,
  reason: "Available with 1 pending request",
  bookingStatus: "booked",
  currentBookings: 1,
  maxBookingsPerDay: 1
}

✅ User sees:
✓ Can book (with warning about pending request)
```

### When Date is Free:
```
✅ Availability Check:
{
  isAvailable: true,
  reason: "Available for booking",
  bookingStatus: "available",
  currentBookings: 0,
  maxBookingsPerDay: 1
}

✅ User sees:
✓ Can book freely
```

---

## 🔍 Live Testing Steps

1. **Open Two Browser Windows:**
   - Window 1: Vendor account
   - Window 2: Couple account

2. **Window 1 (Vendor):**
   - Check existing bookings
   - Note dates that are booked

3. **Window 2 (Couple):**
   - Try to book same date
   - Should be blocked if already booked

4. **Check Browser Console:**
   - Look for availability check logs
   - Verify API calls are made

---

## 📝 Quick Fix if Not Working

If availability check is not preventing double bookings:

**Temporary Fix - Add Debug Logging:**

Edit `src/modules/services/components/BookingRequestModal.tsx` line 607:

```typescript
const checkAvailabilityBeforeBooking = useCallback(async (date: string, vendorId: string): Promise<boolean> => {
  try {
    console.log('🔍 [AVAILABILITY CHECK] Starting check:', { date, vendorId });
    
    const availabilityCheck = await availabilityService.checkAvailability(vendorId, date);
    
    console.log('🔍 [AVAILABILITY CHECK] Result:', availabilityCheck);
    
    if (!availabilityCheck.isAvailable) {
      console.log('❌ [AVAILABILITY CHECK] Date not available, blocking booking');
      // ...existing code...
    }
    
    console.log('✅ [AVAILABILITY CHECK] Date available, allowing booking');
    return true;
  } catch (error) {
    console.error('❌ [AVAILABILITY CHECK] Error:', error);
    // ...existing code...
  }
}, []);
```

Then check browser console when testing.

---

## 🎯 Next Steps

1. Run the browser console tests above
2. Check what data the API returns
3. Verify vendor IDs match between bookings and services
4. Check booking statuses in database
5. Add debug logging and test again

---

**Need help?** Share the console output and I'll help debug further!
