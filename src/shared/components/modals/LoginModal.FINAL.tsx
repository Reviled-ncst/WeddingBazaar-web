import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/HybridAuthContext';
import { X, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen: parentIsOpen, 
  onClose: parentOnClose,
  onSwitchToRegister 
}) => {
  // STANDALONE STATE - Modal is COMPLETELY independent
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Track if we're showing an error - prevents close
  const hasErrorRef = useRef(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  // Sync with parent only when parent explicitly opens the modal
  useEffect(() => {
    console.log('🔄 [LoginModal] Parent isOpen changed:', parentIsOpen);
    if (parentIsOpen && !internalIsOpen) {
      console.log('✅ [LoginModal] Opening modal from parent');
      setInternalIsOpen(true);
      // Reset state when opening
      setEmail('');
      setPassword('');
      setError(null);
      setIsLoading(false);
      setIsSuccess(false);
      hasErrorRef.current = false;
    }
  }, [parentIsOpen, internalIsOpen]);

  // Track error state changes
  useEffect(() => {
    if (error) {
      console.log('🚨 [LoginModal] ERROR STATE ACTIVE:', error);
      hasErrorRef.current = true;
    } else {
      console.log('✅ [LoginModal] Error cleared');
      hasErrorRef.current = false;
    }
  }, [error]);

  const handleClose = () => {
    console.log('🚪 [LoginModal] Close requested');
    console.log('🔍 Current state:', { 
      error, 
      hasErrorRef: hasErrorRef.current, 
      isLoading, 
      isSuccess,
      internalIsOpen 
    });
    
    // BLOCK CLOSE if there's an error showing
    if (hasErrorRef.current && !isSuccess) {
      console.log('❌❌❌ [LoginModal] BLOCKING CLOSE - Error is showing!');
      console.log('💀 Modal will NOT close until error is cleared or login succeeds');
      return;
    }
    
    console.log('✅ [LoginModal] Allowing close');
    setInternalIsOpen(false);
    setError(null);
    hasErrorRef.current = false;
    parentOnClose();
  };

  const handleBackdropClick = () => {
    console.log('🖱️ [LoginModal] Backdrop clicked');
    handleClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 [LoginModal] Starting login for:', email);
    
    setIsLoading(true);
    setError(null);
    hasErrorRef.current = false;
    
    try {
      const userData = await login(email, password);
      console.log('✅ [LoginModal] Login successful:', userData);
      
      setIsSuccess(true);
      setIsLoading(false);
      hasErrorRef.current = false;
      
      // Close modal and navigate on success
      setInternalIsOpen(false);
      parentOnClose();
      
      // Navigate based on role
      const role = (userData as any).role || (userData as any).user?.role || 'individual';
      console.log('🚀 [LoginModal] Navigating to:', `/${role}`);
      navigate(`/${role}`);
      
    } catch (err: any) {
      console.error('❌ [LoginModal] Login failed:', err);
      
      const errorMessage = err.message || 'Incorrect email or password. Please try again.';
      console.log('📝 [LoginModal] Setting error:', errorMessage);
      
      setError(errorMessage);
      hasErrorRef.current = true;
      setIsLoading(false);
      setIsSuccess(false);
      
      console.log('🔍 [LoginModal] Error state updated');
      console.log('🔒 [LoginModal] Modal is now LOCKED - cannot close until error is cleared');
    }
  };

  // Don't render if not open
  if (!internalIsOpen) {
    console.log('🚫 [LoginModal] Not rendering - modal closed');
    return null;
  }

  console.log('✅ [LoginModal] RENDERING - isOpen:', internalIsOpen, 'error:', error, 'hasErrorRef:', hasErrorRef.current);

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop - DISABLED when error is showing */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${hasErrorRef.current ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={hasErrorRef.current ? undefined : handleBackdropClick}
      />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button - DISABLED when error is showing */}
          <button
            onClick={handleClose}
            disabled={hasErrorRef.current}
            className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title={hasErrorRef.current ? 'Cannot close while error is showing' : 'Close'}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Error Display - PROMINENT */}
          {error && (
            <div className="mb-6 rounded-lg border-2 border-red-300 bg-red-50 p-4 animate-pulse">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900">{error}</p>
                  <p className="text-xs text-red-700 mt-1">Please correct your credentials and try again.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error when user types
                    if (error) {
                      setError(null);
                      hasErrorRef.current = false;
                    }
                  }}
                  className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-3 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear error when user types
                    if (error) {
                      setError(null);
                      hasErrorRef.current = false;
                    }
                  }}
                  className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-3 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-rose-600 hover:to-pink-600 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => {
                setInternalIsOpen(false);
                setError(null);
                hasErrorRef.current = false;
                parentOnClose();
                onSwitchToRegister?.();
              }}
              className="font-semibold text-rose-600 hover:text-rose-700"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
