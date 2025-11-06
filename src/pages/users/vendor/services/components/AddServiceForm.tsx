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
  AlertTriangle,
  Camera,
  Sparkles,
  Loader2,
  Calendar
} from 'lucide-react';
import { LocationPicker } from '../../../../../shared/components/forms/LocationPicker';
import categoryService from '../../../../../services/api/categoryService';
import type { Category, CategoryField } from '../../../../../services/api/categoryService';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { analytics } from '../../../../../utils/analytics';

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

// Price range options for services
// ✨ STANDARDIZED PRICE RANGES - Aligned with customer filter categories
const PRICE_RANGES = [
  { 
    value: '₱10,000 - ₱50,000', 
    label: '💰 Budget-Friendly', 
    description: 'Great value for couples on a budget (< ₱50K)'
  },
  { 
    value: '₱50,000 - ₱100,000', 
    label: '⭐ Mid-Range', 
    description: 'Balance of quality and affordability (₱50K-₱100K)'
  },
  { 
    value: '₱100,000 - ₱200,000', 
    label: '✨ Premium', 
    description: 'High-end services and experiences (₱100K-₱200K)'
  },
  { 
    value: '₱200,000 - ₱500,000', 
    label: '👑 Luxury', 
    description: 'Exclusive and bespoke services (₱200K-₱500K)'
  },
  { 
    value: '₱500,000+', 
    label: '💎 Ultra-Luxury', 
    description: 'The finest wedding services available (₱500K+)'
  }
];

// Item/Equipment examples for different service categories to help vendors
const getCategoryExamples = (category: string): string[] => {
  const examples: Record<string, string[]> = {
    'Photography': [
      'DSLR Camera with 24-70mm lens',
      'Prime lens 50mm f/1.4',
      'Professional flash with diffuser',
      'LED continuous lighting kit',
      'Tripod and monopod',
      'Memory cards and backup storage',
      'Reflectors and light modifiers',
      'Drone with 4K camera (if permitted)'
    ],
    'Planning': [
      'Wedding timeline and checklist',
      'Emergency bridal kit',
      'Vendor contact coordination',
      'Budget tracking spreadsheet',
      'Day-of coordination services',
      'Setup supervision',
      'Guest seating chart',
      'Wedding rehearsal coordination'
    ],
    'Catering': [
      'Chafing dishes and food warmers',
      'Serving utensils and platters',
      'Table linens and napkins',
      'Dinnerware and glassware',
      'Professional serving staff',
      'Bar setup and bartender',
      'Food preparation and cooking',
      'Cleanup and dishwashing service'
    ],
    'Florist': [
      'Bridal bouquet (seasonal flowers)',
      'Groom and groomsmen boutonnieres',
      'Ceremony arch with fresh flowers',
      'Aisle petals and decorations',
      'Reception centerpieces (8 tables)',
      'Flower crown for bride',
      'Corsages for mothers',
      'Delivery and setup service'
    ],
    'Beauty': [
      'Professional makeup brushes and tools',
      'High-end cosmetic products',
      'Hair styling tools and equipment',
      'Hair extensions and accessories',
      'Touch-up kit for the day',
      'Bridal makeup application',
      'Hair styling and updo',
      'Trial session (2 hours)'
    ],
    'Music': [
      'Professional DJ mixing console',
      'Speakers and amplification system',
      'Wireless microphones (2 units)',
      'Lighting equipment and effects',
      'Backup sound system',
      'DJ booth and equipment setup',
      'Music library and playlist',
      'MC services throughout event'
    ],
    'Venue': [
      'Round tables for 150 guests',
      'Chiavari chairs with cushions',
      'Table linens and chair covers',
      'Basic lighting system',
      'Sound system for ceremony',
      'Bridal suite access (4 hours)',
      'Parking coordination',
      'Security and staff supervision'
    ],
    'Rentals': [
      'White wedding tent (40x60 ft)',
      'Round tables (60" diameter)',
      'White folding chairs',
      'Table linens and napkins',
      'Portable dance floor',
      'String lighting installation',
      'Generator and power distribution',
      'Delivery, setup, and breakdown'
    ]
  };
  
  return examples[category] || [
    'Professional equipment rental',
    'Quality materials and supplies',
    'Setup and installation service',
    'Delivery and pickup included',
    'Backup equipment available',
    'Professional consultation'
  ];
};

export const AddServiceForm: React.FC<AddServiceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingService,
  vendorId,
  vendorProfile,
  isLoading = false
}) => {
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
  const [showCustomPricing, setShowCustomPricing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Dynamic categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFields, setCategoryFields] = useState<CategoryField[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);

  // Ref for scroll container
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const totalSteps = 6; // 1=Basic Info, 2=Pricing, 3=Features, 4=DSS Details, 5=Images & Tags, 6=Category-Specific Fields

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
        // Validate based on pricing mode
        if (!showCustomPricing) {
          // Recommended price range mode
          if (!formData.price_range) {
            newErrors.price_range = 'Please select a price range';
          }
        } else {
          // Custom pricing mode
          if (!formData.price || formData.price.trim() === '') {
            newErrors.price = 'Minimum price is required';
          } else if (parseFloat(formData.price) < 0) {
            newErrors.price = 'Price must be a positive number';
          }
          
          if (formData.max_price && parseFloat(formData.max_price) < 0) {
            newErrors.max_price = 'Maximum price must be a positive number';
          }
          
          if (formData.price && formData.max_price && 
              parseFloat(formData.price) > parseFloat(formData.max_price)) {
            newErrors.max_price = 'Maximum price must be greater than minimum price';
          }
        }
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
        // Only send price_range if in recommended mode, otherwise send price/max_price
        price_range: !showCustomPricing && formData.price_range ? formData.price_range : null,
        price: showCustomPricing && formData.price ? parseFloat(formData.price) : null,
        max_price: showCustomPricing && formData.max_price ? parseFloat(formData.max_price) : null,
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
      alert(`❌ Image Upload Failed\n\n${errorMessage}\n\nPlease try again or check your internet connection.`);
      
      // Don't add placeholder images - let user retry
    } finally {
      setIsUploading(false);
    }
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

  // Multi-select helpers for arrays
  const toggleArrayItem = (array: string[], item: string): string[] => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const handleMultiSelect = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      return {
        ...prev,
        [field]: toggleArrayItem(currentArray, value)
      };
    });
  };

  // Category-specific multi-select handlers
  const handleCateringOption = (field: keyof FormData['catering_options'], value: string) => {
    setFormData(prev => ({
      ...prev,
      catering_options: {
        ...prev.catering_options!,
        [field]: toggleArrayItem(prev.catering_options![field], value)
      }
    }));
  };

  // Helper function to get display name from category name
  const getCategoryDisplayName = (categoryName: string): string => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.display_name : categoryName;
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
                            placeholder="🔍 Search for your service location (e.g., Manila, Philippines)"
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
                      <p className="text-gray-600">Set your pricing and availability</p>
                    </div>

                    <div className="space-y-8">
                      {/* PRICING SECTION WITH INTEGRATED TOGGLE */}
                      {!showCustomPricing ? (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                          {/* Header with Toggle */}
                          <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              <span className="text-lg font-semibold text-gray-800">Recommended Price Range *</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCustomPricing(true);
                                // Clear price_range when switching to custom pricing
                                setFormData(prev => ({ ...prev, price_range: '' }));
                              }}
                              className="px-4 py-2 bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-400 rounded-lg font-medium transition-all flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                            >
                              <DollarSign className="h-4 w-4" />
                              Set Custom Pricing
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 bg-white/50 p-3 rounded-lg border border-green-200">
                            💰 Select the price range that best fits your service. This helps couples find options within their budget.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PRICE_RANGES.map(range => (
                              <label key={range.value} className="relative cursor-pointer group">
                                <input
                                  type="radio"
                                  name="price_range"
                                  value={range.value}
                                  checked={formData.price_range === range.value}
                                  onChange={(e) => setFormData(prev => ({ ...prev, price_range: e.target.value }))}
                                  className="sr-only"
                                  aria-label={`${range.label} - ${range.value}`}
                                />
                                <div className={`p-5 rounded-2xl border-2 transition-all duration-300 transform ${
                                  formData.price_range === range.value
                                    ? 'border-green-500 bg-green-50 shadow-xl scale-[1.02] ring-2 ring-green-200'
                                    : 'border-gray-200 bg-white/80 hover:border-green-300 hover:shadow-lg hover:scale-[1.01] group-hover:bg-green-50/30'
                                }`}>
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <div className="inline-flex px-3 py-1 rounded-full text-sm font-semibold shadow-sm bg-green-100 text-green-800">
                                          {range.label}
                                        </div>
                                      </div>
                                      <div className="text-lg font-bold text-gray-900 mb-1">
                                        {range.value}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {range.description}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0 ml-3">
                                      {formData.price_range === range.value ? (
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                                          <CheckCircle2 className="h-5 w-5 text-white" />
                                        </div>
                                      ) : (
                                        <div className="w-8 h-8 border-2 border-gray-300 rounded-full group-hover:border-green-300 transition-colors"></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                          {errors.price_range && (
                            <p className="mt-3 text-sm text-red-600 flex items-center gap-1 bg-red-50 p-3 rounded-lg border border-red-200">
                              <AlertCircle size={16} />
                              {errors.price_range}
                            </p>
                          )}
                        </div>
                      ) : (
                        /* OPTION 2: Custom Price Range */
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                          {/* Header with Toggle */}
                          <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2">
                              <span className="p-1 bg-blue-600 text-white rounded-full text-sm">₱</span>
                              <span className="text-lg font-semibold text-gray-800">Custom Price Range</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCustomPricing(false);
                                // Clear custom pricing when switching to recommended range
                                setFormData(prev => ({ 
                                  ...prev, 
                                  price: '',
                                  max_price: '',
                                  price_range: '₱10,000 - ₱25,000' // Reset to default
                                }));
                              }}
                              className="px-4 py-2 bg-white text-green-600 border-2 border-green-200 hover:border-green-400 rounded-lg font-medium transition-all flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Use Recommended Range
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 bg-white/50 p-3 rounded-lg border border-blue-200">
                            💡 Set your exact minimum and maximum prices. This will override the general price range options.
                          </p>
                          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Minimum Price */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                  Minimum Price *
                                  <span className="text-xs text-gray-500">(₱)</span>
                                </label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₱</span>
                                  <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base bg-white"
                                    placeholder="10,000"
                                    min="0"
                                    step="1000"
                                  />
                                </div>
                              </div>
                              
                              {/* Maximum Price */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                  Maximum Price
                                  <span className="text-xs text-gray-500">(₱)</span>
                                </label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₱</span>
                                  <input
                                    type="number"
                                    value={formData.max_price || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, max_price: e.target.value }))}
                                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base bg-white"
                                    placeholder="25,000"
                                    min="0"
                                    step="1000"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

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
                  </motion.div>
                )}

                {/* Step 3: Service Items & Equipment */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Items & Equipment</h3>
                      <p className="text-gray-600">List what's included in your service</p>
                    </div>

                    {/* Service Items & Equipment List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Service Items & Equipment</h4>
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          � These will auto-populate your quotes
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        List all items, equipment, or materials that will be provided/borrowed during your service. Each item will become a line item in your quotes with individual pricing.
                      </p>
                      <div className="space-y-3">
                        {formData.features.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => updateFeature(index, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
                              placeholder="e.g., DSLR Camera with 24-70mm lens, Professional lighting kit, Wireless microphones (2 units)"
                            />
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove item"
                              aria-label={`Remove item: ${item}`}
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
                          Add Service Item
                        </button>
                      </div>
                      
                      {/* Helpful examples based on category */}
                      {formData.category && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-200">
                          <h5 className="font-medium text-rose-900 mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Example items for {getCategoryDisplayName(formData.category)}:
                          </h5>
                          <div className="text-sm text-rose-700 space-y-1">
                            {getCategoryExamples(formData.category).map((example, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <span className="text-rose-400 mt-0.5">•</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!formData.features.includes(example)) {
                                      setFormData(prev => ({ ...prev, features: [...prev.features, example] }));
                                    }
                                  }}
                                  className="text-left hover:text-rose-800 hover:underline cursor-pointer"
                                  title="Click to add this item"
                                >
                                  {example}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: DSS Details (Dynamic Service System) */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
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
                      {/* Years in Business */}
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Star className="h-5 w-5 text-purple-600" />
                          Years in Business
                        </label>
                        <p className="text-sm text-gray-600 mb-4 bg-white/50 p-3 rounded-lg border border-purple-200">
                          ⭐ How long have you been providing wedding services? This builds trust with clients.
                        </p>
                        <input
                          type="number"
                          value={formData.years_in_business}
                          onChange={(e) => setFormData(prev => ({ ...prev, years_in_business: e.target.value }))}
                          className="w-full px-5 py-4 border-2 border-white bg-white/70 backdrop-blur-sm rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-lg"
                          placeholder="e.g., 5"
                          min="0"
                          max="100"
                        />
                      </div>

                      {/* Service Tier */}
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-2xl border border-amber-100">
                        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-amber-600" />
                          Service Tier
                        </label>
                        <p className="text-sm text-gray-600 mb-4 bg-white/50 p-3 rounded-lg border border-amber-200">
                          💎 Select your service level. This helps clients find services that match their expectations.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { value: 'basic' as const, label: 'Basic', icon: '⚡', description: 'Essential services with quality results', color: 'blue' },
                            { value: 'standard' as const, label: 'Standard', icon: '✨', description: 'Enhanced services with extra features', color: 'purple' },
                            { value: 'premium' as const, label: 'Premium', icon: '💎', description: 'Top-tier services with premium experience', color: 'amber' }
                          ].map((tier) => (
                            <label key={tier.value} className="relative cursor-pointer group">
                              <input
                                type="radio"
                                name="service_tier"
                                value={tier.value}
                                checked={formData.service_tier === tier.value}
                                onChange={(e) => setFormData(prev => ({ ...prev, service_tier: e.target.value as 'premium' | 'standard' | 'basic' }))}
                                className="sr-only"
                                aria-label={tier.label}
                              />
                              <div className={`p-5 rounded-2xl border-2 transition-all duration-300 transform ${
                                formData.service_tier === tier.value
                                  ? `border-${tier.color}-500 bg-${tier.color}-50 shadow-xl scale-[1.02] ring-2 ring-${tier.color}-200`
                                  : 'border-gray-200 bg-white/80 hover:border-amber-300 hover:shadow-lg hover:scale-[1.01]'
                              }`}>
                                <div className="text-center">
                                  <div className="text-3xl mb-2">{tier.icon}</div>
                                  <div className="text-lg font-bold text-gray-900 mb-1">{tier.label}</div>
                                  <div className="text-sm text-gray-600">{tier.description}</div>
                                </div>
                                {formData.service_tier === tier.value && (
                                  <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
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

                {/* Step 5: Images & Tags */}
                {currentStep === 5 && (
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

                {/* Step 6: Category-Specific Fields (Dynamic) */}
                {currentStep === 6 && (
                  <motion.div
                    key="step6"
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
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Confirm Service Details</h3>
                    <p className="text-white/90 text-sm mt-1">
                      Please review your service information before publishing
                    </p>
                  </div>
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
              <div className="space-y-4">
                {/* Service Name */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">Service Name</p>
                  <p className="text-lg font-bold text-gray-900">{formData.title}</p>
                </div>

                {/* Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">Category</p>
                    <p className="font-semibold text-gray-900">{formData.category}</p>
                  </div>
                  {formData.subcategory && (
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                      <p className="text-sm font-medium text-gray-600 mb-1">Subcategory</p>
                      <p className="font-semibold text-gray-900">{formData.subcategory}</p>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                    <MapPin size={14} />
                    Location
                  </p>
                  <p className="font-semibold text-gray-900">{formData.location}</p>
                </div>

                {/* Pricing */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <p className="text-sm font-medium text-gray-600 mb-2">Pricing</p>
                  {showCustomPricing ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-lg">
                        ₱{parseFloat(formData.price || '0').toLocaleString()}
                      </span>
                      {formData.max_price && (
                        <>
                          <span className="text-gray-500">-</span>
                          <span className="font-bold text-gray-900 text-lg">
                            ₱{parseFloat(formData.max_price).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="font-semibold text-gray-900">{formData.price_range}</p>
                  )}
                </div>

                {/* Images */}
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                    <Camera size={14} />
                    Images
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formData.images.length} {formData.images.length === 1 ? 'image' : 'images'} uploaded
                  </p>
                </div>

                {/* Service Items */}
                {formData.features.length > 0 && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">Service Items & Equipment</p>
                    <p className="font-semibold text-gray-900">
                      {formData.features.length} {formData.features.length === 1 ? 'item' : 'items'} included
                    </p>
                  </div>
                )}

                {/* Description Preview */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{formData.description}</p>
                </div>

                {/* Status */}
                <div className="flex gap-4">
                  {formData.featured && (
                    <div className="flex-1 bg-yellow-50 p-3 rounded-xl border border-yellow-200 flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-900">Featured Service</span>
                    </div>
                  )}
                  {formData.is_active && (
                    <div className="flex-1 bg-green-50 p-3 rounded-xl border border-green-200 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-900">Available for Booking</span>
                    </div>
                  )}
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
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
