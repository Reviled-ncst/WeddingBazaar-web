/**
 * Timeline Calendar Component
 * Calendar view for timeline events
 */

import React from 'react';
import { Calendar } from 'lucide-react';
import type { TimelineEvent } from '../types/timeline.types';

interface TimelineCalendarProps {
  events: TimelineEvent[];
  onEventClick: (event: TimelineEvent) => void;
  onEventCreate: () => void;
  filter: any;
}

export const TimelineCalendar: React.FC<TimelineCalendarProps> = ({
  events,
  onEventClick,
  onEventCreate,
  filter
}) => {
  return (
    <div className="p-6">
      <div className="text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Calendar View</h3>
        <p className="text-gray-500 mb-4">Advanced calendar integration coming soon</p>
        <button
          onClick={onEventCreate}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Add Event
        </button>
      </div>
      
      {/* Simple event list for now */}
      <div className="mt-8 space-y-3">
        {events.slice(0, 5).map((event) => (
          <div
            key={event.id}
            onClick={() => onEventClick(event)}
            className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{event.title}</h4>
                <p className="text-sm text-gray-600">{event.date.toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.status === 'completed' ? 'bg-green-100 text-green-700' :
                event.status === 'overdue' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {event.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
