# 🧪 Quick Post-Deployment Test Script

**Run these tests immediately after deployment**

---

## ✅ Test 1: Frontend Accessibility (DONE)

```powershell
# Already verified ✅
Invoke-WebRequest -Uri "https://weddingbazaarph.web.app"
# Result: 200 OK ✅
```

---

## ✅ Test 2: Backend Health (DONE)

```powershell
# Already verified ✅
curl https://weddingbazaar-web.onrender.com/api/health
# Result: 200 OK, Database Connected ✅
```

---

## ⏳ Test 3: Manual UI Testing

### A. Test Couple Cancellation
1. Open: https://weddingbazaarph.web.app
2. Login as couple (use test account)
3. Navigate to: Individual → Bookings
4. Find a booking with "Awaiting Quote" status
5. Click "Cancel Booking"
6. **Expected**: Modal appears with reason textarea
7. Try submitting without reason → Should show error
8. Enter reason: "Changed our wedding plans"
9. Submit → **Expected**: Success message, booking cancelled

**Result**: ☐ PASS | ☐ FAIL

---

### B. Test Vendor Cancellation
1. Open: https://weddingbazaarph.web.app
2. Login as vendor
3. Navigate to: Vendor → Bookings
4. Find a booking with "Pending Review" status
5. Look for **NEW "Cancel" button** (red)
6. Click "Cancel"
7. **Expected**: Cancellation modal with reason field
8. Try submitting without reason → Should show HTML5 required error
9. Enter reason: "Client didn't respond to follow-up"
10. Submit → **Expected**: Success, booking cancelled

**Result**: ☐ PASS | ☐ FAIL

---

### C. Test Report Issue (Couple)
1. Stay logged in as couple
2. Go to: Individual → Bookings
3. On ANY booking, click **"Report Issue"** (orange button)
4. **Expected**: Report modal opens
5. Select Report Type: "Cancellation Dispute"
6. **Expected**: Yellow-highlighted "Cancellation Reason" field appears
7. Fill in:
   - Subject: "Test cancellation dispute"
   - Description: "Testing the new cancellation reason feature"
   - Leave Cancellation Reason EMPTY
8. Click Submit → **Expected**: Validation error
9. Fill Cancellation Reason: "Vendor cancelled without refund"
10. Submit → **Expected**: Success message

**Result**: ☐ PASS | ☐ FAIL

---

### D. Test Report Issue (Vendor)
1. Login as vendor
2. Go to: Vendor → Bookings
3. On any booking, click **NEW "Report Issue"** button (orange)
4. **Expected**: Report modal opens (same as couple's)
5. Select "Cancellation Dispute"
6. **Expected**: Yellow cancellation reason field appears
7. Try submitting without cancellation reason → Validation error
8. Fill all fields including cancellation reason
9. Submit → **Expected**: Success

**Result**: ☐ PASS | ☐ FAIL

---

## ⏳ Test 4: Database Verification

### Check if cancellation reasons are being stored:

```sql
-- Run this in Neon SQL Console
-- https://console.neon.tech/

SELECT 
  id,
  booking_id,
  reporter_type,
  report_type,
  subject,
  cancellation_reason,
  status,
  created_at
FROM booking_reports
WHERE created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Results**:
- ✅ Rows with `cancellation_reason` populated
- ✅ `reporter_type` shows 'couple' or 'vendor'
- ✅ `report_type` shows 'cancellation_dispute'

**Result**: ☐ PASS | ☐ FAIL

---

## ⏳ Test 5: Admin Dashboard

1. Login as admin
2. Navigate to: Admin → Reports
3. Filter by: "Cancellation Dispute"
4. Find reports from Tests 3C and 3D
5. Click on a report to view details
6. **Expected**: Cancellation reason is visible in report details

**Result**: ☐ PASS | ☐ FAIL

---

## 🐛 If Tests Fail

### Browser Console Errors
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Screenshot and document
```

### Network Errors
```
1. Open DevTools → Network tab
2. Reproduce the error
3. Check failed requests
4. Look at Response tab for error details
```

### Backend Logs
```
1. Go to Render dashboard
2. Select weddingbazaar-web service
3. Click "Logs" tab
4. Look for error messages around the time of test
```

---

## 📊 Test Results Summary

| Test | Component | Status | Notes |
|------|-----------|--------|-------|
| 1 | Frontend Access | ✅ PASS | 200 OK |
| 2 | Backend Health | ✅ PASS | Connected |
| 3A | Couple Cancel | ☐ | |
| 3B | Vendor Cancel | ☐ | |
| 3C | Couple Report | ☐ | |
| 3D | Vendor Report | ☐ | |
| 4 | Database | ☐ | |
| 5 | Admin View | ☐ | |

---

## 🎉 All Tests Passed?

If all tests pass:
1. ✅ Feature is working correctly
2. ✅ Update project documentation
3. ✅ Notify stakeholders
4. ✅ Close related issues
5. ✅ Celebrate! 🎊

If tests fail:
1. 🐛 Document the issue
2. 🔍 Check console/network/backend logs
3. 🔧 Debug and fix
4. 🚀 Redeploy if needed
5. 🧪 Re-run tests

---

## 📝 Quick Bug Report Template

```
**Test Failed**: [Test Number and Name]
**What Happened**: [Describe the issue]
**Expected**: [What should have happened]
**Actual**: [What actually happened]
**Browser**: [Chrome/Firefox/Safari/Edge + version]
**Console Errors**: [Paste error messages]
**Screenshots**: [Attach if available]
**Time**: [When the test was run]
```

---

## ⚡ Quick Commands Reference

```powershell
# Check frontend
Invoke-WebRequest -Uri "https://weddingbazaarph.web.app"

# Check backend health
curl https://weddingbazaar-web.onrender.com/api/health

# View recent deployments (Firebase)
firebase hosting:channel:list

# Check Render deployment status
# Go to: https://dashboard.render.com/
```

---

**Test Date**: __________  
**Tester**: __________  
**Overall Status**: ☐ ALL PASS | ☐ SOME FAIL | ☐ ALL FAIL  

---

**Next Steps After Testing**:
1. If all pass → Document success and move to next feature
2. If some fail → Debug, fix, and re-test failed tests
3. If all fail → Check if deployment actually completed successfully

---

**Quick Test Script Version**: 1.0  
**Created**: November 8, 2025  
**For Deployment**: 2d61649
