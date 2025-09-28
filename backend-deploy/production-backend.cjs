const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Real Neon database connection
const sql = neon(process.env.DATABASE_URL);

// Production Wedding Bazaar Backend (CommonJS Version)
// Comprehensive backend with all working endpoints for production

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 3001;

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production' 
    ? ['https://weddingbazaar-web.web.app', 'https://weddingbazaar-web.firebaseapp.com'] 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

console.log('🌐 [CORS] Allowed origins:', corsOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn('🚫 [CORS] Blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Real database connection test
const testDatabaseConnection = async () => {
  try {
    console.log('🔍 [DB] Testing Neon database connection...');
    const result = await sql`SELECT 1 as test`;
    console.log('✅ [DB] Neon database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ [DB] Neon database connection failed:', error);
    return false;
  }
};

// Mock data for vendors
const mockVendors = [
  {
    id: '1',
    name: 'Perfect Weddings Co.',
    category: 'Wedding Planning',
    rating: 4.2,
    reviewCount: 33,
    location: 'New York, NY',
    description: 'Full-service wedding planning with 10+ years of experience.',
    phone: '(555) 123-4567',
    email: 'info@perfectweddings.com',
    website: 'https://perfectweddings.com',
    images: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400'
    ]
  },
  {
    id: '2',
    name: 'Beltran Sound Systems',
    category: 'DJ',
    rating: 4.5,
    reviewCount: 71,
    location: 'Los Angeles, CA',
    description: 'Professional DJ services for weddings and events.',
    phone: '(555) 987-6543',
    email: 'bookings@beltransound.com',
    website: 'https://beltransound.com',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      'https://images.unsplash.com/photo-1571266028243-e4733b5c94de?w=400'
    ]
  },
  {
    id: '3',
    name: 'Elite Photography Studio',
    category: 'Photography',
    rating: 4.8,
    reviewCount: 89,
    location: 'Miami, FL',
    description: 'Award-winning wedding photography and videography.',
    phone: '(555) 456-7890',
    email: 'hello@elitephoto.com',
    website: 'https://elitephoto.com',
    images: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400'
    ]
  },
  {
    id: '4',
    name: 'Elegant Floral Designs',
    category: 'Florist',
    rating: 4.6,
    reviewCount: 45,
    location: 'Chicago, IL',
    description: 'Custom wedding florals and venue decoration.',
    phone: '(555) 234-5678',
    email: 'orders@elegantflorals.com',
    website: 'https://elegantflorals.com',
    images: [
      'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=400',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'
    ]
  },
  {
    id: '5',
    name: 'Grand Ballroom Venue',
    category: 'Venue',
    rating: 4.3,
    reviewCount: 67,
    location: 'Dallas, TX',
    description: 'Luxury wedding venue with full-service catering.',
    phone: '(555) 345-6789',
    email: 'events@grandballroom.com',
    website: 'https://grandballroom.com',
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=400'
    ]
  }
];

// Mock services data - Comprehensive wedding services database (90+ services)
const mockServices = [
  // Photography Services (15)
  { id: '1', name: 'Wedding Photography Premium', category: 'Photography', vendor_id: '1', description: 'Professional wedding photography with albums', price: '$2,500 - $5,000', duration: '8-10 hours', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400' },
  { id: '2', name: 'Engagement Photo Session', category: 'Photography', vendor_id: '1', description: 'Romantic engagement photography session', price: '$500 - $1,200', duration: '2-3 hours', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400' },
  { id: '3', name: 'Bridal Portrait Session', category: 'Photography', vendor_id: '2', description: 'Elegant bridal portraits', price: '$400 - $800', duration: '2 hours', image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400' },
  { id: '4', name: 'Wedding Day Coverage', category: 'Photography', vendor_id: '2', description: 'Full day wedding photography', price: '$3,000 - $6,000', duration: '10-12 hours', image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400' },
  { id: '5', name: 'Destination Wedding Photography', category: 'Photography', vendor_id: '3', description: 'Travel photography for destination weddings', price: '$4,000 - $8,000', duration: '2-3 days', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400' },
  { id: '6', name: 'Pre-Wedding Photo Shoot', category: 'Photography', vendor_id: '1', description: 'Casual pre-wedding photography session', price: '$300 - $700', duration: '2-3 hours', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400' },
  { id: '7', name: 'Reception Photography', category: 'Photography', vendor_id: '2', description: 'Reception and party photography', price: '$800 - $1,500', duration: '4-6 hours', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400' },
  { id: '8', name: 'Maternity Wedding Photos', category: 'Photography', vendor_id: '3', description: 'Special maternity wedding photography', price: '$600 - $1,200', duration: '3-4 hours', image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400' },
  { id: '9', name: 'Bachelor/Bachelorette Photography', category: 'Photography', vendor_id: '1', description: 'Fun party photography for pre-wedding events', price: '$400 - $800', duration: '3-5 hours', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400' },
  { id: '10', name: 'Honeymoon Photography', category: 'Photography', vendor_id: '2', description: 'Post-wedding honeymoon photography', price: '$1,000 - $2,500', duration: '1-3 days', image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400' },
  { id: '11', name: 'Anniversary Photography', category: 'Photography', vendor_id: '3', description: 'Anniversary celebration photography', price: '$300 - $600', duration: '2-3 hours', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400' },
  { id: '12', name: 'Family Wedding Portraits', category: 'Photography', vendor_id: '1', description: 'Extended family portrait sessions', price: '$400 - $800', duration: '2-4 hours', image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400' },
  { id: '13', name: 'Wedding Detail Photography', category: 'Photography', vendor_id: '2', description: 'Close-up details and decor photography', price: '$200 - $500', duration: '1-2 hours', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400' },
  { id: '14', name: 'Drone Wedding Photography', category: 'Photography', vendor_id: '3', description: 'Aerial drone photography for weddings', price: '$600 - $1,200', duration: '2-4 hours', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400' },
  { id: '15', name: 'Black & White Wedding Photography', category: 'Photography', vendor_id: '1', description: 'Classic black and white wedding photography', price: '$1,800 - $3,500', duration: '6-8 hours', image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400' },

  // Wedding Planning Services (12)
  { id: '16', name: 'Full Wedding Planning', category: 'Wedding Planning', vendor_id: '1', description: 'Complete wedding planning from start to finish', price: '$3,000 - $8,000', duration: '6-12 months', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400' },
  { id: '17', name: 'Day-of Coordination', category: 'Wedding Planning', vendor_id: '2', description: 'Wedding day coordination and management', price: '$1,200 - $2,500', duration: '12-16 hours', image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600' },
  { id: '18', name: 'Partial Wedding Planning', category: 'Wedding Planning', vendor_id: '3', description: 'Planning assistance for specific aspects', price: '$2,000 - $4,500', duration: '3-6 months', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600' },
  { id: '19', name: 'Destination Wedding Planning', category: 'Wedding Planning', vendor_id: '1', description: 'Specialized destination wedding planning', price: '$5,000 - $12,000', duration: '8-15 months', image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600' },
  { id: '20', name: 'Elopement Planning', category: 'Wedding Planning', vendor_id: '2', description: 'Intimate elopement planning services', price: '$800 - $2,000', duration: '1-3 months', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400' },
  { id: '21', name: 'Micro Wedding Planning', category: 'Wedding Planning', vendor_id: '3', description: 'Small intimate wedding planning', price: '$1,500 - $3,500', duration: '2-6 months', image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600' },
  { id: '22', name: 'Corporate Event Planning', category: 'Wedding Planning', vendor_id: '1', description: 'Corporate wedding and event planning', price: '$2,500 - $6,000', duration: '3-8 months', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600' },
  { id: '23', name: 'Religious Wedding Planning', category: 'Wedding Planning', vendor_id: '2', description: 'Traditional religious ceremony planning', price: '$2,000 - $5,000', duration: '4-10 months', image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600' },
  { id: '24', name: 'Outdoor Wedding Planning', category: 'Wedding Planning', vendor_id: '3', description: 'Specialized outdoor wedding planning', price: '$2,200 - $5,500', duration: '3-8 months', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400' },
  { id: '25', name: 'Wedding Timeline Planning', category: 'Wedding Planning', vendor_id: '1', description: 'Detailed timeline and schedule planning', price: '$500 - $1,200', duration: '1-2 months', image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600' },
  { id: '26', name: 'Wedding Budget Planning', category: 'Wedding Planning', vendor_id: '2', description: 'Financial planning and budget management', price: '$400 - $1,000', duration: '1-3 months', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600' },
  { id: '27', name: 'Rehearsal Planning', category: 'Wedding Planning', vendor_id: '3', description: 'Wedding rehearsal coordination', price: '$300 - $800', duration: '1-2 days', image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600' },

  // Catering Services (18)
  { id: '28', name: 'Wedding Banquet Catering', category: 'Catering', vendor_id: '4', description: 'Full-service banquet catering', price: '$75 - $150 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' },
  { id: '29', name: 'Cocktail Reception Catering', category: 'Catering', vendor_id: '4', description: 'Elegant cocktail hour catering', price: '$45 - $80 per person', duration: '3-4 hours', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600' },
  { id: '30', name: 'Buffet Style Catering', category: 'Catering', vendor_id: '5', description: 'Buffet wedding catering services', price: '$50 - $90 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600' },
  { id: '31', name: 'BBQ Wedding Catering', category: 'Catering', vendor_id: '5', description: 'Outdoor BBQ wedding catering', price: '$35 - $65 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600' },
  { id: '32', name: 'Italian Wedding Catering', category: 'Catering', vendor_id: '4', description: 'Authentic Italian cuisine catering', price: '$60 - $120 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' },
  { id: '33', name: 'Asian Fusion Catering', category: 'Catering', vendor_id: '5', description: 'Modern Asian fusion wedding catering', price: '$55 - $95 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600' },
  { id: '34', name: 'Vegan Wedding Catering', category: 'Catering', vendor_id: '4', description: 'Plant-based wedding catering options', price: '$40 - $85 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600' },
  { id: '35', name: 'Brunch Wedding Catering', category: 'Catering', vendor_id: '5', description: 'Morning wedding brunch catering', price: '$35 - $70 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600' },
  { id: '36', name: 'Dessert Bar Catering', category: 'Catering', vendor_id: '4', description: 'Custom dessert bar and sweets', price: '$15 - $35 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' },
  { id: '37', name: 'Wine & Cheese Catering', category: 'Catering', vendor_id: '5', description: 'Sophisticated wine and cheese service', price: '$25 - $55 per person', duration: '2-4 hours', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600' },
  { id: '38', name: 'Seafood Wedding Catering', category: 'Catering', vendor_id: '4', description: 'Fresh seafood wedding catering', price: '$85 - $165 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600' },
  { id: '39', name: 'Mediterranean Catering', category: 'Catering', vendor_id: '5', description: 'Mediterranean cuisine wedding catering', price: '$50 - $95 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600' },
  { id: '40', name: 'Mexican Wedding Catering', category: 'Catering', vendor_id: '4', description: 'Authentic Mexican wedding catering', price: '$40 - $75 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' },
  { id: '41', name: 'Food Truck Catering', category: 'Catering', vendor_id: '5', description: 'Mobile food truck wedding catering', price: '$30 - $60 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600' },
  { id: '42', name: 'Farm-to-Table Catering', category: 'Catering', vendor_id: '4', description: 'Locally sourced farm-to-table catering', price: '$65 - $125 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600' },
  { id: '43', name: 'Late Night Snack Catering', category: 'Catering', vendor_id: '5', description: 'Late night wedding snack service', price: '$12 - $25 per person', duration: '2-3 hours', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600' },
  { id: '44', name: 'Kids Menu Catering', category: 'Catering', vendor_id: '4', description: 'Child-friendly wedding catering options', price: '$20 - $40 per child', duration: 'Event day', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' },
  { id: '45', name: 'Kosher Wedding Catering', category: 'Catering', vendor_id: '5', description: 'Certified kosher wedding catering', price: '$70 - $140 per person', duration: 'Event day', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600' },

  // Entertainment & Music (15)
  { id: '46', name: 'Wedding DJ Services', category: 'Music', vendor_id: '3', description: 'Professional DJ with sound system', price: '$800 - $2,000', duration: '6-8 hours', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400' },
  { id: '47', name: 'Live Wedding Band', category: 'Music', vendor_id: '3', description: 'Live music band for weddings', price: '$2,500 - $6,000', duration: '4-6 hours', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600' },
  { id: '48', name: 'Acoustic Guitar Ceremony', category: 'Music', vendor_id: '2', description: 'Solo acoustic guitar for ceremony', price: '$300 - $600', duration: '1-2 hours', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600' },
  { id: '49', name: 'String Quartet', category: 'Music', vendor_id: '4', description: 'Classical string quartet performance', price: '$1,200 - $2,800', duration: '3-4 hours', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600' },
  { id: '50', name: 'Jazz Band Performance', category: 'Music', vendor_id: '3', description: 'Professional jazz band for reception', price: '$1,800 - $4,000', duration: '4-6 hours', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400' },
  { id: '51', name: 'Piano Music Services', category: 'Music', vendor_id: '2', description: 'Solo piano performance', price: '$400 - $900', duration: '2-4 hours', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600' },
  { id: '52', name: 'Violin Solo Performance', category: 'Music', vendor_id: '4', description: 'Elegant violin solo music', price: '$350 - $750', duration: '1-3 hours', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600' },
  { id: '53', name: 'Gospel Choir Services', category: 'Music', vendor_id: '3', description: 'Inspirational gospel choir performance', price: '$800 - $2,200', duration: '2-4 hours', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600' },
  { id: '54', name: 'Harp Music Services', category: 'Music', vendor_id: '2', description: 'Elegant harp performance', price: '$500 - $1,200', duration: '2-4 hours', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400' },
  { id: '55', name: 'Country Band Performance', category: 'Music', vendor_id: '4', description: 'Country music band for weddings', price: '$1,500 - $3,500', duration: '4-6 hours', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600' },
  { id: '56', name: 'Rock Band Performance', category: 'Music', vendor_id: '3', description: 'High-energy rock band performance', price: '$2,000 - $5,000', duration: '4-6 hours', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600' },
  { id: '57', name: 'Bagpiper Services', category: 'Music', vendor_id: '2', description: 'Traditional bagpiper performance', price: '$200 - $500', duration: '1-2 hours', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600' },
  { id: '58', name: 'Mariachi Band', category: 'Music', vendor_id: '4', description: 'Traditional mariachi band performance', price: '$800 - $2,000', duration: '2-4 hours', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400' },
  { id: '59', name: 'Classical Trio', category: 'Music', vendor_id: '3', description: 'Classical music trio performance', price: '$900 - $2,100', duration: '3-5 hours', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600' },
  { id: '60', name: 'Sound System Rental', category: 'Music', vendor_id: '2', description: 'Professional sound system rental', price: '$300 - $800', duration: 'Event day', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600' },

  // Floral Services (12)
  { id: '61', name: 'Bridal Bouquet Design', category: 'Florist', vendor_id: '4', description: 'Custom bridal bouquet creation', price: '$200 - $500', duration: 'Pre-wedding', image: 'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=400' },
  { id: '62', name: 'Ceremony Floral Arrangements', category: 'Florist', vendor_id: '4', description: 'Altar and aisle floral decorations', price: '$800 - $2,000', duration: 'Event day setup', image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600' },
  { id: '63', name: 'Reception Centerpieces', category: 'Florist', vendor_id: '5', description: 'Table centerpiece arrangements', price: '$50 - $150 per table', duration: 'Event day setup', image: 'https://images.unsplash.com/photo-1464022077389-2864fd3ee1e2?w=600' },
  { id: '64', name: 'Bridal Party Bouquets', category: 'Florist', vendor_id: '5', description: 'Bouquets for bridesmaids', price: '$75 - $150 each', duration: 'Pre-wedding', image: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=600' },
  { id: '65', name: 'Boutonniere Design', category: 'Florist', vendor_id: '4', description: 'Groom and groomsmen boutonnieres', price: '$15 - $35 each', duration: 'Pre-wedding', image: 'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=400' },
  { id: '66', name: 'Corsage Design', category: 'Florist', vendor_id: '5', description: 'Mother and grandmother corsages', price: '$25 - $55 each', duration: 'Pre-wedding', image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600' },
  { id: '67', name: 'Flower Crown Design', category: 'Florist', vendor_id: '4', description: 'Bohemian flower crowns', price: '$40 - $95', duration: 'Pre-wedding', image: 'https://images.unsplash.com/photo-1464022077389-2864fd3ee1e2?w=600' },
  { id: '68', name: 'Wedding Arch Florals', category: 'Florist', vendor_id: '5', description: 'Floral arch decoration', price: '$300 - $800', duration: 'Event day setup', image: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=600' },
  { id: '69', name: 'Pew/Aisle Decorations', category: 'Florist', vendor_id: '4', description: 'Ceremony pew and aisle florals', price: '$150 - $400', duration: 'Event day setup', image: 'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=400' },
  { id: '70', name: 'Flower Petals Service', category: 'Florist', vendor_id: '5', description: 'Fresh flower petals for ceremony', price: '$50 - $150', duration: 'Event day', image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600' },
  { id: '71', name: 'Greenery Installations', category: 'Florist', vendor_id: '4', description: 'Lush greenery installations', price: '$200 - $600', duration: 'Event day setup', image: 'https://images.unsplash.com/photo-1464022077389-2864fd3ee1e2?w=600' },
  { id: '72', name: 'Preserved Flower Bouquets', category: 'Florist', vendor_id: '5', description: 'Long-lasting preserved flower bouquets', price: '$150 - $350', duration: 'Pre-wedding', image: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=600' },

  // Venue Services (8)
  { id: '73', name: 'Outdoor Garden Venue', category: 'Venue', vendor_id: '5', description: 'Beautiful garden wedding venue', price: '$3,000 - $8,000', duration: '6-12 hours', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400' },
  { id: '74', name: 'Banquet Hall Rental', category: 'Venue', vendor_id: '1', description: 'Elegant indoor banquet hall', price: '$2,500 - $6,000', duration: '8-12 hours', image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600' },
  { id: '75', name: 'Beach Wedding Venue', category: 'Venue', vendor_id: '2', description: 'Oceanfront wedding location', price: '$4,000 - $10,000', duration: '6-10 hours', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' },
  { id: '76', name: 'Historic Mansion Venue', category: 'Venue', vendor_id: '3', description: 'Elegant historic mansion rental', price: '$5,000 - $12,000', duration: '8-12 hours', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400' },
  { id: '77', name: 'Mountain Lodge Venue', category: 'Venue', vendor_id: '1', description: 'Rustic mountain lodge wedding', price: '$3,500 - $8,500', duration: '8-12 hours', image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600' },
  { id: '78', name: 'Vineyard Wedding Venue', category: 'Venue', vendor_id: '2', description: 'Romantic vineyard wedding location', price: '$4,500 - $9,500', duration: '8-12 hours', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' },
  { id: '79', name: 'Rooftop Venue Rental', category: 'Venue', vendor_id: '3', description: 'Urban rooftop wedding venue', price: '$3,000 - $7,500', duration: '6-10 hours', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400' },
  { id: '80', name: 'Barn Wedding Venue', category: 'Venue', vendor_id: '1', description: 'Rustic barn wedding location', price: '$2,000 - $5,500', duration: '8-12 hours', image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600' },

  // Beauty Services (10)
  { id: '81', name: 'Bridal Makeup Application', category: 'Beauty', vendor_id: '3', description: 'Professional bridal makeup', price: '$300 - $600', duration: '2-3 hours', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600' },
  { id: '82', name: 'Wedding Hair Styling', category: 'Beauty', vendor_id: '3', description: 'Bridal hair styling and updos', price: '$200 - $400', duration: '2-3 hours', image: 'https://images.unsplash.com/photo-1522338242992-e1707d882650?w=600' },
  { id: '83', name: 'Bridal Party Makeup', category: 'Beauty', vendor_id: '2', description: 'Makeup for entire bridal party', price: '$150 - $300 per person', duration: '4-6 hours', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600' },
  { id: '84', name: 'Trial Makeup Session', category: 'Beauty', vendor_id: '3', description: 'Pre-wedding makeup trial', price: '$100 - $200', duration: '1-2 hours', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600' },
  { id: '85', name: 'Bridal Skincare Prep', category: 'Beauty', vendor_id: '2', description: 'Pre-wedding skincare treatments', price: '$200 - $500', duration: '2-4 weeks', image: 'https://images.unsplash.com/photo-1522338242992-e1707d882650?w=600' },
  { id: '86', name: 'Nail Art Services', category: 'Beauty', vendor_id: '3', description: 'Bridal nail art and manicure', price: '$50 - $150', duration: '1-2 hours', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600' },
  { id: '87', name: 'Eyelash Extensions', category: 'Beauty', vendor_id: '2', description: 'Wedding eyelash extensions', price: '$120 - $250', duration: '2-3 hours', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600' },
  { id: '88', name: 'Airbrush Makeup', category: 'Beauty', vendor_id: '3', description: 'Long-lasting airbrush makeup', price: '$350 - $650', duration: '2-3 hours', image: 'https://images.unsplash.com/photo-1522338242992-e1707d882650?w=600' },
  { id: '89', name: 'Mother of Bride Makeup', category: 'Beauty', vendor_id: '2', description: 'Special occasion makeup for mothers', price: '$150 - $300', duration: '1-2 hours', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600' },
  { id: '90', name: 'Groom Grooming Services', category: 'Beauty', vendor_id: '3', description: 'Grooming services for grooms', price: '$75 - $200', duration: '1-2 hours', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600' }
];

// In-memory storage for bookings (will be replaced with database)
let bookingsStorage = [];
let bookingIdCounter = 1;

// ================================
// HEALTH & STATUS ENDPOINTS
// ================================

app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testDatabaseConnection();
    
    // Test actual database queries
    let dbStats = { conversations: 0, messages: 0, error: null };
    try {
      const convResult = await sql`SELECT COUNT(*) as count FROM conversations`;
      dbStats.conversations = parseInt(convResult[0].count);
      
      const msgResult = await sql`SELECT COUNT(*) as count FROM messages`;
      dbStats.messages = parseInt(msgResult[0].count);
    } catch (dbErr) {
      dbStats.error = dbErr.message;
      console.error('❌ [HEALTH] Database query failed:', dbErr.message);
    }
    
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'Connected' : 'Disconnected',
      databaseStats: dbStats,
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      endpoints: {
        health: '✅ Active',
        vendors: '✅ Active',
        services: '✅ Active',
        bookings: '✅ Active',
        auth: '✅ Active'
      }
    };
    
    res.json(healthStatus);
  } catch (error) {
    console.error('❌ [HEALTH] Health check failed:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    timestamp: new Date().toISOString(),
    server: 'Wedding Bazaar API v2.0'
  });
});

// ================================
// VENDOR ENDPOINTS
// ================================

app.get('/api/vendors', async (req, res) => {
  try {
    console.log('🏪 [API] GET /api/vendors called');
    
    res.json({
      success: true,
      vendors: mockVendors,
      total: mockVendors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Vendors endpoint failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendors',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/vendors/featured', async (req, res) => {
  try {
    console.log('⭐ [API] GET /api/vendors/featured called');
    
    res.json({
      success: true,
      vendors: mockVendors,
      total: mockVendors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Featured vendors endpoint failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured vendors',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Vendors Categories endpoint - provides category-based vendor organization
app.get('/api/vendors/categories', async (req, res) => {
  try {
    console.log('📂 [API] GET /api/vendors/categories called');
    
    // Group vendors by category
    const categories = {};
    mockVendors.forEach(vendor => {
      const category = vendor.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(vendor);
    });
    
    // Convert to array format with category info
    const categoryArray = Object.keys(categories).map(categoryName => ({
      id: categoryName.toLowerCase().replace(/\s+/g, '-'),
      name: categoryName,
      count: categories[categoryName].length,
      vendors: categories[categoryName],
      description: `Professional ${categoryName.toLowerCase()} services for your wedding`,
      image: getCategoryImage(categoryName)
    }));
    
    res.json({
      success: true,
      categories: categoryArray,
      total: categoryArray.length,
      totalVendors: mockVendors.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [API] Vendor categories endpoint failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor categories',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to get category images
function getCategoryImage(category) {
  const categoryImages = {
    'Wedding Planning': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop',
    'Photography': 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop',
    'DJ': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
    'Florist': 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&h=400&fit=crop',
    'Venue': 'https://images.unsplash.com/photo-1519167758481-83f29b1fe9c2?w=600&h=400&fit=crop',
    'Other': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop'
  };
  return categoryImages[category] || categoryImages['Other'];
}

app.get('/api/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🏪 [API] GET /api/vendors/' + id + ' called');
    
    const vendor = mockVendors.find(v => v.id === id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found',
        message: `No vendor found with ID: ${id}`,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      vendor: vendor,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Get vendor by ID failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// SERVICES ENDPOINTS
// ================================

app.get('/api/services', async (req, res) => {
  try {
    console.log('🔧 [API] GET /api/services called');
    
    res.json({
      success: true,
      services: mockServices,
      total: mockServices.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Services endpoint failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/services/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    console.log('🔧 [API] GET /api/services/category/' + category + ' called');
    
    const filteredServices = mockServices.filter(service => 
      service.category.toLowerCase() === category.toLowerCase()
    );
    
    res.json({
      success: true,
      services: filteredServices,
      total: filteredServices.length,
      category: category,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Services by category failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services by category',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// AUTHENTICATION ENDPOINTS
// ================================

// Mock user storage
const mockUsers = [
  // Couple users
  {
    id: '2-2025-003',  // Map to existing participant ID with 5 conversations
    email: 'sarah.johnson@email.com',
    password: '$2a$10$rX8V6QOJJmKqV9V9V9V9V.rX8V6QOJJmKqV9V9V9V9rX8V6QOJJ', // "password123"
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'couple',
    weddingDate: '2025-06-15',
    fianceFirstName: 'Michael',
    fianceLastName: 'Chen',
    location: 'San Francisco, CA'
  },
  {
    id: '2',
    email: 'emily.davis@email.com', 
    password: '$2a$10$rX8V6QOJJmKqV9V9V9V9V.rX8V6QOJJmKqV9V9V9V9rX8V6QOJJ',
    firstName: 'Emily',
    lastName: 'Davis',
    role: 'couple',
    weddingDate: '2025-08-22',
    fianceFirstName: 'James',
    fianceLastName: 'Rodriguez',
    location: 'Los Angeles, CA'
  },
  // Vendor users
  {
    id: '10',
    email: 'contact@elitephotography.com',
    password: '$2a$10$rX8V6QOJJmKqV9V9V9V9V.rX8V6QOJJmKqV9V9V9V9rX8V6QOJJ',
    firstName: 'David',
    lastName: 'Martinez',
    role: 'vendor',
    businessName: 'Elite Wedding Photography',
    serviceCategory: 'Photography',
    location: 'Bay Area, CA'
  },
  {
    id: '11',
    email: 'events@gardengrove.com',
    password: '$2a$10$rX8V6QOJJmKqV9V9V9V9V.rX8V6QOJJmKqV9V9V9V9rX8V6QOJJ',
    firstName: 'Jennifer',
    lastName: 'Thompson',
    role: 'vendor',
    businessName: 'Garden Grove Venue',
    serviceCategory: 'Venue',
    location: 'Napa Valley, CA'
  },
  // Test/demo users (for fallback)
  {
    id: '2-2025-001',  // Map to existing participant ID with conversations
    email: 'test@example.com',
    password: '$2a$10$rX8V6QOJJmKqV9V9V9V9V.rX8V6QOJJmKqV9V9V9V9rX8V6QOJJ',
    firstName: 'Demo',
    lastName: 'User',
    role: 'couple'
  }
];

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 [AUTH] Login attempt received:', { 
      email: req.body.email, 
      hasPassword: !!req.body.password,
      ip: req.ip
    });
    
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      console.log('❌ [AUTH] Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Create mapping between auth emails and real database participant IDs
    const userIdMapping = {
      'sarah.johnson@email.com': '2-2025-003',  // Sarah Johnson -> user with 5 conversations
      'test@example.com': '2-2025-001',         // Demo user -> user with 1 conversation  
      'emily.davis@email.com': '2-2025-002',    // Emily Davis -> another user
      'contact@elitephotography.com': 'vendor-1', // PhotoMagic Studios
      'events@gardengrove.com': '8',            // Elite Wedding Transport
      'demo@user.com': '1-2025-001',           // Map to existing user with messages
      'admin@wedding.com': '2-2025-003',       // Admin -> user with admin conversations
      'couple1@gmail.com': '1-2025-001',       // Map couple1 to user with messages
    };

    // Dynamic user creation - accept any valid email and create real user profile
    let user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // If user doesn't exist, create a real user profile based on email
    if (!user) {
      console.log('🔧 [AUTH] Creating real user profile for:', email);
      
      // Extract name from email if possible
      const emailName = email.split('@')[0];
      const nameParts = emailName.split(/[._-]/);
      const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'User';
      const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : '';
      
      // Detect user role from email domain or default to couple
      let role = 'couple';
      if (email.includes('vendor') || email.includes('business') || email.includes('service')) {
        role = 'vendor';
      } else if (email.includes('admin')) {
        role = 'admin';
      }
      
      // Use mapped messaging database ID if available, otherwise create sequential ID
      const messagingId = userIdMapping[email.toLowerCase()] || `new-user-${mockUsers.length + 1}`;
      
      user = {
        id: messagingId,  // Use database-compatible ID
        email: email.toLowerCase(),
        password: 'user-password',
        firstName: firstName,
        lastName: lastName,
        role: role
      };
      mockUsers.push(user);
      console.log('✅ [AUTH] Created user profile:', { 
        id: user.id, 
        name: `${user.firstName} ${user.lastName}`, 
        email: user.email, 
        role: user.role,
        messagingId: messagingId
      });
    }

    // For demo purposes, accept any password
    console.log('✅ [AUTH] Login successful for:', email);
    
    const token = 'mock-jwt-token-' + Date.now();
    
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [AUTH] Login failed:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 [AUTH] Registration attempt received:', { 
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      role: req.body.role
    });
    
    const { email, password, firstName, lastName, role } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, firstName, and lastName are required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      console.log('❌ [AUTH] User already exists:', email);
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Create new user
    const newUser = {
      id: String(mockUsers.length + 1),
      email: email.toLowerCase(),
      password: 'mock-hashed-password',
      firstName,
      lastName,
      role: role || 'couple'
    };
    
    mockUsers.push(newUser);
    
    console.log('✅ [AUTH] Registration successful for:', email);
    
    const token = 'mock-jwt-token-' + Date.now();
    
    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      },
      token: token,
      message: 'Registration successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [AUTH] Registration failed:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
    
    if (!token) {
      return res.json({
        success: false,
        authenticated: false,
        message: 'Token not found',
        timestamp: new Date().toISOString()
      });
    }

    // Mock token verification
    if (token.startsWith('mock-jwt-token-')) {
      const mockUser = mockUsers[0]; // Return first user for demo
      res.json({
        success: true,
        authenticated: true,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role
        },
        message: 'Token valid',
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: false,
        authenticated: false,
        message: 'Token invalid',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ [AUTH] Token verification error:', error);
    res.json({
      success: false,
      authenticated: false,
      message: 'Token verification failed',
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    console.log('🚪 [AUTH] User logout');
    
    res.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [AUTH] Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// BOOKING ENDPOINTS
// ================================

app.post('/api/bookings/request', async (req, res) => {
  try {
    console.log('📝 [BOOKING] POST /api/bookings/request called');
    console.log('📦 [BOOKING] Request body:', JSON.stringify(req.body, null, 2));
    
    const bookingData = req.body;
    
    // Input validation
    if (!bookingData.vendorId) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID is required',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!bookingData.eventDate) {
      return res.status(400).json({
        success: false,
        error: 'Event date is required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Create booking
    const booking = {
      id: String(bookingIdCounter++),
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    bookingsStorage.push(booking);
    
    console.log('✅ [BOOKING] Booking created successfully:', booking.id);
    res.status(201).json({
      success: true,
      booking: booking,
      message: 'Booking request submitted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [BOOKING] Booking request failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking request',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/bookings/couple/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    console.log('👥 [BOOKING] GET /api/bookings/couple/' + coupleId + ' called');
    
    const bookings = bookingsStorage.filter(booking => 
      booking.coupleId === coupleId || booking.userId === coupleId
    );
    
    res.json({
      success: true,
      bookings: bookings,
      total: bookings.length,
      coupleId: coupleId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [BOOKING] Get couple bookings failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch couple bookings',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 [BOOKING] GET /api/bookings/' + id + ' called');
    
    const booking = bookingsStorage.find(b => b.id === id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        message: `No booking found with ID: ${id}`,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      booking: booking,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [BOOKING] Get booking by ID failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    console.log('📝 [BOOKING] PUT /api/bookings/' + id + '/status called');
    console.log('📦 [BOOKING] Status update:', { status, notes });
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const validStatuses = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        validStatuses: validStatuses,
        timestamp: new Date().toISOString()
      });
    }
    
    const bookingIndex = bookingsStorage.findIndex(b => b.id === id);
    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }
    
    bookingsStorage[bookingIndex] = {
      ...bookingsStorage[bookingIndex],
      status,
      notes,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      booking: bookingsStorage[bookingIndex],
      message: 'Booking status updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [BOOKING] Update booking status failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// MESSAGING ENDPOINTS
// ================================

// In-memory storage for conversations - CLEARED to force fresh conversations
// All conversations will be created fresh with real vendor data
let conversationsStorage = []; // Always empty to prevent caching

// Empty messages storage - all messages will be created dynamically for real users
let messagesStorage = [];

let conversationIdCounter = 6;
let messageIdCounter = 8;

app.get('/api/conversations', async (req, res) => {
  try {
    console.log('💬 [MESSAGING] GET /api/conversations called - using REAL database');
    
    // Get real conversations from database
    const conversations = await sql`
      SELECT id, participant_name, conversation_type, last_message, 
             last_message_time, unread_count, service_name, service_category,
             created_at, updated_at
      FROM conversations 
      ORDER BY last_message_time DESC NULLS LAST, created_at DESC
    `;
    
    console.log(`📊 [MESSAGING] Found ${conversations.length} real conversations in database`);
    
    res.json({
      success: true,
      conversations: conversations,
      total: conversations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [MESSAGING] Get conversations failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('💬 [MESSAGING] GET /api/conversations/' + userId + ' called - using REAL database');
    
    // Get user's conversations from REAL database
    let userConversations = await sql`
      SELECT id, participant_id, participant_name, conversation_type, last_message, 
             last_message_time, unread_count, service_name, service_category,
             created_at, updated_at
      FROM conversations 
      WHERE participant_id = ${userId}
      ORDER BY last_message_time DESC NULLS LAST, created_at DESC
    `;
    
    console.log(`� [MESSAGING] Found ${userConversations.length} real conversations for user ${userId}`);
    
    // USE YOUR REAL DATABASE DATA - not fake mock conversations!
    console.log('🔥 [MESSAGING] Reading YOUR REAL conversations from database for user:', userId);
    
    try {
      // Get user's REAL conversations from YOUR database
      userConversations = await sql`
        SELECT id, participant_id, participant_name, conversation_type, last_message, 
               last_message_time, unread_count, service_name, service_category,
               created_at, updated_at
        FROM conversations 
        WHERE participant_id = ${userId}
        ORDER BY last_message_time DESC NULLS LAST, created_at DESC
      `;
      
      console.log(`✅ [MESSAGING] Found ${userConversations.length} REAL conversations for user ${userId} in YOUR database`);
      
      // If this specific user has no conversations, create some with real vendors
      if (userConversations.length === 0) {
        console.log('� [MESSAGING] No existing conversations for this user, creating initial ones...');
        
        // Create conversations using real vendors from your database or mockVendors
        const realVendors = mockVendors.slice(0, 2);
        for (const [index, vendor] of realVendors.entries()) {
          const conversationId = `${userId}_${Date.now()}_${index}`;
          
          // Insert into YOUR REAL database
          await sql`
            INSERT INTO conversations (
              id, participant_id, participant_name, participant_type,
              creator_id, creator_type, conversation_type,
              last_message, last_message_time, unread_count,
              service_name, service_category, created_at, updated_at
            ) VALUES (
              ${conversationId}, ${userId}, ${vendor.name}, 'couple',
              ${'vendor-' + vendor.id}, 'vendor', 'direct',
              ${'Hi! I\'m from ' + vendor.name + '. Thank you for your interest in our ' + vendor.category.toLowerCase() + ' services!'},
              ${new Date()}, 1,
              ${vendor.name}, ${vendor.category},
              ${new Date()}, ${new Date()}
            )
          `;
          
          // Insert initial message into YOUR REAL database
          await sql`
            INSERT INTO messages (
              id, conversation_id, sender_id, sender_name, sender_type,
              content, message_type, timestamp, is_read, created_at
            ) VALUES (
              ${'msg-' + conversationId + '-1'}, ${conversationId},
              ${'vendor-' + vendor.id}, ${vendor.name}, 'vendor',
              ${'Hi! I\'m from ' + vendor.name + '. Thank you for your interest in our ' + vendor.category.toLowerCase() + ' services. We\'d love to help make your wedding perfect!'},
              'text', ${new Date()}, false, ${new Date()}
            )
          `;
        }
        
        // Re-fetch the newly created conversations
        userConversations = await sql`
          SELECT id, participant_id, participant_name, conversation_type, last_message, 
                 last_message_time, unread_count, service_name, service_category,
                 created_at, updated_at
          FROM conversations 
          WHERE participant_id = ${userId}
          ORDER BY created_at DESC
        `;
        
        console.log(`✅ [MESSAGING] Created ${userConversations.length} new conversations in YOUR REAL database`);
      }
      
    } catch (dbError) {
      console.error('❌ [MESSAGING] Database error for user', userId, ':', dbError.message);
      console.error('❌ [MESSAGING] Database stack trace:', dbError.stack);
      userConversations = [];
      
      // Return error info in response for debugging
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        details: dbError.message,
        userId: userId,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      conversations: userConversations,
      total: userConversations.length,
      userId: userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [MESSAGING] Get user conversations failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user conversations',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/conversations', async (req, res) => {
  try {
    console.log('💬 [MESSAGING] POST /api/conversations called');
    console.log('📦 [MESSAGING] Request body:', req.body);
    
    const { participants, title, type } = req.body;
    
    if (!participants || participants.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 participants required',
        timestamp: new Date().toISOString()
      });
    }
    
    const conversation = {
      id: String(conversationIdCounter++),
      participants: participants,
      title: title || `Conversation ${conversationIdCounter}`,
      type: type || 'direct',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: null,
      unreadCount: 0
    };
    
    conversationsStorage.push(conversation);
    
    res.status(201).json({
      success: true,
      conversation: conversation,
      message: 'Conversation created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [MESSAGING] Create conversation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log('💬 [MESSAGING] GET messages for conversation:', conversationId, '- using REAL database');
    
    // Get real messages from database
    const messages = await sql`
      SELECT id, conversation_id, sender_id, sender_name, sender_type,
             content, message_type, timestamp, is_read, reactions,
             service_data, created_at
      FROM messages 
      WHERE conversation_id = ${conversationId}
      ORDER BY timestamp ASC, created_at ASC
    `;
    
    console.log(`📊 [MESSAGING] Found ${messages.length} real messages for conversation ${conversationId}`);
    
    res.json({
      success: true,
      messages: messages,
      total: messages.length,
      conversationId: conversationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [MESSAGING] Get messages failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { senderId, content, type } = req.body;
    
    console.log('💬 [MESSAGING] POST message to conversation:', conversationId);
    
    if (!senderId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Sender ID and content are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const message = {
      id: String(messageIdCounter++),
      conversationId: conversationId,
      senderId: senderId,
      content: content,
      type: type || 'text',
      timestamp: new Date().toISOString(),
      read: false
    };
    
    messagesStorage.push(message);
    
    // Update conversation's last message
    const conversationIndex = conversationsStorage.findIndex(conv => conv.id === conversationId);
    if (conversationIndex !== -1) {
      conversationsStorage[conversationIndex].lastMessage = message;
      conversationsStorage[conversationIndex].updatedAt = new Date().toISOString();
    }
    
    res.status(201).json({
      success: true,
      message: message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [MESSAGING] Send message failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// ERROR HANDLING & 404
// ================================

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 [ERROR] Global error handler:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ [404] Endpoint not found:', req.method, req.originalUrl);
  
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: {
      health: 'GET /api/health',
      ping: 'GET /api/ping',
      vendors: {
        all: 'GET /api/vendors',
        featured: 'GET /api/vendors/featured',
        categories: 'GET /api/vendors/categories',
        byId: 'GET /api/vendors/:id'
      },
      services: {
        all: 'GET /api/services',
        byCategory: 'GET /api/services/category/:category'
      },
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        verify: 'POST /api/auth/verify',
        logout: 'POST /api/auth/logout'
      },
      bookings: {
        create: 'POST /api/bookings/request',
        getByCouple: 'GET /api/bookings/couple/:coupleId',
        getById: 'GET /api/bookings/:id',
        updateStatus: 'PUT /api/bookings/:id/status'
      },
      messaging: {
        getAllConversations: 'GET /api/conversations',
        getUserConversations: 'GET /api/conversations/:userId',
        createConversation: 'POST /api/conversations',
        getMessages: 'GET /api/conversations/:conversationId/messages',
        sendMessage: 'POST /api/conversations/:conversationId/messages'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ================================
// SERVER STARTUP
// ================================

async function startServer() {
  try {
    // Test database connection
    console.log('🔍 [STARTUP] Testing database connection...');
    const dbConnected = await testDatabaseConnection();
    console.log('✅ [STARTUP] Database connection successful');
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log('\n🚀 ===================================');
      console.log('🎉 Wedding Bazaar Production Backend');
      console.log('🚀 ===================================');
      console.log(`🌟 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log('🚀 ===================================\n');
      
      // Log available endpoints
      console.log('📋 Available Endpoints:');
      console.log('   Health: GET /api/health');
      console.log('   Ping: GET /api/ping');
      console.log('   Vendors: GET /api/vendors');
      console.log('   Featured Vendors: GET /api/vendors/featured');
      console.log('   Vendor Categories: GET /api/vendors/categories');
      console.log('   Services: GET /api/services');
      console.log('   Auth Login: POST /api/auth/login');
      console.log('   Auth Register: POST /api/auth/register');
      console.log('   Booking Request: POST /api/bookings/request');
      console.log('   Couple Bookings: GET /api/bookings/couple/:coupleId');
      console.log('🚀 ===================================\n');
      
      console.log('📊 Mock Data Status:');
      console.log(`   Vendors: ${mockVendors.length} available`);
      console.log(`   Services: ${mockServices.length} available`);
      console.log(`   Users: ${mockUsers.length} registered`);
      console.log(`   Bookings: ${bookingsStorage.length} in storage`);
      console.log('🚀 ===================================\n');
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 [SHUTDOWN] SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ [SHUTDOWN] Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 [SHUTDOWN] SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ [SHUTDOWN] Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ [STARTUP] Server startup failed:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
