# Confirmation Modal - Visual Reference Guide

## 🎨 Modal Types & Examples

---

## 1️⃣ SUCCESS Modal (Heart Icon)

**Use Case**: Adding to favorites, successful actions, positive confirmations

```typescript
setConfirmationConfig({
  title: 'Added to Favorites! 💕',
  message: '"Amazing Wedding Photography" has been saved to your favorites.',
  type: 'success',
  icon: 'heart'
});
```

**Visual**:
```
┌─────────────────────────────────────────────┐
│         [Green Gradient Background]     ✕  │
│                                             │
│                   💕                        │
│            (Rose Heart Icon)                │
│                                             │
│         Added to Favorites! 💕              │
│                                             │
│ "Amazing Wedding Photography" has been      │
│ saved to your favorites. You can view all   │
│ your saved services in your profile.        │
│                                             │
│             [Green Button]                  │
│                 OK                          │
│                                             │
└─────────────────────────────────────────────┘
```

**Colors**:
- Background: `from-green-50 to-emerald-50`
- Icon: `text-rose-500 fill-rose-500` (Heart)
- Button: `from-green-500 to-emerald-600`

---

## 2️⃣ SUCCESS Modal (Check Icon)

**Use Case**: General success, completed actions, confirmed operations

```typescript
setConfirmationConfig({
  title: 'Booking Confirmed!',
  message: 'Your booking request has been sent successfully.',
  type: 'success',
  icon: 'check'
});
```

**Visual**:
```
┌─────────────────────────────────────────────┐
│         [Green Gradient Background]     ✕  │
│                                             │
│                   ✓                         │
│           (Green Check Icon)                │
│                                             │
│           Booking Confirmed!                │
│                                             │
│  Your booking request has been sent         │
│  successfully. The vendor will contact      │
│  you shortly.                               │
│                                             │
│             [Green Button]                  │
│                 OK                          │
│                                             │
└─────────────────────────────────────────────┘
```

**Colors**:
- Background: `from-green-50 to-emerald-50`
- Icon: `text-green-500` (CheckCircle2)
- Button: `from-green-500 to-emerald-600`

---

## 3️⃣ ERROR Modal

**Use Case**: Failed actions, errors, problems

```typescript
setConfirmationConfig({
  title: 'Payment Failed',
  message: 'There was an error processing your payment. Please try again.',
  type: 'error',
  icon: 'alert'
});
```

**Visual**:
```
┌─────────────────────────────────────────────┐
│          [Red Gradient Background]      ✕  │
│                                             │
│                   ⚠                         │
│          (Amber Alert Icon)                 │
│                                             │
│             Payment Failed                  │
│                                             │
│  There was an error processing your         │
│  payment. Please check your card details    │
│  and try again.                             │
│                                             │
│              [Red Button]                   │
│                 OK                          │
│                                             │
└─────────────────────────────────────────────┘
```

**Colors**:
- Background: `from-red-50 to-rose-50`
- Icon: `text-amber-500` (AlertCircle)
- Button: `from-red-500 to-rose-600`

---

## 4️⃣ WARNING Modal

**Use Case**: Warnings, cautions, potentially destructive actions

```typescript
setConfirmationConfig({
  title: 'Delete Service?',
  message: 'Are you sure you want to delete this service? This action cannot be undone.',
  type: 'warning',
  icon: 'alert'
});
```

**Visual**:
```
┌─────────────────────────────────────────────┐
│       [Yellow Gradient Background]      ✕  │
│                                             │
│                   ⚠                         │
│          (Amber Alert Icon)                 │
│                                             │
│            Delete Service?                  │
│                                             │
│  Are you sure you want to delete this       │
│  service? This action cannot be undone.     │
│                                             │
│            [Yellow Button]                  │
│                 OK                          │
│                                             │
└─────────────────────────────────────────────┘
```

**Colors**:
- Background: `from-amber-50 to-yellow-50`
- Icon: `text-amber-500` (AlertCircle)
- Button: `from-amber-500 to-yellow-600`

---

## 5️⃣ INFO Modal

**Use Case**: Information, helpful tips, notifications

```typescript
setConfirmationConfig({
  title: 'How It Works',
  message: 'Click the heart icon to save services to your favorites for easy access later.',
  type: 'info',
  icon: 'info'
});
```

**Visual**:
```
┌─────────────────────────────────────────────┐
│         [Blue Gradient Background]      ✕  │
│                                             │
│                   ℹ                         │
│           (Blue Info Icon)                  │
│                                             │
│             How It Works                    │
│                                             │
│  Click the heart icon to save services to   │
│  your favorites for easy access later.      │
│                                             │
│             [Blue Button]                   │
│                 OK                          │
│                                             │
└─────────────────────────────────────────────┘
```

**Colors**:
- Background: `from-blue-50 to-cyan-50`
- Icon: `text-blue-500` (Info)
- Button: `from-blue-500 to-cyan-600`

---

## 6️⃣ Modal with Cancel Button

**Use Case**: Confirmations requiring user decision (Yes/No, Delete/Cancel)

```typescript
<ConfirmationModal
  isOpen={showConfirmation}
  onClose={() => setShowConfirmation(false)}
  title="Cancel Booking?"
  message="Are you sure you want to cancel this booking? The vendor will be notified."
  type="warning"
  icon="alert"
  confirmText="Yes, Cancel"
  cancelText="No, Keep It"
  showCancel={true}
  onConfirm={() => {
    // Handle cancellation
    cancelBooking();
  }}
/>
```

**Visual**:
```
┌─────────────────────────────────────────────┐
│       [Yellow Gradient Background]      ✕  │
│                                             │
│                   ⚠                         │
│          (Amber Alert Icon)                 │
│                                             │
│            Cancel Booking?                  │
│                                             │
│  Are you sure you want to cancel this       │
│  booking? The vendor will be notified.      │
│                                             │
│    [Gray Button]      [Yellow Button]       │
│    No, Keep It         Yes, Cancel          │
│                                             │
└─────────────────────────────────────────────┘
```

**Two Buttons**:
- Cancel: `bg-white border-2 border-gray-300`
- Confirm: `from-amber-500 to-yellow-600`

---

## 📐 Size Specifications

### Modal
- **Max Width**: `max-w-md` (448px)
- **Padding**: `p-8` (32px)
- **Border Radius**: `rounded-3xl` (24px)
- **Border**: `border-2 border-white/50`
- **Shadow**: `shadow-2xl`

### Icon
- **Size**: `48px` (h-12 w-12)
- **Margin Bottom**: `mb-6` (24px)
- **Animation**: Scale from 0 to 1 with spring

### Title
- **Font Size**: `text-2xl` (24px)
- **Font Weight**: `font-bold`
- **Color**: `text-gray-900`
- **Margin Bottom**: `mb-3` (12px)

### Message
- **Font Size**: Default (16px)
- **Color**: `text-gray-700`
- **Line Height**: `leading-relaxed`
- **Margin Bottom**: `mb-8` (32px)

### Buttons
- **Padding**: `px-6 py-3` (24px horizontal, 12px vertical)
- **Border Radius**: `rounded-xl` (12px)
- **Font Weight**: `font-semibold`
- **Shadow**: `shadow-lg`

---

## 🎭 Animation Timings

### Opening
```typescript
initial={{ opacity: 0, scale: 0.9, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
```
- **Duration**: ~300ms
- **Easing**: Default easing

### Icon
```typescript
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
```
- **Delay**: 100ms
- **Type**: Spring animation
- **Stiffness**: 200

### Title
```typescript
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.2 }}
```
- **Delay**: 200ms

### Message
```typescript
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.3 }}
```
- **Delay**: 300ms

### Buttons
```typescript
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.4 }}
```
- **Delay**: 400ms

### Closing
```typescript
exit={{ opacity: 0, scale: 0.9, y: 20 }}
```
- **Duration**: ~300ms

---

## 🎨 Color Palette

### Success (Green)
- **Background**: `from-green-50 to-emerald-50`
- **Button**: `from-green-500 to-emerald-600`
- **Button Hover**: `from-green-600 to-emerald-700`

### Error (Red)
- **Background**: `from-red-50 to-rose-50`
- **Button**: `from-red-500 to-rose-600`
- **Button Hover**: `from-red-600 to-rose-700`

### Warning (Yellow)
- **Background**: `from-amber-50 to-yellow-50`
- **Button**: `from-amber-500 to-yellow-600`
- **Button Hover**: `from-amber-600 to-yellow-700`

### Info (Blue)
- **Background**: `from-blue-50 to-cyan-50`
- **Button**: `from-blue-500 to-cyan-600`
- **Button Hover**: `from-blue-600 to-cyan-700`

### Special - Heart Icon
- **Heart Color**: `text-rose-500 fill-rose-500`
- **Used with**: Success type modals for favorites

---

## 📱 Responsive Design

### Desktop (lg and up)
```
┌──────────────────────────────────────────┐
│              FULL MODAL                  │
│          (max-width: 448px)              │
│              Centered                    │
└──────────────────────────────────────────┘
```

### Tablet (md to lg)
```
┌────────────────────────────┐
│      MODAL (Centered)      │
│      Width: 90% max        │
│      (max-width: 448px)    │
└────────────────────────────┘
```

### Mobile (sm and below)
```
┌──────────────┐
│    MODAL     │
│  Width: 95%  │
│   Centered   │
│   Padding    │
│   adjusted   │
└──────────────┘
```

---

## ♿ Accessibility Features

### Keyboard Support
- **ESC**: Close modal
- **TAB**: Navigate between buttons
- **ENTER**: Activate focused button

### ARIA Labels
- Close button: `aria-label="Close confirmation modal"`
- Modal role: Implicit via motion.div
- Focus trap: Automatically managed

### Screen Reader
- Title announced first
- Message read after title
- Buttons announced with their text

---

## 🎯 Usage Guidelines

### DO:
✅ Use success + heart for favorites  
✅ Use success + check for general confirmations  
✅ Use error for failed actions  
✅ Use warning for destructive actions  
✅ Use info for helpful tips  
✅ Keep messages concise and clear  
✅ Use action-specific button text  

### DON'T:
❌ Use modal for long content (use full page instead)  
❌ Use vague messages ("Something happened")  
❌ Mix icon types with message types  
❌ Overuse modals (can be annoying)  
❌ Use for critical errors (use error page)  
❌ Show modal without user action  

---

## 🚀 Quick Reference

| Type | Icon | Use For | Button Color |
|------|------|---------|--------------|
| `success` | `heart` | Favorites | Green |
| `success` | `check` | Confirmations | Green |
| `error` | `alert` | Errors | Red |
| `warning` | `alert` | Warnings | Yellow |
| `info` | `info` | Information | Blue |

---

**Visual Guide Created**: January 2025  
**Component**: `ConfirmationModal.tsx`  
**Status**: Production-Ready  

Use this guide for consistent modal design across the platform! 🎨
