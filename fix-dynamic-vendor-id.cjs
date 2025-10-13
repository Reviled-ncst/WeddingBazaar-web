const fs = require('fs').promises;

console.log('🔧 DYNAMIC VENDOR ID FIX');
console.log('========================');

async function fixDynamicVendorId() {
  console.log('\n🎯 Making vendor bookings properly dynamic...');
  
  try {
    // Fix VendorBookings component to use dynamic vendor ID
    const vendorBookingsPath = 'src/pages/users/vendor/bookings/VendorBookings.tsx';
    let content = await fs.readFile(vendorBookingsPath, 'utf8');
    
    // Look for the hardcoded vendor ID logic
    const oldLogic = `  // Use authenticated vendor ID - For vendors, user.id IS the vendor ID
  // TEMPORARY: Use vendor "2" since that's where the actual bookings are in the database
  // SECURITY: Only allow authenticated vendors to access bookings
  const vendorId = user?.role === 'vendor' ? user.id : user?.vendorId;`;
    
    const newLogic = `  // Use authenticated vendor ID - For vendors, user.id IS the vendor ID
  // DYNAMIC: Use the actual authenticated vendor's ID
  const vendorId = user?.role === 'vendor' ? user.id : user?.vendorId;`;
    
    if (content.includes(oldLogic)) {
      content = content.replace(oldLogic, newLogic);
      console.log('✅ Updated VendorBookings to use dynamic vendor ID');
    } else {
      console.log('⚠️ VendorBookings logic already updated or not found');
    }
    
    // Also look for any hardcoded references to 2-2025-003
    if (content.includes('2-2025-003')) {
      console.log('⚠️ Found hardcoded vendor ID references in VendorBookings');
      // Remove any fallback hardcoded values
      content = content.replace(/\|\| '2-2025-003'/g, '');
      content = content.replace(/'2-2025-003'/g, 'user?.id || "unknown"');
    }
    
    await fs.writeFile(vendorBookingsPath, content, 'utf8');
    
    // Fix VendorServices component as well
    const vendorServicesPath = 'src/pages/users/vendor/services/VendorServices.tsx';
    try {
      let servicesContent = await fs.readFile(vendorServicesPath, 'utf8');
      
      // Look for hardcoded vendor ID
      const oldServicesLogic = `const vendorId = user?.id || '2-2025-003';`;
      const newServicesLogic = `const vendorId = user?.id || '';`;
      
      if (servicesContent.includes(oldServicesLogic)) {
        servicesContent = servicesContent.replace(oldServicesLogic, newServicesLogic);
        console.log('✅ Updated VendorServices to use dynamic vendor ID');
        await fs.writeFile(vendorServicesPath, servicesContent, 'utf8');
      }
    } catch (error) {
      console.log('⚠️ VendorServices file not found or already updated');
    }
    
    // Now we need to check what the actual user object looks like when logged in
    console.log('\n🔍 AUTHENTICATION ANALYSIS');
    console.log('==========================');
    
    // Check AuthContext to see what user data is being stored
    const authContextPath = 'src/shared/contexts/AuthContext.tsx';
    const authContent = await fs.readFile(authContextPath, 'utf8');
    
    // Look for user data mapping
    if (authContent.includes('mappedUser')) {
      console.log('✅ AuthContext maps backend user data');
    }
    
    console.log('\n📋 NEXT STEPS FOR TESTING:');
    console.log('1. Clear localStorage and sessionStorage');
    console.log('2. Login as a vendor user');
    console.log('3. Check console for user object structure');
    console.log('4. Verify vendor ID is correctly extracted');
    
    console.log('\n🧪 DEBUGGING STEPS:');
    console.log('Add this to VendorBookings component for debugging:');
    console.log(`
    console.log('🔍 USER OBJECT DEBUG:', {
      'user': user,
      'user?.id': user?.id,
      'user?.role': user?.role,
      'user?.vendorId': user?.vendorId,
      'user?.businessName': user?.businessName,
      'typeof user?.id': typeof user?.id,
      'final vendorId': vendorId
    });
    `);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error fixing dynamic vendor ID:', error);
    return false;
  }
}

async function createTestLoginScript() {
  console.log('\n🧪 Creating test login script...');
  
  const testScript = `
<!DOCTYPE html>
<html>
<head>
    <title>Vendor Login Test</title>
</head>
<body>
    <h1>Test Vendor Login</h1>
    <button onclick="testLogin()">Login as Test Vendor</button>
    <div id="results"></div>
    
    <script>
    async function testLogin() {
        const results = document.getElementById('results');
        results.innerHTML = '<p>Testing login...</p>';
        
        try {
            const response = await fetch('https://weddingbazaar-web.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'vendor@test.com',
                    password: 'password123'
                })
            });
            
            const data = await response.json();
            console.log('Login response:', data);
            
            if (data.success && data.user) {
                results.innerHTML = \`
                    <h3>Login Successful!</h3>
                    <p><strong>User ID:</strong> \${data.user.id}</p>
                    <p><strong>Email:</strong> \${data.user.email}</p>
                    <p><strong>Role:</strong> \${data.user.role || data.user.userType}</p>
                    <p><strong>Business Name:</strong> \${data.user.businessName || 'N/A'}</p>
                    <p><strong>Vendor ID:</strong> \${data.user.vendorId || 'N/A'}</p>
                    <pre>\${JSON.stringify(data.user, null, 2)}</pre>
                \`;
            } else {
                results.innerHTML = '<p>Login failed: ' + (data.message || 'Unknown error') + '</p>';
            }
        } catch (error) {
            results.innerHTML = '<p>Error: ' + error.message + '</p>';
            console.error('Login error:', error);
        }
    }
    </script>
</body>
</html>
  `;
  
  await fs.writeFile('test-vendor-login.html', testScript.trim(), 'utf8');
  console.log('✅ Created test-vendor-login.html');
}

async function main() {
  const success = await fixDynamicVendorId();
  await createTestLoginScript();
  
  if (success) {
    console.log('\n🎉 DYNAMIC VENDOR ID FIX COMPLETE!');
    console.log('=====================================');
    console.log('✅ Updated components to use authenticated user ID');
    console.log('✅ Removed hardcoded vendor ID references');
    console.log('✅ Created test login script');
    console.log('\n🚀 DEPLOY THESE CHANGES:');
    console.log('1. npm run build');
    console.log('2. npm run deploy:quick');
    console.log('\n🧪 TEST THE FIX:');
    console.log('1. Open test-vendor-login.html');
    console.log('2. Test login to see actual user data structure');
    console.log('3. Use browser dev tools to check vendor bookings API calls');
  } else {
    console.log('\n❌ FIX FAILED - Manual intervention required');
  }
}

main().catch(console.error);
