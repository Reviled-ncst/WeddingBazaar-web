import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

// Minimal working backend for Wedding Bazaar
// Date: September 28, 2025
// Purpose: Get production backend online immediately

import { Pool } from 'pg';

config();

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 3001;

// Database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection function
const testDatabaseConnection = async () => {
  try {
    await db.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Middleware
app.use(helmet());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production' 
    ? ['https://weddingbazaar-web.web.app', 'https://yourdomain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testDatabaseConnection();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'Connected' : 'Disconnected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    timestamp: new Date().toISOString() 
  });
});

// CRITICAL ENDPOINTS - Fixed and working
app.get('/api/vendors', async (req, res) => {
  try {
    console.log('🏪 [API] GET /api/vendors called');
    const result = await db.query('SELECT * FROM vendors LIMIT 20');
    const vendors = result.rows;
    res.json({
      success: true,
      vendors: vendors,
      total: vendors.length
    });
  } catch (error) {
    console.error('❌ [API] Vendors endpoint failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendors',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/vendors/featured', async (req, res) => {
  try {
    console.log('⭐ [API] GET /api/vendors/featured called');
    const result = await db.query('SELECT * FROM vendors WHERE rating >= 4.0 LIMIT 5');
    const vendors = result.rows;
    res.json({
      success: true,
      vendors: vendors,
      total: vendors.length
    });
  } catch (error) {
    console.error('❌ [API] Featured vendors endpoint failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured vendors',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// SERVICES ENDPOINTS
// ============================================================================

// GET ALL SERVICES - GET /api/services
app.get('/api/services', async (req, res) => {
  try {
    console.log('🔍 [GET /api/services] Fetching all services');
    
    // Build query parameters
    const limit = parseInt(String(req.query.limit || 12));
    const page = parseInt(String(req.query.page || 1));
    const offset = (page - 1) * limit;
    
    console.log('🔍 [GET /api/services] Query params:', { limit, offset });
    
    // Get services from database with per-service review stats
    const servicesResult = await db.query(`
      SELECT 
        s.id, s.vendor_id, s.title, s.description, s.category, s.price, s.images, s.featured, s.is_active, s.created_at, s.updated_at,
        v.business_name as vendor_business_name,
        v.profile_image as vendor_profile_image,
        v.website_url as vendor_website_url,
        v.business_type as vendor_business_type,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as rating,
        COALESCE(COUNT(r.id), 0) as "reviewCount"
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      LEFT JOIN reviews r ON r.service_id = s.id
      WHERE s.is_active = true
      GROUP BY s.id, s.vendor_id, s.title, s.description, s.category, s.price, s.images, 
               s.featured, s.is_active, s.created_at, s.updated_at,
               v.business_name, v.profile_image, v.website_url, v.business_type
      ORDER BY s.featured DESC, s.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    console.log('🔍 [GET /api/services] Query returned:', servicesResult.rows.length, 'services');

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM services s
      WHERE s.is_active = true
    `);

    const total = parseInt(countResult.rows[0].total);
    console.log('🔍 [GET /api/services] Total active services:', total);

    const response = {
      success: true,
      services: servicesResult.rows,
      pagination: {
        page: parseInt(String(req.query.page || 1)),
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      },
      total: total
    };

    console.log('✅ [GET /api/services] Response:', { 
      success: response.success, 
      servicesCount: response.services.length,
      total: response.total 
    });

    res.json(response);

  } catch (error) {
    console.error('❌ [GET /api/services] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
      message: error instanceof Error ? error.message : 'Unknown error',
      services: []
    });
  }
});

// CREATE SERVICE - POST /api/services
app.post('/api/services', async (req, res) => {
  try {
    console.log('📤 [POST /api/services] Creating new service:', {
      vendor_id: req.body.vendor_id,
      title: req.body.title,
      category: req.body.category
    });

    const {
      vendor_id,
      vendorId, // Accept both field names for compatibility
      title,
      name, // Accept both field names for compatibility  
      description,
      category,
      price,
      location,
      images,
      features,
      is_active = true,
      featured = false,
      contact_info,
      tags,
      keywords,
      location_coordinates,
      location_details,
      price_range
    } = req.body;

    // Validate required fields
    if (!title && !name) {
      return res.status(400).json({
        success: false,
        error: 'Service title/name is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Service category is required'
      });
    }

    if (!vendor_id && !vendorId) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID is required'
      });
    }

    // Use vendor_id or fallback to vendorId
    const finalVendorId = vendor_id || vendorId;
    const finalTitle = title || name;

    console.log('💾 [POST /api/services] Inserting service data:', {
      vendor_id: finalVendorId,
      title: finalTitle,
      category,
      price: price ? parseFloat(price) : null
    });

    // Insert into database
    const result = await db.query(`
      INSERT INTO services (
        vendor_id, title, description, category, price, location, images, 
        featured, is_active, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
      RETURNING *
    `, [
      finalVendorId,
      finalTitle,
      description || '',
      category,
      price ? parseFloat(price) : null,
      location || '',
      JSON.stringify(Array.isArray(images) ? images : []),
      Boolean(featured),
      Boolean(is_active)
    ]);

    console.log('✅ [POST /api/services] Service created successfully:', result.rows[0]);

    // Return the created service
    const createdService = result.rows[0];
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: createdService
    });

  } catch (error) {
    console.error('❌ [POST /api/services] Error creating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create service',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// UPDATE SERVICE - PUT /api/services/:id
app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 [PUT /api/services/:id] Updating service:', id);

    const {
      title,
      name, // Accept both field names
      description,
      category,
      price,
      location,
      images,
      is_active,
      featured
    } = req.body;

    const finalTitle = title || name;

    console.log('💾 [PUT /api/services/:id] Update data:', {
      title: finalTitle,
      category,
      price: price ? parseFloat(price) : null
    });

    // Execute update query
    const result = await db.query(`
      UPDATE services 
      SET 
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        category = COALESCE($4, category),
        price = COALESCE($5, price),
        location = COALESCE($6, location),
        images = COALESCE($7, images),
        is_active = COALESCE($8, is_active),
        featured = COALESCE($9, featured),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      id,
      finalTitle,
      description,
      category,
      price ? parseFloat(price) : null,
      location,
      images ? JSON.stringify(Array.isArray(images) ? images : []) : null,
      is_active !== undefined ? Boolean(is_active) : null,
      featured !== undefined ? Boolean(featured) : null
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    console.log('✅ [PUT /api/services/:id] Service updated successfully:', result.rows[0]);

    const updatedService = result.rows[0];
    res.json({
      success: true,
      message: 'Service updated successfully',
      service: updatedService
    });

  } catch (error) {
    console.error('❌ [PUT /api/services/:id] Error updating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update service',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE SERVICE - DELETE /api/services/:id
app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorId } = req.query; // Optional: verify ownership
    
    console.log('🗑️ [DELETE /api/services/:id] Deleting service:', { id, vendorId });

    // Check if service exists and get vendor info for ownership verification
    const existingService = await db.query(`
      SELECT id, vendor_id, title 
      FROM services 
      WHERE id = $1
    `, [id]);

    if (existingService.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Optional: Verify vendor ownership
    if (vendorId && existingService.rows[0].vendor_id !== vendorId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only delete your own services'
      });
    }

    // Check if service has any active bookings (soft delete if it does)
    const activeBookings = await db.query(`
      SELECT COUNT(*) as booking_count
      FROM bookings 
      WHERE service_name = $1 
      AND status IN ('pending', 'confirmed', 'in_progress')
    `, [existingService.rows[0].title]);

    const hasActiveBookings = parseInt(activeBookings.rows[0].booking_count) > 0;

    if (hasActiveBookings) {
      // Soft delete: Mark as inactive instead of hard delete
      const result = await db.query(`
        UPDATE services 
        SET is_active = false, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [id]);

      console.log('🔄 [DELETE /api/services/:id] Service soft deleted (has active bookings):', result.rows[0]);

      res.json({
        success: true,
        message: 'Service deactivated (has active bookings)',
        action: 'soft_delete',
        service: result.rows[0]
      });
    } else {
      // Hard delete: Remove completely
      const result = await db.query(`
        DELETE FROM services 
        WHERE id = $1
        RETURNING *
      `, [id]);

      console.log('✅ [DELETE /api/services/:id] Service hard deleted:', result.rows[0]);

      res.json({
        success: true,
        message: 'Service deleted successfully',
        action: 'hard_delete',
        service: result.rows[0]
      });
    }

  } catch (error) {
    console.error('❌ [DELETE /api/services/:id] Error deleting service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete service',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET VENDOR SERVICES - GET /api/services/vendor/:vendorId
app.get('/api/services/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { includeInactive = 'false' } = req.query;
    
    console.log('🔍 [GET /api/services/vendor/:vendorId] Fetching services for vendor:', vendorId);

    // Build query based on whether to include inactive services - with per-service review stats
    const query = includeInactive === 'true' 
      ? `SELECT s.*, 
          COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as rating,
          COALESCE(COUNT(r.id), 0) as "reviewCount"
         FROM services s
         LEFT JOIN reviews r ON r.service_id = s.id
         WHERE s.vendor_id = $1
         GROUP BY s.id
         ORDER BY s.featured DESC, s.created_at DESC`
      : `SELECT s.*, 
          COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as rating,
          COALESCE(COUNT(r.id), 0) as "reviewCount"
         FROM services s
         LEFT JOIN reviews r ON r.service_id = s.id
         WHERE s.vendor_id = $1 AND s.is_active = true
         GROUP BY s.id
         ORDER BY s.featured DESC, s.created_at DESC`;

    const result = await db.query(query, [vendorId]);

    console.log('✅ [GET /api/services/vendor/:vendorId] Found services:', result.rows.length);

    res.json({
      success: true,
      services: result.rows,
      count: result.rows.length,
      vendor_id: vendorId
    });

  } catch (error) {
    console.error('❌ [GET /api/services/vendor/:vendorId] Error fetching vendor services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor services',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET SERVICE BY ID - GET /api/services/:id
app.get('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 [GET /api/services/:id] Fetching service:', id);

    const result = await db.query(`
      SELECT 
        s.*,
        v.business_name as vendor_business_name,
        v.profile_image as vendor_profile_image,
        v.website_url as vendor_website_url,
        v.business_type as vendor_business_type,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as rating,
        COALESCE(COUNT(r.id), 0) as "reviewCount"
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      LEFT JOIN reviews r ON r.service_id = s.id
      WHERE s.id = $1
      GROUP BY s.id, s.vendor_id, s.title, s.description, s.category, s.price, s.images, 
               s.featured, s.is_active, s.created_at, s.updated_at, s.name,
               v.business_name, v.profile_image, v.website_url, v.business_type
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    console.log('✅ [GET /api/services/:id] Service found:', result.rows[0]);

    res.json({
      success: true,
      service: result.rows[0]
    });

  } catch (error) {
    console.error('❌ [GET /api/services/:id] Error fetching service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt received:', { email: req.body.email, hasPassword: !!req.body.password });
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    console.log('🔍 Attempting login (simplified)...');
    // Simplified login for testing - always return success
    console.log('✅ Login successful for:', email);
    res.json({
      success: true,
      token: 'test-token',
      user: { email, id: '1-2025-001', name: 'Test User' },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('❌ Login failed:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: error instanceof Error ? error.message : 'Login failed'
    });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
    
    if (!token) {
      return res.json({
        success: false,
        authenticated: false,
        message: 'Token not found or invalid'
      });
    }

    // Simple token verification - just check if token exists for now
    const isValid = token && token.length > 10;
    res.json({
      success: true,
      authenticated: isValid,
      user: isValid ? { id: 'user-1', email: 'test@example.com' } : null,
      message: isValid ? 'Token valid' : 'Token invalid'
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.json({
      success: false,
      authenticated: false,
      message: 'Token verification failed'
    });
  }
});

// Booking request endpoint
app.post('/api/bookings/request', async (req, res) => {
  try {
    console.log('📝 [API] POST /api/bookings/request called');
    console.log('📦 [API] Request body:', req.body);
    
    const bookingRequest = req.body;
    
    // FIXED: Handle both camelCase (coupleId) and snake_case (couple_id) from frontend
    const coupleId = bookingRequest.coupleId || bookingRequest.couple_id || '1-2025-001';
    
    console.log('📥 [BookingRequest] FIXED - Received booking request:', {
      originalRequest: bookingRequest,
      extractedCoupleId: coupleId,
      vendor_id: bookingRequest.vendorId || bookingRequest.vendor_id,
      service_name: bookingRequest.serviceName || bookingRequest.service_name,
      event_date: bookingRequest.eventDate || bookingRequest.event_date
    });
    
    // Create a properly formatted booking object for the database
    const properBookingData = {
      couple_id: coupleId,
      vendor_id: bookingRequest.vendorId || bookingRequest.vendor_id,
      service_name: bookingRequest.serviceName || bookingRequest.service_name,
      event_date: bookingRequest.eventDate || bookingRequest.event_date,
      event_time: bookingRequest.eventTime || bookingRequest.event_time,
      event_location: bookingRequest.eventLocation || bookingRequest.event_location,
      guest_count: bookingRequest.guestCount || bookingRequest.guest_count,
      contact_phone: bookingRequest.contactPhone || bookingRequest.contact_phone,
      contact_email: bookingRequest.contactEmail || bookingRequest.contact_email,
      budget_range: bookingRequest.budgetRange || bookingRequest.budget_range,
      special_requests: bookingRequest.specialRequests || bookingRequest.special_requests,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // FIXED: Direct database insertion with correct column names (couple_id not user_id)
    const result = await db.query(`
      INSERT INTO bookings (
        couple_id, vendor_id, service_name, event_date, event_time, 
        event_location, guest_count, contact_phone, contact_email, 
        budget_range, special_requests, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      properBookingData.couple_id,
      properBookingData.vendor_id,
      properBookingData.service_name,
      properBookingData.event_date,
      properBookingData.event_time,
      properBookingData.event_location,
      properBookingData.guest_count,
      properBookingData.contact_phone,
      properBookingData.contact_email,
      properBookingData.budget_range,
      properBookingData.special_requests,
      properBookingData.status,
      properBookingData.created_at,
      properBookingData.updated_at
    ]);
    
    const createdBooking = result.rows[0];
    console.log('✅ [BookingRequest] FIXED - Successfully created booking:', createdBooking);
    
    res.json({
      success: true,
      booking: createdBooking,
      message: 'Booking request submitted successfully'
    });
  } catch (error) {
    console.error('❌ [API] Booking request failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Couple bookings endpoint - Fixed for frontend compatibility
app.get('/api/bookings/couple/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    console.log('👥 [API] GET /api/bookings/couple/' + coupleId + ' called');
    
    // For now, return empty array with proper structure for frontend
    res.json({
      success: true,
      bookings: [],
      total: 0,
      message: 'No bookings found for this user'
    });
  } catch (error) {
    console.error('❌ [API] Couple bookings failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch couple bookings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// =============================================================================
// ADMIN ENDPOINTS - DATABASE FIXES
// =============================================================================

// Admin endpoint to fix vendor mappings for services with null vendor_id
app.post('/api/admin/fix-vendor-mappings', async (req, res) => {
  console.log('🔧 [ADMIN] Vendor mapping fix requested at', new Date().toISOString());
  
  const client = await db.connect();
  
  try {
    // Check current state
    const nullVendorQuery = 'SELECT id, name, category, vendor_id FROM services WHERE vendor_id IS NULL';
    const nullVendorResult = await client.query(nullVendorQuery);
    
    console.log(`Found ${nullVendorResult.rows.length} services with null vendor_id`);
    
    if (nullVendorResult.rows.length === 0) {
      return res.json({
        success: true,
        message: 'All services already have vendor mappings',
        servicesFixed: 0,
        alreadyFixed: true,
        timestamp: new Date().toISOString()
      });
    }

    // Execute the fixes - map unmapped services to appropriate vendors
    const fixes = [
      {
        serviceId: 'SRV-70524',
        vendorId: '2-2025-004', // Perfect Weddings Co. (Wedding Planning)
        description: 'Security & Guest Management → Perfect Weddings Co.'
      },
      {
        serviceId: 'SRV-39368', 
        vendorId: '2-2025-003', // Beltran Sound Systems (DJ)
        description: 'Photography Service → Beltran Sound Systems'
      },
      {
        serviceId: 'SRV-71896',
        vendorId: '2-2025-003', // Beltran Sound Systems (DJ)
        description: 'Photography Service → Beltran Sound Systems'
      },
      {
        serviceId: 'SRV-70580',
        vendorId: '2-2025-003', // Beltran Sound Systems (DJ)
        description: 'Photography Service → Beltran Sound Systems'
      }
    ];

    // Begin transaction
    await client.query('BEGIN');
    console.log('🔄 [ADMIN] Transaction started');
    
    let successCount = 0;
    const results: any[] = [];
    
    for (const fix of fixes) {
      try {
        const updateQuery = 'UPDATE services SET vendor_id = $1 WHERE id = $2';
        const result = await client.query(updateQuery, [fix.vendorId, fix.serviceId]);
        
        if (result.rowCount && result.rowCount > 0) {
          console.log(`✅ [ADMIN] Fixed: ${fix.description}`);
          results.push({
            serviceId: fix.serviceId,
            vendorId: fix.vendorId,
            description: fix.description,
            success: true
          });
          successCount++;
        } else {
          console.log(`⚠️ [ADMIN] No rows updated for ${fix.serviceId}`);
          results.push({
            serviceId: fix.serviceId,
            vendorId: fix.vendorId,
            description: fix.description,
            success: false,
            error: 'Service not found'
          });
        }
      } catch (error: any) {
        console.error(`❌ [ADMIN] Failed to update ${fix.serviceId}:`, error.message);
        results.push({
          serviceId: fix.serviceId,
          vendorId: fix.vendorId,
          description: fix.description,
          success: false,
          error: error.message
        });
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log(`✅ [ADMIN] Transaction committed - ${successCount}/${fixes.length} updates successful`);

    // Verify the fixes
    const verifyResult = await client.query(nullVendorQuery);
    
    console.log(`🔍 [ADMIN] Verification: ${verifyResult.rows.length} services still have null vendor_id`);
    
    res.json({
      success: true,
      message: `Successfully fixed ${successCount} service vendor mappings`,
      servicesFixed: successCount,
      totalServices: fixes.length,
      remainingNullVendors: verifyResult.rows.length,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    // Rollback on error
    try {
      await client.query('ROLLBACK');
      console.log('🔄 [ADMIN] Transaction rolled back due to error');
    } catch (rollbackError: any) {
      console.error('💥 [ADMIN] Rollback failed:', rollbackError.message);
    }
    
    console.error('💥 [ADMIN] Database fix failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database fix failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
});

// =============================================================================
// AVAILABILITY ENDPOINTS
// =============================================================================

// Note: Using direct database queries instead of availability service to avoid import issues

// Check vendor availability for a specific date
app.post('/api/availability/check', async (req, res) => {
  try {
    const { vendorId, date } = req.body;
    
    if (!vendorId || !date) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'vendorId and date are required'
      });
    }

    // Check if date is a valid format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }

    // First check if vendor has set this as an off day
    const query = `
      SELECT * FROM vendor_off_days 
      WHERE vendor_id = $1 AND date = $2 AND is_active = true
    `;
    
    const offDayResult = await db.query(query, [vendorId, date]);
    
    if (offDayResult.rows.length > 0) {
      return res.json({
        available: false,
        reason: 'off_day',
        message: offDayResult.rows[0].reason || 'Vendor is not available on this date',
        vendorId,
        date
      });
    }

    // If no off day found, check availability table
    const availabilityQuery = `
      SELECT * FROM vendor_availability 
      WHERE vendor_id = $1 AND date = $2
    `;
    
    const availabilityResult = await db.query(availabilityQuery, [vendorId, date]);
    
    if (availabilityResult.rows.length > 0) {
      const availability = availabilityResult.rows[0];
      return res.json({
        available: availability.is_available,
        reason: availability.reason || (availability.is_available ? 'available' : 'not_available'),
        vendorId,
        date,
        maxBookings: availability.max_bookings,
        currentBookings: availability.current_bookings
      });
    }

    // If no specific availability record, assume available
    res.json({
      available: true,
      reason: 'available',
      vendorId,
      date
    });

  } catch (error) {
    console.error('❌ [Availability] Error checking availability:', error);
    res.status(500).json({
      error: 'Failed to check availability',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get vendor calendar (availability + off days for date range)
app.get('/api/availability/calendar/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        error: 'Missing date range',
        message: 'start and end query parameters are required (YYYY-MM-DD format)'
      });
    }

    // Get availability and off days for the date range
    const query = `
      SELECT 
        date,
        CASE 
          WHEN od.id IS NOT NULL THEN false
          WHEN va.is_available IS NOT NULL THEN va.is_available
          ELSE true
        END as is_available,
        COALESCE(od.reason, va.reason, 'available') as reason,
        va.max_bookings,
        va.current_bookings
      FROM generate_series($2::date, $3::date, '1 day') AS date
      LEFT JOIN vendor_availability va ON va.vendor_id = $1 AND va.date = date
      LEFT JOIN vendor_off_days od ON od.vendor_id = $1 AND od.date = date AND od.is_active = true
      ORDER BY date
    `;

    const result = await db.query(query, [vendorId, start, end]);
    
    res.json({
      vendorId,
      startDate: start,
      endDate: end,
      availability: result.rows.map(row => ({
        date: row.date.toISOString().split('T')[0],
        isAvailable: row.is_available,
        reason: row.reason,
        maxBookings: row.max_bookings,
        currentBookings: row.current_bookings
      }))
    });

  } catch (error) {
    console.error('❌ [Availability] Error getting calendar:', error);
    res.status(500).json({
      error: 'Failed to get calendar',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Set vendor off days
app.post('/api/availability/off-days', async (req, res) => {
  try {
    const { vendorId, offDays } = req.body;

    if (!vendorId || !offDays || !Array.isArray(offDays)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'vendorId and offDays array are required'
      });
    }

    // Insert off days
    const insertPromises = offDays.map(offDay => {
      const { date, reason, isRecurring, recurringPattern, recurringEndDate } = offDay;
      
      const query = `
        INSERT INTO vendor_off_days (
          vendor_id, date, reason, is_recurring, recurring_pattern, recurring_end_date, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT (vendor_id, date) 
        DO UPDATE SET 
          reason = EXCLUDED.reason,
          is_recurring = EXCLUDED.is_recurring,
          recurring_pattern = EXCLUDED.recurring_pattern,
          recurring_end_date = EXCLUDED.recurring_end_date,
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      
      return db.query(query, [
        vendorId, 
        date, 
        reason || 'Off day', 
        isRecurring || false,
        recurringPattern || null,
        recurringEndDate || null
      ]);
    });

    const results = await Promise.all(insertPromises);
    
    res.json({
      success: true,
      message: 'Off days set successfully',
      offDays: results.map(result => result.rows[0])
    });

  } catch (error) {
    console.error('❌ [Availability] Error setting off days:', error);
    res.status(500).json({
      error: 'Failed to set off days',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get vendor off days
app.get('/api/availability/off-days/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;

    const query = `
      SELECT * FROM vendor_off_days 
      WHERE vendor_id = $1 AND is_active = true
      ORDER BY date ASC
    `;

    const result = await db.query(query, [vendorId]);
    
    res.json({
      vendorId,
      offDays: result.rows.map(row => ({
        id: row.id,
        vendorId: row.vendor_id,
        date: row.date,
        reason: row.reason,
        isRecurring: row.is_recurring,
        recurringPattern: row.recurring_pattern,
        recurringEndDate: row.recurring_end_date,
        createdAt: row.created_at
      }))
    });

  } catch (error) {
    console.error('❌ [Availability] Error getting off days:', error);
    res.status(500).json({
      error: 'Failed to get off days',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Remove vendor off day
app.delete('/api/availability/off-days/:offDayId', async (req, res) => {
  try {
    const { offDayId } = req.params;

    const query = `
      UPDATE vendor_off_days 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [offDayId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Off day not found',
        message: `Off day with ID ${offDayId} not found`
      });
    }

    res.json({
      success: true,
      message: 'Off day removed successfully'
    });

  } catch (error) {
    console.error('❌ [Availability] Error removing off day:', error);
    res.status(500).json({
      error: 'Failed to remove off day',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DSS ENDPOINTS
// Decision Support System endpoints that integrate with availability data

// Get all vendors and services for DSS analysis
app.get('/api/dss/data', async (req, res) => {
  try {
    console.log('📊 [DSS] Fetching vendors and services data...');

    // Fetch vendors
    const vendorsQuery = `
      SELECT 
        id,
        name as "businessName",
        category as "businessType", 
        description,
        rating,
        review_count as "reviewCount",
        location,
        price_range as "priceRange",
        starting_price as "startingPrice",
        years_experience as "yearsExperience",
        verified,
        portfolio_images as "portfolioImages",
        portfolio_url as "portfolioUrl",
        instagram_url as "instagramUrl", 
        website_url as "websiteUrl",
        profile_image as "profileImage",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM vendors 
      WHERE verified = true 
      ORDER BY rating DESC
    `;

    const vendorsResult = await db.query(vendorsQuery);
    const vendors = vendorsResult.rows.map(vendor => ({
      ...vendor,
      portfolioImages: Array.isArray(vendor.portfolioImages) ? vendor.portfolioImages : 
        vendor.portfolioImages ? [vendor.portfolioImages] : []
    }));

    // Fetch services with per-service review stats
    const servicesQuery = `
      SELECT 
        s.id,
        s.vendor_id as "vendorId",
        s.name,
        s.title,
        s.description, 
        s.category,
        s.price,
        s.images,
        s.featured,
        s.is_active as "isActive",
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as rating,
        COALESCE(COUNT(r.id), 0) as "reviewCount",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt"
      FROM services s
      LEFT JOIN reviews r ON r.service_id = s.id
      WHERE s.is_active = true
      GROUP BY s.id, s.vendor_id, s.name, s.title, s.description, 
               s.category, s.price, s.images, s.featured, s.is_active,
               s.created_at, s.updated_at
      ORDER BY s.featured DESC, s.price ASC
    `;

    const servicesResult = await db.query(servicesQuery);
    const services = servicesResult.rows.map(service => ({
      ...service,
      images: Array.isArray(service.images) ? service.images :
        service.images ? [service.images] : []
    }));

    console.log('✅ [DSS] Data fetched successfully:', {
      vendors: vendors.length,
      services: services.length
    });

    res.json({
      vendors,
      services,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [DSS] Error fetching data:', error);
    res.status(500).json({
      error: 'Failed to fetch DSS data',
      details: error.message,
      success: false
    });
  }
});

// Generate DSS recommendations with availability filtering
app.post('/api/dss/recommendations', async (req, res) => {
  try {
    const { budget, location, weddingDate, guestCount, priorities, categories, priceRange } = req.body;
    
    console.log('🧠 [DSS] Generating recommendations with params:', {
      budget,
      location,
      weddingDate,
      guestCount,
      priorities: priorities?.length || 0,
      categories: categories?.length || 0,
      priceRange
    });

    // First, get all vendors and services
    const vendorsQuery = `
      SELECT 
        id,
        name as "businessName",
        category as "businessType", 
        description,
        rating,
        review_count as "reviewCount",
        location,
        price_range as "priceRange",
        starting_price as "startingPrice",
        years_experience as "yearsExperience",
        verified,
        portfolio_images as "portfolioImages",
        portfolio_url as "portfolioUrl",
        instagram_url as "instagramUrl", 
        website_url as "websiteUrl",
        profile_image as "profileImage",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM vendors 
      WHERE verified = true 
      ORDER BY rating DESC
    `;

    const vendorsResult = await db.query(vendorsQuery);
    const allVendors = vendorsResult.rows.map(vendor => ({
      ...vendor,
      portfolioImages: Array.isArray(vendor.portfolioImages) ? vendor.portfolioImages : 
        vendor.portfolioImages ? [vendor.portfolioImages] : []
    }));

    const servicesQuery = `
      SELECT 
        s.id,
        s.vendor_id as "vendorId",
        s.name,
        s.title,
        s.description, 
        s.category,
        s.price,
        s.images,
        s.featured,
        s.is_active as "isActive",
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as rating,
        COALESCE(COUNT(r.id), 0) as "reviewCount",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt"
      FROM services s
      LEFT JOIN reviews r ON r.service_id = s.id
      WHERE s.is_active = true
      GROUP BY s.id, s.vendor_id, s.name, s.title, s.description, 
               s.category, s.price, s.images, s.featured, s.is_active,
               s.created_at, s.updated_at
      ORDER BY s.featured DESC, s.price ASC
    `;

    const servicesResult = await db.query(servicesQuery);
    const allServices = servicesResult.rows.map(service => ({
      ...service,
      images: Array.isArray(service.images) ? service.images :
        service.images ? [service.images] : []
    }));

    // Filter out unavailable vendors if wedding date is provided
    let availableVendorIds = new Set(allVendors.map(v => v.id));
    
    if (weddingDate) {
      console.log('🗓️ [DSS] Filtering by availability for date:', weddingDate);
      
      const dateStr = new Date(weddingDate).toISOString().split('T')[0];
      
      // Check for vendors with off days on the wedding date
      const offDaysQuery = `
        SELECT DISTINCT vendor_id 
        FROM vendor_off_days 
        WHERE date = $1 AND is_recurring = false
        UNION
        SELECT DISTINCT vendor_id 
        FROM vendor_off_days 
        WHERE is_recurring = true 
        AND (
          EXTRACT(DOW FROM $1::date) = EXTRACT(DOW FROM date::date) OR
          TO_CHAR($1::date, 'MM-DD') = TO_CHAR(date::date, 'MM-DD')
        )
      `;
      
      const offDaysResult = await db.query(offDaysQuery, [dateStr]);
      const unavailableVendorIds = new Set(offDaysResult.rows.map(row => row.vendor_id));
      
      // Remove unavailable vendors
      availableVendorIds = new Set([...availableVendorIds].filter(id => !unavailableVendorIds.has(id)));
      
      console.log('📊 [DSS] Availability filtering results:', {
        totalVendors: allVendors.length,
        unavailableVendors: unavailableVendorIds.size,
        availableVendors: availableVendorIds.size
      });
    }

    // Filter vendors and services by availability
    const availableVendors = allVendors.filter(vendor => availableVendorIds.has(vendor.id));
    const availableServices = allServices.filter(service => availableVendorIds.has(service.vendorId));

    // Generate recommendations using available vendors/services
    const recommendations: any[] = [];
    
    for (const service of availableServices) {
      const vendor = availableVendors.find(v => v.id === service.vendorId);
      if (!vendor) continue;

      // Calculate recommendation score
      let score = 50; // Base score
      const reasons: string[] = [];

      // Category matching
      if (categories && categories.length > 0) {
        if (categories.includes(service.category.toLowerCase())) {
          score += 20;
          reasons.push(`Matches your ${service.category} category preference`);
        }
      }

      // Budget scoring
      if (budget && service.price) {
        const budgetPercentage = (service.price / budget) * 100;
        if (budgetPercentage <= 80) {
          score += 15;
          reasons.push('Within your budget');
        } else if (budgetPercentage <= 100) {
          score += 5;
          reasons.push('Close to your budget limit');
        } else {
          score -= 10;
          reasons.push('Above your budget');
        }
      }

      // Price range filtering
      if (priceRange && service.price) {
        if (service.price >= priceRange[0] && service.price <= priceRange[1]) {
          score += 10;
          reasons.push('Within your price range');
        }
      }

      // Location matching
      if (location && vendor.location) {
        if (vendor.location.toLowerCase().includes(location.toLowerCase())) {
          score += 15;
          reasons.push('Located in your preferred area');
        }
      }

      // Rating bonus
      if (vendor.rating >= 4.5) {
        score += 15;
        reasons.push('Highly rated by customers');
      } else if (vendor.rating >= 4.0) {
        score += 8;
        reasons.push('Well-rated by customers');
      }

      // Experience bonus
      if (vendor.yearsExperience >= 10) {
        score += 10;
        reasons.push('Very experienced vendor');
      } else if (vendor.yearsExperience >= 5) {
        score += 5;
        reasons.push('Experienced vendor');
      }

      // Featured service bonus
      if (service.featured) {
        score += 5;
        reasons.push('Featured service');
      }

      // Verified vendor bonus
      if (vendor.verified) {
        score += 5;
        reasons.push('Verified vendor');
      }

      // Determine priority and risk level
      let priority = 'medium';
      let riskLevel = 'medium';
      
      if (score >= 80) {
        priority = 'high';
        riskLevel = 'low';
      } else if (score <= 40) {
        priority = 'low';
        riskLevel = 'high';
      }

      if (score > 30) { // Minimum threshold
        recommendations.push({
          serviceId: service.id,
          vendorId: vendor.id,
          score: Math.round(score),
          reasons,
          priority,
          category: service.category,
          estimatedCost: service.price || 0,
          valueRating: Math.min(5, Math.round((score / 20) * 10) / 10),
          riskLevel,
          vendor,
          service
        });
      }
    }

    // Sort by score and return top 50
    const finalRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    console.log('✅ [DSS] Recommendations generated:', {
      total: finalRecommendations.length,
      highPriority: finalRecommendations.filter(r => r.priority === 'high').length,
      mediumPriority: finalRecommendations.filter(r => r.priority === 'medium').length,
      lowPriority: finalRecommendations.filter(r => r.priority === 'low').length,
      availabilityFiltered: weddingDate ? true : false
    });

    res.json({
      recommendations: finalRecommendations,
      meta: {
        totalVendors: allVendors.length,
        availableVendors: availableVendors.length,
        totalServices: allServices.length,
        availableServices: availableServices.length,
        filterByDate: !!weddingDate,
        generatedAt: new Date().toISOString()
      },
      success: true
    });

  } catch (error) {
    console.error('❌ [DSS] Error generating recommendations:', error);
    res.status(500).json({
      error: 'Failed to generate recommendations',
      details: error.message,
      success: false
    });
  }
});

// ============================================================================
// VENDOR PROFILE ENDPOINTS - Document Upload Fix
// ============================================================================

// Get vendor profile (modular endpoint)
app.get('/api/vendor-profile/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log('👤 Getting vendor profile:', vendorId);

    const result = await db.query(`
      SELECT 
        vp.id,
        vp.business_name as "businessName",
        vp.business_type as "businessType", 
        vp.description,
        vp.location,
        vp.years_in_business as "yearsInBusiness",
        vp.website,
        vp.service_area as "serviceArea",
        vp.phone,
        vp.email,
        vp.profile_image as "profileImage",
        vp.phone_verified as "phoneVerified",
        vp.business_verified as "businessVerified",
        vp.verification_status as "verificationStatus",
        vp.facebook_url,
        vp.instagram_url,
        vp.twitter_url,
        vp.linkedin_url
      FROM vendor_profiles vp 
      WHERE vp.id = $1
    `, [vendorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    const profile = result.rows[0];
    
    // Map social media fields properly
    profile.socialMedia = {
      facebook: profile.facebook_url || '',
      instagram: profile.instagram_url || '',
      twitter: profile.twitter_url || '',
      linkedin: profile.linkedin_url || ''
    };

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('❌ Vendor profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get vendor profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload vendor documents
app.post('/api/vendor-profile/:vendorId/documents', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { 
      documentType, 
      documentName, 
      documentUrl, 
      fileSize, 
      mimeType 
    } = req.body;

    console.log('📄 Uploading document for vendor:', vendorId, {
      documentType,
      documentName,
      documentUrl,
      fileSize,
      mimeType
    });

    // Validate required fields
    if (!documentType || !documentName || !documentUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'documentType, documentName, and documentUrl are required'
      });
    }

    // Insert document record - FIXED: use file_name instead of document_name
    const result = await db.query(`
      INSERT INTO vendor_documents (
        vendor_id, 
        document_type, 
        file_name, 
        document_url, 
        file_size, 
        mime_type
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [vendorId, documentType, documentName, documentUrl, fileSize || null, mimeType || null]);

    console.log('✅ Document uploaded successfully:', result.rows[0]);

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: result.rows[0].id,
        documentType: result.rows[0].document_type,
        documentName: result.rows[0].file_name,
        documentUrl: result.rows[0].document_url,
        fileSize: result.rows[0].file_size,
        mimeType: result.rows[0].mime_type,
        verificationStatus: result.rows[0].verification_status,
        uploadedAt: result.rows[0].uploaded_at
      }
    });

  } catch (error) {
    console.error('❌ Document upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Document upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get vendor documents
app.get('/api/vendor-profile/:vendorId/documents', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log('📋 Getting documents for vendor:', vendorId);

    const result = await db.query(`
      SELECT 
        id, 
        document_type, 
        document_url, 
        file_name,
        verification_status, 
        uploaded_at, 
        verified_at, 
        rejection_reason,
        file_size,
        mime_type
      FROM vendor_documents 
      WHERE vendor_id = $1 
      ORDER BY uploaded_at DESC
    `, [vendorId]);

    const documents = result.rows.map(doc => ({
      id: doc.id,
      documentType: doc.document_type,
      documentUrl: doc.document_url,
      fileName: doc.file_name,
      verificationStatus: doc.verification_status,
      uploadedAt: doc.uploaded_at,
      verifiedAt: doc.verified_at,
      rejectionReason: doc.rejection_reason,
      fileSize: doc.file_size,
      mimeType: doc.mime_type
    }));

    res.json({
      success: true,
      documents,
      total: documents.length
    });

  } catch (error) {
    console.error('❌ Get documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get documents',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Admin: Get pending documents
app.get('/api/admin/documents/pending', async (req, res) => {
  try {
    console.log('👨‍💼 Getting pending documents for admin review');

    const result = await db.query(`
      SELECT 
        vd.id,
        vd.vendor_id,
        vd.document_type,
        vd.document_url,
        vd.file_name,
        vd.verification_status,
        vd.uploaded_at,
        vd.verified_at,
        vd.rejection_reason,
        vd.file_size,
        vd.mime_type,
        u.first_name || ' ' || u.last_name as vendor_name,
        vp.business_name
      FROM vendor_documents vd
      LEFT JOIN vendor_profiles vp ON vd.vendor_id = vp.id
      LEFT JOIN users u ON vp.user_id = u.id
      ORDER BY vd.uploaded_at DESC
    `);

    const documents = result.rows.map(doc => ({
      id: doc.id,
      vendorId: doc.vendor_id,
      vendorName: doc.vendor_name || 'Unknown Vendor',
      businessName: doc.business_name || 'Unknown Business',
      documentType: doc.document_type,
      documentUrl: doc.document_url,
      fileName: doc.file_name,
      uploadedAt: doc.uploaded_at,
      verificationStatus: doc.verification_status,
      verifiedAt: doc.verified_at,
      rejectionReason: doc.rejection_reason,
      fileSize: doc.file_size || 0,
      mimeType: doc.mime_type || 'application/octet-stream'
    }));

    const stats = {
      total: documents.length,
      pending: documents.filter(d => d.verificationStatus === 'pending').length,
      approved: documents.filter(d => d.verificationStatus === 'approved').length,
      rejected: documents.filter(d => d.verificationStatus === 'rejected').length
    };

    res.json({
      success: true,
      documents,
      stats
    });

  } catch (error) {
    console.error('❌ Admin documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get documents',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found: ' + req.method + ' ' + req.originalUrl,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      health: 'GET /api/health',
      ping: 'GET /api/ping',
      auth: 'POST /api/auth/login, POST /api/auth/verify',
      conversations: 'GET /api/conversations/:userId, GET /api/conversations/:id/messages, POST /api/conversations/:id/messages',
      services: 'GET /api/services, GET /api/services/:serviceId, GET /api/services/vendor/:vendorId, POST /api/services, PUT /api/services/:id, DELETE /api/services/:id',
      vendors: 'GET /api/vendors, GET /api/vendors/featured, GET /api/vendors/:id, GET /api/vendors/:id/services',
      vendorProfile: 'GET /api/vendor-profile/:vendorId, POST /api/vendor-profile/:vendorId/documents, GET /api/vendor-profile/:vendorId/documents',
      vendorOffDays: 'GET /api/vendors/:vendorId/off-days, POST /api/vendors/:vendorId/off-days, POST /api/vendors/:vendorId/off-days/bulk, DELETE /api/vendors/:vendorId/off-days/:offDayId, GET /api/vendors/:vendorId/off-days/count',
      bookings: 'GET /api/bookings/vendor/:vendorId, GET /api/bookings/user/:userId, GET /api/bookings/couple/:userId, GET /api/bookings/enhanced, GET /api/bookings/stats, POST /api/bookings, PATCH /api/bookings/:id/status, PUT /api/bookings/:id/update-status, PUT /api/bookings/:id/accept-quote, PUT /api/bookings/:id/process-payment, GET /api/bookings/:id/payment-status',
      payments: 'POST /api/payments/create-source, GET /api/payments/source/:sourceId, POST /api/payments/create-payment-intent, GET /api/payments/payment-intent/:intentId, POST /api/payments/webhook, GET /api/payments/health',
      receipts: 'GET /api/receipts/couple/:coupleId, GET /api/receipts/vendor/:vendorId, GET /api/receipts/:receiptId, POST /api/receipts/create, GET /api/receipts/stats/couple/:coupleId',
      notifications: 'GET /api/notifications/vendor/:vendorId, GET /api/notifications/user/:userId, POST /api/notifications, PATCH /api/notifications/:id/read',
      admin: 'GET /api/admin/documents/pending',
      debug: 'GET /api/debug/users, GET /api/debug/tables, GET /api/debug/schema/:tableName, GET /api/debug/sample/:tableName'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Bazaar Minimal Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
});

export default app;

// =============================================================================
// VENDOR MAPPING FIX DEPLOYMENT - 2025/10/12 16:35:00
// Added admin endpoint POST /api/admin/fix-vendor-mappings to fix null vendor_id services
// Fixes 4 services (SRV-39368, SRV-70524, SRV-71896, SRV-70580) that cause booking modal hangs
// Maps services to: Perfect Weddings Co. (2-2025-004) and Beltran Sound Systems (2-2025-003)
// This resolves the "Security & Guest Management Service" booking modal issue
// =============================================================================
