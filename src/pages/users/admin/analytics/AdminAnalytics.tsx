import React, { useState } from 'react';
import { AdminHeader } from '../../../../shared/components/layout/AdminHeader';
import { 
  TrendingUp, 
  Users, 
  Store, 
  DollarSign, 
  Calendar,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

// interface ChartData {
//   period: string;
//   revenue: number;
//   users: number;
//   bookings: number;
// }

export const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'users' | 'bookings'>('revenue');

  const metrics: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: '₱13,386,060',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'New Users',
      value: '1,247',
      change: '+8.1%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Vendors',
      value: '423',
      change: '+12.7%',
      trend: 'up',
      icon: Store,
      color: 'from-purple-500 to-violet-500'
    },
    {
      title: 'Total Bookings',
      value: '2,891',
      change: '+22.4%',
      trend: 'up',
      icon: Calendar,
      color: 'from-rose-500 to-pink-500'
    },
    {
      title: 'Conversion Rate',
      value: '3.8%',
      change: '+0.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-orange-500 to-yellow-500'
    },
    {
      title: 'Avg. Booking Value',
      value: '₱67,338',
      change: '-2.1%',
      trend: 'down',
      icon: BarChart3,
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  // Sample chart data for future implementation
  // const chartData: ChartData[] = [
  //   { period: 'Week 1', revenue: 45000, users: 245, bookings: 123 },
  //   { period: 'Week 2', revenue: 52000, users: 289, bookings: 156 },
  //   { period: 'Week 3', revenue: 48000, users: 234, bookings: 134 },
  //   { period: 'Week 4', revenue: 61000, users: 312, bookings: 178 }
  // ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/30 via-pink-50/20 to-white">
      <AdminHeader />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 bg-clip-text text-transparent mb-2">
                  Analytics & Reports
                </h1>
                <p className="text-gray-600 text-lg">
                  Comprehensive platform analytics and business insights
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="px-4 py-2 border border-gray-200 rounded-xl bg-white/90 backdrop-blur-xl"
                  aria-label="Time Range"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric, index) => {
              const TrendIcon = metric.trend === 'up' ? ArrowUpRight : ArrowDownRight;
              const Icon = metric.icon;
              
              return (
                <div key={index} className="group">
                  <div className="p-6 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn(
                        "p-3 rounded-2xl bg-gradient-to-r",
                        metric.color,
                        "group-hover:scale-110 transition-transform duration-300"
                      )}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className={cn(
                        "flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-semibold",
                        metric.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      )}>
                        <TrendIcon className="h-3 w-3" />
                        <span>{metric.change}</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className="text-gray-600 font-medium">{metric.title}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Chart */}
            <div className="p-8 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Revenue Trends</h3>
                <div className="flex space-x-2">
                  {(['revenue', 'users', 'bookings'] as const).map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                        selectedMetric === metric
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-blue-600"
                      )}
                    >
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Simple Chart Placeholder */}
              <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-gray-600">Revenue Chart Visualization</p>
                  <p className="text-sm text-gray-500">Chart integration coming soon</p>
                </div>
              </div>
            </div>

            {/* User Engagement */}
            <div className="p-8 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">User Engagement</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold">8,429</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-[75%]"></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Session Duration</span>
                  <span className="font-semibold">12m 34s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-[82%]"></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bounce Rate</span>
                  <span className="font-semibold">24.3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full w-[24%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="p-8 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
              
              <div className="space-y-4">
                {[
                  { action: 'New vendor registration', time: '2 minutes ago', type: 'vendor' },
                  { action: 'Large booking completed', time: '15 minutes ago', type: 'booking' },
                  { action: 'Payment processed', time: '1 hour ago', type: 'payment' },
                  { action: 'User feedback submitted', time: '2 hours ago', type: 'feedback' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={cn(
                      "p-2 rounded-lg",
                      activity.type === 'vendor' && "bg-purple-100 text-purple-600",
                      activity.type === 'booking' && "bg-green-100 text-green-600",
                      activity.type === 'payment' && "bg-blue-100 text-blue-600",
                      activity.type === 'feedback' && "bg-orange-100 text-orange-600"
                    )}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Vendors */}
            <div className="p-8 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing Vendors</h3>
              
              <div className="space-y-4">
                {[
                  { name: 'Elite Photography', revenue: '₱672,300', bookings: 23 },
                  { name: 'Perfect Venues', revenue: '₱484,380', bookings: 18 },
                  { name: 'Gourmet Catering', revenue: '₱390,420', bookings: 15 },
                  { name: 'Dream Planners', revenue: '₱372,060', bookings: 12 }
                ].map((vendor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{vendor.name}</p>
                      <p className="text-sm text-gray-500">{vendor.bookings} bookings</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{vendor.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
