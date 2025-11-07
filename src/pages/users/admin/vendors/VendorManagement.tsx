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
import { AdminLayout, DataTable, Badge, Button, Modal } from '../shared';

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
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('jwt_token')}`
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
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('jwt_token')}`
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
      {/* Stats Cards - Wedding Theme Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Vendors Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                All
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</h3>
            <p className="text-sm text-gray-600 font-medium">Total Vendors</p>
          </div>
        </div>

        {/* Active Vendors Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-200/40 to-emerald-200/40 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Active
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.active}</h3>
            <p className="text-sm text-gray-600 font-medium">Active Vendors</p>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                PHP
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">₱{stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
          </div>
        </div>

        {/* Avg Rating Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/40 to-amber-200/40 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                Rating
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.avgRating.toFixed(1)}</h3>
            <p className="text-sm text-gray-600 font-medium">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Filters - Wedding Theme Glassmorphism */}
      <div className="relative group mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-2xl blur-xl"></div>
        <div className="relative backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/60 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                aria-label="Filter vendors by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <button className="px-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-600" />
                <span className="hidden md:inline text-gray-700">Filters</span>
              </button>
            </div>
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
