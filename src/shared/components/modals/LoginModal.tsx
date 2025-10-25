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

  // Clear error when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 [LoginModal] Starting login process...');
      
      // Attempt login and get user data
      const user = await login(formData.email, formData.password);
      
      console.log('✅ [LoginModal] Login successful, user:', user);
      
      // Quick success state (no long animation)
      setIsLoginSuccess(true);
      
      // Close modal immediately
      onClose();
      
      // Reset form
      setFormData({ email: '', password: '', rememberMe: false });
      
      // Route user to appropriate landing page based on their role
      setTimeout(() => {
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
        setIsLoginSuccess(false);
        setIsLoading(false);
      }, 100);
      
    } catch (err) {
      console.error('❌ [LoginModal] Login failed with error:', err);
      
      // User-friendly error handling
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (err instanceof Error) {
        const message = err.message.toLowerCase();
        
        console.log('🔍 [LoginModal] Error message:', message);
        
        // Login credential issues
        if (message.includes('invalid email or password') || message.includes('invalid credentials') || message.includes('401')) {
          errorMessage = 'Incorrect email or password. Please try again.';
        } 
        // Firebase specific errors
        else if (message.includes('incorrect password') || message.includes('wrong-password') || message.includes('wrong password')) {
          errorMessage = 'Incorrect password. Please try again.';
        }
        else if (message.includes('user not found') || message.includes('no account found')) {
          errorMessage = "We couldn't find an account with that email. Please check your email or create a new account.";
        }
        // Email verification issues (should be rare now since we allow unverified login)
        else if (message.includes('verify your email') || message.includes('email not verified') || message.includes('account not verified')) {
          errorMessage = 'Login successful! Some features may be limited until you verify your email from your profile settings.';
        }
        // Account issues
        else if (message.includes('account suspended') || message.includes('account disabled') || message.includes('user-disabled')) {
          errorMessage = 'Your account has been temporarily suspended. Please contact us for help.';
        }
        else if (message.includes('account locked') || message.includes('too many attempts') || message.includes('too-many-requests')) {
          errorMessage = 'Too many failed attempts. Please wait a few minutes and try again.';
        }
        // Connection problems
        else if (message.includes('network') || message.includes('fetch failed') || message.includes('timeout') || err instanceof TypeError) {
          errorMessage = 'Connection problem. Please check your internet and try again.';
        }
        else if (message.includes('offline')) {
          errorMessage = 'No internet connection. Please check your connection and try again.';
        }
        // Server problems
        else if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504') || message.includes('server')) {
          errorMessage = 'Our servers are having issues. Please try again in a few minutes.';
        }
        // Maintenance
        else if (message.includes('maintenance') || message.includes('unavailable')) {
          errorMessage = 'We are updating our system. Please try again in a few minutes.';
        }
        // Generic fallback
        else {
          errorMessage = err.message || 'Something went wrong. Please try again or contact us if this keeps happening.';
        }
      }
      
      console.log('📝 [LoginModal] Setting error message:', errorMessage);
      
      setError(errorMessage);
      setIsLoading(false);
      setIsLoginSuccess(false);
      
      // Don't close modal on error - let user try again
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
      {/* Simple Success Overlay - Brief and minimal */}
      {isLoginSuccess && (
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

      <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" preventBackdropClose={!!error}>
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
        {/* Simple Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
          disabled={isLoading}
          className={cn(
            "w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium rounded-lg",
            "hover:from-rose-600 hover:to-pink-600 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            "shadow-lg hover:shadow-xl"
          )}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
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
