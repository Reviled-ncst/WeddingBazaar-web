import React, { useState, useEffect } from 'react';
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
  UserPlus
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

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (user: User) => {
        if (!user) return null;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {user.first_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-medium text-slate-900">
                {user.first_name || ''} {user.last_name || ''}
              </div>
              <div className="text-sm text-slate-500">{user.email || 'No email'}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'role',
      label: 'Role',
      render: (user: User) => {
        if (!user) return null;
        return (
          <Badge variant={user.role === 'admin' ? 'info' : user.role === 'vendor' ? 'warning' : 'default'}>
            {user.role || 'Unknown'}
          </Badge>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (user: User) => {
        if (!user) return null;
        return (
          <Badge variant={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'error' : 'default'}>
            {user.status || 'Unknown'}
          </Badge>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (user: User) => {
        if (!user || !user.created_at) return <div className="text-sm text-slate-600">N/A</div>;
        return (
          <div className="text-sm text-slate-600">
            {new Date(user.created_at).toLocaleDateString()}
          </div>
        );
      }
    },
    {
      key: 'last_login',
      label: 'Last Login',
      render: (user: User) => {
        if (!user) return <div className="text-sm text-slate-600">N/A</div>;
        return (
          <div className="text-sm text-slate-600">
            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewUser(user)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* Edit user */}}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyMessage="No users found"
      />

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
