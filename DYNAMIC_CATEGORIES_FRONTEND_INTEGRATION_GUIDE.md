# 🎯 Dynamic Categories Integration Guide

## Overview
This guide provides step-by-step instructions for integrating the dynamic categories system into the AddServiceForm component.

## ✅ What's Already Done

### Backend
- ✅ Database migration created with 4 tables: `categories`, `subcategories`, `category_fields`, `category_field_options`
- ✅ 15 categories seeded (photography, catering, venues, etc.)
- ✅ 40 subcategories seeded with proper relationships
- ✅ 6 dynamic field types with 54 options configured
- ✅ API routes integrated into `local-backend.js`:
  - `GET /api/categories` - Get all categories with subcategories
  - `GET /api/categories/:categoryId/fields` - Get fields by category ID
  - `GET /api/categories/by-name/:categoryName/fields` - Get fields by category name

### Frontend Service
- ✅ `categoryService.ts` created in `src/services/api/`
- ✅ TypeScript interfaces defined for all data types
- ✅ Helper functions for category/subcategory lookups
- ✅ Formatting and conversion utilities

## 🚀 Next Steps: Frontend Integration

### Step 1: Update AddServiceForm State

Open `src/pages/users/vendor/services/components/AddServiceForm.tsx` and add dynamic state:

```typescript
import { categoryService, Category, CategoryField } from '@/services/api/categoryService';

// Inside the component, add new state
const [categories, setCategories] = useState<Category[]>([]);
const [categoryFields, setCategoryFields] = useState<CategoryField[]>([]);
const [loadingCategories, setLoadingCategories] = useState(false);
const [loadingFields, setLoadingFields] = useState(false);
```

### Step 2: Load Categories on Mount

Add this useEffect to fetch categories when the component mounts:

```typescript
// Load categories on component mount
useEffect(() => {
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const fetchedCategories = await categoryService.fetchCategories();
      setCategories(fetchedCategories);
      console.log('✅ Categories loaded:', fetchedCategories.length);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      // Fallback to hardcoded categories if API fails
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  loadCategories();
}, []);
```

### Step 3: Load Fields When Category Changes

Add this useEffect to fetch category-specific fields:

```typescript
// Load category-specific fields when category changes
useEffect(() => {
  const loadCategoryFields = async () => {
    if (!formData.category) {
      setCategoryFields([]);
      return;
    }

    setLoadingFields(true);
    try {
      const fields = await categoryService.fetchCategoryFieldsByName(formData.category);
      setCategoryFields(fields);
      console.log('✅ Category fields loaded:', fields.length);
    } catch (error) {
      console.error('❌ Error loading category fields:', error);
      setCategoryFields([]);
    } finally {
      setLoadingFields(false);
    }
  };

  loadCategoryFields();
}, [formData.category]);
```

### Step 4: Update Category Dropdown (Step 1)

Replace the hardcoded category array with dynamic data:

```typescript
// BEFORE (Hardcoded):
const categories = ['photography', 'videography', 'catering', ...];

// AFTER (Dynamic):
<select
  value={formData.category}
  onChange={(e) => {
    setFormData(prev => ({
      ...prev,
      category: e.target.value,
      subcategory: '', // Reset subcategory when category changes
      categorySpecificFields: {} // Reset category-specific fields
    }));
  }}
  className="..."
  disabled={loadingCategories}
>
  <option value="">
    {loadingCategories ? 'Loading categories...' : 'Select a category'}
  </option>
  {categories.map(cat => (
    <option key={cat.id} value={cat.name}>
      {cat.display_name}
    </option>
  ))}
</select>
```

### Step 5: Update Subcategory Dropdown (Step 1)

Replace hardcoded subcategories with dynamic data:

```typescript
{/* Subcategory Field - Dynamic based on selected category */}
{formData.category && (
  <div>
    <label className="...">Subcategory</label>
    <select
      value={formData.subcategory}
      onChange={(e) => setFormData(prev => ({
        ...prev,
        subcategory: e.target.value
      }))}
      className="..."
    >
      <option value="">Select a subcategory</option>
      {categoryService.getSubcategoryOptions(categories, formData.category).map(sub => (
        <option key={sub.value} value={sub.value}>
          {sub.label}
        </option>
      ))}
    </select>
  </div>
)}
```

### Step 6: Add Dynamic Category-Specific Fields (New Step 5)

Add this section AFTER Step 4 (DSS Fields) in the form:

```typescript
{/* ============ STEP 5: CATEGORY-SPECIFIC FIELDS ============ */}
{currentStep === 5 && (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Category-Specific Information</h2>
      <p className="text-gray-600">
        Provide additional details specific to {formData.category}
      </p>
    </div>

    {loadingFields ? (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading category fields...</p>
      </div>
    ) : categoryFields.length === 0 ? (
      <div className="text-center py-8">
        <p className="text-gray-600">No additional fields required for this category</p>
        <button
          onClick={() => setCurrentStep(6)}
          className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-lg"
        >
          Continue to Review
        </button>
      </div>
    ) : (
      <div className="space-y-4">
        {categoryFields.map(field => (
          <DynamicField
            key={field.id}
            field={field}
            value={formData.categorySpecificFields?.[field.field_name] || ''}
            onChange={(value) => {
              setFormData(prev => ({
                ...prev,
                categorySpecificFields: {
                  ...prev.categorySpecificFields,
                  [field.field_name]: value
                }
              }));
            }}
          />
        ))}
      </div>
    )}
  </div>
)}
```

### Step 7: Create Dynamic Field Component

Add this helper component inside AddServiceForm:

```typescript
/**
 * DynamicField Component
 * Renders a field based on its type
 */
interface DynamicFieldProps {
  field: CategoryField;
  value: any;
  onChange: (value: any) => void;
}

const DynamicField: React.FC<DynamicFieldProps> = ({ field, value, onChange }) => {
  const baseInputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent";
  
  const renderField = () => {
    switch (field.field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
            required={field.is_required}
            placeholder={field.help_text || `Enter ${field.field_label.toLowerCase()}`}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
            rows={4}
            required={field.is_required}
            placeholder={field.help_text || `Enter ${field.field_label.toLowerCase()}`}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
            required={field.is_required}
            placeholder={field.help_text || `Enter ${field.field_label.toLowerCase()}`}
          />
        );
      
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
            required={field.is_required}
          >
            <option value="">Select an option</option>
            {field.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      
      case 'multiselect':
        return (
          <select
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value);
              onChange(selected);
            }}
            className={baseInputClasses}
            required={field.is_required}
            size={Math.min(field.options.length, 5)}
          >
            {field.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options.map(opt => (
              <label key={opt.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(opt.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValues, opt.value]);
                    } else {
                      onChange(currentValues.filter(v => v !== opt.value));
                    }
                  }}
                  className="rounded text-pink-500 focus:ring-pink-500"
                />
                <span className="text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.field_label}
        {field.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {field.help_text && (
        <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
      )}
    </div>
  );
};
```

### Step 8: Update Step Navigation

Update the step counter to include the new Step 5:

```typescript
// Update total steps from 5 to 6
const totalSteps = 6; // Was 5, now 6 with category-specific fields

// Update step titles
const stepTitles = [
  'Basic Information',
  'Pricing',
  'Media',
  'DSS Information',
  'Category-Specific',  // NEW STEP
  'Review & Submit'
];
```

### Step 9: Update Form Validation

Add validation for category-specific fields:

```typescript
const validateStep = (step: number): boolean => {
  switch (step) {
    // ... existing validations ...
    
    case 5: // Category-specific fields
      if (categoryFields.length === 0) return true; // No fields = skip
      
      const requiredFields = categoryFields.filter(f => f.is_required);
      const allRequiredFilled = requiredFields.every(field => {
        const value = formData.categorySpecificFields?.[field.field_name];
        if (field.field_type === 'multiselect' || field.field_type === 'checkbox') {
          return Array.isArray(value) && value.length > 0;
        }
        return value && value.toString().trim() !== '';
      });
      
      if (!allRequiredFilled) {
        alert('Please fill in all required category-specific fields');
        return false;
      }
      return true;
    
    default:
      return true;
  }
};
```

### Step 10: Update Form Submission

Include category-specific fields in the submission:

```typescript
const handleSubmit = async () => {
  try {
    const serviceData = {
      ...formData,
      // Include all DSS fields
      dssServiceName: formData.dssServiceName,
      dssServiceDescription: formData.dssServiceDescription,
      // ... other DSS fields ...
      
      // Include category-specific fields
      categorySpecificFields: formData.categorySpecificFields || {},
    };

    console.log('📤 Submitting service:', serviceData);
    
    // Send to backend
    const response = await fetch(`${API_URL}/api/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(serviceData)
    });

    if (!response.ok) {
      throw new Error('Failed to create service');
    }

    const result = await response.json();
    console.log('✅ Service created:', result);
    
    // Success handling...
  } catch (error) {
    console.error('❌ Error creating service:', error);
    alert('Failed to create service. Please try again.');
  }
};
```

## 🧪 Testing Checklist

### Local Development Testing
1. ✅ Start backend: `node local-backend.js`
2. ✅ Start frontend: `npm run dev`
3. ✅ Test category loading:
   - Categories dropdown should populate
   - Console should show "✅ Categories loaded: 15"
4. ✅ Test subcategory loading:
   - Select "Photography" → should show "Wedding Photography", "Event Photography", etc.
   - Select "Catering" → should show "Buffet Service", "Plated Dinner", etc.
5. ✅ Test dynamic fields:
   - Select "Photography" → Step 5 should show photography-specific fields
   - Select "Venues" → Step 5 should show venue-specific fields
   - Check that required fields are marked with *
6. ✅ Test validation:
   - Try to proceed without filling required fields
   - Should show validation error
7. ✅ Test form submission:
   - Complete all steps including category-specific fields
   - Check network tab for POST request
   - Verify categorySpecificFields are included in payload

### API Testing
```bash
# Test categories endpoint
curl http://localhost:3001/api/categories

# Test fields by category ID
curl http://localhost:3001/api/categories/1/fields

# Test fields by category name
curl http://localhost:3001/api/categories/by-name/photography/fields
```

## 📊 Database Schema Reference

### Categories Table
- `id` (UUID)
- `name` (string) - Snake_case internal name
- `display_name` (string) - User-friendly name
- `description` (text)
- `icon` (string)
- `sort_order` (integer)
- `is_active` (boolean)

### Subcategories Table
- `id` (UUID)
- `category_id` (UUID FK)
- `name` (string)
- `display_name` (string)
- `description` (text)
- `sort_order` (integer)
- `is_active` (boolean)

### Category Fields Table
- `id` (UUID)
- `category_id` (UUID FK)
- `field_name` (string)
- `field_label` (string)
- `field_type` (enum: text, textarea, select, multiselect, number, checkbox)
- `is_required` (boolean)
- `help_text` (text)
- `sort_order` (integer)

### Category Field Options Table
- `id` (UUID)
- `field_id` (UUID FK)
- `option_value` (string)
- `option_label` (string)
- `description` (text)
- `sort_order` (integer)
- `is_active` (boolean)

## 🎯 Current Seeded Data

### Categories (15 total)
- Photography
- Videography
- Catering
- Venues
- Music & Entertainment
- Florals & Decor
- Wedding Planning
- Beauty & Styling
- Transportation
- Invitations & Stationery
- Wedding Cake
- Photography Booth
- Wedding Favors
- Lighting & Sound
- Officiants & Ceremony

### Example Fields
- **Photography**: Style, Equipment, Post-Processing
- **Venues**: Capacity, Indoor/Outdoor, Parking Available
- **Catering**: Cuisine Types, Dietary Options, Service Style
- **Music**: Performance Type, Equipment, Genres

## 🔧 Troubleshooting

### Categories not loading
- Check backend is running: `node local-backend.js`
- Check database connection in console
- Verify migration ran successfully
- Check browser console for errors

### Fields not loading
- Verify category is selected
- Check network tab for API call
- Verify categoryId or categoryName matches database

### Validation errors
- Check field.is_required flag
- Verify value format matches field_type
- Check for empty strings vs undefined

### Submission fails
- Verify all required fields are filled
- Check categorySpecificFields object structure
- Verify backend endpoint exists

## 📚 Additional Resources

- **Migration Guide**: `DATABASE_DRIVEN_CATEGORIES_GUIDE.md`
- **DSS Implementation**: `DSS_DYNAMIC_CATEGORIES_IMPLEMENTATION.md`
- **Migration Success Report**: `CATEGORIES_MIGRATION_SUCCESS.md`
- **Backend API**: `backend/routes/categories.js`
- **Frontend Service**: `src/services/api/categoryService.ts`

## 🚀 Next Steps After Integration

1. **Test thoroughly** with all 15 categories
2. **Handle edge cases** (no fields, all optional fields, etc.)
3. **Add loading states** and error handling
4. **Implement admin panel** for category management
5. **Add field validation** rules (min/max values, regex patterns)
6. **Test DSS recommendations** with new category-specific data
7. **Deploy to production** after local testing

## ✅ Success Criteria

- [ ] Categories load dynamically from database
- [ ] Subcategories update based on selected category
- [ ] Category-specific fields appear in Step 5
- [ ] Required field validation works
- [ ] Form submission includes categorySpecificFields
- [ ] No hardcoded category/subcategory arrays remain
- [ ] DSS system can access category-specific data
- [ ] All 15 categories tested and working

---

**Status**: Ready for Frontend Integration
**Last Updated**: $(date)
**Migration Status**: ✅ Complete
**Backend API**: ✅ Integrated
**Frontend Service**: ✅ Created
**Next**: Frontend Form Integration
