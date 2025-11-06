const { sql } = require('./backend-deploy/config/database.cjs');
const bcrypt = require('bcrypt');

/**
 * Create vendor accounts for all 15 categories
 * Each vendor will have:
 * - User account (with login credentials)
 * - Vendor profile
 * - Vendor profile details
 * 
 * Login format: 
 * Email: [category]@weddingbazaar.com
 * Password: [Category]123! (e.g., Photography123!)
 */

const VENDOR_CATEGORIES = [
  {
    categoryId: 'CAT-001',
    categoryName: 'Photography',
    displayName: 'Photographer & Videographer',
    businessName: 'Perfect Moments Photography & Video',
    email: 'photography@weddingbazaar.com',
    password: 'Photography123!',
    firstName: 'Marco',
    lastName: 'Santos',
    phone: '+639171234567',
    description: 'Professional wedding photography and videography services in Dasmariñas, Cavite. Capturing your perfect moments with creativity and passion.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Wedding Photography', 'Pre-wedding Shoots', 'Same Day Edit', 'Drone Coverage'],
    yearsInBusiness: 8
  },
  {
    categoryId: 'CAT-002',
    categoryName: 'Planning',
    displayName: 'Wedding Planner',
    businessName: 'Dream Day Wedding Planners',
    email: 'planning@weddingbazaar.com',
    password: 'Planning123!',
    firstName: 'Maria',
    lastName: 'Reyes',
    phone: '+639171234568',
    description: 'Full-service wedding planning and coordination for stress-free celebrations in Cavite.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Full Wedding Planning', 'Day-of Coordination', 'Destination Weddings', 'Budget Management'],
    yearsInBusiness: 10
  },
  {
    categoryId: 'CAT-003',
    categoryName: 'Florist',
    displayName: 'Florist',
    businessName: 'Blooming Love Floral Design',
    email: 'florist@weddingbazaar.com',
    password: 'Florist123!',
    firstName: 'Rosa',
    lastName: 'Garcia',
    phone: '+639171234569',
    description: 'Exquisite floral arrangements and decorations for your Dasmariñas wedding.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Bridal Bouquets', 'Venue Decoration', 'Centerpieces', 'Church Arrangements'],
    yearsInBusiness: 12
  },
  {
    categoryId: 'CAT-004',
    categoryName: 'Beauty',
    displayName: 'Hair & Makeup Artists',
    businessName: 'Glam Studio Beauty Services',
    email: 'beauty@weddingbazaar.com',
    password: 'Beauty123!',
    firstName: 'Sofia',
    lastName: 'Cruz',
    phone: '+639171234570',
    description: 'Professional bridal hair and makeup services making you look stunning on your special day.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Bridal Makeup', 'Hair Styling', 'Prenup Makeup', 'Entourage Styling'],
    yearsInBusiness: 7
  },
  {
    categoryId: 'CAT-005',
    categoryName: 'Catering',
    displayName: 'Caterer',
    businessName: 'Fiesta Catering Services',
    email: 'catering@weddingbazaar.com',
    password: 'Catering123!',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    phone: '+639171234571',
    description: 'Delicious Filipino and international cuisine for your Cavite wedding celebration.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Filipino Buffet', 'International Cuisine', 'Cocktail Reception', 'Plated Dinner'],
    yearsInBusiness: 15
  },
  {
    categoryId: 'CAT-006',
    categoryName: 'Music',
    displayName: 'DJ/Band',
    businessName: 'Harmony Live Band & DJ Services',
    email: 'music@weddingbazaar.com',
    password: 'Music123!',
    firstName: 'Miguel',
    lastName: 'Torres',
    phone: '+639171234572',
    description: 'Professional live band and DJ services keeping your guests dancing all night long.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Live Band', 'DJ Services', 'Acoustic Sets', 'Sound System Rental'],
    yearsInBusiness: 9
  },
  {
    categoryId: 'CAT-007',
    categoryName: 'Officiant',
    displayName: 'Officiant',
    businessName: 'Sacred Vows Wedding Officiants',
    email: 'officiant@weddingbazaar.com',
    password: 'Officiant123!',
    firstName: 'Father Jose',
    lastName: 'Rivera',
    phone: '+639171234573',
    description: 'Professional wedding officiants for meaningful and personalized ceremonies.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Catholic Ceremonies', 'Non-denominational', 'Civil Weddings', 'Custom Vows'],
    yearsInBusiness: 20
  },
  {
    categoryId: 'CAT-008',
    categoryName: 'Venue',
    displayName: 'Venue Coordinator',
    businessName: 'Garden Paradise Events Place',
    email: 'venue@weddingbazaar.com',
    password: 'Venue123!',
    firstName: 'Elena',
    lastName: 'Flores',
    phone: '+639171234574',
    description: 'Beautiful garden and ballroom venues perfect for your dream wedding in Dasmariñas.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Garden Weddings', 'Indoor Ballroom', 'Reception Halls', 'Outdoor Ceremonies'],
    yearsInBusiness: 18
  },
  {
    categoryId: 'CAT-009',
    categoryName: 'Rentals',
    displayName: 'Event Rentals',
    businessName: 'Elite Events Equipment Rental',
    email: 'rentals@weddingbazaar.com',
    password: 'Rentals123!',
    firstName: 'Ricardo',
    lastName: 'Morales',
    phone: '+639171234575',
    description: 'Complete event equipment and furniture rental for Cavite weddings.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Chairs & Tables', 'Tents & Canopies', 'Stage & Backdrop', 'Tableware'],
    yearsInBusiness: 11
  },
  {
    categoryId: 'CAT-010',
    categoryName: 'Cake',
    displayName: 'Cake Designer',
    businessName: 'Sweet Dreams Cake Studio',
    email: 'cake@weddingbazaar.com',
    password: 'Cake123!',
    firstName: 'Gabriela',
    lastName: 'Ramos',
    phone: '+639171234576',
    description: 'Custom wedding cakes and desserts crafted with love and creativity.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Custom Wedding Cakes', 'Cupcake Towers', 'Dessert Tables', 'Fondant Art'],
    yearsInBusiness: 6
  },
  {
    categoryId: 'CAT-011',
    categoryName: 'Fashion',
    displayName: 'Dress Designer/Tailor',
    businessName: 'Elegant Bridal Couture',
    email: 'fashion@weddingbazaar.com',
    password: 'Fashion123!',
    firstName: 'Isabela',
    lastName: 'Castillo',
    phone: '+639171234577',
    description: 'Exquisite custom wedding gowns and alterations in Dasmariñas.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Custom Gowns', 'Dress Alterations', 'Entourage Dresses', 'Suit Tailoring'],
    yearsInBusiness: 14
  },
  {
    categoryId: 'CAT-012',
    categoryName: 'Security',
    displayName: 'Security & Guest Management',
    businessName: 'Guardian Events Security Services',
    email: 'security@weddingbazaar.com',
    password: 'Security123!',
    firstName: 'Rafael',
    lastName: 'Diaz',
    phone: '+639171234578',
    description: 'Professional security and guest management for safe and smooth wedding celebrations.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Event Security', 'Guest Management', 'Parking Assistance', 'Crowd Control'],
    yearsInBusiness: 13
  },
  {
    categoryId: 'CAT-013',
    categoryName: 'AV_Equipment',
    displayName: 'Sounds & Lights',
    businessName: 'Sonic Wave Audio Visual',
    email: 'av@weddingbazaar.com',
    password: 'AVEquipment123!',
    firstName: 'Luis',
    lastName: 'Hernandez',
    phone: '+639171234579',
    description: 'Professional audio, lighting, and visual equipment for stunning wedding productions.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Sound Systems', 'Stage Lighting', 'LED Screens', 'Technical Support'],
    yearsInBusiness: 10
  },
  {
    categoryId: 'CAT-014',
    categoryName: 'Stationery',
    displayName: 'Stationery Designer',
    businessName: 'Paper & Ink Design Studio',
    email: 'stationery@weddingbazaar.com',
    password: 'Stationery123!',
    firstName: 'Carmen',
    lastName: 'Jimenez',
    phone: '+639171234580',
    description: 'Beautiful custom wedding invitations and stationery in Cavite.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Wedding Invitations', 'Save the Dates', 'Programs', 'Thank You Cards'],
    yearsInBusiness: 5
  },
  {
    categoryId: 'CAT-015',
    categoryName: 'Transport',
    displayName: 'Transportation Services',
    businessName: 'Royal Ride Wedding Transport',
    email: 'transport@weddingbazaar.com',
    password: 'Transport123!',
    firstName: 'Diego',
    lastName: 'Vargas',
    phone: '+639171234581',
    description: 'Luxury wedding transportation services for couples and guests in Dasmariñas.',
    serviceArea: 'Dasmariñas City, Cavite, Philippines',
    specialties: ['Bridal Cars', 'Guest Shuttles', 'Vintage Cars', 'Limousine Service'],
    yearsInBusiness: 8
  }
];

async function createVendorAccounts() {
  console.log('🎯 Creating vendor accounts for all 15 categories...\n');
  const location = 'Dasmariñas City, Cavite, Philippines';
  console.log(`📍 Location: ${location}\n`);

  const createdAccounts = [];

  try {
    for (const vendorData of VENDOR_CATEGORIES) {
      console.log(`\n📦 Creating: ${vendorData.businessName}`);
      console.log(`   Category: ${vendorData.displayName}`);
      console.log(`   Email: ${vendorData.email}`);
      console.log(`   Password: ${vendorData.password}`);

      // Step 1: Check if user already exists
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${vendorData.email}
      `;

      let userId;
      if (existingUser.length > 0) {
        userId = existingUser[0].id;
        console.log(`   ⚠️  User already exists, using existing ID: ${userId}`);
      } else {
        // Step 2: Hash password
        const hashedPassword = await bcrypt.hash(vendorData.password, 10);

        // Step 3: Get next vendor user ID
        const maxVendorUser = await sql`
          SELECT id FROM users 
          WHERE id LIKE '2-2025-%'
          ORDER BY id DESC 
          LIMIT 1
        `;
        
        let nextNum = 1;
        if (maxVendorUser.length > 0) {
          const lastId = maxVendorUser[0].id;
          const lastNum = parseInt(lastId.split('-')[2]);
          nextNum = lastNum + 1;
        }
        
        userId = `2-2025-${String(nextNum).padStart(3, '0')}`;

        // Step 4: Create user account with generated ID
        await sql`
          INSERT INTO users (
            id,
            email,
            password,
            first_name,
            last_name,
            phone,
            role,
            user_type,
            email_verified,
            created_at,
            updated_at
          ) VALUES (
            ${userId},
            ${vendorData.email},
            ${hashedPassword},
            ${vendorData.firstName},
            ${vendorData.lastName},
            ${vendorData.phone},
            'vendor',
            'vendor',
            true,
            NOW(),
            NOW()
          )
        `;
        console.log(`   ✅ User created: ${userId}`);
      }

      // Step 4: Check if vendor already exists
      const existingVendor = await sql`
        SELECT id FROM vendors WHERE user_id = ${userId}
      `;

      let vendorId;
      if (existingVendor.length > 0) {
        vendorId = existingVendor[0].id;
        console.log(`   ⚠️  Vendor already exists, using existing ID: ${vendorId}`);
        
        // Update vendor details
        await sql`
          UPDATE vendors
          SET 
            business_name = ${vendorData.businessName},
            business_type = ${vendorData.categoryName},
            description = ${vendorData.description},
            updated_at = NOW()
          WHERE id = ${vendorId}
        `;
        console.log(`   ✏️  Vendor updated`);
      } else {
        // Step 5: Generate vendor ID
        const maxVendor = await sql`
          SELECT id FROM vendors 
          WHERE id LIKE 'VEN-%'
          ORDER BY id DESC 
          LIMIT 1
        `;
        
        let vendorNum = 1;
        if (maxVendor.length > 0) {
          const lastId = maxVendor[0].id;
          const lastNum = parseInt(lastId.split('-')[1]);
          vendorNum = lastNum + 1;
        }
        
        vendorId = `VEN-${String(vendorNum).padStart(5, '0')}`;

        // Step 6: Create vendor profile with generated ID
        await sql`
          INSERT INTO vendors (
            id,
            user_id,
            business_name,
            business_type,
            description,
            location,
            verified,
            created_at,
            updated_at
          ) VALUES (
            ${vendorId},
            ${userId},
            ${vendorData.businessName},
            ${vendorData.categoryName},
            ${vendorData.description},
            ${location},
            true,
            NOW(),
            NOW()
          )
        `;
        console.log(`   ✅ Vendor created: ${vendorId}`);
      }

      // Step 6: Check if vendor_profile exists
      const existingProfile = await sql`
        SELECT vendor_id FROM vendor_profiles WHERE vendor_id = ${vendorId}
      `;

      if (existingProfile.length > 0) {
        // Update existing profile
        await sql`
          UPDATE vendor_profiles
          SET
            service_area = ${vendorData.serviceArea},
            years_in_business = ${vendorData.yearsInBusiness},
            specialties = ${`{${vendorData.specialties.join(',')}}`}::text[],
            updated_at = NOW()
          WHERE vendor_id = ${vendorId}
        `;
        console.log(`   ✏️  Vendor profile updated`);
      } else {
        // Create vendor_profile
        await sql`
          INSERT INTO vendor_profiles (
            vendor_id,
            service_area,
            years_in_business,
            specialties,
            created_at,
            updated_at
          ) VALUES (
            ${vendorId},
            ${vendorData.serviceArea},
            ${vendorData.yearsInBusiness},
            ${`{${vendorData.specialties.join(',')}}`}::text[],
            NOW(),
            NOW()
          )
        `;
        console.log(`   ✅ Vendor profile created`);
      }

      createdAccounts.push({
        category: vendorData.displayName,
        businessName: vendorData.businessName,
        email: vendorData.email,
        password: vendorData.password,
        userId,
        vendorId
      });
    }

    console.log('\n\n✅ All vendor accounts created!\n');
    console.log('📊 Summary:');
    console.log(`   - Total accounts: ${createdAccounts.length}`);
    console.log(`   - Categories covered: All 15 categories`);
    console.log(`   - Location: Dasmariñas City, Cavite, Philippines\n`);

    console.log('🔐 LOGIN CREDENTIALS:\n');
    console.log('═'.repeat(80));
    console.table(createdAccounts.map(acc => ({
      'Category': acc.category,
      'Business Name': acc.businessName,
      'Email': acc.email,
      'Password': acc.password
    })));
    console.log('═'.repeat(80));

    // Save credentials to file
    const fs = require('fs');
    const credentialsText = `
# VENDOR LOGIN CREDENTIALS - Wedding Bazaar
## Generated: ${new Date().toISOString()}

All vendors are located in Dasmariñas City, Cavite, Philippines

## Login Credentials:

${createdAccounts.map(acc => `
### ${acc.category}
- **Business Name**: ${acc.businessName}
- **Email**: ${acc.email}
- **Password**: ${acc.password}
- **User ID**: ${acc.userId}
- **Vendor ID**: ${acc.vendorId}
`).join('\n')}

## Quick Login Links:
- Frontend: https://weddingbazaarph.web.app
- Login as Vendor: Select "Vendor" role and use the credentials above

## Notes:
- All accounts are pre-verified and active
- All vendors have profiles with specialties and service areas
- Ready to create services and receive bookings
`;

    fs.writeFileSync('VENDOR_LOGIN_CREDENTIALS.md', credentialsText);
    console.log('\n✅ Credentials saved to: VENDOR_LOGIN_CREDENTIALS.md\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createVendorAccounts();
