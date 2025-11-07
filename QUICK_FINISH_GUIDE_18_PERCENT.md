# 🎯 Quick Reference: Complete Remaining 18% Alert Migration

**Current Status**: 82% Complete (109/133 alerts)  
**Remaining**: 24 alerts (15 production + 7 backup + 2 already done)  
**Estimated Time**: 30-45 minutes

---

## 🚀 COPY-PASTE TEMPLATE

Use this template for each file:

```typescript
// 1. ADD IMPORTS (top of file)
import { useNotification } from '@/shared/hooks/useNotification';
import { NotificationModal } from '@/shared/components/modals';

// 2. ADD HOOK (inside component)
const { notification, showSuccess, showError, showWarning, showInfo, hideNotification } = useNotification();

// 3. REPLACE alert() with appropriate method
// Success: showSuccess('Message', '✅ Title');
// Error: showError('Message', '❌ Title');
// Warning: showWarning('Message', '⚠️ Title');
// Info: showInfo('Message', 'ℹ️ Title');

// 4. ADD MODAL (before closing tag)
<NotificationModal {...notification} onClose={hideNotification} />
```

---

## 📋 REMAINING FILES CHECKLIST

### ✅ DONE (Session 4)
- [x] DecisionSupportSystem.tsx (1 alert)
- [x] PayMongoPaymentModal.tsx (1 alert)
- [x] BusinessLocationMap.tsx (2 alerts)

### 🚧 TODO: Login/Auth (2 files, 2 alerts)

#### 1. NewLoginModal.tsx
```typescript
// Line 349
// OLD: onClick={() => alert('Password reset feature coming soon!')}
// NEW: onClick={() => showInfo('Password reset feature coming soon!', 'ℹ️ Coming Soon')}
```

#### 2. FreshLoginModal.tsx
```typescript
// Line 270
// OLD: onClick={() => alert('Password reset coming soon!')}
// NEW: onClick={() => showInfo('Password reset coming soon!', 'ℹ️ Coming Soon')}
```

---

### 🚧 TODO: Coordinator (5 files, 6 alerts)

#### 3. WeddingCreateModal.tsx
```typescript
// Line 101
// OLD: alert('Wedding created successfully! 🎉');
// NEW: showSuccess('Wedding created successfully!', '🎉 Wedding Created');
```

#### 4. CoordinatorClients.tsx
```typescript
// Line 296
// OLD: alert('Client updated successfully!');
// NEW: showSuccess('Client updated successfully!', '✅ Client Updated');

// Line 314
// OLD: alert('Client deleted successfully!');
// NEW: showSuccess('Client deleted successfully!', '✅ Client Deleted');
```

#### 5. ClientDeleteDialog.tsx
```typescript
// Line 30
// OLD: alert('Failed to delete client. Please try again.');
// NEW: showError('Failed to delete client. Please try again.', '❌ Delete Failed');
```

#### 6. ClientEditModal.tsx
```typescript
// Line 99
// OLD: alert('Failed to update client. Please try again.');
// NEW: showError('Failed to update client. Please try again.', '❌ Update Failed');
```

---

### 🚧 TODO: Calendar/Date (3 files, 4 alerts)

#### 7. VendorAvailabilityCalendar.tsx
```typescript
// Line 442
// OLD: alert('Cannot set past dates as off days');
// NEW: showWarning('Cannot set past dates as off days', '⚠️ Invalid Date');
```

#### 8. VisualCalendar.tsx
```typescript
// Line 175
// OLD: alert('❌ Past dates cannot be selected');
// NEW: showWarning('Past dates cannot be selected', '⚠️ Invalid Date');

// Line 183
// OLD: alert(`❌ ${reason}\n\nPlease select a different date.`);
// NEW: showWarning(`${reason}\n\nPlease select a different date.`, '⚠️ Invalid Selection');
```

---

### 🚧 TODO: Messaging/Quote (2 files, 2 alerts)

#### 9. QuoteModal.tsx
```typescript
// Line 136
// OLD: alert('Failed to send quote. Please try again.');
// NEW: showError('Failed to send quote. Please try again.', '❌ Send Failed');
```

#### 10. GlobalMessengerContext.tsx
```typescript
// Line 646
// OLD: alert('Unable to start conversation. Please ensure you are logged in with the correct user type.');
// NEW: showError('Unable to start conversation. Please ensure you are logged in with the correct user type.', '❌ Conversation Failed');
```

---

### 🚧 TODO: Homepage (1 file, 2 alerts)

#### 11. Services.tsx
```typescript
// Line 350 & 646
// OLD: alert('Please sign up to view detailed vendor information and contact services.');
// NEW: showInfo('Please sign up to view detailed vendor information and contact services.', 'ℹ️ Sign Up Required');
```

---

### 🚧 TODO: Error Handling (1 file, 1 alert)

#### 12. EnhancedErrorBoundary.tsx
```typescript
// Line 99
// OLD: alert('Bug report details have been logged. Please contact support if the issue persists.');
// NEW: showSuccess('Bug report details have been logged. Please contact support if the issue persists.', '✅ Report Submitted');
```

---

## 🔄 BACKUP FILES (Optional - 7 alerts)

### IndividualBookings_OldDesign_Backup.tsx (3 alerts)
- Line 511, 516, 835

### IndividualBookings.backup.tsx (2 alerts)
- Line 464, 469

### IndividualBookings-Original.tsx (2 alerts)
- Line 472, 477

**Note**: These can be left as-is or migrated for completeness.

---

## 🧪 TESTING AFTER EACH FILE

1. Start dev server: `npm run dev`
2. Navigate to the page with the migrated alert
3. Trigger the action that would show the alert
4. Verify:
   - ✅ Modal appears instead of browser alert
   - ✅ Correct icon and color
   - ✅ Message is clear
   - ✅ Modal can be closed
   - ✅ No console errors

---

## 📊 PROGRESS TRACKING

Update this after each file:

```
✅ NewLoginModal.tsx (1/15)
✅ FreshLoginModal.tsx (2/15)
✅ WeddingCreateModal.tsx (3/15)
✅ CoordinatorClients.tsx (5/15) - 2 alerts
✅ ClientDeleteDialog.tsx (6/15)
✅ ClientEditModal.tsx (7/15)
✅ VendorAvailabilityCalendar.tsx (8/15)
✅ VisualCalendar.tsx (10/15) - 2 alerts
✅ QuoteModal.tsx (11/15)
✅ GlobalMessengerContext.tsx (12/15)
✅ Services.tsx (14/15) - 2 alerts
✅ EnhancedErrorBoundary.tsx (15/15)

PRODUCTION COMPLETE: 15/15 ✅
```

---

## 🚀 FINAL COMMIT MESSAGES

After completing all migrations:

```bash
git add -A
git commit -m "feat(modals): Complete alert() migration to NotificationModal (100%)

- Migrated final 15 production alerts
- All 133 browser alerts replaced with modals
- Login modals: Password reset info (2)
- Coordinator: CRUD operations (5)
- Calendar: Date validation (3)
- Messaging: Conversation errors (2)
- Homepage: Sign up prompts (2)
- Error boundary: Bug reports (1)

Achievement: 100% browser alert elimination!"

git push origin main
```

---

## 🎉 SUCCESS CRITERIA

- [ ] All 15 production files migrated
- [ ] No more `alert()` calls in production code
- [ ] All modals tested and working
- [ ] Documentation updated
- [ ] Git committed and pushed
- [ ] Celebrate 100% completion! 🎊

---

**Estimated Completion Time**: 30-45 minutes  
**Current Progress**: 82% → Target: 100%  
**Files Remaining**: 12 production files

---

**Ready to complete the final 18%? Let's do this! 🚀**
