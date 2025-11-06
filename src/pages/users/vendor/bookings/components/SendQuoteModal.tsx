import React, { useState } from 'react';

// Temporary inline currency formatter
const formatPHP = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Temporary local interface - this should be imported from booking-data-mapping
interface UIBooking {
  id: string;
  vendorId: string;
  vendorName: string;
  coupleId: string;
  coupleName: string;
  contactEmail: string;
  contactPhone?: string;
  serviceType: string;
  eventDate: string;
  eventTime?: string;
  eventLocation?: string;
  guestCount?: number;
  specialRequests?: string;
  status: string;
  quoteAmount?: number;
  totalAmount: number;
  downpaymentAmount: number;
  totalPaid: number;
  remainingBalance: number;
  budgetRange?: string;
  preferredContactMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  formatted: {
    totalAmount: string;
    totalPaid: string;
    remainingBalance: string;
    downpaymentAmount: string;
  };
}

interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

interface QuoteTemplate {
  serviceType: string;
  items: Omit<QuoteItem, 'id' | 'total'>[];
}

interface VendorPricing {
  [serviceType: string]: {
    [itemName: string]: number;
  };
}

interface SendQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceData?: {
    id: string;
    name: string;
    category: string;
    features: string[]; // List of items/equipment provided in the service
    price: string;
    description: string;
  } | null;
  booking: UIBooking;
  onSendQuote: (quoteData: any) => void;
  vendorPricing?: VendorPricing; // Optional vendor-specific pricing
  onSavePricing?: (pricing: VendorPricing) => void; // Optional callback to save pricing
}

// DEFAULT SERVICE TEMPLATES - BASED ON ACTUAL DATABASE CATEGORIES
const DEFAULT_QUOTE_TEMPLATES: Record<string, QuoteTemplate> = {
  'Photographer & Videographer': {
    serviceType: 'Photographer & Videographer',
    items: [
      {
        name: 'Wedding Day Photography (8 hours)',
        description: 'Complete wedding coverage from preparation to reception',
        quantity: 1,
        unitPrice: 5000,
        category: 'Photography Services'
      },
      {
        name: 'Wedding Videography',
        description: 'Professional wedding videography with highlight reel',
        quantity: 1,
        unitPrice: 4000,
        category: 'Videography Services'
      },
      {
        name: 'Engagement Photography',
        description: 'Pre-wedding engagement photo session',
        quantity: 1,
        unitPrice: 2500,
        category: 'Photography Services'
      },
      {
        name: 'Wedding Album Creation',
        description: 'Professional wedding photo album design',
        quantity: 1,
        unitPrice: 1800,
        category: 'Photography Products'
      },
      {
        name: 'Photo Booth Rental',
        description: 'Fun photo booth rental for wedding reception',
        quantity: 1,
        unitPrice: 2000,
        category: 'Entertainment'
      },
      {
        name: 'Drone Photography',
        description: 'Aerial drone photography for wedding venues',
        quantity: 1,
        unitPrice: 3500,
        category: 'Specialty Services'
      },
      {
        name: '360 Degree Photography',
        description: '360-degree photography for immersive wedding experience',
        quantity: 1,
        unitPrice: 4500,
        category: 'Specialty Services'
      },
      {
        name: 'Wedding Video Editing',
        description: 'Professional wedding video editing and production',
        quantity: 1,
        unitPrice: 2500,
        category: 'Post-Production'
      }
    ]
  },

  'Cake Designer': {
    serviceType: 'Cake Designer',
    items: [
      {
        name: 'Custom Wedding Cake Design',
        description: 'Custom wedding cake design and creation',
        quantity: 1,
        unitPrice: 800,
        category: 'Wedding Cake'
      },
      {
        name: 'Wedding Cake Tasting',
        description: 'Cake tasting session with multiple flavor options',
        quantity: 1,
        unitPrice: 500,
        category: 'Consultation Services'
      },
      {
        name: 'Tiered Wedding Cake',
        description: 'Multi-tiered wedding cake with custom design',
        quantity: 1,
        unitPrice: 1200,
        category: 'Wedding Cake'
      }
    ]
  },
  
  'Caterer': {
    serviceType: 'Caterer',
    items: [
      {
        name: 'Wedding Catering',
        description: 'Full-service wedding catering for all your guests',
        quantity: 1,
        unitPrice: 3500,
        category: 'Main Catering'
      },
      {
        name: 'Cocktail Hour Catering',
        description: 'Appetizers and drinks for cocktail hour',
        quantity: 1,
        unitPrice: 2500,
        category: 'Cocktail Service'
      },
      {
        name: 'Reception Catering',
        description: 'Full reception dinner catering service',
        quantity: 1,
        unitPrice: 5000,
        category: 'Reception Service'
      },
      {
        name: 'Champagne Service',
        description: 'Champagne service for reception toasts',
        quantity: 1,
        unitPrice: 1500,
        category: 'Beverage Service'
      },
      {
        name: 'Wedding Bar Service',
        description: 'Professional bar service for wedding reception',
        quantity: 1,
        unitPrice: 4000,
        category: 'Bar Service'
      },
      {
        name: 'Wedding Dessert Bar',
        description: 'Custom dessert bar setup and service',
        quantity: 1,
        unitPrice: 2800,
        category: 'Dessert Service'
      }
    ]
  },

  'DJ': {
    serviceType: 'DJ',
    items: [
      {
        name: 'DJ Services',
        description: 'Professional DJ services for your wedding reception',
        quantity: 1,
        unitPrice: 55000,
        category: 'DJ Services'
      }
    ]
  },

  'DJ/Band': {
    serviceType: 'DJ/Band',
    items: [
      {
        name: 'Wedding Band Services',
        description: 'Live wedding band for ceremony and reception',
        quantity: 1,
        unitPrice: 8000,
        category: 'Live Music'
      },
      {
        name: 'Reception DJ Package',
        description: 'Complete DJ package for wedding reception',
        quantity: 1,
        unitPrice: 3500,
        category: 'DJ Services'
      },
      {
        name: 'Ceremony Music',
        description: 'Live music for wedding ceremony',
        quantity: 1,
        unitPrice: 2000,
        category: 'Ceremony Music'
      },
      {
        name: 'Sound System Rental',
        description: 'Professional sound system for ceremony and reception',
        quantity: 1,
        unitPrice: 1800,
        category: 'Sound Equipment'
      },
      {
        name: 'Cocktail Hour DJ',
        description: 'DJ services specifically for cocktail hour',
        quantity: 1,
        unitPrice: 1500,
        category: 'DJ Services'
      }
    ]
  },

  'Hair & Makeup Artists': {
    serviceType: 'Hair & Makeup Artists',
    items: [
      {
        name: 'Bridal Hair and Makeup',
        description: 'Complete bridal hair and makeup services for your special day',
        quantity: 1,
        unitPrice: 1500,
        category: 'Bridal Services'
      },
      {
        name: 'Bridal Party Makeup',
        description: 'Makeup services for the entire bridal party',
        quantity: 4,
        unitPrice: 500,
        category: 'Bridesmaid Services'
      },
      {
        name: 'Grooms Hair and Makeup',
        description: 'Grooming services for the groom on wedding day',
        quantity: 1,
        unitPrice: 800,
        category: 'Groom Services'
      },
      {
        name: 'Hair Trial Session',
        description: 'Bridal hair trial session before the wedding',
        quantity: 1,
        unitPrice: 300,
        category: 'Trial Services'
      },
      {
        name: 'Makeup Trial Session',
        description: 'Bridal makeup trial session before the wedding',
        quantity: 1,
        unitPrice: 400,
        category: 'Trial Services'
      },
      {
        name: 'Airbrush Makeup',
        description: 'Professional airbrush makeup for bride',
        quantity: 1,
        unitPrice: 1200,
        category: 'Premium Services'
      },
      {
        name: 'Groomsmen Styling',
        description: 'Styling services for groomsmen',
        quantity: 4,
        unitPrice: 200,
        category: 'Groom Party Services'
      }
    ]
  },

  'Florist': {
    serviceType: 'Florist',
    items: [
      {
        name: 'Floral Arrangements',
        description: 'Beautiful floral arrangements for ceremony and reception',
        quantity: 1,
        unitPrice: 1200,
        category: 'Ceremony Flowers'
      },
      {
        name: 'Bridal Bouquet',
        description: 'Custom bridal bouquet with premium flowers',
        quantity: 1,
        unitPrice: 1500,
        category: 'Bridal Flowers'
      },
      {
        name: 'Centerpiece Design',
        description: 'Custom centerpiece design for reception tables',
        quantity: 10,
        unitPrice: 200,
        category: 'Reception Flowers'
      },
      {
        name: 'Reception Flowers',
        description: 'Floral arrangements for reception venue',
        quantity: 1,
        unitPrice: 2500,
        category: 'Reception Flowers'
      },
      {
        name: 'Ceremony Arch Rental',
        description: 'Beautiful ceremony arch rental with flowers',
        quantity: 1,
        unitPrice: 1800,
        category: 'Ceremony Decor'
      },
      {
        name: 'Ceremony Petals',
        description: 'Fresh flower petals for ceremony aisle',
        quantity: 1,
        unitPrice: 300,
        category: 'Ceremony Decor'
      },
      {
        name: 'Boutonniere Creation',
        description: 'Custom boutonniere creation for groom and groomsmen',
        quantity: 6,
        unitPrice: 133,
        category: 'Groom Flowers'
      }
    ]
  },

  'Wedding Planner': {
    serviceType: 'Wedding Planner',
    items: [
      {
        name: 'Wedding Day Coordination',
        description: 'Professional wedding day coordinator services',
        quantity: 1,
        unitPrice: 3000,
        category: 'Coordination Services'
      },
      {
        name: 'Wedding Ceremony Setup',
        description: 'Complete ceremony setup and decoration',
        quantity: 1,
        unitPrice: 2500,
        category: 'Setup Services'
      },
      {
        name: 'Wedding Rehearsal',
        description: 'Wedding rehearsal coordination and guidance',
        quantity: 1,
        unitPrice: 1500,
        category: 'Pre-Wedding Services'
      },
      {
        name: 'Outdoor Ceremony Setup',
        description: 'Complete outdoor ceremony setup and decoration',
        quantity: 1,
        unitPrice: 3500,
        category: 'Outdoor Services'
      },
      {
        name: 'Pre-Wedding Consultation',
        description: 'Comprehensive pre-wedding planning consultation',
        quantity: 1,
        unitPrice: 1000,
        category: 'Consultation Services'
      },
      {
        name: 'Elopement Planning',
        description: 'Complete elopement planning and coordination',
        quantity: 1,
        unitPrice: 2000,
        category: 'Specialized Services'
      }
    ]
  },
  'Dress Designer/Tailor': {
    serviceType: 'Dress Designer/Tailor',
    items: [
      {
        name: 'Wedding Dress Tailoring',
        description: 'Professional wedding dress alterations and fitting',
        quantity: 1,
        unitPrice: 2500,
        category: 'Bridal Alterations'
      },
      {
        name: 'Custom Wedding Suit',
        description: 'Tailored wedding suit for the groom',
        quantity: 1,
        unitPrice: 3500,
        category: 'Groom Attire'
      },
      {
        name: 'Groom Suit Fitting',
        description: 'Professional fitting for groom\'s wedding suit',
        quantity: 1,
        unitPrice: 500,
        category: 'Groom Services'
      },
      {
        name: 'Wedding Dress Preservation',
        description: 'Professional wedding dress cleaning and preservation',
        quantity: 1,
        unitPrice: 800,
        category: 'Post-Wedding Services'
      }
    ]
  },

  'Event Rentals': {
    serviceType: 'Event Rentals',
    items: [
      {
        name: 'Venue Decoration',
        description: 'Complete venue decoration and setup services',
        quantity: 1,
        unitPrice: 3000,
        category: 'Decoration Services'
      },
      {
        name: 'Table and Chair Rental',
        description: 'Premium table and chair rental for reception',
        quantity: 12,
        unitPrice: 125,
        category: 'Furniture Rental'
      },
      {
        name: 'Dance Floor Rental',
        description: 'Premium dance floor rental for reception',
        quantity: 1,
        unitPrice: 2500,
        category: 'Equipment Rental'
      },
      {
        name: 'Venue Lighting',
        description: 'Professional lighting setup for wedding venue',
        quantity: 1,
        unitPrice: 3500,
        category: 'Lighting Services'
      },
      {
        name: 'Tent Rental',
        description: 'Wedding tent rental for outdoor ceremonies',
        quantity: 1,
        unitPrice: 4000,
        category: 'Outdoor Equipment'
      }
    ]
  },

  'Transportation Services': {
    serviceType: 'Transportation Services',
    items: [
      {
        name: 'Transportation Services',
        description: 'Wedding day transportation for the couple',
        quantity: 1,
        unitPrice: 2000,
        category: 'Couple Transport'
      },
      {
        name: 'Wedding Transportation',
        description: 'Luxury transportation for wedding party',
        quantity: 1,
        unitPrice: 3000,
        category: 'Group Transport'
      },
      {
        name: 'Valet Parking Service',
        description: 'Professional valet parking for wedding guests',
        quantity: 1,
        unitPrice: 2500,
        category: 'Guest Services'
      },
      {
        name: 'Shuttle Service',
        description: 'Guest shuttle service between venues',
        quantity: 1,
        unitPrice: 1800,
        category: 'Guest Transport'
      }
    ]
  },

  'Officiant': {
    serviceType: 'Officiant',
    items: [
      {
        name: 'Wedding Officiant',
        description: 'Licensed wedding officiant for your ceremony',
        quantity: 1,
        unitPrice: 1000,
        category: 'Ceremony Services'
      },
      {
        name: 'Vow Renewal Ceremony',
        description: 'Officiant services for vow renewal ceremony',
        quantity: 1,
        unitPrice: 800,
        category: 'Special Ceremonies'
      },
      {
        name: 'Interfaith Ceremony',
        description: 'Officiant services for interfaith wedding ceremony',
        quantity: 1,
        unitPrice: 1200,
        category: 'Special Ceremonies'
      },
      {
        name: 'Civil Ceremony Officiant',
        description: 'Licensed officiant for civil wedding ceremony',
        quantity: 1,
        unitPrice: 600,
        category: 'Civil Services'
      },
      {
        name: 'Religious Ceremony Officiant',
        description: 'Religious officiant for traditional wedding ceremony',
        quantity: 1,
        unitPrice: 500,
        category: 'Religious Services'
      },
      {
        name: 'Destination Wedding Officiant',
        description: 'Officiant services for destination weddings',
        quantity: 1,
        unitPrice: 1500,
        category: 'Destination Services'
      }
    ]
  },

  'Security & Guest Management': {
    serviceType: 'Security & Guest Management',
    items: [
      {
        name: 'Wedding Security',
        description: 'Professional security services for your wedding event',
        quantity: 1,
        unitPrice: 5000,
        category: 'Security Services'
      },
      {
        name: 'Event Security Team',
        description: 'Professional security team for large wedding events',
        quantity: 1,
        unitPrice: 4500,
        category: 'Team Security'
      },
      {
        name: 'Wedding Guest Management',
        description: 'Professional guest check-in and management service',
        quantity: 1,
        unitPrice: 1500,
        category: 'Guest Services'
      },
      {
        name: 'Wedding Venue Security',
        description: 'Security services for wedding venue',
        quantity: 1,
        unitPrice: 3000,
        category: 'Venue Security'
      }
    ]
  },

  'Sounds & Lights': {
    serviceType: 'Sounds & Lights',
    items: [
      {
        name: 'Professional Sound System',
        description: 'High-quality sound system for wedding ceremony and reception',
        quantity: 1,
        unitPrice: 2500,
        category: 'Sound Equipment'
      },
      {
        name: 'Wedding Lighting Package',
        description: 'Professional lighting setup for wedding venue',
        quantity: 1,
        unitPrice: 1800,
        category: 'Lighting Equipment'
      },
      {
        name: 'Wireless Microphone System',
        description: 'Wireless microphones for ceremony and speeches',
        quantity: 2,
        unitPrice: 800,
        category: 'Audio Equipment'
      },
      {
        name: 'LED Uplighting',
        description: 'Colorful LED uplighting for reception ambiance',
        quantity: 8,
        unitPrice: 150,
        category: 'Decorative Lighting'
      },
      {
        name: 'Dance Floor Lighting',
        description: 'Special effects lighting for dance floor',
        quantity: 1,
        unitPrice: 1200,
        category: 'Entertainment Lighting'
      }
    ]
  },

  'Stationery Designer': {
    serviceType: 'Stationery Designer',
    items: [
      {
        name: 'Wedding Invitation Design',
        description: 'Custom wedding invitation design and printing',
        quantity: 100,
        unitPrice: 25,
        category: 'Invitations'
      },
      {
        name: 'Save the Date Cards',
        description: 'Custom save the date card design and printing',
        quantity: 100,
        unitPrice: 15,
        category: 'Save the Dates'
      },
      {
        name: 'Wedding Program Design',
        description: 'Ceremony program design and printing',
        quantity: 100,
        unitPrice: 8,
        category: 'Programs'
      },
      {
        name: 'Thank You Cards',
        description: 'Custom thank you card design and printing',
        quantity: 100,
        unitPrice: 12,
        category: 'Thank You Cards'
      },
      {
        name: 'Table Numbers & Place Cards',
        description: 'Reception table numbers and place card design',
        quantity: 12,
        unitPrice: 50,
        category: 'Reception Stationery'
      },
      {
        name: 'Wedding Menu Cards',
        description: 'Custom menu card design for reception tables',
        quantity: 50,
        unitPrice: 20,
        category: 'Menu Cards'
      }
    ]
  },

  'Venue Coordinator': {
    serviceType: 'Venue Coordinator',
    items: [
      {
        name: 'Wedding Venue Coordination',
        description: 'Full venue coordination and management services',
        quantity: 1,
        unitPrice: 3500,
        category: 'Coordination Services'
      },
      {
        name: 'Venue Setup & Decoration',
        description: 'Wedding venue setup and decoration coordination',
        quantity: 1,
        unitPrice: 2500,
        category: 'Setup Services'
      },
      {
        name: 'Reception Coordination',
        description: 'Reception timeline and vendor coordination',
        quantity: 1,
        unitPrice: 2000,
        category: 'Reception Management'
      },
      {
        name: 'Ceremony Coordination',
        description: 'Wedding ceremony coordination and management',
        quantity: 1,
        unitPrice: 1500,
        category: 'Ceremony Management'
      },
      {
        name: 'Venue Cleanup Coordination',
        description: 'Post-wedding venue cleanup coordination',
        quantity: 1,
        unitPrice: 800,
        category: 'Cleanup Services'
      }
    ]
  },

  'Wedding Planning': {
    serviceType: 'Wedding Planning',
    items: [
      {
        name: 'Comprehensive Wedding Planning',
        description: 'Full-service wedding planning from concept to execution',
        quantity: 1,
        unitPrice: 35000,
        category: 'Planning Services'
      },
      {
        name: 'Wedding Design & Styling',
        description: 'Complete wedding design and styling consultation',
        quantity: 1,
        unitPrice: 15000,
        category: 'Design Services'
      },
      {
        name: 'Vendor Coordination & Management',
        description: 'Full vendor coordination and management services',
        quantity: 1,
        unitPrice: 12000,
        category: 'Coordination Services'
      },
      {
        name: 'Timeline & Schedule Management',
        description: 'Detailed timeline creation and schedule management',
        quantity: 1,
        unitPrice: 8000,
        category: 'Planning Services'
      },
      {
        name: 'Budget Planning & Tracking',
        description: 'Wedding budget planning and expense tracking',
        quantity: 1,
        unitPrice: 5000,
        category: 'Financial Planning'
      }
    ]
  }
};

// Helper function to get default features for a service category
const getCategoryDefaultFeatures = (serviceType: string): string[] => {
  const categoryFeatures: Record<string, string[]> = {
    'Photographer & Videographer': [
      'Professional wedding photography',
      'HD videography coverage',
      'Edited photos and videos',
      'Online gallery access',
      'Printed photo album',
      'Drone footage (if applicable)',
      'Pre-wedding consultation'
    ],
    'Caterer': [
      'Full catering service',
      'Menu planning and tasting',
      'Professional waitstaff',
      'Table setup and decoration',
      'Food warming equipment',
      'Cleanup service',
      'Dietary accommodations'
    ],
    'DJ': [
      'Professional sound system',
      'Music selection and mixing',
      'MC services',
      'Lighting effects',
      'Setup and breakdown',
      'Consultation meeting',
      'Backup equipment'
    ],
    'Wedding Planner': [
      'Full planning coordination',
      'Vendor management',
      'Timeline creation',
      'Budget management',
      'On-site coordination',
      'Setup supervision',
      'Emergency management'
    ],
    'Florist': [
      'Bridal bouquet',
      'Ceremony flowers',
      'Reception centerpieces',
      'Boutonnieres',
      'Corsages',
      'Delivery and setup',
      'Consultation'
    ],
    'default': [
      'Professional service',
      'Full wedding day coverage',
      'Equipment and materials',
      'Setup and breakdown',
      'Consultation meeting',
      'Quality guarantee'
    ]
  };

  return categoryFeatures[serviceType] || categoryFeatures['default'];
};

// Helper function to get base price for a service category
const getCategoryBasePrice = (serviceType: string): number => {
  const categoryPrices: Record<string, number> = {
    'Photographer & Videographer': 35000,
    'Caterer': 300, // per person
    'DJ': 35000,
    'DJ/Band': 45000,
    'Wedding Planner': 50000,
    'Florist': 18000,
    'Hair & Makeup Artists': 6000,
    'Cake Designer': 12000,
    'Dress Designer/Tailor': 35000,
    'Event Rentals': 25000,
    'Transportation Services': 18000,
    'Officiant': 10000,
    'Security & Guest Management': 30000,
    'Sounds & Lights': 35000,
    'Stationery Designer': 12000,
    'Venue Coordinator': 40000,
    'Wedding Planning': 60000,
    'default': 25000
  };

  return categoryPrices[serviceType] || categoryPrices['default'];
};

// 🎯 SERVICE-BASED SMART PACKAGE SYSTEM - Uses actual service features
interface SimplePackage {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  description: string;
  bestFor: string;
  basePrice: number;
  features: string[];
}

// Get smart package recommendations based on ACTUAL service data and booking details
const getSmartPackages = (
  serviceType: string, 
  guestCount?: number, 
  budgetRange?: string,
  serviceFeatures?: string[], // ACTUAL service features from database
  servicePrice?: string // ACTUAL service price
): SimplePackage[] => {
  // Determine scale factor based on guest count
  const scale = !guestCount ? 1 : 
    guestCount < 50 ? 0.8 : 
    guestCount < 100 ? 1.0 : 
    guestCount < 150 ? 1.3 : 1.6;

  // Adjust pricing based on budget range if provided
  const budgetMultiplier = !budgetRange ? 1.0 :
    budgetRange.includes('10,000-25,000') ? 0.7 :
    budgetRange.includes('25,000-50,000') ? 1.0 :
    budgetRange.includes('50,000-100,000') ? 1.4 :
    budgetRange.includes('100,000+') ? 2.0 : 1.0;
  
  // Parse actual service price if available - this is CRITICAL
  const actualPrice = servicePrice ? parseFloat(servicePrice.replace(/[^0-9.]/g, '')) || null : null;
  // 🎯 CLEAN AND VALIDATE SERVICE FEATURES
  // Filter out empty, null, or generic entries but be more lenient
  const actualFeatures = serviceFeatures && serviceFeatures.length > 0 
    ? serviceFeatures
        .filter(f => f && typeof f === 'string' && f.trim() !== '')
        .filter(f => {
          const normalized = f.trim().toLowerCase();
          // Only exclude truly generic entries
          return normalized !== 'other' && 
                 normalized !== 'n/a' && 
                 normalized !== 'none' &&
                 normalized !== 'tbd' &&
                 !normalized.match(/^-+$/); // Just dashes
        })
    : null;
  
  // 🎯 PRIORITY 1: Use actual price + actual features (BEST CASE)
  if (actualPrice && actualPrice > 0 && actualFeatures && actualFeatures.length > 0) {
    const baseServicePrice = actualPrice;
    
    // Split features into tiers based on count
    const featureCount = actualFeatures.length;
    const essentialCount = Math.max(1, Math.ceil(featureCount * 0.5)); // At least 1 feature
    const completeCount = Math.max(2, Math.ceil(featureCount * 0.75)); // At least 2 features
    
    return [
      {
        id: 'essential',
        name: '🥉 Essential Package',
        icon: '📦',
        description: 'Core services from your offering',
        bestFor: `Perfect for intimate weddings${guestCount ? ` (${guestCount} guests)` : ''}`,
        basePrice: Math.round(baseServicePrice * 0.6 * scale * budgetMultiplier),
        features: actualFeatures.slice(0, essentialCount)
      },
      {
        id: 'complete',
        name: '🥈 Complete Package',
        icon: '⭐',
        badge: 'MOST POPULAR',
        description: 'Full service with premium features',
        bestFor: `Ideal for most weddings${guestCount ? ` (${guestCount} guests)` : ''}`,
        basePrice: Math.round(baseServicePrice * scale * budgetMultiplier),
        features: actualFeatures.slice(0, completeCount)
      },
      {
        id: 'premium',
        name: '🥇 Premium Package',
        icon: '💎',
        description: 'Complete service with all features',
        bestFor: `For grand celebrations${guestCount ? ` (${guestCount} guests)` : ''}`,
        basePrice: Math.round(baseServicePrice * 1.5 * scale * budgetMultiplier),
        features: actualFeatures // All features included
      }
    ];
  }
  
  // 🎯 PRIORITY 2: Use actual price only (create generic feature list)
  if (actualPrice && actualPrice > 0) {
    const baseServicePrice = actualPrice;
    const categoryFeatures = getCategoryDefaultFeatures(serviceType);
    
    const featureCount = categoryFeatures.length;
    const essentialCount = Math.max(3, Math.ceil(featureCount * 0.5));
    const completeCount = Math.max(5, Math.ceil(featureCount * 0.75));
    
    return [
      {
        id: 'essential',
        name: '🥉 Essential Package',
        icon: '📦',
        description: 'Core services for your wedding day',
        bestFor: `Perfect for intimate weddings${guestCount ? ` (${guestCount} guests)` : ''}`,
        basePrice: Math.round(baseServicePrice * 0.6 * scale * budgetMultiplier),
        features: categoryFeatures.slice(0, essentialCount)
      },
      {
        id: 'complete',
        name: '🥈 Complete Package',
        icon: '⭐',
        badge: 'MOST POPULAR',
        description: 'Everything you need for a memorable wedding',
        bestFor: `Ideal for most weddings${guestCount ? ` (${guestCount} guests)` : ''}`,
        basePrice: Math.round(baseServicePrice * scale * budgetMultiplier),
        features: categoryFeatures.slice(0, completeCount)
      },
      {
        id: 'premium',
        name: '🥇 Premium Package',
        icon: '💎',
        description: 'Luxury service with all premium features',
        bestFor: `For grand celebrations${guestCount ? ` (${guestCount} guests)` : ''}`,
        basePrice: Math.round(baseServicePrice * 1.5 * scale * budgetMultiplier),
        features: categoryFeatures
      }
    ];
  }
  
  // 🎯 PRIORITY 3: Use actual features only (estimate price from budget/category)
  if (actualFeatures && actualFeatures.length > 0) {
    const estimatedPrice = budgetRange ? (
      budgetRange.includes('100,000+') ? 80000 :
      budgetRange.includes('50,000-100,000') ? 40000 :
      budgetRange.includes('25,000-50,000') ? 25000 : 15000
    ) : getCategoryBasePrice(serviceType);
    
    const featureCount = actualFeatures.length;
    const essentialCount = Math.max(1, Math.ceil(featureCount * 0.5));
    const completeCount = Math.max(2, Math.ceil(featureCount * 0.75));
    
    return [
      {
        id: 'essential',
        name: '🥉 Essential Package',
        icon: '📦',
        description: 'Core services from your offering',
        bestFor: `Perfect for intimate weddings${guestCount ? ` (${guestCount} guests)` : ''}`,
        basePrice: Math.round(estimatedPrice * 0.6 * scale * budgetMultiplier),
        features: actualFeatures.slice(0, essentialCount)
      },
      {
        id: 'complete',
        name: '🥈 Complete Package',
        icon: '⭐',
        badge: 'MOST POPULAR',
        description: 'Full service with premium features',
        bestFor: `Ideal for most weddings${guestCount ? ` (${guestCount} guests)` : ''}`,
        basePrice: Math.round(estimatedPrice * scale * budgetMultiplier),
        features: actualFeatures.slice(0, completeCount)
      },
      {
        id: 'premium',
        name: '🥇 Premium Package',
        icon: '💎',
        description: 'Complete service with all features',
        bestFor: `For grand celebrations${guestCount ? ` (${guestCount} guests)` : ''}`,
        basePrice: Math.round(estimatedPrice * 1.5 * scale * budgetMultiplier),
        features: actualFeatures
      }
    ];
  }
  
  // 🔄 FALLBACK: Generic packages if no service data available
  const basePrices: Record<string, number[]> = {
    'Photographer & Videographer': [15000, 35000, 65000],
    'Caterer': [200, 350, 600], // per person
    'DJ': [20000, 35000, 55000],
    'DJ/Band': [25000, 45000, 75000],
    'Wedding Planner': [25000, 50000, 100000],
    'Florist': [8000, 18000, 35000],
    'Hair & Makeup Artists': [3000, 6000, 12000],
    'Cake Designer': [5000, 12000, 25000],
    'Dress Designer/Tailor': [15000, 35000, 70000],
    'Event Rentals': [10000, 25000, 50000],
    'Transportation Services': [8000, 18000, 35000],
    'Officiant': [5000, 10000, 20000],
    'Security & Guest Management': [15000, 30000, 50000],
    'Sounds & Lights': [18000, 35000, 60000],
    'Stationery Designer': [5000, 12000, 25000],
    'Venue Coordinator': [20000, 40000, 70000],
    'Wedding Planning': [30000, 60000, 120000],
    'default': [10000, 25000, 50000]
  };

  const prices = basePrices[serviceType] || basePrices['default'];
  const isCaterer = serviceType === 'Caterer';

  return [
    {
      id: 'essential',
      name: '🥉 Essential Package',
      icon: '📦',
      description: 'Core services for your wedding day',
      bestFor: `Perfect for intimate weddings${guestCount ? ` (${guestCount} guests)` : ''}`,
      basePrice: isCaterer && guestCount ? prices[0] * guestCount : Math.round(prices[0] * scale * budgetMultiplier),
      features: [
        'Professional service guarantee',
        'Basic setup and coordination',
        'Standard equipment/materials',
        isCaterer ? `${guestCount || 50} guests included` : 'Core service hours',
        'Email support'
      ]
    },
    {
      id: 'complete',
      name: '🥈 Complete Package',
      icon: '⭐',
      badge: 'MOST POPULAR',
      description: 'Everything you need for a memorable wedding',
      bestFor: `Ideal for most weddings${guestCount ? ` (${guestCount} guests)` : ''}`,
      basePrice: isCaterer && guestCount ? prices[1] * guestCount : Math.round(prices[1] * scale * budgetMultiplier),
      features: [
        'Premium professional service',
        'Full setup and coordination',
        'Premium equipment/materials',
        isCaterer ? `${guestCount || 100} guests included` : 'Extended service hours',
        'Priority support',
        'Complimentary consultation'
      ]
    },
    {
      id: 'premium',
      name: '🥇 Premium Package',
      icon: '💎',
      description: 'Luxury experience with premium features',
      bestFor: `For grand celebrations${guestCount ? ` (${guestCount} guests)` : ''}`,
      basePrice: isCaterer && guestCount ? prices[2] * guestCount : Math.round(prices[2] * scale * budgetMultiplier),
      features: [
        'Elite professional service',
        'Complete setup and decoration',
        'Top-tier equipment/materials',
        isCaterer ? `${guestCount || 200} guests included` : 'Full day coverage',
        'Dedicated coordinator',
        '24/7 VIP support',
        'Premium add-ons included'
      ]
    }
  ];
};

export const SendQuoteModal: React.FC<SendQuoteModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSendQuote,
  vendorPricing,
  onSavePricing,
  serviceData
}) => {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [quoteMessage, setQuoteMessage] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [terms, setTerms] = useState('');
  const [downpaymentPercentage, setDownpaymentPercentage] = useState(30);
  const [loading, setLoading] = useState(false);
  const [isEditingPrices, setIsEditingPrices] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    coupleName: string;
    amount: string;
    itemCount: number;
    notificationSent: boolean;
  } | null>(null);

  // Function to get vendor's custom price or default price
  const getVendorPrice = (serviceType: string, itemName: string, defaultPrice: number): number => {
    return vendorPricing?.[serviceType]?.[itemName] ?? defaultPrice;
  };

  // 🔧 FIX: Memoize loadExistingQuoteData to prevent it from changing on every render
  // Function to load existing quote data when editing
  const loadExistingQuoteData = React.useCallback(async () => {
    try {
      // For now, reconstruct quote from booking data
      // In a real system, you'd fetch from /api/quotes/:bookingId
      if (booking.quoteAmount && booking.quoteAmount > 0) {
        const existingQuoteItems: QuoteItem[] = [
          {
            id: 'existing-1',
            name: `${booking.serviceType} Service Package`,
            description: booking.notes || `Complete ${booking.serviceType.toLowerCase()} service for your wedding`,
            quantity: 1,
            unitPrice: booking.quoteAmount,
            total: booking.quoteAmount,
            category: `${booking.serviceType} Services`
          }
        ];
        
        setQuoteItems(existingQuoteItems);
        setQuoteMessage(`EDIT QUOTE: Previously sent quote for ${booking.coupleName}'s wedding on ${booking.eventDate}`);
        
        // Set terms based on existing booking data
        setTerms('Payment terms: 50% deposit required to secure booking, remaining balance due 7 days before event.');
        
        // Set validity based on event date
        const eventDate = new Date(booking.eventDate);
        const validityDate = new Date(eventDate);
        validityDate.setDate(validityDate.getDate() - 14); // Valid until 2 weeks before event
        setValidUntil(validityDate.toISOString().split('T')[0]);
        
        }
    } catch (error) {
      console.error('❌ [SendQuoteModal] Failed to load existing quote:', error);
      // Fall back to empty form
      setQuoteItems([]);
      setQuoteMessage('');
    }
  }, [booking.id, booking.quoteAmount, booking.serviceType, booking.notes, booking.coupleName, booking.eventDate]);

  // Reset form when modal opens
  // 🔧 FIX: Only depend on primitive values to prevent infinite loop
  // Objects (booking, serviceData) get recreated on every parent render
  // ⚠️ CRITICAL: Do NOT include loadExistingQuoteData in dependencies - it causes infinite loop
  React.useEffect(() => {
    if (isOpen && booking) {
      // First check if this is an edit quote (booking has quote_sent status and existing quote data)
      const isEditMode = booking.status === 'quote_sent' && booking.quoteAmount && booking.quoteAmount > 0;
      
      if (isEditMode) {
        // Call the function directly - don't depend on it in useEffect deps
        loadExistingQuoteData();
      } else if (serviceData && serviceData.features && serviceData.features.length > 0) {
        // Convert service items to quote items
        const basePrice = parseFloat(serviceData.price) || 10000;
        const pricePerItem = Math.round(basePrice / Math.max(serviceData.features.length, 1));
        
        const prefillItems: QuoteItem[] = serviceData.features.map((item, index) => ({
          id: `item-${index + 1}`,
          name: item,
          description: `${item} - provided for ${serviceData.name} service`,
          quantity: 1,
          unitPrice: index === 0 ? basePrice - (pricePerItem * (serviceData.features.length - 1)) : pricePerItem,
          total: index === 0 ? basePrice - (pricePerItem * (serviceData.features.length - 1)) : pricePerItem,
          category: `${serviceData.category} - Equipment & Items`
        }));
        
        setQuoteItems(prefillItems);
        setQuoteMessage(`Thank you for your interest in our ${serviceData.name} service. Below is the detailed breakdown of all items and equipment included:`);
        
        } else {
        // Reset to empty form - no pre-filled values
        setQuoteItems([]);
        setQuoteMessage('');
      }
      
      if (!isEditMode) {
        setTerms('');
        
        // Set default validity to 1 week from now
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        const formattedDate = oneWeekFromNow.toISOString().split('T')[0]; // YYYY-MM-DD format
        setValidUntil(formattedDate);
      }
    }
    // ⚠️ REMOVED loadExistingQuoteData from dependencies to fix infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, booking?.id, booking?.status, booking?.quoteAmount, serviceData?.id]);

  // Function to save current prices as vendor's default
  const saveVendorPricing = () => {
    if (!onSavePricing || !booking.serviceType) return;
    
    const currentPricing: VendorPricing = {
      [booking.serviceType]: {}
    };
    
    quoteItems.forEach(item => {
      currentPricing[booking.serviceType][item.name] = item.unitPrice;
    });
    
    onSavePricing(currentPricing);
    setIsEditingPrices(false);
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setQuoteItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(0, quantity), total: Math.max(0, quantity) * item.unitPrice }
          : item
      )
    );
  };

  const updateItemPrice = (itemId: string, unitPrice: number) => {
    setQuoteItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, unitPrice: Math.max(0, unitPrice), total: item.quantity * Math.max(0, unitPrice) }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setQuoteItems(items => items.filter(item => item.id !== itemId));
  };

  const addCustomItem = () => {
    const newItem: QuoteItem = {
      id: `custom-${Date.now()}`,
      name: 'Custom Service',
      description: 'Additional service as requested by client',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      category: 'Additional Services'
    };
    setQuoteItems(items => [...items, newItem]);
  };

  const updateItemField = (itemId: string, field: string, value: string) => {
    setQuoteItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.12; // 12% VAT
  const total = subtotal + tax;
  const downpayment = total * (downpaymentPercentage / 100);
  const balance = total - downpayment;

  const handleSendQuote = async () => {
    // 📋 STEP 1: Show confirmation dialog
    const confirmed = window.confirm(
      `📋 Send Quote to ${booking.coupleName}?\n\n` +
      `Service: ${booking.serviceType}\n` +
      `Total Amount: ${formatPHP(total)}\n` +
      `Downpayment: ${formatPHP(downpayment)}\n` +
      `Items: ${quoteItems.length}\n` +
      `Valid Until: ${new Date(validUntil).toLocaleDateString()}\n\n` +
      `The client will be notified immediately.\n\n` +
      `Click OK to send quote now.`
    );

    if (!confirmed) {
      return; // User cancelled
    }

    setLoading(true);
    
    const quoteData = {
      quoteNumber: `Q-${Date.now()}`,
      serviceItems: quoteItems,
      pricing: {
        subtotal,
        tax,
        total,
        downpayment,
        balance
      },
      paymentTerms: {
        downpayment: downpaymentPercentage,
        balance: 100 - downpaymentPercentage
      },
      validUntil,
      terms,
      message: quoteMessage,
      timestamp: new Date().toISOString()
    };

    try {
      // 📤 STEP 2: Send quote to backend
      const sendQuotePayload = {
        quotedPrice: total,
        quotedDeposit: downpayment,
        vendorNotes: quoteMessage || `Quote for ${booking.serviceType} service`,
        validityDays: Math.ceil((new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        itemization: quoteData
      };
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const response = await fetch(`${apiUrl}/api/bookings/${booking.id}/send-quote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(sendQuotePayload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send quote: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      // 🔔 STEP 3: Send notification to couple
      let notificationSent = false;
      try {
        const notificationPayload = {
          userId: booking.coupleId,
          userType: 'individual',
          title: '💰 New Quote Received!',
          message: `${booking.vendorName} sent you a quote for ${booking.serviceType} - ${formatPHP(total)}`,
          type: 'quote',
          actionUrl: `/individual/bookings?bookingId=${booking.id}`,
          metadata: {
            bookingId: booking.id,
            vendorId: booking.vendorId,
            vendorName: booking.vendorName,
            serviceType: booking.serviceType,
            quotedPrice: total,
            downpaymentAmount: downpayment,
            eventDate: booking.eventDate,
            quoteValidUntil: validUntil
          }
        };

        const notificationResponse = await fetch(`${apiUrl}/api/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notificationPayload)
        });

        if (notificationResponse.ok) {
          await notificationResponse.json();
          notificationSent = true;
        } else {
          const notifError = await notificationResponse.text();
          console.error('⚠️ Notification API error:', notifError);
        }
      } catch (notifError) {
        console.error('⚠️ Failed to send notification:', notifError);
      }
      
      // ✅ STEP 4: Show success modal
      setSuccessData({
        coupleName: booking.coupleName,
        amount: formatPHP(total),
        itemCount: quoteItems.length,
        notificationSent
      });
      setShowSuccessModal(true);
      
      // Create a formatted result that includes the quote data
      const formattedResult = {
        ...result,
        quote: quoteData,
        booking: {
          ...result.booking,
          status: 'quote_sent',
          quote: quoteData
        }
      };
      
      // Call the parent callback with the formatted result
      await onSendQuote(formattedResult);
      // Don't close immediately - wait for success modal confirmation
    } catch (error) {
      console.error('❌ [SendQuoteModal] Error sending quote:', error);
      alert(
        `❌ Failed to Send Quote\n\n` +
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
        `Please check your internet connection and try again.\n` +
        `If the problem persists, contact support.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
    onClose();
  };

  const groupedItems = quoteItems.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, QuoteItem[]>);

  // Function to load additional template items (additive to current quote)
  const loadTemplate = (serviceType: string) => {
    const template = DEFAULT_QUOTE_TEMPLATES[serviceType];
    if (!template) return;

    // Convert template items to QuoteItems with vendor pricing
    const newItems: QuoteItem[] = template.items.map((templateItem, index) => ({
      id: `${serviceType.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      name: templateItem.name,
      description: templateItem.description,
      quantity: templateItem.quantity,
      unitPrice: getVendorPrice(serviceType, templateItem.name, templateItem.unitPrice),
      total: templateItem.quantity * getVendorPrice(serviceType, templateItem.name, templateItem.unitPrice),
      category: templateItem.category
    }));

    // Add to existing items (don't replace)
    setQuoteItems(prevItems => [...prevItems, ...newItems]);
    
    };

  // Function to load preset package (replaces current quote items)
  const loadPresetPackage = (packageId: 'essential' | 'complete' | 'premium') => {
    const packages = getSmartPackages(
      booking.serviceType, 
      booking.guestCount, 
      booking.budgetRange,
      serviceData?.features, // Pass actual service features
      serviceData?.price // Pass actual service price
    );
    const selectedPackage = packages.find(pkg => pkg.id === packageId);
    
    if (!selectedPackage) {
      console.error(`❌ [SendQuoteModal] Package not found: ${packageId}`);
      return;
    }

    // Create quote items from package features
    const newItems: QuoteItem[] = selectedPackage.features.map((feature, index) => ({
      id: `${packageId}-${Date.now()}-${index}`,
      name: feature,
      description: `Included in ${selectedPackage.name}`,
      quantity: 1,
      unitPrice: Math.round(selectedPackage.basePrice / selectedPackage.features.length),
      total: Math.round(selectedPackage.basePrice / selectedPackage.features.length),
      category: booking.serviceType
    }));

    setQuoteItems([...newItems]);
    
    // Update quote message with package info
    setQuoteMessage(`Thank you for your interest! I've prepared ${selectedPackage.name} for your ${booking.serviceType} needs. This package includes ${newItems.length} carefully selected services. Please review the breakdown below and let me know if you'd like any adjustments.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-8 py-6 border-b border-rose-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Enhanced Wedding Quote</h2>
              <p className="text-gray-600 mt-1 text-lg">
                For {booking.coupleName} • {booking.serviceType} • {new Date(booking.eventDate).toLocaleDateString()}
              </p>
              <p className="text-rose-600 mt-1 font-semibold">
                Comprehensive {booking.serviceType} Package
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-rose-100 rounded-full transition-colors"
            >
              <span className="text-2xl text-gray-500">×</span>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Quote Items Section */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Service Breakdown</h3>
                <div className="flex gap-3 flex-wrap">
                  {onSavePricing && (
                    <button
                      onClick={() => setIsEditingPrices(!isEditingPrices)}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        isEditingPrices 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isEditingPrices ? '💾 Save My Prices' : '✏️ Edit My Prices'}
                    </button>
                  )}
                  <button
                    onClick={addCustomItem}
                    className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors text-sm font-medium"
                  >
                    + Add Custom Item
                  </button>
                </div>
              </div>

              {/* 🎯 SMART PACKAGE SELECTOR - Shows if no items yet */}
              {quoteItems.length === 0 && (
                <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 mb-8 border-2 border-blue-200 shadow-lg">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">🚀 Quick Start: Choose Your Package</h3>
                    <p className="text-gray-600">Select a starting point and customize from there</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getSmartPackages(
                      booking.serviceType, 
                      booking.guestCount, 
                      booking.budgetRange,
                      serviceData?.features, // Pass actual service features  
                      serviceData?.price // Pass actual service price
                    ).map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => loadPresetPackage(pkg.id as 'essential' | 'complete' | 'premium')}
                        className={`relative bg-white rounded-xl p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl text-left ${
                          pkg.badge 
                            ? 'border-rose-400 shadow-lg ring-4 ring-rose-100' 
                            : 'border-gray-200 hover:border-rose-300'
                        }`}
                      >
                        {pkg.badge && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            {pkg.badge}
                          </div>
                        )}
                        
                        <div className="text-4xl mb-3 text-center">{pkg.icon}</div>
                        <h4 className="font-bold text-lg text-gray-900 mb-2 text-center">{pkg.name}</h4>
                        <p className="text-sm text-gray-600 mb-3 text-center">{pkg.description}</p>
                        
                        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-3 mb-3">
                          <div className="text-2xl font-bold text-rose-600 text-center">
                            {formatPHP(pkg.basePrice)}
                          </div>
                          <div className="text-xs text-gray-500 text-center mt-1">{pkg.bestFor}</div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Key Features:</div>
                          {pkg.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-green-500 mt-0.5">✓</span>
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                          {pkg.features.length > 4 && (
                            <div className="text-xs text-gray-500 text-center mt-2">
                              +{pkg.features.length - 4} more features
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="bg-blue-50 text-blue-700 text-xs font-semibold py-2 px-3 rounded-lg text-center">
                            👆 Click to Load for Review
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="text-center mt-6 space-y-2">
                    <p className="text-sm font-semibold text-gray-700">
                      💡 How it works:
                    </p>
                    <p className="text-sm text-gray-600">
                      1️⃣ Click a package to load items • 2️⃣ Review and customize below • 3️⃣ Click "Send Quote" when ready
                    </p>
                    <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg py-2 px-4 inline-block">
                      ⚠️ Selecting a package only loads the items for review - it does NOT send the quote
                    </p>
                  </div>
                </div>
              )}

              {/* Show template loader only if items exist */}
              {quoteItems.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 mb-1">📦 Add More Services</h4>
                      <p className="text-sm text-blue-700">Add items from other service categories to create a complete package</p>
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value && e.target.value !== booking.serviceType) {
                          const confirmed = window.confirm(
                            `Add items from ${e.target.value} template? This will add to your current quote.`
                          );
                          if (confirmed) {
                            loadTemplate(e.target.value);
                          }
                        }
                        e.target.value = ''; // Reset selector
                      }}
                      className="px-4 py-2 border-2 border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                      title="Add services from other categories"
                    >
                      <option value="">Select service to add...</option>
                      {Object.keys(DEFAULT_QUOTE_TEMPLATES)
                        .filter(serviceType => serviceType !== booking.serviceType)
                        .map(serviceType => (
                          <option key={serviceType} value={serviceType}>
                            {serviceType}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              )}

              {isEditingPrices && onSavePricing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Price Editing Mode</h4>
                      <p className="text-blue-700 text-sm">Adjust prices below to set your default rates for {booking.serviceType} services</p>
                    </div>
                    <button
                      onClick={saveVendorPricing}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Save as My Default Prices
                    </button>
                  </div>
                </div>
              )}

              {/* Quote Preview Toggle */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-800">📄 Quote Preview</h4>
                    <p className="text-green-700 text-sm">Preview how your itemized quote will look to the client</p>
                  </div>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    {showPreview ? '📝 Edit Quote' : '👁️ Preview Quote'}
                  </button>
                </div>
              </div>

              {/* Professional Quote Preview */}
              {showPreview && (
                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-lg">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Wedding Service Quote</h2>
                    <p className="text-gray-600 text-lg">Quote #{`Q-${Date.now()}`}</p>
                    <div className="bg-rose-50 rounded-lg p-4 mt-4">
                      <p className="text-rose-800"><strong>For:</strong> {booking.coupleName}</p>
                      <p className="text-rose-800"><strong>Event Date:</strong> {new Date(booking.eventDate).toLocaleDateString()}</p>
                      <p className="text-rose-800"><strong>Service Type:</strong> {booking.serviceType}</p>
                    </div>
                  </div>

                  {/* Itemized Services by Category */}
                  {Object.entries(groupedItems).map(([category, items]) => {
                    const categoryTotal = items.reduce((sum, item) => sum + item.total, 0);
                    
                    return (
                      <div key={category} className="mb-8">
                        <div className="bg-gray-100 rounded-lg p-3 mb-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">{category}</h3>
                            <div className="text-rose-600 font-bold text-lg">{formatPHP(categoryTotal)}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {items.map((item) => (
                            <div key={item.id} className="border-b border-gray-200 pb-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                  <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                                </div>
                                <div className="text-right min-w-[120px]">
                                  <div className="text-gray-600 text-sm">
                                    {item.quantity} × {formatPHP(item.unitPrice)}
                                  </div>
                                  <div className="font-semibold text-gray-900">{formatPHP(item.total)}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Quote Totals */}
                  <div className="border-t-2 border-gray-300 pt-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-700">Subtotal:</span>
                          <span className="font-semibold">{formatPHP(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-700">Tax (12%):</span>
                          <span className="font-semibold">{formatPHP(tax)}</span>
                        </div>
                        <div className="border-t border-gray-300 pt-3">
                          <div className="flex justify-between text-2xl font-bold">
                            <span className="text-gray-900">Total Quote:</span>
                            <span className="text-rose-600">{formatPHP(total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Terms */}
                    <div className="mt-6 bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3">Payment Terms</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">Booking Deposit ({downpaymentPercentage}%):</span>
                          <div className="font-semibold text-blue-900 text-lg">{formatPHP(downpayment)}</div>
                        </div>
                        <div>
                          <span className="text-blue-700">Balance (Due on event day):</span>
                          <div className="font-semibold text-blue-900 text-lg">{formatPHP(balance)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {Object.entries(groupedItems).map(([category, items]) => {
                const categoryTotal = items.reduce((sum, item) => sum + item.total, 0);
                const categoryItemCount = items.length;
                
                return (
                  <div key={category} className="space-y-4">
                    {/* Enhanced Category Header with Summary */}
                    <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-xl p-4 border-l-4 border-rose-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-800 text-xl">
                            📋 {category}
                          </h4>
                          <p className="text-gray-600 text-sm mt-1">
                            {categoryItemCount} item{categoryItemCount !== 1 ? 's' : ''} • Category Total: <span className="font-semibold text-rose-600">{formatPHP(categoryTotal)}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="bg-white px-3 py-1 rounded-full border border-rose-200">
                            <span className="text-rose-600 font-bold text-lg">{formatPHP(categoryTotal)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="bg-gradient-to-r from-gray-50 to-rose-50 rounded-xl p-5 space-y-3 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItemField(item.id, 'name', e.target.value)}
                              className="font-bold text-gray-900 bg-transparent border-none outline-none text-lg w-full"
                              placeholder="Service name"
                              aria-label="Service name"
                            />
                            <textarea
                              value={item.description}
                              onChange={(e) => updateItemField(item.id, 'description', e.target.value)}
                              className="text-gray-600 bg-transparent border-none outline-none w-full mt-1 resize-none"
                              rows={2}
                              placeholder="Service description"
                              aria-label="Service description"
                            />
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-100 rounded-full transition-colors"
                          >
                            ×
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                              min="0"
                              placeholder="Qty"
                              aria-label="Quantity"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                              {vendorPricing?.[booking.serviceType]?.[item.name] && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  My Price
                                </span>
                              )}
                            </div>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                                vendorPricing?.[booking.serviceType]?.[item.name] 
                                  ? 'border-green-300 bg-green-50' 
                                  : 'border-gray-300'
                              }`}
                              min="0"
                              placeholder="Price"
                              aria-label="Unit price"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                            <div className="px-3 py-2 bg-rose-100 rounded-lg font-bold text-rose-700 text-lg">
                              {formatPHP(item.total)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
              
              {/* Service Type Summary Card */}
              {Object.keys(groupedItems).length > 1 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-bold text-blue-900 text-lg mb-4">📊 Service Breakdown by Category</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(groupedItems).map(([category, items]) => {

                      const categoryTotal = items.reduce((sum, item) => sum + item.total, 0);
                      const categoryPercentage = ((categoryTotal / subtotal) * 100).toFixed(1);
                      
                      return (
                        <div key={category} className="bg-white rounded-lg p-3 border border-blue-100">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm">{category}</span>
                            <span className="text-blue-600 font-bold">{formatPHP(categoryTotal)}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">{items.length} items</span>
                            <span className="text-xs text-blue-500">{categoryPercentage}% of total</span>
                          </div>
                          {/* Visual percentage bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${categoryPercentage}%` }}
                              
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary & Actions Section */}
          <div className="w-full max-w-md p-8 bg-gray-50 border-l border-gray-200 hidden md:block">
            <div className="sticky top-4">
              {/* Wedding Details Card */}
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Wedding Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Couple's Name:</span>
                    <span className="font-semibold text-gray-900">{booking.coupleName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Event Date:</span>
                    <span className="font-semibold text-gray-900">{new Date(booking.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Service Type:</span>
                    <span className="font-semibold text-gray-900">{booking.serviceType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Guest Count:</span>
                    <span className="font-semibold text-gray-900">{booking.guestCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Budget Range:</span>
                    <span className="font-semibold text-gray-900">{booking.budgetRange || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Quote Summary Card */}
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Quote Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold text-gray-900">{formatPHP(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Tax (12%):</span>
                    <span className="font-semibold text-gray-900">{formatPHP(tax)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-rose-600">{formatPHP(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4">
                {quoteItems.length > 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-green-800 mb-1">
                      ✅ Quote Ready to Send
                    </p>
                    <p className="text-xs text-green-700">
                      Review the details above, then click the button below to send this quote to {booking.coupleName}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={handleSendQuote}
                  disabled={quoteItems.length === 0 || loading}
                  className={`w-full rounded-lg px-6 py-4 font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                    quoteItems.length === 0 || loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700'
                  }`}
                >
                  {loading ? '⏳ Sending Quote...' : quoteItems.length === 0 ? '⚠️ Add Items First' : '📤 SEND QUOTE TO CLIENT'}
                </button>
                
                {quoteItems.length === 0 && (
                  <p className="text-xs text-center text-gray-500">
                    💡 Select a package above or add custom items to enable sending
                  </p>
                )}
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 rounded-lg px-4 py-2 font-semibold hover:bg-gray-200 transition-colors"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Success Modal */}
      {showSuccessModal && successData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Quote Sent Successfully!</h3>
              <p className="text-green-50">Your quote has been delivered to the client</p>
            </div>

            {/* Success Body */}
            <div className="p-8">
              <div className="space-y-4">
                {/* Client Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-semibold text-gray-900">{successData.coupleName}</p>
                    </div>
                  </div>

                  {/* Quote Details */}
                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <span className="text-gray-600">Quote Amount</span>
                    <span className="text-2xl font-bold text-green-600">{successData.amount}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-600">Items Included</span>
                    <span className="font-semibold text-gray-900">{successData.itemCount} items</span>
                  </div>
                </div>

                {/* Notification Status */}
                <div className={`rounded-xl p-4 ${
                  successData.notificationSent 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-yellow-50 border-2 border-yellow-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {successData.notificationSent ? (
                      <>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">Client Notified</p>
                          <p className="text-sm text-green-700 mt-1">
                            {successData.coupleName} has been notified and can now review your quote in their dashboard.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-yellow-900">Notification Pending</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Quote was saved but client notification may be delayed. Please follow up via email or phone.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">📋 What happens next?</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Client reviews your quote in their dashboard</li>
                    <li>• They can accept, decline, or request changes</li>
                    <li>• You'll be notified of their response</li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSuccessModalClose}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl px-6 py-4 font-semibold hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                ✓ Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
