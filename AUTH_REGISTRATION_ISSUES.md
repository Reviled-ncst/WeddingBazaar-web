# 🚨 CRITICAL: Authentication & Registration Issues

**Date**: November 3, 2025  
**Status**: 🔥 **URGENT FIX REQUIRED**  
**Severity**: HIGH - Blocking user registration

---

## 🔍 IDENTIFIED PROBLEMS

### **Problem 1: Field Name Mismapping** ❌

**Location**: `AuthContext.tsx` line ~414-423

```typescript
const backendUserData = {
  first_name: userData.firstName,      // ✅ Correct
  last_name: userData.lastName,         // ✅ Correct
  email: userData.email,                // ✅ Correct
  password: userData.password,          // ✅ Correct
  user_type: userData.role,             // ✅ Correct
  phone: userData.phone,                // ✅ Correct
  // Vendor fields
  business_name: userData.business_name, // ✅ Correct
  business_type: userData.business_type, // ✅ Correct
  location: userData.location            // ✅ Correct
};
```

**❌ MISSING FIELDS:**
- ❌ `years_experience` (coordinator)
- ❌ `team_size` (coordinator)
- ❌ `specialties` (coordinator)
- ❌ `service_areas` (coordinator)
- ❌ `vendor_type` (business/freelancer)
- ❌ `receiveUpdates` (all users)

---

### **Problem 2: RegisterData Interface Incomplete** ❌

**Location**: `AuthContext.tsx` line ~23-35

```typescript
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'couple' | 'vendor';  // ❌ Missing 'coordinator'!
  phone?: string;
  // Vendor-specific fields
  business_name?: string;
  business_type?: string;
  location?: string;
  receiveUpdates?: boolean;
  [key: string]: any; // ❌ Dangerous catch-all
}
```

**Issues:**
1. `role` doesn't include `'coordinator'`
2. Missing coordinator-specific fields
3. Missing `vendor_type` field
4. Using `[key: string]: any` hides bugs

---

### **Problem 3: RegisterModal Not Sending All Data** ❌

**Location**: `RegisterModal.tsx` line ~206-222

```tsx
await register({
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
  phone: formData.phone,
  password: formData.password,
  role: userType,  // 'couple' | 'vendor' | 'coordinator'
  
  // Vendor fields (if vendor or coordinator)
  ...((userType === 'vendor' || userType === 'coordinator') && {
    business_name: formData.business_name,
    business_type: formData.business_type,
    location: formData.location,
  }),
  
  // ❌ COORDINATOR FIELDS ARE MISSING HERE!
  // Should include: years_experience, team_size, specialties, service_areas
  
  receiveUpdates: formData.receiveUpdates,
});
```

**Fix Applied (line ~220-226):**
```tsx
// 🎯 FIX: Include coordinator-specific fields
...(userType === 'coordinator' && {
  years_experience: formData.years_experience,
  team_size: formData.team_size,
  specialties: formData.specialties,
  service_areas: formData.service_areas,
}),
```

---

### **Problem 4: Backend Not Receiving Coordinator Data** ❌

**Location**: Backend `/api/auth/register` endpoint

**Current Backend Expects:**
```javascript
{
  first_name,
  last_name,
  email,
  password,
  user_type,      // 'couple' | 'vendor'
  phone,
  business_name,  // vendor only
  business_type,  // vendor only
  location        // vendor only
}
```

**❌ Missing Fields:**
- `years_experience`
- `team_size`
- `specialties` (array)
- `service_areas` (array)
- `vendor_type` ('business' | 'freelancer')

---

## 🛠️ COMPREHENSIVE FIX

### **Step 1: Fix AuthContext Interface**

**File**: `src/shared/contexts/AuthContext.tsx`

```typescript
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'couple' | 'vendor' | 'coordinator';  // ✅ Add coordinator
  phone?: string;
  
  // Vendor/Coordinator Business Info
  business_name?: string;
  business_type?: string;
  location?: string;
  vendor_type?: 'business' | 'freelancer';  // ✅ NEW
  
  // Coordinator-specific
  years_experience?: string;
  team_size?: string;
  specialties?: string[];
  service_areas?: string[];
  
  // Preferences
  receiveUpdates?: boolean;
}
```

---

### **Step 2: Fix AuthContext register() Function**

**File**: `src/shared/contexts/AuthContext.tsx` (line ~414)

```typescript
const register = async (userData: RegisterData): Promise<void> => {
  try {
    setIsLoading(true);
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const fullUrl = `${apiBaseUrl}/api/auth/register`;
    
    // Map frontend field names to backend field names
    const backendUserData = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      password: userData.password,
      user_type: userData.role, // 'couple' | 'vendor' | 'coordinator'
      phone: userData.phone,
      
      // Vendor/Coordinator Business Info
      business_name: userData.business_name,
      business_type: userData.business_type,
      location: userData.location,
      vendor_type: userData.vendor_type,  // ✅ NEW
      
      // Coordinator-specific fields
      years_experience: userData.years_experience,  // ✅ NEW
      team_size: userData.team_size,                // ✅ NEW
      specialties: userData.specialties,            // ✅ NEW
      service_areas: userData.service_areas,        // ✅ NEW
      
      // Preferences
      receive_updates: userData.receiveUpdates
    };
    
    console.log('📦 [AuthContext] Sending registration data:', backendUserData);
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendUserData),
    });
    
    // ... rest of the function
  }
};
```

---

### **Step 3: Update Backend Registration Endpoint**

**File**: `backend-deploy/routes/auth.cjs`

**Current Issues:**
1. Doesn't handle `coordinator` user type
2. Doesn't save coordinator-specific fields
3. Doesn't save `vendor_type` field

**Required Changes:**

```javascript
router.post('/register', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      user_type,     // 'couple' | 'vendor' | 'coordinator'
      phone,
      business_name,
      business_type,
      location,
      vendor_type,   // ✅ NEW: 'business' | 'freelancer'
      
      // ✅ NEW: Coordinator fields
      years_experience,
      team_size,
      specialties,
      service_areas,
      
      receive_updates
    } = req.body;
    
    // Validate user_type
    if (!['couple', 'vendor', 'coordinator'].includes(user_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }
    
    // Create user in users table
    const userResult = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
      VALUES (${email}, ${hashedPassword}, ${first_name}, ${last_name}, ${user_type}, ${phone})
      RETURNING *
    `;
    
    const user = userResult[0];
    
    // If vendor or coordinator, create vendor_profiles entry
    if (user_type === 'vendor' || user_type === 'coordinator') {
      await sql`
        INSERT INTO vendor_profiles (
          user_id, 
          business_name, 
          business_type, 
          vendor_type,        -- ✅ NEW
          service_area,
          years_experience,   -- ✅ NEW (coordinator)
          team_size,          -- ✅ NEW (coordinator)
          specialties,        -- ✅ NEW (coordinator)
          service_areas       -- ✅ NEW (coordinator)
        ) VALUES (
          ${user.id},
          ${business_name},
          ${business_type},
          ${vendor_type || 'business'},  -- ✅ Default to 'business'
          ${location},
          ${years_experience || null},
          ${team_size || null},
          ${specialties || []},
          ${service_areas || []}
        )
      `;
    }
    
    // Return success with user data
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        vendorId: (user_type === 'vendor' || user_type === 'coordinator') ? user.id : null
      },
      token: generateJWT(user),
      message: 'Registration successful'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});
```

---

## 🎯 IMMEDIATE ACTION ITEMS

### **Priority 1: Fix AuthContext** (15 mins)
- [ ] Update `RegisterData` interface
- [ ] Add missing fields to `register()` function
- [ ] Test locally

### **Priority 2: Fix Backend** (30 mins)
- [ ] Update `auth.cjs` register endpoint
- [ ] Handle coordinator user type
- [ ] Save all coordinator fields
- [ ] Test with Postman/curl

### **Priority 3: Test Registration** (30 mins)
- [ ] Test couple registration
- [ ] Test vendor registration (business)
- [ ] Test vendor registration (freelancer)
- [ ] Test coordinator registration
- [ ] Verify all fields are saved

### **Priority 4: Deploy** (15 mins)
- [ ] Commit changes
- [ ] Push to GitHub
- [ ] Verify Render auto-deploy
- [ ] Test in production

---

## 📝 VERIFICATION CHECKLIST

After fixes applied:

```bash
# 1. Register as Coordinator
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Coordinator",
    "email": "coord@test.com",
    "password": "test123",
    "user_type": "coordinator",
    "business_name": "Test Coordination",
    "business_type": "Full-Service Wedding Planner",
    "location": "Manila",
    "vendor_type": "freelancer",
    "years_experience": "5",
    "team_size": "3",
    "specialties": ["Cultural Weddings", "Destination Weddings"],
    "service_areas": ["Metro Manila", "Luzon"]
  }'

# 2. Check database
SELECT * FROM users WHERE email = 'coord@test.com';
SELECT * FROM vendor_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'coord@test.com');

# 3. Verify all fields are populated
```

---

## 🚀 ESTIMATED TIME TO FIX

- **Frontend (AuthContext)**: 15 minutes
- **Backend (auth.cjs)**: 30 minutes
- **Testing**: 30 minutes
- **Deployment**: 15 minutes
- **Total**: **~90 minutes** (1.5 hours)

---

**Ready to implement these fixes?** 🛠️
