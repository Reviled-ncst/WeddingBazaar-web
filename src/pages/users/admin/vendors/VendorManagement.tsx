import React, { useState, useMemo } from 'react'; // useEffect removed - not currently used
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Star,
  DollarSign,
  Calendar,
  MapPin,
  Eye,
  Edit,
  Ban,
  RefreshCcw,
  Plus,
  Shield
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  category: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'active';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  rating: number;
  reviewCount: number;
  joinDate: string;
  lastActive: string;
  totalBookings: number;
  totalRevenue: number;
  commissionRate: number;
  documents: {
    businessLicense: string;
    insurance: string;
    portfolio: string[];
  };
  performance: {
    responseTime: string;
    completionRate: number;
    customerSatisfaction: number;
  };
}

interface VendorFilters {
  status: string;
  category: string;
  verificationStatus: string;
  location: string;
  rating: number;
}

// Sample vendor data
const sampleVendors: Vendor[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@perfectweddings.com',
    phone: '+63 917 123 4567',
    businessName: 'Perfect Weddings Photography',
    category: 'Photography',
    location: 'Manila, Philippines',
    status: 'pending',
    verificationStatus: 'pending',
    rating: 4.8,
    reviewCount: 127,
    joinDate: '2024-09-01',
    lastActive: '2024-09-19',
    totalBookings: 89,
    totalRevenue: 450000,
    commissionRate: 15,
    documents: {
      businessLicense: 'license_001.pdf',
      insurance: 'insurance_001.pdf',
      portfolio: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg']
    },
    performance: {
      responseTime: '2 hours',
      completionRate: 98,
      customerSatisfaction: 4.8
    }
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah@eliteplanning.com',
    phone: '+63 917 234 5678',
    businessName: 'Elite Wedding Planning',
    category: 'Wedding Planning',
    location: 'Makati, Philippines',
    status: 'active',
    verificationStatus: 'verified',
    rating: 4.9,
    reviewCount: 95,
    joinDate: '2024-06-15',
    lastActive: '2024-09-20',
    totalBookings: 156,
    totalRevenue: 1200000,
    commissionRate: 12,
    documents: {
      businessLicense: 'license_002.pdf',
      insurance: 'insurance_002.pdf',
      portfolio: ['plan1.jpg', 'plan2.jpg']
    },
    performance: {
      responseTime: '1 hour',
      completionRate: 100,
      customerSatisfaction: 4.9
    }
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@harmonysounds.com',
    phone: '+63 917 345 6789',
    businessName: 'Harmony Sound Systems',
    category: 'DJ',
    location: 'Quezon City, Philippines',
    status: 'active',
    verificationStatus: 'verified',
    rating: 4.7,
    reviewCount: 83,
    joinDate: '2024-08-01',
    lastActive: '2024-09-20',
    totalBookings: 124,
    totalRevenue: 350000,
    commissionRate: 18,
    documents: {
      businessLicense: 'license_003.pdf',
      insurance: 'insurance_003.pdf',
      portfolio: ['sound1.jpg', 'sound2.jpg']
    },
    performance: {
      responseTime: '4 hours',
      completionRate: 95,
      customerSatisfaction: 4.7
    }
  }
];

const VendorCard: React.FC<{ vendor: Vendor; onAction: (action: string, vendor: Vendor) => void }> = ({ 
  vendor, 
  onAction 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return <Shield className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            {vendor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{vendor.businessName}</h3>
            <p className="text-gray-600">{vendor.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
              </span>
              <div className="flex items-center gap-1">
                {getVerificationIcon(vendor.verificationStatus)}
                <span className="text-xs text-gray-500">
                  {vendor.verificationStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => onAction('menu', vendor)}
          >
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-semibold">{vendor.rating}</span>
          </div>
          <p className="text-xs text-gray-500">{vendor.reviewCount} reviews</p>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 mb-1">{vendor.totalBookings}</div>
          <p className="text-xs text-gray-500">Bookings</p>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 mb-1">₱{(vendor.totalRevenue / 1000).toFixed(0)}k</div>
          <p className="text-xs text-gray-500">Revenue</p>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 mb-1">{vendor.commissionRate}%</div>
          <p className="text-xs text-gray-500">Commission</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {vendor.location}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Last active: {new Date(vendor.lastActive).toLocaleDateString()}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAction('view', vendor)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Eye className="h-4 w-4" />
          View
        </button>
        <button
          onClick={() => onAction('edit', vendor)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Edit className="h-4 w-4" />
          Edit
        </button>
        {vendor.status === 'pending' && (
          <button
            onClick={() => onAction('approve', vendor)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </button>
        )}
      </div>
    </div>
  );
};

export const VendorManagement: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>(sampleVendors);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null); // Not currently used
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<VendorFilters>({
    status: 'all',
    category: 'all',
    verificationStatus: 'all',
    location: 'all',
    rating: 0
  });

  // Filter and search vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = searchTerm === '' || 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || vendor.status === filters.status;
      const matchesCategory = filters.category === 'all' || vendor.category === filters.category;
      const matchesVerification = filters.verificationStatus === 'all' || vendor.verificationStatus === filters.verificationStatus;
      const matchesLocation = filters.location === 'all' || vendor.location.includes(filters.location);
      const matchesRating = filters.rating === 0 || vendor.rating >= filters.rating;

      return matchesSearch && matchesStatus && matchesCategory && matchesVerification && matchesLocation && matchesRating;
    });
  }, [vendors, searchTerm, filters]);

  // Handle vendor actions
  const handleVendorAction = (action: string, vendor: Vendor) => {
    switch (action) {
      case 'approve':
        setVendors(prev => prev.map(v => 
          v.id === vendor.id 
            ? { ...v, status: 'active', verificationStatus: 'verified' }
            : v
        ));
        break;
      case 'suspend':
        setVendors(prev => prev.map(v => 
          v.id === vendor.id 
            ? { ...v, status: 'suspended' }
            : v
        ));
        break;
      case 'view':
        // setSelectedVendor(vendor); // Feature not implemented yet
        break;
      case 'edit':
        // Navigate to edit page or open modal
        console.log('Edit vendor:', vendor.id);
        break;
      default:
        console.log('Action:', action, 'Vendor:', vendor.id);
    }
  };

  // Get statistics
  const stats = useMemo(() => {
    const total = vendors.length;
    const pending = vendors.filter(v => v.status === 'pending').length;
    const active = vendors.filter(v => v.status === 'active').length;
    const suspended = vendors.filter(v => v.status === 'suspended').length;
    const totalRevenue = vendors.reduce((sum, v) => sum + v.totalRevenue, 0);

    return { total, pending, active, suspended, totalRevenue };
  }, [vendors]);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Management</h1>
              <p className="text-gray-600">Manage vendor applications, approvals, and performance monitoring</p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4" />
                Add Vendor
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Vendors</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Suspended</p>
                <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
              </div>
              <Ban className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">₱{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search vendors by name, business, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="Photography">Photography</option>
                  <option value="Wedding Planning">Wedding Planning</option>
                  <option value="DJ">DJ</option>
                  <option value="Catering">Catering</option>
                  <option value="Venues">Venues</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
                <select
                  value={filters.verificationStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, verificationStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Verification</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="0">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.8">4.8+ Stars</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    status: 'all',
                    category: 'all',
                    verificationStatus: 'all',
                    location: 'all',
                    rating: 0
                  })}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredVendors.length} of {vendors.length} vendors
          </p>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVendors.map(vendor => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onAction={handleVendorAction}
            />
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No vendors found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorManagement;
