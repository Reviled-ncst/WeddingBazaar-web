const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

// Comprehensive wedding vendor data to populate the database
const weddingVendors = [
  // Photography
  { business_name: 'Elegant Moments Photography', business_type: 'Photography', location: 'Manila, Philippines', rating: 4.9, review_count: 156, description: 'Capturing timeless wedding moments with artistic vision and professional expertise' },
  { business_name: 'Golden Hour Studios', business_type: 'Photography', location: 'Quezon City, Philippines', rating: 4.8, review_count: 134, description: 'Specializing in natural light photography and candid wedding moments' },
  { business_name: 'Forever Frame Photography', business_type: 'Photography', location: 'Makati, Philippines', rating: 4.7, review_count: 98, description: 'Modern wedding photography with a touch of vintage elegance' },
  { business_name: 'Dream Lens Photography', business_type: 'Photography', location: 'Pasig, Philippines', rating: 4.6, review_count: 87, description: 'Creative wedding photography that tells your unique love story' },
  { business_name: 'Blissful Captures', business_type: 'Photography', location: 'Taguig, Philippines', rating: 4.8, review_count: 112, description: 'Professional wedding photography with cinematic style' },
  
  // Videography  
  { business_name: 'Motion Poetry Films', business_type: 'Videography', location: 'Manila, Philippines', rating: 4.9, review_count: 143, description: 'Cinematic wedding films that capture emotions and memories' },
  { business_name: 'Love Story Productions', business_type: 'Videography', location: 'Quezon City, Philippines', rating: 4.7, review_count: 89, description: 'Award-winning wedding videography with storytelling approach' },
  { business_name: 'Eternal Moments Video', business_type: 'Videography', location: 'Makati, Philippines', rating: 4.8, review_count: 76, description: 'High-quality wedding videos with same-day editing service' },
  { business_name: 'Heartbeat Films', business_type: 'Videography', location: 'Pasig, Philippines', rating: 4.6, review_count: 94, description: 'Emotional wedding films with modern cinematic techniques' },
  
  // Catering
  { business_name: 'Royal Feast Catering', business_type: 'Catering', location: 'Manila, Philippines', rating: 4.8, review_count: 267, description: 'Exquisite Filipino and international cuisine for weddings' },
  { business_name: 'Gourmet Wedding Catering', business_type: 'Catering', location: 'Quezon City, Philippines', rating: 4.7, review_count: 198, description: 'Premium catering with customizable menu options' },
  { business_name: 'Delicious Moments Catering', business_type: 'Catering', location: 'Makati, Philippines', rating: 4.9, review_count: 234, description: 'Farm-to-table catering with organic ingredients' },
  { business_name: 'Culinary Dreams Catering', business_type: 'Catering', location: 'Pasig, Philippines', rating: 4.6, review_count: 156, description: 'Creative fusion cuisine for modern weddings' },
  { business_name: 'Heritage Kitchen Catering', business_type: 'Catering', location: 'Taguig, Philippines', rating: 4.8, review_count: 189, description: 'Traditional Filipino dishes with contemporary presentation' },
  
  // Venues
  { business_name: 'Grand Garden Events Place', business_type: 'Venues', location: 'Tagaytay, Philippines', rating: 4.9, review_count: 178, description: 'Stunning garden venue with mountain views and elegant facilities' },
  { business_name: 'Seaside Wedding Resort', business_type: 'Venues', location: 'Batangas, Philippines', rating: 4.8, review_count: 145, description: 'Beachfront wedding venue with sunset ceremony options' },
  { business_name: 'Metropolitan Ballroom', business_type: 'Venues', location: 'Manila, Philippines', rating: 4.7, review_count: 203, description: 'Luxury ballroom venue in the heart of the city' },
  { business_name: 'Rustic Barn Events', business_type: 'Venues', location: 'Laguna, Philippines', rating: 4.6, review_count: 92, description: 'Charming rustic venue perfect for outdoor weddings' },
  { business_name: 'Crystal Palace Events', business_type: 'Venues', location: 'Quezon City, Philippines', rating: 4.8, review_count: 167, description: 'Elegant crystal-themed venue with modern amenities' },
  
  // Music & DJ
  { business_name: 'Harmony Wedding Music', business_type: 'Music & DJ', location: 'Manila, Philippines', rating: 4.8, review_count: 134, description: 'Professional DJ services with live band options' },
  { business_name: 'Beats & Melodies', business_type: 'Music & DJ', location: 'Quezon City, Philippines', rating: 4.7, review_count: 98, description: 'Modern sound systems and diverse music collections' },
  { business_name: 'Symphony Wedding Sounds', business_type: 'Music & DJ', location: 'Makati, Philippines', rating: 4.9, review_count: 156, description: 'Classical and contemporary music for sophisticated weddings' },
  { business_name: 'Dance Floor DJs', business_type: 'Music & DJ', location: 'Pasig, Philippines', rating: 4.6, review_count: 87, description: 'High-energy DJs specializing in dance music and crowd engagement' },
  
  // Floral
  { business_name: 'Blooming Elegance Florists', business_type: 'Floral', location: 'Manila, Philippines', rating: 4.9, review_count: 189, description: 'Luxury floral arrangements and bridal bouquets' },
  { business_name: 'Garden of Love Flowers', business_type: 'Floral', location: 'Quezon City, Philippines', rating: 4.8, review_count: 145, description: 'Fresh flowers sourced from local and international growers' },
  { business_name: 'Petals & Dreams', business_type: 'Floral', location: 'Makati, Philippines', rating: 4.7, review_count: 123, description: 'Creative floral designs for modern and traditional weddings' },
  { business_name: 'Rose Garden Florists', business_type: 'Floral', location: 'Pasig, Philippines', rating: 4.6, review_count: 98, description: 'Specialized in rose arrangements and romantic florals' },
  
  // Wedding Planning
  { business_name: 'Perfect Day Planners', business_type: 'Wedding Planning', location: 'Manila, Philippines', rating: 4.9, review_count: 234, description: 'Full-service wedding planning with attention to every detail' },
  { business_name: 'Dream Wedding Coordinators', business_type: 'Wedding Planning', location: 'Quezon City, Philippines', rating: 4.8, review_count: 167, description: 'Experienced planners specializing in destination weddings' },
  { business_name: 'Bliss Wedding Management', business_type: 'Wedding Planning', location: 'Makati, Philippines', rating: 4.7, review_count: 145, description: 'Stress-free wedding planning with creative solutions' },
  { business_name: 'Elegant Affairs Planning', business_type: 'Wedding Planning', location: 'Pasig, Philippines', rating: 4.8, review_count: 189, description: 'Luxury wedding planning for sophisticated couples' },
  
  // Makeup & Hair
  { business_name: 'Bridal Beauty Studio', business_type: 'Makeup & Hair', location: 'Manila, Philippines', rating: 4.9, review_count: 178, description: 'Professional bridal makeup and hair styling services' },
  { business_name: 'Glamour Wedding Salon', business_type: 'Makeup & Hair', location: 'Quezon City, Philippines', rating: 4.8, review_count: 134, description: 'Complete bridal beauty packages with trial sessions' },
  { business_name: 'Radiant Bride Makeup', business_type: 'Makeup & Hair', location: 'Makati, Philippines', rating: 4.7, review_count: 112, description: 'Natural and glam makeup styles for all skin types' },
  { business_name: 'Hair & Beauty Artistry', business_type: 'Makeup & Hair', location: 'Pasig, Philippines', rating: 4.6, review_count: 89, description: 'Creative hair and makeup designs for unique brides' },
  
  // Transportation
  { business_name: 'Royal Wedding Cars', business_type: 'Transportation', location: 'Manila, Philippines', rating: 4.8, review_count: 145, description: 'Luxury vehicle rentals for weddings and special events' },
  { business_name: 'Classic Car Rentals', business_type: 'Transportation', location: 'Quezon City, Philippines', rating: 4.7, review_count: 98, description: 'Vintage and classic cars for memorable wedding entrances' },
  { business_name: 'Elegant Limousines', business_type: 'Transportation', location: 'Makati, Philippines', rating: 4.9, review_count: 167, description: 'Premium limousine services with professional chauffeurs' },
  
  // Wedding Cakes
  { business_name: 'Sweet Memories Bakery', business_type: 'Wedding Cakes', location: 'Manila, Philippines', rating: 4.9, review_count: 189, description: 'Custom wedding cakes with exquisite designs and flavors' },
  { business_name: 'Heavenly Cakes Studio', business_type: 'Wedding Cakes', location: 'Quezon City, Philippines', rating: 4.8, review_count: 156, description: 'Artisan wedding cakes made with premium ingredients' },
  { business_name: 'Sugar & Spice Bakery', business_type: 'Wedding Cakes', location: 'Makati, Philippines', rating: 4.7, review_count: 123, description: 'Creative cake designs for modern and traditional weddings' },
  
  // Decoration
  { business_name: 'Elegant Decor Solutions', business_type: 'Decoration', location: 'Manila, Philippines', rating: 4.8, review_count: 167, description: 'Complete wedding decoration and styling services' },
  { business_name: 'Dreamy Wedding Decor', business_type: 'Decoration', location: 'Quezon City, Philippines', rating: 4.7, review_count: 134, description: 'Romantic and whimsical decoration themes' },
  { business_name: 'Luxe Event Styling', business_type: 'Decoration', location: 'Makati, Philippines', rating: 4.9, review_count: 178, description: 'High-end decoration for luxury weddings' },
  
  // More diverse vendors to reach 80+
  { business_name: 'Paradise Garden Venue', business_type: 'Venues', location: 'Cavite, Philippines', rating: 4.6, review_count: 87, description: 'Garden venue with tropical landscaping' },
  { business_name: 'Moonlight Serenade Music', business_type: 'Music & DJ', location: 'Rizal, Philippines', rating: 4.7, review_count: 94, description: 'Acoustic and live music specialists' },
  { business_name: 'Vintage Rose Florists', business_type: 'Floral', location: 'Bulacan, Philippines', rating: 4.8, review_count: 112, description: 'Vintage-inspired floral arrangements' },
  { business_name: 'Gourmet Delights Catering', business_type: 'Catering', location: 'Pampanga, Philippines', rating: 4.9, review_count: 203, description: 'Regional cuisine specialties for weddings' },
  { business_name: 'Memories in Motion Video', business_type: 'Videography', location: 'Bataan, Philippines', rating: 4.6, review_count: 76, description: 'Documentary-style wedding videography' },
  { business_name: 'Artistic Lens Photography', business_type: 'Photography', location: 'Nueva Ecija, Philippines', rating: 4.7, review_count: 89, description: 'Fine art wedding photography' },
  { business_name: 'Celebration Central Planning', business_type: 'Wedding Planning', location: 'Zambales, Philippines', rating: 4.8, review_count: 145, description: 'Beach wedding specialists' },
  { business_name: 'Glamorous Beauty Bar', business_type: 'Makeup & Hair', location: 'Tarlac, Philippines', rating: 4.7, review_count: 98, description: 'Mobile beauty services for destination weddings' }
];

async function seedDatabase() {
  try {
    console.log('🌱 SEEDING DATABASE WITH 80+ WEDDING VENDORS...');
    
    // Check current vendor count
    const currentCount = await sql`SELECT COUNT(*) as count FROM vendors`;
    console.log(`📊 Current vendor count: ${currentCount[0].count}`);
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const vendor of weddingVendors) {
      try {
        // Check if vendor already exists
        const existing = await sql`
          SELECT id FROM vendors 
          WHERE business_name = ${vendor.business_name}
        `;
        
        if (existing.length === 0) {
          // Insert new vendor
          await sql`
            INSERT INTO vendors (
              business_name, business_type, location, rating, review_count,
              description, verified, created_at, updated_at
            ) VALUES (
              ${vendor.business_name}, ${vendor.business_type}, ${vendor.location},
              ${vendor.rating}, ${vendor.review_count}, ${vendor.description},
              true, NOW(), NOW()
            )
          `;
          insertedCount++;
          console.log(`✅ Added: ${vendor.business_name}`);
        } else {
          skippedCount++;
          console.log(`⏭️ Skipped (exists): ${vendor.business_name}`);
        }
      } catch (error) {
        console.error(`❌ Error adding ${vendor.business_name}:`, error.message);
      }
    }
    
    // Check final count
    const finalCount = await sql`SELECT COUNT(*) as count FROM vendors`;
    console.log(`\n🎉 SEEDING COMPLETE!`);
    console.log(`📊 Final vendor count: ${finalCount[0].count}`);
    console.log(`✅ Inserted: ${insertedCount} new vendors`);
    console.log(`⏭️ Skipped: ${skippedCount} existing vendors`);
    
    // Show business type breakdown
    console.log('\n🏷️ BUSINESS TYPES:');
    const businessTypes = await sql`
      SELECT business_type, COUNT(*) as count 
      FROM vendors 
      GROUP BY business_type 
      ORDER BY count DESC
    `;
    
    businessTypes.forEach(type => {
      console.log(`  ${type.business_type}: ${type.count} vendors`);
    });
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
}

seedDatabase();
