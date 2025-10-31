import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Building2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CoordinatorFormData {
  // Personal Information
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  
  // Business Information
  businessName: string;
  businessCategory: string;
  businessLocation: string;
  website: string;
  
  // Professional Details
  yearsExperience: string;
  teamSize: string;
  specialties: string[];
  serviceAreas: string[];
  
  // Portfolio
  portfolioUrl: string;
  instagramHandle: string;
  facebookPage: string;
}

const COORDINATOR_CATEGORIES = [
  'Full-Service Wedding Planning',
  'Day-of Coordination',
  'Partial Planning',
  'Destination Wedding Planning',
  'Elopement Planning',
  'Corporate Event Coordination',
  'Luxury Event Planning',
  'Budget-Friendly Planning'
];

const SPECIALTIES = [
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

const SERVICE_AREAS = [
  'Metro Manila',
  'Luzon',
  'Visayas',
  'Mindanao',
  'International',
  'Nationwide'
];

export const CoordinatorRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<CoordinatorFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessName: '',
    businessCategory: '',
    businessLocation: '',
    website: '',
    yearsExperience: '',
    teamSize: '',
    specialties: [],
    serviceAreas: [],
    portfolioUrl: '',
    instagramHandle: '',
    facebookPage: ''
  });

  const handleInputChange = (field: keyof CoordinatorFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleMultiSelect = (field: 'specialties' | 'serviceAreas', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    }
    
    if (step === 2) {
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.businessCategory) newErrors.businessCategory = 'Business category is required';
      if (!formData.businessLocation.trim()) newErrors.businessLocation = 'Business location is required';
    }
    
    if (step === 3) {
      if (!formData.yearsExperience) newErrors.yearsExperience = 'Years of experience is required';
      if (!formData.teamSize) newErrors.teamSize = 'Team size is required';
      if (formData.specialties.length === 0) newErrors.specialties = 'Select at least one specialty';
      if (formData.serviceAreas.length === 0) newErrors.serviceAreas = 'Select at least one service area';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          role: 'coordinator',
          phone: formData.phone,
          business_name: formData.businessName,
          business_type: formData.businessCategory,
          location: formData.businessLocation,
          website: formData.website,
          years_experience: parseInt(formData.yearsExperience),
          team_size: parseInt(formData.teamSize),
          specialties: formData.specialties,
          service_areas: formData.serviceAreas,
          portfolio_url: formData.portfolioUrl,
          instagram_handle: formData.instagramHandle,
          facebook_page: formData.facebookPage
        })
      });
      
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl mb-4 shadow-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-sm text-gray-600">Let's start with your basic details</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Juan Dela Cruz"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="juan@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+63 912 345 6789"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl mb-4 shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
              <p className="text-sm text-gray-600">Tell us about your coordination business</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  errors.businessName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Dream Day Wedding Coordination"
              />
              {errors.businessName && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.businessName}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Category *
              </label>
              <select
                value={formData.businessCategory}
                onChange={(e) => handleInputChange('businessCategory', e.target.value)}
                aria-label="Business Category"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  errors.businessCategory ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose your specialty...</option>
                {COORDINATOR_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.businessCategory && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.businessCategory}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Location *
              </label>
              <input
                type="text"
                value={formData.businessLocation}
                onChange={(e) => handleInputChange('businessLocation', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  errors.businessLocation ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Makati City, Metro Manila"
              />
              {errors.businessLocation && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.businessLocation}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="https://www.yourbusiness.com"
              />
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Details</h2>
              <p className="text-sm text-gray-600">Share your expertise and experience</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <select
                  value={formData.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                  aria-label="Years of Experience"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                    errors.yearsExperience ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select...</option>
                  <option value="1">0-1 years</option>
                  <option value="2">2-3 years</option>
                  <option value="5">4-5 years</option>
                  <option value="8">6-10 years</option>
                  <option value="15">10+ years</option>
                </select>
                {errors.yearsExperience && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.yearsExperience}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Size *
                </label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  aria-label="Team Size"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                    errors.teamSize ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select...</option>
                  <option value="1">Solo</option>
                  <option value="3">2-5 members</option>
                  <option value="8">6-10 members</option>
                  <option value="15">11-20 members</option>
                  <option value="25">20+ members</option>
                </select>
                {errors.teamSize && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.teamSize}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties * (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-xl border border-gray-200">
                {SPECIALTIES.map(specialty => (
                  <label
                    key={specialty}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-amber-50 p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(specialty)}
                      onChange={() => handleMultiSelect('specialties', specialty)}
                      className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">{specialty}</span>
                  </label>
                ))}
              </div>
              {errors.specialties && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.specialties}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Areas * (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                {SERVICE_AREAS.map(area => (
                  <label
                    key={area}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-amber-50 p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.serviceAreas.includes(area)}
                      onChange={() => handleMultiSelect('serviceAreas', area)}
                      className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
              {errors.serviceAreas && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.serviceAreas}
                </p>
              )}
            </div>
          </motion.div>
        );
        
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl mb-4 shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio & Social Media</h2>
              <p className="text-sm text-gray-600">Optional: Showcase your work and connect with clients</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio URL (Optional)
              </label>
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="https://portfolio.yourbusiness.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Handle (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                <input
                  type="text"
                  value={formData.instagramHandle}
                  onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="yourbusiness"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook Page URL (Optional)
              </label>
              <input
                type="url"
                value={formData.facebookPage}
                onChange={(e) => handleInputChange('facebookPage', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="https://facebook.com/yourbusiness"
              />
            </div>
            
            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {errors.submit}
                </p>
              </div>
            )}
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step < currentStep
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                        : step === currentStep
                        ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all ${
                        step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 px-2">
              <span>Personal</span>
              <span>Business</span>
              <span>Professional</span>
              <span>Portfolio</span>
            </div>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8"
          >
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Complete Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-amber-600 hover:text-amber-700 font-semibold"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
            >
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Registration Successful!
              </h3>
              <p className="text-base text-gray-600 mb-1">
                Welcome to Wedding Bazaar, {formData.fullName}!
              </p>
              <p className="text-sm text-gray-500">
                Redirecting you to login...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
