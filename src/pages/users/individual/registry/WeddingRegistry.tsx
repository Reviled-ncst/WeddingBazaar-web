import React from 'react';
import { Gift, Plus, ExternalLink, Share2 } from 'lucide-react';
import { CoupleHeader } from '../landing/CoupleHeader';

export const WeddingRegistry: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <CoupleHeader />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Gift className="h-12 w-12 text-purple-500 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              Wedding Registry
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create and manage your wedding gift registry across multiple stores
          </p>
        </div>

        {/* Coming Soon */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/50 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Gift className="h-12 w-12 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Registry Coming Soon</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            We're working on bringing you the best wedding registry experience with integration to top retailers 
            and personalized gift recommendations for your guests.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
              <Plus className="h-8 w-8 text-purple-600 mb-3 mx-auto" />
              <h3 className="font-bold text-gray-900 mb-2">Multiple Stores</h3>
              <p className="text-sm text-gray-600">Add items from your favorite retailers</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
              <Share2 className="h-8 w-8 text-purple-600 mb-3 mx-auto" />
              <h3 className="font-bold text-gray-900 mb-2">Easy Sharing</h3>
              <p className="text-sm text-gray-600">Share your registry with family and friends</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
              <ExternalLink className="h-8 w-8 text-purple-600 mb-3 mx-auto" />
              <h3 className="font-bold text-gray-900 mb-2">Live Tracking</h3>
              <p className="text-sm text-gray-600">Real-time updates on purchased items</p>
            </div>
          </div>
          
          <button className="mt-8 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-semibold">
            Notify Me When Available
          </button>
        </div>
      </main>
    </div>
  );
};
