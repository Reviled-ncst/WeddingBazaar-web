/**
 * Timeline Stats Component
 */

import React from 'react';
import { BarChart } from 'lucide-react';
import type { TimelineStats } from '../types/timeline.types';

interface TimelineStatsComponentProps {
  stats: TimelineStats | null;
  events: any[];
  className?: string;
}

export const TimelineStatsComponent: React.FC<TimelineStatsComponentProps> = ({ stats, className }) => {
  if (!stats) return null;

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <BarChart className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900">Timeline Statistics</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completedEvents}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.upcomingEvents}</div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.daysUntilWedding}</div>
          <div className="text-sm text-gray-600">Days Left</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-600">{stats.completionRate}%</div>
          <div className="text-sm text-gray-600">Complete</div>
        </div>
      </div>
    </div>
  );
};
