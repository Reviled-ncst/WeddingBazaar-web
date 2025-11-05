import { useState, useMemo } from 'react';
import type { TimelineEvent, TimelineMilestone } from '../types/timeline.types';
import { useTimelineData } from './useTimelineData';
import { useTimelineAI } from './useTimelineAI';

// Timeline filters type definition
export interface TimelineFilters {
  categories: string[];
  priority: string[];
  status: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

// Timeline view type (simplified from the interface)
export type TimelineViewType = 'calendar' | 'list' | 'gantt';

export interface UseWeddingTimelineReturn {
  // State
  events: TimelineEvent[];
  milestones: TimelineMilestone[];
  currentView: TimelineViewType;
  filters: TimelineFilters;
  loading: boolean;
  error: string | null;
  
  // Computed
  filteredEvents: TimelineEvent[];
  completedMilestones: number;
  totalMilestones: number;
  progress: number;
  upcomingEvents: TimelineEvent[];
  overdueTasks: TimelineEvent[];
  
  // Actions
  setView: (view: TimelineViewType) => void;
  setFilters: (filters: Partial<TimelineFilters>) => void;
  addEvent: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<TimelineEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  markComplete: (id: string) => Promise<void>;
  rescheduleEvent: (id: string, newDate: Date) => Promise<void>;
  
  // Smart Features
  suggestions: any[];
  generateSuggestions: () => Promise<void>;
  autoSchedule: (eventType: string) => Promise<void>;
}

export const useWeddingTimeline = (): UseWeddingTimelineReturn => {
  // State
  const [currentView, setCurrentView] = useState<TimelineViewType>('calendar');
  const [filters, setFilters] = useState<TimelineFilters>({
    categories: [],
    priority: [],
    status: [],
    dateRange: {
      start: new Date(),
      end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [milestones] = useState<TimelineMilestone[]>([]); // Mock empty array for now

  // Hooks
  const {
    events,
    isLoading: dataLoading,
    createEvent: addTimelineEvent,
    updateEvent: updateTimelineEvent,
    deleteEvent: deleteTimelineEvent,
    refreshData
  } = useTimelineData();

  const {
    suggestions,
    isAnalyzing: aiLoading,
    getOptimizations,
    predictDeadlines
  } = useTimelineAI(events);

  // Computed values
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(event.category)) {
        return false;
      }
      
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(event.priority)) {
        return false;
      }
      
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(event.status)) {
        return false;
      }
      
      // Date range filter
      const eventDate = new Date(event.date);
      if (eventDate < filters.dateRange.start || eventDate > filters.dateRange.end) {
        return false;
      }
      
      return true;
    });
  }, [events, filters]);

  const completedMilestones = useMemo(() => {
    return milestones.filter((milestone: TimelineMilestone) => milestone.status === 'completed').length;
  }, [milestones]);

  const totalMilestones = milestones.length;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const upcoming = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= upcoming && event.status !== 'completed';
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const overdueTasks = useMemo(() => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < now && event.status !== 'completed';
    });
  }, [events]);

  // Actions
  const setView = (view: TimelineViewType) => {
    setCurrentView(view);
  };

  const updateFilters = (newFilters: Partial<TimelineFilters>) => {
    setFilters((prev: TimelineFilters) => ({
      ...prev,
      ...newFilters
    }));
  };

  const addEvent = async (eventData: Omit<TimelineEvent, 'id'>) => {
    try {
      setError(null);
      await addTimelineEvent(eventData);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add event');
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: Partial<TimelineEvent>) => {
    try {
      setError(null);
      await updateTimelineEvent(id, updates);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      setError(null);
      await deleteTimelineEvent(id);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    }
  };

  const markComplete = async (id: string) => {
    try {
      await updateEvent(id, { status: 'completed' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark event as complete');
      throw err;
    }
  };

  const rescheduleEvent = async (id: string, newDate: Date) => {
    try {
      await updateEvent(id, { date: newDate });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule event');
      throw err;
    }
  };

  const autoSchedule = async (_eventType: string) => {
    try {
      setError(null);
      await getOptimizations(); // Use smart optimization function
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to auto-schedule event');
      throw err;
    }
  };

  const generateSuggestions = async () => {
    try {
      setError(null);
      await predictDeadlines(); // Use smart prediction function
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
      throw err;
    }
  };

  return {
    // State
    events,
    milestones,
    currentView,
    filters,
    loading: dataLoading || aiLoading,
    error,
    
    // Computed
    filteredEvents,
    completedMilestones,
    totalMilestones,
    progress,
    upcomingEvents,
    overdueTasks,
    
    // Actions
    setView,
    setFilters: updateFilters,
    addEvent,
    updateEvent,
    deleteEvent,
    markComplete,
    rescheduleEvent,
    
    // Smart Features
    suggestions,
    generateSuggestions,
    autoSchedule
  };
};

export default useWeddingTimeline;
