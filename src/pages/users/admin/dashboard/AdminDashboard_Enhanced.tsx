import React, { useState } from 'react';
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
  ArrowDownRight,
  Search,
  Filter,
  RefreshCcw,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Calendar as CalendarIcon,
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

interface Metric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  target?: number;
  description?: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error' | 'warning';
  priority?: 'high' | 'medium' | 'low';
  category?: string;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
  category?: 'performance' | 'security' | 'business' | 'technical';
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  count?: number;
  urgent?: boolean;
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

const StatCard: React.FC<{
  metric: Metric;
  onClick?: () => void;
}> = ({ metric, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const TrendIcon = metric.trend === 'up' ? ArrowUpRight : 
                   metric.trend === 'down' ? ArrowDownRight : Activity;
  
  const trendColor = metric.trend === 'up' ? 'text-green-600' :
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600';

  const progress = metric.target ? 
    (parseInt(metric.value.replace(/[^0-9]/g, '')) / metric.target) * 100 : undefined;

  return (
    <div 
      className={`bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${metric.color} group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
          <metric.icon className="h-6 w-6 text-white relative z-10" />
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold bg-gray-50 ${trendColor}`}>
          <TrendIcon className="h-4 w-4" />
          <span>{metric.change}</span>
        </div>
      </div>
      
      <h3 className="text-gray-600 text-sm font-medium mb-1">{metric.label}</h3>
      <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
        {metric.value}
      </p>
      
      {metric.description && (
        <p className="text-xs text-gray-500 mb-2">{metric.description}</p>
      )}
      
      {progress !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress to target</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                progress >= 100 ? 'bg-green-500' : progress >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {onClick && (
        <div className={`mt-3 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center text-blue-600 text-sm font-medium">
            <span>View details</span>
            <ChevronRight className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => {
  const statusColors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-orange-100 text-orange-800 border-orange-200'
  };

  const typeIcons = {
    user_signup: Users,
    vendor_approval: Store,
    booking_created: Calendar,
    payment_processed: DollarSign,
    review_posted: Star,
    system_update: Settings,
    default: Activity
  };

  const IconComponent = typeIcons[activity.type as keyof typeof typeIcons] || typeIcons.default;
  const priorityIndicator = activity.priority === 'high' ? '🔴' : activity.priority === 'medium' ? '🟡' : '🟢';

  return (
    <div className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/40 hover:bg-white/90 transition-all duration-200 group">
      <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
        <IconComponent className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
          {activity.priority && (
            <span className="text-xs">{priorityIndicator}</span>
          )}
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <p className="text-xs text-gray-500">{activity.timestamp}</p>
          {activity.category && (
            <span className="text-xs text-gray-400">· {activity.category}</span>
          )}
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[activity.status]}`}>
        {activity.status}
      </span>
    </div>
  );
};

const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
  const alertStyles = {
    warning: 'border-yellow-200 bg-yellow-50/80 text-yellow-800',
    error: 'border-red-200 bg-red-50/80 text-red-800',
    info: 'border-blue-200 bg-blue-50/80 text-blue-800',
    success: 'border-green-200 bg-green-50/80 text-green-800'
  };

  const icons = {
    warning: AlertTriangle,
    error: AlertTriangle,
    info: Activity,
    success: Award
  };

  const IconComponent = icons[alert.type];

  return (
    <div className={`p-4 rounded-2xl border backdrop-blur-sm ${alertStyles[alert.type]} group hover:shadow-lg transition-all duration-200`}>
      <div className="flex items-start space-x-3">
        <IconComponent className="h-5 w-5 mt-0.5 group-hover:scale-110 transition-transform duration-200" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{alert.title}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              alert.priority === 'high' ? 'bg-red-100 text-red-800' :
              alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {alert.priority}
            </span>
          </div>
          <p className="text-xs mt-1 opacity-90">{alert.description}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs opacity-70">{alert.timestamp}</p>
            {alert.actionRequired && (
              <button className="text-xs font-medium hover:underline">
                Take action
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 2847,
    onlineVendors: 156,
    liveBookings: 23
  });

  const timeRanges: TimeRange[] = [
    { label: 'Last 7 days', value: '7d', days: 7 },
    { label: 'Last 30 days', value: '30d', days: 30 },
    { label: 'Last 90 days', value: '90d', days: 90 },
    { label: 'Last year', value: '1y', days: 365 }
  ];

  // Enhanced metrics with targets and descriptions
  const metrics: Metric[] = [
    {
      label: 'Total Users',
      value: realTimeData.activeUsers.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      target: 3000,
      description: 'Active registered users'
    },
    {
      label: 'Active Vendors',
      value: realTimeData.onlineVendors.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: Store,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      target: 200,
      description: 'Verified and active vendors'
    },
    {
      label: 'Monthly Bookings',
      value: '1,234',
      change: '+23.1%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-gradient-to-br from-violet-500 to-violet-600',
      target: 1500,
      description: 'Successful bookings this month'
    },
    {
      label: 'Platform Revenue',
      value: '$127,500',
      change: '+18.7%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-gradient-to-br from-rose-500 to-rose-600',
      description: 'Total commission revenue'
    },
    {
      label: 'Avg. Rating',
      value: '4.8',
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'bg-gradient-to-br from-amber-500 to-amber-600',
      description: 'Platform average rating'
    },
    {
      label: 'Response Time',
      value: '2.3h',
      change: '-15%',
      trend: 'up',
      icon: Clock,
      color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      description: 'Average vendor response time'
    }
  ];

  const activities: Activity[] = [
    {
      id: '1',
      type: 'user_signup',
      description: 'Sarah Johnson signed up as a couple',
      timestamp: '2 minutes ago',
      status: 'success',
      priority: 'low',
      category: 'User Management'
    },
    {
      id: '2',
      type: 'vendor_approval',
      description: 'Elite Photography Studio approved',
      timestamp: '15 minutes ago',
      status: 'success',
      priority: 'medium',
      category: 'Vendor Management'
    },
    {
      id: '3',
      type: 'booking_created',
      description: 'Wedding booking for June 2025 created',
      timestamp: '32 minutes ago',
      status: 'success',
      priority: 'high',
      category: 'Bookings'
    },
    {
      id: '4',
      type: 'payment_processed',
      description: 'Payment of $2,500 processed',
      timestamp: '1 hour ago',
      status: 'success',
      priority: 'high',
      category: 'Payments'
    },
    {
      id: '5',
      type: 'vendor_approval',
      description: 'Luxury Catering Co. pending review',
      timestamp: '2 hours ago',
      status: 'pending',
      priority: 'medium',
      category: 'Vendor Management'
    },
    {
      id: '6',
      type: 'system_update',
      description: 'Security patch deployed successfully',
      timestamp: '3 hours ago',
      status: 'success',
      priority: 'low',
      category: 'System'
    }
  ];

  const alerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'High Server Load',
      description: 'API response time increased by 15% in the last hour',
      timestamp: '10 minutes ago',
      priority: 'high',
      actionRequired: true,
      category: 'performance'
    },
    {
      id: '2',
      type: 'info',
      title: 'New Feature Request',
      description: '5 vendors requested calendar integration feature',
      timestamp: '2 hours ago',
      priority: 'medium',
      category: 'business'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Pending Vendor Reviews',
      description: '12 vendor applications awaiting approval',
      timestamp: '4 hours ago',
      priority: 'medium',
      actionRequired: true,
      category: 'business'
    },
    {
      id: '4',
      type: 'success',
      title: 'Backup Completed',
      description: 'Daily database backup completed successfully',
      timestamp: '6 hours ago',
      priority: 'low',
      category: 'technical'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500',
      count: 2847
    },
    {
      title: 'Vendor Approvals',
      description: 'Review pending vendor applications',
      icon: Store,
      href: '/admin/vendors',
      color: 'bg-emerald-500',
      count: 12,
      urgent: true
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
    },
    {
      title: 'System Health',
      description: 'Monitor server performance',
      icon: Activity,
      href: '/admin/system',
      color: 'bg-cyan-500'
    },
    {
      title: 'Settings',
      description: 'Platform configuration',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500'
    }
  ];

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        onlineVendors: prev.onlineVendors + Math.floor(Math.random() * 2) - 1,
        liveBookings: Math.max(0, prev.liveBookings + Math.floor(Math.random() * 5) - 2)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleMetricClick = (label: string) => {
    console.log(`Navigate to ${label} details`);
    // Add navigation logic here
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchTerm === '' || 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      activity.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(activities.map(a => a.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Enhanced Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-blue-200/50 shadow-lg">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600">Wedding Bazaar</h1>
                <p className="text-sm text-gray-600">Admin Portal</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              title="Select time range"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-white/90 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
            
            <button
              title="Refresh data"
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCcw className={`h-5 w-5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              title="Notifications"
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 relative"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <nav className="hidden md:flex space-x-1">
              {['Dashboard', 'Users', 'Vendors', 'Analytics'].map(item => (
                <a
                  key={item}
                  href={`/admin/${item.toLowerCase()}`}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-lg">
                Platform overview and management controls
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Live data · {realTimeData.liveBookings} active bookings</span>
                </div>
                <button 
                  title="Export report"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Platform Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric) => (
              <StatCard
                key={metric.label}
                metric={metric}
                onClick={() => handleMetricClick(metric.label)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  <div className="flex items-center space-x-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search activities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* Category Filter */}
                    <select
                      title="Filter by category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category?.toLowerCase()}>{category}</option>
                      ))}
                    </select>
                    
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center group">
                      View All
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                  {filteredActivities.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No activities found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts & Quick Actions */}
            <div className="space-y-6">
              {/* System Alerts */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">System Alerts</h2>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    {alerts.filter(a => a.actionRequired).length} urgent
                  </span>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {alerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-6">
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
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 text-sm">{action.title}</p>
                          {action.urgent && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs">{action.description}</p>
                      </div>
                      {action.count && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {action.count}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
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
