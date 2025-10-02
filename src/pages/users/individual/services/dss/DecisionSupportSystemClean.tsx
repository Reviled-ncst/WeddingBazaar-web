import React, { useState, useMemo, useEffect } from 'react';
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
  Award,
  Package,
  ShoppingBag,
  Calendar,
  Heart,
  Shield
} from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { Service } from '../../../../../modules/services/types';
import { useAuth } from '../../../../../shared/contexts/AuthContext';

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

export const DecisionSupportSystem: React.FC<DSSProps> = ({
  services,
  budget = 50000,
  location = '',
  priorities = [],
  isOpen,
  onClose,
  onServiceRecommend
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'insights' | 'budget'>('recommendations');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'rating'>('score');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Enhanced DSS algorithm with proper recommendations
  const recommendations = useMemo((): DSSRecommendation[] => {
    if (!services.length) return [];

    setIsAnalyzing(true);
    
    const calculateServiceScore = (service: Service): DSSRecommendation => {
      let score = 0;
      const reasons: string[] = [];
      
      // Rating Score (30%)
      const ratingScore = (service.rating / 5) * 30;
      score += ratingScore;
      if (service.rating >= 4.5) {
        reasons.push(`⭐ Exceptional rating (${service.rating}/5)`);
      } else if (service.rating >= 4.0) {
        reasons.push(`⭐ High rating (${service.rating}/5)`);
      } else {
        reasons.push(`⭐ Good rating (${service.rating}/5)`);
      }

      // Budget compatibility (30%)
      const baseCost = 5000; // Simplified cost calculation
      const estimatedCost = baseCost;
      const budgetPercentage = (estimatedCost / budget) * 100;
      let priceScore = 0;
      
      if (budgetPercentage <= 50) {
        priceScore = 30;
        reasons.push(`💰 Great value - ${budgetPercentage.toFixed(0)}% of budget`);
      } else if (budgetPercentage <= 80) {
        priceScore = 20;
        reasons.push(`💵 Good value - ${budgetPercentage.toFixed(0)}% of budget`);
      } else {
        priceScore = 10;
        reasons.push(`💎 Premium option - ${budgetPercentage.toFixed(0)}% of budget`);
      }
      score += priceScore;

      // Category priority (20%)
      if (priorities.includes(service.category)) {
        score += 20;
        reasons.push(`⭐ Priority category for your wedding`);
      } else {
        score += 10;
        reasons.push(`🔄 Complementary service`);
      }

      // Location match (20%)
      if (location && service.location?.toLowerCase().includes(location.toLowerCase())) {
        score += 20;
        reasons.push(`📍 Perfect location match`);
      } else {
        score += 10;
        reasons.push(`📍 Regional service provider`);
      }

      // Determine priority
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (score >= 70) priority = 'high';
      else if (score >= 50) priority = 'medium';

      return {
        serviceId: service.id,
        score: Math.round(score),
        reasons: reasons.slice(0, 4),
        priority,
        category: service.category,
        estimatedCost,
        valueRating: Math.round(score / 10),
        riskLevel: service.rating < 4.0 ? 'medium' : 'low'
      };
    };

    const filteredServices = services.filter(service => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(service.category)) {
        return false;
      }
      return service.rating >= 3.0;
    });

    const recs = filteredServices
      .map(calculateServiceScore)
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
      .slice(0, 20);

    setTimeout(() => setIsAnalyzing(false), 500);
    return recs;
  }, [services, budget, location, priorities, selectedCategories, sortBy]);

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
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-[95vw] xl:max-w-6xl h-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 lg:p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    AI Wedding Assistant
                  </h2>
                  <p className="text-white/90 text-sm">
                    Smart recommendations for your perfect day
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
                title="Close Decision Support System"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-medium">Budget Used</span>
                </div>
                <p className="text-2xl font-bold">65%</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">Top Matches</span>
                </div>
                <p className="text-2xl font-bold">{recommendations.filter(r => r.priority === 'high').length}</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Services</span>
                </div>
                <p className="text-2xl font-bold">{services.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
              { id: 'insights', label: 'Insights', icon: TrendingUp },
              { id: 'budget', label: 'Budget', icon: DollarSign }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200",
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600 bg-purple-50"
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
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="score">🎯 Best Match</option>
                      <option value="price">💰 Price: Low to High</option>
                      <option value="rating">⭐ Highest Rated</option>
                    </select>

                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => handleCategoryFilter(category)}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
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
                </div>

                {/* Recommendations List */}
                {isAnalyzing ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Analyzing services with AI...</p>
                    </div>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="text-center py-16">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {recommendations.map((rec, index) => {
                      const service = getService(rec.serviceId);
                      if (!service) return null;

                      return (
                        <motion.div
                          key={rec.serviceId}
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <img
                              src={service.image}
                              alt={service.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                  <p className="text-sm text-gray-600">{service.category}</p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium">{service.rating}</span>
                                  </div>
                                  <div className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium",
                                    rec.priority === 'high' ? "bg-green-100 text-green-700" :
                                    rec.priority === 'medium' ? "bg-yellow-100 text-yellow-700" :
                                    "bg-gray-100 text-gray-700"
                                  )}>
                                    {rec.priority.toUpperCase()}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {rec.reasons.map((reason, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{reason}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="text-lg font-bold text-green-600">
                              ₱{rec.estimatedCost.toLocaleString()}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => onServiceRecommend(service.id)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                              >
                                View Details
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
                <div className="text-center py-16">
                  <BarChart3 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Insights</h3>
                  <p className="text-gray-600">Advanced market analysis and trends coming soon!</p>
                </div>
              </motion.div>
            )}

            {/* Budget Tab */}
            {activeTab === 'budget' && (
              <motion.div
                key="budget"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center py-16">
                  <DollarSign className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Budget Analysis</h3>
                  <p className="text-gray-600">Smart budget optimization and allocation coming soon!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
