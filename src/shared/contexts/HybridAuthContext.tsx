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
      console.log('🔧 Starting Firebase-first registration with email verification...');
      
      // Step 1: Create Firebase user and send email verification
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

      console.log('� Creating Firebase user with email verification...');
      const result = await firebaseAuthService.registerWithEmailVerification(registrationData);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      console.log('✅ Firebase user created, email verification sent');
      console.log('📧 User must verify email before they can login');
      
      // Note: Backend user creation will happen automatically when user 
      // verifies email and signs in (handled by syncWithBackend)

    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
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
