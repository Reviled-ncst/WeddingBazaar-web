import React from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { VendorAvailabilityCalendar } from '../../../../shared/components/calendar/VendorAvailabilityCalendar';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { 
  Calendar as CalendarIcon,
  Clock,
  Ban,
  Info,
  AlertTriangle
} from 'lucide-react';

export const VendorAvailability: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Availability Calendar</h1>
              <p className="text-gray-600 mt-1">
                Manage your availability and set off days to control when customers can book your services
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Days</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booked Days</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Ban className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Off Days Set</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">How to Set Off Days</h3>
                <div className="text-blue-800 space-y-2">
                  <p>• <strong>Click any available (green) date</strong> to instantly mark it as an off day</p>
                  <p>• <strong>Click any off day (red) date</strong> to remove it and make yourself available again</p>
                  <p>• Use the <strong>"+" button</strong> for advanced settings like custom reasons and recurring patterns</p>
                  <p>• Off days prevent customers from booking your services on those dates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Mode Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-amber-800">
                  <strong>Demo Mode:</strong> Off days are currently stored in your browser. 
                  Full backend integration coming soon for permanent storage across all devices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Component */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <VendorAvailabilityCalendar 
            vendorId={user?.vendorId || user?.id}
            className="w-full"
          />
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability Management Tips</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">✅ Best Practices</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Set off days well in advance for holidays</li>
                <li>• Use custom reasons for better client communication</li>
                <li>• Review your calendar weekly</li>
                <li>• Consider seasonal availability patterns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🎯 Common Use Cases</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Personal holidays and family time</li>
                <li>• Equipment maintenance days</li>
                <li>• Other wedding commitments</li>
                <li>• Business vacation periods</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAvailability;
