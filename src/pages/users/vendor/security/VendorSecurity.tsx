import React from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Clock, Settings } from 'lucide-react';

export const VendorSecurity: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <VendorHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Security & Privacy
              </h1>
              <p className="text-gray-600">Manage your account security and privacy settings</p>
            </div>
          </div>
        </div>

        {/* Security Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">Strong</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Password Security</h3>
            <p className="text-sm text-gray-600">Last changed 30 days ago</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-yellow-600">Setup</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Two-Factor Auth</h3>
            <p className="text-sm text-gray-600">Recommended for security</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">5</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Active Sessions</h3>
            <p className="text-sm text-gray-600">Devices logged in</p>
          </div>
        </div>

        {/* Security Settings */}
        <div className="grid gap-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Password & Authentication</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Change Password</div>
                  <div className="text-sm text-gray-600">Update your account password</div>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Change
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-600">Add an extra layer of security</div>
                </div>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Enable
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Eye className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Privacy Controls</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Profile Visibility</div>
                  <div className="text-sm text-gray-600">Control who can see your profile</div>
                </div>
                <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  Manage
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Data Download</div>
                  <div className="text-sm text-gray-600">Download your account data</div>
                </div>
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                  Request
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Advanced Security</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Login Alerts</div>
                  <div className="text-sm text-gray-600">Get notified of suspicious activity</div>
                </div>
                <div className="text-green-600 font-medium">Enabled</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Active Sessions</div>
                  <div className="text-sm text-gray-600">Manage logged-in devices</div>
                </div>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
