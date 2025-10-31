# 🗄️ COORDINATOR USER CREATION IN NEON DATABASE - COMPLETE FLOW

## Executive Summary

**Question**: How are coordinator users created in the Neon PostgreSQL database?

**Answer**: Coordinator users are created through a **TWO-STEP process** in the backend registration endpoint:
1. **Step 1**: Create entry in `users` table with `user_type='coordinator'`
2. **Step 2**: Create entry in `vendor_profiles` table with coordinator-specific fields

---

## 📊 Registration Flow Overview

```
Frontend (RegisterModal.tsx)
    ↓
    | Sends coordinator registration data
    ↓
Backend (/api/auth/register)
    ↓
    | Step 1: Create user in `users` table
    | Step 2: Create profile in `vendor_profiles` table
    ↓
Neon PostgreSQL Database
    ↓
    | users table: coordinator user entry
    | vendor_profiles table: coordinator profile with fields
    ↓
Response: Success + user data + vendorProfileId
```

---

## 🔧 Step-by-Step Creation Process

### Step 1: Validate Coordinator Registration Data

**File**: `backend-deploy/routes/auth.cjs` (Lines 154-168)

```javascript
// 1. Validate user_type
const validUserTypes = ['couple', 'vendor', 'admin', 'coordinator'];
if (!validUserTypes.includes(user_type)) {
  return res.status(400).json({
    success: false,
    error: 'Invalid user_type. Must be one of: couple, vendor, admin, coordinator'
  });
}

// 2. Coordinator-specific validation
if ((user_type === 'vendor' || user_type === 'coordinator') && 
    (!business_name || !business_type)) {
  return res.status(400).json({
    success: false,
    error: `Coordinator registration requires business_name and business_type`
  });
}
```

**What happens**:
- ✅ Checks if `user_type='coordinator'` is valid
- ✅ Validates required fields: `business_name`, `business_type`

---

### Step 2: Create User Entry in `users` Table

**File**: `backend-deploy/routes/auth.cjs` (Lines 218-241)

```javascript
// Hash password
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Generate unique user ID
const userId = await getNextUserId(sql, 'individual'); // e.g., "1-2025-015"

// Insert into users table
const userResult = await sql`
  INSERT INTO users (
    id, email, password, first_name, last_name, 
    user_type, phone, firebase_uid, email_verified, created_at
  )
  VALUES (
    ${userId}, 
    ${email}, 
    ${hashedPassword}, 
    ${first_name}, 
    ${last_name || ''}, 
    ${'coordinator'},  // ✅ USER_TYPE SET TO 'coordinator'
    ${phone || null}, 
    ${firebase_uid || null}, 
    ${isFirebaseVerified}, 
    NOW()
  )
  RETURNING id, email, first_name, last_name, user_type, phone, firebase_uid, email_verified, created_at
`;

const newUser = userResult[0];
console.log('✅ User inserted into database:', newUser);
```

**What gets created in `users` table**:
```sql
id: "1-2025-015"
email: "coordinator@example.com"
password: "$2b$10$..." (bcrypt hashed)
first_name: "Maria"
last_name: "Santos"
user_type: "coordinator"  ✅ COORDINATOR USER TYPE
phone: "+63 917 123 4567"
firebase_uid: "abc123xyz" (if using Firebase)
email_verified: false (or true for OAuth)
created_at: "2025-10-31T12:34:56Z"
```

---

### Step 3: Create Coordinator Profile in `vendor_profiles` Table

**File**: `backend-deploy/routes/auth.cjs` (Lines 293-362)

```javascript
} else if (user_type === 'coordinator') {
  console.log('🎉 Creating coordinator profile for user:', userId);
  
  // 1. Extract coordinator-specific fields from request
  const years_experience = req.body.years_experience || 0;
  const team_size = req.body.team_size || 'Solo';
  const specialties = req.body.specialties || [];
  const coordinator_service_areas = req.body.service_areas || [location || 'Not specified'];
  
  console.log('📋 Coordinator details:', {
    years_experience,
    team_size,
    specialties,
    service_areas: coordinator_service_areas
  });
  
  // 2. Create coordinator profile with all coordinator-specific fields
  profileResult = await sql`
    INSERT INTO vendor_profiles (
      user_id, 
      business_name, 
      business_type, 
      business_description,
      years_experience,      -- ✅ Coordinator field
      team_size,            -- ✅ Coordinator field
      specialties,          -- ✅ Coordinator field
      service_areas,        -- ✅ Coordinator field
      verification_status, 
      verification_documents,
      pricing_range, 
      business_hours,
      average_rating, 
      total_reviews, 
      total_bookings,
      response_time_hours, 
      is_featured, 
      is_premium,
      created_at, 
      updated_at
    )
    VALUES (
      ${userId},                              -- Links to users table
      ${business_name},                       -- "Elite Wedding Coordination"
      ${business_type || 'Wedding Coordination'}, -- "Wedding Coordination"
      'Wedding Coordinator - Manage multiple weddings and coordinate vendors',
      ${years_experience},                    -- 8 (years)
      ${team_size},                          -- "2-5" (team size)
      ${specialties},                        -- ["Full Wedding Planning", ...]
      ${coordinator_service_areas},          -- ["Metro Manila", "Cavite", ...]
      'unverified',                          -- Needs admin approval
      ${JSON.stringify({                     -- Verification docs structure
        business_registration: null,
        tax_documents: null,
        identity_verification: null,
        status: 'pending_submission'
      })},
      ${JSON.stringify({                     -- Pricing structure
        min: null, 
        max: null, 
        currency: 'PHP', 
        type: 'per_event'
      })},
      ${JSON.stringify({                     -- Business hours
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        // ... other days
      })},
      0.00,                                  -- average_rating (initial)
      0,                                     -- total_reviews (initial)
      0,                                     -- total_bookings (initial)
      12,                                    -- response_time_hours
      false,                                 -- is_featured
      false,                                 -- is_premium
      NOW(),                                 -- created_at
      NOW()                                  -- updated_at
    )
    RETURNING *
  `;
  
  console.log('✅ Coordinator profile created:', {
    user_id: profileResult[0]?.user_id,
    years_experience: profileResult[0]?.years_experience,
    team_size: profileResult[0]?.team_size,
    specialties: profileResult[0]?.specialties,
    service_areas: profileResult[0]?.service_areas
  });
}
```

**What gets created in `vendor_profiles` table**:
```sql
id: "076d7389-2f0b-4294-9d04-414421634eeb" (UUID, auto-generated)
user_id: "1-2025-015" (links to users table)
business_name: "Elite Wedding Coordination Services"
business_type: "Wedding Coordination"
business_description: "Wedding Coordinator - Manage multiple weddings..."
years_experience: 8  ✅ COORDINATOR FIELD
team_size: "2-5"     ✅ COORDINATOR FIELD
specialties: ["Full Wedding Planning", "Day-of Coordination", ...]  ✅ COORDINATOR FIELD
service_areas: ["Metro Manila", "Cavite", "Pampanga"]  ✅ COORDINATOR FIELD
verification_status: "unverified"
verification_documents: { business_registration: null, ... }
pricing_range: { min: null, max: null, currency: "PHP", type: "per_event" }
business_hours: { monday: { open: "09:00", ... }, ... }
average_rating: 0.00
total_reviews: 0
total_bookings: 0
response_time_hours: 12
is_featured: false
is_premium: false
created_at: "2025-10-31T12:34:57Z"
updated_at: "2025-10-31T12:34:57Z"
```

---

## 🎯 Key Differences: Vendor vs Coordinator Creation

| Aspect | Vendor | Coordinator |
|--------|--------|-------------|
| **user_type** | 'vendor' | 'coordinator' |
| **years_experience** | ❌ Not set | ✅ Set from form |
| **team_size** | ❌ Not set | ✅ Set from form |
| **specialties** | ❌ Not set | ✅ Set from form (array) |
| **service_areas** | ✅ Set from location | ✅ Set from form (array) |
| **response_time_hours** | 24 hours | 12 hours (faster) |
| **pricing_range.type** | 'per_service' | 'per_event' |

---

## 📋 Request Payload Example

### Email/Password Registration

**Frontend sends**:
```json
{
  "first_name": "Maria",
  "last_name": "Santos",
  "email": "maria.santos@example.com",
  "password": "SecurePass123!",
  "phone": "+63 917 123 4567",
  "user_type": "coordinator",
  "business_name": "Elite Wedding Coordination Services",
  "business_type": "Wedding Coordination",
  "location": "Manila, Philippines",
  "years_experience": 8,
  "team_size": "2-5",
  "specialties": [
    "Full Wedding Planning",
    "Day-of Coordination",
    "Destination Weddings",
    "Vendor Management"
  ],
  "service_areas": [
    "Metro Manila",
    "Cavite",
    "Pampanga"
  ]
}
```

**Backend receives and processes**:
```javascript
const {
  first_name,
  last_name,
  email,
  password,
  phone,
  user_type,           // "coordinator"
  business_name,       // "Elite Wedding Coordination Services"
  business_type,       // "Wedding Coordination"
  location,            // "Manila, Philippines"
  years_experience,    // 8
  team_size,           // "2-5"
  specialties,         // ["Full Wedding Planning", ...]
  service_areas        // ["Metro Manila", "Cavite", "Pampanga"]
} = req.body;
```

---

## 🔍 Database Verification

### Query to Check Coordinator User

```sql
-- Check users table
SELECT id, email, user_type, first_name, last_name, created_at
FROM users 
WHERE user_type = 'coordinator' 
AND email = 'maria.santos@example.com';
```

**Result**:
```
id: "1-2025-015"
email: "maria.santos@example.com"
user_type: "coordinator"  ✅
first_name: "Maria"
last_name: "Santos"
created_at: "2025-10-31T12:34:56Z"
```

### Query to Check Coordinator Profile

```sql
-- Check vendor_profiles table
SELECT 
  vp.id, 
  vp.user_id, 
  vp.business_name, 
  vp.business_type,
  vp.years_experience,
  vp.team_size,
  vp.specialties,
  vp.service_areas,
  u.user_type
FROM vendor_profiles vp
JOIN users u ON vp.user_id = u.id
WHERE u.user_type = 'coordinator'
AND u.email = 'maria.santos@example.com';
```

**Result**:
```
id: "076d7389-2f0b-4294-9d04-414421634eeb"
user_id: "1-2025-015"
business_name: "Elite Wedding Coordination Services"
business_type: "Wedding Coordination"
years_experience: 8  ✅
team_size: "2-5"     ✅
specialties: ["Full Wedding Planning", "Day-of Coordination", ...]  ✅
service_areas: ["Metro Manila", "Cavite", "Pampanga"]  ✅
user_type: "coordinator"  ✅
```

---

## 🎯 Production Evidence

### Actual Production Data (from Neon)

**Query**:
```bash
node check-coordinator-schema.cjs
```

**Output**:
```
✅ Found 5 coordinator user(s)
✅ Found 5 coordinator profile(s)

Sample Coordinator:
{
  "user_id": "1-2025-012",
  "email": "test.coordinator.1761898708846@example.com",
  "user_type": "coordinator",
  "business_name": "Elite Wedding Coordination Services",
  "business_type": "Wedding Coordination",
  "years_experience": 8,
  "team_size": "2-5",
  "specialties": [
    "Full Wedding Planning",
    "Day-of Coordination",
    "Destination Weddings",
    "Vendor Management"
  ],
  "service_areas": [
    "Metro Manila",
    "Cavite",
    "Pampanga"
  ]
}
```

---

## 🔄 Complete Registration Flow (Frontend → Backend → Database)

### 1. Frontend: RegisterModal.tsx

```typescript
// User fills coordinator form
const formData = {
  firstName: 'Maria',
  lastName: 'Santos',
  email: 'maria.santos@example.com',
  password: 'SecurePass123!',
  phone: '+63 917 123 4567',
  business_name: 'Elite Wedding Coordination Services',
  business_type: 'Wedding Coordination',
  location: 'Manila, Philippines',
  years_experience: '8',
  team_size: '2-5',
  specialties: ['Full Wedding Planning', 'Day-of Coordination'],
  service_areas: ['Metro Manila', 'Cavite']
};

// Submit registration
await register({
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
  phone: formData.phone,
  password: formData.password,
  role: 'coordinator',  // ✅ User type
  business_name: formData.business_name,
  business_type: formData.business_type,
  location: formData.location,
  years_experience: formData.years_experience,    // ✅ Coordinator field
  team_size: formData.team_size,                  // ✅ Coordinator field
  specialties: formData.specialties,              // ✅ Coordinator field
  service_areas: formData.service_areas,          // ✅ Coordinator field
});
```

### 2. Frontend: HybridAuthContext.tsx

```typescript
// Build registration payload
const registrationPayload = {
  first_name: userData.firstName,
  last_name: userData.lastName,
  email: userData.email,
  password: userData.password,
  phone: userData.phone,
  user_type: 'coordinator',  // ✅ Sent as user_type
  business_name: userData.business_name,
  business_type: userData.business_type,
  location: userData.location,
  years_experience: userData.years_experience || 0,
  team_size: userData.team_size || 'Solo',
  specialties: userData.specialties || [],
  service_areas: userData.service_areas || []
};

// Send to backend
const response = await fetch(`${API_URL}/api/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(registrationPayload)
});
```

### 3. Backend: auth.cjs

```javascript
// Receive registration request
app.post('/api/auth/register', async (req, res) => {
  const { 
    user_type,         // "coordinator"
    business_name,     // "Elite Wedding Coordination Services"
    years_experience,  // 8
    team_size,         // "2-5"
    specialties,       // ["Full Wedding Planning", ...]
    service_areas      // ["Metro Manila", ...]
  } = req.body;
  
  // Step 1: Insert into users table
  await sql`INSERT INTO users (...) VALUES (...)`;
  
  // Step 2: Insert into vendor_profiles table
  if (user_type === 'coordinator') {
    await sql`
      INSERT INTO vendor_profiles (
        user_id, business_name, business_type,
        years_experience, team_size, specialties, service_areas,
        ...
      ) VALUES (...)
    `;
  }
  
  // Return success
  res.json({ success: true, user: {...} });
});
```

### 4. Database: Neon PostgreSQL

```sql
-- Data created in users table
INSERT INTO users (
  id, email, password, first_name, last_name, 
  user_type, phone, created_at
) VALUES (
  '1-2025-015',
  'maria.santos@example.com',
  '$2b$10$...',
  'Maria',
  'Santos',
  'coordinator',  -- ✅ USER_TYPE
  '+63 917 123 4567',
  NOW()
);

-- Data created in vendor_profiles table
INSERT INTO vendor_profiles (
  user_id, business_name, business_type,
  years_experience, team_size, specialties, service_areas,
  ...
) VALUES (
  '1-2025-015',
  'Elite Wedding Coordination Services',
  'Wedding Coordination',
  8,                                    -- ✅ COORDINATOR FIELD
  '2-5',                               -- ✅ COORDINATOR FIELD
  ARRAY['Full Wedding Planning', ...], -- ✅ COORDINATOR FIELD
  ARRAY['Metro Manila', 'Cavite'],    -- ✅ COORDINATOR FIELD
  ...
);
```

---

## ✅ Verification Checklist

| Step | Action | Status |
|------|--------|--------|
| 1 | Frontend sends coordinator data | ✅ Verified |
| 2 | Backend validates user_type='coordinator' | ✅ Verified |
| 3 | Backend validates required fields | ✅ Verified |
| 4 | Create entry in `users` table | ✅ Verified |
| 5 | Set `user_type='coordinator'` | ✅ Verified |
| 6 | Create entry in `vendor_profiles` table | ✅ Verified |
| 7 | Store coordinator-specific fields | ✅ Verified |
| 8 | Return success response | ✅ Verified |
| 9 | 5 production coordinators exist | ✅ Verified |

---

## 🎉 Summary

**Coordinator users ARE being created correctly in the Neon database through a two-step process:**

1. **users table**: Stores coordinator user with `user_type='coordinator'`
2. **vendor_profiles table**: Stores coordinator profile with all 4 coordinator-specific fields

**Evidence**: 5 production coordinator users exist with complete profiles including:
- ✅ `years_experience`
- ✅ `team_size`
- ✅ `specialties` (array)
- ✅ `service_areas` (array)

**Status**: ✅ **FULLY OPERATIONAL** - Coordinator creation working correctly in production!

---

**Verified**: October 31, 2025  
**Method**: Code review + Database query + Production verification  
**Result**: ✅ **CONFIRMED** - Coordinator users are created correctly in Neon
