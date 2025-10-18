import React, { useState, useEffect } from 'react';
import { AdminLayout, StatCard } from '../shared';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock, 
  Eye, 
  Trash2,
  Search,
  Calendar,
  User,
  Filter,
  Mail,
  X
} from 'lucide-react';

interface Conversation {
  id: string;
  creatorId: string;
  participantId: string;
  serviceId: string;
  vendorId: string;
  status: string;
  createdAt: string;
  lastMessageTime: string;
  lastMessageContent: string;
  unreadCountCreator: number;
  unreadCountParticipant: number;
  serviceName: string;
  serviceCategory: string;
  vendorBusinessName: string;
  creatorName: string;
  creatorEmail: string;
  creatorType: string;
  participantName: string;
  participantEmail: string;
  participantType: string;
  messageCount: number;
}

interface Stats {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  messages24h: number;
  messages7d: number;
  avgMessagesPerConversation: number;
}

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  archived: 'bg-gray-100 text-gray-800 border-gray-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200'
};

export const AdminMessages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalConversations: 0,
    activeConversations: 0,
    totalMessages: 0,
    messages24h: 0,
    messages7d: 0,
    avgMessagesPerConversation: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');
  const [filterUserType, setFilterUserType] = useState<'all' | 'individual' | 'vendor'>('all');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterStatus, filterUserType]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Check if mock data is enabled
      const useMockData = import.meta.env.VITE_USE_MOCK_MESSAGES === 'true';
      
      if (useMockData) {
        console.log('📊 [AdminMessages] Using mock data (VITE_USE_MOCK_MESSAGES=true)');
        const mockConvos = generateMockConversations();
        setConversations(mockConvos);
        setStats({
          totalConversations: mockConvos.length,
          activeConversations: mockConvos.filter(c => c.status === 'active').length,
          totalMessages: mockConvos.reduce((sum, c) => sum + c.messageCount, 0),
          messages24h: Math.floor(Math.random() * 50) + 20,
          messages7d: Math.floor(Math.random() * 200) + 100,
          avgMessagesPerConversation: mockConvos.length > 0 
            ? mockConvos.reduce((sum, c) => sum + c.messageCount, 0) / mockConvos.length 
            : 0
        });
      } else {
        console.log('🌐 [AdminMessages] Fetching real data from API');
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        // Fetch conversations with filters
        const params = new URLSearchParams();
        if (filterStatus !== 'all') params.append('status', filterStatus);
        if (filterUserType !== 'all') params.append('user_type', filterUserType);
        
        const [conversationsRes, statsRes] = await Promise.all([
          fetch(`${apiUrl}/api/admin/messages?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${apiUrl}/api/admin/messages/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (conversationsRes.ok && statsRes.ok) {
          const conversationsData = await conversationsRes.json();
          const statsData = await statsRes.json();
          
          console.log('✅ [AdminMessages] Loaded conversations:', conversationsData.data?.length || 0);
          setConversations(conversationsData.data || []);
          setStats(statsData.data || stats);
        } else {
          console.warn('⚠️ [AdminMessages] API error, falling back to mock data');
          const mockConvos = generateMockConversations();
          setConversations(mockConvos);
          setStats({
            totalConversations: mockConvos.length,
            activeConversations: mockConvos.filter(c => c.status === 'active').length,
            totalMessages: mockConvos.reduce((sum, c) => sum + c.messageCount, 0),
            messages24h: Math.floor(Math.random() * 50) + 20,
            messages7d: Math.floor(Math.random() * 200) + 100,
            avgMessagesPerConversation: mockConvos.length > 0 
              ? mockConvos.reduce((sum, c) => sum + c.messageCount, 0) / mockConvos.length 
              : 0
          });
        }
      }
    } catch (error) {
      console.error('❌ [AdminMessages] Error loading data:', error);
      const mockConvos = generateMockConversations();
      setConversations(mockConvos);
      setStats({
        totalConversations: mockConvos.length,
        activeConversations: mockConvos.filter(c => c.status === 'active').length,
        totalMessages: mockConvos.reduce((sum, c) => sum + c.messageCount, 0),
        messages24h: Math.floor(Math.random() * 50) + 20,
        messages7d: Math.floor(Math.random() * 200) + 100,
        avgMessagesPerConversation: mockConvos.length > 0 
          ? mockConvos.reduce((sum, c) => sum + c.messageCount, 0) / mockConvos.length 
          : 0
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockConversations = (): Conversation[] => {
    const statuses = ['active', 'archived', 'pending'];
    const services = [
      { name: 'Wedding Photography', category: 'Photography' },
      { name: 'Premium Catering', category: 'Catering' },
      { name: 'Garden Venue', category: 'Venues' },
      { name: 'DJ Services', category: 'Music' },
      { name: 'Floral Arrangements', category: 'Flowers' }
    ];
    
    return Array.from({ length: 15 }, (_, i) => {
      const status = statuses[i % 3];
      const service = services[i % 5];
      const creatorType = i % 2 === 0 ? 'individual' : 'vendor';
      const participantType = creatorType === 'individual' ? 'vendor' : 'individual';
      
      return {
        id: `conv-${i + 1}`,
        creatorId: `user-${i + 1}`,
        participantId: `user-${i + 100}`,
        serviceId: `service-${(i % 5) + 1}`,
        vendorId: `vendor-${(i % 5) + 1}`,
        status,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastMessageTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastMessageContent: [
          'Thank you for your inquiry! I would love to discuss...',
          'What dates are you looking at for your wedding?',
          'Our package includes full day coverage...',
          'I can send you some sample menus to review.',
          'The venue is available on your preferred date!'
        ][i % 5],
        unreadCountCreator: Math.floor(Math.random() * 3),
        unreadCountParticipant: Math.floor(Math.random() * 3),
        serviceName: service.name,
        serviceCategory: service.category,
        vendorBusinessName: `${service.category} Pro ${(i % 5) + 1}`,
        creatorName: creatorType === 'individual' ? `John & Jane Couple ${i + 1}` : `Vendor ${i + 1}`,
        creatorEmail: `${creatorType}${i + 1}@example.com`,
        creatorType,
        participantName: participantType === 'individual' ? `Sarah & Mike Couple ${i + 1}` : `Business ${i + 1}`,
        participantEmail: `${participantType}${i + 100}@example.com`,
        participantType,
        messageCount: Math.floor(Math.random() * 20) + 3
      };
    });
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!confirm('⚠️ Are you sure you want to delete this conversation? This action cannot be undone.')) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/admin/messages/${convId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Conversation deleted successfully!');
        setSelectedConversation(null);
        loadData();
      } else {
        alert('❌ Failed to delete conversation');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('❌ Failed to delete conversation');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchTerm === '' ||
      conv.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.vendorBusinessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.creatorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Message Management</h1>
            <p className="text-gray-600 mt-1">Monitor and moderate all platform conversations</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Conversations"
            value={stats.totalConversations}
            icon={MessageSquare}
          />
          <StatCard
            title="Active Conversations"
            value={stats.activeConversations}
            icon={Users}
          />
          <StatCard
            title="Total Messages"
            value={stats.totalMessages}
            icon={Mail}
          />
          <StatCard
            title="Avg Messages/Conv"
            value={Math.round(stats.avgMessagesPerConversation * 10) / 10}
            icon={TrendingUp}
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* User Type Filter */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterUserType}
                onChange={(e) => setFilterUserType(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
                aria-label="Filter by user type"
              >
                <option value="all">All User Types</option>
                <option value="individual">Individuals</option>
                <option value="vendor">Vendors</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conversations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredConversations.map((conv) => (
                    <tr key={conv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{conv.creatorName}</span>
                            <span className="text-xs text-gray-500">({conv.creatorType})</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{conv.participantName}</span>
                            <span className="text-xs text-gray-500">({conv.participantType})</span>
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {conv.lastMessageContent}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{conv.serviceName}</div>
                          <div className="text-sm text-gray-500">{conv.serviceCategory}</div>
                          <div className="text-xs text-gray-400">{conv.vendorBusinessName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[conv.status as keyof typeof statusColors] || statusColors.pending}`}>
                          {conv.status.charAt(0).toUpperCase() + conv.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{conv.messageCount}</span>
                          {(conv.unreadCountCreator > 0 || conv.unreadCountParticipant > 0) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {conv.unreadCountCreator + conv.unreadCountParticipant} unread
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {formatRelativeTime(conv.lastMessageTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedConversation(conv)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteConversation(conv.id)}
                            disabled={isProcessing}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Conversation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {selectedConversation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Conversation Details</h2>
                    <p className="text-pink-100 text-sm mt-1">ID: {selectedConversation.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Participants */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-pink-600" />
                    Participants
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Creator</div>
                      <div className="font-medium text-gray-900">{selectedConversation.creatorName}</div>
                      <div className="text-sm text-gray-600 mt-1">{selectedConversation.creatorEmail}</div>
                      <div className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {selectedConversation.creatorType}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Participant</div>
                      <div className="font-medium text-gray-900">{selectedConversation.participantName}</div>
                      <div className="text-sm text-gray-600 mt-1">{selectedConversation.participantEmail}</div>
                      <div className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {selectedConversation.participantType}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <MessageSquare className="h-5 w-5 text-pink-600" />
                    Service Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Service Name</div>
                      <div className="font-medium text-gray-900 mt-1">{selectedConversation.serviceName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Category</div>
                      <div className="font-medium text-gray-900 mt-1">{selectedConversation.serviceCategory}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500">Vendor</div>
                      <div className="font-medium text-gray-900 mt-1">{selectedConversation.vendorBusinessName}</div>
                    </div>
                  </div>
                </div>

                {/* Conversation Stats */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-pink-600" />
                    Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Total Messages</div>
                      <div className="font-bold text-2xl text-gray-900 mt-1">{selectedConversation.messageCount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[selectedConversation.status as keyof typeof statusColors]}`}>
                        {selectedConversation.status}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Unread (Creator)</div>
                      <div className="font-bold text-2xl text-amber-600 mt-1">{selectedConversation.unreadCountCreator}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Unread (Participant)</div>
                      <div className="font-bold text-2xl text-purple-600 mt-1">{selectedConversation.unreadCountParticipant}</div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-pink-600" />
                    Timeline
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(selectedConversation.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Message</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(selectedConversation.lastMessageTime)}</span>
                    </div>
                  </div>
                </div>

                {/* Last Message */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Mail className="h-5 w-5 text-pink-600" />
                    Last Message
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700">{selectedConversation.lastMessageContent}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDeleteConversation(selectedConversation.id)}
                    disabled={isProcessing}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-5 w-5" />
                    Delete Conversation
                  </button>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
