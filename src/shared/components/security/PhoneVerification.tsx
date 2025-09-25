import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle, XCircle, Send, RotateCcw, Clock, Shield } from 'lucide-react';

interface PhoneVerificationProps {
  phone: string;
  userId: string;
  onVerificationComplete: (success: boolean) => void;
  onClose: () => void;
  isVerified?: boolean;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  phone,
  userId,
  onVerificationComplete,
  onClose,
  isVerified = false
}) => {
  const [step, setStep] = useState<'initial' | 'sending' | 'sent' | 'verifying' | 'success' | 'failed' | 'resend'>('initial');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [canResend, setCanResend] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('');

  // Format and mask phone number
  useEffect(() => {
    const formatPhone = (phoneNumber: string) => {
      // Remove all non-digits
      const digits = phoneNumber.replace(/\D/g, '');
      
      // For Philippine numbers (+63)
      if (digits.startsWith('63')) {
        const number = digits.slice(2);
        return `+63 ${number.slice(0, 3)} *** ${number.slice(-3)}`;
      }
      
      // For US numbers
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ***-${digits.slice(-4)}`;
      }
      
      // Generic formatting
      if (digits.length > 6) {
        return `${digits.slice(0, 3)}***${digits.slice(-3)}`;
      }
      
      return phoneNumber;
    };

    setMaskedPhone(formatPhone(phone));
  }, [phone]);

  // Auto-start if not verified
  useEffect(() => {
    if (!isVerified) {
      sendVerificationSMS();
    }
  }, [isVerified]);

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 'sent') {
      setCanResend(true);
    }
  }, [timeLeft, step]);

  const sendVerificationSMS = async () => {
    setStep('sending');
    setError(null);

    try {
      const response = await fetch('/api/auth/send-verification-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, phone })
      });

      const result = await response.json();

      if (response.ok) {
        setStep('sent');
        setTimeLeft(120); // 2 minutes cooldown for SMS
        setCanResend(false);
      } else {
        throw new Error(result.error || 'Failed to send verification SMS');
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send verification SMS');
      setStep('failed');
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setStep('verifying');
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-phone-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          code: verificationCode,
          phone 
        })
      });

      const result = await response.json();

      if (response.ok) {
        setStep('success');
        onVerificationComplete(true);
      } else {
        throw new Error(result.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setAttemptsLeft(attemptsLeft - 1);
      
      if (attemptsLeft <= 1) {
        setError('Too many failed attempts. Please request a new code.');
        setStep('resend');
      } else {
        setError(`Invalid code. ${attemptsLeft - 1} attempts remaining.`);
        setStep('sent');
      }
      setVerificationCode('');
    }
  };

  const handleResend = () => {
    setAttemptsLeft(3);
    setCanResend(false);
    setVerificationCode('');
    sendVerificationSMS();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepIcon = () => {
    switch (step) {
      case 'sending':
      case 'verifying':
        return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />;
      case 'sent':
        return <Send className="h-6 w-6 text-green-500" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
      case 'resend':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Phone className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'sending': return 'Sending Verification SMS...';
      case 'sent': return 'Check Your Phone';
      case 'verifying': return 'Verifying Code...';
      case 'success': return 'Phone Verified!';
      case 'failed': return 'Verification Failed';
      case 'resend': return 'Request New Code';
      default: return 'Phone Verification';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'sending': return 'Please wait while we send a verification code to your phone.';
      case 'sent': return `We've sent a 6-digit code to ${maskedPhone}. Enter it below to verify your phone.`;
      case 'verifying': return 'Please wait while we verify your code.';
      case 'success': return 'Your phone number has been successfully verified!';
      case 'failed': return 'There was an issue verifying your phone. Please try again.';
      case 'resend': return 'Too many failed attempts. Please request a new verification code.';
      default: return 'Verify your phone number to secure your account.';
    }
  };

  if (isVerified) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Phone Already Verified</h2>
            <p className="text-gray-600 mb-6">Your phone number is already verified and secure.</p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{getStepTitle()}</h2>
                <p className="text-sm text-gray-600">{getStepDescription()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {getStepIcon()}
          </div>

          {/* Phone Display */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700 font-medium">{maskedPhone}</span>
            </div>
          </div>

          {/* Verification Code Input */}
          {(step === 'sent' || step === 'verifying') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-wider border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                maxLength={6}
                disabled={step === 'verifying'}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enter the 6-digit code sent to your phone
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Timer and Attempts */}
          {step === 'sent' && (
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                {timeLeft > 0 && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Resend in {formatTime(timeLeft)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <span>Attempts: {attemptsLeft}/3</span>
                </div>
              </div>
            </div>
          )}

          {/* SMS Cost Notice */}
          {(step === 'initial' || step === 'sending') && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-blue-700 text-sm text-center">
                📱 Standard SMS rates may apply. One verification code will be sent.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {step === 'sent' && (
              <button
                onClick={verifyCode}
                disabled={verificationCode.length !== 6}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  verificationCode.length === 6
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Verify Code
              </button>
            )}

            {step === 'verifying' && (
              <button
                disabled
                className="w-full py-3 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed"
              >
                Verifying...
              </button>
            )}

            {(step === 'sent' || step === 'resend') && (
              <button
                onClick={handleResend}
                disabled={!canResend && step !== 'resend'}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  canResend || step === 'resend'
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="h-4 w-4" />
                <span>
                  {step === 'resend' ? 'Send New Code' : 'Resend Code'}
                </span>
              </button>
            )}

            {step === 'failed' && (
              <button
                onClick={() => {
                  setStep('initial');
                  setError(null);
                  sendVerificationSMS();
                }}
                className="w-full py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
            )}

            {step === 'success' && (
              <button
                onClick={onClose}
                className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Complete</span>
              </button>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Didn't receive the SMS? Check if your phone number is correct or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
