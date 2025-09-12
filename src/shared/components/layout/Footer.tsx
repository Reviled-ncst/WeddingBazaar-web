import React from 'react';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Footer: React.FC = () => {
  const footerSections = [
    {
      title: 'For Couples',
      links: [
        'Find Vendors',
        'Wedding Venues',
        'Photography',
        'Catering',
        'Planning Tools',
        'Wedding Inspiration'
      ]
    },
    {
      title: 'For Vendors',
      links: [
        'List Your Business',
        'Vendor Dashboard',
        'Pricing Plans',
        'Success Stories',
        'Marketing Tools',
        'Support'
      ]
    },
    {
      title: 'Resources',
      links: [
        'Wedding Blog',
        'Planning Checklist',
        'Budget Calculator',
        'Guest List Manager',
        'Real Weddings',
        'Vendor Reviews'
      ]
    },
    {
      title: 'Company',
      links: [
        'About Us',
        'Careers',
        'Press',
        'Terms of Service',
        'Privacy Policy',
        'Contact Us'
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-gradient-to-r from-rose-600 to-pink-600 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Wedding Bazaar</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Your one-stop destination for wedding planning. Connect with trusted vendors, 
              discover unique services, and create your perfect wedding day.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-3" />
                <span>hello@weddingbazaar.com</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-3" />
                <span>1-800-WEDDING</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-3" />
                <span>New York, NY</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-400">
                Get the latest wedding trends and vendor updates delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-rose-500 flex-1 md:w-64"
              />
              <button className={cn(
                "px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold rounded-lg",
                "hover:from-rose-700 hover:to-pink-700 transition-all duration-200"
              )}>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Wedding Bazaar. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
