/**
 * Smart Insights Component
 */

import React from 'react';
import { Brain } from 'lucide-react';

interface AIInsightsProps {
  insights?: any[];
  suggestions?: any[];
  conflicts?: any[];
  isAnalyzing?: boolean;
  className?: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ 
  insights = [], 
  isAnalyzing = false, 
  className 
}) => {
  return (
    <div className={`bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-semibold text-gray-900">Smart Insights</h2>
        {isAnalyzing && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
        )}
      </div>
      <div className="space-y-3">
        {insights.length > 0 ? insights.map((insight, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
            <p className="text-sm text-gray-600">{insight.description}</p>
            <div className="mt-2 text-xs text-purple-600">
              {Math.round(insight.confidence * 100)}% confidence
            </div>
          </div>
        )) : (
          <p className="text-gray-500 text-sm">Smart analysis of your timeline in progress...</p>
        )}
      </div>
    </div>
  );
};
