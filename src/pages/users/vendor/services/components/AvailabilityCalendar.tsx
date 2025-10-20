import React, { useState, useEffect } from 'react';
import { Calendar, X, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface OffDay {
  id: number;
  off_date: string;
  reason?: string;
}

interface AvailabilityCalendarProps {
  vendorId: number;
  onClose: () => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ vendorId, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [offDays, setOffDays] = useState<OffDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchOffDays();
  }, [vendorId]);

  const fetchOffDays = async () => {
    try {
      const response = await fetch(`https://weddingbazaar-web.onrender.com/api/vendors/${vendorId}/off-days`);
      const data = await response.json();
      if (data.success) {
        setOffDays(data.offDays || []);
      }
    } catch (error) {
      console.error('Error fetching off-days:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDateBlocked = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return offDays.some(offDay => offDay.off_date === dateStr);
  };

  const toggleDate = async (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const existingOffDay = offDays.find(offDay => offDay.off_date === dateStr);

    if (existingOffDay) {
      // Remove off-day
      try {
        const response = await fetch(
          `https://weddingbazaar-web.onrender.com/api/vendors/${vendorId}/off-days/${existingOffDay.id}`,
          { method: 'DELETE' }
        );
        if (response.ok) {
          setOffDays(offDays.filter(od => od.id !== existingOffDay.id));
        }
      } catch (error) {
        console.error('Error removing off-day:', error);
      }
    } else {
      // Show reason input
      setSelectedDate(dateStr);
    }
  };

  const addOffDay = async () => {
    if (!selectedDate) return;

    try {
      const response = await fetch(
        `https://weddingbazaar-web.onrender.com/api/vendors/${vendorId}/off-days`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            off_date: selectedDate,
            reason: reason || 'Unavailable'
          })
        }
      );
      const data = await response.json();
      if (data.success) {
        setOffDays([...offDays, data.offDay]);
        setSelectedDate(null);
        setReason('');
      }
    } catch (error) {
      console.error('Error adding off-day:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Manage Availability</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close calendar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading calendar...</p>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>How to use:</strong> Click on any date to mark it as unavailable (red). 
                  Click again to mark it as available (green). Blocked dates will not be bookable by clients.
                </p>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h3 className="text-xl font-semibold text-gray-900">{monthName}</h3>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {days.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const isBlocked = isDateBlocked(date);
                  const isPast = date < today;
                  const isToday = date.getTime() === today.getTime();

                  return (
                    <button
                      key={index}
                      onClick={() => !isPast && toggleDate(date)}
                      disabled={isPast}
                      className={`
                        aspect-square rounded-lg text-sm font-medium transition-all
                        ${isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                        ${!isPast && !isBlocked ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-300' : ''}
                        ${!isPast && isBlocked ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-300' : ''}
                        ${isToday ? 'ring-2 ring-blue-500' : ''}
                      `}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span>{date.getDate()}</span>
                        {!isPast && (
                          <span className="text-xs mt-1">
                            {isBlocked ? '❌' : '✅'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 justify-center mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-50 border border-green-300 rounded"></div>
                  <span className="text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-50 border border-red-300 rounded"></div>
                  <span className="text-gray-700">Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 rounded"></div>
                  <span className="text-gray-700">Past</span>
                </div>
              </div>

              {/* Reason Input Modal */}
              {selectedDate && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl border border-pink-200 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Block Date: {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason (optional, e.g., 'Vacation', 'Already booked')"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={addOffDay}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Block Date
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDate(null);
                          setReason('');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Blocked Dates List */}
              {offDays.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Your Blocked Dates ({offDays.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {offDays.map(offDay => (
                      <div
                        key={offDay.id}
                        className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(offDay.off_date + 'T00:00:00').toLocaleDateString('default', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          {offDay.reason && (
                            <div className="text-sm text-gray-600">{offDay.reason}</div>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(
                                `https://weddingbazaar-web.onrender.com/api/vendors/${vendorId}/off-days/${offDay.id}`,
                                { method: 'DELETE' }
                              );
                              if (response.ok) {
                                setOffDays(offDays.filter(od => od.id !== offDay.id));
                              }
                            } catch (error) {
                              console.error('Error removing off-day:', error);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          aria-label="Remove blocked date"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t flex justify-end">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-6 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
