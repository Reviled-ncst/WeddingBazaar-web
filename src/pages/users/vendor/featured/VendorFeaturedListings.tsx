import React, { useState, useEffect } from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { Star, Eye, Calendar, Crown, TrendingUp, Users, MapPin, Clock } from 'lucide-react';
import { SubscriptionGate } from '../../../../shared/components/subscription/SubscriptionGate';

interface FeaturedListing {
  id: string;
  title: string;
  category: string;
  currentPlan: 'basic' | 'featured' | 'premium';
  views: number;
  leads: number;
  bookings: number;
  rating: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  position?: number;
}

interface FeaturedPackage {
  id: string;
  name: string;
  duration: number; // days
  price: number;
  features: string[];
  badge?: string;
  popular?: boolean;
}

export const VendorFeaturedListings: React.FC = () => {
  const [listings, setListings] = useState<FeaturedListing[]>([]);
  const [packages, setPackages] = useState<FeaturedPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<string>('');

  useEffect(() => {
    fetchFeaturedData();
  }, []);

  const fetchFeaturedData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, fetch from API
      setListings([
        {
          id: '1',
          title: 'Premium Wedding Photography',
          category: 'Photography',
          currentPlan: 'premium',
          views: 1250,
          leads: 45,
          bookings: 12,
          rating: 4.8,
          isActive: true,
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          position: 2
        },
        {
          id: '2',
          title: 'Destination Wedding Packages',
          category: 'Wedding Planning',
          currentPlan: 'featured',
          views: 890,
          leads: 28,
          bookings: 8,
          rating: 4.6,
          isActive: true,
          startDate: '2024-01-20',
          endDate: '2024-02-20',
          position: 5
        },
        {
          id: '3',
          title: 'Elegant Bridal Makeup',
          category: 'Beauty Services',
          currentPlan: 'basic',
          views: 456,
          leads: 15,
          bookings: 4,
          rating: 4.5,
          isActive: false
        }
      ]);

      setPackages([
        {
          id: 'featured-7',
          name: 'Featured (7 Days)',
          duration: 7,
          price: 2500,
          features: [
            'Priority search positioning',
            'Featured badge display',
            'Enhanced listing visibility',
            'Basic analytics'
          ]
        },
        {
          id: 'featured-30',
          name: 'Featured (30 Days)',
          duration: 30,
          price: 8500,
          features: [
            'Priority search positioning',
            'Featured badge display',
            'Enhanced listing visibility',
            'Detailed analytics',
            'Email leads notification'
          ],
          popular: true
        },
        {
          id: 'premium-7',
          name: 'Premium (7 Days)',
          duration: 7,
          price: 4500,
          features: [
            'Top search positioning',
            'Premium badge display',
            'Maximum visibility boost',
            'Advanced analytics',
            'Priority customer support',
            'Social media promotion'
          ],
          badge: 'PREMIUM'
        },
        {
          id: 'premium-30',
          name: 'Premium (30 Days)',
          duration: 30,
          price: 15000,
          features: [
            'Top search positioning',
            'Premium badge display',
            'Maximum visibility boost',
            'Advanced analytics',
            'Priority customer support',
            'Social media promotion',
            'Weekly performance reports'
          ],
          badge: 'PREMIUM'
        }
      ]);

    } catch (error) {
      console.error('Error fetching featured data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToFeatured = async (listingId: string, packageId: string) => {
    try {
      // In real implementation, call API to upgrade listing
      console.log('Upgrading listing:', listingId, 'to package:', packageId);
      
      // Show success message
      alert('Your listing has been upgraded! It will be featured within 24 hours.');
      
      // Refresh data
      fetchFeaturedData();
    } catch (error) {
      console.error('Error upgrading listing:', error);
      alert('Failed to upgrade listing. Please try again.');
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'premium':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </span>
        );
      case 'featured':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Basic
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
        <VendorHeader />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SubscriptionGate requiredTier="basic" feature="Featured Listings">
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
        <VendorHeader />
        
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Featured Listings</h1>
              <p className="text-gray-600">Boost your visibility and get more bookings with featured positioning</p>
            </div>

            {/* Current Listings */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Listings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div key={listing.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{listing.category}</p>
                        {getPlanBadge(listing.currentPlan)}
                      </div>
                      <div className={`w-3 h-3 rounded-full ${listing.isActive ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center text-blue-500 mb-1">
                          <Eye className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{listing.views}</div>
                        <div className="text-xs text-gray-500">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center text-green-500 mb-1">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{listing.leads}</div>
                        <div className="text-xs text-gray-500">Leads</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center text-purple-500 mb-1">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{listing.bookings}</div>
                        <div className="text-xs text-gray-500">Bookings</div>
                      </div>
                    </div>

                    {/* Rating and Position */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{listing.rating}</span>
                      </div>
                      {listing.position && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span>Position #{listing.position}</span>
                        </div>
                      )}
                    </div>

                    {/* Active Period */}
                    {listing.isActive && listing.startDate && listing.endDate && (
                      <div className="text-xs text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            Active until {new Date(listing.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Upgrade Button */}
                    {listing.currentPlan === 'basic' && (
                      <button
                        onClick={() => setSelectedListing(listing.id)}
                        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium"
                      >
                        Upgrade to Featured
                      </button>
                    )}
                    
                    {listing.currentPlan !== 'basic' && (
                      <button
                        onClick={() => setSelectedListing(listing.id)}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 text-sm font-medium"
                      >
                        Extend/Upgrade
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Packages */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border transition-all duration-200 hover:shadow-xl ${
                      pkg.popular 
                        ? 'border-rose-300 ring-2 ring-rose-200' 
                        : 'border-gray-200/50'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    {pkg.badge && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {pkg.badge}
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        ₱{pkg.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">{pkg.duration} days</div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => selectedListing && handleUpgradeToFeatured(selectedListing, pkg.id)}
                      disabled={!selectedListing}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedListing ? 'Select Package' : 'Select Listing First'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Selection Notice */}
            {!selectedListing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-700">
                  Please select a listing first to choose a featured package
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SubscriptionGate>
  );
};

export default VendorFeaturedListings;
