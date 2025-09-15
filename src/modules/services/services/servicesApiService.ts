import type { Service, ServiceSearchParams, ServiceResponse } from '../types';
import type { ServiceCategory } from '../../../shared/types/comprehensive-booking.types';

class ServicesApiService {
  private baseUrl = '/api/services';

  async getServices(params: ServiceSearchParams = {}): Promise<ServiceResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const url = `${this.baseUrl}?${searchParams.toString()}`;
    
    try {
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching services:', error);
      // Return mock data as fallback
      return this.getMockServices(params);
    }
  }

  async getServiceById(id: string): Promise<Service | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch service: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching service:', error);
      return null;
    }
  }

  async createConversationWithVendor(vendorName: string, serviceName: string): Promise<boolean> {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBaseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          vendorName,
          serviceName,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return false;
    }
  }

  private getMockServices(params: ServiceSearchParams): ServiceResponse {
    const mockServices: Service[] = [
      {
        id: '1',
        name: 'Elegant Wedding Photography',
        category: 'photography',
        location: 'New York',
        rating: 4.9,
        reviewCount: 234,
        priceRange: '$$$',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        description: 'Professional wedding photography with a focus on candid moments and artistic composition.',
        features: ['Full Day Coverage', 'Engagement Session', 'Online Gallery', 'Print Rights'],
        availability: true,
        vendorName: 'Sarah Photography Studio',
        vendorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        vendorId: 'vendor_1',
        contactInfo: {
          phone: '+1 (555) 123-4567',
          email: 'sarah@photographystudio.com',
          website: 'https://sarahphotography.com'
        }
      },
      {
        id: '2',
        name: 'Garden Wedding Venue',
        category: 'venue',
        location: 'Los Angeles',
        rating: 4.8,
        reviewCount: 156,
        priceRange: '$$$$',
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
        description: 'Beautiful outdoor garden venue perfect for romantic ceremonies and receptions.',
        features: ['Garden Ceremony', 'Indoor Reception', 'Bridal Suite', 'Catering Kitchen'],
        availability: true,
        vendorName: 'Enchanted Gardens',
        vendorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        vendorId: 'vendor_2'
      },
      {
        id: '3',
        name: 'Gourmet Wedding Catering',
        category: 'catering',
        location: 'Chicago',
        rating: 4.7,
        reviewCount: 89,
        priceRange: '$$$',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
        description: 'Exquisite culinary experiences with locally sourced ingredients and custom menus.',
        features: ['Custom Menus', 'Wine Pairing', 'Service Staff', 'Dietary Options'],
        availability: true,
        vendorName: 'Culinary Creations',
        vendorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        vendorId: 'vendor_3'
      },
      {
        id: '4',
        name: 'Luxury Bridal Hair & Makeup',
        category: 'makeup_hair',
        location: 'New York',
        rating: 4.9,
        reviewCount: 312,
        priceRange: '$$',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
        description: 'Transform into your most beautiful self with our luxury bridal beauty services.',
        features: ['Trial Session', 'Touch-up Kit', 'Airbrush Makeup', 'Hair Extensions'],
        availability: true,
        vendorName: 'Bella Beauty Studio',
        vendorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        vendorId: 'vendor_4'
      },
      {
        id: '5',
        name: 'Live Wedding Band',
        category: 'music_dj',
        location: 'Los Angeles',
        rating: 4.6,
        reviewCount: 78,
        priceRange: '$$$',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        description: 'Professional live band specializing in weddings with a diverse repertoire.',
        features: ['Live Performance', 'Sound System', 'Lighting', 'MC Services'],
        availability: true,
        vendorName: 'Harmony Wedding Band',
        vendorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        vendorId: 'vendor_5'
      },
      {
        id: '6',
        name: 'Custom Wedding Invitations',
        category: 'other',
        location: 'Chicago',
        rating: 4.8,
        reviewCount: 145,
        priceRange: '$$',
        image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400',
        description: 'Beautifully crafted wedding invitations that set the perfect tone for your special day.',
        features: ['Custom Design', 'RSVP Cards', 'Premium Paper', 'Digital Proofs'],
        availability: true,
        vendorName: 'Paper & Prose',
        vendorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        vendorId: 'vendor_6'
      },
      {
        id: '7',
        name: 'Romantic Floral Arrangements',
        category: 'flowers_decor',
        location: 'San Francisco',
        rating: 4.7,
        reviewCount: 203,
        priceRange: '$$$',
        image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400',
        description: 'Stunning floral designs that bring your wedding vision to life with seasonal blooms.',
        features: ['Bridal Bouquet', 'Centerpieces', 'Ceremony Arch', 'Delivery & Setup'],
        availability: true,
        vendorName: 'Bloom & Blossom',
        vendorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        vendorId: 'vendor_7'
      },
      {
        id: '8',
        name: 'Wedding Transportation',
        category: 'transportation',
        location: 'Miami',
        rating: 4.5,
        reviewCount: 67,
        priceRange: '$$',
        image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400',
        description: 'Luxury transportation services to ensure you arrive in style on your wedding day.',
        features: ['Luxury Vehicles', 'Professional Chauffeur', 'Decorations', 'Red Carpet'],
        availability: true,
        vendorName: 'Elite Wedding Transport',
        vendorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        vendorId: 'vendor_8'
      }
    ];

    // Apply basic filtering for mock data
    let filtered = mockServices;

    if (params.query) {
      const query = params.query.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.vendorName.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      );
    }

    if (params.category && params.category !== 'all') {
      filtered = filtered.filter(service => service.category === params.category as ServiceCategory);
    }

    if (params.location && params.location !== 'all') {
      filtered = filtered.filter(service => service.location === params.location);
    }

    if (params.priceRange && params.priceRange !== 'all') {
      filtered = filtered.filter(service => service.priceRange === params.priceRange);
    }

    if (params.minRating && params.minRating > 0) {
      filtered = filtered.filter(service => service.rating >= params.minRating!);
    }

    // Apply sorting
    switch (params.sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.priceRange?.length ?? Number.POSITIVE_INFINITY) - (b.priceRange?.length ?? Number.POSITIVE_INFINITY));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.priceRange?.length ?? Number.NEGATIVE_INFINITY) - (a.priceRange?.length ?? Number.NEGATIVE_INFINITY));
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        // relevance - no sorting change
        break;
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);

    return {
      services: filtered,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }
}

export const servicesApiService = new ServicesApiService();
