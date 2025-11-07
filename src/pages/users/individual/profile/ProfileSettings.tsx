import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart, 
  Camera, 
  Save,
  Upload,
  Edit3,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import { userService, type UserProfile, type UpdateProfileData } from '../../../../shared/services/userService';
import { NotificationModal } from '../../../../shared/components/modals';
import { useNotification } from '../../../../shared/hooks/useNotification';
import { CoupleHeader } from '../landing/CoupleHeader';
import { SecuritySettings, DocumentUploader, type ExtractedDocumentData } from '../../../../shared/components/security';

export const ProfileSettings: React.FC = () => {
  const { user, isEmailVerified, firebaseUser } = useAuth();
  const { notification, showNotification, hideNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showDocumentUploader, setShowDocumentUploader] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    weddingDate: '',
    partnerName: '',
    bio: '',
    interests: [] as string[],
    budget: 0,
    guestCount: 0,
    venues: [] as string[]
  });

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      console.log('🔍 ProfileSettings: Loading user profile for user:', user);
      
      if (!user?.id) {
        console.log('❌ ProfileSettings: No user ID found');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('📡 ProfileSettings: Fetching profile for user ID:', user.id);
        
        const profile = await userService.getUserProfile(user.id);
        console.log('✅ ProfileSettings: Profile loaded successfully:', profile);
        
        setUserProfile(profile);
        
        // Populate form data
        const newFormData = {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          phone: profile.phone || '',
          location: profile.location || '',
          weddingDate: profile.weddingDate || '',
          partnerName: profile.partnerName || '',
          bio: profile.bio || '',
          interests: profile.interests || [],
          budget: profile.budget || 0,
          guestCount: profile.guestCount || 0,
          venues: profile.venues || []
        };
        
        console.log('📝 ProfileSettings: Form data populated:', newFormData);
        setFormData(newFormData);
        
      } catch (error) {
        console.error('❌ ProfileSettings: Failed to load user profile:', error);
      } finally {
        setIsLoading(false);
        console.log('⏱️ ProfileSettings: Loading complete');
      }
    };

    loadUserProfile();
  }, [user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'guestCount' ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      setIsSaving(true);
      const updateData: UpdateProfileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        location: formData.location,
        weddingDate: formData.weddingDate,
        partnerName: formData.partnerName,
        bio: formData.bio,
        interests: formData.interests,
        budget: formData.budget,
        guestCount: formData.guestCount,
        venues: formData.venues
      };
      
      const updatedProfile = await userService.updateUserProfile(user.id, updateData);
      setUserProfile(updatedProfile);
      setIsEditing(false);
      
      // Show success message (you could add a toast notification here)
      console.log('Profile updated successfully!');
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Show error message (you could add a toast notification here)
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocumentUploadComplete = async (imageUrl: string, extractedData: ExtractedDocumentData) => {
    console.log('📄 Document uploaded:', { imageUrl, extractedData });
    
    // TODO: Call backend API to save verification data
    try {
      const response = await fetch('/api/verification/upload-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          documentType: extractedData.documentType,
          imageUrl,
          extractedData
        })
      });
      
      if (response.ok) {
        console.log('✅ Document verification submitted for review');
        // Update user profile state
        if (userProfile) {
          setUserProfile({
            ...userProfile,
            // Add verification status fields when backend is ready
          });
        }
      }
    } catch (error) {
      console.error('❌ Failed to submit document:', error);
    }
    
    setShowDocumentUploader(false);
  };

  const weddingStyles = [
    'Traditional', 'Modern', 'Rustic', 'Elegant', 'Bohemian', 
    'Vintage', 'Beach', 'Garden', 'Industrial', 'Minimalist'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <CoupleHeader />
      {isLoading ? (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your profile...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-gray-600 mt-2">Manage your personal information and wedding details</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Edit3 className="h-5 w-5" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Profile Picture */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-rose-400 via-pink-400 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                <User className="h-16 w-16 text-white drop-shadow-lg" />
              </div>
              {isEditing && (
                <button 
                  className="absolute -bottom-2 -right-2 p-3 bg-white rounded-full shadow-lg border-2 border-rose-200 hover:bg-rose-50 transition-all duration-300"
                  title="Change profile picture"
                  aria-label="Change profile picture"
                >
                  <Camera className="h-5 w-5 text-rose-600" />
                </button>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{formData.firstName} {formData.lastName}</h2>
              <p className="text-gray-600">{userProfile?.email || user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                {userProfile?.isEmailVerified ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Email Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">Email Pending</span>
                  </div>
                )}
                {userProfile?.isPhoneVerified ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Phone Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-gray-400">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs">Phone Not Verified</span>
                  </div>
                )}
              </div>
              {isEditing && (
                <button className="flex items-center space-x-2 mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300">
                  <Upload className="h-4 w-4" />
                  <span>Upload New Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Account Verification Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="h-6 w-6 text-rose-500 mr-3" />
            Account Verification
          </h3>
          
          <div className="space-y-4">
            {/* Email Verification */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  firebaseUser?.emailVerified || isEmailVerified 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Email Verification</h4>
                  <p className="text-sm text-gray-600">
                    {firebaseUser?.emailVerified || isEmailVerified 
                      ? 'Your email has been verified ✓' 
                      : 'Please verify your email to unlock all features'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {firebaseUser?.emailVerified || isEmailVerified ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={async () => {
                        try {
                          // Import Firebase auth service
                          const { firebaseAuthService } = await import('../../../../services/auth/firebaseAuthService');
                          await firebaseAuthService.resendEmailVerification();
                          showNotification({
                            type: 'success',
                            title: 'Verification Email Sent',
                            message: 'Verification email sent! Please check your inbox.'
                          });
                        } catch (error) {
                          console.error('Error sending verification email:', error);
                          showNotification({
                            type: 'error',
                            title: 'Verification Failed',
                            message: 'Failed to send verification email. Please try again.'
                          });
                        }
                      }}
                      className="px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                    >
                      Send Email
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const { firebaseAuthService } = await import('../../../../services/auth/firebaseAuthService');
                          await firebaseAuthService.reloadUser();
                          window.location.reload(); // Refresh to update verification status
                        } catch (error) {
                          window.location.reload(); // Fallback refresh
                        }
                      }}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Check Status
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Verification (Future) */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 opacity-60">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-gray-100 text-gray-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Phone Verification</h4>
                  <p className="text-sm text-gray-600">Coming soon - optional enhanced security</p>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                Coming Soon
              </span>
            </div>

            {/* Document Verification (Future) */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 opacity-60">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-gray-100 text-gray-400">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Identity Verification</h4>
                  <p className="text-sm text-gray-600">Coming soon - upload ID for premium features</p>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Verification Benefits */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Verification Benefits</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Access to all platform features</li>
              <li>✓ Increased trust from vendors</li>
              <li>✓ Priority customer support</li>
              <li>✓ Enhanced security for your account</li>
            </ul>
          </div>
        </div>

        {/* Form Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="h-6 w-6 text-rose-500 mr-3" />
              Personal Information
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    title="First Name"
                    aria-label="First Name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    title="Last Name"
                    aria-label="Last Name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Cannot be changed)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={userProfile?.email || user?.email || ''}
                    disabled={true}
                    title="Email Address (Read Only)"
                    aria-label="Email Address (Read Only)"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed transition-all duration-300"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email address cannot be changed for security reasons</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="(555) 123-4567"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="City, State"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Wedding Information */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Heart className="h-6 w-6 text-rose-500 mr-3" />
              Wedding Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="weddingDate"
                    value={formData.weddingDate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    title="Wedding Date"
                    aria-label="Wedding Date"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Partner's Name</label>
                <input
                  type="text"
                  name="partnerName"
                  value={formData.partnerName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Your partner's name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="75000"
                      min="0"
                      step="1000"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guest Count</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="guestCount"
                      value={formData.guestCount || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="150"
                      min="0"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Style Preferences</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {weddingStyles.map((style) => (
                    <label key={style} className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all duration-300 ${
                      formData.interests.includes(style) 
                        ? 'bg-rose-100 border-rose-300 text-rose-700' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(style)}
                        disabled={!isEditing}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              interests: [...prev.interests, style]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              interests: prev.interests.filter(i => i !== style)
                            }));
                          }
                        }}
                        className="text-rose-500 rounded focus:ring-rose-500"
                      />
                      <span className="text-sm">{style}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell vendors a bit about yourselves and your dream wedding..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 transition-all duration-300 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="mb-8">
          <SecuritySettings
            userProfile={{
              email: userProfile?.email || user?.email || '',
              phone: formData.phone,
              isEmailVerified: userProfile?.isEmailVerified || false,
              isPhoneVerified: userProfile?.isPhoneVerified || false,
              hasFaceRecognition: userProfile?.hasFaceRecognition || false
            }}
            userId={user?.id || ''}
            onVerificationUpdate={(type, verified) => {
              // Update the user profile when verification status changes
              if (userProfile) {
                const updatedProfile = { ...userProfile };
                if (type === 'email') updatedProfile.isEmailVerified = verified;
                if (type === 'phone') updatedProfile.isPhoneVerified = verified;
                if (type === 'face') updatedProfile.hasFaceRecognition = verified;
                setUserProfile(updatedProfile);
              }
            }}
          />
        </div>

        {/* Account Information - Read Only */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Clock className="h-6 w-6 text-blue-500 mr-3" />
            Account Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50/50 rounded-xl">
              <div className="text-lg font-bold text-gray-900">Member Since</div>
              <div className="text-gray-600">
                {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50/50 rounded-xl">
              <div className="text-lg font-bold text-gray-900">Account Type</div>
              <div className="text-gray-600 capitalize">{userProfile?.role || user?.role}</div>
            </div>
            <div className="text-center p-4 bg-gray-50/50 rounded-xl">
              <div className="text-lg font-bold text-gray-900">Last Updated</div>
              <div className="text-gray-600">
                {userProfile?.updatedAt ? new Date(userProfile.updatedAt).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save className="h-6 w-6" />
              <span className="text-lg font-semibold">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </span>
            </button>
          </div>
        )}

        {/* Document Uploader - For Verification */}
        {showDocumentUploader && user?.id && (
          <DocumentUploader
            userId={user.id}
            onUploadComplete={handleDocumentUploadComplete}
            onClose={() => setShowDocumentUploader(false)}
          />
        )}
        
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={hideNotification}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      </div>
      )}
    </div>
  );
};
