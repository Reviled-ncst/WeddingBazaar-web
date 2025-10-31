import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import { 
  PartyPopper, Calendar, Users, TrendingUp, Bell, 
  Settings, LogOut, Menu, X, Heart, BarChart3, Briefcase, UserCheck,
  Palette, Plug
} from 'lucide-react';

export const CoordinatorHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/coordinator', label: 'Dashboard', icon: PartyPopper },
    { path: '/coordinator/weddings', label: 'Weddings', icon: Heart },
    { path: '/coordinator/calendar', label: 'Calendar', icon: Calendar },
    { path: '/coordinator/team', label: 'Team', icon: UserCheck },
    { path: '/coordinator/vendors', label: 'Vendors', icon: Users },
    { path: '/coordinator/clients', label: 'Clients', icon: Briefcase },
    { path: '/coordinator/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/coordinator/whitelabel', label: 'Branding', icon: Palette },
    { path: '/coordinator/integrations', label: 'Integrations', icon: Plug },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/coordinator" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
              <PartyPopper className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Wedding Bazaar
              </h1>
              <p className="text-xs text-amber-600 font-semibold">Coordinator Portal</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                              (item.path !== '/coordinator' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            <button className="p-2 text-gray-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="w-px h-8 bg-gray-200"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-amber-600">Coordinator</p>
              </div>
              <div className="relative group">
                <button className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {user?.firstName?.[0] || 'C'}
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                  <Link
                    to="/coordinator/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-gray-700 hover:text-amber-700"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">Settings</span>
                  </Link>
                  <div className="h-px bg-gray-100 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-all"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-amber-100 py-4 px-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                              (item.path !== '/coordinator' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
            <Link
              to="/coordinator/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-all"
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all w-full"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
