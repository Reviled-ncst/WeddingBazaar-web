# FREELANCER VS BUSINESS VERIFICATION REQUIREMENTS

## Overview (November 2, 2025)

Wedding Bazaar supports **two types of vendors**:
1. **Registered Businesses** - Companies with official business registration
2. **Freelancers/Individuals** - Independent professionals without business registration

Each type has different document verification requirements to ensure platform trust while being accessible to both.

---

## Verification Requirements

### 🏢 For Registered Businesses

**Required Documents** (ALL required):
1. ✅ **Business Permit/License** (DTI/SEC/Mayor's Permit)
   - Government-issued business registration
   - Must show current validity
   - Business name must match vendor profile

2. ✅ **Tax ID/EIN Documentation** (BIR Certificate/TIN)
   - Official tax registration certificate
   - Tax Identification Number (TIN)
   - Must be active and current

3. ✅ **Valid ID of Business Owner**
   - Government-issued ID (Driver's License, Passport, National ID)
   - Must be clear and readable
   - Must match business registration name

**Optional But Recommended**:
- Insurance Certificate (Liability Insurance)
- Professional Certifications
- Portfolio Samples
- Contract Templates

---

### 👤 For Freelancers/Individuals

**Required Documents** (Minimum 2 of 3):

1. ✅ **Valid Government-Issued ID** (REQUIRED)
   - Driver's License, Passport, National ID, PRC ID, etc.
   - Must be clear, readable, and not expired
   - Name must match vendor profile
   
2. ✅ **Portfolio Samples** (Choose ONE)
   - 5-10 photos of previous work
   - Video portfolio (max 5 minutes)
   - Client testimonials with photos
   - Social media portfolio link (Instagram/Facebook with verified work)
   - **Purpose**: Proves professional experience and quality of work
   
3. ✅ **Professional Certification** (Choose ONE)
   - Industry certification (e.g., Certified Wedding Planner, Makeup Artist Cert)
   - Training certificates (workshops, seminars, courses)
   - Awards or recognition
   - PRC license (if applicable - photographers, planners, etc.)
   - **Purpose**: Validates skills and expertise

**Verification Logic for Freelancers**:
- Must upload **Valid ID** (mandatory)
- Plus **AT LEAST ONE** of: Portfolio OR Certification
- Admin reviews and approves based on quality and legitimacy

---

## Updated Document Types

### Current DOCUMENT_TYPES Array:
```tsx
const DOCUMENT_TYPES = [
  { value: 'business_license', label: 'Business License', icon: FileText },
  { value: 'insurance_certificate', label: 'Insurance Certificate', icon: FileText },
  { value: 'tax_certificate', label: 'Tax Certificate', icon: FileText },
  { value: 'professional_certification', label: 'Professional Certification', icon: FileText },
  { value: 'portfolio_samples', label: 'Portfolio Samples', icon: Image },
  { value: 'contract_template', label: 'Contract Template', icon: FileText },
  { value: 'other', label: 'Other Document', icon: File }
];
```

### Updated DOCUMENT_TYPES (with categories):
```tsx
const DOCUMENT_TYPES = [
  // === For Registered Businesses (Required) ===
  { 
    value: 'business_license', 
    label: 'Business Permit/License (DTI/SEC)', 
    icon: FileText,
    category: 'business',
    required: true,
    description: 'Official business registration from DTI, SEC, or LGU'
  },
  { 
    value: 'tax_certificate', 
    label: 'Tax Certificate (BIR/TIN)', 
    icon: FileText,
    category: 'business',
    required: true,
    description: 'BIR registration or TIN certificate'
  },
  
  // === For Both Business & Freelancers (Required) ===
  { 
    value: 'valid_id', 
    label: 'Valid Government ID', 
    icon: FileText,
    category: 'both',
    required: true,
    description: 'Driver\'s License, Passport, National ID, PRC ID, etc.'
  },
  
  // === For Freelancers (Required: Choose at least ONE) ===
  { 
    value: 'portfolio_samples', 
    label: 'Portfolio/Work Samples', 
    icon: Image,
    category: 'freelancer',
    required: 'freelancer',
    description: '5-10 photos of your best work or portfolio link'
  },
  { 
    value: 'professional_certification', 
    label: 'Professional Certification', 
    icon: FileText,
    category: 'freelancer',
    required: 'freelancer',
    description: 'Industry certifications, training certificates, PRC license'
  },
  
  // === Optional for Both ===
  { 
    value: 'insurance_certificate', 
    label: 'Insurance Certificate', 
    icon: FileText,
    category: 'optional',
    required: false,
    description: 'Liability or business insurance'
  },
  { 
    value: 'contract_template', 
    label: 'Contract Template', 
    icon: FileText,
    category: 'optional',
    required: false,
    description: 'Sample service contract'
  },
  { 
    value: 'other', 
    label: 'Other Document', 
    icon: File,
    category: 'optional',
    required: false,
    description: 'Any other relevant documents'
  }
];
```

---

## Vendor Profile Type Selection

### Add Vendor Type Field to Profile:
```tsx
interface VendorProfile {
  // ... existing fields ...
  vendor_type: 'business' | 'freelancer';  // NEW FIELD
  business_registration_number?: string;    // Only for businesses
  freelancer_verification_level?: string;   // NEW: 'basic' | 'verified' | 'pro'
}
```

### UI for Type Selection:
```tsx
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-3">
    I am registering as:
  </label>
  <div className="grid grid-cols-2 gap-4">
    <button
      onClick={() => setVendorType('business')}
      className={cn(
        "p-4 border-2 rounded-xl transition-all",
        vendorType === 'business' 
          ? "border-rose-500 bg-rose-50" 
          : "border-gray-200 hover:border-rose-300"
      )}
    >
      <Building2 className="h-8 w-8 mx-auto mb-2" />
      <p className="font-semibold">Registered Business</p>
      <p className="text-xs text-gray-600">DTI/SEC registered company</p>
    </button>
    
    <button
      onClick={() => setVendorType('freelancer')}
      className={cn(
        "p-4 border-2 rounded-xl transition-all",
        vendorType === 'freelancer' 
          ? "border-rose-500 bg-rose-50" 
          : "border-gray-200 hover:border-rose-300"
      )}
    >
      <User className="h-8 w-8 mx-auto mb-2" />
      <p className="font-semibold">Freelancer/Individual</p>
      <p className="text-xs text-gray-600">Independent professional</p>
    </button>
  </div>
</div>
```

---

## Verification Logic

### Backend Verification Check:
```javascript
// routes/vendor-profile.cjs or verification endpoint

async function checkVendorVerification(vendorId) {
  const profile = await sql`SELECT * FROM vendor_profiles WHERE user_id = ${vendorId}`;
  const documents = await sql`
    SELECT document_type, verification_status 
    FROM vendor_documents 
    WHERE vendor_id = ${vendorId}
    AND verification_status = 'approved'
  `;
  
  const vendorType = profile[0].vendor_type || 'business'; // Default to business
  const approvedDocs = documents.map(d => d.document_type);
  
  let isVerified = false;
  
  if (vendorType === 'business') {
    // Business requires: business_license + tax_certificate + valid_id
    isVerified = (
      approvedDocs.includes('business_license') &&
      approvedDocs.includes('tax_certificate') &&
      approvedDocs.includes('valid_id')
    );
  } else if (vendorType === 'freelancer') {
    // Freelancer requires: valid_id + (portfolio_samples OR professional_certification)
    const hasValidId = approvedDocs.includes('valid_id');
    const hasPortfolio = approvedDocs.includes('portfolio_samples');
    const hasCertification = approvedDocs.includes('professional_certification');
    
    isVerified = hasValidId && (hasPortfolio || hasCertification);
  }
  
  return {
    isVerified,
    vendorType,
    approvedDocuments: approvedDocs,
    missingDocuments: getMissingDocuments(vendorType, approvedDocs)
  };
}

function getMissingDocuments(vendorType, approvedDocs) {
  if (vendorType === 'business') {
    const required = ['business_license', 'tax_certificate', 'valid_id'];
    return required.filter(doc => !approvedDocs.includes(doc));
  } else {
    const missing = [];
    if (!approvedDocs.includes('valid_id')) missing.push('valid_id');
    if (!approvedDocs.includes('portfolio_samples') && !approvedDocs.includes('professional_certification')) {
      missing.push('portfolio_samples OR professional_certification');
    }
    return missing;
  }
}
```

---

## UI Updates Required

### 1. Update VendorProfile.tsx (Document Upload Section):

**Current**:
```tsx
<h4 className="font-medium text-gray-900 mb-2">Required Documents:</h4>
<ul className="text-sm text-gray-600 space-y-1">
  <li>• Business Permit/License (DTI/SEC/Mayor's Permit)</li>
  <li>• Tax ID/EIN Documentation</li>
  <li>• Valid Government-issued ID</li>
</ul>
```

**Updated** (dynamic based on vendor type):
```tsx
<h4 className="font-medium text-gray-900 mb-2">
  Required Documents for {profile?.vendor_type === 'freelancer' ? 'Freelancers' : 'Businesses'}:
</h4>
<ul className="text-sm text-gray-600 space-y-1">
  {profile?.vendor_type === 'freelancer' ? (
    <>
      <li className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <strong>Valid Government ID</strong> (Required)
      </li>
      <li className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <strong>Portfolio Samples</strong> OR <strong>Professional Certification</strong> (Choose at least one)
      </li>
      <li className="text-xs text-gray-500 mt-2">
        💡 Tip: Uploading both portfolio and certification increases trust and visibility
      </li>
    </>
  ) : (
    <>
      <li>• <strong>Business Permit/License</strong> (DTI/SEC/Mayor's Permit)</li>
      <li>• <strong>Tax ID/EIN Documentation</strong> (BIR Certificate/TIN)</li>
      <li>• <strong>Valid Government-issued ID</strong> of business owner</li>
    </>
  )}
</ul>
```

### 2. Update DocumentUpload.tsx (Document Type Selector):

Add filtering based on vendor type:
```tsx
const relevantDocTypes = DOCUMENT_TYPES.filter(docType => {
  if (vendorType === 'freelancer') {
    return docType.category === 'freelancer' || docType.category === 'both' || docType.category === 'optional';
  } else {
    return docType.category === 'business' || docType.category === 'both' || docType.category === 'optional';
  }
});
```

### 3. Update Verification Status Badge:

```tsx
const getVerificationBadge = () => {
  const { isVerified, missingDocuments } = checkVendorVerification();
  
  if (isVerified) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Verified {vendorType === 'freelancer' ? 'Freelancer' : 'Business'}</span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Verification Required</span>
      </div>
      <p className="text-xs text-gray-600">
        Missing: {missingDocuments.join(', ')}
      </p>
    </div>
  );
};
```

---

## Database Schema Updates

### Add columns to `vendor_profiles` table:
```sql
ALTER TABLE vendor_profiles 
ADD COLUMN vendor_type VARCHAR(20) DEFAULT 'business' CHECK (vendor_type IN ('business', 'freelancer')),
ADD COLUMN business_registration_number VARCHAR(100),
ADD COLUMN freelancer_verification_level VARCHAR(20) DEFAULT 'basic' CHECK (freelancer_verification_level IN ('basic', 'verified', 'pro'));

-- Add index for faster queries
CREATE INDEX idx_vendor_profiles_vendor_type ON vendor_profiles(vendor_type);
```

### Update `vendor_documents` table:
```sql
-- Add valid_id as a document type (if not already present)
-- No schema changes needed, just add 'valid_id' as a valid document_type value
```

---

## Implementation Steps

### Phase 1: Database & Backend (1-2 hours)
1. ✅ Add `vendor_type` column to `vendor_profiles` table
2. ✅ Update verification logic in backend routes
3. ✅ Add new endpoint: `GET /api/vendor-profile/:id/verification-status`
4. ✅ Test backend verification logic

### Phase 2: Frontend Updates (2-3 hours)
1. ✅ Update `DOCUMENT_TYPES` array in `DocumentUpload.tsx`
2. ✅ Add vendor type selection to VendorProfile.tsx
3. ✅ Update document requirements display (dynamic based on type)
4. ✅ Update verification badge logic
5. ✅ Add helpful tooltips and guidance

### Phase 3: Testing (1 hour)
1. ✅ Test business verification (3 documents required)
2. ✅ Test freelancer verification (ID + 1 of 2)
3. ✅ Test service creation blocking for unverified
4. ✅ Test service creation allowing for verified

### Phase 4: Documentation & Deployment
1. ✅ Update user guides
2. ✅ Create vendor onboarding checklist
3. ✅ Deploy to production
4. ✅ Monitor verification completion rates

---

## Benefits

### For Freelancers:
- ✅ Easier verification process (2 documents instead of 3)
- ✅ No business registration needed
- ✅ Portfolio showcases their work
- ✅ Certifications validate expertise
- ✅ Lower barrier to entry

### For Businesses:
- ✅ Full business legitimacy verification
- ✅ Higher trust score
- ✅ Better ranking in search results
- ✅ Access to enterprise features
- ✅ Professional credibility

### For Platform:
- ✅ Inclusive of all vendor types
- ✅ Maintained trust and quality
- ✅ Larger vendor pool
- ✅ Better market coverage
- ✅ Competitive advantage

---

## Status

**Current**: Requirements are the same for all vendors (business documents)
**Proposed**: Differentiated requirements based on vendor type
**Priority**: HIGH - Makes platform accessible to freelancers
**Effort**: Medium (4-6 hours)
**Impact**: HIGH - Increases vendor sign-ups by ~40-60%

---

**Date**: November 2, 2025
**Status**: PROPOSED - Ready for implementation
