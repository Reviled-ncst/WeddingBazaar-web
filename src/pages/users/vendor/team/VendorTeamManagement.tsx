import React, { useState } from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  UserCheck,
  UserX,
  MoreVertical,
  Settings,
  Shield,
  Award
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
}

interface TeamRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  memberCount: number;
}

export const VendorTeamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'roles'>('members');

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@business.com',
      phone: '+1 (555) 123-4567',
      role: 'Lead Photographer',
      permissions: ['manage_bookings', 'view_analytics', 'manage_portfolio'],
      joinDate: '2023-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      email: 'mike@business.com',
      phone: '+1 (555) 234-5678',
      role: 'Assistant Photographer',
      permissions: ['view_bookings', 'manage_portfolio'],
      joinDate: '2023-03-22',
      status: 'active'
    },
    {
      id: '3',
      name: 'Emily Chen',
      email: 'emily@business.com',
      phone: '+1 (555) 345-6789',
      role: 'Business Manager',
      permissions: ['manage_bookings', 'view_analytics', 'manage_finances'],
      joinDate: '2023-02-10',
      status: 'active'
    },
    {
      id: '4',
      name: 'James Wilson',
      email: 'james@business.com',
      phone: '+1 (555) 456-7890',
      role: 'Editor',
      permissions: ['view_portfolio', 'manage_portfolio'],
      joinDate: '2023-11-01',
      status: 'pending'
    }
  ]);

  const [teamRoles] = useState<TeamRole[]>([
    {
      id: '1',
      name: 'Lead Photographer',
      description: 'Primary photographer with full creative control',
      permissions: ['manage_bookings', 'view_analytics', 'manage_portfolio', 'manage_clients'],
      memberCount: 1
    },
    {
      id: '2',
      name: 'Assistant Photographer',
      description: 'Supporting photographer for events and shoots',
      permissions: ['view_bookings', 'manage_portfolio'],
      memberCount: 1
    },
    {
      id: '3',
      name: 'Business Manager',
      description: 'Handles business operations and client relations',
      permissions: ['manage_bookings', 'view_analytics', 'manage_finances', 'manage_clients'],
      memberCount: 1
    },
    {
      id: '4',
      name: 'Editor',
      description: 'Photo and video editing specialist',
      permissions: ['view_portfolio', 'manage_portfolio'],
      memberCount: 1
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const handleToggleStatus = (memberId: string) => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, status: member.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' | 'pending' }
          : member
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <VendorHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Team Management
                  </h1>
                  <p className="text-gray-600">Manage your team members and their permissions</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => console.log('Add member functionality')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'members'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Team Members ({teamMembers.length})
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'roles'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Team Roles ({teamRoles.length})
            </button>
          </div>
        </div>

        {/* Team Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="grid gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {getInitials(member.name)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-purple-600 font-medium mb-2">{member.role}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{member.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{member.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 mb-1">Permissions:</div>
                          <div className="flex flex-wrap gap-1">
                            {member.permissions.map((permission, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                              >
                                {permission.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(member.id)}
                        className={`p-2 rounded-xl transition-all duration-200 ${
                          member.status === 'active'
                            ? 'bg-red-100 hover:bg-red-200 text-red-600'
                            : 'bg-green-100 hover:bg-green-200 text-green-600'
                        }`}
                        title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {member.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      
                      <button
                        onClick={() => console.log('Edit member:', member)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200"
                        title="Edit Member"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all duration-200"
                        title="Remove Member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      <button 
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all duration-200"
                        title="More Options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Roles Tab */}
        {activeTab === 'roles' && (
          <div className="grid gap-6">
            {teamRoles.map((role) => (
              <div
                key={role.id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{role.name}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{role.memberCount}</div>
                      <div className="text-xs text-gray-500">Members</div>
                    </div>
                    <button 
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all duration-200"
                      title="Role Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Permissions:</div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full"
                      >
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-xl">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{teamMembers.filter(m => m.status === 'active').length}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Active Members</h3>
            <p className="text-sm text-gray-600">Currently working</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-xl">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-yellow-600">{teamRoles.length}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Team Roles</h3>
            <p className="text-sm text-gray-600">Defined positions</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{teamMembers.filter(m => m.status === 'pending').length}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Pending Invites</h3>
            <p className="text-sm text-gray-600">Awaiting response</p>
          </div>
        </div>
      </div>
    </div>
  );
};
