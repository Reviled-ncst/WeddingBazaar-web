import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Users,
  Calendar,
  Edit3,
  Save,
  X,
  Upload,
  Clock,
  DollarSign,
  Shield,
  AlertCircle,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Send,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { useVendorProfile } from '../../../../hooks/useVendorData';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import { cn } from '../../../../utils/cn';
import type { VendorProfile as VendorProfileType } from '../../../../services/api/vendorApiService';

export const VendorProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('business');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  // Get real authenticated user data
  const { user } = useAuth();
  const vendorId = user?.vendorId || user?.id || 'vendor-user-1'; // Fallback to existing data
  
  const { 
    profile, 
    loading, 
    error, 
    updateProfile,
    refetch 
  } = useVendorProfile(vendorId);
  
  // Local state for editing
  const [editForm, setEditForm] = useState<Partial<VendorProfileType>>({});

  // Update form when profile loads - FIXED FIELD MAPPING
  React.useEffect(() => {
    if (profile) {
      setEditForm({
        // Use correct backend field names (camelCase from API response)
        businessName: profile.businessName || '',
        businessType: profile.businessType || '',
        description: profile.description || '',
        location: profile.location || '',
        yearsInBusiness: profile.yearsInBusiness || 0,
        website: profile.website || '',
        socialMedia: profile.socialMedia || { facebook: '', instagram: '', twitter: '', linkedin: '' },
        serviceArea: profile.serviceArea || '',
        phone: profile.phone || '',
        email: profile.email || '',
        profileImage: profile.profileImage || ''
      });
    }
  }, [profile]);

  // Verification functions - Updated to use new modular endpoints
  const handleEmailVerification = async () => {
    setIsVerifyingEmail(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const response = await fetch(`${apiUrl}/api/vendor-profile/${vendorId}/verify-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        alert('✅ Verification email sent! Please check your inbox.');
        console.log('Email verification result:', result);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to send verification email: ${errorText}`);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      alert('❌ Failed to send verification email. Please try again.');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handlePhoneVerification = async () => {
    setIsVerifyingPhone(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const response = await fetch(`${apiUrl}/api/vendor-profile/${vendorId}/verify-phone`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          phone: editForm.contact_phone || profile?.contact_phone 
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setShowPhoneVerification(true);
        alert('📱 Verification code sent to your phone!');
        console.log('Phone verification result:', result);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to send phone verification: ${errorText}`);
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      alert('❌ Failed to send phone verification. Please try again.');
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleDocumentUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      formData.append(`document_${index}`, file);
    });
    formData.append('documentType', 'business_verification');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const response = await fetch(`${apiUrl}/api/vendor-profile/${vendorId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ Documents uploaded successfully! They will be reviewed by our admin team.');
        console.log('Document upload result:', result);
        await refetch(); // Refresh profile data
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to upload documents: ${errorText}`);
      }
    } catch (error) {
      console.error('Document upload error:', error);
      alert('❌ Failed to upload documents. Please try again.');
    }
  };

  // Define constants and functions before early returns to avoid hook order issues
  const tabs = [
    { id: 'business', name: 'Business Info', icon: Users },
    { id: 'verification', name: 'Verification', icon: Shield },
    { id: 'portfolio', name: 'Portfolio Settings', icon: Camera },
    { id: 'pricing', name: 'Pricing & Services', icon: DollarSign },
    { id: 'settings', name: 'Account Settings', icon: FileText }
  ];

  const categories = [
    'Photography',
    'Videography', 
    'Planning',
    'Catering',
    'Venues',
    'Floral',
    'Cakes',
    'DJ',
    'Music',
    'Makeup',
    'Decoration',
    'Transportation'
  ];

  const handleSave = async () => {
    try {
      console.log('Saving profile changes to database:', editForm);
      
      // Now that we have the backend API, save to the actual database
      await updateProfile(editForm);
      
      setIsEditing(false);
      
      // Refresh the profile data to get the latest changes
      await refetch();
      
      // Show success message
      alert('✅ Profile updated successfully and saved to database!');
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('❌ Failed to save changes to database. Please try again.');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        businessName: profile.businessName || '',
        businessType: profile.businessType || '',
        description: profile.description || '',
        location: profile.location || '',
        yearsInBusiness: profile.yearsInBusiness || 0,
        website: profile.website || '',
        socialMedia: profile.socialMedia || { facebook: '', instagram: '', twitter: '', linkedin: '' },
        serviceArea: profile.serviceArea || '',
        phone: profile.phone || '',
        email: profile.email || '',
        profileImage: profile.profileImage || ''
      });
    }
    setIsEditing(false);
  };

  // Handle image upload - COMPLETELY RECREATED
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('❌ Please select a valid image file (JPG, PNG, GIF, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('❌ Image must be smaller than 10MB');
      return;
    }

    try {
      setIsUploadingImage(true);
      console.log('🔄 Starting image upload...', { fileName: file.name, size: file.size });

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'vendor-profiles');

      // Upload to backend
      const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const response = await fetch(`${apiUrl}/api/vendors/${vendorId}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Image upload successful:', result);

      // Update the profile in the database
      await updateProfile({ profileImage: result.imageUrl });
      
      // Refresh profile data
      await refetch();
      
      alert('✅ Profile image uploaded and saved successfully!');
      
    } catch (error) {
      console.error('❌ Image upload error:', error);
      alert('❌ Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle file selection
  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Handle image deletion - RECREATED
  const handleImageDelete = async () => {
    if (!confirm('⚠️ Are you sure you want to delete your profile image?')) {
      return;
    }

    try {
      setIsUploadingImage(true);
      console.log('🗑️ Deleting profile image...');

      // Remove image from profile
      await updateProfile({ profileImage: undefined });
      
      // Refresh profile data
      await refetch();
      
      alert('✅ Profile image deleted successfully!');
      
    } catch (error) {
      console.error('❌ Image deletion error:', error);
      alert('❌ Failed to delete image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <VendorHeader />
        <div className="flex-1 bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <VendorHeader />
        <div className="flex-1 bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    console.log('Profile is null or undefined'); // Debug log
    return (
      <div className="min-h-screen flex flex-col">
        <VendorHeader />
        <div className="flex-1 bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Data</h3>
                <p className="text-gray-600 mb-4">Unable to load profile information</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Debug log to see profile data
  console.log('Profile data:', profile);
  console.log('Loading state:', loading);
  console.log('Error state:', error);

  return (
    <div className="min-h-screen flex flex-col">
      <VendorHeader />
      
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileSelect}
        className="hidden"
        aria-hidden="true"
      />
      
      <div className="flex-1 bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Profile</h1>
                <p className="text-gray-600">Manage your business information and settings</p>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <Edit3 className="w-5 h-5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all duration-300"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                          activeTab === tab.id
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'text-gray-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {activeTab === 'business' && (
                  <div className="space-y-8">
                    {/* Cover Image Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="relative h-48 bg-gradient-to-r from-pink-100 to-rose-100">
                        <img
                          src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                          alt="Cover"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('Cover image failed to load');
                            e.currentTarget.src = 'https://via.placeholder.com/800x400/F472B6/FFFFFF?text=Cover+Image';
                          }}
                        />
                        {isEditing && (
                          <button
                            onClick={() => alert('Cover image upload coming soon!')}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                            title="Upload cover image"
                          >
                            <Camera className="w-5 h-5" />
                          </button>
                        )}
                        
                        {/* Profile Image - RECREATED LOGIC */}
                        <div className="absolute -bottom-16 left-8">
                          <div className="relative">
                            <img
                              src={
                                profile.profileImage || 
                                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80'
                              }
                              alt="Profile"
                              className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover"
                              onError={(e) => {
                                console.log('❌ Profile image failed to load, using fallback');
                                e.currentTarget.src = 'https://via.placeholder.com/400x400/F472B6/FFFFFF?text=No+Image';
                              }}
                            />
                            
                            {/* Upload/Delete Controls */}
                            {isEditing && (
                              <div className="absolute bottom-2 right-2 flex flex-col space-y-1">
                                {/* Upload Button */}
                                <button
                                  onClick={triggerFileInput}
                                  disabled={isUploadingImage}
                                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Upload new profile image"
                                >
                                  {isUploadingImage ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Upload className="w-4 h-4" />
                                  )}
                                </button>
                                
                                {/* Delete Button - Only show if there's an image */}
                                {profile.profileImage && (
                                  <button
                                    onClick={handleImageDelete}
                                    disabled={isUploadingImage}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete profile image"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-20 pb-8 px-8">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.business_name || ''}
                                onChange={(e) => setEditForm({...editForm, business_name: e.target.value})}
                                className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-pink-200 focus:border-pink-500 outline-none w-full mb-2"
                                placeholder="Business Name"
                              />
                            ) : (
                              <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.businessName}</h2>
                            )}
                            
                            {isEditing ? (
                              <select
                                value={editForm.business_type || ''}
                                onChange={(e) => setEditForm({...editForm, business_type: e.target.value})}
                                className="text-pink-600 font-medium bg-transparent border-b border-pink-200 focus:border-pink-500 outline-none"
                                title="Select business category"
                              >
                                {categories.map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            ) : (
                              <p className="text-pink-600 font-medium">{profile.businessType}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-medium">4.8</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>15 reviews</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{profile.yearsInBusiness || 0} years</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Business Information */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Business Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Description */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Description
                          </label>
                          {isEditing ? (
                            <textarea
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
                              placeholder="Describe your business and services..."
                            />
                          ) : (
                            <p className="text-gray-600 leading-relaxed">
                              {profile.description || 'No description provided yet. Click Edit Profile to add your business description.'}
                            </p>
                          )}
                        </div>

                        {/* Contact Information */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Location/Service Area
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.location || ''}
                              onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                              placeholder="Primary location or service area"
                            />
                          ) : (
                            <p className="text-gray-900">
                              {profile.location || 'No location specified yet. Click Edit Profile to add your location.'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-1" />
                            Phone
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editForm.phone || ''}
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                              placeholder="Contact phone number"
                            />
                          ) : (
                            <p className="text-gray-900">{profile.phone || 'No phone number provided'}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Email
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={editForm.email || ''}
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                              placeholder="Contact email"
                            />
                          ) : (
                            <p className="text-gray-900">{profile.email || 'No email provided'}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Globe className="w-4 h-4 inline mr-1" />
                            Website
                          </label>
                          {isEditing ? (
                            <input
                              type="url"
                              value={editForm.website || ''}
                              onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                              placeholder="Business website"
                            />
                          ) : (
                            <div>
                              {profile.website ? (
                                <a 
                                  href={profile.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-pink-600 hover:text-pink-700 transition-colors"
                                >
                                  {profile.website}
                                </a>
                              ) : (
                                <p className="text-gray-500 italic">No website provided yet. Click Edit Profile to add your website.</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Years Established */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Years Established
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.yearsInBusiness || 0}
                              onChange={(e) => setEditForm({...editForm, yearsInBusiness: parseInt(e.target.value)})}
                              min="0"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                              placeholder="Years your business has been established"
                            />
                          ) : (
                            <p className="text-gray-900">{profile.yearsInBusiness || 0} years</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Camera className="w-4 h-4 inline mr-1" />
                            Portfolio URL
                          </label>
                          {isEditing ? (
                            <input
                              type="url"
                              value={editForm.portfolio_url || ''}
                              onChange={(e) => setEditForm({...editForm, portfolio_url: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                              placeholder="Portfolio website URL"
                            />
                          ) : (
                            <a 
                              href={profile.portfolio_url || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-700 transition-colors"
                            >
                              {profile.portfolio_url}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Service Areas */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Service Areas</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(Array.isArray(profile.service_areas) 
                          ? profile.service_areas 
                          : typeof profile.service_areas === 'string' 
                            ? profile.service_areas.split(', ')
                            : []
                        ).map((area: string, index: number) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                              <MapPin className="w-4 h-4 text-pink-600" />
                              <span className="text-gray-900 font-medium">{area}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Social Media & Links */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Social Media & Links</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instagram URL
                          </label>
                          {isEditing ? (
                            <input
                              type="url"
                              value={editForm.socialMedia?.instagram || ''}
                              onChange={(e) => {
                                const newSocialMedia = { ...editForm.socialMedia, instagram: e.target.value };
                                setEditForm({...editForm, socialMedia: newSocialMedia});
                              }}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                              placeholder="https://instagram.com/yourbusiness"
                            />
                          ) : (
                            <div>
                              {profile.socialMedia?.instagram ? (
                                <a 
                                  href={profile.socialMedia.instagram} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-pink-600 hover:text-pink-700 transition-colors"
                                >
                                  {profile.socialMedia.instagram}
                                </a>
                              ) : (
                                <p className="text-gray-500 italic">No Instagram profile yet. Click Edit Profile to add your Instagram.</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Facebook Page
                          </label>
                          {isEditing ? (
                            <input
                              type="url"
                              value={editForm.socialMedia?.facebook || ''}
                              onChange={(e) => {
                                const newSocialMedia = { ...editForm.socialMedia, facebook: e.target.value };
                                setEditForm({...editForm, socialMedia: newSocialMedia});
                              }}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                              placeholder="https://facebook.com/yourbusiness"
                            />
                          ) : (
                            <div>
                              {profile.socialMedia?.facebook ? (
                                <a 
                                  href={profile.socialMedia.facebook} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-pink-600 hover:text-pink-700 transition-colors"
                                >
                                  {profile.socialMedia.facebook}
                                </a>
                              ) : (
                                <p className="text-gray-500 italic">No Facebook page yet. Click Edit Profile to add your Facebook page.</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Twitter/X Profile
                          </label>
                          {isEditing ? (
                            <input
                              type="url"
                              value={editForm.socialMedia?.twitter || ''}
                              onChange={(e) => {
                                const newSocialMedia = { ...editForm.socialMedia, twitter: e.target.value };
                                setEditForm({...editForm, socialMedia: newSocialMedia});
                              }}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                              placeholder="https://twitter.com/yourbusiness"
                            />
                          ) : (
                            <div>
                              {profile.socialMedia?.twitter ? (
                                <a 
                                  href={profile.socialMedia.twitter} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-pink-600 hover:text-pink-700 transition-colors"
                                >
                                  {profile.socialMedia.twitter}
                                </a>
                              ) : (
                                <p className="text-gray-500 italic">No Twitter/X profile yet. Click Edit Profile to add your Twitter.</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            LinkedIn Profile
                          </label>
                          {isEditing ? (
                            <input
                              type="url"
                              value={editForm.socialMedia?.linkedin || ''}
                              onChange={(e) => {
                                const newSocialMedia = { ...editForm.socialMedia, linkedin: e.target.value };
                                setEditForm({...editForm, socialMedia: newSocialMedia});
                              }}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                              placeholder="https://linkedin.com/company/yourbusiness"
                            />
                          ) : (
                            <div>
                              {profile.socialMedia?.linkedin ? (
                                <a 
                                  href={profile.socialMedia.linkedin} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-pink-600 hover:text-pink-700 transition-colors"
                                >
                                  {profile.socialMedia.linkedin}
                                </a>
                              ) : (
                                <p className="text-gray-500 italic">No LinkedIn profile yet. Click Edit Profile to add your LinkedIn.</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'verification' && (
                  <div className="space-y-8">
                    {/* Email Verification */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-6 h-6 text-blue-600" />
                          <h3 className="text-xl font-semibold text-gray-900">Email Verification</h3>
                        </div>
                        {user?.emailVerified ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-amber-600">
                            <XCircle className="w-5 h-5" />
                            <span className="font-medium">Not Verified</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-gray-600 mb-4">
                            Verify your email address to enable full access to vendor features and build customer trust.
                          </p>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-500"><strong>Email:</strong> {user?.email}</p>
                            <p className="text-sm text-gray-500"><strong>Status:</strong> {user?.emailVerified ? 'Verified' : 'Pending verification'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          {!user?.emailVerified && (
                            <button
                              onClick={handleEmailVerification}
                              disabled={isVerifyingEmail}
                              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {isVerifyingEmail ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                              ) : (
                                <Send className="w-5 h-5" />
                              )}
                              <span>{isVerifyingEmail ? 'Sending...' : 'Send Verification Email'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Phone Verification */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-6 h-6 text-green-600" />
                          <h3 className="text-xl font-semibold text-gray-900">Phone Verification</h3>
                        </div>
                        {profile?.phone_verified ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-amber-600">
                            <XCircle className="w-5 h-5" />
                            <span className="font-medium">Not Verified</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-gray-600 mb-4">
                            Verify your phone number to allow customers to contact you directly and improve your profile credibility.
                          </p>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-500"><strong>Phone:</strong> {profile?.contact_phone || user?.phone || 'Not provided'}</p>
                            <p className="text-sm text-gray-500"><strong>Status:</strong> {profile?.phone_verified ? 'Verified' : 'Pending verification'}</p>
                          </div>
                          
                          {showPhoneVerification && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter verification code:
                              </label>
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={phoneVerificationCode}
                                  onChange={(e) => setPhoneVerificationCode(e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="Enter 6-digit code"
                                  maxLength={6}
                                />
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                  Verify
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-center">
                          {!profile?.phone_verified && (profile?.contact_phone || user?.phone) && (
                            <button
                              onClick={handlePhoneVerification}
                              disabled={isVerifyingPhone}
                              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {isVerifyingPhone ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                              ) : (
                                <Send className="w-5 h-5" />
                              )}
                              <span>{isVerifyingPhone ? 'Sending...' : 'Send Verification Code'}</span>
                            </button>
                          )}
                          {!profile?.contact_phone && !user?.phone && (
                            <p className="text-sm text-gray-500 text-center">
                              Please add a phone number in your business info to verify it.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Business Document Verification */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-6 h-6 text-purple-600" />
                          <h3 className="text-xl font-semibold text-gray-900">Business Document Verification</h3>
                        </div>
                        {profile?.business_verified ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Verified</span>
                          </div>
                        ) : profile?.verification_status === 'pending' ? (
                          <div className="flex items-center space-x-2 text-amber-600">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">Under Review</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-amber-600">
                            <XCircle className="w-5 h-5" />
                            <span className="font-medium">Not Verified</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <p className="text-gray-600 mb-4">
                            Upload your business registration documents for manual verification by our admin team. 
                            This helps build trust with customers and unlocks premium features.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Required Documents:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Business Registration Certificate</li>
                                <li>• Tax ID/EIN Documentation</li>
                                <li>• Professional License (if applicable)</li>
                                <li>• Insurance Certificate</li>
                              </ul>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Verification Benefits:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Verified badge on profile</li>
                                <li>• Higher search ranking</li>
                                <li>• Access to premium features</li>
                                <li>• Increased customer trust</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        {/* Document Upload Section */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <input
                            ref={documentInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => handleDocumentUpload(e.target.files)}
                            className="hidden"
                          />
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Business Documents</h4>
                          <p className="text-gray-600 mb-4">
                            Drag and drop files here or click to browse
                          </p>
                          <button
                            onClick={() => documentInputRef.current?.click()}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Choose Files
                          </button>
                          <p className="text-xs text-gray-500 mt-2">
                            Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
                          </p>
                        </div>

                        {/* Verification Status */}
                        {profile?.verification_status && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Verification Status</h4>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                <strong>Status:</strong> {profile.verification_status}
                              </p>
                              {profile.verification_notes && (
                                <p className="text-sm text-gray-600">
                                  <strong>Admin Notes:</strong> {profile.verification_notes}
                                </p>
                              )}
                              {profile.verified_at && (
                                <p className="text-sm text-gray-600">
                                  <strong>Verified On:</strong> {new Date(profile.verified_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Overall Verification Status */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Verification Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                            user?.emailVerified ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <Mail className={`w-8 h-8 ${user?.emailVerified ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          <h4 className="font-medium text-gray-900">Email</h4>
                          <p className={`text-sm ${user?.emailVerified ? 'text-green-600' : 'text-gray-500'}`}>
                            {user?.emailVerified ? 'Verified' : 'Pending'}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                            profile?.phone_verified ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <Phone className={`w-8 h-8 ${profile?.phone_verified ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          <h4 className="font-medium text-gray-900">Phone</h4>
                          <p className={`text-sm ${profile?.phone_verified ? 'text-green-600' : 'text-gray-500'}`}>
                            {profile?.phone_verified ? 'Verified' : 'Pending'}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                            profile?.business_verified ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <FileText className={`w-8 h-8 ${profile?.business_verified ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          <h4 className="font-medium text-gray-900">Business</h4>
                          <p className={`text-sm ${profile?.business_verified ? 'text-green-600' : 'text-gray-500'}`}>
                            {profile?.business_verified ? 'Verified' : profile?.verification_status === 'pending' ? 'Under Review' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'portfolio' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Portfolio Gallery</h3>
                    
                    {profile.portfolio_images && profile.portfolio_images.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profile.portfolio_images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-64 object-cover rounded-xl shadow-lg transition-transform group-hover:scale-105"
                              onError={(e) => {
                                console.log(`Portfolio image ${index + 1} failed to load:`, image);
                                e.currentTarget.src = 'https://via.placeholder.com/600x400/F472B6/FFFFFF?text=Portfolio+Image';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                              <button className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                View Full Size
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No portfolio images yet</p>
                        <button className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                          Upload Portfolio Images
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'pricing' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Pricing & Services</h3>
                    <p className="text-gray-600">Pricing and service management features coming soon...</p>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h3>
                    <p className="text-gray-600">Account settings coming soon...</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
