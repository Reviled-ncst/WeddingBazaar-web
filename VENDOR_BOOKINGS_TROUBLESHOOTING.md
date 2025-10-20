# 🔍 Vendor Bookings Troubleshooting Guide

## Problem Summary
Vendor bookings are not displaying in the VendorBookings page, even though:
- ✅ Bookings exist in the database (3 bookings for vendor `2-2025-001`)
- ✅ Backend API endpoint works correctly (returns all 3 bookings)
- ✅ Frontend can create bookings successfully

## Root Cause Analysis

### Backend Status: ✅ WORKING
```bash
# Production API Test
curl https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-001
```

**Response**: 
```json
{
  "success": true,
  "bookings": [
    {
      "id": 1760918159,
      "vendor_id": "2-2025-001",
      "couple_id": "1-2025-001",
      "service_name": "asdsa",
      "event_date": "2025-10-30",
      "status": "request"
    },
    // ... 2 more bookings
  ],
  "count": 3
}
```

### Frontend Issues to Check

#### 1. Authentication Token
**Problem**: Frontend might not be sending authentication token
**Check**: Open browser DevTools → Application → Local Storage → `auth_token`
**Fix**: Ensure token exists and is being sent in `Authorization: Bearer {token}` header

#### 2. Vendor ID Resolution  
**Problem**: `workingVendorId` might be null or incorrect
**Check**: Look for these console logs:
```
🔍 [VendorBookings] USER OBJECT COMPLETE DEBUG
🎯 [VendorBookings] SIMPLE APPROACH - Loading bookings for vendor: {vendorId}
```
**Expected**: `workingVendorId` should be `"2-2025-001"`

#### 3. API Call Failing Silently
**Problem**: Fetch might be failing with CORS or network error
**Check**: Network tab in DevTools for `/api/bookings/vendor/` calls
**Look for**: Response status, response body, any error messages

#### 4. Data Not Being Set in State
**Problem**: Even if API succeeds, bookings might not be updating state
**Check**: Console log:
```
📋 [VendorBookings] Setting bookings in state: [...]
```
**Expected**: Should show array of 3 booking objects

## Immediate Debugging Steps

### Step 1: Check User Object
Add this to browser console when on VendorBookings page:
```javascript
// Get the user from localStorage
const authData = JSON.parse(localStorage.getItem('auth_data') || '{}');
console.log('User Object:', authData.user);
console.log('User ID:', authData.user?.id);
console.log('User Role:', authData.user?.role);
```

**Expected Output**:
```javascript
User ID: "2-2025-001"
User Role: "vendor"
```

### Step 2: Check API Call
Look at Network tab → Filter by "bookings" → Check:
1. **Request URL**: Should be `https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-001`
2. **Request Headers**: Should include `Authorization: Bearer {token}`
3. **Response Status**: Should be `200`
4. **Response Body**: Should contain 3 bookings

### Step 3: Check Console Logs
Look for these specific logs in order:
```
✅ [VendorBookings] Working vendor ID resolved: 2-2025-001
🎯 [VendorBookings] First attempt with original ID: 2-2025-001
📊 [VendorBookings] API Response: {status: 200, success: true, bookingCount: 3}
✅ [VendorBookings] SUCCESS: Found 3 bookings!
📋 [VendorBookings] Setting bookings in state: [...]
```

## Common Issues & Solutions

### Issue 1: "No authentication token found"
**Symptom**: Console shows `� [VendorBookings] No authentication token found`
**Solution**: User needs to log out and log back in as vendor

### Issue 2: "MALFORMED_VENDOR_ID"
**Symptom**: API returns 403 with error code `MALFORMED_VENDOR_ID`
**Solution**: This should NOT happen with `2-2025-001` format. Check if user.id is being corrupted.

### Issue 3: "Waiting for vendor ID..."
**Symptom**: Console shows `⏳ [VendorBookings] Waiting for vendor ID...`
**Solution**: 
- Check `getVendorIdForUser()` function
- Verify user.role is "vendor"
- Verify user.id follows `2-YYYY-XXX` pattern

### Issue 4: API succeeds but bookings not showing
**Symptom**: Network tab shows 200 response with 3 bookings, but UI shows "0 bookings"
**Solution**:
- Check React state is updating: `console.log('Bookings state:', bookings)`
- Check if bookings are being filtered out by status or search
- Check if rendering logic has bugs

## Verification Checklist

- [ ] User is logged in as vendor (role: "vendor")
- [ ] User ID is `2-2025-001`
- [ ] Auth token exists in localStorage
- [ ] API call is made to correct endpoint
- [ ] API returns 200 with 3 bookings
- [ ] Bookings are set in React state
- [ ] No filters are hiding bookings
- [ ] UI renders booking cards

## Next Steps

1. **Open browser DevTools** on VendorBookings page
2. **Check Console tab** for log messages
3. **Check Network tab** for API calls
4. **Check Application tab** for auth_token
5. **Report findings** with screenshots

## Test Script

Run this in browser console to test everything:
```javascript
// 1. Check authentication
const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
console.log('Auth Token:', authToken ? 'EXISTS' : 'MISSING');

// 2. Test API directly
if (authToken) {
  fetch('https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-001', {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(r => r.json())
  .then(data => {
    console.log('Direct API Test Result:');
    console.log('Success:', data.success);
    console.log('Booking Count:', data.bookings?.length || 0);
    console.log('Full Response:', data);
  })
  .catch(err => console.error('API Error:', err));
}
```

## Expected vs Actual

### Expected Behavior:
1. User logs in as vendor
2. Navigate to /vendor/bookings
3. Page loads and calls `/api/bookings/vendor/2-2025-001`
4. API returns 3 bookings
5. UI displays 3 booking cards

### Actual Behavior (Current):
1. User logs in as vendor ✅
2. Navigate to /vendor/bookings ✅
3. Page shows "0 secure bookings" ❌
4. No error messages visible ❌

## Debug Mode

To enable detailed logging, add this to VendorBookings.tsx:
```typescript
useEffect(() => {
  console.log('DEBUG STATE:', {
    loading,
    bookingsLength: bookings.length,
    workingVendorId,
    filterStatus,
    searchQuery,
    hasToken: !!localStorage.getItem('auth_token')
  });
}, [loading, bookings, workingVendorId, filterStatus, searchQuery]);
```
