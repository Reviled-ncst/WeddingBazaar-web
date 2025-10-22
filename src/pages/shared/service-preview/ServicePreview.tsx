import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Share2,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Copy,
  Facebook,
  Twitter,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { VendorMap, type VendorLocation } from '../../../shared/components/maps/VendorMap';
import { VendorAvailabilityCalendar } from '../../../shared/components/calendar/VendorAvailabilityCalendar';

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
  features?: string[];
  tags?: string[];
  keywords?: string;
  
  // DSS Fields (Dynamic Service Scoring)
  years_in_business?: number;
  service_tier?: 'premium' | 'standard' | 'basic';
  wedding_styles?: string[];
  cultural_specialties?: string[];
  availability?: any; // Can be string or object
  
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

export const ServicePreview: React.FC = () => {
  const { serviceId: slugParam } = useParams<{ serviceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);

  // Get the actual service ID from query params (secure, not exposed in slug)
  const serviceId = searchParams.get('id') || slugParam;

  // Function to geocode address to coordinates
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      // Use a free geocoding service (Nominatim)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        return [lat, lng];
      }
    } catch (error) {
      console.warn('Geocoding failed:', error);
    }
    
    // Default to Manila coordinates if geocoding fails
    return [14.5995, 120.9842];
  };

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) {
        setError('Service ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com'}/api/services/${serviceId}`);
        
        if (!response.ok) {
          throw new Error(`Service not found (${response.status})`);
        }

        const data = await response.json();
        
        if (data.success && data.service) {
          setService(data.service);
          
          // Geocode the service location if available
          const serviceLocation = (data.service as any).location;
          if (serviceLocation) {
            const coords = await geocodeAddress(serviceLocation);
            setLocationCoords(coords);
          }
        } else {
          throw new Error('Service data not available');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load service';
        console.error('❌ Error fetching service:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'native') => {
    const url = window.location.href;
    const title = service ? `Check out this wedding service: ${service.title}` : 'Wedding Service';
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({ title, url });
        } else {
          handleCopyLink();
        }
        break;
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading service details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The service you\'re looking for doesn\'t exist or has been removed.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
          >
            Back to Homepage
          </button>
        </motion.div>
      </div>
    );
  }

  const images = service.images?.filter(img => img && img.trim() !== '') || [];
  const hasImages = images.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Ultra-Premium Floating Header with Gradient Border */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-white/10 via-pink-50/10 to-purple-50/10 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Premium Back Button with Glow Effect */}
            <motion.button
              whileHover={{ scale: 1.08, x: -8 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-pink-500/50 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <ArrowLeft size={22} className="relative z-10 group-hover:-translate-x-2 transition-transform duration-300" />
              <span className="relative z-10 text-lg">Back</span>
            </motion.button>
            
            {/* Premium Action Buttons with Glow */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.08, rotate: 5 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleCopyLink}
                className={`relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold shadow-2xl transition-all duration-500 overflow-hidden ${
                  copySuccess
                    ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-white/90 via-pink-50/90 to-purple-50/90 text-gray-900 hover:shadow-white/50'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
                {copySuccess ? (
                  <>
                    <CheckCircle2 size={20} className="relative z-10 animate-pulse" />
                    <span className="relative z-10 hidden sm:inline text-lg">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={20} className="relative z-10" />
                    <span className="relative z-10 hidden sm:inline text-lg">Copy Link</span>
                  </>
                )}
              </motion.button>
              
              {/* Premium Share Button with Animated Dropdown */}
              <div className="relative group">
                <motion.button 
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <Share2 size={20} className="relative z-10" />
                  <span className="relative z-10 hidden sm:inline text-lg">Share</span>
                </motion.button>
                
                {/* Ultra-Premium Dropdown with Glassmorphism */}
                <div className="absolute right-0 top-full mt-4 w-64 bg-gradient-to-br from-white/95 via-pink-50/95 to-purple-50/95 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 overflow-hidden z-50">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10"></div>
                  <div className="relative p-3 space-y-2">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left bg-gradient-to-r from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 rounded-2xl transition-all duration-300 group/item"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300 shadow-lg">
                        <Facebook size={20} className="text-white" />
                      </div>
                      <span className="font-bold text-gray-900 text-lg">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left bg-gradient-to-r from-sky-500/10 to-sky-600/10 hover:from-sky-500/20 hover:to-sky-600/20 rounded-2xl transition-all duration-300 group/item"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300 shadow-lg">
                        <Twitter size={20} className="text-white" />
                      </div>
                      <span className="font-medium text-gray-700">Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('native')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 rounded-xl transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Share2 size={18} className="text-white" />
                      </div>
                      <span className="font-medium text-gray-700">More Options</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content - ULTRA-PREMIUM Layout with Dark Theme */}
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section - CINEMATIC Magazine Style */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              
              {/* Left: Image Gallery - STUNNING Premium Design with 3D Effects */}
              <div className="space-y-8">
                {hasImages ? (
                  <>
                    {/* Main Image - Cinematic Hero Style with Parallax */}
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_25px_80px_-15px_rgba(0,0,0,0.5)] group perspective-1000"
                      style={{
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      {/* Glowing Border Effect */}
                      <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-pink-500 via-purple-500 to-rose-500 p-[3px] opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="w-full h-full bg-black rounded-[29px]"></div>
                      </div>
                      
                      <img
                        src={images[currentImageIndex]}
                        alt={service.title}
                        className="relative z-10 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                      />
                      
                      {/* Cinematic Gradient Overlays */}
                      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 z-20 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Floating Image Counter with Glassmorphism */}
                      {images.length > 1 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="absolute bottom-8 right-8 z-30 px-6 py-3 bg-white/10 backdrop-blur-2xl rounded-2xl text-white font-bold text-lg border border-white/20 shadow-2xl"
                        >
                          {currentImageIndex + 1} <span className="text-pink-300">/</span> {images.length}
                        </motion.div>
                      )}
                      
                      {/* Premium Badge Overlay */}
                      {service.featured && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 }}
                          className="absolute top-8 left-8 z-30 px-5 py-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-2xl shadow-2xl flex items-center gap-2 animate-pulse"
                        >
                          <Star size={18} className="text-white fill-white" />
                          <span className="text-white font-black uppercase tracking-wider text-sm">Featured</span>
                        </motion.div>
                      )}
                    </motion.div>
                    
                    {/* Thumbnail Gallery - Luxury Carousel with 3D Hover */}
                    {images.length > 1 && (
                      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
                        {images.map((image, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.15, y: -8, rotateZ: 3 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative flex-shrink-0 w-28 h-28 rounded-3xl overflow-hidden transition-all duration-500 ${
                              index === currentImageIndex
                                ? 'ring-4 ring-pink-500 shadow-[0_10px_40px_-5px_rgba(236,72,153,0.6)]'
                                : 'ring-2 ring-white/20 hover:ring-white/40 shadow-xl'
                            }`}
                            style={{
                              transform: 'translateZ(0)',
                              backfaceVisibility: 'hidden',
                            }}
                          >
                            <img
                              src={image}
                              alt={`${service.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Active Indicator Glow */}
                            {index === currentImageIndex && (
                              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30 backdrop-blur-[1px]"></div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // No Image Placeholder - STUNNING Minimalist Design
                  <div className="aspect-[4/3] rounded-[32px] bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8)] border border-white/10">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10">
                        <ImageIcon size={64} className="text-white/40" />
                      </div>
                      <p className="text-white/60 font-bold text-lg">No images available</p>
                      <p className="text-white/40 text-sm mt-2">Gallery coming soon</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Service Information - ULTRA-PREMIUM Glassmorphic Card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* STUNNING Premium Info Card with Glassmorphism & Gradients */}
                <div className="relative bg-gradient-to-br from-white/10 via-pink-50/10 to-purple-50/10 backdrop-blur-3xl rounded-[32px] p-10 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">
                  {/* Animated Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-rose-500/5 animate-pulse" />
                  
                  {/* Content Layer */}
                  <div className="relative z-10">
                    {/* PREMIUM Animated Badges Row */}
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="px-6 py-3 bg-gradient-to-r from-rose-500 via-pink-600 to-rose-500 text-white rounded-2xl font-black text-base shadow-[0_10px_30px_-5px_rgba(236,72,153,0.5)] uppercase tracking-wider"
                      >
                        {service.category}
                      </motion.span>
                      {service.service_tier && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 }}
                          className={`px-6 py-3 rounded-2xl font-black uppercase tracking-wider text-base shadow-2xl ${
                            service.service_tier === 'premium' 
                              ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white shadow-purple-500/50'
                              : service.service_tier === 'standard'
                              ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-600 text-white shadow-cyan-500/50'
                              : 'bg-gradient-to-r from-gray-600 via-slate-500 to-gray-700 text-white shadow-gray-500/50'
                          }`}
                        >
                          {service.service_tier} Tier
                        </motion.span>
                      )}
                    </div>

                    {/* DRAMATIC Title with Gradient Text */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="text-5xl font-black mb-6 leading-tight bg-gradient-to-br from-white via-pink-100 to-purple-100 bg-clip-text text-transparent"
                      style={{ 
                        textShadow: '0 2px 40px rgba(236, 72, 153, 0.3)',
                      }}
                    >
                      {service.title || service.name}
                    </motion.h1>

                    {/* SPECTACULAR Price Display */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="mb-8"
                    >
                      <div className="relative inline-flex items-baseline gap-3 px-8 py-6 bg-gradient-to-br from-pink-500/20 via-rose-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl border-2 border-pink-300/30 shadow-[0_20px_60px_-15px_rgba(236,72,153,0.5)]">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-3xl animate-pulse" />
                        <span className="relative z-10 text-5xl font-black bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                          {(service as any).price_range && (service as any).price_range !== '₱' 
                            ? (service as any).price_range 
                            : formatPrice(service.price)}
                        </span>
                      </div>
                    </motion.div>

                    {/* LUXURY Rating Display */}
                    {service.vendor?.rating && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="flex items-center gap-5 p-6 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 backdrop-blur-xl rounded-3xl border border-amber-300/20 mb-8 shadow-[0_10px_40px_-10px_rgba(251,191,36,0.3)]"
                      >
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={24}
                              className={`transition-all duration-300 ${
                                i < Math.floor(service.vendor?.rating || 0) 
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' 
                                  : 'text-white/20'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-black text-white">{service.vendor.rating}</span>
                          {service.vendor.review_count && (
                            <span className="text-base text-white/70 font-medium">({service.vendor.review_count} reviews)</span>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* MODERN Quick Stats Grid with Animations */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                      className="grid grid-cols-2 gap-5 mb-8"
                    >
                      {/* Experience Stat */}
                      {service.years_in_business && (
                        <div className="relative p-6 bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-purple-600/10 backdrop-blur-xl rounded-3xl border border-purple-300/20 text-center group hover:scale-105 transition-transform duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative z-10">
                            <div className="text-4xl font-black bg-gradient-to-br from-purple-300 to-indigo-300 bg-clip-text text-transparent mb-2">
                              {service.years_in_business}+
                            </div>
                            <div className="text-sm font-bold text-white/80 uppercase tracking-wide">Years Experience</div>
                          </div>
                        </div>
                      )}

                      {/* Availability Status */}
                      <div className={`relative p-6 backdrop-blur-xl rounded-3xl border text-center group hover:scale-105 transition-transform duration-300 ${
                        service.is_active !== false
                          ? 'bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-emerald-600/10 border-emerald-300/20'
                          : 'bg-gradient-to-br from-gray-500/10 via-slate-500/10 to-gray-600/10 border-gray-300/20'
                      }`}>
                        <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          service.is_active !== false
                            ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20'
                            : 'bg-gradient-to-br from-gray-500/20 to-slate-500/20'
                        }`} />
                        <div className="relative z-10">
                          <div className={`text-2xl font-black mb-2 ${
                            service.is_active !== false 
                              ? 'bg-gradient-to-br from-emerald-300 to-green-300 bg-clip-text text-transparent' 
                              : 'text-white/60'
                          }`}>
                            {service.is_active !== false ? '✓ Available' : '✗ Unavailable'}
                          </div>
                          <div className="text-sm font-bold text-white/80 uppercase tracking-wide">Booking Status</div>
                        </div>
                      </div>
                    </motion.div>

                    {/* ELEGANT Location Display */}
                    {(service as any).location && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                        className="flex items-start gap-4 p-6 bg-gradient-to-r from-gray-500/10 via-slate-500/10 to-gray-600/10 backdrop-blur-xl rounded-3xl border border-white/10 mb-8"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                          <MapPin size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-black text-white/90 mb-2 uppercase tracking-wider">Service Location</div>
                          <div className="text-base text-white/70 font-medium">{(service as any).location}</div>
                        </div>
                      </motion.div>
                    )}

                    {/* PREMIUM CTA Buttons with Spectacular Hover Effects */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      className="space-y-4"
                    >
                      <motion.button
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/individual/services')}
                        className="relative w-full px-10 py-6 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white rounded-3xl font-black text-xl shadow-[0_20px_60px_-15px_rgba(236,72,153,0.6)] hover:shadow-[0_25px_80px_-10px_rgba(236,72,153,0.8)] transition-all duration-500 flex items-center justify-center gap-4 overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <MessageCircle size={28} className="relative z-10" />
                        <span className="relative z-10">Book This Service Now</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative w-full px-10 py-5 bg-gradient-to-r from-white/10 via-pink-50/10 to-purple-50/10 backdrop-blur-xl text-white rounded-3xl font-bold text-lg border-2 border-white/20 hover:border-pink-300/50 hover:bg-white/20 transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-pink-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <Heart size={22} className="relative z-10" />
                        <span className="relative z-10">Save to Favorites</span>
                      </motion.button>
                    </motion.div>
                  </div>
                </div>

                {/* LUXURY Vendor Info Card with Dark Elegance */}
                {service.vendor && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    className="relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-black/90 backdrop-blur-2xl text-white rounded-[32px] p-8 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
                    <div className="relative z-10">
                      <h3 className="text-xl font-black mb-6 text-white/90 uppercase tracking-wider">Provided By</h3>
                      <div className="space-y-4">
                        <div className="text-3xl font-black bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 bg-clip-text text-transparent">
                          {service.vendor.name || service.vendor.business_name}
                        </div>
                        {service.vendor.category && (
                          <div className="text-base text-white/60 font-medium uppercase tracking-wide">{service.vendor.category}</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* CINEMATIC Description Section with Luxury Design */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="relative bg-gradient-to-br from-white/10 via-pink-50/10 to-purple-50/10 backdrop-blur-3xl rounded-[32px] p-12 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 animate-pulse" />
            
            <div className="relative z-10">
              {/* PREMIUM Section Header */}
              <div className="flex items-center gap-5 mb-8">
                <div className="w-2 h-16 bg-gradient-to-b from-rose-500 via-pink-600 to-purple-600 rounded-full shadow-lg" />
                <h2 className="text-4xl font-black bg-gradient-to-r from-white via-pink-100 to-purple-100 bg-clip-text text-transparent">
                  About This Service
                </h2>
              </div>
              
              {/* ELEGANT Description Text */}
              <p className="text-xl text-white/90 leading-relaxed whitespace-pre-wrap font-light tracking-wide">
                {service.description || 'No description provided for this service.'}
              </p>
            </div>
          </motion.div>

          {/* STUNNING Wedding Styles & Specialties with Gradient Cards */}
          {((service.wedding_styles && service.wedding_styles.length > 0) || 
            (service.cultural_specialties && service.cultural_specialties.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10"
            >
              {/* LUXURY Wedding Styles Card */}
              {service.wedding_styles && service.wedding_styles.length > 0 && (
                <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-white backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-pink-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Star size={24} className="text-white fill-white" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">Wedding Styles</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {service.wedding_styles.map((style, index) => (
                      <motion.span
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {style}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Specialties */}
              {service.cultural_specialties && service.cultural_specialties.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-white backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Globe size={24} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">Cultural Specialties</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {service.cultural_specialties.map((specialty, index) => (
                      <motion.span
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {specialty}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Location & Availability - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interactive Map */}
            {(service as any).location && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Location</h2>
                <div className="h-80 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <VendorMap
                    vendors={[{
                      id: service.id,
                      name: service.title || service.name || 'Service Location',
                      category: service.category,
                      latitude: locationCoords ? locationCoords[0] : 14.5995,
                      longitude: locationCoords ? locationCoords[1] : 120.9842,
                      address: (service as any).location,
                      priceRange: (service as any).price_range,
                      description: service.description,
                      rating: service.vendor?.rating,
                      reviewCount: service.vendor?.review_count
                    } as VendorLocation]}
                    center={locationCoords || [14.5995, 120.9842]}
                    zoom={15}
                    height="320px"
                    showAddressSearch={false}
                    showVendorCount={false}
                    showUserLocation={false}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Availability Calendar */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Check Availability</h2>
              <div className="bg-white rounded-xl p-4">
                <VendorAvailabilityCalendar
                  vendorId={service.vendor_id}
                  className="w-full"
                  onDateSelect={(date, availability) => {
                    console.log('Selected date:', date, 'Availability:', availability);
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Select a date to check availability and book this service
              </p>
            </div>
          </div>



          {/* Features and Tags - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Service Features */}
            {(service as any).features && (service as any).features.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Features</h2>
                <div className="space-y-2">
                  {(service as any).features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {(service as any).tags && (service as any).tags.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-3">
                  {(service as any).tags.map((tag: string, index: number) => (
                    <span key={index} className="px-4 py-2 bg-purple-100 text-purple-800 rounded-xl text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Service and Vendor Information - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Service Information */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Information</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service ID:</span>
                  <span className="font-mono text-gray-900">{service.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Business:</span>
                  <span className="font-medium text-gray-900">
                    {service.vendor?.business_name || service.vendor?.name || `ID: ${service.vendor_id}`}
                  </span>
                </div>
                
                {service.vendor?.rating && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="font-medium">{service.vendor.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                
                {(service as any).created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">
                      {new Date((service as any).created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                {(service as any).updated_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-900">
                      {new Date((service as any).updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                {(service as any).keywords && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Keywords:</span>
                    <span className="text-gray-900 text-right max-w-32 truncate" title={(service as any).keywords}>
                      {(service as any).keywords}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Vendor Information */}
            {service.vendor && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendor Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {service.vendor.business_name || service.vendor.name}
                    </h3>
                    {service.vendor.category && (
                      <p className="text-sm text-gray-600 mt-1">{service.vendor.category}</p>
                    )}
                  </div>
                  
                  {service.vendor.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} />
                      <span>{service.vendor.location}</span>
                    </div>
                  )}
                  
                  {(service.vendor.rating || service.vendor.review_count) && (
                    <div className="flex items-center gap-4 text-sm">
                      {service.vendor.rating && (
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span className="font-medium">{service.vendor.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {service.vendor.review_count && (
                        <span className="text-gray-600">
                          {service.vendor.review_count} reviews
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    {service.vendor.phone && (
                      <a
                        href={`tel:${service.vendor.phone}`}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
                      >
                        <Phone size={16} />
                        Call
                      </a>
                    )}
                    
                    {service.vendor.email && (
                      <a
                        href={`mailto:${service.vendor.email}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
                      >
                        <Mail size={16} />
                        Email
                      </a>
                    )}
                    
                    {service.vendor.website && (
                      <a
                        href={service.vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors"
                      >
                        <Globe size={16} />
                        Website
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Final Action Buttons */}
          <div className="bg-gradient-to-br from-white/10 via-pink-50/10 to-purple-50/10 backdrop-blur-3xl rounded-[32px] p-8 border border-white/20 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row gap-5 max-w-2xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/individual/services')}
                className="flex-1 px-10 py-5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white rounded-3xl font-black text-lg shadow-[0_20px_60px_-15px_rgba(236,72,153,0.6)] hover:shadow-[0_25px_80px_-10px_rgba(236,72,153,0.8)] transition-all duration-500 flex items-center justify-center gap-3"
              >
                <MessageCircle size={24} />
                Book This Service
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-gradient-to-r from-white/10 via-pink-50/10 to-purple-50/10 backdrop-blur-xl text-white rounded-3xl font-bold text-lg border-2 border-white/20 hover:border-pink-300/50 hover:bg-white/20 transition-all duration-500 flex items-center justify-center gap-3"
              >
                <Heart size={24} />
                Save
              </motion.button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
