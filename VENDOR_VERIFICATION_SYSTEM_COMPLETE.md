# 🔍 Vendor Verification System - Complete Overview

## Date: October 30, 2025
## Location: `src/pages/users/vendor/profile/VendorProfile.tsx`

---

## 📋 Verification Helper Functions

### 1. **isDocumentVerified()** - Line 83
Checks if vendor's documents are verified

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

**Purpose**: Determines if vendor has uploaded and approved verification documents

**Checks**:
- ✅ Database field: `profile.documents_verified === true`
- ✅ Approved documents array: Any document with `status === 'approved'`

**Returns**: `boolean` - true if verified, false otherwise

---

### 2. **getBusinessVerificationStatus()** - Line 96
Gets overall verification status with visual indicators

```typescript
const getBusinessVerificationStatus = () => {
  // Check both database field and actual uploaded documents
  const documentsVerified = isDocumentVerified();
  const businessVerified = profile?.business_verified === true;
  
  // Count approved documents
  const approvedDocsCount = profile?.documents?.filter((doc: any) => 
    doc.status === 'approved'
  ).length || 0;
  
  console.log('🔍 Business Verification Check:', {
    documentsVerified,
    businessVerified,
    approvedDocsCount,
    totalDocs: profile?.documents?.length || 0,
    verification_status: profile?.verification_status
  });
  
  // Return verification status object
  if (businessVerified || documentsVerified) {
    return { 
      status: 'verified', 
      color: 'text-green-600', 
      icon: CheckCircle, 
      label: 'Verified' 
    };
  } else if (profile?.verification_status === 'pending' || approvedDocsCount > 0) {
    return { 
      status: 'pending', 
      color: 'text-amber-600', 
      icon: Clock, 
      label: 'Under Review' 
    };
  } else {
    return { 
      status: 'not_verified', 
      color: 'text-amber-600', 
      icon: XCircle, 
      label: 'Not Verified' 
    };
  }
};
```

**Purpose**: Returns comprehensive verification status with UI components

**Checks**:
1. **Documents verified** - via `isDocumentVerified()`
2. **Business verified** - `profile.business_verified === true`
3. **Approved docs count** - Number of approved documents
4. **Verification status** - `profile.verification_status === 'pending'`

**Returns**: Object with:
- `status`: 'verified' | 'pending' | 'not_verified'
- `color`: Tailwind text color class
- `icon`: Lucide icon component
- `label`: Display text

---

## 🎨 Verification Status States

### ✅ Verified Status
**Condition**: 
- `business_verified === true` OR
- `documents_verified === true` OR
- Has approved documents

**Display**:
- Color: Green (`text-green-600`)
- Icon: CheckCircle ✓
- Label: "Verified"

---

### 🟡 Pending Status
**Condition**:
- `verification_status === 'pending'` OR
- Has at least 1 approved document (but not fully verified)

**Display**:
- Color: Amber (`text-amber-600`)
- Icon: Clock ⏱
- Label: "Under Review"

---

### ❌ Not Verified Status
**Condition**:
- None of the above conditions met
- No verified documents
- Business not verified

**Display**:
- Color: Amber (`text-amber-600`)
- Icon: XCircle ✕
- Label: "Not Verified"

---

## 📊 Database Fields Used

### vendors table
```sql
-- Verification-related columns
business_verified BOOLEAN DEFAULT FALSE
documents_verified BOOLEAN DEFAULT FALSE
verification_status VARCHAR(20) -- 'pending', 'verified', 'rejected'
```

### documents table (or profile.documents array)
```typescript
interface Document {
  id: string;
  vendor_id: string;
  document_type: string; // 'business_permit', 'dti', 'bir', 'valid_id'
  document_url: string;
  status: string; // 'pending', 'approved', 'rejected'
  uploaded_at: Date;
  verified_at?: Date;
  verified_by?: string; // admin user id
  rejection_reason?: string;
}
```

---

## 🔧 Usage in VendorProfile Component

### Line 52 - Get Vendor ID
```typescript
const { user } = useAuth();
const vendorId = user?.vendorId || user?.id || 'vendor-user-1';
```

### Line 73 - Fetch Profile Data
```typescript
const { 
  profile, 
  loading, 
  error, 
  updateProfile,
  refetch 
} = useVendorProfile(vendorId);
```

### Usage in UI
```typescript
// Get verification status
const verificationStatus = getBusinessVerificationStatus();

// Display in UI
<div className={verificationStatus.color}>
  <verificationStatus.icon className="w-5 h-5" />
  <span>{verificationStatus.label}</span>
</div>
```

---

## 📝 Verification Tabs

### Email Verification (Tab: 'verification')
```typescript
const [firebaseEmailVerified, setFirebaseEmailVerified] = useState(false);

// Check Firebase email verification
React.useEffect(() => {
  const checkFirebaseEmailStatus = async () => {
    const { firebaseAuthService } = await import('../../../../services/auth/firebaseAuthService');
    const currentUser = firebaseAuthService.getCurrentUser();
    setFirebaseEmailVerified(currentUser?.emailVerified || false);
  };
  
  checkFirebaseEmailStatus();
  const interval = setInterval(checkFirebaseEmailStatus, 5000);
  return () => clearInterval(interval);
}, [user]);
```

**Features**:
- Auto-refresh every 5 seconds
- Uses Firebase Auth for email verification
- Sends verification email via `resendEmailVerification()`

---

### Phone Verification (Tab: 'verification')
```typescript
const [showPhoneVerification, setShowPhoneVerification] = useState(false);

const handlePhoneVerification = async () => {
  setShowPhoneVerification(true);
};

const handlePhoneVerificationComplete = async (verifiedPhoneNumber: string) => {
  // Update profile with verified phone
  await updateProfile({ phone: verifiedPhoneNumber });
  
  // Update backend
  await fetch(`${apiUrl}/api/vendor-profile/${vendorId}/phone-verified`, {
    method: 'POST',
    body: JSON.stringify({ phone: verifiedPhoneNumber, verified: true })
  });
  
  await refetch();
  setShowPhoneVerification(false);
};
```

**Features**:
- Firebase SMS verification
- Updates backend with verified status
- `PhoneVerification` component handles OTP flow

---

### Document Verification (Tab: 'verification')
```typescript
<DocumentUploadComponent
  vendorId={vendorId}
  onUploadComplete={refetch}
  allowedDocTypes={['business_permit', 'dti', 'bir', 'valid_id']}
/>
```

**Features**:
- Upload business documents
- Admin approval workflow
- Status: pending → approved/rejected

---

## 🎯 Verification Summary Section

**Location**: Verification tab > "Verification Summary" section

```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Email Verification */}
  <div className="verification-card">
    <Mail className="w-6 h-6" />
    <h4>Email Verification</h4>
    {firebaseEmailVerified ? (
      <CheckCircle className="text-green-600" />
    ) : (
      <XCircle className="text-red-600" />
    )}
  </div>

  {/* Phone Verification */}
  <div className="verification-card">
    <Phone className="w-6 h-6" />
    <h4>Phone Verification</h4>
    {profile?.phone_verified ? (
      <CheckCircle className="text-green-600" />
    ) : (
      <XCircle className="text-red-600" />
    )}
  </div>

  {/* Document Verification */}
  <div className="verification-card">
    <FileText className="w-6 h-6" />
    <h4>Document Verification</h4>
    <verificationStatus.icon className={verificationStatus.color} />
  </div>
</div>
```

---

## 🚀 API Endpoints

### Get Vendor Profile
```
GET /api/vendor-profile/:vendorId
Returns: { profile: VendorProfile }
```

### Update Phone Verification
```
POST /api/vendor-profile/:vendorId/phone-verified
Body: { phone: string, verified: boolean }
```

### Upload Document
```
POST /api/vendor/documents/upload
Body: FormData with document file
```

### Admin Approve Document
```
POST /api/admin/vendor/:vendorId/verify-document
Body: { documentId: string, status: 'approved' | 'rejected', reason?: string }
```

---

## 🔗 Related Components

### PhoneVerification
**File**: `src/components/PhoneVerification.tsx`
- Firebase phone auth
- OTP verification
- SMS sending

### DocumentUpload
**File**: `src/components/DocumentUpload.tsx`
- File upload to Cloudinary
- Document type selection
- Status tracking

### useVendorProfile Hook
**File**: `src/hooks/useVendorData.ts`
- Fetches vendor profile
- Handles updates
- Manages loading/error states

---

## ✅ Testing Checklist

### Email Verification
- [ ] Send verification email
- [ ] Click verification link
- [ ] Badge updates automatically (within 5 seconds)
- [ ] Green checkmark displays

### Phone Verification
- [ ] Click "Verify Phone Number"
- [ ] Enter phone number
- [ ] Receive OTP via SMS
- [ ] Enter OTP code
- [ ] Phone verified successfully

### Document Verification
- [ ] Upload business permit
- [ ] Upload DTI registration
- [ ] Upload BIR certificate
- [ ] Upload valid ID
- [ ] Admin approves documents
- [ ] Status changes to "Verified"

---

## 📁 File Locations

### Frontend
- Main component: `src/pages/users/vendor/profile/VendorProfile.tsx`
- Hook: `src/hooks/useVendorData.ts`
- Phone component: `src/components/PhoneVerification.tsx`
- Document component: `src/components/DocumentUpload.tsx`
- Utils: `src/utils/vendorIdMapping.ts`

### Backend
- Profile route: `backend-deploy/routes/vendor-profile.cjs`
- Document route: `backend-deploy/routes/vendor-documents.cjs`
- Admin route: `backend-deploy/routes/admin.cjs`

---

## 🎓 Key Insights

### 1. **Dual Verification Check**
   - Checks both database field AND document array
   - More robust than single source of truth
   - Handles edge cases (approved docs but field not updated)

### 2. **Firebase Integration**
   - Email verification via Firebase Auth
   - Phone verification via Firebase Phone Auth
   - Automatic status polling (every 5 seconds)

### 3. **Admin Approval Workflow**
   - Vendors upload documents
   - Admin reviews in admin panel
   - Admin approves/rejects with reason
   - Status updates reflect immediately

### 4. **Real-time Updates**
   - Auto-refresh verification status
   - Refetch profile after verification
   - UI updates without page reload

---

## 🐛 Common Issues

### Issue 1: Verification badge not updating
**Solution**: Wait 5 seconds for auto-refresh or manually refresh page

### Issue 2: Document upload fails
**Solution**: Check Cloudinary credentials, file size limit (10MB)

### Issue 3: Phone verification not sending SMS
**Solution**: Verify Firebase Phone Auth is enabled, check quota

---

**Created By**: GitHub Copilot  
**Date**: October 30, 2025  
**Status**: ✅ Complete Documentation
