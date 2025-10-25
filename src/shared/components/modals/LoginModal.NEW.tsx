import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../contexts/HybridAuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onSwitchToRegister 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false); // Separate error lock state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setHasError(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Handle close - BLOCK if error exists
  const handleClose = () => {
    if (hasError) {
      console.log('🛑 [LoginModal] Close blocked - error present');
      return; // BLOCK CLOSE
    }
    console.log('✅ [LoginModal] Closing modal');
    onClose();
  };

  // Dismiss error
  const dismissError = () => {
    console.log('🧹 [LoginModal] Dismissing error');
    setError(null);
    setHasError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError(null);
    setHasError(false);

    try {
      console.log('🔐 [LoginModal] Validating credentials...');
      
      // Validate credentials (will throw if wrong)
      const user = await login(formData.email, formData.password);
      
      // ✅ Credentials valid - show loading
      console.log('✅ [LoginModal] Credentials valid! Logging in...');
      setIsLoading(true);
      
      // Reset form
      setFormData({ email: '', password: '', rememberMe: false });
      
      // Small delay then navigate
      setTimeout(() => {
        setIsLoading(false);
        onClose(); // Close modal
        
        // Navigate based on role
        switch (user.role) {
          case 'couple':
            navigate('/individual');
            break;
          case 'vendor':
            navigate('/vendor');
            break;
          case 'admin':
            navigate('/admin');
            break;
          default:
            navigate('/');
        }
      }, 500);
      
    } catch (err) {
      console.error('❌ [LoginModal] Login failed:', err);
      
      // NO loading on error
      setIsLoading(false);
      
      // User-friendly error message
      let errorMessage = 'Incorrect email or password. Please try again.';
      
      if (err instanceof Error) {
        const message = err.message.toLowerCase();
        const errorCode = (err as any).code?.toLowerCase() || '';
        
        if (errorCode.includes('user-not-found') || message.includes('user-not-found')) {
          errorMessage = "We couldn't find an account with that email.";
        } else if (errorCode.includes('too-many-requests') || message.includes('too-many-requests')) {
          errorMessage = 'Too many failed attempts. Please wait a few minutes.';
        } else if (message.includes('network') || message.includes('fetch failed')) {
          errorMessage = 'Connection problem. Please check your internet.';
        }
      }
      
      console.log('📝 [LoginModal] Setting error:', errorMessage);
      
      // Set BOTH error states
      setError(errorMessage);
      setHasError(true); // LOCK modal
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      preventBackdropClose={hasError} // Block backdrop close if error
    >
      <div className="w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full mb-4">
            <Heart className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">Sign in to continue planning your dream wedding</p>
        </div>

        {/* Error Display */}
        {error && (
          <div 
            className={cn(
              "mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200",
              "animate-shake" // Shake animation
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button
                onClick={dismissError}
                className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                placeholder="your@email.com"
                required
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
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300",
              "bg-gradient-to-r from-pink-600 to-rose-600",
              "hover:from-pink-700 hover:to-rose-700 hover:shadow-lg hover:scale-105",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Logging in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-pink-600 hover:text-pink-700 font-semibold transition-colors"
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};
