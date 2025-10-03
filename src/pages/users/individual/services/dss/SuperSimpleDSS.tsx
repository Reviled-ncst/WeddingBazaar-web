import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, MessageCircle, Calendar, ArrowLeft } from 'lucide-react';
import { CoupleHeader } from '../../../individual/landing/CoupleHeader';

interface SimpleService {
  id: string;
  name: string;
  category: string;
  price: string;
  rating: number;
  image: string;
  vendor: string;
  location: string;
}

export const SuperSimpleDSS: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [recommendedServices, setRecommendedServices] = useState<SimpleService[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user preferences from URL params
  const budget = searchParams.get('budget') || '';
  const guests = searchParams.get('guests') || '';

  useEffect(() => {
    // Simulate loading recommended services based on budget and guest count
    setTimeout(() => {
      setRecommendedServices([
        {
          id: '1',
          name: 'Professional Wedding Photography',
          category: 'Photography',
          price: '₱45,000',
          rating: 4.8,
          image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
          vendor: 'Elite Photo Studio',
          location: 'Manila'
        },
        {
          id: '2',
          name: 'Wedding Reception Catering',
          category: 'Catering',
          price: '₱2,500/person',
          rating: 4.7,
          image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
          vendor: 'Gourmet Catering Co.',
          location: 'Quezon City'
        },
        {
          id: '3',
          name: 'DJ & Sound System',
          category: 'Entertainment',  
          price: '₱25,000',
          rating: 4.6,
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
          vendor: 'Party Beats DJ',
          location: 'Makati'
        },
        {
          id: '4',
          name: 'Bridal Bouquet & Centerpieces',
          category: 'Flowers',
          price: '₱15,000',
          rating: 4.9,
          image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop',
          vendor: 'Bloom Floral Design',
          location: 'Manila'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [budget, guests]);

  const handleContactVendor = (serviceId: string) => {
    navigate(`/individual/services?contact=${serviceId}`);
  };

  const handleBookService = (serviceId: string) => {
    navigate(`/individual/bookings?book=${serviceId}`);
  };

  const handleChatWithAll = () => {
    navigate('/individual/messages?group=wedding-plan');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoupleHeader />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Finding your perfect wedding vendors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CoupleHeader />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your Perfect Wedding Plan
            </h1>
            <div className="bg-white rounded-xl p-4 mb-6 inline-block shadow-sm">
              <p className="text-gray-600">
                Based on your budget of <span className="font-semibold text-pink-600">{budget?.replace('-', ' - ₱').replace('k', ',000') || 'Not specified'}</span> and{' '}
                <span className="font-semibold text-pink-600">{guests?.replace('-', ' - ') || 'Not specified'}</span> guests
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleChatWithAll}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Chat with All Vendors
            </button>
            
            <button
              onClick={() => navigate('/individual/bookings')}
              className="flex-1 bg-white border-2 border-pink-200 text-pink-600 font-semibold py-3 px-6 rounded-xl hover:border-pink-300 hover:bg-pink-50 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              View My Bookings
            </button>
          </div>

          {/* Recommended Services */}
          <div className="grid gap-6">
            <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
            
            {recommendedServices.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Service Image */}
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full md:w-48 h-48 object-cover rounded-xl"
                  />
                  
                  {/* Service Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-sm text-pink-600 font-medium">{service.category}</span>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{service.name}</h3>
                        <p className="text-gray-600">{service.vendor} • {service.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{service.price}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {service.rating}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button
                        onClick={() => handleContactVendor(service.id)}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                      >
                        Contact Vendor
                      </button>
                      <button
                        onClick={() => handleBookService(service.id)}
                        className="flex-1 bg-white border border-pink-200 text-pink-600 font-medium py-3 px-4 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all"
                      >
                        Book This Service
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-600">Need different options?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/individual/services')}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Browse All Vendors
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperSimpleDSS;
