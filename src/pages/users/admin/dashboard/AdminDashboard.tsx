import React, { useState, useEffect } from 'react';
import {
  Users,
  Store,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  AdminLayout,
  StatCard,
  DataTable,
  Badge,
  Button,
  Alert,
  Tabs,
} from '../shared';

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
    <AdminLayout
      title="Dashboard"
      subtitle="Platform overview and key metrics"
      actions={
        <>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button variant="primary" size="sm">
            View Analytics
          </Button>
        </>
      }
    >
      {/* Alert Banner */}
      {stats.pendingVerifications > 0 && (
        <Alert
          type="warning"
          title="Pending Verifications"
          message={`You have ${stats.pendingVerifications} vendor verifications pending review.`}
          dismissible
          onDismiss={() => {}}
          className="mb-6"
        />
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={{ value: '+12.3%', trend: 'up' }}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          loading={loading}
        />
        <StatCard
          title="Total Vendors"
          value={stats.totalVendors.toLocaleString()}
          change={{ value: '+8.1%', trend: 'up' }}
          icon={Store}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
          loading={loading}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          change={{ value: '+22.4%', trend: 'up' }}
          icon={Calendar}
          iconColor="text-green-600"
          iconBg="bg-green-100"
          loading={loading}
        />
        <StatCard
          title="Total Revenue"
          value={`₱${(stats.totalRevenue / 1000000).toFixed(2)}M`}
          change={{ value: '+15.3%', trend: 'up' }}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? '...' : stats.activeUsers.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">Last 24 hours</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Pending Reviews</p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? '...' : stats.pendingVerifications}
              </p>
              <p className="text-xs text-slate-500 mt-1">Requires attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Growth Rate</p>
              <p className="text-2xl font-bold text-slate-900">+15.3%</p>
              <p className="text-xs text-slate-500 mt-1">vs. last month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <Tabs
            tabs={[
              { key: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4" /> },
              {
                key: 'activities',
                label: 'Recent Activities',
                icon: <AlertCircle className="h-4 w-4" />,
                count: recentActivities.length,
              },
              {
                key: 'alerts',
                label: 'System Alerts',
                icon: <CheckCircle className="h-4 w-4" />,
                count: 2,
              },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Platform Overview
              </h3>
              <p className="text-slate-600">
                Your platform is performing well with steady growth across all metrics.
                Recent user engagement is up 12.3% compared to last month.
              </p>
            </div>
          )}

          {activeTab === 'activities' && (
            <DataTable
              columns={activityColumns}
              data={recentActivities}
              loading={loading}
              searchable={true}
              emptyMessage="No recent activities"
            />
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <Alert
                type="info"
                title="System Update"
                message="A new version of the admin panel is available."
              />
              <Alert
                type="success"
                title="Backup Complete"
                message="Daily database backup completed successfully."
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
