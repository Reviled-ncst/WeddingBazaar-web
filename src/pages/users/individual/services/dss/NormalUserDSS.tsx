import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Phone, Mail, MapPin, ArrowLeft } from 'lucide-react';
import { CoupleHeader } from '../../../individual/landing/CoupleHeader';

interface SimpleRecommendation {
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

export const NormalUserDSS: React.FC = () => {
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const recommendations: SimpleRecommendation[] = [
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
  ];

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const totalCost = recommendations
    .filter(rec => selectedServices.includes(rec.id))
    .reduce((total, rec) => {
      const price = rec.price.includes('/person') 
        ? parseFloat(rec.price.replace(/[₱,]/g, '').split('/')[0]) * 80 // Assume 80 guests
        : parseFloat(rec.price.replace(/[₱,]/g, ''));
      return total + price;
    }, 0);

  const handleContactAll = () => {
    const selectedVendors = recommendations.filter(rec => selectedServices.includes(rec.id));
    // In a real app, this would create a group chat or send emails
    alert(`Contacting ${selectedVendors.length} vendors: ${selectedVendors.map(v => v.vendor).join(', ')}`);
  };

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
            <p className="text-gray-600 text-lg">
              We picked these vendors based on your budget and what other couples loved
            </p>
          </div>

          {/* Simple Instructions */}
          <div className="bg-pink-50 rounded-2xl p-6 mb-8 text-center">
            <Heart className="h-8 w-8 text-pink-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">How it works</h2>
            <p className="text-gray-700">
              ✓ Check the services you want → ✓ Contact the vendors → ✓ Book your favorites
            </p>
          </div>

          {/* Services List */}
          <div className="space-y-6 mb-8">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
                <div className="flex items-start gap-6">
                  {/* Checkbox */}
                  <label className="flex items-center cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(rec.id)}
                      onChange={() => toggleService(rec.id)}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                      aria-label={`Select ${rec.service} from ${rec.vendor}`}
                    />
                  </label>

                  {/* Image */}
                  <img
                    src={rec.image}
                    alt={rec.service}
                    className="w-32 h-24 object-cover rounded-xl"
                  />

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-sm text-pink-600 font-medium">{rec.category}</span>
                        <h3 className="text-xl font-semibold text-gray-900">{rec.service}</h3>
                        <p className="text-gray-600">{rec.vendor}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{rec.price}</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{rec.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Why recommended */}
                    <div className="bg-green-50 rounded-lg p-3 mb-4">
                      <p className="text-green-800 text-sm">💡 {rec.why}</p>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {rec.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {rec.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {rec.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          {selectedServices.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-200">
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
            <div className="text-center">
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

export default NormalUserDSS;
