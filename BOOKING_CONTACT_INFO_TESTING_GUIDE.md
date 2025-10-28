# 🧪 Booking Contact Info Read-Only - Testing Guide

## 📋 Quick Test Checklist

### ✅ Pre-Deployment Verification
- [x] Build completed successfully (10.81s)
- [x] No compilation errors
- [x] Icons imported correctly
- [x] Deployed to Firebase Hosting
- [x] Git commit pushed to GitHub

---

## 🔍 Manual Testing Steps

### Test 1: Visual Verification
**URL**: https://weddingbazaarph.web.app/individual/services

1. **Login**: Use test account (or create new account with profile info)
2. **Navigate**: Click on any service card
3. **Open Modal**: Click "Request Booking" button

**Expected Results**:
```
✅ Contact Information Section Header
   - Title: "Contact Information"
   - Subtitle: "From your profile (secured)"
   - Green "Verified" badge with shield icon

✅ Blue Info Notice
   - "Contact information is auto-filled from your profile"
   - Instructions to update in profile settings

✅ Contact Person Field
   - Shows user's full name
   - Grey background (disabled state)
   - Lock icon on right side
   - Cannot be edited (cursor: not-allowed)

✅ Contact Email Field
   - Shows user's email
   - Mail icon on left side
   - Lock icon on right side
   - Grey background
   - Cannot be edited

✅ Contact Phone Field
   - Shows user's phone number
   - Phone icon on left side
   - Lock icon on right side
   - Grey background
   - Additional verification message below
   - Cannot be edited
```

---

### Test 2: Interaction Testing

**Steps**:
1. Try clicking in Contact Person field → ❌ Cursor shows "not-allowed"
2. Try clicking in Contact Email field → ❌ Cursor shows "not-allowed"
3. Try clicking in Contact Phone field → ❌ Cursor shows "not-allowed"
4. Try typing in any contact field → ❌ No input accepted
5. Try selecting text → ✅ Text can be copied (for user reference)

**Expected**: All fields are completely read-only, no editing possible.

---

### Test 3: Data Auto-Fill Verification

**Scenario A**: User with complete profile
- User has: First Name, Last Name, Email, Phone
- **Expected**: All fields auto-filled correctly

**Scenario B**: User with partial profile
- User has: Email only (no name or phone)
- **Expected**: 
  - Email field shows email
  - Name field shows "Not provided"
  - Phone field shows "Not provided"

**Scenario C**: User updates profile
1. Go to `/individual/profile`
2. Update phone number
3. Return to booking modal
4. **Expected**: New phone number displays automatically

---

### Test 4: Accessibility Testing

**Screen Reader Test**:
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Tab through the booking form
3. Listen for aria-labels on contact fields

**Expected Announcements**:
- "Contact person name (read-only)"
- "Contact email address (read-only)"
- "Contact phone number (read-only)"

**Keyboard Navigation**:
- ✅ Tab skips over read-only fields (focus moves to next editable field)
- ✅ Fields still focusable but clearly marked as disabled

---

### Test 5: Mobile Responsiveness

**Devices to Test**:
- 📱 iPhone (Safari)
- 📱 Android (Chrome)
- 📱 iPad (Safari)

**Expected**:
- Contact info section displays properly on small screens
- Verified badge doesn't overflow
- Info notice text wraps correctly
- Lock icons remain aligned

---

## 🐛 Known Issues (None Expected)

If you encounter any of these, please report:
- [ ] Contact fields are still editable
- [ ] Lock icons missing
- [ ] Verified badge not showing
- [ ] Info notice missing
- [ ] Fields not auto-filling from profile

---

## 📊 Test Results Template

```
Date: _____________
Tester: _____________
Browser: _____________
Device: _____________

[ ] Test 1: Visual Verification - PASS / FAIL
[ ] Test 2: Interaction Testing - PASS / FAIL
[ ] Test 3: Data Auto-Fill - PASS / FAIL
[ ] Test 4: Accessibility - PASS / FAIL
[ ] Test 5: Mobile Responsive - PASS / FAIL

Issues Found:
1. _______________________________________
2. _______________________________________

Additional Notes:
_____________________________________________
_____________________________________________
```

---

## 🚀 Deployment URLs

**Frontend**: https://weddingbazaarph.web.app  
**Services Page**: https://weddingbazaarph.web.app/individual/services  
**Test Account**: Use existing account or create new one

---

## ✅ Acceptance Criteria

Before marking as complete, verify:
- [x] Build successful with no errors
- [x] Deployed to production
- [x] Contact fields are read-only
- [x] Visual indicators (lock icons, badges) present
- [x] Auto-fill from user profile works
- [x] Info notice displays correctly
- [x] Accessibility attributes set
- [x] Mobile responsive
- [x] Documentation created
- [x] Git committed and pushed

**Status**: ✅ READY FOR TESTING
