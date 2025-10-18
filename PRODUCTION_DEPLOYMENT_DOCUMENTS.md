# 🚀 Production Deployment - Admin Documents API

## 📋 Pre-Deployment Checklist

### Backend Changes
- [x] Created `/api/admin/documents` endpoints
- [x] Created `/api/admin/documents/stats` endpoint
- [x] Fixed database queries (vendor_profiles + users JOIN)
- [x] Tested locally - returns 2 real documents
- [x] All changes committed to main branch

### Frontend Changes
- [x] Changed default filter from 'pending' to 'all'
- [x] Fixed stats to fetch from dedicated endpoint
- [x] Disabled mock data toggles
- [x] Updated `.env.production` with all toggles
- [x] Tested locally - documents display correctly
- [x] All changes committed to main branch

---

## 🎯 Deployment Steps

### Step 1: Backend Deployment (Render)

#### A. Push to GitHub (Triggers Auto-Deploy)
```powershell
# Already done! Your latest commits will trigger Render deploy
git log --oneline -5
```

Your recent commits:
- `0ffa4bd` - docs: Add document filter fix documentation
- `c8f3d27` - fix: Change default document filter from 'pending' to 'all'
- `c4ac655` - docs: Add complete admin documents API documentation
- Backend documents API implementation

#### B. Monitor Render Deployment
1. Go to: https://dashboard.render.com/
2. Select: `weddingbazaar-web` service
3. Check "Events" tab for deployment progress
4. Wait for: "Deploy live" (usually 2-3 minutes)

#### C. Verify Backend API
```powershell
# Test production documents endpoint
curl https://weddingbazaar-web.onrender.com/api/admin/documents

# Test stats endpoint
curl https://weddingbazaar-web.onrender.com/api/admin/documents/stats

# Test health check
curl https://weddingbazaar-web.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "documents": [...],
  "count": 2
}
```

---

### Step 2: Frontend Deployment (Firebase Hosting)

#### A. Build Production Frontend
```powershell
# Clean previous builds
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Build with production environment
npm run build
```

Expected output:
```
✓ built in 15.2s
dist/index.html                   X.XX kB
dist/assets/index-XXXXXXXX.js     XXX.XX kB
```

#### B. Deploy to Firebase
```powershell
# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Expected output:
```
=== Deploying to 'weddingbazaarph'...
✔  Deploy complete!
Project Console: https://console.firebase.google.com/project/weddingbazaarph
Hosting URL: https://weddingbazaar-web.web.app
```

#### C. Verify Frontend Deployment
1. Open: https://weddingbazaar-web.web.app
2. Login with admin credentials
3. Go to: Admin Panel > Document Verification
4. Verify: Should see 2 approved documents

---

## ✅ Post-Deployment Verification

### Backend API Tests
```powershell
# 1. Health check
curl https://weddingbazaar-web.onrender.com/api/health
# Expected: {"status":"ok","database":"connected"}

# 2. Documents API
curl https://weddingbazaar-web.onrender.com/api/admin/documents
# Expected: {"success":true,"documents":[...],"count":2}

# 3. Stats API
curl https://weddingbazaar-web.onrender.com/api/admin/documents/stats
# Expected: {"success":true,"stats":{"total":2,"approved":2,...}}

# 4. Admin health
curl https://weddingbazaar-web.onrender.com/api/admin/health
# Expected: {"success":true,"modules":{"users":"active","bookings":"active","documents":"active"}}
```

### Frontend Verification
- [ ] Homepage loads: https://weddingbazaar-web.web.app
- [ ] Can login successfully
- [ ] Admin dashboard accessible
- [ ] Document Verification page loads
- [ ] Shows 2 approved documents
- [ ] Stats show: Total: 2, Approved: 2
- [ ] Filter buttons work (All, Pending, Approved, Rejected)
- [ ] Can view document details
- [ ] Document images load from Cloudinary
- [ ] Search functionality works
- [ ] No console errors

### Admin Panel Features
- [ ] **User Management**: Shows users (mock or real)
- [ ] **Bookings**: Shows bookings (mock or real)
- [ ] **Documents**: Shows 2 real documents from database ✅
- [ ] **Statistics**: All cards display correct numbers
- [ ] **Navigation**: Sidebar works correctly
- [ ] **Responsive**: Works on mobile/tablet/desktop

---

## 🔧 Environment Variables (Production)

### Render (Backend)
Verify these are set in Render dashboard:

```bash
DATABASE_URL=postgresql://weddingbazaar_owner:...@ep-rough-boat-a1b2c3d4.ap-southeast-1.aws.neon.tech/weddingbazaar?sslmode=require
JWT_SECRET=your-secret-key
BCRYPT_ROUNDS=12
NODE_ENV=production
PORT=3001
CORS_ORIGINS=https://weddingbazaar-web.web.app,https://weddingbazaarph.firebaseapp.com
```

### Firebase (Frontend)
Already configured in `.env.production`:

```bash
VITE_API_URL=https://weddingbazaar-web.onrender.com
VITE_USE_MOCK_BOOKINGS=false
VITE_USE_MOCK_USERS=false
VITE_USE_MOCK_DOCUMENTS=false
VITE_USE_MOCK_VERIFICATIONS=false
```

---

## 📊 What's New in Production

### New Features Deployed
1. **Admin Documents API** (Backend)
   - GET `/api/admin/documents` - List all documents
   - GET `/api/admin/documents/stats` - Statistics
   - GET `/api/admin/documents/:id` - Document details
   - PATCH `/api/admin/documents/:id/status` - Update status

2. **Document Verification UI** (Frontend)
   - Default filter set to "All" (shows all documents)
   - Stats fetched from dedicated endpoint
   - Displays 2 real approved documents from database
   - Search and filter functionality
   - Modern glassmorphism design

3. **Database Integration**
   - Real vendor documents from `vendor_documents` table
   - Joined with `vendor_profiles` for business info
   - Joined with `users` for contact details
   - 2 approved business licenses visible

---

## 🐛 Troubleshooting

### Backend Issues

#### Render Deploy Fails
1. Check Render logs: https://dashboard.render.com/
2. Look for errors in build or start logs
3. Common issues:
   - Missing environment variables
   - Database connection errors
   - Module import errors

#### API Returns 500 Error
```powershell
# Check Render logs
# Common causes:
# - Database connection issue
# - Missing columns in query
# - Authentication errors
```

### Frontend Issues

#### Build Fails
```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force node_modules, dist, .vite
npm install
npm run build
```

#### Documents Not Showing
1. Check browser console for errors
2. Verify API URL: `https://weddingbazaar-web.onrender.com`
3. Check network tab for failed requests
4. Verify backend is responding: `curl https://weddingbazaar-web.onrender.com/api/health`

#### CORS Errors
- Verify `CORS_ORIGINS` in Render includes both Firebase URLs:
  - `https://weddingbazaar-web.web.app`
  - `https://weddingbazaarph.firebaseapp.com`

---

## 📈 Monitoring

### Backend Monitoring (Render)
- **Dashboard**: https://dashboard.render.com/
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, response times
- **Health**: Automatic health checks

### Frontend Monitoring (Firebase)
- **Console**: https://console.firebase.google.com/
- **Hosting**: Bandwidth, requests, storage usage
- **Analytics**: Page views, user engagement

### Database Monitoring (Neon)
- **Console**: https://console.neon.tech/
- **Connections**: Active connections
- **Queries**: Query performance
- **Storage**: Database size

---

## 🎉 Success Criteria

### ✅ Deployment Complete When:
- [ ] Render shows "Deploy live" for backend
- [ ] Firebase shows "Deploy complete!" for frontend
- [ ] All API endpoints return 200 status
- [ ] Frontend loads without errors
- [ ] Admin can login successfully
- [ ] Document Verification shows 2 documents
- [ ] All stats display correctly
- [ ] No console errors in browser
- [ ] Mobile responsive design works

---

## 🔄 Rollback Plan (If Needed)

### Backend Rollback
1. Go to Render dashboard
2. Select previous deployment
3. Click "Rollback to this deploy"

### Frontend Rollback
```powershell
# Revert to previous commit
git revert HEAD
git push origin main

# Rebuild and redeploy
npm run build
firebase deploy --only hosting
```

---

## 📝 Deployment Log

### Deployed Components
- ✅ Backend: Admin Documents API
- ✅ Frontend: Document Verification UI fix
- ✅ Database: Using real vendor_documents data
- ✅ Environment: Production configs updated

### API Endpoints Added
- `GET /api/admin/documents`
- `GET /api/admin/documents/stats`
- `GET /api/admin/documents/:id`
- `PATCH /api/admin/documents/:id/status`

### Files Modified
- `backend-deploy/routes/admin/documents.cjs` (new)
- `backend-deploy/routes/admin/index.cjs` (updated)
- `src/pages/users/admin/documents/DocumentVerification.tsx` (updated)
- `.env.production` (updated)

---

## 📚 Documentation

All documentation available in repository:
- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `ADMIN_DOCUMENTS_API_COMPLETE.md` - Documents API docs
- `DOCUMENT_FILTER_FIX.md` - Filter fix documentation
- `ENV_VARIABLES_QUICK_REF.md` - Environment variables
- `PRODUCTION_STATUS.md` - Current production status

---

## 🎯 Next Steps After Deployment

1. **Monitor Logs**: Watch Render and Firebase for any errors
2. **Test Thoroughly**: Verify all admin features work
3. **User Testing**: Have team test document verification
4. **Performance**: Monitor API response times
5. **Backup**: Ensure database backups are running
6. **Documentation**: Update production status docs

---

**Deployment Date**: January 2025  
**Deployed By**: Wedding Bazaar Dev Team  
**Version**: 1.2.0 (Admin Documents API)  
**Status**: 🚀 Ready to Deploy
