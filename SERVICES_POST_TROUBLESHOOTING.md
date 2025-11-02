# Services POST 500 Error - Troubleshooting Guide

## Current Status

### ✅ Fixed:
- Categories endpoint: Returns 200 OK with empty fields array
- service_tier normalization: Working correctly (Premium → premium)

### ❌ Still Failing:
- POST /api/services: 500 Internal Server Error

## Deployment Timeline

1. **First Deployment** (10:00 AM): Categories fix + service_tier normalization
   - Status: ✅ SUCCESSFUL
   - Categories endpoint: Working ✅
   
2. **Second Deployment** (10:15 AM): Enhanced logging + vendor validation
   - Status: ⏳ IN PROGRESS (3-5 minutes)
   - Purpose: Better error messages and debugging

## What to Check Next

### 1. Wait for Deployment (3-5 minutes)
The enhanced logging deployment just started. Wait for it to complete.

Check Render dashboard: https://dashboard.render.com/

### 2. Check Browser Network Tab
When you try to create a service, open DevTools (F12) → Network tab:

1. Find the `POST /api/services` request
2. Click on it
3. Check the **Request Payload** tab
4. Look for:
   ```json
   {
     "vendor_id": "???",  // What value is this?
     "title": "...",
     "category": "...",
     "service_tier": "..."  // Should be lowercase after normalization
   }
   ```

### 3. Check Render Logs (After Deployment)
Go to Render dashboard → Logs

Look for the new logging output:
```
📤 [POST /api/services] Creating new service
   Request body keys: [...]
   vendor_id: ???
   vendorId: ???
   title: ...
   category: ...
   service_tier: ...
🔑 [Vendor Check] Final vendor ID: ???
```

### 4. Common Issues & Solutions

#### Issue A: vendor_id is null/undefined
**Symptom**: Request payload shows `vendor_id: null`
**Cause**: User not logged in or not logged in as vendor
**Solution**: 
1. Log out
2. Log in again as a vendor account
3. Ensure vendor profile exists

#### Issue B: Vendor doesn't exist in database
**Symptom**: Logs show "❌ [Vendor Check] Vendor not found"
**Cause**: vendor_id doesn't match any row in vendors table
**Solution**:
1. Check what vendor_id the frontend is sending
2. Query database to see if vendor exists
3. May need to create vendor profile first

#### Issue C: Still getting constraint violation
**Symptom**: Logs show "services_service_tier_check"
**Cause**: Deployment hasn't completed yet
**Solution**: Wait for Render deployment to finish

#### Issue D: Different database error
**Symptom**: New error message in logs
**Cause**: Unknown - will need to check logs
**Solution**: Share the Render logs for analysis

## Testing Steps (After Deployment)

### Step 1: Verify Deployment Complete
```bash
node test-backend-deployment.mjs
```
Should show: ✅ NEW CODE IS DEPLOYED

### Step 2: Check Vendor Authentication
Open browser console and run:
```javascript
// Check if user is logged in
console.log('User:', localStorage.getItem('user'));
console.log('Auth token:', localStorage.getItem('auth_token'));
```

### Step 3: Try Creating Service Again
1. Fill out the Add Service form
2. Open DevTools (F12) → Console tab
3. Look for any error messages
4. Open Network tab → Find POST /api/services request
5. Check:
   - Request Headers (is auth token present?)
   - Request Payload (is vendor_id valid?)
   - Response (what's the error message?)

### Step 4: Check Render Logs
Look for the detailed logging:
- What vendor_id was received?
- Did vendor check pass?
- What was the actual SQL error?

## Expected Outcomes

### After Deployment:
1. **If vendor not found**:
   ```json
   {
     "success": false,
     "error": "Vendor not found",
     "message": "Please ensure you are logged in as a vendor with a valid profile",
     "vendor_id": "the-id-that-was-sent"
   }
   ```

2. **If vendor exists but other error**:
   Detailed error message showing exactly what failed

3. **If successful**:
   ```json
   {
     "success": true,
     "message": "Service created successfully",
     "service": { ... }
   }
   ```

## Quick Diagnostic Commands

### Check if deployment is live:
```bash
curl https://weddingbazaar-web.onrender.com/api/health
```

### Test categories (should work):
```bash
curl https://weddingbazaar-web.onrender.com/api/categories/by-name/Cake/fields
```

### Check vendor exists (replace VENDOR-ID):
```sql
SELECT id, business_name FROM vendors WHERE id = 'VENDOR-ID';
```

## What Information I Need

If still failing after deployment, please provide:

1. **Request Payload** (from Network tab):
   ```json
   {
     "vendor_id": "???",
     "title": "???",
     "category": "???"
   }
   ```

2. **Response Body** (from Network tab):
   ```json
   {
     "error": "???"
   }
   ```

3. **Render Logs** (last 50 lines showing the failed request)

4. **Browser Console Errors** (any red errors)

## Timeline

- **10:00 AM**: First fix deployed (categories + service_tier) ✅
- **10:15 AM**: Second fix deployed (enhanced logging) ⏳
- **10:20 AM**: Expected ready for testing
- **10:25 AM**: Should have diagnostic information

---

**Current Action**: ⏳ Wait 3-5 minutes for deployment to complete, then test again
