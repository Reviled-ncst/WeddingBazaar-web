/**
 * Personalized Tips Component
 */

import React from 'react';
import { Lightbulb } from 'lucide-react';

interface PersonalizedTipsProps {
  preferences: any;
  recommendations: any;
  className?: string;
}

export const PersonalizedTips: React.FC<PersonalizedTipsProps> = ({ className }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-900">Personalized Tips</h2>
      </div>
      <div className="space-y-3">
        {['Book your photographer early', 'Consider seasonal flowers', 'Plan for weather backup'].map((tip, i) => (
          <div key={i} className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-700">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
