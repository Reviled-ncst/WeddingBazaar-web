import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Mail, Lock, User, Heart, Phone, Building, CheckCircle, 
  PartyPopper, RefreshCw, AlertCircle
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

export const FirebaseRegisterModal: React.FC<RegisterModalProps> = ({ 
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
  
  // Email verification state
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [, setVerificationSent] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  
  // Modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: '',
    specialties: '',
    experience: '',
    businessDescription: '',
    agreeToTerms: false,
    receiveUpdates: true
  });

  // Location state
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const { register, sendEmailVerification, reloadUser, firebaseUser, isEmailVerified } = useAuth();
  const navigate = useNavigate();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Check email verification status
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

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      businessType: '',
      specialties: '',
      experience: '',
      businessDescription: '',
      agreeToTerms: false,
      receiveUpdates: true
    });
    setSelectedLocation(null);
    setError(null);
    setValidationErrors({});
    setIsSuccess(false);
    setShowEmailVerification(false);
    setVerificationSent(false);
    setCheckingVerification(false);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Basic validation
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms and conditions';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Vendor-specific validation
    if (userType === 'vendor') {
      if (!formData.businessName.trim()) errors.businessName = 'Business name is required';
      if (!formData.businessType.trim()) errors.businessType = 'Business type is required';
      if (!selectedLocation) errors.location = 'Business location is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Register with Firebase
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: userType,
        phone: formData.phone || undefined,
        business_name: userType === 'vendor' ? formData.businessName : undefined,
        business_type: userType === 'vendor' ? formData.businessType : undefined,
        location: selectedLocation || undefined,
        receiveUpdates: formData.receiveUpdates
      });

      // Show email verification step
      setShowEmailVerification(true);
      setVerificationSent(true);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  // Success animation component
  const SuccessAnimation = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center animate-bounce">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 opacity-30 animate-pulse"></div>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Wedding Bazaar! 🎉</h3>
      <p className="text-gray-600 mb-4">Your account has been created successfully.</p>
      
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
        <CheckCircle className="w-4 h-4" />
        Email verified successfully
      </div>
      
      <p className="text-sm text-gray-500 mt-4">Redirecting you to your dashboard...</p>
    </div>
  );

  // Email verification step
  if (showEmailVerification) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
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
        </div>
      </Modal>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
        <SuccessAnimation />
      </Modal>
    );
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-4xl">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Side - Welcome Section */}
          <div className="lg:w-1/2 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 p-8 text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-pink-200" />
                <h1 className="text-3xl font-bold">Wedding Bazaar</h1>
              </div>
              
              <h2 className="text-2xl font-bold mb-4">
                {userType === 'couple' ? 'Plan Your Dream Wedding' : 'Grow Your Wedding Business'}
              </h2>
              
              <p className="text-lg opacity-90 mb-6">
                {userType === 'couple' 
                  ? 'Connect with trusted vendors and plan every detail of your special day.'
                  : 'Join thousands of vendors connecting with couples planning their perfect wedding.'
                }
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Verified vendors & secure payments</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Real reviews from real couples</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Free account with premium features</span>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-pink-300/20 blur-2xl"></div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="lg:w-1/2 p-8 bg-white overflow-y-auto max-h-[80vh]">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h3>
              <p className="text-gray-600">Join our community and start planning today</p>
            </div>

            {/* User Type Selection */}
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setUserType('couple')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all",
                    userType === 'couple'
                      ? "bg-white text-pink-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Heart className="w-4 h-4" />
                  I'm Getting Married
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('vendor')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all",
                    userType === 'vendor'
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Building className="w-4 h-4" />
                  I'm a Vendor
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className={cn(
                        "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent",
                        validationErrors.firstName ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter your first name"
                    />
                  </div>
                  {validationErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className={cn(
                        "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent",
                        validationErrors.lastName ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter your last name"
                    />
                  </div>
                  {validationErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={cn(
                        "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent",
                        validationErrors.email ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className={cn(
                        "w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent",
                        validationErrors.password ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Create a secure password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className={cn(
                        "w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent",
                        validationErrors.confirmPassword ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Vendor-specific fields */}
              {userType === 'vendor' && (
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Business Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                          validationErrors.businessName ? "border-red-300" : "border-gray-300"
                        )}
                        placeholder="Your business name"
                      />
                      {validationErrors.businessName && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.businessName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Type *
                      </label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                          validationErrors.businessType ? "border-red-300" : "border-gray-300"
                        )}
                      >
                        <option value="">Select business type</option>
                        <option value="Photography">Photography</option>
                        <option value="Catering">Catering</option>
                        <option value="Venue">Venue</option>
                        <option value="DJ">DJ / Music</option>
                        <option value="Wedding Planning">Wedding Planning</option>
                        <option value="Florist">Florist</option>
                        <option value="Decoration">Decoration</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Other">Other</option>
                      </select>
                      {validationErrors.businessType && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.businessType}</p>
                      )}
                    </div>
                  </div>

                  {/* Location Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Location *
                    </label>
                    <LocationSearch
                      onLocationSelect={setSelectedLocation}
                      placeholder="Search for your business location"
                    />
                    {selectedLocation && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                        Selected: {selectedLocation.address}
                      </div>
                    )}
                    {validationErrors.location && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.location}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                    className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-pink-600 hover:text-pink-700 underline"
                    >
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-pink-600 hover:text-pink-700 underline"
                    >
                      Privacy Policy
                    </button>
                    *
                  </label>
                </div>
                {validationErrors.agreeToTerms && (
                  <p className="text-red-500 text-xs">{validationErrors.agreeToTerms}</p>
                )}

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="receiveUpdates"
                    checked={formData.receiveUpdates}
                    onChange={(e) => setFormData({...formData, receiveUpdates: e.target.checked})}
                    className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="receiveUpdates" className="text-sm text-gray-700">
                    I would like to receive updates about new features and wedding tips
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <PartyPopper className="w-4 h-4" />
                    Create My Account
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      {/* Terms and Privacy Modals */}
      <TermsOfServiceModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />
      <PrivacyPolicyModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />
      
      {/* Location Map Modal */}
      {showLocationMap && selectedLocation && (
        <Modal 
          isOpen={showLocationMap} 
          onClose={() => setShowLocationMap(false)}
          className="w-full max-w-4xl"
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Confirm Business Location</h3>
            <div className="h-96 rounded-lg overflow-hidden">
              <BusinessLocationMap 
                location={selectedLocation}
                businessName={formData.businessName}
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowLocationMap(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
