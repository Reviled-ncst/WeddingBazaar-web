import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Send, Shield, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { usePhoneVerification } from '../hooks/usePhoneVerification';

export interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
  onCancel?: () => void;
  initialPhoneNumber?: string;
  title?: string;
  description?: string;
  className?: string;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  onVerificationComplete,
  onCancel,
  initialPhoneNumber = '',
  title = 'Verify Your Phone Number',
  description = 'We\'ll send you a verification code to confirm your phone number.',
  className = ''
}) => {
  const [phoneInput, setPhoneInput] = useState(initialPhoneNumber);
  const [codeInput, setCodeInput] = useState('');

  const {
    isLoading,
    isSending,
    isVerifying,
    error,
    step,
    phoneNumber,
    sendCode,
    verifyCode,
    resendCode,
    reset
  } = usePhoneVerification();

  const handleSendCode = async () => {
    if (!phoneInput.trim()) {
      return;
    }
    await sendCode(phoneInput.trim());
  };

  const handleVerifyCode = async () => {
    if (!codeInput.trim()) {
      return;
    }
    
    const success = await verifyCode(codeInput.trim());
    if (success) {
      onVerificationComplete(phoneNumber);
    }
  };

  const handleResendCode = async () => {
    setCodeInput('');
    await resendCode();
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Format as Philippines number if it looks like one
    if (numbers.startsWith('09') && numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    } else if (numbers.startsWith('639') && numbers.length <= 12) {
      return '+' + numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    } else if (numbers.length > 0) {
      return '+' + numbers;
    }
    
    return value;
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneInput(formatted);
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-8 ${className}`}>
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container"></div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {step === 'verified' ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <Phone className="w-8 h-8 text-green-600" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Enter Phone Number */}
        {(step === 'idle' || step === 'error') && (
          <motion.div
            key="phone-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={handlePhoneInputChange}
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  disabled={isSending}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your phone number with country code (e.g., +63 for Philippines)
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSendCode}
                disabled={!phoneInput.trim() || isSending}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>{isSending ? 'Sending...' : 'Send Code'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Sending Code */}
        {step === 'sending' && (
          <motion.div
            key="sending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            <RefreshCw className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Sending verification code...</p>
          </motion.div>
        )}

        {/* Step 3: Enter Verification Code */}
        {step === 'code-sent' && (
          <motion.div
            key="code-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">Code sent to {phoneNumber}</p>
              <p className="text-green-600 text-sm mt-1">Please check your SMS messages</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                  disabled={isVerifying}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleVerifyCode}
                disabled={codeInput.length !== 6 || isVerifying}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                <span>{isVerifying ? 'Verifying...' : 'Verify Code'}</span>
              </button>

              <div className="flex items-center justify-center space-x-4 text-sm">
                <button
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                >
                  Resend Code
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={reset}
                  disabled={isLoading}
                  className="text-gray-600 hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                  Change Number
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Verifying */}
        {step === 'verifying' && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            <RefreshCw className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Verifying your code...</p>
          </motion.div>
        )}

        {/* Step 5: Success */}
        {step === 'verified' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-green-900 mb-2">Verification Complete!</h4>
            <p className="text-green-700">Your phone number has been successfully verified.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
