import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, CheckCircle } from 'lucide-react';

export const SimplifiedHero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10" />
      
      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Simplified Headline */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Plan Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              {" "}Dream Wedding
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect vendors for your special day. Simple, easy, stress-free.
          </p>
        </div>

        {/* Simple 3-Step Process */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Find Vendors</h3>
            <p className="text-gray-600 text-sm">Browse photographers, caterers, venues and more</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Get Recommendations</h3>
            <p className="text-gray-600 text-sm">We'll suggest the best vendors for your wedding</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Book & Relax</h3>
            <p className="text-gray-600 text-sm">Easy booking and we'll handle the coordination</p>
          </div>
        </div>

        {/* Simple Call-to-Action Buttons */}
        <div className="space-y-4">
          {/* Primary Action - Most Important */}
          <button
            onClick={() => navigate('/individual/services')}
            className="w-full max-w-md mx-auto block bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-semibold py-4 px-8 rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Find My Wedding Vendors
          </button>

          {/* Secondary Action */}
          <button
            onClick={() => navigate('/individual/services/dss')}
            className="w-full max-w-md mx-auto block bg-white/90 backdrop-blur-sm text-gray-900 text-lg font-medium py-3 px-8 rounded-xl border-2 border-pink-200 hover:border-pink-300 hover:bg-white transition-all duration-300"
          >
            Get My Wedding Plan
          </button>
        </div>

        {/* Simple Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">500+ Happy Couples</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Verified Vendors</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Free to Use</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimplifiedHero;
