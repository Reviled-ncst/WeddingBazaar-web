/**
 * DSS Orchestrator - Micro Frontend Main Component
 * 
 * This is the main orchestrator that coordinates all DSS micro frontend components.
 * Each tab is a complete micro frontend that can operate independently.
 * 
 * ARCHITECTURE:
 * - Tab-based micro frontend architecture
 * - Real API integration for all actions
 * - Currency auto-detection
 * - Responsive design with mobile-first approach
 * - Accessibility features built-in
 * - Error boundaries per micro component
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  X,
  Lightbulb,
  Package,
  TrendingUp,
  DollarSign,
  BarChart3,
  Target
} from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { Service } from '../../../../../modules/services/types';
import {
  RecommendationsTab,
  PackagesTab,
  InsightsTab,
  BudgetTab,
  ComparisonTab
} from './components';
import { CurrencyService } from './services';

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

type TabType = 'recommendations' | 'packages' | 'insights' | 'budget' | 'comparison';

const tabs = [
  { 
    id: 'recommendations' as TabType, 
    label: 'Recommendations', 
    shortLabel: 'Recs', 
    icon: Lightbulb,
    description: 'AI-powered service suggestions'
  },
  { 
    id: 'packages' as TabType, 
    label: 'Packages', 
    shortLabel: 'Packages', 
    icon: Package,
    description: 'Curated wedding packages'
  },
  { 
    id: 'insights' as TabType, 
    label: 'Insights', 
    shortLabel: 'Insights', 
    icon: TrendingUp,
    description: 'Market trends & analytics'
  },
  { 
    id: 'budget' as TabType, 
    label: 'Budget Analysis', 
    shortLabel: 'Budget', 
    icon: DollarSign,
    description: 'Cost optimization & breakdown'
  },
  { 
    id: 'comparison' as TabType, 
    label: 'Compare', 
    shortLabel: 'Compare', 
    icon: BarChart3,
    description: 'Side-by-side service comparison'
  }
];

export const DecisionSupportSystemOrchestrator: React.FC<DSSProps> = ({
  services,
  budget = 50000,
  location = '',
  weddingDate,
  guestCount,
  priorities = [],
  isOpen,
  onClose,
  onServiceRecommend
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('recommendations');
  const [locationData, setLocationData] = useState<any>(null);

  // Auto-detect currency based on location
  React.useEffect(() => {
    const detectCurrency = async () => {
      try {
        const detectedLocation = await CurrencyService.detectLocationAndCurrency(location);
        setLocationData(detectedLocation);
        console.log('Currency detected:', detectedLocation.currency);
      } catch (error) {
        console.warn('Currency detection failed:', error);
        // Fallback to USD
        setLocationData({
          country: 'US',
          region: location || '',
          currency: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
          timezone: 'America/New_York'
        });
      }
    };
    
    detectCurrency();
  }, [location]);

  // Generate quick stats for header
  const quickStats = useMemo(() => {
    if (!services.length) {
      return { matches: 0, budgetUsage: 0, avgRating: 0, insights: 0 };
    }

    const matches = Math.min(services.length, 20);
    const budgetUsage = Math.min((matches * 3000) / budget * 100, 100);
    const avgRating = services.reduce((sum, s) => sum + s.rating, 0) / services.length;
    const insights = Math.min(services.length > 10 ? 6 : 4, 8);

    return { matches, budgetUsage, avgRating, insights };
  }, [services, budget]);

  // Common props for all tab components
  const tabProps = {
    services,
    budget,
    location,
    weddingDate,
    guestCount,
    priorities,
    locationData // Pass location data for currency conversion
  };

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
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-[95vw] xl:max-w-7xl h-full max-h-[98vh] sm:max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-3 sm:p-4 lg:p-6 text-white relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-20 h-20 sm:w-32 sm:h-32 bg-white rounded-full -translate-x-8 -translate-y-8 sm:-translate-x-16 sm:-translate-y-16 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full translate-x-6 translate-y-6 sm:translate-x-12 sm:translate-y-12 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30 animate-pulse delay-500"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 lg:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm ring-1 ring-white/30">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold tracking-tight">
                    AI Wedding Assistant
                  </h2>
                  <p className="text-white/90 text-xs sm:text-sm lg:text-base leading-relaxed">
                    Smart recommendations for your perfect day
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 hover:rotate-90 ring-1 ring-white/20 hover:ring-white/40"
                title="Close Decision Support System"
                aria-label="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 hover:bg-white/25 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium truncate">Matches</span>
                </div>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold">{quickStats.matches}</p>
                <p className="text-xs text-white/80">services found</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 hover:bg-white/25 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium truncate">Budget</span>
                </div>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold">{quickStats.budgetUsage.toFixed(0)}%</p>
                <p className="text-xs text-white/80">estimated usage</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 hover:bg-white/25 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium truncate">Quality</span>
                </div>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold">{quickStats.avgRating.toFixed(1)}</p>
                <p className="text-xs text-white/80">avg rating</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 hover:bg-white/25 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium truncate">Insights</span>
                </div>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold">{quickStats.insights}</p>
                <p className="text-xs text-white/80">available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
          <nav className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1 sm:gap-2 py-3 sm:py-4 px-3 sm:px-6 lg:px-8 border-b-2 font-medium text-xs sm:text-sm lg:text-base transition-all duration-200 whitespace-nowrap min-w-0 hover:bg-gray-50 group",
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600 bg-purple-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                title={tab.description}
                aria-label={`Switch to ${tab.label} tab`}
              >
                <tab.icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content - Micro Frontend Components */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'recommendations' && (
                <motion.div
                  key="recommendations"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RecommendationsTab 
                    {...tabProps} 
                    onServiceRecommend={onServiceRecommend}
                  />
                </motion.div>
              )}

              {activeTab === 'packages' && (
                <motion.div
                  key="packages"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PackagesTab {...tabProps} />
                </motion.div>
              )}

              {activeTab === 'insights' && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <InsightsTab {...tabProps} />
                </motion.div>
              )}

              {activeTab === 'budget' && (
                <motion.div
                  key="budget"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BudgetTab {...tabProps} />
                </motion.div>
              )}

              {activeTab === 'comparison' && (
                <motion.div
                  key="comparison"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ComparisonTab {...tabProps} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
