import React, { useState } from 'react';
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

export interface PackageItem {
  id?: string;
  item_name: string;
  description: string;
  price: number;
  inclusions: string[];
  exclusions: string[];
  display_order: number;
  is_active: boolean;
}

interface PackageBuilderProps {
  packages: PackageItem[];
  onChange: (packages: PackageItem[]) => void;
  category?: string;
}

// Pre-defined package templates for quick setup
const PACKAGE_TEMPLATES: Record<string, PackageItem[]> = {
  default: [
    {
      item_name: 'Bronze Package',
      description: 'Essential services for intimate weddings',
      price: 50000,
      inclusions: ['4 hours of service', 'Basic setup', 'Up to 50 guests'],
      exclusions: [],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Silver Package',
      description: 'Enhanced services for medium weddings',
      price: 100000,
      inclusions: ['6 hours of service', 'Premium setup', 'Up to 100 guests', 'Complimentary consultation'],
      exclusions: [],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Gold Package',
      description: 'Premium all-inclusive experience',
      price: 200000,
      inclusions: ['8 hours of service', 'Luxury setup', 'Up to 200 guests', 'Dedicated coordinator'],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],
  Photography: [
    {
      item_name: 'Basic Coverage',
      description: '4-hour wedding photography',
      price: 35000,
      inclusions: ['4 hours coverage', '200 edited photos', 'Online gallery', 'USB drive'],
      exclusions: ['Second photographer', 'Drone shots', 'Same-day edit video'],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Full Day Coverage',
      description: '8-hour complete wedding documentation',
      price: 65000,
      inclusions: ['8 hours coverage', '400 edited photos', 'Second photographer', 'Online gallery', 'Premium album (20 pages)'],
      exclusions: ['Drone photography', 'Same-day edit video'],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Premium Package',
      description: 'Complete wedding documentation with all extras',
      price: 120000,
      inclusions: ['10 hours coverage', '600 edited photos', 'Second photographer', 'Drone photography', 'Same-day edit video', 'Premium album (40 pages)', 'Engagement shoot'],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ],
  Catering: [
    {
      item_name: 'Buffet Package',
      description: 'Traditional buffet style service',
      price: 800,
      inclusions: ['4-course menu', 'Standard tableware', 'Service staff', 'Setup and cleanup'],
      exclusions: ['Premium dishes', 'Beverage packages', 'Themed decorations'],
      display_order: 0,
      is_active: true
    },
    {
      item_name: 'Plated Service',
      description: 'Elegant plated dining experience',
      price: 1200,
      inclusions: ['5-course gourmet menu', 'Premium tableware', 'Professional service staff', 'Chef on-site', 'Setup and cleanup'],
      exclusions: ['Premium wine pairing', 'Custom menu items'],
      display_order: 1,
      is_active: true
    },
    {
      item_name: 'Premium Experience',
      description: 'Luxury dining with all inclusions',
      price: 2000,
      inclusions: ['7-course chef\'s special menu', 'Luxury tableware', 'Dedicated service team', 'Premium beverage package', 'Themed table settings', 'Dessert station'],
      exclusions: [],
      display_order: 2,
      is_active: true
    }
  ]
};

export const PackageBuilder: React.FC<PackageBuilderProps> = ({
  packages,
  onChange,
  category
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedPackages, setExpandedPackages] = useState<Set<number>>(new Set([0]));
  const [showTemplates, setShowTemplates] = useState(packages.length === 0);

  const addPackage = (template?: PackageItem) => {
    const newPackage: PackageItem = template || {
      item_name: '',
      description: '',
      price: 0,
      inclusions: [''],
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
      inclusions: [...pkg.inclusions, '']
    });
  };

  const updateInclusion = (packageIndex: number, inclusionIndex: number, value: string) => {
    const pkg = packages[packageIndex];
    const updated = pkg.inclusions.map((inc, i) =>
      i === inclusionIndex ? value : inc
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

  const loadTemplate = (templateKey: string) => {
    const template = PACKAGE_TEMPLATES[templateKey] || PACKAGE_TEMPLATES.default;
    onChange(template);
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
                onClick={() => loadTemplate(category || 'default')}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all text-left"
              >
                <div className="font-semibold text-gray-900">
                  {category ? `${category} Template` : 'Standard Template'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Bronze, Silver, Gold packages
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
                          ₱{pkg.price.toLocaleString()} · {pkg.inclusions.filter(i => i.trim()).length} inclusions
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingIndex(index)}
                          className="p-2 text-gray-600 hover:text-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleExpanded(index)}
                        className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removePackage(index)}
                        className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
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

                          {/* Inclusions */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              What's Included
                            </label>
                            <div className="space-y-2">
                              {pkg.inclusions.map((inclusion, incIndex) => (
                                <div key={incIndex} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={inclusion}
                                    onChange={(e) => updateInclusion(index, incIndex, e.target.value)}
                                    placeholder="e.g., 4 hours of service"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeInclusion(index, incIndex)}
                                    className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50"
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
