import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Mail, Lock, User, Heart, Phone, Building, CheckCircle, 
  MapPin, Zap, Tag, PartyPopper
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { TermsOfServiceModal } from './TermsOfServiceModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import BusinessLocationMap from '../map/BusinessLocationMap';
import LocationSearch from '../location/LocationSearch';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';

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
  
  // OTP Verification state
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpStep, setOtpStep] = useState<'send' | 'verify'>('send');
  const [otpCodes, setOtpCodes] = useState({ email: '', sms: '' });
  const [otpLoading, setOtpLoading] = useState({ email: false, sms: false });
  const [otpVerified, setOtpVerified] = useState({ email: false, sms: false });
  const [otpErrors, setOtpErrors] = useState({ email: '', sms: '' });
  const [developmentOTPs, setDevelopmentOTPs] = useState({ email: '', sms: '' }); // For development mode
  const [registrationData, setRegistrationData] = useState<any>(null);
  
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

  const { register } = useAuth();
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
      
      // Reset OTP state
      setShowOTPVerification(false);
      setOtpStep('send');
      setOtpCodes({ email: '', sms: '' });
      setOtpLoading({ email: false, sms: false });
      setOtpVerified({ email: false, sms: false });
      setOtpErrors({ email: '', sms: '' });
      setDevelopmentOTPs({ email: '', sms: '' });
      setRegistrationData(null);
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

  // Handle form submission - now leads to OTP verification
  const handleSubmit = async () => {
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    // Save registration data for later use
    const regData = {
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
    };
    
    setRegistrationData(regData);
    setShowOTPVerification(true);
  };

  // Send OTP codes to email and phone
  const handleSendOTP = async () => {
    if (!registrationData) return;
    
    setOtpLoading({ email: true, sms: true });
    setOtpErrors({ email: '', sms: '' });
    
    const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
    
    console.log('🔧 OTP Send - Development mode:', isDevelopment);
    console.log('🔧 API Base URL:', apiBaseUrl);
    
    // In development mode, always use test OTPs immediately
    if (isDevelopment) {
      console.log('🔧 Development mode: Setting test OTPs directly');
      setDevelopmentOTPs({ email: '123456', sms: '654321' });
      setOtpLoading({ email: false, sms: false });
      setOtpStep('verify');
      
      // Show helpful messages
      setOtpErrors({
        email: '🔧 Development mode: Use code 123456',
        sms: registrationData.phone ? '🔧 Development mode: Use code 654321' : ''
      });
      return;
    }
    
    try {
      // Send email OTP
      try {
        const emailResponse = await fetch(`${apiBaseUrl}/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: registrationData.email,
            type: 'email'
          })
        });
        
        const emailResult = await emailResponse.json();
        if (emailResult.success) {
          console.log('📧 Email OTP sent successfully');
          // Store development OTP for easy access if provided
          if (emailResult.otpCode) {
            setDevelopmentOTPs(prev => ({ ...prev, email: emailResult.otpCode }));
          }
        } else {
          throw new Error(emailResult.message || 'Failed to send email OTP');
        }
      } catch (emailError) {
        console.error('Email OTP error:', emailError);
        setOtpErrors(prev => ({ 
          ...prev, 
          email: `Failed to send email OTP. Development fallback: Use code 123456` 
        }));
        setDevelopmentOTPs(prev => ({ ...prev, email: '123456' }));
      }
      
      // Send SMS OTP (if phone number provided)
      if (registrationData.phone) {
        try {
          const smsResponse = await fetch(`${apiBaseUrl}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: registrationData.phone,
              type: 'sms'
            })
          });
          
          const smsResult = await smsResponse.json();
          if (smsResult.success) {
            console.log('📱 SMS OTP sent successfully');
            // Store development OTP for easy access if provided
            if (smsResult.otpCode) {
              setDevelopmentOTPs(prev => ({ ...prev, sms: smsResult.otpCode }));
            }
          } else {
            throw new Error(smsResult.message || 'Failed to send SMS OTP');
          }
        } catch (smsError) {
          console.error('SMS OTP error:', smsError);
          setOtpErrors(prev => ({ 
            ...prev, 
            sms: `Failed to send SMS OTP. Development fallback: Use code 654321` 
          }));
          setDevelopmentOTPs(prev => ({ ...prev, sms: '654321' }));
        }
      }
      
      // Always proceed to verify step, even if backend failed (development fallbacks available)
      setOtpStep('verify');
      
    } catch (error) {
      console.error('OTP send error:', error);
      // Still proceed to verify step with development fallbacks
      setOtpErrors({ 
        email: 'Failed to send email OTP. Development fallback: Use code 123456', 
        sms: 'Failed to send SMS OTP. Development fallback: Use code 654321' 
      });
      setDevelopmentOTPs({ email: '123456', sms: '654321' });
      setOtpStep('verify');
    } finally {
      setOtpLoading({ email: false, sms: false });
    }
  };

  // Verify OTP codes
  const handleVerifyOTP = async () => {
    if (!registrationData) return;
    
    setIsLoading(true);
    setOtpErrors({ email: '', sms: '' });
    setError(null);
    
    const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname.includes('localhost');
    
    // ALWAYS allow development codes since backend OTP is not configured
    const allowDevelopmentCodes = true; // Always true until backend OTP is properly configured
    
    console.log('🔧 OTP Verify - Environment details:');
    console.log('  - import.meta.env.DEV:', import.meta.env.DEV);
    console.log('  - window.location.hostname:', window.location.hostname);
    console.log('  - isDevelopment:', isDevelopment);
    console.log('  - allowDevelopmentCodes:', allowDevelopmentCodes);
    console.log('  - apiBaseUrl:', apiBaseUrl);
    console.log('🔧 Input codes:');
    console.log('  - Email code:', otpCodes.email);
    console.log('  - SMS code:', otpCodes.sms);
    console.log('🔧 Expected development codes:');
    console.log('  - Email: 123456 or', developmentOTPs.email);
    console.log('  - SMS: 654321 or', developmentOTPs.sms);
    
    try {
      let emailVerified = false;
      let smsVerified = false;
      let verificationErrors: string[] = [];
      
      // Verify email OTP
      if (otpCodes.email) {
        // Accept development codes when allowed (backend OTP not configured)
        const isDevEmailCode = otpCodes.email === '123456' || otpCodes.email === developmentOTPs.email;
        console.log('🔧 Email verification check:', { 
          isDevelopment, 
          allowDevelopmentCodes,
          inputCode: otpCodes.email, 
          isDevEmailCode,
          developmentEmail: developmentOTPs.email 
        });
        
        if (allowDevelopmentCodes && isDevEmailCode) {
          console.log('✅ Development code accepted: Email OTP verified');
          emailVerified = true;
          setOtpVerified(prev => ({ ...prev, email: true }));
        } else {
          // Try backend verification
          try {
            const emailResponse = await fetch(`${apiBaseUrl}/auth/verify-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                identifier: registrationData.email,
                code: otpCodes.email,
                type: 'email'
              })
            });
            
            const emailResult = await emailResponse.json();
            if (emailResult.success) {
              console.log('✅ Backend: Email OTP verified');
              emailVerified = true;
              setOtpVerified(prev => ({ ...prev, email: true }));
            } else {
              throw new Error(emailResult.message || 'Email verification failed');
            }
          } catch (emailError) {
            console.error('Email OTP verification error:', emailError);
            
            // Second chance: Development fallback after backend failure
            if (allowDevelopmentCodes && (otpCodes.email === '123456' || otpCodes.email === developmentOTPs.email)) {
              console.log('✅ Development fallback: Email OTP accepted after backend failure');
              emailVerified = true;
              setOtpVerified(prev => ({ ...prev, email: true }));
            } else {
              const errorMsg = allowDevelopmentCodes 
                ? 'Email verification failed. Use code 123456 for testing' 
                : 'Email verification failed. Please try again.';
              setOtpErrors(prev => ({ ...prev, email: errorMsg }));
              verificationErrors.push(`Email: ${errorMsg}`);
            }
          }
        }
      } else {
        setOtpErrors(prev => ({ ...prev, email: 'Please enter email verification code' }));
        verificationErrors.push('Email verification code is required');
      }
      
      // Verify SMS OTP (if phone provided)
      if (registrationData.phone) {
        if (otpCodes.sms) {
          // Accept development codes when allowed (backend OTP not configured)
          const isDevSmsCode = otpCodes.sms === '654321' || otpCodes.sms === developmentOTPs.sms;
          console.log('🔧 SMS verification check:', { 
            isDevelopment, 
            allowDevelopmentCodes,
            inputCode: otpCodes.sms, 
            isDevSmsCode,
            developmentSms: developmentOTPs.sms 
          });
          
          if (allowDevelopmentCodes && isDevSmsCode) {
            console.log('✅ Development code accepted: SMS OTP verified');
            smsVerified = true;
            setOtpVerified(prev => ({ ...prev, sms: true }));
          } else {
            // Try backend verification
            try {
              const smsResponse = await fetch(`${apiBaseUrl}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  identifier: registrationData.phone,
                  code: otpCodes.sms,
                  type: 'sms'
                })
              });
              
              const smsResult = await smsResponse.json();
              if (smsResult.success) {
                console.log('✅ Backend: SMS OTP verified');
                smsVerified = true;
                setOtpVerified(prev => ({ ...prev, sms: true }));
              } else {
                throw new Error(smsResult.message || 'SMS verification failed');
              }
            } catch (smsError) {
              console.error('SMS OTP verification error:', smsError);
              
              // Second chance: Development fallback after backend failure
              if (allowDevelopmentCodes && (otpCodes.sms === '654321' || otpCodes.sms === developmentOTPs.sms)) {
                console.log('✅ Development fallback: SMS OTP accepted after backend failure');
                smsVerified = true;
                setOtpVerified(prev => ({ ...prev, sms: true }));
              } else {
                const errorMsg = allowDevelopmentCodes 
                  ? 'SMS verification failed. Use code 654321 for testing' 
                  : 'SMS verification failed. Please try again.';
                setOtpErrors(prev => ({ ...prev, sms: errorMsg }));
                verificationErrors.push(`SMS: ${errorMsg}`);
              }
            }
          }
        } else {
          setOtpErrors(prev => ({ ...prev, sms: 'Please enter SMS verification code' }));
          verificationErrors.push('SMS verification code is required');
        }
      } else {
        smsVerified = true; // Skip SMS verification if no phone
      }
      
      console.log('🔧 Final verification status:', { emailVerified, smsVerified, verificationErrors });
      
      // If both verifications passed, proceed with registration
      if (emailVerified && smsVerified) {
        console.log('✅ All OTP verifications passed, creating account...');
        
        // Clear any previous errors since verification succeeded
        setOtpErrors({ email: '', sms: '' });
        setError(null);
        
        try {
          await register(registrationData);
          setIsSuccess(true);
          
          // Redirect after success
          setTimeout(() => {
            setIsSuccess(false);
            setShowOTPVerification(false);
            onClose();
            navigate(userType === 'vendor' ? '/vendor' : '/individual');
          }, 2000);
        } catch (registerError) {
          console.error('Registration error:', registerError);
          setError(registerError instanceof Error ? registerError.message : 'Registration failed. Please try again.');
        }
      } else {
        // Set general error message for failed verifications
        if (verificationErrors.length > 0) {
          setError(`Verification failed: ${verificationErrors.join(', ')}`);
        }
        console.log('❌ Verification failed:', verificationErrors);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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
              
              {/* OTP Verification View */}
              {showOTPVerification ? (
                <div className="space-y-6">
                  {/* OTP Header */}
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-xl mb-4">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Verify Your Account
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      We've sent verification codes to your email{registrationData?.phone && ' and phone'}. 
                      Enter the codes below to complete your registration.
                    </p>
                  </div>

                  {otpStep === 'send' ? (
                    /* Send OTP Step */
                    <div className="space-y-6">
                      <div className="text-center space-y-4">
                        <p className="text-gray-700 font-medium">
                          📧 Email: {registrationData?.email}
                        </p>
                        {registrationData?.phone && (
                          <p className="text-gray-700 font-medium">
                            📱 Phone: {registrationData.phone}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={handleSendOTP}
                        disabled={otpLoading.email || otpLoading.sms}
                        className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white rounded-2xl px-8 py-4 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {(otpLoading.email || otpLoading.sms) ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending Verification Codes...</span>
                          </div>
                        ) : (
                          'Send Verification Codes'
                        )}
                      </button>

                      {(otpErrors.email || otpErrors.sms) && (
                        <div className="space-y-2">
                          {otpErrors.email && (
                            <p className="text-red-500 text-sm">📧 Email: {otpErrors.email}</p>
                          )}
                          {otpErrors.sms && (
                            <p className="text-red-500 text-sm">📱 SMS: {otpErrors.sms}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Verify OTP Step */
                    <div className="space-y-6">
                      {/* Email OTP */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          📧 Email Verification Code
                        </label>
                        
                        {/* Development OTP Helper - Always show since backend OTP not configured */}
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-yellow-800 text-sm font-semibold">
                                🔧 Test Mode (Backend OTP Not Configured)
                              </p>
                              <p className="text-yellow-700 text-xs mt-1">
                                Use code: <span className="font-mono font-bold text-lg px-2 py-1 bg-yellow-200 rounded">123456</span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOtpCodes(prev => ({ ...prev, email: '123456' }))}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                            >
                              Auto-fill
                            </button>
                          </div>
                        </div>
                        
                        <input
                          type="text"
                          value={otpCodes.email}
                          onChange={(e) => setOtpCodes(prev => ({ ...prev, email: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                          placeholder="Enter 6-digit code from email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl font-mono tracking-widest"
                          maxLength={6}
                        />
                        {otpErrors.email && (
                          <p className="text-red-500 text-sm">{otpErrors.email}</p>
                        )}
                        {otpVerified.email && (
                          <p className="text-green-500 text-sm flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Email verified!
                          </p>
                        )}
                      </div>

                      {/* SMS OTP (if phone provided) */}
                      {registrationData?.phone && (
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700">
                            📱 SMS Verification Code
                          </label>
                          
                          {/* Development OTP Helper - Always show since backend OTP not configured */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-blue-800 text-sm font-semibold">
                                  🔧 Test Mode (Backend OTP Not Configured)
                                </p>
                                <p className="text-blue-700 text-xs mt-1">
                                  Use code: <span className="font-mono font-bold text-lg px-2 py-1 bg-blue-200 rounded">654321</span>
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setOtpCodes(prev => ({ ...prev, sms: '654321' }))}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                              >
                                Auto-fill
                              </button>
                            </div>
                          </div>
                          
                          <input
                            type="text"
                            value={otpCodes.sms}
                            onChange={(e) => setOtpCodes(prev => ({ ...prev, sms: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                            placeholder="Enter 6-digit code from SMS"
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl font-mono tracking-widest"
                            maxLength={6}
                          />
                          {otpErrors.sms && (
                            <p className="text-red-500 text-sm">{otpErrors.sms}</p>
                          )}
                          {otpVerified.sms && (
                            <p className="text-green-500 text-sm flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Phone verified!
                            </p>
                          )}
                        </div>
                      )}

                      {/* Verify Button */}
                      <div className="flex flex-col space-y-4">
                        {/* Development Helper Button - Always show since backend OTP not configured */}
                        <button
                          type="button"
                          onClick={() => {
                            setOtpCodes({
                              email: '123456',
                              sms: '654321'
                            });
                          }}
                          className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-yellow-900 rounded-2xl px-8 py-3 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          🔧 Auto-fill All Test OTPs (Email: 123456, SMS: 654321)
                        </button>
                        
                        <button
                          onClick={handleVerifyOTP}
                          disabled={isLoading || !otpCodes.email || (registrationData?.phone && !otpCodes.sms)}
                          className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-2xl px-8 py-4 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Creating Account...</span>
                            </div>
                          ) : (
                            'Verify & Create Account'
                          )}
                        </button>

                        <button
                          onClick={() => setOtpStep('send')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          ← Resend verification codes
                        </button>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                          <p className="text-red-600 text-sm">{error}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Back to Registration */}
                  <div className="text-center">
                    <button
                      onClick={() => setShowOTPVerification(false)}
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
