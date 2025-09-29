import React from 'react';
import { Store, TrendingUp, Users, Calendar, DollarSign, Star, Camera, Palette, Utensils, Music } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { Footer } from '../../../../shared/components/layout/Footer';

export const VendorLanding: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <VendorHeader />
      <main className="flex-1">
        <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full">
              <Store className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Grow Your Wedding
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              {' '}Business
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Connect with couples planning their dream weddings. Showcase your services, 
            manage bookings, and grow your business with our comprehensive vendor platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className={cn(
              "px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full",
              "hover:from-rose-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200",
              "shadow-lg hover:shadow-xl"
            )}>
              Join as a Vendor
            </button>
            <button className={cn(
              "px-8 py-4 border-2 border-rose-500 text-rose-600 font-semibold rounded-full",
              "hover:bg-rose-500 hover:text-white transition-all duration-200"
            )}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Join Our Thriving Vendor Community
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Wedding Bazaar connects you with couples who are actively planning their weddings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: "10,000+", label: "Active Couples" },
              { icon: Calendar, number: "500+", label: "Weddings Monthly" },
              { icon: DollarSign, number: "₱100M+", label: "Revenue Generated" },
              { icon: Star, number: "4.9/5", label: "Average Rating" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Powerful tools and features to help your wedding business thrive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Business Analytics",
                description: "Track your performance, bookings, and revenue with detailed insights",
                color: "from-emerald-500 to-green-500"
              },
              {
                icon: Calendar,
                title: "Booking Management",
                description: "Manage your calendar, appointments, and client communications",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Store,
                title: "Professional Profile",
                description: "Showcase your portfolio, services, and client testimonials",
                color: "from-purple-500 to-violet-500"
              },
              {
                icon: Users,
                title: "Lead Generation",
                description: "Connect with couples actively searching for your services",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: DollarSign,
                title: "Payment Processing",
                description: "Secure payment handling and automated invoicing",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Star,
                title: "Review Management",
                description: "Build credibility with authentic client reviews and ratings",
                color: "from-rose-500 to-pink-500"
              }
            ].map((feature, index) => (
              <div key={index} className="p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <div className={cn(
                  "w-12 h-12 mb-6 rounded-lg bg-gradient-to-r flex items-center justify-center",
                  feature.color
                )}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              All Wedding Service Categories Welcome
            </h2>
            <p className="text-xl text-gray-600">
              Whatever your wedding specialty, there's a place for you here
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Camera, name: "Photography & Video", color: "text-blue-600" },
              { icon: Palette, name: "Planning & Design", color: "text-purple-600" },
              { icon: Utensils, name: "Catering & Venues", color: "text-orange-600" },
              { icon: Music, name: "Entertainment & DJ", color: "text-green-600" }
            ].map((category, index) => (
              <div key={index} className={cn(
                "p-6 bg-gray-50 rounded-xl border border-gray-200",
                "hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer"
              )}>
                <category.icon className={cn("h-8 w-8 mb-3", category.color)} />
                <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-pink-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Grow Your Wedding Business?
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of successful wedding vendors who trust Wedding Bazaar to connect them with their ideal clients
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className={cn(
              "px-8 py-4 bg-white text-rose-600 font-semibold rounded-full",
              "hover:bg-gray-50 transform hover:scale-105 transition-all duration-200",
              "shadow-lg hover:shadow-xl"
            )}>
              Start Your Free Trial
            </button>
            <button className={cn(
              "px-8 py-4 border-2 border-white text-white font-semibold rounded-full",
              "hover:bg-white hover:text-rose-600 transition-all duration-200"
            )}>
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};
