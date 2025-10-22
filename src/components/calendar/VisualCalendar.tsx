/**
 * Visual Calendar Component with Availability Display
 * Shows booked dates in red, available dates in green
 * Integrates with availabilityService for real-time booking data
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { availabilityService, type AvailabilityCheck } from '../../services/availabilityService';
import { cn } from '../../utils/cn';

interface VisualCalendarProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  vendorId: string;
  minDate?: string; // YYYY-MM-DD format
  maxDate?: string; // YYYY-MM-DD format
  className?: string;
}

interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  availability?: AvailabilityCheck;
  isPast: boolean;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const VisualCalendar: React.FC<VisualCalendarProps> = ({
  selectedDate,
  onDateSelect,
  vendorId,
  minDate,
  maxDate,
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [availabilityData, setAvailabilityData] = useState<Map<string, AvailabilityCheck>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get first and last day of current month
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  }, [currentMonth]);

  const lastDayOfMonth = useMemo(() => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  }, [currentMonth]);

  // Calculate calendar grid (includes days from previous/next month)
  const calendarDays = useMemo((): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get day of week for first day (0 = Sunday)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(prevMonthLastDay);
      date.setDate(prevMonthLastDay.getDate() - i);
      const dateStr = formatDateToYYYYMMDD(date);
      
      days.push({
        date: dateStr,
        dayOfMonth: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        isSelected: dateStr === selectedDate,
        isDisabled: true,
        isPast: date < today,
        availability: availabilityData.get(dateStr)
      });
    }

    // Add days of current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = formatDateToYYYYMMDD(date);
      const isPast = date < today;
      const isBeforeMin = minDate && dateStr < minDate;
      const isAfterMax = maxDate && dateStr > maxDate;
      
      days.push({
        date: dateStr,
        dayOfMonth: day,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isSelected: dateStr === selectedDate,
        isDisabled: isPast || !!isBeforeMin || !!isAfterMax,
        isPast,
        availability: availabilityData.get(dateStr)
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
      const dateStr = formatDateToYYYYMMDD(date);
      
      days.push({
        date: dateStr,
        dayOfMonth: day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: dateStr === selectedDate,
        isDisabled: true,
        isPast: false,
        availability: availabilityData.get(dateStr)
      });
    }

    return days;
  }, [currentMonth, selectedDate, availabilityData, minDate, maxDate, firstDayOfMonth, lastDayOfMonth]);

  // Fetch availability data for visible month
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!vendorId) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('📅 [VisualCalendar] Fetching availability for month:', formatMonth(currentMonth));
        
        const startDate = formatDateToYYYYMMDD(firstDayOfMonth);
        const endDate = formatDateToYYYYMMDD(lastDayOfMonth);
        
        const data = await availabilityService.checkAvailabilityRange(vendorId, startDate, endDate);
        
        console.log('✅ [VisualCalendar] Availability data loaded:', data.size, 'days');
        setAvailabilityData(data);
      } catch (err) {
        console.error('❌ [VisualCalendar] Failed to fetch availability:', err);
        setError('Unable to load availability. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [vendorId, currentMonth, firstDayOfMonth, lastDayOfMonth]);

  // Navigation handlers
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  // Date selection handler
  const handleDateClick = useCallback((day: CalendarDay) => {
    if (day.isDisabled) return;
    
    // Check if date is unavailable
    if (day.availability && !day.availability.isAvailable) {
      console.warn('⚠️ [VisualCalendar] Date is not available:', day.date);
      return;
    }

    console.log('✅ [VisualCalendar] Date selected:', day.date);
    onDateSelect(day.date);
  }, [onDateSelect]);

  // Get CSS classes for a day cell
  const getDayClasses = useCallback((day: CalendarDay): string => {
    const baseClasses = "relative flex flex-col items-center justify-center h-16 sm:h-20 rounded-xl cursor-pointer transition-all duration-200 group";
    
    if (day.isDisabled || (day.availability && !day.availability.isAvailable)) {
      // Disabled or unavailable
      return cn(
        baseClasses,
        "cursor-not-allowed opacity-40",
        day.availability && !day.availability.isAvailable 
          ? "bg-red-50 border-2 border-red-200 hover:border-red-300"
          : "bg-gray-50 border border-gray-200"
      );
    }

    if (day.isSelected) {
      // Selected date
      return cn(
        baseClasses,
        "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 border-blue-600 shadow-xl scale-105 z-10"
      );
    }

    if (day.isToday) {
      // Today
      return cn(
        baseClasses,
        "bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400 hover:border-purple-500 hover:shadow-lg"
      );
    }

    if (!day.isCurrentMonth) {
      // Other month
      return cn(
        baseClasses,
        "bg-gray-50/50 border border-gray-100 text-gray-400 opacity-50"
      );
    }

    // Available date
    const hasAvailabilityInfo = day.availability;
    return cn(
      baseClasses,
      "bg-white border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 hover:shadow-lg hover:scale-105",
      hasAvailabilityInfo && day.availability?.isAvailable && "border-green-200 bg-green-50/30"
    );
  }, []);

  // Get availability icon for a day
  const getAvailabilityIcon = useCallback((day: CalendarDay) => {
    if (!day.availability || !day.isCurrentMonth) return null;

    if (!day.availability.isAvailable) {
      return (
        <div className="absolute top-1 right-1">
          <XCircle className="h-4 w-4 text-red-500" />
        </div>
      );
    }

    if (day.availability.bookingStatus === 'booked') {
      return (
        <div className="absolute top-1 right-1">
          <Clock className="h-4 w-4 text-yellow-500" />
        </div>
      );
    }

    return (
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <CheckCircle className="h-4 w-4 text-green-500" />
      </div>
    );
  }, []);

  return (
    <div className={cn("bg-white rounded-2xl shadow-lg p-6 border border-gray-200", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-blue-500" />
          Select Event Date
        </h3>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-6 w-6 text-blue-600" />
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-gray-800">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Today
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-6 w-6 text-blue-600" />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-blue-700 font-medium">Loading availability...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => (
          <button
            key={`${day.date}-${index}`}
            onClick={() => handleDateClick(day)}
            className={getDayClasses(day)}
            disabled={day.isDisabled || (day.availability && !day.availability.isAvailable)}
            title={day.availability?.reason || day.date}
          >
            {getAvailabilityIcon(day)}
            <span className={cn(
              "text-lg font-semibold",
              day.isSelected && "text-white",
              !day.isSelected && day.isCurrentMonth && "text-gray-800",
              !day.isSelected && !day.isCurrentMonth && "text-gray-400"
            )}>
              {day.dayOfMonth}
            </span>
            {day.isToday && !day.isSelected && (
              <span className="text-xs text-purple-600 font-medium mt-0.5">Today</span>
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Legend:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-50 border-2 border-green-200 rounded-lg"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-50 border-2 border-red-200 rounded-lg"></div>
            <span className="text-sm text-gray-600">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"></div>
            <span className="text-sm text-gray-600">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400 rounded-lg"></div>
            <span className="text-sm text-gray-600">Today</span>
          </div>
        </div>
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Selected Date:</p>
          <p className="text-lg font-bold text-blue-700">{formatDateForDisplay(selectedDate)}</p>
        </div>
      )}
    </div>
  );
};

// Helper functions
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMonth(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}
