-- =====================================================
-- PRICING TEMPLATES MIGRATION VERIFICATION QUERIES
-- Run these in Neon SQL Console after migration
-- =====================================================

-- 1. Check if all tables were created
SELECT 
    'Tables Check' as check_type,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'pricing_templates',
    'package_inclusions',
    'category_pricing_metadata',
    'template_customizations'
);
-- Expected: count = 4

-- 2. Check if all views were created
SELECT 
    'Views Check' as check_type,
    COUNT(*) as count
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN (
    'vw_complete_pricing_templates',
    'vw_category_pricing_summary'
);
-- Expected: count = 2

-- 3. Get total statistics
SELECT 
    'Total Templates' as metric,
    COUNT(*)::TEXT as value
FROM pricing_templates
UNION ALL
SELECT 
    'Active Templates',
    COUNT(*)::TEXT
FROM pricing_templates
WHERE is_active = TRUE
UNION ALL
SELECT 
    'Total Inclusions',
    COUNT(*)::TEXT
FROM package_inclusions
UNION ALL
SELECT 
    'Categories with Pricing',
    COUNT(DISTINCT category_id)::TEXT
FROM pricing_templates;
-- Expected: 
-- Total Templates: 49+
-- Active Templates: 49+
-- Total Inclusions: 376+
-- Categories with Pricing: 15

-- 4. Category-wise breakdown
SELECT 
    c.name as category_name,
    COUNT(DISTINCT pt.id) as templates,
    COUNT(pi.id) as inclusions,
    TO_CHAR(MIN(pt.base_price), 'FM₱999,999,999') as min_price,
    TO_CHAR(MAX(pt.base_price), 'FM₱999,999,999') as max_price
FROM service_categories c
LEFT JOIN pricing_templates pt ON pt.category_id = c.id
LEFT JOIN package_inclusions pi ON pi.template_id = pt.id
WHERE pt.id IS NOT NULL
GROUP BY c.name
ORDER BY c.name;
-- Expected: 15 rows with categories

-- 5. Check for orphaned records (should be 0)
SELECT 
    'Orphaned Templates' as issue,
    COUNT(*) as count
FROM pricing_templates
WHERE category_id IS NULL

UNION ALL

SELECT 
    'Orphaned Inclusions',
    COUNT(*)
FROM package_inclusions
WHERE template_id IS NULL

UNION ALL

SELECT 
    'Templates without Inclusions',
    COUNT(*)
FROM pricing_templates pt
LEFT JOIN package_inclusions pi ON pi.template_id = pt.id
WHERE pi.id IS NULL;
-- Expected: All counts should be 0

-- 6. Pricing calculation validation
SELECT 
    c.name as category,
    pt.name as template,
    pt.base_price,
    SUM(pi.quantity * pi.unit_price) as calculated_total,
    ABS(pt.base_price - SUM(pi.quantity * pi.unit_price)) as difference
FROM pricing_templates pt
JOIN service_categories c ON c.id = pt.category_id
JOIN package_inclusions pi ON pi.template_id = pt.id
GROUP BY c.name, pt.id, pt.name, pt.base_price
ORDER BY difference DESC
LIMIT 10;
-- Expected: Differences should be small (< ₱1,000 for rounding)

-- 7. Test complete templates view
SELECT 
    category_name,
    tier,
    name,
    base_price,
    jsonb_array_length(inclusions) as inclusion_count
FROM vw_complete_pricing_templates
ORDER BY category_name, base_price
LIMIT 10;
-- Expected: Formatted data with inclusion counts

-- 8. Test category summary view
SELECT 
    category_name,
    template_count,
    TO_CHAR(min_price, 'FM₱999,999,999') as min_price,
    TO_CHAR(max_price, 'FM₱999,999,999') as max_price,
    TO_CHAR(avg_price, 'FM₱999,999,999') as avg_price
FROM vw_category_pricing_summary
WHERE template_count > 0
ORDER BY category_name;
-- Expected: 15 categories with statistics

-- 9. Check tier distribution
SELECT 
    package_tier,
    COUNT(*) as count
FROM pricing_templates
GROUP BY package_tier
ORDER BY 
    CASE package_tier
        WHEN 'basic' THEN 1
        WHEN 'premium' THEN 2
        WHEN 'luxury' THEN 3
        ELSE 4
    END;
-- Expected: Roughly equal distribution (15-17 per tier)

-- 10. Sample complete template with inclusions
SELECT 
    pt.name as template_name,
    pt.package_tier,
    pt.base_price,
    c.name as category,
    pi.item_name,
    pi.quantity,
    pi.unit,
    pi.unit_price,
    (pi.quantity * pi.unit_price) as line_total,
    pi.display_order
FROM pricing_templates pt
JOIN service_categories c ON c.id = pt.category_id
JOIN package_inclusions pi ON pi.template_id = pt.id
WHERE pt.name = 'Premium Planning'
ORDER BY pi.display_order;
-- Expected: Full breakdown of Premium Planning package

-- =====================================================
-- VERIFICATION CHECKLIST
-- =====================================================

/*
✅ All 4 tables created
✅ All 2 views working
✅ 49+ templates populated
✅ 376+ inclusions added
✅ 15 categories have pricing
✅ No orphaned records
✅ Price calculations accurate
✅ Views return formatted data

If all checks pass, migration is COMPLETE! ✨
*/
