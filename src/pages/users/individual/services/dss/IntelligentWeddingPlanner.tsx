import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Star, 
  MapPin, 
  Calendar,
  Users,
  DollarSign,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Package,
  TrendingUp,
  Zap,
  Award,
  Filter
} from 'lucide-react';
import type { Service } from '../../../../../modules/services/types';

interface IntelligentWeddingPlannerProps {
  services: Service[];
  isOpen: boolean;
  onClose: () => void;
  onBookService: (serviceId: string) => void;
  onMessageVendor: (serviceId: string) => void;
}

// Wedding Questionnaire Types
interface WeddingPreferences {
  // Step 1: Wedding Basics
  weddingType: 'traditional' | 'modern' | 'destination' | 'elopement' | 'garden' | 'beach' | '';
  theme: 'romantic' | 'rustic' | 'elegant' | 'boho' | 'vintage' | 'minimalist' | 'luxurious' | '';
  
  // Step 2: Budget & Scale
  budget: number;
  guestCount: number;
  
  // Step 3: Date & Location
  weddingDate: string;
  location: string;
  venueType: 'indoor' | 'outdoor' | 'mixed' | '';
  
  // Step 4: Service Priorities
  mustHaveServices: string[];
  servicePreferences: {
    photography: 'basic' | 'premium' | 'luxury' | '';
    catering: 'buffet' | 'plated' | 'cocktail' | 'mixed' | '';
    entertainment: 'dj' | 'band' | 'both' | 'none' | '';
    florals: 'minimal' | 'moderate' | 'extravagant' | '';
  };
  
  // Step 5: Special Requirements
  dietaryRestrictions: string[];
  accessibility: boolean;
  culturalRequirements: string[];
  specialRequests: string;
}

interface RecommendedPackage {
  id: string;
  name: string;
  tier: 'essential' | 'deluxe' | 'premium';
  matchScore: number;
  services: Service[];
  totalPrice: number;
  discountedPrice: number;
  savings: number;
  highlights: string[];
  whyRecommended: string[];
}

export function IntelligentWeddingPlanner({ 
  services, 
  isOpen, 
  onClose, 
  onBookService,
  onMessageVendor 
}: IntelligentWeddingPlannerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'price' | 'savings'>('match');
  
  const [preferences, setPreferences] = useState<WeddingPreferences>({
    weddingType: '',
    theme: '',
    budget: 100000,
    guestCount: 100,
    weddingDate: '',
    location: '',
    venueType: '',
    mustHaveServices: [],
    servicePreferences: {
      photography: '',
      catering: '',
      entertainment: '',
      florals: ''
    },
    dietaryRestrictions: [],
    accessibility: false,
    culturalRequirements: [],
    specialRequests: ''
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Generate intelligent package recommendations based on preferences
  const recommendedPackages = useMemo(() => {
    if (!showResults) return [];

    // Calculate match scores based on preferences
    const calculateMatchScore = (service: Service): number => {
      let score = 0;
      
      // Budget matching (40%)
      if (service.basePrice) {
        const budgetPerService = preferences.budget / Math.max(preferences.mustHaveServices.length, 5);
        const priceDiff = Math.abs(service.basePrice - budgetPerService);
        const budgetScore = Math.max(0, 100 - (priceDiff / budgetPerService) * 100);
        score += budgetScore * 0.4;
      }
      
      // Location matching (20%)
      if (preferences.location && service.location) {
        if (service.location.toLowerCase().includes(preferences.location.toLowerCase())) {
          score += 20;
        }
      }
      
      // Rating & Reviews (20%)
      score += (service.rating / 5) * 15;
      score += Math.min(service.reviewCount / 50, 1) * 5;
      
      // Category priority (20%)
      if (preferences.mustHaveServices.includes(service.category)) {
        score += 20;
      }
      
      return Math.min(score, 100);
    };

    // Group services by category and select top-rated ones
    const servicesByCategory = services.reduce((acc, service) => {
      const category = service.category;
      if (!acc[category]) acc[category] = [];
      
      const matchScore = calculateMatchScore(service);
      acc[category].push({ ...service, matchScore });
      return acc;
    }, {} as Record<string, (Service & { matchScore: number })[]>);

    // Sort each category by match score
    Object.keys(servicesByCategory).forEach(category => {
      servicesByCategory[category].sort((a, b) => b.matchScore - a.matchScore);
    });

    // Create three package tiers
    const packages: RecommendedPackage[] = [];

    // Essential Package (Budget-friendly)
    const essentialServices: Service[] = [];
    let essentialTotal = 0;
    
    ['photography', 'catering', 'venue', 'music_dj'].forEach(category => {
      const categoryServices = servicesByCategory[category]?.filter(s => s.basePrice && s.basePrice < preferences.budget * 0.15);
      if (categoryServices && categoryServices.length > 0) {
        const selected = categoryServices[0];
        essentialServices.push(selected);
        essentialTotal += selected.basePrice || 0;
      }
    });

    if (essentialServices.length >= 3) {
      const essentialDiscount = essentialTotal * 0.1;
      packages.push({
        id: 'essential',
        name: 'Essential Wedding Package',
        tier: 'essential',
        matchScore: essentialServices.reduce((sum, s: any) => sum + (s.matchScore || 0), 0) / essentialServices.length,
        services: essentialServices,
        totalPrice: essentialTotal,
        discountedPrice: essentialTotal - essentialDiscount,
        savings: essentialDiscount,
        highlights: [
          'Perfect for intimate weddings',
          'Core services included',
          '10% bundle savings',
          `Fits ${Math.round(preferences.guestCount * 0.7)}-${preferences.guestCount} guests`
        ],
        whyRecommended: [
          `Matches your ${preferences.weddingType || 'wedding'} style`,
          'Top-rated vendors in your budget',
          `Covers your must-have services`,
          preferences.location ? `Available in ${preferences.location}` : 'Available in your area'
        ]
      });
    }

    // Deluxe Package (Mid-range, most popular)
    const deluxeServices: Service[] = [];
    let deluxeTotal = 0;
    
    ['photography', 'videography', 'catering', 'venue', 'flowers_decor', 'music_dj'].forEach(category => {
      const categoryServices = servicesByCategory[category]?.filter(s => 
        s.basePrice && s.basePrice >= preferences.budget * 0.1 && s.basePrice <= preferences.budget * 0.25
      );
      if (categoryServices && categoryServices.length > 0) {
        const selected = categoryServices[0];
        deluxeServices.push(selected);
        deluxeTotal += selected.basePrice || 0;
      }
    });

    if (deluxeServices.length >= 4) {
      const deluxeDiscount = deluxeTotal * 0.15;
      packages.push({
        id: 'deluxe',
        name: 'Deluxe Wedding Package',
        tier: 'deluxe',
        matchScore: deluxeServices.reduce((sum, s: any) => sum + (s.matchScore || 0), 0) / deluxeServices.length,
        services: deluxeServices,
        totalPrice: deluxeTotal,
        discountedPrice: deluxeTotal - deluxeDiscount,
        savings: deluxeDiscount,
        highlights: [
          'Most popular choice',
          'Enhanced vendor selection',
          '15% bundle savings',
          `Perfect for ${preferences.guestCount} guests`,
          `${preferences.theme || 'Beautiful'} styling included`
        ],
        whyRecommended: [
          `Ideal for your ${preferences.weddingType || 'dream'} wedding`,
          'Premium vendors with excellent reviews',
          `Includes ${deluxeServices.length} essential services`,
          'Best value for your budget'
        ]
      });
    }

    // Premium Package (Luxury)
    const premiumServices: Service[] = [];
    let premiumTotal = 0;
    
    Object.keys(servicesByCategory).forEach(category => {
      const categoryServices = servicesByCategory[category]?.filter(s => 
        s.rating >= 4.5 && s.reviewCount >= 20
      );
      if (categoryServices && categoryServices.length > 0 && premiumServices.length < 8) {
        const selected = categoryServices[0];
        premiumServices.push(selected);
        premiumTotal += selected.basePrice || 0;
      }
    });

    if (premiumServices.length >= 5) {
      const premiumDiscount = premiumTotal * 0.2;
      packages.push({
        id: 'premium',
        name: 'Premium Wedding Package',
        tier: 'premium',
        matchScore: premiumServices.reduce((sum, s: any) => sum + (s.matchScore || 0), 0) / premiumServices.length,
        services: premiumServices,
        totalPrice: premiumTotal,
        discountedPrice: premiumTotal - premiumDiscount,
        savings: premiumDiscount,
        highlights: [
          'Luxury wedding experience',
          'Top-tier vendors only',
          '20% bundle savings',
          `Accommodates ${preferences.guestCount}+ guests`,
          'Complete planning included',
          `${preferences.theme || 'Exquisite'} design & styling`
        ],
        whyRecommended: [
          `Perfect for your ${preferences.weddingType || 'elegant'} celebration`,
          'Award-winning vendors',
          'All-inclusive service',
          'White-glove coordination'
        ]
      });
    }

    // Sort packages by selected criteria
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
  }, [services, preferences, showResults, sortBy]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setShowResults(false);
    setPreferences({
      weddingType: '',
      theme: '',
      budget: 100000,
      guestCount: 100,
      weddingDate: '',
      location: '',
      venueType: '',
      mustHaveServices: [],
      servicePreferences: {
        photography: '',
        catering: '',
        entertainment: '',
        florals: ''
      },
      dietaryRestrictions: [],
      accessibility: false,
      culturalRequirements: [],
      specialRequests: ''
    });
  };

  const updatePreference = <K extends keyof WeddingPreferences>(
    key: K, 
    value: WeddingPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleMustHaveService = (service: string) => {
    setPreferences(prev => ({
      ...prev,
      mustHaveServices: prev.mustHaveServices.includes(service)
        ? prev.mustHaveServices.filter(s => s !== service)
        : [...prev.mustHaveServices, service]
    }));
  };

  const isStepComplete = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!preferences.weddingType && !!preferences.theme;
      case 2:
        return preferences.budget > 0 && preferences.guestCount > 0;
      case 3:
        return !!preferences.weddingDate && !!preferences.location && !!preferences.venueType;
      case 4:
        return preferences.mustHaveServices.length >= 3;
      case 5:
        return true; // Optional step
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8" />
            <h2 className="text-3xl font-bold">Intelligent Wedding Planner</h2>
          </div>
          
          <p className="text-purple-100">
            {showResults 
              ? 'Your Personalized Wedding Packages' 
              : 'Answer a few questions to get personalized recommendations'}
          </p>

          {/* Progress Bar */}
          {!showResults && (
            <div className="mt-6">
              <div className="flex justify-between mb-2 text-sm">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Wedding Basics */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Let's Start with the Basics</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        What type of wedding are you planning?
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { value: 'traditional', label: '💒 Traditional', desc: 'Classic ceremony' },
                          { value: 'modern', label: '✨ Modern', desc: 'Contemporary style' },
                          { value: 'destination', label: '🌴 Destination', desc: 'Travel wedding' },
                          { value: 'elopement', label: '💑 Elopement', desc: 'Intimate celebration' },
                          { value: 'garden', label: '🌸 Garden', desc: 'Outdoor nature' },
                          { value: 'beach', label: '🏖️ Beach', desc: 'Seaside ceremony' }
                        ].map(type => (
                          <button
                            key={type.value}
                            onClick={() => updatePreference('weddingType', type.value as any)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              preferences.weddingType === type.value
                                ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="font-semibold">{type.label}</div>
                            <div className="text-xs text-gray-600 mt-1">{type.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Choose your wedding theme
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { value: 'romantic', label: '💕 Romantic' },
                          { value: 'rustic', label: '🌾 Rustic' },
                          { value: 'elegant', label: '👑 Elegant' },
                          { value: 'boho', label: '🌿 Boho' },
                          { value: 'vintage', label: '📻 Vintage' },
                          { value: 'minimalist', label: '⚪ Minimalist' },
                          { value: 'luxurious', label: '💎 Luxurious' }
                        ].map(theme => (
                          <button
                            key={theme.value}
                            onClick={() => updatePreference('theme', theme.value as any)}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              preferences.theme === theme.value
                                ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="font-semibold text-center">{theme.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Budget & Scale */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Budget & Guest Count</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        What's your total wedding budget?
                      </label>
                      <input
                        type="number"
                        value={preferences.budget}
                        onChange={(e) => updatePreference('budget', Number(e.target.value))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-lg"
                        placeholder="e.g., 150000"
                        min="10000"
                        step="10000"
                      />
                      <div className="mt-3 flex gap-2">
                        {[50000, 100000, 200000, 500000].map(amount => (
                          <button
                            key={amount}
                            onClick={() => updatePreference('budget', amount)}
                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                          >
                            ₱{(amount / 1000).toFixed(0)}K
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Users className="inline h-4 w-4 mr-1" />
                        How many guests are you expecting?
                      </label>
                      <input
                        type="number"
                        value={preferences.guestCount}
                        onChange={(e) => updatePreference('guestCount', Number(e.target.value))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-lg"
                        placeholder="e.g., 100"
                        min="10"
                        max="1000"
                      />
                      <div className="mt-3 flex gap-2">
                        {[50, 100, 150, 200, 300].map(count => (
                          <button
                            key={count}
                            onClick={() => updatePreference('guestCount', count)}
                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Date & Location */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Date & Location</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        When is your wedding date?
                      </label>
                      <input
                        type="date"
                        value={preferences.weddingDate}
                        onChange={(e) => updatePreference('weddingDate', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Where will your wedding take place?
                      </label>
                      <input
                        type="text"
                        value={preferences.location}
                        onChange={(e) => updatePreference('location', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                        placeholder="e.g., Manila, Cebu, Boracay"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Venue preference
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'indoor', label: '🏛️ Indoor', desc: 'Ballroom, Hotel' },
                          { value: 'outdoor', label: '🌳 Outdoor', desc: 'Garden, Beach' },
                          { value: 'mixed', label: '🏰 Mixed', desc: 'Indoor + Outdoor' }
                        ].map(venue => (
                          <button
                            key={venue.value}
                            onClick={() => updatePreference('venueType', venue.value as any)}
                            className={`p-4 rounded-xl border-2 transition-all text-center ${
                              preferences.venueType === venue.value
                                ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="font-semibold">{venue.label}</div>
                            <div className="text-xs text-gray-600 mt-1">{venue.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Service Priorities */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Must-Have Services</h3>
                    <p className="text-gray-600 mb-4">Select at least 3 services you definitely need</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { value: 'photography', label: '📸 Photography', icon: '📸' },
                        { value: 'videography', label: '🎥 Videography', icon: '🎥' },
                        { value: 'catering', label: '🍽️ Catering', icon: '🍽️' },
                        { value: 'venue', label: '🏛️ Venue', icon: '🏛️' },
                        { value: 'flowers_decor', label: '💐 Flowers & Decor', icon: '💐' },
                        { value: 'music_dj', label: '🎵 Music & DJ', icon: '🎵' },
                        { value: 'wedding_planning', label: '📋 Planner', icon: '📋' },
                        { value: 'makeup_hair', label: '💄 Makeup & Hair', icon: '💄' },
                        { value: 'wedding_cake', label: '🎂 Wedding Cake', icon: '🎂' }
                      ].map(service => (
                        <button
                          key={service.value}
                          onClick={() => toggleMustHaveService(service.value)}
                          className={`p-4 rounded-xl border-2 transition-all text-left relative ${
                            preferences.mustHaveServices.includes(service.value)
                              ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          {preferences.mustHaveServices.includes(service.value) && (
                            <Check className="absolute top-2 right-2 h-5 w-5 text-purple-600" />
                          )}
                          <div className="font-semibold">{service.label}</div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                      <p className="text-sm text-purple-900">
                        <strong>Selected: {preferences.mustHaveServices.length} services</strong>
                        {preferences.mustHaveServices.length < 3 && (
                          <span className="text-purple-600"> (Need {3 - preferences.mustHaveServices.length} more)</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 5: Special Requirements */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Special Requirements</h3>
                    <p className="text-gray-600 mb-4">Optional: Any special needs or preferences?</p>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dietary Restrictions
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 'Nut-Free'].map(diet => (
                          <button
                            key={diet}
                            onClick={() => {
                              const current = preferences.dietaryRestrictions;
                              updatePreference(
                                'dietaryRestrictions', 
                                current.includes(diet) 
                                  ? current.filter(d => d !== diet)
                                  : [...current, diet]
                              );
                            }}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${
                              preferences.dietaryRestrictions.includes(diet)
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {diet}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={preferences.accessibility}
                          onChange={(e) => updatePreference('accessibility', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Accessibility requirements (wheelchair access, etc.)
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes or Special Requests
                      </label>
                      <textarea
                        value={preferences.specialRequests}
                        onChange={(e) => updatePreference('specialRequests', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                        rows={4}
                        placeholder="Any other special requirements, cultural needs, or specific requests..."
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Your Perfect Wedding Packages</h3>
                    <p className="text-gray-600 mt-1">
                      Based on your {preferences.weddingType} {preferences.theme} wedding for {preferences.guestCount} guests
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="match">Best Match</option>
                      <option value="price">Lowest Price</option>
                      <option value="savings">Highest Savings</option>
                    </select>
                  </div>
                </div>

                {/* Package Cards */}
                <div className="space-y-4">
                  {recommendedPackages.map((pkg, index) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border-2 rounded-2xl p-6 transition-all cursor-pointer hover:shadow-xl ${
                        pkg.tier === 'deluxe'
                          ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {/* Package Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className={`h-6 w-6 ${
                              pkg.tier === 'essential' ? 'text-green-600' :
                              pkg.tier === 'deluxe' ? 'text-purple-600' :
                              'text-amber-600'
                            }`} />
                            <h4 className="text-xl font-bold text-gray-900">{pkg.name}</h4>
                            {pkg.tier === 'deluxe' && (
                              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                                RECOMMENDED
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              {pkg.matchScore.toFixed(0)}% Match
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-4 w-4" />
                              {pkg.services.length} Services
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="h-4 w-4 text-amber-500" />
                              {(pkg.services.reduce((sum, s) => sum + s.rating, 0) / pkg.services.length).toFixed(1)}★
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 line-through">₱{pkg.totalPrice.toLocaleString()}</div>
                          <div className="text-3xl font-bold text-purple-600">₱{pkg.discountedPrice.toLocaleString()}</div>
                          <div className="text-sm text-green-600 font-semibold">Save ₱{pkg.savings.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Why Recommended */}
                      <div className="mb-4 p-3 bg-white rounded-lg">
                        <h5 className="font-semibold text-gray-900 mb-2">Why this package?</h5>
                        <ul className="space-y-1">
                          {pkg.whyRecommended.map((reason, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Services Included */}
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2">Services Included:</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {pkg.services.map(service => (
                            <div key={service.id} className="flex items-center gap-2 text-sm text-gray-700">
                              <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />
                              <span>{service.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pkg.highlights.map((highlight, i) => (
                          <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {highlight}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            // Book all services in package
                            pkg.services.forEach(service => onBookService(service.id));
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold"
                        >
                          Book This Package
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <button
                          className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-semibold"
                        >
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {recommendedPackages.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages available</h3>
                    <p className="text-gray-600 mb-4">
                      We couldn't create packages matching your exact criteria, but we have many individual services available.
                    </p>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                      Start Over
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          {!showResults ? (
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={!isStepComplete()}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
              >
                {currentStep === totalSteps ? (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Show My Packages
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-6 py-3 text-purple-600 hover:text-purple-700 transition-colors font-semibold"
              >
                ← Start New Search
              </button>
              <div className="text-sm text-gray-600">
                Found {recommendedPackages.length} packages matching your preferences
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
