# 🎯 Itemized Pricing System Enhancement Guide

**Date**: November 6, 2025  
**Feature**: Advanced price breakdown with per-pax, packages, and add-ons

---

## 🎨 Feature Overview

Transform the basic pricing system into a comprehensive itemized breakdown with:

1. **Package Tiers** (Basic, Standard, Premium, Luxury)
2. **Per-Pax Pricing** (Price per person/guest)
3. **Add-ons** (Optional extras with individual pricing)
4. **Price Calculator** (Real-time total calculation)
5. **Breakdown Display** (Detailed cost itemization)

---

## 📊 Pricing Structure Examples

### Example 1: Catering Service
```
Package: Premium Buffet
Base Price: ₱15,000 (setup fee)
Per Pax: ₱850/person
Minimum Guests: 50
Maximum Guests: 200

Add-ons:
- Dessert Station: ₱5,000
- Premium Drinks Package: ₱300/pax
- Waiter Service (extra): ₱2,000/waiter
- Custom Table Setup: ₱3,500

Total for 100 guests:
- Base: ₱15,000
- Per Pax (100 × ₱850): ₱85,000
- Dessert Station: ₱5,000
- Premium Drinks (100 × ₱300): ₱30,000
TOTAL: ₱135,000
```

### Example 2: Photography Service
```
Package: Full Day Coverage
Base Price: ₱25,000
Duration: 8 hours
Per Hour Extension: ₱3,000/hour

Add-ons:
- Second Photographer: ₱12,000
- Same-day Edit Video: ₱8,000
- Premium Photo Album: ₱6,500
- Engagement Shoot: ₱15,000

Total with 2 hours extension + album:
- Base: ₱25,000
- Extension (2 × ₱3,000): ₱6,000
- Premium Album: ₱6,500
TOTAL: ₱37,500
```

### Example 3: Venue Rental
```
Package: Garden Wedding Package
Base Price: ₱50,000 (venue + basic setup)
Per Guest: ₱500/person (tables, chairs, linens)
Capacity: 50-300 guests

Add-ons:
- Premium Sound System: ₱8,000
- LED Wall Backdrop: ₱12,000
- Extended Hours (per hour): ₱5,000
- Bridal Suite Access: ₱3,000

Total for 150 guests with sound system:
- Base: ₱50,000
- Per Guest (150 × ₱500): ₱75,000
- Sound System: ₱8,000
TOTAL: ₱133,000
```

---

## 🛠️ Implementation Plan

### Phase 1: Database Schema (Add to services table)
```sql
-- Add these columns to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS pricing_model VARCHAR(50) DEFAULT 'fixed';
-- Options: 'fixed', 'per_pax', 'hourly', 'package', 'custom'

ALTER TABLE services ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);
-- Fixed starting price

ALTER TABLE services ADD COLUMN IF NOT EXISTS per_pax_price DECIMAL(10,2);
-- Price per person/guest

ALTER TABLE services ADD COLUMN IF NOT EXISTS min_pax INTEGER;
-- Minimum number of guests

ALTER TABLE services ADD COLUMN IF NOT EXISTS max_pax INTEGER;
-- Maximum number of guests

ALTER TABLE services ADD COLUMN IF NOT EXISTS pricing_tiers JSONB;
-- Package tiers: [{ name: 'Basic', price: 10000, features: [] }]

ALTER TABLE services ADD COLUMN IF NOT EXISTS addons JSONB;
-- Add-ons: [{ name: 'Extra Hour', price: 3000, type: 'fixed' }]

ALTER TABLE services ADD COLUMN IF NOT EXISTS price_breakdown JSONB;
-- Detailed breakdown structure
```

### Phase 2: TypeScript Interfaces
```typescript
// Add to AddServiceForm.tsx

interface PricingTier {
  id: string;
  name: string; // 'Basic', 'Standard', 'Premium', 'Luxury'
  price: number;
  description: string;
  features: string[];
  perPaxPrice?: number; // Optional per-pax pricing
  minPax?: number;
  maxPax?: number;
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'fixed' | 'per_pax' | 'per_hour'; // Pricing type
  category?: string; // 'food', 'equipment', 'service', 'venue'
  isRequired?: boolean;
}

interface PriceBreakdown {
  basePrice: number;
  perPaxPrice?: number;
  guestCount?: number;
  perPaxTotal?: number;
  addOnsTotal: number;
  subtotal: number;
  tax?: number;
  total: number;
  items: {
    name: string;
    quantity?: number;
    unitPrice: number;
    total: number;
  }[];
}

interface PricingFormData {
  pricingModel: 'fixed' | 'per_pax' | 'package' | 'hourly' | 'custom';
  basePrice: string;
  perPaxPrice: string;
  minPax: string;
  maxPax: string;
  tiers: PricingTier[];
  addons: AddOn[];
}
```

### Phase 3: UI Components

#### Component 1: Pricing Model Selector
```tsx
const PricingModelSelector = () => {
  const [model, setModel] = useState<string>('fixed');
  
  const models = [
    {
      id: 'fixed',
      name: 'Fixed Price',
      icon: '💰',
      description: 'Single flat rate for entire service'
    },
    {
      id: 'per_pax',
      name: 'Per Person',
      icon: '👥',
      description: 'Price varies by number of guests'
    },
    {
      id: 'package',
      name: 'Package Tiers',
      icon: '📦',
      description: 'Multiple packages with different features'
    },
    {
      id: 'hourly',
      name: 'Hourly Rate',
      icon: '⏰',
      description: 'Charge per hour of service'
    },
    {
      id: 'custom',
      name: 'Custom Quote',
      icon: '✍️',
      description: 'Individual quotes for each booking'
    }
  ];
  
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Pricing Model
      </label>
      {models.map(m => (
        <button
          key={m.id}
          type="button"
          onClick={() => setModel(m.id)}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            model === m.id
              ? 'border-rose-500 bg-rose-50'
              : 'border-gray-200 bg-white hover:border-rose-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{m.icon}</span>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{m.name}</div>
              <div className="text-sm text-gray-600">{m.description}</div>
            </div>
            {model === m.id && (
              <CheckCircle2 className="w-5 h-5 text-rose-500" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
```

#### Component 2: Package Tier Builder
```tsx
const PackageTierBuilder = () => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  
  const addTier = () => {
    const newTier: PricingTier = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      description: '',
      features: [],
      perPaxPrice: undefined,
      minPax: undefined,
      maxPax: undefined
    };
    setTiers([...tiers, newTier]);
  };
  
  const updateTier = (id: string, updates: Partial<PricingTier>) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  
  const removeTier = (id: string) => {
    setTiers(tiers.filter(t => t.id !== id));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">Package Tiers</h4>
        <span className="text-sm text-gray-600">
          {tiers.length} tier{tiers.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {tiers.map((tier, index) => (
        <div key={tier.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-sm text-gray-700">
              Tier {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeTier(tier.id)}
              className="p-1 text-red-600 hover:bg-red-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Tier Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tier Name
              </label>
              <input
                type="text"
                value={tier.name}
                onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                placeholder="e.g., Premium Package"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            
            {/* Base Price */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Base Price (₱)
              </label>
              <input
                type="number"
                value={tier.price}
                onChange={(e) => updateTier(tier.id, { price: Number(e.target.value) })}
                placeholder="25000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            
            {/* Per Pax Price (Optional) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Per Pax (₱) <span className="text-gray-500">optional</span>
              </label>
              <input
                type="number"
                value={tier.perPaxPrice || ''}
                onChange={(e) => updateTier(tier.id, { perPaxPrice: Number(e.target.value) || undefined })}
                placeholder="500"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            
            {/* Min/Max Pax */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Min Pax
                </label>
                <input
                  type="number"
                  value={tier.minPax || ''}
                  onChange={(e) => updateTier(tier.id, { minPax: Number(e.target.value) || undefined })}
                  placeholder="50"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Max Pax
                </label>
                <input
                  type="number"
                  value={tier.maxPax || ''}
                  onChange={(e) => updateTier(tier.id, { maxPax: Number(e.target.value) || undefined })}
                  placeholder="200"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={tier.description}
              onChange={(e) => updateTier(tier.id, { description: e.target.value })}
              placeholder="Brief description of what's included in this tier..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          
          {/* Features Included */}
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Features Included
            </label>
            {tier.features.map((feature, fIndex) => (
              <div key={fIndex} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...tier.features];
                    newFeatures[fIndex] = e.target.value;
                    updateTier(tier.id, { features: newFeatures });
                  }}
                  placeholder="e.g., Professional photographer for 8 hours"
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newFeatures = tier.features.filter((_, i) => i !== fIndex);
                    updateTier(tier.id, { features: newFeatures });
                  }}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateTier(tier.id, { features: [...tier.features, ''] })}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Feature
            </button>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={addTier}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Package Tier
      </button>
    </div>
  );
};
```

#### Component 3: Add-ons Builder
```tsx
const AddOnsBuilder = () => {
  const [addons, setAddons] = useState<AddOn[]>([]);
  
  const addAddon = () => {
    const newAddon: AddOn = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      type: 'fixed',
      category: 'service'
    };
    setAddons([...addons, newAddon]);
  };
  
  const updateAddon = (id: string, updates: Partial<AddOn>) => {
    setAddons(addons.map(a => a.id === id ? { ...a, ...updates } : a));
  };
  
  const removeAddon = (id: string) => {
    setAddons(addons.filter(a => a.id !== id));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">Add-ons & Extras</h4>
        <span className="text-sm text-gray-600">
          {addons.length} add-on{addons.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="grid gap-4">
        {addons.map((addon) => (
          <div key={addon.id} className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                Optional Extra
              </span>
              <button
                type="button"
                onClick={() => removeAddon(addon.id)}
                className="p-1 text-red-600 hover:bg-red-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Add-on Name */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Add-on Name
                </label>
                <input
                  type="text"
                  value={addon.name}
                  onChange={(e) => updateAddon(addon.id, { name: e.target.value })}
                  placeholder="e.g., Extra Photographer, Dessert Bar, LED Wall"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              
              {/* Pricing Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Pricing Type
                </label>
                <select
                  value={addon.type}
                  onChange={(e) => updateAddon(addon.id, { type: e.target.value as AddOn['type'] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="per_pax">Per Person</option>
                  <option value="per_hour">Per Hour</option>
                </select>
              </div>
              
              {/* Price */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price (₱)
                  {addon.type === 'per_pax' && ' per person'}
                  {addon.type === 'per_hour' && ' per hour'}
                </label>
                <input
                  type="number"
                  value={addon.price}
                  onChange={(e) => updateAddon(addon.id, { price: Number(e.target.value) })}
                  placeholder="5000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={addon.category}
                  onChange={(e) => updateAddon(addon.id, { category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="food">Food & Beverage</option>
                  <option value="equipment">Equipment</option>
                  <option value="service">Additional Service</option>
                  <option value="venue">Venue Enhancement</option>
                  <option value="decor">Decoration</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              {/* Required checkbox */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addon.isRequired || false}
                    onChange={(e) => updateAddon(addon.id, { isRequired: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-xs text-gray-700">Required</span>
                </label>
              </div>
            </div>
            
            {/* Description */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={addon.description}
                onChange={(e) => updateAddon(addon.id, { description: e.target.value })}
                placeholder="Brief description of this add-on..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        ))}
      </div>
      
      <button
        type="button"
        onClick={addAddon}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-500 hover:text-green-600 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add New Add-on
      </button>
    </div>
  );
};
```

#### Component 4: Price Calculator Preview
```tsx
const PriceCalculatorPreview = ({ 
  pricingModel, 
  basePrice, 
  perPaxPrice, 
  tiers, 
  addons 
}: {
  pricingModel: string;
  basePrice: number;
  perPaxPrice?: number;
  tiers: PricingTier[];
  addons: AddOn[];
}) => {
  const [guestCount, setGuestCount] = useState(100);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  const calculateTotal = (): PriceBreakdown => {
    let subtotal = 0;
    const items: any[] = [];
    
    // Base price or selected tier
    if (pricingModel === 'package' && selectedTier) {
      const tier = tiers.find(t => t.id === selectedTier);
      if (tier) {
        subtotal += tier.price;
        items.push({
          name: `${tier.name} Package`,
          quantity: 1,
          unitPrice: tier.price,
          total: tier.price
        });
        
        // Per pax pricing if tier has it
        if (tier.perPaxPrice && guestCount) {
          const perPaxTotal = tier.perPaxPrice * guestCount;
          subtotal += perPaxTotal;
          items.push({
            name: 'Per Guest Fee',
            quantity: guestCount,
            unitPrice: tier.perPaxPrice,
            total: perPaxTotal
          });
        }
      }
    } else if (pricingModel === 'per_pax') {
      subtotal += basePrice; // Setup fee
      items.push({
        name: 'Setup Fee',
        quantity: 1,
        unitPrice: basePrice,
        total: basePrice
      });
      
      if (perPaxPrice && guestCount) {
        const perPaxTotal = perPaxPrice * guestCount;
        subtotal += perPaxTotal;
        items.push({
          name: 'Per Guest',
          quantity: guestCount,
          unitPrice: perPaxPrice,
          total: perPaxTotal
        });
      }
    } else {
      subtotal += basePrice;
      items.push({
        name: 'Base Service',
        quantity: 1,
        unitPrice: basePrice,
        total: basePrice
      });
    }
    
    // Add-ons
    let addOnsTotal = 0;
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) {
        let addonTotal = addon.price;
        if (addon.type === 'per_pax' && guestCount) {
          addonTotal = addon.price * guestCount;
        }
        addOnsTotal += addonTotal;
        items.push({
          name: addon.name,
          quantity: addon.type === 'per_pax' ? guestCount : 1,
          unitPrice: addon.price,
          total: addonTotal
        });
      }
    });
    
    subtotal += addOnsTotal;
    
    return {
      basePrice,
      perPaxPrice,
      guestCount,
      perPaxTotal: perPaxPrice && guestCount ? perPaxPrice * guestCount : undefined,
      addOnsTotal,
      subtotal,
      total: subtotal,
      items
    };
  };
  
  const breakdown = calculateTotal();
  
  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">🧮</span>
        Price Calculator Preview
      </h4>
      <p className="text-sm text-gray-600 mb-6">
        This is how clients will see and calculate your pricing
      </p>
      
      {/* Guest Count Input */}
      {(pricingModel === 'per_pax' || (pricingModel === 'package' && tiers.some(t => t.perPaxPrice))) && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Guests
          </label>
          <input
            type="number"
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            min="1"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg font-semibold"
          />
        </div>
      )}
      
      {/* Package Tier Selection */}
      {pricingModel === 'package' && tiers.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Package
          </label>
          <div className="space-y-2">
            {tiers.map(tier => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTier(tier.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedTier === tier.id
                    ? 'border-purple-500 bg-purple-100'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{tier.name}</div>
                    <div className="text-sm text-gray-600">₱{tier.price.toLocaleString()}</div>
                    {tier.perPaxPrice && (
                      <div className="text-xs text-gray-500">
                        + ₱{tier.perPaxPrice}/guest
                      </div>
                    )}
                  </div>
                  {selectedTier === tier.id && (
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Add-ons Selection */}
      {addons.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Optional Add-ons
          </label>
          <div className="space-y-2">
            {addons.map(addon => {
              const isSelected = selectedAddons.includes(addon.id);
              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                    } else {
                      setSelectedAddons([...selectedAddons, addon.id]);
                    }
                  }}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{addon.name}</div>
                        <div className="text-xs text-gray-600">{addon.description}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      ₱{addon.price.toLocaleString()}
                      {addon.type === 'per_pax' && <span className="text-xs">/guest</span>}
                      {addon.type === 'per_hour' && <span className="text-xs">/hour</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Price Breakdown */}
      <div className="mt-6 p-4 bg-white rounded-xl border-2 border-purple-300">
        <h5 className="font-semibold text-gray-900 mb-3">Price Breakdown</h5>
        <div className="space-y-2 text-sm">
          {breakdown.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-1">
              <div className="text-gray-700">
                {item.name}
                {item.quantity > 1 && (
                  <span className="text-gray-500 ml-1">
                    ({item.quantity} × ₱{item.unitPrice.toLocaleString()})
                  </span>
                )}
              </div>
              <div className="font-medium text-gray-900">
                ₱{item.total.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t-2 border-gray-200">
          <div className="flex items-center justify-between text-lg font-bold">
            <div className="text-gray-900">Total</div>
            <div className="text-purple-600">
              ₱{breakdown.total.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <span className="text-blue-600">ℹ️</span>
          <p className="text-xs text-blue-700">
            This is a preview. Actual quotes will use this structure when clients request pricing.
          </p>
        </div>
      </div>
    </div>
  );
};
```

---

## 🚀 Integration Steps

### Step 1: Add New Pricing Section to AddServiceForm
Replace the current Step 2 (pricing) section with:

```tsx
{/* Step 2: Enhanced Pricing & Packages */}
{currentStep === 2 && (
  <motion.div key="step2" {...stepAnimation} className="space-y-8">
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Pricing & Packages
      </h3>
      <p className="text-gray-600">
        Set up your pricing structure and optional add-ons
      </p>
    </div>
    
    {/* Pricing Model Selector */}
    <PricingModelSelector />
    
    {/* Conditional Pricing Forms */}
    {pricingModel === 'per_pax' && (
      <div className="space-y-6">
        {/* Base Price + Per Pax */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Setup/Base Fee (₱)
            </label>
            <input
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
              placeholder="15000"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Guest (₱)
            </label>
            <input
              type="number"
              value={formData.perPaxPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, perPaxPrice: e.target.value }))}
              placeholder="850"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Guests
            </label>
            <input
              type="number"
              value={formData.minPax}
              onChange={(e) => setFormData(prev => ({ ...prev, minPax: e.target.value }))}
              placeholder="50"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Guests
            </label>
            <input
              type="number"
              value={formData.maxPax}
              onChange={(e) => setFormData(prev => ({ ...prev, maxPax: e.target.value }))}
              placeholder="200"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
            />
          </div>
        </div>
      </div>
    )}
    
    {pricingModel === 'package' && (
      <PackageTierBuilder />
    )}
    
    {/* Add-ons Section (always show) */}
    <div className="mt-8">
      <AddOnsBuilder />
    </div>
    
    {/* Price Calculator Preview */}
    <PriceCalculatorPreview
      pricingModel={pricingModel}
      basePrice={Number(formData.basePrice)}
      perPaxPrice={Number(formData.perPaxPrice)}
      tiers={formData.tiers}
      addons={formData.addons}
    />
  </motion.div>
)}
```

### Step 2: Update Form Submission
In the handleSubmit function, include the new pricing data:

```typescript
const serviceData = {
  ...existingData,
  pricing_model: formData.pricingModel,
  base_price: Number(formData.basePrice),
  per_pax_price: Number(formData.perPaxPrice) || null,
  min_pax: Number(formData.minPax) || null,
  max_pax: Number(formData.maxPax) || null,
  pricing_tiers: formData.tiers.length > 0 ? JSON.stringify(formData.tiers) : null,
  addons: formData.addons.length > 0 ? JSON.stringify(formData.addons) : null,
  price_breakdown: {
    model: formData.pricingModel,
    tiers: formData.tiers,
    addons: formData.addons
  }
};
```

### Step 3: Display in Service Cards
Update ServiceCard.tsx to show itemized pricing:

```tsx
{/* Pricing Display */}
{service.pricing_model === 'per_pax' ? (
  <div className="space-y-1">
    <div className="font-bold text-lg text-rose-600">
      ₱{service.per_pax_price?.toLocaleString()}/guest
    </div>
    <div className="text-sm text-gray-600">
      Base fee: ₱{service.base_price?.toLocaleString()}
    </div>
    <div className="text-xs text-gray-500">
      {service.min_pax}-{service.max_pax} guests
    </div>
  </div>
) : service.pricing_model === 'package' && service.pricing_tiers ? (
  <div>
    <div className="font-semibold text-gray-700 text-sm">
      From ₱{Math.min(...JSON.parse(service.pricing_tiers).map(t => t.price)).toLocaleString()}
    </div>
    <div className="text-xs text-gray-500">
      {JSON.parse(service.pricing_tiers).length} packages available
    </div>
  </div>
) : (
  <div className="font-bold text-lg text-rose-600">
    ₱{service.price?.toLocaleString()}
  </div>
)}

{/* Add-ons Badge */}
{service.addons && JSON.parse(service.addons).length > 0 && (
  <div className="text-xs text-blue-600 font-medium">
    + {JSON.parse(service.addons).length} add-ons available
  </div>
)}
```

---

## 📚 Usage Examples

### For Caterers:
```
Model: Per Pax
Base: ₱15,000 (venue setup, staff, equipment)
Per Pax: ₱850/guest
Min: 50, Max: 200

Add-ons:
- Premium Drinks Package: ₱300/guest
- Dessert Station: ₱5,000 fixed
- Extra Waiter: ₱2,000/waiter
```

### For Photographers:
```
Model: Package
Tiers:
- Basic: ₱20,000 (6 hours, 1 photographer)
- Standard: ₱35,000 (8 hours, 1 photographer + video)
- Premium: ₱55,000 (full day, 2 photographers + video)

Add-ons:
- Engagement Shoot: ₱15,000
- Same-day Edit: ₱8,000
- Premium Album: ₱6,500
```

### For Venues:
```
Model: Per Pax
Base: ₱50,000 (venue + basic setup)
Per Pax: ₱500/guest (tables, chairs, linens)
Min: 50, Max: 300

Add-ons:
- LED Wall: ₱12,000
- Sound System: ₱8,000
- Extended Hours: ₱5,000/hour
```

---

## 🎨 UI Preview

The enhanced form will have:
1. ✅ **Visual pricing model selector** with icons
2. ✅ **Dynamic form fields** based on selected model
3. ✅ **Package tier builder** with feature lists
4. ✅ **Add-on management** with categories
5. ✅ **Live price calculator** showing total breakdown
6. ✅ **Professional display** in service cards

---

## 💡 Benefits

### For Vendors:
- ✅ Flexible pricing options
- ✅ Clear quote generation
- ✅ Upsell opportunities with add-ons
- ✅ Professional presentation

### For Clients:
- ✅ Transparent pricing breakdown
- ✅ Easy price comparison
- ✅ Customizable packages
- ✅ Clear understanding of costs

---

**Ready to implement? Let me know which component you'd like to start with!** 🚀
