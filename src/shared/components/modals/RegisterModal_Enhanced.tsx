import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Mail, Lock, User, Heart, Phone, Building, CheckCircle, AlertCircle, 
  Sparkles, Shield, Star, Camera, Users, MapPin, Loader2, Map, ArrowRight, ArrowLeft,
  Zap, Crown, Award, Globe, Instagram, Facebook, Twitter, Linkedin, Youtube,
  Car, Music, Utensils, TreePine, Palette, Mic, Flower, UserCheck, Gift, Cake,
  ChevronRight, ChevronDown, X, Clock, DollarSign, TrendingUp, Target, Calendar,
  Badge, Verified, PartyPopper, Confetti, Gem, Rainbow, Stars, ChevronLeft,
  Flower2, Coffee, Diamond, Plus, Minus, MessageSquare, Tag, FileText, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { TermsOfServiceModal } from './TermsOfServiceModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import BusinessLocationMap from '../map/BusinessLocationMap';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentLocationWithAddress } from '../../../utils/geolocation';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  
  // Location states
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Enhanced UI states
  const [isTyping, setIsTyping] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [hoveredUserType, setHoveredUserType] = useState<string | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [showCategoryGrid, setShowCategoryGrid] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
  // Animation states
  const [fadeIn, setFadeIn] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // Initialize animations
  useEffect(() => {
    if (isOpen) {
      setFadeIn(true);
    }
  }, [isOpen]);

  // Enhanced form data with all new fields
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Vendor Business Info
    business_name: '',
    business_type: '',
    business_description: '',
    years_in_business: 0,
    website_url: '',
    location: '',
    specialties: [] as string[],
    service_areas: [] as string[],
    
    // Enhanced Vendor Info
    portfolio_description: '',
    price_range: '',
    availability_calendar: '',
    team_size: 1,
    awards_achievements: '',
    instagram_handle: '',
    facebook_page: '',
    twitter_handle: '',
    youtube_channel: '',
    linkedin_profile: '',
    business_hours: '',
    consultation_fee: '',
    travel_radius: 50,
    languages_spoken: [] as string[],
    
    // Preferences
    agreeToTerms: false,
    receiveUpdates: false,
    marketing_consent: false,
    preferred_contact: 'email' as 'email' | 'phone' | 'both'
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  // Enhanced vendor categories with more details
  const vendorCategories = [
    { 
      value: 'Photography', 
      label: 'Photography', 
      icon: Camera, 
      color: 'from-purple-500 to-pink-500',
      description: 'Capture beautiful moments',
      specialties: ['Wedding Photography', 'Portrait Sessions', 'Drone Photography', 'Same-Day Edits']
    },
    { 
      value: 'Videography', 
      label: 'Videography', 
      icon: Camera, 
      color: 'from-blue-500 to-purple-500',
      description: 'Create cinematic memories',
      specialties: ['Wedding Films', 'Highlight Reels', 'Live Streaming', 'Documentary Style']
    },
    { 
      value: 'Wedding Planning', 
      label: 'Wedding Planning', 
      icon: Calendar, 
      color: 'from-rose-500 to-pink-500',
      description: 'Plan perfect celebrations',
      specialties: ['Full Planning', 'Day-of Coordination', 'Partial Planning', 'Destination Weddings']
    },
    { 
      value: 'Catering', 
      label: 'Catering', 
      icon: Cake, 
      color: 'from-orange-500 to-red-500',
      description: 'Delicious culinary experiences',
      specialties: ['Filipino Cuisine', 'International Menu', 'Buffet Style', 'Fine Dining']
    },
    { 
      value: 'Venue', 
      label: 'Venue', 
      icon: Building, 
      color: 'from-green-500 to-teal-500',
      description: 'Beautiful event spaces',
      specialties: ['Garden Venues', 'Beach Resorts', 'Hotel Ballrooms', 'Rustic Barns']
    },
    { 
      value: 'Florist', 
      label: 'Florist', 
      icon: Flower2, 
      color: 'from-pink-500 to-rose-500',
      description: 'Stunning floral arrangements',
      specialties: ['Bridal Bouquets', 'Ceremony Decor', 'Reception Centerpieces', 'Floral Arches']
    },
    { 
      value: 'DJ/Band', 
      label: 'DJ/Band', 
      icon: Music, 
      color: 'from-indigo-500 to-purple-500',
      description: 'Musical entertainment',
      specialties: ['Wedding DJ', 'Live Band', 'Acoustic Sets', 'Sound System Rental']
    },
    { 
      value: 'Hair & Makeup', 
      label: 'Hair & Makeup', 
      icon: Sparkles, 
      color: 'from-pink-500 to-purple-500',
      description: 'Beauty and glamour',
      specialties: ['Bridal Makeup', 'Hair Styling', 'Airbrush Makeup', 'Trial Sessions']
    }
  ];

  const specialtyOptions = [
    'Outdoor Weddings', 'Indoor Ceremonies', 'Destination Weddings', 'Intimate Gatherings',
    'Grand Celebrations', 'Beach Weddings', 'Garden Parties', 'Cultural Ceremonies',
    'Modern Style', 'Traditional Style', 'Rustic Theme', 'Luxury Events',
    'Budget-Friendly', 'Same-Day Edits', 'Drone Photography', 'Portrait Sessions'
  ];

  const priceRanges = [
    { value: 'budget', label: '₱10,000 - ₱50,000', icon: Coffee, color: 'from-green-500 to-emerald-500' },
    { value: 'mid-range', label: '₱50,000 - ₱150,000', icon: Star, color: 'from-blue-500 to-indigo-500' },
    { value: 'premium', label: '₱150,000 - ₱300,000', icon: Crown, color: 'from-purple-500 to-pink-500' },
    { value: 'luxury', label: '₱300,000+', icon: Diamond, color: 'from-yellow-500 to-orange-500' }
  ];

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

  // Enhanced validation
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

  // Enhanced input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Real-time validation and animations
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);

    if (typeof newValue === 'string') {
      validateField(name, newValue);
      
      if (name === 'password') {
        setPasswordStrength(calculatePasswordStrength(newValue));
      }
      
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

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }

    if (name === 'location' && locationError) {
      setLocationError(null);
    }
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < 3) {
      setSlideDirection('right');
      setCurrentStep(prev => prev + 1);
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setSlideDirection('left');
      setCurrentStep(prev => prev - 1);
    }
  };

  // Enhanced location handling
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    try {
      const result = await getCurrentLocationWithAddress();
      
      setFormData(prev => ({
        ...prev,
        location: result.address
      }));
      
      if (validationErrors.location) {
        setValidationErrors(prev => {
          const { location, ...rest } = prev;
          return rest;
        });
      }
      
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError(error instanceof Error ? error.message : 'Unable to get your location. Please enter manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleLocationSelect = (location: { address: string; coordinates: { lat: number; lng: number } }) => {
    setFormData(prev => ({
      ...prev,
      location: location.address
    }));
    
    if (validationErrors.location) {
      setValidationErrors(prev => {
        const { location: _, ...rest } = prev;
        return rest;
      });
    }
    
    setLocationError(null);
  };

  // Specialty management
  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
    
    setFormData(prev => ({
      ...prev,
      specialties: selectedSpecialties.includes(specialty) 
        ? selectedSpecialties.filter(s => s !== specialty)
        : [...selectedSpecialties, specialty]
    }));
  };

  // Enhanced form submission
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
      if (!formData.business_name.trim()) errors.business_name = 'Business name is required';
      if (!formData.business_type) errors.business_type = 'Business category is required';
      if (!formData.location.trim()) errors.location = 'Business location is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: userType,
        phone: formData.phone,
        ...(userType === 'vendor' && {
          business_name: formData.business_name,
          business_type: formData.business_type,
          business_description: formData.business_description,
          years_in_business: formData.years_in_business,
          website_url: formData.website_url,
          location: formData.location,
          specialties: formData.specialties,
          service_areas: formData.service_areas
        })
      };

      await register(registrationData);
      
      setIsSuccess(true);
      
      setTimeout(() => {
        onClose();
        
        // Reset everything
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          business_name: '',
          business_type: '',
          business_description: '',
          years_in_business: 0,
          website_url: '',
          location: '',
          specialties: [],
          service_areas: [],
          portfolio_description: '',
          price_range: '',
          availability_calendar: '',
          team_size: 1,
          awards_achievements: '',
          instagram_handle: '',
          facebook_page: '',
          twitter_handle: '',
          youtube_channel: '',
          linkedin_profile: '',
          business_hours: '',
          consultation_fee: '',
          travel_radius: 50,
          languages_spoken: [],
          agreeToTerms: false,
          receiveUpdates: false,
          marketing_consent: false,
          preferred_contact: 'email'
        });
        
        setCurrentStep(1);
        setSelectedSpecialties([]);
        setValidationErrors({});
        setError(null);
        
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
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          [data-width="${passwordStrength}"] {
            width: ${passwordStrength}%;
          }
          
          .floating-hearts {
            animation: floatHearts 6s ease-in-out infinite;
          }
          
          @keyframes floatHearts {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(1deg); }
            50% { transform: translateY(-5px) rotate(-1deg); }
            75% { transform: translateY(-15px) rotate(2deg); }
          }
          
          .shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: shimmer 3s infinite;
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          .pulse-ring {
            animation: pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
          }
          
          @keyframes pulseRing {
            0% { transform: scale(0.33); opacity: 1; }
            80%, 100% { transform: scale(2.33); opacity: 0; }
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #ec4899 0%, #be185d 50%, #9d174d 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .card-hover {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          .card-hover:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          }
          
          .step-slide {
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .category-grid {
            animation: fadeInUp 0.6s ease-out;
          }
          
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .confetti-piece {
            animation: confettiFall 3s linear infinite;
          }
          
          @keyframes confettiFall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
        `}
      </style>
      
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
        <div className={cn("relative min-h-[85vh] overflow-hidden", fadeIn && "animate-in fade-in duration-700")}>
          
          {/* Dynamic Background decoration */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/4 right-1/4 w-28 h-28 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>

          {/* Enhanced Success Overlay */}
          {isSuccess && (
            <div className="absolute inset-0 bg-white/98 backdrop-blur-xl rounded-3xl z-50 flex items-center justify-center">
              {/* Confetti effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "absolute w-2 h-2 confetti-piece",
                      i % 5 === 0 && "bg-rose-400",
                      i % 5 === 1 && "bg-pink-400", 
                      i % 5 === 2 && "bg-purple-400",
                      i % 5 === 3 && "bg-yellow-400",
                      i % 5 === 4 && "bg-green-400"
                    )}
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${3 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
              
              <div className="text-center relative z-10">
                <div className="mb-8 relative">
                  {/* Multiple pulse rings */}
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i}
                      className={cn("absolute inset-0 bg-green-500/20 rounded-full pulse-ring")}
                      style={{
                        width: `${32 - i * 4}rem`,
                        height: `${32 - i * 4}rem`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    />
                  ))}
                  
                  <div className="relative w-40 h-40 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/50">
                    <CheckCircle className="h-20 w-20 text-white animate-bounce" />
                    <div className="absolute inset-0 rounded-full shimmer overflow-hidden"></div>
                  </div>
                  
                  {/* Floating celebration icons */}
                  <div className="absolute -top-6 -right-6 floating-hearts">
                    <PartyPopper className="h-12 w-12 text-yellow-500" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 floating-hearts" style={{animationDelay: '1s'}}>
                    <Stars className="h-10 w-10 text-purple-500" />
                  </div>
                  <div className="absolute top-2 left-2 floating-hearts" style={{animationDelay: '0.5s'}}>
                    <Gem className="h-8 w-8 text-pink-500" />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-5xl font-bold gradient-text mb-4">
                    🎉 Welcome to Wedding Bazaar! 🎉
                  </h3>
                  <p className="text-gray-600 text-xl mb-6 max-w-lg mx-auto leading-relaxed">
                    Your {userType} account has been created successfully! 
                    {userType === 'vendor' ? ' Start showcasing your amazing services.' : ' Begin planning your dream wedding.'}
                  </p>
                  
                  <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold text-lg shadow-xl">
                    <Zap className="h-6 w-6 mr-3 animate-pulse" />
                    Redirecting to your {userType} dashboard...
                  </div>
                  
                  <div className="flex items-center justify-center space-x-3 mt-8">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-bounce shadow-lg"
                        style={{animationDelay: `${i * 0.15}s`}}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Multi-Step Header */}
          <div className="relative text-center mb-12 py-10 px-6">
            {/* Decorative background with glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/90 via-pink-50/70 to-purple-50/90 rounded-3xl -mx-6 backdrop-blur-sm border border-white/50 shadow-xl"></div>
            
            {/* Step indicator */}
            <div className="relative z-10 mb-10">
              <div className="flex items-center justify-center space-x-6 mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={cn(
                      "relative w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-700 transform",
                      currentStep >= step 
                        ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-500/40 scale-110" 
                        : currentStep > step
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105"
                        : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                    )}>
                      {completedSteps.includes(step) || currentStep > step ? (
                        <CheckCircle className="h-7 w-7" />
                      ) : (
                        step
                      )}
                      
                      {/* Glow effect for current step */}
                      {currentStep === step && (
                        <div className="absolute inset-0 bg-rose-500/30 rounded-full blur-xl animate-pulse"></div>
                      )}
                    </div>
                    {step < 3 && (
                      <div className={cn(
                        "w-20 h-2 mx-4 rounded-full transition-all duration-700",
                        currentStep > step 
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg" 
                          : currentStep === step
                          ? "bg-gradient-to-r from-rose-500 to-pink-600 animate-pulse"
                          : "bg-gray-200"
                      )} />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-gray-800">
                  Step {currentStep} of 3
                </h4>
                <div className="text-sm text-gray-600 font-medium">
                  {currentStep === 1 && "Choose your journey with Wedding Bazaar"}
                  {currentStep === 2 && "Tell us about yourself"}
                  {currentStep === 3 && userType === 'vendor' && "Showcase your business"}
                  {currentStep === 3 && userType === 'couple' && "Complete your profile"}
                </div>
              </div>
            </div>
            
            {/* Enhanced main header */}
            <div className="relative z-10">
              <div className="flex justify-center mb-8">
                <div className="relative p-8 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-[2.5rem] shadow-2xl shadow-rose-500/30 group overflow-hidden">
                  {/* Multiple glassmorphism layers */}
                  <div className="absolute inset-0 bg-white/20 rounded-[2.5rem]"></div>
                  <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-[2.5rem]"></div>
                  <div className="absolute inset-2 bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem]"></div>
                  
                  {/* Animated heart with multiple effects */}
                  <div className="relative z-10">
                    <Heart className="h-16 w-16 text-white group-hover:scale-110 transition-transform duration-500 floating-hearts" />
                  </div>
                  
                  {/* Enhanced shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 skew-x-12 rounded-[2.5rem]"></div>
                  
                  {/* Orbiting elements */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-300 rounded-full animate-ping"></div>
                  <div className="absolute top-0 left-0 w-3 h-3 bg-purple-300 rounded-full animate-bounce"></div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-5xl font-bold gradient-text mb-6">
                  Join Wedding Bazaar
                </h2>
                <p className="text-gray-700 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
                  Create your account and {userType === 'vendor' ? 'start showcasing your amazing wedding services to couples looking for their perfect vendors' : 'begin planning your dream wedding with access to the best vendors in the Philippines'}
                </p>
              </div>
              
              {/* Enhanced decorative elements */}
              <div className="absolute top-6 left-6 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-60 animate-pulse shadow-lg"></div>
              <div className="absolute top-10 right-10 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-50 animate-bounce shadow-md"></div>
              <div className="absolute bottom-6 left-10 w-7 h-7 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-40 floating-hearts shadow-lg"></div>
              <div className="absolute bottom-10 right-6 w-5 h-5 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-70 animate-ping"></div>
            </div>
          </div>

          {/* Step Content Area */}
          <div className={cn("step-slide px-8", slideDirection === 'right' ? "slide-in-right" : "slide-in-left")}>
            
            {/* Step 1: Enhanced User Type Selection */}
            {currentStep === 1 && (
              <div className="mb-12">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Journey</h3>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                    Select the option that best describes your role in the wedding world. 
                    This will customize your experience and show you relevant features.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                  {/* Enhanced Couple Card */}
                  <div
                    className={cn(
                      "relative group cursor-pointer card-hover",
                      "p-10 border-3 rounded-[2rem] transition-all duration-700 overflow-hidden",
                      userType === 'couple' 
                        ? "border-rose-500 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 shadow-2xl shadow-rose-500/40 scale-105" 
                        : "border-gray-200 hover:border-rose-300 bg-white/90 backdrop-blur-sm hover:shadow-2xl hover:shadow-rose-500/20"
                    )}
                    onClick={() => setUserType('couple')}
                    onMouseEnter={() => setHoveredUserType('couple')}
                    onMouseLeave={() => setHoveredUserType(null)}
                  >
                    {/* Enhanced background effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2rem]"></div>
                    
                    {/* Floating particles with physics */}
                    <div className="absolute top-6 right-6 w-4 h-4 bg-rose-400 rounded-full opacity-20 group-hover:opacity-80 animate-pulse transition-opacity duration-500"></div>
                    <div className="absolute bottom-6 left-6 w-3 h-3 bg-pink-400 rounded-full opacity-15 group-hover:opacity-60 animate-bounce"></div>
                    <div className="absolute top-1/2 right-10 w-2 h-2 bg-purple-400 rounded-full opacity-25 group-hover:opacity-70 animate-ping"></div>
                    <div className="absolute top-8 left-8 w-1 h-1 bg-yellow-400 rounded-full opacity-30 group-hover:opacity-50 animate-pulse"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 text-center">
                      <div className="relative mb-8">
                        <div className={cn(
                          "w-28 h-28 mx-auto rounded-[2rem] flex items-center justify-center transition-all duration-500 relative overflow-hidden",
                          userType === 'couple' 
                            ? "bg-gradient-to-br from-rose-500 to-pink-500 shadow-2xl shadow-rose-500/50" 
                            : "bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-rose-400 group-hover:to-pink-400"
                        )}>
                          <Heart className="h-14 w-14 text-white" />
                          
                          {/* Inner glow */}
                          <div className="absolute inset-2 bg-white/20 rounded-[1.5rem]"></div>
                          
                          {/* Pulsing glow effect */}
                          {userType === 'couple' && (
                            <div className="absolute inset-0 bg-rose-500/40 rounded-[2rem] blur-2xl animate-pulse"></div>
                          )}
                        </div>
                        
                        {/* Enhanced selection indicator */}
                        {userType === 'couple' && (
                          <div className="absolute -top-3 -right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                            <CheckCircle className="h-7 w-7 text-white" />
                            <div className="absolute inset-0 bg-green-400/50 rounded-full blur-lg animate-ping"></div>
                          </div>
                        )}
                        
                        {/* Hover celebration effects */}
                        {hoveredUserType === 'couple' && userType !== 'couple' && (
                          <>
                            <Star className="absolute -top-2 -left-2 h-6 w-6 text-yellow-400 fill-current animate-spin" />
                            <Star className="absolute -bottom-2 -right-2 h-5 w-5 text-yellow-400 fill-current animate-ping" />
                            <Sparkles className="absolute top-2 right-2 h-4 w-4 text-pink-400 animate-pulse" />
                          </>
                        )}
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-bold text-3xl mb-3 text-gray-900">I'm a Couple</h4>
                          <p className="text-gray-600 font-semibold text-lg">Planning our dream wedding</p>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-3 text-base text-gray-500 font-medium">
                          <Users className="h-5 w-5" />
                          <span>Find vendors & plan together</span>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-200/70">
                          <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-rose-500" />
                              <span className="font-medium">Vendor discovery</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-rose-500" />
                              <span className="font-medium">Planning tools</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-rose-500" />
                              <span className="font-medium">Secure bookings</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4 text-rose-500" />
                              <span className="font-medium">Verified vendors</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Preview benefits */}
                        <div className="mt-8 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
                          <h5 className="font-bold text-sm text-gray-800 mb-2">What you'll get:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Access to 1000+ verified vendors</li>
                            <li>• Wedding planning timeline tools</li>
                            <li>• Budget tracking & management</li>
                            <li>• Guest list management</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 skew-x-12"></div>
                  </div>
                  
                  {/* Enhanced Vendor Card */}
                  <div
                    className={cn(
                      "relative group cursor-pointer card-hover",
                      "p-10 border-3 rounded-[2rem] transition-all duration-700 overflow-hidden",
                      userType === 'vendor' 
                        ? "border-indigo-500 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 shadow-2xl shadow-indigo-500/40 scale-105" 
                        : "border-gray-200 hover:border-indigo-300 bg-white/90 backdrop-blur-sm hover:shadow-2xl hover:shadow-indigo-500/20"
                    )}
                    onClick={() => setUserType('vendor')}
                    onMouseEnter={() => setHoveredUserType('vendor')}
                    onMouseLeave={() => setHoveredUserType(null)}
                  >
                    {/* Enhanced background effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2rem]"></div>
                    
                    {/* Floating particles with physics */}
                    <div className="absolute top-6 right-6 w-4 h-4 bg-indigo-400 rounded-full opacity-20 group-hover:opacity-80 animate-pulse transition-opacity duration-500"></div>
                    <div className="absolute bottom-6 left-6 w-3 h-3 bg-blue-400 rounded-full opacity-15 group-hover:opacity-60 animate-bounce"></div>
                    <div className="absolute top-1/2 right-10 w-2 h-2 bg-purple-400 rounded-full opacity-25 group-hover:opacity-70 animate-ping"></div>
                    <div className="absolute top-8 left-8 w-1 h-1 bg-cyan-400 rounded-full opacity-30 group-hover:opacity-50 animate-pulse"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 text-center">
                      <div className="relative mb-8">
                        <div className={cn(
                          "w-28 h-28 mx-auto rounded-[2rem] flex items-center justify-center transition-all duration-500 relative overflow-hidden",
                          userType === 'vendor' 
                            ? "bg-gradient-to-br from-indigo-500 to-blue-500 shadow-2xl shadow-indigo-500/50" 
                            : "bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-indigo-400 group-hover:to-blue-400"
                        )}>
                          <Building className="h-14 w-14 text-white" />
                          
                          {/* Inner glow */}
                          <div className="absolute inset-2 bg-white/20 rounded-[1.5rem]"></div>
                          
                          {/* Pulsing glow effect */}
                          {userType === 'vendor' && (
                            <div className="absolute inset-0 bg-indigo-500/40 rounded-[2rem] blur-2xl animate-pulse"></div>
                          )}
                        </div>
                        
                        {/* Enhanced selection indicator */}
                        {userType === 'vendor' && (
                          <div className="absolute -top-3 -right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                            <CheckCircle className="h-7 w-7 text-white" />
                            <div className="absolute inset-0 bg-green-400/50 rounded-full blur-lg animate-ping"></div>
                          </div>
                        )}
                        
                        {/* Hover celebration effects */}
                        {hoveredUserType === 'vendor' && userType !== 'vendor' && (
                          <>
                            <Star className="absolute -top-2 -left-2 h-6 w-6 text-yellow-400 fill-current animate-spin" />
                            <Star className="absolute -bottom-2 -right-2 h-5 w-5 text-yellow-400 fill-current animate-ping" />
                            <Sparkles className="absolute top-2 right-2 h-4 w-4 text-blue-400 animate-pulse" />
                          </>
                        )}
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-bold text-3xl mb-3 text-gray-900">I'm a Vendor</h4>
                          <p className="text-gray-600 font-semibold text-lg">Offering wedding services</p>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-3 text-base text-gray-500 font-medium">
                          <Camera className="h-5 w-5" />
                          <span>Showcase & grow your business</span>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-200/70">
                          <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-indigo-500" />
                              <span className="font-medium">Business growth</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-indigo-500" />
                              <span className="font-medium">Client management</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-indigo-500" />
                              <span className="font-medium">Portfolio showcase</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Crown className="h-4 w-4 text-indigo-500" />
                              <span className="font-medium">Premium features</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Preview benefits */}
                        <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                          <h5 className="font-bold text-sm text-gray-800 mb-2">What you'll get:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Professional business profile</li>
                            <li>• Client inquiry management</li>
                            <li>• Portfolio & gallery showcase</li>
                            <li>• Revenue tracking tools</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 skew-x-12"></div>
                  </div>
                </div>
                
                {/* Enhanced Next Step Button */}
                <div className="flex justify-center mt-16">
                  <button
                    onClick={nextStep}
                    disabled={!userType}
                    className={cn(
                      "group relative px-12 py-5 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-2xl text-xl overflow-hidden transition-all duration-500 transform",
                      "hover:from-rose-700 hover:to-pink-700 hover:shadow-2xl hover:shadow-rose-500/40 hover:scale-105",
                      "focus:ring-4 focus:ring-rose-500/50 focus:ring-offset-2",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100",
                      !userType && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {/* Background effects */}
                    <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
                    <div className="absolute inset-1 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>
                    
                    <div className="relative z-10 flex items-center justify-center">
                      <span>Continue Your Journey</span>
                      <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                    
                    {/* Enhanced shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 skew-x-12 rounded-2xl"></div>
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="mb-12">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Tell Us About Yourself</h3>
                  <p className="text-gray-600 text-lg">
                    Share some basic information to personalize your experience.
                  </p>
                </div>
                
                <div className="max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* First Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <User className="inline w-4 h-4 mr-2" />
                        First Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))
                          }
                          className={cn(
                            "w-full px-4 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300",
                            "bg-white/80 backdrop-blur-sm shadow-lg",
                            validationErrors.firstName
                              ? "border-red-500 focus:border-red-600 bg-red-50/80"
                              : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                          )}
                          placeholder="Enter your first name"
                        />
                        {validationErrors.firstName && (
                          <p className="text-red-500 text-sm mt-2 font-medium">{validationErrors.firstName}</p>
                        )}
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <User className="inline w-4 h-4 mr-2" />
                        Last Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))
                          }
                          className={cn(
                            "w-full px-4 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300",
                            "bg-white/80 backdrop-blur-sm shadow-lg",
                            validationErrors.lastName
                              ? "border-red-500 focus:border-red-600 bg-red-50/80"
                              : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                          )}
                          placeholder="Enter your last name"
                        />
                        {validationErrors.lastName && (
                          <p className="text-red-500 text-sm mt-2 font-medium">{validationErrors.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <Mail className="inline w-4 h-4 mr-2" />
                        Email Address *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))
                          }
                          className={cn(
                            "w-full px-4 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300",
                            "bg-white/80 backdrop-blur-sm shadow-lg",
                            validationErrors.email
                              ? "border-red-500 focus:border-red-600 bg-red-50/80"
                              : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                          )}
                          placeholder="your.email@example.com"
                        />
                        {validationErrors.email && (
                          <p className="text-red-500 text-sm mt-2 font-medium">{validationErrors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <Phone className="inline w-4 h-4 mr-2" />
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))
                          }
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                          placeholder="+63 9XX XXX XXXX"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <Lock className="inline w-4 h-4 mr-2" />
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))
                          }
                          className={cn(
                            "w-full px-4 py-4 pr-12 border-2 rounded-xl focus:outline-none transition-all duration-300",
                            "bg-white/80 backdrop-blur-sm shadow-lg",
                            validationErrors.password
                              ? "border-red-500 focus:border-red-600 bg-red-50/80"
                              : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                          )}
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {validationErrors.password && (
                          <p className="text-red-500 text-sm mt-2 font-medium">{validationErrors.password}</p>
                        )}
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <Lock className="inline w-4 h-4 mr-2" />
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))
                          }
                          className={cn(
                            "w-full px-4 py-4 pr-12 border-2 rounded-xl focus:outline-none transition-all duration-300",
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
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {validationErrors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-2 font-medium">{validationErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preferred Contact Method */}
                  <div className="mt-8 space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      <MessageSquare className="inline w-4 h-4 mr-2" />
                      Preferred Contact Method
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'email', label: 'Email', icon: Mail },
                        { value: 'phone', label: 'Phone', icon: Phone }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, preferred_contact: value as 'email' | 'phone' }))
                          }
                          className={cn(
                            "p-4 border-2 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3",
                            "bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl",
                            formData.preferred_contact === value
                              ? "border-rose-500 bg-rose-50/80 shadow-rose-500/20"
                              : "border-gray-200 hover:border-rose-300"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Navigation Buttons for Step 2 */}
                <div className="flex justify-center space-x-4 mt-12">
                  <button
                    onClick={prevStep}
                    className="flex items-center px-8 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium shadow-lg"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Step 1
                  </button>
                  
                  <button
                    onClick={nextStep}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg"
                  >
                    Continue to Step 3
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Business/Profile Setup */}
            {currentStep === 3 && (
              <div className="mb-12">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {userType === 'vendor' ? 'Showcase Your Business' : 'Complete Your Profile'}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {userType === 'vendor' 
                      ? 'Add details about your business to attract more clients.'
                      : 'Finalize your profile to start planning your dream wedding.'
                    }
                  </p>
                </div>
                
                <div className="max-w-4xl mx-auto">
                  {userType === 'vendor' ? (
                    // Vendor Business Setup
                    <div className="space-y-8">
                      {/* Business Name & Category */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <Building className="inline w-4 h-4 mr-2" />
                            Business Name *
                          </label>
                          <input
                            type="text"
                            value={formData.business_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))
                            }
                            className={cn(
                              "w-full px-4 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300",
                              "bg-white/80 backdrop-blur-sm shadow-lg",
                              validationErrors.business_name
                                ? "border-red-500 focus:border-red-600 bg-red-50/80"
                                : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                            )}
                            placeholder="Your Business Name"
                          />
                          {validationErrors.business_name && (
                            <p className="text-red-500 text-sm mt-2 font-medium">{validationErrors.business_name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <Tag className="inline w-4 h-4 mr-2" />
                            Business Category *
                          </label>
                          <select
                            value={formData.business_type}
                            onChange={(e) => setFormData(prev => ({ ...prev, business_type: e.target.value }))
                            }
                            className={cn(
                              "w-full px-4 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300",
                              "bg-white/80 backdrop-blur-sm shadow-lg",
                              validationErrors.business_type
                                ? "border-red-500 focus:border-red-600 bg-red-50/80"
                                : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                            )}
                          >
                            <option value="">Select your business category</option>
                            {vendorCategories.map((category) => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                          {validationErrors.business_type && (
                            <p className="text-red-500 text-sm mt-2 font-medium">{validationErrors.business_type}</p>
                          )}
                        </div>
                      </div>

                      {/* Business Description */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <FileText className="inline w-4 h-4 mr-2" />
                          Business Description
                        </label>
                        <textarea
                          value={formData.business_description}
                          onChange={(e) => setFormData(prev => ({ ...prev, business_description: e.target.value }))
                          }
                          rows={4}
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg resize-none"
                          placeholder="Describe your business and what makes you special..."
                        />
                      </div>

                      {/* Location & Years in Business */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <MapPin className="inline w-4 h-4 mr-2" />
                            Business Location *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.location}
                              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))
                              }
                              className={cn(
                                "w-full px-4 py-4 pr-12 border-2 rounded-xl focus:outline-none transition-all duration-300",
                                "bg-white/80 backdrop-blur-sm shadow-lg",
                                validationErrors.location
                                  ? "border-red-500 focus:border-red-600 bg-red-50/80"
                                  : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20"
                              )}
                              placeholder="City, Province"
                            />
                            <button
                              type="button"
                              onClick={() => setShowLocationMap(true)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-600 transition-colors"
                            >
                              <MapPin className="w-5 h-5" />
                            </button>
                          </div>
                          {validationErrors.location && (
                            <p className="text-red-500 text-sm mt-2 font-medium">{validationErrors.location}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <Calendar className="inline w-4 h-4 mr-2" />
                            Years in Business
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={formData.years_in_business}
                            onChange={(e) => setFormData(prev => ({ ...prev, years_in_business: parseInt(e.target.value) || 0 }))
                            }
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Website & Portfolio */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <Globe className="inline w-4 h-4 mr-2" />
                            Website URL
                          </label>
                          <input
                            type="url"
                            value={formData.website_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))
                            }
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                            placeholder="https://yourwebsite.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <DollarSign className="inline w-4 h-4 mr-2" />
                            Price Range
                          </label>
                          <select
                            value={formData.price_range}
                            onChange={(e) => setFormData(prev => ({ ...prev, price_range: e.target.value }))
                            }
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                          >
                            <option value="">Select price range</option>
                            <option value="budget">Budget Friendly (₱10k - ₱50k)</option>
                            <option value="mid">Mid Range (₱50k - ₱150k)</option>
                            <option value="premium">Premium (₱150k - ₱500k)</option>
                            <option value="luxury">Luxury (₱500k+)</option>
                          </select>
                        </div>
                      </div>

                      {/* Specialties */}
                      {formData.business_type && (
                        <div className="space-y-4">
                          <label className="block text-sm font-semibold text-gray-700">
                            <Star className="inline w-4 h-4 mr-2" />
                            Specialties
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {getSpecialtiesForCategory(formData.business_type).map((specialty) => (
                              <button
                                key={specialty}
                                type="button"
                                onClick={() => toggleSpecialty(specialty)}
                                className={cn(
                                  "p-3 text-sm border-2 rounded-lg transition-all duration-300",
                                  "bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl",
                                  selectedSpecialties.includes(specialty)
                                    ? "border-rose-500 bg-rose-50/80 text-rose-700 shadow-rose-500/20"
                                    : "border-gray-200 hover:border-rose-300 text-gray-700"
                                )}
                              >
                                {specialty}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Couple Profile Completion
                    <div className="space-y-8">
                      {/* Wedding Date & Budget */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <Calendar className="inline w-4 h-4 mr-2" />
                            Planned Wedding Date
                          </label>
                          <input
                            type="date"
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <DollarSign className="inline w-4 h-4 mr-2" />
                            Estimated Budget
                          </label>
                          <select className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg">
                            <option value="">Select budget range</option>
                            <option value="budget">Budget Wedding (₱50k - ₱200k)</option>
                            <option value="mid">Mid Range (₱200k - ₱500k)</option>
                            <option value="premium">Premium (₱500k - ₱1M)</option>
                            <option value="luxury">Luxury (₱1M+)</option>
                          </select>
                        </div>
                      </div>

                      {/* Guest Count & Venue Type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <Users className="inline w-4 h-4 mr-2" />
                            Expected Guest Count
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                            placeholder="Number of guests"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <Home className="inline w-4 h-4 mr-2" />
                            Preferred Venue Type
                          </label>
                          <select className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg">
                            <option value="">Select venue preference</option>
                            <option value="church">Church/Religious</option>
                            <option value="beach">Beach/Outdoor</option>
                            <option value="garden">Garden/Park</option>
                            <option value="hotel">Hotel/Resort</option>
                            <option value="hall">Event Hall/Center</option>
                            <option value="destination">Destination Wedding</option>
                          </select>
                        </div>
                      </div>

                      {/* Wedding Style & Location */}
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">
                          <Star className="inline w-4 h-4 mr-2" />
                          Wedding Style Preferences
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {['Traditional', 'Modern', 'Rustic', 'Elegant', 'Casual', 'Formal', 'Vintage', 'Bohemian'].map((style) => (
                            <button
                              key={style}
                              type="button"
                              className="p-3 text-sm border-2 border-gray-200 rounded-lg hover:border-rose-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl text-gray-700"
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <MapPin className="inline w-4 h-4 mr-2" />
                          Preferred Wedding Location
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))
                          }
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                          placeholder="City or Province for your wedding"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Terms & Conditions */}
                  <div className="mt-8 space-y-6">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))
                        }
                        className="mt-1 h-5 w-5 text-rose-600 border-2 border-gray-300 rounded focus:ring-rose-500"
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
                        onChange={(e) => setFormData(prev => ({ ...prev, receiveUpdates: e.target.checked }))
                        }
                        className="mt-1 h-5 w-5 text-rose-600 border-2 border-gray-300 rounded focus:ring-rose-500"
                      />
                      <label htmlFor="receiveUpdates" className="text-sm text-gray-700">
                        I'd like to receive updates about new features and wedding tips
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Final Step Navigation & Submit */}
                <div className="flex justify-center space-x-4 mt-12">
                  <button
                    onClick={prevStep}
                    className="flex items-center px-8 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium shadow-lg"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.agreeToTerms}
                    className={cn(
                      "flex items-center px-12 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg",
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
                        Create Account
                        <Sparkles className="h-5 w-5 ml-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 px-6 pb-6">
          <p className="text-gray-600 mb-4">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-rose-600 hover:text-rose-700 font-bold transition-colors duration-200 hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </Modal>

      {/* Policy Modals */}
      <TermsOfServiceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* Business Location Map Modal */}
      <BusinessLocationMap
        isOpen={showLocationMap}
        onClose={() => setShowLocationMap(false)}
        onLocationSelect={handleLocationSelect}
        title="Select Your Business Location"
      />
    </>
  );
};
