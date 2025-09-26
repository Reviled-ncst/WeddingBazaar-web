import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const router = Router();

// GET /api/services - Get all active services
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('🔍 [Services API] Loading services from database...');
    
    const result = await pool.query(`
      SELECT 
        s.*,
        v.name as vendor_name,
        v.category as vendor_category,
        v.rating,
        v.review_count,
        v.location,
        v.website,
        v.phone,
        v.email
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.is_active = true
      ORDER BY s.featured DESC, s.created_at DESC
    `);
    
    console.log(`✅ [Services API] Found ${result.rows.length} services`);
    
    // Transform data to match frontend expectations
    const services = result.rows.map(service => ({
      id: service.id,
      title: service.title,
      name: service.name || service.title, // Fallback
      description: service.description,
      category: service.category,
      price: parseFloat(service.price || '0'),
      images: service.images || [],
      featured: service.featured || false,
      vendor: {
        id: service.vendor_id,
        name: service.vendor_name,
        category: service.vendor_category,
        rating: parseFloat(service.rating || '0'),
        reviewCount: service.review_count || 0,
        location: service.location,
        website: service.website,
        phone: service.phone,
        email: service.email
      },
      createdAt: service.created_at,
      updatedAt: service.updated_at
    }));
    
    res.json({
      success: true,
      services,
      total: services.length
    });
    
  } catch (error) {
    console.error('❌ [Services API] Error loading services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load services',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/services/direct - Direct services endpoint (legacy support)
router.get('/direct', async (req: Request, res: Response) => {
  try {
    console.log('🔍 [Services API Direct] Loading services directly...');
    
    const result = await pool.query(`
      SELECT * FROM services 
      WHERE is_active = true 
      ORDER BY featured DESC, created_at DESC
    `);
    
    console.log(`✅ [Services API Direct] Found ${result.rows.length} services`);
    
    res.json({
      success: true,
      services: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ [Services API Direct] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load services directly'
    });
  }
});

// GET /api/services/featured - Get featured services
router.get('/featured', async (req: Request, res: Response) => {
  try {
    console.log('🔍 [Services API] Loading featured services...');
    
    const result = await pool.query(`
      SELECT 
        s.*,
        v.name as vendor_name,
        v.category as vendor_category,
        v.rating,
        v.review_count,
        v.location
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.is_active = true AND s.featured = true
      ORDER BY s.created_at DESC
      LIMIT 6
    `);
    
    console.log(`✅ [Services API] Found ${result.rows.length} featured services`);
    
    const services = result.rows.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: parseFloat(service.price || '0'),
      images: service.images || [],
      vendor: {
        name: service.vendor_name,
        category: service.vendor_category,
        rating: parseFloat(service.rating || '0'),
        reviewCount: service.review_count || 0,
        location: service.location
      }
    }));
    
    res.json({
      success: true,
      services,
      total: services.length
    });
    
  } catch (error) {
    console.error('❌ [Services API] Error loading featured services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load featured services'
    });
  }
});

// GET /api/services/categories - Get service categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    console.log('🔍 [Services API] Loading service categories...');
    
    const result = await pool.query(`
      SELECT 
        category,
        COUNT(*) as service_count,
        AVG(price) as avg_price
      FROM services 
      WHERE is_active = true AND category IS NOT NULL
      GROUP BY category
      ORDER BY service_count DESC
    `);
    
    console.log(`✅ [Services API] Found ${result.rows.length} categories`);
    
    const categories = result.rows.map(cat => ({
      name: cat.category,
      serviceCount: parseInt(cat.service_count),
      averagePrice: parseFloat(cat.avg_price || '0')
    }));
    
    res.json({
      success: true,
      categories,
      total: categories.length
    });
    
  } catch (error) {
    console.error('❌ [Services API] Error loading categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load service categories'
    });
  }
});

// GET /api/services/:id - Get specific service
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🔍 [Services API] Loading service ${id}...`);
    
    const result = await pool.query(`
      SELECT 
        s.*,
        v.name as vendor_name,
        v.category as vendor_category,
        v.rating,
        v.review_count,
        v.location,
        v.website,
        v.phone,
        v.email
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.id = $1 AND s.is_active = true
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    const service = result.rows[0];
    const serviceData = {
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: parseFloat(service.price || '0'),
      images: service.images || [],
      featured: service.featured || false,
      vendor: {
        id: service.vendor_id,
        name: service.vendor_name,
        category: service.vendor_category,
        rating: parseFloat(service.rating || '0'),
        reviewCount: service.review_count || 0,
        location: service.location,
        website: service.website,
        phone: service.phone,
        email: service.email
      },
      createdAt: service.created_at,
      updatedAt: service.updated_at
    };
    
    console.log(`✅ [Services API] Found service: ${service.title}`);
    
    res.json({
      success: true,
      service: serviceData
    });
    
  } catch (error) {
    console.error('❌ [Services API] Error loading service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load service'
    });
  }
});

// GET /api/services/simple - Simple services endpoint for frontend integration
router.get('/simple', async (req: Request, res: Response) => {
  try {
    console.log('🚀 [API] /api/services/simple - Router version');
    
    const result = await pool.query('SELECT * FROM services WHERE is_active = true');
    console.log(`📊 [API] Simple query returned: ${result.rows.length} services`);
    
    const formattedServices = result.rows.map(service => ({
      id: service.id,
      title: service.title || service.name || 'Wedding Service',
      name: service.title || service.name || 'Wedding Service',
      category: service.category || 'Wedding Services',
      vendor_id: service.vendor_id,
      vendorId: service.vendor_id,
      vendorName: 'Wedding Professional',
      description: service.description || 'Professional wedding service',
      price: parseFloat(service.price || '50000'),
      priceRange: `₱${parseFloat(service.price || '50000').toLocaleString()}`,
      location: 'Metro Manila',
      rating: 4.5 + Math.random() * 0.4,
      reviewCount: Math.floor(Math.random() * 100) + 20,
      image: service.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=600',
      images: service.images || [],
      gallery: service.images || [],
      features: ['Professional Service'],
      is_active: service.is_active,
      availability: true,
      featured: service.featured || false,
      created_at: service.created_at,
      updated_at: service.updated_at,
      contactInfo: {
        phone: '',
        email: '',
        website: ''
      }
    }));
    
    console.log(`✅ [API] Returning ${formattedServices.length} simple services`);
    
    res.json({
      success: true,
      services: formattedServices,
      total: formattedServices.length,
      message: `Found ${formattedServices.length} services`
    });
    
  } catch (error) {
    console.error('❌ [API] /api/services/simple error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load simple services',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
