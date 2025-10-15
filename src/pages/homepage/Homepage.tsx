import React, { Suspense, lazy, useEffect } from 'react';
import { Hero } from './components/Hero';
import { Loader2, Sparkles } from 'lucide-react';

// Lazy load components for better performance
const Services = lazy(() => import('./components/Services').then(module => ({ default: module.Services })));
const FeaturedVendors = lazy(() => import('./components/FeaturedVendors').then(module => ({ default: module.FeaturedVendors })));
const Testimonials = lazy(() => import('./components/Testimonials').then(module => ({ default: module.Testimonials })));

// Advanced loading component for suspense fallbacks
const SectionLoader: React.FC = () => (
  <div className="flex items-center justify-center py-32 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50/30 relative overflow-hidden">
    {/* Floating Background Elements */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-300 to-rose-300 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full blur-2xl animate-float-slow" />
    </div>

    <div className="relative z-10 flex flex-col items-center space-y-8 p-12 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40">
      {/* Enhanced Spinner */}
      <div className="relative">
        <div className="absolute inset-0 h-16 w-16 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 blur-lg opacity-60 animate-pulse-glow" />
        <Loader2 className="relative h-16 w-16 animate-spin text-rose-500" />
        <div className="absolute inset-2 h-12 w-12 rounded-full border-2 border-rose-200 animate-pulse" />
        <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-white animate-bounce-gentle" />
      </div>

      {/* Enhanced Text */}
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
          Creating Magic
        </h3>
        <p className="text-gray-600 text-lg font-medium">Loading amazing wedding content...</p>
      </div>

      {/* Enhanced Dots Animation */}
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-bounce [animation-delay:0ms] shadow-lg" />
        <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-bounce [animation-delay:150ms] shadow-lg" />
        <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-rose-400 rounded-full animate-bounce [animation-delay:300ms] shadow-lg" />
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-shimmer w-3/4" />
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] animate-shimmer" />
      </div>
    </div>
  </div>
);

// Floating action buttons for quick access
const FloatingActions: React.FC = () => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
    <button
      className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Back to top"
    >
      <svg className="h-5 w-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
    <button
      className="bg-white text-gray-700 p-4 rounded-full shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300 hover:scale-110 group"
      onClick={() => document.getElementById('couples')?.scrollIntoView({ behavior: 'smooth' })}
      title="Get started"
    >
      <svg className="h-5 w-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l4 4 4-4m0-6l-4-4-4 4" />
      </svg>
    </button>
  </div>
);

export const Homepage: React.FC = () => {
  // Check for email verification success from Firebase
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    
    if (verified === 'true') {
      console.log('✅ Email verification confirmed by Firebase');
      
      // Show success notification
      const showVerificationSuccess = () => {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Email verified successfully! You can now login.</span>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
          notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out after 5 seconds
        setTimeout(() => {
          notification.classList.add('translate-x-full');
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 5000);
      };
      
      showVerificationSuccess();
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Clear any pending verification state
      localStorage.removeItem('emailVerificationPending');
    }
  }, []);

  // Preload critical resources
  useEffect(() => {
    // Preload hero image
    const heroImage = new Image();
    heroImage.src = "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop&crop=center";
    
    // Preload key vendor images
    const vendorImages = [
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=500&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop"
    ];
    
    vendorImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Set document title on component mount
  useEffect(() => {
    document.title = "Wedding Bazaar Philippines - Your Dream Wedding Starts Here";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Connect with trusted wedding vendors in the Philippines. Find photographers, caterers, venues, and more for your perfect wedding day. Rated 4.9/5 by 10,000+ couples.');
    }
  }, []);

  return (
    <>

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section - Always loaded first */}
        <Hero />
        
        {/* Services Section - Lazy loaded */}
        <Suspense fallback={<SectionLoader />}>
          <Services />
        </Suspense>
        
        {/* Featured Vendors Section - Lazy loaded */}
        <Suspense fallback={<SectionLoader />}>
          <FeaturedVendors />
        </Suspense>
        
        {/* Testimonials Section - Lazy loaded */}
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>
        
        {/* Enhanced Newsletter Section */}
        <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-rose-300 rounded-full blur-xl" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-300 rounded-full blur-xl" />
            <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-purple-300 rounded-full blur-xl" />
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-rose-600 font-medium mb-6 border border-white/60">
                <Sparkles className="h-4 w-4 mr-2" />
                Join 50,000+ Happy Couples
              </div>
              
              <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-gray-900 bg-clip-text text-transparent mb-6">
                Never Miss Your Perfect Match
              </h3>
              
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Get exclusive access to new vendor listings, wedding inspiration, expert tips, 
                and special offers delivered to your inbox every week.
              </p>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/60 max-w-lg mx-auto">
                <form className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-lg bg-white/80 backdrop-blur-sm transition-all duration-300"
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>Get Wedding Inspiration</span>
                    <Sparkles className="h-5 w-5" />
                  </button>
                </form>
                
                <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                    Free forever
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                    No spam
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
                    Unsubscribe anytime
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-8 max-w-lg mx-auto">
                Join thousands of couples who've found their dream vendors through our weekly updates. 
                Your privacy is protected and we never share your information.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      {/* Floating Action Buttons */}
      <FloatingActions />
    </>
  );
};
