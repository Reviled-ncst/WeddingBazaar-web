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
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<User>;
  registerWithGoogle: (userType?: 'couple' | 'vendor') => Promise<User>;
  logout: () => void;
  setUser: (user: User | null) => void;
  sendEmailVerification: () => Promise<void>;
  reloadUser: () => Promise<void>;
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
        
        // Merge Firebase and backend data
        const mergedUser: User = {
          ...backendUser,
          emailVerified: fbUser.emailVerified,
          firebaseUid: fbUser.uid
        };
        
        setUser(mergedUser);
        return;
      }

      // If user not found in backend, check localStorage for stored profile
      console.log('📝 User not found in Neon, checking localStorage...');
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
      
      if (fbUser) {
        setFirebaseUser(fbUser);
        await syncWithBackend(fbUser);
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔧 Starting hybrid registration...');
      
      // Check if Firebase is properly configured
      const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_API_KEY && 
                                   import.meta.env.VITE_FIREBASE_API_KEY !== "demo-api-key";
      
      if (isFirebaseConfigured) {
        console.log('🔥 Using Firebase + Neon hybrid registration');
        
        // 1. Register with Firebase
        const userCredential = await firebaseAuthService.registerWithEmailVerification({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          userType: userData.role,
          businessName: userData.business_name,
          businessType: userData.business_type,
          location: userData.location
        });

        console.log('✅ Firebase registration successful');

        // 2. Create user profile in Neon database
        try {
          const idToken = await userCredential.user.getIdToken();
          
          // Map frontend fields to backend expected fields
          const userData_storage = {
            // Backend expects underscore field names
            first_name: userData.firstName,   // Backend expects first_name 
            last_name: userData.lastName,     // Backend expects last_name
            email: userData.email,
            password: 'firebase_auth_user',   // Backend requires password field
            role: userData.role,              // Backend expects role (couple/vendor)
            phone: userData.phone,
            ...(userData.role === 'vendor' && {
              business_name: userData.business_name,
              business_type: userData.business_type,
              location: typeof userData.location === 'string' ? userData.location : JSON.stringify(userData.location)
            })
          };

          console.log('📤 Attempting to store user profile in Neon database...');
          console.log('📦 Sending data:', JSON.stringify(userData_storage, null, 2));
          
          const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData_storage)
          });

          console.log('📊 Registration response status:', response.status);

          if (response.ok) {
            const result = await response.json();
            console.log('✅ User profile created in Neon database:', result);
            // Clear any local storage since we successfully stored in backend
            localStorage.removeItem('weddingbazaar_user_profile');
          } else {
            const errorText = await response.text();
            console.error('❌ Failed to create user profile in Neon:', {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
              sentData: userData_storage
            });
            
            // Store locally as fallback
            localStorage.setItem('weddingbazaar_user_profile', JSON.stringify(userData_storage));
            console.log('💾 User profile stored locally as fallback');
          }
        } catch (backendError) {
          console.warn('⚠️ Backend registration failed, storing locally:', backendError);
          
          // Store locally as fallback
          const userData_storage = {
            firebaseUid: userCredential.user.uid,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            role: userData.role,
            user_type: userData.role
          };
          localStorage.setItem('weddingbazaar_user_profile', JSON.stringify(userData_storage));
          console.log('💾 User profile stored locally due to error');
        }

        console.log('✅ Hybrid registration completed');
      } else {
        console.log('🐘 Firebase not configured, using backend-only registration');
        
        // Fallback to backend registration
        const backendUserData = {
          email: userData.email,
          password: userData.password,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          role: userData.role,            ...(userData.role === 'vendor' && {
              business_name: userData.business_name,
              business_type: userData.business_type,
              location: typeof userData.location === 'string' ? userData.location : JSON.stringify(userData.location) // Backend accepts string for location
          })
        };

        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(backendUserData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Registration failed');
        }

        const result = await response.json();
        console.log('✅ Backend registration successful:', result);

        // Create a basic user object
        const newUser: User = {
          id: result.id || result.user?.id || 'temp-id',
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          phone: userData.phone,
          businessName: userData.business_name,
          emailVerified: false, // Backend doesn't have email verification
        };

        setUser(newUser);
        localStorage.setItem('cached_user_data', JSON.stringify(newUser));
        
        console.log('✅ Backend-only registration completed');
      }

    } catch (error: any) {
      console.error('❌ Registration error:', error);
      setIsLoading(false);
      throw error;
    }
  };

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
      await firebaseAuthService.sendEmailVerification();
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
      
      // Sign up with Firebase using Google
      const userCredential = await firebaseAuthService.registerWithGoogle();
      console.log('✅ Google registration successful');

      // Map frontend fields to backend expected fields
      const userData_storage = {
        // Backend expects camelCase field names
        firstName: userCredential.user.displayName?.split(' ')[0] || '',
        lastName: userCredential.user.displayName?.split(' ').slice(1).join(' ') || '',
        email: userCredential.user.email || '',
        password: 'google_oauth_user',    // Backend requires password field
        role: userType || 'couple',       // Backend expects role (couple/vendor)
        phone: ''                         // Google doesn't provide phone by default
      };

      try {
        console.log('📤 Attempting to store Google user profile in Neon database...');
        console.log('🎯 User role being stored:', userData_storage.role);
        console.log('📦 Sending Google data:', JSON.stringify(userData_storage, null, 2));
        
        const idToken = await userCredential.user.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData_storage)
        });

        console.log('📊 Google registration response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Google user profile created in Neon database:', result);
          // Clear any local storage since we successfully stored in backend
          localStorage.removeItem('weddingbazaar_user_profile');
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to create Google user profile in Neon:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            sentData: userData_storage
          });
          
          // Store locally as fallback
          localStorage.setItem('weddingbazaar_user_profile', JSON.stringify(userData_storage));
          console.log('💾 Google user profile stored locally as fallback');
        }
      } catch (backendError) {
        console.warn('⚠️ Google backend registration failed, storing locally:', backendError);
        
        // Store locally as fallback
        localStorage.setItem('weddingbazaar_user_profile', JSON.stringify(userData_storage));
        console.log('💾 Google user profile stored locally due to error');
      }

      const newUser: User = {
        id: userCredential.user.uid, // Use Firebase UID as ID
        email: userData_storage.email,
        firstName: userData_storage.firstName,
        lastName: userData_storage.lastName,
        role: userData_storage.role,
        phone: userData_storage.phone,
        businessName: '', // No business name from Google by default  
        emailVerified: true, // Assume email is verified through Google
      };

      setUser(newUser);
      localStorage.setItem('cached_user_data', JSON.stringify(newUser));
      
      console.log('✅ Google registration completed');
      return newUser;
      
    } catch (error: any) {
      console.error('❌ Google registration error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated: !!user && !!firebaseUser,
    isLoading,
    isEmailVerified: firebaseUser?.emailVerified || false,
    login,
    register,
    logout,
    setUser,
    sendEmailVerification,
    reloadUser,
    loginWithGoogle,
    registerWithGoogle
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
