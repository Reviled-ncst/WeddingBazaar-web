# Dynamic Categories & Subcategories Implementation Guide

## 📚 Overview
This guide covers the complete implementation of database-driven categories and subcategories for the Wedding Bazaar platform. Categories, subcategories, and their dynamic fields are now managed via database tables instead of hardcoded constants.

## 🗄️ Database Structure

### Tables Created
1. **categories** - Main service categories (Photography, Catering, etc.)
2. **subcategories** - Category-specific subcategories  
3. **category_fields** - Dynamic fields per category
4. **category_field_options** - Options for multi-select fields

### Schema Features
- ✅ UUID primary keys for all tables
- ✅ Foreign key constraints with CASCADE delete
- ✅ Sort ordering for UI display
- ✅ Active/inactive flags
- ✅ Timestamps with auto-update triggers
- ✅ Indexes for performance

## 🚀 Quick Start

### Step 1: Run Database Migration

```powershell
# Make sure you have your DATABASE_URL configured in .env
node database/run-category-migration.mjs
```

**Expected Output:**
```
🚀 Starting Category and Subcategory Migration...
📊 Database: your-database-name
✅ Database connection successful

📄 Executing: 001_create_categories_tables.sql
✅ 001_create_categories_tables.sql executed successfully

📄 Executing: 002_seed_categories.sql
✅ 002_seed_categories.sql executed successfully

🎉 All migrations completed successfully!

📊 Verification Queries:
✅ Categories: 15
✅ Subcategories: 37
✅ Category Fields: 5
✅ Field Options: 58

📋 Sample Categories:
  📸 Photographer & Videographer (4 subcategories)
  📋 Wedding Planner (4 subcategories)
  🌸 Florist (4 subcategories)
  💄 Hair & Makeup Artists (5 subcategories)
  🍽️ Caterer (5 subcategories)
```

### Step 2: Integrate Backend API (Manual)

You need to manually add the categories routes to your main backend server file:

```javascript
// In your main server file (e.g., backend/server.js or similar)
import categoriesRouter from './routes/categories.js';

// Add this route
app.use('/api/categories', categoriesRouter);
```

### Step 3: Update Frontend Forms

The `AddServiceForm.tsx` component needs to be updated to fetch categories dynamically. See the next section for implementation details.

## 📡 API Endpoints

### GET /api/categories
Fetch all active categories with their subcategories.

**Response:**
```json
{
  "success": true,
  "count": 15,
  "categories": [
    {
      "id": "uuid",
      "name": "Photography",
      "display_name": "Photographer & Videographer",
      "description": "Professional photography and videography services",
      "icon": "📸",
      "sort_order": 1,
      "subcategories": [
        {
          "id": "uuid",
          "name": "photography_only",
          "display_name": "Photography Only",
          "sort_order": 1
        }
      ]
    }
  ]
}
```

### GET /api/categories/:categoryId/fields
Get dynamic fields for a specific category (by ID).

**Response:**
```json
{
  "success": true,
  "count": 3,
  "fields": [
    {
      "id": "uuid",
      "field_name": "cuisine_types",
      "field_label": "Cuisine Types",
      "field_type": "multi_select",
      "is_required": false,
      "help_text": "Select all cuisine types you offer",
      "sort_order": 1,
      "options": [
        {
          "value": "filipino",
          "label": "Filipino",
          "sort_order": 1
        }
      ]
    }
  ]
}
```

### GET /api/categories/by-name/:categoryName/fields
Get dynamic fields by category name (e.g., "Photography", "Catering").

**Example:**
```
GET /api/categories/by-name/Catering/fields
```

## 🎨 Frontend Integration

### Step 1: Create Category Service

```typescript
// src/services/categoryService.ts
import { apiService } from './apiService';

interface Category {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  sort_order: number;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  sort_order: number;
}

interface CategoryField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: 'multi_select' | 'text' | 'number' | 'range' | 'boolean';
  is_required: boolean;
  help_text?: string;
  sort_order: number;
  options: FieldOption[];
}

interface FieldOption {
  value: string;
  label: string;
  description?: string;
  sort_order: number;
}

export const categoryService = {
  // Fetch all categories with subcategories
  async getCategories(): Promise<Category[]> {
    const response = await apiService.get('/api/categories');
    return response.categories;
  },

  // Fetch dynamic fields for a category by ID
  async getCategoryFields(categoryId: string): Promise<CategoryField[]> {
    const response = await apiService.get(`/api/categories/${categoryId}/fields`);
    return response.fields;
  },

  // Fetch dynamic fields by category name
  async getCategoryFieldsByName(categoryName: string): Promise<CategoryField[]> {
    const response = await apiService.get(`/api/categories/by-name/${categoryName}/fields`);
    return response.fields;
  }
};
```

### Step 2: Update AddServiceForm Component

Replace the hardcoded `SERVICE_CATEGORIES` constant with dynamic fetching:

```typescript
// In AddServiceForm.tsx
import { categoryService } from '../../../../../services/categoryService';

export const AddServiceForm: React.FC<AddServiceFormProps> = ({...props}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFields, setCategoryFields] = useState<CategoryField[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Fetch category-specific fields when category changes
  useEffect(() => {
    const fetchCategoryFields = async () => {
      if (!formData.category) {
        setCategoryFields([]);
        return;
      }

      try {
        const fields = await categoryService.getCategoryFieldsByName(formData.category);
        setCategoryFields(fields);
      } catch (error) {
        console.error('Failed to fetch category fields:', error);
        setCategoryFields([]);
      }
    };

    fetchCategoryFields();
  }, [formData.category]);

  // Render categories dropdown
  return (
    <select value={formData.category} onChange={...}>
      <option value="">Select a category</option>
      {categories.map(category => (
        <option key={category.id} value={category.name}>
          {category.icon} {category.display_name}
        </option>
      ))}
    </select>
  );
};
```

## 🔧 Admin Panel Integration (Future)

### Creating Categories via Admin Panel

```typescript
// Admin component example
const handleCreateCategory = async () => {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'New_Category',
      display_name: 'New Category Display Name',
      description: 'Category description',
      icon: '🎨',
      sort_order: 16
    })
  });
  
  const data = await response.json();
  console.log('Created category:', data.category);
};
```

### Creating Subcategories

```typescript
const handleCreateSubcategory = async (categoryId: string) => {
  const response = await fetch(`/api/categories/${categoryId}/subcategories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'new_subcategory',
      display_name: 'New Subcategory',
      description: 'Optional description',
      sort_order: 10
    })
  });
  
  const data = await response.json();
  console.log('Created subcategory:', data.subcategory);
};
```

## 📊 Database Seeded Data

### Categories (15 total)
- Photography (4 subcategories)
- Planning (4 subcategories)
- Florist (4 subcategories)
- Beauty (5 subcategories)
- Catering (5 subcategories)
- Music (5 subcategories)
- Officiant
- Venue (7 subcategories)
- Rentals (6 subcategories)
- Cake
- Fashion
- Security
- AV_Equipment
- Stationery
- Transport

### Dynamic Fields by Category

**Catering:**
- cuisine_types (13 options)
- dietary_accommodations (9 options)
- service_style (7 options)

**Photography:**
- photography_style (11 options)

**Venue:**
- venue_capacity (range field)

**Music:**
- music_genres (14 options)

## 🎯 Benefits

### For Development
- ✅ No more hardcoded category arrays
- ✅ Add/edit categories without code changes
- ✅ Dynamic field rendering based on category
- ✅ Centralized category management

### For Business
- ✅ Admin can add new categories anytime
- ✅ Easy to expand service offerings
- ✅ Consistent data across platform
- ✅ Better search and filtering

### For Scaling
- ✅ Database-driven = API-ready
- ✅ Micro frontend compatible
- ✅ Multi-language support ready (add `display_name_es`, etc.)
- ✅ Regional customization possible

## 🧪 Testing

### Verify Migration Success

```powershell
# Test categories endpoint
curl http://localhost:3001/api/categories

# Test category fields
curl http://localhost:3001/api/categories/by-name/Catering/fields
```

### Database Verification Queries

```sql
-- Check all categories
SELECT * FROM categories ORDER BY sort_order;

-- Check categories with subcategory counts
SELECT 
  c.display_name, 
  c.icon,
  COUNT(s.id) as subcategory_count
FROM categories c
LEFT JOIN subcategories s ON c.id = s.category_id
GROUP BY c.id, c.display_name, c.icon
ORDER BY c.sort_order;

-- Check dynamic fields
SELECT 
  c.display_name as category,
  cf.field_label,
  cf.field_type,
  COUNT(cfo.id) as option_count
FROM categories c
JOIN category_fields cf ON c.id = cf.category_id
LEFT JOIN category_field_options cfo ON cf.id = cfo.field_id
GROUP BY c.display_name, cf.field_label, cf.field_type
ORDER BY c.display_name, cf.sort_order;
```

## 🚨 Troubleshooting

### Migration Fails

**Error: "Connection refused"**
- Check your `.env` file has correct `DATABASE_URL`
- Ensure database is running

**Error: "Table already exists"**
```sql
-- Drop tables and re-run migration
DROP TABLE IF EXISTS category_field_options CASCADE;
DROP TABLE IF EXISTS category_fields CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
```

### API Returns Empty

**Check backend route registration:**
```javascript
// Make sure this line exists in your server file
app.use('/api/categories', categoriesRouter);
```

**Check database has data:**
```sql
SELECT COUNT(*) FROM categories;  -- Should return 15
SELECT COUNT(*) FROM subcategories;  -- Should return 37
```

## 📝 Next Steps

1. ✅ Run migration script
2. ✅ Verify database tables and data
3. ⏳ Add categories route to backend server
4. ⏳ Create frontend categoryService
5. ⏳ Update AddServiceForm to use dynamic categories
6. ⏳ Add dynamic field rendering for Step 5
7. ⏳ Build Admin panel for category management
8. ⏳ Deploy to production

## 📞 Support

For issues or questions:
- Check migration logs in terminal
- Verify database connection
- Test API endpoints directly
- Review this guide's troubleshooting section

## 🎉 Success Criteria

When everything is working:
- ✅ Migration script completes without errors
- ✅ API endpoints return expected data
- ✅ Frontend dropdown shows 15 categories
- ✅ Subcategories appear when category selected
- ✅ Dynamic fields render based on category
- ✅ Admin can add new categories via API

---

**Last Updated:** October 19, 2025  
**Version:** 1.0.0  
**Status:** Ready for Implementation
