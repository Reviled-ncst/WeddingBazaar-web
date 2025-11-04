# Registration Fix Implementation Plan

## Issues Identified

### 1. **Field Mapping Issues (Frontend → Backend)**
**Problem**: Frontend sends `role` but backend expects `user_type`
- RegisterModal.tsx line 297: `role: userType`
- AuthContext.tsx line 413: Maps `user_type: userData.role`
- Backend auth.cjs line 155: Accepts both but validates `user_type`

**Status**: ✅ ALREADY HANDLED by backend (line 155 accepts both)

### 2. **Coordinator-Specific Fields Not Sent**
**Problem**: Frontend conditionally includes coordinator fields, but they may not be properly formatted

**Current Code** (RegisterModal.tsx lines 307-312):
```typescript
...(userType === 'coordinator' && {
  years_experience: formData.years_experience,
  team_size: formData.team_size,
  specialties: formData.specialties,
  service_areas: formData.service_areas,
}),
```

**Backend Expectation** (auth.cjs lines 357-396):
- `years_experience`: Parsed as integer from string like '3-5' or '5'
- `team_size`: String like 'Solo', 'Small Team', etc.
- `specialties`: Array of strings
- `service_areas`: Array of strings

### 3. **Vendor Type Field Missing**
**Problem**: Neither vendor nor coordinator registration includes `vendor_type` field
- This field is required by vendor_profiles table
- Document verification logic depends on this field

### 4. **Auth Context Not Preserving User Type**
**Problem**: After registration, user object may not have correct `vendorId` or `role` mapping

**Current Mapping** (AuthContext.tsx lines 495-512):
```typescript
const userRole = data.user.userType || data.user.user_type || data.user.role || 'couple';
const mappedUser = {
  ...data.user,
  role: userRole,
  firstName: data.user.firstName || data.user.first_name || '',
  lastName: data.user.lastName || data.user.last_name || '',
  vendorId: data.user.vendorId || (userRole === 'vendor' ? data.user.id : null)
};
```

**Issue**: Coordinator users should also get vendorId since they have vendor_profiles

## Fix Plan

### Priority 1: Add vendor_type to Registration (CRITICAL)
**Why**: Document verification depends on this field

**Frontend Changes** (RegisterModal.tsx):
1. Add vendor_type selection for vendors (business/freelancer)
2. Set vendor_type to 'business' for coordinators (coordinators are always businesses)
3. Include vendor_type in registration payload

**Backend Changes** (auth.cjs):
1. Accept vendor_type from frontend
2. Set default vendor_type if not provided
3. Save vendor_type to vendor_profiles table

### Priority 2: Fix Coordinator Fields Format
**Frontend Changes** (RegisterModal.tsx):
1. Ensure years_experience is sent as string (backend will parse)
2. Ensure team_size is sent as string
3. Ensure specialties and service_areas are arrays

**Backend Changes** (auth.cjs):
1. ✅ Already handles parsing correctly (lines 357-396)
2. ✅ Already uses JSON.stringify for arrays (line 421)

### Priority 3: Fix Auth Context User Mapping
**Frontend Changes** (AuthContext.tsx):
1. Map coordinator users to have vendorId
2. Preserve vendor_type in user object

### Priority 4: Add Validation for Required Fields
**Frontend Changes** (RegisterModal.tsx):
1. Add validation for coordinator required fields
2. Show error if business_name or business_type is empty
3. Show error if vendor_type is not selected for vendors

## Implementation Steps

### Step 1: Add vendor_type to RegisterModal
```typescript
// Add to formData state
const [formData, setFormData] = useState({
  // ... existing fields ...
  vendor_type: 'business', // Default for vendors/coordinators
  // ... rest of fields ...
});

// Add vendor_type selector for vendors (in UI)
{userType === 'vendor' && (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      Business Type <span className="text-red-500">*</span>
    </label>
    <select
      value={formData.vendor_type}
      onChange={(e) => handleInputChange('vendor_type', e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
    >
      <option value="business">Registered Business</option>
      <option value="freelancer">Freelancer</option>
    </select>
  </div>
)}

// In handleSubmit, include vendor_type
await register({
  // ... existing fields ...
  ...((userType === 'vendor' || userType === 'coordinator') && {
    business_name: formData.business_name,
    business_type: formData.business_type,
    location: formData.location,
    vendor_type: userType === 'coordinator' ? 'business' : formData.vendor_type,
  }),
  // ... rest of fields ...
});
```

### Step 2: Update AuthContext to Accept vendor_type
```typescript
// In register function, map vendor_type
const backendUserData = {
  first_name: userData.firstName,
  last_name: userData.lastName,
  email: userData.email,
  password: userData.password,
  user_type: userData.role,
  phone: userData.phone,
  business_name: userData.business_name,
  business_type: userData.business_type,
  location: userData.location,
  vendor_type: userData.vendor_type, // NEW
  // Coordinator fields
  years_experience: userData.years_experience,
  team_size: userData.team_size,
  specialties: userData.specialties,
  service_areas: userData.service_areas,
};

// In user mapping, preserve vendor_type
const mappedUser = {
  ...data.user,
  role: userRole,
  firstName: data.user.firstName || data.user.first_name || '',
  lastName: data.user.lastName || data.user.last_name || '',
  vendorId: data.user.vendorId || 
    (userRole === 'vendor' || userRole === 'coordinator' ? data.user.id : null),
  vendorType: data.user.vendor_type || data.user.vendorType, // NEW
};
```

### Step 3: Update Backend to Save vendor_type
```javascript
// In auth.cjs register endpoint, extract vendor_type
const {
  // ... existing fields ...
  vendor_type, // NEW
} = req.body;

// Set default vendor_type
const actualVendorType = vendor_type || 
  (actualUserType === 'coordinator' ? 'business' : 'business');

// Save to vendor_profiles
profileResult = await sql`
  INSERT INTO vendor_profiles (
    user_id, business_name, business_type, vendor_type, // NEW
    // ... rest of columns ...
  )
  VALUES (
    ${userId}, ${business_name}, ${business_type}, ${actualVendorType}, // NEW
    // ... rest of values ...
  )
  RETURNING *
`;
```

### Step 4: Add Frontend Validation
```typescript
// In validateForm function
const validateForm = (): {[key: string]: string} => {
  const errors: {[key: string]: string} = {};
  
  // ... existing validations ...
  
  // Vendor/Coordinator validations
  if (userType === 'vendor' || userType === 'coordinator') {
    if (!formData.business_name?.trim()) {
      errors.business_name = 'Business name is required';
    }
    if (!formData.business_type) {
      errors.business_type = 'Business type is required';
    }
    if (userType === 'vendor' && !formData.vendor_type) {
      errors.vendor_type = 'Please select your business type';
    }
  }
  
  // Coordinator-specific validations
  if (userType === 'coordinator') {
    if (!formData.years_experience) {
      errors.years_experience = 'Years of experience is required';
    }
    if (!formData.team_size) {
      errors.team_size = 'Team size is required';
    }
  }
  
  return errors;
};
```

## Testing Checklist

### Test 1: Vendor Registration
- [ ] Select "Service Provider" user type
- [ ] Fill required fields (name, email, password, business_name, business_type)
- [ ] Select vendor_type (business or freelancer)
- [ ] Submit registration
- [ ] Verify user is created in users table
- [ ] Verify vendor_profiles entry has correct vendor_type
- [ ] Verify login works and redirects to vendor dashboard
- [ ] Verify document requirements match vendor_type

### Test 2: Coordinator Registration
- [ ] Select "Coordinator" user type
- [ ] Fill required fields (name, email, password, business_name, business_type)
- [ ] Fill coordinator fields (years_experience, team_size, specialties, service_areas)
- [ ] Submit registration
- [ ] Verify user is created with user_type='coordinator'
- [ ] Verify vendor_profiles entry has vendor_type='business'
- [ ] Verify coordinator fields are saved (years_experience, team_size, etc.)
- [ ] Verify login works and redirects to vendor/coordinator dashboard
- [ ] Verify document requirements show business documents

### Test 3: Couple Registration
- [ ] Select "Couple" user type
- [ ] Fill required fields (name, email, password)
- [ ] Submit registration
- [ ] Verify user is created in users table
- [ ] Verify couple_profiles entry is created
- [ ] Verify login works and redirects to individual dashboard

### Test 4: Field Validation
- [ ] Try vendor registration without business_name - should show error
- [ ] Try vendor registration without business_type - should show error
- [ ] Try vendor registration without vendor_type - should show error
- [ ] Try coordinator registration without years_experience - should show error
- [ ] Try coordinator registration without team_size - should show error
- [ ] Verify all error messages display correctly

## Deployment Steps

1. **Code Changes**:
   - Update RegisterModal.tsx (add vendor_type field and validation)
   - Update AuthContext.tsx (map vendor_type in payload and user object)
   - Update backend auth.cjs (extract and save vendor_type)

2. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Fix: Add vendor_type to registration flow for vendors and coordinators"
   git push origin main
   ```

3. **Deploy Backend**:
   - Render will auto-deploy from GitHub
   - Monitor logs: https://dashboard.render.com/web/srv-xxx

4. **Deploy Frontend**:
   ```powershell
   npm run build
   firebase deploy --only hosting
   ```

5. **Test in Production**:
   - Test vendor registration with business/freelancer selection
   - Test coordinator registration
   - Verify document requirements update correctly
   - Test login after registration

## Success Criteria

- ✅ Vendor registration allows selection of business/freelancer
- ✅ Coordinator registration defaults to business type
- ✅ vendor_type is saved to vendor_profiles table
- ✅ Document requirements display correctly based on vendor_type
- ✅ Login after registration preserves user type and vendor_type
- ✅ Service creation is blocked until required documents are verified
- ✅ All validations work correctly (frontend and backend)

## Rollback Plan

If issues occur:

1. **Revert Frontend**:
   ```bash
   git revert HEAD
   npm run build
   firebase deploy --only hosting
   ```

2. **Revert Backend**:
   ```bash
   git revert HEAD
   git push origin main
   # Wait for Render auto-deployment
   ```

3. **Database Cleanup** (if needed):
   ```sql
   -- Check for any malformed entries
   SELECT id, user_id, vendor_type FROM vendor_profiles 
   WHERE vendor_type IS NULL OR vendor_type NOT IN ('business', 'freelancer');
   
   -- Fix entries without vendor_type
   UPDATE vendor_profiles 
   SET vendor_type = 'business' 
   WHERE vendor_type IS NULL;
   ```

## Status: READY TO IMPLEMENT

All issues identified, fix plan documented, testing checklist ready.
Ready to proceed with code changes.
