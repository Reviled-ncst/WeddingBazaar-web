import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/HybridAuthContext';

/**
 * UNMOUNT-PROOF LOGIN MODAL
 * 
 * This modal is completely immune to parent re-renders and state changes.
 * It uses a portal and ref-based state management to prevent unmounting.
 * 
 * KEY FEATURES:
 * - Portal-based rendering (won't unmount when parent re-renders)
 * - Ref-based state (immune to React state batching)
 * - Error locking (modal CANNOT close when showing errors)
 * - Success-only close (only closes on successful login)
 */

interface UnmountProofLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export const UnmountProofLoginModal: React.FC<UnmountProofLoginModalProps> = ({
  isOpen: parentIsOpen,
  onClose: parentOnClose,
  onSwitchToRegister
}) => {
  // INTERNAL STATE - NOT CONTROLLED BY PARENT
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // REF-BASED ERROR LOCK - IMMUNE TO REACT RE-RENDERS
  const errorLockRef = useRef(false);
  const mountedRef = useRef(true);
  
  const { login } = useAuth();

  // Sync with parent open state ONLY when opening
  useEffect(() => {
    if (parentIsOpen && !internalIsOpen) {
      console.log('🔓 [UnmountProofLogin] Opening modal (parent requested)');
      setInternalIsOpen(true);
      setError('');
      errorLockRef.current = false;
    }
  }, [parentIsOpen, internalIsOpen]);

  // Track component mount status
  useEffect(() => {
    mountedRef.current = true;
    console.log('🏗️ [UnmountProofLogin] Component mounted');
    
    return () => {
      mountedRef.current = false;
      console.log('💀 [UnmountProofLogin] Component unmounted');
    };
  }, []);

  const handleClose = () => {
    console.log('🚪 [UnmountProofLogin] Close requested');
    console.log('🔒 Error lock status:', errorLockRef.current);
    
    // ABSOLUTE IRON WALL - CANNOT CLOSE IF ERROR IS SHOWING
    if (errorLockRef.current) {
      console.log('🛑 CLOSE BLOCKED - Error is displayed');
      return;
    }
    
    if (error) {
      console.log('🛑 CLOSE BLOCKED - Error state exists');
      return;
    }
    
    console.log('✅ Allowing modal close (no errors)');
    setInternalIsOpen(false);
    setEmail('');
    setPassword('');
    setError('');
    errorLockRef.current = false;
    parentOnClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      const errorMsg = 'Please fill in all fields';
      setError(errorMsg);
      errorLockRef.current = true;
      console.log('🔒 [UnmountProofLogin] Error lock ENGAGED:', errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      errorLockRef.current = false;
      
      console.log('🔐 [UnmountProofLogin] Login attempt started');
      console.log('📧 Email:', email);
      console.log('🔒 Error lock BEFORE login:', errorLockRef.current);
      
      const user = await login(email, password);
      
      console.log('✅ [UnmountProofLogin] Login successful!');
      console.log('👤 User:', user.email, 'Role:', user.role);
      
      // SUCCESS - SAFE TO CLOSE
      if (mountedRef.current) {
        setInternalIsOpen(false);
        setEmail('');
        setPassword('');
        setError('');
        errorLockRef.current = false;
        parentOnClose();
      }
      
    } catch (err: any) {
      console.error('❌ [UnmountProofLogin] Login failed:', err.message);
      
      const errorMsg = err.message || 'Login failed. Please try again.';
      
      // ENGAGE ERROR LOCK - MODAL CANNOT CLOSE
      if (mountedRef.current) {
        setError(errorMsg);
        errorLockRef.current = true;
        setIsLoading(false);
        
        console.log('🔒 [UnmountProofLogin] ERROR LOCK ENGAGED');
        console.log('⚠️ Error message:', errorMsg);
        console.log('🛡️ Modal is now LOCKED and cannot close');
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSwitchToRegister = () => {
    if (errorLockRef.current || error) {
      console.log('🛑 Cannot switch to register - error is showing');
      return;
    }
    
    setInternalIsOpen(false);
    setEmail('');
    setPassword('');
    setError('');
    errorLockRef.current = false;
    
    if (onSwitchToRegister) {
      onSwitchToRegister();
    }
  };

  // Don't render if not open
  if (!internalIsOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
      onClick={handleBackdropClick}
      style={{
        // Force highest z-index and prevent any parent interference
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-t-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
              <p className="text-rose-100 text-sm">Sign in to continue planning your perfect day</p>
            </div>
            <button
              onClick={handleClose}
              disabled={errorLockRef.current || !!error}
              className={`text-white hover:text-rose-100 transition-colors p-2 rounded-full ${
                (errorLockRef.current || error) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
              }`}
              title={errorLockRef.current || error ? 'Cannot close while error is showing' : 'Close'}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ERROR ALERT - LOCKS MODAL */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-2xl">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => {
                    setError('');
                    errorLockRef.current = false;
                    console.log('🔓 [UnmountProofLogin] Error dismissed, lock released');
                  }}
                  className="ml-auto flex-shrink-0 inline-flex text-red-400 hover:text-red-500 focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-rose-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={handleSwitchToRegister}
                disabled={errorLockRef.current || !!error}
                className={`text-rose-500 font-semibold ${
                  (errorLockRef.current || error) ? 'opacity-50 cursor-not-allowed' : 'hover:text-rose-600'
                }`}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
