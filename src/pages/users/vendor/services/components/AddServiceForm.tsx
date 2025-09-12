import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Save,
  Upload,
  MapPin,
  DollarSign,
  Star,

  Phone,
  Mail,
  Globe,
  Tag,
  CheckCircle2,
  AlertCircle,
  Camera,
  Sparkles
} from 'lucide-react';

// Service interface based on the actual database schema
interface Service {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  images?: string[];
  featured?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  location?: string;
  price_range?: string;
  features?: string[];
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  tags?: string[];
  keywords?: string;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  price: string;
  images: string[];
  featured: boolean;
  is_active: boolean;
  location: string;
  price_range: string;
  features: string[];
  contact_info: {
    phone: string;
    email: string;
    website: string;
  };
  tags: string[];
  keywords: string;
}

interface AddServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (serviceData: any) => Promise<void>;
  editingService?: Service | null;
  vendorId: string;
  isLoading?: boolean;
}

// Service categories based on the actual database data
const SERVICE_CATEGORIES = [
  'Photographer & Videographer',
  'Wedding Planner',
  'Florist',
  'Hair & Makeup Artists',
  'Caterer',
  'DJ/Band',
  'Officiant',
  'Venue Coordinator',
  'Event Rentals',
  'Cake Designer',
  'Dress Designer/Tailor',
  'Security & Guest Management',
  'Sounds & Lights',
  'Stationery Designer',
  'Transportation Services'
];

const PRICE_RANGES = [
  { value: '$', label: '$ - Budget Friendly (Under $500)', color: 'bg-green-100 text-green-800' },
  { value: '$$', label: '$$ - Moderate ($500 - $1,500)', color: 'bg-blue-100 text-blue-800' },
  { value: '$$$', label: '$$$ - Premium ($1,500 - $3,000)', color: 'bg-purple-100 text-purple-800' },
  { value: '$$$$', label: '$$$$ - Luxury ($3,000+)', color: 'bg-gold-100 text-gold-800' }
];

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400'
];

export const AddServiceForm: React.FC<AddServiceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingService,
  vendorId,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    price: '',
    images: [],
    featured: false,
    is_active: true,
    location: '',
    price_range: '$',
    features: [],
    contact_info: {
      phone: '',
      email: '',
      website: ''
    },
    tags: [],
    keywords: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);

  const totalSteps = 4;

  // Initialize form data when editing
  useEffect(() => {
    if (editingService) {
      setFormData({
        title: editingService.title || '',
        description: editingService.description || '',
        category: editingService.category || '',
        price: editingService.price?.toString() || '',
        images: editingService.images || [],
        featured: editingService.featured || false,
        is_active: editingService.is_active ?? true,
        location: editingService.location || '',
        price_range: editingService.price_range || '$',
        features: editingService.features || [],
        contact_info: {
          phone: editingService.contact_info?.phone || '',
          email: editingService.contact_info?.email || '',
          website: editingService.contact_info?.website || ''
        },
        tags: editingService.tags || [],
        keywords: editingService.keywords || ''
      });
    } else {
      // Reset form for new service
      setFormData({
        title: '',
        description: '',
        category: '',
        price: '',
        images: [],
        featured: false,
        is_active: true,
        location: '',
        price_range: '$',
        features: [],
        contact_info: {
          phone: '',
          email: '',
          website: ''
        },
        tags: [],
        keywords: ''
      });
    }
    setCurrentStep(1);
    setErrors({});
  }, [editingService, isOpen]);

  // Validation functions
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Service name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        break;
      case 2:
        if (formData.price && parseFloat(formData.price) < 0) {
          newErrors.price = 'Price must be a positive number';
        }
        break;
      case 3:
        if (formData.contact_info.email && !/\S+@\S+\.\S+/.test(formData.contact_info.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (formData.contact_info.website && !formData.contact_info.website.startsWith('http')) {
          newErrors.website = 'Website must start with http:// or https://';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps
    let isValid = true;
    for (let i = 1; i <= totalSteps; i++) {
      if (!validateStep(i)) {
        isValid = false;
        setCurrentStep(i);
        break;
      }
    }

    if (!isValid) return;

    try {
      const serviceData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        vendor_id: vendorId,
        // Ensure we have at least one placeholder image
        images: formData.images.length > 0 ? formData.images : [PLACEHOLDER_IMAGES[0]]
      };

      await onSubmit(serviceData);
      onClose();
    } catch (error) {
      console.error('Error submitting service:', error);
    }
  };

  // Handle image upload (placeholder functionality)
  const handleImageUpload = (files: FileList | null, isMain = false) => {
    if (!files) return;
    
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      const newImages = Array.from(files).map((_, index) => 
        PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]
      );
      
      if (isMain) {
        setFormData(prev => ({ ...prev, images: [newImages[0], ...prev.images.slice(1)] }));
      } else {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
      }
      
      setIsUploading(false);
    }, 1500);
  };

  // Helper functions
  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  // Step navigation
  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h2>
                  <p className="text-white/90">
                    {editingService ? 'Update your service details' : 'Create a beautiful service listing'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mt-6 flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      i + 1 <= currentStep
                        ? 'bg-white text-rose-600'
                        : 'bg-white/20 text-white/60'
                    }`}
                  >
                    {i + 1 < currentStep ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < totalSteps - 1 && (
                    <div
                      className={`w-12 h-0.5 transition-all ${
                        i + 1 < currentStep ? 'bg-white' : 'bg-white/20'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col h-[calc(95vh-200px)]">
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Details</h3>
                      <p className="text-gray-600">Tell us about your amazing service</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Service Name */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Name *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all ${
                            errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                          placeholder="e.g., Elegant Wedding Photography Package"
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.title}
                          </p>
                        )}
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all ${
                            errors.category ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <option value="">Select a category</option>
                          {SERVICE_CATEGORIES.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.category}
                          </p>
                        )}
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Location
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                            placeholder="e.g., New York, NY"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all ${
                          errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                        rows={4}
                        placeholder="Describe your service in detail. What makes it special? What's included?"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Pricing & Availability */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Pricing & Availability</h3>
                      <p className="text-gray-600">Set your pricing and availability</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Price Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price Range
                        </label>
                        <div className="space-y-2">
                          {PRICE_RANGES.map(range => (
                            <label key={range.value} className="flex items-center">                          <input
                            type="radio"
                            name="price_range"
                            value={range.value}
                            checked={formData.price_range === range.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, price_range: e.target.value }))}
                            className="mr-3 text-rose-600"
                            aria-label={range.label}
                          />
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${range.color}`}>
                                {range.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Base Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Starting Price (USD)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all ${
                              errors.price ? 'border-red-300 bg-red-50' : 'border-gray-200'
                            }`}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        {errors.price && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.price}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Service Options */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="font-medium text-gray-900">Featured Service</p>
                            <p className="text-sm text-gray-600">Highlight this service in search results</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                            className="sr-only peer"
                            aria-label="Featured Service"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900">Available for Booking</p>
                            <p className="text-sm text-gray-600">Allow clients to book this service</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                            className="sr-only peer"
                            aria-label="Available for Booking"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Contact & Features */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact & Features</h3>
                      <p className="text-gray-600">Add contact details and service features</p>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Contact Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.contact_info.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contact_info: { ...prev.contact_info, phone: e.target.value }
                            }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                            placeholder="Phone number"
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            value={formData.contact_info.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contact_info: { ...prev.contact_info, email: e.target.value }
                            }))}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all ${
                              errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                            }`}
                            placeholder="Email address"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="url"
                            value={formData.contact_info.website}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contact_info: { ...prev.contact_info, website: e.target.value }
                            }))}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all ${
                              errors.website ? 'border-red-300 bg-red-50' : 'border-gray-200'
                            }`}
                            placeholder="Website URL"
                          />
                          {errors.website && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors.website}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Service Features */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Service Features</h4>
                      <div className="space-y-3">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => updateFeature(index, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                              placeholder="Enter a feature or benefit"
                            />
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove feature"
                              aria-label={`Remove feature: ${feature}`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addFeature}
                          className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-rose-300 hover:text-rose-600 transition-all w-full justify-center"
                        >
                          <Plus size={18} />
                          Add Feature
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Images & Tags */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Images & Tags</h3>
                      <p className="text-gray-600">Showcase your work with beautiful images</p>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Service Images
                      </h4>
                      
                      {/* Main Image Upload */}
                      <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                          isDragOver
                            ? 'border-rose-400 bg-rose-50'
                            : 'border-gray-300 hover:border-rose-300'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageUpload(e.target.files)}
                          className="hidden"
                          id="image-upload"
                          disabled={isUploading}
                        />
                        <label
                          htmlFor="image-upload"
                          className={`cursor-pointer flex flex-col items-center ${
                            isUploading ? 'opacity-50' : ''
                          }`}
                        >
                          {isUploading ? (
                            <>
                              <div className="w-12 h-12 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                              <p className="text-lg font-medium text-gray-700">Uploading images...</p>
                              <p className="text-sm text-gray-500">Please wait</p>
                            </>
                          ) : (
                            <>
                              <Upload className="h-12 w-12 text-gray-400 mb-4" />
                              <p className="text-lg font-medium text-gray-700">Upload service images</p>
                              <p className="text-sm text-gray-500">Drag & drop or click to select</p>
                              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
                            </>
                          )}
                        </label>
                      </div>

                      {/* Image Preview */}
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Service image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                title="Remove image"
                                aria-label={`Remove image ${index + 1}`}
                              >
                                <X size={14} />
                              </button>
                              {index === 0 && (
                                <div className="absolute bottom-1 left-1 px-2 py-1 bg-black/70 text-white text-xs rounded">
                                  Main
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Search Tags
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              className="text-rose-600 hover:text-rose-800"
                              title="Remove tag"
                              aria-label={`Remove tag: ${tag}`}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add tags (press Enter)"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();
                            if (value) {
                              addTag(value);
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer with Navigation */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Step {currentStep} of {totalSteps}
                  </span>
                </div>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all font-medium"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || isUploading}
                    className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {editingService ? 'Update Service' : 'Create Service'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
