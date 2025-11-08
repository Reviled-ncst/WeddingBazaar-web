# AlertDialog Visual Guide 🎨

## Component Preview

The AlertDialog component provides beautiful, modern dialogs that replace the old browser `alert()` calls.

## Alert Types

### 1. Info Alert (Blue) 🔵
```
┌────────────────────────────────────┐
│ Coming Soon                     ✕  │
├────────────────────────────────────┤
│ ┌─────────────────────────────┐   │
│ │ ℹ️  CSV download feature    │   │
│ │     will be implemented     │   │
│ │     in a future update.     │   │
│ └─────────────────────────────┘   │
│                                    │
│                      [ OK ]        │
└────────────────────────────────────┘
```
- **Background**: Light blue (`bg-blue-50`)
- **Border**: Blue (`border-blue-200`)
- **Icon**: Info circle (blue)
- **Button**: Blue (`bg-blue-600`)

### 2. Warning Alert (Yellow) ⚠️
```
┌────────────────────────────────────┐
│ Contact Information Missing     ✕  │
├────────────────────────────────────┤
│ ┌─────────────────────────────┐   │
│ │ ⚠️  No contact email        │   │
│ │     available for this      │   │
│ │     client.                 │   │
│ └─────────────────────────────┘   │
│                                    │
│                      [ OK ]        │
└────────────────────────────────────┘
```
- **Background**: Light yellow (`bg-yellow-50`)
- **Border**: Yellow (`border-yellow-200`)
- **Icon**: Alert circle (yellow)
- **Button**: Yellow (`bg-yellow-600`)

### 3. Success Alert (Green) ✅
```
┌────────────────────────────────────┐
│ Success                         ✕  │
├────────────────────────────────────┤
│ ┌─────────────────────────────┐   │
│ │ ✓  Operation completed      │   │
│ │    successfully!            │   │
│ └─────────────────────────────┘   │
│                                    │
│                      [ OK ]        │
└────────────────────────────────────┘
```
- **Background**: Light green (`bg-green-50`)
- **Border**: Green (`border-green-200`)
- **Icon**: Check circle (green)
- **Button**: Green (`bg-green-600`)

### 4. Error Alert (Red) ❌
```
┌────────────────────────────────────┐
│ Error                           ✕  │
├────────────────────────────────────┤
│ ┌─────────────────────────────┐   │
│ │ ✕  Something went wrong.    │   │
│ │    Please try again.        │   │
│ └─────────────────────────────┘   │
│                                    │
│                      [ OK ]        │
└────────────────────────────────────┘
```
- **Background**: Light red (`bg-red-50`)
- **Border**: Red (`border-red-200`)
- **Icon**: X circle (red)
- **Button**: Red (`bg-red-600`)

## Features

### Interaction
- ✅ Click backdrop to close
- ✅ Press ESC to close
- ✅ Click X button to close
- ✅ Click OK button to close

### Animation
- ✅ Smooth fade-in entrance
- ✅ Backdrop darkens with transition
- ✅ Button hover effects (darker shade)

### Accessibility
- ✅ ARIA labels for screen readers
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ High contrast colors

## Implementation in VendorBookingsSecure

### Scenario 1: CSV Download Button Clicked
```
User Action: Click "Download CSV" button
↓
Result: Info dialog appears
↓
Message: "CSV download feature will be implemented in a future update."
Title: "Coming Soon"
Type: Info (Blue)
```

### Scenario 2: Contact Client Without Email
```
User Action: Click "Contact Client" on booking without email
↓
Result: Warning dialog appears
↓
Message: "No contact email available for this client."
Title: "Contact Information Missing"
Type: Warning (Yellow)
```

## Code Usage

### Simple Info Alert
```typescript
showAlert('This is an informational message', 'info', 'Information');
```

### Warning with Title
```typescript
showAlert(
  'No contact email available for this client.',
  'warning',
  'Contact Information Missing'
);
```

### Success Message
```typescript
showAlert('Booking confirmed successfully!', 'success', 'Success');
```

### Error Message
```typescript
showAlert('Failed to load bookings. Please try again.', 'error', 'Error');
```

## Comparison: Old vs New

### Old (Browser Alert)
```
┌───────────────────────────────┐
│  localhost:5173               │  ← Browser chrome
├───────────────────────────────┤
│  CSV download feature will    │  ← Plain text
│  be implemented in a future   │
│  update.                      │
│                               │
│              [ OK ]           │  ← Basic button
└───────────────────────────────┘
```
❌ Browser-default styling (not customizable)
❌ Blocks JavaScript execution
❌ No icons or visual hierarchy
❌ Inconsistent across browsers
❌ Not mobile-friendly

### New (AlertDialog)
```
┌─────────────────────────────────────┐
│  Coming Soon                     ✕  │  ← Custom header
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  ℹ️  CSV download feature    │  │  ← Icon + styled box
│  │      will be implemented      │  │
│  │      in a future update.      │  │
│  └───────────────────────────────┘  │
│                                     │
│                       [ OK ]        │  ← Styled button
└─────────────────────────────────────┘
       ↑ Backdrop overlay
```
✅ Custom Wedding Bazaar styling
✅ Non-blocking (async)
✅ Beautiful icons and colors
✅ Consistent across all browsers
✅ Mobile-responsive
✅ Smooth animations

## Mobile View

On mobile devices (< 640px):
- Dialog takes 90% of screen width
- Padding adjusts for touch targets
- Button is full-width for easy tapping
- Text is larger and more readable

```
┌─────────────────────┐
│ Coming Soon      ✕  │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ ℹ️  CSV         │ │
│ │   download      │ │
│ │   feature will  │ │
│ │   be...         │ │
│ └─────────────────┘ │
│                     │
│  ┌───────────────┐  │
│  │      OK       │  │
│  └───────────────┘  │
└─────────────────────┘
```

## Design System Integration

The AlertDialog follows the Wedding Bazaar design principles:
- **Colors**: Pink, white, black color scheme
- **Glassmorphism**: Backdrop blur effect on overlay
- **Rounded Corners**: `rounded-lg` for modern feel
- **Shadows**: `shadow-xl` for depth
- **Transitions**: Smooth hover and focus states
- **Typography**: Clear hierarchy with titles and body text

---

**Note**: This is a visual representation. The actual component uses Tailwind CSS for styling and Lucide icons for the visual elements.
