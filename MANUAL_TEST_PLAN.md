# 🧪 Manual Test Plan - Recent Fixes Verification

**Date**: January 2025  
**Version**: Post-Deployment v1.0  
**Deployment**: Frontend deployed to Firebase Hosting  

---

## ✅ Test Summary

This test plan covers verification of:
1. **Payment Modal Fix** - Subscription upgrade payment modal
2. **Signout Dialog Fix** - Couple profile dropdown confirmation
3. **Email Notification System** - Vendor booking notifications

---

## 🎯 Test 1: Payment Modal for Subscription Upgrades

### Objective
Verify that clicking "Upgrade Now" on a subscription plan opens the payment modal.

### Prerequisites
- User logged in as **couple/individual**
- Navigate to subscription/upgrade page

### Test Steps

#### Step 1.1: Navigate to Upgrade Page
1. Login as individual user
2. Click on profile or navigate to `/individual/premium` or subscription page
3. **Expected**: Subscription plans displayed with "Upgrade Now" buttons

#### Step 1.2: Click Premium Plan
1. Click **"Upgrade Now"** on the **Premium Plan** card
2. **Expected**: Payment modal opens immediately
3. **Expected**: Modal shows:
   - Plan name (Premium)
   - Price (₱999/month)
   - Payment method selection (Card/GCash/PayMaya/GrabPay)
   - Card input fields (if card selected)

#### Step 1.3: Click Basic Plan
1. Close payment modal (if open)
2. Click **"Upgrade Now"** on the **Basic Plan** card
3. **Expected**: Payment modal opens immediately
4. **Expected**: Modal shows Basic plan details (₱499/month)

#### Step 1.4: Verify Modal Interaction
1. Open payment modal for any plan
2. Try entering card details
3. Click "Cancel" or "Close" button
4. **Expected**: Modal closes properly
5. **Expected**: No console errors

### Success Criteria
- ✅ Payment modal opens **immediately** on clicking "Upgrade Now"
- ✅ Correct plan details displayed in modal
- ✅ All payment methods selectable
- ✅ Modal closes properly on cancel
- ✅ No JavaScript errors in console

### Known Issues (Fixed)
- ❌ OLD: Modal did not open (useState + requestAnimationFrame race condition)
- ✅ FIXED: Modal now opens synchronously using direct state update

---

## 🎯 Test 2: Signout Dialog in Couple Profile Dropdown

### Objective
Verify that clicking "Sign Out" in the profile dropdown shows a confirmation modal and only logs out after user confirms.

### Prerequisites
- User logged in as **couple/individual**
- Couple Header visible in individual pages

### Test Steps

#### Step 2.1: Open Profile Dropdown
1. Login as individual user
2. Navigate to any individual page (dashboard, bookings, etc.)
3. Click **profile icon** in the top-right corner of CoupleHeader
4. **Expected**: Profile dropdown opens with menu items:
   - My Profile
   - Settings
   - Help & Support
   - Sign Out

#### Step 2.2: Click Sign Out (Cancel)
1. Click **"Sign Out"** in the dropdown
2. **Expected**: Confirmation modal appears with:
   - Title: "Sign Out"
   - Message: "Are you sure you want to sign out?"
   - Two buttons: "Cancel" and "Sign Out"
3. **Expected**: Dropdown **remains open** (does not close)
4. Click **"Cancel"** button
5. **Expected**: Confirmation modal closes
6. **Expected**: User **still logged in**
7. **Expected**: Dropdown **still open** (user can click other menu items)

#### Step 2.3: Click Sign Out (Confirm)
1. Click **profile icon** again (if dropdown closed)
2. Click **"Sign Out"**
3. **Expected**: Confirmation modal appears again
4. Click **"Sign Out"** button in the modal
5. **Expected**: User is logged out
6. **Expected**: Redirected to homepage or login page
7. **Expected**: User session cleared

#### Step 2.4: Verify Dropdown Behavior
1. Login again
2. Open profile dropdown
3. Click **"My Profile"** (or any other menu item)
4. **Expected**: Dropdown closes immediately (no confirmation needed)
5. **Expected**: Navigate to profile page

### Success Criteria
- ✅ Clicking "Sign Out" shows confirmation modal
- ✅ Dropdown **does not close** when confirmation modal opens
- ✅ Clicking "Cancel" keeps user logged in and dropdown open
- ✅ Clicking "Sign Out" in modal logs out user
- ✅ Other menu items work normally (no confirmation)
- ✅ No console errors

### Known Issues (Fixed)
- ❌ OLD: Dropdown closed immediately when clicking "Sign Out", hiding the confirmation modal
- ✅ FIXED: Added `preventDropdownClose` state to keep dropdown open until user confirms

---

## 🎯 Test 3: Vendor Email Notifications for New Bookings

### Objective
Verify that vendor receives an email notification when a couple creates a new booking.

### Prerequisites
- **Backend configured**: Render environment variables `EMAIL_USER` and `EMAIL_PASS` set
- **Vendor account**: Vendor registered with valid email address
- **Service published**: Vendor has at least one active service

### Test Steps

#### Step 3.1: Create Test Booking
1. Login as **individual/couple** user
2. Navigate to **Services** page
3. Find a vendor service (e.g., Photography, Catering)
4. Click **"Book Now"** or **"Request Quote"**
5. Fill in booking details:
   - Event date (future date)
   - Event location
   - Budget range
   - Special requests (optional)
6. Submit booking request
7. **Expected**: Success message: "Booking request sent successfully!"

#### Step 3.2: Check Vendor Email
1. **Wait 30-60 seconds** for email delivery
2. Check **vendor's email inbox** (the email registered for the vendor account)
3. **Expected**: Email received with:
   - **Subject**: "New Booking Request - [Service Name]"
   - **From**: Wedding Bazaar (using EMAIL_USER from Render)
   - **Body contains**:
     - Customer name
     - Service requested
     - Event date
     - Event location
     - Budget range
     - Special requests (if provided)
     - Booking reference ID
4. **Check spam folder** if not in inbox

#### Step 3.3: Verify Email Content
1. Open the email
2. **Expected content**:
   ```
   Subject: New Booking Request - Photography Service
   
   Dear Vendor Name,
   
   You have received a new booking request!
   
   Customer Details:
   - Name: John Doe
   - Email: john@example.com
   - Phone: 09123456789
   
   Booking Details:
   - Service: Photography Service
   - Event Date: March 15, 2025
   - Event Location: Manila Hotel, Manila
   - Budget Range: ₱20,000 - ₱30,000
   - Special Requests: Need engagement shoot included
   
   Booking Reference: WB-2025-001234
   
   Please log in to your vendor dashboard to review and respond.
   
   Best regards,
   Wedding Bazaar Team
   ```

#### Step 3.4: Check Backend Logs (Optional)
1. Login to **Render dashboard**
2. Navigate to **weddingbazaar-web** service
3. Click **"Logs"** tab
4. Search for: `"Email sent successfully"` or `"New booking notification"`
5. **Expected**: Log entries showing successful email send

#### Step 3.5: Test Email Failure Handling
1. Create another booking
2. If email fails (e.g., wrong credentials):
   - **Expected**: Booking still created in database
   - **Expected**: User still sees success message
   - **Expected**: Backend logs show email error (but doesn't crash)

### Success Criteria
- ✅ Vendor receives email within 60 seconds of booking creation
- ✅ Email contains all booking details accurately
- ✅ Email subject and formatting are professional
- ✅ Email sent from configured EMAIL_USER address
- ✅ Booking saved to database regardless of email success/failure
- ✅ No backend crashes if email service unavailable

### Known Issues (Fixed)
- ❌ OLD: Email notifications not sent (missing EMAIL_USER/EMAIL_PASS on Render)
- ✅ FIXED: Email service fully implemented; only needs environment configuration

### Troubleshooting

**If email not received**:
1. Check Render environment variables:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```
2. Verify vendor email is correct in database
3. Check spam/junk folder
4. Check Render logs for email errors
5. Run diagnostic script: `node backend-deploy/utils/test-email-service.cjs`

**If email service crashes**:
1. Check Gmail app password is correct (not regular password)
2. Verify 2FA enabled on Gmail account
3. Check Render logs for specific error messages
4. Review `EMAIL_SERVICE_SETUP_COMPLETE.md` for configuration steps

---

## 🎯 Test 4: End-to-End Booking Flow (Integration Test)

### Objective
Verify the complete booking workflow including availability check, booking creation, and email notification.

### Test Steps

#### Step 4.1: Check Service Availability
1. Login as couple
2. Navigate to Services page
3. Select a service
4. Click on calendar to view available dates
5. **Expected**: Availability calendar shows:
   - Available dates (green/default)
   - Unavailable dates (grayed out, disabled)
   - Today and past dates disabled

#### Step 4.2: Select Available Date
1. Click on an **available future date**
2. **Expected**: Date selected (highlighted)
3. Fill in event location and budget
4. Click **"Request Quote"** or **"Book Now"**
5. **Expected**: Booking created successfully

#### Step 4.3: Verify Backend Processing
1. **Expected**: Backend console logs (in Render):
   ```
   [Bookings] Creating new booking...
   [Bookings] Booking created successfully: WB-2025-XXXXXX
   [Email] Sending booking notification to vendor...
   [Email] Email sent successfully
   ```

#### Step 4.4: Verify Frontend Feedback
1. **Expected**: Success message shown to user
2. Navigate to **My Bookings** page
3. **Expected**: New booking appears with status "Pending" or "Quote Requested"
4. **Expected**: Booking details match input

#### Step 4.5: Verify Vendor Notification
1. Check vendor email within 60 seconds
2. **Expected**: Email received with booking details
3. Login as **vendor** (if test vendor account available)
4. Navigate to **Vendor Bookings** page
5. **Expected**: New booking appears in vendor's booking list

### Success Criteria
- ✅ Availability calendar works correctly
- ✅ Booking created in database
- ✅ Vendor receives email notification
- ✅ Couple sees booking in "My Bookings"
- ✅ Vendor sees booking in "Vendor Bookings"
- ✅ All data accurate and consistent

---

## 📊 Test Results Template

Use this template to record your test results:

```markdown
## Test Execution Results

**Tester**: [Your Name]  
**Date**: [Date]  
**Environment**: Production (Firebase + Render)  

### Test 1: Payment Modal
- [ ] Step 1.1: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 1.2: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 1.3: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 1.4: ✅ PASS / ❌ FAIL - Notes: _______________
- **Overall**: ✅ PASS / ❌ FAIL

### Test 2: Signout Dialog
- [ ] Step 2.1: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 2.2: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 2.3: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 2.4: ✅ PASS / ❌ FAIL - Notes: _______________
- **Overall**: ✅ PASS / ❌ FAIL

### Test 3: Email Notifications
- [ ] Step 3.1: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 3.2: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 3.3: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 3.4: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 3.5: ✅ PASS / ❌ FAIL - Notes: _______________
- **Overall**: ✅ PASS / ❌ FAIL

### Test 4: End-to-End Booking
- [ ] Step 4.1: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 4.2: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 4.3: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 4.4: ✅ PASS / ❌ FAIL - Notes: _______________
- [ ] Step 4.5: ✅ PASS / ❌ FAIL - Notes: _______________
- **Overall**: ✅ PASS / ❌ FAIL

### Issues Found
1. [Issue description] - Severity: High/Medium/Low
2. [Issue description] - Severity: High/Medium/Low

### Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. ✅ Mark all features as **production-ready**
2. ✅ Update project documentation with test results
3. ✅ Monitor Render logs for any runtime errors
4. ✅ Set up email monitoring (check spam reports, bounce rates)
5. ✅ Consider adding automated tests for regression prevention

### If Tests Fail ❌
1. 📝 Document failure details (screenshots, error messages)
2. 🔍 Check browser console for JavaScript errors
3. 🔍 Check Render logs for backend errors
4. 🔧 Fix issues and redeploy
5. 🔄 Re-run failed tests

---

## 📞 Support Resources

- **Documentation**: See `EMAIL_SERVICE_SETUP_COMPLETE.md`, `RENDER_EMAIL_SETUP_QUICK.md`
- **Test Scripts**: `test-email-service.cjs`, `test-database-booking.cjs`
- **Deployment Logs**: Render Dashboard → Logs
- **Frontend Logs**: Browser Console (F12)
- **Database**: Neon Console → SQL Editor

---

**Good luck with testing! 🎉**
