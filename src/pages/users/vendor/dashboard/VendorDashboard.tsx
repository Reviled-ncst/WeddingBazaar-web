import React, { useState } from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { useVendorDashboard } from '../../../../hooks/useVendorData';
import { useSubscription } from '../../../../shared/contexts/SubscriptionContext';
import { SubscriptionGate } from '../../../../shared/components/subscription/SubscriptionGate';
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
  Award,
  Activity,
  Heart,
  ThumbsUp,
  ChevronRight,
  AlertTriangle,
  Crown
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  badge?: string;
}

interface PerformanceMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}> = ({ title, value, change, trend, icon: Icon, color }) => {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Activity;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          trend === 'up' ? 'bg-green-50 text-green-700' : 
          trend === 'down' ? 'bg-red-50 text-red-700' : 
          'bg-gray-50 text-gray-700'
        }`}>
          <TrendIcon className="w-3 h-3" />
          <span>{change}</span>
        </div>
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
      </div>
    </div>
  );
};

export const VendorDashboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('month');
  
  // Use real API data with mock vendor ID (in real app, get from auth context)
  const { data: dashboardData, loading, error, refetch } = useVendorDashboard('1');
  
  // Subscription context
  const {
    subscription,
    getFeatureLimitMessage,
    isNearLimit,
    upgradePrompt,
    hideUpgradePrompt
  } = useSubscription();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <VendorHeader />
        <div className="flex-1 bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard...</p>
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
        <div className="flex-1 bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
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

  // Extract metrics from the API response structure
  // The API returns 'stats' and 'recent_bookings', but the component expects 'metrics' and 'recentActivity'
  const apiData = dashboardData as any; // Type assertion to handle actual API response format
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
      title: 'Calendar',
      description: 'Manage bookings',
      icon: Calendar,
      href: '/vendor/bookings',
      color: 'bg-rose-600',
      badge: '3 pending'
    },
    {
      id: '2',
      title: 'Messages',
      description: 'Client inquiries',
      icon: MessageSquare,
      href: '/vendor/messages',
      color: 'bg-green-600',
      badge: '5 unread'
    },
    {
      id: '3',
      title: 'Portfolio',
      description: 'Update photos',
      icon: Camera,
      href: '/vendor/portfolio',
      color: 'bg-purple-600'
    },
    {
      id: '4',
      title: 'Analytics',
      description: 'View reports',
      icon: BarChart3,
      href: '/vendor/analytics',
      color: 'bg-blue-600'
    }
  ];

  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Response Rate',
      value: '98%',
      change: '+2%',
      trend: 'up',
      icon: Clock
    },
    {
      label: 'Client Satisfaction',
      value: '4.9/5',
      change: '+0.1',
      trend: 'up',
      icon: Heart
    },
    {
      label: 'Booking Rate',
      value: '34%',
      change: '+5%',
      trend: 'up',
      icon: Target
    },
    {
      label: 'Repeat Clients',
      value: '31%',
      change: '+12%',
      trend: 'up',
      icon: ThumbsUp
    }
  ];

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'message': return MessageSquare;
      case 'review': return Star;
      case 'payment': return DollarSign;
      case 'profile_view': return Eye;
      default: return Activity;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'booking': return 'bg-blue-100 text-blue-600';
      case 'message': return 'bg-green-100 text-green-600';
      case 'review': return 'bg-yellow-100 text-yellow-600';
      case 'payment': return 'bg-emerald-100 text-emerald-600';
      case 'profile_view': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <VendorHeader />
      <div className="flex-1 bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-6">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
              <p className="text-gray-600">Monitor your business performance and manage daily operations</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Online</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          {subscription && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <Crown className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{subscription.plan.name} Plan</h3>
                      <p className="text-sm text-gray-600">{getFeatureLimitMessage('services')}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-rose-600">${subscription.plan.price}</p>
                    <p className="text-sm text-gray-600">per month</p>
                  </div>
                </div>

                {/* Usage Overview */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{subscription.usage.services_count}</div>
                    <div className="text-sm text-gray-600">
                      {subscription.plan.limits.max_services === -1 ? 'Unlimited' : `of ${subscription.plan.limits.max_services}`} Services
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{subscription.usage.monthly_bookings_count}</div>
                    <div className="text-sm text-gray-600">
                      {subscription.plan.limits.max_monthly_bookings === -1 ? 'Unlimited' : `of ${subscription.plan.limits.max_monthly_bookings}`} Bookings
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{subscription.usage.monthly_messages_count}</div>
                    <div className="text-sm text-gray-600">
                      {subscription.plan.limits.max_monthly_messages === -1 ? 'Unlimited' : `of ${subscription.plan.limits.max_monthly_messages}`} Messages
                    </div>
                  </div>
                </div>

                {/* Near Limit Warning */}
                {(isNearLimit('services') || isNearLimit('bookings') || isNearLimit('messages')) && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      You're approaching your subscription limits. Consider upgrading to avoid service interruptions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Time Filter */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                {(['today', 'week', 'month', 'year'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      timeFilter === filter
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                Export Data
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="This Month's Bookings"
              value={metrics.totalBookings}
              change="+12%"
              trend="up"
              icon={Calendar}
              color="bg-rose-600"
            />
            <StatCard
              title="Revenue (MTD)"
              value={`$${metrics.monthlyRevenue.toLocaleString()}`}
              change="+23%"
              trend="up"
              icon={DollarSign}
              color="bg-emerald-600"
            />
            <StatCard
              title="Profile Views"
              value={metrics.profileViews.toLocaleString()}
              change="+8%"
              trend="up"
              icon={Eye}
              color="bg-blue-600"
            />
            <StatCard
              title="Conversion Rate"
              value={`${metrics.conversionRate}%`}
              change="+5%"
              trend="up"
              icon={TrendingUp}
              color="bg-purple-600"
            />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Recent Activity & Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Quick Actions Bar */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {quickActions.slice(0, 4).map((action) => {
                    const Icon = action.icon;
                    
                    // Wrap analytics in subscription gate
                    if (action.title === 'Analytics') {
                      return (
                        <SubscriptionGate 
                          key={action.id}
                          requiredTier="premium" 
                          feature="advanced_analytics"
                          className="relative"
                        >
                          <a
                            href={action.href}
                            className="group relative flex flex-col items-center p-4 bg-gray-50 hover:bg-rose-50 rounded-lg border border-gray-200 hover:border-rose-200 transition-all duration-200"
                          >
                            {action.badge && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full text-center min-w-[20px]">
                                {action.badge.split(' ')[0]}
                              </div>
                            )}
                            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-rose-700 text-center">
                              {action.title.replace(' ', '\n')}
                            </span>
                          </a>
                        </SubscriptionGate>
                      );
                    }

                    return (
                      <a
                        key={action.id}
                        href={action.href}
                        className="group relative flex flex-col items-center p-4 bg-gray-50 hover:bg-rose-50 rounded-lg border border-gray-200 hover:border-rose-200 transition-all duration-200"
                      >
                        {action.badge && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full text-center min-w-[20px]">
                            {action.badge.split(' ')[0]}
                          </div>
                        )}
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-rose-700 text-center">
                          {action.title.replace(' ', '\n')}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Pending Tasks/Notifications */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Pending Actions</h2>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {recentActivities.filter((a: any) => a.type === 'message' || a.type === 'booking').length} pending
                  </span>
                </div>
                <div className="space-y-3">
                  {recentActivities.slice(0, 5).map((activity: any) => {
                    const ActivityIcon = getActivityIcon(activity.type);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                          <ActivityIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                            <span className="text-xs text-gray-500">{activity.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          {activity.client && (
                            <p className="text-xs text-rose-600 font-medium">
                              {activity.client}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              
              {/* Today's Schedule */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                    <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Client Meeting</div>
                      <div className="text-xs text-gray-600">2:00 PM - Sarah & John</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                    <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Venue Visit</div>
                      <div className="text-xs text-gray-600">4:30 PM - Grand Ballroom</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                    <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Photo Shoot</div>
                      <div className="text-xs text-gray-600">6:00 PM - Engagement</div>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-4 text-sm text-rose-600 hover:text-rose-700 font-medium">
                  View Full Calendar
                </button>
              </div>

              {/* Business Performance */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
                <div className="space-y-4">
                  {performanceMetrics.map((metric) => {
                    const MetricIcon = metric.icon;
                    return (
                      <div
                        key={metric.label}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                            <MetricIcon className="w-4 h-4 text-rose-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{metric.value}</div>
                          <div className={`text-xs ${
                            metric.trend === 'up' ? 'text-emerald-600' : 
                            metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            {metric.change}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-rose-50 rounded-lg">
                    <div className="text-xl font-bold text-rose-600">{metrics.activeClients}</div>
                    <div className="text-xs text-gray-600">Active Clients</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{metrics.pendingInquiries}</div>
                    <div className="text-xs text-gray-600">New Inquiries</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-xl font-bold text-emerald-600">{metrics.completedProjects}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{metrics.repeatCustomers}</div>
                    <div className="text-xs text-gray-600">Returning</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">This Month</span>
                  </div>
                  <div className="text-xs text-amber-600">
                    🎉 You're in the top 10% of vendors this month!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={upgradePrompt.show}
        onClose={hideUpgradePrompt}
        message={upgradePrompt.message}
        requiredTier={upgradePrompt.requiredTier}
      />
    </div>
  );
};