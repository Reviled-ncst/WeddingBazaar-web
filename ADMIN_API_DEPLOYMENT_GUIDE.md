# Admin API Deployment Guide

## 🎯 Deployment Status

**Current Status:** ✅ Code Ready, ⏳ Pending Deployment

### What's Complete
- ✅ Admin API modularized into TypeScript modules
- ✅ Integrated into main server file
- ✅ All endpoints defined and functional
- ✅ Database connection properly configured
- ✅ Frontend build successful
- ✅ Test scripts created

### What's Pending
- ⏳ Add authentication middleware (CRITICAL)
- ⏳ Deploy backend to Render
- ⏳ Deploy frontend to Firebase
- ⏳ Test production endpoints
- ⏳ Verify admin panel loads users

---

## 🚀 Deployment Steps

### Step 1: Add Authentication Middleware (CRITICAL!)

Before deploying, you MUST add authentication to protect admin routes.

**Edit `server/index.ts`:**

```typescript
// Add after other imports
import jwt from 'jsonwebtoken';

// Add before mounting admin routes (around line 280)
const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

// Apply middleware to admin routes
app.use('/api/admin', adminAuthMiddleware, adminRoutes);
```

### Step 2: Commit Changes

```bash
# Check what changed
git status

# Add the new admin API files
git add backend/src/api/admin/index.ts
git add backend/src/api/admin/users.ts
git add server/index.ts
git add ADMIN_API_MODULARIZATION_COMPLETE.md
git add ADMIN_API_DEPLOYMENT_GUIDE.md
git add test-admin-api-integration.mjs

# Commit with descriptive message
git commit -m "feat: Modularize admin API with TypeScript support

- Created modular admin API structure in backend/src/api/admin/
- Converted CommonJS modules to TypeScript ES modules
- Integrated admin routes into main server
- Added comprehensive user management endpoints
- Created test scripts and documentation

BREAKING CHANGE: Admin API now requires authentication (to be added)

Endpoints:
- GET /api/admin/health - Health check
- GET /api/admin/users - Get all users with stats
- GET /api/admin/users/stats - Get user statistics
- GET /api/admin/users/:id - Get single user
- POST /api/admin/users - Create user
- PATCH /api/admin/users/:id - Update user
- PATCH /api/admin/users/:id/status - Update user status
- DELETE /api/admin/users/:id - Delete user (soft delete)

Refs: #admin-api-modularization"
```

### Step 3: Push to GitHub

```bash
# Push to main branch (will trigger Render deployment)
git push origin main
```

### Step 4: Monitor Render Deployment

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your `weddingbazaar-web` service
3. Watch the build logs for:
   - ✅ Build started
   - ✅ Installing dependencies
   - ✅ Building TypeScript
   - ✅ Deployment successful

**Expected Build Time:** 3-5 minutes

### Step 5: Test Production Backend

Once deployed, test the endpoints:

```bash
# Test health endpoint
curl https://weddingbazaar-web.onrender.com/api/admin/health

# Expected response:
# {
#   "success": true,
#   "message": "Admin API is running",
#   "timestamp": "2025-10-18T...",
#   "modules": {
#     "users": "active"
#   }
# }
```

### Step 6: Deploy Frontend to Firebase

```bash
# Build production frontend
npm run build:prod

# Deploy to Firebase
firebase deploy --only hosting

# Or use the quick deploy script
npm run deploy:quick
```

### Step 7: Test Frontend Integration

1. Open admin panel: `https://weddingbazaar-web.web.app/admin/users`
2. Login as admin user
3. Check if users are displayed
4. Check browser console for errors

**Expected Result:**
- ✅ Users table populated with data
- ✅ Stats cards show correct counts
- ✅ No console errors

---

## 🧪 Testing Checklist

### Backend Tests (Production)

```bash
# 1. Health check
curl https://weddingbazaar-web.onrender.com/api/admin/health

# 2. Users endpoint (will require auth)
curl https://weddingbazaar-web.onrender.com/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 3. User stats
curl https://weddingbazaar-web.onrender.com/api/admin/users/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 4. Single user
curl https://weddingbazaar-web.onrender.com/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Frontend Tests

1. **Admin Login**
   - [ ] Can login as admin
   - [ ] Token stored correctly
   - [ ] Redirects to admin dashboard

2. **User Management Page**
   - [ ] Users table loads
   - [ ] Stats cards show correct data
   - [ ] Search works
   - [ ] Filters work (role, status)
   - [ ] View user modal opens
   - [ ] Edit user works
   - [ ] Update status works
   - [ ] Delete user works

3. **Error Handling**
   - [ ] Shows error if API fails
   - [ ] Shows loading state
   - [ ] Handles 401 (unauthorized)
   - [ ] Handles 403 (forbidden)
   - [ ] Handles 500 (server error)

---

## 🐛 Troubleshooting

### Issue: "Cannot GET /api/admin/health"

**Cause:** Admin routes not mounted correctly

**Solution:**
1. Check `server/index.ts` has: `app.use('/api/admin', adminRoutes);`
2. Check import: `import adminRoutes from '../backend/src/api/admin/index';`
3. Restart server

### Issue: "Module not found: '../backend/src/api/admin/index'"

**Cause:** TypeScript file not being compiled or imported correctly

**Solution:**
1. Check file exists: `backend/src/api/admin/index.ts`
2. Check file exports: `export default router;`
3. Check import path is correct
4. Clear node_modules and reinstall

### Issue: "401 Unauthorized" on all admin endpoints

**Cause:** Authentication middleware blocking requests

**Solution:**
1. Make sure you're sending `Authorization: Bearer TOKEN` header
2. Check token is valid: `jwt.verify(token, process.env.JWT_SECRET)`
3. Check user role is 'admin' in token payload
4. For testing, temporarily disable auth middleware

### Issue: "db.query is not a function"

**Cause:** Database connection not properly imported

**Solution:**
1. Check import: `import { db } from '../../../database/connection';`
2. Check `backend/database/connection.ts` exports `db` correctly
3. Check database connection is established

### Issue: Frontend shows "No users found"

**Possible Causes:**
1. API endpoint not deployed
2. Authentication failing
3. Database has no users
4. Frontend API URL incorrect

**Debug Steps:**
```bash
# 1. Check API is live
curl https://weddingbazaar-web.onrender.com/api/admin/health

# 2. Check database has users
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 3. Check frontend API URL
# Open browser console and check network tab for the API call

# 4. Check frontend .env file
cat .env.production
# Should have: VITE_API_URL=https://weddingbazaar-web.onrender.com
```

---

## 🔐 Security Checklist

Before going to production:

- [ ] Authentication middleware added and tested
- [ ] JWT secret is strong and secure (not 'secret' or 'test')
- [ ] Admin role verification implemented
- [ ] Token expiration configured
- [ ] HTTPS only (no HTTP)
- [ ] CORS properly configured
- [ ] Rate limiting on admin endpoints
- [ ] SQL injection prevention (using parameterized queries)
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info

---

## 📊 Performance Monitoring

After deployment, monitor:

1. **API Response Times**
   - Admin endpoints should respond in < 500ms
   - Database queries should be indexed

2. **Error Rates**
   - Watch for 500 errors
   - Watch for 401/403 errors (auth issues)

3. **Database Connection Pool**
   - Monitor active connections
   - Watch for connection leaks

4. **Memory Usage**
   - Server should stay under 512MB
   - Watch for memory leaks

---

## 🎉 Success Criteria

Deployment is successful when:

- ✅ All admin API endpoints return 200 OK (with valid auth)
- ✅ Admin panel loads users correctly
- ✅ Stats cards show accurate data
- ✅ User CRUD operations work
- ✅ Authentication is enforced
- ✅ No console errors
- ✅ Performance is acceptable (< 500ms response time)

---

## 📝 Rollback Plan

If deployment fails:

### Backend Rollback (Render)

1. Go to Render Dashboard
2. Find your service
3. Click "Rollback" to previous deployment
4. Or: Git revert and push

```bash
git revert HEAD
git push origin main
```

### Frontend Rollback (Firebase)

```bash
# List recent deployments
firebase hosting:releases:list

# Rollback to specific version
firebase hosting:rollback

# Or use Firebase console
# https://console.firebase.google.com/project/YOUR_PROJECT/hosting
```

---

## 📚 Related Files

- `backend/src/api/admin/index.ts` - Main admin router
- `backend/src/api/admin/users.ts` - User management endpoints
- `server/index.ts` - Main server file (admin routes mounted here)
- `src/pages/users/admin/users/UserManagement.tsx` - Frontend user management
- `ADMIN_API_MODULARIZATION_COMPLETE.md` - Complete documentation
- `test-admin-api-integration.mjs` - Test script

---

## 🆘 Getting Help

If you encounter issues:

1. Check server logs: `tail -f server.log`
2. Check Render logs: Dashboard → Your Service → Logs
3. Check browser console: F12 → Console/Network tabs
4. Run test script: `node test-admin-api-integration.mjs`
5. Check database: `psql $DATABASE_URL`

---

**Last Updated:** October 18, 2025  
**Status:** Ready for Deployment  
**Priority:** HIGH
