# Wedding Bazaar Registration System Documentation

## Overview
The Wedding Bazaar registration system uses a hybrid approach combining Firebase Authentication for email verification and a Neon PostgreSQL database for user profile storage.

## System Architecture

### Frontend Components
- **HybridAuthContext.tsx** - Main authentication context managing Firebase + Neon integration
- **RegisterModal.tsx** - Registration form modal with email verification UI
- **firebaseAuthService.ts** - Firebase authentication service wrapper

### Backend Components
- **backend-deploy/routes/auth.cjs** - Registration endpoint creating users in Neon DB
- **Neon PostgreSQL Database** - Stores user profiles, vendor profiles, couple profiles

## Registration Flow

### Current Working Implementation (Fixed October 16, 2025)

1. **User Submits Registration Form**
   - RegisterModal collects: email, password, firstName, lastName, role, phone
   - For vendors: also collects business_name, business_type, location

2. **Firebase User Creation**
   ```typescript
   // HybridAuthContext.tsx line ~242
   const result = await firebaseAuthService.registerWithEmailVerification(registrationData);
   ```
   - Creates Firebase user account
   - Sends email verification automatically
   - Signs user out immediately (prevents auto-login)

3. **Backend User Creation (Immediate)**
   ```typescript
   // HybridAuthContext.tsx line ~264
   const backendResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(backendData)
   });
   ```
   - Creates user in Neon database immediately
   - Links Firebase UID to backend user
   - Creates appropriate profile (couple/vendor)

4. **User Notification**
   - Shows blue toast notification: "Check Your Email!"
   - DisplaysRegisterModal email verification screen
   - User must verify email before login

## Key Features

### Prevents Auto-Login During Registration
```typescript
// HybridAuthContext.tsx line ~74
const [isRegistering, setIsRegistering] = useState(false);

// Prevents sync during registration
if (!isRegistering) {
  await syncWithBackend(fbUser);
} else {
  console.log('⏸️ Skipping backend sync during registration process');
}
```

### Comprehensive Error Handling
- Firebase failures are caught and logged
- Backend failures throw descriptive errors
- Network issues are handled gracefully
- Detailed console logging for debugging

### Data Storage
- **Firebase**: Handles authentication, email verification
- **Neon DB**: Stores complete user profiles
- **localStorage**: Temporary storage for pending profiles

## Database Schema

### Users Table
```sql
users (
  id VARCHAR PRIMARY KEY,           -- Format: "1-2025-001" or "2-2025-001"
  email VARCHAR UNIQUE,
  password VARCHAR,                 -- bcrypt hashed
  first_name VARCHAR,
  last_name VARCHAR,
  user_type VARCHAR,               -- 'couple', 'vendor', 'admin'
  phone VARCHAR,
  firebase_uid VARCHAR UNIQUE,     -- Links to Firebase
  email_verified BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Vendor Profiles Table
```sql
vendor_profiles (
  user_id VARCHAR REFERENCES users(id),
  business_name VARCHAR,
  business_type VARCHAR,           -- 'Photography', 'Catering', etc.
  business_description TEXT,
  verification_status VARCHAR,     -- 'unverified', 'pending', 'verified'
  service_areas JSONB,
  pricing_range JSONB,
  business_hours JSONB,
  average_rating DECIMAL,
  total_reviews INTEGER,
  created_at TIMESTAMP
)
```

### Couple Profiles Table
```sql
couple_profiles (
  id VARCHAR PRIMARY KEY,          -- Format: "CP-2025-001"
  user_id VARCHAR REFERENCES users(id),
  partner_name VARCHAR,
  wedding_date DATE,
  wedding_location VARCHAR,
  budget_range VARCHAR,
  guest_count INTEGER,
  created_at TIMESTAMP
)
```

## API Endpoints

### Registration Endpoint
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "couple|vendor",
  "phone": "+1234567890",
  "firebase_uid": "firebase-uid-here",
  
  // Vendor-specific fields
  "business_name": "Business Name",
  "business_type": "Photography",
  "location": "City, Country"
}
```

### Response Format
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "1-2025-001",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "couple",
    "firebase_uid": "firebase-uid-here",
    "email_verified": true,
    "created_at": "2025-10-16T04:00:00.000Z"
  },
  "profile": {
    "id": "CP-2025-001",
    "user_id": "1-2025-001",
    "partner_name": null,
    "wedding_date": null,
    "created_at": "2025-10-16T04:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

## Environment Configuration

### Frontend (.env)
```bash
VITE_API_URL=https://weddingbazaar-web.onrender.com
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Backend (.env)
```bash
DATABASE_URL=your-neon-postgres-url
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=10
EMAIL_VERIFICATION_ENABLED=false  # Firebase handles this
```

## Deployment URLs

- **Production Frontend**: https://weddingbazaarph.web.app
- **Production Backend**: https://weddingbazaar-web.onrender.com
- **Database**: Neon PostgreSQL (managed)

## Testing

### Manual Testing Steps
1. Go to https://weddingbazaarph.web.app
2. Click "Sign Up" or "Register"
3. Fill registration form (test with both couple and vendor)
4. Submit form
5. Verify:
   - Blue toast notification appears
   - Email verification screen shows
   - User is not automatically logged in
   - Check console for successful backend creation
   - Check email for Firebase verification link

### Console Logs to Monitor
```
🔧 Starting Firebase-first registration with email verification...
✅ Firebase user created, email verification sent
🏗️ Creating backend user profile immediately...
📡 Making backend request with data: {...}
📨 Backend response received: {status: 200, statusText: "OK"}
✅ Backend profile created during registration: 2-2025-001
📧 User must verify email before they can login
```

## Common Issues & Solutions

### Issue: User Auto-Logs In During Registration
**Solution**: `isRegistering` flag prevents auth state listener from syncing during registration

### Issue: Backend User Not Created
**Solution**: Registration now creates backend user immediately, not after email verification

### Issue: No Email Verification Notification
**Solution**: Blue toast notification shows automatically after successful registration

### Issue: Firebase Configuration Not Found
**Solution**: Verify VITE_FIREBASE_* environment variables are set correctly

## Code Locations

### Key Files
- `src/shared/contexts/HybridAuthContext.tsx` - Main registration logic
- `src/shared/components/modals/RegisterModal.tsx` - Registration form
- `src/services/auth/firebaseAuthService.ts` - Firebase integration
- `backend-deploy/routes/auth.cjs` - Backend registration endpoint

### Key Functions
- `register()` - Main registration function (HybridAuthContext.tsx:233)
- `registerWithEmailVerification()` - Firebase registration (firebaseAuthService.ts:45)
- `syncWithBackend()` - User sync after login (HybridAuthContext.tsx:89)

## Future Improvements

1. **Add Registration Analytics**: Track registration success/failure rates
2. **Implement Rate Limiting**: Prevent spam registrations
3. **Add Phone Verification**: Optional SMS verification for vendors
4. **Enhanced Error Messages**: More specific error messages for users
5. **Registration Progress Indicator**: Show steps in registration process

## Last Updated
October 16, 2025 - Fixed Firebase configuration issue preventing registration completion

### Recent Fixes (October 16, 2025)
- **CRITICAL FIX**: Added missing Firebase environment variables to main `.env` file
- **Enhanced Error Logging**: Added detailed Firebase initialization and error logging
- **Registration Flow**: Now properly shows email verification screen after successful registration
- **Deployment**: Updated production build with Firebase authentication fixes

## Troubleshooting Commands

### Check Backend Health
```bash
curl https://weddingbazaar-web.onrender.com/api/health
```

### Test Registration Endpoint
```bash
curl -X POST https://weddingbazaar-web.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","first_name":"Test","last_name":"User","user_type":"couple","firebase_uid":"test-uid"}'
```

### Build and Deploy
```bash
npm run build
firebase deploy --only hosting
```

---

This documentation serves as a complete reference for the Wedding Bazaar registration system. Keep this updated when making changes to the registration flow.
