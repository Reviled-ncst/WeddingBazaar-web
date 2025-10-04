import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Bell, 
  BellRing,
  User, 
  Menu, 
  X,
  Store,
  BarChart3,
  Calendar,
  MessageSquare,
  Wallet,
  Briefcase,
  Settings,
  LogOut,
  CheckCircle,
  DollarSign,
  Star,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../notifications/NotificationProvider';
import { VendorProfileDropdownModal } from '../../../pages/users/vendor/components/header/modals/VendorProfileDropdownModal';
import { vendorNotificationService, type VendorNotification } from '../../../services/vendorNotificationService';

export const VendorHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showSuccess, showError, showInfo } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<VendorNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Initialize notifications on component mount and set up real-time updates
  useEffect(() => {
    if (!user?.id) return;
    
    console.log('🔔 [VendorHeader] Initializing real notification service for vendor:', user.id);
    loadVendorNotifications();

    // Set up real-time notification polling
    const unsubscribe = vendorNotificationService.subscribeToNotifications(
      user.id,
      (newNotification) => {
        console.log('🔔 [VendorHeader] Received new notification:', newNotification);
        setNotifications(prev => {
          const updated = [newNotification, ...prev.filter(n => n.id !== newNotification.id)];
          return updated;
        });
        setUnreadCount(prev => prev + (!newNotification.read ? 1 : 0));
        
        // Show notification toast
        if (!newNotification.read) {
          showInfo(`New ${newNotification.type.replace('_', ' ')}: ${newNotification.title}`);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id, showInfo]);

  // Load vendor notifications from the real API
  const loadVendorNotifications = async () => {
    if (!user?.id) return;
    
    setIsLoadingNotifications(true);
    try {
      console.log('📡 [VendorHeader] Loading notifications from API for vendor:', user.id);
      const response = await vendorNotificationService.getVendorNotifications(user.id);
      
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      console.log('✅ [VendorHeader] Loaded', response.count, 'notifications,', response.unreadCount, 'unread');
    } catch (error) {
      console.error('💥 [VendorHeader] Error loading notifications:', error);
      showError('Failed to load notifications');
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      console.log('📤 [VendorHeader] Marking notification as read:', notificationId);
      const success = await vendorNotificationService.markAsRead(notificationId);
      
      if (success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        console.log('✅ [VendorHeader] Notification marked as read');
      } else {
        showError('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('� [VendorHeader] Error marking notification as read:', error);
      showError('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!user?.id) return;
    
    try {
      console.log('📤 [VendorHeader] Marking all notifications as read for vendor:', user.id);
      const success = await vendorNotificationService.markAllAsRead(user.id);
      
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        console.log('✅ [VendorHeader] All notifications marked as read');
        showSuccess('All notifications marked as read');
      } else {
        showError('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('💥 [VendorHeader] Error marking all notifications as read:', error);
      showError('Failed to mark all notifications as read');
    }
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: BarChart3 },
    { name: 'Bookings', href: '/vendor/bookings', icon: Calendar },
    { name: 'Profile', href: '/vendor/profile', icon: Store },
    { name: 'Services', href: '/vendor/services', icon: Briefcase },
    { name: 'Analytics', href: '/vendor/analytics', icon: BarChart3 },
    { name: 'Finances', href: '/vendor/finances', icon: Wallet },
    { name: 'Messages', href: '/vendor/messages', icon: MessageSquare },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-rose-200/50 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-50/80 via-pink-50/60 to-white/80"></div>
      <div className="relative container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/vendor/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-2.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-rose-700 to-gray-900 bg-clip-text text-transparent">
                Wedding Bazaar
              </span>
              <span className="text-sm text-rose-600 font-semibold -mt-1">Vendor Portal</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                    isActive 
                      ? "bg-white/80 text-rose-700 shadow-md border border-rose-200/50" 
                      : "text-gray-600 hover:text-rose-700 hover:bg-white/60 hover:shadow-sm"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 transition-all duration-300",
                    isActive ? "bg-gradient-to-r from-rose-50/50 to-pink-50/50" : "bg-transparent group-hover:bg-gradient-to-r group-hover:from-rose-50/30 group-hover:to-pink-50/30"
                  )}></div>
                  <IconComponent className={cn(
                    "h-4 w-4 relative z-10 transition-all duration-300",
                    isActive ? "text-rose-600" : "text-gray-500 group-hover:text-rose-600"
                  )} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => {
                  console.log('🔔 [VendorHeader] Notification bell clicked. Notifications:', notifications.length, 'unread:', unreadCount);
                  setShowNotifications(!showNotifications);
                }}
                className="relative group p-3 text-gray-600 hover:text-rose-600 hover:bg-white/60 rounded-xl transition-all duration-300 hover:shadow-sm border border-transparent hover:border-rose-200/50"
                title="Notifications"
                aria-label="View notifications"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-50/30 to-pink-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {unreadCount > 0 ? (
                  <BellRing className="h-5 w-5 relative z-10 text-rose-600" />
                ) : (
                  <Bell className="h-5 w-5 relative z-10" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    <span className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-96 bg-white/95 backdrop-blur-md border border-rose-200/50 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden"
                  >
                    <div className="p-4 border-b border-rose-200/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                            {unreadCount} of {notifications.length} unread
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={loadVendorNotifications}
                            disabled={isLoadingNotifications}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh notifications"
                          >
                            <RefreshCw className={`h-4 w-4 text-gray-500 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
                          </button>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllNotificationsAsRead}
                              className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {isLoadingNotifications ? (
                        <div className="p-8 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-3"></div>
                          <p>Loading notifications...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 border-b border-gray-100 hover:bg-rose-50/50 transition-colors cursor-pointer ${
                              !notification.read ? 'bg-blue-50/30' : ''
                            }`}
                            onClick={() => {
                              markNotificationAsRead(notification.id);
                              if (notification.bookingId) {
                                // Navigate to bookings page if there's a booking ID
                                navigate('/vendor/bookings');
                                setShowNotifications(false);
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${
                                notification.type === 'booking_inquiry' ? 'bg-blue-100 text-blue-600' :
                                notification.type === 'quote_accepted' ? 'bg-green-100 text-green-600' :
                                notification.type === 'payment_received' ? 'bg-purple-100 text-purple-600' :
                                notification.type === 'message_received' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {notification.type === 'booking_inquiry' && <Calendar className="h-4 w-4" />}
                                {notification.type === 'quote_accepted' && <CheckCircle className="h-4 w-4" />}
                                {notification.type === 'payment_received' && <DollarSign className="h-4 w-4" />}
                                {notification.type === 'message_received' && <MessageSquare className="h-4 w-4" />}
                                {notification.type === 'review_received' && <Star className="h-4 w-4" />}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                                  <div className="flex items-center gap-2">
                                    {notification.priority === 'high' && (
                                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    )}
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                                <p className="text-gray-400 text-xs mt-2">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </p>
                                {notification.actionRequired && (
                                  <div className="mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                      Action Required
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                    
                    {/* View All Notifications Button */}
                    <div className="p-4 border-t border-rose-200/30 bg-gradient-to-r from-rose-50/30 to-pink-50/20">
                      <button
                        onClick={() => {
                          navigate('/vendor/bookings');
                          setShowNotifications(false);
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 font-medium text-sm"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="group flex items-center space-x-3 p-2 pr-4 text-gray-600 hover:text-rose-600 hover:bg-white/60 rounded-xl transition-all duration-300 hover:shadow-md border border-transparent hover:border-rose-200/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-50/30 to-pink-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="relative z-10 text-left">
                  <div className="text-sm font-semibold text-gray-900">{user ? `${user.firstName} ${user.lastName}` : 'Vendor'}</div>
                  <div className="text-xs text-gray-600">{user?.email || 'vendor@example.com'}</div>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              <VendorProfileDropdownModal
                isOpen={isProfileDropdownOpen}
                onClose={() => setIsProfileDropdownOpen(false)}
                onSubscriptionOpen={() => {
                  setIsProfileDropdownOpen(false);
                  navigate('/vendor/subscription?upgrade=true');
                }}
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden group p-3 text-gray-600 hover:text-rose-600 hover:bg-white/60 rounded-xl transition-all duration-300 hover:shadow-sm border border-transparent hover:border-rose-200/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-50/30 to-pink-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isMobileMenuOpen ? 
              <X className="h-6 w-6 relative z-10" /> : 
              <Menu className="h-6 w-6 relative z-10" />
            }
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-rose-200/50 bg-white/90 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-white/50"></div>
            <div className="relative z-10 py-4">
              <nav className="space-y-2 px-4">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                        isActive 
                          ? "bg-white/80 text-rose-700 shadow-md border border-rose-200/50" 
                          : "text-gray-600 hover:text-rose-700 hover:bg-white/60"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={cn(
                        "absolute inset-0 transition-all duration-300",
                        isActive ? "bg-gradient-to-r from-rose-50/50 to-pink-50/50" : "bg-transparent group-hover:bg-gradient-to-r group-hover:from-rose-50/30 group-hover:to-pink-50/30"
                      )}></div>
                      <IconComponent className={cn(
                        "h-5 w-5 relative z-10 transition-colors",
                        isActive ? "text-rose-600" : "text-gray-500 group-hover:text-rose-600"
                      )} />
                      <span className="relative z-10">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              
              <div className="border-t border-rose-200/30 mt-4 pt-4 px-4">
                <Link
                  to="/vendor/profile"
                  className="group flex items-center space-x-3 px-4 py-3 text-sm text-gray-600 hover:text-rose-700 hover:bg-white/60 rounded-xl transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-50/30 to-pink-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Settings className="h-5 w-5 text-gray-500 group-hover:text-rose-600 transition-colors relative z-10" />
                  <span className="relative z-10">Profile Settings</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="group flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-600 hover:text-rose-700 hover:bg-white/60 rounded-xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-50/30 to-pink-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <LogOut className="h-5 w-5 text-gray-500 group-hover:text-rose-600 transition-colors relative z-10" />
                  <span className="relative z-10">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
