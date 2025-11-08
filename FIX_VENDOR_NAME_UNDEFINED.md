# 🔧 FIX: Vendor Name Showing as "undefined" in Bookings

## Problem
When couples viewed their bookings, the vendor name was showing as `undefined` or `null` in the UI.

## Root Cause
The backend API endpoint `/api/bookings/couple/:userId` was **NOT joining with the vendors or vendor_profiles tables** to fetch the vendor's business name.

### Before (Broken Query):
```sql
SELECT * FROM bookings 
WHERE couple_id = $1
```

This query only fetched data from the `bookings` table, which has:
- `vendor_id`: References the user ID (e.g., `2-2025-004`)
- `vendor_name`: Column exists but was `NULL` in the database

## Solution
Added LEFT JOIN with both `vendors` and `vendor_profiles` tables to fetch the business name:

### After (Fixed Query):
```sql
SELECT 
  b.*,
  COALESCE(vp.business_name, v.business_name, 'Unknown Vendor') as vendor_name,
  vp.business_type as vendor_business_type
FROM bookings b
LEFT JOIN vendors v ON b.vendor_id = v.user_id
LEFT JOIN vendor_profiles vp ON b.vendor_id = vp.user_id
WHERE b.couple_id = $1
```

### Why Both JOINs?
1. **vendor_profiles**: New system with UUID primary keys
2. **vendors**: Legacy system with VEN-XXXXX IDs
3. **COALESCE**: Uses vendor_profiles name first, falls back to vendors name, finally defaults to 'Unknown Vendor'

## Files Modified
- `backend-deploy/routes/bookings.cjs` (Line 277-294)

## Deployment
- ✅ Committed: `f614d7e`
- ✅ Pushed to GitHub: `main` branch
- 🔄 Render will auto-deploy in ~2-3 minutes

## Testing
After deployment, bookings should show vendor names like:
- "Icon X Productions" (from vendor_profiles)
- "Bloom & Grace" (from vendor_profiles)
- "Amelia's cake shop" (from vendor_profiles)

### Test URL:
```
GET https://weddingbazaar-web.onrender.com/api/bookings/couple/1-2025-001
```

Expected response:
```json
{
  "bookings": [
    {
      "id": 375,
      "vendor_id": "2-2025-004",
      "vendor_name": "Icon X Productions",  // ✅ NOW POPULATED
      "service_name": "Icon X Productions",
      "event_date": "2025-11-20"
    }
  ]
}
```

## Related Issues
- User 2-2025-019 verification issue (now fixed)
- Service creation blocked due to verification (now working)
- Vendor profile endpoints (now support multiple ID formats)

## Status: ✅ FIXED
Deploy timestamp: November 8, 2025
