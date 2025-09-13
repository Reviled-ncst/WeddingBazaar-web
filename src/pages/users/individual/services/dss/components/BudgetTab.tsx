/**
 * Budget Analysis Tab Micro Component
 * Handles budget analysis and cost optimization with real data
 */

import React, { useMemo } from 'react';
import { DollarSign, PieChart, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../../../../../utils/cn';
import { DSSService, PricingService, CurrencyService } from '../services';
import type { BudgetAnalysis, LocationData } from '../types';
import type { Service } from '../../../../../../modules/services/types';

interface BudgetTabProps {
  services: Service[];
  budget: number;
  location: string;
  weddingDate?: Date;
  guestCount?: number;
  priorities: string[];
  locationData?: LocationData | null;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({
  services,
  budget,
  location,
  weddingDate,
  guestCount,
  priorities,
  locationData
}) => {
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

  // Generate budget analysis
  const budgetAnalysis = useMemo((): BudgetAnalysis => {
    if (!services.length) {
      return {
        totalEstimated: 0,
        percentageUsed: 0,
        categoryBreakdown: {},
        recommendations: [],
        riskAreas: [],
        savingOpportunities: []
      };
    }

    const recommendations = DSSService.generateRecommendations(services, {
      budget,
      location,
      weddingDate,
      guestCount,
      priorities
    });

    // Take top recommendations for budget calculation
    const topRecommendations = recommendations.slice(0, 8);
    const totalEstimated = topRecommendations.reduce((sum, r) => sum + r.estimatedCost, 0);
    
    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    topRecommendations.forEach(rec => {
      categoryBreakdown[rec.category] = (categoryBreakdown[rec.category] || 0) + rec.estimatedCost;
    });

    // Generate recommendations
    const budgetRecommendations: string[] = [];
    const riskAreas: string[] = [];
    const savingOpportunities: string[] = [];

    const percentageUsed = (totalEstimated / budget) * 100;

    if (percentageUsed > 100) {
      budgetRecommendations.push('Consider reducing scope or increasing budget');
      budgetRecommendations.push('Look for package deals to reduce costs');
      riskAreas.push('Budget exceeded by current selections');
    } else if (percentageUsed < 60) {
      budgetRecommendations.push('You have room to upgrade key services');
      budgetRecommendations.push('Consider adding premium features');
      savingOpportunities.push('Potential to add more services within budget');
    }

    // Identify expensive categories
    Object.entries(categoryBreakdown).forEach(([category, amount]) => {
      const percentage = (amount / totalEstimated) * 100;
      if (percentage > 30) {
        riskAreas.push(`${category} represents ${percentage.toFixed(0)}% of total cost`);
      }
      if (percentage < 10 && amount < PricingService.getCategoryPrice(category) * 0.7) {
        savingOpportunities.push(`${category} costs below market average - good value`);
      }
    });

    return {
      totalEstimated,
      percentageUsed,
      categoryBreakdown,
      recommendations: budgetRecommendations,
      riskAreas,
      savingOpportunities
    };
  }, [services, budget, location, weddingDate, guestCount, priorities]);

  const getStatusColor = (percentage: number) => {
    if (percentage > 100) return 'red';
    if (percentage > 90) return 'orange';
    if (percentage > 70) return 'yellow';
    return 'green';
  };

  if (!services.length) {
    return (
      <div className="text-center py-12">
        <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Budget Data</h3>
        <p className="text-gray-600">Add services to see budget analysis and recommendations.</p>
      </div>
    );
  }

  const statusColor = getStatusColor(budgetAnalysis.percentageUsed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Budget Analysis & Optimization
        </h3>
        <p className="text-sm text-gray-600">
          Comprehensive cost breakdown and saving opportunities
        </p>
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Budget Overview
          </h4>
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            statusColor === 'red' && "bg-red-100 text-red-700",
            statusColor === 'orange' && "bg-orange-100 text-orange-700",
            statusColor === 'yellow' && "bg-yellow-100 text-yellow-700",
            statusColor === 'green' && "bg-green-100 text-green-700"
          )}>
            {budgetAnalysis.percentageUsed.toFixed(1)}% Used
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(budget)}
            </div>
            <div className="text-sm text-gray-600">Total Budget</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(budgetAnalysis.totalEstimated)}
            </div>
            <div className="text-sm text-gray-600">Estimated Cost</div>
          </div>
          
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold",
              budgetAnalysis.totalEstimated <= budget ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(budget - budgetAnalysis.totalEstimated)}
            </div>
            <div className="text-sm text-gray-600">
              {budgetAnalysis.totalEstimated <= budget ? "Remaining" : "Over Budget"}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Budget Usage</span>
            <span>{budgetAnalysis.percentageUsed.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={cn(
                "h-3 rounded-full transition-all duration-1000",
                statusColor === 'red' && "bg-red-500",
                statusColor === 'orange' && "bg-orange-500",
                statusColor === 'yellow' && "bg-yellow-500",
                statusColor === 'green' && "bg-green-500"
              )}
              style={{ width: `${Math.min(budgetAnalysis.percentageUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-600" />
          Category Breakdown
        </h4>
        
        <div className="space-y-3">
          {Object.entries(budgetAnalysis.categoryBreakdown)
            .sort(([,a], [,b]) => b - a)
            .map(([category, amount]) => {
              const percentage = (amount / budgetAnalysis.totalEstimated) * 100;
              return (
                <div key={category} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{category}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(amount)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Budget Recommendations */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Recommendations
          </h5>
          <ul className="space-y-2">
            {budgetAnalysis.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                {rec}
              </li>
            ))}
            {budgetAnalysis.recommendations.length === 0 && (
              <li className="text-sm text-blue-800">Your budget allocation looks balanced!</li>
            )}
          </ul>
        </div>

        {/* Risk Areas */}
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <h5 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Risk Areas
          </h5>
          <ul className="space-y-2">
            {budgetAnalysis.riskAreas.map((risk, index) => (
              <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                {risk}
              </li>
            ))}
            {budgetAnalysis.riskAreas.length === 0 && (
              <li className="text-sm text-red-800">No significant budget risks detected.</li>
            )}
          </ul>
        </div>

        {/* Saving Opportunities */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <h5 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Saving Opportunities
          </h5>
          <ul className="space-y-2">
            {budgetAnalysis.savingOpportunities.map((opportunity, index) => (
              <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                <span className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                {opportunity}
              </li>
            ))}
            {budgetAnalysis.savingOpportunities.length === 0 && (
              <li className="text-sm text-green-800">Keep monitoring for new opportunities!</li>
            )}
          </ul>
        </div>
      </div>

      {/* Budget Optimization Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Smart Budget Tips
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4">
            <h6 className="font-medium text-gray-900 mb-2">📊 Rule of Thumb</h6>
            <p className="text-gray-600">
              Venue (40%), Catering (30%), Photography (10%), Flowers (8%), Music (5%), Other (7%)
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h6 className="font-medium text-gray-900 mb-2">💡 Cost Saving</h6>
            <p className="text-gray-600">
              Book vendors 12+ months early, consider off-season dates, and bundle services for discounts.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h6 className="font-medium text-gray-900 mb-2">⚠️ Hidden Costs</h6>
            <p className="text-gray-600">
              Factor in gratuities (15-20%), taxes, overtime fees, and last-minute additions.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h6 className="font-medium text-gray-900 mb-2">🎯 Priority Spending</h6>
            <p className="text-gray-600">
              Invest most in photography, venue, and catering - these create lasting memories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
