/**
 * Milestone Tracker Component
 */

import React from 'react';
import { Target, CheckSquare } from 'lucide-react';

interface MilestoneTrackerProps {
  milestones?: any[];
  onMilestoneClick?: (milestone: any) => void;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-semibold text-gray-900">Milestones</h2>
      </div>
      <div className="space-y-3">
        {['Venue Booked', 'Photographer Selected', 'Catering Confirmed'].map((milestone, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CheckSquare className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-900">{milestone}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
