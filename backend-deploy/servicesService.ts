import type { Service, ServiceSearchParams } from '../../src/modules/services/types';
import { db } from '../database/connection';

export class ServicesService {
  // Helper method to convert external image URLs to use our proxy
  private processImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return imageUrl;
    
    // Check if it's an external image that needs proxying
    const needsProxy = imageUrl.includes('images.unsplash.com') || 
                      imageUrl.includes('picsum.photos');
    
    if (needsProxy) {
      return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    }
    
    return imageUrl;
  }

  // Convert database record to frontend Service type
  private mapDbServiceToService = (dbService: any): Service => {
    const images = Array.isArray(dbService.images) ? dbService.images : [];
    
    // Process all images through proxy for external sources
    const processedImages = images.map(this.processImageUrl);
    
    // Debug logging
    console.log(`🔧 Mapping service: ${dbService.title}`);
    console.log(`   Vendor: ${dbService.vendor_business_name || dbService.vendor_name || 'Unknown'}`);
    console.log(`   Images in DB: ${images.length}`);
    console.log(`   Gallery will have: ${images.length > 1 ? images.length - 1 : 0} images`);
    
    // Add variety to locations
    const locations = [
      'New York City, NY',
      'Los Angeles, CA', 
      'Chicago, IL',
      'Houston, TX',
      'Phoenix, AZ',
      'Philadelphia, PA',
      'San Antonio, TX',
      'San Diego, CA',
      'Dallas, TX',
      'San Jose, CA',
      'Miami, FL',
      'Atlanta, GA',
      'Boston, MA',
      'Seattle, WA',
      'Denver, CO'
    ];
    
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    // Generate diverse vendor names if not available
    const vendorNames = [
      'Elegant Moments Photography',
      'Dream Wedding Planners',
      'Golden Hour Videography',
      'Bloom & Blossom Florists',
      'Harmony Wedding Music',
      'Gourmet Catering Co.',
      'Perfect Day Planners',
      'Luxe Beauty Studio',
      'Classic Car Rentals',
      'Sweet Celebrations Cakes'
    ];
    
    const defaultVendorName = vendorNames[Math.floor(Math.random() * vendorNames.length)];
    
    return {
      id: dbService.id,
      name: dbService.title, // Map 'title' to 'name'
      category: dbService.category || 'Other',
      location: randomLocation,
      rating: 4.5, // You might want to add rating/review system to your DB
      reviewCount: Math.floor(Math.random() * 200) + 10, // Placeholder
      priceRange: this.getPriceRange(dbService.price),
      image: processedImages.length > 0 
        ? processedImages[0] 
        : this.processImageUrl('https://images.unsplash.com/photo-1519741497674-611481863552?w=400'),
      gallery: processedImages.length > 1 ? processedImages.slice(1) : [], // Exclude the first image from gallery since it's the main image
      description: dbService.description || 'Professional wedding service',
      features: this.generateFeatures(dbService.category),
      availability: dbService.is_active || false,
      vendorName: dbService.vendor_business_name || defaultVendorName,
            vendorImage: this.processImageUrl(dbService.vendor_profile_image || dbService.vendor_image || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'),
      vendorId: dbService.vendor_id,
      contactInfo: {
        phone: dbService.vendor_phone || '+1 (555) 123-4567', // Use real vendor data when available
        email: dbService.vendor_email || 'contact@vendor.com', // Use real vendor data when available
        website: dbService.vendor_website_url || undefined,
      }
    };
  }

  private getPriceRange(price: number): string {
    if (!price) return '$$';
    if (price < 500) return '$';
    if (price < 1500) return '$$';
    if (price < 3000) return '$$$';
    return '$$$$';
  }

  private generateFeatures(category: string): string[] {
    const featureMap: Record<string, string[]> = {
      'photography': ['Professional Equipment', 'Edited Photos', 'Online Gallery', 'Print Rights'],
      'videography': ['4K Video', 'Edited Highlights', 'Raw Footage', 'Drone Coverage'],
      'wedding_planning': ['Full Planning', 'Vendor Coordination', 'Timeline Management', 'Day-of Coordination'],
      'flowers_decor': ['Bridal Bouquet', 'Ceremony Flowers', 'Reception Centerpieces', 'Setup Service'],
      'makeup_hair': ['Trial Session', 'Airbrush Makeup', 'Hair Styling', 'Touch-up Kit'],
      'music_dj': ['Professional Sound System', 'Music Library', 'MC Services', 'Lighting'],
      'catering': ['Custom Menu', 'Service Staff', 'Dietary Options', 'Setup & Cleanup'],
      'venue': ['Setup Coordination', 'Vendor Management', 'Timeline Oversight', 'Emergency Support'],
      'officiant': ['Ceremony Script', 'Rehearsal Attendance', 'Marriage License', 'Custom Vows'],
    };
    
    return featureMap[category] || ['Professional Service', 'Quality Guaranteed', 'Experienced Team', 'Consultation Included'];
  }

  async getServices(params: ServiceSearchParams = {}) {
    try {
      console.log('🔍 ServicesService.getServices called with params:', params);
      
      // Build the base query
      let whereConditions = ['is_active = true'];
      const queryParams: any[] = [];

      // Add filters
      if (params.category && params.category !== 'all') {
        whereConditions.push(`category = '${params.category.replace(/'/g, "''")}'`);
      }

      if (params.query) {
        const searchTerm = params.query.replace(/'/g, "''");
        whereConditions.push(`(title ILIKE '%${searchTerm}%' OR description ILIKE '%${searchTerm}%' OR category ILIKE '%${searchTerm}%')`);
      }

      if (params.priceRange && params.priceRange !== 'all') {
        const priceRanges = {
          '$': [0, 500],
          '$$': [500, 1500],
          '$$$': [1500, 3000],
          '$$$$': [3000, 999999]
        };
        const range = priceRanges[params.priceRange as keyof typeof priceRanges];
        if (range) {
          whereConditions.push(`price >= ${range[0]} AND price <= ${range[1]}`);
        }
      }

      // Build ORDER BY clause
      let orderBy = 'featured DESC, created_at DESC';
      if (params.sortBy === 'price_asc') {
        orderBy = 'price ASC';
      } else if (params.sortBy === 'price_desc') {
        orderBy = 'price DESC';
      } else if (params.sortBy === 'name') {
        orderBy = 'title ASC';
      }

      // Add pagination
      const page = parseInt(String(params.page || 1));
      const limit = parseInt(String(params.limit || 12));
      const offset = (page - 1) * limit;

      console.log('🔍 Query parameters:', { page, limit, offset, whereConditions, orderBy });

      // Execute query using Neon template literals directly
      const whereClause = whereConditions.join(' AND ');
      
      // Use direct access to the neon sql function
      const sql = db.neonSql;
      
      const result = await sql`
        SELECT 
          s.id, s.vendor_id, s.title, s.description, s.category, s.price, s.images, s.featured, s.is_active, s.created_at, s.updated_at,
          v.business_name as vendor_business_name,
          v.profile_image as vendor_profile_image,
          v.website_url as vendor_website_url,
          v.business_type as vendor_business_type
        FROM services s
        LEFT JOIN vendors v ON s.vendor_id = v.id
        WHERE ${sql.unsafe(whereClause)}
        ORDER BY ${sql.unsafe(orderBy)}
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      console.log('🔍 Query executed, got', result.length, 'results');

      // Get total count for pagination
      const countResult = await sql`
        SELECT COUNT(*) as total 
        FROM services s
        LEFT JOIN vendors v ON s.vendor_id = v.id
        WHERE ${sql.unsafe(whereClause)}
      `;
      
      const total = parseInt(countResult[0].total);
      console.log('🔍 Total services count:', total);

      // Map database results to Service type
      const services = result.map(this.mapDbServiceToService);

      const response = {
        services,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };

      console.log('🔍 Returning response with', services.length, 'services');
      return response;

    } catch (error) {
      console.error('❌ Database query error in getServices:', error);
      
      // Only fallback to mock data if it's a real database structure issue, not network timeouts
      if (error instanceof Error && (
        error.message.includes('relation') || 
        error.message.includes('column') || 
        error.message.includes('does not exist')
      )) {
        console.log('🔄 Database structure issue, falling back to mock data');
        return this.getMockServices(params);
      }
      
      // For network/connection issues, return empty but valid response
      console.log('🌐 Network/connection issue, returning empty response');
      return {
        services: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  async getServiceById(id: string): Promise<Service | null> {
    try {
      const sql = db.neonSql;
      const result = await sql`
        SELECT 
          s.id, s.vendor_id, s.title, s.description, s.category, s.price, s.images, s.featured, s.is_active, s.created_at, s.updated_at,
          v.business_name as vendor_business_name,
          v.profile_image as vendor_profile_image,
          v.website_url as vendor_website_url,
          v.business_type as vendor_business_type
        FROM services s
        LEFT JOIN vendors v ON s.vendor_id = v.id
        WHERE s.id = ${id} AND s.is_active = true
      `;
      
      if (result.length === 0) {
        return null;
      }

      return this.mapDbServiceToService(result[0]);
    } catch (error) {
      console.error('Error fetching service by ID:', error);
      return null;
    }
  }

  // Get services by vendor ID
  async getServicesByVendor(vendorId: string): Promise<Service[]> {
    try {
      const sql = db.neonSql;
      
      console.log('🔍 [ServicesService] Fetching services for vendor:', vendorId);
      
      const result = await sql`
        SELECT 
          s.id, s.vendor_id, s.title, s.description, s.category, s.price, s.images, s.featured, s.is_active, s.created_at, s.updated_at,
          v.business_name as vendor_business_name,
          v.profile_image as vendor_profile_image,
          v.website_url as vendor_website_url,
          v.business_type as vendor_business_type
        FROM services s
        LEFT JOIN vendors v ON s.vendor_id = v.id
        WHERE s.vendor_id = ${vendorId} AND s.is_active = true
        ORDER BY s.featured DESC, s.created_at DESC
      `;
      
      console.log('🔍 [ServicesService] Found', result.length, 'services for vendor:', vendorId);
      
      return result.map(this.mapDbServiceToService);
    } catch (error) {
      console.error('❌ Error fetching services by vendor:', error);
      return [];
    }
  }

  // Keep mock services as fallback
  private async getMockServices(params: ServiceSearchParams = {}) {
    // Simple fallback data when database is unavailable
    const mockServices: Service[] = [
      {
        id: '1',
        name: 'Professional Wedding Photography',
        category: 'photography',
        location: 'Various Locations',
        rating: 4.8,
        reviewCount: 156,
        priceRange: '$$$',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        description: 'Capture your special day with our professional wedding photography services.',
        features: ['Professional Equipment', 'Edited Photos', 'Online Gallery', 'Print Rights'],
        availability: true,
        vendorName: 'PhotoMagic Studios',
        vendorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        vendorId: 'vendor-1',
        contactInfo: {
          phone: '+1 (555) 123-4567',
          email: 'contact@photomagic.com',
        }
      }
    ];

    // Apply basic filtering for fallback
    let filtered = [...mockServices];

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
      filtered = filtered.filter(service => service.category === params.category);
    }

    return {
      services: filtered,
      pagination: {
        page: 1,
        limit: 12,
        total: filtered.length,
        totalPages: 1
      }
    };
  }

  async searchServices(query: string): Promise<Service[]> {
    try {
      const sql = db.neonSql;
      const searchTerm = query.replace(/'/g, "''"); // Escape single quotes
      
      const result = await sql`
        SELECT 
          s.id, s.vendor_id, s.title, s.description, s.category, s.price, s.images, s.featured, s.is_active, s.created_at, s.updated_at,
          v.business_name as vendor_business_name,
          v.profile_image as vendor_profile_image,
          v.website_url as vendor_website_url,
          v.business_type as vendor_business_type
        FROM services s
        LEFT JOIN vendors v ON s.vendor_id = v.id
        WHERE s.is_active = true AND (s.title ILIKE ${'%' + searchTerm + '%'} OR s.description ILIKE ${'%' + searchTerm + '%'} OR s.category ILIKE ${'%' + searchTerm + '%'})
        ORDER BY s.featured DESC, s.created_at DESC
        LIMIT 20
      `;
      
      return result.map(this.mapDbServiceToService);
    } catch (error) {
      console.error('Error searching services:', error);
      return [];
    }
  }

  // CREATE - Add new service
  async createService(serviceData: {
    vendor_id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    images?: string[];
    featured?: boolean;
  }): Promise<Service | null> {
    try {
      const sql = db.neonSql;
      
      const result = await sql`
        INSERT INTO services (
          vendor_id, title, description, category, price, images, featured, is_active
        ) VALUES (
          ${serviceData.vendor_id},
          ${serviceData.title},
          ${serviceData.description},
          ${serviceData.category},
          ${serviceData.price},
          ${serviceData.images || []},
          ${serviceData.featured || false},
          true
        )
        RETURNING 
          id, vendor_id, title, description, category, price, images, featured, is_active, created_at, updated_at
      `;

      if (result.length === 0) {
        throw new Error('Failed to create service');
      }

      // Get vendor information for the created service
      const serviceWithVendor = await sql`
        SELECT 
          s.id, s.vendor_id, s.title, s.description, s.category, s.price, s.images, s.featured, s.is_active, s.created_at, s.updated_at,
          v.business_name as vendor_business_name,
          v.profile_image as vendor_profile_image,
          v.website_url as vendor_website_url,
          v.business_type as vendor_business_type
        FROM services s
        LEFT JOIN vendors v ON s.vendor_id = v.id
        WHERE s.id = ${result[0].id}
      `;

      return serviceWithVendor.length > 0 ? this.mapDbServiceToService(serviceWithVendor[0]) : null;
    } catch (error) {
      console.error('❌ Error creating service:', error);
      throw new Error('Failed to create service');
    }
  }

  // UPDATE - Update existing service
  async updateService(id: string, updates: {
    title?: string;
    description?: string;
    category?: string;
    price?: number;
    images?: string[];
    featured?: boolean;
    is_active?: boolean;
  }): Promise<Service | null> {
    try {
      const sql = db.neonSql;
      
      // Use direct Neon SQL template for simpler updates
      const result = await sql`
        UPDATE services 
        SET 
          title = COALESCE(${updates.title}, title),
          description = COALESCE(${updates.description}, description),
          category = COALESCE(${updates.category}, category),
          price = COALESCE(${updates.price}, price),
          images = COALESCE(${updates.images}, images),
          featured = COALESCE(${updates.featured}, featured),
          is_active = COALESCE(${updates.is_active}, is_active),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, vendor_id, title, description, category, price, images, featured, is_active, created_at, updated_at
      `;

      if (result.length === 0) {
        throw new Error('Service not found');
      }

      // Get vendor information for the updated service
      const serviceWithVendor = await sql`
        SELECT 
          s.id, s.vendor_id, s.title, s.description, s.category, s.price, s.images, s.featured, s.is_active, s.created_at, s.updated_at,
          v.business_name as vendor_business_name,
          v.profile_image as vendor_profile_image,
          v.website_url as vendor_website_url,
          v.business_type as vendor_business_type
        FROM services s
        LEFT JOIN vendors v ON s.vendor_id = v.id
        WHERE s.id = ${id}
      `;

      return serviceWithVendor.length > 0 ? this.mapDbServiceToService(serviceWithVendor[0]) : null;
    } catch (error) {
      console.error('❌ Error updating service:', error);
      throw new Error('Failed to update service');
    }
  }

  // DELETE - Remove service (soft delete by setting is_active to false)
  async deleteService(id: string): Promise<boolean> {
    try {
      const sql = db.neonSql;
      
      const result = await sql`
        UPDATE services 
        SET is_active = false, updated_at = NOW()
        WHERE id = ${id}
      `;

      return result.length > 0;
    } catch (error) {
      console.error('❌ Error deleting service:', error);
      throw new Error('Failed to delete service');
    }
  }

  // Toggle featured status
  async toggleFeaturedService(id: string): Promise<Service | null> {
    try {
      const sql = db.neonSql;
      
      const result = await sql`
        UPDATE services 
        SET featured = NOT featured, updated_at = NOW()
        WHERE id = ${id} AND is_active = true
        RETURNING id, vendor_id, title, description, category, price, images, featured, is_active, created_at, updated_at
      `;

      if (result.length === 0) {
        throw new Error('Service not found');
      }

      // Get vendor information for the updated service
      const serviceWithVendor = await sql`
        SELECT 
          s.id, s.vendor_id, s.title, s.description, s.category, s.price, s.images, s.featured, s.is_active, s.created_at, s.updated_at,
          v.business_name as vendor_business_name,
          v.profile_image as vendor_profile_image,
          v.website_url as vendor_website_url,
          v.business_type as vendor_business_type
        FROM services s
        LEFT JOIN vendors v ON s.vendor_id = v.id
        WHERE s.id = ${id}
      `;

      return serviceWithVendor.length > 0 ? this.mapDbServiceToService(serviceWithVendor[0]) : null;
    } catch (error) {
      console.error('❌ Error toggling featured service:', error);
      throw new Error('Failed to toggle featured status');
    }
  }
}

export const servicesService = new ServicesService();
