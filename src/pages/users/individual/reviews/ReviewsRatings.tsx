import React from 'react';
import { Star, MessageCircle, ThumbsUp, Calendar } from 'lucide-react';
import { CoupleHeader } from '../landing/CoupleHeader';

export const ReviewsRatings: React.FC = () => {
  const reviews = [
    {
      vendor: "Elegant Photography Studio",
      rating: 5,
      date: "2024-01-15",
      review: "Amazing photographer! Captured our special day perfectly with beautiful, creative shots. Highly professional and made us feel comfortable throughout the entire process.",
      helpful: 12
    },
    {
      vendor: "Garden Party Catering",
      rating: 4,
      date: "2024-01-10", 
      review: "Great food and excellent service. The presentation was beautiful and our guests loved the variety of options. Minor timing issues but overall very satisfied.",
      helpful: 8
    },
    {
      vendor: "Melody Music DJ Services",
      rating: 5,
      date: "2024-01-05",
      review: "DJ kept the party going all night! Great music selection and really read the crowd well. Professional setup and excellent communication before the event.",
      helpful: 15
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <CoupleHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Reviews & Ratings
              </h1>
              <p className="text-gray-600 mt-2">Your vendor reviews and feedback</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{reviews.length}</div>
              <div className="text-gray-600">Reviews Written</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl p-4 text-center">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">4.7</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 text-center">
              <ThumbsUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">35</div>
              <div className="text-sm text-gray-600">Helpful Votes</div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-4 text-center">
              <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Vendor Responses</div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{review.vendor}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {review.rating}/5 stars
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{review.review}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">{review.helpful} found this helpful</span>
                </button>
                <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-300">
                  Edit Review
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Write Review CTA */}
        <div className="mt-12 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-3xl p-8 text-center border border-yellow-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Write a New Review</h3>
          <p className="text-gray-600 mb-6">
            Help other couples by sharing your experience with vendors
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-2xl hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-semibold">
            Write Review
          </button>
        </div>
      </main>
    </div>
  );
};
