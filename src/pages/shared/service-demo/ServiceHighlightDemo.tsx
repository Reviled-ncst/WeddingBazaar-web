import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Image as ImageIcon,
  ExternalLink,
  Copy,
  Loader2,
  AlertTriangle,
  Eye,
  Tag,
  Camera
} from 'lucide-react';
import { Header } from '../../../shared/components/layout/Header';

interface Service {
  id: string;
  vendor_id: string;
  title: string;
  name?: string;
  description: string;
  category: string;
  price: string | number;
  images?: string[];
  featured?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  location?: string;
  price_range?: string;
  vendor?: {
    id: string;
    name: string;
    business_name?: string;
    category?: string;
    rating?: number;
    review_count?: number;
    location?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export const ServiceHighlightDemo: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedServiceId, setHighlightedServiceId] = useState<string | null>(null);

  // Get API base URL
  const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

  // Check for highlighted service from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightId = urlParams.get('highlight') || serviceId;
    if (highlightId) {
      console.log('🎯 Demo highlighting service:', highlightId);
      setHighlightedServiceId(highlightId);
      
      // Scroll to highlighted service after a short delay
      setTimeout(() => {
        const element = document.querySelector(`[data-service-id="${highlightId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          console.log('📜 Scrolled to highlighted service:', highlightId);
        }
      }, 1500);
      
      // Remove highlight after 15 seconds (extended for demo)
      setTimeout(() => {
        console.log('⏰ Removing highlight from service:', highlightId);
        setHighlightedServiceId(null);
      }, 15000);
    }
  }, [serviceId]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Loading services for demo...');
        
        const response = await fetch(`${apiUrl}/api/services?limit=20`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Services loaded for demo:', result);
          
          if (result.success && Array.isArray(result.services)) {
            setServices(result.services);
          } else {
            setServices([]);
          }
        } else {
          console.warn('⚠️ API response not OK');
          setServices([]);
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('❌ Error loading services:', errorMessage);
        setError(errorMessage);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);



  const handleCopyLink = async (serviceId: string) => {
    try {
      const url = `${window.location.origin}/demo/services?highlight=${serviceId}`;
      await navigator.clipboard.writeText(url);
      console.log('✅ Copied demo link:', url);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = '✅ Demo link copied to clipboard!';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen pt-24">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading service highlight demo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || services.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen pt-24">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Demo Unavailable</h2>
            <p className="text-gray-600 mb-4">Unable to load services for the highlight demo.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 relative">
      <Header />
      
      <main className="pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Demo Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
              <Eye className="w-4 h-4" />
              Service Highlight Demo
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Service Highlighting Feature
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              This demo showcases how services can be highlighted when shared via URL parameters. 
              {highlightedServiceId && (
                <span className="block mt-2 font-semibold text-rose-600">
                  Currently highlighting: {highlightedServiceId}
                </span>
              )}
            </p>
          </div>

          {/* Demo Instructions */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Try These Demo Links:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.slice(0, 6).map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{service.id}</p>
                    <p className="text-xs text-gray-600 truncate">{service.title}</p>
                  </div>
                  <button
                    onClick={() => handleCopyLink(service.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-rose-500 text-white text-xs rounded hover:bg-rose-600 transition-colors"
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                data-service-id={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: highlightedServiceId === service.id ? [1, 1.02, 1, 1.02, 1] : 1
                }}
                transition={{ 
                  delay: index * 0.1,
                  scale: highlightedServiceId === service.id ? { duration: 2, repeat: 3, repeatType: "loop" } : {}
                }}
                className={`group bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border ${
                  highlightedServiceId === service.id 
                    ? 'border-rose-500 shadow-rose-300 ring-4 ring-rose-400 bg-gradient-to-br from-rose-50 to-pink-50 shadow-2xl' 
                    : 'border-white/50'
                }`}
              >
                {/* Service Image */}
                <div className="relative h-56 bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 overflow-hidden">
                  {service.images && service.images.length > 0 && service.images[0] ? (
                    <>
                      <img
                        src={service.images[0]}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {service.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <Camera size={12} />
                          +{service.images.length - 1}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-rose-300 mx-auto mb-2" />
                        <p className="text-rose-400 text-sm">No photos uploaded</p>
                        <p className="text-rose-300 text-xs">Click Edit to add images</p>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      service.is_active 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : 'bg-gray-500 text-white shadow-lg'
                    }`}>
                      {service.is_active ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {/* Highlight Badge */}
                  {highlightedServiceId === service.id && (
                    <div className="absolute top-3 right-3">
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-3 py-1 bg-rose-500 text-white rounded-full text-xs font-medium shadow-lg flex items-center gap-1"
                      >
                        ⭐ Highlighted
                      </motion.span>
                    </div>
                  )}
                </div>

                {/* Service Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-rose-600 transition-colors">
                        {service.title || service.name || 'Untitled Service'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Tag size={14} />
                        <span>{service.category}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {service.description || 'No description available.'}
                  </p>

                  {/* Price Range */}
                  {service.price_range && (
                    <div className="mb-4">
                      <p className="text-lg font-bold text-rose-600">
                        {service.price_range}
                      </p>
                    </div>
                  )}

                  {/* Location */}
                  {service.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <MapPin size={14} />
                      <span className="line-clamp-1">{service.location}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCopyLink(service.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-xs font-medium"
                      title="Copy demo link for this service"
                    >
                      <Copy size={14} />
                      Copy Demo Link
                    </button>
                    
                    <button
                      onClick={() => window.open(`/service/${service.id}`, '_blank')}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-medium"
                      title="View service preview"
                    >
                      <ExternalLink size={14} />
                      Preview
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
