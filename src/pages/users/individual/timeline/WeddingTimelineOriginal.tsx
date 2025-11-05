import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoupleHeader } from '../landing/CoupleHeader';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  List,
  BarChart3,
  Target
} from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { useWeddingTimeline } from './hooks/useWeddingTimeline';
import { TimelineCalendar } from './components/TimelineCalendar';
import { TimelineList } from './components/TimelineList';
import { TimelineStatsComponent, MilestoneTracker } from './components';

interface WeddingTimelineProps {
  weddingDate: Date;
  userId: string;
}

export const WeddingTimeline: React.FC<WeddingTimelineProps> = ({
  weddingDate
}) => {
  const [view, setView] = useState<'calendar' | 'list' | 'stats' | 'milestones'>('calendar');
  
  // Use the unified timeline hook
  const {
    events,
    milestones,
    loading,
    error,
    filteredEvents,
    progress,
    upcomingEvents,
    overdueTasks,
    addEvent,
    updateEvent
  } = useWeddingTimeline();

  // Calculate stats from current data
  const stats = useMemo(() => ({
    totalEvents: events.length,
    completedEvents: events.filter(e => e.status === 'completed').length,
    upcomingEvents: upcomingEvents.length,
    overdueEvents: overdueTasks.length,
    completionRate: events.length > 0 ? (events.filter(e => e.status === 'completed').length / events.length) * 100 : 0,
    averageTaskTime: 2.5, // Mock value
    daysUntilWedding: Math.ceil((weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    planningProgress: progress,
    criticalTasksRemaining: events.filter(e => e.priority === 'critical' && e.status !== 'completed').length,
    vendorBookingsCompleted: events.filter(e => e.category === 'booking' && e.status === 'completed').length,
    budgetTasksCompleted: events.filter(e => e.category === 'budget' && e.status === 'completed').length
  }), [events, upcomingEvents.length, overdueTasks.length, weddingDate, progress]);

  // Calculate days until wedding
  const daysUntilWedding = useMemo(() => {
    const today = new Date();
    const wedding = new Date(weddingDate);
    const diffTime = wedding.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [weddingDate]);

  // Handle view changes
  const handleViewChange = useCallback((newView: 'calendar' | 'list' | 'stats' | 'milestones') => {
    setView(newView);
  }, []);

  // Handle event actions
  const handleAddEvent = useCallback(async (eventData: any) => {
    try {
      await addEvent(eventData);
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  }, [addEvent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <CoupleHeader />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <CoupleHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-red-500 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg">Error loading timeline: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <CoupleHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl mr-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Wedding Timeline
              </h1>
              <p className="text-gray-600 mt-2">
                Smart planning with personalized insights and recommendations
              </p>
            </div>
          </div>

          {/* Countdown and Stats */}
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
              <span className="font-medium">
                {daysUntilWedding} days until your wedding
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-gray-600" />
              <span>{stats?.completionRate.toFixed(1) || 0}% complete</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-600" />
              <span>{stats?.upcomingEvents || 0} upcoming events</span>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <div className="flex space-x-2">
              {[
                { id: 'calendar', label: 'Calendar', icon: Calendar },
                { id: 'list', label: 'List View', icon: List },
                { id: 'stats', label: 'Analytics', icon: BarChart3 },
                { id: 'milestones', label: 'Milestones', icon: Target }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleViewChange(id as any)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium",
                    view === id
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {view === 'calendar' && (
              <TimelineCalendar
                events={filteredEvents}
                onEventClick={() => {}}
                onEventCreate={() => handleAddEvent({ title: 'New Event', date: new Date() })}
                filter={{}}
              />
            )}
            
            {view === 'list' && (
              <TimelineList
                events={filteredEvents}
                onEventClick={() => {}}
                onEventUpdate={updateEvent}
                onEventDelete={async () => {}}
                filter={{}}
              />
            )}
            
            {view === 'stats' && (
              <TimelineStatsComponent
                stats={stats}
                events={filteredEvents}
                milestones={milestones}
              />
            )}
            
            {view === 'milestones' && (
              <MilestoneTracker
                milestones={milestones}
                onMilestoneUpdate={() => {}}
                weddingDate={weddingDate}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.totalEvents || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats?.completedEvents || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.upcomingEvents || 0}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.completionRate.toFixed(1) || 0}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WeddingTimeline;
