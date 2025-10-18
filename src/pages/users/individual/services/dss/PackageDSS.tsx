import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Star, MapPin, MessageCircle, TrendingUp, Package, Check, ChevronRight } from 'lucide-react';
import type { Service } from '../../../../../modules/services/types';

interface PackageDSSProps {
  services: Service[];
  budget?: number;
  location?: string;
  isOpen: boolean;
  onClose: () => void;
  onBookService: (serviceId: string) => void;
  onMessageVendor: (serviceId: string) => void;
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
}

export function PackageDSS({ 
  services, 
  budget = 100000, 
  location = '',
  isOpen, 
  onClose, 
  onBookService,
  onMessageVendor 
}: PackageDSSProps) {
  const [sortBy, setSortBy] = useState<'match' | 'price' | 'savings'>('match');

  // Create wedding packages from services
  const weddingPackages = useMemo(() => {
    // Group services by category
    const servicesByCategory = services.reduce((acc, service) => {
      const category = service.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    }, {} as Record<string, Service[]>);

    // Get best service from each category
    const getBestService = (category: string) => {
      const categoryServices = servicesByCategory[category] || [];
      return categoryServices.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      })[0];
    };

    const packages: WeddingPackage[] = [];

    // Essential Package
    const essentialServices = [
      getBestService('photography'),
      getBestService('venue'),
      getBestService('catering')
    ].filter(Boolean);

    if (essentialServices.length >= 2) {
      const totalPrice = essentialServices.reduce((sum, s) => sum + (s?.basePrice || 0), 0);
      const discountedPrice = totalPrice * 0.85;
      const avgRating = essentialServices.reduce((sum, s) => sum + (s?.rating || 0), 0) / essentialServices.length;
      
      packages.push({
        id: 'essential',
        name: 'Essential Wedding',
        tagline: 'Perfect for intimate celebrations',
        description: 'Everything you need for a beautiful intimate wedding',
        services: essentialServices,
        totalPrice,
        discountedPrice,
        savings: totalPrice - discountedPrice,
        matchScore: calculatePackageScore(essentialServices, budget, location),
        avgRating,
        totalReviews: essentialServices.reduce((sum, s) => sum + (s?.reviewCount || 0), 0),
        category: 'essential',
        badge: 'Best for Small Weddings',
        color: 'from-green-500 to-emerald-600'
      });
    }

    // Deluxe Package
    const deluxeServices = [
      getBestService('photography'),
      getBestService('videography'),
      getBestService('venue'),
      getBestService('catering'),
      getBestService('flowers_decor'),
      getBestService('music_dj')
    ].filter(Boolean);

    if (deluxeServices.length >= 4) {
      const totalPrice = deluxeServices.reduce((sum, s) => sum + (s?.basePrice || 0), 0);
      const discountedPrice = totalPrice * 0.80;
      const avgRating = deluxeServices.reduce((sum, s) => sum + (s?.rating || 0), 0) / deluxeServices.length;
      
      packages.push({
        id: 'deluxe',
        name: 'Deluxe Wedding',
        tagline: 'Our most popular package',
        description: 'Complete coverage for your dream wedding day',
        services: deluxeServices,
        totalPrice,
        discountedPrice,
        savings: totalPrice - discountedPrice,
        matchScore: calculatePackageScore(deluxeServices, budget, location),
        avgRating,
        totalReviews: deluxeServices.reduce((sum, s) => sum + (s?.reviewCount || 0), 0),
        category: 'deluxe',
        badge: 'Most Popular',
        color: 'from-purple-500 to-indigo-600'
      });
    }

    // Premium Package
    const premiumServices = [
      getBestService('photography'),
      getBestService('videography'),
      getBestService('venue'),
      getBestService('catering'),
      getBestService('flowers_decor'),
      getBestService('music_dj'),
      getBestService('makeup_hair'),
      getBestService('wedding_planning')
    ].filter(Boolean);

    if (premiumServices.length >= 5) {
      const totalPrice = premiumServices.reduce((sum, s) => sum + (s?.basePrice || 0), 0);
      const discountedPrice = totalPrice * 0.75;
      const avgRating = premiumServices.reduce((sum, s) => sum + (s?.rating || 0), 0) / premiumServices.length;
      
      packages.push({
        id: 'premium',
        name: 'Premium All-Inclusive',
        tagline: 'The ultimate wedding experience',
        description: 'Every detail taken care of - stress-free planning',
        services: premiumServices,
        totalPrice,
        discountedPrice,
        savings: totalPrice - discountedPrice,
        matchScore: calculatePackageScore(premiumServices, budget, location),
        avgRating,
        totalReviews: premiumServices.reduce((sum, s) => sum + (s?.reviewCount || 0), 0),
        category: 'premium',
        badge: 'Best Value',
        color: 'from-rose-500 to-pink-600'
      });
    }

    return packages.sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'price') return a.discountedPrice - b.discountedPrice;
      if (sortBy === 'savings') return b.savings - a.savings;
      return 0;
    });
  }, [services, budget, location, sortBy]);

  function calculatePackageScore(packageServices: Service[], budget: number, location: string): number {
    let score = 0;
    const totalPrice = packageServices.reduce((sum, s) => sum + (s.basePrice || 0), 0) * 0.80; // With discount
    const avgRating = packageServices.reduce((sum, s) => sum + s.rating, 0) / packageServices.length;
    
    score += (avgRating / 5) * 40; // Rating (40%)
    if (totalPrice <= budget) score += 35 * (1 - totalPrice / budget); // Price (35%)
    else score += 10;
    score += Math.min((packageServices.length / 8) * 15, 15); // Service count (15%)
    const locationMatches = packageServices.filter(s => 
      location && s.location?.toLowerCase().includes(location.toLowerCase())
    ).length;
    score += (locationMatches / packageServices.length) * 10; // Location (10%)
    
    return Math.round(score);
  }

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Wedding Packages</h2>
                <p className="text-purple-100 text-sm">Complete wedding packages with amazing savings</p>
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

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-xs text-purple-100 mb-1">Packages Available</div>
              <div className="text-2xl font-bold">{weddingPackages.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-xs text-purple-100 mb-1">Max Savings</div>
              <div className="text-2xl font-bold">
                ₱{Math.max(...weddingPackages.map(p => p.savings)).toLocaleString()}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-xs text-purple-100 mb-1">Avg Rating</div>
              <div className="text-2xl font-bold flex items-center gap-1">
                {(weddingPackages.reduce((sum, p) => sum + p.avgRating, 0) / weddingPackages.length).toFixed(1)}
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Simple Filter */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                title="Sort packages"
              >
                <option value="match">🎯 Best Match</option>
                <option value="price">💰 Lowest Price</option>
                <option value="savings">💎 Highest Savings</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {weddingPackages.length} complete packages
            </div>
          </div>
        </div>

        {/* Packages List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {weddingPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-purple-300 hover:shadow-xl transition-all duration-200"
              >
                {/* Package Header */}
                <div className={`bg-gradient-to-r ${pkg.color} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                    {pkg.badge}
                  </div>
                  <div className="absolute bottom-0 right-0 opacity-10">
                    <Sparkles className="h-32 w-32" />
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-1">{pkg.name}</h3>
                    <p className="text-sm opacity-90 mb-3">{pkg.tagline}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-semibold">{pkg.avgRating.toFixed(1)}</span>
                        <span className="opacity-75">({pkg.totalReviews} reviews)</span>
                      </div>
                      <div className="h-4 w-px bg-white/30"></div>
                      <div className="font-semibold">{pkg.services.length} Services</div>
                      <div className="h-4 w-px bg-white/30"></div>
                      <div className="bg-white/20 px-2 py-0.5 rounded font-bold">
                        {pkg.matchScore}% Match
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{pkg.description}</p>

                  {/* Services Included */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      Includes {pkg.services.length} Premium Services
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pkg.services.map((service) => (
                        <div key={service.id} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 text-sm truncate">{service.name}</h5>
                            <p className="text-xs text-gray-600 truncate">{service.vendorName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-xs text-yellow-600">
                                <Star className="h-3 w-3 fill-current" />
                                <span>{service.rating}</span>
                              </div>
                              {service.location && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{service.location.split(',')[0]}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="border-t border-gray-200 pt-6 flex items-end justify-between">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Package Price:</div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-purple-600">
                          ₱{pkg.discountedPrice.toLocaleString()}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          ₱{pkg.totalPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-green-600 mt-1">
                        Save ₱{pkg.savings.toLocaleString()} ({Math.round((pkg.savings / pkg.totalPrice) * 100)}% off)
                      </div>
                      
                      {pkg.discountedPrice <= budget && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                          <Check className="h-3 w-3" />
                          Within your ₱{budget.toLocaleString()} budget
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          // Book all services in package
                          pkg.services.forEach(service => onBookService(service.id));
                        }}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2 shadow-lg"
                      >
                        Book Package
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
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
        </div>
      </motion.div>
    </motion.div>
  );
}
