import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye, 
  Mail,
  Smartphone,
  Globe,
  Lock,
  Trash2,
  Save,
  ChevronRight
} from 'lucide-react';
import { CoupleHeader } from '../landing/CoupleHeader';

export const AccountSettings: React.FC = () => {
  const [settings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    vendorMessages: true,
    marketingEmails: false,
    profilePublic: true,
    showWeddingDate: true,
    twoFactorAuth: false,
    autoSave: true
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Settings saved:', settings);
  };

  const settingSections = [
    {
      title: 'Notifications',
      icon: Bell,
      color: 'blue',
      items: [
        { icon: Mail, label: 'Email Notifications', description: 'Receive updates via email', enabled: settings.emailNotifications },
        { icon: Smartphone, label: 'SMS Notifications', description: 'Receive text messages', enabled: settings.smsNotifications },
        { icon: Bell, label: 'Vendor Messages', description: 'New messages from vendors', enabled: settings.vendorMessages },
        { icon: Mail, label: 'Marketing Emails', description: 'Tips and promotions', enabled: settings.marketingEmails }
      ]
    },
    {
      title: 'Privacy',
      icon: Eye,
      color: 'indigo',
      items: [
        { icon: Globe, label: 'Public Profile', description: 'Visible to vendors', enabled: settings.profilePublic },
        { icon: SettingsIcon, label: 'Show Wedding Date', description: 'Display to vendors', enabled: settings.showWeddingDate }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      color: 'green',
      items: [
        { icon: Lock, label: 'Two-Factor Authentication', description: 'Extra security for your account', enabled: settings.twoFactorAuth },
        { icon: Lock, label: 'Change Password', description: 'Update your password', action: true }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <CoupleHeader />
      <main className="flex-1">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Account Settings
              </h1>
              <p className="text-gray-600 mt-2">Manage your privacy, notifications, and security preferences</p>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Save className="h-5 w-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

            {/* Settings Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {settingSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <section.icon className={`h-6 w-6 text-${section.color}-500 mr-3`} />
                {section.title}
              </h3>
              
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-semibold text-gray-900">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </div>
                    {item.action ? (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    ) : (
                      <div className={`w-3 h-3 rounded-full ${item.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Account Management */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <SettingsIcon className="h-6 w-6 text-purple-500 mr-3" />
              Account Management
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Save className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Auto-Save</div>
                      <div className="text-sm text-gray-600">Enabled</div>
                    </div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              <div className="p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <SettingsIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Export Data</div>
                      <div className="text-sm text-gray-600">Download</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="p-4 bg-red-50/50 rounded-xl hover:bg-red-100/50 transition-all duration-300 cursor-pointer border border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-semibold text-red-900">Delete Account</div>
                      <div className="text-sm text-red-600">Permanent</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-red-400" />
                </div>
              </div>
            </div>
          </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
};
