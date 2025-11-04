# 🎯 FREELANCER VERIFICATION - VISUAL GUIDE

## 📸 UI SCREENSHOTS (Expected Behavior)

### 1. VENDOR TYPE SELECTOR (Profile Edit Mode)
```
┌─────────────────────────────────────────────┐
│ 📝 Edit Profile                             │
├─────────────────────────────────────────────┤
│                                             │
│ Business Name: [My Photography Studio____] │
│                                             │
│ Business Type: [Photography ▼]             │
│                                             │
│ Account Type:  [▼ Account Type Dropdown]   │
│                                             │
│   Options:                                  │
│   🏢 Business (Company/Agency)             │
│   👤 Freelancer (Individual)               │
│                                             │
│ Help Text: "Freelancers need: Valid ID +   │
│             Portfolio + Certification"      │
└─────────────────────────────────────────────┘
```

### 2. REQUIREMENTS BANNER (Business)
```
┌─────────────────────────────────────────────┐
│ ℹ️ Required Documents for Businesses       │
├─────────────────────────────────────────────┤
│ ✓ Business License/Permit                  │
│   (DTI, SEC, or Mayor's Permit)            │
│                                             │
│ Optional: Insurance Certificate,           │
│           Tax Certificate                   │
│                                             │
│ 💡 All required documents must be          │
│    approved before you can add services    │
└─────────────────────────────────────────────┘
```

### 3. REQUIREMENTS BANNER (Freelancer)
```
┌─────────────────────────────────────────────┐
│ ℹ️ Required Documents for Freelancers      │
├─────────────────────────────────────────────┤
│ ✓ Valid ID (Government-issued)            │
│   Driver's License, Passport, National ID  │
│                                             │
│ ✓ Portfolio Samples                        │
│   Previous work, photos, videos, projects  │
│                                             │
│ ✓ Professional Certification               │
│   Relevant certificates, training, awards  │
│                                             │
│ 💡 All 3 documents must be approved        │
│    before you can add services             │
└─────────────────────────────────────────────┘
```

### 4. DOCUMENT TYPE DROPDOWN (Business)
```
┌─────────────────────────────────────────┐
│ Document Type: [▼]                     │
└─────────────────────────────────────────┘
  ├─ Business License (required)
  ├─ Insurance Certificate
  ├─ Tax Certificate
  ├─ Professional Certification
  ├─ Portfolio Samples
  ├─ Contract Template
  └─ Other Document
```

### 5. DOCUMENT TYPE DROPDOWN (Freelancer)
```
┌─────────────────────────────────────────┐
│ Document Type: [▼]                     │
└─────────────────────────────────────────┘
  ├─ Valid ID (required) ⭐
  ├─ Portfolio Samples (required)
  ├─ Professional Certification (required)
  ├─ Insurance Certificate
  ├─ Contract Template
  └─ Other Document
```

---

## 🚫 ERROR MESSAGES

### Business Missing License:
```
┌──────────────────────────────────────────┐
│ ❌ Cannot Create Service                │
├──────────────────────────────────────────┤
│ Documents not verified                   │
│                                          │
│ Businesses must have an approved         │
│ Business License/Permit                  │
│                                          │
│ Missing:                                 │
│ • Business License/Permit                │
│                                          │
│ Approved: (none)                         │
│                                          │
│ [Upload Documents]                       │
└──────────────────────────────────────────┘
```

### Freelancer Missing Documents:
```
┌──────────────────────────────────────────┐
│ ❌ Cannot Create Service                │
├──────────────────────────────────────────┤
│ Documents not verified                   │
│                                          │
│ Freelancers must have approved:          │
│ • Valid ID                               │
│ • Portfolio Samples                      │
│ • Professional Certification             │
│                                          │
│ Missing:                                 │
│ • Valid ID (government-issued)           │
│ • Professional Certification             │
│                                          │
│ Approved:                                │
│ ✓ Portfolio Samples                      │
│                                          │
│ [Upload Documents]                       │
└──────────────────────────────────────────┘
```

---

## 🎨 COLOR SCHEME

### Status Colors:
- **Approved**: Green (#10B981)
- **Pending**: Yellow (#F59E0B)
- **Rejected**: Red (#EF4444)
- **Info**: Blue (#3B82F6)

### UI Elements:
- **Business Icon**: 🏢 (Gray-700)
- **Freelancer Icon**: 👤 (Pink-600)
- **Required Badge**: Red dot or asterisk (*)
- **Optional Badge**: Gray text (optional)

---

## 📱 MOBILE VIEW

### Profile Edit (Compact):
```
┌────────────────────────┐
│ 📝 Edit Profile        │
├────────────────────────┤
│ Business Name          │
│ [________________]     │
│                        │
│ Business Type          │
│ [Photography ▼]        │
│                        │
│ Account Type           │
│ [Business ▼]           │
│                        │
│ 💡 Business need:      │
│ Business License       │
│                        │
│ [Save] [Cancel]        │
└────────────────────────┘
```

---

## 🔄 STATE TRANSITIONS

### Business Vendor Journey:
```
1. Register
   ↓
2. vendorType = 'business' (default)
   ↓
3. Upload Business License
   ↓ (status: pending)
4. Admin Reviews
   ↓ (status: approved)
5. ✅ Can Create Services
```

### Freelancer Vendor Journey:
```
1. Register
   ↓
2. Select vendorType = 'freelancer'
   ↓
3. Upload Valid ID
   ↓ (status: pending)
4. Upload Portfolio
   ↓ (status: pending)
5. Upload Certification
   ↓ (status: pending)
6. Admin Reviews All 3
   ↓ (all status: approved)
7. ✅ Can Create Services
```

---

## 🎭 USER PERSONAS

### Maria - Freelance Photographer
- **Type**: Freelancer
- **Documents**: Driver's License, Wedding Portfolio (20 photos), Photography Certificate
- **Journey**: Uploads all 3 docs → waits 24hrs → approved → creates service

### EventCo Inc - Catering Company
- **Type**: Business
- **Documents**: DTI Business Registration
- **Journey**: Uploads DTI cert → waits 24hrs → approved → creates service

---

## 🧪 TEST SCENARIOS

### Scenario 1: New Freelancer (Happy Path)
1. ✅ Register as vendor
2. ✅ Select "Freelancer" type
3. ✅ Upload Valid ID → pending
4. ✅ Upload Portfolio → pending
5. ✅ Upload Certificate → pending
6. ✅ Admin approves all
7. ✅ Create service → SUCCESS

### Scenario 2: Freelancer Missing 1 Document
1. ✅ Register as vendor
2. ✅ Select "Freelancer" type
3. ✅ Upload Valid ID → approved
4. ✅ Upload Portfolio → approved
5. ❌ Skip Certificate
6. ❌ Try to create service → BLOCKED
7. ✅ Error: "Missing Professional Certification"

### Scenario 3: Business (Happy Path)
1. ✅ Register as vendor (default business)
2. ✅ Upload Business License → pending
3. ✅ Admin approves
4. ✅ Create service → SUCCESS

### Scenario 4: Switch from Business to Freelancer
1. ✅ Start as business vendor
2. ✅ Have approved Business License
3. ✅ Switch to "Freelancer" type
4. ❌ Try to create service → BLOCKED
5. ✅ Error: "Need Valid ID + Portfolio + Certification"
6. ✅ Upload all 3 documents
7. ✅ Admin approves
8. ✅ Create service → SUCCESS

---

## 📊 DATABASE VERIFICATION QUERIES

### Check Vendor Type:
```sql
SELECT 
  u.email,
  vp.business_name,
  vp.vendor_type,
  v.vendor_type as vendors_table_type
FROM vendor_profiles vp
JOIN users u ON u.id = vp.user_id
LEFT JOIN vendors v ON v.user_id = u.id
WHERE u.id = '2-2025-XXX';
```

### Check Document Status:
```sql
SELECT 
  d.document_type,
  d.verification_status,
  d.created_at,
  d.updated_at
FROM documents d
WHERE d.vendor_id = 'VENDOR_ID'
ORDER BY d.created_at DESC;
```

### Approve Document (Testing):
```sql
UPDATE documents 
SET 
  verification_status = 'approved',
  verified_at = NOW(),
  verified_by = 'admin-test',
  updated_at = NOW()
WHERE id = 'DOCUMENT_ID';
```

### Check Service Creation Eligibility:
```sql
-- For Freelancers (need all 3)
SELECT 
  COUNT(*) as approved_count,
  ARRAY_AGG(document_type) as approved_docs
FROM documents
WHERE vendor_id = 'VENDOR_ID'
  AND verification_status = 'approved'
  AND document_type IN ('valid_id', 'portfolio_samples', 'professional_certification');
-- Should return count = 3

-- For Businesses (need 1)
SELECT 
  COUNT(*) as approved_count
FROM documents
WHERE vendor_id = 'VENDOR_ID'
  AND verification_status = 'approved'
  AND document_type = 'business_license';
-- Should return count >= 1
```

---

## 🎉 SUCCESS INDICATORS

### Frontend:
- ✅ Vendor type selector appears in edit mode
- ✅ Requirements banner shows correct info
- ✅ Document dropdown filtered by vendor type
- ✅ Service creation button disabled if docs missing
- ✅ Error messages show missing documents

### Backend:
- ✅ vendor_type saves in database
- ✅ Service creation endpoint checks vendor_type
- ✅ Correct error messages returned
- ✅ Document verification enforced

### End-to-End:
- ✅ Business can create service with license
- ✅ Freelancer blocked until all 3 docs approved
- ✅ Switching vendor type updates requirements
- ✅ Error messages helpful and accurate

---

**Created**: November 2, 2025
**Status**: ✅ COMPLETE - Visual Guide for Implementation
