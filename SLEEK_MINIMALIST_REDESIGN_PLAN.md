# 🎨 SLEEK MINIMALIST REDESIGN - ServicePreview

## 📋 USER FEEDBACK

**Issue**: Current design is too colorful (purple/pink overload) and doesn't properly utilize service availability data.

**Request**: Create a **sleek, professional, minimalist design** that:
1. Uses availability data from the calendar
2. Has a clean, modern aesthetic (not overly colorful)
3. Follows Apple/Airbnb design principles
4. Prioritizes white space and typography

---

## 🎯 NEW DESIGN PHILOSOPHY

### Color Palette (Minimalist)
```
Primary Background: White (#FFFFFF)
Secondary Background: Light Gray (gray-50, gray-100)
Text: Dark Gray (gray-900, gray-700, gray-500)
Accent: Single color only (rose-500 for CTAs)
Borders: Subtle gray-200
```

### Key Principles
1. **White Space is King**: Generous padding and margins
2. **Typography Hierarchy**: Clear, readable fonts
3. **Subtle Shadows**: Soft, minimal shadows
4. **Single Accent Color**: Rose for CTAs only
5. **Clean Lines**: Sharp, minimal borders
6. **Availability Integration**: Use calendar data properly

---

## 🔧 IMPLEMENTATION PLAN

### 1. Header (Minimalist)
```tsx
✅ White background with subtle border
✅ Clean back button (no gradient)
✅ Simple copy/share buttons
✅ Minimal dropdown design
```

### 2. Hero Section (Clean Gallery)
```tsx
✅ Large, clean image display
✅ Simple thumbnail carousel
✅ Minimal badges (no flashy colors)
✅ Clean image counter
```

### 3. Service Info Card (Professional)
```tsx
✅ White card with subtle shadow
✅ Clean typography hierarchy
✅ Simple badges (text only, minimal color)
✅ Clear price display (no fancy gradients)
✅ Clean rating display
✅ **AVAILABILITY STATUS** (from calendar):
   - Show current availability
   - Link to calendar
   - Display booked dates count
```

### 4. Description Section
```tsx
✅ Clean white card
✅ Simple header
✅ Readable paragraph text
✅ Proper line height
```

### 5. Wedding Styles & Specialties
```tsx
✅ Simple pill badges
✅ Minimal color (gray background)
✅ Clean layout
```

### 6. **Availability Section** (NEW - PRIORITY)
```tsx
✅ Prominent availability card
✅ Calendar integration
✅ Show next available date
✅ Display booked/blocked dates
✅ Quick booking CTA
```

---

## 📊 AVAILABILITY DATA INTEGRATION

### From Calendar Component
```typescript
interface AvailabilityData {
  availableDates: Date[];
  bookedDates: Date[];
  blockedDates: Date[];
  nextAvailableDate: Date | null;
  bookingRate: number; // Percentage of booked days
}
```

### Display in Service Preview
```tsx
1. **Availability Badge**: 
   - "Available" (green)
   - "Busy" (yellow)
   - "Fully Booked" (red)

2. **Next Available Date**:
   - "Next available: October 25, 2025"

3. **Booking Indicators**:
   - "15 dates booked this month"
   - "High demand - Book early"

4. **Calendar Preview**:
   - Mini calendar showing availability
   - Click to view full calendar
```

---

## 🎨 SLEEK DESIGN EXAMPLES

### Header
```
┌─────────────────────────────────────┐
│ ← Back          Copy Link | Share   │
└─────────────────────────────────────┘
Clean, minimal, white background
```

### Service Card
```
┌───────────────────────────────────┐
│  Premium Photography               │
│                                    │
│  ₱50,000 - ₱100,000               │
│  ⭐ 4.8 (24 reviews)              │
│                                    │
│  ✓ Available Now                   │
│  📅 Next available: Oct 25, 2025  │
│                                    │
│  [ Book This Service ]             │
└───────────────────────────────────┘
White card, clean typography, single CTA
```

### Availability Section
```
┌───────────────────────────────────┐
│  Check Availability                │
│                                    │
│  📅 October 2025                   │
│  ┌─ Calendar Grid ─┐              │
│  │ Available dates │              │
│  │ Booked dates   │              │
│  └────────────────┘              │
│                                    │
│  Next available: Oct 25, 2025      │
│  15 dates booked this month        │
└───────────────────────────────────┘
Clean calendar integration
```

---

## ✅ CHECKLIST

### Phase 1: Remove Excessive Colors
- [ ] Replace purple/pink backgrounds with white/gray
- [ ] Remove gradient effects
- [ ] Simplify badges to text-only
- [ ] Use single accent color (rose) for CTAs only

### Phase 2: Add Availability Integration
- [ ] Fetch availability data from calendar
- [ ] Display availability status badge
- [ ] Show next available date
- [ ] Add booking indicators
- [ ] Integrate calendar preview

### Phase 3: Clean Up Typography
- [ ] Use system fonts or clean sans-serif
- [ ] Clear font-size hierarchy
- [ ] Proper line heights
- [ ] Generous white space

### Phase 4: Simplify Interactions
- [ ] Remove excessive animations
- [ ] Keep subtle hover effects
- [ ] Clean transitions
- [ ] Fast, responsive

---

## 🚀 EXPECTED RESULT

A **clean, professional, minimalist service preview** that:
- Looks like Airbnb/Apple design quality
- Properly uses availability data
- Is not overly colorful
- Focuses on content and usability
- Has a premium, sleek feel

---

## 📝 NOTES

- User wants **SLEEK**, not flashy
- **MINIMALIST**, not colorful overload
- **AVAILABILITY** must be front and center
- Think **professional**, not party

---

**Status**: READY FOR IMPLEMENTATION
**Priority**: HIGH
**Design Level**: Minimalist/Sleek (Apple/Airbnb style)
