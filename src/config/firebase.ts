import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Validate and sanitize Firebase environment variables
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim();
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim();

// Check if Firebase is properly configured
const isFirebaseConfigured = 
  apiKey && 
  apiKey !== 'undefined' && 
  apiKey.length > 30 &&
  authDomain && 
  projectId && 
  appId;

// Debug Firebase configuration
console.log('🔧 Firebase configuration check:', {
  hasApiKey: !!apiKey,
  apiKeyLength: apiKey?.length || 0,
  apiKeyValid: apiKey && apiKey !== 'undefined' && apiKey.length > 30,
  hasAuthDomain: !!authDomain,
  hasProjectId: !!projectId,
  hasAppId: !!appId,
  isConfigured: isFirebaseConfigured,
  // Show first/last 4 chars of API key for debugging (safe)
  apiKeyPreview: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'missing'
});

// Essential Firebase configuration for Wedding Bazaar Authentication
const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  appId
};

// Initialize Firebase only if configured
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  console.warn('Firebase not configured - using backend-only authentication');
}

export { auth, isFirebaseConfigured };
export default app;
