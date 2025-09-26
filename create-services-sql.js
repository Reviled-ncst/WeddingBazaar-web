/**
 * Create real services for vendors - SQL script
 * Copy and paste this SQL into your database directly
 */

console.log('Copy and paste this SQL into your Neon database console:');
console.log('='.repeat(80));

const sql = `
-- First, ensure we have vendors
INSERT INTO vendors (id, name, category, location, rating, review_count, description, phone, email, website)
VALUES 
  (1, 'Elite Photography Studios', 'Photography', 'Manila, Philippines', 4.8, 127, 'Professional wedding photography services', '+63917-123-4567', 'info@elitephoto.ph', 'https://elitephoto.ph'),
  (2, 'Sound Systems Pro', 'DJ', 'Quezon City, Philippines', 4.6, 89, 'Professional DJ and sound services', '+63917-234-5678', 'info@soundpro.ph', 'https://soundpro.ph'),
  (3, 'Culinary Excellence', 'Catering', 'Makati, Philippines', 4.7, 156, 'Premium wedding catering services', '+63917-345-6789', 'info@culinary.ph', 'https://culinary.ph')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  location = EXCLUDED.location;

-- Now add services for these vendors
INSERT INTO services (title, description, category, vendor_id, price, images, is_active, featured, created_at, updated_at)
VALUES 
  -- Photography Services (Vendor 1)
  ('Professional Wedding Photography Package', 'Complete wedding photography service including pre-wedding shoot, full day coverage, same day edit, and digital gallery with high-resolution images.', 'Photography', 1, 75000, '["https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600"]', true, true, NOW(), NOW()),
  ('Engagement Photography Session', 'Beautiful engagement photography session to capture your love story before the big day.', 'Photography', 1, 25000, '["https://images.unsplash.com/photo-1519741497674-611481863552?w=600"]', true, false, NOW(), NOW()),
  ('Wedding Videography', 'Cinematic wedding videography with professional editing and storytelling.', 'Videography', 1, 60000, '["https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600"]', true, false, NOW(), NOW()),
  
  -- DJ Services (Vendor 2)
  ('Professional DJ Wedding Package', 'Complete DJ service with premium sound system, lighting, and MC services for your wedding celebration.', 'Music & DJ', 2, 45000, '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600"]', true, true, NOW(), NOW()),
  ('Ceremony Sound System', 'Professional sound system setup for wedding ceremonies with wireless microphones.', 'Music & DJ', 2, 15000, '["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600"]', true, false, NOW(), NOW()),
  ('Live Band Performance', 'Professional live band for wedding reception entertainment.', 'Music & DJ', 2, 80000, '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600"]', true, true, NOW(), NOW()),
  
  -- Catering Services (Vendor 3)
  ('Premium Wedding Catering', 'Exquisite wedding catering with custom menu design, professional service staff, and complete setup.', 'Catering', 3, 2500, '["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600"]', true, true, NOW(), NOW()),
  ('Cocktail Reception Package', 'Elegant cocktail reception catering with premium appetizers and beverage service.', 'Catering', 3, 1800, '["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600"]', true, false, NOW(), NOW()),
  ('Wedding Cake Service', 'Custom wedding cake design and creation for your special day.', 'Catering', 3, 8000, '["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600"]', true, false, NOW(), NOW()),
  
  -- Additional services for variety
  ('Garden Wedding Venue', 'Beautiful garden wedding venue with elegant facilities, perfect for romantic outdoor ceremonies.', 'Venues', 1, 150000, '["https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600"]', true, true, NOW(), NOW()),
  ('Bridal Makeup & Hair', 'Complete beauty package for bride with professional makeup and hair styling.', 'Makeup & Hair', 2, 35000, '["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600"]', true, false, NOW(), NOW()),
  ('Wedding Flowers & Decor', 'Beautiful bridal bouquets and ceremony florals with fresh, seasonal flowers.', 'Flowers', 3, 40000, '["https://images.unsplash.com/photo-1522673607200-164d1b6ce2d2?w=600"]', true, true, NOW(), NOW());

-- Verify the services were created
SELECT COUNT(*) as total_services FROM services WHERE is_active = true;
SELECT s.title, v.name as vendor_name, s.category, s.price 
FROM services s 
LEFT JOIN vendors v ON s.vendor_id = v.id 
WHERE s.is_active = true 
ORDER BY s.created_at DESC;
`;

console.log(sql);
console.log('='.repeat(80));
console.log('');
console.log('Instructions:');
console.log('1. Go to your Neon database console');
console.log('2. Copy and paste the SQL above');
console.log('3. Run the SQL to create real services');
console.log('4. The frontend will now show real services from your database');
console.log('');
console.log('This will create 12 real services across 3 vendors with different categories.');
