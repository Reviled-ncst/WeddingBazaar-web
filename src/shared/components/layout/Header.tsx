import React, { useState, useEffect } from 'react';
import { Menu, X, Heart, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { LoginModal, RegisterModal } from '../modals';
import { useAuth } from '../../contexts/HybridAuthContext';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  // CRITICAL: Wrap setIsLoginModalOpen with logging to catch ALL state changes
  const setIsLoginModalOpenWithLogging = (newState: boolean, source: string = 'unknown') => {
    console.log(`🚨🚨🚨 [Header] setIsLoginModalOpen called!`);
    console.log(`📍 Source: ${source}`);
    console.log(`🔄 Changing from ${isLoginModalOpen} to ${newState}`);
    console.trace('📍 Full call stack:');
    setIsLoginModalOpen(newState);
  };
  
  // Smart modal state management - allow user-initiated actions
  const setIsRegisterModalOpenWithLogging = (newState: boolean) => {
    console.log(`🎭 Setting RegisterModal state to: ${newState}`);
    console.trace('📍 Modal state change call stack:');
    setIsRegisterModalOpen(newState);
  };
  const [activeSection, setActiveSection] = useState('couples');
  
  const { isAuthenticated } = useAuth();

  const navigation = [
    { name: 'Home', href: '#couples', isSection: true },
    { name: 'Services', href: '#services', isSection: true },
    { name: 'Vendors', href: '#vendors', isSection: true },
    { name: 'Testimonials', href: '#planning', isSection: true },
  ];

  // Track email verification state to prevent premature modal closing
  const [isEmailVerificationMode, setIsEmailVerificationMode] = useState(false);

  // Debug verification mode changes
  const handleEmailVerificationModeChange = (isInMode: boolean) => {
    console.log('📧 Email verification mode changed:', isInMode);
    setIsEmailVerificationMode(isInMode);
  };

  // NEVER AUTO-CLOSE MODALS - LET THEM HANDLE THEIR OWN LIFECYCLE
  // The LoginModal will close itself on successful login
  // This prevents closing the modal during login attempts that fail
  useEffect(() => {
    // REMOVED: Auto-close login modal on authentication
    // This was causing the modal to close even on failed login attempts
    // The LoginModal now manages its own lifecycle
    
    // DO NOT CLOSE REGISTER MODAL - IT MANAGES ITSELF
  }, [isAuthenticated, isEmailVerificationMode]);

  // RESTORE REGISTER MODAL ON PAGE LOAD IF EMAIL VERIFICATION IS PENDING
  useEffect(() => {
    const savedVerificationState = localStorage.getItem('emailVerificationPending');
    if (savedVerificationState && !isRegisterModalOpen && !isLoginModalOpen) {
      try {
        const { timestamp } = JSON.parse(savedVerificationState);
        // Only restore if less than 10 minutes old
        if (Date.now() - timestamp < 10 * 60 * 1000) {
          console.log('🔄 Restoring register modal for pending email verification');
          setIsRegisterModalOpenWithLogging(true);
        } else {
          localStorage.removeItem('emailVerificationPending');
        }
      } catch (error) {
        console.error('Error parsing verification state:', error);
        localStorage.removeItem('emailVerificationPending');
      }
    }
  }, []); // Only run once on mount

  // Removed aggressive monitoring - allow normal modal behavior

  // Allow modal close and clear verification state
  const handleRegisterModalClose = () => {
    console.log('� Modal close requested');
    console.trace('📍 Modal close call stack:');
    
    // Check both the state and localStorage for verification status
    const savedVerificationState = localStorage.getItem('emailVerificationPending');
    const hasPendingVerification = savedVerificationState && (() => {
      try {
        const { timestamp } = JSON.parse(savedVerificationState);
        return Date.now() - timestamp < 10 * 60 * 1000;
      } catch {
        return false;
      }
    })();
    
    console.log('� Verification status:', {
      isEmailVerificationMode,
      hasPendingVerification,
      savedVerificationState: !!savedVerificationState
    });
    
    if (isEmailVerificationMode || hasPendingVerification) {
      console.log('🛑 MODAL CLOSE ABSOLUTELY BLOCKED');
      console.log('⚠️ Email verification in progress - modal CANNOT close');
      return; // IRON WALL - NO CLOSE ALLOWED
    }
    
    console.log('✅ Allowing modal close (no verification in progress)');
    setIsRegisterModalOpenWithLogging(false);
  };

  // Scroll spy functionality
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['couples', 'services', 'vendors', 'planning']; // Order matches homepage flow
      const headerHeight = 80;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= headerHeight + 100 && rect.bottom >= headerHeight + 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSwitchToRegister = () => {
    console.log('🔄 [Header] Switching to register modal');
    setIsLoginModalOpenWithLogging(false, 'switchToRegister');
    setIsRegisterModalOpenWithLogging(true);
  };

  const handleSwitchToLogin = () => {
    console.log('🔄 [Header] Switching to login modal');
    setIsRegisterModalOpenWithLogging(false);
    setIsLoginModalOpenWithLogging(true, 'switchToLogin');
  };
  
  const handleLoginModalClose = () => {
    console.log('🚪 [Header] Login modal close requested');
    console.trace('🔍 [Header] Close call stack trace');
    
    // The LoginModal has its own tracedOnClose wrapper that prevents closing on error
    // If this function is called, it means the LoginModal approved the close
    console.log('✅ [Header] LoginModal approved close - closing modal');
    setIsLoginModalOpenWithLogging(false, 'handleLoginModalClose');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full bg-white/90 backdrop-blur-2xl border-b border-rose-200/40 shadow-xl shadow-rose-500/10 z-50 transition-all duration-500">
        {/* Decorative background layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-50/40 via-pink-50/30 to-purple-50/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/20"></div>
        
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-1/4 w-32 h-1 bg-gradient-to-r from-transparent via-rose-300/50 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-32 h-1 bg-gradient-to-r from-transparent via-pink-300/50 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center space-x-3 group relative">
                {/* Logo background with enhanced glassmorphism */}
                <div className="p-3 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-2xl shadow-2xl group-hover:shadow-rose-500/30 transition-all duration-500 group-hover:scale-110 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                  <div className="absolute inset-px bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <Heart className="h-8 w-8 text-white relative z-10 group-hover:animate-pulse" />
                </div>
                
                {/* Brand text with enhanced styling */}
                <div className="relative">
                  <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent tracking-tight">
                    Wedding Bazaar
                  </span>
                  <div className="text-xs lg:text-sm text-rose-500 font-medium -mt-1 tracking-wide">
                    Your Perfect Day Awaits
                  </div>
                  {/* Subtle decorative underline */}
                  <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-transparent via-rose-300/50 to-transparent group-hover:via-rose-400/70 transition-all duration-300"></div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
              <div className="flex items-center space-x-1 bg-white/40 backdrop-blur-lg rounded-2xl p-2 border border-white/50 shadow-lg">
                {navigation.map((item) => {
                  const handleClick = (e: React.MouseEvent) => {
                    e.preventDefault();
                    const targetId = item.href.replace('#', '');
                    const element = document.getElementById(targetId);
                    if (element) {
                      const headerHeight = 80; // Height of fixed header
                      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                      const offsetPosition = elementPosition - headerHeight;

                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  };

                  const isActive = activeSection === item.href.replace('#', '');
                  
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={handleClick}
                      className={cn(
                        "relative px-5 py-3 font-medium transition-all duration-300 cursor-pointer rounded-xl group",
                        isActive 
                          ? "text-rose-600 bg-white/70" 
                          : "text-gray-700 hover:text-rose-600 hover:bg-white/70"
                      )}
                    >
                      {item.name}
                      {/* Enhanced underline animation - always visible when active */}
                      <span className={cn(
                        "absolute bottom-2 left-1/2 h-0.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 rounded-full transform -translate-x-1/2 transition-all duration-300 ease-out",
                        isActive 
                          ? "w-3/4" 
                          : "w-0 group-hover:w-3/4"
                      )}></span>
                      {/* Subtle glow effect */}
                      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-500/0 via-pink-500/0 to-rose-500/0 group-hover:from-rose-500/5 group-hover:via-pink-500/10 group-hover:to-rose-500/5 transition-all duration-300"></span>
                    </a>
                  );
                })}
              </div>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
              {/* Search button with enhanced styling */}
              <button 
                className="relative p-3 text-gray-600 hover:text-rose-600 transition-all duration-300 group overflow-hidden rounded-2xl"
                title="Search"
              >
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
                <Search className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
              </button>
              
              {/* Login button with enhanced styling */}
              <button 
                onClick={() => setIsLoginModalOpenWithLogging(true, 'loginButtonClick')}
                className="relative p-3 text-gray-600 hover:text-rose-600 transition-all duration-300 group overflow-hidden rounded-2xl"
                title="Login"
              >
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
                <User className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
              </button>
              
              {/* Enhanced CTA button */}
              <button 
                onClick={() => setIsRegisterModalOpenWithLogging(true)}
                className={cn(
                  "relative px-8 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-semibold rounded-2xl overflow-hidden",
                  "hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transform hover:scale-105 transition-all duration-300",
                  "shadow-2xl hover:shadow-rose-500/25 border border-white/20 group"
                )}
              >
                {/* Inner glassmorphism effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl"></div>
                <div className="absolute inset-px bg-gradient-to-r from-white/10 to-transparent rounded-2xl"></div>
                
                {/* Button text */}
                <span className="relative z-10">Get Started</span>
                
                {/* Subtle shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 skew-x-12"></div>
              </button>
            </div>

          {/* Enhanced Mobile menu button */}
          <button
            className="md:hidden relative p-3 text-gray-600 hover:text-rose-600 transition-all duration-300 group rounded-2xl overflow-hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
            <div className="relative z-10">
              {isMenuOpen ? (
                <X className="h-6 w-6 transform rotate-0 group-hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Menu className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              )}
            </div>
          </button>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-rose-100/60 bg-white/95 backdrop-blur-2xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-50/30 to-pink-50/20"></div>
            <div className="relative py-6 px-4">
              <div className="flex flex-col space-y-1">
                {navigation.map((item) => {
                  const handleClick = (e: React.MouseEvent) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    const targetId = item.href.replace('#', '');
                    const element = document.getElementById(targetId);
                    if (element) {
                      const headerHeight = 80; // Height of fixed header
                      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                      const offsetPosition = elementPosition - headerHeight;

                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  };

                  const isActive = activeSection === item.href.replace('#', '');

                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={handleClick}
                      className={cn(
                        "relative font-medium py-4 px-4 cursor-pointer rounded-xl transition-all duration-300 group overflow-hidden",
                        isActive 
                          ? "text-rose-600 bg-white/70" 
                          : "text-gray-700 hover:text-rose-600 hover:bg-white/70"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/5 group-hover:to-pink-500/5 rounded-xl transition-all duration-300"></div>
                      <span className="relative z-10">{item.name}</span>
                      <div className={cn(
                        "absolute bottom-2 left-4 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300 rounded-full",
                        isActive 
                          ? "w-8" 
                          : "w-0 group-hover:w-8"
                      )}></div>
                    </a>
                  );
                })}
                
                {/* Mobile actions with enhanced styling */}
                <div className="flex flex-col space-y-3 pt-6 border-t border-rose-100/60 mt-4">
                  <button 
                    className="flex items-center text-gray-700 hover:text-rose-600 py-4 px-4 rounded-xl hover:bg-white/70 transition-all duration-300 group relative overflow-hidden"
                    title="Search"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/5 group-hover:to-pink-500/5 rounded-xl transition-all duration-300"></div>
                    <Search className="h-5 w-5 mr-3 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    <span className="relative z-10">Search</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                    className="flex items-center text-gray-700 hover:text-rose-600 py-4 px-4 rounded-xl hover:bg-white/70 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/5 group-hover:to-pink-500/5 rounded-xl transition-all duration-300"></div>
                    <User className="h-5 w-5 mr-3 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    <span className="relative z-10">Login</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsRegisterModalOpenWithLogging(true);
                    }}
                    className={cn(
                      "relative mx-4 px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-semibold rounded-2xl text-center overflow-hidden",
                      "hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transition-all duration-300 shadow-2xl group"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl"></div>
                    <div className="absolute inset-px bg-gradient-to-r from-white/10 to-transparent rounded-2xl"></div>
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 skew-x-12"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>

    {/* Modals */}
    <LoginModal
      isOpen={isLoginModalOpen}
      onClose={handleLoginModalClose}
      onSwitchToRegister={handleSwitchToRegister}
    />
    <RegisterModal
      isOpen={isRegisterModalOpen}
      onClose={handleRegisterModalClose}
      onSwitchToLogin={handleSwitchToLogin}
      onEmailVerificationModeChange={handleEmailVerificationModeChange}
    />
  </>
  );
};
