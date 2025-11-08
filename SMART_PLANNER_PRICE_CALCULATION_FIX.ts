// 🎯 Smart Wedding Planner - Price Calculation Fix
// This code replaces the broken price calculation logic in SmartWeddingPlanner.tsx

import type { Service, ServicePackage } from '../modules/services/types';

// ✅ Calculate price range from service's packages
const calculateServicePriceRange = (service: Service): { min: number; max: number } => {
  const packages = service.packages || [];
  
  if (packages.length === 0) {
    // Fallback to basePrice if no packages
    return {
      min: service.basePrice || service.minimumPrice || 0,
      max: service.basePrice || service.maximumPrice || 0
    };
  }
  
  const prices = packages.map(pkg => pkg.base_price || 0).filter(price => price > 0);
  
  if (prices.length === 0) {
    return { min: 0, max: 0 };
  }
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
};

// ✅ Calculate total price range for multiple services
const calculatePackagePriceRange = (services: Service[]): { min: number; max: number } => {
  let totalMin = 0;
  let totalMax = 0;
  
  for (const service of services) {
    const { min, max } = calculateServicePriceRange(service);
    totalMin += min;
    totalMax += max;
  }
  
  return { min: totalMin, max: totalMax };
};

// ✅ Check if package fits budget (based on minimum price)
const fitsInBudget = (services: Service[], budget: number): boolean => {
  const { min } = calculatePackagePriceRange(services);
  return min <= budget;
};

// ✅ Get best package for allocated budget
const getBestPackageForBudget = (
  service: Service, 
  allocatedBudget: number
): ServicePackage | null => {
  const packages = service.packages || [];
  
  if (packages.length === 0) {
    return null;
  }
  
  // Filter packages that fit allocated budget
  const affordablePackages = packages.filter(pkg => 
    (pkg.base_price || 0) <= allocatedBudget
  );
  
  if (affordablePackages.length === 0) {
    // Return cheapest package even if over budget
    return packages.reduce((min, pkg) => 
      (pkg.base_price || 0) < (min.base_price || Infinity) ? pkg : min
    , packages[0]);
  }
  
  // Return most expensive affordable package (best value)
  return affordablePackages.reduce((best, pkg) => {
    const pkgPrice = pkg.base_price || 0;
    const bestPrice = best.base_price || 0;
    return pkgPrice > bestPrice ? pkg : best;
  }, affordablePackages[0]);
};

// ✅ USAGE IN SmartWeddingPlanner.tsx
// Replace lines 178-300 with this logic:

const createWeddingPackages = (services: Service[], preferences: any) => {
  const packages = [];
  
  // ESSENTIAL PACKAGE
  const essentialServices = [
    getBestService('venue'),
    getBestService('catering'),
    getBestService('photography'),
  ].filter(Boolean);

  if (essentialServices.length > 0) {
    const { min, max } = calculatePackagePriceRange(essentialServices);
    const discountedMin = min * 0.9; // 10% discount
    const discountedMax = max * 0.9;
    
    // ⚠️ Skip if minimum price exceeds budget
    if (!fitsInBudget(essentialServices, preferences.budget)) {
      console.log(`⏭️ Skipping Essential Package: Min ₱${min} > Budget ₱${preferences.budget}`);
    } else {
      // Calculate match score
      let matchScore = 70;
      if (min <= preferences.budget) matchScore += 15;
      if (preferences.weddingType === 'intimate') matchScore += 10;
      if (preferences.priorityServices.length <= 3) matchScore += 5;

      const whyRecommended = [];
      if (min <= preferences.budget) {
        whyRecommended.push(`Within your ₱${preferences.budget.toLocaleString()} budget`);
      }
      if (preferences.weddingType === 'intimate') {
        whyRecommended.push('Perfect for intimate weddings');
      }
      if (preferences.guestCount <= 100) {
        whyRecommended.push(`Suitable for ${preferences.guestCount} guests`);
      }
      whyRecommended.push('Essential services covered');

      const avgRating = essentialServices.reduce((sum, s) => sum + (s?.rating || 0), 0) / essentialServices.length;
      const totalReviews = essentialServices.reduce((sum, s) => sum + (s?.reviewCount || 0), 0);

      packages.push({
        id: 'essential',
        name: 'Essential Package',
        tagline: 'Perfect Start',
        description: 'All the wedding essentials for your special day',
        services: essentialServices,
        minPrice: discountedMin,
        maxPrice: discountedMax,
        priceRange: `₱${discountedMin.toLocaleString()} - ₱${discountedMax.toLocaleString()}`,
        savings: (max - min) * 0.1, // Savings from discount
        matchScore: Math.min(matchScore, 100),
        avgRating,
        totalReviews,
        category: 'essential',
        badge: 'BUDGET-FRIENDLY',
        color: 'from-green-500 to-emerald-600',
        whyRecommended
      });
    }
  }

  // DELUXE PACKAGE
  const deluxeServices = [
    getBestService('venue'),
    getBestService('catering'),
    getBestService('photography'),
    getBestService('videography'),
    getBestService('music_dj'),
    getBestService('flowers_decor'),
  ].filter(Boolean);

  if (deluxeServices.length >= 4) {
    const { min, max } = calculatePackagePriceRange(deluxeServices);
    const discountedMin = min * 0.85; // 15% discount
    const discountedMax = max * 0.85;
    
    // Allow slight budget overage (20%)
    if (min > preferences.budget * 1.2) {
      console.log(`⏭️ Skipping Deluxe Package: Min ₱${min} > Budget + 20%`);
    } else {
      let matchScore = 80;
      if (min <= preferences.budget * 1.2) matchScore += 10;
      if (['modern', 'traditional', 'grand'].includes(preferences.weddingType)) matchScore += 5;
      if (preferences.priorityServices.length >= 4) matchScore += 5;

      const whyRecommended = [];
      if (min <= preferences.budget) {
        whyRecommended.push('Within your budget');
      } else if (min <= preferences.budget * 1.2) {
        whyRecommended.push('Slightly over budget but great value');
      }
      if (preferences.weddingStyle === 'elegant' || preferences.weddingStyle === 'romantic') {
        whyRecommended.push(`Matches your ${preferences.weddingStyle} style`);
      }
      if (preferences.guestCount > 50 && preferences.guestCount <= 150) {
        whyRecommended.push(`Ideal for ${preferences.guestCount} guests`);
      }
      whyRecommended.push('Most popular choice');

      const avgRating = deluxeServices.reduce((sum, s) => sum + (s?.rating || 0), 0) / deluxeServices.length;
      const totalReviews = deluxeServices.reduce((sum, s) => sum + (s?.reviewCount || 0), 0);

      packages.push({
        id: 'deluxe',
        name: 'Deluxe Package',
        tagline: 'Most Popular',
        description: 'Complete wedding experience with enhanced services',
        services: deluxeServices,
        minPrice: discountedMin,
        maxPrice: discountedMax,
        priceRange: `₱${discountedMin.toLocaleString()} - ₱${discountedMax.toLocaleString()}`,
        savings: (max - min) * 0.15,
        matchScore: Math.min(matchScore, 100),
        avgRating,
        totalReviews,
        category: 'deluxe',
        badge: 'BEST VALUE',
        color: 'from-blue-500 to-indigo-600',
        whyRecommended,
        budgetWarning: min > preferences.budget ? `May exceed budget by ₱${(min - preferences.budget).toLocaleString()}` : undefined
      });
    }
  }

  // PREMIUM PACKAGE
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
    const { min, max } = calculatePackagePriceRange(premiumServices);
    const discountedMin = min * 0.80; // 20% discount
    const discountedMax = max * 0.80;
    
    // Show premium even if over budget (aspirational)
    let matchScore = 85;
    if (preferences.budget >= 150000) matchScore += 10;
    if (['grand', 'luxurious'].includes(preferences.weddingType) || ['luxurious', 'elegant'].includes(preferences.weddingStyle)) {
      matchScore += 5;
    }

    const whyRecommended = [];
    if (preferences.budget >= min) {
      whyRecommended.push('Perfect match for your budget');
    } else if (preferences.budget >= 150000) {
      whyRecommended.push('Matches your premium budget range');
    }
    if (preferences.weddingType === 'grand') {
      whyRecommended.push('Perfect for grand celebrations');
    }
    if (preferences.guestCount > 150) {
      whyRecommended.push(`Designed for ${preferences.guestCount}+ guests`);
    }
    whyRecommended.push('Premium vendors and services');
    whyRecommended.push('Stress-free planning included');

    const avgRating = premiumServices.reduce((sum, s) => sum + (s?.rating || 0), 0) / premiumServices.length;
    const totalReviews = premiumServices.reduce((sum, s) => sum + (s?.reviewCount || 0), 0);

    packages.push({
      id: 'premium',
      name: 'Premium Package',
      tagline: 'Luxury Experience',
      description: 'All-inclusive luxury wedding with top-tier vendors',
      services: premiumServices,
      minPrice: discountedMin,
      maxPrice: discountedMax,
      priceRange: `₱${discountedMin.toLocaleString()} - ₱${discountedMax.toLocaleString()}`,
      savings: (max - min) * 0.20,
      matchScore: Math.min(matchScore, 100),
      avgRating,
      totalReviews,
      category: 'premium',
      badge: 'LUXURY',
      color: 'from-purple-500 to-pink-600',
      whyRecommended,
      budgetWarning: min > preferences.budget ? `Exceeds budget by ₱${(min - preferences.budget).toLocaleString()}` : undefined
    });
  }

  return packages;
};

// ✅ UPDATED WeddingPackage interface
interface WeddingPackage {
  id: string;
  name: string;
  tagline: string;
  description: string;
  services: Service[];
  minPrice: number;           // ✅ NEW: Minimum price
  maxPrice: number;           // ✅ NEW: Maximum price
  priceRange: string;         // ✅ NEW: Display string
  savings: number;
  matchScore: number;
  avgRating: number;
  totalReviews: number;
  category: 'essential' | 'deluxe' | 'premium';
  badge: string;
  color: string;
  whyRecommended: string[];
  budgetWarning?: string;     // ✅ NEW: Budget warning
}

export { 
  calculateServicePriceRange,
  calculatePackagePriceRange,
  fitsInBudget,
  getBestPackageForBudget,
  createWeddingPackages,
  type WeddingPackage
};
