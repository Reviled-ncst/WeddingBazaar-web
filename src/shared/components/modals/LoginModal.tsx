import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/HybridAuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  onLoginSuccess?: (role: string) => void; // ✅ NEW: Callback for successful login
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onLoginSuccess
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false); // ✅ NEW: Error lock flag

  const { login } = useAuth();

  // Sync with parent - with bulletproof error persistence
  React.useEffect(() => {
    console.log('🔄 [LoginModal] useEffect triggered - isOpen:', isOpen, 'internalOpen:', internalOpen, 'error:', error, 'isSubmitting:', isSubmitting);
    
    // Open modal when parent requests
    if (isOpen && !internalOpen) {
      console.log('✅ [LoginModal] Opening modal from parent request');
      setInternalOpen(true);
      // Only reset form if there's no error
      if (!error) {
        setEmail('');
        setPassword('');
        setError(null);
        setHasError(false);
      }
    }
    
    // 🔒 BULLETPROOF BLOCKING: NEVER close if error or submitting!
    // This is the CRITICAL fix - ignore parent close requests when error exists
    if (!isOpen && internalOpen) {
      if (error || isSubmitting || hasError) {
        console.log('🔒🔒🔒 [LoginModal] BLOCKING PARENT CLOSE - error active or submitting!');
        console.log('🔒 Error state:', error);
        console.log('🔒 Submitting state:', isSubmitting);
        console.log('🔒 Error lock:', hasError);
        console.log('🔒 Modal will stay OPEN despite parent isOpen=false');
        // ✅ DO ABSOLUTELY NOTHING - modal stays open no matter what parent says!
        return;
      } else {
        console.log('✅ [LoginModal] Parent requested close (no error/submitting) - allowing close');
        setInternalOpen(false);
        // Clean up on close
        setEmail('');
        setPassword('');
        setError(null);
        setHasError(false);
      }
    }
  }, [isOpen, internalOpen, error, isSubmitting, hasError]);

  const handleClose = () => {
    if (error || isSubmitting || hasError) {
      console.log('❌ [LoginModal] Close BLOCKED - error:', error, 'isSubmitting:', isSubmitting);
      return;
    }
    console.log('✅ [LoginModal] Closing modal');
    setInternalOpen(false);
    setEmail('');
    setPassword('');
    setError(null);
    setHasError(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 [LoginModal] Login attempt for:', email);
    setError(null);
    setHasError(false);
    setIsSubmitting(true);

    try {
      const userData = await login(email, password);
      console.log('✅ [LoginModal] Login SUCCESS - notifying parent');
      setIsSubmitting(false);
      setInternalOpen(false);
      
      // ✅ FIX: Don't navigate here - let parent handle it
      // This prevents the modal from being unmounted by route changes
      const role = (userData as any).role || (userData as any).user?.role || 'individual';
      
      // Reset form
      setEmail('');
      setPassword('');
      setError(null);
      setHasError(false);
      
      // Close and notify parent
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess(role);
      }
    } catch (err: any) {
      console.log('❌ [LoginModal] Login FAILED - activating error lock');
      console.log('🔒 [LoginModal] Error:', err.message);
      setError(err.message || 'Login failed');
      setHasError(true); // ✅ Lock the modal
      setIsSubmitting(false);
      console.log('📍 [LoginModal] Modal LOCKED with error UI - will not close');
    }
  };

  if (!internalOpen) return null;

  // ✅ FIX: Use createPortal to render modal outside route tree
  // This prevents ProtectedRoute redirects from unmounting the modal
  const modalContent = (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='fixed inset-0 bg-black/50 backdrop-blur-sm' onClick={handleClose} />
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div className='relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl' onClick={e => e.stopPropagation()}>
          <button 
            onClick={handleClose} 
            disabled={error !== null} 
            className='absolute right-4 top-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50'
            aria-label="Close modal"
          >
            <X className='h-5 w-5' />
          </button>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Welcome Back</h2>
          <p className='text-sm text-gray-600 mb-8'>Sign in to continue</p>
          {error && (
            <div className='mb-6 rounded-lg border-2 border-red-300 bg-red-50 p-4'>
              <div className='flex space-x-3'>
                <AlertCircle className='h-6 w-6 text-red-600' />
                <div>
                  <p className='text-sm font-semibold text-red-900'>{error}</p>
                  <p className='text-xs text-red-700 mt-1'>Please try again</p>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label htmlFor="login-email" className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
                <input 
                  id="login-email"
                  type='email' 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className='w-full rounded-lg border py-3 pl-10 pr-4 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20' 
                  placeholder="your@email.com"
                  required 
                  disabled={isSubmitting} 
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
                <input 
                  id="login-password"
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className='w-full rounded-lg border py-3 pl-10 pr-12 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20' 
                  placeholder="Enter your password"
                  required 
                  disabled={isSubmitting} 
                />
                <button 
                  type='button' 
                  onClick={() => setShowPassword(!showPassword)} 
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                </button>
              </div>
            </div>
            <button type='submit' disabled={isSubmitting} className='w-full rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50'>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Don't have an account?{' '}
              <button onClick={onSwitchToRegister} className='font-semibold text-pink-600 hover:text-pink-700'>Sign up</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal at document.body level, immune to route changes
  return createPortal(modalContent, document.body);
};
