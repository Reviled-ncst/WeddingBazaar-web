# 🧪 Cancellation Reason Testing Guide

**Quick Test Script for Cancellation Reason Feature**

---

## ✅ Pre-Test Checklist

- [ ] Backend deployed to Render with latest changes
- [ ] Frontend deployed to Firebase with latest build
- [ ] Database has `cancellation_reason` column in `booking_reports` table
- [ ] Test accounts ready (couple and vendor)

---

## 🧑‍💼 Test 1: Couple Direct Cancellation

**Scenario**: Couple cancels a pending booking request

```
STEPS:
1. Login as couple (test account)
2. Navigate to: /individual/bookings
3. Find booking with status "Awaiting Quote"
4. Click "Cancel Booking" button
5. Confirm modal appears
6. Leave reason field EMPTY
7. Click "Yes, Cancel Booking"
   ✅ EXPECTED: Error message "Please provide a reason"
8. Enter reason: "Changed our minds about the venue"
9. Click "Yes, Cancel Booking"
   ✅ EXPECTED: Success message, booking status → cancelled
10. Refresh page
    ✅ EXPECTED: Booking shows as cancelled
```

**PASS** ☐ | **FAIL** ☐

---

## 🏢 Test 2: Vendor Direct Cancellation

**Scenario**: Vendor cancels a pending booking

```
STEPS:
1. Login as vendor (test account)
2. Navigate to: /vendor/bookings
3. Find booking with status "Pending Review"
4. Click "Cancel" button (red button)
5. Cancellation modal appears
6. Leave "Reason for Cancellation" field EMPTY
7. Click "Confirm Cancellation"
   ✅ EXPECTED: HTML5 validation error (required field)
8. Enter reason: "Double-booked for this date"
9. Click "Confirm Cancellation"
   ✅ EXPECTED: Success message, booking cancelled
10. Refresh page
    ✅ EXPECTED: Booking shows as cancelled
```

**PASS** ☐ | **FAIL** ☐

---

## 📝 Test 3: Couple Cancellation Dispute Report

**Scenario**: Couple reports a cancellation dispute

```
STEPS:
1. Login as couple
2. Navigate to: /individual/bookings
3. Find ANY booking (any status)
4. Click "Report Issue" button (orange)
5. Report modal opens
6. Select "Issue Type" → "Cancellation Dispute"
   ✅ EXPECTED: Yellow "Cancellation Reason" field appears
7. Fill in:
   - Subject: "Vendor cancelled without refund"
   - Description: "The vendor cancelled our booking 2 weeks before the event and refused to refund our deposit."
   - Leave Cancellation Reason EMPTY
8. Click "Submit Report"
   ✅ EXPECTED: Validation error "Cancellation reason is required for cancellation disputes"
9. Fill Cancellation Reason: "Vendor initiated cancellation, violated refund policy"
10. Click "Submit Report"
    ✅ EXPECTED: Success message, report submitted
```

**PASS** ☐ | **FAIL** ☐

---

## 🏪 Test 4: Vendor Cancellation Dispute Report

**Scenario**: Vendor reports a cancellation dispute

```
STEPS:
1. Login as vendor
2. Navigate to: /vendor/bookings
3. Find ANY booking
4. Click "Report Issue" button (orange)
5. Report modal opens
6. Select "Issue Type" → "Cancellation Dispute"
   ✅ EXPECTED: Yellow "Cancellation Reason" field appears
7. Fill in:
   - Subject: "Client cancelled last minute"
   - Description: "Client cancelled 24 hours before the event, requesting full refund despite our policy."
   - Leave Cancellation Reason EMPTY
8. Click "Submit Report"
   ✅ EXPECTED: Validation error
9. Fill Cancellation Reason: "Client cancelled after deadline, no refund per contract"
10. Click "Submit Report"
    ✅ EXPECTED: Success message
```

**PASS** ☐ | **FAIL** ☐

---

## 📊 Test 5: Database Verification

**Scenario**: Verify cancellation reasons are stored correctly

```sql
-- Run this query in Neon SQL Console

-- Check booking reports with cancellation reasons
SELECT 
  id,
  booking_id,
  reporter_type,
  report_type,
  subject,
  description,
  cancellation_reason,
  status,
  created_at
FROM booking_reports
WHERE report_type = 'cancellation_dispute'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Results**:
- ✅ `cancellation_reason` field is populated for dispute reports
- ✅ `reporter_type` shows 'couple' or 'vendor'
- ✅ `report_type` shows 'cancellation_dispute'
- ✅ Status is 'open'

**PASS** ☐ | **FAIL** ☐

---

## 🔍 Test 6: Admin Dashboard View

**Scenario**: Admin can view cancellation reasons

```
STEPS:
1. Login as admin
2. Navigate to: /admin/reports
3. Filter by Report Type: "Cancellation Dispute"
4. Click on a report from Test 3 or Test 4
   ✅ EXPECTED: Modal shows full report details
   ✅ EXPECTED: Cancellation reason is visible
   ✅ EXPECTED: Can see reporter type (couple/vendor)
```

**PASS** ☐ | **FAIL** ☐

---

## 🎯 Test 7: Edge Cases

### A. Report without cancellation dispute
```
1. Submit report with type "Payment Issue"
2. Verify cancellation reason field does NOT appear
3. Submit successfully without cancellation reason
   ✅ EXPECTED: Success, no validation errors
```

**PASS** ☐ | **FAIL** ☐

### B. Switch report types mid-form
```
1. Open report modal
2. Select "Cancellation Dispute" → Yellow field appears
3. Fill cancellation reason: "Test reason"
4. Change type to "Service Issue"
   ✅ EXPECTED: Yellow field disappears
5. Change back to "Cancellation Dispute"
   ✅ EXPECTED: Yellow field reappears (empty)
```

**PASS** ☐ | **FAIL** ☐

### C. Long cancellation reason
```
1. Enter 500+ character cancellation reason
2. Submit report
   ✅ EXPECTED: Success (no character limit)
```

**PASS** ☐ | **FAIL** ☐

---

## 🔄 Test 8: Cancellation Request Flow (Paid Bookings)

**Scenario**: Couple requests cancellation for paid booking

```
STEPS:
1. Login as couple
2. Find booking with status "Fully Paid"
3. Click "Request Cancellation"
4. Confirm modal appears
5. Leave reason field EMPTY
6. Click "Submit Cancellation Request"
   ✅ EXPECTED: Error (reason required)
7. Enter reason: "Family emergency, need to reschedule"
8. Submit
   ✅ EXPECTED: Status → pending_cancellation
   ✅ EXPECTED: Awaits admin/vendor approval
```

**PASS** ☐ | **FAIL** ☐

---

## 📋 Test Results Summary

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Couple Direct Cancellation | ☐ Pass ☐ Fail | |
| 2 | Vendor Direct Cancellation | ☐ Pass ☐ Fail | |
| 3 | Couple Dispute Report | ☐ Pass ☐ Fail | |
| 4 | Vendor Dispute Report | ☐ Pass ☐ Fail | |
| 5 | Database Verification | ☐ Pass ☐ Fail | |
| 6 | Admin Dashboard View | ☐ Pass ☐ Fail | |
| 7A | Edge Case: No Dispute | ☐ Pass ☐ Fail | |
| 7B | Edge Case: Type Switch | ☐ Pass ☐ Fail | |
| 7C | Edge Case: Long Reason | ☐ Pass ☐ Fail | |
| 8 | Cancellation Request | ☐ Pass ☐ Fail | |

---

## 🐛 Bug Reporting

If any test fails, document:

```
Test Number: ___
What Happened: 
Expected Behavior:
Actual Behavior:
Browser: 
Console Errors:
Screenshots:
```

---

## ✅ Final Verification

After all tests pass:

- [ ] All 10 tests passed
- [ ] No console errors
- [ ] Database correctly stores cancellation reasons
- [ ] Admin can view all submitted reports
- [ ] UX is intuitive and error messages are clear
- [ ] Mobile responsive (test on phone)

---

**Test Date**: __________  
**Tester Name**: __________  
**Environment**: ☐ Development ☐ Staging ☐ Production  
**Overall Status**: ☐ PASS ☐ FAIL ☐ NEEDS FIXES

---

## 🚀 Post-Test Actions

If all tests pass:
1. ✅ Mark feature as COMPLETE
2. ✅ Update project documentation
3. ✅ Notify stakeholders
4. ✅ Close related GitHub issues
5. ✅ Plan user training (if needed)

If tests fail:
1. 🐛 Document bugs in detail
2. 🔧 Fix issues in development
3. 🧪 Re-run failed tests
4. 📝 Update documentation

---

**Testing Script Version**: 1.0  
**Last Updated**: November 8, 2025
