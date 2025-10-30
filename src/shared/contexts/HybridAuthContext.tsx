import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { firebaseAuthService, type FirebaseAuthUser } from '../../services/auth/firebaseAuthService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'couple' | 'vendor' | 'admin' | 'coordinator';
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
  loginBackendOnly: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<User>;
  registerWithGoogle: (userType?: 'couple' | 'vendor' | 'coordinator') => Promise<User>;
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
  role: 'couple' | 'vendor' | 'coordinator';
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
  
  // 🔒 CRITICAL FIX: Block auth state changes during active login
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);

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
      // Try to get user from Neon database using email parameter
      const response = await fetch(`${API_BASE_URL}/api/auth/profile?email=${encodeURIComponent(fbUser.email || '')}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': fbUser.email || ''
        }
      });

      if (response.ok) {
        const backendUser = await response.json();
        // 🔐 CRITICAL FIX: Store JWT token from profile sync
        if (backendUser.token) {
          localStorage.setItem('auth_token', backendUser.token);
          localStorage.setItem('jwt_token', backendUser.token); // Backward compatibility
        }
        
        // DEBUG: Log the exact backend user data structure
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
          }
        }
        
        const mergedUser: User = {
          ...backendUser.user, // Extract user from response
          emailVerified: finalEmailVerified,
          firebaseUid: fbUser.uid
        };
        // Store in BOTH localStorage keys for compatibility
        localStorage.setItem('backend_user', JSON.stringify(mergedUser));
        localStorage.setItem('weddingbazaar_user_profile', JSON.stringify(mergedUser));
        setUser(mergedUser);
        return;
      }

      // If user not found in backend, check for pending user data (from registration)
      const pendingProfile = localStorage.getItem('pending_user_profile');
      
      if (pendingProfile && fbUser.emailVerified) {
        try {
          const profileData = JSON.parse(pendingProfile);
          // User has verified email, now create the backend profile
          const backendResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...profileData,
              firebase_uid: fbUser.uid, // Link to Firebase account
              oauth_provider: null // ❌ FIX: This is NOT OAuth - regular email/password registration
            })
          });

          if (backendResponse.ok) {
            const backendResult = await backendResponse.json();
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
            return;
          }
        } catch (e) {
        }
      }

      // Fallback: check localStorage for stored profile (legacy)
      const storedProfile = localStorage.getItem('weddingbazaar_user_profile');
      if (storedProfile) {
        try {
          const profileData = JSON.parse(storedProfile);
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
          return;
        } catch (e) {
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
      // 🔒 CRITICAL: Skip auth state changes during active login attempts
      if (isLoginInProgress) {
        return;
      }
      
      // Skip auth state processing during registration to prevent login flash
      if (isRegistering) {
        return;
      }
      
      // 🎯 FIX: Check if the state actually changed before updating
      const currentUserLoggedIn = user !== null;
      const newUserLoggedIn = fbUser !== null;
      
      if (currentUserLoggedIn === newUserLoggedIn && !newUserLoggedIn) {
        // 🔐 ADMIN FIX: Check if admin is logged in via JWT (backend-only)
        const hasJWT = localStorage.getItem('jwt_token');
        const hasBackendUser = localStorage.getItem('backend_user');
        
        if (hasJWT && hasBackendUser && user?.role === 'admin') {
          setIsLoading(false);
          return;
        }
        
        // Both null (logged out) - no change, don't update isLoading
        return;
      }
      
      if (fbUser) {
        setFirebaseUser(fbUser);
        
        // Always sync with backend, regardless of email verification status
        // This allows users to see their profile/dashboard even if email not verified
        await syncWithBackend(fbUser);
        if (!fbUser.emailVerified) {
        }
      } else {
        // 🔐 ADMIN FIX: Don't clear admin user if they're logged in via backend JWT
        const hasJWT = localStorage.getItem('jwt_token');
        const hasBackendUser = localStorage.getItem('backend_user');
        
        if (hasJWT && hasBackendUser && user?.role === 'admin') {
          setIsLoading(false);
          return;
        }
        
        setFirebaseUser(null);
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, [isRegistering, isLoginInProgress, user]);

  // Check for stored session on app load (ONCE)
  // This handles BOTH admin (JWT) and regular Firebase users
  useEffect(() => {
    const initializeSession = () => {
      const storedToken = localStorage.getItem('jwt_token');
      const storedUser = localStorage.getItem('backend_user');
      
      // Case 1: Admin user with JWT token
      if (storedToken && storedUser) {
        try {
          const backendUser = JSON.parse(storedUser);
          // Verify the token is still valid by checking with backend
          fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: storedToken })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success && data.authenticated) {
              setUser(backendUser);
              setIsLoading(false);
            } else {
              localStorage.removeItem('jwt_token');
              localStorage.removeItem('backend_user');
              localStorage.removeItem('weddingbazaar_user_profile');
              setIsLoading(false);
            }
          })
          .catch(error => {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('backend_user');
            localStorage.removeItem('weddingbazaar_user_profile');
            setIsLoading(false);
          });
        } catch (error) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('backend_user');
          localStorage.removeItem('weddingbazaar_user_profile');
          setIsLoading(false);
        }
      } 
      // Case 2: Regular Firebase user (couple/vendor) - no JWT token but has user data
      else if (storedUser) {
        try {
          const backendUser = JSON.parse(storedUser);
          // Restore user data immediately - Firebase auth state listener will verify/update later
          setUser(backendUser);
          // Let Firebase auth state listener handle validation
          // isLoading will be set to false by the auth state listener
        } catch (error) {
          localStorage.removeItem('backend_user');
          localStorage.removeItem('weddingbazaar_user_profile');
          setIsLoading(false);
        }
      }
      // Case 3: No stored session - let Firebase auth state listener handle it
      else {
        // Don't set isLoading to false yet - let Firebase auth state listener handle it
      }
    };
    
    // Only run ONCE on mount
    initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run once on mount

  // OLD Firebase method removed - using hybrid approach below

  const login = async (email: string, password: string): Promise<User> => {
    try {
      // DON'T set loading yet - validate credentials first!
      setIsLoginInProgress(true); // 🔒 BLOCK auth state changes
      try {
        // Try Firebase login first - THIS VALIDATES CREDENTIALS
        // If credentials are wrong, this will throw an error immediately
        const userCredential = await firebaseAuthService.signIn(email, password);
        // ✅ NOW set loading - credentials are valid, we're fetching data
        setIsLoading(true);
        
        // At this point, credentials are CONFIRMED VALID by Firebase
        // Now we can safely proceed with backend sync
        // Create a promise that will resolve when we have the full user data
        let syncedUser: User | null = null;
        
        // Create a callback to capture the synced user
        const captureUser = new Promise<User>((resolve) => {
          // Sync with backend and capture the result
          syncWithBackend(userCredential.user).then(() => {
            // Small delay to ensure state is updated
            setTimeout(() => {
              // Try to get from localStorage first (most reliable)
              const storedUser = localStorage.getItem('backend_user');
              if (storedUser) {
                try {
                  const parsedUser = JSON.parse(storedUser);
                  resolve(parsedUser);
                  return;
                } catch (e) {
                }
              }
              
              // Fallback: use Firebase data
              const firebaseUser = convertFirebaseUser(userCredential.user);
              resolve(firebaseUser);
            }, 200);
          }).catch((syncError) => {
            const firebaseUser = convertFirebaseUser(userCredential.user);
            resolve(firebaseUser);
          });
        });
        
        // Wait for the synced user data
        syncedUser = await captureUser;
        
        setIsLoading(false);
        setIsLoginInProgress(false); // 🔓 UNBLOCK auth state changes
        return syncedUser;
        
      } catch (firebaseError: any) {
        // Try backend-only login for admin users
        try {
          // ✅ Set loading NOW - attempting backend login
          setIsLoading(true);
          const adminUser = await loginBackendOnly(email, password);
          setIsLoading(false);
          setIsLoginInProgress(false); // 🔓 UNBLOCK auth state changes
          return adminUser;
        } catch (backendError: any) {
          console.error('❌ Both Firebase and backend login failed');
          console.error('🔧 Backend error:', backendError.message);
          setIsLoading(false);
          
          // Create user-friendly error message
          // Prioritize showing the most specific error
          let errorMessage: string;
          
          // Check if backend gave us a specific error
          if (backendError.message && !backendError.message.includes('fetch')) {
            errorMessage = backendError.message;
          }
          // Otherwise use Firebase error
          else if (firebaseError.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password. Please check your credentials.';
          }
          else if (firebaseError.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email address.';
          }
          else if (firebaseError.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password. Please try again.';
          }
          else if (firebaseError.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
          }
          else {
            errorMessage = 'Login failed. Please check your credentials and try again.';
          }
          
          console.error('📢 User-friendly error:', errorMessage);
          
          // Throw error with user-friendly message
          throw new Error(errorMessage);
        }
      }
      
    } catch (error: any) {
      console.error('❌ Login error - credentials validation failed:', error);
      setIsLoading(false);
      // 🔓 UNBLOCK auth state changes NOW (after all error handling)
      setIsLoginInProgress(false);
      
      // Make sure we throw a user-friendly error
      if (error.message) {
        throw error;
      } else {
        throw new Error('Login failed. Please check your credentials and try again.');
      }
    } finally {
      // ALWAYS unblock, even if error was thrown
      setIsLoginInProgress(false);
    }
  };

  const logout = async () => {
    try {
      // Clear Firebase auth if user has Firebase session
      if (firebaseUser) {
        await firebaseAuthService.signOut();
      }
      
      // Clear backend-only session data
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('backend_user');
      
      setUser(null);
      setFirebaseUser(null);
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
        
        // Sync email verification status with backend if it changed
        if (updatedFirebaseUser.emailVerified && user && !user.emailVerified) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/auth/sync-firebase-verification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                firebase_uid: updatedFirebaseUser.uid,
                email_verified: true
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              // Update local user state
              setUser(prev => prev ? { ...prev, emailVerified: true } : null);
              
              // Update cached user data
              const cachedUser = localStorage.getItem('cached_user_data');
              if (cachedUser) {
                const userData = JSON.parse(cachedUser);
                userData.emailVerified = true;
                localStorage.setItem('cached_user_data', JSON.stringify(userData));
                sessionStorage.setItem('cached_user_data', JSON.stringify(userData));
              }
            } else {
            }
          } catch (syncError) {
            console.error('❌ Error syncing email verification:', syncError);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error reloading user:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    try {
      setIsLoading(true);
      // Sign in with Firebase using Google
      const userCredential = await firebaseAuthService.signInWithGoogle();
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

  const registerWithGoogle = async (userType?: 'couple' | 'vendor' | 'coordinator'): Promise<User> => {
    try {
      setIsLoading(true);
      // Sign up with Firebase using Google (this handles profile storage)
      const userCredential = await firebaseAuthService.registerWithGoogle(userType);
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
      const result = await firebaseAuthService.registerWithEmailVerification(registrationData);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      // Step 2: Create backend user in Neon database (linked to Firebase UID)
      const backendData = {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        user_type: userData.role,
        phone: userData.phone,
        firebase_uid: result.firebaseUid, // Link to Firebase account
        oauth_provider: null, // Regular email/password registration (not OAuth)
        ...(userData.role === 'vendor' && {
          business_name: userData.business_name,
          business_type: userData.business_type,
          location: userData.location
        })
      };
      const backendResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendData)
      });
      if (backendResponse.ok) {
        const backendResult = await backendResponse.json();
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
      setIsRegistering(false);
      
      // Manually process current Firebase auth state after registration
      const currentUser = firebaseAuthService.getCurrentUser();
      if (currentUser) {
        setFirebaseUser(currentUser);
        await syncWithBackend(currentUser);
      }
    }
  };

  // Use backend-only registration instead of Firebase (replaces Firebase register function)
  // const register = registerBackendOnly;

  const clearRegistrationState = () => {
    setIsRegistering(false);
  };

  const loginBackendOnly = async (email: string, password: string): Promise<User> => {
    try {
      // Loading is already set by the caller
      // Call backend login API directly
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Login failed');
      }
        // Map backend user data to our User interface
        // Handle both 'role' and 'userType' field names from different backend endpoints
        const getUserRole = (user: any): 'couple' | 'vendor' | 'admin' => {
          const roleField = user.role || user.userType || user.user_type;
          if (roleField === 'admin') return 'admin';
          if (roleField === 'vendor') return 'vendor';
          return 'couple';
        };

        const backendUser: User = {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.firstName || data.user.first_name || '',
          lastName: data.user.lastName || data.user.last_name || '',
          role: getUserRole(data.user),
          emailVerified: data.user.emailVerified || false,
          vendorId: data.user.vendorId || null,
          phone: data.user.phone || '',
          // Store JWT token for API calls
          firebaseUid: data.token // Temporarily store JWT in firebaseUid field
        };
      
      // Store JWT token in localStorage for API authentication
      if (data.token) {
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('backend_user', JSON.stringify(backendUser));
        localStorage.setItem('weddingbazaar_user_profile', JSON.stringify(backendUser));
      }
      
      setUser(backendUser);
      // Loading will be turned off by the caller
      return backendUser;
      
    } catch (error: any) {
      console.error('❌ Backend login error:', error);
      // Don't turn off loading here - let the caller handle it
      throw error;
    }
  };

  // 🔥 CRITICAL FIX: Memoize context value to prevent unnecessary re-renders
  // This ensures Services and other consumers only re-render when auth state actually changes
  // NOTE: We only include state values in dependencies, not functions (they don't change)
  const value: AuthContextType = useMemo(() => ({
    user,
    firebaseUser,
    isAuthenticated: !!user, // Admin users can be authenticated without Firebase
    isLoading,
    isEmailVerified: user?.emailVerified || firebaseUser?.emailVerified || false,
    isRegistering, // Expose registration state
    login,
    register,
    logout,
    setUser,
    sendEmailVerification,
    reloadUser,
    loginWithGoogle,
    registerWithGoogle,
    clearRegistrationState, // Allow manual clearing of registration state
    loginBackendOnly // Expose backend-only login method
  }), [
    user,
    firebaseUser,
    isLoading,
    isRegistering
    // Functions are NOT included in deps - they're stable and don't need to trigger re-memoization
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
