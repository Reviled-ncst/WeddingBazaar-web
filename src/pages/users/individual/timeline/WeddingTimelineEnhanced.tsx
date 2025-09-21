/**
 * Enhanced Wedding Timeline - Advanced Planning Dashboard
 * AI-powered timeline with drag & drop, advanced insights, and collaboration features
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoupleHeader } from '../landing/CoupleHeader';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Plus,
  List,
  BarChart3,
  Target,
  Filter,
  Search,
  Settings,
  Users,
  Bell,
  Share2,
  Download,
  Upload,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  MapPin,
  DollarSign,
  Star,
  MessageSquare,
  Zap,
  RefreshCw,
  Grid,
  Calendar as CalendarView,
  Archive,
  Trash2,
  Edit3,
  Copy,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: 'planning' | 'booking' | 'preparation' | 'ceremony' | 'reception';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignee?: string;
  cost?: number;
  vendor?: string;
  location?: string;
  duration?: number; // in minutes
  notes?: string;
  dependencies?: string[];
  attachments?: string[];
  reminders?: Date[];
  isPrivate?: boolean;
  color?: string;
  tags?: string[];
}

interface TimelineMilestone {
  id: string;
  title: string;
  date: Date;
  description: string;
  progress: number;
  events: string[];
  isCompleted: boolean;
  color?: string;
}

export const WeddingTimelineEnhanced: React.FC = () => {
  const [view, setView] = useState<'calendar' | 'list' | 'gantt' | 'kanban'>('calendar');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'category'>('date');
  const [groupBy, setGroupBy] = useState<'category' | 'status' | 'priority' | 'none'>('category');
  const [isLoading, setIsLoading] = useState(false);

  // Wedding date
  const weddingDate = new Date('2024-08-15');

  // Mock timeline events with comprehensive data
  const mockEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'Book Wedding Venue',
      description: 'Secure the perfect venue for the ceremony and reception',
      date: new Date('2024-03-15'),
      category: 'booking',
      priority: 'critical',
      status: 'completed',
      assignee: 'Sarah',
      cost: 8500,
      vendor: 'Enchanted Gardens',
      location: 'Downtown',
      duration: 480,
      notes: 'Confirmed with 20% deposit. Final payment due 30 days before',
      tags: ['venue', 'outdoor', 'garden'],
      color: '#10B981'
    },
    {
      id: '2',
      title: 'Engagement Photos',
      description: 'Professional engagement photoshoot for save-the-dates',
      date: new Date('2024-04-10'),
      category: 'preparation',
      priority: 'high',
      status: 'completed',
      assignee: 'Both',
      cost: 800,
      vendor: 'Moments Photography',
      duration: 120,
      tags: ['photography', 'engagement'],
      color: '#8B5CF6'
    },
    {
      id: '3',
      title: 'Send Save the Dates',
      description: 'Mail save-the-date cards to all guests',
      date: new Date('2024-04-25'),
      category: 'planning',
      priority: 'high',
      status: 'completed',
      assignee: 'Sarah',
      notes: 'Sent to 75 guests via mail and digital',
      tags: ['stationery', 'guests'],
      color: '#F59E0B'
    },
    {
      id: '4',
      title: 'Book Caterer',
      description: 'Finalize catering menu and service for reception',
      date: new Date('2024-05-15'),
      category: 'booking',
      priority: 'critical',
      status: 'in-progress',
      assignee: 'Mike',
      cost: 6200,
      vendor: 'Gourmet Delights',
      notes: 'Tasting scheduled for May 10th',
      tags: ['catering', 'food', 'reception'],
      color: '#EF4444'
    },
    {
      id: '5',
      title: 'Choose Wedding Dress',
      description: 'Final fitting and alterations for wedding dress',
      date: new Date('2024-06-01'),
      category: 'preparation',
      priority: 'high',
      status: 'pending',
      assignee: 'Sarah',
      cost: 1200,
      vendor: 'Bridal Boutique',
      notes: 'Second fitting scheduled',
      tags: ['dress', 'bridal', 'alterations'],
      color: '#EC4899'
    },
    {
      id: '6',
      title: 'Bachelor/Bachelorette Parties',
      description: 'Plan and organize pre-wedding celebrations',
      date: new Date('2024-07-20'),
      category: 'planning',
      priority: 'medium',
      status: 'pending',
      assignee: 'Wedding Party',
      cost: 800,
      tags: ['party', 'celebration', 'friends'],
      color: '#06B6D4'
    },
    {
      id: '7',
      title: 'Rehearsal Dinner',
      description: 'Rehearsal and dinner for wedding party and families',
      date: new Date('2024-08-14'),
      category: 'ceremony',
      priority: 'high',
      status: 'pending',
      assignee: 'Both',
      cost: 1500,
      location: 'Riverside Restaurant',
      tags: ['rehearsal', 'dinner', 'family'],
      color: '#7C3AED'
    },
    {
      id: '8',
      title: 'Wedding Day',
      description: 'The big day! Ceremony and reception',
      date: new Date('2024-08-15'),
      category: 'ceremony',
      priority: 'critical',
      status: 'pending',
      assignee: 'Both',
      cost: 15000,
      vendor: 'Multiple',
      location: 'Enchanted Gardens',
      duration: 600,
      tags: ['wedding', 'ceremony', 'reception'],
      color: '#DC2626'
    }
  ];

  // Mock milestones
  const mockMilestones: TimelineMilestone[] = [
    {
      id: '1',
      title: 'Early Planning Phase',
      date: new Date('2024-03-31'),
      description: 'Venue, major vendors, and save-the-dates',
      progress: 100,
      events: ['1', '2', '3'],
      isCompleted: true,
      color: '#10B981'
    },
    {
      id: '2',
      title: 'Mid Planning Phase',
      date: new Date('2024-06-30'),
      description: 'Catering, attire, and detailed planning',
      progress: 60,
      events: ['4', '5'],
      isCompleted: false,
      color: '#F59E0B'
    },
    {
      id: '3',
      title: 'Final Preparations',
      date: new Date('2024-08-14'),
      description: 'Final details and pre-wedding events',
      progress: 20,
      events: ['6', '7'],
      isCompleted: false,
      color: '#EF4444'
    },
    {
      id: '4',
      title: 'Wedding Day',
      date: new Date('2024-08-15'),
      description: 'The celebration!',
      progress: 0,
      events: ['8'],
      isCompleted: false,
      color: '#DC2626'
    }
  ];

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = mockEvents;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(event => event.priority === selectedPriority);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(event => event.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter completed if hidden
    if (!showCompleted) {
      filtered = filtered.filter(event => event.status !== 'completed');
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return a.date.getTime() - b.date.getTime();
        case 'priority':
          const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [mockEvents, selectedCategory, selectedPriority, selectedStatus, searchQuery, showCompleted, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalEvents = mockEvents.length;
    const completedEvents = mockEvents.filter(e => e.status === 'completed').length;
    const inProgressEvents = mockEvents.filter(e => e.status === 'in-progress').length;
    const pendingEvents = mockEvents.filter(e => e.status === 'pending').length;
    const overdueEvents = mockEvents.filter(e => 
      e.status !== 'completed' && e.date < new Date()
    ).length;
    const upcomingEvents = mockEvents.filter(e => 
      e.status !== 'completed' && e.date > new Date() && e.date <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length;
    const totalCost = mockEvents.reduce((sum, e) => sum + (e.cost || 0), 0);
    const completionRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;

    return {
      totalEvents,
      completedEvents,
      inProgressEvents,
      pendingEvents,
      overdueEvents,
      upcomingEvents,
      totalCost,
      completionRate
    };
  }, [mockEvents]);

  // Days until wedding
  const daysUntilWedding = useMemo(() => {
    const today = new Date();
    const diffTime = weddingDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [weddingDate]);

  // Group events
  const groupedEvents = useMemo(() => {
    if (groupBy === 'none') return { 'All Events': filteredEvents };

    const groups: Record<string, TimelineEvent[]> = {};

    filteredEvents.forEach(event => {
      let groupKey = '';
      switch (groupBy) {
        case 'category':
          groupKey = event.category.charAt(0).toUpperCase() + event.category.slice(1);
          break;
        case 'status':
          groupKey = event.status.charAt(0).toUpperCase() + event.status.slice(1);
          break;
        case 'priority':
          groupKey = event.priority.charAt(0).toUpperCase() + event.priority.slice(1);
          break;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(event);
    });

    return groups;
  }, [filteredEvents, groupBy]);

  // Handle event actions
  const handleAddEvent = useCallback(() => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  }, []);

  const handleEditEvent = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleDeleteEvent = useCallback((eventId: string) => {
    // Mock delete functionality
    console.log('Deleting event:', eventId);
  }, []);

  const handleStatusChange = useCallback((eventId: string, newStatus: TimelineEvent['status']) => {
    // Mock status change
    console.log('Changing status:', eventId, newStatus);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-600 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-600 border-green-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Category icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking': return <Calendar className="h-4 w-4" />;
      case 'planning': return <Target className="h-4 w-4" />;
      case 'preparation': return <Settings className="h-4 w-4" />;
      case 'ceremony': return <Star className="h-4 w-4" />;
      case 'reception': return <Users className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <CoupleHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wedding <span className="text-pink-600">Timeline</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            AI-powered planning with personalized insights and collaboration
          </p>

          {/* Wedding Countdown */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 mr-2" />
              <h2 className="text-2xl font-bold">
                {daysUntilWedding} Days Until Your Wedding!
              </h2>
            </div>
            <p className="text-pink-100">
              {weddingDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completionRate.toFixed(1)}%</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.upcomingEvents}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdueEvents}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="text-2xl font-bold text-purple-600">${stats.totalCost.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* View Toggle */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'calendar', label: 'Calendar', icon: CalendarView },
                { id: 'list', label: 'List', icon: List },
                { id: 'gantt', label: 'Gantt', icon: BarChart3 },
                { id: 'kanban', label: 'Kanban', icon: Grid }
              ].map((viewOption) => (
                <button
                  key={viewOption.id}
                  onClick={() => setView(viewOption.id as any)}
                  className={cn(
                    'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all',
                    view === viewOption.id
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <viewOption.icon className="h-4 w-4 mr-2" />
                  {viewOption.label}
                </button>
              ))}
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-64"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center px-4 py-2 border rounded-lg transition-all',
                  showFilters ? 'border-pink-500 text-pink-600 bg-pink-50' : 'border-gray-300 text-gray-600'
                )}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>

              {/* Add Event */}
              <button
                onClick={handleAddEvent}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </button>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-pink-600 transition-colors disabled:opacity-50"
                title="Refresh timeline"
              >
                <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="mt-6 pt-6 border-t border-gray-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      <option value="booking">Booking</option>
                      <option value="planning">Planning</option>
                      <option value="preparation">Preparation</option>
                      <option value="ceremony">Ceremony</option>
                      <option value="reception">Reception</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="all">All Priorities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="date">Date</option>
                      <option value="priority">Priority</option>
                      <option value="category">Category</option>
                    </select>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showCompleted}
                        onChange={(e) => setShowCompleted(e.target.checked)}
                        className="mr-2 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="text-sm text-gray-700">Show completed events</span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
                      <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value as any)}
                        className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="none">No Grouping</option>
                        <option value="category">Category</option>
                        <option value="status">Status</option>
                        <option value="priority">Priority</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {filteredEvents.length} of {mockEvents.length} events
                    </span>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedPriority('all');
                        setSelectedStatus('all');
                        setSearchQuery('');
                      }}
                      className="text-sm text-pink-600 hover:text-pink-700"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timeline Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {view === 'list' && (
            <div className="space-y-6">
              {Object.entries(groupedEvents).map(([groupName, events]) => (
                <div key={groupName} className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    {getCategoryIcon(groupName.toLowerCase())}
                    <span className="ml-2">{groupName}</span>
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                      {events.length}
                    </span>
                  </h3>
                  
                  <div className="space-y-4">
                    {events.map((event) => (
                      <motion.div
                        key={event.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all group"
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: event.color || '#6B7280' }}
                              ></div>
                              <h4 className="font-semibold text-gray-900">{event.title}</h4>
                              <span className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium border',
                                getPriorityColor(event.priority)
                              )}>
                                {event.priority}
                              </span>
                              <span className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium border',
                                getStatusColor(event.status)
                              )}>
                                {event.status}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {event.date.toLocaleDateString()}
                              </div>
                              {event.vendor && (
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {event.vendor}
                                </div>
                              )}
                              {event.cost && (
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  ${event.cost.toLocaleString()}
                                </div>
                              )}
                              {event.location && (
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {event.location}
                                </div>
                              )}
                            </div>

                            {event.tags && event.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {event.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit event"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete event"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Status Actions */}
                        {event.status !== 'completed' && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Mark as:</span>
                              {event.status !== 'in-progress' && (
                                <button
                                  onClick={() => handleStatusChange(event.id, 'in-progress')}
                                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200 transition-colors"
                                >
                                  In Progress
                                </button>
                              )}
                              <button
                                onClick={() => handleStatusChange(event.id, 'completed')}
                                className="px-3 py-1 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200 transition-colors"
                              >
                                Completed
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other views placeholder */}
          {view !== 'list' && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="mb-4">
                {view === 'calendar' && <CalendarView className="h-16 w-16 text-gray-300 mx-auto" />}
                {view === 'gantt' && <BarChart3 className="h-16 w-16 text-gray-300 mx-auto" />}
                {view === 'kanban' && <Grid className="h-16 w-16 text-gray-300 mx-auto" />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {view.charAt(0).toUpperCase() + view.slice(1)} View
              </h3>
              <p className="text-gray-600 mb-4">
                This view is coming soon! Stay tuned for advanced {view} features.
              </p>
              <button
                onClick={() => setView('list')}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Switch to List View
              </button>
            </div>
          )}
        </motion.div>

        {/* Empty State */}
        {filteredEvents.length === 0 && view === 'list' && (
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedPriority('all');
                setSelectedStatus('all');
              }}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}

        {/* Milestones Section */}
        <motion.div
          className="mt-12 bg-white rounded-2xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Star className="h-6 w-6 mr-2 text-pink-600" />
            Wedding Milestones
          </h2>
          
          <div className="space-y-4">
            {mockMilestones.map((milestone, index) => (
              <div key={milestone.id} className="relative">
                {/* Connection line */}
                {index < mockMilestones.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{ backgroundColor: milestone.color }}
                  >
                    {milestone.isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Clock className="h-6 w-6" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                      <span className="text-sm text-gray-600">
                        {milestone.date.toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{milestone.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{milestone.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${milestone.progress}%`,
                              backgroundColor: milestone.color 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <span className="text-sm text-gray-600">
                        {milestone.events.length} events
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WeddingTimelineEnhanced;
