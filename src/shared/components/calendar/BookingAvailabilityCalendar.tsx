import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon,
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users
} from 'lucide-react';
import { availabilityService, type AvailabilityCheck } from '../../../services/availabilityService';
import { cn } from '../../../utils/cn';

interface BookingAvailabilityCalendarProps {
  vendorId?: string;
  serviceId?: string;  // NEW: For service-specific availability
  selectedDate?: string;
  onDateSelect?: (date: string, availability: AvailabilityCheck) => void;
  minDate?: string;
  className?: string;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isPast: boolean;
  availability?: AvailabilityCheck;
}

export const BookingAvailabilityCalendar: React.FC<BookingAvailabilityCalendarProps> = ({
  vendorId,
  serviceId,  // NEW: Accept serviceId prop
  selectedDate,
  onDateSelect,
  minDate,
  className
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState<Map<string, AvailabilityCheck>>(new Map());
  const [loading, setLoading] = useState(false);
  const [loadingDebounceTimer, setLoadingDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Load availability data for the current month with debouncing
  useEffect(() => {
    if (vendorId) {
      // Clear any existing timer
      if (loadingDebounceTimer) {
        clearTimeout(loadingDebounceTimer);
      }
      
      // Set a new debounced timer
      const timer = setTimeout(() => {
        loadAvailabilityData();
      }, 150); // 150ms debounce
      
      setLoadingDebounceTimer(timer);
      
      // Cleanup function
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [vendorId, currentDate]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (loadingDebounceTimer) {
        clearTimeout(loadingDebounceTimer);
      }
    };
  }, []);

  const loadAvailabilityData = async () => {
    if (!vendorId) return;
    
    setLoading(true);
    try {
      // Calculate the full 6-week calendar range (42 days) to match what's displayed
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const calendarStartDate = new Date(firstDay);
      calendarStartDate.setDate(calendarStartDate.getDate() - firstDay.getDay()); // Start from Sunday
      
      const calendarEndDate = new Date(calendarStartDate);
      calendarEndDate.setDate(calendarEndDate.getDate() + 41); // 42 days total (6 weeks)
      
      const startStr = calendarStartDate.toISOString().split('T')[0];
      const endStr = calendarEndDate.toISOString().split('T')[0];
      
      console.log('📅 [BookingCalendar] Loading availability for:', { vendorId, serviceId, startStr, endStr });
      
      // 🔍 DEBUG: Log what we're passing to the service
      console.log('🔍 [BookingCalendar] Calling checkAvailabilityRange with:', {
        vendorId,
        serviceId,
        startStr,
        endStr,
        'service filtering': serviceId ? 'ENABLED - only showing bookings for this service' : 'DISABLED - showing all vendor bookings'
      });
      
      const availabilityMap = await availabilityService.checkAvailabilityRange(vendorId, startStr, endStr, serviceId);
      setAvailabilityData(availabilityMap);
      
      console.log('✅ [BookingCalendar] Loaded availability for', availabilityMap.size, 'dates');
      
      // 🔍 DEBUG: Log unavailable dates
      const unavailableDates = Array.from(availabilityMap.entries())
        .filter(([date, availability]) => !availability.isAvailable)
        .map(([date, availability]) => ({ 
          date, 
          reason: availability.reason,
          bookings: availability.currentBookings 
        }));
      
      if (unavailableDates.length > 0) {
        console.log('🔴 [BookingCalendar] Unavailable dates found:', unavailableDates);
      } else {
        console.log('⚠️ [BookingCalendar] NO unavailable dates found - all dates showing as available!');
      }
    } catch (error) {
      console.error('❌ [BookingCalendar] Error loading availability:', error);
      // Set empty map on error to prevent crashes
      setAvailabilityData(new Map());
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const minDateObj = minDate ? new Date(minDate) : today;
    
    // Get first day of month and calculate calendar start
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days: CalendarDay[] = [];
    const currentDateIter = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDateIter.toISOString().split('T')[0];
      const isCurrentMonth = currentDateIter.getMonth() === month;
      const isToday = currentDateIter.toDateString() === today.toDateString();
      const isSelected = dateStr === selectedDate;
      const isPast = currentDateIter < minDateObj;
      
      days.push({
        date: dateStr,
        day: currentDateIter.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isPast,
        availability: availabilityData.get(dateStr)
      });
      
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }
    
    return days;
  }, [currentDate, selectedDate, minDate, availabilityData]);

  const getDateStatus = (day: CalendarDay) => {
    if (day.isPast) {
      return {
        status: 'past',
        color: 'bg-gray-100 text-gray-400 cursor-not-allowed',
        icon: XCircle,
        label: 'Past Date'
      };
    }
    
    if (!day.availability) {
      return {
        status: 'loading',
        color: 'bg-gray-50 text-gray-500',
        icon: Clock,
        label: 'Loading...'
      };
    }
    
    if (!day.availability.isAvailable) {
      return {
        status: 'unavailable',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        label: day.availability.reason || 'Unavailable'
      };
    }
    
    if (day.availability.currentBookings && day.availability.currentBookings > 0) {
      return {
        status: 'partial',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Users,
        label: `${day.availability.currentBookings}/${day.availability.maxBookingsPerDay || 1} booked`
      };
    }
    
    return {
      status: 'available',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle,
      label: 'Available'
    };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.isPast || !day.isCurrentMonth) return;
    
    // If availability data exists but the date is unavailable, don't allow selection
    if (day.availability && !day.availability.isAvailable) return;
    
    // If no availability data yet, treat as available and allow selection
    const availability: AvailabilityCheck = day.availability || {
      date: day.date,
      vendorId: vendorId || '',
      isAvailable: true,
      currentBookings: 0,
      maxBookingsPerDay: 1,
      reason: undefined,
      bookingStatus: 'available' as const
    };
    
    if (onDateSelect) {
      onDateSelect(day.date, availability);
    }
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Select Event Date
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
              {monthYear}
            </span>
            
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span className="text-gray-600">Partially Booked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-gray-600">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const status = getDateStatus(day);
            const IconComponent = status.icon;
            
            return (
              <motion.button
                key={`${day.date}-${index}`}
                type="button"
                onClick={() => handleDateClick(day)}
                disabled={day.isPast || !day.isCurrentMonth || (day.availability && !day.availability.isAvailable)}
                whileHover={
                  day.isCurrentMonth && !day.isPast && (!day.availability || day.availability.isAvailable)
                    ? { scale: 1.05 }
                    : {}
                }
                whileTap={
                  day.isCurrentMonth && !day.isPast && (!day.availability || day.availability.isAvailable)
                    ? { scale: 0.95 }
                    : {}
                }
                className={cn(
                  "relative p-2 rounded-lg border transition-all duration-200 min-h-[50px] group",
                  day.isCurrentMonth ? "opacity-100" : "opacity-30",
                  day.isSelected ? "ring-2 ring-blue-500 ring-offset-1" : "",
                  day.isToday ? "border-blue-300" : "border-transparent",
                  status.color,
                  day.isCurrentMonth && !day.isPast && (!day.availability || day.availability.isAvailable)
                    ? "cursor-pointer hover:shadow-md"
                    : "cursor-not-allowed"
                )}
                title={day.availability ? status.label : undefined}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-sm font-medium mb-1">{day.day}</div>
                  {day.availability && (
                    <IconComponent className="w-3 h-3" />
                  )}
                </div>
                
                {/* Selection indicator */}
                {day.isSelected && (
                  <div className="absolute inset-0 bg-blue-500/20 rounded-lg"></div>
                )}
                
                {/* Today indicator */}
                {day.isToday && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading availability...</span>
          </div>
        </div>
      )}
      
      {/* Selected date info */}
      {selectedDate && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Selected Date:</span>{' '}
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
};
