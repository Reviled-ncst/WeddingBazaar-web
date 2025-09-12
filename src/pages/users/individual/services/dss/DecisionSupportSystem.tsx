import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  DollarSign,
  Star,
  ChevronRight,
  Lightbulb,
  Target,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Zap,
  Filter,
  X,
  BookOpen,
  Award
} from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { Service } from '../../../../../modules/services/types';

interface DSSProps {
  services: Service[];
  budget?: number;
  location?: string;
  weddingDate?: Date;
  guestCount?: number;
  priorities?: string[];
  isOpen: boolean;
  onClose: () => void;
  onServiceRecommend: (serviceId: string) => void;
}

interface DSSRecommendation {
  serviceId: string;
  score: number;
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedCost: number;
  valueRating: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface DSSInsight {
  type: 'budget' | 'trend' | 'risk' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  data?: any;
}

interface BudgetAnalysis {
  totalEstimated: number;
  percentageUsed: number;
  categoryBreakdown: Record<string, number>;
  recommendations: string[];
  riskAreas: string[];
  savingOpportunities: string[];
}

export const DecisionSupportSystem: React.FC<DSSProps> = ({
  services,
  budget = 50000,
  location = '',
  priorities = [],
  isOpen,
  onClose,
  onServiceRecommend
}) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'insights' | 'budget' | 'comparison'>('recommendations');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, budget]);
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'rating'>('score');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Helper function to calculate booking popularity score
  const calculateBookingScore = (reviewCount: number): number => {
    // Estimate bookings based on reviews (assuming 1 review per 3-5 bookings)
    const estimatedBookings = reviewCount * 4;
    if (estimatedBookings >= 200) return 30; // High booking volume
    if (estimatedBookings >= 100) return 20; // Medium booking volume
    if (estimatedBookings >= 50) return 15; // Moderate booking volume
    return 10; // Lower booking volume
  };

  // Calculate recommendations using updated DSS algorithm focused on price, ratings, bookings
  const recommendations = useMemo(() => {
    if (!services.length) return [];

    setIsAnalyzing(true);
    
    const calculateServiceScore = (service: Service): DSSRecommendation => {
      let score = 0;
      const reasons: string[] = [];
      
      // 1. RATING SCORE (35% - Primary factor)
      const ratingScore = (service.rating / 5) * 35;
      score += ratingScore;
      if (service.rating >= 4.8) {
        reasons.push(`Outstanding rating (${service.rating}/5) - Top tier quality`);
      } else if (service.rating >= 4.5) {
        reasons.push(`Exceptional rating (${service.rating}/5) - Premium quality`);
      } else if (service.rating >= 4.0) {
        reasons.push(`High rating (${service.rating}/5) - Quality service`);
      } else if (service.rating >= 3.5) {
        reasons.push(`Good rating (${service.rating}/5) - Reliable service`);
      }

      // 2. BOOKING POPULARITY SCORE (25% - Based on review count as booking indicator)
      const bookingScore = calculateBookingScore(service.reviewCount);
      score += bookingScore;
      const estimatedBookings = service.reviewCount * 4;
      if (estimatedBookings >= 200) {
        reasons.push(`High demand vendor (${estimatedBookings}+ estimated bookings)`);
      } else if (estimatedBookings >= 100) {
        reasons.push(`Popular vendor (${estimatedBookings}+ estimated bookings)`);
      } else if (estimatedBookings >= 50) {
        reasons.push(`Established vendor (${estimatedBookings}+ estimated bookings)`);
      }

      // 3. PRICE COMPATIBILITY SCORE (30% - Budget alignment)
      const estimatedCost = parsePriceRange(service.priceRange || '$$$');
      const budgetPercentage = (estimatedCost / budget) * 100;
      let priceScore = 0;
      
      if (budgetPercentage <= 50) {
        priceScore = 30;
        reasons.push(`Excellent value - Only ${budgetPercentage.toFixed(0)}% of budget`);
      } else if (budgetPercentage <= 70) {
        priceScore = 25;
        reasons.push(`Good value - ${budgetPercentage.toFixed(0)}% of budget`);
      } else if (budgetPercentage <= 90) {
        priceScore = 20;
        reasons.push(`Fair value - ${budgetPercentage.toFixed(0)}% of budget`);
      } else if (budgetPercentage <= 100) {
        priceScore = 15;
        reasons.push(`At budget limit - ${budgetPercentage.toFixed(0)}% of budget`);
      } else {
        priceScore = 5;
        reasons.push(`Over budget - ${budgetPercentage.toFixed(0)}% of budget (consider if essential)`);
      }
      score += priceScore;

      // 4. ADDITIONAL FACTORS (10% - Location, availability, features)
      let additionalScore = 0;
      
      // Location bonus
      if (location && service.location.toLowerCase().includes(location.toLowerCase())) {
        additionalScore += 4;
        reasons.push('Located in your preferred area');
      }
      
      // Availability bonus
      if (service.availability) {
        additionalScore += 3;
        reasons.push('Currently available for booking');
      }
      
      // Features/specialization bonus
      if (service.features && service.features.length > 3) {
        additionalScore += 3;
        reasons.push(`Comprehensive services (${service.features.length} specialties)`);
      }
      
      score += additionalScore;

      // Calculate priority based on score
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (score >= 80) priority = 'high';
      else if (score >= 60) priority = 'medium';

      // Calculate value rating
      const valueRating = calculateValueRating(service, estimatedCost);

      // Calculate risk level
      const riskLevel = calculateRiskLevel(service);

      return {
        serviceId: service.id,
        score: Math.round(score),
        reasons: reasons.slice(0, 4), // Top 4 reasons
        priority,
        category: service.category,
        estimatedCost,
        valueRating,
        riskLevel
      };
    };

    const recs = services
      .map(calculateServiceScore)
      .filter(rec => selectedCategories.length === 0 || selectedCategories.includes(rec.category))
      .filter(rec => rec.estimatedCost >= priceRange[0] && rec.estimatedCost <= priceRange[1])
      .sort((a, b) => {
        switch (sortBy) {
          case 'price':
            return a.estimatedCost - b.estimatedCost;
          case 'rating':
            const serviceA = services.find(s => s.id === a.serviceId);
            const serviceB = services.find(s => s.id === b.serviceId);
            return (serviceB?.rating || 0) - (serviceA?.rating || 0);
          default:
            return b.score - a.score;
        }
      })
      .slice(0, 20); // Top 20 recommendations

    setTimeout(() => setIsAnalyzing(false), 500);
    return recs;
  }, [services, budget, location, priorities, selectedCategories, priceRange, sortBy]);

  // Generate insights
  const insights = useMemo((): DSSInsight[] => {
    const insights: DSSInsight[] = [];

    // Budget insights
    const budgetAnalysis = analyzeBudget();
    if (budgetAnalysis.percentageUsed > 90) {
      insights.push({
        type: 'budget',
        title: 'Budget Alert',
        description: `You're using ${budgetAnalysis.percentageUsed}% of your budget. Consider reviewing your selections.`,
        impact: 'high',
        actionable: true,
        data: budgetAnalysis
      });
    }

    // Trend insights
    const popularCategories = getPopularCategories();
    insights.push({
      type: 'trend',
      title: 'Popular Categories',
      description: `${popularCategories[0]} and ${popularCategories[1]} are trending in your area.`,
      impact: 'medium',
      actionable: true,
      data: popularCategories
    });

    // Risk insights
    const highRiskServices = recommendations.filter(r => r.riskLevel === 'high');
    if (highRiskServices.length > 0) {
      insights.push({
        type: 'risk',
        title: 'High-Risk Services Detected',
        description: `${highRiskServices.length} services have potential risks. Review carefully.`,
        impact: 'high',
        actionable: true,
        data: highRiskServices
      });
    }

    // Opportunity insights
    const valuePicks = recommendations.filter(r => r.valueRating >= 8);
    if (valuePicks.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Value Opportunities',
        description: `Found ${valuePicks.length} high-value services that offer excellent quality for the price.`,
        impact: 'medium',
        actionable: true,
        data: valuePicks
      });
    }

    return insights;
  }, [recommendations]);

  // Helper functions
  const parsePriceRange = (priceRange: string): number => {
    const ranges = {
      '$': 1000,
      '$$': 3000,
      '$$$': 7000,
      '$$$$': 15000
    };
    return ranges[priceRange as keyof typeof ranges] || 5000;
  };

  const calculateValueRating = (service: Service, cost: number): number => {
    const qualityScore = service.rating * 2; // Max 10
    const featureScore = Math.min(service.features?.length || 0, 10); // Max 10
    const costEfficiency = Math.max(0, 10 - (cost / budget) * 10); // Max 10
    return Math.round((qualityScore + featureScore + costEfficiency) / 3);
  };

  const calculateRiskLevel = (service: Service): 'low' | 'medium' | 'high' => {
    if (service.reviewCount < 10 || service.rating < 3.5) return 'high';
    if (service.reviewCount < 25 || service.rating < 4.0) return 'medium';
    return 'low';
  };

  const analyzeBudget = (): BudgetAnalysis => {
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
  };

  const getPopularCategories = (): string[] => {
    const categoryCount: Record<string, number> = {};
    services.forEach(service => {
      categoryCount[service.category] = (categoryCount[service.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  };

  const getService = (serviceId: string) => services.find(s => s.id === serviceId);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const categories = [...new Set(services.map(s => s.category))];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Decision Support System</h2>
                <p className="text-white/90">AI-powered recommendations for your perfect wedding</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close Decision Support System"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="text-sm">Budget Usage</span>
              </div>
              <p className="text-xl font-bold">{Math.round(analyzeBudget().percentageUsed)}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span className="text-sm">Top Matches</span>
              </div>
              <p className="text-xl font-bold">{recommendations.filter(r => r.priority === 'high').length}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm">Insights</span>
              </div>
              <p className="text-xl font-bold">{insights.length}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Value Picks</span>
              </div>
              <p className="text-xl font-bold">{recommendations.filter(r => r.valueRating >= 8).length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'recommendations', label: 'Smart Recommendations', icon: Lightbulb },
              { id: 'insights', label: 'Market Insights', icon: TrendingUp },
              { id: 'budget', label: 'Budget Analysis', icon: DollarSign },
              { id: 'comparison', label: 'Service Comparison', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Filters */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      title="Sort recommendations by"
                      aria-label="Sort recommendations by"
                    >
                      <option value="score">Sort by Score</option>
                      <option value="price">Sort by Price</option>
                      <option value="rating">Sort by Rating</option>
                    </select>

                    <div className="flex flex-wrap gap-2">
                      {categories.slice(0, 6).map(category => (
                        <button
                          key={category}
                          onClick={() => handleCategoryFilter(category)}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                            selectedCategories.includes(category)
                              ? "bg-purple-100 text-purple-700 border border-purple-300"
                              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Budget Range:</span>
                    <input
                      type="range"
                      min="0"
                      max={budget}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="flex-1"
                      title="Adjust maximum budget"
                      aria-label={`Budget range: $0 to $${priceRange[1].toLocaleString()}`}
                    />
                    <span className="text-sm text-gray-600">${priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Recommendations List */}
                {isAnalyzing ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Analyzing services...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {recommendations.map((rec) => {
                      const service = getService(rec.serviceId);
                      if (!service) return null;

                      return (
                        <motion.div
                          key={rec.serviceId}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex items-start gap-4">
                            <img
                              src={service.image}
                              alt={service.name}
                              className="w-16 h-16 rounded-lg object-cover"
                              loading="lazy"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-900 truncate">{service.name}</h3>
                                  <p className="text-sm text-gray-600">{service.category}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium",
                                    rec.priority === 'high' ? "bg-green-100 text-green-700" :
                                    rec.priority === 'medium' ? "bg-yellow-100 text-yellow-700" :
                                    "bg-gray-100 text-gray-700"
                                  )}>
                                    {rec.priority} priority
                                  </div>
                                  <div className="text-lg font-bold text-purple-600">
                                    {rec.score}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm">{service.rating}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">${rec.estimatedCost.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">Value: {rec.valueRating}/10</span>
                                </div>
                              </div>

                              <div className="space-y-1 mb-3">
                                {rec.reasons.map((reason, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                                    {reason}
                                  </div>
                                ))}
                              </div>

                              <button
                                onClick={() => onServiceRecommend(rec.serviceId)}
                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                              >
                                View Details
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "border rounded-xl p-6",
                        insight.type === 'budget' ? "border-red-200 bg-red-50" :
                        insight.type === 'trend' ? "border-blue-200 bg-blue-50" :
                        insight.type === 'risk' ? "border-orange-200 bg-orange-50" :
                        "border-green-200 bg-green-50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          insight.type === 'budget' ? "bg-red-100 text-red-600" :
                          insight.type === 'trend' ? "bg-blue-100 text-blue-600" :
                          insight.type === 'risk' ? "bg-orange-100 text-orange-600" :
                          "bg-green-100 text-green-600"
                        )}>
                          {insight.type === 'budget' && <DollarSign className="h-5 w-5" />}
                          {insight.type === 'trend' && <TrendingUp className="h-5 w-5" />}
                          {insight.type === 'risk' && <AlertCircle className="h-5 w-5" />}
                          {insight.type === 'opportunity' && <Lightbulb className="h-5 w-5" />}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                          
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              insight.impact === 'high' ? "bg-red-100 text-red-700" :
                              insight.impact === 'medium' ? "bg-yellow-100 text-yellow-700" :
                              "bg-green-100 text-green-700"
                            )}>
                              {insight.impact} impact
                            </span>
                            
                            {insight.actionable && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                Actionable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Budget Analysis Tab */}
            {activeTab === 'budget' && (
              <motion.div
                key="budget"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Budget Overview */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Budget</span>
                        <span className="font-semibold">${budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Estimated Cost</span>
                        <span className="font-semibold">${analyzeBudget().totalEstimated.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Remaining</span>
                        <span className={cn(
                          "font-semibold",
                          budget - analyzeBudget().totalEstimated >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          ${(budget - analyzeBudget().totalEstimated).toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={cn(
                            "h-3 rounded-full transition-all duration-500",
                            analyzeBudget().percentageUsed > 100 ? "bg-red-500" :
                            analyzeBudget().percentageUsed > 80 ? "bg-yellow-500" : "bg-green-500"
                          )}
                          style={{ width: `${Math.min(analyzeBudget().percentageUsed, 100)}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        {Math.round(analyzeBudget().percentageUsed)}% of budget used
                      </p>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                    <div className="space-y-3">
                      {Object.entries(analyzeBudget().categoryBreakdown).map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">{category}</span>
                          <span className="font-medium">${amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {analyzeBudget().recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Risk Areas
                    </h4>
                    <ul className="space-y-2">
                      {analyzeBudget().riskAreas.map((risk, index) => (
                        <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Saving Opportunities
                    </h4>
                    <ul className="space-y-2">
                      {analyzeBudget().savingOpportunities.map((opportunity, index) => (
                        <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Comparison Tab */}
            {activeTab === 'comparison' && (
              <motion.div
                key="comparison"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Comparison</h3>
                  <p className="text-gray-600">Compare multiple services side by side</p>
                  <p className="text-sm text-gray-500 mt-2">Feature coming soon...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
