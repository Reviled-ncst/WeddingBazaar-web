const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// ============================================================================
// SERVICE CATEGORIES ENDPOINTS
// ============================================================================

// GET /api/categories - Get all active service categories with subcategories
router.get('/', async (req, res) => {
  try {
    console.log('📂 [API] GET /api/categories called');
    
    // Fetch all categories
    const categories = await sql`
      SELECT 
        id, name, display_name, description, icon, sort_order
      FROM service_categories 
      WHERE is_active = true
      ORDER BY sort_order ASC, display_name ASC
    `;
    
    console.log(`✅ [API] Found ${categories.length} active categories`);
    
    // Fetch all subcategories for these categories
    const subcategories = await sql`
      SELECT 
        id, category_id, name, display_name, description, sort_order
      FROM service_subcategories 
      WHERE is_active = true
      ORDER BY sort_order ASC, display_name ASC
    `;
    
    console.log(`✅ [API] Found ${subcategories.length} active subcategories`);
    
    // Group subcategories by category_id
    const subcategoriesByCategory = {};
    subcategories.forEach(sub => {
      if (!subcategoriesByCategory[sub.category_id]) {
        subcategoriesByCategory[sub.category_id] = [];
      }
      subcategoriesByCategory[sub.category_id].push({
        id: sub.id,
        name: sub.name,
        display_name: sub.display_name,
        description: sub.description,
        sort_order: sub.sort_order
      });
    });
    
    // Attach subcategories to each category
    const categoriesWithSubcategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      display_name: cat.display_name,
      description: cat.description,
      icon: cat.icon,
      sort_order: cat.sort_order,
      subcategories: subcategoriesByCategory[cat.id] || []
    }));
    
    res.json({
      success: true,
      categories: categoriesWithSubcategories,
      total: categoriesWithSubcategories.length
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
    
    const result = await sql`
      SELECT 
        id, name, display_name, description, icon, sort_order
      FROM service_categories 
      WHERE id = ${categoryId} AND is_active = true
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    console.log(`✅ [API] Found category: ${result[0].display_name}`);
    
    res.json({
      success: true,
      category: result[0]
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

// GET /api/categories/:categoryId/subcategories - Get subcategories for a category
router.get('/:categoryId/subcategories', async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`📁 [API] GET /api/categories/${categoryId}/subcategories called`);
    
    const result = await sql`
      SELECT 
        id, category_id, name, display_name, description, sort_order
      FROM service_subcategories 
      WHERE category_id = ${categoryId} AND is_active = true
      ORDER BY sort_order ASC, display_name ASC
    `;
    
    console.log(`✅ [API] Found ${result.length} subcategories for category ${categoryId}`);
    
    res.json({
      success: true,
      categoryId,
      subcategories: result,
      total: result.length
    });
  } catch (error) {
    console.error('❌ [API] Error fetching subcategories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subcategories',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// SERVICE FEATURES ENDPOINTS
// ============================================================================

// GET /api/categories/by-name/:categoryName/fields - Get fields by category name
router.get('/by-name/:categoryName/fields', async (req, res) => {
  try {
    const { categoryName } = req.params;
    console.log(`📋 [API] GET /api/categories/by-name/${categoryName}/fields called`);
    
    // First, find the category by name (check both name and display_name)
    const categories = await sql`
      SELECT id, name, display_name
      FROM service_categories 
      WHERE (name = ${categoryName} OR display_name = ${categoryName})
        AND is_active = true
      LIMIT 1
    `;
    
    if (categories.length === 0) {
      console.log(`❌ [API] Category not found: ${categoryName}`);
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        categoryName
      });
    }
    
    const category = categories[0];
    console.log(`✅ [API] Found category: ${category.display_name} (ID: ${category.id})`);
    
    // Get fields for this category (with fallback if table doesn't exist)
    let fields = [];
    try {
      fields = await sql`
        SELECT 
          id, 
          category_id,
          field_name,
          field_label,
          field_type,
          is_required,
          options,
          help_text,
          validation_rules,
          sort_order
        FROM service_category_fields 
        WHERE category_id = ${category.id}
          AND is_active = true
        ORDER BY sort_order ASC, field_label ASC
      `;
      console.log(`✅ [API] Found ${fields.length} fields for category ${category.display_name}`);
    } catch (tableError) {
      // Table doesn't exist, return empty array
      console.log(`⚠️  [API] service_category_fields table not found, returning empty fields array`);
      console.log(`   Error: ${tableError.message}`);
      fields = [];
    }
    
    res.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        display_name: category.display_name
      },
      fields: fields,
      total: fields.length
    });
  } catch (error) {
    console.error('❌ [API] Error fetching category fields by name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category fields',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/categories/:categoryId/features - Get features for a category
router.get('/:categoryId/features', async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`✨ [API] GET /api/categories/${categoryId}/features called`);
    
    const result = await sql`
      SELECT 
        id, name, description, icon, is_common, sort_order
      FROM service_features 
      WHERE (category_id = ${categoryId} OR category_id IS NULL) 
        AND is_active = true
      ORDER BY is_common DESC, sort_order ASC, name ASC
    `;
    
    console.log(`✅ [API] Found ${result.length} features for category`);
    
    res.json({
      success: true,
      categoryId,
      features: result,
      total: result.length
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
    
    const result = await sql`
      SELECT 
        id, name, description, icon, sort_order
      FROM service_features 
      WHERE is_common = true AND is_active = true
      ORDER BY sort_order ASC, name ASC
    `;
    
    console.log(`✅ [API] Found ${result.length} common features`);
    
    res.json({
      success: true,
      features: result,
      total: result.length
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
    
    const result = await sql`
      SELECT 
        id, range_text, label, description, min_amount, max_amount, sort_order
      FROM price_ranges 
      WHERE is_active = true
      ORDER BY sort_order ASC
    `;
    
    console.log(`✅ [API] Found ${result.length} price ranges`);
    
    res.json({
      success: true,
      priceRanges: result.map(row => ({
        id: row.id,
        value: row.range_text,
        label: row.label,
        description: row.description,
        minAmount: row.min_amount,
        maxAmount: row.max_amount
      })),
      total: result.length
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

module.exports = router;
