# 🔧 API Debugging Reference

## Completion API Endpoint

**URL**: `https://weddingbazaar-web.onrender.com/api/bookings/:bookingId/mark-completed`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "completed_by": "vendor",
  "notes": "Optional completion notes"
}
```

---

## Expected Responses

### Scenario 1: First to Confirm (Waiting for Other Party)

**Request**:
```bash
POST /api/bookings/1761577140/mark-completed
{
  "completed_by": "vendor"
}
```

**Response** (if couple hasn't confirmed yet):
```json
{
  "success": true,
  "message": "Vendor marked booking as completed",
  "booking": {
    "id": 1761577140,
    "status": "fully_paid",  // Still fully_paid (not completed yet)
    "vendor_completed": true,
    "vendor_completed_at": "2025-10-27T14:30:00.000Z",
    "couple_completed": false,  // Couple hasn't confirmed
    "couple_completed_at": null,
    "completion_notes": null,
    "both_completed": false  // Not both yet
  },
  "waiting_for": "couple"  // Waiting for couple
}
```

---

### Scenario 2: Second to Confirm (Booking Completed!)

**Request**:
```bash
POST /api/bookings/1761577140/mark-completed
{
  "completed_by": "vendor"
}
```

**Response** (couple already confirmed - YOUR TEST CASE):
```json
{
  "success": true,
  "message": "Vendor marked booking as completed",
  "booking": {
    "id": 1761577140,
    "status": "completed",  // NOW completed!
    "vendor_completed": true,
    "vendor_completed_at": "2025-10-27T14:30:00.000Z",
    "couple_completed": true,  // Couple confirmed earlier
    "couple_completed_at": "2025-10-27T07:26:53.474Z",
    "completion_notes": null,
    "both_completed": true  // Both confirmed!
  },
  "waiting_for": null  // No longer waiting
}
```

---

## Error Responses

### Error 1: Booking Not Found
```json
{
  "success": false,
  "error": "Booking not found"
}
```

**HTTP Status**: `404 Not Found`

---

### Error 2: Not Fully Paid
```json
{
  "success": false,
  "error": "Booking must be fully paid before marking as completed",
  "current_status": "confirmed"
}
```

**HTTP Status**: `400 Bad Request`

---

### Error 3: Already Marked by Same Party
```json
{
  "success": false,
  "error": "Vendor has already marked this booking as completed",
  "message": "Waiting for couple to confirm completion"
}
```

**HTTP Status**: `400 Bad Request`

**This is NOT a bug!** It means you already clicked the button and it worked! ✅

---

### Error 4: Invalid completed_by Value
```json
{
  "success": false,
  "error": "completed_by must be either \"vendor\" or \"couple\""
}
```

**HTTP Status**: `400 Bad Request`

---

## Testing with cURL

### Basic Test:
```bash
curl -X POST https://weddingbazaar-web.onrender.com/api/bookings/1761577140/mark-completed \
  -H "Content-Type: application/json" \
  -d '{"completed_by":"vendor"}'
```

### With Notes:
```bash
curl -X POST https://weddingbazaar-web.onrender.com/api/bookings/1761577140/mark-completed \
  -H "Content-Type: application/json" \
  -d '{"completed_by":"vendor","notes":"Service completed successfully. Client was very happy!"}'
```

### Check Status:
```bash
curl https://weddingbazaar-web.onrender.com/api/bookings/1761577140/completion-status
```

---

## Browser Console Testing

Open DevTools Console and paste:

```javascript
// Mark as complete
fetch('https://weddingbazaar-web.onrender.com/api/bookings/1761577140/mark-completed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ completed_by: 'vendor' })
})
  .then(r => r.json())
  .then(data => console.log('Result:', data))
  .catch(err => console.error('Error:', err));
```

```javascript
// Check completion status
fetch('https://weddingbazaar-web.onrender.com/api/bookings/1761577140/completion-status')
  .then(r => r.json())
  .then(data => console.log('Status:', data))
  .catch(err => console.error('Error:', err));
```

---

## Frontend Code Reference

**File**: `src/pages/users/vendor/bookings/VendorBookingsSecure.tsx`

**Line 153-165**: API Call
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
const response = await fetch(`${API_URL}/api/bookings/${booking.id}/mark-completed`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ completed_by: 'vendor' }),
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || data.message || 'Failed to mark booking as completed');
}
```

**Line 168-173**: Success Handling
```typescript
const successMsg = data.waiting_for === null
  ? '🎉 Booking Fully Completed!\n\nBoth you and the couple have confirmed. The booking is now marked as completed.'
  : '✅ Completion Confirmed!\n\nYour confirmation has been recorded. The booking will be fully completed once the couple also confirms.';

alert(successMsg);
```

---

## Database Queries

### Check Current Status:
```sql
SELECT 
  id,
  status,
  vendor_completed,
  vendor_completed_at,
  couple_completed,
  couple_completed_at,
  completion_notes
FROM bookings
WHERE id = 1761577140;
```

### Manual Update (if needed):
```sql
UPDATE bookings
SET 
  vendor_completed = TRUE,
  vendor_completed_at = NOW(),
  status = CASE
    WHEN couple_completed = TRUE THEN 'completed'
    ELSE status
  END
WHERE id = 1761577140;
```

### Reset for Testing:
```sql
UPDATE bookings
SET 
  vendor_completed = FALSE,
  vendor_completed_at = NULL,
  couple_completed = FALSE,
  couple_completed_at = NULL,
  status = 'fully_paid'
WHERE id = 1761577140;
```

---

## Network Tab Checklist

When you click "Mark as Complete", look for:

1. **Request URL**:
   ```
   https://weddingbazaar-web.onrender.com/api/bookings/1761577140/mark-completed
   ```

2. **Request Method**:
   ```
   POST
   ```

3. **Request Payload**:
   ```json
   {
     "completed_by": "vendor"
   }
   ```

4. **Status Code**:
   ```
   200 OK  ✅ Success!
   400      ⚠️ Validation error
   404      ❌ Booking not found
   500      ❌ Server error
   ```

5. **Response Body**:
   ```json
   {
     "success": true,
     "waiting_for": null,  // ← Important: null means BOTH confirmed!
     "booking": {
       "status": "completed",  // ← Should be "completed"
       "both_completed": true  // ← Should be true
     }
   }
   ```

---

## Console Log Sequence

When everything works correctly:

```
1. 🎉 [VendorBookingsSecure] Mark Complete clicked for booking: 1761577140

2. [Network] POST /api/bookings/1761577140/mark-completed

3. ✅ [VendorBookingsSecure] Booking completion updated: {
     success: true,
     waiting_for: null,
     ...
   }

4. 🎉 Booking Fully Completed! (alert)

5. 🔄 [VendorBookingsSecure] Reloading bookings after completion...

6. ✅ [VendorBookingsSecure] Bookings loaded: X bookings
```

**Missing logs?** → Check browser console filter settings

**Red errors?** → Read error message and match to error responses above

---

## Backend Logs (Render Dashboard)

Expected backend logs:

```
🎉 Marking booking 1761577140 as completed by vendor

✅ Both sides confirmed! Booking 1761577140 is now COMPLETED
```

**How to check**:
1. Go to https://dashboard.render.com
2. Click on `weddingbazaar-web` service
3. Click "Logs" tab
4. Look for these messages after you click the button

---

## Success Indicators

| What to Check | Expected Value | Where to Look |
|---------------|----------------|---------------|
| **HTTP Status** | 200 OK | Network tab |
| **success** field | true | Response JSON |
| **waiting_for** field | null | Response JSON |
| **status** field | "completed" | Response JSON |
| **both_completed** | true | Response JSON |
| **Console logs** | No errors | Browser console |
| **Alert message** | "Booking Fully Completed!" | Browser alert |
| **Badge** | Pink "Completed ✓" | UI |
| **Button** | Removed/disabled | UI |
| **Database** | status = 'completed' | SQL query |

---

**Use this document for debugging!** 🐛

If something doesn't match the expected values here, you've found the issue! 🎯
