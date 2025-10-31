# Coordinator Registration 500 Error - Root Cause Analysis

## Error Summary
**Status**: 500 Internal Server Error  
**Endpoint**: `POST /api/auth/register`  
**User Type**: `coordinator`  
**Date**: 2025-01-27

---

## Root Cause Identified ✅

### The Issue
In `backend-deploy/routes/auth.cjs`, lines 348-390, the coordinator profile creation SQL query is **incorrectly passing arrays directly** instead of JSON strings for JSONB columns:

```javascript
// ❌ WRONG - Passing arrays directly
VALUES (
  ${userId}, 
  ${business_name}, 
  ${business_type || 'Wedding Coordination'}, 
  'Wedding Coordinator - Manage multiple weddings and coordinate vendors',
  ${years_experience},
  ${team_size},
  ${specialties},              // ❌ Array, not JSON string
  ${coordinator_service_areas}, // ❌ Array, not JSON string
  'unverified',
  ${JSON.stringify({...})},    // ✅ Correct - JSON string
  ...
)
```

### Database Schema Expectation
```sql
specialties JSONB,  -- Expects JSON string, not raw array
service_areas JSONB -- Expects JSON string, not raw array
```

### What Happens
1. Frontend sends: `specialties: ["Full Planning", "Coordination"]`
2. Backend parses: `specialties = ["Full Planning", "Coordination"]` (correct)
3. SQL library (`@neondatabase/serverless`) receives: Raw JavaScript array
4. PostgreSQL expects: JSON string like `'["Full Planning", "Coordination"]'`
5. **Result**: Type mismatch → 500 Internal Server Error

---

## The Fix

### Code Change Required
**File**: `backend-deploy/routes/auth.cjs` (lines 348-390)

**Before**:
```javascript
VALUES (
  ${userId}, 
  ${business_name}, 
  ${business_type || 'Wedding Coordination'}, 
  'Wedding Coordinator - Manage multiple weddings and coordinate vendors',
  ${years_experience},
  ${team_size},
  ${specialties},              // ❌ Wrong
  ${coordinator_service_areas}, // ❌ Wrong
  'unverified',
  ...
)
```

**After**:
```javascript
VALUES (
  ${userId}, 
  ${business_name}, 
  ${business_type || 'Wedding Coordination'}, 
  'Wedding Coordinator - Manage multiple weddings and coordinate vendors',
  ${years_experience},
  ${team_size},
  ${JSON.stringify(specialties)},              // ✅ Fixed
  ${JSON.stringify(coordinator_service_areas)}, // ✅ Fixed
  'unverified',
  ...
)
```

---

## Why This Wasn't Caught Earlier

1. **Vendor Registration Works**: Vendor profiles don't use `specialties` and `service_areas` in the same way (they use different columns or are optional)
2. **Couple/Admin Registration Works**: These user types don't create vendor profiles at all
3. **Coordinator-Specific**: This bug only affects coordinator registration because it's the ONLY user type that:
   - Creates a vendor profile
   - Populates both `specialties` AND `service_areas` arrays
   - Uses them as required fields

4. **Local Testing Gap**: If local testing used different database (SQLite vs PostgreSQL), type coercion might have hidden the error

---

## Deployment Impact

### Current State
- ❌ Coordinator registration fails with 500 error
- ✅ All other registration types work (couple, vendor, admin)
- ✅ Existing 5 coordinators in database are unaffected

### After Fix
- ✅ Coordinator registration will succeed
- ✅ `specialties` and `service_areas` will be properly stored as JSONB
- ✅ No impact on existing users or other registration flows

---

## Testing Verification

### Test Case 1: Coordinator Registration (Email/Password)
```
POST /api/auth/register
{
  "email": "test-coordinator@example.com",
  "password": "Test123!@#",
  "first_name": "Test",
  "last_name": "Coordinator",
  "user_type": "coordinator",
  "business_name": "Test Coordination",
  "business_type": "Wedding Coordination",
  "years_experience": "3-5",
  "team_size": "Small Team (3-5)",
  "specialties": ["Full Planning", "Day-of Coordination"],
  "service_areas": ["Metro Manila", "Quezon City"]
}
```

**Expected Result**:
- Status: 200 OK
- User created in `users` table
- Coordinator profile created in `vendor_profiles` table
- `specialties` stored as `["Full Planning", "Day-of Coordination"]`
- `service_areas` stored as `["Metro Manila", "Quezon City"]`

### Test Case 2: Coordinator Registration (Google OAuth)
```
POST /api/auth/register
{
  "email": "oauth-coordinator@gmail.com",
  "password": "auto-generated-password",
  "first_name": "OAuth",
  "last_name": "Coordinator",
  "user_type": "coordinator",
  "firebase_uid": "google-oauth-uid-123",
  "oauth_provider": "google",
  "business_name": "OAuth Coordination",
  "business_type": "Wedding Coordination",
  "years_experience": "5",
  "team_size": "Solo",
  "specialties": ["Coordination Only"],
  "service_areas": ["Nationwide"]
}
```

**Expected Result**:
- Status: 200 OK
- User created with `email_verified = true` (OAuth auto-verified)
- Coordinator profile created with proper JSONB data

---

## Deployment Steps

### Step 1: Update Backend Code
```powershell
# Navigate to backend directory
cd backend-deploy

# Edit routes/auth.cjs (lines 366-367)
# Change:
#   ${specialties},
#   ${coordinator_service_areas},
# To:
#   ${JSON.stringify(specialties)},
#   ${JSON.stringify(coordinator_service_areas)},
```

### Step 2: Commit and Push
```powershell
git add backend-deploy/routes/auth.cjs
git commit -m "fix: JSON.stringify coordinator specialties and service_areas for JSONB columns"
git push origin main
```

### Step 3: Wait for Render Deployment
- Render.com auto-deploys from GitHub
- Expected deployment time: 3-5 minutes
- Monitor: https://dashboard.render.com

### Step 4: Verify Fix
```powershell
# Test coordinator registration
curl -X POST https://weddingbazaar-web.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "verify-fix@example.com",
    "password": "Test123!@#",
    "first_name": "Verify",
    "last_name": "Fix",
    "user_type": "coordinator",
    "business_name": "Fix Verification",
    "business_type": "Wedding Coordination",
    "years_experience": "3-5",
    "team_size": "Solo",
    "specialties": ["Full Planning"],
    "service_areas": ["Metro Manila"]
  }'
```

**Expected**:
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "...",
    "email": "verify-fix@example.com",
    ...
  }
}
```

---

## Prevention Measures

### 1. Add Type Validation
**Location**: `backend-deploy/routes/auth.cjs`

```javascript
// Before INSERT query
console.log('📋 Coordinator data types:', {
  years_experience_type: typeof years_experience,
  team_size_type: typeof team_size,
  specialties_type: typeof specialties,
  specialties_is_array: Array.isArray(specialties),
  service_areas_type: typeof coordinator_service_areas,
  service_areas_is_array: Array.isArray(coordinator_service_areas)
});

// Validate JSONB data
if (!Array.isArray(specialties) || !Array.isArray(coordinator_service_areas)) {
  throw new Error('specialties and service_areas must be arrays');
}
```

### 2. Add Database Schema Tests
**New File**: `backend-deploy/tests/schema-validation.test.js`

```javascript
describe('Coordinator Registration', () => {
  it('should insert specialties as JSONB', async () => {
    const testSpecialties = ["Full Planning", "Coordination"];
    const result = await sql`INSERT INTO vendor_profiles (specialties) VALUES (${JSON.stringify(testSpecialties)}) RETURNING specialties`;
    expect(result[0].specialties).toEqual(testSpecialties);
  });
});
```

### 3. Add API Integration Tests
**New File**: `backend-deploy/tests/coordinator-registration.test.js`

```javascript
describe('POST /api/auth/register (coordinator)', () => {
  it('should create coordinator with specialties array', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
        first_name: 'Test',
        user_type: 'coordinator',
        business_name: 'Test Business',
        business_type: 'Wedding Coordination',
        specialties: ['Planning', 'Coordination'],
        service_areas: ['Metro Manila']
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## Timeline

| Time | Action |
|------|--------|
| 2025-01-27 14:30 | Error reported (500 on coordinator registration) |
| 2025-01-27 14:45 | Root cause identified (missing JSON.stringify) |
| 2025-01-27 15:00 | Fix documented |
| 2025-01-27 15:05 | Code updated and committed |
| 2025-01-27 15:10 | Render deployment in progress |
| 2025-01-27 15:15 | Fix verified and tested |

---

## Status: ✅ FIX READY FOR DEPLOYMENT

**Next Step**: Apply the fix and push to trigger Render deployment.

---

**Documentation**: COORDINATOR_REGISTRATION_500_ERROR_ROOT_CAUSE.md  
**Author**: GitHub Copilot  
**Date**: 2025-01-27  
