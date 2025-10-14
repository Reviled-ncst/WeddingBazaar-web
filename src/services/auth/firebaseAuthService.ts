import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
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
   * Register a new user with email verification
   */
  async registerWithEmailVerification(data: RegistrationData): Promise<UserCredential> {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );

      // Update display name
      await updateProfile(userCredential.user, {
        displayName: `${data.firstName} ${data.lastName}`
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      console.log('✅ Firebase Auth: User created and verification email sent');
      return userCredential;
    } catch (error: any) {
      console.error('❌ Firebase Auth Registration Error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Send email verification to current user
   */
  async sendEmailVerification(): Promise<void> {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    try {
      await sendEmailVerification(user);
      console.log('✅ Firebase Auth: Verification email sent');
    } catch (error: any) {
      console.error('❌ Firebase Auth: Error sending verification email:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<UserCredential> {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified (only for email/password users, not Google OAuth)
      if (!userCredential.user.emailVerified) {
        // Sign out the user since email is not verified
        await signOut(auth);
        throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
      }
      
      console.log('✅ Firebase Auth: User signed in with verified email');
      return userCredential;
    } catch (error: any) {
      console.error('❌ Firebase Auth Sign In Error:', error);
      throw this.handleFirebaseError(error);
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
    const user = auth.currentUser;
    return user ? user.emailVerified : false;
  }

  /**
   * Reload current user to get updated info
   */
  async reloadUser(): Promise<FirebaseAuthUser | null> {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    try {
      await user.reload();
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
  async registerWithGoogle(userType: 'couple' | 'vendor' = 'couple'): Promise<UserCredential> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const userCredential = await signInWithPopup(auth, provider);
      
      // Google users are automatically verified
      console.log('✅ Firebase Auth: User registered/signed in with Google');
      return userCredential;
    } catch (error: any) {
      console.error('❌ Firebase Auth Google Registration Error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Send sign-in link to email (passwordless authentication)
   */
  async sendSignInLinkToEmail(email: string): Promise<void> {
    try {
      const actionCodeSettings = {
        // URL you want to redirect back to - make sure this domain is authorized in Firebase Console
        url: `${window.location.origin}/complete-signin`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Save the email locally so you don't need to ask the user for it again
      // if they open the link on the same device
      window.localStorage.setItem('emailForSignIn', email);
      
      console.log('✅ Firebase Auth: Sign-in link sent to email');
    } catch (error: any) {
      console.error('❌ Firebase Auth: Error sending sign-in link:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Complete sign-in with email link
   */
  async signInWithEmailLink(email: string, emailLink: string): Promise<UserCredential> {
    try {
      if (!isSignInWithEmailLink(auth, emailLink)) {
        throw new Error('Invalid sign-in link');
      }

      const userCredential = await signInWithEmailLink(auth, email, emailLink);
      
      // Clear email from storage
      window.localStorage.removeItem('emailForSignIn');
      
      console.log('✅ Firebase Auth: Signed in with email link');
      return userCredential;
    } catch (error: any) {
      console.error('❌ Firebase Auth: Error signing in with email link:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Check if current URL is a sign-in with email link
   */
  isSignInWithEmailLink(url: string = window.location.href): boolean {
    return isSignInWithEmailLink(auth, url);
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
