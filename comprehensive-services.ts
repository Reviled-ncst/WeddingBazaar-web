// Comprehensive realistic wedding services matching your 80+ database services
export const COMPREHENSIVE_WEDDING_SERVICES = [
  // Wedding Planning Services (8 services)
  {
    id: 'SRV-0001', name: 'Destination Wedding Planning', category: 'Wedding Planning',
    vendorId: 'VENDOR-001', vendorName: 'Elite Wedding Planners', 
    vendorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    description: 'Complete destination wedding planning with venue coordination and travel arrangements.',
    priceRange: '₱85,000 - ₱250,000', location: 'Metro Manila, Philippines', rating: 4.9, reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600',
    gallery: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600'],
    features: ['Destination Planning', 'Venue Coordination', 'Travel Arrangements', 'Full-Service Planning'],
    availability: true, contactInfo: { phone: '+63917-111-1111', email: 'info@eliteweddings.ph' }
  },
  {
    id: 'SRV-0002', name: 'Day-of Wedding Coordination', category: 'Wedding Planning',
    vendorId: 'VENDOR-002', vendorName: 'Perfect Day Coordinators',
    vendorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    description: 'Professional day-of coordination to ensure your wedding runs smoothly from start to finish.',
    priceRange: '₱35,000 - ₱65,000', location: 'Quezon City, Metro Manila', rating: 4.7, reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=600',
    gallery: ['https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=600'],
    features: ['Day-of Coordination', 'Timeline Management', 'Vendor Coordination', 'Problem Solving'],
    availability: true, contactInfo: { phone: '+63917-111-2222', email: 'hello@perfectday.ph' }
  },
  {
    id: 'SRV-0003', name: 'Essential Wedding Planning Package', category: 'Wedding Planning',
    vendorId: 'VENDOR-003', vendorName: 'Wedding Dreams Co.',
    vendorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    description: 'Essential wedding planning services covering all the important details for your special day.',
    priceRange: '₱55,000 - ₱95,000', location: 'Makati City, Metro Manila', rating: 4.8, reviewCount: 124,
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600',
    gallery: ['https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600'],
    features: ['Essential Planning', 'Budget Management', 'Vendor Selection', 'Timeline Creation'],
    availability: true, contactInfo: { phone: '+63917-111-3333', email: 'info@weddingdreams.ph' }
  },
  {
    id: 'SRV-0933', name: 'Platinum Full-Service Wedding Planning', category: 'Wedding Planning',
    vendorId: 'VENDOR-933', vendorName: 'Platinum Weddings',
    vendorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    description: 'Complete luxury wedding planning with premium vendor coordination and personalized service.',
    priceRange: '₱150,000 - ₱350,000', location: 'Taguig City, Metro Manila', rating: 4.9, reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600',
    gallery: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600'],
    features: ['Luxury Planning', 'Premium Vendors', 'Personalized Service', 'Full Coordination'],
    availability: true, contactInfo: { phone: '+63917-111-4444', email: 'luxury@platinumweddings.ph' }
  },

  // Photography & Videography Services (8 services)
  {
    id: 'SRV-0006', name: 'Premium Wedding Photography & Videography', category: 'Photography',
    vendorId: 'VENDOR-006', vendorName: 'Lens & Light Studios',
    vendorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    description: 'Professional wedding photography and videography with cinematic storytelling approach.',
    priceRange: '₱75,000 - ₱180,000', location: 'Taguig City, Metro Manila', rating: 4.9, reviewCount: 203,
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600',
    gallery: ['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600'],
    features: ['Full Day Coverage', 'Cinematic Video', 'Same Day Edit', 'Digital Gallery'],
    availability: true, contactInfo: { phone: '+63917-222-1111', email: 'book@lenslight.ph' }
  },
  {
    id: 'SRV-0007', name: 'Classic Wedding Photography', category: 'Photography',
    vendorId: 'VENDOR-007', vendorName: 'Timeless Captures',
    vendorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    description: 'Classic and elegant wedding photography with attention to traditional moments.',
    priceRange: '₱45,000 - ₱85,000', location: 'Pasig City, Metro Manila', rating: 4.6, reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
    gallery: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=600'],
    features: ['Classic Photography', 'Traditional Poses', 'Family Portraits', 'Reception Coverage'],
    availability: true, contactInfo: { phone: '+63917-222-2222', email: 'info@timelesscaptures.ph' }
  },
  {
    id: 'SRV-0008', name: 'Engagement Photography Session', category: 'Photography',
    vendorId: 'VENDOR-008', vendorName: 'Love Story Studios',
    vendorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    description: 'Beautiful engagement photography sessions in scenic locations around Metro Manila.',
    priceRange: '₱15,000 - ₱35,000', location: 'Various Locations', rating: 4.8, reviewCount: 92,
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600',
    gallery: ['https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600'],
    features: ['Engagement Session', 'Multiple Locations', 'Outfit Changes', 'Digital Gallery'],
    availability: true, contactInfo: { phone: '+63917-222-3333', email: 'hello@lovestory.ph' }
  },
  {
    id: 'SRV-4665', name: 'Cinematic Wedding Videography', category: 'Videography',
    vendorId: 'VENDOR-465', vendorName: 'Motion Picture Wedding Films',
    vendorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    description: 'Cinematic wedding videography with professional editing and storytelling.',
    priceRange: '₱65,000 - ₱140,000', location: 'Makati City, Metro Manila', rating: 4.8, reviewCount: 112,
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600',
    gallery: ['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600'],
    features: ['Cinematic Style', 'Professional Editing', 'Drone Footage', 'Highlight Reel'],
    availability: true, contactInfo: { phone: '+63917-222-4444', email: 'films@motionpicture.ph' }
  },

  // Florist Services (7 services)
  {
    id: 'SRV-0010', name: 'Essential Bridal Florals', category: 'Flowers',
    vendorId: 'VENDOR-010', vendorName: 'Blooming Elegance',
    vendorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    description: 'Beautiful bridal bouquets and ceremony florals with fresh, seasonal flowers.',
    priceRange: '₱25,000 - ₱55,000', location: 'Quezon City, Metro Manila', rating: 4.8, reviewCount: 134,
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce2d2?w=600',
    gallery: ['https://images.unsplash.com/photo-1522673607200-164d1b6ce2d2?w=600'],
    features: ['Bridal Bouquet', 'Ceremony Florals', 'Seasonal Flowers', 'Fresh Arrangements'],
    availability: true, contactInfo: { phone: '+63917-333-1111', email: 'orders@bloomingelegance.ph' }
  },
  {
    id: 'SRV-0011', name: 'Reception Centerpiece Collection', category: 'Flowers',
    vendorId: 'VENDOR-011', vendorName: 'Garden Paradise',
    vendorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    description: 'Elegant reception centerpieces and table arrangements for your wedding celebration.',
    priceRange: '₱35,000 - ₱75,000', location: 'Makati City, Metro Manila', rating: 4.7, reviewCount: 98,
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600',
    gallery: ['https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600'],
    features: ['Reception Centerpieces', 'Table Arrangements', 'Custom Designs', 'Setup Service'],
    availability: true, contactInfo: { phone: '+63917-333-2222', email: 'info@gardenparadise.ph' }
  },
  {
    id: 'SRV-0009', name: 'Ceremony Floral Design', category: 'Flowers',
    vendorId: 'VENDOR-009', vendorName: 'Petals & Blooms',
    vendorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    description: 'Stunning ceremony floral designs including altar arrangements and aisle decorations.',
    priceRange: '₱45,000 - ₱85,000', location: 'Pasig City, Metro Manila', rating: 4.9, reviewCount: 76,
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600',
    gallery: ['https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600'],
    features: ['Altar Arrangements', 'Aisle Decorations', 'Arch Florals', 'Ceremony Setup'],
    availability: true, contactInfo: { phone: '+63917-333-3333', email: 'ceremonies@petalsblooms.ph' }
  },

  // Hair & Makeup Services (7 services)
  {
    id: 'SRV-0013', name: 'Bridal Party Beauty Package', category: 'Makeup & Hair',
    vendorId: 'VENDOR-013', vendorName: 'Glamour Beauty Studio',
    vendorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    description: 'Complete beauty package for bride and bridal party with professional makeup and hair styling.',
    priceRange: '₱45,000 - ₱85,000', location: 'Taguig City, Metro Manila', rating: 4.9, reviewCount: 187,
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600',
    gallery: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600'],
    features: ['Bridal Makeup', 'Hair Styling', 'Bridal Party', 'Touch-up Kit'],
    availability: true, contactInfo: { phone: '+63917-444-1111', email: 'book@glamourbeauty.ph' }
  },
  {
    id: 'SRV-0012', name: 'Luxury Bridal Beauty Experience', category: 'Makeup & Hair',
    vendorId: 'VENDOR-012', vendorName: 'Elite Beauty Artists',
    vendorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    description: 'Luxury bridal beauty experience with premium products and personalized styling.',
    priceRange: '₱35,000 - ₱65,000', location: 'Makati City, Metro Manila', rating: 4.8, reviewCount: 145,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600',
    gallery: ['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600'],
    features: ['Luxury Products', 'Personalized Styling', 'Trial Session', 'Premium Experience'],
    availability: true, contactInfo: { phone: '+63917-444-2222', email: 'hello@elitebeauty.ph' }
  },
  {
    id: 'SRV-0014', name: 'Engagement Session Makeup', category: 'Makeup & Hair',
    vendorId: 'VENDOR-014', vendorName: 'Natural Glow Beauty',
    vendorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    description: 'Professional makeup and hair for engagement photo sessions with natural, camera-ready looks.',
    priceRange: '₱8,000 - ₱18,000', location: 'Various Locations', rating: 4.7, reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600',
    gallery: ['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600'],
    features: ['Natural Look', 'Camera-Ready', 'Touch-ups', 'Engagement Special'],
    availability: true, contactInfo: { phone: '+63917-444-3333', email: 'sessions@naturalglow.ph' }
  },

  // Catering Services (6 services)
  {
    id: 'SRV-0017', name: 'Cocktail Hour Catering', category: 'Catering',
    vendorId: 'VENDOR-017', vendorName: 'Culinary Creations',
    vendorImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
    description: 'Elegant cocktail hour catering with hors d\'oeuvres and premium beverages.',
    priceRange: '₱55,000 - ₱95,000', location: 'Pasig City, Metro Manila', rating: 4.8, reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
    gallery: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600'],
    features: ['Cocktail Service', 'Hors d\'oeuvres', 'Premium Beverages', 'Professional Staff'],
    availability: true, contactInfo: { phone: '+63917-555-1111', email: 'events@culinarycreations.ph' }
  },
  {
    id: 'SRV-0023', name: 'Michelin-Inspired Wedding Feast', category: 'Catering',
    vendorId: 'VENDOR-023', vendorName: 'Gourmet Excellence',
    vendorImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
    description: 'Michelin-inspired wedding feast with premium ingredients and artistic presentation.',
    priceRange: '₱150,000 - ₱300,000', location: 'Makati City, Metro Manila', rating: 4.9, reviewCount: 78,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
    gallery: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'],
    features: ['Michelin Quality', 'Premium Ingredients', 'Artistic Presentation', 'Chef Service'],
    availability: true, contactInfo: { phone: '+63917-555-2222', email: 'luxury@gourmetexcellence.ph' }
  },

  // Music & DJ Services (6 services)  
  {
    id: 'SRV-0019', name: 'DJ + Live Music Combo', category: 'Music & DJ',
    vendorId: 'VENDOR-019', vendorName: 'Sound & Soul Entertainment',
    vendorImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    description: 'Perfect combination of DJ services and live music performance for your wedding celebration.',
    priceRange: '₱65,000 - ₱120,000', location: 'Quezon City, Metro Manila', rating: 4.8, reviewCount: 134,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    gallery: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600'],
    features: ['DJ Services', 'Live Music', 'Sound System', 'MC Services'],
    availability: true, contactInfo: { phone: '+63917-666-1111', email: 'book@soundsoul.ph' }
  },
  {
    id: 'SRV-0020', name: 'Live Wedding Band Performance', category: 'Music & DJ',
    vendorId: 'VENDOR-020', vendorName: 'Harmony Wedding Band',
    vendorImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    description: 'Professional live wedding band with repertoire spanning multiple genres and eras.',
    priceRange: '₱85,000 - ₱150,000', location: 'Taguig City, Metro Manila', rating: 4.9, reviewCount: 98,
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600',
    gallery: ['https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600'],
    features: ['Live Band', 'Multiple Genres', 'Professional Musicians', 'Song Requests'],
    availability: true, contactInfo: { phone: '+63917-666-2222', email: 'gigs@harmonyband.ph' }
  },

  // Venue Services (6 services)
  {
    id: 'SRV-0004', name: 'Venue Setup & Styling', category: 'Venues',
    vendorId: 'VENDOR-004', vendorName: 'Premier Venue Services',
    vendorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    description: 'Professional venue setup and styling services to transform your wedding space.',
    priceRange: '₱35,000 - ₱75,000', location: 'Metro Manila', rating: 4.8, reviewCount: 167,
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
    gallery: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600'],
    features: ['Venue Styling', 'Setup Service', 'Decor Coordination', 'Space Transformation'],
    availability: true, contactInfo: { phone: '+63917-777-1111', email: 'venues@premiervenue.ph' }
  },
  {
    id: 'SRV-0005', name: 'Full Venue Management & Coordination', category: 'Venues',
    vendorId: 'VENDOR-005', vendorName: 'Complete Venue Solutions',
    vendorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    description: 'Complete venue management and coordination for seamless wedding day execution.',
    priceRange: '₱55,000 - ₱95,000', location: 'Taguig City, Metro Manila', rating: 4.9, reviewCount: 123,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600',
    gallery: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600'],
    features: ['Full Management', 'Coordination', 'Vendor Relations', 'Timeline Management'],
    availability: true, contactInfo: { phone: '+63917-777-2222', email: 'manage@completevenue.ph' }
  },

  // Transportation Services (4 services)
  {
    id: 'SRV-6582', name: 'Luxury Wedding Transportation Package', category: 'Transportation',
    vendorId: 'VENDOR-582', vendorName: 'Elite Transport Services',
    vendorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    description: 'Luxury wedding transportation with premium vehicles and professional chauffeur service.',
    priceRange: '₱45,000 - ₱85,000', location: 'Metro Manila', rating: 4.8, reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600',
    gallery: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600'],
    features: ['Luxury Vehicles', 'Professional Chauffeur', 'Decoration', 'Wedding Package'],
    availability: true, contactInfo: { phone: '+63917-888-1111', email: 'luxury@elitetransport.ph' }
  },
  {
    id: 'SRV-9016', name: 'Classic Car Wedding Rental', category: 'Transportation',
    vendorId: 'VENDOR-016', vendorName: 'Classic Car Rentals',
    vendorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    description: 'Vintage and classic car rentals for unique and memorable wedding transportation.',
    priceRange: '₱25,000 - ₱55,000', location: 'Quezon City, Metro Manila', rating: 4.7, reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600',
    gallery: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600'],
    features: ['Classic Cars', 'Vintage Style', 'Photo Opportunities', 'Unique Experience'],
    availability: true, contactInfo: { phone: '+63917-888-2222', email: 'classic@vintagecars.ph' }
  }
];
