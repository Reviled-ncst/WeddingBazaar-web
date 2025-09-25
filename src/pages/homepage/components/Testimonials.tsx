import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Heart, Calendar, MapPin } from 'lucide-react';
import { cn } from '../../../utils/cn';

const testimonials = [
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

export const Testimonials: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [likedTestimonials, setLikedTestimonials] = useState<Set<number>>(new Set());
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 3));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoPlay]);

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

  const visibleTestimonials = testimonials.slice(currentSlide * 3, (currentSlide + 1) * 3);
  const totalSlides = Math.ceil(testimonials.length / 3);

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-gray-50 via-white to-rose-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-rose-100 px-4 py-2 rounded-full text-rose-600 font-medium mb-4">
            <Heart className="h-4 w-4 mr-2" />
            Real Love Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Happy Couples Share Their Joy
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover why over 10,000+ couples trust Wedding Bazaar to connect them 
            with amazing vendors for their perfect wedding day.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visibleTestimonials.map((testimonial, index) => (
              <div
                key={currentSlide * 3 + index}
                className="group relative p-8 bg-white/90 backdrop-blur-sm rounded-3xl border border-white/60 hover:border-rose-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                onMouseEnter={() => setAutoPlay(false)}
                onMouseLeave={() => setAutoPlay(true)}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Quote Icon */}
                <div className="relative mb-6">
                  <Quote className="h-12 w-12 text-rose-400 opacity-70" />
                </div>

                {/* Testimonial Text */}
                <blockquote className="relative text-gray-700 text-lg leading-relaxed mb-6 font-medium">
                  "{testimonial.quote}"
                </blockquote>

                {/* Rating */}
                <div className="relative flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <button
                    onClick={() => handleLikeToggle(currentSlide * 3 + index)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-rose-500 transition-colors"
                    aria-label={`Like testimonial from ${testimonial.name}`}
                  >
                    <Heart 
                      className={cn(
                        "h-4 w-4 transition-all duration-300",
                        likedTestimonials.has(currentSlide * 3 + index) 
                          ? "fill-rose-500 text-rose-500 scale-110" 
                          : "hover:scale-110"
                      )} 
                    />
                    <span>{testimonial.likes + (likedTestimonials.has(currentSlide * 3 + index) ? 1 : 0)}</span>
                  </button>
                </div>

                {/* Author Info */}
                <div className="relative flex items-center">
                  <div className="relative">
                    <img
                      src={testimonial.image}
                      alt={`${testimonial.name} wedding photo`}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-lg"
                    />
                    {testimonial.verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {testimonial.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600 space-x-2 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>{testimonial.wedding}</span>
                      <MapPin className="h-3 w-3 ml-2" />
                      <span>{testimonial.location}</span>
                    </div>
                    <p className="text-sm text-rose-600 font-medium">
                      via {testimonial.vendor} • {testimonial.category}
                    </p>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(totalSlides)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  currentSlide === index 
                    ? "bg-rose-500 w-8" 
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
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
            <button className={cn(
              "px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold rounded-full",
              "hover:from-rose-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200",
              "shadow-lg hover:shadow-xl"
            )}>
              Get Started Free
            </button>
            <button className={cn(
              "px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200",
              "hover:border-rose-300 hover:text-rose-600 transform hover:scale-105 transition-all duration-200",
              "shadow-lg hover:shadow-xl"
            )}>
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
