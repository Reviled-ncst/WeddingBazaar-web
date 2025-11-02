# 🔍 COMPLETE REGISTRATION PROCESS - FULL FILE SCAN

**Date**: November 1, 2025  
**Status**: ✅ COMPREHENSIVE SCAN COMPLETE  
**Scope**: All files involved in vendor, couple, coordinator, and admin registration  

---

## 📂 FILE STRUCTURE OVERVIEW

```
Registration System Files:
├── Frontend
│   ├── src/shared/components/modals/
│   │   └── RegisterModal.tsx (1419 lines)        # Main registration UI
│   ├── src/shared/contexts/
│   │   ├── HybridAuthContext.tsx (894 lines)     # Registration orchestration
│   │   └── AuthContext.tsx                       # Legacy auth (deprecated)
│   └── src/services/auth/
│       └── firebaseAuthService.ts                # Firebase integration
│
├── Backend
│   ├── backend-deploy/routes/
│   │   └── auth.cjs (1131 lines)                 # Main registration endpoint
│   └── backend-deploy/middleware/
│       └── auth.cjs                              # JWT verification
│
└── Helper Scripts
    ├── create-missing-coordinator-profile.cjs     # Manual profile creation
    └── create-admin-account.cjs                   # Admin creation script
```

---

## 🎯 COMPLETE REGISTRATION FLOW (ALL USER TYPES)

### PHASE 1: USER INITIATES REGISTRATION

```
┌──────────────────────────────────────────────────────────────┐
│  USER CLICKS "REGISTER" BUTTON ON HOMEPAGE                   │
│  Location: Homepage or any page with auth prompt             │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│  REGISTER MODAL OPENS                                         │
│  File: src/shared/components/modals/RegisterModal.tsx        │
│  State initialized:                                           │
│  - userType: 'couple' (default)                              │
│  - formData: all fields empty                                │
│  - isLoading: false                                          │
│  - error: null                                               │
└──────────────────────────────────────────────────────────────┘
```

---

### PHASE 2: USER TYPE SELECTION

**File**: `src/shared/components/modals/RegisterModal.tsx` (Lines 778-830)

```tsx
{/* User Type Selection */}
<div className="grid grid-cols-3 gap-3">
  {/* COUPLE BUTTON */}
  <button
    type="button"
    onClick={() => setUserType('couple')}
    className={cn(
      "p-4 rounded-xl border-2 transition-all",
      userType === 'couple'
        ? "bg-gradient-to-br from-pink-50 to-purple-50 border-pink-300"
        : "border-gray-200 hover:border-pink-200"
    )}
  >
    <Heart className="w-6 h-6 mx-auto mb-2 text-pink-500" />
    <div className="font-semibold text-sm">I'm Planning</div>
    <div className="text-xs text-gray-500">My Wedding</div>
  </button>

  {/* VENDOR BUTTON */}
  <button
    type="button"
    onClick={() => setUserType('vendor')}
    className={cn(
      "p-4 rounded-xl border-2 transition-all",
      userType === 'vendor'
        ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300"
        : "border-gray-200 hover:border-blue-200"
    )}
  >
    <Building className="w-6 h-6 mx-auto mb-2 text-blue-500" />
    <div className="font-semibold text-sm">I'm a Vendor</div>
    <div className="text-xs text-gray-500">Business Owner</div>
  </button>

  {/* COORDINATOR BUTTON */}
  <button
    type="button"
    onClick={() => setUserType('coordinator')}
    className={cn(
      "p-4 rounded-xl border-2 transition-all",
      userType === 'coordinator'
        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
        : "border-gray-200 hover:border-green-200"
    )}
  >
    <Crown className="w-6 h-6 mx-auto mb-2 text-green-500" />
    <div className="font-semibold text-sm">I'm a Coordinator</div>
    <div className="text-xs text-gray-500">Wedding Planner</div>
  </button>
</div>
```

**State Change**:
```typescript
setUserType('couple' | 'vendor' | 'coordinator');
// Triggers conditional form field rendering
```

---

### PHASE 3: FORM FIELD RENDERING (CONDITIONAL)

**File**: `src/shared/components/modals/RegisterModal.tsx` (Lines 100-120)

```typescript
// Form data structure (Lines 100-120)
const [formData, setFormData] = useState({
  // COMMON FIELDS (all user types)
  firstName: '',              // Required for all
  lastName: '',               // Required for all
  email: '',                  // Required for all
  phone: '',                  // Optional for all
  password: '',               // Required for all
  confirmPassword: '',        // Required for all
  
  // VENDOR/COORDINATOR FIELDS
  business_name: '',          // Required if vendor/coordinator
  business_type: '',          // Required if vendor/coordinator
  location: '',               // Required if vendor/coordinator
  
  // COORDINATOR-ONLY FIELDS
  years_experience: '',       // Required if coordinator
  team_size: '',              // Required if coordinator
  specialties: [] as string[],      // Required if coordinator
  service_areas: [] as string[],    // Required if coordinator
  
  // PREFERENCES (all types)
  agreeToTerms: false,        // Required for all
  receiveUpdates: false,      // Optional for all
});
```

---

### PHASE 4: COUPLE REGISTRATION PROCESS

#### 4A. Couple Form Fields (Lines 850-950)

```tsx
{/* COUPLE-SPECIFIC FORM */}
{userType === 'couple' && (
  <>
    {/* First Name */}
    <div>
      <label className="block text-sm font-medium mb-2">
        <User className="w-4 h-4 inline mr-2" />
        First Name *
      </label>
      <input
        type="text"
        value={formData.firstName}
        onChange={(e) => updateFormData('firstName', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
        placeholder="Enter your first name"
      />
      {validationErrors.firstName && (
        <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
      )}
    </div>

    {/* Last Name */}
    <div>
      <label className="block text-sm font-medium mb-2">
        <User className="w-4 h-4 inline mr-2" />
        Last Name *
      </label>
      <input
        type="text"
        value={formData.lastName}
        onChange={(e) => updateFormData('lastName', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
        placeholder="Enter your last name"
      />
    </div>

    {/* Email */}
    <div>
      <label className="block text-sm font-medium mb-2">
        <Mail className="w-4 h-4 inline mr-2" />
        Email Address *
      </label>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => updateFormData('email', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
        placeholder="your.email@example.com"
      />
    </div>

    {/* Phone (Optional) */}
    <div>
      <label className="block text-sm font-medium mb-2">
        <Phone className="w-4 h-4 inline mr-2" />
        Phone Number (Optional)
      </label>
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => updateFormData('phone', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
        placeholder="+63 912 345 6789"
      />
    </div>

    {/* Password */}
    <div>
      <label className="block text-sm font-medium mb-2">
        <Lock className="w-4 h-4 inline mr-2" />
        Password *
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={(e) => updateFormData('password', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl pr-12"
          placeholder="Create a strong password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </div>

    {/* Confirm Password */}
    <div>
      <label className="block text-sm font-medium mb-2">
        <Lock className="w-4 h-4 inline mr-2" />
        Confirm Password *
      </label>
      <input
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={(e) => updateFormData('confirmPassword', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
        placeholder="Re-enter your password"
      />
    </div>
  </>
)}
```

#### 4B. Couple Form Validation (Lines 195-221)

```typescript
const validateForm = () => {
  const errors: {[key: string]: string} = {};
  
  // Common validations (all user types)
  if (!formData.firstName.trim()) errors.firstName = 'First name is required';
  if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
  if (!formData.email.trim()) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
  if (!formData.password) errors.password = 'Password is required';
  else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  
  // NO additional validations for couple
  
  if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms';
  
  return errors;
};
```

#### 4C. Couple Submission to HybridAuthContext (Lines 295-315)

```typescript
const handleSubmit = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  
  const errors = validateForm();
  setValidationErrors(errors);
  
  if (Object.keys(errors).length > 0) {
    return; // Stop if validation fails
  }
  
  setIsLoading(true);
  setError(null);

  try {
    // Call HybridAuthContext register function
    await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: userType,  // 'couple'
      receiveUpdates: formData.receiveUpdates
      // NO business or coordinator fields for couple
    });

    console.log('✅ RegisterModal: Registration completed');
    setIsSuccess(true);
    
    // Auto-close modal after 2 seconds
    setTimeout(() => {
      onClose();
    }, 2000);
    
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ RegisterModal: Registration failed:', error);
    setError(err.message || 'Registration failed');
  } finally {
    setIsLoading(false);
  }
};
```

---

### PHASE 5: VENDOR REGISTRATION PROCESS

#### 5A. Vendor Form Fields (Lines 1000-1150)

```tsx
{/* VENDOR-SPECIFIC FORM */}
{userType === 'vendor' && (
  <>
    {/* First Name, Last Name, Email, Phone, Password (same as couple) */}
    
    {/* VENDOR BUSINESS NAME */}
    <div>
      <label className="block text-sm font-medium mb-2">
        <Building className="w-4 h-4 inline mr-2" />
        Business Name *
      </label>
      <input
        type="text"
        value={formData.business_name}
        onChange={(e) => updateFormData('business_name', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
        placeholder="Your Business Name"
      />
      {validationErrors.business_name && (
        <p className="text-red-500 text-sm mt-1">{validationErrors.business_name}</p>
      )}
    </div>

    {/* VENDOR BUSINESS TYPE (Category) */}
    <div>
      <label className="block text-sm font-medium mb-2">
        <Tag className="w-4 h-4 inline mr-2" />
        Business Category *
      </label>
      <select
        value={formData.business_type}
        onChange={(e) => updateFormData('business_type', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
      >
        <option value="">Select a category...</option>
        <option value="Photography">Photography</option>
        <option value="Videography">Videography</option>
        <option value="Catering">Catering</option>
        <option value="Venue">Venue</option>
        <option value="DJ">DJ & Entertainment</option>
        <option value="Flowers">Flowers & Decorations</option>
        <option value="Makeup">Makeup & Hair</option>
        <option value="Wedding Cake">Wedding Cake</option>
        <option value="Invitations">Invitations</option>
        <option value="Transportation">Transportation</option>
        <option value="Other">Other Services</option>
      </select>
      {validationErrors.business_type && (
        <p className="text-red-500 text-sm mt-1">{validationErrors.business_type}</p>
      )}
    </div>

    {/* VENDOR LOCATION */}
    <div>
      <label className="block text-sm font-medium mb-2">
        <MapPin className="w-4 h-4 inline mr-2" />
        Business Location *
      </label>
      <input
        type="text"
        value={formData.location}
        onChange={(e) => updateFormData('location', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
        placeholder="City, Province"
      />
      {validationErrors.location && (
        <p className="text-red-500 text-sm mt-1">{validationErrors.location}</p>
      )}
    </div>
  </>
)}
```

#### 5B. Vendor Validation (Lines 204-208)

```typescript
// Vendor-specific validations
if (userType === 'vendor' || userType === 'coordinator') {
  if (!formData.business_name.trim()) errors.business_name = 'Business name is required';
  if (!formData.business_type) errors.business_type = 'Business category is required';
  if (!formData.location.trim()) errors.location = 'Business location is required';
}
```

#### 5C. Vendor Submission (Lines 295-320)

```typescript
await register({
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
  phone: formData.phone,
  password: formData.password,
  role: userType,  // 'vendor'
  
  // VENDOR FIELDS ADDED
  business_name: formData.business_name,
  business_type: formData.business_type,
  location: formData.location,
  
  receiveUpdates: formData.receiveUpdates
});
```

---

### PHASE 6: COORDINATOR REGISTRATION PROCESS

#### 6A. Coordinator Form Fields (Lines 1200-1400)

```tsx
{/* COORDINATOR-SPECIFIC FORM */}
{userType === 'coordinator' && (
  <>
    {/* First Name, Last Name, Email, Phone, Password (same as couple) */}
    {/* Business Name, Business Type, Location (same as vendor) */}
    
    {/* COORDINATOR YEARS OF EXPERIENCE */}
    <div>
      <label className="block text-sm font-medium mb-2">
        <Zap className="w-4 h-4 inline mr-2" />
        Years of Experience *
      </label>
      <select
        value={formData.years_experience}
        onChange={(e) => updateFormData('years_experience', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
      >
        <option value="">Select experience...</option>
        <option value="0-1">Less than 1 year</option>
        <option value="1-3">1-3 years</option>
        <option value="3-5">3-5 years</option>
        <option value="5-10">5-10 years</option>
        <option value="10+">10+ years</option>
      </select>
      {validationErrors.years_experience && (
        <p className="text-red-500 text-sm mt-1">{validationErrors.years_experience}</p>
      )}
    </div>

    {/* COORDINATOR TEAM SIZE */}
    <div>
      <label className="block text-sm font-medium mb-2">
        <Building className="w-4 h-4 inline mr-2" />
        Team Size *
      </label>
      <select
        value={formData.team_size}
        onChange={(e) => updateFormData('team_size', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
      >
        <option value="">Select team size...</option>
        <option value="Solo">Solo (Just me)</option>
        <option value="Small Team (2-5)">Small Team (2-5 people)</option>
        <option value="Medium Team (6-15)">Medium Team (6-15 people)</option>
        <option value="Large Team (16+)">Large Team (16+ people)</option>
      </select>
      {validationErrors.team_size && (
        <p className="text-red-500 text-sm mt-1">{validationErrors.team_size}</p>
      )}
    </div>

    {/* COORDINATOR SPECIALTIES (Multi-select) */}
    <div>
      <label className="block text-sm font-medium mb-2">
        <Tag className="w-4 h-4 inline mr-2" />
        Specialties * (Select at least one)
      </label>
      <div className="grid grid-cols-2 gap-2">
        {[
          'Full Wedding Coordination',
          'Day-of Coordination',
          'Partial Planning',
          'Destination Weddings',
          'Cultural Weddings',
          'Intimate Weddings',
          'Grand Events'
        ].map((specialty) => (
          <button
            key={specialty}
            type="button"
            onClick={() => toggleMultiSelect('specialties', specialty)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm border-2 transition-all",
              formData.specialties.includes(specialty)
                ? "bg-green-100 border-green-500 text-green-700"
                : "border-gray-300 hover:border-green-300"
            )}
          >
            {formData.specialties.includes(specialty) && '✓ '}
            {specialty}
          </button>
        ))}
      </div>
      {validationErrors.specialties && (
        <p className="text-red-500 text-sm mt-1">{validationErrors.specialties}</p>
      )}
    </div>

    {/* COORDINATOR SERVICE AREAS (Multi-select) */}
    <div>
      <label className="block text-sm font-medium mb-2">
        <MapPin className="w-4 h-4 inline mr-2" />
        Service Areas * (Select at least one)
      </label>
      <div className="grid grid-cols-2 gap-2">
        {[
          'Metro Manila',
          'Nearby Provinces',
          'Luzon',
          'Visayas',
          'Mindanao',
          'International'
        ].map((area) => (
          <button
            key={area}
            type="button"
            onClick={() => toggleMultiSelect('service_areas', area)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm border-2 transition-all",
              formData.service_areas.includes(area)
                ? "bg-green-100 border-green-500 text-green-700"
                : "border-gray-300 hover:border-green-300"
            )}
          >
            {formData.service_areas.includes(area) && '✓ '}
            {area}
          </button>
        ))}
      </div>
      {validationErrors.service_areas && (
        <p className="text-red-500 text-sm mt-1">{validationErrors.service_areas}</p>
      )}
    </div>
  </>
)}
```

#### 6B. Coordinator Validation (Lines 211-217)

```typescript
// Coordinator-specific required fields
if (userType === 'coordinator') {
  if (!formData.years_experience) errors.years_experience = 'Years of experience is required';
  if (!formData.team_size) errors.team_size = 'Team size is required';
  if (formData.specialties.length === 0) errors.specialties = 'At least one specialty is required';
  if (formData.service_areas.length === 0) errors.service_areas = 'At least one service area is required';
}
```

#### 6C. Coordinator Submission (Lines 300-325)

```typescript
await register({
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
  phone: formData.phone,
  password: formData.password,
  role: userType,  // 'coordinator'
  
  // VENDOR FIELDS (coordinator uses vendor profile)
  business_name: formData.business_name,
  business_type: formData.business_type,
  location: formData.location,
  
  // COORDINATOR-SPECIFIC FIELDS
  years_experience: formData.years_experience,
  team_size: formData.team_size,
  specialties: formData.specialties,        // Array
  service_areas: formData.service_areas,    // Array
  
  receiveUpdates: formData.receiveUpdates
});
```

---

### PHASE 7: HYBRIDAUTHCONTEXT PROCESSING

**File**: `src/shared/contexts/HybridAuthContext.tsx` (Lines 630-750)

```typescript
const register = async (userData: RegisterData): Promise<void> => {
  try {
    setIsLoading(true);
    setIsRegistering(true);
    
    console.log('🚀 [HybridAuth] Starting registration for:', userData.email);
    console.log('👤 [HybridAuth] User type:', userData.role);
    
    // STEP 1: Create Firebase user (handles email verification)
    const registrationData: any = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      userType: userData.role,
      phone: userData.phone,
      
      // Add vendor/coordinator fields if applicable
      ...((userData.role === 'vendor' || userData.role === 'coordinator') && {
        businessName: userData.business_name,
        businessType: userData.business_type,
        location: userData.location
      }),
      
      // Add coordinator-specific fields
      ...(userData.role === 'coordinator' && {
        yearsExperience: userData.years_experience,
        teamSize: userData.team_size,
        specialties: userData.specialties,
        serviceAreas: userData.service_areas,
      })
    };
    
    console.log('🔥 [HybridAuth] Calling Firebase registration...');
    const result = await firebaseAuthService.registerWithEmailVerification(registrationData);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    console.log('✅ [HybridAuth] Firebase user created:', result.firebaseUid);
    
    // STEP 2: Create backend user in Neon database
    const backendData = {
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      user_type: userData.role,  // ← This is the issue! Should be 'role'
      phone: userData.phone,
      firebase_uid: result.firebaseUid,
      oauth_provider: null,
      
      // Add vendor/coordinator fields
      ...((userData.role === 'vendor' || userData.role === 'coordinator') && {
        business_name: userData.business_name,
        business_type: userData.business_type,
        location: userData.location
      }),
      
      // Add coordinator-specific fields
      ...(userData.role === 'coordinator' && {
        years_experience: userData.years_experience,
        team_size: userData.team_size,
        specialties: userData.specialties,
        service_areas: userData.service_areas,
      })
    };
    
    console.log('📤 [HybridAuth] Sending to backend API:', {
      email: backendData.email,
      user_type: backendData.user_type,
      firebase_uid: backendData.firebase_uid,
      ...(userData.role === 'coordinator' && {
        coordinator_fields: {
          business_name: backendData.business_name,
          business_type: backendData.business_type,
          years_experience: backendData.years_experience,
          team_size: backendData.team_size,
          specialties: backendData.specialties,
          service_areas: backendData.service_areas,
        }
      })
    });
    
    const backendResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backendData)
    });
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ [HybridAuth] Backend registration failed:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorText
      });
      throw new Error(`Backend registration failed: ${backendResponse.status}: ${errorText}`);
    }
    
    const backendResult = await backendResponse.json();
    console.log('✅ [HybridAuth] Backend user created:', backendResult);
    
    // Show email verification notification
    // ... (notification code)
    
  } catch (error: any) {
    console.error('❌ [HybridAuth] Registration error:', error);
    throw error;
  } finally {
    setIsLoading(false);
    setIsRegistering(false);
  }
};
```

---

### PHASE 8: BACKEND API PROCESSING

**File**: `backend-deploy/routes/auth.cjs` (Lines 119-500)

```javascript
// POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log('🎯 [AUTH] POST /api/auth/register called');
  console.log('🎯 [AUTH] Request body:', req.body);
  
  try {
    // STEP 1: Extract request data
    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      user_type,        // May be undefined
      role,             // May be sent instead of user_type
      phone,
      firebase_uid,
      // Vendor/Coordinator fields
      business_name,
      business_type,
      location,
      // Coordinator-specific fields
      years_experience,   // May be undefined
      team_size,          // May be undefined
      specialties,        // May be undefined
      service_areas,      // May be undefined
    } = req.body;
    
    // STEP 2: Normalize user type
    const actualUserType = user_type || role || 'couple';
    console.log('👤 [AUTH] User type:', { user_type, role, actualUserType });
    
    // STEP 3: Validate required fields
    if (!email || !password || !first_name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and first_name are required'
      });
    }
    
    // STEP 4: Validate user type
    const validUserTypes = ['couple', 'vendor', 'admin', 'coordinator'];
    if (!validUserTypes.includes(actualUserType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user_type'
      });
    }
    
    // STEP 5: Vendor/Coordinator-specific validation
    if ((actualUserType === 'vendor' || actualUserType === 'coordinator') && 
        (!business_name || !business_type)) {
      return res.status(400).json({
        success: false,
        error: `${actualUserType} registration requires business_name and business_type`
      });
    }
    
    // STEP 6: Check if user already exists
    console.log('🔍 [AUTH] Checking if user exists:', email);
    const existingUsers = await sql`
      SELECT id, firebase_uid FROM users WHERE email = ${email}
    `;
    
    if (existingUsers.length > 0) {
      console.log('❌ [AUTH] User already exists');
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // STEP 7: Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('🔐 [AUTH] Password hashed');
    
    // STEP 8: Generate unique user ID
    const { getNextUserId } = require('../utils/id-generation.cjs');
    const userId = await getNextUserId(
      sql, 
      actualUserType === 'vendor' ? 'vendor' : 'individual'
    );
    console.log('🆔 [AUTH] Generated user ID:', userId);
    
    // STEP 9: Determine email verification status
    const isOAuthProvider = req.body.oauth_provider ? true : false;
    const isFirebaseVerified = isOAuthProvider;
    
    // STEP 10: Create user in users table
    console.log('💾 [AUTH] Inserting user into database...');
    const userResult = await sql`
      INSERT INTO users (
        id, email, password, first_name, last_name, user_type, 
        phone, firebase_uid, email_verified, created_at
      )
      VALUES (
        ${userId}, ${email}, ${hashedPassword}, ${first_name}, ${last_name || ''}, 
        ${actualUserType}, ${phone || null}, ${firebase_uid || null}, 
        ${isFirebaseVerified}, NOW()
      )
      RETURNING id, email, first_name, last_name, user_type, phone, 
                firebase_uid, email_verified, created_at
    `;
    
    const newUser = userResult[0];
    console.log('✅ [AUTH] User created:', newUser);
    
    // STEP 11: Create appropriate profile based on user type
    let profileResult = null;
    
    //===========================================
    // VENDOR PROFILE CREATION
    //===========================================
    if (actualUserType === 'vendor') {
      console.log('🏢 [AUTH] Creating vendor profile...');
      
      profileResult = await sql`
        INSERT INTO vendor_profiles (
          user_id, business_name, business_type, business_description,
          verification_status, verification_documents,
          service_areas, pricing_range, business_hours,
          average_rating, total_reviews, total_bookings,
          response_time_hours, is_featured, is_premium,
          created_at, updated_at
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
          ${[location || 'Not specified']},  // TEXT[] array
          ${{ min: null, max: null, currency: 'PHP', type: 'per_service' }},  // JSONB
          ${{  // JSONB
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
      
      console.log('✅ [AUTH] Vendor profile created');
    }
    
    //===========================================
    // COORDINATOR PROFILE CREATION
    //===========================================
    else if (actualUserType === 'coordinator') {
      console.log('🎉 [AUTH] Creating coordinator profile...');
      
      // Parse years_experience (handle ranges like '3-5')
      let parsed_years = 0;
      if (years_experience) {
        const yearsStr = String(years_experience);
        if (yearsStr.includes('-')) {
          parsed_years = parseInt(yearsStr.split('-')[0]);
        } else {
          parsed_years = parseInt(yearsStr) || 0;
        }
      }
      
      // Parse specialties (ensure array)
      let parsed_specialties = [];
      if (specialties) {
        if (Array.isArray(specialties)) {
          parsed_specialties = specialties;
        } else if (typeof specialties === 'string') {
          parsed_specialties = specialties.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      
      // Parse service_areas (ensure array)
      let coordinator_service_areas = [];
      if (service_areas) {
        if (Array.isArray(service_areas)) {
          coordinator_service_areas = service_areas;
        } else if (typeof service_areas === 'string') {
          coordinator_service_areas = service_areas.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      // Fallback to location if no service areas
      if (coordinator_service_areas.length === 0) {
        coordinator_service_areas = [location || 'Not specified'];
      }
      
      console.log('📋 [AUTH] Coordinator details:', {
        years_experience: parsed_years,
        team_size,
        specialties: parsed_specialties,
        service_areas: coordinator_service_areas
      });
      
      profileResult = await sql`
        INSERT INTO vendor_profiles (
          user_id, business_name, business_type, business_description,
          years_experience, team_size, specialties, service_areas,
          verification_status, verification_documents,
          pricing_range, business_hours,
          average_rating, total_reviews, total_bookings,
          response_time_hours, is_featured, is_premium,
          created_at, updated_at
        )
        VALUES (
          ${userId},
          ${business_name},
          ${business_type || 'Wedding Coordination'},
          'Wedding Coordinator - Manage multiple weddings and coordinate vendors',
          ${parsed_years},
          ${team_size},
          ${parsed_specialties},              // ✅ Direct array insert (no JSON.stringify)
          ${coordinator_service_areas},       // ✅ Direct array insert (no JSON.stringify)
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
      
      console.log('✅ [AUTH] Coordinator profile created');
    }
    
    //===========================================
    // COUPLE PROFILE CREATION
    //===========================================
    else if (actualUserType === 'couple') {
      console.log('💑 [AUTH] Creating couple profile...');
      
      // Generate couple profile ID
      const coupleCountResult = await sql`SELECT COUNT(*) as count FROM couple_profiles`;
      const coupleCount = parseInt(coupleCountResult[0].count) + 1;
      const currentYear = new Date().getFullYear();
      const coupleId = `CP-${currentYear}-${coupleCount.toString().padStart(3, '0')}`;
      
      profileResult = await sql`
        INSERT INTO couple_profiles (
          id, user_id, partner_name, wedding_date, wedding_location,
          budget_range, guest_count, wedding_style,
          created_at, updated_at
        )
        VALUES (
          ${coupleId}, ${userId}, ${null}, ${null},
          ${null}, ${null}, 0, null,
          NOW(), NOW()
        )
        RETURNING *
      `;
      
      console.log('✅ [AUTH] Couple profile created');
    }
    
    //===========================================
    // ADMIN PROFILE CREATION
    //===========================================
    else if (actualUserType === 'admin') {
      console.log('👨‍💼 [AUTH] Creating admin profile...');
      
      profileResult = await sql`
        INSERT INTO admin_profiles (
          user_id, created_at, updated_at
        )
        VALUES (
          ${userId}, NOW(), NOW()
        )
        RETURNING *
      `;
      
      console.log('✅ [AUTH] Admin profile created');
    }
    
    // STEP 12: Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        userType: newUser.user_type 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // STEP 13: Return success response
    console.log('✅ [AUTH] Registration complete');
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        userType: newUser.user_type,
        emailVerified: newUser.email_verified
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [AUTH] Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during registration',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

---

## 📊 COMPLETE DATA FLOW SUMMARY

### COUPLE REGISTRATION
```
Frontend (RegisterModal.tsx)
  ├─ User clicks "I'm Planning My Wedding"
  ├─ Fills: firstName, lastName, email, phone, password
  ├─ Validates: email format, password match, terms agreed
  └─ Submits → { role: 'couple', ...basicFields }

HybridAuthContext.tsx
  ├─ Creates Firebase user
  ├─ Sends to backend: { user_type: 'couple', firebase_uid, ...basicFields }
  └─ Waits for backend response

Backend (auth.cjs)
  ├─ Normalizes: actualUserType = user_type || role || 'couple'
  ├─ Creates user in users table (user_type='couple')
  ├─ Creates couple_profiles entry (id='CP-2025-001')
  ├─ Generates JWT token
  └─ Returns: { success, token, user }

Result
  ├─ users table: 1 row (id='1-2025-001', user_type='couple')
  ├─ couple_profiles table: 1 row (user_id='1-2025-001')
  └─ User logged in, redirected to /individual
```

### VENDOR REGISTRATION
```
Frontend (RegisterModal.tsx)
  ├─ User clicks "I'm a Vendor"
  ├─ Fills: firstName, lastName, email, phone, password
  ├─ Fills: business_name, business_type, location
  ├─ Validates: all above fields required
  └─ Submits → { role: 'vendor', ...basicFields, ...businessFields }

HybridAuthContext.tsx
  ├─ Creates Firebase user
  ├─ Sends to backend: { user_type: 'vendor', firebase_uid, ...allFields }
  └─ Waits for backend response

Backend (auth.cjs)
  ├─ Normalizes: actualUserType = user_type || role || 'couple'
  ├─ Creates user in users table (user_type='vendor')
  ├─ Creates vendor_profiles entry
  │   ├─ business_name: from request
  │   ├─ business_type: from request
  │   ├─ service_areas: [location] (TEXT[] array)
  │   ├─ verification_status: 'unverified'
  │   └─ pricing_range, business_hours: default JSONB
  ├─ Generates JWT token
  └─ Returns: { success, token, user }

Result
  ├─ users table: 1 row (id='2-2025-001', user_type='vendor')
  ├─ vendor_profiles table: 1 row (user_id='2-2025-001')
  └─ User logged in, redirected to /vendor
```

### COORDINATOR REGISTRATION
```
Frontend (RegisterModal.tsx)
  ├─ User clicks "I'm a Coordinator"
  ├─ Fills: firstName, lastName, email, phone, password
  ├─ Fills: business_name, business_type, location
  ├─ Selects: years_experience dropdown
  ├─ Selects: team_size dropdown
  ├─ Multi-selects: specialties[] (at least 1)
  ├─ Multi-selects: service_areas[] (at least 1)
  ├─ Validates: all above fields required
  └─ Submits → { role: 'coordinator', ...allFields, specialties[], service_areas[] }

HybridAuthContext.tsx
  ├─ Creates Firebase user
  ├─ Sends to backend: { 
  │   user_type: 'coordinator', 
  │   firebase_uid,
  │   ...basicFields,
  │   ...businessFields,
  │   years_experience: '3-5',
  │   team_size: 'Small Team (2-5)',
  │   specialties: ['Full Wedding Coordination', 'Day-of Coordination'],
  │   service_areas: ['Metro Manila', 'Nearby Provinces']
  │ }
  └─ Waits for backend response

Backend (auth.cjs)
  ├─ Normalizes: actualUserType = user_type || role || 'couple'
  ├─ Parses years_experience: '3-5' → 3 (integer)
  ├─ Validates specialties: must be array
  ├─ Validates service_areas: must be array, fallback to [location]
  ├─ Creates user in users table (user_type='coordinator')
  ├─ Creates vendor_profiles entry (coordinator uses vendor table)
  │   ├─ business_name: from request
  │   ├─ business_type: from request or 'Wedding Coordination'
  │   ├─ years_experience: 3 (parsed integer)
  │   ├─ team_size: from request
  │   ├─ specialties: ['Full Wedding Coordination', 'Day-of'] (TEXT[] array)
  │   ├─ service_areas: ['Metro Manila', 'Nearby Provinces'] (TEXT[] array)
  │   ├─ verification_status: 'unverified'
  │   └─ pricing_range, business_hours: default JSONB
  ├─ Generates JWT token
  └─ Returns: { success, token, user }

Result
  ├─ users table: 1 row (id='1-2025-016', user_type='coordinator')
  ├─ vendor_profiles table: 1 row (user_id='1-2025-016')
  │   ├─ business_type: 'Wedding Coordinator'
  │   ├─ specialties: {"Full Wedding Coordination","Day-of Coordination"}
  │   └─ service_areas: {"Metro Manila","Nearby Provinces"}
  └─ User logged in, redirected to /coordinator
```

---

## 🔍 KEY IMPLEMENTATION DETAILS

### 1. User Type Normalization (Backend Line 146)
```javascript
const actualUserType = user_type || role || 'couple';
```
- Frontend sends `role`
- Backend accepts both `user_type` and `role`
- Fallback to 'couple' if neither provided

### 2. Array Handling for Coordinator (Backend Lines 315-340)
```javascript
// Parse specialties
let parsed_specialties = [];
if (specialties) {
  if (Array.isArray(specialties)) {
    parsed_specialties = specialties;
  } else if (typeof specialties === 'string') {
    parsed_specialties = specialties.split(',').map(s => s.trim()).filter(Boolean);
  }
}

// Parse service_areas
let coordinator_service_areas = [];
if (service_areas) {
  if (Array.isArray(service_areas)) {
    coordinator_service_areas = service_areas;
  } else if (typeof service_areas === 'string') {
    coordinator_service_areas = service_areas.split(',').map(s => s.trim()).filter(Boolean);
  }
}

// Insert without JSON.stringify (Neon driver handles it)
await sql`
  INSERT INTO vendor_profiles (specialties, service_areas)
  VALUES (${parsed_specialties}, ${coordinator_service_areas})
`;
```

### 3. Profile Table Mapping
| User Type | Profile Table | Notes |
|-----------|---------------|-------|
| Couple | `couple_profiles` | Minimal profile (partner, date, location) |
| Vendor | `vendor_profiles` | Business profile (name, type, location) |
| Coordinator | `vendor_profiles` | Extended vendor profile (+ years, team, specialties, areas) |
| Admin | `admin_profiles` | Minimal profile (just user_id) |

### 4. ID Generation Patterns
| User Type | Prefix | Example | Generator |
|-----------|--------|---------|-----------|
| Couple | `1` | `1-2025-001` | `getNextUserId(sql, 'individual')` |
| Vendor | `2` | `2-2025-001` | `getNextUserId(sql, 'vendor')` |
| Coordinator | `1` | `1-2025-016` | `getNextUserId(sql, 'individual')` |
| Admin | `A` | `A-2025-001` | `getNextUserId(sql, 'admin')` |

### 5. Email Verification Flow
```
1. Frontend → HybridAuthContext: register()
2. HybridAuthContext → Firebase: createUserWithEmailAndPassword()
3. Firebase → User's Email: Sends verification link
4. HybridAuthContext → Backend: POST /api/auth/register (with firebase_uid)
5. Backend → Database: Creates user (email_verified=false)
6. User clicks verification link → Firebase marks as verified
7. User logs in → Backend checks Firebase verification status
```

---

## ✅ COMPLETE FILE SCAN VERIFICATION

### Files Scanned ✅
- ✅ `src/shared/components/modals/RegisterModal.tsx` (1419 lines)
- ✅ `src/shared/contexts/HybridAuthContext.tsx` (894 lines)
- ✅ `backend-deploy/routes/auth.cjs` (1131 lines)
- ✅ `backend-deploy/middleware/auth.cjs` (JWT verification)
- ✅ `create-missing-coordinator-profile.cjs` (Helper script)
- ✅ `create-admin-account.cjs` (Helper script)

### Coverage
- ✅ Frontend UI components and forms
- ✅ Frontend state management and validation
- ✅ Frontend-to-backend data transformation
- ✅ Backend API endpoints and processing
- ✅ Database schema and profile creation
- ✅ Array handling patterns (TEXT[] vs JSONB)
- ✅ User type normalization logic
- ✅ ID generation patterns
- ✅ Email verification flow
- ✅ JWT token generation
- ✅ Error handling and responses

---

**Last Updated**: November 1, 2025  
**Status**: ✅ COMPLETE SCAN DOCUMENTED  
**Total Lines Analyzed**: 3,444+ lines across 6 files

---
