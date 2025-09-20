import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Eye,
  Edit,
  Ban,
  Download,
  RefreshCcw,
  Plus,
  Award,
  Shield,
  Activity,
  UserCheck,
  UserX,
  UserPlus,
  Heart
} from 'lucide-react';
import { AdminHeader } from '../../../../shared/components/layout/AdminHeader';
// import { adminApi, type AdminUser } from '../../../../services/api/adminApi';

// Import types - will be updated once we fix the path
interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType: 'individual' | 'vendor' | 'admin';
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  emailVerified: boolean;
  joinDate: string;
  lastLogin?: string;
  totalBookings: number;
  totalSpent: number;
  preferredServices: string[];
  location?: string;
  avatar?: string;
}

// Sample data for development - replace with API calls
const generateSampleUsers = (): AdminUser[] => {
  const userTypes: AdminUser['userType'][] = ['individual', 'vendor', 'admin'];
  const statuses: AdminUser['status'][] = ['active', 'inactive', 'suspended', 'banned'];
  const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
  const services = ['Photography', 'Catering', 'Venues', 'Music & DJ', 'Planning', 'Flowers', 'Beauty', 'Transportation'];

  return Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    firstName: ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna'][i % 10],
    lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'][i % 10],
    email: `user${i + 1}@example.com`,
    phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    userType: userTypes[i % userTypes.length],
    status: statuses[i % statuses.length],
    emailVerified: Math.random() > 0.2,
    joinDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    lastLogin: Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString() : undefined,
    totalBookings: Math.floor(Math.random() * 25),
    totalSpent: Math.floor(Math.random() * 10000),
    preferredServices: services.slice(0, Math.floor(Math.random() * 3) + 1),
    location: locations[Math.floor(Math.random() * locations.length)],
    avatar: `https://images.unsplash.com/photo-${1500000000000 + i}?w=150&h=150&fit=crop&crop=face`,
  }));
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<AdminUser['userType'] | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AdminUser['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'lastLogin' | 'totalBookings' | 'totalSpent'>('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Load users data
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        // For now, use sample data. Replace with API call:
        // const response = await adminApi.users.getUsers({ page: currentPage, limit: itemsPerPage });
        // if (response.success && response.data) {
        //   setUsers(response.data);
        // }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsers(generateSampleUsers());
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentPage, itemsPerPage]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || user.userType === filterType;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (sortBy) {
        case 'name':
          valueA = `${a.firstName} ${a.lastName}`.toLowerCase();
          valueB = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'joinDate':
          valueA = new Date(a.joinDate).getTime();
          valueB = new Date(b.joinDate).getTime();
          break;
        case 'lastLogin':
          valueA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          valueB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          break;
        case 'totalBookings':
          valueA = a.totalBookings;
          valueB = b.totalBookings;
          break;
        case 'totalSpent':
          valueA = a.totalSpent;
          valueB = b.totalSpent;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const suspended = users.filter(u => u.status === 'suspended').length;
    const newThisMonth = users.filter(u => {
      const joinDate = new Date(u.joinDate);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return joinDate > monthAgo;
    }).length;

    return { total, active, suspended, newThisMonth };
  }, [users]);

  // Handle user actions
  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'activate':
          // await adminApi.users.updateUserStatus(userId, 'active');
          console.log(`Activating user ${userId}`);
          break;
        case 'suspend':
          // await adminApi.users.updateUserStatus(userId, 'suspended');
          console.log(`Suspending user ${userId}`);
          break;
        case 'ban':
          // await adminApi.users.updateUserStatus(userId, 'banned');
          console.log(`Banning user ${userId}`);
          break;
        case 'delete':
          // await adminApi.users.deleteUser(userId);
          console.log(`Deleting user ${userId}`);
          break;
      }
      
      // Reload users after action
      // loadUsers();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const getStatusIcon = (status: AdminUser['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'banned':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: AdminUser['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeIcon = (userType: AdminUser['userType']) => {
    switch (userType) {
      case 'individual':
        return <Heart className="w-4 h-4 text-pink-500" />;
      case 'vendor':
        return <Award className="w-4 h-4 text-blue-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8 pt-28">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                User Management
              </h1>
              <p className="text-gray-600">Manage and monitor all platform users</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all">
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.suspended.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <UserX className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.newThisMonth.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <UserPlus className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* User Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as AdminUser['userType'] | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                aria-label="Filter by user type"
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as AdminUser['status'] | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                aria-label="Filter by user status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                aria-label="Sort users by"
              >
                <option value="joinDate">Join Date</option>
                <option value="name">Name</option>
                <option value="lastLogin">Last Login</option>
                <option value="totalBookings">Total Bookings</option>
                <option value="totalSpent">Total Spent</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                <TrendingUp className={`w-5 h-5 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => window.location.reload()}
                className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                title="Refresh data"
                aria-label="Refresh data"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentUsers.map((user) => (
                <div key={user.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1">
                          {getUserTypeIcon(user.userType)}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button 
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        title="User actions menu"
                        aria-label="User actions menu"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Status and Type */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{user.userType}</span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      {user.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span className="truncate">{user.phone}</span>
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{user.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">{user.totalBookings}</p>
                        <p className="text-xs text-gray-500">Bookings</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(user.totalSpent)}</p>
                        <p className="text-xs text-gray-500">Spent</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {formatDate(user.joinDate)}</span>
                      </div>
                      {user.lastLogin && (
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>Last login {formatDate(user.lastLogin)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => console.log('View user', user.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button
                        onClick={() => console.log('Edit user', user.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors"
                        >
                          <Ban className="w-3 h-3" />
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl transition-colors ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
