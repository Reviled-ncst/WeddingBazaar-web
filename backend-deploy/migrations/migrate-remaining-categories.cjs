/**
 * Migration Script: Remaining Wedding Service Categories Pricing Templates
 * 
 * This script populates pricing templates for:
 * - Planning & Coordination
 * - Florist & Decorations
 * - Beauty & Styling
 * - Officiant Services
 * - Rentals & Equipment
 * - Wedding Cake
 * - Fashion & Attire
 * - Security Services
 * - AV Equipment
 * - Stationery & Invitations
 * - Transportation
 * 
 * Execution: node backend-deploy/migrations/migrate-remaining-categories.cjs
 */

const { Pool } = require('@neondatabase/serverless');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Realistic pricing data for remaining categories
const remainingCategoriesData = {
  // Planning & Coordination
  planning: {
    metadata: {
      category_id: null, // Will be fetched
      default_currency: 'PHP',
      pricing_model: 'package',
      base_unit: 'event',
      notes: 'Full-service wedding planning and coordination packages'
    },
    templates: [
      {
        name: 'Essential Planning',
        package_tier: 'basic',
        base_price: 45000.00,
        description: 'Partial planning assistance for organized couples',
        inclusions: [
          { item: 'Planning consultation sessions', quantity: 3, unit: 'sessions', unit_price: 5000.00 },
          { item: 'Vendor recommendations list', quantity: 1, unit: 'list', unit_price: 5000.00 },
          { item: 'Budget tracking spreadsheet', quantity: 1, unit: 'tool', unit_price: 3000.00 },
          { item: 'Timeline and checklist', quantity: 1, unit: 'document', unit_price: 3000.00 },
          { item: 'Wedding day coordination', quantity: 1, unit: 'day', unit_price: 15000.00 },
          { item: 'Email and phone support', quantity: 1, unit: 'service', unit_price: 5000.00 },
          { item: 'Final venue walkthrough', quantity: 1, unit: 'visit', unit_price: 4000.00 },
          { item: 'Rehearsal coordination', quantity: 1, unit: 'session', unit_price: 5000.00 }
        ]
      },
      {
        name: 'Premium Planning',
        package_tier: 'premium',
        base_price: 85000.00,
        description: 'Comprehensive wedding planning with dedicated coordinator',
        inclusions: [
          { item: 'Unlimited planning consultations', quantity: 1, unit: 'service', unit_price: 15000.00 },
          { item: 'Vendor sourcing and negotiations', quantity: 1, unit: 'service', unit_price: 12000.00 },
          { item: 'Complete budget management', quantity: 1, unit: 'service', unit_price: 8000.00 },
          { item: 'Design and styling consultation', quantity: 3, unit: 'sessions', unit_price: 9000.00 },
          { item: 'Wedding day coordination (12 hours)', quantity: 1, unit: 'day', unit_price: 25000.00 },
          { item: 'Assistant coordinator on wedding day', quantity: 1, unit: 'person', unit_price: 8000.00 },
          { item: 'Rehearsal dinner coordination', quantity: 1, unit: 'event', unit_price: 6000.00 },
          { item: 'Emergency kit and vendor management', quantity: 1, unit: 'service', unit_price: 2000.00 }
        ]
      },
      {
        name: 'Luxury Full-Service Planning',
        package_tier: 'luxury',
        base_price: 150000.00,
        description: 'White-glove wedding planning from engagement to honeymoon',
        inclusions: [
          { item: 'Full-service planning (12+ months)', quantity: 1, unit: 'service', unit_price: 50000.00 },
          { item: 'Exclusive vendor partnerships', quantity: 1, unit: 'service', unit_price: 20000.00 },
          { item: 'Custom design and decor planning', quantity: 1, unit: 'service', unit_price: 15000.00 },
          { item: 'Unlimited venue site visits', quantity: 1, unit: 'service', unit_price: 10000.00 },
          { item: 'Wedding day team (3 coordinators)', quantity: 1, unit: 'team', unit_price: 35000.00 },
          { item: 'Multi-day event coordination', quantity: 1, unit: 'service', unit_price: 10000.00 },
          { item: 'Guest accommodation coordination', quantity: 1, unit: 'service', unit_price: 5000.00 },
          { item: 'Post-wedding thank you coordination', quantity: 1, unit: 'service', unit_price: 5000.00 }
        ]
      }
    ]
  },

  // Florist & Decorations
  florist: {
    metadata: {
      category_id: null,
      default_currency: 'PHP',
      pricing_model: 'package',
      base_unit: 'event',
      notes: 'Fresh flower arrangements and ceremony/reception decorations'
    },
    templates: [
      {
        name: 'Garden Romance Package',
        package_tier: 'basic',
        base_price: 35000.00,
        description: 'Essential floral arrangements for intimate weddings',
        inclusions: [
          { item: 'Bridal bouquet (premium blooms)', quantity: 1, unit: 'bouquet', unit_price: 8000.00 },
          { item: 'Bridesmaid bouquets', quantity: 3, unit: 'bouquets', unit_price: 9000.00 },
          { item: 'Groom and groomsmen boutonnieres', quantity: 4, unit: 'pieces', unit_price: 2000.00 },
          { item: 'Ceremony altar arrangement', quantity: 1, unit: 'arrangement', unit_price: 10000.00 },
          { item: 'Reception centerpieces', quantity: 8, unit: 'pieces', unit_price: 4000.00 },
          { item: 'Cake table flowers', quantity: 1, unit: 'arrangement', unit_price: 2000.00 }
        ]
      },
      {
        name: 'Elegant Blooms Package',
        package_tier: 'premium',
        base_price: 65000.00,
        description: 'Sophisticated floral designs with premium varieties',
        inclusions: [
          { item: 'Cascading bridal bouquet', quantity: 1, unit: 'bouquet', unit_price: 12000.00 },
          { item: 'Bridesmaid bouquets (premium)', quantity: 5, unit: 'bouquets', unit_price: 15000.00 },
          { item: 'Boutonnieres and corsages', quantity: 10, unit: 'pieces', unit_price: 5000.00 },
          { item: 'Ceremony arch with florals', quantity: 1, unit: 'installation', unit_price: 18000.00 },
          { item: 'Reception centerpieces (tall & low)', quantity: 15, unit: 'pieces', unit_price: 10000.00 },
          { item: 'Head table floral garland', quantity: 1, unit: 'garland', unit_price: 3000.00 },
          { item: 'Entrance floral arrangements', quantity: 2, unit: 'pieces', unit_price: 2000.00 }
        ]
      },
      {
        name: 'Luxury Garden Paradise',
        package_tier: 'luxury',
        base_price: 120000.00,
        description: 'Breathtaking floral installations with exotic blooms',
        inclusions: [
          { item: 'Designer bridal bouquet (exotic flowers)', quantity: 1, unit: 'bouquet', unit_price: 20000.00 },
          { item: 'Premium bridesmaid bouquets', quantity: 8, unit: 'bouquets', unit_price: 24000.00 },
          { item: 'Complete wedding party florals', quantity: 1, unit: 'set', unit_price: 8000.00 },
          { item: 'Statement ceremony installation', quantity: 1, unit: 'installation', unit_price: 35000.00 },
          { item: 'Luxury reception centerpieces', quantity: 20, unit: 'pieces', unit_price: 20000.00 },
          { item: 'Ceiling floral installations', quantity: 3, unit: 'installations', unit_price: 9000.00 },
          { item: 'Floral aisle runners', quantity: 1, unit: 'runner', unit_price: 4000.00 }
        ]
      }
    ]
  },

  // Beauty & Styling
  beauty: {
    metadata: {
      category_id: null,
      default_currency: 'PHP',
      pricing_model: 'package',
      base_unit: 'event',
      notes: 'Professional hair and makeup services for bridal party'
    },
    templates: [
      {
        name: 'Bridal Essentials',
        package_tier: 'basic',
        base_price: 18000.00,
        description: 'Classic bridal hair and makeup',
        inclusions: [
          { item: 'Bridal makeup (HD)', quantity: 1, unit: 'person', unit_price: 8000.00 },
          { item: 'Bridal hairstyling', quantity: 1, unit: 'person', unit_price: 6000.00 },
          { item: 'Makeup trial session', quantity: 1, unit: 'session', unit_price: 3000.00 },
          { item: 'Touch-up kit', quantity: 1, unit: 'kit', unit_price: 1000.00 }
        ]
      },
      {
        name: 'Bridal Party Glam',
        package_tier: 'premium',
        base_price: 45000.00,
        description: 'Complete bridal party beauty services',
        inclusions: [
          { item: 'Bridal makeup (airbrush)', quantity: 1, unit: 'person', unit_price: 12000.00 },
          { item: 'Bridal hairstyling (updo)', quantity: 1, unit: 'person', unit_price: 8000.00 },
          { item: 'Bridesmaid makeup', quantity: 4, unit: 'persons', unit_price: 16000.00 },
          { item: 'Bridesmaid hairstyling', quantity: 4, unit: 'persons', unit_price: 8000.00 },
          { item: 'Mother of bride/groom makeup', quantity: 2, unit: 'persons', unit_price: 6000.00 },
          { item: 'Makeup and hair trials', quantity: 2, unit: 'sessions', unit_price: 5000.00 }
        ]
      },
      {
        name: 'Luxury Bridal Experience',
        package_tier: 'luxury',
        base_price: 85000.00,
        description: 'Premium beauty team with celebrity makeup artists',
        inclusions: [
          { item: 'Celebrity makeup artist (bride)', quantity: 1, unit: 'person', unit_price: 25000.00 },
          { item: 'Master hairstylist (bride)', quantity: 1, unit: 'person', unit_price: 15000.00 },
          { item: 'Bridal party full team', quantity: 8, unit: 'persons', unit_price: 32000.00 },
          { item: 'Pre-wedding skincare session', quantity: 1, unit: 'session', unit_price: 5000.00 },
          { item: 'Multiple trial sessions', quantity: 3, unit: 'sessions', unit_price: 6000.00 },
          { item: 'On-site touch-up service', quantity: 1, unit: 'service', unit_price: 2000.00 }
        ]
      }
    ]
  },

  // Officiant Services
  officiant: {
    metadata: {
      category_id: null,
      default_currency: 'PHP',
      pricing_model: 'package',
      base_unit: 'ceremony',
      notes: 'Professional wedding officiant and ceremony services'
    },
    templates: [
      {
        name: 'Traditional Ceremony',
        package_tier: 'basic',
        base_price: 15000.00,
        description: 'Standard wedding ceremony officiation',
        inclusions: [
          { item: 'Ceremony officiation', quantity: 1, unit: 'ceremony', unit_price: 10000.00 },
          { item: 'Pre-wedding consultation', quantity: 1, unit: 'session', unit_price: 3000.00 },
          { item: 'Ceremony script preparation', quantity: 1, unit: 'script', unit_price: 2000.00 }
        ]
      },
      {
        name: 'Custom Ceremony',
        package_tier: 'premium',
        base_price: 25000.00,
        description: 'Personalized ceremony with custom vows and readings',
        inclusions: [
          { item: 'Custom ceremony officiation', quantity: 1, unit: 'ceremony', unit_price: 15000.00 },
          { item: 'Multiple consultation sessions', quantity: 3, unit: 'sessions', unit_price: 6000.00 },
          { item: 'Personalized vow writing assistance', quantity: 1, unit: 'service', unit_price: 3000.00 },
          { item: 'Rehearsal attendance', quantity: 1, unit: 'session', unit_price: 1000.00 }
        ]
      },
      {
        name: 'Luxury Spiritual Experience',
        package_tier: 'luxury',
        base_price: 45000.00,
        description: 'Bespoke ceremony with renowned officiant',
        inclusions: [
          { item: 'Celebrity/renowned officiant', quantity: 1, unit: 'ceremony', unit_price: 30000.00 },
          { item: 'Unlimited consultation sessions', quantity: 1, unit: 'service', unit_price: 8000.00 },
          { item: 'Custom ceremony scripting', quantity: 1, unit: 'service', unit_price: 5000.00 },
          { item: 'Bilingual ceremony option', quantity: 1, unit: 'service', unit_price: 2000.00 }
        ]
      }
    ]
  },

  // Rentals & Equipment
  rentals: {
    metadata: {
      category_id: null,
      default_currency: 'PHP',
      pricing_model: 'package',
      base_unit: 'event',
      notes: 'Event furniture, linens, and equipment rentals'
    },
    templates: [
      {
        name: 'Essential Rentals Package',
        package_tier: 'basic',
        base_price: 35000.00,
        description: 'Basic tables, chairs, and linens',
        inclusions: [
          { item: 'Round tables (seats 10)', quantity: 10, unit: 'tables', unit_price: 10000.00 },
          { item: 'Chiavari chairs', quantity: 100, unit: 'chairs', unit_price: 10000.00 },
          { item: 'White table linens', quantity: 10, unit: 'linens', unit_price: 5000.00 },
          { item: 'Chair covers', quantity: 100, unit: 'covers', unit_price: 10000.00 }
        ]
      },
      {
        name: 'Premium Event Setup',
        package_tier: 'premium',
        base_price: 65000.00,
        description: 'Elegant furniture and decor rentals',
        inclusions: [
          { item: 'Farm tables (8-seater)', quantity: 12, unit: 'tables', unit_price: 18000.00 },
          { item: 'Premium chairs (mixed styles)', quantity: 120, unit: 'chairs', unit_price: 18000.00 },
          { item: 'Designer linens (colored)', quantity: 12, unit: 'linens', unit_price: 9000.00 },
          { item: 'Vintage furniture pieces', quantity: 5, unit: 'pieces', unit_price: 10000.00 },
          { item: 'Decorative lighting strings', quantity: 200, unit: 'meters', unit_price: 10000.00 }
        ]
      },
      {
        name: 'Luxury Event Design',
        package_tier: 'luxury',
        base_price: 120000.00,
        description: 'Designer furniture and custom installations',
        inclusions: [
          { item: 'Designer lounge furniture', quantity: 1, unit: 'set', unit_price: 40000.00 },
          { item: 'Custom-built structures', quantity: 2, unit: 'installations', unit_price: 30000.00 },
          { item: 'Premium linens (silk/velvet)', quantity: 15, unit: 'linens', unit_price: 15000.00 },
          { item: 'Statement furniture pieces', quantity: 10, unit: 'pieces', unit_price: 20000.00 },
          { item: 'Specialty lighting installation', quantity: 1, unit: 'installation', unit_price: 15000.00 }
        ]
      }
    ]
  },

  // Wedding Cake
  cake: {
    metadata: {
      category_id: null,
      default_currency: 'PHP',
      pricing_model: 'package',
      base_unit: 'cake',
      notes: 'Custom wedding cakes and dessert displays'
    },
    templates: [
      {
        name: 'Classic Tier Cake',
        package_tier: 'basic',
        base_price: 18000.00,
        description: 'Beautiful 3-tier wedding cake (serves 100)',
        inclusions: [
          { item: '3-tier cake design', quantity: 1, unit: 'cake', unit_price: 15000.00 },
          { item: 'Buttercream frosting', quantity: 1, unit: 'service', unit_price: 2000.00 },
          { item: 'Simple floral decoration', quantity: 1, unit: 'service', unit_price: 1000.00 }
        ]
      },
      {
        name: 'Designer Cake & Desserts',
        package_tier: 'premium',
        base_price: 35000.00,
        description: '4-tier custom cake with dessert table',
        inclusions: [
          { item: '4-tier custom design cake', quantity: 1, unit: 'cake', unit_price: 25000.00 },
          { item: 'Fondant and sugar flowers', quantity: 1, unit: 'service', unit_price: 5000.00 },
          { item: 'Dessert table setup (50 servings)', quantity: 1, unit: 'service', unit_price: 5000.00 }
        ]
      },
      {
        name: 'Luxury Sculpted Masterpiece',
        package_tier: 'luxury',
        base_price: 65000.00,
        description: 'Show-stopping 5-tier sculpted cake with dessert bar',
        inclusions: [
          { item: '5-tier sculpted cake', quantity: 1, unit: 'cake', unit_price: 45000.00 },
          { item: 'Hand-painted edible art', quantity: 1, unit: 'service', unit_price: 10000.00 },
          { item: 'Premium dessert bar (100 servings)', quantity: 1, unit: 'service', unit_price: 10000.00 }
        ]
      }
    ]
  },

  // Fashion & Attire
  fashion: {
    metadata: {
      category_id: null,
      default_currency: 'PHP',
      pricing_model: 'package',
      base_unit: 'outfit',
      notes: 'Wedding gown, suit, and attire rental/purchase'
    },
    templates: [
      {
        name: 'Ready-to-Wear Package',
        package_tier: 'basic',
        base_price: 45000.00,
        description: 'Off-the-rack wedding attire with alterations',
        inclusions: [
          { item: 'Wedding gown (rental)', quantity: 1, unit: 'gown', unit_price: 25000.00 },
          { item: 'Groom suit (rental)', quantity: 1, unit: 'suit', unit_price: 15000.00 },
          { item: 'Alterations', quantity: 1, unit: 'service', unit_price: 5000.00 }
        ]
      },
      {
        name: 'Custom Attire Package',
        package_tier: 'premium',
        base_price: 95000.00,
        description: 'Semi-custom wedding attire with personalization',
        inclusions: [
          { item: 'Custom wedding gown', quantity: 1, unit: 'gown', unit_price: 60000.00 },
          { item: 'Tailored groom suit', quantity: 1, unit: 'suit', unit_price: 25000.00 },
          { item: 'Veil and accessories', quantity: 1, unit: 'set', unit_price: 10000.00 }
        ]
      },
      {
        name: 'Designer Couture Collection',
        package_tier: 'luxury',
        base_price: 250000.00,
        description: 'High-fashion designer gown and bespoke suit',
        inclusions: [
          { item: 'Designer couture gown', quantity: 1, unit: 'gown', unit_price: 180000.00 },
          { item: 'Bespoke tailored suit', quantity: 1, unit: 'suit', unit_price: 50000.00 },
          { item: 'Complete accessory collection', quantity: 1, unit: 'set', unit_price: 20000.00 }
        ]
      }
    ]
  },

  // Security Services
  security: {
    metadata: {
      category_id: null,
      default_currency: 'PHP',
      pricing_model: 'hourly',
      base_unit: 'hour',
      notes: 'Professional event security and coordination'
    },
    templates: [
      {
        name: 'Basic Security Coverage',
        package_tier: 'basic',
        base_price: 12000.00,
        description: 'Essential security for small events (2 guards, 8 hours)',
        inclusions: [
          { item: 'Security personnel', quantity: 2, unit: 'guards', unit_price: 10000.00 },
          { item: 'Basic crowd management', quantity: 1, unit: 'service', unit_price: 2000.00 }
        ]
      },
      {
        name: 'Professional Security Team',
        package_tier: 'premium',
        base_price: 25000.00,
        description: 'Comprehensive security coverage (4 guards, 10 hours)',
        inclusions: [
          { item: 'Professional security team', quantity: 4, unit: 'guards', unit_price: 18000.00 },
          { item: 'Crowd and traffic management', quantity: 1, unit: 'service', unit_price: 5000.00 },
          { item: 'Guest list verification', quantity: 1, unit: 'service', unit_price: 2000.00 }
        ]
      },
      {
        name: 'VIP Security Detail',
        package_tier: 'luxury',
        base_price: 55000.00,
        description: 'Elite security with bodyguards (8 personnel, 12 hours)',
        inclusions: [
          { item: 'Elite security detail', quantity: 6, unit: 'guards', unit_price: 35000.00 },
          { item: 'Personal bodyguards', quantity: 2, unit: 'bodyguards', unit_price: 15000.00 },
          { item: 'Advanced coordination', quantity: 1, unit: 'service', unit_price: 5000.00 }
        ]
      }
    ]
  },

  // AV Equipment
  av_equipment: {
    metadata: {
      category_id: null,
      default_currency: 'PHP',
      pricing_model: 'package',
      base_unit: 'event',
      notes: 'Audio-visual equipment and technical support'
    },
    templates: [
      {
        name: 'Basic AV Setup',
        package_tier: 'basic',
        base_price: 22000.00,
        description: 'Essential sound and projection for small venues',
        inclusions: [
          { item: 'PA system with speakers', quantity: 1, unit: 'system', unit_price: 12000.00 },
          { item: 'Wireless microphones', quantity: 2, unit: 'mics', unit_price: 4000.00 },
          { item: 'Basic projector and screen', quantity: 1, unit: 'set', unit_price: 5000.00 },
          { item: 'Technical support', quantity: 1, unit: 'person', unit_price: 1000.00 }
        ]
      },
      {
        name: 'Professional AV Package',
        package_tier: 'premium',
        base_price: 45000.00,
        description: 'Complete audio-visual production for large events',
        inclusions: [
          { item: 'Professional sound system', quantity: 1, unit: 'system', unit_price: 20000.00 },
          { item: 'Multiple wireless mics', quantity: 6, unit: 'mics', unit_price: 8000.00 },
          { item: 'HD projector and large screen', quantity: 1, unit: 'set', unit_price: 10000.00 },
          { item: 'LED uplighting', quantity: 10, unit: 'lights', unit_price: 5000.00 },
          { item: 'Technical team', quantity: 2, unit: 'persons', unit_price: 2000.00 }
        ]
      },
      {
        name: 'Luxury Production Suite',
        package_tier: 'luxury',
        base_price: 95000.00,
        description: 'Concert-grade AV with LED walls and specialty effects',
        inclusions: [
          { item: 'Concert-grade sound system', quantity: 1, unit: 'system', unit_price: 40000.00 },
          { item: 'LED video wall', quantity: 1, unit: 'installation', unit_price: 30000.00 },
          { item: 'Intelligent lighting system', quantity: 1, unit: 'system', unit_price: 15000.00 },
          { item: 'Multi-camera video switching', quantity: 1, unit: 'service', unit_price: 5000.00 },
          { item: 'Full production team', quantity: 1, unit: 'team', unit_price: 5000.00 }
        ]
      }
    ]
  },

  // Stationery & Invitations
  stationery: {
    metadata: {
      category_id: null,
      default_currency: 'PHP',
      pricing_model: 'package',
      base_unit: 'set',
      notes: 'Wedding invitations, programs, and stationery suite'
    },
    templates: [
      {
        name: 'Digital & Print Basics',
        package_tier: 'basic',
        base_price: 15000.00,
        description: 'Standard invitations and essential stationery',
        inclusions: [
          { item: 'Save-the-date cards', quantity: 100, unit: 'cards', unit_price: 5000.00 },
          { item: 'Main invitations', quantity: 100, unit: 'invites', unit_price: 8000.00 },
          { item: 'RSVP cards', quantity: 100, unit: 'cards', unit_price: 2000.00 }
        ]
      },
      {
        name: 'Designer Stationery Suite',
        package_tier: 'premium',
        base_price: 35000.00,
        description: 'Custom-designed invitations with premium materials',
        inclusions: [
          { item: 'Custom save-the-dates', quantity: 150, unit: 'cards', unit_price: 10000.00 },
          { item: 'Designer invitations (premium paper)', quantity: 150, unit: 'invites', unit_price: 18000.00 },
          { item: 'RSVP and detail cards', quantity: 150, unit: 'cards', unit_price: 4000.00 },
          { item: 'Wedding programs', quantity: 150, unit: 'programs', unit_price: 3000.00 }
        ]
      },
      {
        name: 'Luxury Couture Collection',
        package_tier: 'luxury',
        base_price: 75000.00,
        description: 'Bespoke letterpress and handcrafted stationery',
        inclusions: [
          { item: 'Letterpress save-the-dates', quantity: 200, unit: 'cards', unit_price: 20000.00 },
          { item: 'Handcrafted invitations (silk/wax seal)', quantity: 200, unit: 'invites', unit_price: 40000.00 },
          { item: 'Complete stationery suite', quantity: 200, unit: 'sets', unit_price: 10000.00 },
          { item: 'Custom calligraphy addressing', quantity: 200, unit: 'envelopes', unit_price: 5000.00 }
        ]
      }
    ]
  },

  // Transportation
  transport: {
    metadata: {
      category_id: null,
      default_currency: 'PHP',
      pricing_model: 'package',
      base_unit: 'event',
      notes: 'Wedding day transportation for couple and guests'
    },
    templates: [
      {
        name: 'Essential Transport',
        package_tier: 'basic',
        base_price: 18000.00,
        description: 'Classic car for bride and groom (8 hours)',
        inclusions: [
          { item: 'Luxury sedan rental', quantity: 1, unit: 'car', unit_price: 15000.00 },
          { item: 'Professional driver', quantity: 1, unit: 'driver', unit_price: 2000.00 },
          { item: 'Decorations and ribbons', quantity: 1, unit: 'set', unit_price: 1000.00 }
        ]
      },
      {
        name: 'Premium Fleet Package',
        package_tier: 'premium',
        base_price: 45000.00,
        description: 'Multiple vehicles for wedding party',
        inclusions: [
          { item: 'Vintage/luxury car for couple', quantity: 1, unit: 'car', unit_price: 25000.00 },
          { item: 'SUVs for wedding party', quantity: 2, unit: 'vehicles', unit_price: 14000.00 },
          { item: 'Professional drivers', quantity: 3, unit: 'drivers', unit_price: 5000.00 },
          { item: 'Decorations', quantity: 1, unit: 'service', unit_price: 1000.00 }
        ]
      },
      {
        name: 'Luxury Transportation Experience',
        package_tier: 'luxury',
        base_price: 95000.00,
        description: 'Exotic cars and guest shuttle service',
        inclusions: [
          { item: 'Exotic sports car/classic car', quantity: 1, unit: 'car', unit_price: 50000.00 },
          { item: 'Luxury SUVs for entourage', quantity: 3, unit: 'vehicles', unit_price: 24000.00 },
          { item: 'Guest shuttle service', quantity: 2, unit: 'vans', unit_price: 15000.00 },
          { item: 'Uniformed chauffeurs', quantity: 6, unit: 'drivers', unit_price: 6000.00 }
        ]
      }
    ]
  }
};

// Category mapping (to be updated with actual category IDs from database)
const categoryMapping = {
  planning: 'Planning',
  florist: 'Florist',
  beauty: 'Beauty',
  officiant: 'Officiant',
  rentals: 'Rentals',
  cake: 'Cake',
  fashion: 'Fashion',
  security: 'Security',
  av_equipment: 'AV Equipment',
  stationery: 'Stationery',
  transport: 'Transportation'
};

async function migrateRemainingCategories() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting migration of remaining wedding service categories...\n');
    
    await client.query('BEGIN');
    
    // Step 1: Fetch category IDs
    console.log('📋 Step 1: Fetching category IDs from database...');
    const categoryIds = {};
    
    for (const [key, categoryName] of Object.entries(categoryMapping)) {
      const result = await client.query(
        'SELECT id FROM service_categories WHERE name = $1',
        [categoryName]
      );
      
      if (result.rows.length > 0) {
        categoryIds[key] = result.rows[0].id;
        console.log(`   ✓ Found ${categoryName}: ${result.rows[0].id}`);
      } else {
        console.log(`   ⚠ Category not found: ${categoryName} - SKIPPING`);
      }
    }
    
    console.log('');
    
    // Step 2: Insert metadata and templates for each category
    let totalTemplates = 0;
    let totalInclusions = 0;
    
    for (const [categoryKey, categoryData] of Object.entries(remainingCategoriesData)) {
      const categoryId = categoryIds[categoryKey];
      
      if (!categoryId) {
        console.log(`⏭ Skipping ${categoryKey} (category not found in database)\n`);
        continue;
      }
      
      console.log(`📦 Processing ${categoryMapping[categoryKey]}...`);
      
      // Insert category pricing metadata
      const metadataResult = await client.query(`
        INSERT INTO category_pricing_metadata 
        (category_id, default_currency, pricing_model, base_unit, notes)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (category_id) DO UPDATE
        SET default_currency = EXCLUDED.default_currency,
            pricing_model = EXCLUDED.pricing_model,
            base_unit = EXCLUDED.base_unit,
            notes = EXCLUDED.notes,
            updated_at = NOW()
        RETURNING id
      `, [
        categoryId,
        categoryData.metadata.default_currency,
        categoryData.metadata.pricing_model,
        categoryData.metadata.base_unit,
        categoryData.metadata.notes
      ]);
      
      console.log(`   ✓ Category metadata created/updated`);
      
      // Insert pricing templates and inclusions
      for (const template of categoryData.templates) {
        const templateResult = await client.query(`
          INSERT INTO pricing_templates
          (category_id, name, package_tier, base_price, description, is_active)
          VALUES ($1, $2, $3, $4, $5, TRUE)
          RETURNING id
        `, [
          categoryId,
          template.name,
          template.package_tier,
          template.base_price,
          template.description
        ]);
        
        const templateId = templateResult.rows[0].id;
        totalTemplates++;
        
        console.log(`   ✓ Template: ${template.name} (${template.package_tier})`);
        
        // Insert package inclusions
        let displayOrder = 1;
        for (const inclusion of template.inclusions) {
          await client.query(`
            INSERT INTO package_inclusions
            (template_id, item_name, quantity, unit, unit_price, display_order)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            templateId,
            inclusion.item,
            inclusion.quantity,
            inclusion.unit,
            inclusion.unit_price,
            displayOrder++
          ]);
          
          totalInclusions++;
        }
        
        console.log(`      → ${template.inclusions.length} inclusions added`);
      }
      
      console.log('');
    }
    
    await client.query('COMMIT');
    
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Categories processed: ${Object.keys(categoryIds).length}`);
    console.log(`   • Pricing templates created: ${totalTemplates}`);
    console.log(`   • Package inclusions added: ${totalInclusions}\n`);
    
    // Verification query
    console.log('🔍 Verification:');
    const verifyResult = await client.query(`
      SELECT 
        sc.name as category_name,
        COUNT(DISTINCT pt.id) as template_count,
        COUNT(pi.id) as inclusion_count
      FROM service_categories sc
      LEFT JOIN pricing_templates pt ON pt.category_id = sc.id
      LEFT JOIN package_inclusions pi ON pi.template_id = pt.id
      WHERE sc.name IN (${Object.values(categoryMapping).map((_, i) => `$${i + 1}`).join(',')})
      GROUP BY sc.name
      ORDER BY sc.name
    `, Object.values(categoryMapping));
    
    console.log('\n   Category-wise breakdown:');
    verifyResult.rows.forEach(row => {
      console.log(`   • ${row.category_name}: ${row.template_count} templates, ${row.inclusion_count} inclusions`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute migration
if (require.main === module) {
  migrateRemainingCategories()
    .then(() => {
      console.log('\n✨ All remaining categories migrated successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateRemainingCategories, remainingCategoriesData };
