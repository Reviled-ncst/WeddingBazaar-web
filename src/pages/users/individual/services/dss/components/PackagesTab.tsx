/**
 * Packages Tab Micro Component
 * Handles wedding package recommendations with real API integration
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { PackageCard } from './PackageCard';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { DSSService } from '../services';
import type { PackageRecommendation, LocationData } from '../types';
import type { Service } from '../../../../../../modules/services/types';

interface PackagesTabProps {
  services: Service[];
  budget: number;
  location: string;
  weddingDate?: Date;
  guestCount?: number;
  priorities: string[];
  locationData?: LocationData | null;
}

const weddingStyles = {
  classic: { name: 'Classic Traditional', emoji: '👰' },
  modern: { name: 'Modern Contemporary', emoji: '✨' },
  rustic: { name: 'Rustic Country', emoji: '🌾' },
  luxury: { name: 'Luxury Glamorous', emoji: '💎' }
};

export const PackagesTab: React.FC<PackagesTabProps> = ({
  services,
  budget,
  location,
  weddingDate,
  guestCount,
  priorities,
  locationData
}) => {
  const [isLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('classic');
  const [packageFilter, setPackageFilter] = useState<'all' | 'essential' | 'standard' | 'premium' | 'luxury'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, budget]);

  // Generate package recommendations
  const packageRecommendations = useMemo((): PackageRecommendation[] => {
    if (!services.length) return [];

    const recommendations = DSSService.generateRecommendations(services, {
      budget,
      location,
      weddingDate,
      guestCount,
      priorities
    });

    // Group services by categories for packages
    const packages: PackageRecommendation[] = [];

    // Essential Package
    const essentialCategories = ['Photography', 'Venue', 'Catering'];
    const essentialServices = recommendations
      .filter(r => essentialCategories.includes(r.category))
      .slice(0, 3);

    if (essentialServices.length >= 2) {
      const totalCost = essentialServices.reduce((sum, s) => sum + s.estimatedCost, 0);
      const originalCost = totalCost * 1.15;
      
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
          'High-quality core services'
        ],
        timeline: '6-12 months planning',
        flexibility: 'high',
        riskLevel: 'low'
      });
    }

    // Standard Package
    const standardCategories = ['Photography', 'Venue', 'Catering', 'Flowers', 'Music'];
    const standardServices = recommendations
      .filter(r => standardCategories.includes(r.category))
      .slice(0, 5);

    if (standardServices.length >= 4) {
      const totalCost = standardServices.reduce((sum, s) => sum + s.estimatedCost, 0);
      const originalCost = totalCost * 1.12;
      
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
          'Balanced budget allocation'
        ],
        timeline: '8-15 months planning',
        flexibility: 'medium',
        riskLevel: 'low'
      });
    }

    // Premium Package
    const premiumServices = recommendations
      .filter(r => r.priority === 'high' && r.valueRating >= 7)
      .slice(0, 6);

    if (premiumServices.length >= 5) {
      const totalCost = premiumServices.reduce((sum, s) => sum + s.estimatedCost, 0);
      const originalCost = totalCost * 1.10;
      
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
          'Comprehensive coverage'
        ],
        timeline: '12-18 months planning',
        flexibility: 'medium',
        riskLevel: 'low'
      });
    }

    return packages.sort((a, b) => b.suitability - a.suitability);
  }, [services, budget, location, weddingDate, guestCount, priorities]);

  // Filter packages
  const filteredPackages = useMemo(() => {
    return packageRecommendations.filter(pkg => {
      if (packageFilter !== 'all' && pkg.category !== packageFilter) return false;
      if (pkg.totalCost < priceRange[0] || pkg.totalCost > priceRange[1]) return false;
      return true;
    });
  }, [packageRecommendations, packageFilter, priceRange]);

  if (isLoading) {
    return <LoadingSpinner message="Creating custom packages..." />;
  }

  if (!filteredPackages.length) {
    return (
      <EmptyState
        title="No Packages Available"
        description="We couldn't create any wedding packages based on your criteria. Try adjusting your filters."
        actionLabel="Reset Filters"
        onAction={() => {
          setPackageFilter('all');
          setPriceRange([0, budget]);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Wedding Packages
          </h3>
          <p className="text-sm text-gray-600">
            {filteredPackages.length} curated packages for your style
          </p>
        </div>
        
        <div className="flex gap-3">
          {/* Wedding Style */}
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            title="Select wedding style"
            aria-label="Choose your wedding style"
          >
            {Object.entries(weddingStyles).map(([key, style]) => (
              <option key={key} value={key}>
                {style.emoji} {style.name}
              </option>
            ))}
          </select>
          
          {/* Package Type Filter */}
          <select
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            title="Filter by package type"
            aria-label="Filter packages by type"
          >
            <option value="all">All Packages</option>
            <option value="essential">Essential</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
      </div>

      {/* Wedding Style Info */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-5 w-5 text-pink-600" />
          <h4 className="font-medium text-gray-900">
            {weddingStyles[selectedStyle as keyof typeof weddingStyles]?.emoji} {weddingStyles[selectedStyle as keyof typeof weddingStyles]?.name}
          </h4>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Packages curated for your wedding style with complementary vendors and services.
        </p>
        
        {/* Budget range slider */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 min-w-fit">Budget Range:</span>
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={budget}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer"
              title="Adjust package budget range"
              aria-label={`Package budget range: $0 to $${priceRange[1].toLocaleString()}`}
            />
          </div>
          <span className="text-sm text-gray-600 min-w-fit">
            ${priceRange[1].toLocaleString()}
          </span>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPackages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PackageCard
              packageData={pkg}
              locationData={locationData}
              onSelect={() => {
                // Handle package selection
                console.log('Package selected:', pkg.id);
              }}
              onCustomize={() => {
                // Handle package customization
                console.log('Package customize:', pkg.id);
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Package Comparison */}
      {filteredPackages.length > 1 && (
        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Package Comparison
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
                  {filteredPackages.map(pkg => (
                    <th key={pkg.id} className="text-center py-3 px-4 font-medium text-gray-900">
                      {pkg.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Total Cost</td>
                  {filteredPackages.map(pkg => (
                    <td key={pkg.id} className="text-center py-3 px-4 font-medium">
                      ${pkg.totalCost.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Services Included</td>
                  {filteredPackages.map(pkg => (
                    <td key={pkg.id} className="text-center py-3 px-4">
                      {pkg.services.length}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Savings</td>
                  {filteredPackages.map(pkg => (
                    <td key={pkg.id} className="text-center py-3 px-4 text-green-600 font-medium">
                      {pkg.savingsPercentage}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Timeline</td>
                  {filteredPackages.map(pkg => (
                    <td key={pkg.id} className="text-center py-3 px-4">
                      {pkg.timeline}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
