import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Filter, Star, Phone, Mail, 
  MapPin, DollarSign, Calendar, TrendingUp, Eye, 
  MessageCircle, UserPlus, Award
} from 'lucide-react';
import { CoordinatorHeader } from '../layout/CoordinatorHeader';

interface Vendor {
  id: string;
  businessName: string;
  category: string;
  rating: number;
  reviewCount: number;
  completedBookings: number;
  phone: string;
  email: string;
  location: string;
  priceRange: string;
  specialties: string[];
  isPreferred: boolean;
  totalRevenue: number;
  lastWorkedWith: string;
  availability: 'available' | 'limited' | 'booked';
  image: string;
}

export const CoordinatorVendors: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'bookings' | 'revenue'>('rating');

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    filterAndSortVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendors, searchQuery, categoryFilter, availabilityFilter, sortBy]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockVendors: Vendor[] = [
        {
          id: '1',
          businessName: 'Perfect Moments Photography',
          category: 'Photography',
          rating: 4.9,
          reviewCount: 127,
          completedBookings: 45,
          phone: '+63 917 123 4567',
          email: 'info@perfectmoments.com',
          location: 'Makati City',
          priceRange: '₱50,000 - ₱150,000',
          specialties: ['Wedding Photography', 'Pre-nup Shoots', 'Engagement Photos'],
          isPreferred: true,
          totalRevenue: 4500000,
          lastWorkedWith: '2025-10-15',
          availability: 'available',
          image: '/vendors/photography.jpg'
        },
        {
          id: '2',
          businessName: 'Elegant Events Catering',
          category: 'Catering',
          rating: 4.8,
          reviewCount: 89,
          completedBookings: 38,
          phone: '+63 917 234 5678',
          email: 'info@elegantevents.com',
          location: 'Quezon City',
          priceRange: '₱1,200 - ₱2,500/pax',
          specialties: ['Filipino Cuisine', 'International Buffet', 'Cocktail Catering'],
          isPreferred: true,
          totalRevenue: 3800000,
          lastWorkedWith: '2025-09-20',
          availability: 'limited',
          image: '/vendors/catering.jpg'
        },
        {
          id: '3',
          businessName: 'Dreamy Decor Studio',
          category: 'Decorations',
          rating: 4.7,
          reviewCount: 56,
          completedBookings: 32,
          phone: '+63 917 345 6789',
          email: 'hello@dreamydecor.com',
          location: 'Pasig City',
          priceRange: '₱80,000 - ₱300,000',
          specialties: ['Floral Arrangements', 'Stage Design', 'Table Styling'],
          isPreferred: false,
          totalRevenue: 2800000,
          lastWorkedWith: '2025-08-10',
          availability: 'available',
          image: '/vendors/decor.jpg'
        },
        {
          id: '4',
          businessName: 'Harmony Music Band',
          category: 'Music',
          rating: 4.9,
          reviewCount: 94,
          completedBookings: 41,
          phone: '+63 917 456 7890',
          email: 'bookings@harmonyband.com',
          location: 'Manila',
          priceRange: '₱40,000 - ₱120,000',
          specialties: ['Live Band', 'Acoustic Set', 'DJ Services'],
          isPreferred: true,
          totalRevenue: 3200000,
          lastWorkedWith: '2025-10-01',
          availability: 'booked',
          image: '/vendors/music.jpg'
        },
        {
          id: '5',
          businessName: 'Couture Bridal Studio',
          category: 'Bridal',
          rating: 4.8,
          reviewCount: 72,
          completedBookings: 28,
          phone: '+63 917 567 8901',
          email: 'info@couturebridal.com',
          location: 'BGC, Taguig',
          priceRange: '₱60,000 - ₱200,000',
          specialties: ['Bridal Gown', 'Groom Suit', 'Entourage Attire'],
          isPreferred: false,
          totalRevenue: 2100000,
          lastWorkedWith: '2025-07-25',
          availability: 'available',
          image: '/vendors/bridal.jpg'
        }
      ];

      setVendors(mockVendors);
    } catch (error) {
      console.error('Failed to load vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVendors = () => {
    let filtered = [...vendors];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(vendor =>
        vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.category === categoryFilter);
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.availability === availabilityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'bookings':
          return b.completedBookings - a.completedBookings;
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        default:
          return 0;
      }
    });

    setFilteredVendors(filtered);
  };

  const getAvailabilityBadge = (availability: Vendor['availability']) => {
    const config = {
      available: { label: 'Available', color: 'bg-green-100 text-green-700' },
      limited: { label: 'Limited', color: 'bg-amber-100 text-amber-700' },
      booked: { label: 'Booked', color: 'bg-red-100 text-red-700' }
    };

    const { label, color } = config[availability];

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
        {label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return `₱${(amount / 1000).toFixed(0)}K`;
  };

  const categories = ['All', 'Photography', 'Catering', 'Decorations', 'Music', 'Bridal', 'Venue', 'Planning'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-white">
      <CoordinatorHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Network</h1>
              <p className="text-gray-600">Manage your trusted vendor partnerships</p>
            </div>
            <button
              onClick={() => navigate('/coordinator/vendors/add')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Add Vendor
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
                </div>
                <Users className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Preferred</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {vendors.filter(v => v.isPreferred).length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {(vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1)}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(vendors.reduce((sum, v) => sum + v.totalRevenue, 0))}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
                  title="Filter by category"
                  aria-label="Filter vendors by category"
                >
                  <option value="all">All Categories</option>
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                title="Filter by availability"
                aria-label="Filter vendors by availability"
              >
                <option value="all">All Availability</option>
                <option value="available">Available</option>
                <option value="limited">Limited</option>
                <option value="booked">Booked</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'bookings' | 'revenue')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                title="Sort vendors by"
                aria-label="Sort vendors by"
              >
                <option value="rating">Sort by Rating</option>
                <option value="bookings">Sort by Bookings</option>
                <option value="revenue">Sort by Revenue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading vendors...</p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{vendor.businessName}</h3>
                      {vendor.isPreferred && (
                        <Award className="w-5 h-5 text-amber-500" aria-label="Preferred Vendor" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                        {vendor.category}
                      </span>
                      {getAvailabilityBadge(vendor.availability)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{vendor.rating}</span>
                        <span>({vendor.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{vendor.completedBookings} bookings</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(vendor.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vendor Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{vendor.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">{vendor.priceRange}</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/coordinator/vendors/${vendor.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View Profile
                  </button>
                  <button
                    onClick={() => navigate(`/coordinator/messages?vendor=${vendor.id}`)}
                    className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-all"
                    title="Send Message"
                    aria-label="Send message to vendor"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
