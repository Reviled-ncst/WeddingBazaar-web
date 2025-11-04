# ID Usage Audit Report
## Comprehensive Analysis of ID Type Inconsistencies

**Generated:** January 27, 2025  
**Audited By:** GitHub Copilot AI  
**Scope:** Entire codebase (frontend, backend, types, database)

---

## 🔍 Executive Summary

This audit reveals **critical ID type inconsistencies** across the codebase that could lead to:
- Runtime errors and type mismatches
- Database query failures
- API response parsing issues
- Data integrity problems

### Key Findings:
1. **Mixed ID Types**: UUIDs (string), integers (number), and union types (string | number)
2. **Inconsistent Conversions**: Excessive use of `.toString()` and `String()` fallbacks
3. **Type Safety Issues**: TypeScript interfaces don't match actual data formats
4. **Database Misalignment**: Frontend expects one type, backend returns another

---

## 📊 ID Type Analysis by Entity

### 1. **Booking IDs**

#### Database Schema (PostgreSQL)
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
```
- **Type**: UUID (string format)
- **Example**: `"9f0a34e3-2c93-4f93-8bb4-54f6cbfcf1c7"`

#### Backend Issues
**File**: `backend-deploy/routes/bookings.cjs`

**PROBLEM 1** (Line 759 - REMOVED IN FIX):
```javascript
// ❌ OLD CODE (INCORRECT):
const bookingId = Math.floor(Date.now() / 1000); // Returns integer: 1761848304
```
- **Issue**: Generated integer ID instead of using database UUID
- **Impact**: ID type mismatch, potential duplicates, no referential integrity
- **Status**: ✅ FIXED (now uses `booking[0].id` from database)

**SOLUTION** (Line 888 - CURRENT):
```javascript
// ✅ NEW CODE (CORRECT):
const bookingId = booking[0].id; // Get auto-generated UUID
```

#### Frontend Type Issues

**File**: `src/modules/services/components/BookingRequestModal.tsx`

**PROBLEM 2** (Line 51 & 259):
```typescript
interface SuccessBookingData {
  id: string | number;  // ❌ Should be: string only
  bookingReference: string;
  customerName: string;
  // ...
}
```
- **Issue**: Accepts both string and number
- **Expected**: Database always returns UUID (string)
- **Recommendation**: Change to `id: string`

**File**: `src/pages/users/individual/bookings/IndividualBookings.tsx`

**PROBLEM 3** (Line 112):
```typescript
interface QuoteDetails {
  id: string | number;  // ❌ Union type
  quotedPrice: number;
  // ...
}
```
- **Issue**: Same union type problem
- **Recommendation**: Change to `id: string`

**File**: `src/services/api/optimizedBookingApiService.ts`

**PROBLEM 4** (Line 591):
```typescript
bookingReference: `WB-${booking.id?.toString().slice(-6) || '000000'}`
```
- **Issue**: Assumes `booking.id` might not be a string (uses `?.toString()`)
- **Reality**: Database always returns UUID string
- **Recommendation**: Remove optional chaining and `.toString()`

---

### 2. **Service IDs**

#### Database Schema
```sql
CREATE TABLE services (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'SRV-' || generate_series_id()
);
```
- **Type**: String with format `"SRV-00001"`
- **Example**: `"SRV-12345"`

#### Frontend Issues

**File**: `src/pages/users/individual/services/Services.tsx`

**PROBLEM 5** (Line 315):
```typescript
id: service.id || `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
```
- **Issue**: Generates fallback ID if `service.id` is missing
- **Reality**: Database always provides ID
- **Recommendation**: Remove fallback, trust database

**File**: `src/shared/utils/booking-data-mapping.ts`

**PROBLEM 6** (Line 196, 336, 713, 780):
```typescript
id: apiBooking.id.toString(),        // Line 196
id: dbBooking.id.toString(),         // Line 336
id: booking.id?.toString() || '',    // Line 713
id: apiBooking.id?.toString() || '', // Line 780
```
- **Issue**: Multiple `.toString()` conversions across mapping utilities
- **Reality**: IDs are already strings from database
- **Recommendation**: Remove redundant conversions

---

### 3. **User IDs**

#### Database Schema
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
```
- **Type**: UUID (string)
- **Example**: `"eb5c1234-5678-90ab-cdef-1234567890ab"`

#### Frontend Issues

**File**: `src/pages/users/admin/users/UserManagement.tsx`

**PROBLEM 7** (Line 95):
```typescript
id: user.id || user.user_id || String(Math.random()),
```
- **Issue**: Triple fallback with random ID generation
- **Reality**: Database always provides UUID
- **Recommendation**: Use `user.id` only (no fallbacks)

---

### 4. **Vendor IDs**

#### Current State: **Mixed Format Nightmare** 🚨

**Database**: Two competing ID systems
1. `users.id` (UUID): `"eb5c1234-..."`
2. `vendor_profiles.id` (Custom): `"2-2025-001"`

**Frontend Confusion**:
```typescript
// AuthContext returns:
user.id = "2-2025-001"          // Vendor profile ID
user.vendorId = "eb5c1234-..."  // User UUID

// Components use:
vendorId = user?.id || user?.vendorId  // ❓ Which one?
```

**PROBLEM 8**: Dual ID System
- **Issue**: No single source of truth for vendor identity
- **Impact**: Some APIs expect UUID, others expect custom ID
- **Example**:
  - Wallet system: `vendor_id = "2-2025-001"` (custom)
  - User auth: `user_id = "eb5c1234-..."` (UUID)
  - Bookings: `vendor_id = "2-2025-001"` (custom)

**RECOMMENDATION**: Standardize on ONE vendor ID type

---

### 4. **User IDs** - The MOST Critical Issue! 🚨

#### Current State: **Extremely Confusing for Vendors** ⚠️

**Database Reality**:
```sql
-- users table
id: UUID "fa15ab2d-f8fa-4be1-bda7-b0e18e7c20dc"

-- vendor_profiles table  
id: VARCHAR "2-2025-001" (vendor profile ID)
user_id: UUID "fa15ab2d-f8fa-4be1-bda7-b0e18e7c20dc" (FK to users.id)
```

**Frontend Reality** (AuthContext returns):
```typescript
// FOR VENDORS:
user.id = "2-2025-001"                          // Vendor profile ID
user.vendorId = "fa15ab2d-f8fa-4be1-bda7-..."  // User UUID (CONFUSING NAME!)

// FOR COUPLES:
user.id = "fa15ab2d-f8fa-4be1-bda7-..."        // User UUID
user.vendorId = null                             // Not a vendor
```

#### The Problem Visualized

```
DATABASE STRUCTURE:
┌──────────────────────────┐
│ users table              │
│ id: UUID                 │ ← This is the "real" user ID
│ "fa15ab2d-f8fa-..."     │
└──────────────────────────┘
            │
            │ (Foreign Key)
            ↓
┌──────────────────────────┐
│ vendor_profiles table    │
│ id: "2-2025-001"        │ ← This is the vendor profile ID
│ user_id: "fa15ab2d-..." │ ← References users.id
└──────────────────────────┘

FRONTEND CONFUSION:
┌─────────────────────────────────────────┐
│ AuthContext for Vendors                 │
├─────────────────────────────────────────┤
│ user.id = "2-2025-001"       ❓         │ ← Which table is this from?
│ user.vendorId = "fa15ab2d-..." ❓       │ ← Isn't this the USER id?
└─────────────────────────────────────────┘
```

#### PROBLEM 9: **Wallet System Confusion** 🚨

**File**: `src/pages/users/individual/transaction-history/TransactionHistory.tsx`

**Lines 89-91**:
```typescript
// IMPORTANT: wallet_transactions table uses user.id (2-2025-001), NOT user.vendorId!
// user.id is the vendor_id in the wallet_transactions table
const vendorId = user.id; // Use user.id directly
```
- **Issue**: Comment says "user.id" but:
  - For vendors: `user.id = "2-2025-001"` ✅ Works
  - But naming is misleading - this is actually the **vendor profile ID**, not the **user ID**

**Database Reality**:
```sql
CREATE TABLE wallet_transactions (
  vendor_id VARCHAR(50),  -- Stores "2-2025-001" (vendor profile ID)
  -- NOT the UUID from users table!
);
```

---

#### PROBLEM 10: **Booking Creation Confusion**

**File**: `src/services/api/optimizedBookingApiService.ts`

**Multiple instances of fallback logic**:

**Line 202-203**:
```typescript
async createBookingRequest(bookingData: any, userId?: string): Promise<any> {
  const requestId = `booking-${userId}-${bookingData.service_id}-${Date.now()}`;
```
- **Issue**: `userId` parameter name is ambiguous
- **Reality**: For vendors, this would be "2-2025-001" (vendor profile ID)
- **Reality**: For couples, this would be UUID from users table

**Line 244**:
```typescript
'x-user-id': userId || bookingData.user_id || '1-2025-001'
```
- **Issue**: Fallback to `'1-2025-001'` (vendor profile format)
- **Problem**: What if user is a couple? UUID expected!

**Line 428**:
```typescript
private prepareBookingPayload(bookingData: any, userId?: string) {
  return {
    coupleId: userId || bookingData.user_id || bookingData.couple_id || '1-2025-001',
```
- **Issue**: `coupleId` should be UUID (couple user ID)
- **Problem**: Fallback is vendor profile format!

---

#### PROBLEM 11: **User Management Fallback Chaos**

**File**: `src/pages/users/admin/users/UserManagement.tsx`

**Line 95**:
```typescript
id: user.id || user.user_id || String(Math.random()),
```

**Issues**:
1. Triple fallback (why would `user.id` ever be missing from API?)
2. `user.user_id` - duplicate field name (API inconsistency?)
3. `String(Math.random())` - generates fake ID that doesn't exist in database!

**Backend API Returns**:
```javascript
// From /api/admin/users endpoint
{
  id: "fa15ab2d-f8fa-4be1-bda7-b0e18e7c20dc",  // Always present
  user_id: undefined,                           // Doesn't exist
  // ... other fields
}
```

**Recommendation**: Remove all fallbacks, trust the API.

---

#### PROBLEM 12: **Cancel Booking - User ID Validation**

**File**: `backend-deploy/routes/bookings.cjs`

**Lines 1728, 1798**:
```javascript
// Cancel booking
if (booking.user_id !== userId) {
  return res.status(403).json({
    message: 'Unauthorized: You can only cancel your own bookings'
  });
}

// Request cancellation
if (booking.user_id !== userId) {
  return res.status(403).json({
    message: 'Unauthorized: You can only request cancellation for your own bookings'
  });
}
```

**Issue**: `booking.user_id` in database is:
- For couple bookings: UUID (`couple_id` column)
- But `userId` parameter from frontend could be:
  - Vendor: "2-2025-001" (vendor profile ID)
  - Couple: UUID

**Potential Bug**: If vendor tries to cancel, comparison will fail!

---

#### PROBLEM 13: **Malformed User ID Detection**

**File**: `backend-deploy/routes/bookings.cjs`

**Lines 119-172**:
```javascript
function isMalformedUserId(userId) {
  if (!userId || typeof userId !== 'string') return true;
  
  // Malformed patterns
  const malformedPatterns = [
    /[<>]/,          // HTML injection
    /[\[\]]/,        // Array brackets
    /[{}]/,          // Object literals
    // ...
  ];
  
  // Legitimate patterns
  const legitimatePatterns = [
    /^\d+-\d{4}-\d{3}$/,    // Vendor ID: 2-2025-001
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i  // UUID
  ];
  
  // ... validation logic
}
```

**Good**: Function recognizes BOTH formats
**Issue**: Called `isMalformedUserId` but validates vendor IDs too
**Recommendation**: Rename to `isValidId` or `isMalformedId`

---

## 🎯 User ID Recommendations

### Critical Fix: Standardize Naming

**Current Confusion**:
```typescript
// Vendor
user.id = "2-2025-001"      // Really the vendor PROFILE id
user.vendorId = "uuid..."   // Really the USER id

// Couple  
user.id = "uuid..."         // The USER id
user.vendorId = null        // Not applicable
```

**Recommended Structure** (Option 1 - Rename for Clarity):
```typescript
interface User {
  // Core user identity (from users table)
  userId: string;              // UUID - always present
  email: string;
  role: 'couple' | 'vendor' | 'admin';
  
  // Vendor-specific (from vendor_profiles table)
  vendorProfileId?: string;    // "2-2025-001" - only for vendors
  
  // Legacy fields (for backwards compatibility)
  id: string;                  // For vendors: vendorProfileId, For couples: userId
  vendorId?: string;           // DEPRECATED - use vendorProfileId
}
```

**Recommended Structure** (Option 2 - Keep Current, Document Better):
```typescript
interface User {
  /**
   * PRIMARY ID
   * - For vendors: Vendor profile ID (e.g., "2-2025-001")
   * - For couples: User UUID (e.g., "fa15ab2d-...")
   * - For admins: User UUID
   * 
   * Use this for:
   * - Wallet operations (vendors)
   * - Booking queries (all users)
   * - Profile lookups (all users)
   */
  id: string;
  
  /**
   * USER UUID (from users table)
   * - Always a UUID format
   * - Use this for:
   *   - Authentication
   *   - User management
   *   - Cross-reference with users table
   * 
   * Note: For couples, this is the SAME as `id`
   * Note: For vendors, this is DIFFERENT from `id`
   */
  vendorId?: string;  // Better name: userUuid
  
  email: string;
  role: 'couple' | 'vendor' | 'admin';
}
```

#### Fix Implementation Plan

#### Step 1: Update AuthContext (Choose Option 1 or 2)

**Option 1 - Rename Fields**:
```typescript
// HybridAuthContext.tsx
interface AuthUser {
  userId: string;              // UUID - from users table
  vendorProfileId?: string;    // "2-2025-001" - from vendor_profiles table
  
  // Computed getter for backwards compatibility
  get id(): string {
    return this.vendorProfileId || this.userId;
  }
}
```

**Option 2 - Keep Fields, Better Docs**:
```typescript
// Add comprehensive JSDoc comments
interface AuthUser {
  /** 
   * Primary identifier
   * @vendor Vendor profile ID (format: "2-2025-001")
   * @couple User UUID (format: "fa15ab2d-...")
   */
  id: string;
  
  /**
   * User UUID from users table
   * @vendor Different from `id` - this is the UUID
   * @couple Same as `id`
   */
  vendorId?: string;  // Consider renaming to `userUuid`
}
```

#### Step 2: Update All User ID Usages

**Create Utility Functions**:
```typescript
// utils/userIdResolver.ts

/**
 * Get the primary ID for any user
 * - For vendors: Returns vendor profile ID ("2-2025-001")
 * - For couples: Returns user UUID
 */
export function getPrimaryUserId(user: User): string {
  return user.id;
}

/**
 * Get the UUID from users table
 * - For vendors: Returns user.vendorId (UUID)
 * - For couples: Returns user.id (UUID)
 */
export function getUserUuid(user: User): string {
  return user.vendorId || user.id;
}

/**
 * Get vendor profile ID (only for vendors)
 * - For vendors: Returns user.id ("2-2025-001")
 * - For couples: Returns null
 */
export function getVendorProfileId(user: User): string | null {
  return user.role === 'vendor' ? user.id : null;
}

/**
 * Determine ID format
 */
export function isVendorProfileId(id: string): boolean {
  return /^\d+-\d{4}-\d{3}$/.test(id);
}

export function isUserUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
```

#### Step 3: Update Problem Areas

**Fix 1: Wallet Transactions**
```typescript
// TransactionHistory.tsx
// BEFORE:
const vendorId = user.id; // Use user.id directly

// AFTER (with utility):
const vendorId = getVendorProfileId(user);
if (!vendorId) {
  throw new Error('User is not a vendor');
}
```

**Fix 2: Booking Creation**
```typescript
// optimizedBookingApiService.ts
// BEFORE:
coupleId: userId || bookingData.user_id || '1-2025-001',

// AFTER (with utility):
coupleId: getUserUuid(user) || bookingData.couple_id,
// Remove fallback - if missing, let it fail properly
```

**Fix 3: User Management**
```typescript
// UserManagement.tsx
// BEFORE:
id: user.id || user.user_id || String(Math.random()),

// AFTER:
id: user.id  // Trust the API, no fallbacks
```

#### Step 4: Backend Validation

**Update isMalformedUserId**:
```javascript
// bookings.cjs
// BEFORE: isMalformedUserId
// AFTER: isValidId

function isValidId(id) {
  if (!id || typeof id !== 'string') return false;
  
  // UUID pattern
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  // Vendor profile ID pattern
  const isVendorId = /^\d+-\d{4}-\d{1,3}$/.test(id);
  
  return isUuid || isVendorId;
}
```

---

## 🎯 USER ID FLOW ANALYSIS

### Overview
This section analyzes how `user.id` flows through the system from authentication to booking creation, clarifying the dual-purpose nature of this field.

### Authentication Flow

#### 1. **Backend Login Response** (`backend-deploy/routes/auth.cjs`)
```javascript
res.json({
  success: true,
  token,
  user: {
    id: user.id,                    // ✅ This is the users.id (UUID)
    email: user.email,
    userType: user.user_type,
    firstName: user.first_name,
    lastName: user.last_name,
    emailVerified: user.email_verified || false,
    phoneVerified: user.phone_verified || false,
    vendorId: vendorId,             // ✅ This is vendors.id (VEN-XXXXX format)
    vendorProfileId: vendorProfileId // Legacy compatibility
  },
  timestamp: new Date().toISOString()
});
```

**Key Points:**
- `user.id` = `users.id` from database (UUID format: `123e4567-e89b-12d3-a456-426614174000`)
- `user.vendorId` = `vendors.id` from database (String format: `VEN-12345`)
- `user.vendorProfileId` = Legacy field for backward compatibility

#### 2. **Frontend Auth Context** (`src/shared/contexts/HybridAuthContext.tsx`)

**User Interface Definition:**
```typescript
interface User {
  id: string;                    // ✅ users.id (UUID)
  email: string;
  firstName: string;
  lastName: string;
  role: 'couple' | 'vendor' | 'admin' | 'coordinator';
  profileImage?: string;
  phone?: string;
  businessName?: string;
  vendorId?: string | null;      // ✅ vendors.id (VEN-XXXXX)
  emailVerified?: boolean;
  firebaseUid?: string;
  // Neon database fields
  createdAt?: string;
  updated_at?: string;
  isActive?: boolean;
}
```

**Backend-Only Login Mapping:**
```typescript
const backendUser: User = {
  id: data.user.id,              // ✅ users.id (UUID)
  email: data.user.email,
  firstName: data.user.firstName || data.user.first_name || '',
  lastName: data.user.lastName || data.user.last_name || '',
  role: getUserRole(data.user),
  emailVerified: data.user.emailVerified || false,
  vendorId: data.user.vendorId || null,  // ✅ vendors.id (VEN-XXXXX)
  phone: data.user.phone || '',
  firebaseUid: data.token        // JWT token stored here
};
```

**Key Points:**
- `user.id` is correctly mapped to `users.id` (UUID)
- `user.vendorId` is correctly mapped to `vendors.id` (VEN-XXXXX format)
- No confusion at this layer

#### 3. **Booking Creation Flow** (`src/modules/services/components/BookingRequestModal.tsx`)

**Step 1: User Clicks "Book Service"**
```typescript
const { user } = useAuth();  // Gets User object from HybridAuthContext
```

**Step 2: Form Submission**
```typescript
const bookingRequest: BookingRequest = {
  vendor_id: service.vendorId || '',           // ✅ vendors.id (VEN-XXXXX)
  service_id: service.id || service.vendorId || '', // ⚠️ Potential issue here
  service_type: service.category as ServiceCategory,
  service_name: service.name,
  event_date: formData.eventDate,
  // ... other fields
};

// ✅ CORRECT: Passes users.id (UUID) to backend
const createdBooking = await optimizedBookingApiService.createBookingRequest(
  bookingRequest, 
  user?.id  // ✅ This is users.id (UUID)
);
```

**Key Points:**
- `user?.id` correctly passes `users.id` (UUID) to the booking API
- `vendor_id` correctly uses `vendors.id` (VEN-XXXXX format)
- `service_id` has fallback logic that may cause issues

### Database Schema

#### **users** Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- ✅ UUID format
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(50) DEFAULT 'couple',
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  -- ... other fields
);
```

#### **vendors** Table
```sql
CREATE TABLE vendors (
  id VARCHAR(50) PRIMARY KEY,          -- ✅ VEN-XXXXX format
  user_id UUID REFERENCES users(id),   -- ✅ Foreign key to users.id
  business_name VARCHAR(255),
  business_type VARCHAR(100),
  -- ... other fields
);
```

#### **bookings** Table
```sql
CREATE TABLE bookings (
  id VARCHAR(50) PRIMARY KEY,                    -- BKG-XXXXX format
  user_id UUID REFERENCES users(id),             -- ✅ Should be users.id (UUID)
  vendor_id VARCHAR(50) REFERENCES vendors(id),  -- ✅ Should be vendors.id (VEN-XXXXX)
  service_id VARCHAR(50),                        -- SVC-XXXXX format
  -- ... other fields
);
```

### Identified Issues

#### ✅ **CORRECT Usage**
1. **User Authentication**: `user.id` correctly stores and uses `users.id` (UUID)
2. **Vendor Association**: `user.vendorId` correctly stores `vendors.id` (VEN-XXXXX)
3. **Booking Creation**: `user.id` correctly passed to booking API

#### ⚠️ **POTENTIAL Issues**

1. **Service ID Fallback Logic**
```typescript
service_id: service.id || service.vendorId || ''
```
**Problem:** Falls back to `vendorId` (VEN-XXXXX) if `service.id` is missing
**Impact:** Database expects `SVC-XXXXX` format for service_id
**Recommendation:** Remove fallback or throw error if service.id is missing

2. **Transaction History Vendor ID Logic**
```typescript
const effectiveVendorId = 
  user?.role === 'vendor' 
    ? (user?.vendorId || user?.id)  // ⚠️ Falls back to users.id if vendorId missing
    : undefined;
```
**Problem:** Falls back to UUID format when `VEN-XXXXX` expected
**Impact:** May cause query failures or incorrect data retrieval
**Recommendation:** Throw error if vendorId is missing for vendor users

3. **Type Inconsistencies**
```typescript
// Some interfaces use string | number
interface Booking {
  id: string | number;  // ⚠️ Should be just string
  user_id?: string | number;  // ⚠️ Should be just string (UUID)
  vendor_id?: string | number;  // ⚠️ Should be just string
}
```
**Problem:** Type system allows both string and number
**Impact:** Runtime type confusion and unnecessary toString() calls
**Recommendation:** Use strict string types for all IDs

### Recommended Fixes

#### 1. **Standardize ID Types**
```typescript
// ✅ RECOMMENDED: Use strict string types
interface Booking {
  id: string;           // BKG-XXXXX format
  user_id: string;      // UUID format
  vendor_id: string;    // VEN-XXXXX format
  service_id: string;   // SVC-XXXXX format
}
```

#### 2. **Remove Fallback Logic**
```typescript
// ❌ BEFORE
service_id: service.id || service.vendorId || ''

// ✅ AFTER
if (!service.id) {
  throw new Error('Service ID is required for booking');
}
service_id: service.id
```

#### 3. **Add Type Guards**
```typescript
// ✅ Add validation functions
const isValidUUID = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

const isValidVendorId = (id: string): boolean => {
  return /^VEN-\d{5}$/.test(id);
};

const isValidServiceId = (id: string): boolean => {
  return /^SVC-\d{5}$/.test(id);
};
```

#### 4. **Clarify Documentation**
```typescript
interface User {
  /**
   * User's unique identifier from users table
   * Format: UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)
   * Used for: Authentication, bookings, reviews, etc.
   */
  id: string;
  
  /**
   * Vendor's unique identifier from vendors table (for vendor users only)
   * Format: VEN-XXXXX (e.g., VEN-12345)
   * Used for: Service listings, vendor queries, vendor-specific features
   * Note: This is NOT the same as user.id
   */
  vendorId?: string | null;
}
```

### Testing Recommendations

1. **Test Booking Creation with All User Types**
   - Couple user creates booking ✅ (uses users.id)
   - Vendor user creates booking (should be prevented or handled differently)
   - Admin user creates booking (should be prevented or handled differently)

2. **Verify Database Constraints**
   - Check if bookings.user_id accepts UUID format
   - Check if bookings.vendor_id accepts VEN-XXXXX format
   - Check if bookings.service_id accepts SVC-XXXXX format

3. **Test Error Handling**
   - What happens if service.id is missing?
   - What happens if user.vendorId is missing for vendor user?
   - What happens if IDs are in wrong format?

### Conclusion

**The `user.id` field is correctly implemented and used throughout the system.** It consistently refers to `users.id` (UUID format) and is properly passed to the booking creation API. The confusion noted in the original audit was due to:

1. **Fallback Logic**: Code that falls back to incorrect ID types when expected fields are missing
2. **Type System**: Overly permissive types (`string | number`) that allow invalid values
3. **Documentation**: Lack of clear comments explaining the purpose of each ID field

**Priority Actions:**
1. Remove fallback logic that mixes UUID and VEN-XXXXX formats
2. Standardize all ID types to strict strings
3. Add JSDoc comments to clarify ID field purposes
4. Add runtime validation for ID formats

---
