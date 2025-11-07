import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Store,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Heart,
} from 'lucide-react';
import { AdminLayout } from '../shared';

interface PlatformStats {
  totalUsers: number;
  totalVendors: number;
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  pendingVerifications: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalVendors: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingVerifications: 0,
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStats({
        totalUsers: 1247,
        totalVendors: 423,
        totalBookings: 2891,
        totalRevenue: 13386060,
        activeUsers: 892,
        pendingVerifications: 15,
      });

      setRecentActivities([
        {
          id: '1',
          type: 'user_signup',
          description: 'New user registration: john.doe@example.com',
          timestamp: '2 minutes ago',
          status: 'success',
        },
        {
          id: '2',
          type: 'vendor_verification',
          description: 'Vendor verification pending: Perfect Weddings Photography',
          timestamp: '15 minutes ago',
          status: 'warning',
        },
        {
          id: '3',
          type: 'booking_created',
          description: 'New booking: BK-2024-001234',
          timestamp: '1 hour ago',
          status: 'success',
        },
        {
          id: '4',
          type: 'payment_received',
          description: 'Payment received: ₱67,500',
          timestamp: '2 hours ago',
          status: 'success',
        },
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  const activityColumns = [
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => {
        const typeLabels: Record<string, string> = {
          user_signup: 'User Signup',
          vendor_verification: 'Vendor Verification',
          booking_created: 'Booking Created',
          payment_received: 'Payment Received',
        };
        return <span className="font-medium">{typeLabels[value] || value}</span>;
      },
    },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusConfig: Record<string, { variant: any; label: string }> = {
          success: { variant: 'success' as const, label: 'Success' },
          warning: { variant: 'warning' as const, label: 'Pending' },
          error: { variant: 'error' as const, label: 'Error' },
          info: { variant: 'info' as const, label: 'Info' },
        };
        const config = statusConfig[value] || statusConfig.info;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'timestamp',
      label: 'Time',
    },
  ];

  return (
    <AdminLayout>
      {/* Modern Glassmorphism Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 rounded-3xl p-8 border border-pink-100/50 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Dashboard Overview
              </h1>
              <p className="text-slate-600 text-lg">
                Welcome back! Here's what's happening with your platform today.
              </p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Heart className="h-16 w-16 text-pink-500 fill-pink-200" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Alert Banner with Glassmorphism */}
      {stats.pendingVerifications > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 backdrop-blur-xl rounded-2xl p-6 border border-yellow-200/50 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-1">Pending Verifications</h3>
              <p className="text-yellow-700">
                You have {stats.pendingVerifications} vendor verifications pending review.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Statistics Cards - Modern Glassmorphism Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl rounded-3xl p-6 border border-blue-100/50 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">+12.3%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-slate-900">
              {loading ? '...' : stats.totalUsers.toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* Total Vendors Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group relative bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-xl rounded-3xl p-6 border border-purple-100/50 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-2xl group-hover:scale-110 transition-transform">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">+8.1%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">Total Vendors</p>
            <p className="text-3xl font-bold text-slate-900">
              {loading ? '...' : stats.totalVendors.toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* Total Bookings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group relative bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-xl rounded-3xl p-6 border border-green-100/50 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-emerald-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-2xl group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">+22.4%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-slate-900">
              {loading ? '...' : stats.totalBookings.toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* Total Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 backdrop-blur-xl rounded-3xl p-6 border border-emerald-100/50 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-teal-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">+15.3%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900">
              {loading ? '...' : `₱${(stats.totalRevenue / 1000000).toFixed(2)}M`}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Secondary Stats - Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Active Users */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-white to-green-50 backdrop-blur-xl rounded-2xl p-6 border border-green-100/50 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-100 rounded-2xl">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">Active Users</p>
              <p className="text-3xl font-bold text-slate-900">
                {loading ? '...' : stats.activeUsers.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last 24 hours
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pending Reviews */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-white to-yellow-50 backdrop-blur-xl rounded-2xl p-6 border border-yellow-100/50 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-yellow-100 rounded-2xl">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">Pending Reviews</p>
              <p className="text-3xl font-bold text-slate-900">
                {loading ? '...' : stats.pendingVerifications}
              </p>
              <p className="text-xs text-slate-500 mt-1">Requires attention</p>
            </div>
          </div>
        </motion.div>

        {/* Growth Rate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-white to-blue-50 backdrop-blur-xl rounded-2xl p-6 border border-blue-100/50 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-2xl">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">Growth Rate</p>
              <p className="text-3xl font-bold text-slate-900">+15.3%</p>
              <p className="text-xs text-slate-500 mt-1">vs. last month</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activities - Modern Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Recent Activities</h2>
              <p className="text-sm text-slate-600 mt-1">Latest platform events and updates</p>
            </div>
            <div className="px-4 py-2 bg-white/80 rounded-xl border border-pink-200 text-sm font-medium text-slate-700">
              {recentActivities.length} activities
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white hover:from-pink-50 hover:to-purple-50 border border-slate-200/50 transition-all hover:shadow-md"
              >
                <div className={`p-3 rounded-xl ${
                  activity.status === 'success' ? 'bg-green-100' :
                  activity.status === 'warning' ? 'bg-yellow-100' :
                  activity.status === 'error' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  <CheckCircle className={`h-5 w-5 ${
                    activity.status === 'success' ? 'text-green-600' :
                    activity.status === 'warning' ? 'text-yellow-600' :
                    activity.status === 'error' ? 'text-red-600' :
                    'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{activity.description}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  activity.status === 'success' ? 'bg-green-100 text-green-700' :
                  activity.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  activity.status === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {activity.status === 'success' ? 'Success' :
                   activity.status === 'warning' ? 'Pending' :
                   activity.status === 'error' ? 'Error' : 'Info'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};
