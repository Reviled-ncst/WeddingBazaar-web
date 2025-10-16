import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import type { ConfirmationResult, User } from 'firebase/auth';
import { auth } from '../../config/firebase';

export interface PhoneVerificationResult {
  success: boolean;
  message: string;
  verificationId?: string;
  confirmationResult?: ConfirmationResult;
}

export interface PhoneVerificationConfirmResult {
  success: boolean;
  message: string;
  user?: User;
}

class FirebasePhoneService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  /**
   * Initialize reCAPTCHA verifier for phone verification
   * This should be called before sending SMS
   */
  initializeRecaptcha(containerId: string = 'recaptcha-container'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!auth) {
        reject(new Error('Firebase Auth is not configured'));
        return;
      }

      try {
        // Clean up existing verifier
        if (this.recaptchaVerifier) {
          this.recaptchaVerifier.clear();
        }

        this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: (response: any) => {
            console.log('✅ reCAPTCHA solved:', response);
            resolve();
          },
          'expired-callback': () => {
            console.warn('⚠️ reCAPTCHA expired');
            reject(new Error('reCAPTCHA expired. Please try again.'));
          }
        });

        // Render the reCAPTCHA
        this.recaptchaVerifier.render().then(() => {
          console.log('✅ reCAPTCHA initialized successfully');
          resolve();
        }).catch((error) => {
          console.error('❌ reCAPTCHA render error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('❌ reCAPTCHA initialization error:', error);
        reject(error);
      }
    });
  }

  /**
   * Send SMS verification code to phone number
   */
  async sendVerificationCode(phoneNumber: string): Promise<PhoneVerificationResult> {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }

    if (!this.recaptchaVerifier) {
      throw new Error('reCAPTCHA not initialized. Call initializeRecaptcha() first.');
    }

    try {
      console.log('📱 Sending SMS verification to:', phoneNumber);

      // Ensure phone number is in international format
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Send SMS verification code
      this.confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        this.recaptchaVerifier
      );

      console.log('✅ SMS verification code sent successfully');

      return {
        success: true,
        message: 'Verification code sent to your phone. Please check your messages.',
        confirmationResult: this.confirmationResult
      };

    } catch (error: any) {
      console.error('❌ SMS sending error:', error);
      
      // Clear reCAPTCHA on error so it can be retried
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }

      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Verify the SMS code entered by the user
   */
  async verifyCode(code: string): Promise<PhoneVerificationConfirmResult> {
    if (!this.confirmationResult) {
      throw new Error('No verification in progress. Please send a code first.');
    }

    try {
      console.log('🔐 Verifying SMS code:', code);

      // Confirm the SMS verification code
      const result = await this.confirmationResult.confirm(code);
      const user = result.user;

      console.log('✅ Phone number verified successfully:', user.phoneNumber);

      // Clean up
      this.confirmationResult = null;
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }

      return {
        success: true,
        message: 'Phone number verified successfully!',
        user: user
      };

    } catch (error: any) {
      console.error('❌ SMS verification error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Link phone number to existing user account
   * This is useful when user is already logged in and wants to add phone verification
   */
  async linkPhoneToAccount(phoneNumber: string): Promise<PhoneVerificationResult> {
    if (!auth?.currentUser) {
      throw new Error('No user is currently logged in');
    }

    if (!this.recaptchaVerifier) {
      throw new Error('reCAPTCHA not initialized. Call initializeRecaptcha() first.');
    }

    try {
      console.log('🔗 Linking phone number to account:', phoneNumber);

      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Get phone auth provider credential
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        formattedPhone,
        this.recaptchaVerifier
      );

      console.log('✅ Phone verification ID obtained:', verificationId);

      return {
        success: true,
        message: 'Verification code sent. Please check your phone.',
        verificationId: verificationId
      };

    } catch (error: any) {
      console.error('❌ Phone linking error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Complete phone linking with verification code
   */
  async confirmPhoneLink(verificationId: string, code: string): Promise<PhoneVerificationConfirmResult> {
    if (!auth?.currentUser) {
      throw new Error('No user is currently logged in');
    }

    try {
      console.log('🔐 Confirming phone link with code:', code);

      // Create phone auth credential
      const credential = PhoneAuthProvider.credential(verificationId, code);

      // Link credential to existing account
      const result = await linkWithCredential(auth.currentUser, credential);

      console.log('✅ Phone number linked successfully:', result.user.phoneNumber);

      return {
        success: true,
        message: 'Phone number verified and linked to your account!',
        user: result.user
      };

    } catch (error: any) {
      console.error('❌ Phone link confirmation error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }

  /**
   * Handle Firebase-specific errors
   */
  private handleFirebaseError(error: any): Error {
    const errorCode = error.code;
    const errorMessage = error.message;

    console.error('Firebase Phone Error:', { errorCode, errorMessage });

    switch (errorCode) {
      case 'auth/invalid-phone-number':
        return new Error('Invalid phone number format. Please use international format (+1234567890).');
      
      case 'auth/missing-phone-number':
        return new Error('Phone number is required.');
      
      case 'auth/quota-exceeded':
        return new Error('SMS quota exceeded. Please try again later.');
      
      case 'auth/user-disabled':
        return new Error('Your account has been disabled. Please contact support.');
      
      case 'auth/invalid-verification-code':
        return new Error('Invalid verification code. Please check and try again.');
      
      case 'auth/invalid-verification-id':
        return new Error('Invalid verification session. Please request a new code.');
      
      case 'auth/code-expired':
        return new Error('Verification code has expired. Please request a new one.');
      
      case 'auth/too-many-requests':
        return new Error('Too many attempts. Please wait before trying again.');
      
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your connection and try again.');
      
      case 'auth/captcha-check-failed':
        return new Error('reCAPTCHA verification failed. Please try again.');
      
      default:
        return new Error(`Phone verification failed: ${errorMessage}`);
    }
  }
}

// Export singleton instance
export const firebasePhoneService = new FirebasePhoneService();
export default firebasePhoneService;
