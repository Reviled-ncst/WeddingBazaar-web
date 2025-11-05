import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Mail, Lock, User, Heart, Phone, Building, CheckCircle, 
  MapPin, Zap, Tag, PartyPopper, AlertCircle, Sparkles, Crown, Globe
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
  onEmailVerificationModeChange?: (isInVerificationMode: boolean) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ 
  isOpen, 
  onClose, 
  onSwitchToLogin,
  onEmailVerificationModeChange
}) => {
  // Core state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'couple' | 'vendor' | 'coordinator'>('couple');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Email verification state (Firebase)
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  
  // Persistent email verification state using localStorage
  const [verificationEmail, setVerificationEmail] = useState<string>('');

  // Check for persistent verification state on mount
  useEffect(() => {
    const savedVerificationState = localStorage.getItem('emailVerificationPending');
    if (savedVerificationState) {
      const { email, timestamp } = JSON.parse(savedVerificationState);
      // Only restore if less than 10 minutes old
      if (Date.now() - timestamp < 10 * 60 * 1000) {
        setVerificationEmail(email);
        setShowEmailVerification(true);
        setVerificationSent(true);
        console.log('🔄 Restored email verification state from localStorage');
      } else {
        localStorage.removeItem('emailVerificationPending');
      }
    }
  }, []);
  
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
    vendor_type: 'business', // 'business' or 'freelancer' (coordinators are always 'business')
    location: '',
    
    // Coordinator-specific fields
    years_experience: '',
    team_size: '',
    specialties: [] as string[],
    service_areas: [] as string[],
    
    // Preferences
    agreeToTerms: false,
    receiveUpdates: false,
  });

  const { register, registerWithGoogle } = useAuth();
  const navigate = useNavigate();

  // State for fetched categories
  const [vendorCategories, setVendorCategories] = useState([
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
  ]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Coordinator-specific categories
  const coordinatorCategories = [
    { value: 'Full-Service Wedding Planner', label: 'Full-Service Wedding Planner' },
    { value: 'Day-of Coordinator', label: 'Day-of Coordinator' },
    { value: 'Partial Planning Coordinator', label: 'Partial Planning Coordinator' },
    { value: 'Destination Wedding Coordinator', label: 'Destination Wedding Coordinator' },
    { value: 'Luxury Wedding Planner', label: 'Luxury Wedding Planner' },
    { value: 'Budget Wedding Coordinator', label: 'Budget Wedding Coordinator' },
    { value: 'Corporate Event Coordinator', label: 'Corporate Event Coordinator' },
    { value: 'Venue Coordinator', label: 'Venue Coordinator' },
    { value: 'Event Design & Planning', label: 'Event Design & Planning' },
    { value: 'Wedding Consultant', label: 'Wedding Consultant' },
    { value: 'Multi-Cultural Wedding Specialist', label: 'Multi-Cultural Wedding Specialist' },
    { value: 'Other', label: 'Other Coordination Services' }
  ];

  // Coordinator specialties
  const coordinatorSpecialties = [
    'Cultural Weddings',
    'Destination Weddings',
    'Garden Weddings',
    'Beach Weddings',
    'Church Weddings',
    'Intimate Weddings',
    'Grand Celebrations',
    'Theme Weddings',
    'Eco-Friendly Events',
    'Luxury Events'
  ];

  // Service areas
  const serviceAreas = [
    'Metro Manila',
    'Luzon',
    'Visayas',
    'Mindanao',
    'International',
    'Nationwide'
  ];

  // Reset form when modal opens (but preserve email verification state if it exists)
  useEffect(() => {
    if (isOpen) {
      // Only reset if we're not in email verification mode
      if (!showEmailVerification) {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          business_name: '',
          business_type: '',
          vendor_type: 'business',
          location: '',
          years_experience: '',
          team_size: '',
          specialties: [],
          service_areas: [],
          agreeToTerms: false,
          receiveUpdates: false,
        });
        setValidationErrors({});
        setError(null);
        setIsSuccess(false);
        setUserType('couple');
        setCheckingVerification(false);
        setFadeIn(false);
      }
    }
  }, [isOpen, showEmailVerification]);

  // Fetch vendor categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      // Only fetch if modal is open and user selected vendor or coordinator
      if (!isOpen || (userType !== 'vendor' && userType !== 'coordinator')) {
        return;
      }

      setLoadingCategories(true);
      
      try {
        const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
        const response = await fetch(`${apiBaseUrl}/api/vendors/categories`);
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success && Array.isArray(result.categories)) {
            // Transform API categories to dropdown format
            const formattedCategories = result.categories.map((cat: any) => ({
              value: cat.name,
              label: cat.name
            }));
            
            setVendorCategories(formattedCategories);
            console.log('✅ Fetched vendor categories from API:', formattedCategories.length);
          }
        } else {
          console.warn('⚠️ Failed to fetch categories, using defaults');
        }
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        // Keep default categories on error
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isOpen, userType]);
  
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
    
    if (userType === 'vendor' || userType === 'coordinator') {
      if (!formData.business_name.trim()) errors.business_name = 'Business name is required';
      if (!formData.business_type) errors.business_type = 'Business category is required';
      if (!formData.location.trim()) errors.location = 'Business location is required';
    }
    
    // Coordinator-specific required fields
    if (userType === 'coordinator') {
      if (!formData.years_experience) errors.years_experience = 'Years of experience is required';
      if (!formData.team_size) errors.team_size = 'Team size is required';
      if (formData.specialties.length === 0) errors.specialties = 'At least one specialty is required';
      if (formData.service_areas.length === 0) errors.service_areas = 'At least one service area is required';
    }
    
    if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms';
    
    return errors;
  };

  // Helper function to update form data and clear errors
  const updateFormData = (field: string, value: string | boolean | string[]) => {
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

  // Helper function to toggle multi-select items
  const toggleMultiSelect = (field: 'specialties' | 'service_areas', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle form submission - handles both Firebase and backend registration
  const handleSubmit = async (e?: React.FormEvent) => {
    // Prevent default form submission if called from form onSubmit
    if (e) {
      e.preventDefault();
    }
    
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 RegisterModal: Starting registration process...');
      console.log('📧 RegisterModal: User email:', formData.email);
      console.log('👤 RegisterModal: User type:', userType);
      console.log('📱 RegisterModal: Form data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        userType: userType,
        ...(userType === 'vendor' && {
          business_name: formData.business_name,
          business_type: formData.business_type,
        })
      });
      
      // Register (will use Firebase if configured, otherwise backend)
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: userType,
        ...((userType === 'vendor' || userType === 'coordinator') && {
          business_name: formData.business_name,
          business_type: formData.business_type,
          location: formData.location,
          // 🎯 FIX: Include vendor_type (coordinators are always 'business')
          vendor_type: userType === 'coordinator' ? 'business' : formData.vendor_type,
        }),
        // 🎯 FIX: Include coordinator-specific fields
        ...(userType === 'coordinator' && {
          years_experience: formData.years_experience,
          team_size: formData.team_size,
          specialties: formData.specialties,
          service_areas: formData.service_areas,
        }),
        receiveUpdates: formData.receiveUpdates,
      });

      console.log('✅ RegisterModal: Registration call completed successfully - user logged in with restrictions');
      
      // Show success state briefly, then close modal (user is now logged in)
      setIsSuccess(true);
      setShowEmailVerification(false);
      setVerificationSent(false);
      
      // Notify parent component that we're no longer in email verification mode
      onEmailVerificationModeChange?.(false);
      
      // Clean up any pending verification state
      localStorage.removeItem('emailVerificationPending');
      
      console.log('✅ Registration successful - user logged in with limited access until email verification');
      console.log('🎯 User can now explore dashboard but will see verification prompts for restricted features');
      
      // Auto-close modal after showing success briefly
      setTimeout(() => {
        onClose();
      }, 2000);
      
      // Add debugging to check modal state
      console.log('🔍 Modal state after registration:', {
        isOpen,
        showEmailVerification: true,
        verificationSent: true,
        isSuccess: false,
        error
      });
      
    } catch (error: unknown) {
      const err = error as Error;
      console.error('❌ RegisterModal: Registration failed with error:', error);
      console.error('❌ RegisterModal: Error message:', err.message);
      console.error('❌ RegisterModal: Error stack:', err.stack);
      console.error('❌ RegisterModal: Full error object:', JSON.stringify(error, null, 2));
      
      // Parse Firebase error codes for better user feedback
      let errorMessage = err.message || 'Registration failed. Please try again.';
      
      // 🚨 ORPHANED ACCOUNT DETECTION: Check if this was an orphaned account cleanup
      if (errorMessage.includes('Account setup incomplete') || errorMessage.includes('orphaned')) {
        errorMessage = `⚠️ Registration Incomplete\n\n` +
          `Your Firebase account was created, but the backend registration failed. ` +
          `The system has cleaned up the incomplete account.\n\n` +
          `Please try again with a NEW email address, or contact support if this issue persists.`;
      } else if (errorMessage.includes('email-already-in-use') || errorMessage.includes('EMAIL_EXISTS')) {
        errorMessage = '⚠️ This email is already registered. Please login instead or use a different email address.';
      } else if (errorMessage.includes('weak-password')) {
        errorMessage = '⚠️ Password is too weak. Please use at least 6 characters.';
      } else if (errorMessage.includes('invalid-email')) {
        errorMessage = '⚠️ Invalid email address. Please check and try again.';
      } else if (errorMessage.includes('network')) {
        errorMessage = '⚠️ Network error. Please check your internet connection and try again.';
      } else if (errorMessage.includes('Firebase')) {
        errorMessage = '⚠️ Registration service unavailable. Please try again later or use email registration.';
      } else if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        // Backend validation error
        errorMessage = `⚠️ Registration Failed\n\n` +
          `The backend could not process your registration. This may be due to:\n` +
          `• Missing required fields\n` +
          `• Invalid data format\n` +
          `• Email already exists in database\n\n` +
          `Please try again with a different email address.`;
      }
      
      console.error('❌ RegisterModal: Setting error message:', errorMessage);
      
      setError(errorMessage);
      
      // Scroll to top to show error message
      setTimeout(() => {
        const modalContent = document.querySelector('[role="dialog"]');
        if (modalContent) {
          modalContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase email verification status checking
  // Note: We don't auto-check verification status since user is signed out after registration
  // User must manually verify email then login normally

  const handleResendVerification = async () => {
    try {
      setCheckingVerification(true);
      
      // Since user is signed out after registration, we need to show a helpful message
      setError('To resend verification email, please try registering again or contact support if you continue to have issues.');
      
    } catch (error: unknown) {
      const err = error as Error;
      setError(err.message || 'Failed to resend verification email');
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
      // 🎯 FIX: Pass coordinator-specific fields to registerWithGoogle
      const additionalData = (userType === 'vendor' || userType === 'coordinator') ? {
        businessName: formData.business_name,
        businessType: formData.business_type,
        location: formData.location,
        // Coordinator-specific fields
        ...(userType === 'coordinator' && {
          yearsExperience: formData.years_experience ? parseInt(formData.years_experience) : undefined,
          teamSize: formData.team_size ? parseInt(formData.team_size) : undefined,
          specialties: formData.specialties,
          serviceAreas: formData.service_areas,
        })
      } : undefined;

      // 🎯 DEBUG: Log coordinator data before sending
      if (userType === 'coordinator') {
        console.log('🎉 [RegisterModal] Sending coordinator data to registerWithGoogle:', {
          userType,
          additionalData,
          formData: {
            business_name: formData.business_name,
            business_type: formData.business_type,
            location: formData.location,
            years_experience: formData.years_experience,
            team_size: formData.team_size,
            specialties: formData.specialties,
            service_areas: formData.service_areas,
          }
        });
      }

      await registerWithGoogle(userType, additionalData);
      setIsSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        onClose();
        if (userType === 'couple') {
          navigate('/individual');
        } else if (userType === 'coordinator') {
          navigate('/coordinator');
        } else {
          navigate('/vendor');
        }
      }, 2000);
      
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Google registration error:', error);
      if (err.message.includes('Firebase')) {
        setError('Google sign-in is not available. Please use email registration or check your internet connection.');
      } else {
        setError(err.message || 'Google registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Debug effect to track email verification state
  useEffect(() => {
    if (showEmailVerification) {
      console.log('🎯 Email verification screen should be showing!', {
        showEmailVerification,
        verificationSent,
        isSuccess,
        isOpen,
        error
      });
    }
  }, [showEmailVerification, verificationSent, isSuccess, isOpen, error]);

  // Additional debug effect to track rendering
  useEffect(() => {
    if (showEmailVerification && isOpen) {
      console.log('🚀 MODAL IS OPEN AND SHOULD SHOW EMAIL VERIFICATION SCREEN');
    }
  }, [showEmailVerification, isOpen]);

  // Monitor page reload/navigation attempts
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log('⚠️ BEFOREUNLOAD detected - something is trying to reload the page');
      console.log('📊 Modal state:', { isOpen, showEmailVerification, verificationSent });
      if (showEmailVerification) {
        console.log('🛑 Preventing page reload during email verification');
        e.preventDefault();
        e.returnValue = 'You are in the middle of email verification. Are you sure you want to leave?';
        return 'You are in the middle of email verification. Are you sure you want to leave?';
      }
    };

    const handleUnload = () => {
      console.log('⚠️ UNLOAD detected - page is actually reloading');
      console.log('📊 Modal state:', { isOpen, showEmailVerification, verificationSent });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [isOpen, showEmailVerification, verificationSent]);

  // Track modal lifecycle and rendering
  useEffect(() => {
    console.log('🔄 RegisterModal useEffect - Modal state changed:', {
      isOpen,
      showEmailVerification,
      verificationSent,
      isSuccess,
      verificationEmail,
      formData: { email: formData.email }
    });
    
    // If we have a verification email and modal is open, ensure verification screen shows
    if (isOpen && verificationEmail && !showEmailVerification) {
      console.log('🔧 Restoring email verification screen for:', verificationEmail);
      setShowEmailVerification(true);
      setVerificationSent(true);
      onEmailVerificationModeChange?.(true);
    }
  }, [isOpen, showEmailVerification, verificationSent, isSuccess, verificationEmail, formData.email, onEmailVerificationModeChange]);

  // Custom close handler that resets email verification state
  const handleModalClose = () => {
    console.log('🚪 RegisterModal handleModalClose called');
    console.log('📊 Current state:', { showEmailVerification, verificationSent, verificationEmail });
    console.trace('📍 Modal close call stack');
    
    // Reset email verification state when modal is closed
    setShowEmailVerification(false);
    setVerificationSent(false);
    setVerificationEmail('');
    
    // Notify parent component that we're no longer in email verification mode
    onEmailVerificationModeChange?.(false);
    
    // Clear localStorage
    localStorage.removeItem('emailVerificationPending');
    console.log('🧹 Cleared email verification state');
    
    // Call the original onClose
    onClose();
  };

  // FORCE THE MODAL TO STAY OPEN DURING EMAIL VERIFICATION
  const debugModalClose = () => {
    console.log('🚨 MODAL CLOSE ATTEMPT');
    
    // ABSOLUTELY DO NOT CLOSE IF WE'RE IN EMAIL VERIFICATION MODE
    if (showEmailVerification || verificationSent) {
      console.log('� BLOCKING MODAL CLOSE - EMAIL VERIFICATION IN PROGRESS');
      return; // HARD STOP - DO NOT CLOSE
    }
    
    // Only allow close if we're not in verification mode
    handleModalClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={debugModalClose} maxWidth="xl" preventBackdropClose={!!error || Object.keys(validationErrors).length > 0 || showEmailVerification}>
        <div className={cn("relative overflow-hidden px-6 py-6", fadeIn && "animate-in fade-in duration-500")}>
          
          {/* Minimalist Elegant Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Subtle gradient mesh */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-rose-100/40 to-pink-100/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-100/30 to-pink-100/40 rounded-full blur-3xl"></div>
            
            {/* Clean overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/30"></div>
          </div>

          {/* Success Overlay with enhanced animations */}
          {isSuccess && !showEmailVerification && (
            <div className="fixed inset-0 bg-gradient-to-br from-white/98 via-green-50/95 to-emerald-50/98 backdrop-blur-xl z-[9999] flex items-center justify-center animate-in fade-in duration-700">
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
                  
                  <div className="space-y-4">
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-2xl font-semibold text-sm shadow-xl animate-pulse">
                      <Zap className="h-5 w-5 mr-2 animate-spin" />
                      Taking you to your dashboard...
                    </div>
                    
                    <button 
                      onClick={() => {
                        const dashboardPath = userType === 'vendor' ? '/vendor' : '/individual';
                        navigate(dashboardPath);
                        onClose();
                      }}
                      className="block mx-auto px-8 py-3 bg-white text-green-600 border-2 border-green-500 rounded-2xl font-semibold text-sm hover:bg-green-50 transition-colors shadow-lg"
                    >
                      Continue to Dashboard →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Minimalist Registration Form */}
          <div className="relative">
            {/* Clean glass card */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100/50 shadow-lg"></div>
            
            {/* Sleek Header */}
            <div className="relative text-center mb-10 pt-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl mb-5 transition-transform hover:scale-105">
                <PartyPopper className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">
                Create Account
              </h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Join Wedding Bazaar and start your journey
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
                      We've sent a verification link to <strong>{verificationEmail || formData.email}</strong>
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
                        <li>1. Check your email inbox for verification link</li>
                        <li>2. Click the verification link in your email</li>
                        <li>3. Return to homepage and login with your credentials</li>
                      </ol>
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                          <strong>Important:</strong> You must verify your email before you can login. After verification, use the Login button to access your dashboard.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          // Clear verification state and then switch
                          setShowEmailVerification(false);
                          setVerificationSent(false);
                          setVerificationEmail('');
                          onEmailVerificationModeChange?.(false);
                          localStorage.removeItem('emailVerificationPending');
                          onSwitchToLogin();
                        }}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Continue to Login
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

                  {/* Navigation Options */}
                  <div className="flex flex-col gap-3 text-center">
                    <button
                      onClick={() => {
                        setShowEmailVerification(false);
                        setVerificationSent(false);
                        setVerificationEmail('');
                        onEmailVerificationModeChange?.(false);
                        localStorage.removeItem('emailVerificationPending');
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      ← Back to registration form
                    </button>
                    
                    <button
                      onClick={() => {
                        // Clear verification state and close modal
                        setShowEmailVerification(false);
                        setVerificationSent(false);
                        setVerificationEmail('');
                        onEmailVerificationModeChange?.(false);
                        localStorage.removeItem('emailVerificationPending');
                        handleModalClose();
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      ✕ Close and cancel verification
                    </button>
                  </div>
                </div>
              ) : (
                /* Regular Registration Form */
                <form onSubmit={handleSubmit}>
              
              {/* Minimalist User Type Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Account Type</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('couple')}
                    className={cn(
                      "group relative p-5 rounded-xl border transition-all duration-300",
                      userType === 'couple'
                        ? "border-rose-500 bg-rose-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-rose-300 hover:bg-rose-50/50"
                    )}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                        userType === 'couple' 
                          ? "bg-rose-500 text-white" 
                          : "bg-gray-100 text-gray-600 group-hover:bg-rose-100 group-hover:text-rose-600"
                      )}>
                        <Heart className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm">Couple</div>
                        <div className="text-xs text-gray-500 mt-0.5">Plan your wedding</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setUserType('vendor')}
                    className={cn(
                      "group relative p-5 rounded-xl border transition-all duration-300",
                      userType === 'vendor'
                        ? "border-purple-500 bg-purple-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50"
                    )}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                        userType === 'vendor' 
                          ? "bg-purple-500 text-white" 
                          : "bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600"
                      )}>
                        <Building className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm">Service Provider</div>
                        <div className="text-xs text-gray-500 mt-0.5">Offer services</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setUserType('coordinator')}
                    className={cn(
                      "group relative p-5 rounded-xl border transition-all duration-300",
                      userType === 'coordinator'
                        ? "border-amber-500 bg-amber-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50"
                    )}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                        userType === 'coordinator' 
                          ? "bg-amber-500 text-white" 
                          : "bg-gray-100 text-gray-600 group-hover:bg-amber-100 group-hover:text-amber-600"
                      )}>
                        <PartyPopper className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm">Coordinator</div>
                        <div className="text-xs text-gray-500 mt-0.5">Manage weddings</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Minimalist Form Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Your Details</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                </div>

                {/* Error Display - Prominent */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 flex items-start gap-3 animate-shake">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{error}</p>
                      {error.includes('already registered') && (
                        <p className="text-xs mt-1 text-red-600">
                          Try logging in instead, or use a different email address.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white",
                        validationErrors.firstName
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-rose-400 focus:ring-rose-100"
                      )}
                      placeholder="John"
                    />
                    {validationErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white",
                        validationErrors.lastName
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-rose-400 focus:ring-rose-100"
                      )}
                      placeholder="Doe"
                    />
                    {validationErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.lastName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white",
                        validationErrors.email
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-rose-400 focus:ring-rose-100"
                      )}
                      placeholder="your.email@example.com"
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
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
              {(userType === 'vendor' || userType === 'coordinator') && (
                <div className={cn(
                  "p-6 rounded-2xl border shadow-lg animate-in slide-in-from-bottom duration-500",
                  userType === 'vendor' 
                    ? "bg-gradient-to-br from-purple-50/80 to-indigo-50/60 border-purple-200/50"
                    : "bg-gradient-to-br from-amber-50/80 to-yellow-50/60 border-amber-200/50"
                )}>
                  <h3 className={cn(
                    "text-xl font-bold mb-6 flex items-center",
                    userType === 'vendor' ? "text-purple-800" : "text-amber-800"
                  )}>
                    <Building className={cn(
                      "h-6 w-6 mr-3",
                      userType === 'vendor' ? "text-purple-500" : "text-amber-500"
                    )} />
                    {userType === 'vendor' ? 'Business Information' : 'Coordination Business Information'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 flex items-center">
                        <span className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          userType === 'coordinator' ? "bg-amber-500" : "bg-purple-500"
                        )}></span>
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
                            : userType === 'coordinator'
                            ? "border-gray-200 focus:border-amber-400 focus:shadow-2xl focus:shadow-amber-500/20 focus:ring-4 focus:ring-amber-100"
                            : "border-gray-200 focus:border-purple-400 focus:shadow-2xl focus:shadow-purple-500/20 focus:ring-4 focus:ring-purple-100"
                        )}
                        placeholder={userType === 'coordinator' ? "Dream Day Wedding Coordinators" : "Your Amazing Business Name"}
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
                        <Tag className={cn(
                          "w-4 h-4 mr-2",
                          userType === 'coordinator' ? "text-amber-500" : "text-purple-500"
                        )} />
                        Business Category *
                      </label>
                      <select
                        value={formData.business_type}
                        onChange={(e) => updateFormData('business_type', e.target.value)}
                        title="Select your business category"
                        disabled={loadingCategories}
                        className={cn(
                          "w-full px-4 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-lg cursor-pointer",
                          "bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl",
                          loadingCategories && "opacity-50 cursor-wait",
                          validationErrors.business_type
                            ? "border-red-400 focus:border-red-500 bg-red-50/80 focus:ring-4 focus:ring-red-100"
                            : userType === 'coordinator'
                            ? "border-gray-200 focus:border-amber-400 focus:shadow-2xl focus:shadow-amber-500/20 focus:ring-4 focus:ring-amber-100"
                            : "border-gray-200 focus:border-purple-400 focus:shadow-2xl focus:shadow-purple-500/20 focus:ring-4 focus:ring-purple-100"
                        )}
                      >
                        <option value="">
                          {loadingCategories ? 'Loading categories...' : 'Choose your specialty...'}
                        </option>
                        {(userType === 'coordinator' ? coordinatorCategories : vendorCategories).map((category) => (
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
                        <MapPin className={cn(
                          "w-4 h-4 mr-2",
                          userType === 'coordinator' ? "text-amber-500" : "text-purple-500"
                        )} />
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

                    {/* Coordinator-specific required fields */}
                    {userType === 'coordinator' && (
                      <>
                        {/* Years of Experience */}
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-gray-700 flex items-center">
                            <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
                            Years of Experience *
                          </label>
                          <select
                            value={formData.years_experience}
                            onChange={(e) => updateFormData('years_experience', e.target.value)}
                            title="Select years of experience"
                            className={cn(
                              "w-full px-4 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-lg cursor-pointer",
                              "bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl",
                              validationErrors.years_experience
                                ? "border-red-400 focus:border-red-500 bg-red-50/80 focus:ring-4 focus:ring-red-100"
                                : "border-gray-200 focus:border-amber-400 focus:shadow-2xl focus:shadow-amber-500/20 focus:ring-4 focus:ring-amber-100"
                            )}
                          >
                            <option value="">Select experience...</option>
                            <option value="0-1">Less than 1 year</option>
                            <option value="1-3">1-3 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value="5-10">5-10 years</option>
                            <option value="10+">10+ years</option>
                          </select>
                          {validationErrors.years_experience && (
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                              {validationErrors.years_experience}
                            </p>
                          )}
                        </div>

                        {/* Team Size */}
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-gray-700 flex items-center">
                            <User className="w-4 h-4 mr-2 text-amber-500" />
                            Team Size *
                          </label>
                          <select
                            value={formData.team_size}
                            onChange={(e) => updateFormData('team_size', e.target.value)}
                            title="Select team size"
                            className={cn(
                              "w-full px-4 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-lg cursor-pointer",
                              "bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl",
                              validationErrors.team_size
                                ? "border-red-400 focus:border-red-500 bg-red-50/80 focus:ring-4 focus:ring-red-100"
                                : "border-gray-200 focus:border-amber-400 focus:shadow-2xl focus:shadow-amber-500/20 focus:ring-4 focus:ring-amber-100"
                            )}
                          >
                            <option value="">Select team size...</option>
                            <option value="Solo">Solo (1 person)</option>
                            <option value="2-5">Small Team (2-5 people)</option>
                            <option value="6-10">Medium Team (6-10 people)</option>
                            <option value="11-20">Large Team (11-20 people)</option>
                            <option value="20+">Enterprise (20+ people)</option>
                          </select>
                          {validationErrors.team_size && (
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                              {validationErrors.team_size}
                            </p>
                          )}
                        </div>

                        {/* Specialties - Multi-select */}
                        <div className="space-y-3 md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 flex items-center">
                            <Crown className="w-4 h-4 mr-2 text-amber-500" />
                            Wedding Specialties * (Select at least one)
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-white/90 rounded-xl border-2 border-gray-200">
                            {coordinatorSpecialties.map((specialty) => (
                              <label
                                key={specialty}
                                className={cn(
                                  "flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all",
                                  formData.specialties.includes(specialty)
                                    ? "bg-amber-100 border-2 border-amber-500"
                                    : "bg-gray-50 border-2 border-gray-200 hover:bg-amber-50 hover:border-amber-300"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.specialties.includes(specialty)}
                                  onChange={() => toggleMultiSelect('specialties', specialty)}
                                  className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                />
                                <span className="text-sm font-medium text-gray-700">{specialty}</span>
                              </label>
                            ))}
                          </div>
                          {validationErrors.specialties && (
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                              {validationErrors.specialties}
                            </p>
                          )}
                        </div>

                        {/* Service Areas - Multi-select */}
                        <div className="space-y-3 md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 flex items-center">
                            <Globe className="w-4 h-4 mr-2 text-amber-500" />
                            Service Areas * (Select at least one)
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-white/90 rounded-xl border-2 border-gray-200">
                            {serviceAreas.map((area) => (
                              <label
                                key={area}
                                className={cn(
                                  "flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all",
                                  formData.service_areas.includes(area)
                                    ? "bg-amber-100 border-2 border-amber-500"
                                    : "bg-gray-50 border-2 border-gray-200 hover:bg-amber-50 hover:border-amber-300"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.service_areas.includes(area)}
                                  onChange={() => toggleMultiSelect('service_areas', area)}
                                  className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                />
                                <span className="text-sm font-medium text-gray-700">{area}</span>
                              </label>
                            ))}
                          </div>
                          {validationErrors.service_areas && (
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                              {validationErrors.service_areas}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Terms & Conditions and Submit Section */}
              <div className="space-y-6">
                {/* Terms checkbox */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                    className="mt-1 h-5 w-5 text-rose-600 border-2 border-gray-300 rounded focus:ring-rose-500"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-rose-600 hover:text-rose-700 font-semibold underline"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-rose-600 hover:text-rose-700 font-semibold underline"
                    >
                      Privacy Policy
                    </button>
                    {validationErrors.agreeToTerms && (
                      <span className="block text-red-500 text-xs mt-1">
                        {validationErrors.agreeToTerms}
                      </span>
                    )}
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={cn(
                    "w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300",
                    "bg-gradient-to-r from-rose-500 to-pink-600 text-white",
                    "hover:from-rose-600 hover:to-pink-700 hover:shadow-lg",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus:outline-none focus:ring-4 focus:ring-rose-100"
                  )}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Google registration button */}
                <button
                  type="button"
                  onClick={handleGoogleRegistration}
                  disabled={isLoading}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Already have account */}
                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    Sign in here
                  </button>
                </div>
              </div>
              </form>
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
