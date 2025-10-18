# 🚀 Wedding Bazaar - Quick Start Guide

## For New Developers

### Prerequisites
- Node.js 18+ installed
- Git installed
- Firebase CLI: `npm install -g firebase-tools`
- Access to:
  - Firebase Console (frontend hosting)
  - Render Dashboard (backend hosting)
  - Neon Console (database)

---

## 📦 Project Setup (5 minutes)

### 1. Clone Repository
```powershell
git clone https://github.com/your-repo/WeddingBazaar-web.git
cd WeddingBazaar-web
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Set Up Environment Variables

Create `.env.development`:
```bash
VITE_API_URL=http://localhost:3001
VITE_CLOUDINARY_CLOUD_NAME=dht64xt1g
VITE_CLOUDINARY_UPLOAD_PRESET=weddingbazaarus
VITE_NODE_ENV=development
VITE_USE_MOCK_BOOKINGS=false
VITE_FIREBASE_API_KEY=AIzaSyBrrGVT9tyka4l2Jsph0VJVmjw5OmLXqI0
VITE_FIREBASE_AUTH_DOMAIN=weddingbazaarph.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=weddingbazaarph
VITE_FIREBASE_APP_ID=1:543533138006:web:74fb6ac8ebab6c11f3fbf7
VITE_GOOGLE_CLIENT_ID=543533138006-pt0q7sk867c77ba5rfcdpptsqkgom92b.apps.googleusercontent.com
```

### 4. Start Development Server
```powershell
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## 🗄️ Backend Setup (Optional for Local Development)

### 1. Navigate to Backend
```powershell
cd backend-deploy
```

### 2. Install Backend Dependencies
```powershell
npm install
```

### 3. Create Backend `.env`
```bash
DATABASE_URL=postgresql://weddingbazaar_owner:[password]@[host]/weddingbazaar?sslmode=require
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret
NODE_ENV=development
PORT=3001
CORS_ORIGINS=http://localhost:5173
```

### 4. Start Backend Server
```powershell
node production-backend.js
```

Backend will be available at: http://localhost:3001

---

## 🔑 Test Accounts

### Admin Account
- Email: `admin@weddingbazaar.com`
- Password: `Admin123!`
- Access: Full admin panel

### Vendor Account (if needed)
- Create via register page
- Select "Vendor" user type

### Individual User Account
- Create via register page
- Select "Individual" user type

---

## 📁 Project Structure

```
WeddingBazaar-web/
├── src/
│   ├── pages/
│   │   ├── homepage/          # Public homepage
│   │   ├── users/
│   │   │   ├── individual/    # Couple/user pages
│   │   │   ├── vendor/        # Vendor pages
│   │   │   └── admin/         # Admin panel
│   │   └── shared/            # Shared page components
│   ├── shared/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   └── types/             # TypeScript types
│   ├── router/                # App routing
│   └── assets/                # Static assets
├── backend-deploy/
│   ├── routes/                # API routes
│   ├── middleware/            # Express middleware
│   └── config/                # Configuration
└── docs/                      # Documentation (see *.md files)
```

---

## 🛠️ Common Development Tasks

### Run Frontend Only
```powershell
npm run dev
```

### Build for Production
```powershell
npm run build
```

### Preview Production Build
```powershell
npm run preview
```

### Deploy to Firebase
```powershell
npm run build
firebase deploy --only hosting
```

### Run Backend Locally
```powershell
cd backend-deploy
node production-backend.js
```

### Run Database Scripts
```powershell
cd backend-deploy
node scripts/your-script.cjs
```

---

## 🎨 UI Development

### Tailwind CSS Classes
- Glassmorphism: `backdrop-blur-lg bg-white/90`
- Wedding theme colors: `bg-pink-50`, `text-pink-600`
- Rounded corners: `rounded-2xl`, `rounded-3xl`
- Shadows: `shadow-xl`, `shadow-2xl`
- Hover effects: `hover:scale-105 transition-transform`

### Icon Usage
```tsx
import { Heart, Calendar, User } from 'lucide-react';

<Heart className="w-6 h-6 text-pink-500" />
```

---

## 🐛 Debugging

### Check Frontend Logs
- Open browser DevTools (F12)
- Console tab for errors
- Network tab for API calls

### Check Backend Logs
- Terminal where backend is running
- Or Render dashboard for production

### Common Issues

#### "Cannot connect to backend"
```powershell
# Check if backend is running
curl http://localhost:3001/api/health

# If not, start backend:
cd backend-deploy
node production-backend.js
```

#### "Module not found"
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

#### "Environment variable not working"
- Ensure variable starts with `VITE_` for frontend
- Restart dev server after changing .env
- Check `.env.development` exists in project root

---

## 📚 Documentation

### Quick References
- **Deployment**: `DEPLOYMENT_GUIDE.md`
- **Environment Variables**: `ENV_VARIABLES_QUICK_REF.md`
- **Production Status**: `PRODUCTION_STATUS.md`
- **Admin API**: `ADMIN_API_INTEGRATION_GUIDE.md`

### Feature Documentation
- Currency Conversion: `CURRENCY_CONVERSION_FEATURE.md`
- Document Verification: `ADMIN_DOCUMENT_VERIFICATION_SUCCESS.md`
- Bookings System: `ADMIN_BOOKINGS_UI_ENHANCED.md`
- Mock Data Toggle: `ADMIN_BOOKINGS_MOCK_DATA_TOGGLE.md`

---

## 🔄 Git Workflow

### Create Feature Branch
```powershell
git checkout -b feature/your-feature-name
```

### Commit Changes
```powershell
git add .
git commit -m "feat: Description of changes"
```

### Push to GitHub
```powershell
git push origin feature/your-feature-name
```

### Merge to Main
```powershell
git checkout main
git merge feature/your-feature-name
git push origin main
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Homepage loads
- [ ] Can register new user
- [ ] Can login
- [ ] Can browse services
- [ ] Can create booking
- [ ] Admin panel accessible
- [ ] Messaging works
- [ ] Images upload to Cloudinary

### API Testing with curl
```powershell
# Health check
curl http://localhost:3001/api/health

# Login test
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@weddingbazaar.com\",\"password\":\"Admin123!\"}'
```

---

## 🚀 Deployment

### Quick Deploy (Frontend Only)
```powershell
npm run build
firebase deploy --only hosting
```

### Full Deploy (Frontend + Backend)
```powershell
# 1. Build and deploy frontend
npm run build
firebase deploy --only hosting

# 2. Push to GitHub (triggers backend deploy)
git add .
git commit -m "deploy: Description"
git push origin main
```

Backend automatically deploys on Render when you push to GitHub.

---

## 🆘 Getting Help

### Documentation
1. Check `DEPLOYMENT_GUIDE.md` for deployment issues
2. Check `PRODUCTION_STATUS.md` for current features
3. Check feature-specific `.md` files for details

### Console Logs
- Frontend: Browser DevTools Console (F12)
- Backend: Terminal output or Render logs

### Test Endpoints
```powershell
# Frontend (production)
curl https://weddingbazaar-web.web.app

# Backend (production)
curl https://weddingbazaar-web.onrender.com/api/health

# Backend (local)
curl http://localhost:3001/api/health
```

---

## 🎯 Next Steps

1. **Explore the Code**: Start with `src/router/AppRouter.tsx`
2. **Run the Project**: `npm run dev`
3. **Test Features**: Try login, browse vendors, create booking
4. **Read Documentation**: Check all `.md` files in project root
5. **Make Changes**: Create feature branch and start coding!

---

## 📞 Support

- **GitHub Issues**: Report bugs or request features
- **Documentation**: See all `.md` files in project root
- **Code Comments**: Most components have inline documentation

---

**Welcome to the Wedding Bazaar team! Happy coding! 🎉**
