# Backend vendor_notes Verification Guide

## Issue
The frontend is now configured to parse `vendor_notes` from booking data to display itemized quotes. However, we need to verify the backend is actually:
1. Accepting `vendor_notes` when vendors send quotes
2. Storing `vendor_notes` in the database
3. Returning `vendor_notes` in booking API responses

## Backend Endpoints to Check

### 1. Update Booking Status (Quote Sending)
**Endpoint:** `PATCH /api/bookings/:id/status`

**What vendor sends:**
```json
{
  "status": "quote_sent",
  "vendor_notes": "{\"quoteNumber\":\"Q-1234\",\"serviceItems\":[...]}"
}
```

**Backend should:**
- Accept `vendor_notes` field in request body
- Store it in `bookings.vendor_notes` column (TEXT/JSONB)
- Update `status` to `quote_sent`

**Verification:**
```bash
# Test quote sending
curl -X PATCH https://weddingbazaar-web.onrender.com/api/bookings/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -d '{
    "status": "quote_sent",
    "vendor_notes": "{\"quoteNumber\":\"Q-12345\",\"serviceItems\":[{\"id\":1,\"name\":\"Test Service\",\"unitPrice\":5000}]}"
  }'

# Expected response:
{
  "success": true,
  "booking": {
    "id": 1,
    "status": "quote_sent",
    "vendor_notes": "{\"quoteNumber\":\"Q-12345\",...}",
    ...
  }
}
```

### 2. Get Couple Bookings (Quote Viewing)
**Endpoint:** `GET /api/bookings/couple/:userId`

**Backend should return:**
```json
{
  "success": true,
  "bookings": [
    {
      "id": "1",
      "vendor_id": "2-2025-001",
      "status": "quote_sent",
      "vendor_notes": "{\"quoteNumber\":\"Q-12345\",\"serviceItems\":[...]}",
      "total_amount": "50000",
      ...
    }
  ]
}
```

**Verification:**
```bash
# Test fetching bookings
curl https://weddingbazaar-web.onrender.com/api/bookings/couple/1-2025-001 \
  -H "Authorization: Bearer USER_TOKEN"

# Check response includes vendor_notes field
```

### 3. Get Vendor Bookings
**Endpoint:** `GET /api/bookings/vendor/:vendorId`

**Should also return vendor_notes** so vendors can see their sent quotes:
```bash
curl https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-001 \
  -H "Authorization: Bearer VENDOR_TOKEN"
```

## Database Schema Check

### Required Column
```sql
-- Check if vendor_notes column exists
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'bookings'
  AND column_name = 'vendor_notes';
```

### Add Column if Missing
```sql
-- Add vendor_notes column (if it doesn't exist)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS vendor_notes TEXT;

-- Or use JSONB for better JSON handling:
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS vendor_notes JSONB;
```

## Backend Code Requirements

### 1. Booking Status Update Handler
```javascript
// In bookings routes/controller
app.patch('/api/bookings/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, vendor_notes } = req.body; // ⭐ Accept vendor_notes
  
  try {
    const result = await pool.query(
      `UPDATE bookings 
       SET status = $1, 
           vendor_notes = $2,  -- ⭐ Store vendor_notes
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, vendor_notes, id]
    );
    
    res.json({ 
      success: true, 
      booking: result.rows[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 2. Get Bookings Handler
```javascript
// In bookings routes/controller
app.get('/api/bookings/couple/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT 
        b.*,
        b.vendor_notes,  -- ⭐ Include vendor_notes in SELECT
        v.business_name as vendor_name,
        v.email as vendor_email,
        v.phone as vendor_phone,
        u.first_name || ' ' || u.last_name as couple_name
       FROM bookings b
       LEFT JOIN vendor_profiles v ON b.vendor_id = v.vendor_id
       LEFT JOIN users u ON b.couple_id = u.user_id
       WHERE b.couple_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    
    res.json({ 
      success: true, 
      bookings: result.rows 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Testing Checklist

### Frontend Testing (Current Repository)
- [x] `QuoteDetailsModal.tsx` checks for `booking.vendorNotes`
- [x] `booking-data-mapping.ts` includes `vendorNotes` in interfaces
- [x] `comprehensive-booking.types.ts` includes `vendor_notes` field
- [x] `booking.types.ts` includes `vendorNotes` field
- [x] Frontend deployed to production

### Backend Testing (Separate Repository)
- [ ] Database has `vendor_notes` column
- [ ] `PATCH /api/bookings/:id/status` accepts `vendor_notes` in request body
- [ ] `PATCH /api/bookings/:id/status` stores `vendor_notes` in database
- [ ] `GET /api/bookings/couple/:userId` returns `vendor_notes` in response
- [ ] `GET /api/bookings/vendor/:vendorId` returns `vendor_notes` in response
- [ ] `GET /api/bookings/:id` returns `vendor_notes` in response

### Integration Testing
- [ ] Vendor sends quote with 5+ service items
- [ ] Check database: `SELECT vendor_notes FROM bookings WHERE id = ?`
- [ ] Verify JSON is stored correctly
- [ ] Client views booking and sees all service items
- [ ] Browser console shows: "✅ [QuoteModal] Transformed quote data with X service items"

## Quick Verification Script

```bash
# 1. Send a test quote as vendor
curl -X PATCH https://weddingbazaar-web.onrender.com/api/bookings/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "quote_sent",
    "vendor_notes": "{\"test\":true,\"serviceItems\":[{\"id\":1,\"name\":\"Test\",\"unitPrice\":1000}]}"
  }'

# 2. Fetch booking as couple
curl https://weddingbazaar-web.onrender.com/api/bookings/couple/1-2025-001

# 3. Check if vendor_notes is in response
# Should see: "vendor_notes": "{\"test\":true,\"serviceItems\":[...]}"
```

## Expected Console Logs

### When Quote is Sent (Vendor Side)
```
📤 [SendQuoteModal] Sending quote to backend API...
   Booking ID: 1
   Quote Data: {quoteNumber: "Q-...", serviceItems: [...]}
📤 [SendQuoteModal] Sending status update: {status: "quote_sent", vendor_notes: "..."}
✅ [SendQuoteModal] Quote sent successfully
```

### When Quote is Viewed (Client Side)
```
📋 [QuoteModal] Found vendor_notes, attempting to parse quote data...
✅ [QuoteModal] Successfully parsed vendor_notes: {quoteNumber: "Q-...", serviceItems: [...]}
✅ [QuoteModal] Transformed quote data with 5 service items
```

### If vendor_notes is Missing
```
⚠️ [QuoteModal] No vendor_notes found in booking data
📋 [QuoteModal] Using mock quote data from booking: {...}
```

## Troubleshooting

### Problem: vendor_notes is null/undefined in frontend
**Possible Causes:**
1. Backend not returning vendor_notes in API response
2. Database column doesn't exist
3. Vendor didn't send quote data properly

**Solution:**
- Check backend logs when fetching bookings
- Query database directly: `SELECT vendor_notes FROM bookings WHERE id = 1;`
- Verify backend SELECT query includes vendor_notes

### Problem: vendor_notes is empty string ""
**Possible Causes:**
1. Backend is accepting but not storing vendor_notes
2. UPDATE query doesn't include vendor_notes column

**Solution:**
- Check backend UPDATE query in status endpoint
- Ensure column exists and has proper permissions
- Test with `psql` directly

### Problem: JSON parse error in frontend
**Possible Causes:**
1. vendor_notes is not valid JSON
2. Backend is double-encoding JSON

**Solution:**
- Log raw vendor_notes before parsing
- Check if it's a string or already an object
- Handle both cases in frontend

## Next Steps

1. **Verify database schema** in Neon PostgreSQL
2. **Update backend code** to accept and return vendor_notes
3. **Test quote sending** from vendor dashboard
4. **Test quote viewing** from client dashboard
5. **Monitor console logs** for successful parsing
6. **Update this checklist** as items are completed

## Related Documentation
- [Quote Itemization Fix Complete](./QUOTE_ITEMIZATION_FIX_COMPLETE.md)
- [SendQuoteModal Component](../src/pages/users/vendor/bookings/components/SendQuoteModal.tsx)
- [QuoteDetailsModal Component](../src/pages/users/individual/bookings/components/QuoteDetailsModal.tsx)

---

**Status:** Backend verification required  
**Frontend:** ✅ Ready and deployed  
**Backend:** ⏳ Needs verification and potential updates
