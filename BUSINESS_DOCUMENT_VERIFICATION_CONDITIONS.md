# 📋 Business Document Verification Conditions

## Overview
This document explains the complete logic for when a vendor is considered "Business Document Verified" in the Wedding Bazaar platform.

## 🎯 Verification Logic Summary

A vendor's business documents are considered **VERIFIED** when **EITHER** of the following conditions is true:

### Condition 1: Backend Database Flag
```sql
vendor_profiles.documents_verified = true
```
- This flag is automatically set by the admin document approval system
- Updated in `backend-deploy/routes/admin/documents.cjs`
- Set to `true` when at least one document has `verification_status = 'approved'`

### Condition 2: Approved Documents in Array
```typescript
profile.documents.some(doc => doc.status === 'approved')
```
- Checks the frontend `documents` array for any approved documents
- Provides real-time verification status
- Fallback for cases where the database flag might not be synced

## 🔍 Code Implementation

### Frontend Check (VendorProfile.tsx)
```typescript
const isDocumentVerified = (): boolean => {
  // Check documents_verified field from database (snake_case)
  const hasVerifiedField = profile?.documents_verified === true;
  
  // Also check if there are any approved documents in the documents array
  const hasApprovedDocuments = profile?.documents && 
    Array.isArray(profile.documents) && 
    profile.documents.some((doc: any) => doc.status === 'approved');
  
  return hasVerifiedField || hasApprovedDocuments || false;
};
```

### Backend Update Logic (admin/documents.cjs)
```javascript
// Count approved documents
const approvedDocsCheck = await sql`
  SELECT COUNT(*) as approved_count
  FROM vendor_documents
  WHERE vendor_id = ${vendorId} 
  AND verification_status = 'approved'
`;

const hasApprovedDocs = parseInt(approvedDocsCheck[0].approved_count) > 0;

// Update vendor profile
await sql`
  UPDATE vendor_profiles
  SET 
    documents_verified = ${hasApprovedDocs},
    updated_at = ${new Date().toISOString()}
  WHERE id = ${vendorId}
`;
```

## 📊 Badge Display Logic

### Verified Badge (Green ✓)
Displayed when:
- `business_verified === true` **OR**
- `documents_verified === true` **OR**
- At least one document in `profile.documents` has `status: 'approved'`

### Under Review Badge (Amber ⏱)
Displayed when:
- `verification_status === 'pending'` **OR**
- Has documents uploaded but none approved yet

### Not Verified Badge (Amber ✗)
Displayed when:
- None of the above conditions are met
- No documents uploaded or all documents rejected

## 🔄 Synchronization Flow

### When Admin Approves a Document:

1. **Admin Action** (Admin Dashboard)
   ```javascript
   POST /api/admin/documents/:documentId/approve
   ```

2. **Database Updates** (Automatic)
   - `vendor_documents.verification_status` → `'approved'`
   - `vendor_profiles.documents_verified` → `true` (if count > 0)
   - `vendor_profiles.verification_status` → Updated based on business info

3. **Frontend Refresh** (Next Profile Load)
   - Vendor refreshes profile page
   - `GET /api/vendor/:userId/profile` returns updated data
   - Badge updates to "Verified" ✓

## 🎨 UI/UX Behavior

### VendorProfile.tsx
```typescript
const getBusinessVerificationStatus = () => {
  const documentsVerified = isDocumentVerified();
  const businessVerified = profile?.business_verified === true;
  
  if (businessVerified || documentsVerified) {
    return { 
      status: 'verified', 
      color: 'text-green-600', 
      icon: CheckCircle, 
      label: 'Verified' 
    };
  }
  // ... other statuses
};
```

### VendorServices.tsx
```typescript
// Service creation allowed if documents are verified
const canCreateService = isDocumentVerified();
```

## 🐛 Debug Information

### Console Logging
Both VendorProfile and VendorServices log verification status:
```javascript
console.log('🔍 Business Verification Check:', {
  documentsVerified,
  businessVerified,
  approvedDocsCount,
  totalDocs: profile?.documents?.length || 0,
  verification_status: profile?.verification_status
});
```

### Check Verification Status
1. Open browser DevTools (F12)
2. Navigate to vendor profile or services page
3. Look for `🔍 Business Verification Check:` in console
4. Verify the values match expectations

## 📝 Database Schema

### vendor_profiles Table
```sql
CREATE TABLE vendor_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  documents_verified BOOLEAN DEFAULT false,
  business_verified BOOLEAN DEFAULT false,
  verification_status VARCHAR(50) DEFAULT 'unverified',
  -- ... other columns
);
```

### vendor_documents Table
```sql
CREATE TABLE vendor_documents (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES vendor_profiles(id),
  document_type VARCHAR(100),
  file_url TEXT,
  verification_status VARCHAR(50) DEFAULT 'pending',
  -- 'pending', 'approved', 'rejected'
  -- ... other columns
);
```

## 🚀 Testing Scenarios

### Test 1: Fresh Vendor (No Documents)
- ✗ `documents_verified` = false
- ✗ No documents in array
- **Expected**: "Not Verified" badge

### Test 2: Document Uploaded (Pending)
- ✗ `documents_verified` = false
- ✗ Documents array has items with `status: 'pending'`
- **Expected**: "Under Review" badge

### Test 3: Document Approved
- ✓ `documents_verified` = true (backend sets this)
- ✓ Documents array has item with `status: 'approved'`
- **Expected**: "Verified" ✓ badge

### Test 4: Backend Flag Only
- ✓ `documents_verified` = true
- ✗ Documents array empty or no approved docs
- **Expected**: "Verified" ✓ badge (backend flag takes precedence)

### Test 5: Approved Document Only
- ✗ `documents_verified` = false (not synced yet)
- ✓ Documents array has item with `status: 'approved'`
- **Expected**: "Verified" ✓ badge (frontend check works)

## 🔧 Maintenance Notes

### Adding New Document Types
1. Update `vendor_documents` table to include new type
2. No changes needed to verification logic (works with any document type)

### Changing Verification Rules
1. Update `isDocumentVerified()` in VendorProfile.tsx
2. Update backend logic in `admin/documents.cjs`
3. Update this documentation

### Troubleshooting
If badge shows incorrect status:
1. Check browser console for debug logs
2. Verify `documents_verified` in database: `SELECT documents_verified FROM vendor_profiles WHERE user_id = ?`
3. Check `vendor_documents` for approved records: `SELECT * FROM vendor_documents WHERE vendor_id = ? AND verification_status = 'approved'`
4. Refresh profile page to fetch latest data

## 📚 Related Files

### Frontend
- `src/pages/users/vendor/profile/VendorProfile.tsx` - Main verification display logic
- `src/pages/users/vendor/services/VendorServices.tsx` - Service creation permissions
- `src/hooks/useVendorData.ts` - Profile data fetching
- `src/services/api/vendorApiService.ts` - API interface

### Backend
- `backend-deploy/routes/admin/documents.cjs` - Document approval and verification updates
- `backend-deploy/routes/vendor-profile.cjs` - Profile data retrieval

### Documentation
- `EMAIL_VERIFICATION_BADGE_AUTO_UPDATE_FIXED.md` - Email verification logic
- `VENDOR_SERVICES_EMAIL_VERIFICATION_SYNC_FIXED.md` - VendorServices sync fix
- `DOCUMENT_VERIFICATION_BADGE_MISMATCH_FIXED.md` - Document badge fix

## ✅ Summary

**Business Document Verified = `documents_verified === true` OR `documents.some(d => d.status === 'approved')`**

This dual-check approach ensures:
- ✓ Real-time verification status from frontend
- ✓ Persistent verification status from backend
- ✓ Fallback if one source is out of sync
- ✓ Accurate badge display in all scenarios
- ✓ Correct service creation permissions

---

**Last Updated**: December 2024  
**Status**: Production Ready ✓  
**Deployed**: Firebase Hosting (Frontend) + Render (Backend)
