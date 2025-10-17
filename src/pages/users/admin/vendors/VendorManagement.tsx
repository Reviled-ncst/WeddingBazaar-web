import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Package
} from 'lucide-react';
import { AdminLayout, DataTable, StatCard, Badge, Button, Modal } from '../shared';

interface Vendor {
  id: string;
  business_name: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  rating: number;
  total_reviews: number;
  total_bookings: number;
  revenue: number;
  status: 'active' | 'pending' | 'suspended';
  verification_status: 'verified' | 'pending' | 'rejected';
  joined_date: string;
  last_active: string;
}

interface Stats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  totalRevenue: number;
  avgRating: number;
}

export const VendorManagement: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    totalRevenue: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/vendors`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVendors(data.vendors || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (vendorId: string, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/vendors/${vendorId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        loadVendors();
      }
    } catch (error) {
      console.error('Error updating vendor status:', error);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      key: 'business_name',
      label: 'Business Name',
      render: (vendor: Vendor) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {vendor.business_name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-slate-900">{vendor.business_name}</div>
            <div className="text-sm text-slate-500">{vendor.category}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (vendor: Vendor) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="w-4 h-4" />
            {vendor.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4" />
            {vendor.phone}
          </div>
        </div>
      )
    },
    {
      key: 'performance',
      label: 'Performance',
      render: (vendor: Vendor) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">{vendor.rating.toFixed(1)}</span>
            <span className="text-xs text-slate-500">({vendor.total_reviews} reviews)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Package className="w-4 h-4" />
            {vendor.total_bookings} bookings
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign className="w-4 h-4" />
            ₱{vendor.revenue.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (vendor: Vendor) => (
        <div className="space-y-2">
          <Badge variant={vendor.status as any}>
            {vendor.status}
          </Badge>
          <Badge variant={vendor.verification_status === 'verified' ? 'success' : 'warning'}>
            {vendor.verification_status}
          </Badge>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (vendor: Vendor) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewVendor(vendor)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* Edit vendor */}}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout
      title="Vendor Management"
      subtitle="Manage wedding service vendors"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Vendor Management' }
      ]}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Vendors"
          value={stats.total.toString()}
          icon={Store}
        />
        <StatCard
          title="Active Vendors"
          value={stats.active.toString()}
          icon={CheckCircle}
          iconColor="text-green-600"
        />
        <StatCard
          title="Total Revenue"
          value={`₱${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Avg Rating"
          value={stats.avgRating.toFixed(1)}
          icon={Star}
          iconColor="text-yellow-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter vendors by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <DataTable
        columns={columns}
        data={filteredVendors}
        loading={loading}
        emptyMessage="No vendors found"
      />

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Vendor Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Vendor Info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                {selectedVendor.business_name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">{selectedVendor.business_name}</h3>
                <p className="text-slate-600">{selectedVendor.category}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={selectedVendor.status as any}>{selectedVendor.status}</Badge>
                  <Badge variant={selectedVendor.verification_status === 'verified' ? 'success' : 'warning'}>
                    {selectedVendor.verification_status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  {selectedVendor.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  {selectedVendor.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {selectedVendor.location}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  Joined: {new Date(selectedVendor.joined_date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  Last Active: {new Date(selectedVendor.last_active).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                  <Star className="w-5 h-5" />
                  <span className="text-xl font-bold">{selectedVendor.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-slate-600">{selectedVendor.total_reviews} Reviews</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Package className="w-5 h-5" />
                  <span className="text-xl font-bold">{selectedVendor.total_bookings}</span>
                </div>
                <p className="text-sm text-slate-600">Bookings</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-xl font-bold">₱{(selectedVendor.revenue / 1000).toFixed(1)}k</span>
                </div>
                <p className="text-sm text-slate-600">Revenue</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {selectedVendor.status === 'pending' && (
                <>
                  <Button
                    variant="success"
                    onClick={() => handleUpdateStatus(selectedVendor.id, 'active')}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleUpdateStatus(selectedVendor.id, 'suspended')}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
              {selectedVendor.status === 'active' && (
                <Button
                  variant="warning"
                  onClick={() => handleUpdateStatus(selectedVendor.id, 'suspended')}
                  className="flex-1"
                >
                  Suspend Vendor
                </Button>
              )}
              {selectedVendor.status === 'suspended' && (
                <Button
                  variant="success"
                  onClick={() => handleUpdateStatus(selectedVendor.id, 'active')}
                  className="flex-1"
                >
                  Reactivate Vendor
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};
