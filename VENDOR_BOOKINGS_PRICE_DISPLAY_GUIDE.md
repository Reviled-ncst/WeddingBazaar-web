# Vendor Bookings Price Display - Quick Reference

## 🎨 VISUAL GUIDE: Price Display Scenarios

---

### Scenario 1: **Full Price Range with Quote** ⭐ (Most Common)

**When**: Booking has `estimatedCostMin`, `estimatedCostMax`, and `totalAmount`

```
┌─────────────────────────────────────────────────┐
│ 💰 Price Breakdown                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Deposit Required:          ₱25,000              │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Price Range:                                    │
│ ₱50,000 - ₱75,000  ← Large, pink, bold         │
│                                                 │
│ Final quoted: ₱60,000  ← Small, gray, secondary │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Code Check**:
```typescript
if (estimatedCostMin > 0 || estimatedCostMax > 0) {
  // Show this scenario
}
```

---

### Scenario 2: **Client Budget Range** 💜 (No Vendor Quote Yet)

**When**: Booking has `budgetRange` but no estimated cost range

```
┌─────────────────────────────────────────────────┐
│ 💰 Price Breakdown                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Deposit Required:          ₱10,000              │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Client Budget:                                  │
│ $5,000 - $10,000  ← Large, purple, bold        │
│                                                 │
│ Your quote: ₱7,500  ← Small, gray, secondary   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Code Check**:
```typescript
else if (budgetRange && budgetRange.trim() !== '') {
  // Show this scenario
}
```

---

### Scenario 3: **Single Amount Only** 💸 (Confirmed/Simple Quote)

**When**: Booking has only `totalAmount`, no ranges

```
┌─────────────────────────────────────────────────┐
│ 💰 Price Breakdown                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Deposit Required:          ₱20,000              │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Agreed Amount:  ← Status-based label            │
│ ₱50,000  ← Large, pink, bold                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Code Check**:
```typescript
else {
  // Show this scenario
  // Label: "Agreed Amount" if confirmed, "Amount" otherwise
}
```

---

### Scenario 4: **No Pricing Yet** 📝 (New Request)

**When**: Booking has no price information set

```
┌─────────────────────────────────────────────────┐
│ 💰 Price Breakdown                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Amount:                                         │
│ TBD  ← Large, pink, bold                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Code Check**:
```typescript
else {
  // totalAmount is 0 or undefined
  // Show "TBD"
}
```

---

## 🔄 STATUS-BASED LABEL CHANGES

### For Confirmed Bookings:
- "Price Range" → **"Agreed Price Range"**
- "Amount" → **"Agreed Amount"**

### For Other Statuses:
- Default labels: "Price Range", "Amount", "Client Budget"

---

## 🎯 FIELD MAPPING

| Display Label | Backend Field | Type | Example |
|--------------|--------------|------|---------|
| **Price Range** | `estimatedCostMin` + `estimatedCostMax` | number | ₱50,000 - ₱75,000 |
| **Client Budget** | `budgetRange` | string | "$5,000 - $10,000" |
| **Amount** | `totalAmount` | number | ₱60,000 |
| **Deposit** | `depositAmount` | number | ₱25,000 |
| **Final quoted** | `totalAmount` (when range exists) | number | ₱60,000 |
| **Your quote** | `totalAmount` (when budget exists) | number | ₱7,500 |

---

## 📊 DISPLAY HIERARCHY

```
Priority 1: estimatedCostMin & estimatedCostMax
    ↓ (if not available)
Priority 2: budgetRange
    ↓ (if not available)
Priority 3: totalAmount
    ↓ (if zero or undefined)
Fallback: "TBD"
```

---

## 🎨 COLOR SCHEME

| Element | Color Class | Color | Usage |
|---------|------------|-------|-------|
| Estimated Price Range | `text-pink-600` | Pink | Primary price display |
| Client Budget | `text-purple-600` | Purple | Client's expectation |
| Single Amount | `text-pink-600` | Pink | Fallback pricing |
| Deposit | `text-orange-600` | Orange | Required deposit |
| Secondary Info | `text-gray-500` | Gray | Supporting quotes |
| Labels | `text-gray-700` | Dark Gray | Field labels |

---

## 🧪 TESTING CHECKLIST

### Test Data Scenarios:

```javascript
// ✅ Test 1: Full range with all fields
const booking1 = {
  estimatedCostMin: 50000,
  estimatedCostMax: 75000,
  totalAmount: 60000,
  depositAmount: 25000,
  budgetRange: "$5,000 - $10,000",
  status: "confirmed"
};
// Expected: Shows "Agreed Price Range: ₱50,000 - ₱75,000"
//           With "Final quoted: ₱60,000" below

// ✅ Test 2: Budget range only
const booking2 = {
  budgetRange: "$2,500 - $5,000",
  totalAmount: 3500,
  depositAmount: 1000,
  status: "quote_sent"
};
// Expected: Shows "Client Budget: $2,500 - $5,000"
//           With "Your quote: ₱3,500" below

// ✅ Test 3: Single amount, confirmed
const booking3 = {
  totalAmount: 50000,
  depositAmount: 20000,
  status: "confirmed"
};
// Expected: Shows "Agreed Amount: ₱50,000"

// ✅ Test 4: New request, no pricing
const booking4 = {
  totalAmount: 0,
  status: "request"
};
// Expected: Shows "Amount: TBD"

// ✅ Test 5: Range but no total
const booking5 = {
  estimatedCostMin: 30000,
  estimatedCostMax: 50000,
  totalAmount: 0,
  status: "pending_review"
};
// Expected: Shows "Price Range: ₱30,000 - ₱50,000"
//           No "Final quoted" line

// ✅ Test 6: Edge case - zero range
const booking6 = {
  estimatedCostMin: 0,
  estimatedCostMax: 0,
  budgetRange: "",
  totalAmount: 0
};
// Expected: Shows "Amount: TBD"
```

---

## 🔧 DEVELOPER NOTES

### Key Implementation Points:

1. **Always check for > 0 values**:
   ```typescript
   if (estimatedCostMin > 0 || estimatedCostMax > 0)
   ```
   - Prevents showing "₱0 - ₱0"

2. **Trim budget range strings**:
   ```typescript
   if (budgetRange && budgetRange.trim() !== '')
   ```
   - Prevents showing empty budget ranges

3. **Conditional secondary info**:
   ```typescript
   {booking.totalAmount > 0 && (
     <p>Final quoted: ₱{booking.totalAmount.toLocaleString()}</p>
   )}
   ```
   - Only shows when amount exists

4. **Status-based labels**:
   ```typescript
   {booking.status === 'confirmed' ? 'Agreed Price Range' : 'Price Range'}
   ```
   - Changes label based on booking status

### Common Pitfalls:

❌ **Don't** show "₱0" as a price:
```typescript
// Bad
<span>₱{booking.totalAmount.toLocaleString()}</span>

// Good
<span>{booking.totalAmount > 0 ? `₱${booking.totalAmount.toLocaleString()}` : 'TBD'}</span>
```

❌ **Don't** show empty ranges:
```typescript
// Bad
{booking.budgetRange && <div>{booking.budgetRange}</div>}

// Good
{booking.budgetRange && booking.budgetRange.trim() !== '' && 
  <div>{booking.budgetRange}</div>
}
```

✅ **Do** use `toLocaleString()` for numbers:
```typescript
// Good - adds commas
₱{booking.totalAmount.toLocaleString()}
// Result: ₱50,000 instead of ₱50000
```

---

## 📱 RESPONSIVE BEHAVIOR

### Desktop (md: breakpoint and above):
- Full price breakdown visible
- All labels and values aligned

### Mobile (sm: breakpoint and below):
- Price breakdown stacks vertically
- Font sizes remain readable (text-xl for main prices)
- Padding adjusts for smaller screens

---

## 🎯 USER EXPERIENCE GOALS

### What Vendors See Instantly:

1. **Price Range** (if available):
   - Immediate understanding of pricing flexibility
   - Clear negotiation window

2. **Client Budget** (if no range):
   - Client's expectations upfront
   - Context for pricing strategy

3. **Single Amount** (fallback):
   - Confirmed or quoted price
   - Simple, clear pricing

### Benefits:

✅ **Faster decision-making**: Vendors see pricing at a glance  
✅ **Better negotiation**: Clear range vs budget vs quote  
✅ **Reduced confusion**: Hierarchical display with clear labels  
✅ **Professional presentation**: Clean, modern pricing display  

---

**Last Updated**: January 2025  
**Status**: ✅ LIVE IN PRODUCTION  
**File**: `src/pages/users/vendor/bookings/VendorBookingsSecure.tsx`
