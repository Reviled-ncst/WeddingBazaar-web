import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  reload
} from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';
import { auth } from '../../config/firebase';

export interface FirebaseAuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'couple' | 'vendor';
  businessName?: string;
  businessType?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

class FirebaseAuthService {
  /**
   * Register a new user with Firebase and send email verification
   * This creates the Firebase user and stores profile data for later backend creation
   */
  async registerWithEmailVerification(data: RegistrationData): Promise<{ success: boolean; message: string; firebaseUid?: string; user?: User }> {
    if (!auth) {
      console.error('❌ Firebase Auth is not configured - check environment variables');
      throw new Error('Firebase Auth is not configured');
    }

    try {
      console.log('🔧 Creating Firebase user with email verification...');
      console.log('🔧 Firebase config check:', {
        hasAuth: !!auth,
        email: data.email,
        dataReceived: Object.keys(data)
      });
      
      // Step 1: Create Firebase user account
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      
      console.log('✅ Firebase user created:', firebaseUser.uid);
      
      // Step 2: Send email verification (user remains logged in)
      await sendEmailVerification(firebaseUser, {
        url: `${window.location.origin}/?verified=true`, // Redirect URL after verification
        handleCodeInApp: false
      });
      
      console.log('📧 Firebase email verification sent to:', data.email);
      console.log('✅ User remains logged in but needs to verify email for full access');
      
      // Step 4: Store registration data for later backend creation
      const pendingProfile = {
        firebase_uid: firebaseUser.uid,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        user_type: data.userType,
        phone: data.phone,
        business_name: data.businessName,
        business_type: data.businessType,
        location: data.location
      };
      
      localStorage.setItem('pending_user_profile', JSON.stringify(pendingProfile));
      console.log('💾 Stored pending user profile for post-verification creation');
      
      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account before logging in.',
        firebaseUid: firebaseUser.uid,
        user: firebaseUser
      };
      
    } catch (error: any) {
      console.error('❌ Firebase registration error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Sign in user (only if email is verified)
   */
  async signIn(email: string, password: string): Promise<UserCredential> {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }

    try {
      console.log('🔐 Firebase sign in attempt...');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Allow login regardless of email verification status
      // Feature restrictions will be handled by the UI based on verification state
      if (!user.emailVerified) {
        console.log('⚠️ User logged in with unverified email - limited access will be enforced by UI:', email);
      } else {
        console.log('✅ User logged in with verified email - full access granted:', email);
      }
      
      console.log('✅ Firebase sign in successful:', email);
      return userCredential;
      
    } catch (error: any) {
      console.error('❌ Firebase sign in error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Resend email verification for current user
   */
  async resendEmailVerification(): Promise<{ success: boolean; message: string }> {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }
      
      if (user.emailVerified) {
        return {
          success: false,
          message: 'Email is already verified'
        };
      }
      
      await sendEmailVerification(user, {
        url: `${window.location.origin}/?verified=true`,
        handleCodeInApp: false
      });
      
      console.log('📧 Email verification resent to:', user.email);
      
      return {
        success: true,
        message: 'Verification email sent! Please check your inbox.'
      };
      
    } catch (error: any) {
      console.error('❌ Resend verification error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Check email verification status and reload user
   */
  async checkEmailVerification(): Promise<{ isVerified: boolean; user?: User }> {
    if (!auth) {
      return { isVerified: false };
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        return { isVerified: false };
      }
      
      // Reload user data from Firebase
      await reload(user);
      
      return {
        isVerified: user.emailVerified,
        user: user.emailVerified ? user : undefined
      };
      
    } catch (error: any) {
      console.error('❌ Check verification error:', error);
      return { isVerified: false };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }

    try {
      await signOut(auth);
      console.log('✅ Firebase Auth: User signed out');
    } catch (error: any) {
      console.error('❌ Firebase Auth Sign Out Error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }

    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Firebase Auth: Password reset email sent');
    } catch (error: any) {
      console.error('❌ Firebase Auth: Error sending password reset email:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: (user: FirebaseAuthUser | null) => void): () => void {
    if (!auth) {
      console.warn('Firebase Auth not configured, returning dummy unsubscribe');
      return () => {};
    }

    return onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        const authUser: FirebaseAuthUser = {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          photoURL: user.photoURL
        };
        callback(authUser);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Get current user
   */
  getCurrentUser(): FirebaseAuthUser | null {
    if (!auth) return null;
    
    const user = auth.currentUser;
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }

  /**
   * Get current user's ID token
   */
  async getCurrentUserToken(): Promise<string> {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    try {
      const token = await user.getIdToken();
      return token;
    } catch (error: any) {
      console.error('❌ Firebase Auth: Error getting ID token:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Check if current user's email is verified
   */
  isEmailVerified(): boolean {
    if (!auth) return false;
    
    const user = auth.currentUser;
    return user ? user.emailVerified : false;
  }

  /**
   * Reload current user to get updated info
   */
  async reloadUser(): Promise<FirebaseAuthUser | null> {
    if (!auth) return null;
    
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    try {
      await reload(user);
      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error: any) {
      console.error('❌ Firebase Auth: Error reloading user:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<UserCredential> {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }

    try {
      const provider = new GoogleAuthProvider();
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      const userCredential = await signInWithPopup(auth, provider);
      console.log('✅ Firebase Auth: User signed in with Google');
      return userCredential;
    } catch (error: any) {
      console.error('❌ Firebase Auth Google Sign In Error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Register/Sign in with Google OAuth (handles both new and existing users)
   */
  async registerWithGoogle(userType: 'couple' | 'vendor' | 'coordinator' = 'couple'): Promise<UserCredential> {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const userCredential = await signInWithPopup(auth, provider);
      
      // Google users are automatically verified
      console.log('✅ Firebase Auth: User registered/signed in with Google');
      
      // Store user type for backend profile creation
      const pendingProfile = {
        firebase_uid: userCredential.user.uid,
        email: userCredential.user.email,
        first_name: userCredential.user.displayName?.split(' ')[0] || '',
        last_name: userCredential.user.displayName?.split(' ').slice(1).join(' ') || '',
        user_type: userType,
        phone: '',
        business_name: userType === 'vendor' ? 'Google Vendor' : undefined,
        business_type: userType === 'vendor' ? 'other' : undefined
      };
      
      localStorage.setItem('pending_user_profile', JSON.stringify(pendingProfile));
      console.log('💾 Stored Google user profile for backend creation');
      
      return userCredential;
    } catch (error: any) {
      console.error('❌ Firebase Auth Google Registration Error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Handle Firebase errors and return user-friendly messages
   */
  private handleFirebaseError(error: any): Error {
    let message = 'An unexpected error occurred';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email address is already registered. Please use a different email or sign in.';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Please choose a stronger password with at least 6 characters.';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection and try again.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/operation-not-allowed':
        message = 'Email/password authentication is not enabled. Please contact support.';
        break;
      default:
        message = error.message || 'An error occurred during authentication';
    }

    return new Error(message);
  }
}

export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
