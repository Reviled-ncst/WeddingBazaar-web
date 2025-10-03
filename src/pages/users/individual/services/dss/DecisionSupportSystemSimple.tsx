import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Phone, Mail, MapPin, ArrowLeft, Heart, MessageCircle, Calendar } from 'lucide-react';
import { CoupleHeader } from '../../../individual/landing/CoupleHeader';

interface SimpleService {
  id: string;
  category: string;
  service: string;
  vendor: string;
  price: string;
  rating: number;
  location: string;
  phone: string;
  email: string;
  image: string;
  why: string;
}

export const DecisionSupportSystem: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [recommendedServices, setRecommendedServices] = useState<SimpleService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Get user preferences from URL params
  const budget = searchParams.get('budget') || '';
  const guests = searchParams.get('guests') || '';

  useEffect(() => {
    // Simulate loading recommended services based on budget and guest count
    setTimeout(() => {
      setRecommendedServices([
        {
          id: '1',
          category: 'Photography',
          service: 'Wedding Photography Package',
          vendor: 'Happy Moments Studio',
          price: '₱45,000',
          rating: 4.8,
          location: 'Manila',
          phone: '0917-123-4567',
          email: 'hello@happymoments.com',
          image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
          why: 'Perfect for your budget and highly recommended by other couples'
        },
        {
          id: '2',
          category: 'Food',
          service: 'Wedding Reception Catering',
          vendor: 'Delicious Catering',
          price: '₱2,500/person',
          rating: 4.7,
          location: 'Quezon City',
          phone: '0918-765-4321',
          email: 'orders@deliciouscatering.com',
          image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
          why: 'Great food quality and fits your guest count perfectly'
        },
        {
          id: '3',
          category: 'Music',
          service: 'DJ & Sound System',
          vendor: 'Party Vibes DJ',
          price: '₱25,000',
          rating: 4.6,
          location: 'Makati',
          phone: '0919-987-6543',
          email: 'book@partyvibes.com',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
          why: 'Popular choice for weddings your size'
        },
        {
          id: '4',
          category: 'Flowers',
          service: 'Bridal Bouquet & Decorations',
          vendor: 'Beautiful Blooms',
          price: '₱15,000',
          rating: 4.9,
          location: 'Manila',
          phone: '0920-456-7890',
          email: 'flowers@beautifulblooms.com',
          image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop',
          why: 'Beautiful flowers that match your style'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [budget, guests]);

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const totalCost = recommendedServices
    .filter(rec => selectedServices.includes(rec.id))
    .reduce((total, rec) => {
      const price = rec.price.includes('/person') 
        ? parseFloat(rec.price.replace(/[₱,]/g, '').split('/')[0]) * 80 // Assume 80 guests
        : parseFloat(rec.price.replace(/[₱,]/g, ''));
      return total + price;
    }, 0);

  const handleContactAll = () => {
    const selectedVendors = recommendedServices.filter(rec => selectedServices.includes(rec.id));
    // In a real app, this would create a group chat or send emails
    alert(`Contacting ${selectedVendors.length} vendors: ${selectedVendors.map(v => v.vendor).join(', ')}`);
  };

  const handleContactVendor = (serviceId: string) => {
    navigate(`/individual/services?contact=${serviceId}`);
  };

  const handleBookService = (serviceId: string) => {
    navigate(`/individual/bookings?book=${serviceId}`);
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

          {/* Simple Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Perfect Vendors for Your Wedding
            </h1>
            <div className="bg-white rounded-xl p-4 mb-6 inline-block shadow-sm">
              <p className="text-gray-600">
                Based on your budget of <span className="font-semibold text-pink-600">{budget?.replace('-', ' - ₱').replace('k', ',000') || 'Not specified'}</span> and{' '}
                <span className="font-semibold text-pink-600">{guests?.replace('-', ' - ') || 'Not specified'}</span> guests
              </p>
            </div>
          </div>

          {/* Simple Instructions */}
          <div className="bg-pink-50 rounded-2xl p-6 mb-8 text-center">
            <Heart className="h-8 w-8 text-pink-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">How it works</h2>
            <p className="text-gray-700">
              ✓ Check the services you want → ✓ Contact the vendors → ✓ Book your favorites
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleContactAll}
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
                  {/* Checkbox */}
                  <label className="flex items-center cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                      aria-label={`Select ${service.service} from ${service.vendor}`}
                    />
                  </label>

                  {/* Service Image */}
                  <img
                    src={service.image}
                    alt={service.service}
                    className="w-full md:w-48 h-48 object-cover rounded-xl"
                  />
                  
                  {/* Service Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-sm text-pink-600 font-medium">{service.category}</span>
                        <h3 className="text-xl font-semibold text-gray-900">{service.service}</h3>
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
                    
                    {/* Why recommended */}
                    <div className="bg-green-50 rounded-lg p-3 mb-4">
                      <p className="text-green-800 text-sm">💡 {service.why}</p>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {service.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {service.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {service.email}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
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
          {selectedServices.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-200 mt-8">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedServices.length} services selected
                </h3>
                <p className="text-2xl font-bold text-pink-600">
                  Total: ₱{totalCost.toLocaleString()}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleContactAll}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  Contact All Selected Vendors
                </button>
                <button
                  onClick={() => navigate('/individual/services')}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all"
                >
                  See More Options
                </button>
              </div>
            </div>
          )}

          {selectedServices.length === 0 && (
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">Select the services you want to get started</p>
              <button
                onClick={() => navigate('/individual/services')}
                className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
              >
                Or Browse All Vendors
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecisionSupportSystem;
