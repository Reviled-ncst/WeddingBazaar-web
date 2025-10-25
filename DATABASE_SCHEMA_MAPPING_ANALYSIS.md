# 🔍 Database Schema vs Code Mapping Analysis

## Database Schema: `vendor_profiles` Table

### Complete Column List
```sql
id                              UUID PRIMARY KEY DEFAULT gen_random_uuid()
business_name                   VARCHAR(200) NOT NULL
business_type                   VARCHAR(100) NOT NULL
business_description            TEXT
business_registration_number    VARCHAR(100)
tax_identification_number       VARCHAR(100)
years_in_business              INTEGER
verification_status            VARCHAR(50) DEFAULT 'unverified'
verification_documents         JSONB
website_url                    TEXT
social_media                   JSONB
service_areas                  JSONB
pricing_range                  JSONB
portfolio_images               JSONB
featured_image_url             TEXT
business_hours                 JSONB
cancellation_policy            TEXT
terms_of_service               TEXT
average_rating                 NUMERIC(3,2) DEFAULT 0.00
total_reviews                  INTEGER DEFAULT 0
total_bookings                 INTEGER DEFAULT 0
response_time_hours            INTEGER DEFAULT 24
is_featured                    BOOLEAN DEFAULT false
is_premium                     BOOLEAN DEFAULT false
created_at                     TIMESTAMP WITH TIME ZONE DEFAULT now()
updated_at                     TIMESTAMP WITH TIME ZONE DEFAULT now()
user_id                        VARCHAR(255) NOT NULL
business_verified              BOOLEAN DEFAULT false
documents_verified             BOOLEAN DEFAULT false
website                        VARCHAR(255)
team_size                      INTEGER
service_area                   TEXT
price_range                    VARCHAR(50)
facebook_url                   VARCHAR(255)
instagram_url                  VARCHAR(255)
twitter_url                    VARCHAR(255)
linkedin_url                   VARCHAR(255)
profile_image                  VARCHAR(255)
cover_image                    VARCHAR(255)
phone_verified                 BOOLEAN DEFAULT false
```

---

## Code Mapping Issues Found

### ⚠️ CRITICAL MISMATCHES

#### 1. **Description Field Mismatch**
**Database**: `business_description` (TEXT)
**Frontend Code**: Uses `description` 
```typescript
// VendorProfile.tsx Line 87
description: profile.description || '',  // ❌ WRONG - should be businessDescription or business_description
```

**Backend API Response**: Likely returns `business_description` or `businessDescription`
**Fix Needed**: YES

---

#### 2. **Phone Field Missing in Database**
**Frontend Code**: Uses `phone`
```typescript
// VendorProfile.tsx Line 93
phone: profile.phone || '',
```

**Database**: No `phone` column exists!
**Available Alternative**: Would need to get from `users` table via `user_id` foreign key
**Fix Needed**: YES - Need to JOIN with users table or add phone column

---

#### 3. **Email Field Missing in Database**
**Frontend Code**: Uses `email`
```typescript
// VendorProfile.tsx Line 94
email: profile.email || '',
```

**Database**: No `email` column exists!
**Available Alternative**: Would need to get from `users` table via `user_id` foreign key
**Fix Needed**: YES - Need to JOIN with users table

---

#### 4. **Location vs Service Area**
**Frontend Code**: Uses `location`
```typescript
// VendorProfile.tsx Line 88
location: profile.location || '',
```

**Database**: Has `service_area` (TEXT) and `service_areas` (JSONB)
**No `location` column!**
**Fix Needed**: YES - Should map to `service_area` (singular)

---

#### 5. **Social Media Structure Mismatch**
**Frontend Code**: Uses object structure
```typescript
// VendorProfile.tsx Line 91
socialMedia: profile.socialMedia || { facebook: '', instagram: '', twitter: '', linkedin: '' }
```

**Database**: 
- Has `social_media` (JSONB) ✅
- Also has separate columns: `facebook_url`, `instagram_url`, `twitter_url`, `linkedin_url`
**Issue**: Redundant storage, unclear which is the source of truth
**Fix Needed**: MAYBE - Need to clarify which field to use

---

#### 6. **Profile Image Field Name**
**Frontend Code**: Uses `profileImage` (camelCase)
```typescript
// VendorProfile.tsx Line 95
profileImage: profile.profileImage || ''
```

**Database**: Uses `profile_image` (snake_case)
**Backend Should Convert**: snake_case → camelCase in API response
**Status**: ✅ OK if backend converts properly

---

### ✅ CORRECT MAPPINGS

| Frontend (camelCase) | Database (snake_case) | Status |
|---------------------|----------------------|---------|
| `businessName` | `business_name` | ✅ OK |
| `businessType` | `business_type` | ✅ OK |
| `yearsInBusiness` | `years_in_business` | ✅ OK |
| `website` | `website` OR `website_url` | ⚠️ Two columns! |
| `serviceArea` | `service_area` | ✅ OK (if mapped) |
| `profileImage` | `profile_image` | ✅ OK |
| `coverImage` | `cover_image` | ✅ OK |
| `portfolioImages` | `portfolio_images` | ✅ OK |
| `businessVerified` | `business_verified` | ✅ OK |
| `documentsVerified` | `documents_verified` | ✅ OK |
| `phoneVerified` | `phone_verified` | ✅ OK |

---

## Required Fixes

### Fix 1: Update VendorProfile.tsx Field Mapping

**File**: `src/pages/users/vendor/profile/VendorProfile.tsx`
**Line**: 80-100 (useEffect)

**Current (WRONG)**:
```typescript
React.useEffect(() => {
  if (profile) {
    setEditForm({
      businessName: profile.businessName || '',
      businessType: profile.businessType || '',
      description: profile.description || '',  // ❌ WRONG
      location: profile.location || '',        // ❌ WRONG
      yearsInBusiness: profile.yearsInBusiness || 0,
      website: profile.website || '',
      socialMedia: profile.socialMedia || { facebook: '', instagram: '', twitter: '', linkedin: '' },
      serviceArea: profile.serviceArea || '',
      phone: profile.phone || '',              // ❌ MISSING IN DB
      email: profile.email || '',              // ❌ MISSING IN DB
      profileImage: profile.profileImage || ''
    });
  }
}, [profile]);
```

**Corrected**:
```typescript
React.useEffect(() => {
  if (profile) {
    setEditForm({
      businessName: profile.businessName || profile.business_name || '',
      businessType: profile.businessType || profile.business_type || '',
      businessDescription: profile.businessDescription || profile.business_description || '',  // ✅ FIXED
      serviceArea: profile.serviceArea || profile.service_area || '',  // ✅ FIXED
      yearsInBusiness: profile.yearsInBusiness || profile.years_in_business || 0,
      website: profile.website || profile.website_url || '',
      socialMedia: profile.socialMedia || profile.social_media || { 
        facebook: profile.facebook_url || '', 
        instagram: profile.instagram_url || '', 
        twitter: profile.twitter_url || '', 
        linkedin: profile.linkedin_url || '' 
      },
      phone: profile.phone || '',  // ⚠️ Comes from users table JOIN
      email: profile.email || '',  // ⚠️ Comes from users table JOIN
      profileImage: profile.profileImage || profile.profile_image || '',
      coverImage: profile.coverImage || profile.cover_image || ''
    });
  }
}, [profile]);
```

---

### Fix 2: Update VendorProfile Type Interface

**File**: `src/services/api/vendorApiService.ts`
**Line**: 28-80

**Add Missing Fields**:
```typescript
export interface VendorProfile {
  // ... existing fields ...
  
  // Database fields (snake_case for backward compatibility)
  business_name?: string;
  business_type?: string;
  business_description?: string;  // ✅ ADD THIS
  service_area?: string;          // ✅ ADD THIS (singular)
  service_areas?: string[] | string;  // JSONB field
  website_url?: string;           // ✅ ADD THIS
  profile_image?: string;         // ✅ ADD THIS
  cover_image?: string;           // ✅ ADD THIS
  facebook_url?: string;          // ✅ ADD THIS
  instagram_url?: string;         // ✅ ADD THIS
  twitter_url?: string;           // ✅ ADD THIS
  linkedin_url?: string;          // ✅ ADD THIS
  years_in_business?: number;     // ✅ ADD THIS
  business_verified?: boolean;    // ✅ ADD THIS
  documents_verified?: boolean;   // ✅ ADD THIS
  phone_verified?: boolean;       // ✅ ADD THIS
  
  // User fields (from JOIN with users table)
  phone?: string;   // ⚠️ From users table
  email?: string;   // ⚠️ From users table
}
```

---

### Fix 3: Backend API - Ensure Proper JOINs

**Issue**: `phone` and `email` are in the `users` table, not `vendor_profiles`

**Backend Query Should Be**:
```sql
SELECT 
  vp.*,
  u.email,
  u.phone
FROM vendor_profiles vp
LEFT JOIN users u ON vp.user_id = u.id
WHERE vp.id = $1
```

**Check Backend File**: `backend-deploy/routes/vendor-profile.cjs`

---

### Fix 4: Backend API - Convert snake_case to camelCase

**Backend Should Return**:
```json
{
  "id": "uuid",
  "businessName": "...",        // Converted from business_name
  "businessType": "...",        // Converted from business_type
  "businessDescription": "...", // Converted from business_description
  "serviceArea": "...",         // Converted from service_area
  "serviceAreas": [...],        // Converted from service_areas (JSONB)
  "profileImage": "...",        // Converted from profile_image
  "coverImage": "...",          // Converted from cover_image
  "yearsInBusiness": 5,         // Converted from years_in_business
  "businessVerified": true,     // Converted from business_verified
  "documentsVerified": true,    // Converted from documents_verified
  "phoneVerified": false,       // Converted from phone_verified
  "websiteUrl": "...",          // Converted from website_url
  "socialMedia": {              // Converted from social_media JSONB
    "facebook": "...",
    "instagram": "...",
    "twitter": "...",
    "linkedin": "..."
  },
  "phone": "...",               // From users table JOIN
  "email": "...",               // From users table JOIN
  
  // Keep snake_case for backward compatibility (optional)
  "business_name": "...",
  "business_type": "...",
  "business_description": "..."
}
```

---

## Database Schema Issues

### Redundant Columns
1. **website vs website_url** - Two columns for same purpose
2. **social_media (JSONB) vs facebook_url, instagram_url, etc.** - Redundant storage
3. **service_area (TEXT) vs service_areas (JSONB)** - Unclear which to use

**Recommendation**: 
- Use `website_url` (more descriptive)
- Use `social_media` JSONB and deprecate individual URL columns
- Use `service_areas` JSONB for multiple areas, `service_area` for primary area

---

## Summary of Issues

### 🔴 Critical Issues (Breaking)
1. ❌ **`description` → should be `business_description`**
2. ❌ **`location` → should be `service_area`**
3. ❌ **`phone` → missing in vendor_profiles, needs JOIN with users**
4. ❌ **`email` → missing in vendor_profiles, needs JOIN with users**

### 🟡 Medium Issues (Non-Breaking)
5. ⚠️ **Social media**: Using JSONB field vs separate columns (redundant)
6. ⚠️ **Website**: Using `website` vs `website_url` (two columns exist)

### 🟢 Working Correctly
- ✅ `businessName` → `business_name`
- ✅ `businessType` → `business_type`
- ✅ `yearsInBusiness` → `years_in_business`
- ✅ `profileImage` → `profile_image`
- ✅ `portfolioImages` → `portfolio_images`
- ✅ Verification fields (businessVerified, documentsVerified, phoneVerified)

---

## Action Items

### Immediate (Fix Bugs)
1. [ ] Update VendorProfile.tsx field mapping (description, location)
2. [ ] Verify backend API returns correct field names (camelCase)
3. [ ] Ensure backend JOINs users table for phone/email
4. [ ] Test profile load and save operations

### Short-term (Improve)
5. [ ] Standardize social media storage (use JSONB, deprecate individual columns)
6. [ ] Clarify website field (use website_url consistently)
7. [ ] Document service_area vs service_areas usage

### Long-term (Cleanup)
8. [ ] Remove redundant columns from database
9. [ ] Add database migration for schema cleanup
10. [ ] Update all frontend components to use consistent field names
