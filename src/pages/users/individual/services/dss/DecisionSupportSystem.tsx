import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  DollarSign,
  Star,
  ChevronRight,
  Lightbulb,
  Target,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Zap,
  Filter,
  X,
  BookOpen,
  Award,
  Package,
  ShoppingBag,
  Calendar,
  Heart,
  Shield,
  Sparkles
} from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { Service } from '../../../../../modules/services/types';
import { dssApiService } from './DSSApiService';
import { useAuth } from '../../../../../shared/contexts/HybridAuthContext';

// Import booking functionality
import { BookingRequestModal } from '../../../../../modules/services/components/BookingRequestModal';
import { BatchBookingModal } from './BatchBookingModal';
import type { ServiceCategory } from '../../../../../shared/types/comprehensive-booking.types';

// Helper function to convert Service to BookingService format
const convertToBookingService = (service: Service) => {
  return {
    id: service.id,
    vendorId: service.vendorId,
    name: service.name,
    category: service.category, // Already ServiceCategory type
    description: service.description,
    basePrice: service.basePrice,
    priceRange: service.priceRange,
    image: service.image,
    gallery: service.gallery || [service.image].filter(Boolean),
    features: service.packageInclusions || [],
    availability: service.availability,
    location: service.location,
    rating: service.rating,
    reviewCount: service.reviewCount,
    vendorName: service.vendorName,
    vendorImage: service.vendorImage,
    contactInfo: service.contactInfo
  };
};

interface DSSProps {
  services: Service[];
  budget?: number;
  location?: string;
  weddingDate?: Date;
  guestCount?: number;
  priorities?: string[];
  isOpen: boolean;
  onClose: () => void;
  onServiceRecommend: (serviceId: string) => void;
}

interface DSSRecommendation {
  serviceId: string;
  score: number;
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedCost: number;
  valueRating: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface DSSInsight {
  type: 'budget' | 'trend' | 'risk' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  data?: any;
}

interface BudgetAnalysis {
  totalEstimated: number;
  percentageUsed: number;
  categoryBreakdown: Record<string, number>;
  recommendations: string[];
  riskAreas: string[];
  savingOpportunities: string[];
}

interface PackageRecommendation {
  id: string;
  name: string;
  description: string;
  services: string[]; // Service IDs
  totalCost: number;
  originalCost: number;
  savings: number;
  savingsPercentage: number;
  category: 'essential' | 'standard' | 'premium' | 'luxury';
  suitability: number; // 0-100 score
  reasons: string[];
  timeline: string;
  flexibility: 'high' | 'medium' | 'low';
  riskLevel: 'low' | 'medium' | 'high';
}

interface WeddingStyle {
  style: string;
  description: string;
  essentialCategories: string[];
  recommendedBudgetSplit: Record<string, number>;
  averageCost: number;
  popularFeatures: string[];
}

export const DecisionSupportSystem: React.FC<DSSProps> = ({
  services: initialServices,
  budget = 50000,
  location = '',
  priorities = [],
  isOpen,
  onClose,
  onServiceRecommend
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'insights' | 'budget' | 'comparison' | 'packages'>('recommendations');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, budget]);
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'rating'>('score');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedWeddingStyle, setSelectedWeddingStyle] = useState<string>('classic');
  const [packageFilter, setPackageFilter] = useState<'all' | 'essential' | 'standard' | 'premium' | 'luxury'>('all');
  
  // Real data state
  const [realVendors, setRealVendors] = useState<any[]>([]);
  const [realServices, setRealServices] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);
  
  // Batch booking state
  const [showBatchBookingModal, setShowBatchBookingModal] = useState(false);
  const [batchBookingServices, setBatchBookingServices] = useState<Service[]>([]);
  const [isProcessingBatchBooking, setIsProcessingBatchBooking] = useState(false);
  const [batchBookingProgress, setBatchBookingProgress] = useState({ completed: 0, total: 0 });

  // Handle booking request from DSS recommendations
  const handleBookingRequest = (service: Service) => {
    console.log('📅 [DSS] Booking request for service:', service.name);
    setSelectedServiceForBooking(service);
    setShowBookingModal(true);
  };

  // Handle batch booking of all recommended services
  const handleBatchBookingRequest = () => {
    const servicesToBook = recommendations
      .map(rec => getService(rec.serviceId))
      .filter((service): service is Service => service !== null);
    
    if (servicesToBook.length === 0) {
      console.warn('📅 [DSS] No services available for batch booking');
      return;
    }

    console.log('📅 [DSS] Batch booking request for', servicesToBook.length, 'services');
    setBatchBookingServices(servicesToBook);
    setShowBatchBookingModal(true);
  };

  // Create group chat with all unique vendors
  const createGroupChatWithVendors = async (services: Service[]) => {
    try {
      // Get unique vendors from the services
      const uniqueVendors = Array.from(
        new Map(
          services.map(service => [service.vendorId, {
            vendorId: service.vendorId,
            vendorName: service.vendorName || `Vendor ${service.vendorId}`,
            serviceName: service.name,
            category: service.category
          }])
        ).values()
      );

      if (uniqueVendors.length === 0) {
        throw new Error('No vendors found for group chat');
      }

      console.log('💬 [DSS] Creating group chat with', uniqueVendors.length, 'unique vendors:', uniqueVendors);

      // Generate a descriptive conversation name
      const categories = Array.from(new Set(uniqueVendors.map(v => v.category)));
      const conversationName = categories.length === 1 
        ? `${categories[0]} Planning Discussion`
        : categories.length <= 3 
          ? `${categories.join(' & ')} Planning`
          : `Wedding Planning - ${categories.length} Categories`;

      // Import messaging service
      const MessagingAPI = await import('../../../../../services/api/messagingApiService');
      
      // Create conversation with first vendor (primary conversation)
      const primaryVendor = uniqueVendors[0];
      const conversationId = `dss-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const conversationData = {
        conversationId,
        vendorId: primaryVendor.vendorId,
        vendorName: primaryVendor.vendorName,
        serviceName: conversationName, // Use descriptive name instead of single service
        userId: user?.id || 'demo-user-123', // Use real user ID from auth context
        userName: (user as any)?.name || user?.email || 'Demo User',
        userType: 'couple' as const
      };

      console.log('💬 [DSS] Creating group conversation:', conversationData);
      const result = await MessagingAPI.default.createConversation(conversationData);
      
      if (result) {
        // TODO: In a real implementation, we would:
        // 1. Add all other vendors as participants to the conversation
        // 2. Send an initial message introducing the group and services
        // 3. Navigate to the conversation
        
        console.log('✅ [DSS] Group conversation created successfully');
        
        // Send initial group message
        const initialMessage = `Hi everyone! I'm interested in booking multiple services for my wedding:\n\n${services.map(s => `• ${s.name} (${s.category})`).join('\n')}\n\nLooking forward to discussing how we can work together!`;
        
        // TODO: Send the initial message
        console.log('💬 [DSS] Initial group message:', initialMessage);
        
        // Show enhanced success notification for group chat
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-4 rounded-xl shadow-lg z-50 transform transition-all duration-300 max-w-md';
        notification.innerHTML = `
          <div class="flex items-start gap-3">
            <div class="text-3xl flex-shrink-0">💬</div>
            <div class="flex-1">
              <div class="font-bold text-lg mb-1">Group Chat Created!</div>
              <div class="text-sm opacity-95 mb-2">Connected with ${uniqueVendors.length} vendors for coordinated planning</div>
              
              <div class="bg-white bg-opacity-20 rounded-lg p-3 mb-3">
                <div class="font-semibold text-sm">👥 Conversation: "${conversationName}"</div>
                <div class="text-xs opacity-95 mt-1">
                  ${services.map(s => `• ${s.category}: ${s.name}`).join('<br>')}
                </div>
              </div>
              
              <div class="text-xs bg-gradient-to-r from-blue-500 to-purple-600 bg-opacity-80 rounded p-2">
                <div class="font-semibold">💡 Next Steps:</div>
                <div class="opacity-95">
                  All vendors can now collaborate on your wedding planning.<br>
                  Check your messages to start the conversation!
                </div>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => document.body.removeChild(notification), 300);
        }, 6000);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ [DSS] Failed to create group chat:', error);
      return false;
    }
  };

  // Load real data when component opens
  useEffect(() => {
    if (isOpen && !dataLoaded) {
      loadRealData();
    }
  }, [isOpen, dataLoaded]);

  const loadRealData = async () => {
    try {
      setIsAnalyzing(true);
      setDataError(null);
      console.log('🔄 [DSS] Loading real vendor and service data...');

      const { vendors, services: fetchedServices } = await dssApiService.getVendorsAndServices();
      
      if (vendors.length > 0 && fetchedServices.length > 0) {
        console.log('✅ [DSS] Real data loaded:', { vendors: vendors.length, services: fetchedServices.length });
        
        setRealVendors(vendors);
        setRealServices(fetchedServices);
        
        // Convert to legacy Service format for existing DSS logic
        const legacyServices = dssApiService.convertToLegacyServices(vendors, fetchedServices);
        setServices([...initialServices, ...legacyServices]);
        
        setDataLoaded(true);
      } else {
        console.warn('⚠️ [DSS] No real data available, using provided services');
        setServices(initialServices);
        setDataLoaded(true);
      }
    } catch (error) {
      console.error('❌ [DSS] Failed to load real data:', error);
      setDataError('Failed to load real vendor data. Using available services.');
      setServices(initialServices);
      setDataLoaded(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhanced category pricing for better cost estimation
  const categoryPricing = React.useMemo(() => ({
    'Photography': 3500,
    'Venue': 8000,
    'Catering': 5500,
    'Flowers': 1800,
    'Music': 1200,
    'Entertainment': 2500,
    'Planning': 2000,
    'Transportation': 800,
    'Videography': 2800,
    'Makeup': 800,
    'Lighting': 1500,
    'Decor': 2200,
    'Cake': 600,
    'Invitations': 400,
    'Favors': 300
  }), []);

  // Helper function to calculate booking popularity score
  const calculateBookingScore = React.useCallback((reviewCount: number): number => {
    // Estimate bookings based on reviews (assuming 1 review per 3-5 bookings)
    const estimatedBookings = reviewCount * 4;
    if (estimatedBookings >= 200) return 25; // High booking volume
    if (estimatedBookings >= 100) return 20; // Medium booking volume
    if (estimatedBookings >= 50) return 15; // Moderate booking volume
    return 10; // Lower booking volume
  }, []);

  // Helper functions
  const parsePriceRange = React.useCallback((priceRange: string): number => {
    const ranges = {
      '$': 1000,
      '$$': 3000,
      '$$$': 7000,
      '$$$$': 15000
    };
    return ranges[priceRange as keyof typeof ranges] || 5000;
  }, []);

  const calculateValueRating = React.useCallback((service: Service, cost: number): number => {
    const qualityScore = service.rating * 2; // Max 10
    const featureScore = Math.min(service.features?.length || 0, 10); // Max 10
    const costEfficiency = Math.max(0, 10 - (cost / (budget || 5000)) * 10); // Max 10
    return Math.round((qualityScore + featureScore + costEfficiency) / 3);
  }, [budget]);

  const calculateRiskLevel = React.useCallback((service: Service): 'low' | 'medium' | 'high' => {
    if (service.reviewCount < 10 || service.rating < 3.5) return 'high';
    if (service.reviewCount < 25 || service.rating < 4.0) return 'medium';
    return 'low';
  }, []);

  // Enhanced DSS algorithm with broader recommendation logic
  const recommendations = useMemo(() => {
    if (!services.length) return [];

    setIsAnalyzing(true);
    
    const calculateServiceScore = (service: Service): DSSRecommendation => {
      let score = 0;
      const reasons: string[] = [];
      
      // 1. RATING SCORE (25% - More forgiving quality assessment for broader suggestions)
      const ratingScore = (service.rating / 5) * 25;
      score += ratingScore;
      if (service.rating >= 4.8) {
        reasons.push(`⭐ Outstanding rating (${service.rating}/5) - Top tier quality`);
      } else if (service.rating >= 4.5) {
        reasons.push(`⭐ Exceptional rating (${service.rating}/5) - Premium quality`);
      } else if (service.rating >= 4.0) {
        reasons.push(`⭐ High rating (${service.rating}/5) - Quality service`);
      } else if (service.rating >= 3.5) {
        reasons.push(`⭐ Good rating (${service.rating}/5) - Reliable service`);
      } else {
        reasons.push(`⭐ Decent rating (${service.rating}/5) - Budget-friendly option`);
      }

      // 2. POPULARITY & EXPERIENCE SCORE (20% - More inclusive market validation)
      const bookingScore = calculateBookingScore(service.reviewCount);
      score += bookingScore * 0.8; // Reduced weight for more diversity
      const estimatedBookings = service.reviewCount * 4;
      
      if (estimatedBookings >= 200) {
        reasons.push(`🔥 High demand vendor (${estimatedBookings}+ bookings)`);
      } else if (estimatedBookings >= 100) {
        reasons.push(`📈 Popular vendor (${estimatedBookings}+ bookings)`);
      } else if (estimatedBookings >= 50) {
        reasons.push(`✨ Established vendor (${estimatedBookings}+ bookings)`);
      } else if (estimatedBookings >= 25) {
        reasons.push(`🌱 Growing vendor (${estimatedBookings}+ bookings) - Great opportunity`);
      } else if (estimatedBookings >= 10) {
        reasons.push(`🆕 Emerging vendor (${estimatedBookings}+ bookings) - Fresh perspective`);
      } else {
        reasons.push(`🌟 New vendor (${estimatedBookings}+ bookings) - Undiscovered talent`);
      }

      // 3. PRICE OPTIMIZATION SCORE (30% - Much more inclusive budget compatibility)
      const basePrice = parsePriceRange(service.priceRange || '$$$') ||
        categoryPricing[service.category as keyof typeof categoryPricing] || 2500;
      const estimatedCost = basePrice * 1.15; // Account for add-ons and fees
      const budgetPercentage = (estimatedCost / budget) * 100;
      let priceScore = 0;
      
      if (budgetPercentage <= 30) {
        priceScore = 30;
        reasons.push(`� Exceptional value - Only ${budgetPercentage.toFixed(0)}% of budget`);
      } else if (budgetPercentage <= 50) {
        priceScore = 28;
        reasons.push(`💰 Outstanding value - ${budgetPercentage.toFixed(0)}% of budget`);
      } else if (budgetPercentage <= 70) {
        priceScore = 25;
        reasons.push(`💵 Great value - ${budgetPercentage.toFixed(0)}% of budget`);
      } else if (budgetPercentage <= 90) {
        priceScore = 22;
        reasons.push(`💸 Good value - ${budgetPercentage.toFixed(0)}% of budget`);
      } else if (budgetPercentage <= 110) {
        priceScore = 18;
        reasons.push(`⚖️ Within budget range - ${budgetPercentage.toFixed(0)}% of budget`);
      } else if (budgetPercentage <= 130) {
        priceScore = 14;
        reasons.push(`⚠️ Slightly over budget - ${budgetPercentage.toFixed(0)}% (premium choice)`);
      } else if (budgetPercentage <= 160) {
        priceScore = 10;
        reasons.push(`💎 Premium option - ${budgetPercentage.toFixed(0)}% (worth considering)`);
      } else {
        priceScore = 6;
        reasons.push(`✨ Luxury option - ${budgetPercentage.toFixed(0)}% (dream choice)`);
      }
      score += priceScore;

      // 4. SUITABILITY & PERSONALIZATION SCORE (15% - Enhanced personal fit with more options)
      let suitabilityScore = 0;
      
      // Location preference (more flexible matching)
      if (location && service.location?.toLowerCase().includes(location.toLowerCase())) {
        suitabilityScore += 6;
        reasons.push(`📍 Perfect location match in ${location}`);
      } else if (location && service.location) {
        // Partial location match with broader criteria
        const locationWords = location.toLowerCase().split(/[\s,.-]+/);
        const serviceLocation = service.location.toLowerCase();
        const matches = locationWords.filter(word => 
          word.length > 2 && serviceLocation.includes(word)
        );
        if (matches.length > 0) {
          suitabilityScore += 4;
          reasons.push(`📍 Near your location (${matches.length} match${matches.length > 1 ? 'es' : ''})`);
        } else {
          // Regional or state-level match - still valuable
          suitabilityScore += 2;
          reasons.push(`📍 Regional service provider`);
        }
      } else {
        // No location specified - neutral scoring
        suitabilityScore += 3;
      }
      
      // Availability and timing (more inclusive)
      if (service.availability) {
        suitabilityScore += 3;
        reasons.push(`✅ Available for immediate booking`);
      } else {
        suitabilityScore += 1; // Still consider if availability unclear
      }
      
      // Service diversity and specialization (broader appreciation)
      const featureCount = service.features?.length || 0;
      if (featureCount >= 5) {
        suitabilityScore += 4;
        reasons.push(`🎯 Comprehensive services (${featureCount} specialties)`);
      } else if (featureCount >= 3) {
        suitabilityScore += 3;
        reasons.push(`🎯 Multiple specialties (${featureCount} services)`);
      } else if (featureCount >= 1) {
        suitabilityScore += 2;
        reasons.push(`🎯 Focused expertise (${featureCount} specialty)`);
      } else {
        suitabilityScore += 1; // Everyone gets some consideration
      }
      
      score += suitabilityScore;

      // 5. CATEGORY & PRIORITY BONUS (10% - Balanced category representation)
      let categoryScore = 0;
      
      // Priority category bonus
      if (priorities.includes(service.category)) {
        categoryScore += 6;
        reasons.push(`⭐ Priority category for your wedding`);
      } else {
        // Non-priority categories still get consideration for well-rounded planning
        categoryScore += 3;
        reasons.push(`🔄 Complementary service for complete planning`);
      }
      
      // Essential category bonus
      const essentialCategories = ['Photography', 'Venue', 'Catering'];
      if (essentialCategories.includes(service.category)) {
        categoryScore += 2;
        reasons.push(`🏆 Essential wedding service`);
      }
      
      score += categoryScore;

      // 6. TREND & SEASONAL FACTORS (10% - Broader market intelligence and opportunities)
      let trendScore = 0;
      const currentMonth = new Date().getMonth();
      const isWeddingSeason = [4, 5, 8, 9].includes(currentMonth); // May, June, Sept, Oct
      const isOffSeason = [0, 1, 2, 11].includes(currentMonth); // Jan, Feb, Mar, Dec
      
      // Seasonal opportunities
      if (isWeddingSeason) {
        trendScore += 3;
        reasons.push(`📅 Peak season specialist`);
      } else if (isOffSeason) {
        trendScore += 4;
        reasons.push(`❄️ Off-season value opportunity`);
      } else {
        trendScore += 3;
        reasons.push(`🌸 Shoulder season availability`);
      }
      
      // Vendor lifecycle diversity (encouraging all types)
      if (estimatedBookings < 25 && service.rating >= 3.8) {
        trendScore += 4;
        reasons.push(`🌟 Rising talent - early adopter advantage`);
      } else if (estimatedBookings < 75 && service.rating >= 4.2) {
        trendScore += 3;
        reasons.push(`📈 Growing star - perfect timing`);
      } else if (estimatedBookings >= 100 && service.rating >= 4.4) {
        trendScore += 3;
        reasons.push(`🏆 Proven excellence - reliable choice`);
      } else {
        trendScore += 2;
        reasons.push(`✨ Solid option worth considering`);
      }
      
      score += trendScore;

      // MUCH MORE INCLUSIVE priority calculation for broader, diverse recommendations
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (score >= 65) priority = 'high';      // Significantly lowered from 75
      else if (score >= 40) priority = 'medium'; // Lowered from 50

      // Enhanced value rating calculation
      const valueRating = calculateValueRating(service, estimatedCost);

      // Enhanced risk assessment (more forgiving)
      const riskLevel = calculateRiskLevel(service);

      return {
        serviceId: service.id,
        score: Math.round(score),
        reasons: reasons.slice(0, 6), // Increased to 6 reasons for better context
        priority,
        category: service.category,
        estimatedCost,
        valueRating,
        riskLevel
      };
    };

    // Much broader and more inclusive filtering and sorting logic
    const filteredServices = services.filter(service => {
      // Category filter (only apply if specifically selected)
      if (selectedCategories.length > 0 && !selectedCategories.includes(service.category)) {
        return false;
      }
      
      // Price range filter (much more flexible - allow 50% over for premium options)
      const estimatedCost = parsePriceRange(service.priceRange || '$$$');
      if (estimatedCost < priceRange[0] * 0.5 || estimatedCost > priceRange[1] * 1.5) { 
        return false;
      }
      
      // Only filter out very low quality services (keep more options)
      if (service.rating < 3.0) {
        return false;
      }
      
      return true;
    });

    const recs = filteredServices
      .map(calculateServiceScore)
      .sort((a, b) => {
        switch (sortBy) {
          case 'price':
            return a.estimatedCost - b.estimatedCost;
          case 'rating':
            const serviceA = services.find(s => s.id === a.serviceId);
            const serviceB = services.find(s => s.id === b.serviceId);
            return (serviceB?.rating || 0) - (serviceA?.rating || 0);
          default:
            // Enhanced score-based sorting with diversity injection
            if (Math.abs(a.score - b.score) < 8) { // Increased tolerance for diversity
              // If scores are close, prioritize category diversity and different value propositions
              const categoryComparison = a.category.localeCompare(b.category);
              if (categoryComparison !== 0) return categoryComparison;
              
              // Then by value rating for different price points
              return b.valueRating - a.valueRating;
            }
            return b.score - a.score;
        }
      })
      .slice(0, 50); // Significantly increased to 50 recommendations for much broader selection

    setTimeout(() => setIsAnalyzing(false), 500);
    return recs;
  }, [services, budget, location, priorities, selectedCategories, priceRange, sortBy, calculateBookingScore, parsePriceRange, calculateValueRating, calculateRiskLevel]);

  // Helper functions for insights (depend on recommendations)
  const analyzeBudget = React.useCallback((): BudgetAnalysis => {
    const topRecommendations = recommendations.slice(0, 10);
    const totalEstimated = topRecommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0);
    
    const categoryBreakdown: Record<string, number> = {};
    topRecommendations.forEach(rec => {
      categoryBreakdown[rec.category] = (categoryBreakdown[rec.category] || 0) + rec.estimatedCost;
    });

    return {
      totalEstimated,
      percentageUsed: (totalEstimated / budget) * 100,
      categoryBreakdown,
      recommendations: [
        'Consider bundling services for discounts',
        'Book early for better rates',
        'Compare multiple vendors in each category'
      ],
      riskAreas: ['Photography', 'Catering'],
      savingOpportunities: ['Flowers', 'Transportation']
    };
  }, [recommendations, budget]);

  const getPopularCategories = React.useCallback((): string[] => {
    const categoryCount: Record<string, number> = {};
    services.forEach(service => {
      categoryCount[service.category] = (categoryCount[service.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }, [services]);

  // Wedding styles data for package recommendations
  const weddingStyles: Record<string, WeddingStyle> = React.useMemo(() => ({
    classic: {
      style: 'Classic Traditional',
      description: 'Timeless elegance with traditional elements',
      essentialCategories: ['Photography', 'Venue', 'Catering', 'Flowers', 'Music'],
      recommendedBudgetSplit: {
        'Venue': 0.40,
        'Catering': 0.30,
        'Photography': 0.15,
        'Flowers': 0.08,
        'Music': 0.07
      },
      averageCost: 45000,
      popularFeatures: ['Formal ceremony', 'Sit-down dinner', 'Traditional music', 'Classic flowers']
    },
    modern: {
      style: 'Modern Contemporary',
      description: 'Sleek design with contemporary touches',
      essentialCategories: ['Photography', 'Venue', 'Catering', 'Entertainment', 'Lighting'],
      recommendedBudgetSplit: {
        'Venue': 0.35,
        'Catering': 0.25,
        'Photography': 0.20,
        'Entertainment': 0.12,
        'Lighting': 0.08
      },
      averageCost: 55000,
      popularFeatures: ['Minimalist decor', 'Cocktail reception', 'DJ entertainment', 'Modern lighting']
    },
    rustic: {
      style: 'Rustic Country',
      description: 'Natural beauty with countryside charm',
      essentialCategories: ['Photography', 'Venue', 'Catering', 'Flowers', 'Transportation'],
      recommendedBudgetSplit: {
        'Venue': 0.30,
        'Catering': 0.35,
        'Photography': 0.15,
        'Flowers': 0.12,
        'Transportation': 0.08
      },
      averageCost: 38000,
      popularFeatures: ['Outdoor ceremony', 'Barn reception', 'Wildflower arrangements', 'Country music']
    },
    luxury: {
      style: 'Luxury Glamorous',
      description: 'Opulent celebration with premium everything',
      essentialCategories: ['Photography', 'Venue', 'Catering', 'Flowers', 'Entertainment', 'Planning'],
      recommendedBudgetSplit: {
        'Venue': 0.35,
        'Catering': 0.30,
        'Photography': 0.12,
        'Flowers': 0.10,
        'Entertainment': 0.08,
        'Planning': 0.05
      },
      averageCost: 85000,
      popularFeatures: ['Premium venue', 'Gourmet catering', 'Luxury florals', 'Live entertainment']
    }
  }), []);

  // Generate package recommendations
  const packageRecommendations = React.useMemo((): PackageRecommendation[] => {
    if (!services.length || !recommendations.length) return [];

    const packages: PackageRecommendation[] = [];

    // Essential Package - Core wedding needs
    const essentialServices = recommendations
      .filter(r => ['Photography', 'Venue', 'Catering'].includes(r.category))
      .slice(0, 3);
    
    if (essentialServices.length >= 3) {
      const totalCost = essentialServices.reduce((sum, s) => sum + s.estimatedCost, 0);
      const originalCost = totalCost * 1.15; // Assume 15% bundle discount
      
      packages.push({
        id: 'essential',
        name: 'Essential Wedding Package',
        description: 'Core services for a beautiful, budget-conscious wedding',
        services: essentialServices.map(s => s.serviceId),
        totalCost,
        originalCost,
        savings: originalCost - totalCost,
        savingsPercentage: 15,
        category: 'essential',
        suitability: 85,
        reasons: [
          'Covers the absolute essentials',
          'Budget-friendly approach',
          'High-quality core services',
          'Room for DIY elements'
        ],
        timeline: '6-12 months planning',
        flexibility: 'high',
        riskLevel: 'low'
      });
    }

    // Standard Package - Most popular choice
    const standardServices = recommendations
      .filter(r => ['Photography', 'Venue', 'Catering', 'Flowers', 'Music'].includes(r.category))
      .slice(0, 5);
    
    if (standardServices.length >= 4) {
      const totalCost = standardServices.reduce((sum, s) => sum + s.estimatedCost, 0);
      const originalCost = totalCost * 1.12; // Assume 12% bundle discount
      
      packages.push({
        id: 'standard',
        name: 'Complete Wedding Package',
        description: 'Everything you need for a memorable celebration',
        services: standardServices.map(s => s.serviceId),
        totalCost,
        originalCost,
        savings: originalCost - totalCost,
        savingsPercentage: 12,
        category: 'standard',
        suitability: 92,
        reasons: [
          'Complete wedding solution',
          'Popular vendor combinations',
          'Balanced budget allocation',
          'Stress-free planning'
        ],
        timeline: '8-15 months planning',
        flexibility: 'medium',
        riskLevel: 'low'
      });
    }

    // Premium Package - High-end options
    const premiumServices = recommendations
      .filter(r => r.priority === 'high' && r.valueRating >= 7)
      .slice(0, 6);
    
    if (premiumServices.length >= 5) {
      const totalCost = premiumServices.reduce((sum, s) => sum + s.estimatedCost, 0);
      const originalCost = totalCost * 1.10; // Assume 10% bundle discount
      
      packages.push({
        id: 'premium',
        name: 'Premium Wedding Experience',
        description: 'Top-tier services for an exceptional celebration',
        services: premiumServices.map(s => s.serviceId),
        totalCost,
        originalCost,
        savings: originalCost - totalCost,
        savingsPercentage: 10,
        category: 'premium',
        suitability: 88,
        reasons: [
          'Top-rated vendors only',
          'Premium service quality',
          'Comprehensive coverage',
          'Expert coordination'
        ],
        timeline: '12-18 months planning',
        flexibility: 'medium',
        riskLevel: 'low'
      });
    }

    // Luxury Package - Best of everything
    const luxuryServices = recommendations
      .filter(r => r.priority === 'high' && r.valueRating >= 8)
      .slice(0, 8);
    
    if (luxuryServices.length >= 6) {
      const totalCost = luxuryServices.reduce((sum, s) => sum + s.estimatedCost, 0);
      const originalCost = totalCost * 1.08; // Assume 8% bundle discount
      
      packages.push({
        id: 'luxury',
        name: 'Luxury Dream Wedding',
        description: 'The ultimate wedding experience with no compromises',
        services: luxuryServices.map(s => s.serviceId),
        totalCost,
        originalCost,
        savings: originalCost - totalCost,
        savingsPercentage: 8,
        category: 'luxury',
        suitability: 95,
        reasons: [
          'Luxury service providers',
          'Exclusive vendor access',
          'White-glove treatment',
          'Unforgettable experience'
        ],
        timeline: '15-24 months planning',
        flexibility: 'low',
        riskLevel: 'medium'
      });
    }

    return packages.sort((a, b) => b.suitability - a.suitability);
  }, [services, recommendations]);

  // Enhanced insights generation with comprehensive analysis
  const insights = useMemo((): DSSInsight[] => {
    const insights: DSSInsight[] = [];

    // Budget insights with more detailed analysis
    const budgetAnalysis = analyzeBudget();
    if (budgetAnalysis.percentageUsed > 100) {
      insights.push({
        type: 'budget',
        title: '⚠️ Over Budget Alert',
        description: `Your current selections exceed budget by ${(budgetAnalysis.percentageUsed - 100).toFixed(1)}%. Consider adjusting selections or increasing budget.`,
        impact: 'high',
        actionable: true,
        data: budgetAnalysis
      });
    } else if (budgetAnalysis.percentageUsed > 90) {
      insights.push({
        type: 'budget',
        title: '💰 Budget Optimization Needed',
        description: `You're using ${budgetAnalysis.percentageUsed.toFixed(1)}% of your budget. Consider reviewing high-cost categories for savings.`,
        impact: 'high',
        actionable: true,
        data: budgetAnalysis
      });
    } else if (budgetAnalysis.percentageUsed < 60) {
      insights.push({
        type: 'opportunity',
        title: '💎 Budget Opportunity',
        description: `You have ${(100 - budgetAnalysis.percentageUsed).toFixed(1)}% budget remaining. Consider upgrading key services or adding extras.`,
        impact: 'medium',
        actionable: true,
        data: budgetAnalysis
      });
    }

    // Market trend insights
    const popularCategories = getPopularCategories();
    const categoryStats = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = { count: 0, avgRating: 0, totalRating: 0 };
      }
      acc[service.category].count++;
      acc[service.category].totalRating += service.rating;
      acc[service.category].avgRating = acc[service.category].totalRating / acc[service.category].count;
      return acc;
    }, {} as Record<string, { count: number; avgRating: number; totalRating: number }>);

    if (popularCategories.length > 0) {
      const topCategory = popularCategories[0];
      const categoryInfo = categoryStats[topCategory];
      insights.push({
        type: 'trend',
        title: '📈 Market Trends',
        description: `${topCategory} is highly competitive with ${categoryInfo.count} vendors averaging ${categoryInfo.avgRating.toFixed(1)} stars. Book early for best selection.`,
        impact: 'medium',
        actionable: true,
        data: { categories: popularCategories, stats: categoryStats }
      });
    }

    // Risk assessment insights
    const highRiskServices = recommendations.filter(r => r.riskLevel === 'high');
    const mediumRiskServices = recommendations.filter(r => r.riskLevel === 'medium');
    
    if (highRiskServices.length > 0) {
      insights.push({
        type: 'risk',
        title: '🚨 High-Risk Services Detected',
        description: `${highRiskServices.length} services have potential risks due to limited reviews or lower ratings. Consider alternatives or request references.`,
        impact: 'high',
        actionable: true,
        data: highRiskServices
      });
    } else if (mediumRiskServices.length > 3) {
      insights.push({
        type: 'risk',
        title: '⚠️ Medium-Risk Services',
        description: `${mediumRiskServices.length} services have moderate risk. Review their portfolios and recent work carefully.`,
        impact: 'medium',
        actionable: true,
        data: mediumRiskServices
      });
    }

    // Value opportunity insights
    const valuePicks = recommendations.filter(r => r.valueRating >= 8);
    const budgetFriendly = recommendations.filter(r => r.estimatedCost <= budget * 0.15); // 15% or less of budget
    
    if (valuePicks.length > 0) {
      insights.push({
        type: 'opportunity',
        title: '💎 Excellent Value Opportunities',
        description: `Found ${valuePicks.length} high-value services offering exceptional quality for the price. These vendors provide the best ROI.`,
        impact: 'medium',
        actionable: true,
        data: valuePicks
      });
    }

    if (budgetFriendly.length > 0) {
      insights.push({
        type: 'opportunity',
        title: '💰 Budget-Friendly Options',
        description: `${budgetFriendly.length} services cost less than 15% of your budget each, leaving room for upgrades in other areas.`,
        impact: 'low',
        actionable: true,
        data: budgetFriendly
      });
    }

    // Location and logistics insights
    const localServices = recommendations.filter(r => {
      const service = services.find(s => s.id === r.serviceId);
      return service && location && service.location?.toLowerCase().includes(location.toLowerCase());
    });

    if (location && localServices.length > 0) {
      insights.push({
        type: 'opportunity',
        title: '📍 Local Vendor Advantage',
        description: `${localServices.length} recommended vendors are in ${location}, reducing travel costs and supporting local businesses.`,
        impact: 'low',
        actionable: true,
        data: localServices
      });
    }

    // Seasonal and timing insights
    const currentMonth = new Date().getMonth();
    const isWeddingSeason = [4, 5, 8, 9].includes(currentMonth);
    
    if (isWeddingSeason) {
      insights.push({
        type: 'trend',
        title: '📅 Peak Wedding Season',
        description: `Currently in peak wedding season. Book vendors quickly as availability fills up fast, and consider off-season alternatives for savings.`,
        impact: 'medium',
        actionable: true,
        data: { season: 'peak', month: currentMonth }
      });
    } else {
      insights.push({
        type: 'opportunity',
        title: '🌟 Off-Season Advantage',
        description: `Planning during off-peak season gives you better vendor availability and potential discounts of 10-25%.`,
        impact: 'medium',
        actionable: true,
        data: { season: 'off-peak', month: currentMonth }
      });
    }

    // Portfolio and specialization insights
    const specializedVendors = recommendations.filter(r => {
      const service = services.find(s => s.id === r.serviceId);
      return service && service.features && service.features.length >= 4;
    });

    if (specializedVendors.length > 0) {
      insights.push({
        type: 'opportunity',
        title: '🎯 Specialized Vendors Available',
        description: `${specializedVendors.length} vendors offer multiple specialties, potentially allowing you to bundle services for better coordination.`,
        impact: 'medium',
        actionable: true,
        data: specializedVendors
      });
    }

    // Diversity and balance insights
    const categoryDistribution = recommendations.reduce((acc, rec) => {
      acc[rec.category] = (acc[rec.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantCategory = Object.entries(categoryDistribution)
      .sort(([,a], [,b]) => b - a)[0];

    if (dominantCategory && dominantCategory[1] > recommendations.length * 0.4) {
      insights.push({
        type: 'trend',
        title: '⚖️ Category Imbalance',
        description: `${dominantCategory[0]} dominates your recommendations (${dominantCategory[1]} services). Consider exploring other essential categories.`,
        impact: 'low',
        actionable: true,
        data: categoryDistribution
      });
    }

    return insights.slice(0, 8); // Limit to top 8 most relevant insights
  }, [recommendations, analyzeBudget, getPopularCategories, services, budget, location]);

  const getService = (serviceId: string) => services.find(s => s.id === serviceId);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const categories = [...new Set(services.map(s => s.category))];

  if (!isOpen) return null;

  // Show loading state while fetching real data
  if (!dataLoaded && isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Wedding Intelligence</h3>
          <p className="text-gray-600">Analyzing {realVendors.length + realServices.length} real vendors and services...</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-600">
            <Brain className="w-4 h-4 animate-pulse" />
            <span>AI-powered recommendations incoming</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple Clean Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Smart Wedding Planner</h2>
                <p className="text-purple-100 text-sm">Find your perfect vendors instantly</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Simple Content Area - No Tabs! */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Top Picks</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">{recommendations.filter(r => r.priority === 'high').length}</p>
                <p className="text-xs text-purple-700 mt-1">Perfect matches for you</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Budget</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{Math.round(analyzeBudget().percentageUsed)}%</p>
                <p className="text-xs text-green-700 mt-1">Of your ₱{budget.toLocaleString()} budget</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Avg Rating</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {(recommendations.reduce((sum, r) => sum + (services.find(s => s.id === r.serviceId)?.rating || 0), 0) / recommendations.length).toFixed(1)}
                </p>
                <p className="text-xs text-blue-700 mt-1">From {recommendations.length} services</p>
              </div>
            </div>

            {/* Simple Filter */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Quick Filter:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  <option value="score">🎯 Best Match</option>
                  <option value="price">💰 Lowest Price</option>
                  <option value="rating">⭐ Highest Rated</option>
                </select>
                <div className="flex-1"></div>
                <span className="text-sm text-gray-600">{filteredRecommendations.length} recommendations</span>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-4">
              {(
                <motion.div
                  key="recommendations"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Enhanced Filters */}
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Filters:</span>
                        </div>
                        
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          title="Sort recommendations by"
                          aria-label="Sort recommendations by"
                        >
                          <option value="score">🎯 Best Match</option>
                          <option value="price">💰 Price: Low to High</option>
                          <option value="rating">⭐ Highest Rated</option>
                        </select>

                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {categories.slice(0, 6).map(category => (
                            <button
                              key={category}
                              onClick={() => handleCategoryFilter(category)}
                              className={cn(
                                "px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                                selectedCategories.includes(category)
                                  ? "bg-purple-100 text-purple-700 border border-purple-300 shadow-sm"
                                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                              )}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Enhanced Budget Range */}
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Budget Range:</span>
                          <div className="flex-1 px-2">
                            <input
                              type="range"
                              min="0"
                              max={budget}
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                              title="Adjust maximum budget"
                              aria-label={`Budget range: ₱0 to ₱${priceRange[1].toLocaleString()}`}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-gray-600 min-w-0">
                              ₱0 - ₱{priceRange[1].toLocaleString()}
                            </span>
                            <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                              {Math.round((priceRange[1] / budget) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Recommendations List */}
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center py-12 sm:py-16">
                      <div className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 text-sm sm:text-base">Analyzing services with AI...</p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">Finding your perfect matches</p>
                      </div>
                    </div>
                  ) : recommendations.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
                      <p className="text-gray-600 text-sm sm:text-base mb-4">Try adjusting your filters or budget range</p>
                      <button
                        onClick={() => {
                          setSelectedCategories([]);
                          setPriceRange([0, budget]);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Batch Booking Section */}
                      {recommendations.length > 1 && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4 sm:p-6 mb-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <ShoppingBag className="h-5 w-5 text-purple-600" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Book All Recommended Services
                                </h3>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">
                                Save time by booking all {recommendations.length} recommended services at once and create a group chat with all vendors for coordinated planning.
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {recommendations.slice(0, 3).map((rec) => {
                                  const service = getService(rec.serviceId);
                                  if (!service) return null;
                                  return (
                                    <div key={rec.serviceId} className="flex items-center gap-1 bg-white/70 rounded-lg px-2 py-1 text-xs">
                                      <span className="font-medium">{service.category}</span>
                                      <span className="text-gray-500">•</span>
                                      <span className="text-green-600 font-medium">₱{rec.estimatedCost.toLocaleString()}</span>
                                    </div>
                                  );
                                })}
                                {recommendations.length > 3 && (
                                  <div className="flex items-center gap-1 bg-white/70 rounded-lg px-2 py-1 text-xs text-gray-500">
                                    +{recommendations.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={handleBatchBookingRequest}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                              >
                                <Calendar className="h-4 w-4" />
                                Book All ({recommendations.length})
                              </button>
                              <button
                                onClick={() => createGroupChatWithVendors(recommendations.map(rec => getService(rec.serviceId)).filter((service): service is Service => service !== null))}
                                className="px-4 py-3 bg-white text-purple-600 border-2 border-purple-300 rounded-xl hover:bg-purple-50 transition-all duration-200 font-medium flex items-center gap-2"
                              >
                                <Heart className="h-4 w-4" />
                                Group Chat
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recommendations Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      {recommendations.map((rec, index) => {
                        const service = getService(rec.serviceId);
                        if (!service) return null;

                        return (
                          <motion.div
                            key={rec.serviceId}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-200 hover:-translate-y-1"
                          >
                            <div className="flex flex-col gap-3 sm:gap-4">
                              {/* Service Header */}
                              <div className="flex items-start gap-3">
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={service.image}
                                    alt={service.name}
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover ring-2 ring-gray-100"
                                    loading="lazy"
                                  />
                                  <div className={cn(
                                    "absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full text-white text-xs font-bold flex items-center justify-center",
                                    rec.priority === 'high' ? "bg-green-500" :
                                    rec.priority === 'medium' ? "bg-yellow-500" :
                                    "bg-gray-400"
                                  )}>
                                    {rec.score}
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-1">
                                    <div className="min-w-0">
                                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{service.name}</h3>
                                      <p className="text-xs sm:text-sm text-gray-600">{service.category}</p>
                                    </div>
                                    <div className={cn(
                                      "px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0",
                                      rec.priority === 'high' ? "bg-green-100 text-green-700" :
                                      rec.priority === 'medium' ? "bg-yellow-100 text-yellow-700" :
                                      "bg-gray-100 text-gray-700"
                                    )}>
                                      {rec.priority}
                                    </div>
                                  </div>

                                  {/* Service Metrics */}
                                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                                      <span className="font-medium">{service.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                                      <span className="font-medium">${rec.estimatedCost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                      <span className="text-xs">Value: {rec.valueRating}/10</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Reasons */}
                              <div className="space-y-1 sm:space-y-2">
                                {rec.reasons.slice(0, 3).map((reason, reasonIndex) => (
                                  <div key={reasonIndex} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="leading-tight">{reason}</span>
                                  </div>
                                ))}
                                {rec.reasons.length > 3 && (
                                  <div className="text-xs text-gray-500 ml-5">
                                    +{rec.reasons.length - 3} more reasons
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => handleBookingRequest(service)}
                                  className="flex-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                                >
                                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span>Book Now</span>
                                </button>
                                <button
                                  onClick={() => onServiceRecommend(rec.serviceId)}
                                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                                  title="View service details"
                                >
                                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                                <button
                                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                  title="Save for later"
                                >
                                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      </div>
                    </>
                  )}

                  {/* Load More Button - Enhanced */}
                  {recommendations.length >= 20 && (
                    <div className="text-center pt-6">
                      <div className="inline-flex flex-col items-center gap-3">
                        <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2">
                          <ChevronRight className="h-4 w-4" />
                          Show More Recommendations
                        </button>
                        <p className="text-xs text-gray-500">
                          Showing top {Math.min(recommendations.length, 20)} of {recommendations.length} matches
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

            {/* Packages Tab */}
            {activeTab === 'packages' && (
              <motion.div
                key="packages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Package Filters */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Package Type:</span>
                    </div>
                    
                    <select
                      value={packageFilter}
                      onChange={(e) => setPackageFilter(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      title="Filter packages by type"
                      aria-label="Filter packages by type"
                    >
                      <option value="all">All Packages</option>
                      <option value="essential">Essential</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="luxury">Luxury</option>
                    </select>

                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Wedding Style:</span>
                    </div>
                    
                    <select
                      value={selectedWeddingStyle}
                      onChange={(e) => setSelectedWeddingStyle(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      title="Select wedding style"
                      aria-label="Select wedding style"
                    >
                      <option value="classic">Classic Traditional</option>
                      <option value="modern">Modern Contemporary</option>
                      <option value="rustic">Rustic Country</option>
                      <option value="luxury">Luxury Glamorous</option>
                    </select>
                  </div>

                  {/* Wedding Style Info */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">{weddingStyles[selectedWeddingStyle].style}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{weddingStyles[selectedWeddingStyle].description}</p>
                    <div className="flex flex-wrap gap-2">
                      {weddingStyles[selectedWeddingStyle].popularFeatures.map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Package Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {packageRecommendations
                    .filter(pkg => packageFilter === 'all' || pkg.category === packageFilter)
                    .map((pkg) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-5 w-5 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                            <div className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              pkg.category === 'essential' ? "bg-blue-100 text-blue-700" :
                              pkg.category === 'standard' ? "bg-green-100 text-green-700" :
                              pkg.category === 'premium' ? "bg-purple-100 text-purple-700" :
                              "bg-yellow-100 text-yellow-700"
                            )}>
                              {pkg.category}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">{pkg.suitability}%</div>
                          <div className="text-xs text-gray-500">Suitability</div>
                        </div>
                      </div>

                      {/* Package Metrics */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">${pkg.totalCost.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Total Cost</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">${pkg.savings.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">You Save</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{pkg.services.length}</div>
                          <div className="text-xs text-gray-500">Services</div>
                        </div>
                      </div>

                      {/* Package Features */}
                      <div className="space-y-2 mb-4">
                        {pkg.reasons.map((reason, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                            {reason}
                          </div>
                        ))}
                      </div>

                      {/* Package Details */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {pkg.timeline}
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {pkg.riskLevel} risk
                        </div>
                      </div>

                      {/* Included Services */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Included Services:</h4>
                        <div className="grid grid-cols-2 gap-1">
                          {pkg.services.slice(0, 6).map((serviceId) => {
                            const service = getService(serviceId);
                            return service ? (
                              <div key={serviceId} className="text-xs text-gray-600 flex items-center gap-1">
                                <Star className="h-2 w-2 text-yellow-400 fill-current" />
                                {service.name.length > 20 ? service.name.substring(0, 20) + '...' : service.name}
                              </div>
                            ) : null;
                          })}
                          {pkg.services.length > 6 && (
                            <div className="text-xs text-gray-500">+{pkg.services.length - 6} more...</div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          Select Package
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          Customize
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Package Comparison */}
                {packageRecommendations.length > 1 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      Package Comparison
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2">Package</th>
                            <th className="text-center py-2">Cost</th>
                            <th className="text-center py-2">Services</th>
                            <th className="text-center py-2">Savings</th>
                            <th className="text-center py-2">Timeline</th>
                            <th className="text-center py-2">Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {packageRecommendations.slice(0, 4).map((pkg) => (
                            <tr key={pkg.id} className="border-b border-gray-100">
                              <td className="py-3">
                                <div className="font-medium text-gray-900">{pkg.name}</div>
                                <div className="text-xs text-gray-500">{pkg.category}</div>
                              </td>
                              <td className="text-center py-3 font-medium">${pkg.totalCost.toLocaleString()}</td>
                              <td className="text-center py-3">{pkg.services.length}</td>
                              <td className="text-center py-3 text-green-600 font-medium">{pkg.savingsPercentage}%</td>
                              <td className="text-center py-3 text-xs">{pkg.timeline.split(' ')[0]}</td>
                              <td className="text-center py-3">
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-xs",
                                  pkg.riskLevel === 'low' ? "bg-green-100 text-green-700" :
                                  pkg.riskLevel === 'medium' ? "bg-yellow-100 text-yellow-700" :
                                  "bg-red-100 text-red-700"
                                )}>
                                  {pkg.riskLevel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "border rounded-xl p-6",
                        insight.type === 'budget' ? "border-red-200 bg-red-50" :
                        insight.type === 'trend' ? "border-blue-200 bg-blue-50" :
                        insight.type === 'risk' ? "border-orange-200 bg-orange-50" :
                        "border-green-200 bg-green-50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          insight.type === 'budget' ? "bg-red-100 text-red-600" :
                          insight.type === 'trend' ? "bg-blue-100 text-blue-600" :
                          insight.type === 'risk' ? "bg-orange-100 text-orange-600" :
                          "bg-green-100 text-green-600"
                        )}>
                          {insight.type === 'budget' && <DollarSign className="h-5 w-5" />}
                          {insight.type === 'trend' && <TrendingUp className="h-5 w-5" />}
                          {insight.type === 'risk' && <AlertCircle className="h-5 w-5" />}
                          {insight.type === 'opportunity' && <Lightbulb className="h-5 w-5" />}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                          
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              insight.impact === 'high' ? "bg-red-100 text-red-700" :
                              insight.impact === 'medium' ? "bg-yellow-100 text-yellow-700" :
                              "bg-green-100 text-green-700"
                            )}>
                              {insight.impact} impact
                            </span>
                            
                            {insight.actionable && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                Actionable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Budget Analysis Tab */}
            {activeTab === 'budget' && (
              <motion.div
                key="budget"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Budget Overview */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Budget</span>
                        <span className="font-semibold">${budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Estimated Cost</span>
                        <span className="font-semibold">${analyzeBudget().totalEstimated.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Remaining</span>
                        <span className={cn(
                          "font-semibold",
                          budget - analyzeBudget().totalEstimated >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          ${(budget - analyzeBudget().totalEstimated).toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={cn(
                            "h-3 rounded-full transition-all duration-500",
                            analyzeBudget().percentageUsed > 100 ? "bg-red-500" :
                            analyzeBudget().percentageUsed > 80 ? "bg-yellow-500" : "bg-green-500"
                          )}
                          aria-label={`Budget usage: ${Math.round(analyzeBudget().percentageUsed)}%`}
                        >
                          <div className="w-full h-full rounded-full" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        {Math.round(analyzeBudget().percentageUsed)}% of budget used
                      </p>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                    <div className="space-y-3">
                      {Object.entries(analyzeBudget().categoryBreakdown).map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">{category}</span>
                          <span className="font-medium">${amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {analyzeBudget().recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Risk Areas
                    </h4>
                    <ul className="space-y-2">
                      {analyzeBudget().riskAreas.map((risk, index) => (
                        <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Saving Opportunities
                    </h4>
                    <ul className="space-y-2">
                      {analyzeBudget().savingOpportunities.map((opportunity, index) => (
                        <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Comparison Tab */}
            {activeTab === 'comparison' && (
              <motion.div
                key="comparison"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Comparison</h3>
                  <p className="text-gray-600">Compare multiple services side by side</p>
                  <p className="text-sm text-gray-500 mt-2">Feature coming soon...</p>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Booking Request Modal */}
      {showBookingModal && selectedServiceForBooking && (
        <BookingRequestModal
          service={convertToBookingService(selectedServiceForBooking)}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedServiceForBooking(null);
          }}
          onBookingCreated={(booking) => {
            console.log('📅 [DSS] Booking created from DSS:', booking);
            setShowBookingModal(false);
            setSelectedServiceForBooking(null);
            // Optionally show success message or update recommendations
          }}
        />
      )}

      {/* Batch Booking Modal */}
      <BatchBookingModal
        isOpen={showBatchBookingModal}
        onClose={() => {
          setShowBatchBookingModal(false);
          setBatchBookingServices([]);
        }}
        services={batchBookingServices}
        onConfirmBooking={async (services) => {
          console.log('📅 [DSS] Batch booking confirmed for', services.length, 'services');
          
          // Here you would implement the actual batch booking logic
          // For now, we'll simulate the booking process
          for (const service of services) {
            console.log('📅 [DSS] Creating booking for:', service.name);
            
            // Simulate individual booking creation
            // This would call your booking API for each service
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Dispatch booking created event for each service
              const bookingCreatedEvent = new CustomEvent('bookingCreated', {
                detail: {
                  serviceId: service.id,
                  serviceName: service.name,
                  vendorName: service.vendorName,
                  status: 'quote_requested'
                }
              });
              window.dispatchEvent(bookingCreatedEvent);
              
            } catch (error) {
              console.error('❌ [DSS] Failed to create booking for', service.name, ':', error);
            }
          }
          
          // Show success notification
          console.log('✅ [DSS] All bookings created successfully');
        }}
        onCreateGroupChat={createGroupChatWithVendors}
      />
    </motion.div>
  );
};
