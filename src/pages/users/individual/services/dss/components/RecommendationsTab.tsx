/**
 * Recommendations Tab Micro Component
 * Handles service recommendations with real API integration
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { cn } from '../../../../../../utils/cn';
import { ServiceCard } from './ServiceCard';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { DSSService, VendorAPIService } from '../services';
import type { Service } from '../../../../../../modules/services/types';
import type { LocationData } from '../types';

interface RecommendationsTabProps {
  services: Service[];
  budget: number;
  location: string;
  weddingDate?: Date;
  guestCount?: number;
  priorities: string[];
  locationData?: LocationData | null;
  onServiceRecommend: (serviceId: string) => void;
}

export const RecommendationsTab: React.FC<RecommendationsTabProps> = ({
  services,
  budget,
  location,
  weddingDate,
  guestCount,
  priorities,
  locationData,
  onServiceRecommend
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'cost' | 'rating'>('score');

  // Generate recommendations using DSS service
  const recommendations = useMemo(() => {
    if (!services.length) return [];
    
    return DSSService.generateRecommendations(services, {
      budget,
      location,
      weddingDate,
      guestCount,
      priorities
    });
  }, [services, budget, location, weddingDate, guestCount, priorities]);

  // Filter and sort recommendations
  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;
    
    if (filter !== 'all') {
      filtered = filtered.filter(rec => rec.priority === filter);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return a.estimatedCost - b.estimatedCost;
        case 'rating':
          return b.valueRating - a.valueRating;
        case 'score':
        default:
          return b.score - a.score;
      }
    });
  }, [recommendations, filter, sortBy]);

  // Get service by ID
  const getServiceById = (serviceId: string) => {
    return services.find(service => service.id === serviceId);
  };

  // Handle service actions
  const handleSaveService = async (serviceId: string) => {
    setIsLoading(true);
    try {
      await VendorAPIService.saveRecommendation(serviceId);
      // Show success notification
    } catch (error) {
      console.error('Failed to save service:', error);
      // Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactVendor = async (serviceId: string) => {
    setIsLoading(true);
    try {
      await VendorAPIService.contactVendor(serviceId, 
        'Hi, I\'m interested in your wedding services. Could we discuss availability and pricing?'
      );
      // Show success notification
    } catch (error) {
      console.error('Failed to contact vendor:', error);
      // Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (serviceId: string) => {
    onServiceRecommend(serviceId);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading recommendations..." />;
  }

  if (!recommendations.length) {
    return (
      <EmptyState
        title="No Recommendations Available"
        description="We couldn't find any service recommendations based on your criteria. Try adjusting your budget or preferences."
        actionLabel="Reset Filters"
        onAction={() => {
          setFilter('all');
          setSortBy('score');
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
            AI Recommendations
          </h3>
          <p className="text-sm text-gray-600">
            {filteredRecommendations.length} services match your criteria
          </p>
        </div>
        
        <div className="flex gap-3">
          {/* Priority Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            title="Filter by priority level"
            aria-label="Filter recommendations by priority level"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          
          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            title="Sort recommendations by"
            aria-label="Sort recommendations by different criteria"
          >
            <option value="score">Best Match</option>
            <option value="cost">Lowest Cost</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid gap-4">
        {filteredRecommendations.map((recommendation, index) => {
          const service = getServiceById(recommendation.serviceId);
          if (!service) return null;

          return (
            <motion.div
              key={recommendation.serviceId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Priority Badge */}
              <div className={cn(
                "absolute -top-2 -right-2 z-10 px-2 py-1 rounded-full text-xs font-medium",
                recommendation.priority === 'high' && "bg-red-100 text-red-700",
                recommendation.priority === 'medium' && "bg-yellow-100 text-yellow-700",
                recommendation.priority === 'low' && "bg-green-100 text-green-700"
              )}>
                {recommendation.priority.toUpperCase()}
              </div>

              <ServiceCard
                service={service}
                recommendation={recommendation}
                locationData={locationData}
                onSave={() => handleSaveService(service.id)}
                onContact={() => handleContactVendor(service.id)}
                onViewDetails={() => handleViewDetails(service.id)}
                index={index}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Insights Summary */}
      <div className="mt-8 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-pink-600" />
          <h4 className="font-medium text-gray-900">Smart Insights</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Top Priority:</span>
            <p className="text-gray-600">
              {recommendations.find(r => r.priority === 'high')?.category || 'Photography'}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Budget Allocation:</span>
            <p className="text-gray-600">
              {((recommendations.reduce((sum, r) => sum + r.estimatedCost, 0) / budget) * 100).toFixed(0)}% of budget
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Avg. Rating:</span>
            <p className="text-gray-600">
              {(recommendations.reduce((sum, r) => sum + r.valueRating, 0) / recommendations.length).toFixed(1)}/5.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
