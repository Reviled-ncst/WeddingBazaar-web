import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';

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
      // Attempt login and get user data
      const user = await login(formData.email, formData.password);
      
      // Show success loading animation
      setIsLoginSuccess(true);
      setIsLoading(false);
      
      // Wait for success animation to show
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Route user to appropriate landing page based on their role
      switch (user.role) {
        case 'couple':
          navigate('/individual');
          break;
        case 'vendor':
          navigate('/vendors');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          // Fallback to home page if role is unknown
          navigate('/');
      }
      
      // Close modal AFTER navigation
      onClose();
      
      // Reset form
      setFormData({ email: '', password: '', rememberMe: false });
      setIsLoginSuccess(false);
      
    } catch (err) {
      // User-friendly error handling
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (err instanceof Error) {
        const message = err.message.toLowerCase();
        
        // Login credential issues
        if (message.includes('invalid email or password') || message.includes('invalid credentials') || message.includes('401')) {
          errorMessage = 'Incorrect email or password. Please try again.';
        } 
        // Email verification needed
        else if (message.includes('verify your email') || message.includes('email not verified') || message.includes('account not verified')) {
          errorMessage = 'Please check your email and click the verification link before signing in.';
        }
        // Account issues
        else if (message.includes('user not found') || message.includes('account not found')) {
          errorMessage = "We couldn't find an account with that email. Please check your email or create a new account.";
        }
        else if (message.includes('account suspended') || message.includes('account disabled')) {
          errorMessage = 'Your account has been temporarily suspended. Please contact us for help.';
        }
        else if (message.includes('account locked') || message.includes('too many attempts')) {
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
          errorMessage = 'Something went wrong. Please try again or contact us if this keeps happening.';
        }
      }
      
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
      {/* Elaborate Success Loading Overlay - Only appears after successful login */}
      {isLoginSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-md">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-12 shadow-2xl border border-white/50 max-w-md w-full mx-4 overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-pink-50/60 to-purple-50/80"></div>
            
            {/* Floating decorative elements */}
            <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-rose-300/30 to-pink-300/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-8 right-6 w-16 h-16 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-xl animate-pulse delay-300"></div>
            <div className="absolute bottom-6 left-8 w-24 h-24 bg-gradient-to-br from-rose-200/25 to-pink-200/25 rounded-full blur-3xl animate-pulse delay-700"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Animated Hearts */}
              <div className="relative mb-8">
                <div className="flex justify-center items-center space-x-2">
                  <Heart className="h-8 w-8 text-rose-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <Heart className="h-10 w-10 text-pink-500 animate-bounce" style={{ animationDelay: '200ms' }} />
                  <Heart className="h-8 w-8 text-rose-400 animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
                
                {/* Ripple effect */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-24 h-24 border-2 border-rose-300/30 rounded-full animate-ping"></div>
                  <div className="absolute top-2 left-2 w-20 h-20 border-2 border-pink-300/20 rounded-full animate-ping delay-300"></div>
                </div>
              </div>
              
              {/* Success Message */}
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent mb-3">
                Welcome Back!
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                Successfully signed in
              </p>
              
              {/* Animated Progress Bar */}
              <div className="relative mb-6">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 rounded-full animate-slide-in"></div>
              </div>
              
              {/* Loading Text */}
              <p className="text-sm text-gray-500 animate-pulse">
                Redirecting to your dashboard...
              </p>
              
              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-float-particle opacity-60 top-4 left-8 delay-0"></div>
                <div className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-float-particle opacity-60 top-12 right-12 delay-300"></div>
                <div className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-float-particle opacity-60 top-20 left-16 delay-700"></div>
                <div className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-float-particle opacity-60 top-16 right-8 delay-1000"></div>
                <div className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-float-particle opacity-60 bottom-20 left-12 delay-500"></div>
                <div className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-float-particle opacity-60 bottom-16 right-16 delay-800"></div>
                <div className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-float-particle opacity-60 bottom-12 left-20 delay-200"></div>
                <div className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-float-particle opacity-60 bottom-8 right-4 delay-600"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" preventBackdropClose={!!error}>
      {/* Enhanced header with glassmorphism */}
      <div className="text-center mb-8 relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-2xl"></div>
        <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-rose-300/20 to-pink-300/20 rounded-full blur-2xl"></div>
        
        <div className="flex justify-center mb-6 relative z-10">
          <div className="relative p-4 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-3xl shadow-2xl shadow-rose-500/25 group overflow-hidden">
            {/* Glassmorphism layers */}
            <div className="absolute inset-0 bg-white/20 rounded-3xl"></div>
            <div className="absolute inset-px bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
            
            {/* Animated heart */}
            <Heart className="h-10 w-10 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
            
            {/* Subtle shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 skew-x-12"></div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent mb-2 relative z-10">
          Welcome Back!
        </h2>
        <p className="text-gray-600 text-lg relative z-10">Sign in to your Wedding Bazaar account</p>
        
        {/* Decorative line */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-rose-300/50 to-transparent"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Enhanced Error Message */}
        {error && (
          <div className="relative p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 rounded-2xl shadow-lg backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-white/40 rounded-2xl"></div>
            <div className="flex items-start space-x-3 relative z-10">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                title="Dismiss error"
                aria-label="Dismiss error message"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-rose-400 rounded-t-2xl"></div>
          </div>
        )}

        {/* Enhanced Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors duration-300 z-10" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-300 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl relative z-10"
              required
            />
          </div>
        </div>

        {/* Enhanced Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
            Password
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors duration-300 z-10" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-300 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl relative z-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors duration-300 z-10 p-1 rounded-lg hover:bg-rose-50"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Remember Me & Forgot Password */}
        <div className="flex items-center justify-between py-2">
          <label className="flex items-center group cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-5 w-5 text-rose-600 border-2 border-gray-300 rounded-lg focus:ring-rose-500/20 focus:ring-2 transition-all duration-300 cursor-pointer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm text-rose-600 hover:text-rose-700 font-semibold relative group"
          >
            Forgot password?
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
          </button>
        </div>

        {/* Enhanced Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "relative w-full py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-semibold rounded-2xl overflow-hidden",
            "hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transform hover:scale-[1.02] transition-all duration-300",
            "focus:ring-2 focus:ring-rose-500/20 focus:ring-offset-2 shadow-2xl hover:shadow-rose-500/25",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
          )}
        >
          {/* Glassmorphism layers */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl"></div>
          <div className="absolute inset-px bg-gradient-to-r from-white/10 to-transparent rounded-2xl"></div>
          
          {/* Button text */}
          <span className="relative z-10 text-lg">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </span>
          
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 skew-x-12"></div>
        </button>

        {/* Enhanced Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium rounded-full border border-gray-200 shadow-sm">Or continue with</span>
          </div>
        </div>

        {/* Enhanced Social Login */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="relative flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all duration-300 group overflow-hidden bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <svg className="h-6 w-6 mr-3 relative z-10" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700 relative z-10">Google</span>
          </button>
          <button
            type="button"
            className="relative flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all duration-300 group overflow-hidden bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <svg className="h-6 w-6 mr-3 relative z-10" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="font-medium text-gray-700 relative z-10">Facebook</span>
          </button>
        </div>
      </form>

      {/* Enhanced Switch to Register */}
      <div className="mt-8 text-center relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-24 h-24 bg-gradient-to-br from-rose-200/20 to-pink-200/20 rounded-full blur-2xl"></div>
        <p className="text-gray-600 relative z-10">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-rose-600 hover:text-rose-700 font-semibold relative group"
          >
            Sign up here
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
          </button>
        </p>
      </div>
    </Modal>
  </>
  );
};
