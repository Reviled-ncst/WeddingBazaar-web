# Environment Variables Quick Reference

## 🎯 Essential Variables for Deployment

### Frontend (.env.production)
```bash
VITE_API_URL=https://weddingbazaar-web.onrender.com
VITE_CLOUDINARY_CLOUD_NAME=dht64xt1g
VITE_CLOUDINARY_UPLOAD_PRESET=weddingbazaarus
NODE_ENV=production
VITE_USE_MOCK_BOOKINGS=false
VITE_USE_MOCK_MESSAGES=false
VITE_FIREBASE_API_KEY=AIzaSyBrrGVT9tyka4l2Jsph0VJVmjw5OmLXqI0
VITE_FIREBASE_AUTH_DOMAIN=weddingbazaarph.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=weddingbazaarph
VITE_FIREBASE_APP_ID=1:543533138006:web:74fb6ac8ebab6c11f3fbf7
VITE_GOOGLE_CLIENT_ID=543533138006-pt0q7sk867c77ba5rfcdpptsqkgom92b.apps.googleusercontent.com
```

### Backend (Render Dashboard)
```bash
DATABASE_URL=postgresql://weddingbazaar_owner:[password]@ep-rough-boat-a1b2c3d4.ap-southeast-1.aws.neon.tech/weddingbazaar?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-here
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key-here
NODE_ENV=production
PORT=3001
CORS_ORIGINS=https://weddingbazaar-web.web.app,https://weddingbazaarph.firebaseapp.com,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

## 🔧 How to Configure

### Frontend (Local)
1. Create/edit `.env.production` in project root
2. Add all `VITE_*` variables
3. Run `npm run build` to rebuild

### Backend (Render)
1. Go to Render Dashboard
2. Select your web service
3. Go to "Environment" tab
4. Add each variable with "Add Environment Variable"
5. Save changes (triggers auto-deploy)

## ✅ Verification

### Test Frontend Build
```powershell
npm run build
# Should complete without errors
# Check dist/ folder created
```

### Test Backend Connection
```powershell
# Health check
curl https://weddingbazaar-web.onrender.com/api/health

# Should return:
# {"status":"ok","timestamp":"...","database":"connected"}
```

## 🚨 Important Notes

1. **Never commit `.env.production` to git** (already in .gitignore)
2. **VITE_ prefix required** for frontend variables
3. **Rebuild required** after changing frontend env vars
4. **Restart required** after changing backend env vars (automatic on Render)
5. **DATABASE_URL must include** `?sslmode=require` for Neon

## 🔗 Platform URLs

- **Frontend (Production)**: https://weddingbazaar-web.web.app
- **Backend (Production)**: https://weddingbazaar-web.onrender.com
- **Firebase Console**: https://console.firebase.google.com/
- **Render Dashboard**: https://dashboard.render.com/
- **Neon Console**: https://console.neon.tech/

## 📋 Deployment Checklist

- [ ] `.env.production` created with all frontend variables
- [ ] All backend variables configured in Render dashboard
- [ ] `DATABASE_URL` tested and working
- [ ] `CORS_ORIGINS` includes both Firebase URLs
- [ ] `JWT_SECRET` and `SESSION_SECRET` are strong, random values
- [ ] Frontend build completes: `npm run build`
- [ ] Firebase deploy works: `firebase deploy --only hosting`
- [ ] Backend health check passes
- [ ] Can login/register on production site
- [ ] Admin panel loads and shows data

## 🆘 Quick Troubleshooting

### "Cannot connect to backend"
- Check `VITE_API_URL` in `.env.production`
- Verify backend is running on Render
- Check CORS settings include frontend URL

### "Database connection failed"
- Verify `DATABASE_URL` in Render environment
- Check Neon database is active
- Ensure `?sslmode=require` in connection string

### "Firebase auth not working"
- Check all `VITE_FIREBASE_*` variables present
- Verify Firebase project settings match
- Ensure Firebase Auth is enabled in console

### "Build fails"
```powershell
Remove-Item -Recurse -Force node_modules, dist
npm install
npm run build
```

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for comprehensive deployment instructions.

## Mock Data Control Variables

| Variable | Purpose | Values | Default |
|----------|---------|--------|---------|
| `VITE_USE_MOCK_USERS` | Use mock users in admin panel | `true`/`false` | `false` |
| `VITE_USE_MOCK_BOOKINGS` | Use mock bookings in admin panel | `true`/`false` | `false` |
| `VITE_USE_MOCK_DOCUMENTS` | Use mock documents in admin document verification | `true`/`false` | `false` |
| `VITE_USE_MOCK_VERIFICATIONS` | Use mock verifications (legacy) | `true`/`false` | `false` |
| `VITE_USE_MOCK_MESSAGES` | Use mock messages/conversations in admin panel | `true`/`false` | `false` |

**Usage**: Set these in `.env.development` to enable mock data during development when backend is unavailable.

**Note**: In production (`.env.production`), all these should be `false` to use real API data.
