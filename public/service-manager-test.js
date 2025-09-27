// Direct Service Manager Test - Run this in browser console
async function testServiceManagerLogic() {
    console.log('🧪 Testing Service Manager Logic...');
    
    const apiUrl = 'http://localhost:3001';
    const endpoints = [
        '/api/database/scan',
        '/api/services/emergency', 
        '/api/services',
        '/api/services/simple',
        '/api/services/direct'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`📡 [TEST] *** TRYING ENDPOINT: ${endpoint} ***`);
            console.log(`📡 [TEST] Full URL: ${apiUrl}${endpoint}`);
            
            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Accept': 'application/json'
                }
            });

            console.log(`📊 [TEST] Response status: ${response.status} ${response.statusText}`);
            console.log(`📊 [TEST] Response OK: ${response.ok}`);

            if (response.ok) {
                const data = await response.json();
                console.log(`📋 [TEST] Raw response data:`, data);
                console.log(`📋 [TEST] Data type:`, typeof data);
                console.log(`📋 [TEST] Data keys:`, Object.keys(data));
                
                // Check if this matches Service Manager expectations
                if (data.success && data.services && Array.isArray(data.services)) {
                    console.log(`✅ [TEST] ${endpoint} would work for Service Manager!`);
                    console.log(`📊 [TEST] Services count: ${data.services.length}`);
                    console.log(`🔍 [TEST] First service:`, data.services[0]);
                    
                    // Test the mapping function logic
                    const firstService = data.services[0];
                    console.log(`🧪 [TEST] Service mapping test:`, {
                        id: firstService.id,
                        name: firstService.name || firstService.title,
                        category: firstService.category,
                        price: firstService.price,
                        description: firstService.description,
                        hasVendorId: !!firstService.vendorId || !!firstService.vendor_id
                    });
                    
                    return {
                        success: true,
                        endpoint: endpoint,
                        services: data.services.length,
                        message: `SUCCESS: Found ${data.services.length} services from ${endpoint}`
                    };
                } else {
                    console.log(`⚠️ [TEST] ${endpoint} response format issue:`, {
                        hasSuccess: 'success' in data,
                        successValue: data.success,
                        hasServices: 'services' in data,
                        servicesIsArray: Array.isArray(data.services),
                        servicesLength: data.services?.length
                    });
                }
            } else {
                console.log(`❌ [TEST] ${endpoint} failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error(`❌ [TEST] ${endpoint} error:`, error.message);
        }
    }
    
    console.log('❌ [TEST] All endpoints failed - this should NOT happen!');
    return {
        success: false,
        message: 'All endpoints failed'
    };
}

// Run the test
testServiceManagerLogic().then(result => {
    console.log('🏁 [TEST] Final result:', result);
    
    if (result.success) {
        console.log('✅ [TEST] Service Manager SHOULD work with these settings!');
        console.log('🔧 [TEST] If Services page still shows "Coming Soon", check component logic');
    } else {
        console.log('❌ [TEST] Service Manager would fail - API issues detected');
    }
});

console.log('🚀 Service Manager test started - check console for results...');
