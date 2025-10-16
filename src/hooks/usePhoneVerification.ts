import { useState, useCallback, useEffect } from 'react';
import { firebasePhoneService } from '../services/auth/firebasePhoneService';
import type { PhoneVerificationResult, PhoneVerificationConfirmResult } from '../services/auth/firebasePhoneService';

export interface UsePhoneVerificationState {
  // State
  isLoading: boolean;
  isSending: boolean;
  isVerifying: boolean;
  error: string | null;
  step: 'idle' | 'sending' | 'code-sent' | 'verifying' | 'verified' | 'error';
  verificationId: string | null;
  phoneNumber: string;
  
  // Actions
  sendCode: (phoneNumber: string) => Promise<void>;
  verifyCode: (code: string) => Promise<boolean>;
  resendCode: () => Promise<void>;
  reset: () => void;
  setPhoneNumber: (phone: string) => void;
}

export const usePhoneVerification = (): UsePhoneVerificationState => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<UsePhoneVerificationState['step']>('idle');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Initialize reCAPTCHA on component mount
  useEffect(() => {
    const initRecaptcha = async () => {
      try {
        // Create reCAPTCHA container if it doesn't exist
        if (!document.getElementById('recaptcha-container')) {
          const container = document.createElement('div');
          container.id = 'recaptcha-container';
          container.style.display = 'none';
          document.body.appendChild(container);
        }

        await firebasePhoneService.initializeRecaptcha('recaptcha-container');
        console.log('✅ reCAPTCHA initialized for phone verification');
      } catch (error) {
        console.error('❌ Failed to initialize reCAPTCHA:', error);
      }
    };

    initRecaptcha();

    // Cleanup on unmount
    return () => {
      firebasePhoneService.cleanup();
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.remove();
      }
    };
  }, []);

  const sendCode = useCallback(async (phone: string) => {
    setIsSending(true);
    setIsLoading(true);
    setError(null);
    setStep('sending');

    try {
      // Validate phone number format
      if (!phone || phone.length < 10) {
        throw new Error('Please enter a valid phone number');
      }

      // Format phone number - ensure it starts with country code
      let formattedPhone = phone;
      if (!phone.startsWith('+')) {
        // If no country code, assume Philippines (+63) for this app
        if (phone.startsWith('09')) {
          // Convert 09xxxxxxxx to +639xxxxxxxx
          formattedPhone = '+63' + phone.slice(1);
        } else if (phone.startsWith('639')) {
          formattedPhone = '+' + phone;
        } else {
          // Default to Philippines if no clear format
          formattedPhone = '+63' + phone;
        }
      }

      console.log('📱 Sending verification to:', formattedPhone);

      const result: PhoneVerificationResult = await firebasePhoneService.sendVerificationCode(formattedPhone);

      if (result.success) {
        setPhoneNumber(formattedPhone);
        setStep('code-sent');
        console.log('✅ SMS sent successfully');
      } else {
        throw new Error(result.message || 'Failed to send verification code');
      }

    } catch (error: any) {
      console.error('❌ Error sending SMS:', error);
      setError(error.message || 'Failed to send verification code');
      setStep('error');
    } finally {
      setIsSending(false);
      setIsLoading(false);
    }
  }, []);

  const verifyCode = useCallback(async (code: string): Promise<boolean> => {
    setIsVerifying(true);
    setIsLoading(true);
    setError(null);
    setStep('verifying');

    try {
      if (!code || code.length !== 6) {
        throw new Error('Please enter a valid 6-digit verification code');
      }

      console.log('🔐 Verifying code:', code);

      const result: PhoneVerificationConfirmResult = await firebasePhoneService.verifyCode(code);

      if (result.success) {
        setStep('verified');
        console.log('✅ Phone verification successful');
        return true;
      } else {
        throw new Error(result.message || 'Verification failed');
      }

    } catch (error: any) {
      console.error('❌ Error verifying code:', error);
      setError(error.message || 'Verification failed');
      setStep('error');
      return false;
    } finally {
      setIsVerifying(false);
      setIsLoading(false);
    }
  }, []);

  const resendCode = useCallback(async () => {
    if (phoneNumber) {
      await sendCode(phoneNumber);
    }
  }, [phoneNumber, sendCode]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsSending(false);
    setIsVerifying(false);
    setError(null);
    setStep('idle');
    setVerificationId(null);
    setPhoneNumber('');
    firebasePhoneService.cleanup();
  }, []);

  return {
    // State
    isLoading,
    isSending,
    isVerifying,
    error,
    step,
    verificationId,
    phoneNumber,
    
    // Actions
    sendCode,
    verifyCode,
    resendCode,
    reset,
    setPhoneNumber
  };
};
