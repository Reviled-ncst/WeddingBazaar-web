# ⚡ Quick Reference: Using AlertDialog

## Import
```typescript
import { AlertDialog } from '@/shared/components/modals';
```

## Add State (inside component)
```typescript
const [alertDialog, setAlertDialog] = useState<{
  isOpen: boolean;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}>({
  isOpen: false,
  message: '',
  type: 'info'
});
```

## Helper Function (inside component)
```typescript
const showAlert = (
  message: string, 
  type: 'info' | 'success' | 'warning' | 'error' = 'info', 
  title?: string
) => {
  setAlertDialog({ isOpen: true, message, type, title });
};
```

## Add to JSX (before closing div)
```typescript
<AlertDialog
  isOpen={alertDialog.isOpen}
  onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
  title={alertDialog.title}
  message={alertDialog.message}
  type={alertDialog.type}
/>
```

## Usage Examples

### Replace alert()
```typescript
// OLD ❌
alert('Feature coming soon');

// NEW ✅
showAlert('Feature coming soon', 'info', 'Coming Soon');
```

### Info Message
```typescript
showAlert('This is information', 'info', 'Info');
```

### Success Message
```typescript
showAlert('Saved successfully!', 'success', 'Success');
```

### Warning Message
```typescript
showAlert('Please check your input', 'warning', 'Warning');
```

### Error Message
```typescript
showAlert('Something went wrong', 'error', 'Error');
```

## Testing in Dev
```bash
npm run dev
# Navigate to /vendor/bookings
# Click "Download CSV" button
# Should see blue info dialog
```

## Build and Deploy
```bash
npm run build
firebase deploy
```

## Files Created/Modified
- ✅ `src/shared/components/modals/AlertDialog.tsx` (NEW)
- ✅ `src/shared/components/modals/index.ts` (UPDATED)
- ✅ `src/pages/users/vendor/bookings/VendorBookingsSecure.tsx` (UPDATED)

---
**Status**: ✅ Complete  
**Date**: November 8, 2025
