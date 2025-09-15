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

  // Handle form submission
  const handleSubmit = async () => {
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const registrationData = {
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
      
      await register(registrationData);
      setIsSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        navigate(userType === 'vendor' ? '/vendor' : '/individual');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
        <div className={cn("relative overflow-hidden px-6 py-6", fadeIn && "animate-in fade-in duration-500")}>
          
          {/* Minimal Background decoration */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-8 right-8 w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full blur-xl"></div>
            <div className="absolute bottom-8 left-8 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-lg"></div>
          </div>

          {/* Success Overlay */}
          {isSuccess && (
            <div className="absolute inset-0 bg-white/98 backdrop-blur-xl rounded-2xl z-50 flex items-center justify-center">
              <div className="text-center relative z-10">
                <div className="mb-4 relative">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Welcome to Wedding Bazaar!
                  </h3>
                  <p className="text-gray-600 text-sm max-w-sm mx-auto">
                    Your {userType} account has been created successfully!
                  </p>
                  
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium text-sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Redirecting...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Single Page Registration Form */}
          <div className="relative">
            {/* Background Glass Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/40 via-pink-50/30 to-purple-50/40 rounded-lg backdrop-blur-sm border border-white/30 -m-2"></div>
            
            {/* Header */}
            <div className="relative text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Wedding Bazaar</h2>
              <p className="text-gray-600 text-sm">Create your account and start planning your perfect wedding</p>
            </div>

            {/* Main Form Content */}
            <div className="relative max-w-4xl mx-auto space-y-6">
              
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">I am a:</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUserType('couple')}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-300 text-left",
                      userType === 'couple'
                        ? "border-rose-500 bg-rose-50/80 text-rose-700"
                        : "border-gray-200 bg-white/60 hover:border-rose-300"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        userType === 'couple' ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-500"
                      )}>
                        <Heart className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">Planning My Wedding</div>
                        <div className="text-xs text-gray-500">Find vendors & plan</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setUserType('vendor')}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-300 text-left",
                      userType === 'vendor'
                        ? "border-purple-500 bg-purple-50/80 text-purple-700"
                        : "border-gray-200 bg-white/60 hover:border-purple-300"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        userType === 'vendor' ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-500"
                      )}>
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">Wedding Vendor</div>
                        <div className="text-xs text-gray-500">Offer services</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <User className="inline w-4 h-4 mr-2" />
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300",
                      "bg-white/80 backdrop-blur-sm shadow-lg",
                      validationErrors.firstName
                        ? "border-red-500 focus:border-red-600 bg-red-50/80"
                        : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                    )}
                    placeholder="Enter your first name"
                  />
                  {validationErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <User className="inline w-4 h-4 mr-2" />
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300",
                      "bg-white/80 backdrop-blur-sm shadow-lg",
                      validationErrors.lastName
                        ? "border-red-500 focus:border-red-600 bg-red-50/80"
                        : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                    )}
                    placeholder="Enter your last name"
                  />
                  {validationErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300",
                      "bg-white/80 backdrop-blur-sm shadow-lg",
                      validationErrors.email
                        ? "border-red-500 focus:border-red-600 bg-red-50/80"
                        : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                    )}
                    placeholder="your.email@example.com"
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Phone className="inline w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Lock className="inline w-4 h-4 mr-2" />
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className={cn(
                        "w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none transition-all duration-300",
                        "bg-white/80 backdrop-blur-sm shadow-lg",
                        validationErrors.password
                          ? "border-red-500 focus:border-red-600 bg-red-50/80"
                          : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                      )}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Lock className="inline w-4 h-4 mr-2" />
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={cn(
                        "w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none transition-all duration-300",
                        "bg-white/80 backdrop-blur-sm shadow-lg",
                        validationErrors.confirmPassword
                          ? "border-red-500 focus:border-red-600 bg-red-50/80"
                          : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                      )}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Vendor-specific fields */}
              {userType === 'vendor' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <Building className="inline w-4 h-4 mr-2" />
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                      className={cn(
                        "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300",
                        "bg-white/80 backdrop-blur-sm shadow-lg",
                        validationErrors.business_name
                          ? "border-red-500 focus:border-red-600 bg-red-50/80"
                          : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                      )}
                      placeholder="Your Business Name"
                    />
                    {validationErrors.business_name && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.business_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <Tag className="inline w-4 h-4 mr-2" />
                      Business Category *
                    </label>
                    <select
                      value={formData.business_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, business_type: e.target.value }))}
                      title="Select business category"
                      className={cn(
                        "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300",
                        "bg-white/80 backdrop-blur-sm shadow-lg",
                        validationErrors.business_type
                          ? "border-red-500 focus:border-red-600 bg-red-50/80"
                          : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                      )}
                    >
                      <option value="">Select category</option>
                      {vendorCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {validationErrors.business_type && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.business_type}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <MapPin className="inline w-4 h-4 mr-2" />
                      Business Location *
                    </label>
                    <div className="relative">
                      <LocationSearch
                        value={formData.location}                      onChange={(location: string) => {
                        setFormData(prev => ({ ...prev, location }));
                        if (validationErrors.location) {
                          setValidationErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.location;
                            return newErrors;
                          });
                        }
                      }}
                        placeholder="Search for your business location..."
                        className={cn(
                          "w-full",
                          validationErrors.location
                            ? "border-red-500 focus:border-red-600"
                            : "border-gray-200 focus:border-rose-500"
                        )}
                        error={validationErrors.location}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLocationMap(true)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-600 transition-colors z-10"
                        title="Open location map"
                      >
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>
                    {validationErrors.location && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.location}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                    className="mt-1 h-4 w-4 text-rose-600 border-2 border-gray-300 rounded focus:ring-rose-500"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-rose-600 hover:text-rose-700 font-medium underline"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-rose-600 hover:text-rose-700 font-medium underline"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="receiveUpdates"
                    checked={formData.receiveUpdates}
                    onChange={(e) => setFormData(prev => ({ ...prev, receiveUpdates: e.target.checked }))}
                    className="mt-1 h-4 w-4 text-rose-600 border-2 border-gray-300 rounded focus:ring-rose-500"
                  />
                  <label htmlFor="receiveUpdates" className="text-sm text-gray-700">
                    I'd like to receive updates about new features and wedding tips
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !formData.agreeToTerms}
                  className={cn(
                    "w-full max-w-md flex items-center justify-center px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg",
                    "hover:from-rose-700 hover:to-pink-700 hover:shadow-xl hover:scale-105",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:scale-100"
                  )}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <PartyPopper className="h-5 w-5 mr-3" />
                      Create My Account
                    </>
                  )}
                </button>

                <p className="text-gray-500 text-sm text-center">
                  Already have an account?{' '}
                  <button
                    onClick={onSwitchToLogin}
                    className="text-rose-600 hover:text-rose-700 font-medium transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm font-medium text-center">{error}</p>
                </div>
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
