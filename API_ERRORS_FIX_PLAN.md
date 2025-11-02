# API Errors Fix Plan

## Current Errors (Production)

### 1. Coordinator Dashboard - 401 Unauthorized ✅ NOT A BUG
**Endpoint**: `GET /api/coordinator/dashboard/stats`
**Error**: 401 (Unauthorized)
**Cause**: User is not authenticated or not logged in as coordinator role
**Status**: ✅ **WORKING AS DESIGNED**
**Solution**: 
- User needs to log in with coordinator account
- Endpoint requires `authenticateToken` middleware
- This is proper security behavior

### 2. Categories By-Name - 500 Internal Server Error ❌ BUG
**Endpoint**: `GET /api/categories/by-name/Cake/fields`
**Error**: 500 (Internal Server Error)
**Likely Cause**: Missing `service_category_fields` table in database
**Status**: ❌ **NEEDS FIX**
**Solution**: 
1. Check if table exists: `service_category_fields`
2. If missing, create table or use fallback logic
3. Add error handling for missing tables

### 3. Services POST - 500 Internal Server Error ❌ BUG
**Endpoint**: `POST /api/services`
**Error**: 500 (Internal Server Error)
**Likely Causes**:
- Missing required columns in services table
- Data type mismatch
- Constraint violation
- Missing vendor_subscriptions table

**Status**: ❌ **NEEDS FIX**

## Investigation Steps

### Step 1: Check Database Schema
```sql
-- Check if service_category_fields table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'service_category_fields'
);

-- Check services table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'services';

-- Check if vendor_subscriptions table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'vendor_subscriptions'
);
```

### Step 2: Add Graceful Fallbacks

#### For Categories By-Name (500 Error)
Add fallback when `service_category_fields` table doesn't exist:

```javascript
// If table doesn't exist, return empty fields array
const fields = await sql`
  SELECT ... FROM service_category_fields ...
`.catch(() => []);

// Or check if table exists first
```

#### For Services POST (500 Error)
Options:
1. Make subscription check optional (graceful degradation)
2. Create vendor_subscriptions table
3. Add better error logging to identify exact issue

## Quick Fixes

### Fix 1: Make Categories Endpoint Resilient
Location: `backend-deploy/routes/categories.cjs` line ~180

Add try-catch around table query with fallback.

### Fix 2: Make Services POST More Robust
Location: `backend-deploy/routes/services.cjs` line ~390

Wrap subscription check in try-catch (already done) but also check services table columns.

### Fix 3: Better Error Logging
Add detailed error logging to identify exact SQL errors.

## Testing Plan

1. **Local Testing**:
   - Test /api/categories/by-name/Cake/fields
   - Test POST /api/services with sample data
   - Check console logs for actual SQL errors

2. **Database Verification**:
   - Run schema check script
   - Verify all required tables exist
   - Check column data types match code

3. **Production Testing**:
   - Deploy fixes
   - Monitor Render logs
   - Test endpoints from frontend

## Next Steps

1. ✅ Create database check script
2. ⏳ Run script to identify missing tables/columns
3. ⏳ Add graceful fallbacks for missing tables
4. ⏳ Deploy fixes to Render
5. ⏳ Test and verify all endpoints work

## Priority

- **HIGH**: Services POST (blocks service creation)
- **MEDIUM**: Categories by-name (blocks AddServiceForm)
- **LOW**: Coordinator auth (working as designed)
