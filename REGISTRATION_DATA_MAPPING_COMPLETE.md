# 📊 REGISTRATION DATA MAPPING - ALL USER TYPES

**Date**: November 1, 2025  
**Status**: ✅ COMPLETE DOCUMENTATION  
**Scope**: Frontend → Backend data flow for all user types  

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Couple Registration](#couple-registration)
3. [Vendor Registration](#vendor-registration)
4. [Coordinator Registration](#coordinator-registration)
5. [Admin Registration](#admin-registration)
6. [Field Mapping Summary](#field-mapping-summary)
7. [Database Schema Reference](#database-schema-reference)

---

## 🎯 OVERVIEW

This document provides a **complete data mapping** for all user registration types in the Wedding Bazaar platform. It shows exactly what data the frontend sends and how the backend processes it.

### Registration Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  RegisterModal.tsx → HybridAuthContext.tsx → API Call       │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP POST /api/auth/register
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                         │
│  auth.cjs → Extract data → Normalize → Create user          │
│           → Create profile → Generate JWT → Return          │
└─────────────────────────────────────────────────────────────┘
```

---

## 💑 COUPLE REGISTRATION

### Frontend Code
**File**: `src/shared/components/modals/RegisterModal.tsx`  
**Lines**: 295-315

```typescript
// User selects "I'm Planning My Wedding" (couple)
const userType = 'couple';

// Form submission
await register({
  firstName: formData.firstName,        // Required
  lastName: formData.lastName,          // Required
  email: formData.email,                // Required
  phone: formData.phone,                // Optional
  password: formData.password,          // Required
  role: userType,                       // 'couple'
  receiveUpdates: formData.receiveUpdates  // Optional
});
```

### Backend Processing
**File**: `backend-deploy/routes/auth.cjs`  
**Lines**: 130-429

```javascript
// 1. Extract request data
const {
  email,           // From: formData.email
  password,        // From: formData.password
  first_name,      // From: formData.firstName
  last_name,       // From: formData.lastName
  phone,           // From: formData.phone
  role,            // From: userType ('couple')
  user_type,       // From: legacy code (may not be sent)
} = req.body;

// 2. Normalize user type
const actualUserType = user_type || role || 'couple';
// Result: 'couple'

// 3. Create user in users table
const userResult = await sql`
  INSERT INTO users (
    id,              // Generated: '1-2025-001'
    email,           // 'couple@example.com'
    password,        // Hashed with bcrypt
    first_name,      // 'John'
    last_name,       // 'Doe'
    user_type,       // 'couple'
    phone,           // '+639123456789' or null
    firebase_uid,    // null (if email/password)
    email_verified,  // false (requires verification)
    created_at       // NOW()
  )
  VALUES (...)
  RETURNING *
`;

// 4. Create couple_profile (line 405)
else if (actualUserType === 'couple') {
  // Generate couple profile ID
  const coupleId = 'CP-2025-001';
  
  await sql`
    INSERT INTO couple_profiles (
      id,              // 'CP-2025-001'
      user_id,         // '1-2025-001' (foreign key)
      partner_name,    // null (not collected during registration)
      wedding_date,    // null (not collected during registration)
      wedding_location,// null
      budget_range,    // null
      guest_count,     // 0
      wedding_style,   // null
      created_at,      // NOW()
      updated_at       // NOW()
    )
    VALUES (...)
    RETURNING *
  `;
}

// 5. Generate JWT and return
const token = jwt.sign(
  { userId: user.id, email: user.email, userType: 'couple' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

### Data Flow Table

| Frontend Field | Frontend Value | Backend Field | Backend Value | Database Table | Database Column |
|----------------|----------------|---------------|---------------|----------------|-----------------|
| `formData.firstName` | 'John' | `first_name` | 'John' | `users` | `first_name` |
| `formData.lastName` | 'Doe' | `last_name` | 'Doe' | `users` | `last_name` |
| `formData.email` | 'couple@example.com' | `email` | 'couple@example.com' | `users` | `email` |
| `formData.password` | 'password123' | `password` | (bcrypt hash) | `users` | `password` |
| `formData.phone` | '+639123456789' | `phone` | '+639123456789' | `users` | `phone` |
| `userType` | 'couple' | `role` → `actualUserType` | 'couple' | `users` | `user_type` |
| (not sent) | - | (generated) | '1-2025-001' | `users` | `id` |
| (not sent) | - | (generated) | 'CP-2025-001' | `couple_profiles` | `id` |

### Database Result

**Table: `users`**
```sql
id          | 1-2025-001
email       | couple@example.com
password    | $2b$10$... (hashed)
first_name  | John
last_name   | Doe
user_type   | couple
phone       | +639123456789
email_verified | false
created_at  | 2025-11-01 10:30:00
```

**Table: `couple_profiles`**
```sql
id          | CP-2025-001
user_id     | 1-2025-001
partner_name | null
wedding_date | null
wedding_location | null
budget_range | null
guest_count | 0
wedding_style | null
created_at  | 2025-11-01 10:30:00
```

---

## 🏢 VENDOR REGISTRATION

### Frontend Code
**File**: `src/shared/components/modals/RegisterModal.tsx`  
**Lines**: 295-315

```typescript
// User selects "I'm a Vendor" (vendor)
const userType = 'vendor';

// Form submission
await register({
  firstName: formData.firstName,        // Required
  lastName: formData.lastName,          // Required
  email: formData.email,                // Required
  phone: formData.phone,                // Optional
  password: formData.password,          // Required
  role: userType,                       // 'vendor'
  
  // Vendor-specific fields
  business_name: formData.business_name,    // Required
  business_type: formData.business_type,    // Required (category)
  location: formData.location,              // Required
  
  receiveUpdates: formData.receiveUpdates   // Optional
});
```

### Backend Processing
**File**: `backend-deploy/routes/auth.cjs`  
**Lines**: 251-290

```javascript
// 1. Extract request data
const {
  email, password, first_name, last_name, phone,
  role, user_type,
  business_name,    // 'Elegant Events Photography'
  business_type,    // 'Photography'
  location,         // 'Makati City'
} = req.body;

// 2. Normalize user type
const actualUserType = user_type || role || 'couple';
// Result: 'vendor'

// 3. Validate vendor-specific fields
if (actualUserType === 'vendor' && (!business_name || !business_type)) {
  return res.status(400).json({
    error: 'Vendor registration requires business_name and business_type'
  });
}

// 4. Create user in users table
const userResult = await sql`
  INSERT INTO users (
    id,              // Generated: '2-2025-001' (vendor prefix)
    email,           // 'vendor@example.com'
    password,        // Hashed with bcrypt
    first_name,      // 'Maria'
    last_name,       // 'Santos'
    user_type,       // 'vendor'
    phone,           // '+639123456789'
    created_at       // NOW()
  )
  VALUES (...)
  RETURNING *
`;

// 5. Create vendor_profile (line 251)
if (actualUserType === 'vendor') {
  await sql`
    INSERT INTO vendor_profiles (
      user_id,                  // '2-2025-001'
      business_name,            // 'Elegant Events Photography'
      business_type,            // 'Photography'
      business_description,     // null
      verification_status,      // 'unverified'
      verification_documents,   // JSONB (placeholder)
      service_areas,            // ['Makati City'] (from location)
      pricing_range,            // JSONB (placeholder)
      business_hours,           // JSONB (default 9-5)
      average_rating,           // 0.00
      total_reviews,            // 0
      total_bookings,           // 0
      response_time_hours,      // 24
      is_featured,              // false
      is_premium,               // false
      created_at,               // NOW()
      updated_at                // NOW()
    )
    VALUES (
      ${userId},
      ${business_name},
      ${business_type},
      null,
      'unverified',
      ${{
        business_registration: null,
        tax_documents: null,
        identity_verification: null,
        status: 'pending_submission',
        submitted_at: null,
        reviewed_at: null,
        admin_notes: null
      }},
      ${[location || 'Not specified']},  // ✅ Array, no JSON.stringify
      ${{ min: null, max: null, currency: 'PHP', type: 'per_service' }},
      ${{
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { closed: true }
      }},
      0.00, 0, 0, 24, false, false,
      NOW(), NOW()
    )
    RETURNING *
  `;
}
```

### Data Flow Table

| Frontend Field | Frontend Value | Backend Field | Backend Value | Database Table | Database Column |
|----------------|----------------|---------------|---------------|----------------|-----------------|
| `formData.firstName` | 'Maria' | `first_name` | 'Maria' | `users` | `first_name` |
| `formData.lastName` | 'Santos' | `last_name` | 'Santos' | `users` | `last_name` |
| `formData.email` | 'vendor@example.com' | `email` | 'vendor@example.com' | `users` | `email` |
| `formData.password` | 'password123' | `password` | (bcrypt hash) | `users` | `password` |
| `formData.phone` | '+639123456789' | `phone` | '+639123456789' | `users` | `phone` |
| `userType` | 'vendor' | `role` → `actualUserType` | 'vendor' | `users` | `user_type` |
| `formData.business_name` | 'Elegant Events' | `business_name` | 'Elegant Events' | `vendor_profiles` | `business_name` |
| `formData.business_type` | 'Photography' | `business_type` | 'Photography' | `vendor_profiles` | `business_type` |
| `formData.location` | 'Makati City' | `location` | ['Makati City'] | `vendor_profiles` | `service_areas` (array) |
| (not sent) | - | (generated) | '2-2025-001' | `users` | `id` |
| (not sent) | - | (default) | 'unverified' | `vendor_profiles` | `verification_status` |

### Database Result

**Table: `users`**
```sql
id          | 2-2025-001
email       | vendor@example.com
password    | $2b$10$... (hashed)
first_name  | Maria
last_name   | Santos
user_type   | vendor
phone       | +639123456789
email_verified | false
created_at  | 2025-11-01 10:30:00
```

**Table: `vendor_profiles`**
```sql
id          | (UUID auto-generated)
user_id     | 2-2025-001
business_name | Elegant Events Photography
business_type | Photography
business_description | null
service_areas | {"Makati City"} (PostgreSQL array)
verification_status | unverified
verification_documents | {"business_registration": null, ...} (JSONB)
pricing_range | {"min": null, "max": null, "currency": "PHP"} (JSONB)
business_hours | {"monday": {"open": "09:00", ...}} (JSONB)
average_rating | 0.00
total_reviews | 0
total_bookings | 0
is_featured | false
is_premium | false
created_at  | 2025-11-01 10:30:00
```

---

## 🎉 COORDINATOR REGISTRATION

### Frontend Code
**File**: `src/shared/components/modals/RegisterModal.tsx`  
**Lines**: 295-315

```typescript
// User selects "I'm a Coordinator" (coordinator)
const userType = 'coordinator';

// Form submission
await register({
  firstName: formData.firstName,        // Required
  lastName: formData.lastName,          // Required
  email: formData.email,                // Required
  phone: formData.phone,                // Optional
  password: formData.password,          // Required
  role: userType,                       // 'coordinator'
  
  // Coordinator-specific fields (same as vendor)
  business_name: formData.business_name,    // Required
  business_type: formData.business_type,    // Required ('Wedding Coordinator')
  location: formData.location,              // Required
  
  // Coordinator-ONLY fields
  years_experience: formData.years_experience,  // Required: '3-5', '5-10', etc.
  team_size: formData.team_size,                // Required: 'Solo', 'Small Team', etc.
  specialties: formData.specialties,            // Required: Array of specialties
  service_areas: formData.service_areas,        // Required: Array of service areas
  
  receiveUpdates: formData.receiveUpdates       // Optional
});
```

### Backend Processing
**File**: `backend-deploy/routes/auth.cjs`  
**Lines**: 300-395

```javascript
// 1. Extract request data
const {
  email, password, first_name, last_name, phone,
  role, user_type,
  business_name,        // 'Maria Santos Wedding Coordination'
  business_type,        // 'Wedding Coordinator'
  location,             // 'Makati City'
} = req.body;

// 2. Extract coordinator-specific fields
const years_experience = req.body.years_experience;  // '3-5'
const team_size = req.body.team_size;                // 'Small Team (2-5)'
const specialties = req.body.specialties;            // Array
const service_areas = req.body.service_areas;        // Array

// 3. Normalize user type
const actualUserType = user_type || role || 'couple';
// Result: 'coordinator'

// 4. Parse years_experience (handle ranges)
let parsed_years_experience = 0;
if (years_experience) {
  const yearsStr = String(years_experience);
  if (yearsStr.includes('-')) {
    // '3-5' → 3
    parsed_years_experience = parseInt(yearsStr.split('-')[0]);
  } else {
    // '5' → 5
    parsed_years_experience = parseInt(yearsStr) || 0;
  }
}

// 5. Parse specialties (ensure array)
let parsed_specialties = [];
if (specialties) {
  if (Array.isArray(specialties)) {
    parsed_specialties = specialties;
  } else if (typeof specialties === 'string') {
    parsed_specialties = specialties.split(',').map(s => s.trim()).filter(Boolean);
  }
}

// 6. Parse service_areas (ensure array)
let coordinator_service_areas = [];
if (service_areas) {
  if (Array.isArray(service_areas)) {
    coordinator_service_areas = service_areas;
  } else if (typeof service_areas === 'string') {
    coordinator_service_areas = service_areas.split(',').map(s => s.trim()).filter(Boolean);
  }
}
// Fallback to location if empty
if (coordinator_service_areas.length === 0) {
  coordinator_service_areas = [location || 'Not specified'];
}

// 7. Create user in users table (same as vendor)
const userResult = await sql`
  INSERT INTO users (
    id, email, password, first_name, last_name, user_type, phone, created_at
  )
  VALUES (
    ${userId}, ${email}, ${hashedPassword}, ${first_name}, ${last_name},
    ${actualUserType}, ${phone || null}, NOW()
  )
  RETURNING *
`;

// 8. Create vendor_profile for coordinator (line 300)
else if (actualUserType === 'coordinator') {
  await sql`
    INSERT INTO vendor_profiles (
      user_id,                  // '1-2025-016'
      business_name,            // 'Maria Santos Wedding Coordination'
      business_type,            // 'Wedding Coordinator'
      business_description,     // Auto-generated
      years_experience,         // 3 (parsed from '3-5')
      team_size,                // 'Small Team (2-5)'
      specialties,              // ['Full Wedding Coordination', 'Day-of Coordination']
      service_areas,            // ['Metro Manila', 'Nearby Provinces']
      verification_status,      // 'unverified'
      verification_documents,   // JSONB (placeholder)
      pricing_range,            // JSONB (placeholder)
      business_hours,           // JSONB (default 9-5)
      average_rating,           // 0.00
      total_reviews,            // 0
      total_bookings,           // 0
      response_time_hours,      // 12
      is_featured,              // false
      is_premium,               // false
      created_at,               // NOW()
      updated_at                // NOW()
    )
    VALUES (
      ${userId},
      ${business_name},
      ${business_type || 'Wedding Coordination'},
      'Wedding Coordinator - Manage multiple weddings and coordinate vendors',
      ${parsed_years_experience},
      ${team_size},
      ${parsed_specialties},              // ✅ Direct array insert
      ${coordinator_service_areas},       // ✅ Direct array insert
      'unverified',
      ${{
        business_registration: null,
        tax_documents: null,
        identity_verification: null,
        status: 'pending_submission',
        submitted_at: null,
        reviewed_at: null,
        admin_notes: null
      }},
      ${{ min: null, max: null, currency: 'PHP', type: 'per_event' }},
      ${{
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { closed: true }
      }},
      0.00, 0, 0, 12, false, false,
      NOW(), NOW()
    )
    RETURNING *
  `;
}
```

### Data Flow Table

| Frontend Field | Frontend Value | Backend Field | Backend Value | Database Table | Database Column |
|----------------|----------------|---------------|---------------|----------------|-----------------|
| `formData.firstName` | 'Maria' | `first_name` | 'Maria' | `users` | `first_name` |
| `formData.lastName` | 'Santos' | `last_name` | 'Santos' | `users` | `last_name` |
| `formData.email` | 'coord@example.com' | `email` | 'coord@example.com' | `users` | `email` |
| `formData.password` | 'password123' | `password` | (bcrypt hash) | `users` | `password` |
| `formData.phone` | '+639123456789' | `phone` | '+639123456789' | `users` | `phone` |
| `userType` | 'coordinator' | `role` → `actualUserType` | 'coordinator' | `users` | `user_type` |
| `formData.business_name` | 'Maria Coordination' | `business_name` | 'Maria Coordination' | `vendor_profiles` | `business_name` |
| `formData.business_type` | 'Wedding Coordinator' | `business_type` | 'Wedding Coordinator' | `vendor_profiles` | `business_type` |
| `formData.location` | 'Makati City' | `location` | (fallback) | `vendor_profiles` | `service_areas` |
| `formData.years_experience` | '3-5' | `years_experience` | 3 (parsed) | `vendor_profiles` | `years_experience` |
| `formData.team_size` | 'Small Team (2-5)' | `team_size` | 'Small Team (2-5)' | `vendor_profiles` | `team_size` |
| `formData.specialties` | ['Full Coordination', 'Day-of'] | `specialties` | ['Full Coordination', 'Day-of'] | `vendor_profiles` | `specialties` (TEXT[]) |
| `formData.service_areas` | ['Metro Manila', 'Nearby'] | `service_areas` | ['Metro Manila', 'Nearby'] | `vendor_profiles` | `service_areas` (TEXT[]) |
| (not sent) | - | (generated) | '1-2025-016' | `users` | `id` |

### Database Result

**Table: `users`**
```sql
id          | 1-2025-016
email       | coord@example.com
password    | $2b$10$... (hashed)
first_name  | Maria
last_name   | Santos
user_type   | coordinator
phone       | +639123456789
email_verified | false
created_at  | 2025-11-01 10:30:00
```

**Table: `vendor_profiles`**
```sql
id          | (UUID auto-generated)
user_id     | 1-2025-016
business_name | Maria Santos Wedding Coordination
business_type | Wedding Coordinator
business_description | Wedding Coordinator - Manage multiple weddings and coordinate vendors
years_experience | 3
team_size   | Small Team (2-5)
specialties | {"Full Wedding Coordination","Day-of Coordination"} (PostgreSQL TEXT[] array)
service_areas | {"Metro Manila","Nearby Provinces"} (PostgreSQL TEXT[] array)
verification_status | unverified
verification_documents | {"business_registration": null, ...} (JSONB)
pricing_range | {"min": null, "max": null, "currency": "PHP", "type": "per_event"} (JSONB)
business_hours | {"monday": {"open": "09:00", ...}} (JSONB)
average_rating | 0.00
total_reviews | 0
total_bookings | 0
response_time_hours | 12
is_featured | false
is_premium | false
created_at  | 2025-11-01 10:30:00
```

---

## 👨‍💼 ADMIN REGISTRATION

### Frontend Code
**Note**: Admin registration is typically done via script, not through the frontend registration form.

**File**: `create-admin-account.cjs` (Script)

```javascript
// Admin registration via script
const adminData = {
  email: 'admin@weddingbazaar.com',
  password: 'adminSecurePassword123',
  first_name: 'Admin',
  last_name: 'User',
  user_type: 'admin',  // Script sends 'user_type'
  phone: '+639123456789'
};

// POST to backend
await fetch('https://weddingbazaar-web.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(adminData)
});
```

### Backend Processing
**File**: `backend-deploy/routes/auth.cjs`  
**Lines**: 430-445

```javascript
// 1. Extract request data
const {
  email, password, first_name, last_name, phone,
  role, user_type,  // Script may send 'user_type' or 'role'
} = req.body;

// 2. Normalize user type
const actualUserType = user_type || role || 'couple';
// Result: 'admin'

// 3. Create user in users table
const userResult = await sql`
  INSERT INTO users (
    id,              // Generated: 'A-2025-001' (admin prefix)
    email,           // 'admin@weddingbazaar.com'
    password,        // Hashed with bcrypt
    first_name,      // 'Admin'
    last_name,       // 'User'
    user_type,       // 'admin'
    phone,           // '+639123456789'
    email_verified,  // true (admin auto-verified)
    created_at       // NOW()
  )
  VALUES (...)
  RETURNING *
`;

// 4. Create admin_profile (line 430)
else if (actualUserType === 'admin') {
  await sql`
    INSERT INTO admin_profiles (
      user_id,      // 'A-2025-001'
      created_at,   // NOW()
      updated_at    // NOW()
    )
    VALUES (
      ${userId},
      NOW(),
      NOW()
    )
    RETURNING *
  `;
}
```

### Data Flow Table

| Script Field | Script Value | Backend Field | Backend Value | Database Table | Database Column |
|--------------|--------------|---------------|---------------|----------------|-----------------|
| `email` | 'admin@wb.com' | `email` | 'admin@wb.com' | `users` | `email` |
| `password` | 'admin123' | `password` | (bcrypt hash) | `users` | `password` |
| `first_name` | 'Admin' | `first_name` | 'Admin' | `users` | `first_name` |
| `last_name` | 'User' | `last_name` | 'User' | `users` | `last_name` |
| `user_type` | 'admin' | `user_type` → `actualUserType` | 'admin' | `users` | `user_type` |
| `phone` | '+639123456789' | `phone` | '+639123456789' | `users` | `phone` |
| (not sent) | - | (generated) | 'A-2025-001' | `users` | `id` |
| (not sent) | - | (default) | true | `users` | `email_verified` |

### Database Result

**Table: `users`**
```sql
id          | A-2025-001
email       | admin@weddingbazaar.com
password    | $2b$10$... (hashed)
first_name  | Admin
last_name   | User
user_type   | admin
phone       | +639123456789
email_verified | true
created_at  | 2025-11-01 10:30:00
```

**Table: `admin_profiles`**
```sql
id          | (UUID auto-generated)
user_id     | A-2025-001
created_at  | 2025-11-01 10:30:00
updated_at  | 2025-11-01 10:30:00
```

---

## 📊 FIELD MAPPING SUMMARY

### Common Fields (All User Types)

| Frontend Field | Backend Field | Type | Required | Database Column |
|----------------|---------------|------|----------|-----------------|
| `formData.firstName` | `first_name` | String | ✅ Yes | `users.first_name` |
| `formData.lastName` | `last_name` | String | ✅ Yes | `users.last_name` |
| `formData.email` | `email` | String | ✅ Yes | `users.email` |
| `formData.password` | `password` | String | ✅ Yes | `users.password` (hashed) |
| `formData.phone` | `phone` | String | ❌ No | `users.phone` |
| `userType` | `role` or `user_type` → `actualUserType` | String | ✅ Yes | `users.user_type` |
| (generated) | `id` | String | ✅ Auto | `users.id` |
| (generated) | `created_at` | Timestamp | ✅ Auto | `users.created_at` |

### Vendor-Specific Fields

| Frontend Field | Backend Field | Type | Required | Database Column |
|----------------|---------------|------|----------|-----------------|
| `formData.business_name` | `business_name` | String | ✅ Yes | `vendor_profiles.business_name` |
| `formData.business_type` | `business_type` | String | ✅ Yes | `vendor_profiles.business_type` |
| `formData.location` | `location` → `service_areas` | String → Array | ✅ Yes | `vendor_profiles.service_areas` (TEXT[]) |
| (not sent) | `verification_status` | String | ✅ Auto | `vendor_profiles.verification_status` |
| (not sent) | `verification_documents` | JSONB | ✅ Auto | `vendor_profiles.verification_documents` |
| (not sent) | `pricing_range` | JSONB | ✅ Auto | `vendor_profiles.pricing_range` |
| (not sent) | `business_hours` | JSONB | ✅ Auto | `vendor_profiles.business_hours` |

### Coordinator-Specific Fields (extends Vendor)

| Frontend Field | Backend Field | Type | Required | Database Column |
|----------------|---------------|------|----------|-----------------|
| `formData.years_experience` | `years_experience` | String → Integer | ✅ Yes | `vendor_profiles.years_experience` |
| `formData.team_size` | `team_size` | String | ✅ Yes | `vendor_profiles.team_size` |
| `formData.specialties` | `specialties` | Array | ✅ Yes | `vendor_profiles.specialties` (TEXT[]) |
| `formData.service_areas` | `service_areas` | Array | ✅ Yes | `vendor_profiles.service_areas` (TEXT[]) |

### Couple-Specific Fields

| Frontend Field | Backend Field | Type | Required | Database Column |
|----------------|---------------|------|----------|-----------------|
| (not sent) | `partner_name` | String | ❌ No | `couple_profiles.partner_name` |
| (not sent) | `wedding_date` | Date | ❌ No | `couple_profiles.wedding_date` |
| (not sent) | `wedding_location` | String | ❌ No | `couple_profiles.wedding_location` |
| (not sent) | `budget_range` | String | ❌ No | `couple_profiles.budget_range` |
| (generated) | `guest_count` | Integer | ✅ Auto | `couple_profiles.guest_count` (default: 0) |

### Admin-Specific Fields

| Frontend Field | Backend Field | Type | Required | Database Column |
|----------------|---------------|------|----------|-----------------|
| (none - minimal profile) | - | - | - | `admin_profiles.*` |

---

## 🗄️ DATABASE SCHEMA REFERENCE

### users table
```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,              -- '1-2025-001', '2-2025-001', 'A-2025-001'
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,          -- bcrypt hash
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  user_type VARCHAR(50) NOT NULL,          -- 'couple', 'vendor', 'coordinator', 'admin'
  phone VARCHAR(20),
  firebase_uid VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

### vendor_profiles table
```sql
CREATE TABLE vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100),              -- Category
  business_description TEXT,
  years_experience INTEGER,                -- Coordinator field
  team_size VARCHAR(50),                   -- Coordinator field
  specialties TEXT[],                      -- Coordinator field (PostgreSQL array)
  service_areas TEXT[],                    -- Coordinator field (PostgreSQL array)
  verification_status VARCHAR(50) DEFAULT 'unverified',
  verification_documents JSONB,            -- JSONB object
  pricing_range JSONB,                     -- JSONB object
  business_hours JSONB,                    -- JSONB object
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  response_time_hours INTEGER DEFAULT 24,
  is_featured BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### couple_profiles table
```sql
CREATE TABLE couple_profiles (
  id VARCHAR(50) PRIMARY KEY,              -- 'CP-2025-001'
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  partner_name VARCHAR(255),
  wedding_date DATE,
  wedding_location VARCHAR(255),
  budget_range VARCHAR(100),
  guest_count INTEGER DEFAULT 0,
  wedding_style VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### admin_profiles table
```sql
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 KEY TAKEAWAYS

### 1. User Type Normalization
```javascript
// Backend always uses this pattern
const actualUserType = user_type || role || 'couple';
```
- Accepts both `user_type` and `role` from frontend
- Fallback to 'couple' if neither provided
- **ALL** profile creation checks use `actualUserType`

### 2. Array Handling (Coordinator)
```javascript
// ❌ WRONG (causes Postgres errors)
${JSON.stringify(specialties)}

// ✅ CORRECT (Neon driver handles conversion)
${specialties}
```
- Never use `JSON.stringify()` on arrays for TEXT[] columns
- Neon driver automatically converts JavaScript arrays to PostgreSQL arrays
- Only use JSON for JSONB columns

### 3. Profile Creation Pattern
```javascript
// ✅ CORRECT (all if conditions use actualUserType)
if (actualUserType === 'vendor') { ... }
else if (actualUserType === 'coordinator') { ... }
else if (actualUserType === 'couple') { ... }
else if (actualUserType === 'admin') { ... }
```

### 4. Coordinator Uses vendor_profiles
- Coordinators store profile data in `vendor_profiles` table
- Additional fields: `years_experience`, `team_size`, `specialties`, `service_areas`
- Distinguished by `business_type = 'Wedding Coordinator'`

### 5. ID Generation Patterns
- Couples: `1-2025-001` (individual prefix)
- Vendors: `2-2025-001` (vendor prefix)
- Coordinators: `1-2025-016` (individual prefix)
- Admins: `A-2025-001` (admin prefix)

---

## ✅ VALIDATION CHECKLIST

When implementing or testing registration:

- [ ] Frontend sends correct field names
- [ ] Backend accepts both `role` and `user_type`
- [ ] Backend uses `actualUserType` in all if conditions
- [ ] Arrays passed directly (no JSON.stringify)
- [ ] JSONB objects passed directly
- [ ] User created in `users` table
- [ ] Profile created in appropriate table
- [ ] Foreign key constraints satisfied
- [ ] Email verification status set correctly
- [ ] JWT token generated and returned
- [ ] User can login after registration
- [ ] User redirected to correct dashboard

---

**Last Updated**: November 1, 2025  
**Status**: ✅ COMPLETE  
**Related Files**:
- `src/shared/components/modals/RegisterModal.tsx`
- `backend-deploy/routes/auth.cjs`
- `REGISTRATION_SYSTEM_AUDIT_COMPLETE.md`
- `CRITICAL_COUPLE_ADMIN_REGISTRATION_FIX.md`

---
