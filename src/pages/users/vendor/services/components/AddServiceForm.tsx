import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Upload,
  MapPin,
  Star,
  Globe,
  Tag,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Camera,
  Sparkles,
  Loader2,
  Calendar,
  Package,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LocationPicker } from '../../../../../shared/components/forms/LocationPicker';
import categoryService from '../../../../../services/api/categoryService';
import type { Category, CategoryField } from '../../../../../services/api/categoryService';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { analytics } from '../../../../../utils/analytics';
import { useNotification } from '../../../../../shared/hooks/useNotification';
import { NotificationModal } from '../../../../../shared/components/modals';
import { PricingModeSelector, type PricingModeValue } from './pricing/PricingModeSelector';
import { 
  PackageBuilder, 
  type PackageItem as PackageBuilderItem 
} from './pricing/PackageBuilder';

// Service interface based on the actual database schema
interface Service {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
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
  // DSS-specific fields
  years_in_business?: number;
  service_tier?: 'premium' | 'standard' | 'basic';
  wedding_styles?: string[];
  cultural_specialties?: string[];
  availability?: string | {
    weekdays?: boolean;
    weekends?: boolean;
    holidays?: boolean;
    seasons?: string[];
  };
  // Category-specific fields
  venue_capacity?: {
    min?: number;
    max?: number;
  };
  catering_options?: {
    cuisine_types?: string[];
    dietary_accommodations?: string[];
    service_style?: string[];
  };
  photography_style?: string[];
  music_genres?: string[];
  equipment_included?: string[];
  certifications?: string[];
  insurance?: boolean;
  cancellation_policy?: string;
  portfolio_url?: string;
  video_url?: string;
}

// ✅ NEW: Itemization interfaces
interface PackageItem {
  category: string;
  name: string;
  quantity: number;
  unit: string;
  description?: string;
}

interface ServicePackage {
  id?: string;
  name: string;
  description: string;
  price: number;
  tier?: 'basic' | 'standard' | 'premium'; // ✅ Package-level tier
  is_default: boolean;
  is_active: boolean;
  items?: PackageItem[];
}

interface ServiceAddon {
  id?: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
}

interface PricingRule {
  id?: string;
  rule_type: string;
  rule_name: string;
  base_price: number;
  price_per_unit?: number;
  min_quantity?: number;
  max_quantity?: number;
  is_active: boolean;
}

// ✅ Extend Window interface for itemization data
declare global {
  interface Window {
    __tempPackageData?: {
      packages: ServicePackage[];
      addons: ServiceAddon[];
      pricingRules: PricingRule[];
    };
  }
}

interface LocationData {
  address: string;
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
  country?: string;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: string;
  max_price?: string;
  images: string[];
  featured: boolean;
  is_active: boolean;
  location: string;
  locationData?: LocationData;
  price_range: string;
  features: string[];
  contact_info: {
    phone: string;
    email: string;
    website: string;
  };
  tags: string[];
  keywords: string;
  // DSS-specific fields
  years_in_business: string;
  service_tier: 'premium' | 'standard' | 'basic';
  wedding_styles: string[];
  cultural_specialties: string[];
  availability: {
    weekdays: boolean;
    weekends: boolean;
    holidays: boolean;
    seasons: string[];
  };
  // Category-specific fields
  venue_capacity?: {
    min: string;
    max: string;
  };
  catering_options?: {
    cuisine_types: string[];
    dietary_accommodations: string[];
    service_style: string[];
  };
  photography_style?: string[];
  music_genres?: string[];
  equipment_included?: string[];
  certifications?: string[];
  insurance: boolean;
  cancellation_policy: string;
  portfolio_url: string;
  video_url: string;
}

interface VendorProfile {
  phone?: string;
  email?: string;
  website?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_website?: string;
  website_url?: string;
  years_experience?: string | number; // ✅ FIXED: Match auth context field name
  yearsInBusiness?: number; // Legacy fallback
}

interface AddServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (serviceData: any) => Promise<void>;
  editingService?: Service | null;
  vendorId: string;
  vendorProfile?: VendorProfile | null;
  isLoading?: boolean;
}

export const AddServiceForm: React.FC<AddServiceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingService,
  vendorId,
  vendorProfile,
  isLoading = false
}) => {
  // Notification system
  const { notification, showError, hideNotification } = useNotification();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    max_price: '',
    images: [],
    featured: false,
    is_active: true,
    location: '',
    locationData: undefined,
    price_range: '₱10,000 - ₱25,000',
    features: [],
    contact_info: {
      phone: '',
      email: '',
      website: ''
    },
    tags: [],
    keywords: '',
    // DSS fields
    years_in_business: '',
    service_tier: 'basic',
    wedding_styles: [],
    cultural_specialties: [],
    availability: {
      weekdays: true,
      weekends: true,
      holidays: false,
      seasons: []
    },
    // Category-specific fields
    venue_capacity: {
      min: '',
      max: ''
    },
    catering_options: {
      cuisine_types: [],
      dietary_accommodations: [],
      service_style: []
    },
    photography_style: [],
    music_genres: [],
    equipment_included: [],
    certifications: [],
    insurance: false,
    cancellation_policy: '',
    portfolio_url: '',
    video_url: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [expandedPackages, setExpandedPackages] = useState<Record<number, boolean>>({}); // Track which packages are expanded

  // ✅ NEW: Pricing mode state for itemization
  const [pricingMode, setPricingMode] = useState<PricingModeValue>('simple');
  const [packages, setPackages] = useState<PackageBuilderItem[]>([]);

  // Dynamic categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFields, setCategoryFields] = useState<CategoryField[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);

  // Ref for scroll container
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const totalSteps = 5; // 1=Basic Info, 2=Pricing, 3=DSS Details, 4=Images & Tags, 5=Category-Specific Fields
  // Note: Removed old "Service Items & Equipment" step - itemization now happens in PackageBuilder

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        console.log('📂 Loading categories from API...');
        const cats = await categoryService.fetchCategories();
        setCategories(cats);
        console.log(`✅ Loaded ${cats.length} categories`);
      } catch (error) {
        console.error('❌ Error loading categories:', error);
        setErrors(prev => ({ ...prev, categories: 'Failed to load categories. Using defaults.' }));
      } finally {
        setLoadingCategories(false);
      }
    };
    
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Load fields when category changes
  useEffect(() => {
    if (!formData.category) {
      setCategoryFields([]);
      return;
    }
    
    const loadFields = async () => {
      setLoadingFields(true);
      try {
        console.log(`📋 Loading fields for category: ${formData.category}`);
        const fields = await categoryService.fetchCategoryFieldsByName(formData.category);
        setCategoryFields(fields);
        console.log(`✅ Loaded ${fields.length} fields`);
      } catch (error) {
        console.error('❌ Error loading category fields:', error);
        setCategoryFields([]);
      } finally {
        setLoadingFields(false);
      }
    };
    
    loadFields();
  }, [formData.category]);

  // Scroll to top whenever step changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // Initialize form data when editing OR when vendor profile is available
  useEffect(() => {
    if (editingService) {
      console.log('📝 [AddServiceForm] Loading editingService:', editingService);
      
      // ✅ Load packages from editingService AND merge with package_items
      if ((editingService as any).packages && Array.isArray((editingService as any).packages)) {
        console.log('📦 [AddServiceForm] Loading packages from editingService:', (editingService as any).packages);
        console.log('📦 [AddServiceForm] package_items:', (editingService as any).package_items);
        
        // Merge packages with their items
        const packageItems = (editingService as any).package_items || {};
        const mergedPackages = (editingService as any).packages.map((pkg: any) => {
          const items = packageItems[pkg.id] || [];
          return {
            ...pkg,
            items: items
          };
        });
        
        console.log('📦 [AddServiceForm] Merged packages with items:', mergedPackages);
        setPackages(mergedPackages);
        
        // Also populate window.__tempPackageData for confirmation modal
        window.__tempPackageData = {
          packages: mergedPackages,
          addons: (editingService as any).addons || [],
          pricingRules: (editingService as any).pricingRules || []
        };
      }
      
      setFormData({
        title: editingService.title || '',
        description: editingService.description || '',
        category: editingService.category || '',
        subcategory: editingService.subcategory || '',
        price: editingService.price?.toString() || '',
        max_price: '',
        images: editingService.images || [],
        featured: editingService.featured || false,
        is_active: editingService.is_active ?? true,
        location: editingService.location || '',
        locationData: undefined,
        price_range: editingService.price_range || '₱10,000 - ₱25,000',
        features: editingService.features || [],
        contact_info: {
          phone: editingService.contact_info?.phone || '',
          email: editingService.contact_info?.email || '',
          website: editingService.contact_info?.website || ''
        },
        tags: editingService.tags || [],
        keywords: editingService.keywords || '',
        // DSS fields
        years_in_business: editingService.years_in_business?.toString() || '',
        service_tier: editingService.service_tier || 'basic',
        wedding_styles: editingService.wedding_styles || [],
        cultural_specialties: editingService.cultural_specialties || [],
        availability: typeof editingService.availability === 'string' ? {
          weekdays: true,
          weekends: true,
          holidays: false,
          seasons: []
        } : {
          weekdays: editingService.availability?.weekdays ?? true,
          weekends: editingService.availability?.weekends ?? true,
          holidays: editingService.availability?.holidays ?? false,
          seasons: editingService.availability?.seasons || []
        },
        // Category-specific fields
        venue_capacity: {
          min: editingService.venue_capacity?.min?.toString() || '',
          max: editingService.venue_capacity?.max?.toString() || ''
        },
        catering_options: {
          cuisine_types: editingService.catering_options?.cuisine_types || [],
          dietary_accommodations: editingService.catering_options?.dietary_accommodations || [],
          service_style: editingService.catering_options?.service_style || []
        },
        photography_style: editingService.photography_style || [],
        music_genres: editingService.music_genres || [],
        equipment_included: editingService.equipment_included || [],
        certifications: editingService.certifications || [],
        insurance: editingService.insurance || false,
        cancellation_policy: editingService.cancellation_policy || '',
        portfolio_url: editingService.portfolio_url || '',
        video_url: editingService.video_url || ''
      });
    } else {
      // ✅ Clear packages for new service
      console.log('🆕 [AddServiceForm] Creating new service - clearing packages');
      setPackages([]);
      window.__tempPackageData = { packages: [], addons: [], pricingRules: [] };
      
      // Auto-populate contact info from vendor profile
      const contactInfo = {
        phone: vendorProfile?.phone || vendorProfile?.contact_phone || '',
        email: vendorProfile?.email || vendorProfile?.contact_email || '',
        website: vendorProfile?.website || vendorProfile?.website_url || vendorProfile?.contact_website || ''
      };
      
      console.log('📞 Auto-populating contact info from vendor profile:', contactInfo);
      
      // Reset form for new service with vendor profile contact info
      setFormData({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        price: '',
        max_price: '',
        images: [],
        featured: false,
        is_active: true,
        location: '',
        locationData: undefined,
        price_range: '₱10,000 - ₱25,000',
        features: [],
        contact_info: contactInfo,
        tags: [],
        keywords: '',
        // DSS fields
        years_in_business: vendorProfile?.years_experience?.toString() || vendorProfile?.yearsInBusiness?.toString() || '0', // ✅ FIXED: Use years_experience from vendor profile
        service_tier: 'basic',
        wedding_styles: [],
        cultural_specialties: [],
        availability: {
          weekdays: true,
          weekends: true,
          holidays: false,
          seasons: []
        },
        // Category-specific fields
        venue_capacity: {
          min: '',
          max: ''
        },
        catering_options: {
          cuisine_types: [],
          dietary_accommodations: [],
          service_style: []
        },
        photography_style: [],
        music_genres: [],
        equipment_included: [],
        certifications: [],
        insurance: false,
        cancellation_policy: '',
        portfolio_url: '',
        video_url: ''
      });
    }
    setCurrentStep(1);
    setErrors({});
  }, [editingService, isOpen, vendorProfile]);

  // Validation functions
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Service name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.location.trim()) newErrors.location = 'Service location is required';
        break;
      case 2:
        // No validation needed - packages define all pricing
        break;
      case 3:
        // Step 3 is now Service Items & Equipment - no validation needed
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Show confirmation modal instead of direct submit
  const handleShowConfirmation = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    // Basic validation before showing confirmation
    if (!formData.title.trim()) {
      setErrors({ title: 'Service name is required' });
      setCurrentStep(1);
      return;
    }
    
    if (!formData.category) {
      setErrors({ category: 'Category is required' });
      setCurrentStep(1);
      return;
    }

    if (!formData.description.trim()) {
      setErrors({ description: 'Description is required' });
      setCurrentStep(1);
      return;
    }

    // Show confirmation modal
    setShowConfirmation(true);
  };

  // Handle form submission (called after confirmation)
  const handleSubmit = async () => {
    
    // Prevent multiple submissions
    if (isLoading || isUploading || isSubmitting) {
      console.log('🚫 [AddServiceForm] Submission blocked - already processing', {
        isLoading,
        isUploading,
        isSubmitting
      });
      return;
    }
    
    // Basic validation
    if (!formData.title.trim()) {
      setErrors({ title: 'Service name is required' });
      setCurrentStep(1);
      return;
    }
    
    if (!formData.category) {
      setErrors({ category: 'Category is required' });
      setCurrentStep(1);
      return;
    }

    if (!formData.description.trim()) {
      setErrors({ description: 'Description is required' });
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🚀 [AddServiceForm] Starting form submission...');
      
      const serviceData = {
        vendor_id: vendorId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        // Pricing now 100% defined by packages (min/max auto-calculated from package prices)
        price_range: null,
        price: null,
        max_price: null,
        images: formData.images.length > 0 ? formData.images : [],
        features: formData.features.filter(f => f.trim()),
        is_active: formData.is_active,
        featured: formData.featured,
        location: formData.location.trim(),
        contact_info: formData.contact_info,
        tags: formData.tags.filter(t => t.trim()),
        keywords: formData.keywords.trim(),
        // DSS Fields - Step 4
        years_in_business: formData.years_in_business ? parseInt(formData.years_in_business) : null,
        service_tier: formData.service_tier,
        wedding_styles: formData.wedding_styles.length > 0 ? formData.wedding_styles : null,
        cultural_specialties: formData.cultural_specialties.length > 0 ? formData.cultural_specialties : null,
        availability: typeof formData.availability === 'object' 
          ? JSON.stringify(formData.availability)
          : formData.availability,
        // ✅ NEW: Itemization data from PricingModeSelector and PackageBuilder components
        // These will be populated if the user creates packages/add-ons in the pricing step
        packages: window.__tempPackageData?.packages || [],
        addons: window.__tempPackageData?.addons || [],
        pricingRules: window.__tempPackageData?.pricingRules || []
      };
      
      console.log('📦 [AddServiceForm] Itemization data included:', {
        packages: serviceData.packages.length,
        addons: serviceData.addons.length,
        pricingRules: serviceData.pricingRules.length
      });

      // 🔍 DETAILED LOGGING: Inspect package items structure being sent to backend
      console.log('🔍 [ITEMIZED PRICE DEBUG] Full packages array being sent to backend:');
      serviceData.packages.forEach((pkg: any, idx: number) => {
        console.log(`  Package ${idx + 1}:`, {
          name: pkg.name,
          price: pkg.price,
          tier: pkg.tier,
          itemCount: pkg.items?.length || 0
        });
        
        if (pkg.items && pkg.items.length > 0) {
          console.log(`  Items in package "${pkg.name}":`);
          pkg.items.forEach((item: any, itemIdx: number) => {
            console.log(`    Item ${itemIdx + 1}:`, {
              name: item.name,
              unit_price: item.unit_price,
              unitPrice: item.unitPrice,
              price: item.price,
              item_price: item.item_price,
              quantity: item.quantity,
              unit: item.unit,
              description: item.description,
              ALL_KEYS: Object.keys(item)
            });
          });
        }
      });

      console.log('📤 [AddServiceForm] Calling onSubmit with data:', serviceData);
      await onSubmit(serviceData);
      console.log('✅ [AddServiceForm] Form submission completed successfully');
      
      // Close confirmation modal and main form after successful submission
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error('❌ [AddServiceForm] Error submitting service:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save service. Please try again.';
      setErrors({ submit: errorMessage });
      console.error('❌ [AddServiceForm] Full error details:', {
        message: errorMessage,
        error: error,
        formData: formData.title
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload (real Cloudinary upload)
  const handleImageUpload = async (files: FileList | null, isMain = false) => {
    if (!files) return;
    
    setIsUploading(true);
    
    try {
      const { cloudinaryService } = await import('../../../../../services/cloudinaryService');
      
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          console.log('📤 [AddServiceForm] Uploading image:', file.name, 'Size:', file.size);
          const result = await cloudinaryService.uploadImage(file, 'vendor-services');
          console.log('✅ [AddServiceForm] Image uploaded successfully:', result.secure_url);
          return result.secure_url;
        } catch (error) {
          console.error('❌ [AddServiceForm] Failed to upload image:', file.name, error);
          throw error; // Don't fall back to placeholder, let user know it failed
        }
      });
      
      const newImages = await Promise.all(uploadPromises);
      
      // Only add images if they were successfully uploaded
      if (newImages.length > 0) {
        if (isMain) {
          setFormData(prev => ({ ...prev, images: [newImages[0], ...prev.images.slice(1)] }));
        } else {
          setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
        }
        
        console.log('✅ [AddServiceForm] Images added to form:', newImages.length);
      }
      
    } catch (error) {
      console.error('❌ [AddServiceForm] Image upload failed:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      showError(
        `${errorMessage}\n\nPlease try again or check your internet connection.`,
        '❌ Image Upload Failed'
      );
      
      // Don't add placeholder images - let user retry
    } finally {
      setIsUploading(false);
    }
  };

  // Helper functions
  // Helper functions still in use
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

  // Step navigation with scroll to top
  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Scroll to top of form content
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top of form content
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Helper: package stats and formatting
  const getPackagesData = () => {
    try {
      return (window.__tempPackageData?.packages && window.__tempPackageData.packages.length > 0)
        ? window.__tempPackageData.packages
        : packages || [];
    } catch (err) {
      return packages || [];
    }
  };

  const getPackageStats = () => {
    const pkgs = getPackagesData();
    if (!pkgs || pkgs.length === 0) return { min: 0, max: 0, total: 0 };
    const prices = pkgs.map((p: any) => Number(p.price || 0));
    const total = prices.reduce((a: number, b: number) => a + b, 0);
    return { min: Math.min(...prices), max: Math.max(...prices), total };
  };

  const formatCurrency = (value: number) => {
    try {
      return `₱${value.toLocaleString()}`;
    } catch (err) {
      return `₱${value}`;
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
          className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
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
          <div className="flex flex-col flex-1 min-h-0">
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6">
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

                    <div className="space-y-8">
                      {/* Service Name */}
                      <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-100">
                        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-rose-600" />
                          Service Name *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-lg ${
                            errors.title ? 'border-red-300 bg-red-50' : 'border-white bg-white/70 backdrop-blur-sm'
                          }`}
                          placeholder="e.g., Elegant Wedding Photography Package"
                        />
                        {errors.title && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded-lg">
                            <AlertCircle size={14} />
                            {errors.title}
                          </p>
                        )}
                      </div>

                      {/* Category - Dynamic from Database */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Tag className="h-5 w-5 text-blue-600" />
                          Service Category *
                        </label>
                        <p className="text-sm text-gray-600 mb-4">
                          {loadingCategories ? '⏳ Loading categories...' : 'Choose the category that best describes your wedding service'}
                        </p>
                        <select
                          value={formData.category}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, category: e.target.value, subcategory: '' }));
                          }}
                          title="Select service category"
                          disabled={loadingCategories}
                          className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg ${
                            errors.category ? 'border-red-300 bg-red-50' : 'border-white bg-white/70 backdrop-blur-sm'
                          } ${loadingCategories ? 'opacity-50 cursor-wait' : ''}`}
                        >
                          <option value="">{loadingCategories ? 'Loading...' : 'Select a category'}</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>
                              {cat.display_name}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded-lg">
                            <AlertCircle size={14} />
                            {errors.category}
                          </p>
                        )}
                        {categories.length > 0 ? (
                          <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            ✅ Loaded {categories.length} categories from API
                          </p>
                        ) : !loadingCategories && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded-lg">
                            <AlertCircle size={14} />
                            ❌ Failed to load categories from database. Please refresh the page.
                          </p>
                        )}
                      </div>

                      {/* Subcategory - Dynamic based on selected category */}
                      {formData.category && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                          <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Tag className="h-5 w-5 text-indigo-600" />
                            Subcategory (Optional)
                          </label>
                          <p className="text-sm text-gray-600 mb-4">
                            Narrow down your service type for better matching
                          </p>
                          <select
                            value={formData.subcategory || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                            title="Select subcategory"
                            className="w-full px-5 py-4 border-2 border-white bg-white/70 backdrop-blur-sm rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg"
                          >
                            <option value="">Select a subcategory (optional)</option>
                            {(() => {
                              const selectedCategory = categories.find(cat => cat.name === formData.category);
                              if (selectedCategory && selectedCategory.subcategories.length > 0) {
                                return selectedCategory.subcategories.map(sub => (
                                  <option key={sub.id} value={sub.name}>
                                    {sub.display_name}
                                  </option>
                                ));
                              }
                              return null;
                            })()}
                          </select>
                          {(() => {
                            const selectedCategory = categories.find(cat => cat.name === formData.category);
                            const subCount = selectedCategory?.subcategories.length || 0;
                            if (subCount > 0) {
                              return (
                                <p className="mt-2 text-xs text-indigo-600 flex items-center gap-1">
                                  <CheckCircle2 size={12} />
                                  {subCount} subcategories available
                                </p>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}

                      {/* Location with Leaflet Map - Full Width Section */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-green-600" />
                          Service Location *
                        </label>
                        <p className="text-sm text-gray-600 mb-6 bg-white/50 p-3 rounded-lg border border-green-200">
                          📍 <strong>Interactive Location Selection:</strong> Click on the map or search for your service location. 
                          This helps clients find you and enables distance-based searches.
                        </p>
                        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white">
                          <LocationPicker
                            value={formData.location}
                            onChange={(location, locationData) => {
                              setFormData(prev => ({
                                ...prev,
                                location,
                                locationData
                              }));
                            }}
                            placeholder="🔍 Search location (e.g., Dasmariñas, Cavite)"
                            className="w-full"
                          />
                        </div>
                        {errors.location && (
                          <p className="mt-3 text-sm text-red-600 flex items-center gap-1 bg-red-50 p-3 rounded-lg border border-red-200">
                            <AlertCircle size={16} />
                            {errors.location}
                          </p>
                        )}
                        {formData.locationData?.lat && formData.locationData?.lng && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-300 backdrop-blur-sm">
                            <div className="flex items-center gap-3 text-green-800 mb-2">
                              <div className="p-2 bg-green-600 text-white rounded-full">
                                <MapPin className="h-4 w-4" />
                              </div>
                              <span className="text-lg font-semibold">Location Confirmed! ✅</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="bg-white/70 p-3 rounded-lg">
                                <div className="text-green-700 font-medium">📍 Coordinates</div>
                                <div className="text-green-800 font-mono">
                                  {formData.locationData.lat.toFixed(6)}, {formData.locationData.lng.toFixed(6)}
                                </div>
                              </div>
                              {formData.locationData.city && formData.locationData.state && (
                                <div className="bg-white/70 p-3 rounded-lg">
                                  <div className="text-green-700 font-medium">🏙️ Location Details</div>
                                  <div className="text-green-800">
                                    {formData.locationData.city}, {formData.locationData.state}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <div className="p-1 bg-purple-600 text-white rounded-full">
                            <span className="text-sm">📝</span>
                          </div>
                          Service Description *
                        </label>
                        <p className="text-sm text-gray-600 mb-4 bg-white/50 p-3 rounded-lg border border-purple-200">
                          ✨ Tell your story! Describe what makes your service
                        </p>
                        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white">
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-base resize-none ${
                              errors.description ? 'border-red-300 bg-red-50' : 'border-transparent bg-transparent'
                            }`}
                            rows={6}
                            placeholder="📖 Describe your service in detail...

• What makes your service unique?
• What's included in your packages?
• What experience can couples expect?
• Why should they choose you?

Example: 'Our wedding photography captures the authentic emotions and intimate moments of your special day. We provide 8 hours of coverage, 500+ edited photos, online gallery, and complimentary engagement session...'"
                          />
                        </div>
                        {errors.description && (
                          <p className="mt-3 text-sm text-red-600 flex items-center gap-1 bg-red-50 p-3 rounded-lg border border-red-200">
                            <AlertCircle size={16} />
                            {errors.description}
                          </p>
                        )}
                        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                          <span>💡</span>
                          <span>Tip: A detailed description helps couples understand the value you provide</span>
                        </div>
                      </div>
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
                      <p className="text-gray-600">Choose your pricing structure and set availability</p>
                    </div>

                    <div className="space-y-8">
                      {/* ✅ Pricing Mode Selector */}
                      <PricingModeSelector
                        value={pricingMode}
                        onChange={(mode) => {
                          console.log('🎯 [AddServiceForm] Pricing mode changed to:', mode);
                          setPricingMode(mode);
                        }}
                        category={formData.category}
                      />

                      {/* DEBUG: Show current pricing mode */}
                      <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-lg text-sm">
                        <strong>🐛 DEBUG:</strong> Current pricingMode = <code className="bg-yellow-200 px-2 py-1 rounded">{pricingMode}</code>
                      </div>

                      {/* ✅ PACKAGE BUILDER - Packages define exact pricing with min/max auto-calculated */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                      <div className="mb-6">
                        <h4 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          📦 Package Builder
                          <span className="text-sm font-normal text-gray-600">(Required)</span>
                        </h4>
                        <p className="text-gray-600 text-sm">
                          Create detailed itemized packages with automatic price calculation. 
                          Your package prices will determine the min/max pricing for this service.
                        </p>
                      </div>
                      <PackageBuilder
                        packages={packages}
                        onChange={(pkgs: PackageBuilderItem[]) => {
                          console.log('📦 [AddServiceForm] Package data updated:', pkgs.length, 'packages');
                          setPackages(pkgs);
                        }}
                        category={formData.category}
                      />                      </div>

                      {/* Service Options */}
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="p-1 bg-yellow-600 text-white rounded-full text-sm">⚙️</span>
                        Service Options
                      </h4>
                      <p className="text-sm text-gray-600 mb-6 bg-white/50 p-3 rounded-lg border border-yellow-200">
                        🎯 Configure how your service appears and functions on the platform
                      </p>
                      
                      <div className="space-y-4">
                        <div className={`p-5 rounded-xl border-2 transition-all ${
                          formData.featured 
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400 shadow-lg' 
                            : 'bg-white/70 border-white hover:border-yellow-300'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-full ${
                                formData.featured ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-400'
                              }`}>
                                <Star className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-lg">Featured Service</p>
                                <p className="text-sm text-gray-600">⭐ Highlight this service in search results and get more visibility</p>
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
                              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 shadow-lg"></div>
                            </label>
                          </div>
                        </div>

                        <div className={`p-5 rounded-xl border-2 transition-all ${
                          formData.is_active 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400 shadow-lg' 
                            : 'bg-white/70 border-white hover:border-green-300'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-full ${
                                formData.is_active ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                              }`}>
                                <CheckCircle2 className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-lg">Available for Booking</p>
                                <p className="text-sm text-gray-600">✅ Allow clients to book this service and send inquiries</p>
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
                              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 shadow-lg"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: DSS Details (Dynamic Service System) - RENUMBERED FROM STEP 4 */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                        <Sparkles className="h-6 w-6 text-rose-600" />
                        Service Details & Experience
                      </h3>
                      <p className="text-gray-600">Tell us about your expertise and service offerings</p>
                    </div>

                    <div className="space-y-8">
                      {/* Years in Business - AUTO-FILLED FROM VENDOR PROFILE (READ-ONLY) */}
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Star className="h-5 w-5 text-purple-600" />
                          Years in Business
                          <span className="text-xs font-normal text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                            From Profile
                          </span>
                        </label>
                        <p className="text-sm text-gray-600 mb-4 bg-white/50 p-3 rounded-lg border border-purple-200">
                          ⭐ This is auto-filled from your vendor profile. To update, go to your Profile settings.
                        </p>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.years_in_business}
                            readOnly
                            disabled
                            className="w-full px-5 py-4 border-2 border-purple-200 bg-gray-100 rounded-xl text-lg font-semibold text-gray-700 cursor-not-allowed"
                            placeholder="0"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 font-medium">
                            {formData.years_in_business || '0'} {parseInt(formData.years_in_business || '0') === 1 ? 'year' : 'years'}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Update this in your <span className="font-semibold text-purple-600">Vendor Profile</span> to change it here
                        </p>
                      </div>

                      {/* Wedding Styles - Enhanced with validation and tooltips */}
                      <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-100">
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-rose-600" />
                            <span className="text-lg font-semibold text-gray-800">Wedding Styles You Specialize In</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({formData.wedding_styles.length} selected)
                            </span>
                          </label>
                          {formData.wedding_styles.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, wedding_styles: [] }))}
                              className="text-xs text-rose-600 hover:text-rose-700 underline"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                        
                        <div className="mb-4 space-y-2">
                          <div className="flex items-start gap-2 text-sm text-gray-600 bg-white/50 p-3 rounded-lg border border-rose-200">
                            <span>💐</span>
                            <p>Select all wedding styles you're experienced with. This helps couples find vendors who match their wedding vision.</p>
                          </div>
                          
                          {formData.wedding_styles.length === 0 && (
                            <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <p>Recommended: Select at least 2-3 wedding styles to show your versatility to potential clients.</p>
                            </div>
                          )}
                          
                          {formData.wedding_styles.length >= 4 && (
                            <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <p>Excellent! Your versatility in wedding styles will attract diverse couples.</p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { 
                              value: 'Traditional', 
                              icon: '👰',
                              tooltip: 'Classic, formal weddings with timeless elegance and traditional ceremonies'
                            },
                            { 
                              value: 'Modern', 
                              icon: '✨',
                              tooltip: 'Contemporary weddings with clean lines, minimalist decor, and innovative concepts'
                            },
                            { 
                              value: 'Rustic', 
                              icon: '🌾',
                              tooltip: 'Country-inspired weddings with natural elements, barn venues, and earthy tones'
                            },
                            { 
                              value: 'Beach', 
                              icon: '🏖️',
                              tooltip: 'Seaside ceremonies with nautical themes, sandy shores, and ocean views'
                            },
                            { 
                              value: 'Garden', 
                              icon: '🌸',
                              tooltip: 'Outdoor weddings surrounded by flowers, greenery, and natural beauty'
                            },
                            { 
                              value: 'Vintage', 
                              icon: '🕰️',
                              tooltip: 'Retro-inspired weddings with antique decor, classic fashion, and nostalgic elements'
                            },
                            { 
                              value: 'Bohemian', 
                              icon: '🌼',
                              tooltip: 'Free-spirited weddings with eclectic decor, relaxed vibes, and artistic touches'
                            },
                            { 
                              value: 'Luxury', 
                              icon: '💎',
                              tooltip: 'Opulent celebrations with premium services, lavish decor, and extravagant details'
                            },
                            { 
                              value: 'Minimalist', 
                              icon: '⚪',
                              tooltip: 'Simple, elegant weddings focused on essential elements and sophisticated simplicity'
                            }
                          ].map((style) => (
                            <label 
                              key={style.value} 
                              className="relative cursor-pointer group"
                              title={style.tooltip}
                            >
                              <input
                                type="checkbox"
                                checked={formData.wedding_styles.includes(style.value)}
                                onChange={(e) => {
                                  const styles = e.target.checked
                                    ? [...formData.wedding_styles, style.value]
                                    : formData.wedding_styles.filter(s => s !== style.value);
                                  setFormData(prev => ({ ...prev, wedding_styles: styles }));
                                  
                                  // Enhanced analytics tracking
                                  analytics.trackWeddingStyle({
                                    style: style.value,
                                    action: e.target.checked ? 'added' : 'removed',
                                    totalSelected: styles.length,
                                    serviceCategory: formData.category,
                                  });
                                }}
                                className="sr-only"
                                aria-label={`${style.value} - ${style.tooltip}`}
                              />
                              <div className={`p-4 rounded-xl border-2 transition-all relative ${
                                formData.wedding_styles.includes(style.value)
                                  ? 'border-rose-500 bg-rose-50 shadow-lg scale-[1.02]'
                                  : 'border-gray-200 bg-white/80 hover:border-rose-300 hover:shadow-md'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{style.icon}</span>
                                  <span className="text-sm font-medium text-gray-900">{style.value}</span>
                                </div>
                                {formData.wedding_styles.includes(style.value) && (
                                  <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-rose-600" />
                                )}
                                
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal w-48 text-center z-10">
                                  {style.tooltip}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Cultural Specialties - Enhanced with validation and tooltips */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-indigo-600" />
                            <span className="text-lg font-semibold text-gray-800">Cultural Specialties</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({formData.cultural_specialties.length} selected)
                            </span>
                          </label>
                          {formData.cultural_specialties.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, cultural_specialties: [] }))}
                              className="text-xs text-indigo-600 hover:text-indigo-700 underline"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                        
                        <div className="mb-4 space-y-2">
                          <div className="flex items-start gap-2 text-sm text-gray-600 bg-white/50 p-3 rounded-lg border border-indigo-200">
                            <span>🌏</span>
                            <p>Select cultural wedding traditions you're experienced with. This helps couples find vendors who understand their cultural requirements.</p>
                          </div>
                          
                          {formData.cultural_specialties.length === 0 && (
                            <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <p>Recommended: Select at least one cultural specialty to increase your visibility to couples planning traditional or cultural weddings.</p>
                            </div>
                          )}
                          
                          {formData.cultural_specialties.length >= 5 && (
                            <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <p>Great! Your diverse cultural expertise will appeal to a wide range of couples.</p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { 
                              value: 'Filipino', 
                              icon: '🇵🇭',
                              tooltip: 'Traditional Filipino weddings with barong, sponsors, and cultural ceremonies'
                            },
                            { 
                              value: 'Chinese', 
                              icon: '🇨🇳',
                              tooltip: 'Chinese tea ceremonies, red decorations, and traditional customs'
                            },
                            { 
                              value: 'Indian', 
                              icon: '🇮🇳',
                              tooltip: 'Hindu, Sikh, or Muslim Indian weddings with vibrant colors and multiple-day celebrations'
                            },
                            { 
                              value: 'Korean', 
                              icon: '🇰🇷',
                              tooltip: 'Korean Pyebaek ceremony, hanbok attire, and traditional rituals'
                            },
                            { 
                              value: 'Japanese', 
                              icon: '🇯🇵',
                              tooltip: 'Shinto ceremonies, kimono attire, and sake sharing traditions'
                            },
                            { 
                              value: 'Western', 
                              icon: '🇺🇸',
                              tooltip: 'Traditional Western church or garden weddings with classic ceremonies'
                            },
                            { 
                              value: 'Catholic', 
                              icon: '⛪',
                              tooltip: 'Catholic church weddings with full mass and religious traditions'
                            },
                            { 
                              value: 'Muslim', 
                              icon: '🕌',
                              tooltip: 'Islamic Nikah ceremonies with separate celebrations and halal requirements'
                            },
                            { 
                              value: 'Multi-cultural', 
                              icon: '🌍',
                              tooltip: 'Fusion weddings blending multiple cultural traditions and customs'
                            }
                          ].map((specialty) => (
                            <label 
                              key={specialty.value} 
                              className="relative cursor-pointer group"
                              title={specialty.tooltip}
                            >
                              <input
                                type="checkbox"
                                checked={formData.cultural_specialties.includes(specialty.value)}
                                onChange={(e) => {
                                  const specialties = e.target.checked
                                    ? [...formData.cultural_specialties, specialty.value]
                                    : formData.cultural_specialties.filter(s => s !== specialty.value);
                                  setFormData(prev => ({ ...prev, cultural_specialties: specialties }));
                                  
                                  // Enhanced analytics tracking
                                  analytics.trackCulturalSpecialty({
                                    specialty: specialty.value,
                                    action: e.target.checked ? 'added' : 'removed',
                                    totalSelected: specialties.length,
                                    serviceCategory: formData.category,
                                  });
                                }}
                                className="sr-only"
                                aria-label={`${specialty.value} - ${specialty.tooltip}`}
                              />
                              <div className={`p-4 rounded-xl border-2 transition-all relative ${
                                formData.cultural_specialties.includes(specialty.value)
                                  ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-[1.02]'
                                  : 'border-gray-200 bg-white/80 hover:border-indigo-300 hover:shadow-md'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{specialty.icon}</span>
                                  <span className="text-sm font-medium text-gray-900">{specialty.value}</span>
                                </div>
                                {formData.cultural_specialties.includes(specialty.value) && (
                                  <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-indigo-600" />
                                )}
                                
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal w-48 text-center z-10">
                                  {specialty.tooltip}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Availability Preferences */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          Availability Preferences
                        </label>
                        <p className="text-sm text-gray-600 mb-4 bg-white/50 p-3 rounded-lg border border-green-200">
                          📅 When are you typically available to provide services?
                        </p>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-4 bg-white/70 rounded-xl hover:bg-white transition-colors cursor-pointer border border-white">
                            <input
                              type="checkbox"
                              checked={formData.availability.weekdays}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                availability: { ...prev.availability, weekdays: e.target.checked }
                              }))}
                              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">Weekdays (Monday - Friday)</div>
                              <div className="text-sm text-gray-600">Available for weekday events</div>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-4 bg-white/70 rounded-xl hover:bg-white transition-colors cursor-pointer border border-white">
                            <input
                              type="checkbox"
                              checked={formData.availability.weekends}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                availability: { ...prev.availability, weekends: e.target.checked }
                              }))}
                              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">Weekends (Saturday - Sunday)</div>
                              <div className="text-sm text-gray-600">Available for weekend celebrations</div>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-4 bg-white/70 rounded-xl hover:bg-white transition-colors cursor-pointer border border-white">
                            <input
                              type="checkbox"
                              checked={formData.availability.holidays}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                availability: { ...prev.availability, holidays: e.target.checked }
                              }))}
                              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">Holidays & Special Dates</div>
                              <div className="text-sm text-gray-600">Available during holidays and special occasions</div>
                            </div>
                          </label>
                        </div>

                        {/* Manage Full Calendar Button */}
                        <div className="mt-6 pt-6 border-t border-green-200">
                          <button
                            type="button"
                            onClick={() => setShowCalendar(true)}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                          >
                            <Calendar className="h-5 w-5" />
                            📅 Manage Full Availability Calendar
                          </button>
                          <p className="text-xs text-gray-600 text-center mt-2">
                            Block specific dates (vacations, holidays, already booked dates)
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Images & Tags - RENUMBERED FROM STEP 5 */}
                {currentStep === 4 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4 pb-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Images & Tags</h3>
                      <p className="text-gray-600">Showcase your work with beautiful images</p>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Service Images
                      </h4>
                      
                      {/* Main Image Upload */}
                      <div
                        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
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
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-base font-medium text-gray-700">Upload service images</p>
                              <p className="text-sm text-gray-500">Drag & drop or click to select</p>
                              <p className="text-xs text-gray-400">PNG, JPG up to 10MB each</p>
                            </>
                          )}
                        </label>
                      </div>

                      {/* Image Preview */}
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Service image ${index + 1}`}
                                className="w-full h-16 object-cover rounded-lg border border-gray-200"
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
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Search Tags
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-2">
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
                      </div>                        <input
                          type="text"
                          placeholder="Add tags (press Enter)"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
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

                {/* Step 5: Category-Specific Fields (Dynamic) - RENUMBERED FROM STEP 6 */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {formData.category ? `${categories.find(c => c.name === formData.category)?.display_name || formData.category} Details` : 'Category-Specific Details'}
                      </h3>
                      <p className="text-gray-600">
                        {loadingFields ? 'Loading fields...' : categoryFields.length > 0 ? 'Provide specific details for your service category' : 'No additional fields required for this category'}
                      </p>
                    </div>

                    {loadingFields ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600">Loading category-specific fields...</p>
                      </div>
                    ) : categoryFields.length > 0 ? (
                      <div className="space-y-6">
                        {categoryFields.map((field) => (
                          <div key={field.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                              {field.field_label}
                              {field.is_required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {field.help_text && (
                              <p className="text-sm text-gray-600 mb-4 bg-white/50 p-3 rounded-lg">
                                💡 {field.help_text}
                              </p>
                            )}

                            {/* Render field based on type */}
                            {field.field_type === 'text' && (
                              <input
                                type="text"
                                className="w-full px-5 py-4 border-2 border-white bg-white/70 backdrop-blur-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
                                placeholder={field.help_text || `Enter ${field.field_label.toLowerCase()}`}
                              />
                            )}

                            {field.field_type === 'textarea' && (
                              <textarea
                                className="w-full px-5 py-4 border-2 border-white bg-white/70 backdrop-blur-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base resize-none"
                                rows={4}
                                placeholder={field.help_text || `Enter ${field.field_label.toLowerCase()}`}
                              />
                            )}



                            {field.field_type === 'number' && (
                              <input
                                type="number"
                                className="w-full px-5 py-4 border-2 border-white bg-white/70 backdrop-blur-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
                                placeholder={field.help_text || `Enter ${field.field_label.toLowerCase()}`}
                              />
                            )}

                            {field.field_type === 'select' && field.options.length > 0 && (
                              <select
                                title={field.field_label}
                                className="w-full px-5 py-4 border-2 border-white bg-white/70 backdrop-blur-sm rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
                              >
                                <option value="">Select an option</option>
                                {field.options.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )}

                            {field.field_type === 'multiselect' && field.options.length > 0 && (
                              <div className="space-y-2">
                                {field.options.map((option) => (
                                  <label key={option.value} className="flex items-center gap-3 p-3 bg-white/70 rounded-lg hover:bg-white transition-colors cursor-pointer">
                                    <input
                                      type="checkbox"
                                      value={option.value}
                                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div>
                                      <div className="font-medium text-gray-900">{option.label}</div>
                                      {option.description && (
                                        <div className="text-sm text-gray-600">{option.description}</div>
                                      )}
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}

                            {field.field_type === 'checkbox' && (
                              <label className="flex items-center gap-3 p-4 bg-white/70 rounded-lg hover:bg-white transition-colors cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-gray-700">{field.help_text || field.field_label}</span>
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">All Set!</h4>
                        <p className="text-gray-600">
                          {formData.category 
                            ? 'No additional category-specific fields required for this service type.'
                            : 'Select a category to see if additional fields are needed.'}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className="px-6 py-3 bg-red-50 border-t border-red-200">
                <div className="text-red-700 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.submit}
                </div>
              </div>
            )}

            {/* Footer with Navigation */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
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
                    type="button"
                    onClick={handleShowConfirmation}
                    disabled={isLoading || isUploading || isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {editingService ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {editingService ? 'Update Service' : 'Create Service'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Availability Calendar Modal */}
      {showCalendar && (
        <AvailabilityCalendar
          vendorId={parseInt(vendorId)}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setShowConfirmation(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold">Confirm Service Details</div>
                  <div className="text-sm opacity-80">Review everything before publishing</div>
                </div>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title="Close confirmation"
                  aria-label="Close confirmation modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Title & Category */}
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                    {formData.images && formData.images[0] ? (
                      <img src={formData.images[0]} alt={formData.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{formData.title}</h3>
                    <p className="text-sm text-gray-600">{formData.category}{formData.subcategory ? ` • ${formData.subcategory}` : ''}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {formData.featured && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-medium">Featured</span>
                      )}
                      {!formData.is_active && (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 font-medium">Not active</span>
                      )}
                      <span className="text-sm text-gray-500">Tier: {formData.service_tier}</span>
                    </div>
                    <p className="mt-3 text-gray-700 text-sm">{formData.description}</p>
                  </div>
                </div>

                {/* Images Gallery */}
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {formData.images.map((src, i) => (
                      <div key={i} className="w-full h-20 bg-gray-50 rounded-lg overflow-hidden border">
                        <img src={src} className="w-full h-full object-cover" alt={`image-${i}`} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Location & Contact */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900 mt-1">{formData.location || 'Not specified'}</p>
                    {formData.locationData?.city && (
                      <p className="text-sm text-gray-500">{formData.locationData.city}{formData.locationData.state ? `, ${formData.locationData.state}` : ''}</p>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded-xl border">
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="font-semibold text-gray-900 mt-1">{formData.contact_info?.phone || '—'}</p>
                    <p className="text-sm text-gray-600">{formData.contact_info?.email || '—'}</p>
                    {formData.contact_info?.website && (
                      <a href={formData.contact_info.website} className="text-sm text-rose-600 underline mt-1 block" target="_blank" rel="noreferrer">Visit website</a>
                    )}
                  </div>
                </div>

                {/* Packages Summary */}
                <div className="bg-white p-4 rounded-xl border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Packages & Itemization</h4>
                    <div className="text-sm text-gray-500">{getPackagesData().length} package(s)</div>
                  </div>

                  {getPackagesData().length === 0 ? (
                    <div className="text-sm text-gray-600">No packages created. PackageBuilder will be required to define pricing.</div>
                  ) : (
                    <div className="space-y-3">
                      {getPackagesData().map((pkg: any, idx: number) => {
                        const isExpanded = expandedPackages[idx] ?? true; // Default expanded
                        const hasItems = pkg.items && pkg.items.length > 0;
                        const toggleExpand = () => {
                          setExpandedPackages(prev => ({ ...prev, [idx]: !isExpanded }));
                        };

                        return (
                          <div key={pkg.id || idx} className="p-3 rounded-lg border bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="font-semibold text-gray-900">{pkg.name || pkg.item_name}</div>
                                  {pkg.tier && <div className="text-xs text-gray-500">Tier: {pkg.tier}</div>}
                                </div>
                                {hasItems && (
                                  <button
                                    onClick={toggleExpand}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    title={isExpanded ? 'Collapse items' : 'Expand items'}
                                    aria-label={isExpanded ? 'Collapse items' : 'Expand items'}
                                  >
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </button>
                                )}
                              </div>
                              <div className="font-semibold text-gray-900">{formatCurrency(Number(pkg.price || 0))}</div>
                            </div>

                            {hasItems && isExpanded && (
                              <div className="mt-3 grid gap-2 pl-2 border-l-2 border-rose-200">
                                {pkg.items.map((it: any, i: number) => {
                                  // Try multiple possible field names for price
                                  const unitPrice = it.unit_price || it.unitPrice || it.price || it.item_price || 0;
                                  const qty = it.quantity || it.qty || 1;
                                  const unitName = it.unit || 'item';
                                  const lineTotal = qty * unitPrice;
                                  
                                  return (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                      <div>
                                        <div className="font-medium">{it.name || it.item_name}</div>
                                        <div className="text-xs text-gray-500">{it.description || ''}</div>
                                      </div>
                                      <div className="text-right text-sm text-gray-700">
                                        <div>{qty} {unitName} × {formatCurrency(unitPrice)}</div>
                                        <div className="font-medium">{formatCurrency(lineTotal)}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Pricing summary */}
                      <div className="mt-3 p-3 rounded-lg bg-white border">
                        <div className="flex items-center justify-between text-sm text-gray-700">
                          <div>Min Package Price</div>
                          <div>{formatCurrency(getPackageStats().min)}</div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-700 mt-2">
                          <div>Max Package Price</div>
                          <div>{formatCurrency(getPackageStats().max)}</div>
                        </div>
                        <div className="flex items-center justify-between text-sm font-semibold text-gray-900 mt-2">
                          <div>Total (sum of package prices)</div>
                          <div>{formatCurrency(getPackageStats().total)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features, Tags, and Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border">
                    <p className="text-xs text-gray-500">Features</p>
                    {formData.features && formData.features.length > 0 ? (
                      <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                        {formData.features.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">No features listed.</p>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-xl border">
                    <p className="text-xs text-gray-500">Tags & Options</p>
                    <div className="mt-2 text-sm text-gray-700">
                      {formData.tags && formData.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((t, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-xs">{t}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No tags added.</p>
                      )}

                      <div className="mt-3 text-sm">
                        <div>Availability: {formData.availability.weekdays ? 'Weekdays' : ''}{formData.availability.weekends ? ' • Weekends' : ''}</div>
                        <div>Insurance: {formData.insurance ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category-specific preview (ALL categories) */}
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <p className="text-xs text-gray-500 font-semibold mb-3">Category-Specific Details</p>
                  <div className="mt-3 text-sm text-gray-700 space-y-2">
                    {/* Photography */}
                    {formData.category === 'Photography' && (
                      <>
                        {(formData as any).photography_options?.coverage_hours && (
                          <div className="flex justify-between"><span className="text-gray-600">Coverage Hours:</span><span className="font-medium">{(formData as any).photography_options.coverage_hours}</span></div>
                        )}
                        {(formData as any).photography_options?.number_of_photographers && (
                          <div className="flex justify-between"><span className="text-gray-600">Photographers:</span><span className="font-medium">{(formData as any).photography_options.number_of_photographers}</span></div>
                        )}
                        {(formData as any).photography_options?.photo_output && (
                          <div className="flex justify-between"><span className="text-gray-600">Photo Output:</span><span className="font-medium">{(formData as any).photography_options.photo_output}</span></div>
                        )}
                        {(formData as any).photography_options?.video_output && (
                          <div className="flex justify-between"><span className="text-gray-600">Video Output:</span><span className="font-medium">{(formData as any).photography_options.video_output}</span></div>
                        )}
                        {(formData as any).photography_options?.turnaround_time && (
                          <div className="flex justify-between"><span className="text-gray-600">Turnaround Time:</span><span className="font-medium">{(formData as any).photography_options.turnaround_time}</span></div>
                        )}
                      </>
                    )}

                    {/* Catering */}
                    {formData.category === 'Catering' && (
                      <>
                        {formData.catering_options?.cuisine_types && formData.catering_options.cuisine_types.length > 0 && (
                          <div><span className="text-gray-600">Cuisines:</span> <span className="font-medium">{formData.catering_options.cuisine_types.join(', ')}</span></div>
                        )}
                        {formData.catering_options?.service_style && (
                          <div className="flex justify-between"><span className="text-gray-600">Service Style:</span><span className="font-medium">{formData.catering_options.service_style}</span></div>
                        )}
                        {(formData as any).catering_options?.guest_capacity && (
                          <div className="flex justify-between"><span className="text-gray-600">Guest Capacity:</span><span className="font-medium">{(formData as any).catering_options.guest_capacity.min} - {(formData as any).catering_options.guest_capacity.max} persons</span></div>
                        )}
                        {(formData as any).catering_options?.dietary_options && (formData as any).catering_options.dietary_options.length > 0 && (
                          <div><span className="text-gray-600">Dietary Options:</span> <span className="font-medium">{(formData as any).catering_options.dietary_options.join(', ')}</span></div>
                        )}
                      </>
                    )}

                    {/* Venue */}
                    {formData.category === 'Venue' && (
                      <>
                        {formData.venue_capacity && (formData.venue_capacity.min || formData.venue_capacity.max) && (
                          <div className="flex justify-between"><span className="text-gray-600">Capacity:</span><span className="font-medium">{formData.venue_capacity.min || '—'} - {formData.venue_capacity.max || '—'} persons</span></div>
                        )}
                        {(formData as any).venue_options?.venue_type && (
                          <div className="flex justify-between"><span className="text-gray-600">Venue Type:</span><span className="font-medium">{(formData as any).venue_options.venue_type}</span></div>
                        )}
                        {(formData as any).venue_options?.indoor_outdoor && (
                          <div className="flex justify-between"><span className="text-gray-600">Setting:</span><span className="font-medium">{(formData as any).venue_options.indoor_outdoor}</span></div>
                        )}
                        {(formData as any).venue_options?.parking_capacity && (
                          <div className="flex justify-between"><span className="text-gray-600">Parking:</span><span className="font-medium">{(formData as any).venue_options.parking_capacity} spaces</span></div>
                        )}
                      </>
                    )}

                    {/* Music/DJ */}
                    {formData.category === 'Music/DJ' && (
                      <>
                        {(formData as any).music_options?.performance_duration && (
                          <div className="flex justify-between"><span className="text-gray-600">Performance Duration:</span><span className="font-medium">{(formData as any).music_options.performance_duration}</span></div>
                        )}
                        {(formData as any).music_options?.music_genres && (formData as any).music_options.music_genres.length > 0 && (
                          <div><span className="text-gray-600">Music Genres:</span> <span className="font-medium">{(formData as any).music_options.music_genres.join(', ')}</span></div>
                        )}
                        {(formData as any).music_options?.sound_system && (
                          <div className="flex justify-between"><span className="text-gray-600">Sound System:</span><span className="font-medium">{(formData as any).music_options.sound_system}</span></div>
                        )}
                      </>
                    )}

                    {/* Flowers/Decor */}
                    {formData.category === 'Flowers/Decor' && (
                      <>
                        {(formData as any).floral_options?.arrangement_style && (
                          <div className="flex justify-between"><span className="text-gray-600">Arrangement Style:</span><span className="font-medium">{(formData as any).floral_options.arrangement_style}</span></div>
                        )}
                        {(formData as any).floral_options?.flower_types && (formData as any).floral_options.flower_types.length > 0 && (
                          <div><span className="text-gray-600">Flower Types:</span> <span className="font-medium">{(formData as any).floral_options.flower_types.join(', ')}</span></div>
                        )}
                        {(formData as any).floral_options?.setup_teardown && (
                          <div className="flex justify-between"><span className="text-gray-600">Setup/Teardown:</span><span className="font-medium">{(formData as any).floral_options.setup_teardown}</span></div>
                        )}
                      </>
                    )}

                    {/* Default fallback */}
                    {!['Photography', 'Catering', 'Venue', 'Music/DJ', 'Flowers/Decor'].includes(formData.category) && (
                      <div className="text-gray-500">No category-specific details configured.</div>
                    )}
                  </div>
                </div>

                {/* Internal notes / metadata */}
                <div className="bg-white p-4 rounded-xl border">
                  <p className="text-xs text-gray-500 font-semibold mb-3">Service Metadata</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vendor:</span>
                      <span className="font-medium">{vendorProfile?.business_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Email:</span>
                      <span className="font-medium">{vendorProfile?.contact_email || vendorProfile?.email || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Years of Service:</span>
                      <span className="font-medium">{formData.years_of_service || vendorProfile?.years_experience || 0} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Tier:</span>
                      <span className="font-medium capitalize">{formData.service_tier || 'standard'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Availability:</span>
                      <span className="font-medium">{formData.is_active ? '✅ Active & Available' : '⚠️ Not available'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Insurance Covered:</span>
                      <span className="font-medium">{formData.insurance ? '✅ Yes' : '❌ No'}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  ← Go Back & Edit
                </button>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">Estimated range:</div>
                  <div className="font-semibold text-gray-900">{formatCurrency(getPackageStats().min)} - {formatCurrency(getPackageStats().max)}</div>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {editingService ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        {editingService ? 'Confirm & Update' : 'Confirm & Publish'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        confirmText={notification.confirmText}
        showCancel={notification.showCancel}
        onConfirm={notification.onConfirm}
      />
    </AnimatePresence>
  );
};
