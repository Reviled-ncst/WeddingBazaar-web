import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Mail, Lock, User, Heart, Phone, Building, CheckCircle, 
  MapPin, Zap, Tag, PartyPopper, RefreshCw, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { TermsOfServiceModal } from './TermsOfServiceModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import BusinessLocationMap from '../map/BusinessLocationMap';
import LocationSearch from '../location/LocationSearch';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../contexts/HybridAuthContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ 
  isOpen, 
  onClose, 
  onSwitchToLogin 
}) => {
  // Core state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'couple' | 'vendor'>('couple');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Email verification state (Firebase)
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  
  // Modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  
  // Enhanced UI states
  const [fadeIn, setFadeIn] = useState(false);

  // Initialize animations
  useEffect(() => {
    if (isOpen) {
      setFadeIn(true);
    }
  }, [isOpen]);

  // Form data with essential fields only
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Vendor Business Info (only if vendor)
    business_name: '',
    business_type: '',
    location: '',
    
    // Preferences
    agreeToTerms: false,
    receiveUpdates: false,
  });

  const { register, sendEmailVerification, reloadUser, firebaseUser, isEmailVerified, registerWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Essential vendor categories
  const vendorCategories = [
    { value: 'Photography', label: 'Photography' },
    { value: 'Videography', label: 'Videography' },
    { value: 'Wedding Planning', label: 'Wedding Planning' },
    { value: 'Catering', label: 'Catering' },
    { value: 'Venue', label: 'Venue' },
    { value: 'Music/DJ', label: 'Music/DJ' },
    { value: 'Flowers', label: 'Flowers' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Beauty', label: 'Beauty & Makeup' },
    { value: 'Other', label: 'Other Services' }
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        business_name: '',
        business_type: '',
        location: '',
        agreeToTerms: false,
        receiveUpdates: false,
      });
      setValidationErrors({});
      setError(null);
      setIsSuccess(false);
      setUserType('couple');
      
      // Reset email verification state
      setShowEmailVerification(false);
      setVerificationSent(false);
      setCheckingVerification(false);
    }
  }, [isOpen]);

  // Validation function
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    if (userType === 'vendor') {
      if (!formData.business_name.trim()) errors.business_name = 'Business name is required';
      if (!formData.business_type) errors.business_type = 'Business category is required';
      if (!formData.location.trim()) errors.location = 'Business location is required';
    }
    
    if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms';
    
    return errors;
  };

  // Helper function to update form data and clear errors
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear general error if any
    if (error) {
      setError(null);
    }
  };

  // Handle form submission - handles both Firebase and backend registration
  const handleSubmit = async () => {
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Register (will use Firebase if configured, otherwise backend)
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: userType,
        ...(userType === 'vendor' && {
          business_name: formData.business_name,
          business_type: formData.business_type,
          location: formData.location,
        }),
        receiveUpdates: formData.receiveUpdates,
      });

      // Check if Firebase is configured for email verification
      const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_API_KEY && 
                                   import.meta.env.VITE_FIREBASE_API_KEY !== "demo-api-key";
      
      if (isFirebaseConfigured && firebaseUser) {
        // Show email verification step for Firebase
        setShowEmailVerification(true);
        setVerificationSent(true);
      } else {
        // Backend registration successful - go directly to success
        setIsSuccess(true);
        
        // Redirect after a delay
        setTimeout(() => {
          onClose();
          if (userType === 'couple') {
            navigate('/individual');
          } else {
            navigate('/vendor');
          }
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase email verification status checking
  // Add verification status checking with Firebase
  useEffect(() => {
    if (showEmailVerification && firebaseUser) {
      const interval = setInterval(async () => {
        try {
          await reloadUser();
          if (isEmailVerified) {
            setIsSuccess(true);
            setShowEmailVerification(false);
            clearInterval(interval);
            
            // Redirect after a delay
            setTimeout(() => {
              onClose();
              if (userType === 'couple') {
                navigate('/individual');
              } else {
                navigate('/vendor');
              }
            }, 2000);
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
        }
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [showEmailVerification, firebaseUser, isEmailVerified, reloadUser, onClose, navigate, userType]);

  const handleResendVerification = async () => {
    try {
      setCheckingVerification(true);
      await sendEmailVerification();
      setVerificationSent(true);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to resend verification email');
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setCheckingVerification(true);
      await reloadUser();
      
      if (isEmailVerified) {
        setIsSuccess(true);
        setShowEmailVerification(false);
        
        // Redirect after a delay
        setTimeout(() => {
          onClose();
          if (userType === 'couple') {
            navigate('/individual');
          } else {
            navigate('/vendor');
          }
        }, 2000);
      } else {
        setError('Email not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to check verification status');
    } finally {
      setCheckingVerification(false);
    }
  };

  // Handle Google OAuth registration
  const handleGoogleRegistration = async () => {
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await registerWithGoogle(userType);
      setIsSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        onClose();
        if (userType === 'couple') {
          navigate('/individual');
        } else {
          navigate('/vendor');
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('Google registration error:', error);
      if (error.message.includes('Firebase')) {
        setError('Google sign-in is not available. Please use email registration or check your internet connection.');
      } else {
        setError(error.message || 'Google registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl" preventBackdropClose={!!error || Object.keys(validationErrors).length > 0}>
        <div className={cn("relative overflow-hidden px-6 py-6", fadeIn && "animate-in fade-in duration-500")}>
          
          {/* Enhanced Background decoration */}
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-rose-400 via-pink-400 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full blur-xl opacity-50"></div>
          </div>

          {/* Success Overlay with enhanced animations */}
          {isSuccess && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-green-50/90 to-emerald-50/95 backdrop-blur-xl rounded-2xl z-50 flex items-center justify-center animate-in fade-in duration-700">
              <div className="text-center relative z-10 animate-in slide-in-from-bottom duration-1000">
                <div className="mb-6 relative">
                  <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                    <CheckCircle className="h-10 w-10 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full animate-ping"></div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Welcome to Wedding Bazaar! 🎉
                  </h3>
                  <p className="text-gray-600 text-base max-w-md mx-auto leading-relaxed">
                    Your {userType} account has been created successfully! Get ready to make your wedding dreams come true.
                  </p>
                  
                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-2xl font-semibold text-sm shadow-xl animate-pulse">
                    <Zap className="h-5 w-5 mr-2 animate-spin" />
                    Taking you to your dashboard...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Single Page Registration Form */}
          <div className="relative">
            {/* Enhanced Background Glass Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-rose-50/40 to-purple-50/30 rounded-2xl backdrop-blur-md border border-white/50 shadow-2xl -m-3"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-2xl -m-2"></div>
            
            {/* Enhanced Header */}
            <div className="relative text-center mb-8 pt-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 rounded-2xl shadow-xl mb-4 rotate-3 hover:rotate-0 transition-transform duration-500">
                <PartyPopper className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Join Wedding Bazaar
              </h2>
              <p className="text-gray-600 text-base max-w-md mx-auto leading-relaxed">
                Create your account and start planning your perfect wedding with the best vendors
              </p>
            </div>

            {/* Main Form Content */}
            <div className="relative max-w-5xl mx-auto space-y-8">
              
              {/* Email Verification View */}
              {showEmailVerification ? (
                <div className="space-y-6">
                  {/* Email Verification Header */}
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                    <p className="text-gray-600">
                      We've sent a verification link to <strong>{formData.email}</strong>
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                      <ol className="text-sm text-blue-800 space-y-1">
                        <li>1. Check your email inbox</li>
                        <li>2. Click the verification link</li>
                        <li>3. Come back here and click "I've Verified"</li>
                      </ol>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleCheckVerification}
                        disabled={checkingVerification}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {checkingVerification ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            I've Verified My Email
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleResendVerification}
                        disabled={checkingVerification}
                        className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Resend Verification Email
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                      Didn't receive the email? Check your spam folder or try resending.
                    </p>
                  </div>

                  {/* Back to Registration */}
                  <div className="text-center">
                    <button
                      onClick={() => setShowEmailVerification(false)}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      ← Back to registration form
                    </button>
                  </div>
                </div>
              ) : (
                /* Regular Registration Form */
                <>
              
              {/* Enhanced User Type Selection */}
              <div className="space-y-4">
                <label className="block text-lg font-bold text-gray-800 text-center">I am a:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    type="button"
                    onClick={() => setUserType('couple')}
                    className={cn(
                      "group p-6 rounded-2xl border-3 transition-all duration-500 text-left transform hover:scale-105 hover:shadow-2xl",
                      userType === 'couple'
                        ? "border-rose-500 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 text-rose-800 shadow-xl scale-105"
                        : "border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-rose-300 hover:shadow-lg"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:rotate-12",
                        userType === 'couple' 
                          ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg" 
                          : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 group-hover:from-rose-100 group-hover:to-pink-100 group-hover:text-rose-500"
                      )}>
                        <Heart className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">Planning My Wedding</div>
                        <div className="text-sm opacity-75 mt-1">Find amazing vendors and plan your dream wedding</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setUserType('vendor')}
                    className={cn(
                      "group p-6 rounded-2xl border-3 transition-all duration-500 text-left transform hover:scale-105 hover:shadow-2xl",
                      userType === 'vendor'
                        ? "border-purple-500 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 text-purple-800 shadow-xl scale-105"
                        : "border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-purple-300 hover:shadow-lg"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:rotate-12",
                        userType === 'vendor' 
                          ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg" 
                          : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 group-hover:from-purple-100 group-hover:to-indigo-100 group-hover:text-purple-500"
                      )}>
                        <Building className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">Wedding Vendor</div>
                        <div className="text-sm opacity-75 mt-1">Offer your services to happy couples</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Enhanced Basic Information */}
              <div className="bg-gradient-to-br from-white/80 to-gray-50/60 p-6 rounded-2xl border border-white/50 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <User className="h-6 w-6 mr-3 text-rose-500" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      className={cn(
                        "w-full px-4 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-lg",
                        "bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl",
                        validationErrors.firstName
                          ? "border-red-400 focus:border-red-500 bg-red-50/80 focus:ring-4 focus:ring-red-100"
                          : "border-gray-200 focus:border-rose-400 focus:shadow-2xl focus:shadow-rose-500/20 focus:ring-4 focus:ring-rose-100"
                      )}
                      placeholder="Enter your first name"
                    />
                    {validationErrors.firstName && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {validationErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      className={cn(
                        "w-full px-4 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-lg",
                        "bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl",
                        validationErrors.lastName
                          ? "border-red-400 focus:border-red-500 bg-red-50/80 focus:ring-4 focus:ring-red-100"
                          : "border-gray-200 focus:border-rose-400 focus:shadow-2xl focus:shadow-rose-500/20 focus:ring-4 focus:ring-rose-100"
                      )}
                      placeholder="Enter your last name"
                    />
                    {validationErrors.lastName && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {validationErrors.lastName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-rose-500" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className={cn(
                        "w-full px-4 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-lg",
                        "bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl",
                        validationErrors.email
                          ? "border-red-400 focus:border-red-500 bg-red-50/80 focus:ring-4 focus:ring-red-100"
                          : "border-gray-200 focus:border-rose-400 focus:shadow-2xl focus:shadow-rose-500/20 focus:ring-4 focus:ring-rose-100"
                      )}
                      placeholder="your.email@example.com"
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-rose-400 focus:shadow-2xl focus:shadow-rose-500/20 focus:ring-4 focus:ring-rose-100 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl text-lg"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-rose-500" />
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        className={cn(
                          "w-full px-4 py-4 pr-14 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-lg",
                          "bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl",
                          validationErrors.password
                            ? "border-red-400 focus:border-red-500 bg-red-50/80 focus:ring-4 focus:ring-red-100"
                            : "border-gray-200 focus:border-rose-400 focus:shadow-2xl focus:shadow-rose-500/20 focus:ring-4 focus:ring-rose-100"
                        )}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                      >
                        {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-rose-500" />
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                        className={cn(
                          "w-full px-4 py-4 pr-14 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-lg",
                          "bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl",
                          validationErrors.confirmPassword
                            ? "border-red-400 focus:border-red-500 bg-red-50/80 focus:ring-4 focus:ring-red-100"
                            : "border-gray-200 focus:border-rose-400 focus:shadow-2xl focus:shadow-rose-500/20 focus:ring-4 focus:ring-rose-100"
                        )}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                      >
                        {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {validationErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Vendor-specific fields */}
              {userType === 'vendor' && (
                <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/60 p-6 rounded-2xl border border-purple-200/50 shadow-lg animate-in slide-in-from-bottom duration-500">
                  <h3 className="text-xl font-bold text-purple-800 mb-6 flex items-center">
                    <Building className="h-6 w-6 mr-3 text-purple-500" />
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={formData.business_name}
                        onChange={(e) => updateFormData('business_name', e.target.value)}
                        className={cn(
                          "w-full px-4 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-lg",
                          "bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl",
                          validationErrors.business_name
                            ? "border-red-400 focus:border-red-500 bg-red-50/80 focus:ring-4 focus:ring-red-100"
                            : "border-gray-200 focus:border-purple-400 focus:shadow-2xl focus:shadow-purple-500/20 focus:ring-4 focus:ring-purple-100"
                        )}
                        placeholder="Your Amazing Business Name"
                      />
                      {validationErrors.business_name && (
                        <p className="text-red-500 text-sm mt-2 flex items-center">
                          <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                          {validationErrors.business_name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-purple-500" />
                        Business Category *
                      </label>
                      <select
                        value={formData.business_type}
                        onChange={(e) => updateFormData('business_type', e.target.value)}
                        title="Select your business category"
                        className={cn(
                          "w-full px-4 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-lg cursor-pointer",
                          "bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl",
                          validationErrors.business_type
                            ? "border-red-400 focus:border-red-500 bg-red-50/80 focus:ring-4 focus:ring-red-100"
                            : "border-gray-200 focus:border-purple-400 focus:shadow-2xl focus:shadow-purple-500/20 focus:ring-4 focus:ring-purple-100"
                        )}
                      >
                        <option value="">Choose your specialty...</option>
                        {vendorCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      {validationErrors.business_type && (
                        <p className="text-red-500 text-sm mt-2 flex items-center">
                          <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                          {validationErrors.business_type}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                        Business Location *
                      </label>
                      <div className="relative">
                        <LocationSearch
                          value={formData.location}
                          onChange={(location: string) => {
                            setFormData(prev => ({ ...prev, location }));
                            if (validationErrors.location) {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.location;
                                return newErrors;
                              });
                            }
                          }}
                          placeholder="Where is your business located?"
                          className={cn(
                            "w-full text-lg",
                            validationErrors.location
                              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                              : "border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                          )}
                          error={validationErrors.location}
                        />
                      </div>
                      {validationErrors.location && (
                        <p className="text-red-500 text-sm mt-2 flex items-center">
                          <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                          {validationErrors.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Terms & Conditions */}
              <div className="bg-gradient-to-br from-gray-50/80 to-slate-50/60 p-6 rounded-2xl border border-gray-200/50 shadow-lg space-y-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">✓</span>
                  </span>
                  Agreement & Preferences
                </h3>
                
                <div className="flex items-start space-x-4 p-4 bg-white/60 rounded-xl border border-gray-100">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                    className="mt-1 h-5 w-5 text-rose-600 border-2 border-gray-300 rounded-lg focus:ring-rose-500 focus:ring-4"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-relaxed">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-rose-600 hover:text-rose-700 font-bold underline decoration-2 underline-offset-2 transition-colors"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-rose-600 hover:text-rose-700 font-bold underline decoration-2 underline-offset-2 transition-colors"
                    >
                      Privacy Policy
                    </button>
                    {!formData.agreeToTerms && (
                      <span className="block text-red-500 text-xs mt-1 font-medium">
                        * Required to create your account
                      </span>
                    )}
                  </label>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    id="receiveUpdates"
                    checked={formData.receiveUpdates}
                    onChange={(e) => setFormData(prev => ({ ...prev, receiveUpdates: e.target.checked }))}
                    className="mt-1 h-5 w-5 text-blue-600 border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-4"
                  />
                  <label htmlFor="receiveUpdates" className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-medium">Stay in the loop!</span> 
                    <br />
                    Receive updates about new features, wedding planning tips, and exclusive vendor offers
                  </label>
                </div>
              </div>

              {/* Enhanced Submit Button */}
              <div className="flex flex-col items-center space-y-6 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !formData.agreeToTerms}
                  className={cn(
                    "group relative w-full max-w-lg flex items-center justify-center px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-500 shadow-2xl transform",
                    "bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white",
                    "hover:from-rose-700 hover:via-pink-700 hover:to-purple-700",
                    "hover:shadow-3xl hover:scale-105 hover:-translate-y-1",
                    "focus:outline-none focus:ring-4 focus:ring-rose-300",
                    "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-2xl disabled:hover:scale-100 disabled:hover:translate-y-0",
                    !formData.agreeToTerms && "animate-pulse"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      Creating Your Account...
                    </>
                  ) : (
                    <>
                      <PartyPopper className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      Create My {userType === 'vendor' ? 'Business' : 'Wedding'} Account
                    </>
                  )}
                </button>

                {/* OR Divider */}
                <div className="flex items-center justify-center space-x-4 my-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  <span className="text-gray-500 text-sm font-medium px-4 bg-white/80 rounded-full">or</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>

                {/* Google OAuth Button */}
                <button
                  onClick={handleGoogleRegistration}
                  disabled={isLoading}
                  className={cn(
                    "group relative w-full max-w-lg flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 shadow-lg transform",
                    "bg-white border-2 border-gray-300 text-gray-700",
                    "hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700",
                    "hover:shadow-xl hover:scale-105 hover:-translate-y-0.5",
                    "focus:outline-none focus:ring-4 focus:ring-blue-200",
                    "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:scale-100 disabled:hover:translate-y-0"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/30 to-blue-50/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mr-3"></div>
                      Signing up with Google...
                    </>
                  ) : (
                    <>
                      {/* Google Logo SVG */}
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                {/* Google OAuth Status Note */}
                {(() => {
                  const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_API_KEY && 
                                               import.meta.env.VITE_FIREBASE_API_KEY !== "demo-api-key" &&
                                               !import.meta.env.VITE_FIREBASE_API_KEY?.includes('demo');
                  
                  if (!isFirebaseConfigured) {
                    return (
                      <div className="max-w-lg mx-auto">
                        <p className="text-xs text-gray-500 text-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                          💡 Google sign-in requires Firebase configuration. Use email registration for now.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="text-center space-y-3">
                  <p className="text-gray-500 text-sm">
                    Already have an account?{' '}
                    <button
                      onClick={onSwitchToLogin}
                      className="text-rose-600 hover:text-rose-700 font-bold transition-colors underline decoration-2 underline-offset-2"
                    >
                      Sign in here
                    </button>
                  </p>
                  
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>Secure Registration</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>SSL Protected</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  </div>
                </div>
              </div>

              {/* Enhanced Error Display */}
              {error && (
                <div className="max-w-lg mx-auto p-5 bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl shadow-lg animate-in slide-in-from-bottom duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <div>
                      <h4 className="text-red-800 font-bold text-sm">Registration Error</h4>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* Business Location Map Modal */}
      {showLocationMap && (
        <BusinessLocationMap
          isOpen={showLocationMap}
          onClose={() => setShowLocationMap(false)}
          onLocationSelect={(location: { address: string; coordinates: { lat: number; lng: number; } }) => {
            setFormData(prev => ({ ...prev, location: location.address }));
            setShowLocationMap(false);
          }}
        />
      )}
    </>
  );
};
