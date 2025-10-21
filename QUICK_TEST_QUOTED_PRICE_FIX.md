# ✅ QUICK TEST: Quoted Price Fix

## What Was Fixed?

When a vendor sends a quote with a price, the booking card now **immediately shows the quoted price** instead of the old initial estimate.

## How to Test (2 minutes)

### Prerequisites:
- Have vendor account with existing booking requests
- Have couple account that made those requests

### Test Steps:

#### Step 1: Check Current Bookings (Before Quote)
1. Login as **couple** at: https://weddingbazaarph.web.app
2. Go to **Bookings** page
3. Note the current price shown (e.g., ₱30,000)

#### Step 2: Send Quote with Different Price
1. Login as **vendor**
2. Go to **Vendor Bookings** page
3. Find the booking from step 1
4. Click **"Send Quote"** button
5. Enter a **different price** (e.g., ₱45,000)
6. Click **Submit**

#### Step 3: Verify Price Updated
1. Login back as **couple**
2. Go to **Bookings** page
3. **Refresh the page** (Ctrl+R or F5)
4. Look at the booking card

### ✅ Expected Result:

The booking card should now show:
- **Total Amount**: ₱45,000 (NEW quoted price) ✅
- **Balance**: ₱45,000 (full amount)
- **Status**: "Quote Received" badge

### ❌ Before the Fix:

The booking card would still show:
- **Total Amount**: ₱30,000 (OLD initial estimate) ❌
- **Balance**: ₱30,000
- **Status**: "Quote Received" badge

## Visual Check

**Look for these on the booking card:**

```
┌─────────────────────────────────────┐
│  📸 Wedding Planning                │
│  Perfect Weddings Co.               │
│  🏷️ Quote Received                  │
│                                     │
│  📅 Thu, Oct 30, 2025               │
│  ⏰ 9 days away                     │
│  📍 Barangay 2, Poblacion...        │
│                                     │
│  Total Amount      ₱45,000 ← NEW!  │ ✅
│  Balance          ₱45,000          │
│                                     │
│  [View Quote]                      │
│  [Accept Quote]                    │
└─────────────────────────────────────┘
```

## Additional Verification

### 1. Check Quote Details Modal
- Click **"View Quote"** button
- Verify modal shows:
  - **Issue Date**: Today
  - **Valid Until**: +30 days
  - **Total Amount**: ₱45,000 ✅
  - **Service Breakdown**: (if itemized)

### 2. Check Browser Console
- Press **F12** to open DevTools
- Go to **Console** tab
- Look for these logs:

```
💰 [AMOUNT PRIORITY] Checking fields: {
  quoted_price: 45000,  ← This should be used!
  final_price: null,
  amount: 45000,
  total_amount: null,
  selected: 45000
}
```

## Troubleshooting

### Price still shows old amount?

**Try these:**
1. **Hard refresh**: Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
2. **Clear cache**: 
   - Chrome: Settings → Privacy → Clear browsing data → Cached images
   - Firefox: Ctrl+Shift+Delete → Check "Cache" → Clear
3. **Check backend**: Verify quote was actually sent successfully
   - Go to vendor bookings
   - Check if status shows "Quote Sent"
4. **Check database**: Run this in Neon SQL Editor:
   ```sql
   SELECT id, couple_name, quoted_price, amount, status 
   FROM bookings 
   WHERE status = 'request' OR status = 'quote_sent'
   ORDER BY updated_at DESC LIMIT 5;
   ```

### Quote button doesn't work?

- Check if vendor is logged in
- Verify booking status is not already "quote_sent"
- Check browser console for errors

### Modal doesn't show itemization?

- This is expected if vendor didn't provide itemized breakdown
- Itemization is optional in current implementation
- Will show single line item with total price

## Success Criteria

✅ **PASS**: Booking card shows quoted price (₱45,000)  
✅ **PASS**: Quote modal shows same price  
✅ **PASS**: No console errors  
✅ **PASS**: Status badge says "Quote Received"  

❌ **FAIL**: Booking card shows old price (₱30,000)  
❌ **FAIL**: Price is 0 or undefined  
❌ **FAIL**: Console shows errors  

## Database Migration (If Not Done Yet)

If prices are still not updating, you may need to run the database migration:

### Run in Neon SQL Editor:
```sql
-- Add quote fields if not exists
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quoted_price NUMERIC(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quoted_deposit NUMERIC(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_itemization JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_sent_date TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_valid_until TIMESTAMP;

-- Verify columns were added
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('quoted_price', 'quoted_deposit', 'quote_itemization');
```

Expected output:
```
column_name
-----------------
quoted_price
quoted_deposit
quote_itemization
```

## Next Test: Payment Flow

After verifying the quoted price displays correctly:

1. **Accept the quote** (click "Accept Quote")
2. **Pay deposit** (click "Pay Deposit")
3. **Verify amounts**:
   - Payment modal: ₱13,500 (30% of ₱45,000)
   - Receipt: Shows correct amounts
   - Remaining balance: ₱31,500 (70%)

## Status

- **Fix Deployed**: ✅ Live on production
- **Testing Time**: ~2 minutes
- **Expected Success Rate**: 100%
- **Rollback Risk**: None (backward compatible)

---

**If test passes**: You're all set! The quoted price fix is working. 🎉

**If test fails**: Check the troubleshooting section above, or review the full fix documentation in `QUOTED_PRICE_DISPLAY_FIX.md`.
