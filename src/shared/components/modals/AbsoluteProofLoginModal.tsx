import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, AlertCircle, CheckCircle, Loader2, ArrowRight, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/HybridAuthContext';

interface AbsoluteProofLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

/**
 * ABSOLUTE PROOF LOGIN MODAL - PORTAL-BASED
 * 
 * This modal uses React Portal to render OUTSIDE the parent DOM tree.
 * It CANNOT be unmounted by parent re-renders because it's not a child component.
 */
export const AbsoluteProofLoginModal: React.FC<AbsoluteProofLoginModalProps> = ({
  isOpen: parentIsOpen,
  onClose: parentOnClose,
  onSwitchToRegister
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const errorLockRef = useRef(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (parentIsOpen && !internalOpen) {
      console.log('🚪 [AbsoluteProof] Opening modal');
      setInternalOpen(true);
      setError('');
      errorLockRef.current = false;
    }
    
    // 🔒 CRITICAL: If parent tries to close but we have error lock, IGNORE IT!
    if (!parentIsOpen && internalOpen && errorLockRef.current) {
      console.log('🛑 [AbsoluteProof] Parent tried to close but ERROR LOCK active - IGNORING!');
      return; // DO NOT CLOSE!
    }
    
    // Only allow parent to close if no error lock and no error showing
    if (!parentIsOpen && internalOpen && !errorLockRef.current) {
      console.log('✅ [AbsoluteProof] Parent requested close (no error lock)');
      setInternalOpen(false);
    }
  }, [parentIsOpen, internalOpen]);

  const handleClose = () => {
    if (errorLockRef.current || error) {
      console.log('🔒 [AbsoluteProof] Close BLOCKED - error showing');
      return;
    }
    
    console.log('✅ [AbsoluteProof] Closing modal');
    setInternalOpen(false);
    setEmail('');
    setPassword('');
    setError('');
    errorLockRef.current = false;
    parentOnClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear error state
    setError('');
    errorLockRef.current = false;
    
    // Validate inputs BEFORE showing loading
    if (!email || !password) {
      const errorMsg = 'Please fill in all fields';
      setError(errorMsg);
      errorLockRef.current = true;
      console.log('🔒 [AbsoluteProof] Validation error - modal locked');
      return;
    }

    try {
      // DON'T set loading yet - let auth context set it after validation
      console.log('🔐 [AbsoluteProof] Login attempt starting...');
      console.log('📧 [AbsoluteProof] Email:', email);
      
      // ✅ NOW show loading - credentials being validated
      setIsLoading(true);
      
      const user = await login(email, password);
      
      console.log('✅ [AbsoluteProof] Login SUCCESS!');
      console.log('👤 User role:', user.role);
      setSuccess(true);
      setIsLoading(false);
      
      // Wait for success animation, then route based on role
      setTimeout(() => {
        setInternalOpen(false);
        setEmail('');
        setPassword('');
        setSuccess(false);
        parentOnClose();
        
        // Route user based on their role
        console.log('🚀 [AbsoluteProof] Routing user to dashboard:', user.role);
        switch (user.role?.toLowerCase()) {
          case 'vendor':
            navigate('/vendor/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'individual':
          case 'couple':
          default:
            navigate('/individual/dashboard');
            break;
        }
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ [AbsoluteProof] Login FAILED:', err.message);
      
      const errorMsg = err.message || 'Login failed. Please try again.';
      setError(errorMsg);
      errorLockRef.current = true;
      setIsLoading(false);
      
      console.log('🔒 [AbsoluteProof] ERROR LOCK ENGAGED');
      console.log('⚠️ [AbsoluteProof] Error:', errorMsg);
    }
  };

  if (!internalOpen) {
    return null;
  }

  // RENDER IN PORTAL - OUTSIDE PARENT DOM TREE
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ 
        background: 'linear-gradient(135deg, rgba(251, 207, 232, 0.3) 0%, rgba(244, 114, 182, 0.2) 50%, rgba(236, 72, 153, 0.3) 100%)',
        backdropFilter: 'blur(12px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="relative w-full max-w-md transform transition-all duration-300 ease-out animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        {/* Decorative Background Effects */}
        <div className="absolute -inset-4 bg-gradient-to-r from-pink-200/40 via-rose-200/40 to-pink-200/40 rounded-3xl blur-2xl opacity-60" />
        
        {/* Main Modal Card */}
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100/50 overflow-hidden">
          {/* Gradient Header with Wedding Theme */}
          <div className="relative bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 p-8 overflow-hidden">
            {/* Decorative Hearts Background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 right-8">
                <Heart className="h-12 w-12 fill-white" />
              </div>
              <div className="absolute bottom-4 left-6">
                <Heart className="h-8 w-8 fill-white" />
              </div>
              <div className="absolute top-1/2 right-1/4">
                <Heart className="h-6 w-6 fill-white" />
              </div>
            </div>

            {/* Header Content */}
            <div className="relative flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-pink-100 text-sm font-medium">
                  Sign in to plan your perfect day ✨
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={errorLockRef.current || !!error}
                className={`text-white/90 p-2.5 rounded-full transition-all ${
                  (errorLockRef.current || error) 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:bg-white/20 hover:scale-110 hover:rotate-90'
                }`}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            {/* Success Message - Enhanced */}
            {success && (
              <div className="relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-5 animate-slideDown">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10" />
                <div className="relative flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-green-500 rounded-full p-2 animate-bounce">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-green-900 text-lg">Login Successful!</p>
                    <p className="text-sm text-green-700 mt-1">Taking you to your dashboard...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message - Enhanced */}
            {error && (
              <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-5 animate-shake">
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-pink-400/10" />
                <div className="relative space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="bg-red-500 rounded-full p-1.5">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-bold text-red-900 text-base">{error}</p>
                      <p className="text-sm text-red-700">Please check your credentials and try again.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setError('');
                      errorLockRef.current = false;
                      console.log('🔓 [AbsoluteProof] Error dismissed');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl group"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Dismiss & Try Again</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Login Form - Enhanced */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || success}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || success}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Submit Button - Enhanced */}
              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full mt-6 group relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Success!</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">or</span>
              </div>
            </div>

            {/* Switch to Register - Enhanced */}
            <div className="text-center space-y-3">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    if (!errorLockRef.current && !error) {
                      onSwitchToRegister?.();
                    }
                  }}
                  disabled={errorLockRef.current || !!error}
                  className={`font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent ${
                    (errorLockRef.current || error) 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:from-pink-600 hover:to-rose-600'
                  }`}
                >
                  Create Account
                </button>
              </p>
              
              {/* Lock Indicator - Enhanced */}
              {(errorLockRef.current || error) && (
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-50 border-2 border-yellow-300 rounded-full">
                  <Lock className="h-4 w-4 text-yellow-700" />
                  <p className="text-xs text-yellow-800 font-semibold">
                    Modal locked — Please dismiss error to continue
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body // RENDER DIRECTLY IN BODY - OUTSIDE REACT TREE!
  );
};
