import React, { useState } from 'react';
import { Shield, Menu, X, Users, BarChart3, Settings, Database, MessageSquare, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { Messenger, useMessenger } from '../../../shared/messenger';

export const AdminHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isMessengerOpen, openMessenger, closeMessenger } = useMessenger();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Database', href: '/admin/database', icon: Database },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/admin" className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-slate-700 to-gray-700 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Wedding Bazaar</span>
            <span className="text-sm bg-slate-100 text-slate-700 px-2 py-1 rounded-full">Admin</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-1 text-gray-700 hover:text-slate-700 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            <button
              onClick={() => openMessenger()}
              className="flex items-center space-x-1 text-gray-700 hover:text-slate-700 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Support Messages</span>
            </button>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              className="p-2 text-gray-600 hover:text-slate-700 transition-colors"
              title="System notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-slate-100 rounded-full">
                <User className="h-4 w-4 text-slate-700" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                <div className="text-gray-500">Administrator</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-slate-700 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-slate-50 hover:text-slate-700 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <button
                onClick={() => {
                  openMessenger();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-slate-50 hover:text-slate-700 rounded-lg transition-colors w-full text-left"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Support Messages</span>
              </button>
              <div className="px-3 py-2 border-t border-gray-200 mt-4">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-sm text-gray-500 mb-2">Administrator</div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-sm text-slate-700 hover:text-slate-800"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Messenger Modal */}
      <Messenger 
        isOpen={isMessengerOpen} 
        onClose={closeMessenger} 
      />
    </header>
  );
};
