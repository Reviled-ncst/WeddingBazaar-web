// UPDATED QUOTE TEMPLATES BASED ON ACTUAL DATABASE CATEGORIES
// Pricing based on average prices from your database

const REAL_QUOTE_TEMPLATES: Record<string, QuoteTemplate> = {
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

  'Photographer & Videographer': {
    serviceType: 'Photographer & Videographer',
    items: [
      {
        name: 'Wedding Photography Package',
        description: 'Professional wedding photography with 8-hour coverage',
        quantity: 1,
        unitPrice: 5000,
        category: 'Photography'
      },
      {
        name: 'Wedding Videography',
        description: 'Professional wedding videography with highlight reel',
        quantity: 1,
        unitPrice: 4000,
        category: 'Videography'
      },
      {
        name: 'Engagement Photography',
        description: 'Pre-wedding engagement photo session',
        quantity: 1,
        unitPrice: 2500,
        category: 'Pre-Wedding Services'
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
  }
};

export { REAL_QUOTE_TEMPLATES };
