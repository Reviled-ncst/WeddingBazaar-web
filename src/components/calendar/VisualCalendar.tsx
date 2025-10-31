/**
 * Visual Calendar Component with Availability Display
 * Shows booked dates in red, available dates in green
 * Integrates with availabilityService for real-time booking data
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
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
    if (day.isDisabled) {
      if (day.isPast) {
        alert('❌ Past dates cannot be selected');
      }
      return;
    }
    
    // Check if date is unavailable
    if (day.availability && !day.availability.isAvailable) {
      const reason = day.availability.reason || 'This date is not available';
      alert(`❌ ${reason}\n\nPlease select a different date.`);
      return;
    }

    console.log('✅ [VisualCalendar] Date selected:', day.date);
    onDateSelect(day.date);
  }, [onDateSelect]);

  // Get CSS classes for a day cell
  const getDayClasses = useCallback((day: CalendarDay): string => {
    const baseClasses = "relative flex flex-col items-center justify-center h-11 sm:h-12 rounded-lg cursor-pointer transition-all duration-200 group";
    
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

  // Get user-friendly tooltip text
  const getTooltipText = useCallback((day: CalendarDay): string => {
    if (day.isPast) {
      return 'Past date - cannot be selected';
    }
    
    if (!day.isCurrentMonth) {
      return 'Select a date from current month';
    }

    if (day.isSelected) {
      return `Selected: ${formatDateForDisplay(day.date)}`;
    }

    if (day.isToday) {
      return 'Today - Available for booking';
    }

    if (day.availability) {
      if (!day.availability.isAvailable) {
        return day.availability.reason || 'This date is not available';
      }
      
      if (day.availability.bookingStatus === 'booked') {
        return 'Available (pending booking exists)';
      }
      
      return 'Available for booking - Click to select';
    }

    return 'Click to select this date';
  }, []);

  // Get availability icon for a day
  const getAvailabilityIcon = useCallback((day: CalendarDay) => {
    if (!day.availability || !day.isCurrentMonth) return null;

    if (!day.availability.isAvailable) {
      return (
        <div className="absolute top-1 right-1" title="Not available">
          <XCircle className="h-4 w-4 text-red-500" />
        </div>
      );
    }

    if (day.availability.bookingStatus === 'booked') {
      return (
        <div className="absolute top-1 right-1" title="Pending booking">
          <Clock className="h-4 w-4 text-yellow-500" />
        </div>
      );
    }

    return (
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Available">
        <CheckCircle className="h-4 w-4 text-green-500" />
      </div>
    );
  }, []);

  return (
    <div className={cn("bg-white rounded-xl shadow-lg p-3 border border-gray-200", className)}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2.5 border border-blue-200">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-6 w-6 text-blue-600" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-800">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs font-medium"
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
        <div className="mb-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-blue-700 font-medium">Loading...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="text-red-700 font-medium">Unable to load availability</span>
          </div>
          <p className="text-xs text-red-600 mt-1 ml-6">All dates are shown as available. Please check with the vendor to confirm.</p>
        </div>
      )}

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Compact spacing */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => (
          <button
            key={`${day.date}-${index}`}
            onClick={() => handleDateClick(day)}
            className={getDayClasses(day)}
            disabled={day.isDisabled || (day.availability && !day.availability.isAvailable)}
            title={getTooltipText(day)}
          >
            {getAvailabilityIcon(day)}
            <span className={cn(
              "text-sm font-semibold",
              day.isSelected && "text-white",
              !day.isSelected && day.isCurrentMonth && "text-gray-800",
              !day.isSelected && !day.isCurrentMonth && "text-gray-400"
            )}>
              {day.dayOfMonth}
            </span>
            {day.isToday && !day.isSelected && (
              <span className="text-[10px] text-purple-600 font-medium">Today</span>
            )}
          </button>
        ))}
      </div>

      {/* Legend - Compact */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-white border-2 border-green-400 rounded"></div>
            <span className="text-xs text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-red-50 border-2 border-red-200 rounded"></div>
            <span className="text-xs text-gray-600">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded shadow"></div>
            <span className="text-xs text-gray-600">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400 rounded"></div>
            <span className="text-xs text-gray-600">Today</span>
          </div>
        </div>
      </div>

      {/* Selected Date Display - Compact */}
      {selectedDate && (
        <div className="mt-3 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600">Selected:</p>
          <p className="text-sm font-bold text-blue-700">{formatDateForDisplay(selectedDate)}</p>
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
