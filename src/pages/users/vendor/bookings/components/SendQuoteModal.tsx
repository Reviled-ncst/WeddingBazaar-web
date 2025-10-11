import React, { useState, useEffect } from 'react';

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

// PRESET QUOTE PACKAGES - BASIC, STANDARD, PREMIUM
interface PresetPackage {
  name: string;
  description: string;
  items: string[]; // Array of item names to include from the template
  estimatedTotal: number;
  recommended: boolean;
}

const PRESET_PACKAGES: Record<string, Record<string, PresetPackage>> = {
  'Photographer & Videographer': {
    'Basic': {
      name: 'Basic Photography & Video Package',
      description: 'Essential wedding photography and videography coverage',
      items: [
        'Wedding Day Photography (8 hours)',
        'Wedding Videography (6 hours)',
        'Professional Photo Editing',
        'Digital Photo Gallery'
      ],
      estimatedTotal: 18000,
      recommended: false
    },
    'Standard': {
      name: 'Standard Photography & Video Package',
      description: 'Complete photography and videography with premium features',
      items: [
        'Wedding Day Photography (8 hours)',
        'Wedding Videography (8 hours)',
        'Engagement Photography',
        'Professional Photo Editing',
        'Wedding Video Editing',
        'Digital Photo Gallery',
        'Wedding Album Creation'
      ],
      estimatedTotal: 28000,
      recommended: true
    },
    'Premium': {
      name: 'Premium Photography & Video Package',
      description: 'Comprehensive photography and videography experience',
      items: [
        'Wedding Day Photography (10 hours)',
        'Wedding Videography (10 hours)',
        'Engagement Photography',
        'Professional Photo Editing',
        'Wedding Video Editing',
        'Digital Photo Gallery',
        'Wedding Album Creation',
        'Drone Photography',
        '360 Degree Photography'
      ],
      estimatedTotal: 45000,
      recommended: false
    }
  },

  'Caterer': {
    'Basic': {
      name: 'Basic Catering Package',
      description: 'Simple buffet service for intimate weddings',
      items: [
        'Wedding Catering',
        'Basic Menu Selection',
        'Service Staff'
      ],
      estimatedTotal: 15000,
      recommended: false
    },
    'Standard': {
      name: 'Standard Catering Package',
      description: 'Complete catering with premium menu options',
      items: [
        'Wedding Catering',
        'Cocktail Hour Catering',
        'Reception Catering',
        'Premium Menu Selection',
        'Professional Service Staff'
      ],
      estimatedTotal: 25000,
      recommended: true
    },
    'Premium': {
      name: 'Premium Catering Package',
      description: 'Luxury catering experience with full service',
      items: [
        'Wedding Catering',
        'Cocktail Hour Catering',
        'Reception Catering',
        'Brunch/Lunch Catering',
        'Wedding Cake Service',
        'Premium Menu & Wine Pairing',
        'Dedicated Catering Manager'
      ],
      estimatedTotal: 40000,
      recommended: false
    }
  },

  'DJ': {
    'Basic': {
      name: 'Basic DJ Package',
      description: 'Essential DJ services for ceremony and reception',
      items: [
        'DJ Services (6 hours)',
        'Basic Sound System',
        'Music Library'
      ],
      estimatedTotal: 25000,
      recommended: false
    },
    'Standard': {
      name: 'Standard DJ Package',
      description: 'Complete DJ package with lighting and MC services',
      items: [
        'DJ Services (8 hours)',
        'Professional Sound System',
        'Basic Lighting Package',
        'MC Services',
        'Music Library'
      ],
      estimatedTotal: 35000,
      recommended: true
    },
    'Premium': {
      name: 'Premium DJ Package',
      description: 'Full entertainment package with premium effects',
      items: [
        'DJ Services (10 hours)',
        'Premium Sound System',
        'Full Lighting Package',
        'MC Services',
        'Dance Floor Effects',
        'Music Library',
        'Sound Engineer'
      ],
      estimatedTotal: 50000,
      recommended: false
    }
  },

  'Wedding Planner': {
    'Basic': {
      name: 'Basic Planning Package',
      description: 'Day-of coordination and essential planning services',
      items: [
        'Day-of Wedding Coordination',
        'Timeline Management',
        'Vendor Coordination'
      ],
      estimatedTotal: 20000,
      recommended: false
    },
    'Standard': {
      name: 'Standard Planning Package',
      description: 'Partial planning with comprehensive coordination',
      items: [
        'Wedding Planning & Design',
        'Day-of Wedding Coordination',
        'Vendor Management',
        'Timeline Management',
        'Budget Planning'
      ],
      estimatedTotal: 35000,
      recommended: true
    },
    'Premium': {
      name: 'Premium Planning Package',
      description: 'Full-service wedding planning from start to finish',
      items: [
        'Full Wedding Planning & Design',
        'Day-of Wedding Coordination',
        'Vendor Management',
        'Timeline Management',
        'Budget Planning',
        'Venue Selection',
        'Design Consultation'
      ],
      estimatedTotal: 60000,
      recommended: false
    }
  },

  'Florist': {
    'Basic': {
      name: 'Basic Floral Package',
      description: 'Essential floral arrangements for ceremony and reception',
      items: [
        'Bridal Bouquet',
        'Ceremony Decorations',
        'Basic Centerpieces'
      ],
      estimatedTotal: 8000,
      recommended: false
    },
    'Standard': {
      name: 'Standard Floral Package',
      description: 'Complete floral design with premium arrangements',
      items: [
        'Bridal Bouquet',
        'Bridesmaids Bouquets',
        'Ceremony Decorations',
        'Reception Centerpieces',
        'Boutonnières'
      ],
      estimatedTotal: 15000,
      recommended: true
    },
    'Premium': {
      name: 'Premium Floral Package',
      description: 'Luxury floral experience with full venue transformation',
      items: [
        'Bridal Bouquet',
        'Bridesmaids Bouquets',
        'Ceremony Decorations',
        'Reception Centerpieces',
        'Boutonnières',
        'Ceremony Arch',
        'Venue Transformation'
      ],
      estimatedTotal: 25000,
      recommended: false
    }
  },

  'Wedding Planning': {
    'Basic': {
      name: 'Basic Wedding Planning Package',
      description: 'Essential wedding planning and coordination services',
      items: [
        'Comprehensive Wedding Planning',
        'Timeline & Schedule Management',
        'Budget Planning & Tracking'
      ],
      estimatedTotal: 48000,
      recommended: false
    },
    'Standard': {
      name: 'Standard Wedding Planning Package',
      description: 'Complete planning with design and vendor coordination',
      items: [
        'Comprehensive Wedding Planning',
        'Wedding Design & Styling',
        'Vendor Coordination & Management',
        'Timeline & Schedule Management',
        'Budget Planning & Tracking'
      ],
      estimatedTotal: 70000,
      recommended: true
    },
    'Premium': {
      name: 'Premium Wedding Planning Package',
      description: 'Full-service luxury wedding planning experience',
      items: [
        'Comprehensive Wedding Planning',
        'Wedding Design & Styling',
        'Vendor Coordination & Management',
        'Timeline & Schedule Management',
        'Budget Planning & Tracking'
      ],
      estimatedTotal: 75000,
      recommended: false
    }
  }
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

  // Function to get vendor's custom price or default price
  const getVendorPrice = (serviceType: string, itemName: string, defaultPrice: number): number => {
    return vendorPricing?.[serviceType]?.[itemName] ?? defaultPrice;
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && booking) {
      // Initialize with service items if available, otherwise empty form
      if (serviceData && serviceData.features && serviceData.features.length > 0) {
        console.log('🎯 [SendQuoteModal] Using service items for prefill:', serviceData);
        
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
        
        console.log('✅ [SendQuoteModal] Prefilled with', prefillItems.length, 'items from service inventory');
      } else {
        // Reset to empty form - no pre-filled values
        console.log('📝 [SendQuoteModal] No service data available, starting with empty form');
        setQuoteItems([]);
        setQuoteMessage('');
      }
      
      setTerms('');
      setValidUntil('');
    }
  }, [isOpen, booking, serviceData]);

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
      await onSendQuote(quoteData);
      onClose();
    } catch (error) {
      console.error('Error sending quote:', error);
    } finally {
      setLoading(false);
    }
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

    console.log(`📦 [SendQuoteModal] Loading additional template for: ${serviceType}`);
    
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
    
    console.log(`✅ [SendQuoteModal] Added ${newItems.length} items from ${serviceType} template`);
  };

  // Function to load preset package (replaces current quote items)
  const loadPresetPackage = (serviceType: string, packageType: 'Basic' | 'Standard' | 'Premium') => {
    const presetPackage = PRESET_PACKAGES[serviceType]?.[packageType];
    const template = DEFAULT_QUOTE_TEMPLATES[serviceType];
    
    if (!presetPackage || !template) {
      console.error(`❌ [SendQuoteModal] Preset package or template not found for: ${serviceType} - ${packageType}`);
      alert(`Preset package not available for ${serviceType} - ${packageType}`);
      return;
    }

    console.log(`🎯 [SendQuoteModal] Loading preset package: ${presetPackage.name}`);
    console.log(`📦 [SendQuoteModal] Current items before replace:`, quoteItems.length);
    
    // Filter template items to only include those in the preset package
    const presetItems = template.items.filter(templateItem => 
      presetPackage.items.includes(templateItem.name)
    );

    console.log(`🔍 [SendQuoteModal] Found ${presetItems.length} items in preset package`);

    // Convert to QuoteItems with vendor pricing
    const newItems: QuoteItem[] = presetItems.map((templateItem, index) => ({
      id: `preset-${packageType.toLowerCase()}-${Date.now()}-${index}`, // Add timestamp to ensure uniqueness
      name: templateItem.name,
      description: templateItem.description,
      quantity: templateItem.quantity,
      unitPrice: getVendorPrice(serviceType, templateItem.name, templateItem.unitPrice),
      total: templateItem.quantity * getVendorPrice(serviceType, templateItem.name, templateItem.unitPrice),
      category: templateItem.category
    }));

    console.log(`🔄 [SendQuoteModal] Replacing ${quoteItems.length} items with ${newItems.length} preset items`);
    
    // Force replace current items with preset package items
    setQuoteItems([...newItems]); // Use spread operator to ensure new array reference
    
    console.log(`✅ [SendQuoteModal] Successfully replaced with ${newItems.length} items from ${presetPackage.name}`);
    
    // Show success message
    const actualTotal = newItems.reduce((sum, item) => sum + item.total, 0);
    setTimeout(() => {
      const message = `Successfully loaded ${presetPackage.name}!\n\nItems: ${newItems.length}\nExpected Total: ${formatPHP(presetPackage.estimatedTotal)}\nYour Total: ${formatPHP(actualTotal)}\n\nNote: Prices may vary based on your vendor rates.`;
      alert(message);
    }, 100);
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
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">Service Breakdown</h3>
                <div className="flex gap-3 flex-wrap">
                  {/* Preset Package Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">🎯 Quick Package:</label>
                    <select
                      onChange={(e) => {
                        console.log(`🎯 [Preset Selector] Selected: ${e.target.value}`);
                        if (e.target.value) {
                          const packageName = e.target.value;
                          const currentItemCount = quoteItems.length;
                          
                          const confirmed = window.confirm(
                            `Load ${packageName} package for ${booking.serviceType}?\n\nThis will REPLACE your current ${currentItemCount} quote items.\n\nClick OK to replace, Cancel to keep current items.`
                          );
                          
                          if (confirmed) {
                            console.log(`✅ [Preset Selector] User confirmed loading ${packageName} package`);
                            loadPresetPackage(booking.serviceType, packageName as 'Basic' | 'Standard' | 'Premium');
                          } else {
                            console.log(`❌ [Preset Selector] User cancelled loading ${packageName} package`);
                          }
                        }
                        e.target.value = ''; // Reset selector
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                      title="Select preset package for current service type"
                      aria-label="Select preset package for current service type"
                    >
                      <option value="">Select preset package...</option>
                      {PRESET_PACKAGES[booking.serviceType] ? 
                        Object.entries(PRESET_PACKAGES[booking.serviceType]).map(([packageType, packageData]) => (
                          <option key={packageType} value={packageType}>
                            {packageData.name} - {formatPHP(packageData.estimatedTotal)}
                            {packageData.recommended ? ' ⭐ Recommended' : ''}
                          </option>
                        )) : (
                          <option disabled>No preset packages available for {booking.serviceType}</option>
                        )
                      }
                    </select>
                  </div>

                  {/* Service Package Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">📦 Quick Add:</label>
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
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                      title="Select additional service template to add to quote"
                      aria-label="Select additional service template to add to quote"
                    >
                      <option value="">Select service template...</option>
                      {Object.keys(DEFAULT_QUOTE_TEMPLATES)
                        .filter(serviceType => serviceType !== booking.serviceType)
                        .map(serviceType => (
                          <option key={serviceType} value={serviceType}>
                            {serviceType} Package
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  
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
              )})}
              
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
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${categoryPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quote Summary Section */}
          <div className="w-96 bg-gradient-to-b from-gray-50 to-rose-50 p-8 overflow-y-auto border-l border-gray-200">
            <div className="space-y-6">
              {/* Enhanced Pricing Summary with Category Breakdown */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-rose-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Quote Summary</h3>
                
                {/* Category Subtotals */}
                {Object.keys(groupedItems).length > 1 && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Service Categories</h4>
                    <div className="space-y-2">
                      {Object.entries(groupedItems).map(([category, items]) => {
                        const categoryTotal = items.reduce((sum, item) => sum + item.total, 0);
                        return (
                          <div key={category} className="flex justify-between text-sm">
                            <span className="text-gray-600 truncate max-w-[200px]" title={category}>
                              {category} ({items.length})
                            </span>
                            <span className="font-medium text-gray-800">{formatPHP(categoryTotal)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Main Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-lg">{formatPHP(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (12%)</span>
                    <span className="font-semibold text-lg">{formatPHP(tax)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total Quote Amount</span>
                      <span className="text-rose-600">{formatPHP(total)}</span>
                    </div>
                  </div>
                  
                  {/* Payment Breakdown */}
                  <div className="bg-rose-50 rounded-lg p-4 mt-4 border border-rose-200">
                    <h4 className="font-semibold text-rose-800 mb-2 text-sm">💳 Payment Schedule</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-rose-700">Booking Deposit (30%)</span>
                        <span className="font-medium text-rose-800">{formatPHP(total * 0.3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rose-700">Balance (Due on wedding day)</span>
                        <span className="font-medium text-rose-800">{formatPHP(total * 0.7)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-rose-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Terms</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Downpayment ({downpaymentPercentage}%)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={downpaymentPercentage}
                      onChange={(e) => setDownpaymentPercentage(parseInt(e.target.value))}
                      className="w-full"
                      aria-label="Downpayment percentage"
                    />
                    <div className="text-2xl font-bold text-rose-600 mt-2">
                      {formatPHP(downpayment)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Balance Due</label>
                    <div className="text-xl font-semibold text-gray-900">
                      {formatPHP(balance)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Details */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-rose-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quote Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      aria-label="Quote validity date"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quote Message</label>
                    <textarea
                      value={quoteMessage}
                      onChange={(e) => setQuoteMessage(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none text-sm"
                      placeholder="Enter your personalized message to the couple..."
                      aria-label="Quote message"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                    <textarea
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none text-xs"
                      placeholder="Enter terms and conditions..."
                      aria-label="Terms and conditions"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleSendQuote}
                  disabled={loading || quoteItems.length === 0}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-rose-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
                >
                  {loading ? 'Sending Quote...' : `Send Quote (${formatPHP(total)})`}
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
