import React, { useState, useEffect } from 'react';
import { CoupleHeader } from '../landing/CoupleHeader';
import { useUnifiedMessaging } from '../../../../shared/contexts/UnifiedMessagingContext';

// Simple service interface
interface Service {
  id: string;
  name: string;
  category: string;
  vendorId: string;
  vendorName: string;
  description: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  image?: string;
  location?: string;
}

// Mock services data
const mockServices: Service[] = [
  {
    id: 'service-1',
    name: 'Premium Wedding Photography',
    category: 'Photography',
    vendorId: 'vendor-1',
    vendorName: 'Perfect Moments Studio',
    description: 'Capture your special day with our professional wedding photography services.',
    priceRange: '₱50,000 - ₱100,000',
    rating: 4.8,
    reviewCount: 25,
    image: '/images/placeholder-service.jpg',
    location: 'Manila, Philippines'
  },
  {
    id: 'service-2',
    name: 'Wedding Catering Services',
    category: 'Catering',
    vendorId: 'vendor-2',
    vendorName: 'Delicious Events Catering',
    description: 'Exquisite catering services for your wedding celebration.',
    priceRange: '₱800 - ₱1,500 per person',
    rating: 4.6,
    reviewCount: 18,
    image: '/images/placeholder-service.jpg',
    location: 'Quezon City, Philippines'
  },
  {
    id: 'service-3',
    name: 'Garden Wedding Venue',
    category: 'Venues',
    vendorId: 'vendor-3',
    vendorName: 'Enchanted Garden Events',
    description: 'Beautiful garden venue perfect for outdoor wedding ceremonies.',
    priceRange: '₱80,000 - ₱150,000',
    rating: 4.9,
    reviewCount: 32,
    image: '/images/placeholder-service.jpg',
    location: 'Tagaytay, Philippines'
  }
];

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { createBusinessConversation, setModalOpen, setActiveConversation } = useUnifiedMessaging();

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        console.log('🔄 [Services] Loading real services from API...');
        
        // Try to load from the real API first
        const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
        
        try {
          const response = await fetch(`${apiUrl}/api/services`);
          if (response.ok) {
            const data = await response.json();
            console.log('✅ [Services] API response:', data);
            
            if (data.success && data.services && data.services.length > 0) {
              // Map API services to our interface
              const mappedServices = data.services.map((apiService: any) => ({
                id: apiService.id,
                name: apiService.name || apiService.service_name,
                category: apiService.category || apiService.service_category,
                vendorId: apiService.vendor_id || apiService.vendorId,
                vendorName: apiService.vendor_name || apiService.vendorName || 'Wedding Professional',
                description: apiService.description || apiService.service_description || 'Professional wedding service',
                priceRange: apiService.price_range || apiService.priceRange || 'Contact for pricing',
                rating: typeof apiService.rating === 'number' ? apiService.rating : parseFloat(apiService.rating) || 4.5,
                reviewCount: apiService.review_count || apiService.reviewCount || 0,
                image: apiService.main_image || apiService.image || '/images/placeholder-service.jpg',
                location: apiService.location || apiService.address || 'Philippines'
              }));
              
              console.log('✅ [Services] Loaded real services:', mappedServices.length);
              setServices(mappedServices);
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.warn('⚠️ [Services] API failed, using fallback:', apiError);
        }
        
        // Fallback to vendors API
        try {
          const vendorsResponse = await fetch(`${apiUrl}/api/vendors`);
          if (vendorsResponse.ok) {
            const vendorsData = await vendorsResponse.json();
            console.log('✅ [Services] Vendors response:', vendorsData);
            
            if (vendorsData.success && vendorsData.vendors && vendorsData.vendors.length > 0) {
              const vendorServices = vendorsData.vendors.map((vendor: any) => ({
                id: `vendor-service-${vendor.id}`,
                name: `${vendor.business_type || 'Wedding'} Services`,
                category: vendor.business_type || 'Other',
                vendorId: vendor.id,
                vendorName: vendor.name || vendor.business_name || 'Wedding Professional',
                description: vendor.description || `Professional ${vendor.business_type || 'wedding'} services`,
                priceRange: 'Contact for pricing',
                rating: typeof vendor.rating === 'number' ? vendor.rating : parseFloat(vendor.rating) || 4.5,
                reviewCount: vendor.review_count || 0,
                image: vendor.main_image || '/images/placeholder-service.jpg',
                location: vendor.location || 'Philippines'
              }));
              
              console.log('✅ [Services] Loaded vendor services:', vendorServices.length);
              setServices(vendorServices);
              setLoading(false);
              return;
            }
          }
        } catch (vendorError) {
          console.warn('⚠️ [Services] Vendors API failed:', vendorError);
        }
        
        // Final fallback to mock data
        console.log('ℹ️ [Services] Using mock data as fallback');
        setServices(mockServices);
        setLoading(false);
        
      } catch (error) {
        console.error('❌ [Services] Error loading services:', error);
        setServices(mockServices);
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const handleContactVendor = async (service: Service) => {
    try {
      console.log('Contacting vendor:', service.vendorName);
      const conversationId = await createBusinessConversation(
        service.vendorId,
        undefined, // bookingId
        service.category, // serviceType
        service.vendorName // vendorName
      );
      
      if (conversationId) {
        console.log('Conversation created:', conversationId);
        // Open the messaging modal and set active conversation
        setActiveConversation(conversationId);
        setModalOpen(true);
        console.log('📱 [Services] Opening messaging modal for conversation:', conversationId);
      }
    } catch (error) {
      console.error('Error contacting vendor:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <CoupleHeader />
        <div className="pt-20 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading services...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <CoupleHeader />
      <div className="pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Wedding Services</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={service.image || '/images/placeholder-service.jpg'}
                    alt={service.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-rose-600 font-medium">{service.category}</span>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600 ml-1">
                        {service.rating} ({service.reviewCount})
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                  <p className="text-sm text-gray-500 mb-2">by {service.vendorName}</p>
                  <p className="text-sm text-gray-500 mb-4">{service.location}</p>
                  <p className="text-rose-600 font-semibold mb-4">{service.priceRange}</p>
                  
                  <button
                    onClick={() => handleContactVendor(service)}
                    className="w-full bg-rose-500 text-white py-2 px-4 rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    Contact Vendor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
