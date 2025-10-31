import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { AdminLayout, DataTable, StatCard, Badge, Button, Modal } from '../shared';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'individual' | 'vendor' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login?: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optimized load users with better error handling
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 [UserManagement] Fetching from API');
      const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Enhanced data mapping with proper null/undefined checks
      const mappedUsers = (data.users || []).map((user: Partial<User> & { 
        user_id?: string; 
        firstName?: string; 
        lastName?: string; 
        contact_phone?: string; 
        user_type?: string;
        account_status?: string;
        createdAt?: string;
        lastLogin?: string;
      }) => ({
        id: user.id || user.user_id || String(Math.random()),
        email: user.email || 'no-email@example.com',
        first_name: user.first_name || user.firstName || 'Unknown',
        last_name: user.last_name || user.lastName || 'User',
        phone: user.phone || user.contact_phone || undefined,
        role: (user.role || user.user_type || 'individual') as 'individual' | 'vendor' | 'admin',
        status: (user.status || user.account_status || 'active') as 'active' | 'inactive' | 'suspended',
        created_at: user.created_at || user.createdAt || new Date().toISOString(),
        last_login: user.last_login || user.lastLogin || undefined
      }));

      // Calculate stats from mapped users
      const calculatedStats: Stats = {
        total: mappedUsers.length,
        active: mappedUsers.filter((u: User) => u.status === 'active').length,
        inactive: mappedUsers.filter((u: User) => u.status === 'inactive').length,
        suspended: mappedUsers.filter((u: User) => u.status === 'suspended').length
      };

      setUsers(mappedUsers);
      setStats(data.stats || calculatedStats);
      
      console.log('✅ [UserManagement] Loaded', mappedUsers.length, 'users');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load users';
      console.error('❌ [UserManagement] Error:', errorMessage);
      setError(errorMessage);
      setUsers([]);
      setStats({
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadUsers();
  }, [loadUsers]);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        loadUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Memoized filtered users for performance
  const filteredUsers = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    
    return users.filter(user => {
      if (!user) return false;
      
      // Search filter
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const phone = (user.phone || '').toLowerCase();
      const matchesSearch = !searchLower || 
                           fullName.includes(searchLower) ||
                           email.includes(searchLower) ||
                           phone.includes(searchLower);
      
      // Role filter
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  // Memoized columns for performance
  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'User',
      render: (user: User) => {
        if (!user) return <div className="text-slate-400 text-sm">N/A</div>;
        
        const initials = (user.first_name?.charAt(0) || '') + (user.last_name?.charAt(0) || '');
        const displayInitials = initials || user.email?.charAt(0)?.toUpperCase() || '?';
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        const displayName = fullName || 'No Name';
        
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {displayInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-slate-900 truncate">
                {displayName}
              </div>
              <div className="text-sm text-slate-500 truncate">{user.email || 'No email'}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'role',
      label: 'Role',
      render: (user: User) => {
        if (!user || !user.role) return <Badge variant="default">Unknown</Badge>;
        
        const roleColors = {
          admin: 'info' as const,
          vendor: 'warning' as const,
          individual: 'default' as const
        };
        
        return (
          <Badge variant={roleColors[user.role] || 'default'}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (user: User) => {
        if (!user || !user.status) return <Badge variant="default">Unknown</Badge>;
        
        const statusColors = {
          active: 'success' as const,
          inactive: 'default' as const,
          suspended: 'error' as const
        };
        
        const statusIcons = {
          active: CheckCircle,
          inactive: Clock,
          suspended: XCircle
        };
        
        const StatusIcon = statusIcons[user.status];
        
        return (
          <Badge variant={statusColors[user.status] || 'default'}>
            {StatusIcon && <StatusIcon className="w-3 h-3 mr-1 inline" />}
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </Badge>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (user: User) => {
        if (!user || !user.created_at) {
          return <div className="text-sm text-slate-400">N/A</div>;
        }
        
        try {
          const date = new Date(user.created_at);
          return (
            <div className="text-sm text-slate-600 font-medium">
              {date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          );
        } catch {
          return <div className="text-sm text-slate-400">Invalid date</div>;
        }
      }
    },
    {
      key: 'last_login',
      label: 'Last Login',
      render: (user: User) => {
        if (!user || !user.last_login) {
          return <div className="text-sm text-slate-400 italic">Never</div>;
        }
        
        try {
          const date = new Date(user.last_login);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) {
            return <div className="text-sm text-green-600 font-medium">Today</div>;
          } else if (diffDays === 1) {
            return <div className="text-sm text-slate-600">Yesterday</div>;
          } else if (diffDays < 7) {
            return <div className="text-sm text-slate-600">{diffDays} days ago</div>;
          } else {
            return (
              <div className="text-sm text-slate-500">
                {date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            );
          }
        } catch {
          return <div className="text-sm text-slate-400">Invalid date</div>;
        }
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: User) => {
        if (!user) return null;
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewUser(user)}
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* Edit user */}}
              title="Edit user"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        );
      }
    }
  ], []);

  return (
    <AdminLayout
      title="User Management"
      subtitle="Manage platform users and permissions"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'User Management' }
      ]}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.total.toString()}
          icon={Users}
        />
        <StatCard
          title="Active Users"
          value={stats.active.toString()}
          icon={CheckCircle}
          iconColor="text-green-600"
        />
        <StatCard
          title="Inactive Users"
          value={stats.inactive.toString()}
          icon={Clock}
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Suspended Users"
          value={stats.suspended.toString()}
          icon={XCircle}
          iconColor="text-red-600"
        />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-1">Failed to load users</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter users by role"
            >
              <option value="all">All Roles</option>
              <option value="individual">Individual</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter users by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <Button 
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh user list"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
            <Button variant="primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredUsers.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{users.length}</span> users
            {(searchQuery || filterRole !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterRole('all');
                  setFilterStatus('all');
                }}
                className="ml-3 text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Clear filters
              </button>
            )}
          </p>
        </div>
      </div>

      {/* Users Table */}
      {loading && !users.length ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900 mb-1">Loading users...</p>
              <p className="text-sm text-slate-500">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>
      ) : filteredUsers.length === 0 && !loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <div className="text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No users found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No users have been registered yet.'}
            </p>
            {(searchQuery || filterRole !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterRole('all');
                  setFilterStatus('all');
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          loading={loading}
          emptyMessage="No users found"
        />
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="User Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                {selectedUser.first_name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h3>
                <p className="text-slate-600">{selectedUser.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={selectedUser.role === 'admin' ? 'info' : selectedUser.role === 'vendor' ? 'warning' : 'default'}>
                    {selectedUser.role}
                  </Badge>
                  <Badge variant={selectedUser.status === 'active' ? 'success' : selectedUser.status === 'suspended' ? 'error' : 'default'}>
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  {selectedUser.email}
                </div>
                {selectedUser.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4" />
                    {selectedUser.phone}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  Joined: {new Date(selectedUser.created_at).toLocaleDateString()}
                </div>
                {selectedUser.last_login && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    Last Login: {new Date(selectedUser.last_login).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {selectedUser.status === 'active' && (
                <Button
                  variant="warning"
                  onClick={() => handleUpdateStatus(selectedUser.id, 'suspended')}
                  className="flex-1"
                >
                  Suspend User
                </Button>
              )}
              {selectedUser.status === 'suspended' && (
                <Button
                  variant="success"
                  onClick={() => handleUpdateStatus(selectedUser.id, 'active')}
                  className="flex-1"
                >
                  Reactivate User
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => {/* Delete user */}}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};
