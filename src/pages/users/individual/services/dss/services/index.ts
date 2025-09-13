/**
 * DSS Core Services Module
 * Centralized business logic and API services for the Decision Support System
 */

import type { Service } from '../../../../../../modules/services/types';
import type { 
  DSSRecommendation, 
  BudgetAnalysis, 
  CurrencyConfig,
  LocationData
} from '../types';

// Currency detection and conversion service
export class CurrencyService {
  private static currencies: Record<string, CurrencyConfig> = {
    'US': { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
    'CA': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.35 },
    'GB': { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.82 },
    'AU': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.52 },
    'NZ': { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rate: 1.65 },
    'IN': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.15 },
    'EU': { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
    'SG': { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.36 },
    'HK': { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rate: 7.82 }
  };

  static async detectLocationAndCurrency(location?: string): Promise<LocationData> {
    try {
      // Try to detect from browser geolocation API first
      if (navigator.geolocation && !location) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        
        // Convert coordinates to country code (simplified)
        const countryCode = await this.getCountryFromCoords(
          position.coords.latitude, 
          position.coords.longitude
        );
        
        return {
          country: countryCode,
          region: '',
          currency: this.currencies[countryCode] || this.currencies['US'],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        };
      }

      // Fallback to location string analysis
      if (location) {
        const countryCode = this.detectCountryFromLocation(location);
        return {
          country: countryCode,
          region: location,
          currency: this.currencies[countryCode] || this.currencies['US'],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      }

      // Ultimate fallback - detect from browser locale
      const locale = navigator.language || 'en-US';
      const countryCode = locale.split('-')[1] || 'US';
      
      return {
        country: countryCode,
        region: '',
        currency: this.currencies[countryCode] || this.currencies['US'],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    } catch (error) {
      console.warn('Currency detection failed, using USD:', error);
      return {
        country: 'US',
        region: '',
        currency: this.currencies['US'],
        timezone: 'America/New_York'
      };
    }
  }

  private static async getCountryFromCoords(lat: number, lng: number): Promise<string> {
    try {
      // In a real implementation, you'd use a geocoding service
      // For now, simplified logic based on coordinates
      if (lat > 49 && lng < -60 && lng > -141) return 'CA'; // Canada
      if (lat > 24 && lat < 50 && lng > -125 && lng < -66) return 'US'; // USA
      if (lat > 50 && lng > -8 && lng < 2) return 'GB'; // UK
      if (lat < -10 && lng > 113 && lng < 154) return 'AU'; // Australia
      if (lat > 1 && lat < 2 && lng > 103 && lng < 105) return 'SG'; // Singapore
      if (lat > 22 && lat < 23 && lng > 114 && lng < 115) return 'HK'; // Hong Kong
      return 'US'; // Default fallback
    } catch {
      return 'US';
    }
  }

  private static detectCountryFromLocation(location: string): string {
    const locationLower = location.toLowerCase();
    const countryMap: Record<string, string> = {
      'canada': 'CA', 'canadian': 'CA', 'toronto': 'CA', 'vancouver': 'CA', 'montreal': 'CA',
      'australia': 'AU', 'australian': 'AU', 'sydney': 'AU', 'melbourne': 'AU', 'brisbane': 'AU',
      'uk': 'GB', 'britain': 'GB', 'england': 'GB', 'london': 'GB', 'manchester': 'GB',
      'singapore': 'SG', 'hong kong': 'HK', 'india': 'IN', 'mumbai': 'IN', 'delhi': 'IN',
      'new zealand': 'NZ', 'auckland': 'NZ', 'wellington': 'NZ'
    };

    for (const [key, code] of Object.entries(countryMap)) {
      if (locationLower.includes(key)) return code;
    }
    return 'US'; // Default to US
  }

  static formatCurrency(amount: number, currency: CurrencyConfig): string {
    const convertedAmount = amount * currency.rate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(convertedAmount);
  }
}

// Enhanced category pricing with regional variations
export class PricingService {
  private static basePricing: Record<string, number> = {
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
  };

  private static regionalMultipliers: Record<string, number> = {
    'US': 1.0,
    'CA': 0.85,
    'GB': 1.2,
    'AU': 1.1,
    'NZ': 0.9,
    'IN': 0.3,
    'EU': 1.1,
    'SG': 1.15,
    'HK': 1.25
  };

  static getCategoryPrice(category: string, countryCode: string = 'US'): number {
    const basePrice = this.basePricing[category] || 2500;
    const multiplier = this.regionalMultipliers[countryCode] || 1.0;
    return Math.round(basePrice * multiplier);
  }

  static parsePriceRange(priceRange: string, countryCode: string = 'US'): number {
    const ranges = {
      '$': 1000,
      '$$': 3000,
      '$$$': 7000,
      '$$$$': 15000
    };
    const basePrice = ranges[priceRange as keyof typeof ranges] || 5000;
    const multiplier = this.regionalMultipliers[countryCode] || 1.0;
    return Math.round(basePrice * multiplier);
  }
}

// Core recommendation engine
export class RecommendationEngine {
  static calculateBookingScore(reviewCount: number): number {
    const estimatedBookings = reviewCount * 4;
    if (estimatedBookings >= 200) return 25;
    if (estimatedBookings >= 100) return 20;
    if (estimatedBookings >= 50) return 15;
    return 10;
  }

  static calculateValueRating(service: Service, cost: number, budget: number): number {
    const qualityScore = service.rating * 2;
    const featureScore = Math.min(service.features?.length || 0, 10);
    const costEfficiency = Math.max(0, 10 - (cost / budget) * 10);
    return Math.round((qualityScore + featureScore + costEfficiency) / 3);
  }

  static calculateRiskLevel(service: Service): 'low' | 'medium' | 'high' {
    if (service.reviewCount < 10 || service.rating < 3.5) return 'high';
    if (service.reviewCount < 25 || service.rating < 4.0) return 'medium';
    return 'low';
  }

  static scoreService(
    service: Service, 
    budget: number, 
    location: string, 
    priorities: string[],
    countryCode: string = 'US'
  ): DSSRecommendation {
    let score = 0;
    const reasons: string[] = [];

    // Rating Score (25%)
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

    // Popularity Score (20%)
    const bookingScore = this.calculateBookingScore(service.reviewCount) * 0.8;
    score += bookingScore;
    const estimatedBookings = service.reviewCount * 4;
    
    if (estimatedBookings >= 200) {
      reasons.push(`🔥 High demand vendor (${estimatedBookings}+ bookings)`);
    } else if (estimatedBookings >= 100) {
      reasons.push(`📈 Popular vendor (${estimatedBookings}+ bookings)`);
    } else if (estimatedBookings >= 50) {
      reasons.push(`✨ Established vendor (${estimatedBookings}+ bookings)`);
    } else {
      reasons.push(`🌟 New vendor (${estimatedBookings}+ bookings) - Fresh perspective`);
    }

    // Price Score (30%)
    const basePrice = PricingService.parsePriceRange(service.priceRange || '$$$', countryCode) ||
      PricingService.getCategoryPrice(service.category, countryCode);
    const estimatedCost = basePrice * 1.15;
    const budgetPercentage = (estimatedCost / budget) * 100;
    
    let priceScore = 0;
    if (budgetPercentage <= 30) {
      priceScore = 30;
      reasons.push(`💎 Exceptional value - Only ${budgetPercentage.toFixed(0)}% of budget`);
    } else if (budgetPercentage <= 70) {
      priceScore = 25;
      reasons.push(`💵 Great value - ${budgetPercentage.toFixed(0)}% of budget`);
    } else if (budgetPercentage <= 110) {
      priceScore = 18;
      reasons.push(`⚖️ Within budget range - ${budgetPercentage.toFixed(0)}% of budget`);
    } else {
      priceScore = 10;
      reasons.push(`✨ Luxury option - ${budgetPercentage.toFixed(0)}% (dream choice)`);
    }
    score += priceScore;

    // Location & Suitability (15%)
    let suitabilityScore = 0;
    if (location && service.location?.toLowerCase().includes(location.toLowerCase())) {
      suitabilityScore += 6;
      reasons.push(`📍 Perfect location match in ${location}`);
    } else if (location && service.location) {
      const locationWords = location.toLowerCase().split(/[\s,.-]+/);
      const serviceLocation = service.location.toLowerCase();
      const matches = locationWords.filter(word => 
        word.length > 2 && serviceLocation.includes(word)
      );
      if (matches.length > 0) {
        suitabilityScore += 4;
        reasons.push(`📍 Near your location`);
      } else {
        suitabilityScore += 2;
        reasons.push(`📍 Regional service provider`);
      }
    } else {
      suitabilityScore += 3;
    }

    if (service.availability) {
      suitabilityScore += 3;
      reasons.push(`✅ Available for immediate booking`);
    }

    const featureCount = service.features?.length || 0;
    if (featureCount >= 3) {
      suitabilityScore += 3;
      reasons.push(`🎯 Multiple specialties (${featureCount} services)`);
    }
    score += suitabilityScore;

    // Priority & Category (10%)
    let categoryScore = 0;
    if (priorities.includes(service.category)) {
      categoryScore += 6;
      reasons.push(`⭐ Priority category for your wedding`);
    } else {
      categoryScore += 3;
      reasons.push(`🔄 Complementary service for complete planning`);
    }

    const essentialCategories = ['Photography', 'Venue', 'Catering'];
    if (essentialCategories.includes(service.category)) {
      categoryScore += 2;
      reasons.push(`🏆 Essential wedding service`);
    }
    score += categoryScore;

    // Priority calculation
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (score >= 65) priority = 'high';
    else if (score >= 40) priority = 'medium';

    const valueRating = this.calculateValueRating(service, estimatedCost, budget);
    const riskLevel = this.calculateRiskLevel(service);

    return {
      serviceId: service.id,
      score: Math.round(score),
      reasons: reasons.slice(0, 6),
      priority,
      category: service.category,
      estimatedCost,
      valueRating,
      riskLevel
    };
  }
}

// Main DSS Service class - contains all recommendation logic
export class DSSService {
  static generateRecommendations(
    services: Service[], 
    criteria: {
      budget: number;
      location: string;
      weddingDate?: Date;
      guestCount?: number;
      priorities: string[];
    }
  ): DSSRecommendation[] {
    const { budget, /* location, */ priorities } = criteria;
    
    return services.map(service => {
      const categoryPrice = PricingService.getCategoryPrice(service.category, 'US');
      const score = this.calculateRecommendationScore(service, criteria);
      const reasons = this.generateReasons(service, criteria);
      const priority = this.determinePriority(service, priorities);
      const valueRating = RecommendationEngine.calculateValueRating(service, categoryPrice, budget);
      const riskLevel = RecommendationEngine.calculateRiskLevel(service);

      return {
        serviceId: service.id,
        score,
        reasons,
        priority,
        category: service.category,
        estimatedCost: categoryPrice,
        valueRating,
        riskLevel
      };
    }).sort((a, b) => b.score - a.score);
  }

  private static calculateRecommendationScore(
    service: Service, 
    criteria: { budget: number; location: string; priorities: string[] }
  ): number {
    let score = 0;
    
    // Base rating score (0-40 points)
    score += service.rating * 8;
    
    // Review count bonus (0-20 points)
    score += Math.min(service.reviewCount / 5, 20);
    
    // Category priority bonus (0-30 points)
    if (criteria.priorities.includes(service.category)) {
      score += 30;
    }
    
    // Location proximity (0-10 points)
    if (service.location?.toLowerCase().includes(criteria.location.toLowerCase())) {
      score += 10;
    }
    
    return Math.round(score);
  }

  private static generateReasons(
    service: Service, 
    criteria: { budget: number; location: string; priorities: string[] }
  ): string[] {
    const reasons: string[] = [];
    
    if (service.rating >= 4.5) {
      reasons.push('Excellent customer reviews');
    }
    
    if (service.reviewCount >= 50) {
      reasons.push('Proven track record with many bookings');
    }
    
    if (criteria.priorities.includes(service.category)) {
      reasons.push('Matches your priority categories');
    }
    
    if (service.location?.toLowerCase().includes(criteria.location.toLowerCase())) {
      reasons.push('Located in your area');
    }
    
    if (service.features && service.features.length > 5) {
      reasons.push('Comprehensive service offerings');
    }
    
    return reasons.slice(0, 3); // Limit to top 3 reasons
  }

  private static determinePriority(
    service: Service, 
    priorities: string[]
  ): 'high' | 'medium' | 'low' {
    if (priorities.includes(service.category)) {
      return 'high';
    }
    
    if (service.rating >= 4.5 && service.reviewCount >= 30) {
      return 'medium';
    }
    
    return 'low';
  }
}

// Budget analysis service
export class BudgetAnalysisService {
  static analyze(recommendations: DSSRecommendation[], budget: number): BudgetAnalysis {
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
  }
}

// Real API service integration
export class VendorAPIService {
  private static baseURL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-backend.onrender.com/api';

  static async getServices(filters?: {
    category?: string;
    location?: string;
    minRating?: number;
    maxPrice?: number;
  }): Promise<Service[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.set('category', filters.category);
      if (filters?.location) params.set('location', filters.location);
      if (filters?.minRating) params.set('minRating', filters.minRating.toString());
      if (filters?.maxPrice) params.set('maxPrice', filters.maxPrice.toString());

      const response = await fetch(`${this.baseURL}/services?${params}`);
      if (!response.ok) throw new Error('Failed to fetch services');
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      // Return empty array or cached data as fallback
      return [];
    }
  }

  static async bookService(serviceId: string, bookingData: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          serviceId,
          ...bookingData
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Booking Error:', error);
      return false;
    }
  }

  static async saveRecommendation(serviceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/user/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ serviceId })
      });

      return response.ok;
    } catch (error) {
      console.error('Save Error:', error);
      return false;
    }
  }

  static async contactVendor(serviceId: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          serviceId,
          message,
          type: 'inquiry'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Contact Error:', error);
      return false;
    }
  }
}
