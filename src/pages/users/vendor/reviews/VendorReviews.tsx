import React, { useState } from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { 
  Star, 
  MessageCircle, 
  TrendingUp, 
  Award,
  AlertCircle,
  Filter,
  Reply,
  Heart,
  Flag,
  MoreVertical
} from 'lucide-react';

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  eventType: string;
  platform: 'google' | 'facebook' | 'yelp' | 'internal';
  responded: boolean;
  helpful: number;
  verified: boolean;
  photos?: string[];
}

interface ReputationMetrics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  responseRate: number;
  recentTrend: number;
}

export const VendorReviews: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'pending' | 'responded'>('all');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const [reputationMetrics] = useState<ReputationMetrics>({
    averageRating: 4.8,
    totalReviews: 127,
    ratingDistribution: {
      5: 89,
      4: 24,
      3: 8,
      2: 4,
      1: 2
    },
    responseRate: 92,
    recentTrend: 0.3
  });

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      clientName: 'Sarah & Michael Thompson',
      rating: 5,
      comment: 'Absolutely amazing photography! Our wedding photos are beyond beautiful. The team was professional, creative, and captured every special moment perfectly. We couldn\'t be happier with the results!',
      date: '2024-01-15',
      eventType: 'Wedding',
      platform: 'google',
      responded: true,
      helpful: 12,
      verified: true,
      photos: []
    },
    {
      id: '2',
      clientName: 'Jennifer Rodriguez',
      rating: 5,
      comment: 'The best photography service we\'ve ever used! They made our engagement session so fun and relaxed. The photos came out stunning and we received them faster than expected.',
      date: '2024-01-10',
      eventType: 'Engagement',
      platform: 'facebook',
      responded: false,
      helpful: 8,
      verified: true
    },
    {
      id: '3',
      clientName: 'David & Lisa Chen',
      rating: 4,
      comment: 'Great service overall. The photographers were professional and the photos look great. Only minor issue was a slight delay in delivery, but the quality made up for it.',
      date: '2024-01-05',
      eventType: 'Wedding',
      platform: 'yelp',
      responded: true,
      helpful: 6,
      verified: true
    },
    {
      id: '4',
      clientName: 'Emily Johnson',
      rating: 5,
      comment: 'Incredible attention to detail and such artistic vision! They captured our special day perfectly and the whole experience was wonderful from start to finish.',
      date: '2023-12-28',
      eventType: 'Wedding',
      platform: 'internal',
      responded: false,
      helpful: 15,
      verified: true
    },
    {
      id: '5',
      clientName: 'Robert Wilson',
      rating: 3,
      comment: 'Good photos but communication could have been better. There were some delays in getting back to us during the planning phase.',
      date: '2023-12-20',
      eventType: 'Corporate Event',
      platform: 'google',
      responded: false,
      helpful: 3,
      verified: true
    }
  ]);

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'google': return 'bg-red-100 text-red-600';
      case 'facebook': return 'bg-blue-100 text-blue-600';
      case 'yelp': return 'bg-yellow-100 text-yellow-600';
      case 'internal': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleToggleResponse = (reviewId: string) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, responded: !review.responded }
          : review
      )
    );
  };

  const filteredReviews = reviews.filter(review => {
    if (selectedFilter === 'recent') return new Date(review.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (selectedFilter === 'pending') return !review.responded;
    if (selectedFilter === 'responded') return review.responded;
    if (selectedRating) return review.rating === selectedRating;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <VendorHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Reviews & Reputation
                  </h1>
                  <p className="text-gray-600">Manage your online reputation and client feedback</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                {renderStars(reputationMetrics.averageRating, 'lg')}
                <span className="text-3xl font-bold text-yellow-500 ml-2">
                  {reputationMetrics.averageRating}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{reputationMetrics.totalReviews} total reviews</p>
            </div>
          </div>
        </div>

        {/* Reputation Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-xl">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-yellow-600">{reputationMetrics.averageRating}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Average Rating</h3>
            <p className="text-sm text-gray-600">Across all platforms</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-xl">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{reputationMetrics.totalReviews}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Total Reviews</h3>
            <p className="text-sm text-gray-600">All time</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-xl">
                <Reply className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{reputationMetrics.responseRate}%</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Response Rate</h3>
            <p className="text-sm text-gray-600">Reviews responded to</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">+{reputationMetrics.recentTrend}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Recent Trend</h3>
            <p className="text-sm text-gray-600">Rating improvement</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reputationMetrics.ratingDistribution[rating] || 0;
              const percentage = (count / reputationMetrics.totalReviews) * 100;
              
              return (
                <div key={rating} className="flex items-center space-x-4">
                  <button
                    onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      selectedRating === rating
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </button>
                  
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <div className="flex space-x-2">
                {['all', 'recent', 'pending', 'responded'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedFilter === filter
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredReviews.length} of {reviews.length} reviews
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {review.clientName.split(' ')[0][0]}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{review.clientName}</h3>
                      {review.verified && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Award className="h-4 w-4" />
                          <span className="text-xs font-medium">Verified</span>
                        </div>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(review.platform)}`}>
                        {review.platform.charAt(0).toUpperCase() + review.platform.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">{review.eventType}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors duration-200">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{review.helpful}</span>
                        </button>
                        
                        <button
                          onClick={() => handleToggleResponse(review.id)}
                          className={`flex items-center space-x-1 transition-colors duration-200 ${
                            review.responded 
                              ? 'text-green-600 hover:text-green-700' 
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          <Reply className="h-4 w-4" />
                          <span className="text-sm">
                            {review.responded ? 'Responded' : 'Reply'}
                          </span>
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                          title="Report Review"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          title="More Options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {!review.responded && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center space-x-2 text-orange-600 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Response recommended</span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Draft a response
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold text-blue-900">Request Reviews</div>
                <div className="text-sm text-blue-600">Send review invitations</div>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-200 border border-green-200">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <div className="text-left">
                <div className="font-semibold text-green-900">Analytics Report</div>
                <div className="text-sm text-green-600">Detailed insights</div>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-200">
              <Award className="h-6 w-6 text-purple-600" />
              <div className="text-left">
                <div className="font-semibold text-purple-900">Showcase Reviews</div>
                <div className="text-sm text-purple-600">Feature on website</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
