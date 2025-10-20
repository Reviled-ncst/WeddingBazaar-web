# Booking Display Debug Guide

## Issue Analysis from Screenshot

### Problems Observed:
1. ✅ **Quote Status Working**: One booking shows "Quote Received" (purple badge)
2. ❌ **Date Truncated**: Shows "Thursday, Octob..." instead of full date
3. ❌ **Location Issues**: Shows "TBD" or truncated addresses
4. ✅ **Amounts Showing**: All show ₱45,000 correctly
5. ❌ **Progress Inconsistent**: 40% vs 20% - should reflect quote acceptance

### Most Likely Issues:

#### 1. EnhancedBookingCard Display Width
**File**: `src/shared/components/bookings/EnhancedBookingCard.tsx`
**Problem**: Text truncation in card layout

**Solution**: Check CSS classes for:
```tsx
// Look for these classes that might truncate:
className="truncate"  // Cuts off text with ...
className="overflow-hidden"  // Hides overflow
className="max-w-[...]"  // Limits width
```

#### 2. Data Not Flowing to Card Component
**Problem**: Enhanced fields not passed to EnhancedBookingCard

**Check in IndividualBookings.tsx**:
```tsx
<EnhancedBookingList
  bookings={bookings.map(booking => ({
    ...booking,
    // Are these being passed?
    formattedEventDate: booking.formattedEventDate,  // Should be "Thursday, October 30, 2025"
    eventLocation: booking.eventLocation,  // Should be full address
  }))}
/>
```

#### 3. Quote Data Not Parsed
**Problem**: Quote JSON not extracted from notes field

**Debug Steps**:
1. Open browser console (F12)
2. Look for: `🔄 [BookingMapping] Quote parsed successfully:`
3. If not found, the quote parsing failed

## Quick Diagnostic Commands

### Check Browser Console:
```javascript
// Paste this in browser console to see booking data:
console.log('Current bookings:', window.__BOOKINGS_DEBUG__);

// Or add this to IndividualBookings.tsx temporarily:
useEffect(() => {
  window.__BOOKINGS_DEBUG__ = bookings;
  console.log('📊 BOOKING DEBUG:', bookings.map(b => ({
    id: b.id,
    formattedDate: b.formattedEventDate,
    location: b.eventLocation,
    amount: b.totalAmount,
    hasQuote: b.hasQuote,
    status: b.status
  })));
}, [bookings]);
```

### Check Backend Response:
```javascript
// In IndividualBookings.tsx loadBookings function:
console.log('🔥 RAW BACKEND:', response.bookings[0]);
```

## Expected vs Actual Data

### Expected Format (After Mapping):
```json
{
  "id": "1760918159",
  "formattedEventDate": "Thursday, October 30, 2025",
  "formattedEventTime": "11:11 AM",
  "eventLocation": "Athens Street, Castille Bellazona, Molino, Bacoor, Cavite",
  "totalAmount": 44802.24,
  "hasQuote": true,
  "status": "quote_sent",
  "progress": 40
}
```

### Actual (From Screenshot):
```json
{
  "formattedEventDate": "Thursday, Octob..." (TRUNCATED),
  "eventLocation": "TBD" or truncated,
  "totalAmount": 45000,
  "status": "quote_received" or "quote_requested"
}
```

## Immediate Fixes Needed

### Fix 1: Remove Text Truncation
**File**: `src/shared/components/bookings/EnhancedBookingCard.tsx`

Find and update:
```tsx
// Change FROM:
<p className="text-sm text-gray-600 truncate">{booking.formattedEventDate}</p>

// Change TO:
<p className="text-sm text-gray-600">{booking.formattedEventDate}</p>
```

### Fix 2: Use Full Location
```tsx
// Change FROM:
<p className="text-sm text-gray-600 truncate">{booking.eventLocation}</p>

// Change TO:
<p className="text-sm text-gray-600 line-clamp-2">{booking.eventLocation}</p>
// line-clamp-2 shows 2 lines instead of cutting off
```

### Fix 3: Debug Logging
Add to IndividualBookings.tsx after mapping:

```typescript
console.log('🐛 [DEBUG] Mapped booking sample:', {
  id: enhancedBookings[0]?.id,
  formattedEventDate: enhancedBookings[0]?.formattedEventDate,
  eventLocation: enhancedBookings[0]?.eventLocation,
  totalAmount: enhancedBookings[0]?.totalAmount,
  hasQuote: enhancedBookings[0]?.hasQuote,
  quoteData: enhancedBookings[0]?.quoteData,
  status: enhancedBookings[0]?.status
});
```

## Files to Check

1. **EnhancedBookingCard.tsx** - Check for `truncate` classes
2. **IndividualBookings.tsx** - Verify data mapping includes all fields
3. **booking-data-mapping.ts** - Verify formatted fields are created
4. Browser Console - Check for parsing errors

## Action Items

- [ ] Check EnhancedBookingCard for truncation classes
- [ ] Add debug logging to see actual data
- [ ] Verify formattedEventDate is being created
- [ ] Verify eventLocation has full address
- [ ] Check quote parsing logs in console
- [ ] Verify progress calculation based on quote acceptance

## Next Steps

1. **Open browser console (F12)**
2. **Look for logs starting with**:
   - `🔄 [BookingMapping]`
   - `🔄 [IndividualBookings]`
   - `✅ [IndividualBookings] Bookings loaded`
3. **Copy/paste any errors or the booking data**
4. **I'll provide specific fixes based on what we see**
