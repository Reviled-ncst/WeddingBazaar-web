# 🧪 Testing Guide - Orphaned Account Auto-Cleanup

## Quick Test Checklist

### ✅ Test 1: Normal Registration (Happy Path)
**Scenario**: Everything works perfectly

1. Open: https://weddingbazaarph.web.app
2. Click "Sign Up"
3. Fill form with NEW email: `test-normal-{timestamp}@gmail.com`
4. Click "Register"
5. **Expected**: 
   - ✅ Success message: "Check your email for verification link"
   - ✅ No errors in console
   - ✅ Email verification sent
   - ✅ Backend user created

**Status**: ⏳ PENDING TEST

---

### ✅ Test 2: Backend Failure During Registration
**Scenario**: Backend fails, auto-cleanup should trigger

**Setup** (Optional - simulates backend failure):
```bash
# Stop backend temporarily OR
# Use invalid email format that backend rejects
```

1. Open: https://weddingbazaarph.web.app
2. Click "Sign Up"
3. Fill form with: `test-cleanup-{timestamp}@gmail.com`
4. Click "Register"
5. **Expected**:
   - ❌ Error message: "Registration failed. Please try again."
   - 🗑️ Console shows: "Cleaning up orphaned Firebase account..."
   - ✅ Can retry with SAME email immediately

**Console Logs to Look For**:
```
✅ Firebase user created: [uid]
📧 Email verification sent to: test-cleanup-...
❌ Backend registration failed: POST /api/auth/register 400
🗑️ Cleaning up orphaned Firebase account...
📢 User sees error: "Registration failed. Please try again."
```

**Status**: ⏳ PENDING TEST

---

### ✅ Test 3: Existing Orphaned Account (Login Attempt)
**Scenario**: User tries to login with orphaned account email

**Setup**:
Use the problematic email from logs: `elealesantos06@gmail.com`

1. Open: https://weddingbazaarph.web.app
2. Click "Login"
3. Enter: `elealesantos06@gmail.com` + any password
4. Click "Login"
5. **Expected**:
   - 🚨 Console shows: "ORPHANED FIREBASE ACCOUNT DETECTED"
   - 🗑️ Console shows: "Signing out to prevent infinite profile fetch loop"
   - 📢 Toast notification: "Registration incomplete. Please register again."
   - ✅ NO infinite `/api/auth/profile` loop
   - ✅ User can register again with this email

**Console Logs to Look For**:
```
⚠️ ORPHANED FIREBASE ACCOUNT DETECTED
📧 Email: elealesantos06@gmail.com
🔧 This account exists in Firebase but not in the backend database
💡 Solution: Signing out to prevent infinite profile fetch loop
🗑️ Firebase user auto-signed out
📢 Toast: "Registration incomplete. Please register again."
```

**What NOT to See**:
```
❌ NO: GET /api/auth/profile?email=elealesantos06@gmail.com 404 (repeating)
❌ NO: Infinite loop of profile fetches
❌ NO: Console spam
```

**Status**: ⏳ PENDING TEST

---

### ✅ Test 4: Retry After Cleanup
**Scenario**: User registers again after auto-cleanup

1. Complete Test 2 or Test 3 first
2. Click "Sign Up" again
3. Use the SAME email from previous test
4. Fill form completely
5. Click "Register"
6. **Expected**:
   - ✅ Registration succeeds
   - ✅ Email verification sent
   - ✅ No "email already in use" error
   - ✅ Backend user created successfully

**Status**: ⏳ PENDING TEST

---

## Production Testing Commands

### Check Firebase Authentication
```bash
# Login to Firebase Console
https://console.firebase.google.com/project/weddingbazaarph/authentication/users

# Search for test emails
# Verify orphaned accounts are cleaned up
```

### Check Backend Database
```bash
# Run this in Neon SQL Console
SELECT email, firebase_uid, user_type, created_at 
FROM users 
WHERE email LIKE '%test-%'
ORDER BY created_at DESC;

# Check for orphaned Firebase UIDs (should be empty)
SELECT firebase_uid FROM users 
WHERE firebase_uid NOT IN (SELECT uid FROM firebase_authentication);
```

### Monitor Production Logs
```bash
# Open Browser DevTools Console
# Look for these messages:

# 🎯 GOOD LOGS (expected):
# "🗑️ Cleaning up orphaned Firebase account..."
# "⚠️ ORPHANED FIREBASE ACCOUNT DETECTED"

# 🚨 BAD LOGS (should NOT appear):
# "GET /api/auth/profile?email=... 404" (repeating)
# Multiple identical profile fetch attempts
```

---

## Expected Behavior Summary

### ✅ Auto-Cleanup Triggered (Good)
```
User Action: Register with new email
  ↓
Firebase User Created ✅
  ↓
Backend Registration Fails ❌
  ↓
🚨 AUTO-CLEANUP TRIGGERED
  ↓
Firebase User Signed Out 🗑️
All Cache Cleared 🧹
Error Message Shown 📢
  ↓
User Can Retry ✅ (same email works)
```

### ✅ Orphaned Account Detected (Good)
```
User Action: Login with orphaned account email
  ↓
Firebase Login Succeeds ✅
  ↓
Backend Profile Fetch Returns 404 ❌
  ↓
🚨 ORPHANED ACCOUNT DETECTED
  ↓
Firebase User Signed Out 🗑️
All Cache Cleared 🧹
Toast Notification Shown 📢
  ↓
User Can Register Again ✅ (same email works)
```

### ❌ Infinite Loop (Should NEVER Happen)
```
❌ ELIMINATED: This should no longer occur
GET /api/auth/profile?email=... 404
GET /api/auth/profile?email=... 404
GET /api/auth/profile?email=... 404
[Repeating forever...]
```

---

## Testing Timeline

### Phase 1: Immediate Testing (Today)
- [ ] Test 1: Normal registration
- [ ] Test 3: Existing orphaned account (`elealesantos06@gmail.com`)
- [ ] Verify no infinite loops
- [ ] Check console logs

### Phase 2: Edge Case Testing (This Week)
- [ ] Test 2: Simulate backend failure
- [ ] Test 4: Retry after cleanup
- [ ] Test with multiple orphaned accounts
- [ ] Test with different user types (couple, vendor, coordinator)

### Phase 3: Production Monitoring (Ongoing)
- [ ] Monitor cleanup logs daily
- [ ] Track registration success rate
- [ ] Check for any new orphaned accounts
- [ ] Verify zero infinite loops

---

## Success Criteria

### ✅ Must Pass All:
1. **No Infinite Loops**: Zero instances of repeating profile fetch 404s
2. **Auto-Cleanup Works**: Console shows cleanup logs when backend fails
3. **Orphaned Detection Works**: Existing orphaned accounts detected and cleaned
4. **User Can Retry**: Same email works after cleanup
5. **Clear Error Messages**: Users see helpful error messages
6. **No Console Spam**: Clean, minimal logging

### 📊 Key Metrics:
- Registration success rate: > 95%
- Orphaned account cleanups: < 5 per week
- Infinite loop occurrences: 0
- User confusion/support tickets: 80% reduction

---

## Troubleshooting

### Issue: Cleanup not triggering
**Check**:
1. Are you testing in production? (https://weddingbazaarph.web.app)
2. Is backend actually failing? (check Network tab)
3. Open console before registering (to see logs)

### Issue: Still seeing infinite loops
**Check**:
1. Clear browser cache completely (Ctrl+Shift+Delete)
2. Hard refresh page (Ctrl+F5)
3. Verify deployment completed: https://weddingbazaarph.web.app
4. Check console for error messages

### Issue: "Email already in use" error
**Check**:
1. Wait 5 seconds after cleanup before retrying
2. Verify Firebase user was actually deleted
3. Clear all browser data (localStorage, sessionStorage)
4. Try in incognito mode

---

## Contact & Support

**Issue**: Auto-cleanup not working as expected  
**Action**: 
1. Screenshot console logs
2. Note exact email used
3. Document steps taken
4. Report to development team

**Files to Check**:
- `src/shared/contexts/HybridAuthContext.tsx` (Line ~138, ~650)
- Production URL: https://weddingbazaarph.web.app
- Firebase Console: https://console.firebase.google.com/project/weddingbazaarph

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: ✅ DEPLOYED TO PRODUCTION
