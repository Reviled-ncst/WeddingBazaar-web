# 🔍 Availability Calendar Not Showing Booked Dates - Diagnostic Report

**Date:** October 29, 2025  
**Issue:** Booking availability calendar is not displaying dates with existing bookings as unavailable

---

## 📊 Current Database State

### Confirmed Bookings in Database:
```sql
Vendor ID: 2-2025-001
  - 2025-10-27 | Status: completed
  - 2025-10-29 | Status: completed  
  - 2025-10-30 | Status: downpayment
  - 2025-11-01 | Status: fully_paid
  - 2222-02-21 | Status: downpayment (invalid date)
```

**Expected Behavior:** Dates 2025-10-27, 10-29, 10-30, and 11-01 should show as **unavailable** (red) in the calendar.

---

## 🔧 System Architecture

### 1. Frontend Calendar Component
**File:** `src/shared/components/calendar/BookingAvailabilityCalendar.tsx`

```typescript
// Loads availability data for current month
const loadAvailabilityData = async () => {
  const availabilityMap = await availabilityService.checkAvailabilityRange(
    vendorId, 
    startDate, 
    endDate, 
    serviceId
  );
  setAvailabilityData(availabilityMap);
};
```

### 2. Availability Service
**File:** `src/services/availabilityService.ts`

```typescript
// Bulk check using vendor bookings API
async checkAvailabilityRange(vendorId, startDate, endDate, serviceId) {
  // 1. Fetch bookings: /api/bookings/vendor/{vendorId}?startDate=...&endDate=...
  // 2. Filter by date and service (if provided)
  // 3. Count confirmed vs pending bookings
  // 4. Return availability map
}
```

### 3. Backend API
**File:** `backend-deploy/routes/bookings.cjs`

```javascript
// GET /api/bookings/vendor/:vendorId
router.get('/vendor/:vendorId', async (req, res) => {
  const { vendorId } = req.params;
  const { startDate, endDate } = req.query;
  
  // Fetch bookings from database
  const bookings = await sql`
    SELECT * FROM bookings
    WHERE vendor_id = ${vendorId}
    ${startDate ? sql`AND event_date >= ${startDate}` : sql``}
    ${endDate ? sql`AND event_date <= ${endDate}` : sql``}
  `;
  
  res.json({ bookings });
});
```

---

## 🐛 Potential Issues

### Issue 1: Vendor ID Mismatch
**Problem:** Frontend may be passing wrong vendor ID format

**Check:**
- Service card shows: `vendorId="2-2025-001"`
- Database has: `vendor_id="2-2025-001"`
- API expects: `2-2025-001`

**Solution:** Verify vendor ID is passed correctly from service card to calendar

### Issue 2: Service ID Filtering
**Problem:** Calendar may be filtering by service ID when it shouldn't

**Check:**
- If `serviceId` is passed, only bookings for THAT specific service show as unavailable
- Other bookings for same vendor/date won't block the calendar

**Solution:** 
- Option A: Don't pass serviceId to show ALL vendor bookings as unavailable
- Option B: Pass correct service ID (`SRV-0001` or `SRV-0002`)

### Issue 3: Status Filtering
**Problem:** Not recognizing all confirmed booking statuses

**Current Logic:**
```typescript
const confirmedBookings = dateBookings.filter(booking => 
  booking.status === 'confirmed' || 
  booking.status === 'paid_in_full' || 
  booking.status === 'fully_paid' ||
  booking.status === 'completed' ||
  booking.status === 'approved' ||
  booking.status === 'downpayment_paid' ||
  booking.status === 'deposit_paid' ||
  booking.status === 'downpayment' // RECENTLY ADDED
).length;
```

**Database Statuses:** `completed`, `fully_paid`, `downpayment`

**Verdict:** ✅ All statuses should be recognized

### Issue 4: Cache Issues
**Problem:** Calendar is using cached (old) availability data

**Cache Duration:** 60 seconds (1 minute)

**Solution:** Force cache clear or wait 60 seconds after creating booking

### Issue 5: API Not Being Called
**Problem:** Fetch request may be failing silently

**Check:**
- Browser console for errors
- Network tab for API calls
- API response status and data

---

## 🔬 Diagnostic Steps

### Step 1: Open Test Page
Open `test-availability-api.html` in browser and run all 4 tests:

1. ✅ **Test 1:** Verify vendor bookings API returns data
2. ✅ **Test 2:** Verify logic correctly identifies booked date (2025-10-29)
3. ✅ **Test 3:** Verify logic correctly identifies available date (2025-12-25)
4. ✅ **Test 4:** Simulate frontend service logic

### Step 2: Browser Console Debugging

Open calendar and check console for:

```javascript
// Look for these log messages
"📅 [BookingCalendar] Loading availability for: {vendorId, serviceId, startStr, endStr}"
"✅ [BookingCalendar] Loaded availability for X dates"
"❌ [BookingCalendar] Error loading availability"

// Manual check in console:
fetch('https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-001')
  .then(r => r.json())
  .then(data => console.log(data.bookings));
```

### Step 3: Check Service Props

In `BookingRequestModal.tsx`, verify:

```typescript
<BookingAvailabilityCalendar
  vendorId={service?.vendorId}  // Should be "2-2025-001"
  serviceId={service?.id}        // Optional: "SRV-0001" or undefined
  selectedDate={formData.eventDate}
  onDateSelect={...}
/>
```

### Step 4: Network Tab Inspection

1. Open DevTools → Network tab
2. Filter: `bookings`
3. Create booking modal
4. Look for: `GET /api/bookings/vendor/2-2025-001`
5. Check response has bookings array

---

## 🛠️ Fixes to Apply

### Fix 1: Add Debug Logging (Temporary)

**File:** `src/services/availabilityService.ts`

```typescript
private async checkAvailabilityBulk(...) {
  const bookingsUrl = `${this.apiUrl}/api/bookings/vendor/${bookingVendorId}?startDate=${startDate}&endDate=${endDate}`;
  
  // ADD THIS:
  console.log('🔍 Fetching bookings:', {
    url: bookingsUrl,
    vendorId: bookingVendorId,
    dateRange: { startDate, endDate },
    serviceId
  });
  
  const response = await fetch(bookingsUrl);
  const data = await response.json();
  const bookings = data.bookings || [];
  
  // ADD THIS:
  console.log('📊 Received bookings:', {
    total: bookings.length,
    dates: [...new Set(bookings.map(b => b.event_date?.split('T')[0]))]
  });
  
  // ... rest of logic
}
```

### Fix 2: Ensure Vendor ID Format

**File:** `src/modules/services/components/BookingRequestModal.tsx`

```typescript
// Before passing to calendar, log the vendor ID
useEffect(() => {
  if (isOpen && service?.vendorId) {
    console.log('🏢 Service Vendor ID:', service.vendorId);
    console.log('📦 Service ID:', service.id);
  }
}, [isOpen, service]);
```

### Fix 3: Don't Filter by Service ID (Option A)

**File:** `src/modules/services/components/BookingRequestModal.tsx`

```typescript
<BookingAvailabilityCalendar
  vendorId={service?.vendorId}
  serviceId={undefined}  // Don't filter - show ALL vendor bookings
  selectedDate={formData.eventDate}
  onDateSelect={...}
/>
```

**Rationale:** A vendor can only serve ONE wedding per day, regardless of which service package

### Fix 4: Clear Cache After Booking

**File:** `src/modules/services/components/BookingRequestModal.tsx`

```typescript
const processBookingSubmission = async (submissionData: any) => {
  // ... existing code ...
  
  const createdBooking = await centralizedBookingAPI.createBooking(comprehensiveBookingRequest);
  
  if (createdBooking.success) {
    // ADD THIS: Clear availability cache
    // This ensures calendar refreshes on next view
    if (window.sessionStorage) {
      const cacheKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('availability') || key.includes(service.vendorId)
      );
      cacheKeys.forEach(key => sessionStorage.removeItem(key));
    }
    
    setSuccessBookingData(createdBooking);
    setShowSuccessModal(true);
  }
};
```

---

## ✅ Expected Outcomes

After fixes:

1. **Open booking modal** → Calendar loads
2. **Console shows:** `"🔍 Fetching bookings: ..."` with correct vendor ID
3. **Console shows:** `"📊 Received bookings: { total: 5, dates: [...] }"`
4. **Calendar displays:**
   - 🔴 Red dates: 2025-10-27, 10-29, 10-30, 11-01
   - 🟢 Green dates: All other future dates
5. **Hover over red date:** Shows "Fully booked (1 confirmed)" or similar
6. **Click red date:** Error message appears

---

## 📝 Testing Checklist

- [ ] Run `test-availability-api.html` - all 4 tests pass
- [ ] Open booking modal - console shows vendor ID
- [ ] Calendar makes API call - Network tab shows request
- [ ] API returns bookings - Response has array
- [ ] Red dates appear - Known booked dates are red
- [ ] Green dates work - Can click available dates
- [ ] Create booking - New date becomes red after booking
- [ ] Cache clears - Refresh shows updated availability

---

## 🚀 Quick Test Command

```powershell
# 1. Check database has bookings
node check-booking-dates.cjs

# 2. Test API directly
curl https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-001

# 3. Open test page
start test-availability-api.html

# 4. Check live calendar
npm run dev
# Navigate to service and open booking modal
```

---

## 📞 Next Steps

1. **Run diagnostics** using test-availability-api.html
2. **Check browser console** for fetch errors
3. **Apply Fix 3** (don't filter by service ID)
4. **Add debug logging** (Fix 1) to trace execution
5. **Test live** by opening booking modal
6. **Report results** with screenshots of:
   - Console logs
   - Network tab
   - Calendar with red dates (or lack thereof)
