import React, { useState } from 'react';
import { AdminHeader } from '../../../../shared/components/layout/AdminHeader';
import { 
  Settings, 
  Bell, 
  Palette,
  CreditCard,
  Users,
  ToggleLeft,
  ToggleRight,
  Save,
  RefreshCcw,
  Shield
} from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: any;
}

interface SettingItem {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'textarea';
  value: any;
  options?: string[];
}

export const AdminSettings: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('general');
  const [settings, setSettings] = useState<Record<string, any>>({
    // General Settings
    siteName: 'Wedding Bazaar',
    siteDescription: 'Your perfect wedding marketplace',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true,
    userWelcomeEmails: true,
    
    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    
    // Payment Settings
    stripeEnabled: true,
    paypalEnabled: true,
    commissionRate: 5.5,
    minimumPayout: 50,
    
    // User Settings
    userRegistration: true,
    vendorRegistration: true,
    emailVerification: true,
    profileModeration: true
  });

  const settingSections: SettingSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Basic platform configuration',
      icon: Settings
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Email, SMS, and push notifications',
      icon: Bell
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Authentication and security policies',
      icon: Shield
    },
    {
      id: 'payments',
      title: 'Payment Settings',
      description: 'Payment gateways and commission rates',
      icon: CreditCard
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'User registration and profile settings',
      icon: Users
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Themes, branding, and UI customization',
      icon: Palette
    }
  ];

  const getSettingsForSection = (sectionId: string): SettingItem[] => {
    switch (sectionId) {
      case 'general':
        return [
          {
            id: 'siteName',
            label: 'Site Name',
            description: 'The name of your platform',
            type: 'input',
            value: settings.siteName
          },
          {
            id: 'siteDescription',
            label: 'Site Description',
            description: 'Brief description for SEO and marketing',
            type: 'textarea',
            value: settings.siteDescription
          },
          {
            id: 'timezone',
            label: 'Default Timezone',
            description: 'System default timezone',
            type: 'select',
            value: settings.timezone,
            options: ['UTC', 'EST', 'PST', 'GMT']
          },
          {
            id: 'language',
            label: 'Default Language',
            description: 'Platform default language',
            type: 'select',
            value: settings.language,
            options: ['en', 'es', 'fr', 'de']
          },
          {
            id: 'maintenanceMode',
            label: 'Maintenance Mode',
            description: 'Put the site in maintenance mode',
            type: 'toggle',
            value: settings.maintenanceMode
          }
        ];
      
      case 'notifications':
        return [
          {
            id: 'emailNotifications',
            label: 'Email Notifications',
            description: 'Enable system email notifications',
            type: 'toggle',
            value: settings.emailNotifications
          },
          {
            id: 'smsNotifications',
            label: 'SMS Notifications',
            description: 'Enable SMS notifications for urgent alerts',
            type: 'toggle',
            value: settings.smsNotifications
          },
          {
            id: 'pushNotifications',
            label: 'Push Notifications',
            description: 'Enable browser push notifications',
            type: 'toggle',
            value: settings.pushNotifications
          },
          {
            id: 'adminAlerts',
            label: 'Admin Alerts',
            description: 'Receive alerts for important events',
            type: 'toggle',
            value: settings.adminAlerts
          },
          {
            id: 'userWelcomeEmails',
            label: 'User Welcome Emails',
            description: 'Send welcome emails to new users',
            type: 'toggle',
            value: settings.userWelcomeEmails
          }
        ];
      
      case 'security':
        return [
          {
            id: 'twoFactorAuth',
            label: 'Two-Factor Authentication',
            description: 'Require 2FA for admin accounts',
            type: 'toggle',
            value: settings.twoFactorAuth
          },
          {
            id: 'sessionTimeout',
            label: 'Session Timeout (minutes)',
            description: 'Automatic logout after inactivity',
            type: 'input',
            value: settings.sessionTimeout
          },
          {
            id: 'passwordExpiry',
            label: 'Password Expiry (days)',
            description: 'Force password changes after this period',
            type: 'input',
            value: settings.passwordExpiry
          },
          {
            id: 'loginAttempts',
            label: 'Max Login Attempts',
            description: 'Lock account after this many failed attempts',
            type: 'input',
            value: settings.loginAttempts
          }
        ];
      
      case 'payments':
        return [
          {
            id: 'stripeEnabled',
            label: 'Stripe Integration',
            description: 'Enable Stripe payment processing',
            type: 'toggle',
            value: settings.stripeEnabled
          },
          {
            id: 'paypalEnabled',
            label: 'PayPal Integration',
            description: 'Enable PayPal payment processing',
            type: 'toggle',
            value: settings.paypalEnabled
          },
          {
            id: 'commissionRate',
            label: 'Commission Rate (%)',
            description: 'Platform commission percentage',
            type: 'input',
            value: settings.commissionRate
          },
          {
            id: 'minimumPayout',
            label: 'Minimum Payout Amount ($)',
            description: 'Minimum amount for vendor payouts',
            type: 'input',
            value: settings.minimumPayout
          }
        ];
      
      case 'users':
        return [
          {
            id: 'userRegistration',
            label: 'User Registration',
            description: 'Allow new user registrations',
            type: 'toggle',
            value: settings.userRegistration
          },
          {
            id: 'vendorRegistration',
            label: 'Vendor Registration',
            description: 'Allow new vendor registrations',
            type: 'toggle',
            value: settings.vendorRegistration
          },
          {
            id: 'emailVerification',
            label: 'Email Verification',
            description: 'Require email verification for new accounts',
            type: 'toggle',
            value: settings.emailVerification
          },
          {
            id: 'profileModeration',
            label: 'Profile Moderation',
            description: 'Manually approve vendor profiles',
            type: 'toggle',
            value: settings.profileModeration
          }
        ];
      
      case 'appearance':
        return [
          {
            id: 'primaryColor',
            label: 'Primary Color',
            description: 'Main theme color',
            type: 'select',
            value: 'blue',
            options: ['blue', 'purple', 'pink', 'green']
          },
          {
            id: 'logoUrl',
            label: 'Logo URL',
            description: 'URL to your platform logo',
            type: 'input',
            value: ''
          },
          {
            id: 'faviconUrl',
            label: 'Favicon URL',
            description: 'URL to your favicon',
            type: 'input',
            value: ''
          }
        ];
      
      default:
        return [];
    }
  };

  const updateSetting = (settingId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
  };

  const renderSettingControl = (setting: SettingItem) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <button
            onClick={() => updateSetting(setting.id, !setting.value)}
            className="flex items-center"
          >
            {setting.value ? (
              <ToggleRight className="h-6 w-6 text-blue-600" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-gray-400" />
            )}
          </button>
        );
      
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {setting.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'input':
        return (
          <input
            type={typeof setting.value === 'number' ? 'number' : 'text'}
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            rows={3}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-rose-50/10">
      <AdminHeader />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Platform Settings
                </h1>
                <p className="text-gray-600 text-lg">
                  Configure platform behavior, security, and appearance settings
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Reset to Defaults
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Settings Categories</h2>
                <nav className="space-y-2">
                  {settingSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3",
                        selectedSection === section.id
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <section.icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className={cn(
                          "text-xs",
                          selectedSection === section.id ? "text-blue-100" : "text-gray-500"
                        )}>
                          {section.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg">
                <div className="p-8">
                  {settingSections.map((section) => {
                    if (section.id !== selectedSection) return null;
                    
                    const sectionSettings = getSettingsForSection(section.id);
                    
                    return (
                      <div key={section.id}>
                        <div className="mb-8">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-600 rounded-xl">
                              <section.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                              <p className="text-gray-600">{section.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {sectionSettings.map((setting) => (
                            <div key={setting.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 mb-1">{setting.label}</h3>
                                <p className="text-sm text-gray-600">{setting.description}</p>
                              </div>
                              <div className="ml-6 flex-shrink-0">
                                {renderSettingControl(setting)}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <div className="flex justify-end gap-3">
                            <button className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                              Cancel
                            </button>
                            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center gap-2">
                              <Save className="h-4 w-4" />
                              Save {section.title}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
