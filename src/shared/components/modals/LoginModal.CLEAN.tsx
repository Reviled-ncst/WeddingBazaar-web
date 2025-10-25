import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/HybridAuthContext';
import { Modal } from './Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister
}) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state - completely separate
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { login } = useAuth();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      // Clear everything when modal closes
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setError(null);
      setIsSubmitting(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    setIsSubmitting(true);

    try {
      console.log('🔐 [LoginModal.CLEAN] Starting login for:', email);
      
      // Call login from auth context
      await login(email, password);
      
      console.log('✅ [LoginModal.CLEAN] Login successful!');
      
      // Show success state briefly
      setShowSuccess(true);
      
      // Close modal after brief delay
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (err) {
      console.error('❌ [LoginModal.CLEAN] Login failed:', err);
      
      // Set error message
      const errorMessage = err instanceof Error 
        ? err.message.toLowerCase().includes('credential') || err.message.toLowerCase().includes('password')
          ? 'Incorrect email or password. Please try again.'
          : err.message
        : 'Login failed. Please try again.';
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Handle modal close - only close if no error
  const handleModalClose = () => {
    if (error) {
      console.log('🚫 [LoginModal.CLEAN] Cannot close - error present');
      return;
    }
    
    if (isSubmitting) {
      console.log('🚫 [LoginModal.CLEAN] Cannot close - submitting');
      return;
    }
    
    console.log('✅ [LoginModal.CLEAN] Closing modal');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Welcome Back"
      preventBackdropClose={!!error || isSubmitting}
    >
      <div className="p-6">
        {/* Success State */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-700">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="font-medium">Login successful! Redirecting...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div 
            className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg animate-shake"
            role="alert"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Login Failed</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="your.email@example.com"
                required
                disabled={isSubmitting || showSuccess}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                required
                disabled={isSubmitting || showSuccess}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isSubmitting || showSuccess}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
              disabled={isSubmitting || showSuccess}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || showSuccess}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : showSuccess ? (
              'Success!'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Switch to Register */}
        {onSwitchToRegister && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-rose-600 hover:text-rose-700 font-medium"
                disabled={isSubmitting || showSuccess}
              >
                Create account
              </button>
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
