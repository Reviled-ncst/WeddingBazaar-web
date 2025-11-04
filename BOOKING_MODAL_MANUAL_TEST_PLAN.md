# 🧪 Booking Modal - Manual Test Plan

## Test Execution Date: November 3, 2025
## Tester: _____________
## Environment: Production (https://weddingbazaarph.web.app)

---

## ✅ Test 1: Step 1 - Date Selection (REQUIRED FIELD)

### Test Steps:
1. Open production site: https://weddingbazaarph.web.app
2. Navigate to Services page
3. Click on any service
4. Click "Request Booking" button
5. Verify modal opens with Step 1: Date selection

### Expected Results:
- [ ] Modal displays header: "Book [Service Name]"
- [ ] Step indicator shows "📅 Date" as active (step 1 of 5)
- [ ] Calendar component is visible
- [ ] Heading shows: "📅 When is your event?"
- [ ] Description shows: "Select an available date from the calendar"

### Test Case 1A: Missing Date Validation
**Steps:**
1. Do NOT select a date
2. Click "Next" button

**Expected:**
- [ ] Error message appears: "Event date is required"
- [ ] Error has red background and alert icon
- [ ] Form does NOT proceed to step 2

### Test Case 1B: Valid Date Selection
**Steps:**
1. Select a future date (e.g., December 25, 2025)
2. Verify date is highlighted
3. Click "Next" button

**Expected:**
- [ ] No error message appears
- [ ] Form proceeds to Step 2 (Location)
- [ ] Progress indicator shows 20% complete

**Data Captured:**
- Event Date: _______________

---

## ✅ Test 2: Step 2 - Location Selection (REQUIRED FIELD)

### Test Steps:
1. After completing Step 1, verify Step 2 appears

### Expected Results:
- [ ] Step indicator shows "📍 Location" as active (step 2 of 5)
- [ ] Heading shows: "📍 Where will it be?"
- [ ] Location picker/search field is visible
- [ ] "Back" button is now visible

### Test Case 2A: Missing Location Validation
**Steps:**
1. Leave location field empty
2. Click "Next" button

**Expected:**
- [ ] Error message appears: "Location is required"
- [ ] Form does NOT proceed to step 3

### Test Case 2B: Valid Location Entry
**Steps:**
1. Enter location: "Manila, Philippines" (or any location)
2. Click "Next" button

**Expected:**
- [ ] No error message appears
- [ ] Form proceeds to Step 3 (Event Details)
- [ ] Progress indicator shows 40% complete

**Data Captured:**
- Event Location: _______________

### Test Case 2C: Back Navigation
**Steps:**
1. Click "← Back" button

**Expected:**
- [ ] Returns to Step 1 (Date)
- [ ] Previously selected date is still visible/selected
- [ ] No data loss

---

## ✅ Test 3: Step 3 - Event Details (GUEST COUNT REQUIRED)

### Expected Results:
- [ ] Step indicator shows "👥 Details" as active (step 3 of 5)
- [ ] Heading shows: "⏰ Event Details"
- [ ] Two fields visible:
  - [ ] Event Time (Optional)
  - [ ] Number of Guests * (Required)

### Test Case 3A: Missing Guest Count Validation
**Steps:**
1. Leave guest count empty
2. Click "Next" button

**Expected:**
- [ ] Error message appears: "Number of guests is required"
- [ ] Form does NOT proceed to step 4

### Test Case 3B: Invalid Guest Count (Zero or Negative)
**Steps:**
1. Enter guest count: "0"
2. Click "Next" button

**Expected:**
- [ ] Error message appears: "Please enter a valid number"
- [ ] Form does NOT proceed

### Test Case 3C: Valid Guest Count - Estimated Quote Display
**Steps:**
1. Enter guest count: "100"
2. Observe the display

**Expected:**
- [ ] Estimated quote box appears with green gradient
- [ ] Shows "Estimated Total: ₱[Amount]"
- [ ] Shows sparkle icon
- [ ] Shows message: "Based on 100 guests. Full breakdown shown after submission."
- [ ] Calculation is correct based on service category:
  - Photography: ₱15,000 base + (₱150 × 100) + 12% tax = ₱33,600.00
  - Catering: ₱25,000 base + (₱500 × 100) + 12% tax = ₱84,000.00
  - Venue: ₱50,000 base + (₱300 × 100) + 12% tax = ₱89,600.00

**Data Captured:**
- Guest Count: _______________
- Event Time (Optional): _______________
- Estimated Quote: _______________

### Test Case 3D: Progress to Step 4
**Steps:**
1. Fill valid guest count
2. Optionally fill event time
3. Click "Next"

**Expected:**
- [ ] Form proceeds to Step 4 (Budget)
- [ ] Progress indicator shows 60% complete

---

## ✅ Test 4: Step 4 - Budget & Requirements (BUDGET REQUIRED)

### Expected Results:
- [ ] Step indicator shows "💰 Budget" as active (step 4 of 5)
- [ ] Heading shows: "💰 Budget & Requirements"
- [ ] Two fields visible:
  - [ ] Budget Range * (Required dropdown)
  - [ ] Special Requests (Optional textarea)

### Test Case 4A: Missing Budget Validation
**Steps:**
1. Leave budget dropdown at default ("Select your budget")
2. Click "Next" button

**Expected:**
- [ ] Error message appears: "Budget range is required"
- [ ] Form does NOT proceed to step 5

### Test Case 4B: Valid Budget Selection
**Steps:**
1. Select budget: "₱50,000-₱100,000"
2. Optionally enter special requests
3. Click "Next" button

**Expected:**
- [ ] No error message appears
- [ ] Form proceeds to Step 5 (Contact Info)
- [ ] Progress indicator shows 80% complete

**Data Captured:**
- Budget Range: _______________
- Special Requests: _______________

---

## ✅ Test 5: Step 5 - Contact Information (NAME & PHONE REQUIRED)

### Expected Results:
- [ ] Step indicator shows "📞 Contact" as active (step 5 of 5)
- [ ] Heading shows: "📞 Contact Information"
- [ ] Four fields visible:
  - [ ] Full Name * (Required)
  - [ ] Phone Number * (Required)
  - [ ] Email Address (Optional)
  - [ ] Preferred Contact Method (Email/Phone/Message buttons)

### Test Case 5A: Auto-Fill from User Profile
**Prerequisite:** User must be logged in

**Expected:**
- [ ] Full Name is pre-filled with user's name
- [ ] Phone Number is pre-filled with user's phone
- [ ] Email is pre-filled with user's email

### Test Case 5B: Missing Required Fields Validation
**Steps:**
1. Clear Full Name and Phone Number fields
2. Click "Submit Request" button

**Expected:**
- [ ] Error message appears: "Name is required"
- [ ] Error message appears: "Phone number is required"
- [ ] Form does NOT submit

### Test Case 5C: Invalid Email Validation (Optional Field)
**Steps:**
1. Fill required fields
2. Enter invalid email: "notanemail"
3. Click "Submit Request"

**Expected:**
- [ ] Error message appears: "Please enter a valid email"
- [ ] Form does NOT submit

### Test Case 5D: Valid Submission
**Steps:**
1. Ensure all required fields are filled:
   - Full Name: "John Doe"
   - Phone: "+639171234567"
2. Optionally fill email
3. Select preferred contact method
4. Click "Submit Request"

**Expected:**
- [ ] Button shows loading state: "Submitting..."
- [ ] Spinner icon appears
- [ ] Button is disabled during submission

**Data Captured:**
- Full Name: _______________
- Phone Number: _______________
- Email: _______________
- Preferred Contact Method: _______________

---

## ✅ Test 6: Success Modal Display (IMMEDIATE DISPLAY - NO DELAY)

### Expected Results (CRITICAL UX TEST):
**After clicking "Submit Request" with valid data:**

- [ ] **IMMEDIATE DISPLAY**: Success modal appears instantly (< 100ms)
- [ ] **NO DELAY**: No 2-second wait before modal appears
- [ ] **NO INLINE MESSAGE**: Original modal does NOT show "Success!" message
- [ ] **CLEAN TRANSITION**: Booking modal is replaced by success modal

### Success Modal Content:
- [ ] Modal has gradient header (pink to purple)
- [ ] Shows large success icon (checkmark or celebration)
- [ ] Displays heading: "Booking Request Submitted!" or similar
- [ ] Shows booking reference number
- [ ] Displays all booking details:
  - [ ] Service Name
  - [ ] Vendor Name
  - [ ] Event Date
  - [ ] Event Location (if entered)
  - [ ] Guest Count
  - [ ] Budget Range
  - [ ] Estimated Quote (if calculated)

### Success Modal Actions:
- [ ] Three action buttons visible:
  - [ ] "View Bookings" button (primary - pink/purple gradient)
  - [ ] "Browse Services" button (secondary)
  - [ ] "Close" or "×" button
- [ ] Auto-close timer visible (10 seconds)

### Test Case 6A: View Bookings Button
**Steps:**
1. Click "View Bookings" button

**Expected:**
- [ ] Navigates to `/individual/bookings` page
- [ ] New booking appears in the list
- [ ] Booking status shows "Awaiting Quote" or similar

### Test Case 6B: Browse Services Button
**Steps:**
1. Submit a booking (return to success modal)
2. Click "Browse Services" button

**Expected:**
- [ ] Navigates to services page
- [ ] Modal closes
- [ ] Can browse and book another service

### Test Case 6C: Auto-Close Timer
**Steps:**
1. Submit a booking
2. Wait 10 seconds without clicking anything

**Expected:**
- [ ] Modal automatically closes after 10 seconds
- [ ] Returns to previous page or closes modal

---

## ✅ Test 7: Data Integrity - Full End-to-End Flow

### Test Steps:
1. Complete entire booking flow with the following data:
   - Date: December 25, 2025
   - Location: Manila, Philippines
   - Guest Count: 150
   - Event Time: 14:00
   - Budget: ₱100,000-₱200,000
   - Special Requests: "Need outdoor setup with canopy"
   - Name: John Doe
   - Phone: +639171234567
   - Email: john@example.com

2. Submit booking
3. Click "View Bookings"
4. Find the newly created booking

### Expected Results:
- [ ] All entered data is correctly saved:
  - [ ] Event Date: December 25, 2025
  - [ ] Location: Manila, Philippines
  - [ ] Guest Count: 150
  - [ ] Event Time: 14:00 or 2:00 PM
  - [ ] Budget Range: ₱100,000-₱200,000
  - [ ] Special Requests: "Need outdoor setup with canopy"
  - [ ] Contact Person: John Doe
  - [ ] Contact Phone: +639171234567
  - [ ] Contact Email: john@example.com
- [ ] Booking has unique reference number
- [ ] Booking status is "Awaiting Quote" or similar
- [ ] Booking is linked to correct service
- [ ] Booking is linked to correct vendor

---

## ✅ Test 8: Progress Indicator Accuracy

### Expected Progress at Each Step:
- [ ] Step 1 (Date only): 0% → 20%
- [ ] Step 2 (Date + Location): 20% → 40%
- [ ] Step 3 (+ Guest Count): 40% → 60%
- [ ] Step 4 (+ Budget): 60% → 80%
- [ ] Step 5 (+ Contact Info): 80% → 100%

### Visual Progress Bar:
- [ ] Progress bar fills from left to right
- [ ] Pink/purple gradient color
- [ ] Smooth transition animation

---

## ✅ Test 9: Navigation - Back and Forth

### Test Steps:
1. Fill Step 1 (Date)
2. Proceed to Step 2
3. Fill Step 2 (Location)
4. Click "← Back" to Step 1
5. Verify date is still selected
6. Click "Next" to Step 2
7. Verify location is still filled
8. Repeat for all steps

### Expected Results:
- [ ] **NO DATA LOSS**: All previously entered data is preserved
- [ ] Back button works at all steps except Step 1
- [ ] Next button proceeds only when required fields are filled
- [ ] Progress indicator updates correctly when going back

---

## ✅ Test 10: Error Handling

### Test Case 10A: Network Error During Submission
**Steps:**
1. Fill entire form correctly
2. Disconnect internet before submitting
3. Click "Submit Request"

**Expected:**
- [ ] Error message appears: "Failed to submit booking request. Please try again."
- [ ] Error has red background
- [ ] Form remains on Step 5
- [ ] All data is preserved
- [ ] Can retry after reconnecting

### Test Case 10B: Availability Check Failure
**If date is unavailable:**
- [ ] Error message shows: "This date is not available. Please select a different date."
- [ ] User is prompted to select different date
- [ ] Submission is prevented

---

## 📊 Test Summary

**Total Test Cases**: 30+  
**Passed**: _____ / 30+  
**Failed**: _____ / 30+  
**Blocked**: _____ / 30+  

### Critical Issues Found:
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Minor Issues Found:
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Notes:
_____________________________________
_____________________________________
_____________________________________

---

## ✅ Sign-Off

**Tested By**: _______________  
**Date**: November 3, 2025  
**Production URL**: https://weddingbazaarph.web.app  
**Status**: ☐ PASS / ☐ FAIL / ☐ NEEDS REVISION

---

## 🚀 Next Steps (If Passing):
1. ☐ Test on mobile devices
2. ☐ Test on different browsers (Chrome, Firefox, Safari, Edge)
3. ☐ Test with different service categories
4. ☐ Test with edge cases (1 guest, 1000 guests, etc.)
5. ☐ Performance testing (load time, modal animations)

## 🐛 Next Steps (If Failing):
1. ☐ Document all failures with screenshots
2. ☐ Log issues in project management system
3. ☐ Fix critical bugs first
4. ☐ Retest after fixes deployed
5. ☐ Full regression test after all fixes
