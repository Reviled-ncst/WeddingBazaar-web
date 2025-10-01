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

// DEFAULT SERVICE TEMPLATES - VENDORS CAN CUSTOMIZE PRICES
const DEFAULT_QUOTE_TEMPLATES: Record<string, QuoteTemplate> = {
  'Photography': {
    serviceType: 'Photography',
    items: [
      // Core Photography Services
      {
        name: 'Wedding Day Photography (Full Day - 8 hours)',
        description: 'Complete wedding coverage from bridal prep to reception including ceremony, portraits, family photos, and candid moments',
        quantity: 1,
        unitPrice: 15000, // Default - vendors can customize
        category: 'Core Photography Services'
      },
      {
        name: 'Pre-Wedding Engagement Session (2 hours)',
        description: 'Romantic engagement photoshoot at 1-2 locations with 30+ edited photos and online gallery',
        quantity: 1,
        unitPrice: 6000,
        category: 'Pre-Wedding Services'
      },
      {
        name: 'Bridal Portraits Session (1 hour)',
        description: 'Solo bridal portraits in wedding dress with professional lighting and posing guidance',
        quantity: 1,
        unitPrice: 3000,
        category: 'Pre-Wedding Services'
      },
      // Equipment and Technical
      {
        name: 'Professional Camera Equipment Package',
        description: 'DSLR/Mirrorless cameras, 24-70mm lens, 50mm lens, flash systems, and backup equipment',
        quantity: 1,
        unitPrice: 3000,
        category: 'Equipment & Technical'
      },
      {
        name: 'Backup Equipment & Insurance',
        description: 'Redundant camera systems, memory cards, batteries, and equipment insurance coverage',
        quantity: 1,
        unitPrice: 2000,
        category: 'Equipment & Technical'
      },
      // Post-Production Services
      {
        name: 'Professional Photo Editing & Retouching',
        description: 'Color correction, exposure adjustment, artistic enhancement for 200-300 images',
        quantity: 1,
        unitPrice: 5000,
        category: 'Post-Production Services'
      },
      {
        name: 'Rush Processing (7-day delivery)',
        description: 'Expedited editing and delivery within 7 days instead of standard 21 days',
        quantity: 1,
        unitPrice: 3000,
        category: 'Post-Production Services'
      },
      {
        name: 'Advanced Retouching (20 images)',
        description: 'Detailed skin retouching, blemish removal, and artistic enhancement for key photos',
        quantity: 1,
        unitPrice: 2000,
        category: 'Post-Production Services'
      },
      // Deliverables
      {
        name: 'Premium Online Gallery',
        description: 'Private online gallery with download rights, social sharing, and print ordering',
        quantity: 1,
        unitPrice: 1500,
        category: 'Digital Deliverables'
      },
      {
        name: 'USB Drive with All Photos',
        description: 'Elegant USB drive with full resolution edited photos and print release',
        quantity: 1,
        unitPrice: 1000,
        category: 'Digital Deliverables'
      },
      {
        name: 'Wedding Album - Premium (30 pages)',
        description: 'High-quality photo album with lay-flat pages and custom design',
        quantity: 1,
        unitPrice: 8000,
        category: 'Physical Products'
      },
      {
        name: 'Parent Albums (2 copies, 20 pages each)',
        description: 'Matching parent albums with selected highlights from the wedding',
        quantity: 2,
        unitPrice: 2500,
        category: 'Physical Products'
      },
      {
        name: 'Canvas Wall Art (16x20 inches)',
        description: 'High-quality canvas print of your favorite wedding moment',
        quantity: 1,
        unitPrice: 2000,
        category: 'Physical Products'
      },
      // Additional Services
      {
        name: 'Second Photographer',
        description: 'Additional photographer for dual perspective coverage and larger events',
        quantity: 1,
        unitPrice: 8000,
        category: 'Additional Services'
      },
      {
        name: 'Photo Booth Setup',
        description: 'DIY photo booth with props, backdrop, and instant printing station',
        quantity: 1,
        unitPrice: 5000,
        category: 'Additional Services'
      },
      {
        name: 'Drone Photography (if venue permits)',
        description: 'Aerial shots of venue and ceremony with licensed drone pilot',
        quantity: 1,
        unitPrice: 5000,
        category: 'Specialty Services'
      }
    ]
  },
  'Videography': {
    serviceType: 'Videography',
    items: [
      // Core Video Services
      {
        name: 'Wedding Day Videography (Full Day)',
        description: 'Complete ceremony and reception filming with professional cinema cameras',
        quantity: 1,
        unitPrice: 20000,
        category: 'Core Video Services'
      },
      {
        name: 'Highlight Reel (3-5 minutes)',
        description: 'Cinematic wedding highlight video with music, color grading, and storytelling',
        quantity: 1,
        unitPrice: 8000,
        category: 'Video Production'
      },
      {
        name: 'Full Ceremony Recording',
        description: 'Complete unedited ceremony footage from multiple angles',
        quantity: 1,
        unitPrice: 5000,
        category: 'Video Production'
      },
      {
        name: 'Reception Speeches & Toasts',
        description: 'Professional audio recording and editing of all speeches and important moments',
        quantity: 1,
        unitPrice: 3000,
        category: 'Video Production'
      },
      // Pre-Wedding Content
      {
        name: 'Engagement Video Session',
        description: 'Pre-wedding video shoot with couple interview and romantic footage',
        quantity: 1,
        unitPrice: 6000,
        category: 'Pre-Wedding Content'
      },
      {
        name: 'Save the Date Video',
        description: 'Short promotional video for wedding announcements and social media',
        quantity: 1,
        unitPrice: 4000,
        category: 'Pre-Wedding Content'
      },
      // Technical Equipment
      {
        name: 'Professional Cinema Cameras',
        description: 'Sony FX6/Canon C70 cameras with cinema lenses and stabilization',
        quantity: 1,
        unitPrice: 5000,
        category: 'Equipment & Technical'
      },
      {
        name: 'Professional Audio Recording',
        description: 'Wireless lapel mics, boom mics, and audio mixing equipment',
        quantity: 1,
        unitPrice: 3000,
        category: 'Equipment & Technical'
      },
      {
        name: 'Drone Videography',
        description: 'Aerial wedding footage with licensed pilot and cinema-grade drone',
        quantity: 1,
        unitPrice: 8000,
        category: 'Specialty Services'
      },
      // Post-Production
      {
        name: 'Professional Video Editing',
        description: 'Color grading, audio mixing, motion graphics, and storytelling editing',
        quantity: 1,
        unitPrice: 7000,
        category: 'Post-Production'
      },
      {
        name: 'Custom Motion Graphics',
        description: 'Personalized title cards, wedding date graphics, and transitions',
        quantity: 1,
        unitPrice: 4000,
        category: 'Post-Production'
      },
      // Deliverables
      {
        name: 'Digital Video Package',
        description: 'All videos delivered via secure online platform with download rights',
        quantity: 1,
        unitPrice: 2000,
        category: 'Digital Deliverables'
      },
      {
        name: 'Blu-ray/DVD Package',
        description: 'Physical media with custom cases and artwork',
        quantity: 1,
        unitPrice: 2500,
        category: 'Physical Deliverables'
      }
    ]
  },
  'DJ': {
    serviceType: 'DJ & Sound',
    items: [
      // Core DJ Services
      {
        name: 'Professional DJ Services (8 hours)',
        description: 'Experienced wedding DJ with music mixing, announcements, and timeline coordination',
        quantity: 1,
        unitPrice: 15000,
        category: 'DJ Services'
      },
      {
        name: 'Pre-Event Music Consultation (2 hours)',
        description: 'Detailed planning session for song selection, special requests, and timeline creation',
        quantity: 1,
        unitPrice: 3000,
        category: 'DJ Services'
      },
      {
        name: 'Ceremony Music & Sound',
        description: 'Separate sound system for ceremony with processional, recessional, and ambient music',
        quantity: 1,
        unitPrice: 5000,
        category: 'DJ Services'
      },
      {
        name: 'Cocktail Hour Background Music',
        description: 'Curated playlist and sound management during cocktail reception',
        quantity: 1,
        unitPrice: 3000,
        category: 'DJ Services'
      },
      // Sound Equipment
      {
        name: 'Professional PA Sound System',
        description: 'Line array speakers, subwoofers, and mixing console for up to 200 guests',
        quantity: 1,
        unitPrice: 8000,
        category: 'Sound Equipment'
      },
      {
        name: 'Wireless Microphone Package',
        description: '4 wireless mics (handheld, lapel, headset) with backup batteries',
        quantity: 1,
        unitPrice: 5000,
        category: 'Sound Equipment'
      },
      {
        name: 'Additional Speaker Zones',
        description: 'Extended sound coverage for multiple areas (garden, balcony, etc.)',
        quantity: 1,
        unitPrice: 6000,
        category: 'Sound Equipment'
      },
      // Lighting Services
      {
        name: 'Dance Floor Lighting Package',
        description: 'LED wash lights, moving heads, and disco ball for dance floor atmosphere',
        quantity: 1,
        unitPrice: 4000,
        category: 'Lighting Services'
      },
      {
        name: 'Ambient Uplighting',
        description: 'Colored LED uplights around venue perimeter to match wedding colors',
        quantity: 12,
        unitPrice: 300,
        category: 'Lighting Services'
      },
      {
        name: 'Intelligent Lighting Control',
        description: 'DMX-controlled lighting with preprogrammed scenes and live control',
        quantity: 1,
        unitPrice: 3000,
        category: 'Lighting Services'
      },
      {
        name: 'Outdoor String Lighting',
        description: 'Bistro lights and fairy lights for outdoor ceremony and reception areas',
        quantity: 1,
        unitPrice: 2500,
        category: 'Lighting Services'
      },
      // Entertainment Add-ons
      {
        name: 'Live Band Coordination',
        description: 'Sound engineering and coordination for live band performance',
        quantity: 1,
        unitPrice: 8000,
        category: 'Entertainment Services'
      },
      {
        name: 'Karaoke Setup',
        description: 'Professional karaoke system with song database and video display',
        quantity: 1,
        unitPrice: 5000,
        category: 'Entertainment Services'
      },
      // Technical Services
      {
        name: 'Setup and Sound Check',
        description: 'Early setup, sound testing, and technical rehearsal',
        quantity: 1,
        unitPrice: 4000,
        category: 'Technical Services'
      },
      {
        name: 'Backup Equipment Package',
        description: 'Redundant sound system and emergency equipment for guaranteed performance',
        quantity: 1,
        unitPrice: 3000,
        category: 'Technical Services'
      },
      {
        name: 'Extended Reception Hours',
        description: 'Additional DJ and sound services beyond standard 8-hour package',
        quantity: 2,
        unitPrice: 2000,
        category: 'Additional Services'
      }
    ]
  },
  'Catering': {
    serviceType: 'Catering Services',
    items: [
      // Menu Packages
      {
        name: 'Premium Plated Dinner Service',
        description: '4-course dinner: appetizer, soup, choice of 3 entrees, dessert with premium ingredients',
        quantity: 100,
        unitPrice: 600,
        category: 'Main Dining Service'
      },
      {
        name: 'Cocktail Hour Premium Package',
        description: 'Passed hors d\'oeuvres, artisan cheese board, seafood station, and signature appetizers',
        quantity: 100,
        unitPrice: 250,
        category: 'Cocktail Reception'
      },
      {
        name: 'Late Night Snack Station',
        description: 'Mini burgers, pizza bites, comfort food station for dancing guests',
        quantity: 100,
        unitPrice: 120,
        category: 'Additional Food Service'
      },
      // Beverage Services
      {
        name: 'Premium Open Bar (6 hours)',
        description: 'Top-shelf liquors, craft beer, wine selection, and signature cocktails',
        quantity: 1,
        unitPrice: 25000,
        category: 'Beverage Service'
      },
      {
        name: 'Wine Pairing with Dinner',
        description: 'Sommelier-selected wines paired with each dinner course',
        quantity: 100,
        unitPrice: 80,
        category: 'Beverage Service'
      },
      {
        name: 'Champagne Toast Service',
        description: 'Premium champagne service for wedding toasts and celebration',
        quantity: 100,
        unitPrice: 60,
        category: 'Beverage Service'
      },
      {
        name: 'Coffee and Dessert Bar',
        description: 'Espresso station, specialty coffees, and dessert accompaniments',
        quantity: 1,
        unitPrice: 8000,
        category: 'Beverage Service'
      },
      // Specialty Stations
      {
        name: 'Live Cooking Station - Pasta',
        description: 'Chef-attended fresh pasta station with multiple sauces and toppings',
        quantity: 1,
        unitPrice: 12000,
        category: 'Interactive Food Stations'
      },
      {
        name: 'Carving Station - Prime Rib',
        description: 'Chef-carved prime rib with horseradish cream and au jus',
        quantity: 1,
        unitPrice: 15000,
        category: 'Interactive Food Stations'
      },
      {
        name: 'Sushi and Sashimi Bar',
        description: 'Fresh sushi preparation with premium fish and vegetarian options',
        quantity: 1,
        unitPrice: 18000,
        category: 'Interactive Food Stations'
      },
      // Wedding Cake & Desserts
      {
        name: 'Custom Wedding Cake (3-tier)',
        description: 'Artisan wedding cake with custom design, premium ingredients, and cake tasting',
        quantity: 1,
        unitPrice: 12000,
        category: 'Wedding Cake & Desserts'
      },
      {
        name: 'Dessert Table Assortment',
        description: 'Mini desserts, macarons, chocolate fountain, and seasonal fruit display',
        quantity: 1,
        unitPrice: 8000,
        category: 'Wedding Cake & Desserts'
      },
      {
        name: 'Groom\'s Cake',
        description: 'Custom groom\'s cake reflecting his interests or hobbies',
        quantity: 1,
        unitPrice: 5000,
        category: 'Wedding Cake & Desserts'
      },
      // Service Staff
      {
        name: 'Professional Wait Staff',
        description: 'Experienced servers for cocktail and dinner service (1 server per 12 guests)',
        quantity: 8,
        unitPrice: 2000,
        category: 'Service Staff'
      },
      {
        name: 'Bartender Services',
        description: 'Professional bartenders for cocktail preparation and bar service',
        quantity: 2,
        unitPrice: 3000,
        category: 'Service Staff'
      },
      {
        name: 'Event Coordinator',
        description: 'On-site catering coordinator for timeline management and service oversight',
        quantity: 1,
        unitPrice: 4000,
        category: 'Service Staff'
      },
      {
        name: 'Cleanup and Breakdown Crew',
        description: 'Complete cleanup, dishware collection, and venue restoration',
        quantity: 4,
        unitPrice: 1500,
        category: 'Service Staff'
      },
      // Equipment and Setup
      {
        name: 'Premium Table Linens and Settings',
        description: 'High-quality linens, charger plates, glassware, and silverware for 100 guests',
        quantity: 12,
        unitPrice: 800,
        category: 'Table Service & Equipment'
      },
      {
        name: 'Centerpiece Coordination',
        description: 'Coordination with florist for food-safe centerpieces and table styling',
        quantity: 12,
        unitPrice: 400,
        category: 'Table Service & Equipment'
      },
      {
        name: 'Kitchen Equipment Rental',
        description: 'Additional cooking equipment, warming stations, and refrigeration if needed',
        quantity: 1,
        unitPrice: 8000,
        category: 'Table Service & Equipment'
      }
    ]
  },
  'Wedding Planning': {
    serviceType: 'Wedding Planning',
    items: [
      // Full Planning Services
      {
        name: 'Complete Wedding Planning (12 months)',
        description: 'Full-service planning from engagement to wedding day including vendor sourcing and coordination',
        quantity: 1,
        unitPrice: 60000,
        category: 'Full Planning Services'
      },
      {
        name: 'Partial Planning (6 months)',
        description: 'Planning assistance for final 6 months including vendor coordination and timeline creation',
        quantity: 1,
        unitPrice: 40000,
        category: 'Full Planning Services'
      },
      {
        name: 'Day-of Coordination',
        description: 'Wedding day management, vendor coordination, and timeline execution',
        quantity: 1,
        unitPrice: 20000,
        category: 'Day-of Services'
      },
      // Vendor Management
      {
        name: 'Vendor Research and Sourcing',
        description: 'Research, vetting, and recommendation of wedding vendors across all categories',
        quantity: 1,
        unitPrice: 15000,
        category: 'Vendor Management'
      },
      {
        name: 'Contract Review and Negotiation',
        description: 'Professional review of vendor contracts and price negotiation',
        quantity: 1,
        unitPrice: 8000,
        category: 'Vendor Management'
      },
      {
        name: 'Vendor Coordination Meetings',
        description: 'Monthly vendor coordination meetings and communication management',
        quantity: 6,
        unitPrice: 2000,
        category: 'Vendor Management'
      },
      // Design and Styling
      {
        name: 'Wedding Design Consultation',
        description: 'Complete design concept development including color scheme, style, and theme',
        quantity: 1,
        unitPrice: 12000,
        category: 'Design & Styling'
      },
      {
        name: 'Venue Layout and Floor Planning',
        description: 'Detailed floor plans for ceremony and reception with optimal guest flow',
        quantity: 1,
        unitPrice: 6000,
        category: 'Design & Styling'
      },
      {
        name: 'Decor Styling and Setup Coordination',
        description: 'Coordination of all decorative elements and setup timeline management',
        quantity: 1,
        unitPrice: 8000,
        category: 'Design & Styling'
      },
      // Planning Tools and Documentation
      {
        name: 'Comprehensive Wedding Timeline',
        description: 'Detailed day-of timeline with vendor arrival times and activity schedules',
        quantity: 1,
        unitPrice: 5000,
        category: 'Planning Documentation'
      },
      {
        name: 'Budget Creation and Management',
        description: 'Wedding budget development, tracking, and cost optimization strategies',
        quantity: 1,
        unitPrice: 6000,
        category: 'Planning Documentation'
      },
      {
        name: 'Guest Management System',
        description: 'RSVP tracking, seating charts, and guest communication management',
        quantity: 1,
        unitPrice: 4000,
        category: 'Planning Documentation'
      },
      {
        name: 'Wedding Planning Binder',
        description: 'Complete wedding binder with contracts, timelines, contact lists, and emergency plans',
        quantity: 1,
        unitPrice: 3000,
        category: 'Planning Documentation'
      },
      // Specialized Services
      {
        name: 'Rehearsal Coordination',
        description: 'Wedding rehearsal planning and coordination with wedding party',
        quantity: 1,
        unitPrice: 5000,
        category: 'Specialized Services'
      },
      {
        name: 'Wedding Day Emergency Kit',
        description: 'Comprehensive emergency supplies for wedding day contingencies',
        quantity: 1,
        unitPrice: 3000,
        category: 'Specialized Services'
      },
      {
        name: 'Transportation Coordination',
        description: 'Wedding party and family transportation planning and coordination',
        quantity: 1,
        unitPrice: 4000,
        category: 'Specialized Services'
      },
      {
        name: 'Destination Wedding Coordination',
        description: 'Additional coordination for out-of-town weddings including travel and accommodation',
        quantity: 1,
        unitPrice: 25000,
        category: 'Specialized Services'
      },
      // Post-Wedding Services
      {
        name: 'Gift and Card Management',
        description: 'Wedding gift collection, cataloging, and thank you note coordination',
        quantity: 1,
        unitPrice: 3000,
        category: 'Post-Wedding Services'
      },
      {
        name: 'Vendor Payment Coordination',
        description: 'Final vendor payment processing and contract closeout',
        quantity: 1,
        unitPrice: 2000,
        category: 'Post-Wedding Services'
      },
      {
        name: 'Wedding Dress Preservation Coordination',
        description: 'Coordination of wedding dress cleaning and preservation services',
        quantity: 1,
        unitPrice: 1500,
        category: 'Post-Wedding Services'
      }
    ]
  },
  'Hair & Makeup': {
    serviceType: 'Hair & Makeup',
    items: [
      // Bridal Services
      {
        name: 'Bridal Hair Styling with Trial',
        description: 'Professional bridal hairstyling including trial session, final styling, and touch-ups',
        quantity: 1,
        unitPrice: 8000,
        category: 'Bridal Services'
      },
      {
        name: 'Bridal Makeup with Trial',
        description: 'Full bridal makeup application including trial, final application, and day-of touch-ups',
        quantity: 1,
        unitPrice: 9000,
        category: 'Bridal Services'
      },
      {
        name: 'Bridal Hair Extensions & Accessories',
        description: 'Professional hair extensions, veil placement, and hair accessory styling',
        quantity: 1,
        unitPrice: 4000,
        category: 'Bridal Services'
      },
      {
        name: 'Airbrush Makeup Application',
        description: 'Long-lasting airbrush makeup for photography and humid weather conditions',
        quantity: 1,
        unitPrice: 5000,
        category: 'Bridal Services'
      },
      // Bridesmaid Services
      {
        name: 'Bridesmaid Hair Styling',
        description: 'Professional hair styling for up to 4 bridesmaids with coordinated looks',
        quantity: 4,
        unitPrice: 2500,
        category: 'Bridesmaid Services'
      },
      {
        name: 'Bridesmaid Makeup Application',
        description: 'Makeup application for bridesmaids complementing the bridal look',
        quantity: 4,
        unitPrice: 1800,
        category: 'Bridesmaid Services'
      },
      {
        name: 'Junior Bridesmaid Services',
        description: 'Age-appropriate hair and makeup for younger bridal party members',
        quantity: 2,
        unitPrice: 1200,
        category: 'Bridesmaid Services'
      },
      // Family Services
      {
        name: 'Mother of Bride Hair & Makeup',
        description: 'Complete hair and makeup services for the mother of the bride',
        quantity: 1,
        unitPrice: 3500,
        category: 'Family Services'
      },
      {
        name: 'Mother of Groom Hair & Makeup',
        description: 'Complete hair and makeup services for the mother of the groom',
        quantity: 1,
        unitPrice: 3500,
        category: 'Family Services'
      },
      {
        name: 'Grandmother/Special Family Services',
        description: 'Hair and makeup for grandmothers and other special family members',
        quantity: 2,
        unitPrice: 2000,
        category: 'Family Services'
      },
      // Pre-Wedding Services
      {
        name: 'Engagement Session Hair & Makeup',
        description: 'Hair and makeup for engagement photoshoot with natural, camera-ready look',
        quantity: 1,
        unitPrice: 4000,
        category: 'Pre-Wedding Services'
      },
      {
        name: 'Bridal Shower Hair & Makeup',
        description: 'Hair and makeup services for bridal shower or bachelorette party',
        quantity: 1,
        unitPrice: 3000,
        category: 'Pre-Wedding Services'
      },
      {
        name: 'Rehearsal Dinner Touch-up',
        description: 'Hair and makeup touch-up services for rehearsal dinner',
        quantity: 1,
        unitPrice: 2000,
        category: 'Pre-Wedding Services'
      },
      // Travel and Setup
      {
        name: 'On-Site Mobile Service',
        description: 'Travel to venue with complete mobile salon setup and professional lighting',
        quantity: 1,
        unitPrice: 5000,
        category: 'Travel & Setup'
      },
      {
        name: 'Early Morning Start Fee',
        description: 'Additional fee for services starting before 7:00 AM',
        quantity: 1,
        unitPrice: 2000,
        category: 'Travel & Setup'
      },
      {
        name: 'Extended Travel Fee',
        description: 'Additional travel charges for venues more than 30km from base location',
        quantity: 1,
        unitPrice: 3000,
        category: 'Travel & Setup'
      },
      // Specialty Services
      {
        name: 'False Eyelash Application',
        description: 'Professional false eyelash application for enhanced eye definition',
        quantity: 1,
        unitPrice: 1200,
        category: 'Specialty Services'
      },
      {
        name: 'Tattoo Cover-up Services',
        description: 'Professional tattoo concealing for wedding photography',
        quantity: 1,
        unitPrice: 1500,
        category: 'Specialty Services'
      },
      {
        name: 'Emergency Touch-up Kit',
        description: 'Custom touch-up kit with lipstick, powder, and hair accessories for the day',
        quantity: 1,
        unitPrice: 1000,
        category: 'Specialty Services'
      }
    ]
  },
  'Florist': {
    serviceType: 'Floral Services',
    items: [
      // Bridal Flowers
      {
        name: 'Bridal Bouquet - Premium',
        description: 'Luxury bridal bouquet with premium seasonal flowers, greenery, and custom ribbon wrap',
        quantity: 1,
        unitPrice: 5000,
        category: 'Bridal Flowers'
      },
      {
        name: 'Toss Bouquet',
        description: 'Smaller version of bridal bouquet for the bouquet toss tradition',
        quantity: 1,
        unitPrice: 1500,
        category: 'Bridal Flowers'
      },
      {
        name: 'Bridal Hair Flowers',
        description: 'Fresh flower hair accessories and floral crown for the bride',
        quantity: 1,
        unitPrice: 1200,
        category: 'Bridal Flowers'
      },
      // Bridesmaid Flowers
      {
        name: 'Bridesmaid Bouquets',
        description: 'Coordinating bouquets for bridesmaids with complementary flower selection',
        quantity: 4,
        unitPrice: 1800,
        category: 'Bridal Party Flowers'
      },
      {
        name: 'Junior Bridesmaid Bouquets',
        description: 'Smaller bouquets appropriate for younger bridal party members',
        quantity: 2,
        unitPrice: 1000,
        category: 'Bridal Party Flowers'
      },
      {
        name: 'Flower Girl Petals & Accessories',
        description: 'Rose petals, flower girl basket, and floral accessories',
        quantity: 1,
        unitPrice: 800,
        category: 'Bridal Party Flowers'
      },
      // Groom's Flowers
      {
        name: 'Groom\'s Boutonniere',
        description: 'Premium boutonniere with focal flower matching bridal bouquet',
        quantity: 1,
        unitPrice: 500,
        category: 'Groom\'s Flowers'
      },
      {
        name: 'Groomsmen Boutonnieres',
        description: 'Coordinating boutonnieres for groomsmen and ring bearer',
        quantity: 6,
        unitPrice: 350,
        category: 'Groom\'s Flowers'
      },
      {
        name: 'Father & VIP Boutonnieres',
        description: 'Special boutonnieres for fathers, grandfathers, and VIP guests',
        quantity: 4,
        unitPrice: 400,
        category: 'Groom\'s Flowers'
      },
      // Ceremony Arrangements
      {
        name: 'Altar Arrangements (Large)',
        description: 'Impressive floral arrangements for ceremony altar or arch decoration',
        quantity: 2,
        unitPrice: 6000,
        category: 'Ceremony Decor'
      },
      {
        name: 'Aisle Petals & Runner',
        description: 'Rose petal aisle treatment and floral aisle markers',
        quantity: 1,
        unitPrice: 3000,
        category: 'Ceremony Decor'
      },
      {
        name: 'Ceremony Entrance Arrangements',
        description: 'Welcome arrangements for ceremony entrance and signage area',
        quantity: 2,
        unitPrice: 3000,
        category: 'Ceremony Decor'
      },
      {
        name: 'Unity Candle Arrangement',
        description: 'Floral decoration for unity candle or sand ceremony area',
        quantity: 1,
        unitPrice: 1500,
        category: 'Ceremony Decor'
      },
      // Reception Centerpieces
      {
        name: 'Reception Centerpieces - Tall',
        description: 'Elegant tall centerpieces with premium flowers and greenery',
        quantity: 6,
        unitPrice: 1800,
        category: 'Reception Decor'
      },
      {
        name: 'Reception Centerpieces - Low',
        description: 'Low profile centerpieces allowing conversation across tables',
        quantity: 6,
        unitPrice: 1400,
        category: 'Reception Decor'
      },
      {
        name: 'Sweetheart Table Arrangement',
        description: 'Special floral arrangement for bride and groom\'s sweetheart table',
        quantity: 1,
        unitPrice: 3000,
        category: 'Reception Decor'
      },
      {
        name: 'Cake Table Flowers',
        description: 'Floral decoration around wedding cake and dessert table',
        quantity: 1,
        unitPrice: 2000,
        category: 'Reception Decor'
      },
      // Additional Decor
      {
        name: 'Floral Arch or Backdrop',
        description: 'Large floral installation for ceremony or photo backdrop',
        quantity: 1,
        unitPrice: 12000,
        category: 'Special Installations'
      },
      {
        name: 'Hanging Floral Installations',
        description: 'Suspended floral arrangements for ceiling or overhead decoration',
        quantity: 4,
        unitPrice: 2500,
        category: 'Special Installations'
      },
      {
        name: 'Restroom Arrangements',
        description: 'Small floral arrangements for restroom areas and powder rooms',
        quantity: 3,
        unitPrice: 600,
        category: 'Additional Venue Decor'
      },
      // Services
      {
        name: 'Floral Design Consultation',
        description: 'Detailed consultation for floral design concept and color coordination',
        quantity: 1,
        unitPrice: 2000,
        category: 'Design Services'
      },
      {
        name: 'Setup and Installation',
        description: 'Professional setup and installation of all floral arrangements',
        quantity: 1,
        unitPrice: 6000,
        category: 'Installation Services'
      },
      {
        name: 'Breakdown and Cleanup',
        description: 'Post-event floral arrangement removal and cleanup service',
        quantity: 1,
        unitPrice: 3000,
        category: 'Installation Services'
      }
    ]
  },
  'Venue': {
    serviceType: 'Venue Services',
    items: [
      // Venue Rental
      {
        name: 'Reception Venue Rental (8 hours)',
        description: 'Beautiful reception venue rental including tables, chairs, and basic lighting for up to 150 guests',
        quantity: 1,
        unitPrice: 40000,
        category: 'Venue Rental'
      },
      {
        name: 'Ceremony Site Rental (3 hours)',
        description: 'Scenic ceremony location with seating for guests and basic sound system',
        quantity: 1,
        unitPrice: 12000,
        category: 'Venue Rental'
      },
      {
        name: 'Bridal Suite Access',
        description: 'Private bridal preparation room with mirrors, lighting, and refreshment area',
        quantity: 1,
        unitPrice: 6000,
        category: 'Venue Rental'
      },
      {
        name: 'Extended Hours Package',
        description: 'Additional venue access beyond standard rental hours',
        quantity: 2,
        unitPrice: 3000,
        category: 'Venue Rental'
      },
      // Catering Facilities
      {
        name: 'Commercial Kitchen Access',
        description: 'Full commercial kitchen facilities for catering preparation and service',
        quantity: 1,
        unitPrice: 8000,
        category: 'Catering Facilities'
      },
      {
        name: 'Bar Setup and Service',
        description: 'Professional bar area with refrigeration and glassware storage',
        quantity: 1,
        unitPrice: 5000,
        category: 'Catering Facilities'
      },
      {
        name: 'Cake Cutting Station',
        description: 'Dedicated area for cake display and cutting ceremony',
        quantity: 1,
        unitPrice: 2000,
        category: 'Catering Facilities'
      },
      // Equipment and Furnishing
      {
        name: 'Round Table Package (10 guests each)',
        description: 'Premium round tables with linens and chair covers',
        quantity: 15,
        unitPrice: 600,
        category: 'Furniture & Equipment'
      },
      {
        name: 'Ceremony Seating (150 guests)',
        description: 'Elegant ceremony chairs with cushions and aisle coordination',
        quantity: 150,
        unitPrice: 80,
        category: 'Furniture & Equipment'
      },
      {
        name: 'Dance Floor Installation',
        description: 'Professional dance floor with proper lighting and sound integration',
        quantity: 1,
        unitPrice: 10000,
        category: 'Furniture & Equipment'
      },
      {
        name: 'Staging and Platform Setup',
        description: 'Elevated platform for band, DJ, or head table',
        quantity: 1,
        unitPrice: 6000,
        category: 'Furniture & Equipment'
      },
      // Lighting and Ambiance
      {
        name: 'Ambient Lighting Package',
        description: 'Romantic lighting including string lights, uplighting, and candle stations',
        quantity: 1,
        unitPrice: 5000,
        category: 'Lighting & Ambiance'
      },
      {
        name: 'Chandelier and Accent Lighting',
        description: 'Elegant chandelier rentals and accent lighting for key areas',
        quantity: 3,
        unitPrice: 1200,
        category: 'Lighting & Ambiance'
      },
      {
        name: 'Outdoor Fire Features',
        description: 'Fire pit or fireplace rental for outdoor evening ambiance',
        quantity: 2,
        unitPrice: 1500,
        category: 'Lighting & Ambiance'
      },
      // Service and Coordination
      {
        name: 'Venue Coordinator',
        description: 'Dedicated venue coordinator for setup, timeline management, and guest assistance',
        quantity: 1,
        unitPrice: 8000,
        category: 'Service & Coordination'
      },
      {
        name: 'Security Services',
        description: 'Professional security personnel for guest safety and venue protection',
        quantity: 2,
        unitPrice: 2500,
        category: 'Service & Coordination'
      },
      {
        name: 'Valet Parking Service',
        description: 'Professional valet parking for guest convenience',
        quantity: 1,
        unitPrice: 6000,
        category: 'Service & Coordination'
      },
      {
        name: 'Cleanup and Restoration',
        description: 'Complete post-event cleanup and venue restoration to original condition',
        quantity: 1,
        unitPrice: 8000,
        category: 'Service & Coordination'
      },
      // Special Features
      {
        name: 'Garden and Landscape Enhancement',
        description: 'Temporary landscape enhancements and garden preparation for outdoor ceremonies',
        quantity: 1,
        unitPrice: 8000,
        category: 'Special Features'
      },
      {
        name: 'Water Feature Activation',
        description: 'Fountain or water feature operation and enhancement for the event',
        quantity: 1,
        unitPrice: 3000,
        category: 'Special Features'
      },
      {
        name: 'Climate Control Management',
        description: 'Professional climate control for guest comfort in all weather conditions',
        quantity: 1,
        unitPrice: 5000,
        category: 'Special Features'
      }
    ]
  },
  'default': {
    serviceType: 'General Wedding Services',
    items: [
      {
        name: 'Wedding Service Package',
        description: 'Comprehensive wedding service tailored to your specific needs and requirements',
        quantity: 1,
        unitPrice: 20000,
        category: 'Wedding Services'
      },
      {
        name: 'Professional Setup and Coordination',
        description: 'Complete professional setup, timeline management, and day-of coordination',
        quantity: 1,
        unitPrice: 20000,
        category: 'Event Services'
      },
      {
        name: 'Additional Services and Requests',
        description: 'Miscellaneous services, special requests, and custom accommodations',
        quantity: 1,
        unitPrice: 15000,
        category: 'Additional Services'
      },
      {
        name: 'Travel and Setup Fee',
        description: 'Transportation of equipment and staff to venue location',
        quantity: 1,
        unitPrice: 8000,
        category: 'Logistics'
      },
      {
        name: 'Insurance and Liability Coverage',
        description: 'Professional liability insurance and equipment protection coverage',
        quantity: 1,
        unitPrice: 5000,
        category: 'Insurance & Protection'
      }
    ]
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
                <div className="flex gap-3">
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

              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  <h4 className="font-bold text-gray-800 text-xl border-b-2 border-rose-200 pb-2">
                    {category}
                  </h4>
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
              ))}
            </div>
          </div>

          {/* Quote Summary Section */}
          <div className="w-96 bg-gradient-to-b from-gray-50 to-rose-50 p-8 overflow-y-auto border-l border-gray-200">
            <div className="space-y-6">
              {/* Pricing Summary */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-rose-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quote Summary</h3>
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
                      <span>Total</span>
                      <span className="text-rose-600">{formatPHP(total)}</span>
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
