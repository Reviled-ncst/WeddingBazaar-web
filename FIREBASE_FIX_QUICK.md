# Quick Fix: Firebase API Key Error

## Problem
```
Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## Solution (3 Steps)

### Step 1: Get Firebase Config from Firebase Console

1. Open: https://console.firebase.google.com
2. Select project: **weddingbazaarph**
3. Click ⚙️ Settings → **Project Settings**
4. Scroll to **"Your apps"** section
5. Click **"Config"** or **</>** (Web app icon)
6. Copy the **firebaseConfig** object

### Step 2: Add to Your `.env` File

Open `.env` in your project root and add:

```env
VITE_FIREBASE_API_KEY=your_api_key_from_firebase_console
VITE_FIREBASE_AUTH_DOMAIN=weddingbazaarph.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=weddingbazaarph
VITE_FIREBASE_STORAGE_BUCKET=weddingbazaarph.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Replace the values with YOUR actual Firebase config values!

### Step 3: Rebuild and Deploy

```powershell
# Rebuild with new config
npx vite build

# Deploy to Firebase
firebase deploy --only hosting
```

Done! ✅

---

## Why Not Render Environment Variables?

Your frontend is deployed to **Firebase Hosting** (not Render).

- **Backend** = Render.com (uses Render environment variables)
- **Frontend** = Firebase Hosting (uses build-time .env variables)

Environment variables on Render **only affect your backend**, not your frontend.

---

## Firebase CLI Command to Get Config

You can also get your config using Firebase CLI:

```powershell
# Show your Firebase projects
firebase projects:list

# Get app configuration
firebase apps:sdkconfig
```

This will show your Firebase config in the terminal!
