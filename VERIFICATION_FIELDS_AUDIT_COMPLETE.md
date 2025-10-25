# 🔍 VERIFICATION FIELD MAPPING AUDIT

## Database Schema vs Frontend vs Backend

### 📊 **Database Tables and Columns**

#### 1. **`vendor_profiles` Table**
```sql
Column Name              | Type    | Default  | Description
-------------------------|---------|----------|----------------------------------
phone_verified           | BOOLEAN | false    | Phone number verified status
business_verified        | BOOLEAN | false    | Business info complete & verified
documents_verified       | BOOLEAN | false    | Business documents approved
verification_status      | VARCHAR | unverified | Overall verification status
```

**NOTE**: ❌ **`email_verified` does NOT exist in vendor_profiles table!**

#### 2. **`users` Table** (Referenced via `user_id`)
```sql
Column Name              | Type    | Default  | Description
-------------------------|---------|----------|----------------------------------
email_verified           | BOOLEAN | false    | Email verification status
phone_verified           | BOOLEAN | false    | Phone verification status (duplicate)
```

**Critical Finding**: `email_verified` is in the **users table**, not vendor_profiles!

---

### 🔧 **Backend API Mapping** (`vendor-profile.cjs`)

#### GET `/api/vendor-profile/:vendorId` Response (Lines 140-200)

**Backend joins users + vendor_profiles and maps:**

```javascript
// FROM DATABASE (vendor_profiles + users JOIN)
vendor.email_verified        → emailVerified (from users table)
vendor.phone_verified        → phoneVerified (from vendor_profiles table)
vendor.business_verified     → businessVerified (from vendor_profiles table)
vendor.documents_verified    → documentsVerified (from vendor_profiles table)

// Response format:
{
  emailVerified: vendor.email_verified || false,    // ✅ FROM users table
  phoneVerified: vendor.phone_verified || false,    // ✅ FROM vendor_profiles table
  businessVerified: vendor.business_verified || false,
  documentsVerified: vendor.documents_verified || docsResult.some(...),
  overallVerificationStatus: vendor.verification_status || 'pending'
}
```

#### POST `/api/vendor-profile/:vendorId/verify-email` (Line 299)
- **Frontend calls**: POST with vendorId
- **Backend action**: Sends verification email (demo mode - just returns token)
- **Database update**: ❌ **NOT implemented yet!**
- **Should update**: `users.email_verified = true` after clicking email link

#### POST `/api/vendor-profile/:vendorId/phone-verified` (Line 757)
```javascript
// Frontend sends: { phone: string, verified: boolean }
// Backend updates:
UPDATE vendor_profiles SET phone_verified = true;  // ✅ vendor_profiles table
UPDATE users SET phone_verified = true;            // ✅ users table (duplicate)
```

---

### 💻 **Frontend Mapping** (`VendorProfile.tsx`)

#### Frontend expects from API:
```typescript
profile.emailVerified    // ✅ CORRECT - Backend provides this from users table
profile.phoneVerified    // ✅ CORRECT - Backend provides this from vendor_profiles
profile.businessVerified // ✅ CORRECT - Backend provides this
profile.documentsVerified // ✅ CORRECT - Backend provides this
```

#### Frontend calls these endpoints:

**1. Email Verification (Line 102-122)**
```typescript
POST /api/vendor-profile/${vendorId}/verify-email
Headers: { Authorization: Bearer token }
Body: NONE
```
**Status**: ⚠️ **PARTIAL** - Sends email but doesn't update database

**2. Phone Verification (Line 124-165)**
```typescript
POST /api/vendor-profile/${vendorId}/phone-verified
Headers: { Authorization: Bearer token }
Body: { phone: string, verified: true }
```
**Status**: ✅ **COMPLETE** - Updates both vendor_profiles and users tables

**3. Document Verification**
- Handled by `DocumentUploadComponent`
- Uses endpoints in `backend-deploy/routes/admin/documents.cjs`
- Updates `vendor_profiles.documents_verified` when admin approves

---

### ⚠️ **CRITICAL ISSUES FOUND**

#### Issue 1: Email Verification Not Persisting
**Problem**: 
```
1. Frontend calls: POST /api/vendor-profile/:vendorId/verify-email
2. Backend sends email (demo mode)
3. ❌ NO DATABASE UPDATE - email_verified stays false!
```

**Expected Flow**:
```
1. User clicks "Send Verification Email"
2. Backend generates token, sends email
3. User clicks link in email
4. Backend verifies token, updates users.email_verified = true
5. Frontend refreshes, shows verified status
```

**Current Flow**:
```
1. User clicks "Send Verification Email"
2. Backend returns success message
3. ❌ Nothing is verified in database
4. Refresh page → Still shows "Not Verified"
```

**Fix Required**:
- Create endpoint: `POST /api/auth/verify-email-token`
- Accept token from email link
- Update `users.email_verified = true`
- Return success/failure

#### Issue 2: Database Schema Mismatch
**Problem**: Frontend code checks `profile?.emailVerified` but database source is unclear

**Solution**: Backend correctly handles this by:
```javascript
// vendor-profile.cjs line 34-40 (JOIN with users table)
SELECT 
  vp.*,
  u.email as email,
  u.first_name,
  u.last_name,
  u.email_verified as email_verified  -- ✅ Gets from users table
FROM vendor_profiles vp
JOIN users u ON vp.user_id = u.id
```

✅ **CORRECT** - Backend properly joins and provides `email_verified` from users table

#### Issue 3: Phone Verification Duplication
**Problem**: `phone_verified` exists in BOTH tables:
- `users.phone_verified`
- `vendor_profiles.phone_verified`

**Current Backend Behavior**: Updates BOTH tables (line 757-795)
```javascript
// Updates vendor_profiles
UPDATE vendor_profiles SET phone_verified = true;

// Also updates users
UPDATE users SET phone_verified = true;
```

**Status**: ✅ **ACCEPTABLE** - Backend keeps both in sync

---

### 📋 **COMPLETE VERIFICATION CHECKLIST**

#### Email Verification
- [x] Frontend button exists
- [x] Frontend calls `/verify-email` endpoint
- [x] Backend endpoint exists
- [ ] **❌ MISSING**: Backend doesn't update `users.email_verified`
- [ ] **❌ MISSING**: Email link verification endpoint
- [ ] **❌ INCOMPLETE**: Database never gets updated

**Fix Priority**: 🔴 **HIGH** - Email verification doesn't work

#### Phone Verification
- [x] Frontend button exists
- [x] Frontend uses Firebase SMS verification
- [x] Frontend calls `/phone-verified` endpoint
- [x] Backend updates `vendor_profiles.phone_verified`
- [x] Backend updates `users.phone_verified`
- [x] Database gets updated correctly

**Status**: ✅ **WORKING**

#### Document Verification
- [x] Frontend component exists (DocumentUploadComponent)
- [x] Upload endpoint exists
- [x] Admin approval endpoints exist
- [x] Backend updates `vendor_profiles.documents_verified`
- [x] Frontend checks `profile.documents` array
- [x] Helper function `isDocumentVerified()` works

**Status**: ✅ **WORKING** (requires admin approval)

#### Business Verification
- [x] Backend automatically sets based on business info completeness
- [x] Updates `vendor_profiles.business_verified`
- [x] Frontend displays status

**Status**: ✅ **WORKING** (auto-verification)

---

### 🔧 **REQUIRED FIXES**

#### Fix 1: Implement Email Verification Flow

**Step 1: Create verification token endpoint**
```javascript
// backend-deploy/routes/auth.cjs or vendor-profile.cjs
router.post('/:vendorId/verify-email', async (req, res) => {
  const { vendorId } = req.params;
  
  // 1. Get user email from vendor
  const vendor = await sql`
    SELECT u.email, u.id as user_id
    FROM vendor_profiles vp
    JOIN users u ON vp.user_id = u.id
    WHERE vp.id = ${vendorId}
  `;
  
  // 2. Generate verification token
  const token = generateToken(vendor[0].user_id);
  
  // 3. Save token in database (create verification_tokens table)
  await sql`
    INSERT INTO verification_tokens (user_id, token, expires_at)
    VALUES (${vendor[0].user_id}, ${token}, NOW() + INTERVAL '24 hours')
  `;
  
  // 4. Send email with link
  const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;
  // sendEmail(vendor[0].email, verificationLink);
  
  res.json({ success: true, message: 'Verification email sent' });
});
```

**Step 2: Create token verification endpoint**
```javascript
router.post('/verify-email-token', async (req, res) => {
  const { token } = req.body;
  
  // 1. Find token in database
  const tokenRecord = await sql`
    SELECT * FROM verification_tokens
    WHERE token = ${token} 
    AND expires_at > NOW()
    AND used = false
  `;
  
  if (tokenRecord.length === 0) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  
  // 2. Update user email_verified
  await sql`
    UPDATE users
    SET email_verified = true
    WHERE id = ${tokenRecord[0].user_id}
  `;
  
  // 3. Mark token as used
  await sql`
    UPDATE verification_tokens
    SET used = true
    WHERE token = ${token}
  `;
  
  res.json({ success: true, message: 'Email verified successfully' });
});
```

**Step 3: Add database table**
```sql
CREATE TABLE verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 🎯 **SUMMARY: What Works and What Doesn't**

#### ✅ **WORKING**
1. **Phone Verification**: Frontend → Firebase → Backend → Database ✅
2. **Document Verification**: Upload → Admin Approval → Database ✅
3. **Business Verification**: Auto-verified when info complete ✅
4. **Field Mapping**: Backend correctly joins users + vendor_profiles ✅
5. **Frontend Display**: Shows all verification statuses correctly ✅

#### ❌ **BROKEN**
1. **Email Verification**: Frontend sends request, but database never updates ❌
   - **Root Cause**: `/verify-email` endpoint doesn't update database
   - **Missing**: Email link verification endpoint
   - **Impact**: Users can't complete email verification

#### ⚠️ **NEEDS IMPROVEMENT**
1. **Email Verification Flow**: Need to implement full email verification with token
2. **Verification Tokens**: Need database table to store verification tokens

---

### 📝 **DEPLOYMENT CHECKLIST**

#### Before Email Verification Works:
- [ ] Create `verification_tokens` table
- [ ] Update `/verify-email` endpoint to generate and save tokens
- [ ] Create `/verify-email-token` endpoint to verify tokens
- [ ] Send actual emails (or use demo mode with console links)
- [ ] Frontend route to handle email verification links
- [ ] Test full email verification flow

#### Already Working:
- [x] Profile image upload (fixed with Cloudinary)
- [x] Phone verification with Firebase
- [x] Document upload and admin approval
- [x] Business verification auto-check
- [x] All verification status displays

---

### 🔗 **FIELD MAPPING REFERENCE**

#### Database → Backend → Frontend

```
DATABASE                     BACKEND API              FRONTEND
==================           =================        ==================
users.email_verified      →  emailVerified        →  profile.emailVerified
vendor_profiles.phone_verified → phoneVerified    →  profile.phoneVerified
vendor_profiles.business_verified → businessVerified → profile.businessVerified
vendor_profiles.documents_verified → documentsVerified → profile.documentsVerified

JOIN QUERY (vendor-profile.cjs line 34):
SELECT vp.*, u.email_verified, u.phone_verified
FROM vendor_profiles vp
JOIN users u ON vp.user_id = u.id
```

**All mappings are CORRECT** ✅

**Only issue**: Email verification doesn't persist to database ❌
