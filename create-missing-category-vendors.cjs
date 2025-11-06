const { sql } = require('./backend-deploy/config/database.cjs');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-admin-key.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Categories that need dedicated vendors (those without enough representation)
const VENDOR_CREDENTIALS = [
  {
    category: 'Beauty',
    businessName: 'Glam Studios Cavite',
    email: 'vendor.beauty@weddingbazaar.ph',
    password: 'Beauty@2024',
    description: 'Professional hair and makeup artists specializing in bridal looks for Cavite weddings',
    phone: '+63 917 234 5601',
    location: 'Dasmariñas City, Cavite',
    yearsExperience: 8
  },
  {
    category: 'Florist',
    businessName: 'Petals & Blooms Floristry',
    email: 'vendor.florist@weddingbazaar.ph',
    password: 'Florist@2024',
    description: 'Elegant floral arrangements and wedding decorations crafted with love',
    phone: '+63 917 234 5602',
    location: 'Bacoor, Cavite',
    yearsExperience: 10
  },
  {
    category: 'Planning',
    businessName: 'Dream Day Wedding Planners',
    email: 'vendor.planning@weddingbazaar.ph',
    password: 'Planning@2024',
    description: 'Full-service wedding planning and coordination for stress-free celebrations',
    phone: '+63 917 234 5603',
    location: 'Imus, Cavite',
    yearsExperience: 12
  },
  {
    category: 'Venue',
    businessName: 'Grand Gardens Event Place',
    email: 'vendor.venue@weddingbazaar.ph',
    password: 'Venue@2024',
    description: 'Spacious garden and indoor venues perfect for weddings and receptions',
    phone: '+63 917 234 5604',
    location: 'Tagaytay, Cavite',
    yearsExperience: 15
  },
  {
    category: 'Music',
    businessName: 'Harmony Strings & Beats',
    email: 'vendor.music@weddingbazaar.ph',
    password: 'Music@2024',
    description: 'Live bands and DJs providing exceptional entertainment for your special day',
    phone: '+63 917 234 5605',
    location: 'Dasmariñas City, Cavite',
    yearsExperience: 9
  },
  {
    category: 'Officiant',
    businessName: 'Sacred Vows Wedding Officiants',
    email: 'vendor.officiant@weddingbazaar.ph',
    password: 'Officiant@2024',
    description: 'Professional wedding officiants for meaningful and personalized ceremonies',
    phone: '+63 917 234 5606',
    location: 'Kawit, Cavite',
    yearsExperience: 20
  },
  {
    category: 'Rentals',
    businessName: 'Premier Event Rentals Hub',
    email: 'vendor.rentals@weddingbazaar.ph',
    password: 'Rentals@2024',
    description: 'Complete event equipment and furniture rentals for weddings',
    phone: '+63 917 234 5607',
    location: 'Bacoor, Cavite',
    yearsExperience: 7
  },
  {
    category: 'Cake',
    businessName: 'Sweet Moments Cake Studio',
    email: 'vendor.cake@weddingbazaar.ph',
    password: 'Cake@2024',
    description: 'Custom wedding cakes and dessert tables designed to perfection',
    phone: '+63 917 234 5608',
    location: 'Imus, Cavite',
    yearsExperience: 6
  },
  {
    category: 'Fashion',
    businessName: 'Elegante Bridal Boutique',
    email: 'vendor.fashion@weddingbazaar.ph',
    password: 'Fashion@2024',
    description: 'Designer wedding gowns and suits tailored to your dream style',
    phone: '+63 917 234 5609',
    location: 'Dasmariñas City, Cavite',
    yearsExperience: 11
  },
  {
    category: 'Security',
    businessName: 'Elite Guard Event Security',
    email: 'vendor.security@weddingbazaar.ph',
    password: 'Security@2024',
    description: 'Professional security and guest management services for safe celebrations',
    phone: '+63 917 234 5610',
    location: 'Bacoor, Cavite',
    yearsExperience: 14
  },
  {
    category: 'AV_Equipment',
    businessName: 'SoundTech Pro AV Solutions',
    email: 'vendor.av@weddingbazaar.ph',
    password: 'AV@2024',
    description: 'Professional sound and lighting equipment for unforgettable wedding experiences',
    phone: '+63 917 234 5611',
    location: 'Tagaytay, Cavite',
    yearsExperience: 10
  },
  {
    category: 'Stationery',
    businessName: 'Ink & Paper Design Studio',
    email: 'vendor.stationery@weddingbazaar.ph',
    password: 'Stationery@2024',
    description: 'Beautiful custom wedding invitations and stationery that tell your love story',
    phone: '+63 917 234 5612',
    location: 'Imus, Cavite',
    yearsExperience: 5
  },
  {
    category: 'Transport',
    businessName: 'Luxury Ride Wedding Cars',
    email: 'vendor.transport@weddingbazaar.ph',
    password: 'Transport@2024',
    description: 'Premium wedding car rentals and transportation services',
    phone: '+63 917 234 5613',
    location: 'Dasmariñas City, Cavite',
    yearsExperience: 8
  }
];

async function createVendorAccount(vendorData) {
  try {
    console.log(`\n🏗️ Creating vendor account for ${vendorData.category}: ${vendorData.businessName}`);
    
    // 1. Create Firebase Auth user
    console.log('   📧 Creating Firebase Auth account...');
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email: vendorData.email,
        password: vendorData.password,
        displayName: vendorData.businessName,
        emailVerified: true
      });
      console.log(`   ✅ Firebase user created: ${firebaseUser.uid}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('   ⚠️ Firebase user already exists, fetching...');
        firebaseUser = await admin.auth().getUserByEmail(vendorData.email);
        console.log(`   ✅ Found existing Firebase user: ${firebaseUser.uid}`);
      } else {
        throw error;
      }
    }
    
    // 2. Create user in database
    console.log('   💾 Creating database user record...');
    const hashedPassword = await bcrypt.hash(vendorData.password, 10);
    
    // Check if user exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${vendorData.email}
    `;
    
    let userId;
    if (existingUser.length > 0) {
      userId = existingUser[0].id;
      console.log(`   ⚠️ User already exists with ID: ${userId}`);
    } else {
      // Generate a unique ID that fits VARCHAR(20)
      const timestamp = Date.now().toString().slice(-8);
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      userId = `VU-${timestamp}-${randomPart}`; // e.g., VU-12345678-ABCD
      
      await sql`
        INSERT INTO users (id, email, password, first_name, user_type, phone, email_verified, firebase_uid, role)
        VALUES (
          ${userId},
          ${vendorData.email},
          ${hashedPassword},
          ${vendorData.businessName},
          'vendor',
          ${vendorData.phone},
          true,
          ${firebaseUser.uid},
          'vendor'
        )
      `;
      console.log(`   ✅ User created with ID: ${userId}`);
    }
    
    // 3. Create vendor record
    console.log('   🏢 Creating vendor record...');
    
    // Check if vendor exists
    const existingVendor = await sql`
      SELECT * FROM vendors WHERE user_id = ${userId}
    `;
    
    let vendorId;
    if (existingVendor.length > 0) {
      vendorId = existingVendor[0].id;
      console.log(`   ⚠️ Vendor already exists with ID: ${vendorId}`);
    } else {
      // Generate vendor ID in format: VEN-XXXXX
      const vendorCount = await sql`SELECT COUNT(*) as count FROM vendors`;
      const vendorNumber = String(parseInt(vendorCount[0].count) + 1).padStart(5, '0');
      vendorId = `VEN-${vendorNumber}`;
      
      await sql`
        INSERT INTO vendors (id, user_id, business_name, business_type, description, location, years_experience, verified, rating, vendor_type)
        VALUES (
          ${vendorId},
          ${userId},
          ${vendorData.businessName},
          ${vendorData.category},
          ${vendorData.description},
          ${vendorData.location},
          ${vendorData.yearsExperience},
          true,
          4.5,
          'business'
        )
      `;
      console.log(`   ✅ Vendor created with ID: ${vendorId}`);
    }
    
    // 4. Create vendor_profiles record
    console.log('   📋 Creating vendor profile...');
    
    const existingProfile = await sql`
      SELECT * FROM vendor_profiles WHERE user_id = ${userId}
    `;
    
    if (existingProfile.length > 0) {
      console.log('   ⚠️ Vendor profile already exists');
    } else {
      await sql`
        INSERT INTO vendor_profiles (
          user_id,
          business_name,
          business_description,
          business_type,
          service_area,
          years_in_business,
          vendor_type
        )
        VALUES (
          ${userId},
          ${vendorData.businessName},
          ${vendorData.description},
          ${vendorData.category},
          ${vendorData.location},
          ${vendorData.yearsExperience},
          'business'
        )
      `;
      console.log('   ✅ Vendor profile created');
    }
    
    return {
      success: true,
      userId,
      vendorId,
      firebaseUid: firebaseUser.uid,
      email: vendorData.email,
      password: vendorData.password,
      category: vendorData.category,
      businessName: vendorData.businessName
    };
    
  } catch (error) {
    console.error(`   ❌ Error creating vendor account:`, error.message);
    return {
      success: false,
      error: error.message,
      email: vendorData.email,
      category: vendorData.category
    };
  }
}

async function main() {
  console.log('🚀 Creating Missing Category Vendor Accounts');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const vendorData of VENDOR_CREDENTIALS) {
    const result = await createVendorAccount(vendorData);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between creations
  }
  
  console.log('\n');
  console.log('='.repeat(60));
  console.log('📊 SUMMARY OF VENDOR ACCOUNT CREATION');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Successfully created: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 VENDOR LOGIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log('Save these credentials for testing:\n');
    
    successful.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.category} - ${vendor.businessName}`);
      console.log(`   Email: ${vendor.email}`);
      console.log(`   Password: ${vendor.password}`);
      console.log(`   Vendor ID: ${vendor.vendorId}`);
      console.log(`   Firebase UID: ${vendor.firebaseUid}`);
      console.log('');
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED ACCOUNTS');
    console.log('='.repeat(60));
    failed.forEach(vendor => {
      console.log(`- ${vendor.category}: ${vendor.error}`);
    });
  }
  
  process.exit(0);
}

main();
