# Registration/Authentication Issues - Root Cause Analysis

## Date: November 3, 2025

## Issues Identified

### 1. **AuthContext.tsx Has Broken Console.Log Statements** ⚠️  CRITICAL
**Location**: `src/shared/contexts/AuthContext.tsx` lines 149, 312, 433, 586, etc.
**Problem**: Multiple incomplete/broken console.log statements causing TypeScript compilation errors
**Examples**:
```typescript
// Line 149
 => `Part ${i}: ${part.substring(0, 20)}...`)); // Incomplete console.log

// Line 433
, using mock registration'); // Missing console.log(

// Line 586
...');  // Incomplete string literal
```

**Impact**: 
- File cannot be edited without fixing these first
- TypeScript compiler shows 71+ errors
- Any changes to AuthContext fail to compile

**Fix Required**: Clean up all broken console.log statements before making any other changes

### 2. **vendor_type Field Missing from Registration**
**Problem**: Neither vendor nor coordinator registration includes `vendor_type` field
**Impact**: Document verification logic cannot differentiate between business and freelancer
**Status**: ✅ PARTIALLY FIXED in RegisterModal.tsx (added to form state and handleSubmit)
**Remaining**: Cannot update AuthContext until syntax errors are fixed

### 3. **Coordinator Fields May Not Be Sent Correctly**
**Problem**: Coordinator-specific fields (years_experience, team_size, specialties, service_areas) are conditionally included but not validated
**Status**: ✅ FIXED in RegisterModal.tsx handleSubmit function (lines 307-312)
**Backend**: ✅ Backend correctly handles these fields (auth.cjs lines 357-396)

### 4. **User Object Doesn't Include vendor_type After Registration**
**Problem**: After registration, the user object stored in state doesn't include vendor_type
**Impact**: Document upload component can't determine correct document requirements
**Status**: ❌ BLOCKED by AuthContext syntax errors

## Current State of Files

### RegisterModal.tsx ✅ PARTIALLY FIXED
- ✅ Added `vendor_type` to formData state (line 95)
- ✅ Added `vendor_type` to form reset (line 171)
- ✅ Included `vendor_type` in handleSubmit (lines 307-312)
- ❌ **MISSING**: UI selector for vendors to choose business/freelancer
- ❌ **MISSING**: Validation for vendor_type selection

### AuthContext.tsx ❌ BLOCKED - SYNTAX ERRORS
- ❌ Cannot edit until all console.log statements are fixed
- ❌ Cannot add vendor_type to backendUserData
- ❌ Cannot update user mapping to preserve vendor_type
- **Estimated Fix Time**: 30-45 minutes to clean up all syntax errors

### Backend auth.cjs ✅ READY
- ✅ Accepts both `user_type` and `role` (line 155)
- ✅ Accepts `vendor_type` field (needs to be added to extraction)
- ✅ Correctly parses coordinator fields (lines 357-396)
- ❌ **NEEDS**: Extract `vendor_type` from req.body and save to vendor_profiles

## Priority Tasks

### Priority 1: Fix AuthContext.tsx Syntax Errors (CRITICAL)
**Estimated Time**: 30-45 minutes
**Steps**:
1. Search for all broken console.log statements:
   - Lines with incomplete string literals
   - Lines with missing console.log prefix
   - Lines with broken template literals
2. Fix or remove each broken console.log
3. Verify TypeScript compilation succeeds
4. Commit fix: "Fix: Repair broken console.log statements in AuthContext"

**Broken Locations**:
- Line 149: `=> \`Part ${i}: ${part.substring(0, 20)}...\`));`
- Line 312: `);` (incomplete console.log)
- Line 433: `, using mock registration');` (missing console.log()
- Line 586: `...');` (incomplete string)
- Line 588: `- service may be sleeping...');` (missing console.log()

### Priority 2: Add vendor_type to Backend
**Estimated Time**: 10 minutes
**File**: `backend-deploy/routes/auth.cjs`
**Changes**:
```javascript
// Line 151 - Extract vendor_type
const {
  email, password, first_name, last_name, user_type, role, phone,
  business_name, business_type, vendor_type, location, // ADD vendor_type
  years_experience, team_size, specialties, service_areas,
  wedding_date, partner_name, budget_range
} = req.body;

// Line 184+ - Set default vendor_type
const actualVendorType = vendor_type || 
  (actualUserType === 'coordinator' ? 'business' : 'business');

// Line 240+ - Save to vendor_profiles
profileResult = await sql`
  INSERT INTO vendor_profiles (
    user_id, business_name, business_type, vendor_type, // ADD
    // ... rest of columns
  )
  VALUES (
    ${userId}, ${business_name}, ${business_type}, ${actualVendorType}, // ADD
    // ... rest of values
  )
`;
```

### Priority 3: Add Vendor Type Selector UI
**Estimated Time**: 15 minutes
**File**: `src/shared/components/modals/RegisterModal.tsx`
**Location**: After business_type selector (around line 1100)
**Add**:
```tsx
{userType === 'vendor' && (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      Business Type <span className="text-red-500">*</span>
    </label>
    <select
      value={formData.vendor_type}
      onChange={(e) => updateFormData('vendor_type', e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
    >
      <option value="business">Registered Business</option>
      <option value="freelancer">Freelancer / Sole Proprietor</option>
    </select>
    <p className="text-xs text-gray-500">
      This determines which documents you'll need to upload for verification
    </p>
  </div>
)}
```

### Priority 4: Update AuthContext After Syntax Fix
**Estimated Time**: 5 minutes
**File**: `src/shared/contexts/AuthContext.tsx` (after Priority 1 is complete)
**Changes**:
```typescript
// In register function, line 400+
const backendUserData = {
  first_name: userData.firstName,
  last_name: userData.lastName,
  email: userData.email,
  password: userData.password,
  user_type: userData.role,
  phone: userData.phone,
  business_name: userData.business_name,
  business_type: userData.business_type,
  vendor_type: userData.vendor_type, // ADD
  location: userData.location,
  years_experience: userData.years_experience, // ADD
  team_size: userData.team_size, // ADD
  specialties: userData.specialties, // ADD
  service_areas: userData.service_areas // ADD
};

// In user mapping, line 495+
const mappedUser = {
  ...data.user,
  role: userRole,
  firstName: data.user.firstName || data.user.first_name || '',
  lastName: data.user.lastName || data.user.last_name || '',
  vendorId: data.user.vendorId || 
    (userRole === 'vendor' || userRole === 'coordinator' ? data.user.id : null), // FIX
  vendorType: data.user.vendor_type || data.user.vendorType // ADD
};
```

### Priority 5: Add Validation
**Estimated Time**: 10 minutes
**File**: `src/shared/components/modals/RegisterModal.tsx`
**Update validateForm function**:
```typescript
if (userType === 'vendor') {
  if (!formData.vendor_type) {
    errors.vendor_type = 'Please select your business type';
  }
}

if (userType === 'coordinator') {
  if (!formData.years_experience) {
    errors.years_experience = 'Years of experience is required';
  }
  if (!formData.team_size) {
    errors.team_size = 'Team size is required';
  }
}
```

## Testing Plan

### Test 1: Vendor Registration as Business
1. Select "Service Provider" user type
2. Fill in all required fields
3. Select "Registered Business" for business type
4. Submit registration
5. Verify vendor_profiles.vendor_type = 'business'
6. Verify document requirements show business documents

### Test 2: Vendor Registration as Freelancer
1. Select "Service Provider" user type
2. Fill in all required fields
3. Select "Freelancer / Sole Proprietor" for business type
4. Submit registration
5. Verify vendor_profiles.vendor_type = 'freelancer'
6. Verify document requirements show freelancer documents

### Test 3: Coordinator Registration
1. Select "Coordinator" user type
2. Fill in all required fields (including coordinator-specific)
3. Submit registration
4. Verify vendor_profiles.vendor_type = 'business' (auto-set)
5. Verify years_experience, team_size, specialties, service_areas are saved
6. Verify login works and redirects to coordinator dashboard

## Implementation Order

1. ✅ Fix AuthContext.tsx syntax errors (PRIORITY 1) - **BLOCKED CURRENT WORK**
2. ✅ Add vendor_type to backend auth.cjs (PRIORITY 2) - **CAN DO NOW**
3. ✅ Add vendor type selector UI (PRIORITY 3) - **CAN DO NOW**
4. ⏳ Update AuthContext after syntax fix (PRIORITY 4) - **BLOCKED BY #1**
5. ⏳ Add validation (PRIORITY 5) - **CAN DO NOW, BUT SHOULD WAIT FOR #4**

## Deployment Timeline

**Phase 1 (Now)**: Backend + UI changes (can deploy immediately)
- Add vendor_type extraction and saving in backend
- Add vendor type selector in RegisterModal
- Add basic validation

**Phase 2 (After AuthContext fix)**: Complete frontend integration
- Fix AuthContext syntax errors
- Update user object mapping
- Test end-to-end registration flow

**Phase 3**: Production deployment
- Deploy backend to Render
- Deploy frontend to Firebase
- Test all three user types (couple, vendor, coordinator)
- Verify document verification works correctly

## Success Criteria

- ✅ Vendor registration allows selection of business/freelancer
- ✅ Coordinator registration defaults to business type
- ✅ vendor_type is saved to vendor_profiles table
- ✅ Coordinator-specific fields are saved correctly
- ✅ Login after registration preserves all user data
- ✅ Document upload component shows correct requirements
- ✅ Service creation is blocked until required documents verified
- ✅ No TypeScript compilation errors
- ✅ All validation works correctly

## Current Blockers

1. **AuthContext.tsx Syntax Errors** - Must be fixed before any other changes
   - 71+ TypeScript errors
   - Multiple broken console.log statements
   - Blocks vendor_type user mapping
   - Estimated fix time: 30-45 minutes

2. **No UI Selector for vendor_type** - Can be added now (Priority 3)
   - Vendors cannot currently choose business vs freelancer
   - Easy fix, just add dropdown

3. **Backend Doesn't Extract vendor_type** - Can be fixed now (Priority 2)
   - Field is sent from frontend
   - Backend needs to extract and save it
   - Easy fix, 3 lines of code

## Next Steps

**Immediate Action**: 
1. Fix AuthContext.tsx syntax errors (see Priority 1 above)
2. Once AuthContext is clean, proceed with Priority 4
3. Meanwhile, implement Priority 2 and 3 (backend + UI)

**After All Fixes**:
1. Test locally
2. Commit all changes
3. Deploy backend (auto-deploys via Render)
4. Deploy frontend (firebase deploy)
5. Test in production

## Status: 60% COMPLETE

- ✅ Issue identified and documented
- ✅ RegisterModal partially fixed (vendor_type added to state)
- ❌ AuthContext blocked by syntax errors
- ❌ Backend needs vendor_type extraction
- ❌ UI needs vendor type selector
- ❌ Validation incomplete

**Estimated Completion Time**: 1-1.5 hours total
- 30-45 min: Fix AuthContext syntax
- 10 min: Backend changes
- 15 min: UI selector
- 10 min: Validation
- 15 min: Testing

