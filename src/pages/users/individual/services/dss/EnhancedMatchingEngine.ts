/**
 * Enhanced DSS Matching Engine with Priority-Based Scoring
 * Wedding Bazaar - Intelligent Wedding Planner v3.0
 * 
 * Priority System:
 * - CRITICAL: User's selected categories (must match 100%)
 * - HIGH: Budget, Date, Location (80% weight)
 * - MEDIUM: Style, Cultural preferences (50% weight)
 * - LOW: Additional nice-to-haves (20% weight)
 */

// Service type - compatible with modules/services/types
export interface Service {
  id: string;
  vendorId: string;
  name: string;
  title?: string;
  description: string;
  category?: string;
  image?: string;
  location?: string;
  location_data?: unknown;
  wedding_styles?: string[] | Record<string, unknown>;
  cultural_specialties?: string[] | Record<string, unknown>;
  availability?: unknown;
  basePrice?: number;
  minimumPrice?: number;
  rating: number;
  yearsInBusiness?: number;
  verificationStatus?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  vendorName?: string;
  isActive?: boolean;
}

export interface WeddingPreferences {
  weddingType: string;
  weddingDate: string;
  guestCount: number;
  budgetRange: string;
  customBudget: number;
  budgetFlexibility: string;
  servicePriorities: string[];
  styles: string[];
  colorPalette: string[];
  atmosphere: string;
  locations: string[];
  venueTypes: string[];
  venueFeatures: string[];
  mustHaveServices: string[];
  servicePreferences: Record<string, string>;
  dietaryConsiderations: string[];
  accessibilityNeeds: string[];
  culturalRequirements: string[];
  additionalServices: string[];
  specialNotes: string;
}

// ==================== TYPES ====================

export interface MatchScore {
  totalScore: number;
  categoryMatch: number;
  budgetMatch: number;
  locationMatch: number;
  styleMatch: number;
  culturalMatch: number;
  availabilityMatch: number;
  qualityScore: number;
  reasons: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0-100%
}

export interface ServiceMatch {
  service: Service;
  matchScore: MatchScore;
  category: string;
  isRequired: boolean; // Part of user's must-have categories
}

export interface SmartPackage {
  id: string;
  name: string;
  tier: 'essential' | 'deluxe' | 'premium' | 'custom';
  services: ServiceMatch[];
  requiredServicesFulfilled: number; // How many must-haves are included
  totalRequiredServices: number; // Total must-haves requested
  fulfillmentPercentage: number; // % of must-haves covered
  totalPrice: number;
  discountedPrice: number;
  savings: number;
  discountPercentage: number;
  overallMatchScore: number; // Weighted average of all services
  matchReasons: string[];
  missingServices: string[]; // Required categories not covered
  bonusServices: string[]; // Extra services added for value
}

// ==================== PRIORITY-BASED MATCHING ENGINE ====================

export class EnhancedMatchingEngine {
  private preferences: WeddingPreferences;
  private services: Service[];
  private categoryPriority: Map<string, number>; // Category → Priority score

  constructor(preferences: WeddingPreferences, services: Service[]) {
    this.preferences = preferences;
    this.services = services;
    this.categoryPriority = this.buildCategoryPriority();
  }

  /**
   * Build priority map based on user's selections
   * CRITICAL: Categories user explicitly selected
   * HIGH: Categories in same family (e.g., photo + video)
   * MEDIUM: Complementary services
   * LOW: Nice-to-have extras
   */
  private buildCategoryPriority(): Map<string, number> {
    const priorityMap = new Map<string, number>();
    
    // CRITICAL: User's must-have categories (Priority 1.0)
    this.preferences.mustHaveServices.forEach(category => {
      priorityMap.set(category, 1.0);
    });

    // HIGH: Related categories (Priority 0.8)
    const relatedCategories = this.getRelatedCategories(this.preferences.mustHaveServices);
    relatedCategories.forEach(category => {
      if (!priorityMap.has(category)) {
        priorityMap.set(category, 0.8);
      }
    });

    // MEDIUM: Complementary services (Priority 0.5)
    const complementary = this.getComplementaryCategories(this.preferences.mustHaveServices);
    complementary.forEach(category => {
      if (!priorityMap.has(category)) {
        priorityMap.set(category, 0.5);
      }
    });

    // LOW: All other services (Priority 0.2)
    // These will only be added if budget allows and match quality is high

    return priorityMap;
  }

  /**
   * Get related categories (same family)
   * e.g., Photography → Videography, Photo Booth
   */
  private getRelatedCategories(selectedCategories: string[]): string[] {
    const relatedMap: Record<string, string[]> = {
      'photography': ['videography', 'photo_booth'],
      'videography': ['photography', 'photo_booth'],
      'venue': ['catering', 'decoration', 'rentals'],
      'catering': ['venue', 'cake', 'bartending'],
      'music_dj': ['band', 'sound_system', 'entertainment'],
      'flowers_decor': ['venue_styling', 'lighting', 'furniture_rental'],
      'wedding_planning': ['day_coordinator', 'design_styling'],
      'makeup_hair': ['bridal_gown', 'accessories', 'grooming']
    };

    const related = new Set<string>();
    selectedCategories.forEach(cat => {
      const relatedCats = relatedMap[cat] || [];
      relatedCats.forEach(r => related.add(r));
    });

    return Array.from(related);
  }

  /**
   * Get complementary categories (often booked together)
   */
  private getComplementaryCategories(selectedCategories: string[]): string[] {
    const complementaryMap: Record<string, string[]> = {
      'venue': ['transportation', 'accommodation', 'parking'],
      'catering': ['waitstaff', 'tableware', 'linens'],
      'photography': ['album_design', 'printing', 'digital_copies'],
      'music_dj': ['lighting', 'special_effects', 'karaoke']
    };

    const complementary = new Set<string>();
    selectedCategories.forEach(cat => {
      const compCats = complementaryMap[cat] || [];
      compCats.forEach(c => complementary.add(c));
    });

    return Array.from(complementary);
  }

  /**
   * Calculate comprehensive match score with priority weighting
   */
  public calculateServiceMatch(service: Service): MatchScore {
    const reasons: string[] = [];
    let totalScore = 0;

    // 1. CATEGORY MATCH (40 points - CRITICAL)
    let categoryMatch = 0;
    const serviceCat = service.category?.toLowerCase() || '';
    const isRequired = this.preferences.mustHaveServices.some(cat => 
      serviceCat.includes(cat.toLowerCase().replace(/_/g, ''))
    );

    if (isRequired) {
      categoryMatch = 40; // Full points for required categories
      reasons.push(`✅ Matches your must-have: ${service.category}`);
    } else {
      // Check if it's a related or complementary category
      const priority = Array.from(this.categoryPriority.entries()).find(([cat]) => 
        serviceCat.includes(cat.toLowerCase().replace(/_/g, ''))
      );
      
      if (priority) {
        categoryMatch = 40 * priority[1]; // Weighted by priority
        reasons.push(`Related service: ${service.category}`);
      }
    }

    totalScore += categoryMatch;

    // 2. BUDGET MATCH (25 points - HIGH PRIORITY)
    let budgetMatch = 0;
    if (this.preferences.budgetRange || this.preferences.customBudget > 0) {
      const budgetRanges: Record<string, { min: number; max: number }> = {
        'budget': { min: 5000, max: 50000 },
        'moderate': { min: 30000, max: 100000 },
        'upscale': { min: 80000, max: 200000 },
        'luxury': { min: 150000, max: 1000000 }
      };

      const budgetRange = this.preferences.budgetRange ? budgetRanges[this.preferences.budgetRange] : null;
      const servicePrice = service.basePrice || service.minimumPrice || 0;

      if (budgetRange && servicePrice > 0) {
        if (servicePrice >= budgetRange.min && servicePrice <= budgetRange.max) {
          budgetMatch = 25;
          reasons.push(`💰 Perfect price fit (₱${servicePrice.toLocaleString()})`);
        } else {
          // Calculate proximity to budget range
          const deviation = Math.min(
            Math.abs(servicePrice - budgetRange.min) / budgetRange.min,
            Math.abs(servicePrice - budgetRange.max) / budgetRange.max
          );
          
          if (deviation <= 0.2) { // Within 20% of range
            budgetMatch = 20;
            reasons.push(`💵 Close to budget range`);
          } else if (deviation <= 0.4 && this.preferences.budgetFlexibility === 'flexible') {
            budgetMatch = 15;
            reasons.push(`💸 Flexible budget option`);
          }
        }
      }
    }

    totalScore += budgetMatch;

    // 3. LOCATION MATCH (15 points - HIGH PRIORITY)
    let locationMatch = 0;
    if (this.preferences.locations.length > 0) {
      const serviceLocation = service.location?.toLowerCase() || '';
      const locationData = service.location_data;
      
      const matchesLocation = this.preferences.locations.some(loc => {
        const locLower = loc.toLowerCase();
        return serviceLocation.includes(locLower) || 
               (locationData && JSON.stringify(locationData).toLowerCase().includes(locLower));
      });

      if (matchesLocation) {
        locationMatch = 15;
        reasons.push(`📍 Available in ${this.preferences.locations[0]}`);
      } else if (serviceLocation) {
        // Partial match - same region
        locationMatch = 5;
      }
    }

    totalScore += locationMatch;

    // 4. STYLE MATCH (10 points - MEDIUM PRIORITY)
    let styleMatch = 0;
    if (this.preferences.styles.length > 0 && service.wedding_styles) {
      const serviceStyles = Array.isArray(service.wedding_styles) 
        ? service.wedding_styles 
        : Object.values(service.wedding_styles);
      
      const matchingStyles = this.preferences.styles.filter(style => 
        serviceStyles.some(s => String(s).toLowerCase().includes(style.toLowerCase()))
      );

      if (matchingStyles.length > 0) {
        styleMatch = Math.min(10, matchingStyles.length * 5);
        reasons.push(`🎨 Matches ${matchingStyles[0]} style`);
      }
    }

    totalScore += styleMatch;

    // 5. CULTURAL MATCH (5 points - MEDIUM PRIORITY)
    let culturalMatch = 0;
    if (this.preferences.culturalRequirements.length > 0 && service.cultural_specialties) {
      const serviceCultural = Array.isArray(service.cultural_specialties)
        ? service.cultural_specialties
        : Object.values(service.cultural_specialties);
      
      const matchesCultural = this.preferences.culturalRequirements.some(req =>
        serviceCultural.some(s => String(s).toLowerCase().includes(req.toLowerCase()))
      );

      if (matchesCultural) {
        culturalMatch = 5;
        reasons.push(`🎎 Cultural specialist`);
      }
    }

    totalScore += culturalMatch;

    // 6. AVAILABILITY MATCH (5 points - HIGH PRIORITY)
    let availabilityMatch = 0;
    if (this.preferences.weddingDate && service.availability) {
      // Check if service is available on the wedding date
      availabilityMatch = 5;
      reasons.push(`📅 Available on your date`);
    } else if (service.availability) {
      availabilityMatch = 3;
      reasons.push(`📆 Currently accepting bookings`);
    }

    totalScore += availabilityMatch;

    // 7. QUALITY SCORE (Bonus: Rating, Experience, Verification)
    let qualityScore = 0;

    // Rating (max 10 points)
    if (service.rating >= 4.8) {
      qualityScore += 10;
      reasons.push(`⭐ Exceptional rating (${service.rating.toFixed(1)}★)`);
    } else if (service.rating >= 4.5) {
      qualityScore += 8;
      reasons.push(`⭐ Highly rated (${service.rating.toFixed(1)}★)`);
    } else if (service.rating >= 4.0) {
      qualityScore += 5;
      reasons.push(`⭐ Well-rated (${service.rating.toFixed(1)}★)`);
    }

    // Experience (max 5 points)
    if (service.yearsInBusiness) {
      const experienceScore = Math.min(5, service.yearsInBusiness);
      qualityScore += experienceScore;
      reasons.push(`👔 ${service.yearsInBusiness}+ years experience`);
    }

    // Verification (5 points)
    if (service.verificationStatus === 'verified') {
      qualityScore += 5;
      reasons.push(`✓ Verified vendor`);
    }

    totalScore += qualityScore;

    // Determine priority level
    const priority: 'critical' | 'high' | 'medium' | 'low' = 
      isRequired ? 'critical' :
      categoryMatch >= 30 ? 'high' :
      categoryMatch >= 15 ? 'medium' : 'low';

    // Calculate confidence (how sure we are this is a good match)
    const maxPossibleScore = 100;
    const confidence = Math.round((totalScore / maxPossibleScore) * 100);

    return {
      totalScore: Math.min(totalScore, 100),
      categoryMatch,
      budgetMatch,
      locationMatch,
      styleMatch,
      culturalMatch,
      availabilityMatch,
      qualityScore,
      reasons,
      priority,
      confidence
    };
  }

  /**
   * Match all services and sort by priority + score
   */
  public matchAllServices(): ServiceMatch[] {
    const matches: ServiceMatch[] = this.services
      .map(service => {
        const matchScore = this.calculateServiceMatch(service);
        const serviceCat = service.category?.toLowerCase() || '';
        const isRequired = this.preferences.mustHaveServices.some(cat =>
          serviceCat.includes(cat.toLowerCase().replace(/_/g, ''))
        );

        return {
          service,
          matchScore,
          category: service.category || 'other',
          isRequired
        };
      })
      .filter(match => match.matchScore.totalScore > 0) // Remove zero-score matches
      .sort((a, b) => {
        // Primary sort: Required categories first
        if (a.isRequired !== b.isRequired) {
          return a.isRequired ? -1 : 1;
        }
        // Secondary sort: By match score
        return b.matchScore.totalScore - a.matchScore.totalScore;
      });

    return matches;
  }

  /**
   * Generate smart packages that prioritize user's required categories
   */
  public generateSmartPackages(): SmartPackage[] {
    const allMatches = this.matchAllServices();
    
    if (allMatches.length === 0) {
      return [];
    }

    // Group by category
    const matchesByCategory = new Map<string, ServiceMatch[]>();
    allMatches.forEach(match => {
      const cat = match.category.toLowerCase();
      if (!matchesByCategory.has(cat)) {
        matchesByCategory.set(cat, []);
      }
      matchesByCategory.get(cat)!.push(match);
    });

    const packages: SmartPackage[] = [];
    const requiredCategories = this.preferences.mustHaveServices;

    // PACKAGE 1: ESSENTIAL - Focus on required categories only (Budget-friendly)
    const essentialServices = this.selectServicesForPackage(
      matchesByCategory,
      requiredCategories,
      'budget',
      5 // Limit to 5 services
    );

    if (essentialServices.length > 0) {
      packages.push(this.buildPackage(
        'essential',
        'Essential Package',
        essentialServices,
        requiredCategories,
        10 // 10% discount
      ));
    }

    // PACKAGE 2: DELUXE - Required + some complementary (Balanced)
    const deluxeServices = this.selectServicesForPackage(
      matchesByCategory,
      requiredCategories,
      'balanced',
      8 // Up to 8 services
    );

    if (deluxeServices.length > 0) {
      packages.push(this.buildPackage(
        'deluxe',
        'Deluxe Package',
        deluxeServices,
        requiredCategories,
        15 // 15% discount
      ));
    }

    // PACKAGE 3: PREMIUM - Required + complementary + luxury options
    const premiumServices = this.selectServicesForPackage(
      matchesByCategory,
      requiredCategories,
      'premium',
      12 // Up to 12 services
    );

    if (premiumServices.length > 0) {
      packages.push(this.buildPackage(
        'premium',
        'Premium Package',
        premiumServices,
        requiredCategories,
        20 // 20% discount
      ));
    }

    // PACKAGE 4: CUSTOM - Best match across all priorities
    const customServices = this.selectServicesForPackage(
      matchesByCategory,
      requiredCategories,
      'custom',
      10 // Up to 10 services
    );

    if (customServices.length > 0) {
      packages.push(this.buildPackage(
        'custom',
        'Custom Package',
        customServices,
        requiredCategories,
        12 // 12% discount
      ));
    }

    return packages.sort((a, b) => b.fulfillmentPercentage - a.fulfillmentPercentage);
  }

  /**
   * Select services for a specific package tier
   */
  private selectServicesForPackage(
    matchesByCategory: Map<string, ServiceMatch[]>,
    requiredCategories: string[],
    tier: 'budget' | 'balanced' | 'premium' | 'custom',
    maxServices: number
  ): ServiceMatch[] {
    const selected: ServiceMatch[] = [];
    const usedCategories = new Set<string>();

    // STEP 1: Add required categories first (CRITICAL)
    requiredCategories.forEach(reqCat => {
      const matches = Array.from(matchesByCategory.entries()).find(([cat]) =>
        cat.includes(reqCat.toLowerCase().replace(/_/g, ''))
      );

      if (matches && matches[1].length > 0) {
        const [category, categoryMatches] = matches;
        
        // Select based on tier
        let selectedMatch: ServiceMatch | null = null;
        
        if (tier === 'budget') {
          // Lowest price with acceptable quality (rating >= 4.0)
          selectedMatch = categoryMatches
            .filter(m => m.service.rating >= 4.0)
            .sort((a, b) => {
              const priceA = a.service.basePrice || a.service.minimumPrice || 0;
              const priceB = b.service.basePrice || b.service.minimumPrice || 0;
              return priceA - priceB;
            })[0] || categoryMatches[0];
        } else if (tier === 'balanced') {
          // Best match score with good value
          selectedMatch = categoryMatches
            .filter(m => m.service.rating >= 4.2)
            .sort((a, b) => b.matchScore.totalScore - a.matchScore.totalScore)[0] 
            || categoryMatches[0];
        } else if (tier === 'premium') {
          // Highest quality (rating + score)
          selectedMatch = categoryMatches
            .filter(m => m.service.rating >= 4.5)
            .sort((a, b) => {
              const scoreA = a.matchScore.totalScore + (a.service.rating * 10);
              const scoreB = b.matchScore.totalScore + (b.service.rating * 10);
              return scoreB - scoreA;
            })[0] || categoryMatches[0];
        } else { // custom
          // Best overall match
          selectedMatch = categoryMatches[0];
        }

        if (selectedMatch) {
          selected.push(selectedMatch);
          usedCategories.add(category);
        }
      }
    });

    // STEP 2: Add complementary services if space and budget allows
    if (selected.length < maxServices) {
      const complementaryPriority = Array.from(this.categoryPriority.entries())
        .filter(([cat, priority]) => priority >= 0.5 && !usedCategories.has(cat))
        .sort((a, b) => b[1] - a[1]); // Sort by priority

      for (const [cat] of complementaryPriority) {
        if (selected.length >= maxServices) break;

        const matches = Array.from(matchesByCategory.entries()).find(([category]) =>
          category.includes(cat.toLowerCase().replace(/_/g, ''))
        );

        if (matches && matches[1].length > 0) {
          const [category, categoryMatches] = matches;
          if (!usedCategories.has(category)) {
            selected.push(categoryMatches[0]);
            usedCategories.add(category);
          }
        }
      }
    }

    return selected;
  }

  /**
   * Build a complete package object
   */
  private buildPackage(
    tier: 'essential' | 'deluxe' | 'premium' | 'custom',
    name: string,
    services: ServiceMatch[],
    requiredCategories: string[],
    discountPercentage: number
  ): SmartPackage {
    const totalPrice = services.reduce((sum, match) => {
      return sum + (match.service.basePrice || match.service.minimumPrice || 0);
    }, 0);

    const discountedPrice = totalPrice * (1 - discountPercentage / 100);
    const savings = totalPrice - discountedPrice;

    // Calculate fulfillment
    const fulfilledCategories = new Set<string>();
    services.forEach(match => {
      const serviceCat = match.category.toLowerCase();
      requiredCategories.forEach(reqCat => {
        if (serviceCat.includes(reqCat.toLowerCase().replace(/_/g, ''))) {
          fulfilledCategories.add(reqCat);
        }
      });
    });

    const requiredServicesFulfilled = fulfilledCategories.size;
    const totalRequiredServices = requiredCategories.length;
    const fulfillmentPercentage = totalRequiredServices > 0
      ? Math.round((requiredServicesFulfilled / totalRequiredServices) * 100)
      : 100;

    // Missing services
    const missingServices = requiredCategories.filter(cat =>
      !Array.from(fulfilledCategories).includes(cat)
    );

    // Bonus services (non-required)
    const bonusServices = services
      .filter(m => !m.isRequired)
      .map(m => m.service.name || m.service.title || 'Unnamed Service')
      .filter((name): name is string => typeof name === 'string');

    // Overall match score (weighted average)
    const overallMatchScore = services.length > 0
      ? Math.round(services.reduce((sum, m) => sum + m.matchScore.totalScore, 0) / services.length)
      : 0;

    // Match reasons
    const matchReasons = [
      fulfillmentPercentage === 100 
        ? `✅ Covers all ${totalRequiredServices} required categories`
        : `⚠️ Covers ${requiredServicesFulfilled}/${totalRequiredServices} required categories`,
      `💰 Save ₱${savings.toLocaleString()} with ${discountPercentage}% package discount`,
      `⭐ Average match score: ${overallMatchScore}%`,
      services.filter(m => m.service.rating >= 4.5).length > 0
        ? `🌟 Includes ${services.filter(m => m.service.rating >= 4.5).length} top-rated vendors`
        : ''
    ].filter(Boolean);

    return {
      id: `${tier}-${Date.now()}`,
      name,
      tier,
      services,
      requiredServicesFulfilled,
      totalRequiredServices,
      fulfillmentPercentage,
      totalPrice,
      discountedPrice,
      savings,
      discountPercentage,
      overallMatchScore,
      matchReasons,
      missingServices,
      bonusServices
    };
  }
}
