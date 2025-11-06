// DSS Modal v2.3 - Button Click Fix (2025-01-XX)
// CRITICAL: Removed stopPropagation from modal content div to fix button clicks
// All buttons now use only onClick handlers without preventDefault or stopPropagation

import { useState, useMemo, useCallback, useEffect } from 'react';
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
  Waves,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import type { Service } from '../../../../../modules/services/types';
import { EnhancedMatchingEngine, type SmartPackage as EnhancedSmartPackage } from './EnhancedMatchingEngine';

interface IntelligentWeddingPlannerProps {
  services: Service[];
  isOpen: boolean;
  onClose: () => void;
  onBookService: (serviceId: string) => void;
  onMessageVendor: (serviceId: string) => void;
}

// ==================== HELPER FUNCTIONS ====================

// Helper function to determine which steps are relevant based on selected services
function getRelevantSteps(servicePriorities: string[]): number[] {
  const allSteps = [1, 2, 3, 4, 5, 6];
  
  // If no services selected yet, show all steps
  if (servicePriorities.length === 0) return allSteps;
  
  // Step 1 (Basics) and Step 2 (Budget) are always relevant
  const relevantSteps = [1, 2];
  
  // Check if any venue-related services are selected
  const venueRelatedServices = ['venue', 'catering', 'decoration'];
  const hasVenueServices = servicePriorities.some(s => venueRelatedServices.includes(s));
  
  // Step 3 (Style) is relevant for most services
  const styleRelevantServices = ['venue', 'decoration', 'photography', 'videography', 'florals'];
  if (servicePriorities.some(s => styleRelevantServices.includes(s))) {
    relevantSteps.push(3);
  }
  
  // Step 4 (Location/Venue) is only relevant if venue-related services are selected
  if (hasVenueServices) {
    relevantSteps.push(4);
  }
  
  // Step 5 (Must-Have Services) is always relevant
  relevantSteps.push(5);
  
  // Step 6 (Special Requirements) is only relevant for catering/venue
  if (hasVenueServices) {
    relevantSteps.push(6);
  }
  
  return relevantSteps.sort((a, b) => a - b);
}

// Helper to get category-specific fields to display
function getCategoryRelevantFields(category: string): {
  showVenue: boolean;
  showStyle: boolean;
  showLocation: boolean;
  showDietary: boolean;
  showCultural: boolean;
  showAtmosphere: boolean;
} {
  const venueCategories = ['venue', 'catering', 'decoration'];
  const styleCategories = ['venue', 'decoration', 'photography', 'videography', 'florals'];
  
  return {
    showVenue: venueCategories.includes(category),
    showStyle: styleCategories.includes(category),
    showLocation: true, // Location is always relevant
    showDietary: ['catering'].includes(category),
    showCultural: venueCategories.includes(category),
    showAtmosphere: venueCategories.includes(category)
  };
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

// ==================== CATEGORY ICON MAPPING ====================

// 🔧 FIX: Move categoryIconMap OUTSIDE component to prevent re-creation on every render
const CATEGORY_ICON_MAP: Record<string, any> = {
  'venue': Building2,
  'catering': DollarSign,
  'photography': Star,
  'videography': Star,
  'music_entertainment': Zap,
  'flowers_decor': Heart,
  'beauty_styling': Sparkles,
  'planning_coordination': Award,
  'photo_booth': Star,
  'transportation': Building2,
  'wedding_cake': DollarSign,
  'invitations_stationery': Award
};

// ==================== FALLBACK CATEGORIES ====================

// Fallback categories if API fails
const FALLBACK_CATEGORIES = [
  { id: '1', name: 'photography', display_name: 'Photography', description: 'Professional wedding photography' },
  { id: '2', name: 'videography', display_name: 'Videography', description: 'Wedding video coverage' },
  { id: '3', name: 'catering', display_name: 'Catering', description: 'Food and beverage services' },
  { id: '4', name: 'venue', display_name: 'Venue', description: 'Wedding venues and locations' },
  { id: '5', name: 'music_entertainment', display_name: 'Music & Entertainment', description: 'DJs, bands, performers' },
  { id: '6', name: 'flowers_decor', display_name: 'Flowers & Decor', description: 'Floral arrangements and decorations' },
  { id: '7', name: 'planning_coordination', display_name: 'Planning & Coordination', description: 'Wedding planning services' },
  { id: '8', name: 'beauty_styling', display_name: 'Beauty & Styling', description: 'Makeup, hair, beauty' }
];

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
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<PackageService | null>(null);
  
  // 🆕 Service Categories from Database
  const [serviceCategories, setServiceCategories] = useState<Array<{
    id: string;
    name: string;
    display_name: string;
    description: string;
  }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // 🆕 Pagination for Step 2 Service Priorities (to improve performance)
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(10);
  
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

  // Get relevant steps based on selected services
  const relevantSteps = useMemo(() => 
    getRelevantSteps(preferences.servicePriorities),
    [preferences.servicePriorities]
  );

  // ==================== HANDLERS ====================

  const handleNext = () => {
    const currentIndex = relevantSteps.indexOf(currentStep);
    if (currentIndex < relevantSteps.length - 1) {
      // Move to next relevant step
      setCurrentStep(relevantSteps[currentIndex + 1]);
      // 🆕 Reset pagination when leaving Step 2
      if (currentStep === 2) {
        setVisibleCategoriesCount(10);
      }
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
    const currentIndex = relevantSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      // Move to previous relevant step
      setCurrentStep(relevantSteps[currentIndex - 1]);
      // 🆕 Reset pagination when leaving Step 2
      if (currentStep === 2) {
        setVisibleCategoriesCount(10);
      }
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

  const updatePreferences = useCallback((updates: Partial<WeddingPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  // ==================== FETCH SERVICE CATEGORIES ====================

  // 🆕 Fetch service categories from database when modal opens
  useEffect(() => {
    const fetchCategories = async () => {
      if (!isOpen) return; // Only fetch when modal is open
      
      try {
        console.log('[DSS] Fetching service categories from database...');
        setCategoriesLoading(true);
        
        const API_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
        const response = await fetch(`${API_URL}/api/categories`);
        
        if (!response.ok) {
          console.warn(`[DSS] API returned ${response.status}, using fallback categories`);
          setServiceCategories(FALLBACK_CATEGORIES);
          setCategoriesLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log('[DSS] Raw API response:', data);
        
        // Handle different response formats
        let categories = [];
        if (Array.isArray(data)) {
          categories = data;
        } else if (data.categories && Array.isArray(data.categories)) {
          categories = data.categories;
        } else if (data.data && Array.isArray(data.data)) {
          categories = data.data;
        } else {
          console.warn('[DSS] Unexpected API response format, using fallback');
          setServiceCategories(FALLBACK_CATEGORIES);
          setCategoriesLoading(false);
          return;
        }
        
        console.log('[DSS] Categories array:', categories.length, 'items');
        
        // Map database categories to DSS format
        const mappedCategories = categories.map((cat: any) => ({
          id: cat.id || String(Math.random()),
          name: cat.name || cat.category_name,
          display_name: cat.display_name || cat.name || cat.category_name,
          description: cat.description || `Select ${(cat.display_name || cat.name).toLowerCase()}`
        }));
        
        if (mappedCategories.length > 0) {
          console.log('[DSS] Successfully mapped', mappedCategories.length, 'categories');
          setServiceCategories(mappedCategories);
        } else {
          console.warn('[DSS] No categories found, using fallback');
          setServiceCategories(FALLBACK_CATEGORIES);
        }
      } catch (error) {
        console.error('[DSS] Error fetching categories:', error);
        // Fall back to hardcoded categories if API fails
        console.log('[DSS] Using fallback categories due to error');
        setServiceCategories(FALLBACK_CATEGORIES);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, [isOpen]);

  // ==================== MATCHING ALGORITHM ====================

  // Calculate match score for a service based on preferences
  const calculateServiceMatch = (service: Service): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];
    const maxScore = 100;

    // Category/Service Type Match (20 points)
    if (preferences.mustHaveServices.length > 0) {
      const serviceCategoryMap: Record<string, string[]> = {
        'venue': ['venue', 'wedding_venue', 'event_venue'],
        'catering': ['catering', 'food_beverage'],
        'photography': ['photography', 'photographer'],
        'videography': ['videography', 'video'],
        'music_dj': ['dj', 'music', 'entertainment'],
        'flowers_decor': ['flowers', 'florist', 'decoration', 'decor'],
        'wedding_planning': ['wedding_planner', 'planning', 'coordinator'],
        'makeup_hair': ['makeup', 'hair', 'beauty'],
      };

      for (const [prefCategory, apiCategories] of Object.entries(serviceCategoryMap)) {
        if (preferences.mustHaveServices.includes(prefCategory)) {
          if (apiCategories.some(cat => service.category?.toLowerCase().includes(cat))) {
            score += 20;
            reasons.push(`Matches your must-have: ${prefCategory.replace(/_/g, ' ')}`);
            break;
          }
        }
      }
    }

    // Location Match (15 points)
    if (preferences.locations.length > 0) {
      const serviceLocation = service.location?.toLowerCase() || '';
      const matchesLocation = preferences.locations.some(loc => 
        serviceLocation.includes(loc.toLowerCase())
      );
      if (matchesLocation) {
        score += 15;
        reasons.push('Available in your preferred location');
      }
    }

    // Budget Match (20 points)
    if (preferences.budgetRange || preferences.customBudget > 0) {
      const budgetRanges = {
        'budget': { min: 200000, max: 500000 },
        'moderate': { min: 500000, max: 1000000 },
        'upscale': { min: 1000000, max: 2000000 },
        'luxury': { min: 2000000, max: 10000000 }
      };

      const budgetRange = preferences.budgetRange ? budgetRanges[preferences.budgetRange] : null;
      const servicePrice = service.basePrice || service.minimumPrice || 0;

      if (budgetRange && servicePrice > 0) {
        if (servicePrice >= budgetRange.min && servicePrice <= budgetRange.max) {
          score += 20;
          reasons.push('Within your budget range');
        } else if (preferences.budgetFlexibility === 'flexible') {
          const deviation = Math.abs(servicePrice - budgetRange.max) / budgetRange.max;
          if (deviation <= 0.2) {
            score += 15;
            reasons.push('Close to your budget with flexibility');
          }
        }
      }
    }

    // Rating & Reviews (15 points)
    if (service.rating >= 4.5) {
      score += 15;
      reasons.push(`Highly rated (${service.rating.toFixed(1)}★)`);
    } else if (service.rating >= 4.0) {
      score += 10;
      reasons.push('Well-rated by couples');
    } else if (service.rating >= 3.5) {
      score += 5;
    }

    // Verification Status (10 points)
    if (service.verificationStatus === 'verified') {
      score += 10;
      reasons.push('Verified vendor');
    }

    // Service Tier Preference Match (10 points)
    const serviceCategoryKey = Object.keys(preferences.servicePreferences).find(key => {
      const serviceCat = service.category?.toLowerCase() || '';
      return serviceCat.includes(key.toLowerCase().replace(/_/g, ''));
    });

    if (serviceCategoryKey) {
      const preferredTier = preferences.servicePreferences[serviceCategoryKey];
      if (preferredTier === 'luxury' && service.isPremium) {
        score += 10;
        reasons.push('Premium service matching your luxury preference');
      } else if (preferredTier === 'premium' && (service.isFeatured || service.isPremium)) {
        score += 8;
        reasons.push('Featured service for premium experience');
      } else if (preferredTier === 'basic' && !service.isPremium) {
        score += 10;
        reasons.push('Great value option');
      }
    }

    // Years in Business (5 points)
    if (service.yearsInBusiness && service.yearsInBusiness >= 5) {
      score += 5;
      reasons.push(`${service.yearsInBusiness}+ years of experience`);
    }

    // Availability (5 points)
    if (service.availability) {
      score += 5;
      reasons.push('Currently accepting bookings');
    }

    return { score: Math.min(score, maxScore), reasons };
  };

  // 🆕 Generate wedding packages using PRIORITY-BASED Enhanced Matching Engine
  const generateRecommendations = useMemo(() => {
    if (!showResults) return [];

    // Use EnhancedMatchingEngine for priority-based matching
    try {
      // Create engine instance with preferences and services
      // Note: Service type has minor differences between modules, so we use type coercion
      const engine = new EnhancedMatchingEngine(preferences, services as never);
      
      // Generate smart packages with priority-based matching
      const smartPackages = engine.generateSmartPackages();
      
      // Transform SmartPackage[] to WeddingPackage[] format for UI
      const packages: WeddingPackage[] = smartPackages.map((pkg: EnhancedSmartPackage) => {
        // Extract service matches with proper typing
        const serviceMatches = pkg.services.map((match: unknown) => {
          const m = match as { service: unknown; matchScore: { totalScore: number; reasons: string[] }; category: string };
          return {
            service: m.service as Service,
            category: m.category,
            matchScore: m.matchScore.totalScore,
            matchReasons: m.matchScore.reasons
          };
        });

        return {
          id: pkg.id,
          tier: pkg.tier === 'custom' ? 'premium' : pkg.tier, // Map custom to premium for UI
          name: pkg.name,
          tagline: pkg.tier === 'essential' 
            ? 'Perfect start to your special day'
            : pkg.tier === 'deluxe'
            ? 'Elevated experience with premium touches'
            : pkg.tier === 'premium'
            ? 'Luxury experience with the finest vendors'
            : 'Perfectly customized for your dream wedding',
          description: pkg.matchReasons.join(' • '),
          services: serviceMatches,
          originalPrice: pkg.totalPrice,
          discountedPrice: pkg.discountedPrice,
          savings: pkg.savings,
          discountPercentage: pkg.discountPercentage,
          matchScore: pkg.overallMatchScore,
          matchPercentage: pkg.fulfillmentPercentage,
          reasons: pkg.matchReasons,
          highlights: serviceMatches.slice(0, 3).map(m => m.service.name || 'Service')
        };
      });

      // Log package generation results
      console.log('🎯 Priority-Based Package Generation Results:');
      console.log(`   📦 Generated ${packages.length} packages`);
      console.log(`   ✅ Required categories: ${preferences.mustHaveServices.join(', ')}`);
      packages.forEach(pkg => {
        console.log(`   📋 ${pkg.name}: ${pkg.services.length} services, ${pkg.matchPercentage}% fulfillment`);
      });

      return packages.sort((a, b) => b.matchPercentage - a.matchPercentage);
      
    } catch (error) {
      console.error('❌ Error using EnhancedMatchingEngine:', error);
      console.log('⚠️ Falling back to basic package generation...');
      
      // FALLBACK: Use simple scoring algorithm
      const scoredServices = services
        .map(service => ({
          service,
          ...calculateServiceMatch(service)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

      if (scoredServices.length === 0) return [];

      const essentialServices = scoredServices
        .filter(s => s.service.rating >= 3.5)
        .slice(0, 5);
      
      if (essentialServices.length > 0) {
        const essentialPrice = essentialServices.reduce((sum, s) => 
          sum + (s.service.basePrice || s.service.minimumPrice || 0), 0);
        const discountPercentage = 10;
        const discountedPrice = essentialPrice * (1 - discountPercentage / 100);
        
        return [{
          id: 'essential-fallback',
          tier: 'essential',
          name: 'Essential Package',
          tagline: 'Perfect start to your special day',
          description: 'Budget-friendly wedding essentials with quality vendors.',
          services: essentialServices.map(s => ({
            service: s.service,
            category: s.service.category || 'other',
            matchScore: s.score,
            matchReasons: s.reasons
          })),
          originalPrice: essentialPrice,
          discountedPrice,
          savings: essentialPrice - discountedPrice,
          discountPercentage,
          matchScore: Math.round(essentialServices.reduce((sum, s) => sum + s.score, 0) / essentialServices.length),
          matchPercentage: 75,
          reasons: ['Budget-friendly', 'Well-rated vendors', '10% discount'],
          highlights: essentialServices.slice(0, 3).map(s => s.service.name)
        }];
      }

      return [];
    }
  }, [showResults, preferences, services, calculateServiceMatch]);

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
                <button
                  key={type.value}
                  onClick={() => {
                    updatePreferences({ weddingType: type.value as any });
                  }}
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
                    <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Guest Count - Number Input */}
        <div>
          <label htmlFor="guestCount" className="block text-sm font-semibold text-gray-900 mb-4">
            How many guests are you expecting?
          </label>
          <div className="max-w-md mx-auto">
            <input
              id="guestCount"
              type="number"
              min="20"
              max="500"
              value={preferences.guestCount}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 20;
                const clampedValue = Math.min(Math.max(value, 20), 500);
                updatePreferences({ guestCount: clampedValue });
              }}
              aria-label="Guest count"
              title="Enter number of guests (20-500)"
              placeholder="Enter guest count"
              className="w-full px-4 py-3 text-lg font-semibold text-center border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
              Enter a number between 20 and 500 guests
            </p>
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

    // 🆕 USE CATEGORIES FROM DATABASE (mapped to Step 2 format with icons)
    // 🔧 FIX: Use useMemo with stable reference (CATEGORY_ICON_MAP is now outside component)
    const mappedPriorityCategories = useMemo(() => 
      serviceCategories.map(cat => ({
        value: cat.name,
        label: cat.display_name,
        icon: CATEGORY_ICON_MAP[cat.name] || Building2 // Use constant from outside component
      })),
      [serviceCategories] // Only re-create when serviceCategories changes
    );

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
                <button
                  key={budget.value}
                  type="button"
                  onClick={() => {
                    console.log('[DSS Step 2] Budget button clicked:', budget.value);
                    updatePreferences({ budgetRange: budget.value as any });
                  }}
                  className={
                    isSelected 
                      ? 'relative p-5 rounded-2xl border-2 border-pink-500 bg-pink-50 shadow-lg text-left cursor-pointer' 
                      : 'relative p-5 rounded-2xl border-2 border-gray-200 bg-white text-left cursor-pointer'
                  }
                >
                  <div className="space-y-2 pointer-events-none">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-lg ${isSelected ? 'text-pink-900' : 'text-gray-900'}`}>
                        {budget.label}
                      </span>
                      {isSelected && (
                        <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className={`text-xl font-semibold ${isSelected ? 'text-pink-700' : 'text-gray-700'}`}>
                      {budget.range}
                    </div>
                    <div className="text-sm text-gray-600">
                      {budget.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Budget Input (if needed) */}
        {preferences.budgetRange && (
          <div className="space-y-2 transition-all">
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
          </div>
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
                <button
                  key={flex.value}
                  onClick={() => updatePreferences({ budgetFlexibility: flex.value as any })}
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
                </button>
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
            Click to select/deselect • Selected items will be ranked automatically
          </p>
          
          {/* 🆕 Pagination Info */}
          {mappedPriorityCategories.length > 10 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Showing {Math.min(visibleCategoriesCount, mappedPriorityCategories.length)} of {mappedPriorityCategories.length}</strong> service categories
                {visibleCategoriesCount < mappedPriorityCategories.length && 
                  <span> • Click "Show More" below to see all options</span>
                }
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            {/* 🆕 Limit rendering to visibleCategoriesCount */}
            {mappedPriorityCategories.slice(0, visibleCategoriesCount).map((category) => {
              const Icon = category.icon;
              const isSelected = preferences.servicePriorities.includes(category.value);
              const priority = preferences.servicePriorities.indexOf(category.value) + 1;
              
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    console.log('[DSS Step 2] Category button clicked:', category.label);
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
                  className={
                    isSelected 
                      ? 'w-full p-4 rounded-xl border-2 border-pink-500 bg-pink-50 flex items-center justify-between cursor-pointer' 
                      : 'w-full p-4 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-between cursor-pointer'
                  }
                >
                  <div className="flex items-center space-x-3 pointer-events-none">
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
                </button>
              );
            })}
          </div>
          
          {/* 🆕 Show More Button */}
          {visibleCategoriesCount < mappedPriorityCategories.length && (
            <button
              type="button"
              onClick={() => {
                console.log('[DSS Step 2] Show More clicked - expanding from', visibleCategoriesCount, 'to', mappedPriorityCategories.length);
                setVisibleCategoriesCount(mappedPriorityCategories.length);
              }}
              className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <span>Show All {mappedPriorityCategories.length} Categories</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          
          {/* 🆕 Show Less Button (when expanded) */}
          {visibleCategoriesCount > 10 && visibleCategoriesCount >= mappedPriorityCategories.length && (
            <button
              type="button"
              onClick={() => {
                console.log('[DSS Step 2] Show Less clicked - collapsing to 10');
                setVisibleCategoriesCount(10);
              }}
              className="mt-2 w-full py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
            >
              Show Less
            </button>
          )}
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
                <button
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
                    <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
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
                <button
                  key={palette.name}
                  onClick={() => updatePreferences({ colorPalette: palette.colors })}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 bg-white hover:border-pink-300'
                    }
                  `}
                >
                  <div className="flex justify-center space-x-2 mb-3">
                    {palette.colors.map((color) => (
                      <div
                        key={color}
                        className={`w-10 h-10 rounded-full border-2 border-gray-200`}
                        style={{ backgroundColor: color }}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {palette.name}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
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
                <button
                  key={atm.value}
                  onClick={() => updatePreferences({ atmosphere: atm.value as any })}
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
                </button>
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
                <button
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
                </button>
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
                <button
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
                    <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
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
                <button
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
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Step 5: Must-Have Services
  const MustHaveServicesStep = () => {
    // 🆕 USE CATEGORIES FROM DATABASE (mapped to DSS format)
    const mappedCategories = serviceCategories.map(cat => ({
      value: cat.name, // Use database 'name' field (e.g., 'photography', 'venue')
      label: cat.display_name, // Use 'display_name' for UI (e.g., 'Photography', 'Venue')
      description: cat.description || `Select ${cat.display_name.toLowerCase()}`
    }));

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

        {/* Loading State */}
        {categoriesLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading service categories...</p>
          </div>
        )}

        {/* Content - Only show when not loading */}
        {!categoriesLoading && mappedCategories.length > 0 && (
          <>
            {/* Quick Select Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => {
                  // Select first 5 categories as essentials
                  const essentials = mappedCategories.slice(0, 5).map(c => c.value);
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
                {/* 🆕 Use mapped categories from database */}
                {mappedCategories.map((service) => {
                  const isSelected = preferences.mustHaveServices.includes(service.value);
                  const servicePref = preferences.servicePreferences[service.value] || '';
              
              return (
                <div
                  key={service.value}
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
                    className="w-full p-4 text-left select-none"
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
                    <div className="border-t border-pink-200 bg-white p-3 transition-all">
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
                              flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all select-none
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
                    </div>
                  )}
                </div>
              );
                })}
              </div>
            </div>
          </>
        )}

        {/* Empty State - Show if no categories loaded */}
        {!categoriesLoading && mappedCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No service categories available. Please try again later.</p>
          </div>
        )}
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
                <button
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
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 text-pink-900 font-semibold' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                    }
                  `}
                >
                  {option}
                </button>
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
                <button
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
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 text-pink-900 font-semibold' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                    }
                  `}
                >
                  {option}
                </button>
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
                <button
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
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 text-pink-900 font-semibold' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                    }
                  `}
                >
                  {option}
                </button>
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
                <button
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
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm select-none
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 text-pink-900 font-semibold' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                    }
                  `}
                >
                  {option}
                </button>
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

  // ==================== SERVICE DETAIL MODAL ====================

  const ServiceDetailModal = ({ service, onClose }: { service: PackageService; onClose: () => void }) => {
    const relevantFields = getCategoryRelevantFields(service.category);
    
    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
          style={{ 
            userSelect: 'text', 
            WebkitUserSelect: 'text', 
            MozUserSelect: 'text',
            cursor: 'default'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
            <button
              onClick={onClose}
              aria-label="Close service details"
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <div className="text-sm font-semibold uppercase mb-1 opacity-90">
                  {service.category}
                </div>
                <h2 className="text-2xl font-bold mb-2">{service.service.name}</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-white" />
                    <span className="font-semibold">{service.service.rating}</span>
                  </div>
                  {service.service.verificationStatus === 'verified' && (
                    <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90 mb-1">Match Score</div>
                <div className="text-3xl font-bold">{service.matchScore}%</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">About This Service</h3>
              <p className="text-gray-700">{service.service.description}</p>
            </div>

            {/* Match Reasons */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Why We Recommend This</h3>
              <div className="space-y-2">
                {service.matchReasons.map((reason, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-pink-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Pricing</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  ₱{service.service.basePrice?.toLocaleString() || 'Contact for quote'}
                </span>
                {service.service.isPremium && (
                  <span className="text-sm text-gray-600">· Premium</span>
                )}
              </div>
            </div>

            {/* Category-Specific Information */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 uppercase">Service Details</h3>

              {relevantFields.showLocation && preferences.locations.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Your Preferred Locations</div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.locations.map((location) => (
                      <span key={location} className="px-3 py-1 bg-pink-50 text-pink-700 text-sm rounded-full">
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {relevantFields.showStyle && preferences.styles.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Matches Your Style</div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.styles.map((style) => (
                      <span key={style} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full capitalize">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {relevantFields.showAtmosphere && preferences.atmosphere && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Atmosphere</div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full capitalize">
                    {preferences.atmosphere}
                  </span>
                </div>
              )}

              {relevantFields.showVenue && preferences.venueTypes.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Venue Compatibility</div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.venueTypes.map((type) => (
                      <span key={type} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full capitalize">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {relevantFields.showDietary && preferences.dietaryConsiderations.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Dietary Options</div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.dietaryConsiderations.map((diet) => (
                      <span key={diet} className="px-3 py-1 bg-amber-50 text-amber-700 text-sm rounded-full capitalize">
                        {diet}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {relevantFields.showCultural && preferences.culturalRequirements.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Cultural Preferences</div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.culturalRequirements.map((req) => (
                      <span key={req} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full capitalize">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Budget Information */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Budget Fit</h3>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-700">
                  Your budget: <span className="font-semibold capitalize">{preferences.budgetRange}</span>
                  {preferences.customBudget > 0 && (
                    <span className="text-gray-600"> (₱{preferences.customBudget.toLocaleString()})</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex space-x-3">
            <button
              onClick={() => {
                onBookService(service.service.id);
                onClose();
              }}
              className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Service</span>
            </button>
            <button
              onClick={() => {
                onMessageVendor(service.service.id);
                onClose();
              }}
              className="flex-1 py-3 border-2 border-pink-500 text-pink-600 rounded-xl font-semibold hover:bg-pink-50 transition-all"
            >
              Message Vendor
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RESULTS VIEW ====================

  const ResultsView = () => {
    const packages = generateRecommendations;

    if (packages.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mb-6">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No matches found
            </h3>
            <p className="text-gray-600">
              We couldn't find services matching your preferences. Try adjusting your filters.
            </p>
          </div>
          <button
            onClick={() => {
              setShowResults(false);
              setCurrentStep(1);
            }}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Start Over
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Personalized Wedding Packages
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Based on your preferences, we've created {packages.length} tailored packages from our verified vendors. 
            Each package is designed to match your vision, budget, and style.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg, index) => {
            const tierColors = {
              essential: { from: 'from-blue-500', to: 'to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200' },
              deluxe: { from: 'from-purple-500', to: 'to-pink-500', bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-200' },
              premium: { from: 'from-amber-500', to: 'to-orange-500', bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200' }
            };
            const colors = tierColors[pkg.tier];

            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl border-2 ${colors.border} ${colors.bg} overflow-hidden hover:shadow-xl transition-all`}
              >
                {/* Best Match Badge */}
                {index === 0 && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                      BEST MATCH
                    </div>
                  </div>
                )}

                {/* Package Header */}
                <div className={`p-6 bg-gradient-to-r ${colors.from} ${colors.to} text-white`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{pkg.name}</h3>
                      <p className="text-white/90 text-sm">{pkg.tagline}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-90 mb-1">Match Score</div>
                      <div className="text-2xl font-bold">{pkg.matchPercentage}%</div>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold">
                        ₱{pkg.discountedPrice.toLocaleString()}
                      </span>
                      <span className="text-sm line-through opacity-75">
                        ₱{pkg.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm mt-1 opacity-90">
                      Save ₱{pkg.savings.toLocaleString()} ({pkg.discountPercentage}% off)
                    </div>
                  </div>
                </div>

                {/* Package Content */}
                <div className="p-6 space-y-4">
                  {/* Description */}
                  <p className="text-sm text-gray-700">
                    {pkg.description}
                  </p>

                  {/* Match Reasons */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">
                      Why This Package?
                    </h4>
                    <div className="space-y-1.5">
                      {pkg.reasons.slice(0, 3).map((reason, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
                          <span className="text-xs text-gray-700">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Included Services */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">
                      Included Services ({pkg.services.length})
                    </h4>
                    <div className="space-y-2">
                      {pkg.services.slice(0, 4).map((service, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedServiceDetail(service)}
                          className="w-full flex items-center justify-between text-xs hover:bg-gray-50 p-2 rounded-lg transition-colors text-left"
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className={`w-2 h-2 rounded-full ${colors.from.replace('from-', 'bg-')}`} />
                            <span className="text-gray-800 font-medium truncate">
                              {service.service.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-gray-600">{service.service.rating}</span>
                          </div>
                        </button>
                      ))}
                      {pkg.services.length > 4 && (
                        <div className="text-xs text-gray-500 italic pl-2">
                          +{pkg.services.length - 4} more services (click "View Full Details" to see all)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4">
                    <button
                      onClick={() => {
                        // Show first service for now
                        if (pkg.services.length > 0) {
                          setSelectedServiceDetail(pkg.services[0]);
                        }
                      }}
                      className={`w-full py-3 bg-gradient-to-r ${colors.from} ${colors.to} text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2`}
                    >
                      <span>Select Package</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        // Show first service for now
                        if (pkg.services.length > 0) {
                          setSelectedServiceDetail(pkg.services[0]);
                        }
                      }}
                      className="w-full py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 hover:bg-gray-50 transition-all"
                    >
                      View Service Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Actions */}
        <div className="flex flex-col items-center space-y-4 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Not quite what you're looking for?
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentStep(1);
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:shadow-md transition-all"
            >
              Adjust Preferences
            </button>
            <button
              onClick={() => {
                // TODO: Handle browse all services
                onClose();
              }}
              className="px-6 py-3 bg-white border-2 border-pink-500 text-pink-600 rounded-xl font-semibold hover:bg-pink-50 transition-all"
            >
              Browse All Services
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDER STEP ====================

  // 🔧 FIX: Memoize the rendered step to prevent unnecessary re-renders that cause button flickering
  const renderedStep = useMemo(() => {
    if (showResults) {
      return <ResultsView />;
    }

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
  }, [currentStep, showResults, preferences, serviceCategories, categoriesLoading, visibleCategoriesCount]);

  // ==================== PROGRESS BAR ====================

  const currentStepIndex = relevantSteps.indexOf(currentStep);
  const progressPercentage = ((currentStepIndex + 1) / relevantSteps.length) * 100;

  // ==================== MAIN RENDER ====================

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay - NO userSelect prevention here to allow input field interaction */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          // Only close if clicking directly on the overlay (not bubbled from children)
          if (e.target === e.currentTarget) {
            console.log('[DSS Modal] Overlay clicked - closing');
            handleClose();
          }
        }}
        style={{ cursor: 'default' }}
      >
        {/* Modal Content */}
        <div
          className={`relative w-full ${showResults ? 'max-w-6xl' : 'max-w-4xl'} max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all`}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-pink-50 via-white to-pink-50 px-8 py-6 border-b border-gray-200">
            <button
              onClick={handleClose}
              aria-label="Close wedding planner"
              className="absolute top-6 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors z-10 select-none"
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
                  {showResults ? (
                    'Your Personalized Recommendations'
                  ) : (
                    `Step ${currentStepIndex + 1} of ${relevantSteps.length}: ${
                      currentStep === 1 ? 'Wedding Basics' :
                      currentStep === 2 ? 'Budget & Priorities' :
                      currentStep === 3 ? 'Wedding Style & Theme' :
                      currentStep === 4 ? 'Location & Venue' :
                      currentStep === 5 ? 'Must-Have Services' :
                      'Special Requirements'
                    }`
                  )}
                </p>
              </div>
            </div>

            {/* Progress Bar - Only show during questionnaire */}
            {!showResults && (
              <>
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progressPercentage}%` }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  {relevantSteps.map((step, index) => (
                    <div
                      key={step}
                      className={`text-xs font-medium transition-colors ${
                        index <= currentStepIndex ? 'text-pink-600' : 'text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 dss-content-area">
            <div key={currentStep}>
              {renderedStep}
            </div>
          </div>

          {/* Footer Navigation */}
          {!showResults && (
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all select-none
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
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors select-none"
                >
                  Save & Exit
                </button>
                
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all select-none"
                >
                  <span>{currentStepIndex === relevantSteps.length - 1 ? 'Generate Recommendations' : 'Next'}</span>
                  {currentStepIndex === relevantSteps.length - 1 ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Service Detail Modal */}
        {selectedServiceDetail && (
          <ServiceDetailModal
            service={selectedServiceDetail}
            onClose={() => setSelectedServiceDetail(null)}
          />
        )}
      </div>
    </>
  );
}
