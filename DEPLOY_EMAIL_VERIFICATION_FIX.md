# Deployment Plan - Email Verification Fix

## Status: Ready to Deploy ✅

## Changes Made

### 1. Backend Changes
- **File:** `backend-deploy/routes/auth.cjs`
- **Change 1:** Fixed registration logic to NOT auto-verify email/password users
- **Change 2:** Added new endpoint `POST /api/auth/sync-firebase-verification`
- **Impact:** New registrations will require email verification

### 2. Frontend Changes
- **File:** `src/shared/contexts/HybridAuthContext.tsx`
- **Change:** Added automatic sync when Firebase email verification is detected
- **Impact:** Users who verify email will get backend status updated automatically

### 3. Documentation
- **File:** `EMAIL_VERIFICATION_FIX_COMPLETE.md` - Complete explanation
- **File:** `check-user-verification.cjs` - Testing script

## Deployment Steps

### Step 1: Test Backend Changes Locally
```bash
# Check if backend server is running
curl http://localhost:3001/api/health

# If not running, start it:
cd backend-deploy
npm start
```

### Step 2: Deploy Backend to Production
```powershell
# Deploy backend to Render
git add backend-deploy/routes/auth.cjs
git commit -m "fix: Email verification only for OAuth, email/password requires verification"
git push origin main

# Render will auto-deploy from GitHub
# Monitor at: https://dashboard.render.com
```

### Step 3: Deploy Frontend to Production
```powershell
# Build frontend with changes
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Or use deployment script
.\deploy-frontend.ps1
```

### Step 4: Verify Deployment
```bash
# Check backend health
curl https://weddingbazaar-web.onrender.com/api/health

# Check new endpoint exists
curl -X POST https://weddingbazaar-web.onrender.com/api/auth/sync-firebase-verification \
  -H "Content-Type: application/json" \
  -d '{"firebase_uid":"test","email_verified":true}'
# Should return 404 (user not found) but endpoint works

# Check frontend
# Visit: https://weddingbazaar-web.web.app
```

### Step 5: Test New Registration Flow
1. **Register New User:**
   - Go to https://weddingbazaar-web.web.app
   - Click "Register"
   - Fill out form with NEW email (not used before)
   - Submit registration

2. **Check Database:**
   ```bash
   node check-user-verification.cjs
   ```
   - New user should show `email_verified: false`

3. **Verify Email:**
   - Check email inbox
   - Click Firebase verification link
   - Return to app
   - Click "I've verified my email" button

4. **Check Database Again:**
   ```bash
   node check-user-verification.cjs
   ```
   - Same user should now show `email_verified: true`

## Expected Behavior After Deployment

### For New Email/Password Users
- ✅ Registration creates account with `email_verified=false`
- ✅ Firebase sends verification email
- ✅ User sees "Please verify your email" prompt
- ✅ User clicks link in email (Firebase confirms)
- ✅ User clicks "I've verified" button in app
- ✅ Backend syncs and sets `email_verified=true`
- ✅ User gets full access to features

### For OAuth Users (Google/Facebook)
- ✅ Registration creates account with `email_verified=true` immediately
- ✅ No verification email needed
- ✅ User has full access immediately

### For Existing Users
- ⚠️ Existing users with Firebase UID will remain as `email_verified=true`
- ⚠️ To require verification: Run SQL update (see below)

## Optional: Force Existing Users to Verify

**⚠️ WARNING: This will require ALL existing email/password users to re-verify their email**

```sql
-- Mark all email/password users as unverified
UPDATE users 
SET email_verified = false, updated_at = NOW()
WHERE firebase_uid IS NOT NULL 
  AND (
    SELECT COUNT(*) FROM oauth_providers 
    WHERE oauth_providers.user_id = users.id
  ) = 0;
```

**DO NOT RUN THIS unless you want to require re-verification!**

## Rollback Plan

If something goes wrong:

### Rollback Backend
```powershell
# Revert the commit
git revert HEAD
git push origin main

# Or manually restore old code:
# In auth.cjs, change line 216 back to:
const isFirebaseVerified = firebase_uid ? true : false;
```

### Rollback Frontend
```powershell
# Revert the commit
git revert HEAD

# Rebuild and redeploy
npm run build
firebase deploy --only hosting
```

## Post-Deployment Monitoring

### Check Logs
```bash
# Backend logs (Render dashboard)
# https://dashboard.render.com/web/srv-XXX/logs

# Frontend logs (Browser console)
# Check for "✅ Firebase email verification synced" messages
```

### Monitor User Issues
- Check if new users report verification problems
- Monitor support tickets for "can't verify email" issues
- Check database for users stuck in unverified state

## Success Criteria

- ✅ New email/password registrations have `email_verified=false`
- ✅ OAuth registrations have `email_verified=true`
- ✅ Email verification flow works end-to-end
- ✅ Backend sync endpoint responds correctly
- ✅ No errors in production logs
- ✅ Users can verify and access features

## Timeline

- **Code Changes:** ✅ COMPLETE
- **Backend Deployment:** 🔄 READY TO DEPLOY
- **Frontend Deployment:** 🔄 READY TO DEPLOY
- **Testing:** 🔄 AFTER DEPLOYMENT
- **Monitoring:** 🔄 24-48 HOURS

---

**Created:** October 25, 2025
**Status:** READY FOR DEPLOYMENT
**Risk Level:** LOW (only affects new registrations)
**Rollback:** Easy (git revert)
