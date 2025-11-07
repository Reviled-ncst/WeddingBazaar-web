// 📊 Category-Specific Pricing Templates for Wedding Bazaar
// This file contains pre-built pricing packages for all 15 service categories
// ✅ PHASE 1: Photography templates updated with itemized pricing

export interface PackageInclusion {
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  description?: string;
}

export interface PricingTemplate {
  item_name: string;
  description: string;
  price: number;
  inclusions: PackageInclusion[];
  exclusions: string[];
  display_order: number;
  is_active: boolean;
  tier?: 'basic' | 'standard' | 'premium' | 'luxury';
}

export const CATEGORY_PRICING_TEMPLATES: Record<string, PricingTemplate[]> = {
  // ========================================
  // 1. PHOTOGRAPHY - Photographer & Videographer
  // ✅ PHASE 1 COMPLETE: Itemized with unit_price
  // ========================================
  Photography: [
    {
      item_name: 'Basic Coverage',
      description: 'Essential photography for intimate weddings',
      price: 35000,
      tier: 'basic',
      inclusions: [
        { 
          name: 'Photography coverage', 
          quantity: 4, 
          unit: 'hours', 
          unit_price: 5000,
          description: 'Professional wedding photographer on-site'
        },
        { 
          name: 'Edited high-resolution photos', 
          quantity: 200, 
          unit: 'photos', 
          unit_price: 50,
          description: 'Color-corrected, professionally edited digital images'
        },
        { 
          name: 'Online gallery access', 
          quantity: 1, 
          unit: 'service', 
          unit_price: 3000,
          description: 'Private online gallery for viewing and downloading'
        },
        { 
          name: 'USB drive with all photos', 
          quantity: 1, 
          unit: 'pcs', 
          unit_price: 2000,
          description: 'All photos in high resolution on branded USB'
        },
        { 
          name: 'Lead photographer', 
          quantity: 1, 
          unit: 'person', 
          unit_price: 10000,
          description: 'Experienced wedding photographer'
        }
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
      tier: 'standard',
      inclusions: [
        { 
          name: 'Photography coverage', 
          quantity: 8, 
          unit: 'hours', 
          unit_price: 5000,
          description: 'Full-day professional coverage from prep to reception'
        },
        { 
          name: 'Edited high-resolution photos', 
          quantity: 400, 
          unit: 'photos', 
          unit_price: 50,
          description: 'Comprehensive photo collection with full editing'
        },
        { 
          name: 'Lead photographer', 
          quantity: 1, 
          unit: 'person', 
          unit_price: 10000,
          description: 'Primary photographer for entire event'
        },
        { 
          name: 'Second photographer', 
          quantity: 1, 
          unit: 'person', 
          unit_price: 8000,
          description: 'Assistant photographer for multiple angles'
        },
        { 
          name: 'Online gallery with download', 
          quantity: 1, 
          unit: 'service', 
          unit_price: 3000,
          description: 'Premium gallery with unlimited downloads'
        },
        { 
          name: 'USB drive in premium case', 
          quantity: 1, 
          unit: 'pcs', 
          unit_price: 2000,
          description: 'All photos in luxury presentation case'
        },
        { 
          name: 'Premium photo album', 
          quantity: 1, 
          unit: 'album', 
          unit_price: 12000,
          description: '20-page premium album (30x30cm) with leather cover'
        },
        { 
          name: 'Engagement shoot', 
          quantity: 1, 
          unit: 'session', 
          unit_price: 8000,
          description: 'Pre-wedding engagement photo session included'
        }
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
      tier: 'premium',
      inclusions: [
        { 
          name: 'Photography coverage', 
          quantity: 10, 
          unit: 'hours', 
          unit_price: 5000,
          description: 'Extended premium coverage for entire day'
        },
        { 
          name: 'Edited high-resolution photos', 
          quantity: 600, 
          unit: 'photos', 
          unit_price: 50,
          description: 'Comprehensive photo collection with premium editing'
        },
        { 
          name: 'Lead photographer', 
          quantity: 1, 
          unit: 'person', 
          unit_price: 12000,
          description: 'Master photographer with 10+ years experience'
        },
        { 
          name: 'Second photographer', 
          quantity: 1, 
          unit: 'person', 
          unit_price: 10000,
          description: 'Professional assistant photographer'
        },
        { 
          name: 'Lead videographer', 
          quantity: 1, 
          unit: 'person', 
          unit_price: 15000,
          description: 'Cinematic videographer with 4K equipment'
        },
        { 
          name: 'Second videographer', 
          quantity: 1, 
          unit: 'person', 
          unit_price: 12000,
          description: 'Assistant videographer for multiple angles'
        },
        { 
          name: 'Drone coverage', 
          quantity: 1, 
          unit: 'service', 
          unit_price: 10000,
          description: 'Aerial photography and videography with licensed drone'
        },
        { 
          name: 'Cinematic highlight video', 
          quantity: 1, 
          unit: 'video', 
          unit_price: 15000,
          description: '5-7 minute cinematic wedding film'
        },
        { 
          name: 'Same-day edit video', 
          quantity: 1, 
          unit: 'video', 
          unit_price: 12000,
          description: '3-5 minute SDE video shown at reception'
        },
        { 
          name: 'Full ceremony video', 
          quantity: 1, 
          unit: 'video', 
          unit_price: 8000,
          description: 'Complete ceremony recording unedited'
        },
        { 
          name: 'Luxury photo album', 
          quantity: 1, 
          unit: 'album', 
          unit_price: 18000,
          description: '40-page luxury album (40x40cm) with leather cover'
        },
        { 
          name: 'Engagement shoot', 
          quantity: 1, 
          unit: 'session', 
          unit_price: 8000,
          description: 'Engagement photo session'
        },
        { 
          name: 'Prenup shoot', 
          quantity: 1, 
          unit: 'session', 
          unit_price: 12000,
          description: 'Themed prenuptial shoot at location of choice'
        },
        { 
          name: 'Online gallery premium', 
          quantity: 1, 
          unit: 'service', 
          unit_price: 5000,
          description: 'Premium gallery with unlimited downloads and sharing'
        },
        { 
          name: 'Cloud backup', 
          quantity: 1, 
          unit: 'service', 
          unit_price: 3000,
          description: 'Secure cloud storage for 5 years'
        }
      ],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],

  // ========================================
  // 2. PLANNING - Wedding Planner
  // ✅ PHASE 2 COMPLETE: Itemized with unit_price
  // ========================================
  Planning: [
    {
      item_name: 'Day-of Coordination',
      description: 'Stress-free wedding day management',
      price: 45000,
      tier: 'basic',
      inclusions: [
        { name: 'Wedding day coordination', quantity: 10, unit: 'hours', unit_price: 3000, description: 'Full day coordination services' },
        { name: 'Vendor coordination', quantity: 1, unit: 'service', unit_price: 5000, description: 'Manage all vendors on wedding day' },
        { name: 'Timeline creation', quantity: 1, unit: 'service', unit_price: 3000, description: 'Detailed wedding day timeline' },
        { name: 'Setup supervision', quantity: 1, unit: 'service', unit_price: 4000, description: 'Oversee venue setup and decorations' },
        { name: 'Emergency kit', quantity: 1, unit: 'service', unit_price: 2000, description: 'Problem-solving and emergency supplies' },
        { name: 'Assistant coordinator', quantity: 1, unit: 'person', unit_price: 8000, description: 'Support coordinator on wedding day' },
        { name: 'Pre-wedding consultations', quantity: 2, unit: 'sessions', unit_price: 10000, description: 'Planning meetings before wedding' }
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
      tier: 'standard',
      inclusions: [
        { name: 'Planning period', quantity: 3, unit: 'months', unit_price: 15000, description: 'Three months of planning support' },
        { name: 'Vendor coordination', quantity: 1, unit: 'service', unit_price: 10000, description: 'Vendor recommendations and management' },
        { name: 'Budget management', quantity: 1, unit: 'service', unit_price: 8000, description: 'Budget tracking and expense management' },
        { name: 'Timeline creation', quantity: 1, unit: 'service', unit_price: 4000, description: 'Comprehensive wedding timeline' },
        { name: 'Contract review', quantity: 1, unit: 'service', unit_price: 5000, description: 'Review vendor contracts' },
        { name: 'Design consultation', quantity: 1, unit: 'service', unit_price: 8000, description: 'Wedding design concept development' },
        { name: 'Support access', quantity: 1, unit: 'service', unit_price: 5000, description: 'Unlimited email and call support' },
        { name: 'Day-of coordination', quantity: 10, unit: 'hours', unit_price: 3000, description: 'Wedding day coordination included' },
        { name: 'Assistant coordinators', quantity: 2, unit: 'persons', unit_price: 8000, description: 'Two assistants on wedding day' }
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
      tier: 'premium',
      inclusions: [
        { name: 'Planning period', quantity: 9, unit: 'months', unit_price: 10000, description: 'Unlimited planning for 6-12 months' },
        { name: 'Vendor sourcing', quantity: 1, unit: 'service', unit_price: 15000, description: 'Complete vendor sourcing and negotiations' },
        { name: 'Budget management', quantity: 1, unit: 'service', unit_price: 10000, description: 'Full budget creation and tracking' },
        { name: 'Design and styling', quantity: 1, unit: 'service', unit_price: 12000, description: 'Complete design concept and styling' },
        { name: 'Guest management', quantity: 1, unit: 'service', unit_price: 8000, description: 'Guest list and RSVP tracking' },
        { name: 'Seating chart', quantity: 1, unit: 'service', unit_price: 5000, description: 'Complete seating arrangement' },
        { name: 'Timeline management', quantity: 1, unit: 'service', unit_price: 5000, description: 'Complete wedding timeline coordination' },
        { name: 'Meetings unlimited', quantity: 1, unit: 'service', unit_price: 10000, description: 'Unlimited consultations' },
        { name: 'Rehearsal coordination', quantity: 1, unit: 'service', unit_price: 8000, description: 'Wedding rehearsal management' },
        { name: 'Day-of coordination', quantity: 12, unit: 'hours', unit_price: 3000, description: 'Full day coordination' },
        { name: 'Assistant coordinators', quantity: 3, unit: 'persons', unit_price: 8000, description: 'Three assistants on wedding day' },
        { name: 'Post-wedding services', quantity: 1, unit: 'service', unit_price: 6000, description: 'Vendor payments and gratuities' },
        { name: 'Emergency contact', quantity: 1, unit: 'service', unit_price: 5000, description: '24/7 emergency support' }
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
      tier: 'basic',
      inclusions: [
        { name: 'Bridal bouquet', quantity: 1, unit: 'piece', unit_price: 5000, description: 'Seasonal flowers bridal bouquet' },
        { name: 'Groom boutonniere', quantity: 1, unit: 'piece', unit_price: 500, description: 'Coordinating groom boutonniere' },
        { name: 'Bridesmaid bouquets', quantity: 4, unit: 'pieces', unit_price: 2000, description: 'Matching bridesmaid bouquets' },
        { name: 'Groomsmen boutonnieres', quantity: 4, unit: 'pieces', unit_price: 400, description: 'Groomsmen boutonnieres' },
        { name: 'Mother corsages', quantity: 2, unit: 'pieces', unit_price: 800, description: 'Corsages for mothers' },
        { name: 'Ceremony arch decoration', quantity: 1, unit: 'setup', unit_price: 6000, description: 'Arch floral arrangement' },
        { name: 'Aisle petals and markers', quantity: 1, unit: 'setup', unit_price: 3000, description: 'Aisle decoration with petals' }
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
      tier: 'standard',
      inclusions: [
        { name: 'Premium bridal bouquet', quantity: 1, unit: 'piece', unit_price: 8000, description: 'Premium flowers bridal bouquet' },
        { name: 'Groom boutonniere', quantity: 1, unit: 'piece', unit_price: 800, description: 'Special accent boutonniere' },
        { name: 'Bridesmaid bouquets', quantity: 6, unit: 'pieces', unit_price: 2500, description: 'Premium bridesmaid bouquets' },
        { name: 'Groomsmen boutonnieres', quantity: 6, unit: 'pieces', unit_price: 600, description: 'Groomsmen boutonnieres' },
        { name: 'Family corsages and wrist flowers', quantity: 4, unit: 'pieces', unit_price: 1000, description: 'Corsages for family members' },
        { name: 'Ceremony arch', quantity: 1, unit: 'setup', unit_price: 10000, description: 'Premium floral ceremony arch' },
        { name: 'Aisle decorations', quantity: 1, unit: 'setup', unit_price: 5000, description: 'Fresh petal aisle decorations' },
        { name: 'Reception centerpieces', quantity: 10, unit: 'pieces', unit_price: 1500, description: 'Table centerpieces' },
        { name: 'Head table floral runner', quantity: 1, unit: 'setup', unit_price: 4000, description: 'Head table floral arrangement' },
        { name: 'Cake table flowers', quantity: 1, unit: 'setup', unit_price: 2000, description: 'Cake table decoration' },
        { name: 'Guest book table arrangement', quantity: 1, unit: 'setup', unit_price: 1500, description: 'Guest book table flowers' }
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
      tier: 'premium',
      inclusions: [
        { name: 'Cascading luxury bridal bouquet', quantity: 1, unit: 'piece', unit_price: 15000, description: 'Extravagant cascading bridal bouquet' },
        { name: 'Premium boutonnieres and corsages', quantity: 12, unit: 'pieces', unit_price: 1000, description: 'Full bridal party flowers' },
        { name: 'Bridesmaid bouquets', quantity: 10, unit: 'pieces', unit_price: 3000, description: 'Luxury bridesmaid bouquets' },
        { name: 'Ceremony backdrop', quantity: 1, unit: 'setup', unit_price: 20000, description: 'Full backdrop with hanging florals' },
        { name: 'Ceremony aisle carpeting', quantity: 1, unit: 'setup', unit_price: 8000, description: 'Floral aisle carpeting' },
        { name: 'Luxury reception centerpieces', quantity: 20, unit: 'pieces', unit_price: 2500, description: 'Premium table centerpieces' },
        { name: 'Head table installation', quantity: 1, unit: 'setup', unit_price: 10000, description: 'Grand head table florals' },
        { name: 'Flower wall backdrop', quantity: 1, unit: 'setup', unit_price: 15000, description: '2x3m photo flower wall' },
        { name: 'Hanging floral chandeliers', quantity: 4, unit: 'pieces', unit_price: 3000, description: 'Suspended floral installations' },
        { name: 'Cake and dessert florals', quantity: 1, unit: 'setup', unit_price: 5000, description: 'Cake table styling with flowers' },
        { name: 'Entrance statement piece', quantity: 1, unit: 'setup', unit_price: 8000, description: 'Grand entrance floral display' },
        { name: 'Lounge area florals', quantity: 1, unit: 'setup', unit_price: 5000, description: 'Lounge seating area flowers' },
        { name: 'Bridal suite flowers', quantity: 1, unit: 'setup', unit_price: 3000, description: 'Bridal preparation room florals' },
        { name: 'Flower crown', quantity: 1, unit: 'piece', unit_price: 4000, description: 'Custom bride flower crown' },
        { name: 'Setup and teardown', quantity: 1, unit: 'service', unit_price: 8000, description: 'Full installation and removal' }
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
      tier: 'basic',
      inclusions: [
        { name: 'Bridal makeup', quantity: 1, unit: 'service', unit_price: 6000, description: 'Airbrush or traditional makeup' },
        { name: 'Bridal hairstyling', quantity: 1, unit: 'service', unit_price: 4000, description: 'Hair with accessories and styling' },
        { name: 'Trial session', quantity: 1, unit: 'session', unit_price: 2000, description: '2-hour pre-wedding trial' },
        { name: 'False lashes', quantity: 1, unit: 'pair', unit_price: 500, description: 'Premium false lashes' },
        { name: 'Touch-up kit', quantity: 1, unit: 'kit', unit_price: 1000, description: 'Emergency touch-up supplies' },
        { name: 'On-site service', quantity: 1, unit: 'service', unit_price: 1500, description: 'Wedding day on-location service' }
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
      tier: 'standard',
      inclusions: [
        { name: 'Bridal makeup and hair', quantity: 1, unit: 'service', unit_price: 8000, description: 'Premium bridal glam' },
        { name: 'Bridesmaid/family makeup and hair', quantity: 5, unit: 'persons', unit_price: 3000, description: 'Full makeup and hair for 5 people' },
        { name: 'Mother makeup and hair', quantity: 2, unit: 'persons', unit_price: 2500, description: 'Elegant makeup and hair for mothers' },
        { name: 'Trial sessions for bride', quantity: 2, unit: 'sessions', unit_price: 2000, description: 'Two pre-wedding trials' },
        { name: 'Premium products', quantity: 1, unit: 'service', unit_price: 2000, description: 'High-quality makeup and hair products' },
        { name: 'False lashes', quantity: 8, unit: 'pairs', unit_price: 500, description: 'Lashes for everyone' },
        { name: 'Touch-up service', quantity: 2, unit: 'hours', unit_price: 1500, description: 'On-site touch-up assistance' },
        { name: 'Individual touch-up kits', quantity: 8, unit: 'kits', unit_price: 500, description: 'Personal touch-up kits' },
        { name: 'On-site service', quantity: 1, unit: 'service', unit_price: 2000, description: 'Two artists on location' }
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
      tier: 'premium',
      inclusions: [
        { name: 'Bridal luxury package', quantity: 1, unit: 'service', unit_price: 12000, description: 'Makeup, hair, and extensions' },
        { name: 'Entourage/family glam', quantity: 10, unit: 'persons', unit_price: 3500, description: 'Full makeup and hair for 10' },
        { name: 'Groom grooming', quantity: 1, unit: 'service', unit_price: 4000, description: 'Haircut, facial, and makeup' },
        { name: 'Unlimited trial sessions', quantity: 1, unit: 'service', unit_price: 3000, description: 'As many trials as needed' },
        { name: 'Professional makeup artists', quantity: 3, unit: 'persons', unit_price: 3000, description: 'Three certified artists' },
        { name: 'Hairstylists', quantity: 2, unit: 'persons', unit_price: 2500, description: 'Two professional hairstylists' },
        { name: 'Premium international products', quantity: 1, unit: 'service', unit_price: 3000, description: 'High-end beauty products' },
        { name: 'Airbrush makeup', quantity: 11, unit: 'persons', unit_price: 1000, description: 'Airbrush for everyone' },
        { name: 'Hair extensions', quantity: 6, unit: 'sets', unit_price: 2000, description: 'Bride and 5 people' },
        { name: 'All-day touch-up service', quantity: 1, unit: 'service', unit_price: 5000, description: 'Full day assistance' },
        { name: 'Pre-wedding skincare consultation', quantity: 1, unit: 'service', unit_price: 2000, description: 'Skincare prep advice' },
        { name: 'Emergency beauty kit', quantity: 1, unit: 'kit', unit_price: 3000, description: 'Comprehensive emergency supplies' }
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
      tier: 'basic',
      inclusions: [
        { name: '4-course meal', quantity: 1, unit: 'per guest', unit_price: 400, description: '2 appetizers, 2 mains, 2 sides, 1 dessert' },
        { name: 'Rice and bread', quantity: 1, unit: 'per guest', unit_price: 50, description: 'Unlimited rice and bread' },
        { name: 'Iced tea and water', quantity: 1, unit: 'per guest', unit_price: 50, description: 'Beverage service' },
        { name: 'Standard tableware and linens', quantity: 1, unit: 'per guest', unit_price: 80, description: 'Complete table setup' },
        { name: 'Service staff', quantity: 1, unit: 'per 30 guests', unit_price: 100, description: 'Professional servers' },
        { name: 'Buffet setup', quantity: 1, unit: 'setup', unit_price: 60, description: 'Chafing dishes and buffet area' },
        { name: 'Basic centerpieces', quantity: 1, unit: 'per table', unit_price: 30, description: 'Simple table decoration' },
        { name: 'Cleanup service', quantity: 1, unit: 'service', unit_price: 30, description: 'Post-event cleanup' }
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
      tier: 'standard',
      inclusions: [
        { name: '5-course gourmet meal', quantity: 1, unit: 'per guest', unit_price: 600, description: 'Premium plated courses' },
        { name: 'Premium menu', quantity: 1, unit: 'per guest', unit_price: 200, description: 'Choice of protein options' },
        { name: 'Welcome drinks', quantity: 1, unit: 'per guest', unit_price: 80, description: 'Arrival beverages' },
        { name: 'Beverage service', quantity: 1, unit: 'per guest', unit_price: 70, description: 'Iced tea, water, coffee' },
        { name: 'Premium tableware', quantity: 1, unit: 'per guest', unit_price: 100, description: 'Fine dining setup' },
        { name: 'Professional service staff', quantity: 1, unit: 'per 20 guests', unit_price: 80, description: 'Trained servers' },
        { name: 'Chef on-site', quantity: 1, unit: 'service', unit_price: 30, description: 'Final preparations' },
        { name: 'Premium centerpieces', quantity: 1, unit: 'per table', unit_price: 20, description: 'Enhanced table decor' },
        { name: 'Full cleanup', quantity: 1, unit: 'service', unit_price: 20, description: 'Complete cleanup and dishwashing' }
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
      tier: 'premium',
      inclusions: [
        { name: '7-course tasting menu', quantity: 1, unit: 'per guest', unit_price: 800, description: 'Chef\'s signature dishes' },
        { name: 'Premium imported ingredients', quantity: 1, unit: 'per guest', unit_price: 250, description: 'High-quality proteins and produce' },
        { name: 'Cocktail hour', quantity: 1, unit: 'per guest', unit_price: 200, description: 'Canapés and drinks' },
        { name: 'Premium beverage package', quantity: 1, unit: 'per guest', unit_price: 250, description: 'Wine, beer, and cocktails' },
        { name: 'Live cooking stations', quantity: 1, unit: 'per guest', unit_price: 180, description: 'Pasta, carving, and sushi' },
        { name: 'Luxury tableware', quantity: 1, unit: 'per guest', unit_price: 120, description: 'Custom linens and fine china' },
        { name: 'Dedicated service team', quantity: 1, unit: 'per 15 guests', unit_price: 80, description: 'Premium staffing ratio' },
        { name: 'Executive chef on-site', quantity: 1, unit: 'service', unit_price: 30, description: 'Chef and sous chef' },
        { name: 'Themed table settings', quantity: 1, unit: 'per table', unit_price: 30, description: 'Coordinated décor' },
        { name: 'Dessert station', quantity: 1, unit: 'per guest', unit_price: 20, description: 'Petit fours and sweets' },
        { name: 'Coffee and tea bar', quantity: 1, unit: 'station', unit_price: 15, description: 'Premium coffee service' },
        { name: 'Personalized menu cards', quantity: 1, unit: 'per guest', unit_price: 10, description: 'Custom printed menus' },
        { name: 'Full event coordination', quantity: 1, unit: 'service', unit_price: 15, description: 'Catering coordinator' }
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
      tier: 'basic',
      inclusions: [
        { name: 'DJ service', quantity: 6, unit: 'hours', unit_price: 3000, description: 'Professional DJ performance' },
        { name: 'DJ with MC services', quantity: 1, unit: 'service', unit_price: 3000, description: 'DJ also serves as emcee' },
        { name: 'Sound system', quantity: 1, unit: 'setup', unit_price: 5000, description: 'For 150 guests' },
        { name: 'Wireless microphones', quantity: 2, unit: 'pieces', unit_price: 1000, description: 'Wireless mic systems' },
        { name: 'Basic lighting effects', quantity: 1, unit: 'package', unit_price: 3000, description: 'LED party lights' },
        { name: 'Music library access', quantity: 1, unit: 'service', unit_price: 2000, description: 'All genres available' },
        { name: 'Playlist consultation', quantity: 1, unit: 'service', unit_price: 2000, description: 'Custom playlist creation' },
        { name: 'Backup equipment', quantity: 1, unit: 'service', unit_price: 3000, description: 'Redundant systems included' }
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
      tier: 'standard',
      inclusions: [
        { name: 'Band performance', quantity: 4, unit: 'hours', unit_price: 8000, description: '5-piece live band' },
        { name: 'DJ performance', quantity: 4, unit: 'hours', unit_price: 3000, description: 'Professional DJ' },
        { name: 'Live band members', quantity: 5, unit: 'persons', unit_price: 3000, description: 'Skilled musicians' },
        { name: 'DJ with MC', quantity: 1, unit: 'service', unit_price: 4000, description: 'DJ and emcee service' },
        { name: 'Premium sound system', quantity: 1, unit: 'setup', unit_price: 8000, description: 'For 300 guests' },
        { name: 'Wireless microphones', quantity: 4, unit: 'pieces', unit_price: 1000, description: 'Professional mic systems' },
        { name: 'Stage lighting package', quantity: 1, unit: 'package', unit_price: 5000, description: 'Stage and dance floor lights' },
        { name: 'LED dance floor effects', quantity: 1, unit: 'package', unit_price: 4000, description: 'Dance floor lighting' },
        { name: 'Setlist consultation', quantity: 1, unit: 'service', unit_price: 2000, description: 'Custom song selection' },
        { name: 'Band setup and breakdown', quantity: 1, unit: 'service', unit_price: 3000, description: 'Equipment handling' },
        { name: 'Backup systems', quantity: 1, unit: 'service', unit_price: 3000, description: 'Redundant equipment' }
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
      tier: 'premium',
      inclusions: [
        { name: 'Full entertainment package', quantity: 10, unit: 'hours', unit_price: 5000, description: 'Continuous entertainment' },
        { name: 'Live band', quantity: 8, unit: 'persons', unit_price: 4000, description: '8-piece professional band' },
        { name: 'String quartet for ceremony', quantity: 1, unit: 'service', unit_price: 8000, description: 'Classical ceremony music' },
        { name: 'Professional DJ', quantity: 1, unit: 'service', unit_price: 6000, description: 'Main DJ with backup' },
        { name: 'Concert-grade sound system', quantity: 1, unit: 'setup', unit_price: 12000, description: 'Premium audio equipment' },
        { name: 'Full lighting production', quantity: 1, unit: 'package', unit_price: 10000, description: 'Intelligent lights, spots, washes' },
        { name: 'LED video wall', quantity: 1, unit: 'piece', unit_price: 15000, description: '3x2 meters display' },
        { name: 'Fog and haze machines', quantity: 1, unit: 'package', unit_price: 4000, description: 'Atmospheric effects' },
        { name: 'Confetti cannons and cold sparks', quantity: 1, unit: 'package', unit_price: 6000, description: 'Special effects' },
        { name: 'Videoke system', quantity: 1, unit: 'setup', unit_price: 5000, description: 'Guest karaoke' },
        { name: 'Custom stage setup', quantity: 1, unit: 'setup', unit_price: 8000, description: 'Professional staging' },
        { name: 'Wireless microphones', quantity: 8, unit: 'pieces', unit_price: 1000, description: 'Multiple mic systems' },
        { name: 'Live streaming setup', quantity: 1, unit: 'service', unit_price: 8000, description: 'Audio/video streaming' },
        { name: 'Musical director', quantity: 1, unit: 'person', unit_price: 8000, description: 'Event music coordination' },
        { name: 'Custom song arrangements', quantity: 1, unit: 'service', unit_price: 6000, description: 'Personalized music' },
        { name: 'Rehearsal with couple', quantity: 1, unit: 'service', unit_price: 5000, description: 'Pre-wedding practice' }
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
      tier: 'basic',
      inclusions: [
        { name: 'Ceremony officiation', quantity: 1, unit: 'service', unit_price: 4000, description: 'Civil or religious ceremony' },
        { name: 'Ceremony duration', quantity: 30, unit: 'minutes', unit_price: 100, description: 'Standard ceremony length' },
        { name: 'Standard script', quantity: 1, unit: 'service', unit_price: 1000, description: 'Pre-written ceremony script' },
        { name: 'Pre-wedding consultation', quantity: 1, unit: 'session', unit_price: 1000, description: 'Planning meeting' },
        { name: 'Certificate signing', quantity: 1, unit: 'service', unit_price: 1000, description: 'Legal documentation' },
        { name: 'Basic PA system', quantity: 1, unit: 'service', unit_price: 900, description: 'Audio equipment if needed' }
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
      tier: 'standard',
      inclusions: [
        { name: 'Personalized script', quantity: 1, unit: 'service', unit_price: 3000, description: 'Fully customized ceremony' },
        { name: 'Ceremony duration', quantity: 45, unit: 'minutes', unit_price: 100, description: 'Extended ceremony' },
        { name: 'Vow writing assistance', quantity: 1, unit: 'service', unit_price: 2000, description: 'Custom vow creation help' },
        { name: 'Pre-wedding consultations', quantity: 3, unit: 'sessions', unit_price: 1000, description: 'Planning meetings' },
        { name: 'Rehearsal attendance', quantity: 1, unit: 'service', unit_price: 2000, description: 'Practice ceremony' },
        { name: 'Certificate preparation', quantity: 1, unit: 'service', unit_price: 1500, description: 'Documentation handling' },
        { name: 'Special rituals integration', quantity: 1, unit: 'service', unit_price: 1500, description: 'Custom traditions' },
        { name: 'Bilingual ceremony', quantity: 1, unit: 'service', unit_price: 1500, description: 'Two languages' },
        { name: 'Ceremony booklet', quantity: 1, unit: 'service', unit_price: 1500, description: 'Program creation' }
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
      tier: 'premium',
      inclusions: [
        { name: 'Bespoke ceremony creation', quantity: 1, unit: 'service', unit_price: 5000, description: 'Fully custom ceremony design' },
        { name: 'Extended ceremony', quantity: 60, unit: 'minutes', unit_price: 100, description: 'Full hour ceremony' },
        { name: 'Professional script writing', quantity: 1, unit: 'service', unit_price: 3000, description: 'Expert ceremony writing' },
        { name: 'Unlimited consultations', quantity: 1, unit: 'service', unit_price: 3000, description: 'As many meetings as needed' },
        { name: 'Multiple rehearsals', quantity: 1, unit: 'service', unit_price: 3000, description: 'Practice sessions' },
        { name: 'Ceremony design consultation', quantity: 1, unit: 'service', unit_price: 2000, description: 'Design planning' },
        { name: 'Cultural/religious rituals', quantity: 1, unit: 'service', unit_price: 2500, description: 'Special traditions' },
        { name: 'Trilingual ceremony', quantity: 1, unit: 'service', unit_price: 2500, description: 'Three languages' },
        { name: 'Premium booklets', quantity: 50, unit: 'copies', unit_price: 50, description: 'Printed programs' },
        { name: 'Music coordination', quantity: 1, unit: 'service', unit_price: 1500, description: 'Ceremony music planning' },
        { name: 'Photo session', quantity: 1, unit: 'service', unit_price: 2000, description: 'Post-ceremony photos' },
        { name: 'Certificate processing', quantity: 1, unit: 'service', unit_price: 1500, description: 'Legal paperwork assistance' },
        { name: 'Luzon travel', quantity: 1, unit: 'service', unit_price: 3000, description: 'Travel within Luzon' }
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
      tier: 'basic',
      inclusions: [
        { name: 'Garden venue rental', quantity: 8, unit: 'hours', unit_price: 6000, description: 'Outdoor garden space' },
        { name: 'Guest capacity', quantity: 50, unit: 'guests', unit_price: 200, description: 'Capacity for 50 people' },
        { name: 'Tables and chairs', quantity: 1, unit: 'setup', unit_price: 10000, description: 'Round tables and Chiavari chairs' },
        { name: 'Basic linens', quantity: 1, unit: 'setup', unit_price: 3000, description: 'Standard table linens' },
        { name: 'Ceremony area with arch', quantity: 1, unit: 'setup', unit_price: 5000, description: 'Ceremony space and arch' },
        { name: 'Bridal suite access', quantity: 4, unit: 'hours', unit_price: 1500, description: 'Preparation room' },
        { name: 'Basic sound system', quantity: 1, unit: 'setup', unit_price: 4000, description: 'Audio equipment' },
        { name: 'Parking', quantity: 20, unit: 'slots', unit_price: 100, description: 'Vehicle parking spaces' },
        { name: 'Security and staff', quantity: 1, unit: 'service', unit_price: 4000, description: 'Supervision staff' }
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
      tier: 'standard',
      inclusions: [
        { name: 'Ballroom rental', quantity: 10, unit: 'hours', unit_price: 10000, description: 'Full ballroom access' },
        { name: 'Guest capacity', quantity: 150, unit: 'guests', unit_price: 200, description: 'Capacity for 150 people' },
        { name: 'Premium tables and chairs', quantity: 1, unit: 'setup', unit_price: 20000, description: 'Premium furniture' },
        { name: 'Premium linens', quantity: 1, unit: 'setup', unit_price: 8000, description: 'Premium linens and chair covers' },
        { name: 'Air conditioning', quantity: 1, unit: 'service', unit_price: 10000, description: 'Full climate control' },
        { name: 'Stage with backdrop', quantity: 1, unit: 'setup', unit_price: 8000, description: 'Performance stage' },
        { name: 'Sound and lighting', quantity: 1, unit: 'package', unit_price: 15000, description: 'Professional A/V' },
        { name: 'LED screens', quantity: 2, unit: 'units', unit_price: 5000, description: 'Display screens' },
        { name: 'Bridal and groom suites', quantity: 1, unit: 'service', unit_price: 8000, description: 'Preparation rooms' },
        { name: 'Cocktail area', quantity: 1, unit: 'space', unit_price: 5000, description: 'Pre-reception area' },
        { name: 'VIP parking', quantity: 30, unit: 'slots', unit_price: 100, description: 'Reserved parking' },
        { name: 'Security team', quantity: 1, unit: 'service', unit_price: 6000, description: 'Security personnel' },
        { name: 'Venue coordinator', quantity: 1, unit: 'person', unit_price: 8000, description: 'Event coordination' },
        { name: 'Setup and cleanup crew', quantity: 1, unit: 'service', unit_price: 6000, description: 'Staff service' }
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
      tier: 'premium',
      inclusions: [
        { name: 'Estate rental', quantity: 15, unit: 'hours', unit_price: 15000, description: 'Full private estate' },
        { name: 'Guest capacity', quantity: 300, unit: 'guests', unit_price: 200, description: 'Up to 300 guests' },
        { name: 'Multiple event areas', quantity: 1, unit: 'service', unit_price: 30000, description: 'Ceremony, reception, lounge' },
        { name: 'Luxury furniture', quantity: 1, unit: 'setup', unit_price: 40000, description: 'Premium furniture and linens' },
        { name: 'Climate control', quantity: 1, unit: 'service', unit_price: 20000, description: 'Full HVAC system' },
        { name: 'Grand stage', quantity: 1, unit: 'setup', unit_price: 20000, description: 'Custom backdrop stage' },
        { name: 'Premium A/V system', quantity: 1, unit: 'package', unit_price: 30000, description: 'LED walls and sound' },
        { name: 'Bridal villa', quantity: 1, unit: 'space', unit_price: 15000, description: 'Spa amenities included' },
        { name: 'Groom suite', quantity: 1, unit: 'space', unit_price: 10000, description: 'Luxury groom preparation' },
        { name: 'VIP lounge area', quantity: 1, unit: 'space', unit_price: 12000, description: 'Premium lounge' },
        { name: 'Garden and water features', quantity: 1, unit: 'access', unit_price: 15000, description: 'Outdoor spaces' },
        { name: 'Valet parking', quantity: 1, unit: 'service', unit_price: 10000, description: 'Professional valet' },
        { name: 'Security team', quantity: 1, unit: 'service', unit_price: 12000, description: 'Full security detail' },
        { name: 'Venue manager', quantity: 1, unit: 'person', unit_price: 15000, description: 'Dedicated manager' },
        { name: 'Setup and breakdown', quantity: 1, unit: 'service', unit_price: 15000, description: 'Complete event service' },
        { name: 'Overnight accommodation', quantity: 1, unit: 'service', unit_price: 20000, description: 'Bridal party stay' }
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
      tier: 'basic',
      inclusions: [
        { name: 'Round tables', quantity: 15, unit: 'tables', unit_price: 1000, description: '60" diameter tables' },
        { name: 'Folding chairs', quantity: 100, unit: 'chairs', unit_price: 150, description: 'White folding chairs' },
        { name: 'Basic table linens', quantity: 15, unit: 'sets', unit_price: 300, description: 'White table linens' },
        { name: 'Chair covers', quantity: 100, unit: 'covers', unit_price: 100, description: 'Basic chair covers' },
        { name: 'Head table', quantity: 1, unit: 'table', unit_price: 2000, description: 'Rectangular head table' },
        { name: 'Cake table', quantity: 1, unit: 'table', unit_price: 1000, description: 'Display table for cake' },
        { name: 'Gift table', quantity: 1, unit: 'table', unit_price: 800, description: 'Gift receiving table' },
        { name: 'Guest book table', quantity: 1, unit: 'table', unit_price: 800, description: 'Sign-in table' },
        { name: 'Delivery and setup', quantity: 1, unit: 'service', unit_price: 3000, description: 'Transport and installation' },
        { name: 'Pickup and breakdown', quantity: 1, unit: 'service', unit_price: 2000, description: 'Removal service' }
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
      tier: 'standard',
      inclusions: [
        { name: 'Premium round tables', quantity: 20, unit: 'tables', unit_price: 1500, description: 'Tables with premium linens' },
        { name: 'Chiavari chairs', quantity: 150, unit: 'chairs', unit_price: 300, description: 'With cushions' },
        { name: 'Premium linens package', quantity: 20, unit: 'sets', unit_price: 500, description: 'Runners and napkins' },
        { name: 'Charger plates', quantity: 150, unit: 'plates', unit_price: 50, description: 'Decorative chargers' },
        { name: 'Upgraded head table', quantity: 1, unit: 'setup', unit_price: 5000, description: 'With backdrop frame' },
        { name: 'Dance floor', quantity: 25, unit: 'sq meters', unit_price: 600, description: 'Portable 5x5m dance floor' },
        { name: 'Cocktail tables', quantity: 10, unit: 'tables', unit_price: 800, description: 'High top tables' },
        { name: 'Lounge furniture', quantity: 1, unit: 'set', unit_price: 10000, description: 'Sofas and coffee tables' },
        { name: 'Ceremony arch', quantity: 1, unit: 'piece', unit_price: 5000, description: 'Decorative arch' },
        { name: 'String lighting', quantity: 50, unit: 'meters', unit_price: 200, description: 'Ambient lighting' },
        { name: 'Professional setup', quantity: 1, unit: 'service', unit_price: 5000, description: 'Delivery and installation' }
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
      tier: 'premium',
      inclusions: [
        { name: 'Wedding tent', quantity: 1, unit: 'tent', unit_price: 40000, description: '40x60 ft with sidewalls' },
        { name: 'Premium tables', quantity: 25, unit: 'tables', unit_price: 2000, description: 'With luxury linens' },
        { name: 'Chiavari chairs', quantity: 200, unit: 'chairs', unit_price: 400, description: 'Velvet cushions' },
        { name: 'Place settings', quantity: 200, unit: 'sets', unit_price: 100, description: 'China, glassware, cutlery' },
        { name: 'LED dance floor', quantity: 64, unit: 'sq meters', unit_price: 800, description: '8x8m with lighting' },
        { name: 'Custom stage', quantity: 1, unit: 'setup', unit_price: 15000, description: '4x6 meters stage' },
        { name: 'Backdrop and draping', quantity: 3, unit: 'locations', unit_price: 5000, description: 'Frames and fabric' },
        { name: 'VIP lounge furniture', quantity: 1, unit: 'set', unit_price: 20000, description: 'Sofas, armchairs, tables' },
        { name: 'Cocktail tables', quantity: 20, unit: 'tables', unit_price: 800, description: 'With linens' },
        { name: 'Bar setup', quantity: 2, unit: 'bars', unit_price: 8000, description: 'With back bar' },
        { name: 'String lighting', quantity: 100, unit: 'meters', unit_price: 200, description: 'Full installation' },
        { name: 'Uplighting', quantity: 20, unit: 'fixtures', unit_price: 800, description: 'LED uplights' },
        { name: 'Restroom trailers', quantity: 2, unit: 'units', unit_price: 10000, description: 'Portable luxury restrooms' },
        { name: 'Generator', quantity: 1, unit: 'unit', unit_price: 15000, description: '15 KVA power' },
        { name: 'Complete service', quantity: 1, unit: 'service', unit_price: 10000, description: 'Delivery, setup, breakdown' },
        { name: 'On-site coordinator', quantity: 1, unit: 'person', unit_price: 8000, description: 'Event day coordination' }
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
      tier: 'basic',
      inclusions: [
        { name: '3-tier cake', quantity: 3, unit: 'tiers', unit_price: 3000, description: '6", 8", 10" rounds' },
        { name: 'Guest servings', quantity: 100, unit: 'servings', unit_price: 50, description: 'Serves 100 guests' },
        { name: 'Frosting finish', quantity: 1, unit: 'service', unit_price: 2000, description: 'Buttercream or fondant' },
        { name: 'Filling flavors', quantity: 2, unit: 'flavors', unit_price: 1000, description: 'Choice of fillings' },
        { name: 'Simple decoration', quantity: 1, unit: 'service', unit_price: 1500, description: 'Floral or ribbon' },
        { name: 'Cake topper', quantity: 1, unit: 'piece', unit_price: 1000, description: 'Included topper' },
        { name: 'Delivery', quantity: 1, unit: 'service', unit_price: 1500, description: 'Metro Manila delivery' },
        { name: 'Setup and display', quantity: 1, unit: 'service', unit_price: 1000, description: 'Professional setup' },
        { name: 'Tasting session', quantity: 1, unit: 'session', unit_price: 1000, description: 'Pre-wedding tasting' }
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
      tier: 'standard',
      inclusions: [
        { name: '4-tier cake', quantity: 4, unit: 'tiers', unit_price: 4000, description: 'Round or square design' },
        { name: 'Guest servings', quantity: 150, unit: 'servings', unit_price: 80, description: 'Serves 150 guests' },
        { name: 'Premium fondant', quantity: 1, unit: 'service', unit_price: 3000, description: 'Custom design work' },
        { name: 'Filling flavors', quantity: 3, unit: 'flavors', unit_price: 1000, description: 'Multiple choices' },
        { name: 'Sugar flowers', quantity: 1, unit: 'service', unit_price: 4000, description: 'Hand-crafted flowers' },
        { name: 'Piping and details', quantity: 1, unit: 'service', unit_price: 2000, description: 'Intricate design work' },
        { name: 'Custom topper', quantity: 1, unit: 'piece', unit_price: 2000, description: 'Personalized topper' },
        { name: 'Dessert treats', quantity: 50, unit: 'pieces', unit_price: 100, description: 'Matching desserts' },
        { name: 'Delivery and setup', quantity: 1, unit: 'service', unit_price: 2000, description: 'Professional service' },
        { name: 'Cake stand rental', quantity: 1, unit: 'piece', unit_price: 1000, description: 'Display stand' },
        { name: 'Tasting sessions', quantity: 2, unit: 'sessions', unit_price: 1000, description: 'Two tastings' }
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
      tier: 'premium',
      inclusions: [
        { name: '5-tier luxury cake', quantity: 5, unit: 'tiers', unit_price: 8000, description: 'Custom shape design' },
        { name: 'Guest servings', quantity: 200, unit: 'servings', unit_price: 100, description: 'Serves 200+ guests' },
        { name: 'Premium fondant with accents', quantity: 1, unit: 'service', unit_price: 6000, description: 'Gold/silver details' },
        { name: 'Unlimited flavors', quantity: 1, unit: 'service', unit_price: 3000, description: 'Any combination' },
        { name: 'Elaborate sugar flowers', quantity: 1, unit: 'service', unit_price: 8000, description: 'Hand-crafted florals' },
        { name: 'Sculpted elements', quantity: 1, unit: 'service', unit_price: 5000, description: 'Custom sculptures' },
        { name: 'LED lighting', quantity: 1, unit: 'integration', unit_price: 4000, description: 'Built-in lights' },
        { name: 'Premium topper', quantity: 1, unit: 'piece', unit_price: 4000, description: 'Custom designed' },
        { name: 'Dessert table', quantity: 100, unit: 'pieces', unit_price: 120, description: 'Matching treats' },
        { name: 'Groom cake', quantity: 1, unit: 'cake', unit_price: 5000, description: 'Additional cake included' },
        { name: 'Custom stand', quantity: 1, unit: 'piece', unit_price: 3000, description: 'Bespoke stand' },
        { name: 'White glove service', quantity: 1, unit: 'service', unit_price: 3000, description: 'Premium delivery and setup' },
        { name: 'Unlimited tastings', quantity: 1, unit: 'service', unit_price: 2000, description: 'As many as needed' },
        { name: 'Preservation kit', quantity: 1, unit: 'kit', unit_price: 2000, description: 'First anniversary keepsake' }
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
      tier: 'basic',
      inclusions: [
        { name: 'Designer wedding gown', quantity: 1, unit: 'gown', unit_price: 30000, description: 'RTW collection gown' },
        { name: 'Basic alterations', quantity: 1, unit: 'service', unit_price: 4000, description: 'Fitting and adjustments' },
        { name: 'Gown cleaning', quantity: 1, unit: 'service', unit_price: 2000, description: 'Professional cleaning and pressing' },
        { name: 'Garment bag', quantity: 1, unit: 'piece', unit_price: 500, description: 'Protective garment bag' },
        { name: 'Fitting sessions', quantity: 2, unit: 'sessions', unit_price: 1000, description: 'Pre-wedding fittings' },
        { name: 'Bustle installation', quantity: 1, unit: 'service', unit_price: 1500, description: 'Train management' }
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
      tier: 'standard',
      inclusions: [
        { name: 'Semi-custom gown design', quantity: 1, unit: 'gown', unit_price: 50000, description: 'Designer silhouette customization' },
        { name: 'Premium fabric selection', quantity: 1, unit: 'service', unit_price: 10000, description: 'Choice of quality fabrics' },
        { name: 'Custom embellishments', quantity: 1, unit: 'service', unit_price: 6000, description: 'Beading and details' },
        { name: 'Complete alterations', quantity: 1, unit: 'service', unit_price: 5000, description: 'Full fitting service' },
        { name: 'Fitting sessions', quantity: 4, unit: 'sessions', unit_price: 1000, description: 'Multiple fittings' },
        { name: 'Bustle and train', quantity: 1, unit: 'service', unit_price: 2000, description: 'Train management system' },
        { name: 'Cleaning and pressing', quantity: 1, unit: 'service', unit_price: 2000, description: 'Professional finish' },
        { name: 'Garment bag and hanger', quantity: 1, unit: 'set', unit_price: 1000, description: 'Quality storage' },
        { name: 'Emergency repair kit', quantity: 1, unit: 'kit', unit_price: 1000, description: 'On-site repair supplies' }
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
      tier: 'premium',
      inclusions: [
        { name: 'Haute couture gown', quantity: 1, unit: 'gown', unit_price: 100000, description: 'Fully custom design' },
        { name: 'Design consultation', quantity: 1, unit: 'service', unit_price: 10000, description: 'Original design creation' },
        { name: 'Luxury imported fabrics', quantity: 1, unit: 'service', unit_price: 20000, description: 'Premium materials' },
        { name: 'Hand-beading and embroidery', quantity: 1, unit: 'service', unit_price: 15000, description: 'Intricate handwork' },
        { name: 'Swarovski crystals', quantity: 1, unit: 'service', unit_price: 8000, description: 'Crystal embellishments' },
        { name: 'Complete customization', quantity: 1, unit: 'service', unit_price: 5000, description: 'Unlimited changes' },
        { name: 'Unlimited fittings', quantity: 1, unit: 'service', unit_price: 3000, description: 'As many sessions as needed' },
        { name: 'Cathedral train with bustle', quantity: 1, unit: 'service', unit_price: 3000, description: 'Extended train' },
        { name: 'Custom veil and accessories', quantity: 1, unit: 'set', unit_price: 5000, description: 'Matching accessories' },
        { name: 'Bridal cape or jacket', quantity: 1, unit: 'piece', unit_price: 3000, description: 'Additional coverage' },
        { name: 'Gown storage box', quantity: 1, unit: 'box', unit_price: 1500, description: 'Archival storage' },
        { name: 'Cleaning and pressing', quantity: 1, unit: 'service', unit_price: 2000, description: 'Professional finish' },
        { name: 'Emergency repair kit', quantity: 1, unit: 'kit', unit_price: 1000, description: 'Comprehensive supplies' },
        { name: 'Preservation service', quantity: 1, unit: 'service', unit_price: 2500, description: 'Post-wedding preservation' },
        { name: 'Mini replica gown', quantity: 1, unit: 'piece', unit_price: 2000, description: 'Keepsake miniature' }
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
      tier: 'basic',
      inclusions: [
        { name: 'Security personnel', quantity: 4, unit: 'persons', unit_price: 1500, description: 'Professional security staff' },
        { name: 'Service hours', quantity: 8, unit: 'hours', unit_price: 500, description: 'Event coverage' },
        { name: 'Uniform and equipment', quantity: 1, unit: 'service', unit_price: 1000, description: 'Complete security gear' },
        { name: 'Entrance/exit monitoring', quantity: 1, unit: 'service', unit_price: 1000, description: 'Access control' },
        { name: 'Parking coordination', quantity: 1, unit: 'service', unit_price: 1000, description: 'Vehicle management' },
        { name: 'Crowd management', quantity: 1, unit: 'service', unit_price: 500, description: 'Guest flow control' },
        { name: 'Emergency response', quantity: 1, unit: 'service', unit_price: 1000, description: 'Emergency protocols' }
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
      tier: 'standard',
      inclusions: [
        { name: 'Security personnel', quantity: 8, unit: 'persons', unit_price: 2000, description: 'Professional team' },
        { name: 'Service hours', quantity: 10, unit: 'hours', unit_price: 600, description: 'Extended coverage' },
        { name: 'Equipment package', quantity: 1, unit: 'set', unit_price: 3000, description: 'Uniforms and communication' },
        { name: 'Entrance security', quantity: 1, unit: 'service', unit_price: 2000, description: 'Main entrance and parking' },
        { name: 'Guest list verification', quantity: 1, unit: 'service', unit_price: 2000, description: 'Check-in management' },
        { name: 'VIP area monitoring', quantity: 1, unit: 'service', unit_price: 1500, description: 'VIP section security' },
        { name: 'Gift table security', quantity: 1, unit: 'service', unit_price: 1000, description: 'Gift protection' },
        { name: 'Crowd and traffic management', quantity: 1, unit: 'service', unit_price: 1500, description: 'Flow coordination' },
        { name: 'Medical response team', quantity: 1, unit: 'service', unit_price: 2000, description: 'Emergency medical' },
        { name: 'Incident reporting', quantity: 1, unit: 'service', unit_price: 1000, description: 'Documentation' }
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
      tier: 'premium',
      inclusions: [
        { name: 'Security personnel', quantity: 15, unit: 'persons', unit_price: 2500, description: 'Full security team' },
        { name: 'Service hours', quantity: 12, unit: 'hours', unit_price: 700, description: 'Extended full-day coverage' },
        { name: 'Security supervisor', quantity: 1, unit: 'person', unit_price: 4000, description: 'On-site supervisor' },
        { name: 'Entrance management', quantity: 1, unit: 'service', unit_price: 3000, description: 'Complete access control' },
        { name: 'VIP close protection', quantity: 2, unit: 'bodyguards', unit_price: 3000, description: 'Personal bodyguards' },
        { name: 'Communication system', quantity: 1, unit: 'package', unit_price: 4000, description: 'Advanced radios' },
        { name: 'CCTV monitoring', quantity: 1, unit: 'system', unit_price: 5000, description: 'Portable surveillance' },
        { name: 'Valet coordination', quantity: 1, unit: 'service', unit_price: 2500, description: 'Parking valet' },
        { name: 'Guest list management', quantity: 1, unit: 'service', unit_price: 2000, description: 'RSVP tracking' },
        { name: 'VIP escort', quantity: 1, unit: 'service', unit_price: 2000, description: 'VIP coordination' },
        { name: 'Gift security', quantity: 1, unit: 'service', unit_price: 1500, description: 'Registry protection' },
        { name: 'Perimeter control', quantity: 1, unit: 'service', unit_price: 2000, description: 'Crowd management' },
        { name: 'Medical team with ambulance', quantity: 1, unit: 'service', unit_price: 5000, description: 'Emergency medical standby' },
        { name: 'Fire safety team', quantity: 1, unit: 'service', unit_price: 2000, description: 'Fire safety' },
        { name: 'Incident documentation', quantity: 1, unit: 'service', unit_price: 1500, description: 'Reporting' },
        { name: 'Police coordination', quantity: 1, unit: 'service', unit_price: 1000, description: 'Local police liaison' }
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
      tier: 'basic',
      inclusions: [
        { name: 'Sound system', quantity: 1, unit: 'setup', unit_price: 6000, description: 'For 100 guests' },
        { name: 'Wireless microphones', quantity: 2, unit: 'pieces', unit_price: 1000, description: 'Professional wireless mics' },
        { name: 'Mixer and speakers', quantity: 1, unit: 'package', unit_price: 3000, description: 'Basic audio equipment' },
        { name: 'LED par lights', quantity: 8, unit: 'units', unit_price: 500, description: 'Basic stage lighting' },
        { name: 'Lighting control', quantity: 1, unit: 'service', unit_price: 1000, description: 'Basic control system' },
        { name: 'Cable management', quantity: 1, unit: 'service', unit_price: 1000, description: 'Professional cable setup' },
        { name: 'Technician', quantity: 8, unit: 'hours', unit_price: 500, description: 'Audio/visual technician' },
        { name: 'Setup and breakdown', quantity: 1, unit: 'service', unit_price: 1000, description: 'Installation and removal' }
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
      tier: 'standard',
      inclusions: [
        { name: 'Concert-grade sound', quantity: 1, unit: 'system', unit_price: 15000, description: 'For 300 guests' },
        { name: 'Wireless microphones', quantity: 4, unit: 'pieces', unit_price: 1500, description: 'With lapel mics' },
        { name: 'DJ mixer package', quantity: 1, unit: 'set', unit_price: 4000, description: 'Professional DJ equipment' },
        { name: 'Line array speakers', quantity: 1, unit: 'system', unit_price: 6000, description: 'Professional PA system' },
        { name: 'Subwoofers', quantity: 2, unit: 'units', unit_price: 2000, description: 'Dance floor bass' },
        { name: 'LED par lights', quantity: 16, unit: 'units', unit_price: 500, description: 'Stage lighting' },
        { name: 'Moving head lights', quantity: 4, unit: 'units', unit_price: 2000, description: 'Intelligent lighting' },
        { name: 'Dance floor effects', quantity: 1, unit: 'package', unit_price: 3000, description: 'LED wash effects' },
        { name: 'Lighting console', quantity: 1, unit: 'service', unit_price: 3000, description: 'With operator' },
        { name: 'Fog machine', quantity: 1, unit: 'unit', unit_price: 1500, description: 'Atmospheric effects' },
        { name: 'Cable and power', quantity: 1, unit: 'service', unit_price: 2000, description: 'Complete distribution' },
        { name: 'Technician', quantity: 10, unit: 'hours', unit_price: 600, description: 'Audio/lighting tech' },
        { name: 'Backup systems', quantity: 1, unit: 'service', unit_price: 2000, description: 'Redundant equipment' }
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
      tier: 'premium',
      inclusions: [
        { name: 'Concert sound system', quantity: 1, unit: 'system', unit_price: 30000, description: 'For 500+ guests' },
        { name: 'Wireless mic system', quantity: 8, unit: 'channels', unit_price: 2000, description: 'Multi-channel system' },
        { name: 'DJ booth', quantity: 1, unit: 'setup', unit_price: 8000, description: 'Premium equipment' },
        { name: 'Line array PA', quantity: 1, unit: 'system', unit_price: 12000, description: 'Professional PA' },
        { name: 'Stage monitors', quantity: 4, unit: 'units', unit_price: 1500, description: 'Floor monitors' },
        { name: 'LED video wall', quantity: 1, unit: 'unit', unit_price: 20000, description: '3x2 meters display' },
        { name: 'Projector and screen', quantity: 1, unit: 'set', unit_price: 5000, description: 'Presentation setup' },
        { name: 'LED par lights', quantity: 30, unit: 'units', unit_price: 500, description: 'Full stage lighting' },
        { name: 'Moving head lights', quantity: 12, unit: 'units', unit_price: 2000, description: 'Intelligent lights' },
        { name: 'LED wash lights', quantity: 8, unit: 'units', unit_price: 1500, description: 'Wash lighting' },
        { name: 'Follow spots', quantity: 2, unit: 'units', unit_price: 3000, description: 'Spotlight systems' },
        { name: 'Lighting control', quantity: 1, unit: 'system', unit_price: 5000, description: 'Intelligent system' },
        { name: 'Haze and fog', quantity: 1, unit: 'package', unit_price: 3000, description: 'Multiple machines' },
        { name: 'Confetti cannons', quantity: 4, unit: 'units', unit_price: 1500, description: 'Special effects' },
        { name: 'Cold spark fountains', quantity: 6, unit: 'units', unit_price: 2000, description: 'Spark effects' },
        { name: 'DMX control', quantity: 1, unit: 'system', unit_price: 4000, description: 'Lighting control' },
        { name: 'Engineer and designer', quantity: 1, unit: 'team', unit_price: 8000, description: 'Professional crew' },
        { name: 'Rigging and trussing', quantity: 1, unit: 'setup', unit_price: 10000, description: 'Complete rigging' },
        { name: 'Power and generators', quantity: 1, unit: 'service', unit_price: 5000, description: 'Power distribution' },
        { name: 'Backup systems', quantity: 1, unit: 'service', unit_price: 4000, description: 'Full redundancy' },
        { name: 'Live streaming', quantity: 1, unit: 'setup', unit_price: 8000, description: 'Audio/video streaming' },
        { name: 'Service with crew', quantity: 12, unit: 'hours', unit_price: 1000, description: 'Full crew coverage' }
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
      tier: 'basic',
      inclusions: [
        { name: 'Wedding invitations', quantity: 100, unit: 'cards', unit_price: 80, description: 'Single card style' },
        { name: 'Matching envelopes', quantity: 100, unit: 'envelopes', unit_price: 15, description: 'Coordinating envelopes' },
        { name: 'Digital design proofs', quantity: 2, unit: 'revisions', unit_price: 1000, description: 'Design review rounds' },
        { name: 'Premium cardstock printing', quantity: 1, unit: 'service', unit_price: 3000, description: 'High-quality printing' },
        { name: 'Information cards', quantity: 100, unit: 'cards', unit_price: 20, description: 'Basic detail cards' },
        { name: 'RSVP cards', quantity: 100, unit: 'sets', unit_price: 30, description: 'With envelopes' },
        { name: 'Invitation assembly', quantity: 1, unit: 'service', unit_price: 1500, description: 'Professional assembly' },
        { name: 'Storage box', quantity: 1, unit: 'box', unit_price: 500, description: 'Protective storage' }
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
      tier: 'standard',
      inclusions: [
        { name: 'Premium invitations', quantity: 150, unit: 'cards', unit_price: 120, description: 'Folded or pocket style' },
        { name: 'Custom envelope liners', quantity: 150, unit: 'liners', unit_price: 20, description: 'Personalized liners' },
        { name: 'Wax seals', quantity: 150, unit: 'seals', unit_price: 25, description: 'With custom stamp' },
        { name: 'Silk ribbon bands', quantity: 150, unit: 'ribbons', unit_price: 15, description: 'Belly bands' },
        { name: 'RSVP cards', quantity: 150, unit: 'sets', unit_price: 30, description: 'With return envelopes' },
        { name: 'Information cards', quantity: 150, unit: 'cards', unit_price: 20, description: 'Details cards' },
        { name: 'Reception cards', quantity: 150, unit: 'cards', unit_price: 15, description: 'Reception information' },
        { name: 'Ceremony programs', quantity: 50, unit: 'programs', unit_price: 50, description: 'Event programs' },
        { name: 'Menu cards', quantity: 50, unit: 'cards', unit_price: 40, description: 'Table menus' },
        { name: 'Place cards', quantity: 150, unit: 'cards', unit_price: 15, description: 'Guest name cards' },
        { name: 'Table numbers', quantity: 20, unit: 'cards', unit_price: 30, description: 'Table identification' },
        { name: 'Thank you cards', quantity: 100, unit: 'cards', unit_price: 25, description: 'Post-wedding thanks' },
        { name: 'Digital design', quantity: 1, unit: 'service', unit_price: 3000, description: 'Unlimited revisions' },
        { name: 'Professional assembly', quantity: 1, unit: 'service', unit_price: 2000, description: 'Complete assembly' },
        { name: 'Gift boxes', quantity: 150, unit: 'boxes', unit_price: 10, description: 'Presentation boxes' }
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
      tier: 'premium',
      inclusions: [
        { name: 'Luxury invitations', quantity: 200, unit: 'cards', unit_price: 200, description: 'Multilayer with pocket' },
        { name: 'Custom illustration', quantity: 1, unit: 'design', unit_price: 8000, description: 'Monogram design' },
        { name: 'Letterpress/foil stamping', quantity: 1, unit: 'service', unit_price: 6000, description: 'Premium printing' },
        { name: 'Hand-deckled edges', quantity: 200, unit: 'cards', unit_price: 20, description: 'Artisan edges' },
        { name: 'Luxury ribbons', quantity: 200, unit: 'ribbons', unit_price: 30, description: 'Silk or velvet' },
        { name: 'Premium wax seals', quantity: 200, unit: 'seals', unit_price: 40, description: 'Custom die seals' },
        { name: 'Custom envelope liners', quantity: 200, unit: 'liners', unit_price: 25, description: 'Bespoke liners' },
        { name: 'Hand calligraphy', quantity: 200, unit: 'envelopes', unit_price: 50, description: 'All addressing' },
        { name: 'Complete suite', quantity: 200, unit: 'sets', unit_price: 50, description: 'RSVP, details, accommodation' },
        { name: 'Ceremony programs', quantity: 100, unit: 'booklets', unit_price: 80, description: 'Booklet style' },
        { name: 'Menu cards with foil', quantity: 100, unit: 'cards', unit_price: 60, description: 'Gold foil menus' },
        { name: 'Place cards calligraphy', quantity: 200, unit: 'cards', unit_price: 30, description: 'Hand-lettered' },
        { name: 'Table numbers with stands', quantity: 30, unit: 'sets', unit_price: 100, description: 'Premium stands' },
        { name: 'Welcome sign', quantity: 1, unit: 'sign', unit_price: 3000, description: 'Large format design' },
        { name: 'Seating chart', quantity: 1, unit: 'chart', unit_price: 2500, description: 'Custom design' },
        { name: 'Guestbook design', quantity: 1, unit: 'book', unit_price: 2000, description: 'Custom guestbook' },
        { name: 'Thank you cards', quantity: 200, unit: 'cards', unit_price: 30, description: 'Premium cards' },
        { name: 'Gift tags and labels', quantity: 200, unit: 'pieces', unit_price: 10, description: 'Favor tags' },
        { name: 'Custom postage', quantity: 200, unit: 'stamps', unit_price: 15, description: 'Personalized stamps' },
        { name: 'Presentation boxes', quantity: 200, unit: 'boxes', unit_price: 25, description: 'Luxury boxes' },
        { name: 'Unlimited revisions', quantity: 1, unit: 'service', unit_price: 3000, description: 'Design perfection' },
        { name: 'White glove assembly', quantity: 1, unit: 'service', unit_price: 4000, description: 'Premium packaging' }
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
      tier: 'basic',
      inclusions: [
        { name: 'Luxury sedan or vintage car', quantity: 1, unit: 'vehicle', unit_price: 5000, description: 'Premium bridal car' },
        { name: 'Professional chauffeur', quantity: 1, unit: 'driver', unit_price: 2000, description: 'Experienced driver' },
        { name: 'Service hours', quantity: 6, unit: 'hours', unit_price: 500, description: 'Rental duration' },
        { name: 'Car decoration', quantity: 1, unit: 'set', unit_price: 1500, description: 'Ribbons and flowers' },
        { name: 'Red carpet service', quantity: 1, unit: 'service', unit_price: 500, description: 'VIP arrival' },
        { name: 'Complimentary items', quantity: 1, unit: 'package', unit_price: 300, description: 'Water and tissues' },
        { name: 'Transfer service', quantity: 3, unit: 'trips', unit_price: 400, description: 'Home-church-reception' }
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
      tier: 'standard',
      inclusions: [
        { name: 'Luxury bridal car', quantity: 1, unit: 'vehicle', unit_price: 6000, description: 'Vintage or modern luxury' },
        { name: 'Sedans for sponsors', quantity: 2, unit: 'vehicles', unit_price: 3500, description: 'Parents and principals' },
        { name: 'Coaster for entourage', quantity: 1, unit: 'bus', unit_price: 5000, description: '25-passenger capacity' },
        { name: 'Professional drivers', quantity: 4, unit: 'drivers', unit_price: 1500, description: 'All vehicles' },
        { name: 'Service hours', quantity: 8, unit: 'hours', unit_price: 500, description: 'Extended coverage' },
        { name: 'Complete decorations', quantity: 4, unit: 'sets', unit_price: 800, description: 'All vehicles decorated' },
        { name: 'Red carpet service', quantity: 1, unit: 'service', unit_price: 700, description: 'VIP treatment' },
        { name: 'Transport coordination', quantity: 1, unit: 'service', unit_price: 2000, description: 'Schedule management' },
        { name: 'Multiple transfers', quantity: 1, unit: 'service', unit_price: 2500, description: 'All venues' },
        { name: 'Waiting time', quantity: 1, unit: 'service', unit_price: 1500, description: 'Standby included' },
        { name: 'Refreshments', quantity: 1, unit: 'package', unit_price: 800, description: 'All vehicles' }
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
      tier: 'premium',
      inclusions: [
        { name: 'Luxury vintage car', quantity: 1, unit: 'vehicle', unit_price: 10000, description: 'Exotic bridal car' },
        { name: 'Luxury sedan for groom', quantity: 1, unit: 'vehicle', unit_price: 5000, description: 'Premium sedan' },
        { name: 'VIP sedans', quantity: 4, unit: 'vehicles', unit_price: 3000, description: 'Family and VIPs' },
        { name: 'Coaster buses', quantity: 2, unit: 'buses', unit_price: 6000, description: '50 pax total capacity' },
        { name: 'Guest shuttle buses', quantity: 2, unit: 'buses', unit_price: 8000, description: '100 pax capacity' },
        { name: 'Professional drivers', quantity: 10, unit: 'drivers', unit_price: 1500, description: 'All vehicles' },
        { name: 'Transportation coordinator', quantity: 1, unit: 'person', unit_price: 3000, description: 'On-site coordinator' },
        { name: 'Service hours', quantity: 10, unit: 'hours', unit_price: 500, description: 'Full day coverage' },
        { name: 'Premium decorations', quantity: 10, unit: 'sets', unit_price: 500, description: 'All vehicles' },
        { name: 'Red carpet service', quantity: 1, unit: 'service', unit_price: 1000, description: 'VIP arrivals' },
        { name: 'Route coordination', quantity: 1, unit: 'service', unit_price: 2500, description: 'Multiple routes' },
        { name: 'Shuttle schedule management', quantity: 1, unit: 'service', unit_price: 2000, description: 'Guest coordination' },
        { name: 'Signage and identification', quantity: 10, unit: 'sets', unit_price: 200, description: 'Vehicle signage' },
        { name: 'Waiting time', quantity: 1, unit: 'service', unit_price: 2000, description: 'Unlimited standby' },
        { name: 'Premium refreshments', quantity: 1, unit: 'package', unit_price: 1500, description: 'All vehicles' },
        { name: 'Transport to all locations', quantity: 1, unit: 'service', unit_price: 3000, description: 'Hotels, venues, photo spots' }
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
      tier: 'basic',
      inclusions: [
        { name: 'Service hours', quantity: 4, unit: 'hours', unit_price: 2000, description: 'Core service time' },
        { name: 'Basic setup and equipment', quantity: 1, unit: 'set', unit_price: 15000, description: 'Essential equipment' },
        { name: 'Guest capacity', quantity: 50, unit: 'guests', unit_price: 300, description: 'Up to 50 guests' },
        { name: 'Standard materials', quantity: 1, unit: 'package', unit_price: 10000, description: 'Basic materials included' },
        { name: 'Professional service staff', quantity: 2, unit: 'staff', unit_price: 3000, description: 'Service team' }
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
      tier: 'standard',
      inclusions: [
        { name: 'Service hours', quantity: 6, unit: 'hours', unit_price: 3000, description: 'Extended service time' },
        { name: 'Premium setup and equipment', quantity: 1, unit: 'set', unit_price: 30000, description: 'Enhanced equipment' },
        { name: 'Guest capacity', quantity: 100, unit: 'guests', unit_price: 400, description: 'Up to 100 guests' },
        { name: 'Premium materials', quantity: 1, unit: 'package', unit_price: 20000, description: 'Premium materials included' },
        { name: 'Professional service team', quantity: 4, unit: 'staff', unit_price: 3500, description: 'Enhanced team' },
        { name: 'Complimentary consultation', quantity: 1, unit: 'session', unit_price: 3000, description: 'Planning consultation' },
        { name: 'Basic customization', quantity: 1, unit: 'service', unit_price: 5000, description: 'Personalization options' }
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
      tier: 'premium',
      inclusions: [
        { name: 'Service hours', quantity: 8, unit: 'hours', unit_price: 5000, description: 'Full day coverage' },
        { name: 'Luxury setup and equipment', quantity: 1, unit: 'set', unit_price: 60000, description: 'Top-tier equipment' },
        { name: 'Guest capacity', quantity: 200, unit: 'guests', unit_price: 500, description: 'Up to 200 guests' },
        { name: 'Luxury materials', quantity: 1, unit: 'package', unit_price: 40000, description: 'Premium materials included' },
        { name: 'Dedicated service team', quantity: 6, unit: 'staff', unit_price: 4000, description: 'Full service team' },
        { name: 'Complete customization', quantity: 1, unit: 'service', unit_price: 10000, description: 'Unlimited customization' },
        { name: 'Complimentary trial/consultation', quantity: 2, unit: 'sessions', unit_price: 3000, description: 'Pre-event sessions' },
        { name: 'Coordinator included', quantity: 1, unit: 'person', unit_price: 8000, description: 'Dedicated coordinator' },
        { name: 'Premium upgrades', quantity: 1, unit: 'package', unit_price: 15000, description: 'All upgrades included' },
        { name: 'Emergency support', quantity: 1, unit: 'service', unit_price: 5000, description: '24/7 on-call support' }
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
