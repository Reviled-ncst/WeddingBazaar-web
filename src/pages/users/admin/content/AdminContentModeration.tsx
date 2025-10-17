import React, { useState } from 'react';
import { AdminLayout } from '../shared';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Flag,
  Shield,
  FileText,
  User,
  Star,
  MessageSquare,
  Filter,
  ThumbsUp,
  Search,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface ContentItem {
  id: string;
  type: 'vendor_profile' | 'vendor_photo' | 'review' | 'message';
  title: string;
  author: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  priority: 'low' | 'medium' | 'high';
  reportCount: number;
  submittedAt: string;
  content: string;
  category?: string;
}

interface ModerationStats {
  pending: number;
  reviewed: number;
  flagged: number;
  approved: number;
}

export const AdminContentModeration: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'flagged' | 'approved' | 'rejected'>('pending');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  const moderationStats: ModerationStats = {
    pending: 47,
    reviewed: 1284,
    flagged: 23,
    approved: 956
  };

  const contentItems: ContentItem[] = [
    {
      id: '1',
      type: 'vendor_profile',
      title: 'Wedding Photography Services',
      author: 'Perfect Moments Photography',
      status: 'pending',
      priority: 'medium',
      reportCount: 0,
      submittedAt: '2024-01-15 14:30:00',
      content: 'Professional wedding photography with 10+ years experience...',
      category: 'Photography'
    },
    {
      id: '2',
      type: 'review',
      title: 'Amazing catering service!',
      author: 'Sarah Johnson',
      status: 'flagged',
      priority: 'high',
      reportCount: 3,
      submittedAt: '2024-01-15 12:45:00',
      content: 'The food was absolutely delicious and the service was exceptional...',
      category: 'Catering'
    },
    {
      id: '3',
      type: 'vendor_photo',
      title: 'Wedding venue gallery update',
      author: 'Sunset Gardens Venue',
      status: 'pending',
      priority: 'low',
      reportCount: 0,
      submittedAt: '2024-01-15 11:20:00',
      content: 'New photos of our renovated ballroom and garden area...',
      category: 'Venue'
    },
    {
      id: '4',
      type: 'message',
      title: 'Vendor inquiry message',
      author: 'John Smith',
      status: 'flagged',
      priority: 'medium',
      reportCount: 1,
      submittedAt: '2024-01-15 10:15:00',
      content: 'Hi, I am interested in your services for my wedding...',
      category: 'Communication'
    }
  ];

  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority: ContentItem['priority']) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
    }
  };

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'vendor_profile': return User;
      case 'vendor_photo': return Image;
      case 'review': return Star;
      case 'message': return MessageSquare;
    }
  };

  const filteredContent = contentItems.filter(item => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'flagged') return item.reportCount > 0;
    return item.status === selectedTab;
  });

  return (
    <AdminLayout title="Content Moderation" subtitle="Review and moderate platform content">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Content Moderation
              </h1>
              <p className="text-gray-600 text-lg">
                Review and moderate vendor content, user reviews, and platform communications
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Bulk Actions
              </button>
            </div>
          </div>
        </div>

        {/* Moderation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Pending Review', value: moderationStats.pending, icon: AlertTriangle, color: 'from-yellow-500 to-orange-500' },
            { title: 'Total Reviewed', value: moderationStats.reviewed, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
            { title: 'Flagged Content', value: moderationStats.flagged, icon: Flag, color: 'from-red-500 to-pink-500' },
            { title: 'Approved', value: moderationStats.approved, icon: ThumbsUp, color: 'from-blue-500 to-cyan-500' }
          ].map((stat, index) => (
            <div key={index} className="p-6 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-r",
                  stat.color
                )}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-900">{stat.title}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content List */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg">
              {/* Tab Navigation */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'pending', label: 'Pending', count: moderationStats.pending },
                    { id: 'flagged', label: 'Flagged', count: moderationStats.flagged },
                    { id: 'approved', label: 'Approved', count: moderationStats.approved },
                    { id: 'all', label: 'All Content', count: contentItems.length }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id as any)}
                      className={cn(
                        "px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2",
                        selectedTab === tab.id
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      {tab.label}
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold",
                        selectedTab === tab.id
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-600"
                      )}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search and Filters */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>All Types</option>
                    <option>Vendor Profiles</option>
                    <option>Photos</option>
                    <option>Reviews</option>
                    <option>Messages</option>
                  </select>
                </div>
              </div>

              {/* Content Items */}
              <div className="divide-y divide-gray-200">
                {filteredContent.map((item) => {
                  const TypeIcon = getTypeIcon(item.type);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "p-6 hover:bg-gray-50 transition-colors cursor-pointer",
                        selectedContent?.id === item.id ? "bg-blue-50" : ""
                      )}
                      onClick={() => setSelectedContent(item)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <TypeIcon className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              getStatusColor(item.status)
                            )}>
                              {item.status}
                            </span>
                            {item.reportCount > 0 && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
                                <Flag className="h-3 w-3" />
                                {item.reportCount}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <User className="h-4 w-4 mr-1" />
                            {item.author}
                            <span className="mx-2">•</span>
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(item.submittedAt).toLocaleDateString()}
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              getPriorityColor(item.priority)
                            )}>
                              {item.priority} priority
                            </span>
                            
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Preview/Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg sticky top-24">
              {selectedContent ? (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedContent.title}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        getStatusColor(selectedContent.status)
                      )}>
                        {selectedContent.status}
                      </span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        getPriorityColor(selectedContent.priority)
                      )}>
                        {selectedContent.priority}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Author</label>
                      <p className="text-sm text-gray-900">{selectedContent.author}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Content</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedContent.content}</p>
                    </div>
                    {selectedContent.reportCount > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Reports</label>
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <Flag className="h-4 w-4" />
                          {selectedContent.reportCount} user report(s)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Approve Content
                    </button>
                    <button className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Reject Content
                    </button>
                    <button className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <Flag className="h-4 w-4" />
                      Flag for Review
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select Content to Review</h3>
                  <p className="text-gray-600">Choose an item from the list to view details and take moderation actions.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
