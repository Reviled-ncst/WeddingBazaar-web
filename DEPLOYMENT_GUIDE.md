# Wedding Bazaar - Complete Deployment Guide

## 📋 Table of Contents
1. [Environment Variables](#environment-variables)
2. [Frontend Deployment (Firebase Hosting)](#frontend-deployment-firebase-hosting)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Database Setup (Neon PostgreSQL)](#database-setup-neon-postgresql)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)

---

## 🌍 Environment Variables

### Frontend Environment Variables

#### Production (`.env.production`)
```bash
# Backend API URL - Production Render deployment (without /api suffix)
VITE_API_URL=https://weddingbazaar-web.onrender.com

# Cloudinary Configuration for Image Uploads
VITE_CLOUDINARY_CLOUD_NAME=dht64xt1g
VITE_CLOUDINARY_UPLOAD_PRESET=weddingbazaarus

# Environment
NODE_ENV=production

# Admin Panel Mock Data Toggle
# Set to 'false' in production to always use real API data
VITE_USE_MOCK_BOOKINGS=false

# Essential Firebase Configuration for Authentication Only
VITE_FIREBASE_API_KEY=AIzaSyBrrGVT9tyka4l2Jsph0VJVmjw5OmLXqI0
VITE_FIREBASE_AUTH_DOMAIN=weddingbazaarph.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=weddingbazaarph
VITE_FIREBASE_APP_ID=1:543533138006:web:74fb6ac8ebab6c11f3fbf7

# Google OAuth (requires Firebase Auth to be enabled)
VITE_GOOGLE_CLIENT_ID=543533138006-pt0q7sk867c77ba5rfcdpptsqkgom92b.apps.googleusercontent.com
```

#### Development (`.env.development`)
```bash
# Backend API URL - Local development server
VITE_API_URL=http://localhost:3001

# Cloudinary Configuration for Image Uploads
VITE_CLOUDINARY_CLOUD_NAME=dht64xt1g
VITE_CLOUDINARY_UPLOAD_PRESET=weddingbazaarus

# Development specific settings
VITE_NODE_ENV=development

# Admin Panel Mock Data Toggle
# Set to 'true' to use mock/sample data for development
# Set to 'false' to use real API data
VITE_USE_MOCK_BOOKINGS=false

# Essential Firebase Configuration for Authentication Only
VITE_FIREBASE_API_KEY=AIzaSyBrrGVT9tyka4l2Jsph0VJVmjw5OmLXqI0
VITE_FIREBASE_AUTH_DOMAIN=weddingbazaarph.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=weddingbazaarph
VITE_FIREBASE_APP_ID=1:543533138006:web:74fb6ac8ebab6c11f3fbf7

# Google OAuth (requires Firebase Auth to be enabled)
VITE_GOOGLE_CLIENT_ID=543533138006-pt0q7sk867c77ba5rfcdpptsqkgom92b.apps.googleusercontent.com
```

### Backend Environment Variables (Render)

Configure these in your Render dashboard under "Environment" tab:

```bash
# Database - Neon PostgreSQL
DATABASE_URL=postgresql://weddingbazaar_owner:xxxxx@ep-rough-boat-a1b2c3d4.ap-southeast-1.aws.neon.tech/weddingbazaar?sslmode=require

# Security
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key-here

# Environment
NODE_ENV=production
PORT=3001

# CORS Origins (comma-separated)
CORS_ORIGINS=https://weddingbazaar-web.web.app,https://weddingbazaarph.firebaseapp.com,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

---

## 🚀 Frontend Deployment (Firebase Hosting)

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created at https://console.firebase.google.com/
- Firebase initialized in your project

### Deployment Steps

#### 1. Build the Frontend
```powershell
# Clean previous builds
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Build with production environment variables
npm run build
```

#### 2. Deploy to Firebase Hosting
```powershell
# Login to Firebase (if not already logged in)
firebase login

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

#### 3. Verify Deployment
- **Production URL**: https://weddingbazaar-web.web.app
- Test all major features:
  - Homepage loads
  - Login/Register works
  - Admin panel accessible
  - API calls succeed

### Firebase Configuration (`firebase.json`)
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

---

## 🔧 Backend Deployment (Render)

### Prerequisites
- Render account at https://render.com
- GitHub repository connected to Render
- Neon PostgreSQL database created

### Deployment Steps

#### 1. Create New Web Service on Render
- **Repository**: Connect your GitHub repo
- **Branch**: `main` or your production branch
- **Root Directory**: `backend-deploy`
- **Build Command**: `npm install`
- **Start Command**: `node production-backend.js`
- **Instance Type**: Free (or paid for production)

#### 2. Configure Environment Variables
In Render dashboard > Environment:
- Add all backend environment variables (see above)
- Ensure `DATABASE_URL` is correct
- Set `NODE_ENV=production`
- Configure `CORS_ORIGINS` to include your frontend URL

#### 3. Deploy
- Render will automatically deploy on git push
- Or manually deploy from Render dashboard

#### 4. Verify Backend
```powershell
# Test health endpoint
curl https://weddingbazaar-web.onrender.com/api/health

# Test authentication
curl https://weddingbazaar-web.onrender.com/api/auth/verify
```

### Backend Project Structure
```
backend-deploy/
├── production-backend.js      # Main Express server
├── routes/
│   ├── auth.cjs              # Authentication routes
│   ├── vendors.cjs           # Vendor management
│   ├── bookings.cjs          # Booking system
│   ├── admin/
│   │   ├── index.cjs         # Admin API router
│   │   ├── users.cjs         # User management
│   │   └── bookings.cjs      # Booking management
├── middleware/
│   ├── auth.cjs              # JWT authentication
│   └── errorHandler.cjs      # Error handling
├── config/
│   └── database.cjs          # Neon DB connection
└── package.json
```

---

## 🗄️ Database Setup (Neon PostgreSQL)

### Prerequisites
- Neon account at https://console.neon.tech/
- PostgreSQL database created

### Database Schema

#### Core Tables
```sql
-- Users table (for authentication and profiles)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) DEFAULT 'individual',
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors table (business information)
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table (reservation system)
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  booking_reference VARCHAR(50) UNIQUE NOT NULL,
  client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  service_type VARCHAR(100),
  event_date DATE,
  event_location VARCHAR(255),
  budget_range VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add booking reference generation
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_reference := 'WB-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                           LPAD(NEW.id::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_reference
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION generate_booking_reference();
```

### Database Connection

#### Configuration (`backend-deploy/config/database.cjs`)
```javascript
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

module.exports = { sql };
```

### Running Migrations
```powershell
# From project root
cd backend-deploy

# Run schema setup
node scripts/setup-schema.cjs

# Add test data (optional)
node scripts/seed-data.cjs
```

---

## ✅ Post-Deployment Verification

### Frontend Checklist
- [ ] Homepage loads successfully
- [ ] All assets (images, fonts) load
- [ ] Navigation works across all pages
- [ ] Login/Register modals function
- [ ] Admin panel accessible
- [ ] API calls connect to backend
- [ ] No console errors

### Backend Checklist
- [ ] Health endpoint responds: `/api/health`
- [ ] Authentication works: `/api/auth/login`, `/api/auth/verify`
- [ ] Admin APIs function: `/api/admin/users`, `/api/admin/bookings`
- [ ] Database queries execute successfully
- [ ] CORS headers allow frontend requests
- [ ] Error handling returns proper responses

### Database Checklist
- [ ] All tables created
- [ ] Foreign key relationships established
- [ ] Triggers and functions working
- [ ] Test data populated (if needed)
- [ ] Connection pool stable

### Test Commands
```powershell
# Test frontend
curl https://weddingbazaar-web.web.app

# Test backend health
curl https://weddingbazaar-web.onrender.com/api/health

# Test authentication
curl -X POST https://weddingbazaar-web.onrender.com/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@weddingbazaar.com\",\"password\":\"Admin123!\"}'

# Test admin API
curl https://weddingbazaar-web.onrender.com/api/admin/users `
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Troubleshooting

### Frontend Issues

#### Build Fails
```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force node_modules, dist
npm install
npm run build
```

#### Environment Variables Not Working
- Ensure `.env.production` exists
- Check that variables start with `VITE_`
- Rebuild after changing environment variables

#### Firebase Deploy Fails
```powershell
# Re-login to Firebase
firebase logout
firebase login

# Check Firebase project
firebase use --add

# Deploy with verbose logging
firebase deploy --only hosting --debug
```

### Backend Issues

#### Database Connection Fails
- Check `DATABASE_URL` in Render environment
- Verify Neon database is running
- Check SSL mode: `?sslmode=require`
- Test connection locally first

#### API Returns 500 Errors
- Check Render logs: Dashboard > Logs
- Verify all environment variables set
- Check database schema matches code
- Test endpoints locally first

#### CORS Errors
- Add frontend URL to `CORS_ORIGINS`
- Include both Firebase URLs:
  - `https://weddingbazaar-web.web.app`
  - `https://weddingbazaarph.firebaseapp.com`
- Restart backend after changes

### Database Issues

#### Migrations Not Running
```powershell
# Connect directly to Neon
psql "postgresql://weddingbazaar_owner:xxxxx@ep-rough-boat-a1b2c3d4.ap-southeast-1.aws.neon.tech/weddingbazaar?sslmode=require"

# Check tables
\dt

# Run schema manually
\i backend-deploy/scripts/schema.sql
```

#### Data Not Appearing
- Check table exists: `SELECT * FROM bookings LIMIT 1;`
- Verify foreign keys: `\d bookings`
- Check user permissions
- Run seed script if needed

---

## 📚 Additional Resources

### Documentation
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Render Deployment Docs](https://render.com/docs)
- [Neon PostgreSQL Docs](https://neon.tech/docs/introduction)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

### Project Documentation
- `ADMIN_API_INTEGRATION_GUIDE.md` - Admin API implementation
- `ADMIN_BOOKINGS_MOCK_DATA_TOGGLE.md` - Mock data configuration
- `CURRENCY_CONVERSION_FEATURE.md` - Currency conversion system
- `ADMIN_DOCUMENT_VERIFICATION_SUCCESS.md` - Document verification

### Support
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Project Documentation: See `*.md` files in project root

---

## 🔄 Quick Deployment Commands

### Full Deployment (Frontend + Backend)
```powershell
# 1. Build and deploy frontend
npm run build
firebase deploy --only hosting

# 2. Push to GitHub (triggers backend deploy on Render)
git add .
git commit -m "Deploy: Description of changes"
git push origin main
```

### Frontend Only
```powershell
npm run build
firebase deploy --only hosting
```

### Backend Only (via Git Push)
```powershell
git add backend-deploy/
git commit -m "Backend: Description of changes"
git push origin main
```

---

## 📊 Monitoring

### Frontend Monitoring
- **Firebase Hosting Console**: https://console.firebase.google.com/
- **Usage Stats**: Bandwidth, requests, storage
- **Performance**: Page load times, asset sizes

### Backend Monitoring
- **Render Dashboard**: https://dashboard.render.com/
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, response times
- **Health Checks**: Automatic health monitoring

### Database Monitoring
- **Neon Console**: https://console.neon.tech/
- **Connections**: Active connections, pool status
- **Queries**: Query performance, slow queries
- **Storage**: Database size, growth rate

---

## 🎯 Production Checklist

Before going live:
- [ ] All environment variables configured in Render
- [ ] Database schema deployed and tested
- [ ] Frontend built and deployed to Firebase
- [ ] Backend deployed and responding
- [ ] SSL certificates active (automatic on both platforms)
- [ ] CORS configured for production domains
- [ ] Error logging configured
- [ ] Backup strategy in place
- [ ] Monitoring alerts set up
- [ ] Documentation updated
- [ ] Team notified of deployment

---

## 📝 Version History

### v1.0.0 - Initial Deployment
- Frontend: Firebase Hosting
- Backend: Render
- Database: Neon PostgreSQL
- Features: User authentication, vendor management, booking system, admin panel

### v1.1.0 - Admin Improvements
- Modular admin API
- Enhanced bookings UI
- Currency conversion
- Document verification system
- Mock data toggles for development

---

**Last Updated**: January 2025
**Maintained By**: Wedding Bazaar Development Team
