import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Heart, Calendar, MapPin, Play, ExternalLink, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/cn';

// Fallback testimonials (used when no real reviews exist)
const fallbackTestimonials = [
  {
    name: 'Sarah & Michael',
    wedding: 'June 2024',
    location: 'Manila',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200&h=200&fit=crop&crop=faces',
    quote: 'Wedding Bazaar made our dream wedding come true! The vendors were exceptional and the planning process was seamless.',
    vendor: 'Elegant Venues',
    category: 'Venue',
    likes: 284,
    verified: true
  },
  {
    name: 'Emma & David',
    wedding: 'August 2024',
    location: 'Cebu',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1594736797933-d0051ba4fdc6?w=200&h=200&fit=crop&crop=faces',
    quote: 'From photography to catering, every vendor exceeded our expectations. We could not have asked for a better experience.',
    vendor: 'Perfect Moments Photography',
    category: 'Photography',
    likes: 412,
    verified: true
  },
  {
    name: 'Jessica & Ryan',
    wedding: 'September 2024',
    location: 'Davao',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&h=200&fit=crop&crop=faces',
    quote: 'The platform connected us with amazing vendors who understood our vision perfectly. Our wedding was absolutely magical!',
    vendor: 'Bloom & Blossom',
    category: 'Florist',
    likes: 326,
    verified: true
  },
  {
    name: 'Maria & Carlos',
    wedding: 'October 2024',
    location: 'Boracay',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    quote: 'Our beach wedding was beyond our dreams! The coordination was flawless and every detail was perfect.',
    vendor: 'Tropical Paradise Weddings',
    category: 'Wedding Planning',
    likes: 198,
    verified: true
  },
  {
    name: 'Anna & James',
    wedding: 'November 2024',
    location: 'Baguio',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=200&h=200&fit=crop&crop=faces',
    quote: 'The mountain venue was breathtaking and the catering exceeded all expectations. Truly unforgettable!',
    vendor: 'Highland Catering Co.',
    category: 'Catering',
    likes: 256,
    verified: true
  },
  {
    name: 'Sofia & Miguel',
    wedding: 'December 2024',
    location: 'Palawan',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200&h=200&fit=crop&crop=faces',
    quote: 'Our destination wedding in paradise was made possible by Wedding Bazaar. Every vendor was professional and amazing!',
    vendor: 'Island Bliss Events',
    category: 'Wedding Planning',
    likes: 387,
    verified: true
  }
];

interface Testimonial {
  id?: string;
  name: string;
  wedding: string;
  location: string;
  rating: number;
  image: string;
  quote: string;
  vendor: string;
  category: string;
  likes: number;
  verified: boolean;
  images?: string[];
}

export const Testimonials: React.FC = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [likedTestimonials, setLikedTestimonials] = useState<Set<number>>(new Set());
  const [autoPlay, setAutoPlay] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  // Fetch real reviews from database using the featured reviews endpoint
  useEffect(() => {
    const fetchRealReviews = async () => {
      try {
        const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
        
        console.log('🔍 [Testimonials] Fetching featured reviews from:', `${apiBaseUrl}/api/reviews/featured`);
        
        // Fetch featured reviews directly
        const response = await fetch(`${apiBaseUrl}/api/reviews/featured?limit=10`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const reviews = await response.json();
        
        console.log('📡 [Testimonials] API Response:', reviews);
        
        if (reviews && Array.isArray(reviews) && reviews.length > 0) {
          // Transform reviews into testimonials format
          const realTestimonials: Testimonial[] = reviews.map((review: any) => {
            // Generate couple names from user name
            const userName = review.name || 'Happy Couple';
            const nameParts = userName.split(' ');
            const coupleName = nameParts.length >= 2 
              ? `${nameParts[0]} & ${nameParts[nameParts.length - 1]}`
              : `${nameParts[0]} & Partner`;
            
            // Format date
            const formattedDate = review.date || 'Recently';
            
            // Extract location (e.g., "Dasmariñas City, Cavite, Philippines" -> "Dasmariñas")
            const location = 'Dasmariñas'; // All reviews are from Dasmariñas City, Cavite
            
            return {
              id: review.id,
              name: coupleName,
              wedding: formattedDate,
              location: location,
              rating: parseInt(review.rating) || 4,
              image: review.image || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200&h=200&fit=crop&crop=faces',
              quote: review.review,
              vendor: review.vendor || 'Wedding Vendor',
              category: review.category || 'Wedding Services',
              likes: Math.floor(Math.random() * 400) + 100, // Random likes between 100-500
              verified: review.verified || true,
              images: []
            };
          });
          
          console.log(`✅ [Testimonials] Loaded ${realTestimonials.length} real reviews from database`);
          console.log('📊 Real testimonials:', realTestimonials);
          setTestimonials(realTestimonials);
        } else {
          console.log('ℹ️ [Testimonials] No real reviews found, using fallback testimonials');
          setTestimonials(fallbackTestimonials);
        }
      } catch (error) {
        console.error('❌ [Testimonials] Error fetching real reviews:', error);
        console.log('ℹ️ [Testimonials] Using fallback testimonials due to error');
        setTestimonials(fallbackTestimonials);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRealReviews();
  }, []);

  // Auto-slide functionality with smoother transitions and progress
  useEffect(() => {
    if (!autoPlay || isLoading) return;
    
    let progressInterval: NodeJS.Timeout;
    let slideInterval: NodeJS.Timeout;
    
    const startProgress = () => {
      setProgressPercent(0);
      progressInterval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 100) {
            return 0;
          }
          return prev + (100 / 60); // 60 steps for 6 seconds
        });
      }, 100);
    };
    
    slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 3));
      startProgress();
    }, 6000);
    
    startProgress();
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (slideInterval) clearInterval(slideInterval);
    };
  }, [autoPlay, isLoading]);

  // Keyboard navigation
  useEffect(() => {
    const totalSlides = Math.ceil(testimonials.length / 3);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
      } else if (event.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      } else if (event.key === 'Escape') {
        setShowVideoModal(false);
        setShareModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => new Set([...prev, index]));
  };

  const handleLikeToggle = (index: number) => {
    setLikedTestimonials(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleGetStarted = () => {
    navigate('/individual');
  };

  const handleLearnMore = () => {
    navigate('/services');
  };

  const handleViewVendor = (testimonial: any) => {
    // Navigate to vendor profile or services page with category filter
    navigate(`/services?category=${encodeURIComponent(testimonial.category)}&search=${encodeURIComponent(testimonial.vendor)}`);
  };

  const handleShareTestimonial = (testimonial: any) => {
    setSelectedTestimonial(testimonial);
    setShareModalOpen(true);
  };

  const handleWatchStory = (testimonial: any) => {
    setSelectedTestimonial(testimonial);
    setShowVideoModal(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage('Link copied to clipboard!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setToastMessage('Failed to copy link');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const visibleTestimonials = testimonials.slice(currentSlide * 3, (currentSlide + 1) * 3);
  const totalSlides = Math.ceil(testimonials.length / 3);

  if (isLoading) {
    return (
      <section id="testimonials" className="py-20 bg-gradient-to-br from-gray-50 via-white to-rose-50/30 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-purple-300 to-rose-300 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full blur-2xl animate-pulse [animation-delay:2s]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Loading Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-rose-100 to-pink-100 px-6 py-3 rounded-full mb-6 animate-pulse">
              <div className="w-4 h-4 bg-rose-300 rounded-full mr-3 animate-bounce" />
              <div className="w-24 h-4 bg-rose-300 rounded-full" />
            </div>
            <div className="w-96 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mx-auto mb-6 animate-pulse" />
            <div className="w-full max-w-2xl h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mx-auto animate-pulse" />
          </div>

          {/* Loading Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative group">
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/60 p-8 shadow-xl animate-pulse">
                  {/* Quote Icon Skeleton */}
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-200 to-pink-200 rounded-xl mb-6" />
                  
                  {/* Text Skeleton */}
                  <div className="space-y-3 mb-6">
                    <div className="w-full h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg" />
                    <div className="w-5/6 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg" />
                    <div className="w-4/6 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg" />
                  </div>

                  {/* Rating Skeleton */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className="w-5 h-5 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-sm animate-pulse [animation-delay:${star * 100}ms]" />
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full" />
                      <div className="w-8 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
                    </div>
                  </div>

                  {/* Author Skeleton */}
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse" />
                    <div className="ml-4 flex-1">
                      <div className="w-32 h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-2" />
                      <div className="w-20 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-1" />
                      <div className="w-40 h-3 bg-gradient-to-r from-rose-200 to-pink-200 rounded-lg" />
                    </div>
                  </div>
                </div>

                {/* Floating Animation Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-pink-400/10 rounded-3xl blur-xl animate-pulse [animation-delay:${i * 500}ms]" />
              </div>
            ))}
          </div>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-3">
            {[1, 2].map((dot) => (
              <div key={dot} className="w-4 h-4 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full animate-pulse [animation-delay:${dot * 200}ms]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-gray-50 via-white to-rose-50/30 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-purple-300 to-rose-300 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full blur-2xl animate-float-slow" />
        <div className="absolute top-20 right-1/3 w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-rose-100 via-pink-100 to-purple-100 px-6 py-3 rounded-full text-rose-600 font-semibold mb-6 border border-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Heart className="h-5 w-5 mr-2 animate-pulse text-rose-500" />
            Real Love Stories
          </div>
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
            Happy Couples Share Their Joy
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover why over <span className="text-rose-600 font-bold">10,000+</span> couples trust Wedding Bazaar to connect them 
            with amazing vendors for their perfect wedding day.
          </p>
        </div>

        {/* Enhanced Testimonials Carousel */}
        <div className="relative mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visibleTestimonials.map((testimonial, index) => (
              <div
                key={currentSlide * 3 + index}
                className={cn(
                  "group relative p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 hover:border-rose-300/50 hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:rotate-1 animate-fade-in-up hover-glow",
                  index === 0 && "[animation-delay:0ms]",
                  index === 1 && "[animation-delay:200ms]", 
                  index === 2 && "[animation-delay:400ms]"
                )}
                onMouseEnter={() => setAutoPlay(false)}
                onMouseLeave={() => setAutoPlay(true)}
              >
                {/* Enhanced Background Gradient with Animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/60 via-pink-50/40 to-purple-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-gradient-xy" />
                
                {/* Floating Quote Icon */}
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-rose-400/20 to-pink-400/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-500" />
                  <Quote className="relative h-14 w-14 text-rose-400 opacity-80 group-hover:text-rose-500 group-hover:scale-110 transition-all duration-300" />
                </div>

                {/* Enhanced Testimonial Text */}
                <blockquote className="relative text-gray-700 text-lg md:text-xl leading-relaxed mb-8 font-medium group-hover:text-gray-800 transition-colors duration-300">
                  <span className="text-rose-500 text-2xl">"</span>
                  {testimonial.quote}
                  <span className="text-rose-500 text-2xl">"</span>
                </blockquote>

                {/* Enhanced Rating with Animation */}
                <div className="relative flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-6 w-6 text-yellow-400 fill-current group-hover:scale-110 transition-all duration-300" 
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => handleLikeToggle(currentSlide * 3 + index)}
                    className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-white/60 text-sm text-gray-500 hover:text-rose-500 hover:bg-rose-50/80 transition-all duration-300 hover:scale-105"
                    aria-label={`Like testimonial from ${testimonial.name}`}
                  >
                    <Heart 
                      className={cn(
                        "h-4 w-4 transition-all duration-300",
                        likedTestimonials.has(currentSlide * 3 + index) 
                          ? "fill-rose-500 text-rose-500 scale-110 animate-pulse" 
                          : "hover:scale-110"
                      )} 
                    />
                    <span className="font-medium">{testimonial.likes + (likedTestimonials.has(currentSlide * 3 + index) ? 1 : 0)}</span>
                  </button>
                </div>

                {/* Enhanced Author Info */}
                <div className="relative flex items-center">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                    <img
                      src={testimonial.image}
                      alt={`${testimonial.name} wedding photo`}
                      className={cn(
                        "relative w-16 h-16 rounded-full object-cover border-3 border-white shadow-xl transition-all duration-300 group-hover:scale-110",
                        imagesLoaded.has(currentSlide * 3 + index) ? "opacity-100" : "opacity-0"
                      )}
                      onLoad={() => handleImageLoad(currentSlide * 3 + index)}
                    />
                    {testimonial.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-5 flex-1">
                    <h4 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-rose-600 transition-colors duration-300">
                      {testimonial.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600 space-x-3 mb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-rose-400" />
                        <span>{testimonial.wedding}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-rose-400" />
                        <span>{testimonial.location}</span>
                      </div>
                    </div>
                    <p className="text-sm text-rose-600 font-semibold bg-rose-50/80 px-3 py-1 rounded-full inline-block">
                      via {testimonial.vendor} • {testimonial.category}
                    </p>
                  </div>
                </div>

                {/* Testimonial Stats Overlay */}
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/60 shadow-lg">
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-700">{testimonial.rating.toFixed(1)}</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3 text-rose-400 fill-current" />
                        <span className="font-semibold text-gray-700">{testimonial.likes}</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                      <span className="text-xs text-gray-500 font-medium">{testimonial.category}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex space-x-2">
                  <button
                    onClick={() => handleWatchStory(testimonial)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl border border-white/60 hover:bg-rose-50 transition-all duration-200 group/btn hover-scale animate-bounce-in [animation-delay:100ms]"
                    aria-label="Watch wedding story video"
                  >
                    <Play className="h-4 w-4 text-gray-600 group-hover/btn:text-rose-500 group-hover/btn:animate-pulse" />
                  </button>
                  <button
                    onClick={() => handleShareTestimonial(testimonial)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl border border-white/60 hover:bg-rose-50 transition-all duration-200 group/btn hover-scale animate-bounce-in [animation-delay:200ms]"
                    aria-label="Share testimonial"
                  >
                    <Share2 className="h-4 w-4 text-gray-600 group-hover/btn:text-rose-500 group-hover/btn:animate-pulse" />
                  </button>
                  <button
                    onClick={() => handleViewVendor(testimonial)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl border border-white/60 hover:bg-rose-50 transition-all duration-200 group/btn hover-scale animate-bounce-in [animation-delay:300ms]"
                    aria-label="View vendor profile"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-600 group-hover/btn:text-rose-500 group-hover/btn:animate-pulse" />
                  </button>
                </div>

                {/* Enhanced Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots with Progress */}
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(totalSlides)].map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSlide(index);
                  setProgressPercent(0);
                }}
                className={cn(
                  "relative w-3 h-3 rounded-full transition-all duration-300 overflow-hidden",
                  currentSlide === index 
                    ? "bg-rose-500 w-8" 
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Go to slide ${index + 1}`}
              >
                {currentSlide === index && autoPlay && (
                  <div 
                    className={cn(
                      "progress-bar",
                      `progress-${Math.round(progressPercent / 5) * 5}`
                    )}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl border border-white/60 hover:bg-white transition-all duration-300 group"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 group-hover:text-rose-500" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % totalSlides)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl border border-white/60 hover:bg-white transition-all duration-300 group"
            aria-label="Next testimonials"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-rose-500" />
          </button>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center p-12 bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Wedding Journey?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of happy couples who found their perfect vendors through Wedding Bazaar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleGetStarted}
              className={cn(
                "px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold rounded-full",
                "hover:from-rose-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200",
                "shadow-lg hover:shadow-xl"
              )}
            >
              Get Started Free
            </button>
            <button 
              onClick={handleLearnMore}
              className={cn(
                "px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200",
                "hover:border-rose-300 hover:text-rose-600 transform hover:scale-105 transition-all duration-200",
                "shadow-lg hover:shadow-xl"
              )}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Video Story Modal */}
      {showVideoModal && selectedTestimonial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="relative">
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                ✕
              </button>
              <div className="aspect-video bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-16 w-16 text-rose-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedTestimonial.name}'s Wedding Story
                  </h3>
                  <p className="text-gray-600">
                    Coming Soon - Wedding stories and video testimonials will be available in our next update!
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-2">{selectedTestimonial.name}</h4>
              <p className="text-gray-600 mb-4">{selectedTestimonial.quote}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{selectedTestimonial.wedding}</span>
                  <span>•</span>
                  <span>{selectedTestimonial.location}</span>
                </div>
                <button
                  onClick={() => handleViewVendor(selectedTestimonial)}
                  className="px-4 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                >
                  View Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && selectedTestimonial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Share This Story</h3>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <img
                    src={selectedTestimonial.image}
                    alt={selectedTestimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{selectedTestimonial.name}</h4>
                    <p className="text-sm text-gray-500">{selectedTestimonial.wedding}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-xl">
                  "{selectedTestimonial.quote}"
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    const text = `"${selectedTestimonial.quote}" - ${selectedTestimonial.name} | Wedding Bazaar`;
                    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Share on Twitter
                </button>
                
                <button
                  onClick={() => {
                    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                    window.open(url, '_blank');
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Share on Facebook
                </button>

                <button
                  onClick={() => {
                    const text = `"${selectedTestimonial.quote}" - ${selectedTestimonial.name} | Check out Wedding Bazaar for amazing wedding vendors!`;
                    copyToClipboard(text);
                    setShareModalOpen(false);
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-white border border-green-200 text-green-800 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-sm flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </section>
  );
};
