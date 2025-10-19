# 🚀 Quick Start Guide - Dynamic Categories

## What You Have Now

✅ **Complete backend infrastructure** for dynamic categories
✅ **Frontend service** ready to use (`categoryService.ts`)
✅ **Database seeded** with 15 categories, 40 subcategories, and dynamic fields
✅ **Integration guide** with step-by-step instructions
✅ **Test script** to verify everything works

## How to Get Started

### Step 1: Start the Backend (Required)

Open a terminal and run:
```bash
node local-backend.js
```

You should see:
```
✅ Database connected successfully
🎯 LOCAL Wedding Bazaar Backend running on port 3001
🌐 Local endpoints available at: http://localhost:3001
📋 Available endpoints:
   - GET  http://localhost:3001/api/categories
   - GET  http://localhost:3001/api/categories/:categoryId/fields
   - GET  http://localhost:3001/api/categories/by-name/:categoryName/fields
🚀 Your frontend should now work completely with dynamic categories!
```

### Step 2: Test the API (Optional but Recommended)

Open another terminal and run:
```bash
node test-dynamic-categories.mjs
```

This will verify that:
- Categories are loading correctly
- Subcategories are properly nested
- Dynamic fields are configured
- All API endpoints are working

### Step 3: Start the Frontend

```bash
npm run dev
```

### Step 4: Integrate into AddServiceForm

Follow the detailed guide: `DYNAMIC_CATEGORIES_FRONTEND_INTEGRATION_GUIDE.md`

**Quick Summary:**
1. Import the categoryService
2. Add state for categories and fields
3. Load categories on mount
4. Update category/subcategory dropdowns to use dynamic data
5. Add Step 5 for category-specific fields
6. Update form validation and submission

## Quick Test Commands

### Test Categories Endpoint
```bash
curl http://localhost:3001/api/categories
```

### Test Fields for Photography
```bash
curl http://localhost:3001/api/categories/by-name/photography/fields
```

### Test Fields for Catering
```bash
curl http://localhost:3001/api/categories/by-name/catering/fields
```

## Example Usage in AddServiceForm

### Import the Service
```typescript
import { categoryService, Category, CategoryField } from '@/services/api/categoryService';
```

### Load Categories
```typescript
const [categories, setCategories] = useState<Category[]>([]);

useEffect(() => {
  categoryService.fetchCategories()
    .then(cats => {
      setCategories(cats);
      console.log('✅ Loaded categories:', cats.length);
    })
    .catch(err => console.error('❌ Error loading categories:', err));
}, []);
```

### Use in Dropdown
```typescript
<select value={formData.category} onChange={...}>
  <option value="">Select a category</option>
  {categories.map(cat => (
    <option key={cat.id} value={cat.name}>
      {cat.display_name}
    </option>
  ))}
</select>
```

## What Each File Does

| File | Purpose |
|------|---------|
| `local-backend.js` | Backend server with categories API |
| `src/services/api/categoryService.ts` | Frontend service to fetch categories |
| `test-dynamic-categories.mjs` | Test script to verify API works |
| `DYNAMIC_CATEGORIES_FRONTEND_INTEGRATION_GUIDE.md` | Detailed integration instructions |
| `DYNAMIC_CATEGORIES_COMPLETE.md` | Complete overview of the system |

## Common Issues & Fixes

### "fetch failed" error
**Problem**: Backend is not running
**Solution**: Run `node local-backend.js` first

### "Database connection error"
**Problem**: Database credentials may be outdated
**Solution**: Check `local-backend.js` line 13 for DATABASE_URL

### Categories not loading in frontend
**Problem**: API URL may be wrong
**Solution**: Check `VITE_API_URL` in `.env` or `categoryService.ts`

### No subcategories showing
**Problem**: Category not selected or wrong category name
**Solution**: Make sure category.name (not display_name) is used as value

## Next Steps

1. ✅ **Start backend**: `node local-backend.js` 
2. ✅ **Test API**: `node test-dynamic-categories.mjs`
3. ✅ **Start frontend**: `npm run dev`
4. ⏳ **Integrate**: Follow `DYNAMIC_CATEGORIES_FRONTEND_INTEGRATION_GUIDE.md`
5. ⏳ **Test**: Add a service with each category type
6. ⏳ **Verify**: Check that category-specific fields appear correctly

## Need Help?

Refer to these documents:
- **For integration steps**: `DYNAMIC_CATEGORIES_FRONTEND_INTEGRATION_GUIDE.md`
- **For database details**: `DATABASE_DRIVEN_CATEGORIES_GUIDE.md`
- **For DSS context**: `DSS_DYNAMIC_CATEGORIES_IMPLEMENTATION.md`
- **For what was built**: `DYNAMIC_CATEGORIES_COMPLETE.md`

---

**Ready to integrate!** Start with `node local-backend.js` and follow the integration guide.
