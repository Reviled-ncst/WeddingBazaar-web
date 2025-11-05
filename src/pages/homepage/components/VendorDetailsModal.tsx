import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Phone, Mail, Globe, Calendar, Heart, Check, Clock, DollarSign, Users, Award, TrendingUp, MessageCircle } from 'lucide-react';

interface VendorDetails {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: string;
  description: string;
  profileImage: string;
  websiteUrl?: string;
  yearsExperience: number;
  portfolioImages: string[];
  verified: boolean;
  specialties: string[];
  contact: {
    email?: string;
    phone?: string;
    website?: string;
    socialMedia?: Record<string, string>;
    businessHours?: Record<string, string>;
  };
  pricing: {
    startingPrice?: number;
    priceRangeMin?: number;
    priceRangeMax?: number;
    priceRange: string;
  };
  stats: {
    totalBookings: number;
    completedBookings: number;
    totalReviews: number;
    averageRating: number;
  };
  memberSince: string;
}

interface Service {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  description: string;
  price?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  priceDisplay: string;
  inclusions: string[];
  imageUrl?: string;
  duration?: string;
  capacity?: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  date: string;
  images: string[];
  reviewer: {
    name: string;
    image?: string;
  };
  serviceType?: string;
  eventDate?: string;
}

interface RatingBreakdown {
  total: number;
  average: number;
  breakdown: {
    [key: number]: number;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
}

export const VendorDetailsModal: React.FC<Props> = ({ isOpen, onClose, vendorId }) => {
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'reviews'>('about');

  useEffect(() => {
    if (isOpen && vendorId) {
      fetchVendorDetails();
    }
  }, [isOpen, vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const response = await fetch(`${apiBaseUrl}/api/vendors/${vendorId}/details`);

      if (!response.ok) {
        throw new Error('Failed to fetch vendor details');
      }

      const data = await response.json();

      if (data.success) {
        setVendor(data.vendor);
        setServices(data.services || []);
        setReviews(data.reviews || []);
        setRatingBreakdown(data.ratingBreakdown);
      } else {
        throw new Error(data.error || 'Failed to load vendor details');
      }
    } catch (err) {
      console.error('Error fetching vendor details:', err);
      setError('Failed to load vendor details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getRatingPercentage = (star: number) => {
    if (!ratingBreakdown || ratingBreakdown.total === 0) return 0;
    return (ratingBreakdown.breakdown[star] / ratingBreakdown.total) * 100;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="min-h-screen px-4 text-center">
        {/* Centering trick */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

        <div className="inline-block w-full max-w-6xl my-8 text-left align-middle transition-all transform bg-white rounded-3xl shadow-2xl">
          {/* Header */}
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {loading ? (
              <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-t-3xl" />
            ) : vendor ? (
              <div className="relative h-96 overflow-hidden rounded-t-3xl">
                <img
                  src={vendor.profileImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop'}
                  alt={vendor.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-4xl font-bold">{vendor.name}</h2>
                        {vendor.verified && (
                          <div className="flex items-center gap-1 px-3 py-1 bg-blue-500 rounded-full">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-semibold">Verified</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-white/90">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          <span>{vendor.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          <span>{vendor.yearsExperience} years experience</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {renderStars(Math.round(vendor.rating))}
                        <span className="text-xl font-bold ml-2">{vendor.rating.toFixed(1)}</span>
                        <span className="text-white/80">({vendor.reviewCount} reviews)</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold mb-2">{vendor.pricing.priceRange}</div>
                      <div className="text-sm text-white/80">Typical price range</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-6">
              {[
                { key: 'about', label: 'About', icon: Award },
                { key: 'services', label: `Services (${services.length})`, icon: DollarSign },
                { key: 'reviews', label: `Reviews (${reviews.length})`, icon: Star }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchVendorDetails}
                  className="px-6 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600"
                >
                  Retry
                </button>
              </div>
            ) : vendor ? (
              <>
                {/* About Tab */}
                {activeTab === 'about' && (
                  <div className="space-y-8">
                    {/* Description */}
                    <div>
                      <h3 className="text-2xl font-bold mb-4">About {vendor.name}</h3>
                      <p className="text-gray-600 leading-relaxed">{vendor.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-6">
                      {[
                        { icon: TrendingUp, label: 'Total Bookings', value: vendor.stats.totalBookings },
                        { icon: Check, label: 'Completed', value: vendor.stats.completedBookings },
                        { icon: Star, label: 'Avg Rating', value: vendor.stats.averageRating.toFixed(1) },
                        { icon: MessageCircle, label: 'Reviews', value: vendor.stats.totalReviews }
                      ].map((stat, i) => (
                        <div key={i} className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-2xl">
                          <stat.icon className="w-8 h-8 text-rose-500 mb-3" />
                          <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Specialties */}
                    {vendor.specialties && vendor.specialties.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold mb-4">Specialties</h3>
                        <div className="flex flex-wrap gap-3">
                          {vendor.specialties.map((specialty, i) => (
                            <span
                              key={i}
                              className="px-4 py-2 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 rounded-full font-medium"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl">
                      <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                      <div className="grid grid-cols-2 gap-6">
                        {vendor.contact.email && (
                          <a
                            href={`mailto:${vendor.contact.email}`}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-shadow"
                          >
                            <Mail className="w-6 h-6 text-rose-500" />
                            <div>
                              <div className="text-sm text-gray-500">Email</div>
                              <div className="font-semibold text-gray-900">{vendor.contact.email}</div>
                            </div>
                          </a>
                        )}
                        {vendor.contact.phone && (
                          <a
                            href={`tel:${vendor.contact.phone}`}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-shadow"
                          >
                            <Phone className="w-6 h-6 text-rose-500" />
                            <div>
                              <div className="text-sm text-gray-500">Phone</div>
                              <div className="font-semibold text-gray-900">{vendor.contact.phone}</div>
                            </div>
                          </a>
                        )}
                        {vendor.contact.website && (
                          <a
                            href={vendor.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-shadow"
                          >
                            <Globe className="w-6 h-6 text-rose-500" />
                            <div>
                              <div className="text-sm text-gray-500">Website</div>
                              <div className="font-semibold text-gray-900">Visit Website</div>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Portfolio */}
                    {vendor.portfolioImages && vendor.portfolioImages.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold mb-4">Portfolio</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {vendor.portfolioImages.map((image, i) => (
                            <img
                              key={i}
                              src={image}
                              alt={`Portfolio ${i + 1}`}
                              className="w-full h-64 object-cover rounded-xl hover:scale-105 transition-transform cursor-pointer"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                  <div className="space-y-6">
                    {services.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No services listed yet.
                      </div>
                    ) : (
                      services.map((service) => (
                        <div key={service.id} className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h4>
                              <p className="text-gray-600 mb-4">{service.description}</p>
                              
                              {service.inclusions && service.inclusions.length > 0 && (
                                <div className="space-y-2">
                                  <div className="text-sm font-semibold text-gray-700">Inclusions:</div>
                                  <ul className="space-y-1">
                                    {service.inclusions.map((inclusion, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{inclusion}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            
                            <div className="ml-6 text-right">
                              <div className="text-3xl font-bold text-rose-600 mb-1">
                                {service.priceDisplay}
                              </div>
                              {service.duration && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="w-4 h-4" />
                                  {service.duration}
                                </div>
                              )}
                              {service.capacity && (
                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                  <Users className="w-4 h-4" />
                                  Up to {service.capacity} guests
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-8">
                    {/* Rating Summary */}
                    {ratingBreakdown && (
                      <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-2xl">
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <div className="text-6xl font-bold text-gray-900 mb-2">
                              {ratingBreakdown.average.toFixed(1)}
                            </div>
                            <div className="flex justify-center mb-2">
                              {renderStars(Math.round(ratingBreakdown.average))}
                            </div>
                            <div className="text-gray-600">{ratingBreakdown.total} reviews</div>
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => (
                              <div key={star} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-20">
                                  <span className="text-sm font-medium">{star}</span>
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                </div>
                                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500"
                                    style={{ width: `${getRatingPercentage(star)}%` }}
                                  />
                                </div>
                                <div className="text-sm text-gray-600 w-16 text-right">
                                  {ratingBreakdown.breakdown[star] || 0}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-6">
                      {reviews.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          No reviews yet. Be the first to review!
                        </div>
                      ) : (
                        reviews.map((review) => (
                          <div key={review.id} className="bg-white border border-gray-200 p-6 rounded-2xl">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                {review.reviewer.name[0].toUpperCase()}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="font-semibold text-gray-900">{review.reviewer.name}</div>
                                    <div className="text-sm text-gray-500">
                                      {new Date(review.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                  <div className="flex">{renderStars(review.rating)}</div>
                                </div>
                                
                                <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                                
                                {review.serviceType && (
                                  <div className="mt-3 text-sm text-gray-500">
                                    Service: {review.serviceType}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Footer Actions */}
          {vendor && !loading && (
            <div className="border-t border-gray-200 p-6 flex items-center justify-between bg-gray-50 rounded-b-3xl">
              <div className="flex gap-3">
                <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <Heart className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl">
                  Request Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
