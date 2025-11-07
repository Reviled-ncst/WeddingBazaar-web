# 🚀 Pricing Templates Database Migration Guide

**Date**: November 7, 2025  
**Status**: Ready for Execution  
**Estimated Time**: 10 minutes

---

## 📋 Overview

This migration moves pricing templates from the static `categoryPricingTemplates.ts` file to the PostgreSQL database, enabling dynamic management through admin panel.

### **What Gets Migrated:**
- ✅ Package tiers (Bronze, Silver, Gold, Platinum)  
- ✅ Itemized inclusions with quantities and units  
- ✅ Price points for all service categories  
- ✅ Package descriptions and metadata  

---

## 🗂️ New Database Tables

### 1. **`pricing_templates`**
Stores package tiers for each category.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `category_id` | UUID | References `categories(id)` |
| `tier_name` | VARCHAR(50) | 'bronze', 'silver', 'gold', 'platinum' |
| `tier_label` | VARCHAR(100) | 'Bronze Package', 'Silver Package', etc. |
| `base_price` | DECIMAL(12,2) | Package base price |
| `description` | TEXT | Package description |
| `sort_order` | INTEGER | Display order |
| `is_active` | BOOLEAN | Active status |

### 2. **`package_inclusions`**
Stores itemized inclusions for each package.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `template_id` | UUID | References `pricing_templates(id)` |
| `item_name` | VARCHAR(255) | Name of included item |
| `quantity` | INTEGER | How many |
| `unit` | VARCHAR(50) | 'hours', 'pax', 'pieces', 'sets', etc. |
| `description` | TEXT | Item description |
| `is_highlighted` | BOOLEAN | Featured item flag |
| `sort_order` | INTEGER | Display order |

### 3. **`category_pricing_metadata`**
Stores category-level pricing configurations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `category_id` | UUID | References `categories(id)` |
| `base_unit` | VARCHAR(50) | 'per hour', 'per pax', 'per event' |
| `min_price` | DECIMAL(12,2) | Minimum price |
| `max_price` | DECIMAL(12,2) | Maximum price |
| `typical_price_range` | VARCHAR(100) | Display range |
| `pricing_notes` | TEXT | Additional notes |

### 4. **`template_customizations`**
Stores add-ons and optional upgrades.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `template_id` | UUID | References `pricing_templates(id)` |
| `option_name` | VARCHAR(255) | Add-on name |
| `option_type` | VARCHAR(50) | 'addon', 'upgrade', 'substitution' |
| `additional_price` | DECIMAL(12,2) | Additional cost |
| `description` | TEXT | Option description |

---

## 🔧 Step-by-Step Migration

### **Step 1: Create Database Tables**

Run this in Neon SQL Console:

```bash
# Copy the SQL file content to Neon SQL Editor
cat backend-deploy/migrations/create-pricing-templates-tables.sql
```

Or execute via Node.js:

```bash
node backend-deploy/migrations/create-pricing-templates-tables.sql
```

**Verify:**
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%pricing%';

-- Should show:
-- pricing_templates
-- package_inclusions
-- category_pricing_metadata
-- template_customizations
```

---

### **Step 2: Run Initial Data Migration Script (Photography, Catering, Venue, Music)**

```bash
# Navigate to backend folder
cd backend-deploy/migrations

# Run migration script for first 4 categories
node migrate-pricing-templates.cjs
```

**Expected Output:**
```
🚀 Starting pricing templates migration...
📊 Target Database: Connected
✅ Database connection successful

🔄 Migrating Photography packages...
✅ Found category: Photographer & Videographer (uuid...)
  📦 Inserting Bronze Package...
    ✅ Inserted 5 inclusions
  📦 Inserting Silver Package...
    ✅ Inserted 7 inclusions
  ...
✅ Photography migration complete!

🔄 Migrating Catering packages...
...

🎉 Migration completed successfully!

📋 Summary:
┌───────────────────────────────┬────────────────┬───────────┬───────────┐
│ category                      │ template_count │ min_price │ max_price │
├───────────────────────────────┼────────────────┼───────────┼───────────┤
│ Photographer & Videographer   │ 4              │ 35000     │ 150000    │
│ Caterer                       │ 4              │ 550       │ 1800      │
│ Venue Coordinator             │ 4              │ 50000     │ 300000    │
│ DJ/Band                       │ 4              │ 15000     │ 80000     │
└───────────────────────────────┴────────────────┴───────────┴───────────┘

✅ All done!
```

---

### **Step 3: Run Remaining Categories Migration (All Other Services)**

```bash
# Still in backend-deploy/migrations folder
node migrate-remaining-categories.cjs
```

**Expected Output:**
```
🚀 Starting migration of remaining wedding service categories...

📋 Step 1: Fetching category IDs from database...
   ✓ Found Planning: uuid-1234...
   ✓ Found Florist: uuid-5678...
   ✓ Found Beauty: uuid-9012...
   ✓ Found Officiant: uuid-3456...
   ✓ Found Rentals: uuid-7890...
   ✓ Found Cake: uuid-1357...
   ✓ Found Fashion: uuid-2468...
   ✓ Found Security: uuid-3579...
   ✓ Found AV Equipment: uuid-4680...
   ✓ Found Stationery: uuid-5791...
   ✓ Found Transportation: uuid-6802...

📦 Processing Planning...
   ✓ Category metadata created/updated
   ✓ Template: Essential Planning (basic)
      → 8 inclusions added
   ✓ Template: Premium Planning (premium)
      → 8 inclusions added
   ✓ Template: Luxury Full-Service Planning (luxury)
      → 8 inclusions added

📦 Processing Florist...
   ✓ Category metadata created/updated
   ✓ Template: Garden Romance Package (basic)
      → 6 inclusions added
   ...

✅ Migration completed successfully!

📊 Summary:
   • Categories processed: 11
   • Pricing templates created: 33
   • Package inclusions added: 264

🔍 Verification:

   Category-wise breakdown:
   • AV Equipment: 3 templates, 24 inclusions
   • Beauty: 3 templates, 18 inclusions
   • Cake: 3 templates, 9 inclusions
   • Fashion: 3 templates, 9 inclusions
   • Florist: 3 templates, 18 inclusions
   • Officiant: 3 templates, 12 inclusions
   • Planning: 3 templates, 24 inclusions
   • Rentals: 3 templates, 15 inclusions
   • Security: 3 templates, 9 inclusions
   • Stationery: 3 templates, 12 inclusions
   • Transportation: 3 templates, 12 inclusions

✨ All remaining categories migrated successfully!
```

---

### **Step 4: Verify Migration**

```sql
-- Check pricing templates
SELECT 
  pt.tier_label,
  c.display_name as category,
  pt.base_price,
  COUNT(pi.id) as inclusion_count
FROM pricing_templates pt
LEFT JOIN categories c ON pt.category_id = c.id
LEFT JOIN package_inclusions pi ON pt.id = pi.template_id
GROUP BY pt.id, pt.tier_label, c.display_name, pt.base_price
ORDER BY c.display_name, pt.base_price;

-- Check package inclusions
SELECT 
  pt.tier_label,
  pi.item_name,
  pi.quantity,
  pi.unit,
  pi.description
FROM package_inclusions pi
JOIN pricing_templates pt ON pi.template_id = pt.id
WHERE pt.tier_name = 'bronze'
ORDER BY pt.id, pi.sort_order
LIMIT 10;

-- Use the view for complete data
SELECT * FROM vw_complete_pricing_templates
WHERE category_name = 'Photography'
LIMIT 1;
```

---

## 📊 Sample Data Structure

### **Photography Bronze Package**

**Template:**
```json
{
  "tier_name": "bronze",
  "tier_label": "Bronze Package",
  "base_price": 35000,
  "description": "Essential photography coverage for intimate weddings"
}
```

**Inclusions:**
```json
[
  {
    "item_name": "Full-day coverage",
    "quantity": 8,
    "unit": "hours",
    "description": "Wedding day photography from preps to send-off"
  },
  {
    "item_name": "Professional photographer",
    "quantity": 1,
    "unit": "photographer",
    "description": "Lead photographer with 3+ years experience"
  },
  {
    "item_name": "Edited digital photos",
    "quantity": 300,
    "unit": "photos",
    "description": "High-resolution edited images"
  }
]
```

---

## 🔄 Rollback Plan

If something goes wrong:

```sql
-- Drop all pricing-related tables
DROP TABLE IF EXISTS template_customizations CASCADE;
DROP TABLE IF EXISTS package_inclusions CASCADE;
DROP TABLE IF EXISTS category_pricing_metadata CASCADE;
DROP TABLE IF EXISTS pricing_templates CASCADE;

-- Drop views
DROP VIEW IF EXISTS vw_complete_pricing_templates;
DROP VIEW IF EXISTS vw_category_pricing_summary;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

Then re-run Step 1 and Step 2.

---

## 🎯 Next Steps After Migration

### **1. Create Backend API Endpoints**

```javascript
// GET /api/pricing/templates/:categoryId
// GET /api/pricing/templates/:categoryId/:tier
// POST /api/pricing/templates (admin only)
// PUT /api/pricing/templates/:id (admin only)
// DELETE /api/pricing/templates/:id (admin only)
```

### **2. Update Frontend Service**

Replace static imports with API calls:

```typescript
// OLD (remove this)
import { CATEGORY_PRICING_TEMPLATES } from './categoryPricingTemplates';

// NEW (use this)
const templates = await fetch(`/api/pricing/templates/${categoryId}`);
```

### **3. Build Admin Panel**

Create admin interface to:
- ✅ View all pricing templates
- ✅ Add/edit/delete packages
- ✅ Manage inclusions
- ✅ Set active/inactive status
- ✅ Reorder display order

---

## 📈 Current Coverage

**Migrated Categories** (4/15):
- ✅ Photography (4 tiers)
- ✅ Catering (4 tiers)
- ✅ Venue (4 tiers)
- ✅ Music (4 tiers)

**Pending Categories** (11/15):
- ⏳ Planning
- ⏳ Florist
- ⏳ Beauty
- ⏳ Officiant
- ⏳ Rentals
- ⏳ Cake
- ⏳ Fashion
- ⏳ Security
- ⏳ AV Equipment
- ⏳ Stationery
- ⏳ Transport

**To add more categories**, update `migrate-pricing-templates.cjs` with more package data, then re-run Step 2.

---

## ✅ Success Criteria

- [ ] All 4 tables created in database
- [ ] Views working (`vw_complete_pricing_templates`, `vw_category_pricing_summary`)
- [ ] Triggers active (`update_updated_at_column`)
- [ ] Migration script runs without errors
- [ ] Sample query returns expected data
- [ ] Frontend can fetch templates via API

---

## 🚨 Troubleshooting

### **Error: "relation does not exist"**
- **Solution**: Run Step 1 first to create tables

### **Error: "duplicate key value violates unique constraint"**
- **Solution**: Migration script has UPSERT logic, safe to re-run

### **Error: "DATABASE_URL not found"**
- **Solution**: Set `DATABASE_URL` in `.env` file

### **No data returned from views**
- **Solution**: Run Step 2 to populate data

---

## 📞 Support

**Files Created:**
1. `backend-deploy/migrations/create-pricing-templates-tables.sql` - Database schema
2. `backend-deploy/migrations/migrate-pricing-templates.cjs` - Data migration script
3. `PRICING_TEMPLATES_MIGRATION_GUIDE.md` - This guide

**Ready to execute?** Run Step 1 and Step 2 above! 🚀
