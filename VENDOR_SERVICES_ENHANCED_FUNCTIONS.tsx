// Enhanced fetch services function with proper data handling and image URL processing
// This replaces the existing fetchServices function in VendorServices.tsx

const fetchServices = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('🔍 [VendorServices] Fetching services for vendor:', vendorId);
    
    // Helper function to normalize service data and fix image URLs
    const normalizeService = (rawService: any): Service => {
      // Handle image URL - prioritize imageUrl, then image, then images array
      let imageUrl = rawService.imageUrl || rawService.image;
      
      // If no direct image, check images array
      if (!imageUrl && rawService.images && Array.isArray(rawService.images) && rawService.images.length > 0) {
        imageUrl = rawService.images[0];
      }
      
      // Ensure image URL is valid - handle Unsplash URLs properly
      if (imageUrl) {
        // If it's already a valid HTTP URL, use it as is
        if (imageUrl.startsWith('http')) {
          // For Unsplash URLs, ensure proper parameters
          if (imageUrl.includes('unsplash.com')) {
            imageUrl = imageUrl.includes('?') ? imageUrl : `${imageUrl}?w=600&h=400&fit=crop`;
          }
        } else {
          // If it's a relative URL, make it absolute
          imageUrl = imageUrl.startsWith('/') 
            ? `${apiUrl}${imageUrl}` 
            : `${apiUrl}/${imageUrl}`;
        }
      }
      
      // Handle price - ensure it's a string
      let price = '0.00';
      if (rawService.price) {
        price = typeof rawService.price === 'string' ? rawService.price : String(rawService.price);
      } else if (rawService.priceRange) {
        price = rawService.priceRange;
      }
      
      return {
        id: rawService.id || `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        vendorId: rawService.vendorId || rawService.vendor_id || vendorId,
        name: rawService.name || rawService.title || 'Unnamed Service',
        description: rawService.description || 'No description available',
        category: rawService.category || 'General',
        price: price,
        imageUrl: imageUrl || null,
        images: rawService.images || (imageUrl ? [imageUrl] : []),
        rating: typeof rawService.rating === 'number' ? rawService.rating : parseFloat(rawService.rating) || 4.5,
        reviewCount: rawService.reviewCount || rawService.review_count || 0,
        isActive: rawService.isActive !== undefined ? rawService.isActive : (rawService.is_active !== undefined ? rawService.is_active : true),
        featured: rawService.featured || false,
        // Additional fields
        vendor_name: rawService.vendor_name || rawService.vendorName,
        location: rawService.location,
        features: Array.isArray(rawService.features) ? rawService.features : [],
        contact_info: rawService.contact_info || rawService.contactInfo || {},
        created_at: rawService.created_at || new Date().toISOString(),
        updated_at: rawService.updated_at || new Date().toISOString()
      };
    };
    
    // Strategy 1: Use centralized ServicesApiService
    try {
      console.log('📡 [VendorServices] Using centralized ServicesApiService...');
      const apiServices = await ServicesApiService.getServicesByVendor(vendorId);
      console.log('✅ [VendorServices] Centralized API response:', apiServices);
      
      if (Array.isArray(apiServices) && apiServices.length > 0) {
        const normalizedServices = apiServices.map(normalizeService);
        setServices(normalizedServices);
        console.log('✅ [VendorServices] Found', normalizedServices.length, 'services via centralized API');
        console.log('📸 [VendorServices] Sample service images:', normalizedServices.slice(0, 3).map(s => ({ name: s.name, imageUrl: s.imageUrl })));
        return;
      } else {
        console.log('📝 [VendorServices] No services found via centralized API');
      }
    } catch (centralizedError) {
      console.warn('⚠️ [VendorServices] Centralized API failed:', centralizedError);
    }
    
    // Strategy 2: Try direct API endpoints
    const directEndpoints = [
      `${apiUrl}/api/services?vendorId=${vendorId}`,
      `${apiUrl}/api/vendors/${vendorId}/services`,
      `${apiUrl}/api/services/vendor/${vendorId}`
    ];
    
    for (const endpoint of directEndpoints) {
      try {
        console.log('📡 [VendorServices] Trying direct endpoint:', endpoint);
        const response = await fetch(endpoint);
        console.log('📡 [VendorServices] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ [VendorServices] Direct API response:', data);
          
          let servicesArray = [];
          
          // Handle different response formats
          if (data.services && Array.isArray(data.services)) {
            servicesArray = data.services;
          } else if (Array.isArray(data)) {
            servicesArray = data;
          } else if (data.data && Array.isArray(data.data)) {
            servicesArray = data.data;
          }
          
          if (servicesArray.length > 0) {
            const normalizedServices = servicesArray.map(normalizeService);
            setServices(normalizedServices);
            console.log('✅ [VendorServices] Found', normalizedServices.length, 'services via direct API');
            console.log('📸 [VendorServices] Sample service images:', normalizedServices.slice(0, 3).map(s => ({ name: s.name, imageUrl: s.imageUrl })));
            return;
          }
        }
      } catch (directError) {
        console.warn(`⚠️ [VendorServices] Direct endpoint ${endpoint} failed:`, directError);
      }
    }
    
    // Strategy 3: Create sample services for development/testing
    console.log('📝 [VendorServices] No real services found - offering sample services option');
    setServices([]);
    setError('No services found. Use the debug panel to load sample services for testing, or click "Add Service" to create your first service.');
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services';
    console.error('❌ [VendorServices] Overall fetch error:', err);
    setError(errorMessage);
    setServices([]);
  } finally {
    setLoading(false);
  }
};

// Enhanced createSampleServices function with high-quality images
const createSampleServices = () => {
  console.log('🎭 [VendorServices] Creating sample services with high-quality images...');
  
  const sampleServices: Service[] = [
    {
      id: `sample-photo-${vendorId}`,
      vendorId: vendorId,
      name: 'Premium Wedding Photography',
      description: 'Professional wedding photography capturing your special moments with artistic flair. Includes pre-wedding shoot, full ceremony coverage, reception photos, and 500+ edited high-resolution images.',
      category: 'Photographer & Videographer',
      price: '75000.00',
      imageUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop&auto=format&q=80',
      images: [
        'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=600&h=400&fit=crop&auto=format&q=80'
      ],
      rating: 4.8,
      reviewCount: 23,
      isActive: true,
      featured: true,
      vendor_name: 'Elite Photography Studios',
      location: 'Metro Manila, Philippines',
      features: ['Pre-wedding Shoot', 'Full Day Coverage', 'Same Day Edit', 'Online Gallery'],
      contact_info: {
        phone: '+63917-123-4567',
        email: 'info@elitephoto.ph',
        website: 'https://elitephoto.ph'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: `sample-makeup-${vendorId}`,
      vendorId: vendorId,
      name: 'Bridal Makeup & Hair Styling',
      description: 'Complete bridal makeover service including trial makeup, hair styling, makeup touch-ups throughout the day, and premium cosmetics for a flawless look.',
      category: 'Hair & Makeup Artists',
      price: '25000.00',
      imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format&q=80',
      images: [
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop&auto=format&q=80'
      ],
      rating: 4.9,
      reviewCount: 18,
      isActive: true,
      featured: false,
      vendor_name: 'Glamour Beauty Studio',
      location: 'Makati City, Philippines',
      features: ['Trial Makeup', 'Hair Styling', 'Touch-up Kit', 'Airbrush Makeup'],
      contact_info: {
        phone: '+63917-234-5678',
        email: 'info@glamourbeauty.ph'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: `sample-planning-${vendorId}`,
      vendorId: vendorId,
      name: 'Full Wedding Planning & Coordination',
      description: 'Complete wedding planning service from initial consultation to day-of coordination. Includes venue selection, vendor coordination, timeline management, and stress-free execution.',
      category: 'Wedding Planner',
      price: '150000.00',
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop&auto=format&q=80',
      images: [
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop&auto=format&q=80'
      ],
      rating: 4.7,
      reviewCount: 31,
      isActive: true,
      featured: true,
      vendor_name: 'Perfect Wedding Planners',
      location: 'Quezon City, Philippines',
      features: ['Full Planning', 'Vendor Coordination', 'Day-of Management', 'Timeline Creation'],
      contact_info: {
        phone: '+63917-345-6789',
        email: 'info@perfectweddings.ph',
        website: 'https://perfectweddings.ph'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: `sample-catering-${vendorId}`,
      vendorId: vendorId,
      name: 'Premium Wedding Catering',
      description: 'Exquisite wedding catering with personalized menus, professional service staff, complete table setup, and dietary accommodations for your special day.',
      category: 'Caterer',
      price: '2500.00', // per person
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&auto=format&q=80',
      images: [
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&auto=format&q=80'
      ],
      rating: 4.6,
      reviewCount: 42,
      isActive: true,
      featured: false,
      vendor_name: 'Divine Catering Services',
      location: 'Pasig City, Philippines',
      features: ['Custom Menus', 'Professional Service', 'Table Setup', 'Dietary Options'],
      contact_info: {
        phone: '+63917-456-7890',
        email: 'info@divinecatering.ph'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  setServices(sampleServices);
  setError(null);
  console.log('✅ [VendorServices] Created', sampleServices.length, 'sample services with high-quality images');
  console.log('📸 [VendorServices] Sample service images:', sampleServices.map(s => ({ name: s.name, imageUrl: s.imageUrl })));
};
