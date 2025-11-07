# ✅ Complete Pricing Templates Migration - Execution Checklist

**Project**: Wedding Bazaar Database Migration  
**Task**: Migrate Static Pricing Templates to Database  
**Status**: Ready for Execution  
**Estimated Time**: 20-30 minutes

---

## 📋 Pre-Flight Checklist

### **1. Environment Setup**
- [ ] Node.js installed (v16 or higher)
- [ ] `@neondatabase/serverless` package installed
- [ ] `.env` file configured with `DATABASE_URL`
- [ ] Database connection verified

### **2. Files Prepared**
- [ ] `backend-deploy/migrations/create-pricing-templates-tables.sql` (schema)
- [ ] `backend-deploy/migrations/migrate-pricing-templates.cjs` (first 4 categories)
- [ ] `backend-deploy/migrations/migrate-remaining-categories.cjs` (remaining 11 categories)
- [ ] Migration guide reviewed: `PRICING_TEMPLATES_MIGRATION_GUIDE.md`
- [ ] Pricing references reviewed:
  - `REALISTIC_WEDDING_PACKAGES_PRICING.md`
  - `REMAINING_CATEGORIES_PRICING_REFERENCE.md`

### **3. Database Backup**
- [ ] Backup current database schema
- [ ] Document existing tables
- [ ] Save rollback script location

---

## 🚀 Execution Steps

### **Phase 1: Schema Creation (5 minutes)**

#### **Step 1.1: Connect to Neon SQL Console**
```bash
# Open Neon dashboard
https://console.neon.tech/
# Navigate to SQL Editor
```

#### **Step 1.2: Execute Schema Creation Script**
```sql
-- Copy contents of create-pricing-templates-tables.sql
-- Paste into SQL Editor
-- Execute
```

**Expected Tables Created:**
- ✅ `pricing_templates`
- ✅ `package_inclusions`
- ✅ `category_pricing_metadata`
- ✅ `template_customizations`
- ✅ View: `vw_complete_pricing_templates`
- ✅ View: `vw_category_pricing_summary`

#### **Step 1.3: Verify Schema**
```sql
-- Run verification query
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%pricing%';
```

**Expected Output:**
```
pricing_templates
package_inclusions
category_pricing_metadata
template_customizations
```

**Status:** [ ] Schema Created Successfully

---

### **Phase 2: Initial Categories Migration (7 minutes)**

#### **Step 2.1: Navigate to Migrations Folder**
```bash
cd backend-deploy/migrations
```

#### **Step 2.2: Run First Migration Script**
```bash
node migrate-pricing-templates.cjs
```

**Expected Output:**
```
🚀 Starting pricing templates migration...
✅ Database connection successful

🔄 Migrating Photography packages...
  ✓ Bronze Package (4 inclusions)
  ✓ Silver Package (6 inclusions)
  ✓ Gold Package (8 inclusions)
  ✓ Platinum Package (10 inclusions)

🔄 Migrating Catering packages...
  ✓ Bronze Package (4 inclusions)
  ✓ Silver Package (5 inclusions)
  ✓ Gold Package (6 inclusions)
  ✓ Platinum Package (7 inclusions)

🔄 Migrating Venue packages...
  [similar output]

🔄 Migrating Music packages...
  [similar output]

✅ Migration completed successfully!

📋 Summary:
  Categories: 4
  Templates: 16
  Inclusions: 112
```

#### **Step 2.3: Verify First Migration**
```sql
-- In Neon SQL Console
SELECT 
  sc.name AS category,
  COUNT(DISTINCT pt.id) AS templates,
  COUNT(pi.id) AS inclusions,
  MIN(pt.base_price) AS min_price,
  MAX(pt.base_price) AS max_price
FROM service_categories sc
LEFT JOIN pricing_templates pt ON pt.category_id = sc.id
LEFT JOIN package_inclusions pi ON pi.template_id = pt.id
WHERE sc.name IN ('Photography', 'Catering', 'Venue', 'Music')
GROUP BY sc.name;
```

**Expected Results:**
| Category | Templates | Inclusions | Min Price | Max Price |
|----------|-----------|------------|-----------|-----------|
| Photography | 4 | 28 | 35,000 | 150,000 |
| Catering | 4 | 22 | 550 | 1,800 |
| Venue | 4 | 32 | 50,000 | 300,000 |
| Music | 4 | 30 | 15,000 | 80,000 |

**Status:** [ ] First 4 Categories Migrated

---

### **Phase 3: Remaining Categories Migration (8 minutes)**

#### **Step 3.1: Run Second Migration Script**
```bash
# Still in backend-deploy/migrations
node migrate-remaining-categories.cjs
```

**Expected Output:**
```
🚀 Starting migration of remaining wedding service categories...

📋 Step 1: Fetching category IDs from database...
   ✓ Found Planning: [uuid]
   ✓ Found Florist: [uuid]
   ✓ Found Beauty: [uuid]
   ✓ Found Officiant: [uuid]
   ✓ Found Rentals: [uuid]
   ✓ Found Cake: [uuid]
   ✓ Found Fashion: [uuid]
   ✓ Found Security: [uuid]
   ✓ Found AV Equipment: [uuid]
   ✓ Found Stationery: [uuid]
   ✓ Found Transportation: [uuid]

📦 Processing Planning...
   ✓ Category metadata created/updated
   ✓ Template: Essential Planning (basic)
      → 8 inclusions added
   [... more templates ...]

✅ Migration completed successfully!

📊 Summary:
   • Categories processed: 11
   • Pricing templates created: 33
   • Package inclusions added: 264
```

#### **Step 3.2: Verify Complete Migration**
```sql
-- Full system verification
SELECT 
  sc.name AS category,
  COUNT(DISTINCT pt.id) AS templates,
  COUNT(pi.id) AS inclusions,
  TO_CHAR(MIN(pt.base_price), 'FM₱999,999') AS min_price,
  TO_CHAR(MAX(pt.base_price), 'FM₱999,999') AS max_price
FROM service_categories sc
LEFT JOIN pricing_templates pt ON pt.category_id = sc.id
LEFT JOIN package_inclusions pi ON pi.template_id = pt.id
GROUP BY sc.name
HAVING COUNT(pt.id) > 0
ORDER BY sc.name;
```

**Expected Total:**
- **15 Categories** with pricing templates
- **49 Total Templates** (3-4 per category)
- **376+ Total Inclusions**

**Status:** [ ] All 15 Categories Migrated

---

### **Phase 4: Data Validation (5 minutes)**

#### **Step 4.1: Test Complex View**
```sql
-- Test complete pricing templates view
SELECT 
  category_name,
  template_name,
  tier,
  base_price,
  total_inclusions,
  calculated_total
FROM vw_complete_pricing_templates
LIMIT 10;
```

**Expected:** Properly formatted data with all fields populated

#### **Step 4.2: Test Category Summary View**
```sql
-- Test category pricing summary
SELECT * FROM vw_category_pricing_summary
ORDER BY category_name;
```

**Expected:** Summary statistics for all categories

#### **Step 4.3: Validate Pricing Logic**
```sql
-- Check for pricing anomalies
SELECT 
  pt.name,
  pt.base_price,
  SUM(pi.quantity * pi.unit_price) AS calculated_total,
  pt.base_price - SUM(pi.quantity * pi.unit_price) AS difference
FROM pricing_templates pt
JOIN package_inclusions pi ON pi.template_id = pt.id
GROUP BY pt.id, pt.name, pt.base_price
HAVING ABS(pt.base_price - SUM(pi.quantity * pi.unit_price)) > 1000
ORDER BY difference DESC;
```

**Expected:** Minimal differences (< ₱1,000 tolerance for rounding)

#### **Step 4.4: Check Data Integrity**
```sql
-- Verify no orphaned records
SELECT 
  'Templates without category' AS issue,
  COUNT(*) AS count
FROM pricing_templates
WHERE category_id IS NULL

UNION ALL

SELECT 
  'Inclusions without template' AS issue,
  COUNT(*) AS count
FROM package_inclusions
WHERE template_id IS NULL

UNION ALL

SELECT 
  'Templates without inclusions' AS issue,
  COUNT(*) AS count
FROM pricing_templates pt
LEFT JOIN package_inclusions pi ON pi.template_id = pt.id
WHERE pi.id IS NULL;
```

**Expected:** All counts should be 0

**Status:** [ ] Data Validation Passed

---

### **Phase 5: Functional Testing (5 minutes)**

#### **Step 5.1: Test Template Retrieval**
```sql
-- Get all templates for a category
SELECT 
  pt.name,
  pt.package_tier,
  pt.base_price,
  pt.description
FROM pricing_templates pt
JOIN service_categories sc ON sc.id = pt.category_id
WHERE sc.name = 'Photography'
AND pt.is_active = TRUE
ORDER BY pt.base_price;
```

**Expected:** All Photography templates in price order

#### **Step 5.2: Test Inclusion Details**
```sql
-- Get complete package breakdown
SELECT 
  pt.name AS package,
  pi.item_name,
  pi.quantity,
  pi.unit,
  pi.unit_price,
  (pi.quantity * pi.unit_price) AS line_total
FROM pricing_templates pt
JOIN package_inclusions pi ON pi.template_id = pt.id
WHERE pt.name = 'Essential Planning'
ORDER BY pi.display_order;
```

**Expected:** Itemized list with correct calculations

#### **Step 5.3: Test Customization Support**
```sql
-- Verify template can be customized
SELECT 
  pt.id,
  pt.name,
  pt.base_price,
  pt.allows_customization,
  COUNT(pi.id) AS total_items,
  COUNT(CASE WHEN pi.is_optional THEN 1 END) AS optional_items
FROM pricing_templates pt
LEFT JOIN package_inclusions pi ON pi.template_id = pt.id
GROUP BY pt.id, pt.name, pt.base_price, pt.allows_customization
LIMIT 5;
```

**Expected:** Customization flags working correctly

**Status:** [ ] Functional Testing Passed

---

## 🎯 Success Criteria

### **Migration is COMPLETE when:**
- ✅ All 4 database tables created successfully
- ✅ All 15 wedding service categories have pricing templates
- ✅ Minimum 45+ pricing templates created (3 per category)
- ✅ 350+ package inclusions populated with realistic data
- ✅ All prices are itemized with quantities and units
- ✅ Database views return formatted data correctly
- ✅ No data integrity issues (orphans, nulls, mismatches)
- ✅ Pricing calculations match expected totals (within tolerance)

---

## 📊 Final Statistics

### **Expected End State:**

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Categories with Pricing** | 15 | ___ | [ ] |
| **Total Templates** | 45+ | ___ | [ ] |
| **Total Inclusions** | 350+ | ___ | [ ] |
| **Basic Tier Templates** | 15 | ___ | [ ] |
| **Premium Tier Templates** | 15 | ___ | [ ] |
| **Luxury Tier Templates** | 15 | ___ | [ ] |
| **Price Range (Min)** | ₱12,000 | ___ | [ ] |
| **Price Range (Max)** | ₱300,000 | ___ | [ ] |

### **Query to Get Final Stats:**
```sql
-- Comprehensive statistics
SELECT 
  'Total Categories with Pricing' AS metric,
  COUNT(DISTINCT pt.category_id)::TEXT AS value
FROM pricing_templates pt

UNION ALL

SELECT 
  'Total Pricing Templates',
  COUNT(*)::TEXT
FROM pricing_templates

UNION ALL

SELECT 
  'Total Package Inclusions',
  COUNT(*)::TEXT
FROM package_inclusions

UNION ALL

SELECT 
  'Basic Tier Templates',
  COUNT(*)::TEXT
FROM pricing_templates
WHERE package_tier = 'basic'

UNION ALL

SELECT 
  'Premium Tier Templates',
  COUNT(*)::TEXT
FROM pricing_templates
WHERE package_tier = 'premium'

UNION ALL

SELECT 
  'Luxury Tier Templates',
  COUNT(*)::TEXT
FROM pricing_templates
WHERE package_tier = 'luxury'

UNION ALL

SELECT 
  'Lowest Package Price',
  TO_CHAR(MIN(base_price), 'FM₱999,999')
FROM pricing_templates

UNION ALL

SELECT 
  'Highest Package Price',
  TO_CHAR(MAX(base_price), 'FM₱999,999')
FROM pricing_templates;
```

---

## 🔄 Post-Migration Tasks

### **Immediate (Same Day):**
- [ ] Update `.github/copilot-instructions.md` to reflect new database schema
- [ ] Document API endpoints needed for pricing template retrieval
- [ ] Update frontend TypeScript interfaces to match new schema
- [ ] Create API specification document for backend developers

### **Week 1:**
- [ ] Build backend API endpoints for pricing templates
- [ ] Implement CRUD operations for admin panel
- [ ] Create service layer for frontend consumption
- [ ] Update vendor service creation flow to use database templates

### **Week 2:**
- [ ] Remove static `categoryPricingTemplates.ts` file
- [ ] Refactor frontend to fetch from API instead
- [ ] Build admin UI for template management
- [ ] Implement customization logic in booking flow

### **Week 3:**
- [ ] Add search/filter functionality for templates
- [ ] Implement template versioning system
- [ ] Add audit logging for template changes
- [ ] Performance testing and optimization

---

## 🚨 Troubleshooting

### **Issue: Category Not Found**
```bash
⚠ Category not found: [Category Name] - SKIPPING
```
**Solution:**
1. Check `service_categories` table for exact category name
2. Update `categoryMapping` in migration script
3. Re-run migration

### **Issue: Duplicate Template Name**
```bash
ERROR: duplicate key value violates unique constraint
```
**Solution:**
1. Check existing templates: `SELECT * FROM pricing_templates WHERE name = '[Name]'`
2. Delete duplicates or modify migration script names
3. Re-run migration

### **Issue: Price Calculation Mismatch**
```bash
Calculated total: ₱50,000
Base price: ₱48,000
```
**Solution:**
- This is normal for some packages (bundled discounts, service fees)
- Verify tolerance is within acceptable range (< 5%)
- Update base_price if needed

### **Issue: Migration Script Hangs**
```bash
[No output for > 2 minutes]
```
**Solution:**
1. Check database connection: `psql $DATABASE_URL`
2. Verify no locks: `SELECT * FROM pg_locks WHERE NOT granted;`
3. Restart migration with smaller batches

---

## 📞 Support Contacts

- **Database Issues**: Check Neon Console Logs
- **Migration Errors**: Review `backend-deploy/migrations/` logs
- **Schema Questions**: Refer to `create-pricing-templates-tables.sql`
- **Pricing Clarifications**: See `REALISTIC_WEDDING_PACKAGES_PRICING.md`

---

## ✅ Sign-Off

**Migration Completed By:** ____________________  
**Date:** ____________________  
**Time Taken:** ____________________  
**Issues Encountered:** ____________________  

**Final Verification:**
- [ ] All categories migrated successfully
- [ ] Database views working correctly
- [ ] No data integrity issues
- [ ] Rollback script saved and tested
- [ ] Documentation updated
- [ ] Team notified of completion

---

**Document Version**: 1.0  
**Last Updated**: November 7, 2025  
**Status**: Ready for Execution
