import React, { useState, useEffect } from 'react';
import { Star, Heart, Calendar, User } from 'lucide-react';

interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  description: string;
  years_experience?: number;
  portfolio_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  website_url?: string;
  service_areas?: string[];
  created_at: string;
  updated_at: string;
}

export const FeaturedVendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedVendors = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/vendors/featured?limit=6`);
        if (!response.ok) {
          throw new Error('Failed to fetch vendors');
        }
        const result = await response.json();
        
        // Extract the data array from the API response
        const data = result.data || result || [];
        setVendors(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vendors');
        console.error('Error fetching featured vendors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedVendors();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Vendors</h2>
            <p className="text-lg text-gray-600 mb-12">Loading amazing vendors...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Vendors</h2>
            <p className="text-lg text-red-600 mb-12">{error}</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="vendors" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Vendors
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our top-rated wedding vendors who have helped thousands of couples 
            create their perfect wedding day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(vendors) && vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Vendor Image Placeholder */}
              <div className="relative overflow-hidden">
                <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <User className="h-16 w-16 text-white/80" />
                </div>
                <div className="absolute top-4 right-4">
                  <button 
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                    title="Add to favorites"
                    aria-label="Add to favorites"
                  >
                    <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700">
                    {vendor.business_type}
                  </span>
                </div>
              </div>

              {/* Vendor Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {vendor.business_name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {vendor.description}
                </p>

                {/* Experience & Stats */}
                <div className="flex items-center justify-between mb-4">
                  {vendor.years_experience && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {vendor.years_experience} years exp.
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">
                      New Vendor
                    </span>
                  </div>
                </div>

                {/* Links */}
                <div className="flex space-x-2 mb-4">
                  {vendor.website_url && (
                    <a
                      href={vendor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
                    >
                      Website
                    </a>
                  )}
                  {vendor.instagram_url && (
                    <a
                      href={vendor.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-pink-100 text-pink-700 text-xs rounded-full hover:bg-pink-200 transition-colors"
                    >
                      Instagram
                    </a>
                  )}
                  {vendor.portfolio_url && (
                    <a
                      href={vendor.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full hover:bg-purple-200 transition-colors"
                    >
                      Portfolio
                    </a>
                  )}
                </div>

                {/* Action Button */}
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105">
                  View Details
                </button>
              </div>
            </div>
          )) || (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No featured vendors available at the moment.</p>
            </div>
          )}
        </div>

        {/* Show All Vendors Button */}
        <div className="text-center mt-12">
          <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200">
            View All Vendors
          </button>
        </div>
      </div>
    </section>
  );
};


