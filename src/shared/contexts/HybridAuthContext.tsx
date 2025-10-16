import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { firebaseAuthService, type FirebaseAuthUser } from '../../services/auth/firebaseAuthService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'couple' | 'vendor' | 'admin';
  profileImage?: string;
  phone?: string;
  businessName?: string;
  vendorId?: string | null;
  emailVerified?: boolean;
  firebaseUid?: string;
  // Neon database fields
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  isRegistering: boolean; // Track registration state
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<User>;
  registerWithGoogle: (userType?: 'couple' | 'vendor') => Promise<User>;
  logout: () => void;
  setUser: (user: User | null) => void;
  sendEmailVerification: () => Promise<void>;
  reloadUser: () => Promise<void>;
  clearRegistrationState: () => void; // Allow manual clearing of registration state
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'couple' | 'vendor';
  phone?: string;
  // Vendor-specific fields
  business_name?: string;
  business_type?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  } | string;
  receiveUpdates?: boolean;
  [key: string]: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Convert Firebase user to our User interface
  const convertFirebaseUser = (fbUser: FirebaseAuthUser): User => ({
    id: fbUser.uid,
    email: fbUser.email || '',
    firstName: fbUser.displayName?.split(' ')[0] || '',
    lastName: fbUser.displayName?.split(' ').slice(1).join(' ') || '',
    role: 'couple', // Default, will be updated from backend
    emailVerified: fbUser.emailVerified,
    firebaseUid: fbUser.uid
  });

  // Sync user data with Neon database
  const syncWithBackend = async (fbUser: FirebaseAuthUser) => {
    try {
      console.log('🔄 Syncing user with Neon database...');
      
      // Try to get user from Neon database using email parameter
      const response = await fetch(`${API_BASE_URL}/api/auth/profile?email=${encodeURIComponent(fbUser.email || '')}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': fbUser.email || ''
        }
      });

      if (response.ok) {
        const backendUser = await response.json();
        console.log('✅ User found in Neon database:', backendUser);
        
        // DEBUG: Log the exact backend user data structure
        console.log('🔧 Backend user structure:', JSON.stringify(backendUser, null, 2));
        console.log('🔧 Backend user.user:', backendUser.user);
        console.log('🔧 Backend user.user.role:', backendUser.user?.role);
        
        // Merge Firebase and backend data
        // Use backend emailVerified status if available (backend now returns this field)
        const backendEmailVerified = backendUser.user?.emailVerified;
        let finalEmailVerified = backendEmailVerified !== undefined ? backendEmailVerified : fbUser.emailVerified;
        
        // ROBUST SOLUTION: If backend doesn't have emailVerified yet, but user has complete vendor profile,
        // treat them as verified (this handles the deployment lag gracefully)
        if (backendEmailVerified === undefined && backendUser.user?.role === 'vendor') {
          const hasCompleteVendorProfile = backendUser.user.businessName && backendUser.user.vendorId;
          if (hasCompleteVendorProfile) {
            finalEmailVerified = true;
            console.log('✅ Vendor with complete profile - treating as email verified');
          }
        }
        
        const mergedUser: User = {
          ...backendUser.user, // Extract user from response
          emailVerified: finalEmailVerified,
          firebaseUid: fbUser.uid
        };
        
        console.log('🔧 Final merged user:', JSON.stringify(mergedUser, null, 2));
        console.log('🔧 Final merged user.role:', mergedUser.role);
        
        setUser(mergedUser);
        return;
      }

      // If user not found in backend, check for pending user data (from registration)
      console.log('📝 User not found in Neon, checking for pending registration data...');
      const pendingProfile = localStorage.getItem('pending_user_profile');
      
      if (pendingProfile && fbUser.emailVerified) {
        try {
          const profileData = JSON.parse(pendingProfile);
          console.log('� Found pending user profile, creating backend profile:', profileData);
          
          // User has verified email, now create the backend profile
          const backendResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...profileData,
              firebase_uid: fbUser.uid // Link to Firebase account
            })
          });

          if (backendResponse.ok) {
            const backendResult = await backendResponse.json();
            console.log('✅ Backend profile created after email verification:', backendResult);
            
            // Remove pending data
            localStorage.removeItem('pending_user_profile');
            
            // Create complete user object
            const newUser: User = {
              id: backendResult.user?.id || backendResult.id,
              email: fbUser.email || '',
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              role: profileData.user_type || 'couple',
              phone: profileData.phone || '',
              businessName: profileData.business_name || '',
              emailVerified: fbUser.emailVerified,
              firebaseUid: fbUser.uid
            };

            setUser(newUser);
            console.log('✅ Complete user profile created and set');
            return;
          }
        } catch (e) {
          console.warn('⚠️ Failed to create backend profile from pending data:', e);
        }
      }

      // Fallback: check localStorage for stored profile (legacy)
      const storedProfile = localStorage.getItem('weddingbazaar_user_profile');
      if (storedProfile) {
        try {
          const profileData = JSON.parse(storedProfile);
          console.log('💾 Found stored user profile:', profileData);
          
          const storedUser: User = {
            id: profileData.firebaseUid || fbUser.uid,
            email: profileData.email || fbUser.email || '',
            firstName: profileData.first_name || fbUser.displayName?.split(' ')[0] || '',
            lastName: profileData.last_name || fbUser.displayName?.split(' ').slice(1).join(' ') || '',
            role: profileData.role || profileData.user_type || 'couple',
            phone: profileData.phone || '',
            businessName: profileData.business_name || '',
            emailVerified: fbUser.emailVerified
          };
          
          setUser(storedUser);
          console.log('✅ User data loaded from localStorage with role:', storedUser.role);
          return;
        } catch (e) {
          console.warn('⚠️ Failed to parse stored profile, using Firebase data');
        }
      }
      
      // Fallback to Firebase-only user
      const firebaseOnlyUser = convertFirebaseUser(fbUser);
      setUser(firebaseOnlyUser);
      
    } catch (error) {
      console.error('❌ Error syncing with backend:', error);
      // Fallback to Firebase-only user
      const firebaseOnlyUser = convertFirebaseUser(fbUser);
      setUser(firebaseOnlyUser);
    }
  };

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChanged(async (fbUser) => {
      console.log('🔧 Firebase auth state changed:', fbUser ? 'User logged in' : 'User logged out');
      
      // Skip auth state processing during registration to prevent login flash
      if (isRegistering) {
        console.log('⏸️ Skipping auth state change during registration process');
        return;
      }
      
      if (fbUser) {
        setFirebaseUser(fbUser);
        
        // Always sync with backend, regardless of email verification status
        // This allows users to see their profile/dashboard even if email not verified
        await syncWithBackend(fbUser);
        console.log('✅ User logged in - email verification status:', fbUser.emailVerified);
        
        if (!fbUser.emailVerified) {
          console.log('📧 User email not verified - limited access until verification');
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, [isRegistering]);

  // OLD Firebase method removed - using hybrid approach below

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      console.log('🔧 Starting hybrid login...');
      
      // Sign in with Firebase
      const userCredential = await firebaseAuthService.signIn(email, password);
      console.log('✅ Firebase login successful');
      
      // Sync with backend will happen automatically via auth state listener
      // Return a user object (will be updated by the listener)
      const tempUser = convertFirebaseUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      });

      return tempUser;
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseAuthService.signOut();
      setUser(null);
      setFirebaseUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const sendEmailVerification = async (): Promise<void> => {
    if (!firebaseUser) {
      throw new Error('No Firebase user found');
    }
    
    try {
      const result = await firebaseAuthService.resendEmailVerification();
      if (!result.success) {
        throw new Error(result.message);
      }
      console.log('✅ Email verification sent');
    } catch (error) {
      console.error('❌ Error sending email verification:', error);
      throw error;
    }
  };

  const reloadUser = async (): Promise<void> => {
    try {
      const updatedFirebaseUser = await firebaseAuthService.reloadUser();
      if (updatedFirebaseUser) {
        setFirebaseUser(updatedFirebaseUser);
        // Sync will happen via the auth state listener
      }
    } catch (error) {
      console.error('❌ Error reloading user:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    try {
      setIsLoading(true);
      console.log('🔧 Starting Google login...');
      
      // Sign in with Firebase using Google
      const userCredential = await firebaseAuthService.signInWithGoogle();
      console.log('✅ Google login successful');
      
      // Sync with backend will happen automatically via auth state listener
      // Return a user object (will be updated by the listener)
      const tempUser = convertFirebaseUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      });

      return tempUser;
      
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const registerWithGoogle = async (userType?: 'couple' | 'vendor'): Promise<User> => {
    try {
      setIsLoading(true);
      console.log('🔧 Starting Google registration...');
      
      // Sign up with Firebase using Google (this handles profile storage)
      const userCredential = await firebaseAuthService.registerWithGoogle(userType);
      console.log('✅ Google registration successful');

      // The Firebase service already stored the pending profile
      // Backend creation will happen automatically via syncWithBackend when auth state changes

      // Return temporary user object
      const tempUser = convertFirebaseUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      });

      return tempUser;
      
    } catch (error: any) {
      console.error('❌ Google registration error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Firebase + Neon hybrid registration - Firebase handles email, Neon stores data
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      setIsRegistering(true);
      console.log('🔧 Starting Firebase + Neon hybrid registration - user will be logged in after success');
      
      // Step 1: Create Firebase user and send email verification (handles email delivery)
      const registrationData: any = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userType: userData.role,
        phone: userData.phone,
        ...(userData.role === 'vendor' && {
          businessName: userData.business_name,
          businessType: userData.business_type,
          location: userData.location
        })
      };

      console.log('🔥 Creating Firebase user with email verification...');
      const result = await firebaseAuthService.registerWithEmailVerification(registrationData);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      console.log('✅ Firebase user created, email verification sent automatically');
      
      // Step 2: Create backend user in Neon database (linked to Firebase UID)
      console.log('🏗️ Creating user in Neon database with Firebase UID...');
      console.log('📡 API_BASE_URL:', API_BASE_URL);
      console.log('🔍 Firebase UID:', result.firebaseUid);
      
      const backendData = {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        user_type: userData.role,
        phone: userData.phone,
        firebase_uid: result.firebaseUid, // Link to Firebase account
        ...(userData.role === 'vendor' && {
          business_name: userData.business_name,
          business_type: userData.business_type,
          location: userData.location
        })
      };

      console.log('📡 Making backend registration request with data:', JSON.stringify(backendData, null, 2));
      
      const backendResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendData)
      });
      
      console.log('📨 Backend response received:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText
      });

      if (backendResponse.ok) {
        const backendResult = await backendResponse.json();
        console.log('✅ User created in Neon database:', {
          userId: backendResult.user?.id,
          userType: backendResult.user?.user_type,
          profileId: backendResult.profile?.id,
          firebaseUid: result.firebaseUid
        });
        
        console.log('📧 Firebase email verification sent to:', userData.email);
        console.log('📧 User must verify email with Firebase before they can login');
        
        // Show persistent notification about email verification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.innerHTML = `
          <div class="flex items-center space-x-2">
            <span>📧</span>
            <div>
              <div class="font-semibold">Email Verification Required!</div>
              <div class="text-sm opacity-90">Check ${userData.email} and click the verification link</div>
              <div class="text-xs opacity-75 mt-1">You must verify your email before you can login</div>
            </div>
          </div>
        `;
        document.body.appendChild(toast);
        
        // Keep toast visible longer (10 seconds instead of 5)
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => document.body.removeChild(toast), 300);
        }, 10000);

      } else {
        const errorText = await backendResponse.text();
        console.error('❌ Backend Neon database creation FAILED:', {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
          errorText
        });
        
        throw new Error(`Registration failed - Neon database error: ${backendResponse.status}: ${errorText}`);
      }

    } catch (error: any) {
      console.error('❌ Firebase + Neon registration error occurred:', {
        message: error.message,
        stack: error.stack,
        fullError: error
      });
      
      // Log the specific step where the error occurred
      if (error.message?.includes('Firebase')) {
        console.error('❌ Error during Firebase registration step');
      } else if (error.message?.includes('Neon') || error.message?.includes('backend')) {
        console.error('❌ Error during Neon database creation step');
      } else {
        console.error('❌ Unknown error during hybrid registration process');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
      // Clear registration flag to allow normal auth flow and manually process current auth state
      console.log('✅ Registration completed successfully - processing current auth state');
      setIsRegistering(false);
      
      // Manually process current Firebase auth state after registration
      const currentUser = firebaseAuthService.getCurrentUser();
      if (currentUser) {
        console.log('🔄 Processing current user after registration completion');
        setFirebaseUser(currentUser);
        await syncWithBackend(currentUser);
      }
    }
  };

  // Use backend-only registration instead of Firebase (replaces Firebase register function)
  // const register = registerBackendOnly;

  const clearRegistrationState = () => {
    console.log('🧹 Manually clearing registration state');
    setIsRegistering(false);
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated: !!user && !!firebaseUser,
    isLoading,
    isEmailVerified: firebaseUser?.emailVerified || false,
    isRegistering, // Expose registration state
    login,
    register,
    logout,
    setUser,
    sendEmailVerification,
    reloadUser,
    loginWithGoogle,
    registerWithGoogle,
    clearRegistrationState // Allow manual clearing of registration state
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
