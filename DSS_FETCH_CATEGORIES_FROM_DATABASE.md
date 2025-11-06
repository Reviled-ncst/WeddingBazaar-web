# 🔧 DSS Modal: Fetch Service Categories from Database

## 🎯 Issue Identified

The Intelligent Wedding Planner modal currently uses **hardcoded service categories** in Step 5 (Must-Have Services):

```typescript
const serviceCategories = [
  { value: 'photography', label: 'Photography', description: 'Professional photos' },
  { value: 'videography', label: 'Videography', description: 'Video coverage' },
  { value: 'catering', label: 'Catering', description: 'Food & beverages' },
  // ... 12 more hardcoded categories
];
```

**Problem**: These don't match what's actually in your database's `service_categories` and `service_subcategories` tables.

## ✅ Solution: Fetch from Database

### API Endpoint Available
- **Endpoint**: `GET /api/categories`
- **Returns**: All active service categories with subcategories
- **File**: `backend-deploy/routes/categories.cjs`

### Implementation Steps

1. **Add state for categories** (line ~23 in IntelligentWeddingPlanner_v2.tsx)
2. **Fetch categories on mount** using useEffect
3. **Update Step 5** to use fetched categories instead of hardcoded ones
4. **Map database categories** to DSS format

## 📝 Code Changes Needed

### 1. Add State Management

```typescript
export function IntelligentWeddingPlanner({
  services,
  isOpen,
  onClose,
  onBookService,
  onMessageVendor
}: IntelligentWeddingPlannerProps) {
  // Existing state...
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<PackageService | null>(null);
  
  // 🆕 ADD THIS: State for service categories from database
  const [serviceCategories, setServiceCategories] = useState<Array<{
    id: string;
    name: string;
    display_name: string;
    description: string;
    subcategories?: Array<{
      id: string;
      name: string;
      display_name: string;
      description: string;
    }>;
  }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Existing preferences state...
  const [preferences, setPreferences] = useState<WeddingPreferences>({...});
```

### 2. Fetch Categories on Mount

```typescript
// 🆕 ADD THIS: Fetch service categories from API
useEffect(() => {
  const fetchCategories = async () => {
    if (!isOpen) return; // Only fetch when modal is open
    
    try {
      console.log('[DSS] Fetching service categories from database...');
      setCategoriesLoading(true);
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const response = await fetch(`${API_URL}/api/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[DSS] Categories fetched:', data.length);
      
      setServiceCategories(data);
    } catch (error) {
      console.error('[DSS] Error fetching categories:', error);
      // Fall back to hardcoded categories if API fails
      setServiceCategories(FALLBACK_CATEGORIES);
    } finally {
      setCategoriesLoading(false);
    }
  };
  
  fetchCategories();
}, [isOpen]);
```

### 3. Update Step 5 Component

```typescript
// Step 5: Must-Have Services
const MustHaveServicesStep = () => {
  // 🆕 REMOVE HARDCODED CATEGORIES
  // const serviceCategories = [ ... ];
  
  // 🆕 USE CATEGORIES FROM STATE INSTEAD
  const mappedCategories = serviceCategories.map(cat => ({
    value: cat.name, // Use database 'name' field
    label: cat.display_name, // Use 'display_name' for UI
    description: cat.description || 'Select this service'
  }));
  
  const serviceTiers = ['basic', 'premium', 'luxury'];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Must-Have Services
        </h2>
        <p className="text-gray-600">
          Select the services essential for your wedding
        </p>
      </div>

      {/* Loading State */}
      {categoriesLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service categories...</p>
        </div>
      )}

      {/* Quick Select Button */}
      {!categoriesLoading && mappedCategories.length > 0 && (
        <>
          <div className="flex justify-center mb-6">
            <button
              onClick={() => {
                // Select first 5 categories as essentials
                const essentials = mappedCategories.slice(0, 5).map(c => c.value);
                updatePreferences({ mustHaveServices: essentials });
              }}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              ⚡ Select All Essentials
            </button>
          </div>

          {/* Service Selection Grid */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Select your must-have services
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mappedCategories.map((service) => {
                const isSelected = preferences.mustHaveServices.includes(service.value);
                const servicePref = preferences.servicePreferences[service.value] || '';
                
                return (
                  <div
                    key={service.value}
                    className={`
                      rounded-xl border-2 transition-all overflow-hidden min-h-[140px] flex flex-col
                      ${isSelected 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 bg-white hover:border-pink-300'
                      }
                    `}
                  >
                    {/* Rest of the card implementation... */}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!categoriesLoading && mappedCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No service categories available</p>
        </div>
      )}
    </div>
  );
};
```

### 4. Add Fallback Categories

```typescript
// 🆕 ADD THIS: Fallback categories if API fails
const FALLBACK_CATEGORIES = [
  { id: '1', name: 'photography', display_name: 'Photography', description: 'Professional photos', subcategories: [] },
  { id: '2', name: 'videography', display_name: 'Videography', description: 'Video coverage', subcategories: [] },
  { id: '3', name: 'catering', display_name: 'Catering', description: 'Food & beverages', subcategories: [] },
  { id: '4', name: 'venue', display_name: 'Venue', description: 'Ceremony & reception', subcategories: [] },
  { id: '5', name: 'music_dj', display_name: 'Music & DJ', description: 'Entertainment', subcategories: [] },
  { id: '6', name: 'flowers_decor', display_name: 'Flowers & Decor', description: 'Floral arrangements', subcategories: [] },
  { id: '7', name: 'wedding_planning', display_name: 'Wedding Planner', description: 'Coordination', subcategories: [] },
  { id: '8', name: 'makeup_hair', display_name: 'Makeup & Hair', description: 'Beauty services', subcategories: [] }
];
```

## 🎯 Benefits of This Change

1. **Dynamic Categories** - Categories automatically match what's in your database
2. **Easy Updates** - Add/remove categories via database, not code changes
3. **Consistent Data** - DSS uses same categories as rest of the application
4. **Better Matching** - Recommendations will match actual available services
5. **Scalability** - No hardcoded limits on number of categories

## 🧪 Testing Steps

1. **Check Database** - Verify categories exist:
   ```sql
   SELECT id, name, display_name, description FROM service_categories WHERE is_active = true;
   ```

2. **Test API** - Check endpoint works:
   ```bash
   curl https://weddingbazaar-web.onrender.com/api/categories
   ```

3. **Test Modal** - Open DSS modal and verify:
   - Categories load from API
   - Loading state shows briefly
   - Categories display correctly
   - Selection still works

4. **Test Fallback** - Simulate API failure:
   - Temporarily break API URL
   - Verify fallback categories load
   - Verify functionality still works

## 📊 Current Database Categories

Based on your system, you should have these categories:

| Category Name | Display Name | Description |
|--------------|--------------|-------------|
| `photography` | Photography | Professional wedding photography |
| `videography` | Videography | Wedding video coverage |
| `catering` | Catering | Food and beverage services |
| `venue` | Venue | Wedding venues and locations |
| `music_entertainment` | Music & Entertainment | DJs, bands, performers |
| `flowers_decor` | Flowers & Decor | Floral arrangements and decorations |
| `planning_coordination` | Planning & Coordination | Wedding planning services |
| `beauty_styling` | Beauty & Styling | Makeup, hair, beauty |
| `photo_booth` | Photo Booth | Interactive photo experiences |
| `transportation` | Transportation | Wedding transportation |
| `wedding_cake` | Wedding Cake | Custom wedding cakes |
| `invitations_stationery` | Invitations | Wedding invitations and stationery |

## 🚀 Implementation Priority

**Priority**: MEDIUM  
**Effort**: LOW (1-2 hours)  
**Impact**: HIGH (Better data consistency)

## 📝 Files to Modify

1. `src/pages/users/individual/services/dss/IntelligentWeddingPlanner_v2.tsx`
   - Add state management (~5 lines)
   - Add useEffect for fetching (~30 lines)
   - Update MustHaveServicesStep (~20 lines modified)
   - Add fallback constants (~15 lines)

**Total Changes**: ~70 lines (mostly additions)

## 🔄 Alternative Approach: Pass Categories as Props

Instead of fetching inside the modal, you could:

1. **Fetch in parent component** (Services page)
2. **Pass as props** to DSS modal
3. **Share categories** with main service listing

```typescript
// In Services.tsx parent component
const [categories, setCategories] = useState([]);

useEffect(() => {
  // Fetch categories once
  fetchCategories().then(setCategories);
}, []);

// Pass to DSS modal
<IntelligentWeddingPlanner
  services={services}
  categories={categories}  // 🆕 Pass categories
  isOpen={isDSSOpen}
  onClose={() => setIsDSSOpen(false)}
  onBookService={handleBookService}
  onMessageVendor={handleMessageVendor}
/>
```

This approach is **more efficient** because:
- Categories fetched once per page load
- Shared between DSS and main listings
- No duplicate API calls

---

**Status**: 🟡 IDENTIFIED - Ready for implementation  
**Next Step**: Choose approach (fetch in modal vs. pass as props) and implement  
**Est. Time**: 1-2 hours  
**Risk**: LOW (fallback available if API fails)
