-- ========================================
-- ADD ITEMIZATION TO "LUXURY GARDEN" PACKAGE
-- Run this in Neon SQL Console NOW
-- ========================================

-- Step 1: Verify the package exists
SELECT id, package_name, base_price 
FROM service_packages 
WHERE package_name = 'Luxury Garden';

-- Step 2: Add package items (₱120,000 total breakdown)
INSERT INTO package_items (package_id, item_type, item_name, item_description, quantity, unit_type, unit_price)
VALUES 
  -- Personnel (₱31,000)
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'personnel', 'Lead Florist', 'Expert floral designer with 10+ years experience in luxury weddings', 1, 'person', 15000.00),
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'personnel', 'Assistant Florists', 'Professional setup and arrangement team', 2, 'person', 8000.00),
  
  -- Deliverables (₱81,000)
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'deliverable', 'Bridal Bouquet', 'Premium hand-tied cascading bouquet with imported flowers', 1, 'piece', 12000.00),
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'deliverable', 'Bridesmaids Bouquets', 'Coordinating bouquets for bridal party', 5, 'piece', 6000.00),
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'deliverable', 'Ceremony Arch Flowers', 'Lush full floral arch with premium blooms', 1, 'set', 25000.00),
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'deliverable', 'Reception Centerpieces', 'Elegant tall centerpieces with mixed florals', 15, 'piece', 18000.00),
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'deliverable', 'Entrance Arrangements', 'Grand welcome area floral displays', 2, 'set', 10000.00),
  
  -- Equipment (₱8,000)
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'equipment', 'Floral Arch Structure', 'Premium metal arch frame for ceremony backdrop', 1, 'unit', 5000.00),
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'equipment', 'Glass Vases & Containers', 'Crystal clear vases for all table centerpieces', 15, 'piece', 3000.00);

-- Step 3: Add optional add-ons
INSERT INTO package_addons (package_id, addon_name, addon_description, addon_price, is_available)
VALUES
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'Rose Petals for Aisle', 'Fresh rose petals scattered along ceremony aisle for romantic touch', 8000.00, true),
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'Corsages & Boutonnieres Set', 'Floral pieces for parents, groomsmen, and VIP guests (10 pieces)', 12000.00, true),
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'Premium Flower Upgrade', 'Upgrade to imported orchids, peonies, and garden roses', 20000.00, true),
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'Same-Day Fresh Delivery', 'Morning-of delivery for maximum freshness guarantee', 5000.00, true),
  ('d7737695-1ccc-4c7d-8035-0dde520b04fe', 'Bouquet Preservation', 'Professional preservation of bridal bouquet as keepsake', 15000.00, true);

-- Step 4: Verify the data was inserted
SELECT 
  sp.package_name,
  sp.base_price,
  COUNT(DISTINCT pi.id) as item_count,
  COUNT(DISTINCT pa.id) as addon_count,
  SUM(pi.unit_price * pi.quantity) as total_items_value
FROM service_packages sp
LEFT JOIN package_items pi ON sp.id = pi.package_id
LEFT JOIN package_addons pa ON sp.id = pa.package_id
WHERE sp.id = 'd7737695-1ccc-4c7d-8035-0dde520b04fe'
GROUP BY sp.package_name, sp.base_price;

-- Expected result:
-- package_name: "Luxury Garden"
-- base_price: 120000.00
-- item_count: 9
-- addon_count: 5
-- total_items_value: 120000.00 ✓

-- Step 5: View the full package with items and addons
SELECT 
  sp.package_name,
  pi.item_name,
  pi.item_type,
  pi.quantity,
  pi.unit_price,
  (pi.quantity * pi.unit_price) as line_total
FROM service_packages sp
JOIN package_items pi ON sp.id = pi.package_id
WHERE sp.id = 'd7737695-1ccc-4c7d-8035-0dde520b04fe'
ORDER BY pi.item_type, pi.item_name;

-- Step 6: View add-ons
SELECT 
  sp.package_name,
  pa.addon_name,
  pa.addon_description,
  pa.addon_price,
  pa.is_available
FROM service_packages sp
JOIN package_addons pa ON sp.id = pa.package_id
WHERE sp.id = 'd7737695-1ccc-4c7d-8035-0dde520b04fe'
ORDER BY pa.addon_price DESC;

-- ========================================
-- ✅ DONE! Now test in frontend:
-- 1. Go to https://weddingbazaarph.web.app/individual/services
-- 2. Find "Bloom & Grace" (Florist service)
-- 3. Select "Luxury Garden" package
-- 4. Request booking and go to Step 6
-- 5. You should see ALL items and add-ons! 🎉
-- ========================================
