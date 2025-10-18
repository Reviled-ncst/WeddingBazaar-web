import type { Service } from '../../../../../modules/services/types';

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
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedCost: number;
  valueRating: number;
  riskLevel: 'low' | 'medium' | 'high';
  vendor: DSSVendor;
  service: DSSService;
}

export interface DSSAnalysisParams {
  budget?: number;
  location?: string;
  weddingDate?: Date;
  guestCount?: number;
  priorities?: string[];
  categories?: string[];
  priceRange?: [number, number];
}

class DSSApiService {
  private baseUrl = '/api/dss';

  // Get all vendors and services for DSS analysis
  async getVendorsAndServices(): Promise<{ vendors: DSSVendor[], services: DSSService[] }> {
    try {
      console.log('📊 [DSS] Fetching real vendor and service data...');
      
      const response = await fetch(`${this.baseUrl}/data`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('⚠️ [DSS] API failed, using fallback data');
        return this.getFallbackData();
      }

      const data = await response.json();
      console.log('✅ [DSS] Real data fetched:', {
        vendors: data.vendors?.length || 0,
        services: data.services?.length || 0
      });
      
      return data;
    } catch (error) {
      console.error('❌ [DSS] Error fetching data:', error);
      return this.getFallbackData();
    }
  }

  // Generate recommendations based on real data
  async generateRecommendations(params: DSSAnalysisParams): Promise<DSSRecommendation[]> {
    try {
      console.log('🧠 [DSS] Generating recommendations with params:', params);
      
      const response = await fetch(`${this.baseUrl}/recommendations`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        console.warn('⚠️ [DSS] Recommendations API failed, using local analysis');
        return this.generateLocalRecommendations(params);
      }

      const recommendations = await response.json();
      console.log('✅ [DSS] Server recommendations generated:', recommendations.length);
      
      return recommendations;
    } catch (error) {
      console.error('❌ [DSS] Error generating recommendations:', error);
      return this.generateLocalRecommendations(params);
    }
  }

  // Local fallback recommendation generation
  private async generateLocalRecommendations(params: DSSAnalysisParams): Promise<DSSRecommendation[]> {
    console.log('🔄 [DSS] Generating local recommendations...');
    
    const { vendors, services } = await this.getVendorsAndServices();
    const recommendations: DSSRecommendation[] = [];

    // Enhanced scoring algorithm
    for (const service of services) {
      if (!service.isActive) continue;
      
      const vendor = vendors.find(v => v.id === service.vendorId);
      if (!vendor) continue;

      const recommendation = this.calculateServiceScore(vendor, service, params);
      if (recommendation.score > 30) { // Minimum threshold
        recommendations.push(recommendation);
      }
    }

    // Sort by score and return top 50
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  }

  private calculateServiceScore(vendor: DSSVendor, service: DSSService, params: DSSAnalysisParams): DSSRecommendation {
    let score = 0;
    const reasons: string[] = [];
    const { budget = 50000, location = '', priorities = [] } = params;

    // 1. Quality Score (30%)
    const qualityScore = (vendor.rating / 5) * 30;
    score += qualityScore;
    
    if (vendor.rating >= 4.8) {
      reasons.push(`⭐ Outstanding ${vendor.rating}/5 rating - Premium quality`);
    } else if (vendor.rating >= 4.5) {
      reasons.push(`⭐ Excellent ${vendor.rating}/5 rating - High quality`);
    } else if (vendor.rating >= 4.0) {
      reasons.push(`⭐ Great ${vendor.rating}/5 rating - Reliable service`);
    }

    // 2. Experience & Credibility (25%)
    let experienceScore = 0;
    
    // Years of experience
    if (vendor.yearsExperience >= 10) {
      experienceScore += 10;
      reasons.push(`🏆 ${vendor.yearsExperience} years of professional experience`);
    } else if (vendor.yearsExperience >= 5) {
      experienceScore += 8;
      reasons.push(`📈 ${vendor.yearsExperience} years of experience`);
    } else {
      experienceScore += 5;
      reasons.push(`🌱 ${vendor.yearsExperience} years experience - Fresh perspective`);
    }

    // Review count (popularity)
    if (vendor.reviewCount >= 50) {
      experienceScore += 10;
      reasons.push(`🔥 Highly popular (${vendor.reviewCount} reviews)`);
    } else if (vendor.reviewCount >= 25) {
      experienceScore += 8;
      reasons.push(`📈 Popular vendor (${vendor.reviewCount} reviews)`);
    } else {
      experienceScore += 5;
      reasons.push(`⭐ Growing reputation (${vendor.reviewCount} reviews)`);
    }

    // Verification status
    if (vendor.verified) {
      experienceScore += 5;
      reasons.push(`✅ Verified vendor - Platform approved`);
    }

    score += experienceScore;

    // 3. Price Compatibility (25%)
    const budgetPercentage = (service.price / budget) * 100;
    let priceScore = 0;
    
    if (budgetPercentage <= 15) {
      priceScore = 25;
      reasons.push(`💚 Excellent value - Only ${budgetPercentage.toFixed(0)}% of budget`);
    } else if (budgetPercentage <= 25) {
      priceScore = 22;
      reasons.push(`💰 Great value - ${budgetPercentage.toFixed(0)}% of budget`);
    } else if (budgetPercentage <= 35) {
      priceScore = 18;
      reasons.push(`💵 Good value - ${budgetPercentage.toFixed(0)}% of budget`);
    } else if (budgetPercentage <= 50) {
      priceScore = 15;
      reasons.push(`⚖️ Moderate cost - ${budgetPercentage.toFixed(0)}% of budget`);
    } else {
      priceScore = 10;
      reasons.push(`💎 Premium option - ${budgetPercentage.toFixed(0)}% of budget`);
    }
    
    score += priceScore;

    // 4. Location Match (10%)
    let locationScore = 0;
    if (location && vendor.location.toLowerCase().includes(location.toLowerCase())) {
      locationScore = 10;
      reasons.push(`📍 Perfect location match in ${location}`);
    } else if (location) {
      locationScore = 5;
      reasons.push(`📍 Regional service area`);
    } else {
      locationScore = 7; // No location specified
    }
    score += locationScore;

    // 5. Category Priority (10%)
    let categoryScore = 0;
    if (priorities.includes(service.category)) {
      categoryScore = 10;
      reasons.push(`⭐ Priority category for your wedding`);
    } else {
      categoryScore = 6;
      reasons.push(`🔄 Essential wedding service`);
    }
    score += categoryScore;

    // Calculate priority level
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (score >= 70) priority = 'high';
    else if (score >= 50) priority = 'medium';

    // Calculate value rating
    const valueRating = Math.round((vendor.rating * 2 + (100 - budgetPercentage) / 10) / 2);

    // Calculate risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (vendor.reviewCount < 10 || vendor.rating < 3.5) riskLevel = 'high';
    else if (vendor.reviewCount < 25 || vendor.rating < 4.0) riskLevel = 'medium';

    return {
      serviceId: service.id,
      vendorId: vendor.id,
      score: Math.round(score),
      reasons: reasons.slice(0, 4),
      priority,
      category: service.category,
      estimatedCost: service.price,
      valueRating: Math.min(valueRating, 10),
      riskLevel,
      vendor,
      service
    };
  }

  // Convert to legacy Service format for compatibility
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
            `${vendor.yearsExperience} years experience`,
            vendor.verified ? 'Verified vendor' : 'Platform member',
            'Professional service',
            'Portfolio available'
          ],
          availability: true,
          vendorName: vendor.businessName,
          vendorImage: vendor.profileImage || vendor.portfolioImages[0],
          vendorId: vendor.id,
          contactInfo: {
            phone: '(555) 123-4567', // Default for now
            email: 'contact@vendor.com', // Default for now
            website: vendor.websiteUrl || vendor.portfolioUrl
          }
        } as Service;
      })
      .filter(Boolean) as Service[];
  }

  private getFallbackData(): { vendors: DSSVendor[], services: DSSService[] } {
    // Return empty arrays - will be populated by mock data if needed
    return { vendors: [], services: [] };
  }
}

export const dssApiService = new DSSApiService();
