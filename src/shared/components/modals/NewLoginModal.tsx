import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, Lock, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/HybridAuthContext';

interface NewLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

/**
 * BRAND NEW LOGIN MODAL - BUILT FROM SCRATCH (v3.0 - Enhanced UI)
 * 
 * Key Features:
 * 1. Internal modal state (doesn't rely on parent)
 * 2. Error state that LOCKS the modal open until dismissed
 * 3. Only closes on successful login or explicit user action
 * 4. No dependencies on parent state changes
 * 5. Bulletproof error handling with visual feedback
 * 6. Enhanced debug logging for error tracking
 * 7. Beautiful wedding-themed UI with modern animations
 */
export const NewLoginModal: React.FC<NewLoginModalProps> = ({ 
  isOpen: parentIsOpen, 
  onClose: parentOnClose,
  onSwitchToRegister 
}) => {
  // Internal modal state - THIS IS THE SOURCE OF TRUTH
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Modal lock - when true, modal CANNOT be closed except by user action
  const [modalLocked, setModalLocked] = useState(false);
  
  const { login } = useAuth();
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Sync with parent open state, but maintain independence
  useEffect(() => {
    if (parentIsOpen && !internalOpen) {
      setInternalOpen(true);
      setError(null);
      setSuccess(false);
      setModalLocked(false);
    }
  }, [parentIsOpen, internalOpen]);

  // Focus email input when modal opens
  useEffect(() => {
    if (internalOpen && emailInputRef.current) {
      setTimeout(() => emailInputRef.current?.focus(), 100);
    }
  }, [internalOpen]);

  // Handle close request - ONLY allow if not locked
  const handleCloseRequest = () => {
    console.log('🚪 Close request received', { modalLocked, hasError: !!error });
    
    if (modalLocked) {
      console.log('🔒 Modal is LOCKED - ignoring close request');
      return;
    }
    
    console.log('✅ Closing modal');
    setInternalOpen(false);
    setEmail('');
    setPassword('');
    setError(null);
    setSuccess(false);
    parentOnClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseRequest();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && internalOpen) {
        handleCloseRequest();
      }
    };

    if (internalOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [internalOpen, modalLocked]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous state
    setError(null);
    setSuccess(false);
    setModalLocked(false); // Unlock at start of new attempt
    // DON'T set loading yet - validate inputs first!

    console.log('🔐 Login attempt started', { email });

    try {
      // Validate inputs BEFORE showing loading
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // ✅ Inputs valid - NOW show loading
      setIsLoading(true);

      // Attempt login
      console.log('📡 Calling login API...');
      const result = await login(email, password);
      
      console.log('✅ Login successful!', result);
      
      // Success - show success state briefly, then close
      setSuccess(true);
      setIsLoading(false);
      
      // Wait 1 second to show success message
      setTimeout(() => {
        setInternalOpen(false);
        setEmail('');
        setPassword('');
        setSuccess(false);
        parentOnClose();
      }, 1000);

    } catch (err: any) {
      console.error('❌ Login failed:', err);
      
      // LOCK THE MODAL - it cannot be closed now except by user action
      setModalLocked(true);
      setIsLoading(false);
      
      // Set user-friendly error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.message) {
        // Pass through the error message from auth context (already user-friendly)
        errorMessage = err.message;
      } else if (err.code) {
        // Handle any Firebase error codes that might slip through
        switch (err.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = 'Invalid email or password. Please check your credentials.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed login attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = 'Login failed. Please try again.';
        }
      }
      
      console.log('🔒 Modal LOCKED due to error', { errorMessage, modalLocked: true });
      console.log('🎯 Setting error state NOW:', errorMessage);
      setError(errorMessage);
      console.log('✅ Error state set complete');
    }
  };

  // Dismiss error - unlocks modal
  const handleDismissError = () => {
    console.log('🔓 Dismissing error and unlocking modal');
    setError(null);
    setModalLocked(false);
  };

  // Don't render if not open
  if (!internalOpen) {
    return null;
  }

  // DEBUG: Log render state
  console.log('🎨 Rendering modal with state:', { 
    error, 
    modalLocked, 
    isLoading, 
    success,
    hasError: !!error 
  });

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      {/* Enhanced Backdrop with Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-rose-900/20 to-black/70 backdrop-blur-md transition-all duration-300" />
      
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div 
          className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-t-3xl" />
          
          {/* Header with Enhanced Styling */}
          <div className="relative flex items-center justify-between p-6 sm:p-8 border-b border-gray-100">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent rounded-t-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-1">
                Welcome Back
              </h2>
              <p className="text-sm text-gray-500">Sign in to continue your wedding journey</p>
            </div>
            
            <button
              onClick={handleCloseRequest}
              disabled={modalLocked}
              className={`relative z-10 p-2.5 rounded-xl transition-all duration-200 ${
                modalLocked 
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-rose-50 hover:scale-110 active:scale-95'
              }`}
              title={modalLocked ? 'Please dismiss the error first' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content with Better Spacing */}
          <div className="p-6 sm:p-8">
            {/* Success Message - Enhanced */}
            {success && (
              <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-bold text-green-900 text-lg">Login Successful!</p>
                    <p className="text-sm text-green-700 mt-1">Redirecting you to your dashboard...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message - Enhanced with Better Visual Hierarchy */}
            {error && (
              <div className="mb-6 p-5 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-bold text-red-900 text-lg">{error}</p>
                    <p className="text-sm text-red-700 mt-1.5 leading-relaxed">
                      Please check your credentials and try again. If you've forgotten your password, you can reset it below.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismissError}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-98 flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Dismiss & Try Again</span>
                </button>
              </div>
            )}

            {/* Login Form - Enhanced */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input - Enhanced */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors duration-200" />
                  </div>
                  <input
                    ref={emailInputRef}
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || success}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed hover:border-gray-300 bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input - Enhanced */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || success}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed hover:border-gray-300 bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {/* Forgot Password Link - Enhanced */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-rose-600 hover:text-rose-700 font-semibold transition-colors duration-200 hover:underline underline-offset-2"
                  onClick={() => alert('Password reset feature coming soon!')}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button - Enhanced with Gradient */}
              <button
                type="submit"
                disabled={isLoading || success}
                className="relative w-full py-4 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-rose-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center space-x-2 overflow-hidden group active:scale-98"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-5 h-5 animate-bounce" />
                    <span>Success!</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            {/* Divider - Enhanced */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">New to Wedding Bazaar?</span>
              </div>
            </div>

            {/* Register Link - Enhanced */}
            <div className="text-center">
              <p className="text-gray-600 mb-3">
                Don't have an account?
              </p>
              <button
                onClick={() => {
                  if (!modalLocked) {
                    onSwitchToRegister?.();
                  }
                }}
                disabled={modalLocked}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  modalLocked 
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-rose-600 bg-rose-50 hover:bg-rose-100 hover:scale-105 active:scale-95 border-2 border-rose-200 hover:border-rose-300'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Modal Lock Indicator - Enhanced */}
            {modalLocked && (
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl shadow-md animate-pulse">
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <p className="text-xs font-semibold text-amber-800 text-center">
                    Modal locked - Please dismiss the error to continue
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Decorative Bottom Border */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-b-3xl" />
        </div>
      </div>
    </div>
  );
};
