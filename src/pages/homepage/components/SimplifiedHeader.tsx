import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Menu, X, Search, MessageCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/HybridAuthContext';

export const SimplifiedHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = () => {
    // This would open a login modal or navigate to login page
    navigate('/login');
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/individual/dashboard');
    } else {
      navigate('/individual/services');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Wedding Bazaar</span>
          </div>

          {/* Simple Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/individual/services')}
              className="text-gray-700 hover:text-pink-600 font-medium transition-colors"
            >
              Find Vendors
            </button>
            <button
              onClick={() => navigate('/individual/services/dss')}
              className="text-gray-700 hover:text-pink-600 font-medium transition-colors"
            >
              Get My Plan
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => navigate('/individual/bookings')}
                  className="text-gray-700 hover:text-pink-600 font-medium transition-colors flex items-center gap-1"
                >
                  <Calendar className="h-4 w-4" />
                  My Bookings
                </button>
                <button
                  onClick={() => navigate('/individual/messages')}
                  className="text-gray-700 hover:text-pink-600 font-medium transition-colors flex items-center gap-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  Messages
                </button>
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-pink-600">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">
                    Hi, {user?.firstName || 'User'}!
                  </span>
                </div>
                <button
                  onClick={() => navigate('/individual/dashboard')}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
                >
                  My Wedding
                </button>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLogin}
                  className="text-gray-700 hover:text-pink-600 font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={handleGetStarted}
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-pink-600 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Simple Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-6 py-4 space-y-4">
            <button
              onClick={() => {
                navigate('/individual/services');
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 font-medium w-full text-left"
            >
              <Search className="h-4 w-4" />
              <span>Find Vendors</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/individual/services/dss');
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 font-medium w-full text-left"
            >
              <Heart className="h-4 w-4" />
              <span>Get My Plan</span>
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    navigate('/individual/bookings');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 font-medium w-full text-left"
                >
                  <Calendar className="h-4 w-4" />
                  <span>My Bookings</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/individual/messages');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 font-medium w-full text-left"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Messages</span>
                </button>
                
                <div className="border-t border-gray-100 pt-4">
                  <button
                    onClick={() => {
                      navigate('/individual/dashboard');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 mb-2"
                  >
                    My Wedding Dashboard
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <button
                  onClick={() => {
                    handleLogin();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 border border-pink-200 text-pink-600 font-medium rounded-lg hover:bg-pink-50 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    handleGetStarted();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
                >
                  Get Started Free
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default SimplifiedHeader;
