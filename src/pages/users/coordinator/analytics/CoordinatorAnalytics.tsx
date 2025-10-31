import React, { useState } from 'react';
import { CoordinatorHeader } from '../layout/CoordinatorHeader';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface AnalyticsMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalWeddings: number;
  weddingsGrowth: number;
  activeClients: number;
  clientsGrowth: number;
  avgBookingValue: number;
  bookingValueGrowth: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  clients: number;
}

interface VendorPerformance {
  name: string;
  category: string;
  bookings: number;
  revenue: number;
  rating: number;
}

interface ClientAcquisition {
  source: string;
  count: number;
  percentage: number;
  [key: string]: string | number; // Index signature for recharts
}

export const CoordinatorAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock analytics data - Replace with API calls later
  const metrics: AnalyticsMetrics = {
    totalRevenue: 2450000,
    revenueGrowth: 23.5,
    totalWeddings: 48,
    weddingsGrowth: 15.2,
    activeClients: 127,
    clientsGrowth: 18.7,
    avgBookingValue: 51041,
    bookingValueGrowth: 7.3
  };

  const revenueData: RevenueData[] = [
    { month: 'Jan', revenue: 180000, bookings: 3, clients: 8 },
    { month: 'Feb', revenue: 195000, bookings: 4, clients: 12 },
    { month: 'Mar', revenue: 225000, bookings: 5, clients: 15 },
    { month: 'Apr', revenue: 210000, bookings: 4, clients: 11 },
    { month: 'May', revenue: 245000, bookings: 5, clients: 18 },
    { month: 'Jun', revenue: 280000, bookings: 6, clients: 22 },
    { month: 'Jul', revenue: 310000, bookings: 7, clients: 25 },
    { month: 'Aug', revenue: 295000, bookings: 6, clients: 20 },
    { month: 'Sep', revenue: 265000, bookings: 5, clients: 16 },
    { month: 'Oct', revenue: 245000, bookings: 4, clients: 14 }
  ];

  const vendorPerformance: VendorPerformance[] = [
    { name: 'Elite Photography', category: 'Photography', bookings: 15, revenue: 450000, rating: 4.9 },
    { name: 'Grand Ballroom', category: 'Venue', bookings: 12, revenue: 720000, rating: 4.8 },
    { name: 'Gourmet Catering Co.', category: 'Catering', bookings: 18, revenue: 540000, rating: 4.7 },
    { name: 'DJ Premium Sound', category: 'Music', bookings: 14, revenue: 210000, rating: 4.8 },
    { name: 'Bloom Florists', category: 'Flowers', bookings: 16, revenue: 240000, rating: 4.9 }
  ];

  const clientAcquisition: ClientAcquisition[] = [
    { source: 'Referrals', count: 45, percentage: 35.4 },
    { source: 'Social Media', count: 38, percentage: 29.9 },
    { source: 'Website', count: 28, percentage: 22.0 },
    { source: 'Events', count: 16, percentage: 12.6 }
  ];

  const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  const formatCurrency = (value: number) => {
    return `₱${(value / 1000).toFixed(0)}K`;
  };

  const MetricCard: React.FC<{
    title: string;
    value: string;
    growth: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, growth, icon, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
          growth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(growth)}%
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <CoordinatorHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Track your business performance and insights</p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-md">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(metrics.totalRevenue)}
            growth={metrics.revenueGrowth}
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            color="bg-green-500"
          />
          <MetricCard
            title="Total Weddings"
            value={metrics.totalWeddings.toString()}
            growth={metrics.weddingsGrowth}
            icon={<Calendar className="w-6 h-6 text-pink-600" />}
            color="bg-pink-500"
          />
          <MetricCard
            title="Active Clients"
            value={metrics.activeClients.toString()}
            growth={metrics.clientsGrowth}
            icon={<Users className="w-6 h-6 text-purple-600" />}
            color="bg-purple-500"
          />
          <MetricCard
            title="Avg Booking Value"
            value={formatCurrency(metrics.avgBookingValue)}
            growth={metrics.bookingValueGrowth}
            icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
            color="bg-blue-500"
          />
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#ec4899" 
                strokeWidth={3}
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vendor Performance & Client Acquisition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vendor Performance Table */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Top Vendors</h2>
              <Award className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-4">
              {vendorPerformance.map((vendor, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                    <p className="text-sm text-gray-600">{vendor.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(vendor.revenue)}</p>
                    <p className="text-sm text-gray-600">{vendor.bookings} bookings</p>
                  </div>
                  <div className="ml-4 flex items-center gap-1 text-yellow-500">
                    <span className="text-sm font-semibold">{vendor.rating}</span>
                    <span className="text-lg">★</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Acquisition Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Client Acquisition</h2>
              <PieChart className="w-6 h-6 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={clientAcquisition}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {clientAcquisition.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value} clients`, name]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {clientAcquisition.map((source, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{source.source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Bookings & Clients Trend</h2>
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Bar dataKey="bookings" fill="#ec4899" name="Bookings" radius={[8, 8, 0, 0]} />
              <Bar dataKey="clients" fill="#8b5cf6" name="Clients" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Goals & Targets */}
        <div className="mt-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <Target className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Monthly Goals</h2>
              <p className="text-pink-100">Track your progress towards your targets</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-pink-100 text-sm mb-2">Revenue Target</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold">₱300K</p>
                <p className="text-sm">82% achieved</p>
              </div>
              <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-pink-100 text-sm mb-2">Weddings Target</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold">8</p>
                <p className="text-sm">75% achieved</p>
              </div>
              <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-pink-100 text-sm mb-2">New Clients Target</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold">25</p>
                <p className="text-sm">88% achieved</p>
              </div>
              <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorAnalytics;
