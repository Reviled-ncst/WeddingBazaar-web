const { sql } = require('./backend-deploy/config/database.cjs');

// All 15 categories
const categories = [
  'Photography', 'Planning', 'Florist', 'Beauty', 'Catering',
  'Music', 'Officiant', 'Venue', 'Rentals', 'Cake',
  'Fashion', 'Security', 'AV_Equipment', 'Stationery', 'Transport'
];

// Service data templates for each category (10 services per category)
const serviceTemplates = {
  Photography: [
    { title: 'Wedding Day Full Coverage', priceRange: [35000, 75000], desc: 'Complete wedding day photography coverage with raw and edited photos' },
    { title: 'Pre-Wedding Photoshoot Package', priceRange: [15000, 35000], desc: 'Romantic pre-wedding photoshoot session at Cavite locations' },
    { title: 'Same Day Edit Video Package', priceRange: [25000, 50000], desc: 'Professional same-day edit video highlights ready for reception' },
    { title: 'Engagement Shoot + Print Package', priceRange: [12000, 28000], desc: 'Engagement photo session with premium prints and albums' },
    { title: 'Wedding Documentary Video', priceRange: [40000, 85000], desc: 'Cinematic documentary-style wedding video coverage' },
    { title: 'Photo + Video Combo Package', priceRange: [60000, 120000], desc: 'Complete photo and video coverage with 2 photographers and 2 videographers' },
    { title: 'Prenuptial Video AVP', priceRange: [18000, 38000], desc: 'Audio-visual presentation for your wedding reception' },
    { title: 'Wedding Photo Album Design', priceRange: [8000, 18000], desc: 'Professional album design and printing services' },
    { title: 'Additional Photographer Coverage', priceRange: [10000, 22000], desc: 'Extra photographer for extended coverage or second angle shots' },
    { title: 'Aerial Drone Photography Service', priceRange: [12000, 25000], desc: 'Stunning aerial shots with professional drone coverage' }
  ],
  Planning: [
    { title: 'Full Wedding Planning Package', priceRange: [45000, 100000], desc: 'Complete wedding planning from concept to execution' },
    { title: 'Day-of Coordination Service', priceRange: [18000, 35000], desc: 'Professional coordination on your wedding day' },
    { title: 'Partial Planning Package', priceRange: [28000, 60000], desc: 'Planning assistance for specific aspects of your wedding' },
    { title: 'Budget Management Service', priceRange: [12000, 25000], desc: 'Expert budget planning and vendor negotiations' },
    { title: 'Venue Selection Assistance', priceRange: [8000, 18000], desc: 'Help find and book the perfect venue for your wedding' },
    { title: 'Vendor Coordination Package', priceRange: [15000, 32000], desc: 'Manage all vendor communications and contracts' },
    { title: 'Timeline Creation Service', priceRange: [6000, 12000], desc: 'Detailed wedding day timeline and schedule creation' },
    { title: 'Rehearsal Coordination', priceRange: [8000, 15000], desc: 'Professional coordination of your wedding rehearsal' },
    { title: 'Destination Wedding Planning', priceRange: [60000, 150000], desc: 'Complete planning for destination weddings in Cavite' },
    { title: 'Month-of Coordination', priceRange: [22000, 45000], desc: 'Coordination services starting one month before the wedding' }
  ],
  Florist: [
    { title: 'Bridal Bouquet & Arrangements', priceRange: [5000, 15000], desc: 'Beautiful bridal bouquet with fresh seasonal flowers' },
    { title: 'Ceremony Floral Decoration', priceRange: [15000, 45000], desc: 'Complete ceremony venue floral decoration' },
    { title: 'Reception Centerpieces Package', priceRange: [18000, 55000], desc: 'Elegant centerpieces for all reception tables' },
    { title: 'Church Flower Arrangement', priceRange: [12000, 35000], desc: 'Traditional church floral decorations and arrangements' },
    { title: 'Entourage Bouquets & Boutonnieres', priceRange: [8000, 22000], desc: 'Flowers for bridesmaids, groomsmen, and entourage' },
    { title: 'Ceremony Arch Florals', priceRange: [10000, 28000], desc: 'Stunning floral arch decoration for ceremonies' },
    { title: 'Floral Installation Package', priceRange: [25000, 70000], desc: 'Large-scale floral installations for dramatic effect' },
    { title: 'Preserved Flower Bouquet', priceRange: [6000, 18000], desc: 'Beautiful preserved flower bouquet that lasts forever' },
    { title: 'Reception Backdrop Florals', priceRange: [15000, 42000], desc: 'Floral backdrop design for photo opportunities' },
    { title: 'Hanging Floral Decor', priceRange: [12000, 35000], desc: 'Suspended floral arrangements for ceiling decoration' }
  ],
  Beauty: [
    { title: 'Bridal Hair & Makeup', priceRange: [8000, 22000], desc: 'Professional bridal hair styling and makeup application' },
    { title: 'Entourage Makeup Service', priceRange: [12000, 32000], desc: 'Hair and makeup for bridesmaids and mothers' },
    { title: 'Pre-Wedding Trial Session', priceRange: [3000, 8000], desc: 'Makeup and hair trial session before the big day' },
    { title: 'Airbrush Makeup Package', priceRange: [10000, 25000], desc: 'Long-lasting airbrush makeup for flawless photos' },
    { title: 'On-Site Touch-up Service', priceRange: [5000, 12000], desc: 'Touch-up service throughout the wedding day' },
    { title: 'Bridal Hair Accessories & Styling', priceRange: [6000, 15000], desc: 'Custom hair accessories and professional styling' },
    { title: 'Groom Grooming Service', priceRange: [2500, 6000], desc: 'Grooming and styling service for the groom' },
    { title: 'Pre-Wedding Beauty Package', priceRange: [12000, 28000], desc: 'Skin prep and beauty treatments before the wedding' },
    { title: 'False Lashes Application', priceRange: [1500, 4000], desc: 'Professional application of premium false lashes' },
    { title: 'Bridal Manicure & Pedicure', priceRange: [2000, 5000], desc: 'Complete nail care and beautification service' }
  ],
  Catering: [
    { title: 'Buffet Catering Package', priceRange: [350, 650], desc: 'Complete buffet catering service per person' },
    { title: 'Plated Dinner Service', priceRange: [400, 750], desc: 'Elegant plated dinner service per person' },
    { title: 'Cocktail Reception Package', priceRange: [250, 450], desc: 'Cocktail hour catering with appetizers and drinks per person' },
    { title: 'Dessert Bar Package', priceRange: [150, 350], desc: 'Customized dessert bar with various sweet treats per person' },
    { title: 'Filipino Fiesta Package', priceRange: [320, 580], desc: 'Traditional Filipino dishes buffet package per person' },
    { title: 'International Cuisine Buffet', priceRange: [420, 780], desc: 'Diverse international menu buffet service per person' },
    { title: 'BBQ & Grill Station', priceRange: [380, 650], desc: 'Live grilling station with premium meats per person' },
    { title: 'Seafood Station Package', priceRange: [450, 850], desc: 'Fresh seafood station with various preparations per person' },
    { title: 'Kids Meal Package', priceRange: [180, 320], desc: 'Special children-friendly menu package per child' },
    { title: 'Vegan/Vegetarian Package', priceRange: [280, 520], desc: 'Plant-based menu options per person' }
  ],
  Music: [
    { title: 'Live Band Performance', priceRange: [25000, 65000], desc: '4-5 piece band for ceremony and reception' },
    { title: 'Professional DJ Service', priceRange: [15000, 35000], desc: 'Professional DJ with sound system and lighting' },
    { title: 'Acoustic Band Package', priceRange: [18000, 42000], desc: '2-3 piece acoustic band for intimate settings' },
    { title: 'String Quartet Performance', priceRange: [20000, 48000], desc: 'Classical string quartet for ceremony' },
    { title: 'DJ + Live Band Combo', priceRange: [35000, 75000], desc: 'Combined DJ and live band entertainment' },
    { title: 'Solo Singer Performance', priceRange: [8000, 18000], desc: 'Professional solo singer for ceremony or cocktails' },
    { title: 'Sound System Rental', priceRange: [12000, 28000], desc: 'Professional sound system and equipment rental' },
    { title: 'LED Dance Floor Rental', priceRange: [15000, 35000], desc: 'Interactive LED dance floor for reception' },
    { title: 'Photo Booth with Props', priceRange: [10000, 22000], desc: 'Fun photo booth with unlimited prints and props' },
    { title: 'Karaoke Setup Package', priceRange: [8000, 16000], desc: 'Complete karaoke system for guest entertainment' }
  ],
  Officiant: [
    { title: 'Catholic Wedding Ceremony', priceRange: [15000, 35000], desc: 'Traditional Catholic wedding ceremony officiation' },
    { title: 'Civil Wedding Ceremony', priceRange: [8000, 18000], desc: 'Legal civil wedding ceremony officiation' },
    { title: 'Garden Wedding Ceremony', priceRange: [12000, 28000], desc: 'Outdoor garden ceremony officiation' },
    { title: 'Non-Denominational Ceremony', priceRange: [10000, 22000], desc: 'Personalized non-denominational ceremony' },
    { title: 'Beach Wedding Ceremony', priceRange: [12000, 28000], desc: 'Romantic beach ceremony officiation' },
    { title: 'Vow Renewal Ceremony', priceRange: [8000, 16000], desc: 'Special vow renewal ceremony service' },
    { title: 'Pre-Marriage Counseling', priceRange: [5000, 12000], desc: 'Professional pre-marriage counseling sessions' },
    { title: 'Bilingual Ceremony Service', priceRange: [12000, 25000], desc: 'Ceremony conducted in two languages' },
    { title: 'Customized Ceremony Script', priceRange: [6000, 14000], desc: 'Personalized ceremony script writing service' },
    { title: 'Intimate Elopement Package', priceRange: [8000, 18000], desc: 'Simple and intimate elopement ceremony' }
  ],
  Venue: [
    { title: 'Garden Venue Package', priceRange: [45000, 95000], desc: 'Beautiful garden venue with reception area' },
    { title: 'Beach Resort Venue', priceRange: [55000, 125000], desc: 'Exclusive beach resort venue rental' },
    { title: 'Hotel Ballroom Package', priceRange: [65000, 145000], desc: 'Elegant hotel ballroom with complete amenities' },
    { title: 'Function Hall Rental', priceRange: [35000, 75000], desc: 'Air-conditioned function hall for 100-200 guests' },
    { title: 'Church & Reception Combo', priceRange: [50000, 110000], desc: 'Church ceremony with adjacent reception venue' },
    { title: 'Farm/Barn Venue Package', priceRange: [40000, 85000], desc: 'Rustic farm or barn venue rental' },
    { title: 'Rooftop Venue Package', priceRange: [48000, 98000], desc: 'Modern rooftop venue with city views' },
    { title: 'Private Estate Rental', priceRange: [75000, 185000], desc: 'Exclusive private estate for intimate weddings' },
    { title: 'Ancestral House Venue', priceRange: [35000, 75000], desc: 'Historic ancestral house for traditional weddings' },
    { title: 'Pavilion & Garden Combo', priceRange: [42000, 88000], desc: 'Covered pavilion with garden ceremony area' }
  ],
  Rentals: [
    { title: 'Table & Chair Package', priceRange: [25000, 55000], desc: 'Complete tables and chairs for 100-200 guests' },
    { title: 'Table Linen & Napkins', priceRange: [12000, 28000], desc: 'Premium table linens and napkins rental' },
    { title: 'Centerpiece & Decor Rental', priceRange: [15000, 35000], desc: 'Decorative centerpieces and table decor' },
    { title: 'Lighting Package Rental', priceRange: [18000, 42000], desc: 'Ambient and decorative lighting rental' },
    { title: 'Tent & Canopy Rental', priceRange: [22000, 52000], desc: 'Large tents and canopies for outdoor events' },
    { title: 'Stage & Backdrop Rental', priceRange: [15000, 35000], desc: 'Event stage and decorative backdrop' },
    { title: 'Dance Floor Rental', priceRange: [12000, 28000], desc: 'Portable dance floor for reception' },
    { title: 'Glassware & Flatware Package', priceRange: [8000, 18000], desc: 'Complete dining service rental for guests' },
    { title: 'Lounge Furniture Package', priceRange: [18000, 42000], desc: 'Elegant lounge furniture for cocktail area' },
    { title: 'Ceremony Arch Rental', priceRange: [6000, 14000], desc: 'Decorative ceremony arch or arbor rental' }
  ],
  Cake: [
    { title: '3-Tier Wedding Cake', priceRange: [8000, 22000], desc: 'Elegant 3-tier custom wedding cake design' },
    { title: '5-Tier Masterpiece Cake', priceRange: [15000, 42000], desc: 'Grand 5-tier wedding cake with intricate design' },
    { title: 'Cupcake Tower Package', priceRange: [6000, 15000], desc: 'Multi-tier cupcake display for 100-150 guests' },
    { title: 'Dessert Table Package', priceRange: [12000, 32000], desc: 'Complete dessert table with various sweets' },
    { title: 'Naked Cake Design', priceRange: [7000, 18000], desc: 'Trendy naked cake with fresh fruits and flowers' },
    { title: 'Fondant Cake Creation', priceRange: [12000, 35000], desc: 'Smooth fondant-covered cake with custom design' },
    { title: 'Buttercream Floral Cake', priceRange: [9000, 24000], desc: 'Cake decorated with beautiful buttercream flowers' },
    { title: 'Groom\'s Cake Package', priceRange: [5000, 12000], desc: 'Special themed cake for the groom' },
    { title: 'Miniature Cake Favors', priceRange: [8000, 18000], desc: 'Individual miniature cakes as guest favors' },
    { title: 'Cake Tasting Session', priceRange: [2000, 5000], desc: 'Private cake tasting and consultation' }
  ],
  Fashion: [
    { title: 'Custom Wedding Gown Design', priceRange: [35000, 95000], desc: 'Fully customized wedding gown design and creation' },
    { title: 'Bridal Gown Rental Package', priceRange: [15000, 38000], desc: 'Designer wedding gown rental with alterations' },
    { title: 'Groom Suit Tailoring', priceRange: [12000, 32000], desc: 'Custom tailored suit for the groom' },
    { title: 'Bridesmaid Dress Design', priceRange: [8000, 18000], desc: 'Matching bridesmaid dress design per piece' },
    { title: 'Barong Tagalog Custom Made', priceRange: [8000, 22000], desc: 'Traditional Filipino barong custom tailoring' },
    { title: 'Pre-Wedding Outfit Package', priceRange: [12000, 28000], desc: 'Complete outfits for prenuptial shoot' },
    { title: 'Reception Dress Design', priceRange: [18000, 45000], desc: 'Second dress for reception and dancing' },
    { title: 'Gown Alteration Service', priceRange: [3000, 8000], desc: 'Professional gown fitting and alterations' },
    { title: 'Veil & Accessories Package', priceRange: [5000, 15000], desc: 'Bridal veil and matching accessories' },
    { title: 'Entourage Attire Coordination', priceRange: [15000, 35000], desc: 'Complete entourage outfit coordination' }
  ],
  Security: [
    { title: 'Professional Security Team', priceRange: [15000, 35000], desc: 'Professional security personnel for wedding day' },
    { title: 'VIP Security Package', priceRange: [22000, 52000], desc: 'Enhanced security for high-profile weddings' },
    { title: 'Parking Management Service', priceRange: [8000, 18000], desc: 'Professional parking attendants and management' },
    { title: 'Guest List Management', priceRange: [6000, 14000], desc: 'Check-in and guest list verification service' },
    { title: 'Event Marshalling Service', priceRange: [10000, 22000], desc: 'Professional event marshals and ushers' },
    { title: 'Bag Check Service', priceRange: [5000, 12000], desc: 'Secure bag check and storage facility' },
    { title: 'CCTV Monitoring Package', priceRange: [8000, 18000], desc: 'Temporary CCTV surveillance setup' },
    { title: 'Fire Safety Personnel', priceRange: [6000, 14000], desc: 'Licensed fire safety personnel on standby' },
    { title: 'First Aid Station Service', priceRange: [5000, 12000], desc: 'Medical first aid station with trained staff' },
    { title: 'Lost & Found Management', priceRange: [4000, 9000], desc: 'Professional lost and found service' }
  ],
  AV_Equipment: [
    { title: 'Complete Sound System', priceRange: [18000, 42000], desc: 'Professional sound system with speakers and mixers' },
    { title: 'LED Screen Rental', priceRange: [22000, 52000], desc: 'Large LED screen for presentations and videos' },
    { title: 'Projector & Screen Package', priceRange: [12000, 28000], desc: 'Projector and screen rental for AVP' },
    { title: 'Wireless Microphone Set', priceRange: [6000, 14000], desc: 'Multiple wireless microphones for ceremony' },
    { title: 'Uplighting Package', priceRange: [15000, 35000], desc: 'Decorative uplighting for venue ambiance' },
    { title: 'DJ Equipment Rental', priceRange: [12000, 28000], desc: 'Complete DJ equipment and controllers' },
    { title: 'Spotlight Package', priceRange: [8000, 18000], desc: 'Moving spotlights for special moments' },
    { title: 'Video Camera Setup', priceRange: [15000, 35000], desc: 'Professional video camera equipment rental' },
    { title: 'Stage Lighting Package', priceRange: [18000, 42000], desc: 'Complete stage lighting and effects' },
    { title: 'Live Streaming Equipment', priceRange: [20000, 45000], desc: 'Professional live streaming setup' }
  ],
  Stationery: [
    { title: 'Custom Wedding Invitations', priceRange: [8000, 22000], desc: 'Personalized wedding invitations for 100-150 guests' },
    { title: 'Save the Date Cards', priceRange: [5000, 12000], desc: 'Elegant save the date cards with envelopes' },
    { title: 'Wedding Program Design', priceRange: [4000, 10000], desc: 'Custom designed ceremony program booklets' },
    { title: 'Table Number Cards', priceRange: [2000, 5000], desc: 'Stylish table number cards and stands' },
    { title: 'Place Card & Menu Package', priceRange: [6000, 14000], desc: 'Personalized place cards and menu cards' },
    { title: 'Thank You Card Set', priceRange: [5000, 12000], desc: 'Custom thank you cards for guests' },
    { title: 'Acrylic Signage Package', priceRange: [8000, 18000], desc: 'Modern acrylic welcome and directional signs' },
    { title: 'Wedding Guestbook Design', priceRange: [3000, 8000], desc: 'Beautiful custom guestbook for signatures' },
    { title: 'Envelope Addressing Service', priceRange: [4000, 9000], desc: 'Professional calligraphy envelope addressing' },
    { title: 'Complete Stationery Suite', priceRange: [15000, 38000], desc: 'Full stationery package from invites to thank you cards' }
  ],
  Transport: [
    { title: 'Luxury Bridal Car Rental', priceRange: [12000, 32000], desc: 'Luxury car rental for bride and groom' },
    { title: 'Entourage Van Package', priceRange: [15000, 35000], desc: 'Comfortable van transportation for entourage' },
    { title: 'Vintage Car Rental', priceRange: [18000, 42000], desc: 'Classic vintage car for romantic arrivals' },
    { title: 'Coaster Bus Rental', priceRange: [18000, 38000], desc: 'Air-conditioned bus for guest transportation' },
    { title: 'Multi-Cab Guest Shuttle', priceRange: [8000, 18000], desc: 'Multiple shuttle trips for guest convenience' },
    { title: 'Limousine Service Package', priceRange: [25000, 55000], desc: 'Premium limousine service with champagne' },
    { title: 'Classic VW Beetle Rental', priceRange: [15000, 32000], desc: 'Cute vintage Volkswagen Beetle rental' },
    { title: 'Motorcycle Escort Service', priceRange: [6000, 14000], desc: 'Professional motorcycle escort team' },
    { title: 'Horse & Carriage Rental', priceRange: [20000, 45000], desc: 'Romantic horse-drawn carriage service' },
    { title: 'Airport Transfer Package', priceRange: [8000, 18000], desc: 'Airport pickup and transfer for guests' }
  ]
};

async function populateMultipleServices() {
  try {
    console.log('🚀 Starting comprehensive service population...\n');

    // Get all active vendors
    const vendors = await sql`
      SELECT id, business_name, business_type 
      FROM vendors 
      ORDER BY id
    `;

    console.log(`📊 Found ${vendors.length} vendors\n`);

    let totalCreated = 0;
    let totalSkipped = 0;

    // For each category, create 10 services using random vendors
    for (const category of categories) {
      console.log(`\n📂 Processing category: ${category}`);
      
      const templates = serviceTemplates[category];
      
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        const vendor = vendors[i % vendors.length]; // Cycle through vendors
        
        const serviceId = `SRV-${category.toUpperCase().substring(0, 3)}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        
        const minPrice = template.priceRange[0];
        const maxPrice = template.priceRange[1];
        const avgPrice = Math.floor((minPrice + maxPrice) / 2);
        
        try {
          await sql`
            INSERT INTO services (
              id, vendor_id, title, description, category, 
              price, max_price, price_range, 
              location, is_active, featured,
              years_in_business, service_tier,
              created_at, updated_at
            ) VALUES (
              ${serviceId},
              ${vendor.id},
              ${template.title},
              ${template.desc},
              ${category},
              ${avgPrice},
              ${maxPrice},
              ${`₱${minPrice.toLocaleString()} - ₱${maxPrice.toLocaleString()}`},
              ${'Dasmariñas City, Cavite, Philippines'},
              true,
              ${i < 3}, -- First 3 services are featured
              ${3 + Math.floor(Math.random() * 8)}, -- 3-10 years
              ${i < 4 ? 'premium' : 'standard'},
              NOW(),
              NOW()
            )
          `;
          
          totalCreated++;
          console.log(`  ✅ Created: ${template.title} (${vendor.business_name})`);
          
        } catch (error) {
          if (error.code === '23505') { // Duplicate key
            totalSkipped++;
            console.log(`  ⏭️  Skipped (duplicate): ${template.title}`);
          } else {
            console.error(`  ❌ Error creating ${template.title}:`, error.message);
          }
        }
      }
    }

    console.log(`\n\n✅ Service population complete!`);
    console.log(`📊 Total services created: ${totalCreated}`);
    console.log(`⏭️  Total services skipped: ${totalSkipped}`);

    // Show final counts by category
    const finalCounts = await sql`
      SELECT category, COUNT(*) as count
      FROM services
      WHERE is_active = true
      GROUP BY category
      ORDER BY category
    `;

    console.log('\n📈 Final service counts by category:');
    console.table(finalCounts);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

populateMultipleServices();
