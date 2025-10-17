const express = require('express');
const router = express.Router();

// This will be replaced with database connection
let db;

function initializeRouter(database) {
  db = database;
  return router;
}

// ============================================================================
// SERVICE CATEGORIES ENDPOINTS
// ============================================================================

// GET /api/categories - Get all active service categories
router.get('/', async (req, res) => {
  try {
    console.log('📂 [API] GET /api/categories called');
    
    const result = await db.query(`
      SELECT 
        id, name, display_name, description, icon, sort_order
      FROM service_categories 
      WHERE is_active = true
      ORDER BY sort_order ASC, display_name ASC
    `);
    
    console.log(`✅ [API] Found ${result.rows.length} active categories`);
    
    res.json({
      success: true,
      categories: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ [API] Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/categories/:categoryId - Get a specific category
router.get('/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`📂 [API] GET /api/categories/${categoryId} called`);
    
    const result = await db.query(`
      SELECT 
        id, name, display_name, description, icon, sort_order
      FROM service_categories 
      WHERE id = $1 AND is_active = true
    `, [categoryId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    console.log(`✅ [API] Found category: ${result.rows[0].display_name}`);
    
    res.json({
      success: true,
      category: result.rows[0]
    });
  } catch (error) {
    console.error('❌ [API] Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// SERVICE FEATURES ENDPOINTS
// ============================================================================

// GET /api/categories/:categoryId/features - Get features for a category
router.get('/:categoryId/features', async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`✨ [API] GET /api/categories/${categoryId}/features called`);
    
    const result = await db.query(`
      SELECT 
        id, name, description, icon, is_common, sort_order
      FROM service_features 
      WHERE (category_id = $1 OR category_id IS NULL) 
        AND is_active = true
      ORDER BY is_common DESC, sort_order ASC, name ASC
    `, [categoryId]);
    
    console.log(`✅ [API] Found ${result.rows.length} features for category`);
    
    res.json({
      success: true,
      categoryId,
      features: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ [API] Error fetching features:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch features',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/features/common - Get common features (not category-specific)
router.get('/features/common', async (req, res) => {
  try {
    console.log('✨ [API] GET /api/features/common called');
    
    const result = await db.query(`
      SELECT 
        id, name, description, icon, sort_order
      FROM service_features 
      WHERE is_common = true AND is_active = true
      ORDER BY sort_order ASC, name ASC
    `);
    
    console.log(`✅ [API] Found ${result.rows.length} common features`);
    
    res.json({
      success: true,
      features: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ [API] Error fetching common features:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch common features',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// PRICE RANGES ENDPOINTS
// ============================================================================

// GET /api/price-ranges - Get all price ranges
router.get('/price-ranges', async (req, res) => {
  try {
    console.log('💰 [API] GET /api/price-ranges called');
    
    const result = await db.query(`
      SELECT 
        id, range_text, label, description, min_amount, max_amount, sort_order
      FROM price_ranges 
      WHERE is_active = true
      ORDER BY sort_order ASC
    `);
    
    console.log(`✅ [API] Found ${result.rows.length} price ranges`);
    
    res.json({
      success: true,
      priceRanges: result.rows.map(row => ({
        id: row.id,
        value: row.range_text,
        label: row.label,
        description: row.description,
        minAmount: row.min_amount,
        maxAmount: row.max_amount
      })),
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ [API] Error fetching price ranges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price ranges',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

module.exports = { router, initializeRouter };
