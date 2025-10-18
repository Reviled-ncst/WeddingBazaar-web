import type { Service } from '../../../../../modules/services/types';

/**
 * Decision Support System (DSS) API Service
 * 
 * Provides intelligent wedding service recommendations based on:
 * - Budget optimization and allocation
 * - Vendor quality and reliability metrics
 * - Location and availability matching
 * - User preferences and priorities
 * - Wedding style and guest count considerations
 * 
 * Features:
 * - Multi-factor scoring algorithm (Quality 30%, Experience 25%, Price 25%, Location 10%, Priority 10%)
 * - Real-time vendor and service data integration
 * - Local fallback recommendation generation
 * - Comprehensive reasoning for each recommendation
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DSSVendor {
  id: string;
  businessName: string;
  businessType: string;
  description: string;
  rating: number;
  reviewCount: number;
  location: string;
  priceRange: string;
  startingPrice: number;
  yearsExperience: number;
  verified: boolean;
  portfolioImages: string[];
  portfolioUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DSSService {
  id: string;
  vendorId: string;
  name: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  featured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DSSRecommendation {
  serviceId: string;
  vendorId: string;
  score: number;
  reasons: RecommendationReason[];
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedCost: number;
  valueRating: number;
  riskLevel: 'low' | 'medium' | 'high';
  vendor: DSSVendor;
  service: DSSService;
  matchPercentage: number;
  costEfficiency: number;
  qualityScore: number;
  popularityScore: number;
  aiInsight?: string;
}

export interface RecommendationReason {
  icon: string;
  type: 'quality' | 'experience' | 'price' | 'location' | 'priority' | 'popularity' | 'verification';
  title: string;
  description: string;
  weight: number;
  score: number;
}

export interface DSSAnalysisParams {
  budget?: number;
  location?: string;
  weddingDate?: Date;
  guestCount?: number;
  priorities?: string[];
  categories?: string[];
  priceRange?: [number, number];
  weddingStyle?: 'classic' | 'modern' | 'rustic' | 'luxury' | 'bohemian' | 'minimalist';
}

export interface DSSInsight {
  type: 'budget' | 'quality' | 'availability' | 'opportunity' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendations: string[];
}

// ============================================================================
// DSS API SERVICE CLASS
// ============================================================================

class DSSApiService {
  private baseUrl = '/api/dss';
  private readonly MAX_SCORE = 100;
  private readonly MIN_RECOMMENDATION_SCORE = 40;
  private readonly TOP_RECOMMENDATIONS_LIMIT = 50;

  // Scoring weights for different factors
  private readonly WEIGHTS = {
    QUALITY: 0.30,      // 30% - Vendor rating and review quality
    EXPERIENCE: 0.25,   // 25% - Years of experience, review count, verification
    PRICE: 0.25,        // 25% - Budget compatibility and cost efficiency
    LOCATION: 0.10,     // 10% - Geographic match
    PRIORITY: 0.10      // 10% - User category preferences
  };

  /**
   * Fetch all vendors and services for DSS analysis
   * @returns Promise with vendors and services data
   */
  async getVendorsAndServices(): Promise<{ vendors: DSSVendor[], services: DSSService[] }> {
    try {
      console.log('📊 [DSS API] Fetching vendor and service data...');
      
      const response = await fetch(`${this.baseUrl}/data`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('⚠️ [DSS API] Server request failed, using fallback');
        return this.getFallbackData();
      }

      const data = await response.json();
      console.log('✅ [DSS API] Data fetched successfully:', {
        vendors: data.vendors?.length || 0,
        services: data.services?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      return {
        vendors: data.vendors || [],
        services: data.services || []
      };
    } catch (error) {
      console.error('❌ [DSS API] Error fetching data:', error);
      return this.getFallbackData();
    }
  }

  /**
   * Generate intelligent recommendations based on user parameters
   * @param params Analysis parameters (budget, location, priorities, etc.)
   * @returns Promise with scored and ranked recommendations
   */
  async generateRecommendations(params: DSSAnalysisParams): Promise<DSSRecommendation[]> {
    try {
      console.log('🧠 [DSS API] Generating intelligent recommendations...');
      console.log('📋 [DSS API] Parameters:', {
        budget: params.budget,
        location: params.location,
        weddingDate: params.weddingDate,
        guestCount: params.guestCount,
        priorities: params.priorities?.length || 0,
        categories: params.categories?.length || 0,
        style: params.weddingStyle
      });
      
      const response = await fetch(`${this.baseUrl}/recommendations`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        console.warn('⚠️ [DSS API] Server recommendations failed, using local analysis');
        return this.generateLocalRecommendations(params);
      }

      const data = await response.json();
      const recommendations = data.recommendations || [];
      
      console.log('✅ [DSS API] Server recommendations generated:', {
        total: recommendations.length,
        highPriority: recommendations.filter((r: any) => r.priority === 'high').length,
        avgScore: recommendations.length > 0 
          ? (recommendations.reduce((sum: number, r: any) => sum + r.score, 0) / recommendations.length).toFixed(1)
          : 0
      });
      
      return recommendations;
    } catch (error) {
      console.error('❌ [DSS API] Error generating recommendations:', error);
      return this.generateLocalRecommendations(params);
    }
  }

  /**
   * Generate recommendations locally using client-side algorithm
   * @param params Analysis parameters
   * @returns Promise with scored recommendations
   */
  private async generateLocalRecommendations(params: DSSAnalysisParams): Promise<DSSRecommendation[]> {
    console.log('🔄 [DSS API] Generating local recommendations with intelligent scoring...');
    
    const { vendors, services } = await this.getVendorsAndServices();
    
    if (!vendors.length || !services.length) {
      console.warn('⚠️ [DSS API] No data available for recommendations');
      return [];
    }

    const recommendations: DSSRecommendation[] = [];
    let processedCount = 0;

    // Process each service
    for (const service of services) {
      if (!service.isActive) continue;
      
      const vendor = vendors.find(v => v.id === service.vendorId);
      if (!vendor) continue;

      processedCount++;
      const recommendation = this.calculateIntelligentScore(vendor, service, params);
      
      // Only include services that meet minimum threshold
      if (recommendation.score >= this.MIN_RECOMMENDATION_SCORE) {
        recommendations.push(recommendation);
      }
    }

    // Sort by score and limit results
    const sortedRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, this.TOP_RECOMMENDATIONS_LIMIT);

    console.log('✅ [DSS API] Local recommendations complete:', {
      processed: processedCount,
      qualified: recommendations.length,
      returned: sortedRecommendations.length,
      avgScore: sortedRecommendations.length > 0
        ? (sortedRecommendations.reduce((sum, r) => sum + r.score, 0) / sortedRecommendations.length).toFixed(1)
        : 0
    });

    return sortedRecommendations;
  }

  /**
   * Calculate intelligent recommendation score with detailed reasoning
   * @param vendor Vendor information
   * @param service Service details
   * @param params User parameters
   * @returns Complete recommendation with scores and reasons
   */
  private calculateIntelligentScore(
    vendor: DSSVendor, 
    service: DSSService, 
    params: DSSAnalysisParams
  ): DSSRecommendation {
    const { budget = 50000, location = '', priorities = [] } = params;
    
    let totalScore = 0;
    const reasons: RecommendationReason[] = [];

    // ========================================================================
    // 1. QUALITY SCORE (30%)
    // ========================================================================
    const qualityScore = this.calculateQualityScore(vendor, reasons);
    totalScore += qualityScore * this.WEIGHTS.QUALITY * this.MAX_SCORE;

    // ========================================================================
    // 2. EXPERIENCE & CREDIBILITY SCORE (25%)
    // ========================================================================
    const experienceScore = this.calculateExperienceScore(vendor, reasons);
    totalScore += experienceScore * this.WEIGHTS.EXPERIENCE * this.MAX_SCORE;

    // ========================================================================
    // 3. PRICE COMPATIBILITY SCORE (25%)
    // ========================================================================
    const budgetPercentage = (service.price / budget) * 100;
    const priceScore = this.calculatePriceScore(service, budget, budgetPercentage, reasons);
    totalScore += priceScore * this.WEIGHTS.PRICE * this.MAX_SCORE;

    // ========================================================================
    // 4. LOCATION MATCH SCORE (10%)
    // ========================================================================
    const locationScore = this.calculateLocationScore(vendor, location, reasons);
    totalScore += locationScore * this.WEIGHTS.LOCATION * this.MAX_SCORE;

    // ========================================================================
    // 5. CATEGORY PRIORITY SCORE (10%)
    // ========================================================================
    const priorityScore = this.calculatePriorityScore(service, priorities, reasons);
    totalScore += priorityScore * this.WEIGHTS.PRIORITY * this.MAX_SCORE;

    // ========================================================================
    // ADDITIONAL METRICS
    // ========================================================================
    const matchPercentage = this.calculateMatchPercentage(vendor, service, params);
    const costEfficiency = this.calculateCostEfficiency(service, vendor, budget);
    const popularityScore = this.calculatePopularityScore(vendor);

    // ========================================================================
    // DETERMINE PRIORITY LEVEL
    // ========================================================================
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (totalScore >= 75) priority = 'high';
    else if (totalScore >= 55) priority = 'medium';

    // ========================================================================
    // DETERMINE RISK LEVEL
    // ========================================================================
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (vendor.reviewCount < 10 || vendor.rating < 3.5) riskLevel = 'high';
    else if (vendor.reviewCount < 25 || vendor.rating < 4.0) riskLevel = 'medium';

    // ========================================================================
    // GENERATE AI INSIGHT
    // ========================================================================
    const aiInsight = this.generateAIInsight(vendor, service, totalScore, priority, budgetPercentage);

    // Keep only top 5 most impactful reasons
    const topReasons = reasons
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      serviceId: service.id,
      vendorId: vendor.id,
      score: Math.round(totalScore),
      reasons: topReasons,
      priority,
      category: service.category,
      estimatedCost: service.price,
      valueRating: Math.min(Math.round((qualityScore + costEfficiency) / 2 * 10), 10),
      riskLevel,
      vendor,
      service,
      matchPercentage,
      costEfficiency: Math.round(costEfficiency * 100),
      qualityScore: Math.round(qualityScore * 100),
      popularityScore: Math.round(popularityScore * 100),
      aiInsight
    };
  }

  // ============================================================================
  // SCORING CALCULATION METHODS
  // ============================================================================

  private calculateQualityScore(vendor: DSSVendor, reasons: RecommendationReason[]): number {
    const ratingScore = vendor.rating / 5; // Normalize to 0-1
    
    let reason: RecommendationReason;
    
    if (vendor.rating >= 4.8) {
      reason = {
        icon: '⭐',
        type: 'quality',
        title: 'Outstanding Quality',
        description: `Exceptional ${vendor.rating}/5 rating demonstrates premium service quality and customer satisfaction`,
        weight: this.WEIGHTS.QUALITY,
        score: 100
      };
    } else if (vendor.rating >= 4.5) {
      reason = {
        icon: '⭐',
        type: 'quality',
        title: 'Excellent Quality',
        description: `Impressive ${vendor.rating}/5 rating shows consistently high-quality service delivery`,
        weight: this.WEIGHTS.QUALITY,
        score: 90
      };
    } else if (vendor.rating >= 4.0) {
      reason = {
        icon: '⭐',
        type: 'quality',
        title: 'Reliable Quality',
        description: `Solid ${vendor.rating}/5 rating indicates dependable service you can trust`,
        weight: this.WEIGHTS.QUALITY,
        score: 75
      };
    } else if (vendor.rating >= 3.5) {
      reason = {
        icon: '⭐',
        type: 'quality',
        title: 'Good Service',
        description: `${vendor.rating}/5 rating shows good service with room for excellence`,
        weight: this.WEIGHTS.QUALITY,
        score: 60
      };
    } else {
      reason = {
        icon: '⚠️',
        type: 'quality',
        title: 'Developing Reputation',
        description: `${vendor.rating}/5 rating - newer vendor building their reputation`,
        weight: this.WEIGHTS.QUALITY,
        score: 40
      };
    }
    
    reasons.push(reason);
    return ratingScore;
  }

  private calculateExperienceScore(vendor: DSSVendor, reasons: RecommendationReason[]): number {
    let experienceScore = 0;
    
    // Years of experience (50% of experience score)
    const yearsRatio = Math.min(vendor.yearsExperience / 15, 1); // Cap at 15 years
    experienceScore += yearsRatio * 0.5;
    
    if (vendor.yearsExperience >= 10) {
      reasons.push({
        icon: '🏆',
        type: 'experience',
        title: 'Seasoned Professional',
        description: `${vendor.yearsExperience} years of expertise ensures masterful execution of your vision`,
        weight: this.WEIGHTS.EXPERIENCE * 0.5,
        score: 100
      });
    } else if (vendor.yearsExperience >= 5) {
      reasons.push({
        icon: '📈',
        type: 'experience',
        title: 'Experienced Provider',
        description: `${vendor.yearsExperience} years of proven track record in wedding services`,
        weight: this.WEIGHTS.EXPERIENCE * 0.5,
        score: 80
      });
    } else if (vendor.yearsExperience >= 2) {
      reasons.push({
        icon: '🌱',
        type: 'experience',
        title: 'Growing Expertise',
        description: `${vendor.yearsExperience} years experience with fresh, innovative approaches`,
        weight: this.WEIGHTS.EXPERIENCE * 0.5,
        score: 60
      });
    }

    // Review count / Popularity (40% of experience score)
    const reviewRatio = Math.min(vendor.reviewCount / 100, 1); // Cap at 100 reviews
    experienceScore += reviewRatio * 0.4;
    
    if (vendor.reviewCount >= 50) {
      reasons.push({
        icon: '🔥',
        type: 'popularity',
        title: 'Highly Sought After',
        description: `${vendor.reviewCount} reviews demonstrate strong market trust and popularity`,
        weight: this.WEIGHTS.EXPERIENCE * 0.4,
        score: 100
      });
    } else if (vendor.reviewCount >= 25) {
      reasons.push({
        icon: '📊',
        type: 'popularity',
        title: 'Well Established',
        description: `${vendor.reviewCount} satisfied clients validate their service excellence`,
        weight: this.WEIGHTS.EXPERIENCE * 0.4,
        score: 75
      });
    } else if (vendor.reviewCount >= 10) {
      reasons.push({
        icon: '⭐',
        type: 'popularity',
        title: 'Building Reputation',
        description: `${vendor.reviewCount} reviews show growing client satisfaction`,
        weight: this.WEIGHTS.EXPERIENCE * 0.4,
        score: 50
      });
    }

    // Verification status (10% of experience score)
    if (vendor.verified) {
      experienceScore += 0.1;
      reasons.push({
        icon: '✅',
        type: 'verification',
        title: 'Platform Verified',
        description: 'Fully verified vendor meeting our quality and security standards',
        weight: this.WEIGHTS.EXPERIENCE * 0.1,
        score: 100
      });
    }

    return experienceScore;
  }

  private calculatePriceScore(
    service: DSSService, 
    budget: number, 
    budgetPercentage: number, 
    reasons: RecommendationReason[]
  ): number {
    let priceScore = 0;
    
    if (budgetPercentage <= 10) {
      priceScore = 1.0;
      reasons.push({
        icon: '💚',
        type: 'price',
        title: 'Exceptional Value',
        description: `Only ${budgetPercentage.toFixed(1)}% of budget - Outstanding cost efficiency for quality service`,
        weight: this.WEIGHTS.PRICE,
        score: 100
      });
    } else if (budgetPercentage <= 20) {
      priceScore = 0.95;
      reasons.push({
        icon: '💰',
        type: 'price',
        title: 'Excellent Value',
        description: `${budgetPercentage.toFixed(1)}% of budget - Great pricing with strong quality-cost ratio`,
        weight: this.WEIGHTS.PRICE,
        score: 95
      });
    } else if (budgetPercentage <= 30) {
      priceScore = 0.85;
      reasons.push({
        icon: '💵',
        type: 'price',
        title: 'Good Value',
        description: `${budgetPercentage.toFixed(1)}% of budget - Well-balanced pricing for quality received`,
        weight: this.WEIGHTS.PRICE,
        score: 85
      });
    } else if (budgetPercentage <= 45) {
      priceScore = 0.70;
      reasons.push({
        icon: '⚖️',
        type: 'price',
        title: 'Fair Investment',
        description: `${budgetPercentage.toFixed(1)}% of budget - Reasonable cost for premium service quality`,
        weight: this.WEIGHTS.PRICE,
        score: 70
      });
    } else if (budgetPercentage <= 60) {
      priceScore = 0.55;
      reasons.push({
        icon: '💎',
        type: 'price',
        title: 'Premium Option',
        description: `${budgetPercentage.toFixed(1)}% of budget - Higher investment for luxury experience`,
        weight: this.WEIGHTS.PRICE,
        score: 55
      });
    } else {
      priceScore = 0.35;
      reasons.push({
        icon: '👑',
        type: 'price',
        title: 'Luxury Choice',
        description: `${budgetPercentage.toFixed(1)}% of budget - Ultra-premium service for those seeking the best`,
        weight: this.WEIGHTS.PRICE,
        score: 35
      });
    }

    return priceScore;
  }

  private calculateLocationScore(vendor: DSSVendor, location: string, reasons: RecommendationReason[]): number {
    if (!location) {
      return 0.7; // Neutral score when no location preference
    }

    const isMatch = vendor.location.toLowerCase().includes(location.toLowerCase());
    
    if (isMatch) {
      reasons.push({
        icon: '📍',
        type: 'location',
        title: 'Perfect Location',
        description: `Based in ${vendor.location} - Convenient local service with no travel surcharges`,
        weight: this.WEIGHTS.LOCATION,
        score: 100
      });
      return 1.0;
    } else {
      reasons.push({
        icon: '🗺️',
        type: 'location',
        title: 'Regional Service',
        description: `Services ${vendor.location} area - May include travel costs`,
        weight: this.WEIGHTS.LOCATION,
        score: 50
      });
      return 0.5;
    }
  }

  private calculatePriorityScore(service: DSSService, priorities: string[], reasons: RecommendationReason[]): number {
    if (!priorities.length) {
      return 0.6; // Neutral score when no priorities set
    }

    const isPriority = priorities.some(p => 
      service.category.toLowerCase().includes(p.toLowerCase()) ||
      p.toLowerCase().includes(service.category.toLowerCase())
    );
    
    if (isPriority) {
      reasons.push({
        icon: '🎯',
        type: 'priority',
        title: 'Priority Category',
        description: `${service.category} matches your essential wedding service priorities`,
        weight: this.WEIGHTS.PRIORITY,
        score: 100
      });
      return 1.0;
    } else {
      return 0.6; // Still valuable, just not priority
    }
  }

  // ============================================================================
  // ADDITIONAL METRICS CALCULATIONS
  // ============================================================================

  private calculateMatchPercentage(vendor: DSSVendor, service: DSSService, params: DSSAnalysisParams): number {
    let matchPoints = 0;
    const totalPoints = 5;

    // Quality match (rating >= 4.0)
    if (vendor.rating >= 4.0) matchPoints++;
    
    // Experience match (years >= 3)
    if (vendor.yearsExperience >= 3) matchPoints++;
    
    // Verification match
    if (vendor.verified) matchPoints++;
    
    // Budget match (within budget)
    if (params.budget && service.price <= params.budget) matchPoints++;
    
    // Location match
    if (!params.location || vendor.location.toLowerCase().includes(params.location.toLowerCase())) {
      matchPoints++;
    }

    return Math.round((matchPoints / totalPoints) * 100);
  }

  private calculateCostEfficiency(service: DSSService, vendor: DSSVendor, _budget: number): number {
    // Calculate value for money (quality vs price)
    const qualityScore = vendor.rating / 5; // 0-1
    const priceRatio = Math.min(service.price / _budget, 1); // 0-1
    const costEfficiency = qualityScore * (1 - priceRatio); // Higher is better
    
    return Math.max(0, Math.min(1, costEfficiency));
  }

  private calculatePopularityScore(vendor: DSSVendor): number {
    // Combine review count and rating for popularity
    const reviewScore = Math.min(vendor.reviewCount / 50, 1); // Cap at 50 reviews
    const ratingScore = vendor.rating / 5;
    
    return (reviewScore * 0.6 + ratingScore * 0.4);
  }

  // ============================================================================
  // AI INSIGHT GENERATION
  // ============================================================================

  private generateAIInsight(
    vendor: DSSVendor, 
    _service: DSSService, 
    _score: number, 
    priority: string,
    budgetPercentage: number
  ): string {
    const insights: string[] = [];

    // Quality-based insights
    if (vendor.rating >= 4.7 && vendor.reviewCount >= 30) {
      insights.push('🌟 Top-tier vendor with proven excellence');
    } else if (vendor.rating >= 4.5) {
      insights.push('⭐ Highly rated with consistent quality');
    }

    // Experience insights
    if (vendor.yearsExperience >= 10 && vendor.verified) {
      insights.push('🏆 Seasoned professional with platform verification');
    } else if (vendor.yearsExperience >= 5) {
      insights.push('📈 Experienced provider with solid track record');
    }

    // Value insights
    if (budgetPercentage <= 20 && vendor.rating >= 4.5) {
      insights.push('💎 Exceptional value - Premium quality at great price');
    } else if (budgetPercentage <= 35) {
      insights.push('💰 Great cost-efficiency for service level');
    }

    // Popularity insights
    if (vendor.reviewCount >= 50) {
      insights.push('🔥 Highly sought-after vendor in high demand');
    }

    // Priority insight
    if (priority === 'high') {
      insights.push('🎯 Strongly recommended for your wedding');
    }

    return insights.slice(0, 2).join(' • ') || 'Quality service option for your wedding';
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Convert DSS data to legacy Service format for compatibility
   */
  convertToLegacyServices(vendors: DSSVendor[], services: DSSService[]): Service[] {
    return services
      .filter(service => service.isActive)
      .map(service => {
        const vendor = vendors.find(v => v.id === service.vendorId);
        if (!vendor) return null;

        return {
          id: service.id,
          name: service.name || service.title,
          category: service.category,
          location: vendor.location,
          rating: vendor.rating,
          reviewCount: vendor.reviewCount,
          priceRange: vendor.priceRange,
          image: service.images[0] || vendor.portfolioImages[0],
          description: service.description,
          features: [
            `${vendor.yearsExperience} years professional experience`,
            vendor.verified ? '✅ Platform verified vendor' : 'Registered vendor',
            `${vendor.reviewCount}+ satisfied clients`,
            'Full portfolio available'
          ],
          availability: true,
          vendorName: vendor.businessName,
          vendorImage: vendor.profileImage || vendor.portfolioImages[0],
          vendorId: vendor.id,
          contactInfo: {
            phone: '(555) 123-4567',
            email: 'contact@vendor.com',
            website: vendor.websiteUrl || vendor.portfolioUrl
          }
        } as Service;
      })
      .filter(Boolean) as Service[];
  }

  /**
   * Get fallback data when API is unavailable
   */
  private getFallbackData(): { vendors: DSSVendor[], services: DSSService[] } {
    console.log('ℹ️ [DSS API] Using fallback empty data');
    return { vendors: [], services: [] };
  }

  /**
   * Generate comprehensive insights for DSS dashboard
   */
  generateInsights(recommendations: DSSRecommendation[], params: DSSAnalysisParams): DSSInsight[] {
    const insights: DSSInsight[] = [];
    const { budget = 50000 } = params;

    // Budget insight
    const totalCost = recommendations.slice(0, 10).reduce((sum, r) => sum + r.estimatedCost, 0);
    const budgetUsage = (totalCost / budget) * 100;
    
    if (budgetUsage > 90) {
      insights.push({
        type: 'warning',
        title: 'Budget Alert',
        description: 'Top recommendations exceed budget allocation',
        impact: 'high',
        recommendations: [
          'Consider adjusting service priorities',
          'Look for package deals to save costs',
          'Explore mid-range alternatives'
        ]
      });
    } else if (budgetUsage < 60) {
      insights.push({
        type: 'opportunity',
        title: 'Budget Opportunity',
        description: 'Room for premium upgrades or additional services',
        impact: 'medium',
        recommendations: [
          'Consider upgrading key services',
          'Add complementary services',
          'Invest in premium experiences'
        ]
      });
    }

    // Quality insight
    const avgQuality = recommendations.slice(0, 10).reduce((sum, r) => sum + r.qualityScore, 0) / 10;
    if (avgQuality >= 85) {
      insights.push({
        type: 'quality',
        title: 'Premium Quality Selection',
        description: 'Top recommendations feature exceptional vendors',
        impact: 'high',
        recommendations: [
          'Consider booking these highly-rated vendors early',
          'Request detailed proposals from top choices',
          'Schedule consultations to confirm fit'
        ]
      });
    }

    return insights;
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const dssApiService = new DSSApiService();
