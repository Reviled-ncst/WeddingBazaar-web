import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Bell,
  Edit,
  Trash2,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { CoordinatorHeader } from '../layout/CoordinatorHeader';

interface CalendarEvent {
  id: string;
  title: string;
  weddingId: string;
  weddingCouple: string;
  date: Date;
  time: string;
  duration: string;
  location: string;
  type: 'meeting' | 'venue-visit' | 'vendor-meeting' | 'ceremony' | 'deadline' | 'task';
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  attendees: string[];
  notes?: string;
  reminders: string[];
  color: string;
}

interface Timeline {
  id: string;
  weddingId: string;
  weddingCouple: string;
  weddingDate: Date;
  milestones: TimelineMilestone[];
}

interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  category: 'planning' | 'vendor' | 'logistics' | 'legal' | 'other';
  assignedTo?: string;
  priority: 'high' | 'medium' | 'low';
}

const CoordinatorCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'timeline'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterWedding, setFilterWedding] = useState<string>('all');

  // Mock data - replace with API calls
  const mockEvents: CalendarEvent[] = [
    {
      id: 'evt-1',
      title: 'Initial Consultation',
      weddingId: 'wed-1',
      weddingCouple: 'Sarah & James',
      date: new Date(2025, 10, 5),
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Office Conference Room',
      type: 'meeting',
      status: 'scheduled',
      attendees: ['Sarah Johnson', 'James Wilson', 'Me'],
      reminders: ['1 day before', '1 hour before'],
      color: '#ec4899'
    },
    {
      id: 'evt-2',
      title: 'Venue Site Visit',
      weddingId: 'wed-1',
      weddingCouple: 'Sarah & James',
      date: new Date(2025, 10, 10),
      time: '2:00 PM',
      duration: '3 hours',
      location: 'Garden Manor Estate',
      type: 'venue-visit',
      status: 'scheduled',
      attendees: ['Sarah Johnson', 'James Wilson', 'Venue Manager', 'Me'],
      notes: 'Check ceremony area, reception hall, and catering facilities',
      reminders: ['2 days before', '1 day before'],
      color: '#10b981'
    },
    {
      id: 'evt-3',
      title: 'Photographer Meeting',
      weddingId: 'wed-2',
      weddingCouple: 'Emily & David',
      date: new Date(2025, 10, 15),
      time: '11:00 AM',
      duration: '1.5 hours',
      location: 'Photographer Studio',
      type: 'vendor-meeting',
      status: 'scheduled',
      attendees: ['Emily Chen', 'David Brown', 'Photographer', 'Me'],
      reminders: ['1 day before'],
      color: '#8b5cf6'
    },
    {
      id: 'evt-4',
      title: 'Final Payment Deadline',
      weddingId: 'wed-1',
      weddingCouple: 'Sarah & James',
      date: new Date(2025, 10, 20),
      time: '11:59 PM',
      duration: 'All day',
      location: 'N/A',
      type: 'deadline',
      status: 'pending',
      attendees: ['Sarah Johnson', 'James Wilson'],
      notes: 'Final payment to venue and catering',
      reminders: ['1 week before', '3 days before', '1 day before'],
      color: '#ef4444'
    },
    {
      id: 'evt-5',
      title: 'Wedding Ceremony',
      weddingId: 'wed-1',
      weddingCouple: 'Sarah & James',
      date: new Date(2025, 11, 15),
      time: '4:00 PM',
      duration: '6 hours',
      location: 'Garden Manor Estate',
      type: 'ceremony',
      status: 'scheduled',
      attendees: ['150 guests'],
      notes: 'Full coordination - ceremony at 4pm, reception at 6pm',
      reminders: ['1 week before', '3 days before', '1 day before'],
      color: '#f59e0b'
    }
  ];

  const mockTimelines: Timeline[] = [
    {
      id: 'timeline-1',
      weddingId: 'wed-1',
      weddingCouple: 'Sarah & James',
      weddingDate: new Date(2025, 11, 15),
      milestones: [
        {
          id: 'ms-1',
          title: '12 Months Before: Book Venue',
          description: 'Secure wedding venue and sign contract',
          dueDate: new Date(2024, 11, 15),
          status: 'completed',
          category: 'logistics',
          priority: 'high'
        },
        {
          id: 'ms-2',
          title: '10 Months Before: Hire Key Vendors',
          description: 'Book photographer, videographer, and caterer',
          dueDate: new Date(2025, 1, 15),
          status: 'completed',
          category: 'vendor',
          priority: 'high'
        },
        {
          id: 'ms-3',
          title: '6 Months Before: Send Save-the-Dates',
          description: 'Design and send save-the-date cards',
          dueDate: new Date(2025, 5, 15),
          status: 'completed',
          category: 'planning',
          priority: 'medium'
        },
        {
          id: 'ms-4',
          title: '3 Months Before: Finalize Guest List',
          description: 'Confirm final headcount and seating arrangements',
          dueDate: new Date(2025, 8, 15),
          status: 'in-progress',
          category: 'planning',
          assignedTo: 'Sarah Johnson',
          priority: 'high'
        },
        {
          id: 'ms-5',
          title: '2 Months Before: Order Wedding Cake',
          description: 'Finalize cake design and place order',
          dueDate: new Date(2025, 9, 15),
          status: 'upcoming',
          category: 'vendor',
          priority: 'medium'
        },
        {
          id: 'ms-6',
          title: '1 Month Before: Final Venue Walkthrough',
          description: 'Confirm setup details and timeline with venue',
          dueDate: new Date(2025, 10, 15),
          status: 'upcoming',
          category: 'logistics',
          priority: 'high'
        }
      ]
    }
  ];

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDate = (day: number) => {
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return mockEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === dateToCheck.getDate() &&
             eventDate.getMonth() === dateToCheck.getMonth() &&
             eventDate.getFullYear() === dateToCheck.getFullYear();
    });
  };

  const filteredEvents = useMemo(() => {
    return mockEvents.filter(event => {
      const typeMatch = filterType === 'all' || event.type === filterType;
      const weddingMatch = filterWedding === 'all' || event.weddingId === filterWedding;
      return typeMatch && weddingMatch;
    });
  }, [filterType, filterWedding, mockEvents]);

  const eventTypeColors: { [key: string]: string } = {
    'meeting': 'bg-pink-100 text-pink-700 border-pink-300',
    'venue-visit': 'bg-green-100 text-green-700 border-green-300',
    'vendor-meeting': 'bg-purple-100 text-purple-700 border-purple-300',
    'ceremony': 'bg-orange-100 text-orange-700 border-orange-300',
    'deadline': 'bg-red-100 text-red-700 border-red-300',
    'task': 'bg-blue-100 text-blue-700 border-blue-300'
  };

  const statusIcons = {
    'scheduled': <Clock className="w-4 h-4 text-blue-500" />,
    'completed': <CheckCircle2 className="w-4 h-4 text-green-500" />,
    'cancelled': <Trash2 className="w-4 h-4 text-red-500" />,
    'pending': <AlertCircle className="w-4 h-4 text-yellow-500" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      <CoordinatorHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Calendar & Timeline
              </h1>
              <p className="text-gray-600 mt-2">Manage schedules and wedding timelines</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-all flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button 
                onClick={() => setShowEventModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Event
              </button>
            </div>
          </div>
        </motion.div>

        {/* View Mode Selector & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex gap-2">
            {['month', 'week', 'day', 'timeline'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as 'month' | 'week' | 'day' | 'timeline')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-400"
              aria-label="Filter by event type"
            >
              <option value="all">All Types</option>
              <option value="meeting">Meetings</option>
              <option value="venue-visit">Venue Visits</option>
              <option value="vendor-meeting">Vendor Meetings</option>
              <option value="ceremony">Ceremonies</option>
              <option value="deadline">Deadlines</option>
            </select>

            <select
              value={filterWedding}
              onChange={(e) => setFilterWedding(e.target.value)}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-400"
              aria-label="Filter by wedding"
            >
              <option value="all">All Weddings</option>
              <option value="wed-1">Sarah & James</option>
              <option value="wed-2">Emily & David</option>
            </select>
          </div>
        </motion.div>

        {/* Calendar View */}
        {viewMode === 'month' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden"
          >
            {/* Calendar Header */}
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-6 flex items-center justify-between">
              <button onClick={previousMonth} className="p-2 hover:bg-white/20 rounded-lg transition-all" title="Previous Month" aria-label="Previous Month">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-lg transition-all" title="Next Month" aria-label="Next Month">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 bg-gray-50 border-b-2 border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-4 text-center font-semibold text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDay }).map((_, index) => (
                <div key={`empty-${index}`} className="p-4 border border-gray-100 bg-gray-50 min-h-[120px]" />
              ))}

              {/* Calendar days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const events = getEventsForDate(day);
                const isToday = new Date().getDate() === day && 
                               new Date().getMonth() === currentDate.getMonth() &&
                               new Date().getFullYear() === currentDate.getFullYear();

                return (
                  <div
                    key={day}
                    className={`p-2 border border-gray-100 min-h-[120px] hover:bg-pink-50 transition-all ${
                      isToday ? 'bg-pink-50 border-pink-300' : ''
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-pink-600' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className={`text-xs p-1 rounded cursor-pointer hover:shadow-md transition-all border-l-2 ${
                            eventTypeColors[event.type]
                          }`}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-xs opacity-75">{event.time}</div>
                        </div>
                      ))}
                      {events.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{events.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {mockTimelines.map((timeline) => (
              <div key={timeline.id} className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{timeline.weddingCouple}</h3>
                    <p className="text-gray-600">
                      Wedding Date: {timeline.weddingDate.toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all" title="Edit Timeline" aria-label="Edit Timeline">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-400 to-purple-400" />

                  {/* Milestones */}
                  <div className="space-y-6">
                    {timeline.milestones.map((milestone, index) => (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-start gap-4 pl-16"
                      >
                        {/* Timeline dot */}
                        <div 
                          className={`absolute left-6 w-5 h-5 rounded-full border-4 border-white ${
                            milestone.status === 'completed' ? 'bg-green-500' :
                            milestone.status === 'in-progress' ? 'bg-blue-500' :
                            milestone.status === 'overdue' ? 'bg-red-500' :
                            'bg-gray-300'
                          }`}
                        />

                        {/* Milestone content */}
                        <div className="flex-1 bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-pink-300 transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-gray-800 mb-1">{milestone.title}</h4>
                              <p className="text-sm text-gray-600">{milestone.description}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              milestone.priority === 'high' ? 'bg-red-100 text-red-700' :
                              milestone.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {milestone.priority.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {milestone.dueDate.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            {milestone.assignedTo && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {milestone.assignedTo}
                              </div>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                              milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              milestone.status === 'overdue' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {milestone.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Upcoming Events Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {filteredEvents.slice(0, 5).map((event) => (
              <div
                key={event.id}
                onClick={() => {
                  setSelectedEvent(event);
                  setShowEventModal(true);
                }}
                className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-pink-300 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.weddingCouple}</p>
                  </div>
                  {statusIcons[event.status]}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">
                {selectedEvent ? 'Event Details' : 'Create New Event'}
              </h3>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
                title="Close"
                aria-label="Close Modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {selectedEvent ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">{selectedEvent.title}</h4>
                    <p className="text-gray-600">{selectedEvent.weddingCouple}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date</label>
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarIcon className="w-4 h-4 text-pink-600" />
                        <span className="text-gray-800">
                          {selectedEvent.date.toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Time</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-pink-600" />
                        <span className="text-gray-800">{selectedEvent.time}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Duration</label>
                      <span className="block text-gray-800 mt-1">{selectedEvent.duration}</span>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Type</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                        eventTypeColors[selectedEvent.type]
                      }`}>
                        {selectedEvent.type.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-pink-600" />
                      <span className="text-gray-800">{selectedEvent.location}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Attendees</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-pink-600" />
                      <span className="text-gray-800">{selectedEvent.attendees.join(', ')}</span>
                    </div>
                  </div>

                  {selectedEvent.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Notes</label>
                      <p className="text-gray-800 mt-1">{selectedEvent.notes}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-600">Reminders</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Bell className="w-4 h-4 text-pink-600" />
                      <span className="text-gray-800">{selectedEvent.reminders.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Event
                    </button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-600 py-8">
                  Event creation form would go here
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorCalendar;
