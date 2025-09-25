import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Camera, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { EmailVerification } from './EmailVerification';
import { PhoneVerification } from './PhoneVerification';
// import { FaceRecognitionVerification } from './FaceRecognitionVerification';

interface SecuritySettingsProps {
  userProfile: {
    email: string;
    phone?: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    hasFaceRecognition?: boolean;
  };
  userId: string;
  onVerificationUpdate: (type: 'email' | 'phone' | 'face', verified: boolean) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  userProfile,
  userId,
  onVerificationUpdate
}) => {
  const [activeModal, setActiveModal] = useState<'email' | 'phone' | 'face' | null>(null);
  const [showTwoFactorSettings, setShowTwoFactorSettings] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const handleVerificationComplete = (type: 'email' | 'phone' | 'face', success: boolean, faceDescriptor?: Float32Array) => {
    if (success) {
      onVerificationUpdate(type, true);
      
      // Save face descriptor if it's face recognition
      if (type === 'face' && faceDescriptor) {
        // This would typically be handled by the face recognition component
        console.log('Face recognition set up successfully');
      }
    }
    setActiveModal(null);
  };

  const generateBackupCodes = async () => {
    try {
      const response = await fetch('/api/auth/generate-backup-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();
      if (response.ok) {
        setBackupCodes(result.codes);
        setShowBackupCodes(true);
      }
    } catch (error) {
      console.error('Failed to generate backup codes:', error);
    }
  };

  const toggleTwoFactor = async () => {
    try {
      const response = await fetch('/api/auth/toggle-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, enabled: !twoFactorEnabled })
      });

      if (response.ok) {
        setTwoFactorEnabled(!twoFactorEnabled);
        if (!twoFactorEnabled) {
          await generateBackupCodes();
        }
      }
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
    }
  };

  const getVerificationStatus = (isVerified: boolean) => {
    return isVerified ? (
      <div className="flex items-center space-x-1 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Verified</span>
      </div>
    ) : (
      <div className="flex items-center space-x-1 text-yellow-600">
        <XCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Not Verified</span>
      </div>
    );
  };

  const securityScore = () => {
    let score = 0;
    if (userProfile.isEmailVerified) score += 25;
    if (userProfile.isPhoneVerified) score += 25;
    if (userProfile.hasFaceRecognition) score += 25;
    if (twoFactorEnabled) score += 25;
    return score;
  };

  const getSecurityLevel = (score: number) => {
    if (score >= 75) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 50) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 25) return { level: 'Basic', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Weak', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const currentScore = securityScore();
  const securityLevel = getSecurityLevel(currentScore);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Shield className="h-6 w-6 text-blue-500 mr-3" />
          Security Settings
        </h3>
        <div className={`px-4 py-2 rounded-full ${securityLevel.bg}`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-current rounded-full" />
            <span className={`text-sm font-semibold ${securityLevel.color}`}>
              {securityLevel.level} ({currentScore}%)
            </span>
          </div>
        </div>
      </div>

      {/* Security Score Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Security Score</span>
          <span className="text-sm text-gray-600">{currentScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              currentScore >= 75 ? 'bg-green-500' :
              currentScore >= 50 ? 'bg-blue-500' :
              currentScore >= 25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${currentScore}%` }}
          />
        </div>
      </div>

      {/* Verification Methods */}
      <div className="space-y-4 mb-8">
        {/* Email Verification */}
        <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Email Verification</h4>
              <p className="text-sm text-gray-600">{userProfile.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getVerificationStatus(userProfile.isEmailVerified)}
            {!userProfile.isEmailVerified && (
              <button
                onClick={() => setActiveModal('email')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Verify
              </button>
            )}
          </div>
        </div>

        {/* Phone Verification */}
        <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Phone Verification</h4>
              <p className="text-sm text-gray-600">
                {userProfile.phone || 'No phone number added'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {userProfile.phone && getVerificationStatus(userProfile.isPhoneVerified)}
            {userProfile.phone && !userProfile.isPhoneVerified && (
              <button
                onClick={() => setActiveModal('phone')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                Verify
              </button>
            )}
            {!userProfile.phone && (
              <span className="text-sm text-gray-500">Add phone number in profile</span>
            )}
          </div>
        </div>

        {/* Face Recognition */}
        <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Camera className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Face Recognition</h4>
              <p className="text-sm text-gray-600">Secure login with your face</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getVerificationStatus(userProfile.hasFaceRecognition || false)}
            <button
              onClick={() => setActiveModal('face')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
            >
              {userProfile.hasFaceRecognition ? 'Update' : 'Set Up'}
            </button>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Lock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
          </div>
          <button
            onClick={toggleTwoFactor}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="space-y-3">
            <button
              onClick={() => setShowTwoFactorSettings(!showTwoFactorSettings)}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showTwoFactorSettings ? 'Hide' : 'Show'} 2FA Settings
            </button>

            {showTwoFactorSettings && (
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-blue-900">Backup Codes</h5>
                  <button
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                    className="p-1 text-blue-600 hover:text-blue-700"
                  >
                    {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {showBackupCodes && backupCodes.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="bg-white p-2 rounded font-mono text-sm text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={generateBackupCodes}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Generate New Codes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security Recommendations */}
      {currentScore < 100 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h5 className="font-semibold text-yellow-800 mb-2">Security Recommendations</h5>
          <ul className="text-sm text-yellow-700 space-y-1">
            {!userProfile.isEmailVerified && <li>• Verify your email address</li>}
            {!userProfile.isPhoneVerified && userProfile.phone && <li>• Verify your phone number</li>}
            {!userProfile.hasFaceRecognition && <li>• Set up face recognition for secure login</li>}
            {!twoFactorEnabled && <li>• Enable two-factor authentication</li>}
          </ul>
        </div>
      )}

      {/* Modals */}
      {activeModal === 'email' && (
        <EmailVerification
          email={userProfile.email}
          userId={userId}
          isVerified={userProfile.isEmailVerified}
          onVerificationComplete={(success) => handleVerificationComplete('email', success)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'phone' && userProfile.phone && (
        <PhoneVerification
          phone={userProfile.phone}
          userId={userId}
          isVerified={userProfile.isPhoneVerified}
          onVerificationComplete={(success) => handleVerificationComplete('phone', success)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Face Recognition Modal - Commented out until face-api.js is installed */}
      {/* {activeModal === 'face' && (
        <FaceRecognitionVerification
          userId={userId}
          mode={userProfile.hasFaceRecognition ? 'verification' : 'registration'}
          onVerificationComplete={(success, descriptor) => handleVerificationComplete('face', success, descriptor)}
          onClose={() => setActiveModal(null)}
        />
      )} */}
    </div>
  );
};
