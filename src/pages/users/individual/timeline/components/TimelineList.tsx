/**
 * Timeline List Component
 * List view for timeline events
 */

import React from 'react';
import { List, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import type { TimelineEvent } from '../types/timeline.types';

interface TimelineListProps {
  events: TimelineEvent[];
  onEventClick: (event: TimelineEvent) => void;
  onEventUpdate: (eventId: string, data: any) => Promise<void>;
  onEventDelete: (eventId: string) => Promise<void>;
  filter: any;
}

export const TimelineList: React.FC<TimelineListProps> = ({
  events,
  onEventClick,
  onEventUpdate,
  onEventDelete,
  filter
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <List className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Timeline Events</h3>
        <span className="text-sm text-gray-500">({events.length} events)</span>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => onEventClick(event)}
            className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(event.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(event.priority)}`}>
                    {event.priority}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-500">
                      {event.date.toLocaleDateString()}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {event.category}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                      {event.type}
                    </span>
                  </div>
                  
                  {event.estimatedDuration && (
                    <span className="text-gray-500">
                      ~{event.estimatedDuration}min
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {events.length === 0 && (
          <div className="text-center py-12">
            <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Events Yet</h3>
            <p className="text-gray-500">Start by adding your first timeline event</p>
          </div>
        )}
      </div>
    </div>
  );
};
