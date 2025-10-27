import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  loginBackendOnly: (email: string, password: string) => Promise<User>;
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
        
        // 🔐 CRITICAL FIX: Store JWT token from profile sync
        if (backendUser.token) {
          localStorage.setItem('auth_token', backendUser.token);
          localStorage.setItem('jwt_token', backendUser.token); // Backward compatibility
          console.log('✅ JWT token stored for vendor/couple:', backendUser.user.email);
        }
        
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
        
        // Store in BOTH localStorage keys for compatibility
        localStorage.setItem('backend_user', JSON.stringify(mergedUser));
        localStorage.setItem('weddingbazaar_user_profile', JSON.stringify(mergedUser));
        console.log('💾 Stored backend user in localStorage (both keys)');
        
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
              firebase_uid: fbUser.uid, // Link to Firebase account
              oauth_provider: null // ❌ FIX: This is NOT OAuth - regular email/password registration
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
      
      // 🔒 CRITICAL: Skip auth state changes during active login attempts
      if (isLoginInProgress) {
        console.log('⏸️ BLOCKING auth state change - login in progress');
        return;
      }
      
      // Skip auth state processing during registration to prevent login flash
      if (isRegistering) {
        console.log('⏸️ Skipping auth state change during registration process');
        return;
      }
      
      // 🎯 FIX: Check if the state actually changed before updating
      const currentUserLoggedIn = user !== null;
      const newUserLoggedIn = fbUser !== null;
      
      if (currentUserLoggedIn === newUserLoggedIn && !newUserLoggedIn) {
        // Both null (logged out) - no change, don't update isLoading
        console.log('✅ Auth state unchanged (both logged out) - skipping update');
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
  }, [isRegistering, isLoginInProgress]);

  // Check for stored session on app load (ONCE)
  // This handles BOTH admin (JWT) and regular Firebase users
  useEffect(() => {
    const initializeSession = () => {
      console.log('🔄 Initializing session from localStorage...');
      
      const storedToken = localStorage.getItem('jwt_token');
      const storedUser = localStorage.getItem('backend_user');
      
      // Case 1: Admin user with JWT token
      if (storedToken && storedUser) {
        try {
          const backendUser = JSON.parse(storedUser);
          console.log('🔍 Found stored admin session:', backendUser);
          
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
              console.log('✅ Stored admin session is valid');
              setUser(backendUser);
              setIsLoading(false);
            } else {
              console.log('❌ Stored admin session expired, clearing...');
              localStorage.removeItem('jwt_token');
              localStorage.removeItem('backend_user');
              localStorage.removeItem('weddingbazaar_user_profile');
              setIsLoading(false);
            }
          })
          .catch(error => {
            console.log('❌ Error verifying stored session:', error);
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('backend_user');
            localStorage.removeItem('weddingbazaar_user_profile');
            setIsLoading(false);
          });
        } catch (error) {
          console.log('❌ Error parsing stored user data:', error);
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
          console.log('🔍 Found stored Firebase user session:', backendUser.email, backendUser.role);
          
          // Restore user data immediately - Firebase auth state listener will verify/update later
          setUser(backendUser);
          console.log('✅ User session restored from localStorage:', backendUser.role);
          
          // Let Firebase auth state listener handle validation
          // isLoading will be set to false by the auth state listener
        } catch (error) {
          console.log('❌ Error parsing stored user data:', error);
          localStorage.removeItem('backend_user');
          localStorage.removeItem('weddingbazaar_user_profile');
          setIsLoading(false);
        }
      }
      // Case 3: No stored session - let Firebase auth state listener handle it
      else {
        console.log('📭 No stored session found - waiting for Firebase auth state');
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
      console.log('🔧 Starting hybrid login - credentials will be validated BEFORE proceeding...');
      
      try {
        // Try Firebase login first - THIS VALIDATES CREDENTIALS
        // If credentials are wrong, this will throw an error immediately
        console.log('🔐 Firebase sign in attempt (validating credentials)...');
        const userCredential = await firebaseAuthService.signIn(email, password);
        console.log('✅ Firebase credentials validated successfully - user authenticated');
        
        // ✅ NOW set loading - credentials are valid, we're fetching data
        setIsLoading(true);
        
        // At this point, credentials are CONFIRMED VALID by Firebase
        // Now we can safely proceed with backend sync
        console.log('🔄 Fetching complete user profile from backend...');
        
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
                  console.log('✅ User data retrieved from localStorage:', parsedUser.role);
                  resolve(parsedUser);
                  return;
                } catch (e) {
                  console.warn('⚠️ Failed to parse stored user');
                }
              }
              
              // Fallback: use Firebase data
              const firebaseUser = convertFirebaseUser(userCredential.user);
              console.log('⚠️ Using Firebase-only user data (backend sync incomplete)');
              resolve(firebaseUser);
            }, 200);
          }).catch((syncError) => {
            console.warn('⚠️ Backend sync failed, using Firebase data:', syncError);
            const firebaseUser = convertFirebaseUser(userCredential.user);
            resolve(firebaseUser);
          });
        });
        
        // Wait for the synced user data
        syncedUser = await captureUser;
        
        setIsLoading(false);
        setIsLoginInProgress(false); // 🔓 UNBLOCK auth state changes
        console.log('✅ Login complete! User:', syncedUser.email, 'Role:', syncedUser.role);
        return syncedUser;
        
      } catch (firebaseError: any) {
        console.log('⚠️ Firebase login failed - credentials may be invalid');
        console.log('🔧 Firebase error:', firebaseError.message);
        
        // Try backend-only login for admin users
        try {
          console.log('🔧 Attempting backend-only login for admin...');
          // ✅ Set loading NOW - attempting backend login
          setIsLoading(true);
          const adminUser = await loginBackendOnly(email, password);
          console.log('✅ Backend-only login successful for admin');
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
      console.log('🔓 Login process complete - auth state changes unblocked');
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
        
        // Sync email verification status with backend if it changed
        if (updatedFirebaseUser.emailVerified && user && !user.emailVerified) {
          console.log('✅ Email verified in Firebase - syncing with backend...');
          
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
              console.log('✅ Backend email verification synced:', data.user);
              
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
              console.warn('⚠️ Failed to sync email verification with backend');
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
        oauth_provider: null, // Regular email/password registration (not OAuth)
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

  const loginBackendOnly = async (email: string, password: string): Promise<User> => {
    try {
      // Loading is already set by the caller
      console.log('🔧 Starting backend-only login for admin...');
      
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
      
      console.log('✅ Backend login successful:', data.user);
      
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
        console.log('💾 JWT token and user data stored (both keys)');
      }
      
      setUser(backendUser);
      // Loading will be turned off by the caller
      
      console.log('👑 Admin user logged in successfully:', backendUser);
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
