# 🎨 Booking Contact Info - Visual Verification Guide

## 📸 What You Should See

### Before Opening Modal
```
URL: https://weddingbazaarph.web.app/individual/services

1. Click any service card
2. Click "Request Booking" button
```

---

## ✅ Contact Information Section

### Section Header
```
┌─────────────────────────────────────────────────────┐
│  [📱]  Contact Information              [🛡️ Verified] │
│       From your profile (secured)                   │
└─────────────────────────────────────────────────────┘
```

**Visual Elements**:
- 📱 Purple phone icon in rounded square background
- **Bold Title**: "Contact Information"
- **Subtitle**: "From your profile (secured)" (grey text)
- 🛡️ **Green Badge**: "Verified" with shield icon

---

### Info Notice (Blue Box)
```
┌─────────────────────────────────────────────────────┐
│ ℹ️  Contact information is auto-filled from your    │
│    profile                                          │
│                                                     │
│    To update your contact details, please edit     │
│    your profile settings after submitting this     │
│    booking.                                         │
└─────────────────────────────────────────────────────┘
```

**Colors**:
- Background: Light blue (`bg-blue-50`)
- Border: Blue (`border-blue-200`)
- Text: Dark blue (`text-blue-800`)
- Info Icon: Blue (`text-blue-600`)

---

### Contact Person Field
```
┌─────────────────────────────────────────────────────┐
│ 👤 Contact Person                                   │
│ ┌───────────────────────────────────────────────┐   │
│ │  Juan Dela Cruz                          🔒  │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Styling**:
- Background: Grey (`bg-gray-50`)
- Text: Grey (`text-gray-700`)
- Border: Grey (`border-gray-200`)
- Lock icon on right side (grey)
- Cursor: Not-allowed (🚫)

---

### Contact Email Field
```
┌─────────────────────────────────────────────────────┐
│ 📧 Contact Email                                    │
│ ┌───────────────────────────────────────────────┐   │
│ │ 📧 juan.delacruz@email.com              🔒   │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Styling**:
- Email icon on left side (grey)
- Lock icon on right side (grey)
- Same grey background as Contact Person
- Cannot be edited

---

### Phone Number Field
```
┌─────────────────────────────────────────────────────┐
│ 📱 Phone Number                    ✅ Required      │
│ ┌───────────────────────────────────────────────┐   │
│ │ 📱 +63 912 345 6789                     🔒   │   │
│ └───────────────────────────────────────────────┘   │
│ 🛡️ 📱 This is your verified phone number from      │
│      your profile                                   │
└─────────────────────────────────────────────────────┘
```

**Extra Elements**:
- Green checkmark + "Required" label
- Phone icon on left side
- Lock icon on right side
- Verification message below (with shield emoji)

---

## 🎨 Color Palette

### Section Colors
```css
Background Gradient:
  from-purple-50 
  via-indigo-50/30 
  to-purple-50/20

Border: border-gray-200/50
Shadow: shadow-sm
```

### Badge Colors
```css
Verified Badge:
  Background: bg-green-100
  Border: border-green-200
  Text: text-green-700
  Icon: text-green-600
```

### Info Notice Colors
```css
Info Box:
  Background: bg-blue-50
  Border: border-blue-200
  Text: text-blue-800
  Title: font-semibold
  Icon: text-blue-600
```

### Input Field Colors (Read-Only)
```css
Input Fields:
  Background: bg-gray-50
  Border: border-gray-200
  Text: text-gray-700
  Cursor: cursor-not-allowed
  
Icons:
  Left Icon: text-gray-400
  Lock Icon: text-gray-400
```

---

## 🖱️ Interaction States

### Hover (No Effect)
- Cursor: Not-allowed (🚫)
- No color change
- No hover effects

### Click (No Effect)
- Cannot gain focus
- No text cursor appears
- Cannot type or edit

### Copy (Allowed)
- User can still select text
- Can copy contact info for reference
- But cannot paste or edit

---

## 📱 Mobile View

### Small Screens (< 768px)
```
┌────────────────────────────┐
│ [📱] Contact Information   │
│      From your profile     │
│      [🛡️ Verified]          │
├────────────────────────────┤
│ ℹ️ Info notice (wrapped)   │
├────────────────────────────┤
│ 👤 Contact Person          │
│ [Juan Dela Cruz      🔒]  │
├────────────────────────────┤
│ 📧 Contact Email           │
│ [📧 juan@email.com    🔒]  │
├────────────────────────────┤
│ 📱 Phone Number ✅         │
│ [📱 +63 912 3456   🔒]    │
│ 🛡️ Verified message        │
└────────────────────────────┘
```

**Changes**:
- Verified badge may stack below title
- Fields display full-width
- Text wraps properly
- Lock icons remain aligned

---

## ✅ Verification Checklist

When testing, verify these visual elements:

### Section Header
- [ ] Purple phone icon in rounded square background
- [ ] "Contact Information" title (bold)
- [ ] "From your profile (secured)" subtitle (grey)
- [ ] Green "Verified" badge with shield icon

### Info Notice
- [ ] Blue background with border
- [ ] Info icon on left
- [ ] Bold first line
- [ ] Regular text second line

### Contact Person Field
- [ ] User icon label
- [ ] Grey background (disabled state)
- [ ] Lock icon on right
- [ ] Shows user's full name
- [ ] Cursor: not-allowed

### Contact Email Field
- [ ] Email icon in label
- [ ] Email icon on left side of input
- [ ] Lock icon on right side
- [ ] Grey background
- [ ] Shows user's email
- [ ] Cursor: not-allowed

### Phone Number Field
- [ ] Phone icon in label
- [ ] "Required" badge (green checkmark)
- [ ] Phone icon on left side of input
- [ ] Lock icon on right side
- [ ] Grey background
- [ ] Shows user's phone
- [ ] Verification message below
- [ ] Cursor: not-allowed

---

## 🐛 Visual Bugs to Watch For

If you see any of these, it's a bug:

❌ **Bad**: White background on contact fields  
✅ **Good**: Grey background (`bg-gray-50`)

❌ **Bad**: No lock icons visible  
✅ **Good**: Lock icons on right side of all fields

❌ **Bad**: "Verified" badge missing or wrong color  
✅ **Good**: Green badge with shield icon

❌ **Bad**: Info notice missing or wrong color  
✅ **Good**: Blue notice with info icon

❌ **Bad**: Fields are editable (cursor changes to text)  
✅ **Good**: Fields show not-allowed cursor (🚫)

❌ **Bad**: Icons misaligned or overlapping  
✅ **Good**: All icons properly aligned

---

## 📸 Screenshot Checklist

When documenting, capture:
1. Full modal view
2. Contact information section (zoomed)
3. Each individual field (close-up)
4. Cursor hover state (showing not-allowed)
5. Mobile view (responsive layout)

---

## ✅ Acceptance

**Visual design is correct if**:
- All icons present and aligned
- Colors match specification
- Lock icons visible on all fields
- Verified badge shows
- Info notice displays
- Grey background on all fields
- Cursor shows not-allowed

**Status**: ✅ READY FOR VISUAL QA
