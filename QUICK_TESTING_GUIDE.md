# 🧪 Quick Testing Guide - Payment & Service Fixes

## ✅ What to Test

### 1. Payment Balance Display

**URL**: https://weddingbazaarph.web.app/individual/bookings

**Expected Results**:
```
Booking Card:
├─ Total Amount: ₱50,000.00
├─ Total Paid: ₱15,000.00        ← Should NOT be ₱0.00
├─ Remaining Balance: ₱35,000.00 ← Should NOT be ₱50,000.00
└─ Status: "Deposit Paid"        ← Payment progress badge
```

**Test Steps**:
1. Log in to individual account
2. Go to "My Bookings"
3. Find a booking that has been paid (any amount)
4. Check "Total Paid" field
5. Check "Remaining Balance" field

**Pass Criteria**:
- ✅ Total Paid > ₱0.00 (for paid bookings)
- ✅ Remaining Balance < Total Amount (for partial payments)
- ✅ Remaining Balance = ₱0.00 (for fully paid bookings)

---

### 2. Service Vendor Names

**URL**: https://weddingbazaarph.web.app/individual/services

**Expected Results**:
```
Service Card:
├─ Service Name: "Wedding Photography"
├─ Vendor: "Test Wedding Services"  ← Real vendor name, NOT "Generated"
├─ Rating: ⭐ 4.67 (6 reviews)       ← Per-service rating
└─ Location: Real location
```

**Test Steps**:
1. Log in to individual account
2. Go to "Browse Services"
3. Look at service cards
4. Check vendor name under each service

**Pass Criteria**:
- ✅ Vendor name is real (e.g., "Test Wedding Services")
- ❌ NO "Generated Vendor Name #123" text
- ✅ Vendor name matches the actual vendor in database

---

### 3. Per-Service Ratings

**Expected**: Each service from the same vendor can have DIFFERENT ratings

**Example**:
```
Test Wedding Services (same vendor):
├─ Service 1: "Photography" - ⭐ 4.67 (6 reviews)  ← Service-specific
├─ Service 2: "Baker" - ⭐ 4.6 (5 reviews)          ← Different rating
└─ Service 3: "Catering" - ⭐ 0 (0 reviews)         ← No reviews yet
```

**Test Steps**:
1. Find services from the same vendor
2. Compare their ratings
3. Check if ratings differ based on service reviews

**Pass Criteria**:
- ✅ Services from same vendor can have different ratings
- ✅ Ratings reflect per-service reviews, not vendor total

---

## 🔍 Browser Console Checks

### Open Developer Tools
**Windows**: Press `F12` or `Ctrl+Shift+I`
**Mac**: Press `Cmd+Option+I`

### Check Bookings Page Console
Look for:
```javascript
✅ [Bookings] Mapped booking: {
  totalPaid: 15000,        // Should NOT be 0
  remainingBalance: 35000, // Should NOT be full amount
  paymentProgress: "deposit_paid"
}
```

### Check Services Page Console
Look for:
```javascript
✅ [Services] Service: {
  backendVendorName: "Test Wedding Services",  // Real name
  backendServiceRating: 4.67,                  // Per-service rating
  backendServiceReviewCount: 6,                // Per-service count
  finalVendorName: "Test Wedding Services"     // Uses backend data
}
```

---

## ❌ What NOT to See

### Bookings Page
- ❌ Total Paid: ₱0.00 (for paid bookings)
- ❌ Remaining Balance: (same as Total Amount)
- ❌ All bookings showing "Unpaid" when payments exist

### Services Page
- ❌ Vendor: "Generated Vendor Name #123"
- ❌ Vendor: "Professional Services Provider"
- ❌ All services from same vendor showing identical ratings

---

## 🚀 Quick Test Checklist

### Backend Verification (5 minutes)
```bash
cd c:\Games\WeddingBazaar-web
node test-service-enrichment.mjs
```

**Expected Output**:
```
✅ Fetched 4 services
✅ Fully enriched: 4 (100%)
✅ Sample vendor name: "Test Wedding Services"
```

### Frontend Verification (2 minutes)
1. ✅ Open https://weddingbazaarph.web.app
2. ✅ Hard refresh (Ctrl+Shift+R)
3. ✅ Log in
4. ✅ Check bookings page balance
5. ✅ Check services page vendor names

---

## 🆘 If Issues Persist

### Clear Browser Cache
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Hard refresh page (Ctrl+Shift+R)

### Check API Directly

**Bookings API**:
```
https://weddingbazaar-web.onrender.com/api/bookings/enhanced?userId=<your-user-id>
```

Look for:
```json
{
  "total_paid": 15000,        // Should exist
  "remaining_balance": 35000  // Should exist
}
```

**Services API**:
```
https://weddingbazaar-web.onrender.com/api/services
```

Look for:
```json
{
  "vendor_business_name": "Test Wedding Services", // Should exist
  "vendor_rating": 4.67,                           // Should exist
  "vendor_review_count": 6                         // Should exist
}
```

---

## 📊 Test Results Template

### Payment Balance Display
- [ ] Total Paid shows correct amount (not ₱0.00)
- [ ] Remaining Balance is reduced after payment
- [ ] Fully paid bookings show ₱0.00 remaining
- [ ] Payment progress badge shows correct status

### Service Vendor Names
- [ ] Vendor names are real (not "Generated")
- [ ] Vendor names match database vendors
- [ ] All services show vendor information

### Per-Service Ratings
- [ ] Services show specific ratings (not all same)
- [ ] Ratings match service reviews (not vendor total)
- [ ] Services without reviews show 0 rating

---

## ✅ Success Criteria

**All tests pass when:**
1. ✅ Bookings page shows accurate payment tracking
2. ✅ Services page shows real vendor names
3. ✅ Ratings are service-specific
4. ✅ No "Generated" vendor names
5. ✅ Console logs show correct data structure

**If all criteria met**: 🎉 **FIXES VERIFIED!**

---

## 📞 Support

**Documentation**:
- Technical details: `PAYMENT_TRACKING_AND_SERVICE_DETAILS_COMPLETE.md`
- Service fix: `SERVICE_DETAILS_FIX_COMPLETE.md`
- Backend fix: `BACKEND_PAYMENT_COLUMNS_FIX_IN_PROGRESS.md`

**Test Scripts**:
- `test-service-enrichment.mjs` - Verify backend enrichment
- `monitor-deployment-simple.ps1` - Check deployment status

**Production URLs**:
- Frontend: https://weddingbazaarph.web.app
- Backend: https://weddingbazaar-web.onrender.com
