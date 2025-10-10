// Script to analyze services data structure
import fetch from 'node-fetch';

async function analyzeServicesData() {
    try {
        console.log('🔍 Fetching services data from API...');
        const response = await fetch('https://weddingbazaar-web.onrender.com/api/services');
        const data = await response.json();
        
        console.log('📊 API Response Structure:');
        console.log('- Success:', data.success);
        console.log('- Total Services:', data.services?.length || 0);
        
        if (data.services && data.services.length > 0) {
            console.log('\n🎯 Sample Service Structure:');
            const sample = data.services[0];
            console.log(JSON.stringify(sample, null, 2));
            
            console.log('\n📸 Image Analysis:');
            data.services.slice(0, 5).forEach((service, index) => {
                console.log(`\nService ${index + 1}: ${service.name || service.title || 'Unnamed'}`);
                console.log(`- ID: ${service.id}`);
                console.log(`- Category: ${service.category}`);
                console.log(`- Vendor ID: ${service.vendor_id}`);
                console.log(`- Has main image: ${!!service.image}`);
                console.log(`- Has images array: ${!!service.images}`);
                console.log(`- Has gallery: ${!!service.gallery}`);
                
                if (service.images) {
                    console.log(`- Images count: ${service.images.length}`);
                    console.log(`- Images: ${JSON.stringify(service.images)}`);
                }
                
                if (service.gallery) {
                    console.log(`- Gallery count: ${service.gallery.length}`);
                    console.log(`- Gallery: ${JSON.stringify(service.gallery)}`);
                }
                
                if (service.features) {
                    console.log(`- Features: ${JSON.stringify(service.features)}`);
                }
                
                console.log(`- Price: ${service.price}`);
                console.log(`- Rating: ${service.rating}`);
                console.log(`- Location: ${service.location}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error analyzing services data:', error);
    }
}

analyzeServicesData();
