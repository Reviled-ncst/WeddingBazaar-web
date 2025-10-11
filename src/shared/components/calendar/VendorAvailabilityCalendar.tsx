import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon,
  ChevronLeft, 
  ChevronRight,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  Users,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { availabilityService, type VendorAvailability, type VendorOffDay } from '../../../services/availabilityService';
import { bookingAvailabilityService, type VendorCalendarView } from '../../../services/bookingAvailabilityService';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../../utils/cn';

interface VendorAvailabilityCalendarProps {
  vendorId?: string;
  className?: string;
  onDateSelect?: (date: string, availability: VendorAvailability) => void;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  availability?: VendorAvailability;
  offDay?: VendorOffDay;
  calendarView?: VendorCalendarView;
}

export const VendorAvailabilityCalendar: React.FC<VendorAvailabilityCalendarProps> = ({
  vendorId,
  className,
  onDateSelect
}) => {
  const { user } = useAuth();
  const actualVendorId = vendorId || (user?.role === 'vendor' ? user.id : user?.vendorId);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<VendorAvailability[]>([]);
  const [calendarViewData, setCalendarViewData] = useState<VendorCalendarView[]>([]);
  const [offDays, setOffDays] = useState<VendorOffDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOffDayModal, setShowOffDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Load calendar data
  useEffect(() => {
    if (actualVendorId) {
      loadCalendarData();
      loadOffDays();
    }
  }, [actualVendorId, currentDate]);

  const loadCalendarData = async () => {
    if (!actualVendorId) return;
    
    setLoading(true);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      console.log('📅 [VendorCalendar] Loading calendar data for:', { actualVendorId, startStr, endStr });
      
      // Load both availability and booking information
      const [availabilityData, calendarViewData] = await Promise.all([
        availabilityService.getVendorCalendar(actualVendorId, startStr, endStr),
        bookingAvailabilityService.getVendorCalendarView(actualVendorId, startStr, endStr)
      ]);
      
      setCalendarData(availabilityData);
      setCalendarViewData(calendarViewData);
      
      console.log('✅ [VendorCalendar] Calendar data loaded:', availabilityData.length, 'days,', calendarViewData.length, 'booking views');
    } catch (error) {
      console.error('❌ [VendorCalendar] Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOffDays = async () => {
    if (!actualVendorId) return;
    
    try {
      const data = await availabilityService.getVendorOffDays(actualVendorId);
      setOffDays(data);
    } catch (error) {
      console.error('❌ [VendorAvailabilityCalendar] Error loading off days:', error);
      setOffDays([]);
    }
  };

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const availability = calendarData.find(a => a.date === dateStr);
      const offDay = offDays.find(od => od.date === dateStr);
      const calendarView = calendarViewData.find(cv => cv.date === dateStr);
      
      days.push({
        date: dateStr,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        availability,
        offDay,
        calendarView
      });
    }
    
    return days;
  };

  const getDayStatus = (day: CalendarDay) => {
    // Use calendar view data first (includes booking info), fallback to basic availability
    if (day.calendarView) {
      switch (day.calendarView.status) {
        case 'off_day':
          return {
            status: 'off',
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: Ban,
            label: `Off Day${day.calendarView.offDayReason ? ': ' + day.calendarView.offDayReason : ''}`
          };
        case 'fully_booked':
          return {
            status: 'booked',
            color: 'bg-orange-100 text-orange-800 border-orange-200',
            icon: Users,
            label: `Fully Booked (${day.calendarView.bookingCount}/${day.calendarView.maxBookings})`
          };
        case 'partially_booked':
          return {
            status: 'partial',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: Clock,
            label: `Partially Booked (${day.calendarView.bookingCount}/${day.calendarView.maxBookings})`
          };
        case 'available':
        default:
          return {
            status: 'available',
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: CheckCircle,
            label: 'Available'
          };
      }
    }

    // Fallback to original logic
    if (day.offDay) {
      return {
        status: 'off',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: Ban,
        label: 'Off Day'
      };
    }
    
    if (day.availability) {
      if (!day.availability.isAvailable) {
        return {
          status: 'booked',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Users,
          label: 'Fully Booked'
        };
      }
      
      if (day.availability.currentBookings && day.availability.currentBookings > 0) {
        return {
          status: 'partial',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Partially Booked'
        };
      }
    }
    
    return {
      status: 'available',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      label: 'Available'
    };
  };

  const handleAddOffDay = async (date: string, reason: string, isRecurring: boolean = false) => {
    if (!actualVendorId) return;
    
    try {
      const newOffDays = [{
        date,
        reason,
        isRecurring,
        recurringPattern: undefined as any
      }];
      
      await availabilityService.setVendorOffDays(actualVendorId, newOffDays);
      loadOffDays();
      loadCalendarData();
      
      console.log('✅ [VendorCalendar] Off day added successfully');
    } catch (error) {
      console.error('❌ [VendorCalendar] Error adding off day:', error);
    }
  };

  const handleRemoveOffDay = async (offDayId: string) => {
    if (!actualVendorId) return;
    
    try {
      await availabilityService.removeVendorOffDay(actualVendorId, offDayId);
      loadOffDays();
      loadCalendarData();
      
      console.log('✅ [VendorCalendar] Off day removed successfully');
    } catch (error) {
      console.error('❌ [VendorCalendar] Error removing off day:', error);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const calendarDays = generateCalendarDays();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (!actualVendorId) {
    return (
      <div className="p-8 text-center text-gray-500">
        <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Please log in as a vendor to manage availability</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-2xl shadow-lg border border-gray-200", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Availability Calendar</h2>
            <p className="text-gray-600">Manage your booking calendar and off days</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'calendar' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                )}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'list' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                )}
              >
                List
              </button>
            </div>
            
            {/* Settings */}
            <button
              onClick={() => setShowBookingDetails(!showBookingDetails)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={showBookingDetails ? "Hide booking details" : "Show booking details"}
            >
              {showBookingDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        {viewMode === 'calendar' && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous month"
              aria-label="Go to previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-semibold">{monthYear}</h3>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next month"
              aria-label="Go to next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Legend & Instructions */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Available (Click to set off day)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Partially Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Fully Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Off Day (Click to remove)</span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Quick Actions:</strong> Click on any available date to instantly set it as an off day. 
                Click on existing off days to remove them. Use the + button for detailed off day settings.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : viewMode === 'calendar' ? (
          <>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayStatus = getDayStatus(day);
                const IconComponent = dayStatus.icon;
                
                return (
                  <motion.div
                    key={`${day.date}-${index}`}
                    whileHover={{ 
                      scale: day.isCurrentMonth ? 1.05 : 1.0,
                      boxShadow: day.isCurrentMonth ? "0 10px 25px -5px rgba(0, 0, 0, 0.1)" : "none"
                    }}
                    className={cn(
                      "relative p-3 rounded-lg border-2 transition-all duration-200 min-h-[80px] group",
                      day.isCurrentMonth ? "opacity-100 cursor-pointer" : "opacity-40 cursor-default",
                      day.isToday ? "ring-2 ring-blue-500" : "",
                      dayStatus.color,
                      // Enhanced hover states
                      day.isCurrentMonth && day.offDay ? "hover:bg-red-100 hover:border-red-400" : "",
                      day.isCurrentMonth && (!day.availability || day.availability.isAvailable) && !day.offDay ? "hover:bg-gray-100 hover:border-gray-400" : ""
                    )}
                    title={
                      day.isCurrentMonth 
                        ? day.offDay 
                          ? `Off Day: ${day.offDay.reason} (Click to remove)`
                          : (!day.availability || day.availability.isAvailable)
                            ? `Available - Click to set as off day`
                            : `${dayStatus.label} - ${day.availability?.currentBookings || 0}/${day.availability?.maxBookings || 1} bookings`
                        : undefined
                    }
                    onClick={async () => {
                      setSelectedDate(day.date);
                      
                      // If it's an off day, remove it with confirmation
                      if (day.offDay) {
                        const confirmed = window.confirm(
                          `Remove off day for ${new Date(day.date).toLocaleDateString()}?\n\nReason: ${day.offDay.reason}`
                        );
                        if (confirmed) {
                          await handleRemoveOffDay(day.offDay.id);
                        }
                        return;
                      }
                      
                      // If it's available, quickly set as off day
                      if (!day.availability || day.availability.isAvailable) {
                        const today = new Date();
                        const clickDate = new Date(day.date);
                        
                        // Don't allow setting past dates as off days
                        if (clickDate < today) {
                          alert('Cannot set past dates as off days');
                          return;
                        }
                        
                        // Quick off day with default reason
                        const success = await availabilityService.setSingleVendorOffDay(
                          actualVendorId!, 
                          day.date, 
                          'Personal time off', 
                          false
                        );
                        
                        if (success) {
                          loadOffDays();
                          loadCalendarData();
                          
                          // Show success notification
                          const notification = document.createElement('div');
                          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
                          notification.innerHTML = `
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"></path>
                            </svg>
                            Off day set for ${clickDate.toLocaleDateString()}
                          `;
                          document.body.appendChild(notification);

                          setTimeout(() => {
                            if (document.body.contains(notification)) {
                              document.body.removeChild(notification);
                            }
                          }, 3000);
                        } else {
                          // Show error notification
                          const notification = document.createElement('div');
                          notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
                          notification.innerHTML = `
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path>
                            </svg>
                            Failed to set off day. Backend API not yet deployed.
                          `;
                          document.body.appendChild(notification);

                          setTimeout(() => {
                            if (document.body.contains(notification)) {
                              document.body.removeChild(notification);
                            }
                          }, 5000);
                        }
                        return;
                      }
                      
                      // For other states, use the original callback
                      if (onDateSelect && day.availability) {
                        onDateSelect(day.date, day.availability);
                      }
                    }}
                  >
                    {/* Click Action Overlay */}
                    {day.isCurrentMonth && (day.offDay || (!day.availability || day.availability.isAvailable)) && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                          {day.offDay ? 'Click to remove' : 'Click to set off day'}
                        </div>
                      </div>
                    )}

                    <div className="text-sm font-medium">{day.day}</div>
                    
                    {day.isCurrentMonth && (
                      <div className="mt-1">
                        <IconComponent className="w-4 h-4" />
                        
                        {/* Enhanced booking details with actual booking info */}
                        {showBookingDetails && day.calendarView && day.calendarView.bookings.length > 0 && (
                          <div className="mt-1 text-xs space-y-1">
                            <div className="font-medium">
                              {day.calendarView.bookingCount}/{day.calendarView.maxBookings} bookings
                            </div>
                            {day.calendarView.bookings.slice(0, 2).map((booking, idx) => (
                              <div key={idx} className="truncate" title={`${booking.clientName} - ${booking.serviceName}`}>
                                {booking.clientName}
                              </div>
                            ))}
                            {day.calendarView.bookings.length > 2 && (
                              <div className="text-gray-500">
                                +{day.calendarView.bookings.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Fallback to basic booking count */}
                        {showBookingDetails && !day.calendarView && day.availability && (
                          <div className="mt-1 text-xs">
                            {day.availability.currentBookings || 0}/{day.availability.maxBookings || 1}
                          </div>
                        )}
                        
                        {day.offDay && (
                          <div className="mt-1 text-xs truncate" title={day.offDay.reason}>
                            {day.offDay.reason}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Add Off Day Button */}
                    {day.isCurrentMonth && !day.offDay && dayStatus.status === 'available' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(day.date);
                          setShowOffDayModal(true);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-gray-600 text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        title="Set as off day"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                    
                    {/* Remove Off Day Button */}
                    {day.offDay && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveOffDay(day.offDay!.id);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        title="Remove off day"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          // List View
          <div className="space-y-4">
            {calendarDays
              .filter(day => day.isCurrentMonth && (day.availability || day.offDay))
              .map(day => {
                const dayStatus = getDayStatus(day);
                const IconComponent = dayStatus.icon;
                
                return (
                  <div
                    key={day.date}
                    className={cn(
                      "p-4 rounded-lg border-2 flex items-center justify-between",
                      dayStatus.color
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5" />
                      <div>
                        <div className="font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm opacity-80">{dayStatus.label}</div>
                        {day.offDay && (
                          <div className="text-sm mt-1">{day.offDay.reason}</div>
                        )}
                      </div>
                    </div>
                    
                    {day.availability && showBookingDetails && (
                      <div className="text-sm">
                        {day.availability.currentBookings || 0}/{day.availability.maxBookings || 1} bookings
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Off Day Modal */}
      <OffDayModal
        isOpen={showOffDayModal}
        onClose={() => {
          setShowOffDayModal(false);
          setSelectedDate(null);
        }}
        date={selectedDate}
        onAddOffDay={handleAddOffDay}
      />
    </div>
  );
};

// Off Day Modal Component
interface OffDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  onAddOffDay: (date: string, reason: string, isRecurring?: boolean) => void;
}

const OffDayModal: React.FC<OffDayModalProps> = ({
  isOpen,
  onClose,
  date,
  onAddOffDay
}) => {
  const [reason, setReason] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && reason.trim()) {
      onAddOffDay(date, reason.trim(), isRecurring);
      setReason('');
      setIsRecurring(false);
      onClose();
    }
  };

  if (!isOpen || !date) return null;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Set Off Day</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close modal"
              aria-label="Close off day modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900">{formattedDate}</div>
            <div className="text-sm text-gray-600">This date will be marked as unavailable</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for unavailability
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Personal time off, Holiday, Maintenance"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="recurring" className="text-sm text-gray-700">
                Make this a recurring off day (same day each week)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Set Off Day
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
