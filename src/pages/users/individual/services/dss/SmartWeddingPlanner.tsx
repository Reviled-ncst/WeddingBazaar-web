import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Star, 
  MapPin, 
  Package, 
  Check, 
  ChevronRight,
  ChevronLeft,
  Users,
  Calendar,
  DollarSign,
  Heart,
  Palette,
  MapPinned,
  Clock,
  TrendingUp
} from 'lucide-react';
import type { Service } from '../../../../../modules/services/types';

interface SmartWeddingPlannerProps {
  services: Service[];
  isOpen: boolean;
  onClose: () => void;
  onBookService: (serviceId: string) => void;
  onMessageVendor: (serviceId: string) => void;
}

interface WeddingPreferences {
  weddingType: string;
  weddingStyle: string;
  guestCount: number;
  budget: number;
  location: string;
  weddingDate: string;
  priorityServices: string[];
  venueType: string;
  season: string;
}

interface WeddingPackage {
  id: string;
  name: string;
  tagline: string;
  description: string;
  services: Service[];
  totalPrice: number;
  discountedPrice: number;
  savings: number;
  matchScore: number;
  avgRating: number;
  totalReviews: number;
  category: 'essential' | 'deluxe' | 'premium';
  badge: string;
  color: string;
  whyRecommended: string[];
}

export function SmartWeddingPlanner({ 
  services, 
  isOpen, 
  onClose, 
  onBookService,
  onMessageVendor 
}: SmartWeddingPlannerProps) {
  const [step, setStep] = useState<'preferences' | 'recommendations'>('preferences');
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<WeddingPreferences>({
    weddingType: '',
    weddingStyle: '',
    guestCount: 100,
    budget: 100000,
    location: '',
    weddingDate: '',
    priorityServices: [],
    venueType: '',
    season: ''
  });
  const [sortBy, setSortBy] = useState<'match' | 'price' | 'savings'>('match');

  // Wedding type options
  const weddingTypes = [
    { id: 'traditional', name: 'Traditional', icon: '💒', description: 'Classic ceremony with formal reception' },
    { id: 'modern', name: 'Modern', icon: '✨', description: 'Contemporary style with trendy elements' },
    { id: 'destination', name: 'Destination', icon: '🏖️', description: 'Wedding in a special travel location' },
    { id: 'intimate', name: 'Intimate', icon: '💕', description: 'Small gathering with close family and friends' },
    { id: 'grand', name: 'Grand', icon: '👑', description: 'Large-scale celebration with all the details' },
    { id: 'rustic', name: 'Rustic', icon: '🌾', description: 'Countryside charm with natural elements' }
  ];

  // Wedding style options
  const weddingStyles = [
    { id: 'elegant', name: 'Elegant', icon: '💎' },
    { id: 'romantic', name: 'Romantic', icon: '💗' },
    { id: 'bohemian', name: 'Bohemian', icon: '🌸' },
    { id: 'vintage', name: 'Vintage', icon: '🕰️' },
    { id: 'minimalist', name: 'Minimalist', icon: '⚪' },
    { id: 'luxurious', name: 'Luxurious', icon: '✨' }
  ];

  // Venue types
  const venueTypes = [
    { id: 'hotel', name: 'Hotel/Ballroom', icon: '🏨' },
    { id: 'garden', name: 'Garden/Outdoor', icon: '🌳' },
    { id: 'beach', name: 'Beach', icon: '🏖️' },
    { id: 'church', name: 'Church', icon: '⛪' },
    { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
    { id: 'venue', name: 'Event Venue', icon: '🏛️' }
  ];

  // Priority services
  const priorityServiceOptions = [
    { id: 'photography', name: 'Photography', icon: '📸' },
    { id: 'videography', name: 'Videography', icon: '🎥' },
    { id: 'catering', name: 'Catering', icon: '🍽️' },
    { id: 'venue', name: 'Venue', icon: '🏛️' },
    { id: 'music_dj', name: 'Music & DJ', icon: '🎵' },
    { id: 'flowers_decor', name: 'Flowers & Decor', icon: '💐' },
    { id: 'makeup_hair', name: 'Makeup & Hair', icon: '💄' },
    { id: 'wedding_cake', name: 'Wedding Cake', icon: '🎂' }
  ];

  // Location options (Philippine cities)
  const locationOptions = [
    'Metro Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 
    'Cebu City', 'Davao City', 'Baguio', 'Tagaytay', 'Boracay',
    'Batangas', 'Pampanga', 'Laguna', 'Cavite', 'Rizal'
  ];

  // Create personalized wedding packages based on preferences
  const weddingPackages = useMemo(() => {
    if (step !== 'recommendations') return [];

    // Group services by category
    const servicesByCategory = services.reduce((acc: any, service: Service) => {
      const category = service.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    }, {});

    // Get best service per category based on rating and preferences
    const getBestService = (category: string) => {
      const categoryServices = servicesByCategory[category] || [];
      return categoryServices.sort((a: Service, b: Service) => {
        // Prioritize services matching user preferences
        let scoreA = a.rating;
        let scoreB = b.rating;

        // Boost score if location matches
        if (preferences.location && a.location?.toLowerCase().includes(preferences.location.toLowerCase())) {
          scoreA += 1;
        }
        if (preferences.location && b.location?.toLowerCase().includes(preferences.location.toLowerCase())) {
          scoreB += 1;
        }

        // Boost score if in priority services
        if (preferences.priorityServices.includes(category)) {
          scoreA += 0.5;
          scoreB += 0.5;
        }

        return scoreB - scoreA;
      })[0];
    };

    const packages: WeddingPackage[] = [];

    // ESSENTIAL PACKAGE - Budget-friendly basics
    const essentialServices = [
      getBestService('venue'),
      getBestService('catering'),
      getBestService('photography'),
    ].filter(Boolean);

    if (essentialServices.length > 0) {
      const totalPrice = essentialServices.reduce((sum, s) => sum + (s?.basePrice || 0), 0);
      const discountedPrice = totalPrice * 0.9; // 10% discount
      const avgRating = essentialServices.reduce((sum, s) => sum + (s?.rating || 0), 0) / essentialServices.length;
      const totalReviews = essentialServices.reduce((sum, s) => sum + (s?.reviewCount || 0), 0);

      // Calculate match score based on preferences
      let matchScore = 70;
      if (totalPrice <= preferences.budget) matchScore += 15;
      if (preferences.weddingType === 'intimate') matchScore += 10;
      if (preferences.priorityServices.length <= 3) matchScore += 5;

      const whyRecommended = [];
      if (totalPrice <= preferences.budget) whyRecommended.push(`Within your ₱${preferences.budget.toLocaleString()} budget`);
      if (preferences.weddingType === 'intimate') whyRecommended.push('Perfect for intimate weddings');
      if (preferences.guestCount <= 100) whyRecommended.push(`Suitable for ${preferences.guestCount} guests`);
      whyRecommended.push('Essential services covered');

      packages.push({
        id: 'essential',
        name: 'Essential Package',
        tagline: 'Perfect Start',
        description: 'All the wedding essentials for your special day',
        services: essentialServices,
        totalPrice,
        discountedPrice,
        savings: totalPrice - discountedPrice,
        matchScore: Math.min(matchScore, 100),
        avgRating,
        totalReviews,
        category: 'essential',
        badge: 'BUDGET-FRIENDLY',
        color: 'from-green-500 to-emerald-600',
        whyRecommended
      });
    }

    // DELUXE PACKAGE - Popular choice with more services
    const deluxeServices = [
      getBestService('venue'),
      getBestService('catering'),
      getBestService('photography'),
      getBestService('videography'),
      getBestService('music_dj'),
      getBestService('flowers_decor'),
    ].filter(Boolean);

    if (deluxeServices.length >= 4) {
      const totalPrice = deluxeServices.reduce((sum, s) => sum + (s?.basePrice || 0), 0);
      const discountedPrice = totalPrice * 0.85; // 15% discount
      const avgRating = deluxeServices.reduce((sum, s) => sum + (s?.rating || 0), 0) / deluxeServices.length;
      const totalReviews = deluxeServices.reduce((sum, s) => sum + (s?.reviewCount || 0), 0);

      let matchScore = 80;
      if (totalPrice <= preferences.budget * 1.2) matchScore += 10;
      if (['modern', 'traditional', 'grand'].includes(preferences.weddingType)) matchScore += 5;
      if (preferences.priorityServices.length >= 4) matchScore += 5;

      const whyRecommended = [];
      if (totalPrice <= preferences.budget * 1.2) whyRecommended.push('Great value for comprehensive coverage');
      if (preferences.weddingStyle === 'elegant' || preferences.weddingStyle === 'romantic') whyRecommended.push(`Matches your ${preferences.weddingStyle} style`);
      if (preferences.guestCount > 50 && preferences.guestCount <= 150) whyRecommended.push(`Ideal for ${preferences.guestCount} guests`);
      whyRecommended.push('Most popular choice');

      packages.push({
        id: 'deluxe',
        name: 'Deluxe Package',
        tagline: 'Most Popular',
        description: 'Complete wedding experience with enhanced services',
        services: deluxeServices,
        totalPrice,
        discountedPrice,
        savings: totalPrice - discountedPrice,
        matchScore: Math.min(matchScore, 100),
        avgRating,
        totalReviews,
        category: 'deluxe',
        badge: 'BEST VALUE',
        color: 'from-blue-500 to-indigo-600',
        whyRecommended
      });
    }

    // PREMIUM PACKAGE - Luxury all-inclusive
    const premiumServices = [
      getBestService('venue'),
      getBestService('catering'),
      getBestService('photography'),
      getBestService('videography'),
      getBestService('music_dj'),
      getBestService('flowers_decor'),
      getBestService('makeup_hair'),
      getBestService('wedding_cake'),
      getBestService('wedding_planning'),
    ].filter(Boolean);

    if (premiumServices.length >= 6) {
      const totalPrice = premiumServices.reduce((sum, s) => sum + (s?.basePrice || 0), 0);
      const discountedPrice = totalPrice * 0.80; // 20% discount
      const avgRating = premiumServices.reduce((sum, s) => sum + (s?.rating || 0), 0) / premiumServices.length;
      const totalReviews = premiumServices.reduce((sum, s) => sum + (s?.reviewCount || 0), 0);

      let matchScore = 85;
      if (preferences.budget >= 150000) matchScore += 10;
      if (['grand', 'luxurious'].includes(preferences.weddingType) || ['luxurious', 'elegant'].includes(preferences.weddingStyle)) matchScore += 5;

      const whyRecommended = [];
      if (preferences.budget >= 150000) whyRecommended.push('Matches your premium budget');
      if (preferences.weddingType === 'grand') whyRecommended.push('Perfect for grand celebrations');
      if (preferences.guestCount > 150) whyRecommended.push(`Designed for ${preferences.guestCount}+ guests`);
      whyRecommended.push('Premium vendors and services');
      whyRecommended.push('Stress-free planning included');

      packages.push({
        id: 'premium',
        name: 'Premium Package',
        tagline: 'Luxury Experience',
        description: 'All-inclusive luxury wedding with top-tier vendors',
        services: premiumServices,
        totalPrice,
        discountedPrice,
        savings: totalPrice - discountedPrice,
        matchScore: Math.min(matchScore, 100),
        avgRating,
        totalReviews,
        category: 'premium',
        badge: 'LUXURY',
        color: 'from-purple-500 to-pink-600',
        whyRecommended
      });
    }

    // Sort packages
    return packages.sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return b.matchScore - a.matchScore;
        case 'price':
          return a.discountedPrice - b.discountedPrice;
        case 'savings':
          return b.savings - a.savings;
        default:
          return 0;
      }
    });
  }, [services, preferences, sortBy, step]);

  const handlePreferenceChange = (key: keyof WeddingPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const togglePriorityService = (serviceId: string) => {
    setPreferences(prev => ({
      ...prev,
      priorityServices: prev.priorityServices.includes(serviceId)
        ? prev.priorityServices.filter(id => id !== serviceId)
        : [...prev.priorityServices, serviceId]
    }));
  };

  const handleContinueToRecommendations = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setStep('recommendations');
    }
  };

  const handleBack = () => {
    if (step === 'recommendations') {
      setStep('preferences');
      setCurrentStep(4);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return preferences.weddingType !== '';
      case 2:
        return preferences.budget > 0 && preferences.guestCount > 0;
      case 3:
        return preferences.location !== '';
      case 4:
        return preferences.priorityServices.length > 0;
      default:
        return true;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-8 w-8" />
              <h2 className="text-3xl font-bold">
                {step === 'preferences' ? 'Smart Wedding Planner' : 'Your Perfect Packages'}
              </h2>
            </div>
            <p className="text-white/90">
              {step === 'preferences' 
                ? 'Answer a few questions to get personalized wedding package recommendations'
                : 'Curated packages based on your preferences'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {step === 'preferences' ? (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Step 1: Wedding Type & Style */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">What type of wedding are you planning?</h3>
                      <p className="text-gray-600 mb-6">Choose the style that best describes your dream wedding</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {weddingTypes.map(type => (
                          <button
                            key={type.id}
                            onClick={() => handlePreferenceChange('weddingType', type.id)}
                            className={`p-6 rounded-2xl border-2 transition-all ${
                              preferences.weddingType === type.id
                                ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                            }`}
                          >
                            <div className="text-4xl mb-2">{type.icon}</div>
                            <h4 className="font-semibold text-gray-900">{type.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">What's your wedding style?</h3>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {weddingStyles.map(style => (
                          <button
                            key={style.id}
                            onClick={() => handlePreferenceChange('weddingStyle', style.id)}
                            title={`Select ${style.name} style`}
                            aria-label={`Select ${style.name} style`}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              preferences.weddingStyle === style.id
                                ? 'border-pink-500 bg-pink-50 shadow-md'
                                : 'border-gray-200 hover:border-pink-300'
                            }`}
                          >
                            <div className="text-2xl mb-1">{style.icon}</div>
                            <p className="text-xs font-medium">{style.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Budget & Guest Count */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <DollarSign className="h-7 w-7 text-green-600" />
                        What's your wedding budget?
                      </h3>
                      <p className="text-gray-600 mb-6">This helps us recommend packages within your range</p>
                      <div className="space-y-4">
                        <label htmlFor="budget-slider" className="sr-only">Wedding Budget</label>
                        <input
                          id="budget-slider"
                          type="range"
                          min="20000"
                          max="500000"
                          step="10000"
                          value={preferences.budget}
                          onChange={(e) => handlePreferenceChange('budget', Number(e.target.value))}
                          title="Wedding Budget Slider"
                          aria-label="Wedding Budget Slider"
                          className="w-full h-3 bg-gradient-to-r from-green-200 to-purple-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-center">
                          <p className="text-4xl font-bold text-purple-600">
                            ₱{preferences.budget.toLocaleString()}
                          </p>
                          <p className="text-gray-500 mt-1">Approximate total budget</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Users className="h-7 w-7 text-blue-600" />
                        How many guests are you expecting?
                      </h3>
                      <p className="text-gray-600 mb-6">Guest count helps us recommend appropriate venue sizes and catering</p>
                      <div className="space-y-4">
                        <label htmlFor="guest-count-slider" className="sr-only">Guest Count</label>
                        <input
                          id="guest-count-slider"
                          type="range"
                          min="20"
                          max="500"
                          step="10"
                          value={preferences.guestCount}
                          onChange={(e) => handlePreferenceChange('guestCount', Number(e.target.value))}
                          title="Guest Count Slider"
                          aria-label="Guest Count Slider"
                          className="w-full h-3 bg-gradient-to-r from-blue-200 to-pink-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-center">
                          <p className="text-4xl font-bold text-blue-600">
                            {preferences.guestCount}
                          </p>
                          <p className="text-gray-500 mt-1">Expected guests</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Location & Venue */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <MapPinned className="h-7 w-7 text-red-600" />
                        Where's your wedding location?
                      </h3>
                      <p className="text-gray-600 mb-6">We'll recommend vendors in your area</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {locationOptions.map(location => (
                          <button
                            key={location}
                            onClick={() => handlePreferenceChange('location', location)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              preferences.location === location
                                ? 'border-red-500 bg-red-50 shadow-md'
                                : 'border-gray-200 hover:border-red-300'
                            }`}
                          >
                            <MapPin className="h-5 w-5 mx-auto mb-2 text-red-500" />
                            <p className="text-sm font-medium text-center">{location}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">What type of venue do you prefer?</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {venueTypes.map(venue => (
                          <button
                            key={venue.id}
                            onClick={() => handlePreferenceChange('venueType', venue.id)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              preferences.venueType === venue.id
                                ? 'border-purple-500 bg-purple-50 shadow-md'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="text-3xl mb-2">{venue.icon}</div>
                            <p className="text-sm font-medium">{venue.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Priority Services */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Heart className="h-7 w-7 text-pink-600" />
                        Which services matter most to you?
                      </h3>
                      <p className="text-gray-600 mb-6">Select all that are important (we'll prioritize these in your packages)</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {priorityServiceOptions.map(service => (
                          <button
                            key={service.id}
                            onClick={() => togglePriorityService(service.id)}
                            className={`p-6 rounded-xl border-2 transition-all ${
                              preferences.priorityServices.includes(service.id)
                                ? 'border-pink-500 bg-pink-50 shadow-md'
                                : 'border-gray-200 hover:border-pink-300'
                            }`}
                          >
                            {preferences.priorityServices.includes(service.id) && (
                              <div className="absolute top-2 right-2">
                                <Check className="h-5 w-5 text-pink-600" />
                              </div>
                            )}
                            <div className="text-3xl mb-2">{service.icon}</div>
                            <p className="text-sm font-medium">{service.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Back
                  </button>
                  
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(step => (
                      <div
                        key={step}
                        className={`h-2 w-12 rounded-full transition-all ${
                          step === currentStep
                            ? 'bg-purple-600'
                            : step < currentStep
                            ? 'bg-purple-300'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleContinueToRecommendations}
                    disabled={!isStepValid()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {currentStep === 4 ? 'Show My Packages' : 'Continue'}
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Summary of preferences */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Wedding Vision</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-semibold capitalize">{preferences.weddingType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Budget</p>
                      <p className="font-semibold">₱{preferences.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Guests</p>
                      <p className="font-semibold">{preferences.guestCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Location</p>
                      <p className="font-semibold">{preferences.location}</p>
                    </div>
                  </div>
                </div>

                {/* Sort options */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Recommended Packages ({weddingPackages.length})
                  </h3>
                  <label htmlFor="sort-packages" className="sr-only">Sort Packages By</label>
                  <select
                    id="sort-packages"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'match' | 'price' | 'savings')}
                    title="Sort packages by"
                    aria-label="Sort packages by"
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="match">Best Match</option>
                    <option value="price">Lowest Price</option>
                    <option value="savings">Highest Savings</option>
                  </select>
                </div>

                {/* Packages */}
                <div className="space-y-6">
                  {weddingPackages.map((pkg, index) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className={`bg-gradient-to-r ${pkg.color} text-white p-6`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-2">
                              {pkg.badge}
                            </div>
                            <h4 className="text-2xl font-bold">{pkg.name}</h4>
                            <p className="text-white/90">{pkg.tagline}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="h-5 w-5" />
                              <span className="text-2xl font-bold">{pkg.matchScore}%</span>
                            </div>
                            <p className="text-sm text-white/80">Match Score</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                            <span>{pkg.avgRating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>{pkg.services.length} services</span>
                          </div>
                          <div>
                            {pkg.totalReviews} reviews
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Why recommended */}
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-900 mb-2">Why we recommend this:</h5>
                          <ul className="space-y-1">
                            {pkg.whyRecommended.map((reason, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Services included */}
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-900 mb-2">Included Services:</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {pkg.services.map(service => (
                              <div key={service.id} className="text-sm text-gray-600">
                                • {service.name}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600">Original Price:</span>
                            <span className="text-gray-400 line-through">₱{pkg.totalPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-900 font-semibold">Package Price:</span>
                            <span className="text-2xl font-bold text-purple-600">₱{pkg.discountedPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-green-600 font-semibold">
                            <span>You Save:</span>
                            <span>₱{pkg.savings.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              // Book all services in package
                              pkg.services.forEach(service => onBookService(service.id));
                              onClose();
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${pkg.color} text-white rounded-xl hover:shadow-lg transition-all`}
                          >
                            <Package className="h-5 w-5" />
                            Book Package
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* No Packages */}
                {weddingPackages.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages available</h3>
                    <p className="text-gray-600">Not enough services to create packages</p>
                  </div>
                )}

                {/* Back button */}
                <button
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Edit My Preferences
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
