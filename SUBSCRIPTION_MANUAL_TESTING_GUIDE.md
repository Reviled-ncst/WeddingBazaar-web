# Subscription Limit Enforcement - Manual Testing Guide

## ✅ Database Schema Fixed

The database schema has been successfully updated:
- ✅ `vendor_id`: VARCHAR(20) → VARCHAR(50) (supports "2-2025-XXX" format)
- ✅ `location`: VARCHAR(20) → TEXT (supports full addresses)
- ✅ `availability`: VARCHAR(20) → TEXT (supports JSON data)

## ✅ Frontend Fixed

The frontend now correctly uses `user.id` (vendor ID like "2-2025-003") instead of the UUID from `vendor_profiles`.

**File updated**: `src/pages/users/vendor/services/VendorServices.tsx`
- Line ~466: Changed `vendor_id: user?.vendorId` to `vendor_id: user?.id`

## 🧪 Manual Testing Instructions

### Prerequisites
1. Open the production website: https://weddingbazaar-web.web.app
2. Have vendor login credentials ready:
   - Email: elealesantos06@gmail.com
   - Password: [Use the password you set for this vendor account]

### Test Steps

#### Test 1: Service Creation Works
1. **Login as vendor**
   - Navigate to: https://weddingbazaar-web.web.app
   - Click "Login" button in header
   - Select "Vendor" tab
   - Enter credentials and login
   
2. **Verify redirect to vendor landing**
   - Should redirect to `/vendor` after login
   - You should see "Manage Services" button

3. **Navigate to services page**
   - Click "Manage Services" button
   - OR navigate directly to: https://weddingbazaar-web.web.app/vendor/services

4. **Create a test service**
   - Click "+ Add Service" button
   - Fill in the form:
     - **Title**: Test Service via Fixed Schema
     - **Category**: Photography (or any category)
     - **Description**: Testing after VARCHAR fix
     - **Price**: 5000
     - **Location**: Long address to test TEXT field (e.g., "123 Main St, Barangay XYZ, City, Province, 1234 Philippines")
   - Click "Create Service" or "Save"

5. **Expected Outcome**
   - ✅ Service should be created successfully
   - ✅ Service should appear in the list
   - ✅ No VARCHAR(20) error
   - ✅ No foreign key constraint error

#### Test 2: Subscription Limit Enforcement

1. **Check current service count**
   - On vendor services page, note how many services you currently have
   - Check your subscription plan (should show in UI)

2. **Attempt to exceed limit**
   - If you have a Basic plan (5 service limit):
     - Create services until you reach 5 total services
   - Try to create the 6th service

3. **Expected Outcome**
   - ✅ **Frontend check**: Before making API call, should show upgrade modal
   - ✅ Modal should display:
     - Current usage (e.g., "5/5 services")
     - Current plan ("Basic Plan")
     - Suggested plan ("Premium" or higher)
     - Upgrade button
   - ✅ Service creation form should close
   - ✅ No API call should be made (check browser Network tab)

4. **Alternate Test: Backend Enforcement**
   - If you want to test backend enforcement, you can bypass the frontend check
   - Use browser DevTools Console:
   ```javascript
   const API_URL = 'https://weddingbazaar-web.onrender.com';
   const token = localStorage.getItem('authToken'); // Get current token
   
   fetch(`${API_URL}/api/services`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify({
       vendor_id: '2-2025-003', // Your vendor ID
       title: 'Test Backend Limit',
       category: 'Photography',
       description: 'Testing backend limit enforcement',
       price: 1000,
       location: 'Test Location',
       is_active: true
     })
   })
   .then(r => r.json())
   .then(data => console.log('Response:', data));
   ```

5. **Expected Backend Response** (when limit reached)
   ```json
   {
     "success": false,
     "error": "Service limit reached",
     "message": "You have reached your basic plan limit of 5 services. Please upgrade to add more services.",
     "current_count": 5,
     "limit": 5,
     "upgrade_required": true,
     "current_plan": "basic",
     "available_plans": ["premium", "pro", "enterprise"],
     "recommended_plan": "premium",
     "upgrade_benefits": "Unlimited services, 50 portfolio images, priority support, featured listings"
   }
   ```

## 🔍 Troubleshooting

### Issue: "vendor_id violates foreign key constraint"
**Solution**: This should be fixed now. The frontend now sends the correct vendor_id format ("2-2025-003").

**If still occurring**:
1. Check that `user.id` is being used, not `user.vendorId`
2. Verify the vendor exists in the `vendors` table:
   ```sql
   SELECT id FROM vendors WHERE id = '2-2025-003';
   ```

### Issue: "value too long for type character varying(20)"
**Solution**: This should be fixed by the schema migration.

**If still occurring**:
1. Check which field is too long in browser console
2. Verify schema was updated:
   ```sql
   SELECT column_name, data_type, character_maximum_length
   FROM information_schema.columns
   WHERE table_name = 'services'
   AND column_name IN ('vendor_id', 'location', 'availability');
   ```

### Issue: Upgrade modal not showing
**Possible causes**:
1. Frontend limit check not running (check console logs)
2. Subscription context not loaded
3. Service count incorrect

**Debug**:
- Open browser DevTools Console
- Look for log messages:
  - `🚫 [VendorServices] Service limit reached`
  - `✅ [VendorServices] Service creation allowed`

### Issue: Backend limit not enforced
**Check**:
1. Backend logs in Render dashboard
2. Look for log messages:
   - `🔍 [Subscription Check] Checking service limits`
   - `❌ [Subscription Check] Service limit reached`
   - `✅ [Subscription Check] Service creation allowed`

## 📊 Success Criteria

### ✅ Service Creation
- [ ] Can login as vendor
- [ ] Can navigate to services page
- [ ] Can fill out service creation form
- [ ] Service is created successfully
- [ ] No database errors
- [ ] Service appears in list

### ✅ Frontend Limit Enforcement
- [ ] Upgrade modal shows when limit reached
- [ ] Modal shows correct usage count
- [ ] Modal shows current plan
- [ ] Modal shows recommended upgrade
- [ ] Service form closes when limit reached

### ✅ Backend Limit Enforcement
- [ ] Backend returns 403 when limit exceeded
- [ ] Error response includes upgrade info
- [ ] Error response includes current count
- [ ] Error response includes recommended plan

## 🚀 Next Steps

Once manual testing is complete:

1. **Document Results**: Create a new markdown file with test results
2. **Deploy Frontend**: If any frontend changes were made
3. **Monitor Logs**: Check Render backend logs for any issues
4. **Update Documentation**: Update SUBSCRIPTION_FINAL_STATUS.md with test results

## 📝 Testing Checklist

```
MANUAL TESTING CHECKLIST
========================

[ ] 1. Login as vendor successfully
[ ] 2. Navigate to vendor services page
[ ] 3. Create a new service
[ ] 4. Service creation succeeds (no errors)
[ ] 5. Service appears in list
[ ] 6. Create services until limit (5 for basic)
[ ] 7. Attempt to create 6th service
[ ] 8. Frontend upgrade modal appears
[ ] 9. Modal shows correct information
[ ] 10. Service form closes on limit reached
[ ] 11. Backend returns 403 (if bypassing frontend)
[ ] 12. Error message is user-friendly

ADDITIONAL CHECKS
=================

[ ] No console errors during service creation
[ ] No database constraint errors
[ ] Correct vendor_id used ("2-2025-XXX" format)
[ ] Location and availability fields accept long values
[ ] Images upload correctly (if applicable)
[ ] Service data persists after page refresh
```

## 🎯 Expected Behavior Summary

### Normal Service Creation (Below Limit)
1. User clicks "Add Service"
2. User fills form
3. Frontend checks limit → Under limit ✅
4. API call made to backend
5. Backend checks limit → Under limit ✅
6. Service created in database
7. Service appears in UI
8. Success message shown

### Service Creation When Limit Reached
1. User clicks "Add Service"
2. User fills form
3. **Frontend checks limit → Limit reached ❌**
4. **Upgrade modal appears**
5. **Form closes**
6. **No API call made**

### Backend Limit Enforcement (If Frontend Bypassed)
1. API call made to backend
2. **Backend checks limit → Limit reached ❌**
3. **Backend returns 403 error**
4. **Error includes upgrade information**
5. Service NOT created
6. Error message shown to user
