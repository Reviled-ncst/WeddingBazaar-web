/**
 * Insights Tab Micro Component
 * Handles market insights and analytics with real data
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Lightbulb, Target, BarChart3, DollarSign } from 'lucide-react';
import { cn } from '../../../../../../utils/cn';
import { DSSService } from '../services';
import type { DSSInsight, LocationData } from '../types';
import type { Service } from '../../../../../../modules/services/types';

interface InsightsTabProps {
  services: Service[];
  budget: number;
  location: string;
  weddingDate?: Date;
  guestCount?: number;
  priorities: string[];
  locationData?: LocationData | null;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  services,
  budget,
  location,
  weddingDate,
  guestCount,
  priorities,
  locationData
}) => {
  // Generate insights using DSS service
  const insights = useMemo((): DSSInsight[] => {
    if (!services.length) return [];

    const recommendations = DSSService.generateRecommendations(services, {
      budget,
      location,
      weddingDate,
      guestCount,
      priorities
    });

    const insights: DSSInsight[] = [];

    // Currency and Location Insights
    if (locationData?.currency && locationData.currency.code !== 'USD') {
      insights.push({
        type: 'opportunity',
        title: `${locationData.currency.name} Pricing`,
        description: `Prices are automatically converted to ${locationData.currency.code} based on your location in ${locationData.country}. Exchange rate: ${locationData.currency.rate.toFixed(2)} per USD.`,
        impact: 'medium',
        actionable: false,
        data: { currency: locationData.currency, country: locationData.country }
      });
    }

    // Budget Analysis
    const totalEstimated = recommendations.slice(0, 5).reduce((sum, r) => sum + r.estimatedCost, 0);
    const budgetUsage = (totalEstimated / budget) * 100;

    if (budgetUsage > 100) {
      insights.push({
        type: 'budget',
        title: 'Budget Alert',
        description: `Your top service selections exceed budget by ${(budgetUsage - 100).toFixed(1)}%. Consider adjusting selections or increasing budget.`,
        impact: 'high',
        actionable: true,
        data: { budgetUsage, totalEstimated }
      });
    } else if (budgetUsage < 60) {
      insights.push({
        type: 'opportunity',
        title: 'Budget Opportunity',
        description: `You have ${(100 - budgetUsage).toFixed(1)}% budget remaining. Consider upgrading services or adding extras.`,
        impact: 'medium',
        actionable: true,
        data: { budgetUsage, remaining: budget - totalEstimated }
      });
    }

    // Market Trends
    const categoryStats = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = { count: 0, avgRating: 0, totalRating: 0 };
      }
      acc[service.category].count++;
      acc[service.category].totalRating += service.rating;
      acc[service.category].avgRating = acc[service.category].totalRating / acc[service.category].count;
      return acc;
    }, {} as Record<string, { count: number; avgRating: number; totalRating: number }>);

    const popularCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 3);

    if (popularCategories.length > 0) {
      const [topCategory, categoryInfo] = popularCategories[0];
      insights.push({
        type: 'trend',
        title: 'Market Competition',
        description: `${topCategory} is highly competitive with ${categoryInfo.count} vendors averaging ${categoryInfo.avgRating.toFixed(1)} stars. Book early for best selection.`,
        impact: 'medium',
        actionable: true,
        data: { category: topCategory, stats: categoryInfo }
      });
    }

    // Quality Assessment
    const highQualityServices = recommendations.filter(r => r.valueRating >= 8);
    const riskServices = recommendations.filter(r => r.riskLevel === 'high');

    if (highQualityServices.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Quality Opportunities',
        description: `Found ${highQualityServices.length} high-value services offering exceptional quality for the price. These vendors provide excellent ROI.`,
        impact: 'medium',
        actionable: true,
        data: { count: highQualityServices.length, services: highQualityServices }
      });
    }

    if (riskServices.length > 0) {
      insights.push({
        type: 'risk',
        title: 'Risk Assessment',
        description: `${riskServices.length} services have potential risks due to limited reviews or lower ratings. Consider alternatives or request additional references.`,
        impact: 'high',
        actionable: true,
        data: { count: riskServices.length, services: riskServices }
      });
    }

    // Location Insights
    const localServices = recommendations.filter(r => {
      const service = services.find(s => s.id === r.serviceId);
      return service && location && service.location?.toLowerCase().includes(location.toLowerCase());
    });

    if (location && localServices.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Local Vendor Advantage',
        description: `${localServices.length} recommended vendors are in ${location}, reducing travel costs and supporting local businesses.`,
        impact: 'low',
        actionable: true,
        data: { count: localServices.length, location }
      });
    }

    // Seasonal Timing
    const currentMonth = new Date().getMonth();
    const isWeddingSeason = [4, 5, 8, 9].includes(currentMonth); // May, June, Sept, Oct

    if (isWeddingSeason) {
      insights.push({
        type: 'trend',
        title: 'Peak Wedding Season',
        description: `Currently in peak wedding season. Vendor availability is limited and prices are at premium. Consider booking immediately or alternative dates.`,
        impact: 'high',
        actionable: true,
        data: { season: 'peak', month: currentMonth }
      });
    } else {
      insights.push({
        type: 'opportunity',
        title: 'Off-Season Savings',
        description: `Planning during off-peak season provides better vendor availability and potential discounts of 10-25%. Great time to book premium services.`,
        impact: 'medium',
        actionable: true,
        data: { season: 'off-peak', month: currentMonth }
      });
    }

    return insights.slice(0, 6); // Limit to top 6 insights
  }, [services, budget, location, weddingDate, guestCount, priorities]);

  const getInsightIcon = (type: DSSInsight['type']) => {
    switch (type) {
      case 'budget': return DollarSign;
      case 'trend': return TrendingUp;
      case 'risk': return AlertTriangle;
      case 'opportunity': return Lightbulb;
      default: return BarChart3;
    }
  };

  const getInsightColor = (type: DSSInsight['type'], impact: DSSInsight['impact']) => {
    if (type === 'risk') return 'red';
    if (type === 'budget' && impact === 'high') return 'orange';
    if (type === 'opportunity') return 'green';
    if (type === 'trend') return 'blue';
    return 'gray';
  };

  if (!insights.length) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Available</h3>
        <p className="text-gray-600">Add more services to get personalized insights and recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Market Insights & Analytics
        </h3>
        <p className="text-sm text-gray-600">
          AI-powered insights to help you make informed decisions
        </p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => {
          const Icon = getInsightIcon(insight.type);
          const colorScheme = getInsightColor(insight.type, insight.impact);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-xl border-l-4 bg-white shadow-sm",
                colorScheme === 'red' && "border-red-500 bg-red-50",
                colorScheme === 'orange' && "border-orange-500 bg-orange-50",
                colorScheme === 'green' && "border-green-500 bg-green-50",
                colorScheme === 'blue' && "border-blue-500 bg-blue-50",
                colorScheme === 'gray' && "border-gray-500 bg-gray-50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  colorScheme === 'red' && "bg-red-100 text-red-600",
                  colorScheme === 'orange' && "bg-orange-100 text-orange-600",
                  colorScheme === 'green' && "bg-green-100 text-green-600",
                  colorScheme === 'blue' && "bg-blue-100 text-blue-600",
                  colorScheme === 'gray' && "bg-gray-100 text-gray-600"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      insight.impact === 'high' && "bg-red-100 text-red-700",
                      insight.impact === 'medium' && "bg-yellow-100 text-yellow-700",
                      insight.impact === 'low' && "bg-blue-100 text-blue-700"
                    )}>
                      {insight.impact} impact
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                  
                  {insight.actionable && (
                    <button className={cn(
                      "text-xs font-medium px-3 py-1 rounded-lg transition-colors",
                      colorScheme === 'red' && "bg-red-600 hover:bg-red-700 text-white",
                      colorScheme === 'orange' && "bg-orange-600 hover:bg-orange-700 text-white",
                      colorScheme === 'green' && "bg-green-600 hover:bg-green-700 text-white",
                      colorScheme === 'blue' && "bg-blue-600 hover:bg-blue-700 text-white",
                      colorScheme === 'gray' && "bg-gray-600 hover:bg-gray-700 text-white"
                    )}>
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          Quick Stats
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {insights.filter(i => i.impact === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {insights.filter(i => i.type === 'opportunity').length}
            </div>
            <div className="text-sm text-gray-600">Opportunities</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {insights.filter(i => i.type === 'risk').length}
            </div>
            <div className="text-sm text-gray-600">Risk Areas</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {insights.filter(i => i.actionable).length}
            </div>
            <div className="text-sm text-gray-600">Actionable</div>
          </div>
        </div>
      </div>
    </div>
  );
};
