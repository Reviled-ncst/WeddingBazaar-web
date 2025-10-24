# Firebase Configuration for Render Environment Variables

## Where to Find Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **weddingbazaarph**
3. Click the **gear icon** ⚙️ (Settings) → **Project Settings**
4. Scroll down to **Your apps** section
5. Select your **Web app** (or create one if you haven't)
6. Look for the **firebaseConfig** object

## Example Firebase Config Object
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "weddingbazaarph.firebaseapp.com",
  projectId: "weddingbazaarph",
  storageBucket: "weddingbazaarph.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

---

## Step 2: Add to Render Environment Variables

### Option A: If Your Frontend is on Firebase Hosting (Current Setup)

Since your frontend is deployed to **Firebase Hosting** (https://weddingbazaarph.web.app), you need to add these as **build-time environment variables**.

#### Update Your Local `.env` File (for building locally)

Add these variables to your `.env` file (they will be included in the build):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=weddingbazaarph.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=weddingbazaarph
VITE_FIREBASE_STORAGE_BUCKET=weddingbazaarph.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

**Note**: Since Firebase Hosting serves static files, these variables are **baked into the build** during `npm run build`. They cannot be changed after deployment without rebuilding.

---

### Option B: If You Want Dynamic Environment Variables (Deploy Frontend to Render)

If you want to change Firebase config without rebuilding, you need to deploy your frontend to **Render Web Service** instead of Firebase Hosting.

#### Steps to Deploy Frontend to Render:

1. **Create New Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Configure:
     - **Name**: `weddingbazaar-frontend`
     - **Root Directory**: Leave blank (root)
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npx serve -s dist -l $PORT`
     - **Environment**: `Node`

2. **Add Environment Variables in Render**
   - In your new web service, go to **"Environment"** tab
   - Add these variables:

   ```
   VITE_API_URL=https://weddingbazaar-web.onrender.com
   VITE_FIREBASE_API_KEY=your_actual_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=weddingbazaarph.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=weddingbazaarph
   VITE_FIREBASE_STORAGE_BUCKET=weddingbazaarph.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   ```

3. **Install serve package**
   - Add to your `package.json` dependencies:
   ```json
   "serve": "^14.2.0"
   ```

---

## Step 3: Current Recommended Solution (Fastest Fix)

Since you're already using **Firebase Hosting**, the fastest fix is:

### 1. Add Firebase Config to Your Local `.env` File

Create/update `.env` in your project root:

```env
# Backend API
VITE_API_URL=https://weddingbazaar-web.onrender.com

# Firebase Configuration (GET THESE FROM FIREBASE CONSOLE!)
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=weddingbazaarph.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=weddingbazaarph
VITE_FIREBASE_STORAGE_BUCKET=weddingbazaarph.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### 2. Rebuild and Redeploy

```powershell
# Build with environment variables
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

---

## Why Firebase Config Should Be in .env (Not Render)

**Important**: For **Firebase Hosting** deployments:
- Environment variables are **baked into the build** during `npm run build`
- Render environment variables **do NOT apply** to Firebase Hosting
- The `.env` file is used during the **build process** on your local machine
- The built files (in `dist/`) are then uploaded to Firebase

**Security Note**: 
- Firebase API keys are **meant to be public** (they're in your frontend JavaScript)
- Security is handled by **Firebase Security Rules**, not by hiding the API key
- It's safe to commit Firebase config to your repository (many projects do this)

---

## Quick Commands

### Get Your Firebase Project Info
```powershell
firebase projects:list
```

### Get Firebase App Config
```powershell
firebase apps:sdkconfig
```

---

## What You Need to Do RIGHT NOW

1. **Get your Firebase config** from Firebase Console
2. **Add it to `.env` file** in your project root
3. **Rebuild**: `npm run build`
4. **Redeploy**: `firebase deploy --only hosting`

That's it! The error will be fixed. 🎉

---

## Alternative: Remove Firebase Auth (Use Backend-Only Auth)

If you don't want to use Firebase Auth at all, you can:
1. Remove Firebase imports from your code
2. Use only backend JWT authentication
3. This will make your backend the single source of truth for auth

Let me know which approach you prefer!
