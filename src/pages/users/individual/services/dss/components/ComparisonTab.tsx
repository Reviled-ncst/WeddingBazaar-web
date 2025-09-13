/**
 * Comparison Tab Micro Component
 * Handles service comparison with real data and analytics
 */

import React, { useState, useMemo } from 'react';
import { BarChart3, Plus, X, Star, DollarSign, MapPin, Calendar } from 'lucide-react';
import { cn } from '../../../../../../utils/cn';
import { DSSService, CurrencyService } from '../services';
import type { Service } from '../../../../../../modules/services/types';
import type { LocationData } from '../types';

interface ComparisonTabProps {
  services: Service[];
  budget: number;
  location: string;
  weddingDate?: Date;
  guestCount?: number;
  priorities: string[];
  locationData?: LocationData | null;
}

export const ComparisonTab: React.FC<ComparisonTabProps> = ({
  services,
  budget,
  location,
  weddingDate,
  guestCount,
  priorities,
  locationData
}) => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [comparisonCategory, setComparisonCategory] = useState<string>('');

  // Use location-based currency or fallback
  const activeCurrency = locationData?.currency || { 
    code: 'USD', 
    symbol: '$', 
    name: 'US Dollar', 
    rate: 1.0 
  };

  const formatCurrency = (amount: number) => {
    return CurrencyService.formatCurrency(amount, activeCurrency);
  };

  // Get available categories
  const categories = useMemo(() => {
    return [...new Set(services.map(s => s.category))];
  }, [services]);

  // Filter services by category for selection
  const availableServices = useMemo(() => {
    if (!comparisonCategory) return [];
    return services
      .filter(s => s.category === comparisonCategory)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10); // Limit to top 10 for performance
  }, [services, comparisonCategory]);

  // Generate recommendations for selected services
  const serviceRecommendations = useMemo(() => {
    if (!selectedServices.length) return [];
    
    return selectedServices.map(service => {
      const recommendations = DSSService.generateRecommendations([service], {
        budget,
        location,
        weddingDate,
        guestCount,
        priorities
      });
      return recommendations[0];
    });
  }, [selectedServices, budget, location, weddingDate, guestCount, priorities]);

  const addService = (service: Service) => {
    if (selectedServices.length >= 4) return; // Limit to 4 services for comparison
    if (selectedServices.find(s => s.id === service.id)) return;
    setSelectedServices([...selectedServices, service]);
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  if (!services.length) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services to Compare</h3>
        <p className="text-gray-600">Add services to enable detailed comparisons.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Service Comparison
        </h3>
        <p className="text-sm text-gray-600">
          Compare up to 4 services side by side
        </p>
      </div>

      {/* Category Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label className="text-sm font-medium text-gray-700">
            Select Category:
          </label>
          <select
            value={comparisonCategory}
            onChange={(e) => {
              setComparisonCategory(e.target.value);
              setSelectedServices([]); // Clear selections when category changes
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            title="Select service category to compare"
            aria-label="Select service category for comparison"
          >
            <option value="">Choose a category...</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Service Selection */}
        {comparisonCategory && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Available {comparisonCategory} Services:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableServices.map(service => (
                <button
                  key={service.id}
                  onClick={() => addService(service)}
                  disabled={selectedServices.length >= 4 || selectedServices.find(s => s.id === service.id) !== undefined}
                  className={cn(
                    "p-3 text-left border rounded-lg transition-all text-sm",
                    selectedServices.find(s => s.id === service.id)
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300 hover:bg-pink-50",
                    (selectedServices.length >= 4 && !selectedServices.find(s => s.id === service.id))
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-8 h-8 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {service.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-gray-600 text-xs">
                          {service.rating} ({service.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {selectedServices.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Service Comparison ({selectedServices.length})
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">
                    Feature
                  </th>
                  {selectedServices.map(service => (
                    <th key={service.id} className="text-center py-3 px-4 font-medium text-gray-900 text-sm min-w-48">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-8 h-8 rounded-lg object-cover"
                          loading="lazy"
                        />
                        <div className="text-left">
                          <div className="font-semibold truncate max-w-32">
                            {service.name}
                          </div>
                        </div>
                        <button
                          onClick={() => removeService(service.id)}
                          className="p-1 hover:bg-red-100 rounded-full text-red-500 hover:text-red-700"
                          title="Remove from comparison"
                          aria-label={`Remove ${service.name} from comparison`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Rating */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-700 font-medium">Rating</td>
                  {selectedServices.map(service => (
                    <td key={service.id} className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">{service.rating}</span>
                        <span className="text-gray-500 text-xs">
                          ({service.reviewCount})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Price Range */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-700 font-medium">Price Range</td>
                  {selectedServices.map((service, index) => {
                    const recommendation = serviceRecommendations[index];
                    return (
                      <td key={service.id} className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold">
                            {recommendation ? formatCurrency(recommendation.estimatedCost) : service.priceRange}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Location */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-700 font-medium">Location</td>
                  {selectedServices.map(service => (
                    <td key={service.id} className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{service.location || 'Not specified'}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Availability */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-700 font-medium">Availability</td>
                  {selectedServices.map(service => (
                    <td key={service.id} className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className={cn(
                          "text-sm font-medium",
                          service.availability ? "text-green-600" : "text-orange-600"
                        )}>
                          {service.availability ? 'Available' : 'Check'}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Features */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-700 font-medium">Features</td>
                  {selectedServices.map(service => (
                    <td key={service.id} className="text-center py-3 px-4">
                      <div className="text-sm">
                        {service.features?.length || 0} features
                      </div>
                      {service.features && service.features.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {service.features.slice(0, 2).join(', ')}
                          {service.features.length > 2 && '...'}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* AI Score */}
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-700 font-medium">AI Match Score</td>
                  {selectedServices.map((service, index) => {
                    const recommendation = serviceRecommendations[index];
                    return (
                      <td key={service.id} className="text-center py-3 px-4">
                        {recommendation ? (
                          <div>
                            <div className="text-lg font-bold text-purple-600">
                              {recommendation.score}/100
                            </div>
                            <div className={cn(
                              "text-xs font-medium",
                              recommendation.priority === 'high' && "text-red-600",
                              recommendation.priority === 'medium' && "text-yellow-600",
                              recommendation.priority === 'low' && "text-green-600"
                            )}>
                              {recommendation.priority.toUpperCase()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comparison Insights */}
      {selectedServices.length > 1 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Comparison Insights
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Best Value */}
            <div className="bg-white rounded-lg p-4">
              <h6 className="font-medium text-green-700 mb-2">💰 Best Value</h6>
              {(() => {
                const bestValue = serviceRecommendations.reduce((best, curr, index) => {
                  if (!curr) return best;
                  return (!best.rec || curr.valueRating > best.rec.valueRating) 
                    ? { rec: curr, service: selectedServices[index] }
                    : best;
                }, { rec: null as any, service: null as any });
                
                return bestValue.service ? (
                  <p className="text-sm text-gray-600">
                    <strong>{bestValue.service.name}</strong> offers the best value with a {bestValue.rec.valueRating}/10 rating.
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">Add services to see value comparison.</p>
                );
              })()}
            </div>

            {/* Highest Rated */}
            <div className="bg-white rounded-lg p-4">
              <h6 className="font-medium text-blue-700 mb-2">⭐ Highest Rated</h6>
              {(() => {
                const highest = selectedServices.reduce((best, curr) => {
                  return (!best || curr.rating > best.rating) ? curr : best;
                }, null as Service | null);
                
                return highest ? (
                  <p className="text-sm text-gray-600">
                    <strong>{highest.name}</strong> has the highest rating at {highest.rating}/5 stars.
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">Add services to see ratings.</p>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedServices.length === 0 && comparisonCategory && (
        <div className="text-center py-8">
          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Select Services to Compare
          </h4>
          <p className="text-gray-600">
            Choose up to 4 {comparisonCategory.toLowerCase()} services from the list above.
          </p>
        </div>
      )}
    </div>
  );
};
