# Service Creation Vendor ID Fix

## Problem
Backend was receiving `user.id` (e.g., `2-2025-019`) from frontend, but the `services` table has a foreign key constraint `services_vendor_id_fkey` that expects `vendor_id` to reference the `vendors` table (UUID), not the `users` table.

## Error
```
ERROR: insert or update on table "services" violates foreign key constraint "services_vendor_id_fkey"
DETAIL: Key (vendor_id)=(2-2025-019) is not present in table "vendors".
```

## Root Cause
- **Frontend sends**: `user.id` (e.g., `2-2025-019` from `users` table)
- **Backend needs**: `vendor.id` (UUID from `vendors` table)
- **Database schema**: `services.vendor_id` → `vendors.id` (UUID foreign key)

## Solution
Added vendor lookup logic in backend to resolve user ID to vendor ID:

### Step 1: Verify User Exists and is a Vendor
```javascript
const userCheck = await sql`
  SELECT id, user_type FROM users WHERE id = ${userIdFromFrontend} LIMIT 1
`;

if (userCheck.length === 0) {
  return res.status(400).json({ error: 'User not found' });
}

if (userCheck[0].user_type !== 'vendor') {
  return res.status(403).json({ error: 'Only vendors can create services' });
}
```

### Step 2: Look Up Vendor Record
```javascript
const vendorRecord = await sql`
  SELECT id FROM vendors WHERE user_id = ${userIdFromFrontend} LIMIT 1
`;

if (vendorRecord.length === 0) {
  return res.status(400).json({ error: 'Vendor profile not found' });
}

actualVendorId = vendorRecord[0].id; // This is the UUID we need
```

### Step 3: Use Vendor UUID in INSERT
```javascript
INSERT INTO services (id, vendor_id, ...) VALUES (
  ${serviceId},
  ${actualVendorId}, // Now uses vendors.id (UUID) instead of users.id
  ...
)
```

## Data Flow
```
Frontend: user.id (2-2025-019)
    ↓
Backend: SELECT id FROM vendors WHERE user_id = '2-2025-019'
    ↓
Database: Returns vendor.id (UUID, e.g., 'a1b2c3d4-...')
    ↓
Backend: INSERT INTO services (..., vendor_id = 'a1b2c3d4-...')
    ↓
Success: Service created with valid vendor_id foreign key
```

## Database Schema Reference
```sql
-- users table
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,  -- e.g., '2-2025-019'
  user_type VARCHAR(20)         -- 'vendor', 'couple', 'admin'
);

-- vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) REFERENCES users(id),
  business_name VARCHAR(255)
);

-- services table
CREATE TABLE services (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id),  -- Must be vendors.id, not users.id
  title VARCHAR(255)
);
```

## Testing
1. **Login as vendor** (user_id: `2-2025-019`)
2. **Navigate to** Vendor Dashboard → My Services → Add Service
3. **Fill form** with service details
4. **Submit form**
5. **Expected**: Service created successfully with vendor.id UUID
6. **Verify**: Check `services` table for new record with correct `vendor_id`

## Error Prevention
- ✅ User must exist in `users` table
- ✅ User must have `user_type = 'vendor'`
- ✅ Vendor record must exist in `vendors` table with matching `user_id`
- ✅ Service is created with `vendor_id` = UUID from `vendors` table

## Deployment Status
- **Status**: 🚧 Ready for deployment
- **Files Changed**: `backend-deploy/routes/services.cjs`
- **Backend URL**: https://weddingbazaar-web.onrender.com
- **Commit**: FIX: Resolve user_id to vendor_id for service creation

## Next Steps
1. ✅ Code committed and pushed
2. ⏳ Wait for Render auto-deployment
3. ⏳ Test service creation in production
4. ⏳ Verify new services appear in vendor dashboard
5. ⏳ Confirm package/itemization data is saved correctly
