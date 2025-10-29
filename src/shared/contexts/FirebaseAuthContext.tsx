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
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<void>;
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
  };
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isEmailVerified = firebaseUser?.emailVerified || user?.emailVerified || false;

  // Firebase Auth State Listener
  useEffect(() => {
    
    
    const unsubscribe = firebaseAuthService.onAuthStateChanged((authUser) => {
      
      setFirebaseUser(authUser);
      
      if (authUser) {
        // When Firebase user exists, sync with our backend user data
        syncWithBackendUser(authUser);
      } else {
        // Firebase user logged out, clear local user
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('cached_user_data');
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncWithBackendUser = async (firebaseUser: FirebaseAuthUser) => {
    try {
      // Try to get user data from backend
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // Check if we have cached user data
      const cachedUserData = localStorage.getItem('cached_user_data');
      if (cachedUserData) {
        try {
          const userData = JSON.parse(cachedUserData);
          // Update with Firebase info
          const updatedUser = {
            ...userData,
            emailVerified: firebaseUser.emailVerified,
            firebaseUid: firebaseUser.uid
          };
          setUser(updatedUser);
          
          return;
        } catch (e) {
          
        }
      }

      // If no cached data and backend is available, try to get user profile
      // For now, create a user object from Firebase data
      const backendUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        role: 'couple', // Default role, can be updated later
        emailVerified: firebaseUser.emailVerified,
        firebaseUid: firebaseUser.uid
      };

      setUser(backendUser);
      localStorage.setItem('cached_user_data', JSON.stringify(backendUser));
      

    } catch (error) {
      console.error('❌ Error syncing with backend user:', error);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      
      
      
      // Register with Firebase Auth
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

      

      // Create user object for our app
      const newUser: User = {
        id: userCredential.user.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        phone: userData.phone,
        businessName: userData.business_name,
        emailVerified: false, // Will be updated by Firebase auth state listener
        firebaseUid: userCredential.user.uid
      };

      // Cache user data
      localStorage.setItem('cached_user_data', JSON.stringify(newUser));
      
      // Note: setUser will be called by the Firebase auth state listener
      

    } catch (error: any) {
      console.error('❌ Registration error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      
      
      
      // Sign in with Firebase
      const userCredential = await firebaseAuthService.signIn(email, password);
      
      
      
      // User data will be set by the Firebase auth state listener
      // For now, return a basic user object
      const loggedInUser: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email || email,
        firstName: userCredential.user.displayName?.split(' ')[0] || 'User',
        lastName: userCredential.user.displayName?.split(' ').slice(1).join(' ') || '',
        role: 'couple', // This should be fetched from backend in a real app
        emailVerified: userCredential.user.emailVerified,
        firebaseUid: userCredential.user.uid
      };

      return loggedInUser;

    } catch (error: any) {
      console.error('❌ Login error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      
      
      // Sign out from Firebase
      await firebaseAuthService.signOut();
      
      // Clear local data
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('cached_user_data');
      
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear local state even if Firebase logout fails
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('cached_user_data');
    }
  };

  const sendEmailVerification = async (): Promise<void> => {
    try {
      await firebaseAuthService.sendEmailVerification();
      
    } catch (error) {
      console.error('❌ Error sending email verification:', error);
      throw error;
    }
  };

  const reloadUser = async (): Promise<void> => {
    try {
      await firebaseAuthService.reloadUser();
      
    } catch (error) {
      console.error('❌ Error reloading user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated,
    isLoading,
    isEmailVerified,
    login,
    register,
    logout,
    setUser,
    sendEmailVerification,
    reloadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export type { User, RegisterData };
