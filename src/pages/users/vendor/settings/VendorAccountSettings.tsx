import React, { useState } from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { 
  Settings, 
  Bell, 
  Mail, 
  Smartphone, 
  Globe,
  Calendar,
  Users,
  CreditCard,
  Shield,
  Eye,
  Save,
  RefreshCw
} from 'lucide-react';

interface NotificationSettings {
  emailNotifications: {
    newBookings: boolean;
    messages: boolean;
    reviews: boolean;
    payments: boolean;
    marketing: boolean;
  };
  pushNotifications: {
    newBookings: boolean;
    messages: boolean;
    reviews: boolean;
    urgentAlerts: boolean;
  };
  smsNotifications: {
    bookingReminders: boolean;
    urgentAlerts: boolean;
  };
}

interface BusinessSettings {
  autoReply: boolean;
  instantBooking: boolean;
  weekendAvailability: boolean;
  holidayMode: boolean;
  publicProfile: boolean;
  showPricing: boolean;
  allowReviews: boolean;
  marketingEmails: boolean;
}

export const VendorAccountSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'business' | 'privacy'>('notifications');
  const [isLoading, setIsLoading] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: {
      newBookings: true,
      messages: true,
      reviews: true,
      payments: true,
      marketing: false
    },
    pushNotifications: {
      newBookings: true,
      messages: true,
      reviews: false,
      urgentAlerts: true
    },
    smsNotifications: {
      bookingReminders: true,
      urgentAlerts: true
    }
  });

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    autoReply: true,
    instantBooking: false,
    weekendAvailability: true,
    holidayMode: false,
    publicProfile: true,
    showPricing: true,
    allowReviews: true,
    marketingEmails: false
  });

  const handleNotificationChange = (category: keyof NotificationSettings, setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleBusinessChange = (setting: keyof BusinessSettings, value: boolean) => {
    setBusinessSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    // Show success message
  };

  const NotificationToggle: React.FC<{
    label: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    icon: React.ReactNode;
  }> = ({ label, description, checked, onChange, icon }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
        <div>
          <div className="font-medium text-gray-900">{label}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
          aria-label={label}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <VendorHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Account Settings
                  </h1>
                  <p className="text-gray-600">Manage your account preferences and settings</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'notifications'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'business'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Business Settings
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'privacy'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Privacy & Visibility
            </button>
          </div>
        </div>

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Mail className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                  <p className="text-gray-600">Configure what emails you want to receive</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <NotificationToggle
                  label="New Bookings"
                  description="Get notified when you receive new booking requests"
                  checked={notificationSettings.emailNotifications.newBookings}
                  onChange={(value) => handleNotificationChange('emailNotifications', 'newBookings', value)}
                  icon={<Calendar className="h-5 w-5 text-blue-600" />}
                />
                
                <NotificationToggle
                  label="Messages"
                  description="Receive emails for new client messages"
                  checked={notificationSettings.emailNotifications.messages}
                  onChange={(value) => handleNotificationChange('emailNotifications', 'messages', value)}
                  icon={<Mail className="h-5 w-5 text-green-600" />}
                />
                
                <NotificationToggle
                  label="Reviews"
                  description="Get notified about new reviews and ratings"
                  checked={notificationSettings.emailNotifications.reviews}
                  onChange={(value) => handleNotificationChange('emailNotifications', 'reviews', value)}
                  icon={<Users className="h-5 w-5 text-yellow-600" />}
                />
                
                <NotificationToggle
                  label="Payments"
                  description="Receive payment confirmations and updates"
                  checked={notificationSettings.emailNotifications.payments}
                  onChange={(value) => handleNotificationChange('emailNotifications', 'payments', value)}
                  icon={<CreditCard className="h-5 w-5 text-purple-600" />}
                />
                
                <NotificationToggle
                  label="Marketing"
                  description="Promotional emails and platform updates"
                  checked={notificationSettings.emailNotifications.marketing}
                  onChange={(value) => handleNotificationChange('emailNotifications', 'marketing', value)}
                  icon={<Globe className="h-5 w-5 text-indigo-600" />}
                />
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
                  <p className="text-gray-600">Instant notifications on your device</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <NotificationToggle
                  label="New Bookings"
                  description="Instant alerts for booking requests"
                  checked={notificationSettings.pushNotifications.newBookings}
                  onChange={(value) => handleNotificationChange('pushNotifications', 'newBookings', value)}
                  icon={<Calendar className="h-5 w-5 text-blue-600" />}
                />
                
                <NotificationToggle
                  label="Messages"
                  description="Real-time message notifications"
                  checked={notificationSettings.pushNotifications.messages}
                  onChange={(value) => handleNotificationChange('pushNotifications', 'messages', value)}
                  icon={<Mail className="h-5 w-5 text-green-600" />}
                />
                
                <NotificationToggle
                  label="Reviews"
                  description="New review alerts"
                  checked={notificationSettings.pushNotifications.reviews}
                  onChange={(value) => handleNotificationChange('pushNotifications', 'reviews', value)}
                  icon={<Users className="h-5 w-5 text-yellow-600" />}
                />
                
                <NotificationToggle
                  label="Urgent Alerts"
                  description="Critical notifications and system alerts"
                  checked={notificationSettings.pushNotifications.urgentAlerts}
                  onChange={(value) => handleNotificationChange('pushNotifications', 'urgentAlerts', value)}
                  icon={<Shield className="h-5 w-5 text-red-600" />}
                />
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">SMS Notifications</h3>
                  <p className="text-gray-600">Text message alerts for important events</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <NotificationToggle
                  label="Booking Reminders"
                  description="SMS reminders for upcoming bookings"
                  checked={notificationSettings.smsNotifications.bookingReminders}
                  onChange={(value) => handleNotificationChange('smsNotifications', 'bookingReminders', value)}
                  icon={<Calendar className="h-5 w-5 text-blue-600" />}
                />
                
                <NotificationToggle
                  label="Urgent Alerts"
                  description="Critical alerts via SMS"
                  checked={notificationSettings.smsNotifications.urgentAlerts}
                  onChange={(value) => handleNotificationChange('smsNotifications', 'urgentAlerts', value)}
                  icon={<Shield className="h-5 w-5 text-red-600" />}
                />
              </div>
            </div>
          </div>
        )}

        {/* Business Settings Tab */}
        {activeTab === 'business' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Operations</h3>
                <div className="space-y-4">
                  <NotificationToggle
                    label="Auto-Reply Messages"
                    description="Automatically respond to new inquiries with a preset message"
                    checked={businessSettings.autoReply}
                    onChange={(value) => handleBusinessChange('autoReply', value)}
                    icon={<Mail className="h-5 w-5 text-blue-600" />}
                  />
                  
                  <NotificationToggle
                    label="Instant Booking"
                    description="Allow clients to book directly without approval"
                    checked={businessSettings.instantBooking}
                    onChange={(value) => handleBusinessChange('instantBooking', value)}
                    icon={<Calendar className="h-5 w-5 text-green-600" />}
                  />
                  
                  <NotificationToggle
                    label="Weekend Availability"
                    description="Accept bookings and messages on weekends"
                    checked={businessSettings.weekendAvailability}
                    onChange={(value) => handleBusinessChange('weekendAvailability', value)}
                    icon={<Calendar className="h-5 w-5 text-purple-600" />}
                  />
                  
                  <NotificationToggle
                    label="Holiday Mode"
                    description="Temporarily pause new bookings and hide availability"
                    checked={businessSettings.holidayMode}
                    onChange={(value) => handleBusinessChange('holidayMode', value)}
                    icon={<Globe className="h-5 w-5 text-orange-600" />}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Visibility</h3>
                <div className="space-y-4">
                  <NotificationToggle
                    label="Public Profile"
                    description="Make your business profile visible to everyone"
                    checked={businessSettings.publicProfile}
                    onChange={(value) => handleBusinessChange('publicProfile', value)}
                    icon={<Eye className="h-5 w-5 text-blue-600" />}
                  />
                  
                  <NotificationToggle
                    label="Show Pricing"
                    description="Display your service prices on your profile"
                    checked={businessSettings.showPricing}
                    onChange={(value) => handleBusinessChange('showPricing', value)}
                    icon={<CreditCard className="h-5 w-5 text-green-600" />}
                  />
                  
                  <NotificationToggle
                    label="Allow Reviews"
                    description="Let clients leave reviews and ratings"
                    checked={businessSettings.allowReviews}
                    onChange={(value) => handleBusinessChange('allowReviews', value)}
                    icon={<Users className="h-5 w-5 text-yellow-600" />}
                  />
                  
                  <NotificationToggle
                    label="Marketing Communications"
                    description="Receive updates about new features and opportunities"
                    checked={businessSettings.marketingEmails}
                    onChange={(value) => handleBusinessChange('marketingEmails', value)}
                    icon={<Mail className="h-5 w-5 text-purple-600" />}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
