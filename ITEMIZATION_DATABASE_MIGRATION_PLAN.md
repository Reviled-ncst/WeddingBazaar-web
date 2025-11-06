# 🗄️ Itemization Database Migration Plan

**Goal**: Move itemized pricing from JSONB to relational tables  
**Status**: Ready to implement  
**Time**: 1-2 hours for implementation, 30 minutes for migration

---

## 🎯 WHAT WE'RE MIGRATING

### FROM: JSONB Column (Current Quick Solution)
```json
{
  "pricing_mode": "itemized",
  "packages": [...],
  "addons": [...],
  "pricing_rules": {...}
}
```

### TO: Relational Tables (Proper Database Schema)
```
service_packages table
package_items table (personnel, equipment, deliverables)
service_addons table
service_pricing_rules table
```

---

## 📋 NEW DATABASE TABLES

### 1. **service_packages** (Package Templates)
```sql
CREATE TABLE service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id VARCHAR NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  package_name VARCHAR(255) NOT NULL,
  package_description TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_service_package UNIQUE (service_id, package_name)
);

CREATE INDEX idx_service_packages_service ON service_packages(service_id);
CREATE INDEX idx_service_packages_active ON service_packages(is_active);

COMMENT ON TABLE service_packages IS 
'Package tier templates per service (Basic, Standard, Premium)';
```

**Example Data**:
```
id: pkg-001
service_id: SRV-PHO-123
package_name: "Basic Package"
base_price: 60000.00
is_default: true
```

---

### 2. **package_items** (Package Contents)
```sql
CREATE TABLE package_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES service_packages(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'personnel', 'equipment', 'deliverable'
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT,
  quantity INTEGER DEFAULT 1,
  unit_type VARCHAR(50), -- 'hours', 'pieces', 'sets', 'items'
  unit_value NUMERIC(10,2), -- e.g., 8 hours, 2 pieces
  unit_price NUMERIC(10,2), -- Price per unit (optional)
  is_optional BOOLEAN DEFAULT FALSE,
  item_notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_item_type CHECK (
    item_type IN ('personnel', 'equipment', 'deliverable', 'other')
  )
);

CREATE INDEX idx_package_items_package ON package_items(package_id);
CREATE INDEX idx_package_items_type ON package_items(item_type);

COMMENT ON TABLE package_items IS 
'Individual items within a package (staff, equipment, deliverables)';
```

**Example Data**:
```
Personnel:
  - id: item-001, package_id: pkg-001, item_type: 'personnel'
    item_name: 'Lead Photographer', quantity: 1, unit_type: 'hours', unit_value: 8

Equipment:
  - id: item-002, package_id: pkg-001, item_type: 'equipment'
    item_name: 'DSLR Camera', quantity: 2, unit_type: 'pieces'

Deliverables:
  - id: item-003, package_id: pkg-001, item_type: 'deliverable'
    item_name: 'Edited Photos', quantity: 700, unit_type: 'items'
```

---

### 3. **service_addons** (Optional Add-Ons)
```sql
CREATE TABLE service_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id VARCHAR NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  addon_name VARCHAR(255) NOT NULL,
  addon_description TEXT,
  addon_price NUMERIC(10,2) NOT NULL,
  addon_type VARCHAR(50), -- 'time_extension', 'equipment', 'deliverable', 'service'
  is_available BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_service_addon UNIQUE (service_id, addon_name)
);

CREATE INDEX idx_service_addons_service ON service_addons(service_id);
CREATE INDEX idx_service_addons_available ON service_addons(is_available);

COMMENT ON TABLE service_addons IS 
'Optional add-ons per service (extra hours, equipment upgrades, etc.)';
```

**Example Data**:
```
id: addon-001
service_id: SRV-PHO-123
addon_name: "Extra Hour"
addon_price: 5000.00
addon_type: "time_extension"
```

---

### 4. **service_pricing_rules** (Dynamic Pricing)
```sql
CREATE TABLE service_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id VARCHAR NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  rule_type VARCHAR(50) NOT NULL, -- 'per_pax', 'hourly', 'daily', 'tiered', 'bulk_discount'
  rule_name VARCHAR(255),
  base_unit INTEGER, -- e.g., 100 pax, 8 hours
  base_price NUMERIC(10,2),
  additional_unit_price NUMERIC(10,2), -- Price per extra unit
  minimum_units INTEGER,
  maximum_units INTEGER,
  rule_config JSONB, -- Additional configuration
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_rule_type CHECK (
    rule_type IN ('per_pax', 'hourly', 'daily', 'tiered', 'bulk_discount', 'seasonal')
  )
);

CREATE INDEX idx_pricing_rules_service ON service_pricing_rules(service_id);
CREATE INDEX idx_pricing_rules_type ON service_pricing_rules(rule_type);

COMMENT ON TABLE service_pricing_rules IS 
'Dynamic pricing rules (per-pax, hourly, bulk discounts, etc.)';
```

**Example Data**:
```
Per-Pax Catering:
  rule_type: 'per_pax'
  base_unit: 100
  base_price: 80000.00
  additional_unit_price: 800.00
  minimum_units: 50
  maximum_units: 500

Hourly Photography:
  rule_type: 'hourly'
  base_unit: 8
  base_price: 50000.00
  additional_unit_price: 5000.00
  minimum_units: 4
  maximum_units: 16
```

---

## 🔄 MIGRATION STRATEGY

### Phase 1: Create Tables (10 minutes)
```bash
node create-itemization-tables.cjs
```

### Phase 2: Migrate Existing Data (10 minutes)
If you already have JSONB data:
```bash
node migrate-jsonb-to-relational.cjs
```

### Phase 3: Update Backend API (30 minutes)
Update routes to use relational queries instead of JSONB

### Phase 4: Update Frontend (30 minutes)
Update forms to POST to new table structure

### Phase 5: Deploy (10 minutes)
Deploy backend + frontend changes

---

## 📝 COMPLETE MIGRATION SCRIPT

I'll create the full implementation now...
