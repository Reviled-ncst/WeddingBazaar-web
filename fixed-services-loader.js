// Fixed Services Loading Logic - Enhanced to properly load both vendors and services

const loadServicesFromAPI = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
  let allServicesData = [];

  console.log('🔍 ENHANCED: Loading ALL available data from production API...');

  // Helper function to convert vendor to service format
  const convertVendorToService = (vendor, prefix = 'vendor') => ({
    id: vendor.id || `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: vendor.name || vendor.business_name || 'Unnamed Service',
    category: vendor.category || vendor.business_type || 'General',
    vendorId: vendor.id || vendor.vendor_id,
    vendorName: vendor.name || vendor.business_name,
    vendorImage: vendor.image || vendor.profile_image || vendor.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    description: vendor.description || vendor.bio || `Professional ${vendor.category || vendor.business_type || 'wedding'} services`,
    priceRange: vendor.price_range || vendor.priceRange || '₱₱',
    location: vendor.location || vendor.address || 'Philippines',
    rating: typeof vendor.rating === 'number' ? vendor.rating : parseFloat(vendor.rating) || 4.5,
    reviewCount: vendor.review_count || vendor.reviewCount || vendor.reviews_count || 0,
    image: vendor.image || vendor.profile_image || vendor.main_image || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
    gallery: vendor.gallery || vendor.images || [],
    features: vendor.features || vendor.specialties || vendor.services || [],
    availability: vendor.availability !== false,
    contactInfo: {
      phone: vendor.phone || vendor.contact_phone,
      email: vendor.email || vendor.contact_email,
      website: vendor.website || vendor.business_website
    }
  });

  // Helper function to convert service to service format  
  const convertServiceToService = (service) => ({
    id: service.id || `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: service.name || service.service_name || 'Unnamed Service',
    category: service.category || service.service_category || 'General',
    vendorId: service.vendor_id || service.vendorId,
    vendorName: service.vendor_name || service.vendorName || 'Unknown Vendor',
    vendorImage: service.vendor_image || service.vendorImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    description: service.description || `Professional ${service.category || 'wedding'} service`,
    priceRange: service.price_range || service.priceRange || '₱₱',
    location: service.location || 'Philippines',
    rating: typeof service.rating === 'number' ? service.rating : parseFloat(service.rating) || 4.5,
    reviewCount: service.review_count || service.reviewCount || 0,
    image: service.image || service.main_image || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
    gallery: service.gallery || service.images || [],
    features: service.features || service.tags || [],
    availability: service.availability !== false,
    contactInfo: {
      phone: service.phone || service.contact_phone,
      email: service.email || service.contact_email,
      website: service.website
    }
  });

  try {
    // PRIORITY 1: Load dedicated services from /api/services
    console.log('🔍 PRIORITY 1: Loading services from /api/services...');
    const servicesResponse = await fetch(`${apiUrl}/api/services`);
    if (servicesResponse.ok) {
      const servicesData = await servicesResponse.json();
      console.log('📊 Services endpoint response:', servicesData);
      
      if (servicesData.success && servicesData.services && Array.isArray(servicesData.services) && servicesData.services.length > 0) {
        const convertedServices = servicesData.services.map(convertServiceToService);
        allServicesData.push(...convertedServices);
        console.log(`✅ Loaded ${convertedServices.length} dedicated services from /api/services`);
      } else if (servicesData.services && typeof servicesData.services === 'object' && Object.keys(servicesData.services).length === 0) {
        console.log('⚠️ /api/services returned empty object - no services in database');
      } else {
        console.log('⚠️ No services found in /api/services response');
      }
    } else {
      console.warn(`❌ /api/services endpoint failed with status: ${servicesResponse.status}`);
    }
  } catch (error) {
    console.warn('❌ Failed to load from /api/services:', error);
  }

  try {
    // PRIORITY 2: Load ALL vendors from /api/vendors and convert to services
    console.log('🔍 PRIORITY 2: Loading vendors from /api/vendors...');
    const vendorsResponse = await fetch(`${apiUrl}/api/vendors`);
    if (vendorsResponse.ok) {
      const vendorsData = await vendorsResponse.json();
      console.log('📊 Vendors endpoint response:', vendorsData);
      
      if (vendorsData.success && vendorsData.vendors && Array.isArray(vendorsData.vendors) && vendorsData.vendors.length > 0) {
        const convertedVendors = vendorsData.vendors.map(vendor => convertVendorToService(vendor, 'vendor'));
        allServicesData.push(...convertedVendors);
        console.log(`✅ Loaded ${convertedVendors.length} vendors as services from /api/vendors`);
      } else {
        console.log('⚠️ No vendors found in /api/vendors response');
      }
    } else {
      console.warn(`❌ /api/vendors endpoint failed with status: ${vendorsResponse.status}`);
    }
  } catch (error) {
    console.warn('❌ Failed to load from /api/vendors:', error);
  }

  try {
    // PRIORITY 3: If still no data, try featured vendors as fallback
    if (allServicesData.length === 0) {
      console.log('🔍 PRIORITY 3: Loading featured vendors as fallback...');
      const featuredResponse = await fetch(`${apiUrl}/api/vendors/featured`);
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json();
        console.log('📋 Featured vendors response:', featuredData);
        
        if (featuredData.vendors && Array.isArray(featuredData.vendors)) {
          const convertedFeatured = featuredData.vendors.map(vendor => convertVendorToService(vendor, 'featured'));
          allServicesData.push(...convertedFeatured);
          console.log(`✅ Loaded ${convertedFeatured.length} featured vendors as fallback`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to load featured vendors:', error);
  }

  // Remove duplicates based on id and name
  const uniqueServices = allServicesData.reduce((acc, current) => {
    const existingService = acc.find(service => 
      service.id === current.id || 
      (service.name === current.name && service.vendorId === current.vendorId)
    );
    if (!existingService) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Final check - use mock data if no real data available
  if (uniqueServices.length === 0) {
    console.warn('⚠️ No real data available from any API endpoint, using mock data fallback');
    return mockServicesData;
  }

  console.log(`🎉 Successfully loaded ${uniqueServices.length} total services from multiple sources`);
  console.log(`📊 Breakdown: ${uniqueServices.filter(s => !s.id.startsWith('mock')).length} real, ${uniqueServices.filter(s => s.id.startsWith('mock')).length} mock`);
  
  return uniqueServices;
};

export { loadServicesFromAPI };
