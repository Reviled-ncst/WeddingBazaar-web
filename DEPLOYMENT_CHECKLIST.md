# 🚀 DEPLOYMENT CHECKLIST
## Wedding Bazaar - Identity Verification System
**Use this checklist to deploy the verification system step-by-step**

---

## ✅ PRE-DEPLOYMENT (15 minutes)

### 1. Verify Files Created
- [ ] `backend-deploy/middleware/auth.cjs` - Authentication middleware
- [ ] `backend-deploy/routes/verification.cjs` - Verification API routes
- [ ] `backend-deploy/services/verificationEmailService.cjs` - Email service
- [ ] `backend-deploy/migrations/001_create_verification_tables.sql` - Database migration
- [ ] `src/shared/components/security/DocumentUploader.tsx` - Document uploader
- [ ] `src/pages/users/admin/verifications/AdminVerificationReview.tsx` - Admin review UI
- [ ] `VERIFICATION_DEPLOYMENT_GUIDE.md` - Deployment guide
- [ ] `VERIFICATION_IMPLEMENTATION_COMPLETE_SUMMARY.md` - Implementation summary
- [ ] `test-verification-system.mjs` - Test script

### 2. Check Dependencies
```bash
# Check backend dependencies
cd backend-deploy
npm list jsonwebtoken bcrypt nodemailer

# Check frontend dependencies
cd ..
npm list tesseract.js
```

Expected output:
- [ ] `jsonwebtoken@^9.0.0` installed
- [ ] `bcrypt@^5.0.0` installed
- [ ] `nodemailer@^6.9.0` installed (or will install next)
- [ ] `tesseract.js@^5.0.0` installed

### 3. Install Missing Dependencies
```bash
cd backend-deploy
npm install nodemailer
npm install  # Install all dependencies
cd ..
```

- [ ] All backend dependencies installed
- [ ] No errors during installation

---

## 📦 BACKEND DEPLOYMENT (30 minutes)

### Step 1: Database Backup (5 minutes)
```bash
# Backup current database
pg_dump $DATABASE_URL > backup_before_verification_$(date +%Y%m%d).sql
```

- [ ] Database backup created
- [ ] Backup file size > 0 bytes
- [ ] Backup location noted: ___________________________

### Step 2: Run Database Migration (5 minutes)
```bash
# Connect to database
psql $DATABASE_URL

# Run migration
\i backend-deploy/migrations/001_create_verification_tables.sql

# Verify tables created
\dt user_verifications
\dt verification_audit_log

# Check new columns in users table
\d users

# Exit psql
\q
```

- [ ] `user_verifications` table created
- [ ] `verification_audit_log` table created
- [ ] `verification_statistics` view created
- [ ] 4 new columns added to `users` table
- [ ] No errors during migration

### Step 3: Verify Migration (5 minutes)
```sql
-- Run these queries to verify
SELECT COUNT(*) FROM user_verifications;
SELECT COUNT(*) FROM verification_audit_log;
SELECT * FROM verification_statistics;
```

Expected results:
- [ ] `user_verifications` table accessible (0 rows initially)
- [ ] `verification_audit_log` table accessible (0 rows initially)
- [ ] `verification_statistics` view shows all zeros

### Step 4: Update Environment Variables (5 minutes)

**In Render Dashboard:**
1. Go to: https://dashboard.render.com
2. Select: weddingbazaar-web
3. Click: Environment
4. Add these variables:

```bash
# Required
JWT_SECRET=<generate-random-32-char-string>

# Optional (for email notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@weddingbazaar.com
EMAIL_PASSWORD=<app-specific-password>
EMAIL_FROM=Wedding Bazaar <noreply@weddingbazaar.com>
FRONTEND_URL=https://weddingbazaar-web.web.app
```

- [ ] `JWT_SECRET` added (32+ characters)
- [ ] Email variables added (optional)
- [ ] `FRONTEND_URL` set to production URL
- [ ] Variables saved in Render

**Generate JWT_SECRET:**
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 32

# Option 3: Use online generator
# Visit: https://generate-secret.vercel.app
```

Paste generated JWT_SECRET here for reference:
```
JWT_SECRET=___________________________________
```

### Step 5: Deploy Backend (10 minutes)
```bash
# Commit changes
git add .
git commit -m "feat: Add identity verification system with JWT auth and admin review"
git push origin main

# Monitor deployment
# Visit: https://dashboard.render.com
# Watch: Deploy logs
```

- [ ] Git commit successful
- [ ] Git push successful
- [ ] Render detected new commit
- [ ] Render deployment started
- [ ] Render deployment completed successfully
- [ ] No errors in deployment logs

### Step 6: Verify Backend Deployment (5 minutes)
```bash
# Test health endpoint
curl https://weddingbazaar-web.onrender.com/api/health

# Test verification routes (should require auth)
curl https://weddingbazaar-web.onrender.com/api/verification/pending
```

Expected results:
- [ ] Health endpoint returns 200 OK
- [ ] Verification endpoints return 401 (auth required) ← This is correct!
- [ ] No 500 errors
- [ ] Backend logs show no errors

---

## 🌐 FRONTEND DEPLOYMENT (20 minutes)

### Step 1: Test Build Locally (5 minutes)
```bash
# Build frontend
npm run build

# Check build output
ls -lh dist/

# Test build locally
npm run preview
# Visit: http://localhost:4173
```

- [ ] Build completed successfully
- [ ] No build errors
- [ ] `dist/` folder created
- [ ] Preview server starts
- [ ] Frontend loads without errors

### Step 2: Deploy to Firebase (5 minutes)
```bash
# Deploy
firebase deploy --only hosting

# Wait for deployment to complete
```

Expected output:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/.../hosting
Hosting URL: https://weddingbazaar-web.web.app
```

- [ ] Firebase deployment started
- [ ] Firebase deployment completed
- [ ] Hosting URL displayed
- [ ] No errors during deployment

### Step 3: Verify Frontend Deployment (5 minutes)

Visit: https://weddingbazaar-web.web.app

- [ ] Homepage loads correctly
- [ ] No console errors
- [ ] Login works
- [ ] Navigation works

### Step 4: Test Verification UI (5 minutes)

**As User:**
1. Login as individual user
2. Go to: Profile → Settings
3. Find "Security" or "Verification" section

- [ ] Can access profile settings
- [ ] Verification section visible
- [ ] "Verify Identity" button present
- [ ] No console errors

**As Admin:**
1. Login as admin user
2. Go to: `/admin/verifications`

- [ ] Can access admin verifications page
- [ ] Page loads without errors
- [ ] No 404 errors
- [ ] UI displays correctly

---

## 🧪 END-TO-END TESTING (20 minutes)

### Test 1: Automated API Tests (5 minutes)
```bash
# Run test script
node test-verification-system.mjs

# For production testing
API_BASE=https://weddingbazaar-web.onrender.com/api node test-verification-system.mjs
```

- [ ] Test script runs
- [ ] Health check passes
- [ ] At least 5/8 tests pass
- [ ] No critical errors

### Test 2: User Document Upload (5 minutes)

**Steps:**
1. Login as user: https://weddingbazaar-web.web.app
2. Go to: Profile → Settings → Security
3. Click: "Verify Identity"
4. Upload test document
5. Review extracted OCR data
6. Submit verification

**Checklist:**
- [ ] Can access verification modal
- [ ] Can upload image
- [ ] OCR processes successfully
- [ ] Extracted data displays
- [ ] Submission successful
- [ ] "Pending Review" status shows
- [ ] Email received (if configured)

### Test 3: Admin Review (5 minutes)

**Steps:**
1. Login as admin: https://weddingbazaar-web.web.app/admin
2. Go to: Verifications page
3. See pending verification from Test 2
4. Click to view details
5. Review document and data
6. Click "Approve"

**Checklist:**
- [ ] Can see pending verification
- [ ] Document image loads
- [ ] OCR data displays
- [ ] User info shows correctly
- [ ] Can add admin notes
- [ ] Approve button works
- [ ] Success message displays
- [ ] Verification removed from pending list

### Test 4: Verify User Status (5 minutes)

**Steps:**
1. Login as user from Test 2
2. Check profile settings
3. Verify status updated

**Checklist:**
- [ ] Verification status changed to "Approved"
- [ ] "Verified" badge displays
- [ ] Email received (if configured)
- [ ] Database updated correctly

**Database Check:**
```sql
-- Check verification record
SELECT * FROM user_verifications WHERE user_id = 'test-user-id';

-- Check audit trail
SELECT * FROM verification_audit_log WHERE user_id = 'test-user-id';

-- Check user status
SELECT 
  email, 
  face_verified, 
  document_verified, 
  is_verified, 
  verification_level 
FROM users 
WHERE id = 'test-user-id';
```

- [ ] Verification status = 'approved'
- [ ] Audit trail has 2+ entries
- [ ] User `is_verified` = true
- [ ] User `verification_level` updated

---

## 📊 POST-DEPLOYMENT MONITORING (24 hours)

### Hour 1: Immediate Checks
- [ ] No 500 errors in backend logs
- [ ] No JavaScript errors in frontend console
- [ ] API response times < 1 second
- [ ] Database queries running successfully

### Hour 6: Performance Check
- [ ] Check verification queue length
- [ ] Monitor API response times
- [ ] Check email delivery (if enabled)
- [ ] Review error logs

### Hour 24: Full Review
- [ ] Count successful verifications
- [ ] Review admin feedback
- [ ] Check rejection reasons
- [ ] Analyze any issues

**Monitoring Commands:**
```bash
# Backend logs
render logs --tail -a weddingbazaar-web

# Database stats
psql $DATABASE_URL -c "SELECT * FROM verification_statistics;"

# Recent verifications
psql $DATABASE_URL -c "SELECT status, COUNT(*) FROM user_verifications GROUP BY status;"
```

---

## 🎉 DEPLOYMENT COMPLETE

### ✅ Success Criteria

All items below should be checked:

- [ ] Database migration successful
- [ ] Backend deployed without errors
- [ ] Frontend deployed without errors
- [ ] API endpoints responding
- [ ] User can upload documents
- [ ] Admin can review verifications
- [ ] Emails sending (if configured)
- [ ] Audit trail logging
- [ ] No critical errors in logs
- [ ] At least one successful verification completed

### 📈 Next Steps

1. **Enable for All Users**
   - [ ] Announce new feature
   - [ ] Update documentation
   - [ ] Add to onboarding flow

2. **Monitor Performance**
   - [ ] Set up alerts for errors
   - [ ] Track verification completion rate
   - [ ] Monitor admin review time

3. **Gather Feedback**
   - [ ] User feedback on process
   - [ ] Admin feedback on review UI
   - [ ] Identify improvement areas

---

## 🆘 TROUBLESHOOTING

### If Tests Fail

**Backend Issues:**
```bash
# Check backend is running
curl https://weddingbazaar-web.onrender.com/api/health

# Check environment variables
# Go to: Render Dashboard → Environment

# Check logs
render logs --tail -a weddingbazaar-web
```

**Frontend Issues:**
```bash
# Check console errors
# Open browser DevTools → Console

# Check build errors
npm run build

# Redeploy if needed
firebase deploy --only hosting
```

**Database Issues:**
```bash
# Verify connection
psql $DATABASE_URL -c "SELECT 1;"

# Check tables exist
psql $DATABASE_URL -c "\dt"

# Re-run migration if needed
psql $DATABASE_URL < backend-deploy/migrations/001_create_verification_tables.sql
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check JWT token is being sent |
| 500 Internal Server Error | Check backend logs for details |
| OCR not working | Verify tesseract.js loaded |
| Emails not sending | Check EMAIL_* environment variables |
| Admin can't approve | Verify user has admin role |

### Get Help

- Documentation: `VERIFICATION_DEPLOYMENT_GUIDE.md`
- Implementation Details: `VERIFICATION_IMPLEMENTATION_COMPLETE_SUMMARY.md`
- Test Verification: `node test-verification-system.mjs`

---

## 📝 DEPLOYMENT NOTES

**Deployed By:** ___________________________  
**Date:** ___________________________  
**Time:** ___________________________  
**Environment:** Production  
**Version:** 1.0.0  

**Issues Encountered:**
```
(Write any issues or notes here)
```

**Resolution:**
```
(Write how issues were resolved)
```

**Final Status:** ✅ SUCCESS / ⚠️ PARTIAL / ❌ FAILED

---

**🎉 Congratulations on deploying the verification system! 🎉**
