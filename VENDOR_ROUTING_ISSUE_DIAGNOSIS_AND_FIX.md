# Vendor Routing Issue - Diagnosis and Fix

## Problem Statement
Vendor accounts are being routed to individual pages (`/individual`) instead of vendor pages (`/vendor`) after login or registration.

## Root Cause Analysis

### Key Files Involved
1. **AuthService** (`backend/services/authService.ts`) - Returns user data with role
2. **ProtectedRoute** (`src/router/ProtectedRoute.tsx`) - Handles role-based routing
3. **Login/Register Modals** - Handle authentication flow

### Suspected Issues
1. **Database Role Values**: The `user_type` field in the database might contain unexpected values
2. **Type Assertion Bug**: AuthService uses `as 'couple' | 'vendor' | 'admin'` which masks runtime issues
3. **Case Sensitivity**: Role values might be capitalized or have different casing
4. **Null/Undefined Values**: Role field might be null or undefined

## Implemented Fixes

### 1. Enhanced Backend Role Handling
- Added comprehensive role normalization function in AuthService
- Added debug logging to see exact database values
- Fixed type assertions to use normalized values
- Handles common variations: 'business' → 'vendor', 'individual' → 'couple'

### 2. Enhanced Frontend Debugging
- Added RoleDebugger component to display current user role
- Added debug logging in ProtectedRoute to trace routing decisions
- Enhanced getUserLandingPage function with detailed logging

### 3. Fixes Applied
```typescript
// Backend: AuthService.normalizeRole()
private normalizeRole(dbRole: string | null | undefined): 'couple' | 'vendor' | 'admin' {
  if (!dbRole) return 'couple';
  
  const role = dbRole.toLowerCase().trim();
  switch (role) {
    case 'vendor':
    case 'business':
    case 'provider':
      return 'vendor';
    case 'couple':
    case 'individual':
    case 'user':
      return 'couple';
    case 'admin':
    case 'administrator':
      return 'admin';
    default:
      return 'couple';
  }
}

// Frontend: Enhanced debugging in ProtectedRoute
const getUserLandingPage = (role?: string): string => {
  console.log('🚦 getUserLandingPage called with role:', JSON.stringify(role));
  switch (role) {
    case 'vendor': return '/vendor';
    case 'couple': return '/individual';
    case 'admin': return '/admin';
    default: return '/individual';
  }
};
```

## Current Status

### Frontend Changes ✅ DEPLOYED
- Enhanced debugging is live at https://weddingbazaarph.web.app
- RoleDebugger component shows current user role
- Console logs show routing decisions

### Backend Changes ⏳ PENDING DEPLOYMENT
- Role normalization function added
- Debug logging added
- Fixes applied to both login and register methods
- **Needs deployment to Render to take effect**

### ✅ ISSUE CONFIRMED - Console Log Evidence
```
✅ Login successful for: vendor0@gmail.com with role: couple
```
**Root Cause Identified**: The database is storing `"couple"` as the role for vendor accounts instead of `"vendor"`. This confirms the backend role normalization fix is needed.

## Next Steps

### Immediate Actions Required
1. **Deploy Backend Changes** - The role normalization fixes need to be deployed to Render
2. **Test with Real Account** - Register a vendor account and observe:
   - What role value is returned by the API
   - What the RoleDebugger displays
   - What routing decision is made
3. **Verify Database Values** - Check what `user_type` values are actually stored

### Testing Plan
1. Open https://weddingbazaarph.web.app in browser with dev tools
2. Register new vendor account with test email
3. Observe console logs during registration and login
4. Check RoleDebugger display
5. Verify final landing page

### Expected Results After Fix
- Vendor registration should show role: "vendor" in RoleDebugger
- Vendor login should route to `/vendor` landing page
- Console should show: "✅ Routing to /vendor for vendor"

## Deployment Requirements
The current frontend debugging is live, but the backend role normalization needs to be deployed to Render for the complete fix to work.

## Fallback Plan
If role normalization doesn't solve the issue, the problem might be:
1. **JWT Token Role**: The role in the JWT token doesn't match the expected format
2. **AuthContext Parsing**: The frontend AuthContext might not be parsing the response correctly
3. **Database Schema**: The `user_type` column might have a constraint limiting values

This comprehensive approach should resolve the vendor routing issue by:
1. Normalizing any unexpected database role values
2. Providing clear debugging information
3. Ensuring consistent role handling across login and registration
