# 🎯 Admin Users API - Integration Guide

**Status:** ✅ Module Created, Pending Backend Integration  
**Date:** October 18, 2025

---

## 📋 SITUATION

### Current State
- ✅ Modular admin API created (`backend/src/api/admin/`)
- ✅ Users module complete with all endpoints
- ✅ Frontend expecting `/api/admin/users` endpoint
- ❌ Backend not yet integrated with new modules
- ❌ Users not displaying in admin panel

### Problem
The frontend `UserManagement.tsx` component calls:
```typescript
fetch(`${API_URL}/api/admin/users`)
```

But this endpoint doesn't exist in the deployed backend yet.

---

## 🔧 SOLUTION: Integration Steps

### Step 1: Add Admin Routes to Main Backend

Find your main backend entry point (likely `index.js`, `server.js`, or `app.js`) and add:

```javascript
// Import admin routes
const adminRoutes = require('./src/api/admin');

// Mount admin API (add this BEFORE other routes)
app.use('/api/admin', adminRoutes);

// Your existing routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
// ... etc
```

### Step 2: Verify Integration

Test the endpoints locally:

```bash
# Start your backend
npm start

# Test users endpoint
curl http://localhost:3001/api/admin/users

# Test health endpoint  
curl http://localhost:3001/api/admin/health
```

### Step 3: Deploy to Production

Once tested locally:

```bash
git add backend/src/api/admin/
git commit -m "feat: Add modular admin API for user management"
git push origin main
```

Render will automatically deploy the changes.

---

## 📁 FILES CREATED

### 1. **backend/src/api/admin/users.js**
Complete user management API module with:
- `GET /api/admin/users` - List all users with stats
- `GET /api/admin/users/:id` - Get user details
- `GET /api/admin/users/stats/overview` - Detailed statistics
- `POST /api/admin/users` - Create new user
- `PATCH /api/admin/users/:id/status` - Update status
- `PATCH /api/admin/users/:id/role` - Update role
- `DELETE /api/admin/users/:id` - Soft delete user

### 2. **backend/src/api/admin/index.js**
Main router that mounts all admin modules:
```javascript
const usersRoutes = require('./users');
router.use('/users', usersRoutes);
```

### 3. **backend/src/api/admin/README.md**
Complete documentation for the modular structure.

---

## 🧪 TESTING

### Local Testing Script

Create `test-admin-api.js`:

```javascript
const API_BASE = 'http://localhost:3001/api/admin';

async function testAdminAPI() {
  console.log('🧪 Testing Admin API...\n');

  // Test 1: Get all users
  console.log('1️⃣ Testing GET /api/admin/users');
  const usersRes = await fetch(`${API_BASE}/users`);
  const usersData = await usersRes.json();
  console.log('✅ Users:', usersData.stats);

  // Test 2: Get stats
  console.log('\n2️⃣ Testing GET /api/admin/users/stats/overview');
  const statsRes = await fetch(`${API_BASE}/users/stats/overview`);
  const statsData = await statsRes.json();
  console.log('✅ Stats:', statsData.stats);

  // Test 3: Health check
  console.log('\n3️⃣ Testing GET /api/admin/health');
  const healthRes = await fetch(`${API_BASE}/health`);
  const healthData = await healthRes.json();
  console.log('✅ Health:', healthData);
}

testAdminAPI().catch(console.error);
```

Run with:
```bash
node test-admin-api.js
```

### Production Testing

Once deployed:

```bash
# Test users endpoint
curl https://weddingbazaar-web.onrender.com/api/admin/users

# With authentication
curl https://weddingbazaar-web.onrender.com/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test health
curl https://weddingbazaar-web.onrender.com/api/admin/health
```

---

## 🔐 AUTHENTICATION (TODO)

Currently, the endpoints are unprotected. You should add:

### 1. Create Auth Middleware

`backend/middleware/auth.js`:
```javascript
const jwt = require('jsonwebtoken');

// Verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// Require admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Admin access required' 
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
```

### 2. Apply to Admin Routes

In `backend/src/api/admin/index.js`:
```javascript
const { authenticateToken, requireAdmin } = require('../../middleware/auth');

// Apply to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Then mount your routes
router.use('/users', usersRoutes);
```

---

## 📊 DATABASE SCHEMA

The users table should have:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'individual' 
    CHECK (role IN ('individual', 'vendor', 'admin')),
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
  email_verified BOOLEAN DEFAULT FALSE,
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

---

## 🎯 FRONTEND INTEGRATION

The frontend is already set up and ready. Once the backend is integrated:

1. **Admin panel will load users automatically**
2. **Stats cards will display counts**
3. **User actions (status updates, etc.) will work**

No frontend changes needed! 🎉

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying:

- [ ] Test endpoints locally
- [ ] Add authentication middleware
- [ ] Test with JWT tokens
- [ ] Verify database schema
- [ ] Test all CRUD operations
- [ ] Check error handling
- [ ] Review security (no SQL injection, etc.)
- [ ] Add rate limiting (optional)
- [ ] Test on staging (if available)
- [ ] Deploy to production
- [ ] Verify in live admin panel

---

## 📈 BENEFITS OF THIS APPROACH

✅ **Modular** - Separate file for admin functionality  
✅ **Maintainable** - Easy to update without touching main backend  
✅ **Scalable** - Can add more admin modules easily  
✅ **Testable** - Each module can be tested independently  
✅ **Professional** - Industry-standard API structure  
✅ **Safe** - Won't break existing endpoints  

---

## 🔮 NEXT STEPS

After users module is working:

1. **Add Vendors Module** (`backend/src/api/admin/vendors.js`)
2. **Add Bookings Module** (`backend/src/api/admin/bookings.js`)
3. **Add Analytics Module** (`backend/src/api/admin/analytics.js`)
4. **Add Finances Module** (`backend/src/api/admin/finances.js`)

Each follows the same pattern - just create the file and mount it in `index.js`!

---

## 💡 INTEGRATION EXAMPLE

**Main Backend File** (`backend/index.js` or `backend/app.js`):

```javascript
const express = require('express');
const app = express();

// Existing middleware
app.use(express.json());
app.use(cors());

// ✨ ADD THIS - Admin API Module
const adminRoutes = require('./src/api/admin');
app.use('/api/admin', adminRoutes);

// Your existing routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', require('./routes/vendors'));
// ... etc

// Start server
app.listen(3001, () => {
  console.log('✅ Server running on port 3001');
  console.log('📊 Admin API: http://localhost:3001/api/admin');
});
```

---

## 🎉 CONCLUSION

The modular admin API is **ready to integrate**. Just add the routes to your main backend file and deploy!

**Once deployed, the admin panel will automatically:**
- Display all users
- Show statistics
- Enable user management
- Allow status updates
- Support role changes

No frontend changes needed - it's already wired up and waiting! 🚀

---

*Admin API Integration Guide - Wedding Bazaar Platform*  
*October 2025*
