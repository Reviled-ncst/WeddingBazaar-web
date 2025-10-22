# 🎯 CALENDAR RED DATES TEST - STEP-BY-STEP GUIDE

## Current Status: ✅ CALENDAR IS WORKING!

Your console logs prove the calendar is **fully functional**:
```
✅ [BookingCalendar] Loaded availability for 42 dates
📅 [AvailabilityService] Retrieved 0 bookings for date range
```

**Why all dates are green?** → Vendor ID "2" has **0 confirmed bookings** in database.

---

## 🧪 TEST PROCEDURE

### Step 1: Run SQL to Create Test Bookings

1. **Open Neon SQL Editor**: https://console.neon.tech
2. **Select your database**: `weddingbazaar` project
3. **Copy and paste** the SQL from `TEST_CALENDAR_RED_DATES.sql`
4. **Click "Run"** to execute

This will create 3 test bookings:
- **October 28, 2025** → Status: `confirmed` → Will show **RED**
- **October 30, 2025** → Status: `paid_in_full` → Will show **RED**
- **November 5, 2025** → Status: `confirmed` → Will show **RED**

### Step 2: Refresh the Calendar

**Option A: Close and Reopen Modal**
1. Click the **X** button to close booking modal
2. Click **"Book Now"** again on the Baker service
3. Calendar will reload with fresh data

**Option B: Hard Refresh Page**
1. Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
2. Navigate back to Services
3. Click **"Book Now"** on Baker service

### Step 3: Verify Red Dates Appear

You should now see:

```
OCTOBER 2025 CALENDAR:
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│ ... │ ... │ ... │ ... │ ... │ ... │ ... │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│ 26  │ 27  │ 28  │ 29  │ 30  │ 31  │  1  │
│ 🟢  │ 🟢  │ 🔴  │ 🟢  │ 🔴  │ 🟢  │ 🟢  │
│  ✓  │  ✓  │  ✗  │  ✓  │  ✗  │  ✓  │  ✓  │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┘

NOVEMBER 2025 CALENDAR:
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│ ... │  3  │  4  │  5  │  6  │  7  │  8  │
│ ... │ 🟢  │ 🟢  │ 🔴  │ 🟢  │ 🟢  │ 🟢  │
│ ... │  ✓  │  ✓  │  ✗  │  ✓  │  ✓  │  ✓  │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┘

Legend:
🟢 = Available (Green background, checkmark icon)
🔴 = Unavailable (Red background, X icon)
```

### Step 4: Test Clicking Red Dates

1. **Try clicking October 28** (red date)
   - ✅ Should be **disabled** (cursor shows "not-allowed")
   - ✅ Nothing should happen
   
2. **Try clicking October 27** (green date)
   - ✅ Should **highlight** with blue ring
   - ✅ Form input should **update** with "2025-10-27"
   - ✅ Green checkmark appears: "This date is available"

### Step 5: Check Browser Console

You should see these logs:

```javascript
// When calendar loads
📅 [BookingCalendar] Loading availability for: {vendorId: "2", ...}
📅 [AvailabilityService] Retrieved 3 bookings for date range
✅ [BookingCalendar] Loaded availability for 42 dates

// When you click a date
// (Available date - SUCCESS)
✅ Date selected: 2025-10-27
✅ Availability: true

// (Unavailable date - BLOCKED)
⚠️ Cannot select unavailable date: 2025-10-28
```

---

## 🎯 EXPECTED BEHAVIOR

### ✅ Red Dates (Unavailable):
- Background: **Red (#FEE2E2)** with red border
- Icon: **X mark** (XCircle)
- Cursor: **not-allowed** (disabled)
- Click: **No action** (blocked)
- Hover: **No scale effect**

### ✅ Green Dates (Available):
- Background: **Green (#DCFCE7)** with green border
- Icon: **Checkmark** (CheckCircle)
- Cursor: **pointer** (clickable)
- Click: **Selects date** and updates form
- Hover: **Scale 1.05** (grows slightly)

### ✅ Gray Dates (Past):
- Background: **Gray (#F3F4F6)**
- Icon: **X mark**
- Cursor: **not-allowed** (disabled)
- Text: **Faded** (opacity 50%)

---

## 🐛 TROUBLESHOOTING

### Issue: Still showing all green after SQL

**Solution 1: Clear Cache**
```javascript
// In browser console (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**Solution 2: Wait 60 Seconds**
- The availability service has a **1-minute cache**
- Wait 60 seconds, then close and reopen modal

**Solution 3: Check Network Tab**
1. Open DevTools (F12) → Network tab
2. Close and reopen booking modal
3. Look for: `GET /api/bookings/vendor/2?startDate=...`
4. Check response → Should show 3 bookings in JSON

### Issue: SQL fails with "column does not exist"

**Check vendor_id format**:
```sql
-- Try both formats
SELECT * FROM vendors WHERE id = '2';
SELECT * FROM vendors WHERE id = '2-2025-001';

-- Use the one that returns a result
```

### Issue: Red dates appear but clicking them selects them

**This means the click handler isn't checking availability**
- Check console for errors
- Verify `day.availability?.isAvailable` is false
- Check `disabled` attribute on button

---

## 📊 VERIFICATION CHECKLIST

After running the test, verify:

- [ ] ✅ SQL executed without errors
- [ ] ✅ 3 bookings created in database
- [ ] ✅ Modal closed and reopened
- [ ] ✅ Console shows "Retrieved 3 bookings"
- [ ] ✅ October 28 is RED with X icon
- [ ] ✅ October 30 is RED with X icon
- [ ] ✅ November 5 is RED with X icon
- [ ] ✅ Clicking red dates does nothing
- [ ] ✅ Clicking green dates selects them
- [ ] ✅ Selected date shows in form input
- [ ] ✅ Legend shows color meanings

---

## 🎉 SUCCESS CRITERIA

You'll know it's working when:

1. **Visual Confirmation**:
   - See red cells in calendar on Oct 28, 30, and Nov 5
   - See X icons on red dates
   - See green checkmarks on available dates

2. **Interaction Confirmation**:
   - Cannot click red dates (cursor shows not-allowed)
   - Can click green dates (highlights and updates form)

3. **Console Confirmation**:
   - Logs show "Retrieved 3 bookings for date range"
   - Logs show "Loaded availability for 42 dates"

---

## 🧹 CLEANUP

After testing, remove test bookings:

```sql
DELETE FROM bookings WHERE booking_reference LIKE 'TEST-RED-%';
```

---

## 📝 NOTES

- **Cache Duration**: 1 minute - changes may take up to 60s to appear
- **Vendor ID**: Your logs show vendor "2" (or "2-2025-001")
- **Date Format**: Must be `YYYY-MM-DD` in database
- **Status**: Must be `confirmed`, `paid_in_full`, etc. (not `pending`)

---

**Created**: October 22, 2025
**Test URL**: http://localhost:5174/ → Services → Baker → Book Now
**Expected Result**: Red dates on Oct 28, 30, and Nov 5
