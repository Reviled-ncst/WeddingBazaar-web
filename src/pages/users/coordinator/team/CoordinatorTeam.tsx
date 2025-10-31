import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Activity,
  Edit2,
  Trash2,
  Search,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { CoordinatorHeader } from '../layout/CoordinatorHeader';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Lead Coordinator' | 'Assistant' | 'Vendor Manager' | 'Client Relations' | 'Operations';
  status: 'active' | 'inactive' | 'on-leave';
  assignedWeddings: number;
  completedTasks: number;
  pendingTasks: number;
  avatar?: string;
  joinedDate: string;
  lastActive: string;
  permissions: string[];
}

interface TeamActivity {
  id: string;
  memberId: string;
  memberName: string;
  action: string;
  weddingName?: string;
  timestamp: string;
  type: 'task' | 'wedding' | 'client' | 'vendor' | 'document';
}

const CoordinatorTeam: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock team data
  const teamMembers: TeamMember[] = [
    {
      id: 'tm-1',
      name: 'Sarah Martinez',
      email: 'sarah.m@weddingbazaar.com',
      phone: '+1 (555) 123-4567',
      role: 'Lead Coordinator',
      status: 'active',
      assignedWeddings: 8,
      completedTasks: 234,
      pendingTasks: 12,
      joinedDate: '2024-01-15',
      lastActive: '2 hours ago',
      permissions: ['all'],
      avatar: 'SM'
    },
    {
      id: 'tm-2',
      name: 'Michael Chen',
      email: 'michael.c@weddingbazaar.com',
      phone: '+1 (555) 234-5678',
      role: 'Assistant',
      status: 'active',
      assignedWeddings: 5,
      completedTasks: 189,
      pendingTasks: 8,
      joinedDate: '2024-03-20',
      lastActive: '5 hours ago',
      permissions: ['view', 'edit_tasks', 'contact_vendors'],
      avatar: 'MC'
    },
    {
      id: 'tm-3',
      name: 'Emily Rodriguez',
      email: 'emily.r@weddingbazaar.com',
      phone: '+1 (555) 345-6789',
      role: 'Vendor Manager',
      status: 'active',
      assignedWeddings: 6,
      completedTasks: 156,
      pendingTasks: 15,
      joinedDate: '2024-02-10',
      lastActive: '1 hour ago',
      permissions: ['view', 'manage_vendors', 'create_contracts'],
      avatar: 'ER'
    },
    {
      id: 'tm-4',
      name: 'James Wilson',
      email: 'james.w@weddingbazaar.com',
      phone: '+1 (555) 456-7890',
      role: 'Client Relations',
      status: 'active',
      assignedWeddings: 7,
      completedTasks: 198,
      pendingTasks: 9,
      joinedDate: '2024-01-28',
      lastActive: '3 hours ago',
      permissions: ['view', 'manage_clients', 'send_emails'],
      avatar: 'JW'
    },
    {
      id: 'tm-5',
      name: 'Sophia Lee',
      email: 'sophia.l@weddingbazaar.com',
      phone: '+1 (555) 567-8901',
      role: 'Operations',
      status: 'on-leave',
      assignedWeddings: 3,
      completedTasks: 145,
      pendingTasks: 4,
      joinedDate: '2024-04-05',
      lastActive: '2 days ago',
      permissions: ['view', 'manage_logistics', 'track_budgets'],
      avatar: 'SL'
    }
  ];

  // Mock activity data
  const recentActivity: TeamActivity[] = [
    {
      id: 'act-1',
      memberId: 'tm-2',
      memberName: 'Michael Chen',
      action: 'Completed venue walkthrough task',
      weddingName: 'Sarah & James Wedding',
      timestamp: '10 minutes ago',
      type: 'task'
    },
    {
      id: 'act-2',
      memberId: 'tm-3',
      memberName: 'Emily Rodriguez',
      action: 'Added new vendor to network',
      timestamp: '1 hour ago',
      type: 'vendor'
    },
    {
      id: 'act-3',
      memberId: 'tm-4',
      memberName: 'James Wilson',
      action: 'Sent proposal to client',
      weddingName: 'Emily & David Wedding',
      timestamp: '2 hours ago',
      type: 'client'
    },
    {
      id: 'act-4',
      memberId: 'tm-1',
      memberName: 'Sarah Martinez',
      action: 'Updated wedding timeline',
      weddingName: 'Sophia & Oliver Wedding',
      timestamp: '3 hours ago',
      type: 'wedding'
    },
    {
      id: 'act-5',
      memberId: 'tm-3',
      memberName: 'Emily Rodriguez',
      action: 'Uploaded vendor contract',
      weddingName: 'Sarah & James Wedding',
      timestamp: '4 hours ago',
      type: 'document'
    }
  ];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4" />;
      case 'on-leave':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'wedding':
        return <Calendar className="w-4 h-4 text-pink-500" />;
      case 'client':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'vendor':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'document':
        return <Download className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <CoordinatorHeader />
      
      <div className="pt-24 pb-16 px-4 md:px-6">
        {/* Header */}
        <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Team Management
            </h1>
            <p className="text-gray-600">Manage your wedding coordination team</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105"
          >
            <UserPlus className="w-5 h-5" />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl text-white">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{teamMembers.length}</p>
          <p className="text-gray-600 text-sm">Total Members</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-green-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {teamMembers.filter(m => m.status === 'active').length}
          </p>
          <p className="text-gray-600 text-sm">Active Members</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {teamMembers.reduce((sum, m) => sum + m.assignedWeddings, 0)}
          </p>
          <p className="text-gray-600 text-sm">Assigned Weddings</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {teamMembers.reduce((sum, m) => sum + m.pendingTasks, 0)}
          </p>
          <p className="text-gray-600 text-sm">Pending Tasks</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              aria-label="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="Lead Coordinator">Lead Coordinator</option>
              <option value="Assistant">Assistant</option>
              <option value="Vendor Manager">Vendor Manager</option>
              <option value="Client Relations">Client Relations</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredMembers.length} of {teamMembers.length} members
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-6 hover:bg-pink-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {member.avatar}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(member.status)}`}>
                            {getStatusIcon(member.status)}
                            {member.status === 'on-leave' ? 'On Leave' : member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </span>
                        </div>

                        <p className="text-sm text-pink-600 font-medium mb-2">{member.role}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {member.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {member.phone}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-pink-500" />
                            <span className="font-semibold">{member.assignedWeddings}</span> Weddings
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="font-semibold">{member.completedTasks}</span> Completed
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="font-semibold">{member.pendingTasks}</span> Pending
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-2">Last active: {member.lastActive}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        title="Edit member"
                        aria-label="Edit team member"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove member"
                        aria-label="Remove team member"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="More options"
                        aria-label="More options"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden sticky top-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-pink-600" />
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
            </div>

            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-pink-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">{activity.memberName}</p>
                      <p className="text-sm text-gray-600 mt-1">{activity.action}</p>
                      {activity.weddingName && (
                        <p className="text-xs text-pink-600 mt-1">{activity.weddingName}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal (Placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Add Team Member</h2>
            <p className="text-gray-600 mb-6">This feature will be implemented in the next phase.</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CoordinatorTeam;
