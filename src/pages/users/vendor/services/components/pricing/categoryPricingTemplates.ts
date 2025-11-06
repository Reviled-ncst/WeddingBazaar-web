// 📊 Category-Specific Pricing Templates for Wedding Bazaar
// This file contains pre-built pricing packages for all 15 service categories

export interface PricingTemplate {
  item_name: string;
  description: string;
  price: number;
  inclusions: string[];
  exclusions: string[];
  display_order: number;
  is_active: boolean;
}

export const CATEGORY_PRICING_TEMPLATES: Record<string, PricingTemplate[]> = {
  // ========================================
  // 1. PHOTOGRAPHY - Photographer & Videographer
  // ========================================
  Photography: [
    {
      item_name: 'Basic Coverage',
      description: 'Essential photography for intimate weddings',
      price: 35000,
      inclusions: [
        '4 hours coverage',
        '200 edited photos',
        'Online gallery access',
        'USB drive with all photos',
        '1 photographer'
      ],
      exclusions: [
        'Second photographer',
        'Videography',
        'Drone shots',
        'Same-day edit video',
        'Physical album'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Full Day Coverage',
      description: 'Complete wedding documentation from prep to reception',
      price: 65000,
      inclusions: [
        '8 hours coverage',
        '400 edited photos',
        '2 photographers',
        'Online gallery with download',
        'USB drive in premium case',
        '20-page premium album (30x30cm)',
        'Engagement shoot included'
      ],
      exclusions: [
        'Drone photography',
        'Same-day edit video',
        'Additional albums',
        'Raw files'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Platinum Package',
      description: 'Premium all-inclusive photo & video documentation',
      price: 120000,
      inclusions: [
        '10 hours coverage',
        '600 edited photos',
        '2 photographers + 2 videographers',
        'Drone photography & videography',
        '5-7 minute cinematic highlight video',
        'Same-day edit video (3-5 mins)',
        'Full ceremony & reception videos',
        '40-page luxury album (40x40cm)',
        'Engagement & prenup shoots',
        'Online gallery with unlimited downloads',
        'USB + cloud backup'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 2. PLANNING - Wedding Planner
  // ========================================
  Planning: [
    {
      item_name: 'Day-of Coordination',
      description: 'Stress-free wedding day management',
      price: 45000,
      inclusions: [
        'Wedding day coordination (10 hours)',
        'Vendor coordination on the day',
        'Timeline creation and management',
        'Setup supervision',
        'Emergency kit and problem-solving',
        '1 assistant coordinator',
        '2 pre-wedding consultations'
      ],
      exclusions: [
        'Full planning services',
        'Vendor sourcing',
        'Budget management',
        'Guest list management',
        'Rehearsal attendance'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Partial Planning',
      description: 'Planning assistance for the last 3 months',
      price: 85000,
      inclusions: [
        '3 months pre-wedding planning',
        'Vendor recommendations and coordination',
        'Budget tracking and management',
        'Timeline and checklist creation',
        'Contract review assistance',
        'Design concept development',
        'Unlimited email/call support',
        'Day-of coordination included',
        '2 assistant coordinators on wedding day'
      ],
      exclusions: [
        'Full venue search',
        'Complete design and styling',
        'Guest accommodation booking'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Full Planning Service',
      description: 'Complete wedding planning from start to finish',
      price: 150000,
      inclusions: [
        'Unlimited planning period (6-12 months)',
        'Complete vendor sourcing and negotiations',
        'Full budget creation and management',
        'Design concept and styling',
        'Guest list management',
        'RSVP tracking',
        'Seating chart creation',
        'Complete timeline management',
        'Unlimited meetings and consultations',
        'Rehearsal coordination',
        'Day-of coordination with 3 assistants',
        'Post-wedding vendor payments and gratuities',
        '24/7 emergency contact'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 3. FLORIST
  // ========================================
  Florist: [
    {
      item_name: 'Essential Blooms',
      description: 'Beautiful floral basics for intimate weddings',
      price: 25000,
      inclusions: [
        'Bridal bouquet (seasonal flowers)',
        'Groom boutonniere',
        '4 bridesmaid bouquets',
        '4 groomsmen boutonnieres',
        '2 corsages for mothers',
        'Ceremony arch decoration',
        'Aisle petals and markers'
      ],
      exclusions: [
        'Reception centerpieces',
        'Flower crown',
        'Backdrop florals',
        'Premium/imported flowers',
        'Cake flowers'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Garden Romance',
      description: 'Complete ceremony and reception florals',
      price: 55000,
      inclusions: [
        'Premium bridal bouquet with premium flowers',
        'Groom boutonniere with special accents',
        '6 bridesmaid bouquets',
        '6 groomsmen boutonnieres',
        'Corsages and wrist flowers for family',
        'Ceremony arch with premium florals',
        'Aisle decorations with fresh petals',
        '10 reception table centerpieces',
        'Head table floral runner',
        'Cake table flowers',
        'Guest book table arrangement'
      ],
      exclusions: [
        'Flower wall/backdrop',
        'Hanging installations',
        'Imported exotic flowers'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Luxury Garden',
      description: 'Extravagant floral design and styling',
      price: 120000,
      inclusions: [
        'Cascading luxury bridal bouquet',
        'Premium boutonnieres and corsages',
        '10 bridesmaid bouquets',
        'Full ceremony backdrop with hanging florals',
        'Ceremony aisle with floral carpeting',
        '20 luxury reception centerpieces',
        'Head table floral installation',
        'Flower wall photo backdrop (2x3 meters)',
        'Hanging floral chandeliers (4 units)',
        'Cake florals and dessert table styling',
        'Entrance statement piece',
        'Lounge area florals',
        'Bridal suite flowers',
        'Flower crown for bride',
        'Imported and exotic flowers included',
        'Full setup, teardown, and disposal'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 4. BEAUTY - Hair & Makeup Artists
  // ========================================
  Beauty: [
    {
      item_name: 'Bridal Glam',
      description: 'Professional bridal hair and makeup',
      price: 15000,
      inclusions: [
        'Bridal makeup (airbrush or traditional)',
        'Bridal hairstyling with accessories',
        '1 trial session (2 hours)',
        'False lashes',
        'Touch-up kit for the day',
        'On-site service on wedding day'
      ],
      exclusions: [
        'Entourage makeup/hair',
        'Family members',
        'Travel outside Metro Manila',
        'Hair extensions rental'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Bridal Party Package',
      description: 'Bride + bridesmaids/family full glam',
      price: 35000,
      inclusions: [
        'Bridal makeup and hair (premium)',
        '5 bridesmaids/family makeup and hair',
        '2 mothers makeup and hair',
        '2 trial sessions for bride',
        'Premium products and tools',
        'False lashes for everyone',
        'Touch-up service (2 hours)',
        'Individual touch-up kits',
        'On-site service with 2 artists'
      ],
      exclusions: [
        'Groom grooming',
        'Flower girl makeup',
        'Additional touch-up hours'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Full Glam Experience',
      description: 'Complete beauty services for the entire wedding party',
      price: 65000,
      inclusions: [
        'Bridal luxury makeup and hair with hair extensions',
        '10 entourage/family full makeup and hair',
        'Groom grooming (haircut, facial, makeup)',
        'Unlimited trial sessions',
        '3 professional makeup artists',
        '2 hairstylists',
        'Premium international products',
        'Airbrush makeup for everyone',
        'Hair extensions for bride and up to 5 people',
        'All-day touch-up service',
        'Pre-wedding skincare consultation',
        'Emergency beauty kit'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 5. CATERING
  // ========================================
  Catering: [
    {
      item_name: 'Buffet Package (Per Person)',
      description: 'Traditional buffet service with Filipino favorites',
      price: 800,
      inclusions: [
        '4-course meal (2 appetizers, 2 mains, 2 sides, 1 dessert)',
        'Rice and bread',
        'Iced tea and water',
        'Standard tableware and linens',
        'Service staff (1 per 30 guests)',
        'Buffet setup with chafing dishes',
        'Basic table centerpieces',
        'Cleanup service'
      ],
      exclusions: [
        'Premium menu items',
        'Beverage packages',
        'Specialty desserts',
        'Themed decorations',
        'Cocktail hour'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Plated Service (Per Person)',
      description: 'Elegant plated dining experience',
      price: 1200,
      inclusions: [
        '5-course gourmet meal',
        'Premium menu with choice of protein',
        'Welcome drinks',
        'Iced tea, water, and coffee service',
        'Premium tableware and linens',
        'Professional service staff (1 per 20 guests)',
        'Chef on-site for final preparations',
        'Table setup with premium centerpieces',
        'Full cleanup and dishwashing'
      ],
      exclusions: [
        'Premium wine pairing',
        'Live cooking stations',
        'Custom menu design',
        'Cocktail bar'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Premium Experience (Per Person)',
      description: 'Luxury dining with all inclusions',
      price: 2000,
      inclusions: [
        '7-course chef\'s tasting menu',
        'Premium imported ingredients',
        'Cocktail hour with canapés',
        'Premium beverage package (wine, beer, cocktails)',
        'Live cooking stations (pasta, carving, sushi)',
        'Luxury tableware and custom linens',
        'Dedicated service team (1 per 15 guests)',
        'Executive chef and sous chef on-site',
        'Themed table settings and décor',
        'Dessert station with petit fours',
        'Coffee and tea bar',
        'Personalized menu cards',
        'Full event coordination'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 6. MUSIC - DJ/Band
  // ========================================
  Music: [
    {
      item_name: 'DJ Essential',
      description: 'Professional DJ for ceremony and reception',
      price: 25000,
      inclusions: [
        '6 hours DJ service',
        'Professional DJ with MC services',
        'Sound system for 150 guests',
        '2 wireless microphones',
        'Basic lighting effects',
        'Music library (all genres)',
        'Custom playlist consultation',
        'Backup equipment included'
      ],
      exclusions: [
        'Premium lighting package',
        'Additional hours',
        'Live musicians',
        'Videoke setup',
        'Stage setup'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'DJ + Band Combo',
      description: 'Live band and DJ for dynamic entertainment',
      price: 60000,
      inclusions: [
        '8 hours entertainment (4 hours band, 4 hours DJ)',
        '5-piece live band',
        'Professional DJ with MC',
        'Premium sound system for 300 guests',
        '4 wireless microphones',
        'Stage lighting package',
        'LED dance floor effects',
        'Custom setlist consultation',
        'Band setup and breakdown',
        'Backup systems for both'
      ],
      exclusions: [
        'Pyrotechnics/special effects',
        'Additional band musicians',
        'Custom staging'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Premium Entertainment',
      description: 'Full entertainment production with all the bells and whistles',
      price: 120000,
      inclusions: [
        '10 hours full entertainment',
        '8-piece live band with string quartet for ceremony',
        'Professional DJ with backup DJ',
        'Concert-grade sound system',
        'Full lighting production (intelligent lights, spots, washes)',
        'LED video wall (3x2 meters)',
        'Fog and haze machines',
        'Confetti cannons and cold sparks',
        'Videoke system for guests',
        'Custom stage setup',
        '8 wireless microphones',
        'Live streaming audio/video setup',
        'Musical director/coordinator',
        'Custom song arrangements',
        'Rehearsal with couple'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 7. OFFICIANT
  // ========================================
  Officiant: [
    {
      item_name: 'Simple Ceremony',
      description: 'Basic wedding ceremony officiation',
      price: 8000,
      inclusions: [
        'Civil or religious ceremony officiation',
        '30-minute ceremony',
        'Standard ceremony script',
        '1 pre-wedding consultation',
        'Certificate signing',
        'Basic PA system (if needed)'
      ],
      exclusions: [
        'Custom vow writing',
        'Rehearsal attendance',
        'Multiple consultations',
        'Travel outside city'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Personalized Ceremony',
      description: 'Customized ceremony with personal touches',
      price: 15000,
      inclusions: [
        'Fully personalized ceremony script',
        '45-minute ceremony',
        'Custom vow writing assistance',
        '3 pre-wedding consultations',
        'Rehearsal attendance',
        'Certificate preparation and signing',
        'Special rituals/customs integration',
        'Bilingual ceremony (if needed)',
        'Ceremony booklet/program'
      ],
      exclusions: [
        'Destination wedding travel',
        'Multiple ceremony rehearsals'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Premium Ceremony',
      description: 'Luxury ceremony experience with full support',
      price: 30000,
      inclusions: [
        'Bespoke ceremony creation',
        '60-minute ceremony with special programs',
        'Professional script writing',
        'Unlimited consultations',
        'Multiple rehearsal attendance',
        'Ceremony design consultation',
        'Special cultural/religious rituals',
        'Trilingual ceremony capability',
        'Premium ceremony booklets (50 copies)',
        'Ceremony music coordination',
        'Post-ceremony photo session',
        'Marriage certificate processing assistance',
        'Travel within Luzon included'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 8. VENUE - Venue Coordinator
  // ========================================
  Venue: [
    {
      item_name: 'Intimate Garden (50 pax)',
      description: 'Charming outdoor garden venue for small weddings',
      price: 80000,
      inclusions: [
        'Garden venue rental (8 hours)',
        'Capacity: 50 guests',
        'Round tables and Chiavari chairs',
        'Basic table linens',
        'Ceremony area with arch',
        'Bridal suite access (4 hours)',
        'Basic sound system',
        'Parking for 20 vehicles',
        'Security and staff supervision'
      ],
      exclusions: [
        'Catering services',
        'Decorations and florals',
        'Upgraded linens',
        'Additional hours',
        'Air conditioning'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Grand Ballroom (150 pax)',
      description: 'Elegant air-conditioned ballroom for grand celebrations',
      price: 180000,
      inclusions: [
        'Ballroom rental (10 hours)',
        'Capacity: 150 guests',
        'Round tables with premium chairs',
        'Premium table linens and chair covers',
        'Full air conditioning',
        'Stage with backdrop',
        'Professional sound and lighting',
        'LED screens (2 units)',
        'Bridal suite and groom\'s room',
        'Cocktail area',
        'VIP parking (30 slots)',
        'Security team',
        'Venue coordinator',
        'Setup and cleanup crew'
      ],
      exclusions: [
        'Catering',
        'Decorations',
        'Extended hours',
        'Ceremony in separate area'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Luxury Estate (300 pax)',
      description: 'Exclusive private estate for spectacular weddings',
      price: 400000,
      inclusions: [
        'Full estate rental (15 hours)',
        'Capacity: 300 guests',
        'Multiple event areas (ceremony, reception, lounge)',
        'Luxury furniture and premium linens',
        'Full climate control',
        'Grand stage with custom backdrop',
        'Premium A/V system with LED walls',
        'Bridal villa with spa amenities',
        'Groom\'s suite',
        'VIP lounge area',
        'Garden and water feature access',
        'Valet parking service',
        'Full security team',
        'Dedicated venue manager',
        'Complete setup and breakdown',
        'Overnight accommodation for bridal party'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 9. RENTALS - Event Rentals
  // ========================================
  Rentals: [
    {
      item_name: 'Basic Setup (100 pax)',
      description: 'Essential furniture and equipment rental',
      price: 45000,
      inclusions: [
        '15 round tables (60" diameter)',
        '100 white folding chairs',
        'Basic white table linens',
        'Basic chair covers',
        '1 rectangular head table',
        'Cake table',
        'Gift table',
        'Guest book table',
        'Delivery and setup',
        'Pickup and breakdown'
      ],
      exclusions: [
        'Premium furniture',
        'Decorative items',
        'Lighting equipment',
        'Tent rental',
        'Dance floor'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Premium Setup (150 pax)',
      description: 'Upgraded furniture and equipment package',
      price: 95000,
      inclusions: [
        '20 round tables with premium linens',
        '150 Chiavari chairs with cushions',
        'Premium table runners and napkins',
        'Decorative charger plates',
        'Upgraded head table with backdrop frame',
        'Portable dance floor (5x5 meters)',
        'Cocktail tables (10 units)',
        'Lounge furniture set (sofas, coffee tables)',
        'Decorative arch for ceremony',
        'String lighting (50 meters)',
        'Delivery, professional setup, and breakdown'
      ],
      exclusions: [
        'Tent rental',
        'Generator',
        'Additional decorative items',
        'Floral arrangements'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Luxury Event Package (200 pax)',
      description: 'Complete event rental with premium items',
      price: 200000,
      inclusions: [
        'White wedding tent (40x60 ft) with sidewalls',
        '25 premium round tables with luxury linens',
        '200 Chiavari chairs with velvet cushions',
        'Complete place settings (china, glassware, cutlery)',
        'Portable dance floor (8x8 meters with LED lighting)',
        'Custom stage setup (4x6 meters)',
        'Backdrop frames and draping (3 locations)',
        'VIP lounge furniture (sofas, armchairs, tables)',
        '20 cocktail tables with linens',
        'Bar setup (2 bars with back bar)',
        'String lighting installation (100 meters)',
        'Uplighting (20 LED units)',
        'Portable restroom trailers (2 units)',
        'Generator (15 KVA)',
        'Complete delivery, setup, and breakdown',
        'On-site coordinator during event'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 10. CAKE - Cake Designer
  // ========================================
  Cake: [
    {
      item_name: 'Classic Elegance',
      description: 'Beautiful 3-tier wedding cake',
      price: 15000,
      inclusions: [
        '3-tier round cake (6", 8", 10")',
        'Serves 100 guests',
        'Buttercream or fondant finish',
        '2 filling flavors',
        'Simple floral or ribbon decoration',
        'Cake topper included',
        'Delivery within Metro Manila',
        'Setup and display',
        '1 tasting session'
      ],
      exclusions: [
        'Premium sugar flowers',
        'Custom sculpted design',
        'Multiple tiers (4+)',
        'Groom\'s cake'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Designer Dream',
      description: 'Stunning 4-tier custom wedding cake',
      price: 35000,
      inclusions: [
        '4-tier round or square cake',
        'Serves 150 guests',
        'Premium fondant with custom design',
        '3 filling flavors',
        'Hand-crafted sugar flowers',
        'Intricate piping and detailing',
        'Custom cake topper',
        'Matching dessert table treats (50 pieces)',
        'Delivery and setup',
        'Cake stand rental',
        '2 tasting sessions'
      ],
      exclusions: [
        'Sculpted/novelty cakes',
        'Projection mapping',
        'Separate groom\'s cake'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Grand Masterpiece',
      description: 'Spectacular multi-tier luxury wedding cake',
      price: 75000,
      inclusions: [
        '5-tier luxury wedding cake (custom shape)',
        'Serves 200+ guests',
        'Premium fondant with gold/silver accents',
        'Unlimited flavor combinations',
        'Elaborate hand-crafted sugar flowers',
        'Custom sculpted elements',
        'LED lighting integration',
        'Premium cake topper (custom design)',
        'Matching dessert table (100 pieces)',
        'Groom\'s cake included',
        'Custom cake stand',
        'White glove delivery and setup',
        'Unlimited tasting sessions',
        'Cake preservation kit for first anniversary'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 11. FASHION - Dress Designer/Tailor
  // ========================================
  Fashion: [
    {
      item_name: 'Ready-to-Wear Gown',
      description: 'Beautiful wedding gown with basic alterations',
      price: 40000,
      inclusions: [
        'Designer wedding gown (RTW collection)',
        'Basic alterations and fitting',
        'Gown cleaning and pressing',
        'Garment bag',
        '2 fitting sessions',
        'Bustle installation'
      ],
      exclusions: [
        'Custom design',
        'Premium fabrics',
        'Extensive beadwork',
        'Veil and accessories',
        'Preservation after wedding'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Semi-Custom Gown',
      description: 'Customized gown based on designer patterns',
      price: 80000,
      inclusions: [
        'Semi-custom wedding gown design',
        'Choice of designer silhouettes',
        'Premium fabric selection',
        'Custom embellishments',
        'Complete alterations and fittings',
        '4 fitting sessions',
        'Bustle and train management',
        'Gown cleaning and pressing',
        'Garment bag and hanger',
        'Emergency repair kit'
      ],
      exclusions: [
        'Fully custom design',
        'Luxury imported fabrics',
        'Veil and accessories',
        'Gown preservation'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Haute Couture',
      description: 'Bespoke luxury wedding gown',
      price: 180000,
      inclusions: [
        'Fully custom haute couture gown',
        'Original design consultation',
        'Luxury imported fabrics',
        'Intricate hand-beading and embroidery',
        'Swarovski crystal embellishments',
        'Complete customization (unlimited changes)',
        'Unlimited fitting sessions',
        'Cathedral train with bustle',
        'Custom veil and accessories',
        'Bridal cape or jacket',
        'Gown box for storage',
        'Professional cleaning and pressing',
        'Emergency repair kit',
        'Gown preservation service',
        'Mini replica gown (for keepsake)'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 12. SECURITY - Security & Guest Management
  // ========================================
  Security: [
    {
      item_name: 'Basic Security',
      description: 'Professional security for intimate weddings',
      price: 12000,
      inclusions: [
        '4 professional security personnel',
        '8 hours service',
        'Uniform and equipment',
        'Entrance/exit monitoring',
        'Parking coordination',
        'Basic crowd management',
        'Emergency response'
      ],
      exclusions: [
        'Close protection/bodyguard',
        'VIP security detail',
        'Advanced surveillance',
        'Vehicle escort'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Standard Package',
      description: 'Comprehensive security and guest management',
      price: 28000,
      inclusions: [
        '8 professional security personnel',
        '10 hours service',
        'Complete uniform and communication equipment',
        'Main entrance and parking security',
        'Guest list verification',
        'VIP area monitoring',
        'Gift table security',
        'Crowd and traffic management',
        'Emergency medical response team',
        'Incident reporting'
      ],
      exclusions: [
        'Armed security',
        'CCTV monitoring',
        'Drone surveillance'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Premium Security',
      description: 'VIP-level security and comprehensive guest services',
      price: 65000,
      inclusions: [
        '15 professional security personnel',
        '12 hours service',
        'Security supervisor on-site',
        'Complete entrance management',
        'VIP close protection (2 bodyguards)',
        'Advanced communication system',
        'CCTV monitoring (portable system)',
        'Parking valet coordination',
        'Guest list and RSVP management',
        'VIP escort and coordination',
        'Gift registry security',
        'Perimeter and crowd control',
        'Medical emergency team with ambulance on standby',
        'Fire safety team',
        'Incident documentation and reporting',
        'Coordination with local police'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 13. AV_EQUIPMENT - Sounds & Lights
  // ========================================
  AV_Equipment: [
    {
      item_name: 'Basic Package',
      description: 'Essential sound and lighting for small venues',
      price: 18000,
      inclusions: [
        'Sound system for 100 guests',
        '2 wireless microphones',
        'Basic mixer and speakers',
        'LED par lights (8 units)',
        'Basic lighting control',
        'Cable management',
        'Technician (8 hours)',
        'Setup and breakdown'
      ],
      exclusions: [
        'LED screens',
        'Moving head lights',
        'Special effects',
        'Backup systems'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Premium Package',
      description: 'Professional sound and lighting production',
      price: 55000,
      inclusions: [
        'Concert-grade sound system (300 guests)',
        '4 wireless microphones + lapel mics',
        'DJ mixer and equipment',
        'Line array speakers',
        'Subwoofers for dance floor',
        '16 LED par lights',
        '4 moving head intelligent lights',
        'LED dance floor wash effects',
        'Lighting console and operator',
        'Fog machine',
        'Cable management and power distribution',
        'Audio/lighting technician (10 hours)',
        'Backup systems'
      ],
      exclusions: [
        'LED video walls',
        'Pyrotechnics',
        'Stage rigging',
        'Live streaming equipment'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Full Production',
      description: 'Complete audiovisual production with all effects',
      price: 150000,
      inclusions: [
        'Professional concert sound system (500+ guests)',
        'Wireless mic system (8 channels)',
        'DJ booth with premium equipment',
        'Line array PA system',
        'Stage monitors',
        'LED video wall (3x2 meters)',
        'Projector and screen for presentations',
        '30 LED par lights',
        '12 moving head lights',
        '8 LED wash lights',
        'Follow spots (2 units)',
        'Intelligent lighting system',
        'Haze and fog machines',
        'Confetti cannons',
        'Cold spark fountains',
        'DMX lighting control',
        'Audio engineer and lighting designer',
        'Complete rigging and trussing',
        'Power distribution and generators',
        'Full backup systems',
        'Live streaming audio/video setup',
        '12 hours service with crew'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 14. STATIONERY - Stationery Designer
  // ========================================
  Stationery: [
    {
      item_name: 'Essential Suite',
      description: 'Beautiful printed wedding invitations',
      price: 15000,
      inclusions: [
        '100 wedding invitations (single card)',
        'Matching envelopes',
        'Digital design proofs (2 revisions)',
        'Premium cardstock printing',
        'Basic information cards',
        'RSVP cards with envelopes',
        'Invitation assembly',
        'Storage box'
      ],
      exclusions: [
        'Wax seals',
        'Belly bands or ribbons',
        'Custom envelope liners',
        'Calligraphy addressing',
        'Additional printed items'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Premium Suite',
      description: 'Complete wedding stationery package',
      price: 35000,
      inclusions: [
        '150 premium wedding invitations (folded or pocket style)',
        'Custom envelope liners',
        'Wax seals with custom stamp',
        'Silk ribbon belly bands',
        'RSVP cards with return envelopes',
        'Information/details cards',
        'Reception cards',
        '50 ceremony programs',
        '50 menu cards',
        'Place cards (150 pieces)',
        'Table number cards (20 pieces)',
        'Thank you cards (100 pieces)',
        'Digital design (unlimited revisions)',
        'Professional assembly',
        'Gift boxes for invitations'
      ],
      exclusions: [
        'Hand calligraphy',
        'Foil stamping',
        'Letterpress printing',
        'Custom illustrations'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Luxury Collection',
      description: 'Bespoke luxury wedding stationery',
      price: 85000,
      inclusions: [
        '200 luxury invitations (multilayer with pocket)',
        'Custom illustration/monogram design',
        'Letterpress or foil stamping',
        'Hand-deckled edges',
        'Silk or velvet ribbons',
        'Premium wax seals with custom die',
        'Custom envelope liners',
        'Hand calligraphy addressing (all envelopes)',
        'Complete suite (RSVP, details, accommodation, itinerary)',
        '100 ceremony programs (booklet style)',
        '100 menu cards with gold foil',
        'Place cards with calligraphy (200 pieces)',
        'Table numbers with stands (30 pieces)',
        'Welcome sign (large format)',
        'Seating chart (custom design)',
        'Guestbook design',
        'Thank you cards (200 pieces)',
        'Gift tags and favor labels',
        'Custom postage stamps',
        'Luxury presentation boxes',
        'Unlimited design revisions',
        'White glove assembly and packaging'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 15. TRANSPORT - Transportation Services
  // ========================================
  Transport: [
    {
      item_name: 'Bridal Car',
      description: 'Elegant wedding car for the bride',
      price: 12000,
      inclusions: [
        '1 luxury sedan or vintage car',
        'Professional chauffeur',
        '6 hours service',
        'Car decoration (ribbons and flowers)',
        'Red carpet service',
        'Complimentary water and tissues',
        'Pick-up from home',
        'Church/venue transfer',
        'Reception venue transfer'
      ],
      exclusions: [
        'Multiple cars',
        'Extended hours',
        'Out-of-city travel',
        'Entourage transport'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Bridal Party Package',
      description: 'Complete transportation for wedding party',
      price: 35000,
      inclusions: [
        '1 luxury bridal car (vintage or modern)',
        '2 sedans for parents and principal sponsors',
        '1 coaster/minibus for entourage (25 pax)',
        'Professional drivers for all vehicles',
        '8 hours service',
        'Complete car decorations',
        'Red carpet service',
        'Coordination with wedding schedule',
        'Multiple pick-up locations',
        'Transport to all venues (church, photo shoot, reception)',
        'Waiting time included',
        'Complimentary refreshments'
      ],
      exclusions: [
        'Guest shuttle service',
        'Overnight accommodation transport',
        'Airport transfers'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Full Transportation',
      description: 'Complete wedding transportation including guest shuttles',
      price: 85000,
      inclusions: [
        '1 luxury vintage or exotic car for bride',
        '1 luxury sedan for groom',
        '4 luxury sedans for family and VIPs',
        '2 coaster buses for entourage (50 pax total)',
        '2 large buses for guest shuttle service (100 pax total)',
        'Professional drivers and coordinators',
        '10 hours service',
        'Premium car decorations',
        'Red carpet service',
        'VIP transport coordination',
        'Multiple pick-up and drop-off routes',
        'Transport to all locations (hotels, venues, photo spots)',
        'Guest shuttle schedule management',
        'Signage for shuttle identification',
        'Waiting time included',
        'Complimentary refreshments in all vehicles',
        'Transportation coordinator on-site'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // DEFAULT - For categories without specific templates
  // ========================================
  default: [
    {
      item_name: 'Bronze Package',
      description: 'Essential services for intimate weddings',
      price: 50000,
      inclusions: [
        '4 hours of service',
        'Basic setup and equipment',
        'Up to 50 guests',
        'Standard materials included',
        'Professional service staff'
      ],
      exclusions: [
        'Premium upgrades',
        'Extended hours',
        'Additional services',
        'Custom requests'
      ],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Silver Package',
      description: 'Enhanced services for medium-sized weddings',
      price: 100000,
      inclusions: [
        '6 hours of service',
        'Premium setup and equipment',
        'Up to 100 guests',
        'Premium materials included',
        'Professional service team',
        'Complimentary consultation',
        'Basic customization'
      ],
      exclusions: [
        'Luxury upgrades',
        'Additional hours beyond 6',
        'Multiple locations'
      ],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Gold Package',
      description: 'Premium all-inclusive experience',
      price: 200000,
      inclusions: [
        '8 hours of service',
        'Luxury setup and equipment',
        'Up to 200 guests',
        'Luxury materials included',
        'Dedicated service team',
        'Complete customization',
        'Complimentary trial/consultation',
        'Coordinator included',
        'Premium upgrades included',
        'Emergency support'
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ]
};

// Helper function to get templates by category
export const getPricingTemplates = (category: string): PricingTemplate[] => {
  return CATEGORY_PRICING_TEMPLATES[category] || CATEGORY_PRICING_TEMPLATES.default;
};

// Helper function to get category display name
export const getCategoryName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    Photography: 'Photographer & Videographer',
    Planning: 'Wedding Planner',
    Florist: 'Florist',
    Beauty: 'Hair & Makeup Artists',
    Catering: 'Caterer',
    Music: 'DJ/Band',
    Officiant: 'Officiant',
    Venue: 'Venue Coordinator',
    Rentals: 'Event Rentals',
    Cake: 'Cake Designer',
    Fashion: 'Dress Designer/Tailor',
    Security: 'Security & Guest Management',
    AV_Equipment: 'Sounds & Lights',
    Stationery: 'Stationery Designer',
    Transport: 'Transportation Services'
  };
  
  return categoryNames[category] || category;
};
