# 🧪 Production Testing Guide - Wedding Bazaar

## Quick Access Links
- **Production Site**: https://weddingbazaarph.web.app
- **Backend API**: https://weddingbazaar-web.onrender.com
- **Firebase Console**: https://console.firebase.google.com/project/weddingbazaarph

---

## Test #1: Firebase Authentication ✅

### Registration Flow
1. Open https://weddingbazaarph.web.app
2. Open browser console (F12) to monitor Firebase logs
3. Click **"Register"** button
4. Fill in registration form:
   - **Email**: use a real email you can access
   - **Password**: minimum 6 characters
   - **First Name**: Your name
   - **Last Name**: Your surname
   - **User Type**: Select "Couple" or "Vendor"
   - If Vendor: Fill business details
5. Click **"Register"** button

### ✅ Expected Results
**In Browser Console:**
```
🔥 Firebase configuration check: {
  hasApiKey: true,
  hasAuthDomain: true,
  hasProjectId: true,
  hasAppId: true,
  isConfigured: true
}
🔧 Creating Firebase user with email verification...
✅ Firebase user created: [user-id]
📧 Firebase email verification sent to: [your-email]
```

**On Screen:**
- Success message: "Registration successful! Please check your email..."
- Modal closes automatically

**In Your Email:**
- Receive Firebase email verification email
- Subject: "Verify your email for Wedding Bazaar"

### ❌ What NOT to See
- ❌ "Firebase: Error (auth/invalid-api-key)"
- ❌ "Firebase Auth is not configured"
- ❌ Any 400 errors in Network tab

---

## Test #2: Email Verification ✅

### Verification Flow
1. Open email verification email
2. Click **"Verify Email"** button/link
3. Browser opens Firebase verification page
4. Redirected back to Wedding Bazaar site

### ✅ Expected Results
**In Browser Console:**
```
✅ User email verified
🔄 Syncing user with Neon database...
✅ User found in Neon database
```

**On Screen:**
- Automatic redirect to appropriate dashboard
- Welcome message displayed

---

## Test #3: Login Flow ✅

### Login Steps
1. Open https://weddingbazaarph.web.app
2. Click **"Login"** button
3. Enter verified email and password
4. Click **"Login"** button

### ✅ Expected Results
**In Browser Console:**
```
🔐 Firebase sign in attempt...
✅ Firebase login successful
✅ User logged in with verified email - full access granted
```

**On Screen:**
- Login modal closes
- Redirect to user dashboard
- User name displayed in header

### ❌ What NOT to See
- ❌ "Email not verified" error
- ❌ "Invalid credentials" (if using correct password)
- ❌ Firebase API key errors

---

## Test #4: Service Display ✅

### Service Browsing
1. Navigate to **Services** page
2. Browse service categories
3. Click on a service card
4. View service details modal

### ✅ Expected Results
**Price Display:**
- Shows price ranges: "₱1,000-₱5,000", "₱5,000-₱10,000", etc.
- No "Free" for paid services
- Clear pricing tiers

**Location Display:**
- Shows vendor location (e.g., "Metro Manila", "Cebu City")
- No "Location not specified" for vendors with locations

**Service Details:**
- Category badge displayed
- Vendor name shown
- Service description visible
- Contact information available

### ❌ What NOT to See
- ❌ "Free" for services that should have pricing
- ❌ "Location not specified" for real vendors
- ❌ Missing service information

---

## Test #5: Console Error Check ✅

### Open Browser Console (F12)
1. Navigate to Console tab
2. Clear console (Ctrl+L)
3. Reload page (F5)
4. Browse different pages

### ✅ Expected Console Output
```
🔥 Firebase configuration check: Object
🚀 [CentralizedBookingAPI] Initialized with base URL: https://weddingbazaar-web.onrender.com
🔔 [NotificationService] Initialized
🔧 [ServiceManager] API URL: https://weddingbazaar-web.onrender.com
✅ Firebase Auth: User logged in/out
```

### ❌ What NOT to See
- ❌ `Firebase: Error (auth/invalid-api-key)`
- ❌ `Firebase Auth is not configured`
- ❌ `Failed to load resource: 400`
- ❌ Any red error messages about Firebase

---

## Test #6: Network Tab Check ✅

### Monitor Network Requests
1. Open DevTools (F12) → Network tab
2. Reload page
3. Check API requests

### ✅ Expected API Calls
```
✅ GET /api/vendors/featured → 200 OK
✅ GET /api/services → 200 OK
✅ POST /api/auth/login → 200 OK (after login)
✅ POST /api/auth/register → 201 Created (after registration)
```

### ❌ What NOT to See
- ❌ 400 Bad Request to Firebase Auth API
- ❌ 404 Not Found errors
- ❌ 500 Internal Server Error
- ❌ CORS errors

---

## Test Scenarios Summary

| Test | Expected Outcome | Status |
|------|------------------|--------|
| Firebase Config Check | Console shows Firebase initialized | ⏳ Test |
| User Registration | Success message + email sent | ⏳ Test |
| Email Verification | Email received + link works | ⏳ Test |
| User Login | Successful login + redirect | ⏳ Test |
| Service Price Display | Correct price ranges shown | ⏳ Test |
| Vendor Location Display | Locations shown correctly | ⏳ Test |
| Console Errors | No Firebase API key errors | ⏳ Test |
| API Responses | All 200/201 responses | ⏳ Test |

---

## Known Good Test Credentials

### Test Admin Account
- **Email**: admin@weddingbazaar.com
- **Password**: admin123
- **Role**: Admin
- **Status**: Verified

### Test Vendor Account
- **Email**: vendor@test.com
- **Password**: vendor123
- **Role**: Vendor
- **Status**: Verified

### Create Your Own Test User
Use the registration flow to create a fresh test user.

---

## Troubleshooting

### Issue: Still seeing Firebase API key error
**Solution**: 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard reload page (Ctrl+Shift+R)
3. Try incognito/private browsing mode

### Issue: Email verification not received
**Solution**:
1. Check spam/junk folder
2. Wait 2-3 minutes (Firebase can be slow)
3. Try resending verification email
4. Check Firebase Console → Authentication for user status

### Issue: Services showing "Free" or no location
**Solution**:
1. Check browser console for API errors
2. Verify backend is responding: https://weddingbazaar-web.onrender.com/api/health
3. Check database contains services with price_range and vendors with service_area

### Issue: Login not working after verification
**Solution**:
1. Ensure email was actually verified (check Firebase Console)
2. Try password reset if needed
3. Check browser console for error messages
4. Verify JWT token in localStorage

---

## Success Criteria

For a **PASSING** test, you should see:
- ✅ No Firebase API key errors in console
- ✅ Registration flow completes successfully
- ✅ Email verification email received
- ✅ Login works after email verification
- ✅ Services display correct prices and locations
- ✅ All API calls return 200/201 status codes
- ✅ No red error messages in console
- ✅ User can navigate all pages without errors

For a **FAILING** test, you might see:
- ❌ Firebase API key invalid errors
- ❌ 400 Bad Request to Firebase
- ❌ Services showing "Free" incorrectly
- ❌ "Location not specified" for real vendors
- ❌ Console full of errors
- ❌ Login/registration not working

---

## Reporting Issues

If you find any issues during testing, please note:
1. **Browser**: Chrome, Firefox, Safari, Edge?
2. **Page/Feature**: Where did the issue occur?
3. **Error Message**: Exact error from console
4. **Steps to Reproduce**: What did you do?
5. **Screenshot**: If applicable

---

## Testing Checklist

### Pre-Test Setup
- [ ] Browser updated to latest version
- [ ] Internet connection stable
- [ ] DevTools console open
- [ ] Have access to email for verification

### Test Execution
- [ ] Firebase config check passed
- [ ] Registration flow completed
- [ ] Email verification received and clicked
- [ ] Login successful with verified account
- [ ] Services showing correct prices
- [ ] Vendor locations displaying correctly
- [ ] No console errors observed
- [ ] All API calls successful

### Post-Test
- [ ] Document any issues found
- [ ] Screenshot error messages
- [ ] Note browser and OS details
- [ ] Share test results

---

## Quick Test Commands

### Check Build Has Firebase Config
```powershell
Select-String -Path "dist\assets\*.js" -Pattern "AIzaSyBrrGVT9tyka4l2Jsph0VJVmjw5OmLXqI0"
```

### Verify Backend Health
```powershell
curl https://weddingbazaar-web.onrender.com/api/health
```

### Check Firebase Project
```bash
firebase projects:list
firebase apps:list
```

---

**Happy Testing! 🎉**

Last Updated: December 2024
