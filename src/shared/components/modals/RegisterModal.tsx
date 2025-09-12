import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Heart, Phone, Building, CheckCircle, AlertCircle, Sparkles, Shield, Star, Camera, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { TermsOfServiceModal } from './TermsOfServiceModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'couple' | 'vendor'>('couple');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessCategory: '',
    agreeToTerms: false,
    receiveUpdates: false
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-yellow-500';
    if (strength <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
  };

  // Real-time validation
  const validateField = (name: string, value: string) => {
    const errors: {[key: string]: string} = {};
    
    switch (name) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!/^\+?[\d\s-()]+$/.test(value) && value.length > 0) {
          errors.phone = 'Please enter a valid phone number';
        }
        break;
      case 'password':
        if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
    }
    
    setValidationErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    // Comprehensive validation
    const errors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Valid email is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms and conditions';
    
    if (userType === 'vendor') {
      if (!formData.businessName.trim()) errors.businessName = 'Business name is required';
      if (!formData.businessCategory) errors.businessCategory = 'Business category is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      // Prepare registration data
      const registrationData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: userType,
        phone: formData.phone,
        ...(userType === 'vendor' && {
          businessName: formData.businessName,
          businessCategory: formData.businessCategory
        })
      };

      // Attempt registration
      await register(registrationData);
      
      // Show success animation
      setIsSuccess(true);
      
      // Wait for animation then navigate
      setTimeout(() => {
        onClose();
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          businessName: '',
          businessCategory: '',
          agreeToTerms: false,
          receiveUpdates: false
        });
        
        // Route user to appropriate landing page based on their role
        switch (userType) {
          case 'couple':
            navigate('/individual');
            break;
          case 'vendor':
            navigate('/vendor');
            break;
          default:
            navigate('/');
        }
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Real-time validation
    if (typeof newValue === 'string') {
      validateField(name, newValue);
      
      // Calculate password strength
      if (name === 'password') {
        setPasswordStrength(calculatePasswordStrength(newValue));
      }
      
      // Check confirm password match
      if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
        const passwordToCheck = name === 'password' ? newValue : formData.password;
        const confirmPasswordToCheck = name === 'confirmPassword' ? newValue : formData.confirmPassword;
        if (confirmPasswordToCheck && passwordToCheck !== confirmPasswordToCheck) {
          setValidationErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        } else {
          setValidationErrors(prev => {
            const { confirmPassword, ...rest } = prev;
            return rest;
          });
        }
      }
    }

    // Clear specific validation errors when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const vendorCategories = [
    'Photography', 'Videography', 'Catering', 'Venue', 'Florals', 
    'Entertainment', 'Transportation', 'Planning', 'Makeup', 'Dress'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      {/* Success Overlay */}
      {isSuccess && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-3xl z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-6 relative">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto relative overflow-hidden">
                <CheckCircle className="h-12 w-12 text-white animate-bounce" />
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-spin">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Wedding Bazaar!</h3>
            <p className="text-gray-600 mb-4">
              Your account has been created successfully. Redirecting you to your {userType} dashboard...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:0ms]"></div>
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:150ms]"></div>
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:300ms]"></div>
            </div>
          </div>
        </div>
      )}

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
          Join Wedding Bazaar
        </h2>
        <p className="text-gray-600 text-lg relative z-10">Create your account and start planning your dream wedding</p>
        
        {/* Decorative line */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-rose-300/50 to-transparent"></div>
      </div>

      {/* Enhanced User Type Selection */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Account Type</h3>
          <p className="text-sm text-gray-600">Select the option that best describes you</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => setUserType('couple')}
            className={cn(
              "relative p-8 border-2 rounded-3xl transition-all duration-500 group overflow-hidden transform hover:scale-105",
              userType === 'couple' 
                ? "border-rose-500 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 text-rose-700 shadow-2xl shadow-rose-500/30 scale-105" 
                : "border-gray-200 hover:border-rose-300 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-rose-500/10"
            )}
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full opacity-15 group-hover:opacity-30 transition-opacity duration-300"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="relative mb-4">
                <div className={cn(
                  "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300",
                  userType === 'couple' 
                    ? "bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg" 
                    : "bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-rose-400 group-hover:to-pink-400"
                )}>
                  <Heart className="h-8 w-8 text-white" />
                </div>
                {userType === 'couple' && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                    <Star className="h-3 w-3 text-yellow-800" />
                  </div>
                )}
              </div>
              <div className="font-bold text-xl mb-2">I'm a Couple</div>
              <div className="text-sm text-gray-600 mb-3">Planning my dream wedding</div>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Users className="h-4 w-4" />
                <span>Find vendors & plan together</span>
              </div>
            </div>
            
            {/* Selection indicator */}
            {userType === 'couple' && (
              <div className="absolute top-3 left-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setUserType('vendor')}
            className={cn(
              "relative p-8 border-2 rounded-3xl transition-all duration-500 group overflow-hidden transform hover:scale-105",
              userType === 'vendor' 
                ? "border-indigo-500 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 text-indigo-700 shadow-2xl shadow-indigo-500/30 scale-105" 
                : "border-gray-200 hover:border-indigo-300 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-indigo-500/10"
            )}
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-15 group-hover:opacity-30 transition-opacity duration-300"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="relative mb-4">
                <div className={cn(
                  "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300",
                  userType === 'vendor' 
                    ? "bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg" 
                    : "bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-indigo-400 group-hover:to-blue-400"
                )}>
                  <Building className="h-8 w-8 text-white" />
                </div>
                {userType === 'vendor' && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                    <Star className="h-3 w-3 text-yellow-800" />
                  </div>
                )}
              </div>
              <div className="font-bold text-xl mb-2">I'm a Vendor</div>
              <div className="text-sm text-gray-600 mb-3">Offering wedding services</div>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Camera className="h-4 w-4" />
                <span>Showcase & grow your business</span>
              </div>
            </div>
            
            {/* Selection indicator */}
            {userType === 'vendor' && (
              <div className="absolute top-3 left-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First name"
                className={cn(
                  "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 transition-colors",
                  validationErrors.firstName 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-gray-300 focus:border-rose-500"
                )}
                required
              />
              {validationErrors.firstName && (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.firstName}
                </div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last name"
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 transition-colors",
                validationErrors.lastName 
                  ? "border-red-300 focus:border-red-500" 
                  : "border-gray-300 focus:border-rose-500"
              )}
              required
            />
            {validationErrors.lastName && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {validationErrors.lastName}
              </div>
            )}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                autoComplete="email"
                className={cn(
                  "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 transition-colors",
                  validationErrors.email 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-gray-300 focus:border-rose-500"
                )}
                required
              />
              {!validationErrors.email && formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
              )}
              {validationErrors.email && (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.email}
                </div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone number"
                className={cn(
                  "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 transition-colors",
                  validationErrors.phone 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-gray-300 focus:border-rose-500"
                )}
                required
              />
              {validationErrors.phone && (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vendor-specific fields */}
        {userType === 'vendor' && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-200">
            <div className="col-span-2 flex items-center mb-2">
              <Building className="h-5 w-5 text-rose-500 mr-2" />
              <h4 className="font-medium text-gray-900">Business Information</h4>
            </div>
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Your business name"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 transition-colors",
                  validationErrors.businessName 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-gray-300 focus:border-rose-500"
                )}
                required
              />
              {validationErrors.businessName && (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.businessName}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="businessCategory" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="businessCategory"
                name="businessCategory"
                value={formData.businessCategory}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 transition-colors",
                  validationErrors.businessCategory 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-gray-300 focus:border-rose-500"
                )}
                required
              >
                <option value="">Select category</option>
                {vendorCategories.map((category) => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
              {validationErrors.businessCategory && (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.businessCategory}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Password Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create password"
                autoComplete="new-password"
                className={cn(
                  "w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 transition-colors",
                  validationErrors.password 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-gray-300 focus:border-rose-500"
                )}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {/* Enhanced Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span className="font-medium">Password Strength</span>
                  <span className={cn(
                    "font-bold px-2 py-1 rounded-full text-xs",
                    passwordStrength <= 25 && "text-red-700 bg-red-100",
                    passwordStrength > 25 && passwordStrength <= 50 && "text-yellow-700 bg-yellow-100",
                    passwordStrength > 50 && passwordStrength <= 75 && "text-blue-700 bg-blue-100",
                    passwordStrength > 75 && "text-green-700 bg-green-100"
                  )}>
                    {getPasswordStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all duration-500 transform",
                      getPasswordStrengthColor(passwordStrength),
                      passwordStrength > 0 && "animate-pulse"
                    )}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
                {/* Password Requirements */}
                <div className="space-y-1">
                  <div className="flex items-center text-xs">
                    <CheckCircle className={cn("h-3 w-3 mr-1", formData.password.length >= 8 ? "text-green-500" : "text-gray-300")} />
                    <span className={formData.password.length >= 8 ? "text-green-700" : "text-gray-500"}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <CheckCircle className={cn("h-3 w-3 mr-1", /[A-Z]/.test(formData.password) ? "text-green-500" : "text-gray-300")} />
                    <span className={/[A-Z]/.test(formData.password) ? "text-green-700" : "text-gray-500"}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <CheckCircle className={cn("h-3 w-3 mr-1", /[0-9]/.test(formData.password) ? "text-green-500" : "text-gray-300")} />
                    <span className={/[0-9]/.test(formData.password) ? "text-green-700" : "text-gray-500"}>One number</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <CheckCircle className={cn("h-3 w-3 mr-1", /[^A-Za-z0-9]/.test(formData.password) ? "text-green-500" : "text-gray-300")} />
                    <span className={/[^A-Za-z0-9]/.test(formData.password) ? "text-green-700" : "text-gray-500"}>One special character</span>
                  </div>
                </div>
              </div>
            )}
            {validationErrors.password && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {validationErrors.password}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm password"
                className={cn(
                  "w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 transition-colors",
                  validationErrors.confirmPassword 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-gray-300 focus:border-rose-500"
                )}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {!validationErrors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <CheckCircle className="absolute right-10 top-3 h-5 w-5 text-green-500" />
              )}
            </div>
            {validationErrors.confirmPassword && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {validationErrors.confirmPassword}
              </div>
            )}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-gray-400 mr-2" />
            <h4 className="font-medium text-gray-900">Terms & Preferences</h4>
          </div>
          
          <label className="flex items-start group cursor-pointer">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className={cn(
                "h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500 mt-1",
                validationErrors.agreeToTerms && "border-red-500"
              )}
              required
            />
            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
                className="text-rose-600 hover:text-rose-700 font-medium underline hover:no-underline transition-all duration-200"
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPrivacyModal(true);
                }}
                className="text-rose-600 hover:text-rose-700 font-medium underline hover:no-underline transition-all duration-200"
              >
                Privacy Policy
              </button>
              <span className="text-red-500 ml-1">*</span>
            </span>
          </label>
          {validationErrors.agreeToTerms && (
            <div className="flex items-center text-red-600 text-sm ml-7">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.agreeToTerms}
            </div>
          )}
          
          <label className="flex items-start group cursor-pointer">
            <input
              type="checkbox"
              name="receiveUpdates"
              checked={formData.receiveUpdates}
              onChange={handleInputChange}
              className="h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500 mt-1"
            />
            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              I'd like to receive updates about new features, wedding tips, and special offers
              <span className="text-gray-500 block text-xs mt-1">You can unsubscribe at any time</span>
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.agreeToTerms}
          className={cn(
            "w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-xl text-lg relative overflow-hidden group transition-all duration-300",
            "hover:from-rose-700 hover:to-pink-700 hover:shadow-xl hover:shadow-rose-500/25",
            "focus:ring-2 focus:ring-rose-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
            !formData.agreeToTerms && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
          <div className="relative z-10 flex items-center justify-center">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Creating Your Account...</span>
              </>
            ) : (
              <>
                <Heart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                <span>Join Wedding Bazaar</span>
              </>
            )}
          </div>
          {!isLoading && (
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 skew-x-12"></div>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-rose-600 hover:text-rose-700 font-medium transition-colors duration-200 hover:underline"
          >
            Sign in here
          </button>
        </p>
      </div>

      {/* Policy Modals */}
      <TermsOfServiceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </Modal>
  );
};
