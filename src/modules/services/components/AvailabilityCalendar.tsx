import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X, Check } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface AvailabilityCalendarProps {
  vendorId: string;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  minDate?: Date;
  bookedDates?: string[]; // Optional pre-loaded booked dates
}

interface BookedDate {
  date: string;
  bookingCount: number;
  status: 'available' | 'booked' | 'fully_booked';
}

export function AvailabilityCalendar({
  vendorId,
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  bookedDates = []
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loadedBookedDates, setLoadedBookedDates] = useState<Map<string, BookedDate>>(new Map());
  const [loading, setLoading] = useState(false);

  // Fetch booked dates for the current month
  useEffect(() => {
    fetchBookedDatesForMonth(currentMonth);
  }, [currentMonth, vendorId]);

  const fetchBookedDatesForMonth = async (month: Date) => {
    setLoading(true);
    try {
      const year = month.getFullYear();
      const monthNum = month.getMonth() + 1;
      
      console.log('📅 [AvailabilityCalendar] Fetching bookings for vendor:', vendorId, 'month:', monthNum, 'year:', year);
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const response = await fetch(`${API_URL}/api/bookings/vendor/${vendorId}`);
      
      if (!response.ok) {
        console.warn('⚠️ [AvailabilityCalendar] Failed to fetch bookings:', response.status);
        return;
      }
      
      const data = await response.json();
      const bookings = data.bookings || [];
      
      console.log('✅ [AvailabilityCalendar] Fetched', bookings.length, 'bookings');
      
      // Group bookings by date
      const dateMap = new Map<string, BookedDate>();
      
      bookings.forEach((booking: any) => {
        if (!booking.event_date) return;
        
        const bookingDate = booking.event_date.split('T')[0]; // Get YYYY-MM-DD
        const bookingMonth = new Date(bookingDate);
        
        // Only include bookings from the current month view
        if (bookingMonth.getMonth() === month.getMonth() && 
            bookingMonth.getFullYear() === month.getFullYear()) {
          
          const existing = dateMap.get(bookingDate);
          
          if (existing) {
            existing.bookingCount++;
            // If we have more than 1 booking, mark as fully booked
            if (existing.bookingCount >= 1) {
              existing.status = 'fully_booked';
            }
          } else {
            dateMap.set(bookingDate, {
              date: bookingDate,
              bookingCount: 1,
              status: 'booked'
            });
          }
        }
      });
      
      console.log('📊 [AvailabilityCalendar] Processed', dateMap.size, 'unique dates with bookings');
      setLoadedBookedDates(dateMap);
      
    } catch (error) {
      console.error('❌ [AvailabilityCalendar] Error fetching booked dates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Array<{ date: Date | null; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isBooked: boolean; isFullyBooked: boolean; bookingCount: number }> = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false, isToday: false, isSelected: false, isBooked: false, isFullyBooked: false, bookingCount: 0 });
    }
    
    // Add days of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selected = selectedDate ? new Date(selectedDate) : null;
    if (selected) selected.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = formatDateToYYYYMMDD(date);
      const bookedInfo = loadedBookedDates.get(dateStr);
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isSelected: selected ? date.getTime() === selected.getTime() : false,
        isBooked: !!bookedInfo,
        isFullyBooked: bookedInfo?.status === 'fully_booked',
        bookingCount: bookedInfo?.bookingCount || 0
      });
    }
    
    return days;
  }, [currentMonth, selectedDate, loadedBookedDates]);

  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatDateToYYYYMMDD(date);
    const bookedInfo = loadedBookedDates.get(dateStr);
    
    // Prevent selecting fully booked dates
    if (bookedInfo?.status === 'fully_booked') {
      console.log('❌ [AvailabilityCalendar] Date is fully booked:', dateStr);
      return;
    }
    
    // Prevent selecting past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      console.log('❌ [AvailabilityCalendar] Cannot select past date:', dateStr);
      return;
    }
    
    onDateSelect(dateStr);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-pink-600" />
          <h3 className="text-lg font-bold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>
        
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">Loading availability...</p>
        </div>
      )}

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (!day.date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isPast = day.date < minDate;
          const isDisabled = isPast || day.isFullyBooked;
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => !isDisabled && handleDateClick(day.date!)}
              disabled={isDisabled}
              className={cn(
                'aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-200 relative',
                'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2',
                // Base styles
                'text-sm font-medium',
                // Selected state
                day.isSelected && !isDisabled && 'bg-gradient-to-br from-pink-600 to-rose-600 text-white shadow-lg scale-105 ring-2 ring-pink-400',
                // Today state (not selected)
                day.isToday && !day.isSelected && !isDisabled && 'ring-2 ring-pink-300 bg-pink-50 text-pink-700',
                // Booked but available
                day.isBooked && !day.isFullyBooked && !day.isSelected && !isDisabled && 'bg-yellow-50 text-yellow-700 border-2 border-yellow-200',
                // Fully booked
                day.isFullyBooked && 'bg-red-50 text-red-400 border-2 border-red-200 cursor-not-allowed',
                // Past dates
                isPast && !day.isFullyBooked && 'bg-gray-50 text-gray-400 cursor-not-allowed',
                // Available dates
                !day.isSelected && !day.isBooked && !isPast && 'bg-gray-50 text-gray-700 hover:bg-pink-100 hover:text-pink-700 hover:scale-105 hover:shadow-md'
              )}
              aria-label={`Select ${day.date.toLocaleDateString()}`}
            >
              <span className="text-base">{day.date.getDate()}</span>
              
              {/* Booking indicator */}
              {day.isBooked && !day.isSelected && (
                <span className={cn(
                  'absolute bottom-1 w-1.5 h-1.5 rounded-full',
                  day.isFullyBooked ? 'bg-red-500' : 'bg-yellow-500'
                )} />
              )}
              
              {/* Selected checkmark */}
              {day.isSelected && (
                <Check className="absolute top-1 right-1 h-3 w-3 text-white" />
              )}
              
              {/* Fully booked X mark */}
              {day.isFullyBooked && (
                <X className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Legend:</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
            <span className="text-gray-600">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-yellow-50 border-2 border-yellow-200 relative">
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-yellow-500" />
            </div>
            <span className="text-gray-600">Has Booking</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-red-50 border-2 border-red-200 flex items-center justify-center">
              <X className="h-4 w-4 text-red-400" />
            </div>
            <span className="text-gray-600">Fully Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg ring-2 ring-pink-300 bg-pink-50" />
            <span className="text-gray-600">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
