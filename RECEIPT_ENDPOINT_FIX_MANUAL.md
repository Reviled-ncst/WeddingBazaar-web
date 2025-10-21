# 🧾 Receipt Endpoint Fix - Manual Deployment Guide

## Issue Identified
The receipt viewing feature is failing with a **500 Internal Server Error** because of a database column name mismatch.

### Root Cause
- The `receiptGenerator.cjs` creates records with columns: `amount_paid`, `payment_reference`, `total_amount`
- The `payments.cjs` GET endpoint expects columns: `amount`, `payment_intent_id`, `total_paid`

## ✅ Solution Applied

### File: `backend-deploy/routes/payments.cjs`
**Line 865-884** - Updated the mapping logic:

```javascript
res.json({
  success: true,
  receipts: receipts.map(r => ({
    id: r.id,
    bookingId: r.booking_id,
    receiptNumber: r.receipt_number,
    paymentType: r.payment_type,
    amount: r.amount_paid || r.amount, // Support both column names
    currency: r.currency || 'PHP',
    paymentMethod: r.payment_method,
    paymentIntentId: r.payment_reference || r.payment_intent_id, // Support both
    paidBy: r.couple_id || r.paid_by,
    paidByName: r.paid_by_name || 'Customer',
    paidByEmail: r.paid_by_email || '',
    vendorId: r.vendor_id,
    vendorName: r.vendor_name,
    serviceType: r.service_type,
    eventDate: r.event_date,
    totalPaid: r.total_amount || r.total_paid || r.amount_paid,
    remainingBalance: r.remaining_balance || 0,
    notes: r.notes,
    createdAt: r.created_at
  }))
});
```

## 🚀 Manual Deployment Steps

### Option 1: Direct File Edit on Render

1. **Log into Render Dashboard**
   - Go to: https://dashboard.render.com
   - Select your backend service

2. **Access Shell**
   - Click **"Shell"** tab
   - Navigate to the file:
   ```bash
   cd /opt/render/project/src/backend-deploy/routes
   nano payments.cjs
   ```

3. **Apply the Fix**
   - Find line ~865 (the `res.json` mapping)
   - Replace the mapping code with the solution above
   - Save: `Ctrl+O`, `Enter`, `Ctrl+X`

4. **Restart Service**
   - Go to **"Manual Deploy"** tab
   - Click **"Deploy latest commit"**

### Option 2: Push Without History (Clean Push)

If you can't access Render shell, create a new repository:

1. Create new GitHub repo without the problematic commits
2. Copy only the essential files
3. Push clean history
4. Update Render to use new repository

## 🧪 Testing After Deployment

### Test the Receipt Endpoint

```powershell
# Test with booking ID 1760962499 (has a deposit payment)
$response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/payment/receipts/1760962499" -Method GET

# Should return:
# {
#   "success": true,
#   "receipts": [...]
# }
```

### Test in Production UI

1. Go to: https://weddingbazaarph.web.app
2. Login as couple (vendor0qw@gmail.com)
3. Navigate to Bookings page
4. Find booking with "Deposit Paid" status
5. Click **"View Receipt"** button
6. Should display receipt with payment details

## 📊 Expected Results

✅ Receipt endpoint returns 200 OK  
✅ Receipt data properly mapped  
✅ Frontend displays receipt correctly  
✅ Download receipt feature works  

## 🔧 Frontend Changes Already Deployed

The frontend has been updated with enhanced error logging:
- Better error messages for network issues
- Detailed console logging for debugging
- Booking ID type conversion (string/number handling)

Frontend URL: https://weddingbazaarph.web.app  
**Status**: ✅ Already deployed with fixes

## 📝 Next Steps

1. Apply backend fix (manual or via clean push)
2. Wait 2-3 minutes for Render deployment
3. Test receipt endpoint directly
4. Test in production UI
5. Verify booking ID 1760962499 shows receipt

## 🚨 Temporary Workaround

If immediate fix is not possible, users can still:
- See payment status in booking cards
- Make new payments
- View booking details

The receipt feature is the only affected functionality.
