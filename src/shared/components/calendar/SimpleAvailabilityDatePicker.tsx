import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { availabilityService } from '../../../services/availabilityService';
import { cn } from '../../../utils/cn';

interface SimpleAvailabilityDatePickerProps {
  vendorId: string;
  selectedDate?: string;
  onDateSelect: (date: string, isAvailable: boolean) => void;
  className?: string;
  minDate?: string; // Minimum selectable date
  maxDate?: string; // Maximum selectable date
}

export const SimpleAvailabilityDatePicker: React.FC<SimpleAvailabilityDatePickerProps> = ({
  vendorId,
  selectedDate,
  onDateSelect,
  className,
  minDate,
  maxDate
}) => {
  const [dateValue, setDateValue] = useState(selectedDate || '');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  // Check availability when vendor or date changes
  useEffect(() => {
    if (dateValue && vendorId) {
      checkDateAvailability(dateValue);
    }
  }, [dateValue, vendorId]);

  const checkDateAvailability = async (date: string) => {
    if (!date || !vendorId) return;

    setIsChecking(true);
    try {
      const availabilityCheck = await availabilityService.checkAvailability(vendorId, date);
      setIsAvailable(availabilityCheck.isAvailable);
      
      if (availabilityCheck.isAvailable) {
        setAvailabilityMessage('This date is available for booking!');
      } else {
        setAvailabilityMessage(availabilityCheck.reason || 'This date is not available. Please choose an alternative date.');
      }
      
      // Notify parent component
      onDateSelect(date, availabilityCheck.isAvailable);
    } catch (error) {
      console.warn('Could not check availability:', error);
      setIsAvailable(true); // Default to available if check fails
      setAvailabilityMessage('');
      onDateSelect(date, true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDateValue(newDate);
  };

  // Listen for availability changes from booking events
  useEffect(() => {
    const handleAvailabilityChange = (event: CustomEvent) => {
      const { vendorId: changedVendorId, date } = event.detail;
      if (changedVendorId === vendorId && date === dateValue) {
        console.log('📅 [SimpleAvailabilityDatePicker] Availability changed, rechecking...');
        checkDateAvailability(dateValue);
      }
    };

    const handleBookingChange = (event: CustomEvent) => {
      const { vendorId: changedVendorId, eventDate } = event.detail;
      if (changedVendorId === vendorId && eventDate === dateValue) {
        console.log('🔄 [SimpleAvailabilityDatePicker] Booking changed, rechecking availability...');
        checkDateAvailability(dateValue);
      }
    };

    window.addEventListener('availabilityChanged', handleAvailabilityChange as EventListener);
    window.addEventListener('bookingChanged', handleBookingChange as EventListener);
    
    return () => {
      window.removeEventListener('availabilityChanged', handleAvailabilityChange as EventListener);
      window.removeEventListener('bookingChanged', handleBookingChange as EventListener);
    };
  }, [vendorId, dateValue]);

  if (!vendorId) {
    return (
      <div className={cn("bg-white rounded-2xl shadow-lg border border-gray-200", className)}>
        <div className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vendor Selected</h3>
          <p className="text-gray-600">Please select a vendor to view availability</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-2xl shadow-lg border border-gray-200", className)}>
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-t-2xl border-b border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CalendarIcon className="h-6 w-6 text-rose-500" />
            <h3 className="text-lg font-semibold text-gray-900">Select Event Date</h3>
          </div>
          <p className="text-sm text-gray-600">Choose an available date for your booking</p>
        </div>
      </div>

      <div className="p-6">
        {/* Simple Date Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Event Date *
          </label>
          <input
            type="date"
            value={dateValue}
            onChange={handleDateChange}
            min={minDate || new Date().toISOString().split('T')[0]}
            max={maxDate}
            placeholder="Select event date"
            title="Select event date"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md text-center text-lg"
          />
        </div>

        {/* Availability Status */}
        {dateValue && (
          <div className="space-y-4">
            {isChecking ? (
              <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-800 font-medium">Checking availability...</span>
              </div>
            ) : (
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2",
                isAvailable 
                  ? "bg-green-50 text-green-800 border-green-200" 
                  : "bg-red-50 text-red-800 border-red-200"
              )}>
                {isAvailable ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">
                    {isAvailable ? '✅ Available' : '❌ Not Available'}
                  </p>
                  <p className="text-sm mt-1">{availabilityMessage}</p>
                </div>
              </div>
            )}

            {/* Date Selection Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Selected Date</h4>
              <p className="text-lg text-gray-800">
                {new Date(dateValue).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 text-center">Availability Guide</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Available for booking</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-gray-700">Unavailable/Booked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// For backward compatibility, also export as the original name
export const AvailabilityDatePicker = SimpleAvailabilityDatePicker;
