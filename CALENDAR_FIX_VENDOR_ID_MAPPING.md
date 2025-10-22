# 🔍 API Test - Check Why Calendar Isn't Showing Red Dates

## Problem Identified:
- Bookings JSON shows vendor_id: `"2-2025-001"`
- Frontend logs show it's calling API with vendor_id: `"2"`
- API returns 0 bookings (mismatch!)

## Test the API Directly:

### Test 1: Check with vendor ID "2"
```bash
curl "https://weddingbazaar-web.onrender.com/api/bookings/vendor/2?startDate=2025-10-01&endDate=2025-11-30"
```

Expected: **0 bookings** (wrong vendor ID)

### Test 2: Check with vendor ID "2-2025-001"
```bash
curl "https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-001?startDate=2025-10-01&endDate=2025-11-30"
```

Expected: **10 bookings** (correct vendor ID!)

---

## 🔧 Solution: Fix Vendor ID Mapping in Frontend

The issue is in `availabilityService.ts` - it's mapping `"2-2025-001"` → `"2"`, but the database has `"2-2025-001"`.

### Fix: Remove the incorrect mapping

**File**: `src/services/availabilityService.ts`
**Line**: 161-170

**Change this**:
```typescript
private mapVendorIdForBookings(vendorId: string): string {
  // If vendor ID starts with "2-2025-", map it to "2" where the booking data exists
  if (vendorId.startsWith('2-2025-')) {
    silent.info(`🔧 [AvailabilityService] Mapping vendor ID ${vendorId} -> 2 for booking data`);
    return '2';  // ❌ WRONG - bookings have "2-2025-001"
  }
  
  return vendorId;
}
```

**To this**:
```typescript
private mapVendorIdForBookings(vendorId: string): string {
  // Return vendor ID as-is - no mapping needed
  return vendorId;  // ✅ CORRECT - use "2-2025-001"
}
```

---

## 📊 Quick Verification

After the fix, you should see:

**Console logs**:
```javascript
🔧 [AvailabilityService] Original vendor ID: 2-2025-001
🔧 [AvailabilityService] Mapped vendor ID: 2-2025-001  // No longer "2"
📅 [AvailabilityService] Retrieved 10 bookings for date range  // Not "0"!
```

**Calendar**:
- October 21 = **RED** (3 bookings)
- October 22 = **RED** (2 bookings)
- October 24 = **RED** (2 bookings)
- October 28 = **RED** (1 booking)
- October 30 = **RED** (2 bookings)

---

## ⚡ Apply the Fix Now:

Run this command in your project:
```bash
# Edit the availability service
code src/services/availabilityService.ts
```

Then change line 164-166 to just:
```typescript
return vendorId;
```

Save, and the calendar will immediately start showing red dates! 🎉
