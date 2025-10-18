import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Star, 
  Calendar,
  DollarSign,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Zap,
  Award,
  Church,
  Palmtree,
  Home,
  Mountain,
  Building2,
  Trees,
  Waves
} from 'lucide-react';
import type { Service } from '../../../../../modules/services/types';

interface IntelligentWeddingPlannerProps {
  services: Service[];
  isOpen: boolean;
  onClose: () => void;
  onBookService: (serviceId: string) => void;
  onMessageVendor: (serviceId: string) => void;
}

// ==================== TYPES & INTERFACES ====================

// Wedding Questionnaire Data Structure
interface WeddingPreferences {
  // Step 1: Wedding Basics
  weddingType: 'traditional' | 'modern' | 'beach' | 'garden' | 'rustic' | 'destination' | 'intimate' | 'grand' | '';
  weddingDate: string;
  guestCount: number;
  
  // Step 2: Budget & Priorities
  budgetRange: 'budget' | 'moderate' | 'upscale' | 'luxury' | '';
  customBudget: number;
  budgetFlexibility: 'strict' | 'flexible' | '';
  servicePriorities: string[]; // Ranked list of services
  
  // Step 3: Wedding Style & Theme
  styles: string[]; // Multi-select: romantic, elegant, rustic, boho, vintage, minimalist, luxurious, eclectic
  colorPalette: string[]; // Selected colors
  atmosphere: 'intimate' | 'festive' | 'formal' | 'casual' | '';
  
  // Step 4: Location & Venue
  locations: string[]; // Philippine regions
  venueTypes: string[]; // Indoor, outdoor, beach, garden, hotel, church, etc.
  venueFeatures: string[]; // Important features (parking, catering, accommodation, etc.)
  
  // Step 5: Must-Have Services
  mustHaveServices: string[]; // Photography, catering, venue, etc.
  servicePreferences: {
    [key: string]: 'basic' | 'premium' | 'luxury' | '';
  };
  
  // Step 6: Special Requirements
  dietaryConsiderations: string[];
  accessibilityNeeds: string[];
  culturalRequirements: string[];
  additionalServices: string[];
  specialNotes: string;
}

// Package Types
interface WeddingPackage {
  id: string;
  tier: 'essential' | 'deluxe' | 'premium';
  name: string;
  tagline: string;
  description: string;
  services: PackageService[];
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  discountPercentage: number;
  matchScore: number;
  matchPercentage: number;
  reasons: string[];
  highlights: string[];
}

interface PackageService {
  service: Service;
  category: string;
  matchScore: number;
  matchReasons: string[];
}

// ==================== MAIN COMPONENT ====================

export function IntelligentWeddingPlanner({
  services,
  isOpen,
  onClose,
  onBookService,
  onMessageVendor
}: IntelligentWeddingPlannerProps) {
  // State Management
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [preferences, setPreferences] = useState<WeddingPreferences>({
    weddingType: '',
    weddingDate: '',
    guestCount: 100,
    budgetRange: '',
    customBudget: 0,
    budgetFlexibility: '',
    servicePriorities: [],
    styles: [],
    colorPalette: [],
    atmosphere: '',
    locations: [],
    venueTypes: [],
    venueFeatures: [],
    mustHaveServices: [],
    servicePreferences: {},
    dietaryConsiderations: [],
    accessibilityNeeds: [],
    culturalRequirements: [],
    additionalServices: [],
    specialNotes: ''
  });

  const totalSteps = 6;

  // ==================== HANDLERS ====================

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Scroll to top when changing steps
      setTimeout(() => {
        const contentArea = document.querySelector('.dss-content-area');
        if (contentArea) {
          contentArea.scrollTop = 0;
        }
      }, 100);
    } else {
      // Generate recommendations
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top when changing steps
      setTimeout(() => {
        const contentArea = document.querySelector('.dss-content-area');
        if (contentArea) {
          contentArea.scrollTop = 0;
        }
      }, 100);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setShowResults(false);
    setPreferences({
      weddingType: '',
      weddingDate: '',
      guestCount: 100,
      budgetRange: '',
      customBudget: 0,
      budgetFlexibility: '',
      servicePriorities: [],
      styles: [],
      colorPalette: [],
      atmosphere: '',
      locations: [],
      venueTypes: [],
      venueFeatures: [],
      mustHaveServices: [],
      servicePreferences: {},
      dietaryConsiderations: [],
      accessibilityNeeds: [],
      culturalRequirements: [],
      additionalServices: [],
      specialNotes: ''
    });
    onClose();
  };

  const updatePreferences = (updates: Partial<WeddingPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  // ==================== MATCHING ALGORITHM ====================

  const generateRecommendations = useMemo(() => {
    if (!showResults) return [];

    // TODO: Implement intelligent matching algorithm
    // This will be implemented in Phase 3
    return [];
  }, [showResults, preferences, services]);

  // ==================== STEP COMPONENTS ====================

  // Step 1: Wedding Basics
  const WeddingBasicsStep = () => {
    const weddingTypes = [
      { value: 'traditional', label: 'Traditional', icon: Church, description: 'Classic church ceremony with formal reception' },
      { value: 'modern', label: 'Modern', icon: Building2, description: 'Contemporary styling with trendy elements' },
      { value: 'beach', label: 'Beach', icon: Waves, description: 'Seaside celebration with ocean views' },
      { value: 'garden', label: 'Garden', icon: Trees, description: 'Outdoor ceremony surrounded by nature' },
      { value: 'rustic', label: 'Rustic', icon: Mountain, description: 'Countryside charm with natural elements' },
      { value: 'destination', label: 'Destination', icon: Palmtree, description: 'Wedding at an exotic location' },
      { value: 'intimate', label: 'Intimate', icon: Heart, description: 'Small gathering with close family and friends' },
      { value: 'grand', label: 'Grand', icon: Sparkles, description: 'Large-scale celebration with hundreds of guests' }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Tell Us About Your Dream Wedding
          </h2>
          <p className="text-gray-600">
            Let's start with the basics to understand your vision
          </p>
        </div>

        {/* Wedding Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            What type of wedding are you planning?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {weddingTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = preferences.weddingType === type.value;
              
              return (
                <motion.button
                  key={type.value}
                  onClick={() => updatePreferences({ weddingType: type.value as any })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative p-4 rounded-2xl border-2 transition-all text-left
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 shadow-lg shadow-pink-100' 
                      : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`
                      p-3 rounded-xl
                      ${isSelected ? 'bg-pink-100' : 'bg-gray-100'}
                    `}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-pink-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className={`font-semibold ${isSelected ? 'text-pink-900' : 'text-gray-900'}`}>
                        {type.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {type.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Guest Count Slider */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            How many guests are you expecting?
          </label>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Guest Count</span>
              <span className="text-2xl font-bold text-pink-600">
                {preferences.guestCount >= 500 ? '500+' : preferences.guestCount}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={preferences.guestCount}
                onChange={(e) => updatePreferences({ guestCount: parseInt(e.target.value) })}
                aria-label="Guest count slider"
                title="Adjust guest count"
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer relative z-10
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-pink-500
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:hover:bg-pink-600
                  [&::-moz-range-thumb]:w-6
                  [&::-moz-range-thumb]:h-6
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-pink-500
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:shadow-lg
                  [&::-moz-range-thumb]:hover:bg-pink-600
                  [&::-webkit-slider-runnable-track]:rounded-lg
                  [&::-moz-range-track]:rounded-lg
                  [&::-webkit-slider-runnable-track]:bg-transparent
                  [&::-moz-range-track]:bg-transparent"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>20</span>
              <span>100</span>
              <span>200</span>
              <span>300</span>
              <span>500+</span>
            </div>
          </div>
        </div>

        {/* Wedding Date - Enhanced Calendar */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            When is your wedding date? (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={preferences.weddingDate}
                onChange={(e) => updatePreferences({ weddingDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                aria-label="Wedding date"
                title="Select your wedding date"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
              />
            </div>
            {preferences.weddingDate && (
              <div className="flex items-center p-3 bg-pink-50 rounded-xl border-2 border-pink-200">
                <div className="flex-1">
                  <div className="text-xs text-gray-600">Selected Date</div>
                  <div className="font-semibold text-pink-900">
                    {new Date(preferences.weddingDate + 'T00:00:00').toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This helps us check vendor availability for your date
          </p>
        </div>
      </div>
    );
  };

  // Step 2: Budget & Priorities
  const BudgetPrioritiesStep = () => {
    const budgetRanges = [
      { value: 'budget', label: 'Budget-Friendly', range: '₱200K - ₱500K', description: 'Essential services, great value' },
      { value: 'moderate', label: 'Moderate', range: '₱500K - ₱1M', description: 'Quality services, balanced budget' },
      { value: 'upscale', label: 'Upscale', range: '₱1M - ₱2M', description: 'Premium services, elevated experience' },
      { value: 'luxury', label: 'Luxury', range: '₱2M+', description: 'Top-tier services, no compromises' }
    ];

    const serviceCategories = [
      { value: 'venue', label: 'Venue', icon: Building2 },
      { value: 'catering', label: 'Catering', icon: DollarSign },
      { value: 'photography', label: 'Photography & Video', icon: Star },
      { value: 'music_dj', label: 'Music & Entertainment', icon: Zap },
      { value: 'flowers_decor', label: 'Flowers & Decor', icon: Heart },
      { value: 'makeup_hair', label: 'Makeup & Hair', icon: Sparkles },
      { value: 'wedding_planning', label: 'Wedding Planner', icon: Award }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Budget & Priorities
          </h2>
          <p className="text-gray-600">
            Help us understand your budget and what matters most
          </p>
        </div>

        {/* Budget Range Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            What's your approximate budget?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetRanges.map((budget) => {
              const isSelected = preferences.budgetRange === budget.value;
              
              return (
                <motion.button
                  key={budget.value}
                  onClick={() => updatePreferences({ budgetRange: budget.value as any })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative p-5 rounded-2xl border-2 transition-all text-left
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 shadow-lg shadow-pink-100' 
                      : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                    }
                  `}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-lg ${isSelected ? 'text-pink-900' : 'text-gray-900'}`}>
                        {budget.label}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                    <div className={`text-xl font-semibold ${isSelected ? 'text-pink-700' : 'text-gray-700'}`}>
                      {budget.range}
                    </div>
                    <div className="text-sm text-gray-600">
                      {budget.description}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Custom Budget Input (if needed) */}
        {preferences.budgetRange && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-gray-900">
              Or enter your exact budget (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                ₱
              </span>
              <input
                type="number"
                value={preferences.customBudget || ''}
                onChange={(e) => updatePreferences({ customBudget: parseInt(e.target.value) || 0 })}
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                placeholder="e.g., 750000"
              />
            </div>
          </motion.div>
        )}

        {/* Budget Flexibility */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            How flexible is your budget?
          </label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'strict', label: 'Strict Budget', description: 'Must stay within budget' },
              { value: 'flexible', label: 'Flexible', description: 'Can adjust for great services' }
            ].map((flex) => {
              const isSelected = preferences.budgetFlexibility === flex.value;
              
              return (
                <motion.button
                  key={flex.value}
                  onClick={() => updatePreferences({ budgetFlexibility: flex.value as any })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-center
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 bg-white hover:border-pink-300'
                    }
                  `}
                >
                  <div className="font-semibold text-gray-900">{flex.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{flex.description}</div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-pink-500 mx-auto mt-2" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Service Priorities - Drag to Rank */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Rank your service priorities (most important first)
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop to reorder, or click to select/deselect
          </p>
          <div className="space-y-2">
            {serviceCategories.map((category) => {
              const Icon = category.icon;
              const isSelected = preferences.servicePriorities.includes(category.value);
              const priority = preferences.servicePriorities.indexOf(category.value) + 1;
              
              return (
                <motion.button
                  key={category.value}
                  onClick={() => {
                    if (isSelected) {
                      updatePreferences({
                        servicePriorities: preferences.servicePriorities.filter(p => p !== category.value)
                      });
                    } else {
                      updatePreferences({
                        servicePriorities: [...preferences.servicePriorities, category.value]
                      });
                    }
                  }}
                  whileHover={{ scale: 1.01 }}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 bg-white hover:border-pink-300'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    {isSelected && (
                      <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                        {priority}
                      </div>
                    )}
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-pink-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                      {category.label}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-pink-500" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Step 3: Wedding Style & Theme
  const WeddingStyleStep = () => {
    const styles = [
      { value: 'romantic', label: 'Romantic', emoji: '💕', description: 'Soft, dreamy, and elegant' },
      { value: 'elegant', label: 'Elegant', emoji: '✨', description: 'Sophisticated and refined' },
      { value: 'rustic', label: 'Rustic', emoji: '🌾', description: 'Natural and countryside charm' },
      { value: 'boho', label: 'Bohemian', emoji: '🌸', description: 'Free-spirited and artistic' },
      { value: 'vintage', label: 'Vintage', emoji: '🎞️', description: 'Classic and timeless' },
      { value: 'minimalist', label: 'Minimalist', emoji: '⚪', description: 'Clean and modern simplicity' },
      { value: 'luxurious', label: 'Luxurious', emoji: '👑', description: 'Opulent and grand' },
      { value: 'eclectic', label: 'Eclectic', emoji: '🎨', description: 'Mix of unique styles' }
    ];

    const colorPalettes = [
      { name: 'Blush & Gold', colors: ['#FFC0CB', '#FFD700', '#FFFFFF'] },
      { name: 'Navy & Burgundy', colors: ['#000080', '#800020', '#C0C0C0'] },
      { name: 'Sage & Ivory', colors: ['#9DC183', '#FFFFF0', '#D4AF37'] },
      { name: 'Lavender & Gray', colors: ['#E6E6FA', '#808080', '#FFFFFF'] },
      { name: 'Coral & Teal', colors: ['#FF7F50', '#008080', '#FFFAF0'] },
      { name: 'Black & White', colors: ['#000000', '#FFFFFF', '#C0C0C0'] }
    ];

    const atmospheres = [
      { value: 'intimate', label: 'Intimate & Cozy', description: 'Warm and personal' },
      { value: 'festive', label: 'Festive & Lively', description: 'Fun and energetic' },
      { value: 'formal', label: 'Formal & Elegant', description: 'Traditional and dignified' },
      { value: 'casual', label: 'Casual & Relaxed', description: 'Easy-going and comfortable' }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Wedding Style & Theme
          </h2>
          <p className="text-gray-600">
            Express your personal style and create your dream atmosphere
          </p>
        </div>

        {/* Style Selection - Multi-select */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Choose your wedding style(s) (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {styles.map((style) => {
              const isSelected = preferences.styles.includes(style.value);
              
              return (
                <motion.button
                  key={style.value}
                  onClick={() => {
                    if (isSelected) {
                      updatePreferences({
                        styles: preferences.styles.filter(s => s !== style.value)
                      });
                    } else {
                      updatePreferences({
                        styles: [...preferences.styles, style.value]
                      });
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all text-center
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 shadow-lg' 
                      : 'border-gray-200 bg-white hover:border-pink-300'
                    }
                  `}
                >
                  <div className="text-3xl mb-2">{style.emoji}</div>
                  <div className={`font-semibold mb-1 ${isSelected ? 'text-pink-900' : 'text-gray-900'}`}>
                    {style.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {style.description}
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Color Palette Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Select your color palette
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {colorPalettes.map((palette) => {
              const isSelected = preferences.colorPalette.length > 0 && 
                preferences.colorPalette.every(color => palette.colors.includes(color));
              
              return (
                <motion.button
                  key={palette.name}
                  onClick={() => updatePreferences({ colorPalette: palette.colors })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 bg-white hover:border-pink-300'
                    }
                  `}
                >
                  <div className="flex justify-center space-x-2 mb-3">
                    {palette.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className={`w-10 h-10 rounded-full border-2 border-gray-200`}
                        style={{ backgroundColor: color }}
                        aria-label={`Color ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {palette.name}
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Atmosphere Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            What atmosphere do you want to create?
          </label>
          <div className="grid grid-cols-2 gap-4">
            {atmospheres.map((atm) => {
              const isSelected = preferences.atmosphere === atm.value;
              
              return (
                <motion.button
                  key={atm.value}
                  onClick={() => updatePreferences({ atmosphere: atm.value as any })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    p-5 rounded-xl border-2 transition-all text-left
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 bg-white hover:border-pink-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`font-bold ${isSelected ? 'text-pink-900' : 'text-gray-900'}`}>
                      {atm.label}
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-pink-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {atm.description}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Step 4: Location & Venue
  const LocationVenueStep = () => {
    const regions = [
      'Metro Manila', 'Cavite', 'Laguna', 'Batangas', 'Rizal', 'Bulacan', 
      'Pampanga', 'Bataan', 'Zambales', 'Tarlac', 'Pangasinan', 'Baguio',
      'Cebu', 'Bohol', 'Iloilo', 'Boracay', 'Palawan', 'Davao'
    ];

    const venueTypes = [
      { value: 'indoor', label: 'Indoor Venue', icon: Building2 },
      { value: 'outdoor', label: 'Outdoor Venue', icon: Trees },
      { value: 'beach', label: 'Beach', icon: Waves },
      { value: 'garden', label: 'Garden', icon: Trees },
      { value: 'hotel', label: 'Hotel Ballroom', icon: Building2 },
      { value: 'church', label: 'Church', icon: Church },
      { value: 'villa', label: 'Private Villa', icon: Home },
      { value: 'resort', label: 'Resort', icon: Palmtree }
    ];

    const venueFeatures = [
      'On-site Catering', 'Parking Space', 'Accommodation', 'Air Conditioning',
      'Backup Venue', 'Sound System', 'Bridal Suite', 'AV Equipment'
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Location & Venue
          </h2>
          <p className="text-gray-600">
            Where would you like to celebrate your special day?
          </p>
        </div>

        {/* Location Multi-select */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Preferred locations (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {regions.map((region) => {
              const isSelected = preferences.locations.includes(region);
              
              return (
                <motion.button
                  key={region}
                  onClick={() => {
                    if (isSelected) {
                      updatePreferences({
                        locations: preferences.locations.filter(l => l !== region)
                      });
                    } else {
                      updatePreferences({
                        locations: [...preferences.locations, region]
                      });
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm font-medium
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 text-pink-900' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{region}</span>
                    {isSelected && <Check className="w-4 h-4 text-pink-500 ml-2" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Venue Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Venue type preferences
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {venueTypes.map((venue) => {
              const Icon = venue.icon;
              const isSelected = preferences.venueTypes.includes(venue.value);
              
              return (
                <motion.button
                  key={venue.value}
                  onClick={() => {
                    if (isSelected) {
                      updatePreferences({
                        venueTypes: preferences.venueTypes.filter(v => v !== venue.value)
                      });
                    } else {
                      updatePreferences({
                        venueTypes: [...preferences.venueTypes, venue.value]
                      });
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all text-center
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 bg-white hover:border-pink-300'
                    }
                  `}
                >
                  <div className={`
                    p-3 rounded-xl mx-auto w-fit mb-2
                    ${isSelected ? 'bg-pink-100' : 'bg-gray-100'}
                  `}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-pink-600' : 'text-gray-600'}`} />
                  </div>
                  <div className={`text-sm font-semibold ${isSelected ? 'text-pink-900' : 'text-gray-900'}`}>
                    {venue.label}
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Important Venue Features */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Important venue features
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {venueFeatures.map((feature) => {
              const isSelected = preferences.venueFeatures.includes(feature);
              
              return (
                <motion.button
                  key={feature}
                  onClick={() => {
                    if (isSelected) {
                      updatePreferences({
                        venueFeatures: preferences.venueFeatures.filter(f => f !== feature)
                      });
                    } else {
                      updatePreferences({
                        venueFeatures: [...preferences.venueFeatures, feature]
                      });
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 text-pink-900 font-semibold' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{feature}</span>
                    {isSelected && <Check className="w-4 h-4 text-pink-500 ml-2" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Step 5: Must-Have Services
  const MustHaveServicesStep = () => {
    const serviceCategories = [
      { value: 'photography', label: 'Photography', description: 'Professional photos' },
      { value: 'videography', label: 'Videography', description: 'Video coverage' },
      { value: 'catering', label: 'Catering', description: 'Food & beverages' },
      { value: 'venue', label: 'Venue', description: 'Ceremony & reception' },
      { value: 'music_dj', label: 'Music & DJ', description: 'Entertainment' },
      { value: 'flowers_decor', label: 'Flowers & Decor', description: 'Floral arrangements' },
      { value: 'wedding_planning', label: 'Wedding Planner', description: 'Coordination' },
      { value: 'makeup_hair', label: 'Makeup & Hair', description: 'Beauty services' },
      { value: 'wedding_cake', label: 'Wedding Cake', description: 'Custom cake' },
      { value: 'transportation', label: 'Transportation', description: 'Bridal car' },
      { value: 'lighting', label: 'Lighting', description: 'Event lighting' },
      { value: 'entertainment', label: 'Entertainment', description: 'Performers' },
      { value: 'officiant', label: 'Officiant', description: 'Ceremony leader' },
      { value: 'invitations', label: 'Invitations', description: 'Custom designs' },
      { value: 'favors', label: 'Wedding Favors', description: 'Guest gifts' }
    ];

    const serviceTiers = ['basic', 'premium', 'luxury'];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Must-Have Services
          </h2>
          <p className="text-gray-600">
            Select the services essential for your wedding
          </p>
        </div>

        {/* Quick Select Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => {
              const essentials = ['venue', 'catering', 'photography', 'music_dj', 'flowers_decor'];
              updatePreferences({ mustHaveServices: essentials });
            }}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            ⚡ Select All Essentials
          </button>
        </div>

        {/* Service Selection Grid */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Select your must-have services
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {serviceCategories.map((service) => {
              const isSelected = preferences.mustHaveServices.includes(service.value);
              const servicePref = preferences.servicePreferences[service.value] || '';
              
              return (
                <motion.div
                  key={service.value}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    rounded-xl border-2 transition-all overflow-hidden min-h-[140px] flex flex-col
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 bg-white hover:border-pink-300'
                    }
                  `}
                >
                  <button
                    onClick={() => {
                      if (isSelected) {
                        updatePreferences({
                          mustHaveServices: preferences.mustHaveServices.filter(s => s !== service.value)
                        });
                      } else {
                        updatePreferences({
                          mustHaveServices: [...preferences.mustHaveServices, service.value]
                        });
                      }
                    }}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold ${isSelected ? 'text-pink-900' : 'text-gray-900'}`}>
                        {service.label}
                      </span>
                      {isSelected && (
                        <Check className="w-5 h-5 text-pink-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {service.description}
                    </div>
                  </button>

                  {/* Service Tier Selection (only if selected) */}
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-pink-200 bg-white p-3"
                    >
                      <div className="text-xs font-semibold text-gray-700 mb-2">
                        Preference:
                      </div>
                      <div className="flex gap-2">
                        {serviceTiers.map((tier) => (
                          <button
                            key={tier}
                            onClick={() => {
                              updatePreferences({
                                servicePreferences: {
                                  ...preferences.servicePreferences,
                                  [service.value]: tier as any
                                }
                              });
                            }}
                            className={`
                              flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all
                              ${servicePref === tier
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }
                            `}
                          >
                            {tier.charAt(0).toUpperCase() + tier.slice(1)}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Step 6: Special Requirements
  const SpecialRequirementsStep = () => {
    const dietaryOptions = [
      'Vegetarian Options', 'Vegan Options', 'Halal', 'Kosher', 
      'Gluten-Free', 'Nut-Free', 'Dairy-Free', 'No Dietary Restrictions'
    ];

    const accessibilityOptions = [
      'Wheelchair Accessible', 'Ramp Access', 'Accessible Restrooms',
      'Sign Language Interpreter', 'Large Print Materials', 'Hearing Loop System'
    ];

    const culturalOptions = [
      'Catholic Ceremony', 'Christian Ceremony', 'Muslim Ceremony',
      'Hindu Ceremony', 'Buddhist Ceremony', 'Jewish Ceremony',
      'Civil Ceremony', 'Non-Religious Ceremony'
    ];

    const additionalOptions = [
      'Photo Booth', 'Live Band', 'Fireworks', 'Dove Release',
      'Bubble Exit', 'Sparkler Send-off', 'Cigar Bar', 'Wine Tasting',
      'Kids Entertainment', 'Valet Parking', 'Shuttle Service', 'Live Streaming'
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Special Requirements
          </h2>
          <p className="text-gray-600">
            Let us know about any special needs or preferences
          </p>
        </div>

        {/* Dietary Considerations */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Dietary considerations
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dietaryOptions.map((option) => {
              const isSelected = preferences.dietaryConsiderations.includes(option);
              
              return (
                <motion.button
                  key={option}
                  onClick={() => {
                    if (isSelected) {
                      updatePreferences({
                        dietaryConsiderations: preferences.dietaryConsiderations.filter(d => d !== option)
                      });
                    } else {
                      updatePreferences({
                        dietaryConsiderations: [...preferences.dietaryConsiderations, option]
                      });
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 text-pink-900 font-semibold' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                    }
                  `}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Accessibility Needs */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Accessibility needs
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {accessibilityOptions.map((option) => {
              const isSelected = preferences.accessibilityNeeds.includes(option);
              
              return (
                <motion.button
                  key={option}
                  onClick={() => {
                    if (isSelected) {
                      updatePreferences({
                        accessibilityNeeds: preferences.accessibilityNeeds.filter(a => a !== option)
                      });
                    } else {
                      updatePreferences({
                        accessibilityNeeds: [...preferences.accessibilityNeeds, option]
                      });
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 text-pink-900 font-semibold' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                    }
                  `}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Cultural/Religious Requirements - Single Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Cultural or religious preference (Select one)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {culturalOptions.map((option) => {
              const isSelected = preferences.culturalRequirements.includes(option);
              
              return (
                <motion.button
                  key={option}
                  onClick={() => {
                    // Single select - replace the array with just this option
                    if (isSelected) {
                      updatePreferences({
                        culturalRequirements: []
                      });
                    } else {
                      updatePreferences({
                        culturalRequirements: [option]
                      });
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 text-pink-900 font-semibold' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                    }
                  `}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Additional Services */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Additional services (optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {additionalOptions.map((option) => {
              const isSelected = preferences.additionalServices.includes(option);
              
              return (
                <motion.button
                  key={option}
                  onClick={() => {
                    if (isSelected) {
                      updatePreferences({
                        additionalServices: preferences.additionalServices.filter(a => a !== option)
                      });
                    } else {
                      updatePreferences({
                        additionalServices: [...preferences.additionalServices, option]
                      });
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 text-pink-900 font-semibold' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                    }
                  `}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Special Notes */}
        <div>
          <label htmlFor="special-notes" className="block text-sm font-semibold text-gray-900 mb-4">
            Any other special requests or notes?
          </label>
          <textarea
            id="special-notes"
            value={preferences.specialNotes}
            onChange={(e) => updatePreferences({ specialNotes: e.target.value })}
            onFocus={(e) => {
              // Prevent any auto-scroll behavior
              e.preventDefault();
            }}
            rows={4}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all resize-none"
            placeholder="Tell us anything else we should know about your dream wedding..."
          />
        </div>
      </div>
    );
  };

  // ==================== RENDER STEP ====================

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WeddingBasicsStep />;
      case 2:
        return <BudgetPrioritiesStep />;
      case 3:
        return <WeddingStyleStep />;
      case 4:
        return <LocationVenueStep />;
      case 5:
        return <MustHaveServicesStep />;
      case 6:
        return <SpecialRequirementsStep />;
      default:
        return null;
    }
  };

  // ==================== PROGRESS BAR ====================

  const progressPercentage = (currentStep / totalSteps) * 100;

  // ==================== MAIN RENDER ====================

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-pink-50 via-white to-pink-50 px-8 py-6 border-b border-gray-200">
            <button
              onClick={handleClose}
              aria-label="Close wedding planner"
              className="absolute top-6 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Intelligent Wedding Planner
                </h1>
                <p className="text-sm text-gray-600">
                  Step {currentStep} of {totalSteps}: {
                    currentStep === 1 ? 'Wedding Basics' :
                    currentStep === 2 ? 'Budget & Priorities' :
                    currentStep === 3 ? 'Wedding Style & Theme' :
                    currentStep === 4 ? 'Location & Venue' :
                    currentStep === 5 ? 'Must-Have Services' :
                    'Special Requirements'
                  }
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
              />
            </div>
            <div className="flex justify-between mt-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`text-xs font-medium transition-colors ${
                    i + 1 <= currentStep ? 'text-pink-600' : 'text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 dss-content-area">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all
                ${currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:shadow-md'
                }
              `}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Save & Exit
              </button>
              
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                <span>{currentStep === totalSteps ? 'Generate Recommendations' : 'Next'}</span>
                {currentStep === totalSteps ? (
                  <Sparkles className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
