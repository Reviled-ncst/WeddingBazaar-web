import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Store, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  Activity,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  RefreshCcw,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Eye,
  Plus,
  Download,
  Bell
} from 'lucide-react';

interface PlatformMetric {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  target?: number;
  description?: string;
  progress?: number;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'vendor_approval' | 'booking_created' | 'payment_processed' | 'vendor_registration' | 'review_posted' | 'support_ticket' | 'system_alert';
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error' | 'warning';
  userId?: string;
  userName?: string;
  amount?: string;
  priority?: 'high' | 'medium' | 'low';
  category?: 'user' | 'vendor' | 'booking' | 'payment' | 'system';
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
  resolved?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  color: string;
  description: string;
}

// Enhanced Metric Card Component
const MetricCard: React.FC<{ metric: PlatformMetric }> = ({ metric }) => {
  const IconComponent = metric.icon;
  const isPositive = metric.trend === 'up';
  const isNegative = metric.trend === 'down';
  
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${metric.color} bg-opacity-10`}>
          <IconComponent className={`h-6 w-6 ${metric.color.replace('bg-', 'text-')}`} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isPositive ? 'bg-green-100 text-green-700' : 
          isNegative ? 'bg-red-100 text-red-700' : 
          'bg-gray-100 text-gray-700'
        }`}>
          {isPositive && <ArrowUpRight className="h-3 w-3" />}
          {isNegative && <ArrowDownRight className="h-3 w-3" />}
          {metric.change}
        </div>
      </div>
      
      <div className="mb-2">
        <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
        <div className="text-sm text-gray-600">{metric.label}</div>
      </div>
      
      {metric.progress && metric.target && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{metric.progress}% of target</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${metric.color} ${
                metric.progress && metric.progress >= 90 ? 'w-[90%]' :
                metric.progress && metric.progress >= 80 ? 'w-[80%]' :
                metric.progress && metric.progress >= 70 ? 'w-[70%]' :
                metric.progress && metric.progress >= 60 ? 'w-[60%]' :
                metric.progress && metric.progress >= 50 ? 'w-[50%]' :
                'w-[30%]'
              }`}
            ></div>
          </div>
        </div>
      )}
      
      {metric.description && (
        <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
      )}
    </div>
  );
};

// Enhanced Activity Item Component
const ActivityItem: React.FC<{ activity: RecentActivity; onViewDetails: (id: string) => void }> = ({ 
  activity, 
  onViewDetails 
}) => {
  const getStatusIcon = () => {
    switch (activity.status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = () => {
    switch (activity.category) {
      case 'user': return 'bg-blue-50 border-blue-200';
      case 'vendor': return 'bg-purple-50 border-purple-200';
      case 'booking': return 'bg-green-50 border-green-200';
      case 'payment': return 'bg-yellow-50 border-yellow-200';
      case 'system': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${getCategoryColor()} hover:shadow-md transition-all duration-200 cursor-pointer group`}
         onClick={() => onViewDetails(activity.id)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1">{getStatusIcon()}</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">{activity.description}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{activity.timestamp}</span>
              {activity.userName && (
                <>
                  <span>•</span>
                  <span className="font-medium">{activity.userName}</span>
                </>
              )}
              {activity.amount && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-green-600">{activity.amount}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activity.priority === 'high' && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              High Priority
            </span>
          )}
          <Eye className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};

// Alert Component
const AlertCard: React.FC<{ alert: AdminAlert; onResolve: (id: string) => void }> = ({ 
  alert, 
  onResolve 
}) => {
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertBg = () => {
    switch (alert.type) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${getAlertBg()} ${alert.resolved ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getAlertIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{alert.title}</h4>
              {alert.priority === 'high' && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  High Priority
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{alert.timestamp}</span>
              <span>•</span>
              <span className="capitalize">{alert.category}</span>
            </div>
          </div>
        </div>
        {!alert.resolved && (
          <button
            onClick={() => onResolve(alert.id)}
            className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivityCategory, setSelectedActivityCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Enhanced Platform Metrics with targets and progress
  const [metrics, setMetrics] = useState<PlatformMetric[]>([
    {
      label: 'Total Users',
      value: '12,847',
      change: '+12.3%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
      target: 15000,
      progress: 85.6,
      description: 'Active registered users on the platform'
    },
    {
      label: 'Active Vendors',
      value: '1,234',
      change: '+8.7%',
      trend: 'up',
      icon: Store,
      color: 'bg-purple-500',
      target: 1500,
      progress: 82.3,
      description: 'Verified and active vendor accounts'
    },
    {
      label: 'Monthly Bookings',
      value: '3,456',
      change: '+15.2%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-green-500',
      target: 4000,
      progress: 86.4,
      description: 'Bookings completed this month'
    },
    {
      label: 'Revenue (Monthly)',
      value: '₱2,347,890',
      change: '+22.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-emerald-500',
      target: 3000000,
      progress: 78.3,
      description: 'Total platform revenue this month'
    },
    {
      label: 'Platform Rating',
      value: '4.8/5',
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'bg-yellow-500',
      target: 5.0,
      progress: 96.0,
      description: 'Average platform rating from users'
    },
    {
      label: 'Response Time',
      value: '1.2s',
      change: '-0.3s',
      trend: 'up',
      icon: Zap,
      color: 'bg-orange-500',
      description: 'Average API response time'
    }
  ]);

  // Enhanced Recent Activities with more data
  const [activities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'vendor_approval',
      description: 'New vendor "Perfect Weddings Photography" approved and verified',
      timestamp: '2 minutes ago',
      status: 'success',
      userName: 'John Doe Photography',
      priority: 'medium',
      category: 'vendor'
    },
    {
      id: '2',
      type: 'booking_created',
      description: 'High-value wedding booking created for June 2025',
      timestamp: '5 minutes ago',
      status: 'success',
      userName: 'Sarah & Michael',
      amount: '₱125,000',
      priority: 'high',
      category: 'booking'
    },
    {
      id: '3',
      type: 'payment_processed',
      description: 'Payment processed successfully for booking #WB-2024-1234',
      timestamp: '15 minutes ago',
      status: 'success',
      amount: '₱45,000',
      category: 'payment'
    },
    {
      id: '4',
      type: 'user_signup',
      description: '5 new users registered in the last hour',
      timestamp: '1 hour ago',
      status: 'success',
      category: 'user'
    },
    {
      id: '5',
      type: 'system_alert',
      description: 'Server performance optimized - 30% faster response times',
      timestamp: '2 hours ago',
      status: 'success',
      priority: 'low',
      category: 'system'
    },
    {
      id: '6',
      type: 'support_ticket',
      description: 'Critical support ticket resolved - vendor payment issue',
      timestamp: '3 hours ago',
      status: 'warning',
      priority: 'high',
      category: 'system'
    }
  ]);

  // System Alerts
  const [alerts, setAlerts] = useState<AdminAlert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Server Load',
      description: 'Server CPU usage at 85%. Consider scaling resources.',
      timestamp: '10 minutes ago',
      priority: 'high',
      category: 'performance',
      actionRequired: true
    },
    {
      id: '2',
      type: 'info',
      title: 'New Feature Deploy',
      description: 'Enhanced messaging system deployed successfully.',
      timestamp: '1 hour ago',
      priority: 'medium',
      category: 'technical'
    },
    {
      id: '3',
      type: 'success',
      title: 'Monthly Revenue Target',
      description: 'Monthly revenue target exceeded by 22%!',
      timestamp: '2 hours ago',
      priority: 'low',
      category: 'business'
    }
  ]);

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'Add New Vendor',
      icon: Plus,
      onClick: () => console.log('Add vendor'),
      color: 'bg-blue-500',
      description: 'Manually add and verify a new vendor'
    },
    {
      id: '2',
      label: 'Generate Report',
      icon: Download,
      onClick: () => console.log('Generate report'),
      color: 'bg-green-500',
      description: 'Download comprehensive analytics report'
    },
    {
      id: '3',
      label: 'System Health',
      icon: Activity,
      onClick: () => console.log('System health'),
      color: 'bg-purple-500',
      description: 'Check detailed system health metrics'
    },
    {
      id: '4',
      label: 'Broadcast Alert',
      icon: Bell,
      onClick: () => console.log('Broadcast'),
      color: 'bg-orange-500',
      description: 'Send notification to all users'
    }
  ];

  // Filter activities based on search and category
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = searchTerm === '' || 
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedActivityCategory === 'all' || activity.category === selectedActivityCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [activities, searchTerm, selectedActivityCategory]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      // Simulate metric updates
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.label === 'Response Time' ? 
          `${(Math.random() * 2 + 0.8).toFixed(1)}s` : 
          metric.value
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setLoading(false);
  };

  const handleViewActivityDetails = (id: string) => {
    console.log('View activity details:', id);
    // Navigate to detailed view
  };

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,.1)_10px,rgba(0,0,0,.1)_11px)] opacity-5" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Last updated: {lastUpdated.toLocaleTimeString()} • 
                <span className="text-green-600 ml-1">All systems operational</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <select
                title="Select time range"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 disabled:bg-gray-400 transition-colors"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className="p-4 bg-white/95 backdrop-blur-xl rounded-xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 group text-left"
                >
                  <div className={`p-3 rounded-xl ${action.color} bg-opacity-10 mb-3 w-fit`}>
                    <IconComponent className={`h-5 w-5 ${action.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{action.label}</h4>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{filteredActivities.length} items</span>
              </div>
            </div>

            {/* Activity Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                />
              </div>
              <select
                title="Filter activities by category"
                value={selectedActivityCategory}
                onChange={(e) => setSelectedActivityCategory(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
              >
                <option value="all">All Categories</option>
                <option value="user">User</option>
                <option value="vendor">Vendor</option>
                <option value="booking">Booking</option>
                <option value="payment">Payment</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Activity List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onViewDetails={handleViewActivityDetails}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No activities found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>

          {/* System Alerts Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {alerts.filter(a => !a.resolved).length} active
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onResolve={handleResolveAlert}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No system alerts at this time.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
