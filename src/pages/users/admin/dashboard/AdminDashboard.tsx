import React, { useState } from 'react';
import { AdminHeader } from '../../../../shared/components/layout/AdminHeader';
import { 
  Users, 
  Store, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  Activity,
  BarChart3,
  MessageSquare,
  Star,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface PlatformMetric {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
  target?: number;
  description?: string;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'vendor_approval' | 'booking_created' | 'payment_processed' | 'vendor_registration' | 'review_posted';
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error' | 'warning';
  userId?: string;
  amount?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface AdminAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
  category?: 'performance' | 'security' | 'business' | 'technical';
}

// Removed unused interface QuickAction

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
  target?: number;
  description?: string;
  onClick?: () => void;
}> = ({ title, value, change, trend, icon: Icon, color, target, description, onClick }) => {
  // Trend calculation
  const trendIcons = {
    up: ArrowUpRight,
    down: ArrowDownRight,
    neutral: Activity
  };
  
  const TrendIcon = trendIcons[trend];
  const isClickable = !!onClick;

  // Calculate progress for target metrics
  const progress = target ? (typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, '')) : value) / target * 100 : undefined;

  return (
    <div 
      className={`bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group ${
        isClickable ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Icon className="h-6 w-6 text-white relative z-10" />
        </div>
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
          trend === 'up' ? 'bg-green-100 text-green-700' :
          trend === 'down' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          <TrendIcon className="h-4 w-4" />
          <span>{change}</span>
        </div>
      </div>
      
      <div className="mb-3">
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
          {value}
        </p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      
      {target && progress !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress to target</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                progress >= 100 ? 'bg-green-500' : progress >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
              }`}
              data-width={Math.min(progress, 100)}
            />
          </div>
        </div>
      )}
      
      {isClickable && (
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center text-blue-600 text-sm font-medium">
            <span>View details</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityCard: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
  const statusColors = {
    success: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-orange-100 text-orange-800'
  };

  const typeIcons = {
    user_signup: Users,
    vendor_approval: Store,
    booking_created: Calendar,
    payment_processed: DollarSign,
    vendor_registration: Store,
    review_posted: Star
  };

  const Icon = typeIcons[activity.type] || Users;

  return (
    <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 hover:bg-white/80 transition-all duration-200">
      <div className="p-2 bg-rose-100 rounded-xl">
        <Icon className="h-4 w-4 text-rose-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
        <p className="text-xs text-gray-500">{activity.timestamp}</p>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[activity.status]}`}>
        {activity.status}
      </span>
    </div>
  );
};

const AlertCard: React.FC<{ alert: AdminAlert }> = ({ alert }) => {
  const alertColors = {
    warning: 'border-yellow-200 bg-yellow-50/80',
    error: 'border-red-200 bg-red-50/80',
    info: 'border-blue-200 bg-blue-50/80',
    success: 'border-green-200 bg-green-50/80'
  };

  const alertIcons = {
    warning: AlertTriangle,
    error: AlertTriangle,
    info: Activity,
    success: Activity
  };

  const Icon = alertIcons[alert.type] || AlertTriangle;

  return (
    <div className={`p-4 rounded-2xl border ${alertColors[alert.type]} backdrop-blur-sm`}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 ${alert.type === 'error' ? 'text-red-600' : alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'} mt-0.5`} />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">{alert.title}</h4>
          <p className="text-gray-600 text-xs mt-1">{alert.description}</p>
          <p className="text-gray-500 text-xs mt-2">{alert.timestamp}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${alert.priority === 'high' ? 'bg-red-100 text-red-800' : alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
          {alert.priority}
        </span>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [platformMetrics] = useState<PlatformMetric[]>([
    {
      label: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      label: 'Active Vendors',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      icon: Store,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
    },
    {
      label: 'Monthly Bookings',
      value: '1,234',
      change: '+23.1%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-gradient-to-br from-violet-500 to-violet-600'
    },
    {
      label: 'Platform Revenue',
      value: '₱6,885,000',
      change: '+18.7%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-gradient-to-br from-rose-500 to-rose-600'
    },
    {
      label: 'Avg. Rating',
      value: '4.8',
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'bg-gradient-to-br from-amber-500 to-amber-600'
    },
    {
      label: 'Response Time',
      value: '2.3h',
      change: '-15%',
      trend: 'up',
      icon: MessageSquare,
      color: 'bg-gradient-to-br from-cyan-500 to-cyan-600'
    }
  ]);

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'user_signup',
      description: 'Sarah Johnson signed up as a couple',
      timestamp: '2 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'vendor_approval',
      description: 'Elite Photography Studio approved',
      timestamp: '15 minutes ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'booking_created',
      description: 'Wedding booking for June 2025 created',
      timestamp: '32 minutes ago',
      status: 'success'
    },
    {
      id: '4',
      type: 'payment_processed',
      description: 'Payment of ₱135,000 processed',
      timestamp: '1 hour ago',
      status: 'success'
    },
    {
      id: '5',
      type: 'vendor_approval',
      description: 'Luxury Catering Co. pending review',
      timestamp: '2 hours ago',
      status: 'pending'
    }
  ]);

  const [adminAlerts] = useState<AdminAlert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Server Load',
      description: 'API response time has increased by 15% in the last hour',
      timestamp: '10 minutes ago',
      priority: 'high'
    },
    {
      id: '2',
      type: 'info',
      title: 'New Feature Request',
      description: '5 vendors requested calendar integration feature',
      timestamp: '2 hours ago',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Pending Vendor Reviews',
      description: '12 vendor applications awaiting approval',
      timestamp: '4 hours ago',
      priority: 'medium'
    }
  ]);

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'Vendor Approvals',
      description: 'Review pending vendor applications',
      icon: Store,
      href: '/admin/vendors',
      color: 'bg-emerald-500'
    },
    {
      title: 'Platform Analytics',
      description: 'View detailed platform metrics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-violet-500'
    },
    {
      title: 'Financial Overview',
      description: 'Monitor revenue and payments',
      icon: DollarSign,
      href: '/admin/finances',
      color: 'bg-rose-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-pink-50/20">
      <AdminHeader />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-gray-900 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Platform overview and management controls
            </p>
          </div>

          {/* Platform Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {platformMetrics.map((metric, index) => (
              <StatCard
                key={index}
                title={metric.label}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                icon={metric.icon}
                color={metric.color}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  <button className="text-rose-600 hover:text-rose-700 font-medium text-sm flex items-center">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts & Quick Actions */}
            <div className="space-y-6">
              {/* Alerts */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">System Alerts</h2>
                <div className="space-y-3">
                  {adminAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => window.location.href = action.href}
                      className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-200 group"
                    >
                      <div className={`p-2 ${action.color} rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 text-sm">{action.title}</p>
                        <p className="text-gray-500 text-xs">{action.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};