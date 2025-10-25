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
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  // Create a wrapper for onClose to trace who's calling it
  const tracedOnClose = () => {
    console.log('🚨 [LoginModal] onClose() called!');
    console.trace('📍 Call stack for onClose:');
    console.log('🔍 Current state:', { error, isLoading, isLoginSuccess });
    
    // Only allow close if no error or if login was successful
    if (error && !isLoginSuccess) {
      console.log('🛑 BLOCKING modal close - error is present and login not successful!');
      return; // Block the close!
    }
    
    console.log('✅ Allowing modal close');
    onClose();
  };

  // Reset all states when modal opens ONLY
  // DON'T reset on close - let the close happen naturally after error is acknowledged
  useEffect(() => {
    console.log('🔄 [LoginModal] isOpen changed to:', isOpen);
    if (isOpen) {
      // Clear all states when modal opens
      console.log('🧹 Clearing states on modal open');
      setError(null);
      setIsLoginSuccess(false);
      setIsLoading(false);
    }
    // REMOVED: Don't clear states when modal closes - this was causing the error to disappear!
  }, [isOpen]);

  // Debug: Log when error state changes
  useEffect(() => {
    console.log('🔍 [LoginModal] Error state changed:', error);
    console.log('🔍 [LoginModal] Modal isOpen:', isOpen);
    console.log('🔍 [LoginModal] isLoading:', isLoading);
    console.log('🔍 [LoginModal] isLoginSuccess:', isLoginSuccess);
  }, [error, isOpen, isLoading, isLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 [LoginModal] Starting login process...');
      
      // Attempt login and get user data - this will throw an error if credentials are wrong
      const user = await login(formData.email, formData.password);
      
      console.log('✅ [LoginModal] Login successful, user:', user);
      
      // Only show success and navigate after successful authentication
      // Reset form first
      setFormData({ email: '', password: '', rememberMe: false });
      
      // Show brief success state
      setIsLoginSuccess(true);
      
      // Small delay to show success message, then navigate
      setTimeout(() => {
        setIsLoginSuccess(false);
        setIsLoading(false);
        tracedOnClose(); // Use traced version
        
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
      }, 800); // Slightly longer delay to show success message
      
    } catch (err) {
      console.error('❌ [LoginModal] Login failed with error:', err);
      
      // User-friendly error handling
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (err instanceof Error) {
        // Get the error message and convert to lowercase for easier matching
        const message = err.message.toLowerCase();
        
        // Also check error code if it's a Firebase error
        const errorCode = (err as any).code?.toLowerCase() || '';
        
        console.log('🔍 [LoginModal] Error message:', message);
        console.log('🔍 [LoginModal] Error code:', errorCode);
        
        // Firebase authentication errors (check both code and message)
        if (errorCode.includes('invalid-credential') || 
            message.includes('auth/invalid-credential') || 
            message.includes('invalid-credential') ||
            message.includes('invalid credential')) {
          errorMessage = 'Incorrect email or password. Please try again.';
        }
        else if (errorCode.includes('wrong-password') ||
                 message.includes('auth/wrong-password') || 
                 message.includes('wrong-password') || 
                 message.includes('incorrect password')) {
          errorMessage = 'Incorrect password. Please try again.';
        }
        else if (errorCode.includes('user-not-found') ||
                 message.includes('auth/user-not-found') || 
                 message.includes('user-not-found') || 
                 message.includes('user not found')) {
          errorMessage = "We couldn't find an account with that email. Please check your email or create a new account.";
        }
        else if (errorCode.includes('invalid-email') ||
                 message.includes('auth/invalid-email') || 
                 message.includes('invalid-email')) {
          errorMessage = 'Please enter a valid email address.';
        }
        else if (errorCode.includes('user-disabled') ||
                 message.includes('auth/user-disabled') || 
                 message.includes('user-disabled') || 
                 message.includes('account disabled')) {
          errorMessage = 'Your account has been disabled. Please contact support for help.';
        }
        else if (errorCode.includes('too-many-requests') ||
                 message.includes('auth/too-many-requests') || 
                 message.includes('too-many-requests') || 
                 message.includes('too many attempts')) {
          errorMessage = 'Too many failed login attempts. Please wait a few minutes and try again.';
        }
        // Backend API errors
        else if (message.includes('invalid email or password') || 
                 message.includes('invalid credentials') || 
                 message.includes('401')) {
          errorMessage = 'Incorrect email or password. Please try again.';
        }
        // Email verification issues
        else if (message.includes('verify your email') || 
                 message.includes('email not verified') || 
                 message.includes('account not verified')) {
          errorMessage = 'Login successful! Some features may be limited until you verify your email from your profile settings.';
        }
        // Network and connection errors
        else if (message.includes('network') || 
                 message.includes('fetch failed') || 
                 message.includes('timeout') || 
                 err instanceof TypeError) {
          errorMessage = 'Connection problem. Please check your internet and try again.';
        }
        else if (message.includes('offline')) {
          errorMessage = 'No internet connection. Please check your connection and try again.';
        }
        // Server errors
        else if (message.includes('500') || message.includes('502') || 
                 message.includes('503') || message.includes('504') || 
                 message.includes('server')) {
          errorMessage = 'Our servers are having issues. Please try again in a few minutes.';
        }
        // Maintenance
        else if (message.includes('maintenance') || message.includes('unavailable')) {
          errorMessage = 'We are updating our system. Please try again in a few minutes.';
        }
        // Generic fallback - ALWAYS user-friendly, never show raw errors
        else {
          errorMessage = 'Incorrect email or password. Please try again.';
        }
      }
      
      console.log('📝 [LoginModal] Setting error message:', errorMessage);
      console.log('🔍 [LoginModal] Current state before setting error:', { isLoading, isLoginSuccess, error });
      
      setError(errorMessage);
      setIsLoading(false);
      setIsLoginSuccess(false);
      
      console.log('✅ [LoginModal] Error state set, modal should stay open');
      console.log('🔍 [LoginModal] Error value set to:', errorMessage);
      
      // Don't close modal on error - let user try again
      // DO NOT call onClose() here!
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error on input change
    if (error) {
      setError(null);
    }
  };



  return (
    <>
      {/* Simple Success Overlay - Brief and minimal - Only show if no error */}
      {isLoginSuccess && !error && !isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-green-200 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-900 font-medium">Welcome back!</p>
              <p className="text-sm text-gray-500">Redirecting...</p>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={tracedOnClose} maxWidth="md" preventBackdropClose={!!error}>
      {/* Simple header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl shadow-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome Back!
        </h2>
        <p className="text-gray-600">Sign in to your Wedding Bazaar account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Simple Error Message - ENHANCED VISIBILITY */}
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg animate-shake">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
              <button 
                type="button"
                onClick={() => {
                  console.log('🚨 [LoginModal] ERROR IS VISIBLE IN UI:', error);
                  setError(null);
                }}
                className="text-red-400 hover:text-red-600 flex-shrink-0"
                title="Dismiss"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Simple Email Field */}
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              required
            />
          </div>
        </div>

        {/* Simple Password Field */}
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-rose-500"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Simple Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
            />
            <span className="ml-2 text-sm text-gray-700">Remember me</span>
          </label>
          <button type="button" className="text-sm text-rose-600 hover:text-rose-700 font-medium">
            Forgot password?
          </button>
        </div>

        {/* Simple Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isLoginSuccess}
          className={cn(
            "w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium rounded-lg",
            "hover:from-rose-600 hover:to-pink-600 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            "shadow-lg hover:shadow-xl"
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying credentials...
            </span>
          ) : 'Sign In'}
        </button>

        {/* Simple Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Simple Social Login */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors bg-white"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700">Google</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors bg-white"
          >
            <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="font-medium text-gray-700">Facebook</span>
          </button>
        </div>
      </form>

      {/* Simple Switch to Register */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            Sign up here
          </button>
        </p>
      </div>
    </Modal>
  </>
  );
};
