# Quote Price Not Reflecting - Issue Analysis & Fix

## 🔍 Issue Description

When a vendor sends a quote with a specific price (e.g., ₱50,000), the price is not appearing in the individual/couple's booking view. Instead, they see the original `total_amount` from when the booking was created (often ₱0 or an estimate).

## 🐛 Root Cause

### Current Flow:
1. **Vendor sends quote** via SendQuoteModal
2. **Frontend** stores quote data in `notes` field: `QUOTE_SENT: {...quote data...}`
3. **Backend** updates `notes` but **DOES NOT update `total_amount`**
4. **Individual views booking** and sees old `total_amount` instead of quoted price

### Code Evidence:

**VendorBookings.tsx** (line ~1540):
```typescript
const quoteSummary = [
  `ITEMIZED QUOTE: ${quoteData.serviceItems.length} items`,
  `Items: ${quoteItemsSummary}`,
  `Subtotal: ${formatPHP(quoteData.pricing.subtotal)}`,
  `TOTAL: ${formatPHP(quoteData.pricing.total)}`, // ← Price is here
  // ...
].filter(Boolean).join(' | ');

// Updates notes but NOT total_amount
await bookingApiService.updateBookingStatus(
  selectedBooking.id, 
  'quote_sent', 
  quoteSummary // ← Only updates notes field
);
```

**booking-data-mapping.ts** (line 322):
```typescript
totalAmount: quoteData?.pricing?.total || totalAmount, // ← Tries to use quote price
```

**Problem**: The quote data structure in notes is a string, not a parsed JSON object, so `quoteData?.pricing?.total` is undefined.

## 🎯 Solution

### Option 1: Update Backend to Sync total_amount (RECOMMENDED)

When a quote is sent (`status='quote_sent'`), extract the total amount from the notes and update the `total_amount` field.

**Backend Fix** (`backend-deploy/routes/bookings.cjs`):

```javascript
// In the update booking status endpoint
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, vendor_notes } = req.body;
  
  let total_amount_update = null;
  let deposit_amount_update = null;
  
  // If status is quote_sent and notes contain pricing, extract it
  if (status === 'quote_sent' && vendor_notes) {
    try {
      // Extract total from notes (format: "TOTAL: ₱50,000")
      const totalMatch = vendor_notes.match(/TOTAL:\s*₱([\d,]+)/);
      if (totalMatch) {
        total_amount_update = parseInt(totalMatch[1].replace(/,/g, ''));
        console.log(`💰 Extracted quote total: ${total_amount_update}`);
      }
      
      // Extract downpayment if present
      const downpaymentMatch = vendor_notes.match(/Downpayment:\s*₱([\d,]+)/);
      if (downpaymentMatch) {
        deposit_amount_update = parseInt(downpaymentMatch[1].replace(/,/g, ''));
        console.log(`💳 Extracted downpayment: ${deposit_amount_update}`);
      } else if (total_amount_update) {
        // Calculate 30% downpayment if not specified
        deposit_amount_update = Math.round(total_amount_update * 0.3);
      }
    } catch (error) {
      console.error('⚠️ Failed to extract pricing from notes:', error);
    }
  }
  
  // Update query
  const updates = [
    'status = $1',
    'notes = $2',
    'updated_at = NOW()'
  ];
  const values = [status, vendor_notes, id];
  
  if (total_amount_update) {
    updates.push(`total_amount = $${values.length + 1}`);
    values.push(total_amount_update);
  }
  
  if (deposit_amount_update) {
    updates.push(`deposit_amount = $${values.length + 1}`);
    values.push(deposit_amount_update);
  }
  
  const query = `
    UPDATE bookings 
    SET ${updates.join(', ')}
    WHERE id = $${values.length}
    RETURNING *
  `;
  
  const result = await sql.query(query, values);
  // ...
});
```

### Option 2: Parse Quote Data in Frontend (QUICK FIX)

Update the frontend mapping to properly extract quote price from the notes string.

**Frontend Fix** (`src/shared/utils/booking-data-mapping.ts`):

```typescript
// In mapDatabaseBookingToUI function
// Parse quote from notes if exists
let quoteData = null;
let quotedTotal = null;
let quotedDeposit = null;

if (dbBooking.notes && dbBooking.notes.includes('QUOTE_SENT:')) {
  try {
    // Extract total from format: "TOTAL: ₱50,000"
    const totalMatch = dbBooking.notes.match(/TOTAL:\s*₱([\d,]+)/);
    if (totalMatch) {
      quotedTotal = parseInt(totalMatch[1].replace(/,/g, ''));
    }
    
    // Extract downpayment if present
    const downpaymentMatch = dbBooking.notes.match(/Downpayment:\s*₱([\d,]+)/);
    if (downpaymentMatch) {
      quotedDeposit = parseInt(downpaymentMatch[1].replace(/,/g, ''));
    } else if (quotedTotal) {
      quotedDeposit = Math.round(quotedTotal * 0.3);
    }
    
    console.log('✅ Extracted quote pricing:', { quotedTotal, quotedDeposit });
  } catch (error) {
    console.error('❌ Failed to parse quote pricing:', error);
  }
}

// Use quoted amounts if available
const totalAmount = quotedTotal || parseFloat(dbBooking.total_amount || '0');
const depositAmount = quotedDeposit || parseFloat(dbBooking.deposit_amount || '0');
```

## 📝 Implementation Steps

### Immediate Fix (Frontend Only):

1. Update `booking-data-mapping.ts` to parse quote pricing from notes
2. Deploy frontend
3. Test with existing bookings that have quotes

### Permanent Fix (Backend + Frontend):

1. Update backend `/:id/status` endpoint to extract and sync pricing
2. Update frontend mapping as backup
3. Deploy backend first
4. Deploy frontend
5. Test complete flow: send quote → view as couple → see correct price

## 🧪 Testing Checklist

- [ ] Vendor sends quote with amount ₱50,000
- [ ] Backend updates `total_amount` to 50000
- [ ] Backend updates `deposit_amount` to 15000 (30%)
- [ ] Individual views booking and sees ₱50,000 as total
- [ ] Individual sees ₱15,000 as deposit amount
- [ ] Payment buttons show correct amounts
- [ ] Receipt shows correct amounts after payment

## 🎯 Expected Outcome

**Before Fix:**
- Vendor sends quote for ₱50,000
- Individual sees ₱0 or old estimate
- Confusion about actual price

**After Fix:**
- Vendor sends quote for ₱50,000
- Individual sees ₱50,000 immediately
- Deposit shows as ₱15,000 (30%)
- Payment flow works with correct amounts

## 📌 Related Files

- `backend-deploy/routes/bookings.cjs` (status update endpoint)
- `src/shared/utils/booking-data-mapping.ts` (frontend mapping)
- `src/pages/users/vendor/bookings/VendorBookings.tsx` (quote sending)
- `src/pages/users/individual/bookings/IndividualBookings.tsx` (booking display)

---

**Priority**: HIGH - Affects core booking workflow
**Impact**: All bookings with quotes sent after this fix
**Deployment**: Backend + Frontend required for complete fix
