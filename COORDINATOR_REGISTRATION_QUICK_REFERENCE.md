# 🎯 Coordinator Registration - Quick Reference Guide

**Status**: ✅ COMPLETE & WORKING  
**Last Updated**: October 31, 2025

---

## ⚡ Quick Test

```bash
# Run comprehensive end-to-end test
node test-full-coordinator-registration.cjs

# Expected output:
# ✅ TEST 1: API Registration
# ✅ TEST 2: Profile Fetch
# ✅ TEST 3: Database Verification
# 🎉 ALL TESTS PASSED!
```

---

## 📋 Manual Testing Steps

1. **Open Frontend**: https://weddingbazaarph.web.app
2. **Click**: "Register" button
3. **Select**: "Coordinator" role
4. **Fill Form**:
   ```
   Full Name: Your Name
   Email: unique-email@example.com (MUST BE NEW)
   Password: YourSecurePassword123!
   Business Name: Your Wedding Coordination Business
   Business Type: Wedding Coordinator
   Location: Your City, Country
   Specialties: Add 2-3 (e.g., "Full Planning", "Day-of Coordination")
   Services: Add 2-3 (e.g., "Wedding Planning", "Vendor Management")
   ```
5. **Click**: "Create Account"
6. **Expected**: Success modal → Redirect to coordinator dashboard

---

## 🔍 Verification Commands

### Check User in Database
```bash
node check-user-by-email.cjs "email@example.com"
```

### Check Coordinator Profile
```bash
node check-coordinator-profile.cjs "email@example.com"
```

### Check Database Schema
```bash
node check-vendor-profiles-schema.cjs
```

---

## 🛠️ Troubleshooting

### Error: "Email already registered"
**Cause**: Email exists in Firebase or database  
**Solution**: Use a different email or delete the existing account

### Error: Profile not returning coordinator fields
**Cause**: Backend endpoint issue  
**Solution**: Verify backend deployment, check logs

### Error: Database fields not saving
**Cause**: Schema mismatch  
**Solution**: Run schema verification script

---

## 🔗 Important URLs

### Production
- **Frontend**: https://weddingbazaarph.web.app
- **Backend**: https://weddingbazaar-web.onrender.com
- **API Health**: https://weddingbazaar-web.onrender.com/api/health

### API Endpoints
- **Register**: `POST /api/auth/register`
- **Profile**: `GET /api/auth/profile?email=...`
- **Login**: `POST /api/auth/login`

---

## 📊 Field Mappings

### Frontend Form → Backend API
```
fullName          → first_name + last_name
role              → user_type ("coordinator")
businessName      → business_name
businessType      → business_type
location          → service_areas (converted to array)
specialties       → specialties (array)
servicesOffered   → services_offered (array)
```

### Backend Response → Frontend Display
```
first_name        → firstName
last_name         → lastName
user_type         → role
business_name     → businessName
specialties       → specialties
service_areas     → serviceAreas
```

---

## ✅ Success Indicators

### Registration Success
```json
{
  "success": true,
  "message": "User registered successfully...",
  "user": { "id": "...", "user_type": "coordinator" },
  "profile": { "id": "...", "business_name": "..." },
  "token": "eyJ..."
}
```

### Profile Fetch Success
```json
{
  "success": true,
  "user": {
    "role": "coordinator",
    "businessName": "...",
    "specialties": [...],
    "serviceAreas": [...]
  }
}
```

### Database Verification Success
```
✅ Business Name: PASS
✅ Business Type: PASS
✅ Service Areas (array): PASS
✅ Specialties (array): PASS
✅ User ID Match: PASS
```

---

## 📚 Documentation Files

- **Complete Status**: `COORDINATOR_REGISTRATION_COMPLETE_STATUS.md`
- **Success Report**: `COORDINATOR_REGISTRATION_COMPLETE_SUCCESS_REPORT.md`
- **Quick Summary**: `COORDINATOR_REGISTRATION_QUICK_SUMMARY.md`
- **Email Issue**: `EMAIL_ALREADY_REGISTERED_SOLUTION.md`
- **Diagnosis**: `REGISTRATION_ISSUE_COMPLETE_DIAGNOSIS.md`

---

## 🚨 Common Pitfalls

1. **Using Existing Email**: Always use a NEW, UNIQUE email for testing
2. **Field Name Confusion**: Frontend uses camelCase, backend uses snake_case
3. **Empty Arrays**: Specialties and services must have at least one item
4. **Password Strength**: Minimum 6 characters for Firebase
5. **Location Format**: Should be "City, Country" format

---

## 🎯 What's Working

- ✅ User registration via frontend
- ✅ Coordinator profile creation
- ✅ All fields saving to database
- ✅ Profile retrieval with coordinator data
- ✅ JWT authentication
- ✅ Error handling for duplicate emails
- ✅ Array field handling
- ✅ Frontend-backend integration

---

## 📞 Quick Support Commands

### Backend Logs
```bash
# View recent backend logs in Render dashboard
# URL: https://dashboard.render.com
```

### Database Query
```bash
# Connect to Neon database and run:
SELECT * FROM users WHERE user_type = 'coordinator';
SELECT * FROM vendor_profiles WHERE business_type = 'Wedding Coordinator';
```

### Frontend Console
```javascript
// Check auth state in browser console
console.log('Auth user:', firebase.auth().currentUser);
```

---

## 🎉 Success Message

If you see this after testing:

```
🎉 ALL TESTS PASSED! Coordinator registration is working end-to-end.
```

**Congratulations! Everything is working correctly!** 🚀

---

**Quick Test Command**: `node test-full-coordinator-registration.cjs`  
**Expected Result**: All tests pass ✅  
**Next Step**: Test with real email in production
