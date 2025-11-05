import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Calendar, Users, Sparkles, ArrowRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/cn';

// Quick Search Component
const QuickSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const popularSearches = ['Photography', 'Catering', 'Venues', 'Wedding Planning', 'Music'];
  
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Find Your Perfect Vendor</h3>
      <form onSubmit={handleSearch} className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for vendors, services..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
        >
          Search
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-600">Popular:</span>
        {popularSearches.map((search) => (
          <button
            key={search}
            onClick={() => setSearchQuery(search)}
            className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-rose-100 hover:text-rose-700 transition-colors"
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  
  // Hero background images for slideshow
  const heroImages = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920&h=1080&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&h=1080&fit=crop&crop=center"
  ];
  
  // Rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);
  
  // Handle navigation actions
  const handleStartPlanning = useCallback(() => {
    navigate('/individual');
  }, [navigate]);
  
  const handleBrowseVendors = useCallback(() => {
    navigate('/services');
  }, [navigate]);

  return (
    <>
      <section id="couples" className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Dynamic Background with Slideshow */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000",
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              )}
            >
              <img
                src={image}
                alt={`Beautiful wedding scene ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Enhanced overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900/30 via-pink-900/20 to-purple-900/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        </div>
        
        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-rose-300/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-32 right-20 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-300/20 rounded-full blur-2xl animate-float-slow" />
          <div className="absolute top-40 right-1/3 w-16 h-16 bg-rose-400/30 rounded-full blur-xl animate-bounce-gentle" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Enhanced Floating Content Container with Advanced Glassmorphism */}
          <div className="max-w-6xl mx-auto bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/30 relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-white/30 to-pink-50/50"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
              <div className="absolute top-10 left-10 w-20 h-20 bg-rose-300/10 rounded-full blur-2xl"></div>
              <div className="absolute top-20 right-20 w-16 h-16 bg-pink-300/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-300/10 rounded-full blur-2xl"></div>
            </div>
            <div className="relative z-10">
              {/* Enhanced Hero Icons */}
              <div className="flex justify-center space-x-6 mb-8">
                <div className="p-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Enhanced Main Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Your Dream Wedding
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 animate-pulse">
                  Starts Here
                </span>
              </h1>

              {/* Enhanced Subtitle */}
              <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
                Connect with trusted wedding vendors, discover unique services, and plan your perfect day with ease. 
                <span className="text-rose-600 font-semibold"> From venues to photographers</span>, we have everything you need.
              </p>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <button 
                  onClick={handleStartPlanning}
                  className={cn(
                    "px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-full text-lg",
                    "hover:from-rose-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300",
                    "shadow-xl hover:shadow-2xl border-2 border-white/20 hover:border-white/30",
                    "relative overflow-hidden group flex items-center gap-2"
                  )}
                >
                  <span className="relative z-10">Start Planning</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={handleBrowseVendors}
                  className={cn(
                    "px-10 py-4 bg-white/90 backdrop-blur-sm text-gray-700 font-bold rounded-full border-2 border-gray-200 text-lg",
                    "hover:border-rose-300 hover:text-rose-600 hover:bg-white transform hover:scale-105 transition-all duration-300",
                    "shadow-xl hover:shadow-2xl relative overflow-hidden group flex items-center gap-2"
                  )}
                >
                  <span className="relative z-10">Browse Vendors</span>
                  <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>

              {/* Quick Search Toggle */}
              <div className="mb-8">
                <button
                  onClick={() => setShowQuickSearch(!showQuickSearch)}
                  className="text-rose-600 font-medium hover:text-rose-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Search className="h-4 w-4" />
                  Quick Vendor Search
                </button>
              </div>

              {/* Quick Search Component */}
              {showQuickSearch && (
                <div className="mb-8 animate-fade-in">
                  <QuickSearch />
                </div>
              )}

              {/* Enhanced Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">10K+</div>
                  <div className="text-gray-600 text-sm md:text-base font-medium">Happy Couples</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">5K+</div>
                  <div className="text-gray-600 text-sm md:text-base font-medium">Trusted Vendors</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">50+</div>
                  <div className="text-gray-600 text-sm md:text-base font-medium">Cities</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">99%</div>
                  <div className="text-gray-600 text-sm md:text-base font-medium">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <div 
            className="w-8 h-12 border-2 border-white/80 rounded-full flex justify-center backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer"
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <div className="w-1.5 h-4 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
          <p className="text-white text-xs mt-2 font-medium opacity-80">Scroll to explore</p>
        </div>

        {/* Image indicators */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentImageIndex 
                  ? "bg-white shadow-lg" 
                  : "bg-white/50 hover:bg-white/70"
              )}
              aria-label={`View image ${index + 1}`}
              title={`Switch to image ${index + 1}`}
            />
          ))}
        </div>
      </section>
    </>
  );
};
