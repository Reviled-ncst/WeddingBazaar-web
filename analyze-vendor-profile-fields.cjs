const https = require('https');

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js Test Script'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function analyzeVendorProfileFields() {
  console.log('🔍 Analyzing vendor profile data structure...\n');

  const realVendorId = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';

  try {
    // Get the full vendor profile
    const profile = await makeRequest(`https://weddingbazaar-web.onrender.com/api/vendor-profile/${realVendorId}`);
    
    console.log('📋 FULL VENDOR PROFILE DATA:');
    console.log(JSON.stringify(profile, null, 2));
    
    console.log('\n📊 FIELD ANALYSIS:');
    console.log('================================');
    
    // Analyze each field that should be shown in Business Information
    const fields = {
      'Business Name': profile.businessName || profile.business_name,
      'Business Type': profile.businessType || profile.business_type,
      'Business Description': profile.businessDescription || profile.business_description,
      'Years in Business': profile.yearsInBusiness || profile.years_in_business,
      'Phone': profile.phone || profile.contact_phone,
      'Email': profile.email || profile.contact_email,
      'Website': profile.website || profile.website_url || profile.contact_website,
      'Service Areas': profile.serviceAreas || profile.service_areas,
      'Social Media': profile.socialMedia || profile.social_media,
      'Location': profile.location,
      'Portfolio Images': profile.portfolioImages || profile.portfolio_images,
      'Featured Image': profile.featuredImageUrl || profile.featured_image_url
    };
    
    Object.entries(fields).forEach(([fieldName, value]) => {
      const status = value ? '✅' : '❌';
      console.log(`${status} ${fieldName}: ${JSON.stringify(value)}`);
    });
    
    console.log('\n🔧 FIELD MAPPING ISSUES:');
    console.log('================================');
    
    // Check for field mismatches
    if (!profile.businessDescription && !profile.business_description) {
      console.log('❌ Business Description is empty - needs user input');
    }
    
    if (!profile.yearsInBusiness && !profile.years_in_business) {
      console.log('❌ Years in Business is empty - needs user input');
    }
    
    if (!profile.website && !profile.website_url && !profile.contact_website) {
      console.log('❌ Website is empty - needs user input');
    }
    
    if (!profile.socialMedia && !profile.social_media) {
      console.log('❌ Social Media is empty - needs user input');
    }
    
    console.log('\n📝 RECOMMENDED FRONTEND FIXES:');
    console.log('================================');
    console.log('1. Fix field mapping to use correct backend field names');
    console.log('2. Add proper fallbacks for empty fields');
    console.log('3. Update social media structure to match backend');
    console.log('4. Change "Years of Experience" to "Years Established"');
    console.log('5. Ensure all form fields map to correct backend fields');

  } catch (error) {
    console.error('❌ Error analyzing profile:', error.message);
  }
}

analyzeVendorProfileFields();
