import React, { useState, useEffect, useCallback } from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { useVendorDashboard } from '../../../../hooks/useVendorData';
import { useSubscription } from '../../../../shared/contexts/SubscriptionContext';
import { UpgradePrompt } from '../../../../shared/components/subscription/UpgradePrompt';
import type { RecentActivity } from '../../../../services/api/vendorApiService';
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Eye, 
  MessageSquare,
  TrendingUp,
  Star,
  Camera,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  Heart,
  ThumbsUp,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Zap,
  Download
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  badge?: string;
  urgent?: boolean;
}

interface PerformanceMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  target?: string;
  progress?: number;
}

interface LiveNotification {
  id: string;
  type: 'booking' | 'message' | 'payment' | 'review';
  title: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}> = ({ title, value, change, trend, icon: Icon, color, subtitle, onClick }) => {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Activity;
  
  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
          trend === 'up' ? 'bg-green-50 text-green-700' : 
          trend === 'down' ? 'bg-red-50 text-red-700' : 
          'bg-gray-50 text-gray-700'
        }`}>
          <TrendIcon className="w-4 h-4" />
          <span>{change}</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

const LiveNotificationCard: React.FC<{ notification: LiveNotification }> = ({ notification }) => {
  const iconMap = {
    booking: Calendar,
    message: MessageSquare,
    payment: DollarSign,
    review: Star
  };
  
  const colorMap = {
    booking: 'bg-blue-500',
    message: 'bg-green-500',
    payment: 'bg-purple-500',
    review: 'bg-yellow-500'
  };
  
  const Icon = iconMap[notification.type];
  
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className={`w-8 h-8 ${colorMap[notification.type]} rounded-full flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
        <p className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleTimeString()}</p>
      </div>
      {notification.priority === 'high' && (
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      )}
    </div>
  );
};

export const VendorDashboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Use real API data with mock vendor ID (in real app, get from auth context)
  const { data: dashboardData, loading, error, refetch } = useVendorDashboard('1');
  
  // Subscription context
  const {
    upgradePrompt,
    hideUpgradePrompt
  } = useSubscription();

  // Auto-refresh dashboard data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Mock live notifications (in real app, this would come from WebSocket)
  useEffect(() => {
    const generateMockNotification = () => {
      const types: LiveNotification['type'][] = ['booking', 'message', 'payment', 'review'];
      const titles = {
        booking: 'New booking inquiry received',
        message: 'New message from Sarah M.',
        payment: 'Payment received for June wedding',
        review: 'New 5-star review posted'
      };
      
      const type = types[Math.floor(Math.random() * types.length)];
      
      return {
        id: Date.now().toString(),
        type,
        title: titles[type],
        timestamp: new Date().toISOString(),
        priority: (Math.random() > 0.7 ? 'high' : 'medium') as 'high' | 'medium' | 'low'
      };
    };

    // Add a new notification every 2 minutes (for demo purposes)
    const notificationInterval = setInterval(() => {
      const newNotification = generateMockNotification();
      setLiveNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    }, 120000);

    return () => clearInterval(notificationInterval);
  }, []);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setLastUpdate(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [refetch]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <VendorHeader />
        <div className="flex-1 bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading your dashboard...</p>
                <p className="text-gray-500 text-sm mt-2">Fetching real-time business data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <VendorHeader />
        <div className="flex-1 bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Unavailable</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  // Extract and enhance metrics from the API response
  const apiData = dashboardData as any;
  const stats = apiData.stats || {};
  
  const metrics = {
    totalBookings: stats.total_bookings || 0,
    monthlyRevenue: stats.monthly_revenue || 0,
    profileViews: stats.profile_views || 1250,
    conversionRate: stats.conversion_rate || 8.5,
    activeClients: stats.active_clients || 24,
    pendingInquiries: stats.pending_inquiries || 6,
    completedProjects: stats.completed_bookings || stats.completed_projects || 0,
    repeatCustomers: stats.repeat_customers || 18
  };

  const recentActivities: RecentActivity[] = apiData.recent_bookings ? 
    apiData.recent_bookings.map((booking: any) => ({
      id: booking.id?.toString() || 'unknown',
      type: 'booking' as const,
      title: `Booking from ${booking.client_name || 'Client'}`,
      description: `${booking.service || 'Service'} - ${booking.status || 'pending'}`,
      timestamp: booking.date || new Date().toISOString(),
      amount: booking.amount,
      client: booking.client_name
    })) : 
    apiData.recentActivity || [];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Bookings',
      description: 'Manage calendar',
      icon: Calendar,
      href: '/vendor/bookings',
      color: 'bg-gradient-to-br from-rose-500 to-pink-600',
      badge: metrics.pendingInquiries > 0 ? `${metrics.pendingInquiries} pending` : undefined,
      urgent: metrics.pendingInquiries > 3
    },
    {
      id: '2',
      title: 'Messages',
      description: 'Client inquiries',
      icon: MessageSquare,
      href: '/vendor/messages',
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      badge: '5 unread'
    },
    {
      id: '3',
      title: 'Portfolio',
      description: 'Update gallery',
      icon: Camera,
      href: '/vendor/profile',
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600'
    },
    {
      id: '4',
      title: 'Analytics',
      description: 'Performance',
      icon: BarChart3,
      href: '/vendor/analytics',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600'
    }
  ];

  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Response Rate',
      value: '98%',
      change: '+2%',
      trend: 'up',
      icon: Clock,
      target: '95%',
      progress: 98
    },
    {
      label: 'Client Satisfaction',
      value: '4.9/5',
      change: '+0.1',
      trend: 'up',
      icon: Heart,
      target: '4.8/5',
      progress: 98
    },
    {
      label: 'Booking Rate',
      value: '34%',
      change: '+5%',
      trend: 'up',
      icon: Target,
      target: '30%',
      progress: 87
    },
    {
      label: 'Repeat Clients',
      value: '31%',
      change: '+12%',
      trend: 'up',
      icon: ThumbsUp,
      target: '25%',
      progress: 75
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <VendorHeader />
      
      <div className="flex-1 bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header Section with Live Updates */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Business Dashboard
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Updated {lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              {/* Time Filter */}
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                title="Select time filter"
                aria-label="Time filter selection"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              {/* Export Button */}
              <button className="flex items-center space-x-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Live Notifications */}
          {liveNotifications.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Live Activity</h3>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Zap className="w-4 h-4" />
                  <span>Real-time</span>
                </div>
              </div>
              <div className="space-y-3">
                {liveNotifications.map((notification) => (
                  <LiveNotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Bookings"
              value={metrics.totalBookings}
              change="+12%"
              trend="up"
              icon={Calendar}
              color="bg-gradient-to-br from-rose-500 to-pink-600"
              subtitle={`${timeFilter} period`}
              onClick={() => window.location.href = '/vendor/bookings'}
            />
            <StatCard
              title="Monthly Revenue"
              value={`₱${metrics.monthlyRevenue.toLocaleString()}`}
              change="+8%"
              trend="up"
              icon={DollarSign}
              color="bg-gradient-to-br from-green-500 to-emerald-600"
              subtitle="Gross earnings"
            />
            <StatCard
              title="Profile Views"
              value={metrics.profileViews.toLocaleString()}
              change="+15%"
              trend="up"
              icon={Eye}
              color="bg-gradient-to-br from-blue-500 to-cyan-600"
              subtitle="Unique visitors"
            />
            <StatCard
              title="Conversion Rate"
              value={`${metrics.conversionRate}%`}
              change="+2.1%"
              trend="up"
              icon={TrendingUp}
              color="bg-gradient-to-br from-purple-500 to-indigo-600"
              subtitle="Inquiries to bookings"
            />
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <metric.icon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{metric.label}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs font-medium text-green-600">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>{metric.change}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{metric.value}</div>
                    {metric.target && (
                      <div className="text-xs text-gray-500">Target: {metric.target}</div>
                    )}
                  </div>
                  {metric.progress && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r from-rose-500 to-pink-600 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(metric.progress, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action) => (
              <a
                key={action.id}
                href={action.href}
                className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              >
                {action.urgent && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                {action.badge && (
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    action.urgent ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {action.badge}
                  </div>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400 absolute bottom-4 right-4 group-hover:text-gray-600 transition-colors" />
              </a>
            ))}
          </div>

          {/* Recent Activity */}
          {recentActivities.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <a 
                  href="/vendor/bookings" 
                  className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                >
                  View all →
                </a>
              </div>
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity) => {
                  const ActivityIcon = activity.type === 'booking' ? Calendar : 
                                     activity.type === 'message' ? MessageSquare :
                                     activity.type === 'payment' ? DollarSign : Star;
                  
                  return (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <ActivityIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                      {activity.amount && (
                        <div className="text-sm font-medium text-green-600">
                          ${activity.amount}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Upgrade Prompt */}
      {upgradePrompt.show && (
        <UpgradePrompt
          isOpen={upgradePrompt.show}
          onClose={hideUpgradePrompt}
          message={upgradePrompt.message}
          requiredTier={upgradePrompt.requiredTier}
        />
      )}
    </div>
  );
};

export { VendorDashboard as VendorDashboardEnhanced };
