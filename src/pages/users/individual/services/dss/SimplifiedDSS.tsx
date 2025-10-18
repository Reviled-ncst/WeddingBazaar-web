import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Star, DollarSign, MapPin, Calendar, Heart, MessageCircle, TrendingUp } from 'lucide-react';
import type { Service } from '../../../../../modules/services/types';

interface SimpleDSSProps {
  services: Service[];
  budget?: number;
  location?: string;
  isOpen: boolean;
  onClose: () => void;
  onBookService: (serviceId: string) => void;
  onMessageVendor: (serviceId: string) => void;
}

export function SimplifiedDSS({ 
  services, 
  budget = 100000, 
  location = '',
  isOpen, 
  onClose, 
  onBookService,
  onMessageVendor 
}: SimpleDSSProps) {
  const [sortBy, setSortBy] = useState<'match' | 'price' | 'rating'>('match');

  // Simple scoring algorithm
  const scoredServices = useMemo(() => {
    return services.map(service => {
      let score = 0;
      
      // Rating score (40%)
      score += (service.rating / 5) * 40;
      
      // Price score (30%) - favor services within budget
      const price = service.basePrice || 0;
      if (price <= budget) {
        score += 30 * (1 - price / budget);
      } else {
        score += 10; // Still consider overbudget options
      }
      
      // Reviews score (20%)
      score += Math.min((service.reviewCount / 100) * 20, 20);
      
      // Location match (10%)
      if (location && service.location?.toLowerCase().includes(location.toLowerCase())) {
        score += 10;
      }
      
      return { ...service, matchScore: Math.round(score) };
    }).sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'price') return (a.basePrice || 0) - (b.basePrice || 0);
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [services, budget, location, sortBy]);

  const topPicks = scoredServices.slice(0, 10);
  const avgRating = (topPicks.reduce((sum, s) => sum + s.rating, 0) / topPicks.length).toFixed(1);
  const totalCost = topPicks.reduce((sum, s) => sum + (s.basePrice || 0), 0);

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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Smart Recommendations</h2>
                <p className="text-purple-100 text-sm">Your perfect vendors, instantly</p>
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
              <div className="text-xs text-purple-100 mb-1">Top Matches</div>
              <div className="text-2xl font-bold">{topPicks.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-xs text-purple-100 mb-1">Avg Rating</div>
              <div className="text-2xl font-bold flex items-center gap-1">
                {avgRating} <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-xs text-purple-100 mb-1">Est. Total</div>
              <div className="text-2xl font-bold">₱{(totalCost / 1000).toFixed(0)}K</div>
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
              >
                <option value="match">🎯 Best Match</option>
                <option value="price">💰 Lowest Price</option>
                <option value="rating">⭐ Highest Rated</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {topPicks.length} recommendations
            </div>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topPicks.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                  />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.category}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        {service.matchScore}%
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{service.rating}</span>
                        <span className="text-gray-400">({service.reviewCount})</span>
                      </div>
                      {service.location && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{service.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-purple-600">
                        ₱{(service.basePrice || 0).toLocaleString()}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onMessageVendor(service.id)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Message vendor"
                        >
                          <MessageCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onBookService(service.id)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why Recommended */}
                {service.matchScore >= 80 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span className="font-medium">Why this is a great match:</span>
                    </div>
                    <ul className="mt-1 space-y-1 text-xs text-gray-600">
                      {service.rating >= 4.5 && <li>• Excellent {service.rating}★ rating</li>}
                      {service.basePrice && service.basePrice <= budget && <li>• Within your budget</li>}
                      {service.reviewCount >= 50 && <li>• Highly experienced ({service.reviewCount}+ reviews)</li>}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {topPicks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Sparkles className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600">Try adjusting your preferences</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
