# 🧪 Transaction History Testing Guide

## Quick Test (2 minutes)

### 1. Open Page
URL: https://weddingbazaarph.web.app/individual/transactions

### 2. Open Browser Console (F12)
Press `F12` → Click "Console" tab

### 3. Check Logs
Look for:
```
📊 [TRANSACTION HISTORY] Loading payment receipts for user: abc123...
📊 [TRANSACTION HISTORY] API URL: https://weddingbazaar-web.onrender.com
📊 [TRANSACTION HISTORY] Response status: 200
✅ [TRANSACTION HISTORY] Loaded: { receipts: X, totalSpent: ₱XXX, ... }
```

### 4. Check Network (F12 → Network tab)
Should see:
- **ONE request**: `GET /api/payment/receipts/user/:userId`
- **Status**: `200 OK`
- **Response time**: < 1 second

### 5. Verify Page Shows
- [ ] Statistics cards (Total Spent, Total Payments, etc.)
- [ ] Transaction cards with receipt details
- [ ] No error messages
- [ ] Loading spinner briefly, then data

---

## Expected Results

### If User Has Payments
✅ Statistics show correct totals  
✅ Transaction cards display receipts  
✅ Vendor names, amounts, dates visible  
✅ Filters and sorting work  

### If User Has NO Payments Yet
✅ Empty state message shows  
✅ "No transactions yet" placeholder  
✅ Statistics show ₱0.00  
✅ No errors in console  

---

## Troubleshooting

### Console shows "401 Unauthorized"
**Issue**: User not logged in  
**Fix**: Go to homepage, click "Login", then retry

### Console shows "404 Not Found"
**Issue**: Backend route not deployed  
**Fix**: Wait for Render deployment to complete (auto-deploys on git push)

### Console shows "Failed to fetch"
**Issue**: API URL incorrect or CORS issue  
**Fix**: Check `.env.production` has correct `VITE_API_URL`

### Page shows "No receipts found"
**Reason**: User has no payments yet (this is normal!)  
**To test**: 
1. Go to Services page
2. Book a vendor
3. Make a test payment
4. Return to Transaction History

---

## Database Verification

If you have Neon SQL Console access, run:

```sql
-- Check receipts for a specific user
SELECT 
  u.email,
  b.id as booking_id,
  b.couple_id,
  b.status,
  b.service_type,
  r.receipt_number,
  r.payment_type,
  r.amount / 100.0 as amount_pesos,
  r.created_at as payment_date,
  v.business_name as vendor
FROM users u
LEFT JOIN bookings b ON b.couple_id = u.id
LEFT JOIN receipts r ON r.booking_id = CAST(b.id AS TEXT)
LEFT JOIN vendors v ON b.vendor_id = v.id
WHERE u.email = 'YOUR_EMAIL_HERE'
ORDER BY r.created_at DESC;
```

Replace `YOUR_EMAIL_HERE` with the logged-in user's email.

---

## API Test (Manual)

If you want to test the API directly:

```bash
# Replace USER_ID with actual user ID from console.log
curl https://weddingbazaar-web.onrender.com/api/payment/receipts/user/USER_ID
```

Expected response:
```json
{
  "success": true,
  "receipts": [ /* array of receipts */ ],
  "statistics": {
    "totalSpent": 1500000,
    "totalSpentFormatted": "₱15,000.00",
    "totalPayments": 3,
    "uniqueBookings": 2,
    "uniqueVendors": 2,
    "averagePayment": 500000,
    "latestPayment": "2025-01-15T10:30:00Z",
    "oldestPayment": "2025-01-10T14:20:00Z"
  }
}
```

---

## Success Checklist

- [ ] Page loads without errors
- [ ] Console shows transaction history logs
- [ ] Network shows single API call
- [ ] Statistics cards display correctly
- [ ] Transaction cards render (if data exists)
- [ ] Filters work (payment method, type, search)
- [ ] Sorting works (date, amount, vendor)
- [ ] No JavaScript errors in console

---

## Report Issues

If you find issues, please report:

1. **Browser Console Logs** (F12 → Console tab, screenshot)
2. **Network Request** (F12 → Network tab, click request, screenshot response)
3. **User ID** (from console.log output)
4. **Expected vs Actual** behavior
5. **Steps to reproduce**

---

## Next Steps

After testing:
1. ✅ Verify transaction history works
2. ✅ Test with real payment flow
3. ✅ Test filters and sorting
4. 🚧 Plan enhancements (export PDF, email receipt, etc.)

---

**Last Updated**: January 2025  
**Status**: ✅ DEPLOYED - Ready for Testing
