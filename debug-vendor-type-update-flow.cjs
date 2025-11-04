require('dotenv').config();

// Simulate frontend update request
const testFrontendUpdate = {
  businessName: 'Boutique',
  businessType: 'Venue',
  vendorType: 'freelancer',  // ← THIS IS WHAT FRONTEND SENDS
  description: 'Test description',
  location: 'Tagaytay City, Cavite',
  yearsInBusiness: 5,
  website: '',
  serviceArea: 'Tagaytay City, Cavite',
  phone: '',
  email: '',
  profileImage: '',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  }
};

console.log('🧪 TESTING BACKEND UPDATE LOGIC\n');
console.log('📦 Frontend sends this data:');
console.log(JSON.stringify(testFrontendUpdate, null, 2));
console.log('\n🔍 What happens in backend...\n');

// Simulate backend processing (from vendor-profile.cjs line 642-658)
const updateData = testFrontendUpdate;

const updates = {
  businessName: updateData.businessName || updateData.business_name,
  businessType: updateData.businessType || updateData.business_type,
  vendorType: updateData.vendorType || updateData.vendor_type,  // ← BACKEND EXTRACTS THIS
  businessDescription: updateData.description || updateData.business_description,
  serviceArea: updateData.location || updateData.serviceArea || updateData.service_areas,
  yearsInBusiness: updateData.yearsInBusiness || updateData.years_in_business,
  website: updateData.website || updateData.website_url,
  phone: updateData.phone || updateData.contact_phone,
  email: updateData.email || updateData.contact_email,
  socialMedia: updateData.socialMedia || updateData.social_media,
  profileImage: updateData.profileImage || updateData.featured_image_url
};

console.log('🔧 Backend processes data into updates object:');
console.log('   vendorType:', updates.vendorType);
console.log('\n📝 Backend SQL UPDATE will use:');
console.log('   vendor_type = COALESCE(' + updates.vendorType + ', vendor_type)');
console.log('\n💡 COALESCE logic:');
console.log('   - If updates.vendorType is "freelancer" → UPDATE to "freelancer" ✅');
console.log('   - If updates.vendorType is NULL/undefined → KEEP existing value ✅');
console.log('   - If updates.vendorType is "business" → UPDATE to "business" ✅');

console.log('\n🤔 THE REAL QUESTION:');
console.log('   Does the frontend ACTUALLY send vendorType: "freelancer"?');
console.log('   Or does it send vendorType: "business" (the default)?');

console.log('\n📊 Next step: Check browser DevTools Network tab');
console.log('   1. Open VendorProfile page');
console.log('   2. Select "Freelancer" from dropdown');
console.log('   3. Click "Save Changes"');
console.log('   4. Check the PUT request payload');
console.log('   5. Verify vendorType value in the request body');
