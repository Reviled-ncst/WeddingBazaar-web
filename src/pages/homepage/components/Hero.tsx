import React from 'react';
import { Heart, Calendar, Users, Sparkles } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Hero: React.FC = () => {
  return (
    <section id="couples" className="relative min-h-screen flex items-center justify-center pt-16">
      {/* Background Wedding Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop&crop=center"
          alt="Beautiful wedding ceremony"
          className="w-full h-full object-cover"
        />
        {/* Enhanced overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/30 via-pink-900/20 to-purple-900/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Enhanced Floating Content Container */}
        <div className="max-w-5xl mx-auto bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/30 relative overflow-hidden">
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
              <span className="text-rose-600 font-semibold">From venues to photographers</span>, we have everything you need.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className={cn(
                "px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-full text-lg",
                "hover:from-rose-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300",
                "shadow-xl hover:shadow-2xl border-2 border-white/20 hover:border-white/30",
                "relative overflow-hidden group"
              )}>
                <span className="relative z-10">Start Planning</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button className={cn(
                "px-10 py-4 bg-white/90 backdrop-blur-sm text-gray-700 font-bold rounded-full border-2 border-gray-200 text-lg",
                "hover:border-rose-300 hover:text-rose-600 hover:bg-white transform hover:scale-105 transition-all duration-300",
                "shadow-xl hover:shadow-2xl relative overflow-hidden group"
              )}>
                <span className="relative z-10">Browse Vendors</span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

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
        <div className="w-8 h-12 border-2 border-white/80 rounded-full flex justify-center backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer">
          <div className="w-1.5 h-4 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
        <p className="text-white text-xs mt-2 font-medium opacity-80">Scroll to explore</p>
      </div>
    </section>
  );
};
