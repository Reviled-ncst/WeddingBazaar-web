import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  X,
  GripVertical,
  Package,
  Edit2,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getPricingTemplates, getCategoryName } from './categoryPricingTemplates';

// ✅ NEW: Enhanced inclusion with quantity and unit
export interface PackageInclusion {
  name: string;
  quantity: number;
  unit: string; // 'pcs', 'hours', 'sets', 'days', 'items', etc.
  description?: string;
}

export interface PackageItem {
  id?: string;
  item_name: string;
  description: string;
  price: number;
  inclusions: PackageInclusion[]; // ✅ CHANGED: Now includes quantity
  exclusions: string[];
  display_order: number;
  is_active: boolean;
}

interface PackageBuilderProps {
  packages: PackageItem[];
  onChange: (packages: PackageItem[]) => void;
  category?: string;
}

// Note: Package templates are now imported from categoryPricingTemplates.ts
// which contains comprehensive templates for all 15 wedding service categories

export const PackageBuilder: React.FC<PackageBuilderProps> = ({
  packages,
  onChange,
  category
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedPackages, setExpandedPackages] = useState<Set<number>>(new Set([0]));
  const [showTemplates, setShowTemplates] = useState(packages.length === 0);

  // ✅ NEW: Sync packages to window.__tempPackageData for form submission
  useEffect(() => {
    if (!window.__tempPackageData) {
      window.__tempPackageData = {
        packages: [],
        addons: [],
        pricingRules: []
      };
    }
    
    // Transform PackageItem[] to ServicePackage[] format expected by backend
    window.__tempPackageData.packages = packages.map((pkg, index) => ({
      name: pkg.item_name,
      description: pkg.description,
      price: pkg.price,
      is_default: index === 0, // First package is default
      is_active: pkg.is_active,
      items: pkg.inclusions.filter(inc => inc.name && inc.name.trim()).map(inc => ({
        category: 'deliverable', // Default category
        name: inc.name,
        quantity: inc.quantity,
        unit: inc.unit,
        description: inc.description || ''
      }))
    }));
    
    console.log('📦 [PackageBuilder] Synced packages to window:', packages.length);
  }, [packages]);

  const addPackage = (template?: PackageItem) => {
    const newPackage: PackageItem = template || {
      item_name: '',
      description: '',
      price: 0,
      inclusions: [{ name: '', quantity: 1, unit: 'pcs', description: '' }],
      exclusions: [],
      display_order: packages.length,
      is_active: true
    };
    
    onChange([...packages, newPackage]);
    setEditingIndex(packages.length);
    setExpandedPackages(new Set([...expandedPackages, packages.length]));
    setShowTemplates(false);
  };

  const updatePackage = (index: number, updates: Partial<PackageItem>) => {
    const updated = packages.map((pkg, i) =>
      i === index ? { ...pkg, ...updates } : pkg
    );
    onChange(updated);
  };

  const removePackage = (index: number) => {
    if (confirm('Remove this package?')) {
      onChange(packages.filter((_, i) => i !== index));
      if (editingIndex === index) setEditingIndex(null);
    }
  };

  const reorderPackages = (newOrder: PackageItem[]) => {
    const withUpdatedOrder = newOrder.map((pkg, index) => ({
      ...pkg,
      display_order: index
    }));
    onChange(withUpdatedOrder);
  };

  const addInclusion = (packageIndex: number) => {
    const pkg = packages[packageIndex];
    updatePackage(packageIndex, {
      inclusions: [...pkg.inclusions, { name: '', quantity: 1, unit: 'pcs', description: '' }]
    });
  };

  const updateInclusion = (packageIndex: number, inclusionIndex: number, field: keyof PackageInclusion, value: string | number) => {
    const pkg = packages[packageIndex];
    const updated = pkg.inclusions.map((inc, i) =>
      i === inclusionIndex ? { ...inc, [field]: value } : inc
    );
    updatePackage(packageIndex, { inclusions: updated });
  };

  const removeInclusion = (packageIndex: number, inclusionIndex: number) => {
    const pkg = packages[packageIndex];
    updatePackage(packageIndex, {
      inclusions: pkg.inclusions.filter((_, i) => i !== inclusionIndex)
    });
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedPackages);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedPackages(newExpanded);
  };

  const loadTemplate = () => {
    // Get category-specific templates from the new comprehensive template file
    const templates = getPricingTemplates(category || 'default');
    
    // Convert string[] inclusions to PackageInclusion[] format
    const convertedTemplates: PackageItem[] = templates.map(template => ({
      ...template,
      inclusions: template.inclusions.map(inc => ({
        name: inc,
        quantity: 1,
        unit: 'pcs',
        description: ''
      }))
    }));
    
    onChange(convertedTemplates);
    setShowTemplates(false);
    setExpandedPackages(new Set([0]));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-pink-600" />
            Service Packages
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Create tiered packages to offer different service levels
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
        >
          <Sparkles className="w-4 h-4" />
          {showTemplates ? 'Hide' : 'Use'} Templates
        </button>
      </div>

      {/* Package Templates */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200"
          >
            <h5 className="font-semibold text-gray-900 mb-3">Quick Start Templates</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => loadTemplate()}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all text-left"
              >
                <div className="font-semibold text-gray-900">
                  {category ? `${getCategoryName(category)} Template` : 'Standard Template'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {category 
                    ? `Pre-built ${category} packages with realistic pricing` 
                    : 'Bronze, Silver, Gold packages'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => addPackage()}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all text-left"
              >
                <div className="font-semibold text-gray-900">Start from Scratch</div>
                <div className="text-sm text-gray-600 mt-1">
                  Build custom packages
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Package List (Reorderable) */}
      {packages.length > 0 && (
        <Reorder.Group axis="y" values={packages} onReorder={reorderPackages} className="space-y-4">
          {packages.map((pkg, index) => {
            const isExpanded = expandedPackages.has(index);
            const isEditing = editingIndex === index;

            return (
              <Reorder.Item key={`${pkg.item_name}-${index}`} value={pkg}>
                <motion.div
                  layout
                  className={`
                    bg-white rounded-xl border-2 transition-all
                    ${isEditing ? 'border-pink-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  {/* Package Header */}
                  <div className="p-4 flex items-center gap-3">
                    <button
                      type="button"
                      className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                      title="Drag to reorder package"
                      aria-label="Drag to reorder"
                    >
                      <GripVertical className="w-5 h-5" />
                    </button>

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          value={pkg.item_name}
                          onChange={(e) => updatePackage(index, { item_name: e.target.value })}
                          placeholder="Package name (e.g., Gold Package)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      ) : (
                        <h5 className="font-bold text-gray-900 truncate">{pkg.item_name || 'Unnamed Package'}</h5>
                      )}
                      {!isEditing && (
                        <p className="text-sm text-gray-600 mt-1">
                          ₱{pkg.price.toLocaleString()} · {pkg.inclusions.filter(i => i.name && i.name.trim()).length} inclusions
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          title="Save package changes"
                          aria-label="Save changes"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingIndex(index)}
                          className="p-2 text-gray-600 hover:text-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                          title="Edit package"
                          aria-label="Edit package"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleExpanded(index)}
                        className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                        title={isExpanded ? "Collapse package details" : "Expand package details"}
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removePackage(index)}
                        className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove package"
                        aria-label="Remove package"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Package Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200"
                      >
                        <div className="p-4 space-y-4">
                          {/* Description */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={pkg.description}
                              onChange={(e) => updatePackage(index, { description: e.target.value })}
                              placeholder="Briefly describe what makes this package special..."
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                            />
                          </div>

                          {/* Price */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price (₱)
                            </label>
                            <input
                              type="number"
                              value={pkg.price || ''}
                              onChange={(e) => updatePackage(index, { price: parseFloat(e.target.value) || 0 })}
                              placeholder="0"
                              min="0"
                              step="1000"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                          </div>

                          {/* Inclusions with Quantity */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              What's Included (Items & Quantities)
                            </label>
                            <div className="space-y-3">
                              {pkg.inclusions.map((inclusion, incIndex) => (
                                <div key={incIndex} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <div className="flex-1 grid grid-cols-12 gap-2">
                                    {/* Item Name */}
                                    <div className="col-span-6">
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Item Name
                                      </label>
                                      <input
                                        type="text"
                                        value={inclusion.name}
                                        onChange={(e) => updateInclusion(index, incIndex, 'name', e.target.value)}
                                        placeholder="e.g., Professional Camera"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                                      />
                                    </div>
                                    
                                    {/* Quantity */}
                                    <div className="col-span-3">
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Quantity
                                      </label>
                                      <input
                                        type="number"
                                        value={inclusion.quantity}
                                        onChange={(e) => updateInclusion(index, incIndex, 'quantity', parseInt(e.target.value) || 1)}
                                        placeholder="1"
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                                      />
                                    </div>
                                    
                                    {/* Unit */}
                                    <div className="col-span-3">
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Unit
                                      </label>
                                      <select
                                        value={inclusion.unit}
                                        onChange={(e) => updateInclusion(index, incIndex, 'unit', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                                        title="Select unit of measurement"
                                        aria-label="Unit of measurement"
                                      >
                                        <option value="pcs">pcs</option>
                                        <option value="hours">hours</option>
                                        <option value="days">days</option>
                                        <option value="sets">sets</option>
                                        <option value="items">items</option>
                                        <option value="people">people</option>
                                        <option value="tables">tables</option>
                                        <option value="copies">copies</option>
                                        <option value="sessions">sessions</option>
                                      </select>
                                    </div>
                                    
                                    {/* Optional Description */}
                                    <div className="col-span-12">
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Description (optional)
                                      </label>
                                      <input
                                        type="text"
                                        value={inclusion.description || ''}
                                        onChange={(e) => updateInclusion(index, incIndex, 'description', e.target.value)}
                                        placeholder="e.g., Full-frame sensor, 24MP resolution"
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-xs"
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Remove Button */}
                                  <button
                                    type="button"
                                    onClick={() => removeInclusion(index, incIndex)}
                                    className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 flex-shrink-0"
                                    title="Remove item"
                                    aria-label="Remove inclusion item"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addInclusion(index)}
                                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-pink-500 hover:text-pink-600 transition-colors"
                              >
                                + Add inclusion
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}

      {/* Add Package Button */}
      <button
        type="button"
        onClick={() => addPackage()}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50 transition-all flex items-center justify-center gap-2 font-medium"
      >
        <Plus className="w-5 h-5" />
        Add Another Package
      </button>

      {/* Validation Messages */}
      {packages.length === 0 && !showTemplates && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          ⚠️ Add at least one package to use itemized pricing, or switch to simple pricing mode.
        </div>
      )}

      {packages.some(pkg => !pkg.item_name || pkg.price <= 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          ❌ All packages must have a name and a price greater than zero.
        </div>
      )}
    </div>
  );
};
