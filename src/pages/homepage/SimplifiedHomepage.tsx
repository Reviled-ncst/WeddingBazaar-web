import React from 'react';
import SimplifiedHeader from './components/SimplifiedHeader';
import SimplifiedHero from './components/SimplifiedHero';
import SimplifiedServices from './components/SimplifiedServices';
import SimplifiedDSS from './components/SimplifiedDSS';

export const SimplifiedHomepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SimplifiedHeader />
      
      {/* Add top padding to account for fixed header */}
      <div className="pt-16">
        <SimplifiedHero />
        <SimplifiedServices />
        <SimplifiedDSS />
        
        {/* Simple Footer */}
        <footer className="py-12 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to Plan Your Dream Wedding?
              </h3>
              <p className="text-gray-600">
                Join thousands of happy couples who found their perfect vendors with us
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">500+ Happy Couples</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">1000+ Verified Vendors</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Free to Use</span>
              </div>
            </div>
            
            <div className="text-gray-500 text-sm">
              <p>&copy; 2025 Wedding Bazaar. Making wedding planning simple and stress-free.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SimplifiedHomepage;
