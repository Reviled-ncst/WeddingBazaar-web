import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react';
import { bookingAvailabilityService } from '../../../services/bookingAvailabilityService';

interface PublicBookingCalendarProps {
  vendorId: string;
  serviceId?: string;
  className?: string;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: 'available' | 'partially_booked' | 'fully_booked' | 'off_day';
  bookingCount: number;
}

export const PublicBookingCalendar: React.FC<PublicBookingCalendarProps> = ({
  vendorId,
  serviceId,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate, vendorId, serviceId]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // Get first and last day of current month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Get start of calendar (including previous month days)
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      
      // Get end of calendar (including next month days)
      const endDate = new Date(lastDay);
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      console.log('📅 [PublicCalendar] Loading bookings:', {
        vendorId,
        serviceId,
        startStr,
        endStr
      });
      
      // Fetch booking data using the service
      const calendarData = await bookingAvailabilityService.getVendorCalendarView(
        vendorId,
        startStr,
        endStr
      );
      
      console.log('📊 [PublicCalendar] Received calendar data:', calendarData);
      
      // Generate calendar days
      const days: CalendarDay[] = [];
      const currentDateObj = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      while (currentDateObj <= endDate) {
        const dateStr = currentDateObj.toISOString().split('T')[0];
        const calendarView = calendarData.find(d => d.date === dateStr);
        
        days.push({
          date: dateStr,
          day: currentDateObj.getDate(),
          isCurrentMonth: currentDateObj.getMonth() === month,
          isToday: currentDateObj.getTime() === today.getTime(),
          status: calendarView?.status || 'available',
          bookingCount: calendarView?.bookingCount || 0
        });
        
        currentDateObj.setDate(currentDateObj.getDate() + 1);
      }
      
      setCalendarDays(days);
    } catch (error) {
      console.error('❌ [PublicCalendar] Error loading calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`bg-white rounded-lg ${className}`}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          type="button"
          aria-label="Previous month"
          title="Previous month"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          type="button"
          aria-label="Next month"
          title="Next month"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          Loading calendar...
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const isBooked = day.status === 'fully_booked' || day.status === 'partially_booked' || day.status === 'off_day';
            const isAvailable = day.status === 'available';
            
            return (
              <div
                key={index}
                className={`
                  relative aspect-square flex items-center justify-center rounded-lg text-sm
                  ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                  ${day.isToday ? 'ring-2 ring-rose-500' : ''}
                  ${isBooked
                    ? 'bg-red-100 border-2 border-red-400' 
                    : 'bg-green-100 border-2 border-green-400'
                  }
                `}
              >
                <span className="font-medium">{day.day}</span>
                
                {/* Availability Icon */}
                <div className="absolute bottom-1 right-1">
                  {isBooked ? (
                    <X size={12} className="text-red-600" />
                  ) : (
                    <CheckCircle size={12} className="text-green-600" />
                  )}
                </div>
                
                {/* Booking Count Badge */}
                {day.bookingCount > 0 && (
                  <div className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {day.bookingCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
